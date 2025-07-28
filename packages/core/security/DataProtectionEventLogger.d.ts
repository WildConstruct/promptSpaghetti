/**
 * Data Protection Event Logger
 * Specialized logging for GDPR, CCPA, and data protection compliance events
 * Part of Epic 19 - Security & Compliance Framework
 */
import { SecurityLogger } from './SecurityLogger';
import { AuditLogger } from './AuditLogger';
export declare enum DataProtectionEventType {
    DATA_RETENTION_APPLIED = "data_retention_applied",
    DATA_AGING_DETECTED = "data_aging_detected",
    DATA_DELETION_SCHEDULED = "data_deletion_scheduled",
    DATA_DELETION_EXECUTED = "data_deletion_executed",
    DATA_DELETION_FAILED = "data_deletion_failed",
    DATA_RETENTION_EXEMPTION = "data_retention_exemption",
    CONSENT_GRANTED = "consent_granted",
    CONSENT_WITHDRAWN = "consent_withdrawn",
    CONSENT_EXPIRED = "consent_expired",
    PRIVACY_REQUEST_RECEIVED = "privacy_request_received",
    DATA_SUBJECT_ACCESS = "data_subject_access",
    DATA_PORTABILITY_REQUEST = "data_portability_request",
    RIGHT_TO_ERASURE = "right_to_erasure",
    POLICY_VIOLATION_DETECTED = "policy_violation_detected",
    COMPLIANCE_RULE_TRIGGERED = "compliance_rule_triggered",
    REGULATORY_ALERT = "regulatory_alert",
    POLICY_UPDATE_APPLIED = "policy_update_applied",
    COMPLIANCE_AUDIT_ACCESS = "compliance_audit_access"

export declare enum DataSensitivityLevel {
    PUBLIC = "public",
    INTERNAL = "internal",
    CONFIDENTIAL = "confidential",
    RESTRICTED = "restricted",
    PII = "pii",
    SPECIAL_CATEGORY = "special_category"

export declare enum ComplianceFramework {
    GDPR = "gdpr",
    CCPA = "ccpa",
    SOX = "sox",
    HIPAA = "hipaa",
    CUSTOM = "custom"

export interface DataProtectionEvent {
    eventType: DataProtectionEventType;
    timestamp: Date;
    correlationId: string;
    userId: string;
    dataSubject?: string;
    resourceType: string;
    resourceId: string;
    dataClassification: DataSensitivityLevel;
    operation: 'read' | 'write' | 'export' | 'delete' | 'share' | 'anonymize';
    legalBasis?: string;
    consentId?: string;
    retentionPolicy?: string;
    automatedDecision: boolean;
    complianceFrameworks: ComplianceFramework[];
    metadata?: Record<string, any>;

export interface DataDeletionEvent extends DataProtectionEvent {
    deletionJobId: string;
    scheduledTime: Date;
    executionTime?: Date;
    deletionRule: string;
    affectedRecords: {,
        expected: number;
        processed: number;
        successful: number;
        failed: number;
    };
    failureReasons?: string[];
    exemptionReasons?: string[];

export interface PrivacyRequestEvent extends DataProtectionEvent {
    requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
    requestId: string;
    requestDate: Date;
    responseDeadline: Date;
    status: 'received' | 'processing' | 'completed' | 'rejected' | 'overdue';
    dataCategories: string[];
    processingPurposes: string[];

export interface PolicyViolationEvent extends DataProtectionEvent {
    violationType: string;
    policyId: string;
    policyVersion: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    mitigationActions: string[];
    requiresNotification: boolean;
    notificationDeadline?: Date;
/**
 * Data Protection Event Logger
 * Provides specialized logging for privacy and compliance events
 */
export declare class DataProtectionEventLogger {
    private securityLogger;
    private auditLogger;
    private complianceMode;
    private retentionPolicies;
    constructor(securityLogger?: SecurityLogger, auditLogger?: AuditLogger, options?: {)
        complianceMode?: boolean;
        retentionPolicies?: Map<ComplianceFramework, number>;
    });
    /**
     * Log a data protection event
     */
    logDataProtectionEvent(event: DataProtectionEvent): Promise<void>;
    /**
     * Log a data deletion event with detailed tracking
     */
    logDataDeletionEvent(event: DataDeletionEvent): Promise<void>;
    /**
     * Log a privacy request event (GDPR/CCPA requests)
     */
    logPrivacyRequestEvent(event: PrivacyRequestEvent): Promise<void>;
    /**
     * Log a policy violation event
     */
    logPolicyViolationEvent(event: PolicyViolationEvent): Promise<void>;
    /**
     * Generate compliance report data for a specific framework and time period
     */
    generateComplianceReport(framework: ComplianceFramework, startDate: Date, endDate: Date): Promise<ComplianceReport>;
    private validateEvent;
    private determineEventLevel;
    private checkAlertingRules;
    private logFailedDeletionAlert;
    private logOverduePrivacyRequestAlert;
    private logCriticalViolationAlert;
    private generateEventId;
    private getDefaultRetentionPolicies;
    private aggregateEventTypes;
    private aggregateDataSubjects;
    private aggregateViolations;
    private aggregatePrivacyRequests;
    private calculateRetentionCompliance;

export interface ComplianceReport {
    framework: ComplianceFramework;
    reportPeriod: {,
        start: Date;
        end: Date;
    };
    eventCount: number;
    eventTypes: Record<string, number>;
    dataSubjects: Record<string, number>;
    violations: any[];
    privacyRequests: any[];
    retentionCompliance: ComplianceMetrics;
    generatedAt: Date;

export interface ComplianceMetrics {
    totalEvents: number;
    pastRetentionEvents: number;
    improperllyRetainedEvents: number;
    compliancePercentage: number;

//# sourceMappingURL=DataProtectionEventLogger.d.ts.map