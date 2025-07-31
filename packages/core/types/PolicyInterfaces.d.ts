/**
 * Policy Interfaces - Epic 17 Implementation
 * Task: E17-1753114397367-674DF3 - Design policy interfaces
 *
 * Comprehensive TypeScript interfaces for the unified policy management system.
 * Provides base interfaces, policy types, and management structures for all
 * policy-related functionality across the application.
 */
import { TimeRange } from '../marketplace/analytics.types';
/**
 * Base interface for all policy types
 */

}
export interface BasePolicy {
    readonly id: string;
    readonly type: PolicyType;
    name: string;
    description: string;
    version: string;
    status: PolicyStatus;
    enabled: boolean;
    scope: PolicyScope;
    priority: number;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    timezone?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    tags: string[];
    complianceFrameworks: ComplianceFramework[];
    auditRequired: boolean;
    lastAuditDate?: Date;
    nextAuditDate?: Date;

export type PolicyType = 'security' | 'privacy' | 'content' | 'access_control' | 'data_protection' | 'enforcement' | 'compliance' | 'operational' | 'user_agreement' | 'api_governance';
export type PolicyStatus = 'draft' | 'review_pending' | 'approved' | 'active' | 'deprecated' | 'archived' | 'suspended';

}
export interface PolicyScope {
    global: boolean;
    regions?: string[];
    countries?: string[];
    excludedRegions?: string[];
    userTypes?: UserType[];
    organizationTypes?: OrganizationType[];
    contentTypes?: string[];
    environments?: Environment[];
    services?: string[];
    endpoints?: string[];
    conditions?: PolicyCondition[];

export type UserType = 'individual' | 'business' | 'enterprise' | 'admin' | 'moderator' | 'developer';
export type OrganizationType = 'startup' | 'sme' | 'enterprise' | 'non_profit' | 'government' | 'educational';
export type Environment = 'development' | 'staging' | 'production' | 'test';

}
export interface PolicyCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    weight?: number;

