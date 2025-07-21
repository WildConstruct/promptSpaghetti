-- ===================================================================
-- Access History Logging Schema Extension
-- Part of Epic 19 - Security & Compliance Framework
-- Task: E19-1753114711794-54B5BE - Implement access history logging
-- ===================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- Access History Tables
-- ===================================================================

-- Access History Events - Primary access logging table
CREATE TABLE access_history_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure', 'denied', 'partial', 'timeout', 'error')),
    
    -- Resource Information
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    resource_path VARCHAR(500),
    operation VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]', -- Array of permissions
    
    -- User and Session Context
    user_id UUID,
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    
    -- Geographic Context
    geolocation JSONB DEFAULT '{}', -- Country, region, city, coordinates, ISP, VPN detection
    
    -- Device Context
    device_info JSONB DEFAULT '{}', -- Device type, browser, OS, screen resolution, fingerprint
    
    -- Request Context
    request_id VARCHAR(255),
    endpoint VARCHAR(500),
    method VARCHAR(20),
    referrer VARCHAR(500),
    correlation_id VARCHAR(255),
    
    -- Security Context
    auth_method VARCHAR(50),
    tls_version VARCHAR(20),
    cipher_suite VARCHAR(100),
    
    -- Risk Assessment
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB DEFAULT '[]', -- Array of risk factors
    anomaly_detected BOOLEAN DEFAULT FALSE,
    anomaly_score REAL DEFAULT 0.0,
    
    -- Compliance Information
    data_classification VARCHAR(50),
    compliance_frameworks JSONB DEFAULT '[]', -- Array of compliance frameworks
    retention_period INTEGER, -- Days
    
    -- Audit Information
    audit_required BOOLEAN DEFAULT FALSE,
    sensitive_operation BOOLEAN DEFAULT FALSE,
    regulatory_impact BOOLEAN DEFAULT FALSE,
    
    -- Performance Metrics
    duration INTEGER, -- Milliseconds
    records_affected INTEGER DEFAULT 0,
    data_size BIGINT DEFAULT 0, -- Bytes
    
    -- Additional Information
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Indexing and Partitioning Support
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Foreign Key Constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Session Tracking - Enhanced session management
CREATE TABLE session_tracking (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id UUID,
    
    -- Session Lifecycle
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    terminated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Session Context
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB DEFAULT '{}',
    device_fingerprint VARCHAR(255),
    
    -- Authentication Information
    auth_method VARCHAR(50) NOT NULL,
    mfa_verified BOOLEAN DEFAULT FALSE,
    auth_strength_score INTEGER DEFAULT 0 CHECK (auth_strength_score >= 0 AND auth_strength_score <= 100),
    
    -- Activity Metrics
    access_count INTEGER DEFAULT 0,
    last_endpoint VARCHAR(500),
    
    -- Risk Assessment
    risk_score REAL DEFAULT 0.0 CHECK (risk_score >= 0.0 AND risk_score <= 100.0),
    anomaly_count INTEGER DEFAULT 0,
    suspicious_activity BOOLEAN DEFAULT FALSE,
    
    -- Session Flags
    elevated_privileges BOOLEAN DEFAULT FALSE,
    admin_session BOOLEAN DEFAULT FALSE,
    api_session BOOLEAN DEFAULT FALSE,
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}',
    
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resource Access Summary - Aggregated resource access information
CREATE TABLE resource_access_summary (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    user_id UUID,
    
    -- Access Statistics
    total_accesses INTEGER DEFAULT 0,
    successful_accesses INTEGER DEFAULT 0,
    failed_accesses INTEGER DEFAULT 0,
    first_access_date TIMESTAMP WITH TIME ZONE,
    last_access_date TIMESTAMP WITH TIME ZONE,
    
    -- Access Patterns
    access_methods JSONB DEFAULT '[]', -- Array of authentication methods used
    permissions JSONB DEFAULT '[]', -- Array of permissions used
    endpoints_accessed JSONB DEFAULT '[]', -- Array of endpoints accessed
    operations_performed JSONB DEFAULT '[]', -- Array of operations performed
    
    -- Risk Assessment
    average_risk_score REAL DEFAULT 0.0,
    max_risk_score REAL DEFAULT 0.0,
    anomaly_count INTEGER DEFAULT 0,
    high_risk_accesses INTEGER DEFAULT 0,
    
    -- Compliance Information
    compliance_flags JSONB DEFAULT '[]', -- Array of compliance frameworks
    audit_required_count INTEGER DEFAULT 0,
    sensitive_access_count INTEGER DEFAULT 0,
    
    -- Temporal Patterns
    hourly_distribution JSONB DEFAULT '{}', -- Hour of day access patterns
    daily_distribution JSONB DEFAULT '{}', -- Day of week access patterns
    
    -- Geographic Information
    countries_accessed_from JSONB DEFAULT '[]',
    suspicious_locations INTEGER DEFAULT 0,
    
    -- Performance Metrics
    total_data_accessed BIGINT DEFAULT 0, -- Total bytes
    average_response_time REAL DEFAULT 0.0, -- Milliseconds
    
    -- Last Update
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(resource_type, resource_id, user_id, created_date)
);

