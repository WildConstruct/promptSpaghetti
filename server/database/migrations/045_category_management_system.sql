-- Epic 17: Category Management System
-- Migration: 045_category_management_system
-- DEPLOYMENT BLOCKER FIX: Creates comprehensive category management system

-- Core categories table with hierarchical structure
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    domain VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    display_name VARCHAR(200),
    
    -- Hierarchy
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    path TEXT NOT NULL, -- Full path like '/admin/security/authentication'
    ancestors UUID[] DEFAULT '{}', -- Array of ancestor IDs
    
    -- Visual and UI
    icon VARCHAR(100),
    color VARCHAR(20),
    background_color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    
    -- Properties and configuration
    metadata JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    properties JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(properties) = 'object'),
    configuration JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(configuration) = 'object'),
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived', 'deprecated', 'pending_approval')),
    is_system_managed BOOLEAN DEFAULT false,
    is_deprecated BOOLEAN DEFAULT false,
    deprecation_reason TEXT,
    replacement_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Permissions and access
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'internal', 'private', 'system_only')),
    access_level VARCHAR(20) NOT NULL DEFAULT 'read_only' CHECK (access_level IN ('read_only', 'read_write', 'admin_only', 'system_only')),
    required_permissions JSONB DEFAULT '[]' CHECK (jsonb_typeof(required_permissions) = 'array'),
    
    -- Usage and analytics
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    
    -- Localization
    localized_names JSONB DEFAULT '{}' CHECK (jsonb_typeof(localized_names) = 'object'),
    localized_descriptions JSONB DEFAULT '{}' CHECK (jsonb_typeof(localized_descriptions) = 'object'),
    
    -- Constraints
    CONSTRAINT unique_domain_code UNIQUE(domain, code),
    CONSTRAINT valid_level CHECK (level >= 0 AND level <= 10),
    CONSTRAINT valid_path CHECK (path ~ '^/[a-z0-9_/-]+$'),
    CONSTRAINT no_self_reference CHECK (id != parent_id),
    CONSTRAINT valid_ancestors_array CHECK (jsonb_typeof(ancestors::jsonb) = 'array')
);

-- Category version history for audit and rollback
CREATE TABLE IF NOT EXISTS category_versions (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(changes) = 'array'),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    change_reason VARCHAR(500),
    previous_data JSONB,
    
    UNIQUE(category_id, version_number)
);

-- Category relationships for linking related categories
CREATE TABLE IF NOT EXISTS category_relationships (
    id UUID PRIMARY KEY,
    source_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    target_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'parent_child', 'related', 'similar', 'conflicting', 'requires', 
        'excludes', 'alternative', 'supersedes', 'depends_on'
    )),
    strength NUMERIC(3,2) CHECK (strength >= 0 AND strength <= 1),
    bidirectional BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT no_self_relationship CHECK (source_category_id != target_category_id),
    CONSTRAINT unique_relationship UNIQUE(source_category_id, target_category_id, relationship_type)
);

-- Category permissions for fine-grained access control
CREATE TABLE IF NOT EXISTS category_permissions (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(permissions) = 'array'),
    inherited BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    conditions JSONB, -- JSON logic expression
    
    CONSTRAINT has_user_or_role CHECK (user_id IS NOT NULL OR role_id IS NOT NULL),
    CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- Category usage statistics for analytics
