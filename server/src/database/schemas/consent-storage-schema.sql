-- ===================================================================
-- Epic 19 - Consent Storage Schema (Task E19-1753114711826-03C121)
-- Comprehensive GDPR/CCPA compliant consent management database schema
-- Integrates with existing Epic 19 security event logging and audit systems
-- ===================================================================

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- Core Consent Management Tables
-- ===================================================================

-- Consent Records - Primary consent storage table
CREATE TABLE consent_records (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Optional for anonymous consents
    session_id VARCHAR(255) NOT NULL,
    
    -- Consent Details
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('EXPLICIT', 'IMPLICIT', 'OPT_IN', 'OPT_OUT', 'GRANULAR', 'BLANKET', 'CONDITIONAL')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'EXPIRED', 'SUSPENDED', 'PENDING_RENEWAL', 'INVALID')),
    granularity VARCHAR(50) NOT NULL CHECK (granularity IN ('GLOBAL', 'CATEGORY', 'PURPOSE', 'FEATURE', 'INDIVIDUAL')),
    
    -- Legal Framework
    legal_basis VARCHAR(100) NOT NULL CHECK (legal_basis IN ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS')),
    jurisdiction JSONB NOT NULL DEFAULT '["GLOBAL"]', -- Array of applicable jurisdictions
    
    -- Temporal Information
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL for essential/non-expiring consents
    last_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    
    -- Collection Context
    collection_method VARCHAR(50) NOT NULL CHECK (collection_method IN ('WEB_FORM', 'MOBILE_APP', 'EMAIL', 'PHONE', 'IN_PERSON', 'API', 'BANNER', 'POPUP')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('banner', 'preferences', 'just_in_time', 'api', 'migration', 'admin')),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    -- Context Data (stored as JSONB for flexibility)
    collection_context JSONB NOT NULL DEFAULT '{}', -- IP, user agent, geolocation, etc.
    metadata JSONB DEFAULT '{}', -- Custom fields, tags, flags
    
    -- Audit & Compliance
    modified_by VARCHAR(255) NOT NULL,
    compliance_flags JSONB DEFAULT '[]', -- Array of compliance flags
    integrity_hash VARCHAR(255), -- Hash for tamper detection
    digital_signature VARCHAR(512), -- Optional digital signature
    
    -- Performance & Analytics
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Purposes - Purpose definitions and mappings
CREATE TABLE consent_purposes (
    purpose_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL CHECK (category IN ('ESSENTIAL', 'FUNCTIONAL', 'ANALYTICS', 'MARKETING', 'ADVERTISING', 'SOCIAL_MEDIA', 'PERSONALIZATION', 'RESEARCH')),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    purpose_code VARCHAR(100) UNIQUE NOT NULL, -- Standardized purpose identifier
    
    -- Classification
    essential_service BOOLEAN NOT NULL DEFAULT FALSE,
    legal_requirement BOOLEAN NOT NULL DEFAULT FALSE,
    business_critical BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Processing Details
    data_processing_details JSONB NOT NULL DEFAULT '{}', -- DataProcessingDetails structure
    automated_decision_making BOOLEAN NOT NULL DEFAULT FALSE,
    profiling BOOLEAN NOT NULL DEFAULT FALSE,
    special_category_data BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Retention
    retention_period INTEGER, -- Days
    retention_basis VARCHAR(255),
    
    -- Legal Framework
    legal_basis_options JSONB NOT NULL DEFAULT '[]', -- Array of valid legal bases
    jurisdiction_specific JSONB DEFAULT '{}', -- Jurisdiction-specific configurations
    
    -- Metadata
    user_benefit TEXT, -- Description of user benefit
    business_justification TEXT,
    created_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Purpose Mappings - Links consents to purposes
CREATE TABLE consent_purpose_mappings (
    mapping_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_id UUID NOT NULL,
    purpose_id UUID NOT NULL,
    
    -- Mapping specific details
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    conditions JSONB DEFAULT '{}', -- Additional conditions
    expires_at TIMESTAMP WITH TIME ZONE, -- Purpose-specific expiration
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (consent_id) REFERENCES consent_records(consent_id) ON DELETE CASCADE,
    FOREIGN KEY (purpose_id) REFERENCES consent_purposes(purpose_id) ON DELETE CASCADE,
    UNIQUE(consent_id, purpose_id)
);

-- Data Categories - What types of data are involved
CREATE TABLE data_categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_code VARCHAR(100) UNIQUE NOT NULL,
    
    -- Classification
    sensitivity_level VARCHAR(50) NOT NULL CHECK (sensitivity_level IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'PII', 'SPECIAL_CATEGORY')),
    data_classification VARCHAR(50) NOT NULL CHECK (data_classification IN ('PERSONAL_IDENTIFIABLE', 'FINANCIAL', 'HEALTH', 'BEHAVIORAL', 'TECHNICAL', 'COMMUNICATION', 'PREFERENCE')),
    
    -- Examples and details
    examples JSONB DEFAULT '[]', -- Array of example data points
    retention_requirements JSONB DEFAULT '[]', -- Array of retention requirements
    
    -- Security & Compliance
    special_handling BOOLEAN DEFAULT FALSE,
    encryption_required BOOLEAN DEFAULT FALSE,
    legal_basis_required JSONB DEFAULT '[]', -- Array of required legal bases
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Data Category Mappings
CREATE TABLE consent_data_categories (
    mapping_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_id UUID NOT NULL,
    category_id UUID NOT NULL,
    
    -- Mapping details
    access_level VARCHAR(50) DEFAULT 'full' CHECK (access_level IN ('none', 'limited', 'full', 'anonymized')),
    retention_override INTEGER, -- Override retention period in days
    conditions JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (consent_id) REFERENCES consent_records(consent_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES data_categories(category_id) ON DELETE CASCADE,
    UNIQUE(consent_id, category_id)
);

-- Third Party Sharing - External data sharing consents
CREATE TABLE third_party_entities (
    entity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    
    -- Legal Information
    relationship_type VARCHAR(100) NOT NULL CHECK (relationship_type IN ('PROCESSOR', 'JOINT_CONTROLLER', 'VENDOR', 'PARTNER', 'SERVICE_PROVIDER')),
    jurisdiction VARCHAR(100) NOT NULL,
    adequacy_decision BOOLEAN DEFAULT FALSE,
    
    -- Contact & Legal
    dpo_email VARCHAR(255),
    privacy_email VARCHAR(255),
    privacy_policy_url VARCHAR(500),
    contact_info JSONB DEFAULT '{}',
    
    -- Contractual
    contractual_safeguards JSONB DEFAULT '[]',
    transfer_mechanism VARCHAR(255),
    
    -- Status
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Third Party Mappings
CREATE TABLE consent_third_party_sharing (
    mapping_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_id UUID NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Sharing Details
    purpose TEXT NOT NULL,
    data_shared JSONB NOT NULL DEFAULT '[]', -- Array of data categories shared
    consent_required BOOLEAN NOT NULL DEFAULT TRUE,
    opt_out_available BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Visibility & Control
    user_visibility VARCHAR(50) NOT NULL DEFAULT 'TRANSPARENT' CHECK (user_visibility IN ('TRANSPARENT', 'DISCLOSED', 'HIDDEN', 'ON_REQUEST')),
    sharing_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (sharing_status IN ('active', 'paused', 'terminated')),
    
    -- Legal Framework
    legal_mechanism VARCHAR(255),
    international_transfer BOOLEAN DEFAULT FALSE,
    adequacy_assessment BOOLEAN DEFAULT FALSE,
    
    -- Temporal
    sharing_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sharing_ends_at TIMESTAMP WITH TIME ZONE,
    last_shared_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (consent_id) REFERENCES consent_records(consent_id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES third_party_entities(entity_id) ON DELETE CASCADE,
    UNIQUE(consent_id, entity_id)
);

-- ===================================================================
-- User Preferences and Settings
-- ===================================================================

-- User Consent Preferences - Comprehensive user preference storage
CREATE TABLE user_consent_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id VARCHAR(255) NOT NULL,
    
    -- Versioning
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Communication Preferences
    communication_preferences JSONB NOT NULL DEFAULT '[]', -- Array of CommunicationPreference
    privacy_settings JSONB NOT NULL DEFAULT '[]', -- Array of PrivacySetting
    cookie_preferences JSONB NOT NULL DEFAULT '[]', -- Array of CookiePreference
    marketing_preferences JSONB NOT NULL DEFAULT '[]', -- Array of MarketingPreference
    data_processing_preferences JSONB NOT NULL DEFAULT '[]', -- Array of DataProcessingPreference
    notification_preferences JSONB NOT NULL DEFAULT '[]', -- Array of NotificationPreference
    accessibility_preferences JSONB NOT NULL DEFAULT '{}', -- AccessibilityPreference object
    
    -- Global Settings
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'user_settings',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cookie Definitions - Detailed cookie information
CREATE TABLE cookie_definitions (
    cookie_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cookie_name VARCHAR(255) NOT NULL,
    cookie_category VARCHAR(100) NOT NULL CHECK (cookie_category IN ('ESSENTIAL', 'FUNCTIONAL', 'ANALYTICS', 'MARKETING', 'ADVERTISING', 'SOCIAL_MEDIA')),
    
    -- Technical Details
    vendor VARCHAR(255),
    purpose TEXT NOT NULL,
    cookie_type VARCHAR(50) NOT NULL CHECK (cookie_type IN ('session', 'persistent', 'secure', 'httpOnly')),
    duration INTEGER, -- Days for persistent cookies
    domain VARCHAR(255) NOT NULL,
    path VARCHAR(255) DEFAULT '/',
    same_site VARCHAR(20) CHECK (same_site IN ('Strict', 'Lax', 'None')),
    secure_only BOOLEAN DEFAULT FALSE,
    http_only BOOLEAN DEFAULT FALSE,
    
    -- Classification
    essential BOOLEAN NOT NULL DEFAULT FALSE,
    third_party BOOLEAN DEFAULT FALSE,
    cross_site BOOLEAN DEFAULT FALSE,
    
    -- Legal
    legal_basis VARCHAR(100),
    requires_consent BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Cookie Consents
CREATE TABLE user_cookie_consents (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id VARCHAR(255) NOT NULL,
    cookie_id UUID NOT NULL,
    
    -- Consent Status
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Collection Context
    collection_method VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    page_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (cookie_id) REFERENCES cookie_definitions(cookie_id) ON DELETE CASCADE,
    UNIQUE(user_id, session_id, cookie_id)
);

-- ===================================================================
-- Consent History and Audit
-- ===================================================================

-- Consent Change History - Immutable change tracking
CREATE TABLE consent_change_history (
    change_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_id UUID NOT NULL,
    user_id UUID,
    
    -- Change Information
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('initial_grant', 'preference_update', 'withdrawal', 'renewal', 'expiration', 'reauthorization', 'migration', 'correction', 'system_update', 'compliance_adjustment')),
    change_method VARCHAR(50) NOT NULL CHECK (change_method IN ('user_action', 'system_automated', 'admin_override', 'api_call', 'batch_process', 'compliance_requirement', 'legal_requirement', 'data_migration')),
    
    -- State Information (stored as JSONB)
    previous_state JSONB NOT NULL DEFAULT '{}',
    new_state JSONB NOT NULL DEFAULT '{}',
    change_summary JSONB NOT NULL DEFAULT '{}',
    
    -- Context
    change_context JSONB NOT NULL DEFAULT '{}',
    change_reason TEXT NOT NULL,
    
    -- Legal & Compliance
    legal_basis_change JSONB DEFAULT '{}',
    compliance_impact JSONB DEFAULT '{}',
    gdpr_compliance JSONB DEFAULT '{}',
    
    -- Evidence & Integrity
    evidence_id UUID, -- Links to evidence versioning system
    integrity_hash VARCHAR(255) NOT NULL,
    digital_signature VARCHAR(512),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    flags JSONB DEFAULT '[]',
    
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (consent_id) REFERENCES consent_records(consent_id) ON DELETE CASCADE
);

-- Consent Interactions - User interaction tracking
CREATE TABLE consent_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_id UUID,
    user_id UUID,
    session_id VARCHAR(255) NOT NULL,
    
    -- Interaction Details
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('VIEW', 'CLICK', 'SCROLL', 'HOVER', 'FOCUS', 'INPUT', 'SUBMIT', 'CANCEL')),
    action VARCHAR(100) NOT NULL, -- 'view_banner', 'accept_all', 'reject_all', 'customize', etc.
    element_id VARCHAR(255),
    element_type VARCHAR(100),
    
    -- Context
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    
    -- Result
    result VARCHAR(50) CHECK (result IN ('ACCEPT', 'REJECT', 'CUSTOMIZE', 'DEFER', 'IGNORE', 'TIMEOUT')),
    duration INTEGER, -- Milliseconds
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (consent_id) REFERENCES consent_records(consent_id) ON DELETE SET NULL
);

-- ===================================================================
-- Configuration and Templates
-- ===================================================================

-- Consent Configuration - Version-controlled consent configurations
CREATE TABLE consent_configurations (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Configuration Data
    consent_types JSONB NOT NULL DEFAULT '[]', -- Array of ConsentTypeConfig
    banner_config JSONB NOT NULL DEFAULT '{}', -- BannerConfiguration
    compliance_settings JSONB NOT NULL DEFAULT '{}',
    retention_settings JSONB NOT NULL DEFAULT '{}',
    
    -- Jurisdictional Variants
    jurisdiction_overrides JSONB DEFAULT '{}', -- Jurisdiction-specific configurations
    
    -- Status
    active BOOLEAN DEFAULT FALSE,
    default_config BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(version)
);

-- Just-in-Time Prompt Configurations
CREATE TABLE jit_prompt_configs (
    prompt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger_id VARCHAR(255) UNIQUE NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    
    -- Display Configuration
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    appearance JSONB NOT NULL DEFAULT '{}', -- JustInTimeAppearance
    behavior JSONB NOT NULL DEFAULT '{}', -- JustInTimeBehavior
    
    -- Trigger Contexts
    contexts JSONB NOT NULL DEFAULT '[]', -- Array of JustInTimeContext
    
    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_by VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Compliance and Reporting
-- ===================================================================

-- Consent Reports - Pre-generated compliance reports
CREATE TABLE consent_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('user_history', 'compliance_summary', 'deletion_report', 'privacy_requests', 'violation_summary')),
    
    -- Report Scope
    user_id UUID, -- NULL for system-wide reports
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Report Data
    summary JSONB NOT NULL DEFAULT '{}',
    timeline JSONB DEFAULT '[]',
    compliance_analysis JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    
    -- Export Information
    export_formats JSONB DEFAULT '["json"]',
    file_size INTEGER,
    download_url VARCHAR(500),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'expired', 'error')),
    
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    generated_by VARCHAR(255)
);

