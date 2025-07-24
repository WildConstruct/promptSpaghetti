/**
 * Revenue Collection API Tests
 * Story 30.1.1 - Revenue Data Model Integration
 */

import { RevenueCollectionService } from '../RevenueCollectionAPI';
import { RevenueEventType } from '../RevenueDataModel';
import { 
  Transaction, 
  Order, 
  TransactionType,
  PaymentProvider,
  LicenseType 
} from '../../marketplace/transaction.types';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';

// Mock dependencies
const mockAnalyticsCollector = {
  track: jest.fn<unknown[], unknown>()
} as unknown as AnalyticsCollector;

const mockDbConnection = {
  query: jest.fn<unknown[], unknown>()
};

describe('RevenueCollectionService', () => {
  let revenueService: RevenueCollectionService;

  beforeEach(() => {
    revenueService = new RevenueCollectionService(mockAnalyticsCollector, mockDbConnection);
    jest.clearAllMocks();
  });

  describe('recordTransactionRevenue', () => {
    it('should record transaction revenue event successfully', async () => {
      // Arrange
      const mockTransaction: Transaction = {
        id: 'trans-123',
        payment_intent_id: 'pi-123',
        cart_id: 'cart-123',
        user_id: 'user-123',
        transaction_type: TransactionType.PURCHASE,
        amount_cents: 10000,
        fee_cents: 300,
        net_amount_cents: 9700,
        currency: 'USD',
        provider: PaymentProvider.STRIPE,
        provider_transaction_id: 'stripe-123',
        status: 'succeeded',
        escrow_status: 'released' as any,
        risk_score: 0.1,
        fraud_flags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockOrder: Order = {
        id: 'order-123',
        user_id: 'user-123',
        cart_id: 'cart-123',
        payment_intent_id: 'pi-123',
        order_number: 'ORD-001',
        status: 'completed',
        items: [
          {
            id: 'item-1',
            order_id: 'order-123',
            template_id: 'template-123',
            version_id: 'version-123',
            license_type: LicenseType.COMMERCIAL,
            quantity: 1,
            unit_price_cents: 10000,
            total_price_cents: 10000,
            fulfillment_status: 'fulfilled',
            metadata: {}
          }
        ],
        subtotal_cents: 10000,
        tax_cents: 0,
        discount_cents: 0,
        total_cents: 10000,
        currency: 'USD',
        billing_address: {
          name: 'John Doe',
          email: 'john@example.com',
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          country: 'US'
        },
        fulfillment_status: 'fulfilled',
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const sessionId = 'session-123';
      const userContext = {
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        utmParams: {
          source: 'google',
          medium: 'cpc',
          campaign: 'test-campaign'
        }
      };

      // Mock template info
      jest.spyOn(revenueService as any, 'getTemplateInfo').mockResolvedValue({
        creator_id: 'creator-123',
        commission_rate: 0.7
      } as unknown);

      // Act
      const result = await revenueService.recordTransactionRevenue(
        mockTransaction,
        mockOrder,
        sessionId,
        userContext
      );

      // Assert
      expect(result.type).toBe(RevenueEventType.TRANSACTION_COMPLETED);
      expect(result.revenue_data.amount_cents).toBe(9700);
      expect(result.revenue_data.currency).toBe('USD');
      expect(result.revenue_data.template_id).toBe('template-123');
      expect(result.revenue_data.creator_id).toBe('creator-123');
      expect(result.revenue_data.utm_source).toBe('google');
      expect(result.revenue_data.utm_medium).toBe('cpc');
      expect(result.revenue_data.utm_campaign).toBe('test-campaign');

      // Verify analytics tracking
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: RevenueEventType.TRANSACTION_COMPLETED,
          revenue_data: expect.objectContaining({
            amount_cents: 9700,
            revenue_type: 'purchase'
          })
        })
      );

      // Verify database operations
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO revenue_events'),
        expect.arrayContaining([
          result.id,
          RevenueEventType.TRANSACTION_COMPLETED,
          result.timestamp
        ])
      );

      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO revenue_attribution'),
        expect.any(Array)
      );
    });

    it('should handle refund transactions correctly', async () => {
      // Arrange
      const mockRefundTransaction: Transaction = {
        id: 'refund-123',
        payment_intent_id: 'pi-123',
        cart_id: 'cart-123',
        user_id: 'user-123',
        transaction_type: TransactionType.REFUND,
        amount_cents: -5000,
        fee_cents: 0,
        net_amount_cents: -5000,
        currency: 'USD',
        provider: PaymentProvider.STRIPE,
        provider_transaction_id: 'stripe-refund-123',
        status: 'succeeded',
        escrow_status: 'released' as any,
        risk_score: 0,
        fraud_flags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockOrder: Order = {
        id: 'order-123',
        user_id: 'user-123',
        cart_id: 'cart-123',
        payment_intent_id: 'pi-123',
        order_number: 'ORD-001',
        status: 'refunded',
        items: [],
        subtotal_cents: 5000,
        tax_cents: 0,
        discount_cents: 0,
        total_cents: 5000,
        currency: 'USD',
        billing_address: {
          name: 'John Doe',
          email: 'john@example.com',
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          country: 'US'
        },
        fulfillment_status: 'fulfilled',
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      // Act
      const result = await revenueService.recordTransactionRevenue(
        mockRefundTransaction,
        mockOrder,
        'session-123'
      );

      // Assert
      expect(result.type).toBe(RevenueEventType.TRANSACTION_REFUNDED);
      expect(result.revenue_data.amount_cents).toBe(-5000);
      expect(result.revenue_data.revenue_type).toBe('refund');
    });
  });

  describe('recordSubscriptionRevenue', () => {
    it('should record subscription creation event', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'created' as const,
        subscription_id: 'sub-123',
        user_id: 'user-123',
        plan_id: 'plan-pro',
        amount_cents: 2999,
        currency: 'USD',
        billing_cycle: 'monthly' as const
      };

      // Act
      const result = await revenueService.recordSubscriptionRevenue(
        subscriptionEvent,
        'session-123'
      );

      // Assert
      expect(result.type).toBe(RevenueEventType.SUBSCRIPTION_CREATED);
      expect(result.revenue_data.amount_cents).toBe(2999);
      expect(result.revenue_data.revenue_type).toBe('subscription');
      expect(result.metadata.subscription_id).toBe('sub-123');
      expect(result.metadata.plan_id).toBe('plan-pro');
      expect(result.metadata.billing_cycle).toBe('monthly');
    });

    it('should record subscription renewal event', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'renewed' as const,
        subscription_id: 'sub-123',
        user_id: 'user-123',
        plan_id: 'plan-pro',
        amount_cents: 2999,
        currency: 'USD',
        billing_cycle: 'monthly' as const
      };

      // Act
      const result = await revenueService.recordSubscriptionRevenue(
        subscriptionEvent,
        'session-123'
      );

      // Assert
      expect(result.type).toBe(RevenueEventType.SUBSCRIPTION_RENEWED);
    });

    it('should record subscription upgrade event', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'upgraded' as const,
        subscription_id: 'sub-123',
        user_id: 'user-123',
        plan_id: 'plan-enterprise',
        amount_cents: 9999,
        currency: 'USD',
        billing_cycle: 'monthly' as const,
        previous_plan_id: 'plan-pro'
      };

      // Act
      const result = await revenueService.recordSubscriptionRevenue(
        subscriptionEvent,
        'session-123'
      );

      // Assert
      expect(result.type).toBe(RevenueEventType.SUBSCRIPTION_UPGRADED);
      expect(result.metadata.previous_plan_id).toBe('plan-pro');
    });
  });

  describe('recordRefundRevenue', () => {
    it('should record refund revenue event', async () => {
      // Arrange
      const refund = {
        id: 'refund-123',
        transaction_id: 'trans-123',
        order_id: 'order-123',
        amount_cents: 5000,
        reason: 'Customer requested refund',
        processed_by: 'admin-123'
      };

      // Act
      const result = await revenueService.recordRefundRevenue(refund, 'session-123');

      // Assert
      expect(result.type).toBe(RevenueEventType.TRANSACTION_REFUNDED);
      expect(result.revenue_data.amount_cents).toBe(-5000); // Negative for refunds
      expect(result.revenue_data.revenue_type).toBe('refund');
      expect(result.metadata.refund_id).toBe('refund-123');
      expect(result.metadata.refund_reason).toBe('Customer requested refund');
      expect(result.metadata.processed_by).toBe('admin-123');
    });
  });

  describe('real-time aggregations', () => {
    it('should update hourly and daily aggregations', async () => {
      // Arrange
      const mockTransaction: Transaction = {
        id: 'trans-123',
        payment_intent_id: 'pi-123',
        cart_id: 'cart-123',
        user_id: 'user-123',
        transaction_type: TransactionType.PURCHASE,
        amount_cents: 10000,
        fee_cents: 300,
        net_amount_cents: 9700,
        currency: 'USD',
        provider: PaymentProvider.STRIPE,
        provider_transaction_id: 'stripe-123',
        status: 'succeeded',
        escrow_status: 'released' as any,
        risk_score: 0.1,
        fraud_flags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockOrder: Order = {
        id: 'order-123',
        user_id: 'user-123',
        cart_id: 'cart-123',
        payment_intent_id: 'pi-123',
        order_number: 'ORD-001',
        status: 'completed',
        items: [],
        subtotal_cents: 10000,
        tax_cents: 0,
        discount_cents: 0,
        total_cents: 10000,
        currency: 'USD',
        billing_address: {
          name: 'John Doe',
          email: 'john@example.com',
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          country: 'US'
        },
        fulfillment_status: 'fulfilled',
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      // Act
      await revenueService.recordTransactionRevenue(mockTransaction, mockOrder, 'session-123');

      // Assert - Check that aggregation updates were called
      const aggregationCalls = mockDbConnection.query.mock.calls.filter(call => 
        call[0].includes('INSERT INTO revenue_aggregations')
      );
      
      expect(aggregationCalls.length).toBeGreaterThanOrEqual(2); // hourly and daily
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      mockDbConnection.query.mockRejectedValue(new Error('Database connection failed'));

      const mockTransaction: Transaction = {
        id: 'trans-123',
        payment_intent_id: 'pi-123',
        cart_id: 'cart-123',
        user_id: 'user-123',
        transaction_type: TransactionType.PURCHASE,
        amount_cents: 10000,
        fee_cents: 300,
        net_amount_cents: 9700,
        currency: 'USD',
        provider: PaymentProvider.STRIPE,
        provider_transaction_id: 'stripe-123',
        status: 'succeeded',
        escrow_status: 'released' as any,
        risk_score: 0.1,
        fraud_flags: [],
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockOrder: Order = {
        id: 'order-123',
        user_id: 'user-123',
        cart_id: 'cart-123',
        payment_intent_id: 'pi-123',
        order_number: 'ORD-001',
        status: 'completed',
        items: [],
        subtotal_cents: 10000,
        tax_cents: 0,
        discount_cents: 0,
        total_cents: 10000,
        currency: 'USD',
        billing_address: {
          name: 'John Doe',
          email: 'john@example.com',
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          country: 'US'
        },
        fulfillment_status: 'fulfilled',
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      // Act & Assert
      await expect(
        revenueService.recordTransactionRevenue(mockTransaction, mockOrder, 'session-123')
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle analytics collector errors gracefully', async () => {
      // Arrange
      (mockAnalyticsCollector.track as jest.Mock).mockRejectedValue(
        new Error('Analytics service unavailable')
      );

      const subscriptionEvent = {
        type: 'created' as const,
        subscription_id: 'sub-123',
        user_id: 'user-123',
        plan_id: 'plan-pro',
        amount_cents: 2999,
        currency: 'USD',
        billing_cycle: 'monthly' as const
      };

      // Act & Assert
      await expect(
        revenueService.recordSubscriptionRevenue(subscriptionEvent, 'session-123')
      ).rejects.toThrow('Analytics service unavailable');
    });
  });

  describe('commission calculation', () => {
    it('should calculate creator commissions correctly', async () => {
      // Test the private method by accessing it
      const commissionAmount = (revenueService as any).calculateCommission(10000, 0.7);
      expect(commissionAmount).toBe(7000);
    });

    it('should handle edge cases in commission calculation', async () => {
      expect((revenueService as any).calculateCommission(1, 0.7)).toBe(1);
      expect((revenueService as any).calculateCommission(0, 0.7)).toBe(0);
      expect((revenueService as any).calculateCommission(10000, 0)).toBe(0);
      expect((revenueService as any).calculateCommission(10000, 1)).toBe(10000);
    });
  });
});