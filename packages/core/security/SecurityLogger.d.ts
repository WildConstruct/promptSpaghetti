/**
 * Security Logger Service
 *
 * Comprehensive security event logging system for lockout events and security
 * incidents with structured logging, audit trails, and compliance features.
 *
 * Features:
 * - Structured security event logging
 * - Audit trail management
 * - Compliance reporting (SOX, GDPR, HIPAA)
 * - Real-time security monitoring
 * - Log retention and archival
 * - Security metrics and analytics
 * - Integration with SIEM systems
 */
import { EventEmitter } from 'events';
import { LockoutReason, AdminRole, AccountLockout, UnlockMethod } from './AccountLockoutService';
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    CRITICAL = "critical",
    SECURITY = "security"

export declare enum SecurityEventType {
    ACCOUNT_LOCKED = "account_locked",
    ACCOUNT_UNLOCKED = "account_unlocked",
    UNLOCK_ATTEMPT = "unlock_attempt",
    UNLOCK_APPROVED = "unlock_approved",
    UNLOCK_DENIED = "unlock_denied",
    EMERGENCY_UNLOCK = "emergency_unlock",
    LOCKOUT_EXPIRED = "lockout_expired",
    ADMIN_OVERRIDE = "admin_override",
    POLICY_VIOLATION = "policy_violation",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    SECURITY_ALERT = "security_alert",
    COMPLIANCE_EVENT = "compliance_event",
    AUDIT_LOG_ACCESS = "audit_log_access",
    LOG_TAMPERING_DETECTED = "log_tampering_detected"

export declare enum ComplianceFramework {
    SOX = "sox",
    GDPR = "gdpr",
    HIPAA = "hipaa",
    PCI_DSS = "pci_dss",
    ISO_27001 = "iso_27001",
    NIST = "nist",
    CCPA = "ccpa"

}
export interface LogContext {
    userId?: string;
    userEmail?: string;
    adminId?: string;
    adminRole?: AdminRole;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    lockoutId?: string;
    geolocation?: {
        country?: string;
        region?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
}
    };
    deviceInfo?: {
        deviceId?: string;
        deviceType?: string;
        platform?: string;
        browser?: string;
    };
    threatContext?: {
        riskScore?: number;
        threatLevel?: string;
        attackVector?: string;
        indicators?: string[];
    };

}
export interface SecurityLogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    eventType: SecurityEventType;
    message: string;
    actor: {
        type: 'user' | 'admin' | 'system';
        id: string;
        email?: string;
        role?: AdminRole;
}
    };
    target?: {
        type: 'user' | 'account' | 'lockout' | 'system';
        id: string;
        email?: string;
    };
    context: LogContext;
    details: Record<string, any>;
    outcome: 'success' | 'failure' | 'pending' | 'unknown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    compliance: {
        frameworks: ComplianceFramework[];
        retention: number;
        encrypted: boolean;
        immutable: boolean;
    };
    metadata: {
        source: string;
        environment: string;
        version: string;
        correlationId?: string;
        traceId?: string;
        checksum: string;
    };

}
export interface AuditTrailEntry {
    id: string;
    timestamp: Date;
    operation: string;
    resource: string;
    resourceId: string;
    actor: {
        type: 'user' | 'admin' | 'system';
        id: string;
        email?: string;
}
    };
    changes: {
        before?: any;
        after?: any;
        fields: string[];
    };
    reason?: string;
    context: LogContext;
    compliance: ComplianceFramework[];
    signature: string;

}
export interface SecurityMetrics {
    period: {
        start: Date;
        end: Date;
}
    };
    lockoutEvents: {
        total: number;
        byReason: Record<LockoutReason, number>;
        byHour: number[];
        averagePerDay: number;
    };
    unlockEvents: {
        total: number;
        byMethod: Record<UnlockMethod, number>;
        adminUnlocks: number;
        emergencyUnlocks: number;
        averageResolutionTime: number;
    };
    securityAlerts: {
        total: number;
        bySeverity: Record<string, number>;
        falsePositives: number;
        responseTime: number;
    };
    compliance: {
        violations: number;
        reportingRequirements: number;
        dataRetention: number;
        auditAccess: number;
    };
    threatLandscape: {
        topAttackVectors: Array<{
            vector: string;
            count: number;
        }>;
        topTargetedUsers: Array<{
            userId: string;
            count: number;
        }>;
        geographicDistribution: Record<string, number>;
        timePatterns: {
            peakHours: number[];
            peakDays: string[];
        };
    };

}
export interface LogQuery {
    startTime?: Date;
    endTime?: Date;
    eventTypes?: SecurityEventType[];
    levels?: LogLevel[];
    actors?: string[];
    targets?: string[];
    severity?: string[];
    compliance?: ComplianceFramework[];
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'severity' | 'eventType';
    sortOrder?: 'asc' | 'desc';
    search?: string;

}
export interface LogRetentionPolicy {
    framework: ComplianceFramework;
    retentionDays: number;
    archiveAfterDays: number;
    encrypted: boolean;
    immutable: boolean;
    accessControls: string[];
/**
 * Comprehensive security logging service
 */
export declare class SecurityLogger extends EventEmitter {
    private logs;
    private auditTrail;
    private retentionPolicies;
    private metrics;
    private lastMetricsUpdate;
    constructor();
    /**
     * Log account lockout event
     */
    logAccountLocked(lockout: AccountLockout, context?: LogContext): string;
    /**
     * Log account unlock event
     */
    logAccountUnlocked(lockout: AccountLockout, method: UnlockMethod, adminId?: string, context?: LogContext): string;
    /**
     * Log unlock attempt
     */
    logUnlockAttempt();
      lockoutId: string,
      adminId: string,
      reason: string,
      outcome: 'success' | 'failure',
      context?: LogContext
    ): string;
    /**
     * Log emergency unlock event
     */
    logEmergencyUnlock();
      lockoutId: string,
      adminId: string,
      emergencyCode: string,
      justification: string,
      context?: LogContext
    ): string;
    /**
     * Log security alert
     */
    logSecurityAlert();
      alertType: string,
      severity: 'low' | 'medium' | 'high' | 'critical',
      details: Record<string,
      any>,
      context?: LogContext
    ): string;
    /**
     * Create audit trail entry
     */
    createAuditTrail(operation: string, resource: string, resourceId: string, actorType: 'user' | 'admin' | 'system', actorId: string, changes: {)
        before?: any;
        after?: any;
        fields: string[];
}
    }, reason?: string, context?: LogContext): string;
    /**
     * Query security logs
     */
    queryLogs(query: LogQuery): {
        logs: SecurityLogEntry[];
        total: number;
        hasMore: boolean;
    };
    /**
     * Get security metrics
     */
    getSecurityMetrics(startTime?: Date, endTime?: Date): SecurityMetrics;
    /**
     * Export logs for compliance
     */
    exportLogsForCompliance();
      framework: ComplianceFramework,
      startTime: Date,
      endTime: Date,
      format?: 'json' | 'csv' | 'xml'
    ): {
        data: string;
        metadata: {
            framework: ComplianceFramework;
            period: {
                start: Date;
                end: Date;
            };
            recordCount: number;
            exportTime: Date;
            signature: string;
        };
    };
    private storeLogEntry;
    private determineLockoutLogLevel;
    private determineLockoutSeverity;
    private mapSeverityToLogLevel;
    private getApplicableFrameworks;
    private getRetentionDays;
    private calculateChecksum;
    private maskSensitiveData;
    private hashSensitiveData;
    private generateAuditSignature;
    private generateExportSignature;
    private shouldUpdateMetrics;
    private updateMetrics;
    private groupByReason;
    private groupByHour;
    private groupByMethod;
    private groupBySeverity;
    private calculateAverageResolutionTime;
    private getTopAttackVectors;
    private getTopTargetedUsers;
    private getGeographicDistribution;
    private getPeakHours;
    private getPeakDays;
    private convertToCSV;
    private convertToXML;
    private initializeRetentionPolicies;
    private startMetricsCollection;
    private startLogMaintenance;

export declare const securityLogger: SecurityLogger;
export default SecurityLogger;
//# sourceMappingURL=SecurityLogger.d.ts.map