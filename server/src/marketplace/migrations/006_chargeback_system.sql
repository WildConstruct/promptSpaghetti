-- Migration 006: Chargeback Tracking System - Epic 17
-- Task: E17-1753114397355-30EFDE - Implement chargeback tracking
-- 
-- Creates comprehensive database schema for chargeback management,
-- dispute tracking, evidence collection, and analytics.

-- =============================================================================
-- Core Chargebacks Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargebacks (
    id TEXT PRIMARY KEY,
    
    -- Related entities
    transaction_id TEXT NOT NULL,
    order_id TEXT,
    payment_intent_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Provider information
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
    provider_chargeback_id TEXT NOT NULL,
    provider_dispute_id TEXT,
    
    -- Chargeback details
    type TEXT NOT NULL CHECK (type IN ('chargeback', 'pre_arbitration', 'arbitration', 'retrieval_request', 'inquiry')),
    status TEXT NOT NULL CHECK (status IN ('initiated', 'under_review', 'evidence_requested', 'evidence_submitted', 'disputed', 'accepted', 'won', 'lost', 'closed', 'expired')),
    reason TEXT NOT NULL CHECK (reason IN (
        -- Fraud reasons
        'fraudulent', 'card_not_present', 'unauthorized_use',
        -- Authorization reasons
        'authorization_required', 'invalid_authorization', 'expired_authorization',
        -- Processing reasons
        'duplicate_processing', 'invalid_card_number', 'processing_error',
        -- Consumer dispute reasons
        'product_not_received', 'product_unacceptable', 'subscription_cancelled', 'duplicate_transaction',
        'credit_not_processed', 'cancelled_recurring',
        -- General reasons
        'general', 'unrecognized', 'other'
    )),
    reason_description TEXT,
    
    -- Financial information
    amount_cents INTEGER NOT NULL,
    fee_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Timeline information
    initiated_at TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Evidence tracking
    evidence_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    evidence_due_by TIMESTAMP,
    evidence_submission_count INTEGER NOT NULL DEFAULT 0,
    
    -- Outcome information
    outcome TEXT CHECK (outcome IN ('won', 'lost', 'accepted', 'warning_closed')),
    outcome_reason TEXT,
    liability_shift BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Risk and prevention data
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    fraud_score REAL,
    prevention_score REAL,
    
    -- Workflow and automation
    auto_response_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    requires_manual_review BOOLEAN NOT NULL DEFAULT TRUE,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    
    -- Communication and notes
    customer_message TEXT,
    internal_notes TEXT,
    
    -- Metadata and tracking
    metadata JSON NOT NULL DEFAULT '{}',
    tags JSON NOT NULL DEFAULT '[]',
    
    -- Audit trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    last_updated_by TEXT NOT NULL,
    
    -- Unique constraints
    UNIQUE(provider, provider_chargeback_id),
    
    -- Foreign key constraints (if tables exist)
    -- FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    -- FOREIGN KEY (order_id) REFERENCES orders(id),
    -- FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id),
    -- FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================================================
-- Chargeback Evidence Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargeback_evidence (
    id TEXT PRIMARY KEY,
    chargeback_id TEXT NOT NULL,
    
    -- Evidence details
    type TEXT NOT NULL CHECK (type IN (
        'receipt', 'shipping_documentation', 'customer_communication', 'refund_policy',
        'terms_of_service', 'billing_agreement', 'duplicate_charge_documentation',
        'product_description', 'delivery_confirmation', 'cancellation_policy',
        'customer_signature', 'uncategorized_file', 'uncategorized_text'
    )),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Evidence content
    text_content TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    
    -- Metadata
    source TEXT NOT NULL CHECK (source IN ('manual', 'automated', 'system_generated')),
    auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    relevance_score REAL,
    
    -- Status and validation
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected')),
    validation_errors JSON,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    created_by TEXT NOT NULL,
    
    FOREIGN KEY (chargeback_id) REFERENCES chargebacks(id) ON DELETE CASCADE
);

-- =============================================================================
-- Communication History Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargeback_communications (
    id TEXT PRIMARY KEY,
    chargeback_id TEXT NOT NULL,
    
    -- Communication details
    type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'chat', 'internal_note', 'system_message')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject TEXT,
    content TEXT NOT NULL,
    
    -- Participants
    from_user_id TEXT,
    to_user_id TEXT,
    from_email TEXT,
    to_email TEXT,
    
    -- Status and metadata
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    importance TEXT NOT NULL CHECK (importance IN ('low', 'normal', 'high', 'urgent')),
    tags JSON NOT NULL DEFAULT '[]',
    
    -- Attachments (JSON array of attachment objects)
    attachments JSON NOT NULL DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    created_by TEXT NOT NULL,
    
    FOREIGN KEY (chargeback_id) REFERENCES chargebacks(id) ON DELETE CASCADE
);

