/**
 * CraftEgon CCS - Regulatory Controller
 * Handles regulatory source catalog, compliance event lookup,
 * business profile applicability evaluations, and trademark clearance queries.
 */

const { regulatoryService } = require('../regulatory/regulatory-service');
const { ProvenanceManager } = require('../regulatory/provenance-manager');

async function handleListSources(req, res, config) {
  const sources = await regulatoryService.listSources();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    total_sources: sources.length,
    sources
  }));
}

async function handleListEvents(req, res, config) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const domain = url.searchParams.get('domain') || null;
  const jurisdiction = url.searchParams.get('jurisdiction') || null;
  const authority = url.searchParams.get('authority') || null;
  const entityType = url.searchParams.get('entity_type') || null;

  const events = regulatoryService.listEvents({
    domain,
    jurisdiction,
    authority,
    entity_type: entityType
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    total: events.length,
    events
  }));
}

async function handleGetEvent(req, res, eventId, config) {
  const event = regulatoryService.getEventById(eventId);
  if (!event) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Compliance event '${eventId}' does not exist in canonical registry`
    }));
  }

  // Include staleness evaluation
  const freshness = ProvenanceManager.evaluateFreshness(event.last_checked_at, 48);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    event,
    freshness_evaluation: freshness
  }));
}

async function handleEvaluateApplicability(req, res, config, body) {
  if (!body || typeof body !== 'object') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Request body must contain corporate profile facts'
    }));
  }

  const result = regulatoryService.evaluateProfile(body);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    evaluation: result
  }));
}

async function handleRegulatoryLookup(req, res, config) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const domain = url.searchParams.get('domain') || null;
  const entityType = url.searchParams.get('entity_type') || null;
  const formName = url.searchParams.get('form_name') || null;

  const result = await regulatoryService.executeLookup({
    domain,
    entity_type: entityType,
    form_name: formName
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    lookup: result
  }));
}

async function handleTrademarkSearch(req, res, config) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const wordmark = url.searchParams.get('wordmark') || url.searchParams.get('query') || '';
  const niceClass = url.searchParams.get('class') || null;

  try {
    const result = await regulatoryService.searchTrademark({
      wordmark,
      class: niceClass
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      result
    }));
  } catch (err) {
    const status = err.statusCode || 400;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Trademark Search Error',
      message: err.message
    }));
  }
}

module.exports = {
  handleListSources,
  handleListEvents,
  handleGetEvent,
  handleEvaluateApplicability,
  handleRegulatoryLookup,
  handleTrademarkSearch
};
