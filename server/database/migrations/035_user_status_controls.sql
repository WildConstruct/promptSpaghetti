-- User Status Controls Migration
-- Epic 17.3.1 - User Management Dashboard
-- Task: E17-1753114397016-18BAC3
-- 
-- Creates tables and updates for comprehensive user status management system

-- Update users table with status management fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_changed_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add constraint for valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'users_status_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'suspended', 'deleted', 'locked', 'pending_activation'));
    END IF;
END $$;

-- Create user status audit log table
CREATE TABLE IF NOT EXISTS user_status_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_by_role VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    bulk_operation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_status_changed_at ON users(status_changed_at);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_suspended_until ON users(suspended_until) WHERE suspended_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_status_audit_log_user_id ON user_status_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_audit_log_timestamp ON user_status_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_status_audit_log_bulk_operation ON user_status_audit_log(bulk_operation_id) WHERE bulk_operation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_status_audit_log_changed_by ON user_status_audit_log(changed_by);

-- Create composite index for efficient status and expiration queries
CREATE INDEX IF NOT EXISTS idx_users_status_expiration ON users(status, locked_until, suspended_until);

-- Create user status statistics view
CREATE OR REPLACE VIEW user_status_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
    COUNT(*) FILTER (WHERE status = 'deleted') as deleted_users,
    COUNT(*) FILTER (WHERE status = 'locked') as locked_users,
    COUNT(*) FILTER (WHERE status = 'pending_activation') as pending_users,
    COUNT(*) FILTER (WHERE status_changed_at > NOW() - INTERVAL '24 hours') as changes_24h,
    COUNT(*) FILTER (WHERE status_changed_at > NOW() - INTERVAL '7 days') as changes_7d,
    COUNT(*) FILTER (WHERE status_changed_at > NOW() - INTERVAL '30 days') as changes_30d,
    COUNT(*) FILTER (WHERE locked_until > NOW()) as currently_locked,
    COUNT(*) FILTER (WHERE suspended_until > NOW()) as currently_suspended
FROM users;

