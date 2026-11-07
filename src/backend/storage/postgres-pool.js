/**
 * CraftEgon CCS - Asynchronous PostgreSQL Connection Pool
 * Built on node-postgres (pg.Pool) with proper lifecycle management,
 * connection pooling, health checks, fail-fast timeouts, parameterized queries,
 * and transaction-isolated session settings for Row-Level Security.
 */

const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
const { getPostgresCredentials } = require('./postgres-client');

function resolvePassword(user, host, port, database, configuredPassword) {
  if (configuredPassword) return configuredPassword;

  // 1. Role-specific environment variable (e.g. PGPASSWORD_CRAFTEGON_APP_USER)
  const roleEnvKey = `PGPASSWORD_${String(user || '').toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
  if (process.env[roleEnvKey]) return process.env[roleEnvKey];

  if (process.env.PGPASSWORD && (!user || user === 'postgres')) return process.env.PGPASSWORD;

  // 2. Local secure credential vault (.vault/db-credentials.json)
  const vaultPath = path.resolve(__dirname, '../../../.vault/db-credentials.json');
  if (fs.existsSync(vaultPath)) {
    try {
      const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
      if (vault.clusterRoles && vault.clusterRoles[user] && vault.clusterRoles[user].password) {
        return vault.clusterRoles[user].password;
      }
    } catch (_) {}
  }

  const candidates = [];
  if (process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, 'postgresql', 'pgpass.conf'));
  }
  if (process.env.USERPROFILE) {
    candidates.push(path.join(process.env.USERPROFILE, 'pgpass.conf'));
  }
  if (process.env.HOME) {
    candidates.push(path.join(process.env.HOME, '.pgpass'));
  }

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      try {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const parts = trimmed.split(':');
          if (parts.length >= 5) {
            const [pHost, pPort, pDb, pUser, pPass] = parts;
            if ((pHost === '*' || pHost === host) &&
                (pPort === '*' || String(pPort) === String(port)) &&
                (pDb === '*' || pDb === database) &&
                (pUser === '*' || pUser === user)) {
              return pPass;
            }
          }
        }
      } catch (_) {}
    }
  }

  return '';
}

class PostgresPool {
  constructor(options = {}) {
    const creds = getPostgresCredentials();
    this.host = options.host || creds.host || '127.0.0.1';
    this.port = parseInt(options.port || creds.port || '5432', 10);
    this.user = options.user || process.env.PG_APP_USER || 'craftegon_app_user';
    this.database = options.database || creds.database || 'craftegon_ccs_dev';
    this.password = resolvePassword(
      this.user,
      this.host,
      this.port,
      this.database,
      options.password !== undefined ? options.password : creds.password
    );

    this.max = parseInt(options.max || process.env.PG_POOL_MAX || '10', 10);
    this.idleTimeoutMillis = parseInt(options.idleTimeoutMillis || '30000', 10);
    this.connectionTimeoutMillis = parseInt(options.connectionTimeoutMillis || '5000', 10);

    this.isPool = true;
    this.pool = new Pool({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: this.database,
      max: this.max,
      idleTimeoutMillis: this.idleTimeoutMillis,
      connectionTimeoutMillis: this.connectionTimeoutMillis
    });

    this.pool.on('error', (err) => {
      if (err.code === 'ECONNRESET' || err.message?.includes('closed') || err.message?.includes('terminating connection') || err.message?.includes('connection reset')) {
        return;
      }
      console.error('[PostgresPool] Unexpected idle client error:', err.message);
    });
  }

  async query(text, paramsOrOptions = [], maybeOptions = {}) {
    let params = [];
    let context = {};

    if (Array.isArray(paramsOrOptions)) {
      params = paramsOrOptions;
      context = maybeOptions || {};
    } else if (paramsOrOptions && typeof paramsOrOptions === 'object') {
      context = paramsOrOptions;
      params = [];
    }

    // If context requires RLS session setting (userId, role, dbRole), execute in dedicated checkout with transaction
    if (context.userId || context.role || context.dbRole) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        if (context.dbRole) {
          const cleanRole = context.dbRole.replace(/[^a-zA-Z0-9_]/g, '');
          await client.query(`SET LOCAL ROLE ${cleanRole}`);
        }
        const userId = context.userId || '';
        await client.query("SELECT set_config('app.current_user_id', $1, true);", [userId]);
        const role = context.role || 'anon';
        await client.query("SELECT set_config('app.current_user_role', $1, true);", [role]);

        const result = await client.query(text, params);
        await client.query('COMMIT');
        return result.rows;
      } catch (err) {
        try {
          await client.query('ROLLBACK');
        } catch (_) {}
        throw err;
      } finally {
        try {
          await client.query('RESET ALL;');
          client.release();
        } catch (resetErr) {
          try {
            client.release(resetErr || true);
          } catch (_) {
            try { client.destroy(); } catch (_) {}
          }
        }
      }
    }

    // Direct pooled query for standard operations
    const result = await this.pool.query(text, params);
    return result.rows;
  }

  async withTransaction(fn, context = {}) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      if (context.dbRole) {
        const cleanRole = context.dbRole.replace(/[^a-zA-Z0-9_]/g, '');
        await client.query(`SET LOCAL ROLE ${cleanRole}`);
      }
      if (context.userId) {
        await client.query("SELECT set_config('app.current_user_id', $1, true);", [context.userId]);
      }
      if (context.role) {
        await client.query("SELECT set_config('app.current_user_role', $1, true);", [context.role]);
      }

      const res = await fn(client);
      await client.query('COMMIT');
      return res;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {}
      throw err;
    } finally {
      try {
        await client.query('RESET ALL;');
        client.release();
      } catch (resetErr) {
        try {
          client.release(resetErr || true);
        } catch (_) {
          try { client.destroy(); } catch (_) {}
        }
      }
    }
  }

  async testConnection() {
    try {
      const res = await this.pool.query('SELECT 1 AS connected;');
      return { ok: true, connected: res.rows.length > 0 };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async executeScript(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`MIGRATION_FILE_NOT_FOUND: ${filePath}`);
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    const client = await this.pool.connect();
    try {
      await client.query(sql);
      return { ok: true };
    } finally {
      client.release();
    }
  }

  async executeMigrationDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`MIGRATIONS_DIR_NOT_FOUND: ${dirPath}`);
    }
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      await this.executeScript(path.join(dirPath, file));
    }
    return { ok: true, executed: files };
  }

  async createDatabase(dbName) {
    if (!dbName || !dbName.endsWith('_test') || dbName === 'postgres' || dbName === 'template1' || dbName === 'craftegon_ccs' || dbName === 'craftegon_ccs_dev') {
      throw new Error(`SAFETY_ERROR: Refusing to create non-test database: '${dbName}'`);
    }
    const cleanDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
    const rootPool = new Pool({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: 'postgres',
      connectionTimeoutMillis: this.connectionTimeoutMillis
    });
    try {
      await rootPool.query(`CREATE DATABASE ${cleanDb};`);
      return { ok: true };
    } finally {
      await rootPool.end();
    }
  }

  async dropDatabase(dbName) {
    if (!dbName || !dbName.endsWith('_test') || dbName === 'postgres' || dbName === 'template1' || dbName === 'craftegon_ccs' || dbName === 'craftegon_ccs_dev') {
      throw new Error(`SAFETY_ERROR: Refusing to drop non-test database: '${dbName}'`);
    }
    const cleanDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
    const rootPool = new Pool({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: 'postgres',
      connectionTimeoutMillis: this.connectionTimeoutMillis
    });
    try {
      await rootPool.query(`DROP DATABASE IF EXISTS ${cleanDb} WITH (FORCE);`);
      return { ok: true };
    } finally {
      await rootPool.end();
    }
  }

  async end() {
    return this.pool.end();
  }
}

const poolInstances = new Map();

function getPostgresPool(options = {}) {
  const db = options.database || process.env.PGDATABASE || 'craftegon_ccs_dev';
  const user = options.user || process.env.PG_APP_USER || 'craftegon_app_user';
  const host = options.host || process.env.PGHOST || '127.0.0.1';
  const port = options.port || process.env.PGPORT || 5432;
  const ssl = options.ssl ? (typeof options.ssl === 'object' ? JSON.stringify(options.ssl) : String(options.ssl)) : 'none';
  const key = `${user}@${host}:${port}/${db}?ssl=${ssl}`;
  if (!poolInstances.has(key)) {
    const opts = Object.assign({}, options, { user, database: db, host, port });
    poolInstances.set(key, new PostgresPool(opts));
  }
  return poolInstances.get(key);
}

function getAppPool(options = {}) {
  return getPostgresPool(Object.assign({}, options, {
    user: options.user || process.env.PG_APP_USER || 'craftegon_app_user',
    max: options.max || parseInt(process.env.PG_APP_POOL_MAX || '15', 10)
  }));
}

function getAuthPool(options = {}) {
  return getPostgresPool(Object.assign({}, options, {
    user: options.user || process.env.PG_AUTH_USER || 'craftegon_auth_user',
    max: options.max || parseInt(process.env.PG_AUTH_POOL_MAX || '5', 10)
  }));
}

function getGovPool(options = {}) {
  return getPostgresPool(Object.assign({}, options, {
    user: options.user || process.env.PG_GOV_USER || 'craftegon_gov_user',
    max: options.max || parseInt(process.env.PG_GOV_POOL_MAX || '3', 10)
  }));
}

async function closeAllPools() {
  for (const pool of poolInstances.values()) {
    try {
      await pool.end();
    } catch (_) {}
  }
  poolInstances.clear();
}

module.exports = {
  PostgresPool,
  getPostgresPool,
  getAppPool,
  getAuthPool,
  getGovPool,
  closeAllPools,
  resolvePassword
};
