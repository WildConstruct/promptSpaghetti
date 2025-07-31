/**
 * Chargeback Tracking Types - Epic 17 Implementation
 * Task: E17-1753114397355-30EFDE - Implement chargeback tracking
 * 
 * Comprehensive type definitions for chargeback and dispute management
 * integrated with existing transaction system.
 */

import { z } from 'zod';
import { PaymentProvider, TransactionType } from './transaction.types';

// =============================================================================
// Core Chargeback Enums and Types
// =============================================================================

export enum ChargebackStatus {
  INITIATED = 'initiated',
  UNDER_REVIEW = 'under_review',
  EVIDENCE_REQUESTED = 'evidence_requested',
  EVIDENCE_SUBMITTED = 'evidence_submitted',
  DISPUTED = 'disputed',
  ACCEPTED = 'accepted',
  WON = 'won',
  LOST = 'lost',
  CLOSED = 'closed',
  EXPIRED = 'expired'
}

export enum ChargebackReason {
  // Fraud reasons
  FRAUDULENT = 'fraudulent',
  CARD_NOT_PRESENT = 'card_not_present',
  UNAUTHORIZED_USE = 'unauthorized_use',
  
  // Authorization reasons
  AUTHORIZATION_REQUIRED = 'authorization_required',
  INVALID_AUTHORIZATION = 'invalid_authorization',
  EXPIRED_AUTHORIZATION = 'expired_authorization',
  
  // Processing reasons
  DUPLICATE_PROCESSING = 'duplicate_processing',
  INVALID_CARD_NUMBER = 'invalid_card_number',
  PROCESSING_ERROR = 'processing_error',
  
  // Consumer dispute reasons
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  PRODUCT_UNACCEPTABLE = 'product_unacceptable',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  CREDIT_NOT_PROCESSED = 'credit_not_processed',
  CANCELLED_RECURRING = 'cancelled_recurring',
  
  // General reasons
  GENERAL = 'general',
  UNRECOGNIZED = 'unrecognized',
  OTHER = 'other'
}

export enum ChargebackType {
  CHARGEBACK = 'chargeback',
  PRE_ARBITRATION = 'pre_arbitration', 
  ARBITRATION = 'arbitration',
  RETRIEVAL_REQUEST = 'retrieval_request',
  INQUIRY = 'inquiry'
}

export enum EvidenceType {
  RECEIPT = 'receipt',
  SHIPPING_DOCUMENTATION = 'shipping_documentation',
  CUSTOMER_COMMUNICATION = 'customer_communication',
  REFUND_POLICY = 'refund_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  BILLING_AGREEMENT = 'billing_agreement',
  DUPLICATE_CHARGE_DOCUMENTATION = 'duplicate_charge_documentation',
  PRODUCT_DESCRIPTION = 'product_description',
  DELIVERY_CONFIRMATION = 'delivery_confirmation',
  CANCELLATION_POLICY = 'cancellation_policy',
  CUSTOMER_SIGNATURE = 'customer_signature',
  UNCATEGORIZED_FILE = 'uncategorized_file',
  UNCATEGORIZED_TEXT = 'uncategorized_text'
}

export enum ChargebackOutcome {
  WON = 'won',
  LOST = 'lost',
  ACCEPTED = 'accepted',
  WARNING_CLOSED = 'warning_closed'
}

export enum DisputePhase {
  CHARGEBACK = 'chargeback',
  PRE_ARBITRATION = 'pre_arbitration',
  ARBITRATION = 'arbitration'
}

// =============================================================================
// Core Chargeback Interfaces
// =============================================================================

/**
 * Main chargeback tracking interface
 */
}
}
export interface Chargeback {
  readonly id: string;
  
  // Related entities
  transaction_id: string;
  order_id: string;
  payment_intent_id: string;
  user_id: string; // The merchant/user who received the chargeback
  
  // Provider information
  provider: PaymentProvider;
  provider_chargeback_id: string;
  provider_dispute_id?: string;
  
  // Chargeback details
  type: ChargebackType;
  status: ChargebackStatus;
  reason: ChargebackReason;
  reason_description?: string;
  
