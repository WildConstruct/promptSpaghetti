-- Epic 17 Toggle Status Controls Database Schema
-- Task: E17-1753114396765-6CF13D - Develop toggle status controls
-- 
-- Creates comprehensive toggle status control infrastructure for Epic 17 API Management System
-- including toggle definitions, change tracking, approval workflows, bulk operations,
-- and real-time status management with comprehensive audit trails and monitoring.

-- Toggle definitions and configuration
CREATE TABLE IF NOT EXISTS epic17_toggle_definitions (
    id SERIAL PRIMARY KEY,
    toggle_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- feature, system, api_endpoint, maintenance, security, compliance, experimental, user_interface
    toggle_type VARCHAR(30) NOT NULL, -- boolean, percentage, multivariate, conditional, time_based, geographic, user_based, load_based
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical, emergency
    
    -- Current state
    current_status VARCHAR(20) DEFAULT 'disabled', -- enabled, disabled, partial, maintenance, deprecated, experimental, rollout
    current_value JSONB DEFAULT 'false'::jsonb, -- Current toggle value (can be boolean, number, string, object)
    is_enabled BOOLEAN DEFAULT FALSE,
    
    -- Configuration
    default_value JSONB DEFAULT 'false'::jsonb, -- Default toggle value
    allowed_values JSONB DEFAULT '[]'::jsonb, -- Array of allowed values
    validation_rules JSONB DEFAULT '[]'::jsonb, -- Array of validation rule objects
    dependencies JSONB DEFAULT '[]'::jsonb, -- Array of toggle dependency objects
    
    -- Metadata
    owner VARCHAR(255) NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb, -- Array of tags for categorization
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Scheduling and conditions
    scheduled_changes JSONB DEFAULT '[]'::jsonb, -- Array of scheduled change objects
    conditions JSONB DEFAULT '[]'::jsonb, -- Array of conditional logic objects
    
    -- Safety and validation
    safety_checks JSONB DEFAULT '[]'::jsonb, -- Array of safety check configurations
    requires_approval BOOLEAN DEFAULT FALSE,
    can_rollback BOOLEAN DEFAULT TRUE,
    
    -- Usage metrics
    usage_metrics JSONB DEFAULT '{}'::jsonb, -- Usage and performance metrics
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Lifecycle tracking
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_toggles_toggle_id (toggle_id),
    INDEX idx_epic17_toggles_category (category),
    INDEX idx_epic17_toggles_status (current_status),
    INDEX idx_epic17_toggles_priority (priority),
    INDEX idx_epic17_toggles_owner (owner),
    INDEX idx_epic17_toggles_environment (environment),
    INDEX idx_epic17_toggles_enabled (is_enabled),
    INDEX idx_epic17_toggles_last_modified (last_modified),
    INDEX idx_epic17_toggles_tags_gin (tags) USING gin,
    INDEX idx_epic17_toggles_active (category, current_status, priority) WHERE is_enabled = TRUE,
    INDEX idx_epic17_toggles_name_category (name, category),
    INDEX idx_epic17_toggles_recent (created_at DESC) WHERE created_at >= NOW() - INTERVAL '30 days',
    
    -- Unique constraints
    UNIQUE(name, category)
);

-- Toggle change history and audit trail
CREATE TABLE IF NOT EXISTS epic17_toggle_history (
    id SERIAL PRIMARY KEY,
    history_id UUID UNIQUE NOT NULL,
    toggle_id VARCHAR(255) NOT NULL,
    change_id VARCHAR(255) NOT NULL,
    
    -- Change details
    previous_state JSONB NOT NULL, -- Complete previous state
    new_state JSONB NOT NULL, -- Complete new state
    change_type VARCHAR(30) NOT NULL DEFAULT 'status_update', -- status_update, value_change, configuration_change, bulk_operation
    
    -- Change metadata
    reason TEXT NOT NULL,
    justification TEXT,
    impact_assessment TEXT,
    
    -- Change tracking
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_method VARCHAR(30) DEFAULT 'manual', -- manual, automated, scheduled, bulk, emergency
    
    -- Rollback information
    rollback_available BOOLEAN DEFAULT TRUE,
    rollback_data JSONB DEFAULT '{}'::jsonb,
    rollback_deadline TIMESTAMP WITH TIME ZONE,
    rolled_back BOOLEAN DEFAULT FALSE,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    rolled_back_by VARCHAR(255),
    
    -- Validation and approval
    validation_passed BOOLEAN DEFAULT TRUE,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance tracking
    execution_time INTEGER DEFAULT 0, -- milliseconds
    affected_systems JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes
    INDEX idx_epic17_history_history_id (history_id),
    INDEX idx_epic17_history_toggle_id (toggle_id),
    INDEX idx_epic17_history_change_id (change_id),
    INDEX idx_epic17_history_changed_by (changed_by),
    INDEX idx_epic17_history_changed_at (changed_at),
    INDEX idx_epic17_history_change_type (change_type),
    INDEX idx_epic17_history_rollback_available (rollback_available, rollback_deadline),
    INDEX idx_epic17_history_recent (toggle_id, changed_at DESC) WHERE changed_at >= NOW() - INTERVAL '90 days',
    
    FOREIGN KEY (toggle_id) REFERENCES epic17_toggle_definitions(toggle_id) ON DELETE CASCADE
);