CREATE TABLE IF NOT EXISTS category_usage_statistics (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Usage metrics
    total_usage_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    average_usage_per_user NUMERIC(10,2) DEFAULT 0,
    peak_usage_date TIMESTAMP WITH TIME ZONE,
    peak_usage_count INTEGER DEFAULT 0,
    
    -- Context and temporal usage
    usage_by_context JSONB DEFAULT '{}' CHECK (jsonb_typeof(usage_by_context) = 'object'),
    usage_by_time_of_day JSONB DEFAULT '{}' CHECK (jsonb_typeof(usage_by_time_of_day) = 'object'),
    usage_by_day_of_week JSONB DEFAULT '{}' CHECK (jsonb_typeof(usage_by_day_of_week) = 'object'),
    
    -- Performance metrics
    average_assignment_time NUMERIC(8,2), -- milliseconds
    average_search_time NUMERIC(8,2), -- milliseconds
    
    -- Trends and quality
    usage_trend VARCHAR(20) CHECK (usage_trend IN ('increasing', 'decreasing', 'stable')),
    trend_percentage NUMERIC(5,2),
    reassignment_rate NUMERIC(5,2),
    user_satisfaction_score NUMERIC(3,1) CHECK (user_satisfaction_score BETWEEN 0 AND 5),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_period CHECK (period_end > period_start),
    UNIQUE(category_id, period_start, period_end)
);

-- Category audit log for tracking all operations
CREATE TABLE IF NOT EXISTS category_audit_log (
    id UUID PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    operation VARCHAR(50) NOT NULL CHECK (operation IN (
        'create', 'update', 'delete', 'move', 'copy', 'archive', 'restore',
        'merge', 'split', 'bulk_update', 'bulk_delete', 'bulk_move', 'import', 'export'
    )),
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Changes
    before_data JSONB,
    after_data JSONB,
    changes JSONB DEFAULT '[]' CHECK (jsonb_typeof(changes) = 'array'),
    
    -- Results
    success BOOLEAN NOT NULL,
    error_message TEXT,
    affected_items INTEGER DEFAULT 1,
    
    -- Metadata
    reason VARCHAR(500),
    notes TEXT,
    system_generated BOOLEAN DEFAULT false
);

-- Category templates for rapid creation of standard structures
CREATE TABLE IF NOT EXISTS category_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('hierarchy', 'flat', 'custom')),
    
    -- Template structure
    category_structure JSONB NOT NULL CHECK (jsonb_typeof(category_structure) = 'array'),
    default_metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(default_metadata) = 'object'),
    default_configuration JSONB DEFAULT '{}' CHECK (jsonb_typeof(default_configuration) = 'object'),
    
    -- Usage and management
    is_system_template BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(name, domain)
);

-- Category mappings for external system integration
CREATE TABLE IF NOT EXISTS category_mappings (
    id UUID PRIMARY KEY,
    internal_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    external_system VARCHAR(100) NOT NULL,
    external_category_id VARCHAR(255) NOT NULL,
    external_category_name VARCHAR(200),
    mapping_type VARCHAR(20) NOT NULL CHECK (mapping_type IN ('exact', 'approximate', 'parent', 'child', 'custom')),
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    bidirectional BOOLEAN DEFAULT false,
    transformation_rules JSONB DEFAULT '[]' CHECK (jsonb_typeof(transformation_rules) = 'array'),
    last_synced TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
    sync_errors JSONB DEFAULT '[]' CHECK (jsonb_typeof(sync_errors) = 'array'),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(internal_category_id, external_system, external_category_id)
);

-- Category analytics for insights and optimization
CREATE TABLE IF NOT EXISTS category_analytics (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Performance metrics
    performance_score NUMERIC(5,2) CHECK (performance_score BETWEEN 0 AND 100),
    efficiency_metrics JSONB DEFAULT '{}' CHECK (jsonb_typeof(efficiency_metrics) = 'object'),
    
    -- Usage patterns
    usage_patterns JSONB DEFAULT '{}' CHECK (jsonb_typeof(usage_patterns) = 'object'),
    
    -- Health indicators
    health_indicators JSONB DEFAULT '{}' CHECK (jsonb_typeof(health_indicators) = 'object'),
    
    -- Recommendations
    recommendations JSONB DEFAULT '[]' CHECK (jsonb_typeof(recommendations) = 'array'),
    
    -- Comparative analysis
    benchmarks JSONB DEFAULT '{}' CHECK (jsonb_typeof(benchmarks) = 'object'),
    
    CONSTRAINT valid_analysis_period CHECK (period_end > period_start)
);

