/**
 * CraftEgon Corporate Services (CCS) - Admin Services Controller
 * Server-verified administration, full service lifecycle management, pricing,
 * features, confirmation-gated deletions, and controlled publishing workflow.
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { requireAuth } = require('../middleware/auth-guard');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const SERVICE_REGISTRY_FILE = path.join(DATA_DIR, 'service-registry.json');
const PRICING_FILE = path.join(DATA_DIR, 'pricing.json');
const SEARCH_INDEX_JSON_FILE = path.join(DATA_DIR, 'search-index.json');
const SEARCH_INDEX_JS_FILE = path.resolve(__dirname, '../../../assets/js/search-index.js');
const VERTICALS_FILE = path.join(DATA_DIR, 'verticals.json');

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

function readJsonFile(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`[AdminController] Error reading ${filePath}:`, err.message);
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  const tmpFile = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, filePath);
}

function sendJson(res, statusCode, data) {
  if (res.headersSent) return;
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * GET /api/v1/admin/me
 * Verifies admin authentication session and returns current operator profile
 */
async function handleAdminMe(req, res, config) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return; // Response sent by requireAuth

  return sendJson(res, 200, {
    authenticated: true,
    user: {
      id: user.userId || user.id,
      email: user.email || user.primary_email,
      role: user.role,
      legal_entity_name: user.legal_entity_name || 'CraftEgon Management Console'
    }
  });
}

/**
 * GET /api/v1/admin/services
 * Lists all services merged with pricing and status, supporting search and filtering
 */
async function handleListServices(req, res, config, queryParams = {}) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  const registry = readJsonFile(SERVICE_REGISTRY_FILE, []);
  const pricingList = readJsonFile(PRICING_FILE, []);
  const verticalsList = readJsonFile(VERTICALS_FILE, []);
  const searchIndexList = readJsonFile(SEARCH_INDEX_JSON_FILE, []);

  // Map pricing by service_id
  const pricingMap = new Map();
  for (const p of pricingList) {
    if (p.service_id) {
      pricingMap.set(p.service_id, p);
    }
  }

  // Map search index by id and route
  const searchMap = new Map();
  const searchByRoute = new Map();
  for (const s of searchIndexList) {
    if (s.id) {
      searchMap.set(s.id, s);
    }
    if (s.route) {
      searchByRoute.set(s.route, s);
    }
  }

  // Vertical lookup
  const verticalMap = new Map();
  for (const v of verticalsList) {
    verticalMap.set(v.vertical_id, v.vertical_name);
  }

  // Combine and format services (54 canonical + 3 referral services = 57 canonical services)
  let services = registry
    .filter(item => item.record_status !== 'UTILITY_ROUTE' && (item.service_id || item.record_status === 'REFERRAL_ONLY'))
    .map(reg => {
      const s = (reg.service_id ? searchMap.get(reg.service_id) : searchByRoute.get(reg.canonical_route)) || {};
      const serviceId = reg.service_id || s.id || (reg.canonical_route ? reg.canonical_route.replace(/^\/services\/|\.html$/g, '') : 'UNKNOWN-SVC');
      const p = pricingMap.get(serviceId) || (reg.service_id ? pricingMap.get(reg.service_id) : {}) || {};
      const vertId = reg.primary_vertical_id || s.vertical_id || 'V10';
      const vertName = verticalMap.get(vertId) || s.vertical_name || 'Dispute Avoidance (Non-Litigation)';

      return {
        id: serviceId,
        name: reg.service_name || s.name,
        route: reg.canonical_route || s.route,
        vertical_id: vertId,
        vertical_name: vertName,
        status: reg.record_status || (s.is_referral ? 'REFERRAL_ONLY' : 'ACTIVE_SERVICE'),
        is_referral: Boolean(s.is_referral || reg.record_status === 'REFERRAL_ONLY'),
        business_stage: s.business_stage || 'Growth & Annual Compliance',
        category: s.category || vertName,
        description: s.description || reg.scope_boundary || '',
        entity_types: s.entity_types || ['Private Limited', 'LLP'],
        forms: s.forms || [],
        aliases: s.aliases || [],
        keywords: s.keywords || [],
        pricing: {
          amount: typeof p.amount === 'number' ? p.amount : 0,
          currency: p.currency || 'INR',
          pricing_basis: p.pricing_basis || 'STARTING_FROM',
          website_displayed_price: p.website_displayed_price || (p.amount ? `₹${p.amount.toLocaleString('en-IN')} + Govt. Fees` : 'Bespoke Quote'),
          package_title: p.package_title || `${reg.service_name} Package`,
          included_charges: p.included_charges || [],
          excluded_charges: p.excluded_charges || [],
          verification_status: p.verification_status || 'UNVERIFIED',
          commercial_approval_state: p.commercial_approval_state || 'PENDING_COMMERCIAL_APPROVAL'
        }
      };
    });

  // Apply filters if provided
  const search = (queryParams.q || queryParams.search || '').trim().toLowerCase();
  const vertFilter = (queryParams.vertical_id || '').trim();
  const statusFilter = (queryParams.status || '').trim();
  const stageFilter = (queryParams.stage || '').trim().toLowerCase();

  if (search) {
    services = services.filter(s =>
      s.id.toLowerCase().includes(search) ||
      s.name.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      (s.aliases && s.aliases.some(a => a.toLowerCase().includes(search))) ||
      (s.forms && s.forms.some(f => f.toLowerCase().includes(search)))
    );
  }

  if (vertFilter) {
    services = services.filter(s => s.vertical_id === vertFilter);
  }

  if (statusFilter) {
    services = services.filter(s => s.status === statusFilter);
  }

  if (stageFilter) {
    services = services.filter(s => s.business_stage.toLowerCase().includes(stageFilter));
  }

  return sendJson(res, 200, {
    success: true,
    total: services.length,
    verticals: verticalsList.map(v => ({ id: v.vertical_id, name: v.vertical_name })),
    services
  });
}