-- Access Patterns - Behavioral pattern detection
CREATE TABLE access_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id VARCHAR(255),
    
    -- Pattern Information
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('temporal', 'geographic', 'behavioral', 'access_volume', 'permission_escalation', 'anomalous')),
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pattern Metrics
    frequency INTEGER DEFAULT 1,
    confidence_score REAL DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    anomaly_score REAL DEFAULT 0.0,
    
    -- Temporal Information
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    pattern_duration INTERVAL,
    
    -- Pattern Details
    pattern_data JSONB NOT NULL DEFAULT '{}', -- Pattern-specific data
    associated_events JSONB DEFAULT '[]', -- Array of related event IDs
    
    -- Classification
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resolved', 'false_positive')),
    
    -- Analysis Information
    detected_by VARCHAR(100) DEFAULT 'system',
    analysis_method VARCHAR(100),
    false_positive_probability REAL DEFAULT 0.0,
    
    -- Actions Taken
    actions_taken JSONB DEFAULT '[]',
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}',
    
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES session_tracking(session_id) ON DELETE SET NULL
);

-- Access Alerts - Generated alerts based on access patterns
CREATE TABLE access_alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID,
    pattern_id UUID,
    user_id UUID,
    
    -- Alert Information
    alert_type VARCHAR(50) NOT NULL,
    alert_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Severity and Risk
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    confidence REAL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    
    -- Alert Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive', 'suppressed')),
    
    -- Time Information
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Personnel
    assigned_to VARCHAR(255),
    acknowledged_by VARCHAR(255),
    resolved_by VARCHAR(255),
    
    -- Alert Details
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    alert_data JSONB DEFAULT '{}',
    
    -- Actions and Response
    actions_taken JSONB DEFAULT '[]',
    resolution_notes TEXT,
    
    -- Suppression Information
    suppressed BOOLEAN DEFAULT FALSE,
    suppressed_until TIMESTAMP WITH TIME ZONE,
    suppression_reason TEXT,
    
    -- Escalation
    escalated BOOLEAN DEFAULT FALSE,
    escalation_level INTEGER DEFAULT 0,
    escalated_to VARCHAR(255),
    escalated_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}',
    
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (event_id) REFERENCES access_history_events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (pattern_id) REFERENCES access_patterns(pattern_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Access Analytics - Pre-computed analytics for performance
CREATE TABLE access_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time Period
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Basic Metrics
    total_events INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    unique_resources INTEGER DEFAULT 0,
    
    -- Access Results
    successful_accesses INTEGER DEFAULT 0,
    failed_accesses INTEGER DEFAULT 0,
    denied_accesses INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0.0,
    
    -- Risk Metrics
    high_risk_events INTEGER DEFAULT 0,
    anomalies_detected INTEGER DEFAULT 0,
    average_risk_score REAL DEFAULT 0.0,
    
    -- Event Type Distribution
    authentication_events INTEGER DEFAULT 0,
    resource_access_events INTEGER DEFAULT 0,
    api_access_events INTEGER DEFAULT 0,
    admin_events INTEGER DEFAULT 0,
    
    -- Geographic Distribution
    geographic_distribution JSONB DEFAULT '{}', -- Country -> count mapping
    unique_countries INTEGER DEFAULT 0,
    vpn_accesses INTEGER DEFAULT 0,
    
    -- Temporal Patterns
    peak_hour INTEGER, -- Hour of day with most activity
    hourly_distribution JSONB DEFAULT '{}', -- Hour -> count mapping
    
    -- Top Lists
    top_users JSONB DEFAULT '[]', -- Top users by access count
    top_resources JSONB DEFAULT '[]', -- Top resources by access count
    top_endpoints JSONB DEFAULT '[]', -- Top API endpoints by access count
    
    -- Compliance Metrics
    gdpr_related_events INTEGER DEFAULT 0,
    audit_required_events INTEGER DEFAULT 0,
    sensitive_operations INTEGER DEFAULT 0,
    regulatory_impact_events INTEGER DEFAULT 0,
    
    -- Performance Metrics
    average_response_time REAL DEFAULT 0.0,
    total_data_transferred BIGINT DEFAULT 0,
    
    -- Pattern Detection
    patterns_detected INTEGER DEFAULT 0,
    new_patterns INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    
    -- Alert Summary
    alerts_generated INTEGER DEFAULT 0,
    critical_alerts INTEGER DEFAULT 0,
    resolved_alerts INTEGER DEFAULT 0,
    
    -- Additional Metrics
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    UNIQUE(period_type, period_start, period_end)
);

