-- Epic 17.1 - Feature Toggle System Database Schema
-- This migration creates the core feature toggle management system

-- Feature toggle types enum
CREATE TYPE toggle_type AS ENUM (
    'boolean',
    'percentage_rollout',
    'multivariate',
    'scheduled',
    'dynamic',
    'segmentation'
);

-- Claude impact level enum
CREATE TYPE claude_impact AS ENUM (
    'NONE',
    'PROMPT_COST',
    'MODEL_VERSION',
    'OUTPUT_QUALITY',
    'HALLUCINATION_RISK'
);

-- Audit action types
CREATE TYPE toggle_audit_action AS ENUM (
    'created',
    'updated',
    'activated',
    'deactivated',
    'archived',
    'override',
    'rollback'
);

-- Main feature toggle table
CREATE TABLE feature_toggle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type toggle_type NOT NULL DEFAULT 'boolean',
    value JSONB NOT NULL DEFAULT '{}',
    
    -- Organization scoping (null = global toggle)
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Claude-specific metadata
    claude_compat TEXT[] DEFAULT ARRAY[]::TEXT[],
    claude_impact claude_impact DEFAULT 'NONE',
    
    -- State management
    enabled BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Version tracking
    version INTEGER DEFAULT 1,
    
    CONSTRAINT valid_key_format CHECK (key ~ '^[a-z0-9_.-]+$')
);

-- Toggle targeting and scoping rules
CREATE TABLE toggle_scope (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Rule definition (attributes, percentages, segments)
    rule JSONB NOT NULL,
    
    -- Priority for rule evaluation (lower = higher priority)
    priority INTEGER DEFAULT 100,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Toggle audit trail
CREATE TABLE toggle_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Actor and action
    actor_id UUID REFERENCES users(id),
    action toggle_audit_action NOT NULL,
    
    -- Change tracking
    before_value JSONB,
    after_value JSONB,
    
    -- Context
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Emergency override tracking
    is_emergency BOOLEAN DEFAULT false,
    ttl_expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for audit table (monthly partitions for performance)
CREATE TABLE toggle_audit_2025_01 PARTITION OF toggle_audit
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE toggle_audit_2025_02 PARTITION OF toggle_audit
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Function to automatically create future partitions
CREATE OR REPLACE FUNCTION create_toggle_audit_partition()
RETURNS trigger AS $$
DECLARE
    partition_date TEXT;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    partition_date := to_char(NEW.created_at, 'YYYY_MM');
    partition_name := 'toggle_audit_' || partition_date;
    start_date := to_char(date_trunc('month', NEW.created_at), 'YYYY-MM-DD');
    end_date := to_char(date_trunc('month', NEW.created_at) + interval '1 month', 'YYYY-MM-DD');
    
    -- Check if partition already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
        EXECUTE format('CREATE TABLE %I PARTITION OF toggle_audit FOR VALUES FROM (%L) TO (%L)',
                      partition_name, start_date, end_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create partitions
CREATE TRIGGER toggle_audit_partition_trigger
    BEFORE INSERT ON toggle_audit
    FOR EACH ROW EXECUTE FUNCTION create_toggle_audit_partition();

-- Toggle evaluation cache for performance
CREATE TABLE toggle_evaluation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Cache key (user_id, org_id, etc.)
    cache_key TEXT NOT NULL,
    
    -- Cached result
    result JSONB NOT NULL,
    
    -- TTL
    expires_at TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(toggle_id, cache_key)
);

-- Toggle dependencies for impact analysis
CREATE TABLE toggle_dependency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    child_toggle_id UUID NOT NULL REFERENCES feature_toggle(id) ON DELETE CASCADE,
    
    -- Dependency type (requires, conflicts, suggests)
    dependency_type TEXT NOT NULL CHECK (dependency_type IN ('requires', 'conflicts', 'suggests')),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(parent_toggle_id, child_toggle_id),
    CHECK (parent_toggle_id != child_toggle_id)
);

