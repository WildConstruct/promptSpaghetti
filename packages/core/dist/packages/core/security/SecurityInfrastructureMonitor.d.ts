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
        health_checks: HealthCheckConfig[];
        performance_monitoring: {
            enabled: boolean;
            metrics_collection_interval_ms: number;
            custom_metrics: CustomMetricConfig[];
        };
        log_monitoring: {
            enabled: boolean;
            log_paths: string[];
            error_patterns: string[];
            warning_patterns: string[];
        };
    };
    alerting: {
        enabled: boolean;
        alert_thresholds: AlertThreshold[];
        notification_channels: NotificationChannel[];
        escalation_policies: EscalationPolicy[];
        suppression_rules: SuppressionRule[];
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
        email_addresses?: string[];
        phone_numbers?: string[];
        channel_id?: string;
        template?: string;
    };
    routing: {
        severity_filter: ('info' | 'warning' | 'critical')[];
        component_filter: string[];
        time_filter?: {
            days_of_week: number[];
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
    escalation_levels: Array<{
        level: number;
        delay_minutes: number;
        notification_channels: string[];
        actions: EscalationAction[];
    }>;
    trigger_conditions: {
        severity_levels: ('info' | 'warning' | 'critical')[];
        component_types: InfrastructureComponent['type'][];
        unacknowledged_duration_minutes: number;
        consecutive_failures?: number;
    };
    de_escalation: {
        auto_resolve: boolean;
        auto_resolve_delay_minutes: number;
        require_manual_acknowledgment: boolean;
    };
    enabled: boolean;
    priority: number;
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
        component_patterns: string[];
        alert_patterns: string[];
        severity_levels: ('info' | 'warning' | 'critical')[];
        maintenance_windows?: MaintenanceWindow[];
    };
    behavior: {
        suppress_notifications: boolean;
        suppress_escalations: boolean;
        suppress_logging: boolean;
        alternative_notification_channels?: string[];
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
    affected_components: string[];
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
        affected_services: string[];
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
        escalation_history: Array<{
            level: number;
            escalated_at: number;
            escalated_to: string[];
            actions_taken: string[];
        }>;
    };
    notifications: {
        channels_notified: string[];
        notification_count: number;
        last_notification_at?: number;
        suppressed: boolean;
        suppression_reason?: string;
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
        affected_components: string[];
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
    top_issues: Array<{
        component_id: string;
        component_name: string;
        issue_type: string;
        occurrence_count: number;
        impact_score: number;
        recommended_action: string;
    }>;
    trends: {
        performance_trend: 'improving' | 'stable' | 'degrading';
        availability_trend: 'improving' | 'stable' | 'degrading';
        alert_volume_trend: 'increasing' | 'stable' | 'decreasing';
        resource_utilization_trend: 'increasing' | 'stable' | 'decreasing';
    };
    recommendations: {
        immediate_actions: string[];
        preventive_measures: string[];
        capacity_planning: string[];
        optimization_opportunities: string[];
    };
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
    registerComponent(component: Omit<InfrastructureComponent, 'id' | 'created_at' | 'status'>): Promise<string>;
    updateComponent(componentId: string, updates: Partial<InfrastructureComponent>): Promise<void>;
    deleteComponent(componentId: string): Promise<void>;
    private startComponentMonitoring;
    private stopComponentMonitoring;
    private performComponentHealthCheck;
    private executeHealthCheck;
    private performHttpHealthCheck;
    private performTcpHealthCheck;
    private performPingHealthCheck;
    private performDnsHealthCheck;
    private performSslCertHealthCheck;
    private performDiskSpaceHealthCheck;
    private performMemoryHealthCheck;
    private performCpuHealthCheck;
    private performProcessHealthCheck;
    private performCustomScriptHealthCheck;
    private calculateOverallHealth;
    private collectComponentMetrics;
    private collectSystemMetrics;
    private collectApplicationMetrics;
    private collectDatabaseMetrics;
    private collectCustomMetric;
    private generateStatusChangeAlert;
    private generateHealthCheckAlert;
    private checkThresholdAlerts;
    private checkCustomMetricThresholds;
    private getMetricValue;
    private getMetricUnit;
    private evaluateThreshold;
    private compareValues;
    private generateAlert;
    private processAlert;
    private sendAlertNotifications;
    private matchesChannelFilters;
    private checkRateLimit;
    private sendNotification;
    private checkEscalationPolicies;
    private matchesEscalationPolicy;
    private executeEscalationPolicy;
    private executeEscalationAction;
    private isAlertSuppressed;
    private matchesSuppressionRule;
    private updateAvailabilityMetrics;
    private calculateAvailability;
    private handleStatusChange;
    private performGlobalHealthCheck;
    private generatePredictiveAlerts;
    private analyzeTrend;
    private performDataCleanup;
    getComponent(componentId: string): InfrastructureComponent | undefined;
    getComponents(type?: InfrastructureComponent['type'], environment?: string): InfrastructureComponent[];
    getComponentMetrics(componentId: string, hours?: number): InfrastructureMetrics[];
    getActiveAlerts(componentId?: string, severity?: InfrastructureAlert['severity']): InfrastructureAlert[];
    getInfrastructureEvents(componentId?: string, hours?: number): InfrastructureEvent[];
    private getAlert;
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void>;
    resolveAlert(alertId: string, resolvedBy: string, notes?: string): Promise<void>;
    createMaintenanceWindow(window: Omit<MaintenanceWindow, 'id' | 'created_at'>): Promise<string>;
    generateMonitoringReport(hours?: number): Promise<MonitoringReport>;
    getSystemStatus(): {
        total_components: number;
        healthy_components: number;
        warning_components: number;
        critical_components: number;
        active_alerts: number;
        overall_health_score: number;
    };
    performMaintenance(): Promise<void>;
    shutdown(): Promise<void>;
}
export default SecurityInfrastructureMonitor;
//# sourceMappingURL=SecurityInfrastructureMonitor.d.ts.map