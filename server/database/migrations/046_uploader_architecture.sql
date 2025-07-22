-- Epic 17: Uploader Architecture
-- Migration: 046_uploader_architecture
-- DEPLOYMENT BLOCKER FIX: Creates comprehensive file upload system with multi-part uploads, processing, and storage management

-- Upload requests table for tracking all file uploads
CREATE TABLE IF NOT EXISTS upload_requests (
    id UUID PRIMARY KEY,
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    upload_type VARCHAR(50) NOT NULL CHECK (upload_type IN (
        'document', 'image', 'video', 'audio', 'archive', 'data_import',
        'configuration', 'logs', 'backup', 'template', 'report', 
        'certificate', 'key', 'other'
    )),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'admin_import', 'user_content', 'system_data', 'configuration_file',
        'backup_restore', 'bulk_operation', 'media_asset', 'document_library',
        'template_library', 'security_asset', 'compliance_data', 'analytics_data',
        'integration_data', 'custom'
    )),
    
    -- Upload metadata and configuration
    metadata JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    options JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(options) = 'object'),
    
    -- Upload status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'initiated' CHECK (status IN (
        'initiated', 'uploading', 'paused', 'completed', 'processing', 
        'processed', 'failed', 'cancelled', 'expired', 'quarantined', 'deleted'
    )),
    
    -- Storage information
    storage_backend VARCHAR(50) NOT NULL DEFAULT 'local_filesystem',
    storage_location VARCHAR(1000),
    storage_metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(storage_metadata) = 'object'),
    
    -- Security and compliance
    security_level VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (security_level IN (
        'public', 'internal', 'confidential', 'restricted', 'top_secret'
    )),
    encryption_required BOOLEAN DEFAULT false,
    virus_scan_required BOOLEAN DEFAULT true,
    virus_scan_status VARCHAR(20) DEFAULT 'pending' CHECK (virus_scan_status IN (
        'pending', 'scanning', 'clean', 'infected', 'failed', 'skipped'
    )),
    virus_scan_result JSONB,
    
    -- Processing information
    requires_processing BOOLEAN DEFAULT true,
    processing_pipeline TEXT[],
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN (
        'pending', 'queued', 'running', 'completed', 'failed', 'skipped'
    )),
    processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
    processing_errors JSONB DEFAULT '[]' CHECK (jsonb_typeof(processing_errors) = 'array'),
    
    -- Timing and lifecycle
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance tracking
    upload_duration_ms INTEGER,
    processing_duration_ms INTEGER,
    
    -- Audit and context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size <= 10737418240), -- 10GB max
    CONSTRAINT valid_completion CHECK (completed_at IS NULL OR completed_at >= created_at),
    CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Upload chunks table for multi-part uploads
CREATE TABLE IF NOT EXISTS upload_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL REFERENCES upload_requests(id) ON DELETE CASCADE,
    chunk_number INTEGER NOT NULL CHECK (chunk_number >= 0),
    chunk_size INTEGER NOT NULL CHECK (chunk_size > 0),
    chunk_offset BIGINT NOT NULL CHECK (chunk_offset >= 0),
    
    -- Chunk integrity
    checksum VARCHAR(128) NOT NULL,
    checksum_algorithm VARCHAR(20) NOT NULL DEFAULT 'sha256',
    verified BOOLEAN DEFAULT false,
    
    -- Storage information
    storage_location VARCHAR(1000) NOT NULL,
    storage_backend VARCHAR(50) NOT NULL,
    storage_metadata JSONB DEFAULT '{}',
    
    -- Timing
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(upload_id, chunk_number),
    CONSTRAINT valid_chunk_size CHECK (chunk_size <= 104857600), -- 100MB max chunk
    CONSTRAINT valid_checksum CHECK (length(checksum) > 0)
);

