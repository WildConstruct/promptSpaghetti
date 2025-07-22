-- Log Analysis System Database Schema - Epic 17
-- Task: E17-1753114397254-30EC53 - Create log analysis
-- 
-- Comprehensive database schema for log analysis system that provides
-- intelligent log parsing, anomaly detection, pattern recognition, and
-- automated incident response.

-- ==========================================
-- Log Analysis Entries Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_entries (
    log_id VARCHAR(100) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN (
        'debug', 'info', 'warn', 'error', 'fatal', 'trace'
    )),
    source VARCHAR(50) NOT NULL CHECK (source IN (
        'application', 'database', 'web_server', 'system',
        'security', 'audit', 'performance', 'user_activity'
    )),
    component VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    user_id VARCHAR(100),
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    stack_trace TEXT,
    metadata JSONB DEFAULT '{}',
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for log analysis entries
CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_analysis_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_log_entries_level ON log_analysis_entries(level);
CREATE INDEX IF NOT EXISTS idx_log_entries_source ON log_analysis_entries(source);
CREATE INDEX IF NOT EXISTS idx_log_entries_component ON log_analysis_entries(component);
CREATE INDEX IF NOT EXISTS idx_log_entries_processed ON log_analysis_entries(processed);
CREATE INDEX IF NOT EXISTS idx_log_entries_user_id ON log_analysis_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_session_id ON log_analysis_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_request_id ON log_analysis_entries(request_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_ip_address ON log_analysis_entries(ip_address);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_log_entries_source_level ON log_analysis_entries(source, level);
CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp_processed ON log_analysis_entries(timestamp DESC, processed);
CREATE INDEX IF NOT EXISTS idx_log_entries_level_timestamp ON log_analysis_entries(level, timestamp DESC);

-- GIN index for full-text search on message
CREATE INDEX IF NOT EXISTS idx_log_entries_message_gin ON log_analysis_entries USING GIN (to_tsvector('english', message));

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_log_entries_context_gin ON log_analysis_entries USING GIN (context);
CREATE INDEX IF NOT EXISTS idx_log_entries_metadata_gin ON log_analysis_entries USING GIN (metadata);

-- ==========================================
-- Log Analysis Rules Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_rules (
    rule_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    log_sources JSONB NOT NULL DEFAULT '[]',
    log_levels JSONB NOT NULL DEFAULT '[]',
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
        'regex', 'keyword', 'statistical', 'ml_based', 'custom'
    )),
    pattern_definition JSONB NOT NULL DEFAULT '{}',
    anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN (
        'error_spike', 'performance_degradation', 'unusual_activity',
        'security_threat', 'system_failure', 'data_anomaly',
        'access_anomaly', 'volume_anomaly'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'critical', 'high', 'medium', 'low', 'info'
    )),
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL
);

-- Indexes for log analysis rules
CREATE INDEX IF NOT EXISTS idx_log_rules_enabled ON log_analysis_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_log_rules_anomaly_type ON log_analysis_rules(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_log_rules_severity ON log_analysis_rules(severity);
CREATE INDEX IF NOT EXISTS idx_log_rules_pattern_type ON log_analysis_rules(pattern_type);
CREATE INDEX IF NOT EXISTS idx_log_rules_created_at ON log_analysis_rules(created_at DESC);

-- ==========================================
-- Log Analysis Sessions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN (
        'real_time', 'batch', 'historical', 'custom'
    )),
    log_sources JSONB NOT NULL DEFAULT '[]',
    log_levels JSONB NOT NULL DEFAULT '[]',
    time_range JSONB NOT NULL DEFAULT '{}',
    filters JSONB NOT NULL DEFAULT '{}',
    analysis_rules JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
    )),
    results JSONB NOT NULL DEFAULT '{}',
    execution_timeline JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for log analysis sessions
CREATE INDEX IF NOT EXISTS idx_log_sessions_status ON log_analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_log_sessions_analysis_type ON log_analysis_sessions(analysis_type);
CREATE INDEX IF NOT EXISTS idx_log_sessions_created_by ON log_analysis_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_log_sessions_created_at ON log_analysis_sessions(created_at DESC);

