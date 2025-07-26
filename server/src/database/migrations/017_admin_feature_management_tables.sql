-- Epic 17 Story 17.1 - Administrative Feature Management Database Schema
-- Database migration for comprehensive feature toggle administration system
-- Supports user targeting, scheduling, dependencies, audit logging, and health monitoring

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS feature_audit_log CASCADE;
DROP TABLE IF EXISTS feature_usage_stats CASCADE;
DROP TABLE IF EXISTS feature_health_status CASCADE;
DROP TABLE IF EXISTS admin_feature_toggles CASCADE;

-- Main administrative feature toggles table
CREATE TABLE admin_feature_toggles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('boolean', 'string', 'number', 'json', 'percentage', 'experiment')),
    value JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Administrative metadata
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_by UUID,
    version INTEGER DEFAULT 1,
    
    -- Advanced admin features
    user_targeting JSONB, -- { segments: [], user_ids: [], percentage: 0, rules: [] }
    scheduling JSONB,     -- { enable_at: "", disable_at: "", rollout_strategy: "", rollout_percentage: 0, rollout_duration_hours: 0 }
    dependencies JSONB,   -- { requires: [], conflicts_with: [], affects: [] }
    monitoring JSONB,     -- { track_usage: true, alert_on_change: false, health_check_enabled: true, rollback_conditions: [] }
    
    -- Indexing for performance
    CONSTRAINT fk_admin_feature_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_admin_feature_updated_by FOREIGN KEY (last_updated_by) REFERENCES users(id)
);

-- Feature audit log for tracking all changes
CREATE TABLE feature_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'enabled', 'disabled', 'deleted', 'emergency_override')),
    changes JSONB NOT NULL, -- { field: { old: value, new: value } }
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT fk_feature_audit_feature FOREIGN KEY (feature_id) REFERENCES admin_feature_toggles(id) ON DELETE CASCADE,
    CONSTRAINT fk_feature_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Feature usage statistics
CREATE TABLE feature_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL UNIQUE,
    total_evaluations BIGINT DEFAULT 0,
    evaluations_last_24h BIGINT DEFAULT 0,
    unique_users_last_24h INTEGER DEFAULT 0,
    avg_response_time_ms NUMERIC(10,2) DEFAULT 0,
    error_rate_percentage NUMERIC(5,2) DEFAULT 0,
    last_evaluation TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_feature_stats_feature FOREIGN KEY (feature_id) REFERENCES admin_feature_toggles(id) ON DELETE CASCADE
);

-- Feature health monitoring status
CREATE TABLE feature_health_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'disabled')) DEFAULT 'healthy',
    issues JSONB DEFAULT '[]', -- Array of issue descriptions
    last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
    availability_percentage NUMERIC(5,2) DEFAULT 100.00 CHECK (availability_percentage >= 0 AND availability_percentage <= 100),
    
    CONSTRAINT fk_feature_health_feature FOREIGN KEY (feature_id) REFERENCES admin_feature_toggles(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX idx_admin_feature_toggles_key ON admin_feature_toggles(key);
CREATE INDEX idx_admin_feature_toggles_enabled ON admin_feature_toggles(enabled);
CREATE INDEX idx_admin_feature_toggles_created_by ON admin_feature_toggles(created_by);
CREATE INDEX idx_admin_feature_toggles_type ON admin_feature_toggles(type);
CREATE INDEX idx_admin_feature_toggles_created_at ON admin_feature_toggles(created_at);

-- Indexes for user targeting queries
CREATE INDEX idx_admin_feature_toggles_user_targeting ON admin_feature_toggles USING GIN (user_targeting) WHERE user_targeting IS NOT NULL;
CREATE INDEX idx_admin_feature_toggles_scheduling ON admin_feature_toggles USING GIN (scheduling) WHERE scheduling IS NOT NULL;
CREATE INDEX idx_admin_feature_toggles_dependencies ON admin_feature_toggles USING GIN (dependencies) WHERE dependencies IS NOT NULL;

-- Audit log indexes
CREATE INDEX idx_feature_audit_log_feature_id ON feature_audit_log(feature_id);
CREATE INDEX idx_feature_audit_log_user_id ON feature_audit_log(user_id);
CREATE INDEX idx_feature_audit_log_timestamp ON feature_audit_log(timestamp);
CREATE INDEX idx_feature_audit_log_action ON feature_audit_log(action);

-- Usage stats indexes
CREATE INDEX idx_feature_usage_stats_feature_id ON feature_usage_stats(feature_id);
CREATE INDEX idx_feature_usage_stats_last_updated ON feature_usage_stats(last_updated);

-- Health status indexes
CREATE INDEX idx_feature_health_status_feature_id ON feature_health_status(feature_id);
CREATE INDEX idx_feature_health_status_status ON feature_health_status(status);
CREATE INDEX idx_feature_health_status_last_check ON feature_health_status(last_check);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_admin_feature_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_feature_updated_at
    BEFORE UPDATE ON admin_feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_feature_updated_at();

-- Trigger for automatic usage stats updates
CREATE OR REPLACE FUNCTION update_feature_usage_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feature_usage_stats_updated
    BEFORE UPDATE ON feature_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_usage_stats_timestamp();

-- View for dashboard statistics (optimized for frequent queries)
CREATE VIEW admin_feature_dashboard_stats AS
SELECT 
    COUNT(*) as total_features,
    COUNT(*) FILTER (WHERE enabled = true) as enabled_features,
    COUNT(*) FILTER (WHERE enabled = false) as disabled_features,
    COUNT(*) FILTER (WHERE scheduling IS NOT NULL) as scheduled_features,
    COUNT(*) FILTER (WHERE user_targeting IS NOT NULL) as targeted_features,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM feature_health_status 
        WHERE feature_id = admin_feature_toggles.id 
        AND status IN ('warning', 'critical')
    )) as features_with_issues,
    COALESCE(SUM((
        SELECT evaluations_last_24h FROM feature_usage_stats 
        WHERE feature_id = admin_feature_toggles.id
    )), 0) as total_evaluations_24h,
    COALESCE(SUM((
        SELECT unique_users_last_24h FROM feature_usage_stats 
        WHERE feature_id = admin_feature_toggles.id
    )), 0) as unique_users_24h,
    COALESCE(AVG((
        SELECT avg_response_time_ms FROM feature_usage_stats 
        WHERE feature_id = admin_feature_toggles.id
    )), 0) as avg_response_time