-- Processing jobs table for file processing tasks
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL REFERENCES upload_requests(id) ON DELETE CASCADE,
    processor_type VARCHAR(50) NOT NULL CHECK (processor_type IN (
        'virus_scan', 'metadata_extraction', 'thumbnail_generation',
        'ocr_text_extraction', 'image_optimization', 'video_transcoding',
        'audio_conversion', 'document_conversion', 'archive_extraction',
        'data_validation', 'content_indexing', 'encryption', 'compression',
        'backup_creation', 'custom'
    )),
    
    -- Job configuration
    priority INTEGER DEFAULT 100 CHECK (priority >= 0 AND priority <= 1000),
    config JSONB DEFAULT '{}' CHECK (jsonb_typeof(config) = 'object'),
    
    -- Job status and progress
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'running', 'completed', 'failed', 'cancelled', 'skipped'
    )),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results and output
    result JSONB,
    output_files JSONB DEFAULT '[]' CHECK (jsonb_typeof(output_files) = 'array'),
    extracted_data JSONB,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
    
    -- Performance tracking
    cpu_time_ms INTEGER,
    memory_used_mb INTEGER,
    disk_used_mb INTEGER,
    
    -- Constraints
    CONSTRAINT valid_completion CHECK (completed_at IS NULL OR completed_at >= created_at),
    CONSTRAINT valid_start CHECK (started_at IS NULL OR started_at >= created_at),
    CONSTRAINT valid_retries CHECK (retry_count <= max_retries)
);

-- Storage providers configuration
CREATE TABLE IF NOT EXISTS storage_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    backend VARCHAR(50) NOT NULL CHECK (backend IN (
        'local_filesystem', 'aws_s3', 'google_cloud_storage', 
        'azure_blob', 'minio', 'ftp', 'sftp'
    )),
    
    -- Provider configuration
    config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(config) = 'object'),
    credentials_encrypted TEXT,
    
    -- Provider status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    health_status VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN (
        'healthy', 'degraded', 'unhealthy', 'unknown', 'maintenance'
    )),
    last_health_check TIMESTAMP WITH TIME ZONE,
    
    -- Capacity and limits
    storage_quota_bytes BIGINT,
    storage_used_bytes BIGINT DEFAULT 0,
    max_file_size_bytes BIGINT DEFAULT 1073741824, -- 1GB default
    max_concurrent_uploads INTEGER DEFAULT 10,
    
    -- Performance configuration
    preferred_chunk_size INTEGER DEFAULT 1048576, -- 1MB default
    max_bandwidth_mbps INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_quota CHECK (storage_quota_bytes IS NULL OR storage_quota_bytes > 0),
    CONSTRAINT valid_used_storage CHECK (storage_used_bytes >= 0),
    CONSTRAINT single_default_provider EXCLUDE (is_default WITH =) WHERE (is_default = true)
);

-- File processors registry
CREATE TABLE IF NOT EXISTS file_processors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    processor_type VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    
    -- Processor capabilities
    supported_mime_types TEXT[] NOT NULL,
    supported_extensions TEXT[] NOT NULL,
    max_file_size_bytes BIGINT,
    
    -- Processor configuration
    config JSONB DEFAULT '{}' CHECK (jsonb_typeof(config) = 'object'),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100 CHECK (priority >= 0 AND priority <= 1000),
    
    -- Performance characteristics
    avg_processing_time_ms INTEGER,
    memory_requirement_mb INTEGER,
    cpu_requirement_cores NUMERIC(3,1),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_memory_requirement CHECK (memory_requirement_mb IS NULL OR memory_requirement_mb > 0),
    CONSTRAINT valid_cpu_requirement CHECK (cpu_requirement_cores IS NULL OR cpu_requirement_cores > 0)
);

