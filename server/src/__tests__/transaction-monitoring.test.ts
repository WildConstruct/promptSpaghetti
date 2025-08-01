// Epic 17.5.3 - Transaction Monitoring Test Suite
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { TransactionMonitoringService } from '../services/TransactionMonitoringService.js';
import { TransactionAnomalyDetectionService } from '../services/TransactionAnomalyDetectionService.js';
import { Transaction, PaymentProvider, TransactionType } from '../marketplace/transaction.types.js';

// Mock dependencies
const mockDb = {
  query: jest.fn()
};

const mockFastify = {
  db: mockDb,
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()

 as unknown as FastifyInstance;

// Test data factories
const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'txn_' + Math.random().toString(36).substr(2, 9),
  payment_intent_id: 'pi_' + Math.random().toString(36).substr(2, 9),
  cart_id: 'cart_' + Math.random().toString(36).substr(2, 9),
  user_id: 'user_' + Math.random().toString(36).substr(2, 9),
  transaction_type: TransactionType.PURCHASE,
  amount_cents: 5000,
  fee_cents: 150,
  net_amount_cents: 4850,
  currency: 'usd',
  provider: PaymentProvider.STRIPE,
  provider_transaction_id: 'stripe_' + Math.random().toString(36).substr(2, 9),
  status: 'succeeded',
  escrow_status: 'held',
  escrow_release_date: undefined,
  risk_score: 25,
  fraud_flags: [],
  metadata: {},
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
});

