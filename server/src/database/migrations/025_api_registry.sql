-- API Registry Database Schema - Epic 17.4.4 Implementation
-- Task: E17-1753114397213-9BD2E3 - Create API registry model
-- 
-- This migration creates the database schema for the API registry system
-- to support service and endpoint management within Backstage Admin Controls.

-- =============================================================================
-- API Services Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_services (
    service_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_url VARCHAR(500) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'beta', 'alpha', 'sunset', 'maintenance', 'disabled')),
    visibility VARCHAR(50) DEFAULT 'internal' CHECK (visibility IN ('public', 'internal', 'private', 'partner', 'admin')),
    
    -- Technical Information
    protocol VARCHAR(50) DEFAULT 'http',
    port INTEGER,
    endpoints TEXT[], -- Array of endpoint IDs
    
    -- Service Specifications
    openapi_spec_url TEXT,
    asyncapi_spec_url TEXT,
    graphql_schema_url TEXT,
    
    -- Authentication
    default_authentication JSONB DEFAULT '{"type": "none"}',
    supported_auth_methods TEXT[] DEFAULT ARRAY['none'],
    
    -- Documentation
    documentation JSONB DEFAULT '{"summary": "", "description": ""}',
    
    -- Lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deployed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Operational
    health_status JSONB DEFAULT '{"status": "unknown", "lastCheck": null, "uptime": 0, "issues": [], "dependencies": []}',
    metrics JSONB DEFAULT '{"totalEndpoints": 0, "activeEndpoints": 0, "totalRequests": 0, "totalErrors": 0, "averageResponseTime": 0}',
    
    -- Ownership & Governance
    owner VARCHAR(255) NOT NULL,
    team VARCHAR(255),
    business_owner VARCHAR(255),
    technical_contact VARCHAR(255) NOT NULL,
    
    -- Deployment & Environment
    environment VARCHAR(50) DEFAULT 'development',
    deployment_info JSONB DEFAULT '{"environment": "development", "lastDeployment": null, "deploymentStrategy": "rolling"}',
    dependencies JSONB DEFAULT '[]',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    compliance_labels TEXT[] DEFAULT '{}',
    
    -- Indexes
    CONSTRAINT service_name_version_unique UNIQUE (name, version, environment)
);

-- Create indexes for api_services
CREATE INDEX IF NOT EXISTS idx_api_services_status ON api_services(status);
CREATE INDEX IF NOT EXISTS idx_api_services_visibility ON api_services(visibility);
CREATE INDEX IF NOT EXISTS idx_api_services_owner ON api_services(owner);
CREATE INDEX IF NOT EXISTS idx_api_services_team ON api_services(team);
CREATE INDEX IF NOT EXISTS idx_api_services_environment ON api_services(environment);
CREATE INDEX IF NOT EXISTS idx_api_services_created_at ON api_services(created_at);
CREATE INDEX IF NOT EXISTS idx_api_services_updated_at ON api_services(updated_at);
CREATE INDEX IF NOT EXISTS idx_api_services_tags ON api_services USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_api_services_categories ON api_services USING GIN(categories);

