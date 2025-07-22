-- Epic 17.5.3 Dispute Management Database Schema
-- Task: E17-1753114397361-D755AD - Implement dispute handling
-- Comprehensive database schema for dispute handling system

-- Core Disputes Table
-- Stores all dispute records with complete transaction and outcome data
CREATE TABLE IF NOT EXISTS disputes (
    dispute_id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    buyer_id VARCHAR(64) NOT NULL,
    seller_id VARCHAR(64) NOT NULL,
    template_id VARCHAR(64),
    
    -- Dispute Classification
    type VARCHAR(32) NOT NULL CHECK (type IN (
        'chargeback', 'retrieval_request', 'pre_arbitration', 'arbitration',
        'merchant_dispute', 'quality_dispute', 'fraud_dispute', 'authorization_dispute'
    )),
    category VARCHAR(32) NOT NULL CHECK (category IN (
        'fraud', 'authorization', 'processing_error', 'consumer_dispute',
        'quality_issue', 'non_delivery', 'duplicate_processing', 'credit_not_processed',
        'cancelled_recurring', 'product_not_received'
    )),
    reason TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Financial Information
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    final_amount DECIMAL(10,2),
    liability_amount DECIMAL(10,2) DEFAULT 0,
    fees_awarded DECIMAL(10,2) DEFAULT 0,
    
    -- Dispute Content
    description TEXT NOT NULL,
    customer_claim TEXT NOT NULL,
    merchant_response TEXT,
    
    -- Status and Workflow
    status VARCHAR(32) DEFAULT 'received' CHECK (status IN (
        'received', 'investigating', 'awaiting_response', 'response_submitted',
        'under_review', 'accepted', 'rejected', 'expired', 'withdrawn', 'escalated', 'closed'
    )),
    stage VARCHAR(32) DEFAULT 'initial_dispute' CHECK (stage IN (
        'initial_dispute', 'evidence_collection', 'investigation', 'response_preparation',
        'response_submission', 'review_process', 'resolution', 'appeal_period',
        'appeal_process', 'final_resolution'
    )),
    
    -- Deadlines and Timeline
    due_date TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Assignment and Ownership
    created_by VARCHAR(64) NOT NULL,
    assigned_to VARCHAR(64),
    resolved_by VARCHAR(64),
    
    -- External Integration
    source VARCHAR(32) NOT NULL CHECK (source IN (
        'payment_provider', 'customer_report', 'merchant_report', 'system_detection', 'admin_initiated'
    )),
    payment_provider VARCHAR(64),
    provider_dispute_id VARCHAR(128),
    liability_shift BOOLEAN DEFAULT FALSE,
    
    -- Resolution Information
    outcome VARCHAR(32) CHECK (outcome IN ('won', 'lost', 'partially_won', 'settled', 'withdrawn', 'expired')),
    resolution_data JSONB,
    
    -- Appeal Information
    appealable BOOLEAN DEFAULT TRUE,
    appeal_deadline TIMESTAMPTZ,
    appeal_data JSONB,
    
    -- System Integration
    enforcement_actions JSONB DEFAULT '[]',
    trust_impact JSONB,
    policy_violations JSONB DEFAULT '[]',
    
    -- Additional metadata
    notes TEXT,
    tags JSONB DEFAULT '[]',
    priority INTEGER DEFAULT 50,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Dispute Evidence Table
-- Stores all evidence submitted for disputes
CREATE TABLE IF NOT EXISTS dispute_evidence (
    evidence_id VARCHAR(64) PRIMARY KEY,
    dispute_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN (
        'transaction_receipt', 'authorization_proof', 'delivery_confirmation',
        'communication_log', 'refund_proof', 'product_description',
        'customer_communication', 'technical_analysis', 'usage_logs',
        'quality_assessment', 'policy_documentation', 'other'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    
    -- Evidence Metadata
    category VARCHAR(32) NOT NULL CHECK (category IN (
        'transaction', 'communication', 'delivery', 'quality', 'authorization', 'other'
    )),
    relevance_score INTEGER DEFAULT 50,
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(64),
    verified_at TIMESTAMPTZ,
    
    -- Submission Information
    submitted_by VARCHAR(64) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE
);

-- Dispute Attachments Table
-- Stores file attachments for disputes and evidence
CREATE TABLE IF NOT EXISTS dispute_attachments (
    attachment_id VARCHAR(64) PRIMARY KEY,
    dispute_id VARCHAR(64),
    evidence_id VARCHAR(64),
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_hash VARCHAR(128),
    
    -- Attachment Metadata
    category VARCHAR(32) NOT NULL CHECK (category IN (
        'evidence', 'communication', 'documentation', 'screenshot'
    )),
    uploaded_by VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure attachment belongs to either dispute or evidence
    CHECK ((dispute_id IS NOT NULL AND evidence_id IS NULL) OR 
           (dispute_id IS NULL AND evidence_id IS NOT NULL)),
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE,
    FOREIGN KEY (evidence_id) REFERENCES dispute_evidence(evidence_id) ON DELETE CASCADE
);

-- Dispute Communications Table
-- Stores all communications related to disputes
CREATE TABLE IF NOT EXISTS dispute_communications (
    communication_id VARCHAR(64) PRIMARY KEY,
    dispute_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN (
        'internal_note', 'customer_message', 'merchant_message', 'provider_message', 'system_notification'
    )),
    sender VARCHAR(64) NOT NULL,
    recipient VARCHAR(64),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    attachments JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE
);

-- Dispute Responses Table  
-- Stores formal responses prepared for payment providers
CREATE TABLE IF NOT EXISTS dispute_responses (
    response_id VARCHAR(64) PRIMARY KEY,
    dispute_id VARCHAR(64) NOT NULL,
    response_type VARCHAR(32) NOT NULL CHECK (response_type IN ('accept', 'contest', 'partial_accept')),
    argument TEXT NOT NULL,
    
    -- Response Lifecycle
    status VARCHAR(16) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'submitted')),
    prepared_by VARCHAR(64) NOT NULL,
    reviewed_by VARCHAR(64),
    approved_by VARCHAR(64),
    submitted_by VARCHAR(64),
    submitted_at TIMESTAMPTZ,
    
    -- Response Metadata
    evidence_ids JSONB DEFAULT '[]',
    attachment_ids JSONB DEFAULT '[]',
    outcome VARCHAR(32),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE
);

