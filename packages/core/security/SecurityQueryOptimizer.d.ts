/**
 * Security Analytics Query Optimization and Caching System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263629-64F2B0
 *
 * Advanced query optimization and intelligent caching for security analytics,
 * ensuring high-performance data access and efficient resource utilization.
 */
import { EventEmitter } from 'events';

}
}
export interface QueryProfile { id: string;
    query_hash: string;
    query_text: string;
    query_type: 'search' | 'aggregation' | 'time_series' | 'correlation' | 'threat_hunt' | 'compliance_report';
    characteristics: {
        complexity_score: number;
        data_volume_estimate: number;
        time_range_days: number;
        filter_selectivity: number;
        join_complexity: number;
        aggregation_complexity: number }
}
    };
    performance_history: QueryExecution[];
    optimization: { optimization_level: 'none' | 'basic' | 'moderate' | 'aggressive';
        suggested_indices: string[];
        partitioning_strategy: string;
        caching_strategy: CachingStrategy;
        execution_plan: ExecutionPlan;
        cost_estimate: number };
    usage: { frequency_per_day: number;
        peak_usage_hours: number[];
        user_patterns: UserUsagePattern[];
        seasonal_patterns: SeasonalPattern[] };
    created_at: number;
    last_updated: number;
    last_executed: number;

}
}
export interface QueryExecution { id: string;
    query_profile_id: string;
    executed_at: number;
    executed_by: string;
    execution_time_ms: number;
    cpu_time_ms: number;
    memory_usage_mb: number;
    disk_io_operations: number;
    network_io_mb: number;
    rows_examined: number;
    rows_returned: number;
    bytes_processed: number;
    partitions_scanned: number;
    index_hits: number;
    index_misses: number;
    cache_hit: boolean;
    cache_key?: string;
    cache_generation_time_ms?: number;
    cache_size_mb?: number;
    optimizations_applied: string[];
    execution_plan_used: string;
    parallelization_factor: number;
    compute_cost: number;
    storage_cost: number;
    network_cost: number;
    total_cost: number;
    result_accuracy: number;
    result_completeness: number;
    user_satisfaction_score?: number }
}
}
export interface CachingStrategy { cache_type: 'none' | 'result_cache' | 'partial_cache' | 'materialized_view' | 'smart_cache';
    cache_duration_seconds: number;
    cache_invalidation_triggers: string[];
    cache_refresh_strategy: 'on_demand' | 'scheduled' | 'automatic' | 'predictive';
    cache_partitioning: boolean;
    cache_compression: boolean;
    cache_location: 'memory' | 'ssd' | 'distributed' }
}
}
export interface ExecutionPlan { id: string;
    plan_type: 'sequential' | 'parallel' | 'distributed' | 'hybrid';
    estimated_cost: number;
    estimated_time_ms: number;
    steps: Array<{
        step_id: number;
        operation: string;
        estimated_time_ms: number;
        estimated_rows: number;
        parallelization: number;
        dependencies: number[] }
}
    }>;
    resources: { cpu_cores: number;
        memory_mb: number;
        disk_io_mb: number;
        network_mb: number };
    optimizations: { index_usage: string[];
        partition_pruning: boolean;
        predicate_pushdown: boolean;
        column_pruning: boolean;
        join_reordering: boolean;
        aggregation_pushdown: boolean };

}
}
export interface UserUsagePattern { user_id: string;
    usage_frequency: number;
    preferred_time_ranges: Array<{
        start_hour: number;
        end_hour: number }
}
    }>;
    query_complexity_preference: 'simple' | 'moderate' | 'complex';
    result_size_preference: 'small' | 'medium' | 'large';
    latency_tolerance_ms: number;

}
}
export interface SeasonalPattern { pattern_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    peak_periods: Array<{
        start: number;
        end: number;
        multiplier: number }
}
    }>;
    low_periods: Array<{ start: number;
        end: number;
        multiplier: number }>;
    confidence_score: number;

}
}
export interface CacheEntry { cache_key: string;
    query_hash: string;
    query_text: string;
    created_at: number;
    expires_at: number;
    last_accessed: number;
    access_count: number;
    size_mb: number;
    result_data: any;
    result_metadata: {
        row_count: number;
        column_count: number;
        data_freshness: number;
        computation_time_ms: number }
}
    };
    hit_rate: number;
    avg_retrieval_time_ms: number;
    cost_savings: number;
    invalidation_triggers: string[];
    auto_refresh: boolean;
    refresh_schedule?: string;
    replicated: boolean;
    replication_factor: number;
    geographic_distribution: string[];

}
}
export interface QueryOptimizationRule { id: string;
    name: string;
    description: string;
    rule_type: 'index_suggestion' | 'query_rewrite' | 'caching_strategy' | 'partitioning' | 'execution_plan';
    conditions: {
        query_patterns: string[];
        performance_thresholds: {
            min_execution_time_ms?: number;
            min_cpu_time_ms?: number;
            min_memory_usage_mb?: number;
            min_cost?: number }
}
        };
        usage_patterns: { min_frequency_per_day?: number;
            min_user_count?: number };
    };
    actions: { index_recommendations: IndexRecommendation[];
        query_rewrites: QueryRewrite[];
        caching_recommendations: CachingStrategy[];
        partitioning_suggestions: string[];
        execution_optimizations: string[] };
    priority: number;
    confidence_score: number;
    expected_improvement_percentage: number;
    implementation_cost: 'low' | 'medium' | 'high';
    enabled: boolean;
    created_at: number;
    last_applied: number;
    application_count: number;
    success_rate: number;

}
}
export interface IndexRecommendation { index_name: string;
    table_name: string;
    columns: string[];
    index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'bloom' | 'partial';
    estimated_size_mb: number;
    estimated_improvement_percentage: number;
    maintenance_cost: number;
    creation_time_estimate_minutes: number }
}
}
export interface QueryRewrite { original_pattern: string;
    optimized_pattern: string;
    transformation_type: 'predicate_pushdown' | 'join_elimination' | 'subquery_flattening' | 'common_table_expression';
    expected_improvement_percentage: number;
    risk_level: 'low' | 'medium' | 'high';
    validation_required: boolean }
}
}
export interface OptimizationJob { id: string;
    name: string;
    description: string;
    job_type: 'index_creation' | 'cache_warming' | 'partition_maintenance' | 'statistics_update' | 'query_plan_refresh';
    config: {
        target_queries: string[];
        target_tables: string[];
        optimization_level: 'conservative' | 'moderate' | 'aggressive';
        max_duration_minutes: number;
        max_resource_usage_percentage: number }
}
    };
    schedule: { type: 'manual' | 'scheduled' | 'triggered';
        cron_expression?: string;
        trigger_conditions?: {
            performance_degradation_threshold: number;
            cache_miss_rate_threshold: number;
            query_volume_threshold: number };
    };
    execution: { status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
        started_at?: number;
        completed_at?: number;
        progress_percentage: number;
        current_operation?: string };
    results: { optimizations_applied: number;
        performance_improvements: Record<string, number>;
        cost_savings: number;
        errors_encountered: string[];
        rollback_performed: boolean };
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;

}
}
export interface PerformanceMetrics { id: string;
    collection_period: {
        start: number;
        end: number }
}
    };
    query_performance: { total_queries: number;
        avg_execution_time_ms: number;
        p50_execution_time_ms: number;
        p95_execution_time_ms: number;
        p99_execution_time_ms: number;
        slow_queries_count: number;
        failed_queries_count: number };
    cache_performance: { total_cache_entries: number;
        cache_hit_rate: number;
        cache_miss_rate: number;
        avg_cache_retrieval_time_ms: number;
        cache_size_total_mb: number;
        cache_evictions: number;
        cache_refreshes: number };
    resource_utilization: { avg_cpu_utilization: number;
        peak_cpu_utilization: number;
        avg_memory_utilization: number;
        peak_memory_utilization: number;
        disk_io_operations_per_second: number;
        network_throughput_mbps: number };
    cost_metrics: { total_compute_cost: number;
        total_storage_cost: number;
        total_network_cost: number;
        cost_per_query: number;
        cost_savings_from_cache: number;
        cost_savings_from_optimization: number };
    optimization_effectiveness: { rules_applied: number;
        avg_improvement_percentage: number;
        successful_optimizations: number;
        failed_optimizations: number;
        user_satisfaction_score: number };
    collected_at: number;

}
}
export interface OptimizationEvent { id: string;
    type: 'optimization_applied' | 'cache_miss_spike' | 'performance_degradation' | 'rule_triggered' | 'index_created' | 'cache_warmed';
    severity: 'info' | 'warning' | 'error' | 'critical';
    source: string;
    timestamp: number;
    title: string;
    description: string;
    query_profile_id?: string;
    optimization_job_id?: string;
    performance_impact: {
        before_metrics: Record<string, number>;
        after_metrics: Record<string, number>;
        improvement_percentage: number;
        cost_impact: number }
}
    };
    context: { affected_queries: string[];
        system_state: Record<string, any>;
        resource_utilization: Record<string, number>;
        user_impact_assessment: string };
    response: { acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        actions_taken: string[];
        rollback_required: boolean;
        rollback_completed: boolean };

