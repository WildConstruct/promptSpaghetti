-- Epic 16.2.2 Enhanced Version Management Database Migration

-- Enhanced template versions table
CREATE TABLE IF NOT EXISTS enhanced_template_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL, -- Semantic versioning (e.g., "1.2.3-beta")
    major_version INTEGER NOT NULL,
    minor_version INTEGER NOT NULL,
    patch_version INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated', 'archived')),
    visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'beta')),
    claude_model VARCHAR(50) NOT NULL DEFAULT 'claude-3-sonnet',
    graph_json JSONB NOT NULL,
    prompt_yaml TEXT,
    changelog_md TEXT, -- Backward compatibility
    hash VARCHAR(64) NOT NULL, -- SHA256 hash for integrity
    token_per_run_estimate INTEGER DEFAULT 0,
    safety_score DECIMAL(3,2) DEFAULT 0.00,
    s3_asset_key VARCHAR(500), -- S3 key for assets
    
    -- Enhanced version management fields
    release_notes TEXT NOT NULL,
    compatibility_level VARCHAR(20) NOT NULL CHECK (compatibility_level IN ('breaking', 'major', 'minor', 'patch')),
    migration_guide TEXT,
    deprecated_features JSONB DEFAULT '[]',
    new_features JSONB DEFAULT '[]',
    breaking_changes JSONB DEFAULT '[]',
    bug_fixes JSONB DEFAULT '[]',
    known_issues JSONB DEFAULT '[]',
    
    -- Compatibility and dependencies
    min_claude_version VARCHAR(20),
    max_claude_version VARCHAR(20),
    required_features JSONB DEFAULT '[]',
    optional_features JSONB DEFAULT '[]',
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ,
    deprecated_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    usage_stats JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_safety_score CHECK (safety_score >= 0.00 AND safety_score <= 1.00),
    CONSTRAINT valid_token_estimate CHECK (token_per_run_estimate >= 0),
    CONSTRAINT valid_version_numbers CHECK (major_version >= 0 AND minor_version >= 0 AND patch_version >= 0),
    CONSTRAINT valid_download_count CHECK (download_count >= 0),
    
    -- Unique constraint for version per template
    UNIQUE(template_id, version_number)
);

-- Version deployments table
CREATE TABLE IF NOT EXISTS version_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    deployment_type VARCHAR(20) NOT NULL CHECK (deployment_type IN ('rollout', 'canary', 'blue_green', 'immediate')),
    rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_audience JSONB DEFAULT '[]',
    deployment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'in_progress', 'completed', 'failed', 'rolled_back')),
    rollback_version_id UUID REFERENCES enhanced_template_versions(id) ON DELETE SET NULL,
    deployment_config JSONB DEFAULT '{}',
    success_metrics JSONB DEFAULT '{}',
    deployed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    rollback_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_rollout_percentage CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

-- Version rollbacks table
CREATE TABLE IF NOT EXISTS version_rollbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    from_version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    to_version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    rollback_reason TEXT NOT NULL,
    rollback_type VARCHAR(20) NOT NULL CHECK (rollback_type IN ('emergency', 'planned', 'issue_resolution')),
    affected_users INTEGER DEFAULT 0,
    impact_assessment TEXT NOT NULL,
    rollback_plan TEXT NOT NULL,
    verification_steps JSONB NOT NULL DEFAULT '[]',
    rollback_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rollback_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    success BOOLEAN DEFAULT NULL,
    issues_encountered JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_affected_users CHECK (affected_users >= 0),
    CONSTRAINT different_versions CHECK (from_version_id != to_version_id)
);