FROM admin_feature_toggles;

-- View for recent changes (last 24 hours)
CREATE VIEW admin_feature_recent_changes AS
SELECT 
    al.*,
    aft.key as feature_key,
    aft.name as feature_name,
    u.display_name as user_name
FROM feature_audit_log al
JOIN admin_feature_toggles aft ON al.feature_id = aft.id
LEFT JOIN users u ON al.user_id = u.id
WHERE al.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY al.timestamp DESC
LIMIT 50;

-- View for feature health summary
CREATE VIEW admin_feature_health_summary AS
SELECT 
    aft.id,
    aft.key,
    aft.name,
    aft.enabled,
    fhs.status as health_status,
    fhs.performance_score,
    fhs.availability_percentage,
    fhs.issues,
    fhs.last_check,
    fus.total_evaluations,
    fus.evaluations_last_24h,
    fus.avg_response_time_ms,
    fus.error_rate_percentage
FROM admin_feature_toggles aft
LEFT JOIN feature_health_status fhs ON aft.id = fhs.feature_id
LEFT JOIN feature_usage_stats fus ON aft.id = fus.feature_id
ORDER BY aft.created_at DESC;

-- Sample data for development and testing
INSERT INTO admin_feature_toggles (key, name, description, type, value, enabled, created_by, user_targeting, monitoring) VALUES
('enhanced_search', 'Enhanced Search Algorithm', 'Advanced AI-powered search with semantic matching', 'boolean', 'true', false, '00000000-0000-0000-0000-000000000001',
 '{"segments": ["beta_users"], "percentage": 25, "rules": [{"field": "account_type", "operator": "equals", "value": "premium"}]}',
 '{"track_usage": true, "alert_on_change": true, "health_check_enabled": true}'),
('new_dashboard_ui', 'New Dashboard Interface', 'Redesigned dashboard with improved UX', 'boolean', 'true', false, '00000000-0000-0000-0000-000000000001',
 '{"segments": ["internal_users"], "percentage": 10}',
 '{"track_usage": true, "health_check_enabled": true}'),
('advanced_analytics', 'Advanced Analytics Engine', 'Enhanced analytics with real-time insights', 'json', '{"version": "2.0", "features": ["realtime", "predictive"]}', true, '00000000-0000-0000-0000-000000000001',
 NULL,
 '{"track_usage": true, "alert_on_change": false, "health_check_enabled": true}');

-- Initialize usage stats for sample features
INSERT INTO feature_usage_stats (feature_id, total_evaluations, evaluations_last_24h, unique_users_last_24h, avg_response_time_ms)
SELECT id, 0, 0, 0, 0 FROM admin_feature_toggles;

-- Initialize health status for sample features
INSERT INTO feature_health_status (feature_id, status, performance_score, availability_percentage)
SELECT id, 'healthy', 100, 100.00 FROM admin_feature_toggles;

-- Create initial audit log entries
INSERT INTO feature_audit_log (feature_id, user_id, action, changes, reason) 
SELECT 
    id, 
    created_by, 
    'created', 
    jsonb_build_object('feature_data', jsonb_build_object('old', null, 'new', jsonb_build_object('key', key, 'name', name, 'enabled', enabled))),
    'Initial feature creation'
FROM admin_feature_toggles;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_feature_toggles TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_audit_log TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_usage_stats TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_health_status TO app_user;
GRANT SELECT ON admin_feature_dashboard_stats TO app_user;
GRANT SELECT ON admin_feature_recent_changes TO app_user;
GRANT SELECT ON admin_feature_health_summary TO app_user;

-- Comments for documentation
COMMENT ON TABLE admin_feature_toggles IS 'Administrative feature toggle management with advanced targeting, scheduling, and monitoring capabilities';
COMMENT ON TABLE feature_audit_log IS 'Comprehensive audit trail for all feature toggle changes and administrative actions';
COMMENT ON TABLE feature_usage_stats IS 'Real-time usage statistics and performance metrics for feature toggles';
COMMENT ON TABLE feature_health_status IS 'Health monitoring and status tracking for feature toggle performance';

COMMENT ON COLUMN admin_feature_toggles.user_targeting IS 'JSONB configuration for user segmentation, percentage rollouts, and targeting rules';
COMMENT ON COLUMN admin_feature_toggles.scheduling IS 'JSONB configuration for scheduled feature activation/deactivation and gradual rollouts';
COMMENT ON COLUMN admin_feature_toggles.dependencies IS 'JSONB configuration for feature dependencies, conflicts, and impact relationships';
COMMENT ON COLUMN admin_feature_toggles.monitoring IS 'JSONB configuration for usage tracking, alerting, and health monitoring';

-- Migration completion marker
INSERT INTO schema_versions (version, description, applied_at) VALUES 
(17, 'Epic 17 Story 17.1 - Administrative Feature Management Tables', NOW());