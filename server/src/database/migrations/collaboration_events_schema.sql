-- Collaboration Events Schema for Epic 23 Telemetry
-- Database migration to support comprehensive collaboration telemetry tracking

-- Main collaboration events table
CREATE TABLE IF NOT EXISTS collaboration_events (
    id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NULL,
    resource_id VARCHAR(36) NULL,
    session_id VARCHAR(36) NOT NULL,
    timestamp DATETIME NOT NULL,
    event_data JSON NOT NULL,
    context_data JSON NOT NULL,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_type (event_type),
    INDEX idx_user_id (user_id),
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_session_id (session_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_composite_workspace_time (workspace_id, timestamp),
    INDEX idx_composite_user_time (user_id, timestamp)
);

-- Collaboration sessions tracking table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NULL,
    resource_id VARCHAR(36) NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    last_activity DATETIME NOT NULL,
    activity_count INT DEFAULT 0,
    presence_status VARCHAR(50) DEFAULT 'active',
    device_type VARCHAR(20) NULL,
    user_agent TEXT NULL,
    client_version VARCHAR(50) NULL,
    connection_quality VARCHAR(20) NULL,
    session_quality VARCHAR(50) NULL,
    duration_ms BIGINT NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_start_time (start_time),
    INDEX idx_active_sessions (workspace_id, end_time), -- For finding active sessions (end_time IS NULL)
    
    CONSTRAINT fk_collaboration_sessions_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Real-time presence tracking
CREATE TABLE IF NOT EXISTS collaboration_presence (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36) NOT NULL,
    presence_status VARCHAR(50) NOT NULL,
    cursor_x FLOAT NULL,
    cursor_y FLOAT NULL,
    viewport_id VARCHAR(36) NULL,
    selected_elements JSON NULL,
    last_activity DATETIME NOT NULL,
    activity_type VARCHAR(50) NULL,
    presence_duration_ms BIGINT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_id (session_id),
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity),
    INDEX idx_active_presence (workspace_id, presence_status), -- For finding active users
    
    CONSTRAINT fk_collaboration_presence_session 
        FOREIGN KEY (session_id) REFERENCES collaboration_sessions(session_id) ON DELETE CASCADE
);

