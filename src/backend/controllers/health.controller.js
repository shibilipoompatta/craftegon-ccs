/**
 * CraftEgon CCS - Health Controller
 */

function handleHealth(req, res, config) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.env,
    database_provider: config.databaseProvider,
    data_residency: 'AWS Mumbai (ap-south-1) - Proposed / Local Baseline'
  }));
}

module.exports = {
  handleHealth
};
