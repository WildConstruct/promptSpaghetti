-- Access Control System Database Schema
-- Comprehensive RBAC and policy-based access control for encryption keys
-- Created: 2025-07-20

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Access control roles table
-- Defines roles that can be assigned to users
CREATE TABLE IF NOT EXISTS access_control_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    
    -- Role permissions (stored as JSON array)
    permissions JSONB NOT NULL DEFAULT '[]',
    parent_roles JSONB DEFAULT '[]', -- Array of parent role IDs for inheritance
    
    -- Role metadata
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    
    CONSTRAINT valid_role_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_permissions CHECK (jsonb_typeof(permissions) = 'array'),
    CONSTRAINT valid_parent_roles CHECK (jsonb_typeof(parent_roles) = 'array')
);

-- User role assignments table
-- Maps users to roles with optional conditions and expiration
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES access_control_roles(id) ON DELETE CASCADE,
    
    -- Assignment metadata
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Optional conditions for role activation
    conditions JSONB DEFAULT '[]',
    
    -- Audit trail
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, role_id),
    CONSTRAINT valid_assignment_period CHECK (
        expires_at IS NULL OR expires_at > assigned_at
    ),
    CONSTRAINT valid_conditions CHECK (jsonb_typeof(conditions) = 'array')
);

-- Access control policies table
-- Defines policy rules for conditional access
CREATE TABLE IF NOT EXISTS access_control_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    
    -- Policy rules (stored as JSON array)
    rules JSONB NOT NULL DEFAULT '[]',
    
    -- Policy metadata
    priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
    is_enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    
    CONSTRAINT valid_policy_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_rules CHECK (jsonb_typeof(rules) = 'array'),
    CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 1000)
);

-- Access requests table
-- Stores requests for temporary access to keys
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request details
    user_id UUID NOT NULL,
    key_id VARCHAR(128) NOT NULL,
    operation VARCHAR(32) NOT NULL CHECK (operation IN (
        'read_metadata', 'access_key_material', 'encrypt', 'decrypt',
        'sign', 'verify', 'derive', 'rotate', 'export', 'import',
        'backup', 'restore', 'destroy', 'modify_acl', 'view_audit_log',
        'approve_access', 'delegate_access'
    )),
    
    -- Justification and context
    justification TEXT NOT NULL,
    requested_duration INTEGER, -- Hours
    urgency VARCHAR(16) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    
    -- Request lifecycle
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'denied', 'expired', 'revoked'
    )),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Review details
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    review_comments TEXT,
    approval_workflow_id VARCHAR(128),
    
    -- Additional metadata
    request_context JSONB,
    risk_assessment JSONB,
    
    FOREIGN KEY (key_id) REFERENCES master_keys(key_id) ON DELETE CASCADE,
    CONSTRAINT valid_request_period CHECK (
        expires_at IS NULL OR expires_at > requested_at
    ),
    CONSTRAINT valid_review_state CHECK (
        (status = 'pending' AND reviewed_at IS NULL) OR
        (status != 'pending' AND reviewed_at IS NOT NULL)
    )
);

-- Temporary access grants table
-- Stores approved temporary access permissions
CREATE TABLE IF NOT EXISTS temporary_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Grant details
    access_request_id UUID NOT NULL REFERENCES access_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    key_id VARCHAR(128) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    
    -- Grant lifecycle
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID,
    revoke_reason TEXT,
    
    -- Grant conditions
    conditions JSONB DEFAULT '[]',
    max_usage_count INTEGER,
    usage_count INTEGER DEFAULT 0,
    
    -- Approval details
    granted_by UUID NOT NULL,
    approval_chain JSONB, -- Who approved at each level
    
    FOREIGN KEY (key_id) REFERENCES master_keys(key_id) ON DELETE CASCADE,
    CONSTRAINT valid_grant_period CHECK (expires_at > granted_at),
    CONSTRAINT valid_usage_limit CHECK (
        max_usage_count IS NULL OR usage_count <= max_usage_count
    ),
    CONSTRAINT valid_revocation CHECK (
        (is_active = true AND revoked_at IS NULL) OR
        (is_active = false AND revoked_at IS NOT NULL)
    )
);

