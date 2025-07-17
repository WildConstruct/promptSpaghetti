-- Version Export Schema
-- Implements comprehensive version export system with multiple formats and customization options

-- Export templates and configurations
CREATE TABLE export_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template configuration
    export_format VARCHAR(50) NOT NULL CHECK (export_format IN ('json', 'yaml', 'xml', 'csv', 'markdown', 'pdf', 'html', 'zip')),
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('full', 'summary', 'diff', 'custom')),
    
    -- Template settings
    include_metadata BOOLEAN DEFAULT TRUE,
    include_attribution BOOLEAN DEFAULT TRUE,
    include_history BOOLEAN DEFAULT FALSE,
    include_branching BOOLEAN DEFAULT FALSE,
    include_comments BOOLEAN DEFAULT FALSE,
    include_attachments BOOLEAN DEFAULT FALSE,
    
    -- Format-specific options
    format_options JSONB DEFAULT '{}',
    
    -- Filtering options
    filter_options JSONB DEFAULT '{}',
    
    -- Template content
    template_content TEXT,
    template_schema JSONB,
    
    -- Template metadata
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    is_system_template BOOLEAN DEFAULT FALSE,
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_template_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_template_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraints
    CONSTRAINT uk_template_project_name UNIQUE (project_id, name)
);

-- Export jobs and history
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    template_id UUID,
    
    -- Export configuration
    export_format VARCHAR(50) NOT NULL,
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('version', 'branch', 'comparison', 'full_project')),
    export_scope JSONB NOT NULL DEFAULT '{}',
    
    -- Source data
    source_snapshot_id UUID,
    source_branch_id UUID,
    comparison_snapshot_id UUID,
    
    -- Export options
    export_options JSONB DEFAULT '{}',
    custom_filters JSONB DEFAULT '{}',
    
    -- Job status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Job results
    output_file_path TEXT,
    output_file_size BIGINT,
    output_file_hash VARCHAR(64),
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Job metadata
    initiated_by UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    processing_log TEXT,
    
    -- Performance metrics
    processing_duration INTEGER,
    memory_usage BIGINT,
    cpu_usage DECIMAL(5,2),
    
    -- Foreign key constraints
    CONSTRAINT fk_export_job_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_export_job_template FOREIGN KEY (template_id) REFERENCES export_templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_export_job_source_snapshot FOREIGN KEY (source_snapshot_id) REFERENCES version_snapshots(id) ON DELETE SET NULL,
    CONSTRAINT fk_export_job_source_branch FOREIGN KEY (source_branch_id) REFERENCES project_branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_export_job_comparison_snapshot FOREIGN KEY (comparison_snapshot_id) REFERENCES version_snapshots(id) ON DELETE SET NULL,
    CONSTRAINT fk_export_job_initiated_by FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Export schedules and automation
CREATE TABLE export_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    template_id UUID NOT NULL,
    
    -- Schedule configuration
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    
    -- Schedule timing
    schedule_expression VARCHAR(100) NOT NULL, -- Cron expression
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Export configuration
    export_options JSONB DEFAULT '{}',
    notification_options JSONB DEFAULT '{}',
    
    -- Schedule metadata
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Schedule statistics
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    
    -- Foreign key constraints
    CONSTRAINT fk_schedule_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_template FOREIGN KEY (template_id) REFERENCES export_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Export shares and access control
CREATE TABLE export_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_job_id UUID NOT NULL,
    
    -- Share configuration
    share_token VARCHAR(255) UNIQUE NOT NULL,
    share_name VARCHAR(255),
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    
    -- Access control
    allowed_downloads INTEGER DEFAULT -1, -- -1 for unlimited
    download_count INTEGER DEFAULT 0,
    allowed_ips TEXT[], -- Array of allowed IP addresses/ranges
    
    -- Share metadata
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Share statistics
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    
    -- Foreign key constraints
    CONSTRAINT fk_share_export_job FOREIGN KEY (export_job_id) REFERENCES export_jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_share_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Export analytics and usage tracking
CREATE TABLE export_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    export_job_id UUID,
    template_id UUID,
    
    -- Analytics data
    export_format VARCHAR(50) NOT NULL,
    export_size BIGINT,
    processing_time INTEGER,
    download_count INTEGER DEFAULT 0,
    
    -- User analytics
    user_id UUID,
    user_agent TEXT,
    ip_address INET,
    
    -- Temporal data
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_bucket DATE GENERATED ALWAYS AS (DATE(exported_at)) STORED,
    hour_bucket TIMESTAMP GENERATED ALWAYS AS (DATE_TRUNC('hour', exported_at)) STORED,
    
    -- Foreign key constraints
    CONSTRAINT fk_analytics_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_analytics_export_job FOREIGN KEY (export_job_id) REFERENCES export_jobs(id) ON DELETE SET NULL,
    CONSTRAINT fk_analytics_template FOREIGN KEY (template_id) REFERENCES export_templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Export format definitions
