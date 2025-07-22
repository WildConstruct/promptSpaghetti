-- Epic 17 - Refund Processing Database Schema
-- Task: E17-1753114397360-84B238 - Create refund processing
-- SQLite implementation for marketplace refund processing system

-- Main refund requests table
CREATE TABLE IF NOT EXISTS refund_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    refund_id VARCHAR(36) UNIQUE NOT NULL,
    purchase_id VARCHAR(255) NOT NULL,
    requester_id VARCHAR(255) NOT NULL,
    requester_type VARCHAR(20) NOT NULL, -- 'customer', 'admin', 'system'
    
    -- Refund details
    reason VARCHAR(50) NOT NULL, -- RefundReason enum values
    amount INTEGER NOT NULL, -- Amount in cents
    refund_type VARCHAR(10) NOT NULL, -- 'full' or 'partial'
    description TEXT,
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'pending', -- RefundStatus enum values
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    assigned_to VARCHAR(255),
    
    -- Original purchase context (JSON object)
    original_purchase_json TEXT NOT NULL,
    
    -- Processing details
    approval_required BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    processed_at TIMESTAMP,
    stripe_refund_id VARCHAR(255),
    
    -- Creator impact (JSON object)
    creator_adjustment_json TEXT DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    escalated_at TIMESTAMP,
    
    -- Audit trail (JSON arrays)
    workflow_history TEXT DEFAULT '[]',
    notes TEXT DEFAULT '[]',
    
    -- Indexes
    INDEX idx_refund_status (status, created_at),
    INDEX idx_refund_priority (priority, due_date),
    INDEX idx_refund_purchase (purchase_id),
    INDEX idx_refund_requester (requester_id),
    INDEX idx_refund_assigned (assigned_to, status)
);

-- Refund policies table
CREATE TABLE IF NOT EXISTS refund_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Eligibility rules
    time_limit_hours INTEGER DEFAULT 168, -- 7 days
    min_amount_cents INTEGER DEFAULT 100, -- $1.00
    max_amount_cents INTEGER DEFAULT 10000000, -- $100,000
    
    -- Auto-approval rules
    auto_approve_threshold_cents INTEGER DEFAULT 5000, -- $50.00
    require_manager_approval BOOLEAN DEFAULT FALSE,
    
    -- Restrictions
    max_refunds_per_customer INTEGER DEFAULT 10,
    max_refunds_per_template INTEGER DEFAULT 50,
    blocked_reasons TEXT DEFAULT '[]', -- JSON array of blocked RefundReason values
    
    -- Creator impact rules
    creator_liability_percent INTEGER DEFAULT 80, -- 0-100
    escrow_hold_period_hours INTEGER DEFAULT 24,
    
    -- Template and customer-specific rules (JSON objects)
    template_rules TEXT DEFAULT '{}',
    customer_rules TEXT DEFAULT '{}',
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_policy_enabled (enabled),
    INDEX idx_policy_name (name)
);

-- Refund metrics aggregation table (for performance)
CREATE TABLE IF NOT EXISTS refund_metrics_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    
    -- Request counts
    total_requests INTEGER DEFAULT 0,
    pending_requests INTEGER DEFAULT 0,
    approved_requests INTEGER DEFAULT 0,
    rejected_requests INTEGER DEFAULT 0,
    completed_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    
    -- Amount totals (in cents)
    total_requested_amount INTEGER DEFAULT 0,
    total_approved_amount INTEGER DEFAULT 0,
    total_refunded_amount INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_processing_time_hours REAL DEFAULT 0,
    approval_rate REAL DEFAULT 0,
    
    -- Reason breakdown (JSON object with counts)
    reason_breakdown TEXT DEFAULT '{}',
    
    -- Priority breakdown (JSON object with counts)
    priority_breakdown TEXT DEFAULT '{}',
    
    -- Creator impact
    creators_affected INTEGER DEFAULT 0,
    total_creator_deductions INTEGER DEFAULT 0,
    
    -- Computed at end of day
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(metric_date),
    INDEX idx_refund_metrics_date (metric_date)
);

-- Refund notifications/alerts table
CREATE TABLE IF NOT EXISTS refund_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id VARCHAR(36) UNIQUE NOT NULL,
    
    -- Notification details
    type VARCHAR(20) NOT NULL, -- 'overdue', 'escalation', 'high_value', 'policy_violation'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Target and context
    target_admin VARCHAR(255), -- If null, broadcast to all admins
    related_refund_id VARCHAR(36),
    related_policy_id VARCHAR(36),
    
    -- Trigger conditions (JSON object)
    trigger_conditions TEXT DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    INDEX idx_refund_notifications_target (target_admin, status),
    INDEX idx_refund_notifications_type (type, created_at),
    INDEX idx_refund_notifications_refund (related_refund_id)
);

-- Refund admin actions log
CREATE TABLE IF NOT EXISTS refund_admin_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id VARCHAR(36) UNIQUE NOT NULL,
    
    -- Action details
    admin_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'approve', 'reject', 'process', 'assign', 'update', etc.
    refund_id VARCHAR(36) NOT NULL,
    
    -- Context and details
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    action_data TEXT DEFAULT '{}', -- JSON object with action-specific data
    notes TEXT,
    
    -- Result
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Performance
    execution_time_ms INTEGER,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_refund_admin_actions_admin (admin_id, created_at),
    INDEX idx_refund_admin_actions_refund (refund_id, action_type),
    INDEX idx_refund_admin_actions_type (action_type, created_at)
);

