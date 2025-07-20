-- Key Management System Database Schema
-- Comprehensive cryptographic key lifecycle management
-- Created: 2025-07-20

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Master keys table
-- Stores encrypted master keys used for key derivation and encryption
CREATE TABLE IF NOT EXISTS master_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(128) UNIQUE NOT NULL,
    
    -- Key metadata
    purpose VARCHAR(64) NOT NULL CHECK (purpose IN (
        'data_encryption',     -- For encrypting user data
        'key_encryption',      -- For encrypting other keys (KEK)
        'token_signing',       -- For signing JWT tokens
        'api_signing',         -- For API request signing
        'session_encryption',  -- For session data encryption
        'backup_encryption',   -- For backup data encryption
        'audit_signing'        -- For audit log integrity
    )),
    algorithm VARCHAR(32) NOT NULL DEFAULT 'aes-256-gcm' CHECK (algorithm IN (
        'aes-128-gcm',
        'aes-256-gcm',
        'chacha20-poly1305',
        'aes-128-cbc',
        'aes-256-cbc'
    )),
    
    -- Key material (always encrypted)
    encrypted_key_material BYTEA NOT NULL,
    key_encryption_algorithm VARCHAR(32) NOT NULL DEFAULT 'aes-256-gcm',
    encryption_key_id VARCHAR(128), -- Reference to KEK used to encrypt this key
    initialization_vector BYTEA,
    authentication_tag BYTEA,
    
    -- Key properties
    key_length INTEGER NOT NULL CHECK (key_length IN (128, 192, 256, 512)),
    key_version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false, -- Only one primary key per purpose
    
    -- Lifecycle management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    rotated_at TIMESTAMP WITH TIME ZONE,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    destroyed_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    usage_count BIGINT DEFAULT 0,
    max_usage_count BIGINT,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Security metadata
    security_level VARCHAR(16) DEFAULT 'standard' CHECK (security_level IN (
        'standard',
        'high',
        'maximum',
        'ultra'
    )),
    access_control_list JSONB, -- Who can access this key
    key_derivation_info JSONB, -- Parameters used for key derivation
    
    -- Compliance and audit
    compliance_tags JSONB, -- Compliance requirements (PCI, HIPAA, etc.)
    created_by VARCHAR(128),
    approved_by VARCHAR(128),
    approval_required BOOLEAN DEFAULT false,
    
    CONSTRAINT valid_key_lifecycle CHECK (
        (is_active = true AND destroyed_at IS NULL) OR
        (is_active = false)
    ),
    CONSTRAINT valid_primary_key CHECK (
        (is_primary = true AND is_active = true) OR
        (is_primary = false)
    ),
    CONSTRAINT valid_usage_limit CHECK (
        max_usage_count IS NULL OR usage_count <= max_usage_count
    )
);

-- Key rotation policies table
-- Defines automatic key rotation policies
CREATE TABLE IF NOT EXISTS key_rotation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(128) UNIQUE NOT NULL,
    
    -- Policy scope
    key_purpose VARCHAR(64) NOT NULL,
    security_level VARCHAR(16),
    
    -- Rotation triggers
    rotation_interval_days INTEGER, -- Rotate every N days
    max_usage_count BIGINT, -- Rotate after N uses
    rotation_threshold_date TIMESTAMP WITH TIME ZONE, -- Rotate by specific date
    
    -- Rotation behavior
    auto_rotation_enabled BOOLEAN DEFAULT true,
    notification_days_before INTEGER DEFAULT 7, -- Notify N days before rotation
    overlap_period_hours INTEGER DEFAULT 24, -- Keep old key active for overlap
    
    -- Approval requirements
    requires_approval BOOLEAN DEFAULT false,
    approval_roles JSONB, -- Roles that can approve rotation
    
    -- Policy metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(128),
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT valid_rotation_trigger CHECK (
        rotation_interval_days IS NOT NULL OR
        max_usage_count IS NOT NULL OR
        rotation_threshold_date IS NOT NULL
    )
);

-- Key access log table
-- Detailed audit trail of key access and usage
CREATE TABLE IF NOT EXISTS key_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(128) NOT NULL,
    
    -- Access details
    access_type VARCHAR(32) NOT NULL CHECK (access_type IN (
        'encrypt',
        'decrypt',
        'sign',
        'verify',
        'derive',
        'export',
        'import',
        'rotate',
        'destroy',
        'backup',
        'restore',
        'view_metadata'
    )),
    access_result VARCHAR(16) NOT NULL CHECK (access_result IN (
        'success',
        'failure',
        'unauthorized',
        'expired',
        'revoked'
    )),
    
    -- Context
    user_id UUID,
    service_name VARCHAR(128),
    operation_context JSONB, -- Additional context about the operation
    data_classification VARCHAR(32), -- Classification of data being processed
    
    -- Security
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(128),
    
    -- Performance
    operation_duration_ms INTEGER,
    bytes_processed BIGINT,
    
    -- Timestamps
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    metadata JSONB,
    
    FOREIGN KEY (key_id) REFERENCES master_keys(key_id) ON DELETE CASCADE
);

