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
import crypto from 'crypto';
import { LockoutReason, AdminRole, AccountLockout, UnlockMethod } from './AccountLockoutService';
// Log Levels
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["CRITICAL"] = "critical";
    LogLevel["SECURITY"] = "security";
    // Security Event Types
    LogLevel[LogLevel["export"] = void 0] = "export";
    LogLevel[LogLevel["enum"] = void 0] = "enum";
    LogLevel[LogLevel["SecurityEventType"] = void 0] = "SecurityEventType";
})(LogLevel || (LogLevel = {}));
{
    ACCOUNT_LOCKED = 'account_locked',
        ACCOUNT_UNLOCKED = 'account_unlocked',
        UNLOCK_ATTEMPT = 'unlock_attempt',
        UNLOCK_APPROVED = 'unlock_approved',
        UNLOCK_DENIED = 'unlock_denied',
        EMERGENCY_UNLOCK = 'emergency_unlock',
        LOCKOUT_EXPIRED = 'lockout_expired',
        ADMIN_OVERRIDE = 'admin_override',
        POLICY_VIOLATION = 'policy_violation',
        SUSPICIOUS_ACTIVITY = 'suspicious_activity',
        SECURITY_ALERT = 'security_alert',
        COMPLIANCE_EVENT = 'compliance_event',
        AUDIT_LOG_ACCESS = 'audit_log_access',
        LOG_TAMPERING_DETECTED = 'log_tampering_detected';
    // Compliance Frameworks
    export let ComplianceFramework;
    (function (ComplianceFramework) {
        ComplianceFramework["SOX"] = "sox";
        ComplianceFramework["GDPR"] = "gdpr";
        ComplianceFramework["HIPAA"] = "hipaa";
        ComplianceFramework["PCI_DSS"] = "pci_dss";
        ComplianceFramework["ISO_27001"] = "iso_27001";
        ComplianceFramework["NIST"] = "nist";
        ComplianceFramework["CCPA"] = "ccpa";
        // Log Context
        ComplianceFramework[ComplianceFramework["export"] = void 0] = "export";
        ComplianceFramework[ComplianceFramework["interface"] = void 0] = "interface";
        ComplianceFramework[ComplianceFramework["LogContext"] = void 0] = "LogContext";
    })(ComplianceFramework || (ComplianceFramework = {}));
    {
        userId ?  : string;
        userEmail ?  : string;
        adminId ?  : string;
        adminRole ?  : AdminRole;
        ipAddress ?  : string;
        userAgent ?  : string;
        sessionId ?  : string;
        requestId ?  : string;
        lockoutId ?  : string;
        geolocation ?  : {
            country: string,
            region: string,
            city: string,
            latitude: number,
            longitude: number
        };
    }
    ;
    deviceInfo ?  : {
        deviceId: string,
        deviceType: string,
        platform: string,
        browser: string
    };
    threatContext ?  : {
        riskScore: number,
        threatLevel: string,
        attackVector: string,
        indicators: string
    };
    // Security Log Entry
}
;
target ?  : {
    type: 'user' | 'account' | 'lockout' | 'system',
    id: string,
    email: string
};
context: LogContext;
details: Record;
outcome: 'success' | 'failure' | 'pending' | 'unknown';
severity: 'low' | 'medium' | 'high' | 'critical';
compliance: {
    frameworks: ComplianceFramework;
    retention: number; // days,
    encrypted: boolean;
    immutable: boolean;
}
;
metadata: {
    source: string;
    environment: string;
    version: string;
    correlationId ?  : string;
    traceId ?  : string;
    checksum: string;
}
;
;
changes: {
    before ?  : any;
    after ?  : any;
    fields: string;
}
;
reason ?  : string;
context: LogContext;
compliance: ComplianceFramework;
signature: string;
;
lockoutEvents: {
    total: number;
    byReason: Record;
    byHour: number;
    averagePerDay: number;
}
;
unlockEvents: {
    total: number;
    byMethod: Record;
    adminUnlocks: number;
    emergencyUnlocks: number;
    averageResolutionTime: number;
}
;
securityAlerts: {
    total: number;
    bySeverity: Record;
    falsePositives: number;
    responseTime: number;
}
;
compliance: {
    violations: number;
    reportingRequirements: number;
    dataRetention: number;
    auditAccess: number;
}
;
threatLandscape: {
    topAttackVectors: Array;
    topTargetedUsers: Array;
    geographicDistribution: Record;
    timePatterns: {
        peakHours: number;
        peakDays: string;
    }
    ;
}
;
export class SecurityLogger extends EventEmitter {
    logs = new Map();
    auditTrail = new Map();
    retentionPolicies = new Map();
    metrics = null;
    lastMetricsUpdate = new Date();
    constructor() {
        super();
        this.initializeRetentionPolicies();
        this.startMetricsCollection();
        this.startLogMaintenance();
        /**
         * Log account lockout event
         */
    }
}
((lockout, context = {}) => {
    const logEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: this.determineLockoutLogLevel(lockout.reason),
        eventType: SecurityEventType.ACCOUNT_LOCKED,
        message: `Account locked: ${lockout.userEmail} due to ${lockout.reason}` };
},
    actor);
{
    type: 'system',
        id;
    'lockout-service',
    ;
}
target: {
    type: 'account',
        id;
    lockout.userId,
        email;
    lockout.userEmail,
    ;
}
context: {
    context,
        userId;
    lockout.userId,
        userEmail;
    lockout.userEmail,
        lockoutId;
    lockout.id,
    ;
}
details: {
    reason: lockout.reason,
        failedAttempts;
    lockout.failedAttempts,
        lockoutTime;
    lockout.lockoutTime,
        expiryTime;
    lockout.expiryTime,
        metadata;
    lockout.metadata,
        securityEvents;
    lockout.securityEvents,
    ;
}
outcome: 'success',
    severity;
