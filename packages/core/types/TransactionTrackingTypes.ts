/**
 * Transaction Tracking Types - E17-1753114397345-58AA8D
 * 
 * Extended transaction tracking types for Epic 17 - Backstage Admin Controls.
 * Provides comprehensive transaction monitoring capabilities for marketplace administrators.
 */

import { TimeRange } from '../marketplace/analytics.types';

// Base transaction status and types (extending existing)
export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'disputed'
  | 'refunded'
  | 'canceled'
  | 'expired';

export type TransactionType = 
  | 'purchase'
  | 'refund'
  | 'partial_refund'
  | 'subscription'
  | 'subscription_renewal'
  | 'chargeback'
  | 'fee_adjustment';

export type PaymentProvider = 
  | 'stripe'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer';

export type PaymentMethodType = 
  | 'card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'crypto'
  | 'ach'
  | 'wire';

// Enhanced Transaction interface for admin tracking
export interface TrackedTransaction {
  id: string;
  externalId: string; // Provider transaction ID
  parentTransactionId?: string; // For refunds/chargebacks
  
  // Basic transaction info
  type: TransactionType;
  status: TransactionStatus;
  amount: TransactionAmount;
  currency: string;
  
  // Parties involved
  buyer: TransactionParty;
  seller: TransactionParty;
  template?: TransactionTemplate;
  
  // Payment details
  paymentMethod: PaymentMethodDetails;
  provider: PaymentProviderDetails;
  
  // Risk and fraud
  riskAssessment: TransactionRiskAssessment;
  fraudFlags: FraudFlag[];
  
  // Timing and lifecycle
  timestamps: TransactionTimestamps;
  lifecycle: TransactionLifecycleEvent[];
  
  // Admin tracking
  adminNotes: AdminNote[];
  flags: AdminFlag[];
  monitoring: MonitoringMetrics;
  
  // Metadata
  metadata: Record<string, any>;
  tags: string[];
}

export interface TransactionAmount {
  gross: number; // Total transaction amount
  fees: number; // Platform fees
  net: number; // Amount after fees
  tax: number; // Tax amount
  discount: number; // Discounts applied
  refundable: number; // Amount available for refund
  refunded: number; // Amount already refunded
}

export interface TransactionParty {
  id: string;
  type: 'user' | 'creator' | 'admin' | 'system';
  displayName: string;
  email?: string;
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending';
  trustScore?: number;
  totalTransactions?: number;
  lifetimeValue?: number;
}

export interface TransactionTemplate {
  id: string;
  title: string;
  category: string;
  price: number;
  version: string;
  creatorId: string;
  creatorName: string;
}

export interface PaymentMethodDetails {
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  country?: string;
  fingerprint?: string;
  isDefault?: boolean;
}

export interface PaymentProviderDetails {
  provider: PaymentProvider;
  providerTransactionId: string;
  providerFees: number;
  processingTime: number; // milliseconds
  webhookReceived: boolean;
  webhookTimestamp?: Date;
}

export interface TransactionRiskAssessment {
  score: number; // 0-100, higher = more risky
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  mlPrediction?: MLRiskPrediction;
  manualReview?: boolean;
}

export interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
  category: 'behavioral' | 'payment' | 'geographical' | 'temporal' | 'historical';
}

export interface MLRiskPrediction {
  model: string;
  version: string;
  confidence: number;
  features: Record<string, number>;
  explanation: string[];
}

export interface FraudFlag {
  type: 'velocity' | 'location' | 'payment_method' | 'behavior' | 'ml_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface TransactionTimestamps {
  initiated: Date;
  authorized?: Date;
  captured?: Date;
  settled?: Date;
  completed?: Date;
  disputed?: Date;
  refunded?: Date;
  expired?: Date;
  lastUpdated: Date;
}

export interface TransactionLifecycleEvent {
  id: string;
  type: 'created' | 'authorized' | 'captured' | 'failed' | 'disputed' | 'refunded' | 'note_added';
  status?: TransactionStatus;
  description: string;
  metadata: Record<string, any>;
  triggeredBy: string; // User ID or 'system'
  timestamp: Date;
}