-- Compliance Violations - Track policy violations
CREATE TABLE compliance_violations (
    violation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    consent_id UUID,
    
    -- Violation Details
    violation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    policy_id VARCHAR(255) NOT NULL,
    policy_version VARCHAR(20),
    
    -- Risk Assessment
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    impact_assessment TEXT,
    
    -- Resolution
    status VARCHAR(50) DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Notifications
    requires_notification BOOLEAN DEFAULT FALSE,
    notification_deadline TIMESTAMP WITH TIME ZONE,
    notifications_sent JSONB DEFAULT '[]',
    
    -- Mitigation
    mitigation_actions JSONB DEFAULT '[]',
    
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (consent_id) REFERENCES consent_records(consent_id) ON DELETE SET NULL
);

-- ===================================================================
-- Performance and Analytics Tables
-- ===================================================================

-- Consent Metrics - Performance tracking
CREATE TABLE consent_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour >= 0 AND metric_hour <= 23),
    
    -- Basic Metrics
    total_consents INTEGER DEFAULT 0,
    new_consents INTEGER DEFAULT 0,
    withdrawn_consents INTEGER DEFAULT 0,
    expired_consents INTEGER DEFAULT 0,
    
    -- Interaction Metrics
    banner_views INTEGER DEFAULT 0,
    banner_accepts INTEGER DEFAULT 0,
    banner_rejects INTEGER DEFAULT 0,
    customization_uses INTEGER DEFAULT 0,
    jit_prompt_views INTEGER DEFAULT 0,
    jit_prompt_accepts INTEGER DEFAULT 0,
    
    -- Performance Metrics
    average_decision_time REAL DEFAULT 0.0, -- Seconds
    consent_completion_rate REAL DEFAULT 0.0, -- Percentage
    
    -- Compliance Metrics
    gdpr_compliance_score REAL DEFAULT 100.0,
    ccpa_compliance_score REAL DEFAULT 100.0,
    violation_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(metric_date, metric_hour)
);

