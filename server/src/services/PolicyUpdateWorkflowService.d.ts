import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
}
}
export interface PolicyUpdateRequest {
    requestId: string;
    policyId: string;
    policyType: PolicyType;
    currentVersion: string;
    proposedVersion: string;
    title: string;
    description: string;
    changes: PolicyChange[];
    justification: string;
    impactAssessment: ImpactAssessment;
    requestorId: string;
    requestorRole: string;
    priority: UpdatePriority;
    effectiveDate: Date;
    reviewRequirements: ReviewRequirement[];
    approvalWorkflow: ApprovalWorkflow;
    status: UpdateStatus;
    submittedAt: Date;
    metadata: Record<string, any>;
}
}
}
}
}
export interface PolicyChange {
    changeId: string;
    changeType: ChangeType;
    section: string;
    oldContent: string;
    newContent: string;
    rationale: string;
    legalBasis?: string;
    affectedUsers: string[];
    breakingChange: boolean;
}
}
}
}
}
export interface ImpactAssessment {
    userImpact: UserImpact;
    systemImpact: SystemImpact;
    complianceImpact: ComplianceImpact;
    riskAssessment: RiskAssessment;
    mitigationStrategies: string[];
    rollbackPlan: string;
}
}
}
}
}
export interface UserImpact {
    affectedUserCount: number;
    userSegments: string[];
    requiresReacceptance: boolean;
    notificationRequired: boolean;
    trainingRequired: boolean;
    communicationPlan: string;
}
}
}
}
}
export interface SystemImpact {
    affectedSystems: string[];
    configurationChanges: string[];
    dataProcessingChanges: string[];
    integrationImpacts: string[];
    performanceImpact: PerformanceImpact;
    securityImplications: string[];
}
}
}
}
}
export interface ComplianceImpact {
    regulatoryFrameworks: string[];
    complianceRequirements: string[];
    auditTrailRequirements: string[];
    reportingChanges: string[];
    certificationImpacts: string[];
}
}
}
}
}
export interface RiskAssessment {
    riskLevel: RiskLevel;
    identifiedRisks: Risk[];
    mitigationMeasures: string[];
    residualRisk: RiskLevel;
    acceptanceCriteria: string[];
}
}
}
}
}
export interface Risk {
    riskId: string;
    description: string;
    category: RiskCategory;
    probability: RiskProbability;
    impact: RiskImpact;
    severity: RiskSeverity;
    mitigation: string;
}
}
}
}
}
export interface PerformanceImpact {
    expectedLoadIncrease: number;
    storageRequirements: number;
    processingOverhead: number;
    networkImpact: string;
    scalabilityConsiderations: string[];
}
}
}
}
}
export interface ReviewRequirement {
    reviewType: ReviewType;
    reviewerRole: string;
    requiredQualifications: string[];
    estimatedHours: number;
    dependencies: string[];
    deadline: Date;
}
}
}
}
}
export interface ApprovalWorkflow {
    workflowId: string;
    stages: ApprovalStage[];
    currentStageIndex: number;
    escalationRules: EscalationRule[];
    timeoutSettings: TimeoutSettings;
}
}
}
}
}
export interface ApprovalStage {
    stageId: string;
    stageName: string;
    approvers: Approver[];
    approvalType: ApprovalType;
    requiredApprovals: number;
    timeoutHours: number;
    status: StageStatus;
    startedAt?: Date;
    completedAt?: Date;
    conditions: string[];
}
}
}
}
}
export interface Approver {
    approverId: string;
    approverRole: string;
    status: ApprovalStatus;
    decision?: ApprovalDecision;
    comments?: string;
    decidedAt?: Date;
    qualifications: string[];
}
}
}
}
}
export interface EscalationRule {
    condition: EscalationCondition;
    action: EscalationAction;
    escalateTo: string[];
    delayHours: number;
}
}
}
}
}
export interface TimeoutSettings {
    stageTimeoutHours: number;
    workflowTimeoutDays: number;
    reminderIntervalHours: number;
    autoEscalate: boolean;
}
}
}
}
}
export interface PolicyVersion {
    versionId: string;
    policyId: string;
    version: string;
    content: string;
    contentHash: string;
    effectiveDate: Date;
    expirationDate?: Date;
    status: VersionStatus;
    approvedBy: string[];
    approvedAt: Date;
    publishedAt?: Date;
    archivedAt?: Date;
    changelog: string;
    previousVersion?: string;
    metadata: Record<string, any>;
}
}
}
}
}
export interface PolicyDeployment {
    deploymentId: string;
    policyVersionId: string;
    deploymentType: DeploymentType;
    targetEnvironments: string[];
    rolloutStrategy: RolloutStrategy;
    schedule: DeploymentSchedule;
    status: DeploymentStatus;
    startedAt?: Date;
    completedAt?: Date;
    rollbackVersion?: string;
    validationResults: ValidationResult[];
}
}
}
}
}
export interface ValidationResult {
    validationType: ValidationType;
    status: ValidationStatus;
    findings: string[];
    recommendations: string[];
    validatedAt: Date;
    validatorId: string;
}
}
}
}
}
export interface DeploymentSchedule {
    phases: DeploymentPhase[];
    rollbackTriggers: string[];
    successCriteria: string[];
    monitoringPeriod: number;
}
}
}
}
}
export interface DeploymentPhase {
    phaseId: string;
    phaseName: string;
    targetPercentage: number;
    duration: number;
    successThreshold: number;
    rollbackThreshold: number;
    validationChecks: string[];
}
}
}
}
}
export interface RolloutStrategy {
    strategyType: RolloutType;
    parameters: Record<string, any>;
    canaryPercentage?: number;
    blueGreenConfig?: BlueGreenConfig;
    featureFlagConfig?: FeatureFlagConfig;
}
}
}
}
}
export interface BlueGreenConfig {
    environmentA: string;
    environmentB: string;
    switchoverCriteria: string[];
    rollbackTime: number;
}
}
}
}
}
export interface FeatureFlagConfig {
    flagName: string;
    defaultValue: boolean;
    rolloutRules: RolloutRule[];
    killSwitchEnabled: boolean;
}
}
}
}
}
export interface RolloutRule {
    ruleId: string;
    condition: string;
    percentage: number;
    userSegments: string[];
}
}
}
export declare enum PolicyType {
    PRIVACY_POLICY = "PRIVACY_POLICY",
    TERMS_OF_SERVICE = "TERMS_OF_SERVICE",
    DATA_PROCESSING = "DATA_PROCESSING",
    COOKIE_POLICY = "COOKIE_POLICY",
    SECURITY_POLICY = "SECURITY_POLICY",
    RETENTION_POLICY = "RETENTION_POLICY",
    ACCESS_POLICY = "ACCESS_POLICY",
    COMPLIANCE_POLICY = "COMPLIANCE_POLICY"
}
export declare enum ChangeType {
    ADDITION = "ADDITION",
    MODIFICATION = "MODIFICATION",
    DELETION = "DELETION",
    RESTRUCTURE = "RESTRUCTURE",
    CLARIFICATION = "CLARIFICATION"
}
export declare enum UpdatePriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
    EMERGENCY = "EMERGENCY"
}
export declare enum UpdateStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    DEPLOYED = "DEPLOYED",
    ACTIVE = "ACTIVE",
    SUPERSEDED = "SUPERSEDED"
}
export declare enum RiskLevel {
    VERY_LOW = "VERY_LOW",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    VERY_HIGH = "VERY_HIGH"
}
export declare enum RiskCategory {
    COMPLIANCE = "COMPLIANCE",
    SECURITY = "SECURITY",
    OPERATIONAL = "OPERATIONAL",
    FINANCIAL = "FINANCIAL",
    REPUTATIONAL = "REPUTATIONAL"
}
export declare enum RiskProbability {
    VERY_LOW = "VERY_LOW",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    VERY_HIGH = "VERY_HIGH"
}
export declare enum RiskImpact {
    NEGLIGIBLE = "NEGLIGIBLE",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum RiskSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum ReviewType {
    LEGAL_REVIEW = "LEGAL_REVIEW",
    COMPLIANCE_REVIEW = "COMPLIANCE_REVIEW",
    TECHNICAL_REVIEW = "TECHNICAL_REVIEW",
    BUSINESS_REVIEW = "BUSINESS_REVIEW",
    SECURITY_REVIEW = "SECURITY_REVIEW",
    PRIVACY_REVIEW = "PRIVACY_REVIEW"
}
export declare enum ApprovalType {
    UNANIMOUS = "UNANIMOUS",
    MAJORITY = "MAJORITY",
    ANY = "ANY",
    QUORUM = "QUORUM"
}
export declare enum StageStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    TIMEOUT = "TIMEOUT"
}
export declare enum ApprovalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    DELEGATED = "DELEGATED"
}
export declare enum ApprovalDecision {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    APPROVED_WITH_CONDITIONS = "APPROVED_WITH_CONDITIONS"
}
export declare enum EscalationCondition {
    TIMEOUT = "TIMEOUT",
    REJECTION = "REJECTION",
    HIGH_PRIORITY = "HIGH_PRIORITY"
}
export declare enum EscalationAction {
    NOTIFY_SUPERVISOR = "NOTIFY_SUPERVISOR",
    REASSIGN = "REASSIGN",
    AUTO_APPROVE = "AUTO_APPROVE"
}
export declare enum VersionStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    ACTIVE = "ACTIVE",
    SUPERSEDED = "SUPERSEDED",
    ARCHIVED = "ARCHIVED"
}
export declare enum DeploymentType {
    IMMEDIATE = "IMMEDIATE",
    SCHEDULED = "SCHEDULED",
    PHASED = "PHASED",
    CANARY = "CANARY",
    BLUE_GREEN = "BLUE_GREEN"
}
export declare enum DeploymentStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    ROLLED_BACK = "ROLLED_BACK"
}
export declare enum ValidationType {
    SYNTAX = "SYNTAX",
    LEGAL = "LEGAL",
    COMPLIANCE = "COMPLIANCE",
    ACCESSIBILITY = "ACCESSIBILITY",
    INTEGRATION = "INTEGRATION"
}
export declare enum ValidationStatus {
    PASS = "PASS",
    FAIL = "FAIL",
    WARNING = "WARNING",
    SKIP = "SKIP"
}
export declare enum RolloutType {
    IMMEDIATE = "IMMEDIATE",
    CANARY = "CANARY",
    BLUE_GREEN = "BLUE_GREEN",
    FEATURE_FLAG = "FEATURE_FLAG",
    PHASED = "PHASED"
}
export declare class PolicyUpdateWorkflowService {
    private db;
    private audit;
    constructor(db: DatabaseService, audit: AuditService);
    /**
     * Submit a new policy update request
     */
    submitPolicyUpdateRequest(request: Omit<PolicyUpdateRequest, 'requestId' | 'submittedAt' | 'status'>): Promise<{
        requestId: string;
    }>;
    /**
     * Process approval decision
     */
    processApprovalDecision(
      requestId: string,
      approverId: string,
      decision: ApprovalDecision,
      comments?: string
    ): Promise<{
        workflowComplete: boolean;
        approved: boolean;
    }>;
    /**
     * Deploy approved policy update
     */
    deployPolicyUpdate(
      requestId: string,
      deploymentConfig: Omit<PolicyDeployment,
      'deploymentId' | 'status' | 'startedAt'>
    ): Promise<{
        deploymentId: string;
    }>;
    /**
     * Get pending approvals for a user
     */
    getPendingApprovals(approverId: string): Promise<PolicyUpdateRequest[]>;
    /**
     * Get policy update history
     */
    getPolicyUpdateHistory(policyId: string): Promise<PolicyUpdateRequest[]>;
    private validateUpdateRequest;
    private enhanceImpactAssessment;
    private determineApprovalWorkflow;
    private startApprovalWorkflow;
    private startApprovalStage;
    private updateApproverDecision;
    private checkStageCompletion;
    private rejectPolicyUpdate;
    private approvePolicyUpdate;
    private createPolicyVersion;
    private validateDeploymentConfig;
    private executeDeployment;
    private notifyApprover;
    private generateChangelog;
    private calculateContentHash;
    private generateRequestId;
    private generateVersionId;
    private generateDeploymentId;
    private getPolicyUpdateRequest;
    private mapToPolicyUpdateRequest;
}
//# sourceMappingURL=PolicyUpdateWorkflowService.d.ts.map