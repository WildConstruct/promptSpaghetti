-- Epic 17 Auto-Tagging Database Schema
-- Task: E17-1753114396874-E274EC - Implement auto-tagging
-- 
-- Creates comprehensive auto-tagging infrastructure for Epic 17 API Management System
-- including rule management, pattern detection, execution tracking, machine learning integration,
-- and automated tag application based on intelligent analysis and configurable rules.

-- Auto-tagging rules definition and management
CREATE TABLE IF NOT EXISTS epic17_auto_tagging_rules (
    id SERIAL PRIMARY KEY,
    rule_id UUID UNIQUE NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(30) NOT NULL, -- pattern_based, characteristic_based, usage_based, relationship_based, time_based, conditional, ml_based
    
    -- Rule status and configuration
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100,
    test_mode BOOLEAN DEFAULT FALSE,
    
    -- Rule conditions and actions
    conditions JSONB NOT NULL, -- Array of conditions to evaluate
    actions JSONB NOT NULL, -- Array of tagging actions to perform
    
    -- Target configuration
    target_resource_types JSONB NOT NULL, -- Array of resource types this rule applies to
    resource_filters JSONB DEFAULT '{}'::jsonb, -- Additional filtering criteria
    
    -- Execution settings
    execution_mode VARCHAR(20) DEFAULT 'immediate', -- immediate, deferred, conditional
    requires_approval BOOLEAN DEFAULT FALSE,
    conflict_resolution VARCHAR(20) DEFAULT 'merge', -- merge, replace, skip
    
    -- Pattern analysis configuration
    pattern_config JSONB DEFAULT '{}'::jsonb,
    
    -- Machine learning configuration
    ml_config JSONB DEFAULT '{}'::jsonb,
    
    -- Rule performance and usage tracking
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    last_executed TIMESTAMP WITH TIME ZONE,
    avg_execution_time INTEGER DEFAULT 0, -- milliseconds
    
    -- Rule lifecycle
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validation rules
    validation_rules JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_auto_rules_rule_id (rule_id),
    INDEX idx_epic17_auto_rules_rule_name (rule_name),
    INDEX idx_epic17_auto_rules_rule_type (rule_type),
    INDEX idx_epic17_auto_rules_enabled (enabled),
    INDEX idx_epic17_auto_rules_priority (priority),
    INDEX idx_epic17_auto_rules_execution_mode (execution_mode),
    INDEX idx_epic17_auto_rules_created_by (created_by),
    INDEX idx_epic17_auto_rules_last_executed (last_executed),
    INDEX idx_epic17_auto_rules_active_priority (enabled, priority) WHERE enabled = TRUE,
    INDEX idx_epic17_auto_rules_performance (success_rate, avg_execution_time)
);

-- Auto-tagging rule execution history and tracking
CREATE TABLE IF NOT EXISTS epic17_auto_tagging_executions (
    id SERIAL PRIMARY KEY,
    execution_id UUID UNIQUE NOT NULL,
    trigger_type VARCHAR(30) NOT NULL, -- resource_created, resource_updated, usage_pattern_detected, scheduled_batch, manual_trigger, rule_updated, threshold_exceeded, anomaly_detected
    
    -- Execution scope and timing
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_by VARCHAR(255) NOT NULL,
    execution_time INTEGER DEFAULT 0, -- milliseconds
    
    -- Rules executed
    rules_executed JSONB DEFAULT '[]'::jsonb, -- Array of rule IDs executed
    rules_execution_time JSONB DEFAULT '{}'::jsonb, -- Execution time per rule
    
    -- Resources processed
    resources_processed INTEGER DEFAULT 0,
    resource_types_processed JSONB DEFAULT '[]'::jsonb,
    
    -- Execution results
    tags_added INTEGER DEFAULT 0,
    tags_removed INTEGER DEFAULT 0,
    tags_updated INTEGER DEFAULT 0,
    conflicts_resolved INTEGER DEFAULT 0,
    
    -- Error and warning tracking
    errors JSONB DEFAULT '[]'::jsonb, -- Array of error objects
    warnings JSONB DEFAULT '[]'::jsonb, -- Array of warning objects
    
    -- Execution configuration
    dry_run BOOLEAN DEFAULT FALSE,
    batch_id UUID,
    parent_execution_id UUID,
    
    -- Execution metadata
    trigger_data JSONB DEFAULT '{}'::jsonb, -- Data about what triggered the execution
    execution_context JSONB DEFAULT '{}'::jsonb, -- Additional context information
    
    -- Indexes
    INDEX idx_epic17_executions_execution_id (execution_id),
    INDEX idx_epic17_executions_trigger_type (trigger_type),
    INDEX idx_epic17_executions_executed_at (executed_at),
    INDEX idx_epic17_executions_executed_by (executed_by),
    INDEX idx_epic17_executions_batch_id (batch_id),
    INDEX idx_epic17_executions_parent_execution (parent_execution_id),
    INDEX idx_epic17_executions_recent (executed_at DESC, trigger_type) WHERE executed_at >= NOW() - INTERVAL '7 days',
    
    FOREIGN KEY (parent_execution_id) REFERENCES epic17_auto_tagging_executions(execution_id) ON DELETE CASCADE
);

