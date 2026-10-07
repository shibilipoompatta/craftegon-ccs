/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - NAVIGATION & COMPONENT INJECTOR
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", async function () {
  // 1. Asynchronously load and inject the global Navbar
  try {
    const navResponse = await fetch('/components/navbar.html');
    if (navResponse.ok) {
      const navHtml = await navResponse.text();
      const navContainer = document.getElementById('global-navbar');
      if (navContainer) {
        navContainer.innerHTML = navHtml;
        
        // Post-injection initializations
        highlightActiveRoute();
        initMobileMenu();
      }
    } else {
      console.warn('Navbar component not found at /components/navbar.html');
    }
  } catch (error) {
    console.error('Failed to load global navbar:', error);
  }

  // 2. Asynchronously load and inject the global Footer
  try {
    const footerResponse = await fetch('/components/footer.html');
    if (footerResponse.ok) {
      const footerHtml = await footerResponse.text();
      const footerContainer = document.getElementById('global-footer');
      if (footerContainer) {
        footerContainer.innerHTML = footerHtml;
      }
    } else {
      console.warn('Footer component not found at /components/footer.html');
    }
  } catch (error) {
    console.error('Failed to load global footer:', error);
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
