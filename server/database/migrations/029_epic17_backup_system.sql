-- Epic 17.4.6 Backup System Migration
-- Database schema for admin backup configuration and execution tracking

-- Create backup configurations table
CREATE TABLE IF NOT EXISTS backup_configurations (
    config_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
    
    -- Schedule configuration stored as JSONB
    schedule JSONB NOT NULL,
    
    -- Data scope configuration stored as JSONB
    data_scope JSONB NOT NULL,
    
    -- Retention policy stored as JSONB
    retention_policy JSONB NOT NULL,
    
    -- Storage configuration stored as JSONB
    storage JSONB NOT NULL,
    
    -- Notification settings stored as JSONB
    notifications JSONB NOT NULL DEFAULT '{}',
    
    -- Management fields
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT backup_configurations_name_unique UNIQUE (name),
    CONSTRAINT backup_configurations_schedule_check CHECK (
        schedule ? 'frequency' AND 
        schedule ? 'time_of_day' AND 
        schedule ? 'timezone'
    ),
    CONSTRAINT backup_configurations_data_scope_check CHECK (
        data_scope ? 'include_admin_configs' OR
        data_scope ? 'include_user_permissions' OR
        data_scope ? 'include_system_settings' OR
        data_scope ? 'include_audit_logs' OR
        data_scope ? 'include_marketplace_data' OR
        (data_scope->>'custom_tables')::text != '[]'
    ),
    CONSTRAINT backup_configurations_retention_check CHECK (
        retention_policy ? 'keep_hourly' AND
        retention_policy ? 'keep_daily' AND
        retention_policy ? 'keep_weekly' AND
        retention_policy ? 'keep_monthly'
    ),
    CONSTRAINT backup_configurations_storage_check CHECK (
        storage ? 'provider' AND
        storage ? 'location' AND
        storage ? 'encryption_enabled' AND
        storage ? 'compression_enabled'
    )
);

-- Create backup executions table
CREATE TABLE IF NOT EXISTS backup_executions (
    execution_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id VARCHAR(36) NOT NULL REFERENCES backup_configurations(config_id) ON DELETE CASCADE,
    recovery_point_id VARCHAR(36), -- References Epic 19 recovery_points table
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
    ),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Backup metrics
    backup_size_bytes BIGINT,
    compressed_size_bytes BIGINT,
    record_count INTEGER,
    
    -- Progress tracking stored as JSONB
    progress JSONB NOT NULL DEFAULT '{"current_step": "Initializing", "percentage": 0}',
    
    -- Error details stored as JSONB
    error_details JSONB,
    
    -- Validation results stored as JSONB
    validation_results JSONB,
    
    -- Constraints
    CONSTRAINT backup_executions_timing_check CHECK (
        completed_at IS NULL OR completed_at >= started_at
    ),
    CONSTRAINT backup_executions_duration_check CHECK (
        duration_seconds IS NULL OR duration_seconds >= 0
    ),
    CONSTRAINT backup_executions_sizes_check CHECK (
        backup_size_bytes IS NULL OR backup_size_bytes >= 0
    ),
    CONSTRAINT backup_executions_progress_check CHECK (
        progress ? 'current_step' AND progress ? 'percentage'
    )
);

-- Create backup schedule tracking table for job management
CREATE TABLE IF NOT EXISTS backup_schedules (
    schedule_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id VARCHAR(36) NOT NULL REFERENCES backup_configurations(config_id) ON DELETE CASCADE,
    cron_expression VARCHAR(100) NOT NULL,
    next_execution TIMESTAMP WITH TIME ZONE NOT NULL,
    last_execution TIMESTAMP WITH TIME ZONE,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT backup_schedules_config_unique UNIQUE (config_id)
);

