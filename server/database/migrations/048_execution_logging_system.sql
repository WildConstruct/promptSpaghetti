-- Epic 17: Execution Logging System
-- Migration: 048_execution_logging_system
-- DEPLOYMENT BLOCKER FIX: Creates comprehensive execution logging system for admin operations tracking

-- Core execution logs table
CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY,
    execution_id VARCHAR(100) NOT NULL UNIQUE,
    parent_execution_id VARCHAR(100) REFERENCES execution_logs(execution_id) ON DELETE SET NULL,
    correlation_id VARCHAR(100),
    trace_id VARCHAR(100),
    
    -- Execution identification
    execution_type VARCHAR(50) NOT NULL CHECK (execution_type IN (
        'admin_operation', 'bulk_operation', 'system_maintenance', 'data_migration',
        'workflow_execution', 'workflow_step', 'automated_task', 'scheduled_job',
        'api_request', 'webhook_delivery', 'external_api_call',
        'database_operation', 'file_operation', 'archive_operation', 'backup_operation',
        'authentication', 'authorization', 'security_scan', 'compliance_check',
        'integration_sync', 'data_import', 'data_export', 'message_processing',
        'custom_operation'
    )),
    operation VARCHAR(200) NOT NULL,
    operation_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    component VARCHAR(100) NOT NULL,
    
    -- Execution context
    initiated_by VARCHAR(100) NOT NULL,
    initiated_by_type VARCHAR(30) NOT NULL CHECK (initiated_by_type IN (
        'user', 'system', 'scheduled_task', 'api_client', 'webhook',
        'automated_process', 'external_service', 'internal_service'
    )),
    environment VARCHAR(20) NOT NULL CHECK (environment IN (
        'development', 'testing', 'staging', 'production', 'sandbox'
    )),
    context JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(context) = 'object'),
    
    -- Execution lifecycle
    status VARCHAR(30) NOT NULL DEFAULT 'initializing' CHECK (status IN (
        'queued', 'initializing', 'running', 'paused', 'completed', 'failed',
        'cancelled', 'timeout', 'retrying', 'partially_completed'
    )),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN (
        'low', 'normal', 'high', 'urgent', 'critical'
    )),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER CHECK (duration_ms >= 0),
    
    -- Input and output
    input_parameters JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(input_parameters) = 'object'),
    output_data JSONB CHECK (jsonb_typeof(output_data) = 'object'),
    
    -- Progress tracking
    total_steps INTEGER NOT NULL DEFAULT 1 CHECK (total_steps > 0),
    completed_steps INTEGER NOT NULL DEFAULT 0 CHECK (completed_steps >= 0),
    current_step VARCHAR(200),
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Error and warning tracking
    errors JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(errors) = 'array'),
    warnings JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(warnings) = 'array'),
    
    -- Performance metrics
    performance_metrics JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(performance_metrics) = 'object'),
    
    -- Resource usage
    resource_usage JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(resource_usage) = 'object'),
    
    -- Security and compliance
    security_context JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(security_context) = 'object'),
    compliance_flags TEXT[] DEFAULT '{}',
    
    -- Metadata and tags
    tags TEXT[] DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    
    -- Lifecycle timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_completion CHECK (completed_at IS NULL OR completed_at >= started_at),
    CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR (completed_at IS NOT NULL AND duration_ms > 0)),
    CONSTRAINT valid_progress_steps CHECK (completed_steps <= total_steps),
    CONSTRAINT valid_progress_percentage CHECK (
        (completed_steps = 0 AND progress_percentage = 0) OR
        (completed_steps = total_steps AND progress_percentage = 100) OR
        (completed_steps > 0 AND completed_steps < total_steps AND progress_percentage > 0 AND progress_percentage < 100)
    )
);

-- Execution hierarchy table for better tree queries
CREATE TABLE IF NOT EXISTS execution_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id VARCHAR(100) NOT NULL REFERENCES execution_logs(execution_id) ON DELETE CASCADE,
    ancestor_execution_id VARCHAR(100) NOT NULL REFERENCES execution_logs(execution_id) ON DELETE CASCADE,
    depth INTEGER NOT NULL CHECK (depth >= 0),
    path TEXT NOT NULL,
    
    UNIQUE(execution_id, ancestor_execution_id)
);

