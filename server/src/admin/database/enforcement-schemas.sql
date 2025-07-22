-- Epic 17.5.4 Policy Enforcement Database Schema
-- Task: E17-1753114397376-1B07D9 - Develop enforcement tools
-- These tables support the PolicyManagementService and admin enforcement tools

-- Policy Templates Table
-- Stores reusable policy templates for creating enforcement policies
CREATE TABLE IF NOT EXISTS policy_templates (
    template_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL CHECK (category IN ('trust_score', 'fraud_detection', 'content_quality', 'user_behavior', 'transaction_monitoring')),
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    default_config JSONB NOT NULL DEFAULT '{}',
    is_system_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Violations Table  
-- Records detected policy violations that require review or action
CREATE TABLE IF NOT EXISTS policy_violations (
    violation_id VARCHAR(64) PRIMARY KEY,
    policy_id VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32) NOT NULL CHECK (entity_type IN ('user', 'template', 'transaction')),
    entity_id VARCHAR(64) NOT NULL,
    violation_type VARCHAR(128) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    evidence JSONB DEFAULT '{}',
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'enforced')),
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    enforcement_actions JSONB DEFAULT '[]'
);

-- Enforcement Requests Table
-- Tracks manual enforcement requests from administrators
CREATE TABLE IF NOT EXISTS enforcement_requests (
    request_id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL CHECK (entity_type IN ('user', 'template', 'transaction')),
    entity_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL CHECK (action_type IN ('suspend', 'restrict', 'flag', 'require_verification', 'block_transaction', 'quarantine_template')),
    reason TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    requested_by VARCHAR(64) NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    evidence JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
    approved_by VARCHAR(64),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- Policy Enforcement History Table
-- Comprehensive audit trail for all policy and enforcement activities
CREATE TABLE IF NOT EXISTS policy_enforcement_history (
    history_id SERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32) NOT NULL CHECK (entity_type IN ('user', 'template', 'transaction', 'policy', 'violation', 'request')),
    entity_id VARCHAR(64) NOT NULL,
    admin_user_id VARCHAR(64),
    event_data JSONB DEFAULT '{}',
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Admin Policy Settings Table
-- Global configuration for policy enforcement system
CREATE TABLE IF NOT EXISTS admin_policy_settings (
    setting_key VARCHAR(128) PRIMARY KEY,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(64),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_policy_templates_category ON policy_templates(category);
CREATE INDEX IF NOT EXISTS idx_policy_templates_system ON policy_templates(is_system_template);
CREATE INDEX IF NOT EXISTS idx_policy_templates_created ON policy_templates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_violations_status ON policy_violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_entity ON policy_violations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON policy_violations(severity);
CREATE INDEX IF NOT EXISTS idx_violations_detected ON policy_violations(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_violations_policy ON policy_violations(policy_id);

CREATE INDEX IF NOT EXISTS idx_requests_status ON enforcement_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_entity ON enforcement_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_requests_requested ON enforcement_requests(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON enforcement_requests(requested_by);

CREATE INDEX IF NOT EXISTS idx_history_event_type ON policy_enforcement_history(event_type);
CREATE INDEX IF NOT EXISTS idx_history_entity ON policy_enforcement_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON policy_enforcement_history(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_admin ON policy_enforcement_history(admin_user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_violations_status_severity ON policy_violations(status, severity);
CREATE INDEX IF NOT EXISTS idx_requests_status_requested ON enforcement_requests(status, requested_at DESC);

-- Insert default policy templates
INSERT INTO policy_templates (template_id, name, description, category, severity, default_config, is_system_template) VALUES
(
    'TPL-TRUST-SCORE-DEFAULT',
    'Default Trust Score Enforcement',
    'Standard enforcement based on user trust scores with graduated responses',
    'trust_score',
    'medium',
    '{
        "triggers": {
            "trustScoreThresholds": {
                "suspend": 25,
                "restrict": 40,
                "flag": 60
            }
        },
        "actions": {
            "autoSuspension": true,
            "autoRestriction": true,
            "autoFlagging": true,
            "requireManualReview": true,
            "notifyAdmins": true
        },
        "exemptions": {
            "highTrustUsers": true,
            "verifiedUsers": false
        }
    }',
    true
),
(
    'TPL-FRAUD-DETECTION',
    'Fraud Detection Policy',
    'Automated fraud detection with transaction blocking and user restrictions',
    'fraud_detection',
    'critical',
    '{
        "triggers": {
            "fraudDetectionRules": {
                "fraudScoreThreshold": 80,
                "suspiciousIndicatorThreshold": 3
            }
        },
        "actions": {
            "autoSuspension": true,
            "autoRestriction": true,
            "autoFlagging": true,
            "requireManualReview": true,
            "notifyAdmins": true
        }
    }',
    true
),
(
    'TPL-CONTENT-QUALITY',
    'Content Quality Enforcement',
    'Template quality enforcement with quarantine for low-quality content',
    'content_quality',
    'medium',
    '{
        "triggers": {
            "qualityThresholds": {
                "quarantine": 30,
                "restrict": 50,
                "flag": 70
            }
        },
        "actions": {
            "autoFlagging": true,
            "requireManualReview": true,
            "notifyAdmins": false
        }
    }',
    true
),
(
    'TPL-USER-BEHAVIOR',
    'User Behavior Monitoring',
    'Monitor and respond to suspicious user behavior patterns',
    'user_behavior',
    'high',
    '{
        "triggers": {
            "behaviorRules": {
                "rapidActionThreshold": 100,
                "suspiciousPatternCount": 5
            }
        },
        "actions": {
            "autoRestriction": true,
            "autoFlagging": true,
            "requireManualReview": true,
            "notifyAdmins": true
        }
    }',
    true
),
(
    'TPL-TRANSACTION-MONITORING',
    'Transaction Monitoring Policy',
    'Monitor high-value and suspicious transactions',
    'transaction_monitoring',
    'high',
    '{
        "triggers": {
            "transactionRules": {
                "highValueThreshold": 1000,
                "velocityThreshold": 10,
                "riskScoreThreshold": 75
            }
        },
        "actions": {
            "requireManualReview": true,
            "notifyAdmins": true,
            "autoFlagging": true
        }
    }',
    true
)
ON CONFLICT (template_id) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_policy_settings (setting_key, setting_value, description) VALUES
(
    'enforcement_system_enabled',
    'true',
    'Global toggle for the entire policy enforcement system'
),
(
    'auto_enforcement_enabled', 
    'true',
    'Enable automated enforcement actions without manual review'
),
(
    'violation_scan_interval',
    '300',
    'Interval in seconds between automated violation scans'
),
(
    'high_severity_notification',
    'true',
    'Send immediate notifications for high and critical severity violations'
),
(
    'max_pending_violations',
    '1000',
    'Maximum number of pending violations before system alerts'
),
(
    'enforcement_rate_limit',
    '{"max_actions_per_hour": 100, "max_suspensions_per_day": 50}',
    'Rate limits for automated enforcement actions'
)
ON CONFLICT (setting_key) DO NOTHING;