/**
 * Security Query Performance Optimization and Caching System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263622-E9691A
 *
 * Advanced query performance optimization and intelligent caching for security analytics,
 * providing real-time query optimization, adaptive caching strategies, and performance analytics.
 */
import { EventEmitter } from 'events';
export interface QueryPerformanceProfile {
    id: string;
    query_hash: string;
    query_text: string;
    query_type: 'security_search' | 'threat_analysis' | 'compliance_report' | 'audit_log' | 'real_time_monitoring' | 'incident_investigation';
    characteristics: {
        complexity_score: number;
        estimated_data_volume_gb: number;
        time_range_hours: number;
        join_count: number;
        aggregation_count: number;
        filter_complexity: number;
        subquery_count: number;
        index_utilization_score: number;
    };
    performance_metrics: {
        execution_times_ms: number[];
        avg_execution_time_ms: number;
        p50_execution_time_ms: number;
        p95_execution_time_ms: number;
        p99_execution_time_ms: number;
        cpu_time_ms: number;
        memory_usage_mb: number;
        io_operations: number;
        network_latency_ms: number;
    };
    optimization: {
        optimization_applied: boolean;
        optimization_type: 'none' | 'index_hints' | 'query_rewrite' | 'parallel_execution' | 'result_caching' | 'materialized_view';
        optimization_score: number;
        suggested_indices: string[];
        query_rewrite_suggestions: string[];
        execution_plan_optimized: boolean;
    };
    caching: {
        cacheable: boolean;
        cache_strategy: CacheStrategy;
        cache_ttl_seconds: number;
        cache_hit_rate: number;
        cache_size_mb: number;
        invalidation_triggers: string[];
    };
    usage_patterns: {
        frequency_per_hour: number;
        peak_usage_times: number[];
        user_groups: string[];
        seasonal_patterns: SeasonalUsagePattern[];
        concurrent_execution_count: number;
    };
    created_at: number;
    last_updated: number;
    last_analyzed: number;
}
export interface CacheStrategy {
    strategy_type: 'result_cache' | 'query_cache' | 'partial_cache' | 'adaptive_cache' | 'distributed_cache';
    cache_level: 'query' | 'page' | 'row' | 'computed_result';
    invalidation_policy: 'ttl' | 'lru' | 'event_driven' | 'dependency_based' | 'smart_refresh';
    compression_enabled: boolean;
    encryption_enabled: boolean;
    replication_factor: number;
    adaptive_settings?: {
        hit_rate_threshold: number;
        size_threshold_mb: number;
        frequency_threshold: number;
        auto_optimize: boolean;
    };
}
export interface SeasonalUsagePattern {
    pattern_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    peak_periods: Array<{
        start_time: string;
        end_time: string;
        multiplier: number;
    }>;
    trend_direction: 'increasing' | 'stable' | 'decreasing';
    confidence_score: number;
}
export interface QueryOptimizationRule {
    id: string;
    name: string;
    description: string;
    rule_type: 'index_recommendation' | 'query_rewrite' | 'execution_plan' | 'caching_strategy' | 'partitioning';
    conditions: {
        query_types: QueryPerformanceProfile['query_type'][];
        complexity_min?: number;
        complexity_max?: number;
        execution_time_min_ms?: number;
        data_volume_min_gb?: number;
        frequency_min_per_hour?: number;
    };
    actions: {
        optimization_type: QueryPerformanceProfile['optimization']['optimization_type'];
        parameters: Record<string, any>;
        expected_improvement_percent: number;
        implementation_cost: 'low' | 'medium' | 'high';
        risk_level: 'low' | 'medium' | 'high';
    };
    effectiveness: {
        applications_count: number;
        success_rate: number;
        avg_improvement_percent: number;
        failure_reasons: string[];
    };
    enabled: boolean;
    priority: number;
    created_by: string;
    created_at: number;
}
export interface QueryExecution {
    id: string;
    query_profile_id: string;
    executed_at: number;
    executed_by: string;
    context: {
        user_role: string;
        request_source: string;
        session_id: string;
        concurrent_queries: number;
        system_load: number;
    };
    metrics: {
        execution_time_ms: number;
        planning_time_ms: number;
        cpu_time_ms: number;
        memory_peak_mb: number;
        memory_avg_mb: number;
        disk_reads: number;
        disk_writes: number;
        network_bytes: number;
        rows_examined: number;
        rows_returned: number;
    };
    optimization: {
        optimizations_applied: string[];
        optimization_time_ms: number;
        execution_plan: ExecutionPlan;
        index_usage: IndexUsage[];
        cache_interactions: CacheInteraction[];
    };
    quality: {
        result_accuracy: number;
        result_completeness: number;
        data_freshness_score: number;
        user_satisfaction_score?: number;
    };
    status: 'completed' | 'failed' | 'timeout' | 'cancelled';
    error_details?: {
        error_type: string;
        error_message: string;
        stack_trace?: string;
    };
    warnings: string[];
}
export interface ExecutionPlan {
    plan_id: string;
    plan_type: 'sequential' | 'parallel' | 'distributed' | 'cached';
    estimated_cost: number;
    estimated_rows: number;
    steps: ExecutionStep[];
    parallelization_factor: number;
    resource_requirements: {
        cpu_cores: number;
        memory_mb: number;
        storage_mb: number;
        network_bandwidth_mbps: number;
    };
}
export interface ExecutionStep {
    step_id: string;
    step_type: 'table_scan' | 'index_scan' | 'join' | 'aggregation' | 'sort' | 'filter' | 'cache_lookup';
    operation_details: string;
    estimated_cost: number;
    estimated_rows: number;
    actual_cost?: number;
    actual_rows?: number;
    execution_time_ms?: number;
    optimization_suggestions: string[];
    alternative_approaches: string[];
}
export interface IndexUsage {
    index_name: string;
    table_name: string;
    usage_type: 'full_scan' | 'range_scan' | 'point_lookup' | 'not_used';
    selectivity: number;
    cost_estimate: number;
    rows_estimated: number;
    rows_actual?: number;
    effectiveness_score: number;
}
export interface CacheInteraction {
    cache_type: 'query_cache' | 'result_cache' | 'index_cache' | 'page_cache';
    cache_key: string;
    interaction_type: 'hit' | 'miss' | 'write' | 'invalidation';
    cache_size_mb: number;
    access_time_ms: number;
    data_freshness: number;
}
export interface PerformanceAlert {
    id: string;
    alert_type: 'slow_query' | 'high_resource_usage' | 'cache_miss_spike' | 'optimization_opportunity' | 'performance_regression';
    severity: 'info' | 'warning' | 'critical';
    query_profile_id?: string;
    title: string;
    description: string;
    detected_at: number;
    context: {
        current_metric_value: number;
        threshold_value: number;
        measurement_unit: string;
        trend_direction: 'improving' | 'stable' | 'degrading';
        impact_assessment: 'low' | 'medium' | 'high' | 'critical';
    };
    recommendations: {
        immediate_actions: string[];
        long_term_improvements: string[];
        estimated_impact: string;
        implementation_effort: 'low' | 'medium' | 'high';
    };
    resolution: {
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        resolved: boolean;
        resolved_by?: string;
        resolved_at?: number;
        resolution_notes?: string;
        effectiveness_rating?: number;
    };
}
export interface CacheConfiguration {
    cache_id: string;
    cache_name: string;
    cache_type: 'memory' | 'disk' | 'distributed' | 'hybrid';
    capacity: {
        max_size_mb: number;
        max_entries: number;
        memory_allocation_mb: number;
        disk_allocation_mb: number;
    };
    eviction: {
        policy: 'lru' | 'lfu' | 'ttl' | 'size_based' | 'intelligent';
        ttl_seconds: number;
        max_idle_time_seconds: number;
        priority_levels: number;
    };
    performance: {
        concurrent_access_limit: number;
        compression_enabled: boolean;
        encryption_enabled: boolean;
        prefetching_enabled: boolean;
        async_write_back: boolean;
    };
    monitoring: {
        hit_rate_threshold: number;
        latency_threshold_ms: number;
        size_alert_threshold_percent: number;
        enable_detailed_metrics: boolean;
    };
    partitioning?: {
        partition_strategy: 'hash' | 'range' | 'geographic' | 'custom';
        partition_count: number;
        rebalancing_enabled: boolean;
    };
}
export interface OptimizationReport {
    report_id: string;
    generated_at: number;
    report_period: {
        start_time: number;
        end_time: number;
        duration_hours: number;
    };
    performance_summary: {
        total_queries_analyzed: number;
        avg_query_time_ms: number;
        query_time_improvement_percent: number;
        cache_hit_rate_percent: number;
        cache_hit_improvement_percent: number;
        resource_utilization_reduction_percent: number;
    };
    optimization_opportunities: Array<{
        opportunity_type: string;
        estimated_impact: string;
        affected_queries: number;
        implementation_effort: string;
        priority_score: number;
    }>;
    trends: {
        query_volume_trend: 'increasing' | 'stable' | 'decreasing';
        performance_trend: 'improving' | 'stable' | 'degrading';
        cache_efficiency_trend: 'improving' | 'stable' | 'degrading';
        resource_usage_trend: 'increasing' | 'stable' | 'decreasing';
    };
    recommendations: {
        high_priority: string[];
        medium_priority: string[];
        low_priority: string[];
        infrastructure_changes: string[];
        configuration_changes: Record<string, any>;
    };
    metrics_comparison: {
        before_optimization: PerformanceMetrics;
        after_optimization: PerformanceMetrics;
        improvement_details: Record<string, number>;
    };
}
export interface PerformanceMetrics {
    avg_response_time_ms: number;
    p95_response_time_ms: number;
    p99_response_time_ms: number;
    throughput_queries_per_second: number;
    cache_hit_rate_percent: number;
    cpu_utilization_percent: number;
    memory_utilization_percent: number;
    error_rate_percent: number;
}
export declare class SecurityQueryPerformanceOptimizer extends EventEmitter {
    private queryProfiles;
    private optimizationRules;
    private queryExecutions;
    private performanceAlerts;
    private cacheConfigurations;
    private activeMonitoring;
    private performanceHistory;
    private optimizationHistory;
    constructor();
    private initializeDefaultRules;
    private initializeDefaultCacheConfigurations;
    private startPerformanceMonitoring;
    profileQuery(queryText: string, queryType: QueryPerformanceProfile['query_type'], executedBy: string): Promise<string>;
    executeQuery(profileId: string, executionContext: Partial<QueryExecution['context']>, executedBy: string): Promise<string>;
    private calculateComplexityScore;
    private estimateDataVolume;
    private extractTimeRange;
    private countJoins;
    private countSubqueries;
    private countAggregations;
    private calculateFilterComplexity;
    private isCacheable;
    private determineCacheStrategy;
    private calculateCacheTTL;
    private determineInvalidationTriggers;
    private applyOptimizations;
    private isRuleApplicable;
    private applyOptimizationRule;
    private applyIndexOptimization;
    private applyQueryRewrite;
    private applyParallelExecution;
    private applyResultCaching;
    private applyMaterializedView;
    private generateIndexSuggestions;
    private generateRewriteSuggestions;
    private checkCache;
    private storeInCache;
    private performQueryExecution;
    private generateExecutionPlan;
    private generateIndexUsage;
    private updateProfileMetrics;
    private collectPerformanceMetrics;
    private analyzeOptimizationOpportunities;
    private checkPerformanceAlerts;
    private generateOptimizationAlert;
    private generateImmediateRecommendations;
    private generateLongTermRecommendations;
    private estimateOptimizationImpact;
    private estimateImplementationEffort;
    getQueryProfile(profileId: string): QueryPerformanceProfile | undefined;
    getQueryProfiles(queryType?: QueryPerformanceProfile['query_type']): QueryPerformanceProfile[];
    getExecutionHistory(profileId: string, limit?: number): QueryExecution[];
    getPerformanceAlerts(profileId?: string, severity?: PerformanceAlert['severity']): PerformanceAlert[];
    getCurrentPerformanceMetrics(): PerformanceMetrics | null;
    getPerformanceHistory(hours?: number): Array<{
        timestamp: number;
        metrics: PerformanceMetrics;
    }>;
    generateOptimizationReport(periodHours?: number): Promise<OptimizationReport>;
    private generateOptimizationOpportunities;
    private analyzeTrend;
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void>;
    resolveAlert(alertId: string, resolvedBy: string, notes?: string, effectivenessRating?: number): Promise<void>;
    getSystemStatus(): {
        total_profiles: number;
        active_optimizations: number;
        avg_performance_score: number;
        cache_efficiency: number;
        alert_count: number;
    };
    performMaintenance(): Promise<void>;
    shutdown(): Promise<void>;
}
export default SecurityQueryPerformanceOptimizer;
//# sourceMappingURL=SecurityQueryPerformanceOptimizer.d.ts.map