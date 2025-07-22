-- Migration: Add Backup Architecture Tables
-- Epic 19 - Security & Compliance Framework - Backup Architecture
-- Task: E17-1753114397264-407EE2

-- Backup jobs table - defines backup job configurations
CREATE TABLE IF NOT EXISTS backup_jobs (
    job_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES backup_policies(policy_id) ON DELETE RESTRICT,
    job_name VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Backup configuration
    backup_method VARCHAR(20) NOT NULL CHECK (backup_method IN (
        'full', 'incremental', 'differential', 'continuous', 'snapshot', 'logical', 'physical'
    )),
    source_configuration JSONB NOT NULL DEFAULT '{
        "database_name": null,
        "schema_names": [],
        "table_names": [],
        "include_patterns": ["*"],
        "exclude_patterns": [],
        "filter_conditions": {}
    }'::jsonb,
    
    -- Target configuration
    target_configuration JSONB NOT NULL DEFAULT '{
        "storage_provider": "local_filesystem",
        "storage_location": "/backups",
        "storage_tier": "hot",
        "backup_format": "native"
    }'::jsonb,
    
    -- Processing configuration
    processing_options JSONB NOT NULL DEFAULT '{
        "compression_algorithm": "gzip",
        "compression_level": 6,
        "encryption_algorithm": "aes256",
        "encryption_key_id": null,
        "chunk_size_mb": 100,
        "parallel_streams": 2,
        "checksum_algorithm": "sha256"
    }'::jsonb,
    
    -- Scheduling configuration
    schedule_configuration JSONB NOT NULL DEFAULT '{
        "is_scheduled": false,
        "schedule_expression": null,
        "timezone": "UTC",
        "max_concurrent_jobs": 1,
        "priority": "medium",
        "retry_policy": {
            "max_attempts": 3,
            "retry_delay_minutes": 15,
            "exponential_backoff": true
        }
    }'::jsonb,
    
    -- Retention configuration
    retention_configuration JSONB NOT NULL DEFAULT '{
        "retention_period": {"value": 30, "unit": "days"},
        "archive_after": {"value": 90, "unit": "days"},
        "delete_after": {"value": 365, "unit": "days"},
        "legal_hold": false
    }'::jsonb,
    
    -- Performance constraints
    resource_limits JSONB NOT NULL DEFAULT '{
        "max_memory_mb": null,
        "max_cpu_percentage": null,
        "max_io_ops_per_second": null,
        "network_bandwidth_limit_mbps": null
    }'::jsonb,
    
    -- Job metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL
);

-- Backup executions table - tracks backup job execution instances
CREATE TABLE IF NOT EXISTS backup_executions (
    execution_id VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL REFERENCES backup_jobs(job_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'queued', 'initializing', 'running', 'finalizing', 'completed', 
        'failed', 'cancelled', 'expired', 'archived'
    )) DEFAULT 'queued',
    
    -- Execution timing
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    current_phase VARCHAR(100),
    phase_progress JSONB DEFAULT '{}'::jsonb,
    
    -- Backup results
    backup_size_bytes BIGINT DEFAULT 0,
    compressed_size_bytes BIGINT DEFAULT 0,
    compression_ratio DECIMAL(5,2) DEFAULT 1.0,
    checksum_value VARCHAR(255),
    
    -- Performance metrics
    throughput_mbps DECIMAL(10,2) DEFAULT 0,
    cpu_usage_percentage DECIMAL(5,2) DEFAULT 0,
    memory_usage_mb INTEGER DEFAULT 0,
    io_operations_per_second INTEGER DEFAULT 0,
    
    -- Storage information
    storage_location VARCHAR(1000),
    storage_tier VARCHAR(20),
    storage_manifest JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    executed_by VARCHAR(255) NOT NULL,
    execution_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage tiers table - defines available storage tiers and their properties
