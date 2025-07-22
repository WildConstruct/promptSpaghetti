/**
 * Security Event Policy Manager
 *
 * Advanced policy management system that integrates security event logging policies
 * with the existing PromptScape security infrastructure, providing centralized
 * policy enforcement, monitoring, and compliance management.
 */
import { SecurityEvent, SecurityEventSeverity, ComplianceFramework } from './SecurityEventLoggingPolicies';
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
        channels: NotificationChannel[];
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
    severity_filter: SecurityEventSeverity[];
    rate_limit?: {
        max_per_minute: number;
        burst_limit: number;
    };
}
export interface PolicyEnforcementResult {
    event_id: string;
    policies_matched: string[];
    actions_executed: PolicyAction[];
    notifications_sent: NotificationResult[];
    compliance_impact: ComplianceImpact[];
    escalations_triggered: string[];
    automated_responses: AutomatedResponse[];
    processing_time_ms: number;
    errors: string[];
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
    requirement_ids: string[];
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
/**
 * Advanced Security Event Policy Manager
 *
 * Provides centralized management of security event policies, enforcement,
 * monitoring, and integration with existing PromptScape infrastructure.
 */
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
    /**
     * Process security event through policy engine
     */
    processSecurityEvent(event: SecurityEvent): Promise<PolicyEnforcementResult>;
    /**
     * Execute policy-defined actions
     */
    private executePolicyActions;
    /**
     * Send notifications through configured channels
     */
    private sendNotifications;
    /**
     * Assess compliance impact of security event
     */
    private assessComplianceImpact;
    /**
     * Handle event escalations
     */
    private handleEscalations;
    /**
     * Create corresponding audit event in existing audit system
     */
    private createAuditEvent;
    /**
     * Update policy performance metrics
     */
    private updatePolicyMetrics;
    /**
     * Start batch processing for queued events
     */
    private startBatchProcessing;
    /**
     * Process queued events in batch
     */
    private processBatchEvents;
    private executeIpBlock;
    private executeAccountLock;
    private preserveEvidence;
    private isolateNetworkSegment;
    private sendNotification;
    private executeEscalation;
    private categorizeAction;
    private mapToAuditEventType;
    private mapToAuditSeverity;
    private mapComplianceFrameworks;
    private mapToAuditStatus;
    private calculateEscalationLevel;
    private getFrameworkRequirements;
    private calculateImpactLevel;
    private requiresExternalNotification;
    /**
     * Public API methods
     */
    /**
     * Add security event to processing queue
     */
    queueSecurityEvent(event: SecurityEvent): void;
    /**
     * Get policy performance metrics
     */
    getPolicyMetrics(): PolicyMetrics[];
    /**
     * Get notification channels
     */
    getNotificationChannels(): NotificationChannel[];
    /**
     * Update notification channel
     */
    updateNotificationChannel(channelId: string, updates: Partial<NotificationChannel>): boolean;
    /**
     * Generate policy effectiveness report
     */
    generatePolicyEffectivenessReport(): {
        total_policies: number;
        active_policies: number;
        avg_response_time: number;
        total_events_processed: number;
        false_positive_rate: number;
        compliance_violation_rate: number;
        top_performing_policies: PolicyMetrics[];
        recommendations: string[];
    };
    private generatePolicyRecommendations;
}
export declare const defaultPolicyManagerConfig: PolicyManagerConfig;
export declare const securityEventPolicyManager: SecurityEventPolicyManager;
export declare const queueSecurityEvent: (event: SecurityEvent) => void;
export default SecurityEventPolicyManager;
//# sourceMappingURL=SecurityEventPolicyManager.d.ts.map