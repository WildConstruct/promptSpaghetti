-- Migration: Session Rotation System
-- Adds support for session rotation on privilege changes

-- Session rotation history table
CREATE TABLE IF NOT EXISTS session_rotation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    performed_by UUID REFERENCES users(id),
    rotated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_rotation_history_user (user_id),
    INDEX idx_rotation_history_date (rotated_at),
    INDEX idx_rotation_history_type (change_type)
);

-- Session grace windows for smooth transitions
CREATE TABLE IF NOT EXISTS session_grace_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_grace_windows_session (session_id),
    INDEX idx_grace_windows_expires (expires_at)
);

-- Add rotation tracking to user_sessions
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS rotation_reason VARCHAR(100);
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS rotated_from UUID REFERENCES user_sessions(id);

-- Session rotation policies per organization
CREATE TABLE IF NOT EXISTS session_rotation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rotate_on_role_change BOOLEAN NOT NULL DEFAULT true,
    rotate_on_permission_change BOOLEAN NOT NULL DEFAULT true,
    rotate_on_organization_change BOOLEAN NOT NULL DEFAULT true,
    rotate_on_status_change BOOLEAN NOT NULL DEFAULT true,
    preserve_current_session BOOLEAN NOT NULL DEFAULT false,
    notify_user BOOLEAN NOT NULL DEFAULT true,
    grace_window_minutes INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(organization_id)
);

-- Function to trigger session rotation on role changes
CREATE OR REPLACE FUNCTION trigger_session_rotation_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a pending rotation event
    INSERT INTO session_rotation_queue (
        user_id,
        change_type,
        old_value,
        new_value,
        triggered_by,
        triggered_at
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'role_added'
            WHEN TG_OP = 'DELETE' THEN 'role_removed'
            ELSE 'role_changed'
        END,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD.role_id) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW.role_id) ELSE NULL END,
        current_setting('app.current_user_id', true)::UUID,
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Queue for async session rotation processing
CREATE TABLE IF NOT EXISTS session_rotation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    triggered_by UUID REFERENCES users(id),
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    
    -- Indexes
    INDEX idx_rotation_queue_status (status),
    INDEX idx_rotation_queue_user (user_id),
    INDEX idx_rotation_queue_triggered (triggered_at)
);

-- Triggers for automatic session rotation
CREATE TRIGGER rotate_sessions_on_user_role_change
    AFTER INSERT OR DELETE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_session_rotation_on_role_change();

-- Analytics view for session rotation metrics
CREATE OR REPLACE VIEW session_rotation_analytics AS
SELECT 
    DATE_TRUNC('day', rotated_at) as rotation_date,
    change_type,
    COUNT(*) as rotation_count,
    COUNT(DISTINCT user_id) as unique_users
FROM session_rotation_history
WHERE rotated_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', rotated_at), change_type
ORDER BY rotation_date DESC, change_type;

-- Add comments for documentation
COMMENT ON TABLE session_rotation_history IS 'Audit log of all session rotations due to privilege changes';
COMMENT ON TABLE session_grace_windows IS 'Grace periods for sessions being rotated to allow smooth transitions';
COMMENT ON TABLE session_rotation_policies IS 'Organization-specific policies for session rotation behavior';
COMMENT ON TABLE session_rotation_queue IS 'Queue for asynchronous processing of session rotation events';

-- Grant permissions
GRANT SELECT ON session_rotation_analytics TO analytics_role;
GRANT SELECT, INSERT ON session_rotation_history TO app_role;
GRANT SELECT, INSERT, DELETE ON session_grace_windows TO app_role;
GRANT SELECT ON session_rotation_policies TO app_role;