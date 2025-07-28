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
    THREAT_INTELLIGENCE_ALERT = "threat_intelligence_alert",
    export,
    enum,
    SecurityEventSeverity
}
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;
export interface SecurityEventPolicy {
    policy_id: string;
    policy_name: string;
    event_types: SecurityEventType;
    severity_threshold: SecurityEventSeverity;
    enabled: boolean;
    detection_rules: {
        conditions: Array<{}, field>;
        string: any;
        operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
        value: any;
        logic?: 'and' | 'or';
    };
}
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
}
//# sourceMappingURL=SecurityEventLoggingPolicies.d.ts.map