-- ===================================================================
-- Indexes for Performance Optimization
-- ===================================================================

-- Access History Events Indexes
CREATE INDEX idx_access_events_timestamp ON access_history_events(timestamp DESC);
CREATE INDEX idx_access_events_user_id ON access_history_events(user_id);
CREATE INDEX idx_access_events_session_id ON access_history_events(session_id);
CREATE INDEX idx_access_events_resource ON access_history_events(resource_type, resource_id);
CREATE INDEX idx_access_events_event_type ON access_history_events(event_type);
CREATE INDEX idx_access_events_result ON access_history_events(result);
CREATE INDEX idx_access_events_risk_level ON access_history_events(risk_level);
CREATE INDEX idx_access_events_date ON access_history_events(created_date);
CREATE INDEX idx_access_events_audit_required ON access_history_events(audit_required) WHERE audit_required = TRUE;
CREATE INDEX idx_access_events_anomaly ON access_history_events(anomaly_detected) WHERE anomaly_detected = TRUE;
CREATE INDEX idx_access_events_ip_address ON access_history_events(ip_address);
CREATE INDEX idx_access_events_correlation_id ON access_history_events(correlation_id);

-- Composite indexes for common queries
CREATE INDEX idx_access_events_user_timestamp ON access_history_events(user_id, timestamp DESC);
CREATE INDEX idx_access_events_resource_timestamp ON access_history_events(resource_type, resource_id, timestamp DESC);
CREATE INDEX idx_access_events_session_timestamp ON access_history_events(session_id, timestamp DESC);
CREATE INDEX idx_access_events_risk_timestamp ON access_history_events(risk_level, timestamp DESC);

-- JSONB indexes for complex queries
CREATE INDEX idx_access_events_geolocation ON access_history_events USING GIN(geolocation);
CREATE INDEX idx_access_events_device_info ON access_history_events USING GIN(device_info);
CREATE INDEX idx_access_events_permissions ON access_history_events USING GIN(permissions);
CREATE INDEX idx_access_events_risk_factors ON access_history_events USING GIN(risk_factors);
CREATE INDEX idx_access_events_compliance ON access_history_events USING GIN(compliance_frameworks);
CREATE INDEX idx_access_events_metadata ON access_history_events USING GIN(metadata);

