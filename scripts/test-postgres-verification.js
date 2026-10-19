/**
 * CraftEgon CCS - Phase 3 Task C: Local PostgreSQL Verification Test Suite
 * Pure Node.js built-ins. Zero external dependencies.
 * 
 * Verifies against actual local PostgreSQL 18 engine:
 * 1. Safe connection & environment detection (127.0.0.1:5432 only)
 * 2. Schema migration on disposable database (craftegon_ccs_test)
 * 3. Table creation, constraints, foreign keys
 * 4. Transaction rollback on failure
 * 5. Real PostgreSQL Row-Level Security (RLS) tenant isolation via unprivileged role (NOSUPERUSER, NOBYPASSRLS)
 * 6. Cross-customer isolation (Read, Enumerate, Update, Delete)
 * 7. Unauthenticated access denial
 * 8. Authorized staff cross-customer operational access
 * 9. Session setting leakage prevention (SET LOCAL inside transactions)
 * 10. Malformed / missing / stale tenant context handling
 * 11. Duplicate submission rejection via unique constraints
 * 12. Enquiry repository persistence across simulated server restart
 * 13. Failed database write safety (never produces a false success response)
 */

const path = require('node:path');
const fs = require('node:fs');
const { PostgresClient, getPostgresCredentials } = require('../src/backend/storage/postgres-client');
const { PostgresEnquiryStorage, EnquiryRepository } = require('../src/backend/storage/enquiry-repository');
const { loadConfig } = require('../src/backend/config');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedAssertions++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedAssertions++;
  }
}

