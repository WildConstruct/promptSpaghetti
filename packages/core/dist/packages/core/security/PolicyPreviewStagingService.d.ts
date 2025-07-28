import { PolicyType, PolicyUpdateRequest, PolicyVersion, PolicyDeployment, DeploymentType, DeploymentStatus, ValidationType, ValidationStatus, RiskLevel, UpdatePriority, VersionStatus } from '../../../server/src/services/PolicyUpdateWorkflowService';
export { PolicyType, PolicyUpdateRequest, PolicyVersion, PolicyDeployment, DeploymentType, DeploymentStatus, ValidationType, ValidationStatus, RiskLevel, UpdatePriority, VersionStatus };
export interface PolicyPreviewConfig {
    enableStagingEnvironments: boolean;
    enableImpactSimulation: boolean;
    enableUserTestingGroups: boolean;
    enableAutomaticRollback: boolean;
    previewRetentionDays: number;
    maxConcurrentPreviews: number;
    stagingEnvironments: StagingEnvironment;
    defaultValidations: ValidationType;
}
export interface StagingEnvironment {
    environmentId: string;
    name: string;
    description: string;
    type: EnvironmentType;
    isolated: boolean;
    userGroups: string;
    maxActiveDeployments: number;
    autoCleanupHours: number;
    monitoringEnabled: boolean;
    features: EnvironmentFeature;
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
    PREVIEW = "PREVIEW",
    export,
    interface,
    PolicyPreview
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
    EXPIRED = "EXPIRED",
    export,
    interface,
    StagingDeployment
}
export declare enum StagingDeploymentStatus {
    DEPLOYING = "DEPLOYING",
    ACTIVE = "ACTIVE",
    MONITORING = "MONITORING",
    ISSUE_DETECTED = "ISSUE_DETECTED",
    ROLLING_BACK = "ROLLING_BACK",
    ROLLED_BACK = "ROLLED_BACK",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    export,
    interface,
    StagingMetrics
}
export interface StagingIssue {
    issueId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: IssueCategory;
    description: string;
    detectedAt: Date;
    affectedUsers: string;
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
    TECHNICAL = "TECHNICAL",
    export,
    enum,
    IssueStatus
}
//# sourceMappingURL=PolicyPreviewStagingService.d.ts.map