-- Create function to automatically handle expired locks/suspensions
CREATE OR REPLACE FUNCTION handle_expired_user_statuses()
RETURNS TABLE(
    processed_count INTEGER,
    error_count INTEGER
) AS $$
DECLARE
    expired_record RECORD;
    processed_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Process expired locked users
    FOR expired_record IN 
        SELECT id, email, 'locked' as expired_status
        FROM users 
        WHERE status = 'locked' AND locked_until < NOW()
    LOOP
        BEGIN
            UPDATE users 
            SET 
                status = 'active',
                status_changed_at = NOW(),
                status_changed_by = 'system_auto_restore',
                status_reason = 'Automatic restoration after lock period expired',
                locked_until = NULL
            WHERE id = expired_record.id;
            
            -- Log the automatic status change
            INSERT INTO user_status_audit_log (
                user_id, old_status, new_status, reason, 
                changed_by, changed_by_role, timestamp
            ) VALUES (
                expired_record.id, 'locked', 'active',
                'Automatic restoration after lock period expired',
                'system_auto_restore', 'system', NOW()
            );
            
            processed_count := processed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            -- Log error but continue processing
            INSERT INTO system_logs (level, message, details, created_at) 
            VALUES (
                'ERROR',
                'Failed to auto-restore locked user',
                jsonb_build_object(
                    'user_id', expired_record.id,
                    'email', expired_record.email,
                    'error', SQLERRM
                ),
                NOW()
            );
        END;
    END LOOP;
    
    -- Process expired suspended users
    FOR expired_record IN 
        SELECT id, email, 'suspended' as expired_status
        FROM users 
        WHERE status = 'suspended' AND suspended_until < NOW()
    LOOP
        BEGIN
            UPDATE users 
            SET 
                status = 'active',
                status_changed_at = NOW(),
                status_changed_by = 'system_auto_restore',
                status_reason = 'Automatic restoration after suspension period expired',
                suspended_until = NULL
            WHERE id = expired_record.id;
            
            -- Log the automatic status change
            INSERT INTO user_status_audit_log (
                user_id, old_status, new_status, reason,
                changed_by, changed_by_role, timestamp
            ) VALUES (
                expired_record.id, 'suspended', 'active',
                'Automatic restoration after suspension period expired',
                'system_auto_restore', 'system', NOW()
            );
            
            processed_count := processed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            -- Log error but continue processing
            INSERT INTO system_logs (level, message, details, created_at) 
            VALUES (
                'ERROR',
                'Failed to auto-restore suspended user',
                jsonb_build_object(
                    'user_id', expired_record.id,
                    'email', expired_record.email,
                    'error', SQLERRM
                ),
                NOW()
            );
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed_count, error_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to log all status changes
CREATE OR REPLACE FUNCTION trigger_log_user_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO user_status_audit_log (
            user_id, old_status, new_status, reason,
            changed_by, changed_by_role, timestamp,
            expires_at
        ) VALUES (
            NEW.id,
            COALESCE(OLD.status, 'unknown'),
            NEW.status,
            COALESCE(NEW.status_reason, 'Status change'),
            COALESCE(NEW.status_changed_by, 'unknown'),
            'system', -- Will be overridden by application when known
            COALESCE(NEW.status_changed_at, NOW()),
            CASE 
                WHEN NEW.status = 'locked' THEN NEW.locked_until
                WHEN NEW.status = 'suspended' THEN NEW.suspended_until
                ELSE NULL
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic audit logging
DROP TRIGGER IF EXISTS tr_user_status_audit ON users;
CREATE TRIGGER tr_user_status_audit
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_user_status_changes();

-- Create function to get user status summary
CREATE OR REPLACE FUNCTION get_user_status_summary(user_id_param UUID)
RETURNS TABLE(
    user_id UUID,
    email VARCHAR,
    name TEXT,
    current_status VARCHAR,
    status_since TIMESTAMP,
    expires_at TIMESTAMP,
    change_count BIGINT,
    last_login TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        COALESCE(u.first_name || ' ' || u.last_name, u.email) as name,
        u.status,
        u.status_changed_at,
        CASE 
            WHEN u.status = 'locked' THEN u.locked_until
            WHEN u.status = 'suspended' THEN u.suspended_until
            ELSE NULL
        END as expires_at,
        COALESCE(
            (SELECT COUNT(*) FROM user_status_audit_log WHERE user_id = u.id),
            0
        ) as change_count,
        u.last_login
    FROM users u
    WHERE u.id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for existing users (update status if needed)
UPDATE users 
SET 
    status = COALESCE(status, 'active'),
    status_changed_at = COALESCE(status_changed_at, created_at),
    status_changed_by = COALESCE(status_changed_by, 'system_migration')
WHERE status IS NULL;

-- Create system log table for error tracking (if not exists)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_level_created ON system_logs(level, created_at DESC);

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON user_status_audit_log TO app_user;
-- GRANT SELECT ON user_status_statistics TO app_user;
-- GRANT EXECUTE ON FUNCTION handle_expired_user_statuses() TO app_user;
-- GRANT EXECUTE ON FUNCTION get_user_status_summary(UUID) TO app_user;

-- Add helpful comments
COMMENT ON TABLE user_status_audit_log IS 'Comprehensive audit log for all user status changes with compliance tracking';
COMMENT ON COLUMN user_status_audit_log.bulk_operation_id IS 'Groups multiple status changes performed in a single bulk operation';
COMMENT ON VIEW user_status_statistics IS 'Real-time statistics view for user status dashboard';
COMMENT ON FUNCTION handle_expired_user_statuses() IS 'Automatically processes expired locks and suspensions';

-- Migration completion log
INSERT INTO migration_log (migration_name, completed_at) 
VALUES ('035_user_status_controls', NOW()) 
ON CONFLICT (migration_name) DO UPDATE SET completed_at = NOW();