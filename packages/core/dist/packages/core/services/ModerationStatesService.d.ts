/**
 * Moderation States Service - Epic 17
 *
 * Comprehensive moderation state management system with advanced state transitions,
 * escalation workflows, automated processing, and compliance tracking.
 *
 * Task: E17-1753114396901-E7BE9C - Create moderation states
 * Epic: 17 - Backstage Admin Controls
 */
export interface ModerationState {
    id: string;
    name: string;
    type: ModerationStateType;
    category: ModerationCategory;
    severity: ModerationSeverity;
    autoActions: AutoModerationAction;
    permissions: StatePermissions;
    transitions: StateTransition;
    metadata: ModerationStateMetadata;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isActive: boolean;
}
export interface ModerationItem {
    id: string;
    type: ContentType;
    contentId: string;
    content: ContentSnapshot;
    author: UserInfo;
    reporter?: UserInfo;
    currentState: string;
    stateHistory: StateHistoryEntry;
    category: ModerationCategory;
    severity: ModerationSeverity;
    priority: ModerationPriority;
    flags: ModerationFlag;
    assignedTo?: string;
    reviewers: ReviewerAssignment;
    escalationLevel: number;
    autoProcessing: AutoProcessingStatus;
    aiAnalysis?: AIAnalysisResult;
    complianceChecks: ComplianceCheck;
    legalReview?: LegalReviewStatus;
    processingMetrics: ProcessingMetrics;
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    resolvedAt?: Date;
    archivedAt?: Date;
}
export interface StateHistoryEntry {
    id: string;
    fromState?: string;
    toState: string;
    transitionType: TransitionType;
    triggeredBy: string;
    reason: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    duration?: number;
}
export interface StateTransition {
    id: string;
    name: string;
    fromStates: string;
    toState: string;
    type: TransitionType;
    conditions: TransitionCondition;
    actions: TransitionAction;
    permissions: TransitionPermissions;
    validation: ValidationRules;
    automation: AutomationRules;
}
export interface TransitionCondition {
    type: 'user_role' | 'severity_level' | 'escalation_level' | 'time_elapsed' | 'flag_count' | 'ai_confidence' | 'custom';
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches_regex';
    value: any;
    description: string;
}
export interface TransitionAction {
    type: 'assign_reviewer' | 'send_notification' | 'escalate' | 'apply_action' | 'update_metadata' | 'trigger_automation' | 'compliance_check';
    parameters: Record<string, any>;
    condition?: string;
    delay?: number;
}
export interface AutoModerationAction {
    id: string;
    name: string;
    type: AutoActionType;
    triggers: AutoActionTrigger;
    conditions: AutoActionCondition;
    actions: ModerationAction;
    confidence: {
        min: number;
        max: number;
    };
    enabled: boolean;
    cooldown?: number;
    limits: ActionLimits;
}
export interface ModerationAction {
    type: 'approve' | 'reject' | 'flag' | 'hide' | 'delete' | 'warn_user' | 'suspend_user' | 'ban_user' | 'escalate' | 'request_review';
    severity: ActionSeverity;
    duration?: number;
    reason: string;
    parameters: Record<string, any>;
    reversible: boolean;
}
export interface AIAnalysisResult {
    confidence: number;
    categories: Array<{}, category>;
    string: any;
    confidence: number;
    evidence: string;
}
export interface ComplianceCheck {
    id: string;
    type: ComplianceType;
    status: 'pending' | 'passed' | 'failed' | 'requires_review';
    details: ComplianceDetails;
    checkedAt?: Date;
    checkedBy?: string;
    validUntil?: Date;
}
export interface ProcessingMetrics {
    timeToFirstReview?: number;
    timeToResolution?: number;
    reviewerCount: number;
    escalationCount: number;
    stateChangeCount: number;
    automationActions: number;
    manualActions: number;
    averageConfidence?: number;
}
export type ModerationStateType = 'initial' | 'processing' | 'escalated' | 'resolved' | 'archived' | 'system';
export type ModerationCategory = 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'adult_content' | 'misinformation' | 'copyright' | 'privacy' | 'fraud' | 'legal' | 'quality' | 'other';
export type ModerationSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type ModerationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';
export type ContentType = 'post' | 'comment' | 'message' | 'profile' | 'media' | 'document';
export type TransitionType = 'manual' | 'automatic' | 'scheduled' | 'conditional';
export type AutoActionType = 'content_filter' | 'behavior_pattern' | 'volume_threshold' | 'reputation_score' | 'ml_classification' | 'rule_based';
export type ActionSeverity = 'advisory' | 'restrictive' | 'punitive' | 'protective';
export type ComplianceType = 'gdpr' | 'coppa' | 'dmca' | 'legal_hold' | 'data_retention' | 'accessibility' | 'industry_specific';
export interface UserInfo {
    id: string;
    username: string;
    email?: string;
    role: string;
    reputation: number;
    joinDate: Date;
    moderationHistory: {
        totalReports: number;
        confirmedViolations: number;
        falseReports: number;
        lastViolation?: Date;
    };
}
export interface ContentSnapshot {
    originalContent: string;
    currentContent: string;
    metadata: Record<string, any>;
    attachments: Array<{}, type>;
    string: any;
    url: string;
    size: number;
    checksum: string;
}
export interface ModerationFlag {
    id: string;
    type: string;
    source: 'user_report' | 'auto_detection' | 'manual_review' | 'ai_analysis';
    confidence: number;
    description: string;
    evidence: FlagEvidence;
    reportedBy?: string;
    reportedAt: Date;
}
export interface FlagEvidence {
    type: 'text_match' | 'pattern_match' | 'behavior_anomaly' | 'user_report' | 'ai_classification';
    details: Record<string, any>;
    confidence: number;
    source: string;
}
export interface ReviewerAssignment {
    reviewerId: string;
    assignedAt: Date;
    dueDate?: Date;
    status: 'assigned' | 'in_progress' | 'completed' | 'skipped';
    expertise: string;
    workload: number;
}
export interface AutoProcessingStatus {
    enabled: boolean;
    stage: 'queued' | 'analyzing' | 'processed' | 'failed' | 'skipped';
    confidence: number;
    lastProcessed?: Date;
    nextProcessing?: Date;
    attempts: number;
    errors: ProcessingError;
}
export interface ProcessingError {
    timestamp: Date;
    error: string;
    stage: string;
    retryable: boolean;
    context?: Record<string, any>;
}
export interface LegalReviewStatus {
    required: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'expedited';
    assignedLawyer?: string;
    priority: 'routine' | 'urgent' | 'emergency';
    deadline?: Date;
    notes?: string;
    completedAt?: Date;
}
export interface StatePermissions {
    canView: string;
    canEdit: string;
    canTransition: string;
    canAssign: string;
    canEscalate: string;
    restrictions: PermissionRestriction;
}
export interface PermissionRestriction {
    type: 'time_based' | 'condition_based' | 'approval_required';
    parameters: Record<string, any>;
    description: string;
}
export interface TransitionPermissions {
    requiredRoles: string;
    requiredPermissions: string;
    approvalRequired?: boolean;
    approvers?: string;
    conditions: PermissionCondition;
}
export interface PermissionCondition {
    type: 'user_level' | 'content_sensitivity' | 'escalation_level' | 'time_constraint';
    parameters: Record<string, any>;
    description: string;
}
export interface ValidationRules {
    required?: string;
    constraints?: ValidationConstraint;
    customValidators?: CustomValidator;
}
export interface ValidationConstraint {
    field: string;
    type: 'presence' | 'format' | 'length' | 'value_range' | 'custom';
    parameters: Record<string, any>;
    message: string;
}
export interface CustomValidator {
    name: string;
    function: string;
    parameters: Record<string, any>;
    message: string;
}
export interface AutomationRules {
    triggers: AutomationTrigger;
    conditions: AutomationCondition;
    actions: AutomationAction;
    delays?: number;
    retries?: number;
}
export interface AutomationTrigger {
    type: 'time_based' | 'event_based' | 'condition_met';
    parameters: Record<string, any>;
    description: string;
}
export interface AutomationCondition {
    type: 'field_value' | 'time_elapsed' | 'external_api' | 'user_action';
    parameters: Record<string, any>;
    description: string;
}
export interface AutomationAction {
    type: 'state_transition' | 'notification' | 'assignment' | 'escalation' | 'external_api';
    parameters: Record<string, any>;
    description: string;
}
export interface AutoActionTrigger {
    type: 'content_created' | 'content_updated' | 'user_reported' | 'threshold_exceeded' | 'pattern_detected';
    parameters: Record<string, any>;
    description: string;
}
export interface AutoActionCondition {
    type: 'content_analysis' | 'user_history' | 'volume_check' | 'reputation_score' | 'time_pattern';
    parameters: Record<string, any>;
    threshold: number;
    description: string;
}
export interface ActionLimits {
    maxActionsPerHour?: number;
    maxActionsPerDay?: number;
    maxActionsPerUser?: number;
    cooldownPeriod?: number;
    escalationThreshold?: number;
}
export interface ModerationStateMetadata {
    description: string;
    guidelines: string;
    examples: string;
    slaTarget?: number;
    escalationTimeout?: number;
    autoArchiveAfter?: number;
    tags: string;
    version: string;
    isTemplate: boolean;
    templateParameters?: Record<string, any>;
}
export interface ComplianceDetails {
    regulation: string;
    requirements: string;
    evidence: ComplianceEvidence;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigationActions: string;
    documentation: DocumentationReference;
}
export interface ComplianceEvidence {
    type: 'document' | 'log_entry' | 'user_action' | 'system_record';
    reference: string;
    description: string;
    timestamp: Date;
    verifiedBy?: string;
}
export interface DocumentationReference {
    type: 'policy' | 'procedure' | 'legal_document' | 'audit_report';
    title: string;
    reference: string;
    version: string;
    url?: string;
}
export interface ModerationStats {
    totalItems: number;
    byState: Record<string, number>;
    byCategory: Record<ModerationCategory, number>;
    bySeverity: Record<ModerationSeverity, number>;
    byPriority: Record<ModerationPriority, number>;
    processingMetrics: {
        averageResolutionTime: number;
        averageReviewTime: number;
        escalationRate: number;
        automationRate: number;
        accuracyRate: number;
    };
    performance: {
        itemsProcessedToday: number;
        itemsResolvedToday: number;
        backlogSize: number;
        overdueTasks: number;
        slaCompliance: number;
    };
    compliance: {
        checksPassed: number;
        checksFailed: number;
        requiresReview: number;
        legalReviewsPending: number;
    };
    automation: {
        autoActionsTriggered: number;
        autoResolutions: number;
        falsePositives: number;
        manualOverrides: number;
        confidenceDistribution: Record<string, number>;
    };
}
export interface ModerationFilter {
    states?: string;
    categories?: ModerationCategory;
    severities?: ModerationSeverity;
    priorities?: ModerationPriority;
    assignees?: string;
    reporters?: string;
    authors?: string;
    contentTypes?: ContentType;
    flags?: string;
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    searchQuery?: string;
    hasAIAnalysis?: boolean;
    requiresLegalReview?: boolean;
    isOverdue?: boolean;
    escalationLevel?: number;
    autoProcessed?: boolean;
}
export declare class ModerationStatesService {
    private static instance;
    private states;
    private items;
    private transitions;
    private autoActions;
    private listeners;
    private processor;
    private constructor();
    static getInstance(): ModerationStatesService;
}
//# sourceMappingURL=ModerationStatesService.d.ts.map