-- Refund processing queue for async operations
CREATE TABLE IF NOT EXISTS refund_processing_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id VARCHAR(36) UNIQUE NOT NULL,
    
    -- Queue item details
    refund_id VARCHAR(36) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- 'process', 'notify_customer', 'adjust_creator', etc.
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    
    -- Processing details
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Payload and result
    operation_data TEXT DEFAULT '{}',
    result_data TEXT,
    error_message TEXT,
    
    -- Scheduling
    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Next retry time for failed operations
    retry_after TIMESTAMP,
    
    INDEX idx_refund_queue_status (status, priority, scheduled_for),
    INDEX idx_refund_queue_refund (refund_id, operation)
);

-- Update marketplace_purchases table to track refund status (if not exists)
-- This assumes the table exists from the marketplace implementation

-- Add refund tracking columns to marketplace_purchases if they don't exist
-- Note: In SQLite, we use separate ALTER TABLE statements to avoid errors

-- Add refund status tracking
-- ALTER TABLE marketplace_purchases ADD COLUMN refund_status VARCHAR(20) DEFAULT NULL;
-- ALTER TABLE marketplace_purchases ADD COLUMN refund_amount_cents INTEGER DEFAULT 0;
-- ALTER TABLE marketplace_purchases ADD COLUMN refund_reason VARCHAR(50) DEFAULT NULL;
-- ALTER TABLE marketplace_purchases ADD COLUMN refunded_at TIMESTAMP DEFAULT NULL;
-- ALTER TABLE marketplace_purchases ADD COLUMN refund_id VARCHAR(36) DEFAULT NULL;

-- Views for common queries

-- Active refunds requiring attention
CREATE VIEW IF NOT EXISTS active_refunds_view AS
SELECT 
    r.*,
    CASE 
        WHEN r.due_date < datetime('now') THEN 1 
        ELSE 0 
    END as is_overdue,
    CASE 
        WHEN r.priority = 'urgent' THEN 4
        WHEN r.priority = 'high' THEN 3
        WHEN r.priority = 'medium' THEN 2
        ELSE 1
    END as priority_score
FROM refund_requests r
WHERE r.status IN ('pending', 'reviewing', 'approved')
ORDER BY priority_score DESC, r.created_at ASC;

-- Refund summary by date
CREATE VIEW IF NOT EXISTS refund_summary_view AS
SELECT 
    DATE(created_at) as refund_date,
    COUNT(*) as total_requests,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
    SUM(amount) as total_amount_requested,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount_refunded,
    AVG(CASE 
        WHEN processed_at IS NOT NULL AND approved_at IS NOT NULL 
        THEN (julianday(processed_at) - julianday(approved_at)) * 24 
        ELSE NULL 
    END) as avg_processing_hours
FROM refund_requests
GROUP BY DATE(created_at)
ORDER BY refund_date DESC;

-- Insert default refund policy
INSERT OR IGNORE INTO refund_policies (
    policy_id,
    name,
    description,
    enabled,
    time_limit_hours,
    min_amount_cents,
    max_amount_cents,
    auto_approve_threshold_cents,
    require_manager_approval,
    max_refunds_per_customer,
    max_refunds_per_template,
    blocked_reasons,
    creator_liability_percent,
    escrow_hold_period_hours,
    created_by
) VALUES (
    'default-marketplace-policy',
    'Default Marketplace Refund Policy',
    'Standard policy for marketplace template refunds',
    1,
    168, -- 7 days
    100, -- $1.00
    10000000, -- $100,000
    5000, -- $50.00 auto-approve threshold
    0, -- No manager approval required
    10, -- Max 10 refunds per customer
    100, -- Max 100 refunds per template
    '[]', -- No blocked reasons
    80, -- Creator pays 80% of refund
    24, -- 24 hour escrow hold
    'system'
);

-- Insert test/example refund requests for development (remove in production)
-- INSERT OR IGNORE INTO refund_requests (
--     refund_id, purchase_id, requester_id, requester_type, reason, amount, refund_type,
--     description, status, priority, original_purchase_json, approval_required
-- ) VALUES 
-- (
--     'RFD-TEST-001', 'PURCH-001', 'user123', 'customer', 'not_as_described', 2500, 'full',
--     'Template did not work as expected', 'pending', 'medium',
--     '{"purchaseId":"PURCH-001","customerId":"user123","creatorId":"creator456","templateId":"tpl789","originalAmount":2500,"purchaseDate":"2024-01-15T10:30:00Z"}',
--     1
-- ),
-- (
--     'RFD-TEST-002', 'PURCH-002', 'admin', 'admin', 'technical_issue', 7500, 'full',
--     'Server error during template processing', 'approved', 'high',
--     '{"purchaseId":"PURCH-002","customerId":"user456","creatorId":"creator789","templateId":"tpl123","originalAmount":7500,"purchaseDate":"2024-01-16T14:20:00Z"}',
--     0
-- );