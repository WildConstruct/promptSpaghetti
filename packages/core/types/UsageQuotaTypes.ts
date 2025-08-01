/**
 * Usage Quota System Types - Epic 17
 * 
 * Comprehensive type definitions for usage quota management system as part of 
 * Epic 17 Backstage Admin Controls. Provides quota tracking, enforcement, and 
 * administrative oversight for resource usage across the platform.
 * 
 * Task: E17-1753114397228-B591AA - Create usage quotas
 * Epic: 17 - Backstage Admin Controls
 */

import { ActionSeverity } from './EnforcementTypes';

// =============================================================================
// Core Usage Quota Types
// =============================================================================


export interface UsageQuota { quotaId: string;
  quotaName: string;
  quotaType: QuotaType;
  resourceIdentifier: string;
  // Quota limits
  limitValue: number;
  limitPeriod: TimePeriod;
  limitUnit: UsageUnit;
  // Scope and applicability
  appliesTo: QuotaScope;
  // Quota behavior
  enforcementAction: EnforcementAction;
  resetBehavior: ResetBehavior;
  gracePeriodMinutes: number;
  // Advanced settings
  burstAllowance?: number; // Allow temporary bursts above limit;
  rolloverPercentage?: number; // Percentage of unused quota to rollover;
  hardLimit: boolean; // Whether this is a hard technical limit vs soft business limit;
  // Status and metadata
  enabled: boolean;
  priority: number; // For handling multiple quotas on same resource }
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  // Configuration options
  configuration: QuotaConfiguration;
  // Metadata
  metadata: QuotaMetadata;


export type QuotaType = 
  // API Usage Quotas
  | 'api_requests'
  | 'api_requests_per_endpoint'
  | 'data_processing_tokens'
  | 'preview_generations'
  | 'graph_executions'
  | 'export_operations'
  | 'template_access'
  
  // Resource Consumption Quotas  
  | 'storage_usage'
  | 'processing_time'
  | 'bandwidth_usage'
  | 'concurrent_sessions'
  | 'file_downloads'
  
  // Feature-Specific Quotas
  | 'advanced_nodes'
  | 'collaboration_workspaces'
  | 'template_library_access'
  | 'admin_panel_access'
  | 'custom_integrations'
  
