-- Toggle Parameters Database Schema - Epic 17
-- Task: E17-1753114396772-E6C1FD - Create toggle parameters
--
-- Database schema for advanced toggle parameter management including
-- presets, change tracking, and validation support.

-- ==========================================
-- Toggle Parameter Presets Table
-- ==========================================

CREATE TABLE IF NOT EXISTS toggle_parameter_presets (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    toggle_type VARCHAR(50) NOT NULL CHECK (toggle_type IN (
        'boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic'
    )),
    parameters JSONB NOT NULL DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    usage VARCHAR(20) NOT NULL DEFAULT 'development' CHECK (usage IN (
        'development', 'staging', 'production', 'experiment'
    )),
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for parameter presets
CREATE INDEX IF NOT EXISTS idx_parameter_presets_toggle_type ON toggle_parameter_presets(toggle_type);
CREATE INDEX IF NOT EXISTS idx_parameter_presets_usage ON toggle_parameter_presets(usage);
CREATE INDEX IF NOT EXISTS idx_parameter_presets_created_by ON toggle_parameter_presets(created_by);
CREATE INDEX IF NOT EXISTS idx_parameter_presets_created_at ON toggle_parameter_presets(created_at DESC);

-- GIN index for tags array operations
CREATE INDEX IF NOT EXISTS idx_parameter_presets_tags ON toggle_parameter_presets USING GIN (tags);

-- GIN index for parameters JSONB operations
CREATE INDEX IF NOT EXISTS idx_parameter_presets_parameters ON toggle_parameter_presets USING GIN (parameters);

-- ==========================================
-- Toggle Parameter Changes Table
-- ==========================================

CREATE TABLE IF NOT EXISTS toggle_parameter_changes (
    id VARCHAR(100) PRIMARY KEY,
    toggle_id VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    changed_by VARCHAR(100) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for parameter changes
CREATE INDEX IF NOT EXISTS idx_parameter_changes_toggle_id ON toggle_parameter_changes(toggle_id);
CREATE INDEX IF NOT EXISTS idx_parameter_changes_field_name ON toggle_parameter_changes(field_name);
CREATE INDEX IF NOT EXISTS idx_parameter_changes_changed_by ON toggle_parameter_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_parameter_changes_changed_at ON toggle_parameter_changes(changed_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_parameter_changes_toggle_field ON toggle_parameter_changes(toggle_id, field_name);
CREATE INDEX IF NOT EXISTS idx_parameter_changes_toggle_time ON toggle_parameter_changes(toggle_id, changed_at DESC);

-- ==========================================
-- Toggle Parameter Templates Table
-- ==========================================

CREATE TABLE IF NOT EXISTS toggle_parameter_templates (
    id VARCHAR(100) PRIMARY KEY,
    toggle_type VARCHAR(50) NOT NULL CHECK (toggle_type IN (
        'boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic'
    )),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_parameters JSONB NOT NULL DEFAULT '{}',
    required_fields JSONB NOT NULL DEFAULT '[]',
    optional_fields JSONB NOT NULL DEFAULT '[]',
    validation_rules JSONB NOT NULL DEFAULT '[]',
    is_system_template BOOLEAN NOT NULL DEFAULT false,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(toggle_type, name)
);

-- Indexes for parameter templates
CREATE INDEX IF NOT EXISTS idx_parameter_templates_toggle_type ON toggle_parameter_templates(toggle_type);
CREATE INDEX IF NOT EXISTS idx_parameter_templates_system ON toggle_parameter_templates(is_system_template);
CREATE INDEX IF NOT EXISTS idx_parameter_templates_created_at ON toggle_parameter_templates(created_at DESC);

-- ==========================================
-- Toggle Parameter Validation Cache Table
-- ==========================================

CREATE TABLE IF NOT EXISTS toggle_parameter_validation_cache (
    id VARCHAR(100) PRIMARY KEY,
    toggle_type VARCHAR(50) NOT NULL,
    parameters_hash VARCHAR(64) NOT NULL, -- SHA-256 of parameters JSON
    validation_result JSONB NOT NULL, -- { isValid, errors, warnings }
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    
    UNIQUE(toggle_type, parameters_hash)
);

-- Indexes for validation cache
CREATE INDEX IF NOT EXISTS idx_validation_cache_type_hash ON toggle_parameter_validation_cache(toggle_type, parameters_hash);
CREATE INDEX IF NOT EXISTS idx_validation_cache_expires_at ON toggle_parameter_validation_cache(expires_at);

-- ==========================================
-- Parameter Usage Analytics Table
-- ==========================================

CREATE TABLE IF NOT EXISTS toggle_parameter_usage_analytics (
    id VARCHAR(100) PRIMARY KEY,
    toggle_id VARCHAR(100) NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    parameter_type VARCHAR(50) NOT NULL, -- 'percentage', 'variant', 'rule', etc.
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    evaluation_time_avg_ms NUMERIC(10, 3) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(toggle_id, parameter_name)
);

-- Indexes for usage analytics
CREATE INDEX IF NOT EXISTS idx_usage_analytics_toggle_id ON toggle_parameter_usage_analytics(toggle_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_parameter_type ON toggle_parameter_usage_analytics(parameter_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_usage_count ON toggle_parameter_usage_analytics(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_last_used ON toggle_parameter_usage_analytics(last_used_at DESC);

-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Function to update the updated_at timestamp for parameter presets
CREATE OR REPLACE FUNCTION update_parameter_preset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates on parameter presets
DROP TRIGGER IF EXISTS trg_parameter_presets_updated_at ON toggle_parameter_presets;
CREATE TRIGGER trg_parameter_presets_updated_at
    BEFORE UPDATE ON toggle_parameter_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_parameter_preset_timestamp();

-- Function to update the updated_at timestamp for parameter templates
CREATE OR REPLACE FUNCTION update_parameter_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates on parameter templates
DROP TRIGGER IF EXISTS trg_parameter_templates_updated_at ON toggle_parameter_templates;
CREATE TRIGGER trg_parameter_templates_updated_at
    BEFORE UPDATE ON toggle_parameter_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_parameter_template_timestamp();

-- Function to cleanup expired validation cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_validation_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    DELETE FROM toggle_parameter_validation_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update parameter usage analytics
CREATE OR REPLACE FUNCTION update_parameter_usage_analytics(
    p_toggle_id VARCHAR(100),
    p_parameter_name VARCHAR(255),
    p_parameter_type VARCHAR(50),
    p_success BOOLEAN,
    p_evaluation_time_ms NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO toggle_parameter_usage_analytics (
        id, toggle_id, parameter_name, parameter_type, usage_count, 
        success_count, error_count, last_used_at, evaluation_time_avg_ms
    ) VALUES (
        'analytics_' || p_toggle_id || '_' || p_parameter_name,
        p_toggle_id,
        p_parameter_name,
        p_parameter_type,
        1,
        CASE WHEN p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        NOW(),
        COALESCE(p_evaluation_time_ms, 0)
    )
    ON CONFLICT (toggle_id, parameter_name) 
    DO UPDATE SET
        usage_count = toggle_parameter_usage_analytics.usage_count + 1,
        success_count = toggle_parameter_usage_analytics.success_count + 
            CASE WHEN p_success THEN 1 ELSE 0 END,
        error_count = toggle_parameter_usage_analytics.error_count + 
            CASE WHEN p_success THEN 0 ELSE 1 END,
        last_used_at = NOW(),
        evaluation_time_avg_ms = (
            toggle_parameter_usage_analytics.evaluation_time_avg_ms * 
            toggle_parameter_usage_analytics.usage_count + 
            COALESCE(p_evaluation_time_ms, 0)
        ) / (toggle_parameter_usage_analytics.usage_count + 1),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Views for Common Queries
-- ==========================================

-- Parameter usage summary view
CREATE OR REPLACE VIEW parameter_usage_summary AS
SELECT 
    pua.toggle_id,
    ft.name as toggle_name,
    ft.type as toggle_type,
    COUNT(*) as total_parameters,
    SUM(pua.usage_count) as total_usage,
    SUM(pua.success_count) as total_success,
    SUM(pua.error_count) as total_errors,
    AVG(pua.evaluation_time_avg_ms) as avg_evaluation_time_ms,
    MAX(pua.last_used_at) as last_used_at
FROM toggle_parameter_usage_analytics pua
LEFT JOIN feature_toggles ft ON pua.toggle_id = ft.id
GROUP BY pua.toggle_id, ft.name, ft.type;

-- Popular parameter presets view
CREATE OR REPLACE VIEW popular_parameter_presets AS
SELECT 
    pp.*,
    COUNT(pc.toggle_id) as usage_count,
    MAX(pc.changed_at) as last_applied
FROM toggle_parameter_presets pp
LEFT JOIN toggle_parameter_changes pc ON pc.reason LIKE '%preset: ' || pp.name || '%'
GROUP BY pp.id
ORDER BY usage_count DESC, pp.created_at DESC;

-- Recent parameter changes view
CREATE OR REPLACE VIEW recent_parameter_changes AS
SELECT 
    pc.*,
    ft.name as toggle_name,
    ft.type as toggle_type
FROM toggle_parameter_changes pc
LEFT JOIN feature_toggles ft ON pc.toggle_id = ft.id
WHERE pc.changed_at >= NOW() - INTERVAL '30 days'
ORDER BY pc.changed_at DESC;

-- ==========================================
-- Default Parameter Templates
-- ==========================================

-- Insert system parameter templates
INSERT INTO toggle_parameter_templates (
    id, toggle_type, name, description, default_parameters, 
    required_fields, optional_fields, validation_rules, is_system_template
) VALUES 
    (
        'template_boolean_basic',
        'boolean',
        'Basic Boolean Toggle',
        'Simple on/off toggle with no additional parameters',
        '{"enabled": false}',
        '["enabled"]',
        '[]',
        '[{"field": "enabled", "rule": "boolean", "message": "Enabled must be a boolean value"}]',
        true
    ),
    (
        'template_percentage_basic',
        'percentage_rollout',
        'Basic Percentage Rollout',
        'Simple percentage-based rollout with gradual rollout option',
        '{"percentage": 0, "saltKey": null, "gradualRollout": {"enabled": false, "startPercentage": 0, "endPercentage": 100, "durationHours": 24, "incrementSize": 10}}',
        '["percentage"]',
        '["saltKey", "gradualRollout"]',
        '[
            {"field": "percentage", "rule": "range:0,100", "message": "Percentage must be between 0 and 100"},
            {"field": "gradualRollout.startPercentage", "rule": "range:0,100", "message": "Start percentage must be between 0 and 100"},
            {"field": "gradualRollout.endPercentage", "rule": "range:0,100", "message": "End percentage must be between 0 and 100"}
        ]',
        true
    ),
    (
        'template_multivariate_ab',
        'multivariate',
        'A/B Test Template',
        'Simple A/B test with two variants',
        '{"variants": [{"key": "control", "value": "control", "percentage": 50, "enabled": true}, {"key": "treatment", "value": "treatment", "percentage": 50, "enabled": true}], "saltKey": null, "defaultVariant": "control", "trafficAllocation": 100}',
        '["variants"]',
        '["saltKey", "defaultVariant", "trafficAllocation"]',
        '[
            {"field": "variants", "rule": "array:min:1", "message": "At least one variant is required"},
            {"field": "trafficAllocation", "rule": "range:0,100", "message": "Traffic allocation must be between 0 and 100"}
        ]',
        true
    ),
    (
        'template_scheduled_business_hours',
        'scheduled',
        'Business Hours Schedule',
        'Toggle active during business hours (9 AM - 5 PM weekdays)',
        '{"enabled": true, "startTime": null, "endTime": null, "timezone": "America/New_York", "recurrence": {"type": "weekly", "interval": 1, "daysOfWeek": [1,2,3,4,5]}}',
        '["enabled", "timezone"]',
        '["startTime", "endTime", "recurrence", "overrideOnHolidays"]',
        '[
            {"field": "timezone", "rule": "timezone", "message": "Invalid timezone format"},
            {"field": "recurrence.interval", "rule": "min:1", "message": "Recurrence interval must be at least 1"}
        ]',
        true
    ),
    (
        'template_segmentation_user_tier',
        'segmentation',
        'User Tier Segmentation',
        'Enable feature based on user subscription tier',
        '{"rules": [{"id": "premium_users", "attribute": "user.tier", "operator": "in", "value": ["premium", "enterprise"], "logicalOperator": "AND", "enabled": true}], "defaultValue": false, "evaluationMode": "first_match", "fallbackBehavior": "default"}',
        '["rules", "defaultValue", "evaluationMode"]',
        '["fallbackBehavior"]',
        '[
            {"field": "rules", "rule": "array:min:1", "message": "At least one segmentation rule is required"},
            {"field": "evaluationMode", "rule": "enum:first_match,all_rules,weighted", "message": "Invalid evaluation mode"}
        ]',
        true
    )
ON CONFLICT (toggle_type, name) DO NOTHING;

-- ==========================================
-- Default Parameter Presets
-- ==========================================

-- Insert common parameter presets
INSERT INTO toggle_parameter_presets (
    id, name, description, toggle_type, parameters, tags, usage, created_by
) VALUES 
    (
        'preset_canary_5pct',
        'Canary Release (5%)',
        'Conservative canary release affecting 5% of users',
        'percentage_rollout',
        '{"percentage": 5, "saltKey": null, "gradualRollout": {"enabled": false}}',
        '["canary", "conservative", "rollout"]',
        'production',
        'SYSTEM'
    ),
    (
        'preset_gradual_rollout_24h',
        'Gradual 24h Rollout',
        'Gradual rollout from 0% to 100% over 24 hours in 10% increments',
        'percentage_rollout',
        '{"percentage": 0, "saltKey": null, "gradualRollout": {"enabled": true, "startPercentage": 0, "endPercentage": 100, "durationHours": 24, "incrementSize": 10}}',
        '["gradual", "rollout", "24h", "safe"]',
        'production',
        'SYSTEM'
    ),
    (
        'preset_ab_50_50',
        'A/B Test 50/50',
        'Standard A/B test with equal traffic split',
        'multivariate',
        '{"variants": [{"key": "control", "value": false, "percentage": 50, "description": "Control group", "enabled": true}, {"key": "treatment", "value": true, "percentage": 50, "description": "Treatment group", "enabled": true}], "saltKey": null, "defaultVariant": "control", "trafficAllocation": 100}',
        '["ab-test", "experiment", "50-50"]',
        'experiment',
        'SYSTEM'
    ),
    (
        'preset_business_hours_eastern',
        'Business Hours (Eastern)',
        'Active during business hours in Eastern timezone',
        'scheduled',
        '{"enabled": true, "startTime": "09:00", "endTime": "17:00", "timezone": "America/New_York", "recurrence": {"type": "weekly", "interval": 1, "daysOfWeek": [1,2,3,4,5]}}',
        '["business-hours", "eastern", "weekdays"]',
        'production',
        'SYSTEM'
    ),
    (
        'preset_premium_users',
        'Premium Users Only',
        'Feature enabled only for premium tier users',
        'segmentation',
        '{"rules": [{"id": "premium_tier", "attribute": "user.subscriptionTier", "operator": "equals", "value": "premium", "logicalOperator": "AND", "enabled": true}], "defaultValue": false, "evaluationMode": "first_match", "fallbackBehavior": "default"}',
        '["premium", "subscription", "segmentation"]',
        'production',
        'SYSTEM'
    )
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Cleanup Job Function
-- ==========================================

-- Function to run periodic cleanup tasks
CREATE OR REPLACE FUNCTION toggle_parameters_cleanup_job()
RETURNS TABLE(
    validation_cache_cleaned INTEGER,
    old_changes_archived INTEGER
) AS $$
DECLARE
    validation_cleaned INTEGER := 0;
    changes_archived INTEGER := 0;
BEGIN
    -- Clean up expired validation cache
    validation_cleaned := cleanup_expired_validation_cache();
    
    -- Archive old parameter changes (keep last 90 days)
    UPDATE toggle_parameter_changes 
    SET metadata = COALESCE(metadata, '{}') || '{"archived": true}'::jsonb
    WHERE changed_at < NOW() - INTERVAL '90 days' 
    AND (metadata->>'archived') IS NULL;
    
    GET DIAGNOSTICS changes_archived = ROW_COUNT;
    
    RETURN QUERY SELECT validation_cleaned, changes_archived;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Security and Permissions
-- ==========================================

-- Create role for parameter management operations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'toggle_parameter_manager_role') THEN
        CREATE ROLE toggle_parameter_manager_role;
    END IF;
END $$;

-- Grant necessary permissions for parameter management
GRANT SELECT, INSERT, UPDATE, DELETE ON toggle_parameter_presets TO toggle_parameter_manager_role;
GRANT SELECT, INSERT, UPDATE ON toggle_parameter_changes TO toggle_parameter_manager_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON toggle_parameter_templates TO toggle_parameter_manager_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON toggle_parameter_validation_cache TO toggle_parameter_manager_role;
GRANT SELECT, UPDATE ON toggle_parameter_usage_analytics TO toggle_parameter_manager_role;
GRANT SELECT ON parameter_usage_summary TO toggle_parameter_manager_role;
GRANT SELECT ON popular_parameter_presets TO toggle_parameter_manager_role;
GRANT SELECT ON recent_parameter_changes TO toggle_parameter_manager_role;

-- ==========================================
-- Comments for Documentation
-- ==========================================

COMMENT ON TABLE toggle_parameter_presets IS 'Predefined parameter configurations for common toggle patterns';
COMMENT ON TABLE toggle_parameter_changes IS 'Audit trail of all parameter changes with field-level tracking';
COMMENT ON TABLE toggle_parameter_templates IS 'Templates defining parameter structure and validation for toggle types';
COMMENT ON TABLE toggle_parameter_validation_cache IS 'Cache for parameter validation results to improve performance';
COMMENT ON TABLE toggle_parameter_usage_analytics IS 'Analytics data for parameter usage patterns and performance';

COMMENT ON VIEW parameter_usage_summary IS 'Aggregated view of parameter usage across all toggles';
COMMENT ON VIEW popular_parameter_presets IS 'Most frequently used parameter presets';
COMMENT ON VIEW recent_parameter_changes IS 'Recent parameter changes with toggle context';

COMMENT ON FUNCTION update_parameter_usage_analytics IS 'Updates usage analytics for toggle parameters';
COMMENT ON FUNCTION toggle_parameters_cleanup_job IS 'Periodic cleanup job for parameter-related data';

-- ==========================================
-- Migration Completion
-- ==========================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Toggle Parameters migration completed successfully';
    RAISE NOTICE 'Tables created: toggle_parameter_presets, toggle_parameter_changes, toggle_parameter_templates, toggle_parameter_validation_cache, toggle_parameter_usage_analytics';
    RAISE NOTICE 'Views created: parameter_usage_summary, popular_parameter_presets, recent_parameter_changes';
    RAISE NOTICE 'Functions created: update_parameter_usage_analytics, toggle_parameters_cleanup_job';
    RAISE NOTICE 'Default templates inserted: 5 system parameter templates';
    RAISE NOTICE 'Default presets inserted: 5 common parameter presets';
END $$;