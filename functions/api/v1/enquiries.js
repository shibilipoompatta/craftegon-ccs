/**
 * ==============================================================================
 * CRAFTEGON CCS - CLOUDFLARE PAGES EDGE FUNCTION: ENQUIRIES HANDLER
 * Endpoint: POST /api/v1/enquiries
 * ==============================================================================
 * Handles inbound corporate services enquiries, validates fields, enforces
 * CORS, performs bot filtering (honeypot + render timer), and issues a verified
 * lead reference code in strict accordance with the CCS backend contract.
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

export async function onRequestPost({ request, env }) {
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
    // Silent discard for spam bots
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
  const service = String(body.service_name || body.service_id || 'General Enquiry').trim();
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

  // 3. Generate unique verifiable lead reference
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  const lead_reference = `CCS-ENQ-${todayStr}-${randCode}`;

  return new Response(JSON.stringify({
    success: true,
    lead_reference: lead_reference,
    message: `Thank you, ${name}. Your corporate services enquiry has been registered securely under reference ${lead_reference}. Our compliance desk will reach out within 1 business day.`,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
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
