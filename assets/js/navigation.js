/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - NAVIGATION & COMPONENT INJECTOR
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", async function () {
  // 1. Load and inject Navbar (with automatic inline fallback)
  const navContainer = document.getElementById("global-navbar");
  if (navContainer) {
    try {
      const navResponse = await fetch('/components/navbar.html');
      if (navResponse.ok) {
        navContainer.innerHTML = await navResponse.text();
      } else {
        throw new Error('Navbar component not found');
      }
    } catch (error) {
      navContainer.innerHTML = `
        <nav class="if-navbar" style="background: white; border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 1000;">
          <div class="container" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <a href="/index.html" style="font-size: 1.25rem; font-weight: 700; color: var(--primary); text-decoration: none;">CraftEgon <span style="color: var(--text-main);">CCS</span></a>
            <div style="display: flex; gap: 1.5rem; align-items: center;">
              <a href="/conversion/calculator.html" class="if-nav-link" style="font-size: 0.9rem; font-weight: 500; color: var(--text-main); text-decoration: none;">Cost Estimator</a>
              <a href="/conversion/retainer-desk.html" class="if-nav-link" style="font-size: 0.9rem; font-weight: 500; color: var(--text-main); text-decoration: none;">Retainer Desk</a>
              <a href="/conversion/calculator.html" class="if-btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Get Started</a>
            </div>
          </div>
        </nav>
      `;
    }
    highlightActiveRoute();
    initMobileMenu();
  }

  // 2. Load and inject Footer (with automatic inline fallback)
  const footerContainer = document.getElementById("global-footer");
  if (footerContainer) {
    try {
      const footerResponse = await fetch('/components/footer.html');
      if (footerResponse.ok) {
        footerContainer.innerHTML = await footerResponse.text();
      } else {
        throw new Error('Footer component not found');
      }
    } catch (error) {
      footerContainer.innerHTML = `
        <footer style="background: #0f172a; color: #94a3b8; padding: 3rem 1.5rem; margin-top: 4rem; font-size: 0.9rem;">
          <div class="container" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div>
              <p style="color: white; font-weight: 600; margin-bottom: 0.25rem;">CraftEgon Corporate & Compliance Services (CCS)</p>
              <p style="margin: 0; font-size: 0.85rem;">Integrated legal, tax, and secretarial infrastructure platforms.</p>
            </div>
            <div style="display: flex; gap: 1.5rem; font-size: 0.85rem;">
              <a href="/index.html" style="color: #94a3b8; text-decoration: none;">Home</a>
              <a href="/conversion/calculator.html" style="color: #94a3b8; text-decoration: none;">Estimator</a>
              <a href="/conversion/retainer-desk.html" style="color: #94a3b8; text-decoration: none;">Retainers</a>
            </div>
          </div>
          <div class="container" style="max-width: 1200px; margin: 2rem auto 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; text-align: center; font-size: 0.8rem;">
            &copy; 2026 CraftEgon LLP. All rights reserved.
          </div>
        </footer>
      `;
    }
  }
});

/**
 * Highlights the active navigation link based on the current browser path
 */
function highlightActiveRoute() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.if-nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/index.html' && href !== '/') {
      link.style.color = 'var(--primary)';
      link.style.fontWeight = '600';
    } else if ((currentPath === '/' || currentPath === '/index.html') && (href === '/' || href === '/index.html')) {
      link.style.color = 'var(--primary)';
      link.style.fontWeight = '600';
    }
  });
}

/**
 * Mobile Navigation Drawer Toggle Handler
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('if-mobile-menu-toggle');
  const mobileNav = document.getElementById('if-mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }
}