-- Key backup table
-- Secure backups of key material
CREATE TABLE IF NOT EXISTS key_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(128) NOT NULL,
    backup_id VARCHAR(128) UNIQUE NOT NULL,
    
    -- Backup content
    encrypted_backup_data BYTEA NOT NULL,
    backup_encryption_key_id VARCHAR(128),
    backup_checksum VARCHAR(128), -- Integrity verification
    
    -- Backup metadata
    backup_type VARCHAR(32) DEFAULT 'full' CHECK (backup_type IN (
        'full',          -- Complete key backup
        'metadata_only', -- Key metadata without material
        'differential'   -- Changes since last backup
    )),
    compression_algorithm VARCHAR(32),
    
    -- Storage information
    storage_location VARCHAR(256),
    storage_provider VARCHAR(64),
    
    -- Lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    restored_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    created_by VARCHAR(128),
    access_control JSONB,
    
    FOREIGN KEY (key_id) REFERENCES master_keys(key_id) ON DELETE CASCADE
);

-- Key derivation cache table
-- Cache derived keys for performance
CREATE TABLE IF NOT EXISTS key_derivation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source and derived key info
    source_key_id VARCHAR(128) NOT NULL,
    derived_key_hash VARCHAR(128) UNIQUE NOT NULL, -- Hash of derivation parameters
    
    -- Derivation parameters
    derivation_algorithm VARCHAR(32) NOT NULL,
    derivation_context JSONB NOT NULL, -- Salt, info, iterations, etc.
    derived_key_purpose VARCHAR(64),
    
    -- Cached key material (encrypted)
    encrypted_derived_key BYTEA NOT NULL,
    
    -- Cache management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Security
    max_access_count INTEGER DEFAULT 1000,
    
    FOREIGN KEY (source_key_id) REFERENCES master_keys(key_id) ON DELETE CASCADE,
    
    CONSTRAINT valid_cache_expiry CHECK (expires_at > created_at)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_master_keys_purpose ON master_keys(purpose);
CREATE INDEX IF NOT EXISTS idx_master_keys_is_active ON master_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_master_keys_is_primary ON master_keys(is_primary);
CREATE INDEX IF NOT EXISTS idx_master_keys_expires_at ON master_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_master_keys_security_level ON master_keys(security_level);
CREATE INDEX IF NOT EXISTS idx_master_keys_created_at ON master_keys(created_at);

CREATE INDEX IF NOT EXISTS idx_key_rotation_policies_purpose ON key_rotation_policies(key_purpose);
CREATE INDEX IF NOT EXISTS idx_key_rotation_policies_active ON key_rotation_policies(is_active);

CREATE INDEX IF NOT EXISTS idx_key_access_log_key_id ON key_access_log(key_id);
CREATE INDEX IF NOT EXISTS idx_key_access_log_user_id ON key_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_key_access_log_access_type ON key_access_log(access_type);
CREATE INDEX IF NOT EXISTS idx_key_access_log_accessed_at ON key_access_log(accessed_at);
CREATE INDEX IF NOT EXISTS idx_key_access_log_access_result ON key_access_log(access_result);

CREATE INDEX IF NOT EXISTS idx_key_backups_key_id ON key_backups(key_id);
CREATE INDEX IF NOT EXISTS idx_key_backups_created_at ON key_backups(created_at);
CREATE INDEX IF NOT EXISTS idx_key_backups_expires_at ON key_backups(expires_at);

CREATE INDEX IF NOT EXISTS idx_key_derivation_cache_source_key ON key_derivation_cache(source_key_id);
CREATE INDEX IF NOT EXISTS idx_key_derivation_cache_expires_at ON key_derivation_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_key_derivation_cache_hash ON key_derivation_cache(derived_key_hash);

-- Security functions

-- Function to enforce single primary key per purpose
CREATE OR REPLACE FUNCTION enforce_single_primary_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Deactivate other primary keys for the same purpose
        UPDATE master_keys 
        SET is_primary = false, updated_at = NOW()
        WHERE purpose = NEW.purpose 
          AND is_primary = true 
          AND key_id != NEW.key_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for primary key enforcement
CREATE TRIGGER trigger_enforce_single_primary_key
    BEFORE INSERT OR UPDATE ON master_keys
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION enforce_single_primary_key();

-- Function to auto-expire cached keys
CREATE OR REPLACE FUNCTION cleanup_expired_cached_keys()
RETURNS void AS $$
BEGIN
    DELETE FROM key_derivation_cache 
    WHERE expires_at < NOW() 
       OR access_count >= max_access_count;
END;
$$ LANGUAGE plpgsql;