CREATE TABLE IF NOT EXISTS backup_storage_tiers (
    tier_id VARCHAR(255) PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL UNIQUE,
    tier_type VARCHAR(20) NOT NULL CHECK (tier_type IN (
        'hot', 'warm', 'cold', 'glacier', 'deep_archive'
    )),
    
    -- Storage configuration
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN (
        'local_filesystem', 'network_attached', 'aws_s3', 'azure_blob', 'gcp_storage', 'custom_provider'
    )),
    storage_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Performance characteristics
    access_latency_ms INTEGER DEFAULT 0,
    throughput_mbps DECIMAL(10,2) DEFAULT 0,
    availability_percentage DECIMAL(5,2) DEFAULT 99.9,
    durability_percentage DECIMAL(10,9) DEFAULT 99.999999999,
    
    -- Cost information
    cost_per_gb_per_month DECIMAL(8,4) DEFAULT 0,
    retrieval_cost_per_gb DECIMAL(8,4) DEFAULT 0,
    api_cost_per_request DECIMAL(8,6) DEFAULT 0,
    
    -- Capabilities
    supports_encryption BOOLEAN DEFAULT TRUE,
    supports_compression BOOLEAN DEFAULT TRUE,
    supports_versioning BOOLEAN DEFAULT FALSE,
    supports_lifecycle BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    minimum_storage_duration_days INTEGER DEFAULT 0,
    maximum_object_size_gb INTEGER,
    
    -- Tier metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Backup manifests table - detailed inventory of backup contents
CREATE TABLE IF NOT EXISTS backup_manifests (
    manifest_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_executions(execution_id) ON DELETE CASCADE,
    manifest_version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Backup content inventory
    total_objects BIGINT DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    object_inventory JSONB DEFAULT '[]'::jsonb,
    
    -- Schema information
    schema_version VARCHAR(100),
    schema_changes JSONB DEFAULT '[]'::jsonb,
    compatibility_info JSONB DEFAULT '{}'::jsonb,
    
    -- Integrity verification
    manifest_checksum VARCHAR(255),
    verification_method VARCHAR(20) DEFAULT 'sha256',
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Recovery metadata
    recovery_instructions JSONB DEFAULT '{}'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Storage migrations table - tracks data movement between storage tiers
CREATE TABLE IF NOT EXISTS backup_storage_migrations (
    migration_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_executions(execution_id) ON DELETE CASCADE,
    migration_type VARCHAR(20) NOT NULL CHECK (migration_type IN (
        'tier_promotion', 'tier_demotion', 'provider_migration', 'geographic_replication'
    )),
    
    -- Migration details
    source_tier_id VARCHAR(255) REFERENCES backup_storage_tiers(tier_id),
    target_tier_id VARCHAR(255) REFERENCES backup_storage_tiers(tier_id),
    source_location VARCHAR(1000),
    target_location VARCHAR(1000),
    
    -- Migration status
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending', 'in_progress', 'completed', 'failed', 'cancelled'
    )) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- Migration metrics
    data_size_bytes BIGINT DEFAULT 0,
    transfer_rate_mbps DECIMAL(10,2) DEFAULT 0,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Cost tracking
    migration_cost DECIMAL(10,4) DEFAULT 0,
    cost_savings_per_month DECIMAL(10,4) DEFAULT 0,
    
    -- Migration metadata
    migration_reason TEXT,
    triggered_by VARCHAR(20) CHECK (triggered_by IN ('policy', 'manual', 'cost_optimization', 'lifecycle')),
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Backup architecture metrics table - performance and utilization metrics
CREATE TABLE IF NOT EXISTS backup_architecture_metrics (
    metric_id VARCHAR(255) PRIMARY KEY,
    metric_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    metric_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Job execution metrics
    total_jobs_executed INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    cancelled_executions INTEGER DEFAULT 0,
    average_execution_time_minutes DECIMAL(10,2) DEFAULT 0,
    
    -- Data volume metrics
    total_data_backed_up_gb DECIMAL(15,2) DEFAULT 0,
    total_compressed_size_gb DECIMAL(15,2) DEFAULT 0,
    average_compression_ratio DECIMAL(5,2) DEFAULT 1.0,
    deduplication_savings_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    average_throughput_mbps DECIMAL(10,2) DEFAULT 0,
    peak_throughput_mbps DECIMAL(10,2) DEFAULT 0,
    average_cpu_utilization DECIMAL(5,2) DEFAULT 0,
    average_memory_utilization_gb DECIMAL(8,2) DEFAULT 0,
    
    -- Storage tier utilization
    storage_tier_distribution JSONB DEFAULT '{}'::jsonb,
    storage_costs JSONB DEFAULT '{
        "hot_tier_cost": 0,
        "warm_tier_cost": 0,
        "cold_tier_cost": 0,
        "glacier_tier_cost": 0,
        "deep_archive_tier_cost": 0,
        "total_monthly_cost": 0
    }'::jsonb,
    
    -- Quality metrics
    data_integrity_score DECIMAL(5,2) DEFAULT 100,
    backup_success_rate DECIMAL(5,2) DEFAULT 100,
    recovery_point_objective_compliance DECIMAL(5,2) DEFAULT 100,
    recovery_time_objective_compliance DECIMAL(5,2) DEFAULT 100,
    
    -- Efficiency metrics
    resource_efficiency_score DECIMAL(5,2) DEFAULT 100,
    cost_efficiency_score DECIMAL(5,2) DEFAULT 100,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by VARCHAR(255) DEFAULT 'system'
);