-- Execution metrics snapshots for time-series data
CREATE TABLE IF NOT EXISTS execution_metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id VARCHAR(100) NOT NULL REFERENCES execution_logs(execution_id) ON DELETE CASCADE,
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Performance metrics
    cpu_percentage NUMERIC(5,2) CHECK (cpu_percentage >= 0 AND cpu_percentage <= 100),
    memory_used_bytes BIGINT CHECK (memory_used_bytes >= 0),
    disk_io_read_bytes BIGINT CHECK (disk_io_read_bytes >= 0),
    disk_io_write_bytes BIGINT CHECK (disk_io_write_bytes >= 0),
    network_bytes_in BIGINT CHECK (network_bytes_in >= 0),
    network_bytes_out BIGINT CHECK (network_bytes_out >= 0),
    
    -- Database metrics
    database_connections INTEGER CHECK (database_connections >= 0),
    database_query_count INTEGER CHECK (database_query_count >= 0),
    database_query_time_ms INTEGER CHECK (database_query_time_ms >= 0),
    
    -- Custom metrics
    custom_metrics JSONB DEFAULT '{}' CHECK (jsonb_typeof(custom_metrics) = 'object'),
    
    -- Progress at this snapshot
    progress_percentage NUMERIC(5,2) CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_step VARCHAR(200),
    
    -- System load at snapshot time
    system_load_average NUMERIC(8,4),
    available_memory_bytes BIGINT,
    disk_space_available_bytes BIGINT
);

-- Execution alerts table for monitoring and notifications
CREATE TABLE IF NOT EXISTS execution_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id VARCHAR(100) NOT NULL REFERENCES execution_logs(execution_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'performance_threshold', 'error_threshold', 'timeout_warning', 'resource_limit',
        'security_violation', 'compliance_issue', 'business_rule_violation', 'system_health'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical', 'fatal')),
    
    -- Alert details
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_data JSONB DEFAULT '{}' CHECK (jsonb_typeof(alert_data) = 'object'),
    
    -- Alert status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'acknowledged', 'resolved', 'suppressed', 'escalated'
    )),
    
    -- Alert handling
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Notification tracking
    notifications_sent JSONB DEFAULT '[]' CHECK (jsonb_typeof(notifications_sent) = 'array'),
    
    -- Alert lifecycle
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_acknowledgment CHECK (
        acknowledged_at IS NULL OR 
        (acknowledged_by IS NOT NULL AND acknowledged_at >= triggered_at)
    ),
    CONSTRAINT valid_resolution CHECK (
        resolved_at IS NULL OR 
        (resolved_by IS NOT NULL AND resolved_at >= triggered_at)
    )
);

-- Execution statistics aggregation table
CREATE TABLE IF NOT EXISTS execution_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Aggregation dimensions
    execution_type VARCHAR(50),
    operation VARCHAR(200),
    component VARCHAR(100),
    status VARCHAR(30),
    environment VARCHAR(20),
    
    -- Count statistics
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    timeout_count INTEGER DEFAULT 0,
    
    -- Timing statistics
    total_duration_ms BIGINT DEFAULT 0,
    avg_duration_ms NUMERIC(12,2) DEFAULT 0,
    min_duration_ms INTEGER DEFAULT 0,
    max_duration_ms INTEGER DEFAULT 0,
    p50_duration_ms INTEGER DEFAULT 0,
    p95_duration_ms INTEGER DEFAULT 0,
    p99_duration_ms INTEGER DEFAULT 0,
    
    -- Resource statistics
    total_cpu_time_ms BIGINT DEFAULT 0,
    avg_cpu_time_ms NUMERIC(12,2) DEFAULT 0,
    total_memory_used_bytes BIGINT DEFAULT 0,
    avg_memory_used_bytes BIGINT DEFAULT 0,
    max_memory_used_bytes BIGINT DEFAULT 0,
    
    -- Error and warning statistics
    total_error_count INTEGER DEFAULT 0,
    total_warning_count INTEGER DEFAULT 0,
    error_rate NUMERIC(5,2) DEFAULT 0,
    
    -- Quality metrics
    success_rate NUMERIC(5,2) DEFAULT 0,
    avg_progress_rate NUMERIC(8,4) DEFAULT 0, -- steps per minute
    completion_rate NUMERIC(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_statistics_period CHECK (period_end > period_start),
    CONSTRAINT valid_success_rate CHECK (success_rate >= 0 AND success_rate <= 100),
    CONSTRAINT valid_error_rate CHECK (error_rate >= 0 AND error_rate <= 100),
    CONSTRAINT valid_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100)
);