  // Financial information
  amount_cents: number;
  fee_cents: number; // Chargeback fee
  currency: string;
  
  // Timeline information
  initiated_at: Date;
  due_date?: Date; // Evidence submission deadline
  closed_at?: Date;
  
  // Evidence and documentation
  evidence: ChargebackEvidence[];
  evidence_submitted: boolean;
  evidence_due_by?: Date;
  evidence_submission_count: number;
  
  // Outcome information
  outcome?: ChargebackOutcome;
  outcome_reason?: string;
  liability_shift: boolean;
  
  // Risk and prevention data
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  fraud_score?: number;
  prevention_score?: number;
  
  // Workflow and automation
  auto_response_enabled: boolean;
  requires_manual_review: boolean;
  escalation_level: number;
  
  // Communication and notes
  customer_message?: string;
  internal_notes?: string;
  communication_history: ChargebackCommunication[];
  
  // Metadata and tracking
  metadata: Record<string, any>;
  tags: string[];
  
  // Audit trail
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_updated_by: string;
}
}
}

/**
 * Evidence submitted for chargeback disputes
 */
}
}
export interface ChargebackEvidence {
  readonly id: string;
  chargeback_id: string;
  
  // Evidence details
  type: EvidenceType;
  title: string;
  description?: string;
  
  // Evidence content
  text_content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  
  // Metadata
  source: 'manual' | 'automated' | 'system_generated';
  auto_generated: boolean;
  relevance_score?: number; // AI-generated relevance score
  
  // Status and validation
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  validation_errors?: string[];
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
  created_by: string;
}
}
}

/**
 * Communication history for chargebacks
 */
}
}
export interface ChargebackCommunication {
  readonly id: string;
  chargeback_id: string;
  
  // Communication details
  type: 'email' | 'phone' | 'chat' | 'internal_note' | 'system_message';
  direction: 'inbound' | 'outbound' | 'internal';
  subject?: string;
  content: string;
  
  // Participants
  from_user_id?: string;
  to_user_id?: string;
  from_email?: string;
  to_email?: string;
  
  // Status and metadata
  status: 'sent' | 'delivered' | 'read' | 'failed';
  importance: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  
  // Attachments
  attachments: CommunicationAttachment[];
  
  // Timestamps
  created_at: Date;
  read_at?: Date;
  created_by: string;
}
}
}

}
}
export interface CommunicationAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  content_type: string;
}
}
}

/**
 * Chargeback analytics and metrics
 */
}
}
export interface ChargebackAnalytics {
  period_start: Date;
  period_end: Date;
  
  // Overall metrics
  total_chargebacks: number;
  total_chargeback_amount_cents: number;
  total_fees_cents: number;
  chargeback_rate: number; // As percentage of total transactions
  
  // Win/Loss metrics
  won_count: number;
  lost_count: number;
  accepted_count: number;
  win_rate: number; // Percentage
  
  // Response metrics
  evidence_submission_rate: number; // Percentage
  average_response_time_hours: number;
  auto_response_rate: number; // Percentage
  
  // Reason breakdown
  reason_breakdown: Array<{
    reason: ChargebackReason;
    count: number;
    amount_cents: number;
    win_rate: number;
}
}
  }>;
  
  // Provider breakdown
  provider_breakdown: Array<{
    provider: PaymentProvider;
    count: number;
    amount_cents: number;
    win_rate: number;
  }>;
  
  // Risk analysis
  risk_distribution: Array<{
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    amount_cents: number;
  }>;
  
  // Trends
  monthly_trends: Array<{
    month: string;
    chargeback_count: number;
    chargeback_rate: number;
    win_rate: number;
  }>;
}

/**
 * Chargeback prevention and alerts
 */
}
}
export interface ChargebackAlert {
  readonly id: string;
  
  // Alert details
  type: 'prevention' | 'threshold' | 'pattern' | 'high_risk' | 'deadline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  
  // Related entities
  transaction_id?: string;
  user_id?: string;
  pattern_id?: string;
  
