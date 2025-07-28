import './SecurityDashboardWorkflow.css';
export interface SecurityWorkflowEvent {
    id: string;
    type: SecurityEventType;
    severity: SecuritySeverity;
    source: string;
    timestamp: Date;
    description: string;
    metadata: Record<string, any>;
    workflowState?: string;
    assignedTo?: string;
    escalationLevel: number;
    complianceFrameworks: string;
    automatedActions: SecurityAction;
}
export declare enum SecurityEventType {
    THREAT_DETECTION = "threat_detection",
    AUTHENTICATION_FAILURE = "authentication_failure",
    ACCESS_VIOLATION = "access_violation",
    DATA_BREACH = "data_breach",
    MALWARE_DETECTION = "malware_detection",
    NETWORK_INTRUSION = "network_intrusion",
    POLICY_VIOLATION = "policy_violation",
    COMPLIANCE_VIOLATION = "compliance_violation",
    SYSTEM_ANOMALY = "system_anomaly",
    INSIDER_THREAT = "insider_threat",
    export,
    enum,
    SecuritySeverity
}
//# sourceMappingURL=SecurityDashboardWorkflow.d.ts.map