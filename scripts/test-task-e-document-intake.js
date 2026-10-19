/**
 * CraftEgon CCS - Phase 3 Task E: Secure Document Intake Test Suite
 * Validates magic-byte validation, quarantine lifecycle, malware scanning,
 * short-lived HMAC signed downloads, cross-tenant isolation, and PostgreSQL 18 engine RLS.
 */

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert');

const { createServer } = require('../src/backend/server');
const { loadConfig } = require('../src/backend/config');
const {
  detectFileSignature,
  sanitizeFilename,
  validateDocumentPayload,
  ALLOWED_MIME_TYPES
} = require('../src/backend/models/document.model');
const { EICAR_TEST_SIGNATURE, scannerService } = require('../src/backend/models/scanner.service');
const {
  generateSignedDownloadUrl,
  verifySignedDownloadUrl
} = require('../src/backend/models/signed-url');
const { accountRepository, InMemoryAccountStorage } = require('../src/backend/storage/account-repository');
const { caseRepository, InMemoryCaseStorage } = require('../src/backend/storage/case-repository');
const { documentRepository, InMemoryDocumentStorage } = require('../src/backend/storage/document-repository');
const { memoryStore } = require('../src/backend/storage/memory-store');
const { defaultVaultStorage } = require('../src/backend/storage/vault-storage');
const { PostgresClient, getPostgresCredentials } = require('../src/backend/storage/postgres-client');

let passedAssertions = 0;
let failedAssertions = 0;

function pass(msg) {
  passedAssertions++;
  console.log(`  ✅ PASS: ${msg}`);
}

