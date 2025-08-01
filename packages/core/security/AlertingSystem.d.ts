/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Cross-System Alerting and Notification System
 * Epic 31 - Security Integration Framework
 *
 * Unified alerting system for security events across all analytics and monitoring systems
 */

}
}
export interface SecurityEvent { id: string;
    type: 'security_breach' | 'anomaly_detected' | 'policy_violation' | 'system_failure' | 'suspicious_activity' | 'data_leak' | 'unauthorized_access';
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    timestamp: number;
    title: string;
    description: string;
    details: {
        affected_systems: string[];
        affected_users?: string[];
        ip_addresses?: string[];
        user_agents?: string[];
        request_patterns?: any[];
        data_accessed?: string[];
        geographic_location?: {
            country: string;
            region: string;
            city: string;
            coordinates?: {
                lat: number;
                lng: number }
}
            };
        };
    };
    metadata: { correlation_id?: string;
        threat_level: number;
        confidence_score: number;
        auto_detected: boolean;
        false_positive_likelihood?: number;
        related_events?: string[] };
    status: 'active' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
    assigned_to?: string;
    resolution?: { action_taken: string;
        resolved_by: string;
        resolved_at: number;
        notes: string };

}
}
export interface AlertRule { id: string;
    name: string;
    description: string;
    enabled: boolean;
    conditions: {
        event_types: SecurityEvent['type'][];
        severity_threshold: SecurityEvent['severity'];
        source_systems: string[];
        frequency_threshold?: {
            count: number;
            time_window: number }
}
        };
        custom_conditions?: Array<{ field: string;
            operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches_regex';
            value: any }>;
    };
    actions: { notifications: NotificationAction[];
        escalation?: EscalationAction;
        automation?: AutomationAction[] };
    suppression?: { duplicate_window: number;
        similar_event_threshold: number };
    created_by: string;
    created_at: number;
    last_modified: number;

}
}
export interface NotificationAction { type: 'email' | 'sms' | 'slack' | 'webhook' | 'pagerduty' | 'teams' | 'discord';
    target: string;
    template?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    rate_limit?: {
        max_per_hour: number;
        max_per_day: number }
}
    };

}
}
export interface EscalationAction { trigger_after: number;
    escalate_to: string[];
    escalation_message?: string;
    auto_assign?: boolean }
}
}
export interface AutomationAction { type: 'block_ip' | 'disable_user' | 'quarantine_system' | 'trigger_backup' | 'rotate_keys' | 'scale_resources';
    parameters: Record<string, any>;
    confirmation_required: boolean;
    timeout?: number }
}
}
export interface AlertingConfig { enabled: boolean;
    default_severity_threshold: SecurityEvent['severity'];
    notification_settings: {
        batch_notifications: boolean;
        batch_interval: number;
        quiet_hours?: {
            start: string;
            end: string;
            timezone: string }
}
        };
    };
    escalation_settings: { auto_escalation_enabled: boolean;
        escalation_timeout: number;
        max_escalation_levels: number };
    retention: { events_retention_days: number;
        resolved_events_retention_days: number;
        archive_after_days: number };
    integrations: { siem_integration?: {
            enabled: boolean;
            endpoint: string;
            api_key: string };
        ticketing_integration?: { enabled: boolean;
            system: 'jira' | 'servicenow' | 'zendesk';
            endpoint: string;
            credentials: Record<string, string> };
    };

}
}
export interface AlertMetrics { total_alerts: number;
    alerts_by_severity: Record<SecurityEvent['severity'], number>;
    alerts_by_type: Record<SecurityEvent['type'], number>;
    alerts_by_source: Record<string, number>;
    response_times: {
        mean_acknowledgment_time: number;
        mean_resolution_time: number;
        p95_response_time: number }
}
    };
    escalation_stats: { total_escalations: number;
        escalation_rate: number };
    false_positive_rate: number;
    time_range: { start: number;
        end: number };

export declare class CrossSystemAlertingSystem { private config;
    private alertRules;
    private activeAlerts;
    private eventHistory;
    private alertMetrics;
    private notificationQueue;
    private processingTimer?;
    private escalationTimers;
    constructor(config: AlertingConfig);
    ingestSecurityEvent(event: SecurityEvent): Promise<void>;
    processEventAgainstRules(event: SecurityEvent): Promise<void>;
    createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'last_modified'>): string;
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean;
    deleteAlertRule(ruleId: string): boolean;
    getAlertRule(ruleId: string): AlertRule | null;
    getAllAlertRules(): AlertRule[];
    getActiveAlerts(filters?: {)
        severity?: SecurityEvent['severity'];
        type?: SecurityEvent['type'];
        source?: string;
        status?: SecurityEvent['status'] }): SecurityEvent[];
    acknowledgeAlert(alertId: string, userId: string): Promise<boolean>;
    resolveAlert(alertId: string, resolution: SecurityEvent['resolution']): Promise<boolean>;
    escalateAlert(alertId: string, escalatedBy: string): Promise<boolean>;
    sendNotification(alert: SecurityEvent, action: NotificationAction): Promise<boolean>;
    getAlertMetrics(timeRange?: { )
        start: number;
        end: number }): AlertMetrics;
    generateSecurityReport(timeRange: { )
        start: number;
        end: number }): { summary: {
            total_events: number;
            critical_alerts: number;
            avg_response_time: number;
            false_positive_rate: number };
        trends: { daily_alert_counts: Array<{
                date: string;
                count: number }>;
            top_alert_sources: Array<{ source: string;
                count: number }>;
            response_time_trend: Array<{ date: string;
                avg_response_time: number }>;
        };
        recommendations: string[];
    };
    private enrichEvent;
    private findMatchingRules;
    private doesEventMatchRule;
    private evaluateCustomCondition;
    private getNestedFieldValue;
    private shouldSuppressAlert;
    private calculateEventSimilarity;
    private setupEscalation;
    private executeAutomationActions;
    private executeAutomationAction;
    private revertAutomationAction;
    private startProcessing;
    private processNotificationQueue;
    private getBatchedNotifications;
    private isInQuietHours;
    private formatNotificationMessage;
    private renderTemplate;
    private sendEmailNotification;
    private sendSMSNotification;
    private sendSlackNotification;
    private sendWebhookNotification;
    private sendPagerDutyNotification;
    private sendTeamsNotification;
    private sendDiscordNotification;
    private sendEscalationNotifications;
    private isRateLimited;
    private initializeMetrics;
    private updateMetrics;
    private calculateMetricsForTimeRange;
    private cleanupOldEvents;
    private getRecentSimilarEvents;
    private generateRuleId;
    private generateAlertId;
    private generateCorrelationId;
    private calculateThreatLevel;
    private calculateConfidenceScore;
    private enrichWithGeolocation;
    private generateDailyAlertCounts;
    private getTopAlertSources;
    private generateResponseTimeTrend;
    private calculateFalsePositiveRate;
    private generateRecommendations;
    destroy(): void;

export default CrossSystemAlertingSystem;
//# sourceMappingURL=AlertingSystem.d.ts.map