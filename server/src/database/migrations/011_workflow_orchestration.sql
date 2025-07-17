-- Epic 9.4 - Workflow Orchestration System Migration
-- Comprehensive workflow state management for projects and resources

-- Create workflow_states table to define available states
CREATE TABLE IF NOT EXISTS workflow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
    icon VARCHAR(50), -- Icon identifier
    is_initial BOOLEAN DEFAULT FALSE,
    is_final BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE, -- Locked states prevent editing
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT state_name_not_empty CHECK (length(trim(name)) > 0),
    UNIQUE(workspace_id, name)
);

-- Create workflow_transitions table to define allowed state transitions
CREATE TABLE IF NOT EXISTS workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    from_state_id UUID REFERENCES workflow_states(id) ON DELETE CASCADE,
    to_state_id UUID NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    required_permissions BIGINT DEFAULT 0, -- Bitmask for required permissions
    conditions JSONB DEFAULT '{}', -- Custom conditions for transition
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT transition_name_not_empty CHECK (length(trim(name)) > 0),
    UNIQUE(workspace_id, from_state_id, to_state_id)
);

-- Create workflow_approvals table for approval processes
CREATE TABLE IF NOT EXISTS workflow_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    transition_id UUID NOT NULL REFERENCES workflow_transitions(id) ON DELETE CASCADE,
    requester_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Approval metadata
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    approval_comment TEXT,
    
    -- Auto-approval settings
    auto_approve_after INTERVAL,
    auto_approve_conditions JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_approval_reviewers table for multi-reviewer approvals
CREATE TABLE IF NOT EXISTS workflow_approval_reviewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_id UUID NOT NULL REFERENCES workflow_approvals(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(approval_id, reviewer_id)
);

-- Create workflow_locks table for resource locking
CREATE TABLE IF NOT EXISTS workflow_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    locked_by VARCHAR(255) NOT NULL,
    lock_type VARCHAR(50) DEFAULT 'edit' CHECK (lock_type IN ('edit', 'state_change', 'delete', 'custom')),
    lock_reason TEXT,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_release BOOLEAN DEFAULT TRUE,
    
    -- Lock metadata
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    UNIQUE(resource_id, lock_type)
);

-- Create workflow_history table for audit trail
CREATE TABLE IF NOT EXISTS workflow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'state_change', 'approval_requested', 'approved', 'rejected', 'locked', 'unlocked'
    previous_state_id UUID REFERENCES workflow_states(id) ON DELETE SET NULL,
    new_state_id UUID REFERENCES workflow_states(id) ON DELETE SET NULL,
    actor_id VARCHAR(255) NOT NULL,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Action context
    approval_id UUID REFERENCES workflow_approvals(id) ON DELETE SET NULL,
    transition_id UUID REFERENCES workflow_transitions(id) ON DELETE SET NULL,
    comment TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Compliance fields
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- Create workflow_schedules table for scheduled executions
CREATE TABLE IF NOT EXISTS workflow_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('cron', 'interval', 'once')),
    schedule_expression TEXT NOT NULL, -- Cron expression or interval
    
    -- Execution settings
    action_type VARCHAR(100) NOT NULL, -- 'state_transition', 'approval_request', 'custom'
    action_config JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Scheduling metadata
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    max_runs INTEGER, -- NULL for unlimited
    
    -- Failure handling
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    retry_delay INTERVAL DEFAULT INTERVAL '5 minutes',
    
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT schedule_name_not_empty CHECK (length(trim(schedule_name)) > 0)
);

-- Create workflow_execution_logs table for scheduled execution tracking
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES workflow_schedules(id) ON DELETE CASCADE,
    execution_id UUID DEFAULT uuid_generate_v4(),
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution results
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    execution_time_ms INTEGER,
    
    -- Retry information
    retry_attempt INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Add workflow_state_id to existing tables