-- Resource tagging results and detailed tracking
CREATE TABLE IF NOT EXISTS epic17_resource_tagging_results (
    id SERIAL PRIMARY KEY,
    result_id UUID UNIQUE NOT NULL,
    execution_id UUID NOT NULL,
    
    -- Resource identification
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    
    -- Tagging results
    previous_tags JSONB DEFAULT '[]'::jsonb, -- Tags before execution
    new_tags JSONB DEFAULT '[]'::jsonb, -- Tags after execution
    applied_rules JSONB DEFAULT '[]'::jsonb, -- Rules that modified this resource
    
    -- Result metadata
    processing_time INTEGER DEFAULT 0, -- milliseconds
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Overall confidence in tagging decisions
    conflicts JSONB DEFAULT '[]'::jsonb, -- Array of conflict objects
    
    -- Change details
    tags_added JSONB DEFAULT '[]'::jsonb,
    tags_removed JSONB DEFAULT '[]'::jsonb,
    tags_updated JSONB DEFAULT '[]'::jsonb,
    
    -- Quality metrics
    validation_passed BOOLEAN DEFAULT TRUE,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    
    -- Additional metadata
    result_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_tagging_results_result_id (result_id),
    INDEX idx_epic17_tagging_results_execution_id (execution_id),
    INDEX idx_epic17_tagging_results_resource (resource_id, resource_type),
    INDEX idx_epic17_tagging_results_confidence (confidence_score),
    INDEX idx_epic17_tagging_results_validation (validation_passed),
    INDEX idx_epic17_tagging_results_created_at (created_at),
    INDEX idx_epic17_tagging_results_composite (execution_id, resource_type, created_at),
    
    FOREIGN KEY (execution_id) REFERENCES epic17_auto_tagging_executions(execution_id) ON DELETE CASCADE
);