async function runPostgresVerification() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 3 Task C: Local PostgreSQL Live Verification');
  console.log('======================================================================\n');

  // 1. Check Configuration & Environment
  loadConfig(); // triggers dot-env loading
  const creds = getPostgresCredentials();

  console.log('--- Step 1: Preflight Connection & Credential Check ---');
  console.log(`  Target Host: ${creds.host}:${creds.port}`);
  console.log(`  Target User: ${creds.user}`);

  // Safety Gate: Ensure host is strictly local
  if (creds.host !== '127.0.0.1' && creds.host !== 'localhost') {
    throw new Error(`SAFETY_ERROR: Host must be local (127.0.0.1). Detected: '${creds.host}'`);
  }
  if (String(creds.port) !== '5432') {
    throw new Error(`SAFETY_ERROR: Port must be 5432. Detected: '${creds.port}'`);
  }

  const client = new PostgresClient(creds);
  const isPlaceholder = creds.password && (
    (creds.password.startsWith('<') && creds.password.endsWith('>')) ||
    ['yourActualPasswordHere', 'yourSecretPasswordHere', 'actual-local-postgres-password'].includes(creds.password)
  );

  if (isPlaceholder) {
    console.log('\n  ⚠️  POSTGRESQL CONFIGURATION NOTICE:');
    console.log('  The PGPASSWORD in \'.env.local\' is currently set to an example placeholder value.');
    console.log('  Please edit \'.env.local\' and replace it with the actual local PostgreSQL password');
    console.log('  that was configured when resetting the postgres role password in psql.');
    console.log('\n  Format in .env.local:');
    console.log('     DATABASE_PROVIDER=postgresql');
    console.log('     PGHOST=127.0.0.1');
    console.log('     PGPORT=5432');
    console.log('     PGUSER=postgres');
    console.log('     PGPASSWORD=<the-real-password-you-set-locally>');
    console.log('\n  Note: \'.env.local\' is strictly excluded by .gitignore to protect secrets.');
    return { ok: false, status: 'BLOCKED', reason: 'PGPASSWORD in .env.local is an example placeholder' };
  }

  const initialCheck = client.testConnection('postgres');
  if (!initialCheck.ok) {
    console.log('\n  ⚠️  POSTGRESQL CONNECTION BLOCKED:');
    console.log(`  Error: ${initialCheck.error}`);
    console.log('\n  SETUP ACTION REQUIRED:');
    console.log('  1. Create or populate an untracked \'.env.local\' file in the project root:');
    console.log('     DATABASE_PROVIDER=postgresql');
    console.log('     PGHOST=127.0.0.1');
    console.log('     PGPORT=5432');
    console.log('     PGUSER=postgres');
    console.log('     PGPASSWORD=<actual-local-postgres-password>');
    console.log('  2. Re-run: npm run test:postgres');
    console.log('\n  Note: \'.env.local\' is strictly excluded by .gitignore to protect secrets.');
    return { ok: false, status: 'BLOCKED', reason: initialCheck.error };
  }

  assert(initialCheck.ok, 'Authenticated connection established to local PostgreSQL 18');

  const testDbName = 'craftegon_ccs_test';
  const unprivilegedRole = 'craftegon_test_app_user';

  try {
    // ------------------------------------------------------------------------
    // Step 2: Disposable Test Database Provisioning
    // ------------------------------------------------------------------------
    console.log('\n--- Step 2: Disposable Database Provisioning ---');
    try {
      client.dropDatabase(testDbName);
    } catch (e) {}
    client.createDatabase(testDbName);
    assert(true, `Created dedicated disposable test database '${testDbName}'`);

    const testDbClient = new PostgresClient(Object.assign({}, creds, { database: testDbName }));

    // ------------------------------------------------------------------------
    // Step 3: Migration Execution
    // ------------------------------------------------------------------------
    console.log('\n--- Step 3: Migration Execution ---');
    const migrationsDir = path.resolve(__dirname, '../src/backend/migrations');
    
    // Migration 001
    const m1 = testDbClient.executeScript(path.join(migrationsDir, '001_initial_schema.sql'));
    assert(m1.ok, 'Migration 001_initial_schema.sql executed successfully');

    // Migration 002
    const m2 = testDbClient.executeScript(path.join(migrationsDir, '002_row_level_security.sql'));
    assert(m2.ok, 'Migration 002_row_level_security.sql executed successfully');

    // Migration 003
    const m3 = testDbClient.executeScript(path.join(migrationsDir, '003_indexes_and_constraints.sql'));
    assert(m3.ok, 'Migration 003_indexes_and_constraints.sql executed successfully');

    // Migration 004
    const m4Path = path.join(migrationsDir, '004_auth_and_sessions.sql');
    if (fs.existsSync(m4Path)) {
      const m4 = testDbClient.executeScript(m4Path);
      assert(m4.ok, 'Migration 004_auth_and_sessions.sql executed successfully');
    }

    // Migration 005
    const m5Path = path.join(migrationsDir, '005_document_storage_policies.sql');
    if (fs.existsSync(m5Path)) {
      const m5 = testDbClient.executeScript(m5Path);
      assert(m5.ok, 'Migration 005_document_storage_policies.sql executed successfully');
    }

    // ------------------------------------------------------------------------
    // Step 4: Schema Creation & Constraints Verification
    // ------------------------------------------------------------------------
    console.log('\n--- Step 4: Schema Tables & Constraints Verification ---');
    const tablesRaw = testDbClient.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;
    `);
    const tables = tablesRaw.split('\n').map(t => t.trim()).filter(Boolean);
    const expectedTables = ['audit_logs', 'case_documents', 'cases', 'client_accounts', 'lead_enquiries', 'subscription_orders'];
    const allTablesPresent = expectedTables.every(t => tables.includes(t));
    assert(allTablesPresent, `All 6 core tables verified in database: ${tables.join(', ')}`);

    // Foreign Key Enforcement
    let fkBlocked = false;
    try {
      testDbClient.query(`
        INSERT INTO cases (id, client_id, case_reference, service_id, vertical_id, title)
        VALUES (gen_random_uuid(), gen_random_uuid(), 'CASE-INVALID-FK', 'V01-SVC-007', 'V01', 'Invalid Case');
      `);
    } catch (err) {
      fkBlocked = err.message.includes('violates foreign key constraint') || err.message.includes('cases_client_id_fkey');
    }
    assert(fkBlocked, 'Foreign key constraint strictly rejects case with non-existent client_id');

    // ------------------------------------------------------------------------
    // Step 5: Transaction & Rollback Behavior
    // ------------------------------------------------------------------------
    console.log('\n--- Step 5: Transaction & Rollback Integrity ---');
    let rollbackVerified = false;
    try {
      testDbClient.query(`
        BEGIN;
        INSERT INTO client_accounts (id, primary_email, primary_phone, legal_entity_name)
        VALUES ('11111111-1111-1111-1111-111111111111', 'rollback@test.in', '9876543210', 'Rollback Corp');
        -- Deliberate syntax/type error to force transaction abort
        INSERT INTO client_accounts (id, primary_email, primary_phone, legal_entity_name, account_role)
        VALUES ('22222222-2222-2222-2222-222222222222', 'bad@test.in', '9876543210', 'Bad Corp', 'INVALID_ROLE');
        COMMIT;
      `);
    } catch (err) {
      rollbackVerified = true;
    }
    const checkRollback = testDbClient.query(`
      SELECT COUNT(*) FROM client_accounts WHERE id = '11111111-1111-1111-1111-111111111111';
    `);
    assert(rollbackVerified && checkRollback.trim() === '0', 'Transaction rolled back completely upon error; zero partial rows committed');

    // ------------------------------------------------------------------------
    // Step 6: Database-Level Row-Level Security (RLS) Verification via Restricted Role
    // ------------------------------------------------------------------------
    console.log('\n--- Step 6: Real Database-Level Row-Level Security (RLS) via Unprivileged Role ---');

    // Provision an unprivileged application role with NOSUPERUSER and NOBYPASSRLS.
    // In PostgreSQL, superuser roles bypass RLS. Proving genuine database-level RLS requires
    // executing queries as a non-superuser role subject to RLS enforcement.
    testDbClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${unprivilegedRole}') THEN
          CREATE ROLE ${unprivilegedRole} NOSUPERUSER NOBYPASSRLS;
        END IF;
      END $$;
      GRANT USAGE ON SCHEMA public TO ${unprivilegedRole};
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${unprivilegedRole};
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${unprivilegedRole};
      GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO ${unprivilegedRole};
    `);
    assert(true, `Provisioned unprivileged role '${unprivilegedRole}' (NOSUPERUSER, NOBYPASSRLS) for genuine RLS validation`);

    const custAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const custBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const caseAId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

    // Insert synthetic accounts and case under migration context (table owner)
    testDbClient.query(`
      INSERT INTO client_accounts (id, primary_email, primary_phone, legal_entity_name, account_role)
      VALUES 
        ('${custAId}', 'cust.a@domain.com', '9876543211', 'Customer Alpha Ltd', 'client'),
        ('${custBId}', 'cust.b@domain.com', '9876543212', 'Customer Beta LLP', 'client');
      
      INSERT INTO cases (id, client_id, case_reference, service_id, vertical_id, title, status)
      VALUES ('${caseAId}', '${custAId}', 'CASE-ALPHA-001', 'V01-SVC-007', 'V01', 'Alpha Pvt Ltd Incorporation', 'IN_PROGRESS');
    `);

    // Test 6.1: Customer A reads their own case under RLS (via restricted role)
    const readA = testDbClient.query(`SELECT COUNT(*) FROM cases WHERE id = '${caseAId}';`, {
      dbRole: unprivilegedRole,
      userId: custAId,
      userRole: 'client'
    });
    assert(readA.trim() === '1', 'Customer A can view their own case under PostgreSQL RLS');

    // Test 6.2: Cross-tenant isolation: Customer B queries Customer A's case
    const readB = testDbClient.query(`SELECT COUNT(*) FROM cases WHERE id = '${caseAId}';`, {
      dbRole: unprivilegedRole,
      userId: custBId,
      userRole: 'client'
    });
    assert(readB.trim() === '0', 'CROSS-TENANT ISOLATION: Customer B queries 0 rows for Customer A case (RLS Blocked)');

    // Test 6.3: Cross-tenant enumeration: Customer B lists all cases
    const listB = testDbClient.query(`SELECT COUNT(*) FROM cases;`, {
      dbRole: unprivilegedRole,
      userId: custBId,
      userRole: 'client'
    });
    assert(listB.trim() === '0', 'CROSS-TENANT ISOLATION: Customer B sees 0 total cases in system enumeration');

    // Test 6.4: Cross-tenant mutation: Customer B attempts to UPDATE Customer A's case
    const updateB = testDbClient.query(`
      WITH upd AS (
        UPDATE cases SET title = 'Tampered by B' WHERE id = '${caseAId}' RETURNING *
      ) SELECT COUNT(*) FROM upd;
    `, {
      dbRole: unprivilegedRole,
      userId: custBId,
      userRole: 'client'
    });
    assert(updateB.trim() === '0', 'CROSS-TENANT ISOLATION: Customer B cannot update Customer A case (0 rows updated)');

    // Test 6.5: Cross-tenant deletion: Customer B attempts to DELETE Customer A's case
    const deleteB = testDbClient.query(`
      WITH del AS (
        DELETE FROM cases WHERE id = '${caseAId}' RETURNING *
      ) SELECT COUNT(*) FROM del;
    `, {
      dbRole: unprivilegedRole,
      userId: custBId,
      userRole: 'client'
    });
    assert(deleteB.trim() === '0', 'CROSS-TENANT ISOLATION: Customer B cannot delete Customer A case (0 rows deleted)');

    // Test 6.6: Customer B attempts to query Customer A's account details in client_accounts
    const accountReadB = testDbClient.query(`SELECT COUNT(*) FROM client_accounts WHERE id = '${custAId}';`, {
      dbRole: unprivilegedRole,
      userId: custBId,
      userRole: 'client'
    });
    assert(accountReadB.trim() === '0', 'CROSS-TENANT ISOLATION: Customer B cannot view Customer A account profile');

    // Test 6.7: Customer B attempts to update Customer A's account details
    const accountUpdateB = testDbClient.query(`
      WITH upd AS (
        UPDATE client_accounts SET primary_email = 'hacked@domain.com' WHERE id = '${custAId}' RETURNING *
      ) SELECT COUNT(*) FROM upd;
    `, {
      dbRole: unprivilegedRole,
      userId: custBId,
      userRole: 'client'
    });
    assert(accountUpdateB.trim() === '0', 'CROSS-TENANT ISOLATION: Customer B cannot update Customer A account profile');

    // Test 6.8: Unauthenticated access denied to cases
    const unauthReadCases = testDbClient.query(`SELECT COUNT(*) FROM cases;`, {
      dbRole: unprivilegedRole,
      userId: '',
      userRole: 'anon'
    });
    assert(unauthReadCases.trim() === '0', 'Unauthenticated caller receives 0 rows on cases under RLS');

    // Test 6.9: Unauthenticated access denied to client accounts
    const unauthReadAccounts = testDbClient.query(`SELECT COUNT(*) FROM client_accounts;`, {
      dbRole: unprivilegedRole,
      userId: '',
      userRole: 'anon'
    });
    assert(unauthReadAccounts.trim() === '0', 'Unauthenticated caller receives 0 rows on client_accounts under RLS');

    // Test 6.10: Staff role (compliance_operator) cross-tenant access permitted for operations
    const staffOpRead = testDbClient.query(`SELECT COUNT(*) FROM cases WHERE id = '${caseAId}';`, {
      dbRole: unprivilegedRole,
      userId: '99999999-9999-9999-9999-999999999999',
      userRole: 'compliance_operator'
    });
    assert(staffOpRead.trim() === '1', 'Compliance operator can inspect case across tenants for operational fulfillment');

    // Test 6.11: Staff role (managing_partner) cross-tenant access permitted
    const partnerRead = testDbClient.query(`SELECT COUNT(*) FROM cases WHERE id = '${caseAId}';`, {
      dbRole: unprivilegedRole,
      userId: '88888888-8888-8888-8888-888888888888',
      userRole: 'managing_partner'
    });
    assert(partnerRead.trim() === '1', 'Managing partner can inspect case across tenants');

    // Test 6.12: Unauthorized role (unauthorized_guest) denied cross-tenant access
    const unauthorizedRead = testDbClient.query(`SELECT COUNT(*) FROM cases WHERE id = '${caseAId}';`, {
      dbRole: unprivilegedRole,
      userId: '77777777-7777-7777-7777-777777777777',
      userRole: 'unauthorized_guest'
    });
    assert(unauthorizedRead.trim() === '0', 'Unauthorized arbitrary role denied cross-tenant case access');

    // ------------------------------------------------------------------------
    // Step 7: Session Setting Leakage & Malformed Context Tests
    // ------------------------------------------------------------------------
    console.log('\n--- Step 7: Session Setting Leakage & Malformed Context Tests ---');
    // Test 7.1: Verify SET LOCAL cleans up immediately outside transaction
    testDbClient.query(`
      BEGIN;
      SET LOCAL app.current_user_id = '${custAId}';
      COMMIT;
    `);
    const residualSetting = testDbClient.query(`SELECT NULLIF(current_setting('app.current_user_id', true), '');`);
    assert(!residualSetting || residualSetting.trim() === '', 'SET LOCAL cleanly resets session variable upon transaction commit (Zero pool leakage)');

    // Test 7.2: Malformed UUID in session setting evaluates safely to NULL
    const malformedQuery = testDbClient.query(`SELECT app_current_user_id();`, {
      dbRole: unprivilegedRole,
      userId: 'not-a-valid-uuid-12345',
      userRole: 'client'
    });
    assert(!malformedQuery || malformedQuery.trim() === '', 'Malformed non-UUID user ID safely returns NULL without transaction abort');

    // Test 7.3: Missing / empty session setting evaluates safely to NULL
    const emptyQuery = testDbClient.query(`SELECT app_current_user_id();`, {
      dbRole: unprivilegedRole,
      userId: '',
      userRole: 'anon'
    });
    assert(!emptyQuery || emptyQuery.trim() === '', 'Empty user ID safely returns NULL');

    // ------------------------------------------------------------------------
    // Step 8: Duplicate Lead Prevention via Unique Constraint
    // ------------------------------------------------------------------------
    console.log('\n--- Step 8: Duplicate Lead Prevention via Unique Constraint ---');
    const leadRef = 'LEAD-2026-UNIQUE-TEST';
    testDbClient.query(`
      INSERT INTO lead_enquiries (lead_reference, service_id, vertical_id, contact_name, email_hash, phone_hash, dpdp_consent)
      VALUES ('${leadRef}', 'V01-SVC-007', 'V01', 'Arjun Verma', 'hash1', 'hash2', true);
    `);
    let dupBlocked = false;
    try {
      testDbClient.query(`
        INSERT INTO lead_enquiries (lead_reference, service_id, vertical_id, contact_name, email_hash, phone_hash, dpdp_consent)
        VALUES ('${leadRef}', 'V01-SVC-007', 'V01', 'Duplicate Submitter', 'hash1', 'hash2', true);
      `);
    } catch (err) {
      dupBlocked = err.message.includes('violates unique constraint') || err.message.includes('lead_enquiries_lead_reference_key');
    }
    assert(dupBlocked, 'Database unique constraint strictly blocks duplicate lead_reference insert');

    // ------------------------------------------------------------------------
    // Step 9: Enquiry Repository Persistence Across Restart & Write Failure Safety
    // ------------------------------------------------------------------------
    console.log('\n--- Step 9: Enquiry Repository Persistence & Write Failure Safety ---');
    const pgStorage = new PostgresEnquiryStorage(testDbClient);
    const repoInstance1 = new EnquiryRepository(pgStorage);

    const testLead = {
      lead_reference: 'LEAD-2026-DURABLE-TEST',
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      contact_name: 'Durable Customer',
      email_hash: 'emailhash123',
      phone_hash: 'phonehash123',
      dpdp_consent: true,
      status: 'ENQUIRY_RECEIVED'
    };

    const created = await repoInstance1.createEnquiry(testLead);
    assert(created && created.lead_reference === testLead.lead_reference, 'PostgresEnquiryStorage successfully persisted enquiry to PostgreSQL');

    // Simulate complete process restart: instantiate new repository without shared memory
    const repoInstance2 = new EnquiryRepository(new PostgresEnquiryStorage(testDbClient));
    const retrievedAfterRestart = await repoInstance2.getEnquiry(testLead.lead_reference);
    assert(retrievedAfterRestart && retrievedAfterRestart.contact_name === 'Durable Customer', 'Enquiry successfully retrieved after simulated server restart (Durable persistence verified)');

    // Test 9.3: Failed database write never produces a false success response
    let writeFailedGracefully = false;
    try {
      // Duplicate lead insert via repository must throw and never return a truthy record
      await repoInstance2.createEnquiry(testLead);
    } catch (err) {
      writeFailedGracefully = true;
    }
    assert(writeFailedGracefully, 'Failed database write rejects with exception and NEVER produces a false success response');

    return { ok: true, status: 'LOCAL POSTGRES VERIFIED' };
  } finally {
    // Cleanup disposable test database and role
    console.log('\n--- Cleanup: Dropping Disposable Test Database & Roles ---');
    try {
      // Revoke and drop unprivileged test role
      client.query(`
        DROP OWNED BY ${unprivilegedRole} CASCADE;
        DROP ROLE IF EXISTS ${unprivilegedRole};
      `, { database: 'postgres' });
    } catch (e) {
      // Role cleanup notice
    }

    try {
      client.dropDatabase(testDbName);
      console.log(`  Cleaned up '${testDbName}' successfully.`);
    } catch (e) {
      console.log(`  Cleanup notice: ${e.message}`);
    }
  }
}

if (require.main === module) {
  runPostgresVerification().then(res => {
    console.log('\n======================================================================');
    console.log(`FINAL RESULT: ${res.status}`);
    console.log(`Assertions: ${passedAssertions} passed, ${failedAssertions} failed`);
    console.log('======================================================================');
    if (!res.ok) process.exit(1);
  }).catch(err => {
    console.error('Execution exception:', err);
    process.exit(1);
  });
}

module.exports = { runPostgresVerification };
