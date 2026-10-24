/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - GLOBAL NAVIGATION & LAYOUT INJECTOR
 * ==========================================================================
 */

function ensureSearchScriptsLoaded() {
  return new Promise((resolve) => {
    let indexReady = typeof window.CRAFTEGON_SERVICE_CATALOG !== 'undefined';
    let engineReady = typeof window.CraftEgonSearch !== 'undefined';

    if (indexReady && engineReady) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= 2 || (window.CraftEgonSearch && window.CRAFTEGON_SERVICE_CATALOG)) {
        resolve();
      }
    };

    if (!indexReady && !document.getElementById('craftegon-search-index-script')) {
      const idxScript = document.createElement('script');
      idxScript.id = 'craftegon-search-index-script';
      idxScript.src = '/assets/js/search-index.js';
      idxScript.onload = checkComplete;
      idxScript.onerror = checkComplete;
      document.head.appendChild(idxScript);
    } else {
      checkComplete();
    }

    if (!engineReady && !document.getElementById('craftegon-service-search-script')) {
      const engineScript = document.createElement('script');
      engineScript.id = 'craftegon-service-search-script';
      engineScript.src = '/assets/js/service-search.js';
      engineScript.onload = checkComplete;
      engineScript.onerror = checkComplete;
      document.head.appendChild(engineScript);
    } else {
      checkComplete();
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // 0. Ensure Central Configuration is loaded
  if (!window.CRAFTEGON_CONFIG && !document.getElementById("craftegon-config-script")) {
    const configScript = document.createElement("script");
    configScript.id = "craftegon-config-script";
    configScript.src = "/assets/js/config.js";
    document.head.appendChild(configScript);
  }

  preserveConversionContext();
  injectServiceDiscoveryReciprocal();

  // 1. Load and inject Navbar with graceful fallback
  const navContainer = document.getElementById("global-navbar") || document.getElementById("global-header");
  if (navContainer) {
    try {
      const navResponse = await fetch("/components/navbar.html");
      if (navResponse.ok) {
        navContainer.innerHTML = await navResponse.text();
      } else {
        throw new Error("Navbar component not found");
      }
    } catch (error) {
      navContainer.innerHTML = `
        <header class="if-header">
          <div class="if-header-inner">
            <a href="/index.html" class="if-brand-logo" aria-label="CraftEgon Corporate Services Home">
              <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon Corporate Services Insignia" class="brand-logo-img">
              <div class="brand-text-block">
                <span class="brand-title" style="font-family: var(--font-heading); letter-spacing: 0.04em; font-weight: 700; color: var(--text-dark, #0F172A);">CRAFTEGON</span>
                <span class="brand-subtitle" style="font-family: var(--font-body); font-size: 0.72rem; color: var(--brand-gold, #B4881B); letter-spacing: 0.05em; text-transform: uppercase;">Corporate Services</span>
              </div>
            </a>
            <nav class="if-nav">
              <a href="/index.html" class="if-nav-link">Home</a>
              <a href="/index.html#practice-areas" class="if-nav-link">Practice Areas</a>
              <a href="/portal/dashboard.html" class="if-nav-link" style="color: var(--brand-gold);">Client Portal</a>
              <a href="/conversion/index.html" class="if-nav-link">Diagnostic Tools</a>
              <a href="/knowledge/index.html" class="if-nav-link">Knowledge Centre</a>
              <a href="/conversion/calculator.html" class="if-nav-link">Fee Estimator</a>
            </nav>
            <div class="if-header-actions">
              <a href="https://wa.me/918606918247" target="_blank" rel="noopener noreferrer" class="if-btn-secondary" style="border-color: rgba(37, 211, 102, 0.4); color: #25D366; padding: 0.6rem 0.95rem;">WhatsApp</a>
              <a href="/portal/dashboard.html" class="if-btn-secondary" style="border-color: rgba(212, 175, 55, 0.4);"><span class="noble-badge-dot" style="margin-right: 4px;"></span>Client Portal</a>
              <a href="/conversion/ai-document-generator.html" class="if-btn-secondary">Doc Drafter</a>
              <a href="/conversion/calculator.html" class="if-btn-primary">Calculate Retainer</a>
              <button class="if-mobile-toggle" id="mobile-menu-toggle" aria-label="Open Navigation Menu" aria-expanded="false">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            </div>
          </div>
          <div class="if-mobile-backdrop" id="mobile-drawer-backdrop"></div>
          <div class="if-mobile-drawer" id="mobile-drawer" aria-hidden="true">
            <div class="if-mobile-drawer-header">
              <a href="/index.html" class="if-brand-logo" aria-label="CraftEgon Corporate Services Home">
                <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon Corporate Services Insignia" class="brand-logo-img">
                <div class="brand-text-block">
                  <span class="brand-title" style="font-family: var(--font-heading); letter-spacing: 0.04em; font-weight: 700; color: var(--text-dark, #0F172A);">CRAFTEGON</span>
                  <span class="brand-subtitle" style="font-family: var(--font-body); font-size: 0.72rem; color: var(--brand-gold, #B4881B); letter-spacing: 0.05em; text-transform: uppercase;">Corporate Services</span>
                </div>
              </a>
              <button class="if-mobile-drawer-close" id="mobile-drawer-close" aria-label="Close Navigation Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="if-mobile-drawer-body">
              <a href="/index.html" class="if-mobile-nav-link">Home</a>
              <a href="/index.html#practice-areas" class="if-mobile-nav-link">Practice Areas</a>
              <a href="https://wa.me/918606918247" target="_blank" rel="noopener noreferrer" class="if-mobile-nav-link" style="color: #25D366; font-weight:700;">💬 WhatsApp Desk: +91 86069 18247</a>
              <a href="/portal/dashboard.html" class="if-mobile-nav-link" style="color: var(--gold-light); font-weight:700;">Client Portal &amp; Calendar</a>
              <a href="/portal/subscription.html" class="if-mobile-nav-link">Retainer Plans</a>
              <a href="/conversion/index.html" class="if-mobile-nav-link">Diagnostic Tools</a>
              <a href="/knowledge/index.html" class="if-mobile-nav-link">Knowledge Centre</a>
              <a href="/conversion/ai-document-generator.html" class="if-mobile-btn-ai" style="margin-top: 1rem;">Doc Drafter</a>
            </div>
          </div>
        </header>
      `;
    }

    initDropdowns();
    initMobileNav();
    highlightActiveRoute();

    // Initialize Universal Service Search
    ensureSearchScriptsLoaded().then(() => {
      if (window.CraftEgonSearch && typeof window.CraftEgonSearch.initHeaderSearch === 'function') {
        window.CraftEgonSearch.initHeaderSearch();
      }
    });
  }

  // 2. Load and inject Footer with graceful fallback
  const footerContainer = document.getElementById("global-footer");
  if (footerContainer) {
    try {
      const footerResponse = await fetch("/components/footer.html");
      if (footerResponse.ok) {
        footerContainer.innerHTML = await footerResponse.text();
      } else {
        throw new Error("Footer component not found");
      }
    } catch (error) {
      footerContainer.innerHTML = `
        <footer class="if-footer">
          <div class="if-footer-inner">
            <div class="if-footer-grid">
              <div class="if-footer-col if-footer-brand">
                <a href="/index.html" class="if-brand-logo" aria-label="CraftEgon Corporate Services Home">
                  <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon Corporate Services Insignia" class="brand-logo-img">
                  <div class="brand-text-block">
                    <span class="brand-title">CRAFTEGON</span>
                    <span class="brand-subtitle">Corporate Services</span>
                  </div>
                </a>
                <p class="if-footer-desc">
                  Corporate secretarial, regulatory compliance, and statutory filing services for companies, LLPs, and foreign subsidiaries in India.
                </p>
                <div class="if-footer-contact">
                  <p class="if-contact-item"><strong>Entity:</strong> CraftEgon LLP</p>
                  <p class="if-contact-item"><strong>Office:</strong> Kozhikode, Kerala, India &bull; PIN 673001</p>
                  <p class="if-contact-item"><strong>Phone:</strong> <a href="tel:+918606918247">+91 86069 18247</a></p>
                  <p class="if-contact-item"><strong>WhatsApp:</strong> <a href="https://wa.me/918606918247" target="_blank" rel="noopener noreferrer">+91 86069 18247 &bull; Chat Live &rarr;</a></p>
                  <p class="if-contact-item"><strong>Email:</strong> <a href="mailto:admin@craftegon.com">admin@craftegon.com</a></p>
                </div>
              </div>
              <div class="if-footer-col">
                <h4 class="if-footer-heading">Services</h4>
                <ul class="if-footer-list">
                  <li><a href="/verticals/01-entity-formation.html">Entity Formation &amp; Structuring</a></li>
                  <li><a href="/verticals/02-roc-compliance.html">RoC Secretarial &amp; Annual Filings</a></li>
                  <li><a href="/verticals/03-tax-compliance.html">Corporate Tax &amp; GST Compliance</a></li>
                  <li><a href="/verticals/04-statutory-licenses.html">Statutory Licenses &amp; Registrations</a></li>
                  <li><a href="/verticals/05-contracts-legal.html">Commercial Contracts &amp; Drafting</a></li>
                  <li><a href="/verticals/06-ipr-protection.html">IPR &amp; Trademark Protection</a></li>
                  <li><a href="/verticals/10-litigation-dispute.html">Dispute Avoidance (Non-Litigation)</a></li>
                  <li><a href="/verticals/12-esg-csr.html">Data Privacy &amp; Tech Law</a></li>
                  <li><a href="/verticals/13-cross-border-fema.html">Cross-Border FDI &amp; FEMA</a></li>
                  <li class="if-footer-all-link"><a href="/index.html#practice-areas">Explore All Practice Areas &rarr;</a></li>
                </ul>
              </div>
              <div class="if-footer-col">
                <h4 class="if-footer-heading">Company &amp; Resources</h4>
                <ul class="if-footer-list">
                  <li><a href="/portal/dashboard.html">Client Portal &amp; Compliance Calendar</a></li>
                  <li><a href="/portal/subscription.html">Annual Retainer Plans</a></li>
                  <li><a href="/knowledge/index.html">Compliance Knowledge Centre</a></li>
                  <li><a href="/conversion/calculator.html">RoC Late Fee Calculator</a></li>
                  <li><a href="/conversion/index.html">Diagnostic Tools &amp; Checkers</a></li>
                  <li><a href="/conversion/retainer-desk.html">Contact Compliance Desk</a></li>
                </ul>
              </div>
            </div>
            <div class="if-footer-legal-row">
              <nav class="if-footer-legal-nav" aria-label="Legal and Policy Links">
                <a href="/legal/terms.html">Terms &amp; Conditions</a>
                <span class="if-legal-sep">&bull;</span>
                <a href="/legal/privacy.html">Privacy Policy</a>
                <span class="if-legal-sep">&bull;</span>
                <a href="/legal/refund.html">Refund Policy</a>
                <span class="if-legal-sep">&bull;</span>
                <a href="/legal/disclaimer.html">Professional Disclaimer</a>
                <span class="if-legal-sep">&bull;</span>
                <a href="/legal/confidentiality.html">Confidentiality Policy</a>
              </nav>
            </div>
            <div class="if-footer-bottom">
              <p class="if-footer-disclaimer">
                <strong>Statutory Disclosure:</strong> CraftEgon CCS provides corporate secretarial, compliance, and procedural documentation infrastructure. We do not provide court appearances or litigation advocacy; matters requiring courtroom representation must be handled by an independent advocate enrolled under the Advocates Act, 1961. <a href="/legal/disclaimer.html">Read full professional disclaimer &rarr;</a>
              </p>
              <p class="if-footer-copy">
                &copy; 2026 CraftEgon LLP. All rights reserved. Registered Office: Kozhikode, Kerala, India &bull; PIN 673001. Operating across all RoC Jurisdictions nationwide.
              </p>
            </div>
          </div>
        </footer>
      `;
    }
  }

  // 3. Load CraftEgon AI Chat Widget
  if (!document.getElementById("craftegon-chat-script") && !window.__CRAFTEGON_CHAT_INITIALIZED__) {
    const chatScript = document.createElement("script");
    chatScript.id = "craftegon-chat-script";
    chatScript.src = "/assets/js/chat-widget.js";
    chatScript.defer = true;
    document.body.appendChild(chatScript);
  }
});

