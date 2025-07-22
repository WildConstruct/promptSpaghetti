-- Operation Types System Migration
-- Creates comprehensive system for managing operation types and executions

-- Main operation types table
CREATE TABLE IF NOT EXISTS operation_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(100),
    version VARCHAR(20) NOT NULL,
    
    -- Operation characteristics
    capabilities JSONB NOT NULL DEFAULT '[]',
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    estimated_duration INTEGER NOT NULL, -- milliseconds
    resource_requirements JSONB NOT NULL DEFAULT '{}',
    
    -- Parameters and validation
    parameters JSONB NOT NULL DEFAULT '[]',
    required_permissions JSONB NOT NULL DEFAULT '[]',
    supported_targets JSONB NOT NULL DEFAULT '[]',
    
    -- Execution configuration
    execution_mode JSONB NOT NULL DEFAULT '[]',
    batch_size INTEGER,
    max_concurrency INTEGER DEFAULT 1,
    timeout_ms INTEGER,
    
    -- UI configuration
    ui_config JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    
    -- Status and metadata
    is_enabled BOOLEAN DEFAULT TRUE,
    is_deprecated BOOLEAN DEFAULT FALSE,
    deprecation_reason TEXT,
    replaced_by VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    tags JSONB DEFAULT '[]',
    
    -- Constraints
    CHECK (LENGTH(name) > 0),
    CHECK (LENGTH(display_name) > 0),
    CHECK (estimated_duration > 0),
    CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

-- Operation executions table for tracking execution instances
CREATE TABLE IF NOT EXISTS operation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type_id UUID NOT NULL REFERENCES operation_types(id) ON DELETE RESTRICT,
    operation_name VARCHAR(255) NOT NULL,
    
    -- Execution parameters and context
    parameters JSONB NOT NULL DEFAULT '{}',
    executed_by UUID NOT NULL REFERENCES users(id),
    execution_context JSONB DEFAULT '{}',
    
    -- Execution status and timing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled', 'timeout')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Progress and results
    total_targets INTEGER DEFAULT 0,
    processed_targets INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0.0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_step VARCHAR(255),
    total_steps INTEGER DEFAULT 1,
    completed_steps INTEGER DEFAULT 0,
    estimated_time_remaining INTEGER, -- milliseconds
    
    -- Output and logging
    results JSONB DEFAULT '[]',
    logs JSONB DEFAULT '[]',
    errors JSONB DEFAULT '[]',
    
    -- Resource usage tracking
    resource_usage JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CHECK (processed_targets <= total_targets),
    CHECK (success_count + error_count + skipped_count <= processed_targets)
);

-- Operation execution results table for detailed results
CREATE TABLE IF NOT EXISTS operation_execution_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES operation_executions(id) ON DELETE CASCADE,
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    
    -- Result details
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'skipped', 'warning')),
    message TEXT,
    result_data JSONB DEFAULT '{}',
    
    -- Timing and context
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_time_ms INTEGER,
    
    -- Error details (if applicable)
    error_code VARCHAR(100),
    error_details JSONB,
    is_recoverable BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    sequence_number INTEGER,
    batch_id UUID,
    retry_count INTEGER DEFAULT 0
);

-- Operation templates for commonly used operations
CREATE TABLE IF NOT EXISTS operation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type_id UUID NOT NULL REFERENCES operation_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template configuration
    parameter_values JSONB NOT NULL DEFAULT '{}',
    parameter_overrides JSONB DEFAULT '{}',
    
    -- Access and visibility
    created_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    is_system_template BOOLEAN DEFAULT FALSE,
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_used_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for user templates
    UNIQUE(operation_type_id, name, created_by)
);

-- Operation schedules for automated execution
CREATE TABLE IF NOT EXISTS operation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type_id UUID NOT NULL REFERENCES operation_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Schedule configuration
    parameters JSONB NOT NULL DEFAULT '{}',
    cron_expression VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    
    -- Schedule status
    is_enabled BOOLEAN DEFAULT TRUE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution limits
    max_concurrent_executions INTEGER DEFAULT 1,
    execution_timeout_ms INTEGER,
    retry_on_failure BOOLEAN DEFAULT FALSE,
    max_retries INTEGER DEFAULT 0,
    
    -- Ownership and access
    created_by UUID NOT NULL REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operation audit log for compliance and debugging
