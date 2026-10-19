/**
 * CraftEgon CCS - Core HTTP Server Baseline
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const http = require('node:http');
const { loadConfig } = require('./config');
const { applySecurityHeaders } = require('./middleware/security-headers');
const { routeRequest } = require('./router');
const { postgresClient } = require('./storage/postgres-client');
const { enquiryRepository, PostgresEnquiryStorage, InMemoryEnquiryStorage } = require('./storage/enquiry-repository');
const { accountRepository, PostgresAccountStorage, InMemoryAccountStorage } = require('./storage/account-repository');
const { caseRepository, PostgresCaseStorage, InMemoryCaseStorage } = require('./storage/case-repository');
const { documentRepository, PostgresDocumentStorage, InMemoryDocumentStorage } = require('./storage/document-repository');
const { orderRepository, PostgresOrderStorage, InMemoryOrderStorage } = require('./storage/order-repository');

function configureStorageAdapters(config) {
  if (config.databaseProvider === 'postgresql') {
    enquiryRepository.setAdapter(new PostgresEnquiryStorage(postgresClient));
    accountRepository.setAdapter(new PostgresAccountStorage(postgresClient));
    caseRepository.setAdapter(new PostgresCaseStorage(postgresClient));
    documentRepository.setAdapter(new PostgresDocumentStorage(postgresClient));
    orderRepository.setAdapter(new PostgresOrderStorage(postgresClient));
  } else {
    enquiryRepository.setAdapter(new InMemoryEnquiryStorage());
    accountRepository.setAdapter(new InMemoryAccountStorage());
    caseRepository.setAdapter(new InMemoryCaseStorage());
    documentRepository.setAdapter(new InMemoryDocumentStorage());
    orderRepository.setAdapter(new InMemoryOrderStorage());
  }
}

function createServer(configOverrides = {}) {
  const config = loadConfig(configOverrides);
  configureStorageAdapters(config);

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
    start: () => new Promise((resolve) => {
      server.listen(config.port, config.host, () => {
        resolve({ port: config.port, host: config.host });
      });
    }),
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
  configureStorageAdapters
};
