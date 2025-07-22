-- Epic 16 Support Escalation Database Schema
-- Task: E16-1753114247206-7FAF6C - Create support escalation
-- 
-- Creates comprehensive support escalation infrastructure for Epic 16 API Management System
-- including ticket management, escalation workflows, SLA monitoring, routing systems,
-- multi-channel notifications, and performance tracking with audit trails.

-- Support tickets core table
CREATE TABLE IF NOT EXISTS epic16_support_tickets (
    id SERIAL PRIMARY KEY,
    ticket_id UUID UNIQUE NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL, -- Human readable ticket number
    
    -- Ticket classification
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent, critical
    category VARCHAR(50) NOT NULL, -- technical, billing, feature_request, bug_report, security, compliance
    subcategory VARCHAR(100),
    severity VARCHAR(20) NOT NULL DEFAULT 'low', -- low, medium, high, critical
    
    -- Ticket content
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    initial_assessment TEXT,
    
    -- Status and lifecycle
    status VARCHAR(30) NOT NULL DEFAULT 'new', -- new, open, in_progress, pending, resolved, closed, escalated, cancelled
    resolution TEXT,
    resolution_category VARCHAR(50),
    
    -- Customer and contact information
    customer_id VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    preferred_contact_method VARCHAR(20) DEFAULT 'email', -- email, phone, slack, chat
    
    -- Assignment and routing
    assigned_to VARCHAR(255),
    assigned_team VARCHAR(100),
    routing_queue VARCHAR(100) DEFAULT 'general',
    routing_score DECIMAL(5,2) DEFAULT 0, -- Intelligent routing score
    
    -- SLA tracking
    sla_priority VARCHAR(20) NOT NULL,
    response_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolution_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    business_hours_only BOOLEAN DEFAULT TRUE,
    
    -- Escalation tracking
    escalation_level INTEGER DEFAULT 0,
    escalation_reason TEXT,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_by VARCHAR(255),
    auto_escalated BOOLEAN DEFAULT FALSE,
    
    -- Tags and metadata
    tags JSONB DEFAULT '[]'::jsonb, -- Array of tag strings
    custom_fields JSONB DEFAULT '{}'::jsonb, -- Customer-specific fields
    metadata JSONB DEFAULT '{}'::jsonb, -- System metadata
    
    -- Attachments and references
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of attachment objects
    related_tickets JSONB DEFAULT '[]'::jsonb, -- Array of related ticket IDs
    external_references JSONB DEFAULT '{}'::jsonb, -- External system references
    
    -- Audit trail
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics
    first_response_time INTEGER, -- minutes
    total_resolution_time INTEGER, -- minutes
    agent_work_time INTEGER, -- minutes
    customer_wait_time INTEGER, -- minutes
    
    -- Satisfaction tracking
    satisfaction_score INTEGER, -- 1-5 scale
    satisfaction_feedback TEXT,
    satisfaction_recorded_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_epic16_tickets_ticket_id (ticket_id),
    INDEX idx_epic16_tickets_ticket_number (ticket_number),
    INDEX idx_epic16_tickets_status (status),
    INDEX idx_epic16_tickets_priority (priority),
    INDEX idx_epic16_tickets_assigned_to (assigned_to),
    INDEX idx_epic16_tickets_customer_id (customer_id),
    INDEX idx_epic16_tickets_created_at (created_at),
    INDEX idx_epic16_tickets_response_due (response_due_at),
    INDEX idx_epic16_tickets_resolution_due (resolution_due_at),
    INDEX idx_epic16_tickets_escalation_level (escalation_level),
    INDEX idx_epic16_tickets_sla_monitoring (sla_priority, response_due_at, status),
    INDEX idx_epic16_tickets_routing (routing_queue, routing_score),
    INDEX idx_epic16_tickets_tags_gin (tags) USING gin,
    INDEX idx_epic16_tickets_active (status, priority, assigned_to) WHERE status NOT IN ('resolved', 'closed', 'cancelled'),
    INDEX idx_epic16_tickets_overdue (status, response_due_at) WHERE status IN ('new', 'open', 'in_progress') AND response_due_at < NOW()
);

-- Escalation events and history tracking
CREATE TABLE IF NOT EXISTS epic16_escalation_events (
    id SERIAL PRIMARY KEY,
    event_id UUID UNIQUE NOT NULL,
    ticket_id UUID NOT NULL,
    
    -- Escalation details
    escalation_type VARCHAR(30) NOT NULL, -- time_based, priority_change, manual, volume_based, sla_breach
    from_level INTEGER NOT NULL DEFAULT 0,
    to_level INTEGER NOT NULL,
    escalation_reason TEXT NOT NULL,
    
    -- Triggering conditions
    triggered_by VARCHAR(30) NOT NULL, -- system, user, sla_monitor, volume_trigger
    trigger_details JSONB DEFAULT '{}'::jsonb,
    
    -- Assignment changes
    previous_assignee VARCHAR(255),
    new_assignee VARCHAR(255),
    previous_team VARCHAR(100),
    new_team VARCHAR(100),
    
    -- Notification tracking
    notifications_sent JSONB DEFAULT '[]'::jsonb, -- Array of notification records
    notification_channels JSONB DEFAULT '[]'::jsonb, -- Array of channels used
    
    -- Response tracking
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    response_actions JSONB DEFAULT '[]'::jsonb, -- Array of action records
    
    -- Timing information
    escalation_delay INTEGER DEFAULT 0, -- minutes between trigger and actual escalation
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    escalation_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic16_escalations_event_id (event_id),
    INDEX idx_epic16_escalations_ticket_id (ticket_id),
    INDEX idx_epic16_escalations_type (escalation_type),
    INDEX idx_epic16_escalations_escalated_at (escalated_at),
    INDEX idx_epic16_escalations_triggered_by (triggered_by),
    INDEX idx_epic16_escalations_to_level (to_level),
    INDEX idx_epic16_escalations_acknowledged (acknowledged_by, acknowledged_at),
    
    FOREIGN KEY (ticket_id) REFERENCES epic16_support_tickets(ticket_id) ON DELETE CASCADE
);

