// Epic 16.1.5 - Transaction System Types
import { z } from 'zod';

// Enhanced transaction-specific enums
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

export enum PaymentMethodType {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTO = 'crypto'
}

export enum TransactionType {
  PURCHASE = 'purchase',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  SUBSCRIPTION = 'subscription',
  SUBSCRIPTION_RENEWAL = 'subscription_renewal'
}

export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  DISPUTED = 'disputed',
  EXPIRED = 'expired'
}

export enum LicenseType {
  PERSONAL = 'personal',
  COMMERCIAL = 'commercial',
  ENTERPRISE = 'enterprise',
  EDUCATIONAL = 'educational',
  UNLIMITED = 'unlimited'
}

export enum LicenseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  TRANSFERRED = 'transferred'
}

// Shopping Cart interfaces
export interface CartItem {
  id: string;
  template_id: string;
  version_id?: string;
  license_type: LicenseType;
  quantity: number;
  unit_price_cents: number;
  discount_cents?: number;
  added_at: Date;
}

export interface ShoppingCart {
  id: string;
  user_id: string;
  items: CartItem[];
  discount_codes: string[];
  total_cents: number;
  tax_cents: number;
  shipping_cents: number;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

// Payment Processing interfaces
export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  type: PaymentMethodType;
  last_four: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface PaymentIntent {
  id: string;
  cart_id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  provider: PaymentProvider;
  provider_intent_id: string;
  payment_method_id: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret?: string;
  last_payment_error?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Enhanced Transaction interface
export interface Transaction {
  id: string;
  payment_intent_id: string;
  cart_id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount_cents: number;
  fee_cents: number;
  net_amount_cents: number;
  currency: string;
  provider: PaymentProvider;
  provider_transaction_id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'disputed' | 'refunded';
  escrow_status: EscrowStatus;
  escrow_release_date?: Date;
  risk_score: number;
  fraud_flags: string[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// License Management interfaces
export interface TemplateLicense {
  id: string;
  purchase_id: string;
  template_id: string;
  version_id: string;
  buyer_id: string;
  license_type: LicenseType;
  license_key: string;
  status: LicenseStatus;
  usage_limit?: number;
  usage_count: number;
  valid_from: Date;
  valid_until?: Date;
  transfer_count: number;
  max_transfers: number;
  restrictions: Record<string, any>;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  last_used_at?: Date;
}

export interface LicenseTransfer {
  id: string;
  license_id: string;
  from_user_id: string;
  to_user_id: string;
  reason: string;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
}

// Order and Receipt interfaces
export interface Order {
  id: string;
  user_id: string;
  cart_id: string;
  payment_intent_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  items: OrderItem[];
  subtotal_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  billing_address: BillingAddress;
  invoice_pdf_url?: string;
  fulfillment_status: 'pending' | 'processing' | 'fulfilled' | 'failed';
  notes?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  template_id: string;
  version_id: string;
  license_type: LicenseType;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  license_id?: string;
  fulfillment_status: 'pending' | 'fulfilled' | 'failed';
  metadata: Record<string, any>;
}

export interface BillingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  tax_id?: string;
}

// Refund interfaces
export interface RefundRequest {
  id: string;
  purchase_id: string;
  order_id: string;
  user_id: string;
  reason: string;
  amount_cents: number;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: Date;
  created_at: Date;
}

export interface Refund {
  id: string;
  refund_request_id: string;
  transaction_id: string;
  amount_cents: number;
  provider_refund_id: string;
  status: 'pending' | 'succeeded' | 'failed';
  failure_reason?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Fraud and Risk Management
export interface RiskAssessment {
  id: string;
  payment_intent_id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  risk_score: number;
  risk_factors: string[];
  geo_location: Record<string, any>;
  device_fingerprint?: string;
  velocity_checks: Record<string, any>;
  recommendation: 'approve' | 'review' | 'decline';
  automated_decision: boolean;
  created_at: Date;
}

// Tax interfaces
export interface TaxCalculation {
  id: string;
  cart_id: string;
  user_id: string;
  billing_address: BillingAddress;
  subtotal_cents: number;
  tax_cents: number;
  tax_rate: number;
  tax_jurisdiction: string;
  tax_breakdown: Array<{
    type: string;
    rate: number;
    amount_cents: number;
  }>;
  calculated_at: Date;
}

// Validation Schemas
export const CartItemSchema = z.object({
  template_id: z.string().uuid(),
  version_id: z.string().uuid().optional(),
  license_type: z.nativeEnum(LicenseType),
  quantity: z.number().int().min(1).default(1)
});

export const AddToCartSchema = z.object({
  items: z.array(CartItemSchema).min(1)
});

export const UpdateCartSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.number().int().min(0), // 0 to remove
  license_type: z.nativeEnum(LicenseType).optional()
});

export const CreatePaymentIntentSchema = z.object({
  cart_id: z.string().uuid(),
  payment_method_id: z.string(),
  save_payment_method: z.boolean().default(false),
  billing_address: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postal_code: z.string().min(1),
    country: z.string().min(2).max(2),
    tax_id: z.string().optional()
  })
});

export const ProcessPaymentSchema = z.object({
  payment_intent_id: z.string().uuid(),
  confirmation_token: z.string().optional()
});

export const CreateRefundRequestSchema = z.object({
  purchase_id: z.string().uuid(),
  reason: z.string().min(10).max(1000),
  amount_cents: z.number().int().min(1).optional() // For partial refunds
});

export const LicenseTransferSchema = z.object({
  license_id: z.string().uuid(),
  to_user_email: z.string().email(),
  reason: z.string().min(10).max(500)
});

// Analytics interfaces for transactions
export interface TransactionAnalytics {
  period_start: Date;
  period_end: Date;
  metrics: {
    total_revenue_cents: number;
    total_transactions: number;
    average_order_value_cents: number;
    conversion_rate: number;
    refund_rate: number;
    dispute_rate: number;
    fraud_rate: number;
  };
  payment_methods: Array<{
    provider: PaymentProvider;
    type: PaymentMethodType;
    count: number;
    revenue_cents: number;
  }>;
  geography: Array<{
    country: string;
    revenue_cents: number;
    transactions: number;
  }>;
  trends: {
    daily_revenue: Array<{ date: string; revenue_cents: number }>;
    daily_transactions: Array<{ date: string; count: number }>;
  };
}

export type {
  CartItem,
  ShoppingCart,
  PaymentMethod,
  PaymentIntent,
  Transaction,
  TemplateLicense,
  LicenseTransfer,
  Order,
  OrderItem,
  BillingAddress,
  RefundRequest,
  Refund,
  RiskAssessment,
  TaxCalculation,
  TransactionAnalytics
};

export {
  PaymentProvider,
  PaymentMethodType,
  TransactionType,
  EscrowStatus,
  LicenseType,
  LicenseStatus,
  CartItemSchema,
  AddToCartSchema,
  UpdateCartSchema,
  CreatePaymentIntentSchema,
  ProcessPaymentSchema,
  CreateRefundRequestSchema,
  LicenseTransferSchema
};