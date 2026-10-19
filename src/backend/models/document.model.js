/**
 * CraftEgon CCS - Document Domain Model & Cryptographic Verification
 * Pure Node.js built-ins. Magic-byte verification, MIME allowlist, and hash generation.
 */

const crypto = require('node:crypto');
const path = require('node:path');

const MAX_DOCUMENT_SIZE_BYTES = 15728640; // 15 MB

const ALLOWED_MIME_TYPES = Object.freeze({
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JPEG: 'image/jpeg',
  PNG: 'image/png'
});

// Magic byte signatures for allowlisted document formats
const MAGIC_SIGNATURES = [
  {
    mime: ALLOWED_MIME_TYPES.PDF,
    ext: 'pdf',
    // %PDF-
    bytes: [0x25, 0x50, 0x44, 0x46],
    offset: 0
  },
  {
    mime: ALLOWED_MIME_TYPES.PNG,
    ext: 'png',
    // \x89PNG\r\n\x1a\n
    bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    offset: 0
  },
  {
    mime: ALLOWED_MIME_TYPES.JPEG,
    ext: 'jpg',
    // \xFF\xD8\xFF
    bytes: [0xFF, 0xD8, 0xFF],
    offset: 0
  },
  {
    mime: ALLOWED_MIME_TYPES.DOCX,
    ext: 'docx',
    // PK\x03\x04 (ZIP archive standard for OOXML DOCX)
    bytes: [0x50, 0x4B, 0x03, 0x04],
    offset: 0
  }
];

// Disallowed executable headers that must be blocked immediately
const EXECUTABLE_SIGNATURES = [
  { name: 'DOS/PE Executable', bytes: [0x4D, 0x5A] }, // MZ
  { name: 'ELF Binary', bytes: [0x7F, 0x45, 0x4C, 0x46] }, // \x7FELF
  { name: 'Java Class', bytes: [0xCA, 0xFE, 0xBA, 0xBE] },
  { name: 'Shell Script', bytes: [0x23, 0x21] } // #!
];

/**
 * Detect actual file signature from initial buffer bytes
 */
function detectFileSignature(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { detectedMime: null, ext: null, valid: false, error: 'EMPTY_OR_INVALID_BUFFER' };
  }

  // Check for disallowed executable signatures first
  for (const sig of EXECUTABLE_SIGNATURES) {
    if (buffer.length >= sig.bytes.length) {
      let matches = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        if (buffer[i] !== sig.bytes[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return {
          detectedMime: null,
          ext: null,
          valid: false,
          error: `DISALLOWED_EXECUTABLE_SIGNATURE: ${sig.name}`
        };
      }
    }
  }

  // Check allowlisted document signatures
  for (const sig of MAGIC_SIGNATURES) {
    if (buffer.length >= sig.offset + sig.bytes.length) {
      let matches = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        if (buffer[sig.offset + i] !== sig.bytes[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return {
          detectedMime: sig.mime,
          ext: sig.ext,
          valid: true,
          error: null
        };
      }
    }
  }

  return {
    detectedMime: null,
    ext: null,
    valid: false,
    error: 'UNRECOGNIZED_MAGIC_BYTES'
  };
}

/**
 * Sanitize filename to prevent directory traversal or control character injection
 */
function sanitizeFilename(rawFilename) {
  if (!rawFilename || typeof rawFilename !== 'string') {
    return 'document_upload';
  }

  // Extract base filename without path
  const basename = path.basename(rawFilename);
  // Strip control characters, null bytes, and path traversal sequences
  const sanitized = basename
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.{2,}/g, '.')
    .trim();

  return sanitized || 'document_upload';
}

/**
 * Compute SHA-256 payload signature
 */
function computeFileSignature(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generate unpredictable storage paths for quarantine and clean storage
 */
function generateStoragePaths(caseReference, documentId, ext) {
  const safeRef = (caseReference || 'CASE-GEN').replace(/[^a-zA-Z0-9_-]/g, '');
  const docUuid = documentId || crypto.randomUUID();
  const safeExt = ext ? `.${ext.replace(/[^a-zA-Z0-9]/g, '')}` : '';

  return {
    documentId: docUuid,
    quarantinePath: `cases/${safeRef}/quarantine/${docUuid}${safeExt}`,
    cleanPath: `cases/${safeRef}/clean/${docUuid}${safeExt}`
  };
}

/**
 * Validate document payload integrity, MIME conformance, and size limits
 */
function validateDocumentPayload(buffer, rawFilename, declaredMime, maxSizeBytes = MAX_DOCUMENT_SIZE_BYTES) {
  const errors = [];

  if (!Buffer.isBuffer(buffer)) {
    return {
      valid: false,
      errors: ['Payload must be a valid binary Buffer']
    };
  }

  if (buffer.length === 0) {
    errors.push('File buffer cannot be empty (0 bytes)');
  }

  if (buffer.length > maxSizeBytes) {
    errors.push(`File size (${buffer.length} bytes) exceeds maximum limit of ${maxSizeBytes} bytes`);
  }

  const sigResult = detectFileSignature(buffer);
  if (!sigResult.valid) {
    errors.push(`File signature validation failed: ${sigResult.error}`);
  }

  // If MIME is declared, ensure it matches detected MIME
  if (declaredMime && sigResult.detectedMime) {
    const normDeclared = declaredMime.toLowerCase().trim();
    if (normDeclared !== sigResult.detectedMime.toLowerCase()) {
      errors.push(`Declared MIME type '${declaredMime}' does not match detected file signature '${sigResult.detectedMime}'`);
    }
  }

  const filename = sanitizeFilename(rawFilename);
  const fileSignature = buffer.length > 0 ? computeFileSignature(buffer) : null;

  return {
    valid: errors.length === 0,
    errors,
    mimeType: sigResult.detectedMime,
    extension: sigResult.ext,
    fileSizeBytes: buffer.length,
    fileSignature,
    filename
  };
}

module.exports = {
  MAX_DOCUMENT_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  MAGIC_SIGNATURES,
  detectFileSignature,
  sanitizeFilename,
  computeFileSignature,
  generateStoragePaths,
  validateDocumentPayload
};
