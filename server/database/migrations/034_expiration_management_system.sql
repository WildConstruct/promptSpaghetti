-- Migration 034: Expiration Management System
-- Comprehensive authentication resource expiration management

-- Create expiration policies table
CREATE TABLE expiration_policies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    resource_type ENUM(
        'jwt_token', 'api_key', 'session', 'reset_token', 
        'verification_code', 'backup_code', 'refresh_token'
    ) NOT NULL,
    default_ttl INTEGER NOT NULL COMMENT 'Default time-to-live in seconds',
    max_ttl INTEGER NULL COMMENT 'Maximum allowed TTL in seconds',
    min_ttl INTEGER NULL COMMENT 'Minimum allowed TTL in seconds',
    grace_period INTEGER NULL COMMENT 'Grace period after expiration in seconds',
    warning_threshold INTEGER NOT NULL COMMENT 'Warning threshold in seconds before expiration',
    auto_renewal BOOLEAN NOT NULL DEFAULT FALSE,
    renewal_window INTEGER NOT NULL DEFAULT 3600 COMMENT 'Window for renewal in seconds',
    organization_id VARCHAR(255) NULL COMMENT 'NULL for global policies',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_expiration_policies_resource_type (resource_type),
    INDEX idx_expiration_policies_organization (organization_id),
    INDEX idx_expiration_policies_active (is_active),
    
    UNIQUE KEY uk_expiration_policies_resource_org (resource_type, organization_id),
    
    CONSTRAINT chk_expiration_policies_ttl_order 
        CHECK (min_ttl IS NULL OR max_ttl IS NULL OR min_ttl <= max_ttl),
    CONSTRAINT chk_expiration_policies_ttl_positive 
        CHECK (default_ttl > 0 AND warning_threshold > 0 AND renewal_window > 0),
    CONSTRAINT chk_expiration_policies_grace_period 
        CHECK (grace_period IS NULL OR grace_period >= 0)
);

-- Create expiration rules table
CREATE TABLE expiration_rules (
    id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    grace_period_ends DATETIME NULL,
    last_warning_at DATETIME NULL,
    renewal_count INTEGER NOT NULL DEFAULT 0,
    max_renewals INTEGER NULL,
    metadata JSON NULL,
    status ENUM('active', 'warning', 'expired', 'grace_period', 'renewed', 'revoked') NOT NULL DEFAULT 'active',
    created_by VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_expiration_rules_resource (resource_type, resource_id),
    INDEX idx_expiration_rules_expires_at (expires_at),
    INDEX idx_expiration_rules_status (status),
    INDEX idx_expiration_rules_policy (policy_id),
    INDEX idx_expiration_rules_created_by (created_by),
    INDEX idx_expiration_rules_grace_period (grace_period_ends),
    INDEX idx_expiration_rules_warning_check (status, expires_at, last_warning_at),
    
    UNIQUE KEY uk_expiration_rules_resource (resource_type, resource_id),
    
    FOREIGN KEY (policy_id) REFERENCES expiration_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_expiration_rules_expires_after_created 
        CHECK (expires_at > created_at),
    CONSTRAINT chk_expiration_rules_grace_after_expires 
        CHECK (grace_period_ends IS NULL OR grace_period_ends > expires_at)
);

-- Create expiration events table for audit trail
CREATE TABLE expiration_events (
    id VARCHAR(255) PRIMARY KEY,
    rule_id VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    event_type ENUM('created', 'warning', 'expired', 'renewed', 'revoked', 'extended') NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSON NULL,
    processed_at DATETIME NULL,
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    
    INDEX idx_expiration_events_rule (rule_id),
    INDEX idx_expiration_events_resource (resource_type, resource_id),
    INDEX idx_expiration_events_timestamp (timestamp DESC),
    INDEX idx_expiration_events_type (event_type),
    INDEX idx_expiration_events_processing (processed_at, notification_sent),
    
    FOREIGN KEY (rule_id) REFERENCES expiration_rules(id) ON DELETE CASCADE
);

-- Create expiration notifications table
CREATE TABLE expiration_notifications (
    id VARCHAR(255) PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NULL,
    organization_id VARCHAR(255) NULL,
    notification_type ENUM('email', 'webhook', 'push', 'sms') NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'bounced') NOT NULL DEFAULT 'pending',
    sent_at DATETIME NULL,
    error_message TEXT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_expiration_notifications_event (event_id),
    INDEX idx_expiration_notifications_user (user_id),
    INDEX idx_expiration_notifications_status (status),
    INDEX idx_expiration_notifications_created (created_at DESC),
    INDEX idx_expiration_notifications_retry (status, retry_count, max_retries),
    
    FOREIGN KEY (event_id) REFERENCES expiration_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create views for common queries

