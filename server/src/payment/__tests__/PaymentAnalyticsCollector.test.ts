/**
 * Payment Analytics Collector Tests
 * Story 30.1.3 - Payment Integration Analytics
 * 
 * Comprehensive test suite for PaymentAnalyticsCollector
 */

import { PaymentAnalyticsCollector, PaymentAnalyticsEventType } from '../PaymentAnalyticsCollector';
import { PaymentProvider, PaymentMethodType, TransactionType } from '../../marketplace/transaction.types';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';

// Mock dependencies
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('stripe');

describe('PaymentAnalyticsCollector', () => {
  let collector: PaymentAnalyticsCollector;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockDbConnection: unknown;

  beforeEach(() => {
    mockAnalyticsCollector = new AnalyticsCollector({} as any, {} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown);

    mockDbConnection = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown)
    };

    collector = new PaymentAnalyticsCollector(
      mockAnalyticsCollector,
      mockDbConnection,
      {
        stripeSecretKey: 'sk_test_123',
        paypalClientId: 'paypal_client_123',
        paypalClientSecret: 'paypal_secret_123'
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Event Tracking', () => {
    describe('trackPaymentAttempt', () => {
      it('should track payment attempt with correct event data', async () => {
        const paymentIntent = {
          id: 'pi_test_123',
          provider: PaymentProvider.STRIPE,
          amount_cents: 2000,
          currency: 'usd',
          payment_method_id: 'pm_test_123'
        };

        const userContext = {
          userId: 'user_123',
          sessionId: 'session_123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          country: 'US'
        };

        await collector.trackPaymentAttempt(paymentIntent, userContext);

        expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
          expect.objectContaining({
            type: PaymentAnalyticsEventType.PAYMENT_ATTEMPT,
            sessionId: 'session_123',
            userId: 'user_123',
            metadata: expect.objectContaining({
              paymentIntentId: 'pi_test_123',
              provider: PaymentProvider.STRIPE,
              amount: 2000,
              currency: 'usd',
              country: 'US'
  }
  }
        );

        expect(mockDbConnection.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO payment_events'),
          expect.arrayContaining([
            expect.any(String), // id
            PaymentAnalyticsEventType.PAYMENT_ATTEMPT,
            expect.any(Number), // timestamp
            'session_123',
            'user_123',
            expect.any(String), // metadata JSON
            expect.any(Date) // created_at
          ])
        );
      });

      it('should handle errors gracefully during tracking', async () => {
        const paymentIntent = {
          id: 'pi_test_123',
          provider: PaymentProvider.STRIPE,
          amount_cents: 2000,
          currency: 'usd',
          payment_method_id: 'pm_test_123'
        };

        const userContext = {
          userId: 'user_123',
          sessionId: 'session_123'
        };

        mockAnalyticsCollector.track.mockRejectedValue(new Error('Analytics error'));

        // Should not throw error
        await expect(collector.trackPaymentAttempt(paymentIntent, userContext))
          .resolves.toBeUndefined();
      });
    });

    describe('trackPaymentSuccess', () => {
      it('should track successful payment with processing time', async () => {
        const transaction = {
          id: 'txn_test_123',
          provider: PaymentProvider.STRIPE,
          amount_cents: 2000,
          fee_cents: 60,
          net_amount_cents: 1940,
          risk_score: 25
        };

        const userContext = {
          userId: 'user_123',
          sessionId: 'session_123'
        };

        await collector.trackPaymentSuccess(transaction, 500, userContext);

        expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
          expect.objectContaining({
            type: PaymentAnalyticsEventType.PAYMENT_SUCCESS,
            metadata: expect.objectContaining({
              transactionId: 'txn_test_123',
              provider: PaymentProvider.STRIPE,
              amount: 2000,
              processingTime: 500,
              fees: 60,
              netAmount: 1940,
              riskScore: 25
  }
  }
        );
      });

      it('should update provider metrics after successful payment', async () => {
        const transaction = {
          id: 'txn_test_123',
          provider: PaymentProvider.STRIPE,
          amount_cents: 2000,
          fee_cents: 60,
          net_amount_cents: 1940,
          risk_score: 25
        };

        const userContext = {
          userId: 'user_123',
          sessionId: 'session_123'
        };

        await collector.trackPaymentSuccess(transaction, 500, userContext);

        expect(mockDbConnection.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO provider_metrics_hourly'),
          expect.arrayContaining([
            PaymentProvider.STRIPE,
            expect.any(String), // hour_key
            1, // attempts
            1, // successes
            0, // failures
            2000, // total_volume
            60, // total_fees
            500, // processing_time_sum
            1 // processing_time_count
          ])
        );
      });
    });

    describe('trackPaymentFailure', () => {
      it('should track payment failure with error details', async () => {
        const paymentIntent = {
          id: 'pi_test_123',
          provider: PaymentProvider.STRIPE,
          amount_cents: 2000,
          currency: 'usd',
          payment_method_id: 'pm_test_123'
        };

        const userContext = {
          userId: 'user_123',
          sessionId: 'session_123'
        };

        await collector.trackPaymentFailure(
          paymentIntent,
          'Card was declined',
          'card_declined',
          userContext
        );

        expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
          expect.objectContaining({
            type: PaymentAnalyticsEventType.PAYMENT_FAILURE,
            metadata: expect.objectContaining({
              paymentIntentId: 'pi_test_123',
              provider: PaymentProvider.STRIPE,
              amount: 2000,
              failureReason: 'Card was declined',
              errorCode: 'card_declined',
              isRetryable: true
  }
  }
        );
      });

      it('should correctly identify retryable errors', async () => {
        const paymentIntent = {
          id: 'pi_test_123',
          provider: PaymentProvider.STRIPE,
          amount_cents: 2000,
          currency: 'usd',
          payment_method_id: 'pm_test_123'
        };

        const userContext = {
          userId: 'user_123',
          sessionId: 'session_123'
        };

        // Test retryable error
        await collector.trackPaymentFailure(
          paymentIntent,
          'Processing error',
          'processing_error',
          userContext
        );

        expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              isRetryable: true
  }
  }
        );

        // Test non-retryable error
        await collector.trackPaymentFailure(
          paymentIntent,
          'Invalid card number',
          'invalid_card',
          userContext
        );

        expect(mockAnalyticsCollector.track).toHaveBeenLastCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              isRetryable: false
  }
  }
        );
      });
    });
  });

  describe('Webhook Processing', () => {
    describe('processWebhook', () => {
      it('should process valid webhook events', async () => {
        const webhookData = {
          id: 'evt_test_123',
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_test_123',
              amount: 2000,
              currency: 'usd'
            }
          }
        };

        await collector.processWebhook(
          PaymentProvider.STRIPE,
          'payment_intent.succeeded',
          webhookData,
          'valid_signature'
        );

        expect(mockDbConnection.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO payment_webhook_events'),
          expect.arrayContaining([
            expect.any(String), // id
            PaymentProvider.STRIPE,
            'payment_intent.succeeded',
            JSON.stringify(webhookData),
            expect.any(Date), // received_at
            expect.any(Date), // processed_at
            'processed',
            null, // error_message
            expect.any(Date) // created_at
          ])
        );
      });

      it('should handle webhook signature verification failure', async () => {
        // Mock signature verification failure
        jest.spyOn(collector as any, 'verifyWebhookSignature')
          .mockResolvedValue(false as unknown as unknown);

        const webhookData = { test: 'data' };

        await collector.processWebhook(
          PaymentProvider.STRIPE,
          'payment_intent.succeeded',
          webhookData,
          'invalid_signature'
        );

        expect(mockDbConnection.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO payment_webhook_events'),
          expect.arrayContaining([
            expect.any(String),
            PaymentProvider.STRIPE,
            'payment_intent.succeeded',
            JSON.stringify(webhookData),
            expect.any(Date),
            undefined, // processed_at should be undefined
            'failed',
            'Invalid webhook signature',
            expect.any(Date)
          ])
        );
      });
    });
  });

  describe('Analytics and Metrics', () => {
    describe('getProviderMetrics', () => {
      it('should calculate provider metrics correctly', async () => {
        const mockResults = [
          {
            total_attempts: 1000,
            successful_payments: 950,
            failed_payments: 50,
            avg_processing_time: 450,
            p95_processing_time: 800,
            total_volume: 200000,
            total_fees: 6000
          }
        ];

        mockDbConnection.query.mockResolvedValue(mockResults as unknown as unknown);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        const metrics = await collector.getProviderMetrics(
          PaymentProvider.STRIPE,
          startDate,
          endDate
        );

        expect(metrics).toEqual(
          expect.objectContaining({
            provider: PaymentProvider.STRIPE,
            totalAttempts: 1000,
            successfulPayments: 950,
            failedPayments: 50,
            successRate: 95,
            averageProcessingTime: 450,
            p95ProcessingTime: 800,
            totalVolume: 200000,
            totalFees: 6000,
            averageFeeRate: 3
  }
        );
      });

      it('should use cache for repeated requests', async () => {
        const mockResults = [
          {
            total_attempts: 1000,
            successful_payments: 950,
            failed_payments: 50,
            avg_processing_time: 450,
            p95_processing_time: 800,
            total_volume: 200000,
            total_fees: 6000
          }
        ];

        mockDbConnection.query.mockResolvedValue(mockResults as unknown as unknown);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        // First call
        await collector.getProviderMetrics(PaymentProvider.STRIPE, startDate, endDate);
        
        // Second call (should use cache)
        await collector.getProviderMetrics(PaymentProvider.STRIPE, startDate, endDate);

        // Database should only be queried once
        expect(mockDbConnection.query).toHaveBeenCalledTimes(1);
      });
    });

    describe('getPaymentMethodMetrics', () => {
      it('should return payment method performance data', async () => {
        const mockResults = [
          {
            total_attempts: 500,
            successful_payments: 475,
            avg_processing_time: 300,
            total_volume: 100000
          }
        ];

        mockDbConnection.query.mockResolvedValue(mockResults as unknown as unknown);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        const metrics = await collector.getPaymentMethodMetrics(
          PaymentMethodType.CARD,
          PaymentProvider.STRIPE,
          startDate,
          endDate
        );

        expect(metrics).toEqual(
          expect.objectContaining({
            methodType: PaymentMethodType.CARD,
            provider: PaymentProvider.STRIPE,
            successRate: 95,
            averageProcessingTime: 300,
            totalVolume: 100000
  }
        );
      });
    });

    describe('getFailureAnalysis', () => {
      it('should return failure analysis with patterns', async () => {
        const mockResults = [
          {
            failure_code: 'card_declined',
            description: 'Card was declined',
            frequency: 150,
            retry_success_rate: 0.45
  }
          {
            failure_code: 'insufficient_funds',
            description: 'Insufficient funds',
            frequency: 80,
            retry_success_rate: 0.25
          }
        ];

        mockDbConnection.query.mockResolvedValue(mockResults as unknown as unknown);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        const analysis = await collector.getFailureAnalysis(
          PaymentProvider.STRIPE,
          startDate,
          endDate
        );

        expect(analysis).toHaveLength(2);
        expect(analysis[0]).toEqual(
          expect.objectContaining({
            failureCode: 'card_declined',
            provider: PaymentProvider.STRIPE,
            frequency: 150,
            percentage: expect.any(Number),
            description: 'Card was declined',
            suggestedAction: 'Ask customer to try a different payment method',
            isRetryable: true,
            averageRetrySuccess: 45
  }
        );
      });
    });
  });

  describe('Helper Methods', () => {
    describe('isRetryableError', () => {
      it('should correctly identify retryable errors', () => {
        const retryableErrors = [
          'card_declined',
          'insufficient_funds',
          'processing_error',
          'rate_limit_error',
          'api_connection_error',
          'api_error'
        ];

        const nonRetryableErrors = [
          'invalid_card',
          'card_expired',
          'cvc_check_failed',
          'authentication_required'
        ];

        retryableErrors.forEach(errorCode => {
          expect((collector as any).isRetryableError(errorCode)).toBe(true);
        });

        nonRetryableErrors.forEach(errorCode => {
          expect((collector as any).isRetryableError(errorCode)).toBe(false);
        });
      });
    });

    describe('getSuggestedAction', () => {
      it('should return appropriate suggestions for error codes', () => {
        const errorActions = [
          { code: 'card_declined', action: 'Ask customer to try a different payment method' },
          { code: 'insufficient_funds', action: 'Suggest customer checks their account balance' },
          { code: 'processing_error', action: 'Retry payment or contact support' },
          { code: 'unknown_error', action: 'Contact technical support for assistance' }
        ];

        errorActions.forEach(({ code, action }) => {
          expect((collector as any).getSuggestedAction(code)).toBe(action);
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockDbConnection.query.mockRejectedValue(new Error('Database connection failed'));

      const paymentIntent = {
        id: 'pi_test_123',
        provider: PaymentProvider.STRIPE,
        amount_cents: 2000,
        currency: 'usd',
        payment_method_id: 'pm_test_123'
      };

      const userContext = {
        userId: 'user_123',
        sessionId: 'session_123'
      };

      // Should not throw error
      await expect(collector.trackPaymentAttempt(paymentIntent, userContext))
        .resolves.toBeUndefined();
    });

    it('should handle analytics collector errors gracefully', async () => {
      mockAnalyticsCollector.track.mockRejectedValue(new Error('Analytics service unavailable'));

      const paymentIntent = {
        id: 'pi_test_123',
        provider: PaymentProvider.STRIPE,
        amount_cents: 2000,
        currency: 'usd',
        payment_method_id: 'pm_test_123'
      };

      const userContext = {
        userId: 'user_123',
        sessionId: 'session_123'
      };

      // Should not throw error
      await expect(collector.trackPaymentAttempt(paymentIntent, userContext))
        .resolves.toBeUndefined();
    });
  });

  describe('Performance and Caching', () => {
    it('should cache metrics for performance', async () => {
      const mockResults = [{ total_attempts: 1000 }];
      mockDbConnection.query.mockResolvedValue(mockResults as unknown as unknown);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // First call
      await collector.getProviderMetrics(PaymentProvider.STRIPE, startDate, endDate);
      
      // Second call within cache period
      await collector.getProviderMetrics(PaymentProvider.STRIPE, startDate, endDate);

      // Should only query database once due to caching
      expect(mockDbConnection.query).toHaveBeenCalledTimes(1);
    });

    it('should emit events for real-time monitoring', async () => {
      const eventSpy = jest.spyOn(collector, 'emit');

      const paymentIntent = {
        id: 'pi_test_123',
        provider: PaymentProvider.STRIPE,
        amount_cents: 2000,
        currency: 'usd',
        payment_method_id: 'pm_test_123'
      };

      const userContext = {
        userId: 'user_123',
        sessionId: 'session_123'
      };

      await collector.trackPaymentAttempt(paymentIntent, userContext);

      expect(eventSpy).toHaveBeenCalledWith('payment_attempt', {
        paymentIntentId: 'pi_test_123',
        provider: PaymentProvider.STRIPE,
        amount: 2000
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields in payment events', async () => {
      const invalidPaymentIntent = {
        id: '', // Invalid: empty ID
        provider: PaymentProvider.STRIPE,
        amount_cents: -100, // Invalid: negative amount
        currency: 'usd',
        payment_method_id: 'pm_test_123'
      };

      const userContext = {
        userId: 'user_123',
        sessionId: 'session_123'
      };

      // Should handle invalid data gracefully
      await expect(collector.trackPaymentAttempt(invalidPaymentIntent, userContext))
        .resolves.toBeUndefined();
    });

    it('should handle missing optional fields', async () => {
      const paymentIntent = {
        id: 'pi_test_123',
        provider: PaymentProvider.STRIPE,
        amount_cents: 2000,
        currency: 'usd',
        payment_method_id: 'pm_test_123'
      };

      const minimalUserContext = {
        userId: 'user_123',
        sessionId: 'session_123'
        // Missing optional fields: ipAddress, userAgent, country
      };

      await expect(collector.trackPaymentAttempt(paymentIntent, minimalUserContext))
        .resolves.toBeUndefined();

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            paymentIntentId: 'pi_test_123',
            provider: PaymentProvider.STRIPE,
            // Optional fields should be undefined
            country: undefined,
            userAgent: undefined
  }
  }
      );
    });
  });
});

// Integration tests
describe('PaymentAnalyticsCollector Integration', () => {
  let collector: PaymentAnalyticsCollector;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockDbConnection: unknown;

  beforeEach(() => {
    mockAnalyticsCollector = new AnalyticsCollector({} as any, {} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown);

    mockDbConnection = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown)
    };

    collector = new PaymentAnalyticsCollector(
      mockAnalyticsCollector,
      mockDbConnection,
      {
        stripeSecretKey: 'sk_test_123'
      }
    );
  });

  it('should handle complete payment flow', async () => {
    const paymentIntent = {
      id: 'pi_test_123',
      provider: PaymentProvider.STRIPE,
      amount_cents: 2000,
      currency: 'usd',
      payment_method_id: 'pm_test_123'
    };

    const userContext = {
      userId: 'user_123',
      sessionId: 'session_123',
      country: 'US'
    };

    // Track payment attempt
    await collector.trackPaymentAttempt(paymentIntent, userContext);

    // Track payment success
    const transaction = {
      id: 'txn_test_123',
      provider: PaymentProvider.STRIPE,
      amount_cents: 2000,
      fee_cents: 60,
      net_amount_cents: 1940,
      risk_score: 25
    };

    await collector.trackPaymentSuccess(transaction, 450, userContext);

    // Verify both events were tracked
    expect(mockAnalyticsCollector.track).toHaveBeenCalledTimes(2);
    expect(mockAnalyticsCollector.track).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        type: PaymentAnalyticsEventType.PAYMENT_ATTEMPT
  }
    );
    expect(mockAnalyticsCollector.track).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        type: PaymentAnalyticsEventType.PAYMENT_SUCCESS
  }
    );

    // Verify database events were stored
    expect(mockDbConnection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO payment_events'),
      expect.any(Array)
    );
  });

  it('should handle payment failure and retry scenario', async () => {
    const paymentIntent = {
      id: 'pi_test_123',
      provider: PaymentProvider.STRIPE,
      amount_cents: 2000,
      currency: 'usd',
      payment_method_id: 'pm_test_123'
    };

    const userContext = {
      userId: 'user_123',
      sessionId: 'session_123'
    };

    // Track initial failure
    await collector.trackPaymentFailure(
      paymentIntent,
      'Card declined',
      'card_declined',
      userContext
    );

    // Track retry attempt
    await collector.trackPaymentAttempt(paymentIntent, userContext);

    // Track retry success
    const transaction = {
      id: 'txn_test_123',
      provider: PaymentProvider.STRIPE,
      amount_cents: 2000,
      fee_cents: 60,
      net_amount_cents: 1940,
      risk_score: 30
    };

    await collector.trackPaymentSuccess(transaction, 380, userContext);

    // Verify all events were tracked
    expect(mockAnalyticsCollector.track).toHaveBeenCalledTimes(3);
    
    const callTypes = mockAnalyticsCollector.track.mock.calls.map(call => call[0].type);
    expect(callTypes).toEqual([
      PaymentAnalyticsEventType.PAYMENT_FAILURE,
      PaymentAnalyticsEventType.PAYMENT_ATTEMPT,
      PaymentAnalyticsEventType.PAYMENT_SUCCESS
    ]);
  });
});