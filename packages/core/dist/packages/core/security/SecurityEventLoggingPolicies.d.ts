/**
 * Comprehensive Security Event Logging Policies for PromptScape
 *
 * This module defines comprehensive security event logging policies that extend
 * the existing robust security infrastructure with critical policy coverage for
 * application security, network security, incident response, and compliance.
 */
import { z } from 'zod';
export declare enum SecurityEventType {
    AUTHENTICATION_FAILURE = "authentication_failure",
    AUTHORIZATION_VIOLATION = "authorization_violation",
    SESSION_ANOMALY = "session_anomaly",
    INPUT_VALIDATION_FAILURE = "input_validation_failure",
    CODE_INJECTION_ATTEMPT = "code_injection_attempt",
    FILE_UPLOAD_VIOLATION = "file_upload_violation",
    API_ABUSE_DETECTED = "api_abuse_detected",
    PRIVILEGE_ESCALATION = "privilege_escalation",
    NETWORK_INTRUSION_ATTEMPT = "network_intrusion_attempt",
    FIREWALL_VIOLATION = "firewall_violation",
    DDOS_ATTACK_DETECTED = "ddos_attack_detected",
    VPN_ACCESS_ANOMALY = "vpn_access_anomaly",
    DNS_QUERY_ANOMALY = "dns_query_anomaly",
    NETWORK_SEGMENTATION_BREACH = "network_segmentation_breach",
    CONTAINER_SECURITY_VIOLATION = "container_security_violation",
    CLOUD_RESOURCE_ANOMALY = "cloud_resource_anomaly",
    DATABASE_ADMIN_ACTION = "database_admin_action",
    SERVICE_COMMUNICATION_FAILURE = "service_communication_failure",
    CERTIFICATE_ANOMALY = "certificate_anomaly",
    SECURITY_INCIDENT_DETECTED = "security_incident_detected",
    INCIDENT_ESCALATION = "incident_escalation",
    INCIDENT_RESPONSE_ACTION = "incident_response_action",
    FORENSIC_INVESTIGATION = "forensic_investigation",
    BREACH_NOTIFICATION = "breach_notification",
    SOX_ITGC_VIOLATION = "sox_itgc_violation",
    GDPR_DATA_SUBJECT_REQUEST = "gdpr_data_subject_request",
    CCPA_CONSUMER_REQUEST = "ccpa_consumer_request",
    CHANGE_MANAGEMENT_VIOLATION = "change_management_violation",
    SEGREGATION_DUTIES_VIOLATION = "segregation_duties_violation",
    CI_CD_SECURITY_VIOLATION = "ci_cd_security_violation",
    CODE_REPOSITORY_ANOMALY = "code_repository_anomaly",
    DEPLOYMENT_SECURITY_FAILURE = "deployment_security_failure",
    PRODUCTION_ACCESS_VIOLATION = "production_access_violation",
    EXTERNAL_API_FAILURE = "external_api_failure",
    VENDOR_ACCESS_VIOLATION = "vendor_access_violation",
    SUPPLY_CHAIN_SECURITY_EVENT = "supply_chain_security_event",
    DATA_SHARING_VIOLATION = "data_sharing_violation",
    BEHAVIORAL_ANOMALY = "behavioral_anomaly",
    INSIDER_THREAT_INDICATOR = "insider_threat_indicator",
    IOC_DETECTION = "ioc_detection",
    THREAT_INTELLIGENCE_ALERT = "threat_intelligence_alert"
}
export declare enum SecurityEventSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"
}
export declare enum SecurityEventStatus {
    ACTIVE = "active",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    RESOLVED = "resolved",
    FALSE_POSITIVE = "false_positive"
}
export declare enum ComplianceFramework {
    SOX = "sox",
    GDPR = "gdpr",
    CCPA = "ccpa",
    HIPAA = "hipaa",
    ISO27001 = "iso27001",
    PCI_DSS = "pci_dss",
    NIST = "nist",
    FERPA = "ferpa",
    GLBA = "glba",
    FEDRAMP = "fedramp"
}
export declare const SecurityEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_type: z.ZodNativeEnum<typeof SecurityEventType>;
    severity: z.ZodNativeEnum<typeof SecurityEventSeverity>;
    status: z.ZodNativeEnum<typeof SecurityEventStatus>;
    timestamp: z.ZodDate;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    subcategory: z.ZodOptional<z.ZodString>;
    source_ip: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    session_id: z.ZodOptional<z.ZodString>;
    user_agent: z.ZodOptional<z.ZodString>;
    request_id: z.ZodOptional<z.ZodString>;
    system_component: z.ZodString;
    service_name: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodString>;
    status_code: z.ZodOptional<z.ZodNumber>;
    threat_level: z.ZodNumber;
    confidence_score: z.ZodNumber;
    attack_vector: z.ZodOptional<z.ZodString>;
    indicators: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    compliance_frameworks: z.ZodDefault<z.ZodArray<z.ZodNativeEnum<typeof ComplianceFramework>, "many">>;
    regulatory_impact: z.ZodDefault<z.ZodBoolean>;
    requires_notification: z.ZodDefault<z.ZodBoolean>;
    notification_timeline: z.ZodOptional<z.ZodString>;
    automated_response: z.ZodDefault<z.ZodBoolean>;
    response_actions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    escalation_required: z.ZodDefault<z.ZodBoolean>;
    assigned_to: z.ZodOptional<z.ZodString>;
    evidence_preserved: z.ZodDefault<z.ZodBoolean>;
    forensic_artifacts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    chain_of_custody: z.ZodDefault<z.ZodArray<z.ZodObject<{
        timestamp: z.ZodDate;
        action: z.ZodString;
        performed_by: z.ZodString;
        signature: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: Date;
        action?: string;
        signature?: string;
        performed_by?: string;
    }, {
        timestamp?: Date;
        action?: string;
        signature?: string;
        performed_by?: string;
    }>, "many">>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    custom_fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    related_events: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    created_by: z.ZodString;
    updated_by: z.ZodOptional<z.ZodString>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    status?: SecurityEventStatus;
    category?: string;
    tags?: string[];
    timestamp?: Date;
    title?: string;
    endpoint?: string;
    severity?: SecurityEventSeverity;
    method?: string;
    created_at?: Date;
    user_id?: string;
    created_by?: string;
    updated_at?: Date;
    session_id?: string;
    event_type?: SecurityEventType;
    user_agent?: string;
    compliance_frameworks?: ComplianceFramework[];
    updated_by?: string;
    subcategory?: string;
    system_component?: string;
    regulatory_impact?: boolean;
    event_id?: string;
    confidence_score?: number;
    indicators?: string[];
    source_ip?: string;
    threat_level?: number;
    request_id?: string;
    assigned_to?: string;
    service_name?: string;
    status_code?: number;
    attack_vector?: string;
    requires_notification?: boolean;
    notification_timeline?: string;
    automated_response?: boolean;
    response_actions?: string[];
    escalation_required?: boolean;
    evidence_preserved?: boolean;
    forensic_artifacts?: string[];
    chain_of_custody?: {
        timestamp?: Date;
        action?: string;
        signature?: string;
        performed_by?: string;
    }[];
    custom_fields?: Record<string, unknown>;
    related_events?: string[];
}, {
    description?: string;
    status?: SecurityEventStatus;
    category?: string;
    tags?: string[];
    timestamp?: Date;
    title?: string;
    endpoint?: string;
    severity?: SecurityEventSeverity;
    method?: string;
    created_at?: Date;
    user_id?: string;
    created_by?: string;
    updated_at?: Date;
    session_id?: string;
    event_type?: SecurityEventType;
    user_agent?: string;
    compliance_frameworks?: ComplianceFramework[];
    updated_by?: string;
    subcategory?: string;
    system_component?: string;
    regulatory_impact?: boolean;
    event_id?: string;
    confidence_score?: number;
    indicators?: string[];
    source_ip?: string;
    threat_level?: number;
    request_id?: string;
    assigned_to?: string;
    service_name?: string;
    status_code?: number;
    attack_vector?: string;
    requires_notification?: boolean;
    notification_timeline?: string;
    automated_response?: boolean;
    response_actions?: string[];
    escalation_required?: boolean;
    evidence_preserved?: boolean;
    forensic_artifacts?: string[];
    chain_of_custody?: {
        timestamp?: Date;
        action?: string;
        signature?: string;
        performed_by?: string;
    }[];
    custom_fields?: Record<string, unknown>;
    related_events?: string[];
}>;
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;
export interface SecurityEventPolicy {
    policy_id: string;
    policy_name: string;
    event_types: SecurityEventType[];
    severity_threshold: SecurityEventSeverity;
    enabled: boolean;
    detection_rules: {
        conditions: Array<{
            field: string;
            operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
            value: any;
            logic?: 'and' | 'or';
        }>;
        time_window?: number;
        frequency_threshold?: number;
    };
    response_actions: {
        immediate_actions: string[];
        escalation_actions: string[];
        notification_channels: string[];
        automated_containment: boolean;
    };
    compliance_mapping: {
        frameworks: ComplianceFramework[];
        requirements: string[];
        retention_period: number;
        requires_encryption: boolean;
    };
    reporting: {
        real_time_alerts: boolean;
        periodic_reports: string[];
        stakeholders: string[];
        external_reporting: boolean;
    };
}
/**
 * Comprehensive Security Event Logging Policy Engine
 *
 * Manages security event policies, detection rules, and automated responses
 */
