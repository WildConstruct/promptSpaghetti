-- Epic 17 Performance Monitoring Database Schema
-- Task: E17-1753114397209-9BCDD6 - Implement performance monitoring
-- 
-- This migration creates the database schema for Epic 17 admin performance
-- monitoring system to support comprehensive tracking of admin operations.

-- =============================================================================
-- Admin Performance Metrics Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic17_admin_performance_metrics (
    metric_id VARCHAR(255) PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Admin Context
    admin_user_id VARCHAR(255),
    admin_role VARCHAR(100),
    admin_operation VARCHAR(100) NOT NULL,
    admin_category VARCHAR(100) NOT NULL,
    impact_scope VARCHAR(50) NOT NULL,
    compliance_level VARCHAR(50) NOT NULL,
    
    -- Epic 17 Metadata
    backstage_component VARCHAR(100) NOT NULL,
    configuration_area VARCHAR(100) NOT NULL,
    system_integration VARCHAR(100) NOT NULL,
    performance_impact VARCHAR(50) NOT NULL,
    
    -- Performance Context
    context_data JSONB DEFAULT '{}',
    tags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Status and Threshold Information
    status VARCHAR(50) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'emergency')),
    threshold_data JSONB DEFAULT '[]',
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255),
    request_id VARCHAR(255)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_timestamp ON epic17_admin_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_operation ON epic17_admin_performance_metrics(admin_operation);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_category ON epic17_admin_performance_metrics(admin_category);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_component ON epic17_admin_performance_metrics(backstage_component);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_integration ON epic17_admin_performance_metrics(system_integration);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_status ON epic17_admin_performance_metrics(status);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_admin_user ON epic17_admin_performance_metrics(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_compliance ON epic17_admin_performance_metrics(compliance_level);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_operation_time ON epic17_admin_performance_metrics(admin_operation, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_component_time ON epic17_admin_performance_metrics(backstage_component, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_metrics_status_time ON epic17_admin_performance_metrics(status, timestamp DESC);

-- =============================================================================
-- Integration Health Tracking Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic17_integration_health (
    id SERIAL PRIMARY KEY,
    integration_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    
    -- Health Metrics
    response_time DECIMAL(10, 3) DEFAULT 0,
    availability_percentage DECIMAL(5, 2) DEFAULT 100,
    error_count INTEGER DEFAULT 0,
    total_checks INTEGER DEFAULT 0,
    
    -- Health Details
    health_data JSONB DEFAULT '{}',
    last_error JSONB,
    
    -- Timestamps
    last_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_healthy TIMESTAMP WITH TIME ZONE,
    first_unhealthy TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(integration_name, last_check)
);

-- Create indexes for integration health
CREATE INDEX IF NOT EXISTS idx_epic17_integration_health_name ON epic17_integration_health(integration_name);
CREATE INDEX IF NOT EXISTS idx_epic17_integration_health_status ON epic17_integration_health(status);
CREATE INDEX IF NOT EXISTS idx_epic17_integration_health_check_time ON epic17_integration_health(last_check);
CREATE INDEX IF NOT EXISTS idx_epic17_integration_health_updated ON epic17_integration_health(updated_at);

-- =============================================================================
-- Admin Performance Alerts Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic17_admin_performance_alerts (
    alert_id VARCHAR(255) PRIMARY KEY,
    metric_id VARCHAR(255),
    
    -- Alert Classification
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
    
    -- Alert Details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    recommendation TEXT,
    impact_assessment TEXT,
    mitigation_steps JSONB DEFAULT '[]',
    
    -- Admin Context
    admin_operation VARCHAR(100) NOT NULL,
    admin_category VARCHAR(100),
    affected_users INTEGER DEFAULT 0,
    
    -- Trigger Information
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trigger_value DECIMAL(15, 3),
    threshold_data JSONB,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'suppressed')),
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_reason TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Escalation
    escalation_level INTEGER DEFAULT 0,
    notifications_sent INTEGER DEFAULT 0,
    last_notification_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    alert_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to metrics
    FOREIGN KEY (metric_id) REFERENCES epic17_admin_performance_metrics(metric_id) ON DELETE SET NULL
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_epic17_admin_alerts_status ON epic17_admin_performance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_alerts_severity ON epic17_admin_performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_alerts_operation ON epic17_admin_performance_alerts(admin_operation);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_alerts_triggered ON epic17_admin_performance_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_epic17_admin_alerts_ack_by ON epic17_admin_performance_alerts(acknowledged_by);

-- =============================================================================
-- Admin Performance Benchmarks Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic17_admin_benchmarks (
    benchmark_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- Baseline Data
    baseline_value DECIMAL(15, 3),
    baseline_timestamp TIMESTAMP WITH TIME ZONE,
    baseline_version VARCHAR(100),
    baseline_context JSONB,
    
    -- Current Data
    current_value DECIMAL(15, 3),
    current_timestamp TIMESTAMP WITH TIME ZONE,
    current_version VARCHAR(100),
    current_context JSONB,
    
    -- Improvement Tracking
    improvement_data JSONB DEFAULT '{}',
    
    -- Target Information
    target_value DECIMAL(15, 3),
    target_deadline TIMESTAMP WITH TIME ZONE,
    target_priority VARCHAR(20) CHECK (target_priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Admin-specific Context
    admin_operation VARCHAR(100),
    admin_category VARCHAR(100),
    backstage_component VARCHAR(100),
    
    -- Metadata
    benchmark_metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for benchmarks
CREATE INDEX IF NOT EXISTS idx_epic17_benchmarks_category ON epic17_admin_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_epic17_benchmarks_operation ON epic17_admin_benchmarks(admin_operation);
CREATE INDEX IF NOT EXISTS idx_epic17_benchmarks_component ON epic17_admin_benchmarks(backstage_component);
CREATE INDEX IF NOT EXISTS idx_epic17_benchmarks_updated ON epic17_admin_benchmarks(updated_at);

-- =============================================================================
-- Admin Performance Reports Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic17_admin_performance_reports (
    report_id VARCHAR(255) PRIMARY KEY,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Report Parameters
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    categories JSONB DEFAULT '[]',
    
    -- Report Summary
    summary_data JSONB DEFAULT '{}',
    
    -- Report Content
    report_data JSONB DEFAULT '{}',
    
    -- Report Metadata
    generated_by VARCHAR(255),
    report_format VARCHAR(50) DEFAULT 'json',
    file_path TEXT, -- For PDF/CSV exports
    file_size INTEGER, -- File size in bytes
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed', 'archived')),
    error_message TEXT,
    
    -- Retention
    expires_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS idx_epic17_reports_generated ON epic17_admin_performance_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_epic17_reports_period ON epic17_admin_performance_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_epic17_reports_generated_by ON epic17_admin_performance_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_epic17_reports_status ON epic17_admin_performance_reports(status);

-- =============================================================================
-- Compliance Monitoring Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic17_compliance_monitoring (
    id SERIAL PRIMARY KEY,
    check_type VARCHAR(100) NOT NULL,
    compliance_framework VARCHAR(100) NOT NULL,
    requirement VARCHAR(200) NOT NULL,
    
    -- Check Results
    is_compliant BOOLEAN NOT NULL DEFAULT false,
    compliance_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Check Details
    check_details JSONB DEFAULT '{}',
    violations JSONB DEFAULT '[]',
    remediation_steps JSONB DEFAULT '[]',
    
    -- Context
    admin_operation VARCHAR(100),
    backstage_component VARCHAR(100),
    
    -- Status
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'suppressed')),
    
    -- Timestamps
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_check TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for compliance monitoring
CREATE INDEX IF NOT EXISTS idx_epic17_compliance_type ON epic17_compliance_monitoring(check_type);
CREATE INDEX IF NOT EXISTS idx_epic17_compliance_framework ON epic17_compliance_monitoring(compliance_framework);
CREATE INDEX IF NOT EXISTS idx_epic17_compliance_compliant ON epic17_compliance_monitoring(is_compliant);
CREATE INDEX IF NOT EXISTS idx_epic17_compliance_severity ON epic17_compliance_monitoring(severity);
CREATE INDEX IF NOT EXISTS idx_epic17_compliance_checked ON epic17_compliance_monitoring(checked_at);

-- =============================================================================
-- Performance Aggregation Views
-- =============================================================================

-- Admin Operations Performance Summary View
CREATE OR REPLACE VIEW epic17_admin_operations_summary AS
SELECT 
    admin_operation,
    admin_category,
    backstage_component,
    COUNT(*) as operation_count,
    AVG(value) as avg_response_time,
    MIN(value) as min_response_time,
    MAX(value) as max_response_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_response_time,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99_response_time,
    COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count,
    COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
    MAX(timestamp) as last_operation
FROM epic17_admin_performance_metrics
WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY admin_operation, admin_category, backstage_component
ORDER BY avg_response_time DESC;

-- Integration Health Summary View
CREATE OR REPLACE VIEW epic17_integration_health_summary AS
SELECT DISTINCT ON (integration_name)
    integration_name,
    status,
    response_time,
    availability_percentage,
    error_count,
    total_checks,
    CASE 
        WHEN total_checks > 0 THEN ROUND(((total_checks - error_count)::DECIMAL / total_checks * 100), 2)
        ELSE 0
    END as success_rate,
    last_check,
    last_healthy,
    first_unhealthy
FROM epic17_integration_health
ORDER BY integration_name, last_check DESC;

-- Active Alerts Summary View
CREATE OR REPLACE VIEW epic17_active_alerts_summary AS
SELECT 
    admin_operation,
    severity,
    COUNT(*) as alert_count,
    SUM(affected_users) as total_affected_users,
    MIN(triggered_at) as oldest_alert,
    MAX(triggered_at) as newest_alert,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - triggered_at))/3600) as avg_alert_age_hours
FROM epic17_admin_performance_alerts
WHERE status = 'active'
GROUP BY admin_operation, severity
ORDER BY 
    CASE severity 
        WHEN 'emergency' THEN 1 
        WHEN 'critical' THEN 2 
        WHEN 'warning' THEN 3 
        ELSE 4 
    END,
    alert_count DESC;

-- =============================================================================
-- Database Functions
-- =============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_epic17_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_epic17_integration_health_updated_at 
    BEFORE UPDATE ON epic17_integration_health 
    FOR EACH ROW EXECUTE FUNCTION update_epic17_updated_at_column();

CREATE TRIGGER update_epic17_admin_alerts_updated_at 
    BEFORE UPDATE ON epic17_admin_performance_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_epic17_updated_at_column();

CREATE TRIGGER update_epic17_benchmarks_updated_at 
    BEFORE UPDATE ON epic17_admin_benchmarks 
    FOR EACH ROW EXECUTE FUNCTION update_epic17_updated_at_column();

CREATE TRIGGER update_epic17_compliance_updated_at 
    BEFORE UPDATE ON epic17_compliance_monitoring 
    FOR EACH ROW EXECUTE FUNCTION update_epic17_updated_at_column();

-- =============================================================================
-- Sample Data for Testing
-- =============================================================================

-- Insert sample integration health records
INSERT INTO epic17_integration_health (
    integration_name, status, response_time, availability_percentage, 
    total_checks, error_count, health_data
) VALUES 
(
    'ldap_active_directory', 'healthy', 150.5, 99.8, 
    100, 0, '{"last_sync": "2024-01-20T10:00:00Z", "connection_pool": "active"}'
),
(
    'database_cluster', 'healthy', 25.2, 99.9, 
    500, 1, '{"read_replicas": 3, "write_master": "active"}'
),
(
    'cache_layer', 'degraded', 85.7, 95.5, 
    200, 9, '{"hit_rate": 0.92, "memory_usage": 0.78}'
),
(
    'message_queue', 'healthy', 45.3, 99.2, 
    300, 2, '{"queue_depth": 15, "consumer_lag": 0.5}'
) ON CONFLICT (integration_name, last_check) DO NOTHING;

-- Insert sample compliance monitoring records
INSERT INTO epic17_compliance_monitoring (
    check_type, compliance_framework, requirement, is_compliant,
    compliance_score, admin_operation, backstage_component, severity
) VALUES 
(
    'audit_trail_completeness', 'SOC2', 'Audit logs must be complete and tamper-proof', 
    true, 98.5, 'audit_review', 'audit_system', 'low'
),
(
    'access_control_enforcement', 'SOC2', 'Access controls must be properly enforced', 
    true, 99.2, 'role_assignment', 'user_management', 'low'
),
(
    'data_encryption', 'PCI-DSS', 'Sensitive data must be encrypted in transit and at rest', 
    false, 85.3, 'system_configuration', 'configuration_manager', 'high'
),
(
    'password_policy_compliance', 'NIST', 'Password policies must meet security requirements', 
    true, 94.7, 'user_management', 'user_management', 'medium'
);

-- Insert sample benchmarks
INSERT INTO epic17_admin_benchmarks (
    benchmark_id, name, description, category, baseline_value, current_value,
    admin_operation, admin_category, backstage_component, target_value, target_priority
) VALUES 
(
    'admin_user_mgmt_time', 'User Management Response Time', 
    'Average time for user management operations', 'admin_performance',
    800.0, 450.0, 'user_management', 'user_lifecycle', 'user_management', 
    300.0, 'high'
),
(
    'admin_role_assign_time', 'Role Assignment Response Time', 
    'Average time for role assignment operations', 'admin_performance',
    300.0, 250.0, 'role_assignment', 'authorization', 'role_management',
    200.0, 'high'
),
(
    'admin_policy_check_time', 'Policy Enforcement Time', 
    'Average time for policy enforcement checks', 'admin_performance',
    150.0, 85.0, 'policy_enforcement', 'compliance', 'policy_engine',
    75.0, 'critical'
) ON CONFLICT (benchmark_id) DO NOTHING;

COMMIT;