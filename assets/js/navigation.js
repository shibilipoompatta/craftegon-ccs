/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - GLOBAL NAVIGATION & LAYOUT INJECTOR
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", async function () {
  preserveConversionContext();

  // 1. Load and inject Navbar with graceful fallback
  const navContainer = document.getElementById("global-navbar");
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
            <a href="/index.html" class="if-brand-logo">
              <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon Logo" class="brand-logo-img">
              CraftEgon <span>CCS</span>
            </a>
            <nav class="if-nav">
              <a href="/index.html" class="if-nav-link">Home</a>
              <a href="/index.html#service-verticals" class="if-nav-link">Verticals</a>
              <a href="/conversion/index.html" class="if-nav-link">Diagnostic Tools &amp; AI</a>
              <a href="/knowledge/index.html" class="if-nav-link">Knowledge Base</a>
              <a href="/conversion/calculator.html" class="if-nav-link">Fee Estimator</a>
            </nav>
            <div class="if-header-actions">
              <a href="/conversion/ai-document-generator.html" class="if-btn-secondary">AI Drafter</a>
              <a href="/conversion/calculator.html" class="if-btn-primary">Calculate Retainer</a>
              <button class="if-mobile-toggle" id="mobile-menu-toggle" aria-label="Open Navigation Menu" aria-expanded="false">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            </div>
          </div>
          <div class="if-mobile-backdrop" id="mobile-drawer-backdrop"></div>
          <div class="if-mobile-drawer" id="mobile-drawer" aria-hidden="true">
            <div class="if-mobile-drawer-header">
              <a href="/index.html" class="if-brand-logo">
                <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon Logo" class="brand-logo-img">
                CraftEgon <span>CCS</span>
              </a>
              <button class="if-mobile-drawer-close" id="mobile-drawer-close" aria-label="Close Navigation Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="if-mobile-drawer-body">
              <a href="/index.html" class="if-mobile-nav-link">Home</a>
              <a href="/conversion/index.html" class="if-mobile-nav-link">Diagnostic Tools Hub</a>
              <a href="/knowledge/index.html" class="if-mobile-nav-link">Knowledge Base Hub</a>
              <a href="/conversion/ai-document-generator.html" class="if-mobile-btn-ai" style="margin-top: 1rem;">⚡ AI Legal Drafter</a>
            </div>
          </div>
        </header>
      `;
    }
    initDropdowns();
    initMobileNav();
    highlightActiveRoute();
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
          <div class="if-footer-grid" style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2rem;">
            <div>
              <p style="color: #F8FAFC; font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon Logo" style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--gold);">
                CraftEgon Corporate Services (CCS)
              </p>
              <p style="margin: 0; font-size: 0.85rem; color: #94a3b8; max-width: 400px;">India's premier AI-powered digital corporate and legal compliance operating system.</p>
            </div>
            <div style="display: flex; gap: 2rem; font-size: 0.85rem; flex-wrap: wrap;">
              <a href="/index.html" style="color: #94a3b8; text-decoration: none;">Home</a>
              <a href="/conversion/ai-document-generator.html" style="color: var(--gold-light); text-decoration: none; font-weight: 600;">AI Legal Drafter</a>
              <a href="/conversion/calculator.html" style="color: #94a3b8; text-decoration: none;">Fee Calculator</a>
              <a href="/knowledge/index.html" style="color: var(--gold-light); text-decoration: none;">Knowledge Hub</a>
              <a href="/legal/terms.html" style="color: #94a3b8; text-decoration: none;">Terms</a>
              <a href="/legal/privacy.html" style="color: #94a3b8; text-decoration: none;">Privacy</a>
            </div>
          </div>
          <div style="max-width: 1200px; margin: 2rem auto 0; border-top: 1px solid rgba(212, 175, 55, 0.2); padding: 1.5rem; text-align: center; font-size: 0.8rem; color: #64748b;">
            &copy; 2026 CraftEgon LLP. All rights reserved. Registered HQ: Kozhikode, Kerala, India.
          </div>
        </footer>
      `;
    }
  }
});

function initDropdowns() {
  document.querySelectorAll(".if-dropdown").forEach((dropdown) => {
    const menu = dropdown.querySelector(".if-dropdown-content, .if-megamenu");
    if (!menu) return;

    dropdown.addEventListener("mouseenter", () => {
      menu.style.display = menu.classList.contains("if-megamenu") ? "grid" : "flex";
    });
    dropdown.addEventListener("mouseleave", () => {
      menu.style.display = "none";
    });

    const trigger = dropdown.querySelector(".if-nav-link");
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        if (window.innerWidth < 1024) {
          e.preventDefault();
          const isShown = menu.style.display === "grid" || menu.style.display === "flex";
          menu.style.display = isShown ? "none" : (menu.classList.contains("if-megamenu") ? "grid" : "flex");
        }
      });
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