-- ===================================================================
-- Indexes for Performance Optimization
-- ===================================================================

-- Primary table indexes
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_session_id ON consent_records(session_id);
CREATE INDEX idx_consent_records_status ON consent_records(status);
CREATE INDEX idx_consent_records_consent_type ON consent_records(consent_type);
CREATE INDEX idx_consent_records_granted_at ON consent_records(granted_at);
CREATE INDEX idx_consent_records_expires_at ON consent_records(expires_at);
CREATE INDEX idx_consent_records_jurisdiction ON consent_records USING GIN(jurisdiction);
CREATE INDEX idx_consent_records_metadata ON consent_records USING GIN(metadata);

-- Composite indexes for common queries
CREATE INDEX idx_consent_records_user_status ON consent_records(user_id, status);
CREATE INDEX idx_consent_records_user_type ON consent_records(user_id, consent_type);
CREATE INDEX idx_consent_records_session_status ON consent_records(session_id, status);
CREATE INDEX idx_consent_records_active_consents ON consent_records(user_id, status, expires_at) WHERE status = 'ACTIVE';

-- Purpose and category indexes
CREATE INDEX idx_consent_purposes_category ON consent_purposes(category);
CREATE INDEX idx_consent_purposes_essential ON consent_purposes(essential_service);
CREATE INDEX idx_consent_purposes_code ON consent_purposes(purpose_code);
CREATE INDEX idx_data_categories_sensitivity ON data_categories(sensitivity_level);
CREATE INDEX idx_data_categories_classification ON data_categories(data_classification);

