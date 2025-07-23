// Epic 17.5.3 - Transaction Monitoring Service
import { FastifyInstance } from 'fastify';
import {
  Transaction,
  Order,
  PaymentIntent,
  RiskAssessment,
  TransactionType,
  PaymentProvider,
  EscrowStatus
} from '../marketplace/transaction.types.js';
import { DatabaseService } from '../database/database.service.js';

export interface TransactionSearchFilters {
  userId?: string;
  status?: string;
  transactionType?: TransactionType;
  provider?: PaymentProvider;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  riskScore?: { min?: number; max?: number };
  hasFlags?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionDetails extends Transaction {
  order?: Order;
  payment_intent?: PaymentIntent;
  risk_assessment?: RiskAssessment;
  user_email?: string;
  user_name?: string;
  refund_requests?: unknown[];
  related_transactions?: Transaction[];
}

export interface TransactionSummary {
  totalTransactions: number;
  totalVolume: number;
  averageAmount: number;
  successRate: number;
  fraudRate: number;
  chargebackRate: number;
  refundRate: number;
  topProviders: Array<{
    provider: PaymentProvider;
    count: number;
    volume: number;
  }>;
  recentTrends: Array<{
    date: string;
    count: number;
    volume: number;
  }>;
}

export interface AnomalyDetectionResult {
  transactionId: string;
  anomalyType: 'unusual_amount' | 'velocity_spike' | 'location_anomaly' | 'pattern_deviation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedAction: string;
  confidence: number;
  detectedAt: Date;
}

export interface TransactionAlert {
  id: string;
  transactionId: string;
  alertType: 'fraud_risk' | 'velocity_limit' | 'amount_threshold' | 'failed_payment' | 'chargeback';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export class TransactionMonitoringService {
  private db: DatabaseService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.db = fastify.db;
  }

  // =============================================
  // Transaction Search & Filtering
  // =============================================

  async searchTransactions(filters: TransactionSearchFilters): Promise<{
    transactions: TransactionDetails[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const offset = (page - 1) * limit;
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';

    // Build dynamic query
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.userId) {
      conditions.push('t.user_id = ?');
      params.push(filters.userId);
    }

    if (filters.status) {
      conditions.push('t.status = ?');
      params.push(filters.status);
    }

    if (filters.transactionType) {
      conditions.push('t.transaction_type = ?');
      params.push(filters.transactionType);
    }

    if (filters.provider) {
      conditions.push('t.provider = ?');
      params.push(filters.provider);
    }

    if (filters.minAmount) {
      conditions.push('t.amount_cents >= ?');
      params.push(filters.minAmount);
    }

    if (filters.maxAmount) {
      conditions.push('t.amount_cents <= ?');
      params.push(filters.maxAmount);
    }

    if (filters.startDate) {
      conditions.push('t.created_at >= ?');
      params.push(filters.startDate.toISOString());
    }

    if (filters.endDate) {
      conditions.push('t.created_at <= ?');
      params.push(filters.endDate.toISOString());
    }

    if (filters.riskScore?.min !== undefined) {
      conditions.push('t.risk_score >= ?');
      params.push(filters.riskScore.min);
    }

    if (filters.riskScore?.max !== undefined) {
      conditions.push('t.risk_score <= ?');
      params.push(filters.riskScore.max);
    }

    if (filters.hasFlags) {
      conditions.push('JSON_ARRAY_LENGTH(t.fraud_flags) > 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Main query with joins
    const query = `
      SELECT 
        t.*,
        o.order_number,
        o.billing_address as order_billing_address,
        pi.client_secret,
        pi.last_payment_error,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM transactions t
      LEFT JOIN orders o ON t.cart_id = o.cart_id
      LEFT JOIN payment_intents pi ON t.payment_intent_id = pi.id
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      LEFT JOIN orders o ON t.cart_id = o.cart_id
      LEFT JOIN payment_intents pi ON t.payment_intent_id = pi.id
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
    `;

    const [transactions, totalResult] = await Promise.all([
      this.db.query(query, [...params, limit, offset]),
      this.db.query(countQuery, params)
    ]);

    const total = totalResult[0]?.total || 0;
    const hasMore = offset + limit < total;

    // Enrich transaction details
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        return await this.enrichTransactionDetails(transaction);
      })
    );

