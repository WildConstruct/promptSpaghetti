/**
 * Security System Health and Availability Tracking System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263626-82FC78
 *
 * Comprehensive health monitoring and availability tracking for security systems,
 * ensuring high availability, performance monitoring, and proactive issue detection.
 */
import { EventEmitter } from 'events';
export interface SecuritySystemNode {
    id: string;
    name: string;
    description: string;
    type: 'primary' | 'secondary' | 'backup' | 'load_balancer' | 'database' | 'cache' | 'api_gateway' | 'monitoring';
    configuration: {
        endpoint: string;
        port: number;
        protocol: 'http' | 'https' | 'tcp' | 'grpc';
        authentication: {
            type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2' | 'certificate';
            credentials?: Record<string, string>;
        };
        connection_timeout_ms: number;
        read_timeout_ms: number;
    };
    health_checks: {
        enabled: boolean;
        check_interval_ms: number;
        timeout_ms: number;
        retry_attempts: number;
        retry_delay_ms: number;
        checks: Array<{}, type>;
    };
}
export interface SuccessCriteria {
    expected_status_code?: number;
    expected_response_time_ms?: number;
    expected_response_pattern?: string;
    minimum_success_rate?: number;
    custom_validation?: string;
}
export interface MaintenanceWindow {
    id: string;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    days_of_week: number;
    timezone: string;
    recurring: boolean;
    exclude_from_sla: boolean;
}
export interface HealthCheckResult {
    id: string;
    system_id: string;
    check_name: string;
    check_type: string;
    executed_at: number;
    duration_ms: number;
    success: boolean;
    status_code?: number;
    response_time_ms?: number;
    error_message?: string;
    raw_response?: string;
    metrics: {
        cpu_usage?: number;
        memory_usage?: number;
        disk_usage?: number;
        network_latency?: number;
        connection_count?: number;
        thread_count?: number;
        queue_size?: number;
    };
    health_impact: {
        weight: number;
        contribution_to_health_score: number;
        severity: 'info' | 'warning' | 'critical';
    };
}
export interface AvailabilityReport {
    system_id: string;
    reporting_period: {
        start_time: number;
        end_time: number;
        duration_hours: number;
    };
    availability: {
        uptime_minutes: number;
        downtime_minutes: number;
        availability_percent: number;
        target_availability_percent: number;
        sla_compliance: boolean;
    };
    downtime_incidents: Array<{}, start_time>;
    number: any;
    end_time: number;
    duration_minutes: number;
    type: 'planned' | 'unplanned';
    reason: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    root_cause?: string;
}
export interface SystemAlert {
    id: string;
    system_id: string;
    alert_type: 'availability' | 'performance' | 'health_check_failure' | 'dependency_failure' | 'threshold_breach';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    detected_at: number;
    context: {
        current_value?: number;
        threshold_value?: number;
        measurement_unit?: string;
        affected_checks: string;
        dependency_impact: string;
        estimated_impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    };
    resolution: {
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        resolved: boolean;
        resolved_by?: string;
        resolved_at?: number;
        resolution_notes?: string;
        auto_resolved: boolean;
    };
    notifications: {
        email_sent: boolean;
        slack_sent: boolean;
        webhook_sent: boolean;
        escalated: boolean;
        escalation_level: number;
    };
}
export interface HealthTrackerConfig {
    global_settings: {
        default_check_interval_ms: number;
        default_timeout_ms: number;
        default_retry_attempts: number;
        max_concurrent_checks: number;
        enable_dependency_checking: boolean;
        enable_predictive_analysis: boolean;
    };
    alerting: {
        enabled: boolean;
        alert_aggregation_window_ms: number;
        suppress_duplicate_alerts: boolean;
        auto_resolve_timeout_ms: number;
        escalation_rules: EscalationRule;
    };
    reporting: {
        generate_daily_reports: boolean;
        generate_weekly_reports: boolean;
        generate_monthly_reports: boolean;
        report_recipients: string;
        include_trends: boolean;
        include_recommendations: boolean;
    };
    data_retention: {
        health_check_results_days: number;
        availability_reports_days: number;
        alert_history_days: number;
        performance_metrics_days: number;
    };
}
export interface EscalationRule {
    id: string;
    name: string;
    conditions: {
        severity_levels: SystemAlert['severity'][];
        system_types: SecuritySystemNode['type'][];
        consecutive_failures?: number;
        duration_minutes?: number;
    };
    actions: {
        notify_users: string;
        create_incident: boolean;
        auto_failover: boolean;
        run_automation: boolean;
        automation_script?: string;
    };
    delay_minutes: number;
}
export declare class SecuritySystemHealthTracker extends EventEmitter {
    private systems;
    private healthCheckResults;
    private availabilityReports;
    private activeAlerts;
    private config;
    private checkIntervals;
    private performanceMetrics;
    constructor(config: HealthTrackerConfig);
    private initializeEventHandlers;
    private performDatabaseCheck;
    private performPortCheck;
    private performSSLCertCheck;
    private performDiskSpaceCheck;
    boolean: any;
    usage: number;
}
//# sourceMappingURL=SecuritySystemHealthTracker.d.ts.map