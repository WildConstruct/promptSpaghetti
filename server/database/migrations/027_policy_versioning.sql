-- Policy Versioning Migration - E17-1753114397372-E7CDD1
-- Create policy versioning infrastructure for Epic 17 - Backstage Admin Controls

-- Create base policies table if it doesn't exist
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key VARCHAR(100) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_policies_category (category),
    INDEX idx_policies_key (policy_key)
);

-- Create policy versions table
CREATE TABLE policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    major_version INTEGER NOT NULL DEFAULT 1,
    minor_version INTEGER NOT NULL DEFAULT 0,
    patch_version INTEGER NOT NULL DEFAULT 0,
    
    -- Policy content and metadata
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    content_type VARCHAR(50) DEFAULT 'markdown',
    
    -- Version status and workflow
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'deprecated', 'archived')),
    
    -- Timing and lifecycle
    published_at TIMESTAMP NULL,
    effective_date TIMESTAMP NULL,
    expiration_date TIMESTAMP NULL,
    
    -- Change tracking
    change_summary TEXT,
    change_type VARCHAR(50) DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'fix', 'deprecation', 'rollback')),
    parent_version_id UUID NULL REFERENCES policy_versions(id),
    
    -- Authorship and approval
    created_by UUID NOT NULL,
    reviewed_by UUID NULL,
    published_by UUID NULL,
    
    -- Compliance and categorization
    compliance_frameworks TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(policy_id, version),
    
    -- Indexes
    INDEX idx_policy_versions_policy_id (policy_id),
    INDEX idx_policy_versions_status (status),
    INDEX idx_policy_versions_version (version),
    INDEX idx_policy_versions_published_at (published_at),
    INDEX idx_policy_versions_effective_date (effective_date),
    INDEX idx_policy_versions_compliance (compliance_frameworks),
    INDEX idx_policy_versions_created_by (created_by)
);

-- Create policy version changes table for detailed change tracking
CREATE TABLE policy_version_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES policy_versions(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL,
    field_path TEXT NOT NULL,
    old_value JSONB NULL,
    new_value JSONB NULL,
    change_reason TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_policy_changes_version_id (version_id),
    INDEX idx_policy_changes_type (change_type),
    INDEX idx_policy_changes_created_at (created_at)
);

-- Create policy approvals table for workflow tracking
CREATE TABLE policy_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES policy_versions(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    approval_status VARCHAR(20) NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    approval_type VARCHAR(50) NOT NULL DEFAULT 'review',
    comments TEXT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(version_id, approver_id),
    INDEX idx_policy_approvals_version_id (version_id),
    INDEX idx_policy_approvals_status (approval_status),
    INDEX idx_policy_approvals_approver (approver_id)
);

