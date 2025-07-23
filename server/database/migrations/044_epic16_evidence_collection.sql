-- Epic 16 Evidence Collection Database Schema
-- 
-- Comprehensive evidence collection system for marketplace transactions,
-- compliance monitoring, audit trails, and regulatory reporting.

-- =============================================================================
-- Extensions and Configuration
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- =============================================================================
-- Evidence Collection Core Tables
-- =============================================================================

-- Evidence records table
CREATE TABLE IF NOT EXISTS epic16_evidence_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Evidence metadata
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN (
        'transaction', 'user_action', 'compliance', 'audit', 'security',
        'performance', 'refund', 'dispute', 'moderation', 'api_access',
        'content_interaction', 'privacy'
    )),
    category VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    
    -- Core identification
    user_id UUID, -- References Epic 11 users table
    session_id UUID,
    template_id UUID, -- References Epic 16 templates
    transaction_id UUID, -- References transactions
    
    -- Evidence integrity
    content_hash CHAR(64) NOT NULL, -- SHA-256 hash
    chain_hash CHAR(64), -- Blockchain-style chaining
    digital_signature TEXT, -- Digital signature for non-repudiation
    
    -- Classification and handling
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    sensitivity VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
    retention_policy VARCHAR(50) NOT NULL CHECK (retention_policy IN (
        'transaction_data', 'user_activity', 'audit_logs', 'compliance',
        'security_events', 'performance_data'
    )),
    
    -- Compliance frameworks (JSON array)
    compliance_frameworks JSONB DEFAULT '[]',
    
    -- Legal and regulatory
    legal_hold BOOLEAN DEFAULT FALSE,
    regulatory_requirement BOOLEAN DEFAULT FALSE,
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'collected' CHECK (status IN (
        'collected', 'verified', 'archived', 'purged', 'under_review', 'flagged'
    )),
    
    -- Timestamps and lifecycle
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Searchable tags (GIN indexed)
    tags TEXT[] DEFAULT '{}',
    
    -- Context and relationships
    related_evidence_ids UUID[] DEFAULT '{}',
    parent_evidence_id UUID REFERENCES epic16_evidence_records(id),
    
    -- Constraints
    CONSTRAINT valid_hash_length CHECK (length(content_hash) = 64),
    CONSTRAINT valid_chain_hash_length CHECK (chain_hash IS NULL OR length(chain_hash) = 64),
    CONSTRAINT valid_expires_at CHECK (expires_at IS NULL OR expires_at > collected_at)
);

