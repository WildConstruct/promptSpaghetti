-- Automated Categorization System Migration
-- Task: E17-1753114396898-873EBB - Implement automated categorization
-- Creates comprehensive system for automated categorization and assignment

-- Main categorization requests table
CREATE TABLE IF NOT EXISTS epic17_categorization_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('content', 'user', 'api_key', 'task', 'permission', 'role', 'general')),
    item_data JSONB NOT NULL,
    
    -- Request details
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Request context
    context JSONB DEFAULT '{}',
    options JSONB DEFAULT '{}',
    
    -- Processing status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'manual_review')),
    started_processing_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorization results table
CREATE TABLE IF NOT EXISTS epic17_categorization_results (
    result_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES epic17_categorization_requests(request_id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    
    -- Categorization results
    primary_category VARCHAR(255) NOT NULL,
    subcategories JSONB DEFAULT '[]',
    confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    
    -- Risk assessment
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_flags JSONB DEFAULT '[]',
    security_flags JSONB DEFAULT '[]',
    
    -- Processing details
    processing_method VARCHAR(20) NOT NULL CHECK (processing_method IN ('rule_based', 'ml_based', 'hybrid')),
    rules_applied JSONB DEFAULT '[]',
    ml_models_used JSONB DEFAULT '[]',
    
    -- Result metadata
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by VARCHAR(255) DEFAULT 'system',
    processing_time INTEGER, -- milliseconds
    review_required BOOLEAN DEFAULT FALSE,
    review_reason TEXT,
    
    -- Additional data
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    reasoning_chain JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-assignments table
CREATE TABLE IF NOT EXISTS epic17_auto_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES epic17_categorization_results(result_id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES epic17_categorization_requests(request_id) ON DELETE CASCADE,
    
    -- Assignment details
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('user', 'team', 'role', 'permission', 'queue', 'workflow')),
    assignment_target VARCHAR(255) NOT NULL,
    assignment_reason TEXT NOT NULL,
    confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    
    -- Assignment status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'rejected')),
    executed_at TIMESTAMP WITH TIME ZONE,
    executed_by VARCHAR(255),
    
    -- Assignment conditions
    conditions JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorization rules table
CREATE TABLE IF NOT EXISTS epic17_categorization_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100,
    
    -- Rule applicability
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('content', 'user', 'api_key', 'task', 'permission', 'role', 'general')),
    
    -- Rule logic
    triggers JSONB NOT NULL DEFAULT '[]',
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    
    -- Rule configuration
    confidence_boost INTEGER DEFAULT 0 CHECK (confidence_boost >= -50 AND confidence_boost <= 50),
    requires_review BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]',
    
    -- Rule metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Usage statistics
    times_triggered INTEGER DEFAULT 0,
    last_triggered TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0,
    average_confidence DECIMAL(5,2) DEFAULT 0
);

-- Category definitions table
CREATE TABLE IF NOT EXISTS epic17_category_definitions (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('content', 'user', 'api_key', 'task', 'permission', 'role', 'general')),
    
    -- Category hierarchy
    parent_category UUID REFERENCES epic17_category_definitions(category_id),
    level INTEGER DEFAULT 0 CHECK (level >= 0),
    
    -- Category properties
    default_risk_level VARCHAR(20) DEFAULT 'medium' CHECK (default_risk_level IN ('low', 'medium', 'high', 'critical')),
    default_assignments JSONB DEFAULT '[]',
    required_permissions JSONB DEFAULT '[]',
    compliance_requirements JSONB DEFAULT '[]',
    
    -- Category configuration
    auto_assignment_enabled BOOLEAN DEFAULT TRUE,
    confidence_threshold DECIMAL(5,2) DEFAULT 70 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 100),
    review_required BOOLEAN DEFAULT FALSE,
    
    -- Category metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Usage statistics
    items_categorized INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    average_confidence DECIMAL(5,2) DEFAULT 0,
    
    -- ML training data
    training_examples JSONB DEFAULT '[]'
);

