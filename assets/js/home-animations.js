/**
 * CraftEgon CCS — Homepage Scroll Reveal Animations
 * Lightweight IntersectionObserver-based reveals with reduced-motion support
 */
(function() {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  var revealEls = document.querySelectorAll(
    '.bento-tile, .why-card, .process-card, .stage-service-card, .knowledge-card, .problem-card, .trust-metric-item, .section-header-centered, .section-header-left'
  );

  if (!revealEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function(el, i) {
    el.classList.add('reveal-on-scroll');
    // Stagger delay for grid children
    var delay = (i % 4) * 80;
    el.style.transitionDelay = delay + 'ms';
    observer.observe(el);
  });
})();
