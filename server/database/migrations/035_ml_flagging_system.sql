-- Migration 035: ML-Based Flagging System
-- Comprehensive machine learning-based content and security flagging

-- Create ML models table
CREATE TABLE ml_models (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    category ENUM(
        'content_moderation', 'security_threat', 'compliance_violation',
        'anomaly_detection', 'prompt_injection', 'data_leak', 'malware', 'phishing'
    ) NOT NULL,
    description TEXT NULL,
    endpoint VARCHAR(500) NULL COMMENT 'API endpoint for external ML models',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    accuracy DECIMAL(5,4) NULL COMMENT 'Model accuracy score (0.0000-1.0000)',
    configuration JSON NULL COMMENT 'Model-specific configuration',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ml_models_category (category),
    INDEX idx_ml_models_active (is_active),
    INDEX idx_ml_models_version (version),
    
    UNIQUE KEY uk_ml_models_category_version (category, version)
);

-- Create ML flagging events table
CREATE TABLE ml_flagging_events (
    id VARCHAR(255) PRIMARY KEY,
    request_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'json', 'graph', 'prompt', 'code') NOT NULL,
    user_id VARCHAR(255) NULL,
    organization_id VARCHAR(255) NULL,
    
    -- Flagging results
    flagged BOOLEAN NOT NULL DEFAULT FALSE,
    confidence DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
    recommended_action ENUM('allow', 'warn', 'block', 'review', 'quarantine') NOT NULL DEFAULT 'allow',
    explanation TEXT NOT NULL,
    categories JSON NULL COMMENT 'Array of flagged categories with details',
    
    -- Processing metadata
    processing_time INTEGER NOT NULL DEFAULT 0 COMMENT 'Processing time in milliseconds',
    fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
    model_version VARCHAR(50) NULL,
    
    -- Event lifecycle
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Review workflow
    review_status ENUM('pending', 'approved', 'rejected', 'escalated') NULL,
    reviewed_by VARCHAR(255) NULL,
    reviewed_at DATETIME NULL,
    review_notes TEXT NULL,
    
    INDEX idx_ml_flagging_events_request (request_id),
    INDEX idx_ml_flagging_events_user (user_id),
    INDEX idx_ml_flagging_events_org (organization_id),
    INDEX idx_ml_flagging_events_flagged (flagged, confidence),
    INDEX idx_ml_flagging_events_timestamp (timestamp DESC),
    INDEX idx_ml_flagging_events_risk (risk_level, recommended_action),
    INDEX idx_ml_flagging_events_processing (processed, timestamp),
    INDEX idx_ml_flagging_events_review (review_status, reviewed_at),
    INDEX idx_ml_flagging_events_content_type (content_type),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_ml_flagging_events_confidence 
        CHECK (confidence >= 0.0000 AND confidence <= 1.0000),
    CONSTRAINT chk_ml_flagging_events_processing_time 
        CHECK (processing_time >= 0)
);

-- Create ML flagging rules table for custom rule-based detection
CREATE TABLE ml_flagging_rules (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM(
        'content_moderation', 'security_threat', 'compliance_violation',
        'anomaly_detection', 'prompt_injection', 'data_leak', 'malware', 'phishing'
    ) NOT NULL,
    pattern TEXT NOT NULL COMMENT 'Regular expression or pattern to match',
    pattern_type ENUM('regex', 'keyword', 'phrase', 'ml_feature') NOT NULL DEFAULT 'regex',
    confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0.8000,
    severity ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    description TEXT NULL,
    organization_id VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ml_flagging_rules_category (category),
    INDEX idx_ml_flagging_rules_active (is_active),
    INDEX idx_ml_flagging_rules_org (organization_id),
    INDEX idx_ml_flagging_rules_created_by (created_by),
    INDEX idx_ml_flagging_rules_pattern_type (pattern_type),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_ml_flagging_rules_confidence 
        CHECK (confidence_score >= 0.0000 AND confidence_score <= 1.0000)
);

