/**
 * CraftEgon CCS — Phase 5: Retrieval Corpus Manager
 * 
 * Manages curated, versioned statutory corpora with structured source citations,
 * token-based inverted indexing, keyword overlap, BM25-style relevance scoring,
 * and strict refusal thresholds (< 0.25 triggers UNVERIFIED_LEGAL_FACT).
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CORPUS_PATH = path.join(__dirname, 'corpus', 'canonical-statutory-corpus.json');
const DEFAULT_REFUSAL_THRESHOLD = 0.25;

class RetrievalCorpus {
  constructor(corpusPath = DEFAULT_CORPUS_PATH) {
    this.corpusPath = corpusPath;
    this.chunks = [];
    this.index = new Map(); // term -> Set of chunk_ids
    this.termFrequencies = new Map(); // chunk_id -> Map of term -> count
    this.chunkMap = new Map(); // chunk_id -> chunk
    this.loadedAt = null;
    this.loadCorpus();
  }

  loadCorpus() {
    if (!fs.existsSync(this.corpusPath)) {
      throw new Error(`Statutory corpus file not found: ${this.corpusPath}`);
    }

    const raw = fs.readFileSync(this.corpusPath, 'utf8');
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error('Corpus payload must be a JSON array of statutory chunks');
    }

    this.chunks = data;
    this.index.clear();
    this.termFrequencies.clear();
    this.chunkMap.clear();

    for (const chunk of this.chunks) {
      this.chunkMap.set(chunk.chunk_id, chunk);
      this._indexChunk(chunk);
    }

    this.loadedAt = new Date().toISOString();
  }

  _tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !this._isStopword(token));
  }

  _isStopword(token) {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
      'or', 'by', 'with', 'from', 'as', 'any', 'be', 'shall', 'all', 'under', 'such',
      'that', 'this', 'it', 'its', 'are', 'was', 'were', 'has', 'have', 'had', 'been'
    ]);
    return stopwords.has(token);
  }

  _indexChunk(chunk) {
    const combinedText = [
      chunk.statute,
      chunk.section_or_rule,
      chunk.title,
      chunk.substantive_text,
      (chunk.key_terms || []).join(' ')
    ].join(' ');

    const tokens = this._tokenize(combinedText);
    const tf = new Map();

    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
      if (!this.index.has(t)) {
        this.index.set(t, new Set());
      }
      this.index.get(t).add(chunk.chunk_id);
    }

    // Also index explicit key terms and section numbers directly
    for (const term of (chunk.key_terms || [])) {
      const normalizedTerm = term.toLowerCase().trim();
      if (!this.index.has(normalizedTerm)) {
        this.index.set(normalizedTerm, new Set());
      }
      this.index.get(normalizedTerm).add(chunk.chunk_id);
      tf.set(normalizedTerm, (tf.get(normalizedTerm) || 0) + 3); // boosted weight
    }

    this.termFrequencies.set(chunk.chunk_id, tf);
  }

  /**
   * Search corpus with relevance scoring and statutory refusal guardrail.
   * If highest score is below refusalThreshold, returns canVerify: false.
   */
  search(query, options = {}) {
    const {
      topK = 3,
      threshold = DEFAULT_REFUSAL_THRESHOLD,
      statuteFilter = null,
      authorityFilter = null
    } = options;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return {
        query: query || '',
        can_verify: false,
        status: 'EMPTY_QUERY',
        top_score: 0,
        matches: [],
        message: 'Empty query provided to statutory retrieval corpus.'
      };
    }

    const queryLower = query.toLowerCase();

    // 0. Check for repealed statutes
    const repealedStatutes = [
      { code: 'fera', name: 'Foreign Exchange Regulation Act, 1973', repealed_by: 'FEMA, 1999' },
      { code: 'mrtp', name: 'Monopolies and Restrictive Trade Practices Act', repealed_by: 'Competition Act, 2002' }
    ];
    for (const rep of repealedStatutes) {
      if (queryLower.includes(rep.code) || queryLower.includes(rep.name.toLowerCase())) {
        return {
          query,
          can_verify: false,
          status: 'UNVERIFIED_LEGAL_FACT',
          refusal_threshold: threshold,
          top_score: 0,
          matches: [],
          message: `The inquiry references '${rep.name}', which was repealed and replaced by '${rep.repealed_by}'. Current legal compliance under the repealed act cannot be verified.`
        };
      }
    }

    // 1. Detect if a specific statutory section is being requested (e.g. "Section 999", "Section 80-XYZ")
    const explicitSectionRegex = /\bsection\s+([0-9]+[a-z]{0,3}|[0-9]+-[a-z0-9]+)\b/gi;
    const explicitSections = [];
    let match;
    while ((match = explicitSectionRegex.exec(query)) !== null) {
      explicitSections.push(match[1].toLowerCase());
    }

    // Check if explicitly queried section exists anywhere in corpus
    let explicitSectionExistsInCorpus = false;
    if (explicitSections.length > 0) {
      for (const chunk of this.chunks) {
        const chunkSec = (chunk.section_or_rule || '').toLowerCase();
        const chunkTerms = (chunk.key_terms || []).map(t => t.toLowerCase());
        for (const reqSec of explicitSections) {
          if (chunkSec.includes(reqSec) || chunkTerms.some(t => t.includes(reqSec))) {
            explicitSectionExistsInCorpus = true;
            break;
          }
        }
        if (explicitSectionExistsInCorpus) break;
      }

      // If user asked about a specific section not in our verified corpus, refuse!
      if (!explicitSectionExistsInCorpus) {
        return {
          query,
          can_verify: false,
          status: 'UNVERIFIED_LEGAL_FACT',
          refusal_threshold: threshold,
          top_score: 0.1,
          matches: [],
          message: `Statutory section(s) '${explicitSections.join(', ')}' do not exist in the verified statutory authorities.`
        };
      }
    }

    const queryTokens = this._tokenize(query);
    const candidateScores = new Map();

    // 2. Exact or partial key term matches
    for (const chunk of this.chunks) {
      let score = 0;
      const keyTerms = chunk.key_terms || [];
      const chunkSec = (chunk.section_or_rule || '').toLowerCase();

      // If query asked for specific section, only award score if this chunk actually contains that section
      if (explicitSections.length > 0) {
        const matchesSection = explicitSections.some(sec => chunkSec.includes(sec));
        if (!matchesSection) {
          continue; // Disqualify chunks for completely different sections
        }
      }

      for (const kt of keyTerms) {
        if (queryLower.includes(kt.toLowerCase())) {
          score += 0.45; // Significant boost for exact statutory concept
        }
      }

      // Check section number exact match (e.g. "137", "section 137", "aoc-4")
      if (chunk.section_or_rule && queryLower.includes(chunk.section_or_rule.toLowerCase())) {
        score += 0.50;
      }

      if (score > 0) {
        candidateScores.set(chunk.chunk_id, (candidateScores.get(chunk.chunk_id) || 0) + score);
      }
    }

    // 3. Token-level overlap & TF-IDF style scoring
    const totalChunks = this.chunks.length;
    for (const token of queryTokens) {
      const matchingChunkIds = this.index.get(token);
      if (!matchingChunkIds) continue;

      const idf = Math.log(1 + (totalChunks - matchingChunkIds.size + 0.5) / (matchingChunkIds.size + 0.5));

      for (const chunkId of matchingChunkIds) {
        // If explicit section was specified, don't score unrelated chunks
        if (explicitSections.length > 0) {
          const chunk = this.chunkMap.get(chunkId);
          const chunkSec = (chunk?.section_or_rule || '').toLowerCase();
          if (!explicitSections.some(sec => chunkSec.includes(sec))) {
            continue;
          }
        }

        const tf = this.termFrequencies.get(chunkId).get(token) || 1;
        const normalizedTf = tf / (tf + 1.5);
        const termScore = idf * normalizedTf * 0.2;
        candidateScores.set(chunkId, (candidateScores.get(chunkId) || 0) + termScore);
      }
    }

    // 3. Filter and sort
    const ranked = [];
    for (const [chunkId, rawScore] of candidateScores.entries()) {
      const chunk = this.chunkMap.get(chunkId);

      if (statuteFilter && !chunk.statute.toLowerCase().includes(statuteFilter.toLowerCase())) {
        continue;
      }
      if (authorityFilter && !chunk.authority.toLowerCase().includes(authorityFilter.toLowerCase())) {
        continue;
      }

      // Normalize score between 0.0 and 1.0 (capped at 1.0)
      const normalizedScore = Math.min(1.0, Math.round(rawScore * 100) / 100);

      ranked.push({
        chunk_id: chunk.chunk_id,
        score: normalizedScore,
        chunk,
        citation: this.buildCitation(chunk)
      });
    }

    ranked.sort((a, b) => b.score - a.score);

    const topMatches = ranked.slice(0, topK);
    const topScore = topMatches.length > 0 ? topMatches[0].score : 0;
    const canVerify = topScore >= threshold;

    return {
      query,
      can_verify: canVerify,
      status: canVerify ? 'VERIFIED_LEGAL_SOURCE' : 'UNVERIFIED_LEGAL_FACT',
      refusal_threshold: threshold,
      top_score: topScore,
      matches: topMatches,
      message: canVerify
        ? `Found ${topMatches.length} verified statutory authority citation(s).`
        : 'Statutory corpus cannot verify this legal premise with sufficient confidence.'
    };
  }

  buildCitation(chunk) {
    return {
      source_id: chunk.source_id,
      chunk_id: chunk.chunk_id,
      authority: chunk.authority,
      statute: chunk.statute,
      section_or_rule: chunk.section_or_rule,
      jurisdiction: chunk.jurisdiction,
      effective_date: chunk.effective_date,
      title: chunk.title,
      verifiable_reference: `${chunk.statute}, ${chunk.section_or_rule} (${chunk.authority})`
    };
  }

  getChunkById(chunkId) {
    return this.chunkMap.get(chunkId) || null;
  }

  getStats() {
    const statutes = new Set(this.chunks.map(c => c.statute));
    const authorities = new Set(this.chunks.map(c => c.authority));
    const jurisdictions = new Set(this.chunks.map(c => c.jurisdiction));

    return {
      total_chunks: this.chunks.length,
      statutes_count: statutes.size,
      statutes: Array.from(statutes),
      authorities_count: authorities.size,
      authorities: Array.from(authorities),
      jurisdictions: Array.from(jurisdictions),
      total_indexed_terms: this.index.size,
      corpus_path: this.corpusPath,
      loaded_at: this.loadedAt
    };
  }
}

module.exports = {
  RetrievalCorpus,
  DEFAULT_REFUSAL_THRESHOLD
};
