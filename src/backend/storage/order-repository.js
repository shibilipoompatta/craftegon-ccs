/**
 * CraftEgon CCS - Order Repository & Data Access Layer
 * Server-backed subscription order management enforcing PostgreSQL Row-Level Security
 * Supports both PostgresOrderStorage and InMemoryOrderStorage
 */

const crypto = require('node:crypto');
const { memoryStore } = require('./memory-store');
const { canTransition } = require('../models/state-machines');

class InMemoryOrderStorage {
  async createOrder(data, context = {}) {
    return memoryStore.createSubscriptionOrder(data, context);
  }

  async getOrder(ref, context = {}) {
    return memoryStore.getSubscriptionOrder(ref, context);
  }

  async getOrderByGatewayId(gatewayOrderId) {
    return memoryStore.getSubscriptionOrderByGatewayId(gatewayOrderId);
  }

  async listOrders(context = {}) {
    return memoryStore.listSubscriptionOrders(context);
  }

  async updateOrderStatus(ref, newStatus, extraData = {}, context = {}) {
    return memoryStore.updateSubscriptionOrderStatus(ref, newStatus, extraData, context);
  }
}

class PostgresOrderStorage {
  constructor(pgClient, defaultAppRole = 'craftegon_test_app_user') {
    this.client = pgClient;
    this.defaultAppRole = defaultAppRole;
  }

  async executeQuery(text, params = [], context = {}) {
    if (!this.client) {
      throw new Error('POSTGRES_CLIENT_UNAVAILABLE: Cannot query PostgreSQL without active client');
    }

    let formattedSql = text;
    params.forEach((val, idx) => {
      let sqlVal = 'NULL';
      if (val !== null && val !== undefined) {
        if (typeof val === 'boolean') {
          sqlVal = val ? 'true' : 'false';
        } else if (typeof val === 'number') {
          sqlVal = String(val);
        } else {
          sqlVal = `'${String(val).replace(/'/g, "''")}'`;
        }
      }
      const placeholder = new RegExp(`\\$${idx + 1}(?![0-9])`, 'g');
      formattedSql = formattedSql.replace(placeholder, sqlVal);
    });

    formattedSql = formattedSql.replace(/;\s*$/, '');
    const isMutation = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(formattedSql);
    const hasReturning = /\bRETURNING\b/i.test(formattedSql);
    if (isMutation && !hasReturning) {
      formattedSql += ' RETURNING *';
    }

    const jsonSql = `WITH q AS (${formattedSql}) SELECT COALESCE(json_agg(q), '[]'::json) FROM q;`;
    
    const queryOpts = {
      userId: context.userId || '',
      userRole: context.role || 'anon',
      dbRole: context.dbRole || this.defaultAppRole
    };

    const raw = this.client.query(jsonSql, queryOpts);
    try {
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end >= start) {
        return JSON.parse(raw.slice(start, end + 1));
      }
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  async createOrder(data, context = {}) {
    const id = data.id || crypto.randomUUID();
    const order_reference = data.order_reference;
    const clientId = data.client_id || context.userId;

    const sql = `
      INSERT INTO subscription_orders (
        id, order_reference, client_id, tier_name, billing_cycle,
        amount_subtotal_paise, amount_tax_paise, amount_total_paise,
        currency, gateway_provider, gateway_order_id, payment_status, idempotency_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const params = [
      id,
      order_reference,
      clientId,
      data.tier_name,
      data.billing_cycle,
      data.amount_subtotal_paise,
      data.amount_tax_paise,
      data.amount_total_paise,
      data.currency || 'INR',
      data.gateway_provider || 'RAZORPAY_SANDBOX',
      data.gateway_order_id || null,
      data.payment_status || 'ORDER_CREATED',
      data.idempotency_hash || null
    ];

    const rows = await this.executeQuery(sql, params, context);
    return rows[0] || null;
  }

  async getOrder(ref, context = {}) {
    const sql = `SELECT * FROM subscription_orders WHERE order_reference = $1;`;
    const rows = await this.executeQuery(sql, [ref], context);
    return rows[0] || null;
  }

  async getOrderByGatewayId(gatewayOrderId) {
    const sql = `SELECT * FROM subscription_orders WHERE gateway_order_id = $1;`;
    // Internal server query for webhook resolution uses staff/service role
    const rows = await this.executeQuery(sql, [gatewayOrderId], { role: 'managing_partner' });
    return rows[0] || null;
  }

  async listOrders(context = {}) {
    const sql = `SELECT * FROM subscription_orders ORDER BY created_at DESC;`;
    return await this.executeQuery(sql, [], context);
  }

  async updateOrderStatus(ref, newStatus, extraData = {}, context = {}) {
    const order = await this.getOrder(ref, context);
    if (!order) return null;

    if (!canTransition('payment', order.payment_status, newStatus)) {
      const err = new Error(`INVALID_TRANSITION: Cannot transition payment from ${order.payment_status} to ${newStatus}`);
      err.statusCode = 422;
      throw err;
    }

    const updates = ['payment_status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [ref, newStatus];
    let pIdx = 3;

    if (extraData.gateway_order_id !== undefined) {
      updates.push(`gateway_order_id = $${pIdx++}`);
      params.push(extraData.gateway_order_id);
    }

    const sql = `
      UPDATE subscription_orders
      SET ${updates.join(', ')}
      WHERE order_reference = $1
      RETURNING *;
    `;

    // Staff or server role required for webhook payment updates
    const execContext = context.role ? context : { role: 'managing_partner' };
    const rows = await this.executeQuery(sql, params, execContext);
    return rows[0] || null;
  }
}

class OrderRepository {
  constructor(adapter = new InMemoryOrderStorage()) {
    this.adapter = adapter;
  }

  setAdapter(newAdapter) {
    this.adapter = newAdapter;
  }

  async createOrder(data, context = {}) {
    return this.adapter.createOrder(data, context);
  }

  async getOrder(ref, context = {}) {
    return this.adapter.getOrder(ref, context);
  }

  async getOrderByGatewayId(gatewayOrderId) {
    return this.adapter.getOrderByGatewayId(gatewayOrderId);
  }

  async listOrders(context = {}) {
    return this.adapter.listOrders(context);
  }

  async updateOrderStatus(ref, newStatus, extraData = {}, context = {}) {
    return this.adapter.updateOrderStatus(ref, newStatus, extraData, context);
  }
}

const orderRepository = new OrderRepository();

module.exports = {
  InMemoryOrderStorage,
  PostgresOrderStorage,
  OrderRepository,
  orderRepository
};
