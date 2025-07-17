-- Epic 9.4.3 - Enhanced Locking System Migration
-- Create additional tables for advanced locking features

-- Lock policies table for workspace-level locking configuration
CREATE TABLE IF NOT EXISTS lock_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Lock rules
    max_locks_per_user INTEGER DEFAULT 10,
    max_locks_per_resource INTEGER DEFAULT 5,
    default_duration_minutes INTEGER DEFAULT 60,
    max_duration_minutes INTEGER DEFAULT 1440, -- 24 hours
    
    -- Auto-lock settings
    auto_lock_on_edit BOOLEAN DEFAULT FALSE,
    auto_lock_on_state_change BOOLEAN DEFAULT FALSE,
    auto_lock_duration_minutes INTEGER DEFAULT 30,
    
    -- Lock breaking rules
    allow_lock_breaking BOOLEAN DEFAULT TRUE,
    lock_breaking_roles JSONB DEFAULT '[]'::jsonb,
    require_justification BOOLEAN DEFAULT TRUE,
    
    -- Conflict resolution
    conflict_resolution_strategy VARCHAR(50) DEFAULT 'reject' CHECK (
        conflict_resolution_strategy IN ('queue', 'reject', 'notify', 'escalate')
    ),
    escalation_timeout_minutes INTEGER DEFAULT 60,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lock conflicts table for tracking lock conflicts
CREATE TABLE IF NOT EXISTS lock_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    requesting_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocking_lock_id UUID NOT NULL REFERENCES workflow_locks(id) ON DELETE CASCADE,
    
    conflict_type VARCHAR(50) NOT NULL CHECK (
        conflict_type IN ('same_type', 'incompatible', 'exclusive')
    ),
    resolution_strategy VARCHAR(50) NOT NULL CHECK (
        resolution_strategy IN ('queue', 'reject', 'notify', 'escalate')
    ),
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN ('pending', 'resolved', 'rejected')
    ),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_action TEXT
);

-- Lock queue table for queuing conflicted lock requests
CREATE TABLE IF NOT EXISTS lock_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lock_type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 5,
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_wait_time INTEGER, -- in minutes
    notification_sent BOOLEAN DEFAULT FALSE
);

-- Lock notifications table for lock-related notifications
CREATE TABLE IF NOT EXISTS lock_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lock_id UUID REFERENCES workflow_locks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50) NOT NULL CHECK (
        notification_type IN ('acquired', 'released', 'broken', 'conflict', 'queue_position', 'expiring')
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Lock actions table for audit trail
CREATE TABLE IF NOT EXISTS lock_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lock_id UUID NOT NULL REFERENCES workflow_locks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (
        action_type IN ('acquired', 'released', 'broken', 'extended', 'expired')
    ),
    reason TEXT,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lock_policies_workspace ON lock_policies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lock_conflicts_resource ON lock_conflicts(resource_id);
CREATE INDEX IF NOT EXISTS idx_lock_conflicts_requesting_user ON lock_conflicts(requesting_user_id);
CREATE INDEX IF NOT EXISTS idx_lock_conflicts_blocking_lock ON lock_conflicts(blocking_lock_id);
CREATE INDEX IF NOT EXISTS idx_lock_conflicts_status ON lock_conflicts(status);

CREATE INDEX IF NOT EXISTS idx_lock_queue_resource ON lock_queue(resource_id);
CREATE INDEX IF NOT EXISTS idx_lock_queue_user ON lock_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_lock_queue_priority_queued ON lock_queue(priority, queued_at);

CREATE INDEX IF NOT EXISTS idx_lock_notifications_user ON lock_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_lock_notifications_lock ON lock_notifications(lock_id);
CREATE INDEX IF NOT EXISTS idx_lock_notifications_resource ON lock_notifications(resource_id);
CREATE INDEX IF NOT EXISTS idx_lock_notifications_type ON lock_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_lock_notifications_read ON lock_notifications(read_at);

CREATE INDEX IF NOT EXISTS idx_lock_actions_lock ON lock_actions(lock_id);
CREATE INDEX IF NOT EXISTS idx_lock_actions_user ON lock_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_lock_actions_type ON lock_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_lock_actions_performed ON lock_actions(performed_at);

-- Add workspace_id to lock_actions for easier querying
ALTER TABLE lock_actions ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Create function to automatically set workspace_id in lock_actions
CREATE OR REPLACE FUNCTION set_lock_action_workspace_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.workspace_id = (
        SELECT workspace_id 
        FROM workflow_locks 
        WHERE id = NEW.lock_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set workspace_id
DROP TRIGGER IF EXISTS trigger_set_lock_action_workspace_id ON lock_actions;
CREATE TRIGGER trigger_set_lock_action_workspace_id
    BEFORE INSERT ON lock_actions
    FOR EACH ROW
    EXECUTE FUNCTION set_lock_action_workspace_id();

-- Create function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Delete expired locks
    DELETE FROM workflow_locks 
    WHERE expires_at < NOW() AND auto_release = true;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Clean up orphaned lock queue entries
    DELETE FROM lock_queue 
    WHERE resource_id NOT IN (
        SELECT DISTINCT resource_id 
        FROM workflow_locks 
        WHERE expires_at IS NULL OR expires_at > NOW()
    );
    
    -- Clean up old resolved conflicts (older than 30 days)
    DELETE FROM lock_conflicts 
    WHERE status = 'resolved' AND resolved_at < NOW() - INTERVAL '30 days';
    
    -- Clean up old notifications (older than 90 days)
    DELETE FROM lock_notifications 
    WHERE sent_at < NOW() - INTERVAL '90 days';
    
    -- Clean up old lock actions (older than 180 days)
    DELETE FROM lock_actions 
    WHERE performed_at < NOW() - INTERVAL '180 days';
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create default lock policy for each workspace
INSERT INTO lock_policies (workspace_id, name, description)
SELECT 
    id,
    'Default Lock Policy',
    'Default locking configuration for workspace'
FROM workspaces 
WHERE id NOT IN (SELECT workspace_id FROM lock_policies);

-- Add comments for documentation
COMMENT ON TABLE lock_policies IS 'Workspace-level locking configuration and rules';
COMMENT ON TABLE lock_conflicts IS 'Tracks conflicts between lock requests';
COMMENT ON TABLE lock_queue IS 'Queue for contested lock requests';
COMMENT ON TABLE lock_notifications IS 'Lock-related notifications for users';
COMMENT ON TABLE lock_actions IS 'Audit trail for all lock actions';

COMMENT ON COLUMN lock_policies.conflict_resolution_strategy IS 'How to handle lock conflicts: queue, reject, notify, or escalate';
COMMENT ON COLUMN lock_policies.lock_breaking_roles IS 'JSON array of roles that can break locks';
COMMENT ON COLUMN lock_conflicts.conflict_type IS 'Type of conflict: same_type, incompatible, or exclusive';
COMMENT ON COLUMN lock_queue.priority IS 'Queue priority (1=highest, 5=lowest)';
COMMENT ON COLUMN lock_notifications.notification_type IS 'Type of notification: acquired, released, broken, conflict, queue_position, or expiring';