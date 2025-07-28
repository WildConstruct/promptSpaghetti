/**
 * Security Analytics Capacity Planning and Scaling Automation
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263634-4DFC3D
 *
 * Intelligent capacity planning and automated scaling for security analytics systems,
 * ensuring optimal performance and cost efficiency under varying loads.
 */
import { EventEmitter } from 'events';
export interface CapacityPlan {
    id: string;
    name: string;
    description: string;
    service: string;
    planning_horizon: {
        short_term_days: number;
        medium_term_days: number;
        long_term_days: number;
    };
    requirements: {
        baseline_capacity: ResourceRequirements;
        peak_capacity: ResourceRequirements;
        growth_projections: GrowthProjection;
        performance_targets: PerformanceTargets;
        availability_requirements: AvailabilityRequirements;
    };
    scaling: {
        auto_scaling_enabled: boolean;
        scaling_policies: ScalingPolicy;
        scaling_cooldown: number;
        min_instances: number;
        max_instances: number;
        target_utilization: {
            cpu_percentage: number;
            memory_percentage: number;
            network_percentage: number;
            custom_metrics: CustomMetricTarget;
        };
    };
    cost_optimization: {
        budget_constraints: {
            monthly_budget: number;
            cost_per_hour_limit: number;
            currency: string;
        };
        instance_types: InstanceTypeConfig;
        reserved_capacity: {
            percentage: number;
            commitment_period: 'monthly' | 'yearly' | 'multi_year';
        };
        spot_instances: {
            enabled: boolean;
            max_percentage: number;
            fallback_strategy: 'on_demand' | 'reserved' | 'scale_down';
        };
    };
    monitoring: {
        capacity_thresholds: {
            warning_percentage: number;
            critical_percentage: number;
            forecast_breach_days: number;
        };
        metrics_collection: {
            interval_seconds: number;
            retention_days: number;
            custom_metrics: string;
        };
        alerting: {
            notification_channels: string;
            escalation_policy: string;
            alert_suppression_minutes: number;
        };
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    last_reviewed: number;
    next_review_date: number;
    enabled: boolean;
}
export interface ResourceRequirements {
    cpu_cores: number;
    memory_gb: number;
    storage_gb: number;
    network_bandwidth_mbps: number;
    iops_required: number;
    gpu_units?: number;
    custom_resources?: Record<string, number>;
}
export interface GrowthProjection {
    period: 'monthly' | 'quarterly' | 'yearly';
    metric: 'transactions' | 'users' | 'data_volume' | 'requests' | 'events';
    current_value: number;
    projected_growth_rate: number;
    confidence_level: number;
    assumptions: string;
    seasonal_factors?: SeasonalFactor;
}
export interface SeasonalFactor {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    pattern: 'cyclical' | 'trending' | 'spike';
    multiplier: number;
    duration_hours?: number;
    description: string;
}
export interface PerformanceTargets {
    response_time_p95_ms: number;
    response_time_p99_ms: number;
    throughput_rps: number;
    error_rate_percentage: number;
    availability_percentage: number;
    data_processing_latency_ms: number;
}
export interface AvailabilityRequirements {
    target_availability: number;
    downtime_budget_minutes_monthly: number;
    maintenance_window: {
        day_of_week: string;
        start_time: string;
        duration_hours: number;
        timezone: string;
    };
    disaster_recovery: {
        rto_minutes: number;
        rpo_minutes: number;
        geographic_redundancy: boolean;
    };
}
export interface ScalingPolicy {
    id: string;
    name: string;
    description: string;
    type: 'reactive' | 'predictive' | 'scheduled';
    enabled: boolean;
    triggers: {
        metric_based: MetricTrigger;
        time_based: TimeTrigger;
        event_based: EventTrigger;
    };
    actions: {
        scale_up: ScalingAction;
        scale_down: ScalingAction;
        notification: NotificationAction;
    };
    constraints: {
        max_scale_up_percentage: number;
        max_scale_down_percentage: number;
        cooldown_period_seconds: number;
        min_stable_period_seconds: number;
    };
    created_at: number;
    last_triggered: number;
    trigger_count: number;
}
export interface MetricTrigger {
    metric_name: string;
    comparison: 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal';
    threshold: number;
    duration_seconds: number;
    datapoints_to_alarm: number;
    evaluation_periods: number;
}
export interface TimeTrigger {
    schedule_type: 'cron' | 'recurring' | 'one_time';
    cron_expression?: string;
    recurring_pattern?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        times: string;
        days_of_week?: string;
        timezone: string;
    };
    one_time_datetime?: number;
    target_capacity: number;
}
export interface EventTrigger {
    event_type: 'security_incident' | 'high_alert_volume' | 'system_failure' | 'maintenance_mode';
    event_source: string;
    conditions: Record<string, any>;
    scaling_factor: number;
}
export interface ScalingAction {
    action_type: 'instance_count' | 'resource_adjustment' | 'load_balancer_weight';
    target_value?: number;
    adjustment_value?: number;
    adjustment_type: 'percentage' | 'absolute';
    instance_types?: string;
    availability_zones?: string;
    termination_policy?: 'oldest_first' | 'newest_first' | 'least_utilized';
}
export interface NotificationAction {
    channel: 'email' | 'slack' | 'webhook' | 'sms';
    target: string;
    message_template: string;
    severity: 'info' | 'warning' | 'error';
}
export interface CustomMetricTarget {
    metric_name: string;
    target_value: number;
    comparison: 'less_than' | 'greater_than';
    weight: number;
}
export interface InstanceTypeConfig {
    instance_type: string;
    cpu_cores: number;
    memory_gb: number;
    network_performance: 'low' | 'moderate' | 'high' | 'very_high';
    storage_type: 'ebs' | 'instance_store';
    cost_per_hour: number;
    spot_availability: boolean;
    use_cases: string;
    priority: number;
}
export interface CapacityMetrics {
    id: string;
    service: string;
    timestamp: number;
    collection_period: {
        start: number;
        end: number;
    };
    current_utilization: {
        cpu_percentage: number;
        memory_percentage: number;
        disk_percentage: number;
        network_percentage: number;
        custom_metrics: Record<string, number>;
    };
    performance: {
        avg_response_time: number;
        p95_response_time: number;
        p99_response_time: number;
        throughput_rps: number;
        error_rate: number;
        queue_depth: number;
        active_connections: number;
    };
    resources: {
        allocated_instances: number;
        running_instances: number;
        pending_instances: number;
        terminating_instances: number;
        total_cpu_cores: number;
        total_memory_gb: number;
        total_storage_gb: number;
    };
    cost: {
        current_hourly_cost: number;
        projected_monthly_cost: number;
        reserved_capacity_utilization: number;
        spot_instance_percentage: number;
        cost_per_request: number;
    };
    health: {
        overall_health_score: number;
        bottleneck_indicators: string;
        scaling_recommendations: string;
        cost_optimization_opportunities: string;
    };
}
export interface ScalingEvent {
    id: string;
    timestamp: number;
    service: string;
    policy_id: string;
    event_type: 'scale_up' | 'scale_down' | 'policy_triggered' | 'manual_intervention';
    trigger_reason: string;
    triggered_by: string;
    scaling_details: {
        previous_capacity: number;
        target_capacity: number;
        actual_capacity: number;
        scaling_duration_seconds: number;
        instances_added: number;
        instances_removed: number;
    };
    impact: {
        performance_change: {
            response_time_change_ms: number;
            throughput_change_rps: number;
            error_rate_change: number;
        };
        cost_impact: {
            hourly_cost_change: number;
            estimated_monthly_impact: number;
        };
        availability_impact: 'none' | 'minimal' | 'moderate' | 'significant';
    };
    validation: {
        scaling_successful: boolean;
        target_reached: boolean;
        performance_improved: boolean;
        issues_encountered: string;
        rollback_required: boolean;
    };
}
export interface CapacityForecast {
    id: string;
    service: string;
    generated_at: number;
    forecast_horizon_days: number;
    methodology: {
        algorithm: 'linear_regression' | 'exponential_smoothing' | 'arima' | 'machine_learning';
        confidence_interval: number;
        historical_data_points: number;
        seasonal_adjustments: boolean;
        trend_adjustments: boolean;
    };
    forecasts: Array<{}, date>;
    number: any;
    predicted_load: number;
    confidence_upper: number;
    confidence_lower: number;
    required_capacity: ResourceRequirements;
    estimated_cost: number;
    risk_factors: string;
}
export interface CapacityRecommendation {
    id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'scaling' | 'optimization' | 'cost_reduction' | 'performance' | 'reliability';
    title: string;
    description: string;
    rationale: string;
    implementation: {
        estimated_effort_hours: number;
        estimated_cost_impact: number;
        estimated_benefit: string;
        prerequisites: string;
        risks: string;
        rollback_plan: string;
    };
    timeline: {
        recommended_start: number;
        estimated_completion: number;
        deadline?: number;
    };
    status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
    created_at: number;
    last_updated: number;
}
export declare class SecurityCapacityManager extends EventEmitter {
    private capacityPlans;
    private scalingPolicies;
    private metrics;
    private scalingEvents;
    private forecasts;
    private recommendations;
    private currentCapacity;
    private activeScaling;
    private cooldownPeriods;
    constructor();
    private createDefaultScalingPolicies;
    description: 'Scale up when CPU utilization is high';
    type: 'reactive';
    enabled: true;
    triggers: {
        metric_based: [
            {},
            metric_name: 'cpu_utilization',
            comparison: 'greater_than',
            threshold: plan.scaling.target_utilization.cpu_percentage,
            duration_seconds: 300,
            datapoints_to_alarm: 2,
            evaluation_periods: 2
        ];
    };
    time_based: [];
    event_based: [];
}
//# sourceMappingURL=SecurityCapacityManager.d.ts.map