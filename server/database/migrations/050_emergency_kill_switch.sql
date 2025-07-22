-- Emergency Kill Switch Database Schema - Epic 17
-- Task: E17-1753114396769-A130B3 - Implement emergency kill switch
--
-- Database schema for emergency kill switch functionality to rapidly
-- disable feature toggles in crisis situations.

-- ==========================================
-- Emergency Kill Switches Table
-- ==========================================

CREATE TABLE IF NOT EXISTS emergency_kill_switches (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    scope VARCHAR(50) NOT NULL CHECK (scope IN (
        'ALL', 'CLAUDE_IMPACT', 'CRITICAL_FEATURES', 'CUSTOM'
    )),
    target_toggles JSONB DEFAULT '[]',
    claude_impact_levels JSONB DEFAULT '[]',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activated TIMESTAMPTZ,
    last_activated_by VARCHAR(100),
    activation_count INTEGER NOT NULL DEFAULT 0
);

-- Indexes for emergency kill switches
CREATE INDEX IF NOT EXISTS idx_kill_switches_scope ON emergency_kill_switches(scope);
CREATE INDEX IF NOT EXISTS idx_kill_switches_enabled ON emergency_kill_switches(enabled);
CREATE INDEX IF NOT EXISTS idx_kill_switches_created_at ON emergency_kill_switches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kill_switches_last_activated ON emergency_kill_switches(last_activated DESC);

-- GIN index for target_toggles array operations
CREATE INDEX IF NOT EXISTS idx_kill_switches_target_toggles ON emergency_kill_switches USING GIN (target_toggles);

-- GIN index for claude_impact_levels array operations  
CREATE INDEX IF NOT EXISTS idx_kill_switches_claude_impact ON emergency_kill_switches USING GIN (claude_impact_levels);

-- ==========================================
-- Kill Switch Activations Table
-- ==========================================

CREATE TABLE IF NOT EXISTS kill_switch_activations (
    id VARCHAR(100) PRIMARY KEY,
    kill_switch_id VARCHAR(100) NOT NULL,
    activated_by VARCHAR(100) NOT NULL,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT NOT NULL,
    affected_toggles JSONB NOT NULL DEFAULT '[]',
    rollback_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'ACTIVE', 'ROLLED_BACK', 'EXPIRED'
    )) DEFAULT 'ACTIVE',
    auto_rollback_at TIMESTAMPTZ,
    rolled_back_at TIMESTAMPTZ,
    rolled_back_by VARCHAR(100),
    rollback_reason TEXT,
    
    -- Foreign key constraint
    CONSTRAINT fk_activations_kill_switch 
        FOREIGN KEY (kill_switch_id) REFERENCES emergency_kill_switches(id)
        ON DELETE CASCADE
);

-- Indexes for kill switch activations
CREATE INDEX IF NOT EXISTS idx_activations_kill_switch_id ON kill_switch_activations(kill_switch_id);
CREATE INDEX IF NOT EXISTS idx_activations_status ON kill_switch_activations(status);
CREATE INDEX IF NOT EXISTS idx_activations_activated_by ON kill_switch_activations(activated_by);
CREATE INDEX IF NOT EXISTS idx_activations_activated_at ON kill_switch_activations(activated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activations_auto_rollback ON kill_switch_activations(auto_rollback_at);

-- GIN index for affected_toggles array operations
CREATE INDEX IF NOT EXISTS idx_activations_affected_toggles ON kill_switch_activations USING GIN (affected_toggles);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activations_status_activated_at ON kill_switch_activations(status, activated_at DESC);

-- ==========================================
-- Emergency Actions Log Table
-- ==========================================

CREATE TABLE IF NOT EXISTS emergency_actions_log (
    id VARCHAR(100) PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'KILL_SWITCH_CREATED', 'KILL_SWITCH_ACTIVATED', 'KILL_SWITCH_ROLLED_BACK',
        'EMERGENCY_ALL_DISABLED', 'EMERGENCY_CLAUDE_DISABLED', 'EMERGENCY_CRITICAL_DISABLED',
        'MANUAL_TOGGLE_OVERRIDE', 'AUTO_ROLLBACK_EXECUTED'
    )),
    kill_switch_id VARCHAR(100),
    activation_id VARCHAR(100),
    executed_by VARCHAR(100) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    affected_resources JSONB DEFAULT '{}',
    execution_time_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for emergency actions log
