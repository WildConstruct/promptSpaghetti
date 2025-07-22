-- Epic 17: Bulk Operation Framework
-- Migration: 044_bulk_operation_framework
-- DEPLOYMENT BLOCKER FIX: Creates tables for comprehensive bulk operation system

-- Bulk operations tracking table
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID PRIMARY KEY,
    resource_type VARCHAR(100) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'scheduled')),
    
    -- Progress tracking
    progress JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(progress) = 'object'),
    
    -- Results storage
    results JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(results) = 'array'),
    
    -- Timing information
    timing JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(timing) = 'object'),
    
    -- Validation information
    validation JSONB CHECK (jsonb_typeof(validation) = 'object'),
    
    -- Operation metadata
    metadata JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_progress_structure CHECK (
        progress ? 'totalItems' AND 
        progress ? 'processedItems' AND
        progress ? 'successItems' AND
        progress ? 'failedItems'
    )
);

-- Bulk operation targets for tracking individual items
CREATE TABLE IF NOT EXISTS bulk_operation_targets (
    id UUID PRIMARY KEY,
    operation_id UUID NOT NULL REFERENCES bulk_operations(id) ON DELETE CASCADE,
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'success', 'failed', 'skipped', 'rolled_back')),
    
    -- Individual result data
    result JSONB,
    error_message TEXT,
    processing_time INTEGER, -- milliseconds
    retry_count INTEGER DEFAULT 0,
    
    -- Batch information
    batch_index INTEGER NOT NULL DEFAULT 0,
    item_index INTEGER NOT NULL DEFAULT 0,
    
    -- Processing metadata
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(operation_id, target_id)
);

-- Bulk operation handlers registry
CREATE TABLE IF NOT EXISTS bulk_operation_handlers (
    id UUID PRIMARY KEY,
    resource_type VARCHAR(100) NOT NULL UNIQUE,
    handler_class VARCHAR(200) NOT NULL,
    supported_operations JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(supported_operations) = 'array'),
    configuration JSONB DEFAULT '{}' CHECK (jsonb_typeof(configuration) = 'object'),
    
    -- Handler metadata
    version VARCHAR(20) DEFAULT '1.0.0',
    description TEXT,
    
    -- Feature flags
    supports_validation BOOLEAN DEFAULT true,
    supports_rollback BOOLEAN DEFAULT false,
    supports_batch_processing BOOLEAN DEFAULT true,
    supports_scheduling BOOLEAN DEFAULT true,
    
    -- Performance settings
    default_batch_size INTEGER DEFAULT 100,
    max_batch_size INTEGER DEFAULT 1000,
    default_timeout_ms INTEGER DEFAULT 300000, -- 5 minutes
    max_concurrency INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Bulk operation audit log for detailed tracking
CREATE TABLE IF NOT EXISTS bulk_operation_audit (
    id UUID PRIMARY KEY,
    operation_id UUID NOT NULL REFERENCES bulk_operations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}' CHECK (jsonb_typeof(event_data) = 'object'),
    
    -- Context information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Additional metadata
    severity VARCHAR(10) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error')),
    category VARCHAR(50)
);

-- Bulk operation templates for common operations
CREATE TABLE IF NOT EXISTS bulk_operation_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    resource_type VARCHAR(100) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    
    -- Template configuration
    default_parameters JSONB DEFAULT '{}' CHECK (jsonb_typeof(default_parameters) = 'object'),
    default_options JSONB DEFAULT '{}' CHECK (jsonb_typeof(default_options) = 'object'),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Template metadata
    category VARCHAR(100),
    tags JSONB DEFAULT '[]' CHECK (jsonb_typeof(tags) = 'array'),
    
    -- Access control
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'public')),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(name, created_by)
);

