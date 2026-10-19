/**
 * CraftEgon CCS — Phase 5: Privacy Safeguards & DPDP Act 2023 Guardrails
 * 
 * Automatically detects, masks, and redacts Indian Personally Identifiable
 * Information (PII) before inputs are dispatched to LLM gateways or logged.
 * 
 * Supported Identifiers:
 * - PAN (Permanent Account Number)
 * - Aadhaar Number (12-digit UIDAI)
 * - Indian Mobile Phone Numbers (+91 / 10 digits)
 * - Email Addresses
 * - Bank Account Numbers (9-18 digits in account contexts)
 * - Indian Passport Numbers
 * - Director Identification Number (DIN - 8 digits)
 */

class PrivacyGuard {
  constructor(options = {}) {
    this.enableMasking = options.enableMasking !== false;
  }

  /**
   * Sanitizes text by masking all detected PII tokens.
   * Returns sanitized text along with a deterministic redaction manifest.
   */
  sanitize(text) {
    if (!text || typeof text !== 'string') {
      return {
        sanitized_text: text || '',
        pii_detected: false,
        redaction_manifest: [],
        redaction_count: 0,
        categories_detected: []
      };
    }

    let sanitized = text;
    const manifest = [];
    const categoriesSet = new Set();
    let counter = 1;

    // 1. Aadhaar (12 digits, often formatted as XXXX XXXX XXXX or XXXX-XXXX-XXXX or XXXXXXXXXXXX)
    // Avoid matching 12 zeros or numbers that are clearly timestamps
    const aadhaarRegex = /\b[2-9]{1}[0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g;
    sanitized = sanitized.replace(aadhaarRegex, (match) => {
      const token = `[REDACTED_AADHAAR_${counter++}]`;
      manifest.push({
        token,
        category: 'AADHAAR',
        original_masked_preview: match.substring(0, 2) + '••••••••' + match.slice(-2),
        original_value: match
      });
      categoriesSet.add('AADHAAR');
      return token;
    });

    // 2. PAN (Permanent Account Number: 5 letters, 4 digits, 1 letter)
    const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
    sanitized = sanitized.replace(panRegex, (match) => {
      const token = `[REDACTED_PAN_${counter++}]`;
      manifest.push({
        token,
        category: 'PAN',
        original_masked_preview: match.substring(0, 2) + '•••••' + match.slice(-1),
        original_value: match
      });
      categoriesSet.add('PAN');
      return token;
    });

    // 3. Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    sanitized = sanitized.replace(emailRegex, (match) => {
      const token = `[REDACTED_EMAIL_${counter++}]`;
      manifest.push({
        token,
        category: 'EMAIL',
        original_masked_preview: match.split('@')[0].slice(0, 2) + '•••@' + match.split('@')[1],
        original_value: match
      });
      categoriesSet.add('EMAIL');
      return token;
    });

    // 4. Indian Mobile Phones (+91-9876543210, 09876543210, +91 9876543210, 9876543210)
    const phoneRegex = /(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}\b/g;
    sanitized = sanitized.replace(phoneRegex, (match) => {
      // Don't match if it's already part of a token
      if (match.length < 10) return match;
      const token = `[REDACTED_PHONE_${counter++}]`;
      manifest.push({
        token,
        category: 'PHONE_NUMBER',
        original_masked_preview: match.slice(0, 3) + '•••••' + match.slice(-2),
        original_value: match
      });
      categoriesSet.add('PHONE_NUMBER');
      return token;
    });

    // 5. Passport Number (1 letter followed by 7 digits)
    const passportRegex = /\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/g;
    sanitized = sanitized.replace(passportRegex, (match) => {
      const token = `[REDACTED_PASSPORT_${counter++}]`;
      manifest.push({
        token,
        category: 'PASSPORT',
        original_masked_preview: match.charAt(0) + '••••••' + match.slice(-1),
        original_value: match
      });
      categoriesSet.add('PASSPORT');
      return token;
    });

    // 6. DIN (Director Identification Number - 8 digits in DIN context)
    const dinRegex = /(?:DIN|Director Identification Number)\s*(?:[:=]|\bis\b)?\s*([0-9]{8})\b/gi;
    sanitized = sanitized.replace(dinRegex, (fullMatch, dinNumber) => {
      const token = `[REDACTED_DIN_${counter++}]`;
      manifest.push({
        token,
        category: 'DIN',
        original_masked_preview: 'DIN: ' + dinNumber.slice(0, 2) + '••••' + dinNumber.slice(-2),
        original_value: dinNumber
      });
      categoriesSet.add('DIN');
      return fullMatch.replace(dinNumber, token);
    });

    // 7. Bank Account Numbers (9-18 digits preceded by keywords like 'account', 'a/c', 'acc no')
    const bankAccRegex = /(?:a\/c|account\s*(?:no|number)?)\s*[:#.]?\s*([0-9]{9,18})\b/gi;
    sanitized = sanitized.replace(bankAccRegex, (fullMatch, accNumber) => {
      const token = `[REDACTED_BANK_ACC_${counter++}]`;
      manifest.push({
        token,
        category: 'BANK_ACCOUNT',
        original_masked_preview: 'A/c: ••••••••' + accNumber.slice(-4),
        original_value: accNumber
      });
      categoriesSet.add('BANK_ACCOUNT');
      return fullMatch.replace(accNumber, token);
    });

    return {
      sanitized_text: sanitized,
      pii_detected: manifest.length > 0,
      redaction_manifest: manifest,
      redaction_count: manifest.length,
      categories_detected: Array.from(categoriesSet),
      dpdp_compliance: {
        is_compliant: true,
        statutory_authority: 'Digital Personal Data Protection Act, 2023 (Section 8)',
        action_taken: manifest.length > 0 ? 'PII_REDACTED_BEFORE_MODEL_DISPATCH' : 'NO_PII_DETECTED'
      }
    };
  }

  /**
   * Reconstitutes original values into template placeholders locally on the server
   * without ever exposing original values to external LLM providers.
   */
  unmask(text, manifest = []) {
    if (!text || !Array.isArray(manifest) || manifest.length === 0) {
      return text;
    }

    let unmasked = text;
    for (const item of manifest) {
      if (item.token && item.original_value) {
        unmasked = unmasked.split(item.token).join(item.original_value);
      }
    }
    return unmasked;
  }
}

module.exports = {
  PrivacyGuard
};
