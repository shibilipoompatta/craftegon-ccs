/**
 * CRAFTEGON CORPORATE SERVICES (CCS) - UNIVERSAL CANONICAL SERVICES DIRECTORY LOGIC
 * Externalized for full CSP compliance (avoids inline script blocking)
 * and seamless cross-page synchronization.
 */

(function (window, document) {
  'use strict';

  function initServicesDirectory() {
      const catalog = (window.CRAFTEGON_SERVICE_CATALOG || []).filter(item => !item.id.startsWith('TOOL-'));
      const container = document.getElementById('service-cards-container');
      const emptyState = document.getElementById('directory-empty-state');
      const counterEl = document.getElementById('directory-counter');
      const searchInput = document.getElementById('directory-search-input');
      const clearBtn = document.getElementById('directory-search-clear');
      const verticalSelect = document.getElementById('vertical-filter-select');
      const entitySelect = document.getElementById('entity-filter-select');
      const statusSelect = document.getElementById('status-filter-select');
      const stageChips = document.querySelectorAll('#stage-filter-group .filter-chip');
      const resetBtn = document.getElementById('reset-filters-btn');
      const emptyResetBtn = document.getElementById('empty-reset-btn');
      const featuredShelf = document.getElementById('featured-launch-shelf');

      let currentFilters = {
        query: '',
        vertical_id: 'ALL',
        entity_type: 'ALL',
        status: 'ALL',
        stage: 'ALL'
      };

      // Read query params from URL (e.g. ?q=... or ?query=... or ?search=... or ?stage=... or ?vertical=...)
      const urlParams = new URLSearchParams(window.location.search);
      const qVal = (urlParams.get('q') || urlParams.get('query') || urlParams.get('search') || '').trim();
      if (qVal.length > 0) {
        currentFilters.query = qVal;
        if (searchInput) searchInput.value = qVal;
        if (clearBtn) clearBtn.style.display = 'inline-block';
      }
      if (urlParams.has('stage')) {
        const paramStage = (urlParams.get('stage') || '').toLowerCase().trim();
        if (paramStage && paramStage !== 'all') {
          stageChips.forEach(chip => {
            if (chip.getAttribute('data-stage').toLowerCase() === paramStage) {
              stageChips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
              chip.classList.add('active');
              chip.setAttribute('aria-selected', 'true');
              currentFilters.stage = chip.getAttribute('data-stage');
            }
          });
        }
      }
      if (urlParams.has('vertical')) {
        const vVal = (urlParams.get('vertical') || '').trim();
        if (vVal) {
          currentFilters.vertical_id = vVal;
          verticalSelect.value = currentFilters.vertical_id;
        }
      }

      const activeFiltersBar = document.getElementById('active-filters-bar');
      const activePillsList = document.getElementById('active-filter-pills-list');
      const clearAllActiveBtn = document.getElementById('clear-all-active-filters-btn');
      const searchForm = document.getElementById('directory-search-form');

      // Also read entity and status from url if present
      if (urlParams.has('entity')) {
        const eVal = (urlParams.get('entity') || '').trim();
        if (eVal) {
          currentFilters.entity_type = eVal;
          entitySelect.value = currentFilters.entity_type;
        }
      }
      if (urlParams.has('status')) {
        const sVal = (urlParams.get('status') || '').trim();
        if (sVal) {
          currentFilters.status = sVal;
          statusSelect.value = currentFilters.status;
        }
      }

      function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, m => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
      }

      function syncUrlParams() {
        try {
          const params = new URLSearchParams();
          if (currentFilters.query && currentFilters.query.trim()) params.set('q', currentFilters.query.trim());
          if (currentFilters.stage && currentFilters.stage !== 'ALL') params.set('stage', currentFilters.stage.toLowerCase());
          if (currentFilters.vertical_id && currentFilters.vertical_id !== 'ALL') params.set('vertical', currentFilters.vertical_id);
          if (currentFilters.entity_type && currentFilters.entity_type !== 'ALL') params.set('entity', currentFilters.entity_type);
          if (currentFilters.status && currentFilters.status !== 'ALL') params.set('status', currentFilters.status);

          const newSearch = params.toString();
          const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
          window.history.replaceState(null, '', newUrl);
        } catch (e) {
          // Graceful fallback for restricted environments
        }
      }

      function renderActiveFilters() {
        if (!activeFiltersBar || !activePillsList) return;
        const pills = [];

        if (currentFilters.query) {
          pills.push({
            label: `Search: "${currentFilters.query}"`,
            type: 'query',
            action: () => {
              currentFilters.query = '';
              searchInput.value = '';
              clearBtn.style.display = 'none';
            }
          });
        }
        if (currentFilters.stage && currentFilters.stage !== 'ALL') {
          pills.push({
            label: `Stage: ${currentFilters.stage}`,
            type: 'stage',
            action: () => {
              currentFilters.stage = 'ALL';
              stageChips.forEach(c => {
                const isAll = c.getAttribute('data-stage') === 'ALL';
                c.classList.toggle('active', isAll);
                c.setAttribute('aria-selected', isAll ? 'true' : 'false');
              });
            }
          });
        }
        if (currentFilters.vertical_id && currentFilters.vertical_id !== 'ALL') {
          const selectedOpt = verticalSelect.options[verticalSelect.selectedIndex];
          pills.push({
            label: selectedOpt ? selectedOpt.text.split(':')[0] : currentFilters.vertical_id,
            type: 'vertical',
            action: () => {
              currentFilters.vertical_id = 'ALL';
              verticalSelect.value = 'ALL';
            }
          });
        }
        if (currentFilters.entity_type && currentFilters.entity_type !== 'ALL') {
          pills.push({
            label: `Entity: ${currentFilters.entity_type}`,
            type: 'entity',
            action: () => {
              currentFilters.entity_type = 'ALL';
              entitySelect.value = 'ALL';
            }
          });
        }
        if (currentFilters.status && currentFilters.status !== 'ALL') {
          pills.push({
            label: currentFilters.status === 'DIRECT' ? 'Direct Services' : 'Referral Services',
            type: 'status',
            action: () => {
              currentFilters.status = 'ALL';
              statusSelect.value = 'ALL';
            }
          });
        }

        if (pills.length === 0) {
          activeFiltersBar.style.display = 'none';
          activePillsList.innerHTML = '';
          return;
        }

        activeFiltersBar.style.display = 'flex';
        activePillsList.innerHTML = pills.map((p, idx) => `
          <button type="button" class="active-filter-pill" data-index="${idx}" title="Remove filter: ${escapeHtml(p.label)}">
            <span>${escapeHtml(p.label)}</span>
            <span class="active-filter-pill-remove" aria-hidden="true">&times;</span>
          </button>
        `).join('');

        activePillsList.querySelectorAll('.active-filter-pill').forEach(btn => {
          btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            if (pills[idx]) {
              pills[idx].action();
              renderCatalog();
            }
          });
        });
      }

      window.applySuggestion = function (val) {
        // Reset restricting dropdowns and stages so suggestion finds results immediately
        if (verticalSelect) verticalSelect.value = 'ALL';
        currentFilters.vertical_id = 'ALL';
        if (entitySelect) entitySelect.value = 'ALL';
        currentFilters.entity_type = 'ALL';
        if (statusSelect) statusSelect.value = 'ALL';
        currentFilters.status = 'ALL';
        stageChips.forEach(c => {
          const isAll = c.getAttribute('data-stage') === 'ALL';
          c.classList.toggle('active', isAll);
          c.setAttribute('aria-selected', isAll ? 'true' : 'false');
        });
        currentFilters.stage = 'ALL';
        document.querySelectorAll('.quick-need-btn').forEach(b => b.classList.remove('active'));

        searchInput.value = val;
        currentFilters.query = val;
        clearBtn.style.display = 'inline-block';
        renderCatalog();
        searchInput.focus();
      };

      // Canonical Business Stage Classifier (partitions 57 services into 5 canonical stages)
      function getServiceStage(item) {
        const vId = item.vertical_id;
        const bStage = item.business_stage || '';
        if (vId === 'V01' || bStage.includes('Formation')) return 'formation';
        if (vId === 'V10' || bStage.includes('Dispute')) return 'dispute';
        if (vId === 'V09' || bStage.includes('Restructuring') || bStage.includes('Exit') || bStage.includes('M&A')) return 'restructuring';
        if (vId === 'V11' || bStage === 'Annual Governance' || bStage.includes('Governance')) return 'governance';
        return 'compliance';
      }

      function renderCatalog() {
        if (!container) return;

        // Execute search & multi-facet filtering
        let results = [];
        if (window.CraftEgonSearch && window.CraftEgonSearch.engine) {
          results = window.CraftEgonSearch.engine.search(currentFilters.query, {
            vertical_id: currentFilters.vertical_id,
            entity_type: currentFilters.entity_type,
            status: currentFilters.status
          }).filter(r => !r.item.id.startsWith('TOOL-'));

          // INTELLIGENT RECOVERY FLOW FOR VERTICAL FILTER:
          // If a vertical filter produces 0 results for a search query, but global results exist, auto-relax vertical!
          if (results.length === 0 && currentFilters.query.trim().length > 0 && currentFilters.vertical_id !== 'ALL') {
            const globalResults = window.CraftEgonSearch.engine.search(currentFilters.query, {
              vertical_id: 'ALL',
              entity_type: currentFilters.entity_type,
              status: currentFilters.status
            }).filter(r => !r.item.id.startsWith('TOOL-'));

            if (globalResults.length > 0) {
              currentFilters.vertical_id = 'ALL';
              if (verticalSelect) verticalSelect.value = 'ALL';
              results = globalResults;
            }
          }
        } else {
          // Robust client-side fallback if CraftEgonSearch is not yet initialized
          const qLower = (currentFilters.query || '').toLowerCase().trim();
          let filtered = catalog;
          if (qLower) {
            filtered = catalog.filter(item => {
              const str = [
                item.name,
                item.id,
                item.vertical_name,
                item.description,
                (item.keywords || []).join(' '),
                (item.forms || []).join(' ')
              ].join(' ').toLowerCase();
              return str.includes(qLower);
            });
          }
          if (currentFilters.vertical_id && currentFilters.vertical_id !== 'ALL') {
            filtered = filtered.filter(item => item.vertical_id === currentFilters.vertical_id);
          }
          if (currentFilters.status && currentFilters.status !== 'ALL') {
            filtered = filtered.filter(item => currentFilters.status === 'DIRECT' ? !item.is_referral : item.is_referral);
          }
          results = filtered.map(item => ({ item, score: 10 }));
        }

        // Apply stage filter if selected
        if (currentFilters.stage && currentFilters.stage !== 'ALL') {
          const targetStage = currentFilters.stage.toLowerCase();
          const stageFiltered = results.filter(r => getServiceStage(r.item) === targetStage);

          // INTELLIGENT RECOVERY FLOW FOR STAGE FILTER:
          // If search query is non-empty, and stage filtering reduces results to 0 while matches exist across other stages:
          if (stageFiltered.length === 0 && results.length > 0 && currentFilters.query.trim().length > 0) {
            currentFilters.stage = 'ALL';
            stageChips.forEach(c => {
              const isAll = c.getAttribute('data-stage') === 'ALL';
              c.classList.toggle('active', isAll);
              c.setAttribute('aria-selected', isAll ? 'true' : 'false');
            });
            // results already holds all matching catalog items!
          } else {
            results = stageFiltered;
          }
        }

        const isFiltering = Boolean(
          (currentFilters.query && currentFilters.query.trim().length > 0) ||
          (currentFilters.stage && currentFilters.stage !== 'ALL') ||
          (currentFilters.vertical_id && currentFilters.vertical_id !== 'ALL') ||
          (currentFilters.entity_type && currentFilters.entity_type !== 'ALL') ||
          (currentFilters.status && currentFilters.status !== 'ALL')
        );

        if (counterEl) {
          counterEl.innerHTML = isFiltering ? `Showing <strong>${results.length}</strong> matching corporate services` : 'Showing all available corporate services';
        }

        if (featuredShelf) {
          featuredShelf.style.display = isFiltering ? 'none' : 'block';
        }

        renderActiveFilters();
        syncUrlParams();

        if (results.length === 0) {
          container.innerHTML = '';
          const msgEl = document.getElementById('empty-state-message');
          if (msgEl) {
            msgEl.textContent = currentFilters.query
              ? `No canonical regulatory services matched "${currentFilters.query}". Try one of the suggested searches below or reset all filters to browse the services directory.`
              : 'No canonical regulatory services matched your filter combination. Reset filters to browse all corporate services.';
          }
          emptyState.style.display = 'block';
          return;
        }

        emptyState.style.display = 'none';

        let html = '';
        results.forEach(({ item }) => {
          const isReferral = item.is_referral;
          const statusClass = isReferral ? 'status-referral' : 'status-direct';
          const statusText = isReferral ? 'Referral Service (Counsel)' : 'Direct Regulatory Service';

          let formsHtml = '';
          if (item.forms && item.forms.length) {
            formsHtml = item.forms.slice(0, 3).map(f => `<span class="service-card-tag">${escapeHtml(f)}</span>`).join('');
          }

          let entityHtml = '';
          if (item.entity_types && item.entity_types.length) {
            entityHtml = item.entity_types.slice(0, 2).map(e => `<span class="service-card-tag" style="background: rgba(15, 23, 42, 0.04);">${escapeHtml(e)}</span>`).join('');
          }

          let referralBanner = '';
          if (isReferral) {
            referralBanner = `
              <div class="referral-disclaimer-card">
                <strong>Advocates Act Boundary:</strong> Contentious litigation, tribunal disputes, and courtroom advocacy must be handled by independent legal counsel. Direct secretarial advisory and documentation assistance is provided by CCS.
              </div>
            `;
          }

          html += `
            <article class="service-card" data-service-id="${escapeHtml(item.id)}">
              <div>
                <div class="service-card-top">
                  <span class="service-vertical-badge">${escapeHtml(item.vertical_name)}</span>
                  <span class="service-id-tag">${escapeHtml(item.id)}</span>
                </div>
                <h3 class="service-card-title"><a href="${escapeHtml(item.route)}">${escapeHtml(item.name)}</a></h3>
                ${referralBanner}
                <p class="service-card-desc">${escapeHtml(item.description)}</p>
                <div class="service-card-tags">
                  ${formsHtml}
                  ${entityHtml}
                </div>
              </div>
              <div class="service-card-footer">
                <span class="service-status-pill ${statusClass}">
                  <span style="font-size: 0.9em;">●</span> ${escapeHtml(statusText)}
                </span>
                <a href="${escapeHtml(item.route)}" class="service-card-btn">
                  <span>${isReferral ? 'View Advisory Guide' : 'Access Filing'}</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </article>
          `;
        });

        container.innerHTML = html;
      }

      // Input listener
      let debounce = null;
      searchInput.addEventListener('input', function (e) {
        const val = e.target.value.trim();
        clearBtn.style.display = val.length > 0 ? 'inline-block' : 'none';
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          currentFilters.query = val;
          renderCatalog();
        }, 120);
      });

      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchInput.value) {
          clearBtn.click();
        }
      });

      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        currentFilters.query = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        document.querySelectorAll('.quick-need-btn').forEach(b => b.classList.remove('active'));
        renderCatalog();
      });

      if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
          e.preventDefault();
          const target = document.getElementById('directory-counter') || container;
          if (target && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }

      // Select dropdown filters
      verticalSelect.addEventListener('change', function (e) {
        currentFilters.vertical_id = e.target.value;
        renderCatalog();
      });

      entitySelect.addEventListener('change', function (e) {
        currentFilters.entity_type = e.target.value;
        renderCatalog();
      });

      statusSelect.addEventListener('change', function (e) {
        currentFilters.status = e.target.value;
        renderCatalog();
      });

      // WCAG 2.2 Tablist Keyboard Navigation
      const stageGroup = document.getElementById('stage-filter-group');
      if (stageGroup) {
        stageGroup.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const chips = Array.from(stageChips);
            const currentIdx = chips.findIndex(c => c.getAttribute('aria-selected') === 'true');
            let nextIdx = e.key === 'ArrowRight' ? currentIdx + 1 : currentIdx - 1;
            if (nextIdx >= chips.length) nextIdx = 0;
            if (nextIdx < 0) nextIdx = chips.length - 1;
            chips[nextIdx].click();
            chips[nextIdx].focus();
          }
        });
      }

      // Stage chips
      stageChips.forEach(chip => {
        chip.addEventListener('click', function () {
          stageChips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
          this.classList.add('active');
          this.setAttribute('aria-selected', 'true');
          currentFilters.stage = this.getAttribute('data-stage');
          renderCatalog();
        });
      });

      // Quick Needs Buttons
      document.querySelectorAll('.quick-need-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const q = this.getAttribute('data-query');
          const st = this.getAttribute('data-status');
          document.querySelectorAll('.quick-need-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');

          // Reset conflicting selects so the quick need surfaces relevant services immediately
          verticalSelect.value = 'ALL';
          currentFilters.vertical_id = 'ALL';
          entitySelect.value = 'ALL';
          currentFilters.entity_type = 'ALL';

          if (q) {
            searchInput.value = q;
            currentFilters.query = q;
            clearBtn.style.display = 'inline-block';
            currentFilters.status = st || 'ALL';
            statusSelect.value = st || 'ALL';
          } else if (st) {
            currentFilters.status = st;
            statusSelect.value = st;
          }
          renderCatalog();
        });
      });

      function resetAll() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        document.querySelectorAll('.quick-need-btn').forEach(b => b.classList.remove('active'));
        currentFilters = {
          query: '',
          vertical_id: 'ALL',
          entity_type: 'ALL',
          status: 'ALL',
          stage: 'ALL'
        };
        verticalSelect.value = 'ALL';
        entitySelect.value = 'ALL';
        statusSelect.value = 'ALL';
        stageChips.forEach(c => {
          if (c.getAttribute('data-stage') === 'ALL') {
            c.classList.add('active');
            c.setAttribute('aria-selected', 'true');
          } else {
            c.classList.remove('active');
            c.setAttribute('aria-selected', 'false');
          }
        });
        renderCatalog();
      }

      resetBtn.addEventListener('click', resetAll);
      emptyResetBtn.addEventListener('click', resetAll);
      if (clearAllActiveBtn) clearAllActiveBtn.addEventListener('click', resetAll);

      // Initial render
      renderCatalog();

      // If CraftEgonSearch becomes available after initial render, re-render to ensure multi-tier search ranking
      if (!window.CraftEgonSearch || !window.CraftEgonSearch.engine) {
        let retryCount = 0;
        const retryInterval = setInterval(function () {
          retryCount++;
          if (window.CraftEgonSearch && window.CraftEgonSearch.engine) {
            clearInterval(retryInterval);
            renderCatalog();
          } else if (retryCount > 10) {
            clearInterval(retryInterval);
          }
        }, 100);
      }

    // Setup suggestion click handlers
    document.querySelectorAll('.filter-chip[data-suggestion]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (typeof window.applySuggestion === 'function') {
          window.applySuggestion(this.getAttribute('data-suggestion'));
        }
      });
    });

    // Auto-scroll to results if search query was provided via URL
    if (currentFilters.query && currentFilters.query.trim().length > 0) {
      setTimeout(function() {
        const target = document.getElementById('directory-counter') || container;
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }

  // Robust initialization: handles both pending and already-fired DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicesDirectory);
  } else {
    initServicesDirectory();
  }
})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
