/**
 * CraftEgon CCS — Phase 5: Document Drafter
 * 
 * Strict architectural separation of:
 * 1. DETERMINISTIC_STATUTORY_TEMPLATE (Zero-hallucination variable substitution on approved templates)
 * 2. AI_ASSISTED_DRAFT (Model-generated custom clauses with watermarks, RAG grounding, and review flags)
 */

const fs = require('fs');
const path = require('path');
const { PrivacyGuard } = require('./privacy-guard');
const { RetrievalCorpus } = require('./retrieval-corpus');
const { ModelGateway } = require('./model-gateway');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

class DocumentDrafter {
  constructor(options = {}) {
    this.templatesDir = options.templatesDir || TEMPLATES_DIR;
    this.privacyGuard = options.privacyGuard || new PrivacyGuard();
    this.corpus = options.corpus || new RetrievalCorpus();
    this.gateway = options.gateway || new ModelGateway(options.gatewayOptions || {});
    this.templates = new Map();
    this.loadTemplates();
  }

  loadTemplates() {
    this.templates.clear();
    if (!fs.existsSync(this.templatesDir)) {
      return;
    }

    const files = fs.readdirSync(this.templatesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const fullPath = path.join(this.templatesDir, file);
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const tmpl = JSON.parse(raw);
        if (tmpl.template_id) {
          this.templates.set(tmpl.template_id, tmpl);
        }
      } catch (err) {
        console.error(`Failed to load template ${file}:`, err.message);
      }
    }
  }

  listTemplates() {
    const list = [];
    for (const tmpl of this.templates.values()) {
      list.push({
        template_id: tmpl.template_id,
        name: tmpl.name,
        statutory_authority: tmpl.statutory_authority,
        category: tmpl.category,
        required_variables: tmpl.required_variables
      });
    }
    return list;
  }

  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }

  /**
   * Deterministic Statutory Template Drafting:
   * Completely bypasses probabilistic AI models to prevent legal clause hallucination.
   */
  draftFromTemplate(templateId, variables = {}) {
    const tmpl = this.getTemplate(templateId);
    if (!tmpl) {
      throw new Error(`Statutory template '${templateId}' not found. Available: ${Array.from(this.templates.keys()).join(', ')}`);
    }

    const missingVars = [];
    for (const req of tmpl.required_variables) {
      if (variables[req] === undefined || variables[req] === null || String(variables[req]).trim() === '') {
        missingVars.push(req);
      }
    }

    if (missingVars.length > 0) {
      return {
        success: false,
        status: 'MISSING_REQUIRED_VARIABLES',
        template_id: tmpl.template_id,
        missing_variables: missingVars,
        message: `Missing required statutory template variables: ${missingVars.join(', ')}`
      };
    }

    let renderedText = tmpl.template_text;
    for (const [key, val] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      renderedText = renderedText.replace(regex, String(val));
    }

    const watermark = '=== [CRAFTEGON CCS: DETERMINISTIC STATUTORY TEMPLATE — NON-PROBABILISTIC DRAFT] ===';
    const authorityHeader = `STATUTORY AUTHORITY: ${tmpl.statutory_authority}`;
    const finalDocument = `${watermark}\n${authorityHeader}\n\n${renderedText}\n\n${watermark}`;

    return {
      success: true,
      drafting_mode: 'DETERMINISTIC_STATUTORY_TEMPLATE',
      is_ai_generated: false,
      template_id: tmpl.template_id,
      template_name: tmpl.name,
      statutory_authority: tmpl.statutory_authority,
      jurisdiction: tmpl.jurisdiction,
      watermark: watermark,
      document_text: finalDocument,
      requires_human_professional_review: true,
      substituted_variables_count: Object.keys(variables).length,
      statutory_disclaimer: 'This statutory template was generated deterministically without generative language model extrapolation. Final review and formal execution must comply with applicable provisions of the Companies Act, 2013 and stamp duty rules.'
    };
  }

  /**
   * AI-Assisted Custom Drafting:
   * Clearly marked as AI-generated with prominent watermarks and professional review flags.
   */
  async draftCustomWithAI({ prompt, contextChunks = [], variables = {} }) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Custom drafting prompt must be provided.');
    }

    // 1. Sanitize user input for PII
    const privacyResult = this.privacyGuard.sanitize(prompt);
    const sanitizedPrompt = privacyResult.sanitized_text;

    // 2. Retrieve relevant legal corpus chunks for grounding
    const searchResult = this.corpus.search(sanitizedPrompt, { topK: 2 });
    const verifiedChunks = (contextChunks.length > 0) ? contextChunks : searchResult.matches.map(m => m.chunk);
    const citations = searchResult.matches.map(m => m.citation);

    // 3. Draft prompt with explicit statutory instructions
    const draftingPrompt = `Draft the following legal document or clause based strictly on Indian corporate law principles:
REQUEST: ${sanitizedPrompt}

REQUIREMENTS:
- Format as standard legal clauses with clear headings.
- Cite relevant Indian statutory authorities where applicable.
- Do NOT fabricate non-existent statutory sections.
- Mark any uncertain clauses with "[NEEDS LEGAL COUNSEL VALIDATION]".`;

    const gatewayResult = await this.gateway.generate({
      prompt: draftingPrompt,
      contextChunks: verifiedChunks,
      citations: citations,
      temperature: 0.1
    });

    // 4. Local unmasking of any PII tokens for client preview
    let finalContent = gatewayResult.content;
    if (privacyResult.pii_detected) {
      finalContent = this.privacyGuard.unmask(finalContent, privacyResult.redaction_manifest);
    }

    const watermark = '=== [CRAFTEGON CCS: AI-ASSISTED DRAFT — REQUIRES HUMAN LEGAL REVIEW — NOT AN EXECUTED INSTRUMENT] ===';
    const finalDocument = `${watermark}\n\n${finalContent}\n\n${watermark}`;

    return {
      success: true,
      drafting_mode: 'AI_ASSISTED_DRAFT',
      is_ai_generated: true,
      watermark: watermark,
      document_text: finalDocument,
      citations: citations,
      model_metadata: {
        mode: gatewayResult.mode,
        model: gatewayResult.model,
        latency_ms: gatewayResult.latency_ms
      },
      dpdp_compliance: privacyResult.dpdp_compliance,
      requires_human_professional_review: true,
      disclaimer: 'This document was compiled using AI-assisted drafting and contains probabilistic language. It does NOT constitute a certified legal instrument, conveyance, or executed statutory return under the Advocates Act, 1961. Professional review by a licensed Advocate, Company Secretary, or Chartered Accountant is strictly required prior to execution.'
    };
  }

  /**
   * Unified dispatcher: Routes to deterministic template if template_id is specified;
   * otherwise executes AI-assisted drafting.
   */
  async draft(options = {}) {
    if (options.template_id) {
      return this.draftFromTemplate(options.template_id, options.variables || {});
    }

    if (options.prompt) {
      return await this.draftCustomWithAI({
        prompt: options.prompt,
        contextChunks: options.contextChunks || [],
        variables: options.variables || {}
      });
    }

    throw new Error("Must provide either 'template_id' for deterministic drafting or 'prompt' for AI-assisted drafting.");
  }
}

module.exports = {
  DocumentDrafter
};