/**
 * GET /api/v1/admin/services/:id
 * Retrieves full details for a single service
 */
async function handleGetService(req, res, serviceId, config) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  const registry = readJsonFile(SERVICE_REGISTRY_FILE, []);
  const pricingList = readJsonFile(PRICING_FILE, []);
  const searchIndexList = readJsonFile(SEARCH_INDEX_JSON_FILE, []);

  const reg = registry.find(r => r.service_id === serviceId || (r.canonical_route && (serviceId.includes(r.canonical_route.replace(/^\/services\/|\.html$/g, '')) || r.canonical_route.includes(serviceId))));
  if (!reg) {
    return sendJson(res, 404, { error: 'Not Found', message: `Service '${serviceId}' not found in registry` });
  }

  const p = pricingList.find(item => item.service_id === serviceId || (reg.service_id && item.service_id === reg.service_id)) || {};
  const s = searchIndexList.find(item => item.id === serviceId || (reg.canonical_route && item.route === reg.canonical_route)) || {};

  return sendJson(res, 200, {
    success: true,
    service: {
      id: reg.service_id || s.id || serviceId,
      name: reg.service_name || s.name,
      route: reg.canonical_route || s.route,
      vertical_id: reg.primary_vertical_id || s.vertical_id || 'V10',
      vertical_name: s.vertical_name || 'Dispute Avoidance (Non-Litigation)',
      status: reg.record_status || (s.is_referral ? 'REFERRAL_ONLY' : 'ACTIVE_SERVICE'),
      is_referral: Boolean(s.is_referral || reg.record_status === 'REFERRAL_ONLY'),
      business_stage: s.business_stage || 'Growth & Annual Compliance',
      description: s.description || reg.scope_boundary || '',
      entity_types: s.entity_types || [],
      forms: s.forms || [],
      aliases: s.aliases || [],
      keywords: s.keywords || [],
      pricing: {
        pricing_id: p.pricing_id || `PRC-${reg.service_id}`,
        amount: typeof p.amount === 'number' ? p.amount : 0,
        currency: p.currency || 'INR',
        pricing_basis: p.pricing_basis || 'STARTING_FROM',
        price_category: p.price_category || 'PROFESSIONAL_FEE',
        website_displayed_price: p.website_displayed_price || (p.amount ? `₹${p.amount.toLocaleString('en-IN')} + Govt. Fees` : 'Bespoke Quote'),
        package_title: p.package_title || `${reg.service_name} Package`,
        included_charges: p.included_charges || [],
        excluded_charges: p.excluded_charges || [],
        commercial_approval_state: p.commercial_approval_state || 'PENDING_COMMERCIAL_APPROVAL',
        verification_status: p.verification_status || 'UNVERIFIED',
        tax_inclusion_status: p.tax_inclusion_status || 'UNCONFIRMED'
      }
    }
  });
}

