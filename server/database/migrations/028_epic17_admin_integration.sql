-- Epic 17.5.4 Admin Integration Migration
-- Extends existing policy system with Epic 17 admin control features

-- Add admin control metadata to existing policy tables
ALTER TABLE policies ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS admin_priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE policies ADD COLUMN IF NOT EXISTS admin_category VARCHAR(50);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS visibility_scope VARCHAR(20) DEFAULT 'public';

-- Add admin workflow tracking
ALTER TABLE policy_versions ADD COLUMN IF NOT EXISTS admin_reviewed_by VARCHAR(36);
ALTER TABLE policy_versions ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE policy_versions ADD COLUMN IF NOT EXISTS admin_review_notes TEXT;

-- Create admin permission groups for Epic 17 role-based access
CREATE TABLE IF NOT EXISTS admin_permission_groups (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(36) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(36)
);

-- Create admin user group assignments
CREATE TABLE IF NOT EXISTS admin_user_group_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    group_id VARCHAR(36) NOT NULL REFERENCES admin_permission_groups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by VARCHAR(36) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, group_id)
);

-- Create admin activity audit log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(36),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(100)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_timestamp ON admin_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_resource ON admin_activity_log(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_admin_user_group_assignments_user ON admin_user_group_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_group_assignments_group ON admin_user_group_assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_group_assignments_active ON admin_user_group_assignments(active) WHERE active = TRUE;

-- Create admin dashboard views for efficient querying
CREATE OR REPLACE VIEW admin_policy_overview AS
SELECT 
    p.id,
    p.title,
    p.policy_type,
    p.status,
    p.admin_priority,
    p.admin_category,
    pv.version,
    pv.created_at as version_created_at,
    pv.admin_reviewed_by,
    pv.admin_reviewed_at,
    COUNT(mpv.violation_id) as violation_count,
    AVG(CASE WHEN pc.compliance_score IS NOT NULL THEN pc.compliance_score ELSE 0 END) as avg_compliance_score
FROM policies p
LEFT JOIN policy_versions pv ON p.current_version_id = pv.id
LEFT JOIN marketplace_policy_violations mpv ON mpv.policy_id = p.id 
    AND mpv.status IN ('open', 'under_review')
LEFT JOIN policy_compliance pc ON pc.policy_id = p.id
GROUP BY p.id, p.title, p.policy_type, p.status, p.admin_priority, p.admin_category, 
         pv.version, pv.created_at, pv.admin_reviewed_by, pv.admin_reviewed_at;

-- Create enforcement metrics view for dashboard
CREATE OR REPLACE VIEW admin_enforcement_metrics AS
SELECT 
    DATE_TRUNC('day', mpv.reported_at) as date,
    mpv.violation_type,
    mpv.severity,
    mpv.status,
    COUNT(*) as violation_count,
    AVG(EXTRACT(EPOCH FROM (mpv.reviewed_at - mpv.reported_at))/3600) as avg_resolution_hours,
    COUNT(CASE WHEN mva.appeal_id IS NOT NULL THEN 1 END) as appeals_count
FROM marketplace_policy_violations mpv
LEFT JOIN marketplace_violation_appeals mva ON mva.violation_id = mpv.violation_id
WHERE mpv.reported_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', mpv.reported_at), mpv.violation_type, mpv.severity, mpv.status;

-- Insert default admin permission groups for Epic 17
INSERT INTO admin_permission_groups (name, description, permissions, created_by) VALUES 
(
    'Policy Administrators', 
    'Full access to policy management and enforcement',
    '["admin:policy:read", "admin:policy:create", "admin:policy:update", "admin:policy:delete", "admin:policy:publish", "admin:policy:archive", "admin:enforcement:read", "admin:enforcement:review", "admin:enforcement:create", "admin:enforcement:update", "admin:analytics:read"]'::jsonb,
    'system'
),
(
    'Policy Reviewers',
    'Review and approve policy changes',
    '["admin:policy:read", "admin:policy:update", "admin:enforcement:read", "admin:enforcement:review"]'::jsonb,
    'system'
),
(
    'Enforcement Managers',
    'Manage violation reviews and enforcement actions',
    '["admin:enforcement:read", "admin:enforcement:review", "admin:enforcement:bulk-resolve", "admin:analytics:read"]'::jsonb,
    'system'
),
(
    'Analytics Viewers',
    'View policy and enforcement analytics',
    '["admin:policy:read", "admin:enforcement:read", "admin:analytics:read"]'::jsonb,
    'system'
)
ON CONFLICT (name) DO NOTHING;

-- Add Epic 17 specific policy templates
INSERT INTO policy_templates (id, name, description, template_type, content, created_by) VALUES 
(
    gen_random_uuid(),
    'Epic 17 Marketplace Content Policy',
    'Standard template for marketplace content policies with admin controls',
    'marketplace_content_policy',
    '{
        "sections": [
            {
                "title": "Acceptable Content Standards",
                "content": "All marketplace content must meet professional quality standards and comply with community guidelines.",
                "admin_notes": "Reviewed for Epic 17 compliance requirements"
            },
            {
                "title": "Prohibited Content",
                "content": "The following types of content are strictly prohibited: {{prohibited_categories}}",
                "admin_notes": "Categories updated based on enforcement data"
            },
            {
                "title": "Enforcement Procedures", 
                "content": "Violations will be reviewed by our enforcement team and may result in: {{enforcement_actions}}",
                "admin_notes": "Automated enforcement rules apply"
            }
        ],
        "variables": {
            "prohibited_categories": "spam, inappropriate content, intellectual property violations",
            "enforcement_actions": "warnings, content removal, account suspension"
        },
        "admin_metadata": {
            "enforcement_integration": true,
            "automated_rules": true,
            "compliance_tracking": true
        }
    }'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'Epic 17 Seller Guidelines',
    'Comprehensive seller guidelines with admin enforcement integration',
    'seller_guidelines',
    '{
        "sections": [
            {
                "title": "Seller Requirements",
                "content": "All sellers must maintain high quality standards and professional conduct.",
                "admin_notes": "Links to automated quality scoring system"
            },
            {
                "title": "Prohibited Practices",
                "content": "Sellers must not engage in: {{prohibited_practices}}",
                "admin_notes": "Monitored by automated detection systems"
            },
            {
                "title": "Violation Consequences",
                "content": "Violations may result in: {{consequences}}",
                "admin_notes": "Escalation procedures defined in Epic 17 framework"
            }
        ],
        "variables": {
            "prohibited_practices": "fraud, spam, fake reviews, price manipulation",
            "consequences": "warnings, temporary suspension, permanent ban"
        },
        "admin_metadata": {
            "enforcement_integration": true,
            "appeal_process": true,
            "escalation_rules": true
        }
    }'::jsonb,
    'system'
)
ON CONFLICT (id) DO NOTHING;