-- Toggle change requests and approval workflow
CREATE TABLE IF NOT EXISTS epic17_toggle_change_requests (
    id SERIAL PRIMARY KEY,
    change_id UUID UNIQUE NOT NULL,
    toggle_id VARCHAR(255) NOT NULL,
    request_type VARCHAR(30) NOT NULL, -- enable, disable, update_value, schedule, delete
    
    -- Requested changes
    new_status VARCHAR(20),
    new_value JSONB,
    reason TEXT NOT NULL,
    justification TEXT NOT NULL,
    
    -- Request metadata
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) NOT NULL,
    urgent BOOLEAN DEFAULT FALSE,
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, withdrawn, expired
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_comments TEXT,
    approval_conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Validation and safety
    safety_checks_passed BOOLEAN DEFAULT FALSE,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    validation_warnings JSONB DEFAULT '[]'::jsonb,
    pre_change_validation JSONB DEFAULT '{}'::jsonb,
    post_change_validation JSONB DEFAULT '{}'::jsonb,
    
    -- Execution tracking
    execution_status VARCHAR(20) DEFAULT 'pending', -- pending, executing, completed, failed, rolled_back
    executed_by VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_details JSONB DEFAULT '{}'::jsonb,
    execution_errors JSONB DEFAULT '[]'::jsonb,
    
    -- Rollback information
    rollback_available BOOLEAN DEFAULT TRUE,
    rollback_deadline TIMESTAMP WITH TIME ZONE,
    rollback_data JSONB DEFAULT '{}'::jsonb,
    
    -- Scheduling
    scheduled_execution TIMESTAMP WITH TIME ZONE,
    auto_approve BOOLEAN DEFAULT FALSE,
    
    -- Request lifecycle
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_change_requests_change_id (change_id),
    INDEX idx_epic17_change_requests_toggle_id (toggle_id),
    INDEX idx_epic17_change_requests_requested_by (requested_by),
    INDEX idx_epic17_change_requests_approval_status (approval_status),
    INDEX idx_epic17_change_requests_execution_status (execution_status),
    INDEX idx_epic17_change_requests_priority (priority),
    INDEX idx_epic17_change_requests_scheduled (scheduled_execution),
    INDEX idx_epic17_change_requests_pending (approval_status, expires_at) WHERE approval_status = 'pending',
    INDEX idx_epic17_change_requests_urgent (urgent, requested_at DESC) WHERE urgent = TRUE,
    
    FOREIGN KEY (toggle_id) REFERENCES epic17_toggle_definitions(toggle_id) ON DELETE CASCADE
);

