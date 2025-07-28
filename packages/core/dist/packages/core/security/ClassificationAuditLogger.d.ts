/**
 * Classification Audit Logger
 *
 * Comprehensive audit logging system for data classification operations,
 * providing tamper-evident logging, compliance reporting, and forensic analysis capabilities.
 *
 * Features:
 * - Immutable audit trail with cryptographic integrity
 * - Structured logging with full context capture
 * - Compliance report generation (GDPR, HIPAA, PCI-DSS, etc.)
 * - Retention policy enforcement
 * - Export capabilities for external SIEM integration
 * - Query and search functionality
 * - Automated log rotation and archival
 * - Real-time streaming to external systems
 */
import { EventEmitter } from 'events';
import { ClassificationLevel, ComplianceFramework, ClassificationResult, DataElement } from './DataClassifier';
import { AlertSeverity } from './ClassificationMonitor';
export declare enum AuditEventType {
    CLASSIFICATION_PERFORMED = "classification_performed",
    CLASSIFICATION_UPDATED = "classification_updated",
    RULE_APPLIED = "rule_applied",
    RULE_MODIFIED = "rule_modified",
    POLICY_VIOLATION = "policy_violation",
    ACCESS_GRANTED = "access_granted",
    ACCESS_DENIED = "access_denied",
    DATA_EXPORTED = "data_exported",
    DATA_DELETED = "data_deleted",
    CONFIGURATION_CHANGED = "configuration_changed",
    SYSTEM_EVENT = "system_event",
    export,
    interface,
    AuditLogEntry
}
export interface AuditQueryFilter {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: AuditEventType;
    userIds?: string;
    dataIds?: string;
    classificationLevels?: ClassificationLevel;
    complianceFrameworks?: ComplianceFramework;
    resultStatus?: 'success' | 'failure';
    searchText?: string;
    limit?: number;
    offset?: number;
}
export interface ComplianceReport {
    framework: ComplianceFramework;
    reportPeriod: {
        start: Date;
        end: Date;
    };
    summary: {
        totalEvents: number;
        compliantEvents: number;
        violations: number;
        complianceRate: number;
    };
    dataProcessing: {
        classified: number;
        accessed: number;
        exported: number;
        deleted: number;
    };
    violationDetails: Array<{}, timestamp>;
    Date: any;
    eventId: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation?: string;
}
export interface RetentionPolicy {
    framework: ComplianceFramework;
    eventType: AuditEventType;
    retentionDays: number;
    archiveAfterDays?: number;
    deleteAfterDays: number;
    requiresApproval: boolean;
}
export declare enum ExportFormat {
    JSON = "json",
    CSV = "csv",
    SYSLOG = "syslog",
    CEF = "cef",// Common Event Format
    LEEF = "leef",// Log Event Extended Format
    export,
    interface,
    AuditLoggerConfig
}
export declare class ClassificationAuditLogger extends EventEmitter {
    private config;
    private logs;
    private logIndex;
    private sequenceNumber;
    private lastHash;
    private rotationTimer?;
    private archiveTimer?;
    private currentLogSize;
    private signatureKey;
    private batchQueue;
    private batchTimer?;
    private compressionCache;
    constructor(config: AuditLoggerConfig);
    /**
    * Log a classification event
    */
    logClassification(): any;
    dataElement: DataElement;
    result: ClassificationResult;
    actor: AuditLogEntry['actor'];
    duration: number;
    /**
     * Log a classification update
     */
    logClassificationUpdate(): any;
    dataId: string;
    oldLevel: ClassificationLevel;
    newLevel: ClassificationLevel;
    reason: string;
    actor: AuditLogEntry['actor'];
    /**
     * Log a policy violation
     */
    logPolicyViolation(): any;
    violation: {
        dataId: string;
        policyId: string;
        description: string;
        severity: AlertSeverity;
        framework: ComplianceFramework;
    };
    actor: AuditLogEntry['actor'];
    /**
     * Log data access event
     */
    logDataAccess(): any;
    dataId: string;
    accessGranted: boolean;
    reason: string;
    actor: AuditLogEntry['actor'];
    classification?: ClassificationResult;
    /**
     * Query audit logs
     */
    queryLogs(filter: AuditQueryFilter): Promise<AuditLogEntry>;
    /**
    * Generate compliance report
    */
    generateComplianceReport(): any;
    framework: ComplianceFramework;
    startDate: Date;
    endDate: Date;
    const violations: any;
    log: any;
    log: any;
    eventType: any;
}
//# sourceMappingURL=ClassificationAuditLogger.d.ts.map