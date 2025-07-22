-- Migration: Add Restore Functionality Tables
-- Epic 19 - Security & Compliance Framework - Data Protection & Privacy Controls
-- Task: E17-1753114397283-9514BA

-- Restore requests table - stores restore operation requests
CREATE TABLE IF NOT EXISTS restore_requests (
    restore_id VARCHAR(255) PRIMARY KEY,
    recovery_point_id VARCHAR(255) NOT NULL REFERENCES recovery_points(recovery_point_id) ON DELETE RESTRICT,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN (
        'full_restore', 'table_restore', 'record_restore', 'schema_restore', 
        'data_restore', 'differential_restore', 'selective_restore'
    )),
    restore_scope VARCHAR(20) NOT NULL CHECK (restore_scope IN (
        'full_database', 'table_level', 'record_level', 'schema_only', 'data_only'
    )),
    strategy VARCHAR(20) NOT NULL CHECK (strategy IN (
        'replace', 'merge', 'append', 'compare_first', 'backup_first'
    )) DEFAULT 'replace',
    
    -- Target configuration
    target_database VARCHAR(255),
    target_schema VARCHAR(255),
    target_tables JSONB DEFAULT '[]'::jsonb,
    target_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Filtering and selection
    table_filters JSONB NOT NULL DEFAULT '{
        "include_tables": ["*"],
        "exclude_tables": [],
        "where_conditions": {},
        "limit_records": null
    }'::jsonb,
    
    -- Restore behavior
    validation_level VARCHAR(20) NOT NULL CHECK (validation_level IN (
        'none', 'basic', 'full', 'business_rules', 'compliance'
    )) DEFAULT 'full',
    pre_restore_backup BOOLEAN DEFAULT TRUE,
    post_restore_validation BOOLEAN DEFAULT TRUE,
    rollback_on_failure BOOLEAN DEFAULT TRUE,
    
    -- Conflict resolution
    conflict_resolution JSONB NOT NULL DEFAULT '{
        "duplicate_handling": "replace",
        "constraint_violations": "error",
        "missing_dependencies": "create"
    }'::jsonb,
    
    -- Performance and limits
    batch_size INTEGER DEFAULT 1000,
    max_duration_minutes INTEGER,
    parallel_processing BOOLEAN DEFAULT FALSE,
    memory_limit_mb INTEGER,
    
    -- Request metadata
    requested_by VARCHAR(255) NOT NULL,
    request_reason TEXT NOT NULL,
    business_justification TEXT NOT NULL,
    compliance_approval_id VARCHAR(255),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE
);

-- Restore executions table - tracks actual restore operation execution
CREATE TABLE IF NOT EXISTS restore_executions (
    execution_id VARCHAR(255) PRIMARY KEY,
    restore_id VARCHAR(255) NOT NULL REFERENCES restore_requests(restore_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending', 'validating', 'preparing', 'restoring', 'post_validating', 
        'completed', 'failed', 'cancelled', 'rolled_back'
    )) DEFAULT 'pending',
    
    -- Execution tracking
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    current_phase VARCHAR(100),
    
    -- Processing statistics
    records_identified BIGINT DEFAULT 0,
    records_processed BIGINT DEFAULT 0,
    records_restored BIGINT DEFAULT 0,
    records_skipped BIGINT DEFAULT 0,
    records_failed BIGINT DEFAULT 0,
    
    -- Performance metrics
    throughput_records_per_second DECIMAL(10,2) DEFAULT 0,
    average_record_size_bytes INTEGER DEFAULT 0,
    total_data_processed_mb DECIMAL(12,2) DEFAULT 0,
    memory_usage_mb INTEGER DEFAULT 0,
    
    -- Rollback information
    rollback_point_id VARCHAR(255), -- References recovery_points, but no FK to avoid circular dependency
    can_rollback BOOLEAN DEFAULT FALSE,
    rollback_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Execution metadata
    executed_by VARCHAR(255) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore validation results - stores pre and post-restore validation
