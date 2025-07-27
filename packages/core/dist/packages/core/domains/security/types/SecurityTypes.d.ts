/**
 * Security Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Type definitions for the security domain
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: Permission[];
    status: UserStatus;
    profile: UserProfile;
    security: UserSecurityInfo;
    metadata: UserMetadata;
}
export interface UserRole {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isSystemRole: boolean;
    hierarchy: number;
    inheritsFrom?: string[];
}
export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: PermissionAction;
    scope: PermissionScope;
    conditions?: PermissionCondition[];
}
export type PermissionAction = 'read' | 'write' | 'delete' | 'admin' | 'execute' | 'manage';
export type PermissionScope = 'global' | 'organization' | 'team' | 'project' | 'self';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'locked';
export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    timezone: string;
    locale: string;
    preferences: Record<string, any>;
}
export interface UserSecurityInfo {
    lastLogin?: Date;
    lastPasswordChange: Date;
    failedLoginAttempts: number;
    mfaEnabled: boolean;
    mfaMethod?: 'totp' | 'sms' | 'email';
    securityQuestions: SecurityQuestion[];
    trustedDevices: TrustedDevice[];
}
export interface UserMetadata {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
}
export interface SecurityQuestion {
    id: string;
    question: string;
    answerHash: string;
    createdAt: Date;
}
export interface TrustedDevice {
    id: string;
    deviceId: string;
    deviceName: string;
    userAgent: string;
    ipAddress: string;
    location?: string;
    trustedAt: Date;
    lastUsed: Date;
}
export interface AccessRequest {
    userId: string;
    resource: string;
    action: PermissionAction;
    context?: AccessContext;
    timestamp: Date;
}
export interface AccessContext {
    ipAddress: string;
    userAgent: string;
    location?: string;
    deviceId?: string;
    sessionId: string;
    requestId: string;
}
export interface AccessResponse {
    granted: boolean;
    reason?: string;
    conditions?: string[];
    expiresAt?: Date;
    auditId: string;
}
export interface PermissionCondition {
    type: 'time' | 'location' | 'device' | 'custom';
    operator: 'equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
    value: any;
    description: string;
}
export interface AuditLog {
    id: string;
    userId?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    details: AuditDetails;
    outcome: AuditOutcome;
    timestamp: Date;
    metadata: AuditMetadata;
}
export type AuditAction = 'login' | 'logout' | 'password_change' | 'permission_grant' | 'permission_revoke' | 'resource_access' | 'resource_create' | 'resource_update' | 'resource_delete' | 'security_violation' | 'data_export' | 'config_change' | 'system_action';
export type AuditOutcome = 'success' | 'failure' | 'blocked' | 'warning';
export interface AuditDetails {
    description: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    additionalData?: Record<string, any>;
}
export interface AuditMetadata {
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
    requestId: string;
    deviceId?: string;
    location?: string;
    riskScore?: number;
}
export interface SecurityAlert {
    id: string;
    type: SecurityAlertType;
    severity: SecuritySeverity;
    title: string;
    description: string;
    source: string;
    details: SecurityAlertDetails;
    status: AlertStatus;
    userId?: string;
    timestamp: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolution?: string;
}
export type SecurityAlertType = 'authentication_failure' | 'privilege_escalation' | 'data_breach' | 'suspicious_activity' | 'policy_violation' | 'malware_detected' | 'vulnerability_detected' | 'compliance_violation' | 'system_intrusion';
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export interface SecurityAlertDetails {
    affectedResources: string[];
    riskScore: number;
    indicators: SecurityIndicator[];
    timeline: SecurityEvent[];
    recommendations: string[];
    relatedAlerts: string[];
}
export interface SecurityIndicator {
    type: string;
    value: string;
    confidence: number;
    source: string;
}
export interface SecurityEvent {
    timestamp: Date;
    event: string;
    details: string;
}
export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    type: PolicyType;
    rules: PolicyRule[];
    enforcement: PolicyEnforcement;
    scope: PolicyScope;
    status: PolicyStatus;
    metadata: PolicyMetadata;
}
export type PolicyType = 'password' | 'access' | 'data' | 'network' | 'compliance' | 'custom';
export type PolicyEnforcement = 'strict' | 'warn' | 'log' | 'disabled';
export type PolicyScope = 'global' | 'organization' | 'team' | 'project';
export type PolicyStatus = 'active' | 'draft' | 'deprecated' | 'disabled';
export interface PolicyRule {
    id: string;
    name: string;
    condition: string;
    action: PolicyAction;
    parameters: Record<string, any>;
    enabled: boolean;
}
export interface PolicyAction {
    type: 'allow' | 'deny' | 'require_approval' | 'log' | 'notify';
    parameters: Record<string, any>;
}
export interface PolicyMetadata {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
    complianceFrameworks: string[];
}
export interface DataClassification {
    id: string;
    name: string;
    level: ClassificationLevel;
    description: string;
    handlingRules: DataHandlingRule[];
    retentionPolicy: RetentionPolicy;
    accessControls: ClassificationAccessControl[];
}
export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
export interface DataHandlingRule {
    type: 'storage' | 'transmission' | 'processing' | 'disposal';
    requirements: string[];
    restrictions: string[];
    approvals: string[];
}
export interface RetentionPolicy {
    retentionPeriod: number;
    retentionUnit: 'days' | 'months' | 'years';
    disposalMethod: 'secure_delete' | 'archive' | 'anonymize';
    legalHoldExempt: boolean;
}
export interface ClassificationAccessControl {
    role: string;
    permissions: PermissionAction[];
    conditions: PermissionCondition[];
}
export interface EncryptionConfig {
    algorithm: string;
    keySize: number;
    mode: string;
    keyRotationInterval: number;
    keyEscrow: boolean;
}
export interface SecurityMetrics {
    authentication: {
        successfulLogins: number;
        failedLogins: number;
        mfaAdoption: number;
        passwordCompliance: number;
    };
    authorization: {
        accessViolations: number;
        privilegeEscalations: number;
        permissionChanges: number;
    };
    monitoring: {
        alertsGenerated: number;
        alertsResolved: number;
        averageResolutionTime: number;
        falsePositiveRate: number;
    };
    compliance: {
        policyViolations: number;
        complianceScore: number;
        auditFindings: number;
        remediationTime: number;
    };
}
export interface SecurityDomainEvents {
    onUserAuthenticated: (user: User, context: AccessContext) => void;
    onAuthenticationFailed: (attempt: AccessRequest, reason: string) => void;
    onAccessGranted: (request: AccessRequest, response: AccessResponse) => void;
    onAccessDenied: (request: AccessRequest, response: AccessResponse) => void;
    onSecurityViolation: (violation: SecurityAlert) => void;
    onPolicyViolation: (policy: SecurityPolicy, violation: PolicyRule) => void;
    onAuditLogCreated: (auditLog: AuditLog) => void;
    onPermissionChanged: (userId: string, oldPermissions: Permission[], newPermissions: Permission[]) => void;
    onSecurityMetricsUpdated: (metrics: SecurityMetrics) => void;
}
export interface SecurityDomainState {
    currentUser: User | null;
    userPermissions: Permission[];
    activeSession: UserSession | null;
    securityAlerts: SecurityAlert[];
    auditLogs: AuditLog[];
    securityPolicies: SecurityPolicy[];
    metrics: SecurityMetrics;
    loading: boolean;
    error: string | null;
}
export interface UserSession {
    id: string;
    userId: string;
    deviceId: string;
    ipAddress: string;
    userAgent: string;
    startedAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    riskScore: number;
    flags: SessionFlag[];
}
export interface SessionFlag {
    type: 'suspicious' | 'elevated_risk' | 'new_device' | 'unusual_location';
    reason: string;
    timestamp: Date;
}
export interface SecurityDashboardProps {
    userId: string;
    permissions: Permission[];
    onSecurityEvent?: (event: SecurityAlert) => void;
    className?: string;
}
export interface AccessControlProps {
    resource: string;
    action: PermissionAction;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    className?: string;
}
export interface AuditLogViewerProps {
    userId?: string;
    resource?: string;
    actions?: AuditAction[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    onLogSelect?: (log: AuditLog) => void;
    className?: string;
}
//# sourceMappingURL=SecurityTypes.d.ts.map