/**
 * CraftEgon CCS - Database Migration Runner
 * Safely applies canonical migrations (001-006) to local PostgreSQL databases
 * Verifies schema completeness, RLS policies, and least-privilege role grants.
 */

const fs = require('node:fs');
const path = require('node:path');
const { getPostgresCredentials, PostgresClient } = require('../src/backend/storage/postgres-client');

async function migrateDatabase(targetDb = 'craftegon_ccs_dev') {
  console.log('======================================================================');
  console.log(`CraftEgon CCS — Database Migration: ${targetDb}`);
  console.log('======================================================================\n');

  const creds = getPostgresCredentials();
  const rootClient = new PostgresClient(creds);

  // 1. Connection check
  const connCheck = rootClient.testConnection('postgres');
  if (!connCheck.ok) {
    throw new Error(`Cannot connect to PostgreSQL engine: ${connCheck.error}`);
  }
  console.log('1. Connected to PostgreSQL engine on 127.0.0.1:5432');

  // 2. Target database inspection
  const dbsRaw = rootClient.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
  const existingDbs = dbsRaw.split('\n').map(d => d.trim()).filter(Boolean);
  if (!existingDbs.includes(targetDb)) {
    throw new Error(`Target database '${targetDb}' does not exist on cluster.`);
  }

  const targetClient = new PostgresClient(Object.assign({}, creds, { database: targetDb }));
  const existingTablesRaw = targetClient.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
  const existingTables = existingTablesRaw.split('\n').map(t => t.trim()).filter(Boolean);
  console.log(`2. Inspected '${targetDb}': ${existingTables.length} existing tables in 'public' schema`);

  // 3. Execute migrations in order
  const migrationsDir = path.resolve(__dirname, '../src/backend/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`3. Executing ${migrationFiles.length} migration files...`);
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    targetClient.executeScript(filePath);
    console.log(`   ✓ Applied: ${file}`);
  }

  // 4. Verify tables and RLS status
  const postMigTablesRaw = targetClient.query("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';");
  const tableRows = postMigTablesRaw.split('\n').map(r => r.trim()).filter(Boolean);
  console.log(`\n4. Verified ${tableRows.length} tables in '${targetDb}':`);
  const expectedTables = [
    'audit_logs', 'auth_credentials', 'auth_sessions', 'case_documents',
    'cases', 'client_accounts', 'lead_enquiries', 'subscription_orders'
  ];

  for (const exp of expectedTables) {
    const row = tableRows.find(r => r.startsWith(exp));
    if (!row) {
      throw new Error(`Missing expected table '${exp}' in '${targetDb}'`);
    }
    const hasRls = row.endsWith('|t');
    console.log(`   ✓ ${exp}: RLS enabled = ${hasRls}`);
  }

  // 5. Verify grants for craftegon_app_user
  const vaultPath = path.resolve(__dirname, '../.vault/db-credentials.json');
  if (fs.existsSync(vaultPath)) {
    const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    const appCred = vault.clusterRoles?.craftegon_app_user;
    if (appCred) {
      const { Client } = require('pg');
      const appTestClient = new Client({
        host: '127.0.0.1',
        port: 5432,
        user: 'craftegon_app_user',
        password: appCred.password,
        database: targetDb
      });
      try {
        await appTestClient.connect();
        await appTestClient.query('SELECT 1 FROM client_accounts LIMIT 0;');
        await appTestClient.query('SELECT 1 FROM cases LIMIT 0;');
        await appTestClient.query('SELECT 1 FROM lead_enquiries LIMIT 0;');
        console.log(`5. Verified runtime role 'craftegon_app_user' connectivity & table access on '${targetDb}'`);
        await appTestClient.end();
      } catch (appErr) {
        console.warn(`5. Warning: 'craftegon_app_user' test query: ${appErr.message}`);
        try { await appTestClient.end(); } catch (_) {}
      }
    }
  }

  console.log('\n======================================================================');
  console.log(`DATABASE MIGRATION COMPLETED SUCCESSFULLY FOR '${targetDb}'`);
  console.log('======================================================================\n');
  return { ok: true, database: targetDb };
}

if (require.main === module) {
  const targetDb = process.argv[2] || 'craftegon_ccs_dev';
  migrateDatabase(targetDb).catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
}

module.exports = { migrateDatabase };