-- Dispute Workflows Table
-- Tracks dispute processing workflows and automation
CREATE TABLE IF NOT EXISTS dispute_workflows (
    workflow_id VARCHAR(64) PRIMARY KEY,
    dispute_id VARCHAR(64) NOT NULL,
    current_stage VARCHAR(32) NOT NULL,
    
    -- Workflow Configuration
    stages JSONB NOT NULL,
    deadlines JSONB NOT NULL DEFAULT '[]',
    automated_actions JSONB DEFAULT '[]',
    escalation_rules JSONB DEFAULT '[]',
    
    -- Workflow Status
    manual_review_required BOOLEAN DEFAULT FALSE,
    blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE
);

-- Dispute Resolutions Table
-- Detailed resolution information for disputes
CREATE TABLE IF NOT EXISTS dispute_resolutions (
    resolution_id SERIAL PRIMARY KEY,
    dispute_id VARCHAR(64) NOT NULL,
    outcome VARCHAR(32) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    adjusted_amount DECIMAL(10,2),
    liability_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    fees_awarded DECIMAL(10,2) DEFAULT 0,
    
    -- Resolution Details
    reason TEXT NOT NULL,
    notes TEXT,
    resolved_by VARCHAR(64) NOT NULL,
    resolved_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Appeal Information
    appealable BOOLEAN DEFAULT FALSE,
    appeal_deadline TIMESTAMPTZ,
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE,
    UNIQUE(dispute_id)
);

-- Dispute Notifications Table
-- Tracks notifications sent for dispute events
CREATE TABLE IF NOT EXISTS dispute_notifications (
    notification_id SERIAL PRIMARY KEY,
    dispute_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN (
        'status_change', 'deadline_reminder', 'evidence_request', 'resolution', 'escalation'
    )),
    recipient VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(16) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Notification Status
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    action_required BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE
);

-- Dispute Analytics Table
-- Pre-computed analytics for dispute reporting
CREATE TABLE IF NOT EXISTS dispute_analytics (
    analytics_id SERIAL PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Core Metrics
    total_disputes INTEGER NOT NULL DEFAULT 0,
    active_disputes INTEGER NOT NULL DEFAULT 0,
    resolved_disputes INTEGER NOT NULL DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    average_resolution_time INTEGER DEFAULT 0, -- in days
    total_liability_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Distribution Metrics
    disputes_by_type JSONB DEFAULT '{}',
    disputes_by_category JSONB DEFAULT '{}',
    disputes_by_status JSONB DEFAULT '{}',
    disputes_by_outcome JSONB DEFAULT '{}',
    
    -- Additional Metrics
    high_value_disputes INTEGER DEFAULT 0, -- >$1000
    fraud_disputes INTEGER DEFAULT 0,
    quality_disputes INTEGER DEFAULT 0,
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(period_start, period_end)
);

-- Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_id ON disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_id ON disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_type ON disputes(type);
CREATE INDEX IF NOT EXISTS idx_disputes_category ON disputes(category);
CREATE INDEX IF NOT EXISTS idx_disputes_severity ON disputes(severity);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disputes_due_date ON disputes(due_date);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_to ON disputes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_disputes_amount ON disputes(amount);

CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_type ON dispute_evidence(type);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_verified ON dispute_evidence(verified);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_submitted_at ON dispute_evidence(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_dispute_attachments_dispute_id ON dispute_attachments(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_attachments_evidence_id ON dispute_attachments(evidence_id);

CREATE INDEX IF NOT EXISTS idx_dispute_communications_dispute_id ON dispute_communications(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_communications_timestamp ON dispute_communications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dispute_communications_type ON dispute_communications(type);

CREATE INDEX IF NOT EXISTS idx_dispute_responses_dispute_id ON dispute_responses(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_responses_status ON dispute_responses(status);

CREATE INDEX IF NOT EXISTS idx_dispute_workflows_dispute_id ON dispute_workflows(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_workflows_current_stage ON dispute_workflows(current_stage);

CREATE INDEX IF NOT EXISTS idx_dispute_notifications_dispute_id ON dispute_notifications(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_notifications_recipient ON dispute_notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_dispute_notifications_read_at ON dispute_notifications(read_at);

-- Composite Indexes for Complex Queries
CREATE INDEX IF NOT EXISTS idx_disputes_status_created ON disputes(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_status ON disputes(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_disputes_type_amount ON disputes(type, amount DESC);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_status ON disputes(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_status ON disputes(buyer_id, status);

-- Functions and Triggers for Automation
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dispute_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_disputes_updated_at
    BEFORE UPDATE ON disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_dispute_updated_at();

CREATE TRIGGER trigger_dispute_responses_updated_at
    BEFORE UPDATE ON dispute_responses  
    FOR EACH ROW
    EXECUTE FUNCTION update_dispute_updated_at();

CREATE TRIGGER trigger_dispute_workflows_updated_at
    BEFORE UPDATE ON dispute_workflows
    FOR EACH ROW  
    EXECUTE FUNCTION update_dispute_updated_at();

-- Function to calculate dispute age
CREATE OR REPLACE FUNCTION calculate_dispute_age(created_at TIMESTAMPTZ)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(DAY FROM NOW() - created_at);
END;
$$ LANGUAGE plpgsql;

-- Function to check if dispute is overdue
CREATE OR REPLACE FUNCTION is_dispute_overdue(due_date TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN due_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Views for Common Queries
-- Active Disputes View
CREATE OR REPLACE VIEW active_disputes AS
SELECT 
    d.*,
    calculate_dispute_age(d.created_at) as age_days,
    is_dispute_overdue(d.due_date) as is_overdue
FROM disputes d 
WHERE d.status NOT IN ('closed', 'resolved', 'withdrawn')
ORDER BY d.created_at DESC;

-- High Priority Disputes View
CREATE OR REPLACE VIEW high_priority_disputes AS
SELECT 
    d.*,
    calculate_dispute_age(d.created_at) as age_days
FROM disputes d 
WHERE (d.severity IN ('high', 'critical') OR d.amount > 1000)
    AND d.status NOT IN ('closed', 'resolved', 'withdrawn')
ORDER BY d.severity DESC, d.amount DESC, d.created_at ASC;

-- Overdue Disputes View  
CREATE OR REPLACE VIEW overdue_disputes AS
SELECT 
    d.*,
    calculate_dispute_age(d.created_at) as age_days,
    EXTRACT(DAY FROM NOW() - d.due_date) as days_overdue
FROM disputes d
WHERE d.due_date < NOW() 
    AND d.status NOT IN ('closed', 'resolved', 'withdrawn')
ORDER BY days_overdue DESC;

-- Dispute Summary View
CREATE OR REPLACE VIEW dispute_summary AS
SELECT 
    d.dispute_id,
    d.transaction_id,
    d.type,
    d.category, 
    d.status,
    d.amount,
    d.created_at,
    d.assigned_to,
    COUNT(de.evidence_id) as evidence_count,
    COUNT(dc.communication_id) as communication_count,
    d.seller_id,
    d.buyer_id
FROM disputes d
LEFT JOIN dispute_evidence de ON d.dispute_id = de.dispute_id
LEFT JOIN dispute_communications dc ON d.dispute_id = dc.dispute_id
GROUP BY d.dispute_id, d.transaction_id, d.type, d.category, d.status, 
         d.amount, d.created_at, d.assigned_to, d.seller_id, d.buyer_id
ORDER BY d.created_at DESC;

-- Insert sample dispute types configuration
INSERT INTO admin_policy_settings (setting_key, setting_value, description) VALUES
(
    'dispute_system_enabled',
    'true',
    'Global toggle for the dispute handling system'
),
(
    'dispute_auto_assignment',
    'true', 
    'Automatically assign disputes to available agents'
),
(
    'dispute_response_deadlines',
    '{"chargeback": 7, "retrieval_request": 14, "arbitration": 10}',
    'Response deadlines by dispute type in days'
),
(
    'dispute_escalation_rules',
    '{"high_value_threshold": 5000, "fraud_auto_escalate": true, "overdue_escalation_days": 3}',
    'Rules for automatic dispute escalation'
),
(
    'dispute_notification_settings',
    '{"email_enabled": true, "sms_enabled": false, "slack_enabled": true}',
    'Notification preferences for dispute events'
)
ON CONFLICT (setting_key) DO NOTHING;