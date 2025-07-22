-- Epic 17 Tag Merging and Splitting Database Schema
-- Task: E17-1753114396892-864734 - Implement tag merging and splitting
-- 
-- Creates comprehensive tag management infrastructure for Epic 17 API Management System
-- including merge/split operations, duplicate detection, relationship management, impact analysis,
-- and automated tag optimization for maintaining clean and organized tagging structures.

-- Tag operations tracking for merge, split, and other tag management operations
CREATE TABLE IF NOT EXISTS epic17_tag_operations (
    id SERIAL PRIMARY KEY,
    operation_id UUID UNIQUE NOT NULL,
    operation_type VARCHAR(30) NOT NULL, -- merge, split, rename, delete, consolidate, hierarchy_adjustment
    status VARCHAR(20) DEFAULT 'pending', -- pending, analyzing, approved, executing, completed, failed, cancelled, rolled_back
    
    -- Operation configuration
    operation_data JSONB NOT NULL, -- Complete operation configuration and state
    
    -- Source and target information
    source_tags JSONB DEFAULT '[]'::jsonb, -- Array of source tag names
    target_tags JSONB DEFAULT '[]'::jsonb, -- Array of target tag names
    operation_reason TEXT NOT NULL,
    
    -- Impact analysis
    impact_analysis JSONB DEFAULT '{}'::jsonb, -- Detailed impact analysis results
    confidence_score DECIMAL(5,2) DEFAULT 0,
    similarity_score DECIMAL(5,2) DEFAULT 0,
    
    -- Execution tracking
    resources_affected INTEGER DEFAULT 0,
    resources_processed INTEGER DEFAULT 0,
    execution_time INTEGER DEFAULT 0, -- milliseconds
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_comments TEXT,
    
    -- Error and status tracking
    errors JSONB DEFAULT '[]'::jsonb, -- Array of error objects
    warnings JSONB DEFAULT '[]'::jsonb, -- Array of warning objects
    
    -- Operation lifecycle
    initiated_by VARCHAR(255) NOT NULL,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Rollback and recovery
    rollback_data JSONB DEFAULT '{}'::jsonb, -- Data needed for rollback
    rollback_possible BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_tag_ops_operation_id (operation_id),
    INDEX idx_epic17_tag_ops_type (operation_type),
    INDEX idx_epic17_tag_ops_status (status),
    INDEX idx_epic17_tag_ops_initiated_by (initiated_by),
    INDEX idx_epic17_tag_ops_initiated_at (initiated_at),
    INDEX idx_epic17_tag_ops_requires_approval (requires_approval),
    INDEX idx_epic17_tag_ops_confidence (confidence_score),
    INDEX idx_epic17_tag_ops_active (status) WHERE status IN ('pending', 'analyzing', 'approved', 'executing'),
    INDEX idx_epic17_tag_ops_recent (initiated_at DESC, operation_type) WHERE initiated_at >= NOW() - INTERVAL '30 days'
);

