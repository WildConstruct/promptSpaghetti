/**
 * Security Event Configuration
 * Centralized configuration for security logging and compliance requirements
 * Part of Epic 19 - Security & Compliance Framework
 */
import { ComplianceFramework, DataSensitivityLevel } from './DataProtectionEventLogger';

}
export interface SecurityEventConfig {
    logging: LoggingConfiguration;
    alerting: AlertingConfiguration;
    retention: RetentionConfiguration;
    compliance: ComplianceConfiguration;
    performance: PerformanceConfiguration;

}
export interface LoggingConfiguration {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    destinations: LogDestination[];
    encryption: EncryptionConfiguration;
    batchSize: number;
    flushInterval: number;
    bufferSize: number;
    enableCircuitBreaker: boolean;
    circuitBreakerConfig: CircuitBreakerConfiguration;

}
export interface LogDestination {
    type: 'file' | 'database' | 'siem' | 'webhook' | 'elasticsearch';
    config: Record<string, any>;
    enabled: boolean;
    filters: LogFilter[];
    formatters: LogFormatter[];

}
export interface LogFilter {
    field: string;
    operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than';
    value: any;
    invert: boolean;

}
export interface LogFormatter {
    type: 'json' | 'structured' | 'syslog' | 'cef' | 'leef';
    template?: string;
    includeFields?: string[];
    excludeFields?: string[];

}
export interface EncryptionConfiguration {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'AES-256-CBC';
    keyRotationInterval: number;
    encryptSensitiveFields: boolean;
    sensitiveFields: string[];

}
export interface CircuitBreakerConfiguration {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    enabled: boolean;

}
export interface AlertingConfiguration {
    enabled: boolean;
    rules: SecurityAlertRule[];
    channels: AlertChannel[];
    suppressionRules: SuppressionRule[];
    escalationPolicies: EscalationPolicy[];

}
export interface SecurityAlertRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    eventTypes: string[];
    conditions: AlertCondition[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
    suppressionRules?: string[];
    escalationPolicy?: string;
    metadata: Record<string, any>;

}
export interface AlertCondition {
    type: 'threshold' | 'pattern' | 'anomaly' | 'correlation';
    field: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'regex' | 'exists';
    value: any;
    timeWindow: number;
    aggregation?: 'count' | 'sum' | 'avg' | 'max' | 'min';
    groupBy?: string[];

}
export interface AlertChannel {
    id: string;
    type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'sms';
    config: Record<string, any>;
    enabled: boolean;
    rateLimits: RateLimit[];

}
export interface RateLimit {
    maxAlerts: number;
    timeWindow: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';

}
export interface SuppressionRule {
    id: string;
    name: string;
    enabled: boolean;
    conditions: AlertCondition[];
    duration: number;
    reason: string;

}
export interface EscalationPolicy {
    id: string;
    name: string;
    enabled: boolean;
    steps: EscalationStep[];

}
export interface EscalationStep {
    delay: number;
    channels: string[];
    condition?: 'unacknowledged' | 'unresolved';

}
export interface RetentionConfiguration {
    policies: RetentionPolicy[];
    archival: ArchivalConfiguration;
    deletion: DeletionConfiguration;

}
export interface RetentionPolicy {
    id: string;
    name: string;
    framework: ComplianceFramework;
    eventTypes: string[];
    dataClassifications: DataSensitivityLevel[];
    retentionPeriod: number;
    archivalRequired: boolean;
    encryptionRequired: boolean;
    immutableStorage: boolean;
    purgeAfterRetention: boolean;
    exceptions: RetentionException[];

}
export interface RetentionException {
    reason: 'legal_hold' | 'investigation' | 'regulatory_request' | 'data_subject_request';
    extendedPeriod: number;
    approvalRequired: boolean;
    notificationRequired: boolean;

}
export interface ArchivalConfiguration {
    enabled: boolean;
    storageBackend: 'file' | 's3' | 'azure_blob' | 'gcs';
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    verificationEnabled: boolean;

}
export interface DeletionConfiguration {
    enabled: boolean;
    scheduledDeletion: boolean;
    batchSize: number;
    verificationRequired: boolean;
    backupBeforeDeletion: boolean;
    auditDeletion: boolean;

}
export interface ComplianceConfiguration {
    frameworks: ComplianceFrameworkConfig[];
    reporting: ReportingConfiguration;
    monitoring: ComplianceMonitoringConfiguration;

}
export interface ComplianceFrameworkConfig {
    framework: ComplianceFramework;
    enabled: boolean;
    requirements: ComplianceRequirement[];
    reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    alertOnViolations: boolean;

}
export interface ComplianceRequirement {
    id: string;
    name: string;
    description: string;
    mandatory: boolean;
    eventTypes: string[];
    validationRules: ValidationRule[];

}
export interface ValidationRule {
    field: string;
    required: boolean;
    validation: 'regex' | 'range' | 'enum' | 'custom';
    value: any;
    message: string;

}
export interface ReportingConfiguration {
    enabled: boolean;
    autoGeneration: boolean;
    outputFormats: ('json' | 'csv' | 'pdf' | 'xlsx')[];
    recipients: ReportRecipient[];
    schedules: ReportSchedule[];

}
export interface ReportRecipient {
    email: string;
    role: string;
    frameworks: ComplianceFramework[];
    reportTypes: string[];

}
export interface ReportSchedule {
    id: string;
    framework: ComplianceFramework;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    time: string;
    enabled: boolean;

}
export interface ComplianceMonitoringConfiguration {
    enabled: boolean;
    continuousMonitoring: boolean;
    violationAlerts: boolean;
    dashboardEnabled: boolean;
    metricsCollection: boolean;

}
export interface PerformanceConfiguration {
    monitoring: {
        enabled: boolean;
        metricsCollectionInterval: number;
        alertThresholds: PerformanceThreshold[];
}
    };
    optimization: {
        asyncLogging: boolean;
        batchProcessing: boolean;
        caching: CacheConfiguration;
        compression: boolean;
    };
    scaling: {
        autoScaling: boolean;
        maxConcurrentEvents: number;
        queueMaxSize: number;
        workerPoolSize: number;
    };

}
export interface PerformanceThreshold {
    metric: 'latency' | 'throughput' | 'error_rate' | 'queue_depth';
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    action: 'log' | 'alert' | 'throttle' | 'circuit_break';

}
export interface CacheConfiguration {
    enabled: boolean;
    type: 'memory' | 'redis' | 'memcached';
    ttl: number;
    maxSize: number;
    evictionPolicy: 'lru' | 'lfu' | 'fifo';
/**
 * Default Security Event Configuration
 * Production-ready configuration with security best practices
 */
export declare const DEFAULT_SECURITY_EVENT_CONFIG: SecurityEventConfig;
/**
 * Development Security Event Configuration
 * Lighter configuration for development and testing
 */
export declare const DEVELOPMENT_SECURITY_EVENT_CONFIG: SecurityEventConfig;
//# sourceMappingURL=SecurityEventConfiguration.d.ts.map
}