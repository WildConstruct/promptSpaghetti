-- Epic 17: Archive Management System
-- Migration: 047_archive_management_system
-- DEPLOYMENT BLOCKER FIX: Creates comprehensive archive management system for data retention and lifecycle management

-- Core archives table
CREATE TABLE IF NOT EXISTS archives (
    id UUID PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    archive_type VARCHAR(50) NOT NULL CHECK (archive_type IN (
        'full_backup', 'incremental_backup', 'differential_backup', 'log_archive',
        'data_export', 'user_data_archive', 'system_snapshot', 'configuration_backup',
        'database_dump', 'file_archive', 'media_archive', 'compliance_archive', 'custom'
    )),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'system_data', 'user_data', 'application_data', 'log_data', 'backup_data',
        'media_data', 'configuration_data', 'analytics_data', 'compliance_data',
        'temporary_data', 'historical_data', 'custom'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'creating', 'compressing', 'encrypting', 'uploading', 'completed',
        'validating', 'validated', 'failed', 'expired', 'deleted', 'restoring', 'corrupted'
    )),
    
    -- Source data information
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN (
        'database_table', 'database_query', 'file_directory', 'file_list', 'log_files',
        'application_data', 'user_generated', 'system_generated', 'external_import', 'custom_source'
    )),
    source_identifier VARCHAR(1000) NOT NULL,
    source_metadata JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(source_metadata) = 'object'),
    
    -- Archive properties
    compression_algorithm VARCHAR(20) NOT NULL DEFAULT 'gzip' CHECK (compression_algorithm IN (
        'gzip', 'bzip2', 'xz', 'zstd', 'lz4', 'snappy', 'deflate', 'none'
    )),
    encryption_algorithm VARCHAR(30) CHECK (encryption_algorithm IN (
        'aes_256_gcm', 'aes_256_cbc', 'chacha20_poly1305', 'aes_128_gcm', 'none'
    )),
    compression_ratio NUMERIC(8,4) DEFAULT 0 CHECK (compression_ratio >= 0),
    original_size BIGINT NOT NULL DEFAULT 0 CHECK (original_size >= 0),
    compressed_size BIGINT DEFAULT 0 CHECK (compressed_size >= 0),
    
    -- Storage information
    storage_location VARCHAR(2000),
    storage_provider VARCHAR(100) NOT NULL,
    storage_class VARCHAR(20) NOT NULL DEFAULT 'warm' CHECK (storage_class IN (
        'hot', 'warm', 'cold', 'glacier', 'deep_glacier', 'intelligent'
    )),
    redundancy_level VARCHAR(30) NOT NULL DEFAULT 'local_redundancy' CHECK (redundancy_level IN (
        'none', 'local_redundancy', 'zone_redundancy', 'region_redundancy', 'cross_region_redundancy'
    )),
    
    -- Integrity and validation
    checksum VARCHAR(256) NOT NULL DEFAULT '',
    checksum_algorithm VARCHAR(20) NOT NULL DEFAULT 'sha256' CHECK (checksum_algorithm IN (
        'sha256', 'sha512', 'md5', 'crc32', 'blake2b'
    )),
    validation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (validation_status IN (
        'pending', 'validating', 'valid', 'invalid', 'corrupted', 'failed'
    )),
    last_validated TIMESTAMP WITH TIME ZONE,
    
    -- Retention and lifecycle
    retention_policy_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0 CHECK (access_count >= 0),
    
    -- Processing information
    processing_duration_ms INTEGER DEFAULT 0 CHECK (processing_duration_ms >= 0),
    processing_errors JSONB DEFAULT '[]' CHECK (jsonb_typeof(processing_errors) = 'array'),
    
    -- Metadata and classification
    tags TEXT[] DEFAULT '{}',
    business_criticality VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (business_criticality IN (
        'low', 'medium', 'high', 'critical'
    )),
    compliance_requirements TEXT[] DEFAULT '{}',
    data_classification VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (data_classification IN (
        'public', 'internal', 'confidential', 'restricted', 'top_secret'
    )),
    custom_metadata JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(custom_metadata) = 'object'),
    
    -- Audit information
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    archived_by UUID REFERENCES users(id) ON DELETE SET NULL,
    last_accessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_compressed_size CHECK (compressed_size <= original_size OR original_size = 0),
    CONSTRAINT valid_completion CHECK (archived_at >= created_at),
    CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > archived_at),
    CONSTRAINT valid_access CHECK (accessed_at IS NULL OR accessed_at >= created_at)
);

