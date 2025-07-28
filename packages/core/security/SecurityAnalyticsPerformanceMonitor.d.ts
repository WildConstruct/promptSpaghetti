/**
 * Security Analytics Performance Monitoring System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263619-0ECE5F
 *
 * Comprehensive performance monitoring for security analytics operations,
 * providing real-time performance tracking, bottleneck detection, and optimization recommendations.
 */
import { EventEmitter } from 'events';

export interface AnalyticsPerformanceProfile {
    id: string;
    name: string;
    description: string;
    analytics_type: 'threat_detection' | 'compliance_monitoring' | 'incident_response' | 'behavioral_analysis' | 'data_correlation' | 'real_time_streaming';
    configuration: {,
        monitoring_scope: MonitoringScope;
        performance_targets: PerformanceTarget[];
        sampling_rate: number;
        baseline_collection_period_hours: number;
        anomaly_detection_enabled: boolean;
        predictive_monitoring_enabled: boolean;
    };
    resource_tracking: {,
        cpu_monitoring: boolean;
        memory_monitoring: boolean;
        disk_io_monitoring: boolean;
        network_monitoring: boolean;
        gpu_monitoring: boolean;
        custom_resource_monitoring: CustomResourceConfig[];
    };
    performance_dimensions: {,
        throughput_tracking: ThroughputConfig;
        latency_tracking: LatencyConfig;
        accuracy_tracking: AccuracyConfig;
        availability_tracking: AvailabilityConfig;
        scalability_tracking: ScalabilityConfig;
    };
    current_state: {,
        overall_performance_score: number;
        throughput_score: number;
        latency_score: number;
        resource_efficiency_score: number;
        accuracy_score: number;
        availability_score: number;
        last_updated: number;
        trend_direction: 'improving' | 'stable' | 'degrading';
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;

export interface MonitoringScope {
    components: string[];
    operations: string[];
    data_sources: string[];
    geographic_regions: string[];
    time_windows: TimeWindow[];
    exclusions: {,
        components: string[];
        operations: string[];
        time_periods: string[];
    };

export interface TimeWindow {
    name: string;
    start_hour: number;
    end_hour: number;
    days_of_week: number[];
    timezone: string;
    performance_expectations: {,
        expected_load_multiplier: number;
        expected_response_time_multiplier: number;
        priority_level: 'low' | 'medium' | 'high' | 'critical';
    };

export interface PerformanceTarget {
    id: string;
    name: string;
    metric_name: string;
    target_value: number;
    warning_threshold: number;
    critical_threshold: number;
    measurement_unit: string;
    evaluation_period_minutes: number;
    target_type: 'minimum' | 'maximum' | 'range' | 'exact';
    range_min?: number;
    range_max?: number;
    tolerance_percentage: number;
    business_impact: {,
        impact_level: 'low' | 'medium' | 'high' | 'critical';
        affected_processes: string[];
        cost_per_violation: number;
        sla_requirement: boolean;
    };

export interface CustomResourceConfig {
    id: string;
    name: string;
    description: string;
    collection_method: 'api_call' | 'file_read' | 'command_execution' | 'snmp_query' | 'database_query';
    collection_config: {,
        endpoint?: string;
        command?: string;
        file_path?: string;
        query?: string;
        authentication?: Record<string, string>;
    };
    parsing_rule: string;
    unit: string;
    expected_range: {,
        min: number;
        max: number;
    };
    collection_frequency_seconds: number;

export interface ThroughputConfig {
    enabled: boolean;
    metrics: {,
        requests_per_second: boolean;
        events_processed_per_minute: boolean;
        data_volume_per_hour: boolean;
        concurrent_operations: boolean;
        queue_processing_rate: boolean;
    };
    targets: {,
        min_requests_per_second: number;
        min_events_per_minute: number;
        min_data_volume_gb_per_hour: number;
        max_queue_depth: number;
    };
    bottleneck_detection: {,
        enabled: boolean;
        detection_algorithms: ('trend_analysis' | 'anomaly_detection' | 'threshold_monitoring')[];
        alert_on_degradation_percent: number;
    };

export interface LatencyConfig {
    enabled: boolean;
    metrics: {,
        response_time: boolean;
        processing_latency: boolean;
        queue_wait_time: boolean;
        network_latency: boolean;
        database_query_time: boolean;
    };
    targets: {,
        max_response_time_ms: number;
        max_processing_latency_ms: number;
        max_queue_wait_time_ms: number;
        p95_response_time_ms: number;
        p99_response_time_ms: number;
    };
    percentile_tracking: {,
        enabled: boolean;
        percentiles: number[];
        window_size_minutes: number;
    };

export interface AccuracyConfig {
    enabled: boolean;
    metrics: {,
        detection_accuracy: boolean;
        false_positive_rate: boolean;
        false_negative_rate: boolean;
        precision_score: boolean;
        recall_score: boolean;
        f1_score: boolean;
    };
    targets: {,
        min_detection_accuracy_percent: number;
        max_false_positive_rate_percent: number;
        max_false_negative_rate_percent: number;
        min_precision_score: number;
        min_recall_score: number;
        min_f1_score: number;
    };
    validation_methods: {,
        ground_truth_comparison: boolean;
        expert_validation: boolean;
        automated_testing: boolean;
        continuous_validation: boolean;
    };

export interface AvailabilityConfig {
    enabled: boolean;
    metrics: {,
        uptime_percentage: boolean;
        service_availability: boolean;
        data_freshness: boolean;
        system_responsiveness: boolean;
    };
    targets: {,
        min_uptime_percentage: number;
        max_downtime_minutes_per_day: number;
        max_data_staleness_minutes: number;
        max_system_response_time_ms: number;
    };
    availability_requirements: {,
        sla_level: number;
        maintenance_windows: MaintenanceWindow[];
        disaster_recovery_rto_minutes: number;
        disaster_recovery_rpo_minutes: number;
    };

export interface ScalabilityConfig {
    enabled: boolean;
    metrics: {,
        horizontal_scaling: boolean;
        vertical_scaling: boolean;
        load_distribution: boolean;
        resource_utilization: boolean;
    };
    targets: {,
        max_cpu_utilization_percent: number;
        max_memory_utilization_percent: number;
        max_disk_utilization_percent: number;
        optimal_load_distribution_variance: number;
    };
    scaling_policies: {,
        auto_scaling_enabled: boolean;
        scale_up_threshold: number;
        scale_down_threshold: number;
        max_instances: number;
        min_instances: number;
    };

export interface MaintenanceWindow {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
    timezone: string;
    impact_on_sla: boolean;

export interface PerformanceMetrics {
    profile_id: string;
    timestamp: number;
    collection_duration_ms: number;
    system_resources: {,
        cpu_usage_percent: number;
        memory_usage_percent: number;
        memory_usage_mb: number;
        disk_io_read_bps: number;
        disk_io_write_bps: number;
        network_io_in_bps: number;
        network_io_out_bps: number;
        gpu_usage_percent?: number;
        gpu_memory_usage_mb?: number;
    };
    throughput: {,
        requests_per_second: number;
        events_processed_per_minute: number;
        data_volume_gb_per_hour: number;
        concurrent_operations: number;
        queue_depth: number;
        processing_rate: number;
    };
    latency: {,
        avg_response_time_ms: number;
        p50_response_time_ms: number;
        p90_response_time_ms: number;
        p95_response_time_ms: number;
        p99_response_time_ms: number;
        max_response_time_ms: number;
        processing_latency_ms: number;
        queue_wait_time_ms: number;
        network_latency_ms: number;
        database_query_time_ms: number;
    };
    accuracy: {,
        detection_accuracy_percent: number;
        false_positive_rate_percent: number;
        false_negative_rate_percent: number;
        precision_score: number;
        recall_score: number;
        f1_score: number;
        confidence_score: number;
    };
    availability: {,
        uptime_percentage: number;
        service_availability_percentage: number;
        data_freshness_minutes: number;
        system_responsiveness_score: number;
        error_rate_percent: number;
    };
    scalability: {,
        horizontal_scale_factor: number;
        vertical_scale_factor: number;
        load_distribution_variance: number;
        resource_efficiency_score: number;
        bottleneck_indicator: string;
    };
    custom_metrics: Record<string, number>;
    quality_indicators: {,
        data_quality_score: number;
        completeness_percentage: number;
        consistency_score: number;
        timeliness_score: number;
    };

export interface PerformanceAnomaly {
    id: string;
    profile_id: string;
    detected_at: number;
    anomaly_type: 'performance_degradation' | 'resource_spike' | 'accuracy_drop' | 'availability_issue' | 'throughput_bottleneck' | 'latency_spike';
    severity: 'info' | 'warning' | 'critical';
    details: {,
        metric_name: string;
        current_value: number;
        expected_value: number;
        deviation_percentage: number;
        duration_minutes: number;
        trend_direction: 'increasing' | 'decreasing' | 'oscillating';
    };
    impact: {,
        affected_components: string[];
        affected_operations: string[];
        business_impact_level: 'low' | 'medium' | 'high' | 'critical';
        estimated_cost_impact: number;
        user_impact_description: string;
    };
    root_cause: {,
        suspected_causes: string[];
        contributing_factors: string[];
        correlation_analysis: CorrelationAnalysis[];
        confidence_score: number;
    };
    resolution: {,
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        resolved: boolean;
        resolved_by?: string;
        resolved_at?: number;
        resolution_method: string;
        resolution_notes?: string;
        prevention_measures?: string[];
    };

export interface CorrelationAnalysis {
    correlated_metric: string;
    correlation_strength: number;
    time_offset_minutes: number;
    statistical_significance: number;
    description: string;

export interface PerformanceOptimizationRecommendation {
    id: string;
    profile_id: string;
    recommendation_type: 'resource_optimization' | 'algorithm_tuning' | 'infrastructure_scaling' | 'configuration_change' | 'architectural_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    projected_impact: {,
        performance_improvement_percent: number;
        cost_reduction_percent?: number;
        resource_efficiency_improvement_percent?: number;
        accuracy_improvement_percent?: number;
        availability_improvement_percent?: number;
        implementation_complexity: 'low' | 'medium' | 'high';
        implementation_risk: 'low' | 'medium' | 'high';
    };
    implementation: {,
        required_changes: string[];
        configuration_parameters: Record<string, any>;
        infrastructure_requirements: string[];
        testing_recommendations: string[];
        rollback_strategy: string;
        estimated_implementation_hours: number;
    };
    success_criteria: {,
        performance_metrics: Record<string, number>;
        validation_methods: string[];
        measurement_period_days: number;
        success_threshold_percent: number;
    };
    generated_at: number;
    generated_by: string;
    status: 'pending' | 'approved' | 'implemented' | 'validated' | 'rejected';
    reviewed_by?: string;
    reviewed_at?: number;
    review_notes?: string;

export interface PerformanceBenchmark {
    id: string;
    name: string;
    description: string;
    benchmark_type: 'synthetic' | 'production_replay' | 'stress_test' | 'capacity_test' | 'endurance_test';
    configuration: {,
        test_duration_minutes: number;
        ramp_up_duration_minutes: number;
        ramp_down_duration_minutes: number;
        target_load: LoadConfiguration;
        data_set: DataSetConfiguration;
        environment_config: EnvironmentConfiguration;
    };
    expected_results: {,
        baseline_metrics: Record<string, number>;
        performance_targets: Record<string, number>;
        resource_limits: Record<string, number>;
        quality_thresholds: Record<string, number>;
    };
    executions: BenchmarkExecution[];
    created_by: string;
    created_at: number;
    last_executed: number;
    enabled: boolean;

export interface LoadConfiguration {
    concurrent_users: number;
    requests_per_second: number;
    data_volume_gb: number;
    operation_mix: Record<string, number>;
    geographic_distribution: Record<string, number>;

export interface DataSetConfiguration {
    data_type: 'synthetic' | 'anonymized_production' | 'test_data';
    volume_gb: number;
    complexity_level: 'simple' | 'medium' | 'complex';
    schema_version: string;
    data_characteristics: Record<string, any>;

export interface EnvironmentConfiguration {
    compute_resources: {,
        cpu_cores: number;
        memory_gb: number;
        storage_gb: number;
        network_bandwidth_mbps: number;
    };
    software_versions: Record<string, string>;
    configuration_parameters: Record<string, any>;
    infrastructure_type: 'on_premise' | 'cloud' | 'hybrid';

export interface BenchmarkExecution {
    id: string;
    benchmark_id: string;
    executed_at: number;
    executed_by: string;
    execution_duration_minutes: number;
    results: {,
        performance_metrics: PerformanceMetrics[];
        summary_statistics: Record<string, number>;
        resource_utilization: Record<string, number>;
        quality_metrics: Record<string, number>;
        bottlenecks_identified: string[];
    };
    comparison: {,
        performance_change_percent: Record<string, number>;
        resource_efficiency_change_percent: Record<string, number>;
        quality_change_percent: Record<string, number>;
        overall_score_change: number;
    };
    status: 'completed' | 'failed' | 'partial' | 'cancelled';
    issues_encountered: string[];
    notes: string;

export interface PerformanceReport {
    report_id: string;
    profile_id: string;
    generated_at: number;
    report_period: {,
        start_time: number;
        end_time: number;
        duration_hours: number;
    };
    executive_summary: {,
        overall_performance_score: number;
        performance_trend: 'improving' | 'stable' | 'degrading';
        key_achievements: string[];
        critical_issues: string[];
        recommendations_count: number;
    };
    performance_analysis: {,
        throughput_analysis: ThroughputAnalysis;
        latency_analysis: LatencyAnalysis;
        resource_analysis: ResourceAnalysis;
        accuracy_analysis: AccuracyAnalysis;
        availability_analysis: AvailabilityAnalysis;
        scalability_analysis: ScalabilityAnalysis;
    };
    anomaly_summary: {,
        total_anomalies: number;
        critical_anomalies: number;
        resolved_anomalies: number;
        average_resolution_time_minutes: number;
        most_frequent_anomaly_types: Array<{,
            type: string;
            count: number;
        }>;
    };
    benchmark_results: {,
        benchmarks_executed: number;
        performance_improvements_detected: number;
        performance_regressions_detected: number;
        benchmark_success_rate_percent: number;
    };
    recommendations: {,
        high_priority: PerformanceOptimizationRecommendation[];
        medium_priority: PerformanceOptimizationRecommendation[];
        low_priority: PerformanceOptimizationRecommendation[];
    };
    cost_analysis: {,
        current_operational_cost: number;
        projected_cost_with_optimizations: number;
        potential_savings: number;
        roi_timeline_months: number;
    };

export interface ThroughputAnalysis {
    average_throughput: number;
    peak_throughput: number;
    throughput_trend: 'increasing' | 'stable' | 'decreasing';
    bottlenecks_identified: string[];
    capacity_utilization_percent: number;
    scalability_headroom_percent: number;

export interface LatencyAnalysis {
    average_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
    latency_trend: 'improving' | 'stable' | 'degrading';
    latency_spikes_count: number;
    worst_performing_operations: Array<{,
        operation: string;
        avg_latency_ms: number;
    }>;

export interface ResourceAnalysis {
    average_cpu_utilization_percent: number;
    average_memory_utilization_percent: number;
    peak_resource_usage: Record<string, number>;
    resource_efficiency_score: number;
    waste_identification: string[];
    optimization_opportunities: string[];

export interface AccuracyAnalysis {
    average_accuracy_percent: number;
    accuracy_trend: 'improving' | 'stable' | 'degrading';
    false_positive_rate_percent: number;
    false_negative_rate_percent: number;
    accuracy_issues_identified: string[];
    model_performance_comparison: Array<{,
        model: string;
        accuracy: number;
    }>;

export interface AvailabilityAnalysis {
    uptime_percentage: number;
    availability_trend: 'improving' | 'stable' | 'degrading';
    downtime_incidents: number;
    average_recovery_time_minutes: number;
    sla_compliance_percentage: number;
    availability_risks_identified: string[];

export interface ScalabilityAnalysis {
    current_scale_factor: number;
    maximum_tested_scale: number;
    scaling_efficiency_score: number;
    scalability_bottlenecks: string[];
    auto_scaling_effectiveness: number;
    capacity_planning_recommendations: string[];

export declare class SecurityAnalyticsPerformanceMonitor extends EventEmitter {
    private profiles;
    private metricsHistory;
    private anomalies;
    private recommendations;
    private benchmarks;
    private monitoringIntervals;
    private anomalyDetectionIntervals;
    private baselines;
    constructor();
    private initializeGlobalMonitoring;
    createPerformanceProfile();
      profile: Omit<AnalyticsPerformanceProfile,
      'id' | 'created_at' | 'current_state'>
    ): Promise<string>;
    updatePerformanceProfile(profileId: string, updates: Partial<AnalyticsPerformanceProfile>): Promise<void>;
    deletePerformanceProfile(profileId: string): Promise<void>;
    private startProfileMonitoring;
    private stopProfileMonitoring;
    private collectPerformanceMetrics;
    private collectSystemResourceMetrics;
    private collectThroughputMetrics;
    private collectLatencyMetrics;
    private collectAccuracyMetrics;
    private collectAvailabilityMetrics;
    private collectScalabilityMetrics;
    private collectCustomMetrics;
    private collectCustomResourceValue;
    private collectQualityIndicators;
    private getAnalyticsTypeMultiplier;
    private getComplexityMultiplier;
    private getBaseAccuracy;
    private updatePerformanceScores;
    private calculateThroughputScore;
    private calculateLatencyScore;
    private calculateResourceEfficiencyScore;
    private calculateAccuracyScore;
    private calculateAvailabilityScore;
    private calculateTrendDirection;
    private checkPerformanceTargets;
    private extractMetricValue;
    private checkTargetViolation;
    private generatePerformanceAlert;
    private startBaselineCollection;
    private finalizeBaseline;
    private calculateBaselineStatistics;
    private getNestedValue;
    private calculateStandardDeviation;
    private performAnomalyDetection;
    private detectAnomalies;
    private checkForAnomalies;
    private detectStatisticalAnomaly;
    private generateAnomalyRecord;
    private mapAnomalyType;
    private assessBusinessImpact;
    private estimateCostImpact;
    private generateUserImpactDescription;
    private generateSuspectedCauses;
    private generateContributingFactors;
    private performGlobalPerformanceAnalysis;
    private generateOptimizationRecommendations;
    private analyzeOptimizationOpportunities;
    private generateGlobalOptimizationRecommendations;
    getPerformanceProfile(profileId: string): AnalyticsPerformanceProfile | undefined;
    getPerformanceProfiles(analyticsType?: AnalyticsPerformanceProfile['analytics_type']): AnalyticsPerformanceProfile[];
    getPerformanceMetrics(profileId: string, hours?: number): PerformanceMetrics[];
    getCurrentPerformanceState(profileId: string): AnalyticsPerformanceProfile['current_state'] | undefined;
    getActiveAnomalies(profileId?: string, severity?: PerformanceAnomaly['severity']): PerformanceAnomaly[];
    getOptimizationRecommendations();
      profileId: string,
      status?: PerformanceOptimizationRecommendation['status']
    ): PerformanceOptimizationRecommendation[];
    acknowledgeAnomaly(anomalyId: string, acknowledgedBy: string): Promise<void>;
    resolveAnomaly(anomalyId: string, resolvedBy: string, resolutionMethod: string, notes?: string): Promise<void>;
    generatePerformanceReport(profileId: string, hours?: number): Promise<PerformanceReport>;
    private analyzeThroughputTrends;
    private analyzeLatencyTrends;
    private analyzeResourceTrends;
    private analyzeAccuracyTrends;
    private analyzeAvailabilityTrends;
    private analyzeScalabilityTrends;
    private identifyKeyAchievements;
    private identifyCriticalIssues;
    private calculateAverageResolutionTime;
    private getMostFrequentAnomalyTypes;
    getSystemStatus(): {
        total_profiles: number;
        active_profiles: number;
        overall_performance_score: number;
        active_anomalies: number;
        pending_recommendations: number;
    };
    private performDataCleanup;
    performMaintenance(): Promise<void>;
    shutdown(): Promise<void>;

export default SecurityAnalyticsPerformanceMonitor;
//# sourceMappingURL=SecurityAnalyticsPerformanceMonitor.d.ts.map