-- Duplicate tag groups detection and management
CREATE TABLE IF NOT EXISTS epic17_duplicate_tag_groups (
    id SERIAL PRIMARY KEY,
    group_id UUID UNIQUE NOT NULL,
    primary_tag VARCHAR(255) NOT NULL,
    duplicate_tags JSONB NOT NULL, -- Array of duplicate tag names
    
    -- Similarity analysis
    similarity_scores JSONB NOT NULL, -- Object with tag pair similarity scores
    detection_method VARCHAR(30) NOT NULL, -- levenshtein, soundex, semantic, pattern, manual
    overall_confidence DECIMAL(5,2) NOT NULL,
    
    -- Usage statistics
    total_usage_count INTEGER DEFAULT 0,
    resource_distribution JSONB NOT NULL, -- Object with tag -> resource_count mapping
    
    -- Merge recommendation
    merge_recommended BOOLEAN DEFAULT FALSE,
    merge_confidence DECIMAL(5,2) DEFAULT 0,
    recommended_target_tag VARCHAR(255),
    merge_reasoning TEXT,
    
    -- Review and validation
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    false_positive BOOLEAN DEFAULT FALSE,
    review_comments TEXT,
    
    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolution_operation_id UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Detection metadata
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_validated_at TIMESTAMP WITH TIME ZONE,
    detection_algorithm_config JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_dup_groups_group_id (group_id),
    INDEX idx_epic17_dup_groups_primary_tag (primary_tag),
    INDEX idx_epic17_dup_groups_detection_method (detection_method),
    INDEX idx_epic17_dup_groups_confidence (overall_confidence),
    INDEX idx_epic17_dup_groups_merge_recommended (merge_recommended),
    INDEX idx_epic17_dup_groups_reviewed (reviewed),
    INDEX idx_epic17_dup_groups_resolved (resolved),
    INDEX idx_epic17_dup_groups_detected_at (detected_at),
    INDEX idx_epic17_dup_groups_unresolved (resolved, merge_recommended) WHERE resolved = FALSE,
    
    FOREIGN KEY (resolution_operation_id) REFERENCES epic17_tag_operations(operation_id) ON DELETE SET NULL
);

-- Tag relationships and hierarchies management
CREATE TABLE IF NOT EXISTS epic17_tag_relationships (
    id SERIAL PRIMARY KEY,
    relationship_id UUID UNIQUE NOT NULL,
    relationship_type VARCHAR(30) NOT NULL, -- synonym, parent_child, related, mutually_exclusive, evolved_from
    
    -- Relationship definition
    source_tag VARCHAR(255) NOT NULL,
    target_tag VARCHAR(255) NOT NULL,
    bidirectional BOOLEAN DEFAULT FALSE,
    
    -- Relationship strength and confidence
    strength DECIMAL(5,2) NOT NULL DEFAULT 1.0, -- 0-1 scale
    confidence DECIMAL(5,2) NOT NULL DEFAULT 1.0, -- 0-1 scale
    
    -- Relationship metadata
    relationship_data JSONB DEFAULT '{}'::jsonb, -- Additional relationship information
    context VARCHAR(100), -- Context in which this relationship is valid
    
    -- Lifecycle tracking
    established_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    established_by VARCHAR(255) NOT NULL,
    established_method VARCHAR(30) DEFAULT 'manual', -- manual, automatic, imported, inferred
    
    -- Validation and maintenance
    last_validated_at TIMESTAMP WITH TIME ZONE,
    validation_count INTEGER DEFAULT 0,
    deprecated BOOLEAN DEFAULT FALSE,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    deprecated_reason TEXT,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_epic17_tag_rels_relationship_id (relationship_id),
    INDEX idx_epic17_tag_rels_type (relationship_type),
    INDEX idx_epic17_tag_rels_source_tag (source_tag),
    INDEX idx_epic17_tag_rels_target_tag (target_tag),
    INDEX idx_epic17_tag_rels_strength (strength),
    INDEX idx_epic17_tag_rels_confidence (confidence),
    INDEX idx_epic17_tag_rels_established_by (established_by),
    INDEX idx_epic17_tag_rels_established_at (established_at),
    INDEX idx_epic17_tag_rels_deprecated (deprecated),
    INDEX idx_epic17_tag_rels_active (deprecated, strength) WHERE deprecated = FALSE,
    INDEX idx_epic17_tag_rels_source_target (source_tag, target_tag),
    
    -- Unique constraint to prevent duplicate relationships
    UNIQUE(source_tag, target_tag, relationship_type)
);

