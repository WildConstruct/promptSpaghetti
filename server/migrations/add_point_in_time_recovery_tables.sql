-- Migration: Add Point-in-Time Recovery Tables
-- Epic 19 - Security & Compliance Framework - Data Protection & Privacy Controls
-- Task: E17-1753114397286-361F45

-- Recovery points table - stores backup/recovery point metadata
CREATE TABLE IF NOT EXISTS recovery_points (
    recovery_point_id VARCHAR(255) PRIMARY KEY,
    config_id VARCHAR(255) NOT NULL, -- Will add FK after creating configurations table
    name VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'scheduled', 'transaction', 'manual', 'compliance', 'incident'
    )),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'creating', 'available', 'restoring', 'expired', 'archived', 'failed'
    )) DEFAULT 'creating',
    
    -- Timing and metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    point_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    
    -- Technical details
    database_version VARCHAR(50) NOT NULL,
    schema_version VARCHAR(50) NOT NULL,
    backup_size_bytes BIGINT DEFAULT 0,
    compression_ratio DECIMAL(5,2) DEFAULT 1.0,
    checksum VARCHAR(255),
    
    -- Scope and content
    included_tables JSONB DEFAULT '[]'::jsonb,
    excluded_tables JSONB DEFAULT '[]'::jsonb,
    record_count BIGINT DEFAULT 0,
    affected_schemas JSONB DEFAULT '[]'::jsonb,
    
    -- Storage and location
    storage_location TEXT NOT NULL,
    storage_provider VARCHAR(20) NOT NULL CHECK (storage_provider IN (
        'local', 'aws_s3', 'gcp_storage', 'azure_blob'
    )) DEFAULT 'local',
    encryption_key_id VARCHAR(255),
    backup_method VARCHAR(20) NOT NULL CHECK (backup_method IN (
        'full', 'incremental', 'differential'
    )) DEFAULT 'full',
    parent_recovery_point_id VARCHAR(255), -- For incremental backups
    
    -- Validation and integrity
    validation_status VARCHAR(20) NOT NULL CHECK (validation_status IN (
        'pending', 'valid', 'invalid', 'corrupted'
    )) DEFAULT 'pending',
    validation_details JSONB,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance and audit
    compliance_tags JSONB DEFAULT '[]'::jsonb,
    legal_hold BOOLEAN DEFAULT FALSE,
    retention_reason TEXT NOT NULL,
    
    -- Usage tracking
    restore_count INTEGER DEFAULT 0,
    last_restored_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (parent_recovery_point_id) REFERENCES recovery_points(recovery_point_id)
);

-- Recovery configurations table - defines backup policies and settings
CREATE TABLE IF NOT EXISTS recovery_configurations (
    config_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    
    -- Scheduling
    schedule_enabled BOOLEAN DEFAULT FALSE,
    schedule_cron VARCHAR(100), -- Cron expression for scheduling
    schedule_timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Retention policies
    retention_days INTEGER NOT NULL DEFAULT 30,
    max_recovery_points INTEGER DEFAULT 10,
    auto_cleanup_enabled BOOLEAN DEFAULT TRUE,
    compliance_retention_days INTEGER, -- Extended retention for compliance
    
    -- Backup configuration
    backup_scope JSONB NOT NULL DEFAULT '{
        "include_tables": ["*"],
        "exclude_tables": [],
        "include_schemas": ["public"],
        "exclude_schemas": [],
        "include_system_data": false,
        "include_audit_logs": true
    }'::jsonb,
    
    -- Storage configuration
    storage_config JSONB NOT NULL DEFAULT '{
        "provider": "local",
        "location": "/data/backups",
        "encryption_enabled": true,
        "compression_enabled": true,
        "compression_level": 6
    }'::jsonb,
    
    -- Validation settings
    validation_config JSONB NOT NULL DEFAULT '{
        "immediate_validation": true,
        "periodic_validation_days": 7,
        "integrity_check_enabled": true,
        "restore_test_enabled": false,
        "restore_test_frequency_days": 30
    }'::jsonb,
    
    -- Compliance settings
    compliance_config JSONB NOT NULL DEFAULT '{
        "compliance_required": false,
        "compliance_frameworks": [],
        "audit_trail_required": true,
        "legal_hold_support": false,
        "data_classification_aware": false
    }'::jsonb,
    
    -- Performance settings
    performance_config JSONB NOT NULL DEFAULT '{
        "parallel_threads": 4,
        "chunk_size_mb": 100,
        "network_throttle_mbps": null,
        "cpu_limit_percent": null,
        "memory_limit_mb": null
    }'::jsonb,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL
);