  // Business Logic Quotas
  | 'marketplace_listings'
  | 'content_uploads'
  | 'user_invitations'
  | 'workspace_members';

export type TimePeriod = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'rolling';

export type UsageUnit = 
  | 'requests' 
  | 'bytes' 
  | 'megabytes' 
  | 'tokens' 
  | 'executions' 
  | 'minutes' 
  | 'hours' 
  | 'sessions' 
  | 'operations'
  | 'items'
  | 'users';


export interface QuotaScope { type: ScopeType;
  value?: string; // user ID, org ID, tier name, or null for global }
  conditions?: ScopeCondition;


export type ScopeType = 'user' | 'organization' | 'tier' | 'role' | 'global' | 'conditional';


export interface ScopeCondition { field: string; // e.g., 'user.subscription_tier', 'organization.plan';
  operator: 'equals' | 'in' | 'greater_than' | 'less_than' | 'contains' }
  value: any;
  required: boolean;


export type EnforcementAction = 
  | 'warn' // Send warning but allow
  | 'throttle' // Reduce rate/priority
  | 'soft_block' // Block with override option
  | 'hard_block' // Strict blocking
  | 'review' // Queue for manual review
  | 'degrade' // Provide degraded service
  | 'redirect' // Redirect to alternative resource
  | 'upgrade_prompt'; // Prompt user to upgrade plan

export type ResetBehavior = 'automatic' | 'manual' | 'rolling' | 'cascade';


export interface QuotaConfiguration { // Enforcement settings
  warningThresholds: number; // Percentages at which to send warnings (e.g., [75, 90, 95]);
  emergencyMultiplier: number; // Emergency quota multiplier during incidents }
  // Integration settings
  integrateWithRateLimit: boolean;
  integrateWithFraudDetection: boolean;
  integrateWithBilling: boolean;
  // Monitoring settings
  trackingEnabled: boolean;
  analyticsEnabled: boolean;
  alertsEnabled: boolean;
  // Performance settings
  cachingEnabled: boolean;
  batchProcessing: boolean;
  asyncEnforcement: boolean;




export interface QuotaMetadata { description: string;
  category: QuotaCategory;
  businessJustification: string;
  technicalConstraints: string;
  relatedQuotas: string; // IDs of related quotas;
  // Performance metrics
  averageUsage: number;
  peakUsage: number;
  violationRate: number;
  lastViolation?: Date;
  // Business metrics
  impactOnRevenue: 'none' | 'low' | 'medium' | 'high';
  userSatisfactionImpact: 'none' | 'low' | 'medium' | 'high';
  operationalCost: 'none' | 'low' | 'medium' | 'high' }


export type QuotaCategory = 
  | 'resource_management'
  | 'security_enforcement'
  | 'business_logic'
  | 'performance_protection'
  | 'compliance_requirement'
  | 'billing_constraint';

// =============================================================================
// Usage Tracking Types
// =============================================================================


export interface UsageTracking { trackingId: number;
  quotaId: string;
  // Usage context
  userId: string;
  sessionId?: string;
  organizationId?: string;
  // Usage details
  resourceIdentifier: string;
  usageAmount: number;
  usageTimestamp: Date;
  // Time window tracking
  periodStart: Date;
  periodEnd: Date;
  cumulativeUsage: number;
  // Context and metadata
  ipAddress?: string;
  userAgent?: string;
  additionalMetadata: Record<string, any>;
  // Enforcement tracking
  quotaExceeded: boolean;
  enforcementActionTaken?: EnforcementAction;
  enforcementDetails: EnforcementDetails }



export interface EnforcementDetails { actionTaken: EnforcementAction;
  timestamp: Date;
  duration?: number; // minutes, if applicable }
  reason: string;
  automaticAction: boolean;
  adminUserId?: string;
  additionalData?: Record<string, any>;
  // =============================================================================
  // Quota Violation Types
  // =============================================================================




export interface QuotaViolation { violationId: string;
  quotaId: string;
  trackingId?: number;
  // Violation details
  userId: string;
  violationTimestamp: Date;
  exceededBy: number;
  quotaLimit: number;
  actualUsage: number;
  // Severity assessment
  severity: ActionSeverity;
  impactAssessment: ViolationImpact;
  // Enforcement response
  enforcementAction: EnforcementAction;
  enforcementDuration?: number;
  enforcementDetails: EnforcementDetails;
  // Status tracking
  status: ViolationStatus;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  // Appeal process
  appealSubmitted: boolean;
  appealStatus?: AppealStatus;
  appealDetails?: AppealDetails }



export interface ViolationImpact { businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  technicalImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  securityRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical' }


export type ViolationStatus = 
  | 'active'
  | 'resolved'
  | 'appealed'
  | 'under_review'
  | 'escalated'
  | 'expired';

export type AppealStatus = 
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'escalated';


export interface AppealDetails {
  appealId: string;
  submittedAt: Date;
  submittedBy: string;
  reason: string;
  evidence?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  decision?: 'approved' | 'denied' | 'partial';
  decisionReason?: string;
  // =============================================================================
  // Usage Analytics Types
  // =============================================================================




export interface UsageAnalytics { period: AnalyticsPeriod;
  periodStart: Date;
  periodEnd: Date;
  // Basic usage metrics
  totalUsage: number;
  averageUsage: number;
  peakUsage: number;
  uniqueUsers: number;
  // Quota-specific metrics
  quotaUtilization: number; // percentage of quota used;
  violationCount: number;
  violationRate: number; // violations per usage unit;
  // Trend analysis
  usageTrend: TrendDirection;
  trendSignificance: number; // statistical significance }
  seasonalPatterns: SeasonalPattern;
  // User behavior
  topUsers: UserUsageSummary;
  usageDistribution: UsageDistribution;
  // Performance impact
  averageResponseTime: number;
  systemLoad: number;
  resourceUtilization: ResourceUtilization;




export interface AnalyticsPeriod { type: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  value: number; // number of periods }
  timezone: string;


export type TrendDirection = 'increasing' | 'stable' | 'decreasing';


export interface SeasonalPattern { period: 'hourly' | 'daily' | 'weekly' | 'monthly' }
  pattern: number;
  confidence: number;
  description: string;




export interface UserUsageSummary { userId: string;
  username?: string;
  totalUsage: number;
  quotaUtilization: number;
  violationCount: number;
  lastActivity: Date;
  tier?: string }



export interface UsageDistribution {
  percentiles: Record<number, number>; // e.g., {50: 100, 75: 250, 90: 500, 95: 750, 99: 1000}
  buckets: DistributionBucket;
  outliers: OutlierUser;


export interface DistributionBucket { min: number;
  max: number;
  count: number;
  percentage: number }



export interface OutlierUser { userId: string;
  usage: number;
  standardDeviations: number;
  flagged: boolean }



export interface ResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
  // =============================================================================
  // Quota Management Service Types
  // =============================================================================




export interface QuotaCheckRequest { userId: string;
  quotaType: QuotaType;
  resourceIdentifier: string;
  usageAmount: number;
  metadata?: Record<string, any> }



export interface QuotaCheckResult { allowed: boolean;
  quotaId?: string;
  currentUsage: number;
  quotaLimit: number;
  remainingQuota: number;
  utilizationPercentage: number;
  // Warning information
  warningTriggered: boolean;
  warningThreshold?: number;
  // Enforcement information
  enforcementAction?: EnforcementAction;
  enforcementReason?: string;
  retryAfter?: Date;
  // Recommendations
  recommendations: QuotaRecommendation }



export interface QuotaRecommendation { type: 'upgrade_plan' | 'reduce_usage' | 'optimize_requests' | 'contact_support';
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' }




export interface QuotaUsageSummary { userId: string;
  organizationId?: string;
  summaryPeriod: AnalyticsPeriod;
  quotas: QuotaUsageDetail;
  totalViolations: number;
  activeViolations: number;
  riskScore: number;
  // Predictions
  projectedUsage: ProjectedUsage;
  quotaExhaustionDate?: Date;
  upgradeRecommendations: QuotaRecommendation }



export interface QuotaUsageDetail { quotaId: string;
  quotaName: string;
  quotaType: QuotaType;
  currentUsage: number;
  quotaLimit: number;
  utilizationPercentage: number;
  trend: TrendDirection;
  lastViolation?: Date;
  violationCount: number }



export interface ProjectedUsage {
  quotaId: string;
  currentUsage: number;
  projectedUsage: number;
  projectionDate: Date;
  confidence: number;
  projectionMethod: 'linear' | 'exponential' | 'seasonal' | 'ml_model';
  // =============================================================================
  // Admin Management Types
  // =============================================================================




export interface QuotaAdminOperation { operationId: string;
  operationType: AdminOperationType;
  targetType: 'quota' | 'user' | 'organization' | 'violation' }
  targetId: string;
  // Operation details
  adminUserId: string;
  timestamp: Date;
  reason: string;
  // Operation parameters
  parameters: Record<string, any>;
  // Approval workflow
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedAt?: Date;
  // Execution tracking
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  result?: OperationResult;
  error?: string;


export type AdminOperationType = 
  | 'create_quota'
  | 'update_quota'
  | 'delete_quota'
  | 'override_quota'
  | 'reset_usage'
  | 'resolve_violation'
  | 'bulk_quota_assignment'
  | 'emergency_quota_increase'
  | 'user_quota_exemption';


export interface OperationResult { success: boolean;
  affectedRecords: number;
  warnings: string;
  details: Record<string, any> }



export interface QuotaTemplate { templateId: string;
  templateName: string;
  description: string;
  category: 'free_tier' | 'pro_tier' | 'enterprise_tier' | 'custom' | 'emergency';
  quotaDefinitions: QuotaTemplateDefinition;
  // Template metadata
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  // Validation
  validationRules: TemplateValidationRule;
  enabled: boolean }



export interface QuotaTemplateDefinition { quotaType: QuotaType;
  resourceIdentifier: string;
  limitValue: number;
  limitPeriod: TimePeriod;
  limitUnit: UsageUnit;
  enforcementAction: EnforcementAction;
  // Template-specific overrides
  variableFields: string; // Fields that can be customized when applying template }
  conditionalRules: ConditionalRule;




export interface ConditionalRule { condition: string; // e.g., "user.subscription_tier === 'enterprise'";
  modifications: Record<string, any>; // Field modifications if condition is true }




export interface TemplateValidationRule {
  field: string;
  rule: 'required' | 'min_value' | 'max_value' | 'unique' | 'format';
  value?: any;
  errorMessage: string;
  // =============================================================================
  // Integration Types
  // =============================================================================




export interface QuotaServiceConfiguration { // Rate limiting integration
  rateLimitingEnabled: boolean;
  rateLimitingService: string;
  // Fraud detection integration
  fraudDetectionEnabled: boolean;
  fraudDetectionThresholds: FraudDetectionThresholds;
  // Billing integration
  billingEnabled: boolean;
  billingServiceEndpoint: string;
  // Notification settings
  notificationSettings: QuotaNotificationSettings;
  // Performance settings
  performanceSettings: QuotaPerformanceSettings;
  // Emergency settings
  emergencySettings: EmergencyQuotaSettings }



export interface FraudDetectionThresholds { suspiciousViolationCount: number;
  suspiciousViolationWindow: number; // minutes }
  escalationThreshold: number;
  automaticBlockThreshold: number;




export interface QuotaNotificationSettings { emailEnabled: boolean;
  slackEnabled: boolean;
  webhookEnabled: boolean;
  warningNotifications: boolean;
  violationNotifications: boolean;
  resolutionNotifications: boolean;
  notificationTemplates: Record<string, NotificationTemplate> }



export interface NotificationTemplate { subject: string;
  body: string;
  variables: string;
  channels: string;
  urgency: 'low' | 'medium' | 'high' | 'critical' }




export interface QuotaPerformanceSettings { cacheEnabled: boolean;
  cacheTtl: number; // seconds }
  batchSize: number;
  asyncProcessing: boolean;
  backgroundCleanup: boolean;
  metricsCollection: boolean;




export interface EmergencyQuotaSettings { emergencyMultiplier: number;
  emergencyDuration: number; // minutes }
  adminOverrideEnabled: boolean;
  automaticRecovery: boolean;
  escalationChain: string;




export interface QuotaEventLog { eventId: string;
  eventType: QuotaEventType;
  timestamp: Date;
  // Context
  userId?: string;
  quotaId?: string;
  violationId?: string;
  adminUserId?: string;
  // Event details
  eventData: Record<string, any>;
  severity: ActionSeverity;
  category: 'system' | 'user' | 'admin' | 'automated';
  // Processing
  processed: boolean;
  processedAt?: Date;
  processingNotes?: string }

export type QuotaEventType = 
  | 'quota_created'
  | 'quota_updated' 
  | 'quota_deleted'
  | 'usage_tracked'
  | 'warning_triggered'
  | 'violation_occurred'
  | 'enforcement_applied'
  | 'violation_resolved'
  | 'appeal_submitted'
  | 'appeal_processed'
  | 'admin_override'
  | 'emergency_quota_activated'
  | 'system_error'
  | 'integration_failure';