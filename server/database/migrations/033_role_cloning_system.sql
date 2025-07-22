-- Migration 033: Role Cloning System
-- Adds comprehensive role cloning functionality to the RBAC system

-- Add clone metadata columns to roles table
ALTER TABLE roles 
ADD COLUMN cloned_from VARCHAR(255) NULL,
ADD COLUMN clone_count INTEGER DEFAULT 0,
ADD COLUMN template_version VARCHAR(50) NULL,
ADD COLUMN custom_properties JSON NULL,
ADD INDEX idx_roles_cloned_from (cloned_from),
ADD INDEX idx_roles_clone_count (clone_count DESC);

-- Create clone operations tracking table
CREATE TABLE clone_operations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operation_id VARCHAR(255) NOT NULL UNIQUE,
    source_role_id VARCHAR(255) NOT NULL,
    cloned_role_id VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    cloned_by VARCHAR(255) NOT NULL,
    permissions_cloned INTEGER NOT NULL DEFAULT 0,
    permissions_skipped INTEGER NOT NULL DEFAULT 0,
    conflicts_json JSON NULL,
    metadata JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_clone_ops_operation_id (operation_id),
    INDEX idx_clone_ops_source_role (source_role_id),
    INDEX idx_clone_ops_cloned_role (cloned_role_id),
    INDEX idx_clone_ops_timestamp (timestamp DESC),
    INDEX idx_clone_ops_cloned_by (cloned_by),
    
    FOREIGN KEY (source_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (cloned_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (cloned_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create role templates view for commonly cloned roles
CREATE VIEW role_templates AS
SELECT 
    r.*,
    r.clone_count as template_usage_count,
    COUNT(co.id) as actual_clone_count,
    MAX(co.timestamp) as last_cloned_at
FROM roles r
LEFT JOIN clone_operations co ON r.id = co.source_role_id
WHERE r.is_active = 1 
  AND (r.clone_count > 0 OR COUNT(co.id) > 0)
GROUP BY r.id
HAVING template_usage_count > 0 OR actual_clone_count > 0
ORDER BY template_usage_count DESC, actual_clone_count DESC, r.created_at DESC;

-- Create clone conflicts table for tracking resolution strategies
CREATE TABLE clone_conflicts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operation_id VARCHAR(255) NOT NULL,
    conflict_type ENUM('permission_scope_mismatch', 'permission_not_found', 'scope_incompatible', 'organization_mismatch') NOT NULL,
    permission_id VARCHAR(255) NULL,
    description TEXT NOT NULL,
    resolution ENUM('skip', 'adjust', 'manual_review') NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(255) NULL,
    resolved_at DATETIME NULL,
    resolution_notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_clone_conflicts_operation (operation_id),
    INDEX idx_clone_conflicts_type (conflict_type),
    INDEX idx_clone_conflicts_permission (permission_id),
    INDEX idx_clone_conflicts_resolved (resolved),
    
    FOREIGN KEY (operation_id) REFERENCES clone_operations(operation_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create role clone history view
CREATE VIEW role_clone_history AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.cloned_from,
    r.clone_count,
    
    -- Roles cloned from this role
    GROUP_CONCAT(
        DISTINCT CONCAT(
            co.cloned_role_id, ':', 
            cr.name, ':', 
            DATE_FORMAT(co.timestamp, '%Y-%m-%d %H:%i:%s'), ':', 
            co.cloned_by
        ) SEPARATOR '||'
    ) as cloned_to_data,
    
    -- Clone statistics
    COUNT(DISTINCT co.cloned_role_id) as direct_clones,
    MAX(co.timestamp) as last_cloned_at,
    
    -- Template usage statistics
    CASE 
        WHEN COUNT(DISTINCT co.cloned_role_id) > 0 THEN COUNT(DISTINCT co.cloned_role_id)
        ELSE 0
    END as times_used_as_template

FROM roles r
LEFT JOIN clone_operations co ON r.id = co.source_role_id
LEFT JOIN roles cr ON co.cloned_role_id = cr.id
WHERE r.is_active = 1
GROUP BY r.id, r.name, r.cloned_from, r.clone_count;

-- Create indexes for performance optimization
CREATE INDEX idx_roles_metadata_search ON roles(name, scope, organization_id) WHERE is_active = 1;
CREATE INDEX idx_clone_ops_audit_search ON clone_operations(timestamp, cloned_by, source_role_id);

-- Create stored procedure for safe role cloning with validation
DELIMITER //

CREATE PROCEDURE CloneRoleWithValidation(
    IN p_source_role_id VARCHAR(255),
    IN p_target_name VARCHAR(100),
    IN p_target_description TEXT,
    IN p_target_scope ENUM('global', 'organization', 'team'),
    IN p_organization_id VARCHAR(255),
    IN p_cloned_by VARCHAR(255),
    IN p_permissions JSON,
    OUT p_cloned_role_id VARCHAR(255),
    OUT p_operation_id VARCHAR(255),
    OUT p_error_message TEXT
)
BEGIN
    DECLARE v_role_exists INT DEFAULT 0;
    DECLARE v_name_exists INT DEFAULT 0;
    DECLARE v_permission_count INT DEFAULT 0;
    DECLARE v_timestamp DATETIME;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            p_error_message = MESSAGE_TEXT;
        SET p_cloned_role_id = NULL;
        SET p_operation_id = NULL;
    END;

    SET p_error_message = NULL;
    SET v_timestamp = NOW();
    SET p_operation_id = CONCAT('clone_', UNIX_TIMESTAMP(v_timestamp), '_', CONNECTION_ID());
    SET p_cloned_role_id = CONCAT('role_', UNIX_TIMESTAMP(v_timestamp), '_', SUBSTRING(MD5(RAND()), 1, 8));

    START TRANSACTION;

    -- Validate source role exists
    SELECT COUNT(*) INTO v_role_exists 
    FROM roles 
    WHERE id = p_source_role_id AND is_active = 1;

    IF v_role_exists = 0 THEN
        SET p_error_message = 'Source role not found or inactive';
        ROLLBACK;
        LEAVE;
    END IF;

    -- Check for name conflicts
    SELECT COUNT(*) INTO v_name_exists
    FROM roles 
    WHERE name = p_target_name 
      AND (organization_id = p_organization_id OR scope = 'global') 
      AND is_active = 1;

    IF v_name_exists > 0 THEN
        SET p_error_message = 'Role name already exists in the specified scope';
        ROLLBACK;
        LEAVE;
    END IF;

    -- Validate permissions
    SELECT JSON_LENGTH(p_permissions) INTO v_permission_count;
    IF v_permission_count = 0 THEN
        SET p_error_message = 'At least one permission must be included';
        ROLLBACK;
        LEAVE;
    END IF;

    -- Create the cloned role
    INSERT INTO roles (
        id, name, description, scope, organization_id, created_by, is_active,
        cloned_from, clone_count, created_at, updated_at
    ) VALUES (
        p_cloned_role_id, p_target_name, p_target_description, p_target_scope,
        p_organization_id, p_cloned_by, 1,
        p_source_role_id, 0, v_timestamp, v_timestamp
    );

    -- Insert permissions (assuming p_permissions is a JSON array of permission IDs)
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT p_cloned_role_id, JSON_UNQUOTE(JSON_EXTRACT(p_permissions, CONCAT('$[', seq.seq, ']')))
    FROM (
        SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
        SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
        SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
    ) seq
    WHERE seq.seq < JSON_LENGTH(p_permissions);

    -- Update source role clone count
    UPDATE roles 
    SET clone_count = COALESCE(clone_count, 0) + 1 
    WHERE id = p_source_role_id;

    -- Record the clone operation
    INSERT INTO clone_operations (
        operation_id, source_role_id, cloned_role_id, timestamp, cloned_by,
        permissions_cloned, permissions_skipped
    ) VALUES (
        p_operation_id, p_source_role_id, p_cloned_role_id, v_timestamp, p_cloned_by,
        v_permission_count, 0
    );

    COMMIT;

END //

DELIMITER ;

-- Grant appropriate permissions for role cloning
-- These would be added to the permissions table separately

-- Insert audit trigger for role cloning operations
DELIMITER //

CREATE TRIGGER audit_role_clone
AFTER INSERT ON clone_operations
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name, operation, record_id, user_id, timestamp, 
        old_values, new_values, metadata
    ) VALUES (
        'clone_operations', 'INSERT', NEW.operation_id, NEW.cloned_by, NEW.timestamp,
        NULL, 
        JSON_OBJECT(
            'operation_id', NEW.operation_id,
            'source_role_id', NEW.source_role_id,
            'cloned_role_id', NEW.cloned_role_id,
            'permissions_cloned', NEW.permissions_cloned,
            'permissions_skipped', NEW.permissions_skipped
        ),
        JSON_OBJECT('operation_type', 'role_clone')
    );
END //

DELIMITER ;

-- Create cleanup procedure for old clone operations (data retention)
DELIMITER //

CREATE PROCEDURE CleanupOldCloneOperations(
    IN p_retention_days INT DEFAULT 365
)
BEGIN
    DECLARE v_cutoff_date DATETIME;
    DECLARE v_deleted_count INT DEFAULT 0;
    
    SET v_cutoff_date = DATE_SUB(NOW(), INTERVAL p_retention_days DAY);
    
    -- Delete old clone conflicts first (due to FK constraint)
    DELETE FROM clone_conflicts 
    WHERE operation_id IN (
        SELECT operation_id FROM clone_operations 
        WHERE timestamp < v_cutoff_date
    );
    
    -- Delete old clone operations
    DELETE FROM clone_operations 
    WHERE timestamp < v_cutoff_date;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    SELECT CONCAT('Cleaned up ', v_deleted_count, ' clone operations older than ', p_retention_days, ' days') as result;
END //

DELIMITER ;

-- Initial data for testing (optional)
INSERT INTO permissions (id, name, resource, action, scope, description, category, is_active) VALUES
('perm_clone_roles', 'Clone Roles', 'roles', 'clone', 'organization', 'Create new roles by cloning existing ones', 'Administration', 1),
('perm_view_clone_history', 'View Clone History', 'roles', 'read_history', 'organization', 'View role cloning history and operations', 'Administration', 1),
('perm_manage_role_templates', 'Manage Role Templates', 'roles', 'manage_templates', 'organization', 'Create and manage role templates for cloning', 'Administration', 1)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- Add role cloning permissions to admin roles
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_clone_roles'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator') AND r.is_active = 1;

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_view_clone_history'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator') AND r.is_active = 1;

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_manage_role_templates'
FROM roles r 
WHERE r.name IN ('Administrator', 'Super Administrator') AND r.is_active = 1;