-- Toggle bulk operations management
CREATE TABLE IF NOT EXISTS epic17_toggle_bulk_operations (
    id SERIAL PRIMARY KEY,
    operation_id UUID UNIQUE NOT NULL,
    operation_type VARCHAR(30) NOT NULL, -- bulk_enable, bulk_disable, bulk_update, bulk_delete
    toggle_ids JSONB NOT NULL, -- Array of toggle IDs to operate on
    
    -- Operation parameters
    parameters JSONB DEFAULT '{}'::jsonb, -- Operation-specific parameters
    reason TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking
    total_toggles INTEGER NOT NULL,
    processed_toggles INTEGER DEFAULT 0,
    successful_toggles INTEGER DEFAULT 0,
    failed_toggles INTEGER DEFAULT 0,
    
    -- Status and results
    operation_status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, partially_failed, failed, cancelled
    results JSONB DEFAULT '[]'::jsonb, -- Array of individual operation results
    errors JSONB DEFAULT '[]'::jsonb, -- Array of error messages
    warnings JSONB DEFAULT '[]'::jsonb, -- Array of warning messages
    
    -- Execution tracking
    initiated_by VARCHAR(255) NOT NULL,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_duration INTEGER, -- milliseconds
    
    -- Validation and safety
    pre_operation_validation JSONB DEFAULT '{}'::jsonb,
    post_operation_validation JSONB DEFAULT '{}'::jsonb,
    safety_checks_performed BOOLEAN DEFAULT FALSE,
    
    -- Rollback capabilities
    rollback_available BOOLEAN DEFAULT TRUE,
    rollback_data JSONB DEFAULT '{}'::jsonb,
    rollback_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Progress monitoring
    progress_percentage INTEGER DEFAULT 0,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    current_phase VARCHAR(50) DEFAULT 'pending',
    
    -- Indexes
    INDEX idx_epic17_bulk_ops_operation_id (operation_id),
    INDEX idx_epic17_bulk_ops_type (operation_type),
    INDEX idx_epic17_bulk_ops_status (operation_status),
    INDEX idx_epic17_bulk_ops_initiated_by (initiated_by),
    INDEX idx_epic17_bulk_ops_initiated_at (initiated_at),
    INDEX idx_epic17_bulk_ops_scheduled (scheduled_time),
    INDEX idx_epic17_bulk_ops_active (operation_status) WHERE operation_status IN ('pending', 'running'),
    INDEX idx_epic17_bulk_ops_recent (initiated_at DESC) WHERE initiated_at >= NOW() - INTERVAL '30 days'
);

-- Toggle dependency management
CREATE TABLE IF NOT EXISTS epic17_toggle_dependencies (
    id SERIAL PRIMARY KEY,
    dependency_id UUID UNIQUE NOT NULL,
    source_toggle_id VARCHAR(255) NOT NULL,
    dependent_toggle_id VARCHAR(255) NOT NULL,
    
    -- Dependency configuration
    dependency_type VARCHAR(30) NOT NULL, -- requires, conflicts, suggests, enables, disables, blocks
    dependency_condition TEXT, -- Conditional logic for dependency
    description TEXT NOT NULL,
    
    -- Enforcement settings
    enforced BOOLEAN DEFAULT TRUE,
    enforcement_level VARCHAR(20) DEFAULT 'strict', -- strict, warning, advisory
    
    -- Validation rules
    validation_rules JSONB DEFAULT '[]'::jsonb, -- Array of validation rule objects
    custom_validation_script TEXT,
    
    -- Lifecycle
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Dependency metadata
    priority INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    
    -- Indexes
    INDEX idx_epic17_dependencies_dependency_id (dependency_id),
    INDEX idx_epic17_dependencies_source (source_toggle_id),
    INDEX idx_epic17_dependencies_dependent (dependent_toggle_id),
    INDEX idx_epic17_dependencies_type (dependency_type),
    INDEX idx_epic17_dependencies_active (is_active, enforced),
    INDEX idx_epic17_dependencies_created_by (created_by),
    INDEX idx_epic17_dependencies_bidirectional (source_toggle_id, dependent_toggle_id),
    
    -- Unique constraint to prevent duplicate dependencies
    UNIQUE(source_toggle_id, dependent_toggle_id, dependency_type),
    
    FOREIGN KEY (source_toggle_id) REFERENCES epic17_toggle_definitions(toggle_id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_toggle_id) REFERENCES epic17_toggle_definitions(toggle_id) ON DELETE CASCADE
);

