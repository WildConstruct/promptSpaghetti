-- Change Attribution Schema
-- Implements comprehensive change attribution tracking with authorship, granular changes, and visualization support

-- Change attribution entries
CREATE TABLE change_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('node', 'edge', 'property', 'position', 'graph')),
    resource_id VARCHAR(255) NOT NULL,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'move', 'property_change', 'connection_change')),
    change_operation VARCHAR(100) NOT NULL,
    
    -- Attribution information
    author_id UUID,
    author_type VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (author_type IN ('user', 'anonymous', 'guest', 'system', 'api')),
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Change details
    change_data JSONB NOT NULL DEFAULT '{}',
    old_value JSONB,
    new_value JSONB,
    change_size INTEGER DEFAULT 0,
    
    -- Context information
    snapshot_id UUID,
    operation_id UUID,
    batch_id UUID,
    parent_change_id UUID,
    
    -- Metadata
    change_reason TEXT,
    change_description TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_collaborative BOOLEAN DEFAULT FALSE,
    collaborator_count INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    effective_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_attribution_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_attribution_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_attribution_snapshot FOREIGN KEY (snapshot_id) REFERENCES version_snapshots(id) ON DELETE SET NULL,
    CONSTRAINT fk_attribution_parent FOREIGN KEY (parent_change_id) REFERENCES change_attributions(id) ON DELETE SET NULL
);

-- Attribution aggregations for performance
CREATE TABLE attribution_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    author_id UUID,
    author_type VARCHAR(50) NOT NULL,
    aggregation_period VARCHAR(20) NOT NULL CHECK (aggregation_period IN ('hour', 'day', 'week', 'month')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Aggregated metrics
    total_changes INTEGER DEFAULT 0,
    creates_count INTEGER DEFAULT 0,
    updates_count INTEGER DEFAULT 0,
    deletes_count INTEGER DEFAULT 0,
    moves_count INTEGER DEFAULT 0,
    
    -- Resource type breakdown
    node_changes INTEGER DEFAULT 0,
    edge_changes INTEGER DEFAULT 0,
    property_changes INTEGER DEFAULT 0,
    position_changes INTEGER DEFAULT 0,
    
    -- Collaboration metrics
    collaborative_changes INTEGER DEFAULT 0,
    unique_collaborators INTEGER DEFAULT 0,
    
    -- Size metrics
    total_change_size BIGINT DEFAULT 0,
    average_change_size DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_aggregation_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_aggregation_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique constraint for aggregation periods
    CONSTRAINT uk_attribution_aggregation UNIQUE (project_id, author_id, aggregation_period, period_start)
);

-- Attribution sessions for tracking editing sessions
CREATE TABLE attribution_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    author_id UUID,
    session_key VARCHAR(255) NOT NULL,
    
    -- Session metadata
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Session stats
    changes_count INTEGER DEFAULT 0,
    keystrokes_count INTEGER DEFAULT 0,
    mouse_events_count INTEGER DEFAULT 0,
    
    -- Environment information
    browser_info JSONB,
    device_info JSONB,
    location_info JSONB,
    
    -- Privacy settings
    is_anonymous BOOLEAN DEFAULT FALSE,
    tracking_consent BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_session_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Attribution privacy settings
CREATE TABLE attribution_privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Privacy preferences
    show_in_attribution BOOLEAN DEFAULT TRUE,
    show_detailed_changes BOOLEAN DEFAULT TRUE,
    show_timing_info BOOLEAN DEFAULT TRUE,
    show_location_info BOOLEAN DEFAULT FALSE,
    
    -- Granularity settings
    track_property_changes BOOLEAN DEFAULT TRUE,
    track_position_changes BOOLEAN DEFAULT TRUE,
    track_mouse_movements BOOLEAN DEFAULT FALSE,
    track_keystrokes BOOLEAN DEFAULT FALSE,
    
    -- Retention settings
    retention_days INTEGER DEFAULT 365,
    auto_anonymize_after_days INTEGER DEFAULT 90,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_privacy_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_privacy_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint
    CONSTRAINT uk_attribution_privacy UNIQUE (project_id, user_id)
);

-- Attribution statistics cache
CREATE TABLE attribution_stats_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    cache_key VARCHAR(255) NOT NULL,
    cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('contributor_stats', 'change_heatmap', 'timeline_data', 'collaboration_metrics')),
    
    -- Cache data
    cache_data JSONB NOT NULL,
    cache_metadata JSONB DEFAULT '{}',
    
    -- Cache control
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_stats_cache_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Unique constraint
    CONSTRAINT uk_attribution_stats_cache UNIQUE (project_id, cache_key, cache_type)
);