-- Pattern detection and analysis results
CREATE TABLE IF NOT EXISTS epic17_tagging_patterns (
    id SERIAL PRIMARY KEY,
    pattern_id UUID UNIQUE NOT NULL,
    pattern_type VARCHAR(30) NOT NULL, -- naming, usage, relationship, temporal, behavioral
    
    -- Pattern definition
    pattern_name VARCHAR(255) NOT NULL,
    pattern_description TEXT,
    pattern_expression JSONB NOT NULL, -- The actual pattern definition
    
    -- Pattern strength and validation
    confidence_score DECIMAL(5,2) NOT NULL,
    occurrence_count INTEGER DEFAULT 0,
    validation_count INTEGER DEFAULT 0,
    false_positive_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Pattern scope
    resource_types JSONB NOT NULL, -- Array of resource types this pattern applies to
    time_window_hours INTEGER, -- Time window for temporal patterns
    
    -- Pattern analysis
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_validated_at TIMESTAMP WITH TIME ZONE,
    next_validation_at TIMESTAMP WITH TIME ZONE,
    
    -- Suggested tags and actions
    suggested_tags JSONB DEFAULT '[]'::jsonb,
    suggested_actions JSONB DEFAULT '[]'::jsonb,
    
    -- Pattern lifecycle
    status VARCHAR(20) DEFAULT 'active', -- active, deprecated, invalid, learning
    created_by VARCHAR(255) DEFAULT 'pattern_detector',
    
    -- Machine learning metadata
    ml_model_version VARCHAR(50),
    feature_importance JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_patterns_pattern_id (pattern_id),
    INDEX idx_epic17_patterns_pattern_type (pattern_type),
    INDEX idx_epic17_patterns_confidence (confidence_score),
    INDEX idx_epic17_patterns_occurrence_count (occurrence_count),
    INDEX idx_epic17_patterns_status (status),
    INDEX idx_epic17_patterns_discovered_at (discovered_at),
    INDEX idx_epic17_patterns_validation_due (next_validation_at) WHERE next_validation_at IS NOT NULL,
    INDEX idx_epic17_patterns_active_confident (status, confidence_score) WHERE status = 'active'
);

-- Rule suggestions generated from pattern analysis
CREATE TABLE IF NOT EXISTS epic17_rule_suggestions (
    id SERIAL PRIMARY KEY,
    suggestion_id UUID UNIQUE NOT NULL,
    suggested_rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Suggestion metadata
    suggested_rule_type VARCHAR(30) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    priority_score INTEGER DEFAULT 100,
    
    -- Pattern association
    based_on_patterns JSONB NOT NULL, -- Array of pattern IDs this suggestion is based on
    
    -- Impact estimation
    estimated_impact JSONB NOT NULL, -- Object with affected_resources, tags_to_add, conflicts_expected
    
    -- Suggested rule configuration
    suggested_rule_config JSONB NOT NULL, -- Complete rule configuration
    
    -- Review and approval
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, implemented, archived
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_comments TEXT,
    
    -- Implementation tracking
    implemented_rule_id UUID,
    implemented_at TIMESTAMP WITH TIME ZONE,
    implementation_results JSONB DEFAULT '{}'::jsonb,
    
    -- Suggestion lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Indexes
    INDEX idx_epic17_suggestions_suggestion_id (suggestion_id),
    INDEX idx_epic17_suggestions_status (status),
    INDEX idx_epic17_suggestions_confidence (confidence_score),
    INDEX idx_epic17_suggestions_priority (priority_score),
    INDEX idx_epic17_suggestions_created_at (created_at),
    INDEX idx_epic17_suggestions_expires_at (expires_at),
    INDEX idx_epic17_suggestions_reviewed_by (reviewed_by),
    INDEX idx_epic17_suggestions_pending (status, expires_at) WHERE status = 'pending',
    
    FOREIGN KEY (implemented_rule_id) REFERENCES epic17_auto_tagging_rules(rule_id) ON DELETE SET NULL
);

-- Tag conflict tracking and resolution
CREATE TABLE IF NOT EXISTS epic17_tagging_conflicts (
    id SERIAL PRIMARY KEY,
    conflict_id UUID UNIQUE NOT NULL,
    execution_id UUID,
    
    -- Conflict details
    conflict_type VARCHAR(30) NOT NULL, -- duplicate, contradictory, validation, permission, business_rule
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    
    -- Conflicting elements
    conflicting_rules JSONB NOT NULL, -- Array of rule IDs involved in conflict
    conflicting_tags JSONB NOT NULL, -- Array of tags causing conflict
    conflict_data JSONB DEFAULT '{}'::jsonb, -- Additional conflict information
    
    -- Resolution
    resolution_strategy VARCHAR(30), -- merge, replace, skip, manual, escalate
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    
    -- Final outcome
    final_tags JSONB DEFAULT '[]'::jsonb, -- Final tags applied after resolution
    tags_applied JSONB DEFAULT '[]'::jsonb, -- Which tags were actually applied
    tags_skipped JSONB DEFAULT '[]'::jsonb, -- Which tags were skipped due to conflict
    
    -- Conflict metadata
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_conflicts_conflict_id (conflict_id),
    INDEX idx_epic17_conflicts_execution_id (execution_id),
    INDEX idx_epic17_conflicts_resource (resource_id, resource_type),
    INDEX idx_epic17_conflicts_conflict_type (conflict_type),
    INDEX idx_epic17_conflicts_resolved (resolved),
    INDEX idx_epic17_conflicts_severity (severity),
    INDEX idx_epic17_conflicts_detected_at (detected_at),
    INDEX idx_epic17_conflicts_unresolved (resolved, detected_at) WHERE resolved = FALSE,
    
    FOREIGN KEY (execution_id) REFERENCES epic17_auto_tagging_executions(execution_id) ON DELETE CASCADE
);