/**
 * POST /api/v1/admin/services
 * Creates a new service in draft / registry
 */
async function handleCreateService(req, res, config, body) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  if (!body || !body.name || !body.vertical_id) {
    return sendJson(res, 400, {
      error: 'Bad Request',
      message: 'Service name and vertical_id are required'
    });
  }

  const registry = readJsonFile(SERVICE_REGISTRY_FILE, []);
  const pricingList = readJsonFile(PRICING_FILE, []);
  const searchIndexList = readJsonFile(SEARCH_INDEX_JSON_FILE, []);
  const verticalsList = readJsonFile(VERTICALS_FILE, []);

  // Validate vertical ID
  const vert = verticalsList.find(v => v.vertical_id === body.vertical_id);
  if (!vert) {
    return sendJson(res, 400, {
      error: 'Bad Request',
      message: `Invalid vertical_id '${body.vertical_id}'. Must be one of V01 to V15.`
    });
  }

  // Generate or sanitize service ID
  let serviceId = (body.id || body.service_id || '').trim().toUpperCase();
  if (!serviceId) {
    // Generate sequential ID for this vertical
    const existingForVert = registry.filter(r => r.service_id && r.service_id.startsWith(`${body.vertical_id}-SVC-`));
    const nextNum = existingForVert.length + 1;
    serviceId = `${body.vertical_id}-SVC-${String(nextNum).padStart(3, '0')}`;
  }

  // Check uniqueness
  if (registry.some(r => r.service_id === serviceId)) {
    return sendJson(res, 409, {
      error: 'Conflict',
      message: `Service with ID '${serviceId}' already exists.`
    });
  }

  // Slug route
  const slug = (body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  const route = body.route || `/services/${slug}.html`;

  const newRegistryEntry = {
    canonical_route: route,
    service_id: serviceId,
    service_name: String(body.name).trim(),
    record_status: body.is_referral ? 'REFERRAL_ONLY' : (body.status || 'ACTIVE_SERVICE'),
    primary_vertical_id: body.vertical_id,
    related_vertical_ids: body.related_vertical_ids || [],
    scope_boundary: body.description || `Canonical corporate service for ${vert.vertical_name}.`,
    source_evidence: `Admin creation via Dashboard by ${user.email} on ${new Date().toISOString()}`,
    verification_status: 'VERIFIED_APPROVED'
  };

  const amount = typeof body.pricing?.amount === 'number' ? body.pricing.amount : (parseInt(body.amount, 10) || 4999);
  const newPricingEntry = {
    pricing_id: `PRC-${serviceId}`,
    service_id: serviceId,
    service_name: newRegistryEntry.service_name,
    canonical_route: route,
    primary_vertical_id: body.vertical_id,
    currency: 'INR',
    amount: amount,
    pricing_basis: body.pricing?.pricing_basis || 'STARTING_FROM',
    price_category: 'PROFESSIONAL_FEE',
    jurisdiction: 'IN-CENTRAL',
    website_displayed_price: body.pricing?.website_displayed_price || `₹${amount.toLocaleString('en-IN')} + Govt. Fees`,
    package_title: body.pricing?.package_title || `${newRegistryEntry.service_name} Package`,
    website_price_type: 'STARTING_PRICE_PLUS_DISBURSEMENTS',
    included_charges: body.pricing?.included_charges || body.inclusions || ['Statutory Consultation', 'Procedural Documentation', 'Portal Filing Support'],
    excluded_charges: body.pricing?.excluded_charges || body.exclusions || ['Government statutory portal filing fees (payable at actuals)'],
    additional_tiers: [],
    statutory_thresholds: [],
    statutory_penalties: [],
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: null,
    source_id: 'SRC-ADMIN-CONSOLE',
    evidence_source: 'ADMIN_CONSOLE_MANAGEMENT',
    verification_status: 'VERIFIED',
    evidence_state: 'ADMIN_CONFIRMED',
    commercial_approval_state: 'COMMERCIALLY_APPROVED',
    last_verified_at: new Date().toISOString(),
    checked_date: new Date().toISOString().split('T')[0],
    notes: `Provisioned via CraftEgon Admin Console by ${user.email}`,
    tax_inclusion_status: 'TAXES_EXCLUSIVE_18_GST',
    commercial_package_caps: []
  };

  const searchTokens = `${newRegistryEntry.service_name} ${serviceId} ${vert.vertical_name} ${body.business_stage || ''} ${(body.aliases || []).join(' ')} ${(body.keywords || []).join(' ')} ${(body.entity_types || []).join(' ')}`.toLowerCase();

  const newSearchEntry = {
    id: serviceId,
    name: newRegistryEntry.service_name,
    route: route,
    h1: newRegistryEntry.service_name,
    vertical_id: body.vertical_id,
    vertical_name: vert.vertical_name,
    status: body.is_referral ? 'REFERRAL_ONLY' : 'DIRECT_SERVICE',
    display_status: body.is_referral ? 'Independent Counsel Referral' : 'Direct Regulatory Service',
    is_referral: Boolean(body.is_referral),
    business_stage: body.business_stage || 'Growth & Annual Compliance',
    entity_types: body.entity_types || ['Private Limited', 'LLP'],
    forms: body.forms || [],
    aliases: body.aliases || [newRegistryEntry.service_name],
    keywords: body.keywords || ['compliance', 'corporate', 'registration'],
    description: body.description || newRegistryEntry.scope_boundary,
    search_tokens: searchTokens
  };

  // Add to arrays
  registry.push(newRegistryEntry);
  pricingList.push(newPricingEntry);
  searchIndexList.push(newSearchEntry);

  writeJsonFile(SERVICE_REGISTRY_FILE, registry);
  writeJsonFile(PRICING_FILE, pricingList);
  writeJsonFile(SEARCH_INDEX_JSON_FILE, searchIndexList);

  return sendJson(res, 201, {
    success: true,
    message: `Service '${serviceId}' created successfully`,
    service_id: serviceId,
    route: route
  });
}