-- Execution dependencies table for tracking resource dependencies
CREATE TABLE IF NOT EXISTS execution_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id VARCHAR(100) NOT NULL REFERENCES execution_logs(execution_id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL CHECK (dependency_type IN (
        'database_connection', 'file_system_access', 'network_service', 'external_api',
        'message_queue', 'cache_service', 'storage_service', 'authentication_service',
        'configuration_service', 'logging_service', 'monitoring_service', 'custom_dependency'
    )),
    
    -- Dependency details
    dependency_name VARCHAR(200) NOT NULL,
    dependency_identifier VARCHAR(500), -- URL, connection string, etc.
    dependency_version VARCHAR(50),
    
    -- Usage tracking
    first_accessed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    
    -- Performance impact
    total_wait_time_ms INTEGER DEFAULT 0,
    max_wait_time_ms INTEGER DEFAULT 0,
    avg_wait_time_ms NUMERIC(8,2) DEFAULT 0,
    
    -- Health status
    health_status VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN (
        'healthy', 'degraded', 'unhealthy', 'timeout', 'unavailable', 'unknown'
    )),
    last_health_check TIMESTAMP WITH TIME ZONE,
    
    -- Failure tracking
    failure_count INTEGER DEFAULT 0,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    last_failure_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(execution_id, dependency_type, dependency_name)
);

-- Indexes for efficient querying and performance

