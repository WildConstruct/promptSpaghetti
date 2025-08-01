/**
 * Security Dashboard Policies
 *
 * Comprehensive policy management system for security dashboards with role-based access control,
 * data classification awareness, and compliance framework integration. Manages what security
 * information is visible to whom and under what conditions.
 *
 * Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114712019-3E638C - Create security dashboard policies
 */
import { EventEmitter } from 'events';
import { 
  DataClassificationLevel,
  DataOperation
} from '../../../../packages/core/security/DataClassificationAccessControl';
export declare enum DashboardRole {
    VIEWER = "VIEWER",
    ANALYST = "ANALYST",
    SECURITY_OFFICER = "SECURITY_OFFICER",
    ADMIN = "ADMIN",
    COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER",
    AUDITOR = "AUDITOR",
    EXECUTIVE = "EXECUTIVE"
}
export declare enum DashboardPermission {
    VIEW_ALERTS = "VIEW_ALERTS",
    ACKNOWLEDGE_ALERTS = "ACKNOWLEDGE_ALERTS",
    RESOLVE_ALERTS = "RESOLVE_ALERTS",
    ASSIGN_ALERTS = "ASSIGN_ALERTS",
    DELETE_ALERTS = "DELETE_ALERTS",
    VIEW_METRICS = "VIEW_METRICS",
    EXPORT_METRICS = "EXPORT_METRICS",
    CREATE_REPORTS = "CREATE_REPORTS",
    SCHEDULE_REPORTS = "SCHEDULE_REPORTS",
    VIEW_SYSTEM_HEALTH = "VIEW_SYSTEM_HEALTH",
    VIEW_THREAT_INTELLIGENCE = "VIEW_THREAT_INTELLIGENCE",
    VIEW_USER_BEHAVIOR = "VIEW_USER_BEHAVIOR",
    VIEW_COMPLIANCE_DATA = "VIEW_COMPLIANCE_DATA",
    MANAGE_RULES = "MANAGE_RULES",
    MANAGE_CHANNELS = "MANAGE_CHANNELS",
    MANAGE_USERS = "MANAGE_USERS",
    MANAGE_POLICIES = "MANAGE_POLICIES",
    VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
    VIEW_SENSITIVE_DATA = "VIEW_SENSITIVE_DATA",
    PERFORM_INVESTIGATIONS = "PERFORM_INVESTIGATIONS"
}
export declare enum DataSensitivityLevel {
    PUBLIC = "PUBLIC",
    INTERNAL = "INTERNAL",
    CONFIDENTIAL = "CONFIDENTIAL",
    RESTRICTED = "RESTRICTED",
    TOP_SECRET = "TOP_SECRET"
}
}
}
}
export interface DashboardPolicy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    roles: DashboardRole[];
    permissions: DashboardPermission[];
    workspaceIds?: string[];
    projectIds?: string[];
    maxDataClassification: DataClassificationLevel;
    maxSensitivityLevel: DataSensitivityLevel;
    allowedOperations: DataOperation[];
    accessSchedule?: AccessSchedule;
    sessionTimeout?: number;
    contentFilters: ContentFilter[];
    dataRetentionPolicy: DataRetentionPolicy;
    complianceFrameworks: string[];
    auditRequired: boolean;
    approvalRequired: boolean;
    conditions: PolicyCondition[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
}
}
}
}
}
}
export interface AccessSchedule {
    allowedDays: number[];
    allowedHours: {
        start: string;
        end: string;
}
}
}
    };
    timezone: string;
    exceptions: ScheduleException[];
}
}
}
}
export interface ScheduleException {
    date: string;
    type: 'ALLOW' | 'DENY';
    reason: string;
}
}
}
}
}
}
}
export interface ContentFilter {
    type: 'FIELD' | 'VALUE' | 'REGEX' | 'CLASSIFICATION' | 'KEYWORD';
    field?: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'MATCHES' | 'GREATER_THAN' | 'LESS_THAN';
    value: Error;
    action: 'HIDE' | 'MASK' | 'REDACT' | 'AGGREGATE';
    maskingPattern?: string;
}
}
}
}
}
}
}
export interface DataRetentionPolicy {
    retentionPeriod: number;
    archiveAfter: number;
    purgeAfter: number;
    complianceHolds: string[];
}
}
}
}
}
}
}
export interface PolicyCondition {
    type: 'USER_ATTRIBUTE' | 'TIME' | 'LOCATION' | 'DEVICE' | 'CONTEXT' | 'RISK_SCORE';
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
    value: Error;
    weight: number;
}
}
}
}
}
}
}
export interface PolicyEvaluationContext {
    userId: string;
    userRoles: DashboardRole[];
    userAttributes: Record<string, any>;
    workspaceId?: string;
    projectId?: string;
    sessionContext: {
        ipAddress: string;
        userAgent: string;
        timestamp: Date;
        sessionId: string;
}
}
}
    };
    requestedData: {
        type: string;
        classification: DataClassificationLevel;
        sensitivityLevel: DataSensitivityLevel;
        operations: DataOperation[];
    };
    riskScore?: number;
}
}
}
}
export interface PolicyEvaluationResult {
    allowed: boolean;
    policy: DashboardPolicy;
    permissions: DashboardPermission[];
    contentFilters: ContentFilter[];
    restrictions: PolicyRestriction[];
    auditRequired: boolean;
    sessionTimeout?: number;
    warnings: string[];
}
}
}
}
}
}
}
export interface PolicyRestriction {
    type: 'TIME_LIMIT' | 'DATA_LIMIT' | 'OPERATION_LIMIT' | 'EXPORT_DISABLED' | 'APPROVAL_REQUIRED';
    description: string;
    parameters: Record<string, any>;
}
}
}
}
}
}
}
export interface DashboardViewConfiguration {
    userId: string;
    allowedSections: string[];
    hiddenFields: string[];
    maskedFields: Record<string, string>;
    aggregatedViews: string[];
    maxDataAge: number;
    refreshInterval: number;
    exportPermissions: {
        allowExport: boolean;
        allowedFormats: string[];
        watermarkRequired: boolean;
}
}
}
    };
}
}
}
}
export interface ComplianceReport {
    id: string;
    framework: string;
    generatedAt: Date;
    generatedBy: string;
    period: {
        start: Date;
        end: Date;
}
}
}
    };
    summary: {
        totalPolicies: number;
        activePolicies: number;
        violations: number;
        warnings: number;
    };
    findings: ComplianceFinding[];
    recommendations: ComplianceRecommendation[];
    attestation: {
        attested: boolean;
        attestedBy?: string;
        attestationDate?: Date;
        comments?: string;
    };
}
}
}
}
export interface ComplianceFinding {
    id: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'VIOLATION' | 'WARNING' | 'OBSERVATION';
    policyId: string;
    description: string;
    evidence: ComplianceEvidence[];
    remediation: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED_RISK';
}
}
}
}
}
}
}
export interface ComplianceEvidence {
    type: 'AUDIT_LOG' | 'CONFIGURATION' | 'SCREENSHOT' | 'DOCUMENT';
    source: string;
    timestamp: Date;
    data: Record<string, unknown>;
    hash: string;
}
}
}
}
}
}
}
export interface ComplianceRecommendation {
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category: 'POLICY' | 'CONFIGURATION' | 'TRAINING' | 'PROCESS';
    description: string;
    implementation: string;
    impact: string;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
}
}
}
}
/**
 * Security Dashboard Policy Management System
 */
