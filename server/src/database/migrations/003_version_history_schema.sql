-- Epic 9.3.1 - Version History Schema Migration
-- Database schema for version snapshots, diffs, and branching capability

-- Version Snapshots table - Pointer to immutable snapshot artifacts
CREATE TABLE IF NOT EXISTS version_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL DEFAULT 'main',
    version_number INTEGER NOT NULL,
    version_tag VARCHAR(100), -- Optional semantic version tag (v1.0.0, v1.1.0, etc.)
    
    -- Snapshot metadata
    title VARCHAR(255),
    description TEXT,
    changelog TEXT,
    
    -- Storage information
    s3_uri TEXT NOT NULL, -- S3 path to compressed snapshot data
    size_bytes BIGINT NOT NULL DEFAULT 0,
    checksum VARCHAR(64) NOT NULL, -- SHA-256 checksum for integrity
    compression_format VARCHAR(20) DEFAULT 'gzip', -- gzip, brotli, etc.
    
    -- Author and timing
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Snapshot type and metadata
    snapshot_type VARCHAR(50) DEFAULT 'manual' CHECK (snapshot_type IN ('manual', 'auto', 'milestone', 'backup')),
    trigger_event VARCHAR(100), -- 'user_save', 'periodic', 'milestone_reached', etc.
    parent_snapshot_id UUID REFERENCES version_snapshots(id), -- For branching/forking
    
    -- Statistics and metrics
    node_count INTEGER DEFAULT 0,
    edge_count INTEGER DEFAULT 0,
    complexity_score DECIMAL(5,2), -- Calculated complexity metric
    
    -- Workflow state at snapshot time
    workflow_state VARCHAR(50) DEFAULT 'draft',
    approval_status VARCHAR(50),
    
    -- Constraints
    UNIQUE(project_id, branch_name, version_number),
    CONSTRAINT version_number_positive CHECK (version_number > 0),
    CONSTRAINT size_bytes_positive CHECK (size_bytes >= 0)
);

-- Version Diffs table - Pre-computed graph diffs for fast UI
CREATE TABLE IF NOT EXISTS version_diffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_snapshot_id UUID NOT NULL REFERENCES version_snapshots(id) ON DELETE CASCADE,
    to_snapshot_id UUID NOT NULL REFERENCES version_snapshots(id) ON DELETE CASCADE,
    
    -- Diff metadata
    diff_type VARCHAR(50) DEFAULT 'incremental' CHECK (diff_type IN ('incremental', 'full', 'structural')),
    diff_format VARCHAR(20) DEFAULT 'json' CHECK (diff_format IN ('json', 'binary', 'text')),
    
    -- Diff content
    diff_data JSONB NOT NULL, -- Structured diff data
    diff_summary JSONB, -- Summary statistics (added, removed, modified counts)
    
    -- Storage optimization
    compressed_size BIGINT DEFAULT 0,
    compression_ratio DECIMAL(5,2),
    
    -- Timing and caching
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    
    -- Performance metadata
    computation_time_ms INTEGER, -- Time taken to compute diff
    similarity_score DECIMAL(5,2), -- 0.0 to 1.0, how similar the versions are
    
    -- Constraints
    UNIQUE(from_snapshot_id, to_snapshot_id),
    CONSTRAINT different_snapshots CHECK (from_snapshot_id != to_snapshot_id),
    CONSTRAINT compression_ratio_valid CHECK (compression_ratio >= 0 AND compression_ratio <= 1)
);