-- Create backup retention tracking for cleanup jobs
CREATE TABLE IF NOT EXISTS backup_retention_log (
    log_id BIGSERIAL PRIMARY KEY,
    recovery_point_id VARCHAR(36) NOT NULL,
    config_id VARCHAR(36) REFERENCES backup_configurations(config_id) ON DELETE SET NULL,
    retention_action VARCHAR(20) NOT NULL CHECK (
        retention_action IN ('kept', 'archived', 'deleted', 'expired')
    ),
    retention_reason VARCHAR(100) NOT NULL,
    action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    size_bytes BIGINT,
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_backup_configurations_enabled ON backup_configurations(enabled);
CREATE INDEX IF NOT EXISTS idx_backup_configurations_next_run ON backup_configurations(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_backup_configurations_created_by ON backup_configurations(created_by);

CREATE INDEX IF NOT EXISTS idx_backup_executions_config_id ON backup_executions(config_id);
CREATE INDEX IF NOT EXISTS idx_backup_executions_status ON backup_executions(status);
CREATE INDEX IF NOT EXISTS idx_backup_executions_started_at ON backup_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_backup_executions_recovery_point ON backup_executions(recovery_point_id);

CREATE INDEX IF NOT EXISTS idx_backup_schedules_next_execution ON backup_schedules(next_execution) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_backup_schedules_config_id ON backup_schedules(config_id);

CREATE INDEX IF NOT EXISTS idx_backup_retention_log_action_date ON backup_retention_log(action_date);
CREATE INDEX IF NOT EXISTS idx_backup_retention_log_config_id ON backup_retention_log(config_id);

-- Create backup metrics view for dashboard
CREATE OR REPLACE VIEW backup_metrics_summary AS
SELECT 
    -- Configuration metrics
    (SELECT COUNT(*) FROM backup_configurations) as total_configurations,
    (SELECT COUNT(*) FROM backup_configurations WHERE enabled = true) as active_configurations,
    
    -- Execution metrics (last 24 hours)
    (SELECT COUNT(*) FROM backup_executions 
     WHERE status = 'completed' AND started_at >= NOW() - INTERVAL '24 hours') as successful_last_24h,
    (SELECT COUNT(*) FROM backup_executions 
     WHERE status = 'failed' AND started_at >= NOW() - INTERVAL '24 hours') as failed_last_24h,
    (SELECT COUNT(*) FROM backup_executions 
     WHERE status IN ('pending', 'running')) as currently_running,
     
    -- Storage metrics
    (SELECT COALESCE(SUM(backup_size_bytes), 0) FROM backup_executions 
     WHERE status = 'completed') as total_backup_storage_bytes,
    (SELECT COALESCE(SUM(compressed_size_bytes), 0) FROM backup_executions 
     WHERE status = 'completed') as total_compressed_storage_bytes,
     
    -- Performance metrics (last 7 days)
    (SELECT COALESCE(AVG(duration_seconds), 0) FROM backup_executions 
     WHERE status = 'completed' AND started_at >= NOW() - INTERVAL '7 days') as avg_duration_seconds_7d,
    (SELECT COALESCE(AVG(backup_size_bytes), 0) FROM backup_executions 
     WHERE status = 'completed' AND started_at >= NOW() - INTERVAL '7 days') as avg_backup_size_7d;

-- Create function for backup configuration validation
CREATE OR REPLACE FUNCTION validate_backup_configuration()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate schedule configuration
    IF NEW.schedule->>'frequency' = 'weekly' AND 
       (NEW.schedule->'days_of_week' IS NULL OR jsonb_array_length(NEW.schedule->'days_of_week') = 0) THEN
        RAISE EXCEPTION 'Weekly backup frequency requires days_of_week specification';
    END IF;
    
    IF NEW.schedule->>'frequency' = 'monthly' AND 
       NEW.schedule->>'day_of_month' IS NULL THEN
        RAISE EXCEPTION 'Monthly backup frequency requires day_of_month specification';
    END IF;
    
    -- Validate retention policy values
    IF (NEW.retention_policy->>'keep_hourly')::int < 0 OR
       (NEW.retention_policy->>'keep_daily')::int < 0 OR
       (NEW.retention_policy->>'keep_weekly')::int < 0 OR
       (NEW.retention_policy->>'keep_monthly')::int < 0 THEN
        RAISE EXCEPTION 'Retention policy values must be non-negative';
    END IF;
    
    -- Validate data scope has at least one inclusion
    IF NOT (
        (NEW.data_scope->>'include_admin_configs')::boolean OR
        (NEW.data_scope->>'include_user_permissions')::boolean OR
        (NEW.data_scope->>'include_system_settings')::boolean OR
        (NEW.data_scope->>'include_audit_logs')::boolean OR
        (NEW.data_scope->>'include_marketplace_data')::boolean OR
        jsonb_array_length(NEW.data_scope->'custom_tables') > 0
    ) THEN
        RAISE EXCEPTION 'Backup configuration must include at least one data type';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for backup configuration validation
CREATE TRIGGER backup_configuration_validation_trigger
    BEFORE INSERT OR UPDATE ON backup_configurations
    FOR EACH ROW EXECUTE FUNCTION validate_backup_configuration();

-- Create function for automatic schedule management
CREATE OR REPLACE FUNCTION manage_backup_schedule()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.enabled != NEW.enabled) THEN
        IF NEW.enabled THEN
            -- Create or update schedule entry
            INSERT INTO backup_schedules (config_id, cron_expression, next_execution, enabled)
            VALUES (
                NEW.config_id,
                generate_cron_expression(NEW.schedule),
                NEW.next_run_at,
                true
            )
            ON CONFLICT (config_id) DO UPDATE SET
                cron_expression = EXCLUDED.cron_expression,
                next_execution = EXCLUDED.next_execution,
                enabled = EXCLUDED.enabled,
                updated_at = NOW();
        ELSE
            -- Disable schedule
            UPDATE backup_schedules 
            SET enabled = false, updated_at = NOW()
            WHERE config_id = NEW.config_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove schedule entry
        DELETE FROM backup_schedules WHERE config_id = OLD.config_id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic schedule management
CREATE TRIGGER backup_schedule_management_trigger
    AFTER INSERT OR UPDATE OR DELETE ON backup_configurations
    FOR EACH ROW EXECUTE FUNCTION manage_backup_schedule();

-- Create function to generate cron expressions from schedule JSON
CREATE OR REPLACE FUNCTION generate_cron_expression(schedule_config JSONB)
RETURNS VARCHAR(100) AS $$
DECLARE
    frequency VARCHAR(20);
    time_parts TEXT[];
    hour INTEGER;
    minute INTEGER;
    cron_expr VARCHAR(100);
BEGIN
    frequency := schedule_config->>'frequency';
    time_parts := string_to_array(schedule_config->>'time_of_day', ':');
    hour := time_parts[1]::INTEGER;
    minute := time_parts[2]::INTEGER;
    
    CASE frequency
        WHEN 'hourly' THEN
            cron_expr := format('%s * * * *', minute);
        WHEN 'daily' THEN
            cron_expr := format('%s %s * * *', minute, hour);
        WHEN 'weekly' THEN
            -- Assumes days_of_week is provided as array of integers (0=Sunday)
            cron_expr := format('%s %s * * %s', 
                minute, 
                hour, 
                array_to_string(ARRAY(SELECT jsonb_array_elements_text(schedule_config->'days_of_week')), ',')
            );
        WHEN 'monthly' THEN
            cron_expr := format('%s %s %s * *', 
                minute, 
                hour, 
                schedule_config->>'day_of_month'
            );
        ELSE
            RAISE EXCEPTION 'Invalid backup frequency: %', frequency;
    END CASE;
    
    RETURN cron_expr;
END;
$$ LANGUAGE plpgsql;

-- Create function for backup execution metrics
CREATE OR REPLACE FUNCTION get_backup_execution_stats(config_id_param VARCHAR(36) DEFAULT NULL)
RETURNS TABLE (
    total_executions BIGINT,
    successful_executions BIGINT,
    failed_executions BIGINT,
    avg_duration_seconds NUMERIC,
    total_backup_size_bytes BIGINT,
    last_execution_date TIMESTAMP WITH TIME ZONE,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'completed') as successful_executions,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_executions,
        AVG(duration_seconds) FILTER (WHERE status = 'completed') as avg_duration_seconds,
        SUM(backup_size_bytes) FILTER (WHERE status = 'completed') as total_backup_size_bytes,
        MAX(started_at) as last_execution_date,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 0
        END as success_rate
    FROM backup_executions
    WHERE (config_id_param IS NULL OR config_id = config_id_param);
END;
$$ LANGUAGE plpgsql;

-- Create function for cleanup of old backup execution records
CREATE OR REPLACE FUNCTION cleanup_old_backup_executions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep execution records for 90 days, but always keep the last 10 executions per config
    WITH executions_to_keep AS (
        SELECT execution_id
        FROM (
            SELECT execution_id,
                   ROW_NUMBER() OVER (PARTITION BY config_id ORDER BY started_at DESC) as rn
            FROM backup_executions
            WHERE started_at >= NOW() - INTERVAL '90 days' OR 
                  ROW_NUMBER() OVER (PARTITION BY config_id ORDER BY started_at DESC) <= 10
        ) ranked
        WHERE rn <= 10 OR started_at >= NOW() - INTERVAL '90 days'
    )
    DELETE FROM backup_executions 
    WHERE execution_id NOT IN (SELECT execution_id FROM executions_to_keep)
      AND started_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup action
    INSERT INTO backup_retention_log (recovery_point_id, retention_action, retention_reason, metadata)
    VALUES (
        'cleanup-job-' || extract(epoch from now())::text,
        'deleted',
        'Automated cleanup of execution records older than 90 days',
        jsonb_build_object('deleted_executions', deleted_count, 'cleanup_date', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default backup configuration templates
INSERT INTO backup_configurations (
    config_id,
    name,
    description,
    enabled,
    backup_type,
    schedule,
    data_scope,
    retention_policy,
    storage,
    notifications,
    created_by
) VALUES
(
    gen_random_uuid(),
    'Daily Admin Configuration Backup',
    'Daily backup of admin configurations and system settings',
    false, -- Disabled by default, admin must enable
    'incremental',
    '{
        "frequency": "daily",
        "time_of_day": "02:00",
        "timezone": "UTC"
    }',
    '{
        "include_admin_configs": true,
        "include_user_permissions": true,
        "include_system_settings": true,
        "include_audit_logs": false,
        "include_marketplace_data": false,
        "custom_tables": [],
        "exclude_tables": ["temporary_sessions", "cache_entries"]
    }',
    '{
        "keep_hourly": 24,
        "keep_daily": 30,
        "keep_weekly": 12,
        "keep_monthly": 12
    }',
    '{
        "provider": "local",
        "location": "/var/backups/admin",
        "encryption_enabled": true,
        "compression_enabled": true
    }',
    '{
        "on_success": false,
        "on_failure": true,
        "on_completion": false,
        "recipients": []
    }',
    'system'
),
(
    gen_random_uuid(),
    'Weekly Full System Backup',
    'Weekly full backup of all system data including marketplace',
    false, -- Disabled by default
    'full',
    '{
        "frequency": "weekly",
        "time_of_day": "01:00",
        "days_of_week": [0],
        "timezone": "UTC"
    }',
    '{
        "include_admin_configs": true,
        "include_user_permissions": true,
        "include_system_settings": true,
        "include_audit_logs": true,
        "include_marketplace_data": true,
        "custom_tables": [],
        "exclude_tables": ["temporary_data", "session_store"]
    }',
    '{
        "keep_hourly": 0,
        "keep_daily": 7,
        "keep_weekly": 8,
        "keep_monthly": 12
    }',
    '{
        "provider": "local",
        "location": "/var/backups/full",
        "encryption_enabled": true,
        "compression_enabled": true
    }',
    '{
        "on_success": true,
        "on_failure": true,
        "on_completion": true,
        "recipients": []
    }',
    'system'
)
ON CONFLICT (name) DO NOTHING;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backup_configurations_updated_at
    BEFORE UPDATE ON backup_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER backup_schedules_updated_at
    BEFORE UPDATE ON backup_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for Epic 17 admin system