-- Create ML flagging configurations table
CREATE TABLE ml_flagging_config (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) NULL,
    
    -- Feature toggles
    enable_content_moderation BOOLEAN NOT NULL DEFAULT TRUE,
    enable_security_threat_detection BOOLEAN NOT NULL DEFAULT TRUE,
    enable_compliance_checking BOOLEAN NOT NULL DEFAULT FALSE,
    enable_anomaly_detection BOOLEAN NOT NULL DEFAULT FALSE,
    enable_prompt_injection_detection BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Thresholds
    confidence_threshold DECIMAL(5,4) NOT NULL DEFAULT 0.7000,
    auto_action_threshold DECIMAL(5,4) NOT NULL DEFAULT 0.9000,
    
    -- Model endpoints
    content_moderation_endpoint VARCHAR(500) NULL,
    security_threat_endpoint VARCHAR(500) NULL,
    compliance_endpoint VARCHAR(500) NULL,
    anomaly_endpoint VARCHAR(500) NULL,
    prompt_injection_endpoint VARCHAR(500) NULL,
    
    -- Fallback settings
    fallback_to_rule_based BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Notification settings
    notify_on_high_risk BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_critical_risk BOOLEAN NOT NULL DEFAULT TRUE,
    notification_webhook_url VARCHAR(500) NULL,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ml_flagging_config_org (organization_id),
    
    UNIQUE KEY uk_ml_flagging_config_org (organization_id),
    
    CONSTRAINT chk_ml_flagging_config_confidence_threshold 
        CHECK (confidence_threshold >= 0.0000 AND confidence_threshold <= 1.0000),
    CONSTRAINT chk_ml_flagging_config_auto_action_threshold 
        CHECK (auto_action_threshold >= 0.0000 AND auto_action_threshold <= 1.0000)
);

-- Create ML flagging metrics table for performance tracking
CREATE TABLE ml_flagging_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    organization_id VARCHAR(255) NULL,
    category ENUM(
        'content_moderation', 'security_threat', 'compliance_violation',
        'anomaly_detection', 'prompt_injection', 'data_leak', 'malware', 'phishing'
    ) NOT NULL,
    
    -- Volume metrics
    total_requests INTEGER NOT NULL DEFAULT 0,
    flagged_requests INTEGER NOT NULL DEFAULT 0,
    false_positives INTEGER NOT NULL DEFAULT 0,
    false_negatives INTEGER NOT NULL DEFAULT 0,
    
    -- Performance metrics
    avg_processing_time INTEGER NOT NULL DEFAULT 0,
    avg_confidence DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    model_accuracy DECIMAL(5,4) NULL,
    
    -- Action distribution
    actions_allow INTEGER NOT NULL DEFAULT 0,
    actions_warn INTEGER NOT NULL DEFAULT 0,
    actions_block INTEGER NOT NULL DEFAULT 0,
    actions_review INTEGER NOT NULL DEFAULT 0,
    actions_quarantine INTEGER NOT NULL DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ml_flagging_metrics_date (date DESC),
    INDEX idx_ml_flagging_metrics_org_date (organization_id, date),
    INDEX idx_ml_flagging_metrics_category_date (category, date),
    
    UNIQUE KEY uk_ml_flagging_metrics_date_org_category (date, organization_id, category)
);

-- Create views for common queries

-- Active flagging events view
CREATE VIEW active_flagging_events AS
SELECT 
    e.*,
    u.username as user_name,
    r.username as reviewer_name,
    CASE 
        WHEN e.confidence >= 0.9 THEN 'very_high'
        WHEN e.confidence >= 0.8 THEN 'high' 
        WHEN e.confidence >= 0.7 THEN 'medium'
        ELSE 'low'
    END as confidence_level,
    TIMESTAMPDIFF(HOUR, e.timestamp, NOW()) as hours_since_flagged
FROM ml_flagging_events e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN users r ON e.reviewed_by = r.id
WHERE e.flagged = 1 
  AND (e.review_status IS NULL OR e.review_status = 'pending')
ORDER BY e.risk_level DESC, e.confidence DESC, e.timestamp DESC;

-- Flagging dashboard view
CREATE VIEW flagging_dashboard AS
SELECT 
    COALESCE(e.organization_id, 'global') as organization_id,
    DATE(e.timestamp) as date,
    COUNT(*) as total_events,
    SUM(CASE WHEN e.flagged = 1 THEN 1 ELSE 0 END) as flagged_events,
    ROUND(AVG(e.confidence), 4) as avg_confidence,
    ROUND(AVG(e.processing_time), 0) as avg_processing_time,
    SUM(CASE WHEN e.risk_level = 'critical' THEN 1 ELSE 0 END) as critical_count,
    SUM(CASE WHEN e.risk_level = 'high' THEN 1 ELSE 0 END) as high_count,
    SUM(CASE WHEN e.risk_level = 'medium' THEN 1 ELSE 0 END) as medium_count,
    SUM(CASE WHEN e.risk_level = 'low' THEN 1 ELSE 0 END) as low_count,
    SUM(CASE WHEN e.fallback_used = 1 THEN 1 ELSE 0 END) as fallback_used_count