-- Third party indexes
CREATE INDEX idx_third_parties_relationship ON third_party_entities(relationship_type);
CREATE INDEX idx_third_parties_jurisdiction ON third_party_entities(jurisdiction);
CREATE INDEX idx_third_parties_active ON third_party_entities(active);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_consent_preferences(user_id);
CREATE INDEX idx_user_preferences_session ON user_consent_preferences(session_id);
CREATE INDEX idx_user_preferences_updated ON user_consent_preferences(last_updated);

-- Cookie indexes
CREATE INDEX idx_cookies_category ON cookie_definitions(cookie_category);
CREATE INDEX idx_cookies_essential ON cookie_definitions(essential);
CREATE INDEX idx_cookies_domain ON cookie_definitions(domain);
CREATE INDEX idx_cookies_active ON cookie_definitions(active);
CREATE INDEX idx_cookie_consents_user ON user_cookie_consents(user_id);
CREATE INDEX idx_cookie_consents_session ON user_cookie_consents(session_id);
CREATE INDEX idx_cookie_consents_cookie ON user_cookie_consents(cookie_id);

-- History table indexes
CREATE INDEX idx_consent_history_consent_timestamp ON consent_change_history(consent_id, timestamp DESC);
CREATE INDEX idx_consent_history_user_timestamp ON consent_change_history(user_id, timestamp DESC);
CREATE INDEX idx_consent_history_consent ON consent_change_history(consent_id);
CREATE INDEX idx_consent_history_user ON consent_change_history(user_id);
CREATE INDEX idx_consent_history_timestamp ON consent_change_history(timestamp);
CREATE INDEX idx_consent_history_change_type ON consent_change_history(change_type);