-- =============================================================================
-- API Endpoints Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_endpoints (
    endpoint_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE')),
    endpoint_type VARCHAR(50) DEFAULT 'rest' CHECK (endpoint_type IN ('rest', 'websocket', 'webhook', 'rpc', 'graphql', 'sse')),
    
    -- Service Information
    service_id VARCHAR(255) NOT NULL REFERENCES api_services(service_id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Operational Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'beta', 'alpha', 'sunset', 'maintenance', 'disabled')),
    visibility VARCHAR(50) DEFAULT 'internal' CHECK (visibility IN ('public', 'internal', 'private', 'partner', 'admin')),
    security_level VARCHAR(50) DEFAULT 'none' CHECK (security_level IN ('none', 'api_key', 'oauth', 'jwt', 'mutual_tls', 'custom')),
    
    -- Technical Specification
    request_schema JSONB,
    response_schema JSONB,
    content_types TEXT[] DEFAULT ARRAY['application/json'],
    produces TEXT[] DEFAULT ARRAY['application/json'],
    
    -- Authentication & Authorization
    authentication JSONB DEFAULT '{"type": "none"}',
    permissions TEXT[] DEFAULT '{}',
    scopes TEXT[] DEFAULT '{}',
    rate_limits JSONB DEFAULT '{"enabled": false}',
    
    -- Documentation
    documentation JSONB DEFAULT '{"summary": "", "description": ""}',
    examples JSONB DEFAULT '[]',
    
    -- Lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    sunset_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    owner VARCHAR(255) NOT NULL,
    maintainer VARCHAR(255) NOT NULL,
    
    -- Metrics & Monitoring
    metrics JSONB DEFAULT '{"requestCount": 0, "errorCount": 0, "averageResponseTime": 0, "p50ResponseTime": 0, "p95ResponseTime": 0, "p99ResponseTime": 0, "popularityScore": 0, "errorRate": 0, "uptimePercentage": 100}',
    health_status JSONB DEFAULT '{"status": "unknown", "lastCheck": null, "uptime": 0, "issues": [], "dependencies": []}',
    
    -- Versioning
    version VARCHAR(50) DEFAULT '1.0.0',
    api_version VARCHAR(50) DEFAULT '1.0.0',
    compatibility JSONB DEFAULT '{"backwardCompatible": true, "forwardCompatible": true, "breakingChanges": [], "deprecatedFeatures": [], "migrationRequired": false}',
    
    -- Relationships
    dependencies TEXT[] DEFAULT '{}',
    consumers TEXT[] DEFAULT '{}',
    related_endpoints TEXT[] DEFAULT '{}',
    
    -- Unique constraint for path + method + service
    CONSTRAINT endpoint_path_method_service_unique UNIQUE (path, method, service_id)
);

-- Create indexes for api_endpoints
CREATE INDEX IF NOT EXISTS idx_api_endpoints_service_id ON api_endpoints(service_id);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_status ON api_endpoints(status);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_visibility ON api_endpoints(visibility);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_method ON api_endpoints(method);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_endpoint_type ON api_endpoints(endpoint_type);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_security_level ON api_endpoints(security_level);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_owner ON api_endpoints(owner);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_maintainer ON api_endpoints(maintainer);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_created_at ON api_endpoints(created_at);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_updated_at ON api_endpoints(updated_at);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_deprecated_at ON api_endpoints(deprecated_at);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_tags ON api_endpoints USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_categories ON api_endpoints USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_path ON api_endpoints(path);

-- Create text search index for search functionality
CREATE INDEX IF NOT EXISTS idx_api_endpoints_search ON api_endpoints USING GIN(
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(path, '') || ' ' ||
        array_to_string(tags, ' ') || ' ' ||
        array_to_string(categories, ' ')
    )
);

CREATE INDEX IF NOT EXISTS idx_api_services_search ON api_services USING GIN(
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' ||
        array_to_string(tags, ' ') || ' ' ||
        array_to_string(categories, ' ')
    )
);

-- =============================================================================
-- API Registry Events Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_registry_events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('endpoint', 'service')),
    entity_id VARCHAR(255) NOT NULL,
    
    -- Change tracking
    changes JSONB,
    
    -- User context
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for api_registry_events
CREATE INDEX IF NOT EXISTS idx_registry_events_entity ON api_registry_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_registry_events_type ON api_registry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_registry_events_timestamp ON api_registry_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_registry_events_user_id ON api_registry_events(user_id);

-- =============================================================================
-- API Metrics Tables
-- =============================================================================

