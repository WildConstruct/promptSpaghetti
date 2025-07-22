-- Epic 17 Usage Quotas System - Database Migration
-- Task: E17-1753114397228-B591AA - Create usage quotas
-- Epic: 17 - Backstage Admin Controls

BEGIN;

-- =============================================================================
-- Usage Quotas Definition Table
-- =============================================================================

CREATE TABLE usage_quotas (
    quota_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    quota_name VARCHAR(255) NOT NULL,
    quota_type VARCHAR(50) NOT NULL,
    resource_identifier VARCHAR(100) NOT NULL,
    
    -- Quota limits
    limit_value BIGINT NOT NULL CHECK (limit_value > 0),
    limit_period VARCHAR(20) NOT NULL CHECK (limit_period IN ('second', 'minute', 'hour', 'day', 'week', 'month', 'year', 'rolling')),
    limit_unit VARCHAR(50) NOT NULL CHECK (limit_unit IN ('requests', 'bytes', 'megabytes', 'tokens', 'executions', 'minutes', 'hours', 'sessions', 'operations', 'items', 'users')),
    
    -- Scope and applicability
    applies_to_type VARCHAR(20) NOT NULL CHECK (applies_to_type IN ('user', 'organization', 'tier', 'role', 'global', 'conditional')),
    applies_to_value VARCHAR(255), -- user ID, org ID, tier name, or NULL for global
    
    -- Quota behavior
    enforcement_action VARCHAR(50) DEFAULT 'hard_block' CHECK (enforcement_action IN ('warn', 'throttle', 'soft_block', 'hard_block', 'review', 'degrade', 'redirect', 'upgrade_prompt')),
    reset_behavior VARCHAR(20) DEFAULT 'automatic' CHECK (reset_behavior IN ('automatic', 'manual', 'rolling', 'cascade')),
    grace_period_minutes INTEGER DEFAULT 0 CHECK (grace_period_minutes >= 0),
    
    -- Advanced settings
    burst_allowance BIGINT DEFAULT 0 CHECK (burst_allowance >= 0),
    rollover_percentage DECIMAL(5,2) DEFAULT 0 CHECK (rollover_percentage >= 0 AND rollover_percentage <= 100),
    hard_limit BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1 CHECK (priority > 0),
    
    -- Status and metadata
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(36) NOT NULL,
    
    -- Configuration JSON
    configuration JSONB DEFAULT '{
        "warningThresholds": [75, 90, 95],
        "emergencyMultiplier": 1.5,
        "integrateWithRateLimit": true,
        "integrateWithFraudDetection": true,
        "integrateWithBilling": false,
        "trackingEnabled": true,
        "analyticsEnabled": true,
        "alertsEnabled": true,
        "cachingEnabled": true,
        "batchProcessing": false,
        "asyncEnforcement": false
    }'::jsonb,
    
    -- Metadata JSON
    metadata JSONB DEFAULT '{
        "description": "",
        "category": "resource_management",
        "businessJustification": "",
        "technicalConstraints": [],
        "relatedQuotas": [],
        "averageUsage": 0,
        "peakUsage": 0,
        "violationRate": 0,
        "impactOnRevenue": "none",
        "userSatisfactionImpact": "none",
        "operationalCost": "none"
    }'::jsonb,
    
    UNIQUE(quota_type, resource_identifier, applies_to_type, applies_to_value)
);