-- Indexes for performance
CREATE INDEX idx_change_attributions_project_id ON change_attributions(project_id);
CREATE INDEX idx_change_attributions_author_id ON change_attributions(author_id);
CREATE INDEX idx_change_attributions_resource ON change_attributions(resource_type, resource_id);
CREATE INDEX idx_change_attributions_change_type ON change_attributions(change_type);
CREATE INDEX idx_change_attributions_created_at ON change_attributions(created_at DESC);
CREATE INDEX idx_change_attributions_effective_at ON change_attributions(effective_at DESC);
CREATE INDEX idx_change_attributions_snapshot_id ON change_attributions(snapshot_id);
CREATE INDEX idx_change_attributions_batch_id ON change_attributions(batch_id);
CREATE INDEX idx_change_attributions_session_id ON change_attributions(session_id);

-- Composite indexes for common queries
CREATE INDEX idx_change_attributions_project_author ON change_attributions(project_id, author_id);
CREATE INDEX idx_change_attributions_project_resource ON change_attributions(project_id, resource_type, resource_id);
CREATE INDEX idx_change_attributions_project_time ON change_attributions(project_id, created_at DESC);
CREATE INDEX idx_change_attributions_author_time ON change_attributions(author_id, created_at DESC);

-- Attribution aggregations indexes
CREATE INDEX idx_attribution_aggregations_project_id ON attribution_aggregations(project_id);
CREATE INDEX idx_attribution_aggregations_author_id ON attribution_aggregations(author_id);
CREATE INDEX idx_attribution_aggregations_period ON attribution_aggregations(aggregation_period, period_start);
CREATE INDEX idx_attribution_aggregations_project_period ON attribution_aggregations(project_id, aggregation_period, period_start);

-- Attribution sessions indexes
CREATE INDEX idx_attribution_sessions_project_id ON attribution_sessions(project_id);
CREATE INDEX idx_attribution_sessions_author_id ON attribution_sessions(author_id);
CREATE INDEX idx_attribution_sessions_session_key ON attribution_sessions(session_key);
CREATE INDEX idx_attribution_sessions_start_time ON attribution_sessions(start_time DESC);
CREATE INDEX idx_attribution_sessions_last_activity ON attribution_sessions(last_activity DESC);

-- Privacy settings indexes
CREATE INDEX idx_attribution_privacy_project_id ON attribution_privacy_settings(project_id);
CREATE INDEX idx_attribution_privacy_user_id ON attribution_privacy_settings(user_id);

-- Stats cache indexes
CREATE INDEX idx_attribution_stats_cache_project_id ON attribution_stats_cache(project_id);
CREATE INDEX idx_attribution_stats_cache_type ON attribution_stats_cache(cache_type);
CREATE INDEX idx_attribution_stats_cache_expires_at ON attribution_stats_cache(expires_at);

-- GIN indexes for JSONB columns
CREATE INDEX idx_change_attributions_change_data_gin ON change_attributions USING GIN (change_data);
CREATE INDEX idx_change_attributions_old_value_gin ON change_attributions USING GIN (old_value);
CREATE INDEX idx_change_attributions_new_value_gin ON change_attributions USING GIN (new_value);
CREATE INDEX idx_attribution_sessions_browser_info_gin ON attribution_sessions USING GIN (browser_info);
CREATE INDEX idx_attribution_sessions_device_info_gin ON attribution_sessions USING GIN (device_info);
CREATE INDEX idx_attribution_stats_cache_data_gin ON attribution_stats_cache USING GIN (cache_data);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_attribution_aggregations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_attribution_aggregations_updated_at
    BEFORE UPDATE ON attribution_aggregations
    FOR EACH ROW
    EXECUTE FUNCTION update_attribution_aggregations_updated_at();

CREATE OR REPLACE FUNCTION update_attribution_privacy_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_attribution_privacy_settings_updated_at
    BEFORE UPDATE ON attribution_privacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_attribution_privacy_settings_updated_at();

-- Function to update attribution session activity
CREATE OR REPLACE FUNCTION update_attribution_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE attribution_sessions 
    SET 
        last_activity = CURRENT_TIMESTAMP,
        changes_count = changes_count + 1
    WHERE session_key = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
    AFTER INSERT ON change_attributions
    FOR EACH ROW
    EXECUTE FUNCTION update_attribution_session_activity();