-- Interaction indexes
CREATE INDEX idx_consent_interactions_consent ON consent_interactions(consent_id);
CREATE INDEX idx_consent_interactions_user ON consent_interactions(user_id);
CREATE INDEX idx_consent_interactions_session ON consent_interactions(session_id);
CREATE INDEX idx_consent_interactions_timestamp ON consent_interactions(timestamp);
CREATE INDEX idx_consent_interactions_action ON consent_interactions(action);

-- Configuration indexes
CREATE INDEX idx_consent_config_version ON consent_configurations(version);
CREATE INDEX idx_consent_config_active ON consent_configurations(active);
CREATE INDEX idx_jit_prompts_trigger ON jit_prompt_configs(trigger_id);
CREATE INDEX idx_jit_prompts_consent_type ON jit_prompt_configs(consent_type);
CREATE INDEX idx_jit_prompts_enabled ON jit_prompt_configs(enabled);

-- Reporting indexes
CREATE INDEX idx_consent_reports_user ON consent_reports(user_id);
CREATE INDEX idx_consent_reports_type ON consent_reports(report_type);
CREATE INDEX idx_consent_reports_generated ON consent_reports(generated_at);
CREATE INDEX idx_violations_user ON compliance_violations(user_id);
CREATE INDEX idx_violations_consent ON compliance_violations(consent_id);
CREATE INDEX idx_violations_severity ON compliance_violations(severity);
CREATE INDEX idx_violations_status ON compliance_violations(status);
CREATE INDEX idx_violations_detected ON compliance_violations(detected_at);