  // Alert data
  trigger_data: Record<string, any>;
  threshold_value?: number;
  current_value?: number;
  
  // Status and handling
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved_by?: string;
  resolved_at?: Date;
  
  // Actions and recommendations
  recommended_actions: string[];
  auto_actions_taken: string[];
  
  // Metadata
  created_at: Date;
  expires_at?: Date;
}
}
}

/**
 * Chargeback prevention rules
 */
}
}
export interface ChargebackPreventionRule {
  readonly id: string;
  
  // Rule configuration
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  // Trigger conditions
  conditions: PreventionRuleCondition[];
  
  // Actions to take
  actions: PreventionRuleAction[];
  
  // Effectiveness tracking
  triggered_count: number;
  prevented_chargebacks: number;
  false_positive_rate: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_triggered_at?: Date;
}
}
}

}
}
export interface PreventionRuleCondition {
  field: string; // e.g., 'risk_score', 'transaction_amount', 'user_chargeback_history'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
  value: any;
  weight: number;
}
}
}

}
}
export interface PreventionRuleAction {
  type: 'block_transaction' | 'require_verification' | 'manual_review' | 'send_alert' | 'delay_fulfillment';
  parameters: Record<string, any>;
  auto_execute: boolean;
}
}
}

// =============================================================================
// Chargeback Templates and Automation
// =============================================================================

/**
 * Pre-built response templates for different chargeback reasons
 */
}
}
export interface ChargebackResponseTemplate {
  readonly id: string;
  
  // Template details
  name: string;
  description: string;
  reason: ChargebackReason;
  type: ChargebackType;
  
  // Template content
  response_text: string;
  required_evidence: EvidenceType[];
  optional_evidence: EvidenceType[];
  
  // Automation
  auto_generate_evidence: boolean;
  auto_submit: boolean;
  
  // Effectiveness metrics
  usage_count: number;
  success_rate: number;
  last_updated: Date;
  
  // Metadata
  created_at: Date;
  created_by: string;
  tags: string[];
}
}
}

/**
 * Automated evidence collection
 */
}
}
export interface EvidenceCollector {
  readonly id: string;
  
  // Collector configuration
  name: string;
  description: string;
  evidence_type: EvidenceType;
  enabled: boolean;
  
  // Collection logic
  data_source: 'database' | 'api' | 'file_system' | 'external_service';
  collection_query: string;
  format_template: string;
  
  // Validation and quality
  validation_rules: string[];
  quality_threshold: number;
  
  // Usage tracking
  collections_count: number;
  success_rate: number;
  average_quality_score: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  last_run_at?: Date;
}
}
}

// =============================================================================
// Validation Schemas
// =============================================================================

export const CreateChargebackSchema = z.object({
  transaction_id: z.string().uuid(),
  provider_chargeback_id: z.string().min(1),
  type: z.nativeEnum(ChargebackType),
  reason: z.nativeEnum(ChargebackReason),
  amount_cents: z.number().int().positive(),
  fee_cents: z.number().int().min(0).default(0),
  currency: z.string().length(3),
  initiated_at: z.date(),
  due_date: z.date().optional(),
  customer_message: z.string().max(1000).optional(),
  metadata: z.record(z.any()).default({})
});

export const UpdateChargebackStatusSchema = z.object({
  status: z.nativeEnum(ChargebackStatus),
  outcome: z.nativeEnum(ChargebackOutcome).optional(),
  outcome_reason: z.string().max(500).optional(),
  internal_notes: z.string().max(2000).optional()
});

export const SubmitEvidenceSchema = z.object({
  chargeback_id: z.string().uuid(),
  evidence: z.array(z.object({
    type: z.nativeEnum(EvidenceType),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    text_content: z.string().max(10000).optional(),
    file_url: z.string().url().optional()
  })).min(1)
});