-- Function to automatically aggregate attribution data
CREATE OR REPLACE FUNCTION aggregate_attribution_data()
RETURNS TRIGGER AS $$
DECLARE
    hour_start TIMESTAMP WITH TIME ZONE;
    day_start TIMESTAMP WITH TIME ZONE;
    week_start TIMESTAMP WITH TIME ZONE;
    month_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate period boundaries
    hour_start := date_trunc('hour', NEW.created_at);
    day_start := date_trunc('day', NEW.created_at);
    week_start := date_trunc('week', NEW.created_at);
    month_start := date_trunc('month', NEW.created_at);
    
    -- Update hourly aggregation
    INSERT INTO attribution_aggregations (
        project_id, author_id, author_type, aggregation_period, period_start, period_end,
        total_changes, creates_count, updates_count, deletes_count, moves_count,
        node_changes, edge_changes, property_changes, position_changes,
        collaborative_changes, total_change_size
    ) VALUES (
        NEW.project_id, NEW.author_id, NEW.author_type, 'hour', hour_start, hour_start + INTERVAL '1 hour',
        1, 
        CASE WHEN NEW.change_type = 'create' THEN 1 ELSE 0 END,
        CASE WHEN NEW.change_type = 'update' THEN 1 ELSE 0 END,
        CASE WHEN NEW.change_type = 'delete' THEN 1 ELSE 0 END,
        CASE WHEN NEW.change_type = 'move' THEN 1 ELSE 0 END,
        CASE WHEN NEW.resource_type = 'node' THEN 1 ELSE 0 END,
        CASE WHEN NEW.resource_type = 'edge' THEN 1 ELSE 0 END,
        CASE WHEN NEW.resource_type = 'property' THEN 1 ELSE 0 END,
        CASE WHEN NEW.resource_type = 'position' THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_collaborative THEN 1 ELSE 0 END,
        NEW.change_size
    ) ON CONFLICT (project_id, author_id, aggregation_period, period_start) DO UPDATE SET
        total_changes = attribution_aggregations.total_changes + 1,
        creates_count = attribution_aggregations.creates_count + CASE WHEN NEW.change_type = 'create' THEN 1 ELSE 0 END,
        updates_count = attribution_aggregations.updates_count + CASE WHEN NEW.change_type = 'update' THEN 1 ELSE 0 END,
        deletes_count = attribution_aggregations.deletes_count + CASE WHEN NEW.change_type = 'delete' THEN 1 ELSE 0 END,
        moves_count = attribution_aggregations.moves_count + CASE WHEN NEW.change_type = 'move' THEN 1 ELSE 0 END,
        node_changes = attribution_aggregations.node_changes + CASE WHEN NEW.resource_type = 'node' THEN 1 ELSE 0 END,
        edge_changes = attribution_aggregations.edge_changes + CASE WHEN NEW.resource_type = 'edge' THEN 1 ELSE 0 END,
        property_changes = attribution_aggregations.property_changes + CASE WHEN NEW.resource_type = 'property' THEN 1 ELSE 0 END,
        position_changes = attribution_aggregations.position_changes + CASE WHEN NEW.resource_type = 'position' THEN 1 ELSE 0 END,
        collaborative_changes = attribution_aggregations.collaborative_changes + CASE WHEN NEW.is_collaborative THEN 1 ELSE 0 END,
        total_change_size = attribution_aggregations.total_change_size + NEW.change_size,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Similar logic for daily, weekly, and monthly aggregations would be added here
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_aggregate_attribution_data
    AFTER INSERT ON change_attributions
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_attribution_data();

-- Comments for documentation
COMMENT ON TABLE change_attributions IS 'Tracks detailed attribution for all changes made to projects';
COMMENT ON TABLE attribution_aggregations IS 'Pre-computed aggregations of attribution data for performance';
COMMENT ON TABLE attribution_sessions IS 'Tracks editing sessions for attribution context';
COMMENT ON TABLE attribution_privacy_settings IS 'User privacy preferences for attribution tracking';
COMMENT ON TABLE attribution_stats_cache IS 'Cache for expensive attribution statistics queries';

COMMENT ON COLUMN change_attributions.resource_type IS 'Type of resource that was changed (node, edge, property, position, graph)';
COMMENT ON COLUMN change_attributions.change_type IS 'Type of change operation performed';
COMMENT ON COLUMN change_attributions.author_type IS 'Type of author (user, anonymous, guest, system, api)';
COMMENT ON COLUMN change_attributions.confidence_score IS 'Confidence score for attribution accuracy (0.0-1.0)';
COMMENT ON COLUMN change_attributions.is_collaborative IS 'Whether this change was made in a collaborative context';
COMMENT ON COLUMN change_attributions.change_size IS 'Size of the change in bytes or complexity units';

COMMENT ON COLUMN attribution_aggregations.aggregation_period IS 'Time period for aggregation (hour, day, week, month)';
COMMENT ON COLUMN attribution_aggregations.unique_collaborators IS 'Number of unique collaborators in this period';

COMMENT ON COLUMN attribution_sessions.session_key IS 'Unique identifier for the editing session';
COMMENT ON COLUMN attribution_sessions.duration_seconds IS 'Total duration of the session in seconds';
COMMENT ON COLUMN attribution_sessions.tracking_consent IS 'Whether user consented to detailed tracking';

COMMENT ON COLUMN attribution_privacy_settings.show_in_attribution IS 'Whether to show this user in attribution displays';
COMMENT ON COLUMN attribution_privacy_settings.retention_days IS 'Number of days to retain attribution data';
COMMENT ON COLUMN attribution_privacy_settings.auto_anonymize_after_days IS 'Automatically anonymize attribution after this many days';