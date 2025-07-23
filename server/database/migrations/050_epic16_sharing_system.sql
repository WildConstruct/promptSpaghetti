-- Epic 16 Sharing System Database Schema
-- Migration 050: Core sharing functionality tables
-- Created: 2025-07-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for sharing system
CREATE TYPE sharing_access_level AS ENUM ('public', 'restricted', 'private');
CREATE TYPE sharing_permission AS ENUM ('view', 'comment', 'edit', 'admin');
CREATE TYPE sharing_status AS ENUM ('active', 'expired', 'revoked', 'pending');
CREATE TYPE content_type AS ENUM ('graph', 'template', 'bundle', 'dataset');
CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'restricted');
CREATE TYPE collaboration_event_type AS ENUM ('comment', 'edit', 'annotation', 'permission_change');
CREATE TYPE collaboration_impact AS ENUM ('minor', 'major', 'breaking');
CREATE TYPE device_type AS ENUM ('desktop', 'tablet', 'mobile');

-- Core shared content table
CREATE TABLE shared_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type content_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    
    -- Metadata
    export_id UUID NOT NULL,
    version VARCHAR(50) NOT NULL,
    author_id UUID NOT NULL,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    language CHAR(2), -- ISO language code
    content_size BIGINT NOT NULL DEFAULT 0,
    checksum_md5 CHAR(32) NOT NULL,
    
    -- Sharing configuration
    access_level sharing_access_level NOT NULL DEFAULT 'private',
    share_token VARCHAR(255) UNIQUE NOT NULL,
    share_url TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    password_hash VARCHAR(255),
    allow_download BOOLEAN NOT NULL DEFAULT true,
    allow_copy BOOLEAN NOT NULL DEFAULT true,
    track_analytics BOOLEAN NOT NULL DEFAULT true,
    notify_on_access BOOLEAN NOT NULL DEFAULT false,
    
    -- Security configuration
    data_classification data_classification NOT NULL DEFAULT 'internal',
    encryption_required BOOLEAN NOT NULL DEFAULT false,
    auditing_enabled BOOLEAN NOT NULL DEFAULT true,
    max_share_duration_days INTEGER DEFAULT 90,
    auto_expire BOOLEAN NOT NULL DEFAULT true,
    data_retention_days INTEGER DEFAULT 365,
    ip_whitelist TEXT[] DEFAULT '{}',
    geo_restrictions CHAR(2)[] DEFAULT '{}', -- ISO country codes
    require_authentication BOOLEAN NOT NULL DEFAULT false,
    max_concurrent_users INTEGER,
    session_timeout_minutes INTEGER DEFAULT 60,
    
    -- Status and timestamps
    status sharing_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT chk_valid_share_token CHECK (LENGTH(share_token) >= 32),
    CONSTRAINT chk_valid_checksum CHECK (checksum_md5 ~ '^[a-f0-9]{32}$'),
    CONSTRAINT chk_positive_content_size CHECK (content_size >= 0),
    CONSTRAINT chk_valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Collaborators and permissions table
CREATE TABLE share_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role sharing_permission NOT NULL DEFAULT 'view',
    permissions TEXT[] DEFAULT '{}',
    invited_by UUID NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(shared_content_id, user_id),
    CONSTRAINT chk_valid_email CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

-- Version control for shared content
CREATE TABLE share_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    author_id UUID NOT NULL,
    changes TEXT[] NOT NULL DEFAULT '{}',
    content_size BIGINT NOT NULL,
    checksum_md5 CHAR(32) NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(shared_content_id, version),
    CONSTRAINT chk_version_format CHECK (version ~ '^\d+\.\d+\.\d+$')
);

-- Content annotations (comments, sticky notes, regions)
CREATE TABLE share_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'comment', 'sticky_note', 'region', 'connection_label'
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    color VARCHAR(7), -- Hex color code
    parent_id UUID REFERENCES share_annotations(id) ON DELETE CASCADE,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_valid_color CHECK (color IS NULL OR color ~ '^#[0-9A-F]{6}$'),
    CONSTRAINT chk_positive_dimensions CHECK (
        (width IS NULL OR width > 0) AND 
        (height IS NULL OR height > 0)
    )
);

-- Share access logs for analytics
CREATE TABLE share_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    viewer_id UUID, -- NULL for anonymous viewers
    session_id VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    referrer TEXT,
    
    -- Geographic data
    country CHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Device information
    device_type device_type,
    operating_system VARCHAR(50),
    browser VARCHAR(50),
    
    -- Access details
    duration_seconds INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 1,
    actions_performed TEXT[] DEFAULT '{}',
    
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_valid_duration CHECK (duration_seconds >= 0),
    CONSTRAINT chk_valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- Share downloads tracking