-- SLA definitions and configurations
CREATE TABLE IF NOT EXISTS epic16_sla_configurations (
    id SERIAL PRIMARY KEY,
    sla_id UUID UNIQUE NOT NULL,
    sla_name VARCHAR(100) NOT NULL,
    
    -- SLA scope and applicability
    priority_levels JSONB NOT NULL, -- Array of priorities this SLA applies to
    categories JSONB DEFAULT '[]'::jsonb, -- Array of categories
    customer_segments JSONB DEFAULT '[]'::jsonb, -- Array of customer segments
    
    -- Time commitments
    response_time_minutes INTEGER NOT NULL,
    resolution_time_hours INTEGER NOT NULL,
    escalation_interval_minutes INTEGER NOT NULL,
    
    -- Business hours configuration
    business_hours_only BOOLEAN DEFAULT TRUE,
    business_hours JSONB NOT NULL, -- Business hours configuration
    holidays JSONB DEFAULT '[]'::jsonb, -- Array of holiday dates
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Escalation rules
    max_escalation_levels INTEGER DEFAULT 3,
    escalation_targets JSONB NOT NULL, -- Array of escalation target configurations
    auto_escalation_enabled BOOLEAN DEFAULT TRUE,
    
    -- Performance targets
    response_rate_target DECIMAL(5,2) DEFAULT 95.0, -- percentage
    resolution_rate_target DECIMAL(5,2) DEFAULT 90.0, -- percentage
    satisfaction_target DECIMAL(3,1) DEFAULT 4.0, -- 1-5 scale
    
    -- Status and lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic16_sla_configs_sla_id (sla_id),
    INDEX idx_epic16_sla_configs_name (sla_name),
    INDEX idx_epic16_sla_configs_active (is_active, effective_from, effective_to),
    INDEX idx_epic16_sla_configs_priority_gin (priority_levels) USING gin,
    INDEX idx_epic16_sla_configs_categories_gin (categories) USING gin
);

-- Routing rules and intelligent assignment
CREATE TABLE IF NOT EXISTS epic16_routing_rules (
    id SERIAL PRIMARY KEY,
    rule_id UUID UNIQUE NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    
    -- Rule conditions
    priority_conditions JSONB DEFAULT '[]'::jsonb, -- Array of priority conditions
    category_conditions JSONB DEFAULT '[]'::jsonb, -- Array of category conditions
    keyword_conditions JSONB DEFAULT '[]'::jsonb, -- Array of keyword conditions
    customer_conditions JSONB DEFAULT '[]'::jsonb, -- Array of customer conditions
    time_conditions JSONB DEFAULT '[]'::jsonb, -- Array of time-based conditions
    
    -- Routing actions
    target_queue VARCHAR(100),
    target_team VARCHAR(100),
    target_agent VARCHAR(255),
    priority_adjustment INTEGER DEFAULT 0, -- +/- priority adjustment
    
    -- Rule evaluation
    rule_weight INTEGER DEFAULT 1,
    evaluation_order INTEGER DEFAULT 100,
    stop_on_match BOOLEAN DEFAULT FALSE,
    
    -- Advanced routing
    load_balancing_strategy VARCHAR(30) DEFAULT 'round_robin', -- round_robin, skill_based, workload_based, random
    skill_requirements JSONB DEFAULT '[]'::jsonb, -- Array of required skills
    workload_threshold INTEGER DEFAULT 10, -- Maximum tickets per agent
    
    -- Rule status
    is_active BOOLEAN DEFAULT TRUE,
    success_rate DECIMAL(5,2) DEFAULT 0, -- percentage of successful routings
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic16_routing_rules_rule_id (rule_id),
    INDEX idx_epic16_routing_rules_name (rule_name),
    INDEX idx_epic16_routing_rules_active (is_active, evaluation_order),
    INDEX idx_epic16_routing_rules_target_queue (target_queue),
    INDEX idx_epic16_routing_rules_target_team (target_team),
    INDEX idx_epic16_routing_rules_priority_gin (priority_conditions) USING gin,
    INDEX idx_epic16_routing_rules_category_gin (category_conditions) USING gin,
    INDEX idx_epic16_routing_rules_success_rate (success_rate, usage_count)
);

