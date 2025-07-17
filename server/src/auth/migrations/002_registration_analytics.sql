-- Epic 11 Registration Analytics Schema
-- Additional tables for registration tracking and analytics

-- Registration analytics tracking table
CREATE TABLE IF NOT EXISTS registration_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed', 'email_sent', etc.
    email_hash VARCHAR(64), -- SHA256 hash of email for privacy
    ip_address INET,
    user_agent TEXT,
    source VARCHAR(100), -- 'organic', 'invitation', 'referral', etc.
    referrer VARCHAR(500),
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registration funnel tracking
CREATE TABLE IF NOT EXISTS registration_funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    email_hash VARCHAR(64),
    step VARCHAR(50) NOT NULL, -- 'landing', 'form_started', 'form_submitted', 'email_verified'
    step_data JSONB DEFAULT '{}',
    duration_ms INTEGER, -- Time spent on this step
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B testing for registration flows
CREATE TABLE IF NOT EXISTS registration_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_name VARCHAR(100) NOT NULL,
    variant VARCHAR(50) NOT NULL, -- 'control', 'variant_a', 'variant_b'
    email_hash VARCHAR(64),
    converted BOOLEAN DEFAULT FALSE,
    conversion_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registration source tracking
CREATE TABLE IF NOT EXISTS registration_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    utm_parameters JSONB, -- UTM tracking parameters
    conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
    total_visits INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User onboarding progress tracking
CREATE TABLE IF NOT EXISTS user_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL, -- 'email_verified', 'profile_completed', 'first_graph_created'
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    skip_reason VARCHAR(100), -- If user skipped this step
    step_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, step)
);

-- Email delivery tracking
CREATE TABLE IF NOT EXISTS email_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email_type VARCHAR(50) NOT NULL, -- 'verification', 'password_reset', 'welcome'
    email_address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    external_id VARCHAR(255), -- ID from email service provider
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- Registration form field analytics
CREATE TABLE IF NOT EXISTS form_field_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(20) NOT NULL, -- 'focus', 'blur', 'change', 'error'
    field_value_length INTEGER,
    error_message TEXT,
    time_spent_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registration_analytics_event_type ON registration_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_registration_analytics_created_at ON registration_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_registration_analytics_source ON registration_analytics(source);
CREATE INDEX IF NOT EXISTS idx_registration_analytics_email_hash ON registration_analytics(email_hash);

CREATE INDEX IF NOT EXISTS idx_registration_funnel_session_id ON registration_funnel(session_id);
CREATE INDEX IF NOT EXISTS idx_registration_funnel_step ON registration_funnel(step);
CREATE INDEX IF NOT EXISTS idx_registration_funnel_created_at ON registration_funnel(created_at);

CREATE INDEX IF NOT EXISTS idx_registration_experiments_experiment ON registration_experiments(experiment_name);
CREATE INDEX IF NOT EXISTS idx_registration_experiments_variant ON registration_experiments(variant);
CREATE INDEX IF NOT EXISTS idx_registration_experiments_converted ON registration_experiments(converted);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step ON user_onboarding(step);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(completed);

CREATE INDEX IF NOT EXISTS idx_email_deliveries_user_id ON email_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_email_type ON email_deliveries(email_type);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_status ON email_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_sent_at ON email_deliveries(sent_at);

CREATE INDEX IF NOT EXISTS idx_form_field_analytics_session_id ON form_field_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_form_field_analytics_field_name ON form_field_analytics(field_name);
CREATE INDEX IF NOT EXISTS idx_form_field_analytics_event_type ON form_field_analytics(event_type);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_registration_analytics_additional_data_gin ON registration_analytics USING GIN(additional_data);
CREATE INDEX IF NOT EXISTS idx_registration_experiments_conversion_data_gin ON registration_experiments USING GIN(conversion_data);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step_data_gin ON user_onboarding USING GIN(step_data);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_metadata_gin ON email_deliveries USING GIN(metadata);

-- Insert default registration sources
INSERT INTO registration_sources (source_name, description) VALUES
    ('organic', 'Direct traffic or bookmarks'),
    ('google', 'Google search results'),
    ('social', 'Social media platforms'),
    ('referral', 'Referral from other websites'),
    ('email', 'Email marketing campaigns'),
    ('invitation', 'User invitations'),
    ('github', 'GitHub OAuth registration'),
    ('google_oauth', 'Google OAuth registration')
ON CONFLICT (source_name) DO NOTHING;

-- Create function to update registration source stats
CREATE OR REPLACE FUNCTION update_registration_source_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'completed' THEN
        UPDATE registration_sources 
        SET 
            total_registrations = total_registrations + 1,
            conversion_rate = CASE 
                WHEN total_visits > 0 THEN (total_registrations + 1)::DECIMAL / total_visits 
                ELSE 0 
            END,
            updated_at = NOW()
        WHERE source_name = COALESCE(NEW.source, 'organic');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update registration source stats
DROP TRIGGER IF EXISTS trigger_update_registration_source_stats ON registration_analytics;
CREATE TRIGGER trigger_update_registration_source_stats
    AFTER INSERT ON registration_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_registration_source_stats();

-- Create function to get registration conversion funnel
CREATE OR REPLACE FUNCTION get_registration_funnel_stats(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    step VARCHAR(50),
    count BIGINT,
    conversion_rate DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_data AS (
        SELECT 
            rf.step,
            COUNT(DISTINCT rf.session_id) as step_count,
            LAG(COUNT(DISTINCT rf.session_id)) OVER (ORDER BY 
                CASE rf.step 
                    WHEN 'landing' THEN 1
                    WHEN 'form_started' THEN 2
                    WHEN 'form_submitted' THEN 3
                    WHEN 'email_verified' THEN 4
                    ELSE 5
                END
            ) as previous_step_count
        FROM registration_funnel rf
        WHERE rf.created_at BETWEEN start_date AND end_date
        GROUP BY rf.step
        ORDER BY 
            CASE rf.step 
                WHEN 'landing' THEN 1
                WHEN 'form_started' THEN 2
                WHEN 'form_submitted' THEN 3
                WHEN 'email_verified' THEN 4
                ELSE 5
            END
    )
    SELECT 
        fd.step,
        fd.step_count as count,
        CASE 
            WHEN fd.previous_step_count > 0 THEN 
                (fd.step_count::DECIMAL / fd.previous_step_count)
            ELSE 1.0
        END as conversion_rate
    FROM funnel_data fd;
END;
$$ LANGUAGE plpgsql;