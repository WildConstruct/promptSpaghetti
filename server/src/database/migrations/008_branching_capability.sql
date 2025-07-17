-- Branching Capability Schema
-- Implements comprehensive branching system for isolated development with merge capabilities

-- Project branches
CREATE TABLE project_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Branch hierarchy
    parent_branch_id UUID,
    base_snapshot_id UUID NOT NULL,
    head_snapshot_id UUID NOT NULL,
    
    -- Branch state
    branch_type VARCHAR(50) NOT NULL DEFAULT 'feature' CHECK (branch_type IN ('main', 'feature', 'hotfix', 'release', 'experiment')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'merged', 'abandoned', 'archived')),
    protection_level VARCHAR(50) NOT NULL DEFAULT 'none' CHECK (protection_level IN ('none', 'protected', 'locked')),
    
    -- Branch metadata
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    merged_at TIMESTAMP WITH TIME ZONE,
    merged_by UUID,
    merged_into_branch_id UUID,
    
    -- Branch configuration
    auto_merge_enabled BOOLEAN DEFAULT FALSE,
    requires_review BOOLEAN DEFAULT FALSE,
    allow_force_push BOOLEAN DEFAULT FALSE,
    delete_on_merge BOOLEAN DEFAULT FALSE,
    
    -- Branch statistics
    commit_count INTEGER DEFAULT 0,
    contributor_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Branch metadata
    metadata JSONB DEFAULT '{}',
    
    -- Foreign key constraints
    CONSTRAINT fk_branch_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_branch_parent FOREIGN KEY (parent_branch_id) REFERENCES project_branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_base_snapshot FOREIGN KEY (base_snapshot_id) REFERENCES version_snapshots(id) ON DELETE RESTRICT,
    CONSTRAINT fk_branch_head_snapshot FOREIGN KEY (head_snapshot_id) REFERENCES version_snapshots(id) ON DELETE RESTRICT,
    CONSTRAINT fk_branch_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_branch_merged_by FOREIGN KEY (merged_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_merged_into FOREIGN KEY (merged_into_branch_id) REFERENCES project_branches(id) ON DELETE SET NULL,
    
    -- Unique constraints
    CONSTRAINT uk_branch_project_name UNIQUE (project_id, name)
);

-- Branch commits (snapshots within a branch)
CREATE TABLE branch_commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    snapshot_id UUID NOT NULL,
    commit_order INTEGER NOT NULL,
    
    -- Commit metadata
    commit_message TEXT,
    commit_author UUID NOT NULL,
    commit_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Parent commits (for merge commits)
    parent_commit_ids UUID[] DEFAULT '{}',
    
    -- Commit statistics
    changes_count INTEGER DEFAULT 0,
    additions_count INTEGER DEFAULT 0,
    deletions_count INTEGER DEFAULT 0,
    
    -- Commit metadata
    commit_metadata JSONB DEFAULT '{}',
    
    -- Foreign key constraints
    CONSTRAINT fk_commit_branch FOREIGN KEY (branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_commit_snapshot FOREIGN KEY (snapshot_id) REFERENCES version_snapshots(id) ON DELETE CASCADE,
    CONSTRAINT fk_commit_author FOREIGN KEY (commit_author) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraints
    CONSTRAINT uk_branch_commit_order UNIQUE (branch_id, commit_order),
    CONSTRAINT uk_branch_snapshot UNIQUE (branch_id, snapshot_id)
);

-- Branch merge requests/pull requests
CREATE TABLE branch_merge_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    source_branch_id UUID NOT NULL,
    target_branch_id UUID NOT NULL,
    
    -- Merge request metadata
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'closed', 'draft')),
    
    -- Request participants
    created_by UUID NOT NULL,
    assigned_to UUID,
    reviewers UUID[] DEFAULT '{}',
    
    -- Merge request state
    source_commit_id UUID,
    target_commit_id UUID,
    merge_commit_id UUID,
    
    -- Merge request configuration
    allow_squash_merge BOOLEAN DEFAULT TRUE,
    allow_merge_commit BOOLEAN DEFAULT TRUE,
    allow_rebase_merge BOOLEAN DEFAULT FALSE,
    delete_source_branch BOOLEAN DEFAULT FALSE,
    
    -- Merge request metrics
    commits_count INTEGER DEFAULT 0,
    files_changed INTEGER DEFAULT 0,
    additions_count INTEGER DEFAULT 0,
    deletions_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    merged_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Merge request metadata
    metadata JSONB DEFAULT '{}',
    
    -- Foreign key constraints
    CONSTRAINT fk_merge_request_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_merge_request_source_branch FOREIGN KEY (source_branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_merge_request_target_branch FOREIGN KEY (target_branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_merge_request_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_merge_request_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_merge_request_source_commit FOREIGN KEY (source_commit_id) REFERENCES branch_commits(id) ON DELETE SET NULL,
    CONSTRAINT fk_merge_request_target_commit FOREIGN KEY (target_commit_id) REFERENCES branch_commits(id) ON DELETE SET NULL,
    CONSTRAINT fk_merge_request_merge_commit FOREIGN KEY (merge_commit_id) REFERENCES branch_commits(id) ON DELETE SET NULL
);

-- Branch merge request reviews
CREATE TABLE branch_merge_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merge_request_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    
    -- Review state
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'commented')),
    review_message TEXT,
    
    -- Review metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_review_merge_request FOREIGN KEY (merge_request_id) REFERENCES branch_merge_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraints
    CONSTRAINT uk_merge_request_reviewer UNIQUE (merge_request_id, reviewer_id)
);

