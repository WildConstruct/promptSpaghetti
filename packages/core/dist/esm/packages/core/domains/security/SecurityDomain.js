retentionCleanup();
Promise;
dateRange ?  : { start: Date, end: Date };
outcome ?  : string;
limit ?  : number;
offset ?  : number;
dateRange ?  : { start: Date, end: Date };
timeRange: {
    start: Date;
    end: Date;
}
;
;
// React Hooks
hooks: {
    useAuth: () => {
        user: User | null;
        permissions: Permission;
        isAuthenticated: boolean;
        login: (credentials) => Promise;
        logout: () => Promise;
        checkPermission: (resource, action) => boolean;
    };
    usePermissions: () => {
        permissions: Permission;
        loading: boolean;
        hasPermission: (resource, action) => boolean;
        hasRole: (roleName) => boolean;
        refreshPermissions: () => Promise;
    };
    useAuditLogs: () => {
        logs: AuditLog;
        loading: boolean;
        error: string | null;
        fetchLogs: (filters) => Promise;
        exportLogs: (format) => Promise;
    };
    useSecurityAlerts: () => {
        alerts: SecurityAlert;
        unreadCount: number;
        loading: boolean;
        acknowledgeAlert: (alertId) => Promise;
        resolveAlert: (alertId, resolution) => Promise;
    };
    useSecurityMetrics: () => {
        metrics: SecurityMetrics | null;
        loading: boolean;
        refreshMetrics: () => Promise;
        getMetricsForPeriod: (period) => Promise;
    };
}
;
// Domain Services
services: {
    authentication: IAuthenticationService;
    authorization: IAuthorizationService;
    audit: IAuditService;
    monitoring: ISecurityMonitoringService;
    policyManagement: IPolicyManagementService;
    dataClassification: IDataClassificationService;
    encryption: IEncryptionService;
}
;
// Event System
events: SecurityDomainEvents & {
    subscribe: (event, callback) => () => void ,
    emit: (event, ...args) => void 
};
// Utilities
utils: {
    validatePassword: (password) => ValidationResult;
    generateSecurePassword: (length) => string;
    calculateRiskScore: (factors) => number;
    formatPermission: (permission) => string;
    hashSensitiveData: (data) => Promise;
    maskSensitiveData: (data, type) => string;
    validateCompliance: (data, framework) => ValidationResult;
}
;
;
authentication: {
    sessionTimeout: number;
    maxFailedAttempts: number;
    passwordPolicy: PasswordPolicy;
}
;
audit: {
    retentionPeriod: number;
    realTimeLogging: boolean;
    includeRequestBodies: boolean;
}
;
monitoring: {
    alertThresholds: Record;
    anomalyDetection: boolean;
    riskScoringEnabled: boolean;
}
;
export const SECURITY_DOMAIN_EVENTS = {
    USER_AUTHENTICATED: 'security:user:authenticated',
    USER_LOGGED_OUT: 'security:user:logged_out',
    AUTHENTICATION_FAILED: 'security:authentication:failed',
    ACCESS_GRANTED: 'security:access:granted',
    ACCESS_DENIED: 'security:access:denied',
    PERMISSION_CHANGED: 'security:permission:changed',
    SECURITY_VIOLATION: 'security:violation:detected',
    POLICY_VIOLATION: 'security:policy:violation',
    AUDIT_LOG_CREATED: 'security:audit:log:created',
    SECURITY_ALERT: 'security:alert:created',
    RISK_SCORE_UPDATED: 'security:risk:score:updated',
    SESSION_EXPIRED: 'security:session:expired',
    MFA_REQUIRED: 'security:mfa:required',
    ENCRYPTION_KEY_ROTATED: 'security:encryption:key:rotated',
};
