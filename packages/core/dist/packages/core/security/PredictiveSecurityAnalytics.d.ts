export interface SecurityEvent {
    id: string;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    sourceIP: string;
    userAgent?: string;
    eventType: SecurityEventType;
    severity: SecuritySeverity;
    metadata: Record<string, unknown>;
    riskScore: number;
    geolocation?: GeolocationData;
}
export declare enum SecurityEventType {
    LOGIN_ATTEMPT = "login_attempt",
    LOGIN_SUCCESS = "login_success",
    LOGIN_FAILURE = "login_failure",
    PASSWORD_RESET = "password_reset",
    PERMISSION_CHANGE = "permission_change",
    API_ACCESS = "api_access",
    DATA_ACCESS = "data_access",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt",
    ACCOUNT_LOCKOUT = "account_lockout",
    PRIVILEGE_ESCALATION = "privilege_escalation",
    export,
    enum,
    SecuritySeverity
}
//# sourceMappingURL=PredictiveSecurityAnalytics.d.ts.map