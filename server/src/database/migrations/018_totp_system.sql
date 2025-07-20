-- Epic 17 - TOTP (Time-based One-Time Password) System
-- Database schema for TOTP authentication with backup codes

-- TOTP configurations table
CREATE TABLE IF NOT EXISTS user_totp_secrets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- Base32 encoded secret
  algorithm VARCHAR(10) NOT NULL DEFAULT 'SHA1' CHECK (algorithm IN ('SHA1', 'SHA256', 'SHA512')),
  digits INTEGER NOT NULL DEFAULT 6 CHECK (digits IN (6, 8)),
  period INTEGER NOT NULL DEFAULT 30 CHECK (period > 0),
  issuer VARCHAR(255) NOT NULL DEFAULT 'PromptSpaghetti',
  account_name VARCHAR(255) NOT NULL,
  label VARCHAR(500) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of backup codes
  used_backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of used backup codes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  last_used_code VARCHAR(10), -- Last successful code (for replay prevention)
  
  -- Ensure one active TOTP config per user
  UNIQUE(user_id)
);

-- Temporary TOTP configurations for enrollment process
CREATE TABLE IF NOT EXISTS temp_totp_configurations (
  id VARCHAR(100) PRIMARY KEY, -- Configuration ID
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  algorithm VARCHAR(10) NOT NULL DEFAULT 'SHA1',
  digits INTEGER NOT NULL DEFAULT 6,
  period INTEGER NOT NULL DEFAULT 30,
  issuer VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  label VARCHAR(500) NOT NULL,
  backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  
  -- Auto-cleanup expired configurations
  CHECK (expires_at > created_at)
);

-- Used TOTP codes tracking (for replay attack prevention)
CREATE TABLE IF NOT EXISTS used_totp_codes (
  id SERIAL PRIMARY KEY,
  config_id INTEGER NOT NULL REFERENCES user_totp_secrets(id) ON DELETE CASCADE,
  code_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the code
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '2 minutes'), -- 2 periods max
  
  -- Prevent duplicate code usage
  UNIQUE(config_id, code_hash)
);

-- TOTP events log for security monitoring
CREATE TABLE IF NOT EXISTS totp_events (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  configuration_id VARCHAR(100), -- Could be temp or permanent config ID
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'enrollment_started', 'enrollment_completed', 'enrollment_failed',
    'authentication_success', 'authentication_failed', 
    'configuration_disabled', 'backup_code_used', 'codes_regenerated'
  )),
  ip_address INET,
  user_agent TEXT,
  source_location JSONB, -- Geographic location data
  metadata JSONB, -- Additional event-specific data
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Index for efficient querying
  INDEX (user_id, timestamp),
  INDEX (action, timestamp),
  INDEX (ip_address, timestamp)
);

-- Rate limiting for TOTP attempts
CREATE TABLE IF NOT EXISTS totp_rate_limits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  attempt_type VARCHAR(20) NOT NULL CHECK (attempt_type IN ('enrollment', 'authentication')),
  ip_address INET,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  -- Composite unique constraint for rate limiting keys
  UNIQUE(user_id, attempt_type, ip_address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_totp_secrets_user_id ON user_totp_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_totp_secrets_enabled ON user_totp_secrets(user_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_temp_totp_expires ON temp_totp_configurations(expires_at);
CREATE INDEX IF NOT EXISTS idx_used_codes_expires ON used_totp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_totp_events_user_time ON totp_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_totp_rate_limits_cleanup ON totp_rate_limits(window_start);

-- Auto-cleanup function for expired records
CREATE OR REPLACE FUNCTION cleanup_expired_totp_data()
RETURNS void AS $$
BEGIN
  -- Clean up expired temporary configurations
  DELETE FROM temp_totp_configurations WHERE expires_at < NOW();
  
  -- Clean up expired used codes
  DELETE FROM used_totp_codes WHERE expires_at < NOW();
  
  -- Clean up old rate limit records (older than 24 hours)
  DELETE FROM totp_rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';
  
  -- Clean up old TOTP events (older than 1 year for compliance)
  DELETE FROM totp_events WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup function (requires pg_cron extension)
-- SELECT cron.schedule('totp-cleanup', '0 */6 * * *', 'SELECT cleanup_expired_totp_data();');

-- Views for monitoring and statistics

-- Active TOTP users view
CREATE OR REPLACE VIEW active_totp_users AS
SELECT 
  u.user_id,
  u.email,
  t.algorithm,
  t.digits,
  t.period,
  t.created_at as totp_enabled_at,
  t.last_used_at,
  jsonb_array_length(t.backup_codes) - jsonb_array_length(t.used_backup_codes) as remaining_backup_codes
FROM users u
JOIN user_totp_secrets t ON u.user_id = t.user_id
WHERE t.is_enabled = true;

-- TOTP usage statistics view
CREATE OR REPLACE VIEW totp_statistics AS
SELECT 
  COUNT(*) FILTER (WHERE t.is_enabled = true) as total_active_users,
  COUNT(*) FILTER (WHERE t.is_enabled = false) as total_inactive_configs,
  COUNT(*) FILTER (WHERE t.last_used_at > NOW() - INTERVAL '7 days') as active_last_week,
  COUNT(*) FILTER (WHERE t.last_used_at > NOW() - INTERVAL '30 days') as active_last_month,
  AVG(jsonb_array_length(t.backup_codes) - jsonb_array_length(t.used_backup_codes)) as avg_remaining_backup_codes,
  COUNT(*) FILTER (WHERE jsonb_array_length(t.used_backup_codes) > 0) as users_with_used_backup_codes
FROM user_totp_secrets t;

-- Recent TOTP events view
CREATE OR REPLACE VIEW recent_totp_events AS
SELECT 
  te.id,
  u.email,
  te.action,
  te.ip_address,
  te.timestamp,
  te.metadata,
  CASE 
    WHEN te.action IN ('authentication_failed', 'enrollment_failed') THEN 'warning'
    WHEN te.action IN ('authentication_success', 'enrollment_completed') THEN 'success'
    ELSE 'info'
  END as severity
FROM totp_events te
JOIN users u ON te.user_id = u.user_id
WHERE te.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY te.timestamp DESC;

-- Grants for application user
GRANT SELECT, INSERT, UPDATE, DELETE ON user_totp_secrets TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON temp_totp_configurations TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON used_totp_codes TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON totp_events TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON totp_rate_limits TO app_user;
GRANT SELECT ON active_totp_users TO app_user;
GRANT SELECT ON totp_statistics TO app_user;
GRANT SELECT ON recent_totp_events TO app_user;
GRANT USAGE ON SEQUENCE user_totp_secrets_id_seq TO app_user;
GRANT USAGE ON SEQUENCE used_totp_codes_id_seq TO app_user;
GRANT USAGE ON SEQUENCE totp_events_id_seq TO app_user;
GRANT USAGE ON SEQUENCE totp_rate_limits_id_seq TO app_user;

-- Initial configuration data
INSERT INTO totp_rate_limits (user_id, attempt_type, ip_address, attempts, window_start) 
VALUES ('00000000-0000-0000-0000-000000000000', 'enrollment', '127.0.0.1', 0, NOW())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE user_totp_secrets IS 'TOTP configuration storage for user MFA';
COMMENT ON TABLE temp_totp_configurations IS 'Temporary TOTP configurations during enrollment';
COMMENT ON TABLE used_totp_codes IS 'Used TOTP codes for replay attack prevention';
COMMENT ON TABLE totp_events IS 'TOTP security events and audit log';
COMMENT ON TABLE totp_rate_limits IS 'Rate limiting for TOTP authentication attempts';