-- Version execution statistics table
CREATE TABLE IF NOT EXISTS version_execution_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES marketplace_purchases(id) ON DELETE SET NULL,
    execution_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_rate DECIMAL(5,4) DEFAULT 0.0000,
    avg_execution_time DECIMAL(10,3) DEFAULT 0.000, -- in milliseconds
    total_execution_time BIGINT DEFAULT 0, -- in milliseconds
    last_execution_at TIMESTAMPTZ,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_execution_count CHECK (execution_count >= 0),
    CONSTRAINT valid_error_count CHECK (error_count >= 0),
    CONSTRAINT valid_error_rate CHECK (error_rate >= 0.0000 AND error_rate <= 1.0000),
    CONSTRAINT valid_execution_time CHECK (avg_execution_time >= 0.000),
    CONSTRAINT valid_total_time CHECK (total_execution_time >= 0),
    
    -- Unique constraint for version per day
    UNIQUE(version_id, date)
);

-- Version comparison cache table
CREATE TABLE IF NOT EXISTS version_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    to_version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    comparison_data JSONB NOT NULL,
    differences_count INTEGER DEFAULT 0,
    breaking_changes_count INTEGER DEFAULT 0,
    migration_complexity VARCHAR(20) CHECK (migration_complexity IN ('simple', 'moderate', 'complex')),
    estimated_migration_time INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    
    -- Constraints
    CONSTRAINT valid_differences_count CHECK (differences_count >= 0),
    CONSTRAINT valid_breaking_count CHECK (breaking_changes_count >= 0),
    CONSTRAINT valid_migration_time CHECK (estimated_migration_time >= 0),
    CONSTRAINT different_comparison_versions CHECK (from_version_id != to_version_id),
    
    -- Unique constraint for version pair
    UNIQUE(from_version_id, to_version_id)
);

-- Version notifications table
CREATE TABLE IF NOT EXISTS version_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES enhanced_template_versions(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN 
        ('new_version', 'breaking_change', 'security_update', 'deprecation_warning', 'rollback_notice')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    action_required BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    
    -- Index for user notifications
    INDEX idx_notifications_user_unread (user_id, read_at) WHERE read_at IS NULL
);