export declare class SecurityEventLoggingPolicyEngine {
    private policies;
    private eventHistory;
    private complianceRequirements;
    constructor();
    /**
     * Initialize comprehensive security event policies
     */
    private initializePolicyFramework;
    /**
     * Load compliance framework requirements
     */
    private loadComplianceRequirements;
    /**
     * Register a new security event policy
     */
    registerPolicy(policy: SecurityEventPolicy): void;
    /**
     * Process security event against all applicable policies
     */
    processSecurityEvent(event: SecurityEvent): {
        matched_policies: string[];
        actions_triggered: string[];
        notifications_sent: string[];
        compliance_requirements: ComplianceFramework[];
        escalation_required: boolean;
    };
    /**
     * Check if security event matches policy conditions
     */
    private eventMatchesPolicy;
    /**
     * Evaluate detection rules against security event
     */
    private evaluateDetectionRules;
    /**
     * Store security event in history for pattern analysis
     */
    private storeEventInHistory;
    /**
     * Get all registered policies
     */
    getPolicies(): SecurityEventPolicy[];
    /**
     * Get policy by ID
     */
    getPolicy(policyId: string): SecurityEventPolicy | undefined;
    /**
     * Update policy configuration
     */
    updatePolicy(policyId: string, updates: Partial<SecurityEventPolicy>): boolean;
    /**
     * Enable or disable policy
     */
    setPolicyEnabled(policyId: string, enabled: boolean): boolean;
    /**
     * Generate compliance report for framework
     */
    generateComplianceReport(framework: ComplianceFramework, startDate: Date, endDate: Date): {
        framework: ComplianceFramework;
        period: {
            start: Date;
            end: Date;
        };
        events_count: number;
        policy_violations: number;
        compliance_score: number;
        recommendations: string[];
        events_by_severity: Record<SecurityEventSeverity, number>;
    };
    /**
     * Get events for specific timeframe
     */
    private getEventsForTimeframe;
    /**
     * Generate compliance recommendations
     */
    private generateRecommendations;
}
export declare const securityEventPolicyEngine: SecurityEventLoggingPolicyEngine;
export declare const processSecurityEvent: (event: SecurityEvent) => {
    matched_policies: string[];
    actions_triggered: string[];
    notifications_sent: string[];
    compliance_requirements: ComplianceFramework[];
    escalation_required: boolean;
};
export default SecurityEventLoggingPolicyEngine;
//# sourceMappingURL=SecurityEventLoggingPolicies.d.ts.map