/**
 * PUT /api/v1/admin/services/:id
 * Updates an existing service, its features, pricing, and boundaries
 */
async function handleUpdateService(req, res, serviceId, config, body) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  if (!body) {
    return sendJson(res, 400, { error: 'Bad Request', message: 'Update payload required' });
  }

  const registry = readJsonFile(SERVICE_REGISTRY_FILE, []);
  const pricingList = readJsonFile(PRICING_FILE, []);
  const searchIndexList = readJsonFile(SEARCH_INDEX_JSON_FILE, []);
  const verticalsList = readJsonFile(VERTICALS_FILE, []);

  const regIndex = registry.findIndex(r => r.service_id === serviceId);
  if (regIndex === -1) {
    return sendJson(res, 404, { error: 'Not Found', message: `Service '${serviceId}' not found` });
  }

  // Update registry entry
  if (body.name) registry[regIndex].service_name = String(body.name).trim();
  if (body.vertical_id) {
    const vert = verticalsList.find(v => v.vertical_id === body.vertical_id);
    if (!vert) {
      return sendJson(res, 400, { error: 'Bad Request', message: `Invalid vertical_id '${body.vertical_id}'` });
    }
    registry[regIndex].primary_vertical_id = body.vertical_id;
  }
  if (body.status) registry[regIndex].record_status = body.status;
  if (body.description) registry[regIndex].scope_boundary = String(body.description).trim();
  if (body.route) registry[regIndex].canonical_route = String(body.route).trim();

  // Update pricing entry
  let pricingEntry = pricingList.find(p => p.service_id === serviceId);
  if (pricingEntry) {
    if (body.name) pricingEntry.service_name = String(body.name).trim();
    if (body.vertical_id) pricingEntry.primary_vertical_id = body.vertical_id;
    if (body.pricing) {
      if (typeof body.pricing.amount === 'number') pricingEntry.amount = body.pricing.amount;
      if (body.pricing.package_title) pricingEntry.package_title = body.pricing.package_title;
      if (body.pricing.website_displayed_price) pricingEntry.website_displayed_price = body.pricing.website_displayed_price;
      if (Array.isArray(body.pricing.included_charges)) pricingEntry.included_charges = body.pricing.included_charges;
      if (Array.isArray(body.pricing.excluded_charges)) pricingEntry.excluded_charges = body.pricing.excluded_charges;
      if (body.pricing.pricing_basis) pricingEntry.pricing_basis = body.pricing.pricing_basis;
      if (body.pricing.commercial_approval_state) pricingEntry.commercial_approval_state = body.pricing.commercial_approval_state;
    }
    pricingEntry.last_verified_at = new Date().toISOString();
    pricingEntry.checked_date = new Date().toISOString().split('T')[0];
  }

  // Update search index entry
  let searchEntry = searchIndexList.find(s => s.id === serviceId);
  if (searchEntry) {
    if (body.name) {
      searchEntry.name = String(body.name).trim();
      searchEntry.h1 = String(body.name).trim();
    }
    if (body.vertical_id) {
      const vert = verticalsList.find(v => v.vertical_id === body.vertical_id);
      if (vert) {
        searchEntry.vertical_id = vert.vertical_id;
        searchEntry.vertical_name = vert.vertical_name;
      }
    }
    if (body.description) searchEntry.description = String(body.description).trim();
    if (body.business_stage) searchEntry.business_stage = body.business_stage;
    if (body.is_referral !== undefined) {
      searchEntry.is_referral = Boolean(body.is_referral);
      searchEntry.status = body.is_referral ? 'REFERRAL_ONLY' : 'DIRECT_SERVICE';
      searchEntry.display_status = body.is_referral ? 'Independent Counsel Referral' : 'Direct Regulatory Service';
    }
    if (Array.isArray(body.entity_types)) searchEntry.entity_types = body.entity_types;
    if (Array.isArray(body.forms)) searchEntry.forms = body.forms;
    if (Array.isArray(body.aliases)) searchEntry.aliases = body.aliases;
    if (Array.isArray(body.keywords)) searchEntry.keywords = body.keywords;

    searchEntry.search_tokens = `${searchEntry.name} ${searchEntry.id} ${searchEntry.vertical_name} ${searchEntry.business_stage} ${(searchEntry.aliases || []).join(' ')} ${(searchEntry.keywords || []).join(' ')} ${(searchEntry.entity_types || []).join(' ')}`.toLowerCase();
  }

  writeJsonFile(SERVICE_REGISTRY_FILE, registry);
  writeJsonFile(PRICING_FILE, pricingList);
  writeJsonFile(SEARCH_INDEX_JSON_FILE, searchIndexList);

  return sendJson(res, 200, {
    success: true,
    message: `Service '${serviceId}' updated successfully`,
    service_id: serviceId
  });
}

