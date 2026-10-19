/**
 * CraftEgon CCS - Safe Body Parser & Stream Boundary
 * Bounds incoming request size to prevent socket hanging and memory exhaustion.
 * Supports JSON, Multipart/form-data, and Base64 document uploads.
 */

function parseJsonBody(req, res, maxBytes = 32768) {
  return new Promise((resolve, reject) => {
    let receivedBytes = 0;
    const chunks = [];
    let isTerminated = false;

    req.on('data', chunk => {
      if (isTerminated) return;
      receivedBytes += chunk.length;

      if (receivedBytes > maxBytes) {
        isTerminated = true;
        req.pause();
        res.writeHead(413, {
          'Content-Type': 'application/json',
          'Connection': 'close'
        });
        res.end(JSON.stringify({
          error: 'Payload Too Large',
          message: `Payload exceeds maximum permitted size of ${maxBytes} bytes`,
          max_bytes: maxBytes
        }));
        if (req.socket) {
          req.socket.destroy();
        }
        const err = new Error('PAYLOAD_TOO_LARGE');
        err.statusCode = 413;
        return reject(err);
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (isTerminated) return;
      const rawBody = Buffer.concat(chunks).toString('utf8');

      if (!rawBody || rawBody.trim() === '') {
        return resolve({});
      }

      try {
        const parsed = JSON.parse(rawBody);
        resolve(parsed);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Bad Request',
          message: 'Malformed JSON payload. Request body must be valid JSON syntax.'
        }));
        const parseErr = new Error('MALFORMED_JSON');
        parseErr.statusCode = 400;
        reject(parseErr);
      }
    });

    req.on('error', err => {
      if (isTerminated) return;
      reject(err);
    });
  });
}

