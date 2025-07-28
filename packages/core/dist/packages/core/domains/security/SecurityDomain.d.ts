/**
 * Security Domain Interface
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main interface and export for the security domain
 */
import React from 'react';
import { User, Permission, AccessRequest, AccessResponse, AuditLog, SecurityAlert, SecurityPolicy, SecurityMetrics, DataClassification, UserSession, SecurityDomainEvents, SecurityDashboardProps, AccessControlProps, AuditLogViewerProps, PermissionAction, AccessContext, PolicyRule } from './types/SecurityTypes';
export interface IAuthenticationService {
    authenticate(credentials: any): Promise<{
        user: User;
        session: UserSession;
        token: string;
    }>;
    logout(sessionId: string): Promise<void>;
    validateToken(token: string): Promise<User | null>;
    refreshToken(token: string): Promise<string>;
    enableMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<void>;
    verifyMFA(userId: string, code: string): Promise<boolean>;
    resetPassword(userId: string, newPassword: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
}
export interface IAuthorizationService {
    checkPermission(userId: string, resource: string, action: PermissionAction): Promise<boolean>;
    checkPermissions(userId: string, permissions: AccessRequest): Promise<AccessResponse>;
    grantPermission(userId: string, permission: Permission): Promise<void>;
    revokePermission(userId: string, permissionId: string): Promise<void>;
    getUserPermissions(userId: string): Promise<Permission>;
    evaluatePolicy(userId: string, resource: string, action: PermissionAction, context: AccessContext): Promise<AccessResponse>;
    createRole(role: Omit<UserRole, 'id'>): Promise<UserRole>;
    assignRole(userId: string, roleId: string): Promise<void>;
    removeRole(userId: string, roleId: string): Promise<void>;
}
export interface IAuditService {
    logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
    getAuditLogs(filters?: AuditLogFilters): Promise<AuditLog>;
    getAuditLog(id: string): Promise<AuditLog>;
    generateAuditReport(criteria: AuditReportCriteria): Promise<AuditReport>;
    searchAuditLogs(query: string, filters?: AuditLogFilters): Promise<AuditLog>;
    exportAuditLogs(filters?: AuditLogFilters, format?: 'csv' | 'json' | 'pdf'): Promise<string>;
    retentionCleanup(): Promise<{
        deleted: number;
        retained: number;
    }>;
}
export interface ISecurityMonitoringService {
    getSecurityAlerts(filters?: SecurityAlertFilters): Promise<SecurityAlert>;
    createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<SecurityAlert>;
    resolveAlert(alertId: string, resolution: string): Promise<void>;
    acknowledgeAlert(alertId: string, userId: string): Promise<void>;
    getSecurityMetrics(period?: string): Promise<SecurityMetrics>;
    performSecurityScan(scope: string): Promise<SecurityScanResult>;
    analyzeRisk(userId: string, context: AccessContext): Promise<RiskAssessment>;
    detectAnomalies(userId: string, activities: any): Promise<AnomalyDetection>;
}
export interface IPolicyManagementService {
    getPolicies(type?: string): Promise<SecurityPolicy>;
    getPolicy(id: string): Promise<SecurityPolicy>;
    createPolicy(policy: Omit<SecurityPolicy, 'id'>): Promise<SecurityPolicy>;
    updatePolicy(id: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy>;
    deletePolicy(id: string): Promise<void>;
    evaluatePolicy(policy: SecurityPolicy, context: any): Promise<PolicyEvaluationResult>;
    enforcePolicy(policyId: string, violation: PolicyViolation): Promise<EnforcementAction>;
    validatePolicyRules(rules: PolicyRule): Promise<ValidationResult>;
}
export interface IDataClassificationService {
    classifyData(data: any, context?: any): Promise<DataClassification>;
    getClassifications(): Promise<DataClassification>;
    createClassification(classification: Omit<DataClassification, 'id'>): Promise<DataClassification>;
    updateClassification(id: string, updates: Partial<DataClassification>): Promise<DataClassification>;
    deleteClassification(id: string): Promise<void>;
    applyClassification(resourceId: string, classificationId: string): Promise<void>;
    validateDataHandling(data: any, operation: string): Promise<ValidationResult>;
}
export interface IEncryptionService {
    encrypt(data: string, context?: EncryptionContext): Promise<EncryptedData>;
    decrypt(encryptedData: EncryptedData): Promise<string>;
    generateKey(algorithm: string, keySize: number): Promise<CryptoKey>;
    rotateKeys(): Promise<KeyRotationResult>;
    hash(data: string, algorithm?: string): Promise<string>;
    verifyHash(data: string, hash: string): Promise<boolean>;
    generateSecureToken(length?: number): Promise<string>;
}
export interface AuditLogFilters {
    userId?: string;
    resource?: string;
    action?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    outcome?: string;
    limit?: number;
    offset?: number;
}
export interface AuditReportCriteria {
    period: {
        start: Date;
        end: Date;
    };
    scope: string;
    includeDetails: boolean;
    format: 'summary' | 'detailed' | 'compliance';
}
export interface AuditReport {
    id: string;
    criteria: AuditReportCriteria;
    summary: ReportSummary;
    findings: ReportFinding;
    recommendations: string;
    generatedAt: Date;
    generatedBy: string;
}
export interface SecurityAlertFilters {
    type?: string;
    severity?: string;
    status?: string;
    userId?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
}
export interface SecurityScanResult {
    scanId: string;
    startedAt: Date;
    completedAt: Date;
    scope: string;
    findings: SecurityFinding;
    summary: ScanSummary;
}
export interface RiskAssessment {
    userId: string;
    riskScore: number;
    factors: RiskFactor;
    recommendations: string;
    validUntil: Date;
}
export interface AnomalyDetection {
    type: string;
    description: string;
    severity: string;
    confidence: number;
    evidence: any;
    timestamp: Date;
}
export interface PolicyEvaluationResult {
    policyId: string;
    allowed: boolean;
    matchedRules: string;
    violations: PolicyViolation;
    recommendations: string;
}
export interface PolicyViolation {
    ruleId: string;
    description: string;
    severity: string;
    evidence: any;
}
export interface EnforcementAction {
    action: string;
    parameters: Record<string, any>;
    executedAt: Date;
    result: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: string;
    warnings: string;
    suggestions: string;
}
export interface EncryptionContext {
    purpose: string;
    retention: number;
    classification: string;
}
export interface EncryptedData {
    data: string;
    algorithm: string;
    keyId: string;
    iv: string;
    timestamp: Date;
}
export interface KeyRotationResult {
    rotatedKeys: number;
    failedRotations: string;
    completedAt: Date;
}
export interface ReportSummary {
    totalEvents: number;
    uniqueUsers: number;
    criticalEvents: number;
    policyViolations: number;
    timeRange: {
        start: Date;
        end: Date;
    };
}
export interface ReportFinding {
    type: string;
    severity: string;
    description: string;
    count: number;
    examples: AuditLog;
}
export interface SecurityFinding {
    type: string;
    severity: string;
    resource: string;
    description: string;
    remediation: string;
    evidence: any;
}
export interface ScanSummary {
    totalChecks: number;
    passed: number;
    failed: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
}
export interface RiskFactor {
    type: string;
    description: string;
    weight: number;
    value: any;
}
export interface ISecurityDomain {
    components: {
        SecurityDashboard: React.ComponentType<SecurityDashboardProps>;
        AccessControl: React.ComponentType<AccessControlProps>;
        AuditLogViewer: React.ComponentType<AuditLogViewerProps>;
        LoginForm: React.ComponentType<any>;
        PermissionGate: React.ComponentType<any>;
        SecurityAlerts: React.ComponentType<any>;
        RoleManager: React.ComponentType<any>;
        PolicyEditor: React.ComponentType<any>;
    };
    hooks: {
        useAuth: () => {
            user: User | null;
            permissions: Permission;
            isAuthenticated: boolean;
            login: (credentials: any) => Promise<void>;
            logout: () => Promise<void>;
            checkPermission: (resource: string, action: PermissionAction) => boolean;
        };
        usePermissions: () => {
            permissions: Permission;
            loading: boolean;
            hasPermission: (resource: string, action: PermissionAction) => boolean;
            hasRole: (roleName: string) => boolean;
            refreshPermissions: () => Promise<void>;
        };
        useAuditLogs: () => {
            logs: AuditLog;
            loading: boolean;
            error: string | null;
            fetchLogs: (filters?: AuditLogFilters) => Promise<void>;
            exportLogs: (format: string) => Promise<void>;
        };
        useSecurityAlerts: () => {
            alerts: SecurityAlert;
            unreadCount: number;
            loading: boolean;
            acknowledgeAlert: (alertId: string) => Promise<void>;
            resolveAlert: (alertId: string, resolution: string) => Promise<void>;
        };
        useSecurityMetrics: () => {
            metrics: SecurityMetrics | null;
            loading: boolean;
            refreshMetrics: () => Promise<void>;
            getMetricsForPeriod: (period: string) => Promise<SecurityMetrics>;
        };
    };
    services: {
        authentication: IAuthenticationService;
        authorization: IAuthorizationService;
        audit: IAuditService;
        monitoring: ISecurityMonitoringService;
        policyManagement: IPolicyManagementService;
        dataClassification: IDataClassificationService;
        encryption: IEncryptionService;
    };
    events: SecurityDomainEvents & {
        subscribe: (event: keyof SecurityDomainEvents, callback: Function) => () => void;
        emit: (event: keyof SecurityDomainEvents, ...args: any) => void;
    };
    utils: {
        validatePassword: (password: string) => ValidationResult;
        generateSecurePassword: (length?: number) => string;
        calculateRiskScore: (factors: RiskFactor) => number;
        formatPermission: (permission: Permission) => string;
        hashSensitiveData: (data: string) => Promise<string>;
        maskSensitiveData: (data: string, type: string) => string;
        validateCompliance: (data: any, framework: string) => ValidationResult;
    };
}
export interface SecurityDomainFactory {
    create(config?: SecurityDomainConfig): ISecurityDomain;
}
export interface SecurityDomainConfig {
    encryption: {
        algorithm: string;
        keySize: number;
        keyRotationInterval: number;
    };
    authentication: {
        sessionTimeout: number;
        maxFailedAttempts: number;
        passwordPolicy: PasswordPolicy;
    };
    audit: {
        retentionPeriod: number;
        realTimeLogging: boolean;
        includeRequestBodies: boolean;
    };
    monitoring: {
        alertThresholds: Record<string, number>;
        anomalyDetection: boolean;
        riskScoringEnabled: boolean;
    };
}
export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    prohibitCommonPasswords: boolean;
    historyCount: number;
}
export declare const SECURITY_DOMAIN_EVENTS: {
    readonly USER_AUTHENTICATED: "security:user:authenticated";
    readonly USER_LOGGED_OUT: "security:user:logged_out";
    readonly AUTHENTICATION_FAILED: "security:authentication:failed";
    readonly ACCESS_GRANTED: "security:access:granted";
    readonly ACCESS_DENIED: "security:access:denied";
    readonly PERMISSION_CHANGED: "security:permission:changed";
    readonly SECURITY_VIOLATION: "security:violation:detected";
    readonly POLICY_VIOLATION: "security:policy:violation";
    readonly AUDIT_LOG_CREATED: "security:audit:log:created";
    readonly SECURITY_ALERT: "security:alert:created";
    readonly RISK_SCORE_UPDATED: "security:risk:score:updated";
    readonly SESSION_EXPIRED: "security:session:expired";
    readonly MFA_REQUIRED: "security:mfa:required";
    readonly ENCRYPTION_KEY_ROTATED: "security:encryption:key:rotated";
};
export type SecurityDomainEventType = typeof SECURITY_DOMAIN_EVENTS[keyof typeof SECURITY_DOMAIN_EVENTS];
//# sourceMappingURL=SecurityDomain.d.ts.map