-- Upload validation rules
CREATE TABLE IF NOT EXISTS upload_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'file_extension', 'mime_type', 'file_size', 'filename_pattern',
        'content_scan', 'metadata_check', 'custom_validation'
    )),
    
    -- Rule configuration
    rule_config JSONB NOT NULL CHECK (jsonb_typeof(rule_config) = 'object'),
    error_message VARCHAR(500) NOT NULL,
    severity VARCHAR(10) NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
    
    -- Rule application
    applies_to_categories TEXT[],
    applies_to_types TEXT[],
    applies_to_users UUID[],
    
    -- Rule status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100 CHECK (priority >= 0 AND priority <= 1000),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(name)
);

-- Upload statistics and analytics
CREATE TABLE IF NOT EXISTS upload_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Upload metrics
    total_uploads INTEGER DEFAULT 0,
    successful_uploads INTEGER DEFAULT 0,
    failed_uploads INTEGER DEFAULT 0,
    cancelled_uploads INTEGER DEFAULT 0,
    
    -- Size metrics
    total_bytes_uploaded BIGINT DEFAULT 0,
    avg_file_size_bytes BIGINT DEFAULT 0,
    largest_file_size_bytes BIGINT DEFAULT 0,
    
    -- Performance metrics
    avg_upload_time_ms INTEGER,
    avg_processing_time_ms INTEGER,
    total_processing_time_ms BIGINT DEFAULT 0,
    
    -- Category breakdown
    uploads_by_category JSONB DEFAULT '{}' CHECK (jsonb_typeof(uploads_by_category) = 'object'),
    uploads_by_type JSONB DEFAULT '{}' CHECK (jsonb_typeof(uploads_by_type) = 'object'),
    uploads_by_user JSONB DEFAULT '{}' CHECK (jsonb_typeof(uploads_by_user) = 'object'),
    
    -- Error analysis
    error_breakdown JSONB DEFAULT '{}' CHECK (jsonb_typeof(error_breakdown) = 'object'),
    virus_detection_count INTEGER DEFAULT 0,
    quarantined_files_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_period CHECK (period_end > period_start),
    UNIQUE(period_start, period_end)
);

