-- Version Restoration Schema
-- Implements comprehensive version restoration system with conflict resolution

-- Restoration attempts log
CREATE TABLE restoration_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    source_snapshot_id UUID NOT NULL,
    target_snapshot_id UUID, -- NULL for current state
    initiated_by UUID NOT NULL,
    restoration_type VARCHAR(50) NOT NULL CHECK (restoration_type IN ('full', 'partial', 'selective')),
    restoration_strategy VARCHAR(50) NOT NULL CHECK (restoration_strategy IN ('replace', 'merge', 'selective')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_restoration_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_restoration_source_snapshot FOREIGN KEY (source_snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_restoration_target_snapshot FOREIGN KEY (target_snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_restoration_initiated_by FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Conflict resolution entries
CREATE TABLE restoration_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restoration_attempt_id UUID NOT NULL,
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('node_modified', 'edge_modified', 'node_deleted', 'edge_deleted', 'position_conflict', 'property_conflict')),
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('node', 'edge', 'property')),
    resource_id VARCHAR(255) NOT NULL,
    conflict_description TEXT,
    source_value JSONB,
    target_value JSONB,
    current_value JSONB,
    resolution_strategy VARCHAR(50) CHECK (resolution_strategy IN ('keep_source', 'keep_target', 'keep_current', 'merge', 'skip', 'manual')),
    resolved_value JSONB,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_conflict_restoration_attempt FOREIGN KEY (restoration_attempt_id) REFERENCES restoration_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_conflict_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Restoration operations log
CREATE TABLE restoration_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restoration_attempt_id UUID NOT NULL,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('create_node', 'update_node', 'delete_node', 'create_edge', 'update_edge', 'delete_edge', 'update_property')),
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('node', 'edge', 'property')),
    resource_id VARCHAR(255) NOT NULL,
    operation_data JSONB NOT NULL,
    execution_order INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_operation_restoration_attempt FOREIGN KEY (restoration_attempt_id) REFERENCES restoration_attempts(id) ON DELETE CASCADE
);

-- Restoration preview sessions
CREATE TABLE restoration_preview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    source_snapshot_id UUID NOT NULL,
    target_snapshot_id UUID,
    created_by UUID NOT NULL,
    preview_data JSONB NOT NULL,
    conflict_summary JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_preview_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_preview_source_snapshot FOREIGN KEY (source_snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_preview_target_snapshot FOREIGN KEY (target_snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_preview_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Restoration bookmarks (for saving partial restoration configurations)
CREATE TABLE restoration_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_snapshot_id UUID NOT NULL,
    target_snapshot_id UUID,
    restoration_config JSONB NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_bookmark_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_source_snapshot FOREIGN KEY (source_snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_target_snapshot FOREIGN KEY (target_snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_restoration_attempts_project_id ON restoration_attempts(project_id);
CREATE INDEX idx_restoration_attempts_status ON restoration_attempts(status);
CREATE INDEX idx_restoration_attempts_created_at ON restoration_attempts(created_at DESC);
CREATE INDEX idx_restoration_attempts_initiated_by ON restoration_attempts(initiated_by);

CREATE INDEX idx_restoration_conflicts_attempt_id ON restoration_conflicts(restoration_attempt_id);
CREATE INDEX idx_restoration_conflicts_type ON restoration_conflicts(conflict_type);
CREATE INDEX idx_restoration_conflicts_resource ON restoration_conflicts(resource_type, resource_id);

CREATE INDEX idx_restoration_operations_attempt_id ON restoration_operations(restoration_attempt_id);
CREATE INDEX idx_restoration_operations_order ON restoration_operations(execution_order);
CREATE INDEX idx_restoration_operations_status ON restoration_operations(status);

CREATE INDEX idx_restoration_preview_sessions_project_id ON restoration_preview_sessions(project_id);
CREATE INDEX idx_restoration_preview_sessions_expires_at ON restoration_preview_sessions(expires_at);
CREATE INDEX idx_restoration_preview_sessions_created_by ON restoration_preview_sessions(created_by);

CREATE INDEX idx_restoration_bookmarks_project_id ON restoration_bookmarks(project_id);
CREATE INDEX idx_restoration_bookmarks_created_by ON restoration_bookmarks(created_by);
CREATE INDEX idx_restoration_bookmarks_name ON restoration_bookmarks(name);

-- Composite indexes for common queries
CREATE INDEX idx_restoration_attempts_project_status ON restoration_attempts(project_id, status);
CREATE INDEX idx_restoration_conflicts_attempt_resolved ON restoration_conflicts(restoration_attempt_id, resolved_at);
CREATE INDEX idx_restoration_operations_attempt_order ON restoration_operations(restoration_attempt_id, execution_order);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_restoration_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restoration_attempts_updated_at
    BEFORE UPDATE ON restoration_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_restoration_attempts_updated_at();

CREATE OR REPLACE FUNCTION update_restoration_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restoration_bookmarks_updated_at
    BEFORE UPDATE ON restoration_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_restoration_bookmarks_updated_at();

-- Comments for documentation
COMMENT ON TABLE restoration_attempts IS 'Tracks version restoration attempts with status and progress';
COMMENT ON TABLE restoration_conflicts IS 'Stores conflicts detected during restoration with resolution strategies';
COMMENT ON TABLE restoration_operations IS 'Logs individual operations performed during restoration';
COMMENT ON TABLE restoration_preview_sessions IS 'Temporary sessions for previewing restoration changes';
COMMENT ON TABLE restoration_bookmarks IS 'Saved restoration configurations for reuse';

COMMENT ON COLUMN restoration_attempts.restoration_type IS 'Type of restoration: full (entire snapshot), partial (selected elements), selective (user-defined subset)';
COMMENT ON COLUMN restoration_attempts.restoration_strategy IS 'Strategy for handling conflicts: replace (overwrite), merge (intelligent merge), selective (user choice)';
COMMENT ON COLUMN restoration_attempts.metadata IS 'Additional metadata including node/edge counts, user selections, etc.';

COMMENT ON COLUMN restoration_conflicts.conflict_type IS 'Type of conflict detected during restoration process';
COMMENT ON COLUMN restoration_conflicts.resolution_strategy IS 'How the conflict was resolved or should be resolved';
COMMENT ON COLUMN restoration_conflicts.source_value IS 'Value from the source snapshot being restored';
COMMENT ON COLUMN restoration_conflicts.target_value IS 'Value from the target snapshot (if applicable)';
COMMENT ON COLUMN restoration_conflicts.current_value IS 'Current value in the live state';
COMMENT ON COLUMN restoration_conflicts.resolved_value IS 'Final resolved value after conflict resolution';

COMMENT ON COLUMN restoration_operations.operation_data IS 'Detailed operation data including before/after values';
COMMENT ON COLUMN restoration_operations.execution_order IS 'Order in which operations should be executed';

COMMENT ON COLUMN restoration_preview_sessions.preview_data IS 'Preview data showing what changes would be made';
COMMENT ON COLUMN restoration_preview_sessions.conflict_summary IS 'Summary of conflicts that would occur';
COMMENT ON COLUMN restoration_preview_sessions.expires_at IS 'When this preview session expires';

COMMENT ON COLUMN restoration_bookmarks.restoration_config IS 'Configuration for restoration including selected nodes/edges, strategies, etc.';