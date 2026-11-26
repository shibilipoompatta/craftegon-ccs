/**
 * ==============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - CLOUDFLARE PAGES EDGE FUNCTION: ENQUIRIES HANDLER
 * Endpoint: POST /api/v1/enquiries
 * ==============================================================================
 * Handles inbound corporate service enquiries, enforces strict origin & DPDP
 * consent checks, performs spam filtering, persists/dispatches enquiries to
 * configured Cloudflare bindings/webhooks (D1, KV, Resend Email, Telegram, Slack,
 * or CRM Webhook), and FAILS CLOSED (HTTP 503) if no delivery sink is active so
 * no client lead is ever silently dropped.
 * ==============================================================================
 */

const ALLOWED_ORIGINS = [
  'https://ccs.craftegon.com',
  'https://craftegon.com',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080'
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.pages.dev') || origin.endsWith('.craftegon.com');
  const allowOrigin = isAllowed ? origin : 'https://ccs.craftegon.com';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid JSON payload received.',
      errors: [{ field: 'body', issue: 'Request body must be valid JSON.' }]
    }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // 1. Honeypot check (_hp_website must be empty)
  if (body._hp_website && String(body._hp_website).trim().length > 0) {
    return new Response(JSON.stringify({
      success: true,
      lead_reference: 'CCS-ENQ-' + Date.now().toString(36).toUpperCase(),
      message: 'Enquiry received.',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: corsHeaders
    });
  }

  // 2. Field validation
  const errors = [];
  const name = String(body.name || body.contact_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim().replace(/[^0-9]/g, '');
  const service = String(body.service_name || body.service_id || 'General Corporate Advisory').trim();
  const notes = String(body.scope_description || body.scope || body.message || body.notes || body.comments || '').trim();
  const dpdp_consent = body.dpdp_consent === true || body.dpdp_consent === 'yes' || body.dpdp_consent === 'true';

  if (!name || name.length < 2) {
    errors.push({ field: 'name', issue: 'Please provide a valid contact name (minimum 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', issue: 'Please provide a valid email address.' });
  }

  if (!phone || phone.length < 10) {
    errors.push({ field: 'phone', issue: 'Please provide a valid 10-digit mobile number.' });
  }

  if (!dpdp_consent) {
    errors.push({ field: 'dpdp_consent', issue: 'Affirmative DPDP Act consent is mandatory before processing enquiry.' });
  }

  if (errors.length > 0) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Enquiry validation failed.',
      errors: errors
    }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // 3. Fail closed if NO durable storage or delivery sink is configured in Cloudflare env
  const hasTelegram = Boolean(env && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
  const hasSlack = Boolean(env && env.SLACK_WEBHOOK_URL);
  const genericWebhook = env && (env.ALERT_WEBHOOK_URL || env.CRM_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL);
  const hasResend = Boolean(env && env.RESEND_API_KEY);
  const kvStore = env && env.ENQUIRIES_KV;
  const d1Db = env && (env.ENQUIRIES_DB || env.DB);

  if (!hasTelegram && !hasSlack && !genericWebhook && !hasResend && !kvStore && !d1Db) {
    return new Response(JSON.stringify({
      success: false,
      code: 'BACKEND_DELIVERY_NOT_CONFIGURED',
      message: 'Backend delivery channel is not active yet. Please use the pre-filled WhatsApp or Email desk options below.'
    }), {
      status: 503,
      headers: corsHeaders
    });
  }

  // 4. Generate verifiable lead reference
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randBytes = crypto.getRandomValues(new Uint8Array(3));
  const randHex = Array.from(randBytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const lead_reference = `CCS-ENQ-${todayStr}-${randHex}`;
  const nowIso = new Date().toISOString();

  const recordPayload = {
    event: 'ccs_lead_enquiry',
    lead_reference,
    name,
    email,
    phone,
    company_name: String(body.company_name || '').trim(),
    entity_type: String(body.entity_type || '').trim(),
    service_id: String(body.service_id || '').trim(),
    service,
    notes,
    source_url: String(body.source_url || body.page_url || '').trim(),
    utm_source: String(body.utm_source || '').trim(),
    utm_campaign: String(body.utm_campaign || '').trim(),
    timestamp: nowIso
  };

  let deliveredCount = 0;

  // Persist to Cloudflare KV if bound
  if (kvStore && typeof kvStore.put === 'function') {
    try {
      await kvStore.put(`enquiry:${lead_reference}`, JSON.stringify(recordPayload));
      deliveredCount++;
    } catch (err) {
      console.error('KV write error:', err.message);
    }
  }

  // Persist to Cloudflare D1 if bound (expects enquiries table)
  if (d1Db && typeof d1Db.prepare === 'function') {
    try {
      await d1Db.prepare(
        `INSERT INTO enquiries (lead_reference, name, email, phone, company_name, entity_type, service_id, service_name, notes, source_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        lead_reference,
        name,
        email,
        phone,
        recordPayload.company_name,
        recordPayload.entity_type,
        recordPayload.service_id,
        service,
        notes,
        recordPayload.source_url,
        nowIso
      ).run();
      deliveredCount++;
    } catch (err) {
      console.error('D1 insert error:', err.message);
    }
  }

  // Email delivery via Resend if bound
  if (hasResend) {
    try {
      const toEmail = env.ENQUIRY_TO_EMAIL || 'admin@craftegon.com';
      const fromEmail = env.RESEND_FROM_EMAIL || 'CraftEgon CCS Desk <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: email,
          subject: `[${lead_reference}] New CCS Enquiry: ${service} — ${name}`,
          text: [
            `Lead Reference: ${lead_reference}`,
            `Submitted At: ${nowIso}`,
            `Name: ${name}`,
            `Phone: ${phone}`,
            `Email: ${email}`,
            recordPayload.company_name ? `Entity: ${recordPayload.company_name}` : null,
            recordPayload.entity_type ? `Entity Type: ${recordPayload.entity_type}` : null,
            `Service: ${service}`,
            `Source Page: ${recordPayload.source_url || '/'}`,
            notes ? `\nScope / Notes:\n${notes}` : ''
          ].filter(Boolean).join('\n')
        })
      });
      if (res.ok) deliveredCount++;
      else console.error('Resend API non-OK:', res.status);
    } catch (err) {
      console.error('Resend dispatch error:', err.message);
    }
  }

  // Telegram Bot Alert
  if (hasTelegram) {
    try {
      const text =
        `NEW CRAFTEGON CCS ENQUIRY\n` +
        `Ref: ${lead_reference}\n` +
        `Client: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `Service: ${service}\n` +
        (notes ? `Notes: ${notes}\n` : '') +
        `Source: ${recordPayload.source_url || '/'}`;

      const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text
        })
      });
      if (res.ok) deliveredCount++;
      else console.error('Telegram API non-OK:', res.status);
    } catch (err) {
      console.error('Telegram alert error:', err.message);
    }
  }

  // Slack Webhook Alert
  if (hasSlack) {
    try {
      const res = await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New CCS Lead [${lead_reference}]: ${name} (${phone} | ${email}) — ${service}${notes ? ` | ${notes}` : ''}`
        })
      });
      if (res.ok) deliveredCount++;
      else console.error('Slack webhook non-OK:', res.status);
    } catch (err) {
      console.error('Slack alert error:', err.message);
    }
  }

  // Generic / Discord / CRM Webhook Alert
  if (genericWebhook) {
    try {
      const res = await fetch(genericWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayload)
      });
      if (res.ok) deliveredCount++;
      else console.error('Generic webhook non-OK:', res.status);
    } catch (err) {
      console.error('Webhook alert error:', err.message);
    }
  }

  if (deliveredCount === 0) {
    return new Response(JSON.stringify({
      success: false,
      code: 'BACKEND_DELIVERY_FAILED',
      message: 'Could not confirm enquiry delivery to our compliance desk. Please use the WhatsApp or Email option below.'
    }), {
      status: 503,
      headers: corsHeaders
    });
  }

  return new Response(JSON.stringify({
    success: true,
    lead_reference,
    message: `Thank you, ${name}. Your corporate services enquiry has been registered under reference ${lead_reference}. CraftEgon LLP (CCS) will follow up during business hours.`,
    timestamp: nowIso
  }), {
    status: 201,
    headers: corsHeaders
  });
}

export async function onRequest({ request }) {
  return new Response(JSON.stringify({
    success: false,
    message: `Method ${request.method} Not Allowed. Expected POST or OPTIONS.`
  }), {
    status: 405,
    headers: getCorsHeaders(request)
  });
}