-- Indexes for efficient querying and performance
CREATE INDEX IF NOT EXISTS idx_upload_requests_status ON upload_requests(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_upload_requests_uploaded_by ON upload_requests(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_upload_requests_created_at ON upload_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_requests_expires_at ON upload_requests(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_upload_requests_category ON upload_requests(category);
CREATE INDEX IF NOT EXISTS idx_upload_requests_type ON upload_requests(upload_type);
CREATE INDEX IF NOT EXISTS idx_upload_requests_processing ON upload_requests(processing_status) WHERE requires_processing = true;
CREATE INDEX IF NOT EXISTS idx_upload_requests_virus_scan ON upload_requests(virus_scan_status) WHERE virus_scan_required = true;

-- Metadata search indexes
CREATE INDEX IF NOT EXISTS idx_upload_requests_metadata ON upload_requests USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_upload_requests_filename ON upload_requests USING gin(to_tsvector('english', filename));
CREATE INDEX IF NOT EXISTS idx_upload_requests_tags ON upload_requests USING gin((metadata->'tags'));

-- Upload chunks indexes
CREATE INDEX IF NOT EXISTS idx_upload_chunks_upload_id ON upload_chunks(upload_id);
CREATE INDEX IF NOT EXISTS idx_upload_chunks_uploaded_at ON upload_chunks(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_chunks_verification ON upload_chunks(upload_id, verified) WHERE verified = false;

-- Processing jobs indexes
CREATE INDEX IF NOT EXISTS idx_processing_jobs_upload_id ON processing_jobs(upload_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status, created_at) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_processing_jobs_priority ON processing_jobs(priority DESC, created_at ASC) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_processing_jobs_processor_type ON processing_jobs(processor_type);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_retry ON processing_jobs(retry_count, status) WHERE retry_count < max_retries;

-- Storage providers indexes
CREATE INDEX IF NOT EXISTS idx_storage_providers_active ON storage_providers(is_active, is_default);
CREATE INDEX IF NOT EXISTS idx_storage_providers_backend ON storage_providers(backend);
CREATE INDEX IF NOT EXISTS idx_storage_providers_health ON storage_providers(health_status, last_health_check);

-- File processors indexes
CREATE INDEX IF NOT EXISTS idx_file_processors_active ON file_processors(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_file_processors_type ON file_processors(processor_type);

-- Validation rules indexes
CREATE INDEX IF NOT EXISTS idx_upload_validation_rules_active ON upload_validation_rules(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_upload_validation_rules_type ON upload_validation_rules(rule_type);

-- Statistics indexes
CREATE INDEX IF NOT EXISTS idx_upload_statistics_period ON upload_statistics(period_start, period_end);

-- Trigger functions for automation and maintenance

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_upload_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER trigger_upload_requests_timestamp
    BEFORE UPDATE ON upload_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_upload_timestamp();

CREATE TRIGGER trigger_storage_providers_timestamp
    BEFORE UPDATE ON storage_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_upload_timestamp();

CREATE TRIGGER trigger_file_processors_timestamp
    BEFORE UPDATE ON file_processors
    FOR EACH ROW
    EXECUTE FUNCTION update_upload_timestamp();

CREATE TRIGGER trigger_upload_validation_rules_timestamp
    BEFORE UPDATE ON upload_validation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_upload_timestamp();

-- Function to calculate upload progress
CREATE OR REPLACE FUNCTION calculate_upload_progress(upload_uuid UUID)
RETURNS TABLE(
    upload_id UUID,
    total_chunks INTEGER,
    completed_chunks INTEGER,
    total_bytes BIGINT,
    uploaded_bytes BIGINT,
    progress_percentage NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.id,
        CEIL(ur.file_size::NUMERIC / (ur.options->>'maxChunkSize')::INTEGER)::INTEGER as total_chunks,
        COUNT(uc.id)::INTEGER as completed_chunks,
        ur.file_size,
        COALESCE(SUM(uc.chunk_size), 0)::BIGINT as uploaded_bytes,
        CASE 
            WHEN ur.file_size > 0 THEN (COALESCE(SUM(uc.chunk_size), 0)::NUMERIC / ur.file_size * 100)
            ELSE 0
        END as progress_percentage
    FROM upload_requests ur
    LEFT JOIN upload_chunks uc ON ur.id = uc.upload_id AND uc.verified = true
    WHERE ur.id = upload_uuid
    GROUP BY ur.id, ur.file_size, ur.options;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired uploads
CREATE OR REPLACE FUNCTION cleanup_expired_uploads()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER := 0;
BEGIN
    -- Delete expired upload requests and their chunks
    WITH expired_uploads AS (
        DELETE FROM upload_requests 
        WHERE expires_at IS NOT NULL 
        AND expires_at < NOW() 
        AND status NOT IN ('completed', 'processed')
        RETURNING id
    )
    SELECT COUNT(*) INTO cleanup_count FROM expired_uploads;
    
    -- Log cleanup activity
    INSERT INTO upload_statistics (
        period_start,
        period_end,
        total_uploads,
        cancelled_uploads
    ) VALUES (
        NOW() - INTERVAL '1 hour',
        NOW(),
        0,
        cleanup_count
    ) ON CONFLICT (period_start, period_end) DO UPDATE SET
        cancelled_uploads = upload_statistics.cancelled_uploads + cleanup_count;
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update storage provider usage
CREATE OR REPLACE FUNCTION update_storage_usage(provider_name VARCHAR, bytes_change BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE storage_providers 
    SET 
        storage_used_bytes = GREATEST(0, storage_used_bytes + bytes_change),
        updated_at = NOW()
    WHERE name = provider_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get next processing job
CREATE OR REPLACE FUNCTION get_next_processing_job()
RETURNS TABLE(
    job_id UUID,
    upload_id UUID,
    processor_type VARCHAR,
    priority INTEGER,
    config JSONB
) AS $$
BEGIN
    RETURN QUERY
    UPDATE processing_jobs 
    SET 
        status = 'running',
        started_at = NOW()
    WHERE id = (
        SELECT pj.id
        FROM processing_jobs pj
        JOIN upload_requests ur ON pj.upload_id = ur.id
        WHERE pj.status = 'queued'
        AND ur.status IN ('completed', 'processing')
        AND pj.retry_count < pj.max_retries
        ORDER BY pj.priority DESC, pj.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING id, upload_id, processor_type, priority, config;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries

-- View for upload progress monitoring
CREATE OR REPLACE VIEW upload_progress_summary AS
SELECT 
    ur.id,
    ur.filename,
    ur.uploaded_by,
    ur.status,
    ur.file_size,
    COALESCE(chunk_stats.uploaded_bytes, 0) as uploaded_bytes,
    CASE 
        WHEN ur.file_size > 0 THEN (COALESCE(chunk_stats.uploaded_bytes, 0)::NUMERIC / ur.file_size * 100)
        ELSE 0
    END as progress_percentage,
    COALESCE(chunk_stats.chunk_count, 0) as chunks_uploaded,
    CEIL(ur.file_size::NUMERIC / COALESCE((ur.options->>'maxChunkSize')::INTEGER, 1048576))::INTEGER as total_chunks,
    ur.created_at,
    ur.updated_at,
    ur.expires_at
FROM upload_requests ur
LEFT JOIN (
    SELECT 
        upload_id,
        COUNT(*) as chunk_count,
        SUM(chunk_size) as uploaded_bytes
    FROM upload_chunks 
    WHERE verified = true
    GROUP BY upload_id
) chunk_stats ON ur.id = chunk_stats.upload_id
WHERE ur.status NOT IN ('deleted', 'cancelled');

-- View for processing queue status
CREATE OR REPLACE VIEW processing_queue_summary AS
SELECT 
    pj.processor_type,
    COUNT(*) FILTER (WHERE pj.status = 'queued') as queued_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'running') as running_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE pj.status = 'failed') as failed_jobs,
    AVG(pj.progress) FILTER (WHERE pj.status = 'running') as avg_progress,
    AVG(EXTRACT(EPOCH FROM (pj.completed_at - pj.started_at)) * 1000) FILTER (WHERE pj.status = 'completed') as avg_processing_time_ms
FROM processing_jobs pj
GROUP BY pj.processor_type;

-- View for storage provider health
CREATE OR REPLACE VIEW storage_provider_health AS
SELECT 
    sp.name,
    sp.backend,
    sp.health_status,
    sp.is_active,
    sp.storage_used_bytes,
    sp.storage_quota_bytes,
    CASE 
        WHEN sp.storage_quota_bytes > 0 THEN (sp.storage_used_bytes::NUMERIC / sp.storage_quota_bytes * 100)
        ELSE 0
    END as usage_percentage,
    sp.last_health_check,
    NOW() - sp.last_health_check as time_since_check
FROM storage_providers sp
WHERE sp.is_active = true;

-- Insert default storage provider (local filesystem)
INSERT INTO storage_providers (
    name, 
    backend, 
    config,
    is_active,
    is_default,
    storage_quota_bytes,
    max_file_size_bytes
) VALUES (
    'Default Local Storage',
    'local_filesystem',
    '{"basePath": "/var/uploads", "createDirectories": true, "permissions": "0755"}',
    true,
    true,
    107374182400, -- 100GB
    10737418240   -- 10GB max file
) ON CONFLICT (name) DO NOTHING;

-- Insert default file processors
INSERT INTO file_processors (
    name,
    processor_type,
    version,
    supported_mime_types,
    supported_extensions,
    max_file_size_bytes,
    config,
    is_active,
    priority
) VALUES 
(
    'Basic Virus Scanner',
    'virus_scan',
    '1.0.0',
    ARRAY['*/*'],
    ARRAY['*'],
    1073741824, -- 1GB
    '{"scanTimeout": 30000, "quarantineOnDetection": true}',
    true,
    1000
),
(
    'Image Metadata Extractor',
    'metadata_extraction',
    '1.0.0',
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'],
    ARRAY['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'],
    104857600, -- 100MB
    '{"extractExif": true, "extractIptc": true, "extractXmp": true}',
    true,
    900
),
(
    'Document Metadata Extractor',
    'metadata_extraction',
    '1.0.0',
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ARRAY['pdf', 'doc', 'docx'],
    104857600, -- 100MB
    '{"extractText": true, "extractMetadata": true, "extractImages": false}',
    true,
    800
),
(
    'Thumbnail Generator',
    'thumbnail_generation',
    '1.0.0',
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],
    ARRAY['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    52428800, -- 50MB
    '{"sizes": [150, 300, 800], "format": "jpeg", "quality": 85}',
    true,
    700
)
ON CONFLICT (name) DO NOTHING;

-- Insert default validation rules
INSERT INTO upload_validation_rules (
    name,
    rule_type,
    rule_config,
    error_message,
    severity,
    applies_to_categories,
    is_active,
    priority
) VALUES 
(
    'Block Executable Files',
    'file_extension',
    '{"blockedExtensions": ["exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js"]}',
    'Executable files are not allowed for security reasons',
    'error',
    ARRAY['user_content', 'document_library'],
    true,
    1000
),
(
    'File Size Limit - General',
    'file_size',
    '{"maxSizeBytes": 104857600}',
    'File size must not exceed 100MB',
    'error',
    ARRAY['user_content'],
    true,
    900
),
(
    'File Size Limit - Admin Import',
    'file_size',
    '{"maxSizeBytes": 1073741824}',
    'Admin import files must not exceed 1GB',
    'error',
    ARRAY['admin_import', 'bulk_operation'],
    true,
    800
)
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE upload_requests IS 'Core table for tracking all file upload requests with metadata and processing status';
COMMENT ON TABLE upload_chunks IS 'Stores individual chunks for multi-part uploads with integrity verification';
COMMENT ON TABLE processing_jobs IS 'Queue and tracking for file processing tasks like virus scanning and thumbnail generation';
COMMENT ON TABLE storage_providers IS 'Configuration for different storage backends (local, S3, GCS, etc.)';
COMMENT ON TABLE file_processors IS 'Registry of available file processors with capabilities and configuration';
COMMENT ON TABLE upload_validation_rules IS 'Configurable validation rules for upload requests';
COMMENT ON TABLE upload_statistics IS 'Aggregated statistics and analytics for upload activity';

COMMENT ON COLUMN upload_requests.metadata IS 'Flexible metadata storage including upload context, business metadata, and custom fields';
COMMENT ON COLUMN upload_requests.options IS 'Upload-specific options and configuration including validation rules and processing settings';
COMMENT ON COLUMN upload_requests.processing_pipeline IS 'Array of processor types to run on this upload';
COMMENT ON COLUMN upload_chunks.checksum IS 'SHA-256 checksum for chunk integrity verification';
COMMENT ON COLUMN processing_jobs.config IS 'Processor-specific configuration and parameters';
COMMENT ON COLUMN storage_providers.credentials_encrypted IS 'Encrypted storage provider credentials and API keys';
COMMENT ON COLUMN upload_validation_rules.rule_config IS 'Rule-specific configuration parameters';

COMMENT ON VIEW upload_progress_summary IS 'Real-time view of upload progress with chunk completion status';
COMMENT ON VIEW processing_queue_summary IS 'Summary of processing queue status by processor type';
COMMENT ON VIEW storage_provider_health IS 'Health and usage monitoring for storage providers';

COMMENT ON FUNCTION calculate_upload_progress IS 'Calculate detailed progress information for a specific upload';
COMMENT ON FUNCTION cleanup_expired_uploads IS 'Remove expired uploads and return count of cleaned items';
COMMENT ON FUNCTION get_next_processing_job IS 'Thread-safe function to claim next processing job from queue';