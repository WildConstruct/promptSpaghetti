-- Epic 17 - Enforcement Tools Database Schema
-- Task: E17-1753114397376-1B07D9 - Develop enforcement tools
-- SQLite implementation for enforcement tools administrative interface

-- Violation reports table
CREATE TABLE IF NOT EXISTS violation_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(36) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'fraud', 'abuse', 'violation', 'security', 'quality'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed', 'appealed'
    
    -- Entity being reported
    user_id VARCHAR(255),
    template_id VARCHAR(255),
    transaction_id VARCHAR(255),
    
    -- Reporter information
    reporter_type VARCHAR(20) NOT NULL, -- 'automated', 'user', 'admin'
    reporter_id VARCHAR(255),
    
    -- Report content
    evidence TEXT DEFAULT '[]', -- JSON array of evidence
    description TEXT NOT NULL,
    
    -- Assignment and resolution
    assigned_to VARCHAR(255),
    resolution_json TEXT, -- JSON object with resolution details
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Enforcement policies table (if not exists from AutomatedEnforcementService)
CREATE TABLE IF NOT EXISTS enforcement_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Policy configuration (JSON objects)
    triggers_json TEXT DEFAULT '{}',
    actions_json TEXT DEFAULT '{}',
    exemptions_json TEXT DEFAULT '{}',
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appeals table for enforcement actions
CREATE TABLE IF NOT EXISTS enforcement_appeals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appeal_id VARCHAR(36) UNIQUE NOT NULL,
    action_id VARCHAR(36) NOT NULL, -- References enforcement_actions.action_id
    
    -- Appeal details
    appellant_id VARCHAR(255) NOT NULL,
    appellant_type VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
    reason TEXT NOT NULL,
    evidence TEXT DEFAULT '[]', -- JSON array
    
    -- Appeal status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'denied'
    assigned_to VARCHAR(255),
    
    -- Resolution
    resolution_reason TEXT,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (action_id) REFERENCES enforcement_actions(action_id)
);

-- Enhancement to existing enforcement_actions table (add new columns if needed)
-- These columns may already exist from AutomatedEnforcementService migration

-- Add approved_by column if it doesn't exist
ALTER TABLE enforcement_actions ADD COLUMN approved_by VARCHAR(255);

-- Add created_by column if it doesn't exist  
ALTER TABLE enforcement_actions ADD COLUMN created_by VARCHAR(255);

-- Add reversal tracking columns if they don't exist
ALTER TABLE enforcement_actions ADD COLUMN reversal_reason TEXT;
ALTER TABLE enforcement_actions ADD COLUMN reversed_by VARCHAR(255);
ALTER TABLE enforcement_actions ADD COLUMN reversed_at TIMESTAMP;

-- Enforcement action history for audit trail
CREATE TABLE IF NOT EXISTS enforcement_action_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id VARCHAR(36) NOT NULL,
    
    -- Change details
    change_type VARCHAR(20) NOT NULL, -- 'created', 'approved', 'reversed', 'updated'
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    
    -- Change metadata
    changed_by VARCHAR(255) NOT NULL,
    change_reason TEXT,
    change_notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Context
    change_context TEXT DEFAULT '{}', -- JSON object with additional context
    
    FOREIGN KEY (action_id) REFERENCES enforcement_actions(action_id)
);

-- Enforcement notifications/alerts table
CREATE TABLE IF NOT EXISTS enforcement_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id VARCHAR(36) UNIQUE NOT NULL,
    
    -- Notification details
    type VARCHAR(20) NOT NULL, -- 'action_required', 'alert', 'escalation'
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Target and context
    target_admin VARCHAR(255), -- If null, broadcast to all admins
    related_action_id VARCHAR(36),
    related_report_id VARCHAR(36),
    
    -- Status
    status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'dismissed'
    read_by VARCHAR(255),
    read_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Enforcement metrics aggregation table
CREATE TABLE IF NOT EXISTS enforcement_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    
    -- Daily counts
    total_actions INTEGER DEFAULT 0,
    automated_actions INTEGER DEFAULT 0,
    manual_actions INTEGER DEFAULT 0,
    
    -- Action type breakdown
    suspensions INTEGER DEFAULT 0,
    restrictions INTEGER DEFAULT 0,
    flags INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    quarantines INTEGER DEFAULT 0,
    
    -- Severity breakdown
    low_severity INTEGER DEFAULT 0,
    medium_severity INTEGER DEFAULT 0,
    high_severity INTEGER DEFAULT 0,
    critical_severity INTEGER DEFAULT 0,
    
    -- Effectiveness metrics
    reversals INTEGER DEFAULT 0,
    appeals INTEGER DEFAULT 0,
    successful_actions INTEGER DEFAULT 0,
    
    -- Response times (in minutes)
    avg_review_time REAL DEFAULT 0,
    avg_resolution_time REAL DEFAULT 0,
    
    -- Computed at end of day
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date)
);

