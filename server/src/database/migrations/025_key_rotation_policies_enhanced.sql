-- Enhanced Key Rotation Policies Database Schema
-- Comprehensive rotation scheduling, approval workflows, and compliance tracking
-- Created: 2025-07-20

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced rotation schedules table
-- Tracks individual rotation executions with approval workflow
CREATE TABLE IF NOT EXISTS rotation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES key_rotation_policies(id) ON DELETE CASCADE,
    key_id VARCHAR(128) NOT NULL,
    
    -- Scheduling details
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER DEFAULT 15, -- minutes
    rotation_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    rotation_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status tracking
    status VARCHAR(32) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',        -- Rotation is scheduled
        'pending_approval', -- Waiting for approval
        'approved',         -- Approved and ready to execute
        'in_progress',      -- Currently executing
        'completed',        -- Successfully completed
        'failed',           -- Failed to complete
        'cancelled'         -- Cancelled before execution
    )),
    priority VARCHAR(16) DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'critical', 'emergency'
    )),
    
    -- Execution tracking
    execution_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    -- Approval workflow
    approval_required BOOLEAN DEFAULT false,
    approved_by VARCHAR(128),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    approval_timeout TIMESTAMP WITH TIME ZONE,
    
    -- Results
    old_key_id VARCHAR(128),
    new_key_id VARCHAR(128),
    rollback_plan JSONB,
    execution_log JSONB, -- Detailed execution log
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    
    CONSTRAINT valid_rotation_window CHECK (rotation_window_end > rotation_window_start),
    CONSTRAINT valid_approval CHECK (
        (approval_required = true AND status = 'pending_approval') OR
        (approval_required = false) OR
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    )
);

-- Rotation notifications table
-- Tracks notifications sent for rotation events
CREATE TABLE IF NOT EXISTS rotation_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES rotation_schedules(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(32) NOT NULL CHECK (notification_type IN (
        'reminder',         -- Reminder before rotation
        'approval_request', -- Request for approval
        'emergency',        -- Emergency rotation notice
        'completion',       -- Rotation completed
        'failure',          -- Rotation failed
        'cancellation',     -- Rotation cancelled
        'escalation'        -- Escalation notice
    )),
    recipient VARCHAR(256) NOT NULL, -- Email or user ID
    recipient_type VARCHAR(16) DEFAULT 'email' CHECK (recipient_type IN (
        'email', 'user', 'role', 'webhook'
    )),
    
    -- Content
    subject VARCHAR(256),
    message TEXT,
    priority VARCHAR(16) DEFAULT 'normal' CHECK (priority IN (
        'low', 'normal', 'high', 'urgent'
    )),
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(128),
    
    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Policy compliance tracking table
-- Tracks compliance with rotation policies
CREATE TABLE IF NOT EXISTS policy_compliance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES key_rotation_policies(id) ON DELETE CASCADE,
    
    -- Compliance period
    compliance_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    compliance_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Compliance metrics
    total_keys_in_scope INTEGER NOT NULL DEFAULT 0,
    keys_rotated_on_time INTEGER DEFAULT 0,
    keys_rotated_late INTEGER DEFAULT 0,
    keys_not_rotated INTEGER DEFAULT 0,
    emergency_rotations INTEGER DEFAULT 0,
    
    -- Compliance score (0-100)
    compliance_score DECIMAL(5,2) DEFAULT 100.00 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Violations
    policy_violations JSONB, -- Array of violation details
    remediation_actions JSONB, -- Actions taken to address violations
    
    -- Audit and reporting
    report_generated_at TIMESTAMP WITH TIME ZONE,
    report_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    
    CONSTRAINT valid_compliance_period CHECK (compliance_period_end > compliance_period_start)
);

-- Rotation execution history table
-- Detailed history of rotation executions for forensic analysis
CREATE TABLE IF NOT EXISTS rotation_execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES rotation_schedules(id) ON DELETE CASCADE,
    
    -- Execution details
    execution_start TIMESTAMP WITH TIME ZONE NOT NULL,
    execution_end TIMESTAMP WITH TIME ZONE,
    execution_duration INTEGER, -- seconds
    executed_by VARCHAR(128),
    execution_method VARCHAR(32) DEFAULT 'automatic' CHECK (execution_method IN (
        'automatic', 'manual', 'emergency', 'rollback'
    )),
    
    -- Steps executed
    execution_steps JSONB NOT NULL, -- Array of execution steps with timestamps
    step_count INTEGER,
    successful_steps INTEGER DEFAULT 0,
    failed_steps INTEGER DEFAULT 0,
    
    -- Security context
    execution_context JSONB, -- Security context during execution
    access_permissions JSONB, -- Permissions validated
    
    -- Performance metrics
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    network_requests INTEGER,
    
    -- Results
    success BOOLEAN NOT NULL,
    error_details JSONB,
    warnings JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Policy evaluation cache table