-- Category subcategories relationship table
CREATE TABLE IF NOT EXISTS epic17_category_subcategories (
    parent_category_id UUID NOT NULL REFERENCES epic17_category_definitions(category_id) ON DELETE CASCADE,
    subcategory_id UUID NOT NULL REFERENCES epic17_category_definitions(category_id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'subcategory',
    weight DECIMAL(5,2) DEFAULT 1.0,
    
    PRIMARY KEY (parent_category_id, subcategory_id)
);

-- Processing queue table for async processing
CREATE TABLE IF NOT EXISTS epic17_categorization_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES epic17_categorization_requests(request_id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 100,
    
    -- Queue management
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timing
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_processing_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    last_error TEXT,
    error_details JSONB DEFAULT '{}'
);

-- Indexes for optimal query performance

-- Categorization requests indexes
CREATE INDEX IF NOT EXISTS idx_categorization_requests_item 
ON epic17_categorization_requests(item_type, item_id);

CREATE INDEX IF NOT EXISTS idx_categorization_requests_status 
ON epic17_categorization_requests(status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_categorization_requests_requested_by 
ON epic17_categorization_requests(requested_by, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_categorization_requests_priority 
ON epic17_categorization_requests(priority, requested_at DESC);

-- Categorization results indexes
CREATE INDEX IF NOT EXISTS idx_categorization_results_request 
ON epic17_categorization_results(request_id);

CREATE INDEX IF NOT EXISTS idx_categorization_results_category 
ON epic17_categorization_results(primary_category, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_categorization_results_confidence 
ON epic17_categorization_results(confidence DESC, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_categorization_results_risk_level 
ON epic17_categorization_results(risk_level, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_categorization_results_review 
ON epic17_categorization_results(review_required, processed_at DESC) WHERE review_required = TRUE;

-- Auto-assignments indexes
CREATE INDEX IF NOT EXISTS idx_auto_assignments_result 
ON epic17_auto_assignments(result_id);

CREATE INDEX IF NOT EXISTS idx_auto_assignments_status 
ON epic17_auto_assignments(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auto_assignments_type_target 
ON epic17_auto_assignments(assignment_type, assignment_target);

-- Categorization rules indexes
CREATE INDEX IF NOT EXISTS idx_categorization_rules_item_type 
ON epic17_categorization_rules(item_type, enabled, priority DESC);

CREATE INDEX IF NOT EXISTS idx_categorization_rules_enabled 
ON epic17_categorization_rules(enabled, priority DESC) WHERE enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_categorization_rules_usage 
ON epic17_categorization_rules(times_triggered DESC, success_rate DESC);

-- Category definitions indexes
CREATE INDEX IF NOT EXISTS idx_category_definitions_type 
ON epic17_category_definitions(type, name);

CREATE INDEX IF NOT EXISTS idx_category_definitions_parent 
ON epic17_category_definitions(parent_category, level);

CREATE INDEX IF NOT EXISTS idx_category_definitions_usage 
ON epic17_category_definitions(items_categorized DESC, last_used DESC);

-- Processing queue indexes
CREATE INDEX IF NOT EXISTS idx_categorization_queue_status 
ON epic17_categorization_queue(status, priority DESC, queued_at ASC);

CREATE INDEX IF NOT EXISTS idx_categorization_queue_retry 
ON epic17_categorization_queue(next_retry_at ASC) WHERE status = 'failed' AND attempts < max_attempts;

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_categorization_requests_item_data_gin 
ON epic17_categorization_requests USING GIN(item_data);

CREATE INDEX IF NOT EXISTS idx_categorization_requests_context_gin 
ON epic17_categorization_requests USING GIN(context);

CREATE INDEX IF NOT EXISTS idx_categorization_results_subcategories_gin 
ON epic17_categorization_results USING GIN(subcategories);

CREATE INDEX IF NOT EXISTS idx_categorization_results_tags_gin 
ON epic17_categorization_results USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_categorization_results_security_flags_gin 
ON epic17_categorization_results USING GIN(security_flags);

CREATE INDEX IF NOT EXISTS idx_categorization_rules_triggers_gin 
ON epic17_categorization_rules USING GIN(triggers);

CREATE INDEX IF NOT EXISTS idx_categorization_rules_conditions_gin 
ON epic17_categorization_rules USING GIN(conditions);

CREATE INDEX IF NOT EXISTS idx_categorization_rules_actions_gin 
ON epic17_categorization_rules USING GIN(actions);

-- Views for common categorization queries

-- Active categorization requests view
CREATE OR REPLACE VIEW epic17_active_categorization_requests AS
SELECT 
    cr.request_id,
    cr.item_id,
    cr.item_type,
    cr.requested_by,
    cr.requested_at,
    cr.priority,
    cr.status,
    u.email as requested_by_email,
    
    -- Processing time calculation
    CASE 
        WHEN cr.status = 'processing' 
        THEN EXTRACT(EPOCH FROM (NOW() - cr.started_processing_at)) * 1000
        WHEN cr.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (cr.completed_at - cr.started_processing_at)) * 1000
        ELSE NULL 
    END as processing_time_ms,
    
    -- Queue position for pending requests
    CASE 
        WHEN cr.status = 'pending' 
        THEN (
            SELECT COUNT(*) 
            FROM epic17_categorization_requests cr2 
            WHERE cr2.status = 'pending' 
            AND (cr2.priority > cr.priority OR (cr2.priority = cr.priority AND cr2.requested_at < cr.requested_at))
        ) + 1
        ELSE NULL 
    END as queue_position
    
FROM epic17_categorization_requests cr
JOIN users u ON cr.requested_by = u.id
WHERE cr.status IN ('pending', 'processing', 'manual_review')
ORDER BY cr.priority DESC, cr.requested_at ASC;

-- Categorization results summary view
CREATE OR REPLACE VIEW epic17_categorization_results_summary AS
SELECT 
    cr.result_id,
    cr.request_id,
    cr.item_id,
    cr.item_type,
    cr.primary_category,
    cr.confidence,
    cr.confidence_level,
    cr.risk_level,
    cr.review_required,
    cr.processed_at,
    cr.processing_time,
    
    -- Category definition info
    cd.name as category_name,
    cd.description as category_description,
    cd.default_risk_level as category_default_risk,
    
    -- Assignment counts
    COALESCE(aa_stats.assignment_count, 0) as assignment_count,
    COALESCE(aa_stats.executed_count, 0) as executed_assignment_count,
    
    -- Request info
    req.requested_by,
    req.requested_at,
    req.priority,
    u.email as requested_by_email
    
FROM epic17_categorization_results cr
LEFT JOIN epic17_category_definitions cd ON cr.primary_category = cd.name
LEFT JOIN epic17_categorization_requests req ON cr.request_id = req.request_id
LEFT JOIN users u ON req.requested_by = u.id
LEFT JOIN (
    SELECT 
        result_id,
        COUNT(*) as assignment_count,
        SUM(CASE WHEN status = 'executed' THEN 1 ELSE 0 END) as executed_count
    FROM epic17_auto_assignments
    GROUP BY result_id
) aa_stats ON cr.result_id = aa_stats.result_id
ORDER BY cr.processed_at DESC;

-- Categorization performance view
CREATE OR REPLACE VIEW epic17_categorization_performance AS
SELECT 
    item_type,
    primary_category,
    
    -- Volume metrics
    COUNT(*) as total_categorizations,
    COUNT(*) FILTER (WHERE confidence >= 80) as high_confidence_count,
    COUNT(*) FILTER (WHERE review_required = TRUE) as review_required_count,
    
    -- Performance metrics
    AVG(confidence) as average_confidence,
    AVG(processing_time) as average_processing_time_ms,
    
    -- Risk distribution
    COUNT(*) FILTER (WHERE risk_level = 'low') as low_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'high') as high_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_risk_count,
    
    -- Method breakdown
    COUNT(*) FILTER (WHERE processing_method = 'rule_based') as rule_based_count,
    COUNT(*) FILTER (WHERE processing_method = 'ml_based') as ml_based_count,
    COUNT(*) FILTER (WHERE processing_method = 'hybrid') as hybrid_count,
    
    -- Time period
    DATE_TRUNC('day', processed_at) as processing_date,
    MIN(processed_at) as first_processed,
    MAX(processed_at) as last_processed
    
FROM epic17_categorization_results
GROUP BY item_type, primary_category, DATE_TRUNC('day', processed_at)
ORDER BY processing_date DESC, total_categorizations DESC;

-- Functions for categorization management

-- Function to update categorization rule usage statistics
CREATE OR REPLACE FUNCTION update_categorization_rule_usage(
    p_rule_id UUID,
    p_success BOOLEAN,
    p_confidence DECIMAL(5,2)
)
RETURNS VOID AS $$
DECLARE
    current_stats RECORD;
    new_success_rate DECIMAL(5,2);
    new_avg_confidence DECIMAL(5,2);
BEGIN
    SELECT times_triggered, success_rate, average_confidence 
    INTO current_stats
    FROM epic17_categorization_rules 
    WHERE rule_id = p_rule_id;
    
    IF FOUND THEN
        -- Calculate new success rate
        IF p_success THEN
            new_success_rate := ((current_stats.success_rate * current_stats.times_triggered) + 100) / (current_stats.times_triggered + 1);
        ELSE
            new_success_rate := (current_stats.success_rate * current_stats.times_triggered) / (current_stats.times_triggered + 1);
        END IF;
        
        -- Calculate new average confidence
        new_avg_confidence := ((current_stats.average_confidence * current_stats.times_triggered) + p_confidence) / (current_stats.times_triggered + 1);
        
        UPDATE epic17_categorization_rules 
        SET 
            times_triggered = current_stats.times_triggered + 1,
            last_triggered = NOW(),
            success_rate = new_success_rate,
            average_confidence = new_avg_confidence
        WHERE rule_id = p_rule_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update category definition usage statistics
CREATE OR REPLACE FUNCTION update_category_definition_usage(
    p_category_name VARCHAR(255),
    p_confidence DECIMAL(5,2)
)
RETURNS VOID AS $$
DECLARE
    current_stats RECORD;
    new_avg_confidence DECIMAL(5,2);
BEGIN
    SELECT items_categorized, average_confidence 
    INTO current_stats
    FROM epic17_category_definitions 
    WHERE name = p_category_name;
    
    IF FOUND THEN
        -- Calculate new average confidence
        new_avg_confidence := ((current_stats.average_confidence * current_stats.items_categorized) + p_confidence) / (current_stats.items_categorized + 1);
        
        UPDATE epic17_category_definitions 
        SET 
            items_categorized = current_stats.items_categorized + 1,
            last_used = NOW(),
            average_confidence = new_avg_confidence
        WHERE name = p_category_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old categorization data
CREATE OR REPLACE FUNCTION cleanup_old_categorization_data(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old auto-assignments first (foreign key constraint)
    DELETE FROM epic17_auto_assignments 
    WHERE created_at < cutoff_date;
    
    -- Delete old results
    DELETE FROM epic17_categorization_results 
    WHERE processed_at < cutoff_date;
    
    -- Delete old completed requests
    DELETE FROM epic17_categorization_requests 
    WHERE completed_at < cutoff_date 
    AND status IN ('completed', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up queue entries
    DELETE FROM epic17_categorization_queue 
    WHERE completed_at < cutoff_date;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic maintenance

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categorization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categorization_requests_updated_at_trigger
    BEFORE UPDATE ON epic17_categorization_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_categorization_updated_at();

CREATE TRIGGER auto_assignments_updated_at_trigger
    BEFORE UPDATE ON epic17_auto_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_categorization_updated_at();

-- Insert default categorization rules
INSERT INTO epic17_categorization_rules (
    name, description, item_type, triggers, conditions, actions, priority, enabled, created_by
) VALUES 
-- Content categorization rules
(
    'Security Content Detection',
    'Detects security-related content based on keywords and patterns',
    'content',
    '[{"field": "content", "operator": "contains", "value": "security|vulnerability|exploit|malware|phishing", "weight": 90}]',
    '[{"field": "content", "operator": "matches", "value": "\\b(password|secret|token|key)\\b", "logicalOperator": "OR"}]',
    '[{"actionType": "categorize", "parameters": {"category": "security_threat", "confidence": 85}}]',
    100,
    true,
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
),

-- User categorization rules
(
    'Admin User Detection',
    'Detects admin users based on role and permissions',
    'user',
    '[{"field": "role", "operator": "eq", "value": "admin", "weight": 100}]',
    '[]',
    '[{"actionType": "categorize", "parameters": {"category": "admin_user", "confidence": 95}}]',
    100,
    true,
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
),

-- API key categorization rules
(
    'Production API Key Detection',
    'Detects production API keys based on purpose and scope',
    'api_key',
    '[{"field": "purpose", "operator": "contains", "value": "prod|production", "weight": 90}]',
    '[{"field": "scopes", "operator": "contains", "value": "write|admin", "logicalOperator": "OR"}]',
    '[{"actionType": "categorize", "parameters": {"category": "production_api_key", "confidence": 90}}]',
    90,
    true,
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
),

-- Task categorization rules
(
    'Bug Fix Task Detection',
    'Detects bug fix tasks based on title and description',
    'task',
    '[{"field": "title", "operator": "contains", "value": "bug|fix|error|issue", "weight": 85}]',
    '[]',
    '[{"actionType": "categorize", "parameters": {"category": "bug_fix", "confidence": 80}}]',
    80,
    true,
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
)
ON CONFLICT (name) DO NOTHING;

-- Insert default category definitions
INSERT INTO epic17_category_definitions (
    name, description, type, default_risk_level, auto_assignment_enabled, created_by
) VALUES 
-- Content categories
('security_threat', 'Content identified as security threat', 'content', 'critical', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('safe_content', 'Content verified as safe', 'content', 'low', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('content_moderation', 'Content requiring moderation review', 'content', 'medium', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),

-- User categories
('admin_user', 'Administrative user account', 'user', 'high', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('developer_user', 'Developer user account', 'user', 'medium', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('user_general', 'General user account', 'user', 'low', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),

-- API key categories
('production_api_key', 'Production environment API key', 'api_key', 'high', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('development_api_key', 'Development environment API key', 'api_key', 'low', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('administrative_api_key', 'Administrative API key', 'api_key', 'critical', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),

-- Task categories
('bug_fix', 'Bug fix task', 'task', 'medium', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('feature_development', 'Feature development task', 'task', 'low', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),
('security_task', 'Security-related task', 'task', 'high', true, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)),

-- General categories
('uncategorized', 'Items that could not be categorized', 'general', 'medium', false, (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE epic17_categorization_requests IS 'Requests for automated categorization of various items';
COMMENT ON TABLE epic17_categorization_results IS 'Results of automated categorization processing';
COMMENT ON TABLE epic17_auto_assignments IS 'Automatic assignments generated from categorization results';
COMMENT ON TABLE epic17_categorization_rules IS 'Rules for automated categorization logic';
COMMENT ON TABLE epic17_category_definitions IS 'Definitions and configuration for categories';
COMMENT ON TABLE epic17_categorization_queue IS 'Processing queue for categorization requests';

COMMENT ON VIEW epic17_active_categorization_requests IS 'Currently active categorization requests with processing status';
COMMENT ON VIEW epic17_categorization_results_summary IS 'Summary view of categorization results with related data';
COMMENT ON VIEW epic17_categorization_performance IS 'Performance metrics for categorization system';

COMMENT ON FUNCTION update_categorization_rule_usage(UUID, BOOLEAN, DECIMAL) IS 'Updates usage statistics for categorization rules';
COMMENT ON FUNCTION update_category_definition_usage(VARCHAR, DECIMAL) IS 'Updates usage statistics for category definitions';
COMMENT ON FUNCTION cleanup_old_categorization_data(INTEGER) IS 'Removes old categorization data based on retention policy';