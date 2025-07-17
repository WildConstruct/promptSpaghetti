-- Migration 005: Graph Comparison and Visual Diff System
-- Story 9.3.2 - Visual Diff Tool

-- Graph comparison snapshots for efficient diff operations
CREATE TABLE IF NOT EXISTS graph_comparison_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    graph_id UUID NOT NULL REFERENCES graphs(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES graph_versions(id) ON DELETE CASCADE,
    
    -- Normalized graph structure for comparison
    nodes_hash VARCHAR(64) NOT NULL,
    edges_hash VARCHAR(64) NOT NULL,
    structure_hash VARCHAR(64) NOT NULL,
    
    -- Indexed node and edge data for fast comparison
    nodes_index JSONB NOT NULL DEFAULT '{}',
    edges_index JSONB NOT NULL DEFAULT '{}',
    properties_index JSONB NOT NULL DEFAULT '{}',
    
    -- Comparison metadata
    node_count INTEGER NOT NULL DEFAULT 0,
    edge_count INTEGER NOT NULL DEFAULT 0,
    complexity_score DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(version_id)
);

-- Graph comparison results for caching diff operations
CREATE TABLE IF NOT EXISTS graph_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source and target versions
    source_version_id UUID NOT NULL REFERENCES graph_versions(id) ON DELETE CASCADE,
    target_version_id UUID NOT NULL REFERENCES graph_versions(id) ON DELETE CASCADE,
    
    -- Comparison results
    comparison_type VARCHAR(50) NOT NULL DEFAULT 'structural', -- structural, semantic, visual
    similarity_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    
    -- Change summary
    changes_summary JSONB NOT NULL DEFAULT '{}',
    added_nodes JSONB DEFAULT '[]',
    removed_nodes JSONB DEFAULT '[]',
    modified_nodes JSONB DEFAULT '[]',
    added_edges JSONB DEFAULT '[]',
    removed_edges JSONB DEFAULT '[]',
    modified_edges JSONB DEFAULT '[]',
    
    -- Detailed diff data
    node_diffs JSONB DEFAULT '{}',
    edge_diffs JSONB DEFAULT '{}',
    property_diffs JSONB DEFAULT '{}',
    
    -- Performance and metadata
    comparison_duration_ms INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(source_version_id, target_version_id, comparison_type)
);

-- Visual diff sessions for UI state management
CREATE TABLE IF NOT EXISTS visual_diff_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session context
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    graph_id UUID NOT NULL REFERENCES graphs(id) ON DELETE CASCADE,
    comparison_id UUID REFERENCES graph_comparisons(id) ON DELETE CASCADE,
    
    -- UI state
    view_mode VARCHAR(50) DEFAULT 'side-by-side', -- side-by-side, overlay, unified
    highlight_mode VARCHAR(50) DEFAULT 'changes', -- changes, additions, deletions, all
    zoom_level DECIMAL(3,2) DEFAULT 1.0,
    viewport_state JSONB DEFAULT '{}',
    
    -- Filter and display options
    show_unchanged BOOLEAN DEFAULT true,
    show_metadata BOOLEAN DEFAULT false,
    filter_options JSONB DEFAULT '{}',
    
    -- Session metadata
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Node matching results for detailed comparison
CREATE TABLE IF NOT EXISTS node_match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comparison_id UUID NOT NULL REFERENCES graph_comparisons(id) ON DELETE CASCADE,
    
    -- Node identification
    source_node_id VARCHAR(255),
    target_node_id VARCHAR(255),
    match_type VARCHAR(50) NOT NULL, -- exact, similar, added, removed, modified
    
    -- Matching confidence and details
    confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    match_criteria JSONB DEFAULT '{}',
    property_changes JSONB DEFAULT '{}',
    
    -- Position and visual changes
    position_changed BOOLEAN DEFAULT false,
    visual_changes JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Edge matching results for detailed comparison
CREATE TABLE IF NOT EXISTS edge_match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comparison_id UUID NOT NULL REFERENCES graph_comparisons(id) ON DELETE CASCADE,
    
    -- Edge identification
    source_edge_id VARCHAR(255),
    target_edge_id VARCHAR(255),
    match_type VARCHAR(50) NOT NULL, -- exact, similar, added, removed, modified
    
    -- Connection details
    source_from_node VARCHAR(255),
    source_to_node VARCHAR(255),
    target_from_node VARCHAR(255),
    target_to_node VARCHAR(255),
    
    -- Matching confidence and details
    confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    property_changes JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_graph_comparison_snapshots_graph_id ON graph_comparison_snapshots(graph_id);
CREATE INDEX IF NOT EXISTS idx_graph_comparison_snapshots_version_id ON graph_comparison_snapshots(version_id);
CREATE INDEX IF NOT EXISTS idx_graph_comparison_snapshots_structure_hash ON graph_comparison_snapshots(structure_hash);

CREATE INDEX IF NOT EXISTS idx_graph_comparisons_source_target ON graph_comparisons(source_version_id, target_version_id);
CREATE INDEX IF NOT EXISTS idx_graph_comparisons_similarity ON graph_comparisons(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_graph_comparisons_created_at ON graph_comparisons(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visual_diff_sessions_user_id ON visual_diff_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_visual_diff_sessions_graph_id ON visual_diff_sessions(graph_id);
CREATE INDEX IF NOT EXISTS idx_visual_diff_sessions_expires_at ON visual_diff_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_node_match_results_comparison_id ON node_match_results(comparison_id);
CREATE INDEX IF NOT EXISTS idx_node_match_results_match_type ON node_match_results(match_type);
CREATE INDEX IF NOT EXISTS idx_edge_match_results_comparison_id ON edge_match_results(comparison_id);

-- Triggers for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_diff_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM visual_diff_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to clean up expired sessions daily
CREATE OR REPLACE FUNCTION schedule_diff_session_cleanup()
RETURNS VOID AS $$
BEGIN
    -- This would be called by a scheduled job
    DELETE FROM visual_diff_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate structure hash
CREATE OR REPLACE FUNCTION calculate_graph_structure_hash(
    p_nodes_data JSONB,
    p_edges_data JSONB
) RETURNS VARCHAR(64) AS $$
DECLARE
    structure_string TEXT;
BEGIN
    -- Create a deterministic string representation of the graph structure
    structure_string := (
        SELECT STRING_AGG(
            node_data->>'id' || ':' || node_data->>'type',
            '|'
            ORDER BY node_data->>'id'
        )
        FROM jsonb_array_elements(p_nodes_data) AS node_data
    ) || '||' || (
        SELECT STRING_AGG(
            edge_data->>'source' || '->' || edge_data->>'target',
            '|'
            ORDER BY edge_data->>'source', edge_data->>'target'
        )
        FROM jsonb_array_elements(p_edges_data) AS edge_data
    );
    
    RETURN encode(digest(structure_string, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE graph_comparison_snapshots IS 'Normalized snapshots of graph versions for efficient comparison operations';
COMMENT ON TABLE graph_comparisons IS 'Cached results of graph version comparisons with detailed diff data';
COMMENT ON TABLE visual_diff_sessions IS 'UI state management for visual diff sessions';
COMMENT ON TABLE node_match_results IS 'Detailed node matching results for graph comparisons';
COMMENT ON TABLE edge_match_results IS 'Detailed edge matching results for graph comparisons';