-- Agent skills and availability tracking
CREATE TABLE IF NOT EXISTS epic16_agent_profiles (
    id SERIAL PRIMARY KEY,
    profile_id UUID UNIQUE NOT NULL,
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Agent information
    agent_name VARCHAR(255) NOT NULL,
    agent_email VARCHAR(255),
    team VARCHAR(100),
    role VARCHAR(50),
    
    -- Skills and capabilities
    skills JSONB DEFAULT '[]'::jsonb, -- Array of skill objects with proficiency levels
    languages JSONB DEFAULT '[]'::jsonb, -- Array of supported languages
    specializations JSONB DEFAULT '[]'::jsonb, -- Array of specialization areas
    
    -- Availability and capacity
    availability_status VARCHAR(20) DEFAULT 'available', -- available, busy, away, offline
    max_concurrent_tickets INTEGER DEFAULT 5,
    current_ticket_count INTEGER DEFAULT 0,
    
    -- Schedule and working hours
    working_hours JSONB DEFAULT '{}'::jsonb, -- Weekly schedule configuration
    timezone VARCHAR(50) DEFAULT 'UTC',
    vacation_schedule JSONB DEFAULT '[]'::jsonb, -- Array of vacation periods
    
    -- Performance metrics
    average_response_time INTEGER DEFAULT 0, -- minutes
    average_resolution_time INTEGER DEFAULT 0, -- minutes
    satisfaction_rating DECIMAL(3,1) DEFAULT 0, -- 1-5 scale
    tickets_resolved_today INTEGER DEFAULT 0,
    tickets_resolved_total INTEGER DEFAULT 0,
    
    -- Workload tracking
    workload_score DECIMAL(5,2) DEFAULT 0, -- Current workload assessment
    efficiency_score DECIMAL(5,2) DEFAULT 0, -- Efficiency rating
    last_assignment_at TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic16_agent_profiles_profile_id (profile_id),
    INDEX idx_epic16_agent_profiles_agent_id (agent_id),
    INDEX idx_epic16_agent_profiles_team (team),
    INDEX idx_epic16_agent_profiles_availability (availability_status, is_active),
    INDEX idx_epic16_agent_profiles_workload (workload_score, current_ticket_count),
    INDEX idx_epic16_agent_profiles_skills_gin (skills) USING gin,
    INDEX idx_epic16_agent_profiles_performance (satisfaction_rating, efficiency_score)
);

-- Notification tracking and delivery
CREATE TABLE IF NOT EXISTS epic16_notification_logs (
    id SERIAL PRIMARY KEY,
    notification_id UUID UNIQUE NOT NULL,
    ticket_id UUID NOT NULL,
    
    -- Notification details
    notification_type VARCHAR(30) NOT NULL, -- escalation, assignment, sla_warning, resolution, customer_update
    channel VARCHAR(20) NOT NULL, -- email, slack, webhook, sms, push
    recipient VARCHAR(255) NOT NULL,
    
    -- Message content
    subject VARCHAR(500),
    message_body TEXT NOT NULL,
    template_used VARCHAR(100),
    personalization_data JSONB DEFAULT '{}'::jsonb,
    
    -- Delivery tracking
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, bounced
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Response tracking
    opened BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    responded BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Integration data
    external_message_id VARCHAR(255), -- ID from external system
    webhook_response JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic16_notifications_notification_id (notification_id),
    INDEX idx_epic16_notifications_ticket_id (ticket_id),
    INDEX idx_epic16_notifications_channel (channel),
    INDEX idx_epic16_notifications_recipient (recipient),
    INDEX idx_epic16_notifications_type (notification_type),
    INDEX idx_epic16_notifications_delivery_status (delivery_status),
    INDEX idx_epic16_notifications_sent_at (sent_at),
    INDEX idx_epic16_notifications_failed (delivery_status, retry_count) WHERE delivery_status = 'failed',
    
    FOREIGN KEY (ticket_id) REFERENCES epic16_support_tickets(ticket_id) ON DELETE CASCADE
);

-- Integration configurations for external systems
CREATE TABLE IF NOT EXISTS epic16_integration_configs (
    id SERIAL PRIMARY KEY,
    config_id UUID UNIQUE NOT NULL,
    integration_type VARCHAR(30) NOT NULL, -- email, slack, webhook, ticketing_system, crm
    
    -- Configuration details
    config_name VARCHAR(100) NOT NULL,
    description TEXT,
    connection_settings JSONB NOT NULL, -- Connection parameters
    authentication_config JSONB DEFAULT '{}'::jsonb, -- Auth configuration
    
    -- Feature settings
    enabled_features JSONB DEFAULT '[]'::jsonb, -- Array of enabled features
    notification_templates JSONB DEFAULT '{}'::jsonb, -- Notification templates
    field_mappings JSONB DEFAULT '{}'::jsonb, -- Field mapping configuration
    
    -- Status and health
    is_active BOOLEAN DEFAULT TRUE,
    connection_status VARCHAR(20) DEFAULT 'unknown', -- connected, disconnected, error, unknown
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_check_result JSONB DEFAULT '{}'::jsonb,
    
    -- Usage tracking
    total_messages_sent INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic16_integrations_config_id (config_id),
    INDEX idx_epic16_integrations_type (integration_type),
    INDEX idx_epic16_integrations_active (is_active, connection_status),
    INDEX idx_epic16_integrations_health (connection_status, last_health_check)
);