CREATE TABLE IF NOT EXISTS restore_validation_results (
    validation_id VARCHAR(255) PRIMARY KEY,
    restore_id VARCHAR(255) NOT NULL REFERENCES restore_requests(restore_id) ON DELETE CASCADE,
    validation_type VARCHAR(20) NOT NULL CHECK (validation_type IN ('pre_restore', 'post_restore')),
    validation_level VARCHAR(20) NOT NULL CHECK (validation_level IN (
        'none', 'basic', 'full', 'business_rules', 'compliance'
    )),
    is_valid BOOLEAN NOT NULL,
    
    -- Schema validation results
    schema_issues JSONB DEFAULT '{
        "missing_tables": [],
        "missing_columns": [],
        "type_mismatches": [],
        "constraint_violations": []
    }'::jsonb,
    
    -- Data validation results
    data_issues JSONB DEFAULT '{
        "referential_integrity_errors": 0,
        "unique_constraint_violations": 0,
        "check_constraint_violations": 0,
        "null_constraint_violations": 0
    }'::jsonb,
    
    -- Business rule validation results
    business_rule_violations JSONB DEFAULT '[]'::jsonb,
    
    -- Compliance validation results
    compliance_issues JSONB DEFAULT '{
        "data_classification_violations": 0,
        "retention_policy_violations": 0,
        "privacy_rule_violations": 0
    }'::jsonb,
    
    -- Validation metadata
    validation_duration_seconds INTEGER,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_by VARCHAR(255) NOT NULL
);

