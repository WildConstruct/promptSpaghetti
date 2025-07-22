-- Epic 17: Temporary Permissions System
-- Migration: 040_temporary_permissions_system
-- DEPLOYMENT BLOCKER FIX: Creates tables for time-limited permission grants

-- Temporary role assignments with expiration
CREATE TABLE IF NOT EXISTS temporary_role_assignments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason TEXT,
    scope_context JSONB,
    auto_revoke BOOLEAN NOT NULL DEFAULT true,
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_revocation CHECK (
        (status = 'revoked' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND revoke_reason IS NOT NULL)
        OR status != 'revoked'
    ),
    CONSTRAINT valid_expiration CHECK (expires_at > granted_at)
);

-- Direct permission grants (bypass roles)
CREATE TABLE IF NOT EXISTS direct_permission_grants (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('global', 'organization', 'team', 'own')),
    conditions JSONB,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason TEXT,
    scope_context JSONB,
    auto_revoke BOOLEAN NOT NULL DEFAULT true,
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_revocation CHECK (
        (status = 'revoked' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND revoke_reason IS NOT NULL)
        OR status != 'revoked'
    ),
    CONSTRAINT valid_expiration CHECK (expires_at > granted_at)
);

-- Emergency access grants for critical situations
CREATE TABLE IF NOT EXISTS emergency_access_grants (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    permissions JSONB NOT NULL, -- Array of "resource:action" strings
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    severity VARCHAR(20) NOT NULL DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    incident_id VARCHAR(100),
    review_required BOOLEAN NOT NULL DEFAULT true,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_expiration CHECK (expires_at > granted_at),
    CONSTRAINT valid_review CHECK (
        (review_required = false)
        OR (review_required = true AND (reviewed_by IS NULL OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)))
    )
);

-- Permission escalations for privilege elevation tracking
CREATE TABLE IF NOT EXISTS permission_escalations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    to_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    escalated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'downgraded')),
    original_expires_at TIMESTAMP WITH TIME ZONE,
    auto_downgrade BOOLEAN NOT NULL DEFAULT true,
    notifications_sent JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_expiration CHECK (expires_at > escalated_at)
);

-- Temporary permission requests for approval workflows
CREATE TABLE IF NOT EXISTS temporary_permission_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    direct_permissions JSONB, -- Array of permission objects
    reason TEXT NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 8760), -- Max 1 year
    emergency_access BOOLEAN NOT NULL DEFAULT false,
    approval_required BOOLEAN NOT NULL DEFAULT true,
    scope_context JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'withdrawn')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    granted_assignment_id UUID, -- Reference to actual grant
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'), -- Request expires in 7 days
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_approval CHECK (
        (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL)
        OR status != 'approved'
    ),
    CONSTRAINT valid_rejection CHECK (
        (status = 'rejected' AND rejection_reason IS NOT NULL)
        OR status != 'rejected'
    ),
    CONSTRAINT has_permissions CHECK (
        (role_id IS NOT NULL AND direct_permissions IS NULL)
        OR (role_id IS NULL AND direct_permissions IS NOT NULL)
        OR (role_id IS NOT NULL AND direct_permissions IS NOT NULL)
    )
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_temp_role_assignments_user_active ON temporary_role_assignments(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_temp_role_assignments_expires ON temporary_role_assignments(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_temp_role_assignments_granted_by ON temporary_role_assignments(granted_by);

CREATE INDEX IF NOT EXISTS idx_direct_grants_user_active ON direct_permission_grants(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_direct_grants_expires ON direct_permission_grants(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_direct_grants_resource_action ON direct_permission_grants(resource, action);
CREATE INDEX IF NOT EXISTS idx_direct_grants_granted_by ON direct_permission_grants(granted_by);

CREATE INDEX IF NOT EXISTS idx_emergency_access_user_active ON emergency_access_grants(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_emergency_access_expires ON emergency_access_grants(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_emergency_access_severity ON emergency_access_grants(severity);
CREATE INDEX IF NOT EXISTS idx_emergency_access_granted_by ON emergency_access_grants(granted_by);
CREATE INDEX IF NOT EXISTS idx_emergency_access_review ON emergency_access_grants(review_required, reviewed_at);

CREATE INDEX IF NOT EXISTS idx_permission_escalations_user_active ON permission_escalations(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_permission_escalations_expires ON permission_escalations(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_permission_escalations_escalated_by ON permission_escalations(escalated_by);

CREATE INDEX IF NOT EXISTS idx_temp_perm_requests_user ON temporary_permission_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_temp_perm_requests_status ON temporary_permission_requests(status);
CREATE INDEX IF NOT EXISTS idx_temp_perm_requests_requested_by ON temporary_permission_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_temp_perm_requests_pending ON temporary_permission_requests(status, requested_at) WHERE status = 'pending';

-- Trigger for automatic expiration
CREATE OR REPLACE FUNCTION update_temp_permission_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-expire records that have passed their expiration time
    IF NEW.expires_at <= NOW() AND NEW.status = 'active' THEN
        NEW.status = 'expired';
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all temporary permission tables
CREATE TRIGGER trigger_temp_role_assignments_expiration
    BEFORE UPDATE ON temporary_role_assignments
    FOR EACH ROW
    WHEN (NEW.status = 'active' AND NEW.expires_at <= NOW())
    EXECUTE FUNCTION update_temp_permission_status();

CREATE TRIGGER trigger_direct_grants_expiration
    BEFORE UPDATE ON direct_permission_grants
    FOR EACH ROW
    WHEN (NEW.status = 'active' AND NEW.expires_at <= NOW())
    EXECUTE FUNCTION update_temp_permission_status();

CREATE TRIGGER trigger_emergency_access_expiration
    BEFORE UPDATE ON emergency_access_grants
    FOR EACH ROW
    WHEN (NEW.status = 'active' AND NEW.expires_at <= NOW())
    EXECUTE FUNCTION update_temp_permission_status();

CREATE TRIGGER trigger_permission_escalations_expiration
    BEFORE UPDATE ON permission_escalations
    FOR EACH ROW
    WHEN (NEW.status = 'active' AND NEW.expires_at <= NOW())
    EXECUTE FUNCTION update_temp_permission_status();

-- Comments for documentation
COMMENT ON TABLE temporary_role_assignments IS 'Time-limited role assignments with automatic expiration';
COMMENT ON TABLE direct_permission_grants IS 'Direct permission grants that bypass role assignments';
COMMENT ON TABLE emergency_access_grants IS 'Emergency access grants for critical situations';
COMMENT ON TABLE permission_escalations IS 'Privilege escalation tracking for elevated permissions';
COMMENT ON TABLE temporary_permission_requests IS 'Approval workflow for temporary permission requests';

COMMENT ON COLUMN temporary_role_assignments.auto_revoke IS 'Whether to automatically revoke when expired';
COMMENT ON COLUMN temporary_role_assignments.notification_sent IS 'Whether expiration notification has been sent';
COMMENT ON COLUMN direct_permission_grants.scope_context IS 'Additional context for permission scope evaluation';
COMMENT ON COLUMN emergency_access_grants.severity IS 'Severity level of emergency access (affects monitoring)';
COMMENT ON COLUMN emergency_access_grants.review_required IS 'Whether post-access review is required';
COMMENT ON COLUMN permission_escalations.auto_downgrade IS 'Whether to automatically downgrade when expired';
COMMENT ON COLUMN permission_escalations.notifications_sent IS 'Array of notification types that have been sent';