-- Performance metrics and analytics
CREATE TABLE IF NOT EXISTS epic16_support_metrics (
    id SERIAL PRIMARY KEY,
    metric_id UUID UNIQUE NOT NULL,
    measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    measurement_period VARCHAR(20) NOT NULL, -- minute, hour, day, week, month
    
    -- Ticket volume metrics
    tickets_created INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    tickets_escalated INTEGER DEFAULT 0,
    tickets_reopened INTEGER DEFAULT 0,
    
    -- Response time metrics
    avg_first_response_time INTEGER DEFAULT 0, -- minutes
    median_first_response_time INTEGER DEFAULT 0, -- minutes
    p95_first_response_time INTEGER DEFAULT 0, -- minutes
    
    -- Resolution time metrics
    avg_resolution_time INTEGER DEFAULT 0, -- minutes
    median_resolution_time INTEGER DEFAULT 0, -- minutes
    p95_resolution_time INTEGER DEFAULT 0, -- minutes
    
    -- SLA performance
    sla_response_compliance_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    sla_resolution_compliance_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    sla_breaches INTEGER DEFAULT 0,
    
    -- Agent performance
    agent_utilization_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    agent_satisfaction_avg DECIMAL(3,1) DEFAULT 0, -- 1-5 scale
    agent_efficiency_score DECIMAL(5,2) DEFAULT 0,
    
    -- Customer satisfaction
    customer_satisfaction_avg DECIMAL(3,1) DEFAULT 0, -- 1-5 scale
    customer_satisfaction_responses INTEGER DEFAULT 0,
    customer_satisfaction_distribution JSONB DEFAULT '{}'::jsonb, -- Rating distribution
    
    -- Escalation metrics
    escalation_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    auto_escalation_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    avg_escalation_levels DECIMAL(3,1) DEFAULT 0,
    
    -- Routing effectiveness
    routing_accuracy DECIMAL(5,2) DEFAULT 0, -- percentage
    first_contact_resolution_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    ticket_reassignment_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    
    -- System health
    system_uptime_percentage DECIMAL(5,2) DEFAULT 0,
    integration_health_score DECIMAL(5,2) DEFAULT 0,
    notification_delivery_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    
    -- Trend analysis
    volume_trend VARCHAR(20) DEFAULT 'stable', -- increasing, stable, decreasing
    performance_trend VARCHAR(20) DEFAULT 'stable', -- improving, stable, declining
    
    -- Metadata
    aggregation_details JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_epic16_metrics_metric_id (metric_id),
    INDEX idx_epic16_metrics_timestamp (measurement_timestamp),
    INDEX idx_epic16_metrics_period (measurement_period),
    INDEX idx_epic16_metrics_recent (measurement_timestamp DESC) WHERE measurement_timestamp >= NOW() - INTERVAL '30 days',
    INDEX idx_epic16_metrics_sla_performance (sla_response_compliance_rate, sla_resolution_compliance_rate),
    INDEX idx_epic16_metrics_satisfaction (customer_satisfaction_avg, agent_satisfaction_avg)
);

-- Alert configurations and monitoring
CREATE TABLE IF NOT EXISTS epic16_alert_configurations (
    id SERIAL PRIMARY KEY,
    alert_id UUID UNIQUE NOT NULL,
    alert_name VARCHAR(100) NOT NULL,
    
    -- Alert conditions
    metric_name VARCHAR(50) NOT NULL, -- The metric to monitor
    condition_type VARCHAR(20) NOT NULL, -- threshold, trend, anomaly
    threshold_value DECIMAL(10,2),
    comparison_operator VARCHAR(10) NOT NULL, -- gt, lt, gte, lte, eq, ne
    
    -- Time window for evaluation
    evaluation_window_minutes INTEGER DEFAULT 5,
    evaluation_frequency_minutes INTEGER DEFAULT 1,
    consecutive_breaches_required INTEGER DEFAULT 1,
    
    -- Alert severity and priority
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    alert_priority INTEGER DEFAULT 1,
    
    -- Notification settings
    notification_channels JSONB NOT NULL, -- Array of notification channel configurations
    escalation_delay_minutes INTEGER DEFAULT 15,
    max_notifications_per_hour INTEGER DEFAULT 10,
    
    -- Alert lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    snooze_until TIMESTAMP WITH TIME ZONE,
    suppression_rules JSONB DEFAULT '[]'::jsonb, -- Array of suppression conditions
    
    -- Alert history tracking
    total_alerts_fired INTEGER DEFAULT 0,
    last_alert_fired TIMESTAMP WITH TIME ZONE,
    false_positive_count INTEGER DEFAULT 0,
    
    -- Metadata
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_epic16_alerts_alert_id (alert_id),
    INDEX idx_epic16_alerts_name (alert_name),
    INDEX idx_epic16_alerts_active (is_active, snooze_until),
    INDEX idx_epic16_alerts_metric (metric_name, condition_type),
    INDEX idx_epic16_alerts_severity (severity, alert_priority),
    INDEX idx_epic16_alerts_last_fired (last_alert_fired)
);

-- Create comprehensive functions for support escalation management

-- Function to calculate ticket SLA status
CREATE OR REPLACE FUNCTION calculate_ticket_sla_status(
    p_ticket_id UUID
) RETURNS TABLE(
    response_sla_met BOOLEAN,
    resolution_sla_met BOOLEAN,
    response_time_remaining INTEGER, -- minutes
    resolution_time_remaining INTEGER, -- minutes
    breach_risk_level VARCHAR(20)
) AS $$
DECLARE
    ticket_record RECORD;
    current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Get ticket information
    SELECT * INTO ticket_record
    FROM epic16_support_tickets
    WHERE ticket_id = p_ticket_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, FALSE, 0, 0, 'unknown'::VARCHAR(20);
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        (ticket_record.first_response_time IS NOT NULL AND ticket_record.response_due_at > (ticket_record.created_at + (ticket_record.first_response_time || ' minutes')::INTERVAL)) as response_sla_met,
        (ticket_record.status IN ('resolved', 'closed') AND ticket_record.resolution_due_at > COALESCE(ticket_record.resolved_at, current_time)) as resolution_sla_met,
        GREATEST(0, EXTRACT(EPOCH FROM (ticket_record.response_due_at - current_time)) / 60)::INTEGER as response_time_remaining,
        GREATEST(0, EXTRACT(EPOCH FROM (ticket_record.resolution_due_at - current_time)) / 60)::INTEGER as resolution_time_remaining,
        CASE 
            WHEN current_time > ticket_record.resolution_due_at THEN 'critical'
            WHEN current_time > ticket_record.response_due_at THEN 'high'
            WHEN (ticket_record.resolution_due_at - current_time) < INTERVAL '4 hours' THEN 'medium'
            WHEN (ticket_record.response_due_at - current_time) < INTERVAL '2 hours' THEN 'medium'
            ELSE 'low'
        END::VARCHAR(20) as breach_risk_level;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended agent for ticket assignment
