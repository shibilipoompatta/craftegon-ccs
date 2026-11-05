/**
 * CraftEgon CCS - Health Controller
 * Minimal public liveness probe. Returns HTTP 200 with zero internal metadata.
 */

function handleHealth(req, res, config) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok'
  }));
}

module.exports = {
  handleHealth
};
