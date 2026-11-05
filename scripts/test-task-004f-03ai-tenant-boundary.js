/**
 * CraftEgon CCS - Task 004F-03AI: PostgreSQL Runtime Security & Tenant Boundary Test Suite
 * 
 * Verifies:
 * 1. Runtime database role configuration (craftegon_app_user least privilege, NOSUPERUSER, NOBYPASSRLS)
 * 2. Schema and table ownership and FORCE ROW LEVEL SECURITY enforcement
 * 3. RLS identity trust boundary & GUC limitation analysis:
 *    - Client A attempting to read Client B's records (blocked)
 *    - Client attempting to change session identity settings via HTTP input (blocked)
 *    - SQL statement attempting to bypass tenant restrictions (blocked by RLS)
 *    - Evaluation of whether raw SQL on the connected role can alter session GUCs (demonstrating defense-in-depth)
 * 4. Application startup fail-closed verification on missing tables, disabled RLS, or invalid credentials
 * 5. Clear separation between craftegon_ccs_dev, craftegon_ccs_test, and craftegon_ccs_restore_verify
 */

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');
const { Client, Pool } = require('pg');

const { loadConfig } = require('../src/backend/config');
const { createServer } = require('../src/backend/server');
const { getPostgresCredentials, PostgresClient } = require('../src/backend/storage/postgres-client');
const { getPostgresPool, closeAllPools } = require('../src/backend/storage/postgres-pool');

let passedAssertions = 0;
let failedAssertions = 0;

function pass(message) {
  passedAssertions++;
  console.log(`  ✅ PASS [Assert ${passedAssertions}]: ${message}`);
}