function fail(msg, err) {
  failedAssertions++;
  console.error(`  ❌ FAIL: ${msg}`);
  if (err) console.error(err);
}

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        let body = null;
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            body = JSON.parse(raw.toString('utf8'));
          } catch (e) {
            body = raw.toString('utf8');
          }
        } else {
          body = raw;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          rawBody: raw
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      if (Buffer.isBuffer(postData)) {
        req.write(postData);
      } else if (typeof postData === 'object') {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

// Helper to construct synthetic valid files with correct magic bytes
function createSyntheticPdf(content = 'CraftEgon Corporate Services Test Document') {
  return Buffer.concat([
    Buffer.from('%PDF-1.7\n'),
    Buffer.from(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n${content}\n%%EOF\n`)
  ]);
}

function createSyntheticPng() {
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    Buffer.from([0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52]) // IHDR chunk marker
  ]);
}

function createSyntheticJpeg() {
  return Buffer.concat([
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01])
  ]);
}

function createSyntheticDocx() {
  return Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x03, 0x04]), // PK ZIP header
    Buffer.from('[Content_Types].xml\nCraftEgon Test Word Document')
  ]);
}

async function runTaskETestSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 3 Task E: Secure Document Intake Test Suite');
  console.log('======================================================================\n');

  const testPort = 3195;
  const serverInstance = createServer({
    PORT: testPort,
    DATABASE_PROVIDER: 'local_in_memory',
    SCANNER_ENABLED: true,
    MAX_DOCUMENT_SIZE_BYTES: 15728640 // 15 MB
  });

  await serverInstance.start();

  try {
    memoryStore.reset();
    defaultVaultStorage.reset();
    accountRepository.setAdapter(new InMemoryAccountStorage());
    caseRepository.setAdapter(new InMemoryCaseStorage());
    documentRepository.setAdapter(new InMemoryDocumentStorage());

    // ========================================================================
    // Suite 1: Magic-Byte Signature Verification & Format Allowlist
    // ========================================================================
    console.log('--- Suite 1: Magic-Byte Signature Verification & Format Allowlist ---');

    // 1. Valid PDF magic bytes
    const pdfBuf = createSyntheticPdf();
    const pdfSig = detectFileSignature(pdfBuf);
    assert(pdfSig.valid && pdfSig.detectedMime === ALLOWED_MIME_TYPES.PDF, 'Identifies valid PDF magic bytes (%PDF-)');
    pass('Identifies valid PDF magic bytes (%PDF-)');

    // 2. Valid PNG magic bytes
    const pngBuf = createSyntheticPng();
    const pngSig = detectFileSignature(pngBuf);
    assert(pngSig.valid && pngSig.detectedMime === ALLOWED_MIME_TYPES.PNG, 'Identifies valid PNG magic bytes');
    pass('Identifies valid PNG magic bytes');

    // 3. Valid JPEG magic bytes
    const jpgBuf = createSyntheticJpeg();
    const jpgSig = detectFileSignature(jpgBuf);
    assert(jpgSig.valid && jpgSig.detectedMime === ALLOWED_MIME_TYPES.JPEG, 'Identifies valid JPEG magic bytes');
    pass('Identifies valid JPEG magic bytes');

    // 4. Valid DOCX magic bytes
    const docxBuf = createSyntheticDocx();
    const docxSig = detectFileSignature(docxBuf);
    assert(docxSig.valid && docxSig.detectedMime === ALLOWED_MIME_TYPES.DOCX, 'Identifies valid DOCX magic bytes (PK archive)');
    pass('Identifies valid DOCX magic bytes (PK archive)');

    // 5. Disallowed executable header (DOS/PE MZ)
    const exeBuf = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]); // MZ
    const exeSig = detectFileSignature(exeBuf);
    assert(!exeSig.valid && exeSig.error.includes('DISALLOWED_EXECUTABLE'), 'Detects and strictly blocks DOS/PE executable signature');
    pass('Detects and strictly blocks DOS/PE executable signature');

    // 6. Disallowed ELF binary header
    const elfBuf = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01]); // \x7FELF
    const elfSig = detectFileSignature(elfBuf);
    assert(!elfSig.valid && elfSig.error.includes('DISALLOWED_EXECUTABLE'), 'Detects and strictly blocks ELF binary signature');
    pass('Detects and strictly blocks ELF binary signature');

    // 7. Spoofed file: file named "board_minutes.pdf" containing plain ASCII text
    const spoofedBuf = Buffer.from('Just plain text pretending to be a PDF file');
    const spoofedRes = validateDocumentPayload(spoofedBuf, 'board_minutes.pdf', 'application/pdf');
    assert(!spoofedRes.valid, 'Rejects spoofed PDF whose magic bytes do not match %PDF-');
    pass('Rejects spoofed PDF whose magic bytes do not match %PDF-');

    // 8. Empty buffer
    const emptyRes = validateDocumentPayload(Buffer.alloc(0), 'empty.pdf', 'application/pdf');
    assert(!emptyRes.valid, 'Rejects empty 0-byte document');
    pass('Rejects empty 0-byte document');

    // 9. Oversized document check (>15 MB)
    const oversizeRes = validateDocumentPayload(pdfBuf, 'huge.pdf', 'application/pdf', 10); // cap at 10 bytes for test
    assert(!oversizeRes.valid && oversizeRes.errors[0].includes('exceeds maximum limit'), 'Enforces maximum file size limit');
    pass('Enforces maximum file size limit');

    // 10. Filename sanitization against path traversal
    const cleanFilename = sanitizeFilename('../../../../../etc/shadow');
    assert(cleanFilename === 'shadow', 'Filename sanitization strips directory traversal sequences (../../../)');
    pass('Filename sanitization strips directory traversal sequences (../../../)');

    // ========================================================================
    // Suite 2: Malware Scanning & Quarantine Lifecycle
    // ========================================================================
    console.log('\n--- Suite 2: Malware Scanning & Quarantine Lifecycle ---');

    // 1. Clean file scan passes
    const cleanScan = await scannerService.scanBuffer(pdfBuf);
    assert(cleanScan.clean === true && cleanScan.threatsFound === 0, 'Clean document passes malware scanner with 0 threats');
    pass('Clean document passes malware scanner with 0 threats');

    // 2. EICAR Antivirus Test Signature detection
    const eicarBuf = Buffer.concat([
      pdfBuf,
      Buffer.from(`\n${EICAR_TEST_SIGNATURE}\n`)
    ]);
    const eicarScan = await scannerService.scanBuffer(eicarBuf);
    assert(eicarScan.clean === false && eicarScan.threatNames.includes('Eicar-Test-Signature'), 'Detects EICAR antivirus test signature in payload');
    pass('Detects EICAR antivirus test signature in payload');

    // 3. Embedded script tag injection in document
    const xssDocBuf = Buffer.concat([
      pdfBuf,
      Buffer.from('\n<script>alert("malicious script execution")</script>\n')
    ]);
    const xssScan = await scannerService.scanBuffer(xssDocBuf);
    assert(xssScan.clean === false && xssScan.threatNames.includes('Embedded-Script-Tag'), 'Detects embedded script tag injection');
    pass('Detects embedded script tag injection');

    // 4. Scanner fault simulation
    scannerService.setForceFailure(true);
    const faultScan = await scannerService.scanBuffer(pdfBuf);
    assert(faultScan.clean === false && faultScan.threatNames.includes('SIMULATED_SCANNER_FAULT'), 'Handles scanner fault gracefully without crashing');
    pass('Handles scanner fault gracefully without crashing');
    scannerService.setForceFailure(false);

    // ========================================================================
    // Suite 3: Multi-Tenant Authorization & Case Document Isolation
    // ========================================================================
    console.log('\n--- Suite 3: Multi-Tenant Authorization & Case Document Isolation ---');

    // Setup accounts & cases via API
    const regResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Acme India Pvt Ltd',
      primary_email: 'customer-a@acme.in',
      primary_phone: '+91 9876543210',
      account_role: 'client',
      password: 'CorporatePassword123'
    });
    const accA = regResA.body.account;

    const loginResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'customer-a@acme.in',
      password: 'CorporatePassword123'
    });
    const tokenA = loginResA.body.token;

    const regResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Beta Global Solutions LLP',
      primary_email: 'customer-b@beta.in',
      primary_phone: '+91 9876543211',
      account_role: 'client',
      password: 'CorporatePassword456'
    });
    const accB = regResB.body.account;

    const loginResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'customer-b@beta.in',
      password: 'CorporatePassword456'
    });
    const tokenB = loginResB.body.token;

    const regResStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'CraftEgon Compliance Operations',
      primary_email: 'compliance.ops@craftegon.com',
      primary_phone: '+91 9876543212',
      account_role: 'compliance_operator',
      password: 'StaffPassword789'
    });
    const accStaff = regResStaff.body.account;

    const loginResStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'compliance.ops@craftegon.com',
      password: 'StaffPassword789'
    });
    const tokenStaff = loginResStaff.body.token;

    const caseA = await caseRepository.createCase({
      case_reference: 'CASE-2026-AAA111',
      client_id: accA.id,
      title: 'Form AOC-4 Financial Filing 2026',
      service_id: 'V02-SVC-001',
      vertical_id: 'V02'
    }, { role: 'compliance_operator' });

    const caseB = await caseRepository.createCase({
      case_reference: 'CASE-2026-BBB222',
      client_id: accB.id,
      title: 'FEMA Advance Remittance Report',
      service_id: 'V04-SVC-001',
      vertical_id: 'V04'
    }, { role: 'compliance_operator' });

    // 1. Unauthenticated upload rejected (HTTP 401)
    const unauthUpload = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST'
    });
    assert(unauthUpload.statusCode === 401, 'Unauthenticated upload rejected with HTTP 401');
    pass('Unauthenticated upload rejected with HTTP 401');

    // 2. Customer A uploads clean PDF to Case A (HTTP 201)
    const uploadResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json'
      }
    }, {
      case_id: caseA.id,
      filename: 'audited_balance_sheet.pdf',
      mime_type: 'application/pdf',
      file_base64: pdfBuf.toString('base64')
    });

    assert(uploadResA.statusCode === 201, 'Customer A uploads clean document successfully (HTTP 201)');
    pass('Customer A uploads clean document successfully (HTTP 201)');
    assert(uploadResA.body.quarantine_status === 'CLEAN', 'Clean document promoted to status CLEAN after scanner validation');
    pass('Clean document promoted to status CLEAN after scanner validation');
    const docA1Id = uploadResA.body.document_id;

    // 3. CROSS-TENANT ISOLATION: Customer B attempts to upload to Case A -> Rejected (HTTP 403/404)
    const crossUploadB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenB}`,
        'Content-Type': 'application/json'
      }
    }, {
      case_id: caseA.id,
      filename: 'injected_rogue_file.pdf',
      mime_type: 'application/pdf',
      file_base64: pdfBuf.toString('base64')
    });
    assert(crossUploadB.statusCode === 404 || crossUploadB.statusCode === 403, 'CROSS-TENANT ISOLATION: Customer B upload to Customer A case is rejected');
    pass('CROSS-TENANT ISOLATION: Customer B upload to Customer A case is rejected');

    // 4. Customer A lists documents for Case A
    const listDocsA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseA.case_reference}/documents`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(listDocsA.statusCode === 200, 'Customer A fetches case documents successfully (HTTP 200)');
    pass('Customer A fetches case documents successfully (HTTP 200)');
    assert(listDocsA.body.total === 1, 'Customer A sees exactly their 1 uploaded document');
    pass('Customer A sees exactly their 1 uploaded document');

    // 5. CROSS-TENANT ISOLATION: Customer B lists documents for Case A -> Returns 404 (Zero disclosure)
    const listDocsB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseA.case_reference}/documents`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(listDocsB.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B listing Customer A documents returns HTTP 404');
    pass('CROSS-TENANT ISOLATION: Customer B listing Customer A documents returns HTTP 404');

    // 6. Compliance staff can list documents for Case A
    const listDocsStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseA.case_reference}/documents`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(listDocsStaff.statusCode === 200 && listDocsStaff.body.total === 1, 'Compliance staff can inspect documents across corporate cases');
    pass('Compliance staff can inspect documents across corporate cases');

    // ========================================================================
    // Suite 4: Quarantine Gating & Signed Download URLs
    // ========================================================================
    console.log('\n--- Suite 4: Quarantine Gating & Signed Download URLs ---');

    // 1. Upload an infected document (contains EICAR)
    const uploadInfected = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json'
      }
    }, {
      case_id: caseA.id,
      filename: 'eicar_infected_sample.pdf',
      mime_type: 'application/pdf',
      file_base64: eicarBuf.toString('base64')
    });
    assert(uploadInfected.statusCode === 422, 'Infected document upload strictly rejected with HTTP 422');
    pass('Infected document upload strictly rejected with HTTP 422');
    assert(uploadInfected.body.status === 'INFECTED', 'Upload response confirms INFECTED status');
    pass('Upload response confirms INFECTED status');

    // 2. Customer A generates signed download URL for their CLEAN document
    const downloadUrlRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docA1Id}/download-url`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(downloadUrlRes.statusCode === 200, 'Customer A requests signed download URL for clean document (HTTP 200)');
    pass('Customer A requests signed download URL for clean document (HTTP 200)');
    assert(downloadUrlRes.body.download_url.includes('sig=') && downloadUrlRes.body.download_url.includes('expires='), 'Download URL includes HMAC signature and expiration timestamp');
    pass('Download URL includes HMAC signature and expiration timestamp');
    const validDownloadUrl = downloadUrlRes.body.download_url;

    // 3. CROSS-TENANT ISOLATION: Customer B requests download URL for Customer A document -> HTTP 404
    const downloadUrlB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docA1Id}/download-url`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(downloadUrlB.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B requesting download URL for Customer A document returns HTTP 404');
    pass('CROSS-TENANT ISOLATION: Customer B requesting download URL for Customer A document returns HTTP 404');

    // 4. Download document using valid signed URL
    const fileFetch = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: validDownloadUrl,
      method: 'GET'
    });
    assert(fileFetch.statusCode === 200, 'Download with valid signed URL succeeds (HTTP 200)');
    pass('Download with valid signed URL succeeds (HTTP 200)');
    assert(fileFetch.headers['content-type'] === 'application/pdf', 'Response includes correct Content-Type: application/pdf');
    pass('Response includes correct Content-Type: application/pdf');
    assert(fileFetch.headers['x-content-type-options'] === 'nosniff', 'Includes X-Content-Type-Options: nosniff header');
    pass('Includes X-Content-Type-Options: nosniff header');
    assert(fileFetch.headers['content-security-policy'] === "default-src 'none'", 'Includes strict Content-Security-Policy: default-src \'none\'');
    pass('Includes strict Content-Security-Policy: default-src \'none\'');

    // 5. Expired signed URL rejected
    const expiredUrl = validDownloadUrl.replace(/expires=\d+/, 'expires=1600000000'); // past timestamp
    const expiredFetch = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: expiredUrl,
      method: 'GET'
    });
    assert(expiredFetch.statusCode === 403, 'Expired signed download URL strictly rejected with HTTP 403');
    pass('Expired signed download URL strictly rejected with HTTP 403');

    // 6. Tampered signature rejected
    const tamperedUrl = validDownloadUrl.replace(/sig=[a-f0-9]{8}/, 'sig=deadbeef');
    const tamperedFetch = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: tamperedUrl,
      method: 'GET'
    });
    assert(tamperedFetch.statusCode === 403, 'Tampered HMAC signature strictly rejected with HTTP 403');
    pass('Tampered HMAC signature strictly rejected with HTTP 403');

    // 7. Missing signature parameters rejected
    const noSigFetch = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docA1Id}/download`,
      method: 'GET'
    });
    assert(noSigFetch.statusCode === 403, 'Direct download attempt without signature parameters returns HTTP 403');
    pass('Direct download attempt without signature parameters returns HTTP 403');

    // ========================================================================
    // Suite 5: Document Deletion & Soft-Delete Retention
    // ========================================================================
    console.log('\n--- Suite 5: Document Deletion & Soft-Delete Retention ---');

    // 1. Customer B attempts to delete Customer A's document -> Rejected (HTTP 404)
    const deleteByB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docA1Id}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(deleteByB.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B cannot delete Customer A document (HTTP 404)');
    pass('CROSS-TENANT ISOLATION: Customer B cannot delete Customer A document (HTTP 404)');

    // 2. Customer A deletes their document -> Succeeds (HTTP 200)
    const deleteByA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docA1Id}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(deleteByA.statusCode === 200, 'Customer A successfully deletes their document (HTTP 200)');
    pass('Customer A successfully deletes their document (HTTP 200)');

    // 3. Subsequent download URL request returns HTTP 404
    const getDeletedUrl = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docA1Id}/download-url`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(getDeletedUrl.statusCode === 404, 'Deleted document is inaccessible for download URL generation (HTTP 404)');
    pass('Deleted document is inaccessible for download URL generation (HTTP 404)');

    // 4. Direct download with prior valid signed URL fails for deleted document
    const downloadDeleted = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: validDownloadUrl,
      method: 'GET'
    });
    assert(downloadDeleted.statusCode === 404, 'Prior signed URL cannot download deleted file from vault (HTTP 404)');
    pass('Prior signed URL cannot download deleted file from vault (HTTP 404)');

    // ========================================================================
    // Suite 6: Live PostgreSQL 18 Engine-Level RLS Verification for Documents
    // ========================================================================
    console.log('\n--- Suite 6: Live PostgreSQL 18 Engine-Level RLS Verification for Documents ---');

    loadConfig();
    const pgConfig = getPostgresCredentials();
    const rootPg = new PostgresClient({ ...pgConfig, database: 'postgres' });
    const connCheck = rootPg.testConnection('postgres');

    if (!connCheck.ok) {
      console.log('  ⚠️  PostgreSQL 18 service not reachable or credentials missing; skipping live engine RLS suite');
    } else {
      const testDbName = 'craftegon_ccs_test';
      rootPg.query(`DROP DATABASE IF EXISTS ${testDbName};`);
      rootPg.query(`CREATE DATABASE ${testDbName};`);
      pass(`Created dedicated disposable test database '${testDbName}'`);

      const testDbClient = new PostgresClient({ ...pgConfig, database: testDbName });
      const migDir = path.resolve(__dirname, '../src/backend/migrations');

      testDbClient.executeScript(path.join(migDir, '001_initial_schema.sql'));
      testDbClient.executeScript(path.join(migDir, '002_row_level_security.sql'));
      testDbClient.executeScript(path.join(migDir, '003_indexes_and_constraints.sql'));
      testDbClient.executeScript(path.join(migDir, '004_auth_and_sessions.sql'));
      testDbClient.executeScript(path.join(migDir, '005_document_storage_policies.sql'));

      // Ensure unprivileged role
      testDbClient.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'craftegon_test_app_user') THEN
            CREATE ROLE craftegon_test_app_user NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE LOGIN PASSWORD 'TestUserPass123!';
          END IF;
        END $$;
        GRANT USAGE ON SCHEMA public TO craftegon_test_app_user;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO craftegon_test_app_user;
      `);

      // Provision Customer A, Customer B, Case A
      const pgClientAId = crypto.randomUUID();
      const pgClientBId = crypto.randomUUID();
      const pgCaseAId = crypto.randomUUID();
      const pgCleanDocId = crypto.randomUUID();
      const pgQuarantinedDocId = crypto.randomUUID();

      testDbClient.query(`
        INSERT INTO client_accounts (id, legal_entity_name, primary_email, primary_phone, account_role)
        VALUES ('${pgClientAId}', 'PG Customer A', 'pg-a@craftegon.local', '+91 9876543210', 'client'),
               ('${pgClientBId}', 'PG Customer B', 'pg-b@craftegon.local', '+91 9876543211', 'client');

        INSERT INTO cases (id, case_reference, client_id, service_id, vertical_id, title)
        VALUES ('${pgCaseAId}', 'CASE-PG-001', '${pgClientAId}', 'V02-SVC-001', 'V02', 'PG AOC-4 Filing');

        INSERT INTO case_documents (id, case_id, uploaded_by, original_filename, storage_path, file_signature, file_size_bytes, mime_type, quarantine_status)
        VALUES ('${pgCleanDocId}', '${pgCaseAId}', '${pgClientAId}', 'clean_financials.pdf', 'cases/CASE-PG-001/clean/doc1.pdf', 'sig123', 1024, 'application/pdf', 'CLEAN'),
               ('${pgQuarantinedDocId}', '${pgCaseAId}', '${pgClientAId}', 'quarantined_draft.pdf', 'cases/CASE-PG-001/quarantine/doc2.pdf', 'sig456', 2048, 'application/pdf', 'QUARANTINE');
      `);

      // 1. Customer A selects documents under PostgreSQL RLS
      const queryA = testDbClient.query(
        `SELECT id, original_filename, quarantine_status FROM case_documents;`,
        { userId: pgClientAId, userRole: 'client', dbRole: 'craftegon_test_app_user' }
      );
      assert(queryA.includes(pgCleanDocId), 'PostgreSQL RLS: Customer A can see their own CLEAN document');
      pass('PostgreSQL RLS: Customer A can see their own CLEAN document');
      assert(!queryA.includes(pgQuarantinedDocId), 'PostgreSQL RLS: Customer A CANNOT see QUARANTINED document (Hidden by engine policy)');
      pass('PostgreSQL RLS: Customer A CANNOT see QUARANTINED document (Hidden by engine policy)');

      // 2. Customer B selects documents under PostgreSQL RLS -> 0 rows returned
      const queryB = testDbClient.query(
        `SELECT id, original_filename, quarantine_status FROM case_documents;`,
        { userId: pgClientBId, userRole: 'client', dbRole: 'craftegon_test_app_user' }
      );
      assert(!queryB.includes(pgCleanDocId) && !queryB.includes(pgQuarantinedDocId), 'PostgreSQL RLS: Customer B sees 0 documents for Customer A case');
      pass('PostgreSQL RLS: Customer B sees 0 documents for Customer A case');

      // 3. Customer B attempts to UPDATE Customer A's document -> 0 rows updated
      const updateB = testDbClient.query(
        `UPDATE case_documents SET original_filename = 'tampered.pdf' WHERE id = '${pgCleanDocId}';`,
        { userId: pgClientBId, userRole: 'client', dbRole: 'craftegon_test_app_user' }
      );
      assert(!updateB.includes('UPDATE 1'), 'PostgreSQL RLS: Customer B cannot update Customer A document (0 rows updated)');
      pass('PostgreSQL RLS: Customer B cannot update Customer A document (0 rows updated)');

      // 4. Compliance Staff role selects documents -> sees both CLEAN and QUARANTINED
      const queryStaff = testDbClient.query(
        `SELECT id, original_filename, quarantine_status FROM case_documents;`,
        { userId: crypto.randomUUID(), userRole: 'compliance_operator', dbRole: 'craftegon_test_app_user' }
      );
      assert(queryStaff.includes(pgCleanDocId) && queryStaff.includes(pgQuarantinedDocId), 'PostgreSQL RLS: Compliance staff inspects both CLEAN and QUARANTINED documents for case audit');
      pass('PostgreSQL RLS: Compliance staff inspects both CLEAN and QUARANTINED documents for case audit');

      // Cleanup
      rootPg.query(`DROP DATABASE IF EXISTS ${testDbName};`);
      console.log(`  Cleaned up '${testDbName}' successfully.`);
    }

  } finally {
    await serverInstance.stop();
  }

  console.log('\n======================================================================');
  console.log(`TASK E TEST SUMMARY: ${passedAssertions} passed, ${failedAssertions} failed (${passedAssertions + failedAssertions} total assertions)`);
  console.log('======================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runTaskETestSuite().catch(err => {
  console.error('Task E test execution failed:', err);
  process.exit(1);
});
