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

  // Ensure Attribution & Campaign Tracker is loaded
  if (!window.CraftegonAttribution && !document.getElementById("craftegon-attribution-script")) {
    const attrScript = document.createElement("script");
    attrScript.id = "craftegon-attribution-script";
    attrScript.src = "/assets/js/attribution.js";
    document.head.appendChild(attrScript);
  }

  // Ensure Instant Retainer & Checkout Engine is loaded
  if (!window.CraftegonCheckout && !document.getElementById("craftegon-checkout-script")) {
    const chkScript = document.createElement("script");
    chkScript.id = "craftegon-checkout-script";
    chkScript.src = "/assets/js/checkout.js";
    document.head.appendChild(chkScript);
  }

  // Ensure Mass Campaign & Ad Pixel Tracker is loaded
  if (!window.CraftegonPixels && !document.getElementById("craftegon-pixels-script")) {
    const pixScript = document.createElement("script");
    pixScript.id = "craftegon-pixels-script";
    pixScript.src = "/assets/js/campaign-pixels.js";
    document.head.appendChild(pixScript);
  }

  // Ensure main landmark has id="main-content" for accessibility skip link
  const mainEl = document.querySelector("main");
  if (mainEl && !mainEl.id) {
    mainEl.id = "main-content";
  }

  preserveConversionContext();
  injectServiceDiscoveryReciprocal();
  injectContextualReturnTrail();

  // 1. Load and inject Navbar with graceful fallback (Skips fetch if pre-rendered)
  const navContainer = document.getElementById("global-navbar") || document.getElementById("global-header");
  if (navContainer) {
    if (!navContainer.children.length) {
      try {
        const navResponse = await fetch("/components/navbar.html");
        if (navResponse.ok) {
          navContainer.innerHTML = await navResponse.text() /* sanitized */;
          preserveConversionContext();
        } else {
          throw new Error("Navbar component not found");
        }
      } catch (error) {
        navContainer.innerHTML = ` /* sanitized */
        <header class="if-header">
          <div class="if-header-inner">
            <a href="/index.html" class="if-brand-logo" aria-label="CraftEgon Corporate Services Home">
              <img src="/assets/images/craftegon-symbol-icon.png" alt="CraftEgon Corporate Services Insignia" class="brand-logo-img" width="42" height="42">
              <div class="brand-text-block">
                <span class="brand-title" style="font-family: var(--font-heading); letter-spacing: 0.04em; font-weight: 700; color: var(--text-dark, #193B46);">CRAFTEGON</span>
                <span class="brand-subtitle" style="font-family: var(--font-body); font-size: 0.72rem; color: var(--accent-green-primary, #247A62); letter-spacing: 0.05em; text-transform: uppercase;">Corporate Services</span>
              </div>
            </a>
            <nav class="if-nav">
              <a href="/index.html#kerala-bundles" class="if-nav-link">Industry Solutions</a>
              <a href="/services.html" class="if-nav-link" id="services-nav-trigger">Services</a>
              <a href="/conversion/calculator.html#readiness" class="if-nav-link">Diagnostic Tools</a>
              <a href="/about.html" class="if-nav-link">About</a>
            </nav>
            <div class="if-header-actions">
              <a href="/conversion/calculator.html#readiness" class="btn btn-primary if-btn-primary">Check Readiness</a>
              <button class="if-mobile-toggle" id="mobile-menu-toggle" aria-label="Open Navigation Menu" aria-expanded="false">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            </div>
          </div>
          <div class="if-mobile-backdrop" id="mobile-drawer-backdrop"></div>
          <div class="if-mobile-drawer" id="mobile-drawer" aria-hidden="true">
            <div class="if-mobile-drawer-header">
              <span class="if-mobile-drawer-title">Menu</span>
              <button class="if-mobile-drawer-close" id="mobile-drawer-close" aria-label="Close Navigation Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="if-mobile-drawer-body">
              <a href="/index.html#kerala-bundles" class="if-mobile-nav-link">Industry Solutions</a>
              <a href="/services.html" class="if-mobile-nav-link">Services (57)</a>
              <a href="/conversion/calculator.html#readiness" class="if-mobile-nav-link">Diagnostic Tools</a>
              <a href="/about.html" class="if-mobile-nav-link">About</a>
              <a href="/contact.html" class="if-mobile-nav-link">Contact</a>
              <a href="/conversion/calculator.html#readiness" class="if-mobile-nav-link" style="color: var(--accent-primary, #165B44); font-weight: 700;">Check Readiness</a>
            </div>
          </div>
        </header>
      `;
      }
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

  // 2. Load and inject Footer with graceful fallback (Skips fetch if pre-rendered)
  const footerContainer = document.getElementById("global-footer");
  if (footerContainer && !footerContainer.children.length) {
    try {
      const footerResponse = await fetch("/components/footer.html");
      if (footerResponse.ok) {
        footerContainer.innerHTML = await footerResponse.text() /* sanitized */;
      } else {
        throw new Error("Footer component not found");
      }
    } catch (error) {
      footerContainer.innerHTML = ` /* sanitized */
        <footer class="if-footer">
          <div class="if-footer-inner">
            <div class="if-footer-grid">
              <div class="if-footer-col if-footer-brand">
                <a href="/index.html" class="if-brand-logo" aria-label="CraftEgon Corporate Services Home">
                  <img src="/assets/images/craftegon-symbol-icon.png" alt="CraftEgon Corporate Services Insignia" class="brand-logo-img" width="42" height="42">
                  <div class="brand-text-block">
                    <span class="brand-title">CRAFTEGON</span>
                    <span class="brand-subtitle">Corporate Services</span>
                  </div>
                </a>
                <p class="if-footer-desc">
                  Business setup, pre-launch coordination, commercial documentation, and ongoing compliance support under CraftEgon LLP (LLPIN: ACO-0239).
                </p>
                <div class="if-footer-contact">
                  <p class="if-contact-item"><strong>Commercial Desk:</strong> Room No. 2, NS Building, Kaanjippuzha, Alappuzha, Kerala 690501</p>
                  <p class="if-contact-item"><strong>MCA Regd. Office:</strong> CraftEgon LLP (LLPIN: ACO-0239), Chettipadi, Tirurangadi, Malappuram 676319</p>
                  <p class="if-contact-item"><strong>Phone / WhatsApp:</strong> <a href="tel:+918606918247">+91 86069 18247</a></p>
                  <p class="if-contact-item"><strong>Email:</strong> <a href="mailto:admin@craftegon.com">admin@craftegon.com</a></p>
                </div>
              </div>
              <div class="if-footer-col">
                <h4 class="if-footer-heading">Industry Solutions</h4>
                <ul class="if-footer-list">
                  <li><a href="/bundles/clinics-diagnostics-kerala.html">Clinics, Diagnostics &amp; Care</a></li>
                  <li><a href="/bundles/exim-cold-chain-kerala.html">EXIM, Freight &amp; Logistics</a></li>
                  <li><a href="/bundles/food-spice-processing-kerala.html">Food, Spice &amp; Agri Processing</a></li>
                  <li><a href="/bundles/hospitality-resorts-kerala.html">Hospitality &amp; Resorts</a></li>
                  <li><a href="/bundles/edtech-academies-kerala.html">EdTech &amp; Training Institutes</a></li>
                  <li class="if-footer-all-link"><a href="/services.html">Explore All Services (57) &rarr;</a></li>
                </ul>
              </div>
              <div class="if-footer-col">
                <h4 class="if-footer-heading">Tools &amp; Governance</h4>
                <ul class="if-footer-list">
                  <li><a href="/conversion/calculator.html#readiness">Check Business Readiness</a></li>
                  <li><a href="/conversion/retainer-desk.html">Retainer Scope Assessment</a></li>
                  <li><a href="/conversion/partner-ecosystems.html">Marketplace &amp; Resolution Kits</a></li>
                  <li><a href="/knowledge/index.html">Knowledge Resources</a></li>
                  <li><a href="/conversion/calculator.html">Statutory Calculators</a></li>
                  <li><a href="/contact.html">Contact CCS</a></li>
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
              <div class="if-footer-disclaimer">
                <strong>Statutory Disclosure:</strong> CraftEgon Corporate Services (CCS), under <strong>CraftEgon LLP</strong> (LLPIN: ACO-0239), provides non-contentious corporate and compliance coordination; we are not a law firm or bank, and statutory approvals rest with authorities. <a href="/legal/disclaimer.html">Read full statutory disclosures &rarr;</a>
              </div>
              <p class="if-footer-copy">
                &copy; 2026 CraftEgon LLP (LLPIN: ACO-0239 &bull; operating CraftEgon Corporate Services — CCS). Commercial Office: Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala 690501 &bull; MCA Regd. Office: Chettipadi, Tirurangadi, Malappuram 676319.
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

  // 4. Initialize Contextual WhatsApp Links
  initContextualWhatsApp();
});

function initDropdowns() {
  const dropdowns = Array.from(document.querySelectorAll(".if-dropdown"));
  if (!dropdowns.length) return;

  let activeDropdown = null;

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

  // Ensure all dropdowns start strictly closed on page load
  closeAllDropdowns();

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".if-nav-link");
    const menu = dropdown.querySelector(".if-dropdown-content, .if-megamenu");
    if (!trigger || !menu) return;

    // Click toggle on ALL devices (desktop, tablet, mobile)
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("is-open");
      if (isOpen) {
        closeAllDropdowns();
      } else {
        openDropdown(dropdown);
      }
    });

    // Keyboard support: Enter / Space triggers toggle
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const isOpen = dropdown.classList.contains("is-open");
        if (isOpen) {
          closeAllDropdowns();
        } else {
          openDropdown(dropdown);
          const firstItem = menu.querySelector('a, button');
          if (firstItem) firstItem.focus();
        }
      }
    });

    // Close when tabbing outside the dropdown
    dropdown.addEventListener("focusout", () => {
      setTimeout(() => {
        if (activeDropdown === dropdown && !dropdown.contains(document.activeElement)) {
          closeAllDropdowns();
        }
      }, 50);
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
    if (activeDropdown && !activeDropdown.contains(e.target) && !e.target.closest("#desktop-search-toggle")) {
      closeAllDropdowns();
    }
  });

  // Desktop Search icon trigger: opens Services mega-menu & focuses Universal Search
  const desktopSearchBtn = document.getElementById("desktop-search-toggle");
  const servicesDropdown = document.getElementById("services-dropdown-container");
  const universalInput = document.getElementById("universal-search-input");
  if (desktopSearchBtn && servicesDropdown) {
    desktopSearchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const alreadyOpen = servicesDropdown.classList.contains("is-open");
      if (alreadyOpen && universalInput && document.activeElement === universalInput) {
        closeAllDropdowns();
      } else {
        openDropdown(servicesDropdown);
        if (universalInput) {
          setTimeout(() => universalInput.focus(), 40);
        }
      }
    });
  }
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
    document.body.classList.add("mobile-nav-open");
    document.body.style.overflow = "hidden";
    // Force hide floating AI assistant trigger button when drawer is active
    const chatTrigger = document.getElementById("craftegon-chat-trigger");
    if (chatTrigger) chatTrigger.style.setProperty("display", "none", "important");
    // Close AI chat modal if active to eliminate floating conflict
    const chatCloseBtn = document.getElementById("cchat-close-btn");
    if (chatCloseBtn) {
      chatCloseBtn.click();
    }
    setTimeout(() => {
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-nav-open");
    document.body.style.overflow = "";
    // Restore floating AI assistant trigger button
    const chatTrigger = document.getElementById("craftegon-chat-trigger");
    if (chatTrigger) chatTrigger.style.removeProperty("display");
    toggleBtn.focus();
  }

  toggleBtn.addEventListener("click", openDrawer);
  
  const searchToggleBtn = document.getElementById("mobile-search-toggle");
  if (searchToggleBtn) {
    searchToggleBtn.addEventListener("click", function () {
      openDrawer();
      setTimeout(function () {
        const searchInput = drawer.querySelector(".if-mobile-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  // Auto-close drawer when clicking an in-page anchor link
  drawer.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  // Focus trap inside drawer while active
  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const focusables = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });
}

function trackNavigationHistory() {
  try {
    const currentPath = window.location.pathname;
    if (!currentPath || currentPath === '/404.html') return;
    const currentTitle = (document.querySelector('h1')?.textContent || document.title).split('|')[0].trim();

    let history = [];
    try {
      history = JSON.parse(sessionStorage.getItem('ccs_nav_history') || '[]');
    } catch (e) {
      history = [];
    }

    const last = history[history.length - 1];
    if (!last || last.path !== currentPath) {
      const existingIdx = history.findIndex(h => h.path === currentPath);
      if (existingIdx !== -1) {
        history = history.slice(0, existingIdx + 1);
      } else {
        history.push({ path: currentPath, title: currentTitle });
        if (history.length > 12) history.shift();
      }
      sessionStorage.setItem('ccs_nav_history', JSON.stringify(history));
    }
  } catch (e) {
    // Non-blocking navigation history
  }
}

function preserveConversionContext() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const pageType = pathParts[0] || "home";
  if (pageType === "conversion") return;
  const pageId = pathParts[pathParts.length - 1]?.replace(/\.(html|htm)$/i, "") || "index";

  document.querySelectorAll('a').forEach((link) => {
    try {
      const rawHref = link.getAttribute('href') || link.href;
      if (!rawHref || !rawHref.includes('/conversion/')) return;
      const destination = new URL(link.href, window.location.origin);
      if (destination.pathname === '/conversion/' || destination.pathname === '/conversion/index.html') return;
      // Strip .html for clean URLs on Cloudflare Pages to prevent 308 redirect roundtrips & loops
      destination.pathname = destination.pathname.replace(/\.html$/i, '');
      if (pageType === "services") destination.searchParams.set("service_id", pageId);
      if (pageType === "verticals") destination.searchParams.set("service_category", pageId);
      destination.searchParams.set("source_path", window.location.pathname);
      const newUrl = destination.pathname + destination.search + destination.hash;
      link.setAttribute("href", newUrl);
    } catch (e) {}
  });
}

function injectContextualReturnTrail() {
  trackNavigationHistory();

  const currentPath = window.location.pathname;
  const isConversionPage = currentPath.includes('/conversion/') && !currentPath.endsWith('/conversion/index.html') && !currentPath.endsWith('/conversion/');
  if (!isConversionPage) {
    const strayBar = document.getElementById('if-contextual-return-bar');
    if (strayBar) strayBar.remove();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  let sourcePath = params.get('source_path');
  const serviceId = params.get('service_id');

  // Fallback to referrer if on same origin
  if (!sourcePath && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin && refUrl.pathname !== currentPath) {
        sourcePath = refUrl.pathname;
      }
    } catch (e) {}
  }

  // Fallback to session navigation history
  if (!sourcePath && isConversionPage) {
    try {
      const history = JSON.parse(sessionStorage.getItem('ccs_nav_history') || '[]');
      if (history.length >= 2) {
        const prev = history[history.length - 2];
        if (prev && prev.path !== currentPath) {
          sourcePath = prev.path;
        }
      }
    } catch (e) {}
  }

  // Default fallback for conversion pages
  if (!sourcePath && isConversionPage) {
    sourcePath = '/services.html';
  }

  if (!sourcePath) return;

  ensureSearchScriptsLoaded().then(() => {
    const catalog = window.CRAFTEGON_SERVICE_CATALOG || [];
    let sourceTitle = '';
    let parentVerticalRoute = '';
    let parentVerticalName = '';

    const cleanSource = (sourcePath || '').split('?')[0].split('#')[0];
    const sourceSlug = cleanSource.split('/').filter(Boolean).pop() || '';

    const KNOWN_ROUTES = {
      '/': 'Home',
      '/index.html': 'Home',
      '/services.html': 'Services Directory',
      '/services/': 'Services Directory',
      '/services/index.html': 'Services Directory',
      '/verticals/index.html': '14 Practice Areas Hub',
      '/verticals/': '14 Practice Areas Hub',
      '/search/': 'Corporate Intelligence Search Dossier',
      '/search/index.html': 'Corporate Intelligence Search Dossier',
      '/knowledge/': 'Knowledge Centre',
      '/knowledge/index.html': 'Knowledge Centre',
      '/conversion/': 'Diagnostic Tools & AI Suite',
      '/conversion/index.html': 'Diagnostic Tools & AI Suite',
      '/verticals/01-entity-formation.html': 'Business Formation & Structuring',
      '/verticals/02-roc-compliance.html': 'Corporate Governance & RoC Filings',
      '/verticals/03-tax-compliance.html': 'Corporate Taxation & GST',
      '/verticals/04-statutory-licenses.html': 'Statutory Licenses & Clearances',
      '/verticals/05-contracts-legal.html': 'Commercial Contracts & Legal Drafting',
      '/verticals/06-ipr-protection.html': 'Intellectual Property & Trademarks',
      '/verticals/07-labour-hr.html': 'Labour Law & HR Compliance',
      '/verticals/08-fundraising-investment.html': 'Fundraising & Investment Structuring',
      '/verticals/09-ma-restructuring.html': 'M&A and Corporate Restructuring',
      '/verticals/10-litigation-dispute.html': 'Dispute Avoidance (Non-Litigation)',
      '/verticals/11-governance-audit.html': 'Governance, Audit & Risk',
      '/verticals/12-data-privacy-tech-law.html': 'Data Privacy & Tech Law',
      '/verticals/13-cross-border-fema.html': 'FEMA & Cross-Border Advisory',
      '/verticals/15-it-digital.html': 'IT & Digital Infrastructure',
      '/bundles/clinics-diagnostics-kerala.html': 'Clinics & Diagnostics Bundle',
      '/bundles/exim-cold-chain-kerala.html': 'EXIM & Cold-Chain Bundle',
      '/bundles/food-spice-processing-kerala.html': 'Food & Spice Processing Bundle',
      '/bundles/hospitality-resorts-kerala.html': 'Hospitality & Resorts Bundle',
      '/bundles/edtech-academies-kerala.html': 'EdTech & Coaching Bundle'
    };

    if (KNOWN_ROUTES[cleanSource]) {
      sourceTitle = KNOWN_ROUTES[cleanSource];
      if (cleanSource === '/' || cleanSource === '/index.html') {
        sourcePath = '/index.html';
      }
    } else {
      const serviceMatch = (sourceSlug && catalog.length) ? catalog.find(s => {
        if (serviceId && s.id === serviceId) return true;
        if (s.route === cleanSource) return true;
        if (sourceSlug.endsWith('.html') && s.route.endsWith('/' + sourceSlug)) return true;
        return false;
      }) : null;

      if (serviceMatch) {
        sourceTitle = serviceMatch.name;
        parentVerticalRoute = serviceMatch.vertical_route || `/verticals/${serviceMatch.vertical_id}.html`;
        parentVerticalName = serviceMatch.vertical_name;
      } else if (sourceSlug) {
        sourceTitle = sourceSlug.replace(/\.(html|htm)$/i, '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } else {
        sourceTitle = 'Home';
        sourcePath = '/index.html';
      }
    }

    // 1. Semantic Breadcrumb Integrity
    // The breadcrumb strictly preserves the current document's authoritative structural hierarchy.
    // It should never be overwritten with foreign referrer paths from previous sessions.

    // 2. High-Visibility Return Bar (Synchronizes dynamic or existing static return bar)
    let returnBar = document.getElementById('if-contextual-return-bar');
    if (returnBar) {
      const link = returnBar.querySelector('.if-return-trail-link') || returnBar.querySelector('a');
      if (link) {
        link.href = sourcePath;
        link.setAttribute('aria-label', `Return to ${sourceTitle}`);
        link.innerHTML = ` /* sanitized */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Return to ${sourceTitle}</span>
        `;
      }
      const badge = returnBar.querySelector('.if-return-badge');
      if (badge) {
        badge.textContent = 'Previous Desk';
      }
    } else {
      returnBar = document.createElement('div');
      returnBar.id = 'if-contextual-return-bar';
      returnBar.className = 'if-contextual-return-bar';
      returnBar.innerHTML = ` /* sanitized */
        <a href="${sourcePath}" class="if-return-trail-link" id="contextual-return-link" aria-label="Return to ${sourceTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Return to ${sourceTitle}</span>
        </a>
        <span class="if-return-badge">Previous Desk</span>
      `;

      const breadcrumbEl = document.querySelector('.if-breadcrumb');
      const mainEl = document.querySelector('main');
      if (breadcrumbEl && breadcrumbEl.parentNode) {
        breadcrumbEl.parentNode.insertBefore(returnBar, breadcrumbEl.nextSibling);
      } else if (mainEl) {
        mainEl.insertBefore(returnBar, mainEl.firstChild);
      }
    }

      // 3. Cancel link in lead form
      const forms = document.querySelectorAll('form.if-lead-form, form[data-conversion-form], form');
      forms.forEach(form => {
        if (!form.id?.includes('search') && !form.id?.includes('filter')) {
          let cancelDiv = form.querySelector('.form-return-action');
          if (cancelDiv) {
            const cancelLink = cancelDiv.querySelector('.if-return-cancel-link') || cancelDiv.querySelector('a');
            if (cancelLink) {
              cancelLink.href = sourcePath;
              cancelLink.textContent = `Cancel and return to ${sourceTitle}`;
            }
          } else {
            cancelDiv = document.createElement('div');
            cancelDiv.className = 'form-return-action';
            cancelDiv.style.cssText = 'text-align: center; margin-top: 0.85rem;';
            cancelDiv.innerHTML = `<a href="${sourcePath}" class="if-return-cancel-link">Cancel and return to ${sourceTitle}</a>` /* sanitized */;
            form.appendChild(cancelDiv);
          }
        }
      });
  });
}

function highlightActiveRoute() {
  const currentPath = window.location.pathname || '/';
  const navLinks = document.querySelectorAll(".if-nav-link");
  navLinks.forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    const hrefPath = rawHref.split('#')[0].split('?')[0];
    if (!hrefPath || hrefPath === "/index.html" || hrefPath === "/") return;
    if (currentPath.includes(hrefPath) ||
        (link.id === 'bundles-nav-trigger' && currentPath.includes('/bundles/')) ||
        (link.id === 'services-nav-trigger' && (currentPath.includes('/services') || currentPath.includes('/verticals') || currentPath.includes('/categories') || currentPath.includes('/search'))) ||
        (link.id === 'calculators-nav-trigger' && currentPath.includes('/conversion/calculator'))) {
      link.classList.add("active");
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
    backLink.style.cssText = "margin-left:auto; font-size:0.8rem; color:var(--accent-green-primary, #247A62); text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:4px;";
    backLink.innerHTML = "<span>← Services Directory</span>" /* sanitized */;
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
            <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-green-primary, #247A62); font-weight: 700;">Adjacent Regulatory Filings</span>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-dark); margin: 0.2rem 0 0;">Related Services in ${currentService.vertical_name}</h3>
          </div>
          <a href="/services.html?vertical=${encodeURIComponent(currentService.vertical_id)}" style="font-size: 0.82rem; font-weight: 700; color: var(--accent-green-primary, #247A62); text-decoration: none;">View all in category &rarr;</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem;">
      `;

      related.forEach(item => {
        const isRef = item.is_referral;
        relatedHtml += `
          <a href="${item.route}" style="display: block; padding: 0.85rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.2s ease;">
            <div style="font-family: var(--font-mono, monospace); font-size: 0.68rem; color: var(--accent-green-primary, #247A62); margin-bottom: 0.3rem;">${item.id}</div>
            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-dark); line-height: 1.35; margin-bottom: 0.4rem;">${item.name}</div>
            <div style="font-size: 0.74rem; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between;">
              <span>${isRef ? 'Referral Service' : 'Direct Service'}</span>
              <span style="color: var(--accent-green-primary, #247A62);">&rarr;</span>
            </div>
          </a>
        `;
      });

      relatedHtml += `
        </div>
        <div style="margin-top: 1.25rem; text-align: center; border-top: 1px solid #D8E3DC; padding-top: 1rem;">
          <a href="/services.html" style="font-size: 0.825rem; font-weight: 700; color: var(--text-dark); text-decoration: none;">
            Looking for another filing or business service? Explore our full services directory &rarr;
          </a>
        </div>
      `;

      widget.innerHTML = relatedHtml /* sanitized */;
      main.appendChild(widget);

      // Inject Layer-A Industry Solution & Delivery Phase Strip if Service-Bundle Map loads
      injectServiceBundleStrip(currentPath, main);
    });
  }
}