-- Session Tracking Indexes
CREATE INDEX idx_session_tracking_user_id ON session_tracking(user_id);
CREATE INDEX idx_session_tracking_created_at ON session_tracking(created_at DESC);
CREATE INDEX idx_session_tracking_last_activity ON session_tracking(last_activity_at DESC);
CREATE INDEX idx_session_tracking_expires_at ON session_tracking(expires_at);
CREATE INDEX idx_session_tracking_active ON session_tracking(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_session_tracking_risk_score ON session_tracking(risk_score DESC);
CREATE INDEX idx_session_tracking_ip_address ON session_tracking(ip_address);

-- Resource Access Summary Indexes
CREATE INDEX idx_resource_summary_resource ON resource_access_summary(resource_type, resource_id);
CREATE INDEX idx_resource_summary_user_id ON resource_access_summary(user_id);
CREATE INDEX idx_resource_summary_last_access ON resource_access_summary(last_access_date DESC);
CREATE INDEX idx_resource_summary_total_accesses ON resource_access_summary(total_accesses DESC);
CREATE INDEX idx_resource_summary_risk_score ON resource_access_summary(max_risk_score DESC);

-- Access Patterns Indexes
CREATE INDEX idx_access_patterns_user_id ON access_patterns(user_id);
CREATE INDEX idx_access_patterns_type ON access_patterns(pattern_type);
CREATE INDEX idx_access_patterns_severity ON access_patterns(severity);
CREATE INDEX idx_access_patterns_status ON access_patterns(status);
CREATE INDEX idx_access_patterns_first_seen ON access_patterns(first_seen DESC);
CREATE INDEX idx_access_patterns_risk_score ON access_patterns(risk_score DESC);

-- Access Alerts Indexes
CREATE INDEX idx_access_alerts_user_id ON access_alerts(user_id);
CREATE INDEX idx_access_alerts_severity ON access_alerts(severity);
CREATE INDEX idx_access_alerts_status ON access_alerts(status);
CREATE INDEX idx_access_alerts_triggered_at ON access_alerts(triggered_at DESC);
CREATE INDEX idx_access_alerts_assigned_to ON access_alerts(assigned_to);
CREATE INDEX idx_access_alerts_open ON access_alerts(status, severity) WHERE status = 'open';

-- Access Analytics Indexes
CREATE INDEX idx_access_analytics_period ON access_analytics(period_type, period_start, period_end);
CREATE INDEX idx_access_analytics_computed_at ON access_analytics(computed_at DESC);

-- ===================================================================
-- Views for Common Queries
-- ===================================================================

-- Active Sessions View
CREATE VIEW active_sessions AS
SELECT 
    st.*,
    EXTRACT(EPOCH FROM (NOW() - st.last_activity_at))/60 as minutes_since_last_activity,
    CASE 
        WHEN st.expires_at < NOW() THEN 'expired'
        WHEN EXTRACT(EPOCH FROM (NOW() - st.last_activity_at))/60 > 60 THEN 'stale'
        ELSE 'active'
    END as session_health
FROM session_tracking st
WHERE st.is_active = TRUE
  AND st.terminated_at IS NULL;

-- High Risk Access Events View
CREATE VIEW high_risk_access_events AS
SELECT 
    ahe.*,
    u.email as user_email,
    st.auth_method,
    st.device_fingerprint
FROM access_history_events ahe
LEFT JOIN users u ON ahe.user_id = u.id
LEFT JOIN session_tracking st ON ahe.session_id = st.session_id
WHERE ahe.risk_level IN ('high', 'critical')
   OR ahe.anomaly_detected = TRUE
   OR ahe.result IN ('failure', 'denied');

-- Recent Access Summary View  
CREATE VIEW recent_access_summary AS
SELECT 
    DATE_TRUNC('hour', timestamp) as access_hour,
    COUNT(*) as total_accesses,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE result = 'success') as successful_accesses,
    COUNT(*) FILTER (WHERE result IN ('failure', 'denied')) as failed_accesses,
    COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')) as high_risk_accesses,
    COUNT(*) FILTER (WHERE anomaly_detected = TRUE) as anomalous_accesses,
    AVG(risk_score) as avg_risk_score,
    AVG(duration) as avg_duration
FROM access_history_events
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY access_hour DESC;

-- User Access Profile View
CREATE VIEW user_access_profiles AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(ahe.event_id) as total_accesses,
    MAX(ahe.timestamp) as last_access,
    COUNT(DISTINCT ahe.session_id) as unique_sessions,
    COUNT(DISTINCT ahe.resource_type) as resource_types_accessed,
    AVG(ahe.risk_score) as avg_risk_score,
    MAX(ahe.risk_score) as max_risk_score,
    COUNT(*) FILTER (WHERE ahe.anomaly_detected = TRUE) as anomaly_count,
    COUNT(*) FILTER (WHERE ahe.risk_level IN ('high', 'critical')) as high_risk_count,
    COUNT(DISTINCT ahe.ip_address) as unique_ips,
    STRING_AGG(DISTINCT ahe.geolocation->>'country', ', ') as countries_accessed
