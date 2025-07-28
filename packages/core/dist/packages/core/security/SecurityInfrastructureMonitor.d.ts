/**
 * Security Analytics Infrastructure Monitoring and Alerting System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263621-319E54
 *
 * Comprehensive infrastructure monitoring and alerting for security analytics systems,
 * providing real-time infrastructure health monitoring, performance tracking, and automated alerting.
 */
import { EventEmitter } from 'events';
export interface InfrastructureComponent {
    id: string;
    name: string;
    type: 'server' | 'database' | 'cache' | 'load_balancer' | 'storage' | 'network' | 'container' | 'kubernetes_pod' | 'lambda_function';
    category: 'compute' | 'storage' | 'network' | 'security' | 'monitoring' | 'analytics';
    configuration: {
        hostname: string;
        ip_address: string;
        port?: number;
        environment: 'production' | 'staging' | 'development' | 'test';
        region: string;
        availability_zone?: string;
        tags: Record<string, string>;
    };
    monitoring: {
        enabled: boolean;
        check_interval_ms: number;
        timeout_ms: number;
        retry_attempts: number;
        health_checks: HealthCheckConfig;
        performance_monitoring: {
            enabled: boolean;
            metrics_collection_interval_ms: number;
            custom_metrics: CustomMetricConfig;
        };
        log_monitoring: {
            enabled: boolean;
            log_paths: string;
            error_patterns: string;
            warning_patterns: string;
        };
    };
    alerting: {
        enabled: boolean;
        alert_thresholds: AlertThreshold;
        notification_channels: NotificationChannel;
        escalation_policies: EscalationPolicy;
        suppression_rules: SuppressionRule;
    };
    status: {
        health_status: 'healthy' | 'warning' | 'critical' | 'unknown' | 'maintenance';
        last_check_time: number;
        uptime_seconds: number;
        response_time_ms: number;
        error_count_24h: number;
        performance_score: number;
        availability_percentage_24h: number;
        availability_percentage_7d: number;
        availability_percentage_30d: number;
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;
}
export interface HealthCheckConfig {
    id: string;
    name: string;
    type: 'http' | 'tcp' | 'ping' | 'dns' | 'ssl_cert' | 'disk_space' | 'memory' | 'cpu' | 'process' | 'custom_script';
    parameters: {
        endpoint?: string;
        expected_status_code?: number;
        expected_response_time_ms?: number;
        expected_content?: string;
        port?: number;
        command?: string;
        script_path?: string;
        threshold_value?: number;
        threshold_unit?: string;
    };
    success_criteria: {
        min_success_rate: number;
        consecutive_failures_threshold: number;
        response_time_threshold_ms: number;
    };
    enabled: boolean;
    weight: number;
}
export interface CustomMetricConfig {
    id: string;
    name: string;
    description: string;
    metric_type: 'gauge' | 'counter' | 'histogram' | 'summary';
    collection: {
        method: 'api_endpoint' | 'file_parsing' | 'command_execution' | 'snmp' | 'prometheus';
        source: string;
        parsing_rule?: string;
        aggregation_method?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    };
    thresholds: {
        warning_threshold?: number;
        critical_threshold?: number;
        comparison_operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    };
    unit: string;
    enabled: boolean;
}
export interface AlertThreshold {
    id: string;
    name: string;
    metric_name: string;
    condition: {
        operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'not_between';
        value: number;
        value_max?: number;
        duration_minutes?: number;
        evaluation_window_minutes?: number;
    };
    severity: 'info' | 'warning' | 'critical';
    enabled: boolean;
    priority: number;
}
export interface NotificationChannel {
    id: string;
    name: string;
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty' | 'teams' | 'discord';
    configuration: {
        endpoint?: string;
        api_key?: string;
        webhook_url?: string;
        email_addresses?: string;
        phone_numbers?: string;
        channel_id?: string;
        template?: string;
    };
    routing: {
        severity_filter: ('info' | 'warning' | 'critical')[];
        component_filter: string;
        time_filter?: {
            days_of_week: number;
            start_hour: number;
            end_hour: number;
            timezone: string;
        };
    };
    rate_limiting: {
        enabled: boolean;
        max_notifications_per_hour: number;
        max_notifications_per_day: number;
        cooldown_period_minutes: number;
    };
    enabled: boolean;
}
export interface EscalationPolicy {
    id: string;
    name: string;
    description: string;
    escalation_levels: Array<{}, level>;
    number: any;
    delay_minutes: number;
    notification_channels: string;
    actions: EscalationAction;
}
export interface EscalationAction {
    action_type: 'notify_oncall' | 'create_incident' | 'run_automation' | 'scale_resources' | 'failover' | 'custom_webhook';
    parameters: Record<string, any>;
    timeout_minutes?: number;
    retry_attempts?: number;
}
export interface SuppressionRule {
    id: string;
    name: string;
    description: string;
    conditions: {
        component_patterns: string;
        alert_patterns: string;
        severity_levels: ('info' | 'warning' | 'critical')[];
        maintenance_windows?: MaintenanceWindow;
    };
    behavior: {
        suppress_notifications: boolean;
        suppress_escalations: boolean;
        suppress_logging: boolean;
        alternative_notification_channels?: string;
    };
    schedule?: {
        start_time: number;
        end_time?: number;
        recurring: boolean;
        recurrence_pattern?: string;
    };
    enabled: boolean;
    priority: number;
}
export interface MaintenanceWindow {
    id: string;
    name: string;
    description: string;
    schedule: {
        start_time: number;
        end_time: number;
        timezone: string;
        recurring: boolean;
        recurrence_pattern?: string;
    };
    affected_components: string;
    suppress_all_alerts: boolean;
    alternative_monitoring: boolean;
    created_by: string;
    created_at: number;
}
export interface InfrastructureMetrics {
    component_id: string;
    timestamp: number;
    system: {
        cpu_usage_percent: number;
        memory_usage_percent: number;
        disk_usage_percent: number;
        disk_io_read_bps: number;
        disk_io_write_bps: number;
        network_in_bps: number;
        network_out_bps: number;
        load_average_1m: number;
        load_average_5m: number;
        load_average_15m: number;
    };
    application?: {
        request_rate_per_second: number;
        error_rate_percent: number;
        response_time_ms: number;
        active_connections: number;
        queue_size: number;
        thread_count: number;
        heap_usage_mb: number;
        gc_time_ms: number;
    };
    database?: {
        connections_active: number;
        connections_max: number;
        query_rate_per_second: number;
        slow_query_count: number;
        lock_wait_time_ms: number;
        replication_lag_ms: number;
        table_size_mb: number;
        index_hit_ratio: number;
    };
    custom_metrics: Record<string, number>;
}
export interface InfrastructureAlert {
    id: string;
    component_id: string;
    alert_type: 'threshold_breach' | 'health_check_failure' | 'availability_issue' | 'performance_degradation' | 'security_incident' | 'custom';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    detected_at: number;
    context: {
        metric_name?: string;
        current_value?: number;
        threshold_value?: number;
        measurement_unit?: string;
        failure_count?: number;
        affected_services: string;
        root_cause_analysis?: string;
        impact_assessment: 'none' | 'low' | 'medium' | 'high' | 'critical';
    };
    resolution: {
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        resolved: boolean;
        resolved_by?: string;
        resolved_at?: number;
        resolution_notes?: string;
        resolution_time_minutes?: number;
        auto_resolved: boolean;
    };
    escalation: {
        escalated: boolean;
        escalation_level: number;
        escalation_history: Array<{}, level>;
        number: any;
        escalated_at: number;
        escalated_to: string;
        actions_taken: string;
    };
}
export interface InfrastructureEvent {
    id: string;
    component_id: string;
    event_type: 'component_up' | 'component_down' | 'performance_change' | 'configuration_change' | 'deployment' | 'maintenance' | 'security_event';
    timestamp: number;
    title: string;
    description: string;
    metadata: {
        source: string;
        automated: boolean;
        user_initiated: boolean;
        triggered_by?: string;
        correlation_id?: string;
        tags: Record<string, string>;
    };
    impact: {
        severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
        affected_components: string;
        estimated_downtime_minutes?: number;
        service_impact_description?: string;
    };
    resolution?: {
        resolved_at: number;
        resolution_method: 'automatic' | 'manual' | 'rollback' | 'failover';
        resolution_notes: string;
        lessons_learned?: string;
    };
}
export interface MonitoringReport {
    report_id: string;
    generated_at: number;
    report_period: {
        start_time: number;
        end_time: number;
        duration_hours: number;
    };
    health_summary: {
        total_components: number;
        healthy_components: number;
        warning_components: number;
        critical_components: number;
        overall_health_score: number;
        availability_percentage: number;
    };
    performance_summary: {
        avg_response_time_ms: number;
        p95_response_time_ms: number;
        p99_response_time_ms: number;
        avg_cpu_usage_percent: number;
        avg_memory_usage_percent: number;
        avg_disk_usage_percent: number;
        network_throughput_mbps: number;
    };
    alert_summary: {
        total_alerts: number;
        critical_alerts: number;
        warning_alerts: number;
        info_alerts: number;
        resolved_alerts: number;
        avg_resolution_time_minutes: number;
        false_positive_rate_percent: number;
    };
    top_issues: Array<{}, component_id>;
    string: any;
    component_name: string;
    issue_type: string;
    occurrence_count: number;
    impact_score: number;
    recommended_action: string;
}
export declare class SecurityInfrastructureMonitor extends EventEmitter {
    private components;
    private metrics;
    private alerts;
    private events;
    private maintenanceWindows;
    private monitoringIntervals;
    private metricsCollectionIntervals;
    private globalConfig;
    constructor();
    private initializeEventHandlers;
    private startGlobalMonitoring;
    default: throw;
}
//# sourceMappingURL=SecurityInfrastructureMonitor.d.ts.map