-- Performance indexes for enhanced version management
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_template ON enhanced_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_status ON enhanced_template_versions(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_visibility ON enhanced_template_versions(visibility);
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_created_by ON enhanced_template_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_published_at ON enhanced_template_versions(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_semantic ON enhanced_template_versions(template_id, major_version DESC, minor_version DESC, patch_version DESC);
CREATE INDEX IF NOT EXISTS idx_enhanced_versions_compatibility ON enhanced_template_versions(compatibility_level, status);

CREATE INDEX IF NOT EXISTS idx_deployments_version ON version_deployments(version_id);
CREATE INDEX IF NOT EXISTS idx_deployments_template ON version_deployments(template_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON version_deployments(deployment_status);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_by ON version_deployments(deployed_by);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at ON version_deployments(deployed_at DESC);

CREATE INDEX IF NOT EXISTS idx_rollbacks_template ON version_rollbacks(template_id);
CREATE INDEX IF NOT EXISTS idx_rollbacks_from_version ON version_rollbacks(from_version_id);
CREATE INDEX IF NOT EXISTS idx_rollbacks_to_version ON version_rollbacks(to_version_id);
CREATE INDEX IF NOT EXISTS idx_rollbacks_type ON version_rollbacks(rollback_type);
CREATE INDEX IF NOT EXISTS idx_rollbacks_success ON version_rollbacks(success);
CREATE INDEX IF NOT EXISTS idx_rollbacks_rollback_at ON version_rollbacks(rollback_at DESC);

CREATE INDEX IF NOT EXISTS idx_execution_stats_version ON version_execution_stats(version_id);
CREATE INDEX IF NOT EXISTS idx_execution_stats_date ON version_execution_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_execution_stats_error_rate ON version_execution_stats(error_rate DESC);
CREATE INDEX IF NOT EXISTS idx_execution_stats_performance ON version_execution_stats(avg_execution_time);

CREATE INDEX IF NOT EXISTS idx_comparisons_versions ON version_comparisons(from_version_id, to_version_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_expires ON version_comparisons(expires_at);
CREATE INDEX IF NOT EXISTS idx_comparisons_complexity ON version_comparisons(migration_complexity);

CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON version_notifications(user_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_template ON version_notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON version_notifications(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON version_notifications(expires_at);

-- Triggers for updated_at timestamps
CREATE TRIGGER trig_enhanced_versions_updated_at
    BEFORE UPDATE ON enhanced_template_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_deployments_updated_at
    BEFORE UPDATE ON version_deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_execution_stats_updated_at
    BEFORE UPDATE ON version_execution_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update download count
CREATE OR REPLACE FUNCTION update_version_download_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
        UPDATE enhanced_template_versions 
        SET download_count = download_count + 1,
            updated_at = NOW()
        WHERE id = NEW.version_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update download count on successful purchases
CREATE TRIGGER trig_update_download_count
    AFTER UPDATE ON marketplace_purchases
    FOR EACH ROW EXECUTE FUNCTION update_version_download_count();

-- Function to auto-expire old version comparisons
CREATE OR REPLACE FUNCTION cleanup_expired_comparisons()
RETURNS void AS $$
BEGIN
    DELETE FROM version_comparisons WHERE expires_at < NOW();
    DELETE FROM version_notifications WHERE expires_at < NOW() AND dismissed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest version for a template
CREATE OR REPLACE FUNCTION get_latest_template_version(template_uuid UUID)
RETURNS UUID AS $$
DECLARE
    latest_version_id UUID;
BEGIN
    SELECT id INTO latest_version_id
    FROM enhanced_template_versions
    WHERE template_id = template_uuid 
      AND status = 'published'
      AND visibility = 'public'
    ORDER BY major_version DESC, minor_version DESC, patch_version DESC
    LIMIT 1;
    
    RETURN latest_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check version compatibility
CREATE OR REPLACE FUNCTION check_version_compatibility(
    from_version_id UUID, 
    to_version_id UUID
) RETURNS TABLE (
    is_compatible BOOLEAN,
    compatibility_level VARCHAR(20),
    breaking_changes_count INTEGER,
    migration_required BOOLEAN
) AS $$
DECLARE
    from_version RECORD;
    to_version RECORD;
    breaking_count INTEGER;
BEGIN
    -- Get version details
    SELECT v.*, array_length(breaking_changes::jsonb, 1) as breaking_count
    INTO from_version
    FROM enhanced_template_versions v 
    WHERE v.id = from_version_id;
    
    SELECT v.*, array_length(breaking_changes::jsonb, 1) as breaking_count
    INTO to_version
    FROM enhanced_template_versions v 
    WHERE v.id = to_version_id;
    
    -- Calculate compatibility
    breaking_count := COALESCE(to_version.breaking_count, 0);
    
    RETURN QUERY SELECT
        CASE 
            WHEN to_version.compatibility_level = 'breaking' OR breaking_count > 0 THEN false
            WHEN to_version.major_version > from_version.major_version THEN false
            ELSE true
        END as is_compatible,
        to_version.compatibility_level,
        breaking_count,
        CASE 
            WHEN to_version.compatibility_level IN ('breaking', 'major') OR breaking_count > 0 THEN true
            ELSE false
        END as migration_required;
END;
$$ LANGUAGE plpgsql;

-- Function to get version statistics
CREATE OR REPLACE FUNCTION get_version_statistics(version_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_downloads INTEGER,
    active_users INTEGER,
    avg_executions_per_user DECIMAL(10,2),
    error_rate_percentage DECIMAL(5,2),
    avg_execution_time_ms DECIMAL(10,3),
    adoption_trend VARCHAR(20)
) AS $$
DECLARE
    start_date DATE := CURRENT_DATE - days_back;
    stats RECORD;
    prev_downloads INTEGER;
    trend VARCHAR(20);
BEGIN
    -- Get current period stats
    SELECT 
        COALESCE(v.download_count, 0) as downloads,
        COUNT(DISTINCT p.buyer_id) as users,
        COALESCE(AVG(s.execution_count), 0) as avg_executions,
        COALESCE(AVG(s.error_rate), 0) as error_rate,
        COALESCE(AVG(s.avg_execution_time), 0) as avg_time
    INTO stats
    FROM enhanced_template_versions v
    LEFT JOIN marketplace_purchases p ON v.id = p.version_id AND p.created_at >= start_date
    LEFT JOIN version_execution_stats s ON v.id = s.version_id AND s.date >= start_date
    WHERE v.id = version_uuid
    GROUP BY v.download_count;
    
    -- Get previous period downloads for trend
    SELECT COALESCE(COUNT(*), 0) INTO prev_downloads
    FROM marketplace_purchases p
    WHERE p.version_id = version_uuid 
      AND p.created_at >= (start_date - days_back) 
      AND p.created_at < start_date;
    
    -- Calculate trend
    IF prev_downloads = 0 AND stats.downloads > 0 THEN
        trend := 'growing';
    ELSIF prev_downloads > 0 THEN
        IF stats.downloads > prev_downloads * 1.1 THEN
            trend := 'growing';
        ELSIF stats.downloads < prev_downloads * 0.9 THEN
            trend := 'declining';
        ELSE
            trend := 'stable';
        END IF;
    ELSE
        trend := 'new';
    END IF;
    
    RETURN QUERY SELECT
        COALESCE(stats.downloads, 0)::INTEGER,
        COALESCE(stats.users, 0)::INTEGER,
        CASE WHEN stats.users > 0 THEN stats.avg_executions ELSE 0 END,
        (stats.error_rate * 100)::DECIMAL(5,2),
        stats.avg_time::DECIMAL(10,3),
        trend;
END;
$$ LANGUAGE plpgsql;

-- Create view for version overview
CREATE OR REPLACE VIEW version_overview AS
SELECT 
    v.id,
    v.template_id,
    v.version_number,
    v.status,
    v.visibility,
    v.compatibility_level,
    v.download_count,
    v.created_at,
    v.published_at,
    t.title as template_title,
    u.name as creator_name,
    array_length(v.breaking_changes::jsonb, 1) as breaking_changes_count,
    array_length(v.new_features::jsonb, 1) as new_features_count,
    CASE 
        WHEN v.status = 'published' AND v.visibility = 'public' THEN true
        ELSE false
    END as is_publicly_available,
    CASE 
        WHEN v.deprecated_at IS NOT NULL THEN true
        ELSE false
    END as is_deprecated,
    DATE_PART('day', NOW() - v.created_at) as days_since_creation
FROM enhanced_template_versions v
JOIN marketplace_templates t ON v.template_id = t.id
LEFT JOIN users u ON v.created_by = u.id;

-- Create materialized view for version performance metrics (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS version_performance_summary AS
SELECT 
    v.id as version_id,
    v.template_id,
    v.version_number,
    v.download_count,
    COALESCE(AVG(s.execution_count), 0) as avg_daily_executions,
    COALESCE(AVG(s.error_rate), 0) as avg_error_rate,
    COALESCE(AVG(s.avg_execution_time), 0) as avg_execution_time,
    COUNT(DISTINCT s.date) as days_with_activity,
    MAX(s.last_execution_at) as last_activity,
    v.updated_at as last_updated
FROM enhanced_template_versions v
LEFT JOIN version_execution_stats s ON v.id = s.version_id
WHERE v.status = 'published'
GROUP BY v.id, v.template_id, v.version_number, v.download_count, v.updated_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_version_performance_version_id ON version_performance_summary(version_id);
CREATE INDEX IF NOT EXISTS idx_version_performance_template ON version_performance_summary(template_id);
CREATE INDEX IF NOT EXISTS idx_version_performance_activity ON version_performance_summary(last_activity DESC NULLS LAST);

-- Function to refresh performance summary
CREATE OR REPLACE FUNCTION refresh_version_performance_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY version_performance_summary;
END;
$$ LANGUAGE plpgsql;