-- Toggle usage analytics and metrics
CREATE TABLE IF NOT EXISTS epic17_toggle_usage_analytics (
    id SERIAL PRIMARY KEY,
    analytics_id UUID UNIQUE NOT NULL,
    toggle_id VARCHAR(255) NOT NULL,
    measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Usage metrics
    access_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    min_response_time INTEGER DEFAULT 0,
    max_response_time INTEGER DEFAULT 0,
    percentile_95_response_time INTEGER DEFAULT 0,
    
    -- Geographic distribution
    geographic_data JSONB DEFAULT '{}'::jsonb, -- Geographic usage distribution
    user_agent_data JSONB DEFAULT '{}'::jsonb, -- User agent statistics
    
    -- Error tracking
    error_rate DECIMAL(5,2) DEFAULT 0,
    error_types JSONB DEFAULT '{}'::jsonb, -- Error type breakdown
    warnings_count INTEGER DEFAULT 0,
    
    -- Feature adoption metrics
    adoption_rate DECIMAL(5,2) DEFAULT 0,
    feature_utilization DECIMAL(5,2) DEFAULT 0,
    user_engagement_score DECIMAL(5,2) DEFAULT 0,
    
    -- Time-based patterns
    peak_usage_hour INTEGER,
    peak_usage_day VARCHAR(10),
    usage_pattern JSONB DEFAULT '{}'::jsonb, -- Hourly/daily usage patterns
    
    -- Comparison metrics
    period_comparison JSONB DEFAULT '{}'::jsonb, -- Comparison with previous periods
    baseline_metrics JSONB DEFAULT '{}'::jsonb, -- Baseline performance metrics
    
    -- Indexes
    INDEX idx_epic17_analytics_analytics_id (analytics_id),
    INDEX idx_epic17_analytics_toggle_id (toggle_id),
    INDEX idx_epic17_analytics_timestamp (measurement_timestamp),
    INDEX idx_epic17_analytics_access_count (access_count),
    INDEX idx_epic17_analytics_response_time (average_response_time),
    INDEX idx_epic17_analytics_error_rate (error_rate),
    INDEX idx_epic17_analytics_recent (toggle_id, measurement_timestamp DESC) WHERE measurement_timestamp >= NOW() - INTERVAL '7 days',
    INDEX idx_epic17_analytics_daily (toggle_id, DATE(measurement_timestamp)),
    
    FOREIGN KEY (toggle_id) REFERENCES epic17_toggle_definitions(toggle_id) ON DELETE CASCADE
);

-- Toggle notification and alerting configuration
CREATE TABLE IF NOT EXISTS epic17_toggle_notifications (
    id SERIAL PRIMARY KEY,
    notification_id UUID UNIQUE NOT NULL,
    toggle_id VARCHAR(255) NOT NULL,
    
    -- Notification configuration
    notification_type VARCHAR(30) NOT NULL, -- status_change, approval_required, error_threshold, usage_spike, dependency_violation
    trigger_conditions JSONB NOT NULL, -- Conditions that trigger notifications
    
    -- Recipients and channels
    notification_channels JSONB DEFAULT '[]'::jsonb, -- Array of notification channels (email, slack, webhook)
    recipients JSONB DEFAULT '[]'::jsonb, -- Array of recipient identifiers
    escalation_levels JSONB DEFAULT '[]'::jsonb, -- Escalation configuration
    
    -- Message configuration
    message_template TEXT,
    custom_message TEXT,
    severity_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Timing and frequency
    notification_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, hourly, daily, weekly
    quiet_hours JSONB DEFAULT '{}'::jsonb, -- Quiet hours configuration
    max_notifications_per_hour INTEGER DEFAULT 10,
    
    -- Status and lifecycle
    is_enabled BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    
    -- Configuration metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic17_notifications_notification_id (notification_id),
    INDEX idx_epic17_notifications_toggle_id (toggle_id),
    INDEX idx_epic17_notifications_type (notification_type),
    INDEX idx_epic17_notifications_enabled (is_enabled),
    INDEX idx_epic17_notifications_severity (severity_level),
    INDEX idx_epic17_notifications_last_triggered (last_triggered),
    
    FOREIGN KEY (toggle_id) REFERENCES epic17_toggle_definitions(toggle_id) ON DELETE CASCADE
);

-- Toggle configuration templates for common patterns
CREATE TABLE IF NOT EXISTS epic17_toggle_templates (
    id SERIAL PRIMARY KEY,
    template_id UUID UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Template configuration
    category VARCHAR(50) NOT NULL,
    toggle_type VARCHAR(30) NOT NULL,
    default_priority VARCHAR(20) NOT NULL,
    
    -- Template definition
    template_config JSONB NOT NULL, -- Complete toggle configuration template
    validation_rules JSONB DEFAULT '[]'::jsonb,
    safety_checks JSONB DEFAULT '[]'::jsonb,
    
    -- Usage and metadata
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Template lifecycle
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Indexes
    INDEX idx_epic17_templates_template_id (template_id),
    INDEX idx_epic17_templates_name (template_name),
    INDEX idx_epic17_templates_category (category),
    INDEX idx_epic17_templates_public (is_public),
    INDEX idx_epic17_templates_usage (usage_count DESC),
    INDEX idx_epic17_templates_tags_gin (tags) USING gin,
    
    UNIQUE(template_name)
);

