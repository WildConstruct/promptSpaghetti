-- Epic 17 - Account Lockout System Migration
-- Adds comprehensive account lockout tracking and management

-- Add lockout-related columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lockout_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_at TIMESTAMP;

-- Create lockout_events table for detailed tracking
CREATE TABLE IF NOT EXISTS lockout_events (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('locked', 'unlocked', 'failed_attempt', 'unlock_requested')),
    lockout_level INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    admin_action BOOLEAN DEFAULT FALSE,
    unlock_method VARCHAR(50) CHECK (unlock_method IN ('time', 'admin', 'token', 'password_reset')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lockout_events_user_id ON lockout_events(user_id);
CREATE INDEX IF NOT EXISTS idx_lockout_events_email ON lockout_events(email);
CREATE INDEX IF NOT EXISTS idx_lockout_events_timestamp ON lockout_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_lockout_events_event_type ON lockout_events(event_type);

-- Create index for active locked accounts
CREATE INDEX IF NOT EXISTS idx_users_locked_accounts ON users(account_locked, locked_until) 
WHERE account_locked = TRUE;

-- Create index for failed login attempts
CREATE INDEX IF NOT EXISTS idx_users_failed_attempts ON users(email, failed_login_attempts, last_failed_at);

-- Create lockout_config table for runtime configuration
CREATE TABLE IF NOT EXISTS lockout_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default lockout configuration
INSERT INTO lockout_config (config_key, config_value, description) VALUES
('default_policy', '{
    "maxFailedAttempts": 5,
    "lockoutDurationMinutes": 15,
    "progressiveLockout": true,
    "progressiveMultipliers": [1, 2, 4, 8, 16],
    "resetWindowHours": 24,
    "notifyUser": true,
    "notifyAdmins": true,
    "adminEmails": [],
    "allowSelfUnlock": true,
    "captchaThreshold": 3
}', 'Default account lockout policy')
ON CONFLICT (config_key) DO NOTHING;

-- Create function to automatically unlock expired accounts
CREATE OR REPLACE FUNCTION unlock_expired_accounts()
RETURNS INTEGER AS $$
DECLARE
    unlock_count INTEGER;
BEGIN
    -- Update users whose lockout period has expired
    UPDATE users 
    SET 
        account_locked = FALSE,
        locked_until = NULL
    WHERE 
        account_locked = TRUE 
        AND locked_until IS NOT NULL 
        AND locked_until <= NOW();
    
    GET DIAGNOSTICS unlock_count = ROW_COUNT;
    
    -- Log the unlock events
    INSERT INTO lockout_events (user_id, email, event_type, lockout_level, unlock_method, timestamp)
    SELECT 
        user_id,
        email,
        'unlocked',
        lockout_count,
        'time',
        NOW()
    FROM users 
    WHERE account_locked = FALSE 
        AND lockout_count > 0
        AND NOT EXISTS (
            SELECT 1 FROM lockout_events le 
            WHERE le.user_id = users.user_id 
                AND le.event_type = 'unlocked' 
                AND le.timestamp > NOW() - INTERVAL '1 minute'
        );
    
    RETURN unlock_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for lockout statistics
CREATE OR REPLACE VIEW lockout_statistics AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) FILTER (WHERE event_type = 'locked') as daily_lockouts,
    COUNT(*) FILTER (WHERE event_type = 'unlocked') as daily_unlocks,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'locked') as unique_users_locked,
    AVG(duration_minutes) FILTER (WHERE event_type = 'locked') as avg_lockout_duration,
    COUNT(*) FILTER (WHERE event_type = 'locked' AND lockout_level = 1) as first_time_lockouts,
    COUNT(*) FILTER (WHERE event_type = 'locked' AND lockout_level > 1) as repeat_lockouts
FROM lockout_events 
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Create view for currently locked accounts
CREATE OR REPLACE VIEW currently_locked_accounts AS
SELECT 
    u.user_id,
    u.email,
    u.locked_until,
    u.lockout_count,
    u.failed_login_attempts,
    u.last_failed_at,
    le.timestamp as locked_at,
    le.ip_address as last_attempt_ip,
    le.user_agent as last_attempt_user_agent,
    EXTRACT(EPOCH FROM (u.locked_until - NOW()))/60 as minutes_remaining
FROM users u
LEFT JOIN lockout_events le ON u.user_id = le.user_id 
    AND le.event_type = 'locked'
    AND le.timestamp = (
        SELECT MAX(timestamp) 
        FROM lockout_events 
        WHERE user_id = u.user_id AND event_type = 'locked'
    )
WHERE u.account_locked = TRUE
    AND u.locked_until > NOW()
ORDER BY u.locked_until DESC;

-- Grant permissions for the application user
-- Note: Adjust these based on your actual database user setup
-- GRANT SELECT, INSERT, UPDATE ON lockout_events TO app_user;
-- GRANT SELECT, UPDATE ON users TO app_user;
-- GRANT SELECT, INSERT, UPDATE ON lockout_config TO app_user;
-- GRANT SELECT ON lockout_statistics TO app_user;
-- GRANT SELECT ON currently_locked_accounts TO app_user;
-- GRANT EXECUTE ON FUNCTION unlock_expired_accounts() TO app_user;

-- Add triggers for updated_at on lockout_config
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lockout_config_updated_at
    BEFORE UPDATE ON lockout_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add audit trail for critical lockout operations
CREATE OR REPLACE FUNCTION log_lockout_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log when accounts are locked/unlocked
    IF (TG_OP = 'UPDATE') THEN
        -- Account was locked
        IF (OLD.account_locked = FALSE AND NEW.account_locked = TRUE) THEN
            INSERT INTO audit_logs (user_id, action, details, severity, created_at)
            VALUES (
                NEW.user_id,
                'account_locked_db_trigger',
                jsonb_build_object(
                    'email', NEW.email,
                    'locked_until', NEW.locked_until,
                    'lockout_count', NEW.lockout_count,
                    'failed_attempts', NEW.failed_login_attempts
                ),
                'warning',
                NOW()
            );
        END IF;
        
        -- Account was unlocked
        IF (OLD.account_locked = TRUE AND NEW.account_locked = FALSE) THEN
            INSERT INTO audit_logs (user_id, action, details, severity, created_at)
            VALUES (
                NEW.user_id,
                'account_unlocked_db_trigger',
                jsonb_build_object(
                    'email', NEW.email,
                    'previous_lockout_count', OLD.lockout_count,
                    'failed_attempts_reset', OLD.failed_login_attempts
                ),
                'info',
                NOW()
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if audit_logs table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP TRIGGER IF EXISTS lockout_audit_trigger ON users;
        CREATE TRIGGER lockout_audit_trigger
            AFTER UPDATE ON users
            FOR EACH ROW
            WHEN (OLD.account_locked IS DISTINCT FROM NEW.account_locked)
            EXECUTE FUNCTION log_lockout_changes();
    END IF;
END $$;