function initDropdowns() {
  const dropdowns = Array.from(document.querySelectorAll(".if-dropdown"));
  if (!dropdowns.length) return;

  let activeDropdown = null;
  let closeTimer = null;

  function closeAllDropdowns() {
    dropdowns.forEach((dd) => {
      dd.classList.remove("is-open");
      dd.classList.add("is-closed");
      const trigger = dd.querySelector(".if-nav-link");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
    activeDropdown = null;
  }

  function openDropdown(dd) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    // Close other dropdowns immediately
    dropdowns.forEach((other) => {
      if (other !== dd) {
        other.classList.remove("is-open");
        other.classList.add("is-closed");
        const trigger = other.querySelector(".if-nav-link");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });

    dd.classList.remove("is-closed");
    dd.classList.add("is-open");
    const trigger = dd.querySelector(".if-nav-link");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    activeDropdown = dd;
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".if-nav-link");
    const menu = dropdown.querySelector(".if-dropdown-content, .if-megamenu");
    if (!trigger || !menu) return;

    // Hover management on desktop
    dropdown.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 1024) {
        openDropdown(dropdown);
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 1024) {
        closeTimer = setTimeout(() => {
          if (activeDropdown === dropdown) {
            dropdown.classList.remove("is-open");
            dropdown.classList.add("is-closed");
            trigger.setAttribute("aria-expanded", "false");
            activeDropdown = null;
          }
        }, 160);
      }
    });

    // Keyboard focus management
    dropdown.addEventListener("focusin", () => {
      if (window.innerWidth >= 1024) {
        openDropdown(dropdown);
      }
    });

    dropdown.addEventListener("focusout", (e) => {
      if (window.innerWidth >= 1024) {
        setTimeout(() => {
          if (!dropdown.contains(document.activeElement)) {
            dropdown.classList.remove("is-open");
            dropdown.classList.add("is-closed");
            trigger.setAttribute("aria-expanded", "false");
            if (activeDropdown === dropdown) activeDropdown = null;
          }
        }, 10);
      }
    });

    // Mobile click toggle
    trigger.addEventListener("click", (e) => {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        const isOpen = dropdown.classList.contains("is-open");
        if (isOpen) {
          dropdown.classList.remove("is-open");
          dropdown.classList.add("is-closed");
          trigger.setAttribute("aria-expanded", "false");
        } else {
          openDropdown(dropdown);
        }
      }
    });
  });

  // Global dismiss on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeDropdown) {
      const trigger = activeDropdown.querySelector(".if-nav-link");
      closeAllDropdowns();
      if (trigger) trigger.focus();
    }
  });

  // Global dismiss on click outside
  document.addEventListener("click", (e) => {
    if (activeDropdown && !activeDropdown.contains(e.target)) {
      closeAllDropdowns();
    }
  });
}