-- Admin action log for enforcement tools usage
CREATE TABLE IF NOT EXISTS admin_enforcement_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(36) UNIQUE NOT NULL,
    
    -- Admin and action
    admin_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'view_dashboard', 'approve_action', 'create_manual', etc.
    
    -- Context
    target_entity_type VARCHAR(20),
    target_entity_id VARCHAR(255),
    related_action_id VARCHAR(36),
    
    -- Details
    action_details TEXT DEFAULT '{}', -- JSON
    result VARCHAR(20), -- 'success', 'failure', 'partial'
    error_message TEXT,
    
    -- Performance
    execution_time_ms INTEGER,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_violation_reports_status ON violation_reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_violation_reports_type_severity ON violation_reports(type, severity);
CREATE INDEX IF NOT EXISTS idx_violation_reports_assigned ON violation_reports(assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_enforcement_appeals_status ON enforcement_appeals(status, created_at);
CREATE INDEX IF NOT EXISTS idx_enforcement_appeals_action ON enforcement_appeals(action_id);

CREATE INDEX IF NOT EXISTS idx_enforcement_action_history_action ON enforcement_action_history(action_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_enforcement_action_history_type ON enforcement_action_history(change_type, changed_at);

CREATE INDEX IF NOT EXISTS idx_enforcement_notifications_target ON enforcement_notifications(target_admin, status);
CREATE INDEX IF NOT EXISTS idx_enforcement_notifications_type ON enforcement_notifications(type, created_at);

CREATE INDEX IF NOT EXISTS idx_enforcement_metrics_date ON enforcement_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_admin_enforcement_log_admin ON admin_enforcement_log(admin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_enforcement_log_action ON admin_enforcement_log(action, created_at);

-- Insert default enforcement policies if not exists
INSERT OR IGNORE INTO enforcement_policies (
    policy_id, 
    name, 
    description, 
    enabled,
    triggers_json,
    actions_json,
    exemptions_json,
    created_by
) VALUES (
    'default-manual-review',
    'Manual Review Policy',
    'Default policy requiring manual review for high-severity actions',
    1,
    '{"trustScoreThresholds":{"suspend":20,"restrict":35,"flag":55},"riskFactorRules":{"criticalRiskCount":1,"highRiskCount":2,"automaticSuspension":false}}',
    '{"autoSuspension":false,"autoRestriction":false,"autoFlagging":true,"requireManualReview":true,"notifyAdmins":true}',
    '{"highTrustUsers":true,"verifiedUsers":true,"whitelistedEntities":[]}',
    'system'
);

INSERT OR IGNORE INTO enforcement_policies (
    policy_id, 
    name, 
    description, 
    enabled,
    triggers_json,
    actions_json,
    exemptions_json,
    created_by
) VALUES (
    'critical-auto-enforcement',
    'Critical Auto-Enforcement',
    'Automatic enforcement for critical severity violations',
    1,
    '{"trustScoreThresholds":{"suspend":10,"restrict":25,"flag":40},"fraudDetectionRules":{"fraudScoreThreshold":85,"suspiciousIndicatorThreshold":5}}',
    '{"autoSuspension":true,"autoRestriction":true,"autoFlagging":true,"requireManualReview":false,"notifyAdmins":true}',
    '{"highTrustUsers":false,"verifiedUsers":false,"whitelistedEntities":[]}',
    'system'
);

-- Create view for enforcement dashboard
CREATE VIEW IF NOT EXISTS enforcement_dashboard_view AS
SELECT 
    -- Action counts
    COUNT(*) as total_actions,
    SUM(CASE WHEN review_required = 1 AND action_taken = 0 THEN 1 ELSE 0 END) as pending_reviews,
    SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as today_actions,
    SUM(CASE WHEN auto_applied = 1 THEN 1 ELSE 0 END) as automated_actions,
    SUM(CASE WHEN auto_applied = 0 THEN 1 ELSE 0 END) as manual_actions,
    
    -- Action type breakdown
    SUM(CASE WHEN action_type = 'suspend' THEN 1 ELSE 0 END) as suspensions,
    SUM(CASE WHEN action_type = 'restrict' THEN 1 ELSE 0 END) as restrictions,
    SUM(CASE WHEN action_type = 'flag' THEN 1 ELSE 0 END) as flags,
    SUM(CASE WHEN action_type = 'block_transaction' THEN 1 ELSE 0 END) as blocks,
    SUM(CASE WHEN action_type = 'quarantine_template' THEN 1 ELSE 0 END) as quarantines,
    
    -- Severity breakdown
    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity,
    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_severity,
    
    -- Effectiveness metrics
    SUM(CASE WHEN reversal_reason IS NOT NULL THEN 1 ELSE 0 END) as reversals
FROM enforcement_actions;