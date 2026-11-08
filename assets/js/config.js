/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - CENTRAL CLIENT CONFIGURATION
 * Canonical source of truth for business contact details & institutional metadata
 * Environment-aware API configuration with fail-closed production static default
 * ==========================================================================
 */

(function () {
  "use strict";

  // Production host patterns that MUST ALWAYS remain in static showcase mode
  const PRODUCTION_HOST_PATTERNS = [
    /^craftegon\.com$/i,
    /^(?:www|ccs)\.craftegon\.com$/i,
    /\.pages\.dev$/i,
    /\.cloudflare\.com$/i
  ];

  // Approved non-production hostnames eligible for explicit dynamic API enablement
  const ALLOWED_LOCAL_HOSTS = [
    "localhost",
    "127.0.0.1",
    "[::1]"
  ];

  const ALLOWED_STAGING_HOSTS = [
    "staging.ccs.craftegon.com",
    "dev.ccs.craftegon.com"
  ];

  function resolveHostname() {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
      return String(window.location.hostname).toLowerCase().trim();
    }
    return "";
  }

  function isProductionHost(hostname) {
    if (!hostname) return false;
    return PRODUCTION_HOST_PATTERNS.some(function (pattern) {
      return pattern.test(hostname);
    });
  }

  function isAllowedDynamicHost(hostname) {
    if (!hostname) return false;
    if (isProductionHost(hostname)) return false;
    return ALLOWED_LOCAL_HOSTS.indexOf(hostname) !== -1 || ALLOWED_STAGING_HOSTS.indexOf(hostname) !== -1;
  }

  function evaluateDynamicMode(hostname, explicitOverride) {
    // 1. Strict Fail-Closed Rule: Production hostnames CANNOT be dynamic
    if (isProductionHost(hostname)) {
      return false;
    }

    // 2. Check explicit override provided programmatically (e.g. tests or bootstrap)
    if (explicitOverride && typeof explicitOverride === "object") {
      if (explicitOverride.enableDynamicApi === true) {
        // If a hostname is specified, it MUST be an allowed dynamic host
        if (hostname) {
          return isAllowedDynamicHost(hostname);
        }
        // In headless Node.js without a hostname, allow programmatic test override
        if (typeof window === "undefined") {
          return true;
        }
      }
      return false;
    }

    // 3. Node.js environment variable check (for test runners / headless scripts)
    if (typeof process !== "undefined" && process.env && process.env.CRAFTEGON_DYNAMIC_API === "true") {
      return true;
    }

    // 4. Browser environment check on allowed hosts
    if (typeof window !== "undefined") {
      // Must be an allowed host - never infer from arbitrary unknown hosts
      if (!isAllowedDynamicHost(hostname)) {
        return false;
      }

      // Check explicit global flag
      if (window.__CRAFTEGON_DEV_CONFIG__ && window.__CRAFTEGON_DEV_CONFIG__.enableDynamicApi === true) {
        return true;
      }
      if (window.CRAFTEGON_ENABLE_DYNAMIC_API === true) {
        return true;
      }

      // Check explicit session / local storage opt-in (localhost only)
      try {
        if (ALLOWED_LOCAL_HOSTS.indexOf(hostname) !== -1) {
          if (window.sessionStorage && window.sessionStorage.getItem("craftegon_dynamic_mode") === "true") {
            return true;
          }
          if (window.localStorage && window.localStorage.getItem("craftegon_dynamic_mode") === "true") {
            return true;
          }
        }
      } catch (e) {
        // Storage access may throw in restricted sandboxes; fail-closed
      }
    }

    // Default: Safe static mode
    return false;
  }

  const currentHost = resolveHostname();
  const explicitCfg = (typeof window !== "undefined" && window.__CRAFTEGON_DEV_CONFIG__) || null;
  const isDynamic = evaluateDynamicMode(currentHost, explicitCfg);

  const config = {
    brandName: "CraftEgon Corporate Services",
    brandShort: "CraftEgon CCS",
    brandSubtitle: "Corporate Services",
    legalEntity: null, // Contracting legal entity unconfirmed (Owner Confirmation Required)
    operationalDesk: "Operational Service Desk, Alappuzha, Kerala, India • PIN: 690501",
    statutoryReg: "MCA V3 • RBI FIRMS • IP India",

    // Canonical Business Contact Parameters
    phoneDisplay: "+91 86069 18247",
    phoneHref: "tel:+918606918247",
    whatsappNumber: "+91 86069 18247",
    whatsappUrl: "https://wa.me/918606918247",
    email: "admin@craftegon.com",
    emailHref: "mailto:admin@craftegon.com",

    // Canonical Domain
    domain: "https://craftegon.com",
    liveUrl: "https://ccs.craftegon.com",

    // Architecture State: Safe Static Default; Dynamic only when explicitly configured on allowed hosts
    isStatic: !isDynamic,
    apiMode: isDynamic ? "dynamic" : "static",
    environment: isProductionHost(currentHost)
      ? "production"
      : (isAllowedDynamicHost(currentHost)
        ? (ALLOWED_LOCAL_HOSTS.indexOf(currentHost) !== -1 ? "development" : "staging")
        : "unknown"),
    apiEndpoint: "/api/v1/enquiries",
    apiBaseUrl: "",

    // Quick-action prefilled inquiry generator
    getWhatsAppUrl: function (topic) {
      const text = topic
        ? encodeURIComponent(`Hello CraftEgon Compliance Desk, I would like to consult on: ${topic}.`)
        : encodeURIComponent("Hello CraftEgon Compliance Desk, I would like to consult on corporate compliance services.");
      return `${this.whatsappUrl}?text=${text}`;
    },

    getEmailUrl: function (subject) {
      const subj = subject ? encodeURIComponent(subject) : encodeURIComponent("Corporate Compliance Inquiry");
      return `${this.emailHref}?subject=${subj}`;
    },

    // Google Workspace Compliance Intake Form Integration for craftegon.com
    googleWorkspace: {
      domain: "craftegon.com",
      organization: "CraftEgon Corporate Services",
      deskEmail: "admin@craftegon.com",
      // Optional Google Apps Script Webhook URL for direct silent submission into Google Drive / Google Sheets
      webhookUrl: "https://script.google.com/macros/s/AKfycbx2wvkEVj9AAV3Mnn8rNbFYlTp8O1IopRfoZ1Vtu7gh1xI_j1HCYtKlxorVytYUPn18/exec",
      forms: {
        enabled: true,
        intakeFormId: "16e0rbSymnw47arIdFu3Fzya3rbhrKGQp-vh5gth0t7k",
        formViewUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd-DERFEEOwSOs15bPuiCjc-eMFvKaAEVkKixDwjbPa1OKdfg/viewform",
        formResponseUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd-DERFEEOwSOs15bPuiCjc-eMFvKaAEVkKixDwjbPa1OKdfg/formResponse",
        // Field mappings for Google Form pre-filling and submission
        entryMapping: {
          name: "entry.279501974",
          email: "entry.2039387165",
          phone: "entry.1560482944",
          company: "entry.568862913",
          entityType: "entry.2109045727",
          regNumber: "entry.1661637464",
          service: "entry.1521346516",
          scope: "entry.612743692",
          sourceUrl: "entry.1550136045"
        }
      },
      getIntakeUrl: function (params) {
        params = params || {};
        const base = "https://docs.google.com/forms/d/e/1FAIpQLSd-DERFEEOwSOs15bPuiCjc-eMFvKaAEVkKixDwjbPa1OKdfg/viewform";
        const map = (this.forms && this.forms.entryMapping) || {};
        const q = ["usp=pp_url"];

        if (params.name && map.name) q.push(map.name + "=" + encodeURIComponent(params.name));
        if (params.email && map.email) q.push(map.email + "=" + encodeURIComponent(params.email));
        if (params.phone && map.phone) q.push(map.phone + "=" + encodeURIComponent(params.phone));
        if (params.company && map.company) q.push(map.company + "=" + encodeURIComponent(params.company));
        if (params.entityType && map.entityType) q.push(map.entityType + "=" + encodeURIComponent(params.entityType));
        if (params.regNumber && map.regNumber) q.push(map.regNumber + "=" + encodeURIComponent(params.regNumber));
        if (params.service && map.service) q.push(map.service + "=" + encodeURIComponent(params.service));
        if (params.scope && map.scope) q.push(map.scope + "=" + encodeURIComponent(params.scope));
        if (params.sourceUrl && map.sourceUrl) q.push(map.sourceUrl + "=" + encodeURIComponent(params.sourceUrl));

        return base + (q.length > 1 ? "?" + q.join("&") : "");
      }
    },

    // Evaluator helper for testing & programmatic configuration
    _evaluateDynamicMode: evaluateDynamicMode,
    _isProductionHost: isProductionHost,
    _isAllowedDynamicHost: isAllowedDynamicHost
  };

  if (typeof window !== "undefined") {
    window.CRAFTEGON_CONFIG = config;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
})();