-- Create policy compliance mappings table
CREATE TABLE policy_compliance_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES policy_versions(id) ON DELETE CASCADE,
    compliance_framework VARCHAR(50) NOT NULL,
    requirement_id VARCHAR(100) NOT NULL,
    requirement_description TEXT,
    compliance_level VARCHAR(20) DEFAULT 'full' CHECK (compliance_level IN ('full', 'partial', 'not_applicable')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(version_id, compliance_framework, requirement_id),
    INDEX idx_compliance_mappings_version_id (version_id),
    INDEX idx_compliance_mappings_framework (compliance_framework)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_policy_version_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER policy_versions_updated_at
    BEFORE UPDATE ON policy_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_policy_version_timestamp();

-- Create function to automatically generate version numbers
CREATE OR REPLACE FUNCTION generate_next_version(
    p_policy_id UUID,
    p_change_type VARCHAR(50) DEFAULT 'update'
)
RETURNS VARCHAR(20) AS $$
DECLARE
    latest_version RECORD;
    new_major INTEGER;
    new_minor INTEGER;
    new_patch INTEGER;
BEGIN
    -- Get the latest version for this policy
    SELECT major_version, minor_version, patch_version
    INTO latest_version
    FROM policy_versions
    WHERE policy_id = p_policy_id
    ORDER BY major_version DESC, minor_version DESC, patch_version DESC
    LIMIT 1;
    
    -- If no previous version exists, start with 1.0.0
    IF latest_version IS NULL THEN
        RETURN '1.0.0';
    END IF;
    
    -- Increment version based on change type
    new_major := latest_version.major_version;
    new_minor := latest_version.minor_version;
    new_patch := latest_version.patch_version;
    
    CASE p_change_type
        WHEN 'create' THEN
            new_major := new_major + 1;
            new_minor := 0;
            new_patch := 0;
        WHEN 'deprecation' THEN
            new_major := new_major + 1;
            new_minor := 0;
            new_patch := 0;
        WHEN 'update' THEN
            new_minor := new_minor + 1;
            new_patch := 0;
        WHEN 'fix' THEN
            new_patch := new_patch + 1;
        ELSE
            new_patch := new_patch + 1;
    END CASE;
    
    RETURN CONCAT(new_major, '.', new_minor, '.', new_patch);
END;
$$ LANGUAGE plpgsql;

-- Create function to get the current active version of a policy
CREATE OR REPLACE FUNCTION get_current_policy_version(p_policy_id UUID)
RETURNS UUID AS $$
DECLARE
    current_version_id UUID;
BEGIN
    SELECT id INTO current_version_id
    FROM policy_versions
    WHERE policy_id = p_policy_id
    AND status = 'published'
    AND (effective_date IS NULL OR effective_date <= NOW())
    AND (expiration_date IS NULL OR expiration_date > NOW())
    ORDER BY major_version DESC, minor_version DESC, patch_version DESC
    LIMIT 1;
    
    RETURN current_version_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_policy_versions_active 
ON policy_versions (policy_id, status, effective_date, expiration_date) 
WHERE status = 'published';

CREATE INDEX CONCURRENTLY idx_policy_versions_semantic 
ON policy_versions (policy_id, major_version, minor_version, patch_version);

-- Insert some sample policies and versions for testing
INSERT INTO policies (policy_key, name, description, category, created_by) VALUES
    ('marketplace-content', 'Marketplace Content Policy', 'Rules and guidelines for content shared in the marketplace', 'content', 'admin-user-id'),
    ('user-conduct', 'User Conduct Policy', 'Expected behavior and conduct standards for platform users', 'conduct', 'admin-user-id'),
    ('data-privacy', 'Data Privacy Policy', 'How user data is collected, stored, and processed', 'privacy', 'admin-user-id');

-- Insert initial versions for the sample policies
INSERT INTO policy_versions (
    policy_id, 
    version, major_version, minor_version, patch_version,
    title, 
    content, 
    status, 
    compliance_frameworks, 
    created_by,
    effective_date
) VALUES
    (
        (SELECT id FROM policies WHERE policy_key = 'marketplace-content'),
        '1.0.0', 1, 0, 0,
        'Marketplace Content Policy v1.0',
        '{"sections": [{"title": "Content Guidelines", "content": "All content must be original and appropriate for professional use."}, {"title": "Prohibited Content", "content": "No offensive, copyrighted, or malicious content is allowed."}]}',
        'published',
        '{"content_moderation", "intellectual_property"}',
        'admin-user-id',
        NOW() - INTERVAL '30 days'
    ),
    (
        (SELECT id FROM policies WHERE policy_key = 'user-conduct'),
        '1.0.0', 1, 0, 0,
        'User Conduct Policy v1.0',
        '{"sections": [{"title": "Respectful Communication", "content": "Users must communicate respectfully with all community members."}, {"title": "No Harassment", "content": "Harassment of any kind is strictly prohibited."}]}',
        'published',
        '{"community_standards", "user_safety"}',
        'admin-user-id',
        NOW() - INTERVAL '60 days'
    ),
    (
        (SELECT id FROM policies WHERE policy_key = 'data-privacy'),
        '1.0.0', 1, 0, 0,
        'Data Privacy Policy v1.0',
        '{"sections": [{"title": "Data Collection", "content": "We collect only necessary data to provide our services."}, {"title": "Data Protection", "content": "All data is encrypted and stored securely."}]}',
        'published',
        '{"GDPR", "CCPA", "SOX"}',
        'admin-user-id',
        NOW() - INTERVAL '90 days'
    );

-- Add a draft version to show versioning in action
INSERT INTO policy_versions (
    policy_id, 
    version, major_version, minor_version, patch_version,
    title, 
    content, 
    status,
    change_summary,
    compliance_frameworks, 
    created_by,
    parent_version_id
) VALUES
    (
        (SELECT id FROM policies WHERE policy_key = 'marketplace-content'),
        '1.1.0', 1, 1, 0,
        'Marketplace Content Policy v1.1',
        '{"sections": [{"title": "Content Guidelines", "content": "All content must be original, high-quality, and appropriate for professional use."}, {"title": "Prohibited Content", "content": "No offensive, copyrighted, malicious, or spam content is allowed."}, {"title": "Content Review Process", "content": "All submitted content goes through automated and manual review processes."}]}',
        'draft',
        'Added quality standards and content review process section',
        '{"content_moderation", "intellectual_property", "quality_assurance"}',
        'admin-user-id',
        (SELECT id FROM policy_versions WHERE version = '1.0.0' AND policy_id = (SELECT id FROM policies WHERE policy_key = 'marketplace-content'))
    );

COMMENT ON TABLE policies IS 'Base policies table - each policy can have multiple versions';
COMMENT ON TABLE policy_versions IS 'Policy versions with semantic versioning and workflow management';
COMMENT ON TABLE policy_version_changes IS 'Detailed change tracking for policy versions';
COMMENT ON TABLE policy_approvals IS 'Approval workflow tracking for policy versions';
COMMENT ON TABLE policy_compliance_mappings IS 'Maps policy versions to compliance framework requirements';
COMMENT ON FUNCTION generate_next_version(UUID, VARCHAR) IS 'Automatically generates the next semantic version number based on change type';
COMMENT ON FUNCTION get_current_policy_version(UUID) IS 'Returns the currently active version ID for a given policy';