CREATE TABLE share_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    downloaded_by UUID, -- NULL for anonymous downloads
    session_id VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    format VARCHAR(20) NOT NULL,
    file_size BIGINT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error_reason TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_positive_file_size CHECK (file_size > 0)
);

-- Collaboration events for activity tracking
CREATE TABLE share_collaboration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    event_type collaboration_event_type NOT NULL,
    impact collaboration_impact NOT NULL DEFAULT 'minor',
    details JSONB NOT NULL DEFAULT '{}',
    annotation_id UUID REFERENCES share_annotations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share analytics aggregations (for performance)
CREATE TABLE share_analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    date_day DATE NOT NULL,
    
    -- View metrics
    total_views INTEGER NOT NULL DEFAULT 0,
    unique_viewers INTEGER NOT NULL DEFAULT 0,
    average_duration_seconds DECIMAL(10,2) NOT NULL DEFAULT 0,
    bounce_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage
    
    -- Download metrics
    total_downloads INTEGER NOT NULL DEFAULT 0,
    unique_downloaders INTEGER NOT NULL DEFAULT 0,
    download_conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Collaboration metrics
    total_comments INTEGER NOT NULL DEFAULT 0,
    total_edits INTEGER NOT NULL DEFAULT 0,
    active_collaborators INTEGER NOT NULL DEFAULT 0,
    
    -- Geographic distribution (top countries)
    top_countries JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(shared_content_id, date_day)
);

-- Share templates for reusable configurations
CREATE TABLE share_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL,
    
    -- Template configuration
    default_access_level sharing_access_level NOT NULL DEFAULT 'private',
    default_permissions sharing_permission NOT NULL DEFAULT 'view',
    default_expiry_days INTEGER,
    security_config JSONB NOT NULL DEFAULT '{}',
    sharing_config JSONB NOT NULL DEFAULT '{}',
    
    is_public BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_shared_content_token ON shared_content(share_token);