-- Machine learning model tracking and versioning
CREATE TABLE IF NOT EXISTS epic17_tagging_ml_models (
    id SERIAL PRIMARY KEY,
    model_id UUID UNIQUE NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(30) NOT NULL, -- classification, clustering, regression, neural_network
    
    -- Model configuration
    model_config JSONB NOT NULL, -- Complete model configuration
    training_data_config JSONB NOT NULL, -- Training data sources and parameters
    feature_config JSONB NOT NULL, -- Feature engineering configuration
    
    -- Model performance
    accuracy DECIMAL(5,2),
    precision_score DECIMAL(5,2),
    recall SCORE DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    confidence_threshold DECIMAL(5,2) DEFAULT 0.8,
    
    -- Training metadata
    trained_at TIMESTAMP WITH TIME ZONE,
    training_duration INTEGER, -- seconds
    training_samples INTEGER,
    validation_samples INTEGER,
    
    -- Model status and lifecycle
    status VARCHAR(20) DEFAULT 'training', -- training, validation, active, deprecated, failed
    deployed_at TIMESTAMP WITH TIME ZONE,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    predictions_made INTEGER DEFAULT 0,
    successful_predictions INTEGER DEFAULT 0,
    failed_predictions INTEGER DEFAULT 0,
    
    -- Model storage
    model_path TEXT, -- Path to stored model file
    model_checksum VARCHAR(64), -- Model integrity verification
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_ml_models_model_id (model_id),
    INDEX idx_epic17_ml_models_name_version (model_name, model_version),
    INDEX idx_epic17_ml_models_status (status),
    INDEX idx_epic17_ml_models_accuracy (accuracy),
    INDEX idx_epic17_ml_models_trained_at (trained_at),
    INDEX idx_epic17_ml_models_deployed_at (deployed_at),
    INDEX idx_epic17_ml_models_active (status, deployed_at) WHERE status = 'active'
);

-- Auto-tagging performance metrics and analytics
CREATE TABLE IF NOT EXISTS epic17_tagging_performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_id UUID UNIQUE NOT NULL,
    metric_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_period VARCHAR(20) NOT NULL, -- hourly, daily, weekly, monthly
    
    -- Execution metrics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    avg_execution_time INTEGER DEFAULT 0, -- milliseconds
    
    -- Tagging metrics
    total_tags_added INTEGER DEFAULT 0,
    total_tags_removed INTEGER DEFAULT 0,
    total_tags_updated INTEGER DEFAULT 0,
    unique_resources_tagged INTEGER DEFAULT 0,
    
    -- Rule performance metrics
    total_active_rules INTEGER DEFAULT 0,
    rules_with_executions INTEGER DEFAULT 0,
    avg_rule_success_rate DECIMAL(5,2) DEFAULT 0,
    most_used_rule_id UUID,
    
    -- Pattern detection metrics
    patterns_discovered INTEGER DEFAULT 0,
    patterns_validated INTEGER DEFAULT 0,
    pattern_accuracy DECIMAL(5,2) DEFAULT 0,
    
    -- Conflict metrics
    conflicts_detected INTEGER DEFAULT 0,
    conflicts_resolved INTEGER DEFAULT 0,
    avg_resolution_time INTEGER DEFAULT 0, -- minutes
    
    -- Resource type breakdown
    resource_type_metrics JSONB DEFAULT '{}'::jsonb, -- Metrics broken down by resource type
    
    -- Quality metrics
    validation_pass_rate DECIMAL(5,2) DEFAULT 0,
    user_satisfaction_score DECIMAL(5,2), -- If available from feedback
    tag_accuracy_score DECIMAL(5,2),
    
    -- Indexes
    INDEX idx_epic17_metrics_metric_id (metric_id),
    INDEX idx_epic17_metrics_timestamp (metric_timestamp),
    INDEX idx_epic17_metrics_period (metric_period),
    INDEX idx_epic17_metrics_most_used_rule (most_used_rule_id),
    INDEX idx_epic17_metrics_recent (metric_timestamp DESC, metric_period) WHERE metric_timestamp >= NOW() - INTERVAL '30 days'
);