-- Create comprehensive functions for toggle management

-- Function to get toggle status with dependencies
CREATE OR REPLACE FUNCTION get_toggle_with_dependencies(
    p_toggle_id VARCHAR(255)
) RETURNS TABLE(
    toggle_id VARCHAR(255),
    name VARCHAR(255),
    current_status VARCHAR(20),
    current_value JSONB,
    dependencies JSONB,
    dependents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        td.toggle_id,
        td.name,
        td.current_status,
        td.current_value,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'toggleId', dependent_toggle_id,
                    'dependencyType', dependency_type,
                    'condition', dependency_condition,
                    'enforced', enforced
                )
            ) FROM epic17_toggle_dependencies 
             WHERE source_toggle_id = td.toggle_id AND is_active = true),
            '[]'::jsonb
        ) as dependencies,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'toggleId', source_toggle_id,
                    'dependencyType', dependency_type,
                    'condition', dependency_condition,
                    'enforced', enforced
                )
            ) FROM epic17_toggle_dependencies 
             WHERE dependent_toggle_id = td.toggle_id AND is_active = true),
            '[]'::jsonb
        ) as dependents
    FROM epic17_toggle_definitions td
    WHERE td.toggle_id = p_toggle_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate toggle dependencies before change
CREATE OR REPLACE FUNCTION validate_toggle_dependencies(
    p_toggle_id VARCHAR(255),
    p_new_status VARCHAR(20),
    p_new_value JSONB
) RETURNS TABLE(
    is_valid BOOLEAN,
    errors JSONB,
    warnings JSONB
) AS $$
DECLARE
    dependency_record RECORD;
    dependent_toggle RECORD;
    validation_errors JSONB := '[]'::jsonb;
    validation_warnings JSONB := '[]'::jsonb;
    is_valid_result BOOLEAN := true;
BEGIN
    -- Check dependencies (what this toggle depends on)
    FOR dependency_record IN 
        SELECT td.*, dt.current_status, dt.current_value, dt.name as dependent_name
        FROM epic17_toggle_dependencies td
        JOIN epic17_toggle_definitions dt ON td.dependent_toggle_id = dt.toggle_id
        WHERE td.source_toggle_id = p_toggle_id AND td.is_active = true AND td.enforced = true
    LOOP
        -- Check 'requires' dependency
        IF dependency_record.dependency_type = 'requires' AND p_new_status = 'enabled' THEN
            IF dependency_record.current_status != 'enabled' THEN
                validation_errors := validation_errors || jsonb_build_object(
                    'type', 'dependency_violation',
                    'message', format('Toggle %s requires %s to be enabled', p_toggle_id, dependency_record.dependent_name)
                );
                is_valid_result := false;
            END IF;
        END IF;
        
        -- Check 'conflicts' dependency
        IF dependency_record.dependency_type = 'conflicts' AND p_new_status = 'enabled' THEN
            IF dependency_record.current_status = 'enabled' THEN
                validation_errors := validation_errors || jsonb_build_object(
                    'type', 'dependency_violation',
                    'message', format('Toggle %s conflicts with %s which is currently enabled', p_toggle_id, dependency_record.dependent_name)
                );
                is_valid_result := false;
            END IF;
        END IF;
    END LOOP;
    
    -- Check dependents (what depends on this toggle)
    FOR dependency_record IN 
        SELECT td.*, dt.current_status, dt.current_value, dt.name as source_name
        FROM epic17_toggle_dependencies td
        JOIN epic17_toggle_definitions dt ON td.source_toggle_id = dt.toggle_id
        WHERE td.dependent_toggle_id = p_toggle_id AND td.is_active = true AND td.enforced = true
    LOOP
        -- Check if disabling this toggle will break dependencies
        IF dependency_record.dependency_type = 'requires' AND p_new_status != 'enabled' THEN
            IF dependency_record.current_status = 'enabled' THEN
                validation_warnings := validation_warnings || jsonb_build_object(
                    'type', 'dependency_warning',
                    'message', format('Disabling %s may affect %s which depends on it', p_toggle_id, dependency_record.source_name)
                );
            END IF;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT is_valid_result, validation_errors, validation_warnings;