-- Add Epic 17 enforcement rule templates
INSERT INTO marketplace_policy_enforcement_rules (
    rule_id, policy_type, violation_type, rule_name, description, 
    detection_criteria, severity, automated_actions, enabled, created_by
) VALUES 
(
    gen_random_uuid(),
    'MARKETPLACE_CONTENT_POLICY',
    'INAPPROPRIATE_CONTENT', 
    'Epic 17 Content Scanner',
    'Automated detection of inappropriate content using AI analysis',
    '{
        "trigger_conditions": [
            {"field": "content", "operator": "CONTAINS", "value": "inappropriate_keywords"},
            {"field": "ai_confidence", "operator": "GREATER_THAN", "value": 0.8}
        ],
        "ai_models": ["content_classifier", "toxicity_detector"],
        "threshold_score": 0.75
    }'::jsonb,
    'HIGH',
    '[
        {
            "action": "CONTENT_RESTRICTION",
            "automatic": true,
            "duration": 24,
            "notify_user": true,
            "appeal_allowed": true
        }
    ]'::jsonb,
    true,
    'system'
),
(
    gen_random_uuid(),
    'SELLER_CONDUCT_POLICY',
    'FAKE_REVIEWS',
    'Epic 17 Review Fraud Detector', 
    'Detects patterns indicative of fake reviews and rating manipulation',
    '{
        "trigger_conditions": [
            {"field": "review_velocity", "operator": "GREATER_THAN", "value": 10},
            {"field": "reviewer_similarity", "operator": "GREATER_THAN", "value": 0.9},
            {"field": "rating_pattern_anomaly", "operator": "GREATER_THAN", "value": 0.8}
        ],
        "analysis_window": "7d",
        "confidence_threshold": 0.85
    }'::jsonb,
    'CRITICAL',
    '[
        {
            "action": "SELLER_SUSPENSION",
            "automatic": true,
            "duration": 168,
            "notify_user": true,
            "appeal_allowed": true,
            "escalation_required": true
        }
    ]'::jsonb,
    true,
    'system'
)
ON CONFLICT (rule_id) DO NOTHING;

