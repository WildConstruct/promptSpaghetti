-- Epic 16.2.1 Template Submission System Database Migration

-- Template submissions table
CREATE TABLE IF NOT EXISTS template_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected')),
    submission_data JSONB NOT NULL,
    validation_results JSONB DEFAULT '[]',
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_comments TEXT,
    review_score INTEGER CHECK (review_score >= 1 AND review_score <= 100),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_version_number CHECK (version_number > 0),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected')),
    CONSTRAINT valid_review_score CHECK (review_score IS NULL OR (review_score >= 1 AND review_score <= 100)),
    
    -- Unique constraint for version per template
    UNIQUE(template_id, version_number)
);

-- Submission reviews table
CREATE TABLE IF NOT EXISTS submission_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES template_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
    comments TEXT NOT NULL,
    detailed_feedback JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_decision CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
    CONSTRAINT valid_score CHECK (score >= 1 AND score <= 100)
);

-- Submission files table for uploads
CREATE TABLE IF NOT EXISTS submission_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES template_submissions(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('graph_json', 'prompt_yaml', 'asset_file', 'documentation')),
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    validation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid')),
    validation_errors JSONB DEFAULT '[]',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_file_type CHECK (file_type IN ('graph_json', 'prompt_yaml', 'asset_file', 'documentation')),
    CONSTRAINT valid_validation_status CHECK (validation_status IN ('pending', 'valid', 'invalid')),
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB max
    
    -- Unique S3 key
    UNIQUE(s3_key)
);

-- Submission validation rules table
CREATE TABLE IF NOT EXISTS submission_validation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    auto_fixable BOOLEAN DEFAULT false,
    validation_logic JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_severity CHECK (severity IN ('error', 'warning', 'info'))
);

-- Template categories updates for submission system
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS submission_guidelines TEXT;
ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS review_criteria JSONB DEFAULT '{}';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_submissions_template ON template_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON template_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON template_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON template_submissions(submitted_at DESC) WHERE submitted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer ON template_submissions(reviewer_id) WHERE reviewer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_submission ON submission_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON submission_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_decision ON submission_reviews(decision);
CREATE INDEX IF NOT EXISTS idx_reviews_score ON submission_reviews(score);

CREATE INDEX IF NOT EXISTS idx_files_submission ON submission_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON submission_files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_validation_status ON submission_files(validation_status);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON submission_files(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_rules_active ON submission_validation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_validation_rules_category ON submission_validation_rules(category);
CREATE INDEX IF NOT EXISTS idx_validation_rules_severity ON submission_validation_rules(severity);

-- Triggers for updated_at timestamps
CREATE TRIGGER trig_submissions_updated_at
    BEFORE UPDATE ON template_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_validation_rules_updated_at
    BEFORE UPDATE ON submission_validation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default validation rules
INSERT INTO submission_validation_rules (rule_id, name, description, severity, category, auto_fixable, validation_logic) VALUES
('required_title', 'Title Required', 'Template must have a title', 'error', 'metadata', false, '{"field": "title", "type": "required"}'),
('required_description', 'Description Required', 'Template must have a description of at least 10 characters', 'error', 'metadata', false, '{"field": "description", "type": "min_length", "value": 10}'),
('required_tags', 'Tags Required', 'Template must have at least one tag', 'error', 'metadata', false, '{"field": "tags", "type": "min_array_length", "value": 1}'),
('required_categories', 'Categories Required', 'Template must be assigned to at least one category', 'error', 'metadata', false, '{"field": "categories", "type": "min_array_length", "value": 1}'),
('invalid_graph_json', 'Invalid Graph JSON', 'Graph JSON must be valid and contain required fields', 'error', 'technical', false, '{"field": "graph_json", "type": "valid_json"}'),
('invalid_price', 'Invalid Price', 'Price cannot be negative', 'error', 'pricing', true, '{"field": "price_cents", "type": "min_value", "value": 0}'),
('invalid_token_estimate', 'Invalid Token Estimate', 'Token estimate should be positive', 'warning', 'technical', true, '{"field": "token_per_run_estimate", "type": "min_value", "value": 0}'),
('required_use_cases', 'Use Cases Required', 'Template must specify at least one intended use case', 'error', 'metadata', false, '{"field": "intended_use_cases", "type": "min_array_length", "value": 1}'),
('required_examples', 'Examples Required', 'Template must provide at least one example output', 'error', 'content', false, '{"field": "example_outputs", "type": "min_array_length", "value": 1}'),
('title_too_long', 'Title Too Long', 'Title is very long and may be truncated in listings', 'warning', 'usability', false, '{"field": "title", "type": "max_length", "value": 100}'),
('too_many_tags', 'Too Many Tags', 'Too many tags may reduce discoverability', 'warning', 'usability', false, '{"field": "tags", "type": "max_array_length", "value": 10}'),
('duplicate_tags', 'Duplicate Tags', 'Template has duplicate tags', 'warning', 'usability', true, '{"field": "tags", "type": "unique_array"}'),
('missing_claude_compat', 'Missing Claude Compatibility', 'Template should specify Claude model compatibility', 'warning', 'technical', false, '{"field": "claude_compat", "type": "min_array_length", "value": 1}'),
('high_token_estimate', 'High Token Estimate', 'Template has very high token usage estimate', 'warning', 'cost', false, '{"field": "token_per_run_estimate", "type": "max_value", "value": 10000}'),
('expensive_template', 'Expensive Template', 'Template price is very high', 'warning', 'pricing', false, '{"field": "price_cents", "type": "max_value", "value": 50000}')
ON CONFLICT (rule_id) DO NOTHING;

-- Create view for submission statistics
CREATE OR REPLACE VIEW submission_statistics AS
SELECT 
    s.submitter_id,
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE s.status = 'approved') as approved_submissions,
    COUNT(*) FILTER (WHERE s.status = 'rejected') as rejected_submissions,
    COUNT(*) FILTER (WHERE s.status = 'pending') as pending_submissions,
    AVG(s.review_score) FILTER (WHERE s.review_score IS NOT NULL) as avg_review_score,
    MIN(s.created_at) as first_submission_at,
    MAX(s.created_at) as last_submission_at
