/**
 * Security Analytics Reliability Engineering System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263636-E2FF7B
 *
 * Comprehensive reliability engineering for security analytics systems,
 * focusing on SRE principles, error budgets, and continuous improvement.
 */
import { EventEmitter } from 'events';
export interface ServiceLevelObjective {
    id: string;
    name: string;
    description: string;
    service: string;
    definition: {
        metric_type: 'availability' | 'latency' | 'throughput' | 'error_rate' | 'data_freshness' | 'alert_accuracy';
        target_value: number;
        measurement_window: number;
        evaluation_period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
    error_budget: {
        budget_percentage: number;
        consumption_rate: number;
        remaining_budget: number;
        burn_rate_threshold: number;
        reset_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
        last_reset: number;
    };
    alerting: {
        burn_rate_alerts: BurnRateAlert[];
        budget_exhaustion_threshold: number;
        multi_window_alerting: boolean;
        escalation_policy: string[];
    };
    performance_history: SLOPerformanceRecord[];
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;
}
export interface BurnRateAlert {
    id: string;
    name: string;
    short_window: number;
    long_window: number;
    burn_rate_threshold: number;
    severity: 'warning' | 'critical';
    notification_channels: string[];
}
export interface SLOPerformanceRecord {
    timestamp: number;
    measurement_window_start: number;
    measurement_window_end: number;
    actual_performance: number;
    target_performance: number;
    error_budget_consumed: number;
    error_budget_remaining: number;
    incidents_affecting_slo: string[];
    automated_actions_taken: string[];
}
export interface ReliabilityIncident {
    id: string;
    title: string;
    description: string;
    severity: 'sev1' | 'sev2' | 'sev3' | 'sev4';
    classification: {
        category: 'service_outage' | 'performance_degradation' | 'data_corruption' | 'security_breach' | 'capacity_issue';
        root_cause_category: 'infrastructure' | 'software_bug' | 'human_error' | 'external_dependency' | 'capacity' | 'security';
        impact_scope: 'single_service' | 'multiple_services' | 'entire_platform' | 'customer_facing';
    };
    timeline: {
        detected_at: number;
        acknowledged_at?: number;
        mitigated_at?: number;
        resolved_at?: number;
        postmortem_completed_at?: number;
    };
    impact: {
        affected_services: string[];
        affected_slos: string[];
        customer_impact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
        error_budget_impact: Record<string, number>;
        estimated_cost: number;
        users_affected: number;
    };
    response: {
        responders: string[];
        incident_commander: string;
        communication_channels: string[];
        actions_taken: IncidentAction[];
        lessons_learned: string[];
        improvement_items: ImprovementItem[];
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    status: 'active' | 'mitigated' | 'resolved' | 'postmortem_pending' | 'closed';
}
export interface IncidentAction {
    id: string;
    timestamp: number;
    actor: string;
    type: 'investigation' | 'mitigation' | 'communication' | 'escalation' | 'resolution';
    description: string;
    outcome: string;
    automated: boolean;
}
export interface ImprovementItem {
    id: string;
    title: string;
    description: string;
    category: 'monitoring' | 'alerting' | 'automation' | 'documentation' | 'training' | 'architecture';
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimated_effort: string;
    assigned_to: string;
    due_date: number;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}
export interface ReliabilityMetrics {
    id: string;
    service: string;
    collection_period: {
        start: number;
        end: number;
    };
    availability: {
        uptime_percentage: number;
        downtime_minutes: number;
        mtbf: number;
        mttr: number;
        mttd: number;
    };
    performance: {
        avg_response_time: number;
        p50_response_time: number;
        p95_response_time: number;
        p99_response_time: number;
        throughput_rps: number;
        error_rate_percentage: number;
    };
    error_budget: {
        total_budget: number;
        consumed_budget: number;
        remaining_budget: number;
        burn_rate: number;
        projected_exhaustion_date?: number;
    };
    capacity: {
        cpu_utilization: number;
        memory_utilization: number;
        disk_utilization: number;
        network_utilization: number;
        connection_pool_utilization: number;
        queue_depth: number;
    };
    dependencies: Array<{
        service: string;
        availability: number;
        avg_response_time: number;
        error_rate: number;
        health_score: number;
    }>;
    collected_at: number;
    collection_method: 'automated' | 'manual';
}
export interface PostmortemTemplate {
    id: string;
    name: string;
    description: string;
    incident_categories: string[];
    sections: Array<{
        title: string;
        description: string;
        required: boolean;
        type: 'text' | 'timeline' | 'metrics' | 'action_items' | 'root_cause_analysis';
        template_content?: string;
    }>;
    required_reviewers: string[];
    approval_required: boolean;
    auto_assign_follow_ups: boolean;
    created_by: string;
    created_at: number;
    last_updated: number;
}
export interface ReliabilityReport {
    id: string;
    title: string;
    report_type: 'weekly' | 'monthly' | 'quarterly' | 'incident_summary' | 'slo_review';
    period: {
        start: number;
        end: number;
    };
    summary: {
        overall_reliability_score: number;
        key_achievements: string[];
        major_incidents: number;
        error_budget_status: 'healthy' | 'at_risk' | 'exhausted';
        top_reliability_risks: string[];
    };
    metrics: {
        slo_performance: Array<{
            slo_id: string;
            slo_name: string;
            target: number;
            actual: number;
            status: 'met' | 'missed' | 'at_risk';
            error_budget_remaining: number;
        }>;
        incident_statistics: {
            total_incidents: number;
            by_severity: Record<string, number>;
            by_category: Record<string, number>;
            avg_mttr: number;
            avg_mttd: number;
        };
        service_health: Array<{
            service: string;
            availability: number;
            performance_score: number;
            capacity_utilization: number;
            trend: 'improving' | 'stable' | 'degrading';
        }>;
    };
    recommendations: Array<{
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: 'monitoring' | 'capacity' | 'automation' | 'process';
        title: string;
        description: string;
        estimated_impact: string;
        estimated_effort: string;
    }>;
    generated_by: string;
    generated_at: number;
    reviewed_by?: string[];
    approved_at?: number;
}
export interface ReliabilityEvent {
    id: string;
    type: 'slo_violation' | 'error_budget_alert' | 'incident_detected' | 'capacity_threshold' | 'performance_degradation';
    severity: 'info' | 'warning' | 'error' | 'critical';
    source: string;
    timestamp: number;
    title: string;
    description: string;
    data: {
        affected_services?: string[];
        metrics?: Record<string, number>;
        thresholds?: Record<string, number>;
        projected_impact?: string;
        recommended_actions?: string[];
    };
    response: {
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        auto_resolved: boolean;
        resolved_at?: number;
        resolution_notes?: string;
    };
}
export declare class SecurityReliabilityEngineer extends EventEmitter {
    private slos;
    private incidents;
    private metrics;
    private postmortemTemplates;
    private reports;
    private events;
    constructor();
    createSLO(
      slo: Omit<ServiceLevelObjective,
      'id' | 'created_at' | 'last_updated' | 'error_budget' | 'performance_history'>
    ): Promise<string>;
    updateSLOPerformance(sloId: string, measurement: {
        actual_performance: number;
        measurement_window_start: number;
        measurement_window_end: number;
        incidents?: string[];
    }): Promise<void>;
    private calculateBurnRate;
    private handleSLOViolation;
    private checkErrorBudgetAlerts;
    createIncident(
      incident: Omit<ReliabilityIncident,
      'id' | 'created_at' | 'last_updated' | 'timeline' | 'response'>
    ): Promise<string>;
    updateIncidentStatus(incidentId: string, status: ReliabilityIncident['status'], updates: {
        timeline_update?: Partial<ReliabilityIncident['timeline']>;
        actions?: IncidentAction[];
        lessons_learned?: string[];
        improvement_items?: ImprovementItem[];
    }): Promise<void>;
    collectServiceMetrics(service: string): Promise<string>;
    private calculateServiceHealthScore;
    generateReliabilityReport(reportType: ReliabilityReport['report_type'], period: {
        start: number;
        end: number;
    }): Promise<string>;
    private calculateAverageMTTR;
    private calculateAverageMTTD;
    getSystemHealth(): {
        overall_status: 'healthy' | 'degraded' | 'critical';
        slo_compliance: number;
        active_incidents: number;
        error_budget_status: 'healthy' | 'at_risk' | 'exhausted';
        services: Array<{
            name: string;
            status: 'healthy' | 'degraded' | 'unhealthy';
            health_score: number;
        }>;
    };
    private initializeDefaultSLOs;
    private startMetricsCollection;
    private startErrorBudgetMonitoring;
    getSLOs(): ServiceLevelObjective[];
    getIncidents(): ReliabilityIncident[];
    getEvents(): ReliabilityEvent[];
    getReports(): ReliabilityReport[];
    exportConfiguration(): Promise<string>;
    importConfiguration(configJson: string): Promise<void>;
}
export default SecurityReliabilityEngineer;
//# sourceMappingURL=SecurityReliabilityEngineer.d.ts.map