CREATE INDEX IF NOT EXISTS idx_emergency_log_action_type ON emergency_actions_log(action_type);
CREATE INDEX IF NOT EXISTS idx_emergency_log_executed_by ON emergency_actions_log(executed_by);
CREATE INDEX IF NOT EXISTS idx_emergency_log_executed_at ON emergency_actions_log(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_log_kill_switch ON emergency_actions_log(kill_switch_id);
CREATE INDEX IF NOT EXISTS idx_emergency_log_activation ON emergency_actions_log(activation_id);
CREATE INDEX IF NOT EXISTS idx_emergency_log_success ON emergency_actions_log(success);

-- ==========================================
-- Feature Toggles Schema Updates
-- ==========================================

-- Add columns to existing feature_toggles table for kill switch tracking
DO $$ 
BEGIN
    -- Add disable_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feature_toggles' AND column_name = 'disable_reason'
    ) THEN
        ALTER TABLE feature_toggles ADD COLUMN disable_reason TEXT;
    END IF;

    -- Add emergency_disabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feature_toggles' AND column_name = 'emergency_disabled'
    ) THEN
        ALTER TABLE feature_toggles ADD COLUMN emergency_disabled BOOLEAN DEFAULT false;
    END IF;

    -- Add emergency_disabled_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feature_toggles' AND column_name = 'emergency_disabled_at'
    ) THEN
        ALTER TABLE feature_toggles ADD COLUMN emergency_disabled_at TIMESTAMPTZ;
    END IF;

    -- Add emergency_disabled_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feature_toggles' AND column_name = 'emergency_disabled_by'
    ) THEN
        ALTER TABLE feature_toggles ADD COLUMN emergency_disabled_by VARCHAR(100);
    END IF;
END $$;

-- Index for emergency disabled toggles
CREATE INDEX IF NOT EXISTS idx_feature_toggles_emergency_disabled ON feature_toggles(emergency_disabled);

-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_kill_switch_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates on kill switches
DROP TRIGGER IF EXISTS trg_kill_switches_updated_at ON emergency_kill_switches;
CREATE TRIGGER trg_kill_switches_updated_at
    BEFORE UPDATE ON emergency_kill_switches
    FOR EACH ROW
    EXECUTE FUNCTION update_kill_switch_timestamp();

