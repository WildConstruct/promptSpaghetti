-- Integration Analytics Database Schema - Epic 17.4.3 Implementation
-- Task: E17-1753114397205-8ACF1D - Create integration analytics
-- 
-- This migration creates the database schema for comprehensive integration
-- analytics including event tracking, metrics storage, health monitoring,
-- error analysis, cost tracking, and reporting infrastructure.

-- =============================================================================
-- Integration Registry Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_registry (
    integration_id VARCHAR(255) PRIMARY KEY,
    integration_name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(100) NOT NULL,
    integration_version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Configuration Details
    endpoint_url VARCHAR(1000),
    authentication_type VARCHAR(50),
    configuration JSONB DEFAULT '{}',
    
    -- Status and Health
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'maintenance', 'failed')),
    health_status VARCHAR(50) DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'failing', 'offline', 'unknown')),
    health_score DECIMAL(5, 2) DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
    
    -- Ownership and Metadata
    owner_team VARCHAR(255),
    technical_contact VARCHAR(255),
    business_contact VARCHAR(255),
    description TEXT,
    documentation_url VARCHAR(1000),
    
    -- SLA and Requirements
    sla_requirements JSONB DEFAULT '{}',
    performance_requirements JSONB DEFAULT '{}',
    cost_budget DECIMAL(15, 2),
    cost_currency VARCHAR(10) DEFAULT 'USD',
    
    -- Lifecycle Information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_health_check TIMESTAMP WITH TIME ZONE,
    next_maintenance_window TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for integration registry
