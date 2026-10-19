/**
 * CraftEgon CCS - Document Controller
 * Manages secure document intake, magic-byte validation, quarantine staging,
 * malware scanning, short-lived HMAC signed downloads, and RLS tenant isolation.
 */

const crypto = require('node:crypto');
const { requireAuth } = require('../middleware/auth-guard');
const { parseDocumentUpload } = require('../middleware/body-parser');
const {
  validateDocumentPayload,
  generateStoragePaths
} = require('../models/document.model');
const { scannerService } = require('../models/scanner.service');
const {
  generateSignedDownloadUrl,
  verifySignedDownloadUrl
} = require('../models/signed-url');
const { documentRepository } = require('../storage/document-repository');
const { caseRepository } = require('../storage/case-repository');
const { defaultVaultStorage } = require('../storage/vault-storage');

/**
 * POST /api/v1/documents/upload
 */
async function handleUploadDocument(req, res, config) {
  // Guard: explicitly unavailable state until private storage & scanner are operational
  if (!config.scannerEnabled) {
    res.writeHead(503, {
      'Content-Type': 'application/json',
      'Retry-After': '86400'
    });
    return res.end(JSON.stringify({
      error: 'Service Unavailable',
      status: 'UNAVAILABLE_PENDING_SCANNER',
      message: 'Customer document upload journey is currently unavailable. Private storage, signature validation, and asynchronous malware scanning (ClamAV) must be fully provisioned before sensitive client documents can be accepted.'
    }));
  }

  // 1. Authenticate caller
  const user = await requireAuth(req, res);
  if (!user) return;

  // 2. Parse upload stream
  let upload;
  try {
    upload = await parseDocumentUpload(req, res, config.maxDocumentSizeBytes);
  } catch (err) {
    // Error handled by body parser (e.g. 413 Payload Too Large)
    return;
  }

  if (!upload.case_id || !upload.filename || !upload.buffer || upload.buffer.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'case_id, filename, and non-empty file content are required for document intake'
    }));
  }

  // 3. Verify case exists & authorization
  const caseItem = await caseRepository.getCase(upload.case_id, {
    userId: user.account_id,
    role: user.role
  });

  if (!caseItem) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Target case '${upload.case_id}' not found or access denied by Row-Level Security`
    }));
  }

  const isOwner = caseItem.client_id === user.account_id;
  const isStaff = ['compliance_operator', 'managing_partner'].includes(user.role);
  if (!isOwner && !isStaff) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Access Denied: You do not have permission to attach documents to this corporate case'
    }));
  }

  // 4. Validate file integrity & magic-byte signature
  const validation = validateDocumentPayload(
    upload.buffer,
    upload.filename,
    upload.mimeType,
    config.maxDocumentSizeBytes
  );

  if (!validation.valid) {
    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Unprocessable Entity',
      message: 'Document validation failed',
      errors: validation.errors
    }));
  }

  // 5. Stage document in isolated quarantine vault
  const docId = crypto.randomUUID();
  const paths = generateStoragePaths(caseItem.case_reference, docId, validation.extension);

  await defaultVaultStorage.saveQuarantine(paths.quarantinePath, upload.buffer);

  // 6. Record document in repository with initial QUARANTINE status
  await documentRepository.createDocument(
    {
      id: docId,
      case_id: caseItem.id,
      uploaded_by: user.account_id,
      original_filename: validation.filename,
      storage_path: paths.quarantinePath,
      file_signature: validation.fileSignature,
      file_size_bytes: validation.fileSizeBytes,
      mime_type: validation.mimeType,
      quarantine_status: 'QUARANTINE',
      scan_results: null
    },
    { userId: user.account_id, role: user.role }
  );

  // 7. Perform asynchronous / immediate malware scan
  let scanResult;
  try {
    scanResult = await scannerService.scanBuffer(upload.buffer, {
      filename: validation.filename,
      mimeType: validation.mimeType
    });
  } catch (scanErr) {
    scanResult = { clean: false, threatsFound: 1, threatNames: ['SCANNER_EXECUTION_FAILURE'] };
  }

  // 8. Handle Scan Results
  if (!scanResult.clean) {
    // Threat detected: update to INFECTED, purge quarantine file, emit security alert
    await documentRepository.updateQuarantineStatus(
      docId,
      'INFECTED',
      scanResult,
      null,
      { role: 'compliance_operator' }
    );
    await defaultVaultStorage.purgeQuarantined(paths.quarantinePath);

    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Security Threat Detected',
      status: 'INFECTED',
      message: `Malware scan detected security threats: ${scanResult.threatNames.join(', ')}. The file has been quarantined and purged.`,
      threats: scanResult.threatNames
    }));
  }

  // Scan passed: Promote file to clean vault & update database status to CLEAN
  await defaultVaultStorage.promoteToClean(paths.quarantinePath, paths.cleanPath);
  const cleanDoc = await documentRepository.updateQuarantineStatus(
    docId,
    'CLEAN',
    scanResult,
    paths.cleanPath,
    { role: 'compliance_operator' }
  );

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    document_id: docId,
    case_id: caseItem.id,
    case_reference: caseItem.case_reference,
    filename: validation.filename,
    file_size_bytes: validation.fileSizeBytes,
    mime_type: validation.mimeType,
    quarantine_status: 'CLEAN',
    created_at: cleanDoc ? cleanDoc.created_at : new Date().toISOString()
  }));
}

/**
 * GET /api/v1/documents/:id/download-url
 */
async function handleGetDocumentDownloadUrl(req, res, id, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const doc = await documentRepository.getDocumentById(id, {
    userId: user.account_id,
    role: user.role
  });

  if (!doc) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Document '${id}' not found, quarantined, or access denied by Row-Level Security policy`
    }));
  }

  // Client cannot receive download URLs for non-clean documents
  if (user.role === 'client' && doc.quarantine_status !== 'CLEAN') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Document '${id}' not found or currently held in quarantine`
    }));
  }

  // Issue short-lived presigned URL (15 minutes / 900 seconds)
  const signed = generateSignedDownloadUrl(doc.id, doc.storage_path, config.jwtSecret, 900);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    document_id: doc.id,
    filename: doc.original_filename,
    download_url: signed.downloadUrl,
    expires_in_seconds: signed.expiresInSeconds
  }));
}

/**
 * GET /api/v1/documents/:id/download?expires=...&sig=...
 */
async function handleDownloadDocument(req, res, id, config) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const expires = parsedUrl.searchParams.get('expires');
  const sig = parsedUrl.searchParams.get('sig');

  if (!expires || !sig) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Missing signed download URL parameters (expires, sig)'
    }));
  }

  // System retrieval of document record for signature validation
  const doc = await documentRepository.getDocumentById(id, { role: 'compliance_operator' });
  if (!doc) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Document '${id}' not found`
    }));
  }

  // Strictly deny download of quarantined, infected, or blocked files
  if (doc.quarantine_status !== 'CLEAN') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: `Access Denied: Document status is '${doc.quarantine_status}'. Only verified clean documents may be downloaded.`
    }));
  }

  // Constant-time HMAC verification
  const verification = verifySignedDownloadUrl(doc.id, doc.storage_path, expires, sig, config.jwtSecret);
  if (!verification.valid) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: `Invalid or expired download signature (${verification.reason})`
    }));
  }

  // Read binary stream from private vault
  const buffer = await defaultVaultStorage.readFile(doc.storage_path);
  if (!buffer) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: 'Document binary not found in vault storage'
    }));
  }

  // Serve with strict security headers
  const safeFilename = doc.original_filename.replace(/[^\w.-]/g, '_');
  res.writeHead(200, {
    'Content-Type': doc.mime_type,
    'Content-Length': buffer.length,
    'Content-Disposition': `attachment; filename="${safeFilename}"`,
    'Content-Security-Policy': "default-src 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate'
  });
  res.end(buffer);
}

