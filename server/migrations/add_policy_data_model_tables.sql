-- Migration: Add Policy Data Model Tables
-- Epic 17 - Policy Data Model
-- Task: E17-1753114397365-A62FA8

-- Main policies table for metadata
CREATE TABLE IF NOT EXISTS policies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'enforcement', 'content_moderation', 'compliance', 'security', 
        'operational', 'community', 'commerce', 'verification', 
        'privacy', 'accessibility'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'inactive', 'deprecated', 'archived'
    )),
    version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(100),
    subcategory VARCHAR(100)
);

-- Policy data table for complex JSON structures
CREATE TABLE IF NOT EXISTS policy_data (
    id SERIAL PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    scope_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    rules_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    configuration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    dependencies JSONB DEFAULT '{}'::jsonb,
    compliance JSONB DEFAULT '{}'::jsonb,
    testing JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(policy_id)
);

-- Policy versions for change tracking
CREATE TABLE IF NOT EXISTS policy_versions (
    version_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    change_summary TEXT,
    rollback_available BOOLEAN DEFAULT true,
    deployment_status VARCHAR(50) DEFAULT 'draft' CHECK (deployment_status IN (
        'draft', 'staged', 'deployed', 'rolled_back'
    )),
    policy_snapshot JSONB NOT NULL
);

-- Policy deployments tracking
CREATE TABLE IF NOT EXISTS policy_deployments (
    deployment_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version_id VARCHAR(255) NOT NULL REFERENCES policy_versions(version_id),
    environment VARCHAR(50) NOT NULL CHECK (environment IN (
        'development', 'staging', 'production'
    )),
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'failed', 'rolled_back'
    )),
    rollout_strategy JSONB NOT NULL DEFAULT '{}'::jsonb,
    health_checks JSONB DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Policy evaluation logs
CREATE TABLE IF NOT EXISTS policy_evaluations (
    evaluation_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    rule_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'user', 'template', 'transaction', 'system'
    )),
    entity_id VARCHAR(255) NOT NULL,
    context_data JSONB NOT NULL,
    result VARCHAR(50) NOT NULL CHECK (result IN (
        'pass', 'fail', 'partial', 'error'
    )),
    execution_time INTEGER NOT NULL, -- milliseconds
    memory_usage INTEGER, -- bytes
    conditions_met JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions_triggered JSONB NOT NULL DEFAULT '[]'::jsonb,
    debug_info JSONB,
    parent_evaluation_id VARCHAR(255)
);

-- Policy audit logs
CREATE TABLE IF NOT EXISTS policy_audit_logs (
    audit_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'created', 'updated', 'deleted', 'deployed', 'evaluated', 'action_taken'
    )),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('user', 'system', 'api')),
    actor_id VARCHAR(255) NOT NULL,
    actor_name VARCHAR(255),
    event_data JSONB NOT NULL,
    context_data JSONB DEFAULT '{}'::jsonb,
    result_data JSONB,
    error_message TEXT,
    entities_affected INTEGER DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'low' CHECK (risk_level IN (
        'low', 'medium', 'high', 'critical'
    )),
    reversible BOOLEAN DEFAULT true,
    regulations JSONB DEFAULT '[]'::jsonb,
    retention_required BOOLEAN DEFAULT false,
    classification VARCHAR(50) DEFAULT 'internal' CHECK (classification IN (
        'public', 'internal', 'confidential', 'restricted'
    ))
);

-- Policy templates for reusable patterns
CREATE TABLE IF NOT EXISTS policy_templates (
    template_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    version VARCHAR(50) NOT NULL,
    template_data JSONB NOT NULL,
    parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
    examples JSONB DEFAULT '[]'::jsonb,
    documentation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0
);

-- Policy metrics aggregation table
CREATE TABLE IF NOT EXISTS policy_metrics (
    id SERIAL PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour BETWEEN 0 AND 23),
    total_evaluations INTEGER DEFAULT 0,
    successful_evaluations INTEGER DEFAULT 0,
    failed_evaluations INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    successful_actions INTEGER DEFAULT 0,
    failed_actions INTEGER DEFAULT 0,
    avg_execution_time DECIMAL(10,2) DEFAULT 0,
    max_execution_time INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    throughput DECIMAL(10,2) DEFAULT 0,
    entities_affected INTEGER DEFAULT 0,
    violations_prevented INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(policy_id, metric_date, metric_hour)
);