FROM users u
LEFT JOIN access_history_events ahe ON u.id = ahe.user_id
WHERE ahe.timestamp >= NOW() - INTERVAL '30 days' OR ahe.timestamp IS NULL
GROUP BY u.id, u.email;

-- Resource Access Trends View
CREATE VIEW resource_access_trends AS
SELECT 
    resource_type,
    resource_id,
    COUNT(*) as total_accesses,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(timestamp) as last_accessed,
    COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '24 hours') as accesses_24h,
    COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') as accesses_7d,
    COUNT(*) FILTER (WHERE result = 'success') as successful_accesses,
    COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')) as high_risk_accesses,
    AVG(risk_score) as avg_risk_score,
    COUNT(*) FILTER (WHERE audit_required = TRUE) as audit_required_accesses
FROM access_history_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY resource_type, resource_id
HAVING COUNT(*) >= 5  -- Only show resources with meaningful activity
ORDER BY total_accesses DESC;

-- ===================================================================
-- Triggers and Functions
-- ===================================================================

-- Update session activity trigger function
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session tracking with latest activity
    UPDATE session_tracking 
    SET 
        last_activity_at = NEW.timestamp,
        access_count = access_count + 1,
        last_endpoint = NEW.endpoint,
        risk_score = CASE 
            WHEN access_count = 0 THEN COALESCE(NEW.risk_score, 0)
            ELSE (risk_score * access_count + COALESCE(NEW.risk_score, 0)) / (access_count + 1)
        END,
        anomaly_count = CASE 
            WHEN NEW.anomaly_detected THEN anomaly_count + 1 
            ELSE anomaly_count 
        END,
        suspicious_activity = CASE 
            WHEN NEW.risk_level IN ('high', 'critical') OR NEW.anomaly_detected THEN TRUE
            ELSE suspicious_activity
        END
    WHERE session_id = NEW.session_id;
    
    -- Insert new session if not exists
    INSERT INTO session_tracking (
        session_id, user_id, ip_address, user_agent, auth_method,
        access_count, risk_score, anomaly_count, suspicious_activity
    )
    SELECT 
        NEW.session_id, NEW.user_id, NEW.ip_address, NEW.user_agent, NEW.auth_method,
        1, COALESCE(NEW.risk_score, 0), 
        CASE WHEN NEW.anomaly_detected THEN 1 ELSE 0 END,
        CASE WHEN NEW.risk_level IN ('high', 'critical') OR NEW.anomaly_detected THEN TRUE ELSE FALSE END
    WHERE NOT EXISTS (
        SELECT 1 FROM session_tracking WHERE session_id = NEW.session_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session activity updates
CREATE TRIGGER trigger_update_session_activity
    AFTER INSERT ON access_history_events
    FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- Update resource access summary trigger function
CREATE OR REPLACE FUNCTION update_resource_access_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO resource_access_summary (
        resource_type, resource_id, user_id, total_accesses, successful_accesses,
        failed_accesses, first_access_date, last_access_date, average_risk_score,
        max_risk_score, anomaly_count, high_risk_accesses
    )
    VALUES (
        NEW.resource_type, NEW.resource_id, NEW.user_id, 1,
        CASE WHEN NEW.result = 'success' THEN 1 ELSE 0 END,
        CASE WHEN NEW.result IN ('failure', 'denied') THEN 1 ELSE 0 END,
        NEW.timestamp, NEW.timestamp, COALESCE(NEW.risk_score, 0),
        COALESCE(NEW.risk_score, 0),
        CASE WHEN NEW.anomaly_detected THEN 1 ELSE 0 END,
        CASE WHEN NEW.risk_level IN ('high', 'critical') THEN 1 ELSE 0 END
    )
    ON CONFLICT (resource_type, resource_id, user_id, created_date)
    DO UPDATE SET
        total_accesses = resource_access_summary.total_accesses + 1,
        successful_accesses = resource_access_summary.successful_accesses + 
            CASE WHEN NEW.result = 'success' THEN 1 ELSE 0 END,
        failed_accesses = resource_access_summary.failed_accesses + 
            CASE WHEN NEW.result IN ('failure', 'denied') THEN 1 ELSE 0 END,
        last_access_date = NEW.timestamp,
        average_risk_score = (resource_access_summary.average_risk_score * resource_access_summary.total_accesses + COALESCE(NEW.risk_score, 0)) / (resource_access_summary.total_accesses + 1),
        max_risk_score = GREATEST(resource_access_summary.max_risk_score, COALESCE(NEW.risk_score, 0)),
        anomaly_count = resource_access_summary.anomaly_count + 
            CASE WHEN NEW.anomaly_detected THEN 1 ELSE 0 END,
        high_risk_accesses = resource_access_summary.high_risk_accesses + 
            CASE WHEN NEW.risk_level IN ('high', 'critical') THEN 1 ELSE 0 END,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for resource access summary updates
CREATE TRIGGER trigger_update_resource_access_summary
    AFTER INSERT ON access_history_events
    FOR EACH ROW EXECUTE FUNCTION update_resource_access_summary();

-- Session cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    -- Mark expired sessions as inactive
    UPDATE session_tracking 
    SET is_active = FALSE, terminated_at = NOW()
    WHERE is_active = TRUE 
      AND (expires_at < NOW() OR last_activity_at < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Access history cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_access_history(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Archive old access history (in production, this might move to archive table)
    DELETE FROM access_history_events 
    WHERE timestamp < cutoff_date 
      AND audit_required = FALSE 
      AND regulatory_impact = FALSE;
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Generate access analytics function
CREATE OR REPLACE FUNCTION generate_access_analytics(
    p_period_type VARCHAR(20),
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
    analytics_id UUID;
    event_count INTEGER;
    user_count INTEGER;
    session_count INTEGER;
    success_count INTEGER;
    failed_count INTEGER;
BEGIN
    -- Generate analytics ID
    analytics_id := uuid_generate_v4();
    
    -- Calculate basic metrics
    SELECT 
        COUNT(*),
        COUNT(DISTINCT user_id),
        COUNT(DISTINCT session_id),
        COUNT(*) FILTER (WHERE result = 'success'),
        COUNT(*) FILTER (WHERE result IN ('failure', 'denied'))
    INTO event_count, user_count, session_count, success_count, failed_count
    FROM access_history_events
    WHERE timestamp >= p_period_start AND timestamp < p_period_end;
    
    -- Insert analytics record
    INSERT INTO access_analytics (
        analytics_id, period_type, period_start, period_end,
        total_events, unique_users, unique_sessions,
        successful_accesses, failed_accesses, success_rate,
        computed_at
    ) VALUES (
        analytics_id, p_period_type, p_period_start, p_period_end,
        event_count, user_count, session_count,
        success_count, failed_count,
        CASE WHEN event_count > 0 THEN (success_count::REAL / event_count * 100) ELSE 0 END,
        NOW()
    );
    
    RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- Partitioning Setup (for high-volume installations)
-- ===================================================================

-- Create partitioned table for access_history_events (commented out by default)
-- Uncomment and modify for high-volume installations

/*
-- Drop existing table and recreate as partitioned
DROP TABLE IF EXISTS access_history_events;

CREATE TABLE access_history_events (
    -- ... same columns as above ...
) PARTITION BY RANGE (created_date);

-- Create monthly partitions for current and future months
CREATE TABLE access_history_events_2024_01 PARTITION OF access_history_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE access_history_events_2024_02 PARTITION OF access_history_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Add more partitions as needed
*/

-- ===================================================================
-- Success Verification
-- ===================================================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    view_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Count created objects
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN (
        'access_history_events', 'session_tracking', 'resource_access_summary',
        'access_patterns', 'access_alerts', 'access_analytics'
    );
    
    SELECT COUNT(*) INTO view_count FROM information_schema.views
    WHERE table_schema = 'public' AND table_name IN (
        'active_sessions', 'high_risk_access_events', 'recent_access_summary',
        'user_access_profiles', 'resource_access_trends'
    );
    
    SELECT COUNT(*) INTO function_count FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name IN (
        'update_session_activity', 'update_resource_access_summary', 
        'cleanup_expired_sessions', 'cleanup_old_access_history',
        'generate_access_analytics'
    );
    
    RAISE NOTICE '=== Access History Schema Installation Summary ===';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Views created: %', view_count;
    RAISE NOTICE 'Functions created: %', function_count;
    RAISE NOTICE '=== Installation Complete ===';
END $$;