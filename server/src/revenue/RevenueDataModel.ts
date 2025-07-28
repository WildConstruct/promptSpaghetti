/**
 * Revenue Analytics Data Model
 * Story 30.1.1 - Revenue Data Model Integration
 * 
 * Integrates Epic 1 (Analytics Foundation) with Epic 16 (Marketplace System)
 * for comprehensive revenue tracking and analytics
 */

import { z } from 'zod';
import { 
  Transaction, 
  TransactionType, 
  PaymentProvider, 
  LicenseType,
  Order,
  OrderItem 
} from '../marketplace/transaction.types';
import { AnalyticsEvent, AnalyticsEventType } from '../analytics/AnalyticsCollector';

// Revenue Event Types extending Epic 1 analytics
export enum RevenueEventType {
  // Transaction Events
  TRANSACTION_COMPLETED = 'transaction_completed',
  TRANSACTION_FAILED = 'transaction_failed',
  TRANSACTION_REFUNDED = 'transaction_refunded',
  TRANSACTION_DISPUTED = 'transaction_disputed',
  
  // Subscription Events
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED = 'subscription_downgraded',
  
  // Commission Events
  COMMISSION_EARNED = 'commission_earned',
  COMMISSION_PAID = 'commission_paid',
  COMMISSION_DISPUTED = 'commission_disputed',
  
  // Attribution Events
  REVENUE_ATTRIBUTED = 'revenue_attributed',
  CREATOR_PAYOUT_PROCESSED = 'creator_payout_processed'
}

// Revenue Attribution Models
}
export interface RevenueAttribution {
  id: string;
  transaction_id: string;
  template_id: string;
  creator_id: string;
  affiliate_id?: string;
  campaign_id?: string;
  attribution_model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay';
  attribution_percentage: number;
  revenue_cents: number;
  commission_cents: number;
  created_at: Date;
}
}

// Template Revenue Performance
}
export interface TemplateRevenueMetrics {
  template_id: string;
  version_id?: string;
  creator_id: string;
  
  // Revenue Metrics
  total_revenue_cents: number;
  gross_revenue_cents: number;
  net_revenue_cents: number;
  commission_cents: number;
  refund_cents: number;
  
  // Transaction Metrics
  transaction_count: number;
  unique_buyers: number;
  repeat_purchase_rate: number;
  average_order_value_cents: number;
  
  // License Type Breakdown
  license_breakdown: Array<{
    license_type: LicenseType;
    count: number;
    revenue_cents: number;
}
  }>;
  
  // Time-based Metrics
  first_sale_at?: Date;
  last_sale_at?: Date;
  period_start: Date;
  period_end: Date;
  
  updated_at: Date;
}

// Creator Revenue Analytics
}
export interface CreatorRevenueMetrics {
  creator_id: string;
  
  // Revenue Summary
  total_earnings_cents: number;
  pending_payout_cents: number;
  paid_out_cents: number;
  lifetime_earnings_cents: number;
  
  // Performance Metrics
  template_count: number;
  active_template_count: number;
  total_sales: number;
  unique_buyers: number;
  
  // Revenue Distribution
  top_template_id: string;
  top_template_revenue_cents: number;
  revenue_by_license_type: Array<{
    license_type: LicenseType;
    count: number;
    revenue_cents: number;
}
  }>;
  
  // Payout Information
  payout_frequency: 'weekly' | 'monthly' | 'quarterly';
  next_payout_date: Date;
  payment_method: string;
  
  period_start: Date;
  period_end: Date;
  updated_at: Date;
}

// Revenue Event extending Epic 1 AnalyticsEvent
}
export interface RevenueEvent extends AnalyticsEvent {
  type: RevenueEventType;
  revenue_data: {
    // Core Revenue Data
    amount_cents: number;
    currency: string;
    transaction_id?: string;
    order_id?: string;
    
    // Attribution Data
    template_id?: string;
    creator_id?: string;
    affiliate_id?: string;
    campaign_id?: string;
    
    // Classification Data
    revenue_type: 'purchase' | 'subscription' | 'commission' | 'refund';
    payment_provider: PaymentProvider;
    license_type?: LicenseType;
    
    // Geography and Demographics
    country_code?: string;
    state_code?: string;
    city?: string;
    timezone?: string;
    
    // Additional Context
    user_agent?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

// Pricing Tier and Discount Tracking
}
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  license_type: LicenseType;
  base_price_cents: number;
  currency: string;
  
  // Volume Discounts
  volume_discounts: Array<{
    min_quantity: number;
    discount_percentage: number;
}
  }>;
  
  // Geographic Pricing
  regional_pricing: Array<{
    country_code: string;
    price_cents: number;
    currency: string;
  }>;
  
  // Temporal Settings
  valid_from: Date;
  valid_until?: Date;
  is_active: boolean;
  
  created_at: Date;
  updated_at: Date;
}