-- Caches policy evaluation results for performance
CREATE TABLE IF NOT EXISTS policy_evaluation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Cache key components
    policy_id UUID REFERENCES key_rotation_policies(id) ON DELETE CASCADE,
    key_id VARCHAR(128) NOT NULL,
    key_state_hash VARCHAR(128) NOT NULL, -- Hash of key state for cache invalidation
    
    -- Evaluation results
    evaluation_result JSONB NOT NULL,
    trigger_reason VARCHAR(128),
    urgency_level VARCHAR(16),
    recommended_action VARCHAR(32),
    
    -- Cache management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_cache_expiry CHECK (expires_at > created_at)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_rotation_schedules_policy_id ON rotation_schedules(policy_id);
CREATE INDEX IF NOT EXISTS idx_rotation_schedules_key_id ON rotation_schedules(key_id);
CREATE INDEX IF NOT EXISTS idx_rotation_schedules_status ON rotation_schedules(status);
CREATE INDEX IF NOT EXISTS idx_rotation_schedules_scheduled_date ON rotation_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_rotation_schedules_priority ON rotation_schedules(priority);
CREATE INDEX IF NOT EXISTS idx_rotation_schedules_approval ON rotation_schedules(approval_required, status);

CREATE INDEX IF NOT EXISTS idx_rotation_notifications_schedule_id ON rotation_notifications(schedule_id);
CREATE INDEX IF NOT EXISTS idx_rotation_notifications_type ON rotation_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_rotation_notifications_recipient ON rotation_notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_rotation_notifications_sent_at ON rotation_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_rotation_notifications_acknowledged ON rotation_notifications(acknowledged);

CREATE INDEX IF NOT EXISTS idx_policy_compliance_tracking_policy_id ON policy_compliance_tracking(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_compliance_tracking_period ON policy_compliance_tracking(compliance_period_start, compliance_period_end);
CREATE INDEX IF NOT EXISTS idx_policy_compliance_tracking_score ON policy_compliance_tracking(compliance_score);

CREATE INDEX IF NOT EXISTS idx_rotation_execution_history_schedule_id ON rotation_execution_history(schedule_id);
CREATE INDEX IF NOT EXISTS idx_rotation_execution_history_executed_by ON rotation_execution_history(executed_by);
CREATE INDEX IF NOT EXISTS idx_rotation_execution_history_execution_start ON rotation_execution_history(execution_start);
CREATE INDEX IF NOT EXISTS idx_rotation_execution_history_success ON rotation_execution_history(success);

CREATE INDEX IF NOT EXISTS idx_policy_evaluation_cache_policy_key ON policy_evaluation_cache(policy_id, key_id);
CREATE INDEX IF NOT EXISTS idx_policy_evaluation_cache_expires_at ON policy_evaluation_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_policy_evaluation_cache_hash ON policy_evaluation_cache(key_state_hash);

-- Enhanced functions and triggers

-- Function to auto-update rotation schedule status
CREATE OR REPLACE FUNCTION update_rotation_schedule_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the updated_at timestamp
    NEW.updated_at = NOW();
    
    -- Auto-approve if no approval required
    IF NEW.approval_required = false AND NEW.status = 'pending_approval' THEN
        NEW.status = 'scheduled';
    END IF;
    
    -- Set approval timeout for pending approvals
    IF NEW.status = 'pending_approval' AND NEW.approval_timeout IS NULL THEN
        NEW.approval_timeout = NOW() + INTERVAL '24 hours';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rotation schedule updates
CREATE TRIGGER trigger_update_rotation_schedule_status
    BEFORE UPDATE ON rotation_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_rotation_schedule_status();

-- Function to calculate compliance scores
CREATE OR REPLACE FUNCTION calculate_compliance_score(
    p_policy_id UUID,
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_rotations INTEGER;
    on_time_rotations INTEGER;
    compliance_score DECIMAL(5,2);
BEGIN
    -- Count total scheduled rotations in period
    SELECT COUNT(*) INTO total_rotations
    FROM rotation_schedules
    WHERE policy_id = p_policy_id
      AND scheduled_date BETWEEN p_period_start AND p_period_end;
    
    -- Count on-time completions
    SELECT COUNT(*) INTO on_time_rotations
    FROM rotation_schedules
    WHERE policy_id = p_policy_id
      AND scheduled_date BETWEEN p_period_start AND p_period_end
      AND status = 'completed'
      AND completed_at <= rotation_window_end;
    
    -- Calculate score
    IF total_rotations = 0 THEN
        compliance_score = 100.00;
    ELSE
        compliance_score = (on_time_rotations::DECIMAL / total_rotations) * 100;
    END IF;
    
    RETURN compliance_score;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_policy_evaluation_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM policy_evaluation_cache 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get rotation readiness
CREATE OR REPLACE FUNCTION get_rotation_readiness()
RETURNS TABLE(
    schedule_id UUID,
    key_id VARCHAR(128),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32),
    ready_to_execute BOOLEAN,
    blocking_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.key_id,
        rs.scheduled_date,
        rs.status,
        CASE 
            WHEN rs.status IN ('scheduled', 'approved') 
                 AND NOW() >= rs.rotation_window_start
                 AND NOW() <= rs.rotation_window_end
            THEN true
            ELSE false
        END as ready_to_execute,
        CASE 
            WHEN rs.status = 'pending_approval' THEN 'Waiting for approval'
            WHEN NOW() < rs.rotation_window_start THEN 'Outside rotation window - too early'
            WHEN NOW() > rs.rotation_window_end THEN 'Outside rotation window - too late'
            WHEN rs.status NOT IN ('scheduled', 'approved') THEN 'Invalid status: ' || rs.status
            ELSE 'Ready for execution'
        END as blocking_reason
    FROM rotation_schedules rs
    WHERE rs.status IN ('scheduled', 'pending_approval', 'approved')
      AND rs.scheduled_date <= NOW() + INTERVAL '1 hour'
    ORDER BY rs.scheduled_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-escalate overdue approvals
CREATE OR REPLACE FUNCTION escalate_overdue_approvals()
RETURNS void AS $$
DECLARE
    overdue_record RECORD;
BEGIN
    -- Find overdue approvals
    FOR overdue_record IN
        SELECT id, policy_id, key_id, scheduled_date, approval_timeout
        FROM rotation_schedules
        WHERE status = 'pending_approval'
          AND approval_timeout < NOW()
    LOOP
        -- Insert escalation notification
        INSERT INTO rotation_notifications (
            schedule_id, notification_type, recipient, recipient_type,
            subject, message, priority
        ) VALUES (
            overdue_record.id,
            'escalation',
            'security-team@company.com',
            'email',
            'URGENT: Rotation Approval Overdue',
            'Rotation approval for key ' || overdue_record.key_id || ' is overdue. Please review immediately.',
            'urgent'
        );
        
        -- Update approval timeout to prevent repeated escalations
        UPDATE rotation_schedules 
        SET approval_timeout = NOW() + INTERVAL '4 hours'
        WHERE id = overdue_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enhanced key rotation policies columns (if not exists)
DO $$ 
BEGIN
    -- Add new columns to existing key_rotation_policies table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'key_pattern') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN key_pattern VARCHAR(256);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'inactivity_days') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN inactivity_days INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'rotation_schedule') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN rotation_schedule VARCHAR(64); -- Cron expression
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'allowed_rotation_hours') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN allowed_rotation_hours JSONB; -- Array of allowed hours
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'blackout_dates') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN blackout_dates JSONB; -- Array of blackout dates
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'emergency_bypass') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN emergency_bypass BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'compliance_framework') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN compliance_framework JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'retention_days') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN retention_days INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'key_rotation_policies' AND column_name = 'priority') THEN
        ALTER TABLE key_rotation_policies ADD COLUMN priority INTEGER DEFAULT 100;
    END IF;