END;
$$ LANGUAGE plpgsql;

-- Function to get toggle usage summary
CREATE OR REPLACE FUNCTION get_toggle_usage_summary(
    p_toggle_id VARCHAR(255),
    p_time_window_hours INTEGER DEFAULT 24
) RETURNS TABLE(
    total_requests BIGINT,
    unique_users BIGINT,
    avg_response_time DECIMAL(10,2),
    error_rate DECIMAL(5,2),
    peak_usage TIMESTAMP WITH TIME ZONE,
    usage_trend VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(tua.total_requests)::BIGINT as total_requests,
        SUM(tua.unique_users)::BIGINT as unique_users,
        AVG(tua.average_response_time)::DECIMAL(10,2) as avg_response_time,
        AVG(tua.error_rate)::DECIMAL(5,2) as error_rate,
        (SELECT measurement_timestamp FROM epic17_toggle_usage_analytics 
         WHERE toggle_id = p_toggle_id 
         ORDER BY total_requests DESC LIMIT 1) as peak_usage,
        CASE 
            WHEN COUNT(*) >= 2 THEN
                CASE 
                    WHEN (SELECT AVG(total_requests) FROM epic17_toggle_usage_analytics 
                          WHERE toggle_id = p_toggle_id AND measurement_timestamp >= NOW() - (p_time_window_hours/2 || ' hours')::INTERVAL) >
                         (SELECT AVG(total_requests) FROM epic17_toggle_usage_analytics 
                          WHERE toggle_id = p_toggle_id AND measurement_timestamp >= NOW() - (p_time_window_hours || ' hours')::INTERVAL
                            AND measurement_timestamp < NOW() - (p_time_window_hours/2 || ' hours')::INTERVAL)
                    THEN 'increasing'
                    WHEN (SELECT AVG(total_requests) FROM epic17_toggle_usage_analytics 
                          WHERE toggle_id = p_toggle_id AND measurement_timestamp >= NOW() - (p_time_window_hours/2 || ' hours')::INTERVAL) <
                         (SELECT AVG(total_requests) FROM epic17_toggle_usage_analytics 
                          WHERE toggle_id = p_toggle_id AND measurement_timestamp >= NOW() - (p_time_window_hours || ' hours')::INTERVAL
                            AND measurement_timestamp < NOW() - (p_time_window_hours/2 || ' hours')::INTERVAL)
                    THEN 'decreasing'
                    ELSE 'stable'
                END
            ELSE 'insufficient_data'
        END::VARCHAR(20) as usage_trend
    FROM epic17_toggle_usage_analytics tua
    WHERE tua.toggle_id = p_toggle_id 
      AND tua.measurement_timestamp >= NOW() - (p_time_window_hours || ' hours')::INTERVAL
    GROUP BY tua.toggle_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old toggle history
CREATE OR REPLACE FUNCTION cleanup_toggle_history(
    p_retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old history records
    DELETE FROM epic17_toggle_history 
    WHERE changed_at < NOW() - (p_retention_days || ' days')::INTERVAL
      AND rollback_available = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup operation
    INSERT INTO epic17_admin_tool_usage (
        usage_id, tool_name, action, used_by, records_affected, success
    ) VALUES (
        gen_random_uuid(), 'toggle_status_controls', 'cleanup_history', 'system', deleted_count, true
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default toggle templates for common patterns
INSERT INTO epic17_toggle_templates (
    template_id, template_name, description, category, toggle_type, default_priority,
    template_config, validation_rules, safety_checks, created_by
) VALUES 
(
    gen_random_uuid(),
    'Feature Flag - Basic Boolean',
    'Simple on/off feature flag template',
    'feature',
    'boolean',
    'medium',
    '{"defaultValue": false, "allowedValues": [true, false], "requiresApproval": false}'::jsonb,
    '[{"ruleType": "format", "validationExpression": "typeof value === \"boolean\"", "errorMessage": "Value must be boolean"}]'::jsonb,
    '[{"checkId": "basic_validation", "checkName": "Basic Boolean Check", "checkType": "dependency", "enabled": true, "required": true}]'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'API Endpoint Control',
    'Template for controlling API endpoint availability',
    'api_endpoint',
    'boolean',
    'high',
    '{"defaultValue": true, "allowedValues": [true, false], "requiresApproval": true}'::jsonb,
    '[{"ruleType": "dependency", "validationExpression": "checkApiDependencies()", "errorMessage": "API dependencies not satisfied"}]'::jsonb,
    '[{"checkId": "api_impact", "checkName": "API Impact Assessment", "checkType": "performance", "enabled": true, "required": true}]'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'Percentage Rollout',
    'Template for gradual feature rollout by percentage',
    'feature',
    'percentage',
    'medium',
    '{"defaultValue": 0, "allowedValues": "range", "minValue": 0, "maxValue": 100, "requiresApproval": false}'::jsonb,
    '[{"ruleType": "range", "parameters": {"min": 0, "max": 100}, "errorMessage": "Percentage must be between 0 and 100"}]'::jsonb,
    '[{"checkId": "rollout_impact", "checkName": "Rollout Impact Check", "checkType": "business", "enabled": true, "required": false}]'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'Maintenance Mode Control',
    'Template for system maintenance mode toggles',
    'maintenance',
    'boolean',
    'critical',
    '{"defaultValue": false, "allowedValues": [true, false], "requiresApproval": true}'::jsonb,
    '[{"ruleType": "custom", "validationExpression": "validateMaintenanceWindow()", "errorMessage": "Maintenance mode can only be enabled during approved windows"}]'::jsonb,
    '[{"checkId": "maintenance_validation", "checkName": "Maintenance Window Check", "checkType": "business", "enabled": true, "required": true}]'::jsonb,
    'system'
),
(
    gen_random_uuid(),
    'Security Feature Control',
    'Template for security-related feature toggles',
    'security',
    'boolean',
    'critical',
    '{"defaultValue": true, "allowedValues": [true, false], "requiresApproval": true}'::jsonb,
    '[{"ruleType": "security", "validationExpression": "validateSecurityImpact()", "errorMessage": "Security validation failed"}]'::jsonb,
    '[{"checkId": "security_impact", "checkName": "Security Impact Assessment", "checkType": "security", "enabled": true, "required": true}]'::jsonb,
    'system'
);

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_toggles_performance 
    ON epic17_toggle_definitions (category, current_status, priority, last_modified DESC) 
    WHERE is_enabled = true AND created_at >= NOW() - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_history_performance 
    ON epic17_toggle_history (toggle_id, changed_at DESC, rollback_available) 
    WHERE changed_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_analytics_performance 
    ON epic17_toggle_usage_analytics (toggle_id, measurement_timestamp DESC, access_count) 
    WHERE measurement_timestamp >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic17_change_requests_active 
    ON epic17_toggle_change_requests (approval_status, priority, requested_at DESC) 
    WHERE approval_status IN ('pending', 'approved') AND expires_at > NOW();

-- Create comprehensive toggle status dashboard view
CREATE VIEW epic17_toggle_status_dashboard AS
SELECT 
    -- Toggle statistics
    (SELECT COUNT(*) FROM epic17_toggle_definitions) as total_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE is_enabled = true) as enabled_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE current_status = 'disabled') as disabled_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE current_status = 'maintenance') as maintenance_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE current_status = 'experimental') as experimental_toggles,
    
    -- Category breakdown
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE category = 'feature') as feature_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE category = 'system') as system_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE category = 'api_endpoint') as api_endpoint_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE category = 'security') as security_toggles,
    
    -- Priority breakdown
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE priority = 'critical') as critical_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE priority = 'high') as high_priority_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE priority = 'medium') as medium_priority_toggles,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE priority = 'low') as low_priority_toggles,
    
    -- Recent activity
    (SELECT COUNT(*) FROM epic17_toggle_history WHERE changed_at >= NOW() - INTERVAL '24 hours') as changes_today,
    (SELECT COUNT(*) FROM epic17_toggle_history WHERE changed_at >= NOW() - INTERVAL '7 days') as changes_this_week,
    (SELECT COUNT(*) FROM epic17_toggle_change_requests WHERE approval_status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM epic17_toggle_change_requests WHERE urgent = true AND approval_status = 'pending') as urgent_approvals,
    
    -- Bulk operations
    (SELECT COUNT(*) FROM epic17_toggle_bulk_operations WHERE operation_status IN ('pending', 'running')) as active_bulk_operations,
    (SELECT COUNT(*) FROM epic17_toggle_bulk_operations WHERE completed_at >= NOW() - INTERVAL '24 hours') as bulk_operations_today,
    
    -- Dependencies and relationships
    (SELECT COUNT(*) FROM epic17_toggle_dependencies WHERE is_active = true) as active_dependencies,
    (SELECT COUNT(*) FROM epic17_toggle_dependencies WHERE enforced = true) as enforced_dependencies,
    
    -- Usage and performance
    (SELECT AVG(access_count) FROM epic17_toggle_definitions WHERE access_count > 0) as avg_access_count,
    (SELECT COUNT(*) FROM epic17_toggle_definitions WHERE last_accessed >= NOW() - INTERVAL '24 hours') as toggles_accessed_today,
    
    -- Analytics summary
    (SELECT COUNT(*) FROM epic17_toggle_usage_analytics WHERE measurement_timestamp >= NOW() - INTERVAL '1 hour') as recent_analytics_measurements,
    (SELECT AVG(average_response_time) FROM epic17_toggle_usage_analytics WHERE measurement_timestamp >= NOW() - INTERVAL '24 hours') as avg_response_time_24h;