GRANT SELECT, INSERT, UPDATE, DELETE ON backup_configurations TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON backup_executions TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON backup_schedules TO policy_service;
GRANT SELECT, INSERT ON backup_retention_log TO policy_service;

GRANT SELECT ON backup_metrics_summary TO policy_service;

GRANT USAGE ON SEQUENCE backup_retention_log_log_id_seq TO policy_service;

-- Add comments for documentation
COMMENT ON TABLE backup_configurations IS 'Epic 17.4.6: Admin backup configuration management';
COMMENT ON TABLE backup_executions IS 'Epic 17.4.6: Backup execution tracking and monitoring';
COMMENT ON TABLE backup_schedules IS 'Epic 17.4.6: Backup scheduling and job management';
COMMENT ON TABLE backup_retention_log IS 'Epic 17.4.6: Backup retention and cleanup audit trail';

COMMENT ON VIEW backup_metrics_summary IS 'Epic 17.4.6: Real-time backup system metrics for admin dashboard';

COMMENT ON FUNCTION validate_backup_configuration() IS 'Epic 17.4.6: Validates backup configuration before insert/update';
COMMENT ON FUNCTION manage_backup_schedule() IS 'Epic 17.4.6: Automatically manages backup scheduling entries';
COMMENT ON FUNCTION generate_cron_expression(JSONB) IS 'Epic 17.4.6: Converts schedule JSON to cron expression';
COMMENT ON FUNCTION get_backup_execution_stats(VARCHAR) IS 'Epic 17.4.6: Returns execution statistics for backup configurations';
COMMENT ON FUNCTION cleanup_old_backup_executions() IS 'Epic 17.4.6: Automated cleanup of old execution records';

-- Migration completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('029_epic17_backup_system', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();