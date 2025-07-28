import { SecurityEventSeverity, ComplianceFramework } from './SecurityEventLoggingPolicies';
export interface PolicyManagerConfig {
    enabled: boolean;
    real_time_processing: boolean;
    batch_processing_interval: number;
    max_event_batch_size: number;
    retention_policy: {
        default_retention_days: number;
        compliance_retention_overrides: Record<ComplianceFramework, number>;
    };
    notification_config: {
        channels: NotificationChannel;
        escalation_delays: Record<SecurityEventSeverity, number>;
        retry_attempts: number;
    };
    integration_config: {
        audit_system_enabled: boolean;
        siem_integration_enabled: boolean;
        compliance_reporting_enabled: boolean;
    };
}
export interface NotificationChannel {
    channel_id: string;
    channel_type: 'email' | 'sms' | 'slack' | 'webhook' | 'dashboard' | 'siem';
    endpoint: string;
    credentials?: Record<string, string>;
    enabled: boolean;
    severity_filter: SecurityEventSeverity;
    rate_limit?: {
        max_per_minute: number;
        burst_limit: number;
    };
}
export interface PolicyEnforcementResult {
    event_id: string;
    policies_matched: string;
    actions_executed: PolicyAction;
    notifications_sent: NotificationResult;
    compliance_impact: ComplianceImpact;
    escalations_triggered: string;
    automated_responses: AutomatedResponse;
    processing_time_ms: number;
    errors: string;
}
export interface PolicyAction {
    action_id: string;
    action_type: 'containment' | 'notification' | 'escalation' | 'documentation' | 'analysis';
    action_name: string;
    executed_at: Date;
    success: boolean;
    details: Record<string, any>;
    error_message?: string;
}
export interface NotificationResult {
    notification_id: string;
    channel_id: string;
    channel_type: string;
    recipient: string;
    sent_at: Date;
    success: boolean;
    delivery_status?: 'pending' | 'delivered' | 'failed' | 'bounced';
    error_message?: string;
}
export interface ComplianceImpact {
    framework: ComplianceFramework;
    requirement_ids: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    notification_required: boolean;
    reporting_deadline?: Date;
    external_notification_required: boolean;
}
export interface AutomatedResponse {
    response_id: string;
    response_type: 'ip_block' | 'account_lock' | 'service_isolation' | 'data_quarantine';
    executed_at: Date;
    success: boolean;
    details: Record<string, any>;
    rollback_available: boolean;
    rollback_deadline?: Date;
}
export interface PolicyMetrics {
    policy_id: string;
    events_processed: number;
    actions_triggered: number;
    false_positives: number;
    true_positives: number;
    response_time_avg_ms: number;
    escalations_count: number;
    compliance_violations: number;
    effectiveness_score: number;
    last_updated: Date;
}
export declare class SecurityEventPolicyManager {
    private config;
    private notificationChannels;
    private policyMetrics;
    private eventProcessingQueue;
    private processingInProgress;
    constructor(config: PolicyManagerConfig);
    /**
    * Initialize notification channels
    */
    private initializeNotificationChannels;
}
//# sourceMappingURL=SecurityEventPolicyManager.d.ts.map