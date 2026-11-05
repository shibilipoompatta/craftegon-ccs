/**
 * CraftEgon Corporate Services (CCS) - Executive Admin Console JS
 * Server-verified authentication check, service lifecycle management,
 * pricing, features, confirmation-gated deletions, and publishing workflow.
 */

(function () {
  'use strict';

  let currentAdmin = null;
  let allServices = [];
  let allVerticals = [];
  let allCases = [];
  let allStaff = [];
  let allLeads = [];
  let activeSection = 'cases';
  let activeEditingService = null;
  let activeTab = 'tab-general';

  /**
   * Authenticated Fetch Wrapper
   * Injects Bearer token and credentials, handles 401 redirects to login
   */
  async function authFetch(url, options = {}) {
    const token = localStorage.getItem('craftegon_admin_token');
    const headers = Object.assign({}, options.headers || {});
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const fetchOptions = Object.assign({}, options, {
      headers,
      credentials: 'same-origin'
    });

    try {
      const res = await fetch(url, fetchOptions);
      if (res.status === 401) {
        localStorage.removeItem('craftegon_admin_token');
        window.location.href = '/admin/login.html';
        return res;
      }
      return res;
    } catch (err) {
      console.warn('[Admin API Network Warning]', err.message);
      throw err;
    }
  }

  function updateRoleAwareUI() {
    const admin = currentAdmin || (typeof window !== 'undefined' ? window.adminUser : null);
    const isManagingPartner = ['managing_partner', 'admin'].includes(admin?.role);
    const roleBadgeEl = document.getElementById('admin-role-badge');
    if (roleBadgeEl) {
      roleBadgeEl.textContent = isManagingPartner ? 'Managing Partner' : 'Compliance Operator';
      roleBadgeEl.style.display = 'inline-block';
      roleBadgeEl.style.background = isManagingPartner ? 'rgba(197, 155, 39, 0.2)' : 'rgba(59, 130, 246, 0.2)';
      roleBadgeEl.style.color = isManagingPartner ? '#F59E0B' : '#60A5FA';
      roleBadgeEl.style.border = isManagingPartner ? '1px solid rgba(197, 155, 39, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)';
    }

    if (!isManagingPartner) {
      if (btnPublish) btnPublish.style.display = 'none';
      if (btnAddService) btnAddService.style.display = 'none';
      if (btnViewBackups) btnViewBackups.style.display = 'none';
    }
  }


  // Elements
  const statsTotalServices = document.getElementById('stat-total-services');
  const statsActiveServices = document.getElementById('stat-active-services');
  const statsReferralServices = document.getElementById('stat-referral-services');
  const statsVerticalsCount = document.getElementById('stat-verticals-count');

  const tableBody = document.getElementById('services-table-body');
  const searchInput = document.getElementById('search-services');
  const verticalFilter = document.getElementById('filter-vertical');
  const statusFilter = document.getElementById('filter-status');
  const stageFilter = document.getElementById('filter-stage');

  const modalService = document.getElementById('modal-service-editor');
  const formService = document.getElementById('service-editor-form');
  const modalDelete = document.getElementById('modal-delete-confirm');
  const formDelete = document.getElementById('delete-confirm-form');
  const modalBackups = document.getElementById('modal-backups');

  const toastContainer = document.getElementById('toast-container');
  const btnPublish = document.getElementById('btn-publish-catalog');
  const btnAddService = document.getElementById('btn-add-service');
  const btnViewBackups = document.getElementById('btn-view-backups');
  const btnLogout = document.getElementById('btn-admin-logout');

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    await verifyAdminAuth();
    await loadStaffOperators();
    await loadAdminCases();
    await loadServices();
    setupEventListeners();
  });

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.style.borderColor = type === 'danger' ? '#EF4444' : '#C59B27';
    toast.innerHTML = `
      <span style="color:${type === 'danger' ? '#EF4444' : '#C59B27'}; font-size:1.1rem;">
        ${type === 'danger' ? '⚠️' : '✓'}
      </span>
      <span>${escapeHtml(message)}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 1. Server-Verified Authentication Guard
   */
  async function verifyAdminAuth() {
    try {
      const res = await authFetch('/api/v1/admin/me');
      if (!res.ok) {
        throw new Error('Not authenticated');
      }

      const data = await res.json();
      if (!data.authenticated || !['managing_partner', 'admin', 'compliance_operator'].includes(data.user.role)) {
        throw new Error('Unauthorized role');
      }

      currentAdmin = data.user;
      const userEmailEl = document.getElementById('admin-user-email');
      if (userEmailEl) userEmailEl.textContent = currentAdmin.email;

      updateRoleAwareUI();
    } catch (err) {
      window.location.href = '/admin/login.html';
    }
  }

  /**
   * 2. Load Services from Server API
   */
  async function loadServices() {
    try {
      const res = await authFetch('/api/v1/admin/services');
      if (!res.ok) throw new Error('Failed to fetch services');

      const data = await res.json();
      allServices = data.services || [];
      allVerticals = data.verticals || [];

      populateVerticalFilters();
      updateStats();
      renderTable();
    } catch (err) {
      showToast('Error loading services: ' + err.message, 'danger');
    }
  }

  function populateVerticalFilters() {
    // Populate vertical filter dropdown if empty
    if (verticalFilter.options.length <= 1) {
      allVerticals.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.id} - ${v.name}`;
        verticalFilter.appendChild(opt);
      });
    }

    // Populate modal vertical dropdown
    const modalVertSelect = document.getElementById('field-vertical-id');
    if (modalVertSelect && modalVertSelect.options.length <= 1) {
      modalVertSelect.innerHTML = '<option value="">-- Select Primary Vertical --</option>';
      allVerticals.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.id}: ${v.name}`;
        modalVertSelect.appendChild(opt);
      });
    }
  }

  function updateStats() {
    const total = allServices.length;
    const active = allServices.filter(s => s.status === 'ACTIVE_SERVICE').length;
    const referral = allServices.filter(s => s.is_referral || s.status === 'REFERRAL_ONLY').length;

    if (statsTotalServices) statsTotalServices.textContent = total;
    if (statsActiveServices) statsActiveServices.textContent = active;
    if (statsReferralServices) statsReferralServices.textContent = referral;
    if (statsVerticalsCount) statsVerticalsCount.textContent = allVerticals.length;
  }

  /**
   * 3. Filter & Render Data Table
   */
  function renderTable() {
    const q = searchInput.value.trim().toLowerCase();
    const vFilter = verticalFilter.value;
    const sFilter = statusFilter.value;
    const stFilter = stageFilter.value;

    const filtered = allServices.filter(s => {
      const matchQ = !q ||
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.aliases && s.aliases.some(a => a.toLowerCase().includes(q))) ||
        (s.forms && s.forms.some(f => f.toLowerCase().includes(q)));

      const matchV = !vFilter || s.vertical_id === vFilter;
      const matchS = !sFilter || s.status === sFilter;
      const matchSt = !stFilter || (s.business_stage && s.business_stage.toLowerCase().includes(stFilter.toLowerCase()));

      return matchQ && matchV && matchS && matchSt;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">
            No corporate services found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(s => {
      const isRef = s.is_referral || s.status === 'REFERRAL_ONLY';
      const statusClass = isRef ? 'badge-status-referral' : (s.status === 'INACTIVE' ? 'badge-status-inactive' : 'badge-status-active');
      const statusText = isRef ? 'Referral Only' : (s.status === 'INACTIVE' ? 'Inactive' : 'Active Direct');
      const displayedPrice = s.pricing?.website_displayed_price || (s.pricing?.amount ? `₹${s.pricing.amount.toLocaleString('en-IN')}` : 'Bespoke');

      return `
        <tr>
          <td>
            <span class="badge-code">${escapeHtml(s.id)}</span>
          </td>
          <td>
            <div class="service-title-cell">${escapeHtml(s.name)}</div>
            <div class="service-desc-sub">${escapeHtml(s.description || 'No description recorded')}</div>
          </td>
          <td>
            <span style="font-weight:600; font-size:0.78rem; color:#E2E8F0;">${escapeHtml(s.vertical_id)}</span>
            <div style="font-size:0.72rem; color:var(--admin-text-muted);">${escapeHtml(s.vertical_name)}</div>
          </td>
          <td>
            <span class="price-text">${escapeHtml(displayedPrice)}</span>
            <div style="font-size:0.7rem; color:var(--admin-gold);">${escapeHtml(s.pricing?.package_title || 'Statutory Filing')}</div>
          </td>
          <td>
            <span class="badge-status ${statusClass}">${statusText}</span>
          </td>
          <td>
            <div class="action-btn-group">
              <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm btn-edit-service" data-id="${escapeHtml(s.id)}">
                Edit
              </button>
              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm btn-delete-service" data-id="${escapeHtml(s.id)}" data-name="${escapeHtml(s.name)}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button events
    tableBody.querySelectorAll('.btn-edit-service').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    tableBody.querySelectorAll('.btn-delete-service').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.name));
    });
  }

  /**
   * 4. Service Modal (Create & Edit)
   */
  function openEditModal(serviceId) {
    const s = allServices.find(item => item.id === serviceId);
    if (!s) return;

    activeEditingService = s;
    document.getElementById('modal-editor-title').textContent = `Edit Service: ${s.id}`;

    // Fill general fields
    document.getElementById('field-service-id').value = s.id;
    document.getElementById('field-service-id').readOnly = true;
    document.getElementById('field-service-name').value = s.name;
    document.getElementById('field-vertical-id').value = s.vertical_id;
    document.getElementById('field-service-route').value = s.route;
    document.getElementById('field-business-stage').value = s.business_stage || 'Growth & Annual Compliance';
    document.getElementById('field-service-status').value = s.status || 'ACTIVE_SERVICE';
    document.getElementById('field-is-referral').checked = Boolean(s.is_referral);
    document.getElementById('field-description').value = s.description || '';

    // Fill pricing fields
    document.getElementById('field-price-amount').value = s.pricing?.amount || 0;
    document.getElementById('field-displayed-price').value = s.pricing?.website_displayed_price || '';
    document.getElementById('field-package-title').value = s.pricing?.package_title || '';
    document.getElementById('field-pricing-basis').value = s.pricing?.pricing_basis || 'STARTING_FROM';
    document.getElementById('field-inclusions').value = (s.pricing?.included_charges || []).join('\n');
    document.getElementById('field-exclusions').value = (s.pricing?.excluded_charges || []).join('\n');

    // Fill metadata fields
    document.getElementById('field-entity-types').value = (s.entity_types || []).join(', ');
    document.getElementById('field-forms').value = (s.forms || []).join(', ');
    document.getElementById('field-aliases').value = (s.aliases || []).join(', ');
    document.getElementById('field-keywords').value = (s.keywords || []).join(', ');

    // Reset tabs
    switchTab('tab-general');
    modalService.classList.add('active');
  }

  function openCreateModal() {
    activeEditingService = null;
    document.getElementById('modal-editor-title').textContent = 'Add New Corporate Service';
    formService.reset();

    document.getElementById('field-service-id').value = '';
    document.getElementById('field-service-id').readOnly = false;
    document.getElementById('field-service-id').placeholder = 'e.g. V01-SVC-011 (or leave blank to auto-generate)';
    document.getElementById('field-business-stage').value = 'Growth & Annual Compliance';
    document.getElementById('field-service-status').value = 'ACTIVE_SERVICE';
    document.getElementById('field-pricing-basis').value = 'STARTING_FROM';
    document.getElementById('field-price-amount').value = '4999';
    document.getElementById('field-inclusions').value = 'Statutory Consultation\nProcedural Documentation\nPortal Filing Support';
    document.getElementById('field-exclusions').value = 'Government statutory portal filing fees (payable at actuals)';

    switchTab('tab-general');
    modalService.classList.add('active');
  }

  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  /**
   * Save Service (Create or Update)
   */
  async function handleServiceFormSubmit(e) {
    e.preventDefault();

    const serviceId = document.getElementById('field-service-id').value.trim();
    const serviceName = document.getElementById('field-service-name').value.trim();
    const verticalId = document.getElementById('field-vertical-id').value;
    const route = document.getElementById('field-service-route').value.trim();
    const stage = document.getElementById('field-business-stage').value;
    const status = document.getElementById('field-service-status').value;
    const isReferral = document.getElementById('field-is-referral').checked;
    const description = document.getElementById('field-description').value.trim();

    const amount = parseInt(document.getElementById('field-price-amount').value, 10) || 0;
    const displayedPrice = document.getElementById('field-displayed-price').value.trim() || `₹${amount.toLocaleString('en-IN')} + Govt. Fees`;
    const packageTitle = document.getElementById('field-package-title').value.trim() || `${serviceName} Package`;
    const pricingBasis = document.getElementById('field-pricing-basis').value;
    const inclusions = document.getElementById('field-inclusions').value.split('\n').map(s => s.trim()).filter(Boolean);
    const exclusions = document.getElementById('field-exclusions').value.split('\n').map(s => s.trim()).filter(Boolean);

    const entityTypes = document.getElementById('field-entity-types').value.split(',').map(s => s.trim()).filter(Boolean);
    const forms = document.getElementById('field-forms').value.split(',').map(s => s.trim()).filter(Boolean);
    const aliases = document.getElementById('field-aliases').value.split(',').map(s => s.trim()).filter(Boolean);
    const keywords = document.getElementById('field-keywords').value.split(',').map(s => s.trim()).filter(Boolean);

    if (!serviceName || !verticalId) {
      showToast('Service title and Primary Vertical are required.', 'danger');
      return;
    }

    const payload = {
      id: serviceId,
      name: serviceName,
      vertical_id: verticalId,
      route: route || `/services/${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.html`,
      business_stage: stage,
      status: status,
      is_referral: isReferral,
      description: description,
      entity_types: entityTypes,
      forms: forms,
      aliases: aliases,
      keywords: keywords,
      pricing: {
        amount: amount,
        website_displayed_price: displayedPrice,
        package_title: packageTitle,
        pricing_basis: pricingBasis,
        included_charges: inclusions,
        excluded_charges: exclusions
      }
    };

    const token = localStorage.getItem('craftegon_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const isEdit = Boolean(activeEditingService);
    const url = isEdit ? `/api/v1/admin/services/${activeEditingService.id}` : '/api/v1/admin/services';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error saving service');

      showToast(result.message || 'Service saved successfully');
      modalService.classList.remove('active');
      await loadServices();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  /**
   * 5. Confirmation-Gated Deletion / Deactivation
   */
  function openDeleteModal(serviceId, serviceName) {
    document.getElementById('delete-target-id').textContent = serviceId;
    document.getElementById('delete-target-name').textContent = serviceName;
    document.getElementById('delete-confirm-input').value = '';
    document.getElementById('delete-service-id-hidden').value = serviceId;
    modalDelete.classList.add('active');
  }

  async function handleDeleteFormSubmit(e) {
    e.preventDefault();
    const serviceId = document.getElementById('delete-service-id-hidden').value;
    const confirmInput = document.getElementById('delete-confirm-input').value.trim();
    const actionType = document.querySelector('input[name="delete_action_type"]:checked').value;

    if (confirmInput !== serviceId && confirmInput !== 'CONFIRM') {
      showToast(`Verification code mismatch. Please enter '${serviceId}' to confirm.`, 'danger');
      return;
    }

    const token = localStorage.getItem('craftegon_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/v1/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          confirm_code: confirmInput,
          action: actionType
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Deletion failed');

      showToast(result.message || 'Service successfully deactivated');
      modalDelete.classList.remove('active');
      await loadServices();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  /**
   * 6. Controlled Publishing Workflow
   */
  async function handlePublishCatalog() {
    if (!confirm('Publish all current changes to the live client-facing search index and catalog? A timestamped backup will be created automatically.')) {
      return;
    }

    btnPublish.disabled = true;
    btnPublish.textContent = 'Validating & Publishing...';

    const token = localStorage.getItem('craftegon_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/admin/publish', {
        method: 'POST',
        headers
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Publishing failed');

      showToast(`Success! Published ${result.active_services_count} services. Backup saved: ${result.backup_file}`);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      btnPublish.disabled = false;
      btnPublish.textContent = 'Publish to Website';
    }
  }

  /**
   * 7. Backups and Version History
   */
  async function openBackupsModal() {
    modalBackups.classList.add('active');
    const listContainer = document.getElementById('backups-list-container');
    listContainer.innerHTML = '<div style="color:var(--admin-text-muted); padding:1.5rem; text-align:center;">Loading historical snapshots...</div>';

    const token = localStorage.getItem('craftegon_admin_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/admin/backups', { headers });
      const data = await res.json();
      const backups = data.backups || [];

      if (backups.length === 0) {
        listContainer.innerHTML = `
          <div style="padding:2rem; text-align:center; color:var(--admin-text-muted);">
            No snapshot backups found. A backup will be created upon your next publish.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = backups.map(b => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border-bottom:1px solid var(--admin-border); background:var(--admin-surface); margin-bottom:0.5rem; border-radius:6px;">
          <div>
            <strong style="color:#FFFFFF; font-family:var(--font-mono); font-size:0.82rem;">${escapeHtml(b.filename)}</strong>
            <div style="font-size:0.72rem; color:var(--admin-text-muted); margin-top:2px;">
              Created: ${new Date(b.created_at).toLocaleString()} &bull; Size: ${(b.size_bytes / 1024).toFixed(1)} KB
            </div>
          </div>
          <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm btn-restore-snapshot" data-file="${escapeHtml(b.filename)}">
            Restore Snapshot
          </button>
        </div>
      `).join('');

      listContainer.querySelectorAll('.btn-restore-snapshot').forEach(btn => {
        btn.addEventListener('click', () => handleRestoreSnapshot(btn.dataset.file));
      });
    } catch (err) {
      listContainer.innerHTML = `<div style="color:#EF4444; padding:1.5rem;">Error loading backups: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function handleRestoreSnapshot(filename) {
    if (!confirm(`Are you sure you want to restore the website catalog from '${filename}'? Current services will be reverted to this state.`)) {
      return;
    }

    const token = localStorage.getItem('craftegon_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/admin/restore', {
        method: 'POST',
        headers,
        body: JSON.stringify({ backup_file: filename })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Restoration failed');

      showToast(result.message || 'Catalog restored successfully');
      modalBackups.classList.remove('active');
      await loadServices();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  /**
   * 7b. Corporate Cases & Filings Management
   */
  async function loadStaffOperators() {
    try {
      const res = await authFetch('/api/v1/admin/staff');
      if (res.ok) {
        const data = await res.json();
        allStaff = data.staff || [];
        populateOperatorDropdown();
      }
    } catch (e) {
      console.warn('Could not load staff operators:', e.message);
    }
  }

  function populateOperatorDropdown() {
    const sel = document.getElementById('manage-case-operator');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Unassigned --</option>';
    allStaff.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.legal_entity_name || s.primary_email} (${s.account_role})`;
      sel.appendChild(opt);
    });
  }

  async function loadAdminCases() {
    const tbody = document.getElementById('cases-table-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--admin-text-muted);">Retrieving corporate cases...</td></tr>';
    }

    try {
      const res = await authFetch('/api/v1/portal/cases');
      if (!res.ok) throw new Error('Failed to retrieve cases');
      const data = await res.json();
      allCases = data.cases || [];
      updateCaseStats(allCases);
      renderCasesTable(allCases);
    } catch (err) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #F87171;">Error loading cases: ${escapeHtml(err.message)}</td></tr>`;
      }
    }
  }

  function updateCaseStats(cases) {
    const totalEl = document.getElementById('stat-cases-total');
    const progEl = document.getElementById('stat-cases-progress');
    const awaitEl = document.getElementById('stat-cases-awaiting');
    const compEl = document.getElementById('stat-cases-completed');

    if (totalEl) totalEl.textContent = cases.length;
    if (progEl) progEl.textContent = cases.filter(c => c.status === 'IN_PROGRESS').length;
    if (awaitEl) awaitEl.textContent = cases.filter(c => c.status === 'AWAITING_CUSTOMER_ACTION').length;
    if (compEl) compEl.textContent = cases.filter(c => ['STATUTORY_FILING_STAGED', 'COMPLETED', 'CLOSED'].includes(c.status)).length;
  }

  function renderCasesTable(cases) {
    const tbody = document.getElementById('cases-table-body');
    if (!tbody) return;

    if (cases.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">Zero active corporate filings or cases registered.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    cases.forEach(c => {
      const tr = document.createElement('tr');
      let badgeColor = '#60A5FA';
      if (c.status === 'AWAITING_CUSTOMER_ACTION') badgeColor = '#F59E0B';
      if (c.status === 'STATUTORY_FILING_STAGED') badgeColor = '#A78BFA';
      if (c.status === 'COMPLETED' || c.status === 'CLOSED') badgeColor = '#34D399';

      const op = allStaff.find(s => s.id === c.assigned_officer_id);
      const opName = op ? (op.legal_entity_name || op.primary_email) : (c.assigned_officer_id ? 'Assigned' : 'Unassigned');

      const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--';

      tr.innerHTML = `
        <td><strong style="font-family: var(--font-mono, monospace); color: var(--admin-gold, #C59B27);">${escapeHtml(c.case_reference)}</strong></td>
        <td>
          <div style="font-weight: 600; color: #FFF;">${escapeHtml(c.title)}</div>
          <div style="font-size: 0.75rem; color: var(--admin-text-muted);">Service: ${escapeHtml(c.service_id)}</div>
        </td>
        <td><span class="badge" style="background: rgba(255,255,255,0.06);">${escapeHtml(c.vertical_id)}</span></td>
        <td><span class="badge" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}44;">${escapeHtml((c.status || '').replace(/_/g, ' '))}</span></td>
        <td style="font-size: 0.85rem; color: ${c.assigned_officer_id ? '#34D399' : 'var(--admin-text-muted)'};">${escapeHtml(opName)}</td>
        <td style="font-size: 0.82rem; color: var(--admin-text-muted);">${dateStr}</td>
        <td style="text-align: right;">
          <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.openCaseManageModal('${escapeHtml(c.case_reference)}')">
            Manage
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function filterAdminCases() {
    const searchVal = (document.getElementById('search-cases')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('filter-case-status')?.value || '';

    const filtered = allCases.filter(c => {
      const matchSearch = !searchVal ||
        (c.case_reference && c.case_reference.toLowerCase().includes(searchVal)) ||
        (c.title && c.title.toLowerCase().includes(searchVal)) ||
        (c.service_id && c.service_id.toLowerCase().includes(searchVal));

      const matchStatus = !statusVal || c.status === statusVal;
      return matchSearch && matchStatus;
    });

    renderCasesTable(filtered);
  }

  window.switchAdminSection = function (section) {
    activeSection = section;
    const secCases = document.getElementById('section-cases');
    const secServices = document.getElementById('section-services');
    const secLeads = document.getElementById('section-leads');

    const tabCases = document.getElementById('tab-nav-cases');
    const tabServices = document.getElementById('tab-nav-services');
    const tabLeads = document.getElementById('tab-nav-leads');

    [secCases, secServices, secLeads].forEach(s => { if (s) s.style.display = 'none'; });
    [tabCases, tabServices, tabLeads].forEach(t => {
      if (t) {
        t.classList.remove('admin-btn-primary');
        t.classList.add('admin-btn-secondary');
      }
    });

    if (section === 'cases') {
      if (secCases) secCases.style.display = 'block';
      if (tabCases) { tabCases.classList.remove('admin-btn-secondary'); tabCases.classList.add('admin-btn-primary'); }
      loadAdminCases();
    } else if (section === 'services') {
      if (secServices) secServices.style.display = 'block';
      if (tabServices) { tabServices.classList.remove('admin-btn-secondary'); tabServices.classList.add('admin-btn-primary'); }
    } else if (section === 'leads') {
      if (secLeads) secLeads.style.display = 'block';
      if (tabLeads) { tabLeads.classList.remove('admin-btn-secondary'); tabLeads.classList.add('admin-btn-primary'); }
      loadAdminLeads();
    }
  };

  window.loadAdminCases = loadAdminCases;
  window.filterAdminCases = filterAdminCases;

  window.openCaseManageModal = function (caseRef) {
    const caseItem = allCases.find(c => c.case_reference === caseRef);
    if (!caseItem) return;

    document.getElementById('manage-case-ref').value = caseItem.case_reference;
    document.getElementById('manage-case-title-display').value = `${caseItem.service_id} - ${caseItem.title}`;
    document.getElementById('manage-case-status').value = caseItem.status;

    populateOperatorDropdown();
    if (caseItem.assigned_officer_id) {
      document.getElementById('manage-case-operator').value = caseItem.assigned_officer_id;
    } else {
      document.getElementById('manage-case-operator').value = '';
    }

    const fb = document.getElementById('case-manage-feedback');
    if (fb) fb.style.display = 'none';

    const modal = document.getElementById('modal-case-manage');
    if (modal) modal.classList.add('active');
  };

  window.closeCaseModal = function () {
    const modal = document.getElementById('modal-case-manage');
    if (modal) modal.classList.remove('active');
  };

  window.handleCaseUpdateSubmit = async function (e) {
    e.preventDefault();
    const caseRef = document.getElementById('manage-case-ref').value;
    const newStatus = document.getElementById('manage-case-status').value;
    const operatorId = document.getElementById('manage-case-operator').value;
    const btn = document.getElementById('btn-save-case');
    const fb = document.getElementById('case-manage-feedback');

    btn.disabled = true;
    btn.innerText = 'Saving Changes...';

    const payload = {};
    if (newStatus) payload.status = newStatus;
    if (operatorId) payload.assigned_officer_id = operatorId;

    try {
      const res = await authFetch(`/api/v1/portal/cases/${caseRef}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update case');
      }

      showToast(`Case ${caseRef} updated successfully!`);
      window.closeCaseModal();
      await loadAdminCases();
    } catch (err) {
      if (fb) {
        fb.style.display = 'block';
        fb.style.background = 'rgba(239, 68, 68, 0.15)';
        fb.style.color = '#F87171';
        fb.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        fb.textContent = err.message;
      }
    } finally {
      btn.disabled = false;
      btn.innerText = 'Save Changes';
    }
  };

  window.loadAdminLeads = async function () {
    const tbody = document.getElementById('leads-table-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--admin-text-muted);">Retrieving lead records...</td></tr>';
    }

    try {
      const res = await authFetch('/api/v1/enquiries');
      if (!res.ok) throw new Error('Failed to retrieve lead enquiries');
      const data = await res.json();
      allLeads = data.enquiries || [];
      renderLeadsTable(allLeads);
    } catch (err) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #F87171;">Error loading leads: ${escapeHtml(err.message)}</td></tr>`;
      }
    }
  };

  function renderLeadsTable(leads) {
    const tbody = document.getElementById('leads-table-body');
    if (!tbody) return;

    if (leads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">Zero incoming enquiries registered.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    leads.forEach(l => {
      const tr = document.createElement('tr');
      const dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';

      tr.innerHTML = `
        <td><strong style="font-family: var(--font-mono, monospace); color: var(--admin-gold, #C59B27);">${escapeHtml(l.lead_reference)}</strong></td>
        <td style="color: #FFF; font-weight: 500;">${escapeHtml(l.contact_name || '--')}</td>
        <td><span class="badge" style="background: rgba(255,255,255,0.06);">${escapeHtml(l.service_id || 'GENERAL')}</span></td>
        <td><span class="badge" style="background: rgba(255,255,255,0.06);">${escapeHtml(l.vertical_id || 'V01')}</span></td>
        <td><span class="badge" style="background: #3B82F622; color: #60A5FA; border: 1px solid #3B82F644;">${escapeHtml(l.status)}</span></td>
        <td style="font-size: 0.82rem; color: var(--admin-text-muted);">${dateStr}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  /**
   * 8. Event Listeners
   */
  function setupEventListeners() {
    // Search & Filter
    searchInput.addEventListener('input', () => renderTable());
    verticalFilter.addEventListener('change', () => renderTable());
    statusFilter.addEventListener('change', () => renderTable());
    stageFilter.addEventListener('change', () => renderTable());

    // Header buttons
    btnAddService.addEventListener('click', openCreateModal);
    btnPublish.addEventListener('click', handlePublishCatalog);
    btnViewBackups.addEventListener('click', openBackupsModal);

    // Logout - DEF-009: Revoke Bearer session on server via authFetch before clearing local state
    btnLogout.addEventListener('click', async () => {
      try {
        await authFetch('/api/v1/auth/logout', { method: 'POST' });
      } catch (e) {
        console.warn('[Logout Warning]', e.message);
      } finally {
        localStorage.removeItem('craftegon_admin_token');
        window.location.href = '/admin/login.html';
      }
    });

    // Form Submissions
    formService.addEventListener('submit', handleServiceFormSubmit);
    formDelete.addEventListener('submit', handleDeleteFormSubmit);

    // Modal Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Modal Closers
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        modalService.classList.remove('active');
        modalDelete.classList.remove('active');
        modalBackups.classList.remove('active');
      });
    });

    // Close on backdrop click
    [modalService, modalDelete, modalBackups].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  // Expose admin console interface on window for testability and runtime verification
  if (typeof window !== 'undefined') {
    window.authFetch = authFetch;
    window.updateRoleAwareUI = updateRoleAwareUI;
    window.loadAdminCases = loadAdminCases;
    window.loadCases = loadAdminCases;
    window.loadStaffOperators = loadStaffOperators;
    window.loadAllStaff = loadStaffOperators;
    window.getAllStaff = () => allStaff;
    window.getAllCases = () => allCases;
    window.getCurrentAdmin = () => currentAdmin;
    window.setCurrentAdmin = (admin) => { currentAdmin = admin; };
  }

})();
