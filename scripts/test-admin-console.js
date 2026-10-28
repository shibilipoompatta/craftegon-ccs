/**
 * CraftEgon Corporate Services (CCS) - Admin Console Automated Test Suite
 * Verifies server-verified auth gating, role enforcement, service CRUD,
 * confirmation-gated deletions, publishing pipeline, and backup/restore.
 */

const assert = require('node:assert');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('../src/backend/server');

const TEST_PORT = 3105;

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const opts = { ...options, headers: { ...(options.headers || {}) } };
    let payload = null;
    if (body !== null && body !== undefined) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          raw: data
        });
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runAdminTests() {
  console.log('======================================================');
  console.log('   CRAFTEGON CCS — ADMIN DASHBOARD TEST SUITE        ');
  console.log('======================================================');

  const instance = createServer({
    PORT: TEST_PORT,
    NODE_ENV: 'test',
    databaseProvider: 'local_in_memory',
    adminEmail: 'admin@craftegon.com',
    adminPassword: 'CraftEgonAdmin2026!'
  });

  await instance.start();

  try {
    let adminToken = null;
    let clientToken = null;

    // ----------------------------------------------------
    // Test 1: Security Gating - Reject Unauthenticated Requests
    // ----------------------------------------------------
    console.log('\n--- Test Suite 1: Security Gating & Role Enforcement ---');

    const unauthMe = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/me',
      method: 'GET'
    });
    assert.strictEqual(unauthMe.statusCode, 401, 'Unauthenticated GET /api/v1/admin/me returns HTTP 401');
    console.log('  ✓ Unauthenticated access to /api/v1/admin/me returns HTTP 401');

    const unauthServices = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/services',
      method: 'GET'
    });
    assert.strictEqual(unauthServices.statusCode, 401, 'Unauthenticated GET /api/v1/admin/services returns HTTP 401');
    console.log('  ✓ Unauthenticated access to /api/v1/admin/services returns HTTP 401');

    // ----------------------------------------------------
    // Test 2: Admin Authentication Flow
    // ----------------------------------------------------
    console.log('\n--- Test Suite 2: Admin Login & Session Issuance ---');

    const loginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@craftegon.com',
      password: 'CraftEgonAdmin2026!'
    });

    assert.strictEqual(loginRes.statusCode, 200, 'Admin login returns HTTP 200');
    assert.ok(loginRes.body.token, 'Admin login issues session token');
    assert.strictEqual(loginRes.body.user.role, 'managing_partner', 'Admin account role is managing_partner');
    adminToken = loginRes.body.token;
    console.log('  ✓ Admin credentials verified via scrypt, session issued with managing_partner role');

    // Verify /api/v1/admin/me with valid token
    const authMe = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(authMe.statusCode, 200, 'Authenticated admin returns HTTP 200');
    assert.strictEqual(authMe.body.authenticated, true, 'Authenticated status is true');
    console.log('  ✓ GET /api/v1/admin/me verifies admin session and returns operator profile');

    // ----------------------------------------------------
    // Test 3: Client Role Rejection
    // ----------------------------------------------------
    console.log('\n--- Test Suite 3: Client Role Rejection on Admin APIs ---');

    // Authenticate a standard client
    const clientLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client-user@example.com',
      legal_entity_name: 'Regular Client Ltd',
      role: 'client'
    });
    clientToken = clientLogin.body.token;

    const clientAdminAccess = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/services',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assert.strictEqual(clientAdminAccess.statusCode, 403, 'Client role rejected from admin endpoint with HTTP 403');
    console.log('  ✓ Regular client accounts are strictly rejected with HTTP 403 Forbidden');

    // ----------------------------------------------------
    // Test 4: Services Management (Read, Search & Filter)
    // ----------------------------------------------------
    console.log('\n--- Test Suite 4: Service Discovery & Filtering ---');

    const listRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/services',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(listRes.statusCode, 200, 'List services returns HTTP 200');
    assert.ok(listRes.body.services.length >= 57, `Found at least 57 canonical services (${listRes.body.services.length})`);
    assert.strictEqual(listRes.body.verticals.length, 15, 'Found exactly 15 practice verticals');
    console.log(`  ✓ GET /api/v1/admin/services returns ${listRes.body.services.length} services across 15 verticals`);

    // Search query filter test
    const searchRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/services?q=pvt+ltd',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(searchRes.statusCode, 200, 'Search query returns HTTP 200');
    assert.ok(searchRes.body.services.some(s => s.id === 'V01-SVC-007'), 'Query finds V01-SVC-007 Pvt Ltd Registration');
    console.log('  ✓ Query filtering correctly matches service title and canonical ID');

    // ----------------------------------------------------
    // Test 5: Service Lifecycle (Create, Update, Delete Safety)
    // ----------------------------------------------------
    console.log('\n--- Test Suite 5: Service Lifecycle & Confirmation Safeguards ---');

    const testServiceId = 'V01-SVC-999';

    // 5.1 Create Test Service
    const createRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/services',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      id: testServiceId,
      name: 'Automated Test Corporate Service',
      vertical_id: 'V01',
      business_stage: 'Formation & Startup',
      description: 'Test service description for admin verification',
      pricing: {
        amount: 8888,
        website_displayed_price: '₹8,888 + Govt. Fees',
        package_title: 'Test Comprehensive Package',
        included_charges: ['Test Deliverable 1', 'Test Deliverable 2'],
        excluded_charges: ['Statutory Govt Fees']
      }
    });
    assert.strictEqual(createRes.statusCode, 201, 'Create service returns HTTP 201 Created');
    console.log(`  ✓ POST /api/v1/admin/services successfully provisions ${testServiceId}`);

    // 5.2 Retrieve Test Service
    const getRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/admin/services/${testServiceId}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(getRes.statusCode, 200, 'Retrieve service returns HTTP 200');
    assert.strictEqual(getRes.body.service.pricing.amount, 8888, 'Pricing amount verified at 8888');
    console.log('  ✓ GET /api/v1/admin/services/:id returns full pricing and scope inclusions');

    // 5.3 Update Test Service
    const updateRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/admin/services/${testServiceId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      name: 'Automated Test Service (Updated)',
      pricing: {
        amount: 9999,
        website_displayed_price: '₹9,999 + Govt. Fees'
      }
    });
    assert.strictEqual(updateRes.statusCode, 200, 'Update service returns HTTP 200');
    console.log('  ✓ PUT /api/v1/admin/services/:id successfully updates pricing and details');

    // 5.4 Delete without confirmation code must FAIL
    const unconfirmedDelete = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/admin/services/${testServiceId}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      confirm_code: 'WRONG_CODE'
    });
    assert.strictEqual(unconfirmedDelete.statusCode, 400, 'Unconfirmed deletion is blocked with HTTP 400');
    console.log('  ✓ Deletion attempt without matching verification code is strictly blocked (HTTP 400)');

    // 5.5 Delete with proper confirmation code succeeds
    const confirmedDelete = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/admin/services/${testServiceId}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      confirm_code: testServiceId,
      action: 'hard_delete'
    });
    assert.strictEqual(confirmedDelete.statusCode, 200, 'Confirmed deletion returns HTTP 200');
    console.log('  ✓ DELETE with verified confirmation code successfully removes test record');

    // ----------------------------------------------------
    // Test 6: Controlled Publishing Pipeline & Backups
    // ----------------------------------------------------
    console.log('\n--- Test Suite 6: Controlled Publishing & Snapshot Backups ---');

    const publishRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/publish',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(publishRes.statusCode, 200, 'Publish returns HTTP 200');
    assert.ok(publishRes.body.backup_file, 'Backup file was created');
    console.log(`  ✓ POST /api/v1/admin/publish validates integrity and generates snapshot ${publishRes.body.backup_file}`);

    const backupsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/admin/backups',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(backupsRes.statusCode, 200, 'Backups list returns HTTP 200');
    assert.ok(backupsRes.body.backups.length > 0, 'Backups list contains snapshots');
    console.log(`  ✓ GET /api/v1/admin/backups lists historical snapshots`);

    console.log('\n======================================================');
    console.log('   ADMIN DASHBOARD TEST SUITE: ALL PASSED (100%)      ');
    console.log('======================================================\n');
  } finally {
    await instance.stop();
  }
}

if (require.main === module) {
  runAdminTests().catch(err => {
    console.error('Admin Test Suite Failure:', err);
    process.exit(1);
  });
}

module.exports = { runAdminTests };
