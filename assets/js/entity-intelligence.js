(() => {
  const ccfsDeadline = new Date('2026-09-15T23:59:59+05:30');

  function setText(parent, tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = value == null || value === '' ? 'Not provided' : String(value);
    parent.appendChild(element);
    return element;
  }

  function setFeedback(form, message) {
    const feedback = form.querySelector('[data-lookup-feedback]') || document.getElementById(form.dataset.feedbackTarget || 'lookup-feedback');
    if (feedback) feedback.textContent = message;
  }

  function getResultsTarget(form) {
    return document.getElementById(form.dataset.resultsTarget);
  }

  function renderChecklist(container, isTrademark) {
    const checklist = document.getElementById('risk-items-list');
    if (!checklist) return;
    checklist.replaceChildren();

    const items = isTrademark
      ? [
          ['Registry status', 'A benchmark record is not an official IP India search. Verify the application and current status in the public registry.'],
          ['Clearance scope', 'A name lookup does not assess phonetic, visual, class, or common-law conflicts. Obtain a professional clearance search before filing.']
        ]
      : [
          ['Live filing history', 'No authenticated MCA filing history is connected to this lookup. Confirm overdue forms and due dates using the official MCA portal.'],
          ['Director and entity checks', 'Confirm current DIN KYC, annual filing, and entity-specific applicability directly against current records.'],
          ['MSME payment review', 'Review supplier classification and written payment terms; the statutory period can depend on the agreement and acceptance date.']
        ];

    if (!isTrademark) {
      const ccfsOpen = Date.now() <= ccfsDeadline.getTime();
      items.push([
        'CCFS-2026',
        ccfsOpen
          ? 'The scheme deadline is 15 September 2026. Confirm form eligibility and filing completion requirements from the applicable MCA circular.'
          : 'The scheme deadline of 15 September 2026 has passed. Do not apply the historical 10% additional-fee treatment to a current filing.'
      ]);
    }

    items.forEach(([title, description]) => {
      const item = document.createElement('article');
      item.className = 'risk-item';
      setText(item, 'strong', 'risk-item-title', title);
      setText(item, 'p', 'risk-item-desc', description);
      checklist.appendChild(item);
    });
  }

  function renderBenchmarkFilings(card, entity) {
    if (!entity.filings || typeof entity.filings !== 'object') {
      return;
    }

    const ledger = document.createElement('section');
    ledger.className = 'filings-ledger';
    setText(ledger, 'h3', 'filings-header', 'Benchmark filing summary');
    const content = document.createElement('div');
    content.className = 'filings-grid';
    Object.entries(entity.filings).forEach(([form, record]) => {
      const entry = document.createElement('div');
      entry.className = 'filing-item';
      const value = record.status || (record.filed ? 'Filed' : record.valid ? 'Valid' : 'Status unavailable');
      setText(entry, 'strong', '', `${form.toUpperCase()}: `);
      entry.appendChild(document.createTextNode(String(value)));
      content.appendChild(entry);
    });
    ledger.appendChild(content);
    const diagnostic = card.querySelector('.risk-diagnostic-box');
    card.insertBefore(ledger, diagnostic);
  }

  function renderResult(form, result, query, isTrademark) {
    const output = getResultsTarget(form);
    if (!output) return;
    output.replaceChildren();
    output.hidden = false;
    output.style.display = 'block';
    const entity = isTrademark ? {
      name: result.name,
      registrationId: result.applicationNo ? `TM Application No. ${result.applicationNo}` : query,
      jurisdiction: result.registry,
      category: result.class,
      filingDate: result.filedDate,
      owner: result.proprietor,
      status: result.status,
      address: result.address,
      representative: result.agent
    } : {
      name: result.name,
      registrationId: result.cin || result.llpin || query,
      jurisdiction: result.roc,
      category: result.class,
      filingDate: result.incDate,
      authorized: result.authCap,
      paidUp: result.paidCap,
      status: result.status,
      address: result.address,
      representative: result.directors
    };

    const card = document.createElement('article');
    card.className = 'master-data-card';
    card.style.display = 'block';
    setText(card, 'h2', 'entity-name-heading', entity.name);
    setText(card, 'span', 'entity-cin-badge', entity.registrationId);
    setText(card, 'span', 'tier-badge tier-full', result.source === 'live' ? 'Live registry response' : 'Demo/Benchmark Preview');

    const fields = document.createElement('div');
    fields.className = 'data-fields-grid';
    const fieldPairs = [
      ['Status', entity.status],
      [isTrademark ? 'Trademark class' : 'Entity category', entity.category],
      [isTrademark ? 'Application date' : 'Incorporation date', entity.filingDate],
      [isTrademark ? 'Proprietor' : 'ROC jurisdiction', isTrademark ? entity.owner : entity.jurisdiction],
      [isTrademark ? 'Registry' : 'Authorized capital', isTrademark ? entity.jurisdiction : entity.authorized],
      [isTrademark ? 'Representative' : 'Paid-up capital', isTrademark ? entity.representative : entity.paidUp],
      ['Address', entity.address],
      [isTrademark ? 'Agent' : 'Directors / partners', entity.representative]
    ];
    fieldPairs.forEach(([label, value]) => {
      const field = document.createElement('div');
      field.className = 'data-field-item';
      setText(field, 'label', '', label);
      setText(field, 'div', 'field-val', value);
      fields.appendChild(field);
    });
    card.appendChild(fields);

    const diagnostic = document.createElement('section');
    diagnostic.className = 'risk-diagnostic-box';
    setText(diagnostic, 'h3', '', 'Preliminary Statutory Checklist');
    const list = document.createElement('div');
    list.id = 'risk-items-list';
    list.className = 'risk-items-list';
    diagnostic.appendChild(list);
    setText(diagnostic, 'p', 'risk-item-desc', 'A benchmark is not a current registry extract. This checklist is informational, not legal or tax advice.');
    const action = document.createElement('a');
    action.className = 'onboard-cta-btn';
    action.href = '/portal/subscription.html';
    action.textContent = 'Compare Retainer Tiers';
    diagnostic.appendChild(action);
    card.appendChild(diagnostic);
    output.appendChild(card);

    renderChecklist(card, isTrademark);
    if (result.source === 'benchmark' && !isTrademark) renderBenchmarkFilings(card, result);

    setFeedback(form, result.source === 'live'
      ? 'Live response received from the configured registry connector. Verify critical filings on the official portal.'
      : 'Demo/Benchmark Preview only. This sample is not a live or certified registry record.');
  }

  async function lookup(form) {
    const input = form.querySelector('[data-lookup-query]');
    const output = getResultsTarget(form);
    const query = input?.value.trim();
    if (!input || !output || !query) return;

    const lookupKind = form.querySelector('[data-lookup-kind]')?.value;
    const isTrademark = lookupKind === 'trademark' || /^(?:TM[-\s]?)?\d{5,}$/i.test(query) || /\btrademark\b/i.test(query);
    const normalizedQuery = isTrademark ? query.replace(/^TM[-\s]?/i, '') : query;
    setFeedback(form, 'Checking configured sources…');
    output.replaceChildren();

    try {
      const result = isTrademark
        ? await window.searchTrademark(normalizedQuery)
        : await window.searchCompany(query);
      if (!result || !['live', 'benchmark'].includes(result.source)) {
        setFeedback(form, 'No verified or benchmark record is available for that query. No company details were fabricated. Verify directly with the official registry.');
        output.hidden = true;
        return;
      }
      output.hidden = false;
      renderResult(form, result, query, isTrademark);
    } catch (error) {
      output.hidden = true;
      setFeedback(form, 'Lookup unavailable. No registry result was returned. Try the official MCA or IP India portal.');
    }
  }

  function populateAndSearch(query) {
    const form = document.querySelector('[data-entity-lookup]');
    const input = form?.querySelector('[data-lookup-query]');
    if (!form || !input) return;
    input.value = query;
    lookup(form);
  }

  window.populateAndSearch = populateAndSearch;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-entity-lookup]').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        lookup(form);
      });
    });
  });
})();