-- Bulk operation schedules for recurring operations
CREATE TABLE IF NOT EXISTS bulk_operation_schedules (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Schedule configuration
    resource_type VARCHAR(100) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    parameters JSONB DEFAULT '{}' CHECK (jsonb_typeof(parameters) = 'object'),
    options JSONB DEFAULT '{}' CHECK (jsonb_typeof(options) = 'object'),
    
    -- Target selection
    target_selection JSONB NOT NULL CHECK (jsonb_typeof(target_selection) = 'object'),
    
    -- Schedule timing
    cron_expression VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and control
    enabled BOOLEAN DEFAULT true,
    max_runs INTEGER, -- null for unlimited
    run_count INTEGER DEFAULT 0,
    
    -- Error handling
    retry_on_failure BOOLEAN DEFAULT false,
    max_failures INTEGER DEFAULT 3,
    failure_count INTEGER DEFAULT 0,
    
    -- Notifications
    notify_on_success BOOLEAN DEFAULT false,
    notify_on_failure BOOLEAN DEFAULT true,
    notification_channels JSONB DEFAULT '[]' CHECK (jsonb_typeof(notification_channels) = 'array'),
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_bulk_operations_status_created ON bulk_operations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_resource_type ON bulk_operations(resource_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_metadata_requested_by ON bulk_operations((metadata->>'requestedBy'), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_operation_targets_operation_status ON bulk_operation_targets(operation_id, status);
CREATE INDEX IF NOT EXISTS idx_bulk_operation_targets_target ON bulk_operation_targets(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_bulk_operation_targets_batch ON bulk_operation_targets(operation_id, batch_index, item_index);

CREATE INDEX IF NOT EXISTS idx_bulk_operation_audit_operation ON bulk_operation_audit(operation_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_operation_audit_event_type ON bulk_operation_audit(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_operation_templates_resource_op ON bulk_operation_templates(resource_type, operation);
CREATE INDEX IF NOT EXISTS idx_bulk_operation_templates_category ON bulk_operation_templates(category, usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_operation_schedules_next_run ON bulk_operation_schedules(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_bulk_operation_schedules_created_by ON bulk_operation_schedules(created_by);

-- Trigger functions for automation
CREATE OR REPLACE FUNCTION update_bulk_operation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp update triggers
CREATE TRIGGER trigger_bulk_operations_timestamp
    BEFORE UPDATE ON bulk_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_operation_timestamp();

CREATE TRIGGER trigger_bulk_operation_targets_timestamp
    BEFORE UPDATE ON bulk_operation_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_operation_timestamp();

CREATE TRIGGER trigger_bulk_operation_templates_timestamp
    BEFORE UPDATE ON bulk_operation_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_operation_timestamp();

CREATE TRIGGER trigger_bulk_operation_schedules_timestamp
    BEFORE UPDATE ON bulk_operation_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_operation_timestamp();

-- Function to automatically update progress when targets change
CREATE OR REPLACE FUNCTION update_operation_progress()
RETURNS TRIGGER AS $$
DECLARE
    operation_id UUID;
    total_items INTEGER;
    processed_items INTEGER;
    success_items INTEGER;
    failed_items INTEGER;
    skipped_items INTEGER;
    percent_complete NUMERIC;
BEGIN
    operation_id := COALESCE(NEW.operation_id, OLD.operation_id);
    
    SELECT COUNT(*) INTO total_items
    FROM bulk_operation_targets
    WHERE operation_id = operation_id;
    
    SELECT 
        COUNT(*) FILTER (WHERE status IN ('success', 'failed', 'skipped')),
        COUNT(*) FILTER (WHERE status = 'success'),
        COUNT(*) FILTER (WHERE status = 'failed'),
        COUNT(*) FILTER (WHERE status = 'skipped')
    INTO processed_items, success_items, failed_items, skipped_items
    FROM bulk_operation_targets
    WHERE operation_id = operation_id;
    
    percent_complete := CASE 
        WHEN total_items > 0 THEN ROUND((processed_items::NUMERIC / total_items::NUMERIC) * 100, 2)
        ELSE 0 
    END;
    
    UPDATE bulk_operations
    SET progress = jsonb_build_object(
        'totalItems', total_items,
        'processedItems', processed_items,
        'successItems', success_items,
        'failedItems', failed_items,
        'skippedItems', skipped_items,
        'percentComplete', percent_complete
    ),
    updated_at = NOW()
    WHERE id = operation_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic progress updates
CREATE TRIGGER trigger_update_operation_progress
    AFTER INSERT OR UPDATE OR DELETE ON bulk_operation_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_operation_progress();

-- Function to automatically update template usage
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.metadata ? 'templateId' THEN
        UPDATE bulk_operation_templates
        SET usage_count = usage_count + 1,
            last_used_at = NOW()
        WHERE id = (NEW.metadata->>'templateId')::UUID;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for template usage tracking
CREATE TRIGGER trigger_update_template_usage
    AFTER INSERT ON bulk_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_template_usage();

-- Function to clean up completed operations
CREATE OR REPLACE FUNCTION cleanup_old_bulk_operations()
RETURNS void AS $$
DECLARE
    retention_days INTEGER := 30;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old completed/failed/cancelled operations
    DELETE FROM bulk_operations
    WHERE status IN ('completed', 'failed', 'cancelled')
    AND created_at < cutoff_date;
    
    -- Clean up orphaned audit records
    DELETE FROM bulk_operation_audit
    WHERE timestamp < cutoff_date
    AND operation_id NOT IN (SELECT id FROM bulk_operations);
END;
$$ LANGUAGE plpgsql;

-- Insert default bulk operation handlers
INSERT INTO bulk_operation_handlers (
    id, resource_type, handler_class, supported_operations, description,
    supports_validation, supports_rollback, supports_batch_processing
) VALUES
(
    gen_random_uuid(),
    'users',
    'UserBulkOperationHandler',
    '["activate", "deactivate", "suspend", "lock", "unlock", "delete", "grant_role", "revoke_role", "grant_roles", "revoke_roles", "reset_password", "expire_password", "terminate_sessions", "send_notification", "grant_permissions", "revoke_permissions", "update_metadata", "export_data", "import_data"]'::jsonb,
    'Bulk operations handler for user management',
    true,
    true,
    true
),
(
    gen_random_uuid(),
    'permissions',
    'PermissionBulkOperationHandler',
    '["grant", "revoke", "update", "delete", "export", "import"]'::jsonb,
    'Bulk operations handler for permission management',
    true,
    true,
    true
),
(
    gen_random_uuid(),
    'roles',
    'RoleBulkOperationHandler',
    '["create", "update", "delete", "assign_permissions", "revoke_permissions", "export", "import"]'::jsonb,
    'Bulk operations handler for role management',
    true,
    true,
    true
) ON CONFLICT (resource_type) DO NOTHING;

-- Insert default operation templates
INSERT INTO bulk_operation_templates (
    id, name, description, resource_type, operation,
    default_parameters, default_options, category, tags
) VALUES
(
    gen_random_uuid(),
    'Activate Users',
    'Bulk activate multiple users',
    'users',
    'activate',
    '{}'::jsonb,
    '{"batchSize": 50, "continueOnError": true}'::jsonb,
    'user_management',
    '["activation", "status_change"]'::jsonb
),
(
    gen_random_uuid(),
    'Suspend Users',
    'Bulk suspend multiple users with optional duration',
    'users',
    'suspend',
    '{"lockDuration": 24, "lockReason": "Policy violation"}'::jsonb,
    '{"batchSize": 25, "continueOnError": false, "validateBefore": true}'::jsonb,
    'user_management',
    '["suspension", "security"]'::jsonb
),
(
    gen_random_uuid(),
    'Grant Role to Users',
    'Bulk assign a role to multiple users',
    'users',
    'grant_role',
    '{"roleId": null}'::jsonb,
    '{"batchSize": 100, "continueOnError": true, "atomicMode": false}'::jsonb,
    'role_management',
    '["roles", "permissions"]'::jsonb
),
(
    gen_random_uuid(),
    'Reset User Passwords',
    'Bulk reset passwords for multiple users',
    'users',
    'reset_password',
    '{"forcePasswordReset": true, "notificationMessage": "Your password has been reset"}'::jsonb,
    '{"batchSize": 10, "continueOnError": true, "validateBefore": true}'::jsonb,
    'security',
    '["password", "security", "notification"]'::jsonb
) ON CONFLICT (name, created_by) DO NOTHING;

-- Insert system configuration for bulk operations
INSERT INTO system_configuration (category, settings, description, modified_by) VALUES
(
    'bulk_operations',
    '{
        "max_concurrent_operations": 10,
        "default_batch_size": 100,
        "max_batch_size": 1000,
        "default_timeout_ms": 300000,
        "max_timeout_ms": 3600000,
        "retry_attempts": 3,
        "retry_delay_ms": 1000,
        "cleanup_interval_hours": 1,
        "result_retention_days": 30,
        "enable_audit_logging": true,
        "enable_performance_tracking": true,
        "enable_progress_notifications": false
    }'::jsonb,
    'Bulk operations framework configuration',
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
) ON CONFLICT (category) DO NOTHING;

-- Views for common bulk operation queries
CREATE OR REPLACE VIEW bulk_operation_summary AS
SELECT 
    bo.id,
    bo.resource_type,
    bo.operation,
    bo.status,
    (bo.progress->>'totalItems')::integer as total_items,
    (bo.progress->>'processedItems')::integer as processed_items,
    (bo.progress->>'successItems')::integer as success_items,
    (bo.progress->>'failedItems')::integer as failed_items,
    (bo.progress->>'percentComplete')::numeric as percent_complete,
    bo.metadata->>'requestedBy' as requested_by,
    bo.metadata->>'reason' as reason,
    bo.metadata->>'priority' as priority,
    bo.created_at,
    bo.updated_at,
    CASE 
        WHEN bo.timing ? 'completedAt' THEN (bo.timing->>'completedAt')::timestamp
        ELSE null 
    END as completed_at,
    CASE 
        WHEN bo.timing ? 'totalDuration' THEN (bo.timing->>'totalDuration')::integer
        ELSE null 
    END as total_duration_ms
FROM bulk_operations bo;

CREATE OR REPLACE VIEW active_bulk_operations AS
SELECT *
FROM bulk_operation_summary
WHERE status IN ('pending', 'running', 'scheduled')
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW recent_bulk_operations AS
SELECT *
FROM bulk_operation_summary
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Comments for documentation
COMMENT ON TABLE bulk_operations IS 'Main table for tracking bulk operations across all resource types';
COMMENT ON TABLE bulk_operation_targets IS 'Individual items being processed in bulk operations';
COMMENT ON TABLE bulk_operation_handlers IS 'Registry of available bulk operation handlers and their capabilities';
COMMENT ON TABLE bulk_operation_audit IS 'Detailed audit log for bulk operation events and changes';
COMMENT ON TABLE bulk_operation_templates IS 'Reusable templates for common bulk operations';
COMMENT ON TABLE bulk_operation_schedules IS 'Scheduled recurring bulk operations';

COMMENT ON COLUMN bulk_operations.progress IS 'Real-time progress tracking with totals and percentages';
COMMENT ON COLUMN bulk_operations.results IS 'Final results array with individual item outcomes';
COMMENT ON COLUMN bulk_operations.timing IS 'Performance timing information for the operation';
COMMENT ON COLUMN bulk_operations.validation IS 'Validation results if pre-validation was enabled';

COMMENT ON VIEW bulk_operation_summary IS 'Simplified view of bulk operations with key metrics';
COMMENT ON VIEW active_bulk_operations IS 'Currently running or scheduled bulk operations';
COMMENT ON VIEW recent_bulk_operations IS 'Bulk operations from the past week';