-- Branches table - Lightweight branch metadata
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    
    -- Branch metadata
    description TEXT,
    branch_type VARCHAR(50) DEFAULT 'feature' CHECK (branch_type IN ('main', 'feature', 'hotfix', 'experiment', 'archive')),
    
    -- Current state
    head_snapshot_id UUID REFERENCES version_snapshots(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_protected BOOLEAN DEFAULT FALSE, -- Protected branches require special permissions
    
    -- Branch relationships
    parent_branch_id UUID REFERENCES branches(id),
    merge_base_snapshot_id UUID REFERENCES version_snapshots(id), -- Common ancestor for merging
    
    -- Author and timing
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Access control
    visibility VARCHAR(20) DEFAULT 'workspace' CHECK (visibility IN ('private', 'workspace', 'public')),
    
    -- Statistics
    total_commits INTEGER DEFAULT 0,
    
    -- Constraints
    UNIQUE(project_id, name),
    CONSTRAINT branch_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Change Events table - Stream of CRDT ops with author attribution  
CREATE TABLE IF NOT EXISTS change_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    snapshot_id UUID REFERENCES version_snapshots(id) ON DELETE SET NULL,
    
    -- Event metadata
    event_type VARCHAR(100) NOT NULL, -- 'node_added', 'node_removed', 'property_changed', etc.
    event_data JSONB NOT NULL,
    event_sequence BIGINT NOT NULL, -- For ordering operations
    
    -- Attribution
    author_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255),
    session_id VARCHAR(255), -- To group related changes
    
    -- Timing
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Context
    client_info JSONB, -- Browser, IP, etc.
    workspace_id UUID REFERENCES workspaces(id),
    
    -- Change details
    affected_nodes TEXT[], -- Array of node IDs
    affected_properties TEXT[], -- Array of property names
    change_magnitude DECIMAL(5,2) DEFAULT 0, -- Relative size of change
    
    -- Workflow context
    workflow_state VARCHAR(50),
    approval_required BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT event_sequence_positive CHECK (event_sequence > 0),
    CONSTRAINT change_magnitude_valid CHECK (change_magnitude >= 0)
);

-- Version Annotations table - User comments and notes on specific versions
CREATE TABLE IF NOT EXISTS version_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES version_snapshots(id) ON DELETE CASCADE,
    
    -- Annotation content
    annotation_type VARCHAR(50) DEFAULT 'comment' CHECK (annotation_type IN ('comment', 'review', 'approval', 'flag')),
    title VARCHAR(255),
    content_markdown TEXT NOT NULL,
    content_html TEXT, -- Rendered HTML
    
    -- Author and timing
    author_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Status and workflow
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    
    -- Targeting
    target_element_id VARCHAR(255), -- Specific node/edge being annotated
    target_coordinates JSONB, -- X,Y coordinates for spatial annotations
    
    -- Resolution
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    
    -- Constraints
    CONSTRAINT content_not_empty CHECK (length(trim(content_markdown)) > 0)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_version_snapshots_project_branch ON version_snapshots(project_id, branch_name);