-- Restore errors - detailed error tracking during restore operations
CREATE TABLE IF NOT EXISTS restore_errors (
    error_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES restore_executions(execution_id) ON DELETE CASCADE,
    error_type VARCHAR(20) NOT NULL CHECK (error_type IN (
        'schema', 'data', 'constraint', 'permission', 'resource', 'business_rule'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    error_message TEXT NOT NULL,
    error_context JSONB DEFAULT '{}'::jsonb,
    table_name VARCHAR(255),
    record_identifier JSONB,
    suggested_resolution TEXT,
    is_recoverable BOOLEAN DEFAULT TRUE,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore warnings - non-critical issues during restore operations
CREATE TABLE IF NOT EXISTS restore_warnings (
    warning_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES restore_executions(execution_id) ON DELETE CASCADE,
    warning_type VARCHAR(20) NOT NULL CHECK (warning_type IN (
        'data_quality', 'performance', 'compatibility', 'compliance'
    )),
    warning_message TEXT NOT NULL,
    warning_context JSONB DEFAULT '{}'::jsonb,
    table_name VARCHAR(255),
    record_count INTEGER,
    impact_assessment VARCHAR(20) NOT NULL CHECK (impact_assessment IN ('low', 'medium', 'high')),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore log entries - detailed execution log
CREATE TABLE IF NOT EXISTS restore_log_entries (
    entry_id VARCHAR(255) PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES restore_executions(execution_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    phase VARCHAR(100) NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    duration_ms INTEGER
);

-- Restore analytics - performance and quality analytics for restore operations
CREATE TABLE IF NOT EXISTS restore_analytics (
    analytics_id VARCHAR(255) PRIMARY KEY,
    restore_id VARCHAR(255) NOT NULL REFERENCES restore_requests(restore_id) ON DELETE CASCADE,
    execution_id VARCHAR(255) REFERENCES restore_executions(execution_id) ON DELETE CASCADE,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Success metrics
    overall_success_rate DECIMAL(5,2),
    data_integrity_score INTEGER CHECK (data_integrity_score BETWEEN 0 AND 100),
    performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
    
    -- Impact analysis
    business_impact JSONB DEFAULT '{
        "affected_users": 0,
        "affected_transactions": 0,
        "downtime_minutes": 0,
        "data_freshness_hours": 0
    }'::jsonb,
    
    -- Quality assessment
    data_quality JSONB DEFAULT '{
        "completeness_percentage": 0,
        "accuracy_percentage": 0,
        "consistency_score": 0,
        "validity_percentage": 0
    }'::jsonb,
    
    -- Compliance assessment
    compliance_status JSONB DEFAULT '{
        "gdpr_compliant": true,
        "hipaa_compliant": true,
        "sox_compliant": true,
        "custom_compliance_scores": {}
    }'::jsonb,
    
    -- Recommendations
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    analyzed_by VARCHAR(255) NOT NULL
);

-- Restore schedules - manages scheduled restore operations
CREATE TABLE IF NOT EXISTS restore_schedules (
    schedule_id VARCHAR(255) PRIMARY KEY,
    restore_id VARCHAR(255) NOT NULL REFERENCES restore_requests(restore_id) ON DELETE CASCADE,
    schedule_name VARCHAR(500) NOT NULL,
    
    -- Schedule timing
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    retry_attempts INTEGER DEFAULT 0,
    max_retry_attempts INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 30,
    
    -- Schedule status
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'scheduled', 'running', 'completed', 'failed', 'cancelled', 'retrying'
    )) DEFAULT 'scheduled',
    last_execution_id VARCHAR(255),
    
    -- Conditions and dependencies
    execution_conditions JSONB DEFAULT '{}'::jsonb,
    dependency_checks JSONB DEFAULT '[]'::jsonb,
    
    -- Notification settings
    notify_on_completion BOOLEAN DEFAULT TRUE,
    notify_on_failure BOOLEAN DEFAULT TRUE,
    notification_recipients JSONB DEFAULT '[]'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Restore metrics - aggregated performance metrics
CREATE TABLE IF NOT EXISTS restore_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour BETWEEN 0 AND 23),
    
    -- Volume metrics
    total_restore_requests INTEGER DEFAULT 0,
    total_restore_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    cancelled_executions INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_execution_time_minutes DECIMAL(10,2) DEFAULT 0,
    avg_throughput_records_per_second DECIMAL(10,2) DEFAULT 0,
    avg_data_processed_mb DECIMAL(12,2) DEFAULT 0,
    
    -- Success metrics
    overall_success_rate DECIMAL(5,2) DEFAULT 0,
    avg_data_integrity_score DECIMAL(5,2) DEFAULT 0,
    avg_performance_score DECIMAL(5,2) DEFAULT 0,
    
    -- Error metrics
    total_errors INTEGER DEFAULT 0,
    total_warnings INTEGER DEFAULT 0,
    critical_errors INTEGER DEFAULT 0,
    
    -- Resource utilization
    avg_memory_usage_mb DECIMAL(10,2) DEFAULT 0,
    peak_memory_usage_mb INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, metric_hour)
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_restore_requests_recovery_point ON restore_requests(recovery_point_id);
CREATE INDEX IF NOT EXISTS idx_restore_requests_requested_by ON restore_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_restore_requests_operation_type ON restore_requests(operation_type);
CREATE INDEX IF NOT EXISTS idx_restore_requests_created_at ON restore_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_restore_requests_scheduled_for ON restore_requests(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_restore_executions_restore_id ON restore_executions(restore_id);
CREATE INDEX IF NOT EXISTS idx_restore_executions_status ON restore_executions(status);
CREATE INDEX IF NOT EXISTS idx_restore_executions_executed_by ON restore_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_restore_executions_started_at ON restore_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_restore_executions_progress ON restore_executions(progress_percentage);

CREATE INDEX IF NOT EXISTS idx_restore_validation_restore_id ON restore_validation_results(restore_id);
CREATE INDEX IF NOT EXISTS idx_restore_validation_type ON restore_validation_results(validation_type);
CREATE INDEX IF NOT EXISTS idx_restore_validation_valid ON restore_validation_results(is_valid);

CREATE INDEX IF NOT EXISTS idx_restore_errors_execution_id ON restore_errors(execution_id);
CREATE INDEX IF NOT EXISTS idx_restore_errors_type ON restore_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_restore_errors_severity ON restore_errors(severity);
CREATE INDEX IF NOT EXISTS idx_restore_errors_occurred_at ON restore_errors(occurred_at);

CREATE INDEX IF NOT EXISTS idx_restore_warnings_execution_id ON restore_warnings(execution_id);
CREATE INDEX IF NOT EXISTS idx_restore_warnings_type ON restore_warnings(warning_type);
CREATE INDEX IF NOT EXISTS idx_restore_warnings_impact ON restore_warnings(impact_assessment);

CREATE INDEX IF NOT EXISTS idx_restore_log_execution_id ON restore_log_entries(execution_id);
CREATE INDEX IF NOT EXISTS idx_restore_log_timestamp ON restore_log_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_restore_log_level ON restore_log_entries(level);

CREATE INDEX IF NOT EXISTS idx_restore_analytics_restore_id ON restore_analytics(restore_id);
CREATE INDEX IF NOT EXISTS idx_restore_analytics_execution_id ON restore_analytics(execution_id);
CREATE INDEX IF NOT EXISTS idx_restore_analytics_timestamp ON restore_analytics(analysis_timestamp);

CREATE INDEX IF NOT EXISTS idx_restore_schedules_scheduled_for ON restore_schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_restore_schedules_status ON restore_schedules(status);
CREATE INDEX IF NOT EXISTS idx_restore_schedules_restore_id ON restore_schedules(restore_id);

CREATE INDEX IF NOT EXISTS idx_restore_metrics_date ON restore_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_restore_metrics_date_hour ON restore_metrics(metric_date, metric_hour);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_restore_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restore_executions_updated_at 
    BEFORE UPDATE ON restore_executions 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_restore_updated_at_column();

CREATE TRIGGER update_restore_schedules_updated_at 
    BEFORE UPDATE ON restore_schedules 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_restore_updated_at_column();

-- Trigger to update execution timing when status changes
CREATE OR REPLACE FUNCTION update_restore_execution_timing()
RETURNS TRIGGER AS $$
BEGIN
    -- Set started_at when moving from pending to active status
    IF OLD.status = 'pending' AND NEW.status IN ('validating', 'preparing', 'restoring') THEN
        NEW.started_at = NOW();
    END IF;
    
    -- Set completed_at when reaching terminal status
    IF OLD.status NOT IN ('completed', 'failed', 'cancelled', 'rolled_back') 
       AND NEW.status IN ('completed', 'failed', 'cancelled', 'rolled_back') THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restore_execution_timing_trigger
    BEFORE UPDATE ON restore_executions
    FOR EACH ROW
    EXECUTE PROCEDURE update_restore_execution_timing();

-- Trigger to automatically create analytics when execution completes
CREATE OR REPLACE FUNCTION create_restore_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Create analytics record when execution completes successfully
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        INSERT INTO restore_analytics (
            analytics_id,
            restore_id,
            execution_id,
            overall_success_rate,
            data_integrity_score,
            performance_score,
            analyzed_by
        ) VALUES (
            'analytics-' || NEW.execution_id,
            NEW.restore_id,
            NEW.execution_id,
            CASE 
                WHEN NEW.records_processed > 0 
                THEN (NEW.records_restored::DECIMAL / NEW.records_processed) * 100 
                ELSE 0 
            END,
            85, -- Default data integrity score
            80, -- Default performance score
            'system'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_restore_analytics_trigger
    AFTER UPDATE ON restore_executions
    FOR EACH ROW
    EXECUTE PROCEDURE create_restore_analytics();

-- Views for common queries and dashboards
CREATE OR REPLACE VIEW active_restore_operations AS
SELECT 
    re.*,
    rr.operation_type,
    rr.restore_scope,
    rr.requested_by,
    rr.request_reason,
    rp.name as recovery_point_name,
    rp.point_in_time as recovery_point_time,
    EXTRACT(EPOCH FROM (NOW() - re.started_at)) / 60 as runtime_minutes,
    CASE 
        WHEN re.estimated_completion IS NOT NULL AND re.estimated_completion < NOW() THEN 'overdue'
        WHEN re.progress_percentage >= 90 THEN 'nearly_complete'
        WHEN re.progress_percentage >= 50 THEN 'in_progress'
        ELSE 'starting'
    END as operation_status
FROM restore_executions re
JOIN restore_requests rr ON re.restore_id = rr.restore_id
JOIN recovery_points rp ON rr.recovery_point_id = rp.recovery_point_id
WHERE re.status IN ('validating', 'preparing', 'restoring', 'post_validating')
ORDER BY re.started_at DESC;

CREATE OR REPLACE VIEW restore_performance_summary AS
SELECT 
    DATE_TRUNC('day', re.started_at) as operation_date,
    COUNT(*) as total_operations,
    COUNT(*) FILTER (WHERE re.status = 'completed') as successful_operations,
    COUNT(*) FILTER (WHERE re.status = 'failed') as failed_operations,
    AVG(EXTRACT(EPOCH FROM (re.completed_at - re.started_at))) / 60 as avg_duration_minutes,
    AVG(re.throughput_records_per_second) as avg_throughput,
    SUM(re.total_data_processed_mb) as total_data_processed_mb,
    AVG(ra.data_integrity_score) as avg_data_integrity_score,
    AVG(ra.performance_score) as avg_performance_score
FROM restore_executions re
LEFT JOIN restore_analytics ra ON re.execution_id = ra.execution_id
WHERE re.started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', re.started_at)
ORDER BY operation_date DESC;

CREATE OR REPLACE VIEW restore_error_analysis AS
SELECT 
    DATE_TRUNC('day', re.occurred_at) as error_date,
    re.error_type,
    re.severity,
    COUNT(*) as error_count,
    COUNT(DISTINCT rex.execution_id) as affected_operations,
    array_agg(DISTINCT re.table_name) FILTER (WHERE re.table_name IS NOT NULL) as affected_tables,
    string_agg(DISTINCT re.suggested_resolution, '; ') as common_resolutions
FROM restore_errors re
JOIN restore_executions rex ON re.execution_id = rex.execution_id
WHERE re.occurred_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', re.occurred_at), re.error_type, re.severity
ORDER BY error_date DESC, error_count DESC;

CREATE OR REPLACE VIEW scheduled_restore_queue AS
SELECT 
    rs.*,
    rr.operation_type,
    rr.restore_scope,
    rr.requested_by,
    rp.name as recovery_point_name,
    EXTRACT(EPOCH FROM (rs.scheduled_for - NOW())) / 3600 as hours_until_execution,
    CASE 
        WHEN rs.scheduled_for < NOW() THEN 'overdue'
        WHEN rs.scheduled_for < NOW() + INTERVAL '1 hour' THEN 'due_soon'
        WHEN rs.scheduled_for < NOW() + INTERVAL '24 hours' THEN 'due_today'
        ELSE 'scheduled'
    END as schedule_status
FROM restore_schedules rs
JOIN restore_requests rr ON rs.restore_id = rr.restore_id
JOIN recovery_points rp ON rr.recovery_point_id = rp.recovery_point_id
WHERE rs.status IN ('scheduled', 'retrying')
ORDER BY rs.scheduled_for ASC;

-- Comments for documentation
COMMENT ON TABLE restore_requests IS 'Stores restore operation requests with detailed configuration';
COMMENT ON TABLE restore_executions IS 'Tracks actual execution of restore operations with progress and metrics';
COMMENT ON TABLE restore_validation_results IS 'Pre and post-restore validation results for data integrity';
COMMENT ON TABLE restore_errors IS 'Detailed error tracking during restore operations';
COMMENT ON TABLE restore_warnings IS 'Non-critical issues and warnings during restore operations';
COMMENT ON TABLE restore_log_entries IS 'Detailed execution log for troubleshooting and auditing';
COMMENT ON TABLE restore_analytics IS 'Performance and quality analytics for restore operations';
COMMENT ON TABLE restore_schedules IS 'Manages scheduled execution of restore operations';
COMMENT ON TABLE restore_metrics IS 'Aggregated performance metrics for monitoring and reporting';

COMMENT ON VIEW active_restore_operations IS 'Currently running restore operations with status and progress';
COMMENT ON VIEW restore_performance_summary IS 'Daily performance summary with success rates and throughput';
COMMENT ON VIEW restore_error_analysis IS 'Error analysis with patterns and resolution suggestions';
COMMENT ON VIEW scheduled_restore_queue IS 'Upcoming scheduled restore operations with timing status';