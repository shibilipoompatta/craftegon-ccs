/**
 * CraftEgon CCS — Phase 5: AI & Regulatory Reasoner Controller
 * 
 * Exposes server-side AI endpoints with:
 * - PII masking & DPDP compliance
 * - Curated statutory corpus retrieval
 * - Refusal on unverified legal facts
 * - Deterministic template drafting vs AI-assisted drafting
 * - Adversarial benchmark execution
 */

const { LegalReasoner } = require('../ai/legal-reasoner');
const { DocumentDrafter } = require('../ai/document-drafter');
const { runAdversarialEvaluations } = require('../ai/evaluations/adversarial-benchmarks');

// Singleton instances for backend runtime
const reasoner = new LegalReasoner();
const drafter = new DocumentDrafter({
  corpus: reasoner.corpus,
  privacyGuard: reasoner.privacyGuard
});

async function handleAiQuery(req, res, config, body) {
  if (!body || !body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: "Field 'prompt' is required and must be a non-empty string."
    }));
  }

  try {
    const result = await reasoner.answerQuery(body.prompt, {
      topK: body.topK,
      statuteFilter: body.statuteFilter,
      authorityFilter: body.authorityFilter,
      temperature: body.temperature
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message
    }));
  }
}

async function handleAiDraft(req, res, config, body) {
  if (!body || (!body.template_id && !body.prompt)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: "Must specify either 'template_id' for deterministic drafting or 'prompt' for AI-assisted drafting."
    }));
  }

  try {
    const result = await drafter.draft(body);
    const status = result.success === false ? 400 : 200;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message
    }));
  }
}

async function handleAiCorpusStats(req, res, config) {
  try {
    const stats = reasoner.corpus.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      corpus_stats: stats
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message
    }));
  }
}

async function handleAiTemplates(req, res, config) {
  try {
    const templates = drafter.listTemplates();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      templates_count: templates.length,
      templates: templates
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message
    }));
  }
}

async function handleAiEvaluate(req, res, config) {
  try {
    const evalResults = await runAdversarialEvaluations(reasoner, drafter);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(evalResults));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message
    }));
  }
}

module.exports = {
  handleAiQuery,
  handleAiDraft,
  handleAiCorpusStats,
  handleAiTemplates,
  handleAiEvaluate,
  reasoner,
  drafter
};
