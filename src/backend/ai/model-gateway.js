/**
 * CraftEgon CCS — Phase 5: Server-Side Model Gateway
 * 
 * Provides a secure, server-side abstraction over Google Gemini models
 * and an offline deterministic statutory reasoning engine.
 * 
 * Features:
 * - API key safety: Keys never leave the server process or get leaked in responses.
 * - Dual execution mode: ONLINE_GEMINI (when key is configured) or DETERMINISTIC_OFFLINE.
 * - Grounding enforcement: Incorporates retrieved statutory context with strict refusal rules.
 * - Timeout and retry resiliency: Uses native AbortController and bounded retries.
 * - Request audit metadata and latency instrumentation.
 */

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

class ModelGateway {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.GEMINI_API_KEY || null;
    this.model = options.model || DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.forceOffline = options.forceOffline === true;
    this.systemPrompt = options.systemPrompt || this._getDefaultSystemPrompt();
  }

  _getDefaultSystemPrompt() {
    return `You are CraftEgon CCS Legal & Regulatory AI, a specialized corporate compliance assistant for Indian statutory law.
CORE MANDATES:
1. Ground every answer strictly in the provided statutory context chunks and official citations.
2. If the user asks about a statute, section, rule, or tax exemption not grounded in the verified context, or if the premises are fictional or cannot be verified, you MUST refuse to answer and state: "[UNVERIFIED_LEGAL_FACT]: The statutory authorities do not verify this provision."
3. NEVER hallucinate statutory sections, penalties, limitation periods, or tax relief schemes.
4. Separate pure informational analysis from formal legal counsel. Always include the statutory citation.`;
  }

  getMode() {
    if (this.forceOffline || !this.apiKey) {
      return 'DETERMINISTIC_OFFLINE';
    }
    return 'ONLINE_GEMINI';
  }

  /**
   * Generates a grounded response given a prompt and verified retrieval chunks.
   */
  async generate({ prompt, contextChunks = [], citations = [], temperature = 0.1 }) {
    const startTime = Date.now();
    const mode = this.getMode();

    if (mode === 'ONLINE_GEMINI') {
      try {
        const result = await this._callGeminiWithRetry({
          prompt,
          contextChunks,
          citations,
          temperature
        });
        const latencyMs = Date.now() - startTime;
        return {
          success: true,
          mode: 'ONLINE_GEMINI',
          model: this.model,
          content: result.content,
          citations: citations,
          latency_ms: latencyMs,
          usage: result.usage || { prompt_tokens: null, completion_tokens: null },
          disclaimer: this._getDisclaimer()
        };
      } catch (err) {
        // Graceful fallback to deterministic offline reasoner if Gemini call fails
        const fallback = this._deterministicReasoning({ prompt, contextChunks, citations });
        return {
          success: true,
          mode: 'DETERMINISTIC_OFFLINE_FALLBACK',
          fallback_reason: err.message,
          model: 'craftegon-deterministic-statutory-v1',
          content: fallback.content,
          citations: citations,
          can_verify: fallback.can_verify,
          latency_ms: Date.now() - startTime,
          disclaimer: this._getDisclaimer()
        };
      }
    }

    // Pure deterministic offline mode
    const deterministic = this._deterministicReasoning({ prompt, contextChunks, citations });
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      mode: 'DETERMINISTIC_OFFLINE',
      model: 'craftegon-deterministic-statutory-v1',
      content: deterministic.content,
      citations: citations,
      can_verify: deterministic.can_verify,
      latency_ms: latencyMs,
      disclaimer: this._getDisclaimer()
    };
  }

  async _callGeminiWithRetry({ prompt, contextChunks, citations, temperature }) {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this._callGeminiAPI({ prompt, contextChunks, citations, temperature });
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, 500 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed to reach Gemini API after retries');
  }

  async _callGeminiAPI({ prompt, contextChunks, citations, temperature }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const contextText = contextChunks.map((c, i) => {
      return `[SOURCE ${i + 1}]: ${c.statute} - ${c.section_or_rule} (${c.authority})\nTitle: ${c.title}\nText: ${c.substantive_text}`;
    }).join('\n\n');

    const formattedPrompt = `${this.systemPrompt}\n\nSTATUTORY CONTEXT:\n${contextText}\n\nUSER INQUIRY:\n${prompt}\n\nGROUNDED STATUTORY ANALYSIS:`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: formattedPrompt }]
        }
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 1024
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response content received from Gemini model');
      }

      return {
        content: text.trim(),
        usage: data.usageMetadata || null
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Deterministic statutory synthesis when offline or during automated test pipelines.
   * Synthesizes verified chunk texts and outputs explicit refusal if no relevant chunks exist.
   */
  _deterministicReasoning({ prompt, contextChunks, citations }) {
    if (!contextChunks || contextChunks.length === 0) {
      return {
        can_verify: false,
        content: '[UNVERIFIED_LEGAL_FACT]: The statutory authorities and curated corpus do not contain verified provisions supporting this inquiry. CraftEgon CCS strictly refuses to guess or extrapolate unverified legal facts.'
      };
    }

    // Structured synthesis of verified chunks
    const primary = contextChunks[0];
    const sourceRef = `${primary.statute}, ${primary.section_or_rule}`;
    const authority = primary.authority;

    let response = `Based on verified statutory sources under **${sourceRef}** administered by the **${authority}**:\n\n`;
    response += `**Subject:** ${primary.title}\n\n`;
    response += `**Statutory Requirement:**\n${primary.substantive_text}\n\n`;

    if (contextChunks.length > 1) {
      response += `**Related Statutory Frameworks:**\n`;
      for (let i = 1; i < contextChunks.length; i++) {
        const c = contextChunks[i];
        response += `- **${c.statute} (${c.section_or_rule})**: ${c.title}\n`;
      }
      response += '\n';
    }

    response += `**Compliance Notes:** Statutory filings must be executed within the limitation periods prescribed above to prevent statutory late fees or penalties under applicable rules.`;

    return {
      can_verify: true,
      content: response
    };
  }

  _getDisclaimer() {
    return 'CraftEgon CCS regulatory intelligence is an informational synthesis grounded in cited Indian statutory authorities. This output does not constitute formal legal counsel, statutory audit, or certification under the Advocates Act, 1961 or the Chartered Accountants Act, 1949.';
  }
}

module.exports = {
  ModelGateway
};