-- ==========================================
-- Log Analysis Alerts Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_alerts (
    alert_id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100),
    rule_id VARCHAR(100),
    anomaly_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'critical', 'high', 'medium', 'low', 'info'
    )),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    affected_logs JSONB NOT NULL DEFAULT '[]',
    trigger_conditions_met JSONB NOT NULL DEFAULT '{}',
    first_detected TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'new', 'acknowledged', 'investigating', 'resolved', 'false_positive'
    )) DEFAULT 'new',
    assigned_to VARCHAR(100),
    resolution_notes TEXT,
    auto_actions_taken JSONB NOT NULL DEFAULT '[]',
    related_alerts JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_log_alerts_session 
        FOREIGN KEY (session_id) REFERENCES log_analysis_sessions(session_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_log_alerts_rule 
        FOREIGN KEY (rule_id) REFERENCES log_analysis_rules(rule_id)
        ON DELETE SET NULL
);

-- Indexes for log analysis alerts
CREATE INDEX IF NOT EXISTS idx_log_alerts_session_id ON log_analysis_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_log_alerts_rule_id ON log_analysis_alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_log_alerts_anomaly_type ON log_analysis_alerts(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_log_alerts_severity ON log_analysis_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_log_alerts_status ON log_analysis_alerts(status);
CREATE INDEX IF NOT EXISTS idx_log_alerts_assigned_to ON log_analysis_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_log_alerts_first_detected ON log_analysis_alerts(first_detected DESC);
CREATE INDEX IF NOT EXISTS idx_log_alerts_created_at ON log_analysis_alerts(created_at DESC);

-- Composite indexes for common alert queries
CREATE INDEX IF NOT EXISTS idx_log_alerts_status_severity ON log_analysis_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_log_alerts_assigned_status ON log_analysis_alerts(assigned_to, status);

-- ==========================================
-- Log Analysis Patterns Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_patterns (
    pattern_id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100),
    rule_id VARCHAR(100),
    pattern_type VARCHAR(50) NOT NULL,
    pattern_description TEXT NOT NULL,
    occurrences INTEGER NOT NULL DEFAULT 1,
    first_seen TIMESTAMPTZ NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'critical', 'high', 'medium', 'low', 'info'
    )),
    sample_logs JSONB NOT NULL DEFAULT '[]',
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score BETWEEN 0.00 AND 100.00),
    related_components JSONB NOT NULL DEFAULT '[]',
    suggested_actions JSONB NOT NULL DEFAULT '[]',
    pattern_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_log_patterns_session 
        FOREIGN KEY (session_id) REFERENCES log_analysis_sessions(session_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_log_patterns_rule 
        FOREIGN KEY (rule_id) REFERENCES log_analysis_rules(rule_id)
        ON DELETE SET NULL
);

-- Indexes for log analysis patterns
CREATE INDEX IF NOT EXISTS idx_log_patterns_session_id ON log_analysis_patterns(session_id);
CREATE INDEX IF NOT EXISTS idx_log_patterns_rule_id ON log_analysis_patterns(rule_id);
CREATE INDEX IF NOT EXISTS idx_log_patterns_type ON log_analysis_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_log_patterns_severity ON log_analysis_patterns(severity);
CREATE INDEX IF NOT EXISTS idx_log_patterns_confidence ON log_analysis_patterns(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_log_patterns_occurrences ON log_analysis_patterns(occurrences DESC);
CREATE INDEX IF NOT EXISTS idx_log_patterns_first_seen ON log_analysis_patterns(first_seen DESC);

-- ==========================================
-- Log Analysis Metrics Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_metrics (
    metric_id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100),
    metric_name VARCHAR(200) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit VARCHAR(50),
    metric_type VARCHAR(50) CHECK (metric_type IN (
        'performance', 'volume', 'error_rate', 'processing_time',
        'accuracy', 'throughput', 'resource_usage'
    )),
    measurement_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    aggregation_period VARCHAR(20) CHECK (aggregation_period IN (
        'minute', 'hour', 'day', 'week', 'month'
    )),
    tags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Foreign key constraint
    CONSTRAINT fk_log_metrics_session 
        FOREIGN KEY (session_id) REFERENCES log_analysis_sessions(session_id)
        ON DELETE SET NULL
);