-- Active expirations view
CREATE VIEW active_expirations AS
SELECT 
    er.*,
    ep.name as policy_name,
    ep.warning_threshold,
    ep.auto_renewal,
    ep.renewal_window,
    TIMESTAMPDIFF(SECOND, NOW(), er.expires_at) as seconds_until_expiration,
    CASE 
        WHEN er.expires_at <= NOW() THEN 'expired'
        WHEN TIMESTAMPDIFF(SECOND, NOW(), er.expires_at) <= ep.warning_threshold THEN 'warning'
        ELSE 'active'
    END as computed_status
FROM expiration_rules er
JOIN expiration_policies ep ON er.policy_id = ep.id
WHERE er.status IN ('active', 'warning') 
  AND ep.is_active = 1;

-- Expiration dashboard view
CREATE VIEW expiration_dashboard AS
SELECT 
    ep.resource_type,
    ep.organization_id,
    COUNT(er.id) as total_rules,
    SUM(CASE WHEN er.status = 'active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN er.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
    SUM(CASE WHEN er.status = 'expired' THEN 1 ELSE 0 END) as expired_count,
    SUM(CASE WHEN er.expires_at <= DATE_ADD(NOW(), INTERVAL 1 DAY) 
        AND er.status = 'active' THEN 1 ELSE 0 END) as expiring_24h,
    SUM(CASE WHEN er.expires_at <= DATE_ADD(NOW(), INTERVAL 7 DAY) 
        AND er.status = 'active' THEN 1 ELSE 0 END) as expiring_7d,
    AVG(er.renewal_count) as avg_renewals,
    MIN(er.expires_at) as next_expiration
FROM expiration_policies ep
LEFT JOIN expiration_rules er ON ep.id = er.policy_id
WHERE ep.is_active = 1
GROUP BY ep.resource_type, ep.organization_id;

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to create expiration rule with validation
CREATE PROCEDURE CreateExpirationRule(
    IN p_resource_id VARCHAR(255),
    IN p_resource_type VARCHAR(50),
    IN p_policy_id VARCHAR(255),
    IN p_custom_ttl INTEGER,
    IN p_created_by VARCHAR(255),
    IN p_metadata JSON,
    OUT p_rule_id VARCHAR(255),
    OUT p_expires_at DATETIME,
    OUT p_error_message TEXT
)
BEGIN
    DECLARE v_policy_exists INT DEFAULT 0;
    DECLARE v_default_ttl INT DEFAULT 0;
    DECLARE v_max_ttl INT DEFAULT NULL;
    DECLARE v_min_ttl INT DEFAULT NULL;
    DECLARE v_grace_period INT DEFAULT NULL;
    DECLARE v_ttl INT DEFAULT 0;
    DECLARE v_rule_exists INT DEFAULT 0;
    DECLARE v_timestamp DATETIME;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            p_error_message = MESSAGE_TEXT;
        SET p_rule_id = NULL;
        SET p_expires_at = NULL;
    END;

    SET p_error_message = NULL;
    SET v_timestamp = NOW();
    SET p_rule_id = CONCAT('rule_', UNIX_TIMESTAMP(v_timestamp), '_', SUBSTRING(MD5(RAND()), 1, 8));

    START TRANSACTION;

    -- Validate policy exists and is active
    SELECT COUNT(*), default_ttl, max_ttl, min_ttl, grace_period
    INTO v_policy_exists, v_default_ttl, v_max_ttl, v_min_ttl, v_grace_period
    FROM expiration_policies 
    WHERE id = p_policy_id AND is_active = 1;

    IF v_policy_exists = 0 THEN
        SET p_error_message = 'Expiration policy not found or inactive';
        ROLLBACK;
        LEAVE CreateExpirationRule;
    END IF;

    -- Check if rule already exists for this resource
    SELECT COUNT(*) INTO v_rule_exists
    FROM expiration_rules 
    WHERE resource_id = p_resource_id AND resource_type = p_resource_type AND status != 'revoked';

    IF v_rule_exists > 0 THEN
        SET p_error_message = 'Expiration rule already exists for this resource';
        ROLLBACK;
        LEAVE CreateExpirationRule;
    END IF;

    -- Determine TTL
    SET v_ttl = COALESCE(p_custom_ttl, v_default_ttl);

    -- Validate TTL against limits
    IF v_max_ttl IS NOT NULL AND v_ttl > v_max_ttl THEN
        SET p_error_message = CONCAT('TTL ', v_ttl, ' exceeds maximum allowed TTL ', v_max_ttl);
        ROLLBACK;
        LEAVE CreateExpirationRule;
    END IF;

    IF v_min_ttl IS NOT NULL AND v_ttl < v_min_ttl THEN
        SET p_error_message = CONCAT('TTL ', v_ttl, ' is below minimum allowed TTL ', v_min_ttl);
        ROLLBACK;
        LEAVE CreateExpirationRule;
    END IF;

    -- Calculate expiration time
    SET p_expires_at = DATE_ADD(v_timestamp, INTERVAL v_ttl SECOND);

    -- Insert expiration rule
    INSERT INTO expiration_rules (
        id, policy_id, resource_id, resource_type, expires_at, grace_period_ends,
        renewal_count, metadata, status, created_by, created_at, updated_at
    ) VALUES (
        p_rule_id, p_policy_id, p_resource_id, p_resource_type, p_expires_at,
        CASE WHEN v_grace_period IS NOT NULL 
             THEN DATE_ADD(p_expires_at, INTERVAL v_grace_period SECOND) 
             ELSE NULL END,
        0, p_metadata, 'active', p_created_by, v_timestamp, v_timestamp
    );

    -- Create initial event
    INSERT INTO expiration_events (
        id, rule_id, resource_id, resource_type, event_type, timestamp, metadata
    ) VALUES (
        CONCAT('event_', UNIX_TIMESTAMP(v_timestamp), '_', SUBSTRING(MD5(RAND()), 1, 8)),
        p_rule_id, p_resource_id, p_resource_type, 'created', v_timestamp,
        JSON_OBJECT('ttl', v_ttl, 'expires_at', p_expires_at)
    );

    COMMIT;
END //

-- Procedure to renew resource expiration
CREATE PROCEDURE RenewResourceExpiration(
    IN p_resource_id VARCHAR(255),
    IN p_resource_type VARCHAR(50),
    IN p_requested_ttl INTEGER,
    IN p_renewed_by VARCHAR(255),
    IN p_reason TEXT,
    OUT p_success BOOLEAN,
    OUT p_new_expires_at DATETIME,
    OUT p_renewal_count INTEGER,
    OUT p_error_message TEXT
)
BEGIN
    DECLARE v_rule_id VARCHAR(255);
    DECLARE v_policy_id VARCHAR(255);
    DECLARE v_current_expires_at DATETIME;
    DECLARE v_renewal_count INTEGER;
    DECLARE v_max_renewals INTEGER;
    DECLARE v_default_ttl INTEGER;
    DECLARE v_max_ttl INTEGER;
    DECLARE v_min_ttl INTEGER;
    DECLARE v_renewal_window INTEGER;
    DECLARE v_grace_period INTEGER;
    DECLARE v_ttl INTEGER;
    DECLARE v_timestamp DATETIME;
    DECLARE v_time_until_expiration INTEGER;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            p_error_message = MESSAGE_TEXT;
        SET p_success = FALSE;
    END;

    SET p_error_message = NULL;
    SET p_success = FALSE;
    SET v_timestamp = NOW();

    START TRANSACTION;

    -- Get current expiration rule
    SELECT er.id, er.policy_id, er.expires_at, er.renewal_count, er.max_renewals,
           ep.default_ttl, ep.max_ttl, ep.min_ttl, ep.renewal_window, ep.grace_period
    INTO v_rule_id, v_policy_id, v_current_expires_at, v_renewal_count, v_max_renewals,
         v_default_ttl, v_max_ttl, v_min_ttl, v_renewal_window, v_grace_period
    FROM expiration_rules er
    JOIN expiration_policies ep ON er.policy_id = ep.id
    WHERE er.resource_id = p_resource_id AND er.resource_type = p_resource_type
      AND er.status IN ('active', 'warning');

    IF v_rule_id IS NULL THEN
        SET p_error_message = 'Expiration rule not found or not renewable';
        ROLLBACK;
        LEAVE RenewResourceExpiration;
    END IF;

    -- Check renewal window
    SET v_time_until_expiration = TIMESTAMPDIFF(SECOND, v_timestamp, v_current_expires_at);
    IF v_time_until_expiration > v_renewal_window THEN
        SET p_error_message = CONCAT('Resource not within renewal window (', v_renewal_window, ' seconds)');
        ROLLBACK;
        LEAVE RenewResourceExpiration;
    END IF;

    -- Check maximum renewals
    IF v_max_renewals IS NOT NULL AND v_renewal_count >= v_max_renewals THEN
        SET p_error_message = 'Maximum renewal limit reached';
        ROLLBACK;
        LEAVE RenewResourceExpiration;
    END IF;

    -- Determine TTL
    SET v_ttl = COALESCE(p_requested_ttl, v_default_ttl);

    -- Apply limits
    IF v_max_ttl IS NOT NULL AND v_ttl > v_max_ttl THEN
        SET v_ttl = v_max_ttl;
    END IF;
    IF v_min_ttl IS NOT NULL AND v_ttl < v_min_ttl THEN
        SET v_ttl = v_min_ttl;
    END IF;

    -- Calculate new expiration
    SET p_new_expires_at = DATE_ADD(v_timestamp, INTERVAL v_ttl SECOND);
    SET p_renewal_count = v_renewal_count + 1;

    -- Update expiration rule
    UPDATE expiration_rules 
    SET expires_at = p_new_expires_at,
        grace_period_ends = CASE WHEN v_grace_period IS NOT NULL 
                                THEN DATE_ADD(p_new_expires_at, INTERVAL v_grace_period SECOND)
                                ELSE NULL END,
        renewal_count = p_renewal_count,
        status = 'active',
        updated_at = v_timestamp
    WHERE id = v_rule_id;

    -- Create renewal event
    INSERT INTO expiration_events (
        id, rule_id, resource_id, resource_type, event_type, timestamp, metadata
    ) VALUES (
        CONCAT('event_', UNIX_TIMESTAMP(v_timestamp), '_', SUBSTRING(MD5(RAND()), 1, 8)),
        v_rule_id, p_resource_id, p_resource_type, 'renewed', v_timestamp,
        JSON_OBJECT(
            'old_expires_at', v_current_expires_at,
            'new_expires_at', p_new_expires_at,
            'renewed_by', p_renewed_by,
            'reason', p_reason,
            'ttl', v_ttl
        )
    );

    SET p_success = TRUE;
    COMMIT;
END //

-- Procedure for cleanup of expired resources
CREATE PROCEDURE CleanupExpiredResources(
    OUT p_cleaned INTEGER,
    OUT p_errors INTEGER
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_rule_id VARCHAR(255);
    DECLARE v_resource_id VARCHAR(255);
    DECLARE v_resource_type VARCHAR(50);
    DECLARE cleanup_cursor CURSOR FOR
        SELECT er.id, er.resource_id, er.resource_type
        FROM expiration_rules er
        JOIN expiration_policies ep ON er.policy_id = ep.id
        WHERE er.status IN ('active', 'warning', 'grace_period')
          AND (
            (ep.grace_period IS NULL AND er.expires_at <= NOW()) 
            OR (ep.grace_period IS NOT NULL AND er.grace_period_ends <= NOW())
          );
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_errors = p_errors + 1;
    END;

    SET p_cleaned = 0;
    SET p_errors = 0;

    OPEN cleanup_cursor;
    read_loop: LOOP
        FETCH cleanup_cursor INTO v_rule_id, v_resource_id, v_resource_type;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Mark as expired
        UPDATE expiration_rules 
        SET status = 'expired', updated_at = NOW()
        WHERE id = v_rule_id;

        -- Create expiration event
        INSERT INTO expiration_events (
            id, rule_id, resource_id, resource_type, event_type, timestamp, metadata
        ) VALUES (
            CONCAT('event_', UNIX_TIMESTAMP(), '_', SUBSTRING(MD5(RAND()), 1, 8)),
            v_rule_id, v_resource_id, v_resource_type, 'expired', NOW(),
            JSON_OBJECT('cleanup_time', NOW())
        );

        SET p_cleaned = p_cleaned + 1;
    END LOOP;
    CLOSE cleanup_cursor;
END //

DELIMITER ;

-- Create indexes for performance
CREATE INDEX idx_expiration_rules_cleanup ON expiration_rules(status, expires_at, grace_period_ends);
CREATE INDEX idx_expiration_rules_warnings ON expiration_rules(status, expires_at, last_warning_at);
CREATE INDEX idx_expiration_events_notification ON expiration_events(notification_sent, timestamp);

-- Insert default expiration policies
INSERT INTO expiration_policies (
    id, name, resource_type, default_ttl, max_ttl, min_ttl, grace_period, 
    warning_threshold, auto_renewal, renewal_window, is_active
) VALUES 
(
    'policy_jwt_default',
    'Default JWT Token Policy',
    'jwt_token',
    3600,        -- 1 hour default
    86400,       -- 24 hours max
    300,         -- 5 minutes min
    300,         -- 5 minutes grace
    600,         -- 10 minutes warning
    TRUE,
    1800,        -- 30 minutes renewal window
    TRUE
),
(
    'policy_api_key_default',
    'Default API Key Policy',
    'api_key',
    2592000,     -- 30 days default
    31536000,    -- 1 year max
    86400,       -- 1 day min
    NULL,        -- no grace period
    604800,      -- 7 days warning
    FALSE,
    1209600,     -- 14 days renewal window
    TRUE
),
(
    'policy_session_default',
    'Default Session Policy',
    'session',
    7200,        -- 2 hours default
    43200,       -- 12 hours max
    900,         -- 15 minutes min
    300,         -- 5 minutes grace
    900,         -- 15 minutes warning
    TRUE,
    3600,        -- 1 hour renewal window
    TRUE
),
(
    'policy_reset_token_default',
    'Default Reset Token Policy',
    'reset_token',
    3600,        -- 1 hour default
    7200,        -- 2 hours max
    1800,        -- 30 minutes min
    NULL,        -- no grace period
    600,         -- 10 minutes warning
    FALSE,
    1800,        -- 30 minutes renewal window
    TRUE
),
(
    'policy_verification_code_default',
    'Default Verification Code Policy',
    'verification_code',
    600,         -- 10 minutes default
    1800,        -- 30 minutes max
    300,         -- 5 minutes min
    NULL,        -- no grace period
    120,         -- 2 minutes warning
    FALSE,
    300,         -- 5 minutes renewal window
    TRUE
),
(
    'policy_refresh_token_default',
    'Default Refresh Token Policy',
    'refresh_token',
    2592000,     -- 30 days default
    7776000,     -- 90 days max
    604800,      -- 7 days min
    86400,       -- 1 day grace
    604800,      -- 7 days warning
    TRUE,
    1209600,     -- 14 days renewal window
    TRUE
);

-- Insert expiration management permissions
INSERT INTO permissions (id, name, resource, action, scope, description, category, is_active) VALUES
('perm_manage_expiration', 'Manage Expiration Policies', 'expiration', 'manage', 'organization', 'Create and modify expiration policies and rules', 'System Administration', 1),
('perm_view_expiration', 'View Expiration Status', 'expiration', 'read', 'own', 'View expiration status and statistics', 'System Administration', 1),
('perm_renew_expiration', 'Renew Resources', 'expiration', 'renew', 'own', 'Renew expiring authentication resources', 'System Administration', 1),
('perm_revoke_expiration', 'Revoke Resources', 'expiration', 'revoke', 'organization', 'Immediately revoke authentication resources', 'System Administration', 1)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- Add expiration permissions to admin roles
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_manage_expiration'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator') AND r.is_active = 1;

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_view_expiration'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator', 'Editor') AND r.is_active = 1;

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_renew_expiration'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator', 'Editor') AND r.is_active = 1;

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_revoke_expiration'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator') AND r.is_active = 1;

-- Create trigger for audit logging
DELIMITER //

CREATE TRIGGER audit_expiration_rules
AFTER UPDATE ON expiration_rules
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status OR OLD.expires_at != NEW.expires_at THEN
        INSERT INTO audit_log (
            table_name, operation, record_id, user_id, timestamp, 
            old_values, new_values, metadata
        ) VALUES (
            'expiration_rules', 'UPDATE', NEW.id, NEW.created_by, NOW(),
            JSON_OBJECT('status', OLD.status, 'expires_at', OLD.expires_at, 'renewal_count', OLD.renewal_count),
            JSON_OBJECT('status', NEW.status, 'expires_at', NEW.expires_at, 'renewal_count', NEW.renewal_count),
            JSON_OBJECT('operation_type', 'expiration_management')
        );
    END IF;
END //

DELIMITER ;