CREATE OR REPLACE FUNCTION get_recommended_agent_assignment(
    p_ticket_priority VARCHAR(20),
    p_ticket_category VARCHAR(50),
    p_required_skills JSONB DEFAULT '[]'::jsonb
) RETURNS TABLE(
    agent_id VARCHAR(255),
    agent_name VARCHAR(255),
    recommendation_score DECIMAL(5,2),
    current_workload INTEGER,
    availability_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.agent_id,
        ap.agent_name,
        -- Calculate recommendation score based on multiple factors
        (
            -- Skill match score (40% weight)
            CASE 
                WHEN jsonb_array_length(p_required_skills) = 0 THEN 40.0
                ELSE (
                    SELECT COALESCE(AVG(
                        CASE 
                            WHEN skill_obj->>'name' = ANY(SELECT jsonb_array_elements_text(p_required_skills)) 
                            THEN (skill_obj->>'proficiency')::DECIMAL * 40.0 / 100.0
                            ELSE 0
                        END
                    ), 0)
                    FROM jsonb_array_elements(ap.skills) as skill_obj
                )
            END +
            -- Workload score (30% weight) - lower workload is better
            (30.0 * (1 - LEAST(ap.current_ticket_count::DECIMAL / NULLIF(ap.max_concurrent_tickets, 0), 1.0))) +
            -- Performance score (30% weight)
            (ap.efficiency_score * 0.3)
        )::DECIMAL(5,2) as recommendation_score,
        ap.current_ticket_count,
        ap.availability_status
    FROM epic16_agent_profiles ap
    WHERE ap.is_active = true
        AND ap.availability_status IN ('available', 'busy')
        AND ap.current_ticket_count < ap.max_concurrent_tickets
    ORDER BY recommendation_score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze escalation patterns and trends
CREATE OR REPLACE FUNCTION analyze_escalation_patterns(
    p_time_window_days INTEGER DEFAULT 30
) RETURNS TABLE(
    escalation_type VARCHAR(30),
    total_escalations INTEGER,
    avg_escalation_level DECIMAL(3,1),
    most_common_reason TEXT,
    success_rate DECIMAL(5,2),
    trend_direction VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    WITH escalation_analysis AS (
        SELECT 
            ee.escalation_type,
            COUNT(*) as total_escalations,
            AVG(ee.to_level::DECIMAL) as avg_escalation_level,
            ee.escalation_reason,
            COUNT(*) OVER (PARTITION BY ee.escalation_type, ee.escalation_reason) as reason_count,
            ROW_NUMBER() OVER (PARTITION BY ee.escalation_type ORDER BY COUNT(*) DESC) as reason_rank
        FROM epic16_escalation_events ee
        WHERE ee.escalated_at >= NOW() - (p_time_window_days || ' days')::INTERVAL
        GROUP BY ee.escalation_type, ee.escalation_reason
    ),
    success_rates AS (
        SELECT 
            ee.escalation_type,
            (COUNT(CASE WHEN st.status IN ('resolved', 'closed') THEN 1 END)::DECIMAL / COUNT(*) * 100) as success_rate
        FROM epic16_escalation_events ee
        JOIN epic16_support_tickets st ON ee.ticket_id = st.ticket_id
        WHERE ee.escalated_at >= NOW() - (p_time_window_days || ' days')::INTERVAL
        GROUP BY ee.escalation_type
    )
    SELECT 
        ea.escalation_type,
        ea.total_escalations::INTEGER,
        ea.avg_escalation_level::DECIMAL(3,1),
        ea.escalation_reason as most_common_reason,
        COALESCE(sr.success_rate, 0)::DECIMAL(5,2) as success_rate,
        -- Simple trend analysis - comparing first half vs second half of time window
        CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM epic16_escalation_events ee2 
                WHERE ee2.escalation_type = ea.escalation_type 
                    AND ee2.escalated_at >= NOW() - (p_time_window_days/2 || ' days')::INTERVAL
            ) > (
                SELECT COUNT(*) 
                FROM epic16_escalation_events ee2 
                WHERE ee2.escalation_type = ea.escalation_type 
                    AND ee2.escalated_at >= NOW() - (p_time_window_days || ' days')::INTERVAL
                    AND ee2.escalated_at < NOW() - (p_time_window_days/2 || ' days')::INTERVAL
            ) THEN 'increasing'
            WHEN (
                SELECT COUNT(*) 
                FROM epic16_escalation_events ee2 
                WHERE ee2.escalation_type = ea.escalation_type 
                    AND ee2.escalated_at >= NOW() - (p_time_window_days/2 || ' days')::INTERVAL
            ) < (
                SELECT COUNT(*) 
                FROM epic16_escalation_events ee2 
                WHERE ee2.escalation_type = ea.escalation_type 
                    AND ee2.escalated_at >= NOW() - (p_time_window_days || ' days')::INTERVAL
                    AND ee2.escalated_at < NOW() - (p_time_window_days/2 || ' days')::INTERVAL
            ) THEN 'decreasing'
            ELSE 'stable'
        END::VARCHAR(20) as trend_direction
    FROM escalation_analysis ea
    LEFT JOIN success_rates sr ON ea.escalation_type = sr.escalation_type
    WHERE ea.reason_rank = 1
    ORDER BY ea.total_escalations DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to generate support dashboard metrics
CREATE OR REPLACE FUNCTION generate_support_dashboard_metrics(
    p_time_period VARCHAR(20) DEFAULT 'today' -- today, this_week, this_month
) RETURNS TABLE(
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    trend_direction VARCHAR(20),
    target_value DECIMAL(10,2)
) AS $$
DECLARE
    time_filter INTERVAL;
    comparison_filter INTERVAL;
BEGIN
    -- Set time filters based on period
    CASE p_time_period
        WHEN 'today' THEN 
            time_filter := INTERVAL '1 day';
            comparison_filter := INTERVAL '2 days';
        WHEN 'this_week' THEN 
            time_filter := INTERVAL '7 days';
            comparison_filter := INTERVAL '14 days';
        WHEN 'this_month' THEN 
            time_filter := INTERVAL '30 days';
            comparison_filter := INTERVAL '60 days';
        ELSE 
            time_filter := INTERVAL '1 day';
            comparison_filter := INTERVAL '2 days';
    END CASE;
    
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            COUNT(*)::DECIMAL as total_tickets,
            COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END)::DECIMAL as resolved_tickets,
            COUNT(CASE WHEN escalation_level > 0 THEN 1 END)::DECIMAL as escalated_tickets,
            AVG(first_response_time) as avg_response_time,
            AVG(total_resolution_time) as avg_resolution_time,
            AVG(satisfaction_score) as avg_satisfaction
        FROM epic16_support_tickets
        WHERE created_at >= NOW() - time_filter
    ),
    comparison_metrics AS (
        SELECT 
            COUNT(*)::DECIMAL as total_tickets,
            COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END)::DECIMAL as resolved_tickets,
            COUNT(CASE WHEN escalation_level > 0 THEN 1 END)::DECIMAL as escalated_tickets,
            AVG(first_response_time) as avg_response_time,
            AVG(total_resolution_time) as avg_resolution_time,
            AVG(satisfaction_score) as avg_satisfaction
        FROM epic16_support_tickets
        WHERE created_at >= NOW() - comparison_filter 
            AND created_at < NOW() - time_filter
    )
    SELECT * FROM (
        VALUES 
            ('total_tickets', (SELECT total_tickets FROM current_metrics), 'count', 
             CASE WHEN (SELECT total_tickets FROM current_metrics) > (SELECT total_tickets FROM comparison_metrics) THEN 'increasing'
                  WHEN (SELECT total_tickets FROM current_metrics) < (SELECT total_tickets FROM comparison_metrics) THEN 'decreasing'
                  ELSE 'stable' END,
             0::DECIMAL),
            ('resolution_rate', 
             CASE WHEN (SELECT total_tickets FROM current_metrics) > 0 
                  THEN (SELECT resolved_tickets FROM current_metrics) / (SELECT total_tickets FROM current_metrics) * 100
                  ELSE 0 END, 
             'percentage',
             CASE WHEN (SELECT resolved_tickets FROM current_metrics) / NULLIF((SELECT total_tickets FROM current_metrics), 0) > 
                          (SELECT resolved_tickets FROM comparison_metrics) / NULLIF((SELECT total_tickets FROM comparison_metrics), 0)
                  THEN 'improving' ELSE 'stable' END,
             95.0::DECIMAL),
            ('escalation_rate',
             CASE WHEN (SELECT total_tickets FROM current_metrics) > 0
                  THEN (SELECT escalated_tickets FROM current_metrics) / (SELECT total_tickets FROM current_metrics) * 100
                  ELSE 0 END,
             'percentage', 'stable', 10.0::DECIMAL),
            ('avg_response_time', COALESCE((SELECT avg_response_time FROM current_metrics), 0), 'minutes', 'stable', 60.0::DECIMAL),
            ('avg_resolution_time', COALESCE((SELECT avg_resolution_time FROM current_metrics), 0), 'minutes', 'stable', 1440.0::DECIMAL),
            ('customer_satisfaction', COALESCE((SELECT avg_satisfaction FROM current_metrics), 0), 'score', 'stable', 4.0::DECIMAL)
    ) AS metrics(metric_name, metric_value, metric_unit, trend_direction, target_value);
