(() => {
  const ccfsDeadline = new Date('2026-09-15T23:59:59+05:30');

  function setText(parent, tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = value == null || value === '' ? 'Not provided' : String(value);
    parent.appendChild(element);
    return element;
  }

  function setFeedback(form, message, extraNode = null) {
    const feedback = form.querySelector('[data-lookup-feedback]') || document.getElementById(form.dataset.feedbackTarget || 'lookup-feedback');
    if (!feedback) return;
    feedback.replaceChildren();
    const msgEl = document.createElement('div');
    msgEl.className = 'lookup-feedback-msg';
    msgEl.style.lineHeight = '1.5';
    msgEl.textContent = message;
    feedback.appendChild(msgEl);
    if (extraNode) {
      feedback.appendChild(extraNode);
    }
  }

  function renderGatewayCard(query, isTrademark) {
    const card = document.createElement('div');
    card.className = 'registry-gateway-box';
    card.style.cssText = 'margin-top: 1rem; padding: 1.25rem; background: #ffffff; border: 1.5px solid var(--accent-mint-vibrant, #75CDA9); border-radius: 10px; box-shadow: 0 4px 14px rgba(16, 38, 46, 0.06); text-align: left;';

    const badgeRow = document.createElement('div');
    badgeRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;';

    const badge = document.createElement('span');
    badge.style.cssText = 'font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px;';
    badge.textContent = isTrademark ? 'IP India Official Registry Gateway' : 'MCA V3 Official Registry Gateway';
    badgeRow.appendChild(badge);

    const statutoryRef = document.createElement('span');
    statutoryRef.style.cssText = 'font-size: 0.72rem; color: #64748b; font-weight: 500;';
    statutoryRef.textContent = isTrademark ? 'Trade Marks Act, 1999 (Sec 148)' : 'Companies Act, 2013 (Sec 399)';
    badgeRow.appendChild(statutoryRef);
    card.appendChild(badgeRow);

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700; color: #0f172a;';
    title.textContent = `Search "${query}" directly in Official Live Registries:`;
    card.appendChild(title);

    const note = document.createElement('p');
    note.style.cssText = 'margin: 0 0 1rem 0; font-size: 0.825rem; color: #475569; line-height: 1.5;';
    note.textContent = isTrademark
      ? 'Under Section 148 of the Trade Marks Act 1999, registered trademarks are open to public inspection. Automated background scraping is restricted by government anti-bot controls (IT Act 2000). You can search this exact mark on the official government portal below:'
      : 'Under Section 399 of the Companies Act 2013, company master data is public record. Public direct scraping is restricted by MCA V3 security controls (IT Act 2000). You can query live certified filings on the official government portal or indexed public records below:';
    card.appendChild(note);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;';

    const officialBtn = document.createElement('a');
    officialBtn.target = '_blank';
    officialBtn.rel = 'noopener noreferrer';
    officialBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.4rem; background: var(--accent-green-primary, #247A62); color: #ffffff; padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none;';
    if (isTrademark) {
      officialBtn.href = 'https://ipindiaservices.gov.in/tmrpublicsearch/frmathena.aspx';
      officialBtn.textContent = '🏛️ Open IP India Public Search →';
    } else {
      officialBtn.href = 'https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html';
      officialBtn.textContent = '🏛️ Open MCA V3 Company Search →';
    }
    btnRow.appendChild(officialBtn);

    if (!isTrademark) {
      const mcaDataBtn = document.createElement('a');
      mcaDataBtn.target = '_blank';
      mcaDataBtn.rel = 'noopener noreferrer';
      mcaDataBtn.href = 'https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do';
      mcaDataBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.4rem; background: #f8fafc; color: #1e293b; border: 1.5px solid #cbd5e1; padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none;';
      mcaDataBtn.textContent = 'MCA V3 Master Data Lookup →';
      btnRow.appendChild(mcaDataBtn);
    }

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.4rem; background: #ffffff; color: #334155; border: 1.5px solid #cbd5e1; padding: 0.6rem 0.9rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;';
    copyBtn.textContent = '📋 Copy Query';
    copyBtn.onclick = () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(query).then(() => {
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Query'; }, 2500);
        });
      }
    };
    btnRow.appendChild(copyBtn);

    const deskBtn = document.createElement('a');
    deskBtn.target = '_blank';
    deskBtn.rel = 'noopener noreferrer';
    const waText = isTrademark
      ? `Hello CraftEgon IP Desk, I would like to request an official trademark clearance search for: "${query}".`
      : `Hello CraftEgon Compliance Desk, I would like to request official MCA master data & compliance verification for: "${query}".`;
    deskBtn.href = `https://wa.me/918606918247?text=${encodeURIComponent(waText)}`;
    deskBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.4rem; background: #f0fdf4; color: #15803d; border: 1.5px solid #86efac; padding: 0.6rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none;';
    deskBtn.textContent = '💬 Request Legal Desk Search (+91 86069 18247) →';
    btnRow.appendChild(deskBtn);

    card.appendChild(btnRow);
    return card;
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
    action.href = '/conversion/retainer-desk.html';
    action.textContent = 'Explore Retainer Desk';
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
        const gateway = renderGatewayCard(query, isTrademark);
        setFeedback(form, 'No verified or benchmark record is available for that query. No company details were fabricated. Verify directly with the official registry.', gateway);
        output.hidden = true;
        return;
      }
      output.hidden = false;
      renderResult(form, result, query, isTrademark);
    } catch (error) {
      output.hidden = true;
      const gateway = renderGatewayCard(query, isTrademark);
      setFeedback(form, 'Lookup unavailable. No registry result was returned. Try the official MCA or IP India portal.', gateway);
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