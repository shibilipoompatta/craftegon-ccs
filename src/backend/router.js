/**
 * CraftEgon CCS - Router & Dispatcher
 * URL parsing, route matching, and controller dispatch
 */

const { handleHealth } = require('./controllers/health.controller');
const { handleCreateEnquiry, handleGetEnquiry } = require('./controllers/enquiry.controller');
const {
  handleLogin,
  handleLogout,
  handleMe,
  handleForgotPassword,
  handleResetPassword,
  handleRegister
} = require('./controllers/auth.controller');
const { handleListCases, handleGetCase, handleUpdateCaseStatus } = require('./controllers/portal.controller');
const {
  handleUploadDocument,
  handleGetDocumentDownloadUrl,
  handleDownloadDocument,
  handleListCaseDocuments,
  handleDeleteDocument
} = require('./controllers/document.controller');
const {
  handleCreateOrder,
  handleVerifyPayment,
  handleWebhook,
  handleListOrders,
  handleGetOrder
} = require('./controllers/payment.controller');
const {
  handleListSources,
  handleListEvents,
  handleGetEvent,
  handleEvaluateApplicability,
  handleRegulatoryLookup,
  handleTrademarkSearch
} = require('./controllers/regulatory.controller');
const {
  handleGetPreferences,
  handleUpdatePreferences,
  handleListAlerts,
  handleDispatchAlert,
  handleListDeliveryLogs
} = require('./controllers/alert.controller');
const {
  handleAiQuery,
  handleAiDraft,
  handleAiCorpusStats,
  handleAiTemplates,
  handleAiEvaluate
} = require('./controllers/ai.controller');
const { parseJsonBody, parseRawBody } = require('./middleware/body-parser');

