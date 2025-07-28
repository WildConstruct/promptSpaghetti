/**
 * Enforcement Action Types - Epic 17
 *
 * Comprehensive type definitions for marketplace enforcement actions,
 * violation management, and automated moderation systems.
 *
 * Task: E17-1753114397379-11939C - Create enforcement actions
 * Epic: 17 - Backstage Admin Controls
 */
import { TimeRange } from '../marketplace/analytics.types';
export interface EnforcementAction {
    actionId: string;
    actionType: EnforcementActionType;
    severity: ActionSeverity;
    status: ActionStatus;
    targetType: TargetType;
    targetId: string;
    targetDetails?: TargetDetails;
    reason: ViolationReason;
    description: string;
    evidence: Evidence;
    duration?: ActionDuration;
    executionType: ExecutionType;
    executedBy: string;
    executedAt: Date;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    reviewStatus: ReviewStatus;
    appealable: boolean;
    appealDeadline?: Date;
    policyVersion: string;
    escalationLevel: number;
    relatedActions: string;
    tags: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
}
export type EnforcementActionType = 'warning' | 'content_flag' | 'content_removal' | 'content_quarantine' | 'account_warning' | 'account_restriction' | 'account_suspension' | 'account_termination' | 'transaction_block' | 'payment_hold' | 'verification_required' | 'feature_restriction' | 'marketplace_ban' | 'shadow_ban' | 'rate_limit' | 'manual_review_required';
export type ActionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'active' | 'expired' | 'reversed' | 'appealed' | 'under_review' | 'scheduled' | 'failed';
export type TargetType = 'user' | 'template' | 'transaction' | 'review' | 'comment' | 'message';
export type ExecutionType = 'automatic' | 'manual' | 'scheduled' | 'escalated';
export type ReviewStatus = 'not_reviewed' | 'under_review' | 'reviewed_upheld' | 'reviewed_modified' | 'reviewed_reversed' | 'appeal_pending' | 'appeal_denied' | 'appeal_approved';
export interface TargetDetails {
    title?: string;
    creator?: string;
    category?: string;
    currentStatus?: string;
    impactLevel?: 'user' | 'community' | 'marketplace';
}
export interface ViolationReason {
    category: ViolationCategory;
    subcategory?: string;
    specificReason: string;
    policyReference: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    automatedDetection: boolean;
    communityReported: boolean;
}
export type ViolationCategory = 'content_policy' | 'quality_standards' | 'security_threat' | 'fraud_abuse' | 'intellectual_property' | 'privacy_violation' | 'spam_manipulation' | 'harassment_hate' | 'legal_compliance' | 'terms_of_service' | 'community_guidelines' | 'payment_issues' | 'technical_violation';
export interface Evidence {
    evidenceId: string;
    type: EvidenceType;
    source: EvidenceSource;
    description: string;
    data: any;
    confidence: number;
    verifiedBy?: string;
    verifiedAt?: Date;
    attachments?: EvidenceAttachment;
}
export type EvidenceType = 'user_report' | 'automated_detection' | 'system_log' | 'content_analysis' | 'behavioral_pattern' | 'security_scan' | 'fraud_signal' | 'trust_score_violation' | 'manual_investigation' | 'external_report';
export type EvidenceSource = 'user_submission' | 'automated_system' | 'trust_score_service' | 'content_quality_service' | 'security_scanner' | 'fraud_detector' | 'admin_review' | 'community_moderator' | 'external_api';
export interface EvidenceAttachment {
    attachmentId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    checksum: string;
    uploadedAt: Date;
}
export interface ActionDuration {
    type: 'temporary' | 'permanent' | 'conditional';
    duration?: number;
    condition?: string;
    reviewPeriod?: number;
    escalationPeriod?: number;
}
export interface EnforcementPolicy {
    policyId: string;
    name: string;
    version: string;
    description: string;
    scope: PolicyScope;
    applicableTargets: TargetType;
    violationRules: ViolationRule;
    actionMatrix: ActionMatrix;
    enabled: boolean;
    priority: number;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    createdBy: string;
    approvedBy: string;
    lastModified: Date;
}
export interface PolicyScope {
    global: boolean;
    regions?: string;
    userTypes?: string;
    categories?: string;
    excludedEntities?: string;
}
export interface ViolationRule {
    ruleId: string;
    name: string;
    description: string;
    triggers: RuleTrigger;
    conditions: RuleCondition;
    thresholds: RuleThreshold;
    actions: RuleAction;
    enabled: boolean;
    severity: ActionSeverity;
    escalationPath: string;
}
export interface RuleTrigger {
    type: TriggerType;
    source: string;
    event: string;
    parameters: Record<string, any>;
}
export type TriggerType = 'trust_score_change' | 'violation_report' | 'automated_detection' | 'user_action' | 'system_event' | 'external_signal';
export interface RuleCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    weight: number;
}
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex' | 'exists' | 'not_exists';
export interface RuleThreshold {
    metric: string;
    threshold: number;
    timeWindow: number;
    aggregation: 'count' | 'sum' | 'average' | 'max' | 'min';
}
export interface RuleAction {
    actionType: EnforcementActionType;
    severity: ActionSeverity;
    duration?: ActionDuration;
    escalationDelay?: number;
    requiresManualReview: boolean;
    notificationRequired: boolean;
}
export interface ActionMatrix {
    firstOffense: EnforcementActionType;
    repeatOffense: EnforcementActionType;
    severeThreat: EnforcementActionType;
    communityHarm: EnforcementActionType;
    legalViolation: EnforcementActionType;
}
export interface EnforcementWorkflow {
    workflowId: string;
    name: string;
    description: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep;
    executionMode: 'automatic' | 'semi_automatic' | 'manual';
    parallelExecution: boolean;
    maxRetries: number;
    timeout: number;
    requiresApproval: boolean;
    approvalLevel: ApprovalLevel;
    approvers: string;
    enabled: boolean;
    successRate: number;
    averageExecutionTime: number;
    totalExecutions: number;
    createdAt: Date;
    lastModified: Date;
    version: string;
}
export interface WorkflowTrigger {
    type: 'violation_detected' | 'trust_score_threshold' | 'manual_request' | 'scheduled' | 'external_event';
    conditions: TriggerCondition;
    debounceTime?: number;
}
export interface TriggerCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    required: boolean;
}
export interface WorkflowStep {
    stepId: string;
    name: string;
    type: StepType;
    action: StepAction;
    conditions?: StepCondition;
    nextSteps: NextStep;
    retryPolicy?: RetryPolicy;
    timeout?: number;
    executionCount: number;
    successCount: number;
    failureCount: number;
    averageExecutionTime: number;
}
export type StepType = 'enforcement_action' | 'notification' | 'data_collection' | 'risk_assessment' | 'manual_review' | 'escalation' | 'approval' | 'rollback';
export interface StepAction {
    actionType: string;
    parameters: Record<string, any>;
    failureHandling: 'continue' | 'retry' | 'abort' | 'escalate';
}
export interface StepCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    onMatch: 'continue' | 'skip' | 'branch';
    branchTo?: string;
}
export interface NextStep {
    stepId: string;
    condition?: string;
    delay?: number;
}
export interface RetryPolicy {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
    retryConditions: string;
}
export type ApprovalLevel = 'admin' | 'senior_admin' | 'legal' | 'security_team' | 'multi_level';
export interface ViolationReport {
    reportId: string;
    reportType: ReportType;
    targetType: TargetType;
    targetId: string;
    targetSnapshot?: any;
    violationType: ViolationCategory;
    description: string;
    severity: ActionSeverity;
    confidence: number;
    reportedBy: ReporterInfo;
    reportedAt: Date;
    detectionMethod: DetectionMethod;
    evidence: Evidence;
    relatedReports: string;
    status: ReportStatus;
    assignedTo?: string;
    investigationNotes?: InvestigationNote;
    resolution?: ReportResolution;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string;
    externalReferences: string;
}
export type ReportType = 'community_report' | 'automated_detection' | 'security_alert' | 'trust_score_violation' | 'quality_violation' | 'fraud_detection' | 'admin_investigation';
export interface ReporterInfo {
    reporterId: string;
    reporterType: 'user' | 'moderator' | 'admin' | 'system' | 'external';
    credibility: number;
    previousReports: number;
    reportAccuracyRate: number;
    isVerified: boolean;
}
export interface DetectionMethod {
    method: 'manual_report' | 'automated_scan' | 'pattern_analysis' | 'ml_detection' | 'rule_engine';
    algorithm?: string;
    modelVersion?: string;
    confidence: number;
    falsePositiveRate?: number;
}
export type ReportStatus = 'submitted' | 'under_review' | 'escalated' | 'resolved' | 'dismissed' | 'duplicate' | 'insufficient_evidence';
export interface InvestigationNote {
    noteId: string;
    investigatorId: string;
    note: string;
    timestamp: Date;
    visibility: 'internal' | 'public' | 'legal';
    attachments?: EvidenceAttachment;
}
export interface ReportResolution {
    outcome: ResolutionOutcome;
    actions: string;
    reasonCode: string;
    explanation: string;
    resolvedBy: string;
    resolvedAt: Date;
    appealable: boolean;
    appealDeadline?: Date;
}
export type ResolutionOutcome = 'violation_confirmed' | 'violation_not_found' | 'insufficient_evidence' | 'policy_clarification_needed' | 'duplicate_report' | 'malicious_report';
export interface EnforcementAppeal {
    appealId: string;
    enforcementActionId: string;
    enforcementAction: EnforcementAction;
    appellantId: string;
    appellantType: 'target' | 'affected_party' | 'third_party';
    appealReason: AppealReason;
    description: string;
    evidence: Evidence;
    requestedOutcome: RequestedOutcome;
    status: AppealStatus;
    submittedAt: Date;
    reviewDeadline: Date;
    assignedReviewer?: string;
    reviewPanel?: string;
    reviewNotes?: ReviewNote;
    decision?: AppealDecision;
    decisionReason?: string;
    decidedBy?: string;
    decidedAt?: Date;
    followUpActions?: string;
    compensationAwarded?: Compensation;
    priority: 'normal' | 'expedited' | 'urgent';
    publicVisibility: boolean;
    legalImplications: boolean;
}
export interface AppealReason {
    category: AppealCategory;
    specificReason: string;
    claimsInnocence: boolean;
    claimsError: boolean;
    claimsDisproportion: boolean;
    claimsBias: boolean;
    newEvidence: boolean;
}
export type AppealCategory = 'factual_error' | 'procedural_error' | 'disproportionate_action' | 'policy_misinterpretation' | 'technical_error' | 'bias_discrimination' | 'new_evidence' | 'changed_circumstances';
export interface RequestedOutcome {
    action: 'complete_reversal' | 'partial_reversal' | 'action_modification' | 'compensation' | 'policy_clarification';
    specificRequest: string;
    justification: string;
}
export type AppealStatus = 'submitted' | 'under_review' | 'additional_info_requested' | 'panel_review' | 'decision_pending' | 'approved' | 'denied' | 'partially_approved' | 'withdrawn';
export interface ReviewNote {
    reviewerId: string;
    note: string;
    timestamp: Date;
    category: 'procedural' | 'factual' | 'legal' | 'policy' | 'recommendation';
    confidential: boolean;
}
export interface AppealDecision {
    outcome: 'approved' | 'denied' | 'partially_approved' | 'remanded';
    reasoning: string;
    evidenceConsidered: string;
    policyReferences: string;
    precedentCases?: string;
    modifiedActions?: Partial<EnforcementAction>[];
    implementationDeadline?: Date;
    monitoringRequired?: boolean;
}
export interface Compensation {
    type: 'monetary' | 'service_credit' | 'fee_waiver' | 'priority_review' | 'public_apology';
    amount?: number;
    currency?: string;
    description: string;
    processingTime: number;
}
export interface EnforcementAnalytics {
    period: AnalyticsPeriod;
    generatedAt: Date;
    overallMetrics: EnforcementOverallMetrics;
    actionBreakdown: ActionBreakdown;
    violationBreakdown: ViolationBreakdown;
    effectivenessMetrics: EffectivenessMetrics;
    trends: EnforcementTrends;
    patterns: ViolationPattern;
    appealMetrics: AppealMetrics;
    insights: EnforcementInsight;
    recommendations: EnforcementRecommendation;
}
export interface AnalyticsPeriod {
    startDate: Date;
    endDate: Date;
    timeRange: TimeRange;
}
export interface EnforcementOverallMetrics {
    totalActions: number;
    totalViolations: number;
    totalAppeals: number;
    automaticActions: number;
    manualActions: number;
    averageResolutionTime: number;
    appealSuccessRate: number;
    affectedUsers: number;
    affectedTemplates: number;
    communityTrustImpact: number;
}
export interface ActionBreakdown {
    byType: ActionTypeMetrics;
    bySeverity: ActionSeverityMetrics;
    byStatus: ActionStatusMetrics;
    byExecutionType: ExecutionTypeMetrics;
}
export interface ActionTypeMetrics {
    actionType: EnforcementActionType;
    count: number;
    percentage: number;
    averageDuration: number;
    successRate: number;
    appealRate: number;
}
export interface ActionSeverityMetrics {
    severity: ActionSeverity;
    count: number;
    percentage: number;
    averageResolutionTime: number;
    escalationRate: number;
}
export interface ActionStatusMetrics {
    status: ActionStatus;
    count: number;
    percentage: number;
    averageTimeInStatus: number;
}
export interface ExecutionTypeMetrics {
    executionType: ExecutionType;
    count: number;
    percentage: number;
    accuracyRate: number;
    overrideRate: number;
}
export interface ViolationBreakdown {
    byCategory: ViolationCategoryMetrics;
    bySource: ViolationSourceMetrics;
    byConfidence: ConfidenceMetrics;
}
export interface ViolationCategoryMetrics {
    category: ViolationCategory;
    count: number;
    percentage: number;
    averageSeverity: ActionSeverity;
    resolutionRate: number;
    falsePositiveRate: number;
}
export interface ViolationSourceMetrics {
    source: EvidenceSource;
    count: number;
    percentage: number;
    accuracy: number;
    averageConfidence: number;
}
export interface ConfidenceMetrics {
    confidenceRange: string;
    count: number;
    accuracyRate: number;
    falsePositiveRate: number;
}
export interface EffectivenessMetrics {
    deterrentEffect: number;
    recidivismRate: number;
    communityHealthImprovement: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    averageDetectionTime: number;
    averageActionTime: number;
    averageResolutionTime: number;
}
export interface EnforcementTrends {
    violationTrend: 'increasing' | 'stable' | 'decreasing';
    actionTrend: 'increasing' | 'stable' | 'decreasing';
    appealTrend: 'increasing' | 'stable' | 'decreasing';
    monthlyViolations: number;
    monthlyActions: number;
    monthlyAppeals: number;
    seasonalPatterns: SeasonalPattern;
    predictedViolations: number;
    predictionConfidence: number;
}
export interface ViolationPattern {
    patternId: string;
    description: string;
    frequency: number;
    severity: ActionSeverity;
    affectedUsers: number;
    detectionAccuracy: number;
    preventionStrategy: string;
}
export interface SeasonalPattern {
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    pattern: number;
    strength: number;
    description: string;
}
export interface AppealMetrics {
    totalAppeals: number;
    appealRate: number;
    appealsApproved: number;
    appealsDenied: number;
    appealsPartiallyApproved: number;
    averageAppealTime: number;
    averageReviewTime: number;
    appealAccuracy: number;
    overturnRate: number;
}
export interface EnforcementInsight {
    insightId: string;
    type: 'trend' | 'anomaly' | 'pattern' | 'risk' | 'opportunity';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    actionable: boolean;
    recommendedActions: string;
    generatedAt: Date;
}
export interface EnforcementRecommendation {
    recommendationId: string;
    category: 'policy' | 'automation' | 'process' | 'training' | 'technology';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
    timeline: string;
    successMetrics: string;
    generatedAt: Date;
}
//# sourceMappingURL=EnforcementTypes.d.ts.map