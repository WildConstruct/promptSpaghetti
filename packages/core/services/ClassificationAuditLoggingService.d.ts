/**
 * Classification Audit Logging Service
 *
 * Provides comprehensive audit logging for data classification activities,
 * ensuring compliance and traceability for all classification-related operations.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, OperationContext } from '../types/DataClassification';

}
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    userId: string;
    sessionId: string;
    requestId: string;
    action: AuditAction;
    classification: DataClassificationLevel;
    dataId: string;
    resourceType: 'DOCUMENT' | 'FILE' | 'DATABASE' | 'API' | 'SYSTEM' | 'USER_DATA';
    details: AuditDetails;
    context: OperationContext;
    outcome: AuditOutcome;
    metadata: AuditMetadata;
    complianceFlags: ComplianceFlag[];
    riskScore: number;
    correlationId?: string;

export type AuditAction = 'CLASSIFY_DATA' | 'DECLASSIFY_DATA' | 'RECLASSIFY_DATA' | 'ACCESS_DATA' | 'EXPORT_DATA' | 'SHARE_DATA' | 'DELETE_DATA' | 'BACKUP_DATA' | 'RESTORE_DATA' | 'POLICY_CHANGE' | 'PERMISSION_GRANT' | 'PERMISSION_REVOKE' | 'ENCRYPTION_APPLIED' | 'ENCRYPTION_REMOVED' | 'COMPLIANCE_CHECK' | 'VIOLATION_DETECTED' | 'REMEDIATION_APPLIED' | 'ALERT_TRIGGERED' | 'ALERT_RESOLVED';

}
export interface AuditDetails {
    previousClassification?: DataClassificationLevel;
    newClassification?: DataClassificationLevel;
    accessMethod: string;
    toolUsed: string;
    businessJustification?: string;
    approvalRequired: boolean;
    approvedBy?: string;
    automaticAction: boolean;
    dataSize?: number;
    fieldCount?: number;
    piiDetected: boolean;
    encryptionStatus: 'ENCRYPTED' | 'NOT_ENCRYPTED' | 'PARTIALLY_ENCRYPTED';
    customProperties?: Record<string, any>;

}
export interface AuditOutcome {
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    warningMessages: string[];
    executionTimeMs: number;
    resourcesAffected: number;
    complianceScore: number;
    violationsDetected: string[];
    remediationRequired: boolean;

}
export interface AuditMetadata {
    sourceIP: string;
    userAgent: string;
    geolocation?: {
        country: string;
        region: string;
        city: string;
        coordinates: [number, number];
}
    };
    deviceInfo?: {
        deviceId: string;
        deviceType: string;
        operatingSystem: string;
        browser: string;
    };
    networkInfo?: {
        vpnDetected: boolean;
        proxyDetected: boolean;
        networkQuality: 'HIGH' | 'MEDIUM' | 'LOW'
  };
    organizationInfo?: {
        organizationId: string;
        department: string;
        role: string;
        accessLevel: string;
    };

}
export interface ComplianceFlag {
    framework: string;
    requirement: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW' | 'EXEMPTED';
    evidence?: string;
    assessmentDate: Date;
    nextReviewDate?: Date;

}
export interface AuditQuery {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    classification?: DataClassificationLevel;
    action?: AuditAction;
    resourceType?: string;
    successOnly?: boolean;
    riskScoreMin?: number;
    riskScoreMax?: number;
    complianceFramework?: string;
    correlationId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'riskScore' | 'classification' | 'userId';
    sortOrder?: 'asc' | 'desc';

}
export interface AuditReport {
    id: string;
    name: string;
    description: string;
    generatedAt: Date;
    requestedBy: string;
    parameters: AuditQuery;
    summary: AuditSummary;
    entries: AuditLogEntry[];
    format: 'JSON' | 'CSV' | 'PDF' | 'XML';
    retentionPeriod: number;
    expiresAt: Date;

}
export interface AuditSummary {
    totalEntries: number;
    uniqueUsers: number;
    timeRange: {
        start: Date;
        end: Date;
}
    };
    actionBreakdown: Record<AuditAction, number>;
    classificationBreakdown: Record<DataClassificationLevel, number>;
    complianceBreakdown: Record<string, {
        compliant: number;
        nonCompliant: number;
        needsReview: number;
    }>;
    riskAnalysis: {
        averageRiskScore: number;
        highRiskEntries: number;
        criticalViolations: number;
    };
    trendsAnalysis: {
        activityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
        riskTrend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
        complianceTrend: 'IMPROVING' | 'DEGRADING' | 'STABLE'
  };

}
export interface AuditRetentionPolicy {
    classification: DataClassificationLevel;
    retentionDays: number;
    archiveAfterDays: number;
    permanentDeletionAfterDays: number;
    complianceRequirements: string[];
    encryptionRequired: boolean;
    backupRequired: boolean;

export declare class ClassificationAuditLoggingService {
    private auditLogs;
    private reports;
    private retentionPolicies;
    private logHandlers;
    private archiveHandlers;
    constructor();
    /**
     * Initialize default audit retention policies
     */
    private initializeRetentionPolicies;
    /**
     * Log an audit entry
     */
    logAuditEvent();
      action: AuditAction,
      classification: DataClassificationLevel,
      dataId: string,
      details: Partial<AuditDetails>,
      context: OperationContext,
      outcome: Partial<AuditOutcome>,
      metadata?: Partial<AuditMetadata>
    ): Promise<string>;
    /**
     * Determine resource type from data ID
     */
    private determineResourceType;
    /**
     * Generate compliance flags for the entry
     */
    private generateComplianceFlags;
    /**
     * Get compliance requirement for framework and action
     */
    private getComplianceRequirement;
    /**
     * Calculate risk score for the entry
     */
    private calculateRiskScore;
    /**
     * Generate correlation ID for related events
     */
    private generateCorrelationId;
    /**
     * Perform compliance checks on the entry
     */
    private performComplianceChecks;
    /**
     * Query audit logs
     */
    queryAuditLogs(query: AuditQuery): AuditLogEntry[];
    /**
     * Generate audit report
     */
    generateAuditReport();
      name: string,
      description: string,
      query: AuditQuery,
      format: AuditReport["format"] | undefined,
      requestedBy: string,
    ): Promise<string>;
    /**
     * Generate audit summary
     */
    private generateAuditSummary;
    /**
     * Export audit report
     */
    exportAuditReport(reportId: string): string | null;
    /**
     * Get audit entry by ID
     */
    getAuditEntry(entryId: string): AuditLogEntry | undefined;
    /**
     * Get audit report by ID
     */
    getAuditReport(reportId: string): AuditReport | undefined;
    /**
     * Register log handler
     */
    onAuditLog(handler: (entry: AuditLogEntry) => void): void;
    /**
     * Register archive handler
     */
    onArchive(handler: (entries: AuditLogEntry[]) => void): void;
    /**
     * Notify log handlers
     */
    private notifyLogHandlers;
    /**
     * Start retention cleanup process
     */
    private startRetentionCleanup;
    /**
     * Perform retention cleanup
     */
    private performRetentionCleanup;
    /**
     * Get retention policy
     */
    getRetentionPolicy(classification: DataClassificationLevel): AuditRetentionPolicy | undefined;
    /**
     * Update retention policy
     */
    updateRetentionPolicy(classification: DataClassificationLevel, policy: AuditRetentionPolicy): void;
    /**
     * Get audit statistics
     */
    getAuditStatistics(): {
        totalEntries: number;
        entriesByClassification: Record<DataClassificationLevel, number>;
        entriesByAction: Record<string, number>;
        averageRiskScore: number;
        recentViolations: number;
}
    };
    /**
     * Clear audit logs (for testing purposes)
     */
    clearAuditLogs(): void;

export default ClassificationAuditLoggingService;
//# sourceMappingURL=ClassificationAuditLoggingService.d.ts.map