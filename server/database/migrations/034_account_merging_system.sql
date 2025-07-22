-- Account Merging System Migration
-- Creates tables to support comprehensive account merging functionality

-- Account merge requests table
CREATE TABLE IF NOT EXISTS account_merge_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_account_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    secondary_account_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'rolled_back')),
    merge_strategy JSONB NOT NULL,
    conflict_resolutions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    
    -- Prevent merging an account with itself
    CHECK (primary_account_id != secondary_account_id)
);

-- Account merge rollback plans table
CREATE TABLE IF NOT EXISTS account_merge_rollback_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merge_request_id UUID NOT NULL REFERENCES account_merge_requests(id) ON DELETE CASCADE,
    rollback_actions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_status VARCHAR(20) DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executed', 'expired', 'failed'))
);

-- Account merge audit log table
CREATE TABLE IF NOT EXISTS account_merge_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merge_request_id UUID NOT NULL REFERENCES account_merge_requests(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action_by UUID REFERENCES users(id),
    rollback_data JSONB -- Data needed for potential rollback
);

-- Account merge conflicts table - for tracking and resolving conflicts
CREATE TABLE IF NOT EXISTS account_merge_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merge_request_id UUID NOT NULL REFERENCES account_merge_requests(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    primary_value TEXT,
    secondary_value TEXT,
    resolved_value TEXT,
    resolution_type VARCHAR(50) NOT NULL CHECK (resolution_type IN ('keep_primary', 'keep_secondary', 'merge', 'manual')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolution_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account merge statistics table - for tracking merge success rates and patterns
CREATE TABLE IF NOT EXISTS account_merge_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merge_request_id UUID NOT NULL REFERENCES account_merge_requests(id) ON DELETE CASCADE,
    primary_account_age_days INTEGER,
    secondary_account_age_days INTEGER,
    primary_project_count INTEGER DEFAULT 0,
    secondary_project_count INTEGER DEFAULT 0,
    conflicts_count INTEGER DEFAULT 0,
    merge_duration_ms INTEGER,
    success_rate DECIMAL(3,2), -- For tracking overall success
    risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merge_requests_primary_account 
ON account_merge_requests(primary_account_id);

CREATE INDEX IF NOT EXISTS idx_merge_requests_secondary_account 
ON account_merge_requests(secondary_account_id);

CREATE INDEX IF NOT EXISTS idx_merge_requests_status 
ON account_merge_requests(status);

CREATE INDEX IF NOT EXISTS idx_merge_requests_requested_by 
ON account_merge_requests(requested_by);

CREATE INDEX IF NOT EXISTS idx_merge_requests_created_at 
ON account_merge_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merge_rollback_plans_merge_request 
ON account_merge_rollback_plans(merge_request_id);

CREATE INDEX IF NOT EXISTS idx_merge_rollback_plans_expires_at 
ON account_merge_rollback_plans(expires_at);

CREATE INDEX IF NOT EXISTS idx_merge_audit_log_merge_request 
ON account_merge_audit_log(merge_request_id);

CREATE INDEX IF NOT EXISTS idx_merge_audit_log_table_record 
ON account_merge_audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_merge_audit_log_timestamp 
ON account_merge_audit_log(action_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_merge_conflicts_merge_request 
ON account_merge_conflicts(merge_request_id);

CREATE INDEX IF NOT EXISTS idx_merge_statistics_merge_request 
ON account_merge_statistics(merge_request_id);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_merge_requests_strategy_gin 
ON account_merge_requests USING GIN(merge_strategy);

CREATE INDEX IF NOT EXISTS idx_merge_requests_resolutions_gin 
ON account_merge_requests USING GIN(conflict_resolutions);

CREATE INDEX IF NOT EXISTS idx_merge_rollback_actions_gin 
ON account_merge_rollback_plans USING GIN(rollback_actions);

CREATE INDEX IF NOT EXISTS idx_merge_audit_old_data_gin 
ON account_merge_audit_log USING GIN(old_data);

CREATE INDEX IF NOT EXISTS idx_merge_audit_new_data_gin 
ON account_merge_audit_log USING GIN(new_data);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_account_merge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for merge requests
CREATE TRIGGER update_account_merge_requests_updated_at
    BEFORE UPDATE ON account_merge_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_account_merge_updated_at();

-- Function to prevent duplicate active merge requests
CREATE OR REPLACE FUNCTION check_duplicate_merge_requests()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for existing pending/in_progress requests involving the same accounts
    IF EXISTS (
        SELECT 1 FROM account_merge_requests 
        WHERE (
            primary_account_id = NEW.primary_account_id OR 
            secondary_account_id = NEW.primary_account_id OR
            primary_account_id = NEW.secondary_account_id OR 
            secondary_account_id = NEW.secondary_account_id
        )
        AND status IN ('pending', 'in_progress')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
        RAISE EXCEPTION 'An active merge request already exists for one of these accounts';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent duplicate active merge requests
CREATE TRIGGER check_duplicate_merge_requests_trigger
    BEFORE INSERT OR UPDATE ON account_merge_requests
    FOR EACH ROW
    EXECUTE FUNCTION check_duplicate_merge_requests();

-- Function to clean up expired rollback plans
CREATE OR REPLACE FUNCTION cleanup_expired_rollback_plans()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM account_merge_rollback_plans 
    WHERE expires_at < NOW() AND execution_status = 'pending';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- View for merge request summary
CREATE OR REPLACE VIEW account_merge_request_summary AS
SELECT 
    amr.id,
    amr.status,
    amr.created_at,
    amr.completed_at,
    amr.merge_strategy,
    pu.email as primary_email,
    su.email as secondary_email,
    ru.email as requested_by_email,
    COALESCE(conflict_count.count, 0) as conflicts_count,
    EXTRACT(EPOCH FROM (COALESCE(amr.completed_at, NOW()) - amr.created_at)) * 1000 as duration_ms,
    CASE 
        WHEN amr.status = 'completed' THEN 'success'
        WHEN amr.status = 'failed' THEN 'failed'
        WHEN amr.status IN ('pending', 'in_progress') THEN 'in_progress'
        ELSE 'unknown'
    END as outcome
FROM account_merge_requests amr
JOIN users pu ON amr.primary_account_id = pu.id
JOIN users su ON amr.secondary_account_id = su.id
JOIN users ru ON amr.requested_by = ru.id
LEFT JOIN (
    SELECT merge_request_id, COUNT(*) as count
    FROM account_merge_conflicts
    GROUP BY merge_request_id
) conflict_count ON amr.id = conflict_count.merge_request_id;

-- View for merge success metrics
CREATE OR REPLACE VIEW account_merge_success_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) as merge_date,
    COUNT(*) as total_requests,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_merges,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_merges,
    SUM(CASE WHEN status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) as pending_merges,
    ROUND(
        (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0))::numeric, 2
    ) as success_rate_percent,
    AVG(
        CASE WHEN status = 'completed' AND completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000 
        ELSE NULL END
    )::integer as avg_completion_time_ms
FROM account_merge_requests
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY merge_date DESC;

-- View for account merge conflict analysis
CREATE OR REPLACE VIEW account_merge_conflict_analysis AS
SELECT 
    field_name,
    COUNT(*) as total_conflicts,
    SUM(CASE WHEN resolution_type = 'keep_primary' THEN 1 ELSE 0 END) as kept_primary,
    SUM(CASE WHEN resolution_type = 'keep_secondary' THEN 1 ELSE 0 END) as kept_secondary,
    SUM(CASE WHEN resolution_type = 'merge' THEN 1 ELSE 0 END) as merged,
    SUM(CASE WHEN resolution_type = 'manual' THEN 1 ELSE 0 END) as manual_resolution,
    ROUND(
        (SUM(CASE WHEN resolution_type = 'keep_primary' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))::numeric, 2
    ) as primary_preference_percent
FROM account_merge_conflicts
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY field_name
HAVING COUNT(*) >= 5  -- Only show fields with significant conflict frequency
ORDER BY total_conflicts DESC;

-- Comments for documentation
COMMENT ON TABLE account_merge_requests IS 'Tracks account merge requests and their processing status';
COMMENT ON TABLE account_merge_rollback_plans IS 'Stores rollback plans for account merges to enable recovery';
COMMENT ON TABLE account_merge_audit_log IS 'Detailed audit log of all actions performed during account merging';
COMMENT ON TABLE account_merge_conflicts IS 'Tracks field-level conflicts and their resolutions during merges';
COMMENT ON TABLE account_merge_statistics IS 'Statistical data about merge operations for analysis and optimization';

COMMENT ON VIEW account_merge_request_summary IS 'Summary view of merge requests with key metrics and status';
COMMENT ON VIEW account_merge_success_metrics IS 'Daily success metrics for account merge operations';
COMMENT ON VIEW account_merge_conflict_analysis IS 'Analysis of common conflict patterns and resolution preferences';

-- Insert default merge strategy templates (for reference)
-- This would be used by the application to provide preset merge strategies
INSERT INTO account_merge_requests (
    id, 
    primary_account_id, 
    secondary_account_id, 
    requested_by, 
    status, 
    merge_strategy,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'completed',
    '{
        "profileMerge": "merge_fields",
        "preferenceMerge": "merge_categories", 
        "projectDataMerge": "keep_all",
        "oauthAccountMerge": "merge_all",
        "sessionHandling": "transfer_all",
        "preserveAuditTrail": true,
        "_template": "conservative_merge",
        "_description": "Conservative merge strategy that preserves all data"
    }',
    '2000-01-01 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO account_merge_requests (
    id,
    primary_account_id,
    secondary_account_id, 
    requested_by,
    status,
    merge_strategy,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'completed',
    '{
        "profileMerge": "keep_primary",
        "preferenceMerge": "keep_primary",
        "projectDataMerge": "keep_primary", 
        "oauthAccountMerge": "keep_primary",
        "sessionHandling": "invalidate_secondary",
        "preserveAuditTrail": true,
        "_template": "minimal_merge",
        "_description": "Minimal merge that keeps primary account data unchanged"
    }',
    '2000-01-01 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;