CREATE TABLE IF NOT EXISTS operation_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Operation context
    operation_type_id UUID REFERENCES operation_types(id),
    execution_id UUID REFERENCES operation_executions(id),
    
    -- Audit details
    action VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(50) DEFAULT 'user',
    
    -- Context and data
    details JSONB DEFAULT '{}',
    affected_resources JSONB DEFAULT '[]',
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CHECK (LENGTH(action) > 0)
);

-- Indexes for optimal query performance

-- Operation types indexes
CREATE INDEX IF NOT EXISTS idx_operation_types_category 
ON operation_types(category);

CREATE INDEX IF NOT EXISTS idx_operation_types_enabled 
ON operation_types(is_enabled, is_deprecated);

CREATE INDEX IF NOT EXISTS idx_operation_types_name 
ON operation_types(name);

CREATE INDEX IF NOT EXISTS idx_operation_types_tags 
ON operation_types USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_operation_types_sort 
ON operation_types(category, sort_order, display_name);

-- Operation executions indexes
CREATE INDEX IF NOT EXISTS idx_operation_executions_type 
ON operation_executions(operation_type_id);

CREATE INDEX IF NOT EXISTS idx_operation_executions_status 
ON operation_executions(status, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_operation_executions_user 
ON operation_executions(executed_by, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_operation_executions_start_time 
ON operation_executions(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_operation_executions_duration 
ON operation_executions(duration_ms DESC) WHERE duration_ms IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_operation_executions_progress 
ON operation_executions(status, progress_percentage);

-- Operation execution results indexes
CREATE INDEX IF NOT EXISTS idx_operation_execution_results_execution 
ON operation_execution_results(execution_id, sequence_number);

CREATE INDEX IF NOT EXISTS idx_operation_execution_results_target 
ON operation_execution_results(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_operation_execution_results_status 
ON operation_execution_results(status, processed_at);

CREATE INDEX IF NOT EXISTS idx_operation_execution_results_batch 
ON operation_execution_results(batch_id) WHERE batch_id IS NOT NULL;

-- Operation templates indexes
CREATE INDEX IF NOT EXISTS idx_operation_templates_type 
ON operation_templates(operation_type_id);

CREATE INDEX IF NOT EXISTS idx_operation_templates_created_by 
ON operation_templates(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_operation_templates_public 
ON operation_templates(is_public, usage_count DESC) WHERE is_public = TRUE;

-- Operation schedules indexes
CREATE INDEX IF NOT EXISTS idx_operation_schedules_type 
ON operation_schedules(operation_type_id);

CREATE INDEX IF NOT EXISTS idx_operation_schedules_next_run 
ON operation_schedules(next_run_at) WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_operation_schedules_created_by 
ON operation_schedules(created_by);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_operation_audit_log_operation_type 
ON operation_audit_log(operation_type_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_operation_audit_log_execution 
ON operation_audit_log(execution_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_operation_audit_log_actor 
ON operation_audit_log(actor_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_operation_audit_log_timestamp 
ON operation_audit_log(timestamp DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_operation_types_capabilities_gin 
ON operation_types USING GIN(capabilities);

CREATE INDEX IF NOT EXISTS idx_operation_types_parameters_gin 
ON operation_types USING GIN(parameters);

CREATE INDEX IF NOT EXISTS idx_operation_executions_parameters_gin 
ON operation_executions USING GIN(parameters);

CREATE INDEX IF NOT EXISTS idx_operation_executions_results_gin 
ON operation_executions USING GIN(results);

CREATE INDEX IF NOT EXISTS idx_operation_audit_log_details_gin 
ON operation_audit_log USING GIN(details);

-- Views for common operation queries

-- Operation type summary view
CREATE OR REPLACE VIEW operation_type_summary AS
SELECT 
    ot.id,
    ot.name,
    ot.display_name,
    ot.description,
    ot.category,
    ot.risk_level,
    ot.is_enabled,
    ot.is_deprecated,
    ot.created_at,
    u.email as created_by_email,
    
    -- Execution statistics
    COALESCE(exec_stats.total_executions, 0) as total_executions,
    COALESCE(exec_stats.successful_executions, 0) as successful_executions,
    COALESCE(exec_stats.failed_executions, 0) as failed_executions,
    COALESCE(exec_stats.avg_duration_ms, 0) as avg_duration_ms,
    exec_stats.last_execution_at,
    
    -- Template statistics
    COALESCE(template_stats.template_count, 0) as template_count,
    
    -- Schedule statistics
    COALESCE(schedule_stats.schedule_count, 0) as schedule_count,
    COALESCE(schedule_stats.active_schedules, 0) as active_schedules
    
FROM operation_types ot
JOIN users u ON ot.created_by = u.id
LEFT JOIN (
    SELECT 
        operation_type_id,
        COUNT(*) as total_executions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_executions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions,
        AVG(duration_ms) as avg_duration_ms,
        MAX(start_time) as last_execution_at
    FROM operation_executions
    GROUP BY operation_type_id
) exec_stats ON ot.id = exec_stats.operation_type_id
LEFT JOIN (
    SELECT 
        operation_type_id,
        COUNT(*) as template_count
    FROM operation_templates
    GROUP BY operation_type_id
) template_stats ON ot.id = template_stats.operation_type_id
LEFT JOIN (
    SELECT 
        operation_type_id,
        COUNT(*) as schedule_count,
        SUM(CASE WHEN is_enabled THEN 1 ELSE 0 END) as active_schedules
    FROM operation_schedules
    GROUP BY operation_type_id
) schedule_stats ON ot.id = schedule_stats.operation_type_id;

-- Execution status view
CREATE OR REPLACE VIEW operation_execution_status AS
SELECT 
    oe.id,
    oe.operation_name,
    ot.display_name as operation_type_name,
    ot.category,
    oe.status,
    oe.progress_percentage,
    oe.current_step,
    oe.start_time,
    oe.end_time,
    oe.duration_ms,
    oe.total_targets,
    oe.processed_targets,
    oe.success_count,
    oe.error_count,
    oe.skipped_count,
    u.email as executed_by_email,
    
    -- Calculated fields
    CASE 
        WHEN oe.status = 'running' AND oe.estimated_time_remaining IS NOT NULL 
        THEN oe.start_time + (oe.estimated_time_remaining * INTERVAL '1 millisecond')
        ELSE NULL 
    END as estimated_completion_time,
    
    CASE 
        WHEN oe.total_targets > 0 
        THEN ROUND((oe.processed_targets::DECIMAL / oe.total_targets * 100), 2)
        ELSE oe.progress_percentage 
    END as calculated_progress,
    
    CASE 
        WHEN oe.status = 'running' 
        THEN EXTRACT(EPOCH FROM (NOW() - oe.start_time)) * 1000
        ELSE oe.duration_ms 
    END as current_duration_ms
    
FROM operation_executions oe
JOIN operation_types ot ON oe.operation_type_id = ot.id
JOIN users u ON oe.executed_by = u.id;

-- Popular operations view
CREATE OR REPLACE VIEW popular_operations AS
SELECT 
    ot.id,
    ot.name,
    ot.display_name,
    ot.category,
    ot.risk_level,
    
    -- Usage statistics
    COUNT(oe.id) as execution_count,
    COUNT(DISTINCT oe.executed_by) as unique_users,
    COUNT(CASE WHEN oe.status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN oe.status = 'failed' THEN 1 END) as failed_executions,
    
    -- Recent usage
    COUNT(CASE WHEN oe.start_time > NOW() - INTERVAL '7 days' THEN 1 END) as executions_last_7_days,
    COUNT(CASE WHEN oe.start_time > NOW() - INTERVAL '30 days' THEN 1 END) as executions_last_30_days,
    
    -- Performance metrics
    AVG(oe.duration_ms) as avg_duration_ms,
    MAX(oe.start_time) as last_execution_at,
    
    -- Success rate
    CASE 
        WHEN COUNT(oe.id) > 0 
        THEN ROUND((COUNT(CASE WHEN oe.status = 'completed' THEN 1 END)::DECIMAL / COUNT(oe.id) * 100), 2)
        ELSE 0 
    END as success_rate_percentage
    
FROM operation_types ot
LEFT JOIN operation_executions oe ON ot.id = oe.operation_type_id
WHERE ot.is_enabled = TRUE AND ot.is_deprecated = FALSE
GROUP BY ot.id, ot.name, ot.display_name, ot.category, ot.risk_level
ORDER BY execution_count DESC, executions_last_30_days DESC;

-- Functions for operation management

-- Function to update operation execution progress
CREATE OR REPLACE FUNCTION update_operation_progress(
    p_execution_id UUID,
    p_progress_percentage DECIMAL,
    p_current_step TEXT DEFAULT NULL,
    p_completed_steps INTEGER DEFAULT NULL,
    p_processed_targets INTEGER DEFAULT NULL,
    p_success_count INTEGER DEFAULT NULL,
    p_error_count INTEGER DEFAULT NULL,
    p_skipped_count INTEGER DEFAULT NULL,
    p_estimated_time_remaining INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE operation_executions 
    SET 
        progress_percentage = p_progress_percentage,
        current_step = COALESCE(p_current_step, current_step),
        completed_steps = COALESCE(p_completed_steps, completed_steps),
        processed_targets = COALESCE(p_processed_targets, processed_targets),
        success_count = COALESCE(p_success_count, success_count),
        error_count = COALESCE(p_error_count, error_count),
        skipped_count = COALESCE(p_skipped_count, skipped_count),
        estimated_time_remaining = p_estimated_time_remaining,
        updated_at = NOW()
    WHERE id = p_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete operation execution
CREATE OR REPLACE FUNCTION complete_operation_execution(
    p_execution_id UUID,
    p_status VARCHAR(20),
    p_final_results JSONB DEFAULT NULL,
    p_resource_usage JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    execution_start TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT start_time INTO execution_start 
    FROM operation_executions 
    WHERE id = p_execution_id;
    
    UPDATE operation_executions 
    SET 
        status = p_status,
        end_time = NOW(),
        duration_ms = EXTRACT(EPOCH FROM (NOW() - execution_start)) * 1000,
        progress_percentage = CASE WHEN p_status = 'completed' THEN 100.0 ELSE progress_percentage END,
        results = COALESCE(p_final_results, results),
        resource_usage = COALESCE(p_resource_usage, resource_usage),
        updated_at = NOW()
    WHERE id = p_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old operation execution data
CREATE OR REPLACE FUNCTION cleanup_old_operation_data(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old execution results first (foreign key constraint)
    DELETE FROM operation_execution_results 
    WHERE processed_at < cutoff_date;
    
    -- Delete old executions
    DELETE FROM operation_executions 
    WHERE start_time < cutoff_date 
    AND status IN ('completed', 'failed', 'cancelled');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up audit logs older than retention period
    DELETE FROM operation_audit_log 
    WHERE timestamp < cutoff_date;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic maintenance

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_operation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operation_types_updated_at_trigger
    BEFORE UPDATE ON operation_types
    FOR EACH ROW
    EXECUTE FUNCTION update_operation_updated_at();

CREATE TRIGGER operation_executions_updated_at_trigger
    BEFORE UPDATE ON operation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_operation_updated_at();

CREATE TRIGGER operation_templates_updated_at_trigger
    BEFORE UPDATE ON operation_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_operation_updated_at();

CREATE TRIGGER operation_schedules_updated_at_trigger
    BEFORE UPDATE ON operation_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_operation_updated_at();

-- Insert default operation types
INSERT INTO operation_types (
    name, display_name, description, category, version, capabilities, risk_level,
    estimated_duration, resource_requirements, parameters, required_permissions,
    supported_targets, execution_mode, ui_config, created_by
) VALUES 
-- User Management Operations
(
    'bulk_user_update', 
    'Bulk User Update', 
    'Update multiple user accounts with specified changes',
    'user_management',
    '1.0.0',
    '[{"capability": "batch_processing", "description": "Process multiple users in batches"}]',
    'medium',
    300000, -- 5 minutes
    '{"cpuIntensive": false, "memoryIntensive": false, "databaseIntensive": true}',
    '[
        {
            "name": "userIds", 
            "displayName": "User IDs", 
            "description": "List of user IDs to update",
            "type": "array", 
            "required": true,
            "constraints": [{"type": "min", "value": 1, "message": "At least one user ID required"}],
            "validation": [],
            "inputType": "textarea"
        },
        {
            "name": "updates", 
            "displayName": "Updates", 
            "description": "Fields to update",
            "type": "object", 
            "required": true,
            "constraints": [],
            "validation": [],
            "inputType": "textarea"
        }
    ]',
    '["admin:users:update"]',
    '["users"]',
    '["batch", "background"]',
    '{"icon": "users", "color": "blue", "confirmationRequired": true, "showProgressBar": true, "allowCancel": true}',
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
),

-- Data Management Operations  
(
    'bulk_data_export',
    'Bulk Data Export',
    'Export large datasets with filtering and formatting options',
    'data_management',
    '1.0.0',
    '[{"capability": "large_dataset_export", "description": "Export large amounts of data efficiently"}]',
    'low',
    600000, -- 10 minutes
    '{"cpuIntensive": true, "memoryIntensive": true, "databaseIntensive": true}',
    '[
        {
            "name": "dataType", 
            "displayName": "Data Type", 
            "description": "Type of data to export",
            "type": "string", 
            "required": true,
            "constraints": [{"type": "enum", "value": ["users", "graphs", "activities"], "message": "Invalid data type"}],
            "validation": [],
            "inputType": "select",
            "options": [
                {"value": "users", "label": "Users"},
                {"value": "graphs", "label": "Graphs"},
                {"value": "activities", "label": "Activities"}
            ]
        },
        {
            "name": "format", 
            "displayName": "Export Format", 
            "description": "Output format for the export",
            "type": "string", 
            "required": true,
            "constraints": [{"type": "enum", "value": ["json", "csv", "xml"], "message": "Invalid format"}],
            "validation": [],
            "inputType": "radio",
            "options": [
                {"value": "json", "label": "JSON"},
                {"value": "csv", "label": "CSV"}, 
                {"value": "xml", "label": "XML"}
            ]
        }
    ]',
    '["admin:data:export"]',
    '["data_records"]',
    '["batch", "background"]',
    '{"icon": "download", "color": "green", "confirmationRequired": false, "showProgressBar": true, "allowCancel": true}',
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
),

-- System Maintenance Operations
(
    'cleanup_old_data',
    'Cleanup Old Data',
    'Remove old data based on retention policies',
    'system_maintenance',
    '1.0.0',
    '[{"capability": "data_cleanup", "description": "Safely remove old data with validation"}]',
    'high',
    1800000, -- 30 minutes
    '{"cpuIntensive": false, "memoryIntensive": false, "databaseIntensive": true}',
    '[
        {
            "name": "dataTypes", 
            "displayName": "Data Types", 
            "description": "Types of data to clean up",
            "type": "array", 
            "required": true,
            "constraints": [{"type": "min", "value": 1, "message": "Select at least one data type"}],
            "validation": [],
            "inputType": "multiselect",
            "options": [
                {"value": "sessions", "label": "Expired Sessions"},
                {"value": "logs", "label": "Old Log Files"},
                {"value": "temp_files", "label": "Temporary Files"}
            ]
        },
        {
            "name": "retentionDays", 
            "displayName": "Retention Days", 
            "description": "Number of days to retain data",
            "type": "number", 
            "required": true,
            "constraints": [
                {"type": "min", "value": 1, "message": "Must retain data for at least 1 day"},
                {"type": "max", "value": 3650, "message": "Cannot retain data for more than 10 years"}
            ],
            "validation": [],
            "inputType": "number",
            "defaultValue": 90
        }
    ]',
    '["admin:system:maintenance"]',
    '["system"]',
    '["scheduled", "background"]',
    '{"icon": "trash", "color": "red", "confirmationRequired": true, "confirmationMessage": "This will permanently delete old data. Are you sure?", "showProgressBar": true, "allowCancel": false}',
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
)
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE operation_types IS 'Defines available operation types with parameters and configuration';
COMMENT ON TABLE operation_executions IS 'Tracks individual operation execution instances';
COMMENT ON TABLE operation_execution_results IS 'Detailed results for each target in an operation';
COMMENT ON TABLE operation_templates IS 'Reusable operation templates with pre-configured parameters';
COMMENT ON TABLE operation_schedules IS 'Scheduled operations with cron-like scheduling';
COMMENT ON TABLE operation_audit_log IS 'Audit trail for all operation-related activities';

COMMENT ON VIEW operation_type_summary IS 'Summary of operation types with usage statistics';
COMMENT ON VIEW operation_execution_status IS 'Current status and progress of operation executions';
COMMENT ON VIEW popular_operations IS 'Most frequently used operations with success metrics';

COMMENT ON FUNCTION update_operation_progress(UUID, DECIMAL, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) IS 'Updates progress tracking for running operations';
COMMENT ON FUNCTION complete_operation_execution(UUID, VARCHAR, JSONB, JSONB) IS 'Marks an operation execution as completed with final results';
COMMENT ON FUNCTION cleanup_old_operation_data(INTEGER) IS 'Removes old operation execution data based on retention policy';