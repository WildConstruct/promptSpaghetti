/**
 * Security Data Consistency and Integrity Monitor
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263642-C5C152
 *
 * Comprehensive monitoring for security data integrity, consistency validation,
 * and automatic remediation of data corruption or tampering attempts.
 */
import { EventEmitter } from 'events';
export interface DataIntegrityCheck {
    id: string;
    name: string;
    description: string;
    type: 'hash_verification' | 'schema_validation' | 'referential_integrity' | 'temporal_consistency' | 'business_rule' | 'digital_signature';
    target: {
        dataType: 'audit_logs' | 'security_events' | 'user_data' | 'configuration' | 'certificates' | 'keys' | 'policies' | 'alerts';
        location: string;
        scope: 'full' | 'incremental' | 'sample';
        filters?: Record<string, any>;
    };
    parameters: {
        hashAlgorithm?: 'sha256' | 'sha512' | 'md5';
        expectedSchema?: any;
        referenceFields?: string;
        timeWindow?: number;
        businessRules?: string;
        signatureVerification?: {
            publicKeyPath: string;
            algorithmSuite: 'RSA' | 'ECDSA' | 'EdDSA';
        };
    };
    schedule: {
        enabled: boolean;
        frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'on_demand';
        interval?: number;
        cronExpression?: string;
        triggerEvents?: string;
    };
    thresholds: {
        errorThreshold: number;
        errorRate: number;
        severityMapping: {
            minor: number;
            major: number;
            critical: number;
        };
    };
    remediation: {
        autoRemediate: boolean;
        actions: AutoRemediationAction;
        rollbackSupported: boolean;
        requiresApproval: boolean;
    };
    createdBy: string;
    createdAt: number;
    lastUpdated: number;
    enabled: boolean;
}
export interface AutoRemediationAction {
    id: string;
    name: string;
    type: 'restore_backup' | 'regenerate_hash' | 'repair_reference' | 'revert_change' | 'quarantine_data' | 'notify_admin' | 'lock_account' | 'rotate_keys';
    description: string;
    parameters: {
        backupSource?: string;
        targetLocation?: string;
        notificationRecipients?: string;
        quarantineLocation?: string;
        lockDuration?: number;
        keyRotationScope?: string;
    };
    safetyChecks: {
        requiresConfirmation: boolean;
        testMode: boolean;
        dryRun: boolean;
        backupBeforeAction: boolean;
        maxRetries: number;
    };
    constraints: {
        businessHoursOnly: boolean;
        requiresMaintenanceWindow: boolean;
        maxConcurrentExecutions: number;
        cooldownPeriod: number;
    };
}
export interface IntegrityCheckResult {
    checkId: string;
    executionId: string;
    startTime: number;
    endTime: number;
    status: 'passed' | 'failed' | 'error' | 'warning';
    summary: {
        totalRecords: number;
        recordsChecked: number;
        recordsPassed: number;
        recordsFailed: number;
        recordsSkipped: number;
        errorRate: number;
    };
    findings: IntegrityFinding;
    performance: {
        executionTime: number;
        throughput: number;
        resourceUsage: {
            cpu: number;
            memory: number;
            io: number;
        };
    };
    remediationResults?: RemediationResult;
    metadata: {
        checksum: string;
        version: string;
        environment: string;
        triggeredBy: 'schedule' | 'event' | 'manual';
        correlationId?: string;
    };
}
export interface IntegrityFinding {
    id: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    category: 'corruption' | 'tampering' | 'inconsistency' | 'missing_data' | 'unauthorized_change' | 'schema_violation' | 'business_rule_violation';
    title: string;
    description: string;
    affectedData: {
        location: string;
        recordIds: string;
        fields: string;
        estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
    };
    evidence: {
        expectedValue?: any;
        actualValue?: any;
        previousValue?: any;
        changeTimestamp?: number;
        changeSource?: string;
        digitalSignature?: string;
        checksumMismatch?: {
            expected: string;
            actual: string;
            algorithm: string;
        };
    };
    context: {
        relatedFindings: string;
        possibleCauses: string;
        riskAssessment: string;
        businessImpact: string;
        technicalImpact: string;
    };
    resolution: {
        status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'accepted_risk';
        assignedTo?: string;
        resolvedBy?: string;
        resolvedAt?: number;
        resolutionNotes?: string;
        preventiveActions?: string;
    };
    firstDetected: number;
    lastSeen: number;
    occurrenceCount: number;
}
export interface RemediationResult {
    actionId: string;
    actionName: string;
    status: 'success' | 'failed' | 'partial' | 'skipped';
    startTime: number;
    endTime: number;
    details: {
        recordsProcessed: number;
        recordsRepaired: number;
        recordsFailed: number;
        backupCreated?: string;
        rollbackAvailable: boolean;
    };
    errors?: Array<{
        recordId: string;
    }, error>;
    string: any;
    severity: 'warning' | 'error' | 'critical';
}
export interface DataIntegrityMetrics {
    overallIntegrityScore: number;
    dataHealthTrend: 'improving' | 'stable' | 'degrading';
    checksRun: number;
    checksTotal: number;
    checkSuccessRate: number;
    averageCheckDuration: number;
    totalFindings: number;
    findingsBySeverity: Record<IntegrityFinding['severity'], number>;
    findingsByCategory: Record<IntegrityFinding['category'], number>;
    findingTrends: {
        newFindings: number;
        resolvedFindings: number;
        recurringFindings: number;
    };
    remediationSuccessRate: number;
    averageRemediationTime: number;
    automaticRemediations: number;
    manualRemediations: number;
    dataQualityScore: number;
    corruptionRate: number;
    consistencyScore: number;
    completenessScore: number;
    systemImpact: {
        averageCpuUsage: number;
        averageMemoryUsage: number;
        averageIoUsage: number;
        performanceImpact: 'minimal' | 'low' | 'medium' | 'high';
    };
    timeRange: {
        start: number;
        end: number;
    };
}
export interface DataIntegrityConfig {
    enabled: boolean;
    defaultHashAlgorithm: 'sha256' | 'sha512';
    maxConcurrentChecks: number;
    checkTimeout: number;
    storage: {
        resultRetentionDays: number;
        backupRetentionDays: number;
        logRetentionDays: number;
        compressionEnabled: boolean;
        encryptionEnabled: boolean;
    };
    performance: {
        maxResourceUsage: {
            cpu: number;
            memory: number;
            io: number;
        };
        throttling: {
            enabled: boolean;
            maxRecordsPerSecond: number;
            pauseDuration: number;
        };
        batchSize: number;
    };
    alerting: {
        enabled: boolean;
        immediateNotification: {
            severityThreshold: IntegrityFinding['severity'];
            recipients: string;
            channels: ('email' | 'sms' | 'slack' | 'webhook')[];
        };
        summaryReports: {
            enabled: boolean;
            frequency: 'daily' | 'weekly' | 'monthly';
            recipients: string;
            includeMetrics: boolean;
        };
    };
    integrations: {
        siem: {
            enabled: boolean;
            endpoint: string;
            apiKey: string;
            eventTypes: string;
        };
        backup: {
            enabled: boolean;
            backupLocation: string;
            encryptBackups: boolean;
            compressionLevel: number;
        };
        audit: {
            enabled: boolean;
            auditAllChanges: boolean;
            auditLevel: 'basic' | 'detailed' | 'comprehensive';
        };
    };
    compliance: {
        frameworks: string;
        requireDigitalSignatures: boolean;
        immutableLogging: boolean;
        changeApprovalRequired: boolean;
    };
}
export declare class SecurityDataIntegrityMonitor extends EventEmitter {
    private config;
    private integrityChecks;
    private activeExecutions;
    private checkHistory;
    private activeFindings;
    private remediationQueue;
    string: any;
    actionId: string;
    priority: number;
    scheduledTime: number;
}
//# sourceMappingURL=SecurityDataIntegrityMonitor.d.ts.map