-- Retention policies table
CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Retention configuration
    retention_period_days INTEGER NOT NULL CHECK (retention_period_days > 0),
    auto_delete_enabled BOOLEAN DEFAULT false,
    
    -- Storage transitions
    storage_transitions JSONB DEFAULT '[]' CHECK (jsonb_typeof(storage_transitions) = 'array'),
    
    -- Notification settings
    notification_settings JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(notification_settings) = 'object'),
    
    -- Policy exceptions
    exceptions JSONB DEFAULT '[]' CHECK (jsonb_typeof(exceptions) = 'array'),
    
    -- Policy status
    is_active BOOLEAN DEFAULT true,
    is_system_policy BOOLEAN DEFAULT false,
    
    -- Applicable scope
    applicable_categories TEXT[],
    applicable_types TEXT[],
    applicable_classifications TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_retention_period CHECK (retention_period_days <= 36500) -- ~100 years max
);

-- Archive jobs table for processing queue
CREATE TABLE IF NOT EXISTS archive_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_id UUID REFERENCES archives(id) ON DELETE CASCADE,
    job_type VARCHAR(30) NOT NULL CHECK (job_type IN (
        'create_archive', 'validate_archive', 'restore_archive', 'delete_archive',
        'migrate_storage', 'update_metadata', 'generate_report', 'cleanup_expired',
        'integrity_check', 'compress_archive'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'running', 'completed', 'failed', 'cancelled', 'paused', 'retry_scheduled'
    )),
    priority INTEGER DEFAULT 100 CHECK (priority >= 0 AND priority <= 1000),
    
    -- Job configuration
    config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(config) = 'object'),
    
    -- Progress tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_step VARCHAR(200),
    total_steps INTEGER DEFAULT 1 CHECK (total_steps > 0),
    completed_steps INTEGER DEFAULT 0 CHECK (completed_steps >= 0 AND completed_steps <= total_steps),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    result JSONB,
    errors JSONB DEFAULT '[]' CHECK (jsonb_typeof(errors) = 'array'),
    warnings JSONB DEFAULT '[]' CHECK (jsonb_typeof(warnings) = 'array'),
    
    -- Performance metrics
    processing_time_ms INTEGER DEFAULT 0 CHECK (processing_time_ms >= 0),
    memory_used_mb INTEGER DEFAULT 0 CHECK (memory_used_mb >= 0),
    disk_used_mb INTEGER DEFAULT 0 CHECK (disk_used_mb >= 0),
    
    -- Retry logic
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_start_time CHECK (started_at IS NULL OR started_at >= created_at),
    CONSTRAINT valid_completion_time CHECK (completed_at IS NULL OR completed_at >= created_at),
    CONSTRAINT valid_retry_logic CHECK (retry_count <= max_retries)
);

-- Restore requests table
CREATE TABLE IF NOT EXISTS restore_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_id UUID NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    restore_type VARCHAR(20) NOT NULL CHECK (restore_type IN (
        'full_restore', 'partial_restore', 'preview_restore', 'metadata_only', 'validation_restore'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN (
        'requested', 'queued', 'preparing', 'downloading', 'extracting', 'completed', 
        'failed', 'cancelled', 'expired'
    )),
    
    -- Restore configuration
    target_location VARCHAR(1000),
    partial_restore_config JSONB,
    priority INTEGER DEFAULT 100 CHECK (priority >= 0 AND priority <= 1000),
    
    -- Request information
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    notify_on_complete BOOLEAN DEFAULT false,
    
    -- Timing
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress and results
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result JSONB,
    error_message TEXT,
    
    -- Download information
    download_url VARCHAR(2000),
    download_expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0 CHECK (download_count >= 0),
    
    -- Constraints
    CONSTRAINT valid_restore_timing CHECK (
        started_at IS NULL OR started_at >= requested_at
    ),
    CONSTRAINT valid_completion_timing CHECK (
        completed_at IS NULL OR (completed_at >= requested_at AND 
        (started_at IS NULL OR completed_at >= started_at))
    )
);