function parseMultipartBuffer(bodyBuffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const fields = {};
  let file = null;

  let start = 0;
  while (start < bodyBuffer.length) {
    const boundaryIdx = bodyBuffer.indexOf(boundaryBuffer, start);
    if (boundaryIdx === -1) break;
    const partStart = boundaryIdx + boundaryBuffer.length;
    // Check for ending delimiter
    if (bodyBuffer.slice(partStart, partStart + 2).toString() === '--') {
      break;
    }
    const headerEnd = bodyBuffer.indexOf(Buffer.from('\r\n\r\n'), partStart);
    if (headerEnd === -1) break;
    const headerStr = bodyBuffer.slice(partStart, headerEnd).toString('utf8');

    const nextBoundary = bodyBuffer.indexOf(boundaryBuffer, headerEnd + 4);
    if (nextBoundary === -1) break;
    const dataEnd = nextBoundary - 2; // exclude preceding \r\n
    const partData = bodyBuffer.slice(headerEnd + 4, Math.max(headerEnd + 4, dataEnd));

    const dispMatch = headerStr.match(/content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (dispMatch) {
      const fieldName = dispMatch[1];
      const filename = dispMatch[2];
      if (filename !== undefined) {
        const typeMatch = headerStr.match(/content-type:\s*([^\r\n;]+)/i);
        const mimeType = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';
        file = {
          filename,
          mimeType,
          buffer: partData
        };
      } else {
        fields[fieldName] = partData.toString('utf8').trim();
      }
    }
    start = nextBoundary;
  }

  return { fields, file };
}

function parseDocumentUpload(req, res, maxBytes = 15728640) {
  return new Promise((resolve, reject) => {
    let receivedBytes = 0;
    const chunks = [];
    let isTerminated = false;

    // Check header Content-Length if present
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      res.writeHead(413, {
        'Content-Type': 'application/json',
        'Connection': 'close'
      });
      res.end(JSON.stringify({
        error: 'Payload Too Large',
        message: `Declared payload size (${contentLength} bytes) exceeds maximum permitted size of ${maxBytes} bytes`,
        max_bytes: maxBytes
      }));
      if (req.socket) req.socket.destroy();
      const err = new Error('PAYLOAD_TOO_LARGE');
      err.statusCode = 413;
      return reject(err);
    }

    req.on('data', chunk => {
      if (isTerminated) return;
      receivedBytes += chunk.length;

      if (receivedBytes > maxBytes) {
        isTerminated = true;
        req.pause();
        res.writeHead(413, {
          'Content-Type': 'application/json',
          'Connection': 'close'
        });
        res.end(JSON.stringify({
          error: 'Payload Too Large',
          message: `Payload stream exceeded maximum permitted size of ${maxBytes} bytes`,
          max_bytes: maxBytes
        }));
        if (req.socket) req.socket.destroy();
        const err = new Error('PAYLOAD_TOO_LARGE');
        err.statusCode = 413;
        return reject(err);
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (isTerminated) return;
      const bodyBuffer = Buffer.concat(chunks);

      const contentType = req.headers['content-type'] || '';

      // 1. Multipart/form-data
      if (contentType.includes('multipart/form-data')) {
        const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
        if (!boundaryMatch) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Bad Request', message: 'Missing multipart boundary' }));
          const err = new Error('MISSING_MULTIPART_BOUNDARY');
          err.statusCode = 400;
          return reject(err);
        }
        const boundary = boundaryMatch[1].trim().replace(/^['"](.*)['"]$/, '$1');
        const { fields, file } = parseMultipartBuffer(bodyBuffer, boundary);
        return resolve({
          case_id: fields.case_id || fields.caseId || req.headers['x-case-id'],
          filename: file ? file.filename : fields.filename,
          mimeType: file ? file.mimeType : (fields.mime_type || fields.mimeType),
          buffer: file ? file.buffer : Buffer.alloc(0)
        });
      }

      // 2. Application/JSON (Base64 file payload)
      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(bodyBuffer.toString('utf8'));
          const b64 = parsed.file_base64 || parsed.fileBase64 || '';
          const buf = Buffer.from(b64, 'base64');
          return resolve({
            case_id: parsed.case_id || parsed.caseId || req.headers['x-case-id'],
            filename: parsed.filename,
            mimeType: parsed.mime_type || parsed.mimeType,
            buffer: buf
          });
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Bad Request', message: 'Malformed JSON payload' }));
          const parseErr = new Error('MALFORMED_JSON');
          parseErr.statusCode = 400;
          return reject(parseErr);
        }
      }

      // 3. Raw Binary / Octet-Stream with custom headers
      const caseId = req.headers['x-case-id'];
      const filename = req.headers['x-filename'] || 'document_upload';
      resolve({
        case_id: caseId,
        filename,
        mimeType: contentType,
        buffer: bodyBuffer
      });
    });

    req.on('error', err => {
      if (isTerminated) return;
      reject(err);
    });
  });
}

function parseRawBody(req, res, maxBytes = 32768) {
  return new Promise((resolve, reject) => {
    let receivedBytes = 0;
    const chunks = [];
    let isTerminated = false;

    req.on('data', chunk => {
      if (isTerminated) return;
      receivedBytes += chunk.length;

      if (receivedBytes > maxBytes) {
        isTerminated = true;
        req.pause();
        res.writeHead(413, {
          'Content-Type': 'application/json',
          'Connection': 'close'
        });
        res.end(JSON.stringify({
          error: 'Payload Too Large',
          message: `Payload exceeds maximum permitted size of ${maxBytes} bytes`,
          max_bytes: maxBytes
        }));
        if (req.socket) req.socket.destroy();
        const err = new Error('PAYLOAD_TOO_LARGE');
        err.statusCode = 413;
        return reject(err);
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (isTerminated) return;
      const rawBody = Buffer.concat(chunks).toString('utf8');
      resolve(rawBody);
    });

    req.on('error', err => {
      if (isTerminated) return;
      reject(err);
    });
  });
}

module.exports = {
  parseJsonBody,
  parseRawBody,
  parseDocumentUpload
};