this.determineLockoutSeverity(lockout.reason),
    compliance;
{
    frameworks: this.getApplicableFrameworks(lockout.reason),
        retention;
    this.getRetentionDays(lockout.reason),
        encrypted;
    true,
        immutable;
    true,
    ;
}
metadata: {
    source: 'AccountLockoutService',
        environment;
    process.env.NODE_ENV || 'development',
        version;
    '1.0.0',
        correlationId;
    context.requestId,
        checksum;
    this.calculateChecksum({});
    eventType: SecurityEventType.ACCOUNT_LOCKED,
        timestamp;
    new Date(),
        userId;
    lockout.userId,
        reason;
    lockout.reason,
    ;
}
;
return this.storeLogEntry(logEntry);
logAccountUnlocked(lockout, AccountLockout);
method: UnlockMethod,
    adminId ?  : string,
    context;
LogContext = {};
string;
{
    const logEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: LogLevel.INFO,
        eventType: SecurityEventType.ACCOUNT_UNLOCKED,
        message: `Account unlocked: ${lockout.userEmail} via ${method}${adminId ? ` by ${adminId}` : ''}` };
}
actor: {
    type: adminId ? 'admin' : 'system',
        id;
    adminId || 'lockout-service',
        email;
    adminId ? `${adminId}@company.com` : undefined;
}
target: {
    type: 'account',
        id;
    lockout.userId,
        email;
    lockout.userEmail,
    ;
}
context: {
    context,
        userId;
    lockout.userId,
        userEmail;
    lockout.userEmail,
        lockoutId;
    lockout.id,
        adminId;
}
details: {
    method,
        originalReason;
    lockout.reason,
        lockoutDuration;
    lockout.unlockTime,
            ? lockout.unlockTime.getTime() - lockout.lockoutTime.getTime()
            : null,
        adminActions;
    lockout.adminActions,
        unlockTime;
    lockout.unlockTime,
    ;
}
outcome: 'success',
    severity;
'medium',
    compliance;
{
    frameworks: [ComplianceFramework.SOX, ComplianceFramework.ISO_27001],
        retention;
    2555, // 7 years for SOX compliance,
        encrypted;
    true,
        immutable;
    true,
    ;
}
metadata: {
    source: 'AccountLockoutService',
        environment;
    process.env.NODE_ENV || 'development',
        version;
    '1.0.0',
        correlationId;
    context.requestId,
        checksum;
    this.calculateChecksum({});
    eventType: SecurityEventType.ACCOUNT_UNLOCKED,
        timestamp;
    new Date(),
        userId;
    lockout.userId,
        method,
        adminId;
}
;
return this.storeLogEntry(logEntry);
logUnlockAttempt(lockoutId, string);
adminId: string,
    reason;
string,
    outcome;
'success' | 'failure',
    context;
LogContext = {};
string;
{
    const logEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: outcome === 'failure' ? LogLevel.WARN : LogLevel.INFO,
        eventType: SecurityEventType.UNLOCK_ATTEMPT,
        message: `Unlock attempt ${outcome}: ${adminId} for lockout ${lockoutId}` };
}
actor: {
    type: 'admin',
        id;
    adminId,
        email;
    `${adminId}@company.com`;
}
target: {
    type: 'lockout',
        id;
    lockoutId,
    ;
}
context: {
    context,
        adminId,
        lockoutId;
}
details: {
    reason,
        outcome,
        timestamp;
    new Date(),
    ;
}
outcome,
    severity;