-- Create comprehensive functions for auto-tagging management

-- Function to evaluate rule conditions against a resource
CREATE OR REPLACE FUNCTION evaluate_tagging_rule_conditions(
    p_rule_conditions JSONB,
    p_resource_data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    condition JSONB;
    field_value TEXT;
    condition_result BOOLEAN;
    required_conditions_met INTEGER := 0;
    required_conditions_total INTEGER := 0;
BEGIN
    -- Iterate through conditions
    FOR condition IN SELECT * FROM jsonb_array_elements(p_rule_conditions)
    LOOP
        -- Get field value from resource
        field_value := p_resource_data ->> (condition ->> 'field');
        
        -- Evaluate condition based on operator
        condition_result := CASE condition ->> 'operator'
            WHEN 'equals' THEN field_value = (condition ->> 'value')
            WHEN 'contains' THEN LOWER(field_value) LIKE '%' || LOWER(condition ->> 'value') || '%'
            WHEN 'greater_than' THEN field_value::NUMERIC > (condition ->> 'value')::NUMERIC
            WHEN 'less_than' THEN field_value::NUMERIC < (condition ->> 'value')::NUMERIC
            WHEN 'exists' THEN field_value IS NOT NULL
            ELSE FALSE
        END;
        
        -- Handle negation
        IF (condition ->> 'negated')::BOOLEAN = TRUE THEN
            condition_result := NOT condition_result;
        END IF;
        
        -- Track required conditions
        IF (condition ->> 'required')::BOOLEAN = TRUE THEN
            required_conditions_total := required_conditions_total + 1;
            IF condition_result THEN
                required_conditions_met := required_conditions_met + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- Return true if all required conditions are met
    RETURN required_conditions_met = required_conditions_total;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate rule success rate and update statistics
CREATE OR REPLACE FUNCTION update_rule_statistics(
    p_rule_id UUID,
    p_execution_successful BOOLEAN,
    p_execution_time INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE epic17_auto_tagging_rules
    SET 
        execution_count = execution_count + 1,
        success_count = CASE WHEN p_execution_successful THEN success_count + 1 ELSE success_count END,
        failure_count = CASE WHEN NOT p_execution_successful THEN failure_count + 1 ELSE failure_count END,
        success_rate = CASE 
            WHEN execution_count + 1 > 0 THEN 
                ((CASE WHEN p_execution_successful THEN success_count + 1 ELSE success_count END)::DECIMAL / (execution_count + 1) * 100)
            ELSE 0 
        END,
        avg_execution_time = ((avg_execution_time * execution_count + p_execution_time) / (execution_count + 1)),
        last_executed = NOW(),
        updated_at = NOW()
    WHERE rule_id = p_rule_id;
END;
$$ LANGUAGE plpgsql;

-- Function to detect potential tagging patterns
CREATE OR REPLACE FUNCTION detect_tagging_patterns(
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_time_window_hours INTEGER DEFAULT 168 -- 1 week
) RETURNS TABLE(
    pattern_type VARCHAR(30),
    pattern_expression JSONB,
    confidence_score DECIMAL(5,2),
    occurrence_count INTEGER,
    suggested_tags TEXT[]
) AS $$
BEGIN
    -- This is a simplified pattern detection function
    -- In practice, this would include sophisticated ML algorithms
    
    RETURN QUERY
    WITH resource_analysis AS (
        SELECT 
            rt.resource_type,
            rt.tag,
            COUNT(*) as tag_usage,
            array_agg(DISTINCT rt.resource_id) as resources_with_tag
        FROM resource_tags rt
        WHERE (p_resource_type IS NULL OR rt.resource_type = p_resource_type)
            AND rt.created_at >= NOW() - (p_time_window_hours || ' hours')::INTERVAL
        GROUP BY rt.resource_type, rt.tag
        HAVING COUNT(*) >= 3  -- Minimum occurrences for pattern detection
    )
    SELECT 
        'usage'::VARCHAR(30) as pattern_type,
        jsonb_build_object(
            'resource_type', ra.resource_type,
            'tag', ra.tag,
            'usage_frequency', ra.tag_usage
        ) as pattern_expression,
        LEAST(ra.tag_usage * 10.0, 100.0)::DECIMAL(5,2) as confidence_score,
        ra.tag_usage::INTEGER as occurrence_count,
        ARRAY[ra.tag] as suggested_tags
    FROM resource_analysis ra
    ORDER BY ra.tag_usage DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive auto-tagging metrics
CREATE OR REPLACE FUNCTION get_auto_tagging_metrics(
    p_time_window_hours INTEGER DEFAULT 24
) RETURNS TABLE(
    total_executions BIGINT,
    successful_executions BIGINT,
    failed_executions BIGINT,
    avg_execution_time DECIMAL,
    total_rules INTEGER,
    active_rules INTEGER,
    tags_added_total BIGINT,
    tags_removed_total BIGINT,
    conflicts_detected BIGINT,
    conflicts_resolved BIGINT,
    top_performing_rule JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Execution metrics
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE array_length(errors::text[], 1) IS NULL OR array_length(errors::text[], 1) = 0) as successful_executions,
        COUNT(*) FILTER (WHERE array_length(errors::text[], 1) > 0) as failed_executions,
        AVG(execution_time) as avg_execution_time,
        
        -- Rule metrics
        (SELECT COUNT(*)::INTEGER FROM epic17_auto_tagging_rules) as total_rules,
        (SELECT COUNT(*)::INTEGER FROM epic17_auto_tagging_rules WHERE enabled = TRUE) as active_rules,
        
        -- Tag metrics
        COALESCE(SUM(tags_added), 0) as tags_added_total,
        COALESCE(SUM(tags_removed), 0) as tags_removed_total,
        
        -- Conflict metrics
        (SELECT COUNT(*) FROM epic17_tagging_conflicts 
         WHERE detected_at >= NOW() - (p_time_window_hours || ' hours')::INTERVAL) as conflicts_detected,
        (SELECT COUNT(*) FROM epic17_tagging_conflicts 
         WHERE resolved = TRUE AND detected_at >= NOW() - (p_time_window_hours || ' hours')::INTERVAL) as conflicts_resolved,
        
        -- Top performing rule
        (SELECT jsonb_build_object(
            'rule_id', rule_id,
            'rule_name', rule_name,
            'success_rate', success_rate,
            'execution_count', execution_count
        ) FROM epic17_auto_tagging_rules 
        WHERE enabled = TRUE AND execution_count > 0
        ORDER BY success_rate DESC, execution_count DESC 
        LIMIT 1) as top_performing_rule
        
    FROM epic17_auto_tagging_executions
    WHERE executed_at >= NOW() - (p_time_window_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old execution data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_tagging_data(
    p_retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    total_deleted INTEGER := 0;
BEGIN
    -- Delete old executions and their related data
    DELETE FROM epic17_auto_tagging_executions 
    WHERE executed_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    -- Delete old patterns that are no longer valid
    DELETE FROM epic17_tagging_patterns 
    WHERE status = 'deprecated' 
        AND discovered_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    -- Delete old suggestions that were never implemented
    DELETE FROM epic17_rule_suggestions 
    WHERE status IN ('rejected', 'archived', 'expired')
        AND created_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'auto_tagging', 'cleanup_old_data', 'system', total_deleted, true
    );
    
    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql;

-- Insert default auto-tagging rules
INSERT INTO epic17_auto_tagging_rules (
    rule_id, rule_name, description, rule_type, conditions, actions,
    target_resource_types, execution_mode, created_by
) VALUES
(
    gen_random_uuid(),
    'Development Environment API Keys',
    'Automatically tag API keys used in development environments',
    'characteristic_based',
    '[{
        "conditionId": "env_condition",
        "conditionType": "property",
        "field": "environment",
        "operator": "equals",
        "value": "development",
        "weight": 1.0,
        "required": true,
        "negated": false
    }]',
    '[{
        "actionId": "add_dev_tag",
        "actionType": "add_tag",
        "tags": ["development", "non-production"],
        "overrideExisting": false,
        "validateTags": true
    }]',
    '["api_key"]',
    'immediate',
    'system'
),
(
    gen_random_uuid(),
    'High Usage API Keys',
    'Tag API keys with high usage patterns',
    'usage_based',
    '[{
        "conditionId": "usage_condition",
        "conditionType": "usage",
        "field": "requests_per_day",
        "operator": "greater_than",
        "value": 10000,
        "weight": 1.0,
        "required": true,
        "negated": false
    }]',
    '[{
        "actionId": "add_high_usage_tag",
        "actionType": "add_tag",
        "tags": ["high-usage", "monitor-closely"],
        "overrideExisting": false,
        "validateTags": true
    }]',
    '["api_key"]',
    'immediate',
    'system'
),
(
    gen_random_uuid(),
    'Contractor User Permissions',
    'Tag permissions assigned to contractor users',
    'relationship_based',
    '[{
        "conditionId": "contractor_condition",
        "conditionType": "relationship",
        "field": "user.user_type",
        "operator": "equals",
        "value": "contractor",
        "weight": 1.0,
        "required": true,
        "negated": false
    }]',
    '[{
        "actionId": "add_contractor_tag",
        "actionType": "add_tag",
        "tags": ["contractor-access", "time-limited"],
        "overrideExisting": false,
        "validateTags": true
    }]',
    '["permission"]',
    'immediate',
    'system'
),
(
    gen_random_uuid(),
    'Expired Resource Cleanup',
    'Tag expired resources for cleanup',
    'time_based',
    '[{
        "conditionId": "expired_condition",
        "conditionType": "property",
        "field": "expires_at",
        "operator": "less_than",
        "value": "NOW()",
        "weight": 1.0,
        "required": true,
        "negated": false
    }]',
    '[{
        "actionId": "add_expired_tag",
        "actionType": "add_tag",
        "tags": ["expired", "cleanup-candidate"],
        "overrideExisting": false,
        "validateTags": true
    }]',
    '["api_key", "permission", "user"]',
    'deferred',
    'system'
)
ON CONFLICT (rule_id) DO NOTHING;

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_auto_rules_performance 
    ON epic17_auto_tagging_rules (enabled, priority, success_rate) 
    WHERE enabled = TRUE AND execution_count > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_executions_recent_performance 
    ON epic17_auto_tagging_executions (executed_at DESC, execution_time) 
    WHERE executed_at >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_patterns_confident 
    ON epic17_tagging_patterns (confidence_score DESC, occurrence_count DESC) 
    WHERE status = 'active' AND confidence_score >= 0.7;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_conflicts_urgent 
    ON epic17_tagging_conflicts (severity, detected_at DESC) 
    WHERE resolved = FALSE AND severity IN ('high', 'critical');