-- Access control audit log table
-- Detailed logging of all access control decisions and changes
CREATE TABLE IF NOT EXISTS access_control_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event details
    event_type VARCHAR(64) NOT NULL CHECK (event_type IN (
        'access_decision', 'role_assigned', 'role_revoked', 'policy_created',
        'policy_updated', 'policy_deleted', 'access_request_submitted',
        'access_request_approved', 'access_request_denied', 'access_granted',
        'access_revoked', 'permission_escalation', 'policy_violation'
    )),
    user_id UUID,
    target_user_id UUID, -- For role assignments, etc.
    
    -- Resource details
    resource_type VARCHAR(32) CHECK (resource_type IN (
        'key', 'role', 'policy', 'access_request', 'grant'
    )),
    resource_id VARCHAR(128),
    
    -- Decision details
    operation VARCHAR(32),
    decision VARCHAR(16) CHECK (decision IN (
        'allowed', 'denied', 'conditional', 'requires_approval'
    )),
    decision_reason TEXT,
    risk_level VARCHAR(16) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Context
    session_id VARCHAR(128),
    ip_address INET,
    user_agent TEXT,
    location_info JSONB,
    
    -- Additional details
    event_details JSONB,
    policy_violations JSONB,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Performance metadata
    evaluation_duration_ms INTEGER,
    policies_evaluated INTEGER
);

-- Role hierarchy table
-- Manages role inheritance relationships
CREATE TABLE IF NOT EXISTS role_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_role_id UUID NOT NULL REFERENCES access_control_roles(id) ON DELETE CASCADE,
    child_role_id UUID NOT NULL REFERENCES access_control_roles(id) ON DELETE CASCADE,
    
    -- Hierarchy metadata
    inheritance_type VARCHAR(32) DEFAULT 'full' CHECK (inheritance_type IN (
        'full',      -- Inherit all permissions
        'partial',   -- Inherit specific permissions
        'conditional' -- Inherit based on conditions
    )),
    inherited_permissions JSONB DEFAULT '[]', -- For partial inheritance
    conditions JSONB DEFAULT '[]', -- For conditional inheritance
    
    -- Management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(parent_role_id, child_role_id),
    CONSTRAINT no_self_inheritance CHECK (parent_role_id != child_role_id)
);

-- Performance indexes

-- Role-related indexes
CREATE INDEX IF NOT EXISTS idx_access_control_roles_name ON access_control_roles(name);
CREATE INDEX IF NOT EXISTS idx_access_control_roles_active ON access_control_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_access_control_roles_system ON access_control_roles(is_system_role);

-- User role indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON user_roles(expires_at);

-- Policy indexes
CREATE INDEX IF NOT EXISTS idx_access_control_policies_name ON access_control_policies(name);
CREATE INDEX IF NOT EXISTS idx_access_control_policies_enabled ON access_control_policies(is_enabled);
CREATE INDEX IF NOT EXISTS idx_access_control_policies_priority ON access_control_policies(priority);

