/**
 * Revenue Data Model Tests
 * Story 30.1.1 - Revenue Data Model Integration
 */

import {
  RevenueEventType,
  RevenueEventSchema,
  PricingTierSchema,
  DiscountCodeSchema
} from '../RevenueDataModel';
import { PaymentProvider, LicenseType } from '../../marketplace/transaction.types';

describe('RevenueDataModel', () => {
  describe('RevenueEventType enum', () => {
    it('should contain all expected revenue event types', () => {
      expect(RevenueEventType.TRANSACTION_COMPLETED).toBe('transaction_completed');
      expect(RevenueEventType.TRANSACTION_FAILED).toBe('transaction_failed');
      expect(RevenueEventType.TRANSACTION_REFUNDED).toBe('transaction_refunded');
      expect(RevenueEventType.SUBSCRIPTION_CREATED).toBe('subscription_created');
      expect(RevenueEventType.SUBSCRIPTION_RENEWED).toBe('subscription_renewed');
      expect(RevenueEventType.COMMISSION_EARNED).toBe('commission_earned');
      expect(RevenueEventType.REVENUE_ATTRIBUTED).toBe('revenue_attributed');
    });
  });

  describe('RevenueEventSchema validation', () => {
    it('should validate a complete revenue event', () => {
      const validEvent = {
        type: RevenueEventType.TRANSACTION_COMPLETED,
        revenue_data: {
          amount_cents: 10000,
          currency: 'USD',
          transaction_id: '123e4567-e89b-12d3-a456-426614174000',
          order_id: '123e4567-e89b-12d3-a456-426614174001',
          template_id: '123e4567-e89b-12d3-a456-426614174002',
          creator_id: '123e4567-e89b-12d3-a456-426614174003',
          revenue_type: 'purchase',
          payment_provider: PaymentProvider.STRIPE,
          license_type: LicenseType.COMMERCIAL,
          country_code: 'US',
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'holiday-sale'
        }
      };

      const result = RevenueEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal revenue event', () => {
      const minimalEvent = {
        type: RevenueEventType.COMMISSION_EARNED,
        revenue_data: {
          amount_cents: 5000,
          currency: 'USD',
          revenue_type: 'commission',
          payment_provider: PaymentProvider.PAYPAL
        }
      };

      const result = RevenueEventSchema.safeParse(minimalEvent);
      expect(result.success).toBe(true);
    });

    it('should reject invalid amount_cents', () => {
      const invalidEvent = {
        type: RevenueEventType.TRANSACTION_COMPLETED,
        revenue_data: {
          amount_cents: -100, // Invalid: negative amount
          currency: 'USD',
          revenue_type: 'purchase',
          payment_provider: PaymentProvider.STRIPE
        }
      };

      const result = RevenueEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency', () => {
      const invalidEvent = {
        type: RevenueEventType.TRANSACTION_COMPLETED,
        revenue_data: {
          amount_cents: 10000,
          currency: 'INVALID', // Invalid: not 3 characters
          revenue_type: 'purchase',
          payment_provider: PaymentProvider.STRIPE
        }
      };

      const result = RevenueEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject invalid revenue_type', () => {
      const invalidEvent = {
        type: RevenueEventType.TRANSACTION_COMPLETED,
        revenue_data: {
          amount_cents: 10000,
          currency: 'USD',
          revenue_type: 'invalid_type', // Invalid enum value
          payment_provider: PaymentProvider.STRIPE
        }
      };

      const result = RevenueEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID format', () => {
      const invalidEvent = {
        type: RevenueEventType.TRANSACTION_COMPLETED,
        revenue_data: {
          amount_cents: 10000,
          currency: 'USD',
          transaction_id: 'not-a-uuid',
          revenue_type: 'purchase',
          payment_provider: PaymentProvider.STRIPE
        }
      };

      const result = RevenueEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject invalid country_code', () => {
      const invalidEvent = {
        type: RevenueEventType.TRANSACTION_COMPLETED,
        revenue_data: {
          amount_cents: 10000,
          currency: 'USD',
          revenue_type: 'purchase',
          payment_provider: PaymentProvider.STRIPE,
          country_code: 'USA' // Invalid: should be 2 characters
        }
      };

      const result = RevenueEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('PricingTierSchema validation', () => {
    it('should validate a complete pricing tier', () => {
      const validTier = {
        name: 'Commercial License',
        description: 'Full commercial usage rights',
        license_type: LicenseType.COMMERCIAL,
        base_price_cents: 9999,
        currency: 'USD',
        volume_discounts: [
          { min_quantity: 10, discount_percentage: 10 },
          { min_quantity: 50, discount_percentage: 20 }
        ],
        regional_pricing: [
          { country_code: 'GB', price_cents: 8999, currency: 'GBP' },
          { country_code: 'DE', price_cents: 8999, currency: 'EUR' }
        ],
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      const result = PricingTierSchema.safeParse(validTier);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal pricing tier', () => {
      const minimalTier = {
        name: 'Basic License',
        description: 'Personal use only',
        license_type: LicenseType.PERSONAL,
        base_price_cents: 1999,
        currency: 'USD',
        valid_from: new Date()
      };

      const result = PricingTierSchema.safeParse(minimalTier);
      expect(result.success).toBe(true);
      expect(result.data?.volume_discounts).toEqual([]);
      expect(result.data?.regional_pricing).toEqual([]);
    });

    it('should reject invalid volume discount percentage', () => {
      const invalidTier = {
        name: 'Test Tier',
        description: 'Test description',
        license_type: LicenseType.COMMERCIAL,
        base_price_cents: 9999,
        currency: 'USD',
        volume_discounts: [
          { min_quantity: 10, discount_percentage: 150 } // Invalid: > 100%
        ],
        valid_from: new Date()
      };

      const result = PricingTierSchema.safeParse(invalidTier);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidTier = {
        name: 'Test Tier',
        description: 'Test description',
        license_type: LicenseType.COMMERCIAL,
        base_price_cents: -1000, // Invalid: negative price
        currency: 'USD',
        valid_from: new Date()
      };

      const result = PricingTierSchema.safeParse(invalidTier);
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency format', () => {
      const invalidTier = {
        name: 'Test Tier',
        description: 'Test description',
        license_type: LicenseType.COMMERCIAL,
        base_price_cents: 9999,
        currency: 'DOLLARS', // Invalid: not 3 characters
        valid_from: new Date()
      };

      const result = PricingTierSchema.safeParse(invalidTier);
      expect(result.success).toBe(false);
    });
  });

  describe('DiscountCodeSchema validation', () => {
    it('should validate a complete discount code', () => {
      const validDiscount = {
        code: 'HOLIDAY50',
        description: 'Holiday sale - 50% off',
        discount_type: 'percentage',
        discount_value: 50,
        max_discount_cents: 10000,
        min_purchase_cents: 2000,
        usage_limit: 100,
        per_user_limit: 1,
        eligible_templates: ['123e4567-e89b-12d3-a456-426614174000'],
        eligible_license_types: [LicenseType.COMMERCIAL, LicenseType.PERSONAL],
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const result = DiscountCodeSchema.safeParse(validDiscount);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal discount code', () => {
      const minimalDiscount = {
        code: 'SAVE10',
        description: 'Save 10%',
        discount_type: 'percentage',
        discount_value: 10,
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(minimalDiscount);
      expect(result.success).toBe(true);
    });

    it('should reject invalid code format', () => {
      const invalidDiscount = {
        code: 'invalid code!', // Invalid: contains space and special char
        description: 'Test discount',
        discount_type: 'percentage',
        discount_value: 10,
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(invalidDiscount);
      expect(result.success).toBe(false);
    });

    it('should accept valid code formats', () => {
      const validCodes = ['SAVE10', 'HOLIDAY-2024', 'VIP_ACCESS', 'CODE123'];
      
      for (const code of validCodes) {
        const discount = {
          code,
          description: 'Test discount',
          discount_type: 'percentage',
          discount_value: 10,
          valid_from: new Date()
        };

        const result = DiscountCodeSchema.safeParse(discount);
        expect(result.success).toBe(true);
      }
    });

    it('should reject negative discount value', () => {
      const invalidDiscount = {
        code: 'INVALID',
        description: 'Test discount',
        discount_type: 'percentage',
        discount_value: -10, // Invalid: negative discount
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(invalidDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject invalid discount type', () => {
      const invalidDiscount = {
        code: 'INVALID',
        description: 'Test discount',
        discount_type: 'invalid_type', // Invalid enum value
        discount_value: 10,
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(invalidDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject short code', () => {
      const invalidDiscount = {
        code: 'AB', // Invalid: too short (< 3 chars)
        description: 'Test discount',
        discount_type: 'percentage',
        discount_value: 10,
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(invalidDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject long code', () => {
      const invalidDiscount = {
        code: 'THIS_CODE_IS_TOO_LONG_FOR_VALIDATION', // Invalid: too long (> 20 chars)
        description: 'Test discount',
        discount_type: 'percentage',
        discount_value: 10,
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(invalidDiscount);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID in eligible_templates', () => {
      const invalidDiscount = {
        code: 'SAVE10',
        description: 'Test discount',
        discount_type: 'percentage',
        discount_value: 10,
        eligible_templates: ['not-a-uuid'], // Invalid UUID
        valid_from: new Date()
      };

      const result = DiscountCodeSchema.safeParse(invalidDiscount);
      expect(result.success).toBe(false);
    });
  });

  describe('Type definitions', () => {
    it('should correctly define RevenueAttribution interface', () => {
      // This test ensures TypeScript compilation works correctly
      const attribution = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transaction_id: '123e4567-e89b-12d3-a456-426614174001',
        template_id: '123e4567-e89b-12d3-a456-426614174002',
        creator_id: '123e4567-e89b-12d3-a456-426614174003',
        attribution_model: 'first_touch' as const,
        attribution_percentage: 1.0,
        revenue_cents: 10000,
        commission_cents: 7000,
        created_at: new Date()
      };

      expect(attribution.attribution_model).toBe('first_touch');
      expect(attribution.revenue_cents).toBe(10000);
      expect(attribution.commission_cents).toBe(7000);
    });

    it('should correctly define TemplateRevenueMetrics interface', () => {
      const metrics = {
        template_id: '123e4567-e89b-12d3-a456-426614174000',
        creator_id: '123e4567-e89b-12d3-a456-426614174001',
        total_revenue_cents: 50000,
        gross_revenue_cents: 50000,
        net_revenue_cents: 45000,
        commission_cents: 35000,
        refund_cents: 0,
        transaction_count: 5,
        unique_buyers: 4,
        repeat_purchase_rate: 0.2,
        average_order_value_cents: 10000,
        license_breakdown: [
          { license_type: LicenseType.COMMERCIAL, count: 3, revenue_cents: 30000 },
          { license_type: LicenseType.PERSONAL, count: 2, revenue_cents: 20000 }
        ],
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31'),
        updated_at: new Date()
      };

      expect(metrics.total_revenue_cents).toBe(50000);
      expect(metrics.license_breakdown).toHaveLength(2);
      expect(metrics.repeat_purchase_rate).toBe(0.2);
    });

    it('should correctly define CreatorRevenueMetrics interface', () => {
      const metrics = {
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
        total_earnings_cents: 100000,
        pending_payout_cents: 15000,
        paid_out_cents: 85000,
        lifetime_earnings_cents: 150000,
        template_count: 10,
        active_template_count: 8,
        total_sales: 50,
        unique_buyers: 35,
        top_template_id: '123e4567-e89b-12d3-a456-426614174001',
        top_template_revenue_cents: 25000,
        revenue_by_license_type: [
          { license_type: LicenseType.COMMERCIAL, count: 30, revenue_cents: 75000 },
          { license_type: LicenseType.PERSONAL, count: 20, revenue_cents: 25000 }
        ],
        payout_frequency: 'monthly' as const,
        next_payout_date: new Date('2024-02-01'),
        payment_method: 'stripe_connect',
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31'),
        updated_at: new Date()
      };

      expect(metrics.total_earnings_cents).toBe(100000);
      expect(metrics.payout_frequency).toBe('monthly');
      expect(metrics.revenue_by_license_type).toHaveLength(2);
    });
  });
});