-- Add admin control configuration settings
CREATE TABLE IF NOT EXISTS admin_control_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(36)
);

-- Insert Epic 17 admin control settings
INSERT INTO admin_control_settings (key, value, description, category) VALUES
(
    'epic17.dashboard.refresh_interval',
    '300'::jsonb,
    'Dashboard auto-refresh interval in seconds',
    'dashboard'
),
(
    'epic17.policy.approval_workflow',
    '{
        "require_dual_approval": true,
        "approval_roles": ["policy_admin", "compliance_officer"],
        "auto_publish_threshold": 0.95
    }'::jsonb,
    'Policy approval workflow configuration',
    'policy'
),
(
    'epic17.enforcement.auto_escalation',
    '{
        "critical_violations": {
            "escalate_after_hours": 2,
            "notify_roles": ["enforcement_manager", "policy_admin"]
        },
        "high_violations": {
            "escalate_after_hours": 24,
            "notify_roles": ["enforcement_manager"]
        }
    }'::jsonb,
    'Automatic escalation rules for violations',
    'enforcement'
),
(
    'epic17.analytics.retention_period',
    '2555'::jsonb,  -- 7 years in days
    'Data retention period for analytics in days',
    'analytics'
)
ON CONFLICT (key) DO NOTHING;

-- Create function for admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_policies', (SELECT COUNT(*) FROM policies WHERE status != 'archived'),
        'active_policies', (SELECT COUNT(*) FROM policies WHERE status = 'active'),
        'pending_approvals', (SELECT COUNT(*) FROM policies WHERE status = 'under_review'),
        'total_violations', (SELECT COUNT(*) FROM marketplace_policy_violations),
        'open_violations', (SELECT COUNT(*) FROM marketplace_policy_violations WHERE status IN ('open', 'under_review')),
        'appeal_rate', COALESCE((
            SELECT ROUND(
                (COUNT(CASE WHEN mva.appeal_id IS NOT NULL THEN 1 END)::float / 
                 COUNT(*)::float) * 100, 2
            )
            FROM marketplace_policy_violations mpv
            LEFT JOIN marketplace_violation_appeals mva ON mva.violation_id = mpv.violation_id
            WHERE mpv.reported_at >= NOW() - INTERVAL '30 days'
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for Epic 17 tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_permission_groups_updated_at
    BEFORE UPDATE ON admin_permission_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_admin_control_settings_updated_at
    BEFORE UPDATE ON admin_control_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions for Epic 17 admin functionality
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_permission_groups TO policy_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_user_group_assignments TO policy_service;
GRANT SELECT, INSERT ON admin_activity_log TO policy_service;
GRANT SELECT ON admin_policy_overview TO policy_service;
GRANT SELECT ON admin_enforcement_metrics TO policy_service;
GRANT SELECT, INSERT, UPDATE ON admin_control_settings TO policy_service;

GRANT USAGE ON SEQUENCE admin_activity_log_id_seq TO policy_service;

-- Add comments for documentation
COMMENT ON TABLE admin_permission_groups IS 'Epic 17: Admin role-based access control groups';
COMMENT ON TABLE admin_user_group_assignments IS 'Epic 17: User assignments to admin permission groups';
COMMENT ON TABLE admin_activity_log IS 'Epic 17: Comprehensive audit log for admin activities';
COMMENT ON TABLE admin_control_settings IS 'Epic 17: Configuration settings for admin control features';

COMMENT ON VIEW admin_policy_overview IS 'Epic 17: Optimized view for policy management dashboard';
COMMENT ON VIEW admin_enforcement_metrics IS 'Epic 17: Real-time enforcement metrics for admin analytics';

COMMENT ON FUNCTION get_admin_dashboard_stats() IS 'Epic 17: Efficient dashboard statistics calculation';

-- Migration completion log
INSERT INTO schema_migrations (version, applied_at) VALUES ('028_epic17_admin_integration', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();