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
  if (process.env.PGPASSWORD) return process.env.PGPASSWORD;

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
    this.user = options.user || creds.user || 'postgres';
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
        client.release();
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
      client.release();
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
  const key = `${options.host || '127.0.0.1'}:${options.port || 5432}:${db}`;
  if (!poolInstances.has(key)) {
    poolInstances.set(key, new PostgresPool(options));
  }
  return poolInstances.get(key);
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
  closeAllPools,
  resolvePassword
};