-- Access request indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_key_id ON access_requests(key_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_requested_at ON access_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_access_requests_expires_at ON access_requests(expires_at);

-- Temporary access grant indexes
CREATE INDEX IF NOT EXISTS idx_temp_access_grants_user_key ON temporary_access_grants(user_id, key_id);
CREATE INDEX IF NOT EXISTS idx_temp_access_grants_expires ON temporary_access_grants(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_access_grants_active ON temporary_access_grants(is_active);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_access_audit_log_user_id ON access_control_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_event_type ON access_control_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_created_at ON access_control_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_resource ON access_control_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_decision ON access_control_audit_log(decision);

-- Role hierarchy indexes
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_parent ON role_hierarchy(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_child ON role_hierarchy(child_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_active ON role_hierarchy(is_active);

-- Database functions for access control

-- Function to check if user has role (including inherited roles)
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    role_found BOOLEAN := false;
BEGIN
    -- Direct role assignment
    SELECT EXISTS(
        SELECT 1 FROM user_roles ur
        JOIN access_control_roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id 
          AND r.name = p_role_name
          AND ur.is_active = true
          AND r.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ) INTO role_found;
    
    IF role_found THEN
        RETURN true;
    END IF;
    
    -- Check inherited roles (simplified - would need recursive check for deep hierarchies)
    SELECT EXISTS(
        SELECT 1 FROM user_roles ur
        JOIN access_control_roles cr ON cr.id = ur.role_id
        JOIN role_hierarchy rh ON rh.child_role_id = cr.id
        JOIN access_control_roles pr ON pr.id = rh.parent_role_id
        WHERE ur.user_id = p_user_id 
          AND pr.name = p_role_name
          AND ur.is_active = true
          AND cr.is_active = true
          AND pr.is_active = true
          AND rh.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ) INTO role_found;
    
    RETURN role_found;
END;
$$ LANGUAGE plpgsql;

-- Function to get effective permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_permissions JSONB := '[]';
    role_record RECORD;
    permission_record JSONB;
BEGIN
    -- Get all active roles for the user
    FOR role_record IN 
        SELECT r.permissions, r.name
        FROM user_roles ur
        JOIN access_control_roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id 
          AND ur.is_active = true
          AND r.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    LOOP
        -- Add role permissions to user permissions
        FOR permission_record IN 
            SELECT * FROM jsonb_array_elements(role_record.permissions)
        LOOP
            user_permissions := user_permissions || permission_record;
        END LOOP;
    END LOOP;
    
    -- Remove duplicates (simplified)
    RETURN user_permissions;
END;
$$ LANGUAGE plpgsql;

-- Function to log access control events
CREATE OR REPLACE FUNCTION log_access_control_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-log significant events
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'user_roles' THEN
        INSERT INTO access_control_audit_log (
            event_type, user_id, target_user_id, resource_type, 
            resource_id, decision, event_details
        ) VALUES (
            'role_assigned',
            NEW.assigned_by,
            NEW.user_id,
            'role',
            NEW.role_id::TEXT,
            'allowed',
            jsonb_build_object(
                'role_id', NEW.role_id,
                'expires_at', NEW.expires_at
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for access control event logging
CREATE TRIGGER trigger_log_access_control_events
    AFTER INSERT OR UPDATE OR DELETE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION log_access_control_event();

-- Function to clean up expired access grants
CREATE OR REPLACE FUNCTION cleanup_expired_access_grants()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark expired grants as inactive
    UPDATE temporary_access_grants 
    SET is_active = false
    WHERE expires_at < NOW() 
      AND is_active = true;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Update expired access requests
    UPDATE access_requests 
    SET status = 'expired'
    WHERE expires_at < NOW() 
      AND status = 'pending';
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to validate role hierarchy (prevent cycles)
CREATE OR REPLACE FUNCTION validate_role_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple cycle detection (for immediate parent-child cycles)
    IF EXISTS(
        SELECT 1 FROM role_hierarchy 
        WHERE parent_role_id = NEW.child_role_id 
          AND child_role_id = NEW.parent_role_id
          AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Role hierarchy cycle detected: role % cannot be both parent and child of role %', 
                        NEW.parent_role_id, NEW.child_role_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for role hierarchy validation
CREATE TRIGGER trigger_validate_role_hierarchy
    BEFORE INSERT OR UPDATE ON role_hierarchy
    FOR EACH ROW
    EXECUTE FUNCTION validate_role_hierarchy();

-- Insert default system roles
INSERT INTO access_control_roles (name, description, permissions, is_system_role)
VALUES 
    (
        'system_administrator',
        'Full system administration privileges',
        '[
            {"id": "admin_all", "action": "*", "resource": "key", "scope": "global"},
            {"id": "admin_roles", "action": "*", "resource": "role", "scope": "global"},
            {"id": "admin_policies", "action": "*", "resource": "policy", "scope": "global"}
        ]'::JSONB,
        true
    ),
    (
        'key_manager',
        'Key lifecycle management privileges',
        '[
            {"id": "key_create", "action": "import", "resource": "key", "scope": "organizational"},
            {"id": "key_rotate", "action": "rotate", "resource": "key", "scope": "organizational"},
            {"id": "key_backup", "action": "backup", "resource": "key", "scope": "organizational"},
            {"id": "key_restore", "action": "restore", "resource": "key", "scope": "organizational"},
            {"id": "key_acl", "action": "modify_acl", "resource": "key", "scope": "organizational"}
        ]'::JSONB,
        true
    ),
    (
        'key_operator',
        'Standard key operations for encryption/decryption',
        '[
            {"id": "key_encrypt", "action": "encrypt", "resource": "key", "scope": "organizational"},
            {"id": "key_decrypt", "action": "decrypt", "resource": "key", "scope": "organizational"},
            {"id": "key_sign", "action": "sign", "resource": "key", "scope": "organizational"},
            {"id": "key_verify", "action": "verify", "resource": "key", "scope": "organizational"}
        ]'::JSONB,
        true
    ),
    (
        'security_auditor',
        'Security audit and compliance review',
        '[
            {"id": "audit_view", "action": "view_audit_log", "resource": "audit_log", "scope": "organizational"},
            {"id": "key_metadata", "action": "read_metadata", "resource": "key", "scope": "organizational"}
        ]'::JSONB,
        true
    ),
    (
        'approval_authority',
        'Authority to approve high-risk key operations',
        '[
            {"id": "approve_access", "action": "approve_access", "resource": "access_request", "scope": "organizational"}
        ]'::JSONB,
        true
    )
ON CONFLICT (name) DO NOTHING;

-- Insert default access control policies
INSERT INTO access_control_policies (name, description, rules, priority, created_by)
VALUES 
    (
        'high_security_operations',
        'Additional controls for high-security operations',
        '[
            {
                "id": "ultra_security_approval",
                "condition": {
                    "type": "key_properties",
                    "operator": "equals",
                    "value": "ultra"
                },
                "action": "require_approval"
            },
            {
                "id": "destructive_ops_approval", 
                "condition": {
                    "type": "operation",
                    "operator": "in",
                    "value": ["destroy", "export"]
                },
                "action": "require_approval"
            }
        ]'::JSONB,
        100,
        'system'
    ),
    (
        'business_hours_restrictions',
        'Restrict sensitive operations to business hours',
        '[
            {
                "id": "after_hours_restriction",
                "condition": {
                    "type": "time",
                    "operator": "not_between", 
                    "value": [8, 18]
                },
                "action": "require_approval"
            }
        ]'::JSONB,
        90,
        'system'
    ),
    (
        'mfa_requirements',
        'Multi-factor authentication requirements',
        '[
            {
                "id": "high_risk_mfa",
                "condition": {
                    "type": "operation",
                    "operator": "in",
                    "value": ["destroy", "export", "modify_acl"]
                },
                "action": "require_mfa"
            }
        ]'::JSONB,
        95,
        'system'
    )
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE access_control_roles IS 'Role definitions for RBAC system';
COMMENT ON TABLE user_roles IS 'Assignment of roles to users with optional conditions';
COMMENT ON TABLE access_control_policies IS 'Policy rules for conditional access control';
COMMENT ON TABLE access_requests IS 'Requests for temporary access to restricted resources';
COMMENT ON TABLE temporary_access_grants IS 'Approved temporary access permissions';
COMMENT ON TABLE access_control_audit_log IS 'Comprehensive audit trail for access control events';
COMMENT ON TABLE role_hierarchy IS 'Role inheritance relationships';

COMMENT ON FUNCTION user_has_role(UUID, VARCHAR) IS 'Check if user has a specific role (including inherited)';
COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Get all effective permissions for a user';
COMMENT ON FUNCTION cleanup_expired_access_grants() IS 'Clean up expired temporary access grants';
COMMENT ON FUNCTION validate_role_hierarchy() IS 'Prevent role hierarchy cycles';