-- Metrics indexes
CREATE INDEX idx_consent_metrics_date ON consent_metrics(metric_date);
CREATE INDEX idx_consent_metrics_hour ON consent_metrics(metric_hour);

-- Performance indexes for JSONB columns
CREATE INDEX idx_user_preferences_communication ON user_consent_preferences USING GIN(communication_preferences);
CREATE INDEX idx_user_preferences_privacy ON user_consent_preferences USING GIN(privacy_settings);
CREATE INDEX idx_consent_configs_types ON consent_configurations USING GIN(consent_types);

-- ===================================================================
-- Views for Common Queries
-- ===================================================================

-- Active Consents View
CREATE VIEW active_consents AS
SELECT 
    cr.*,
    ucp.language,
    ucp.timezone
FROM consent_records cr
LEFT JOIN user_consent_preferences ucp ON cr.user_id = ucp.user_id
WHERE cr.status = 'ACTIVE' 
  AND (cr.expires_at IS NULL OR cr.expires_at > NOW());

-- Consent Summary View
CREATE VIEW consent_summary AS
SELECT 
    user_id,
    COUNT(*) as total_consents,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_consents,
    COUNT(CASE WHEN status = 'WITHDRAWN' THEN 1 END) as withdrawn_consents,
    COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired_consents,
    MAX(granted_at) as last_consent_date,
    MAX(last_modified) as last_modified_date
FROM consent_records
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- Expiring Consents View
CREATE VIEW expiring_consents AS
SELECT 
    cr.*,
    EXTRACT(DAYS FROM (expires_at - NOW())) as days_until_expiry
FROM consent_records cr
WHERE cr.status = 'ACTIVE' 
  AND cr.expires_at IS NOT NULL 
  AND cr.expires_at <= NOW() + INTERVAL '30 days';

-- ===================================================================
-- Triggers for Automation
-- ===================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON consent_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consent_purposes_updated_at BEFORE UPDATE ON consent_purposes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_categories_updated_at BEFORE UPDATE ON data_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_third_party_entities_updated_at BEFORE UPDATE ON third_party_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_consent_preferences_updated_at BEFORE UPDATE ON user_consent_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cookie_definitions_updated_at BEFORE UPDATE ON cookie_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_cookie_consents_updated_at BEFORE UPDATE ON user_cookie_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Consent change logging trigger
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if significant fields changed
    IF (OLD.status != NEW.status OR 
        OLD.expires_at IS DISTINCT FROM NEW.expires_at OR 
        OLD.metadata != NEW.metadata) THEN
        
        INSERT INTO consent_change_history (
            consent_id,
            user_id,
            change_type,
            change_method,
            previous_state,
            new_state,
            change_reason,
            integrity_hash
        ) VALUES (
            NEW.consent_id,
            NEW.user_id,
            CASE 
                WHEN OLD.status = 'ACTIVE' AND NEW.status = 'WITHDRAWN' THEN 'withdrawal'
                WHEN OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN 'renewal'
                ELSE 'preference_update'
            END,
            'system_automated',
            row_to_json(OLD),
            row_to_json(NEW),
            'Automated change detection',
            md5(NEW.consent_id::text || NEW.last_modified::text)
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_consent_record_changes 
    AFTER UPDATE ON consent_records 
    FOR EACH ROW EXECUTE FUNCTION log_consent_change();