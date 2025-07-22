-- Epic 17 Password Management Database Schema
-- Task: E17-1753114397015-CD835D - Create password management
-- 
-- Creates comprehensive password and secret management infrastructure for Epic 17
-- API Management System, including API key secrets, administrative credentials,
-- service authentication, vault storage, and security event logging.

-- API key secrets management
CREATE TABLE IF NOT EXISTS epic17_api_key_secrets (
    id SERIAL PRIMARY KEY,
    key_id UUID NOT NULL,
    secret_id UUID UNIQUE NOT NULL,
    secret_type VARCHAR(20) NOT NULL DEFAULT 'primary', -- primary, backup, rotated
    hashed_secret TEXT NOT NULL,
    salt VARCHAR(255) NOT NULL,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'bcrypt',
    strength INTEGER, -- Password strength score 0-100
    entropy DECIMAL(10, 2), -- Entropy calculation
    
    -- Lifecycle management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    rotated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and security
    status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked, rotating
    failed_attempts INTEGER DEFAULT 0,
    last_failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    rotation_reason TEXT,
    
    -- Indexes for performance
    INDEX idx_epic17_api_secrets_key_id (key_id),
    INDEX idx_epic17_api_secrets_secret_id (secret_id),
    INDEX idx_epic17_api_secrets_status (status),
    INDEX idx_epic17_api_secrets_expires_at (expires_at),
    INDEX idx_epic17_api_secrets_created_at (created_at),
    INDEX idx_epic17_api_secrets_composite (key_id, status, expires_at),
    
    -- Foreign key constraints  
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE CASCADE
);