-- Indexes for usage quotas
CREATE INDEX idx_usage_quotas_type ON usage_quotas(quota_type);
CREATE INDEX idx_usage_quotas_scope ON usage_quotas(applies_to_type, applies_to_value);
CREATE INDEX idx_usage_quotas_enabled ON usage_quotas(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_usage_quotas_priority ON usage_quotas(priority);
CREATE INDEX idx_usage_quotas_created_at ON usage_quotas(created_at);

-- =============================================================================
-- Usage Tracking Table  
-- =============================================================================

CREATE TABLE usage_tracking (
    tracking_id BIGSERIAL PRIMARY KEY,
    quota_id VARCHAR(36) NOT NULL REFERENCES usage_quotas(quota_id) ON DELETE CASCADE,
    
    -- Usage context
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    organization_id VARCHAR(36),
    
    -- Usage details
    resource_identifier VARCHAR(100) NOT NULL,
    usage_amount BIGINT NOT NULL CHECK (usage_amount > 0),
    usage_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Time window tracking
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cumulative_usage BIGINT NOT NULL DEFAULT 0,
    
    -- Context and metadata
    ip_address INET,
    user_agent TEXT,
    additional_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Enforcement tracking
    quota_exceeded BOOLEAN DEFAULT FALSE,
    enforcement_action_taken VARCHAR(50),
    enforcement_details JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT chk_usage_tracking_period CHECK (period_start <= period_end),
    CONSTRAINT chk_usage_tracking_timestamp CHECK (usage_timestamp >= period_start AND usage_timestamp <= period_end)
);

-- Indexes for usage tracking
CREATE INDEX idx_usage_tracking_quota_user ON usage_tracking(quota_id, user_id);
CREATE INDEX idx_usage_tracking_user_timestamp ON usage_tracking(user_id, usage_timestamp DESC);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX idx_usage_tracking_timestamp ON usage_tracking(usage_timestamp DESC);
CREATE INDEX idx_usage_tracking_exceeded ON usage_tracking(quota_exceeded) WHERE quota_exceeded = TRUE;
CREATE INDEX idx_usage_tracking_resource ON usage_tracking(resource_identifier);
CREATE INDEX idx_usage_tracking_organization ON usage_tracking(organization_id) WHERE organization_id IS NOT NULL;

-- Partitioning preparation (for future high-volume scenarios)
-- CREATE INDEX idx_usage_tracking_timestamp_month ON usage_tracking(date_trunc('month', usage_timestamp));

-- =============================================================================
-- Quota Violations Table
-- =============================================================================

CREATE TABLE quota_violations (
    violation_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    quota_id VARCHAR(36) NOT NULL REFERENCES usage_quotas(quota_id) ON DELETE CASCADE,
    tracking_id BIGINT REFERENCES usage_tracking(tracking_id) ON DELETE SET NULL,
    
    -- Violation details
    user_id VARCHAR(36) NOT NULL,
    violation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exceeded_by BIGINT NOT NULL CHECK (exceeded_by > 0),
    quota_limit BIGINT NOT NULL CHECK (quota_limit > 0),
    actual_usage BIGINT NOT NULL CHECK (actual_usage > quota_limit),
    
    -- Severity and impact assessment
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    impact_assessment JSONB DEFAULT '{
        "businessImpact": "none",
        "technicalImpact": "none", 
        "userImpact": "none",
        "securityRisk": "none",
        "complianceRisk": "none"
    }'::jsonb,
    
    -- Enforcement response
    enforcement_action VARCHAR(50) NOT NULL,
    enforcement_duration INTEGER, -- minutes, if applicable
    enforcement_details JSONB DEFAULT '{}'::jsonb,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealed', 'under_review', 'escalated', 'expired')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(36),
    resolution_notes TEXT,
    
    -- Appeal process
    appeal_submitted BOOLEAN DEFAULT FALSE,
    appeal_status VARCHAR(20) CHECK (appeal_status IS NULL OR appeal_status IN ('submitted', 'under_review', 'approved', 'denied', 'escalated')),
    appeal_details JSONB DEFAULT NULL,
    
    CONSTRAINT chk_quota_violations_usage CHECK (actual_usage = quota_limit + exceeded_by),
    CONSTRAINT chk_quota_violations_resolved CHECK (
        (status = 'resolved' AND resolved_at IS NOT NULL) OR 
        (status != 'resolved' AND resolved_at IS NULL)
    )
);