outcome === 'failure' ? 'medium' : 'low',
    compliance;
{
    frameworks: [ComplianceFramework.SOX, ComplianceFramework.ISO_27001],
        retention;
    2555,
        encrypted;
    true,
        immutable;
    true,
    ;
}
metadata: {
    source: 'AccountLockoutService',
        environment;
    process.env.NODE_ENV || 'development',
        version;
    '1.0.0',
        correlationId;
    context.requestId,
        checksum;
    this.calculateChecksum({});
    eventType: SecurityEventType.UNLOCK_ATTEMPT,
        timestamp;
    new Date(),
        adminId,
        lockoutId,
        outcome;
}
;
return this.storeLogEntry(logEntry);
logEmergencyUnlock(lockoutId, string);
adminId: string,
    emergencyCode;
string,
    justification;
string,
    context;
LogContext = {};
string;
{
    const logEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: LogLevel.CRITICAL,
        eventType: SecurityEventType.EMERGENCY_UNLOCK,
        message: `EMERGENCY UNLOCK: ${adminId} unlocked ${lockoutId} with emergency code` };
}
actor: {
    type: 'admin',
        id;
    adminId,
        email;
    `${adminId}@company.com`;
}
target: {
    type: 'lockout',
        id;
    lockoutId,
    ;
}
context: {
    context,
        adminId,
        lockoutId;
}
details: {
    emergencyCode: this.maskSensitiveData(emergencyCode),
        justification,
        fullEmergencyCodeHash;
    this.hashSensitiveData(emergencyCode),
        timestamp;
    new Date(),
    ;
}
outcome: 'success',
    severity;
'critical',
    compliance;
{
    frameworks: [,
        ComplianceFramework.SOX,
        ComplianceFramework.ISO_27001,
        ComplianceFramework.NIST
    ],
        retention;
    2555, // 7 years,
        encrypted;
    true,
        immutable;
    true,
    ;
}
metadata: {
    source: 'AccountLockoutService',
        environment;
    process.env.NODE_ENV || 'development',
        version;
    '1.0.0',
        correlationId;
    context.requestId,
        checksum;
    this.calculateChecksum({});
    eventType: SecurityEventType.EMERGENCY_UNLOCK,
        timestamp;
    new Date(),
        adminId,
        lockoutId,
        emergencyCode;
}
;
return this.storeLogEntry(logEntry);
logSecurityAlert(alertType, string);
severity: 'low' | 'medium' | 'high' | 'critical',
    details;
(Record),
    context;
LogContext = {};
string;
{
    const logEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: this.mapSeverityToLogLevel(severity),
        eventType: SecurityEventType.SECURITY_ALERT,
        message: `Security alert: ${alertType} (${severity})` };
}
actor: {
    type: 'system',
        id;
    'security-monitor',
    ;
}
context,
    details;
{
    alertType,
    ;
    details;
}
outcome: 'unknown',
    severity,
    compliance;
{
    frameworks: [,
        ComplianceFramework.ISO_27001,
        ComplianceFramework.NIST,
        ComplianceFramework.GDPR
    ],
        retention;
    2555,
        encrypted;
    true,
        immutable;
    true,
    ;
}
metadata: {
    source: 'SecurityMonitor',
        environment;
    process.env.NODE_ENV || 'development',
        version;
    '1.0.0',
        correlationId;
    context.requestId,
        checksum;
    this.calculateChecksum({});
    eventType: SecurityEventType.SECURITY_ALERT,
        timestamp;
    new Date(),
        alertType,
        severity;
}
;
return this.storeLogEntry(logEntry);
createAuditTrail(operation, string);
resource: string,
    resourceId;
string,
    actorType;
'user' | 'admin' | 'system',
    actorId;
string,
    changes;
{
    before ?  : any;
    after ?  : any;
    fields: string;
}
reason ?  : string,
    context;