-- Add table comments for documentation
COMMENT ON TABLE epic17_toggle_definitions IS 'Toggle definitions and configuration management';
COMMENT ON TABLE epic17_toggle_history IS 'Toggle change history and audit trail';
COMMENT ON TABLE epic17_toggle_change_requests IS 'Toggle change requests and approval workflow';
COMMENT ON TABLE epic17_toggle_bulk_operations IS 'Bulk toggle operations management';
COMMENT ON TABLE epic17_toggle_dependencies IS 'Toggle dependency management';
COMMENT ON TABLE epic17_toggle_usage_analytics IS 'Toggle usage analytics and metrics';
COMMENT ON TABLE epic17_toggle_notifications IS 'Toggle notification and alerting configuration';
COMMENT ON TABLE epic17_toggle_templates IS 'Toggle configuration templates for common patterns';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic17_toggle_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_toggle_definitions_timestamp
    BEFORE UPDATE ON epic17_toggle_definitions
    FOR EACH ROW EXECUTE FUNCTION update_epic17_toggle_timestamp();

CREATE TRIGGER update_epic17_change_requests_timestamp
    BEFORE UPDATE ON epic17_toggle_change_requests
    FOR EACH ROW EXECUTE FUNCTION update_epic17_toggle_timestamp();

CREATE TRIGGER update_epic17_dependencies_timestamp
    BEFORE UPDATE ON epic17_toggle_dependencies
    FOR EACH ROW EXECUTE FUNCTION update_epic17_toggle_timestamp();