CREATE INDEX IF NOT EXISTS idx_integration_registry_type ON integration_registry(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_registry_status ON integration_registry(status);
CREATE INDEX IF NOT EXISTS idx_integration_registry_health ON integration_registry(health_status);
CREATE INDEX IF NOT EXISTS idx_integration_registry_owner ON integration_registry(owner_team);
CREATE INDEX IF NOT EXISTS idx_integration_registry_updated ON integration_registry(updated_at);

-- =============================================================================
-- Integration Events Table (High Volume)
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_events (
    event_id VARCHAR(255) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    integration_id VARCHAR(255) NOT NULL,
    
    -- Event Classification
    event_type VARCHAR(100) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    operation_details JSONB DEFAULT '{}',
    
    -- Performance Data
    response_time DECIMAL(10, 3) NOT NULL DEFAULT 0, -- milliseconds
    data_size BIGINT DEFAULT 0, -- bytes
    resource_usage JSONB DEFAULT '{}',
    
    -- Success/Failure Information
    success BOOLEAN NOT NULL DEFAULT true,
    error_code VARCHAR(100),
    error_message TEXT,
    error_category VARCHAR(100),
    error_details JSONB DEFAULT '{}',
    
    -- Cost Information
    base_cost DECIMAL(15, 4) DEFAULT 0,
    variable_cost DECIMAL(15, 4) DEFAULT 0,
    total_cost DECIMAL(15, 4) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    billing_unit VARCHAR(50) DEFAULT 'request',
    
    -- Context Information
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    source_service VARCHAR(255),
    target_service VARCHAR(255),
    environment VARCHAR(50) DEFAULT 'development',
    region VARCHAR(50),
    tenant_id VARCHAR(255),
    
    -- Additional Metadata
    context_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Partitioning support (by date)
    event_date DATE GENERATED ALWAYS AS (DATE(timestamp)) STORED,
    
    -- Foreign key
    FOREIGN KEY (integration_id) REFERENCES integration_registry(integration_id) ON DELETE CASCADE
);

-- Create indexes for integration events (optimized for time-series queries)
CREATE INDEX IF NOT EXISTS idx_integration_events_timestamp ON integration_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_integration_time ON integration_events(integration_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_type_time ON integration_events(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_success ON integration_events(success, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_error_category ON integration_events(error_category, timestamp DESC) WHERE error_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_integration_events_date ON integration_events(event_date);
CREATE INDEX IF NOT EXISTS idx_integration_events_operation ON integration_events(integration_id, operation, timestamp DESC);

-- Create partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integration_events_errors_only ON integration_events(integration_id, timestamp DESC, error_category) WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_integration_events_slow_requests ON integration_events(integration_id, timestamp DESC, response_time) WHERE response_time > 1000;

-- =============================================================================
-- Integration Metrics (Aggregated Data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_metrics (
    id SERIAL PRIMARY KEY,
    integration_id VARCHAR(255) NOT NULL,
    metric_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    aggregation_period VARCHAR(20) NOT NULL CHECK (aggregation_period IN ('minute', 'hour', 'day', 'week', 'month')),
    
    -- Usage Metrics
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0,
    requests_per_second DECIMAL(10, 3) DEFAULT 0,
    data_transferred BIGINT DEFAULT 0, -- bytes
    average_payload_size DECIMAL(10, 2) DEFAULT 0, -- bytes
    
    -- Performance Metrics
    avg_response_time DECIMAL(10, 3) DEFAULT 0,
    median_response_time DECIMAL(10, 3) DEFAULT 0,
    p95_response_time DECIMAL(10, 3) DEFAULT 0,
    p99_response_time DECIMAL(10, 3) DEFAULT 0,
    min_response_time DECIMAL(10, 3) DEFAULT 0,
    max_response_time DECIMAL(10, 3) DEFAULT 0,
    timeout_count INTEGER DEFAULT 0,
    timeout_rate DECIMAL(5, 4) DEFAULT 0,
    
    -- Error Metrics
    total_errors INTEGER DEFAULT 0,
    error_rate DECIMAL(5, 4) DEFAULT 0,
    errors_by_category JSONB DEFAULT '{}',
    errors_by_code JSONB DEFAULT '{}',
    
    -- Cost Metrics
    total_cost DECIMAL(15, 4) DEFAULT 0,
    cost_per_request DECIMAL(10, 4) DEFAULT 0,
    cost_per_mb DECIMAL(10, 4) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Health Metrics
    uptime_percentage DECIMAL(5, 2) DEFAULT 100,
    availability_percentage DECIMAL(5, 2) DEFAULT 100,
    health_score DECIMAL(5, 2) DEFAULT 100,
    sla_compliance DECIMAL(5, 2) DEFAULT 100,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for metric aggregation
    UNIQUE(integration_id, metric_timestamp, aggregation_period),
    
    -- Foreign key
    FOREIGN KEY (integration_id) REFERENCES integration_registry(integration_id) ON DELETE CASCADE
);

-- Create indexes for integration metrics
CREATE INDEX IF NOT EXISTS idx_integration_metrics_integration_time ON integration_metrics(integration_id, metric_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_metrics_period ON integration_metrics(aggregation_period, metric_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_metrics_timestamp ON integration_metrics(metric_timestamp DESC);

-- =============================================================================
-- Integration Health History Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_health_history (
    id SERIAL PRIMARY KEY,
    integration_id VARCHAR(255) NOT NULL,
    check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Health Status
    health_status VARCHAR(50) NOT NULL,
    health_score DECIMAL(5, 2) NOT NULL,
    
    -- Performance Indicators
    response_time DECIMAL(10, 3),
    availability_percentage DECIMAL(5, 2),
    error_rate DECIMAL(5, 4),
    throughput DECIMAL(10, 3),
    
    -- Status Change Information
    previous_status VARCHAR(50),
    status_changed BOOLEAN DEFAULT false,
    status_change_reason TEXT,
    
    -- Health Details
    health_indicators JSONB DEFAULT '{}',
    issues JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    -- Check Details
    check_type VARCHAR(50) DEFAULT 'automated',
    check_duration DECIMAL(8, 3),
    check_details JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (integration_id) REFERENCES integration_registry(integration_id) ON DELETE CASCADE
);

-- Create indexes for integration health history
CREATE INDEX IF NOT EXISTS idx_integration_health_history_integration ON integration_health_history(integration_id, check_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_health_history_status ON integration_health_history(health_status, check_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_health_history_changes ON integration_health_history(integration_id, check_timestamp DESC) WHERE status_changed = true;

-- =============================================================================
-- Integration Error Patterns Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_error_patterns (
    id SERIAL PRIMARY KEY,
    integration_id VARCHAR(255) NOT NULL,
    error_pattern VARCHAR(500) NOT NULL,
    error_category VARCHAR(100) NOT NULL,
    
    -- Pattern Statistics
    occurrence_count INTEGER DEFAULT 1,
    first_occurrence TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_occurrence TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    frequency_per_hour DECIMAL(8, 2) DEFAULT 0,
    
    -- Impact Assessment
    impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    affected_operations JSONB DEFAULT '[]',
    business_impact TEXT,
    
    -- Pattern Details
    pattern_details JSONB DEFAULT '{}',
    error_samples JSONB DEFAULT '[]', -- Sample error messages
    
    -- Resolution Information
    resolution_status VARCHAR(50) DEFAULT 'open' CHECK (resolution_status IN ('open', 'investigating', 'resolved', 'ignored')),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for pattern per integration
    UNIQUE(integration_id, error_pattern, error_category),
    
    -- Foreign key
    FOREIGN KEY (integration_id) REFERENCES integration_registry(integration_id) ON DELETE CASCADE
);

-- Create indexes for error patterns
CREATE INDEX IF NOT EXISTS idx_integration_error_patterns_integration ON integration_error_patterns(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_error_patterns_category ON integration_error_patterns(error_category);
CREATE INDEX IF NOT EXISTS idx_integration_error_patterns_impact ON integration_error_patterns(impact_level);
CREATE INDEX IF NOT EXISTS idx_integration_error_patterns_last_occurrence ON integration_error_patterns(last_occurrence DESC);
CREATE INDEX IF NOT EXISTS idx_integration_error_patterns_status ON integration_error_patterns(resolution_status);

-- =============================================================================
-- Integration Cost Tracking Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_cost_tracking (
    id SERIAL PRIMARY KEY,
    integration_id VARCHAR(255) NOT NULL,
    cost_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    cost_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    aggregation_level VARCHAR(20) NOT NULL CHECK (aggregation_level IN ('hourly', 'daily', 'weekly', 'monthly')),
    
    -- Cost Breakdown
    base_costs DECIMAL(15, 4) DEFAULT 0,
    variable_costs DECIMAL(15, 4) DEFAULT 0,
    total_costs DECIMAL(15, 4) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Usage-based Cost Analysis
    cost_per_request DECIMAL(10, 6) DEFAULT 0,
    cost_per_mb DECIMAL(10, 6) DEFAULT 0,
    cost_per_minute DECIMAL(10, 6) DEFAULT 0,
    
    -- Cost Attribution
    request_volume INTEGER DEFAULT 0,
    data_volume BIGINT DEFAULT 0, -- bytes
    compute_time DECIMAL(12, 3) DEFAULT 0, -- minutes
    
    -- Budget and Projections
    budget_allocated DECIMAL(15, 4) DEFAULT 0,
    budget_utilized DECIMAL(5, 2) DEFAULT 0, -- percentage
    projected_monthly_cost DECIMAL(15, 4) DEFAULT 0,
    
    -- Cost Optimization
    optimization_opportunities JSONB DEFAULT '[]',
    potential_savings DECIMAL(15, 4) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for cost periods
    UNIQUE(integration_id, cost_period_start, aggregation_level),
    
    -- Foreign key
    FOREIGN KEY (integration_id) REFERENCES integration_registry(integration_id) ON DELETE CASCADE
);

-- Create indexes for cost tracking
CREATE INDEX IF NOT EXISTS idx_integration_cost_tracking_integration ON integration_cost_tracking(integration_id, cost_period_start DESC);
CREATE INDEX IF NOT EXISTS idx_integration_cost_tracking_period ON integration_cost_tracking(cost_period_start, cost_period_end);
CREATE INDEX IF NOT EXISTS idx_integration_cost_tracking_level ON integration_cost_tracking(aggregation_level, cost_period_start DESC);

-- =============================================================================
-- Integration Analytics Reports Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS integration_analytics_reports (
    report_id VARCHAR(255) PRIMARY KEY,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Report Configuration
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('summary', 'detailed', 'executive', 'custom')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    integration_ids JSONB DEFAULT '[]', -- Array of integration IDs
    
    -- Report Content
    executive_summary JSONB DEFAULT '{}',
    detailed_analysis JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    predictions JSONB DEFAULT '{}',
    
    -- Report Metadata
    generated_by VARCHAR(255),
    report_format VARCHAR(20) DEFAULT 'json' CHECK (report_format IN ('json', 'pdf', 'csv', 'excel')),
    file_path TEXT,
    file_size INTEGER,
    
    -- Delivery Information
    email_recipients JSONB DEFAULT '[]',
    delivery_status VARCHAR(50) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and Lifecycle
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed', 'archived')),
    error_message TEXT,
    
    -- Retention
    expires_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics reports
CREATE INDEX IF NOT EXISTS idx_integration_reports_generated ON integration_analytics_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_reports_type ON integration_analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_integration_reports_period ON integration_analytics_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_integration_reports_status ON integration_analytics_reports(status);
CREATE INDEX IF NOT EXISTS idx_integration_reports_generated_by ON integration_analytics_reports(generated_by);

-- =============================================================================
-- Materialized Views for Performance
-- =============================================================================

-- Current Integration Health Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS integration_health_summary AS
SELECT DISTINCT ON (ir.integration_id)
    ir.integration_id,
    ir.integration_name,
    ir.integration_type,
    ir.status,
    ir.health_status,
    ir.health_score,
    ihh.response_time,
    ihh.availability_percentage,
    ihh.error_rate,
    ihh.throughput,
    ihh.check_timestamp as last_health_check,
    ir.next_maintenance_window,
    ir.owner_team,
    ir.technical_contact
FROM integration_registry ir
LEFT JOIN integration_health_history ihh ON ir.integration_id = ihh.integration_id
WHERE ir.status = 'active'
ORDER BY ir.integration_id, ihh.check_timestamp DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_health_summary_integration ON integration_health_summary(integration_id);

-- Latest Integration Metrics (Last 24 Hours)
CREATE MATERIALIZED VIEW IF NOT EXISTS integration_metrics_latest AS
SELECT DISTINCT ON (integration_id)
    integration_id,
    metric_timestamp,
    aggregation_period,
    total_requests,
    success_rate,
    avg_response_time,
    p95_response_time,
    error_rate,
    total_cost,
    health_score,
    uptime_percentage
FROM integration_metrics
WHERE metric_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
  AND aggregation_period = 'hour'
ORDER BY integration_id, metric_timestamp DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_metrics_latest_integration ON integration_metrics_latest(integration_id);

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_integration_registry_updated_at 
    BEFORE UPDATE ON integration_registry 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

CREATE TRIGGER update_integration_error_patterns_updated_at 
    BEFORE UPDATE ON integration_error_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

-- Function to automatically refresh materialized views
CREATE OR REPLACE FUNCTION refresh_integration_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY integration_health_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY integration_metrics_latest;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Sample Data for Development/Testing
-- =============================================================================

-- Insert sample integrations
INSERT INTO integration_registry (
    integration_id, integration_name, integration_type, integration_version,
    endpoint_url, authentication_type, status, health_status, health_score,
    owner_team, technical_contact, description, cost_budget
) VALUES 
(
    'postgres-main-db', 'PostgreSQL Main Database', 'database', '13.7',
    'postgres://localhost:5432/main', 'password', 'active', 'healthy', 98.5,
    'platform-team', 'platform@example.com', 'Primary application database', 500.00
),
(
    'redis-cache', 'Redis Cache Layer', 'cache_layer', '6.2',
    'redis://localhost:6379', 'none', 'active', 'healthy', 99.2,
    'platform-team', 'platform@example.com', 'Application caching layer', 200.00
),
(
    'auth0-sso', 'Auth0 Authentication', 'authentication', '2.0',
    'https://dev-example.auth0.com', 'oauth2', 'active', 'degraded', 85.3,
    'security-team', 'security@example.com', 'Single Sign-On provider', 800.00
),
(
    'sendgrid-email', 'SendGrid Email Service', 'email_service', '1.0',
    'https://api.sendgrid.com/v3', 'api_key', 'active', 'healthy', 96.8,
    'product-team', 'product@example.com', 'Email delivery service', 300.00
),
(
    'stripe-payments', 'Stripe Payment Gateway', 'payment_gateway', '2022-11-15',
    'https://api.stripe.com/v1', 'api_key', 'active', 'healthy', 99.7,
    'finance-team', 'finance@example.com', 'Payment processing', 0.00
) ON CONFLICT (integration_id) DO NOTHING;

-- Insert sample health history
INSERT INTO integration_health_history (
    integration_id, health_status, health_score, response_time,
    availability_percentage, error_rate, throughput, check_type
) VALUES 
('postgres-main-db', 'healthy', 98.5, 25.3, 99.9, 0.1, 450.2, 'automated'),
('redis-cache', 'healthy', 99.2, 5.8, 99.95, 0.05, 1250.7, 'automated'),
('auth0-sso', 'degraded', 85.3, 180.4, 97.2, 2.8, 125.3, 'automated'),
('sendgrid-email', 'healthy', 96.8, 320.1, 98.5, 1.5, 45.2, 'automated'),
('stripe-payments', 'healthy', 99.7, 95.2, 99.8, 0.2, 85.4, 'automated');

-- Insert sample error patterns
INSERT INTO integration_error_patterns (
    integration_id, error_pattern, error_category, occurrence_count,
    impact_level, business_impact, resolution_status
) VALUES 
(
    'auth0-sso', 'Rate limit exceeded', 'rate_limit_error', 45,
    'medium', 'Users experience delayed login during peak hours', 'investigating'
),
(
    'sendgrid-email', 'Invalid email format', 'validation_error', 23,
    'low', 'Some emails fail to send due to validation issues', 'resolved'
),
(
    'postgres-main-db', 'Connection timeout', 'timeout_error', 12,
    'high', 'Application requests fail intermittently', 'open'
);

-- Insert sample cost tracking data
INSERT INTO integration_cost_tracking (
    integration_id, cost_period_start, cost_period_end, aggregation_level,
    base_costs, variable_costs, total_costs, request_volume, budget_allocated
) VALUES 
(
    'auth0-sso', 
    CURRENT_TIMESTAMP - INTERVAL '1 day', 
    CURRENT_TIMESTAMP, 
    'daily',
    50.00, 25.75, 75.75, 15420, 100.00
),
(
    'sendgrid-email', 
    CURRENT_TIMESTAMP - INTERVAL '1 day', 
    CURRENT_TIMESTAMP, 
    'daily',
    0.00, 18.50, 18.50, 1850, 25.00
),
(
    'stripe-payments', 
    CURRENT_TIMESTAMP - INTERVAL '1 day', 
    CURRENT_TIMESTAMP, 
    'daily',
    0.00, 0.00, 0.00, 450, 0.00
);

-- Refresh materialized views
SELECT refresh_integration_views();

COMMIT;