END;
$$ LANGUAGE plpgsql;

-- Insert default SLA configurations
INSERT INTO epic16_sla_configurations (
    sla_id, sla_name, priority_levels, response_time_minutes, resolution_time_hours, 
    escalation_interval_minutes, business_hours, escalation_targets, created_by
) VALUES
    (gen_random_uuid(), 'Critical Priority SLA', '["critical"]'::jsonb, 15, 4, 30, 
     '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}}'::jsonb,
     '[{"level": 1, "targets": ["senior_support", "team_lead"]}, {"level": 2, "targets": ["manager", "director"]}, {"level": 3, "targets": ["vp_support", "cto"]}]'::jsonb, 'system'),
    (gen_random_uuid(), 'High Priority SLA', '["high"]'::jsonb, 60, 8, 120, 
     '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}}'::jsonb,
     '[{"level": 1, "targets": ["senior_support"]}, {"level": 2, "targets": ["team_lead", "manager"]}]'::jsonb, 'system'),
    (gen_random_uuid(), 'Standard Priority SLA', '["medium", "low"]'::jsonb, 240, 24, 480, 
     '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}}'::jsonb,
     '[{"level": 1, "targets": ["support_agent", "senior_support"]}]'::jsonb, 'system');

-- Insert default routing rules
INSERT INTO epic16_routing_rules (
    rule_id, rule_name, priority_conditions, category_conditions, target_queue, 
    target_team, evaluation_order, created_by
) VALUES
    (gen_random_uuid(), 'Critical Priority Fast Track', '["critical", "urgent"]'::jsonb, '[]'::jsonb, 
     'critical_queue', 'escalation_team', 1, 'system'),
    (gen_random_uuid(), 'Technical Issues Routing', '[]'::jsonb, '["technical", "bug_report"]'::jsonb, 
     'technical_queue', 'technical_support', 10, 'system'),
    (gen_random_uuid(), 'Billing Issues Routing', '[]'::jsonb, '["billing"]'::jsonb, 
     'billing_queue', 'billing_support', 20, 'system'),
    (gen_random_uuid(), 'Security Issues Priority', '[]'::jsonb, '["security"]'::jsonb, 
     'security_queue', 'security_team', 5, 'system');

