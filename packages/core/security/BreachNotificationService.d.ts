/**
 * Automated Breach Notification Service
 *
 * Comprehensive breach detection and notification system compliant with
 * GDPR Article 33, NIST incident response guidelines, and 2025 security standards.
 *
 * Features:
 * - Automated breach detection and classification
 * - 72-hour GDPR compliance workflow
 * - Multi-channel notification system
 * - Incident response orchestration
 * - Audit trail and documentation
 */
import { EventEmitter } from 'events';
export declare enum BreachSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export declare enum BreachType {
    CONFIDENTIALITY = "confidentiality",
    INTEGRITY = "integrity",
    AVAILABILITY = "availability",
    COMBINED = "combined"

export declare enum BreachCategory {
    CYBER_ATTACK = "cyber_attack",
    HUMAN_ERROR = "human_error",
    SYSTEM_FAILURE = "system_failure",
    PHYSICAL_BREACH = "physical_breach",
    THIRD_PARTY = "third_party"

export declare enum NotificationType {
    INTERNAL_ALERT = "internal_alert",
    REGULATORY_FILING = "regulatory_filing",
    CUSTOMER_NOTIFICATION = "customer_notification",
    PUBLIC_DISCLOSURE = "public_disclosure",
    LAW_ENFORCEMENT = "law_enforcement"

export declare enum DataSubjectCategory {
    EMPLOYEES = "employees",
    CUSTOMERS = "customers",
    PROSPECTS = "prospects",
    PARTNERS = "partners",
    MINORS = "minors",
    VULNERABLE_GROUPS = "vulnerable_groups"

}
export interface BreachIncident {
    id: string;
    title: string;
    description: string;
    detectedAt: Date;
    reportedAt?: Date;
    severity: BreachSeverity;
    type: BreachType;
    category: BreachCategory;
    dataTypes: string[];
    dataSubjects: {
        category: DataSubjectCategory;
        count: number;
        countries: string[];
}
    }[];
    affectedSystems: string[];
    rootCause?: string;
    containmentActions: string[];
    mitigationMeasures: string[];
    status: IncidentStatus;
    assignee?: string;
    dueDate?: Date;
    notifications: NotificationRecord[];
    evidence: EvidenceRecord[];
    timeline: TimelineEvent[];
    riskAssessment: RiskAssessment;
    complianceRequirements: ComplianceRequirement[];
    metadata: Record<string, any>;

export declare enum IncidentStatus {
    DETECTED = "detected",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    ERADICATING = "eradicating",
    RECOVERING = "recovering",
    LESSONS_LEARNED = "lessons_learned",
    CLOSED = "closed"

}
export interface NotificationRecord {
    id: string;
    type: NotificationType;
    recipient: string;
    channel: string;
    sentAt: Date;
    deliveredAt?: Date;
    acknowledgedAt?: Date;
    content: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'acknowledged';
    metadata: Record<string, any>;

}
export interface EvidenceRecord {
    id: string;
    type: 'log' | 'screenshot' | 'document' | 'forensic' | 'witness';
    filename: string;
    hash: string;
    collectedAt: Date;
    collectedBy: string;
    description: string;
    chainOfCustody: ChainOfCustodyEntry[];

}
export interface ChainOfCustodyEntry {
    timestamp: Date;
    action: 'collected' | 'transferred' | 'analyzed' | 'stored';
    person: string;
    location: string;
    notes?: string;

}
export interface TimelineEvent {
    timestamp: Date;
    event: string;
    actor: string;
    details: Record<string, any>;

}
export interface RiskAssessment {
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
    residualRisk: string;

}
export interface ComplianceRequirement {
    framework: 'GDPR' | 'NIST' | 'HIPAA' | 'PCI_DSS' | 'SOX';
    requirement: string;
    deadline: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    evidence?: string[];

}
export interface BreachNotificationConfig {
    detection: {
        enabled: boolean;
        autoClassification: boolean;
        riskThreshold: BreachSeverity;
        monitoringSources: string[];
}
    };
    notifications: {
        gdpr: {
            enabled: boolean;
            supervisoryAuthority: string;
            contactEmail: string;
            autoFile: boolean;
            deadline: number;
        };
        internal: {
            securityTeam: string[];
            management: string[];
            legal: string[];
            dpo: string;
        };
        external: {
            customers: {
                enabled: boolean;
                highRiskThreshold: BreachSeverity;
                template: string;
            };
            media: {
                enabled: boolean;
                criticalThreshold: BreachSeverity;
                contactList: string[];
            };
        };
    };
    automation: {
        containmentActions: boolean;
        evidenceCollection: boolean;
        reportGeneration: boolean;
        statusUpdates: boolean;
    };
    compliance: {
        frameworks: string[];
        auditLogging: boolean;
        retentionPeriod: string;
    };
/**
 * Automated breach notification and incident response service
 */
export declare class BreachNotificationService extends EventEmitter {
    private incidents;
    private config;
    private timers;
    constructor(config?: Partial<BreachNotificationConfig>);
    /**
     * Report a new breach incident
     */
    reportBreach(incidentData: {)
        title: string;
        description: string;
        severity?: BreachSeverity;
        type?: BreachType;
        category?: BreachCategory;
        dataTypes: string[];
        affectedSystems: string[];
        estimatedDataSubjects?: number;
        detectedBy?: string;
        metadata?: Record<string, any>;
    }): Promise<string>;
    /**
     * Update incident status and progress
     */
    updateIncident(incidentId: string, updates: Partial<BreachIncident>, actor: string): Promise<void>;
    /**
     * Send notification to specified recipients
     */
    sendNotification();
      incidentId: string,
      type: NotificationType,
      recipients: string[],
      template?: string
    ): Promise<NotificationRecord[]>;
    /**
     * Generate GDPR notification for supervisory authority
     */
    generateGDPRNotification(incidentId: string): Promise<{
        content: string;
        deadline: Date;
        recipients: string[];
    }>;
    /**
     * Check GDPR compliance status
     */
    checkGDPRCompliance(incidentId: string): {
        compliant: boolean;
        timeRemaining: number;
        violations: string[];
        actions: string[];
    };
    /**
     * Generate incident report
     */
    generateReport(incidentId: string, format: 'summary' | 'detailed' | 'regulatory'): string;
    /**
     * Get all incidents with optional filtering
     */
    getIncidents(filter?: {)
        status?: IncidentStatus;
        severity?: BreachSeverity;
        dateRange?: {
            start: Date;
            end: Date;
        };
        assignee?: string;
    }): BreachIncident[];
    private initiateIncidentResponse;
    private sendInternalNotifications;
    private requiresGDPRNotification;
    private classifyBreach;
    private assessRisk;
    private generateComplianceRequirements;
    private generateIncidentId;
    private scheduleGDPRReminder;
    private startMonitoring;
    private checkBreachIndicators;
    private handleStatusChange;
    private handleContainment;
    private handleClosure;
    private generateNotificationContent;
    private deliverNotification;
    private determineChannel;
    private generateGDPRContent;
    private generateSummaryReport;
    private generateDetailedReport;
    private generateRegulatoryReport;
    private initiateContainment;
    private startEvidenceCollection;

export declare const breachNotificationService: BreachNotificationService;
export default BreachNotificationService;
//# sourceMappingURL=BreachNotificationService.d.ts.map