-- Archive access log for audit trail
CREATE TABLE IF NOT EXISTS archive_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_id UUID REFERENCES archives(id) ON DELETE SET NULL,
    accessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    access_type VARCHAR(30) NOT NULL CHECK (access_type IN (
        'view_metadata', 'download', 'restore_request', 'validate', 'update_metadata',
        'delete', 'share', 'export_metadata', 'search_result'
    )),
    
    -- Access context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Access details
    access_details JSONB DEFAULT '{}' CHECK (jsonb_typeof(access_details) = 'object'),
    
    -- Results
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Timing
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration_ms INTEGER DEFAULT 0 CHECK (duration_ms >= 0)
);

-- Archive validation results
CREATE TABLE IF NOT EXISTS archive_validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_id UUID NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    validation_type VARCHAR(30) NOT NULL CHECK (validation_type IN (
        'checksum_validation', 'content_validation', 'structure_validation',
        'integrity_check', 'accessibility_check', 'compliance_check'
    )),
    
    -- Validation results
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'passed', 'failed', 'warning', 'skipped', 'error'
    )),
    details JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(details) = 'object'),
    
    -- Issues found
    errors JSONB DEFAULT '[]' CHECK (jsonb_typeof(errors) = 'array'),
    warnings JSONB DEFAULT '[]' CHECK (jsonb_typeof(warnings) = 'array'),
    
    -- Performance metrics
    validation_duration_ms INTEGER DEFAULT 0 CHECK (validation_duration_ms >= 0),
    
    -- Metadata
    validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    validation_version VARCHAR(20) DEFAULT '1.0'
);

-- Archive statistics aggregation table
CREATE TABLE IF NOT EXISTS archive_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- General statistics
    total_archives INTEGER DEFAULT 0,
    total_original_size BIGINT DEFAULT 0,
    total_compressed_size BIGINT DEFAULT 0,
    average_compression_ratio NUMERIC(8,4) DEFAULT 0,
    
    -- By status
    archives_by_status JSONB DEFAULT '{}' CHECK (jsonb_typeof(archives_by_status) = 'object'),
    
    -- By type and category
    archives_by_type JSONB DEFAULT '{}' CHECK (jsonb_typeof(archives_by_type) = 'object'),
    archives_by_category JSONB DEFAULT '{}' CHECK (jsonb_typeof(archives_by_category) = 'object'),
    
    -- By storage and classification
    archives_by_storage_class JSONB DEFAULT '{}' CHECK (jsonb_typeof(archives_by_storage_class) = 'object'),
    archives_by_criticality JSONB DEFAULT '{}' CHECK (jsonb_typeof(archives_by_criticality) = 'object'),
    
    -- Performance metrics
    created_this_period INTEGER DEFAULT 0,
    expired_this_period INTEGER DEFAULT 0,
    accessed_this_period INTEGER DEFAULT 0,
    restored_this_period INTEGER DEFAULT 0,
    
    -- Health metrics
    validation_pass_rate NUMERIC(5,2) DEFAULT 0,
    corruption_rate NUMERIC(5,2) DEFAULT 0,
    
    -- Cost estimation
    estimated_storage_cost NUMERIC(12,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_statistics_period CHECK (period_end > period_start),
    UNIQUE(period_start, period_end)
);

-- Add foreign key constraint for retention policy
ALTER TABLE archives 
ADD CONSTRAINT fk_archives_retention_policy 
FOREIGN KEY (retention_policy_id) REFERENCES retention_policies(id) ON DELETE SET NULL;

-- Indexes for efficient querying and performance