LogContext = {};
string;
{
    const auditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        operation,
        resource,
        resourceId,
        actor: {
            type: actorType,
            id: actorId,
            email: actorType !== 'system' ? `${actorId}@company.com` : undefined
        }
    };
    changes,
        reason,
        context,
        compliance;
    [ComplianceFramework.SOX, ComplianceFramework.ISO_27001, ComplianceFramework.GDPR],
        signature;
    this.generateAuditSignature({}),
        operation,
        resource,
        resourceId,
        actorId,
        timestamp;
    new Date(),
        changes;
}
;
this.auditTrail.set(auditEntry.id, auditEntry);
this.emit('auditTrailCreated', auditEntry);
return auditEntry.id;
queryLogs(query, LogQuery);
{
    logs: SecurityLogEntry;
    total: number;
    hasMore: boolean;
    let logs = Array.from(this.logs.values());
    // Apply filters
    if (query.startTime) {
        logs = logs.filter(log => log.timestamp >= query.startTime);
        if (query.endTime) {
            logs = logs.filter(log => log.timestamp <= query.endTime);
            if (query.eventTypes?.length) {
                logs = logs.filter(log => query.eventTypes.includes(log.eventType));
                if (query.levels?.length) {
                    logs = logs.filter(log => query.levels.includes(log.level));
                    if (query.actors?.length) {
                        logs = logs.filter(log => query.actors.includes(log.actor.id));
                        if (query.targets?.length) {
                            logs = logs.filter(log => log.target && query.targets.includes(log.target.id));
                            if (query.severity?.length) {
                                logs = logs.filter(log => query.severity.includes(log.severity));
                                if (query.compliance?.length) {
                                    logs = logs.filter(log => );
                                    query.compliance.some(framework => );
                                    log.compliance.frameworks.includes(framework);
                                    ;
                                    if (query.search) {
                                        const searchTerm = query.search.toLowerCase();
                                        logs = logs.filter(log => );
                                        log.message.toLowerCase().includes(searchTerm) ||
                                            log.actor.id.toLowerCase().includes(searchTerm) ||
                                            (log.target?.id.toLowerCase().includes(searchTerm));
                                        ;
                                        // Sort
                                        const sortBy = query.sortBy || 'timestamp';
                                        const sortOrder = query.sortOrder || 'desc';
                                        logs.sort((a, b) => {
                                            let aValue, bValue;
                                            switch (sortBy) {
                                                case 'timestamp':
                                                    aValue = a.timestamp.getTime();
                                                    bValue = b.timestamp.getTime();
                                                    break;
                                                case 'severity':
                                                    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                                                    aValue = severityOrder[a.severity];
                                                    bValue = severityOrder[b.severity];
                                                    break;
                                                case 'eventType':
                                                    aValue = a.eventType;
                                                    bValue = b.eventType;
                                                    break;
                                                default:
                                                    aValue = a.timestamp.getTime();
                                                    bValue = b.timestamp.getTime();
                                                    if (sortOrder === 'desc') {
                                                        return bValue - aValue;
                                                    }
                                                    else {
                                                        return aValue - bValue;
                                                    }
                                            }
                                        });
                                        const total = logs.length;
                                        const offset = query.offset || 0;
                                        const limit = query.limit || 100;
                                        logs = logs.slice(offset, offset + limit);
                                        return {
                                            logs,
                                            total,
                                            hasMore: (offset + limit) < total,
                                        };
                                        getSecurityMetrics(startTime ?  : Date);
                                        endTime ?  : Date;
                                        SecurityMetrics;
                                        {
                                            if (!this.metrics || this.shouldUpdateMetrics()) {
                                                this.updateMetrics(startTime, endTime);
                                                return this.metrics;
                                                exportLogsForCompliance(framework, ComplianceFramework);
                                                startTime: Date,
                                                    endTime;
                                                Date,
                                                    format;
                                                'json' | 'csv' | 'xml';
                                                'json';
                                                {
                                                    ;
                                                    data: string;
                                                    metadata: {
                                                        ;
                                                        framework: ComplianceFramework;
                                                        period: {
                                                            start: Date;
                                                            end: Date;
                                                        }
                                                        ;
                                                        recordCount: number;
                                                        exportTime: Date;
                                                        signature: string;
                                                    }
                                                    ;
                                                    const query = {
                                                        startTime,
                                                        endTime,
                                                        compliance: [framework],
                                                    };
                                                    const result = this.queryLogs(query);
                                                    const exportData = {
                                                        framework,
                                                        period: { start: startTime, end: endTime },
                                                        recordCount: result.total,
                                                        logs: result.logs,
                                                        auditTrail: Array.from(this.auditTrail.values()).filter(entry => ),
                                                        entry, : .compliance.includes(framework) &&
                                                            entry.timestamp >= startTime &&
                                                            entry.timestamp <= endTime
                                                    };
                                                    let data;
                                                    switch (format) {
                                                        case 'json':
                                                            data = JSON.stringify(exportData, null, 2);
                                                            break;
                                                        case 'csv':
                                                            data = this.convertToCSV(result.logs);
                                                            break;
                                                        case 'xml':
                                                            data = this.convertToXML(exportData);
                                                            break;
                                                        default:
                                                            data = JSON.stringify(exportData, null, 2);
                                                            const metadata = {
                                                                framework,
                                                                period: { start: startTime, end: endTime },
                                                                recordCount: result.total,
                                                                exportTime: new Date(),
                                                                signature: this.generateExportSignature(data, framework)
                                                            };
                                                            return { data, metadata };
                                                            storeLogEntry(logEntry, SecurityLogEntry);
                                                            string;
                                                            {
                                                                this.logs.set(logEntry.id, logEntry);
                                                                this.emit('securityLogCreated', logEntry);
                                                                // Alert on critical events
                                                                if (logEntry.severity === 'critical' || logEntry.level === LogLevel.CRITICAL) {
                                                                    this.emit('criticalSecurityEvent', logEntry);
                                                                    return logEntry.id;
                                                                    determineLockoutLogLevel(reason, LockoutReason);
                                                                    LogLevel;
                                                                    {
                                                                        const levelMap = {
                                                                            [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: LogLevel.WARN,
                                                                            [LockoutReason.SUSPICIOUS_ACTIVITY]: LogLevel.ERROR,
                                                                            [LockoutReason.SECURITY_POLICY_VIOLATION]: LogLevel.ERROR,
                                                                            [LockoutReason.ADMIN_MANUAL_LOCK]: LogLevel.INFO,
                                                                            [LockoutReason.SYSTEM_SECURITY_ALERT]: LogLevel.CRITICAL,
                                                                            [LockoutReason.COMPLIANCE_REQUIREMENT]: LogLevel.WARN,
                                                                        };
                                                                        return levelMap[reason] || LogLevel.WARN;
                                                                        determineLockoutSeverity(reason, LockoutReason);
                                                                        'low' | 'medium' | 'high' | 'critical';
                                                                        {
                                                                            const severityMap = {
                                                                                [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: 'medium',
                                                                                [LockoutReason.SUSPICIOUS_ACTIVITY]: 'high',
                                                                                [LockoutReason.SECURITY_POLICY_VIOLATION]: 'high',
                                                                                [LockoutReason.ADMIN_MANUAL_LOCK]: 'medium',
                                                                                [LockoutReason.SYSTEM_SECURITY_ALERT]: 'critical',
                                                                                [LockoutReason.COMPLIANCE_REQUIREMENT]: 'medium',
                                                                            };
                                                                            return severityMap[reason] || 'medium';
                                                                            mapSeverityToLogLevel(severity, 'low' | 'medium' | 'high' | 'critical');
                                                                            LogLevel;
                                                                            {
                                                                                const levelMap = {
                                                                                    low: LogLevel.INFO,
                                                                                    medium: LogLevel.WARN,
                                                                                    high: LogLevel.ERROR,
                                                                                    critical: LogLevel.CRITICAL,
                                                                                };
                                                                                return levelMap[severity];
                                                                                getApplicableFrameworks(reason, LockoutReason);
                                                                                ComplianceFramework;
                                                                                {
                                                                                    const baseFrameworks = [ComplianceFramework.ISO_27001, ComplianceFramework.NIST];
                                                                                    switch (reason) {
                                                                                        case LockoutReason.SUSPICIOUS_ACTIVITY:
                                                                                        case LockoutReason.SYSTEM_SECURITY_ALERT:
                                                                                            return [...baseFrameworks, ComplianceFramework.GDPR];
                                                                                        case LockoutReason.COMPLIANCE_REQUIREMENT:
                                                                                            return [...baseFrameworks, ComplianceFramework.SOX, ComplianceFramework.GDPR];
                                                                                        default:
                                                                                            return baseFrameworks;
                                                                                            getRetentionDays(reason, LockoutReason);
                                                                                            number;
                                                                                            {
                                                                                                // Security events require longer retention
                                                                                                if ([
                                                                                                    LockoutReason.SUSPICIOUS_ACTIVITY,
                                                                                                    LockoutReason.SYSTEM_SECURITY_ALERT,
                                                                                                    LockoutReason.SECURITY_POLICY_VIOLATION
                                                                                                ].includes(reason)) {
                                                                                                    return 2555; // 7 years
                                                                                                    return 1095; // 3 years default
                                                                                                    calculateChecksum(data, any);
                                                                                                    string;
                                                                                                    {
                                                                                                        const hash = crypto.createHash('sha256');
                                                                                                        hash.update(JSON.stringify(data));
                                                                                                        return hash.digest('hex');
                                                                                                        maskSensitiveData(data, string);
                                                                                                        string;
                                                                                                        {
                                                                                                            if (data.length <= 8) {
                                                                                                                return '*'.repeat(data.length);
                                                                                                                return data.substring(0, 4) + '*'.repeat(data.length - 8) + data.substring(data.length - 4);
                                                                                                                hashSensitiveData(data, string);
                                                                                                                string;
                                                                                                                {
                                                                                                                    const hash = crypto.createHash('sha256');
                                                                                                                    hash.update(data);
                                                                                                                    return hash.digest('hex');
                                                                                                                    generateAuditSignature(data, any);
                                                                                                                    string;
                                                                                                                    {
                                                                                                                        const hash = crypto.createHash('sha256');
                                                                                                                        hash.update(JSON.stringify(data) + process.env.AUDIT_SALT || 'default-salt');
                                                                                                                        return hash.digest('hex');
                                                                                                                        generateExportSignature(data, string, framework, ComplianceFramework);
                                                                                                                        string;
                                                                                                                        {
                                                                                                                            const hash = crypto.createHash('sha256');
                                                                                                                            hash.update(data + framework + new Date().toISOString());
                                                                                                                            return hash.digest('hex');
                                                                                                                            shouldUpdateMetrics();
                                                                                                                            boolean;
                                                                                                                            {
                                                                                                                                const now = new Date();
                                                                                                                                const timeSinceUpdate = now.getTime() - this.lastMetricsUpdate.getTime();
                                                                                                                                return timeSinceUpdate > 5 * 60 * 1000; // Update every 5 minutes
                                                                                                                                updateMetrics(startTime ?  : Date, endTime ?  : Date);
                                                                                                                                void {
                                                                                                                                    const: now = new Date(),
                                                                                                                                    const: defaultStart = new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours;
                                                                                                                                    const: start = startTime || defaultStart,
                                                                                                                                    const: end = endTime || now,
                                                                                                                                    const: logs = Array.from(this.logs.values()).filter(log => ),
                                                                                                                                    log, : .timestamp >= start && log.timestamp <= end,
                                                                                                                                    // Calculate lockout metrics
                                                                                                                                    const: lockoutLogs = logs.filter(log => log.eventType === SecurityEventType.ACCOUNT_LOCKED),
                                                                                                                                    const: unlockLogs = logs.filter(log => log.eventType === SecurityEventType.ACCOUNT_UNLOCKED),
                                                                                                                                    const: alertLogs = logs.filter(log => log.eventType === SecurityEventType.SECURITY_ALERT),
                                                                                                                                    this: .metrics = {
                                                                                                                                        period: { start, end },
                                                                                                                                        lockoutEvents: {
                                                                                                                                            total: lockoutLogs.length,
                                                                                                                                            byReason: this.groupByReason(lockoutLogs),
                                                                                                                                            byHour: this.groupByHour(lockoutLogs, start, end),
                                                                                                                                            averagePerDay: lockoutLogs.length / Math.max(1, (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
                                                                                                                                        },
                                                                                                                                        unlockEvents: {
                                                                                                                                            total: unlockLogs.length,
                                                                                                                                            byMethod: this.groupByMethod(unlockLogs),
                                                                                                                                            adminUnlocks: unlockLogs.filter(log => log.actor.type === 'admin').length,
                                                                                                                                            emergencyUnlocks: logs.filter(log => log.eventType === SecurityEventType.EMERGENCY_UNLOCK).length,
                                                                                                                                            averageResolutionTime: this.calculateAverageResolutionTime(lockoutLogs, unlockLogs),
                                                                                                                                        },
                                                                                                                                        securityAlerts: {
                                                                                                                                            total: alertLogs.length,
                                                                                                                                            bySeverity: this.groupBySeverity(alertLogs),
                                                                                                                                            falsePositives: 0, // Would need additional tracking,
                                                                                                                                            responseTime: 0 // Would need additional tracking,
                                                                                                                                        },
                                                                                                                                        compliance: {
                                                                                                                                            violations: logs.filter(log => log.eventType === SecurityEventType.POLICY_VIOLATION).length,
                                                                                                                                            reportingRequirements: logs.filter(log => log.compliance.frameworks.length > 0).length,
                                                                                                                                            dataRetention: logs.filter(log => log.compliance.retention > 0).length,
                                                                                                                                            auditAccess: logs.filter(log => log.eventType === SecurityEventType.AUDIT_LOG_ACCESS).length,
                                                                                                                                        },
                                                                                                                                        threatLandscape: {
                                                                                                                                            topAttackVectors: this.getTopAttackVectors(logs),
                                                                                                                                            topTargetedUsers: this.getTopTargetedUsers(logs),
                                                                                                                                            geographicDistribution: this.getGeographicDistribution(logs),
                                                                                                                                            timePatterns: {
                                                                                                                                                peakHours: this.getPeakHours(logs),
                                                                                                                                                peakDays: this.getPeakDays(logs),
                                                                                                                                            },
                                                                                                                                            this: .lastMetricsUpdate = now,
                                                                                                                                            groupByReason(logs) {
                                                                                                                                                const result = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                const reason = log.details.reason;
                                                                                                                                                result[reason] = (result[reason] || 0) + 1;
                                                                                                                                            },
                                                                                                                                            return: result,
                                                                                                                                            groupByHour(logs, start, end) {
                                                                                                                                                const hours = new Array(24).fill(0);
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                const hour = log.timestamp.getHours();
                                                                                                                                                hours[hour]++;
                                                                                                                                            },
                                                                                                                                            return: hours,
                                                                                                                                            groupByMethod(logs) {
                                                                                                                                                const result = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                const method = log.details.method;
                                                                                                                                                if (method) {
                                                                                                                                                    result[method] = (result[method] || 0) + 1;
                                                                                                                                                }
                                                                                                                                                ;
                                                                                                                                                return result;
                                                                                                                                            },
                                                                                                                                            groupBySeverity(logs) {
                                                                                                                                                const result = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                result[log.severity] = (result[log.severity] || 0) + 1;
                                                                                                                                            },
                                                                                                                                            return: result,
                                                                                                                                            calculateAverageResolutionTime(lockoutLogs, unlockLogs) {
                                                                                                                                                const resolutionTimes = [];
                                                                                                                                                lockoutLogs.forEach(lockoutLog => { });
                                                                                                                                                const matchingUnlock = unlockLogs.find(unlockLog => );
                                                                                                                                                ;
                                                                                                                                                unlockLog.context.lockoutId === lockoutLog.context.lockoutId;
                                                                                                                                                ;
                                                                                                                                                if (matchingUnlock) {
                                                                                                                                                    const resolutionTime = matchingUnlock.timestamp.getTime() - lockoutLog.timestamp.getTime();
                                                                                                                                                    resolutionTimes.push(resolutionTime);
                                                                                                                                                }
                                                                                                                                                ;
                                                                                                                                                return resolutionTimes.length > 0
                                                                                                                                                    ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
                                                                                                                                                    : 0;
                                                                                                                                            },
                                                                                                                                            getTopAttackVectors(logs) {
                                                                                                                                                const vectors = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                if (log.context.threatContext?.attackVector) {
                                                                                                                                                    const vector = log.context.threatContext.attackVector;
                                                                                                                                                    vectors[vector] = (vectors[vector] || 0) + 1;
                                                                                                                                                }
                                                                                                                                                ;
                                                                                                                                                return Object.entries(vectors)
                                                                                                                                                    .map(([vector, count]) => ({ vector, count }))
                                                                                                                                                    .sort((a, b) => b.count - a.count)
                                                                                                                                                    .slice(0, 10);
                                                                                                                                            },
                                                                                                                                            getTopTargetedUsers(logs) {
                                                                                                                                                const users = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                if (log.target?.id) {
                                                                                                                                                    users[log.target.id] = (users[log.target.id] || 0) + 1;
                                                                                                                                                }
                                                                                                                                                ;
                                                                                                                                                return Object.entries(users)
                                                                                                                                                    .map(([userId, count]) => ({ userId, count }))
                                                                                                                                                    .sort((a, b) => b.count - a.count)
                                                                                                                                                    .slice(0, 10);
                                                                                                                                            },
                                                                                                                                            getGeographicDistribution(logs) {
                                                                                                                                                const distribution = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                if (log.context.geolocation?.country) {
                                                                                                                                                    const country = log.context.geolocation.country;
                                                                                                                                                    distribution[country] = (distribution[country] || 0) + 1;
                                                                                                                                                }
                                                                                                                                                ;
                                                                                                                                                return distribution;
                                                                                                                                            },
                                                                                                                                            getPeakHours(logs) {
                                                                                                                                                const hourCounts = new Array(24).fill(0);
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                const hour = log.timestamp.getHours();
                                                                                                                                                hourCounts[hour]++;
                                                                                                                                            },
                                                                                                                                            const: maxCount = Math.max(...hourCounts),
                                                                                                                                            return: hourCounts
                                                                                                                                                .map((count, hour) => ({ hour, count }))
                                                                                                                                                .filter(item => item.count === maxCount)
                                                                                                                                                .map(item => item.hour),
                                                                                                                                            getPeakDays(logs) {
                                                                                                                                                const dayCounts = {};
                                                                                                                                                logs.forEach(log => { });
                                                                                                                                                const day = log.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
                                                                                                                                                dayCounts[day] = (dayCounts[day] || 0) + 1;
                                                                                                                                            },
                                                                                                                                            const: maxCount = Math.max(...Object.values(dayCounts)),
                                                                                                                                            return: Object.entries(dayCounts)
                                                                                                                                                .filter(([_, count]) => count === maxCount)
                                                                                                                                                .map(([day, _]) => day),
                                                                                                                                            convertToCSV(logs) {
                                                                                                                                                const headers = [];
                                                                                                                                                'ID', 'Timestamp', 'Level', 'Event Type', 'Message', 'Actor Type', 'Actor ID',
                                                                                                                                                    'Target Type', 'Target ID', 'Outcome', 'Severity', 'IP Address', 'User Agent';
                                                                                                                                                ;
                                                                                                                                                const rows = logs.map(log => []);
                                                                                                                                                log.id,
                                                                                                                                                    log.timestamp.toISOString(),
                                                                                                                                                    log.level,
                                                                                                                                                    log.eventType,
                                                                                                                                                    `"${log.message}"`;
                                                                                                                                            }
                                                                                                                                        },
                                                                                                                                        log, : .actor.type,
                                                                                                                                        log, : .actor.id,
                                                                                                                                        log, : .target?.type || '',
                                                                                                                                        log, : .target?.id || '',
                                                                                                                                        log, : .outcome,
                                                                                                                                        log, : .severity,
                                                                                                                                        log, : .context.ipAddress || '',
                                                                                                                                    } `"${log.context.userAgent || ''}"`
                                                                                                                                };
                                                                                                                                ;
                                                                                                                                return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                                                                                                                                convertToXML(data, any);
                                                                                                                                string;
                                                                                                                                {
                                                                                                                                    // Simplified XML conversion - in production, use a proper XML library
                                                                                                                                    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
                                                                                                                                    const xmlBody = `<SecurityLogExport>${JSON.stringify(data)}</SecurityLogExport>`;
                                                                                                                                }
                                                                                                                                return xmlHeader + '\n' + xmlBody;
                                                                                                                                initializeRetentionPolicies();
                                                                                                                                void {
                                                                                                                                    this: .retentionPolicies.set(ComplianceFramework.SOX, {}),
                                                                                                                                    framework: ComplianceFramework.SOX,
                                                                                                                                    retentionDays: 2555, // 7 years,
                                                                                                                                    archiveAfterDays: 365,
                                                                                                                                    encrypted: true,
                                                                                                                                    immutable: true,
                                                                                                                                    accessControls: ['auditor', 'compliance-officer'],
                                                                                                                                };
                                                                                                                                ;
                                                                                                                                this.retentionPolicies.set(ComplianceFramework.GDPR, {});
                                                                                                                                framework: ComplianceFramework.GDPR,
                                                                                                                                    retentionDays;
                                                                                                                                2190, // 6 years,
                                                                                                                                    archiveAfterDays;
                                                                                                                                365,
                                                                                                                                    encrypted;
                                                                                                                                true,
                                                                                                                                    immutable;
                                                                                                                                true,
                                                                                                                                    accessControls;
                                                                                                                                ['data-protection-officer', 'legal'],
                                                                                                                                ;
                                                                                                                            }
                                                                                                                            ;
                                                                                                                            this.retentionPolicies.set(ComplianceFramework.HIPAA, {});
                                                                                                                            framework: ComplianceFramework.HIPAA,
                                                                                                                                retentionDays;
                                                                                                                            2190, // 6 years,
                                                                                                                                archiveAfterDays;
                                                                                                                            365,
                                                                                                                                encrypted;
                                                                                                                            true,
                                                                                                                                immutable;
                                                                                                                            true,
                                                                                                                                accessControls;
                                                                                                                            ['privacy-officer', 'security-officer'],
                                                                                                                            ;
                                                                                                                        }
                                                                                                                        ;
                                                                                                                        startMetricsCollection();
                                                                                                                        void {
                                                                                                                            // Update metrics every 5 minutes
                                                                                                                            setInterval() { }
                                                                                                                        }();
                                                                                                                        {
                                                                                                                            this.updateMetrics();
                                                                                                                        }
                                                                                                                        5 * 60 * 1000;
                                                                                                                        ;
                                                                                                                        startLogMaintenance();
                                                                                                                        void {
                                                                                                                            // Clean up old logs based on retention policies every 24 hours
                                                                                                                            setInterval() { }
                                                                                                                        }();
                                                                                                                        {
                                                                                                                            const now = new Date();
                                                                                                                            for (const [id, log] of this.logs) {
                                                                                                                                const retentionDays = log.compliance.retention;
                                                                                                                                const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
                                                                                                                                if (log.timestamp < cutoffDate) {
                                                                                                                                    this.logs.delete(id);
                                                                                                                                    this.emit('logExpired', { id, log });
                                                                                                                                }
                                                                                                                                24 * 60 * 60 * 1000;
                                                                                                                                ;
                                                                                                                                // Export default instance
                                                                                                                                export const securityLogger = new SecurityLogger();
                                                                                                                                export default SecurityLogger;
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