-- Branch permissions
CREATE TABLE branch_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    user_id UUID,
    role_id UUID,
    
    -- Permission types
    can_read BOOLEAN DEFAULT TRUE,
    can_write BOOLEAN DEFAULT FALSE,
    can_merge BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_admin BOOLEAN DEFAULT FALSE,
    
    -- Permission metadata
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_permission_branch FOREIGN KEY (branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_role FOREIGN KEY (role_id) REFERENCES acl_roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure either user_id or role_id is specified
    CONSTRAINT chk_permission_target CHECK (
        (user_id IS NOT NULL AND role_id IS NULL) OR 
        (user_id IS NULL AND role_id IS NOT NULL)
    )
);

-- Branch conflicts tracking
CREATE TABLE branch_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_branch_id UUID NOT NULL,
    target_branch_id UUID NOT NULL,
    
    -- Conflict details
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('merge', 'rebase', 'cherry_pick')),
    conflict_status VARCHAR(50) NOT NULL DEFAULT 'unresolved' CHECK (conflict_status IN ('unresolved', 'resolved', 'ignored')),
    
    -- Conflict data
    conflicted_resources JSONB NOT NULL DEFAULT '[]',
    conflict_resolution JSONB,
    
    -- Conflict metadata
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    
    -- Foreign key constraints
    CONSTRAINT fk_conflict_source_branch FOREIGN KEY (source_branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_conflict_target_branch FOREIGN KEY (target_branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_conflict_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Branch synchronization tracking
CREATE TABLE branch_sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('pull', 'push', 'merge', 'rebase', 'sync')),
    
    -- Operation details
    source_branch_id UUID,
    target_branch_id UUID,
    operation_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (operation_status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    
    -- Operation metadata
    initiated_by UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Operation results
    commits_processed INTEGER DEFAULT 0,
    conflicts_detected INTEGER DEFAULT 0,
    files_changed INTEGER DEFAULT 0,
    
    -- Operation metadata
    operation_metadata JSONB DEFAULT '{}',
    
    -- Foreign key constraints
    CONSTRAINT fk_sync_branch FOREIGN KEY (branch_id) REFERENCES project_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_sync_source_branch FOREIGN KEY (source_branch_id) REFERENCES project_branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_sync_target_branch FOREIGN KEY (target_branch_id) REFERENCES project_branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_sync_initiated_by FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_project_branches_project_id ON project_branches(project_id);
CREATE INDEX idx_project_branches_parent_branch_id ON project_branches(parent_branch_id);
CREATE INDEX idx_project_branches_status ON project_branches(status);
CREATE INDEX idx_project_branches_branch_type ON project_branches(branch_type);
CREATE INDEX idx_project_branches_created_by ON project_branches(created_by);
CREATE INDEX idx_project_branches_last_activity ON project_branches(last_activity_at DESC);

CREATE INDEX idx_branch_commits_branch_id ON branch_commits(branch_id);
CREATE INDEX idx_branch_commits_snapshot_id ON branch_commits(snapshot_id);
CREATE INDEX idx_branch_commits_commit_order ON branch_commits(commit_order);
CREATE INDEX idx_branch_commits_commit_author ON branch_commits(commit_author);
CREATE INDEX idx_branch_commits_timestamp ON branch_commits(commit_timestamp DESC);

CREATE INDEX idx_branch_merge_requests_project_id ON branch_merge_requests(project_id);
CREATE INDEX idx_branch_merge_requests_source_branch ON branch_merge_requests(source_branch_id);
CREATE INDEX idx_branch_merge_requests_target_branch ON branch_merge_requests(target_branch_id);
CREATE INDEX idx_branch_merge_requests_status ON branch_merge_requests(status);
CREATE INDEX idx_branch_merge_requests_created_by ON branch_merge_requests(created_by);
CREATE INDEX idx_branch_merge_requests_assigned_to ON branch_merge_requests(assigned_to);

CREATE INDEX idx_branch_merge_reviews_merge_request ON branch_merge_reviews(merge_request_id);
CREATE INDEX idx_branch_merge_reviews_reviewer ON branch_merge_reviews(reviewer_id);
CREATE INDEX idx_branch_merge_reviews_status ON branch_merge_reviews(status);

CREATE INDEX idx_branch_permissions_branch_id ON branch_permissions(branch_id);
CREATE INDEX idx_branch_permissions_user_id ON branch_permissions(user_id);
CREATE INDEX idx_branch_permissions_role_id ON branch_permissions(role_id);

CREATE INDEX idx_branch_conflicts_source_branch ON branch_conflicts(source_branch_id);
CREATE INDEX idx_branch_conflicts_target_branch ON branch_conflicts(target_branch_id);
CREATE INDEX idx_branch_conflicts_status ON branch_conflicts(conflict_status);

CREATE INDEX idx_branch_sync_operations_branch_id ON branch_sync_operations(branch_id);
CREATE INDEX idx_branch_sync_operations_operation_type ON branch_sync_operations(operation_type);
CREATE INDEX idx_branch_sync_operations_status ON branch_sync_operations(operation_status);
CREATE INDEX idx_branch_sync_operations_initiated_by ON branch_sync_operations(initiated_by);

-- Composite indexes for common queries
CREATE INDEX idx_project_branches_project_status ON project_branches(project_id, status);
CREATE INDEX idx_project_branches_project_type ON project_branches(project_id, branch_type);
CREATE INDEX idx_branch_commits_branch_order ON branch_commits(branch_id, commit_order);
CREATE INDEX idx_branch_merge_requests_source_status ON branch_merge_requests(source_branch_id, status);
CREATE INDEX idx_branch_merge_requests_target_status ON branch_merge_requests(target_branch_id, status);

-- GIN indexes for JSONB columns
CREATE INDEX idx_project_branches_metadata_gin ON project_branches USING GIN (metadata);
CREATE INDEX idx_branch_commits_metadata_gin ON branch_commits USING GIN (commit_metadata);
CREATE INDEX idx_branch_merge_requests_metadata_gin ON branch_merge_requests USING GIN (metadata);
CREATE INDEX idx_branch_conflicts_resources_gin ON branch_conflicts USING GIN (conflicted_resources);
CREATE INDEX idx_branch_conflicts_resolution_gin ON branch_conflicts USING GIN (conflict_resolution);
CREATE INDEX idx_branch_sync_operations_metadata_gin ON branch_sync_operations USING GIN (operation_metadata);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_project_branches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_project_branches_updated_at
    BEFORE UPDATE ON project_branches
    FOR EACH ROW
    EXECUTE FUNCTION update_project_branches_updated_at();

CREATE OR REPLACE FUNCTION update_branch_merge_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_branch_merge_requests_updated_at
    BEFORE UPDATE ON branch_merge_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_merge_requests_updated_at();

CREATE OR REPLACE FUNCTION update_branch_merge_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_branch_merge_reviews_updated_at
    BEFORE UPDATE ON branch_merge_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_merge_reviews_updated_at();

-- Function to update branch statistics
CREATE OR REPLACE FUNCTION update_branch_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update commit count and last activity
    UPDATE project_branches 
    SET 
        commit_count = (
            SELECT COUNT(*) FROM branch_commits 
            WHERE branch_id = NEW.branch_id
        ),
        last_activity_at = CURRENT_TIMESTAMP
    WHERE id = NEW.branch_id;
    
    -- Update contributor count
    UPDATE project_branches 
    SET 
        contributor_count = (
            SELECT COUNT(DISTINCT commit_author) FROM branch_commits 
            WHERE branch_id = NEW.branch_id
        )
    WHERE id = NEW.branch_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_branch_statistics
    AFTER INSERT OR UPDATE ON branch_commits
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_statistics();

-- Function to update merge request statistics
CREATE OR REPLACE FUNCTION update_merge_request_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update merge request commit count
    UPDATE branch_merge_requests 
    SET 
        commits_count = (
            SELECT COUNT(*) FROM branch_commits 
            WHERE branch_id = NEW.source_branch_id
            AND commit_timestamp >= (
                SELECT created_at FROM branch_merge_requests 
                WHERE id = NEW.merge_request_id
            )
        )
    WHERE source_branch_id = NEW.source_branch_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create main branch for new projects
CREATE OR REPLACE FUNCTION create_main_branch_for_project()
RETURNS TRIGGER AS $$
DECLARE
    main_branch_id UUID;
    initial_snapshot_id UUID;
BEGIN
    -- Get or create initial snapshot
    SELECT id INTO initial_snapshot_id
    FROM version_snapshots
    WHERE project_id = NEW.id
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- If no snapshot exists, create a placeholder
    IF initial_snapshot_id IS NULL THEN
        INSERT INTO version_snapshots (project_id, title, description, created_by, s3_uri)
        VALUES (NEW.id, 'Initial snapshot', 'Initial project snapshot', NEW.created_by, '')
        RETURNING id INTO initial_snapshot_id;
    END IF;
    
    -- Create main branch
    INSERT INTO project_branches (
        project_id, name, display_name, description, branch_type, 
        base_snapshot_id, head_snapshot_id, created_by, status
    ) VALUES (
        NEW.id, 'main', 'Main', 'Main development branch', 'main',
        initial_snapshot_id, initial_snapshot_id, NEW.created_by, 'active'
    ) RETURNING id INTO main_branch_id;
    
    -- Create initial commit
    INSERT INTO branch_commits (
        branch_id, snapshot_id, commit_order, commit_message, commit_author
    ) VALUES (
        main_branch_id, initial_snapshot_id, 1, 'Initial commit', NEW.created_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_main_branch_for_project
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION create_main_branch_for_project();

-- Comments for documentation
COMMENT ON TABLE project_branches IS 'Manages project branches for isolated development';
COMMENT ON TABLE branch_commits IS 'Tracks commits (snapshots) within branches';
COMMENT ON TABLE branch_merge_requests IS 'Manages merge requests between branches';
COMMENT ON TABLE branch_merge_reviews IS 'Tracks reviews for merge requests';
COMMENT ON TABLE branch_permissions IS 'Controls access permissions for branches';
COMMENT ON TABLE branch_conflicts IS 'Tracks conflicts between branches';
COMMENT ON TABLE branch_sync_operations IS 'Tracks branch synchronization operations';

COMMENT ON COLUMN project_branches.branch_type IS 'Type of branch: main, feature, hotfix, release, experiment';
COMMENT ON COLUMN project_branches.status IS 'Current status: active, merged, abandoned, archived';
COMMENT ON COLUMN project_branches.protection_level IS 'Protection level: none, protected, locked';
COMMENT ON COLUMN project_branches.auto_merge_enabled IS 'Whether to automatically merge approved pull requests';
COMMENT ON COLUMN project_branches.requires_review IS 'Whether changes require review before merge';

COMMENT ON COLUMN branch_commits.commit_order IS 'Sequential order of commits within the branch';
COMMENT ON COLUMN branch_commits.parent_commit_ids IS 'Array of parent commit IDs for merge commits';

COMMENT ON COLUMN branch_merge_requests.status IS 'Merge request status: open, merged, closed, draft';
COMMENT ON COLUMN branch_merge_requests.reviewers IS 'Array of user IDs assigned as reviewers';
COMMENT ON COLUMN branch_merge_requests.allow_squash_merge IS 'Whether squash merging is allowed';
COMMENT ON COLUMN branch_merge_requests.allow_merge_commit IS 'Whether merge commits are allowed';
COMMENT ON COLUMN branch_merge_requests.allow_rebase_merge IS 'Whether rebase merging is allowed';

COMMENT ON COLUMN branch_merge_reviews.status IS 'Review status: pending, approved, rejected, commented';

COMMENT ON COLUMN branch_permissions.can_read IS 'Permission to read branch content';
COMMENT ON COLUMN branch_permissions.can_write IS 'Permission to push commits to branch';
COMMENT ON COLUMN branch_permissions.can_merge IS 'Permission to merge into branch';
COMMENT ON COLUMN branch_permissions.can_delete IS 'Permission to delete branch';
COMMENT ON COLUMN branch_permissions.can_admin IS 'Permission to modify branch settings';

COMMENT ON COLUMN branch_conflicts.conflict_type IS 'Type of conflict: merge, rebase, cherry_pick';
COMMENT ON COLUMN branch_conflicts.conflicted_resources IS 'JSONB array of resources with conflicts';
COMMENT ON COLUMN branch_conflicts.conflict_resolution IS 'JSONB data for conflict resolution';

COMMENT ON COLUMN branch_sync_operations.operation_type IS 'Type of sync operation: pull, push, merge, rebase, sync';
COMMENT ON COLUMN branch_sync_operations.operation_status IS 'Status: pending, in_progress, completed, failed, cancelled';