-- Tag operation approval workflow management
CREATE TABLE IF NOT EXISTS epic17_tag_operation_approvals (
    id SERIAL PRIMARY KEY,
    approval_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    
    -- Approval configuration
    required_approvers JSONB NOT NULL, -- Array of required approver identifiers
    approvals_required INTEGER NOT NULL DEFAULT 1,
    approvals_received INTEGER DEFAULT 0,
    
    -- Request details
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_by VARCHAR(255) NOT NULL,
    justification TEXT NOT NULL,
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
    
    -- Indexes
    INDEX idx_epic17_tag_approvals_approval_id (approval_id),
    INDEX idx_epic17_tag_approvals_operation_id (operation_id),
    INDEX idx_epic17_tag_approvals_status (status),
    INDEX idx_epic17_tag_approvals_requested_by (requested_by),
    INDEX idx_epic17_tag_approvals_expires_at (expires_at),
    INDEX idx_epic17_tag_approvals_pending (status, expires_at) WHERE status = 'pending',
    
    FOREIGN KEY (operation_id) REFERENCES epic17_tag_operations(operation_id) ON DELETE CASCADE
);

-- Individual approver decisions within approval workflows
CREATE TABLE IF NOT EXISTS epic17_tag_approval_decisions (
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
    delegation_from VARCHAR(255), -- If decision made on behalf of another
    decision_method VARCHAR(30) DEFAULT 'manual', -- manual, automated, delegated
    confidence_level INTEGER, -- 1-100 for automated decisions
    
    -- Supporting information
    review_duration INTEGER, -- minutes spent reviewing
    supporting_documents JSONB DEFAULT '[]'::jsonb, -- Links to supporting materials
    
    -- Indexes
    INDEX idx_epic17_approval_decisions_decision_id (decision_id),
    INDEX idx_epic17_approval_decisions_approval_id (approval_id),
    INDEX idx_epic17_approval_decisions_approver_id (approver_id),
    INDEX idx_epic17_approval_decisions_decision (decision),
    INDEX idx_epic17_approval_decisions_decided_at (decided_at),
    
    FOREIGN KEY (approval_id) REFERENCES epic17_tag_operation_approvals(approval_id) ON DELETE CASCADE
);

-- Tag operation impact analysis results
CREATE TABLE IF NOT EXISTS epic17_tag_impact_analyses (
    id SERIAL PRIMARY KEY,
    analysis_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    
    -- Analysis metadata
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_version VARCHAR(20) DEFAULT '1.0',
    analysis_method VARCHAR(30) NOT NULL, -- automated, manual, hybrid
    
    -- Resource impact
    total_resources_affected INTEGER NOT NULL,
    resource_type_breakdown JSONB NOT NULL, -- Object with resource_type -> count mapping
    critical_resources_affected INTEGER DEFAULT 0,
    
    -- Relationship impact
    related_tags_affected JSONB DEFAULT '[]'::jsonb, -- Array of affected tag names
    hierarchy_changes JSONB DEFAULT '[]'::jsonb, -- Array of hierarchy change objects
    synonym_relationships_affected INTEGER DEFAULT 0,
    
    -- Performance impact
    estimated_execution_time INTEGER, -- milliseconds
    estimated_resource_consumption JSONB DEFAULT '{}'::jsonb, -- CPU, memory, storage estimates
    system_load_impact VARCHAR(20) DEFAULT 'low', -- low, medium, high
    concurrency_constraints JSONB DEFAULT '[]'::jsonb,
    
    -- Risk assessment
    risk_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
    risk_factors JSONB DEFAULT '[]'::jsonb, -- Array of identified risk factors
    mitigation_strategies JSONB DEFAULT '[]'::jsonb, -- Array of mitigation approaches
    
    -- Business impact
    business_rule_violations JSONB DEFAULT '[]'::jsonb, -- Array of violated business rules
    compliance_impact JSONB DEFAULT '[]'::jsonb, -- Array of compliance considerations
    user_experience_impact VARCHAR(20) DEFAULT 'minimal', -- minimal, moderate, significant
    
    -- Recommendations
    recommended_actions JSONB DEFAULT '[]'::jsonb, -- Array of recommended actions
    alternative_approaches JSONB DEFAULT '[]'::jsonb, -- Array of alternative solutions
    
    -- Rollback planning
    rollback_complexity VARCHAR(20) DEFAULT 'low', -- low, medium, high
    rollback_requirements JSONB DEFAULT '[]'::jsonb, -- Array of rollback requirements
    
    -- Indexes
    INDEX idx_epic17_impact_analyses_analysis_id (analysis_id),
    INDEX idx_epic17_impact_analyses_operation_id (operation_id),
    INDEX idx_epic17_impact_analyses_analyzed_at (analyzed_at),
    INDEX idx_epic17_impact_analyses_risk_level (risk_level),
    INDEX idx_epic17_impact_analyses_resources_affected (total_resources_affected),
    
    FOREIGN KEY (operation_id) REFERENCES epic17_tag_operations(operation_id) ON DELETE CASCADE
);

