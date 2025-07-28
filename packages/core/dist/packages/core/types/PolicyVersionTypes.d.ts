/**
 * Policy Version Types - E17-1753114397372-E7CDD1
 *
 * TypeScript type definitions for the policy versioning system.
 * Part of Epic 17 - Backstage Admin Controls
 */
export interface Policy {
    id: string;
    policyKey: string;
    name: string;
    description?: string;
    category: PolicyCategory;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export type PolicyCategory = 'general' | 'content' | 'conduct' | 'privacy' | 'security' | 'compliance' | 'marketplace' | 'user_safety' | 'intellectual_property';
export interface PolicyVersion {
    id: string;
    policyId: string;
    version: string;
    majorVersion: number;
    minorVersion: number;
    patchVersion: number;
    title: string;
    content: PolicyContent;
    contentType: ContentType;
    status: PolicyStatus;
    publishedAt?: Date;
    effectiveDate?: Date;
    expirationDate?: Date;
    changeSummary?: string;
    changeType: ChangeType;
    parentVersionId?: string;
    createdBy: string;
    reviewedBy?: string;
    publishedBy?: string;
    complianceFrameworks: ComplianceFramework;
    tags: string;
    severityLevel: SeverityLevel;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export type PolicyStatus = 'draft' | 'review' | 'published' | 'deprecated' | 'archived';
export type ChangeType = 'create' | 'update' | 'fix' | 'deprecation' | 'rollback';
export type ContentType = 'markdown' | 'html' | 'json' | 'plain_text';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceFramework = 'GDPR' | 'CCPA' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO_27001' | 'content_moderation' | 'intellectual_property' | 'community_standards' | 'user_safety' | 'quality_assurance' | 'data_protection';
export interface PolicyContent {
    sections: PolicySection;
    summary?: string;
    lastModified?: Date;
    wordCount?: number;
    [key: string]: any;
}
export interface PolicySection {
    id?: string;
    title: string;
    content: string;
    order?: number;
    subsections?: PolicySection;
    metadata?: Record<string, any>;
}
export interface PolicyVersionChange {
    id: string;
    versionId: string;
    changeType: string;
    fieldPath: string;
    oldValue?: any;
    newValue?: any;
    changeReason?: string;
    createdBy: string;
    createdAt: Date;
}
export interface PolicyApproval {
    id: string;
    versionId: string;
    approverId: string;
    approvalStatus: ApprovalStatus;
    approvalType: string;
    comments?: string;
    approvedAt?: Date;
    createdAt: Date;
}
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export interface PolicyComplianceMapping {
    id: string;
    versionId: string;
    complianceFramework: ComplianceFramework;
    requirementId: string;
    requirementDescription?: string;
    complianceLevel: ComplianceLevel;
    notes?: string;
    createdAt: Date;
}
export type ComplianceLevel = 'full' | 'partial' | 'not_applicable';
export interface CreatePolicyRequest {
    policyKey: string;
    name: string;
    description?: string;
    category: PolicyCategory;
}
export interface CreatePolicyVersionRequest {
    title: string;
    content: PolicyContent;
    contentType?: ContentType;
    changeType?: ChangeType;
    changeSummary?: string;
    complianceFrameworks?: ComplianceFramework;
    tags?: string;
    severityLevel?: SeverityLevel;
    effectiveDate?: Date;
    expirationDate?: Date;
    metadata?: Record<string, any>;
}
export interface UpdatePolicyVersionRequest {
    title?: string;
    content?: PolicyContent;
    contentType?: ContentType;
    changeSummary?: string;
    complianceFrameworks?: ComplianceFramework;
    tags?: string;
    severityLevel?: SeverityLevel;
    effectiveDate?: Date;
    expirationDate?: Date;
    metadata?: Record<string, any>;
}
export interface PublishPolicyVersionRequest {
    effectiveDate?: Date;
    publishingNotes?: string;
}
export interface PolicyVersionComparison {
    fromVersion: PolicyVersion;
    toVersion: PolicyVersion;
    changes: PolicyVersionDiff;
    summary: {
        addedSections: number;
        removedSections: number;
        modifiedSections: number;
        totalChanges: number;
    };
}
export interface PolicyVersionDiff {
    type: DiffType;
    path: string;
    description: string;
    oldValue?: any;
    newValue?: any;
    impact: DiffImpact;
}
export type DiffType = 'added' | 'removed' | 'modified' | 'moved';
export type DiffImpact = 'low' | 'medium' | 'high' | 'breaking';
export interface PolicyVersionListResponse {
    versions: PolicyVersion;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    policy: Policy;
}
export interface PolicyVersionSearchQuery {
    policyId?: string;
    status?: PolicyStatus;
    complianceFrameworks?: ComplianceFramework;
    tags?: string;
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    effectiveAfter?: Date;
    effectiveBefore?: Date;
    textSearch?: string;
    page?: number;
    pageSize?: number;
    sortBy?: PolicyVersionSortField;
    sortOrder?: 'asc' | 'desc';
}
export type PolicyVersionSortField = 'version' | 'title' | 'status' | 'createdAt' | 'publishedAt' | 'effectiveDate' | 'majorVersion' | 'minorVersion' | 'patchVersion';
export interface PolicyVersionAnalytics {
    policyId: string;
    totalVersions: number;
    publishedVersions: number;
    draftVersions: number;
    averageTimeToPublish: number;
    mostActiveContributor: string;
    complianceFrameworkUsage: Record<ComplianceFramework, number>;
    versionsByMonth: Array<{}, month>;
    string: any;
    count: number;
}
export interface PolicyWorkflowState {
    currentStatus: PolicyStatus;
    allowedTransitions: PolicyStatus;
    requiredApprovals: number;
    currentApprovals: number;
    pendingReviewers: string;
    blockers: WorkflowBlocker;
}
export interface WorkflowBlocker {
    type: BlockerType;
    description: string;
    resolvable: boolean;
    resolveAction?: string;
}
export type BlockerType = 'missing_approval' | 'compliance_check_failed' | 'content_validation_error' | 'schedule_conflict' | 'dependency_not_met';
export interface PolicyVersionEvent {
    id: string;
    type: PolicyEventType;
    versionId: string;
    policyId: string;
    userId: string;
    data: Record<string, any>;
    timestamp: Date;
}
export type PolicyEventType = 'version_created' | 'version_updated' | 'version_published' | 'version_deprecated' | 'version_archived' | 'approval_requested' | 'approval_granted' | 'approval_rejected' | 'compliance_check_completed' | 'rollback_performed';
export interface PolicyVersionValidation {
    isValid: boolean;
    errors: ValidationError;
    warnings: ValidationWarning;
    complianceStatus: ComplianceValidation;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
}
export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
    suggestion?: string;
}
export interface ComplianceValidation {
    framework: ComplianceFramework;
    status: 'compliant' | 'non_compliant' | 'unknown';
    checkedRequirements: string;
    missingRequirements: string;
    notes?: string;
}
export interface PolicyVersionConfig {
    maxVersionsPerPolicy: number;
    defaultComplianceFrameworks: ComplianceFramework;
    requiredApprovals: Record<SeverityLevel, number>;
    autoArchiveAfterDays: number;
    enableAutomaticVersioning: boolean;
    versionNumberingStrategy: 'semantic' | 'sequential' | 'timestamp';
}
//# sourceMappingURL=PolicyVersionTypes.d.ts.map