CREATE TRIGGER update_epic17_templates_timestamp
    BEFORE UPDATE ON epic17_toggle_templates
    FOR EACH ROW EXECUTE FUNCTION update_epic17_toggle_timestamp();

-- Create trigger to update access count on toggle access
CREATE OR REPLACE FUNCTION update_toggle_access_stats() RETURNS TRIGGER AS $$
BEGIN
    -- Update access statistics when toggle is accessed
    IF TG_OP = 'UPDATE' AND OLD.last_accessed != NEW.last_accessed THEN
        NEW.access_count = COALESCE(OLD.access_count, 0) + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic17_toggle_access_stats
    BEFORE UPDATE ON epic17_toggle_definitions
    FOR EACH ROW
    WHEN (NEW.last_accessed IS DISTINCT FROM OLD.last_accessed)
    EXECUTE FUNCTION update_toggle_access_stats();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 17 Toggle Status Controls database schema created successfully';
    RAISE NOTICE '📊 Tables created: 8 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 management functions + 1 cleanup function';
    RAISE NOTICE '⚡ Features: Toggle management, dependency tracking, bulk operations, usage analytics';
    RAISE NOTICE '🔄 Workflows: Change requests, approval processes, validation, rollback capabilities';
    RAISE NOTICE '📈 Analytics: Usage metrics, performance tracking, trend analysis';
    RAISE NOTICE '🛡️ Safety: Dependency validation, safety checks, approval workflows';
    RAISE NOTICE '📋 Templates: 5 default toggle templates for common use cases';
    RAISE NOTICE '🚀 Toggle status controls system ready for Epic 17 API management';
END $$;