-- Endpoint usage metrics (time-series data)
CREATE TABLE IF NOT EXISTS api_endpoint_metrics (
    id SERIAL PRIMARY KEY,
    endpoint_id VARCHAR(255) NOT NULL REFERENCES api_endpoints(endpoint_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Request metrics
    request_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_response_time DECIMAL(10, 3) DEFAULT 0,
    p50_response_time DECIMAL(10, 3) DEFAULT 0,
    p95_response_time DECIMAL(10, 3) DEFAULT 0,
    p99_response_time DECIMAL(10, 3) DEFAULT 0,
    min_response_time DECIMAL(10, 3) DEFAULT 0,
    max_response_time DECIMAL(10, 3) DEFAULT 0,
    
    -- Status code distribution
    status_2xx INTEGER DEFAULT 0,
    status_3xx INTEGER DEFAULT 0,
    status_4xx INTEGER DEFAULT 0,
    status_5xx INTEGER DEFAULT 0,
    
    -- Metadata
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    aggregation_level VARCHAR(20) DEFAULT 'hourly' CHECK (aggregation_level IN ('minutely', 'hourly', 'daily', 'weekly', 'monthly'))
);

-- Create indexes for metrics
CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_endpoint_id ON api_endpoint_metrics(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_timestamp ON api_endpoint_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_aggregation ON api_endpoint_metrics(aggregation_level, timestamp);

-- Service usage metrics (time-series data)
CREATE TABLE IF NOT EXISTS api_service_metrics (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) NOT NULL REFERENCES api_services(service_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Request metrics
    total_requests INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    active_endpoints INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_response_time DECIMAL(10, 3) DEFAULT 0,
    
    -- Resource metrics
    cpu_usage DECIMAL(5, 2),
    memory_usage DECIMAL(5, 2),
    disk_usage DECIMAL(5, 2),
    network_usage DECIMAL(10, 3),
    
    -- Health metrics
    uptime_percentage DECIMAL(5, 2) DEFAULT 100,
    error_rate DECIMAL(5, 4) DEFAULT 0,
    
    -- Metadata
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    aggregation_level VARCHAR(20) DEFAULT 'hourly' CHECK (aggregation_level IN ('minutely', 'hourly', 'daily', 'weekly', 'monthly'))
);

-- Create indexes for service metrics
CREATE INDEX IF NOT EXISTS idx_service_metrics_service_id ON api_service_metrics(service_id);
CREATE INDEX IF NOT EXISTS idx_service_metrics_timestamp ON api_service_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_service_metrics_aggregation ON api_service_metrics(aggregation_level, timestamp);

-- =============================================================================
-- API Compliance Tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_compliance_checks (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('endpoint', 'service')),
    entity_id VARCHAR(255) NOT NULL,
    framework VARCHAR(100) NOT NULL, -- SOC2, PCI-DSS, HIPAA, etc.
    requirement VARCHAR(200) NOT NULL,
    
    -- Compliance status
    compliant BOOLEAN DEFAULT false,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Violation details
    violation_type VARCHAR(100),
    violation_description TEXT,
    remediation_suggestion TEXT,
    
    -- Check details
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_check TIMESTAMP WITH TIME ZONE,
    check_frequency_days INTEGER DEFAULT 30,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for compliance tracking
CREATE INDEX IF NOT EXISTS idx_compliance_entity ON api_compliance_checks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_framework ON api_compliance_checks(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON api_compliance_checks(compliant);
CREATE INDEX IF NOT EXISTS idx_compliance_severity ON api_compliance_checks(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_last_checked ON api_compliance_checks(last_checked);

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- Active endpoints with their service information
CREATE OR REPLACE VIEW active_endpoints_view AS
SELECT 
    e.endpoint_id,
    e.name,
    e.description,
    e.path,
    e.method,
    e.status,
    e.visibility,
    e.security_level,
    e.created_at,
    e.updated_at,
    e.owner,
    e.maintainer,
    e.tags,
    e.categories,
    s.service_id,
    s.name AS service_name,
    s.base_url,
    s.version AS service_version,
    s.team,
    s.environment
FROM api_endpoints e
JOIN api_services s ON e.service_id = s.service_id
WHERE e.deleted_at IS NULL 
  AND s.deleted_at IS NULL
  AND e.status = 'active'
  AND s.status = 'active';

-- Endpoint health summary
CREATE OR REPLACE VIEW endpoint_health_summary AS
SELECT 
    e.endpoint_id,
    e.name,
    e.path,
    e.method,
    e.service_id,
    e.health_status->>'status' AS health_status,
    (e.metrics->>'requestCount')::integer AS total_requests,
    (e.metrics->>'errorCount')::integer AS total_errors,
    (e.metrics->>'averageResponseTime')::decimal AS avg_response_time,
    (e.metrics->>'errorRate')::decimal AS error_rate,
    (e.metrics->>'uptimePercentage')::decimal AS uptime_percentage,
    e.updated_at AS last_updated
FROM api_endpoints e
WHERE e.deleted_at IS NULL;

-- Service health summary
CREATE OR REPLACE VIEW service_health_summary AS
SELECT 
    s.service_id,
    s.name,
    s.base_url,
    s.status,
    s.environment,
    s.health_status->>'status' AS health_status,
    (s.metrics->>'totalRequests')::integer AS total_requests,
    (s.metrics->>'totalErrors')::integer AS total_errors,
    (s.metrics->>'averageResponseTime')::decimal AS avg_response_time,
    array_length(s.endpoints, 1) AS endpoint_count,
    s.updated_at AS last_updated
FROM api_services s
WHERE s.deleted_at IS NULL;

-- =============================================================================
-- Functions for Common Operations
-- =============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_api_services_updated_at 
    BEFORE UPDATE ON api_services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at 
    BEFORE UPDATE ON api_endpoints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_compliance_checks_updated_at 
    BEFORE UPDATE ON api_compliance_checks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Sample Data (Optional - for development/testing)
-- =============================================================================

-- Insert sample core API service
INSERT INTO api_services (
    service_id, name, description, base_url, version, status, visibility,
    owner, team, technical_contact, environment, tags, categories
) VALUES (
    'core-api-service', 
    'Core API Service', 
    'Main application API providing graph execution and management functionality',
    'http://localhost:8000',
    '1.0.0',
    'active',
    'internal',
    'core-team',
    'core-team',
    'core-team@example.com',
    'development',
    ARRAY['core', 'graph', 'execution'],
    ARRAY['core-services']
) ON CONFLICT (service_id) DO NOTHING;

-- Insert sample endpoints
INSERT INTO api_endpoints (
    endpoint_id, name, description, path, method, endpoint_type,
    service_id, service_name, service_version, status, visibility, security_level,
    owner, maintainer, tags, categories, version, api_version
) VALUES 
(
    'endpoint_post_preview', 
    'Generate Preview',
    'Generate multiple outputs from a graph using different seeds',
    '/preview',
    'POST',
    'rest',
    'core-api-service',
    'Core API Service',
    '1.0.0',
    'active',
    'public',
    'none',
    'core-team',
    'core-team',
    ARRAY['core', 'graph', 'execution'],
    ARRAY['graph-operations'],
    '1.0.0',
    '1.0.0'
),
(
    'endpoint_post_export',
    'Export Graph', 
    'Export graph to GeneratorBundle format',
    '/export',
    'POST',
    'rest',
    'core-api-service',
    'Core API Service',
    '1.0.0',
    'active',
    'public',
    'none',
    'core-team',
    'core-team',
    ARRAY['core', 'export'],
    ARRAY['graph-operations'],
    '1.0.0',
    '1.0.0'
) ON CONFLICT (endpoint_id) DO NOTHING;

-- Update service endpoints array
UPDATE api_services 
SET endpoints = ARRAY['endpoint_post_preview', 'endpoint_post_export']
WHERE service_id = 'core-api-service';

COMMIT;