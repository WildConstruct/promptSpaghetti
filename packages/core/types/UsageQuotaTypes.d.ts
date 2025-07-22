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
export interface UsageQuota {
    quotaId: string;
    quotaName: string;
    quotaType: QuotaType;
    resourceIdentifier: string;
    limitValue: number;
    limitPeriod: TimePeriod;
    limitUnit: UsageUnit;
    appliesTo: QuotaScope;
    enforcementAction: EnforcementAction;
    resetBehavior: ResetBehavior;
    gracePeriodMinutes: number;
    burstAllowance?: number;
    rolloverPercentage?: number;
    hardLimit: boolean;
    enabled: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    configuration: QuotaConfiguration;
    metadata: QuotaMetadata;
}
export type QuotaType = 'api_requests' | 'api_requests_per_endpoint' | 'data_processing_tokens' | 'preview_generations' | 'graph_executions' | 'export_operations' | 'template_access' | 'storage_usage' | 'processing_time' | 'bandwidth_usage' | 'concurrent_sessions' | 'file_downloads' | 'advanced_nodes' | 'collaboration_workspaces' | 'template_library_access' | 'admin_panel_access' | 'custom_integrations' | 'marketplace_listings' | 'content_uploads' | 'user_invitations' | 'workspace_members';
export type TimePeriod = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'rolling';
export type UsageUnit = 'requests' | 'bytes' | 'megabytes' | 'tokens' | 'executions' | 'minutes' | 'hours' | 'sessions' | 'operations' | 'items' | 'users';
export interface QuotaScope {
    type: ScopeType;
    value?: string;
    conditions?: ScopeCondition[];
}
export type ScopeType = 'user' | 'organization' | 'tier' | 'role' | 'global' | 'conditional';
export interface ScopeCondition {
    field: string;
    operator: 'equals' | 'in' | 'greater_than' | 'less_than' | 'contains';
    value: any;
    required: boolean;
}
export type EnforcementAction = 'warn' | 'throttle' | 'soft_block' | 'hard_block' | 'review' | 'degrade' | 'redirect' | 'upgrade_prompt';
export type ResetBehavior = 'automatic' | 'manual' | 'rolling' | 'cascade';
export interface QuotaConfiguration {
    warningThresholds: number[];
    emergencyMultiplier: number;
    integrateWithRateLimit: boolean;
    integrateWithFraudDetection: boolean;
    integrateWithBilling: boolean;
    trackingEnabled: boolean;
    analyticsEnabled: boolean;
    alertsEnabled: boolean;
    cachingEnabled: boolean;
    batchProcessing: boolean;
    asyncEnforcement: boolean;
}
export interface QuotaMetadata {
    description: string;
    category: QuotaCategory;
    businessJustification: string;
    technicalConstraints: string[];
    relatedQuotas: string[];
    averageUsage: number;
    peakUsage: number;
    violationRate: number;
    lastViolation?: Date;
    impactOnRevenue: 'none' | 'low' | 'medium' | 'high';
    userSatisfactionImpact: 'none' | 'low' | 'medium' | 'high';
    operationalCost: 'none' | 'low' | 'medium' | 'high';
}
export type QuotaCategory = 'resource_management' | 'security_enforcement' | 'business_logic' | 'performance_protection' | 'compliance_requirement' | 'billing_constraint';
export interface UsageTracking {
    trackingId: number;
    quotaId: string;
    userId: string;
    sessionId?: string;
    organizationId?: string;
    resourceIdentifier: string;
    usageAmount: number;
    usageTimestamp: Date;
    periodStart: Date;
    periodEnd: Date;
    cumulativeUsage: number;
    ipAddress?: string;
    userAgent?: string;
    additionalMetadata: Record<string, any>;
    quotaExceeded: boolean;
    enforcementActionTaken?: EnforcementAction;
    enforcementDetails: EnforcementDetails;
}
export interface EnforcementDetails {
    actionTaken: EnforcementAction;
    timestamp: Date;
    duration?: number;
    reason: string;
    automaticAction: boolean;
    adminUserId?: string;
    additionalData?: Record<string, any>;
}
export interface QuotaViolation {
    violationId: string;
    quotaId: string;
    trackingId?: number;
    userId: string;
    violationTimestamp: Date;
    exceededBy: number;
    quotaLimit: number;
    actualUsage: number;
    severity: ActionSeverity;
    impactAssessment: ViolationImpact;
    enforcementAction: EnforcementAction;
    enforcementDuration?: number;
    enforcementDetails: EnforcementDetails;
    status: ViolationStatus;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionNotes?: string;
    appealSubmitted: boolean;
    appealStatus?: AppealStatus;
    appealDetails?: AppealDetails;
}
export interface ViolationImpact {
    businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    technicalImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    securityRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
}
export type ViolationStatus = 'active' | 'resolved' | 'appealed' | 'under_review' | 'escalated' | 'expired';
export type AppealStatus = 'submitted' | 'under_review' | 'approved' | 'denied' | 'escalated';
export interface AppealDetails {
    appealId: string;
    submittedAt: Date;
    submittedBy: string;
    reason: string;
    evidence?: string[];
    reviewedBy?: string;
    reviewedAt?: Date;
    decision?: 'approved' | 'denied' | 'partial';
    decisionReason?: string;
}
export interface UsageAnalytics {
    period: AnalyticsPeriod;
    periodStart: Date;
    periodEnd: Date;
    totalUsage: number;
    averageUsage: number;
    peakUsage: number;
    uniqueUsers: number;
    quotaUtilization: number;
    violationCount: number;
    violationRate: number;
    usageTrend: TrendDirection;
    trendSignificance: number;
    seasonalPatterns: SeasonalPattern[];
    topUsers: UserUsageSummary[];
    usageDistribution: UsageDistribution;
    averageResponseTime: number;
    systemLoad: number;
    resourceUtilization: ResourceUtilization;
}
export interface AnalyticsPeriod {
    type: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    value: number;
    timezone: string;
}
export type TrendDirection = 'increasing' | 'stable' | 'decreasing';
export interface SeasonalPattern {
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    pattern: number[];
    confidence: number;
    description: string;
}
export interface UserUsageSummary {
    userId: string;
    username?: string;
    totalUsage: number;
    quotaUtilization: number;
    violationCount: number;
    lastActivity: Date;
    tier?: string;
}
export interface UsageDistribution {
    percentiles: Record<number, number>;
    buckets: DistributionBucket[];
    outliers: OutlierUser[];
}
export interface DistributionBucket {
    min: number;
    max: number;
    count: number;
    percentage: number;
}
export interface OutlierUser {
    userId: string;
    usage: number;
    standardDeviations: number;
    flagged: boolean;
}
export interface ResourceUtilization {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    database: number;
}
export interface QuotaCheckRequest {
    userId: string;
    quotaType: QuotaType;
    resourceIdentifier: string;
    usageAmount: number;
    metadata?: Record<string, any>;
}
export interface QuotaCheckResult {
    allowed: boolean;
    quotaId?: string;
    currentUsage: number;
    quotaLimit: number;
    remainingQuota: number;
    utilizationPercentage: number;
    warningTriggered: boolean;
    warningThreshold?: number;
    enforcementAction?: EnforcementAction;
    enforcementReason?: string;
    retryAfter?: Date;
    recommendations: QuotaRecommendation[];
}
export interface QuotaRecommendation {
    type: 'upgrade_plan' | 'reduce_usage' | 'optimize_requests' | 'contact_support';
    title: string;
    description: string;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high';
}
export interface QuotaUsageSummary {
    userId: string;
    organizationId?: string;
    summaryPeriod: AnalyticsPeriod;
    quotas: QuotaUsageDetail[];
    totalViolations: number;
    activeViolations: number;
    riskScore: number;
    projectedUsage: ProjectedUsage[];
    quotaExhaustionDate?: Date;
    upgradeRecommendations: QuotaRecommendation[];
}
export interface QuotaUsageDetail {
    quotaId: string;
    quotaName: string;
    quotaType: QuotaType;
    currentUsage: number;
    quotaLimit: number;
    utilizationPercentage: number;
    trend: TrendDirection;
    lastViolation?: Date;
    violationCount: number;
}
export interface ProjectedUsage {
    quotaId: string;
    currentUsage: number;
    projectedUsage: number;
    projectionDate: Date;
    confidence: number;
    projectionMethod: 'linear' | 'exponential' | 'seasonal' | 'ml_model';
}
export interface QuotaAdminOperation {
    operationId: string;
    operationType: AdminOperationType;
    targetType: 'quota' | 'user' | 'organization' | 'violation';
    targetId: string;
    adminUserId: string;
    timestamp: Date;
    reason: string;
    parameters: Record<string, any>;
    requiresApproval: boolean;
    approvalStatus?: 'pending' | 'approved' | 'denied';
    approvedBy?: string;
    approvedAt?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    result?: OperationResult;
    error?: string;
}
export type AdminOperationType = 'create_quota' | 'update_quota' | 'delete_quota' | 'override_quota' | 'reset_usage' | 'resolve_violation' | 'bulk_quota_assignment' | 'emergency_quota_increase' | 'user_quota_exemption';
export interface OperationResult {
    success: boolean;
    affectedRecords: number;
    warnings: string[];
    details: Record<string, any>;
}
export interface QuotaTemplate {
    templateId: string;
    templateName: string;
    description: string;
    category: 'free_tier' | 'pro_tier' | 'enterprise_tier' | 'custom' | 'emergency';
    quotaDefinitions: QuotaTemplateDefinition[];
    createdBy: string;
    createdAt: Date;
    lastUsed?: Date;
    usageCount: number;
    validationRules: TemplateValidationRule[];
    enabled: boolean;
}
export interface QuotaTemplateDefinition {
    quotaType: QuotaType;
    resourceIdentifier: string;
    limitValue: number;
    limitPeriod: TimePeriod;
    limitUnit: UsageUnit;
    enforcementAction: EnforcementAction;
    variableFields: string[];
    conditionalRules: ConditionalRule[];
}
export interface ConditionalRule {
    condition: string;
    modifications: Record<string, any>;
}
export interface TemplateValidationRule {
    field: string;
    rule: 'required' | 'min_value' | 'max_value' | 'unique' | 'format';
    value?: any;
    errorMessage: string;
}
export interface QuotaServiceConfiguration {
    rateLimitingEnabled: boolean;
    rateLimitingService: string;
    fraudDetectionEnabled: boolean;
    fraudDetectionThresholds: FraudDetectionThresholds;
    billingEnabled: boolean;
    billingServiceEndpoint: string;
    notificationSettings: QuotaNotificationSettings;
    performanceSettings: QuotaPerformanceSettings;
    emergencySettings: EmergencyQuotaSettings;
}
export interface FraudDetectionThresholds {
    suspiciousViolationCount: number;
    suspiciousViolationWindow: number;
    escalationThreshold: number;
    automaticBlockThreshold: number;
}
export interface QuotaNotificationSettings {
    emailEnabled: boolean;
    slackEnabled: boolean;
    webhookEnabled: boolean;
    warningNotifications: boolean;
    violationNotifications: boolean;
    resolutionNotifications: boolean;
    notificationTemplates: Record<string, NotificationTemplate>;
}
export interface NotificationTemplate {
    subject: string;
    body: string;
    variables: string[];
    channels: string[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface QuotaPerformanceSettings {
    cacheEnabled: boolean;
    cacheTtl: number;
    batchSize: number;
    asyncProcessing: boolean;
    backgroundCleanup: boolean;
    metricsCollection: boolean;
}
export interface EmergencyQuotaSettings {
    emergencyMultiplier: number;
    emergencyDuration: number;
    adminOverrideEnabled: boolean;
    automaticRecovery: boolean;
    escalationChain: string[];
}
export interface QuotaEventLog {
    eventId: string;
    eventType: QuotaEventType;
    timestamp: Date;
    userId?: string;
    quotaId?: string;
    violationId?: string;
    adminUserId?: string;
    eventData: Record<string, any>;
    severity: ActionSeverity;
    category: 'system' | 'user' | 'admin' | 'automated';
    processed: boolean;
    processedAt?: Date;
    processingNotes?: string;
}
export type QuotaEventType = 'quota_created' | 'quota_updated' | 'quota_deleted' | 'usage_tracked' | 'warning_triggered' | 'violation_occurred' | 'enforcement_applied' | 'violation_resolved' | 'appeal_submitted' | 'appeal_processed' | 'admin_override' | 'emergency_quota_activated' | 'system_error' | 'integration_failure';
//# sourceMappingURL=UsageQuotaTypes.d.ts.map