/**
 * Security Data Pipeline Monitoring and Optimization System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263624-B1A6D0
 *
 * Comprehensive monitoring and optimization for security data pipelines,
 * ensuring data quality, performance, and real-time processing capabilities.
 */
import { EventEmitter } from 'events';
export interface DataPipeline {
    id: string;
    name: string;
    description: string;
    type: 'ingestion' | 'transformation' | 'enrichment' | 'aggregation' | 'export' | 'analytics' | 'ml_processing';
    configuration: {,
        source: DataSource;
        destinations: DataDestination[];
        processing_stages: ProcessingStage[];
        batch_size: number;
        processing_interval_ms: number;
        retry_policy: RetryPolicy;
        error_handling: ErrorHandlingStrategy;
    };
    performance: {,
        target_throughput_records_per_second: number;
        target_latency_ms: number;
        max_memory_usage_mb: number;
        max_cpu_usage_percent: number;
        parallelization_factor: number;
        buffer_size_mb: number;
    };
    quality: {,
        data_validation_enabled: boolean;
        schema_enforcement: boolean;
        duplicate_detection: boolean;
        completeness_checks: boolean;
        freshness_requirements_minutes: number;
        quality_thresholds: QualityThresholds;
    };
    monitoring: {,
        metrics_collection_enabled: boolean;
        alerting_enabled: boolean;
        sampling_rate: number;
        detailed_logging: boolean;
        trace_processing: boolean;
    };
    status: {,
        state: 'running' | 'paused' | 'stopped' | 'error' | 'maintenance';
        last_execution: number;
        next_execution: number;
        records_processed_today: number;
        avg_processing_time_ms: number;
        current_throughput: number;
        health_score: number;
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;
}
export interface DataSource {
    id: string;
    name: string;
    type: 'database' | 'file_system' | 'api' | 'stream' | 'queue' | 'webhook' | 's3' | 'kafka';
    connection: {,
        endpoint: string;
        authentication: Record<string, string>;
        connection_pool_size: number;
        timeout_ms: number;
        retry_attempts: number;
    };
    data_format: 'json' | 'csv' | 'xml' | 'parquet' | 'avro' | 'binary' | 'log_format';
    schema_definition?: string;
    monitoring: {,
        availability_check_interval_ms: number;
        data_freshness_check_enabled: boolean;
        volume_monitoring_enabled: boolean;
        expected_volume_range: {,
            min: number;
            max: number;
        };
    };
}
export interface DataDestination {
    id: string;
    name: string;
    type: 'database' | 'file_system' | 'api' | 'stream' | 'queue' | 'webhook' | 's3' | 'elasticsearch' | 'data_warehouse';
    connection: {,
        endpoint: string;
        authentication: Record<string, string>;
        batch_size: number;
        flush_interval_ms: number;
        compression_enabled: boolean;
    };
    data_format: 'json' | 'csv' | 'xml' | 'parquet' | 'avro' | 'binary';
    partitioning_strategy?: PartitioningStrategy;
    monitoring: {,
        write_performance_tracking: boolean;
        storage_usage_monitoring: boolean;
        availability_monitoring: boolean;
    };
}
export interface ProcessingStage {
    id: string;
    name: string;
    description: string;
    stage_type: 'filter' | 'transform' | 'enrich' | 'validate' | 'aggregate' | 'normalize' | 'custom';
    configuration: {,
        processing_logic: string;
        input_schema?: string;
        output_schema?: string;
        transformation_rules: TransformationRule[];
        validation_rules: ValidationRule[];
    };
    performance: {,
        max_processing_time_ms: number;
        memory_limit_mb: number;
        parallel_execution: boolean;
        checkpoint_interval: number;
    };
    error_handling: {,
        continue_on_error: boolean;
        dead_letter_queue_enabled: boolean;
        max_retry_attempts: number;
        error_sampling_rate: number;
    };
    monitoring: {,
        execution_metrics: boolean;
        data_lineage_tracking: boolean;
        processing_time_tracking: boolean;
        output_validation: boolean;
    };
}
export interface TransformationRule {
    id: string;
    name: string;
    rule_type: 'field_mapping' | 'data_type_conversion' | 'format_standardization' | 'calculation' | 'lookup' | 'custom';
    source_field: string;
    target_field: string;
    transformation_logic: string;
    validation_criteria?: string;
    error_action: 'skip_record' | 'default_value' | 'fail_pipeline' | 'log_and_continue';
}
export interface ValidationRule {
    id: string;
    name: string;
    rule_type: 'required_field' | 'data_type' | 'format_pattern' | 'range_check' | 'uniqueness' | 'referential_integrity' | 'custom';
    field_name: string;
    validation_criteria: string;
    severity: 'warning' | 'error' | 'critical';
    action_on_failure: 'skip_record' | 'fail_pipeline' | 'quarantine' | 'log_and_continue';
}
export interface QualityThresholds {
    completeness_percent_min: number;
    accuracy_percent_min: number;
    consistency_percent_min: number;
    freshness_minutes_max: number;
    duplicate_percent_max: number;
    error_rate_percent_max: number;
}
export interface RetryPolicy {
    max_attempts: number;
    initial_delay_ms: number;
    max_delay_ms: number;
    backoff_multiplier: number;
    retry_on_errors: string[];
    dead_letter_queue_enabled: boolean;
}
export interface ErrorHandlingStrategy {
    strategy: 'fail_fast' | 'continue_on_error' | 'circuit_breaker' | 'dead_letter_queue';
    error_threshold_percent: number;
    recovery_strategy: 'manual' | 'auto_retry' | 'fallback_pipeline' | 'alert_and_pause';
    notification_settings: {,
        immediate_alerts: boolean;
        escalation_enabled: boolean;
        escalation_delay_minutes: number;
    };
}
export interface PartitioningStrategy {
    strategy: 'time_based' | 'hash_based' | 'range_based' | 'custom';
    partition_field: string;
    partition_count?: number;
    time_interval?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    custom_logic?: string;
}
export interface PipelineExecution {
    id: string;
    pipeline_id: string;
    execution_start: number;
    execution_end?: number;
    execution_duration_ms?: number;
    trigger: 'scheduled' | 'manual' | 'event_driven' | 'data_available';
    batch_id: string;
    records_input: number;
    records_output: number;
    records_filtered: number;
    records_failed: number;
    throughput_records_per_second: number;
    avg_record_processing_time_ms: number;
    memory_usage_peak_mb: number;
    cpu_usage_avg_percent: number;
    data_quality_score: number;
    completeness_percent: number;
    accuracy_percent: number;
    duplicate_rate_percent: number;
    error_rate_percent: number;
    stage_executions: StageExecution[];
    resource_usage: {,
        compute_time_seconds: number;
        memory_peak_mb: number;
        network_io_mb: number;
        storage_io_mb: number;
        cost_estimate: number;
    };
    status: 'running' | 'completed' | 'failed' | 'cancelled' | 'partially_completed';
    error_summary?: ExecutionError[];
    warnings: string[];
    executed_by: string;
}
export interface StageExecution {
    stage_id: string;
    stage_name: string;
    execution_start: number;
    execution_end: number;
    execution_duration_ms: number;
    records_input: number;
    records_output: number;
    records_filtered: number;
    records_failed: number;
    performance_metrics: {,
        processing_rate: number;
        memory_usage_mb: number;
        cpu_usage_percent: number;
    };
    quality_metrics: {,
        validation_pass_rate: number;
        transformation_success_rate: number;
        data_integrity_score: number;
    };
    status: 'completed' | 'failed' | 'skipped';
    errors: string[];
    warnings: string[];
}
export interface ExecutionError {
    error_type: string;
    error_message: string;
    stage_id?: string;
    record_id?: string;
    timestamp: number;
    severity: 'warning' | 'error' | 'critical';
    recovery_action?: string;
}
export interface PipelineAlert {
    id: string;
    pipeline_id: string;
    alert_type: 'performance_degradation' | 'quality_threshold_breach' | 'execution_failure' | 'resource_exhaustion' | 'data_freshness' | 'anomaly_detected';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    detected_at: number;
    context: {,
        execution_id?: string;
        stage_id?: string;
        metric_name?: string;
        current_value?: number;
        threshold_value?: number;
        measurement_unit?: string;
        impact_assessment: 'none' | 'low' | 'medium' | 'high' | 'critical';
    };
    resolution: {,
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        resolved: boolean;
        resolved_by?: string;
        resolved_at?: number;
        resolution_notes?: string;
        auto_resolved: boolean;
    };
    automated_actions: string[];
    recommended_actions: string[];
}
export interface PipelineOptimizationRecommendation {
    id: string;
    pipeline_id: string;
    recommendation_type: 'performance' | 'cost' | 'quality' | 'reliability' | 'scalability';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    impact: {,
        performance_improvement_percent?: number;
        cost_reduction_percent?: number;
        quality_improvement_percent?: number;
        reliability_improvement_percent?: number;
        implementation_effort: 'low' | 'medium' | 'high';
        risk_level: 'low' | 'medium' | 'high';
    };
    implementation: {,
        configuration_changes: Record<string, any>;
        code_changes_required: boolean;
        testing_requirements: string[];
        rollback_plan: string;
        estimated_implementation_hours: number;
    };
    validation: {,
        success_criteria: string[];
        measurement_method: string;
        validation_period_days: number;
        rollback_triggers: string[];
    };
    generated_at: number;
    status: 'pending' | 'approved' | 'implemented' | 'validated' | 'rejected';
    reviewed_by?: string;
    reviewed_at?: number;
    review_notes?: string;
}
export interface DataLineageRecord {
    id: string;
    pipeline_id: string;
    execution_id: string;
    record_id: string;
    source_system: string;
    source_record_id: string;
    source_timestamp: number;
    processing_history: Array<{,
        stage_id: string;
        stage_name: string;
        processed_at: number;
        transformations_applied: string[];
        validation_results: Record<string, boolean>;
    }>;
    current_location: string;
    current_format: string;
    last_modified: number;
    quality_scores: {,
        completeness: number;
        accuracy: number;
        consistency: number;
        timeliness: number;
    };
    dependent_records: string[];
    dependency_of_records: string[];
}
export declare class SecurityDataPipelineMonitor extends EventEmitter {
    private pipelines;
    private executions;
    private alerts;
    private recommendations;
    private lineageRecords;
    private executionIntervals;
    private monitoringIntervals;
    constructor();
    private initializeEventHandlers;
    registerPipeline(pipeline: Omit<DataPipeline, 'id' | 'created_at' | 'status'>): Promise<string>;
    updatePipeline(pipelineId: string, updates: Partial<DataPipeline>): Promise<void>;
    deletePipeline(pipelineId: string): Promise<void>;
    startPipeline(pipelineId: string, triggeredBy?: string): Promise<void>;
    stopPipeline(pipelineId: string): Promise<void>;
    pausePipeline(pipelineId: string): Promise<void>;
    private executePipeline;
    private loadDataFromSource;
    private executeStage;
    private stageOutputs;
    private storeStageOutput;
    private getStageOutput;
    private writeToDestinations;
    private calculateDataQualityScore;
    private calculateCompletenessPercent;
    private calculateAccuracyPercent;
    private calculateDuplicateRate;
    private calculatePipelineHealthScore;
    private startPipelineMonitoring;
    private stopPipelineMonitoring;
    private performPipelineHealthCheck;
    private generateAlert;
    private processAlert;
    private attemptPipelineRestart;
    private analyzeExecutionResults;
    private generateOptimizationRecommendations;
    getPipelineStatus(pipelineId?: string): any;
    getExecutionHistory(pipelineId: string, limit?: number): PipelineExecution[];
    getActiveAlerts(pipelineId?: string): PipelineAlert[];
    getOptimizationRecommendations();
      pipelineId: string,
      status?: PipelineOptimizationRecommendation['status']
    ): PipelineOptimizationRecommendation[];
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void>;
    resolveAlert(alertId: string, resolvedBy: string, notes?: string): Promise<void>;
    approveRecommendation(recommendationId: string, reviewedBy: string, notes?: string): Promise<void>;
    implementRecommendation(recommendationId: string): Promise<void>;
    private setNestedProperty;
    performMaintenance(): Promise<void>;
    shutdown(): Promise<void>;
}
export default SecurityDataPipelineMonitor;
//# sourceMappingURL=SecurityDataPipelineMonitor.d.ts.map