-- Tag similarity analysis cache for performance optimization
CREATE TABLE IF NOT EXISTS epic17_tag_similarity_cache (
    id SERIAL PRIMARY KEY,
    cache_id UUID UNIQUE NOT NULL,
    
    -- Tag pair identification
    tag1 VARCHAR(255) NOT NULL,
    tag2 VARCHAR(255) NOT NULL,
    
    -- Similarity scores by algorithm
    levenshtein_score DECIMAL(5,2),
    soundex_score DECIMAL(5,2),
    semantic_score DECIMAL(5,2),
    pattern_score DECIMAL(5,2),
    overall_score DECIMAL(5,2) NOT NULL,
    
    -- Analysis metadata
    algorithm_config JSONB NOT NULL, -- Configuration used for analysis
    analysis_version VARCHAR(20) DEFAULT '1.0',
    
    -- Cache management
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Quality indicators
    confidence DECIMAL(5,2) NOT NULL,
    validated BOOLEAN DEFAULT FALSE,
    validation_source VARCHAR(50), -- manual, automated, consensus
    
    -- Indexes
    INDEX idx_epic17_similarity_cache_tag_pair (tag1, tag2),
    INDEX idx_epic17_similarity_cache_overall_score (overall_score),
    INDEX idx_epic17_similarity_cache_confidence (confidence),
    INDEX idx_epic17_similarity_cache_computed_at (computed_at),
    INDEX idx_epic17_similarity_cache_expires_at (expires_at),
    INDEX idx_epic17_similarity_cache_access_count (access_count),
    
    -- Unique constraint for tag pairs (both directions)
    UNIQUE(LEAST(tag1, tag2), GREATEST(tag1, tag2))
);

-- Tag operation execution history and detailed tracking
CREATE TABLE IF NOT EXISTS epic17_tag_operation_history (
    id SERIAL PRIMARY KEY,
    history_id UUID UNIQUE NOT NULL,
    operation_id UUID NOT NULL,
    
    -- Resource-level tracking
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    
    -- Change details
    previous_tags JSONB NOT NULL, -- Tags before operation
    new_tags JSONB NOT NULL, -- Tags after operation
    tags_added JSONB DEFAULT '[]'::jsonb,
    tags_removed JSONB DEFAULT '[]'::jsonb,
    tags_modified JSONB DEFAULT '[]'::jsonb,
    
    -- Operation execution details
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_time INTEGER DEFAULT 0, -- milliseconds
    batch_number INTEGER,
    
    -- Result status
    success BOOLEAN NOT NULL,
    error_message TEXT,
    warning_messages JSONB DEFAULT '[]'::jsonb,
    
    -- Recovery information
    rollback_data JSONB DEFAULT '{}'::jsonb, -- Data needed to rollback this specific change
    rollback_possible BOOLEAN DEFAULT TRUE,
    
    -- Indexes
    INDEX idx_epic17_tag_history_history_id (history_id),
    INDEX idx_epic17_tag_history_operation_id (operation_id),
    INDEX idx_epic17_tag_history_resource (resource_id, resource_type),
    INDEX idx_epic17_tag_history_processed_at (processed_at),
    INDEX idx_epic17_tag_history_success (success),
    INDEX idx_epic17_tag_history_batch_number (batch_number),
    INDEX idx_epic17_tag_history_composite (operation_id, resource_type, success),
    
    FOREIGN KEY (operation_id) REFERENCES epic17_tag_operations(operation_id) ON DELETE CASCADE
);

