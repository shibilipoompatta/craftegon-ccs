/**
 * CraftEgon CCS - Portal Controller
 * Authenticated client cases and staff case management with strict RLS tenant isolation
 * Backed by CaseRepository (PostgreSQL or In-Memory)
 */

const { requireAuth } = require('../middleware/auth-guard');
const { caseRepository } = require('../storage/case-repository');

async function handleListCases(req, res, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const statusFilter = url.searchParams.get('status') || null;
  const verticalFilter = url.searchParams.get('vertical_id') || null;

  const filters = {};
  if (statusFilter) filters.status = statusFilter;
  if (verticalFilter) filters.vertical_id = verticalFilter;

  const cases = await caseRepository.listCases(
    { userId: user.user_id, role: user.role },
    filters
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    total: cases.length,
    cases
  }));
}

async function handleGetCase(req, res, ref, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const caseItem = await caseRepository.getCase(ref, { userId: user.user_id, role: user.role });
  if (!caseItem) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Case '${ref}' not found or access denied by Row-Level Security policy`
    }));
  }

  // Also fetch clean documents associated with this case
  const documents = await caseRepository.listCaseDocuments(caseItem.id, { userId: user.user_id, role: user.role });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    case: caseItem,
    documents
  }));
}

async function handleUpdateCaseStatus(req, res, ref, config, body) {
  const user = await requireAuth(req, res, ['compliance_operator', 'managing_partner']);
  if (!user) return;

  if (!body || !body.status) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'Target status is required' }));
  }

  try {
    const updated = await caseRepository.updateCaseStatus(ref, body.status, { userId: user.user_id, role: user.role });
    if (!updated) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not Found', message: `Case '${ref}' not found` }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, case: updated }));
  } catch (err) {
    const status = err.statusCode || 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = {
  handleListCases,
  handleGetCase,
  handleUpdateCaseStatus
};
