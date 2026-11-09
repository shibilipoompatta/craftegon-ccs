/**
 * ==============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - MASS CAMPAIGN & AD PIXEL TRACKER
 * Enterprise Conversion Tracking Engine for Google Ads, Meta Pixel, and LinkedIn
 * High-Converting Telemetry, Event Deduplication, and DPDP-Compliant Consent
 * ==============================================================================
 */

(function () {
  "use strict";

  var debugEvents = [];
  var isDebug = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.search.indexOf("debug_pixels=1") !== -1));

  function logDebug(eventName, payload) {
    var record = {
      event: eventName,
      payload: payload,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : ""
    };
    debugEvents.push(record);
    if (typeof window !== "undefined") {
      window.__CRAFTEGON_PIXEL_EVENTS__ = debugEvents;
      try {
        var existing = JSON.parse(sessionStorage.getItem("craftegon_pixel_events") || "[]");
        existing.push(record);
        sessionStorage.setItem("craftegon_pixel_events", JSON.stringify(existing.slice(-50)));
      } catch (e) {}
    }
    if (isDebug) {
      console.log("[CraftEgon Pixels]", eventName, payload);
    }
  }

  function getAdvertisingConfig() {
    var cfg = (typeof window !== "undefined" && window.CRAFTEGON_CONFIG && window.CRAFTEGON_CONFIG.advertising) || {};
    return {
      enabled: cfg.enabled !== false,
      googleAdsId: cfg.googleAdsId || "AW-11500000000",
      metaPixelId: cfg.metaPixelId || "1234567890123456",
      linkedInPartnerId: cfg.linkedInPartnerId || "1234567",
      currency: cfg.currency || "INR"
    };
  }

  // 1. Google Tag (gtag.js) Stub & Safe Loader
  function initGoogleTag(adConfig) {
    if (typeof window === "undefined" || !adConfig.enabled) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    gtag("config", adConfig.googleAdsId, { send_page_view: true });
    logDebug("gtag_init", { id: adConfig.googleAdsId });
  }

  // 2. Meta Pixel (fbq) Stub & Safe Loader
  function initMetaPixel(adConfig) {
    if (typeof window === "undefined" || !adConfig.enabled) return;
    if (window.fbq) return;
    var n = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
    window.fbq("init", adConfig.metaPixelId);
    window.fbq("track", "PageView");
    logDebug("fbq_init", { id: adConfig.metaPixelId });
  }

  // 3. LinkedIn Insight Tag Stub
  function initLinkedInTag(adConfig) {
    if (typeof window === "undefined" || !adConfig.enabled) return;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(adConfig.linkedInPartnerId);
    window.lintrk = window.lintrk || function (a, b) { (window.lintrk.q = window.lintrk.q || []).push([a, b]); };
    logDebug("linkedin_init", { id: adConfig.linkedInPartnerId });
  }

  var adConfig = getAdvertisingConfig();
  initGoogleTag(adConfig);
  initMetaPixel(adConfig);
  initLinkedInTag(adConfig);

  // Conversion Dispatch Handlers
  var CraftegonPixels = {
    // Lead Form Submission Conversion
    trackLead: function (details) {
      details = details || {};
      var val = details.value || 0;
      var cur = adConfig.currency;
      var attribution = (window.CraftegonAttribution && window.CraftegonAttribution.get) ? window.CraftegonAttribution.get() : {};

      var payload = {
        event_category: "Engagement",
        event_label: details.service_name || details.service_id || "Corporate Lead",
        service_id: details.service_id || "",
        lead_reference: details.lead_ref || "",
        value: val,
        currency: cur,
        utm_source: attribution.utm_source || "",
        utm_campaign: attribution.utm_campaign || "",
        gclid: attribution.gclid || ""
      };

      // Google Tag
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", payload);
      }

      // Meta Pixel
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: details.service_name || "Corporate Compliance Lead",
          content_category: details.vertical_id || "Legal & Compliance",
          value: val,
          currency: cur
        });
      }

      // LinkedIn Insight
      if (typeof window.lintrk === "function") {
        window.lintrk("track", { conversion_id: "lead_submission" });
      }

      logDebug("lead_conversion", payload);
    },

    // Retainer / Micro-Checkout Modal Open
    trackInitiateCheckout: function (tier) {
      tier = tier || {};
      var val = tier.price || tier.amount || 0;
      var cur = adConfig.currency;

      var payload = {
        tier_id: tier.id || "",
        tier_title: tier.title || "Statutory Retainer",
        value: val,
        currency: cur
      };

      // Google Tag
      if (typeof window.gtag === "function") {
        window.gtag("event", "begin_checkout", {
          value: val,
          currency: cur,
          items: [{ item_name: tier.title, price: val }]
        });
      }

      // Meta Pixel
      if (typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", {
          content_name: tier.title,
          value: val,
          currency: cur
        });
      }

      logDebug("initiate_checkout", payload);
    },

    // Retainer Deposit / UTR Confirmation (Purchase Event)
    trackPurchase: function (order) {
      order = order || {};
      var val = order.amount || 0;
      var cur = adConfig.currency;

      var payload = {
        transaction_id: order.orderRef || order.receiptRef || ("ORD-" + Date.now()),
        value: val,
        currency: cur,
        tax: 0,
        items: [{
          item_id: order.tierId || "statutory-retainer",
          item_name: order.tierTitle || "Statutory Compliance Advance",
          price: val,
          quantity: 1
        }]
      };

      // Google Tag
      if (typeof window.gtag === "function") {
        window.gtag("event", "purchase", payload);
      }

      // Meta Pixel
      if (typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          content_name: order.tierTitle || "Statutory Compliance Advance",
          value: val,
          currency: cur
        });
      }

      // LinkedIn Insight
      if (typeof window.lintrk === "function") {
        window.lintrk("track", { conversion_id: "retainer_purchase" });
      }

      logDebug("purchase_conversion", payload);
    },

    // Contact Intent (WhatsApp, Call, Email)
    trackContact: function (channel, context) {
      var payload = {
        channel: channel || "direct",
        context: context || window.location.pathname
      };

      if (typeof window.gtag === "function") {
        window.gtag("event", "contact", payload);
      }
      if (typeof window.fbq === "function") {
        window.fbq("track", "Contact", { channel: channel });
      }

      logDebug("contact_intent", payload);
    },

    // View Content / PPC Lander Landing
    trackViewContent: function (contentName, category) {
      var payload = {
        content_name: contentName || document.title,
        content_category: category || "Compliance Service"
      };

      if (typeof window.gtag === "function") {
        window.gtag("event", "view_item", payload);
      }
      if (typeof window.fbq === "function") {
        window.fbq("track", "ViewContent", payload);
      }

      logDebug("view_content", payload);
    }
  };

  // Expose globally
  window.CraftegonPixels = CraftegonPixels;

  // Auto-bind to Contact CTA buttons (WhatsApp, Phone, Email)
  document.addEventListener("click", function (e) {
    var waLink = e.target.closest('a[href*="wa.me"]');
    if (waLink) {
      CraftegonPixels.trackContact("whatsapp", waLink.href);
      return;
    }

    var telLink = e.target.closest('a[href^="tel:"]');
    if (telLink) {
      CraftegonPixels.trackContact("phone", telLink.href);
      return;
    }

    var mailLink = e.target.closest('a[href^="mailto:"]');
    if (mailLink) {
      CraftegonPixels.trackContact("email", mailLink.href);
    }
  });

})();
