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
  let activeEditingService = null;
  let activeTab = 'tab-general';

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
      const token = localStorage.getItem('craftegon_admin_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/admin/me', { headers });
      if (!res.ok) {
        throw new Error('Not authenticated');
      }

      const data = await res.json();
      if (!data.authenticated || !['managing_partner', 'admin'].includes(data.user.role)) {
        throw new Error('Unauthorized role');
      }

      currentAdmin = data.user;
      const userEmailEl = document.getElementById('admin-user-email');
      if (userEmailEl) userEmailEl.textContent = currentAdmin.email;
    } catch (err) {
      window.location.href = '/admin/login.html';
    }
  }

  /**
   * 2. Load Services from Server API
   */
  async function loadServices() {
    try {
      const token = localStorage.getItem('craftegon_admin_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/admin/services', { headers });
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

    // Logout
    btnLogout.addEventListener('click', async () => {
      try {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('craftegon_admin_token');
      window.location.href = '/admin/login.html';
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

})();