-- Administrative credentials management
CREATE TABLE IF NOT EXISTS epic17_admin_credentials (
    id SERIAL PRIMARY KEY,
    credential_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    credential_type VARCHAR(30) NOT NULL, -- password, service_token, api_admin_key
    hashed_value TEXT NOT NULL,
    salt VARCHAR(255) NOT NULL,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'bcrypt',
    strength INTEGER, -- Password strength score
    
    -- Lifecycle management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_rotated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    must_change_at TIMESTAMP WITH TIME ZONE, -- Force password change
    
    -- Status and validation
    status VARCHAR(20) DEFAULT 'active', -- active, expired, locked, pending_rotation, compromised
    is_temporary BOOLEAN DEFAULT FALSE,
    failed_attempts INTEGER DEFAULT 0,
    last_failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance tracking
    compliance_flags JSONB DEFAULT '[]'::jsonb,
    created_by VARCHAR(255) NOT NULL,
    last_modified_by VARCHAR(255),
    reason_for_change TEXT,
    approved_by VARCHAR(255),
    
    -- Indexes
    INDEX idx_epic17_admin_creds_user_id (user_id),
    INDEX idx_epic17_admin_creds_credential_id (credential_id),
    INDEX idx_epic17_admin_creds_type (credential_type),
    INDEX idx_epic17_admin_creds_status (status),
    INDEX idx_epic17_admin_creds_expires_at (expires_at),
    INDEX idx_epic17_admin_creds_must_change (must_change_at),
    INDEX idx_epic17_admin_creds_temporary (is_temporary),
    INDEX idx_epic17_admin_creds_composite (user_id, credential_type, status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Service authentication management
CREATE TABLE IF NOT EXISTS epic17_service_auth (
    id SERIAL PRIMARY KEY,
    service_id UUID UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    auth_type VARCHAR(30) NOT NULL, -- bearer_token, api_key, certificate, mutual_tls
    encrypted_credentials JSONB NOT NULL, -- Stored credentials (encrypted)
    encryption_method VARCHAR(50) DEFAULT 'none',
    
    -- Rotation management
    rotation_enabled BOOLEAN DEFAULT TRUE,
    rotation_interval_hours INTEGER DEFAULT 24,
    next_rotation_at TIMESTAMP WITH TIME ZONE,
    last_rotated_at TIMESTAMP WITH TIME ZONE,
    
    -- Access control
    access_scope JSONB DEFAULT '[]'::jsonb, -- Array of allowed scopes
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, rotating
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    environment VARCHAR(50) DEFAULT 'production',
    dependencies JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_service_auth_service_id (service_id),
    INDEX idx_epic17_service_auth_name (service_name),
    INDEX idx_epic17_service_auth_type (auth_type),
    INDEX idx_epic17_service_auth_status (status),
    INDEX idx_epic17_service_auth_rotation (next_rotation_at),
    INDEX idx_epic17_service_auth_environment (environment),
    INDEX idx_epic17_service_auth_composite (service_name, status, environment)
);

-- Vault storage for sensitive data
CREATE TABLE IF NOT EXISTS epic17_vault_entries (
    id SERIAL PRIMARY KEY,
    vault_id UUID UNIQUE NOT NULL,
    entry_type VARCHAR(30) NOT NULL, -- api_key_secret, admin_password, service_token, encryption_key
    key_identifier VARCHAR(255) NOT NULL, -- Reference to the entity this vault entry protects
    encrypted_value TEXT NOT NULL,
    encryption_algorithm VARCHAR(50) NOT NULL DEFAULT 'aes-256-gcm',
    iv VARCHAR(255) NOT NULL, -- Initialization vector
    auth_tag VARCHAR(255), -- Authentication tag for AEAD ciphers
    key_derivation_params JSONB NOT NULL, -- Parameters for key derivation
    
    -- Access tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_epic17_vault_vault_id (vault_id),
    INDEX idx_epic17_vault_entry_type (entry_type),
    INDEX idx_epic17_vault_key_identifier (key_identifier),
    INDEX idx_epic17_vault_expires_at (expires_at),
    INDEX idx_epic17_vault_composite (entry_type, key_identifier),
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(entry_type, key_identifier)
);

-- Vault access log for audit purposes
CREATE TABLE IF NOT EXISTS epic17_vault_access_log (
    id SERIAL PRIMARY KEY,
    vault_id UUID NOT NULL,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_by VARCHAR(255) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- read, write, rotate, delete
    source_ip INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Indexes
    INDEX idx_epic17_vault_access_vault_id (vault_id),
    INDEX idx_epic17_vault_access_accessed_at (accessed_at),
    INDEX idx_epic17_vault_access_accessed_by (accessed_by),
    INDEX idx_epic17_vault_access_operation (operation),
    INDEX idx_epic17_vault_access_success (success),
    INDEX idx_epic17_vault_access_composite (vault_id, accessed_at, success),
    
    FOREIGN KEY (vault_id) REFERENCES epic17_vault_entries(vault_id) ON DELETE CASCADE
);

-- Security events and incidents
CREATE TABLE IF NOT EXISTS epic17_security_events (
    id SERIAL PRIMARY KEY,
    event_id UUID UNIQUE NOT NULL,
    event_type VARCHAR(30) NOT NULL, -- creation, rotation, access, failure, breach, compromise
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    
    -- Associated entities
    user_id UUID,
    key_id UUID,
    service_id UUID,
    
    -- Event details
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    
    -- Indexes
    INDEX idx_epic17_security_events_event_id (event_id),
    INDEX idx_epic17_security_events_type (event_type),
    INDEX idx_epic17_security_events_severity (severity),
    INDEX idx_epic17_security_events_timestamp (timestamp),
    INDEX idx_epic17_security_events_user_id (user_id),
    INDEX idx_epic17_security_events_key_id (key_id),
    INDEX idx_epic17_security_events_service_id (service_id),
    INDEX idx_epic17_security_events_resolved (resolved),
    INDEX idx_epic17_security_events_composite (event_type, severity, timestamp),
    INDEX idx_epic17_security_events_unresolved (timestamp, resolved) WHERE resolved = FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE SET NULL
);

-- Password history for compliance
CREATE TABLE IF NOT EXISTS epic17_password_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    credential_id UUID NOT NULL,
    hashed_password TEXT NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_password_history_user_id (user_id),
    INDEX idx_epic17_password_history_credential_id (credential_id),
    INDEX idx_epic17_password_history_created_at (created_at),
    INDEX idx_epic17_password_history_composite (user_id, created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (credential_id) REFERENCES epic17_admin_credentials(credential_id) ON DELETE CASCADE
);

-- Configuration and policy management
CREATE TABLE IF NOT EXISTS epic17_password_policies (
    id SERIAL PRIMARY KEY,
    policy_id UUID UNIQUE NOT NULL,
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- api_key, admin_password, service_auth
    rules JSONB NOT NULL, -- Policy rules and constraints
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100,
    
    -- Scope and application
    applies_to JSONB DEFAULT '{}'::jsonb, -- User roles, services, environments
    environment VARCHAR(50) DEFAULT 'production',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Indexes
    INDEX idx_epic17_password_policies_policy_id (policy_id),
    INDEX idx_epic17_password_policies_name (policy_name),
    INDEX idx_epic17_password_policies_type (policy_type),
    INDEX idx_epic17_password_policies_enabled (enabled),
    INDEX idx_epic17_password_policies_environment (environment),
    INDEX idx_epic17_password_policies_priority (priority),
    INDEX idx_epic17_password_policies_composite (policy_type, enabled, priority)
);

-- Breach database for password checking
CREATE TABLE IF NOT EXISTS epic17_breach_passwords (
    id SERIAL PRIMARY KEY,
    password_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of breached password
    breach_count INTEGER DEFAULT 1,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sources JSONB DEFAULT '[]'::jsonb, -- Array of breach sources
    
    -- Indexes
    INDEX idx_epic17_breach_passwords_hash (password_hash),
    INDEX idx_epic17_breach_passwords_count (breach_count),
    INDEX idx_epic17_breach_passwords_last_seen (last_seen)
);

-- Create functions for common operations

-- Function to log vault access
CREATE OR REPLACE FUNCTION log_vault_access(
    p_vault_id UUID,
    p_accessed_by VARCHAR(255),
    p_operation VARCHAR(20),
    p_source_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO epic17_vault_access_log (
        vault_id, accessed_by, operation, source_ip, user_agent, success, error_message
    ) VALUES (
        p_vault_id, p_accessed_by, p_operation, p_source_ip, p_user_agent, p_success, p_error_message
    );
    
    -- Update access count and timestamp in vault entries
    UPDATE epic17_vault_entries 
    SET 
        last_accessed_at = NOW(),
        access_count = access_count + 1
    WHERE vault_id = p_vault_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check password breach
CREATE OR REPLACE FUNCTION check_password_breach(p_password_hash VARCHAR(64)) 
RETURNS TABLE(is_breached BOOLEAN, breach_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN bp.password_hash IS NOT NULL THEN TRUE ELSE FALSE END as is_breached,
        COALESCE(bp.breach_count, 0) as breach_count
    FROM (SELECT p_password_hash as hash) h
    LEFT JOIN epic17_breach_passwords bp ON bp.password_hash = h.hash;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired vault entries
CREATE OR REPLACE FUNCTION cleanup_expired_vault_entries() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired vault entries
    DELETE FROM epic17_vault_entries 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO epic17_security_events (
        event_id, event_type, severity, description, metadata
    ) VALUES (
        gen_random_uuid(), 'cleanup', 'low', 
        'Automated cleanup of expired vault entries',
        jsonb_build_object('deleted_count', deleted_count, 'cleanup_timestamp', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to rotate expired secrets
CREATE OR REPLACE FUNCTION get_secrets_due_for_rotation() 
RETURNS TABLE(
    key_id UUID, 
    secret_id UUID, 
    created_at TIMESTAMP WITH TIME ZONE,
    days_since_creation INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.key_id,
        s.secret_id,
        s.created_at,
        EXTRACT(day FROM NOW() - s.created_at)::INTEGER as days_since_creation
    FROM epic17_api_key_secrets s
    WHERE s.status = 'active'
        AND (s.expires_at IS NULL OR s.expires_at > NOW())
        AND s.created_at < NOW() - INTERVAL '90 days'; -- Default 90-day rotation
END;
$$ LANGUAGE plpgsql;

-- Add some default password policies
INSERT INTO epic17_password_policies (
    policy_id, policy_name, policy_type, rules, description, created_by
) VALUES 
(
    gen_random_uuid(),
    'Default API Key Secret Policy',
    'api_key',
    '{
        "minLength": 64,
        "rotationDays": 90,
        "hashRounds": 12,
        "allowReuse": false,
        "maxFailedAttempts": 5,
        "lockoutMinutes": 30
    }'::jsonb,
    'Default security policy for API key secrets',
    'system'
),
(
    gen_random_uuid(),
    'Enterprise Admin Password Policy',
    'admin_password',
    '{
        "minLength": 12,
        "maxAge": 90,
        "historyCount": 12,
        "complexity": {
            "requireUppercase": true,
            "requireLowercase": true,
            "requireNumbers": true,
            "requireSymbols": true,
            "minUniqueChars": 8
        },
        "breachChecking": true,
        "mfaRequired": true,
        "maxFailedAttempts": 5,
        "lockoutMinutes": 30
    }'::jsonb,
    'Enterprise-grade administrative password policy',
    'system'
),
(
    gen_random_uuid(),
    'Service Authentication Policy',
    'service_auth',
    '{
        "tokenLength": 48,
        "rotationHours": 24,
        "encryption": true,
        "scopeRequired": true,
        "auditAccess": true
    }'::jsonb,
    'Security policy for service-to-service authentication',
    'system'
)
ON CONFLICT (policy_id) DO NOTHING;

-- Create partial indexes for performance on large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_api_secrets_active_recent 
    ON epic17_api_key_secrets (created_at DESC, key_id) 
    WHERE status = 'active' AND created_at >= NOW() - INTERVAL '1 year';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_security_events_recent_critical 
    ON epic17_security_events (timestamp DESC, event_type, severity) 
    WHERE timestamp >= NOW() - INTERVAL '30 days' AND severity IN ('high', 'critical');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_vault_entries_active 
    ON epic17_vault_entries (entry_type, last_accessed_at) 
    WHERE expires_at IS NULL OR expires_at > NOW();

-- Add table comments for documentation
COMMENT ON TABLE epic17_api_key_secrets IS 'Secure storage and management of API key secrets with rotation and audit trails';
COMMENT ON TABLE epic17_admin_credentials IS 'Administrative password and credential management with compliance tracking';
COMMENT ON TABLE epic17_service_auth IS 'Service-to-service authentication credential management';
COMMENT ON TABLE epic17_vault_entries IS 'Encrypted vault storage for sensitive credentials and secrets';
COMMENT ON TABLE epic17_vault_access_log IS 'Comprehensive audit log of all vault access operations';
COMMENT ON TABLE epic17_security_events IS 'Security event tracking and incident management for password systems';
COMMENT ON TABLE epic17_password_history IS 'Historical password tracking for compliance and reuse prevention';
COMMENT ON TABLE epic17_password_policies IS 'Configurable password and security policies';
COMMENT ON TABLE epic17_breach_passwords IS 'Known breached password database for security validation';

-- Grant appropriate permissions
-- Note: Adjust these based on your specific user setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO epic17_password_service;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO epic17_password_service;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO epic17_password_service;

-- Create a view for password security dashboard
CREATE VIEW epic17_password_security_dashboard AS
SELECT 
    -- API Key Secret Metrics
    (SELECT COUNT(*) FROM epic17_api_key_secrets WHERE status = 'active') as active_api_secrets,
    (SELECT COUNT(*) FROM epic17_api_key_secrets WHERE status = 'expired') as expired_api_secrets,
    (SELECT COUNT(*) FROM epic17_api_key_secrets WHERE failed_attempts > 0) as failed_api_attempts,
    (SELECT AVG(strength) FROM epic17_api_key_secrets WHERE status = 'active') as avg_api_secret_strength,
    
    -- Admin Credential Metrics
    (SELECT COUNT(*) FROM epic17_admin_credentials WHERE status = 'active') as active_admin_creds,
    (SELECT COUNT(*) FROM epic17_admin_credentials WHERE is_temporary = true) as temporary_admin_creds,
    (SELECT COUNT(*) FROM epic17_admin_credentials WHERE must_change_at < NOW()) as overdue_password_changes,
    (SELECT AVG(strength) FROM epic17_admin_credentials WHERE status = 'active') as avg_admin_password_strength,
    
    -- Service Authentication Metrics
    (SELECT COUNT(*) FROM epic17_service_auth WHERE status = 'active') as active_service_auths,
    (SELECT COUNT(*) FROM epic17_service_auth WHERE next_rotation_at < NOW()) as overdue_rotations,
    
    -- Security Event Metrics
    (SELECT COUNT(*) FROM epic17_security_events WHERE resolved = false) as unresolved_security_events,
    (SELECT COUNT(*) FROM epic17_security_events WHERE severity = 'critical' AND resolved = false) as critical_security_events,
    (SELECT COUNT(*) FROM epic17_security_events WHERE timestamp >= NOW() - INTERVAL '24 hours') as recent_security_events,
    
    -- Vault Metrics
    (SELECT COUNT(*) FROM epic17_vault_entries) as total_vault_entries,
    (SELECT COUNT(*) FROM epic17_vault_entries WHERE expires_at < NOW()) as expired_vault_entries;

-- Create trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION update_epic17_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_admin_credentials_timestamp
    BEFORE UPDATE ON epic17_admin_credentials
    FOR EACH ROW EXECUTE FUNCTION update_epic17_timestamp();

CREATE TRIGGER update_epic17_service_auth_timestamp
    BEFORE UPDATE ON epic17_service_auth
    FOR EACH ROW EXECUTE FUNCTION update_epic17_timestamp();

CREATE TRIGGER update_epic17_password_policies_timestamp
    BEFORE UPDATE ON epic17_password_policies
    FOR EACH ROW EXECUTE FUNCTION update_epic17_timestamp();

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Password Management System database schema created successfully';
    RAISE NOTICE '📊 Tables created: 9 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 utility functions';
    RAISE NOTICE '📋 Default policies: 3 security policies installed';
    RAISE NOTICE '🚀 System ready for Epic 17 password management operations';
END $$;