CREATE INDEX idx_shared_content_author ON shared_content(author_id);
CREATE INDEX idx_shared_content_status ON shared_content(status);
CREATE INDEX idx_shared_content_expires ON shared_content(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_shared_content_type ON shared_content(type);
CREATE INDEX idx_shared_content_created ON shared_content(created_at);

CREATE INDEX idx_collaborators_content ON share_collaborators(shared_content_id);
CREATE INDEX idx_collaborators_user ON share_collaborators(user_id);
CREATE INDEX idx_collaborators_email ON share_collaborators(email);

CREATE INDEX idx_versions_content ON share_versions(shared_content_id);
CREATE INDEX idx_versions_current ON share_versions(shared_content_id, is_current) WHERE is_current = true;

CREATE INDEX idx_annotations_content ON share_annotations(shared_content_id);
CREATE INDEX idx_annotations_author ON share_annotations(author_id);
CREATE INDEX idx_annotations_type ON share_annotations(type);
CREATE INDEX idx_annotations_unresolved ON share_annotations(shared_content_id, resolved) WHERE resolved = false;

CREATE INDEX idx_access_logs_content ON share_access_logs(shared_content_id);
CREATE INDEX idx_access_logs_viewer ON share_access_logs(viewer_id) WHERE viewer_id IS NOT NULL;
CREATE INDEX idx_access_logs_session ON share_access_logs(session_id);
CREATE INDEX idx_access_logs_time ON share_access_logs(accessed_at);
CREATE INDEX idx_access_logs_country ON share_access_logs(country) WHERE country IS NOT NULL;

CREATE INDEX idx_downloads_content ON share_downloads(shared_content_id);
CREATE INDEX idx_downloads_user ON share_downloads(downloaded_by) WHERE downloaded_by IS NOT NULL;
CREATE INDEX idx_downloads_time ON share_downloads(downloaded_at);
CREATE INDEX idx_downloads_success ON share_downloads(success);

CREATE INDEX idx_events_content ON share_collaboration_events(shared_content_id);
CREATE INDEX idx_events_user ON share_collaboration_events(user_id);
CREATE INDEX idx_events_type ON share_collaboration_events(event_type);
CREATE INDEX idx_events_time ON share_collaboration_events(created_at);

CREATE INDEX idx_analytics_content_date ON share_analytics_daily(shared_content_id, date_day);
CREATE INDEX idx_analytics_date ON share_analytics_daily(date_day);

CREATE INDEX idx_templates_creator ON share_templates(creator_id);
CREATE INDEX idx_templates_public ON share_templates(is_public) WHERE is_public = true;

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_shared_content_updated_at 
    BEFORE UPDATE ON shared_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at 
    BEFORE UPDATE ON share_annotations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at 
    BEFORE UPDATE ON share_analytics_daily 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON share_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate secure share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to check if share is accessible
CREATE OR REPLACE FUNCTION is_share_accessible(share_token_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    share_record shared_content%ROWTYPE;
BEGIN
    SELECT * INTO share_record 
    FROM shared_content 
    WHERE share_token = share_token_param;
    
    -- Check if share exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check status
    IF share_record.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Check expiry
    IF share_record.expires_at IS NOT NULL AND share_record.expires_at < NOW() THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update analytics aggregations
CREATE OR REPLACE FUNCTION update_daily_analytics(content_id UUID, target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO share_analytics_daily (
        shared_content_id,
        date_day,
        total_views,
        unique_viewers,
        average_duration_seconds,
        total_downloads,
        unique_downloaders,
        total_comments,
        total_edits,
        active_collaborators
    )
    SELECT 
        content_id,
        target_date,
        COUNT(al.id) as total_views,
        COUNT(DISTINCT COALESCE(al.viewer_id, al.session_id)) as unique_viewers,
        AVG(COALESCE(al.duration_seconds, 0)) as average_duration,
        COUNT(sd.id) as total_downloads,
        COUNT(DISTINCT COALESCE(sd.downloaded_by, sd.session_id)) as unique_downloaders,
        COUNT(CASE WHEN an.type = 'comment' THEN 1 END) as total_comments,
        COUNT(CASE WHEN ce.event_type = 'edit' THEN 1 END) as total_edits,
        COUNT(DISTINCT ce.user_id) as active_collaborators
    FROM shared_content sc
    LEFT JOIN share_access_logs al ON sc.id = al.shared_content_id 
        AND DATE(al.accessed_at) = target_date
    LEFT JOIN share_downloads sd ON sc.id = sd.shared_content_id 
        AND DATE(sd.downloaded_at) = target_date
    LEFT JOIN share_annotations an ON sc.id = an.shared_content_id 
        AND DATE(an.created_at) = target_date
    LEFT JOIN share_collaboration_events ce ON sc.id = ce.shared_content_id 
        AND DATE(ce.created_at) = target_date
    WHERE sc.id = content_id
    GROUP BY sc.id
    ON CONFLICT (shared_content_id, date_day) 
    DO UPDATE SET
        total_views = EXCLUDED.total_views,
        unique_viewers = EXCLUDED.unique_viewers,
        average_duration_seconds = EXCLUDED.average_duration_seconds,
        total_downloads = EXCLUDED.total_downloads,
        unique_downloaders = EXCLUDED.unique_downloaders,
        total_comments = EXCLUDED.total_comments,
        total_edits = EXCLUDED.total_edits,
        active_collaborators = EXCLUDED.active_collaborators,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy share access with permissions
CREATE VIEW shared_content_with_permissions AS
SELECT 
    sc.*,
    COALESCE(
        json_agg(
            json_build_object(
                'user_id', col.user_id,
                'email', col.email,
                'name', col.name,
                'role', col.role,
                'invited_at', col.invited_at,
                'accepted_at', col.accepted_at
            )
        ) FILTER (WHERE col.id IS NOT NULL),
        '[]'::json
    ) as collaborators
FROM shared_content sc
LEFT JOIN share_collaborators col ON sc.id = col.shared_content_id
GROUP BY sc.id;

-- Comments on tables for documentation
COMMENT ON TABLE shared_content IS 'Core table for shared content with configuration and security settings';
COMMENT ON TABLE share_collaborators IS 'Users who have been invited to collaborate on shared content';
COMMENT ON TABLE share_versions IS 'Version history for shared content with change tracking';
COMMENT ON TABLE share_annotations IS 'Comments, sticky notes, and other annotations on shared content';
COMMENT ON TABLE share_access_logs IS 'Detailed logs of who accessed shared content and when';
COMMENT ON TABLE share_downloads IS 'Tracking of downloads from shared content';
COMMENT ON TABLE share_collaboration_events IS 'Activity log for collaboration events';
COMMENT ON TABLE share_analytics_daily IS 'Daily aggregated analytics for performance optimization';
COMMENT ON TABLE share_templates IS 'Reusable templates for share configurations';

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sharing_service_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sharing_service_user;