CREATE TABLE export_format_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    format_name VARCHAR(50) UNIQUE NOT NULL,
    
    -- Format specification
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    file_extension VARCHAR(10) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Format capabilities
    supports_metadata BOOLEAN DEFAULT TRUE,
    supports_binary_data BOOLEAN DEFAULT FALSE,
    supports_compression BOOLEAN DEFAULT FALSE,
    supports_encryption BOOLEAN DEFAULT FALSE,
    max_file_size BIGINT,
    
    -- Format configuration
    default_options JSONB DEFAULT '{}',
    validation_schema JSONB,
    
    -- Format status
    is_enabled BOOLEAN DEFAULT TRUE,
    is_system_format BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_export_templates_project_id ON export_templates(project_id);
CREATE INDEX idx_export_templates_created_by ON export_templates(created_by);
CREATE INDEX idx_export_templates_format ON export_templates(export_format);
CREATE INDEX idx_export_templates_public ON export_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_export_templates_usage ON export_templates(usage_count DESC);

CREATE INDEX idx_export_jobs_project_id ON export_jobs(project_id);
CREATE INDEX idx_export_jobs_template_id ON export_jobs(template_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_export_jobs_initiated_by ON export_jobs(initiated_by);
CREATE INDEX idx_export_jobs_started_at ON export_jobs(started_at DESC);
CREATE INDEX idx_export_jobs_expires_at ON export_jobs(expires_at);

CREATE INDEX idx_export_schedules_project_id ON export_schedules(project_id);
CREATE INDEX idx_export_schedules_template_id ON export_schedules(template_id);
CREATE INDEX idx_export_schedules_enabled ON export_schedules(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX idx_export_schedules_next_run ON export_schedules(next_run_at) WHERE is_enabled = TRUE;

CREATE INDEX idx_export_shares_export_job_id ON export_shares(export_job_id);
CREATE INDEX idx_export_shares_token ON export_shares(share_token);
CREATE INDEX idx_export_shares_active ON export_shares(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_export_shares_expires_at ON export_shares(expires_at);

CREATE INDEX idx_export_analytics_project_id ON export_analytics(project_id);
CREATE INDEX idx_export_analytics_template_id ON export_analytics(template_id);
CREATE INDEX idx_export_analytics_format ON export_analytics(export_format);
CREATE INDEX idx_export_analytics_date_bucket ON export_analytics(date_bucket);
CREATE INDEX idx_export_analytics_hour_bucket ON export_analytics(hour_bucket);

-- Composite indexes for common queries
CREATE INDEX idx_export_jobs_project_status ON export_jobs(project_id, status);
CREATE INDEX idx_export_templates_project_format ON export_templates(project_id, export_format);
CREATE INDEX idx_export_analytics_project_date ON export_analytics(project_id, date_bucket);

-- GIN indexes for JSONB columns
CREATE INDEX idx_export_templates_format_options_gin ON export_templates USING GIN (format_options);
CREATE INDEX idx_export_templates_filter_options_gin ON export_templates USING GIN (filter_options);
CREATE INDEX idx_export_jobs_export_scope_gin ON export_jobs USING GIN (export_scope);
CREATE INDEX idx_export_jobs_export_options_gin ON export_jobs USING GIN (export_options);
CREATE INDEX idx_export_schedules_export_options_gin ON export_schedules USING GIN (export_options);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_export_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_export_templates_updated_at
    BEFORE UPDATE ON export_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_export_templates_updated_at();

CREATE OR REPLACE FUNCTION update_export_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_export_schedules_updated_at
    BEFORE UPDATE ON export_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_export_schedules_updated_at();

-- Function to update template usage statistics
CREATE OR REPLACE FUNCTION update_template_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE export_templates 
    SET 
        usage_count = usage_count + 1,
        last_used_at = CURRENT_TIMESTAMP
    WHERE id = NEW.template_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_usage_stats
    AFTER INSERT ON export_jobs
    FOR EACH ROW
    WHEN (NEW.template_id IS NOT NULL)
    EXECUTE FUNCTION update_template_usage_stats();

-- Function to update schedule statistics
CREATE OR REPLACE FUNCTION update_schedule_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total runs
    UPDATE export_schedules 
    SET total_runs = total_runs + 1
    WHERE id = (
        SELECT s.id FROM export_schedules s
        JOIN export_templates t ON s.template_id = t.id
        WHERE t.id = NEW.template_id
        LIMIT 1
    );
    
    -- Update successful/failed runs based on job status
    IF NEW.status = 'completed' THEN
        UPDATE export_schedules 
        SET successful_runs = successful_runs + 1
        WHERE id = (
            SELECT s.id FROM export_schedules s
            JOIN export_templates t ON s.template_id = t.id
            WHERE t.id = NEW.template_id
            LIMIT 1
        );
    ELSIF NEW.status = 'failed' THEN
        UPDATE export_schedules 
        SET failed_runs = failed_runs + 1
        WHERE id = (
            SELECT s.id FROM export_schedules s
            JOIN export_templates t ON s.template_id = t.id
            WHERE t.id = NEW.template_id
            LIMIT 1
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schedule_stats
    AFTER UPDATE ON export_jobs
    FOR EACH ROW
    WHEN (OLD.status != NEW.status AND NEW.template_id IS NOT NULL)
    EXECUTE FUNCTION update_schedule_stats();

-- Insert default export format definitions
INSERT INTO export_format_definitions (format_name, display_name, description, file_extension, mime_type, supports_metadata, supports_binary_data, supports_compression, default_options) VALUES
('json', 'JSON', 'JavaScript Object Notation - structured data format', 'json', 'application/json', TRUE, FALSE, TRUE, '{"pretty": true, "include_schema": false}'),
('yaml', 'YAML', 'YAML Ain''t Markup Language - human-readable data format', 'yaml', 'application/x-yaml', TRUE, FALSE, TRUE, '{"include_comments": true, "flow_style": false}'),
('xml', 'XML', 'Extensible Markup Language - structured markup format', 'xml', 'application/xml', TRUE, FALSE, TRUE, '{"pretty": true, "include_schema": true}'),
('csv', 'CSV', 'Comma-Separated Values - tabular data format', 'csv', 'text/csv', FALSE, FALSE, TRUE, '{"delimiter": ",", "include_headers": true}'),
('markdown', 'Markdown', 'Markdown - human-readable markup format', 'md', 'text/markdown', TRUE, FALSE, TRUE, '{"include_toc": true, "format": "github"}'),
('pdf', 'PDF', 'Portable Document Format - formatted document', 'pdf', 'application/pdf', TRUE, TRUE, FALSE, '{"page_size": "A4", "include_images": true}'),
('html', 'HTML', 'HyperText Markup Language - web format', 'html', 'text/html', TRUE, TRUE, TRUE, '{"include_css": true, "standalone": true}'),
('zip', 'ZIP Archive', 'ZIP compressed archive - multiple files', 'zip', 'application/zip', TRUE, TRUE, TRUE, '{"compression_level": 6, "include_metadata": true}');

-- Comments for documentation
COMMENT ON TABLE export_templates IS 'Defines reusable export templates with customizable formats and options';
COMMENT ON TABLE export_jobs IS 'Tracks export job execution with status, progress, and results';
COMMENT ON TABLE export_schedules IS 'Manages automated export scheduling with cron expressions';
COMMENT ON TABLE export_shares IS 'Handles secure sharing of exported files with access control';
COMMENT ON TABLE export_analytics IS 'Collects usage analytics and metrics for export operations';
COMMENT ON TABLE export_format_definitions IS 'Defines available export formats with capabilities and defaults';

COMMENT ON COLUMN export_templates.template_type IS 'Type of export: full (complete data), summary (overview), diff (changes), custom (user-defined)';
COMMENT ON COLUMN export_templates.format_options IS 'Format-specific configuration options as JSONB';
COMMENT ON COLUMN export_templates.filter_options IS 'Data filtering and selection options as JSONB';

COMMENT ON COLUMN export_jobs.export_type IS 'Scope of export: version (single snapshot), branch (branch data), comparison (diff), full_project (everything)';
COMMENT ON COLUMN export_jobs.export_scope IS 'Defines what data to include in the export';
COMMENT ON COLUMN export_jobs.progress_percentage IS 'Export job progress from 0-100%';

COMMENT ON COLUMN export_schedules.schedule_expression IS 'Cron expression for automated export timing';
COMMENT ON COLUMN export_schedules.notification_options IS 'Configuration for notifications on export completion';

COMMENT ON COLUMN export_shares.share_token IS 'Unique token for secure file sharing';
COMMENT ON COLUMN export_shares.allowed_downloads IS 'Maximum number of downloads allowed (-1 for unlimited)';
COMMENT ON COLUMN export_shares.allowed_ips IS 'Array of IP addresses/ranges allowed to access the share';

COMMENT ON COLUMN export_format_definitions.supports_metadata IS 'Whether format can include metadata and attribution';
COMMENT ON COLUMN export_format_definitions.supports_binary_data IS 'Whether format can include binary attachments';
COMMENT ON COLUMN export_format_definitions.max_file_size IS 'Maximum file size limit for this format in bytes';