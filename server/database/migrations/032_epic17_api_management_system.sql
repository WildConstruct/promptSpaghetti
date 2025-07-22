-- Epic 17.4.4 API Management System Database Schema
-- Task: E17-1753114397211-324330 - Design API management system
-- 
-- Creates additional tables to support the comprehensive API management dashboard
-- with advanced analytics, monitoring, and administrative capabilities

-- API call logs for detailed usage tracking and analytics
CREATE TABLE IF NOT EXISTS api_call_logs (
    id SERIAL PRIMARY KEY,
    key_id UUID NOT NULL,
    user_id UUID,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'GET',
    status VARCHAR(20) NOT NULL DEFAULT 'success', -- success, error, blocked, rate_limited
    status_code INTEGER,
    response_time INTEGER, -- milliseconds
    request_size INTEGER, -- bytes
    response_size INTEGER, -- bytes
    ip_address INET,
    user_agent TEXT,
    rate_limited BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_api_call_logs_key_id (key_id),
    INDEX idx_api_call_logs_created_at (created_at),
    INDEX idx_api_call_logs_status (status),
    INDEX idx_api_call_logs_endpoint (endpoint),
    INDEX idx_api_call_logs_ip_address (ip_address),
    INDEX idx_api_call_logs_composite (key_id, created_at, status),
    
    -- Foreign key constraints
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Alert configurations for monitoring and notifications
CREATE TABLE IF NOT EXISTS api_alert_configs (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    conditions JSONB NOT NULL, -- Error rate thresholds, latency limits, etc.
    actions JSONB NOT NULL, -- Email, webhook, auto-suspend, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    INDEX idx_api_alert_configs_alert_id (alert_id),
    INDEX idx_api_alert_configs_enabled (enabled),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Alert incidents for tracking triggered alerts
CREATE TABLE IF NOT EXISTS api_alert_incidents (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(255) NOT NULL,
    incident_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- rate_limit, error_spike, unusual_activity, security_threat
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    message TEXT NOT NULL,
    key_id UUID,
    user_id UUID,
    metadata JSONB, -- Additional context data
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_api_alert_incidents_alert_id (alert_id),
    INDEX idx_api_alert_incidents_type (type),
    INDEX idx_api_alert_incidents_severity (severity),
    INDEX idx_api_alert_incidents_resolved (resolved),
    INDEX idx_api_alert_incidents_created_at (created_at),
    INDEX idx_api_alert_incidents_key_id (key_id),
    
    FOREIGN KEY (alert_id) REFERENCES api_alert_configs(alert_id) ON DELETE CASCADE,
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Usage reports and exports tracking
CREATE TABLE IF NOT EXISTS api_usage_reports (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    type VARCHAR(50) NOT NULL, -- usage, security, performance, compliance
    format VARCHAR(20) NOT NULL, -- json, csv, excel, pdf
    filters JSONB, -- Key IDs, date ranges, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending, generating, completed, failed, expired
    file_path TEXT,
    file_size BIGINT,
    record_count INTEGER,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_api_usage_reports_report_id (report_id),
    INDEX idx_api_usage_reports_status (status),
    INDEX idx_api_usage_reports_generated_by (generated_by),
    INDEX idx_api_usage_reports_generated_at (generated_at),
    INDEX idx_api_usage_reports_expires_at (expires_at),
    
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- API key quotas and billing information
CREATE TABLE IF NOT EXISTS api_key_quotas (
    id SERIAL PRIMARY KEY,
    key_id UUID UNIQUE NOT NULL,
    quota_type VARCHAR(50) NOT NULL, -- monthly, daily, custom
    quota_limit BIGINT NOT NULL, -- Number of requests allowed
    quota_used BIGINT DEFAULT 0, -- Number of requests used
    quota_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    quota_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_tier VARCHAR(50), -- free, basic, premium, enterprise
    cost_per_request DECIMAL(10, 6), -- Cost per API request
    total_cost DECIMAL(10, 2) DEFAULT 0,
    overage_allowed BOOLEAN DEFAULT FALSE,
    overage_cost_per_request DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_api_key_quotas_key_id (key_id),
    INDEX idx_api_key_quotas_quota_type (quota_type),
    INDEX idx_api_key_quotas_billing_tier (billing_tier),
    INDEX idx_api_key_quotas_period (quota_period_start, quota_period_end),
    
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE CASCADE
);

-- Performance benchmarks and SLA tracking
CREATE TABLE IF NOT EXISTS api_performance_metrics (
    id SERIAL PRIMARY KEY,
    key_id UUID,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    metric_type VARCHAR(50) NOT NULL, -- latency, throughput, error_rate, availability
    metric_value DECIMAL(10, 4) NOT NULL,
    percentile INTEGER, -- For latency metrics (50, 95, 99)
    measurement_window INTEGER NOT NULL, -- Duration in seconds
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_api_performance_key_id (key_id),
    INDEX idx_api_performance_endpoint (endpoint),
    INDEX idx_api_performance_type (metric_type),
    INDEX idx_api_performance_recorded_at (recorded_at),
    INDEX idx_api_performance_composite (key_id, metric_type, recorded_at),
    
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE CASCADE
);

-- System configuration and feature flags for API management
CREATE TABLE IF NOT EXISTS api_management_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- feature_flag, limit, threshold, setting
    description TEXT,
    environment VARCHAR(50) DEFAULT 'production', -- production, staging, development
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID,
    
    INDEX idx_api_management_config_key (config_key),
    INDEX idx_api_management_config_type (config_type),
    INDEX idx_api_management_config_environment (environment),
    INDEX idx_api_management_config_enabled (enabled),
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- IP whitelist and blacklist management
CREATE TABLE IF NOT EXISTS api_ip_access_control (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    ip_range CIDR,
    access_type VARCHAR(20) NOT NULL, -- whitelist, blacklist, rate_limited
    key_id UUID, -- NULL means global rule
    reason TEXT,
    priority INTEGER DEFAULT 100, -- Lower numbers have higher priority
    enabled BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    INDEX idx_api_ip_access_ip (ip_address),
    INDEX idx_api_ip_access_range (ip_range),
    INDEX idx_api_ip_access_type (access_type),
    INDEX idx_api_ip_access_key_id (key_id),
    INDEX idx_api_ip_access_priority (priority),
    INDEX idx_api_ip_access_enabled (enabled),
    
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- API endpoint registry and documentation
CREATE TABLE IF NOT EXISTS api_endpoints (
    id SERIAL PRIMARY KEY,
    endpoint_path VARCHAR(500) UNIQUE NOT NULL,
    method VARCHAR(10) NOT NULL,
    description TEXT,
    required_scopes TEXT[], -- Array of required scopes
    rate_limit_override JSONB, -- Custom rate limits for this endpoint
    deprecated BOOLEAN DEFAULT FALSE,
    deprecation_date TIMESTAMP WITH TIME ZONE,
    replacement_endpoint VARCHAR(500),
    documentation_url TEXT,
    response_schema JSONB, -- OpenAPI schema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_api_endpoints_path (endpoint_path),
    INDEX idx_api_endpoints_method (method),
    INDEX idx_api_endpoints_deprecated (deprecated),
    INDEX idx_api_endpoints_scopes (required_scopes),
    
    UNIQUE(endpoint_path, method)
);

-- Add some default configuration values
INSERT INTO api_management_config (config_key, config_value, config_type, description) VALUES
('rate_limit_defaults', '{"requestsPerMinute": 100, "requestsPerHour": 3000, "requestsPerDay": 50000}', 'limit', 'Default rate limits for new API keys'),
('security_thresholds', '{"errorRate": 0.05, "latency": 1000, "usageSpike": 5.0}', 'threshold', 'Security alert thresholds'),
('key_rotation_policy', '{"warningDays": 30, "enforceRotation": true, "maxKeyAge": 365}', 'setting', 'API key rotation policy'),
('monitoring_enabled', 'true', 'feature_flag', 'Enable comprehensive API monitoring'),
('analytics_retention', '{"days": 90, "detailedDays": 30}', 'setting', 'Data retention policy for analytics'),
('export_limits', '{"maxRecords": 1000000, "maxSizeGB": 10, "retentionHours": 24}', 'limit', 'Export operation limits')
ON CONFLICT (config_key) DO NOTHING;

-- Add some default alert configurations
INSERT INTO api_alert_configs (alert_id, name, description, conditions, actions) VALUES
('high_error_rate', 'High Error Rate Alert', 'Triggers when API error rate exceeds 5%', 
 '{"errorRateThreshold": 0.05, "timeWindow": 15}',
 '{"email": ["admin@example.com"], "autoSuspend": false}'),
('excessive_latency', 'Excessive Response Time', 'Triggers when average response time exceeds 2 seconds',
 '{"latencyThreshold": 2000, "timeWindow": 10}',
 '{"email": ["admin@example.com"], "webhook": "https://hooks.example.com/alerts"}'),
('usage_spike', 'Unusual Usage Spike', 'Triggers when usage increases by 500% above normal',
 '{"usageSpike": 5.0, "timeWindow": 30}',
 '{"email": ["security@example.com"], "escalation": {"afterMinutes": 30, "contacts": ["oncall@example.com"]}')
ON CONFLICT (alert_id) DO NOTHING;

-- Add some common API endpoints
INSERT INTO api_endpoints (endpoint_path, method, description, required_scopes) VALUES
('/api/graphs', 'GET', 'Retrieve user graphs', ARRAY['read:graphs']),
('/api/graphs', 'POST', 'Create new graph', ARRAY['write:graphs']),
('/api/graphs/{id}', 'PUT', 'Update existing graph', ARRAY['write:graphs']),
('/api/graphs/{id}', 'DELETE', 'Delete graph', ARRAY['write:graphs']),
('/api/users/profile', 'GET', 'Get user profile', ARRAY['read:user']),
('/api/users/profile', 'PUT', 'Update user profile', ARRAY['write:user']),
('/api/analytics/usage', 'GET', 'Get usage analytics', ARRAY['read:analytics']),
('/api/admin/users', 'GET', 'List all users', ARRAY['admin:users']),
('/api/admin/system/health', 'GET', 'System health check', ARRAY['admin:system'])
ON CONFLICT (endpoint_path, method) DO NOTHING;

-- Create a function to automatically log API calls (would be called from application code)
CREATE OR REPLACE FUNCTION log_api_call(
    p_key_id UUID,
    p_user_id UUID,
    p_endpoint VARCHAR(500),
    p_method VARCHAR(10),
    p_status VARCHAR(20),
    p_status_code INTEGER,
    p_response_time INTEGER,
    p_request_size INTEGER,
    p_response_size INTEGER,
    p_ip_address INET,
    p_user_agent TEXT,
    p_rate_limited BOOLEAN DEFAULT FALSE,
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO api_call_logs (
        key_id, user_id, endpoint, method, status, status_code,
        response_time, request_size, response_size, ip_address,
        user_agent, rate_limited, error_message, created_at
    ) VALUES (
        p_key_id, p_user_id, p_endpoint, p_method, p_status, p_status_code,
        p_response_time, p_request_size, p_response_size, p_ip_address,
        p_user_agent, p_rate_limited, p_error_message, NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to update quota usage
CREATE OR REPLACE FUNCTION update_quota_usage(p_key_id UUID, p_requests_used BIGINT DEFAULT 1) 
RETURNS VOID AS $$
BEGIN
    INSERT INTO api_key_quotas (
        key_id, quota_type, quota_limit, quota_used, 
        quota_period_start, quota_period_end
    ) VALUES (
        p_key_id, 'monthly', 1000000, p_requests_used,
        DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    ) ON CONFLICT (key_id) DO UPDATE SET
        quota_used = api_key_quotas.quota_used + p_requests_used,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better query performance on large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_logs_time_series 
    ON api_call_logs (created_at DESC, key_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_logs_analytics 
    ON api_call_logs (key_id, endpoint, created_at) 
    WHERE created_at >= NOW() - INTERVAL '90 days';

-- Add a partial index for recent error logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_logs_recent_errors 
    ON api_call_logs (created_at, key_id, error_message) 
    WHERE status = 'error' AND created_at >= NOW() - INTERVAL '7 days';

-- Add comments for documentation
COMMENT ON TABLE api_call_logs IS 'Detailed logs of all API calls for analytics and monitoring';
COMMENT ON TABLE api_alert_configs IS 'Configuration for monitoring alerts and notifications';
COMMENT ON TABLE api_alert_incidents IS 'Record of triggered alerts and their resolution';
COMMENT ON TABLE api_usage_reports IS 'Generated reports and exports for API usage analysis';
COMMENT ON TABLE api_key_quotas IS 'Quota management and billing information for API keys';
COMMENT ON TABLE api_performance_metrics IS 'Performance metrics and SLA tracking';
COMMENT ON TABLE api_management_config IS 'System configuration and feature flags';
COMMENT ON TABLE api_ip_access_control IS 'IP-based access control rules';
COMMENT ON TABLE api_endpoints IS 'Registry of available API endpoints and their metadata';

-- Grant appropriate permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO api_service_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO api_service_user;
-- GRANT EXECUTE ON FUNCTION log_api_call TO api_service_user;
-- GRANT EXECUTE ON FUNCTION update_quota_usage TO api_service_user;