/**
 * DELETE /api/v1/admin/services/:id
 * Confirmation-gated deactivation or deletion of a service
 */
async function handleDeleteService(req, res, serviceId, config, body = {}) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  // STRICT SAFETY GUARD: Confirmation check
  const confirmCode = (body.confirm_code || body.confirm || '').trim();
  if (confirmCode !== serviceId && confirmCode !== 'CONFIRM') {
    return sendJson(res, 400, {
      error: 'Confirmation Required',
      message: `Destructive action blocked. You must provide confirm_code: '${serviceId}' to confirm deletion/deactivation.`
    });
  }

  const registry = readJsonFile(SERVICE_REGISTRY_FILE, []);
  const pricingList = readJsonFile(PRICING_FILE, []);
  const searchIndexList = readJsonFile(SEARCH_INDEX_JSON_FILE, []);

  const regIndex = registry.findIndex(r => r.service_id === serviceId);
  if (regIndex === -1) {
    return sendJson(res, 404, { error: 'Not Found', message: `Service '${serviceId}' not found` });
  }

  const action = body.action || 'deactivate';

  if (action === 'deactivate') {
    // Soft deactivation (Safe recommendation)
    registry[regIndex].record_status = 'INACTIVE_SERVICE';
    const s = searchIndexList.find(item => item.id === serviceId);
    if (s) s.status = 'INACTIVE';

    writeJsonFile(SERVICE_REGISTRY_FILE, registry);
    writeJsonFile(SEARCH_INDEX_JSON_FILE, searchIndexList);

    return sendJson(res, 200, {
      success: true,
      action: 'deactivated',
      message: `Service '${serviceId}' marked INACTIVE successfully.`
    });
  } else {
    // Hard deletion: Filter out of registry, pricing, and search index
    const updatedRegistry = registry.filter(r => r.service_id !== serviceId);
    const updatedPricing = pricingList.filter(p => p.service_id !== serviceId);
    const updatedSearch = searchIndexList.filter(s => s.id !== serviceId);

    writeJsonFile(SERVICE_REGISTRY_FILE, updatedRegistry);
    writeJsonFile(PRICING_FILE, updatedPricing);
    writeJsonFile(SEARCH_INDEX_JSON_FILE, updatedSearch);

    return sendJson(res, 200, {
      success: true,
      action: 'deleted',
      message: `Service '${serviceId}' permanently removed from catalog.`
    });
  }
}

