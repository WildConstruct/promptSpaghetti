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
import { ClassificationLevel,
  DataCategory,
  ComplianceFramework,
  ClassificationResult }
  DataElement
} from './DataClassifier';
import { AlertSeverity } from './ClassificationMonitor';
export declare enum AuditEventType { CLASSIFICATION_PERFORMED = "classification_performed",
    CLASSIFICATION_UPDATED = "classification_updated",
    RULE_APPLIED = "rule_applied",
    RULE_MODIFIED = "rule_modified",
    POLICY_VIOLATION = "policy_violation",
    ACCESS_GRANTED = "access_granted",
    ACCESS_DENIED = "access_denied",
    DATA_EXPORTED = "data_exported",
    DATA_DELETED = "data_deleted",
    CONFIGURATION_CHANGED = "configuration_changed" }
    SYSTEM_EVENT = "system_event"

}
}
export interface AuditLogEntry { id: string;
    timestamp: Date;
    eventType: AuditEventType;
    actor: {
        userId?: string;
        systemId?: string;
        ipAddress: string;
        userAgent?: string;
        sessionId?: string }
}
    };
    target: { dataId?: string;
        resourceType: string;
        resourceId: string;
        classification?: ClassificationResult };
    action: { operation: string;
        result: 'success' | 'failure';
        reason?: string;
        duration?: number };
    context: { environment: string;
        applicationVersion: string;
        correlationId?: string;
        parentEventId?: string;
        metadata: Record<string, any> };
    compliance: { frameworks: ComplianceFramework[];
        dataCategory?: DataCategory;
        retentionRequired: boolean;
        encryptionApplied: boolean };
    integrity: { hash: string;
        previousHash: string;
        signature?: string;
        sequenceNumber: number };

}
}
export interface AuditQueryFilter { startDate?: Date;
    endDate?: Date;
    eventTypes?: AuditEventType[];
    userIds?: string[];
    dataIds?: string[];
    classificationLevels?: ClassificationLevel[];
    complianceFrameworks?: ComplianceFramework[];
    resultStatus?: 'success' | 'failure';
    searchText?: string;
    limit?: number;
    offset?: number }
}
}
export interface ComplianceReport { framework: ComplianceFramework;
    reportPeriod: {
        start: Date;
        end: Date }
}
    };
    summary: { totalEvents: number;
        compliantEvents: number;
        violations: number;
        complianceRate: number };
    dataProcessing: { classified: number;
        accessed: number;
        exported: number;
        deleted: number };
    violationDetails: Array<{ timestamp: Date;
        eventId: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        remediation?: string }>;
    recommendations: string[];
    generatedAt: Date;
    generatedBy: string;

}
}
export interface RetentionPolicy { framework: ComplianceFramework;
    eventType: AuditEventType;
    retentionDays: number;
    archiveAfterDays?: number;
    deleteAfterDays: number;
    requiresApproval: boolean;

export declare enum ExportFormat {
    JSON = "json";
    CSV = "csv";
    SYSLOG = "syslog" }
    CEF = "cef",// Common Event Format
    LEEF = "leef"

}
}
}
export interface AuditLoggerConfig { enableRealTimeLogging: boolean;
    enableCompression: boolean;
    enableEncryption: boolean;
    encryptionKey?: Buffer;
    signatureKey?: Buffer;
    retentionPolicies: RetentionPolicy[];
    logRotationSizeMB: number;
    logRotationIntervalHours: number;
    archiveLocation: string;
    streamEndpoints?: Array<{
        url: string;
        format: ExportFormat;
        headers?: Record<string, string> }
}
    }>;
    performanceMode: 'balanced' | 'high_performance' | 'high_security';
/**
 * Classification Audit Logger Service
 */
export declare class ClassificationAuditLogger extends EventEmitter { private config;
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
    logClassification();
      dataElement: DataElement
      result: ClassificationResult
      actor: AuditLogEntry['actor']
      duration: number
    ): Promise<string>;
    /**
     * Log a classification update
     */
    logClassificationUpdate();
      dataId: string
      oldLevel: ClassificationLevel
      newLevel: ClassificationLevel
      reason: string
      actor: AuditLogEntry['actor'] }
    ): Promise<string>;
    /**
     * Log a policy violation
     */
    logPolicyViolation(violation: { )
        dataId: string;
        policyId: string;
        description: string;
        severity: AlertSeverity;
        framework: ComplianceFramework }, actor: AuditLogEntry['actor']): Promise<string>;
    /**
     * Log data access event
     */
    logDataAccess();
      dataId: string
      accessGranted: boolean
      reason: string
      actor: AuditLogEntry['actor']
      classification?: ClassificationResult
    ): Promise<string>;
    /**
     * Query audit logs
     */
    queryLogs(filter: AuditQueryFilter): Promise<AuditLogEntry[]>;
    /**
     * Generate compliance report
     */
    generateComplianceReport(framework: ComplianceFramework, startDate: Date, endDate: Date): Promise<ComplianceReport>;
    /**
     * Export logs in specified format
     */
    exportLogs(filter: AuditQueryFilter, format: ExportFormat): Promise<string>;
    /**
     * Verify log integrity
     */
    verifyIntegrity(startId?: string, endId?: string): Promise<{ valid: boolean;
        errors: Array<{
            logId: string;
            error: string }>;
    }>;
    private createAuditEntry;
    private storeLog;
    private calculateLogHash;
    private signLog;
    private verifySignature;
    private scheduleBatchFlush;
    private streamLog;
    private rotateLogs;
    private exportAsJSON;
    private exportAsCSV;
    private exportAsSyslog;
    private exportAsCEF;
    private exportAsLEEF;
    private mapToSeverity;
    private mapAlertSeverityToComplianceSeverity;
    private generateRecommendations;
    private generateLogId;
    private initializeTimers;
    private enforceRetentionPolicies;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;

export default ClassificationAuditLogger;
//# sourceMappingURL=ClassificationAuditLogger.d.ts.map