-- Function to rotate keys based on policies
CREATE OR REPLACE FUNCTION check_key_rotation_requirements()
RETURNS TABLE(key_id VARCHAR(128), reason TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mk.key_id,
        CASE 
            WHEN krp.rotation_interval_days IS NOT NULL 
                 AND mk.created_at < NOW() - INTERVAL '1 day' * krp.rotation_interval_days
            THEN 'Rotation interval exceeded'
            WHEN krp.max_usage_count IS NOT NULL 
                 AND mk.usage_count >= krp.max_usage_count
            THEN 'Usage count limit reached'
            WHEN krp.rotation_threshold_date IS NOT NULL 
                 AND NOW() >= krp.rotation_threshold_date
            THEN 'Rotation threshold date reached'
            ELSE 'Manual rotation required'
        END as reason
    FROM master_keys mk
    JOIN key_rotation_policies krp ON krp.key_purpose = mk.purpose
    WHERE mk.is_active = true
      AND krp.is_active = true
      AND krp.auto_rotation_enabled = true
      AND (
          (krp.rotation_interval_days IS NOT NULL 
           AND mk.created_at < NOW() - INTERVAL '1 day' * krp.rotation_interval_days) OR
          (krp.max_usage_count IS NOT NULL 
           AND mk.usage_count >= krp.max_usage_count) OR
          (krp.rotation_threshold_date IS NOT NULL 
           AND NOW() >= krp.rotation_threshold_date)
      );
END;
$$ LANGUAGE plpgsql;

-- Function to log key access
CREATE OR REPLACE FUNCTION log_key_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count and last used timestamp
    UPDATE master_keys 
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE key_id = NEW.key_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for key access logging
CREATE TRIGGER trigger_log_key_access
    AFTER INSERT ON key_access_log
    FOR EACH ROW
    WHEN (NEW.access_result = 'success' AND NEW.access_type IN ('encrypt', 'decrypt', 'sign', 'verify'))
    EXECUTE FUNCTION log_key_access();

-- Function to validate key access permissions
CREATE OR REPLACE FUNCTION validate_key_access(
    p_key_id VARCHAR(128),
    p_user_id UUID,
    p_operation VARCHAR(32),
    p_context JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    key_record RECORD;
    acl_entry JSONB;
BEGIN
    -- Get key details
    SELECT * INTO key_record
    FROM master_keys
    WHERE key_id = p_key_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if key is active
    IF NOT key_record.is_active THEN
        RETURN false;
    END IF;
    
    -- Check if key is expired
    IF key_record.expires_at IS NOT NULL AND key_record.expires_at < NOW() THEN
        RETURN false;
    END IF;
    
    -- Check usage limits
    IF key_record.max_usage_count IS NOT NULL 
       AND key_record.usage_count >= key_record.max_usage_count THEN
        RETURN false;
    END IF;
    
    -- Check access control list
    IF key_record.access_control_list IS NOT NULL THEN
        FOR acl_entry IN SELECT * FROM jsonb_array_elements(key_record.access_control_list)
        LOOP
            -- Simple ACL check (can be extended)
            IF (acl_entry->>'user_id')::UUID = p_user_id 
               AND (acl_entry->>'operations') ? p_operation THEN
                RETURN true;
            END IF;
        END LOOP;
        
        -- If ACL exists but no match found, deny access
        RETURN false;
    END IF;
    
    -- Default: allow access if no specific restrictions
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Initial data setup

-- Create default rotation policies
INSERT INTO key_rotation_policies (policy_name, key_purpose, rotation_interval_days, auto_rotation_enabled, created_by)
VALUES 
    ('data_encryption_standard', 'data_encryption', 90, true, 'system'),
    ('token_signing_standard', 'token_signing', 30, true, 'system'),
    ('session_encryption_standard', 'session_encryption', 7, true, 'system'),
    ('api_signing_standard', 'api_signing', 60, true, 'system')
ON CONFLICT (policy_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE master_keys IS 'Encrypted storage of master cryptographic keys with lifecycle management';
COMMENT ON TABLE key_rotation_policies IS 'Policies defining automatic key rotation schedules and triggers';
COMMENT ON TABLE key_access_log IS 'Comprehensive audit trail of all key access and usage';
COMMENT ON TABLE key_backups IS 'Secure backups of key material for disaster recovery';
COMMENT ON TABLE key_derivation_cache IS 'Performance cache for frequently derived keys';

COMMENT ON COLUMN master_keys.encrypted_key_material IS 'Key material encrypted with KEK, never stored in plaintext';
COMMENT ON COLUMN master_keys.access_control_list IS 'JSON array defining who can access this key and how';
COMMENT ON COLUMN master_keys.compliance_tags IS 'Compliance requirements and certifications';

COMMENT ON FUNCTION enforce_single_primary_key() IS 'Ensures only one primary key exists per purpose';
COMMENT ON FUNCTION cleanup_expired_cached_keys() IS 'Removes expired cached derived keys';
COMMENT ON FUNCTION check_key_rotation_requirements() IS 'Identifies keys that need rotation based on policies';
COMMENT ON FUNCTION validate_key_access() IS 'Validates if a user can perform an operation on a key';