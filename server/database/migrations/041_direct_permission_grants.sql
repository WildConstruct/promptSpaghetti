-- Epic 17: Direct Permission Grants System
-- Migration: 041_direct_permission_grants
-- DEPLOYMENT BLOCKER FIX: Creates table for immediate permission assignment system

-- Direct permission grants table for immediate effect permissions
CREATE TABLE IF NOT EXISTS user_direct_permissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('global', 'organization', 'team', 'own')),
    conditions JSONB,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent permissions
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason TEXT,
    scope_context JSONB,
    permanent BOOLEAN NOT NULL DEFAULT true, -- true for permanent, false for temporary
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_revocation CHECK (
        (status = 'revoked' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND revoke_reason IS NOT NULL)
        OR status != 'revoked'
    ),
    CONSTRAINT valid_expiration CHECK (
        expires_at IS NULL OR expires_at > granted_at
    ),
    CONSTRAINT valid_permanent_logic CHECK (
        (permanent = true AND expires_at IS NULL)
        OR (permanent = false)
    ),
    CONSTRAINT unique_active_permission UNIQUE (user_id, resource, action, scope) DEFERRABLE INITIALLY DEFERRED
);

-- Permission assignment history for audit trail
CREATE TABLE IF NOT EXISTS direct_permission_history (
    id UUID PRIMARY KEY,
    permission_id UUID NOT NULL, -- References user_direct_permissions(id)
    user_id UUID NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('granted', 'revoked', 'expired', 'modified')),
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    old_values JSONB, -- Previous state for modifications
    new_values JSONB, -- New state for modifications
    reason TEXT,
    context JSONB, -- Additional context (IP, user agent, etc.)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Permission templates for common permission sets
CREATE TABLE IF NOT EXISTS permission_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL, -- Array of permission objects
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT valid_permissions CHECK (jsonb_typeof(permissions) = 'array')
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_user_active ON user_direct_permissions(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_resource_action ON user_direct_permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_expires ON user_direct_permissions(expires_at) WHERE expires_at IS NOT NULL AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_granted_by ON user_direct_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_permanent ON user_direct_permissions(permanent, status);
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_scope ON user_direct_permissions(scope, status);
CREATE INDEX IF NOT EXISTS idx_user_direct_permissions_scope_context ON user_direct_permissions USING GIN(scope_context) WHERE scope_context IS NOT NULL;

-- History table indexes
CREATE INDEX IF NOT EXISTS idx_direct_permission_history_permission ON direct_permission_history(permission_id);
CREATE INDEX IF NOT EXISTS idx_direct_permission_history_user ON direct_permission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_permission_history_operation ON direct_permission_history(operation, performed_at);
CREATE INDEX IF NOT EXISTS idx_direct_permission_history_performed_by ON direct_permission_history(performed_by);

-- Template table indexes
CREATE INDEX IF NOT EXISTS idx_permission_templates_active ON permission_templates(active, name) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_permission_templates_created_by ON permission_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_permission_templates_usage ON permission_templates(usage_count DESC);

-- Function to automatically create history records
CREATE OR REPLACE FUNCTION create_direct_permission_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle different operations
    IF TG_OP = 'INSERT' THEN
        INSERT INTO direct_permission_history (
            id, permission_id, user_id, resource, action, scope, operation,
            performed_by, performed_at, new_values, reason
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.user_id,
            NEW.resource,
            NEW.action,
            NEW.scope,
            'granted',
            NEW.granted_by,
            NEW.granted_at,
            to_jsonb(NEW),
            NEW.reason
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Determine operation type
        DECLARE
            operation_type VARCHAR(20);
            performed_by_id UUID;
            reason_text TEXT;
        BEGIN
            IF OLD.status = 'active' AND NEW.status = 'revoked' THEN
                operation_type := 'revoked';
                performed_by_id := NEW.revoked_by;
                reason_text := NEW.revoke_reason;
            ELSIF OLD.status = 'active' AND NEW.status = 'expired' THEN
                operation_type := 'expired';
                performed_by_id := NULL;
                reason_text := 'Automatic expiration';
            ELSE
                operation_type := 'modified';
                performed_by_id := NEW.granted_by; -- Best guess
                reason_text := 'Permission modified';
            END IF;
            
            INSERT INTO direct_permission_history (
                id, permission_id, user_id, resource, action, scope, operation,
                performed_by, performed_at, old_values, new_values, reason
            ) VALUES (
                gen_random_uuid(),
                NEW.id,
                NEW.user_id,
                NEW.resource,
                NEW.action,
                NEW.scope,
                operation_type,
                performed_by_id,
                NOW(),
                to_jsonb(OLD),
                to_jsonb(NEW),
                reason_text
            );
        END;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO direct_permission_history (
            id, permission_id, user_id, resource, action, scope, operation,
            performed_at, old_values, reason
        ) VALUES (
            gen_random_uuid(),
            OLD.id,
            OLD.user_id,
            OLD.resource,
            OLD.action,
            OLD.scope,
            'deleted',
            NOW(),
            to_jsonb(OLD),
            'Permission record deleted'
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for history tracking
CREATE TRIGGER trigger_direct_permission_history
    AFTER INSERT OR UPDATE OR DELETE ON user_direct_permissions
    FOR EACH ROW
    EXECUTE FUNCTION create_direct_permission_history();

-- Function for automatic expiration
CREATE OR REPLACE FUNCTION expire_direct_permissions()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-expire records that have passed their expiration time
    IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW() AND NEW.status = 'active' THEN
        NEW.status = 'expired';
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic expiration
CREATE TRIGGER trigger_direct_permission_expiration
    BEFORE UPDATE ON user_direct_permissions
    FOR EACH ROW
    WHEN (NEW.status = 'active' AND NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW())
    EXECUTE FUNCTION expire_direct_permissions();

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called when a template is used
    -- Implementation depends on how templates are referenced
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert some default permission templates
INSERT INTO permission_templates (id, name, description, permissions, created_at) VALUES
(
    gen_random_uuid(),
    'Basic User',
    'Basic permissions for regular users',
    '[
        {"resource": "graphs", "action": "read", "scope": "own"},
        {"resource": "graphs", "action": "write", "scope": "own"},
        {"resource": "graphs", "action": "execute", "scope": "own"},
        {"resource": "users", "action": "read", "scope": "own"}
    ]'::jsonb,
    NOW()
),
(
    gen_random_uuid(),
    'Team Member',
    'Permissions for team collaboration',
    '[
        {"resource": "graphs", "action": "read", "scope": "team"},
        {"resource": "graphs", "action": "write", "scope": "team"},
        {"resource": "graphs", "action": "execute", "scope": "team"},
        {"resource": "teams", "action": "read", "scope": "team"},
        {"resource": "users", "action": "read", "scope": "team"}
    ]'::jsonb,
    NOW()
),
(
    gen_random_uuid(),
    'Organization Admin',
    'Administrative permissions for organization management',
    '[
        {"resource": "users", "action": "read", "scope": "organization"},
        {"resource": "users", "action": "write", "scope": "organization"},
        {"resource": "teams", "action": "read", "scope": "organization"},
        {"resource": "teams", "action": "write", "scope": "organization"},
        {"resource": "roles", "action": "read", "scope": "organization"},
        {"resource": "roles", "action": "write", "scope": "organization"}
    ]'::jsonb,
    NOW()
) ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE user_direct_permissions IS 'Direct permission grants bypassing traditional role assignments';
COMMENT ON TABLE direct_permission_history IS 'Audit trail for all direct permission operations';
COMMENT ON TABLE permission_templates IS 'Reusable permission sets for common access patterns';