CREATE INDEX IF NOT EXISTS idx_version_snapshots_created_at ON version_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_version_snapshots_version_number ON version_snapshots(project_id, branch_name, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_version_snapshots_type ON version_snapshots(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_version_snapshots_parent ON version_snapshots(parent_snapshot_id) WHERE parent_snapshot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_version_diffs_from_snapshot ON version_diffs(from_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_version_diffs_to_snapshot ON version_diffs(to_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_version_diffs_accessed ON version_diffs(last_accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_branches_project ON branches(project_id);
CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(project_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_branches_head ON branches(head_snapshot_id) WHERE head_snapshot_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_branches_parent ON branches(parent_branch_id) WHERE parent_branch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_change_events_project_sequence ON change_events(project_id, event_sequence DESC);
CREATE INDEX IF NOT EXISTS idx_change_events_snapshot ON change_events(snapshot_id) WHERE snapshot_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_change_events_author ON change_events(author_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_events_session ON change_events(session_id, event_sequence) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_change_events_occurred_at ON change_events(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_version_annotations_snapshot ON version_annotations(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_version_annotations_author ON version_annotations(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_version_annotations_status ON version_annotations(status) WHERE status = 'active';

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_version_diffs_data_gin ON version_diffs USING GIN (diff_data);
CREATE INDEX IF NOT EXISTS idx_version_diffs_summary_gin ON version_diffs USING GIN (diff_summary);
CREATE INDEX IF NOT EXISTS idx_change_events_data_gin ON change_events USING GIN (event_data);
CREATE INDEX IF NOT EXISTS idx_change_events_client_gin ON change_events USING GIN (client_info);
CREATE INDEX IF NOT EXISTS idx_version_annotations_coordinates_gin ON version_annotations USING GIN (target_coordinates);

-- Update triggers for updated_at columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_branches_updated_at') THEN
        CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_version_annotations_updated_at') THEN
        CREATE TRIGGER update_version_annotations_updated_at BEFORE UPDATE ON version_annotations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Automatic version number generation
CREATE OR REPLACE FUNCTION get_next_version_number(p_project_id UUID, p_branch_name VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO next_version
    FROM version_snapshots 
    WHERE project_id = p_project_id AND branch_name = p_branch_name;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate diff statistics
CREATE OR REPLACE FUNCTION calculate_diff_stats(diff_data JSONB)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
    added_count INTEGER;
    removed_count INTEGER;
    modified_count INTEGER;
BEGIN
    -- Extract counts from diff data structure
    added_count := COALESCE((diff_data->'summary'->>'added_nodes')::INTEGER, 0) + 
                   COALESCE((diff_data->'summary'->>'added_edges')::INTEGER, 0);
    removed_count := COALESCE((diff_data->'summary'->>'removed_nodes')::INTEGER, 0) + 
                     COALESCE((diff_data->'summary'->>'removed_edges')::INTEGER, 0);
    modified_count := COALESCE((diff_data->'summary'->>'modified_nodes')::INTEGER, 0) + 
                      COALESCE((diff_data->'summary'->>'modified_edges')::INTEGER, 0);
    
    stats := jsonb_build_object(
        'total_changes', added_count + removed_count + modified_count,
        'added', added_count,
        'removed', removed_count,
        'modified', modified_count,
        'complexity', CASE 
            WHEN added_count + removed_count + modified_count = 0 THEN 0
            ELSE LEAST(10, (added_count + removed_count + modified_count) / 10.0)
        END
    );
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update diff summary
CREATE OR REPLACE FUNCTION update_diff_summary()
RETURNS TRIGGER AS $$
BEGIN
    NEW.diff_summary := calculate_diff_stats(NEW.diff_data);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_update_diff_summary') THEN
        CREATE TRIGGER auto_update_diff_summary 
            BEFORE INSERT OR UPDATE OF diff_data ON version_diffs
            FOR EACH ROW EXECUTE FUNCTION update_diff_summary();
    END IF;
END $$;

-- Function to clean up old diffs (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_diffs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM version_diffs 
    WHERE last_accessed_at < NOW() - INTERVAL '1 day' * days_old
      AND access_count < 5; -- Keep frequently accessed diffs
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE version_snapshots IS 'Immutable snapshots of project state at specific points in time';
COMMENT ON TABLE version_diffs IS 'Pre-computed differences between version snapshots for performance';
COMMENT ON TABLE branches IS 'Branch metadata for parallel development workflows';
COMMENT ON TABLE change_events IS 'Stream of individual changes with attribution and context';
COMMENT ON TABLE version_annotations IS 'User comments and reviews on specific versions';

COMMENT ON COLUMN version_snapshots.s3_uri IS 'S3 path to compressed snapshot data';
COMMENT ON COLUMN version_snapshots.checksum IS 'SHA-256 checksum for data integrity verification';
COMMENT ON COLUMN version_diffs.similarity_score IS 'Similarity score (0.0-1.0) between versions';
COMMENT ON COLUMN change_events.event_sequence IS 'Monotonic sequence number for ordering operations';
COMMENT ON COLUMN branches.is_protected IS 'Protected branches require special permissions for changes';