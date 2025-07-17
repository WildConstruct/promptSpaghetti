-- Epic 9.2.6 - Project Templates Schema Migration
-- Database schema for project templates system

-- Project Templates table - Reusable project structures
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template content and structure
    template_data JSONB NOT NULL, -- Complete project structure (nodes, connections, etc.)
    thumbnail_url TEXT, -- URL to template preview image
    
    -- Categorization and discovery
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'ai', 'creative', 'business', 'technical', 'educational', 'custom')),
    tags TEXT[] DEFAULT '{}', -- Array of searchable tags
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Template metadata
    version VARCHAR(20) DEFAULT '1.0.0',
    compatibility_version VARCHAR(20), -- Minimum app version required
    estimated_time_minutes INTEGER, -- Estimated setup/completion time
    
    -- Usage and sharing
    visibility VARCHAR(20) DEFAULT 'workspace' CHECK (visibility IN ('private', 'workspace', 'public')),
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2), -- Average user rating (1.00 to 5.00)
    rating_count INTEGER DEFAULT 0,
    
    -- Customization points
    customizable_fields JSONB DEFAULT '{}', -- Defines which parts can be customized
    default_values JSONB DEFAULT '{}', -- Default values for customizable fields
    validation_rules JSONB DEFAULT '{}', -- Validation rules for customizations
    
    -- Author and timing
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Archive and lifecycle
    archived_at TIMESTAMP WITH TIME ZONE,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    replacement_template_id UUID REFERENCES project_templates(id),
    
    -- Constraints
    CONSTRAINT template_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT usage_count_non_negative CHECK (usage_count >= 0),
    CONSTRAINT rating_count_non_negative CHECK (rating_count >= 0),
    CONSTRAINT rating_average_valid CHECK (rating_average IS NULL OR (rating_average >= 1.0 AND rating_average <= 5.0)),
    CONSTRAINT estimated_time_positive CHECK (estimated_time_minutes IS NULL OR estimated_time_minutes > 0)
);

-- Template Reviews table - User ratings and feedback
CREATE TABLE IF NOT EXISTS template_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Review metadata
    is_verified_purchase BOOLEAN DEFAULT FALSE, -- Did user actually use the template
    is_helpful_count INTEGER DEFAULT 0, -- How many found this review helpful
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(template_id, user_id) -- One review per user per template
);

-- Template Usage History table - Track template usage and customizations
CREATE TABLE IF NOT EXISTS template_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Usage details
    customizations_applied JSONB DEFAULT '{}', -- What customizations were made
    completion_status VARCHAR(50) DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
    time_to_complete_minutes INTEGER, -- How long it took to set up/complete
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
    user_feedback TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Analytics
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'recommended', 'search', 'featured', 'shared')),
    
    -- Constraints
    CONSTRAINT completion_time_positive CHECK (time_to_complete_minutes IS NULL OR time_to_complete_minutes > 0)
);

-- Template Categories table - For organizing templates
CREATE TABLE IF NOT EXISTS template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50), -- Icon identifier for UI
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT category_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Template Favorites table - User bookmarks
CREATE TABLE IF NOT EXISTS template_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(template_id, user_id)
);