/**
 * POST /api/v1/admin/publish
 * Controlled publishing workflow: validates integrity, creates timestamped snapshot,
 * updates runtime catalog and regenerates client search-index.js
 */
async function handlePublishChanges(req, res, config) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  ensureBackupsDir();

  const registry = readJsonFile(SERVICE_REGISTRY_FILE, []);
  const pricingList = readJsonFile(PRICING_FILE, []);
  const searchIndexList = readJsonFile(SEARCH_INDEX_JSON_FILE, []);
  const verticalsList = readJsonFile(VERTICALS_FILE, []);

  // Validation 1: Verticals integrity (All 15 preserved)
  if (verticalsList.length !== 15) {
    return sendJson(res, 422, {
      error: 'Unprocessable Entity',
      message: `Integrity check failed: Expected 15 practice verticals, found ${verticalsList.length}.`
    });
  }

  // Validation 2: Service IDs uniqueness and presence
  const activeServices = registry.filter(r => r.service_id && r.record_status !== 'UTILITY_ROUTE');
  const idSet = new Set();
  for (const s of activeServices) {
    if (idSet.has(s.service_id)) {
      return sendJson(res, 422, {
        error: 'Unprocessable Entity',
        message: `Integrity check failed: Duplicate service ID '${s.service_id}'.`
      });
    }
    idSet.add(s.service_id);
  }

  // Create Snapshot Backup in data/backups/
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `services-snapshot-${timestamp}.json`;
  const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

  const backupData = {
    metadata: {
      published_by: user.email,
      timestamp: new Date().toISOString(),
      active_services_count: activeServices.length,
      pricing_records_count: pricingList.length
    },
    service_registry: registry,
    pricing: pricingList,
    search_index: searchIndexList
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

  // Re-generate assets/js/search-index.js
  const searchJsContent = `/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - CANONICAL SERVICE SEARCH INDEX
 * Published via CraftEgon Admin Console
 * Generated: ${new Date().toISOString()}
 * Operator: ${user.email}
 * ==========================================================================
 */

window.CRAFTEGON_SERVICE_CATALOG = ${JSON.stringify(searchIndexList, null, 2)};
`;

  fs.writeFileSync(SEARCH_INDEX_JS_FILE, searchJsContent, 'utf8');

  return sendJson(res, 200, {
    success: true,
    message: 'Changes validated and published to live website catalog successfully.',
    published_at: new Date().toISOString(),
    backup_file: backupFileName,
    active_services_count: activeServices.length
  });
}