export const CreatePreventionRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(1).max(100).default(50),
  conditions: z.array(z.object({
    field: z.string().min(1),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'between']),
    value: z.any(),
    weight: z.number().min(0).max(1).default(1)
  })).min(1),
  actions: z.array(z.object({
    type: z.enum(['block_transaction', 'require_verification', 'manual_review', 'send_alert', 'delay_fulfillment']),
    parameters: z.record(z.any()).default({}),
    auto_execute: z.boolean().default(false)
  })).min(1)
});

export const CreateResponseTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  reason: z.nativeEnum(ChargebackReason),
  type: z.nativeEnum(ChargebackType),
  response_text: z.string().min(1).max(5000),
  required_evidence: z.array(z.nativeEnum(EvidenceType)),
  optional_evidence: z.array(z.nativeEnum(EvidenceType)).default([]),
  auto_generate_evidence: z.boolean().default(false),
  auto_submit: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

// =============================================================================
// Service Response Types
// =============================================================================

}
}
export interface ChargebackServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    request_id: string;
    timestamp: Date;
    execution_time_ms: number;
  };
}

}
}
export interface ChargebackSearchCriteria {
  user_id?: string;
  transaction_id?: string;
  order_id?: string;
  status?: ChargebackStatus[];
  reason?: ChargebackReason[];
  provider?: PaymentProvider[];
  type?: ChargebackType[];
  amount_min_cents?: number;
  amount_max_cents?: number;
  initiated_after?: Date;
  initiated_before?: Date;
  due_date_after?: Date;
  due_date_before?: Date;
  evidence_submitted?: boolean;
  outcome?: ChargebackOutcome[];
  risk_level?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
  sort_by?: 'initiated_at' | 'due_date' | 'amount_cents' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}
}
}

}
}
export interface ChargebackSearchResult {
  chargebacks: Chargeback[];
  total_count: number;
  has_more: boolean;
  aggregates: {
    total_amount_cents: number;
    total_fees_cents: number;
    status_distribution: Record<ChargebackStatus, number>;
    reason_distribution: Record<ChargebackReason, number>;
}
}
  };
}

}
}
export interface ChargebackBulkAction {
  action: 'update_status' | 'submit_evidence' | 'add_notes' | 'add_tags' | 'assign_reviewer';
  chargeback_ids: string[];
  parameters: Record<string, any>;
}
}
}

}
}
export interface ChargebackBulkResult {
  total_processed: number;
  successful: number;
  failed: number;
  results: Array<{
    chargeback_id: string;
    success: boolean;
    error?: string;
}
}
  }>;
}

// =============================================================================
// Webhook and Integration Types
// =============================================================================

}
}
export interface ChargebackWebhookPayload {
  event_type: 'chargeback.created' | 'chargeback.updated' | 'chargeback.evidence_required' | 'chargeback.closed';
  chargeback: Chargeback;
  previous_state?: Partial<Chargeback>;
  metadata: {
    webhook_id: string;
    timestamp: Date;
    provider: PaymentProvider;
    retry_count: number;
}
}
  };
}

}
}
export interface ProviderChargebackData {
  provider: PaymentProvider;
  provider_id: string;
  raw_data: Record<string, any>;
  mapped_data: Partial<Chargeback>;
  mapping_version: string;
}
}
}

// =============================================================================
// Export all types
// =============================================================================

export type {
  Chargeback,
  ChargebackEvidence,
  ChargebackCommunication,
  ChargebackAnalytics,
  ChargebackAlert,
  ChargebackPreventionRule,
  ChargebackResponseTemplate,
  EvidenceCollector,
  ChargebackServiceResponse,
  ChargebackSearchCriteria,
  ChargebackSearchResult,
  ChargebackBulkAction,
  ChargebackBulkResult,
  ChargebackWebhookPayload,
  ProviderChargebackData,
  CommunicationAttachment,
  PreventionRuleCondition,
  PreventionRuleAction
};

export {
  ChargebackStatus,
  ChargebackReason,
  ChargebackType,
  EvidenceType,
  ChargebackOutcome,
  DisputePhase,
  CreateChargebackSchema,
  UpdateChargebackStatusSchema,
  SubmitEvidenceSchema,
  CreatePreventionRuleSchema,
  CreateResponseTemplateSchema
};