-- Indexes for quota violations
CREATE INDEX idx_quota_violations_user ON quota_violations(user_id);
CREATE INDEX idx_quota_violations_quota ON quota_violations(quota_id);
CREATE INDEX idx_quota_violations_timestamp ON quota_violations(violation_timestamp DESC);
CREATE INDEX idx_quota_violations_status ON quota_violations(status);
CREATE INDEX idx_quota_violations_severity ON quota_violations(severity);
CREATE INDEX idx_quota_violations_active ON quota_violations(status) WHERE status = 'active';
CREATE INDEX idx_quota_violations_appeals ON quota_violations(appeal_submitted, appeal_status) WHERE appeal_submitted = TRUE;

-- =============================================================================
-- Quota Templates Table  
-- =============================================================================

CREATE TABLE quota_templates (
    template_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('free_tier', 'pro_tier', 'enterprise_tier', 'custom', 'emergency')),
    
    -- Template definitions
    quota_definitions JSONB NOT NULL,
    validation_rules JSONB DEFAULT '[]'::jsonb,
    
    -- Template metadata
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    
    enabled BOOLEAN DEFAULT TRUE
);

-- Indexes for quota templates
CREATE INDEX idx_quota_templates_category ON quota_templates(category);
CREATE INDEX idx_quota_templates_enabled ON quota_templates(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_quota_templates_usage ON quota_templates(usage_count DESC);
CREATE INDEX idx_quota_templates_created_at ON quota_templates(created_at DESC);

-- =============================================================================
-- Quota Event Log Table
-- =============================================================================

CREATE TABLE quota_event_log (
    event_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Context references
    user_id VARCHAR(36),
    quota_id VARCHAR(36) REFERENCES usage_quotas(quota_id) ON DELETE CASCADE,
    violation_id VARCHAR(36) REFERENCES quota_violations(violation_id) ON DELETE CASCADE,
    admin_user_id VARCHAR(36),
    
    -- Event details
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(20) DEFAULT 'system' CHECK (category IN ('system', 'user', 'admin', 'automated')),
    
    -- Processing tracking
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_notes TEXT
);

-- Indexes for quota event log
CREATE INDEX idx_quota_event_log_type ON quota_event_log(event_type);
CREATE INDEX idx_quota_event_log_timestamp ON quota_event_log(timestamp DESC);
CREATE INDEX idx_quota_event_log_user ON quota_event_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_quota_event_log_quota ON quota_event_log(quota_id) WHERE quota_id IS NOT NULL;
CREATE INDEX idx_quota_event_log_severity ON quota_event_log(severity);
CREATE INDEX idx_quota_event_log_processed ON quota_event_log(processed) WHERE processed = FALSE;

-- =============================================================================
-- Admin Operations Table
-- =============================================================================

CREATE TABLE quota_admin_operations (
    operation_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN (
        'create_quota', 'update_quota', 'delete_quota', 'override_quota', 
        'reset_usage', 'resolve_violation', 'bulk_quota_assignment', 
        'emergency_quota_increase', 'user_quota_exemption'
    )),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('quota', 'user', 'organization', 'violation')),
    target_id VARCHAR(36) NOT NULL,
    
    -- Operation details
    admin_user_id VARCHAR(36) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) CHECK (approval_status IS NULL OR approval_status IN ('pending', 'approved', 'denied')),
    approved_by VARCHAR(36),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    
    CONSTRAINT chk_quota_admin_operations_approval CHECK (
        (requires_approval = FALSE) OR 
        (requires_approval = TRUE AND approval_status IS NOT NULL)
    ),
    CONSTRAINT chk_quota_admin_operations_execution CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed')
    )
);