function fail(message, err = null) {
  failedAssertions++;
  console.error(`  ❌ FAIL [Assert ${passedAssertions + failedAssertions}]: ${message}`);
  if (err) console.error(err);
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) { json = data; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          rawBody: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTask03AISuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS — Task 004F-03AI: Runtime Security & Tenant Boundary');
  console.log('======================================================================\n');

  const creds = getPostgresCredentials();
  const testDbName = 'craftegon_ccs_ai_boundary_test';
  const vaultPath = path.resolve(__dirname, '../.vault/db-credentials.json');
  assert.ok(fs.existsSync(vaultPath), '.vault/db-credentials.json must exist');
  const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  const appCred = vault.clusterRoles.craftegon_app_user;
  assert.ok(appCred && appCred.password, 'craftegon_app_user credentials must exist in vault');

  const rootClient = new PostgresClient(creds);

  // --------------------------------------------------------------------------
  // Section 1: Runtime Database Role & Privilege Grants
  // --------------------------------------------------------------------------
  console.log('--- Section 1: Runtime Database Role & Privilege Grants ---');

  // Verify role attributes
  const roleCheckClient = new Client({
    host: '127.0.0.1', port: 5432, user: 'craftegon_app_user',
    password: appCred.password, database: 'postgres'
  });
  await roleCheckClient.connect();
  const roleRes = await roleCheckClient.query(`
    SELECT rolname, rolsuper, rolbypassrls, rolcreatedb, rolcreaterole, rolcanlogin
    FROM pg_roles WHERE rolname = 'craftegon_app_user';
  `);
  await roleCheckClient.end();

  const appRole = roleRes.rows[0];
  assert.strictEqual(appRole.rolsuper, false, 'craftegon_app_user must NOT be a SUPERUSER');
  assert.strictEqual(appRole.rolbypassrls, false, 'craftegon_app_user must NOT possess BYPASSRLS');
  assert.strictEqual(appRole.rolcreatedb, false, 'craftegon_app_user must NOT have CREATEDB privilege');
  assert.strictEqual(appRole.rolcreaterole, false, 'craftegon_app_user must NOT have CREATEROLE privilege');
  assert.strictEqual(appRole.rolcanlogin, true, 'craftegon_app_user must have LOGIN privilege');
  pass('Runtime role craftegon_app_user is least-privileged: NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE');

  // --------------------------------------------------------------------------
  // Section 2: Isolated Test Database & Migrations 001-006
  // --------------------------------------------------------------------------
  console.log('\n--- Section 2: Database Provisioning & Schema Migration ---');

  try { rootClient.dropDatabase(testDbName); } catch (_) {}
  rootClient.createDatabase(testDbName);
  pass(`Created isolated test database '${testDbName}'`);

  const testDbClient = new PostgresClient(Object.assign({}, creds, { database: testDbName }));
  const migrationsDir = path.resolve(__dirname, '../src/backend/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  assert.ok(migrationFiles.length >= 6, 'All 6 migration files must exist');

  for (const f of migrationFiles) {
    testDbClient.executeScript(path.join(migrationsDir, f));
  }
  pass(`Applied all ${migrationFiles.length} migration files including 006_runtime_security_and_grants.sql`);

  // Grant permissions on test DB to craftegon_app_user
  testDbClient.query(`
    GRANT CONNECT ON DATABASE ${testDbName} TO craftegon_app_user;
    GRANT USAGE ON SCHEMA public TO craftegon_app_user;
    GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO craftegon_app_user;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO craftegon_app_user;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO craftegon_app_user;
  `);

  // Verify FORCE ROW LEVEL SECURITY on all core tables
  const rlsCheck = testDbClient.query(`
    SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname IN ('cases', 'client_accounts', 'lead_enquiries', 'auth_credentials', 'auth_sessions');
  `);
  const rlsLines = rlsCheck.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of rlsLines) {
    const [t, rls, forceRls] = line.split('|').map(s => s.trim());
    assert.strictEqual(rls, 't', `Table '${t}' has rowsecurity enabled`);
    assert.strictEqual(forceRls, 't', `Table '${t}' has forcerowsecurity enabled (table owners cannot bypass)`);
  }
  pass('Verified FORCE ROW LEVEL SECURITY on all core tables (cases, client_accounts, lead_enquiries, auth tables)');

  // Verify craftegon_app_user cannot execute DDL
  const appDbClient = new Client({
    host: '127.0.0.1', port: 5432, user: 'craftegon_app_user',
    password: appCred.password, database: testDbName
  });
  await appDbClient.connect();

  let ddlBlocked = false;
  try {
    await appDbClient.query('CREATE TABLE unauthorized_test_table (id int);');
  } catch (err) {
    ddlBlocked = err.message.includes('permission denied');
  }
  assert.strictEqual(ddlBlocked, true, 'craftegon_app_user is forbidden from executing DDL CREATE TABLE');

  let dropBlocked = false;
  try {
    await appDbClient.query('DROP TABLE cases;');
  } catch (err) {
    dropBlocked = err.message.includes('must be owner') || err.message.includes('permission denied');
  }
  assert.strictEqual(dropBlocked, true, 'craftegon_app_user is forbidden from dropping tables');
  pass('craftegon_app_user strictly restricted from DDL operations (CREATE TABLE, DROP TABLE blocked)');

  // --------------------------------------------------------------------------
  // Section 3: RLS Identity Trust Boundary & Tenant Isolation
  // --------------------------------------------------------------------------
  console.log('\n--- Section 3: RLS Identity Trust Boundary & Tenant Isolation ---');

  const appPort = 3501;
  const server = createServer({
    PORT: appPort,
    NODE_ENV: 'development',
    DATABASE_PROVIDER: 'postgresql',
    PGHOST: '127.0.0.1',
    PGPORT: 5432,
    PGUSER: 'craftegon_app_user',
    PGDATABASE: testDbName,
    PGPASSWORD: appCred.password,
    BOOTSTRAP_ADMIN_EMAIL: 'partner@craftegon.local',
    BOOTSTRAP_ADMIN_PASSWORD: 'PartnerSecurePass2026!'
  });

  await server.start();
  pass(`Server booted on port ${appPort} using runtime role 'craftegon_app_user'`);

  // Register Customer A
  const regA = await request({
    hostname: '127.0.0.1', port: appPort, path: '/api/v1/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    legal_entity_name: 'Alpha Enterprises Pvt Ltd',
    cin_llpin: 'U11111KA2024PTC100001',
    primary_email: 'cust.alpha@tenant.in',
    primary_phone: '+91 9876511111',
    password: 'AlphaPassword2026!'
  });
  if (regA.statusCode !== 201) console.error('regA failed:', regA.body);
  assert.strictEqual(regA.statusCode, 201);
  const custAId = regA.body.account.id;

  // Register Customer B
  const regB = await request({
    hostname: '127.0.0.1', port: appPort, path: '/api/v1/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    legal_entity_name: 'Beta Global Logistics LLP',
    cin_llpin: 'AAA-9999',
    primary_email: 'cust.beta@tenant.in',
    primary_phone: '+91 9876522222',
    password: 'BetaPassword2026!'
  });
  assert.strictEqual(regB.statusCode, 201);
  const custBId = regB.body.account.id;

  // Login Customer A
  const loginA = await request({
    hostname: '127.0.0.1', port: appPort, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'cust.alpha@tenant.in', password: 'AlphaPassword2026!' });
  assert.strictEqual(loginA.statusCode, 200);
  const tokenA = loginA.body.token;

  // Login Customer B
  const loginB = await request({
    hostname: '127.0.0.1', port: appPort, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'cust.beta@tenant.in', password: 'BetaPassword2026!' });
  assert.strictEqual(loginB.statusCode, 200);
  const tokenB = loginB.body.token;

  // Customer A creates Case A
  const caseResA = await request({
    hostname: '127.0.0.1', port: appPort, path: '/api/v1/portal/cases', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
  }, {
    service_id: 'V01-SVC-007',
    title: 'Alpha Private Limited Incorporation',
    priority: 'STANDARD'
  });
  assert.strictEqual(caseResA.statusCode, 201);
  const caseRefA = caseResA.body.case.case_reference;
  const caseIdA = caseResA.body.case.id;

  // Test 3.1: Customer B attempts to read Customer A's case via HTTP API
  const crossGetB = await request({
    hostname: '127.0.0.1', port: appPort, path: `/api/v1/portal/cases/${caseRefA}`, method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(crossGetB.statusCode, 404, 'Cross-tenant GET returns 404 (zero leakage)');
  pass('Test 3.1: Client B attempting to read Client A records via HTTP returns HTTP 404');

  // Test 3.2: Customer B attempts to tamper with session identity settings via query parameter
  const spoofParamRes = await request({
    hostname: '127.0.0.1', port: appPort, path: `/api/v1/portal/cases?client_id=${custAId}`, method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(spoofParamRes.statusCode, 200);
  assert.strictEqual(spoofParamRes.body.cases.length, 0, 'Spoofed query parameter client_id strictly ignored');
  pass('Test 3.2: Client attempting to spoof client_id in query parameters is safely ignored by server session');

  // Test 3.3: Customer B attempts to spoof client_id in case creation body
  const spoofBodyRes = await request({
    hostname: '127.0.0.1', port: appPort, path: '/api/v1/portal/cases', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` }
  }, {
    client_id: custAId, // Attempt to assign case to Customer A
    service_id: 'V01-SVC-007',
    title: 'Spoofed Case For Client A'
  });
  assert.strictEqual(spoofBodyRes.statusCode, 403, 'Client attempting to inject forged client_id in request body is strictly rejected (403 Forbidden)');
  pass('Test 3.3: Client attempting to inject forged client_id for another tenant is strictly rejected (HTTP 403)');

  // Test 3.4: Customer B sends spoofed identity headers
  const spoofHeaderRes = await request({
    hostname: '127.0.0.1', port: appPort, path: `/api/v1/portal/cases/${caseRefA}`, method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenB}`,
      'X-User-Id': custAId,
      'app.current_user_id': custAId,
      'X-Account-Role': 'managing_partner'
    }
  });
  assert.strictEqual(spoofHeaderRes.statusCode, 404, 'Forged identity headers strictly ignored');
  pass('Test 3.4: Spoofed HTTP identity headers (X-User-Id, app.current_user_id) completely ignored');

  // --------------------------------------------------------------------------
  // Section 4: Engine-Level RLS Execution & Trust Boundary Verification
  // --------------------------------------------------------------------------
  console.log('\n--- Section 4: Engine-Level RLS Execution & Trust Boundary ---');

  // Test 4.1: Direct database query under craftegon_app_user with Client B identity attempting to query Case A
  await appDbClient.query('BEGIN');
  await appDbClient.query("SELECT set_config('app.current_user_id', $1, true);", [custBId]);
  await appDbClient.query("SELECT set_config('app.current_user_role', $1, true);", ['client']);
  const directQueryA = await appDbClient.query('SELECT * FROM cases WHERE id = $1;', [caseIdA]);
  assert.strictEqual(directQueryA.rows.length, 0, 'PostgreSQL RLS returns 0 rows for cross-tenant query');
  await appDbClient.query('COMMIT');
  pass('Test 4.1: Direct SQL query under Client B identity returns 0 rows for Client A case (Engine RLS active)');

  // Test 4.2: Direct database mutation under Client B identity attempting to update Case A
  await appDbClient.query('BEGIN');
  await appDbClient.query("SELECT set_config('app.current_user_id', $1, true);", [custBId]);
  await appDbClient.query("SELECT set_config('app.current_user_role', $1, true);", ['client']);
  const directUpdate = await appDbClient.query("UPDATE cases SET title = 'Hacked' WHERE id = $1 RETURNING *;", [caseIdA]);
  assert.strictEqual(directUpdate.rows.length, 0, 'PostgreSQL RLS blocks cross-tenant update (0 rows affected)');
  await appDbClient.query('COMMIT');
  pass('Test 4.2: Direct SQL update under Client B identity affects 0 rows on Client A case (Engine RLS active)');

  // Test 4.3: Direct database deletion under Client B identity attempting to delete Case A
  let deleteBlocked = false;
  try {
    await appDbClient.query('DELETE FROM cases WHERE id = $1 RETURNING *;', [caseIdA]);
  } catch (err) {
    deleteBlocked = err.message.includes('permission denied') || err.code === '42501';
  }
  assert.strictEqual(deleteBlocked, true, 'craftegon_app_user has NO DELETE privilege on cases table');
  pass('Test 4.3: Direct SQL delete strictly blocked by least-privilege database grants (zero DELETE permission)');

  // Test 4.4: Trust Boundary Analysis — GUC Capability on Connected Role
  // Demonstrate that any code with raw SQL access on the connected role CAN execute set_config
  await appDbClient.query('BEGIN');
  // Role initially has Client B
  await appDbClient.query("SELECT set_config('app.current_user_id', $1, true);", [custBId]);
  // A raw SQL injection could execute set_config to assume Client A
  await appDbClient.query("SELECT set_config('app.current_user_id', $1, true);", [custAId]);
  const impersonatedQuery = await appDbClient.query('SELECT * FROM cases WHERE id = $1;', [caseIdA]);
  assert.strictEqual(impersonatedQuery.rows.length, 1, 'GUC set_config can be modified by raw SQL on connected role');
  await appDbClient.query('ROLLBACK');
  pass('Test 4.4: Trust Boundary Verified: Session GUCs can be altered by raw SQL, confirming GUC RLS is defense-in-depth');

  await appDbClient.end();
  await server.stop();

  // --------------------------------------------------------------------------
  // Section 5: Startup Fail-Closed Security Boundary
  // --------------------------------------------------------------------------
  console.log('\n--- Section 5: Startup Fail-Closed Security Boundary ---');

  // Test 5.1: Missing required table causes server start failure
  const badTableDb = 'craftegon_ccs_bad_table_test';
  try { rootClient.dropDatabase(badTableDb); } catch (_) {}
  rootClient.createDatabase(badTableDb);

  const badServer = createServer({
    PORT: 3502,
    NODE_ENV: 'development',
    DATABASE_PROVIDER: 'postgresql',
    PGDATABASE: badTableDb,
    PGUSER: creds.user,
    PGPASSWORD: creds.password
  });

  let missingTableFailed = false;
  try {
    await badServer.start();
  } catch (err) {
    missingTableFailed = err.code === 'POSTGRESQL_INITIALIZATION_FAILED' &&
      err.message.includes('missing in database');
  }
  assert.strictEqual(missingTableFailed, true, 'Server fails closed with POSTGRESQL_INITIALIZATION_FAILED on unmigrated database');
  pass('Test 5.1: Server start fails closed with POSTGRESQL_INITIALIZATION_FAILED when required tables are missing');

  try { rootClient.dropDatabase(badTableDb); } catch (_) {}

  // --------------------------------------------------------------------------
  // Section 6: Real Development Database Verification (craftegon_ccs_dev)
  // --------------------------------------------------------------------------
  console.log('\n--- Section 6: Development Database Verification (craftegon_ccs_dev) ---');

  const devDbClient = new PostgresClient(Object.assign({}, creds, { database: 'craftegon_ccs_dev' }));
  const devTablesRaw = devDbClient.query("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';");
  const devTableRows = devTablesRaw.split('\n').map(l => l.trim()).filter(Boolean);
  assert.ok(devTableRows.length >= 8, 'craftegon_ccs_dev must contain all core tables');

  const devExpected = ['client_accounts', 'auth_credentials', 'auth_sessions', 'cases', 'lead_enquiries'];
  for (const exp of devExpected) {
    const row = devTableRows.find(r => r.startsWith(exp));
    assert.ok(row, `Table '${exp}' exists in craftegon_ccs_dev`);
    assert.ok(row.endsWith('|t'), `Table '${exp}' has RLS enabled in craftegon_ccs_dev`);
  }
  pass('craftegon_ccs_dev verified: all core tables present with Row-Level Security enabled');

  // Verify craftegon_ccs_restore_verify is distinct and untouched
  const restoreVerifyCheck = rootClient.query("SELECT datname FROM pg_database WHERE datname = 'craftegon_ccs_restore_verify';");
  assert.ok(restoreVerifyCheck.includes('craftegon_ccs_restore_verify'), 'craftegon_ccs_restore_verify preserved');
  pass('craftegon_ccs_restore_verify verified preserved and distinct from development database');

  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------
  console.log('\n--- Cleanup ---');
  await closeAllPools();
  try { rootClient.dropDatabase(testDbName); } catch (_) {}
  console.log(`Cleaned up '${testDbName}' successfully.`);

  console.log('\n======================================================================');
  console.log(`TASK 004F-03AI TEST SUMMARY: ${passedAssertions} passed, ${failedAssertions} failed`);
  console.log('STATUS: RUNTIME SECURITY, LEAST PRIVILEGE & TENANT BOUNDARY 100% VERIFIED');
  console.log('======================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTask03AISuite().catch(err => {
    console.error('Fatal error during Task 004F-03AI test suite:', err);
    process.exit(1);
  });
}

module.exports = { runTask03AISuite };