-- Function to log emergency actions automatically
CREATE OR REPLACE FUNCTION log_emergency_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'kill_switch_activations' THEN
        INSERT INTO emergency_actions_log (
            id, action_type, kill_switch_id, activation_id,
            executed_by, reason, affected_resources
        ) VALUES (
            'log_' || NEW.id,
            'KILL_SWITCH_ACTIVATED',
            NEW.kill_switch_id,
            NEW.id,
            NEW.activated_by,
            NEW.reason,
            json_build_object('affected_toggles', NEW.affected_toggles)
        );
    ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'kill_switch_activations' 
          AND OLD.status = 'ACTIVE' AND NEW.status = 'ROLLED_BACK' THEN
        INSERT INTO emergency_actions_log (
            id, action_type, kill_switch_id, activation_id,
            executed_by, reason
        ) VALUES (
            'log_rb_' || NEW.id,
            'KILL_SWITCH_ROLLED_BACK',
            NEW.kill_switch_id,
            NEW.id,
            NEW.rolled_back_by,
            NEW.rollback_reason
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic logging
DROP TRIGGER IF EXISTS trg_log_activation_insert ON kill_switch_activations;
CREATE TRIGGER trg_log_activation_insert
    AFTER INSERT ON kill_switch_activations
    FOR EACH ROW
    EXECUTE FUNCTION log_emergency_action();

DROP TRIGGER IF EXISTS trg_log_activation_update ON kill_switch_activations;
CREATE TRIGGER trg_log_activation_update
    AFTER UPDATE ON kill_switch_activations
    FOR EACH ROW
    EXECUTE FUNCTION log_emergency_action();

-- ==========================================
-- Views for Common Queries
-- ==========================================

-- Active kill switches view
CREATE OR REPLACE VIEW active_kill_switches AS
SELECT 
    ks.*,
    COUNT(a.id) as active_activations
FROM emergency_kill_switches ks
LEFT JOIN kill_switch_activations a ON ks.id = a.kill_switch_id AND a.status = 'ACTIVE'
WHERE ks.enabled = true
GROUP BY ks.id;

-- Emergency status overview
CREATE OR REPLACE VIEW emergency_status_overview AS
SELECT 
    COUNT(CASE WHEN ks.enabled = true THEN 1 END) as enabled_kill_switches,
    COUNT(CASE WHEN a.status = 'ACTIVE' THEN 1 END) as active_activations,
    COUNT(CASE WHEN ft.emergency_disabled = true THEN 1 END) as emergency_disabled_toggles,
    MAX(a.activated_at) as last_emergency_activation,
    COUNT(DISTINCT CASE WHEN a.activated_at >= NOW() - INTERVAL '24 hours' THEN a.id END) as activations_last_24h
FROM emergency_kill_switches ks
CROSS JOIN kill_switch_activations a
CROSS JOIN feature_toggles ft;

-- Recent emergency activity view
CREATE OR REPLACE VIEW recent_emergency_activity AS
SELECT 
    'ACTIVATION' as activity_type,
    a.id as activity_id,
    ks.name as kill_switch_name,
    a.activated_by as user_id,
    a.activated_at as activity_time,
    a.reason as activity_reason,
    a.status,
    array_length(ARRAY(SELECT jsonb_array_elements_text(a.affected_toggles)), 1) as affected_count
FROM kill_switch_activations a
JOIN emergency_kill_switches ks ON a.kill_switch_id = ks.id
WHERE a.activated_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'CREATION' as activity_type,
    ks.id as activity_id,
    ks.name as kill_switch_name,
    ks.created_by as user_id,
    ks.created_at as activity_time,
    'Kill switch created' as activity_reason,
    'CREATED' as status,
    0 as affected_count
FROM emergency_kill_switches ks
WHERE ks.created_at >= NOW() - INTERVAL '7 days'

ORDER BY activity_time DESC;

-- ==========================================
-- Functions for Emergency Operations
-- ==========================================

-- Function to get emergency metrics
CREATE OR REPLACE FUNCTION get_emergency_metrics()
RETURNS TABLE(
    total_kill_switches INTEGER,
    enabled_kill_switches INTEGER,
    active_activations INTEGER,
    emergency_disabled_toggles INTEGER,
    total_activations_today INTEGER,
    avg_activation_duration_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_kill_switches,
        COUNT(CASE WHEN ks.enabled = true THEN 1 END)::INTEGER as enabled_kill_switches,
        COUNT(CASE WHEN a.status = 'ACTIVE' THEN 1 END)::INTEGER as active_activations,
        COUNT(CASE WHEN ft.emergency_disabled = true THEN 1 END)::INTEGER as emergency_disabled_toggles,
        COUNT(CASE WHEN a.activated_at >= CURRENT_DATE THEN 1 END)::INTEGER as total_activations_today,
        COALESCE(AVG(
            CASE WHEN a.rolled_back_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (a.rolled_back_at - a.activated_at)) / 60.0
            END
        ), 0)::NUMERIC as avg_activation_duration_minutes
    FROM emergency_kill_switches ks
    FULL OUTER JOIN kill_switch_activations a ON ks.id = a.kill_switch_id
    FULL OUTER JOIN feature_toggles ft ON ft.emergency_disabled = true;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old activation records
CREATE OR REPLACE FUNCTION cleanup_old_emergency_records(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean up old rolled back activations
    DELETE FROM kill_switch_activations 
    WHERE status = 'ROLLED_BACK' 
    AND rolled_back_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old emergency action logs
    DELETE FROM emergency_actions_log 
    WHERE executed_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Log cleanup activity
    INSERT INTO emergency_actions_log (
        id, action_type, executed_by, reason, metadata
    ) VALUES (
        'cleanup_' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'AUTO_ROLLBACK_EXECUTED',
        'SYSTEM',
        'Emergency records cleanup completed',
        json_build_object('deleted_records', deleted_count, 'retention_days', retention_days)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Default Kill Switches Data
-- ==========================================

-- Insert default emergency kill switches
INSERT INTO emergency_kill_switches (
    id, name, description, scope, claude_impact_levels, enabled, created_by
) VALUES 
    (
        'default_all_kill_switch',
        'Emergency All Toggles Kill Switch',
        'Emergency kill switch to disable all feature toggles in critical situations',
        'ALL',
        '[]',
        true,
        'SYSTEM'
    ),
    (
        'default_claude_impact_kill_switch',
        'Emergency Claude Impact Kill Switch', 
        'Emergency kill switch to disable toggles that affect Claude behavior and output quality',
        'CLAUDE_IMPACT',
        '["HALLUCINATION_RISK", "MODEL_VERSION", "OUTPUT_QUALITY"]',
        true,
        'SYSTEM'
    ),
    (
        'default_critical_features_kill_switch',
        'Emergency Critical Features Kill Switch',
        'Emergency kill switch to disable critical system toggles that could impact core functionality',
        'CRITICAL_FEATURES',
        '[]',
        true,
        'SYSTEM'
    )
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Security and Permissions
-- ==========================================

-- Create role for emergency operations access
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'emergency_operator_role') THEN
        CREATE ROLE emergency_operator_role;
    END IF;
END $$;

-- Grant necessary permissions for emergency operations
GRANT SELECT, INSERT, UPDATE ON emergency_kill_switches TO emergency_operator_role;
GRANT SELECT, INSERT, UPDATE ON kill_switch_activations TO emergency_operator_role;
GRANT SELECT, INSERT ON emergency_actions_log TO emergency_operator_role;
GRANT UPDATE ON feature_toggles TO emergency_operator_role;
GRANT SELECT ON active_kill_switches TO emergency_operator_role;
GRANT SELECT ON emergency_status_overview TO emergency_operator_role;
GRANT SELECT ON recent_emergency_activity TO emergency_operator_role;

-- ==========================================
-- Comments for Documentation
-- ==========================================

COMMENT ON TABLE emergency_kill_switches IS 'Configuration for emergency kill switches that can rapidly disable feature toggles';
COMMENT ON TABLE kill_switch_activations IS 'Records of kill switch activations with rollback data and status tracking';
COMMENT ON TABLE emergency_actions_log IS 'Audit log of all emergency actions taken in the system';

COMMENT ON VIEW active_kill_switches IS 'Currently enabled kill switches with their activation counts';
COMMENT ON VIEW emergency_status_overview IS 'High-level overview of emergency system status and metrics';
COMMENT ON VIEW recent_emergency_activity IS 'Recent emergency activities including activations and rollbacks';

COMMENT ON FUNCTION get_emergency_metrics IS 'Returns comprehensive metrics about the emergency kill switch system';
COMMENT ON FUNCTION cleanup_old_emergency_records IS 'Cleans up old emergency records based on retention policy';

-- ==========================================
-- Migration Completion
-- ==========================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Emergency Kill Switch migration completed successfully';
    RAISE NOTICE 'Tables created: emergency_kill_switches, kill_switch_activations, emergency_actions_log';
    RAISE NOTICE 'Views created: active_kill_switches, emergency_status_overview, recent_emergency_activity';
    RAISE NOTICE 'Functions created: get_emergency_metrics, cleanup_old_emergency_records';
    RAISE NOTICE 'Default kill switches inserted: 3 system kill switches created';
END $$;