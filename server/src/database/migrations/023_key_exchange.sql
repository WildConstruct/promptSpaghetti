-- Key Exchange Protocol Database Schema
-- Secure ECDH (Elliptic Curve Diffie-Hellman) key exchange implementation
-- Created: 2025-07-20

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Key exchange sessions table
-- Tracks ongoing key exchange sessions between clients and server
CREATE TABLE IF NOT EXISTS key_exchange_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(128) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(128), -- Optional client identifier
    
    -- Key exchange state
    state VARCHAR(32) NOT NULL DEFAULT 'initiated' CHECK (state IN (
        'initiated',      -- Session started, waiting for client public key
        'server_ready',   -- Server generated keys, sent public key to client
        'completed',      -- Key exchange completed successfully
        'expired',        -- Session expired
        'failed'          -- Key exchange failed
    )),
    
    -- Cryptographic data
    server_private_key TEXT, -- Server's ephemeral private key (encrypted)
    server_public_key TEXT NOT NULL, -- Server's ephemeral public key
    client_public_key TEXT, -- Client's ephemeral public key
    shared_secret_hash VARCHAR(128), -- Hash of derived shared secret (for verification)
    key_derivation_salt BYTEA, -- Salt for key derivation
    
    -- Protocol metadata
    algorithm VARCHAR(32) NOT NULL DEFAULT 'secp256r1' CHECK (algorithm IN (
        'secp256r1',  -- NIST P-256 (recommended)
        'secp384r1',  -- NIST P-384 (high security)
        'secp521r1'   -- NIST P-521 (maximum security)
    )),
    key_derivation_function VARCHAR(32) NOT NULL DEFAULT 'pbkdf2' CHECK (key_derivation_function IN (
        'pbkdf2',     -- PBKDF2 with SHA-256
        'argon2',     -- Argon2id (recommended for new implementations)
        'scrypt'      -- scrypt (alternative)
    )),
    iterations INTEGER DEFAULT 100000 CHECK (iterations >= 10000),
    
    -- Security metadata
    ip_address INET,
    user_agent TEXT,
    security_level VARCHAR(16) DEFAULT 'standard' CHECK (security_level IN (
        'standard',   -- Standard security parameters
        'high',       -- Enhanced security parameters
        'maximum'     -- Maximum security parameters
    )),
    
    -- Timestamps and expiry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Audit trail
    created_by VARCHAR(128),
    completion_method VARCHAR(64), -- How the key exchange was completed
    failure_reason TEXT, -- Reason for failure if state = 'failed'
    
    CONSTRAINT valid_expiry CHECK (expires_at > created_at),
    CONSTRAINT completion_consistency CHECK (
        (state = 'completed' AND completed_at IS NOT NULL) OR
        (state != 'completed' AND completed_at IS NULL)
    )
);

-- Derived keys table
-- Stores information about keys derived from the shared secret
CREATE TABLE IF NOT EXISTS derived_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES key_exchange_sessions(id) ON DELETE CASCADE,
    
    -- Key identification
    key_id VARCHAR(128) UNIQUE NOT NULL,
    key_purpose VARCHAR(64) NOT NULL CHECK (key_purpose IN (
        'encryption',     -- For data encryption
        'authentication', -- For message authentication
        'signing',        -- For digital signatures
        'session',        -- For session management
        'api_access'      -- For API access tokens
    )),
    
    -- Key derivation parameters
    derivation_info TEXT, -- Additional info for HKDF (RFC 5869)
    key_length INTEGER NOT NULL CHECK (key_length IN (16, 24, 32, 48, 64)),
    
    -- Key lifecycle
    derived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    max_usage_count INTEGER, -- Optional usage limit
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Security metadata
    security_context JSONB, -- Additional security context
    
    CONSTRAINT valid_key_expiry CHECK (expires_at IS NULL OR expires_at > derived_at),
    CONSTRAINT valid_usage_limit CHECK (max_usage_count IS NULL OR usage_count <= max_usage_count)
);