function initMobileNav() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const drawer = document.getElementById("mobile-drawer");
  const closeBtn = document.getElementById("mobile-drawer-close");
  const backdrop = document.getElementById("mobile-drawer-backdrop");

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add("active");
    if (backdrop) backdrop.classList.add("active");
    drawer.setAttribute("aria-hidden", "false");
    toggleBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });
}

function preserveConversionContext() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const pageType = pathParts[0];
  const pageId = pathParts[pathParts.length - 1]?.replace(/\.(html|htm)$/i, "");
  if (!["services", "verticals"].includes(pageType) || !pageId) return;

  document.querySelectorAll('main a[href^="/conversion/"]').forEach((link) => {
    const destination = new URL(link.href, window.location.origin);
    if (pageType === "services") destination.searchParams.set("service_id", pageId);
    if (pageType === "verticals") destination.searchParams.set("service_category", pageId);
    destination.searchParams.set("source_path", window.location.pathname);
    link.href = destination.pathname + destination.search + destination.hash;
  });
}

function highlightActiveRoute() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".if-nav-link");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && currentPath.includes(href) && href !== "/index.html" && href !== "/") {
      link.style.color = "var(--primary)";
      link.style.fontWeight = "600";
    }
  });
}

function ensureSearchScriptsLoaded() {
  return new Promise((resolve) => {
    if (window.CraftEgonSearch && window.CRAFTEGON_SERVICE_CATALOG) {
      return resolve();
    }
    if (!document.getElementById("craftegon-search-index-script")) {
      const s1 = document.createElement("script");
      s1.id = "craftegon-search-index-script";
      s1.src = "/assets/js/search-index.js";
      s1.onload = () => {
        if (!document.getElementById("craftegon-service-search-script")) {
          const s2 = document.createElement("script");
          s2.id = "craftegon-service-search-script";
          s2.src = "/assets/js/service-search.js";
          s2.onload = () => resolve();
          s2.onerror = () => resolve();
          document.body.appendChild(s2);
        } else {
          resolve();
        }
      };
      s1.onerror = () => resolve();
      document.body.appendChild(s1);
    } else {
      resolve();
    }
  });
}

