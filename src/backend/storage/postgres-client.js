/**
 * CraftEgon CCS - Safe Local PostgreSQL Client
 * Executes parameterized queries, migrations, and session-scoped RLS transactions
 * Pure Node.js built-ins. Zero external npm dependencies.
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_PSQL_PATH = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

function findPsqlPath() {
  if (fs.existsSync(DEFAULT_PSQL_PATH)) {
    return DEFAULT_PSQL_PATH;
  }
  return 'psql';
}

function getPostgresCredentials() {
  return {
    host: process.env.PGHOST || '127.0.0.1',
    port: process.env.PGPORT || '5432',
    user: process.env.PGUSER || 'postgres',
    database: process.env.PGDATABASE || 'craftegon_ccs_dev',
    password: process.env.PGPASSWORD || ''
  };
}

class PostgresClient {
  constructor(credentials = {}) {
    const defaultCreds = getPostgresCredentials();
    this.host = credentials.host || defaultCreds.host;
    this.port = credentials.port || defaultCreds.port;
    this.user = credentials.user || defaultCreds.user;
    this.database = credentials.database || defaultCreds.database;
    this.password = credentials.password !== undefined ? credentials.password : defaultCreds.password;
    this.psqlPath = findPsqlPath();
  }

  getEnv() {
    return Object.assign({}, process.env, {
      PGPASSWORD: this.password,
      PGHOST: this.host,
      PGPORT: String(this.port),
      PGUSER: this.user
    });
  }

  testConnection(targetDb = null) {
    const db = targetDb || this.database || 'postgres';
    try {
      const args = [
        '-U', this.user,
        '-h', this.host,
        '-p', String(this.port),
        '-d', db,
        '-w', // Never prompt for password
        '-c', 'SELECT 1 AS connected;'
      ];
      execFileSync(this.psqlPath, args, {
        env: this.getEnv(),
        stdio: ['ignore', 'pipe', 'pipe']
      });
      return { ok: true };
    } catch (err) {
      const msg = err.stderr ? err.stderr.toString().trim() : err.message;
      return { ok: false, error: msg };
    }
  }

  executeScript(filePath, targetDb = null) {
    const db = targetDb || this.database;
    if (!fs.existsSync(filePath)) {
      throw new Error(`MIGRATION_FILE_NOT_FOUND: ${filePath}`);
    }

    const args = [
      '-U', this.user,
      '-h', this.host,
      '-p', String(this.port),
      '-d', db,
      '-w',
      '-v', 'ON_ERROR_STOP=1',
      '-f', filePath
    ];

    try {
      const output = execFileSync(this.psqlPath, args, {
        env: this.getEnv(),
        stdio: ['ignore', 'pipe', 'pipe']
      });
      return { ok: true, output: output.toString() };
    } catch (err) {
      const msg = err.stderr ? err.stderr.toString().trim() : err.message;
      throw new Error(`POSTGRES_SCRIPT_EXECUTION_FAILED: ${msg}`);
    }
  }

  query(sql, options = {}) {
    const db = options.database || this.database;
    let wrappedSql = sql;

    // Enforce transaction-local session context to prevent tenant leakage across pooled connections
    if (options.userId || options.userRole || options.dbRole) {
      const dbRoleClause = options.dbRole
        ? `SET LOCAL ROLE ${options.dbRole.replace(/[^a-zA-Z0-9_]/g, '')};`
        : '';
      const userClause = options.userId
        ? `SET LOCAL app.current_user_id = '${options.userId.replace(/'/g, "''")}';`
        : `SET LOCAL app.current_user_id = '';`;
      const roleClause = options.userRole
        ? `SET LOCAL app.current_user_role = '${options.userRole.replace(/'/g, "''")}';`
        : `SET LOCAL app.current_user_role = 'anon';`;

      wrappedSql = `BEGIN; ${dbRoleClause} ${userClause} ${roleClause} ${sql}; COMMIT;`;
    }

    const args = [
      '-U', this.user,
      '-h', this.host,
      '-p', String(this.port),
      '-d', db,
      '-w',
      '-q', // Quiet mode: suppress BEGIN, SET, COMMIT command status lines
      '-v', 'ON_ERROR_STOP=1',
      '-t', // Tuples only
      '-A', // Unaligned output
      '-c', wrappedSql
    ];

    try {
      const output = execFileSync(this.psqlPath, args, {
        env: this.getEnv(),
        stdio: ['ignore', 'pipe', 'pipe']
      });
      return output.toString().trim();
    } catch (err) {
      const msg = err.stderr ? err.stderr.toString().trim() : err.message;
      throw new Error(`POSTGRES_QUERY_FAILED: ${msg}`);
    }
  }

  createDatabase(dbName) {
    if (!dbName || !dbName.endsWith('_test') || dbName === 'postgres' || dbName === 'template1' || dbName === 'craftegon_ccs' || dbName === 'craftegon_ccs_dev') {
      throw new Error(`SAFETY_ERROR: Refusing to create non-test database: '${dbName}'`);
    }
    const cleanDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
    const sql = `CREATE DATABASE ${cleanDb};`;
    return this.query(sql, { database: 'postgres' });
  }

  dropDatabase(dbName) {
    if (!dbName || !dbName.endsWith('_test') || dbName === 'postgres' || dbName === 'template1' || dbName === 'craftegon_ccs' || dbName === 'craftegon_ccs_dev') {
      throw new Error(`SAFETY_ERROR: Refusing to drop non-test database: '${dbName}'`);
    }
    const cleanDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
    const sql = `DROP DATABASE IF EXISTS ${cleanDb} WITH (FORCE);`;
    return this.query(sql, { database: 'postgres' });
  }
}

const postgresClient = new PostgresClient();

module.exports = {
  PostgresClient,
  postgresClient,
  getPostgresCredentials,
  findPsqlPath
};
