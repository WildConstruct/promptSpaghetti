-- Epic 17.5.5 - Marketplace Verification System Database Schema

-- Verification levels enum
CREATE TYPE verification_level AS ENUM ('basic', 'intermediate', 'advanced', 'premium');

-- Verification status enum  
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'in_review', 'approved', 'rejected', 'suspended');

-- Document types enum
CREATE TYPE document_type AS ENUM ('identity', 'business_license', 'tax_document', 'bank_statement', 'portfolio', 'credential', 'other');

-- Verification request status enum
CREATE TYPE verification_request_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_additional_info');

-- Verification requests table
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_level verification_level NOT NULL,
    status verification_request_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    rejection_reason TEXT,
    information JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification documents table
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    file_type VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_upload' CHECK (status IN ('pending_upload', 'uploaded', 'processing', 'verified', 'rejected')),
    verification_notes TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User verification status table
CREATE TABLE user_verification_status (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level verification_level NOT NULL DEFAULT 'basic',
    status verification_status NOT NULL DEFAULT 'unverified',
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    trust_score INTEGER NOT NULL DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust badges table
CREATE TABLE trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    requirements JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification audit log table
CREATE TABLE verification_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_values JSONB,
    new_values JSONB,
    notes TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_submitted_at ON verification_requests(submitted_at) WHERE submitted_at IS NOT NULL;
CREATE INDEX idx_verification_requests_reviewer_id ON verification_requests(reviewer_id) WHERE reviewer_id IS NOT NULL;

CREATE INDEX idx_verification_documents_request_id ON verification_documents(verification_request_id);
CREATE INDEX idx_verification_documents_status ON verification_documents(status);
CREATE INDEX idx_verification_documents_type ON verification_documents(document_type);

CREATE INDEX idx_user_verification_status_level ON user_verification_status(current_level);
CREATE INDEX idx_user_verification_status_trust_score ON user_verification_status(trust_score);
CREATE INDEX idx_user_verification_status_expires_at ON user_verification_status(expires_at) WHERE expires_at IS NOT NULL;

-- GIN index for JSONB columns
CREATE INDEX idx_verification_requests_information_gin ON verification_requests USING GIN (information);
CREATE INDEX idx_trust_badges_requirements_gin ON trust_badges USING GIN (requirements);

-- Audit log indexes
CREATE INDEX idx_verification_audit_log_request_id ON verification_audit_log(verification_request_id);
CREATE INDEX idx_verification_audit_log_action ON verification_audit_log(action);
CREATE INDEX idx_verification_audit_log_created_at ON verification_audit_log(created_at);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_verification_requests_updated_at 
    BEFORE UPDATE ON verification_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_documents_updated_at 
    BEFORE UPDATE ON verification_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_verification_status_updated_at 
    BEFORE UPDATE ON user_verification_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default trust badges
INSERT INTO trust_badges (name, description, icon_url, requirements) VALUES
('Verified Creator', 'Successfully completed identity verification', '/badges/verified-creator.svg', 
 '{"min_verification_level": "basic", "additional_criteria": {}}'),
('Professional', 'Verified professional credentials and portfolio', '/badges/professional.svg',
 '{"min_verification_level": "intermediate", "additional_criteria": {"professional_info_complete": true}}'),
('Business Verified', 'Verified business entity with proper documentation', '/badges/business.svg',
 '{"min_verification_level": "advanced", "additional_criteria": {"business_info_complete": true}}'),
('Premium Partner', 'Premium verification with enhanced trust status', '/badges/premium.svg',
 '{"min_verification_level": "premium", "additional_criteria": {"trust_score_min": 80}}'),
('High Trust Score', 'Maintains consistently high trust score (90+)', '/badges/high-trust.svg',
 '{"min_verification_level": "basic", "additional_criteria": {"trust_score_min": 90}}'),
('Long Term Member', 'Active member for over 1 year with good standing', '/badges/veteran.svg',
 '{"min_verification_level": "basic", "additional_criteria": {"member_duration_months": 12, "no_violations": true}});

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_status ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification requests and documents
CREATE POLICY verification_requests_user_policy ON verification_requests
    FOR ALL TO authenticated USING (user_id = current_user_id());

CREATE POLICY verification_documents_user_policy ON verification_documents
    FOR ALL TO authenticated USING (
        verification_request_id IN (
            SELECT id FROM verification_requests WHERE user_id = current_user_id()
        )
    );

CREATE POLICY user_verification_status_user_policy ON user_verification_status
    FOR ALL TO authenticated USING (user_id = current_user_id());

-- Admin/reviewer policies (would need to be implemented based on role system)
-- These are placeholders - adjust based on actual role/permission system
CREATE POLICY verification_requests_admin_policy ON verification_requests
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM users WHERE id = current_user_id() AND 'admin' = ANY(roles))
    );

CREATE POLICY verification_documents_admin_policy ON verification_documents  
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM users WHERE id = current_user_id() AND 'admin' = ANY(roles))
    );

-- Comments for documentation
COMMENT ON TABLE verification_requests IS 'Stores user verification requests for marketplace trust levels';
COMMENT ON TABLE verification_documents IS 'Stores uploaded documents for verification requests';
COMMENT ON TABLE user_verification_status IS 'Current verification status and trust metrics for users';
COMMENT ON TABLE trust_badges IS 'Available trust badges and their requirements';
COMMENT ON TABLE verification_audit_log IS 'Audit trail for all verification-related actions';

COMMENT ON COLUMN verification_requests.information IS 'JSONB containing all user-submitted verification information';
COMMENT ON COLUMN user_verification_status.trust_score IS 'Trust score from 0-100 based on verification level, history, and behavior';
COMMENT ON COLUMN trust_badges.requirements IS 'JSONB defining the requirements to earn this badge';