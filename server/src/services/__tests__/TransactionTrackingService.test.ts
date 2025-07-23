/**
 * Transaction Tracking Service Tests - E17-1753114397345-58AA8D
 * 
 * Comprehensive test suite for transaction tracking and monitoring system
 * for Epic 17 - Backstage Admin Controls.
 */

import { TransactionTrackingService } from '../TransactionTrackingService';
import { Database } from '../../database/connection';
import {
  TrackedTransaction,
  TransactionSearchQuery,
  TransactionExportRequest,
  TransactionStatus,
  TransactionType,
  PaymentProvider,
  DEFAULT_TRANSACTION_TRACKING_CONFIG
} from '../../../packages/core/types/TransactionTrackingTypes';

// Mock Database
jest.mock('../../database/connection');
const MockDatabase = Database as jest.MockedClass<typeof Database>;

describe('TransactionTrackingService', () => {
  let service: TransactionTrackingService;
  let mockDb: jest.Mocked<Database>;

  const mockTransaction: TrackedTransaction = {
    id: 'tx_test_123',
    externalId: 'stripe_tx_456',
    type: 'purchase',
    status: 'succeeded',
    amount: {
      gross: 100.00,
      fees: 5.00,
      net: 95.00,
      tax: 8.50,
      discount: 0,
      refundable: 95.00,
      refunded: 0
    },
    currency: 'USD',
    buyer: {
      id: 'user_buyer_123',
      type: 'user',
      displayName: 'John Doe',
      email: 'john@example.com',
      accountStatus: 'active'
    },
    seller: {
      id: 'user_seller_456',
      type: 'creator',
      displayName: 'Jane Creator',
      email: 'jane@example.com',
      accountStatus: 'active'
    },
    template: {
      id: 'template_789',
      title: 'Test Template',
      category: 'Design',
      price: 100.00,
      version: '1.0',
      creatorId: 'user_seller_456',
      creatorName: 'Jane Creator'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa'
    },
    provider: {
      provider: 'stripe',
      providerTransactionId: 'stripe_tx_456',
      providerFees: 3.00,
      processingTime: 1500,
      webhookReceived: true
    },
    riskAssessment: {
      score: 25,
      level: 'low',
      factors: []
    },
    fraudFlags: [],
    timestamps: {
      initiated: new Date('2024-01-15T10:00:00Z'),
      completed: new Date('2024-01-15T10:00:05Z'),
      lastUpdated: new Date('2024-01-15T10:00:05Z')
    },
    lifecycle: [],
    adminNotes: [],
    flags: [],
    monitoring: {
      processingTime: 1500,
      retryCount: 0,
      errorCount: 0
    },
    metadata: {},
    tags: []
  };

  beforeEach(() => {
    mockDb = {
      query: jest.fn<unknown[], unknown>()
    } as any;
    MockDatabase.mockImplementation(() => mockDb);
    service = new TransactionTrackingService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined();
      // Service should be initialized with default config
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        ...DEFAULT_TRANSACTION_TRACKING_CONFIG,
        dataRetentionDays: 1000,
        realTimeMonitoring: false
      };
      
      const customService = new TransactionTrackingService(mockDb, customConfig);
      expect(customService).toBeDefined();
    });
  });

  describe('getTransaction', () => {
    it('should retrieve a transaction by ID', async () => {
      const mockResult = {
        rows: [{
          id: 'tx_test_123',
          provider_transaction_id: 'stripe_tx_456',
          transaction_type: 'purchase',
          status: 'succeeded',
          amount_cents: 10000,
          fee_cents: 500,
          net_amount_cents: 9500,
          currency: 'USD',
          buyer_id: 'user_buyer_123',
          seller_id: 'user_seller_456',
          template_id: 'template_789',
          buyer_name: 'John Doe',
          buyer_email: 'john@example.com',
          seller_name: 'Jane Creator',
          seller_email: 'jane@example.com',
          template_title: 'Test Template',
          template_category: 'Design',
          provider: 'stripe',
          risk_score: 25,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:05Z',
          completed_at: '2024-01-15T10:00:05Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown);

      const result = await service.getTransaction('tx_test_123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('tx_test_123');
      expect(result?.status).toBe('succeeded');
      expect(result?.amount.gross).toBe(100.00);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['tx_test_123']
      );
    });

    it('should return null for non-existent transaction', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      const result = await service.getTransaction('non_existent');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.getTransaction('tx_test_123'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('searchTransactions', () => {
    const mockSearchResults = {
      rows: [
        {
          id: 'tx_1',
          status: 'succeeded',
          amount_cents: 5000,
          total_count: '2'
          // ... other required fields
        },
        {
          id: 'tx_2',
          status: 'failed',
          amount_cents: 7500,
          total_count: '2'
          // ... other required fields
        }
      ]
    };

    beforeEach(() => {
      // Mock the aggregations query
      mockDb.query.mockImplementation((query: string) => {
        if (query.includes('COUNT(*)')) {
          return Promise.resolve({ rows: [] }); // Empty aggregations
        }
        return Promise.resolve(mockSearchResults);
      });
    });

    it('should search transactions with basic query', async () => {
      const query: TransactionSearchQuery = {
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const result = await service.searchTransactions(query);

      expect(result).toBeDefined();
      expect(result.transactions).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(mockDb.query).toHaveBeenCalled();
    });

    it('should search transactions with status filter', async () => {
      const query: TransactionSearchQuery = {
        status: ['succeeded'],
        page: 1,
        pageSize: 10
      };

      await service.searchTransactions(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('t.status = ANY'),
        expect.arrayContaining([['succeeded']])
      );
    });

    it('should search transactions with amount range', async () => {
      const query: TransactionSearchQuery = {
        minAmount: 50,
        maxAmount: 200,
        page: 1,
        pageSize: 10
      };

      await service.searchTransactions(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('t.amount_cents >='),
        expect.arrayContaining([5000, 20000])
      );
    });

    it('should search transactions with date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const query: TransactionSearchQuery = {
        dateRange: { start: startDate, end: endDate },
        page: 1,
        pageSize: 10
      };

      await service.searchTransactions(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('t.created_at BETWEEN'),
        expect.arrayContaining([startDate, endDate])
      );
    });

    it('should search transactions with text search', async () => {
      const query: TransactionSearchQuery = {
        search: 'john doe',
        page: 1,
        pageSize: 10
      };

      await service.searchTransactions(query);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%john doe%'])
      );
    });

    it('should handle pagination correctly', async () => {
      const query: TransactionSearchQuery = {
        page: 3,
        pageSize: 25
      };

      await service.searchTransactions(query);

      const offset = (3 - 1) * 25; // 50
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('OFFSET'),
        expect.arrayContaining([offset, 25])
      );
    });
  });

  describe('getTransactionAnalytics', () => {
    beforeEach(() => {
      // Mock multiple queries for analytics
      mockDb.query.mockImplementation((query: string) => {
        if (query.includes('total_transactions')) {
          return Promise.resolve({
            rows: [{
              total_transactions: '150',
              total_revenue: '15000.00',
              net_revenue: '14250.00',
              average_transaction_value: '100.00',
              median_transaction_value: '95.00',
              largest_transaction: '500.00',
              smallest_transaction: '10.00'
            }]
          });
        } else if (query.includes('provider')) {
          return Promise.resolve({
            rows: [
              { status: 'succeeded', provider: 'stripe', count: '100', avg_processing_time: '1200', avg_fee: '5.50' },
              { status: 'failed', provider: 'stripe', count: '10', avg_processing_time: '800', avg_fee: '0' },
              { status: 'succeeded', provider: 'paypal', count: '35', avg_processing_time: '2000', avg_fee: '6.25' }
            ]
          });
        } else if (query.includes('risk_score')) {
          return Promise.resolve({
            rows: [
              { risk_score: '15', fraud_flags: [], count: '120' },
              { risk_score: '45', fraud_flags: ['velocity'], count: '25' },
              { risk_score: '85', fraud_flags: ['location', 'payment_method'], count: '5' }
            ]
          });
        } else if (query.includes('previous_revenue')) {
          return Promise.resolve({
            rows: [{ previous_revenue: '12000.00' }]
          });
        }
        return Promise.resolve({ rows: [] });
      });
    });

    it('should generate comprehensive transaction analytics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getTransactionAnalytics(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.period.start).toEqual(startDate);
      expect(result.period.end).toEqual(endDate);
      expect(result.overview.totalTransactions).toBe(150);
      expect(result.overview.totalRevenue).toBe(15000);
      expect(result.overview.averageTransactionValue).toBe(100);
      expect(result.performance.successRate).toBeGreaterThan(0);
    });

    it('should calculate growth rate correctly', async () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-29');

      const result = await service.getTransactionAnalytics(startDate, endDate);

      // With current revenue 15000 and previous 12000, growth should be 25%
      expect(result.overview.growthRate).toBeCloseTo(25, 1);
    });

    it('should handle provider performance analysis', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getTransactionAnalytics(startDate, endDate);

      expect(result.performance.providerPerformance).toBeDefined();
      expect(result.performance.providerPerformance['stripe']).toBeDefined();
      expect(result.performance.providerPerformance['paypal']).toBeDefined();
      
      // Stripe should have higher transaction count
      expect(result.performance.providerPerformance['stripe'].transactionCount).toBeGreaterThan(
        result.performance.providerPerformance['paypal'].transactionCount
      );
    });
  });

  describe('addAdminNote', () => {
    it('should add admin note to transaction', async () => {
      const mockResult = {
        rows: [{
          id: 'note_123',
          transaction_id: 'tx_test_123',
          author_id: 'admin_456',
          content: 'Test admin note',
          category: 'general',
          is_private: false,
          created_at: '2024-01-15T12:00:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown);

      const result = await service.addAdminNote(
        'tx_test_123',
        'Test admin note',
        'general',
        'admin_456',
        false
      );

      expect(result).toBeDefined();
      expect(result.content).toBe('Test admin note');
      expect(result.category).toBe('general');
      expect(result.isPrivate).toBe(false);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transaction_admin_notes'),
        expect.arrayContaining(['tx_test_123', 'admin_456', 'Test admin note', 'general', false])
      );
    });

    it('should add private admin note', async () => {
      const mockResult = {
        rows: [{
          id: 'note_456',
          transaction_id: 'tx_test_123',
          author_id: 'admin_789',
          content: 'Private investigation note',
          category: 'investigation',
          is_private: true,
          created_at: '2024-01-15T12:30:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown);

      const result = await service.addAdminNote(
        'tx_test_123',
        'Private investigation note',
        'investigation',
        'admin_789',
        true
      );

      expect(result.isPrivate).toBe(true);
      expect(result.category).toBe('investigation');
    });
  });

  describe('addAdminFlag', () => {
    it('should add admin flag to transaction', async () => {
      const mockResult = {
        rows: [{
          id: 'flag_123',
          transaction_id: 'tx_test_123',
          type: 'high_risk',
          priority: 'high',
          reason: 'Unusual transaction pattern detected',
          flagged_by: 'admin_456',
          flagged_at: '2024-01-15T13:00:00Z'
        }]
      };

      mockDb.query.mockResolvedValue(mockResult as unknown);

      const result = await service.addAdminFlag(
        'tx_test_123',
        'high_risk',
        'high',
        'Unusual transaction pattern detected',
        'admin_456'
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('high_risk');
      expect(result.priority).toBe('high');
      expect(result.reason).toBe('Unusual transaction pattern detected');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transaction_admin_flags'),
        expect.arrayContaining(
          ['tx_test_123',
            'high_risk',
            'high',
            'Unusual transaction pattern detected',
            'admin_456']
        )
      );
    });
  });

  describe('exportTransactions', () => {
    const mockTransactions: TrackedTransaction[] = [mockTransaction];

    beforeEach(() => {
      // Mock the search method to return our test transactions
      jest.spyOn(service, 'searchTransactions').mockResolvedValue({
        transactions: mockTransactions,
        pagination: { page: 1, pageSize: 50, total: 1, totalPages: 1 },
        aggregations: {} as any,
        filters: { count: 0, filters: [] }
      } as unknown);
    });

    it('should export transactions in CSV format', async () => {
      const exportRequest: TransactionExportRequest = {
        format: 'csv',
        query: {},
        fields: ['id', 'status', 'amount', 'buyer_name']
      };

      const result = await service.exportTransactions(exportRequest);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('id,status,amount,buyer_name');
      expect(result).toContain('tx_test_123');
      expect(result).toContain('succeeded');
      expect(result).toContain('100');
      expect(result).toContain('John Doe');
    });

    it('should export transactions in JSON format', async () => {
      const exportRequest: TransactionExportRequest = {
        format: 'json',
        query: {}
      };

      const result = await service.exportTransactions(exportRequest);

      expect(result).toBeDefined();
      
      const parsed = JSON.parse(result);
      expect(parsed.exported_at).toBeDefined();
      expect(parsed.total_records).toBe(1);
      expect(parsed.transactions).toHaveLength(1);
      expect(parsed.transactions[0].id).toBe('tx_test_123');
    });

    it('should handle unsupported export format', async () => {
      const exportRequest: TransactionExportRequest = {
        format: 'xml' as any, // Invalid format
        query: {}
      };

      await expect(service.exportTransactions(exportRequest))
        .rejects.toThrow('Unsupported export format: xml');
    });

    it('should respect export limits', async () => {
      const largeQuery = { pageSize: 200000 }; // Exceeds max limit
      
      const exportRequest: TransactionExportRequest = {
        format: 'csv',
        query: largeQuery
      };

      await service.exportTransactions(exportRequest);

      // Should call searchTransactions with limited pageSize
      expect(service.searchTransactions).toHaveBeenCalledWith({
        ...largeQuery,
        page: 1,
        pageSize: DEFAULT_TRANSACTION_TRACKING_CONFIG.exportLimits.maxRecords
      });
    });
  });

  describe('Real-time Monitoring', () => {
    beforeEach(() => {
      // Mock getRecentTransactions
      jest.spyOn(service, 'getRecentTransactions').mockResolvedValue([mockTransaction] as unknown);
    });

    it('should start real-time monitoring', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.startRealTimeMonitoring();

      // Since the monitoring runs on intervals, we can't easily test the polling
      // But we can verify no immediate errors occurred
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle monitoring disabled', async () => {
      // Create service with monitoring disabled
      const disabledConfig = {
        ...DEFAULT_TRANSACTION_TRACKING_CONFIG,
        realTimeMonitoring: false
      };
      
      const disabledService = new TransactionTrackingService(mockDb, disabledConfig);
      
      await disabledService.startRealTimeMonitoring();
      
      // Should return immediately without setting up intervals
      expect(true).toBe(true); // Basic test that it doesn't throw
    });
  });

  describe('getRecentTransactions', () => {
    it('should get recent transactions with default limit', async () => {
      const mockResult = {
        rows: Array.from({ length: 50 }, (_, i) => ({
          id: `tx_${i}`,
          status: 'succeeded',
          amount_cents: 10000,
          buyer_name: `User ${i}`,
          seller_name: `Creator ${i}`,
          template_title: `Template ${i}`,
          created_at: new Date().toISOString()
          // ... other required fields with default values
        }))
      };

      mockDb.query.mockResolvedValue(mockResult as unknown);

      const result = await service.getRecentTransactions();

      expect(result).toHaveLength(50);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY t.created_at DESC'),
        [100] // Default limit
      );
    });

    it('should get recent transactions with custom limit', async () => {
      const mockResult = { rows: [] };
      mockDb.query.mockResolvedValue(mockResult as unknown);

      await service.getRecentTransactions(25);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1'),
        [25]
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection failures gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Connection timeout'));

      await expect(service.getTransaction('tx_123'))
        .rejects.toThrow('Connection timeout');
    });

    it('should handle malformed data gracefully', async () => {
      const malformedResult = {
        rows: [{
          id: 'tx_malformed'
          // Missing required fields
        }]
      };

      mockDb.query.mockResolvedValue(malformedResult as unknown);

      const result = await service.getTransaction('tx_malformed');

      // Should handle missing fields and provide defaults
      expect(result?.id).toBe('tx_malformed');
    });
  });

  describe('Performance', () => {
    it('should handle large search results efficiently', async () => {
      // Mock large dataset
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `tx_${i}`,
          total_count: '1000'
          // ... minimal required fields
        }))
      };

      mockDb.query.mockResolvedValue(largeResult as unknown);

      const start = Date.now();
      await service.searchTransactions({ page: 1, pageSize: 1000 });
      const duration = Date.now() - start;

      // Should complete within reasonable time (less than 100ms for mocked data)
      expect(duration).toBeLessThan(100);
    });
  });
});