function injectServiceDiscoveryReciprocal() {
  const path = window.location.pathname;
  if (!path.includes("/services/") || path.endsWith("/services.html") || path.endsWith("/services")) return;

  // 1. Add back link to breadcrumb if present
  const breadcrumb = document.querySelector(".if-breadcrumb");
  if (breadcrumb && !breadcrumb.querySelector(".service-dir-backlink")) {
    const backLink = document.createElement("a");
    backLink.className = "service-dir-backlink";
    backLink.href = "/services.html";
    backLink.style.cssText = "margin-left:auto; font-size:0.8rem; color:var(--brand-gold, #C59B27); text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:4px;";
    backLink.innerHTML = "<span>← All 57 Services</span>";
    breadcrumb.style.display = "flex";
    breadcrumb.style.alignItems = "center";
    breadcrumb.appendChild(backLink);
  }

  // 2. Add reciprocal related services widget at the bottom of <main>
  const main = document.querySelector("main");
  if (main && !document.getElementById("reciprocal-service-discovery")) {
    ensureSearchScriptsLoaded().then(() => {
      const catalog = window.CRAFTEGON_SERVICE_CATALOG;
      if (!catalog) return;

      const currentService = catalog.find(s => s.route === path || s.route.endsWith(path.split("/").pop()));
      if (!currentService) return;

      const related = catalog.filter(s => s.vertical_id === currentService.vertical_id && s.route !== currentService.route).slice(0, 3);
      if (related.length === 0) return;

      const widget = document.createElement("section");
      widget.id = "reciprocal-service-discovery";
      widget.style.cssText = "margin: 3.5rem auto 1.5rem; max-width: 800px; padding: 1.75rem; background: #FFFFFF; border: 1px solid var(--border-color, #E2E8F0); border-radius: 12px; box-shadow: 0 4px 16px rgba(15,23,42,0.04);";

      let relatedHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--brand-gold, #C59B27); font-weight: 700;">Adjacent Regulatory Filings</span>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-dark, #090D16); margin: 0.2rem 0 0;">Related Services in ${currentService.vertical_name}</h3>
          </div>
          <a href="/services.html?vertical=${encodeURIComponent(currentService.vertical_id)}" style="font-size: 0.82rem; font-weight: 700; color: var(--brand-gold, #C59B27); text-decoration: none;">View all in category &rarr;</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem;">
      `;

      related.forEach(item => {
        const isRef = item.is_referral;
        relatedHtml += `
          <a href="${item.route}" style="display: block; padding: 0.85rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.2s ease;">
            <div style="font-family: var(--font-mono, monospace); font-size: 0.68rem; color: var(--brand-gold, #C59B27); margin-bottom: 0.3rem;">${item.id}</div>
            <div style="font-weight: 600; font-size: 0.85rem; color: #090D16; line-height: 1.35; margin-bottom: 0.4rem;">${item.name}</div>
            <div style="font-size: 0.74rem; color: #64748B; display: flex; align-items: center; justify-content: space-between;">
              <span>${isRef ? 'Referral Service' : 'Direct Service'}</span>
              <span style="color: var(--brand-gold, #C59B27);">&rarr;</span>
            </div>
          </a>
        `;
      });

      relatedHtml += `
        </div>
        <div style="margin-top: 1.25rem; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 1rem;">
          <a href="/services.html" style="font-size: 0.825rem; font-weight: 700; color: var(--text-dark, #090D16); text-decoration: none;">
            🔍 Looking for a different compliance filing? Browse the complete 57-service directory &rarr;
          </a>
        </div>
      `;

      widget.innerHTML = relatedHtml;
      main.appendChild(widget);
    });
  }
}

