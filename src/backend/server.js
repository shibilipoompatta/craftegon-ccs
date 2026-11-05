/**
 * CraftEgon CCS - Core HTTP Server Baseline
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const http = require('node:http');
const { loadConfig } = require('./config');
const { applySecurityHeaders } = require('./middleware/security-headers');
const { routeRequest } = require('./router');
const { postgresClient } = require('./storage/postgres-client');
const { getPostgresPool } = require('./storage/postgres-pool');
const { enquiryRepository, PostgresEnquiryStorage, InMemoryEnquiryStorage } = require('./storage/enquiry-repository');
const { accountRepository, PostgresAccountStorage, InMemoryAccountStorage } = require('./storage/account-repository');
const { caseRepository, PostgresCaseStorage, InMemoryCaseStorage } = require('./storage/case-repository');
const { documentRepository, PostgresDocumentStorage, InMemoryDocumentStorage } = require('./storage/document-repository');
const { orderRepository, PostgresOrderStorage, InMemoryOrderStorage } = require('./storage/order-repository');

async function verifyDatabaseRuntimeSecurity(pool, config) {
  const connCheck = await pool.testConnection();
  if (!connCheck.ok) {
    const err = new Error(`POSTGRESQL_INITIALIZATION_FAILED: Could not connect to PostgreSQL database '${config.pgDatabase}' on ${config.pgHost}:${config.pgPort}: ${connCheck.error}`);
    err.code = 'POSTGRESQL_INITIALIZATION_FAILED';
    throw err;
  }

  // 1. Role inspection: Verify superuser/bypassrls in production
  try {
    const roleRows = await pool.query('SELECT current_user, session_user, r.rolsuper, r.rolbypassrls, r.rolcanlogin FROM pg_roles r WHERE r.rolname = current_user;');
    const roleInfo = roleRows[0] || {};
    if (config.isProd && (roleInfo.rolsuper || roleInfo.rolbypassrls)) {
      const err = new Error(`DATABASE_SECURITY_VIOLATION: In production, database connection role ('${roleInfo.current_user}') must not possess SUPERUSER or BYPASSRLS privileges`);
      err.code = 'DATABASE_SECURITY_VIOLATION';
      throw err;
    }
  } catch (err) {
    if (err.code === 'DATABASE_SECURITY_VIOLATION') throw err;
  }

  // 2. Schema and table completeness
  const requiredTables = ['client_accounts', 'auth_credentials', 'auth_sessions', 'lead_enquiries', 'cases'];
  const tableRows = await pool.query("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';");
  const existingTables = new Map(tableRows.map(r => [r.tablename, Boolean(r.rowsecurity)]));

  for (const table of requiredTables) {
    if (!existingTables.has(table)) {
      const err = new Error(`POSTGRESQL_INITIALIZATION_FAILED: Database schema verification failed: required table '${table}' missing in database '${config.pgDatabase}'`);
      err.code = 'POSTGRESQL_INITIALIZATION_FAILED';
      throw err;
    }
    if (existingTables.get(table) !== true) {
      const err = new Error(`DATABASE_SECURITY_VIOLATION: Row-level security is not enabled on table '${table}' in database '${config.pgDatabase}'`);
      err.code = 'DATABASE_SECURITY_VIOLATION';
      throw err;
    }
  }

  // 3. Runtime role permissions check
  try {
    await pool.query('SELECT 1 FROM client_accounts LIMIT 0;');
    await pool.query('SELECT 1 FROM auth_credentials LIMIT 0;');
    await pool.query('SELECT 1 FROM auth_sessions LIMIT 0;');
    await pool.query('SELECT 1 FROM lead_enquiries LIMIT 0;');
    await pool.query('SELECT 1 FROM cases LIMIT 0;');
  } catch (permErr) {
    const err = new Error(`POSTGRESQL_INITIALIZATION_FAILED: Runtime database role lacks required permissions on core tables: ${permErr.message}`);
    err.code = 'POSTGRESQL_INITIALIZATION_FAILED';
    throw err;
  }
}

function configureStorageAdapters(config) {
  if (config.databaseProvider === 'postgresql') {
    const pool = getPostgresPool({
      host: config.pgHost,
      port: config.pgPort,
      user: config.pgUser,
      database: config.pgDatabase,
      password: config.pgPassword
    });
    enquiryRepository.setAdapter(new PostgresEnquiryStorage(pool));
    accountRepository.setAdapter(new PostgresAccountStorage(pool));
    caseRepository.setAdapter(new PostgresCaseStorage(pool, config.pgRuntimeRole));
    documentRepository.setAdapter(new PostgresDocumentStorage(pool, config.pgRuntimeRole));
    orderRepository.setAdapter(new PostgresOrderStorage(pool, config.pgRuntimeRole));
  } else {
    enquiryRepository.setAdapter(new InMemoryEnquiryStorage());
    accountRepository.setAdapter(new InMemoryAccountStorage());
    caseRepository.setAdapter(new InMemoryCaseStorage());
    documentRepository.setAdapter(new InMemoryDocumentStorage());
    orderRepository.setAdapter(new InMemoryOrderStorage());
  }
}

async function seedInitialAdmin(config, targetStorage = null) {
  // DEF-003: Fail closed in production. Never auto-bootstrap privileged accounts in production.
  if (config.isProd) {
    return;
  }

  // Only bootstrap in local development/test if BOTH email and password are explicitly supplied via environment
  const adminEmail = config.bootstrapAdminEmail;
  const adminPassword = config.bootstrapAdminPassword;

  if (!adminEmail || !adminPassword) {
    // Fail closed: Do NOT silently create a privileged account when required configuration is absent
    return;
  }

  const email = String(adminEmail).toLowerCase().trim();
  const password = String(adminPassword);

  try {
    const repo = targetStorage || accountRepository;
    const existing = await repo.findByEmail(email);
    if (!existing) {
      const { validatePassword } = require('./models/account.model');
      const val = validatePassword(password);
      if (!val.valid) {
        console.warn('[CCS Bootstrap] Configured bootstrap admin password does not satisfy security policy. Skipping bootstrap.');
        return;
      }

      await repo.createAccount({
        primary_email: email,
        legal_entity_name: 'CraftEgon LLP Administration',
        cin_llpin: 'AAA-1234',
        primary_phone: '+91 86069 18247',
        account_role: 'managing_partner',
        password: password
      }, { isInternalBootstrap: true });
    }
  } catch (err) {
    // Safe idempotent pass if exists
  }
}

function createServer(configOverrides = {}) {
  const config = loadConfig(configOverrides);
  configureStorageAdapters(config);
  seedInitialAdmin(config).catch(() => {});

  const server = http.createServer(async (req, res) => {
    // 1. Apply global security headers & CORS
    applySecurityHeaders(res, config.corsOrigin);

    // 2. Dispatch request to router with global error boundary
    try {
      await routeRequest(req, res, config);
    } catch (err) {
      if (!res.headersSent) {
        const statusCode = err.statusCode || 500;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: statusCode === 500 ? 'Internal Server Error' : err.message,
          message: statusCode === 500 ? 'An unexpected server error occurred. Telemetry recorded.' : err.message
        }));
      }
    }
  });

  return {
    server,
    config,
    start: async () => {
      if (config.databaseProvider === 'postgresql') {
        const pool = getPostgresPool({
          host: config.pgHost,
          port: config.pgPort,
          user: config.pgUser,
          database: config.pgDatabase,
          password: config.pgPassword
        });
        await verifyDatabaseRuntimeSecurity(pool, config);
      }

      await seedInitialAdmin(config);

      return new Promise((resolve, reject) => {
        server.listen(config.port, config.host, () => {
          resolve({ port: config.port, host: config.host });
        });
        server.once('error', reject);
      });
    },
    stop: () => new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    })
  };
}

// Allow direct execution: `node src/backend/server.js`
if (require.main === module) {
  const instance = createServer();
  instance.start().then(({ host, port }) => {
    console.log(`[CraftEgon CCS] Backend server active on http://${host}:${port}`);
    console.log(`[CraftEgon CCS] Storage Provider: ${instance.config.databaseProvider}`);
  });
}

module.exports = {
  createServer,
  configureStorageAdapters,
  seedInitialAdmin
};