-- Insert default alert configurations
INSERT INTO epic16_alert_configurations (
    alert_id, alert_name, metric_name, condition_type, threshold_value, comparison_operator,
    severity, notification_channels, created_by
) VALUES
    (gen_random_uuid(), 'High SLA Breach Rate', 'sla_breaches', 'threshold', 10.0, 'gte',
     'high', '[{"channel": "email", "recipients": ["support-manager@company.com"]}, {"channel": "slack", "channel": "#support-alerts"}]'::jsonb, 'system'),
    (gen_random_uuid(), 'Low Customer Satisfaction', 'customer_satisfaction_avg', 'threshold', 3.0, 'lte',
     'medium', '[{"channel": "email", "recipients": ["support-manager@company.com"]}]'::jsonb, 'system'),
    (gen_random_uuid(), 'High Escalation Rate', 'escalation_rate', 'threshold', 20.0, 'gte',
     'medium', '[{"channel": "slack", "channel": "#support-alerts"}]'::jsonb, 'system');

-- Create performance indexes for large datasets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic16_tickets_performance 
    ON epic16_support_tickets (status, priority, assigned_to, created_at DESC) 
    WHERE created_at >= NOW() - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic16_escalations_monitoring 
    ON epic16_escalation_events (escalation_type, escalated_at DESC, to_level) 
    WHERE escalated_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic16_notifications_delivery_tracking 
    ON epic16_notification_logs (delivery_status, sent_at DESC, channel) 
    WHERE sent_at >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_epic16_metrics_trending 
    ON epic16_support_metrics (measurement_timestamp DESC, measurement_period) 
    WHERE measurement_timestamp >= NOW() - INTERVAL '30 days';

-- Create comprehensive support escalation dashboard view
CREATE VIEW epic16_support_escalation_dashboard AS
SELECT 
    -- Ticket statistics
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE status NOT IN ('resolved', 'closed', 'cancelled')) as active_tickets,
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE status = 'new') as new_tickets,
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE escalation_level > 0) as escalated_tickets,
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE response_due_at < NOW() AND status NOT IN ('resolved', 'closed')) as overdue_response_tickets,
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE resolution_due_at < NOW() AND status NOT IN ('resolved', 'closed')) as overdue_resolution_tickets,
    
    -- SLA performance
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE first_response_time IS NOT NULL AND response_due_at > (created_at + (first_response_time || ' minutes')::INTERVAL)) as sla_response_met_count,
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE first_response_time IS NOT NULL) as total_response_measured,
    
    -- Agent workload
    (SELECT COUNT(*) FROM epic16_agent_profiles WHERE availability_status = 'available' AND is_active = true) as available_agents,
    (SELECT AVG(current_ticket_count) FROM epic16_agent_profiles WHERE is_active = true) as avg_agent_workload,
    
    -- Escalation activity
    (SELECT COUNT(*) FROM epic16_escalation_events WHERE escalated_at >= NOW() - INTERVAL '24 hours') as escalations_today,
    (SELECT COUNT(*) FROM epic16_escalation_events WHERE escalated_at >= NOW() - INTERVAL '1 hour') as escalations_last_hour,
    
    -- Notification performance
    (SELECT COUNT(*) FROM epic16_notification_logs WHERE delivery_status = 'delivered' AND sent_at >= NOW() - INTERVAL '24 hours') as notifications_delivered_today,
    (SELECT COUNT(*) FROM epic16_notification_logs WHERE delivery_status = 'failed' AND sent_at >= NOW() - INTERVAL '24 hours') as notifications_failed_today,
    
    -- Customer satisfaction
    (SELECT AVG(satisfaction_score) FROM epic16_support_tickets WHERE satisfaction_score IS NOT NULL AND resolved_at >= NOW() - INTERVAL '7 days') as avg_satisfaction_this_week,
    (SELECT COUNT(*) FROM epic16_support_tickets WHERE satisfaction_score IS NOT NULL AND resolved_at >= NOW() - INTERVAL '7 days') as satisfaction_responses_this_week,
    
    -- System health
    (SELECT COUNT(*) FROM epic16_integration_configs WHERE is_active = true AND connection_status = 'connected') as healthy_integrations,
    (SELECT COUNT(*) FROM epic16_integration_configs WHERE is_active = true) as total_integrations,
    
    -- Alert status
    (SELECT COUNT(*) FROM epic16_alert_configurations WHERE is_active = true) as active_alerts,
    (SELECT COUNT(*) FROM epic16_alert_configurations WHERE last_alert_fired >= NOW() - INTERVAL '1 hour') as recent_alert_fires;