-- Create comprehensive auto-tagging dashboard view
CREATE VIEW epic17_auto_tagging_dashboard AS
SELECT 
    -- Rule metrics
    (SELECT COUNT(*) FROM epic17_auto_tagging_rules WHERE enabled = TRUE) as active_rules,
    (SELECT AVG(success_rate) FROM epic17_auto_tagging_rules WHERE enabled = TRUE) as avg_rule_success_rate,
    
    -- Execution metrics (last 24 hours)
    (SELECT COUNT(*) FROM epic17_auto_tagging_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as executions_today,
    (SELECT AVG(execution_time) FROM epic17_auto_tagging_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as avg_execution_time_today,
    
    -- Tagging metrics (last 24 hours)
    (SELECT SUM(tags_added) FROM epic17_auto_tagging_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as tags_added_today,
    (SELECT SUM(tags_removed) FROM epic17_auto_tagging_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as tags_removed_today,
    (SELECT SUM(resources_processed) FROM epic17_auto_tagging_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as resources_processed_today,
    
    -- Pattern detection
    (SELECT COUNT(*) FROM epic17_tagging_patterns WHERE status = 'active') as active_patterns,
    (SELECT COUNT(*) FROM epic17_rule_suggestions WHERE status = 'pending') as pending_suggestions,
    
    -- Conflict management
    (SELECT COUNT(*) FROM epic17_tagging_conflicts WHERE resolved = FALSE) as unresolved_conflicts,
    (SELECT COUNT(*) FROM epic17_tagging_conflicts WHERE detected_at >= NOW() - INTERVAL '24 hours') as conflicts_detected_today,
    
    -- Machine learning
    (SELECT COUNT(*) FROM epic17_tagging_ml_models WHERE status = 'active') as active_ml_models,
    
    -- Performance indicators
    (SELECT COUNT(*) FROM epic17_auto_tagging_executions WHERE executed_at >= NOW() - INTERVAL '1 hour' AND array_length(errors::text[], 1) > 0) as recent_errors;

-- Add table comments for documentation
COMMENT ON TABLE epic17_auto_tagging_rules IS 'Auto-tagging rule definitions and configuration for Epic 17';
COMMENT ON TABLE epic17_auto_tagging_executions IS 'Auto-tagging execution history and tracking';
COMMENT ON TABLE epic17_resource_tagging_results IS 'Detailed results for individual resource tagging operations';
COMMENT ON TABLE epic17_tagging_patterns IS 'Detected patterns for intelligent auto-tagging';
COMMENT ON TABLE epic17_rule_suggestions IS 'Rule suggestions generated from pattern analysis';
COMMENT ON TABLE epic17_tagging_conflicts IS 'Tag conflict tracking and resolution';
COMMENT ON TABLE epic17_tagging_ml_models IS 'Machine learning model management for auto-tagging';
COMMENT ON TABLE epic17_tagging_performance_metrics IS 'Performance metrics and analytics for auto-tagging system';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_tagging_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_auto_tagging_rules_timestamp
    BEFORE UPDATE ON epic17_auto_tagging_rules
    FOR EACH ROW EXECUTE FUNCTION update_epic17_tagging_timestamp();

CREATE TRIGGER update_epic17_tagging_ml_models_timestamp
    BEFORE UPDATE ON epic17_tagging_ml_models
    FOR EACH ROW EXECUTE FUNCTION update_epic17_tagging_timestamp();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Auto-Tagging database schema created successfully';
    RAISE NOTICE '📊 Tables created: 8 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 5 management functions';
    RAISE NOTICE '📋 Default rules: 4 auto-tagging rules configured';
    RAISE NOTICE '⚡ Features: Pattern detection, ML integration, conflict resolution, performance tracking';
    RAISE NOTICE '🤖 Intelligence: Rule suggestions, pattern analysis, automated tagging';
    RAISE NOTICE '📈 Monitoring: Comprehensive metrics, conflict tracking, performance analytics';
    RAISE NOTICE '🚀 Auto-tagging system ready for Epic 17 API management';
END $$;