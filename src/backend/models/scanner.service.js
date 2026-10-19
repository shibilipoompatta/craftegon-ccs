/**
 * CraftEgon CCS - Malware & Antivirus Scanning Service
 * Supports EICAR signature detection, heuristic payload inspection, and optional ClamAV daemon TCP integration.
 * Zero external npm dependencies.
 */

const net = require('node:net');

// Standard EICAR Antivirus Test Signature (used globally for testing AV engines safely)
const EICAR_TEST_SIGNATURE = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// Embedded malicious payload patterns
const SUSPICIOUS_PATTERNS = [
  { name: 'Embedded-Script-Tag', regex: /<script[\s\S]*?>/i },
  { name: 'JavaScript-URI-Scheme', regex: /javascript:\s*[\w(]/i },
  { name: 'Embedded-Iframe-Injection', regex: /<iframe[\s\S]*?>/i },
  { name: 'VBScript-Injection', regex: /vbscript:\s*[\w(]/i },
  { name: 'Executable-Shellcode-Marker', regex: /\x4D\x5A\x90\x00\x03/ }, // PE header sequence
  { name: 'Null-Byte-Attack', regex: /\x00{16,}/ } // Excessive null block injection in small files
];

class MalwareScannerService {
  constructor(options = {}) {
    this.clamavHost = options.clamavHost || process.env.CLAMAV_HOST || '127.0.0.1';
    this.clamavPort = parseInt(options.clamavPort || process.env.CLAMAV_PORT || '3310', 10);
    this.timeoutMs = options.timeoutMs || 2000;
    this.forceFailure = false;
  }

  setForceFailure(flag) {
    this.forceFailure = Boolean(flag);
  }

  /**
   * Scan buffer for malware, viruses, and hostile script injections
   */
  async scanBuffer(buffer, metadata = {}) {
    const startTime = Date.now();

    if (this.forceFailure) {
      return {
        clean: false,
        threatsFound: 1,
        threatNames: ['SIMULATED_SCANNER_FAULT'],
        engine: 'simulation',
        scanDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    if (!Buffer.isBuffer(buffer)) {
      throw new Error('INVALID_SCAN_TARGET: Target must be a binary Buffer');
    }

    // 1. Try local ClamAV daemon if available
    const clamavResult = await this._tryClamavScan(buffer);
    if (clamavResult !== null) {
      clamavResult.scanDurationMs = Date.now() - startTime;
      clamavResult.timestamp = new Date().toISOString();
      return clamavResult;
    }

    // 2. Built-in Heuristic & EICAR Engine
    return this._runBuiltInHeuristicScan(buffer, startTime);
  }

  _runBuiltInHeuristicScan(buffer, startTime) {
    const threats = [];
    const bufferStr = buffer.toString('utf8', 0, Math.min(buffer.length, 65536)); // inspect first 64KB as text

    // Check EICAR
    if (bufferStr.includes(EICAR_TEST_SIGNATURE)) {
      threats.push('Eicar-Test-Signature');
    }

    // Check suspicious script injections in non-HTML document files
    for (const pat of SUSPICIOUS_PATTERNS) {
      if (pat.regex.test(bufferStr)) {
        threats.push(pat.name);
      }
    }

    const clean = threats.length === 0;

    return {
      clean,
      threatsFound: threats.length,
      threatNames: threats,
      engine: 'built_in_heuristic',
      scanDurationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Attempt TCP scan via ClamAV INSTREAM protocol
   */
  _tryClamavScan(buffer) {
    return new Promise(resolve => {
      const socket = new net.Socket();
      let response = '';
      let hasError = false;

      socket.setTimeout(this.timeoutMs);

      socket.on('connect', () => {
        // ClamAV INSTREAM protocol: 'zINSTREAM\0' followed by length-prefixed chunks, then 0-length chunk
        try {
          socket.write(Buffer.from('zINSTREAM\0'));

          const chunkSize = 2048;
          for (let i = 0; i < buffer.length; i += chunkSize) {
            const chunk = buffer.subarray(i, Math.min(i + chunkSize, buffer.length));
            const lenBuf = Buffer.alloc(4);
            lenBuf.writeUInt32BE(chunk.length, 0);
            socket.write(lenBuf);
            socket.write(chunk);
          }

          // Terminate stream with 4 zero bytes
          const zeroBuf = Buffer.alloc(4, 0);
          socket.write(zeroBuf);
        } catch (e) {
          hasError = true;
          socket.destroy();
          resolve(null);
        }
      });

      socket.on('data', data => {
        response += data.toString('utf8');
      });

      socket.on('end', () => {
        if (hasError) return;
        // Parse ClamAV output: e.g. "stream: OK" or "stream: Win.Test.EICAR_HDB-1 FOUND"
        if (response.includes('FOUND')) {
          const match = response.match(/stream:\s*(.+?)\s*FOUND/i);
          const threatName = match ? match[1].trim() : 'ClamAV-Detected-Threat';
          resolve({
            clean: false,
            threatsFound: 1,
            threatNames: [threatName],
            engine: 'clamav_daemon'
          });
        } else if (response.includes('OK')) {
          resolve({
            clean: true,
            threatsFound: 0,
            threatNames: [],
            engine: 'clamav_daemon'
          });
        } else {
          resolve(null); // unexpected output, fallback
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });

      socket.on('error', () => {
        // ClamAV daemon is offline or not installed in local environment
        socket.destroy();
        resolve(null);
      });
    });
  }
}

const scannerService = new MalwareScannerService();

module.exports = {
  EICAR_TEST_SIGNATURE,
  MalwareScannerService,
  scannerService
};