export declare class SecurityQueryOptimizer extends EventEmitter { private queryProfiles;
    private queryExecutions;
    private cacheEntries;
    private optimizationRules;
    private optimizationJobs;
    private performanceMetrics;
    private events;
    private activeOptimizations;
    private queryCache;
    private executionPlanCache;
    private metricsCollectionInterval?;
    private cacheMaintenanceInterval?;
    private optimizationAnalysisInterval?;
    private performanceTuningInterval?;
    constructor();
    profileQuery(queryText: string, queryType: QueryProfile['query_type'], executedBy: string): Promise<string>;
    private generateQueryHash;
    private analyzeQueryCharacteristics;
    private calculateComplexityScore;
    private estimateDataVolume;
    private extractTimeRange;
    private analyzeFilterSelectivity;
    private analyzeJoinComplexity;
    private analyzeAggregationComplexity;
    private generateOptimizationStrategy;
    private determineOptimizationLevel;
    private suggestIndices;
    private suggestPartitioning;
    private suggestCachingStrategy;
    private generateExecutionPlan;
    private estimateQueryCost;
    private estimateExecutionTime;
    private generateExecutionSteps;
    private calculateResourceRequirements;
    private executeQueryWithProfiling;
    private simulateQueryExecution;
    private generateCacheKey;
    private extractQueryParameters;
    private createCacheEntry;
    private estimateCacheSize;
    private getAppliedOptimizations;
    private analyzeOptimizationOpportunities;
    private evaluateOptimizationRule;
    private applyOptimizationRule;
    private createRecommendedIndex;
    private applyQueryRewrite;
    collectPerformanceMetrics(): Promise<string>;
    private calculateAverage;
    private calculateSum;
    private calculatePercentile;
    private calculateCacheHitRate;
    private calculateAverageCacheRetrievalTime;
    private calculateTotalCacheSize;
    private calculateCacheSavings;
    private calculateOptimizationSavings;
    private calculateAverageImprovement;
    getSystemStatus(): {
        query_profiles: number;
        cache_entries: number;
        active_optimizations: number;
        avg_cache_hit_rate: number;
        avg_query_time_ms: number;
        system_efficiency_score: number;
        recent_events: OptimizationEvent[] };
    private initializeDefaultRules;
    private startMetricsCollection;
    private startCacheMaintenance;
    private startOptimizationAnalysis;
    private startPerformanceTuning;
    private performCacheMaintenance;
    private performOptimizationAnalysis;
    private performPerformanceTuning;
    getQueryProfiles(): QueryProfile[];
    getCacheEntries(): CacheEntry[];
    getOptimizationRules(): QueryOptimizationRule[];
    getPerformanceMetrics(): PerformanceMetrics[];
    getEvents(): OptimizationEvent[];
    exportConfiguration(): Promise<string>;
    importConfiguration(configJson: string): Promise<void>;
    shutdown(): void;

export default SecurityQueryOptimizer;
//# sourceMappingURL=SecurityQueryOptimizer.d.ts.map