-- Backup retention tracking table - tracks backup lifecycle and retention
CREATE TABLE IF NOT EXISTS backup_retention_tracking (
    tracking_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_executions(execution_id) ON DELETE CASCADE,
    
    -- Retention status
    retention_status VARCHAR(20) NOT NULL CHECK (retention_status IN (
        'active', 'eligible_for_archive', 'archived', 'eligible_for_deletion', 'deleted', 'legal_hold'
    )) DEFAULT 'active',
    
    -- Retention dates
    backup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    archive_eligible_date TIMESTAMP WITH TIME ZONE,
    deletion_eligible_date TIMESTAMP WITH TIME ZONE,
    actual_archived_date TIMESTAMP WITH TIME ZONE,
    actual_deleted_date TIMESTAMP WITH TIME ZONE,
    
    -- Legal hold information
    legal_hold_active BOOLEAN DEFAULT FALSE,
    legal_hold_reason TEXT,
    legal_hold_case_id VARCHAR(255),
    legal_hold_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance tracking
    compliance_frameworks JSONB DEFAULT '[]'::jsonb,
    compliance_requirements JSONB DEFAULT '{}'::jsonb,
    compliance_status VARCHAR(20) DEFAULT 'compliant',
    
    -- Last action tracking
    last_access_date TIMESTAMP WITH TIME ZONE,
    last_verification_date TIMESTAMP WITH TIME ZONE,
    next_verification_due TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backup errors table - detailed error tracking
CREATE TABLE IF NOT EXISTS backup_execution_errors (
    error_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_executions(execution_id) ON DELETE CASCADE,
    error_type VARCHAR(20) NOT NULL CHECK (error_type IN (
        'configuration', 'storage', 'network', 'resource', 'permission', 'data_corruption'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    error_code VARCHAR(50),
    error_message TEXT NOT NULL,
    error_context JSONB DEFAULT '{}'::jsonb,
    stack_trace TEXT,
    suggested_resolution TEXT,
    is_recoverable BOOLEAN DEFAULT TRUE,
    recovery_attempted BOOLEAN DEFAULT FALSE,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backup warnings table - non-critical issues
CREATE TABLE IF NOT EXISTS backup_execution_warnings (
    warning_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES backup_executions(execution_id) ON DELETE CASCADE,
    warning_type VARCHAR(20) NOT NULL CHECK (warning_type IN (
        'performance', 'capacity', 'configuration', 'compatibility'
    )),
    warning_message TEXT NOT NULL,
    warning_context JSONB DEFAULT '{}'::jsonb,
    impact_assessment VARCHAR(20) NOT NULL CHECK (impact_assessment IN ('low', 'medium', 'high')),
    recommendation TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_backup_jobs_policy_id ON backup_jobs(policy_id);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_active ON backup_jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_backup_jobs_created_by ON backup_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_backup_method ON backup_jobs(backup_method);

CREATE INDEX IF NOT EXISTS idx_backup_executions_job_id ON backup_executions(job_id);
CREATE INDEX IF NOT EXISTS idx_backup_executions_status ON backup_executions(status);
CREATE INDEX IF NOT EXISTS idx_backup_executions_executed_by ON backup_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_backup_executions_started_at ON backup_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_backup_executions_progress ON backup_executions(progress_percentage);

CREATE INDEX IF NOT EXISTS idx_storage_tiers_type ON backup_storage_tiers(tier_type);
CREATE INDEX IF NOT EXISTS idx_storage_tiers_provider ON backup_storage_tiers(provider_type);
CREATE INDEX IF NOT EXISTS idx_storage_tiers_active ON backup_storage_tiers(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_backup_manifests_execution_id ON backup_manifests(execution_id);
CREATE INDEX IF NOT EXISTS idx_backup_manifests_verified ON backup_manifests(is_verified);

CREATE INDEX IF NOT EXISTS idx_storage_migrations_execution_id ON backup_storage_migrations(execution_id);
CREATE INDEX IF NOT EXISTS idx_storage_migrations_status ON backup_storage_migrations(status);
CREATE INDEX IF NOT EXISTS idx_storage_migrations_scheduled_at ON backup_storage_migrations(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_architecture_metrics_timestamp ON backup_architecture_metrics(metric_timestamp);
CREATE INDEX IF NOT EXISTS idx_architecture_metrics_period ON backup_architecture_metrics(metric_period_start, metric_period_end);

CREATE INDEX IF NOT EXISTS idx_retention_tracking_execution_id ON backup_retention_tracking(execution_id);
CREATE INDEX IF NOT EXISTS idx_retention_tracking_status ON backup_retention_tracking(retention_status);
CREATE INDEX IF NOT EXISTS idx_retention_tracking_archive_eligible ON backup_retention_tracking(archive_eligible_date);
CREATE INDEX IF NOT EXISTS idx_retention_tracking_deletion_eligible ON backup_retention_tracking(deletion_eligible_date);
CREATE INDEX IF NOT EXISTS idx_retention_tracking_legal_hold ON backup_retention_tracking(legal_hold_active) WHERE legal_hold_active = true;

CREATE INDEX IF NOT EXISTS idx_backup_errors_execution_id ON backup_execution_errors(execution_id);
CREATE INDEX IF NOT EXISTS idx_backup_errors_type ON backup_execution_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_backup_errors_severity ON backup_execution_errors(severity);
CREATE INDEX IF NOT EXISTS idx_backup_errors_occurred_at ON backup_execution_errors(occurred_at);

CREATE INDEX IF NOT EXISTS idx_backup_warnings_execution_id ON backup_execution_warnings(execution_id);
CREATE INDEX IF NOT EXISTS idx_backup_warnings_type ON backup_execution_warnings(warning_type);
CREATE INDEX IF NOT EXISTS idx_backup_warnings_impact ON backup_execution_warnings(impact_assessment);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_backup_architecture_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_jobs_updated_at 
    BEFORE UPDATE ON backup_jobs 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_backup_architecture_updated_at_column();

CREATE TRIGGER update_backup_executions_updated_at 
    BEFORE UPDATE ON backup_executions 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_backup_architecture_updated_at_column();

CREATE TRIGGER update_storage_tiers_updated_at 
    BEFORE UPDATE ON backup_storage_tiers 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_backup_architecture_updated_at_column();

CREATE TRIGGER update_retention_tracking_updated_at 
    BEFORE UPDATE ON backup_retention_tracking 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_backup_architecture_updated_at_column();

-- Trigger to update execution timing when status changes
CREATE OR REPLACE FUNCTION update_backup_execution_timing()
RETURNS TRIGGER AS $$
BEGIN
    -- Set started_at when moving from queued to active status
    IF OLD.status = 'queued' AND NEW.status IN ('initializing', 'running') THEN
        NEW.started_at = NOW();
    END IF;
    
    -- Set completed_at and calculate duration when reaching terminal status
    IF OLD.status NOT IN ('completed', 'failed', 'cancelled', 'expired', 'archived') 
       AND NEW.status IN ('completed', 'failed', 'cancelled', 'expired', 'archived') THEN
        NEW.completed_at = NOW();
        IF NEW.started_at IS NOT NULL THEN
            NEW.duration_seconds = EXTRACT(EPOCH FROM (NOW() - NEW.started_at));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_execution_timing_trigger
    BEFORE UPDATE ON backup_executions
    FOR EACH ROW
    EXECUTE PROCEDURE update_backup_execution_timing();

-- Trigger to create manifest when execution completes successfully
CREATE OR REPLACE FUNCTION create_backup_manifest()
RETURNS TRIGGER AS $$
DECLARE
    manifest_id_val VARCHAR(255);
BEGIN
    -- Create manifest when backup completes successfully
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        manifest_id_val = 'manifest-' || NEW.execution_id;
        
        INSERT INTO backup_manifests (
            manifest_id,
            execution_id,
            total_size_bytes,
            manifest_checksum,
            is_verified
        ) VALUES (
            manifest_id_val,
            NEW.execution_id,
            NEW.backup_size_bytes,
            NEW.checksum_value,
            CASE WHEN NEW.checksum_value IS NOT NULL THEN TRUE ELSE FALSE END
        );
        
        -- Create retention tracking record
        INSERT INTO backup_retention_tracking (
            tracking_id,
            execution_id,
            backup_date,
            archive_eligible_date,
            deletion_eligible_date
        ) VALUES (
            'retention-' || NEW.execution_id,
            NEW.execution_id,
            NEW.started_at,
            NEW.started_at + INTERVAL '90 days', -- Default archive after 90 days
            NEW.started_at + INTERVAL '365 days' -- Default delete after 1 year
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_backup_manifest_trigger
    AFTER UPDATE ON backup_executions
    FOR EACH ROW
    EXECUTE PROCEDURE create_backup_manifest();

-- Views for common queries and dashboards
CREATE OR REPLACE VIEW active_backup_jobs AS
SELECT 
    bj.*,
    bp.name as policy_name,
    bp.priority as policy_priority,
    COUNT(be.execution_id) as total_executions,
    COUNT(be.execution_id) FILTER (WHERE be.status = 'completed') as successful_executions,
    COUNT(be.execution_id) FILTER (WHERE be.status = 'failed') as failed_executions,
    MAX(be.started_at) as last_execution,
    AVG(be.duration_seconds) as avg_duration_seconds,
    SUM(be.backup_size_bytes) as total_backup_size_bytes
FROM backup_jobs bj
JOIN backup_policies bp ON bj.policy_id = bp.policy_id
LEFT JOIN backup_executions be ON bj.job_id = be.job_id
    AND be.started_at >= NOW() - INTERVAL '30 days'
WHERE bj.is_active = true
GROUP BY bj.job_id, bj.policy_id, bj.job_name, bj.description, bj.backup_method,
         bj.source_configuration, bj.target_configuration, bj.processing_options,
         bj.schedule_configuration, bj.retention_configuration, bj.resource_limits,
         bj.is_active, bj.created_at, bj.updated_at, bj.created_by, bj.updated_by,
         bp.name, bp.priority;

CREATE OR REPLACE VIEW backup_execution_summary AS
SELECT 
    DATE_TRUNC('day', be.started_at) as execution_date,
    bj.backup_method,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE be.status = 'completed') as successful_executions,
    COUNT(*) FILTER (WHERE be.status = 'failed') as failed_executions,
    AVG(be.duration_seconds) / 60 as avg_duration_minutes,
    AVG(be.throughput_mbps) as avg_throughput_mbps,
    SUM(be.backup_size_bytes) / (1024*1024*1024) as total_backup_size_gb,
    AVG(be.compression_ratio) as avg_compression_ratio,
    COUNT(bee.error_id) as total_errors,
    COUNT(bew.warning_id) as total_warnings
FROM backup_executions be
JOIN backup_jobs bj ON be.job_id = bj.job_id
LEFT JOIN backup_execution_errors bee ON be.execution_id = bee.execution_id
LEFT JOIN backup_execution_warnings bew ON be.execution_id = bew.execution_id
WHERE be.started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', be.started_at), bj.backup_method
ORDER BY execution_date DESC;

CREATE OR REPLACE VIEW storage_tier_utilization AS
SELECT 
    bst.tier_name,
    bst.tier_type,
    bst.provider_type,
    COUNT(be.execution_id) as backup_count,
    SUM(be.backup_size_bytes) / (1024*1024*1024) as total_size_gb,
    AVG(be.backup_size_bytes) / (1024*1024*1024) as avg_backup_size_gb,
    SUM(be.backup_size_bytes * bst.cost_per_gb_per_month / (1024*1024*1024)) as estimated_monthly_cost,
    COUNT(bsm.migration_id) as pending_migrations
FROM backup_storage_tiers bst
LEFT JOIN backup_executions be ON be.storage_tier = bst.tier_type
    AND be.started_at >= NOW() - INTERVAL '30 days'
LEFT JOIN backup_storage_migrations bsm ON bst.tier_id = bsm.target_tier_id
    AND bsm.status = 'pending'
WHERE bst.is_active = true
GROUP BY bst.tier_id, bst.tier_name, bst.tier_type, bst.provider_type, bst.cost_per_gb_per_month
ORDER BY total_size_gb DESC;

CREATE OR REPLACE VIEW backup_retention_status AS
SELECT 
    brt.retention_status,
    COUNT(*) as backup_count,
    SUM(be.backup_size_bytes) / (1024*1024*1024) as total_size_gb,
    COUNT(*) FILTER (WHERE brt.legal_hold_active = true) as legal_hold_count,
    COUNT(*) FILTER (WHERE brt.archive_eligible_date <= NOW()) as eligible_for_archive,
    COUNT(*) FILTER (WHERE brt.deletion_eligible_date <= NOW() AND brt.legal_hold_active = false) as eligible_for_deletion,
    MIN(brt.backup_date) as oldest_backup,
    MAX(brt.backup_date) as newest_backup
FROM backup_retention_tracking brt
JOIN backup_executions be ON brt.execution_id = be.execution_id
GROUP BY brt.retention_status
ORDER BY backup_count DESC;

-- Insert default storage tiers
INSERT INTO backup_storage_tiers (
    tier_id, tier_name, tier_type, provider_type, storage_configuration,
    access_latency_ms, throughput_mbps, availability_percentage, durability_percentage,
    cost_per_gb_per_month, created_by
) VALUES 
(
    'local-hot-tier',
    'Local Hot Storage',
    'hot',
    'local_filesystem',
    '{"base_path": "/backups/hot", "compression": "gzip", "encryption": "aes256"}'::jsonb,
    10, 1000.0, 99.9, 99.999999999,
    0.10, 'system'
),
(
    'local-warm-tier',
    'Local Warm Storage',
    'warm',
    'network_attached',
    '{"base_path": "/backups/warm", "compression": "zstd", "encryption": "aes256"}'::jsonb,
    100, 500.0, 99.5, 99.999999999,
    0.05, 'system'
),
(
    'cloud-cold-tier',
    'Cloud Cold Storage',
    'cold',
    'aws_s3',
    '{"bucket": "backup-cold", "storage_class": "STANDARD_IA", "encryption": "AES256"}'::jsonb,
    1000, 100.0, 99.9, 99.999999999,
    0.0125, 'system'
),
(
    'cloud-glacier-tier',
    'Cloud Glacier Storage',
    'glacier',
    'aws_s3',
    '{"bucket": "backup-glacier", "storage_class": "GLACIER", "encryption": "AES256"}'::jsonb,
    21600000, 5.0, 99.99, 99.999999999,
    0.004, 'system'
),
(
    'cloud-deep-archive-tier',
    'Cloud Deep Archive Storage',
    'deep_archive',
    'aws_s3',
    '{"bucket": "backup-deep-archive", "storage_class": "DEEP_ARCHIVE", "encryption": "AES256"}'::jsonb,
    43200000, 1.0, 99.99, 99.999999999,
    0.00099, 'system'
) ON CONFLICT (tier_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE backup_jobs IS 'Backup job configurations orchestrated by the backup architecture';
COMMENT ON TABLE backup_executions IS 'Individual backup job execution instances with detailed progress tracking';
COMMENT ON TABLE backup_storage_tiers IS 'Available storage tiers with performance and cost characteristics';
COMMENT ON TABLE backup_manifests IS 'Detailed inventory of backup contents for recovery operations';
COMMENT ON TABLE backup_storage_migrations IS 'Data movement operations between storage tiers';
COMMENT ON TABLE backup_architecture_metrics IS 'Aggregated performance and utilization metrics for the backup infrastructure';
COMMENT ON TABLE backup_retention_tracking IS 'Backup lifecycle management and retention compliance tracking';
COMMENT ON TABLE backup_execution_errors IS 'Detailed error tracking for backup operations';
COMMENT ON TABLE backup_execution_warnings IS 'Non-critical issues and recommendations for backup operations';

COMMENT ON VIEW active_backup_jobs IS 'Currently active backup jobs with execution statistics';
COMMENT ON VIEW backup_execution_summary IS 'Daily execution summary with performance metrics';
COMMENT ON VIEW storage_tier_utilization IS 'Storage tier usage and cost analysis';
COMMENT ON VIEW backup_retention_status IS 'Backup retention compliance and lifecycle status';