export declare class SecurityDashboardPolicies extends EventEmitter {
    private policies;
    private rolePermissions;
    private evaluationCache;
    private auditLog;
    constructor();
    /**
     * Evaluate policies for a given context
     */
    evaluatePolicies(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult[]>;
    /**
     * Get dashboard view configuration for a user
     */
    getDashboardConfiguration(
      userId: string,
      context: Partial<PolicyEvaluationContext>
    ): Promise<DashboardViewConfiguration>;
    /**
     * Create new policy
     */
    createPolicy(
      policyData: Omit<DashboardPolicy,
      'id' | 'createdAt' | 'updatedAt' | 'version'>,
      createdBy: string
    ): Promise<DashboardPolicy>;
    /**
     * Update existing policy
     */
    updatePolicy(policyId: string, updates: Partial<DashboardPolicy>, updatedBy: string): Promise<DashboardPolicy>;
    /**
     * Delete policy
     */
    deletePolicy(policyId: string, deletedBy: string): Promise<void>;
    /**
     * Get all policies
     */
    getPolicies(filters?: {
        enabled?: boolean;
        role?: DashboardRole;
        workspaceId?: string;
        projectId?: string;
    }): DashboardPolicy[];
    /**
     * Generate compliance report
     */
    generateComplianceReport(framework: string, period: {
        start: Date;
        end: Date;
    }, generatedBy: string): Promise<ComplianceReport>;
    /**
     * Apply data classification filters
     */
    applyDataFilters(
      data: Record<string,
      unknown>,
      filters: ContentFilter[],
      userContext: PolicyEvaluationContext
    ): unknown;
    private evaluatePolicy;
    private evaluateCondition;
    private compareValues;
    private mergePolicyResults;
    private buildDashboardConfiguration;
    private checkTimeRestrictions;
    private applyContentFilter;
    private applyFieldFilter;
    private applyValueFilter;
    private applyClassificationFilter;
    private applyKeywordFilter;
    private analyzePolicyCompliance;
    private analyzeGDPRCompliance;
    private analyzeSOXCompliance;
    private analyzeHIPAACompliance;
    private generateComplianceRecommendations;
    private validatePolicy;
    private initializeDefaultPolicies;
    private initializeRolePermissions;
    private getUserRoles;
    private getUserAttributes;
    private getClassificationLevel;
    private calculateRefreshInterval;
    private generateCacheKey;
    private isCacheValid;
    private cleanupEvaluationCache;
    private logPolicyEvaluation;
    private generatePolicyId;
    private generateReportId;
    private generateFindingId;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default SecurityDashboardPolicies;
//# sourceMappingURL=SecurityDashboardPolicies.d.ts.map