-- Template Download History table - Track template downloads/exports
CREATE TABLE IF NOT EXISTS template_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    
    -- Download details
    download_format VARCHAR(20) DEFAULT 'json' CHECK (download_format IN ('json', 'yaml', 'zip')),
    download_size_bytes BIGINT,
    
    -- Context
    user_agent TEXT,
    ip_address INET,
    
    -- Timing
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_project_templates_workspace ON project_templates(workspace_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_templates_visibility ON project_templates(visibility) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_templates_featured ON project_templates(is_featured, created_at DESC) WHERE is_featured = TRUE AND archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_templates_rating ON project_templates(rating_average DESC NULLS LAST, rating_count DESC) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_templates_usage ON project_templates(usage_count DESC, created_at DESC) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_templates_created_by ON project_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_project_templates_tags ON project_templates USING GIN (tags) WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON template_reviews(template_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_reviews_user ON template_reviews(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_reviews_rating ON template_reviews(template_id, rating DESC);

CREATE INDEX IF NOT EXISTS idx_template_usages_template ON template_usages(template_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usages_user ON template_usages(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usages_workspace ON template_usages(workspace_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usages_status ON template_usages(completion_status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_template_categories_sort ON template_categories(sort_order, name) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_template_favorites_user ON template_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_favorites_template ON template_favorites(template_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_template_downloads_template ON template_downloads(template_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_downloads_user ON template_downloads(user_id, downloaded_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_project_templates_data_gin ON project_templates USING GIN (template_data);
CREATE INDEX IF NOT EXISTS idx_project_templates_customizable_gin ON project_templates USING GIN (customizable_fields);
CREATE INDEX IF NOT EXISTS idx_template_usages_customizations_gin ON template_usages USING GIN (customizations_applied);

-- Full-text search index for templates
CREATE INDEX IF NOT EXISTS idx_project_templates_search ON project_templates USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' '))
) WHERE archived_at IS NULL;

-- Triggers for updated_at timestamps
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_templates_updated_at') THEN
        CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON project_templates
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_template_reviews_updated_at') THEN
        CREATE TRIGGER update_template_reviews_updated_at BEFORE UPDATE ON template_reviews
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_template_categories_updated_at') THEN
        CREATE TRIGGER update_template_categories_updated_at BEFORE UPDATE ON template_categories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to update template rating when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the template's rating statistics
    UPDATE project_templates SET
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM template_reviews
            WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM template_reviews
            WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.template_id, OLD.template_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update template ratings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_update_template_rating') THEN
        CREATE TRIGGER auto_update_template_rating
            AFTER INSERT OR UPDATE OR DELETE ON template_reviews
            FOR EACH ROW EXECUTE FUNCTION update_template_rating();
    END IF;
END $$;

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Only increment on INSERT of new usage
    IF TG_OP = 'INSERT' THEN
        UPDATE project_templates SET
            usage_count = usage_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.template_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically increment usage count
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_increment_template_usage') THEN
        CREATE TRIGGER auto_increment_template_usage
            AFTER INSERT ON template_usages
            FOR EACH ROW EXECUTE FUNCTION increment_template_usage();
    END IF;
END $$;

-- Insert default template categories
INSERT INTO template_categories (name, description, icon_name, sort_order) VALUES
    ('AI & Machine Learning', 'Templates for AI workflows, data processing, and ML pipelines', 'brain', 1),
    ('Creative', 'Templates for creative workflows, content generation, and artistic projects', 'palette', 2),
    ('Business', 'Templates for business processes, planning, and management workflows', 'briefcase', 3),
    ('Technical', 'Templates for software development, system design, and technical documentation', 'code', 4),
    ('Educational', 'Templates for learning, tutorials, and educational content', 'book', 5),
    ('General', 'Multipurpose templates suitable for various use cases', 'grid', 6)
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE project_templates IS 'Reusable project structures and workflows';
COMMENT ON TABLE template_reviews IS 'User ratings and feedback for templates';
COMMENT ON TABLE template_usages IS 'Track template usage and customizations for analytics';
COMMENT ON TABLE template_categories IS 'Hierarchical categorization of templates';
COMMENT ON TABLE template_favorites IS 'User bookmarks and saved templates';
COMMENT ON TABLE template_downloads IS 'Track template downloads for analytics';

COMMENT ON COLUMN project_templates.template_data IS 'Complete project structure including nodes, edges, and configuration';
COMMENT ON COLUMN project_templates.customizable_fields IS 'JSON schema defining which fields can be customized';
COMMENT ON COLUMN project_templates.rating_average IS 'Calculated average rating from user reviews';
COMMENT ON COLUMN project_templates.compatibility_version IS 'Minimum application version required';