FROM template_submissions s
GROUP BY s.submitter_id;

-- Create view for reviewer statistics
CREATE OR REPLACE VIEW reviewer_statistics AS
SELECT 
    r.reviewer_id,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE r.decision = 'approved') as approved_reviews,
    COUNT(*) FILTER (WHERE r.decision = 'rejected') as rejected_reviews,
    COUNT(*) FILTER (WHERE r.decision = 'changes_requested') as changes_requested_reviews,
    AVG(r.score) as avg_review_score,
    MIN(r.created_at) as first_review_at,
    MAX(r.created_at) as last_review_at
FROM submission_reviews r
GROUP BY r.reviewer_id;

-- Function to get submission queue for reviewers
CREATE OR REPLACE FUNCTION get_submission_queue(reviewer_id UUID DEFAULT NULL)
RETURNS TABLE (
    submission_id UUID,
    template_title VARCHAR(255),
    submitter_name VARCHAR(255),
    submitted_at TIMESTAMPTZ,
    priority_score INTEGER,
    validation_error_count INTEGER,
    estimated_review_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as submission_id,
        t.title as template_title,
        u.name as submitter_name,
        s.submitted_at,
        CASE 
            WHEN s.submitted_at < NOW() - INTERVAL '7 days' THEN 100
            WHEN s.submitted_at < NOW() - INTERVAL '3 days' THEN 75
            WHEN s.submitted_at < NOW() - INTERVAL '1 day' THEN 50
            ELSE 25
        END as priority_score,
        (
            SELECT COUNT(*) 
            FROM jsonb_array_elements(s.validation_results) as vr
            WHERE vr->>'severity' = 'error'
        )::INTEGER as validation_error_count,
        CASE 
            WHEN (s.submission_data->>'price_cents')::INTEGER > 0 THEN 30
            ELSE 15
        END as estimated_review_time
    FROM template_submissions s
    JOIN marketplace_templates t ON s.template_id = t.id
    JOIN users u ON s.submitter_id = u.id
    WHERE s.status IN ('submitted', 'under_review')
    AND (reviewer_id IS NULL OR s.reviewer_id = reviewer_id OR s.reviewer_id IS NULL)
    ORDER BY priority_score DESC, s.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign submissions to reviewers
CREATE OR REPLACE FUNCTION auto_assign_submissions()
RETURNS void AS $$
DECLARE
    reviewer_record RECORD;
    submission_record RECORD;
    max_assignments INTEGER := 5;
BEGIN
    -- Get active reviewers
    FOR reviewer_record IN 
        SELECT id, name FROM users WHERE role = 'admin' AND is_active = true
    LOOP
        -- Get current workload
        SELECT COUNT(*) INTO max_assignments
        FROM template_submissions 
        WHERE reviewer_id = reviewer_record.id 
        AND status = 'under_review';
        
        -- Skip if reviewer has too many assignments
        IF max_assignments >= 5 THEN
            CONTINUE;
        END IF;
        
        -- Assign submissions
        FOR submission_record IN 
            SELECT * FROM get_submission_queue()
            WHERE submission_id NOT IN (
                SELECT s.id FROM template_submissions s 
                WHERE s.reviewer_id IS NOT NULL
            )
            ORDER BY priority_score DESC
            LIMIT (5 - max_assignments)
        LOOP
            UPDATE template_submissions 
            SET reviewer_id = reviewer_record.id, 
                status = 'under_review',
                updated_at = NOW()
            WHERE id = submission_record.submission_id;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;