FROM ml_flagging_events e
WHERE e.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY COALESCE(e.organization_id, 'global'), DATE(e.timestamp)
ORDER BY date DESC, organization_id;

-- Model performance view
CREATE VIEW model_performance AS
SELECT 
    m.id,
    m.name,
    m.version,
    m.category,
    m.accuracy,
    COUNT(e.id) as total_uses,
    ROUND(AVG(e.confidence), 4) as avg_confidence,
    ROUND(AVG(e.processing_time), 0) as avg_processing_time,
    SUM(CASE WHEN e.flagged = 1 THEN 1 ELSE 0 END) as flagged_count,
    MAX(e.timestamp) as last_used
FROM ml_models m
LEFT JOIN ml_flagging_events e ON m.version = e.model_version AND JSON_CONTAINS(e.categories, JSON_QUOTE(m.category))
WHERE m.is_active = 1
GROUP BY m.id, m.name, m.version, m.category, m.accuracy
ORDER BY m.category, total_uses DESC;

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to flag content with rule-based detection
CREATE PROCEDURE FlagContentRuleBased(
    IN p_content TEXT,
    IN p_content_type VARCHAR(50),
    IN p_user_id VARCHAR(255),
    IN p_organization_id VARCHAR(255),
    IN p_categories JSON,
    OUT p_event_id VARCHAR(255),
    OUT p_flagged BOOLEAN,
    OUT p_confidence DECIMAL(5,4),
    OUT p_risk_level VARCHAR(20)
)
BEGIN
    DECLARE v_rule_id VARCHAR(255);
    DECLARE v_pattern TEXT;
    DECLARE v_confidence DECIMAL(5,4);
    DECLARE v_category VARCHAR(50);
    DECLARE v_matches INTEGER DEFAULT 0;
    DECLARE v_max_confidence DECIMAL(5,4) DEFAULT 0.0000;
    DECLARE v_flagged_categories JSON DEFAULT JSON_ARRAY();
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE rule_cursor CURSOR FOR
        SELECT id, category, pattern, confidence_score
        FROM ml_flagging_rules 
        WHERE is_active = 1 
          AND (organization_id = p_organization_id OR organization_id IS NULL)
          AND category IN (SELECT JSON_UNQUOTE(JSON_EXTRACT(p_categories, CONCAT('$[', numbers.n, ']')))
                          FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) numbers
                          WHERE JSON_UNQUOTE(JSON_EXTRACT(p_categories, CONCAT('$[', numbers.n, ']'))) IS NOT NULL);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET p_event_id = CONCAT('event_', UNIX_TIMESTAMP(), '_', SUBSTRING(MD5(RAND()), 1, 8));
    SET p_flagged = FALSE;
    SET p_confidence = 0.0000;
    SET p_risk_level = 'low';
    
    OPEN rule_cursor;
    read_loop: LOOP
        FETCH rule_cursor INTO v_rule_id, v_category, v_pattern, v_confidence;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Simple pattern matching (in real implementation, would use proper regex engine)
        IF LOCATE(SUBSTRING(v_pattern, 2, LENGTH(v_pattern) - 2), p_content) > 0 THEN
            SET v_matches = v_matches + 1;
            SET v_max_confidence = GREATEST(v_max_confidence, v_confidence);
            SET v_flagged_categories = JSON_ARRAY_APPEND(v_flagged_categories, '$', JSON_OBJECT(
                'category', v_category,
                'confidence', v_confidence,
                'details', CONCAT('Rule-based detection: ', v_rule_id),
                'severity', CASE WHEN v_confidence > 0.8 THEN 'high' WHEN v_confidence > 0.6 THEN 'medium' ELSE 'low' END
            ));
        END IF;
    END LOOP;
    CLOSE rule_cursor;
    
    SET p_flagged = v_matches > 0;
    SET p_confidence = v_max_confidence;
    
    -- Calculate risk level
    SET p_risk_level = CASE 
        WHEN v_max_confidence > 0.9 AND v_matches > 1 THEN 'critical'
        WHEN v_max_confidence > 0.8 THEN 'high'
        WHEN v_max_confidence > 0.6 THEN 'medium'
        ELSE 'low'
    END;
    
    -- Insert flagging event
    INSERT INTO ml_flagging_events (
        id, request_id, content, content_type, user_id, organization_id,
        flagged, confidence, risk_level, recommended_action, explanation,
        categories, processing_time, fallback_used, timestamp, processed
    ) VALUES (
        p_event_id, 
        CONCAT('req_', UNIX_TIMESTAMP()),
        SUBSTRING(p_content, 1, 10000), -- Limit content size
        p_content_type,
        p_user_id,
        p_organization_id,
        p_flagged,
        p_confidence,
        p_risk_level,
        CASE p_risk_level
            WHEN 'critical' THEN 'quarantine'
            WHEN 'high' THEN 'block'
            WHEN 'medium' THEN 'warn'
            ELSE 'allow'
        END,
        CASE 
            WHEN v_matches = 0 THEN 'Content appears safe based on rule analysis.'
            ELSE CONCAT('Rule-based flagging detected ', v_matches, ' potential issues with ', ROUND(v_max_confidence * 100), '% confidence.')
        END,
        v_flagged_categories,
        0, -- Rule-based processing time
        TRUE, -- Fallback used
        NOW(),
        FALSE
    );
    
