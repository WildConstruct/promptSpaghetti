/**
 * Policy Preview and Staging Service
 *
 * Advanced policy management system that provides preview capabilities,
 * staging environments, and safe policy testing before production deployment.
 * Implements comprehensive validation, impact simulation, and rollback mechanisms.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-98 - Implement policy preview and staging
 */
import { EventEmitter } from 'events';
import { PolicyType, PolicyUpdateRequest, PolicyVersion, PolicyDeployment, DeploymentType, DeploymentStatus, ValidationType, ValidationStatus, RiskLevel, UpdatePriority, VersionStatus } from '../../../server/src/services/PolicyUpdateWorkflowService';
export { PolicyType, PolicyUpdateRequest, PolicyVersion, PolicyDeployment, DeploymentType, DeploymentStatus, ValidationType, ValidationStatus, RiskLevel, UpdatePriority, VersionStatus };
export interface PolicyPreviewConfig {
    enableStagingEnvironments: boolean;
    enableImpactSimulation: boolean;
    enableUserTestingGroups: boolean;
    enableAutomaticRollback: boolean;
    previewRetentionDays: number;
    maxConcurrentPreviews: number;
    stagingEnvironments: StagingEnvironment[];
    defaultValidations: ValidationType[];
}
export interface StagingEnvironment {
    environmentId: string;
    name: string;
    description: string;
    type: EnvironmentType;
    isolated: boolean;
    userGroups: string[];
    maxActiveDeployments: number;
    autoCleanupHours: number;
    monitoringEnabled: boolean;
    features: EnvironmentFeature[];
}
export interface EnvironmentFeature {
    feature: string;
    enabled: boolean;
    configuration: Record<string, any>;
}
export declare enum EnvironmentType {
    DEVELOPMENT = "DEVELOPMENT",
    STAGING = "STAGING",
    TESTING = "TESTING",
    CANARY = "CANARY",
    PREVIEW = "PREVIEW"
}
export interface PolicyPreview {
    previewId: string;
    policyId: string;
    baseVersion: string;
    previewVersion: string;
    title: string;
    description: string;
    changes: PreviewChange[];
    createdBy: string;
    createdAt: Date;
    expiresAt: Date;
    status: PreviewStatus;
    stagingDeployments: StagingDeployment[];
    validationResults: PreviewValidationResult[];
    impactSimulation?: ImpactSimulation;
    userFeedback: UserFeedback[];
    metadata: Record<string, any>;
}
export interface PreviewChange {
    changeId: string;
    section: string;
    type: 'addition' | 'modification' | 'deletion' | 'reorder';
    before?: string;
    after?: string;
    reasoning: string;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
    userVisible: boolean;
    requiresConsent: boolean;
}
export declare enum PreviewStatus {
    DRAFT = "DRAFT",
    VALIDATING = "VALIDATING",
    STAGED = "STAGED",
    TESTING = "TESTING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export interface StagingDeployment {
    deploymentId: string;
    previewId: string;
    environmentId: string;
    targetUserGroups: string[];
    deployedAt: Date;
    status: StagingDeploymentStatus;
    metrics: StagingMetrics;
    issues: StagingIssue[];
    rollbackTriggers: RollbackTrigger[];
    autoRollbackEnabled: boolean;
}
export declare enum StagingDeploymentStatus {
    DEPLOYING = "DEPLOYING",
    ACTIVE = "ACTIVE",
    MONITORING = "MONITORING",
    ISSUE_DETECTED = "ISSUE_DETECTED",
    ROLLING_BACK = "ROLLING_BACK",
    ROLLED_BACK = "ROLLED_BACK",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export interface StagingMetrics {
    userInteractions: number;
    consentRates: number;
    errorRates: number;
    pageLoadTimes: number[];
    userSatisfactionScore: number;
    complianceScore: number;
    accessibilityScore: number;
    securityScore: number;
}
export interface StagingIssue {
    issueId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: IssueCategory;
    description: string;
    detectedAt: Date;
    affectedUsers: string[];
    resolution?: IssueResolution;
    status: IssueStatus;
}
export declare enum IssueCategory {
    LEGAL = "LEGAL",
    COMPLIANCE = "COMPLIANCE",
    ACCESSIBILITY = "ACCESSIBILITY",
    USABILITY = "USABILITY",
    PERFORMANCE = "PERFORMANCE",
    SECURITY = "SECURITY",
    TECHNICAL = "TECHNICAL"
}
export declare enum IssueStatus {
    DETECTED = "DETECTED",
    INVESTIGATING = "INVESTIGATING",
    CONFIRMED = "CONFIRMED",
    RESOLVED = "RESOLVED",
    IGNORED = "IGNORED"
}
export interface IssueResolution {
    resolvedBy: string;
    resolvedAt: Date;
    resolution: string;
    changeRequired: boolean;
    fixApplied: boolean;
}
export interface RollbackTrigger {
    triggerType: RollbackTriggerType;
    threshold: number;
    description: string;
    enabled: boolean;
    conditions: string[];
}
export declare enum RollbackTriggerType {
    ERROR_RATE = "ERROR_RATE",
    USER_COMPLAINTS = "USER_COMPLAINTS",
    COMPLIANCE_VIOLATION = "COMPLIANCE_VIOLATION",
    PERFORMANCE_DEGRADATION = "PERFORMANCE_DEGRADATION",
    SECURITY_INCIDENT = "SECURITY_INCIDENT",
    MANUAL_TRIGGER = "MANUAL_TRIGGER"
}
export interface PreviewValidationResult {
    validationId: string;
    validationType: ValidationType;
    status: ValidationStatus;
    score: number;
    findings: ValidationFinding[];
    recommendations: string[];
    blockers: string[];
    warnings: string[];
    validatedAt: Date;
    validatorInfo: ValidatorInfo;
}
export interface ValidationFinding {
    findingId: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    category: string;
    title: string;
    description: string;
    location: string;
    suggestion?: string;
    autoFixable: boolean;
}
export interface ValidatorInfo {
    validatorId: string;
    validatorType: 'automated' | 'human' | 'hybrid';
    version: string;
    credentials?: string[];
}
export interface ImpactSimulation {
    simulationId: string;
    scenarios: SimulationScenario[];
    results: SimulationResult[];
    confidence: number;
    simulatedAt: Date;
    duration: number;
    methodology: string;
}
export interface SimulationScenario {
    scenarioId: string;
    name: string;
    description: string;
    userSegment: string;
    userCount: number;
    simulatedActions: SimulatedAction[];
    expectedOutcomes: ExpectedOutcome[];
}
export interface SimulatedAction {
    action: string;
    parameters: Record<string, any>;
    expectedResponse: string;
    timing: number;
}
export interface ExpectedOutcome {
    metric: string;
    expectedValue: number;
    tolerance: number;
    critical: boolean;
}
export interface SimulationResult {
    scenarioId: string;
    actualOutcomes: ActualOutcome[];
    deviations: OutcomeDeviation[];
    overallScore: number;
    passedTests: number;
    failedTests: number;
    recommendations: string[];
}
export interface ActualOutcome {
    metric: string;
    actualValue: number;
    expectedValue: number;
    variance: number;
    acceptable: boolean;
}
export interface OutcomeDeviation {
    metric: string;
    deviationType: 'positive' | 'negative' | 'unexpected';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    recommendedAction: string;
}
export interface UserFeedback {
    feedbackId: string;
    userId: string;
    userSegment: string;
    feedbackType: FeedbackType;
    rating: number;
    comments: string;
    categories: FeedbackCategory[];
    submittedAt: Date;
    processed: boolean;
    actionRequired: boolean;
}
export declare enum FeedbackType {
    USABILITY = "USABILITY",
    CLARITY = "CLARITY",
    COMPLETENESS = "COMPLETENESS",
    ACCESSIBILITY = "ACCESSIBILITY",
    TRUST = "TRUST",
    GENERAL = "GENERAL"
}
export declare enum FeedbackCategory {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE",
    NEUTRAL = "NEUTRAL",
    SUGGESTION = "SUGGESTION",
    BUG_REPORT = "BUG_REPORT",
    QUESTION = "QUESTION"
}
export interface PreviewAnalytics {
    previewId: string;
    totalInteractions: number;
    uniqueUsers: number;
    averageTimeSpent: number;
    completionRate: number;
    dropOffPoints: DropOffPoint[];
    heatmapData: HeatmapData[];
    userJourney: UserJourneyStep[];
    conversionFunnel: ConversionStep[];
}
export interface DropOffPoint {
    section: string;
    dropOffRate: number;
    userCount: number;
    commonReasons: string[];
}
export interface HeatmapData {
    element: string;
    interactionType: string;
    frequency: number;
    coordinates: {
        x: number;
        y: number;
    };
}
export interface UserJourneyStep {
    step: number;
    section: string;
    userCount: number;
    averageTime: number;
    successRate: number;
}
export interface ConversionStep {
    stepName: string;
    usersEntered: number;
    usersCompleted: number;
    conversionRate: number;
    averageTime: number;
}
export interface PolicyComparisonReport {
    comparisonId: string;
    baseVersion: string;
    compareVersion: string;
    differences: PolicyDifference[];
    impactAnalysis: ComparisonImpactAnalysis;
    userImpactAssessment: UserImpactAssessment;
    complianceComparison: ComplianceComparison;
    generatedAt: Date;
}
export interface PolicyDifference {
    section: string;
    type: 'added' | 'removed' | 'modified' | 'moved';
    oldContent?: string;
    newContent?: string;
    significance: 'minor' | 'moderate' | 'major' | 'critical';
    userVisible: boolean;
    legalImplications: string[];
}
export interface ComparisonImpactAnalysis {
    overallRisk: RiskLevel;
    affectedUserSegments: string[];
    requiredActions: RequiredAction[];
    timelineRecommendations: TimelineRecommendation[];
    rollbackComplexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
}
export interface RequiredAction {
    action: string;
    priority: UpdatePriority;
    deadline: Date;
    responsible: string;
    dependencies: string[];
}
export interface TimelineRecommendation {
    phase: string;
    duration: number;
    activities: string[];
    dependencies: string[];
    risks: string[];
}
export interface UserImpactAssessment {
    totalAffectedUsers: number;
    segmentBreakdown: SegmentImpact[];
    communicationRequirements: CommunicationRequirement[];
    trainingRequirements: TrainingRequirement[];
    supportTicketEstimate: number;
}
export interface SegmentImpact {
    segment: string;
    userCount: number;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
    specificChanges: string[];
    requiredActions: string[];
}
export interface CommunicationRequirement {
    channel: string;
    audience: string;
    message: string;
    timing: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}
export interface TrainingRequirement {
    audience: string;
    trainingType: string;
    estimatedHours: number;
    materials: string[];
    deadline: Date;
}
export interface ComplianceComparison {
    frameworks: FrameworkComparison[];
    overallComplianceChange: 'improved' | 'maintained' | 'degraded';
    newRequirements: string[];
    removedRequirements: string[];
    modifiedRequirements: string[];
}
export interface FrameworkComparison {
    framework: string;
    beforeScore: number;
    afterScore: number;
    scoreDelta: number;
    impactedRequirements: string[];
    riskLevel: RiskLevel;
}
/**
 * Main Policy Preview and Staging Service
 */
export declare class PolicyPreviewStagingService extends EventEmitter {
    private config;
    private activePreviews;
    private stagingDeployments;
    private validationResults;
    constructor(config: PolicyPreviewConfig);
    /**
     * Create a new policy preview with staging capabilities
     */
    createPolicyPreview(policyId: string, baseVersion: string, changes: PreviewChange[], options: {
        title: string;
        description: string;
        createdBy: string;
        expirationDays?: number;
        enableSimulation?: boolean;
        targetEnvironments?: string[];
    }): Promise<PolicyPreview>;
    /**
     * Deploy preview to staging environment
     */
    deployToStaging(previewId: string, environmentId: string, options?: {
        targetUserGroups?: string[];
        autoRollbackEnabled?: boolean;
        monitoringDuration?: number;
    }): Promise<StagingDeployment>;
    /**
     * Run comprehensive validation on policy preview
     */
    runValidations(preview: PolicyPreview, validationTypes: ValidationType[]): Promise<PreviewValidationResult[]>;
    /**
     * Generate policy comparison report
     */
    generateComparisonReport(baseVersion: string, compareVersion: string, policyId: string): Promise<PolicyComparisonReport>;
    /**
     * Collect user feedback for preview
     */
    collectUserFeedback(previewId: string, userId: string, feedback: {
        feedbackType: FeedbackType;
        rating: number;
        comments: string;
        categories: FeedbackCategory[];
    }): Promise<UserFeedback>;
    /**
     * Get preview analytics
     */
    getPreviewAnalytics(previewId: string): Promise<PreviewAnalytics>;
    /**
     * Promote preview to production
     */
    promoteToProduction(previewId: string, options: {
        approvedBy: string;
        effectiveDate: Date;
        rolloutStrategy?: string;
    }): Promise<{
        promoted: boolean;
        productionVersion: string;
    }>;
    /**
     * Rollback staging deployment
     */
    rollbackStagingDeployment(deploymentId: string, reason: string, triggeredBy: string): Promise<{
        success: boolean;
    }>;
    private runImpactSimulation;
    private executeValidation;
    private executeStageDeployment;
    private startDeploymentMonitoring;
    private collectMetrics;
    private checkRollbackTriggers;
    private generatePreviewId;
    private generateDeploymentId;
    private generateValidationId;
    private generateComparisonId;
    private generateFeedbackId;
    private generateSimulationId;
    private generatePreviewVersion;
    private initializeMetrics;
    private createDefaultRollbackTriggers;
    private runLegalValidation;
    private runComplianceValidation;
    private runAccessibilityValidation;
    private generateRecommendations;
    private generateSimulationScenarios;
    private analyzePolicyDifferences;
    private analyzeComparisonImpact;
    private assessUserImpact;
    private compareCompliance;
    private getUserSegment;
    private aggregateAnalytics;
    private validateProductionReadiness;
    private createProductionVersion;
    private cleanupStagingDeployments;
    private executeRollback;
    private startPeriodicTasks;
}
export default PolicyPreviewStagingService;
//# sourceMappingURL=PolicyPreviewStagingService.d.ts.map