describe('TransactionMonitoringService', () => {
  let service: TransactionMonitoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionMonitoringService(mockFastify);
  });

  describe('searchTransactions', () => {
    it('should search transactions with basic filters', async () => {
      const mockTransactions = [
        createMockTransaction({ amount_cents: 10000 }),
        createMockTransaction({ amount_cents: 5000 })
      ];
      
      mockDb.query
        .mockResolvedValueOnce(mockTransactions)
        .mockResolvedValueOnce([{ total: 2 }]);

      const result = await service.searchTransactions({
        minAmount: 1000,
        page: 1,
        limit: 10
      });

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should handle date range filters correctly', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      await service.searchTransactions({
        startDate,
        endDate,
        page: 1,
        limit: 10
      });

      const firstCall = mockDb.query.mock.calls[0];
      expect(firstCall[1]).toContain(startDate.toISOString());
      expect(firstCall[1]).toContain(endDate.toISOString());
    });

    it('should apply risk score filters', async () => {
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      await service.searchTransactions({
        riskScore: { min: 50, max: 90 },
        page: 1,
        limit: 10
      });

      const firstCall = mockDb.query.mock.calls[0];
      expect(firstCall[1]).toContain(50);
      expect(firstCall[1]).toContain(90);
    });

    it('should handle pagination correctly', async () => {
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 150 }]);

      const result = await service.searchTransactions({
        page: 2,
        limit: 50
      });

      expect(result.hasMore).toBe(true);
      const firstCall = mockDb.query.mock.calls[0];
      expect(firstCall[1]).toContain(50); // limit
      expect(firstCall[1]).toContain(50); // offset (page 2 * 50)
    });
  });

  describe('getTransactionDetails', () => {
    it('should return enriched transaction details', async () => {
      const mockTransaction = createMockTransaction({
        fraud_flags: ['unusual_amount'],
        metadata: { risk_assessment_id: 'risk_123' }
      });

      mockDb.query
        .mockResolvedValueOnce([{
          ...mockTransaction,
          fraud_flags: JSON.stringify(['unusual_amount']),
          metadata: JSON.stringify({ risk_assessment_id: 'risk_123' }),
          user_email: 'user@example.com'
])
        .mockResolvedValueOnce([]) // risk assessment
        .mockResolvedValueOnce([]) // refund requests
        .mockResolvedValueOnce([]); // related transactions

      const result = await service.getTransactionDetails(mockTransaction.id);

      expect(result).toBeDefined();
      expect(result?.fraud_flags).toEqual(['unusual_amount']);
      expect(result?.metadata).toEqual({ risk_assessment_id: 'risk_123' });
      expect(result?.user_email).toBe('user@example.com');
    });

    it('should return null for non-existent transaction', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      const result = await service.getTransactionDetails('non_existent');

      expect(result).toBeNull();
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status and log the change', async () => {
      const transactionId = 'txn_123';
      const adminUserId = 'admin_456';
      const mockTransaction = createMockTransaction({ id: transactionId, status: 'processing' });

      // Mock getTransactionDetails to return the existing transaction
      mockDb.query
        .mockResolvedValueOnce([{
          ...mockTransaction,
          fraud_flags: JSON.stringify([]),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([]) // risk assessment
        .mockResolvedValueOnce([]) // refund requests
        .mockResolvedValueOnce([]) // related transactions
        .mockResolvedValueOnce([]) // audit log insert
        .mockResolvedValueOnce([]); // transaction update

      await service.updateTransactionStatus(transactionId, 'succeeded', adminUserId, 'Manual approval');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transaction_audit_log'),
        expect.arrayContaining([transactionId, adminUserId, 'processing', 'succeeded'])
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?',
        expect.arrayContaining(['succeeded', expect.any(Date), transactionId])
      );
    });

    it('should throw error for non-existent transaction', async () => {
      mockDb.query.mockResolvedValueOnce([]); // getTransactionDetails returns null

      await expect(
        service.updateTransactionStatus('non_existent', 'succeeded', 'admin_123')
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('analyzeTransactionRisk', () => {
    it('should calculate risk score based on multiple factors', async () => {
      const transaction = createMockTransaction({ 
        amount_cents: 75000, // $750 - high amount
        risk_score: 30
      });

      mockDb.query
        .mockResolvedValueOnce([{
          ...transaction,
          fraud_flags: JSON.stringify([]),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([{ age_days: 2 }]) // new user
        .mockResolvedValueOnce([{ count: 1, total_amount: 75000 }]) // recent activity
        .mockResolvedValueOnce([{ failed_count: 0 }]); // failed payments

      const result = await service.analyzeTransactionRisk(transaction.id);

      expect(result.riskScore).toBeGreaterThan(30); // Should increase from base
      expect(result.riskFactors).toContain('high_amount_transaction');
      expect(result.riskFactors).toContain('new_user_account');
      expect(result.recommendations).toContain('Review transaction legitimacy');
    });

    it('should recommend blocking for very high risk scores', async () => {
      const transaction = createMockTransaction({ 
        amount_cents: 200000, // $2000 - very high amount
        risk_score: 50
      });

      mockDb.query
        .mockResolvedValueOnce([{
          ...transaction,
          fraud_flags: JSON.stringify(['multiple_failed_payments']),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([{ age_days: 1 }]) // very new user
        .mockResolvedValueOnce([{ count: 8, total_amount: 200000 }]) // high velocity
        .mockResolvedValueOnce([{ failed_count: 5 }]); // many failed payments

      const result = await service.analyzeTransactionRisk(transaction.id);

      expect(result.riskScore).toBeGreaterThan(70);
      expect(result.recommendations).toContain('Consider blocking transaction');
    });
  });

  describe('getTransactionSummary', () => {
    it('should return comprehensive transaction summary', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockMetrics = {
        total_transactions: 100,
        total_volume: 500000,
        average_amount: 5000,
        successful_transactions: 95,
        fraud_transactions: 2,
        refund_transactions: 3
      };

      mockDb.query
        .mockResolvedValueOnce([mockMetrics])
        .mockResolvedValueOnce([
          { provider: 'stripe', count: 80, volume: 400000 },
          { provider: 'paypal', count: 20, volume: 100000 }
        ])
        .mockResolvedValueOnce([
          { date: '2024-01-30', count: 5, volume: 25000 },
          { date: '2024-01-29', count: 4, volume: 20000 }
        ])
        .mockResolvedValueOnce([{ chargeback_count: 1 }]);

      const result = await service.getTransactionSummary(startDate, endDate);

      expect(result.totalTransactions).toBe(100);
      expect(result.totalVolume).toBe(500000);
      expect(result.successRate).toBe(0.95);
      expect(result.fraudRate).toBe(0.02);
      expect(result.refundRate).toBe(0.03);
      expect(result.topProviders).toHaveLength(2);
      expect(result.recentTrends).toHaveLength(2);
    });
  });
});

describe('TransactionAnomalyDetectionService', () => {
  let service: TransactionAnomalyDetectionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionAnomalyDetectionService(mockFastify);
  });

  describe('detectAnomaliesForTransaction', () => {
    it('should detect velocity anomalies', async () => {
      const transaction = createMockTransaction();

      mockDb.query
        .mockResolvedValueOnce([{
          ...transaction,
          fraud_flags: JSON.stringify([]),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([{ count: 8, total_amount: 40000 }]) // high velocity
        .mockResolvedValueOnce([]); // save anomaly

      const anomalies = await service.detectAnomaliesForTransaction(transaction.id);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].patternType).toBe('velocity_count');
      expect(anomalies[0].severity).toBe('high');
      expect(anomalies[0].confidence).toBeGreaterThan(0.5);
    });

    it('should detect amount anomalies for unusually high transactions', async () => {
      const transaction = createMockTransaction({ amount_cents: 150000 }); // $1500

      mockDb.query
        .mockResolvedValueOnce([{
          ...transaction,
          fraud_flags: JSON.stringify([]),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([{ count: 2, total_amount: 10000 }]) // low velocity
        .mockResolvedValueOnce([{ 
          avg_amount: 2500, 
          max_amount: 5000, 
          stddev_amount: 1000, 
          count: 10,
          p95_amount: 4000
]) // historical data showing this is unusual
        .mockResolvedValueOnce([]); // save anomaly

      const anomalies = await service.detectAnomaliesForTransaction(transaction.id);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].patternType).toBe('unusual_amount');
      expect(anomalies[0].evidence.deviationMultiple).toBe(60); // 150000 / 2500
      expect(anomalies[0].confidence).toBeGreaterThan(0.8);
    });

    it('should detect suspicious behavior patterns', async () => {
      const transaction = createMockTransaction();

      mockDb.query
        .mockResolvedValueOnce([{
          ...transaction,
          fraud_flags: JSON.stringify([]),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([{ count: 2, total_amount: 10000 }]) // low velocity
        .mockResolvedValueOnce([{ 
          avg_amount: 5000, 
          max_amount: 10000, 
          stddev_amount: 2000, 
          count: 5,
          p95_amount: 8000
]) // normal amount pattern
        .mockResolvedValueOnce([
          { status: 'failed', count: 5 },
          { status: 'succeeded', count: 1 }
        ]) // failed then succeeded pattern
        .mockResolvedValueOnce([{ count: 4 }]) // small amount tests
        .mockResolvedValueOnce([{ unique_methods: 1 }]) // single payment method
        .mockResolvedValueOnce([]); // save anomaly

      const anomalies = await service.detectAnomaliesForTransaction(transaction.id);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].patternType).toBe('suspicious_behavior');
      expect(anomalies[0].evidence.failedAttempts).toBe(5);
      expect(anomalies[0].suggestedActions).toContain('Check for card testing activity');
    });

    it('should detect shared payment method anomalies', async () => {
      const transaction = createMockTransaction();

      mockDb.query
        .mockResolvedValueOnce([{
          ...transaction,
          fraud_flags: JSON.stringify([]),
          metadata: JSON.stringify({})
])
        .mockResolvedValueOnce([{ count: 2, total_amount: 10000 }]) // low velocity
        .mockResolvedValueOnce([{ 
          avg_amount: 5000, 
          max_amount: 10000, 
          stddev_amount: 2000, 
          count: 5,
          p95_amount: 8000
]) // normal amount
        .mockResolvedValueOnce([
          { status: 'succeeded', count: 1 }
        ]) // normal behavior
        .mockResolvedValueOnce([{ payment_method_id: 'pm_123' }]) // payment intent
        .mockResolvedValueOnce([{
          unique_users: 6,
          total_amount: 100000,
          transaction_count: 10,
          user_ids: 'user1,user2,user3,user4,user5,user6'
]) // shared payment method
        .mockResolvedValueOnce([]); // save anomaly

      const anomalies = await service.detectAnomaliesForTransaction(transaction.id);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].patternType).toBe('shared_payment_method');
      expect(anomalies[0].evidence.uniqueUsers).toBe(6);
      expect(anomalies[0].suggestedActions).toContain('Investigate payment method sharing');
    });
  });

  describe('detectFraudRings', () => {
    it('should detect fraud rings based on shared payment methods', async () => {
      mockDb.query
        .mockResolvedValueOnce([{
          payment_method_id: 'pm_fraud_123',
          user_ids: 'user1,user2,user3,user4',
          user_count: 4,
          total_amount: 200000,
          transaction_count: 15,
          first_transaction: new Date(Date.now() - 3600000), // 1 hour ago
          last_transaction: new Date()
])
        .mockResolvedValueOnce([]); // pattern groups query

      const fraudRings = await service.detectFraudRings();

      expect(fraudRings).toHaveLength(1);
      expect(fraudRings[0].userIds).toHaveLength(4);
      expect(fraudRings[0].suspiciousActivities).toContain('shared_payment_method');
      expect(fraudRings[0].confidence).toBeGreaterThan(0.5);
      expect(fraudRings[0].status).toBe('suspected');
    });

    it('should detect fraud rings based on identical transaction patterns', async () => {
      mockDb.query
        .mockResolvedValueOnce([]) // shared payment methods
        .mockResolvedValueOnce([{
          amount_cents: 9999,
          transaction_type: 'purchase',
          provider: 'stripe',
          user_ids: 'user1,user2,user3',
          user_count: 3,
          transaction_count: 9,
          first_transaction: new Date(Date.now() - 7200000), // 2 hours ago
          last_transaction: new Date()
]);

      const fraudRings = await service.detectFraudRings();

      expect(fraudRings).toHaveLength(1);
      expect(fraudRings[0].suspiciousActivities).toContain('identical_transaction_patterns');
      expect(fraudRings[0].transactionCount).toBe(9);
    });
  });

  describe('updateAnomalyStatus', () => {
    it('should update anomaly status and record investigator', async () => {
      const anomalyId = 'anomaly_123';
      const investigatorId = 'admin_456';

      mockDb.query.mockResolvedValueOnce([]);

      await service.updateAnomalyStatus(anomalyId, 'resolved', investigatorId, 'False positive - verified with customer');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE transaction_anomalies'),
        expect.arrayContaining(['resolved', investigatorId, expect.any(Date), 'False positive - verified with customer', anomalyId])
      );
    });
  });

  describe('getAnomalyStatistics', () => {
    it('should return comprehensive anomaly statistics', async () => {
      const mockStats = {
        total_anomalies: 50,
        resolved_anomalies: 40,
        false_positives: 5,
        critical_anomalies: 3,
        high_anomalies: 12,
        medium_anomalies: 20,
        low_anomalies: 15,
        avg_confidence: 0.75
      };

      mockDb.query.mockResolvedValueOnce([mockStats]);

      const result = await service.getAnomalyStatistics('7d');

      expect(result.total_anomalies).toBe(50);
      expect(result.resolved_anomalies).toBe(40);
      expect(result.avg_confidence).toBe(0.75);
      expect(result.timeWindow).toBe('7d');
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });
});

describe('Integration Tests', () => {
  let monitoringService: TransactionMonitoringService;
  let anomalyService: TransactionAnomalyDetectionService;

  beforeEach(() => {
    jest.clearAllMocks();
    monitoringService = new TransactionMonitoringService(mockFastify);
    anomalyService = new TransactionAnomalyDetectionService(mockFastify);
  });

  it('should integrate risk analysis with anomaly detection', async () => {
    const transaction = createMockTransaction({
      amount_cents: 100000, // $1000
      risk_score: 45
    });

    // Mock responses for risk analysis
    mockDb.query
      .mockResolvedValueOnce([{
        ...transaction,
        fraud_flags: JSON.stringify([]),
        metadata: JSON.stringify({})
])
      .mockResolvedValueOnce([{ age_days: 2 }]) // new user
      .mockResolvedValueOnce([{ count: 3, total_amount: 150000 }]) // moderate velocity
      .mockResolvedValueOnce([{ failed_count: 1 }]); // few failed payments

    const riskAnalysis = await monitoringService.analyzeTransactionRisk(transaction.id);

    // Mock responses for anomaly detection
    mockDb.query
      .mockResolvedValueOnce([{
        ...transaction,
        fraud_flags: JSON.stringify([]),
        metadata: JSON.stringify({})
])
      .mockResolvedValueOnce([{ count: 3, total_amount: 150000 }]) // velocity check
      .mockResolvedValueOnce([{
        avg_amount: 2000,
        max_amount: 5000,
        stddev_amount: 1500,
        count: 8,
        p95_amount: 4500
]) // amount anomaly check
      .mockResolvedValueOnce([]); // save anomaly

    const anomalies = await anomalyService.detectAnomaliesForTransaction(transaction.id);

    // Both should identify the transaction as risky
    expect(riskAnalysis.riskScore).toBeGreaterThan(45);
    expect(riskAnalysis.riskFactors).toContain('high_amount_transaction');
    
    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].patternType).toBe('unusual_amount');
    expect(anomalies[0].severity).toBe('medium');
  });

  it('should handle transaction flagging workflow', async () => {
    const transactionId = 'txn_flag_test';
    const adminId = 'admin_123';

    // Flag transaction
    mockDb.query.mockResolvedValueOnce([]); // insert flag

    await monitoringService.flagTransactionForReview(
      transactionId, 
      adminId, 
      'fraud_suspicion', 
      'Multiple failed attempts followed by large successful transaction'
    );

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO transaction_flags'),
      expect.arrayContaining([transactionId, adminId, 'fraud_suspicion'])
    );

    // Get flags
    mockDb.query.mockResolvedValueOnce([{
      id: 'flag_123',
      transaction_id: transactionId,
      flag_type: 'fraud_suspicion',
      reason: 'Multiple failed attempts followed by large successful transaction',
      status: 'active',
      admin_email: 'admin@example.com'
]);

    const flags = await monitoringService.getTransactionFlags(transactionId);

    expect(flags).toHaveLength(1);
    expect(flags[0].flag_type).toBe('fraud_suspicion');
    expect(flags[0].status).toBe('active');
  });
});

describe('Error Handling', () => {
  let service: TransactionMonitoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionMonitoringService(mockFastify);
  });

  it('should handle database errors gracefully', async () => {
    mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

    await expect(
      service.searchTransactions({ page: 1, limit: 10 })
    ).rejects.toThrow('Database connection failed');
  });

  it('should validate search parameters', async () => {
    await expect(
      service.searchTransactions({ 
        page: 0, // Invalid page
        limit: 10 
  }
    ).rejects.toThrow();
  });

  it('should handle empty result sets', async () => {
    mockDb.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const result = await service.searchTransactions({ page: 1, limit: 10 });

    expect(result.transactions).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });
});