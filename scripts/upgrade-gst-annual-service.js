/**
 * upgrade-gst-annual-service.js
 * Upgrades services/gst-annual.html into a world-class GST Annual Return & Reconciliation ecosystem.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GST_ANNUAL_PATH = path.join(ROOT, 'services', 'gst-annual.html');

console.log("Upgrader initialized for:", GST_ANNUAL_PATH);
