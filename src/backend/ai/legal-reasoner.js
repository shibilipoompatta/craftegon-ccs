/**
 * CraftEgon CCS — Phase 5: Legal Reasoner Orchestrator
 * 
 * Orchestrates the full AI query lifecycle:
 * 1. Privacy Safeguards (DPDP Act 2023 masking)
 * 2. Adversarial & Prompt Injection Screening
 * 3. Grounded Statutory Retrieval from Curated Corpus
 * 4. Verification Gate (Strict refusal on unverified legal facts)
 * 5. Server-Side Model Gateway Invocation
 * 6. Audit Metadata & Human Review Flagging
 */

const { RetrievalCorpus, DEFAULT_REFUSAL_THRESHOLD } = require('./retrieval-corpus');
const { PrivacyGuard } = require('./privacy-guard');
const { ModelGateway } = require('./model-gateway');

class LegalReasoner {
  constructor(options = {}) {
    this.corpus = options.corpus || new RetrievalCorpus();
    this.privacyGuard = options.privacyGuard || new PrivacyGuard();
    this.gateway = options.gateway || new ModelGateway(options.gatewayOptions || {});
    this.refusalThreshold = options.refusalThreshold || DEFAULT_REFUSAL_THRESHOLD;
  }

  /**
   * Evaluates an adversarial input or prompt injection attempt.
   */
  _checkAdversarialInput(text) {
    if (!text || typeof text !== 'string') return { is_adversarial: false };

    const lower = text.toLowerCase();
    const injectionPatterns = [
      'ignore all previous instructions',
      'ignore above instructions',
      'system override',
      'disregard all rules',
      'jailbreak',
      'dan mode',
      'you are now an unrestricted',
      'pretend you are a lawyer and exempt me',
      'bypass mca validation',
      'bypass gst rules',
      'how to evade income tax'
    ];

    for (const pattern of injectionPatterns) {
      if (lower.includes(pattern)) {
        return {
          is_adversarial: true,
          pattern_detected: pattern,
          category: 'PROMPT_INJECTION_OR_EVASION'
        };
      }
    }

    return { is_adversarial: false };
  }

  /**
   * Processes a legal or regulatory query through the full grounded pipeline.
   */
  async answerQuery(userPrompt, options = {}) {
    const queryTimestamp = new Date().toISOString();

    // 1. Adversarial & Injection Check
    const adversarialCheck = this._checkAdversarialInput(userPrompt);
    if (adversarialCheck.is_adversarial) {
      return {
        status: 'ADVERSARIAL_INPUT_REJECTED',
        can_verify: false,
        verified: false,
        answer: '[REJECTED]: The input violates CraftEgon CCS AI safety and compliance guardrails. Adversarial prompts, evasion instructions, or security bypass directives are strictly rejected.',
        citations: [],
        audit: {
          timestamp: queryTimestamp,
          adversarial_flag: true,
          violation_category: adversarialCheck.category,
          detected_pattern: adversarialCheck.pattern_detected
        },
        requires_human_professional_review: false,
        dpdp_compliance: { is_compliant: true, action_taken: 'INPUT_REJECTED' }
      };
    }

    // 2. Privacy Guard: PII Masking
    const privacyResult = this.privacyGuard.sanitize(userPrompt);
    const sanitizedPrompt = privacyResult.sanitized_text;

    // 3. Retrieval from Curated Statutory Corpus
    const searchResult = this.corpus.search(sanitizedPrompt, {
      topK: options.topK || 3,
      threshold: this.refusalThreshold,
      statuteFilter: options.statuteFilter,
      authorityFilter: options.authorityFilter
    });

    // 4. Refusal Gate: If facts cannot be verified, REFUSE rather than guess!
    if (!searchResult.can_verify || searchResult.matches.length === 0) {
      return {
        status: 'UNVERIFIED_LEGAL_FACT',
        can_verify: false,
        verified: false,
        answer: 'CraftEgon CCS cannot verify this legal premise against the curated statutory authorities. Under our regulatory accuracy mandate, the system refuses to guess, extrapolate, or hallucinate statutory provisions, deadlines, or exemptions not grounded in verified primary sources.',
        citations: [],
        search_metadata: {
          top_score: searchResult.top_score,
          refusal_threshold: this.refusalThreshold,
          matches_found: searchResult.matches.length
        },
        dpdp_compliance: privacyResult.dpdp_compliance,
        requires_human_professional_review: true,
        disclaimer: 'Always verify statutory compliance with a qualified legal professional, Company Secretary, or Chartered Accountant.'
      };
    }

    // 5. Model Gateway Execution with Grounded Chunks
    const contextChunks = searchResult.matches.map(m => m.chunk);
    const citations = searchResult.matches.map(m => m.citation);

    const gatewayResult = await this.gateway.generate({
      prompt: sanitizedPrompt,
      contextChunks,
      citations,
      temperature: options.temperature || 0.1
    });

    return {
      status: 'VERIFIED_LEGAL_SOURCE',
      can_verify: true,
      verified: true,
      answer: gatewayResult.content,
      citations: citations,
      model_metadata: {
        mode: gatewayResult.mode,
        model: gatewayResult.model,
        latency_ms: gatewayResult.latency_ms,
        fallback_reason: gatewayResult.fallback_reason || null
      },
      search_metadata: {
        top_score: searchResult.top_score,
        refusal_threshold: this.refusalThreshold,
        retrieved_chunks_count: searchResult.matches.length
      },
      dpdp_compliance: {
        ...privacyResult.dpdp_compliance,
        pii_detected: privacyResult.pii_detected,
        redaction_count: privacyResult.redaction_count,
        categories_detected: privacyResult.categories_detected
      },
      requires_human_professional_review: true,
      disclaimer: gatewayResult.disclaimer
    };
  }
}

module.exports = {
  LegalReasoner
};