-- Indexes for performance
CREATE INDEX idx_feature_toggle_key ON feature_toggle(key);
CREATE INDEX idx_feature_toggle_org_id ON feature_toggle(org_id);
CREATE INDEX idx_feature_toggle_enabled ON feature_toggle(enabled) WHERE enabled = true;
CREATE INDEX idx_feature_toggle_type ON feature_toggle(type);
CREATE INDEX idx_feature_toggle_claude_impact ON feature_toggle(claude_impact);

-- GIN index for JSONB rule queries
CREATE INDEX idx_toggle_scope_rule ON toggle_scope USING GIN(rule);
CREATE INDEX idx_toggle_scope_toggle_id ON toggle_scope(toggle_id);

-- Audit table indexes
CREATE INDEX idx_toggle_audit_toggle_id ON toggle_audit(toggle_id);
CREATE INDEX idx_toggle_audit_actor_id ON toggle_audit(actor_id);
CREATE INDEX idx_toggle_audit_action ON toggle_audit(action);
CREATE INDEX idx_toggle_audit_created_at ON toggle_audit(created_at);

-- Cache indexes
CREATE INDEX idx_toggle_cache_key ON toggle_evaluation_cache(cache_key);
CREATE INDEX idx_toggle_cache_expires ON toggle_evaluation_cache(expires_at);

-- Dependency indexes
CREATE INDEX idx_toggle_dependency_parent ON toggle_dependency(parent_toggle_id);
CREATE INDEX idx_toggle_dependency_child ON toggle_dependency(child_toggle_id);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_toggle_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamps and versions
CREATE TRIGGER update_feature_toggle_timestamp
    BEFORE UPDATE ON feature_toggle
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

CREATE TRIGGER update_toggle_scope_timestamp
    BEFORE UPDATE ON toggle_scope
    FOR EACH ROW EXECUTE FUNCTION update_toggle_timestamp();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_toggle_audit()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO toggle_audit (toggle_id, action, after_value, actor_id)
        VALUES (NEW.id, 'created', row_to_json(NEW)::jsonb, NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if meaningful fields changed
        IF OLD.enabled != NEW.enabled OR OLD.value != NEW.value OR OLD.archived != NEW.archived THEN
            INSERT INTO toggle_audit (toggle_id, action, before_value, after_value, actor_id)
            VALUES (
                NEW.id,
                CASE 
                    WHEN OLD.enabled = false AND NEW.enabled = true THEN 'activated'
                    WHEN OLD.enabled = true AND NEW.enabled = false THEN 'deactivated'
                    WHEN OLD.archived = false AND NEW.archived = true THEN 'archived'
                    ELSE 'updated'
                END,
                row_to_json(OLD)::jsonb,
                row_to_json(NEW)::jsonb,
                NEW.updated_by
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-log audit events
CREATE TRIGGER toggle_audit_trigger
    AFTER INSERT OR UPDATE ON feature_toggle
    FOR EACH ROW EXECUTE FUNCTION log_toggle_audit();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_toggle_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM toggle_evaluation_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Sample data for development
INSERT INTO feature_toggle (key, name, description, type, value, claude_impact) VALUES
('claude_model_v2', 'Claude Model V2', 'Enable Claude Sonnet 4.0 model for text generation', 'boolean', '{"enabled": false}', 'MODEL_VERSION'),
('advanced_corrections', 'Advanced Corrections System', 'Enable ML-powered correction suggestions', 'percentage_rollout', '{"percentage": 10}', 'OUTPUT_QUALITY'),
('marketplace_ai_moderation', 'AI-Powered Marketplace Moderation', 'Enable Claude-based content moderation', 'boolean', '{"enabled": true}', 'HALLUCINATION_RISK'),
('experimental_features', 'Experimental Features', 'Enable beta features for testing', 'segmentation', '{"rules": [{"attribute": "user_type", "operator": "equals", "value": "beta_tester"}]}', 'NONE');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_toggle TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON toggle_scope TO app_user;
GRANT SELECT, INSERT ON toggle_audit TO app_user;
GRANT SELECT, DELETE ON toggle_evaluation_cache TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON toggle_dependency TO app_user;

GRANT USAGE ON SEQUENCE feature_toggle_id_seq TO app_user;
GRANT USAGE ON SEQUENCE toggle_scope_id_seq TO app_user;
GRANT USAGE ON SEQUENCE toggle_audit_id_seq TO app_user;