-- Recovery point access log - tracks who accessed recovery points when
CREATE TABLE IF NOT EXISTS recovery_point_access (
    access_id VARCHAR(255) PRIMARY KEY,
    recovery_point_id VARCHAR(255) NOT NULL REFERENCES recovery_points(recovery_point_id) ON DELETE CASCADE,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_by VARCHAR(255) NOT NULL,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN (
        'view', 'restore', 'validate', 'export'
    )),
    access_scope VARCHAR(20) NOT NULL CHECK (access_scope IN (
        'full_database', 'table_level', 'record_level', 'schema_only', 'data_only'
    )),
    access_reason TEXT NOT NULL,
    result_status VARCHAR(20) NOT NULL CHECK (result_status IN (
        'success', 'failed', 'partial'
    )),
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Audit trail
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    duration_seconds INTEGER
);

-- Recovery schedules - manages scheduled backup execution
CREATE TABLE IF NOT EXISTS recovery_schedules (
    schedule_id VARCHAR(255) PRIMARY KEY,
    config_id VARCHAR(255) NOT NULL REFERENCES recovery_configurations(config_id) ON DELETE CASCADE,
    schedule_name VARCHAR(500) NOT NULL,
    
    -- Schedule timing
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(20) CHECK (last_run_status IN (
        'success', 'failed', 'running', 'skipped'
    )),
    last_run_details JSONB,
    
    -- Schedule state
    is_active BOOLEAN DEFAULT TRUE,
    consecutive_failures INTEGER DEFAULT 0,
    max_failures_before_disable INTEGER DEFAULT 5,
    
    -- Execution tracking
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_duration_seconds DECIMAL(10,2) DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Recovery operations - tracks restore and recovery operations
CREATE TABLE IF NOT EXISTS recovery_operations (
    operation_id VARCHAR(255) PRIMARY KEY,
    recovery_point_id VARCHAR(255) NOT NULL REFERENCES recovery_points(recovery_point_id),
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN (
        'restore', 'validate', 'test_restore', 'export', 'migrate'
    )),
    operation_scope VARCHAR(20) NOT NULL CHECK (operation_scope IN (
        'full_database', 'table_level', 'record_level', 'schema_only', 'data_only'
    )),
    
    -- Operation details
    target_location TEXT,
    target_timestamp TIMESTAMP WITH TIME ZONE,
    specific_tables JSONB DEFAULT '[]'::jsonb,
    filter_conditions JSONB DEFAULT '{}'::jsonb,
    
    -- Operation state
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    current_phase VARCHAR(100),
    
    -- Results and metrics
    records_processed BIGINT DEFAULT 0,
    records_restored BIGINT DEFAULT 0,
    bytes_processed BIGINT DEFAULT 0,
    operation_log JSONB DEFAULT '[]'::jsonb,
    error_details JSONB,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    estimated_completion_at TIMESTAMP WITH TIME ZONE,
    
    -- Request info
    requested_by VARCHAR(255) NOT NULL,
    request_reason TEXT NOT NULL,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery metrics - aggregated performance and usage metrics
CREATE TABLE IF NOT EXISTS recovery_metrics (
    id SERIAL PRIMARY KEY,
    config_id VARCHAR(255) REFERENCES recovery_configurations(config_id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour BETWEEN 0 AND 23),
    
    -- Creation metrics
    recovery_points_created INTEGER DEFAULT 0,
    recovery_points_failed INTEGER DEFAULT 0,
    avg_creation_time_seconds DECIMAL(10,2) DEFAULT 0,
    avg_backup_size_mb DECIMAL(12,2) DEFAULT 0,
    
    -- Storage metrics
    total_storage_used_gb DECIMAL(15,2) DEFAULT 0,
    compression_ratio_avg DECIMAL(5,2) DEFAULT 1.0,
    storage_efficiency_rating INTEGER DEFAULT 0,
    
    -- Validation metrics
    validations_performed INTEGER DEFAULT 0,
    validations_successful INTEGER DEFAULT 0,
    integrity_check_failures INTEGER DEFAULT 0,
    
    -- Restore metrics
    restore_operations INTEGER DEFAULT 0,
    restore_operations_successful INTEGER DEFAULT 0,
    avg_restore_time_seconds DECIMAL(10,2) DEFAULT 0,
    
    -- Usage metrics
    recovery_point_accesses INTEGER DEFAULT 0,
    unique_users_accessing INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(config_id, metric_date, metric_hour)
);

-- Add foreign key constraint for recovery_points -> recovery_configurations
ALTER TABLE recovery_points 
ADD CONSTRAINT fk_recovery_points_config 
FOREIGN KEY (config_id) REFERENCES recovery_configurations(config_id) ON DELETE RESTRICT;

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_recovery_points_config_id ON recovery_points(config_id);
CREATE INDEX IF NOT EXISTS idx_recovery_points_status ON recovery_points(status);
CREATE INDEX IF NOT EXISTS idx_recovery_points_type ON recovery_points(type);
CREATE INDEX IF NOT EXISTS idx_recovery_points_point_in_time ON recovery_points(point_in_time);
CREATE INDEX IF NOT EXISTS idx_recovery_points_expires_at ON recovery_points(expires_at);
CREATE INDEX IF NOT EXISTS idx_recovery_points_created_by ON recovery_points(created_by);
CREATE INDEX IF NOT EXISTS idx_recovery_points_legal_hold ON recovery_points(legal_hold) WHERE legal_hold = true;

CREATE INDEX IF NOT EXISTS idx_recovery_configurations_active ON recovery_configurations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recovery_configurations_schedule ON recovery_configurations(schedule_enabled) WHERE schedule_enabled = true;

CREATE INDEX IF NOT EXISTS idx_recovery_access_recovery_point ON recovery_point_access(recovery_point_id);
CREATE INDEX IF NOT EXISTS idx_recovery_access_accessed_by ON recovery_point_access(accessed_by);
CREATE INDEX IF NOT EXISTS idx_recovery_access_accessed_at ON recovery_point_access(accessed_at);
CREATE INDEX IF NOT EXISTS idx_recovery_access_type ON recovery_point_access(access_type);

CREATE INDEX IF NOT EXISTS idx_recovery_schedules_config ON recovery_schedules(config_id);
CREATE INDEX IF NOT EXISTS idx_recovery_schedules_next_run ON recovery_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recovery_schedules_active ON recovery_schedules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_recovery_operations_recovery_point ON recovery_operations(recovery_point_id);
CREATE INDEX IF NOT EXISTS idx_recovery_operations_status ON recovery_operations(status);
CREATE INDEX IF NOT EXISTS idx_recovery_operations_requested_by ON recovery_operations(requested_by);
CREATE INDEX IF NOT EXISTS idx_recovery_operations_created_at ON recovery_operations(created_at);

CREATE INDEX IF NOT EXISTS idx_recovery_metrics_config_date ON recovery_metrics(config_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_date ON recovery_metrics(metric_date);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_recovery_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recovery_points_updated_at 
    BEFORE UPDATE ON recovery_points 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_recovery_updated_at_column();

CREATE TRIGGER update_recovery_configurations_updated_at 
    BEFORE UPDATE ON recovery_configurations 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_recovery_updated_at_column();

CREATE TRIGGER update_recovery_schedules_updated_at 
    BEFORE UPDATE ON recovery_schedules 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_recovery_updated_at_column();

CREATE TRIGGER update_recovery_operations_updated_at 
    BEFORE UPDATE ON recovery_operations 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_recovery_updated_at_column();

-- Trigger to update schedule statistics
CREATE OR REPLACE FUNCTION update_recovery_schedule_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update run counts and averages when a schedule run completes
    IF OLD.last_run_status IS DISTINCT FROM NEW.last_run_status AND NEW.last_run_status IS NOT NULL THEN
        UPDATE recovery_schedules 
        SET 
            total_runs = total_runs + 1,
            successful_runs = CASE WHEN NEW.last_run_status = 'success' THEN successful_runs + 1 ELSE successful_runs END,
            failed_runs = CASE WHEN NEW.last_run_status = 'failed' THEN failed_runs + 1 ELSE failed_runs END,
            consecutive_failures = CASE 
                WHEN NEW.last_run_status = 'success' THEN 0
                WHEN NEW.last_run_status = 'failed' THEN consecutive_failures + 1
                ELSE consecutive_failures
            END
        WHERE schedule_id = NEW.schedule_id;
        
        -- Disable schedule if too many consecutive failures
        IF NEW.last_run_status = 'failed' THEN
            UPDATE recovery_schedules 
            SET is_active = false 
            WHERE schedule_id = NEW.schedule_id 
              AND consecutive_failures >= max_failures_before_disable;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recovery_schedule_stats_trigger
    AFTER UPDATE ON recovery_schedules
    FOR EACH ROW
    EXECUTE PROCEDURE update_recovery_schedule_stats();

-- Trigger to update recovery point restore counts
CREATE OR REPLACE FUNCTION update_recovery_point_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update restore count when an operation completes successfully
    IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.operation_type IN ('restore', 'test_restore') THEN
        UPDATE recovery_points 
        SET 
            restore_count = restore_count + 1,
            last_restored_at = NOW()
        WHERE recovery_point_id = NEW.recovery_point_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recovery_point_usage_trigger
    AFTER UPDATE ON recovery_operations
    FOR EACH ROW
    EXECUTE PROCEDURE update_recovery_point_usage();

-- Views for common queries and dashboards
CREATE OR REPLACE VIEW active_recovery_points AS
SELECT 
    rp.*,
    rc.name as config_name,
    rc.retention_days,
    EXTRACT(EPOCH FROM (rp.expires_at - NOW())) / 3600 as hours_until_expiry,
    CASE 
        WHEN rp.expires_at < NOW() THEN 'expired'
        WHEN rp.expires_at < NOW() + INTERVAL '24 hours' THEN 'expiring_soon'
        ELSE 'active'
    END as expiry_status
FROM recovery_points rp
JOIN recovery_configurations rc ON rp.config_id = rc.config_id
WHERE rp.status IN ('available', 'creating')
  AND rp.legal_hold = false;

CREATE OR REPLACE VIEW recovery_configuration_summary AS
SELECT 
    rc.*,
    COUNT(rp.recovery_point_id) as total_recovery_points,
    COUNT(rp.recovery_point_id) FILTER (WHERE rp.status = 'available') as available_points,
    COUNT(rp.recovery_point_id) FILTER (WHERE rp.status = 'failed') as failed_points,
    SUM(rp.backup_size_bytes) / 1073741824.0 as total_storage_gb,
    AVG(rp.compression_ratio) as avg_compression_ratio,
    MAX(rp.point_in_time) as latest_backup_time
FROM recovery_configurations rc
LEFT JOIN recovery_points rp ON rc.config_id = rp.config_id
WHERE rc.is_active = true
GROUP BY rc.config_id, rc.name, rc.description, rc.schedule_enabled, rc.schedule_cron,
         rc.retention_days, rc.max_recovery_points, rc.created_at, rc.updated_at;

CREATE OR REPLACE VIEW recovery_operations_summary AS
SELECT 
    ro.*,
    rp.name as recovery_point_name,
    rp.point_in_time as recovery_point_time,
    rc.name as config_name,
    EXTRACT(EPOCH FROM (ro.completed_at - ro.started_at)) as actual_duration_seconds,
    CASE 
        WHEN ro.status = 'running' AND ro.estimated_completion_at < NOW() THEN 'overdue'
        WHEN ro.status = 'running' THEN 'on_track'
        WHEN ro.status = 'completed' AND ro.duration_seconds <= COALESCE(ro.estimated_completion_at - ro.started_at, INTERVAL '999 hours') THEN 'completed_on_time'
        WHEN ro.status = 'completed' THEN 'completed_late'
        ELSE ro.status::text
    END as performance_status
FROM recovery_operations ro
JOIN recovery_points rp ON ro.recovery_point_id = rp.recovery_point_id
JOIN recovery_configurations rc ON rp.config_id = rc.config_id
WHERE ro.created_at >= NOW() - INTERVAL '30 days'
ORDER BY ro.created_at DESC;

-- Insert default recovery configuration
INSERT INTO recovery_configurations (
    config_id, name, description, schedule_enabled, schedule_cron, 
    retention_days, max_recovery_points, created_by, updated_by
) VALUES (
    'default-config',
    'Default Recovery Configuration',
    'Default point-in-time recovery configuration for general use',
    true,
    '0 2 * * *', -- Daily at 2 AM
    30,
    10,
    'system',
    'system'
) ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE recovery_points IS 'Stores metadata about point-in-time recovery backups';
COMMENT ON TABLE recovery_configurations IS 'Configuration policies for backup creation and retention';
COMMENT ON TABLE recovery_point_access IS 'Audit log of recovery point access and usage';
COMMENT ON TABLE recovery_schedules IS 'Manages scheduled execution of backup operations';
COMMENT ON TABLE recovery_operations IS 'Tracks restore and recovery operations with detailed progress';
COMMENT ON TABLE recovery_metrics IS 'Aggregated performance and usage metrics for monitoring';

COMMENT ON VIEW active_recovery_points IS 'Currently available recovery points with expiry status';
COMMENT ON VIEW recovery_configuration_summary IS 'Summary statistics for each recovery configuration';
COMMENT ON VIEW recovery_operations_summary IS 'Recent recovery operations with performance tracking';