-- Policy recommendations table
CREATE TABLE IF NOT EXISTS policy_recommendations (
    recommendation_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'optimization', 'security', 'compliance', 'performance', 'cost'
    )),
    priority VARCHAR(50) NOT NULL CHECK (priority IN (
        'low', 'medium', 'high', 'critical'
    )),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    suggested_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    implementation_effort VARCHAR(50) CHECK (implementation_effort IN (
        'low', 'medium', 'high'
    )),
    risk_assessment JSONB DEFAULT '{}'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
        'open', 'accepted', 'rejected', 'implemented', 'expired'
    )),
    implemented_at TIMESTAMP WITH TIME ZONE,
    implemented_by VARCHAR(255)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_policies_type_status ON policies(type, status);
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_effective_date ON policies(effective_date);
CREATE INDEX IF NOT EXISTS idx_policies_tags ON policies USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_policy_data_policy_id ON policy_data(policy_id);

CREATE INDEX IF NOT EXISTS idx_policy_versions_policy_id ON policy_versions(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_versions_created_at ON policy_versions(created_at);

CREATE INDEX IF NOT EXISTS idx_policy_deployments_policy_id ON policy_deployments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_deployments_environment ON policy_deployments(environment);
CREATE INDEX IF NOT EXISTS idx_policy_deployments_status ON policy_deployments(status);

CREATE INDEX IF NOT EXISTS idx_policy_evaluations_policy_id ON policy_evaluations(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_evaluations_timestamp ON policy_evaluations(timestamp);
CREATE INDEX IF NOT EXISTS idx_policy_evaluations_entity ON policy_evaluations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_policy_evaluations_result ON policy_evaluations(result);

CREATE INDEX IF NOT EXISTS idx_policy_audit_logs_policy_id ON policy_audit_logs(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_audit_logs_timestamp ON policy_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_policy_audit_logs_event_type ON policy_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_policy_audit_logs_actor ON policy_audit_logs(actor_type, actor_id);

CREATE INDEX IF NOT EXISTS idx_policy_templates_category ON policy_templates(category);
CREATE INDEX IF NOT EXISTS idx_policy_templates_type ON policy_templates(type);
CREATE INDEX IF NOT EXISTS idx_policy_templates_public ON policy_templates(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_policy_metrics_policy_date ON policy_metrics(policy_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_policy_metrics_date ON policy_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_policy_recommendations_policy_id ON policy_recommendations(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_recommendations_type_priority ON policy_recommendations(type, priority);
CREATE INDEX IF NOT EXISTS idx_policy_recommendations_status ON policy_recommendations(status);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_policy_data_updated_at BEFORE UPDATE ON policy_data FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_policy_templates_updated_at BEFORE UPDATE ON policy_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger to create policy version on policy update
CREATE OR REPLACE FUNCTION create_policy_version()
RETURNS TRIGGER AS $$
DECLARE
    version_num TEXT;
    current_version RECORD;
BEGIN
    -- Get current version number and increment
    SELECT version INTO current_version FROM policies WHERE id = NEW.id;
    
    -- Simple version increment (1.0.0 -> 1.0.1)
    version_num := SPLIT_PART(COALESCE(current_version.version, '1.0.0'), '.', 1) || '.' ||
                   SPLIT_PART(COALESCE(current_version.version, '1.0.0'), '.', 2) || '.' ||
                   (COALESCE(SPLIT_PART(current_version.version, '.', 3)::INTEGER, 0) + 1)::TEXT;
    
    -- Create version record
    INSERT INTO policy_versions (
        version_id, policy_id, version_number, created_by, change_summary, policy_snapshot
    ) VALUES (
        'v-' || NEW.id || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        NEW.id,
        version_num,
        COALESCE(NEW.updated_by, NEW.created_by),
        'Automated version created on policy update',
        jsonb_build_object(
            'metadata', row_to_json(NEW),
            'policy_data', (SELECT row_to_json(pd) FROM policy_data pd WHERE pd.policy_id = NEW.id)
        )
    );
    
    -- Update policy version
    NEW.version := version_num;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_policy_version_trigger 
    BEFORE UPDATE ON policies 
    FOR EACH ROW 
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE PROCEDURE create_policy_version();

-- Views for common queries
CREATE OR REPLACE VIEW active_policies AS
SELECT p.*, pd.scope_data, pd.rules_data, pd.configuration_data
FROM policies p
JOIN policy_data pd ON p.id = pd.policy_id
WHERE p.status = 'active' 
  AND p.effective_date <= NOW()
  AND (p.expiration_date IS NULL OR p.expiration_date > NOW());

CREATE OR REPLACE VIEW policy_evaluation_summary AS
SELECT 
    policy_id,
    DATE(timestamp) as evaluation_date,
    COUNT(*) as total_evaluations,
    COUNT(*) FILTER (WHERE result = 'pass') as successful_evaluations,
    COUNT(*) FILTER (WHERE result = 'fail') as failed_evaluations,
    COUNT(*) FILTER (WHERE result = 'error') as error_evaluations,
    AVG(execution_time) as avg_execution_time,
    MAX(execution_time) as max_execution_time,
    COUNT(DISTINCT entity_id) as unique_entities_evaluated
FROM policy_evaluations
GROUP BY policy_id, DATE(timestamp);

-- Insert sample policy templates
INSERT INTO policy_templates (template_id, name, description, category, type, version, template_data, parameters, created_by, is_public) VALUES
('tmpl-enforcement-basic', 'Basic Enforcement Policy', 'Simple trust score based enforcement policy', 'enforcement', 'enforcement', '1.0.0',
 '{
   "rules": [
     {
       "id": "trust-threshold",
       "name": "Trust Score Threshold",
       "conditions": [
         {
           "field": "entity_data.trust_score",
           "operator": "lt",
           "value": "{{trust_threshold}}"
         }
       ],
       "actions": [
         {
           "type": "{{action_type}}",
           "severity": "{{severity}}"
         }
       ]
     }
   ]
 }'::jsonb,
 '[
   {"name": "trust_threshold", "type": "number", "required": true, "default_value": 60},
   {"name": "action_type", "type": "string", "required": true, "default_value": "restrict"},
   {"name": "severity", "type": "string", "required": true, "default_value": "medium"}
 ]'::jsonb,
 'system', true),

('tmpl-content-moderation', 'Content Moderation Policy', 'Template for content quality and safety policies', 'content', 'content_moderation', '1.0.0',
 '{
   "rules": [
     {
       "id": "content-quality",
       "name": "Content Quality Check",
       "conditions": [
         {
           "field": "entity_data.quality_score",
           "operator": "lt",
           "value": "{{quality_threshold}}"
         }
       ],
       "actions": [
         {
           "type": "flag",
           "severity": "medium"
         }
       ]
     }
   ]
 }'::jsonb,
 '[
   {"name": "quality_threshold", "type": "number", "required": true, "default_value": 70}
 ]'::jsonb,
 'system', true);

-- Comments for documentation
COMMENT ON TABLE policies IS 'Main policy definitions with metadata and versioning';
COMMENT ON TABLE policy_data IS 'Complex policy data stored as JSON (rules, scope, configuration)';
COMMENT ON TABLE policy_versions IS 'Version history and change tracking for policies';
COMMENT ON TABLE policy_deployments IS 'Deployment tracking across environments';
COMMENT ON TABLE policy_evaluations IS 'Log of all policy evaluations and results';
COMMENT ON TABLE policy_audit_logs IS 'Comprehensive audit trail for policy operations';
COMMENT ON TABLE policy_templates IS 'Reusable policy templates with parameterization';
COMMENT ON TABLE policy_metrics IS 'Aggregated metrics for policy performance analysis';
COMMENT ON TABLE policy_recommendations IS 'AI-generated recommendations for policy improvements';

COMMENT ON VIEW active_policies IS 'Currently active policies with full data';
COMMENT ON VIEW policy_evaluation_summary IS 'Daily summary statistics for policy evaluations';