/**
 * GET /api/v1/admin/backups
 * Lists all available backup snapshots
 */
async function handleListBackups(req, res, config) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  ensureBackupsDir();

  const files = fs.readdirSync(BACKUPS_DIR)
    .filter(f => f.startsWith('services-snapshot-') && f.endsWith('.json'))
    .map(f => {
      const stats = fs.statSync(path.join(BACKUPS_DIR, f));
      return {
        filename: f,
        size_bytes: stats.size,
        created_at: stats.mtime.toISOString()
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return sendJson(res, 200, {
    success: true,
    backups: files
  });
}

/**
 * POST /api/v1/admin/restore
 * Restores catalog from a selected snapshot
 */
async function handleRestoreBackup(req, res, config, body = {}) {
  const user = await requireAuth(req, res, ['managing_partner', 'admin']);
  if (!user) return;

  const filename = body.backup_file;
  const safeName = filename ? path.basename(filename) : null;
  if (!filename || safeName !== filename || !filename.startsWith('services-snapshot-') || !filename.endsWith('.json')) {
    return sendJson(res, 400, {
      error: 'Bad Request',
      message: 'Valid backup_file name required (path traversal sequences rejected)'
    });
  }

  ensureBackupsDir();
  const filePath = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return sendJson(res, 404, {
      error: 'Not Found',
      message: `Backup file '${filename}' not found`
    });
  }

  const snapshot = readJsonFile(filePath, null);
  if (!snapshot || !snapshot.service_registry || !snapshot.pricing || !snapshot.search_index) {
    return sendJson(res, 422, {
      error: 'Unprocessable Entity',
      message: 'Backup snapshot file is malformed or corrupted.'
    });
  }

  // Restore files
  writeJsonFile(SERVICE_REGISTRY_FILE, snapshot.service_registry);
  writeJsonFile(PRICING_FILE, snapshot.pricing);
  writeJsonFile(SEARCH_INDEX_JSON_FILE, snapshot.search_index);

  // Regenerate search-index.js
  const searchJsContent = `/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - CANONICAL SERVICE SEARCH INDEX
 * Restored from Snapshot: ${filename}
 * Restored: ${new Date().toISOString()} by ${user.email}
 * ==========================================================================
 */

window.CRAFTEGON_SERVICE_CATALOG = ${JSON.stringify(snapshot.search_index, null, 2)};
`;
  fs.writeFileSync(SEARCH_INDEX_JS_FILE, searchJsContent, 'utf8');

  return sendJson(res, 200, {
    success: true,
    message: `Catalog restored successfully from snapshot '${filename}'.`,
    restored_at: new Date().toISOString()
  });
}

module.exports = {
  handleAdminMe,
  handleListServices,
  handleGetService,
  handleCreateService,
  handleUpdateService,
  handleDeleteService,
  handlePublishChanges,
  handleListBackups,
  handleRestoreBackup
};