-- Indexes for log analysis metrics
CREATE INDEX IF NOT EXISTS idx_log_metrics_session_id ON log_analysis_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_log_metrics_name ON log_analysis_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_log_metrics_type ON log_analysis_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_log_metrics_time ON log_analysis_metrics(measurement_time DESC);
CREATE INDEX IF NOT EXISTS idx_log_metrics_aggregation ON log_analysis_metrics(aggregation_period);

-- ==========================================
-- Log Analysis Configuration Table
-- ==========================================

CREATE TABLE IF NOT EXISTS log_analysis_config (
    config_id VARCHAR(100) PRIMARY KEY,
    config_name VARCHAR(200) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN (
        'system', 'analysis', 'alert', 'performance', 'storage', 'ml'
    )),
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL
);

-- Indexes for log analysis configuration
CREATE INDEX IF NOT EXISTS idx_log_config_name ON log_analysis_config(config_name);
CREATE INDEX IF NOT EXISTS idx_log_config_type ON log_analysis_config(config_type);
CREATE INDEX IF NOT EXISTS idx_log_config_active ON log_analysis_config(is_active);

-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_log_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS trg_log_rules_updated_at ON log_analysis_rules;
CREATE TRIGGER trg_log_rules_updated_at
    BEFORE UPDATE ON log_analysis_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_log_analysis_timestamp();

DROP TRIGGER IF EXISTS trg_log_sessions_updated_at ON log_analysis_sessions;
CREATE TRIGGER trg_log_sessions_updated_at
    BEFORE UPDATE ON log_analysis_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_log_analysis_timestamp();

DROP TRIGGER IF EXISTS trg_log_alerts_updated_at ON log_analysis_alerts;
CREATE TRIGGER trg_log_alerts_updated_at
    BEFORE UPDATE ON log_analysis_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_log_analysis_timestamp();

DROP TRIGGER IF EXISTS trg_log_patterns_updated_at ON log_analysis_patterns;
CREATE TRIGGER trg_log_patterns_updated_at
    BEFORE UPDATE ON log_analysis_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_log_analysis_timestamp();

DROP TRIGGER IF EXISTS trg_log_config_updated_at ON log_analysis_config;
CREATE TRIGGER trg_log_config_updated_at
    BEFORE UPDATE ON log_analysis_config
    FOR EACH ROW
    EXECUTE FUNCTION update_log_analysis_timestamp();

-- ==========================================
-- Views for Common Queries
-- ==========================================

-- Active alerts view
CREATE OR REPLACE VIEW active_log_alerts AS
SELECT 
    a.*,
    r.name as rule_name,
    r.anomaly_type as rule_anomaly_type,
    s.name as session_name
FROM log_analysis_alerts a
LEFT JOIN log_analysis_rules r ON a.rule_id = r.rule_id
LEFT JOIN log_analysis_sessions s ON a.session_id = s.session_id
WHERE a.status NOT IN ('resolved', 'false_positive');

-- Recent critical logs view
CREATE OR REPLACE VIEW recent_critical_logs AS
SELECT 
    log_id,
    timestamp,
    level,
    source,
    component,
    message,
    user_id,
    ip_address,
    created_at
FROM log_analysis_entries
WHERE level IN ('error', 'fatal') 
AND timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Log analysis summary view
CREATE OR REPLACE VIEW log_analysis_summary AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour_bucket,
    source,
    level,
    COUNT(*) as log_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT component) as unique_components
FROM log_analysis_entries
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', timestamp), source, level
ORDER BY hour_bucket DESC;

-- Pattern analysis view
CREATE OR REPLACE VIEW pattern_analysis_summary AS
SELECT 
    p.pattern_type,
    p.severity,
    COUNT(*) as pattern_count,
    AVG(p.confidence_score) as avg_confidence,
    SUM(p.occurrences) as total_occurrences,
    MIN(p.first_seen) as earliest_detection,
    MAX(p.last_seen) as latest_detection
FROM log_analysis_patterns p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.pattern_type, p.severity
ORDER BY pattern_count DESC;

-- ==========================================
-- Functions for Log Analysis Operations
-- ==========================================

