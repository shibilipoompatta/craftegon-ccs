# CraftEgon CCS: Edge Serverless Alerts & Webhook Infrastructure

This document outlines the architecture and deployment steps to activate real-time inbound enquiry notifications via Cloudflare Pages Functions at `functions/api/v1/enquiries.js`.

---

## Architecture Overview

When a client submits an enquiry on any conversion desk or contact form (`/contact.html`, `/services/*`, `/conversion/*`), the frontend securely posts JSON to:
```http
POST https://ccs.craftegon.com/api/v1/enquiries
```

The edge worker executes:
1. **Honeypot Bot Defense:** Silent discard if hidden bot traps are populated.
2. **DPDP Act Affirmative Consent Verification:** Fails with HTTP 400 if affirmative consent is absent.
3. **Lead Reference Generation:** Produces a unique verifiable code (`CCS-ENQ-YYYYMMDD-XXXXX`).
4. **Asynchronous Non-Blocking Webhook Alert Dispatch:** Forwards full client and inquiry details to your configured communication channels (Telegram, Slack, Discord, or internal CRM) using Cloudflare's `context.waitUntil()`.

---

## Configuring Environment Variables in Cloudflare Pages

To activate live alerts without changing code, navigate to:
**Cloudflare Dashboard > Workers & Pages > ccs-craftegon > Settings > Environment variables**

Add the following variables under **Production** (and optionally Preview):

### 1. Telegram Bot Integration (Recommended — Instant Mobile Push)
| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Bot API token issued by `@BotFather` | `7123456789:AAFlkB4...` |
| `TELEGRAM_CHAT_ID` | Group chat or private ID to receive alerts | `-1001234567890` or `987654321` |

**Telegram Alert Output Preview:**
```
🚨 NEW CRAFTEGON CCS ENQUIRY
━━━━━━━━━━━━━━━━━━━━━━
📌 Ref: CCS-ENQ-20261122-8K9A2
👤 Client: Muhammed Rafeeq
📞 Phone: +91 98460 12345
✉️ Email: rafeeq@venturemalabar.com
⚖️ Service: Private Limited Company Incorporation
📝 Notes: Looking to incorporate tech venture in Calicut Cyberpark. Need SPICe+ and DPIIT guidance.
🕒 Time: 10:45:12 AM IST
```

---

### 2. Slack Webhook Integration
| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `SLACK_WEBHOOK_URL` | Incoming Webhook URL created in Slack App Settings | `https://hooks.slack.com/services/T00/B00/XXXX` |

---

### 3. Generic CRM / Discord Webhook Integration
| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `ALERT_WEBHOOK_URL` | Any HTTPS endpoint accepting POST JSON | `https://discord.com/api/webhooks/...` or custom webhook |

---

## Verification & Testing

To test your webhook setup locally or after deployment:
```bash
curl -X POST https://ccs.craftegon.com/api/v1/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Founder",
    "email": "test@craftegon.com",
    "phone": "9876543210",
    "service_name": "Private Limited Company Incorporation",
    "dpdp_consent": true,
    "message": "Automated verification test."
  }'
```

The endpoint will return:
```json
{
  "success": true,
  "lead_reference": "CCS-ENQ-20261122-XXXXX",
  "message": "Thank you, Test Founder. Your corporate services enquiry has been registered securely under reference CCS-ENQ-20261122-XXXXX. Our compliance desk will reach out within 1 business day.",
  "timestamp": "2026-11-22T17:05:00.000Z"
}
```
And your Telegram/Slack channel will instantly ring with the new lead alert!
