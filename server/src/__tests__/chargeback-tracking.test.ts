/**
 * Chargeback Tracking System Tests - Epic 17 Implementation
 * Task: E17-1753114397355-30EFDE - Implement chargeback tracking
 * 
 * Comprehensive test suite for chargeback management, dispute tracking,
 * evidence collection, and analytics functionality.
 */

import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import Fastify, { FastifyInstance } from 'fastify';
import { ChargebackService } from '../marketplace/chargeback.service.js';
import {
  Chargeback,
  ChargebackStatus,
  ChargebackReason,
  ChargebackType,
  EvidenceType,
  ChargebackOutcome
} from '../marketplace/chargeback.types.js';
import { PaymentProvider } from '../marketplace/transaction.types.js';

describe('Chargeback Tracking System', () => {
  let fastify: FastifyInstance;
  let chargebackService: ChargebackService;
  let mockDb: unknown;

  beforeAll(async () => {
    // Setup test Fastify instance
    fastify = Fastify({ logger: false });
    
    // Mock database service
    mockDb = {
      query: jest.fn<unknown[], unknown>()
    };
    
    // Add mock database to fastify instance
    fastify.decorate('db', mockDb);
    
    // Initialize chargeback service
    chargebackService = new ChargebackService(fastify);
    
    // Mock Stripe
    jest.mock('stripe');
    
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================================================
  // Chargeback Creation Tests
  // =============================================================================

  describe('Chargeback Creation', () => {
    test('should create chargeback successfully with valid data', async () => {
      // Mock database responses
      mockDb.query
        .mockResolvedValueOnce([{ // getTransactionById
          id: 'txn-123',
          payment_intent_id: 'pi-123',
          user_id: 'user-123',
          provider: PaymentProvider.STRIPE
        }])
        .mockResolvedValueOnce([]) // getChargebackByProviderIds (no existing)
        .mockResolvedValueOnce([{ // getOrderByTransactionId
          id: 'order-123'
        }])
        .mockResolvedValueOnce({}); // insert chargeback

      const chargebackData = {
        transaction_id: 'txn-123',
        provider_chargeback_id: 'ch_dispute_123',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 10000,
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date(),
        metadata: { test: true }
      };

      const result = await chargebackService.createChargeback(chargebackData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBeDefined();
      expect(result.data?.status).toBe(ChargebackStatus.INITIATED);
      expect(result.data?.risk_level).toBeDefined();
    });

    test('should reject chargeback creation for non-existent transaction', async () => {
      mockDb.query.mockResolvedValueOnce([]); // getTransactionById returns empty

      const chargebackData = {
        transaction_id: 'non-existent-txn',
        provider_chargeback_id: 'ch_dispute_123',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 10000,
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date()
      };

      const result = await chargebackService.createChargeback(chargebackData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TRANSACTION_NOT_FOUND');
    });

    test('should reject duplicate chargeback creation', async () => {
      mockDb.query
        .mockResolvedValueOnce([{ // getTransactionById
          id: 'txn-123',
          payment_intent_id: 'pi-123',
          user_id: 'user-123',
          provider: PaymentProvider.STRIPE
        }])
        .mockResolvedValueOnce([{ // getChargebackByProviderIds (existing found)
          id: 'existing-chargeback'
        }]);

      const chargebackData = {
        transaction_id: 'txn-123',
        provider_chargeback_id: 'ch_dispute_123',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 10000,
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date()
      };

      const result = await chargebackService.createChargeback(chargebackData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DUPLICATE_CHARGEBACK');
    });
  });

  // =============================================================================
  // Risk Assessment Tests
  // =============================================================================

  describe('Risk Assessment', () => {
    test('should calculate high risk for large fraudulent chargeback', async () => {
      mockDb.query
        .mockResolvedValueOnce([{ // getTransactionById
          id: 'txn-123',
          payment_intent_id: 'pi-123',
          user_id: 'user-123',
          provider: PaymentProvider.STRIPE
        }])
        .mockResolvedValueOnce([]) // no existing chargeback
        .mockResolvedValueOnce([{ id: 'order-123' }]) // order
        .mockResolvedValueOnce({}); // insert

      const chargebackData = {
        transaction_id: 'txn-123',
        provider_chargeback_id: 'ch_dispute_high_risk',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 150000, // $1,500 - high value
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date()
      };

      const result = await chargebackService.createChargeback(chargebackData);

      expect(result.success).toBe(true);
      expect(result.data?.risk_level).toBe('critical');
    });

    test('should calculate low risk for small legitimate dispute', async () => {
      mockDb.query
        .mockResolvedValueOnce([{
          id: 'txn-123',
          payment_intent_id: 'pi-123',
          user_id: 'user-123',
          provider: PaymentProvider.STRIPE
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 'order-123' }])
        .mockResolvedValueOnce({});

      const chargebackData = {
        transaction_id: 'txn-123',
        provider_chargeback_id: 'ch_dispute_low_risk',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.PRODUCT_UNACCEPTABLE,
        amount_cents: 5000, // $50 - low value
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date()
      };

      const result = await chargebackService.createChargeback(chargebackData);

      expect(result.success).toBe(true);
      expect(result.data?.risk_level).toBe('low');
    });
  });

  // =============================================================================
  // Status Management Tests
  // =============================================================================

  describe('Status Management', () => {
    test('should update chargeback status with valid transition', async () => {
      const existingChargeback: Chargeback = {
        id: 'cb-123',
        transaction_id: 'txn-123',
        order_id: 'order-123',
        payment_intent_id: 'pi-123',
        user_id: 'user-123',
        provider: PaymentProvider.STRIPE,
        provider_chargeback_id: 'ch_dispute_123',
        type: ChargebackType.CHARGEBACK,
        status: ChargebackStatus.INITIATED,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 10000,
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date(),
        evidence: [],
        evidence_submitted: false,
        evidence_submission_count: 0,
        liability_shift: false,
        risk_level: 'medium',
        auto_response_enabled: false,
        requires_manual_review: true,
        escalation_level: 1,
        communication_history: [],
        metadata: {},
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'system',
        last_updated_by: 'system'
      };

      mockDb.query
        .mockResolvedValueOnce([existingChargeback]) // getChargeback
        .mockResolvedValueOnce({}) // update status
        .mockResolvedValueOnce([{
          ...existingChargeback,
          status: ChargebackStatus.UNDER_REVIEW
        }]); // get updated chargeback

      const statusUpdate = {
        status: ChargebackStatus.UNDER_REVIEW,
        internal_notes: 'Moving to review'
      };

      const result = await chargebackService.updateChargebackStatus('cb-123', statusUpdate);

      expect(result.success).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE chargebacks SET status = ?'),
        expect.arrayContaining([ChargebackStatus.UNDER_REVIEW])
      );
    });

    test('should reject invalid status transition', async () => {
      const closedChargeback = {
        id: 'cb-closed',
        status: ChargebackStatus.CLOSED
        // ... other required fields
      };

      mockDb.query.mockResolvedValueOnce([closedChargeback]);

      const statusUpdate = {
        status: ChargebackStatus.INITIATED
      };

      const result = await chargebackService.updateChargebackStatus('cb-closed', statusUpdate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_STATUS_TRANSITION');
    });
  });

  // =============================================================================
  // Evidence Management Tests
  // =============================================================================

  describe('Evidence Management', () => {
    test('should submit evidence successfully', async () => {
      const chargeback: Chargeback = {
        id: 'cb-123',
        status: ChargebackStatus.EVIDENCE_REQUESTED,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        // ... other required fields (simplified for test)
      } as Chargeback;

      mockDb.query
        .mockResolvedValueOnce([chargeback]) // getChargeback
        .mockResolvedValueOnce({}) // insert evidence 1
        .mockResolvedValueOnce({}) // insert evidence 2
        .mockResolvedValueOnce({}); // update chargeback status

      const evidenceData = {
        chargeback_id: 'cb-123',
        evidence: [
          {
            type: EvidenceType.RECEIPT,
            title: 'Transaction Receipt',
            text_content: 'Receipt details...'
          },
          {
            type: EvidenceType.CUSTOMER_COMMUNICATION,
            title: 'Email Thread',
            text_content: 'Customer communication history...'
          }
        ]
      };

      const result = await chargebackService.submitEvidence(evidenceData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].type).toBe(EvidenceType.RECEIPT);
      expect(result.data?.[1].type).toBe(EvidenceType.CUSTOMER_COMMUNICATION);
    });

    test('should reject evidence submission for closed chargeback', async () => {
      const closedChargeback = {
        id: 'cb-closed',
        status: ChargebackStatus.CLOSED
        // ... other fields
      } as Chargeback;

      mockDb.query.mockResolvedValueOnce([closedChargeback]);

      const evidenceData = {
        chargeback_id: 'cb-closed',
        evidence: [{
          type: EvidenceType.RECEIPT,
          title: 'Late Receipt',
          text_content: 'Receipt details...'
        }]
      };

      const result = await chargebackService.submitEvidence(evidenceData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EVIDENCE_SUBMISSION_NOT_ALLOWED');
    });

    test('should generate automatic evidence', async () => {
      const chargeback = {
        id: 'cb-123',
        transaction_id: 'txn-123'
        // ... other fields
      } as Chargeback;

      mockDb.query.mockResolvedValueOnce([chargeback]);

      const result = await chargebackService.generateEvidenceAutomatically('cb-123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Auto-generated evidence would be empty in this mock scenario
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // =============================================================================
  // Search and Analytics Tests
  // =============================================================================

  describe('Search and Analytics', () => {
    test('should search chargebacks with criteria', async () => {
      const mockChargebacks = [
        { id: 'cb-1', user_id: 'user-123', status: 'initiated' },
        { id: 'cb-2', user_id: 'user-123', status: 'disputed' }
      ];

      mockDb.query.mockResolvedValueOnce(mockChargebacks);

      const criteria = {
        user_id: 'user-123',
        status: [ChargebackStatus.INITIATED, ChargebackStatus.DISPUTED],
        limit: 10,
        offset: 0
      };

      const result = await chargebackService.searchChargebacks(criteria);

      expect(result.success).toBe(true);
      expect(result.data?.chargebacks).toBeDefined();
      expect(result.data?.total_count).toBeDefined();
      expect(result.data?.aggregates).toBeDefined();
    });

    test('should generate analytics for time period', async () => {
      const periodStart = new Date('2024-01-01');
      const periodEnd = new Date('2024-01-31');

      const result = await chargebackService.getChargebackAnalytics(periodStart, periodEnd);

      expect(result.success).toBe(true);
      expect(result.data?.period_start).toEqual(periodStart);
      expect(result.data?.period_end).toEqual(periodEnd);
      expect(result.data?.total_chargebacks).toBeDefined();
      expect(result.data?.reason_breakdown).toBeDefined();
      expect(result.data?.provider_breakdown).toBeDefined();
    });
  });

  // =============================================================================
  // Prevention Rules Tests
  // =============================================================================

  describe('Prevention Rules', () => {
    test('should create prevention rule successfully', async () => {
      mockDb.query.mockResolvedValueOnce({});

      const ruleData = {
        name: 'High Value Transaction Check',
        description: 'Flag transactions over $1000',
        enabled: true,
        priority: 80,
        conditions: [{
          field: 'transaction_amount',
          operator: 'greater_than',
          value: 100000, // $1000 in cents
          weight: 1.0
        }],
        actions: [{
          type: 'manual_review',
          parameters: { reason: 'High value transaction' },
          auto_execute: true
        }]
      };

      const result = await chargebackService.createPreventionRule(ruleData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.name).toBe(ruleData.name);
      expect(result.data?.enabled).toBe(true);
    });
  });

  // =============================================================================
  // Response Templates Tests
  // =============================================================================

  describe('Response Templates', () => {
    test('should create response template successfully', async () => {
      mockDb.query.mockResolvedValueOnce({});

      const templateData = {
        name: 'Fraud Response Template',
        description: 'Standard response for fraudulent chargebacks',
        reason: ChargebackReason.FRAUDULENT,
        type: ChargebackType.CHARGEBACK,
        response_text: 'This transaction was legitimate...',
        required_evidence: [EvidenceType.RECEIPT, EvidenceType.CUSTOMER_COMMUNICATION],
        optional_evidence: [EvidenceType.DELIVERY_CONFIRMATION],
        auto_generate_evidence: true,
        auto_submit: false,
        tags: ['fraud', 'standard']
      };

      const result = await chargebackService.createResponseTemplate(templateData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.name).toBe(templateData.name);
      expect(result.data?.required_evidence).toEqual(templateData.required_evidence);
    });
  });

  // =============================================================================
  // Edge Cases and Error Handling
  // =============================================================================

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const chargebackData = {
        transaction_id: 'txn-123',
        provider_chargeback_id: 'ch_dispute_123',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 10000,
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date()
      };

      const result = await chargebackService.createChargeback(chargebackData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CREATION_FAILED');
      expect(result.error?.message).toContain('Database connection failed');
    });

    test('should handle invalid data gracefully', async () => {
      const invalidData = {
        // missing required fields
        provider_chargeback_id: 'ch_dispute_123'
      };

      const result = await chargebackService.createChargeback(invalidData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CREATION_FAILED');
    });
  });

  // =============================================================================
  // Integration Tests
  // =============================================================================

  describe('Integration Scenarios', () => {
    test('should handle complete chargeback lifecycle', async () => {
      // 1. Create chargeback
      mockDb.query
        .mockResolvedValueOnce([{ // transaction
          id: 'txn-123',
          payment_intent_id: 'pi-123',
          user_id: 'user-123',
          provider: PaymentProvider.STRIPE
        }])
        .mockResolvedValueOnce([]) // no existing
        .mockResolvedValueOnce([{ id: 'order-123' }]) // order
        .mockResolvedValueOnce({}); // insert

      const createResult = await chargebackService.createChargeback({
        transaction_id: 'txn-123',
        provider_chargeback_id: 'ch_dispute_lifecycle',
        type: ChargebackType.CHARGEBACK,
        reason: ChargebackReason.FRAUDULENT,
        amount_cents: 10000,
        fee_cents: 1500,
        currency: 'usd',
        initiated_at: new Date()
      });

      expect(createResult.success).toBe(true);
      const chargebackId = createResult.data!.id;

      // 2. Update to evidence requested
      mockDb.query
        .mockResolvedValueOnce([{
          ...createResult.data,
          status: ChargebackStatus.INITIATED
        }])
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce([{
          ...createResult.data,
          status: ChargebackStatus.EVIDENCE_REQUESTED
        }]);

      const statusResult = await chargebackService.updateChargebackStatus(chargebackId, {
        status: ChargebackStatus.EVIDENCE_REQUESTED
      });

      expect(statusResult.success).toBe(true);

      // 3. Submit evidence
      mockDb.query
        .mockResolvedValueOnce([{
          ...createResult.data,
          status: ChargebackStatus.EVIDENCE_REQUESTED,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }])
        .mockResolvedValueOnce({}) // insert evidence
        .mockResolvedValueOnce({}); // update chargeback

      const evidenceResult = await chargebackService.submitEvidence({
        chargeback_id: chargebackId,
        evidence: [{
          type: EvidenceType.RECEIPT,
          title: 'Transaction Receipt',
          text_content: 'Receipt details...'
        }]
      });

      expect(evidenceResult.success).toBe(true);

      // 4. Final resolution
      mockDb.query
        .mockResolvedValueOnce([{
          ...createResult.data,
          status: ChargebackStatus.EVIDENCE_SUBMITTED
        }])
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce([{
          ...createResult.data,
          status: ChargebackStatus.WON,
          outcome: ChargebackOutcome.WON
        }]);

      const finalResult = await chargebackService.updateChargebackStatus(chargebackId, {
        status: ChargebackStatus.WON,
        outcome: ChargebackOutcome.WON
      });

      expect(finalResult.success).toBe(true);
    });
  });

  // =============================================================================
  // Performance Tests
  // =============================================================================

  describe('Performance', () => {
    test('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      // Mock multiple database operations
      for (let i = 0; i < 100; i++) {
        mockDb.query.mockResolvedValueOnce({});
      }

      // Simulate bulk status updates
      const bulkResults = [];
      for (let i = 0; i < 10; i++) {
        mockDb.query.mockResolvedValueOnce([{
          id: `cb-${i}`,
          status: ChargebackStatus.INITIATED
        }]);
        mockDb.query.mockResolvedValueOnce({});
        mockDb.query.mockResolvedValueOnce([{
          id: `cb-${i}`,
          status: ChargebackStatus.UNDER_REVIEW
        }]);

        const result = await chargebackService.updateChargebackStatus(`cb-${i}`, {
          status: ChargebackStatus.UNDER_REVIEW
        });
        bulkResults.push(result);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(bulkResults).toHaveLength(10);
      expect(bulkResults.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Helper function to create mock chargeback data
 */
function createMockChargeback(overrides: Partial<Chargeback> = {}): Chargeback {
  return {
    id: 'cb-test-123',
    transaction_id: 'txn-123',
    order_id: 'order-123',
    payment_intent_id: 'pi-123',
    user_id: 'user-123',
    provider: PaymentProvider.STRIPE,
    provider_chargeback_id: 'ch_dispute_123',
    type: ChargebackType.CHARGEBACK,
    status: ChargebackStatus.INITIATED,
    reason: ChargebackReason.FRAUDULENT,
    amount_cents: 10000,
    fee_cents: 1500,
    currency: 'usd',
    initiated_at: new Date(),
    evidence: [],
    evidence_submitted: false,
    evidence_submission_count: 0,
    liability_shift: false,
    risk_level: 'medium',
    auto_response_enabled: false,
    requires_manual_review: true,
    escalation_level: 1,
    communication_history: [],
    metadata: {},
    tags: [],
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'system',
    last_updated_by: 'system',
    ...overrides
  };
}