async function routeRequest(req, res, config) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // 1. CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 2. Health Check
  if (pathname === '/api/v1/health' || pathname === '/health') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return handleHealth(req, res, config);
  }

  // 3. Enquiry Routes
  if (pathname === '/api/v1/enquiries') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleCreateEnquiry(req, res, config, body);
  }

  const enquiryMatch = pathname.match(/^\/api\/v1\/enquiries\/([A-Za-z0-9\-]+)$/);
  if (enquiryMatch) {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const ref = enquiryMatch[1];
    return await handleGetEnquiry(req, res, ref, config);
  }

  // 4. Auth Routes
  if (pathname === '/api/v1/auth/login') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleLogin(req, res, config, body);
  }

  if (pathname === '/api/v1/auth/logout') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleLogout(req, res);
  }

  if (pathname === '/api/v1/auth/me') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleMe(req, res);
  }

  if (pathname === '/api/v1/auth/forgot-password') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleForgotPassword(req, res, config, body);
  }

  if (pathname === '/api/v1/auth/reset-password') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleResetPassword(req, res, config, body);
  }

  if (pathname === '/api/v1/auth/register') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleRegister(req, res, config, body);
  }

  // 5. Portal & Case Routes
  if (pathname === '/api/v1/portal/cases') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleListCases(req, res, config);
  }

  const caseMatch = pathname.match(/^\/api\/v1\/portal\/cases\/([A-Za-z0-9\-]+)$/);
  if (caseMatch) {
    const ref = caseMatch[1];
    if (method === 'GET') {
      return await handleGetCase(req, res, ref, config);
    }
    if (method === 'PATCH') {
      const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
      return await handleUpdateCaseStatus(req, res, ref, config, body);
    }
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET, PATCH' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // 6. Document Routes
  if (pathname === '/api/v1/documents/upload') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleUploadDocument(req, res, config);
  }

  const caseDocsMatch = pathname.match(/^\/api\/v1\/portal\/cases\/([A-Za-z0-9\-]+)\/documents$/);
  if (caseDocsMatch) {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const caseRef = caseDocsMatch[1];
    return await handleListCaseDocuments(req, res, caseRef, config);
  }

  const docDownloadUrlMatch = pathname.match(/^\/api\/v1\/documents\/([A-Za-z0-9\-]+)\/download-url$/);
  if (docDownloadUrlMatch) {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const docId = docDownloadUrlMatch[1];
    return await handleGetDocumentDownloadUrl(req, res, docId, config);
  }

  const docDownloadMatch = pathname.match(/^\/api\/v1\/documents\/([A-Za-z0-9\-]+)\/download$/);
  if (docDownloadMatch) {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const docId = docDownloadMatch[1];
    return await handleDownloadDocument(req, res, docId, config);
  }

  const docItemMatch = pathname.match(/^\/api\/v1\/documents\/([A-Za-z0-9\-]+)$/);
  if (docItemMatch) {
    const docId = docItemMatch[1];
    if (method === 'DELETE') {
      return await handleDeleteDocument(req, res, docId, config);
    }
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'DELETE' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // 7. Payment & Subscription Routes
  if (pathname === '/api/v1/payments/create-order') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleCreateOrder(req, res, config, body);
  }

  if (pathname === '/api/v1/payments/verify') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleVerifyPayment(req, res, config, body);
  }

  if (pathname === '/api/v1/payments/webhook') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const rawBody = await parseRawBody(req, res, config.maxPayloadSizeBytes);
    return await handleWebhook(req, res, config, rawBody);
  }

  if (pathname === '/api/v1/portal/orders') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleListOrders(req, res, config);
  }

  const orderMatch = pathname.match(/^\/api\/v1\/portal\/orders\/([A-Za-z0-9\-]+)$/);
  if (orderMatch) {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const ref = orderMatch[1];
    return await handleGetOrder(req, res, ref, config);
  }

  // 8. Regulatory & Statutory Tools
  if (pathname === '/api/v1/regulatory/sources') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleListSources(req, res, config);
  }

  if (pathname === '/api/v1/regulatory/events') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleListEvents(req, res, config);
  }

  const regEventMatch = pathname.match(/^\/api\/v1\/regulatory\/events\/([A-Za-z0-9\-]+)$/);
  if (regEventMatch) {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const eventId = regEventMatch[1];
    return await handleGetEvent(req, res, eventId, config);
  }

  if (pathname === '/api/v1/regulatory/evaluate-applicability') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleEvaluateApplicability(req, res, config, body);
  }

  if (pathname === '/api/v1/regulatory/lookup') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleRegulatoryLookup(req, res, config);
  }

  if (pathname === '/api/v1/regulatory/trademark/search') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleTrademarkSearch(req, res, config);
  }

  // 9. Alert & Notification Routes
  if (pathname === '/api/v1/alerts/preferences') {
    if (method === 'GET') {
      return await handleGetPreferences(req, res, config);
    }
    if (method === 'PUT' || method === 'POST') {
      const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
      return await handleUpdatePreferences(req, res, config, body);
    }
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET, PUT, POST' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  if (pathname === '/api/v1/portal/alerts' || pathname === '/api/v1/alerts') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleListAlerts(req, res, config);
  }

  if (pathname === '/api/v1/alerts/dispatch') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleDispatchAlert(req, res, config, body);
  }

  if (pathname === '/api/v1/alerts/delivery-logs') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleListDeliveryLogs(req, res, config);
  }

  // 10. Phase 5 — AI & Legal Reasoner Routes
  if (pathname === '/api/v1/ai/query') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleAiQuery(req, res, config, body);
  }

  if (pathname === '/api/v1/ai/draft') {
    if (method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    const body = await parseJsonBody(req, res, config.maxPayloadSizeBytes);
    return await handleAiDraft(req, res, config, body);
  }

  if (pathname === '/api/v1/ai/corpus/stats') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleAiCorpusStats(req, res, config);
  }

  if (pathname === '/api/v1/ai/templates') {
    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleAiTemplates(req, res, config);
  }

  if (pathname === '/api/v1/ai/evaluate') {
    if (method !== 'GET' && method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET, POST' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return await handleAiEvaluate(req, res, config);
  }

  // 11. 404 Route Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `Endpoint '${pathname}' not recognized on CraftEgon CCS backend API`
  }));
}

module.exports = {
  routeRequest
};