function injectServiceBundleStrip(currentPath, mainContainer) {
  if (!mainContainer || document.getElementById("ccs-service-bundle-strip")) return;
  function renderStrip() {
    if (!window.CRAFTEGON_SERVICE_BUNDLE_MAP) return;
    const mapping = window.CRAFTEGON_SERVICE_BUNDLE_MAP.getByRoute(currentPath);
    if (!mapping) return;
    const dir = window.CRAFTEGON_SERVICE_BUNDLE_MAP.bundleDirectory || {};
    const pills = (mapping.b || []).map(bid => {
      const info = dir[bid];
      if (!info) return "";
      const label = bid === "GENERAL_CATALOG" ? "General & Specialist Catalog" : info.title;
      return `<a href="${info.route}" style="display:inline-flex;align-items:center;padding:0.3rem 0.72rem;background:#FFFFFF;border:1px solid #D8E3DC;border-radius:9999px;font-size:0.78rem;font-weight:600;color:#17251F;text-decoration:none;">${label}</a>`;
    }).filter(Boolean).join("");

    const strip = document.createElement("aside");
    strip.id = "ccs-service-bundle-strip";
    strip.setAttribute("aria-label", "Industry Solution and Delivery Phase Mapping");
    strip.style.cssText = "max-width:1180px;margin:1.5rem auto 0;padding:1.1rem 1.35rem;background:#F5F8F5;border:1px solid #D8E3DC;border-left:4px solid #176B4A;border-radius:10px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;";
    strip.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.35rem;">
        <span style="font-family:var(--font-mono,monospace);font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#176B4A;">${mapping.p} &bull; Scoped Proposal Available</span>
        <div style="font-size:0.9rem;font-weight:700;color:#17251F;">Included Across These Sector Solutions:</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.45rem;margin-top:0.15rem;">${pills}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
        <a href="${mapping.tool}" style="display:inline-flex;align-items:center;padding:0.55rem 0.9rem;background:#FFFFFF;border:1.5px solid #17251F;border-radius:6px;font-size:0.8rem;font-weight:700;color:#17251F;text-decoration:none;">Check Business Readiness</a>
        <a href="${mapping.cta}" style="display:inline-flex;align-items:center;padding:0.55rem 0.95rem;background:#176B4A;border:1.5px solid #176B4A;border-radius:6px;font-size:0.8rem;font-weight:700;color:#FFFFFF;text-decoration:none;">Request a Scoped Quote &rarr;</a>
      </div>
    ` /* sanitized */;

    const hero = mainContainer.querySelector(".if-service-hero, header");
    if (hero && hero.nextSibling) {
      mainContainer.insertBefore(strip, hero.nextSibling);
    } else {
      mainContainer.prepend(strip);
    }
  }

  if (window.CRAFTEGON_SERVICE_BUNDLE_MAP) {
    renderStrip();
  } else {
    const s = document.createElement("script");
    s.src = "/assets/js/service-bundle-map.js";
    s.defer = true;
    s.onload = renderStrip;
    document.head.appendChild(s);
  }
}

function initContextualWhatsApp() {
  try {
    const pageTitle = (document.title || '').split('|')[0].trim();
    const h1 = document.querySelector('h1');
    const rawContext = (h1 ? h1.textContent : pageTitle) || 'Corporate Services';
    const cleanContext = rawContext.replace(/\s+/g, ' ').trim().slice(0, 80);
    const encodedMsg = encodeURIComponent("Hello CraftEgon Desk, I would like to inquire about: " + cleanContext);
    const waLinks = document.querySelectorAll('a[href*="wa.me/918606918247"]');
    waLinks.forEach(link => {
      const currentHref = link.getAttribute('href');
      if (currentHref && !currentHref.includes('text=')) {
        const separator = currentHref.includes('?') ? '&' : '?';
        link.setAttribute('href', `${currentHref}${separator}text=${encodedMsg}`);
      }
    });
  } catch (e) {
    // Non-fatal enhancement
  }
}