describe('TransactionTrackingService Integration', () => {
  let service: TransactionTrackingService;
  let mockDb: jest.Mocked<Database>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn<unknown[], unknown>()
    } as any;
    service = new TransactionTrackingService(mockDb);
  });

  it('should support complex search and analytics workflow', async () => {
    // Mock search results
    mockDb.query.mockResolvedValueOnce({
      rows: [
        {
          id: 'tx_1',
          status: 'succeeded',
          amount_cents: 10000,
          risk_score: 25,
          total_count: '2',
          buyer_name: 'John Doe',
          seller_name: 'Jane Creator',
          created_at: '2024-01-15T10:00:00Z'
        }
      ]
    });

    // Mock aggregations call
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    // Perform search
    const searchResult = await service.searchTransactions({
      status: ['succeeded'],
      minAmount: 50,
      maxAmount: 200
    });

    expect(searchResult.transactions).toHaveLength(1);
    expect(searchResult.transactions[0].status).toBe('succeeded');

    // Mock analytics queries
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ total_transactions: '1', total_revenue: '100.00' }]
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    // Perform analytics
    const analytics = await service.getTransactionAnalytics(
      new Date('2024-01-01'),
      new Date('2024-01-31')
    );

    expect(analytics.overview.totalTransactions).toBe(1);
    expect(analytics.overview.totalRevenue).toBe(100);
  });
});