export interface AdminNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  category: 'general' | 'risk' | 'fraud' | 'dispute' | 'refund' | 'investigation';
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AdminFlag {
  type: 'review_required' | 'high_risk' | 'fraud_suspected' | 'dispute_likely' | 'manual_approval';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  flaggedBy: string;
  flaggedAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface MonitoringMetrics {
  processingTime: number;
  webhookDelay?: number;
  retryCount: number;
  lastRetryAt?: Date;
  errorCount: number;
  lastErrorAt?: Date;
  lastErrorMessage?: string;
}

// Transaction Search and Filtering
export interface TransactionSearchQuery {
  // Basic filters
  status?: TransactionStatus[];
  type?: TransactionType[];
  provider?: PaymentProvider[];
  
  // Amount filters
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  
  // Date filters
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Party filters
  buyerId?: string;
  sellerId?: string;
  templateId?: string;
  
  // Risk and fraud filters
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  hasFraudFlags?: boolean;
  requiresReview?: boolean;
  
  // Text search
  search?: string; // Search in transaction ID, buyer/seller names, template titles
  
  // Admin filters
  hasAdminNotes?: boolean;
  hasFlags?: boolean;
  flagType?: string[];
  
  // Pagination and sorting
  page?: number;
  pageSize?: number;
  sortBy?: TransactionSortField;
  sortOrder?: 'asc' | 'desc';
}

export type TransactionSortField = 
  | 'created_at'
  | 'amount'
  | 'risk_score'
  | 'status'
  | 'buyer_name'
  | 'seller_name'
  | 'template_title'
  | 'processing_time';

export interface TransactionSearchResults {
  transactions: TrackedTransaction[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  aggregations: TransactionAggregations;
  filters: AppliedFilters;
}

export interface TransactionAggregations {
  totalAmount: number;
  averageAmount: number;
  statusBreakdown: Record<TransactionStatus, number>;
  typeBreakdown: Record<TransactionType, number>;
  riskLevelBreakdown: Record<string, number>;
  topTemplates: Array<{ templateId: string; title: string; count: number; revenue: number }>;
  topSellers: Array<{ sellerId: string; name: string; count: number; revenue: number }>;
  dailyVolume: Array<{ date: string; count: number; amount: number }>;
}

export interface AppliedFilters {
  count: number;
  filters: Array<{
    field: string;
    operator: string;
    value: any;
    displayName: string;
  }>;
}

// Real-time Transaction Monitoring
export interface TransactionMonitoringConfig {
  enabled: boolean;
  thresholds: MonitoringThresholds;
  alertChannels: AlertChannel[];
  updateInterval: number; // seconds
  bufferSize: number; // number of transactions to keep in memory
}

export interface MonitoringThresholds {
  highVolumeAlert: number; // transactions per minute
  largeTransactionAlert: number; // amount threshold
  failureRateAlert: number; // percentage
  averageProcessingTimeAlert: number; // milliseconds
  suspiciousPatternAlert: {
    velocityThreshold: number;
    locationAnomalyThreshold: number;
    newPaymentMethodThreshold: number;
  };
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  conditions: string[];
  throttleMinutes: number;
}

export interface RealTimeTransactionUpdate {
  type: 'transaction_created' | 'transaction_updated' | 'transaction_completed' | 'alert_triggered';
  transaction?: TrackedTransaction;
  alert?: TransactionAlert;
  timestamp: Date;
}

export interface TransactionAlert {
  id: string;
  type: 'volume' | 'amount' | 'failure_rate' | 'processing_time' | 'fraud_pattern';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  affectedTransactions: string[];
  triggeredAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

// Transaction Export and Reporting
export interface TransactionExportRequest {
  format: 'csv' | 'json' | 'excel';
  query: TransactionSearchQuery;
  fields?: string[];
  includeNotes?: boolean;
  includeLifecycle?: boolean;
}

export interface TransactionReport {
  id: string;
  title: string;
  description: string;
  period: ReportPeriod;
  metrics: TransactionReportMetrics;
  charts: TransactionChart[];
  insights: TransactionInsight[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportPeriod {
  start: Date;
  end: Date;
  timeRange: TimeRange;
  comparisonPeriod?: ReportPeriod;
}

export interface TransactionReportMetrics {
  totalTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  successRate: number;
  failureRate: number;
  refundRate: number;
  averageProcessingTime: number;
  fraudDetectionRate: number;
  highRiskTransactions: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  topPerformingTemplates: number;
}

export interface TransactionChart {
  type: 'line' | 'bar' | 'pie' | 'heatmap';
  title: string;
  description: string;
  data: ChartDataPoint[];
  xAxis: string;
  yAxis: string;
  color?: string;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TransactionInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'performance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, any>;
  recommendedActions: string[];
  relatedTransactions?: string[];
}

// Transaction Analytics
export interface TransactionAnalytics {
  period: ReportPeriod;
  overview: TransactionOverview;
  performance: TransactionPerformance;
  riskAnalysis: TransactionRiskAnalysis;
  patterns: TransactionPatterns;
  forecasting: TransactionForecast;
  recommendations: TransactionRecommendation[];
}

export interface TransactionOverview {
  totalTransactions: number;
  totalRevenue: number;
  netRevenue: number;
  averageTransactionValue: number;
  medianTransactionValue: number;
  largestTransaction: number;
  smallestTransaction: number;
  growthRate: number;
}

export interface TransactionPerformance {
  successRate: number;
  failureRate: number;
  disputeRate: number;
  refundRate: number;
  averageProcessingTime: number;
  p95ProcessingTime: number;
  providerPerformance: Record<PaymentProvider, ProviderPerformance>;
}

export interface ProviderPerformance {
  transactionCount: number;
  successRate: number;
  averageProcessingTime: number;
  averageFee: number;
  reliability: number;
}

export interface TransactionRiskAnalysis {
  overallRiskScore: number;
  riskDistribution: Record<string, number>;
  fraudDetectionRate: number;
  falsePositiveRate: number;
  topRiskFactors: RiskFactorAnalysis[];
  riskTrends: RiskTrend[];
}

export interface RiskFactorAnalysis {
  factor: string;
  prevalence: number;
  averageImpact: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface RiskTrend {
  period: string;
  riskScore: number;
  transactionCount: number;
  flaggedCount: number;
}

export interface TransactionPatterns {
  temporalPatterns: TemporalPattern[];
  geographicPatterns: GeographicPattern[];
  behavioralPatterns: BehavioralPattern[];
  paymentPatterns: PaymentPattern[];
}

export interface TemporalPattern {
  pattern: string;
  description: string;
  strength: number;
  timeframes: string[];
  impact: string;
}

export interface GeographicPattern {
  region: string;
  transactionCount: number;
  averageValue: number;
  riskLevel: string;
  trends: string[];
}

export interface BehavioralPattern {
  behavior: string;
  frequency: number;
  associatedRisk: number;
  description: string;
}

export interface PaymentPattern {
  method: PaymentMethodType;
  usage: number;
  successRate: number;
  averageAmount: number;
  trends: string[];
}

export interface TransactionForecast {
  period: string;
  predictedVolume: number;
  predictedRevenue: number;
  confidence: number;
  factors: ForecastFactor[];
  scenarios: ForecastScenario[];
}

export interface ForecastFactor {
  factor: string;
  impact: number;
  confidence: number;
  description: string;
}

export interface ForecastScenario {
  name: string;
  probability: number;
  volume: number;
  revenue: number;
  description: string;
}

export interface TransactionRecommendation {
  category: 'optimization' | 'risk_reduction' | 'fraud_prevention' | 'user_experience';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeframe: string;
    requirements: string[];
  };
  metrics: string[];
}

// Configuration and Settings
export interface TransactionTrackingConfig {
  realTimeMonitoring: boolean;
  dataRetentionDays: number;
  exportLimits: {
    maxRecords: number;
    maxFileSize: number; // MB
    allowedFormats: string[];
  };
  alertSettings: {
    enabled: boolean;
    channels: AlertChannel[];
    thresholds: MonitoringThresholds;
  };
  riskSettings: {
    enableMLDetection: boolean;
    manualReviewThreshold: number;
    autoFlagThreshold: number;
  };
  integrations: {
    stripe: boolean;
    paypal: boolean;
    analytics: boolean;
    crm: boolean;
  };
}

export };