-- Indexes for admin operations
CREATE INDEX idx_quota_admin_operations_admin ON quota_admin_operations(admin_user_id);
CREATE INDEX idx_quota_admin_operations_type ON quota_admin_operations(operation_type);
CREATE INDEX idx_quota_admin_operations_target ON quota_admin_operations(target_type, target_id);
CREATE INDEX idx_quota_admin_operations_timestamp ON quota_admin_operations(timestamp DESC);
CREATE INDEX idx_quota_admin_operations_status ON quota_admin_operations(status);
CREATE INDEX idx_quota_admin_operations_pending_approval ON quota_admin_operations(requires_approval, approval_status) 
    WHERE requires_approval = TRUE AND approval_status = 'pending';

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- Current quota usage view
CREATE VIEW current_quota_usage AS
SELECT 
    q.quota_id,
    q.quota_name,
    q.quota_type,
    q.resource_identifier,
    q.applies_to_type,
    q.applies_to_value,
    q.limit_value,
    q.limit_unit,
    q.limit_period,
    COALESCE(usage_stats.current_usage, 0) as current_usage,
    COALESCE(usage_stats.unique_users, 0) as unique_users,
    ROUND(
        (COALESCE(usage_stats.current_usage, 0)::decimal / q.limit_value::decimal) * 100, 2
    ) as utilization_percentage,
    CASE 
        WHEN COALESCE(usage_stats.current_usage, 0) > q.limit_value THEN TRUE 
        ELSE FALSE 
    END as quota_exceeded,
    q.enabled
FROM usage_quotas q
LEFT JOIN (
    SELECT 
        quota_id,
        SUM(usage_amount) as current_usage,
        COUNT(DISTINCT user_id) as unique_users
    FROM usage_tracking ut
    WHERE ut.usage_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day'  -- Adjust based on quota period
    GROUP BY quota_id
) usage_stats ON q.quota_id = usage_stats.quota_id
WHERE q.enabled = TRUE;

-- Active violations view  
CREATE VIEW active_quota_violations AS
SELECT 
    v.violation_id,
    v.quota_id,
    q.quota_name,
    q.quota_type,
    v.user_id,
    v.violation_timestamp,
    v.exceeded_by,
    v.quota_limit,
    v.actual_usage,
    v.severity,
    v.enforcement_action,
    v.status,
    v.appeal_submitted,
    v.appeal_status
FROM quota_violations v
JOIN usage_quotas q ON v.quota_id = q.quota_id
WHERE v.status IN ('active', 'under_review', 'escalated');

-- User quota summary view
CREATE VIEW user_quota_summary AS
SELECT 
    ut.user_id,
    COUNT(DISTINCT ut.quota_id) as active_quotas,
    SUM(ut.usage_amount) as total_usage,
    COUNT(DISTINCT CASE WHEN v.violation_id IS NOT NULL THEN v.violation_id END) as violation_count,
    MAX(ut.usage_timestamp) as last_activity,
    MAX(CASE WHEN v.violation_id IS NOT NULL THEN v.violation_timestamp END) as last_violation
FROM usage_tracking ut
LEFT JOIN quota_violations v ON ut.user_id = v.user_id 
    AND v.status IN ('active', 'under_review', 'escalated')