// Discount and Promotion Tracking
}
export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  
  // Discount Configuration
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  discount_value: number;
  max_discount_cents?: number;
  min_purchase_cents?: number;
  
  // Usage Limits
  usage_limit?: number;
  usage_count: number;
  per_user_limit?: number;
  
  // Targeting
  eligible_templates?: string[];
  eligible_license_types?: LicenseType[];
  eligible_user_groups?: string[];
  
  // Temporal Settings
  valid_from: Date;
  valid_until?: Date;
  is_active: boolean;
  
  created_at: Date;
  updated_at: Date;
}
}

// Revenue Aggregation for Real-time Analytics
}
export interface RevenueAggregation {
  id: string;
  aggregation_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  period_start: Date;
  period_end: Date;
  
  // Aggregate Metrics
  total_revenue_cents: number;
  transaction_count: number;
  unique_buyers: number;
  new_customer_count: number;
  returning_customer_count: number;
  
  // Payment Method Breakdown
  payment_method_breakdown: Array<{
    provider: PaymentProvider;
    revenue_cents: number;
    transaction_count: number;
    success_rate: number;
}
  }>;
  
  // Geographic Breakdown
  geographic_breakdown: Array<{
    country_code: string;
    revenue_cents: number;
    transaction_count: number;
  }>;
  
  // Template Performance
  top_templates: Array<{
    template_id: string;
    revenue_cents: number;
    transaction_count: number;
  }>;
  
  // Creator Performance
  top_creators: Array<{
    creator_id: string;
    revenue_cents: number;
    template_count: number;
  }>;
  
  created_at: Date;
  updated_at: Date;
}

// Revenue Forecast Data
}
export interface RevenueForecast {
  id: string;
  forecast_type: 'template' | 'creator' | 'global';
  target_id?: string; // template_id or creator_id for specific forecasts
  
  // Forecast Configuration
  forecast_horizon_days: number;
  confidence_level: number;
  model_type: 'linear_regression' | 'seasonal_arima' | 'prophet';
  
  // Historical Data Used
  historical_start_date: Date;
  historical_end_date: Date;
  data_points_used: number;
  
  // Forecast Results
  forecasted_revenue_cents: number;
  upper_bound_cents: number;
  lower_bound_cents: number;
  
  // Daily Breakdown
  daily_forecast: Array<{
    date: Date;
    predicted_revenue_cents: number;
    confidence_interval_upper: number;
    confidence_interval_lower: number;
}
  }>;
  
  // Model Performance
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  r_squared: number;
  
  generated_at: Date;
  valid_until: Date;
}

// Validation Schemas
export const RevenueEventSchema = z.object({
  type: z.nativeEnum(RevenueEventType),
  revenue_data: z.object({
    amount_cents: z.number().int().min(0),
    currency: z.string().length(3),
    transaction_id: z.string().uuid().optional(),
    order_id: z.string().uuid().optional(),
    template_id: z.string().uuid().optional(),
    creator_id: z.string().uuid().optional(),
    revenue_type: z.enum(['purchase', 'subscription', 'commission', 'refund']),
    payment_provider: z.nativeEnum(PaymentProvider),
    license_type: z.nativeEnum(LicenseType).optional(),
    country_code: z.string().length(2).optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional()
  }
});

export const PricingTierSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  license_type: z.nativeEnum(LicenseType),
  base_price_cents: z.number().int().min(0),
  currency: z.string().length(3),
  volume_discounts: z.array(z.object({
    min_quantity: z.number().int().min(1),
    discount_percentage: z.number().min(0).max(100)
  })).default([]),
  regional_pricing: z.array(z.object({
    country_code: z.string().length(2),
    price_cents: z.number().int().min(0),
    currency: z.string().length(3)
  })).default([]),
  valid_from: z.date(),
  valid_until: z.date().optional()
});

export const DiscountCodeSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9_-]+$/),
  description: z.string().min(1),
  discount_type: z.enum(['percentage', 'fixed_amount', 'buy_x_get_y']),
  discount_value: z.number().min(0),
  max_discount_cents: z.number().int().min(0).optional(),
  min_purchase_cents: z.number().int().min(0).optional(),
  usage_limit: z.number().int().min(1).optional(),
  per_user_limit: z.number().int().min(1).optional(),
  eligible_templates: z.array(z.string().uuid()).optional(),
  eligible_license_types: z.array(z.nativeEnum(LicenseType)).optional(),
  valid_from: z.date(),
  valid_until: z.date().optional()
});

// Export types and schemas
export type {
  RevenueAttribution,
  TemplateRevenueMetrics,
  CreatorRevenueMetrics,
  RevenueEvent,
  PricingTier,
  DiscountCode,
  RevenueAggregation,
  RevenueForecast
};

export {
  RevenueEventType,
  RevenueEventSchema,
  PricingTierSchema,
  DiscountCodeSchema
};