/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) — HOMEPAGE 3D INTERACTIVE SCRIPT
 * Hardware-accelerated 3D tilt, parallax physics & interactive calculators
 * Path: assets/js/home-3d.js
 * ==========================================================================
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initHero3DParallax();
    initCard3DTilt();
    initFeeEstimator();
    initStageTabs();
    initFrontSearch();
    initSearchScrollSync();
  });

  /**
   * 1. 3D HERO STAGE PARALLAX & CURSOR TRACKING
   */
  function initHero3DParallax() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const stage = document.querySelector(".hero-3d-stage");
    const scene = document.querySelector(".scene-3d");
    if (!stage || !scene) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let isHovering = false;
    let rafId = null;

    function onMouseMove(e) {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to 1
      const normY = (y / rect.height) * 2 - 1; // -1 to 1

      // Max rotation: 12 degrees X, 16 degrees Y
      targetRotX = -normY * 12;
      targetRotY = normX * 16;
    }

    function onMouseEnter() {
      isHovering = true;
      if (!rafId) {
        rafId = requestAnimationFrame(animateLoop);
      }
    }

    function onMouseLeave() {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
    }

    function animateLoop() {
      // Smooth interpolation (LERP)
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      scene.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

      // Continue animating until settled
      if (isHovering || Math.abs(targetRotX - currentRotX) > 0.05 || Math.abs(targetRotY - currentRotY) > 0.05) {
        rafId = requestAnimationFrame(animateLoop);
      } else {
        scene.style.transform = "rotateX(0deg) rotateY(0deg)";
        rafId = null;
      }
    }

    stage.addEventListener("mousemove", onMouseMove);
    stage.addEventListener("mouseenter", onMouseEnter);
    stage.addEventListener("mouseleave", onMouseLeave);
  }

  /**
   * 2. 3D HOVER TILT FOR CORE PILLAR & VALUE CARDS
   */
  function initCard3DTilt() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const cards = document.querySelectorAll(".card-3d");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const normX = (x / rect.width) * 2 - 1;
        const normY = (y / rect.height) * 2 - 1;

        const rotX = -normY * 6;
        const rotY = normX * 8;

        card.style.transform = `perspective(1000px) translateY(-8px) translateZ(12px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(1000px) translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  /**
   * 3. INTERACTIVE 3D FEE & TIMELINE ESTIMATOR
   */
  function initFeeEstimator() {
    const entityButtons = document.querySelectorAll("[data-calc-entity]");
    const capitalButtons = document.querySelectorAll("[data-calc-capital]");
    const totalDisplay = document.getElementById("calc-total-display");
    const govFeeDisplay = document.getElementById("calc-gov-fee");
    const profFeeDisplay = document.getElementById("calc-prof-fee");
    const slaDisplay = document.getElementById("calc-sla-display");

    if (!entityButtons.length || !totalDisplay) return;

    let selectedEntity = "pvt_ltd";
    let selectedCapital = 100000; // 1 Lakh

    const pricingMatrix = {
      pvt_ltd: {
        baseGov: 1000,
        baseProf: 4999,
        capitalFeeRate: 0.002,
        sla: "3–5 Working Days"
      },
      llp: {
        baseGov: 1500,
        baseProf: 3999,
        capitalFeeRate: 0.001,
        sla: "4–6 Working Days"
      },
      opc: {
        baseGov: 800,
        baseProf: 3999,
        capitalFeeRate: 0.002,
        sla: "3–5 Working Days"
      }
    };

    function updateCalculations() {
      const data = pricingMatrix[selectedEntity] || pricingMatrix.pvt_ltd;
      const govFee = Math.round(data.baseGov + (selectedCapital > 100000 ? (selectedCapital - 100000) * data.capitalFeeRate : 0));
      const profFee = data.baseProf;
      const total = govFee + profFee;

      if (totalDisplay) totalDisplay.textContent = "₹" + total.toLocaleString("en-IN");
      if (govFeeDisplay) govFeeDisplay.textContent = "₹" + govFee.toLocaleString("en-IN");
      if (profFeeDisplay) profFeeDisplay.textContent = "₹" + profFee.toLocaleString("en-IN");
      if (slaDisplay) slaDisplay.textContent = data.sla;
    }

    entityButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        entityButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        selectedEntity = btn.getAttribute("data-calc-entity");
        updateCalculations();
      });
    });

    capitalButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        capitalButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        selectedCapital = parseInt(btn.getAttribute("data-calc-capital"), 10) || 100000;
        updateCalculations();
      });
    });

    updateCalculations();
  }

  /**
   * 4. INTERACTIVE STAGE TABS
   */
  function initStageTabs() {
    const tabButtons = document.querySelectorAll(".stage-tab-btn");
    const panels = document.querySelectorAll(".stage-panel");
    if (!tabButtons.length || !panels.length) return;

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data-stage");

        tabButtons.forEach(function (b) { b.classList.remove("active"); });
        panels.forEach(function (p) { p.classList.remove("active"); });

        btn.classList.add("active");
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add("active");
        }
      });
    });
  }

  /**
   * 5. FRONT-AND-CENTER HERO SEARCH AUTOCOMPLETE
   */
  function initFrontSearch() {
    const input = document.getElementById("home-front-search-input");
    const dropdown = document.getElementById("home-front-search-dropdown");
    const resultsContainer = document.getElementById("home-front-search-results");
    if (!input || !dropdown || !resultsContainer) return;

    let debounceTimer = null;

    input.addEventListener("input", function (e) {
      const q = e.target.value.trim().toLowerCase();
      clearTimeout(debounceTimer);

      if (!q) {
        dropdown.style.display = "none";
        resultsContainer.innerHTML = "";
        return;
      }

      debounceTimer = setTimeout(function () {
        let matches = [];
        if (window.CraftEgonSearch && window.CraftEgonSearch.engine) {
          const results = window.CraftEgonSearch.engine.search(q);
          matches = results.slice(0, 6).map(function (r) {
            return {
              name: r.item.name,
              route: r.item.route,
              vertical: r.item.vertical_name || "Corporate Service",
              id: r.item.id
            };
          });
        } else if (Array.isArray(window.CRAFTEGON_SERVICE_CATALOG)) {
          matches = window.CRAFTEGON_SERVICE_CATALOG.filter(function (s) {
            return s.name.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q));
          }).slice(0, 6);
        }

        function escapeHtml(s) {
          return String(s || '').replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
          });
        }

        if (matches.length > 0) {
          let html = "";
          matches.forEach(function (m) {
            const safeRoute = (typeof m.route === 'string' && (m.route.startsWith('/') || m.route.startsWith('https://'))) ? escapeHtml(m.route) : '#';
            html += '<a href="' + safeRoute + '" class="front-search-result-item">' +
              '<div>' +
                '<div class="front-result-title">' + escapeHtml(m.name) + '</div>' +
                '<div class="front-result-meta">' + escapeHtml(m.vertical || m.vertical_name || "Corporate Practice") + ' • ' + escapeHtml(m.id || "") + '</div>' +
              '</div>' +
              '<span style="color:var(--accent-green-primary); font-weight:700;">&rarr;</span>' +
            '</a>';
          });
          html += '<div style="padding:0.6rem 1rem; background:var(--surface-mint-white); text-align:center;">' +
            '<a href="/services.html?q=' + encodeURIComponent(q) + '" style="font-size:0.78rem; font-weight:700; color:var(--accent-green-primary); text-decoration:none;">View all results in 57-Service Directory &rarr;</a>' +
          '</div>';
          resultsContainer.innerHTML = html;
          dropdown.style.display = "block";
        } else {
          resultsContainer.innerHTML = '<div style="padding:1rem; text-align:center; font-size:0.85rem; color:var(--text-secondary);">' +
            'No matching corporate services found for "' + escapeHtml(q) + '". ' +
            '<br><a href="/services.html" style="color:var(--accent-green-primary); font-weight:700;">Explore all 57 services &rarr;</a>' +
          '</div>';
          dropdown.style.display = "block";
        }
      }, 100);
    });

    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  /**
   * 6. DUAL-SEARCH SCROLL SYNCHRONIZATION ON HOMEPAGE
   * Smoothly hides navbar search when hero search is in view, revealing it on scroll.
   */
  function initSearchScrollSync() {
    const navSearch = document.getElementById("universal-search-container");
    const heroSearch = document.querySelector(".hero-front-search-card");
    if (!navSearch || !heroSearch) return;

    function updateSearchVisibility() {
      const heroRect = heroSearch.getBoundingClientRect();
      if (heroRect.bottom < 80) {
        navSearch.classList.add("nav-search-visible");
        navSearch.classList.remove("nav-search-hidden");
      } else {
        navSearch.classList.add("nav-search-hidden");
        navSearch.classList.remove("nav-search-visible");
      }
    }

    if (window.innerWidth > 1024) {
      window.addEventListener("scroll", updateSearchVisibility, { passive: true });
      updateSearchVisibility();
    }
  }

})();
