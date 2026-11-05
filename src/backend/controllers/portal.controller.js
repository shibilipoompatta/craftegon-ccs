/**
 * CraftEgon CCS - Portal Controller
 * Authenticated client cases and staff case management with strict RLS tenant isolation
 * Backed by CaseRepository (PostgreSQL or In-Memory)
 */

const fs = require('node:fs');
const path = require('node:path');
const { requireAuth } = require('../middleware/auth-guard');
const { caseRepository } = require('../storage/case-repository');
const { accountRepository } = require('../storage/account-repository');
const { canTransition } = require('../models/state-machines');

// Load Phase 2 service registry safely
function loadServiceRegistry() {
  const possiblePaths = [
    path.resolve(__dirname, '../../../data/service-registry.json'),
    path.resolve(__dirname, '../../data/service-registry.json'),
    path.resolve(process.cwd(), 'data/service-registry.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {
        // Continue searching
      }
    }
  }
  return [];
}

const referralRoutes = new Set([
  '/services/director-removal-board-disputes.html',
  '/services/nclt-insolvency-defense.html',
  '/services/oppression-mismanagement-petitions.html',
  'director-removal-board-disputes.html',
  'nclt-insolvency-defense.html',
  'oppression-mismanagement-petitions.html',
  'director-removal',
  'nclt-insolvency',
  'oppression-mismanagement'
]);

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

async function handleCreateCase(req, res, config, body) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (!body || typeof body !== 'object') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'Request body must be a valid JSON object' }));
  }

  if (!body.service_id || typeof body.service_id !== 'string' || !body.service_id.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'service_id is required' }));
  }

  const reqService = String(body.service_id).trim();
  const registry = loadServiceRegistry();

  const matchedService = registry.find(s =>
    s.service_id === reqService ||
    s.canonical_route === reqService ||
    (s.canonical_route && s.canonical_route.endsWith(reqService)) ||
    (s.service_name && s.service_name.toLowerCase() === reqService.toLowerCase())
  );

  // Enforce Advocates Act 1961 boundary: referral-only services cannot be direct cases
  if (referralRoutes.has(reqService) || (matchedService && matchedService.record_status === 'REFERRAL_ONLY')) {
    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Unprocessable Entity',
      message: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
    }));
  }

  if (!matchedService || matchedService.record_status !== 'ACTIVE_SERVICE') {
    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Unprocessable Entity',
      message: `Unknown or inactive service identifier '${reqService}'`
    }));
  }

  // Never trust client-supplied client_id, account ID, role, assigned operator or privileged status
  if (body.client_id && body.client_id !== user.user_id && !['compliance_operator', 'managing_partner'].includes(user.role)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Cannot create case on behalf of another client entity'
    }));
  }

  const clientId = ['compliance_operator', 'managing_partner'].includes(user.role) && body.client_id
    ? body.client_id
    : user.user_id;

  const title = (body.title && typeof body.title === 'string' && body.title.trim())
    ? body.title.trim().slice(0, 200)
    : matchedService.service_name;

  const priority = ['STANDARD', 'PRIORITY', 'EXPEDITED'].includes(body.priority)
    ? body.priority
    : 'STANDARD';

  try {
    const caseItem = await caseRepository.createCase({
      client_id: clientId,
      service_id: matchedService.service_id,
      vertical_id: matchedService.primary_vertical_id,
      title,
      status: 'IN_PROGRESS',
      priority,
      statutory_deadline: body.statutory_deadline || null
    }, { userId: user.user_id, role: user.role });

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Service request submitted and case created successfully',
      case: {
        id: caseItem.id,
        case_reference: caseItem.case_reference,
        client_id: caseItem.client_id,
        service_id: caseItem.service_id,
        vertical_id: caseItem.vertical_id,
        title: caseItem.title,
        status: caseItem.status,
        priority: caseItem.priority,
        assigned_officer_id: caseItem.assigned_officer_id,
        statutory_deadline: caseItem.statutory_deadline,
        created_at: caseItem.created_at
      }
    }));
  } catch (err) {
    const status = err.statusCode || 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
  }
}

async function handleUpdateCase(req, res, ref, config, body) {
  const user = await requireAuth(req, res, ['compliance_operator', 'managing_partner']);
  if (!user) return;

  if (!body || typeof body !== 'object') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'Request body must be a valid JSON object' }));
  }

  const targetOfficerId = body.assigned_officer_id !== undefined ? body.assigned_officer_id : body.assigned_to;
  if (!body.status && targetOfficerId === undefined) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'At least one of "status" or "assigned_officer_id" is required' }));
  }

  // Validate target operator if assigning
  if (targetOfficerId) {
    const officer = await accountRepository.findById(targetOfficerId);
    if (!officer || !['compliance_operator', 'managing_partner'].includes(officer.account_role) || officer.is_active === false) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Bad Request',
        message: 'Target assigned operator must be an active, authorized staff account'
      }));
    }
  }

  // Fetch existing case first
  const existing = await caseRepository.getCase(ref, { userId: user.user_id, role: user.role });
  if (!existing) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not Found', message: `Case '${ref}' not found` }));
  }

  if (body.status && !canTransition('case', existing.status, body.status)) {
    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Unprocessable Entity',
      message: `INVALID_TRANSITION: Cannot transition case from ${existing.status} to ${body.status}`
    }));
  }

  try {
    const updated = await caseRepository.updateCase(ref, {
      status: body.status,
      assigned_officer_id: targetOfficerId
    }, { userId: user.user_id, role: user.role });

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

// Backwards-compatible alias for existing test suites
async function handleUpdateCaseStatus(req, res, ref, config, body) {
  return handleUpdateCase(req, res, ref, config, body);
}

async function handleListStaff(req, res, config) {
  const user = await requireAuth(req, res, ['compliance_operator', 'managing_partner']);
  if (!user) return;

  const staff = await accountRepository.listStaff({ userId: user.user_id, role: user.role });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    total: staff.length,
    staff,
    operators: staff
  }));
}

module.exports = {
  handleListCases,
  handleGetCase,
  handleCreateCase,
  handleUpdateCase,
  handleUpdateCaseStatus,
  handleListStaff
};