/**
 * GET /api/v1/portal/cases/:ref/documents
 */
async function handleListCaseDocuments(req, res, caseRef, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const caseItem = await caseRepository.getCase(caseRef, {
    userId: user.account_id,
    role: user.role
  });

  if (!caseItem) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Case '${caseRef}' not found or access denied`
    }));
  }

  const docs = await documentRepository.listDocumentsForCase(caseItem.id, {
    userId: user.account_id,
    role: user.role
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    case_reference: caseItem.case_reference,
    total: docs.length,
    documents: docs.map(d => ({
      id: d.id,
      original_filename: d.original_filename,
      file_size_bytes: d.file_size_bytes,
      mime_type: d.mime_type,
      quarantine_status: d.quarantine_status,
      created_at: d.created_at
    }))
  }));
}

/**
 * DELETE /api/v1/documents/:id
 */
async function handleDeleteDocument(req, res, id, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const doc = await documentRepository.getDocumentById(id, {
    userId: user.account_id,
    role: user.role
  });

  if (!doc) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Document '${id}' not found or access denied`
    }));
  }

  // Delete from repository and vault
  await documentRepository.deleteDocument(id, {
    userId: user.account_id,
    role: user.role
  });
  await defaultVaultStorage.deleteFile(doc.storage_path);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message: 'Document deleted successfully',
    document_id: id
  }));
}

module.exports = {
  handleUploadDocument,
  handleGetDocumentDownloadUrl,
  handleDownloadDocument,
  handleListCaseDocuments,
  handleDeleteDocument
};