-- Key exchange audit log
-- Detailed audit trail for all key exchange operations
CREATE TABLE IF NOT EXISTS key_exchange_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES key_exchange_sessions(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(64) NOT NULL CHECK (event_type IN (
        'session_initiated',
        'server_keys_generated',
        'client_key_received',
        'shared_secret_derived',
        'key_derived',
        'session_completed',
        'session_expired',
        'session_failed',
        'key_revoked',
        'security_violation'
    )),
    event_data JSONB,
    
    -- Context
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Security
    security_level VARCHAR(16),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    metadata JSONB
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_key_exchange_sessions_user_id ON key_exchange_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_key_exchange_sessions_session_id ON key_exchange_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_key_exchange_sessions_state ON key_exchange_sessions(state);
CREATE INDEX IF NOT EXISTS idx_key_exchange_sessions_expires_at ON key_exchange_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_key_exchange_sessions_created_at ON key_exchange_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_derived_keys_session_id ON derived_keys(session_id);
CREATE INDEX IF NOT EXISTS idx_derived_keys_key_id ON derived_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_derived_keys_key_purpose ON derived_keys(key_purpose);
CREATE INDEX IF NOT EXISTS idx_derived_keys_expires_at ON derived_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_key_exchange_audit_session_id ON key_exchange_audit(session_id);
CREATE INDEX IF NOT EXISTS idx_key_exchange_audit_event_type ON key_exchange_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_key_exchange_audit_user_id ON key_exchange_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_key_exchange_audit_created_at ON key_exchange_audit(created_at);

-- Security constraints
-- Ensure sessions don't stay active too long
CREATE OR REPLACE FUNCTION cleanup_expired_key_exchange_sessions()
RETURNS void AS $$
BEGIN
    UPDATE key_exchange_sessions 
    SET state = 'expired', 
        last_activity = NOW()
    WHERE state IN ('initiated', 'server_ready') 
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to revoke derived keys when session fails
CREATE OR REPLACE FUNCTION revoke_session_keys()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.state = 'failed' OR NEW.state = 'expired' THEN
        UPDATE derived_keys 
        SET revoked_at = NOW(),
            revocation_reason = 'Session ' || NEW.state
        WHERE session_id = NEW.id 
          AND revoked_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically revoke keys when session fails
CREATE TRIGGER trigger_revoke_session_keys
    AFTER UPDATE ON key_exchange_sessions
    FOR EACH ROW
    WHEN (OLD.state != NEW.state AND NEW.state IN ('failed', 'expired'))
    EXECUTE FUNCTION revoke_session_keys();

-- Function to audit key exchange events
CREATE OR REPLACE FUNCTION audit_key_exchange_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO key_exchange_audit (
        session_id,
        event_type,
        event_data,
        user_id,
        security_level,
        metadata
    ) VALUES (
        NEW.id,
        CASE 
            WHEN OLD IS NULL THEN 'session_initiated'
            WHEN OLD.state != NEW.state THEN 
                CASE NEW.state
                    WHEN 'server_ready' THEN 'server_keys_generated'
                    WHEN 'completed' THEN 'session_completed'
                    WHEN 'expired' THEN 'session_expired'
                    WHEN 'failed' THEN 'session_failed'
                    ELSE 'state_changed'
                END
            ELSE 'session_updated'
        END,
        jsonb_build_object(
            'old_state', COALESCE(OLD.state, 'none'),
            'new_state', NEW.state,
            'algorithm', NEW.algorithm,
            'security_level', NEW.security_level
        ),
        NEW.user_id,
        NEW.security_level,
        jsonb_build_object(
            'ip_address', NEW.ip_address,
            'user_agent', NEW.user_agent,
            'session_id', NEW.session_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for key exchange audit
CREATE TRIGGER trigger_audit_key_exchange
    AFTER INSERT OR UPDATE ON key_exchange_sessions
    FOR EACH ROW
    EXECUTE FUNCTION audit_key_exchange_event();

-- Initial data setup
-- Create default security configurations
INSERT INTO key_exchange_sessions (session_id, state, server_public_key, algorithm) 
VALUES ('health-check', 'completed', 'system-health-check', 'secp256r1')
ON CONFLICT (session_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE key_exchange_sessions IS 'Secure ECDH key exchange sessions between clients and server';
COMMENT ON TABLE derived_keys IS 'Keys derived from shared secrets for various cryptographic purposes';
COMMENT ON TABLE key_exchange_audit IS 'Comprehensive audit trail for all key exchange operations';

COMMENT ON COLUMN key_exchange_sessions.server_private_key IS 'Encrypted ephemeral private key (never stored in plaintext)';
COMMENT ON COLUMN key_exchange_sessions.shared_secret_hash IS 'Hash of shared secret for verification (not the secret itself)';
COMMENT ON COLUMN key_exchange_sessions.security_level IS 'Security level affecting key sizes and iteration counts';

COMMENT ON COLUMN derived_keys.derivation_info IS 'Context-specific information for HKDF key derivation';
COMMENT ON COLUMN derived_keys.security_context IS 'Additional security metadata in JSON format';

COMMENT ON FUNCTION cleanup_expired_key_exchange_sessions() IS 'Cleanup function to mark expired sessions';
COMMENT ON FUNCTION revoke_session_keys() IS 'Automatically revokes derived keys when session fails';
COMMENT ON FUNCTION audit_key_exchange_event() IS 'Comprehensive audit logging for key exchange operations';