END $$;

-- Initial data setup

-- Create enhanced default rotation policies
INSERT INTO key_rotation_policies (
    policy_name, key_purpose, rotation_interval_days, auto_rotation_enabled, 
    notification_days_before, overlap_period_hours, requires_approval, 
    approval_roles, priority, created_by
) VALUES 
    ('high_security_tokens', 'token_signing', 7, true, 2, 2, true, '["security_admin", "key_manager"]', 200, 'system'),
    ('critical_data_encryption', 'data_encryption', 30, true, 7, 24, true, '["security_admin"]', 300, 'system'),
    ('session_keys_auto', 'session_encryption', 1, true, 0, 1, false, '[]', 100, 'system'),
    ('compliance_audit_keys', 'audit_signing', 90, true, 14, 48, true, '["compliance_officer", "security_admin"]', 400, 'system')
ON CONFLICT (policy_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE rotation_schedules IS 'Individual rotation executions with approval workflow and detailed tracking';
COMMENT ON TABLE rotation_notifications IS 'Notification tracking for rotation events with delivery confirmation';
COMMENT ON TABLE policy_compliance_tracking IS 'Compliance monitoring and reporting for rotation policies';
COMMENT ON TABLE rotation_execution_history IS 'Detailed forensic history of rotation executions';
COMMENT ON TABLE policy_evaluation_cache IS 'Performance cache for policy evaluation results';

COMMENT ON COLUMN rotation_schedules.rotation_window_start IS 'Start of allowed execution window';
COMMENT ON COLUMN rotation_schedules.execution_log IS 'Detailed step-by-step execution log in JSON format';
COMMENT ON COLUMN rotation_notifications.recipient_type IS 'Type of recipient for notification routing';
COMMENT ON COLUMN policy_compliance_tracking.compliance_score IS 'Percentage compliance score for reporting';

COMMENT ON FUNCTION calculate_compliance_score(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 'Calculates compliance score for a policy over a time period';
COMMENT ON FUNCTION get_rotation_readiness() IS 'Returns rotations ready for execution with blocking reasons';
COMMENT ON FUNCTION escalate_overdue_approvals() IS 'Automatically escalates overdue rotation approvals';