-- Evidence data table (for large content storage)
CREATE TABLE IF NOT EXISTS epic16_evidence_data (
    evidence_id UUID PRIMARY KEY REFERENCES epic16_evidence_records(id) ON DELETE CASCADE,
    
    -- Raw evidence content (JSONB for structured data)
    content JSONB NOT NULL,
    
    -- Environment context
    user_agent TEXT,
    ip_address INET,
    geolocation JSONB, -- { country, region, city }
    device_info JSONB,
    
    -- API context
    api_endpoint VARCHAR(200),
    api_method VARCHAR(10) CHECK (api_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    status_code SMALLINT CHECK (status_code BETWEEN 100 AND 599),
    response_time INTEGER, -- milliseconds
    request_id UUID,
    api_version VARCHAR(20),
    
    -- Financial transaction data
    amount_cents INTEGER CHECK (amount_cents >= 0),
    currency CHAR(3),
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(100),
    refund_amount_cents INTEGER CHECK (refund_amount_cents >= 0),
    fee_amount_cents INTEGER CHECK (fee_amount_cents >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence attachments table
CREATE TABLE IF NOT EXISTS epic16_evidence_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES epic16_evidence_records(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    file_hash CHAR(64) NOT NULL, -- SHA-256
    
    -- Storage information
    storage_location TEXT NOT NULL, -- S3 URL or file path
    encryption_key_id VARCHAR(100), -- KMS key ID for encrypted files
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_file_hash_length CHECK (length(file_hash) = 64),
    CONSTRAINT valid_filename CHECK (length(filename) > 0)
);

-- Evidence verification chain table
CREATE TABLE IF NOT EXISTS epic16_evidence_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES epic16_evidence_records(id) ON DELETE CASCADE,
    
    -- Verification details
    verifier_id UUID NOT NULL, -- User or system that performed verification
    verification_method VARCHAR(100) NOT NULL,
    verification_result VARCHAR(20) NOT NULL CHECK (verification_result IN ('passed', 'failed', 'warning')),
    verification_notes TEXT,
    
    -- Verification data
    checks_performed JSONB, -- Detailed check results
    verification_score DECIMAL(5,2) CHECK (verification_score BETWEEN 0 AND 100),
    
    -- Timestamps
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence access log table
CREATE TABLE IF NOT EXISTS epic16_evidence_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES epic16_evidence_records(id) ON DELETE CASCADE,
    
    -- Access details
    accessed_by UUID NOT NULL, -- User who accessed the evidence
    access_action VARCHAR(20) NOT NULL CHECK (access_action IN ('read', 'verify', 'export', 'purge', 'update')),
    access_reason VARCHAR(200),
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    
    -- Timestamps
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence collection rules table
CREATE TABLE IF NOT EXISTS epic16_evidence_collection_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule identification
    rule_name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    rule_category VARCHAR(50) NOT NULL,
    
    -- Rule configuration
    triggers JSONB NOT NULL, -- Event triggers for rule activation
    conditions JSONB NOT NULL, -- Conditions that must be met
    actions JSONB NOT NULL, -- Actions to take when rule fires
    
    -- Rule properties
    priority INTEGER NOT NULL DEFAULT 50 CHECK (priority BETWEEN 1 AND 100),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_frameworks JSONB DEFAULT '[]',
    
    -- Performance tracking
    execution_count INTEGER DEFAULT 0 CHECK (execution_count >= 0),
    success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
    last_executed_at TIMESTAMP WITH TIME ZONE,
    average_execution_time INTEGER, -- milliseconds
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence collection performance metrics
CREATE TABLE IF NOT EXISTS epic16_evidence_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    
    -- Collection metrics
    total_collected INTEGER DEFAULT 0 CHECK (total_collected >= 0),
    total_verified INTEGER DEFAULT 0 CHECK (total_verified >= 0),
    total_archived INTEGER DEFAULT 0 CHECK (total_archived >= 0),
    total_purged INTEGER DEFAULT 0 CHECK (total_purged >= 0),
    
    -- Performance metrics
    average_collection_time INTEGER, -- milliseconds
    average_verification_time INTEGER, -- milliseconds
    collection_failure_rate DECIMAL(5,2) CHECK (collection_failure_rate BETWEEN 0 AND 100),
    verification_failure_rate DECIMAL(5,2) CHECK (verification_failure_rate BETWEEN 0 AND 100),
    
    -- Storage metrics
    total_storage_bytes BIGINT DEFAULT 0 CHECK (total_storage_bytes >= 0),
    attachment_storage_bytes BIGINT DEFAULT 0 CHECK (attachment_storage_bytes >= 0),
    
    -- Compliance metrics by framework
    gdpr_compliance_rate DECIMAL(5,2) CHECK (gdpr_compliance_rate BETWEEN 0 AND 100),
    psd3_compliance_rate DECIMAL(5,2) CHECK (psd3_compliance_rate BETWEEN 0 AND 100),
    stripe_ai_compliance_rate DECIMAL(5,2) CHECK (stripe_ai_compliance_rate BETWEEN 0 AND 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(metric_date)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Evidence records indexes
CREATE INDEX idx_epic16_evidence_records_type ON epic16_evidence_records (evidence_type);
CREATE INDEX idx_epic16_evidence_records_user_id ON epic16_evidence_records (user_id);
CREATE INDEX idx_epic16_evidence_records_template_id ON epic16_evidence_records (template_id);
CREATE INDEX idx_epic16_evidence_records_transaction_id ON epic16_evidence_records (transaction_id);
CREATE INDEX idx_epic16_evidence_records_status ON epic16_evidence_records (status);
CREATE INDEX idx_epic16_evidence_records_collected_at ON epic16_evidence_records (collected_at DESC);
CREATE INDEX idx_epic16_evidence_records_expires_at ON epic16_evidence_records (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_epic16_evidence_records_severity ON epic16_evidence_records (severity, status);
CREATE INDEX idx_epic16_evidence_records_compliance ON epic16_evidence_records USING gin (compliance_frameworks);
CREATE INDEX idx_epic16_evidence_records_tags ON epic16_evidence_records USING gin (tags);
CREATE INDEX idx_epic16_evidence_records_hash ON epic16_evidence_records (content_hash);
CREATE INDEX idx_epic16_evidence_records_chain ON epic16_evidence_records (chain_hash) WHERE chain_hash IS NOT NULL;

-- Evidence data indexes
CREATE INDEX idx_epic16_evidence_data_amount ON epic16_evidence_data (amount_cents) WHERE amount_cents IS NOT NULL;
CREATE INDEX idx_epic16_evidence_data_currency ON epic16_evidence_data (currency) WHERE currency IS NOT NULL;
CREATE INDEX idx_epic16_evidence_data_payment_method ON epic16_evidence_data (payment_method) WHERE payment_method IS NOT NULL;
CREATE INDEX idx_epic16_evidence_data_stripe_intent ON epic16_evidence_data (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_epic16_evidence_data_content ON epic16_evidence_data USING gin (content);

-- Evidence verification indexes
CREATE INDEX idx_epic16_evidence_verification_evidence_id ON epic16_evidence_verification (evidence_id);
CREATE INDEX idx_epic16_evidence_verification_verifier ON epic16_evidence_verification (verifier_id);
CREATE INDEX idx_epic16_evidence_verification_result ON epic16_evidence_verification (verification_result);
CREATE INDEX idx_epic16_evidence_verification_verified_at ON epic16_evidence_verification (verified_at DESC);

-- Evidence access log indexes
CREATE INDEX idx_epic16_evidence_access_log_evidence_id ON epic16_evidence_access_log (evidence_id);
CREATE INDEX idx_epic16_evidence_access_log_accessed_by ON epic16_evidence_access_log (accessed_by);
CREATE INDEX idx_epic16_evidence_access_log_action ON epic16_evidence_access_log (access_action);
CREATE INDEX idx_epic16_evidence_access_log_accessed_at ON epic16_evidence_access_log (accessed_at DESC);

-- Collection rules indexes
CREATE INDEX idx_epic16_evidence_collection_rules_category ON epic16_evidence_collection_rules (rule_category);
CREATE INDEX idx_epic16_evidence_collection_rules_enabled ON epic16_evidence_collection_rules (enabled) WHERE enabled = TRUE;
CREATE INDEX idx_epic16_evidence_collection_rules_priority ON epic16_evidence_collection_rules (priority DESC) WHERE enabled = TRUE;

-- Performance metrics indexes
CREATE INDEX idx_epic16_evidence_metrics_date ON epic16_evidence_metrics (metric_date DESC);

-- =============================================================================
-- Full-Text Search
-- =============================================================================

-- Create full-text search index for evidence content
CREATE INDEX idx_epic16_evidence_records_search ON epic16_evidence_records 
USING gin (to_tsvector('english', 
    COALESCE(source, '') || ' ' || 
    COALESCE(category, '') || ' ' || 
    COALESCE(array_to_string(tags, ' '), '')
));

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Function to update chain hash on new evidence
CREATE OR REPLACE FUNCTION epic16_update_evidence_chain()
RETURNS TRIGGER AS $$
DECLARE
    last_hash TEXT;
BEGIN
    -- Get the hash of the most recent evidence record
    SELECT content_hash INTO last_hash
    FROM epic16_evidence_records
    WHERE collected_at < NEW.collected_at
    ORDER BY collected_at DESC
    LIMIT 1;
    
    -- Calculate chain hash if there's a previous record
    IF last_hash IS NOT NULL THEN
        NEW.chain_hash := encode(digest(last_hash || NEW.content_hash, 'sha256'), 'hex');
    ELSE
        NEW.chain_hash := NEW.content_hash;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update chain hash
CREATE TRIGGER trigger_epic16_update_evidence_chain
    BEFORE INSERT ON epic16_evidence_records
    FOR EACH ROW
    EXECUTE FUNCTION epic16_update_evidence_chain();

-- Function to automatically archive expired evidence
CREATE OR REPLACE FUNCTION epic16_archive_expired_evidence()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE epic16_evidence_records
    SET status = 'archived',
        archived_at = NOW()
    WHERE expires_at < NOW()
      AND status NOT IN ('archived', 'purged')
      AND legal_hold = FALSE;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update evidence data timestamps
CREATE OR REPLACE FUNCTION epic16_update_evidence_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update evidence data timestamps
CREATE TRIGGER trigger_epic16_update_evidence_data_timestamp
    BEFORE UPDATE ON epic16_evidence_data
    FOR EACH ROW
    EXECUTE FUNCTION epic16_update_evidence_data_timestamp();

-- Function to log evidence access
CREATE OR REPLACE FUNCTION epic16_log_evidence_access(
    p_evidence_id UUID,
    p_accessed_by UUID,
    p_action VARCHAR,
    p_reason VARCHAR DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    access_log_id UUID;
BEGIN
    INSERT INTO epic16_evidence_access_log (
        evidence_id,
        accessed_by,
        access_action,
        access_reason,
        ip_address,
        user_agent,
        session_id
    ) VALUES (
        p_evidence_id,
        p_accessed_by,
        p_action,
        p_reason,
        p_ip_address,
        p_user_agent,
        p_session_id
    ) RETURNING id INTO access_log_id;
    
    RETURN access_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get evidence integrity status
CREATE OR REPLACE FUNCTION epic16_verify_evidence_integrity(p_evidence_id UUID)
RETURNS TABLE (
    evidence_id UUID,
    hash_verified BOOLEAN,
    chain_verified BOOLEAN,
    verification_count INTEGER,
    last_verified_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id,
        er.content_hash = encode(digest(ed.content::text, 'sha256'), 'hex') as hash_verified,
        CASE 
            WHEN er.chain_hash IS NULL THEN TRUE
            ELSE er.chain_hash = (
                SELECT encode(digest(
                    COALESCE(prev.content_hash, '') || er.content_hash, 
                    'sha256'
                ), 'hex')
                FROM epic16_evidence_records prev
                WHERE prev.collected_at < er.collected_at
                ORDER BY prev.collected_at DESC
                LIMIT 1
            )
        END as chain_verified,
        (SELECT COUNT(*) FROM epic16_evidence_verification WHERE evidence_id = er.id)::INTEGER,
        (SELECT MAX(verified_at) FROM epic16_evidence_verification WHERE evidence_id = er.id)
    FROM epic16_evidence_records er
    LEFT JOIN epic16_evidence_data ed ON er.id = ed.evidence_id
    WHERE er.id = p_evidence_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance status for evidence
CREATE OR REPLACE FUNCTION epic16_get_compliance_status(
    p_framework VARCHAR,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    framework VARCHAR,
    total_evidence INTEGER,
    compliant_evidence INTEGER,
    compliance_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_framework::VARCHAR,
        COUNT(*)::INTEGER as total_evidence,
        COUNT(CASE WHEN ev.verification_result = 'passed' THEN 1 END)::INTEGER as compliant_evidence,
        ROUND(
            (COUNT(CASE WHEN ev.verification_result = 'passed' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as compliance_rate
    FROM epic16_evidence_records er
    LEFT JOIN epic16_evidence_verification ev ON er.id = ev.evidence_id
    WHERE er.compliance_frameworks ? p_framework
      AND (p_start_date IS NULL OR er.collected_at::date >= p_start_date)
      AND (p_end_date IS NULL OR er.collected_at::date <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- View for evidence summary with verification status
CREATE OR REPLACE VIEW epic16_evidence_summary AS
SELECT 
    er.id,
    er.evidence_type,
    er.category,
    er.source,
    er.user_id,
    er.template_id,
    er.transaction_id,
    er.severity,
    er.status,
    er.collected_at,
    er.expires_at,
    er.tags,
    
    -- Verification summary
    COALESCE(v.verification_count, 0) as verification_count,
    v.latest_verification_result,
    v.latest_verification_at,
    
    -- Access summary
    COALESCE(a.access_count, 0) as access_count,
    a.latest_access_at,
    
    -- Data size
    COALESCE(ed.content_size, 0) as content_size_bytes,
    COALESCE(att.attachment_count, 0) as attachment_count,
    COALESCE(att.total_attachment_size, 0) as attachment_size_bytes
    
FROM epic16_evidence_records er
LEFT JOIN (
    SELECT 
        evidence_id,
        COUNT(*) as verification_count,
        MAX(verification_result) as latest_verification_result,
        MAX(verified_at) as latest_verification_at
    FROM epic16_evidence_verification
    GROUP BY evidence_id
) v ON er.id = v.evidence_id
LEFT JOIN (
    SELECT 
        evidence_id,
        COUNT(*) as access_count,
        MAX(accessed_at) as latest_access_at
    FROM epic16_evidence_access_log
    GROUP BY evidence_id
) a ON er.id = a.evidence_id
LEFT JOIN (
    SELECT 
        evidence_id,
        length(content::text) as content_size
    FROM epic16_evidence_data
) ed ON er.id = ed.evidence_id
LEFT JOIN (
    SELECT 
        evidence_id,
        COUNT(*) as attachment_count,
        SUM(file_size) as total_attachment_size
    FROM epic16_evidence_attachments
    GROUP BY evidence_id
) att ON er.id = att.evidence_id;

-- View for compliance dashboard
CREATE OR REPLACE VIEW epic16_compliance_dashboard AS
SELECT 
    DATE_TRUNC('month', collected_at) as month,
    evidence_type,
    framework,
    COUNT(*) as total_evidence,
    COUNT(CASE WHEN latest_verification_result = 'passed' THEN 1 END) as verified_evidence,
    ROUND(
        (COUNT(CASE WHEN latest_verification_result = 'passed' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as compliance_rate
FROM epic16_evidence_summary er
CROSS JOIN LATERAL unnest(
    CASE 
        WHEN er.id IN (
            SELECT id FROM epic16_evidence_records 
            WHERE compliance_frameworks ? 'gdpr'
        ) THEN ARRAY['gdpr']
        ELSE ARRAY[]::text[]
    END ||
    CASE 
        WHEN er.id IN (
            SELECT id FROM epic16_evidence_records 
            WHERE compliance_frameworks ? 'psd3'
        ) THEN ARRAY['psd3']
        ELSE ARRAY[]::text[]
    END ||
    CASE 
        WHEN er.id IN (
            SELECT id FROM epic16_evidence_records 
            WHERE compliance_frameworks ? 'stripe_ai_policy'
        ) THEN ARRAY['stripe_ai_policy']
        ELSE ARRAY[]::text[]
    END
) AS framework
WHERE framework IS NOT NULL
GROUP BY DATE_TRUNC('month', collected_at), evidence_type, framework
ORDER BY month DESC, evidence_type, framework;

-- =============================================================================
-- Sample Data and Testing
-- =============================================================================

-- Insert sample collection rules
INSERT INTO epic16_evidence_collection_rules (
    rule_name,
    description,
    rule_category,
    triggers,
    conditions,
    actions,
    priority,
    compliance_frameworks
) VALUES 
(
    'Transaction Evidence Collection',
    'Automatically collect evidence for all marketplace transactions',
    'financial',
    '{"events": ["transaction.completed", "transaction.failed"]}',
    '{"amount": {"operator": "greater_than", "value": 0}}',
    '{"collect": {"immediate_verification": true, "retention_policy": "transaction_data"}}',
    90,
    '["psd3", "stripe_ai_policy"]'
),
(
    'GDPR User Action Tracking',
    'Collect evidence for user actions requiring GDPR compliance',
    'privacy',
    '{"events": ["user.action", "user.data_access", "user.data_deletion"]}',
    '{"user_consent": {"operator": "equals", "value": true}}',
    '{"collect": {"sensitivity": "confidential", "retention_policy": "user_activity"}}',
    80,
    '["gdpr"]'
),
(
    'High-Value Transaction Monitoring',
    'Enhanced evidence collection for high-value transactions',
    'financial',
    '{"events": ["transaction.completed"]}',
    '{"amount": {"operator": "greater_than", "value": 10000}}',
    '{"collect": {"severity": "critical", "immediate_verification": true}, "alert": {"notify_compliance_team": true}}',
    95,
    '["psd3", "sox"]'
);

-- Create performance tracking function
CREATE OR REPLACE FUNCTION epic16_update_daily_metrics()
RETURNS VOID AS $$
DECLARE
    metric_date DATE := CURRENT_DATE - INTERVAL '1 day';
    collected_count INTEGER;
    verified_count INTEGER;
    archived_count INTEGER;
    avg_collection_time INTEGER;
    avg_verification_time INTEGER;
BEGIN
    -- Calculate daily metrics
    SELECT COUNT(*) INTO collected_count
    FROM epic16_evidence_records
    WHERE collected_at::date = metric_date;
    
    SELECT COUNT(*) INTO verified_count
    FROM epic16_evidence_verification
    WHERE verified_at::date = metric_date;
    
    SELECT COUNT(*) INTO archived_count
    FROM epic16_evidence_records
    WHERE archived_at::date = metric_date;
    
    -- Insert or update daily metrics
    INSERT INTO epic16_evidence_metrics (
        metric_date,
        total_collected,
        total_verified,
        total_archived
    ) VALUES (
        metric_date,
        collected_count,
        verified_count,
        archived_count
    )
    ON CONFLICT (metric_date) DO UPDATE SET
        total_collected = EXCLUDED.total_collected,
        total_verified = EXCLUDED.total_verified,
        total_archived = EXCLUDED.total_archived;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE epic16_evidence_records IS 'Core evidence collection records with metadata and integrity tracking';
COMMENT ON TABLE epic16_evidence_data IS 'Detailed evidence content and context data';
COMMENT ON TABLE epic16_evidence_verification IS 'Evidence verification chain and audit trail';
COMMENT ON TABLE epic16_evidence_access_log IS 'Complete access log for all evidence interactions';
COMMENT ON TABLE epic16_evidence_collection_rules IS 'Configurable rules for automated evidence collection';
COMMENT ON TABLE epic16_evidence_metrics IS 'Daily performance and compliance metrics';

COMMENT ON FUNCTION epic16_update_evidence_chain() IS 'Automatically maintains blockchain-style evidence chain integrity';
COMMENT ON FUNCTION epic16_archive_expired_evidence() IS 'Archives evidence records that have reached their retention expiration';
COMMENT ON FUNCTION epic16_verify_evidence_integrity(UUID) IS 'Verifies hash and chain integrity for a specific evidence record';
COMMENT ON FUNCTION epic16_get_compliance_status(VARCHAR, DATE, DATE) IS 'Returns compliance metrics for a specific framework and date range';
COMMENT ON FUNCTION epic16_update_daily_metrics() IS 'Updates daily performance metrics - intended for cron job execution';

-- Grant appropriate permissions
-- GRANT SELECT, INSERT, UPDATE ON epic16_evidence_records TO marketplace_service;
-- GRANT SELECT, INSERT, UPDATE ON epic16_evidence_data TO marketplace_service;
-- GRANT SELECT, INSERT ON epic16_evidence_verification TO marketplace_service;
-- GRANT SELECT, INSERT ON epic16_evidence_access_log TO marketplace_service;
-- GRANT SELECT ON epic16_evidence_summary TO marketplace_service;
-- GRANT SELECT ON epic16_compliance_dashboard TO marketplace_service;