WHERE ut.usage_timestamp >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY ut.user_id;

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to update quota metadata on violations
CREATE OR REPLACE FUNCTION update_quota_violation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update quota metadata with violation statistics
    UPDATE usage_quotas 
    SET metadata = jsonb_set(
        jsonb_set(
            metadata, 
            '{violationRate}', 
            (
                SELECT COUNT(*)::text::jsonb 
                FROM quota_violations 
                WHERE quota_id = COALESCE(NEW.quota_id, OLD.quota_id)
                AND violation_timestamp >= CURRENT_TIMESTAMP - INTERVAL '30 days'
            )
        ),
        '{lastViolation}',
        to_jsonb(COALESCE(NEW.violation_timestamp, OLD.violation_timestamp)::text)
    ),
    updated_at = NOW()
    WHERE quota_id = COALESCE(NEW.quota_id, OLD.quota_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for quota violation statistics
CREATE TRIGGER trigger_update_quota_violation_stats
    AFTER INSERT OR UPDATE OR DELETE ON quota_violations
    FOR EACH ROW
    EXECUTE FUNCTION update_quota_violation_stats();

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_usage_quotas_updated_at
    BEFORE UPDATE ON usage_quotas
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trigger_quota_templates_updated_at
    BEFORE UPDATE ON quota_templates
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

-- =============================================================================
-- Default Quota Templates
-- =============================================================================

-- Insert default quota templates for different tiers
INSERT INTO quota_templates (template_id, template_name, description, category, quota_definitions, created_by) VALUES 
(
    gen_random_uuid(),
    'Free Tier Default',
    'Default quotas for free tier users with basic usage limits',
    'free_tier',
    '[
        {
            "quotaType": "api_requests",
            "resourceIdentifier": "*",
            "limitValue": 1000,
            "limitPeriod": "day",
            "limitUnit": "requests",
            "enforcementAction": "hard_block"
        },
        {
            "quotaType": "graph_executions", 
            "resourceIdentifier": "*",
            "limitValue": 50,
            "limitPeriod": "day", 
            "limitUnit": "executions",
            "enforcementAction": "upgrade_prompt"
        },
        {
            "quotaType": "storage_usage",
            "resourceIdentifier": "*", 
            "limitValue": 100,
            "limitPeriod": "month",
            "limitUnit": "megabytes",
            "enforcementAction": "soft_block"
        }
    ]'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'Pro Tier Default',
    'Default quotas for pro tier users with enhanced limits',
    'pro_tier', 
    '[
        {
            "quotaType": "api_requests",
            "resourceIdentifier": "*",
            "limitValue": 10000,
            "limitPeriod": "day",
            "limitUnit": "requests",
            "enforcementAction": "throttle"
        },
        {
            "quotaType": "graph_executions",
            "resourceIdentifier": "*", 
            "limitValue": 500,
            "limitPeriod": "day",
            "limitUnit": "executions",
            "enforcementAction": "throttle"
        },
        {
            "quotaType": "storage_usage",
            "resourceIdentifier": "*",
            "limitValue": 1000, 
            "limitPeriod": "month",
            "limitUnit": "megabytes",
            "enforcementAction": "warn"
        }
    ]'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'Enterprise Tier Default',
    'Default quotas for enterprise tier users with high limits',
    'enterprise_tier',
    '[
        {
            "quotaType": "api_requests",
            "resourceIdentifier": "*",
            "limitValue": 100000,
            "limitPeriod": "day", 
            "limitUnit": "requests",
            "enforcementAction": "warn"
        },
        {
            "quotaType": "graph_executions",
            "resourceIdentifier": "*",
            "limitValue": 5000,
            "limitPeriod": "day",
            "limitUnit": "executions", 
            "enforcementAction": "warn"
        },
        {
            "quotaType": "storage_usage",
            "resourceIdentifier": "*",
            "limitValue": 10000,
            "limitPeriod": "month",
            "limitUnit": "megabytes",
            "enforcementAction": "review"
        }
    ]'::jsonb,
    'system'
);

-- =============================================================================
-- Performance Optimizations
-- =============================================================================

-- Analyze tables for query optimization
ANALYZE usage_quotas;
ANALYZE usage_tracking;
ANALYZE quota_violations;
ANALYZE quota_templates;
ANALYZE quota_event_log;
ANALYZE quota_admin_operations;

COMMIT;

-- =============================================================================
-- Notes for Future Enhancements
-- =============================================================================

-- 1. Consider partitioning usage_tracking table by date for high-volume scenarios:
--    - Monthly partitions for usage_tracking table
--    - Automatic partition management with pg_partman
--
-- 2. Add materialized views for quota analytics:  
--    - Daily/weekly/monthly usage summaries
--    - User behavior patterns
--    - System-wide quota utilization trends
--
-- 3. Consider adding soft-delete functionality:
--    - Add 'deleted_at' timestamp columns
--    - Use views to filter out deleted records
--    - Implement data retention policies
--
-- 4. Add real-time alerting triggers:
--    - NOTIFY/LISTEN for quota violations
--    - Integration with external monitoring systems
--    - Automatic escalation procedures
--
-- 5. Consider adding quota inheritance:
--    - Organization-level quotas that cascade to users
--    - Role-based quota templates
--    - Dynamic quota adjustments based on user behavior