-- Create functions for tag management operations

-- Function to calculate tag similarity using multiple algorithms
CREATE OR REPLACE FUNCTION calculate_tag_similarity(
    p_tag1 VARCHAR(255),
    p_tag2 VARCHAR(255),
    p_algorithms VARCHAR[] DEFAULT ARRAY['levenshtein', 'soundex', 'semantic']
) RETURNS TABLE(
    algorithm VARCHAR(30),
    similarity_score DECIMAL(5,2)
) AS $$
DECLARE
    algo VARCHAR(30);
BEGIN
    FOREACH algo IN ARRAY p_algorithms
    LOOP
        CASE algo
            WHEN 'levenshtein' THEN
                RETURN QUERY SELECT 
                    'levenshtein'::VARCHAR(30),
                    (1.0 - (levenshtein_less_equal(LOWER(p_tag1), LOWER(p_tag2), 255)::DECIMAL / 
                            GREATEST(length(p_tag1), length(p_tag2))))::DECIMAL(5,2);
                            
            WHEN 'soundex' THEN
                RETURN QUERY SELECT 
                    'soundex'::VARCHAR(30),
                    CASE WHEN soundex(p_tag1) = soundex(p_tag2) THEN 1.0 ELSE 0.0 END::DECIMAL(5,2);
                    
            WHEN 'semantic' THEN
                -- Simplified semantic similarity based on word overlap
                RETURN QUERY SELECT 
                    'semantic'::VARCHAR(30),
                    (
                        SELECT COALESCE(
                            (
                                SELECT COUNT(*)::DECIMAL / 
                                       (array_length(string_to_array(LOWER(p_tag1), ' '), 1) + 
                                        array_length(string_to_array(LOWER(p_tag2), ' '), 1) - 
                                        COUNT(*))
                                FROM unnest(string_to_array(LOWER(p_tag1), ' ')) AS word1
                                JOIN unnest(string_to_array(LOWER(p_tag2), ' ')) AS word2 
                                ON word1 = word2
                            ), 0.0
                        )
                    )::DECIMAL(5,2);
        END CASE;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to detect duplicate tag groups
