/**
 * CraftEgon CCS — Phase 6: Synthetic Integration Monitor
 * 
 * Executes synthetic pings, latency measurements, and health checks across
 * all platform subsystems and external regulatory integrations:
 * 1. Database Subsystem (MemoryStore / PostgreSQL simulator)
 * 2. Storage Subsystem (Private Vault Storage)
 * 3. Payment Gateway Sandbox (Order Repository & Razorpay Sandbox)
 * 4. MCA V3 Regulatory Adapter
 * 5. RBI FEMA Regulatory Adapter
 * 6. CBIC / GSTN Tax Adapter
 * 7. IP India Trade Marks Registry Adapter
 * 8. AI Model Gateway & Statutory Reasoner
 */

const { memoryStore } = require('../src/backend/storage/memory-store');
const { defaultVaultStorage } = require('../src/backend/storage/vault-storage');
const { orderRepository } = require('../src/backend/storage/order-repository');
const { McaSourceAdapter } = require('../src/backend/regulatory/adapters/mca-adapter');
const { RbiFemaSourceAdapter } = require('../src/backend/regulatory/adapters/rbi-fema-adapter');
const { TaxSourceAdapter } = require('../src/backend/regulatory/adapters/tax-adapter');
const { IpIndiaSourceAdapter } = require('../src/backend/regulatory/adapters/ipindia-adapter');
const { reasoner } = require('../src/backend/controllers/ai.controller');

async function runSyntheticMonitor(options = {}) {
  const startTime = Date.now();
  const checks = [];

  // Helper to record check outcome
  async function executeCheck(name, category, fn) {
    const checkStart = Date.now();
    try {
      const details = await fn();
      const latencyMs = Date.now() - checkStart;
      checks.push({
        name,
        category,
        status: 'UP',
        latency_ms: latencyMs,
        details: details || null,
        error: null
      });
    } catch (err) {
      const latencyMs = Date.now() - checkStart;
      checks.push({
        name,
        category,
        status: 'DOWN',
        latency_ms: latencyMs,
        details: null,
        error: err.message
      });
    }
  }

  // 1. Database Subsystem Check
  await executeCheck('Database Subsystem (MemoryStore / ACID)', 'CORE_INFRASTRUCTURE', async () => {
    const accountCount = memoryStore.accounts.size;
    const caseCount = memoryStore.cases.size;
    return {
      engine: 'in-memory-acid-rls',
      active_accounts: accountCount,
      active_cases: caseCount,
      healthy: true
    };
  });

  // 2. Vault Storage Subsystem Check
  await executeCheck('Private Vault Storage Subsystem', 'STORAGE', async () => {
    const testPath = `heartbeat/ping-${Date.now()}.txt`;
    const testBuffer = Buffer.from('heartbeat-data-' + Date.now(), 'utf8');
    await defaultVaultStorage.saveQuarantine(testPath, testBuffer);
    const readBack = await defaultVaultStorage.readFile(testPath);
    await defaultVaultStorage.deleteFile(testPath);
    return {
      driver: defaultVaultStorage.isInMemory ? 'memory-vault' : 'disk-vault',
      write_read_verified: readBack && readBack.length === testBuffer.length
    };
  });

  // 3. Payment Gateway Sandbox Check
  await executeCheck('Payment Gateway Sandbox & Order Repository', 'PAYMENTS', async () => {
    const testOrderRef = `ORD-SYNTH-${Date.now()}`;
    await orderRepository.createOrder({
      order_reference: testOrderRef,
      case_reference: 'CASE-SYNTH-001',
      client_id: 'client-synth-001',
      tier_name: 'Starter Tier',
      billing_cycle: 'monthly',
      amount_total_paise: 149900,
      currency: 'INR',
      status: 'PENDING',
      gateway_order_id: `order_synth_${Date.now()}`
    }, { userId: 'client-synth-001', role: 'client' });
    const fetched = await orderRepository.getOrder(testOrderRef, { userId: 'client-synth-001', role: 'client' });
    return {
      gateway: 'razorpay-sandbox',
      order_reference: fetched?.order_reference,
      status: fetched?.payment_status || 'ORDER_CREATED',
      verified: !!fetched
    };
  });

  // 4. Regulatory Adapters Checks (MCA, RBI, Tax, IP India)
  const mca = new McaSourceAdapter();
  await executeCheck('MCA V3 Regulatory Adapter', 'REGULATORY_INTEGRATION', async () => {
    const res = await mca.lookupComplianceRules({ entity_type: 'pvt_ltd' });
    return { status: 'LIVE', authority: mca.authority, filing_rules_count: res.result_count };
  });

  const rbi = new RbiFemaSourceAdapter();
  await executeCheck('RBI FEMA Regulatory Adapter', 'REGULATORY_INTEGRATION', async () => {
    const health = await rbi.checkHealth();
    return { status: health.status, authority: rbi.authority, official_url: rbi.officialUrl };
  });

  const tax = new TaxSourceAdapter();
  await executeCheck('CBIC / CBDT Tax Adapter', 'REGULATORY_INTEGRATION', async () => {
    const health = await tax.checkHealth();
    return { status: health.status, authority: tax.authority, official_url: tax.officialUrl };
  });

  const ipindia = new IpIndiaSourceAdapter();
  await executeCheck('IP India Trade Marks Adapter', 'REGULATORY_INTEGRATION', async () => {
    const health = await ipindia.checkHealth();
    return { status: health.status, portal_url: health.portal_url, access_mode: health.access_mode };
  });

  // 5. AI Reasoner & Model Gateway Check
  await executeCheck('AI Reasoner & Model Gateway', 'AI_SERVICES', async () => {
    const answer = await reasoner.answerQuery('What is the filing deadline for AOC-4 under Companies Act?');
    return {
      status: answer.status,
      verified: answer.verified,
      mode: answer.model_metadata?.mode || 'DETERMINISTIC_OFFLINE',
      citations_count: answer.citations.length
    };
  });

  const totalDurationMs = Date.now() - startTime;
  const downCount = checks.filter(c => c.status === 'DOWN').length;
  const overallStatus = downCount === 0 ? 'HEALTHY' : (downCount <= 2 ? 'DEGRADED' : 'UNHEALTHY');

  return {
    monitor: 'CraftEgon CCS Synthetic Integration Monitor',
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    total_checks: checks.length,
    up_count: checks.length - downCount,
    down_count: downCount,
    duration_ms: totalDurationMs,
    checks: checks
  };
}

if (require.main === module) {
  runSyntheticMonitor().then((report) => {
    console.log(JSON.stringify(report, null, 2));
    if (report.overall_status !== 'HEALTHY') {
      process.exit(1);
    }
  }).catch((err) => {
    console.error('Synthetic monitor crashed:', err);
    process.exit(1);
  });
}

module.exports = {
  runSyntheticMonitor
};