export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_or_equal' | 'less_or_equal' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex' | 'not_regex' | 'exists' | 'not_exists' | 'between' | 'not_between';
export type ComplianceFramework = 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'SOC2' | 'ISO27001' | 'HIPAA' | 'PCI_DSS' | 'SOX' | 'NIST' | 'FedRAMP' | 'internal' | 'custom';
/**
 * Security Policy Interface
 */

}
export interface SecurityPolicy extends BasePolicy {
    readonly type: 'security';
    securityLevel: SecurityLevel;
    threatCategories: ThreatCategory[];
    authenticationRequired: boolean;
    multiFactorRequired: boolean;
    encryptionRequired: boolean;
    auditLoggingLevel: AuditLevel;
    allowedIpRanges?: string[];
    blockedIpRanges?: string[];
    allowedUserAgents?: string[];
    blockedUserAgents?: string[];
    rateLimiting?: RateLimitConfig;
    securityHeaders?: SecurityHeadersConfig;
    monitoringEnabled: boolean;
    alertThresholds?: AlertThreshold[];

export type SecurityLevel = 'minimal' | 'standard' | 'enhanced' | 'maximum';
export type ThreatCategory = 'authentication' | 'authorization' | 'data_breach' | 'ddos' | 'malware' | 'social_engineering';
export type AuditLevel = 'none' | 'basic' | 'detailed' | 'comprehensive';

}
export interface RateLimitConfig {
    enabled: boolean;
    maxRequests: number;
    timeWindow: number;
    burstAllowance?: number;
    whitelistedIps?: string[];


}
export interface SecurityHeadersConfig {
    contentSecurityPolicy?: string;
    xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
    xContentTypeOptions?: boolean;
    xssProtection?: boolean;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    strictTransportSecurity?: string;


}
export interface AlertThreshold {
    metric: string;
    threshold: number;
    timeWindow: number;
    severity: 'low' | 'medium' | 'high' | 'critical';


/**
 * Privacy Policy Interface
 */

}
export interface PrivacyPolicy extends BasePolicy {
    readonly type: 'privacy';
    privacyLevel: PrivacyLevel;
    dataCategories: DataCategory[];
    legalBases: LegalBasis[];
    processingPurposes: ProcessingPurpose[];
    retentionPeriod: RetentionConfig;
    userRights: UserRight[];
    consentRequired: boolean;
    consentGranular: boolean;
    thirdPartySharing: ThirdPartyConfig;
    internationalTransfers: TransferConfig;
    dataPortabilityEnabled: boolean;
    deletionRightEnabled: boolean;
    rectificationRightEnabled: boolean;

export type PrivacyLevel = 'basic' | 'standard' | 'enhanced' | 'strict';
export type DataCategory = 'personal' | 'sensitive' | 'biometric' | 'financial' | 'health' | 'behavioral' | 'location';
export type LegalBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interest';
export type ProcessingPurpose = 'service_provision' | 'analytics' | 'marketing' | 'security' | 'compliance' | 'research';
export type UserRight = 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';

}
export interface RetentionConfig {
    defaultPeriod: number;
    categorySpecific?: Record<DataCategory, number>;
    automaticDeletion: boolean;
    backupRetention: number;


}
export interface ThirdPartyConfig {
    sharingAllowed: boolean;
    partners?: string[];
    purposes?: ProcessingPurpose[];
    safeguards?: string[];


}
export interface TransferConfig {
    internationalAllowed: boolean;
    adequacyCountries?: string[];
    safeguardMechanisms?: string[];
    bindingCorporateRules?: boolean;


/**
 * Content Policy Interface
 */

}
export interface ContentPolicy extends BasePolicy {
    readonly type: 'content';
    contentTypes: ContentType[];
    moderationLevel: ModerationLevel;
    prohibitedContent: ProhibitionRule[];
    requiredContent?: RequirementRule[];
    qualityStandards: QualityStandard[];
    autoModeration: boolean;
    humanReviewRequired: boolean;
    communityReporting: boolean;
    violationActions: ViolationAction[];
    appealProcess: AppealConfig;
    ageRestrictions?: AgeRestriction[];
    regionalRestrictions?: RegionalRestriction[];

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'code' | 'template' | 'prompt';
export type ModerationLevel = 'permissive' | 'standard' | 'strict' | 'custom';

}
export interface ProhibitionRule {
    ruleId: string;
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    patterns?: string[];
    keywords?: string[];
    mlDetection?: boolean;


}
export interface RequirementRule {
    ruleId: string;
    requirement: string;
    mandatory: boolean;
    validationMethod: 'automatic' | 'manual' | 'hybrid';


}
export interface QualityStandard {
    standardId: string;
    name: string;
    criteria: QualityCriteria[];
    minScore: number;
    weight: number;


}
export interface QualityCriteria {
    criterion: string;
    weight: number;
    evaluationMethod: 'automatic' | 'manual' | 'hybrid';
    threshold?: number;


}
export interface ViolationAction {
    actionType: 'warning' | 'removal' | 'restriction' | 'suspension' | 'termination';
    severity: 'low' | 'medium' | 'high' | 'critical';
    automatic: boolean;
    escalationPath?: string[];


}
export interface AppealConfig {
    appealAllowed: boolean;
    timeLimit: number;
    reviewLevels: AppealLevel[];
    automaticReview?: boolean;


}
export interface AppealLevel {
    level: string;
    reviewerType: 'system' | 'moderator' | 'admin' | 'panel';
    timeLimit: number;


}
export interface AgeRestriction {
    minAge: number;
    contentType: ContentType;
    verificationRequired: boolean;


}
export interface RegionalRestriction {
    region: string;
    restricted: boolean;
    reason: string;
    alternativeContent?: string;


/**
 * Policy Template Interface
 */

}
export interface PolicyTemplate {
    templateId: string;
    name: string;
    description: string;
    policyType: PolicyType;
    version: string;
    template: Partial<BasePolicy>;
    requiredFields: string[];
    optionalFields: string[];
    fieldValidations: FieldValidation[];
    customizable: boolean;
    industrySpecific?: string[];
    complianceFrameworks: ComplianceFramework[];
    createdAt: Date;
    createdBy: string;
    popularity: number;
    usage_count: number;
    parentTemplateId?: string;
    childTemplates?: string[];


}
export interface FieldValidation {
    field: string;
    validationType: 'required' | 'format' | 'range' | 'custom';
    validation: any;
    errorMessage: string;


/**
 * Policy Assignment Interface
 */

}
export interface PolicyAssignment {
    assignmentId: string;
    policyId: string;
    policy?: BasePolicy;
    targetType: AssignmentTargetType;
    targetId: string;
    targetName?: string;
    assignmentType: AssignmentType;
    priority: number;
    inheritsFrom?: string[];
    conflictResolution: ConflictResolution;
    status: AssignmentStatus;
    activatedAt?: Date;
    deactivatedAt?: Date;
    overridable: boolean;
    overrides?: PolicyOverride[];
    assignedBy: string;
    assignedAt: Date;
    reason?: string;
    notes?: string;

export type AssignmentTargetType = 'global' | 'organization' | 'user_group' | 'user' | 'content_category' | 'content_item' | 'service' | 'endpoint';
export type AssignmentType = 'direct' | 'inherited' | 'computed' | 'default';
export type AssignmentStatus = 'pending' | 'active' | 'suspended' | 'revoked' | 'expired';

}
export interface ConflictResolution {
    strategy: ConflictStrategy;
    priorityRules: PriorityRule[];
    customLogic?: string;

export type ConflictStrategy = 'highest_priority' | 'most_restrictive' | 'most_permissive' | 'latest_assigned' | 'custom';

}
export interface PriorityRule {
    condition: string;
    priorityModifier: number;
    description: string;


}
export interface PolicyOverride {
    overrideId: string;
    field: string;
    originalValue: any;
    overrideValue: any;
    reason: string;
    approvedBy?: string;
    expiresAt?: Date;


/**
 * Policy Evaluation Interface
 */

}
export interface PolicyEvaluation {
    evaluationId: string;
    policyId: string;
    context: EvaluationContext;
    requestedAction: string;
    result: EvaluationResult;
    decision: PolicyDecision;
    confidence: number;
    applicablePolicies: string[];
    conflictsDetected: PolicyConflict[];
    overridesApplied: PolicyOverride[];
    evaluationTime: number;
    cached: boolean;
    cacheExpiration?: Date;
    evaluatedAt: Date;
    evaluatedBy: string;
    traceData?: EvaluationTrace[];


}
export interface EvaluationContext {
    userId?: string;
    organizationId?: string;
    contentType?: ContentType;
    contentId?: string;
    action: string;
    environment: Environment;
    timestamp: Date;
    additionalData?: Record<string, any>;

export type PolicyDecision = 'allow' | 'deny' | 'conditional' | 'review_required';

}
export interface EvaluationResult {
    decision: PolicyDecision;
    reasons: string[];
    conditions?: string[];
    requirements?: string[];
    warnings?: string[];
    allowedActions?: string[];
    deniedActions?: string[];
    metadata?: Record<string, any>;


}
export interface PolicyConflict {
    conflictType: 'priority' | 'contradiction' | 'ambiguity';
    involvedPolicies: string[];
    description: string;
    resolution: string;
    resolutionConfidence: number;


}
export interface EvaluationTrace {
    step: string;
    policyId?: string;
    condition?: string;
    result: boolean | string;
    duration: number;
    details?: any;


/**
 * Policy Analytics Interface
 */

}
export interface PolicyAnalytics {
    period: AnalyticsPeriod;
    generatedAt: Date;
    policyUsage: PolicyUsageMetrics[];
    evaluationMetrics: EvaluationMetrics;
    performanceMetrics: PerformanceMetrics;
    complianceMetrics: ComplianceMetrics;
    trends: PolicyTrend[];
    insights: PolicyInsight[];
    recommendations: PolicyRecommendation[];


}
export interface AnalyticsPeriod {
    startDate: Date;
    endDate: Date;
    timeRange: TimeRange;


}
export interface PolicyUsageMetrics {
    policyId: string;
    policyName: string;
    evaluationCount: number;
    allowCount: number;
    denyCount: number;
    conditionalCount: number;
    averageEvaluationTime: number;
    cacheHitRate: number;
    accuracyRate?: number;
    falsePositiveRate?: number;
    falseNegativeRate?: number;


}
export interface EvaluationMetrics {
    totalEvaluations: number;
    averageEvaluationTime: number;
    peakEvaluationsPerSecond: number;
    allowRate: number;
    denyRate: number;
    conditionalRate: number;
    reviewRequiredRate: number;
    overallCacheHitRate: number;
    cacheSize: number;
    cacheEvictions: number;


}
export interface PerformanceMetrics {
    averageLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    timeoutRate: number;
    memoryUsage: number;
    cpuUsage: number;


}
export interface ComplianceMetrics {
    overallComplianceScore: number;
    frameworkScores: Record<ComplianceFramework, number>;
    violationCount: number;
    violationsByFramework: Record<ComplianceFramework, number>;
    violationTrend: 'improving' | 'stable' | 'degrading';
    auditReadinessScore: number;
    documentsUpToDate: number;
    lastAuditFindings: number;


}
export interface PolicyTrend {
    trendType: 'usage' | 'performance' | 'compliance' | 'violations';
    direction: 'increasing' | 'stable' | 'decreasing';
    magnitude: 'slight' | 'moderate' | 'significant' | 'dramatic';
    confidence: number;
    timeframe: string;
    description: string;


}
export interface PolicyInsight {
    insightType: 'optimization' | 'risk' | 'opportunity' | 'anomaly';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    actionable: boolean;
    relatedPolicies: string[];


}
export interface PolicyRecommendation {
    category: 'optimization' | 'security' | 'compliance' | 'performance' | 'user_experience';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementationComplexity: 'low' | 'medium' | 'high';
    estimatedEffort: string;
    dueDate?: Date;


}
export interface PolicyValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];


}
export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
    code: string;


}
export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
    suggestion?: string;


}
export interface PolicySearchCriteria {
    types?: PolicyType[];
    status?: PolicyStatus[];
    tags?: string[];
    complianceFrameworks?: ComplianceFramework[];
    createdAfter?: Date;
    createdBefore?: Date;
    modifiedAfter?: Date;
    modifiedBefore?: Date;
    text?: string;


}
export interface PolicySearchResult {
    policies: BasePolicy[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
    hasMore: boolean;


/**
 * Policy diff interface for version comparison
 */

}
export interface PolicyDiff {
    policyId: string;
    oldVersion: string;
    newVersion: string;
    changes: PolicyChange[];
    summary: DiffSummary;


}
export interface PolicyChange {
    changeType: 'added' | 'removed' | 'modified';
    field: string;
    oldValue?: any;
    newValue?: any;
    path: string;


}
export interface DiffSummary {
    totalChanges: number;
    addedFields: number;
    removedFields: number;
    modifiedFields: number;
    significanceLevel: 'minor' | 'major' | 'breaking';


/**
 * Policy export/import interfaces
 */

}
export interface PolicyExport {
    exportId: string;
    exportedAt: Date;
    exportedBy: string;
    format: ExportFormat;
    policies: BasePolicy[];
    assignments?: PolicyAssignment[];
    metadata: ExportMetadata;

export type ExportFormat = 'json' | 'yaml' | 'csv' | 'xml';

}
export interface ExportMetadata {
    version: string;
    description?: string;
    includeAssignments: boolean;
    includeHistory: boolean;
    filters?: PolicySearchCriteria;


}
export interface PolicyImport {
    importId: string;
    importedAt: Date;
    importedBy: string;
    source: string;
    status: ImportStatus;
    result: ImportResult;

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partially_completed';

}
export interface ImportResult {
    totalPolicies: number;
    successfullyImported: number;
    failed: number;
    skipped: number;
    errors: ImportError[];
    warnings: ImportWarning[];


}
export interface ImportError {
    policyId?: string;
    message: string;
    field?: string;
    code: string;


}
export interface ImportWarning {
    policyId?: string;
    message: string;
    field?: string;
    code: string;


//# sourceMappingURL=PolicyInterfaces.d.ts.map
}