ALTER TABLE projects ADD COLUMN workflow_state_id UUID REFERENCES workflow_states(id);
ALTER TABLE resources ADD COLUMN workflow_state_id UUID REFERENCES workflow_states(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_states_workspace ON workflow_states(workspace_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_from_state ON workflow_transitions(from_state_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_to_state ON workflow_transitions(to_state_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON workflow_approvals(status, requested_at);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_resource ON workflow_approvals(resource_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_requester ON workflow_approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_workflow_locks_resource ON workflow_locks(resource_id);
CREATE INDEX IF NOT EXISTS idx_workflow_locks_locked_by ON workflow_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_workflow_locks_expires ON workflow_locks(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_history_resource ON workflow_history(resource_id, action_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_history_actor ON workflow_history(actor_id, action_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_schedule ON workflow_execution_logs(schedule_id, started_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_conditions_gin ON workflow_transitions USING GIN (conditions);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_conditions_gin ON workflow_approvals USING GIN (auto_approve_conditions);
CREATE INDEX IF NOT EXISTS idx_workflow_locks_metadata_gin ON workflow_locks USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_workflow_history_metadata_gin ON workflow_history USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_action_config_gin ON workflow_schedules USING GIN (action_config);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_result_gin ON workflow_execution_logs USING GIN (result_data);

-- Insert default workflow states for existing workspaces
INSERT INTO workflow_states (workspace_id, name, description, color, icon, is_initial, is_final, sort_order)
SELECT 
    w.id as workspace_id,
    state_name,
    state_description,
    state_color,
    state_icon,
    is_initial,
    is_final,
    sort_order
FROM workspaces w
CROSS JOIN (
    VALUES 
        ('Draft', 'Initial state for new resources', '#6B7280', 'DocumentTextIcon', true, false, 1),
        ('In Review', 'Resource is being reviewed', '#F59E0B', 'EyeIcon', false, false, 2),
        ('Approved', 'Resource has been approved', '#10B981', 'CheckCircleIcon', false, false, 3),
        ('Published', 'Resource is published and active', '#3B82F6', 'GlobeAltIcon', false, false, 4),
        ('Archived', 'Resource is archived', '#8B5CF6', 'ArchiveBoxIcon', false, true, 5)
) AS states(state_name, state_description, state_color, state_icon, is_initial, is_final, sort_order);

-- Insert default workflow transitions for existing workspaces
INSERT INTO workflow_transitions (workspace_id, from_state_id, to_state_id, name, description, requires_approval)
SELECT 
    w.id as workspace_id,
    draft.id as from_state_id,
    review.id as to_state_id,
    'Submit for Review',
    'Submit resource for review and approval',
    false
FROM workspaces w
JOIN workflow_states draft ON w.id = draft.workspace_id AND draft.name = 'Draft'
JOIN workflow_states review ON w.id = review.workspace_id AND review.name = 'In Review'

UNION ALL

SELECT 
    w.id as workspace_id,
    review.id as from_state_id,
    approved.id as to_state_id,
    'Approve',
    'Approve resource for publication',
    true
FROM workspaces w
JOIN workflow_states review ON w.id = review.workspace_id AND review.name = 'In Review'
JOIN workflow_states approved ON w.id = approved.workspace_id AND approved.name = 'Approved'

UNION ALL

SELECT 
    w.id as workspace_id,
    approved.id as from_state_id,
    published.id as to_state_id,
    'Publish',
    'Publish approved resource',
    false
FROM workspaces w
JOIN workflow_states approved ON w.id = approved.workspace_id AND approved.name = 'Approved'
JOIN workflow_states published ON w.id = published.workspace_id AND published.name = 'Published'

UNION ALL

SELECT 
    w.id as workspace_id,
    published.id as from_state_id,
    archived.id as to_state_id,
    'Archive',
    'Archive published resource',
    false
FROM workspaces w
JOIN workflow_states published ON w.id = published.workspace_id AND published.name = 'Published'
JOIN workflow_states archived ON w.id = archived.workspace_id AND archived.name = 'Archived'

UNION ALL

SELECT 
    w.id as workspace_id,
    review.id as from_state_id,
    draft.id as to_state_id,
    'Reject',
    'Reject resource and return to draft',
    false
FROM workspaces w
JOIN workflow_states review ON w.id = review.workspace_id AND review.name = 'In Review'
JOIN workflow_states draft ON w.id = draft.workspace_id AND draft.name = 'Draft';

-- Update existing projects and resources to use draft state
UPDATE projects 
SET workflow_state_id = (
    SELECT ws.id 
    FROM workflow_states ws 
    WHERE ws.workspace_id = projects.workspace_id 
    AND ws.name = 'Draft'
    LIMIT 1
)
WHERE workflow_state_id IS NULL;

UPDATE resources 
SET workflow_state_id = (
    SELECT ws.id 
    FROM workflow_states ws 
    JOIN projects p ON ws.workspace_id = p.workspace_id
    WHERE p.id = resources.project_id 
    AND ws.name = 'Draft'
    LIMIT 1
)
WHERE workflow_state_id IS NULL;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for workflow tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workflow_states_updated_at') THEN
        CREATE TRIGGER update_workflow_states_updated_at BEFORE UPDATE ON workflow_states
            FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workflow_approvals_updated_at') THEN
        CREATE TRIGGER update_workflow_approvals_updated_at BEFORE UPDATE ON workflow_approvals
            FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workflow_schedules_updated_at') THEN
        CREATE TRIGGER update_workflow_schedules_updated_at BEFORE UPDATE ON workflow_schedules
            FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();
    END IF;
END $$;

-- Create function to automatically release expired locks
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS INTEGER AS $$
DECLARE
    released_count INTEGER;
BEGIN
    DELETE FROM workflow_locks 
    WHERE expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP 
    AND auto_release = TRUE;
    
    GET DIAGNOSTICS released_count = ROW_COUNT;
    RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update next_run_at for schedules
CREATE OR REPLACE FUNCTION update_schedule_next_run(schedule_uuid UUID)
RETURNS VOID AS $$
DECLARE
    schedule_rec RECORD;
    next_run TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT * INTO schedule_rec FROM workflow_schedules WHERE id = schedule_uuid;
    
    IF schedule_rec.schedule_type = 'once' THEN
        UPDATE workflow_schedules 
        SET enabled = FALSE, next_run_at = NULL 
        WHERE id = schedule_uuid;
    ELSIF schedule_rec.schedule_type = 'interval' THEN
        next_run := CURRENT_TIMESTAMP + schedule_rec.schedule_expression::INTERVAL;
        UPDATE workflow_schedules 
        SET next_run_at = next_run, run_count = run_count + 1 
        WHERE id = schedule_uuid;
    END IF;
    -- TODO: Add cron expression parsing for cron type schedules
END;
$$ LANGUAGE plpgsql;