COMMENT ON COLUMN user_direct_permissions.permanent IS 'True for permanent permissions, false for temporary ones';
COMMENT ON COLUMN user_direct_permissions.scope_context IS 'Additional context for permission scope evaluation (e.g., specific organization ID)';
COMMENT ON COLUMN user_direct_permissions.conditions IS 'JSON conditions that must be met for permission to be valid';
COMMENT ON COLUMN direct_permission_history.old_values IS 'Previous state of permission (for modifications and revocations)';
COMMENT ON COLUMN direct_permission_history.new_values IS 'New state of permission (for grants and modifications)';
COMMENT ON COLUMN permission_templates.permissions IS 'Array of permission objects defining the template';
COMMENT ON COLUMN permission_templates.usage_count IS 'Number of times this template has been applied';

-- Create a view for active permissions with user details
CREATE OR REPLACE VIEW active_user_permissions AS
SELECT 
    udp.id,
    udp.user_id,
    u.email as user_email,
    udp.resource,
    udp.action,
    udp.scope,
    udp.conditions,
    udp.granted_by,
    gb.email as granted_by_email,
    udp.granted_at,
    udp.expires_at,
    udp.permanent,
    udp.scope_context,
    udp.reason,
    CASE 
        WHEN udp.expires_at IS NOT NULL AND udp.expires_at <= NOW() + INTERVAL '24 hours' 
        THEN true 
        ELSE false 
    END as expiring_soon
FROM user_direct_permissions udp
JOIN users u ON udp.user_id = u.id
LEFT JOIN users gb ON udp.granted_by = gb.id
WHERE udp.status = 'active' 
    AND (udp.expires_at IS NULL OR udp.expires_at > NOW());

COMMENT ON VIEW active_user_permissions IS 'Active direct permissions with user details and expiration warnings';