-- Archives table indexes
CREATE INDEX IF NOT EXISTS idx_archives_status ON archives(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_archives_type_category ON archives(archive_type, category);
CREATE INDEX IF NOT EXISTS idx_archives_created_by ON archives(created_by);
CREATE INDEX IF NOT EXISTS idx_archives_created_at ON archives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archives_archived_at ON archives(archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_archives_expires_at ON archives(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archives_accessed_at ON archives(accessed_at DESC) WHERE accessed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archives_validation ON archives(validation_status, last_validated);
CREATE INDEX IF NOT EXISTS idx_archives_storage ON archives(storage_provider, storage_class);
CREATE INDEX IF NOT EXISTS idx_archives_retention_policy ON archives(retention_policy_id) WHERE retention_policy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archives_business_criticality ON archives(business_criticality);
CREATE INDEX IF NOT EXISTS idx_archives_data_classification ON archives(data_classification);
CREATE INDEX IF NOT EXISTS idx_archives_size ON archives(original_size DESC, compressed_size DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_archives_name_search ON archives USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_archives_description_search ON archives USING gin(to_tsvector('english', description)) WHERE description IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archives_tags ON archives USING gin(tags);

-- Metadata search indexes
CREATE INDEX IF NOT EXISTS idx_archives_source_metadata ON archives USING gin(source_metadata);
CREATE INDEX IF NOT EXISTS idx_archives_custom_metadata ON archives USING gin(custom_metadata);
CREATE INDEX IF NOT EXISTS idx_archives_compliance ON archives USING gin(compliance_requirements);

-- Retention policies indexes
CREATE INDEX IF NOT EXISTS idx_retention_policies_active ON retention_policies(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_retention_policies_categories ON retention_policies USING gin(applicable_categories);
CREATE INDEX IF NOT EXISTS idx_retention_policies_types ON retention_policies USING gin(applicable_types);

-- Archive jobs indexes
CREATE INDEX IF NOT EXISTS idx_archive_jobs_archive_id ON archive_jobs(archive_id);
CREATE INDEX IF NOT EXISTS idx_archive_jobs_status ON archive_jobs(status, created_at) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_archive_jobs_priority ON archive_jobs(priority DESC, created_at ASC) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_archive_jobs_type ON archive_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_archive_jobs_retry ON archive_jobs(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Restore requests indexes
CREATE INDEX IF NOT EXISTS idx_restore_requests_archive_id ON restore_requests(archive_id);
CREATE INDEX IF NOT EXISTS idx_restore_requests_requested_by ON restore_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_restore_requests_status ON restore_requests(status, requested_at);
CREATE INDEX IF NOT EXISTS idx_restore_requests_expires_at ON restore_requests(expires_at) WHERE expires_at IS NOT NULL;

-- Access log indexes
CREATE INDEX IF NOT EXISTS idx_archive_access_log_archive_id ON archive_access_log(archive_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_access_log_accessed_by ON archive_access_log(accessed_by, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_access_log_type ON archive_access_log(access_type, accessed_at DESC);

-- Validation results indexes
CREATE INDEX IF NOT EXISTS idx_archive_validation_archive_id ON archive_validation_results(archive_id, validated_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_validation_status ON archive_validation_results(status, validated_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_validation_type ON archive_validation_results(validation_type);

-- Statistics indexes
CREATE INDEX IF NOT EXISTS idx_archive_statistics_period ON archive_statistics(period_start, period_end);

-- Trigger functions for automation and maintenance

-- Update archive timestamp and access tracking
CREATE OR REPLACE FUNCTION update_archive_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.accessed_at = NOW();
    NEW.access_count = NEW.access_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps on archive changes
CREATE OR REPLACE FUNCTION update_archive_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.archived_at = NOW();
        
        -- Update compression ratio if sizes are available
        IF NEW.original_size > 0 AND NEW.compressed_size >= 0 THEN
            NEW.compression_ratio = (NEW.original_size - NEW.compressed_size)::NUMERIC / NEW.original_size;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for archive updates
CREATE TRIGGER trigger_archives_timestamp
    BEFORE UPDATE ON archives
    FOR EACH ROW
    EXECUTE FUNCTION update_archive_timestamps();

-- Update retention policy timestamps
CREATE OR REPLACE FUNCTION update_retention_policy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for retention policy updates
CREATE TRIGGER trigger_retention_policies_timestamp
    BEFORE UPDATE ON retention_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_policy_timestamp();

-- Function to check and update archive expiration
CREATE OR REPLACE FUNCTION check_archive_expiration()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
BEGIN
    -- Mark archives as expired if past expiration date
    UPDATE archives 
    SET status = 'expired'
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND status NOT IN ('expired', 'deleted');
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log expired archives for audit
    INSERT INTO archive_access_log (
        archive_id, 
        access_type, 
        accessed_by, 
        success,
        access_details
    )
    SELECT 
        id, 
        'expire_automatic', 
        NULL,
        true,
        jsonb_build_object('expired_at', NOW(), 'reason', 'retention_policy_expired')
    FROM archives 
    WHERE status = 'expired' 
    AND expires_at BETWEEN NOW() - INTERVAL '1 hour' AND NOW();
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old records
CREATE OR REPLACE FUNCTION cleanup_archive_data()
RETURNS TABLE(
    deleted_access_logs INTEGER,
    deleted_validation_results INTEGER,
    deleted_old_statistics INTEGER
) AS $$
DECLARE
    access_log_retention_days INTEGER := 730; -- 2 years
    validation_retention_days INTEGER := 365; -- 1 year
    statistics_retention_days INTEGER := 1095; -- 3 years
    access_deleted INTEGER := 0;
    validation_deleted INTEGER := 0;
    stats_deleted INTEGER := 0;
BEGIN
    -- Clean up old access logs
    DELETE FROM archive_access_log 
    WHERE accessed_at < NOW() - (access_log_retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS access_deleted = ROW_COUNT;
    
    -- Clean up old validation results
    DELETE FROM archive_validation_results 
    WHERE validated_at < NOW() - (validation_retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS validation_deleted = ROW_COUNT;
    
    -- Clean up old statistics
    DELETE FROM archive_statistics 
    WHERE period_end < NOW() - (statistics_retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS stats_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT access_deleted, validation_deleted, stats_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to get archive health metrics
CREATE OR REPLACE FUNCTION get_archive_health_metrics()
RETURNS TABLE(
    total_archives BIGINT,
    healthy_archives BIGINT,
    corrupted_archives BIGINT,
    expired_archives BIGINT,
    validation_rate NUMERIC,
    avg_age_days NUMERIC,
    total_size_gb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_archives,
        COUNT(*) FILTER (WHERE validation_status = 'valid') as healthy_archives,
        COUNT(*) FILTER (WHERE validation_status = 'corrupted') as corrupted_archives,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_archives,
        ROUND(
            (COUNT(*) FILTER (WHERE validation_status = 'valid')::NUMERIC / 
             NULLIF(COUNT(*), 0) * 100), 2
        ) as validation_rate,
        ROUND(AVG(EXTRACT(DAY FROM NOW() - created_at)), 1) as avg_age_days,
        ROUND(SUM(compressed_size)::NUMERIC / 1024 / 1024 / 1024, 2) as total_size_gb
    FROM archives
    WHERE status NOT IN ('deleted');
END;
$$ LANGUAGE plpgsql;

-- Views for common queries and reporting

-- Archive health summary view
CREATE OR REPLACE VIEW archive_health_summary AS
SELECT 
    a.id,
    a.name,
    a.archive_type,
    a.category,
    a.status,
    a.validation_status,
    a.business_criticality,
    a.created_at,
    a.expires_at,
    CASE 
        WHEN a.expires_at IS NOT NULL AND a.expires_at <= NOW() + INTERVAL '30 days' THEN 'expiring_soon'
        WHEN a.validation_status = 'corrupted' THEN 'corrupted'
        WHEN a.validation_status = 'invalid' THEN 'invalid'
        WHEN a.last_validated IS NULL OR a.last_validated < NOW() - INTERVAL '90 days' THEN 'needs_validation'
        WHEN a.status = 'failed' THEN 'failed'
        ELSE 'healthy'
    END as health_status,
    a.compressed_size,
    a.access_count,
    a.last_accessed_by,
    a.accessed_at
FROM archives a
WHERE a.status NOT IN ('deleted');

-- Retention policy summary view
CREATE OR REPLACE VIEW retention_policy_summary AS
SELECT 
    rp.id,
    rp.name,
    rp.retention_period_days,
    rp.auto_delete_enabled,
    rp.is_active,
    COUNT(a.id) as applied_archives,
    COUNT(a.id) FILTER (WHERE a.expires_at <= NOW() + INTERVAL '30 days') as expiring_soon,
    SUM(a.compressed_size) as total_size,
    AVG(EXTRACT(DAY FROM NOW() - a.created_at)) as avg_archive_age_days
FROM retention_policies rp
LEFT JOIN archives a ON rp.id = a.retention_policy_id AND a.status NOT IN ('deleted', 'expired')
WHERE rp.is_active = true
GROUP BY rp.id, rp.name, rp.retention_period_days, rp.auto_delete_enabled, rp.is_active;

-- Archive processing queue view
CREATE OR REPLACE VIEW archive_processing_queue AS
SELECT 
    aj.id as job_id,
    aj.archive_id,
    a.name as archive_name,
    aj.job_type,
    aj.status,
    aj.priority,
    aj.progress,
    aj.created_at,
    aj.started_at,
    aj.retry_count,
    aj.max_retries,
    aj.next_retry_at,
    EXTRACT(EPOCH FROM NOW() - aj.created_at)::INTEGER as queue_time_seconds
FROM archive_jobs aj
JOIN archives a ON aj.archive_id = a.id
WHERE aj.status IN ('queued', 'running', 'retry_scheduled')
ORDER BY aj.priority DESC, aj.created_at ASC;

-- Insert default retention policies
INSERT INTO retention_policies (
    name,
    description,
    retention_period_days,
    auto_delete_enabled,
    notification_settings,
    is_system_policy,
    applicable_categories,
    applicable_types
) VALUES 
(
    'System Data - Short Term',
    'Short-term retention for system logs and temporary data',
    90,
    true,
    '{"notifyBeforeExpiration": true, "notificationDays": [7, 1], "recipients": [], "channels": ["email"]}',
    true,
    ARRAY['system_data', 'log_data', 'temporary_data'],
    ARRAY['log_archive', 'system_snapshot']
),
(
    'System Data - Long Term',
    'Long-term retention for important system data',
    2555, -- ~7 years
    false,
    '{"notifyBeforeExpiration": true, "notificationDays": [90, 30, 7], "recipients": [], "channels": ["email"]}',
    true,
    ARRAY['system_data', 'configuration_data', 'backup_data'],
    ARRAY['full_backup', 'configuration_backup', 'database_dump']
),
(
    'User Data - Standard',
    'Standard retention for user-generated content',
    1095, -- 3 years
    false,
    '{"notifyBeforeExpiration": true, "notificationDays": [30, 7], "recipients": [], "channels": ["email"]}',
    true,
    ARRAY['user_data', 'media_data'],
    ARRAY['user_data_archive', 'media_archive']
),
(
    'Compliance Data - Extended',
    'Extended retention for compliance and audit data',
    3650, -- 10 years
    false,
    '{"notifyBeforeExpiration": true, "notificationDays": [180, 90, 30], "recipients": [], "channels": ["email", "webhook"]}',
    true,
    ARRAY['compliance_data', 'analytics_data'],
    ARRAY['compliance_archive', 'data_export']
)
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE archives IS 'Core table for archive records with comprehensive metadata and lifecycle management';
COMMENT ON TABLE retention_policies IS 'Configurable retention policies for automatic archive lifecycle management';
COMMENT ON TABLE archive_jobs IS 'Processing queue for archive operations with retry logic and progress tracking';
COMMENT ON TABLE restore_requests IS 'Archive restoration requests with download management';
COMMENT ON TABLE archive_access_log IS 'Audit trail for all archive access and operations';
COMMENT ON TABLE archive_validation_results IS 'Results of archive integrity and validation checks';
COMMENT ON TABLE archive_statistics IS 'Aggregated statistics for reporting and analytics';

COMMENT ON COLUMN archives.source_metadata IS 'Flexible metadata about the archived data source including record counts, date ranges, and custom fields';
COMMENT ON COLUMN archives.compression_ratio IS 'Compression efficiency ratio calculated as (original_size - compressed_size) / original_size';
COMMENT ON COLUMN archives.custom_metadata IS 'User-defined metadata fields for additional archive properties and tags';
COMMENT ON COLUMN retention_policies.storage_transitions IS 'Automated storage class transitions based on age and access patterns';
COMMENT ON COLUMN retention_policies.notification_settings IS 'Email and webhook notification configuration for policy events';
COMMENT ON COLUMN archive_jobs.config IS 'Job-specific configuration including source parameters and processing options';

COMMENT ON VIEW archive_health_summary IS 'Comprehensive health status for archives including expiration and validation warnings';
COMMENT ON VIEW retention_policy_summary IS 'Summary of retention policy usage and effectiveness metrics';
COMMENT ON VIEW archive_processing_queue IS 'Current processing queue with job priorities and timing information';

COMMENT ON FUNCTION check_archive_expiration IS 'Automated function to check and mark expired archives based on retention policies';
COMMENT ON FUNCTION cleanup_archive_data IS 'Maintenance function to clean up old logs, validation results, and statistics';
COMMENT ON FUNCTION get_archive_health_metrics IS 'Generate comprehensive archive health metrics for monitoring dashboards';