-- =============================================================================
-- Prevention Rules Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargeback_prevention_rules (
    id TEXT PRIMARY KEY,
    
    -- Rule configuration
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 50 CHECK (priority BETWEEN 1 AND 100),
    
    -- Trigger conditions (JSON array of condition objects)
    conditions JSON NOT NULL,
    
    -- Actions to take (JSON array of action objects)
    actions JSON NOT NULL,
    
    -- Effectiveness tracking
    triggered_count INTEGER NOT NULL DEFAULT 0,
    prevented_chargebacks INTEGER NOT NULL DEFAULT 0,
    false_positive_rate REAL NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    last_triggered_at TIMESTAMP
);

-- =============================================================================
-- Response Templates Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargeback_response_templates (
    id TEXT PRIMARY KEY,
    
    -- Template details
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    type TEXT NOT NULL,
    
    -- Template content
    response_text TEXT NOT NULL,
    required_evidence JSON NOT NULL, -- Array of evidence types
    optional_evidence JSON NOT NULL DEFAULT '[]',
    
    -- Automation
    auto_generate_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    auto_submit BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Effectiveness metrics
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate REAL NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    tags JSON NOT NULL DEFAULT '[]'
);

-- =============================================================================
-- Alerts Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargeback_alerts (
    id TEXT PRIMARY KEY,
    
    -- Alert details
    type TEXT NOT NULL CHECK (type IN ('prevention', 'threshold', 'pattern', 'high_risk', 'deadline')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Related entities
    transaction_id TEXT,
    user_id TEXT,
    chargeback_id TEXT,
    pattern_id TEXT,
    
    -- Alert data
    trigger_data JSON NOT NULL DEFAULT '{}',
    threshold_value REAL,
    current_value REAL,
    
    -- Status and handling
    status TEXT NOT NULL CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMP,
    resolved_by TEXT,
    resolved_at TIMESTAMP,
    
    -- Actions and recommendations
    recommended_actions JSON NOT NULL DEFAULT '[]',
    auto_actions_taken JSON NOT NULL DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    FOREIGN KEY (chargeback_id) REFERENCES chargebacks(id) ON DELETE CASCADE
);

-- =============================================================================
-- Evidence Collectors Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS chargeback_evidence_collectors (
    id TEXT PRIMARY KEY,
    
    -- Collector configuration
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_type TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Collection logic
    data_source TEXT NOT NULL CHECK (data_source IN ('database', 'api', 'file_system', 'external_service')),
    collection_query TEXT NOT NULL,
    format_template TEXT NOT NULL,
    
    -- Validation and quality
    validation_rules JSON NOT NULL DEFAULT '[]',
    quality_threshold REAL NOT NULL DEFAULT 0.5,
    
    -- Usage tracking
    collections_count INTEGER NOT NULL DEFAULT 0,
    success_rate REAL NOT NULL DEFAULT 0,
    average_quality_score REAL NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP
);

-- =============================================================================
-- Performance Indexes
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_chargebacks_transaction_id ON chargebacks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_chargebacks_user_id ON chargebacks(user_id);
CREATE INDEX IF NOT EXISTS idx_chargebacks_order_id ON chargebacks(order_id);
CREATE INDEX IF NOT EXISTS idx_chargebacks_payment_intent_id ON chargebacks(payment_intent_id);

-- Provider and status indexes
CREATE INDEX IF NOT EXISTS idx_chargebacks_provider ON chargebacks(provider);
CREATE INDEX IF NOT EXISTS idx_chargebacks_provider_chargeback_id ON chargebacks(provider_chargeback_id);
CREATE INDEX IF NOT EXISTS idx_chargebacks_status ON chargebacks(status);
CREATE INDEX IF NOT EXISTS idx_chargebacks_type ON chargebacks(type);
CREATE INDEX IF NOT EXISTS idx_chargebacks_reason ON chargebacks(reason);

-- Date and timeline indexes
CREATE INDEX IF NOT EXISTS idx_chargebacks_initiated_at ON chargebacks(initiated_at);
CREATE INDEX IF NOT EXISTS idx_chargebacks_due_date ON chargebacks(due_date);
CREATE INDEX IF NOT EXISTS idx_chargebacks_created_at ON chargebacks(created_at);

-- Risk and analytics indexes
CREATE INDEX IF NOT EXISTS idx_chargebacks_risk_level ON chargebacks(risk_level);
CREATE INDEX IF NOT EXISTS idx_chargebacks_outcome ON chargebacks(outcome);
CREATE INDEX IF NOT EXISTS idx_chargebacks_amount_cents ON chargebacks(amount_cents);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_chargebacks_user_status ON chargebacks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_chargebacks_provider_status ON chargebacks(provider, status);
CREATE INDEX IF NOT EXISTS idx_chargebacks_date_range ON chargebacks(initiated_at, status);

-- Evidence table indexes
CREATE INDEX IF NOT EXISTS idx_chargeback_evidence_chargeback_id ON chargeback_evidence(chargeback_id);
CREATE INDEX IF NOT EXISTS idx_chargeback_evidence_type ON chargeback_evidence(type);
CREATE INDEX IF NOT EXISTS idx_chargeback_evidence_status ON chargeback_evidence(status);

-- Communication table indexes
CREATE INDEX IF NOT EXISTS idx_chargeback_communications_chargeback_id ON chargeback_communications(chargeback_id);
CREATE INDEX IF NOT EXISTS idx_chargeback_communications_type ON chargeback_communications(type);
CREATE INDEX IF NOT EXISTS idx_chargeback_communications_created_at ON chargeback_communications(created_at);

-- Alert table indexes
CREATE INDEX IF NOT EXISTS idx_chargeback_alerts_chargeback_id ON chargeback_alerts(chargeback_id);
CREATE INDEX IF NOT EXISTS idx_chargeback_alerts_type ON chargeback_alerts(type);
CREATE INDEX IF NOT EXISTS idx_chargeback_alerts_severity ON chargeback_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_chargeback_alerts_status ON chargeback_alerts(status);

-- Prevention rules indexes
CREATE INDEX IF NOT EXISTS idx_chargeback_prevention_rules_enabled ON chargeback_prevention_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_chargeback_prevention_rules_priority ON chargeback_prevention_rules(priority);

-- =============================================================================
-- Analytics Views
-- =============================================================================

-- Chargeback summary view for analytics
CREATE VIEW IF NOT EXISTS chargeback_analytics_summary AS
SELECT 
    DATE(initiated_at) as date,
    provider,
    status,
    reason,
    COUNT(*) as chargeback_count,
    SUM(amount_cents) as total_amount_cents,
    SUM(fee_cents) as total_fees_cents,
    AVG(amount_cents) as avg_amount_cents,
    COUNT(CASE WHEN outcome = 'won' THEN 1 END) as won_count,
    COUNT(CASE WHEN outcome = 'lost' THEN 1 END) as lost_count,
    COUNT(CASE WHEN outcome = 'accepted' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN evidence_submitted = TRUE THEN 1 END) as evidence_submitted_count
FROM chargebacks
GROUP BY DATE(initiated_at), provider, status, reason;

-- User chargeback metrics view
CREATE VIEW IF NOT EXISTS user_chargeback_metrics AS
SELECT 
    user_id,
    COUNT(*) as total_chargebacks,
    SUM(amount_cents) as total_chargeback_amount_cents,
    SUM(fee_cents) as total_fees_cents,
    COUNT(CASE WHEN outcome = 'won' THEN 1 END) as chargebacks_won,
    COUNT(CASE WHEN outcome = 'lost' THEN 1 END) as chargebacks_lost,
    COUNT(CASE WHEN outcome = 'accepted' THEN 1 END) as chargebacks_accepted,
    COUNT(CASE WHEN evidence_submitted = TRUE THEN 1 END) as evidence_submitted_count,
    AVG(CASE WHEN outcome IS NOT NULL THEN 
        CASE 
            WHEN outcome = 'won' THEN 1.0 
            WHEN outcome = 'lost' THEN 0.0 
            ELSE 0.5 
        END 
    END) as win_rate,
    MIN(initiated_at) as first_chargeback_at,
    MAX(initiated_at) as last_chargeback_at
FROM chargebacks
GROUP BY user_id;

-- Monthly chargeback trends view
CREATE VIEW IF NOT EXISTS monthly_chargeback_trends AS
SELECT 
    strftime('%Y-%m', initiated_at) as month,
    COUNT(*) as chargeback_count,
    SUM(amount_cents) as total_amount_cents,
    AVG(amount_cents) as avg_amount_cents,
    COUNT(CASE WHEN outcome = 'won' THEN 1 END) as won_count,
    COUNT(CASE WHEN outcome = 'lost' THEN 1 END) as lost_count,
    COUNT(CASE WHEN evidence_submitted = TRUE THEN 1 END) as evidence_submitted_count,
    COUNT(DISTINCT user_id) as unique_users_affected
FROM chargebacks
GROUP BY strftime('%Y-%m', initiated_at)
ORDER BY month;

-- =============================================================================
-- Triggers for Auto-Update
-- =============================================================================

-- Trigger to update chargeback updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_chargeback_timestamp 
AFTER UPDATE ON chargebacks
FOR EACH ROW
BEGIN
    UPDATE chargebacks 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Trigger to update evidence updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_evidence_timestamp 
AFTER UPDATE ON chargeback_evidence
FOR EACH ROW
BEGIN
    UPDATE chargeback_evidence 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Trigger to update prevention rule usage counts
CREATE TRIGGER IF NOT EXISTS update_prevention_rule_stats
AFTER INSERT ON chargeback_alerts
FOR EACH ROW
WHEN NEW.type = 'prevention'
BEGIN
    UPDATE chargeback_prevention_rules 
    SET triggered_count = triggered_count + 1,
        last_triggered_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.pattern_id;
END;

-- =============================================================================
-- Initial Data
-- =============================================================================

-- Insert default response templates for common chargeback reasons
INSERT OR IGNORE INTO chargeback_response_templates (
    id, name, description, reason, type, response_text, required_evidence, 
    optional_evidence, auto_generate_evidence, created_by, tags
) VALUES 
(
    'template-fraud-001', 
    'Fraudulent Transaction Response', 
    'Standard response for fraudulent transaction chargebacks',
    'fraudulent',
    'chargeback',
    'We contest this chargeback as the transaction was legitimate. The customer provided valid payment information and received the purchased digital goods immediately upon payment confirmation.',
    '["receipt", "customer_communication", "terms_of_service"]',
    '["delivery_confirmation", "customer_signature"]',
    true,
    'system',
    '["fraud", "standard", "digital-goods"]'
),
(
    'template-not-received-001',
    'Product Not Received Response',
    'Standard response for product not received disputes',
    'product_not_received',
    'chargeback',
    'The customer received the digital product immediately upon payment. Our records show successful delivery and access was granted to the purchased content.',
    '["delivery_confirmation", "customer_communication", "product_description"]',
    '["customer_signature", "refund_policy"]',
    true,
    'system',
    '["product-delivery", "digital-goods", "standard"]'
),
(
    'template-unauthorized-001',
    'Unauthorized Use Response',
    'Standard response for unauthorized use chargebacks',
    'unauthorized_use',
    'chargeback',
    'The transaction was authorized by the legitimate cardholder. We have records of successful authentication and the customer accessed the purchased content.',
    '["receipt", "customer_communication", "billing_agreement"]',
    '["customer_signature", "delivery_confirmation"]',
    true,
    'system',
    '["unauthorized", "authentication", "standard"]'
);

-- Insert default prevention rules
INSERT OR IGNORE INTO chargeback_prevention_rules (
    id, name, description, enabled, priority, conditions, actions, created_by
) VALUES 
(
    'rule-high-value-001',
    'High Value Transaction Review',
    'Flag transactions over $500 for manual review',
    true,
    80,
    '[{"field": "transaction_amount", "operator": "greater_than", "value": 50000, "weight": 1.0}]',
    '[{"type": "manual_review", "parameters": {"reason": "High value transaction"}, "auto_execute": true}]',
    'system'
),
(
    'rule-velocity-001',
    'High Velocity User Check',
    'Flag users with multiple transactions in short period',
    true,
    70,
    '[{"field": "user_transaction_count_24h", "operator": "greater_than", "value": 5, "weight": 1.0}]',
    '[{"type": "require_verification", "parameters": {"verification_type": "phone"}, "auto_execute": false}]',
    'system'
),
(
    'rule-new-user-001',
    'New User Large Purchase',
    'Flag large purchases by new users',
    true,
    60,
    '[{"field": "user_age_days", "operator": "less_than", "value": 7, "weight": 0.7}, {"field": "transaction_amount", "operator": "greater_than", "value": 20000, "weight": 0.3}]',
    '[{"type": "manual_review", "parameters": {"reason": "New user large purchase"}, "auto_execute": true}]',
    'system'
);

-- Insert evidence collectors
INSERT OR IGNORE INTO chargeback_evidence_collectors (
    id, name, description, evidence_type, enabled, data_source, 
    collection_query, format_template, validation_rules
) VALUES 
(
    'collector-receipt-001',
    'Receipt Generator',
    'Automatically generates receipt evidence from order data',
    'receipt',
    true,
    'database',
    'SELECT * FROM orders WHERE id = ?',
    'Transaction Receipt\nOrder: {order_number}\nDate: {created_at}\nAmount: ${total_cents/100}\nPayment Method: {payment_method}',
    '["required_fields: [order_number, created_at, total_cents]", "min_length: 50"]'
),
(
    'collector-communication-001',
    'Communication History Collector',
    'Collects customer communication records',
    'customer_communication',
    true,
    'database',
    'SELECT * FROM user_communications WHERE user_id = ? AND created_at >= ? ORDER BY created_at',
    'Customer Communication History\n{communications}',
    '["min_records: 1"]'
),
(
    'collector-terms-001',
    'Terms of Service Collector',
    'Retrieves current terms of service document',
    'terms_of_service',
    true,
    'file_system',
    '/legal/terms-of-service.pdf',
    'Terms of Service - Version {version}\nEffective Date: {effective_date}',
    '["file_exists: true", "file_size_min: 1000"]'
);