-- Function to get error rate for a time period
CREATE OR REPLACE FUNCTION get_error_rate(
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    log_source VARCHAR DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_logs INTEGER;
    error_logs INTEGER;
    error_rate DECIMAL(5,2);
BEGIN
    -- Count total logs
    IF log_source IS NOT NULL THEN
        SELECT COUNT(*) INTO total_logs
        FROM log_analysis_entries
        WHERE timestamp BETWEEN start_time AND end_time
        AND source = log_source;
        
        SELECT COUNT(*) INTO error_logs
        FROM log_analysis_entries
        WHERE timestamp BETWEEN start_time AND end_time
        AND source = log_source
        AND level IN ('error', 'fatal');
    ELSE
        SELECT COUNT(*) INTO total_logs
        FROM log_analysis_entries
        WHERE timestamp BETWEEN start_time AND end_time;
        
        SELECT COUNT(*) INTO error_logs
        FROM log_analysis_entries
        WHERE timestamp BETWEEN start_time AND end_time
        AND level IN ('error', 'fatal');
    END IF;
    
    -- Calculate error rate
    IF total_logs > 0 THEN
        error_rate = (error_logs::DECIMAL / total_logs) * 100;
    ELSE
        error_rate = 0;
    END IF;
    
    RETURN error_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to detect anomalies in log volume
CREATE OR REPLACE FUNCTION detect_volume_anomaly(
    log_source VARCHAR,
    threshold_multiplier DECIMAL DEFAULT 3.0
)
RETURNS TABLE(
    hour_bucket TIMESTAMPTZ,
    actual_count BIGINT,
    expected_range_min DECIMAL,
    expected_range_max DECIMAL,
    is_anomaly BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH hourly_counts AS (
        SELECT 
            DATE_TRUNC('hour', timestamp) as hour,
            COUNT(*) as count
        FROM log_analysis_entries
        WHERE source = log_source
        AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('hour', timestamp)
    ),
    stats AS (
        SELECT 
            AVG(count) as avg_count,
            STDDEV(count) as stddev_count
        FROM hourly_counts
    )
    SELECT 
        hc.hour,
        hc.count,
        (s.avg_count - (s.stddev_count * threshold_multiplier)),
        (s.avg_count + (s.stddev_count * threshold_multiplier)),
        (hc.count < (s.avg_count - (s.stddev_count * threshold_multiplier)) OR
         hc.count > (s.avg_count + (s.stddev_count * threshold_multiplier)))
    FROM hourly_counts hc, stats s
    WHERE hc.hour >= NOW() - INTERVAL '24 hours'
    ORDER BY hc.hour DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old log entries
CREATE OR REPLACE FUNCTION cleanup_old_log_entries(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Archive old log entries to a backup table first (if needed)
    -- DELETE old entries
    DELETE FROM log_analysis_entries 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old completed sessions
    DELETE FROM log_analysis_sessions 
    WHERE status IN ('completed', 'failed', 'cancelled') 
    AND created_at < CURRENT_DATE - INTERVAL '1 day' * (retention_days / 3);
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old resolved alerts
    DELETE FROM log_analysis_alerts 
    WHERE status IN ('resolved', 'false_positive') 
    AND created_at < CURRENT_DATE - INTERVAL '1 day' * (retention_days / 2);
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old metrics
    DELETE FROM log_analysis_metrics 
    WHERE measurement_time < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Log cleanup activity
    INSERT INTO log_analysis_entries (
        log_id, timestamp, level, source, component, message, context
    ) VALUES (
        'cleanup_' || EXTRACT(EPOCH FROM NOW())::TEXT,
        NOW(),
        'info',
        'system',
        'log_analysis_cleanup',
        'Log analysis data cleanup completed',
        json_build_object('deleted_records', deleted_count, 'retention_days', retention_days)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Initial Configuration Data
-- ==========================================

-- Insert default system configuration
INSERT INTO log_analysis_config (config_id, config_name, config_value, config_type, description, created_by, updated_by) 
VALUES 
    ('system_enabled', 'enabled', 'true', 'system', 'Enable log analysis system', 'system', 'system'),
    ('system_max_sessions', 'max_concurrent_sessions', '5', 'system', 'Maximum concurrent analysis sessions', 'system', 'system'),
    ('system_batch_size', 'default_batch_size', '10000', 'system', 'Default batch size for log processing', 'system', 'system'),
    ('system_interval', 'real_time_processing_interval_seconds', '5', 'system', 'Real-time processing interval in seconds', 'system', 'system'),
    ('system_retention', 'retention_days', '90', 'system', 'Log retention period in days', 'system', 'system'),
    ('analysis_ml_enabled', 'enable_ml_analysis', 'true', 'analysis', 'Enable machine learning analysis', 'system', 'system'),
    ('analysis_pattern_enabled', 'enable_pattern_detection', 'true', 'analysis', 'Enable pattern detection', 'system', 'system'),
    ('analysis_anomaly_enabled', 'enable_anomaly_detection', 'true', 'analysis', 'Enable anomaly detection', 'system', 'system'),
    ('analysis_performance_enabled', 'enable_performance_analysis', 'true', 'analysis', 'Enable performance analysis', 'system', 'system'),
    ('analysis_ml_threshold', 'ml_confidence_threshold', '0.8', 'analysis', 'ML confidence threshold', 'system', 'system'),
    ('analysis_pattern_threshold', 'pattern_detection_threshold', '0.7', 'analysis', 'Pattern detection threshold', 'system', 'system'),
    ('alert_auto_enabled', 'enable_auto_alerts', 'true', 'alert', 'Enable automatic alert generation', 'system', 'system'),
    ('alert_aggregation_window', 'alert_aggregation_window_minutes', '5', 'alert', 'Alert aggregation window in minutes', 'system', 'system'),
    ('alert_max_per_hour', 'max_alerts_per_hour', '20', 'alert', 'Maximum alerts per hour', 'system', 'system'),
    ('alert_suppression', 'enable_alert_suppression', 'true', 'alert', 'Enable alert suppression', 'system', 'system'),
    ('performance_max_memory', 'max_memory_usage_mb', '2048', 'performance', 'Maximum memory usage in MB', 'system', 'system'),
    ('performance_max_time', 'max_processing_time_minutes', '30', 'performance', 'Maximum processing time in minutes', 'system', 'system'),
    ('performance_parallel', 'enable_parallel_processing', 'true', 'performance', 'Enable parallel processing', 'system', 'system'),
    ('performance_workers', 'worker_threads', '4', 'performance', 'Number of worker threads', 'system', 'system'),
    ('storage_compress', 'compress_old_logs', 'true', 'storage', 'Compress old log entries', 'system', 'system'),
    ('storage_archive_days', 'archive_logs_after_days', '30', 'storage', 'Archive logs after days', 'system', 'system'),
    ('storage_max_size', 'max_log_size_mb', '100', 'storage', 'Maximum log size in MB', 'system', 'system')
ON CONFLICT (config_id) DO NOTHING;

-- ==========================================
-- Sample Analysis Rules
-- ==========================================

-- Insert sample analysis rules
INSERT INTO log_analysis_rules (
    rule_id, name, description, log_sources, log_levels, pattern_type,
    pattern_definition, anomaly_type, severity, trigger_conditions,
    actions, created_by, updated_by
) VALUES 
    (
        'rule_error_spike',
        'Error Spike Detection',
        'Detects sudden increases in error rates across all sources',
        '["application", "database", "web_server"]',
        '["error", "fatal"]',
        'statistical',
        '{"statistical_threshold": 3.0, "statistical_window_minutes": 15}',
        'error_spike',
        'high',
        '{"min_occurrences": 10, "time_window_minutes": 5}',
        '{"create_alert": true, "send_notification": true, "trigger_recovery": true}',
        'system',
        'system'
    ),
    (
        'rule_security_threat',
        'Security Threat Detection',
        'Detects potential security threats in security logs',
        '["security", "audit"]',
        '["warn", "error", "fatal"]',
        'keyword',
        '{"keywords": ["failed login", "brute force", "unauthorized", "intrusion", "malware"]}',
        'security_threat',
        'critical',
        '{"min_occurrences": 3, "time_window_minutes": 10}',
        '{"create_alert": true, "send_notification": true, "escalate_to": ["security-team@company.com"]}',
        'system',
        'system'
    ),
    (
        'rule_performance_degradation',
        'Performance Degradation Detection',
        'Detects performance issues from slow response times',
        '["application", "web_server"]',
        '["warn", "info"]',
        'regex',
        '{"regex": "response.*time.*(\\\\d+)ms.*slow|timeout|performance"}',
        'performance_degradation',
        'medium',
        '{"min_occurrences": 20, "time_window_minutes": 15, "threshold_value": 5000}',
        '{"create_alert": true, "send_notification": false}',
        'system',
        'system'
    ),
    (
        'rule_system_failure',
        'System Failure Detection',
        'Detects critical system failures requiring immediate attention',
        '["system", "application", "database"]',
        '["fatal", "error"]',
        'keyword',
        '{"keywords": ["system failure", "critical error", "database down", "service unavailable", "crash"]}',
        'system_failure',
        'critical',
        '{"min_occurrences": 1, "time_window_minutes": 1}',
        '{"create_alert": true, "send_notification": true, "trigger_recovery": true, "escalate_to": ["ops-team@company.com"]}',
        'system',
        'system'
    )
ON CONFLICT (rule_id) DO NOTHING;

-- ==========================================
-- Security and Permissions
-- ==========================================

-- Create role for log analysis access
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'log_analysis_role') THEN
        CREATE ROLE log_analysis_role;
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT ON log_analysis_entries TO log_analysis_role;
GRANT SELECT, INSERT, UPDATE ON log_analysis_rules TO log_analysis_role;
GRANT SELECT, INSERT, UPDATE ON log_analysis_sessions TO log_analysis_role;
GRANT SELECT, INSERT, UPDATE ON log_analysis_alerts TO log_analysis_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON log_analysis_patterns TO log_analysis_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON log_analysis_metrics TO log_analysis_role;
GRANT SELECT ON log_analysis_config TO log_analysis_role;
GRANT SELECT ON active_log_alerts TO log_analysis_role;
GRANT SELECT ON recent_critical_logs TO log_analysis_role;
GRANT SELECT ON log_analysis_summary TO log_analysis_role;
GRANT SELECT ON pattern_analysis_summary TO log_analysis_role;

-- ==========================================
-- Comments for Documentation
-- ==========================================

COMMENT ON TABLE log_analysis_entries IS 'Stores all log entries for analysis with metadata and context';
COMMENT ON TABLE log_analysis_rules IS 'Defines analysis rules for pattern detection and anomaly identification';
COMMENT ON TABLE log_analysis_sessions IS 'Tracks analysis sessions with their configuration and results';
COMMENT ON TABLE log_analysis_alerts IS 'Stores alerts generated from log analysis with status tracking';
COMMENT ON TABLE log_analysis_patterns IS 'Discovered patterns from log analysis with confidence scores';
COMMENT ON TABLE log_analysis_metrics IS 'Performance and analysis metrics collected during log processing';
COMMENT ON TABLE log_analysis_config IS 'System configuration settings for log analysis behavior';

COMMENT ON VIEW active_log_alerts IS 'Currently active alerts requiring attention';
COMMENT ON VIEW recent_critical_logs IS 'Recent critical log entries for immediate visibility';
COMMENT ON VIEW log_analysis_summary IS 'Hourly summary of log activity for trending analysis';
COMMENT ON VIEW pattern_analysis_summary IS 'Summary of detected patterns for analysis effectiveness';

COMMENT ON FUNCTION get_error_rate IS 'Calculates error rate percentage for a given time period and source';
COMMENT ON FUNCTION detect_volume_anomaly IS 'Detects anomalies in log volume using statistical analysis';
COMMENT ON FUNCTION cleanup_old_log_entries IS 'Cleans up old log analysis data based on retention policy';

-- ==========================================
-- Migration Completion
-- ==========================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Log Analysis System migration completed successfully';
    RAISE NOTICE 'Tables created: log_analysis_entries, log_analysis_rules, log_analysis_sessions, log_analysis_alerts, log_analysis_patterns, log_analysis_metrics, log_analysis_config';
    RAISE NOTICE 'Views created: active_log_alerts, recent_critical_logs, log_analysis_summary, pattern_analysis_summary';
    RAISE NOTICE 'Functions created: get_error_rate, detect_volume_anomaly, cleanup_old_log_entries';
    RAISE NOTICE 'Sample data inserted: 4 analysis rules, 22 configuration entries';
END $$;