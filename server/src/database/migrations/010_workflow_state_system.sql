-- Epic 8.2.5 - Workflow State System Migration
-- Adds workflow state management fields to correction_rules table

-- Add workflow state columns to correction_rules table
ALTER TABLE correction_rules ADD COLUMN workflow_state VARCHAR(20) DEFAULT 'draft' CHECK (workflow_state IN ('draft', 'published', 'deprecated'));
ALTER TABLE correction_rules ADD COLUMN approved_by INTEGER;
ALTER TABLE correction_rules ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE correction_rules ADD COLUMN deprecated_at TIMESTAMP;
ALTER TABLE correction_rules ADD COLUMN deprecation_reason TEXT;

-- Add workflow suggestion fields
ALTER TABLE correction_rules ADD COLUMN suggested_by VARCHAR(255);
ALTER TABLE correction_rules ADD COLUMN suggestion_reason TEXT;
ALTER TABLE correction_rules ADD COLUMN suggestion_date TIMESTAMP;

-- Add categorization and tagging
ALTER TABLE correction_rules ADD COLUMN category VARCHAR(100);
ALTER TABLE correction_rules ADD COLUMN tags TEXT; -- JSON array of tags

-- Add usage tracking fields
ALTER TABLE correction_rules ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE correction_rules ADD COLUMN effectiveness_score REAL DEFAULT 0.0;
ALTER TABLE correction_rules ADD COLUMN user_rating REAL;

-- Add foreign key for approved_by
ALTER TABLE correction_rules ADD CONSTRAINT fk_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id);

-- Create indexes for workflow queries
CREATE INDEX IF NOT EXISTS idx_correction_rules_workflow_state ON correction_rules(workflow_state);
CREATE INDEX IF NOT EXISTS idx_correction_rules_category ON correction_rules(category);
CREATE INDEX IF NOT EXISTS idx_correction_rules_approved_at ON correction_rules(approved_at);
CREATE INDEX IF NOT EXISTS idx_correction_rules_deprecated_at ON correction_rules(deprecated_at);
CREATE INDEX IF NOT EXISTS idx_correction_rules_usage_count ON correction_rules(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_correction_rules_effectiveness ON correction_rules(effectiveness_score DESC);

-- Create workflow history table for audit trail
CREATE TABLE IF NOT EXISTS workflow_state_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    previous_state VARCHAR(20),
    new_state VARCHAR(20) NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    metadata TEXT, -- JSON for additional context
    
    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Create index for workflow history queries
CREATE INDEX IF NOT EXISTS idx_workflow_history_rule_id ON workflow_state_history(rule_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_history_changed_by ON workflow_state_history(changed_by, changed_at DESC);

-- Create notifications table for workflow events
CREATE TABLE IF NOT EXISTS workflow_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rule_id INTEGER,
    notification_type VARCHAR(50) NOT NULL, -- 'approval_requested', 'rule_approved', 'rule_deprecated', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata TEXT, -- JSON for additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_user_unread ON workflow_notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_rule ON workflow_notifications(rule_id);

-- Update existing rules to have appropriate workflow states
-- Active rules become 'published', inactive ones remain 'draft'
UPDATE correction_rules 
SET workflow_state = CASE 
    WHEN is_active = TRUE THEN 'published'
    ELSE 'draft'
END
WHERE workflow_state IS NULL;

-- Add sample notification for migration completion
INSERT INTO workflow_notifications (user_id, notification_type, title, message)
VALUES (1, 'system', 'Workflow System Activated', 'The workflow state system has been successfully enabled for correction rules.');