-- Indexes for efficient querying and performance
CREATE INDEX IF NOT EXISTS idx_categories_domain ON categories(domain);
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS idx_categories_path ON categories USING gin(to_tsvector('english', path));
CREATE INDEX IF NOT EXISTS idx_categories_ancestors ON categories USING gin(ancestors);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);
CREATE INDEX IF NOT EXISTS idx_categories_updated_at ON categories(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_usage ON categories(usage_count DESC, last_used_at DESC);

-- Metadata search indexes
CREATE INDEX IF NOT EXISTS idx_categories_metadata ON categories USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_categories_properties ON categories USING gin(properties);
CREATE INDEX IF NOT EXISTS idx_categories_tags ON categories USING gin((metadata->'tags'));

-- Version history indexes
CREATE INDEX IF NOT EXISTS idx_category_versions_category ON category_versions(category_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_category_versions_changed_at ON category_versions(changed_at DESC);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_category_relationships_source ON category_relationships(source_category_id);
CREATE INDEX IF NOT EXISTS idx_category_relationships_target ON category_relationships(target_category_id);
CREATE INDEX IF NOT EXISTS idx_category_relationships_type ON category_relationships(relationship_type);

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_category_permissions_category ON category_permissions(category_id);
CREATE INDEX IF NOT EXISTS idx_category_permissions_user ON category_permissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_category_permissions_role ON category_permissions(role_id) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_category_permissions_expires ON category_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- Usage statistics indexes
CREATE INDEX IF NOT EXISTS idx_category_usage_stats_category ON category_usage_statistics(category_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_category_usage_stats_period ON category_usage_statistics(period_start, period_end);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_category_audit_category ON category_audit_log(category_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_category_audit_performed_by ON category_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_category_audit_operation ON category_audit_log(operation, performed_at DESC);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_category_templates_domain ON category_templates(domain);
CREATE INDEX IF NOT EXISTS idx_category_templates_usage ON category_templates(usage_count DESC);

-- Mapping indexes
CREATE INDEX IF NOT EXISTS idx_category_mappings_internal ON category_mappings(internal_category_id);
CREATE INDEX IF NOT EXISTS idx_category_mappings_external ON category_mappings(external_system, external_category_id);
CREATE INDEX IF NOT EXISTS idx_category_mappings_sync_status ON category_mappings(sync_status) WHERE sync_status != 'synced';

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_category_analytics_category ON category_analytics(category_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_category_analytics_score ON category_analytics(performance_score DESC);

-- Trigger functions for automation
CREATE OR REPLACE FUNCTION update_category_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Update version number
    IF TG_OP = 'UPDATE' THEN
        NEW.version = OLD.version + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for category timestamp updates
CREATE TRIGGER trigger_categories_timestamp
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_timestamp();

-- Function to maintain category hierarchy
CREATE OR REPLACE FUNCTION maintain_category_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    ancestor_ids UUID[];
    parent_level INTEGER;
    parent_path TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        -- Root category
        NEW.level = 0;
        NEW.path = '/' || NEW.code;
        NEW.ancestors = '{}';
    ELSE
        -- Get parent information
        SELECT level, path, ancestors INTO parent_level, parent_path, ancestor_ids
        FROM categories WHERE id = NEW.parent_id;
        
        -- Calculate new level and path
        NEW.level = parent_level + 1;
        NEW.path = parent_path || '/' || NEW.code;
        NEW.ancestors = ancestor_ids || NEW.parent_id;
        
        -- Prevent circular references
        IF NEW.id = ANY(NEW.ancestors) THEN
            RAISE EXCEPTION 'Circular reference detected in category hierarchy';
        END IF;
        
        -- Limit hierarchy depth
        IF NEW.level > 10 THEN
            RAISE EXCEPTION 'Maximum category hierarchy depth exceeded';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hierarchy maintenance
CREATE TRIGGER trigger_maintain_category_hierarchy
    BEFORE INSERT OR UPDATE OF parent_id, code ON categories
    FOR EACH ROW
    EXECUTE FUNCTION maintain_category_hierarchy();

-- Function to track category changes
CREATE OR REPLACE FUNCTION track_category_changes()
RETURNS TRIGGER AS $$
DECLARE
    change_record JSONB;
    changes JSONB[] := '{}';
BEGIN
    -- Track changes for updates
    IF TG_OP = 'UPDATE' THEN
        IF OLD.name != NEW.name THEN
            changes := changes || jsonb_build_object('field', 'name', 'oldValue', OLD.name, 'newValue', NEW.name, 'changeType', 'updated');
        END IF;
        
        IF OLD.description != NEW.description OR (OLD.description IS NULL AND NEW.description IS NOT NULL) OR (OLD.description IS NOT NULL AND NEW.description IS NULL) THEN
            changes := changes || jsonb_build_object('field', 'description', 'oldValue', OLD.description, 'newValue', NEW.description, 'changeType', 'updated');
        END IF;
        
        IF OLD.parent_id != NEW.parent_id OR (OLD.parent_id IS NULL AND NEW.parent_id IS NOT NULL) OR (OLD.parent_id IS NOT NULL AND NEW.parent_id IS NULL) THEN
            changes := changes || jsonb_build_object('field', 'parent_id', 'oldValue', OLD.parent_id, 'newValue', NEW.parent_id, 'changeType', 'moved');
        END IF;
        
        IF OLD.status != NEW.status THEN
            changes := changes || jsonb_build_object('field', 'status', 'oldValue', OLD.status, 'newValue', NEW.status, 'changeType', 'updated');
        END IF;
        
        -- Create version history record if there are changes
        IF array_length(changes, 1) > 0 THEN
            INSERT INTO category_versions (
                id, category_id, version_number, changes, changed_by, change_reason, previous_data
            ) VALUES (
                gen_random_uuid(),
                NEW.id,
                NEW.version,
                array_to_json(changes)::jsonb,
                NEW.updated_by,
                'Automatic version created on update',
                to_jsonb(OLD)
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for change tracking
CREATE TRIGGER trigger_track_category_changes
    AFTER UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION track_category_changes();

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION increment_category_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called when a category is used/assigned
    UPDATE categories 
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = NEW.category_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_category_data()
RETURNS void AS $$
DECLARE
    retention_days INTEGER := 365;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Clean up old audit logs
    DELETE FROM category_audit_log 
    WHERE performed_at < cutoff_date 
    AND operation NOT IN ('delete', 'merge', 'split');
    
    -- Clean up old usage statistics
    DELETE FROM category_usage_statistics 
    WHERE period_end < cutoff_date;
    
    -- Clean up old analytics
    DELETE FROM category_analytics 
    WHERE analysis_date < cutoff_date;
END;
$$ LANGUAGE plpgsql;

-- Insert default category domains and templates
INSERT INTO category_templates (id, name, description, domain, template_type, category_structure, is_system_template) VALUES
(
    gen_random_uuid(),
    'System Configuration Categories',
    'Standard system configuration category hierarchy',
    'system_configuration',
    'hierarchy',
    '[
        {"code": "authentication", "name": "Authentication", "level": 0, "required": true},
        {"code": "authorization", "name": "Authorization", "level": 0, "required": true},
        {"code": "security", "name": "Security", "level": 0, "required": true},
        {"code": "performance", "name": "Performance", "level": 0, "required": true},
        {"code": "monitoring", "name": "Monitoring", "level": 0, "required": true},
        {"code": "backup", "name": "Backup & Recovery", "level": 0, "required": true},
        {"code": "integration", "name": "Integrations", "level": 0, "required": true}
    ]'::jsonb,
    true
),
(
    gen_random_uuid(),
    'User Activity Categories',
    'Standard user activity categorization',
    'user_activities',
    'flat',
    '[
        {"code": "authentication", "name": "Authentication", "level": 0, "required": true},
        {"code": "account_management", "name": "Account Management", "level": 0, "required": true},
        {"code": "content_creation", "name": "Content Creation", "level": 0, "required": true},
        {"code": "content_modification", "name": "Content Modification", "level": 0, "required": true},
        {"code": "collaboration", "name": "Collaboration", "level": 0, "required": true},
        {"code": "system_administration", "name": "System Administration", "level": 0, "required": true},
        {"code": "api_usage", "name": "API Usage", "level": 0, "required": true},
        {"code": "security", "name": "Security", "level": 0, "required": true},
        {"code": "analytics", "name": "Analytics", "level": 0, "required": true}
    ]'::jsonb,
    true
),
(
    gen_random_uuid(),
    'Admin Tools Categories',
    'Administrative tools and management categorization',
    'admin_tools',
    'hierarchy',
    '[
        {"code": "user_management", "name": "User Management", "level": 0, "required": true},
        {"code": "system_health", "name": "System Health", "level": 0, "required": true},
        {"code": "maintenance", "name": "Maintenance", "level": 0, "required": true},
        {"code": "monitoring", "name": "Monitoring", "level": 0, "required": true},
        {"code": "reporting", "name": "Reporting", "level": 0, "required": true},
        {"code": "configuration", "name": "Configuration", "level": 0, "required": true}
    ]'::jsonb,
    true
) ON CONFLICT (name, domain) DO NOTHING;

-- Insert default categories for system configuration
INSERT INTO categories (
    id, domain, code, name, description, level, path, status, is_system_managed, 
    metadata, configuration, created_by
) 
SELECT 
    gen_random_uuid(),
    'system_configuration',
    template_item.value->>'code',
    template_item.value->>'name',
    'System managed category',
    0,
    '/' || (template_item.value->>'code'),
    'active',
    true,
    jsonb_build_object('isDefault', true, 'systemManaged', true),
    jsonb_build_object('allowSubcategories', true, 'inheritPermissions', true),
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
FROM category_templates ct,
LATERAL jsonb_array_elements(ct.category_structure) AS template_item
WHERE ct.name = 'System Configuration Categories' AND ct.is_system_template = true
ON CONFLICT (domain, code) DO NOTHING;

-- Insert system configuration record for category management
INSERT INTO system_configuration (category, settings, description, modified_by) VALUES
(
    'category_management',
    '{
        "enable_hierarchy": true,
        "max_depth": 10,
        "enable_relationships": true,
        "enable_templates": true,
        "enable_analytics": true,
        "enable_versioning": true,
        "enable_permissions": true,
        "default_visibility": "public",
        "default_access_level": "read_only",
        "enable_auto_assignment": false,
        "retention_days": 365,
        "analytics_frequency": "daily",
        "cleanup_frequency": "weekly"
    }'::jsonb,
    'Category management system configuration',
    (SELECT id FROM users WHERE email LIKE '%@system%' LIMIT 1)
) ON CONFLICT (category) DO NOTHING;

-- Views for common category queries
CREATE OR REPLACE VIEW category_hierarchy AS
WITH RECURSIVE category_tree AS (
    -- Root categories
    SELECT 
        id, domain, code, name, description, parent_id, level, path, ancestors,
        ARRAY[name] as name_path,
        0 as depth
    FROM categories 
    WHERE parent_id IS NULL AND status = 'active'
    
    UNION ALL
    
    -- Child categories
    SELECT 
        c.id, c.domain, c.code, c.name, c.description, c.parent_id, c.level, c.path, c.ancestors,
        ct.name_path || c.name,
        ct.depth + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.status = 'active' AND ct.depth < 10
)
SELECT * FROM category_tree ORDER BY name_path;

CREATE OR REPLACE VIEW category_usage_summary AS
SELECT 
    c.id,
    c.domain,
    c.code,
    c.name,
    c.usage_count,
    c.last_used_at,
    c.status,
    COUNT(DISTINCT cp.user_id) as users_with_access,
    COUNT(DISTINCT cr.target_category_id) as related_categories,
    COALESCE(recent_stats.total_usage_count, 0) as recent_usage
FROM categories c
LEFT JOIN category_permissions cp ON c.id = cp.category_id
LEFT JOIN category_relationships cr ON c.id = cr.source_category_id
LEFT JOIN category_usage_statistics recent_stats ON c.id = recent_stats.category_id 
    AND recent_stats.period_start >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.domain, c.code, c.name, c.usage_count, c.last_used_at, c.status, recent_stats.total_usage_count;

CREATE OR REPLACE VIEW category_health_metrics AS
SELECT 
    c.id,
    c.domain,
    c.code,
    c.name,
    c.status,
    c.usage_count,
    c.last_used_at,
    CASE 
        WHEN c.last_used_at > NOW() - INTERVAL '7 days' THEN 'high'
        WHEN c.last_used_at > NOW() - INTERVAL '30 days' THEN 'medium'
        WHEN c.last_used_at > NOW() - INTERVAL '90 days' THEN 'low'
        ELSE 'inactive'
    END as usage_activity,
    COUNT(DISTINCT child.id) as child_count,
    COUNT(DISTINCT rel.target_category_id) as relationship_count,
    COALESCE(analytics.performance_score, 0) as performance_score
FROM categories c
LEFT JOIN categories child ON c.id = child.parent_id AND child.status = 'active'
LEFT JOIN category_relationships rel ON c.id = rel.source_category_id
LEFT JOIN category_analytics analytics ON c.id = analytics.category_id 
    AND analytics.analysis_date >= NOW() - INTERVAL '30 days'
WHERE c.status = 'active'
GROUP BY c.id, c.domain, c.code, c.name, c.status, c.usage_count, c.last_used_at, analytics.performance_score;

-- Comments for documentation
COMMENT ON TABLE categories IS 'Core categories table with hierarchical structure and comprehensive metadata';
COMMENT ON TABLE category_versions IS 'Version history for categories with change tracking';
COMMENT ON TABLE category_relationships IS 'Relationships between categories for complex associations';
COMMENT ON TABLE category_permissions IS 'Fine-grained access control for categories';
COMMENT ON TABLE category_usage_statistics IS 'Detailed usage analytics and statistics';
COMMENT ON TABLE category_audit_log IS 'Comprehensive audit trail for all category operations';
COMMENT ON TABLE category_templates IS 'Templates for rapid creation of standard category structures';
COMMENT ON TABLE category_mappings IS 'External system integration and category mappings';
COMMENT ON TABLE category_analytics IS 'Advanced analytics and performance insights';

COMMENT ON COLUMN categories.ancestors IS 'Array of ancestor category IDs for efficient hierarchy queries';
COMMENT ON COLUMN categories.path IS 'Full hierarchical path for easy navigation and display';
COMMENT ON COLUMN categories.configuration IS 'Category-specific configuration and behavior settings';
COMMENT ON COLUMN categories.metadata IS 'Flexible metadata storage for custom properties and tags';
COMMENT ON COLUMN category_relationships.strength IS 'Relationship strength from 0 (weak) to 1 (strong)';
COMMENT ON COLUMN category_usage_statistics.user_satisfaction_score IS 'User satisfaction rating from 0 to 5';
COMMENT ON COLUMN category_analytics.performance_score IS 'Overall performance score from 0 to 100';

COMMENT ON VIEW category_hierarchy IS 'Recursive hierarchy view showing category relationships';
COMMENT ON VIEW category_usage_summary IS 'Summary of category usage patterns and access';
COMMENT ON VIEW category_health_metrics IS 'Health and performance metrics for categories';