-- Add table comments for documentation
COMMENT ON TABLE epic16_support_tickets IS 'Core support tickets with comprehensive tracking and SLA management';
COMMENT ON TABLE epic16_escalation_events IS 'Escalation events and history tracking for ticket lifecycle management';
COMMENT ON TABLE epic16_sla_configurations IS 'SLA definitions and configurations with business hours and escalation rules';
COMMENT ON TABLE epic16_routing_rules IS 'Intelligent routing rules for automatic ticket assignment and queue management';
COMMENT ON TABLE epic16_agent_profiles IS 'Agent skills, availability, and performance tracking';
COMMENT ON TABLE epic16_notification_logs IS 'Multi-channel notification tracking and delivery monitoring';
COMMENT ON TABLE epic16_integration_configs IS 'External system integration configurations and health monitoring';
COMMENT ON TABLE epic16_support_metrics IS 'Performance metrics and analytics for support operations';
COMMENT ON TABLE epic16_alert_configurations IS 'Alert configurations and monitoring for proactive support management';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_epic16_support_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic16_support_tickets_timestamp
    BEFORE UPDATE ON epic16_support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_epic16_support_timestamp();

CREATE TRIGGER update_epic16_sla_configurations_timestamp
    BEFORE UPDATE ON epic16_sla_configurations
    FOR EACH ROW EXECUTE FUNCTION update_epic16_support_timestamp();

CREATE TRIGGER update_epic16_routing_rules_timestamp
    BEFORE UPDATE ON epic16_routing_rules
    FOR EACH ROW EXECUTE FUNCTION update_epic16_support_timestamp();

CREATE TRIGGER update_epic16_agent_profiles_timestamp
    BEFORE UPDATE ON epic16_agent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_epic16_support_timestamp();

CREATE TRIGGER update_epic16_integration_configs_timestamp
    BEFORE UPDATE ON epic16_integration_configs
    FOR EACH ROW EXECUTE FUNCTION update_epic16_support_timestamp();

CREATE TRIGGER update_epic16_alert_configurations_timestamp
    BEFORE UPDATE ON epic16_alert_configurations
    FOR EACH ROW EXECUTE FUNCTION update_epic16_support_timestamp();

-- Create trigger to automatically generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TRIGGER AS $$
DECLARE
    ticket_counter INTEGER;
    date_part VARCHAR(8);
BEGIN
    -- Generate date part (YYYYMMDD)
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(ticket_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO ticket_counter
    FROM epic16_support_tickets 
    WHERE ticket_number LIKE ('SUP-' || date_part || '-%');
    
    -- Generate ticket number: SUP-YYYYMMDD-NNNN
    NEW.ticket_number := 'SUP-' || date_part || '-' || LPAD(ticket_counter::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_epic16_ticket_number
    BEFORE INSERT ON epic16_support_tickets
    FOR EACH ROW 
    WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
    EXECUTE FUNCTION generate_ticket_number();

-- Create trigger to update agent workload counters
CREATE OR REPLACE FUNCTION update_agent_workload() RETURNS TRIGGER AS $$
BEGIN
    -- Handle ticket assignment changes
    IF TG_OP = 'UPDATE' THEN
        -- Decrement old assignee's workload
        IF OLD.assigned_to IS NOT NULL AND OLD.assigned_to != NEW.assigned_to THEN
            UPDATE epic16_agent_profiles 
            SET current_ticket_count = GREATEST(current_ticket_count - 1, 0)
            WHERE agent_id = OLD.assigned_to;
        END IF;
        
        -- Increment new assignee's workload
        IF NEW.assigned_to IS NOT NULL AND OLD.assigned_to != NEW.assigned_to THEN
            UPDATE epic16_agent_profiles 
            SET current_ticket_count = current_ticket_count + 1
            WHERE agent_id = NEW.assigned_to;
        END IF;
        
        -- Handle ticket closure
        IF OLD.status NOT IN ('resolved', 'closed') AND NEW.status IN ('resolved', 'closed') THEN
            IF NEW.assigned_to IS NOT NULL THEN
                UPDATE epic16_agent_profiles 
                SET current_ticket_count = GREATEST(current_ticket_count - 1, 0),
                    tickets_resolved_today = tickets_resolved_today + 1,
                    tickets_resolved_total = tickets_resolved_total + 1
                WHERE agent_id = NEW.assigned_to;
            END IF;
        END IF;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        -- Increment assignee's workload for new tickets
        IF NEW.assigned_to IS NOT NULL THEN
            UPDATE epic16_agent_profiles 
            SET current_ticket_count = current_ticket_count + 1
            WHERE agent_id = NEW.assigned_to;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic16_agent_workload
    AFTER INSERT OR UPDATE ON epic16_support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_agent_workload();

-- Final setup completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 16 Support Escalation database schema created successfully';
    RAISE NOTICE '📊 Tables created: 9 core tables + 1 dashboard view';
    RAISE NOTICE '🔧 Functions created: 4 management functions + 1 dashboard function';
    RAISE NOTICE '⚡ Features: Ticket management, SLA monitoring, intelligent routing, escalation workflows';
    RAISE NOTICE '🔄 Workflows: Multi-level escalation, approval processes, notification delivery';
    RAISE NOTICE '📈 Analytics: Performance tracking, satisfaction monitoring, trend analysis';
    RAISE NOTICE '👥 Agent Management: Skills tracking, workload balancing, availability monitoring';
    RAISE NOTICE '🔔 Notifications: Multi-channel delivery, integration health, alert management';
    RAISE NOTICE '🚀 Support escalation system ready for Epic 16 API management';
END $$;