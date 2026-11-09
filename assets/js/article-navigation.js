/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - KNOWLEDGE ARTICLE NAVIGATION ENGINE
 * Dynamic Sticky Table of Contents, Reading Progress Indicator, and Back-to-Top
 * ============================================================================
 */

(function () {
  'use strict';

  function initArticleNavigation() {
    const article = document.querySelector('article');
    if (!article) return;

    // 1. Inject Top Reading Progress Bar
    if (!document.getElementById('reading-progress-container')) {
      const progressContainer = document.createElement('div');
      progressContainer.id = 'reading-progress-container';
      progressContainer.setAttribute('aria-hidden', 'true');
      
      const progressBar = document.createElement('div');
      progressBar.id = 'reading-progress-bar';
      
      progressContainer.appendChild(progressBar);
      document.body.prepend(progressContainer);

      const updateProgress = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
      };

      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    // 2. Inject Floating Back-to-Top Button
    if (!document.getElementById('back-to-top')) {
      const bttButton = document.createElement('button');
      bttButton.id = 'back-to-top';
      bttButton.setAttribute('type', 'button');
      bttButton.setAttribute('aria-label', 'Back to top of article');
      bttButton.setAttribute('title', 'Back to top');
      bttButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      `;

      bttButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      document.body.appendChild(bttButton);

      const toggleBtt = () => {
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollPos > 350) {
          bttButton.classList.add('visible');
        } else {
          bttButton.classList.remove('visible');
        }
      };

      window.addEventListener('scroll', toggleBtt, { passive: true });
      toggleBtt();
    }

    // 3. Extract Headings and Build Sticky Table of Contents
    const headings = Array.from(article.querySelectorAll('h2, h3')).filter(h => {
      // Exclude CTA box headings or ToC headers
      const text = h.textContent.trim().toLowerCase();
      if (text.includes('table of contents')) return false;
      if (h.closest('div[style*="text-align: center"]') || h.closest('.if-card') || h.closest('.cta-box')) return false;
      // Exclude question CTAs at the bottom of articles
      if (text.includes('facing din deactivation') || text.includes('need help') || text.includes('need assistance') || text.includes('is your entity exposed') || text.includes('want to calculate')) return false;
      return true;
    });

    if (headings.length < 2) return;

    // Assign IDs to headings if missing
    headings.forEach((h, idx) => {
      if (!h.id) {
        const slug = h.textContent
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        h.id = slug || `section-${idx + 1}`;
      }
      h.style.scrollMarginTop = '95px';
    });

    // Create ToC Component
    const tocContainer = document.createElement('nav');
    tocContainer.className = 'sticky-toc-container';
    tocContainer.setAttribute('aria-label', 'Table of Contents');

    const tocHeader = document.createElement('div');
    tocHeader.className = 'toc-header';
    tocHeader.innerHTML = `
      <h3 class="toc-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        Contents
      </h3>
      <span class="toc-badge">${headings.length} Sections</span>
    `;
    tocContainer.appendChild(tocHeader);

    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';

    headings.forEach(h => {
      const li = document.createElement('li');
      li.className = 'toc-item' + (h.tagName.toLowerCase() === 'h3' ? ' toc-item-sub' : '');
      
      const link = document.createElement('a');
      link.className = 'toc-link';
      link.href = `#${h.id}`;
      link.textContent = h.textContent.trim();
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(h.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', `#${h.id}`);
        }
      });

      li.appendChild(link);
      tocList.appendChild(li);
    });

    tocContainer.appendChild(tocList);

    // Structure Layout: Wrap into 2-column layout on Desktop
    const main = article.closest('main') || article.parentElement;
    if (main && !main.querySelector('.article-with-toc')) {
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'article-with-toc';

      // Clone article into wrapper or wrap it
      article.parentNode.insertBefore(wrapper, article);
      
      const mainCol = document.createElement('div');
      mainCol.className = 'article-main-col';
      mainCol.appendChild(article);
      
      const sidebarCol = document.createElement('aside');
      sidebarCol.className = 'article-sidebar-col';
      sidebarCol.appendChild(tocContainer);

      wrapper.appendChild(mainCol);
      wrapper.appendChild(sidebarCol);

      // Adjust main max-width if restricted
      if (main.style.maxWidth) {
        main.style.maxWidth = '1180px';
      }
    }

    // 4. Scroll Spy with IntersectionObserver
    const tocLinks = tocList.querySelectorAll('.toc-link');
    const observerOptions = {
      root: null,
      rootMargin: '-90px 0px -65% 0px',
      threshold: 0
    };

    let activeHeadingId = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeHeadingId = entry.target.id;
          updateActiveLink(activeHeadingId);
        }
      });
    }, observerOptions);

    headings.forEach(h => observer.observe(h));

    function updateActiveLink(id) {
      if (!id) return;
      tocLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    // Initial check for hash in URL
    if (window.location.hash) {
      const initialId = window.location.hash.substring(1);
      updateActiveLink(initialId);
    } else if (headings[0]) {
      updateActiveLink(headings[0].id);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticleNavigation);
  } else {
    initArticleNavigation();
  }
})();
