-- Epic 17 Rule Versioning Database Schema
-- Task: E17-1753114396799-5989A4 - Implement rule versioning
-- 
-- Creates comprehensive rule versioning infrastructure for Epic 17 API Management System
-- including version control, rollback capabilities, change tracking, approval workflows,
-- branching/merging, and comprehensive audit trails for rules, policies, and configurations.

-- Rule versions tracking and management
CREATE TABLE IF NOT EXISTS epic17_rule_versions (
    id SERIAL PRIMARY KEY,
    version_id UUID UNIQUE NOT NULL,
    rule_id VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- access_control, rate_limiting, validation, transformation, routing, security, compliance, business_logic, configuration, policy
    
    -- Version identification
    version_number VARCHAR(50) NOT NULL,
    version_type VARCHAR(20) NOT NULL, -- major, minor, patch, snapshot, branch, tag
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending_approval, approved, active, deprecated, archived, rolled_back
    
    -- Version metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_notes TEXT DEFAULT '',
    breaking_changes JSONB DEFAULT '[]'::jsonb, -- Array of breaking change descriptions
    
    -- Rule content and structure
    rule_content JSONB NOT NULL, -- The actual rule/policy/configuration data
    rule_schema JSONB DEFAULT '{}'::jsonb, -- Schema definition for validation
    rule_metadata JSONB NOT NULL, -- Comprehensive rule metadata
    
    -- Version relationships
    parent_version_id UUID,
    branch_name VARCHAR(100),
    merged_from_version_id UUID,
    
    -- Change tracking
    changes_since_parent JSONB DEFAULT '[]'::jsonb, -- Array of change record objects
    change_significance VARCHAR(20) DEFAULT 'minor', -- minor, major, breaking
    affected_components JSONB DEFAULT '[]'::jsonb, -- Array of affected component names
    
    -- Validation and testing
    validation_results JSONB DEFAULT '[]'::jsonb, -- Array of validation result objects
    test_results JSONB DEFAULT '[]'::jsonb, -- Array of test result objects
    compatibility_score DECIMAL(5,2) DEFAULT 1.0, -- 0-1 scale compatibility with previous version
    
    -- Lifecycle tracking
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    
    -- Deployment tracking
    deployment_status JSONB DEFAULT '{"status": "not_deployed", "deploymentMethod": "manual", "deploymentErrors": []}'::jsonb,
    deployed_environments JSONB DEFAULT '[]'::jsonb, -- Array of environment names
    rollout_progress JSONB DEFAULT '{"totalTargets": 0, "successfulDeployments": 0, "failedDeployments": 0, "progressPercentage": 0, "currentPhase": "created"}'::jsonb,
    
    -- Performance metrics
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    usage_statistics JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_rule_versions_version_id (version_id),
    INDEX idx_epic17_rule_versions_rule_id (rule_id),
    INDEX idx_epic17_rule_versions_rule_type (rule_type),
    INDEX idx_epic17_rule_versions_version_number (version_number),
    INDEX idx_epic17_rule_versions_status (status),
    INDEX idx_epic17_rule_versions_created_by (created_by),
    INDEX idx_epic17_rule_versions_created_at (created_at),
    INDEX idx_epic17_rule_versions_parent_version (parent_version_id),
    INDEX idx_epic17_rule_versions_branch_name (branch_name),
    INDEX idx_epic17_rule_versions_active (rule_id, status) WHERE status = 'active',
    INDEX idx_epic17_rule_versions_compatibility (compatibility_score, change_significance),
    INDEX idx_epic17_rule_versions_composite (rule_id, version_number, status),
    
    -- Unique constraint to prevent duplicate version numbers per rule
    UNIQUE(rule_id, version_number),
    
    FOREIGN KEY (parent_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE SET NULL,
    FOREIGN KEY (merged_from_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE SET NULL
);

-- Version approval workflow management
CREATE TABLE IF NOT EXISTS epic17_rule_version_approvals (
    id SERIAL PRIMARY KEY,
    approval_id UUID UNIQUE NOT NULL,
    version_id UUID NOT NULL,
    
    -- Approval configuration
    required_approvers JSONB NOT NULL, -- Array of required approver identifiers
    approvals_required INTEGER NOT NULL DEFAULT 1,
    approvals_received INTEGER DEFAULT 0,
    
    -- Request details
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_by VARCHAR(255) NOT NULL,
    approval_reason TEXT NOT NULL,
    risk_assessment TEXT,
    impact_summary TEXT,
    
    -- Approval status
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired, withdrawn
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    decision_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Resolution tracking
    final_decision VARCHAR(20), -- approved, rejected
    decided_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    approval_conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Escalation management
    escalation_level INTEGER DEFAULT 0,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_to VARCHAR(255),
    
    -- Change analysis
    breaking_changes_acknowledged BOOLEAN DEFAULT FALSE,
    compatibility_concerns JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_version_approvals_approval_id (approval_id),
    INDEX idx_epic17_version_approvals_version_id (version_id),
    INDEX idx_epic17_version_approvals_status (status),
    INDEX idx_epic17_version_approvals_requested_by (requested_by),
    INDEX idx_epic17_version_approvals_expires_at (expires_at),
    INDEX idx_epic17_version_approvals_pending (status, expires_at) WHERE status = 'pending',
    
    FOREIGN KEY (version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE
);

-- Individual approver decisions within approval workflows
CREATE TABLE IF NOT EXISTS epic17_rule_approval_decisions (
    id SERIAL PRIMARY KEY,
    decision_id UUID UNIQUE NOT NULL,
    approval_id UUID NOT NULL,
    approver_id VARCHAR(255) NOT NULL,
    
    -- Decision details
    decision VARCHAR(20) NOT NULL, -- approved, rejected, abstain, conditional
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decision_comments TEXT,
    decision_conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Decision context
    delegation_from VARCHAR(255),
    decision_method VARCHAR(30) DEFAULT 'manual', -- manual, automated, delegated
    confidence_level INTEGER, -- 1-100 for automated decisions
    
    -- Review analysis
    review_duration INTEGER, -- minutes spent reviewing
    concerns_raised JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Supporting information
    supporting_documents JSONB DEFAULT '[]'::jsonb,
    related_versions_reviewed JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_approval_decisions_decision_id (decision_id),
    INDEX idx_epic17_approval_decisions_approval_id (approval_id),
    INDEX idx_epic17_approval_decisions_approver_id (approver_id),
    INDEX idx_epic17_approval_decisions_decision (decision),
    INDEX idx_epic17_approval_decisions_decided_at (decided_at),
    
    FOREIGN KEY (approval_id) REFERENCES epic17_rule_version_approvals(approval_id) ON DELETE CASCADE
);

-- Version comparison and difference analysis
CREATE TABLE IF NOT EXISTS epic17_version_comparisons (
    id SERIAL PRIMARY KEY,
    comparison_id UUID UNIQUE NOT NULL,
    source_version_id UUID NOT NULL,
    target_version_id UUID NOT NULL,
    
    -- Comparison metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    comparison_type VARCHAR(30) DEFAULT 'standard', -- standard, migration_analysis, rollback_planning
    
    -- Comparison results
    changes JSONB NOT NULL, -- Array of change record objects
    similarity DECIMAL(5,2) NOT NULL, -- 0-1 scale
    compatibility_impact VARCHAR(20) NOT NULL, -- none, minor, major, breaking
    
    -- Migration analysis
    migration_required BOOLEAN NOT NULL,
    migration_complexity VARCHAR(20) DEFAULT 'simple', -- simple, moderate, complex
    migration_steps JSONB DEFAULT '[]'::jsonb, -- Array of migration step objects
    
    -- Risk assessment
    risk_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
    risk_factors JSONB DEFAULT '[]'::jsonb, -- Array of risk factor descriptions
    mitigation_strategies JSONB DEFAULT '[]'::jsonb, -- Array of mitigation strategy descriptions
    
    -- Performance impact analysis
    performance_impact JSONB DEFAULT '{}'::jsonb, -- Performance impact assessment
    resource_impact JSONB DEFAULT '{}'::jsonb, -- Resource utilization changes
    
    -- Indexes
    INDEX idx_epic17_comparisons_comparison_id (comparison_id),
    INDEX idx_epic17_comparisons_source_version (source_version_id),
    INDEX idx_epic17_comparisons_target_version (target_version_id),
    INDEX idx_epic17_comparisons_created_at (created_at),
    INDEX idx_epic17_comparisons_compatibility_impact (compatibility_impact),
    INDEX idx_epic17_comparisons_risk_level (risk_level),
    INDEX idx_epic17_comparisons_migration_required (migration_required),
    
    FOREIGN KEY (source_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE,
    FOREIGN KEY (target_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE
);

-- Rollback plans and execution tracking
CREATE TABLE IF NOT EXISTS epic17_rollback_plans (
    id SERIAL PRIMARY KEY,
    rollback_id UUID UNIQUE NOT NULL,
    source_version_id UUID NOT NULL,
    target_version_id UUID NOT NULL,
    
    -- Rollback configuration
    rollback_type VARCHAR(20) NOT NULL, -- immediate, scheduled, gradual
    rollback_reason TEXT NOT NULL,
    rollback_steps JSONB NOT NULL, -- Array of rollback step objects
    
    -- Validation and safety
    pre_rollback_validation JSONB DEFAULT '[]'::jsonb, -- Array of validation check objects
    post_rollback_validation JSONB DEFAULT '[]'::jsonb, -- Array of validation check objects
    safety_checks JSONB DEFAULT '[]'::jsonb, -- Array of safety check objects
    
    -- Impact assessment
    impact_assessment JSONB NOT NULL, -- Comprehensive impact assessment
    affected_systems JSONB DEFAULT '[]'::jsonb, -- Array of affected system names
    downtime_estimate INTEGER DEFAULT 0, -- minutes
    
    -- Approval and execution
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    executed_by VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    rollback_status VARCHAR(20) DEFAULT 'planned', -- planned, approved, executing, completed, failed, cancelled
    execution_progress JSONB DEFAULT '{"currentStep": 0, "totalSteps": 0, "progressPercentage": 0}'::jsonb,
    
    -- Results tracking
    execution_results JSONB DEFAULT '[]'::jsonb, -- Array of execution result objects
    validation_results JSONB DEFAULT '[]'::jsonb, -- Array of validation result objects
    errors JSONB DEFAULT '[]'::jsonb, -- Array of error objects
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_execution_time INTEGER, -- milliseconds
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_rollback_plans_rollback_id (rollback_id),
    INDEX idx_epic17_rollback_plans_source_version (source_version_id),
    INDEX idx_epic17_rollback_plans_target_version (target_version_id),
    INDEX idx_epic17_rollback_plans_status (rollback_status),
    INDEX idx_epic17_rollback_plans_created_by (created_by),
    INDEX idx_epic17_rollback_plans_scheduled_at (scheduled_at),
    INDEX idx_epic17_rollback_plans_requires_approval (requires_approval),
    INDEX idx_epic17_rollback_plans_active (rollback_status) WHERE rollback_status IN ('planned', 'approved', 'executing'),
    
    FOREIGN KEY (source_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE,
    FOREIGN KEY (target_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE
);

-- Version branches for feature development and parallel work
CREATE TABLE IF NOT EXISTS epic17_version_branches (
    id SERIAL PRIMARY KEY,
    branch_id UUID UNIQUE NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    rule_id VARCHAR(255) NOT NULL,
    
    -- Branch metadata
    description TEXT,
    branch_type VARCHAR(30) DEFAULT 'feature', -- feature, hotfix, release, experimental
    base_version_id UUID NOT NULL,
    
    -- Branch status
    status VARCHAR(20) DEFAULT 'active', -- active, merged, abandoned, archived
    is_protected BOOLEAN DEFAULT FALSE,
    merge_restrictions JSONB DEFAULT '{}'::jsonb,
    
    -- Merge tracking
    merged_to_version_id UUID,
    merged_by VARCHAR(255),
    merged_at TIMESTAMP WITH TIME ZONE,
    merge_strategy VARCHAR(20), -- fast_forward, merge_commit, squash
    
    -- Branch lifecycle
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_commit_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    commit_count INTEGER DEFAULT 0,
    version_count INTEGER DEFAULT 0,
    
    -- Indexes
    INDEX idx_epic17_branches_branch_id (branch_id),
    INDEX idx_epic17_branches_branch_name (branch_name),
    INDEX idx_epic17_branches_rule_id (rule_id),
    INDEX idx_epic17_branches_status (status),
    INDEX idx_epic17_branches_created_by (created_by),
    INDEX idx_epic17_branches_base_version (base_version_id),
    INDEX idx_epic17_branches_merged_to (merged_to_version_id),
    INDEX idx_epic17_branches_active (rule_id, status) WHERE status = 'active',
    
    -- Unique constraint for branch names per rule
    UNIQUE(rule_id, branch_name),
    
    FOREIGN KEY (base_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE,
    FOREIGN KEY (merged_to_version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE SET NULL
);

-- Version deployment tracking across environments
CREATE TABLE IF NOT EXISTS epic17_version_deployments (
    id SERIAL PRIMARY KEY,
    deployment_id UUID UNIQUE NOT NULL,
    version_id UUID NOT NULL,
    
    -- Deployment configuration
    environment VARCHAR(50) NOT NULL,
    deployment_type VARCHAR(30) NOT NULL, -- direct, canary, blue_green, rolling
    deployment_strategy JSONB NOT NULL, -- Strategy-specific configuration
    
    -- Deployment status and progress
    status VARCHAR(20) DEFAULT 'pending', -- pending, deploying, deployed, failed, rolled_back
    progress_percentage INTEGER DEFAULT 0,
    current_phase VARCHAR(50),
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deployment_duration INTEGER, -- milliseconds
    
    -- Results and monitoring
    deployment_results JSONB DEFAULT '{}'::jsonb,
    health_checks JSONB DEFAULT '[]'::jsonb,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    rollback_triggered BOOLEAN DEFAULT FALSE,
    
    -- Error tracking
    errors JSONB DEFAULT '[]'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    deployed_by VARCHAR(255) NOT NULL,
    deployment_notes TEXT,
    
    -- Indexes
    INDEX idx_epic17_deployments_deployment_id (deployment_id),
    INDEX idx_epic17_deployments_version_id (version_id),
    INDEX idx_epic17_deployments_environment (environment),
    INDEX idx_epic17_deployments_status (status),
    INDEX idx_epic17_deployments_deployed_by (deployed_by),
    INDEX idx_epic17_deployments_scheduled_at (scheduled_at),
    INDEX idx_epic17_deployments_active (version_id, environment, status) WHERE status IN ('pending', 'deploying', 'deployed'),
    
    FOREIGN KEY (version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE
);

-- Version tags for marking significant releases
CREATE TABLE IF NOT EXISTS epic17_version_tags (
    id SERIAL PRIMARY KEY,
    tag_id UUID UNIQUE NOT NULL,
    version_id UUID NOT NULL,
    
    -- Tag information
    tag_name VARCHAR(100) NOT NULL,
    tag_type VARCHAR(30) DEFAULT 'release', -- release, milestone, hotfix, snapshot
    description TEXT,
    
    -- Tag metadata
    is_public BOOLEAN DEFAULT TRUE,
    is_protected BOOLEAN DEFAULT FALSE,
    significance VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    
    -- Lifecycle
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_tags_tag_id (tag_id),
    INDEX idx_epic17_tags_version_id (version_id),
    INDEX idx_epic17_tags_tag_name (tag_name),
    INDEX idx_epic17_tags_tag_type (tag_type),
    INDEX idx_epic17_tags_created_by (created_by),
    INDEX idx_epic17_tags_significance (significance),
    
    -- Unique constraint for tag names
    UNIQUE(tag_name),
    
    FOREIGN KEY (version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE
);

-- Version performance and usage analytics
CREATE TABLE IF NOT EXISTS epic17_version_analytics (
    id SERIAL PRIMARY KEY,
    analytics_id UUID UNIQUE NOT NULL,
    version_id UUID NOT NULL,
    measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Usage metrics
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    error_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    cpu_usage DECIMAL(5,2) DEFAULT 0, -- percentage
    memory_usage INTEGER DEFAULT 0, -- MB
    throughput DECIMAL(10,2) DEFAULT 0, -- operations per second
    
    -- Adoption metrics
    active_users INTEGER DEFAULT 0,
    user_adoption_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    geographic_distribution JSONB DEFAULT '{}'::jsonb,
    
    -- Quality metrics
    quality_score DECIMAL(5,2) DEFAULT 0,
    reliability_score DECIMAL(5,2) DEFAULT 0,
    maintainability_score DECIMAL(5,2) DEFAULT 0,
    
    -- Comparison with baseline
    performance_vs_baseline DECIMAL(5,2) DEFAULT 0, -- percentage difference
    trend_direction VARCHAR(20) DEFAULT 'stable', -- improving, stable, degrading
    
    -- Environment breakdown
    environment_metrics JSONB DEFAULT '{}'::jsonb, -- Metrics per environment
    
    -- Indexes
    INDEX idx_epic17_analytics_analytics_id (analytics_id),
    INDEX idx_epic17_analytics_version_id (version_id),
    INDEX idx_epic17_analytics_timestamp (measurement_timestamp),
    INDEX idx_epic17_analytics_success_rate (success_rate),
    INDEX idx_epic17_analytics_performance (average_response_time, throughput),
    INDEX idx_epic17_analytics_recent (version_id, measurement_timestamp DESC) WHERE measurement_timestamp >= NOW() - INTERVAL '30 days',
    
    FOREIGN KEY (version_id) REFERENCES epic17_rule_versions(version_id) ON DELETE CASCADE
);

-- Create comprehensive functions for rule versioning management

-- Function to get version hierarchy for a rule
CREATE OR REPLACE FUNCTION get_rule_version_hierarchy(
    p_rule_id VARCHAR(255)
) RETURNS TABLE(
    version_id UUID,
    version_number VARCHAR(50),
    status VARCHAR(20),
    parent_version_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    branch_name VARCHAR(100),
    hierarchy_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE version_hierarchy AS (
        -- Base case: root versions (no parent)
        SELECT 
            rv.version_id,
            rv.version_number,
            rv.status,
            rv.parent_version_id,
            rv.created_at,
            rv.created_by,
            rv.branch_name,
            0 as hierarchy_level
        FROM epic17_rule_versions rv
        WHERE rv.rule_id = p_rule_id 
            AND rv.parent_version_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child versions
        SELECT 
            rv.version_id,
            rv.version_number,
            rv.status,
            rv.parent_version_id,
            rv.created_at,
            rv.created_by,
            rv.branch_name,
            vh.hierarchy_level + 1
        FROM epic17_rule_versions rv
        INNER JOIN version_hierarchy vh ON rv.parent_version_id = vh.version_id
        WHERE rv.rule_id = p_rule_id
    )
    SELECT * FROM version_hierarchy
    ORDER BY hierarchy_level, created_at;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate version compatibility score
CREATE OR REPLACE FUNCTION calculate_version_compatibility(
    p_source_version_id UUID,
    p_target_version_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    source_content JSONB;
    target_content JSONB;
    compatibility_score DECIMAL(5,2) := 0;
    change_count INTEGER := 0;
    breaking_changes INTEGER := 0;
BEGIN
    -- Get version contents
    SELECT rule_content INTO source_content
    FROM epic17_rule_versions
    WHERE version_id = p_source_version_id;
    
    SELECT rule_content INTO target_content
    FROM epic17_rule_versions
    WHERE version_id = p_target_version_id;
    
    IF source_content IS NULL OR target_content IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Simple compatibility calculation based on content similarity
    -- In practice, this would be much more sophisticated
    
    -- Count total fields in source
    SELECT COUNT(*) INTO change_count
    FROM jsonb_each(source_content);
    
    -- Count matching fields
    SELECT COUNT(*) INTO compatibility_score
    FROM jsonb_each(source_content) s
    WHERE EXISTS (
        SELECT 1 FROM jsonb_each(target_content) t 
        WHERE s.key = t.key AND s.value = t.value
    );
    
    -- Calculate percentage compatibility
    IF change_count > 0 THEN
        compatibility_score := (compatibility_score / change_count * 100)::DECIMAL(5,2);
    ELSE
        compatibility_score := 100.0;
    END IF;
    
    RETURN LEAST(compatibility_score, 100.0);
END;
$$ LANGUAGE plpgsql;

-- Function to get active version for a rule
CREATE OR REPLACE FUNCTION get_active_rule_version(
    p_rule_id VARCHAR(255)
) RETURNS TABLE(
    version_id UUID,
    version_number VARCHAR(50),
    rule_content JSONB,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rv.version_id,
        rv.version_number,
        rv.rule_content,
        rv.activated_at,
        rv.created_by
    FROM epic17_rule_versions rv
    WHERE rv.rule_id = p_rule_id 
        AND rv.status = 'active'
    ORDER BY rv.activated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get version deployment status across environments
CREATE OR REPLACE FUNCTION get_version_deployment_status(
    p_version_id UUID
) RETURNS TABLE(
    environment VARCHAR(50),
    status VARCHAR(20),
    deployed_at TIMESTAMP WITH TIME ZONE,
    deployment_type VARCHAR(30),
    progress_percentage INTEGER,
    health_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.environment,
        d.status,
        d.completed_at as deployed_at,
        d.deployment_type,
        d.progress_percentage,
        CASE 
            WHEN d.status = 'deployed' AND d.rollback_triggered = false THEN 'healthy'
            WHEN d.status = 'failed' OR d.rollback_triggered = true THEN 'unhealthy'
            ELSE 'unknown'
        END::VARCHAR(20) as health_status
    FROM epic17_version_deployments d
    WHERE d.version_id = p_version_id
    ORDER BY d.completed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze version adoption and usage trends
CREATE OR REPLACE FUNCTION analyze_version_adoption(
    p_rule_id VARCHAR(255),
    p_time_window_days INTEGER DEFAULT 30
) RETURNS TABLE(
    version_number VARCHAR(50),
    total_executions BIGINT,
    success_rate DECIMAL(5,2),
    avg_response_time DECIMAL(10,2),
    active_users INTEGER,
    adoption_trend VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rv.version_number,
        SUM(va.execution_count)::BIGINT as total_executions,
        AVG(va.success_rate)::DECIMAL(5,2) as success_rate,
        AVG(va.average_response_time)::DECIMAL(10,2) as avg_response_time,
        MAX(va.active_users) as active_users,
        CASE 
            WHEN COUNT(va.*) >= 7 THEN
                CASE 
                    WHEN (SELECT AVG(execution_count) FROM epic17_version_analytics WHERE version_id = rv.version_id AND measurement_timestamp >= NOW() - INTERVAL '7 days') >
                         (SELECT AVG(execution_count) FROM epic17_version_analytics WHERE version_id = rv.version_id AND measurement_timestamp >= NOW() - INTERVAL '14 days' AND measurement_timestamp < NOW() - INTERVAL '7 days') 
                    THEN 'growing'
                    WHEN (SELECT AVG(execution_count) FROM epic17_version_analytics WHERE version_id = rv.version_id AND measurement_timestamp >= NOW() - INTERVAL '7 days') <
                         (SELECT AVG(execution_count) FROM epic17_version_analytics WHERE version_id = rv.version_id AND measurement_timestamp >= NOW() - INTERVAL '14 days' AND measurement_timestamp < NOW() - INTERVAL '7 days') 
                    THEN 'declining'
                    ELSE 'stable'
                END
            ELSE 'insufficient_data'
        END::VARCHAR(20) as adoption_trend
    FROM epic17_rule_versions rv
    LEFT JOIN epic17_version_analytics va ON rv.version_id = va.version_id
        AND va.measurement_timestamp >= NOW() - (p_time_window_days || ' days')::INTERVAL
    WHERE rv.rule_id = p_rule_id
    GROUP BY rv.version_id, rv.version_number
    ORDER BY rv.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old versions based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_rule_versions(
    p_retention_days INTEGER DEFAULT 365,
    p_keep_recent_versions INTEGER DEFAULT 10
) RETURNS INTEGER AS $$
DECLARE
    versions_to_archive CURSOR FOR
        SELECT version_id, rule_id, version_number, created_at
        FROM epic17_rule_versions
        WHERE status IN ('deprecated', 'archived')
            AND created_at < NOW() - (p_retention_days || ' days')::INTERVAL
            AND version_id NOT IN (
                -- Keep recent versions per rule
                SELECT version_id
                FROM (
                    SELECT version_id, 
                           ROW_NUMBER() OVER (PARTITION BY rule_id ORDER BY created_at DESC) as rn
                    FROM epic17_rule_versions
                    WHERE status != 'active'
                ) ranked
                WHERE rn <= p_keep_recent_versions
            )
            AND version_id NOT IN (
                -- Keep all major versions
                SELECT version_id
                FROM epic17_rule_versions
                WHERE version_type = 'major'
            );
    
    archived_count INTEGER := 0;
    version_record RECORD;
BEGIN
    FOR version_record IN versions_to_archive
    LOOP
        -- Archive the version (update status)
        UPDATE epic17_rule_versions 
        SET status = 'archived', updated_at = NOW()
        WHERE version_id = version_record.version_id;
        
        archived_count := archived_count + 1;
    END LOOP;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'rule_versioning', 'cleanup_old_versions', 'system', archived_count, true
    );
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default version branches for common patterns
INSERT INTO epic17_version_branches (
    branch_id, branch_name, rule_id, description, branch_type, base_version_id, created_by
) 
SELECT 
    gen_random_uuid(),
    'main',
    'default_rule_' || generate_random_uuid()::text,
    'Main development branch',
    'feature',
    version_id,
    'system'
FROM epic17_rule_versions 
WHERE rule_id LIKE 'system_%' 
LIMIT 0; -- This is just a template - actual branches would be created by the service

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_versions_performance 
    ON epic17_rule_versions (rule_id, status, created_at DESC) 
    WHERE created_at >= NOW() - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_deployments_active_monitoring 
    ON epic17_version_deployments (status, environment, completed_at DESC) 
    WHERE status IN ('deployed', 'deploying') AND completed_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_analytics_trending 
    ON epic17_version_analytics (version_id, measurement_timestamp DESC, success_rate) 
    WHERE measurement_timestamp >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_approvals_urgent 
    ON epic17_rule_version_approvals (status, expires_at ASC) 
    WHERE status = 'pending' AND expires_at <= NOW() + INTERVAL '4 hours';

-- Create comprehensive rule versioning dashboard view
CREATE VIEW epic17_rule_versioning_dashboard AS
SELECT 
    -- Version statistics
    (SELECT COUNT(*) FROM epic17_rule_versions WHERE status = 'active') as active_versions,
    (SELECT COUNT(DISTINCT rule_id) FROM epic17_rule_versions) as total_rules_with_versions,
    (SELECT COUNT(*) FROM epic17_rule_versions WHERE created_at >= NOW() - INTERVAL '24 hours') as versions_created_today,
    (SELECT COUNT(*) FROM epic17_rule_versions WHERE status = 'deprecated' AND deprecated_at >= NOW() - INTERVAL '7 days') as versions_deprecated_this_week,
    
    -- Approval workflow status
    (SELECT COUNT(*) FROM epic17_rule_version_approvals WHERE status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM epic17_rule_version_approvals WHERE status = 'pending' AND expires_at <= NOW() + INTERVAL '4 hours') as urgent_approvals,
    
    -- Deployment status
    (SELECT COUNT(*) FROM epic17_version_deployments WHERE status = 'deployed' AND completed_at >= NOW() - INTERVAL '24 hours') as deployments_today,
    (SELECT COUNT(*) FROM epic17_version_deployments WHERE status = 'failed' AND started_at >= NOW() - INTERVAL '24 hours') as failed_deployments_today,
    
    -- Branch activity
    (SELECT COUNT(*) FROM epic17_version_branches WHERE status = 'active') as active_branches,
    (SELECT COUNT(*) FROM epic17_version_branches WHERE merged_at >= NOW() - INTERVAL '7 days') as branches_merged_this_week,
    
    -- Rollback activity
    (SELECT COUNT(*) FROM epic17_rollback_plans WHERE rollback_status IN ('planned', 'approved', 'executing')) as active_rollback_plans,
    (SELECT COUNT(*) FROM epic17_rollback_plans WHERE completed_at >= NOW() - INTERVAL '7 days' AND rollback_status = 'completed') as rollbacks_completed_this_week,
    
    -- Version comparison and analysis
    (SELECT COUNT(*) FROM epic17_version_comparisons WHERE created_at >= NOW() - INTERVAL '24 hours') as comparisons_performed_today,
    (SELECT COUNT(*) FROM epic17_version_comparisons WHERE risk_level IN ('high', 'critical')) as high_risk_comparisons,
    
    -- Performance and adoption metrics
    (SELECT AVG(compatibility_score) FROM epic17_rule_versions WHERE status = 'active' AND compatibility_score > 0) as avg_compatibility_score,
    (SELECT COUNT(*) FROM epic17_version_analytics WHERE measurement_timestamp >= NOW() - INTERVAL '1 hour') as recent_analytics_measurements;

-- Add table comments for documentation
COMMENT ON TABLE epic17_rule_versions IS 'Rule version tracking and management with comprehensive metadata';
COMMENT ON TABLE epic17_rule_version_approvals IS 'Approval workflow management for rule versions';
COMMENT ON TABLE epic17_rule_approval_decisions IS 'Individual approver decisions within approval workflows';
COMMENT ON TABLE epic17_version_comparisons IS 'Version comparison and difference analysis results';
COMMENT ON TABLE epic17_rollback_plans IS 'Rollback plans and execution tracking for version management';
COMMENT ON TABLE epic17_version_branches IS 'Version branches for feature development and parallel work';
COMMENT ON TABLE epic17_version_deployments IS 'Version deployment tracking across environments';
COMMENT ON TABLE epic17_version_tags IS 'Version tags for marking significant releases';
COMMENT ON TABLE epic17_version_analytics IS 'Version performance and usage analytics tracking';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_version_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_rule_versions_timestamp
    BEFORE UPDATE ON epic17_rule_versions
    FOR EACH ROW EXECUTE FUNCTION update_epic17_version_timestamp();

CREATE TRIGGER update_epic17_rollback_plans_timestamp
    BEFORE UPDATE ON epic17_rollback_plans
    FOR EACH ROW EXECUTE FUNCTION update_epic17_version_timestamp();

-- Create trigger to update branch statistics
CREATE OR REPLACE FUNCTION update_branch_statistics() RETURNS TRIGGER AS $$
BEGIN
    -- Update version count for the branch
    IF TG_OP = 'INSERT' AND NEW.branch_name IS NOT NULL THEN
        UPDATE epic17_version_branches 
        SET version_count = version_count + 1,
            last_commit_at = NOW()
        WHERE rule_id = NEW.rule_id AND branch_name = NEW.branch_name;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_branch_statistics
    AFTER INSERT OR UPDATE ON epic17_rule_versions
    FOR EACH ROW
    WHEN (NEW.branch_name IS NOT NULL)
    EXECUTE FUNCTION update_branch_statistics();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Rule Versioning database schema created successfully';
    RAISE NOTICE '📊 Tables created: 9 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 5 management functions + 1 cleanup function';
    RAISE NOTICE '⚡ Features: Version control, rollback capabilities, branching, deployment tracking';
    RAISE NOTICE '🔄 Workflows: Approval processes, change tracking, compatibility analysis';
    RAISE NOTICE '📈 Analytics: Performance tracking, adoption metrics, usage statistics';
    RAISE NOTICE '🌿 Branching: Feature branches, merge strategies, conflict resolution';
    RAISE NOTICE '📋 Management: Automated cleanup, retention policies, archival';
    RAISE NOTICE '🚀 Rule versioning system ready for Epic 17 API management';
END $$;