-- Primary execution logs indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_parent_id ON execution_logs(parent_execution_id) WHERE parent_execution_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_execution_logs_correlation_id ON execution_logs(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_execution_logs_trace_id ON execution_logs(trace_id) WHERE trace_id IS NOT NULL;

-- Status and lifecycle indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_status ON execution_logs(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_active ON execution_logs(status, started_at DESC) 
    WHERE status IN ('queued', 'initializing', 'running', 'paused', 'retrying');
CREATE INDEX IF NOT EXISTS idx_execution_logs_completed ON execution_logs(completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_execution_logs_failed ON execution_logs(started_at DESC) WHERE status = 'failed';

-- Execution type and component indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_type ON execution_logs(execution_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_operation ON execution_logs(operation, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_component ON execution_logs(component, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_type_status ON execution_logs(execution_type, status, started_at DESC);

-- User and context indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_initiated_by ON execution_logs(initiated_by, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_initiator_type ON execution_logs(initiated_by_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_environment ON execution_logs(environment, started_at DESC);

-- Performance and resource indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_duration ON execution_logs(duration_ms DESC) WHERE duration_ms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_execution_logs_long_running ON execution_logs(started_at DESC) 
    WHERE status IN ('running', 'paused') AND started_at < NOW() - INTERVAL '1 hour';

-- Error and warning indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_errors ON execution_logs(started_at DESC) 
    WHERE jsonb_array_length(errors) > 0;
CREATE INDEX IF NOT EXISTS idx_execution_logs_warnings ON execution_logs(started_at DESC) 
    WHERE jsonb_array_length(warnings) > 0;

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_operation_search ON execution_logs USING gin(to_tsvector('english', operation));
CREATE INDEX IF NOT EXISTS idx_execution_logs_component_search ON execution_logs USING gin(to_tsvector('english', component));

-- JSON field indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_context ON execution_logs USING gin(context);
CREATE INDEX IF NOT EXISTS idx_execution_logs_metadata ON execution_logs USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_execution_logs_tags ON execution_logs USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_execution_logs_performance_metrics ON execution_logs USING gin(performance_metrics);
CREATE INDEX IF NOT EXISTS idx_execution_logs_security_context ON execution_logs USING gin(security_context);

-- Archival and cleanup indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_archival ON execution_logs(created_at) 
    WHERE archived_at IS NULL AND completed_at < NOW() - INTERVAL '30 days';

-- Hierarchy indexes
CREATE INDEX IF NOT EXISTS idx_execution_hierarchy_execution_id ON execution_hierarchy(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_hierarchy_ancestor ON execution_hierarchy(ancestor_execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_hierarchy_depth ON execution_hierarchy(execution_id, depth);

-- Metrics snapshots indexes
CREATE INDEX IF NOT EXISTS idx_execution_metrics_snapshots_execution_id ON execution_metrics_snapshots(execution_id, snapshot_time DESC);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_snapshots_time ON execution_metrics_snapshots(snapshot_time DESC);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_execution_alerts_execution_id ON execution_alerts(execution_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_alerts_status ON execution_alerts(status, triggered_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_execution_alerts_severity ON execution_alerts(severity, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_alerts_type ON execution_alerts(alert_type, triggered_at DESC);

-- Statistics indexes
CREATE INDEX IF NOT EXISTS idx_execution_statistics_period ON execution_statistics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_execution_statistics_dimensions ON execution_statistics(execution_type, operation, component, status);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_execution_dependencies_execution_id ON execution_dependencies(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_dependencies_type ON execution_dependencies(dependency_type);
CREATE INDEX IF NOT EXISTS idx_execution_dependencies_health ON execution_dependencies(health_status, last_health_check);

-- Trigger functions for automation and maintenance

-- Update execution timestamps
CREATE OR REPLACE FUNCTION update_execution_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Calculate duration if completed
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
    END IF;
    
    -- Update progress percentage based on completed steps
    IF NEW.total_steps > 0 THEN
        NEW.progress_percentage = (NEW.completed_steps::NUMERIC / NEW.total_steps * 100);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for execution log updates
CREATE TRIGGER trigger_execution_logs_timestamp
    BEFORE UPDATE ON execution_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_execution_log_timestamp();

-- Function to maintain execution hierarchy
CREATE OR REPLACE FUNCTION maintain_execution_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_execution_id IS NOT NULL THEN
        -- Insert direct parent relationship
        INSERT INTO execution_hierarchy (execution_id, ancestor_execution_id, depth, path)
        VALUES (NEW.execution_id, NEW.parent_execution_id, 1, NEW.parent_execution_id || '/' || NEW.execution_id)
        ON CONFLICT (execution_id, ancestor_execution_id) DO NOTHING;
        
        -- Insert all ancestor relationships
        INSERT INTO execution_hierarchy (execution_id, ancestor_execution_id, depth, path)
        SELECT 
            NEW.execution_id,
            eh.ancestor_execution_id,
            eh.depth + 1,
            eh.path || '/' || NEW.execution_id
        FROM execution_hierarchy eh
        WHERE eh.execution_id = NEW.parent_execution_id
        ON CONFLICT (execution_id, ancestor_execution_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hierarchy maintenance
CREATE TRIGGER trigger_maintain_execution_hierarchy
    AFTER INSERT ON execution_logs
    FOR EACH ROW
    EXECUTE FUNCTION maintain_execution_hierarchy();

-- Function to auto-generate alerts based on execution metrics
CREATE OR REPLACE FUNCTION check_execution_alerts()
RETURNS TRIGGER AS $$
DECLARE
    long_running_threshold INTEGER := 3600000; -- 1 hour in milliseconds
    high_memory_threshold BIGINT := 1073741824; -- 1GB in bytes
    error_threshold INTEGER := 5;
    current_duration INTEGER;
BEGIN
    -- Check for long-running executions
    IF NEW.status IN ('running', 'paused') THEN
        current_duration := EXTRACT(EPOCH FROM (NOW() - NEW.started_at)) * 1000;
        
        IF current_duration > long_running_threshold THEN
            INSERT INTO execution_alerts (
                execution_id, alert_type, severity, title, message, alert_data
            ) VALUES (
                NEW.execution_id,
                'timeout_warning',
                'medium',
                'Long Running Execution',
                'Execution has been running for over ' || (current_duration / 60000) || ' minutes',
                jsonb_build_object('duration_ms', current_duration, 'threshold_ms', long_running_threshold)
            );
        END IF;
    END IF;
    
    -- Check for high error count
    IF jsonb_array_length(NEW.errors) >= error_threshold THEN
        INSERT INTO execution_alerts (
            execution_id, alert_type, severity, title, message, alert_data
        ) VALUES (
            NEW.execution_id,
            'error_threshold',
            'high',
            'High Error Count',
            'Execution has accumulated ' || jsonb_array_length(NEW.errors) || ' errors',
            jsonb_build_object('error_count', jsonb_array_length(NEW.errors), 'threshold', error_threshold)
        );
    END IF;
    
    -- Check for high memory usage
    IF (NEW.resource_usage->>'memoryUsed')::BIGINT > high_memory_threshold THEN
        INSERT INTO execution_alerts (
            execution_id, alert_type, severity, title, message, alert_data
        ) VALUES (
            NEW.execution_id,
            'resource_limit',
            'medium',
            'High Memory Usage',
            'Execution is using ' || pg_size_pretty((NEW.resource_usage->>'memoryUsed')::BIGINT) || ' of memory',
            jsonb_build_object('memory_used', (NEW.resource_usage->>'memoryUsed')::BIGINT, 'threshold', high_memory_threshold)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic alert generation
CREATE TRIGGER trigger_check_execution_alerts
    AFTER UPDATE ON execution_logs
    FOR EACH ROW
    EXECUTE FUNCTION check_execution_alerts();

-- Function to cleanup old execution data
CREATE OR REPLACE FUNCTION cleanup_execution_data()
RETURNS TABLE(
    deleted_logs INTEGER,
    deleted_snapshots INTEGER,
    deleted_alerts INTEGER,
    archived_logs INTEGER
) AS $$
DECLARE
    retention_days INTEGER := 90;
    snapshot_retention_days INTEGER := 30;
    alert_retention_days INTEGER := 180;
    archive_threshold_days INTEGER := 30;
    logs_deleted INTEGER := 0;
    snapshots_deleted INTEGER := 0;
    alerts_deleted INTEGER := 0;
    logs_archived INTEGER := 0;
BEGIN
    -- Archive old completed executions
    UPDATE execution_logs 
    SET archived_at = NOW()
    WHERE archived_at IS NULL 
    AND completed_at IS NOT NULL 
    AND completed_at < NOW() - (archive_threshold_days || ' days')::INTERVAL;
    GET DIAGNOSTICS logs_archived = ROW_COUNT;
    
    -- Delete very old execution logs
    DELETE FROM execution_logs 
    WHERE archived_at IS NOT NULL 
    AND archived_at < NOW() - (retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS logs_deleted = ROW_COUNT;
    
    -- Delete old metrics snapshots
    DELETE FROM execution_metrics_snapshots 
    WHERE snapshot_time < NOW() - (snapshot_retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS snapshots_deleted = ROW_COUNT;
    
    -- Delete old resolved alerts
    DELETE FROM execution_alerts 
    WHERE status = 'resolved' 
    AND resolved_at < NOW() - (alert_retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS alerts_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT logs_deleted, snapshots_deleted, alerts_deleted, logs_archived;
END;
$$ LANGUAGE plpgsql;

-- Function to get execution health metrics
CREATE OR REPLACE FUNCTION get_execution_health_metrics()
RETURNS TABLE(
    active_executions BIGINT,
    failed_executions_last_hour BIGINT,
    avg_duration_last_hour NUMERIC,
    error_rate_last_hour NUMERIC,
    long_running_executions BIGINT,
    memory_usage_percentile_95 BIGINT,
    active_alerts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM execution_logs WHERE status IN ('running', 'paused', 'queued'))::BIGINT,
        (SELECT COUNT(*) FROM execution_logs WHERE status = 'failed' AND started_at > NOW() - INTERVAL '1 hour')::BIGINT,
        (SELECT AVG(duration_ms) FROM execution_logs WHERE completed_at > NOW() - INTERVAL '1 hour')::NUMERIC,
        (SELECT 
            CASE 
                WHEN COUNT(*) = 0 THEN 0::NUMERIC
                ELSE (COUNT(*) FILTER (WHERE status = 'failed'))::NUMERIC / COUNT(*) * 100
            END
         FROM execution_logs WHERE started_at > NOW() - INTERVAL '1 hour')::NUMERIC,
        (SELECT COUNT(*) FROM execution_logs 
         WHERE status IN ('running', 'paused') 
         AND started_at < NOW() - INTERVAL '1 hour')::BIGINT,
        (SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY (resource_usage->>'memoryUsed')::BIGINT)
         FROM execution_logs WHERE started_at > NOW() - INTERVAL '1 hour'
         AND resource_usage->>'memoryUsed' IS NOT NULL)::BIGINT,
        (SELECT COUNT(*) FROM execution_alerts WHERE status = 'active')::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries and dashboards

-- Active executions view
CREATE OR REPLACE VIEW active_executions AS
SELECT 
    el.execution_id,
    el.execution_type,
    el.operation,
    el.component,
    el.status,
    el.priority,
    el.initiated_by,
    el.started_at,
    el.progress_percentage,
    el.current_step,
    EXTRACT(EPOCH FROM (NOW() - el.started_at))::INTEGER as runtime_seconds,
    jsonb_array_length(el.errors) as error_count,
    jsonb_array_length(el.warnings) as warning_count,
    (el.resource_usage->>'memoryUsed')::BIGINT as memory_used,
    (el.resource_usage->>'cpuTime')::INTEGER as cpu_time_ms
FROM execution_logs el
WHERE el.status IN ('queued', 'initializing', 'running', 'paused', 'retrying')
ORDER BY el.started_at DESC;

-- Failed executions view
CREATE OR REPLACE VIEW failed_executions AS
SELECT 
    el.execution_id,
    el.execution_type,
    el.operation,
    el.component,
    el.initiated_by,
    el.started_at,
    el.completed_at,
    el.duration_ms,
    jsonb_array_length(el.errors) as error_count,
    el.errors->0->>'message' as primary_error_message,
    el.errors->0->>'errorType' as primary_error_type
FROM execution_logs el
WHERE el.status = 'failed'
ORDER BY el.started_at DESC;

-- Execution performance summary view
CREATE OR REPLACE VIEW execution_performance_summary AS
SELECT 
    el.execution_type,
    el.operation,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE el.status = 'completed') as successful_executions,
    COUNT(*) FILTER (WHERE el.status = 'failed') as failed_executions,
    ROUND(AVG(el.duration_ms)::NUMERIC, 2) as avg_duration_ms,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY el.duration_ms)::NUMERIC, 2) as p95_duration_ms,
    ROUND(AVG((el.resource_usage->>'memoryUsed')::BIGINT)::NUMERIC / 1024 / 1024, 2) as avg_memory_mb,
    ROUND((COUNT(*) FILTER (WHERE el.status = 'completed'))::NUMERIC / COUNT(*) * 100, 2) as success_rate_percent
FROM execution_logs el
WHERE el.started_at > NOW() - INTERVAL '24 hours'
AND el.status IN ('completed', 'failed')
GROUP BY el.execution_type, el.operation
HAVING COUNT(*) >= 5
ORDER BY total_executions DESC;

-- Comments for documentation
COMMENT ON TABLE execution_logs IS 'Core table for tracking all execution logs with comprehensive metadata and metrics';
COMMENT ON TABLE execution_hierarchy IS 'Maintains hierarchical relationships between executions for efficient tree queries';
COMMENT ON TABLE execution_metrics_snapshots IS 'Time-series performance metrics snapshots for monitoring and analysis';
COMMENT ON TABLE execution_alerts IS 'Automated alerts based on execution performance and error thresholds';
COMMENT ON TABLE execution_statistics IS 'Aggregated statistics for reporting and dashboard display';
COMMENT ON TABLE execution_dependencies IS 'Tracks external dependencies and their health status for each execution';

COMMENT ON COLUMN execution_logs.context IS 'Execution context including system, request, network, and business context information';
COMMENT ON COLUMN execution_logs.performance_metrics IS 'Performance metrics including timing, throughput, latency, and custom metrics';
COMMENT ON COLUMN execution_logs.resource_usage IS 'Resource consumption metrics including CPU, memory, disk, and network usage';
COMMENT ON COLUMN execution_logs.security_context IS 'Security-related context including authentication, authorization, and compliance information';

COMMENT ON VIEW active_executions IS 'Current active executions with runtime metrics and progress information';
COMMENT ON VIEW failed_executions IS 'Recent failed executions with primary error information';
COMMENT ON VIEW execution_performance_summary IS 'Performance summary statistics grouped by execution type and operation';

COMMENT ON FUNCTION cleanup_execution_data IS 'Maintenance function to clean up old execution logs, snapshots, and alerts';
COMMENT ON FUNCTION get_execution_health_metrics IS 'Generate real-time health metrics for execution monitoring dashboard';