-- Conflict resolution tracking
CREATE TABLE IF NOT EXISTS collaboration_conflicts (
    conflict_id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    conflict_type VARCHAR(100) NOT NULL,
    involved_users JSON NOT NULL, -- Array of user IDs
    resolution_strategy VARCHAR(100) NOT NULL,
    triggered_at DATETIME NOT NULL,
    resolved_at DATETIME NULL,
    resolution_time_ms BIGINT NULL,
    conflict_complexity VARCHAR(20) NOT NULL,
    automated_resolution BOOLEAN NOT NULL,
    user_intervention_required BOOLEAN NOT NULL,
    data_integrity_maintained BOOLEAN NOT NULL,
    resolution_successful BOOLEAN NULL,
    conflict_data JSON NOT NULL, -- Detailed conflict information
    
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_triggered_at (triggered_at),
    INDEX idx_conflict_type (conflict_type),
    INDEX idx_resolution_strategy (resolution_strategy),
    INDEX idx_resolution_performance (resolution_time_ms, conflict_complexity),
    
    CONSTRAINT fk_collaboration_conflicts_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Comments and communication tracking
CREATE TABLE IF NOT EXISTS collaboration_comments (
    comment_id VARCHAR(36) PRIMARY KEY,
    thread_id VARCHAR(36) NOT NULL,
    parent_comment_id VARCHAR(36) NULL,
    workspace_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NULL,
    target_element_id VARCHAR(36) NULL, -- Node/edge being commented on
    user_id VARCHAR(36) NOT NULL,
    comment_length INT NOT NULL,
    mentioned_users JSON NULL, -- Array of mentioned user IDs
    attachment_count INT DEFAULT 0,
    is_reply BOOLEAN DEFAULT FALSE,
    thread_depth INT NOT NULL,
    created_at DATETIME NOT NULL,
    resolved_at DATETIME NULL,
    resolution_method VARCHAR(50) NULL,
    
    INDEX idx_thread_id (thread_id),
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_target_element (target_element_id),
    INDEX idx_resolved_comments (resolved_at),
    
    CONSTRAINT fk_collaboration_comments_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_collaboration_comments_parent 
        FOREIGN KEY (parent_comment_id) REFERENCES collaboration_comments(comment_id) ON DELETE CASCADE
);

-- Review and approval workflow tracking
CREATE TABLE IF NOT EXISTS collaboration_reviews (
    review_id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    reviewee_id VARCHAR(36) NOT NULL,
    reviewer_ids JSON NOT NULL, -- Array of reviewer user IDs
    review_type VARCHAR(50) NOT NULL,
    change_summary JSON NOT NULL, -- Object with nodes/edges added/modified/deleted
    review_criteria JSON NULL, -- Array of criteria
    urgency_level VARCHAR(20) NOT NULL,
    estimated_review_time_ms BIGINT NULL,
    actual_review_time_ms BIGINT NULL,
    created_at DATETIME NOT NULL,
    submitted_at DATETIME NULL,
    completed_at DATETIME NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    feedback_provided BOOLEAN DEFAULT FALSE,
    revisions_required BOOLEAN DEFAULT FALSE,
    approval_decision VARCHAR(20) NULL, -- approved, rejected, needs_revision
    
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_reviewee_id (reviewee_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_urgency_level (urgency_level),
    INDEX idx_review_type (review_type),
    
    CONSTRAINT fk_collaboration_reviews_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Performance metrics tracking
CREATE TABLE IF NOT EXISTS collaboration_performance_metrics (
    id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NULL,
    user_id VARCHAR(36) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    performance_tier VARCHAR(20) NOT NULL,
    network_connection_type VARCHAR(20) NULL,
    network_bandwidth FLOAT NULL,
    network_latency FLOAT NULL,
    network_packet_loss FLOAT NULL,
    geographic_region VARCHAR(50) NULL,
    server_region VARCHAR(50) NULL,
    measured_at DATETIME NOT NULL,
    warning_threshold FLOAT NULL,
    critical_threshold FLOAT NULL,
    
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_metric_type (metric_type),
    INDEX idx_measured_at (measured_at),
    INDEX idx_performance_tier (performance_tier),
    INDEX idx_composite_workspace_metric_time (workspace_id, metric_type, measured_at),
    
    CONSTRAINT fk_collaboration_performance_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- User engagement and feature usage tracking
CREATE TABLE IF NOT EXISTS collaboration_user_engagement (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36) NOT NULL,
    feature_name VARCHAR(100) NULL,
    discovery_method VARCHAR(50) NULL,
    interaction_type VARCHAR(50) NULL,
    time_spent_seconds INT NULL,
    satisfaction_rating INT NULL CHECK (satisfaction_rating BETWEEN 1 AND 5),
    feedback_category VARCHAR(50) NULL,
    improvement_suggestion TEXT NULL,
    activity_feed_items_viewed INT NULL,
    recorded_at DATETIME NOT NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_feature_name (feature_name),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_satisfaction_rating (satisfaction_rating),
    
    CONSTRAINT fk_collaboration_engagement_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Epic 23 success criteria tracking summary
CREATE TABLE IF NOT EXISTS epic23_success_metrics (
    id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NULL, -- NULL for global metrics
    metric_name VARCHAR(100) NOT NULL,
    current_value FLOAT NOT NULL,
    target_value FLOAT NOT NULL,
    measurement_unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- on_track, at_risk, failing
    measured_at DATETIME NOT NULL,
    measurement_period VARCHAR(20) NOT NULL, -- hourly, daily, weekly
    data_points_count INT NOT NULL,
    confidence_level FLOAT NULL, -- 0.0 to 1.0
    trend_direction VARCHAR(20) NULL, -- improving, stable, declining
    
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_metric_name (metric_name),
    INDEX idx_measured_at (measured_at),
    INDEX idx_status (status),
    INDEX idx_measurement_period (measurement_period),
    
    UNIQUE KEY unique_workspace_metric_period (workspace_id, metric_name, measurement_period),
    
    CONSTRAINT fk_epic23_metrics_workspace 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Indexes for high-performance querying

-- Real-time dashboard queries
CREATE INDEX idx_collaboration_realtime_dashboard 
ON collaboration_events (workspace_id, timestamp DESC, event_type);

-- Session analytics
CREATE INDEX idx_session_analytics 
ON collaboration_sessions (workspace_id, start_time DESC) 
WHERE end_time IS NOT NULL;

-- Active sessions query optimization  
CREATE INDEX idx_active_sessions 
ON collaboration_sessions (workspace_id, last_activity DESC) 
WHERE end_time IS NULL;

-- Performance metrics analysis
CREATE INDEX idx_performance_analysis 
ON collaboration_performance_metrics (metric_type, measured_at DESC, workspace_id);

-- Conflict resolution analysis
CREATE INDEX idx_conflict_analysis 
ON collaboration_conflicts (workspace_id, triggered_at DESC, resolution_successful);

-- User engagement analysis
CREATE INDEX idx_engagement_analysis 
ON collaboration_user_engagement (workspace_id, recorded_at DESC, feature_name);

-- Epic 23 success tracking
CREATE INDEX idx_epic23_tracking 
ON epic23_success_metrics (metric_name, measured_at DESC, status);

-- Views for common queries

-- Active collaboration sessions view
CREATE VIEW active_collaboration_sessions AS
SELECT 
    cs.*,
    cp.presence_status,
    cp.last_activity as presence_last_activity,
    cp.cursor_x,
    cp.cursor_y,
    TIMESTAMPDIFF(SECOND, cs.start_time, NOW()) as session_duration_seconds
FROM collaboration_sessions cs
LEFT JOIN collaboration_presence cp ON cs.session_id = cp.session_id
WHERE cs.end_time IS NULL
  AND cp.last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE);

-- Workspace collaboration health view
CREATE VIEW workspace_collaboration_health AS
SELECT 
    workspace_id,
    COUNT(DISTINCT user_id) as active_collaborators,
    COUNT(*) as active_sessions,
    AVG(activity_count) as avg_activity_per_session,
    MAX(last_activity) as most_recent_activity,
    COUNT(DISTINCT CASE WHEN presence_status = 'active' THEN user_id END) as actively_editing_users
FROM active_collaboration_sessions
GROUP BY workspace_id;

-- Epic 23 success criteria dashboard view
CREATE VIEW epic23_success_dashboard AS
SELECT 
    metric_name,
    AVG(current_value) as avg_current_value,
    MAX(target_value) as target_value,
    measurement_unit,
    CASE 
        WHEN AVG(current_value) >= MAX(target_value) THEN 'on_track'
        WHEN AVG(current_value) >= MAX(target_value) * 0.8 THEN 'at_risk'
        ELSE 'failing'
    END as overall_status,
    COUNT(*) as workspace_count,
    MAX(measured_at) as last_measured
FROM epic23_success_metrics
WHERE measured_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY metric_name, measurement_unit;

-- Performance optimization procedures

DELIMITER //

-- Procedure to cleanup old collaboration events (data retention)
CREATE PROCEDURE CleanupOldCollaborationEvents(IN retention_days INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(100);
    DECLARE tables_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME LIKE 'collaboration_%'
          AND TABLE_NAME != 'collaboration_sessions'; -- Keep sessions for historical analysis
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN tables_cursor;
    
    cleanup_loop: LOOP
        FETCH tables_cursor INTO table_name;
        IF done THEN
            LEAVE cleanup_loop;
        END IF;
        
        SET @sql = CONCAT(
            'DELETE FROM ', table_name, 
            ' WHERE created_at < DATE_SUB(NOW(), INTERVAL ', retention_days, ' DAY)'
        );
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT ROW_COUNT() as rows_deleted, table_name;
        
    END LOOP;
    
    CLOSE tables_cursor;
END //

-- Procedure to update Epic 23 success metrics
CREATE PROCEDURE UpdateEpic23SuccessMetrics()
BEGIN
    -- Real-time latency metric
    INSERT INTO epic23_success_metrics (
        id, workspace_id, metric_name, current_value, target_value, 
        measurement_unit, status, measured_at, measurement_period, 
        data_points_count, confidence_level
    )
    SELECT 
        UUID(),
        cpm.workspace_id,
        'real_time_latency_p95',
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cpm.metric_value),
        150.0,
        'ms',
        CASE 
            WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cpm.metric_value) <= 150 THEN 'on_track'
            WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cpm.metric_value) <= 225 THEN 'at_risk'
            ELSE 'failing'
        END,
        NOW(),
        'hourly',
        COUNT(*),
        CASE WHEN COUNT(*) >= 100 THEN 1.0 ELSE COUNT(*) / 100.0 END
    FROM collaboration_performance_metrics cpm
    WHERE cpm.metric_type = 'latency'
      AND cpm.measured_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    GROUP BY cpm.workspace_id
    ON DUPLICATE KEY UPDATE
        current_value = VALUES(current_value),
        status = VALUES(status),
        measured_at = VALUES(measured_at),
        data_points_count = VALUES(data_points_count),
        confidence_level = VALUES(confidence_level);

    -- Conflict resolution success rate
    INSERT INTO epic23_success_metrics (
        id, workspace_id, metric_name, current_value, target_value, 
        measurement_unit, status, measured_at, measurement_period, 
        data_points_count, confidence_level
    )
    SELECT 
        UUID(),
        cc.workspace_id,
        'conflict_resolution_success_rate',
        AVG(CASE WHEN cc.resolution_successful THEN 1.0 ELSE 0.0 END),
        0.99,
        'percentage',
        CASE 
            WHEN AVG(CASE WHEN cc.resolution_successful THEN 1.0 ELSE 0.0 END) >= 0.99 THEN 'on_track'
            WHEN AVG(CASE WHEN cc.resolution_successful THEN 1.0 ELSE 0.0 END) >= 0.95 THEN 'at_risk'
            ELSE 'failing'
        END,
        NOW(),
        'hourly',
        COUNT(*),
        CASE WHEN COUNT(*) >= 10 THEN 1.0 ELSE COUNT(*) / 10.0 END
    FROM collaboration_conflicts cc
    WHERE cc.resolved_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND cc.resolved_at IS NOT NULL
    GROUP BY cc.workspace_id
    ON DUPLICATE KEY UPDATE
        current_value = VALUES(current_value),
        status = VALUES(status),
        measured_at = VALUES(measured_at),
        data_points_count = VALUES(data_points_count),
        confidence_level = VALUES(confidence_level);

END //

DELIMITER ;

-- Create events to run maintenance procedures
CREATE EVENT IF NOT EXISTS cleanup_collaboration_events
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL CleanupOldCollaborationEvents(90); -- Keep 90 days of data

CREATE EVENT IF NOT EXISTS update_epic23_metrics  
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO CALL UpdateEpic23SuccessMetrics();

-- Grant necessary permissions (adjust as needed for your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON collaboration_* TO 'promptscape_app'@'%';
-- GRANT EXECUTE ON PROCEDURE CleanupOldCollaborationEvents TO 'promptscape_app'@'%';
-- GRANT EXECUTE ON PROCEDURE UpdateEpic23SuccessMetrics TO 'promptscape_app'@'%';