    return {
      transactions: enrichedTransactions,
      total,
      page,
      limit,
      hasMore
    };
  }

  async getTransactionDetails(transactionId: string): Promise<TransactionDetails | null> {
    const result = await this.db.query(`
      SELECT 
        t.*,
        o.order_number,
        o.billing_address as order_billing_address,
        o.items as order_items,
        pi.client_secret,
        pi.last_payment_error,
        pi.metadata as payment_intent_metadata,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM transactions t
      LEFT JOIN orders o ON t.cart_id = o.cart_id
      LEFT JOIN payment_intents pi ON t.payment_intent_id = pi.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [transactionId]);

    if (result.length === 0) return null;

    return await this.enrichTransactionDetails(result[0]);
  }

  private async enrichTransactionDetails(transaction: unknown): Promise<TransactionDetails> {
    // Parse JSON fields
    transaction.fraud_flags = JSON.parse(transaction.fraud_flags || '[]');
    transaction.metadata = JSON.parse(transaction.metadata || '{}');
    
    if (transaction.order_billing_address) {
      transaction.order_billing_address = JSON.parse(transaction.order_billing_address);
    }

    if (transaction.payment_intent_metadata) {
      transaction.payment_intent_metadata = JSON.parse(transaction.payment_intent_metadata);
    }

    // Get risk assessment
    if (transaction.payment_intent_id) {
      const riskResult = await this.db.query(
        'SELECT * FROM risk_assessments WHERE payment_intent_id = ?',
        [transaction.payment_intent_id]
      );
      
      if (riskResult.length > 0) {
        const risk = riskResult[0];
        risk.risk_factors = JSON.parse(risk.risk_factors || '[]');
        risk.geo_location = JSON.parse(risk.geo_location || '{}');
        risk.velocity_checks = JSON.parse(risk.velocity_checks || '{}');
        transaction.risk_assessment = risk;
      }
    }

    // Get refund requests
    const refundResult = await this.db.query(
      'SELECT * FROM refund_requests WHERE purchase_id = ? OR order_id = ?',
      [transaction.id, transaction.cart_id]
    );
    transaction.refund_requests = refundResult;

    // Get related transactions (same user, recent)
    const relatedResult = await this.db.query(`
      SELECT * FROM transactions 
      WHERE user_id = ? AND id != ? AND created_at >= datetime(?, '-30 days')
      ORDER BY created_at DESC LIMIT 5
    `, [transaction.user_id, transaction.id, transaction.created_at]);
    
    transaction.related_transactions = relatedResult.map(t => ({
      ...t,
      fraud_flags: JSON.parse(t.fraud_flags || '[]'),
      metadata: JSON.parse(t.metadata || '{}')
    }));

    return transaction;
  }

  // =============================================
  // Transaction Analytics & Summary
  // =============================================

  async getTransactionSummary(
    startDate: Date,
    endDate: Date,
    filters?: Partial<TransactionSearchFilters>
  ): Promise<TransactionSummary> {
    const conditions = ['created_at >= ?', 'created_at <= ?'];
    const params = [startDate.toISOString(), endDate.toISOString()];

    // Apply additional filters
    if (filters?.userId) {
      conditions.push('user_id = ?');
      params.push(filters.userId);
    }

    if (filters?.provider) {
      conditions.push('provider = ?');
      params.push(filters.provider);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Basic metrics
    const metricsResult = await this.db.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount_cents) as total_volume,
        AVG(amount_cents) as average_amount,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as successful_transactions,
        SUM(CASE WHEN JSON_ARRAY_LENGTH(fraud_flags) > 0 THEN 1 ELSE 0 END) as fraud_transactions,
        SUM(CASE WHEN transaction_type = 'refund' THEN 1 ELSE 0 END) as refund_transactions
      FROM transactions
      ${whereClause}
    `, params);

    const metrics = metricsResult[0] || {};
    const totalTransactions = metrics.total_transactions || 0;

    // Provider breakdown
    const providerResult = await this.db.query(`
      SELECT 
        provider,
        COUNT(*) as count,
        SUM(amount_cents) as volume
      FROM transactions
      ${whereClause}
      GROUP BY provider
      ORDER BY volume DESC
    `, params);

    // Daily trends (last 30 days within range)
    const trendsResult = await this.db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount_cents) as volume
      FROM transactions
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);

    // Calculate chargeback rate (simplified - would need actual chargeback data)
    const chargebackResult = await this.db.query(`
      SELECT COUNT(*) as chargeback_count
      FROM transactions
      ${whereClause} AND status = 'disputed'
    `, params);

    const chargebackCount = chargebackResult[0]?.chargeback_count || 0;

    return {
      totalTransactions,
      totalVolume: metrics.total_volume || 0,
      averageAmount: Math.round(metrics.average_amount || 0),
      successRate: totalTransactions > 0 ? (metrics.successful_transactions / totalTransactions) : 0,
      fraudRate: totalTransactions > 0 ? (metrics.fraud_transactions / totalTransactions) : 0,
      chargebackRate: totalTransactions > 0 ? (chargebackCount / totalTransactions) : 0,
      refundRate: totalTransactions > 0 ? (metrics.refund_transactions / totalTransactions) : 0,
      topProviders: providerResult,
      recentTrends: trendsResult
    };
  }

  // =============================================
  // Transaction Modification & Actions
  // =============================================

  async updateTransactionStatus(
    transactionId: string, 
    newStatus: string, 
    adminUserId: string, 
    reason?: string
  ): Promise<void> {
    const transaction = await this.getTransactionDetails(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Log the status change
    await this.db.query(`
      INSERT INTO transaction_audit_log (
        transaction_id, admin_user_id, action, old_value, new_value, reason, created_at
      ) VALUES (?, ?, 'status_change', ?, ?, ?, ?)
    `, [
      transactionId, 
      adminUserId, 
      transaction.status, 
      newStatus, 
      reason || 'Admin override', 
      new Date()
    ]);

    // Update transaction
    await this.db.query(
      'UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?',
      [newStatus, new Date(), transactionId]
    );

    this.fastify.log.info(`Transaction ${transactionId} status changed from ${transaction.status} to ${newStatus} by admin ${adminUserId}`);
  }

  async addTransactionNote(
    transactionId: string, 
    adminUserId: string, 
    note: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO transaction_notes (
        transaction_id, admin_user_id, note, created_at
      ) VALUES (?, ?, ?, ?)
    `, [transactionId, adminUserId, note, new Date()]);
  }

  async getTransactionNotes(transactionId: string): Promise<any[]> {
    return await this.db.query(`
      SELECT 
        tn.*,
        u.email as admin_email,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM transaction_notes tn
      LEFT JOIN users u ON tn.admin_user_id = u.id
      WHERE tn.transaction_id = ?
      ORDER BY tn.created_at DESC
    `, [transactionId]);
  }

  // =============================================
  // Risk & Fraud Analysis
  // =============================================

  async analyzeTransactionRisk(transactionId: string): Promise<{
    riskScore: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    const transaction = await this.getTransactionDetails(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    let riskScore = transaction.risk_score || 0;
    const riskFactors: string[] = [...transaction.fraud_flags];
    const recommendations: string[] = [];

    // High amount transaction
    if (transaction.amount_cents > 50000) { // $500+
      riskScore += 15;
      riskFactors.push('high_amount_transaction');
      recommendations.push('Review transaction legitimacy');
    }

    // New user risk
    const userAgeResult = await this.db.query(
      'SELECT JULIANDAY("now") - JULIANDAY(created_at) as age_days FROM users WHERE id = ?',
      [transaction.user_id]
    );
    
    const userAge = userAgeResult[0]?.age_days || 0;
    if (userAge < 7) {
      riskScore += 20;
      riskFactors.push('new_user_account');
      recommendations.push('Verify user identity');
    }

    // Velocity check
    const recentTransactionsResult = await this.db.query(`
      SELECT COUNT(*) as count, SUM(amount_cents) as total_amount
      FROM transactions 
      WHERE user_id = ? AND created_at >= datetime(?, '-24 hours')
    `, [transaction.user_id, transaction.created_at]);

    const recentActivity = recentTransactionsResult[0];
    if (recentActivity?.count > 3) {
      riskScore += 25;
      riskFactors.push('high_velocity_transactions');
      recommendations.push('Review transaction velocity');
    }

    if (recentActivity?.total_amount > 100000) { // $1000+
      riskScore += 20;
      riskFactors.push('high_velocity_amount');
      recommendations.push('Review spending velocity');
    }

    // Failed payments history
    const failedPaymentsResult = await this.db.query(`
      SELECT COUNT(*) as failed_count
      FROM transactions 
      WHERE user_id = ? AND status = 'failed' AND created_at >= datetime(?, '-7 days')
    `, [transaction.user_id, transaction.created_at]);

    const failedCount = failedPaymentsResult[0]?.failed_count || 0;
    if (failedCount > 2) {
      riskScore += 15;
      riskFactors.push('multiple_failed_payments');
      recommendations.push('Check payment method validity');
    }

    // Add general recommendations based on risk score
    if (riskScore > 70) {
      recommendations.push('Consider blocking transaction');
      recommendations.push('Contact customer for verification');
    } else if (riskScore > 40) {
      recommendations.push('Manual review recommended');
      recommendations.push('Monitor user activity closely');
    }

    return {
      riskScore: Math.min(riskScore, 100),
      riskFactors: [...new Set(riskFactors)],
      recommendations: [...new Set(recommendations)]
    };
  }

  async flagTransactionForReview(
    transactionId: string,
    adminUserId: string,
    flagType: string,
    reason: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO transaction_flags (
        transaction_id, admin_user_id, flag_type, reason, status, created_at
      ) VALUES (?, ?, ?, ?, 'active', ?)
    `, [transactionId, adminUserId, flagType, reason, new Date()]);

    // Log the action
    await this.db.query(`
      INSERT INTO transaction_audit_log (
        transaction_id, admin_user_id, action, old_value, new_value, reason, created_at
      ) VALUES (?, ?, 'flag_added', null, ?, ?, ?)
    `, [transactionId, adminUserId, flagType, reason, new Date()]);
  }

  async getTransactionFlags(transactionId: string): Promise<any[]> {
    return await this.db.query(`
      SELECT 
        tf.*,
        u.email as admin_email,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM transaction_flags tf
      LEFT JOIN users u ON tf.admin_user_id = u.id
      WHERE tf.transaction_id = ?
      ORDER BY tf.created_at DESC
    `, [transactionId]);
  }

  // =============================================
  // Export & Reporting
  // =============================================

  async exportTransactions(
    filters: TransactionSearchFilters,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    const { transactions } = await this.searchTransactions({
      ...filters,
      limit: 10000 // Max export limit
    });

    if (format === 'json') {
      return JSON.stringify(transactions, null, 2);
    }

    // CSV export
    const headers = [
      'Transaction ID', 'User Email', 'Amount', 'Currency', 'Status',
      'Transaction Type', 'Provider', 'Risk Score', 'Created At'
    ];

    const rows = transactions.map(t => [
      t.id,
      t.user_email || '',
      (t.amount_cents / 100).toFixed(2),
      t.currency,
      t.status,
      t.transaction_type,
      t.provider,
      t.risk_score,
      t.created_at
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  async generateTransactionReport(
    startDate: Date,
    endDate: Date,
    reportType: 'summary' | 'detailed' | 'fraud_analysis'
  ): Promise<unknown> {
    const summary = await this.getTransactionSummary(startDate, endDate);

    switch (reportType) {
    case 'summary':
      return {
        reportType: 'Transaction Summary',
        period: { startDate, endDate },
        summary,
        generatedAt: new Date()
      };

    case 'detailed':
      const { transactions } = await this.searchTransactions({
        startDate,
        endDate,
        limit: 1000
      });
        
      return {
        reportType: 'Detailed Transaction Report',
        period: { startDate, endDate },
        summary,
        transactions,
        generatedAt: new Date()
      };

    case 'fraud_analysis':
      const fraudTransactions = await this.searchTransactions({
        startDate,
        endDate,
        hasFlags: true,
        limit: 1000
      });

      const highRiskTransactions = await this.searchTransactions({
        startDate,
        endDate,
        riskScore: { min: 70 },
        limit: 1000
      });

      return {
        reportType: 'Fraud Analysis Report',
        period: { startDate, endDate },
        summary,
        fraudTransactions: fraudTransactions.transactions,
        highRiskTransactions: highRiskTransactions.transactions,
        generatedAt: new Date()
      };

    default:
      throw new Error('Invalid report type');
    }
  }
}