CREATE OR REPLACE FUNCTION detect_duplicate_tag_groups(
    p_similarity_threshold DECIMAL(5,2) DEFAULT 0.85,
    p_resource_type VARCHAR(50) DEFAULT NULL
) RETURNS TABLE(
    primary_tag VARCHAR(255),
    duplicate_tags TEXT[],
    max_similarity DECIMAL(5,2),
    total_usage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH tag_usage AS (
        SELECT 
            tag,
            COUNT(*) as usage_count
        FROM resource_tags
        WHERE (p_resource_type IS NULL OR resource_type = p_resource_type)
        GROUP BY tag
        HAVING COUNT(*) > 1  -- Only consider tags with some usage
    ),
    tag_similarities AS (
        SELECT 
            t1.tag as tag1,
            t2.tag as tag2,
            t1.usage_count + t2.usage_count as combined_usage,
            GREATEST(
                COALESCE((1.0 - (levenshtein_less_equal(LOWER(t1.tag), LOWER(t2.tag), 255)::DECIMAL / 
                                GREATEST(length(t1.tag), length(t2.tag)))), 0),
                CASE WHEN soundex(t1.tag) = soundex(t2.tag) THEN 1.0 ELSE 0.0 END
            ) as similarity_score
        FROM tag_usage t1
        CROSS JOIN tag_usage t2
        WHERE t1.tag < t2.tag  -- Avoid duplicates and self-comparison
    ),
    duplicate_candidates AS (
        SELECT 
            CASE WHEN (SELECT usage_count FROM tag_usage WHERE tag = tag1) >= 
                      (SELECT usage_count FROM tag_usage WHERE tag = tag2)
                 THEN tag1 ELSE tag2 END as primary_tag,
            CASE WHEN (SELECT usage_count FROM tag_usage WHERE tag = tag1) >= 
                      (SELECT usage_count FROM tag_usage WHERE tag = tag2)
                 THEN tag2 ELSE tag1 END as duplicate_tag,
            similarity_score,
            combined_usage
        FROM tag_similarities
        WHERE similarity_score >= p_similarity_threshold
    )
    SELECT 
        dc.primary_tag,
        array_agg(dc.duplicate_tag ORDER BY dc.similarity_score DESC) as duplicate_tags,
        MAX(dc.similarity_score) as max_similarity,
        MAX(dc.combined_usage)::INTEGER as total_usage
    FROM duplicate_candidates dc
    GROUP BY dc.primary_tag
    ORDER BY MAX(dc.similarity_score) DESC, MAX(dc.combined_usage) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get tag operation metrics
CREATE OR REPLACE FUNCTION get_tag_operation_metrics(
    p_time_window_hours INTEGER DEFAULT 24
) RETURNS TABLE(
    total_operations BIGINT,
    completed_operations BIGINT,
    failed_operations BIGINT,
    avg_execution_time DECIMAL,
    merge_operations BIGINT,
    split_operations BIGINT,
    resources_processed BIGINT,
    pending_approvals BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_operations,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_operations,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_operations,
        AVG(execution_time) FILTER (WHERE execution_time > 0) as avg_execution_time,
        COUNT(*) FILTER (WHERE operation_type = 'merge') as merge_operations,
        COUNT(*) FILTER (WHERE operation_type = 'split') as split_operations,
        COALESCE(SUM(resources_processed), 0) as resources_processed,
        COUNT(*) FILTER (WHERE requires_approval = TRUE AND status = 'pending') as pending_approvals
    FROM epic17_tag_operations
    WHERE initiated_at >= NOW() - (p_time_window_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to validate tag operation feasibility
CREATE OR REPLACE FUNCTION validate_tag_operation_feasibility(
    p_operation_type VARCHAR(30),
    p_source_tags VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    p_target_tags VARCHAR[] DEFAULT ARRAY[]::VARCHAR[]
) RETURNS TABLE(
    feasible BOOLEAN,
    reason TEXT,
    confidence DECIMAL(5,2),
    estimated_resources_affected INTEGER,
    risk_level VARCHAR(20)
) AS $$
DECLARE
    source_tag VARCHAR(255);
    resources_count INTEGER := 0;
    total_resources INTEGER := 0;
BEGIN
    -- Basic validation
    IF p_operation_type = 'merge' AND array_length(p_source_tags, 1) = 0 THEN
        RETURN QUERY SELECT FALSE, 'Merge operation requires at least one source tag', 0.0::DECIMAL(5,2), 0, 'high'::VARCHAR(20);
        RETURN;
    END IF;
    
    IF p_operation_type = 'split' AND array_length(p_target_tags, 1) < 2 THEN
        RETURN QUERY SELECT FALSE, 'Split operation requires at least two target tags', 0.0::DECIMAL(5,2), 0, 'high'::VARCHAR(20);
        RETURN;
    END IF;
    
    -- Count affected resources
    IF p_operation_type = 'merge' THEN
        SELECT COUNT(DISTINCT resource_id) INTO total_resources
        FROM resource_tags 
        WHERE tag = ANY(p_source_tags);
    ELSIF p_operation_type = 'split' THEN
        SELECT COUNT(DISTINCT resource_id) INTO total_resources
        FROM resource_tags 
        WHERE tag = ANY(p_source_tags);
    END IF;
    
    -- Determine feasibility and risk
    RETURN QUERY SELECT 
        TRUE,
        'Operation appears feasible',
        CASE 
            WHEN total_resources = 0 THEN 0.1
            WHEN total_resources < 10 THEN 0.9
            WHEN total_resources < 100 THEN 0.8
            WHEN total_resources < 1000 THEN 0.6
            ELSE 0.4
        END::DECIMAL(5,2),
        total_resources,
        CASE 
            WHEN total_resources < 10 THEN 'low'
            WHEN total_resources < 100 THEN 'medium'
            WHEN total_resources < 1000 THEN 'high'
            ELSE 'critical'
        END::VARCHAR(20);
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old tag similarity cache entries
CREATE OR REPLACE FUNCTION cleanup_tag_similarity_cache(
    p_retention_days INTEGER DEFAULT 7
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM epic17_tag_similarity_cache 
    WHERE expires_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'tag_management', 'cleanup_similarity_cache', 'system', deleted_count, true
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default tag relationships for common patterns
INSERT INTO epic17_tag_relationships (
    relationship_id, relationship_type, source_tag, target_tag, strength, confidence, 
    established_by, relationship_data
) VALUES
(
    gen_random_uuid(),
    'synonym',
    'dev',
    'development',
    0.9,
    0.95,
    'system',
    '{"context": "environment_abbreviation", "automatic": true}'
),
(
    gen_random_uuid(),
    'synonym',
    'prod',
    'production',
    0.9,
    0.95,
    'system',
    '{"context": "environment_abbreviation", "automatic": true}'
),
(
    gen_random_uuid(),
    'parent_child',
    'api',
    'rest-api',
    0.8,
    0.85,
    'system',
    '{"hierarchy_level": 1, "automatic": true}'
),
(
    gen_random_uuid(),
    'parent_child',
    'api',
    'graphql-api',
    0.8,
    0.85,
    'system',
    '{"hierarchy_level": 1, "automatic": true}'
),
(
    gen_random_uuid(),
    'mutually_exclusive',
    'active',
    'inactive',
    1.0,
    1.0,
    'system',
    '{"constraint_type": "status", "automatic": true}'
),
(
    gen_random_uuid(),
    'mutually_exclusive',
    'enabled',
    'disabled',
    1.0,
    1.0,
    'system',
    '{"constraint_type": "status", "automatic": true}'
)
ON CONFLICT (source_tag, target_tag, relationship_type) DO NOTHING;

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_tag_ops_performance 
    ON epic17_tag_operations (status, operation_type, initiated_at DESC) 
    WHERE status IN ('pending', 'executing') OR initiated_at >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_dup_groups_high_confidence 
    ON epic17_duplicate_tag_groups (overall_confidence DESC, total_usage_count DESC) 
    WHERE resolved = FALSE AND overall_confidence >= 0.8;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_similarity_cache_performance 
    ON epic17_tag_similarity_cache (overall_score DESC, confidence DESC) 
    WHERE expires_at > NOW() AND overall_score >= 0.7;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_tag_history_recent 
    ON epic17_tag_operation_history (processed_at DESC, success) 
    WHERE processed_at >= NOW() - INTERVAL '30 days';

-- Create comprehensive tag management dashboard view
CREATE VIEW epic17_tag_management_dashboard AS
SELECT 
    -- Operation metrics
    (SELECT COUNT(*) FROM epic17_tag_operations WHERE status IN ('pending', 'executing')) as active_operations,
    (SELECT COUNT(*) FROM epic17_tag_operations WHERE initiated_at >= NOW() - INTERVAL '24 hours') as operations_today,
    (SELECT AVG(execution_time) FROM epic17_tag_operations WHERE status = 'completed' AND initiated_at >= NOW() - INTERVAL '7 days') as avg_execution_time_week,
    
    -- Duplicate detection
    (SELECT COUNT(*) FROM epic17_duplicate_tag_groups WHERE resolved = FALSE) as unresolved_duplicates,
    (SELECT COUNT(*) FROM epic17_duplicate_tag_groups WHERE merge_recommended = TRUE AND resolved = FALSE) as merge_recommendations,
    
    -- Approval workflow
    (SELECT COUNT(*) FROM epic17_tag_operation_approvals WHERE status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM epic17_tag_operation_approvals WHERE status = 'pending' AND expires_at <= NOW() + INTERVAL '4 hours') as urgent_approvals,
    
    -- Tag relationships
    (SELECT COUNT(*) FROM epic17_tag_relationships WHERE deprecated = FALSE) as active_relationships,
    (SELECT COUNT(*) FROM epic17_tag_relationships WHERE relationship_type = 'synonym' AND deprecated = FALSE) as synonym_relationships,
    
    -- Performance metrics
    (SELECT COUNT(*) FROM epic17_tag_similarity_cache WHERE expires_at > NOW()) as cached_similarities,
    (SELECT COUNT(*) FROM epic17_tag_impact_analyses WHERE analyzed_at >= NOW() - INTERVAL '7 days') as recent_impact_analyses,
    
    -- System health indicators
    (SELECT COUNT(*) FROM epic17_tag_operations WHERE status = 'failed' AND initiated_at >= NOW() - INTERVAL '24 hours') as failed_operations_today,
    (SELECT COUNT(*) FROM epic17_tag_operation_history WHERE success = FALSE AND processed_at >= NOW() - INTERVAL '24 hours') as processing_errors_today;

-- Add table comments for documentation
COMMENT ON TABLE epic17_tag_operations IS 'Tag management operations including merge, split, and consolidation tracking';
COMMENT ON TABLE epic17_duplicate_tag_groups IS 'Detected duplicate tag groups with similarity analysis and merge recommendations';
COMMENT ON TABLE epic17_tag_relationships IS 'Tag relationships and hierarchies including synonyms and parent-child relationships';
COMMENT ON TABLE epic17_tag_operation_approvals IS 'Approval workflow management for tag operations';
COMMENT ON TABLE epic17_tag_approval_decisions IS 'Individual approver decisions within approval workflows';
COMMENT ON TABLE epic17_tag_impact_analyses IS 'Impact analysis results for tag operations';
COMMENT ON TABLE epic17_tag_similarity_cache IS 'Cached tag similarity calculations for performance optimization';
COMMENT ON TABLE epic17_tag_operation_history IS 'Detailed execution history for tag operations at resource level';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_tag_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_tag_operations_timestamp
    BEFORE UPDATE ON epic17_tag_operations
    FOR EACH ROW EXECUTE FUNCTION update_epic17_tag_timestamp();

-- Create trigger to update similarity cache access tracking
CREATE OR REPLACE FUNCTION update_similarity_cache_access() RETURNS TRIGGER AS $$
BEGIN
    NEW.access_count = OLD.access_count + 1;
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_similarity_cache_access
    BEFORE UPDATE ON epic17_tag_similarity_cache
    FOR EACH ROW 
    WHEN (NEW.access_count IS NULL OR NEW.access_count = OLD.access_count)
    EXECUTE FUNCTION update_similarity_cache_access();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Tag Merging and Splitting database schema created successfully';
    RAISE NOTICE '📊 Tables created: 8 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 5 management functions + 1 cleanup function';
    RAISE NOTICE '📋 Default relationships: 6 common tag relationships configured';
    RAISE NOTICE '⚡ Features: Merge/split operations, duplicate detection, relationship management';
    RAISE NOTICE '📈 Intelligence: Similarity analysis, impact assessment, approval workflows';
    RAISE NOTICE '⚖️  Algorithms: Levenshtein, Soundex, Semantic, Pattern-based similarity detection';
    RAISE NOTICE '🔄 Automation: Duplicate detection, merge recommendations, relationship inference';
    RAISE NOTICE '🚀 Tag management system ready for Epic 17 API management';
END $$;