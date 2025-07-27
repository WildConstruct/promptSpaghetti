/**
 * Security Data Partitioning and Archival Automation System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263631-9CC870
 *
 * Intelligent data partitioning and automated archival for security analytics,
 * ensuring optimal performance, compliance, and cost-effective long-term storage.
 */
import { EventEmitter } from 'events';
export interface DataPartitionConfig {
    id: string;
    name: string;
    description: string;
    data_type: 'security_events' | 'audit_logs' | 'threat_intelligence' | 'compliance_data' | 'user_activity' | 'system_logs' | 'alert_history';
    partitioning: {
        strategy: 'time_based' | 'size_based' | 'content_based' | 'hybrid';
        time_based?: {
            interval: 'hourly' | 'daily' | 'weekly' | 'monthly';
            retention_policy: RetentionPolicy;
            timezone: string;
        };
        size_based?: {
            max_partition_size_gb: number;
            target_partition_size_gb: number;
            auto_split_threshold: number;
        };
        content_based?: {
            partition_field: string;
            partition_values: string[];
            dynamic_partitioning: boolean;
        };
        hybrid?: {
            primary_strategy: 'time_based' | 'size_based';
            secondary_strategy: 'content_based';
            partition_thresholds: Record<string, number>;
        };
    };
    storage: {
        hot_storage: StorageTier;
        warm_storage: StorageTier;
        cold_storage: StorageTier;
        archive_storage: StorageTier;
        compression_enabled: boolean;
        encryption_enabled: boolean;
        replication_factor: number;
    };
    indexing: {
        primary_indices: string[];
        secondary_indices: string[];
        bloom_filters: boolean;
        index_compression: boolean;
        query_optimization: boolean;
    };
    lifecycle: {
        hot_duration_days: number;
        warm_duration_days: number;
        cold_duration_days: number;
        archive_duration_years: number;
        deletion_after_years?: number;
        auto_transition: boolean;
    };
    compliance: {
        data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
        regulatory_requirements: string[];
        retention_legal_hold: boolean;
        audit_trail_required: boolean;
        immutable_storage: boolean;
        geographic_restrictions: string[];
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;
}
export interface RetentionPolicy {
    id: string;
    name: string;
    description: string;
    rules: Array<{
        condition: string;
        retention_days: number;
        action: 'archive' | 'delete' | 'move_to_cold' | 'compress';
        priority: number;
    }>;
    compliance_overrides: Array<{
        regulation: string;
        min_retention_days: number;
        max_retention_days?: number;
        special_handling: string[];
    }>;
    exceptions: Array<{
        condition: string;
        retention_extension_days: number;
        reason: string;
        approval_required: boolean;
    }>;
    created_at: number;
    enabled: boolean;
}
export interface StorageTier {
    tier_name: 'hot' | 'warm' | 'cold' | 'archive';
    storage_class: string;
    availability: 'immediate' | 'minutes' | 'hours' | 'days';
    cost_per_gb_month: number;
    retrieval_cost_per_gb: number;
    minimum_storage_duration_days: number;
    durability: number;
    geographic_regions: string[];
}
export interface ArchivalJob {
    id: string;
    name: string;
    description: string;
    partition_config_id: string;
    config: {
        source_location: string;
        target_location: string;
        batch_size: number;
        max_concurrent_operations: number;
        retry_attempts: number;
        timeout_minutes: number;
    };
    schedule: {
        type: 'manual' | 'scheduled' | 'event_triggered';
        cron_expression?: string;
        trigger_events?: string[];
        dependencies?: string[];
    };
    processing: {
        validate_data_integrity: boolean;
        create_checksums: boolean;
        compress_data: boolean;
        encrypt_data: boolean;
        deduplicate: boolean;
        index_data: boolean;
    };
    monitoring: {
        progress_reporting: boolean;
        error_threshold: number;
        alert_on_failure: boolean;
        notification_recipients: string[];
        metrics_collection: boolean;
    };
    execution: {
        last_run?: number;
        next_scheduled_run?: number;
        total_runs: number;
        successful_runs: number;
        failed_runs: number;
        average_duration_minutes: number;
        total_data_archived_gb: number;
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    enabled: boolean;
}
export interface ArchivalExecution {
    id: string;
    job_id: string;
    execution_type: 'manual' | 'scheduled' | 'triggered';
    start_time: number;
    end_time?: number;
    duration_minutes?: number;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
    statistics: {
        records_processed: number;
        records_archived: number;
        records_failed: number;
        data_volume_gb: number;
        compression_ratio: number;
        dedupe_savings_percentage: number;
    };
    performance: {
        throughput_records_per_second: number;
        throughput_gb_per_hour: number;
        cpu_utilization_percentage: number;
        memory_utilization_percentage: number;
        network_utilization_mbps: number;
        storage_io_operations: number;
    };
    errors: Array<{
        timestamp: number;
        error_type: string;
        error_message: string;
        record_id?: string;
        retry_count: number;
        resolution: string;
    }>;
    quality_checks: Array<{
        check_name: string;
        check_type: 'integrity' | 'completeness' | 'format' | 'compliance';
        result: 'passed' | 'failed' | 'warning';
        details: string;
        timestamp: number;
    }>;
    results: {
        output_locations: string[];
        manifest_files: string[];
        checksum_files: string[];
        index_files: string[];
        metadata_files: string[];
    };
    triggered_by: string;
    created_at: number;
}
export interface DataRetrievalRequest {
    id: string;
    requester: string;
    request_type: 'search' | 'restore' | 'export' | 'compliance_audit';
    criteria: {
        data_types: string[];
        time_range: {
            start: number;
            end: number;
        };
        filters: Record<string, any>;
        search_query?: string;
        partition_ids?: string[];
    };
    options: {
        output_format: 'json' | 'csv' | 'parquet' | 'avro' | 'native';
        compression: 'none' | 'gzip' | 'lz4' | 'snappy';
        encryption: boolean;
        include_metadata: boolean;
        max_results: number;
        timeout_minutes: number;
    };
    justification: {
        business_purpose: string;
        legal_basis?: string;
        compliance_requirement?: string;
        urgency: 'low' | 'medium' | 'high' | 'critical';
        estimated_cost: number;
    };
    approval: {
        required: boolean;
        approvers: string[];
        approved_by?: string;
        approved_at?: number;
        approval_notes?: string;
    };
    execution: {
        status: 'pending_approval' | 'approved' | 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
        started_at?: number;
        completed_at?: number;
        estimated_completion?: number;
        progress_percentage: number;
    };
    cost_tracking: {
        estimated_cost: number;
        actual_cost?: number;
        cost_breakdown: {
            retrieval_cost: number;
            processing_cost: number;
            storage_cost: number;
            network_cost: number;
        };
    };
    results?: {
        records_retrieved: number;
        data_volume_gb: number;
        output_files: string[];
        download_urls: string[];
        expiry_date: number;
    };
    created_at: number;
    last_updated: number;
}
export interface PartitionMetrics {
    id: string;
    partition_config_id: string;
    collection_period: {
        start: number;
        end: number;
    };
    storage: {
        total_partitions: number;
        hot_storage_gb: number;
        warm_storage_gb: number;
        cold_storage_gb: number;
        archive_storage_gb: number;
        compression_ratio: number;
        deduplication_ratio: number;
    };
    performance: {
        write_throughput_records_per_second: number;
        read_throughput_records_per_second: number;
        query_response_time_p95_ms: number;
        index_efficiency_percentage: number;
        cache_hit_ratio: number;
    };
    operations: {
        partitions_created: number;
        partitions_archived: number;
        partitions_deleted: number;
        failed_operations: number;
        maintenance_operations: number;
    };
    costs: {
        storage_cost_hot: number;
        storage_cost_warm: number;
        storage_cost_cold: number;
        storage_cost_archive: number;
        retrieval_costs: number;
        processing_costs: number;
        total_monthly_cost: number;
    };
    quality: {
        data_integrity_score: number;
        completeness_percentage: number;
        availability_percentage: number;
        compliance_score: number;
    };
    collected_at: number;
}
export interface ArchivalEvent {
    id: string;
    type: 'partition_created' | 'archival_completed' | 'retrieval_requested' | 'compliance_audit' | 'error_occurred' | 'maintenance_scheduled';
    severity: 'info' | 'warning' | 'error' | 'critical';
    source: string;
    timestamp: number;
    title: string;
    description: string;
    partition_config_id?: string;
    job_id?: string;
    execution_id?: string;
    data_impact: {
        records_affected: number;
        data_volume_gb: number;
        partitions_affected: string[];
        estimated_recovery_time?: number;
    };
    context: {
        triggered_by: string;
        related_events: string[];
        system_state: Record<string, any>;
        performance_metrics: Record<string, number>;
    };
    response: {
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        actions_taken: string[];
        resolution_notes?: string;
        resolved_at?: number;
    };
    follow_up: {
        monitoring_required: boolean;
        escalation_required: boolean;
        compliance_reporting_required: boolean;
        review_date?: number;
    };
}
export declare class SecurityDataArchiver extends EventEmitter {
    private partitionConfigs;
    private retentionPolicies;
    private archivalJobs;
    private executions;
    private retrievalRequests;
    private metrics;
    private events;
    private activeExecutions;
    private scheduledJobs;
    private metricsCollectionInterval?;
    private maintenanceInterval?;
    private complianceCheckInterval?;
    private costOptimizationInterval?;
    constructor();
    createPartitionConfig(config: Omit<DataPartitionConfig, 'id' | 'created_at' | 'last_updated'>): Promise<string>;
    createRetentionPolicy(policy: Omit<RetentionPolicy, 'id' | 'created_at'>): Promise<string>;
    createArchivalJob(job: Omit<ArchivalJob, 'id' | 'created_at' | 'last_updated' | 'execution'>): Promise<string>;
    executeArchivalJob(jobId: string, triggeredBy?: string): Promise<string>;
    private performArchivalExecution;
    private executeArchivalPhase;
    private discoverAndValidateData;
    private processAndTransformData;
    private archiveAndStoreData;
    private verifyDataIntegrity;
    private cleanupAndFinalize;
    createRetrievalRequest(request: Omit<DataRetrievalRequest, 'id' | 'created_at' | 'last_updated' | 'execution' | 'cost_tracking'>): Promise<string>;
    approveRetrievalRequest(requestId: string, approver: string, notes?: string): Promise<void>;
    private queueRetrievalRequest;
    private processRetrievalRequest;
    collectPartitionMetrics(configId: string): Promise<string>;
    private sendExecutionNotification;
    private createExecutionNotificationMessage;
    private sendApprovalRequest;
    private createApprovalRequestMessage;
    private sendRetrievalCompletionNotification;
    getSystemStatus(): {
        partition_configs: number;
        active_jobs: number;
        running_executions: number;
        pending_retrievals: number;
        total_archived_data_gb: number;
        system_health_score: number;
        recent_events: ArchivalEvent[];
    };
    private createDefaultArchivalJobs;
    private scheduleJob;
    private scheduleNextJobRun;
    private parseNextCronExecution;
    private initializeDefaultConfigurations;
    private startMetricsCollection;
    private startMaintenanceScheduler;
    private startComplianceMonitoring;
    private startCostOptimization;
    private performSystemMaintenance;
    private performComplianceChecks;
    private performCostOptimization;
    getPartitionConfigs(): DataPartitionConfig[];
    getArchivalJobs(): ArchivalJob[];
    getExecutions(): ArchivalExecution[];
    getRetrievalRequests(): DataRetrievalRequest[];
    getEvents(): ArchivalEvent[];
    exportConfiguration(): Promise<string>;
    importConfiguration(configJson: string): Promise<void>;
    shutdown(): void;
}
export default SecurityDataArchiver;
//# sourceMappingURL=SecurityDataArchiver.d.ts.map