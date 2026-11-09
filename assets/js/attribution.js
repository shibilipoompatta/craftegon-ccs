/**
 * ==============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - ATTRIBUTION & CAMPAIGN TRACKING ENGINE
 * Captures, persists (session & local 30-day window), and injects campaign UTMs,
 * GCLID, FBCLID, referrer, and multi-touch landing telemetry into all lead flows.
 * ==============================================================================
 */
(function () {
  "use strict";

  var STORAGE_KEY = "craftegon_attribution_v1";
  var EXPIRY_DAYS = 30;

  function safeStorageGet(storage) {
    try {
      var raw = storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function safeStorageSet(storage, data) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage unavailable or quota exceeded
    }
  }

  function getStoredAttribution() {
    // 1. Session storage (current browsing session priority)
    var sessionData = safeStorageGet(sessionStorage);
    if (sessionData && sessionData._timestamp) return sessionData;

    // 2. Local storage (30-day multi-visit attribution window)
    var localData = safeStorageGet(localStorage);
    if (localData && localData._timestamp) {
      var isFresh = (Date.now() - localData._timestamp) < (EXPIRY_DAYS * 86400000);
      if (isFresh) return localData;
    }

    return null;
  }

  function captureAttribution() {
    if (typeof window === "undefined") return {};

    var existing = getStoredAttribution() || {};
    var urlParams = new URLSearchParams(window.location.search || "");

    var utmSource = (urlParams.get("utm_source") || "").trim();
    var utmMedium = (urlParams.get("utm_medium") || "").trim();
    var utmCampaign = (urlParams.get("utm_campaign") || "").trim();
    var utmTerm = (urlParams.get("utm_term") || "").trim();
    var utmContent = (urlParams.get("utm_content") || "").trim();
    var gclid = (urlParams.get("gclid") || "").trim();
    var fbclid = (urlParams.get("fbclid") || "").trim();
    var msclkid = (urlParams.get("msclkid") || "").trim();

    var hasExplicitCampaign = Boolean(utmSource || utmCampaign || gclid || fbclid || msclkid);
    var currentLanding = window.location.pathname + (window.location.search || "");
    var referrer = (typeof document !== "undefined" && document.referrer) ? document.referrer : "";

    // Determine Organic/Referral defaults if no direct UTM
    var defaultSource = existing.first_utm_source || (referrer ? "referral" : "direct");
    var defaultMedium = existing.first_utm_medium || (referrer ? "organic" : "none");

    var attribution = {
      // First-Touch Attribution
      first_utm_source: existing.first_utm_source || (utmSource || defaultSource),
      first_utm_medium: existing.first_utm_medium || (utmMedium || defaultMedium),
      first_utm_campaign: existing.first_utm_campaign || (utmCampaign || "none"),
      first_landing_page: existing.first_landing_page || currentLanding,
      first_touch_timestamp: existing.first_touch_timestamp || new Date().toISOString(),

      // Last-Touch Attribution (Updated when explicit campaign parameters are encountered)
      utm_source: hasExplicitCampaign ? utmSource : (existing.utm_source || utmSource || defaultSource),
      utm_medium: hasExplicitCampaign ? utmMedium : (existing.utm_medium || utmMedium || defaultMedium),
      utm_campaign: hasExplicitCampaign ? utmCampaign : (existing.utm_campaign || utmCampaign || "none"),
      utm_term: hasExplicitCampaign ? utmTerm : (existing.utm_term || utmTerm || ""),
      utm_content: hasExplicitCampaign ? utmContent : (existing.utm_content || utmContent || ""),
      gclid: hasExplicitCampaign ? gclid : (existing.gclid || gclid || ""),
      fbclid: hasExplicitCampaign ? fbclid : (existing.fbclid || fbclid || ""),
      msclkid: hasExplicitCampaign ? msclkid : (existing.msclkid || msclkid || ""),
      referrer: referrer || existing.referrer || "",
      last_landing_page: currentLanding,
      last_touch_timestamp: new Date().toISOString(),
      _timestamp: Date.now()
    };

    safeStorageSet(sessionStorage, attribution);
    safeStorageSet(localStorage, attribution);

    return attribution;
  }

  var activeAttribution = captureAttribution();

  // Public Attribution API
  window.CraftegonAttribution = {
    get: function () {
      return getStoredAttribution() || activeAttribution || {};
    },
    decorateUrl: function (urlStr) {
      if (!urlStr || typeof urlStr !== "string") return urlStr;
      if (urlStr.startsWith("mailto:") || urlStr.startsWith("tel:") || urlStr.startsWith("javascript:") || urlStr.startsWith("#")) {
        return urlStr;
      }
      try {
        var attr = this.get();
        if (!attr.utm_source && !attr.gclid && !attr.fbclid) return urlStr;

        var url = new URL(urlStr, window.location.origin);
        if (url.origin !== window.location.origin) return urlStr; // do not decorate external domains

        if (attr.utm_source && !url.searchParams.has("utm_source")) url.searchParams.set("utm_source", attr.utm_source);
        if (attr.utm_medium && !url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", attr.utm_medium);
        if (attr.utm_campaign && !url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", attr.utm_campaign);
        if (attr.gclid && !url.searchParams.has("gclid")) url.searchParams.set("gclid", attr.gclid);
        if (attr.fbclid && !url.searchParams.has("fbclid")) url.searchParams.set("fbclid", attr.fbclid);

        return url.pathname + url.search + url.hash;
      } catch (e) {
        return urlStr;
      }
    },
    decorateAllInternalConversionLinks: function () {
      if (typeof document === "undefined") return;
      var links = document.querySelectorAll('a[href^="/conversion/"], a[href^="/contact"], a[href*="wa.me"]');
      var self = this;
      links.forEach(function (link) {
        var href = link.getAttribute("href");
        if (href && !href.includes("wa.me")) {
          link.setAttribute("href", self.decorateUrl(href));
        }
      });
    }
  };

  // Run link decoration once DOM is ready
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        window.CraftegonAttribution.decorateAllInternalConversionLinks();
      });
    } else {
      window.CraftegonAttribution.decorateAllInternalConversionLinks();
    }
  }
})();
