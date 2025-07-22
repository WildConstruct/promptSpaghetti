-- Migration: Add Automated Enforcement Tables
-- Epic 17 - Automated Enforcement System
-- Task: E17-1753114397380-E8827E

-- Enforcement actions table
CREATE TABLE IF NOT EXISTS enforcement_actions (
    id SERIAL PRIMARY KEY,
    action_id VARCHAR(255) UNIQUE NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'template', 'transaction')),
    entity_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN ('suspend', 'restrict', 'flag', 'require_verification', 'block_transaction', 'quarantine_template')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reason TEXT NOT NULL,
    triggered_by VARCHAR(100) NOT NULL,
    trigger_details JSONB,
    auto_applied BOOLEAN NOT NULL DEFAULT false,
    action_taken BOOLEAN NOT NULL DEFAULT false,
    action_timestamp TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    review_required BOOLEAN NOT NULL DEFAULT true,
    admin_notes TEXT,
    reversal_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User restrictions table (for granular restrictions)
CREATE TABLE IF NOT EXISTS user_restrictions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, restriction_type)
);

-- Entity flags table (for flagging users, templates, transactions)
CREATE TABLE IF NOT EXISTS entity_flags (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'template', 'transaction')),
    entity_id UUID NOT NULL,
    flag_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    flagged_by VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update user_verification_status table with enforcement fields
ALTER TABLE user_verification_status 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspension_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS requires_additional_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_reason TEXT;

-- Update templates table with enforcement status
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'quarantined', 'restricted')),
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS quarantine_reason TEXT,
ADD COLUMN IF NOT EXISTS quarantined_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS restriction_reason TEXT,
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'restricted', 'private'));

-- Update transactions table with blocking capability
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

-- Update user_sessions table with termination tracking
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS termination_reason VARCHAR(100);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enforcement_actions_entity ON enforcement_actions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_enforcement_actions_type ON enforcement_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_enforcement_actions_timestamp ON enforcement_actions(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_enforcement_actions_expires ON enforcement_actions(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_restrictions_user_id ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_type ON user_restrictions(restriction_type);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_expires ON user_restrictions(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_entity_flags_entity ON entity_flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_flags_type ON entity_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_entity_flags_active ON entity_flags(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_verification_suspended ON user_verification_status(suspended_at) WHERE suspended_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_transactions_blocked ON transactions(blocked_at) WHERE blocked_at IS NOT NULL;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enforcement_actions_updated_at BEFORE UPDATE ON enforcement_actions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_restrictions_updated_at BEFORE UPDATE ON user_restrictions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_entity_flags_updated_at BEFORE UPDATE ON entity_flags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enforcement policies configuration table
CREATE TABLE IF NOT EXISTS enforcement_policies (
    id SERIAL PRIMARY KEY,
    policy_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    policy_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_enforcement_policies_updated_at BEFORE UPDATE ON enforcement_policies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default enforcement policy
INSERT INTO enforcement_policies (policy_id, name, description, policy_config)
VALUES (
    'default-trust-enforcement',
    'Default Trust Score Enforcement',
    'Standard enforcement based on trust scores and risk factors',
    '{
        "triggers": {
            "trustScoreThresholds": {
                "suspend": 25,
                "restrict": 40,
                "flag": 60
            },
            "riskFactorRules": {
                "criticalRiskCount": 1,
                "highRiskCount": 3,
                "automaticSuspension": true
            },
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
        },
        "exemptions": {
            "highTrustUsers": true,
            "verifiedUsers": false,
            "whitelistedEntities": []
        }
    }'::jsonb
) ON CONFLICT (policy_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE enforcement_actions IS 'Records of automated enforcement actions taken by the trust system';
COMMENT ON TABLE user_restrictions IS 'Granular restrictions applied to users based on trust scores and violations';
COMMENT ON TABLE entity_flags IS 'Flags applied to various entities (users, templates, transactions) for review';
COMMENT ON TABLE enforcement_policies IS 'Configuration for automated enforcement policies and rules';

COMMENT ON COLUMN enforcement_actions.action_id IS 'Unique identifier for the enforcement action';
COMMENT ON COLUMN enforcement_actions.entity_type IS 'Type of entity the action applies to (user, template, transaction)';
COMMENT ON COLUMN enforcement_actions.entity_id IS 'ID of the specific entity being acted upon';
COMMENT ON COLUMN enforcement_actions.action_type IS 'Type of enforcement action taken';
COMMENT ON COLUMN enforcement_actions.severity IS 'Severity level of the action';
COMMENT ON COLUMN enforcement_actions.triggered_by IS 'What triggered this enforcement action';
COMMENT ON COLUMN enforcement_actions.trigger_details IS 'JSON details about what specifically triggered the action';
COMMENT ON COLUMN enforcement_actions.auto_applied IS 'Whether the action was automatically applied or requires review';
COMMENT ON COLUMN enforcement_actions.expires_at IS 'When this enforcement action expires (if applicable)';

-- Create a view for active enforcement actions
CREATE OR REPLACE VIEW active_enforcement_actions AS
SELECT *
FROM enforcement_actions
WHERE action_taken = true
  AND (expires_at IS NULL OR expires_at > NOW())
  AND reversal_info IS NULL;

COMMENT ON VIEW active_enforcement_actions IS 'View of currently active (non-expired, non-reversed) enforcement actions';