END //

-- Procedure to update daily metrics
CREATE PROCEDURE UpdateFlaggingMetrics(
    IN p_date DATE
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_org_id VARCHAR(255);
    DECLARE v_category VARCHAR(50);
    DECLARE org_cursor CURSOR FOR 
        SELECT DISTINCT COALESCE(organization_id, 'global') FROM ml_flagging_events 
        WHERE DATE(timestamp) = p_date;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Clear existing metrics for the date
    DELETE FROM ml_flagging_metrics WHERE date = p_date;
    
    OPEN org_cursor;
    org_loop: LOOP
        FETCH org_cursor INTO v_org_id;
        IF done THEN
            LEAVE org_loop;
        END IF;
        
        -- Insert metrics for each category
        INSERT INTO ml_flagging_metrics (
            date, organization_id, category, total_requests, flagged_requests,
            avg_processing_time, avg_confidence, actions_allow, actions_warn,
            actions_block, actions_review, actions_quarantine
        )
        SELECT 
            p_date,
            CASE WHEN v_org_id = 'global' THEN NULL ELSE v_org_id END,
            cat.category,
            COUNT(*),
            SUM(CASE WHEN e.flagged = 1 AND JSON_CONTAINS(e.categories, JSON_QUOTE(cat.category)) THEN 1 ELSE 0 END),
            ROUND(AVG(e.processing_time), 0),
            ROUND(AVG(CASE WHEN JSON_CONTAINS(e.categories, JSON_QUOTE(cat.category)) THEN e.confidence END), 4),
            SUM(CASE WHEN e.recommended_action = 'allow' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.recommended_action = 'warn' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.recommended_action = 'block' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.recommended_action = 'review' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.recommended_action = 'quarantine' THEN 1 ELSE 0 END)
        FROM (
            SELECT 'content_moderation' as category UNION
            SELECT 'security_threat' UNION
            SELECT 'compliance_violation' UNION
            SELECT 'anomaly_detection' UNION
            SELECT 'prompt_injection' UNION
            SELECT 'data_leak' UNION
            SELECT 'malware' UNION
            SELECT 'phishing'
        ) cat
        LEFT JOIN ml_flagging_events e ON DATE(e.timestamp) = p_date 
            AND (e.organization_id = CASE WHEN v_org_id = 'global' THEN NULL ELSE v_org_id END OR (e.organization_id IS NULL AND v_org_id = 'global'))
            AND JSON_CONTAINS(e.categories, JSON_QUOTE(cat.category))
        GROUP BY cat.category
        HAVING COUNT(*) > 0;
        
    END LOOP;
    CLOSE org_cursor;
    
END //

DELIMITER ;

-- Create indexes for performance
CREATE INDEX idx_ml_flagging_events_content_hash ON ml_flagging_events(user_id, organization_id, timestamp);
CREATE INDEX idx_ml_flagging_events_analytics ON ml_flagging_events(DATE(timestamp), organization_id, flagged, risk_level);

-- Insert default ML models
INSERT INTO ml_models (id, name, version, category, description, is_active, accuracy) VALUES
('model_content_mod_v1', 'Content Moderation Model', '1.0', 'content_moderation', 'Rule-based content moderation for harmful content detection', 1, 0.85),
('model_security_v1', 'Security Threat Detection', '1.0', 'security_threat', 'Detects SQL injection, XSS, and other security threats', 1, 0.92),
('model_prompt_injection_v1', 'Prompt Injection Detection', '1.0', 'prompt_injection', 'Identifies prompt injection and jailbreak attempts', 1, 0.88),
('model_data_leak_v1', 'Data Leak Detection', '1.0', 'data_leak', 'Detects potential data leaks including PII and credentials', 1, 0.75),
('model_compliance_v1', 'Compliance Checker', '1.0', 'compliance_violation', 'Checks for regulatory compliance violations', 1, 0.80);

-- Insert default flagging rules
INSERT INTO ml_flagging_rules (id, name, category, pattern, pattern_type, confidence_score, severity, description, is_active) VALUES
('rule_sql_injection_1', 'SQL Injection - Union Select', 'security_threat', '(?i).*union.*select.*from.*', 'regex', 0.9000, 'high', 'Detects basic SQL injection union select patterns', 1),
('rule_xss_script_1', 'XSS Script Tag', 'security_threat', '(?i).*<script.*>.*</script>.*', 'regex', 0.8500, 'high', 'Detects script tag based XSS attempts', 1),
('rule_prompt_ignore_1', 'Prompt Ignore Instructions', 'prompt_injection', '(?i).*ignore.*(previous|all|above).*instruction.*', 'regex', 0.8000, 'medium', 'Detects attempts to ignore previous instructions', 1),
('rule_email_leak_1', 'Email Address Leak', 'data_leak', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', 'regex', 0.6000, 'low', 'Detects potential email address leaks', 1),
('rule_ssn_leak_1', 'SSN Pattern', 'data_leak', '\\d{3}-\\d{2}-\\d{4}', 'regex', 0.8000, 'high', 'Detects Social Security Number patterns', 1),
('rule_hate_speech_1', 'Hate Speech Indicators', 'content_moderation', '(?i).*(hate|despise|loathe).*(race|religion|gender).*', 'regex', 0.7500, 'high', 'Detects potential hate speech patterns', 1),
('rule_violence_1', 'Violence Keywords', 'content_moderation', '(?i).*(bomb|explosive|weapon|kill|murder).*', 'regex', 0.7000, 'medium', 'Detects violent content keywords', 1);

-- Insert default configuration
INSERT INTO ml_flagging_config (id, organization_id, confidence_threshold, auto_action_threshold) VALUES
('config_global', NULL, 0.7000, 0.9000);

-- Insert permissions for ML flagging
INSERT INTO permissions (id, name, resource, action, scope, description, category, is_active) VALUES
('perm_use_ml_flagging', 'Use ML Flagging', 'ml_flagging', 'use', 'own', 'Use ML-based content flagging system', 'ML & AI', 1),
('perm_view_ml_flagging', 'View ML Flagging Results', 'ml_flagging', 'read', 'organization', 'View flagging results and statistics', 'ML & AI', 1),
('perm_review_ml_flagging', 'Review Flagged Content', 'ml_flagging', 'review', 'organization', 'Review and approve flagged content', 'ML & AI', 1),
('perm_manage_ml_flagging', 'Manage ML Flagging System', 'ml_flagging', 'manage', 'organization', 'Configure ML flagging models and rules', 'ML & AI', 1)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- Add ML flagging permissions to admin roles
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id
FROM roles r 
CROSS JOIN permissions p
WHERE r.name IN ('Administrator', 'Super Administrator') 
  AND r.is_active = 1
  AND p.id LIKE 'perm_%ml_flagging%';

-- Add basic usage permission to editor roles
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, 'perm_use_ml_flagging'
FROM roles r 
WHERE r.name IN ('Editor') AND r.is_active = 1;

-- Create trigger for automatic metrics updates
DELIMITER //

CREATE TRIGGER update_flagging_metrics_trigger
AFTER INSERT ON ml_flagging_events
FOR EACH ROW
BEGIN
    -- Update daily metrics asynchronously (would be better handled by a background job)
    -- For now, just log the event for later processing
    INSERT INTO audit_log (
        table_name, operation, record_id, user_id, timestamp, 
        old_values, new_values, metadata
    ) VALUES (
        'ml_flagging_events', 'INSERT', NEW.id, NEW.user_id, NOW(),
        NULL,
        JSON_OBJECT(
            'flagged', NEW.flagged,
            'confidence', NEW.confidence,
            'risk_level', NEW.risk_level,
            'recommended_action', NEW.recommended_action
        ),
        JSON_OBJECT('operation_type', 'ml_flagging')
    );
END //

DELIMITER ;