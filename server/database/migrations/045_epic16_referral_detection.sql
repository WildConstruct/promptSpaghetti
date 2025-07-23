-- Epic 16 Referral Detection System Database Schema
-- 
-- Comprehensive referral tracking and fraud detection database tables,
-- indexes, triggers, and stored procedures for the marketplace platform.
-- 
-- Features:
-- - Multi-channel referral tracking with UTM parameters
-- - Advanced fraud detection with risk scoring
-- - Attribution modeling for conversion tracking
-- - Campaign management with ROI calculation
-- - Real-time analytics and performance metrics

-- =============================================================================
-- Core Referral Tables
-- =============================================================================

-- Referral campaigns and programs
CREATE TABLE IF NOT EXISTS referral_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Campaign configuration
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN (
        'affiliate', 'influencer', 'partnership', 'organic', 'paid_advertising'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'draft', 'active', 'paused', 'expired', 'archived'
    )),
    
    -- Campaign lifecycle
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Reward configuration
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN (
        'percentage', 'fixed_amount', 'tiered', 'progressive'
    )),
    reward_value DECIMAL(10,4) NOT NULL CHECK (reward_value >= 0),
    reward_currency VARCHAR(3) DEFAULT 'USD',
    max_reward_per_referrer DECIMAL(10,2),
    
    -- Targeting and constraints
    target_audience JSONB DEFAULT '{}',
    geographic_restrictions JSONB DEFAULT '{}',
    minimum_conversion_value DECIMAL(10,2) DEFAULT 0,
    
    -- Performance tracking
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    total_reward_paid DECIMAL(12,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'
);

-- Main referral tracking data
CREATE TABLE IF NOT EXISTS referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(50) NOT NULL,
    campaign_id UUID REFERENCES referral_campaigns(id) ON DELETE CASCADE,
    
    -- User identification
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_user_id UUID REFERENCES users(id),
    
    -- Source and attribution
    source VARCHAR(50) NOT NULL CHECK (source IN (
        'direct_link', 'social_media', 'email_campaign', 'search_engine',
        'affiliate_network', 'word_of_mouth', 'organic_discovery', 
        'paid_advertising', 'influencer', 'partnership', 'content_marketing', 'unknown'
    )),
    source_url TEXT,
    landing_page TEXT NOT NULL,
    
    -- UTM tracking parameters
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- Device and session information
    user_agent TEXT,
    ip_address INET NOT NULL,
    device_fingerprint VARCHAR(100),
    session_id UUID NOT NULL,
    
    -- Geolocation data
    country CHAR(2),
    region VARCHAR(50),
    city VARCHAR(50),
    timezone VARCHAR(50),
    
    -- Referral lifecycle and conversion
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'verified', 'credited', 'rejected', 'fraudulent', 'expired'
    )),
    conversion_event VARCHAR(100),
    conversion_value DECIMAL(10,2),
    conversion_date TIMESTAMP WITH TIME ZONE,
    attribution_model VARCHAR(50) DEFAULT 'last_touch' CHECK (attribution_model IN (
        'first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven'
    )),
    
    -- Fraud detection
    fraud_risk_level VARCHAR(20) DEFAULT 'low' CHECK (fraud_risk_level IN (
        'low', 'medium', 'high', 'critical'
    )),
    fraud_risk_score DECIMAL(5,2) DEFAULT 0 CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 100),
    fraud_indicators JSONB DEFAULT '{}',
    
    -- Timestamps
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_visit_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics and context
    visit_count INTEGER DEFAULT 1,
    page_views INTEGER DEFAULT 1,
    time_on_site INTEGER DEFAULT 0, -- seconds
    bounce_rate DECIMAL(5,2),
    
    -- Metadata and relationships
    parent_referral_id UUID REFERENCES referral_tracking(id),
    related_transaction_id UUID,
    tags TEXT[] DEFAULT '{}',
    custom_data JSONB DEFAULT '{}',
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id)
);

-- Fraud detection rules and patterns
CREATE TABLE IF NOT EXISTS referral_fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule configuration
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'ip_velocity', 'device_fingerprint', 'geographic_anomaly', 
        'behavioral_pattern', 'time_pattern', 'conversion_pattern'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'testing'
    )),
    
    -- Rule logic
    conditions JSONB NOT NULL,
    thresholds JSONB NOT NULL,
    actions JSONB NOT NULL,
    
    -- Performance metrics
    triggers_count INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    true_positives INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    last_evaluated_at TIMESTAMP WITH TIME ZONE
);

-- Attribution model configurations
CREATE TABLE IF NOT EXISTS referral_attribution_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven'
    )),
    
    -- Model parameters
    parameters JSONB NOT NULL,
    decay_rate DECIMAL(5,4), -- for time_decay model
    position_weights JSONB, -- for position_based model
    
    -- Model performance
    accuracy_score DECIMAL(5,2),
    conversion_lift DECIMAL(5,2),
    revenue_attribution DECIMAL(12,2),
    
    -- Status and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'testing'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Referral rewards and payouts
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referral_tracking(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES referral_campaigns(id),
    
    -- Reward recipient
    referrer_id UUID NOT NULL REFERENCES users(id),
    
    -- Reward calculation
    reward_type VARCHAR(50) NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    multiplier DECIMAL(5,2) DEFAULT 1.0,
    final_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Reward status and processing
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'paid', 'rejected', 'expired'
    )),
    calculation_method VARCHAR(100),
    calculation_details JSONB DEFAULT '{}',
    
    -- Payment processing
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_fees DECIMAL(10,2) DEFAULT 0,
    
    -- Audit and compliance
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    compliance_checks JSONB DEFAULT '{}',
    
    -- Timestamps
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Performance and Analytics Tables
-- =============================================================================

-- Daily referral analytics aggregation
CREATE TABLE IF NOT EXISTS referral_daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    campaign_id UUID REFERENCES referral_campaigns(id),
    
    -- Traffic metrics
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    unique_visits INTEGER DEFAULT 0,
    
    -- Conversion metrics
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    conversion_value DECIMAL(12,2) DEFAULT 0,
    average_conversion_value DECIMAL(10,2) DEFAULT 0,
    
    -- Fraud metrics
    fraud_attempts INTEGER DEFAULT 0,
    fraud_prevented_value DECIMAL(10,2) DEFAULT 0,
    
    -- Reward metrics
    rewards_earned DECIMAL(12,2) DEFAULT 0,
    rewards_paid DECIMAL(12,2) DEFAULT 0,
    active_referrers INTEGER DEFAULT 0,
    
    -- Geographic breakdown
    top_countries JSONB DEFAULT '{}',
    top_regions JSONB DEFAULT '{}',
    
    -- Source attribution
    source_breakdown JSONB DEFAULT '{}',
    utm_performance JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, campaign_id)
);

-- Real-time referral events for analytics
CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referral_tracking(id),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'click', 'visit', 'signup', 'conversion', 'reward_earned', 
        'fraud_detected', 'verification_completed'
    )),
    event_data JSONB DEFAULT '{}',
    
    -- Performance tracking
    processing_time_ms INTEGER,
    attribution_confidence DECIMAL(5,2),
    
    -- Timestamps
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Audit trail
    created_by_service VARCHAR(100),
    correlation_id UUID
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_referrer_id 
    ON referral_tracking(referrer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_referred_user_id 
    ON referral_tracking(referred_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_campaign_id 
    ON referral_tracking(campaign_id);

-- Performance-critical indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_referral_code 
    ON referral_tracking(referral_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_status 
    ON referral_tracking(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_ip_address 
    ON referral_tracking(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_device_fingerprint 
    ON referral_tracking(device_fingerprint);

-- Time-based indexes for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_clicked_at 
    ON referral_tracking(clicked_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_conversion_date 
    ON referral_tracking(conversion_date);

-- Fraud detection indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_fraud_risk_level 
    ON referral_tracking(fraud_risk_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_fraud_risk_score 
    ON referral_tracking(fraud_risk_score);

-- Geographic indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_country 
    ON referral_tracking(country);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_country_region 
    ON referral_tracking(country, region);

-- UTM parameter indexes for attribution
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_utm_source 
    ON referral_tracking(utm_source);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_utm_campaign 
    ON referral_tracking(utm_campaign);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_status_created 
    ON referral_tracking(status, clicked_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_referrer_status 
    ON referral_tracking(referrer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_tracking_campaign_status 
    ON referral_tracking(campaign_id, status);

-- Analytics table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_daily_analytics_date 
    ON referral_daily_analytics(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_daily_analytics_campaign_date 
    ON referral_daily_analytics(campaign_id, date);

-- Events table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_events_referral_id 
    ON referral_events(referral_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_events_type_occurred 
    ON referral_events(event_type, occurred_at);

-- Rewards table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_rewards_referrer_id 
    ON referral_rewards(referrer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_rewards_status 
    ON referral_rewards(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_rewards_earned_at 
    ON referral_rewards(earned_at);

-- =============================================================================
-- Triggers and Automation
-- =============================================================================

-- Update referral tracking updated_at timestamp
CREATE OR REPLACE FUNCTION update_referral_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referral_tracking_updated_at
    BEFORE UPDATE ON referral_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_tracking_updated_at();

-- Update campaign metrics when referral status changes
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update campaign totals when referral status changes
    IF OLD.status != NEW.status THEN
        -- Update total conversions
        IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
            UPDATE referral_campaigns 
            SET successful_conversions = successful_conversions + 1
            WHERE id = NEW.campaign_id;
        ELSIF OLD.status = 'verified' AND NEW.status != 'verified' THEN
            UPDATE referral_campaigns 
            SET successful_conversions = GREATEST(0, successful_conversions - 1)
            WHERE id = NEW.campaign_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_metrics
    AFTER UPDATE ON referral_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_metrics();

-- Automatic fraud risk calculation
CREATE OR REPLACE FUNCTION calculate_fraud_risk()
RETURNS TRIGGER AS $$
DECLARE
    risk_score DECIMAL(5,2) := 0;
    risk_level VARCHAR(20) := 'low';
    same_ip_count INTEGER;
    same_device_count INTEGER;
BEGIN
    -- IP velocity check
    SELECT COUNT(*) INTO same_ip_count
    FROM referral_tracking
    WHERE ip_address = NEW.ip_address
    AND clicked_at > NOW() - INTERVAL '1 hour';
    
    IF same_ip_count > 10 THEN
        risk_score := risk_score + 30;
    ELSIF same_ip_count > 5 THEN
        risk_score := risk_score + 15;
    END IF;
    
    -- Device fingerprint check
    IF NEW.device_fingerprint IS NOT NULL THEN
        SELECT COUNT(*) INTO same_device_count
        FROM referral_tracking
        WHERE device_fingerprint = NEW.device_fingerprint
        AND clicked_at > NOW() - INTERVAL '24 hours';
        
        IF same_device_count > 5 THEN
            risk_score := risk_score + 25;
        ELSIF same_device_count > 2 THEN
            risk_score := risk_score + 10;
        END IF;
    END IF;
    
    -- Geographic consistency check
    IF NEW.country IS NOT NULL THEN
        -- Add risk for unusual geographic patterns
        -- (Implementation would check against user's typical locations)
        IF NEW.country NOT IN ('US', 'CA', 'GB', 'DE', 'FR') THEN
            risk_score := risk_score + 5;
        END IF;
    END IF;
    
    -- Determine risk level
    IF risk_score >= 70 THEN
        risk_level := 'critical';
    ELSIF risk_score >= 40 THEN
        risk_level := 'high';
    ELSIF risk_score >= 20 THEN
        risk_level := 'medium';
    ELSE
        risk_level := 'low';
    END IF;
    
    NEW.fraud_risk_score := LEAST(100, risk_score);
    NEW.fraud_risk_level := risk_level;
    
    -- Auto-flag high-risk referrals
    IF risk_level IN ('high', 'critical') THEN
        NEW.status := 'pending'; -- Requires manual review
        NEW.fraud_indicators := jsonb_build_object(
            'ip_velocity', same_ip_count,
            'device_reuse', same_device_count,
            'auto_flagged', true,
            'risk_calculation_timestamp', NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_fraud_risk
    BEFORE INSERT OR UPDATE ON referral_tracking
    FOR EACH ROW
    EXECUTE FUNCTION calculate_fraud_risk();

-- =============================================================================
-- Stored Procedures for Common Operations
-- =============================================================================

-- Generate daily analytics aggregation
CREATE OR REPLACE FUNCTION aggregate_daily_referral_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
BEGIN
    INSERT INTO referral_daily_analytics (
        date, campaign_id, total_clicks, unique_clicks, total_visits, unique_visits,
        total_conversions, conversion_rate, conversion_value, average_conversion_value,
        fraud_attempts, fraud_prevented_value, rewards_earned, active_referrers,
        top_countries, source_breakdown, utm_performance
    )
    SELECT 
        target_date,
        campaign_id,
        COUNT(*) as total_clicks,
        COUNT(DISTINCT session_id) as unique_clicks,
        SUM(visit_count) as total_visits,
        COUNT(DISTINCT referred_user_id) FILTER (WHERE referred_user_id IS NOT NULL) as unique_visits,
        COUNT(*) FILTER (WHERE status = 'verified') as total_conversions,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'verified')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
        ) as conversion_rate,
        COALESCE(SUM(conversion_value) FILTER (WHERE status = 'verified'), 0) as conversion_value,
        ROUND(
            COALESCE(SUM(conversion_value) FILTER (WHERE status = 'verified'), 0) / 
            NULLIF(COUNT(*) FILTER (WHERE status = 'verified'), 0), 2
        ) as average_conversion_value,
        COUNT(*) FILTER (WHERE fraud_risk_level IN ('high', 'critical')) as fraud_attempts,
        COALESCE(SUM(conversion_value) FILTER (WHERE fraud_risk_level IN ('high', 'critical')), 0) as fraud_prevented_value,
        (
            SELECT COALESCE(SUM(final_amount), 0)
            FROM referral_rewards r
            WHERE r.campaign_id = rt.campaign_id
            AND DATE(r.earned_at) = target_date
        ) as rewards_earned,
        COUNT(DISTINCT referrer_id) as active_referrers,
        jsonb_object_agg(country, country_count) FILTER (WHERE country IS NOT NULL) as top_countries,
        jsonb_object_agg(source, source_count) as source_breakdown,
        jsonb_object_agg(
            COALESCE(utm_campaign, 'direct'), 
            utm_count
        ) FILTER (WHERE utm_campaign IS NOT NULL) as utm_performance
    FROM (
        SELECT 
            *,
            COUNT(*) OVER (PARTITION BY campaign_id, country) as country_count,
            COUNT(*) OVER (PARTITION BY campaign_id, source) as source_count,
            COUNT(*) OVER (PARTITION BY campaign_id, utm_campaign) as utm_count
        FROM referral_tracking rt
        WHERE DATE(clicked_at) = target_date
    ) rt
    GROUP BY campaign_id
    ON CONFLICT (date, campaign_id)
    DO UPDATE SET
        total_clicks = EXCLUDED.total_clicks,
        unique_clicks = EXCLUDED.unique_clicks,
        total_visits = EXCLUDED.total_visits,
        unique_visits = EXCLUDED.unique_visits,
        total_conversions = EXCLUDED.total_conversions,
        conversion_rate = EXCLUDED.conversion_rate,
        conversion_value = EXCLUDED.conversion_value,
        average_conversion_value = EXCLUDED.average_conversion_value,
        fraud_attempts = EXCLUDED.fraud_attempts,
        fraud_prevented_value = EXCLUDED.fraud_prevented_value,
        rewards_earned = EXCLUDED.rewards_earned,
        active_referrers = EXCLUDED.active_referrers,
        top_countries = EXCLUDED.top_countries,
        source_breakdown = EXCLUDED.source_breakdown,
        utm_performance = EXCLUDED.utm_performance,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Calculate referral attribution
CREATE OR REPLACE FUNCTION calculate_referral_attribution(
    p_referral_id UUID,
    p_attribution_model VARCHAR DEFAULT 'last_touch'
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    attribution_weight DECIMAL(5,2) := 1.0;
    conversion_time TIMESTAMP WITH TIME ZONE;
    click_time TIMESTAMP WITH TIME ZONE;
    time_diff_hours DECIMAL;
BEGIN
    -- Get referral timing information
    SELECT clicked_at, conversion_date
    INTO click_time, conversion_time
    FROM referral_tracking
    WHERE id = p_referral_id;
    
    IF conversion_time IS NULL THEN
        RETURN 0; -- No conversion, no attribution
    END IF;
    
    -- Calculate time difference in hours
    time_diff_hours := EXTRACT(EPOCH FROM (conversion_time - click_time)) / 3600;
    
    -- Apply attribution model
    CASE p_attribution_model
        WHEN 'first_touch' THEN
            -- First touch gets full credit
            attribution_weight := 1.0;
            
        WHEN 'last_touch' THEN
            -- Last touch gets full credit
            attribution_weight := 1.0;
            
        WHEN 'linear' THEN
            -- Linear attribution - equal weight across all touchpoints
            -- Would need to count total touchpoints in actual implementation
            attribution_weight := 1.0;
            
        WHEN 'time_decay' THEN
            -- Time decay - more recent interactions get more credit
            -- Exponential decay with 7-day half-life
            IF time_diff_hours > 0 THEN
                attribution_weight := EXP(-time_diff_hours / (7 * 24) * LN(2));
            ELSE
                attribution_weight := 1.0;
            END IF;
            
        WHEN 'position_based' THEN
            -- Position-based (40% first, 40% last, 20% middle)
            -- Simplified to last-touch for single referral
            attribution_weight := 1.0;
            
        ELSE
            -- Default to last-touch
            attribution_weight := 1.0;
    END CASE;
    
    RETURN GREATEST(0, LEAST(1, attribution_weight));
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired referrals
CREATE OR REPLACE FUNCTION cleanup_expired_referrals()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark expired referrals
    UPDATE referral_tracking
    SET status = 'expired'
    WHERE status IN ('pending', 'verified')
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Archive old referral events (older than 1 year)
    DELETE FROM referral_events
    WHERE occurred_at < NOW() - INTERVAL '1 year';
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- Comprehensive referral performance view
CREATE OR REPLACE VIEW referral_performance_summary AS
SELECT 
    rt.campaign_id,
    rc.name as campaign_name,
    rt.referrer_id,
    u.username as referrer_username,
    
    -- Traffic metrics
    COUNT(*) as total_referrals,
    COUNT(DISTINCT rt.session_id) as unique_sessions,
    COUNT(DISTINCT rt.referred_user_id) FILTER (WHERE rt.referred_user_id IS NOT NULL) as unique_conversions,
    
    -- Conversion metrics
    COUNT(*) FILTER (WHERE rt.status = 'verified') as successful_conversions,
    ROUND(
        (COUNT(*) FILTER (WHERE rt.status = 'verified')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
    ) as conversion_rate,
    COALESCE(SUM(rt.conversion_value) FILTER (WHERE rt.status = 'verified'), 0) as total_conversion_value,
    
    -- Fraud metrics
    COUNT(*) FILTER (WHERE rt.fraud_risk_level IN ('high', 'critical')) as fraud_attempts,
    AVG(rt.fraud_risk_score) as avg_fraud_risk_score,
    
    -- Reward metrics
    COALESCE(SUM(rr.final_amount), 0) as total_rewards_earned,
    COALESCE(SUM(rr.final_amount) FILTER (WHERE rr.status = 'paid'), 0) as total_rewards_paid,
    
    -- Time metrics
    MIN(rt.clicked_at) as first_referral_date,
    MAX(rt.clicked_at) as last_referral_date,
    AVG(rt.time_on_site) as avg_time_on_site
    
FROM referral_tracking rt
JOIN referral_campaigns rc ON rt.campaign_id = rc.id
JOIN users u ON rt.referrer_id = u.id
LEFT JOIN referral_rewards rr ON rt.id = rr.referral_id
GROUP BY rt.campaign_id, rc.name, rt.referrer_id, u.username;

-- High-risk referrals requiring review
CREATE OR REPLACE VIEW high_risk_referrals AS
SELECT 
    rt.id,
    rt.referral_code,
    rt.referrer_id,
    u.username as referrer_username,
    rt.ip_address,
    rt.device_fingerprint,
    rt.fraud_risk_level,
    rt.fraud_risk_score,
    rt.fraud_indicators,
    rt.status,
    rt.clicked_at,
    rt.conversion_value,
    rc.name as campaign_name
FROM referral_tracking rt
JOIN users u ON rt.referrer_id = u.id
JOIN referral_campaigns rc ON rt.campaign_id = rc.id
WHERE rt.fraud_risk_level IN ('high', 'critical')
OR rt.fraud_risk_score > 50
ORDER BY rt.fraud_risk_score DESC, rt.clicked_at DESC;

-- Attribution analysis view
CREATE OR REPLACE VIEW referral_attribution_analysis AS
SELECT 
    rt.id as referral_id,
    rt.referrer_id,
    rt.campaign_id,
    rc.name as campaign_name,
    rt.source,
    rt.utm_source,
    rt.utm_medium,
    rt.utm_campaign,
    rt.attribution_model,
    rt.conversion_value,
    rt.clicked_at,
    rt.conversion_date,
    EXTRACT(EPOCH FROM (rt.conversion_date - rt.clicked_at)) / 3600 as hours_to_conversion,
    calculate_referral_attribution(rt.id, rt.attribution_model) as attribution_weight,
    rt.conversion_value * calculate_referral_attribution(rt.id, rt.attribution_model) as attributed_value
FROM referral_tracking rt
JOIN referral_campaigns rc ON rt.campaign_id = rc.id
WHERE rt.status = 'verified' 
AND rt.conversion_date IS NOT NULL;

-- =============================================================================
-- Security and Permissions
-- =============================================================================

-- Grant appropriate permissions for the referral system
-- (Adjust based on your application's user roles)

-- Grant read access to analytics views
GRANT SELECT ON referral_performance_summary TO marketplace_readonly;
GRANT SELECT ON high_risk_referrals TO marketplace_readonly;
GRANT SELECT ON referral_attribution_analysis TO marketplace_readonly;

-- Grant read/write access to main tables for the application
GRANT SELECT, INSERT, UPDATE ON referral_campaigns TO marketplace_app;
GRANT SELECT, INSERT, UPDATE ON referral_tracking TO marketplace_app;
GRANT SELECT, INSERT, UPDATE ON referral_rewards TO marketplace_app;
GRANT SELECT, INSERT, UPDATE ON referral_fraud_rules TO marketplace_app;
GRANT SELECT, INSERT, UPDATE ON referral_attribution_models TO marketplace_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON referral_events TO marketplace_app;

-- Grant analytics table access
GRANT SELECT, INSERT, UPDATE ON referral_daily_analytics TO marketplace_app;

-- Grant sequence access for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO marketplace_app;

-- =============================================================================
-- Sample Data and Initial Configuration
-- =============================================================================

-- Insert default attribution models
INSERT INTO referral_attribution_models (name, model_type, parameters, status) VALUES
('Last Touch Attribution', 'last_touch', '{"description": "Full credit to last referral"}', 'active'),
('First Touch Attribution', 'first_touch', '{"description": "Full credit to first referral"}', 'active'),
('Linear Attribution', 'linear', '{"description": "Equal credit across all touchpoints"}', 'active'),
('Time Decay Attribution', 'time_decay', '{"half_life_days": 7, "description": "Recent touchpoints weighted higher"}', 'active'),
('Position Based Attribution', 'position_based', '{"first_touch": 0.4, "last_touch": 0.4, "middle": 0.2}', 'active')
ON CONFLICT DO NOTHING;

-- Insert basic fraud detection rules
INSERT INTO referral_fraud_rules (name, rule_type, conditions, thresholds, actions) VALUES
('IP Velocity Check', 'ip_velocity', 
 '{"check_type": "ip_frequency", "time_window": "1 hour"}', 
 '{"max_referrals": 10, "warning_threshold": 5}',
 '{"flag_high_risk": true, "require_manual_review": true}'),
('Device Fingerprint Reuse', 'device_fingerprint',
 '{"check_type": "device_reuse", "time_window": "24 hours"}',
 '{"max_referrals": 5, "warning_threshold": 2}',
 '{"flag_high_risk": true, "increase_risk_score": 25}'),
('Geographic Anomaly Detection', 'geographic_anomaly',
 '{"check_type": "unusual_location", "baseline_countries": ["US", "CA", "GB", "DE", "FR"]}',
 '{"risk_score_increase": 5}',
 '{"flag_for_review": false, "log_anomaly": true}')
ON CONFLICT DO NOTHING;

-- Create a sample campaign for testing
INSERT INTO referral_campaigns (
    name, description, campaign_type, status, start_date, 
    reward_type, reward_value, reward_currency, target_audience
) VALUES (
    'Marketplace Launch Referral Program',
    'Referral program for marketplace launch with percentage-based rewards',
    'affiliate',
    'active',
    NOW(),
    'percentage',
    10.0000, -- 10% commission
    'USD',
    '{"target_regions": ["US", "CA"], "user_types": ["creator", "buyer"]}'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- Maintenance and Monitoring
-- =============================================================================

-- Create maintenance functions that should be run periodically

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_statistics()
RETURNS VOID AS $$
BEGIN
    UPDATE referral_campaigns
    SET 
        total_referrals = (
            SELECT COUNT(*) 
            FROM referral_tracking 
            WHERE campaign_id = referral_campaigns.id
        ),
        successful_conversions = (
            SELECT COUNT(*) 
            FROM referral_tracking 
            WHERE campaign_id = referral_campaigns.id 
            AND status = 'verified'
        ),
        total_reward_paid = (
            SELECT COALESCE(SUM(final_amount), 0)
            FROM referral_rewards
            WHERE campaign_id = referral_campaigns.id
            AND status = 'paid'
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Health check function for the referral system
CREATE OR REPLACE FUNCTION referral_system_health_check()
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    pending_reviews INTEGER;
    high_risk_count INTEGER;
    processing_lag INTERVAL;
BEGIN
    -- Check for pending manual reviews
    SELECT COUNT(*) INTO pending_reviews
    FROM referral_tracking
    WHERE status = 'pending' AND fraud_risk_level IN ('high', 'critical');
    
    -- Check high-risk referral volume
    SELECT COUNT(*) INTO high_risk_count
    FROM referral_tracking
    WHERE fraud_risk_level IN ('high', 'critical')
    AND clicked_at > NOW() - INTERVAL '24 hours';
    
    -- Check processing lag
    SELECT NOW() - MAX(updated_at) INTO processing_lag
    FROM referral_daily_analytics;
    
    result := jsonb_build_object(
        'status', CASE 
            WHEN pending_reviews > 100 OR high_risk_count > 50 THEN 'critical'
            WHEN pending_reviews > 50 OR high_risk_count > 20 THEN 'warning'
            ELSE 'healthy'
        END,
        'pending_reviews', pending_reviews,
        'high_risk_24h', high_risk_count,
        'analytics_lag_hours', EXTRACT(EPOCH FROM processing_lag) / 3600,
        'last_check', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring view
CREATE OR REPLACE VIEW referral_system_performance AS
SELECT 
    'referral_tracking' as table_name,
    pg_size_pretty(pg_total_relation_size('referral_tracking')) as table_size,
    (SELECT COUNT(*) FROM referral_tracking) as total_rows,
    (SELECT COUNT(*) FROM referral_tracking WHERE clicked_at > NOW() - INTERVAL '24 hours') as rows_24h,
    (SELECT AVG(fraud_risk_score) FROM referral_tracking WHERE clicked_at > NOW() - INTERVAL '24 hours') as avg_risk_score_24h

UNION ALL

SELECT 
    'referral_events' as table_name,
    pg_size_pretty(pg_total_relation_size('referral_events')) as table_size,
    (SELECT COUNT(*) FROM referral_events) as total_rows,
    (SELECT COUNT(*) FROM referral_events WHERE occurred_at > NOW() - INTERVAL '24 hours') as rows_24h,
    NULL as avg_risk_score_24h

UNION ALL

SELECT 
    'referral_rewards' as table_name,
    pg_size_pretty(pg_total_relation_size('referral_rewards')) as table_size,
    (SELECT COUNT(*) FROM referral_rewards) as total_rows,
    (SELECT COUNT(*) FROM referral_rewards WHERE earned_at > NOW() - INTERVAL '24 hours') as rows_24h,
    (SELECT AVG(final_amount) FROM referral_rewards WHERE earned_at > NOW() - INTERVAL '24 hours') as avg_risk_score_24h;

-- =============================================================================
-- Documentation Comments
-- =============================================================================

COMMENT ON TABLE referral_campaigns IS 'Referral campaign configuration and management';
COMMENT ON TABLE referral_tracking IS 'Main referral tracking data with fraud detection and attribution';
COMMENT ON TABLE referral_fraud_rules IS 'Configurable fraud detection rules and patterns';
COMMENT ON TABLE referral_attribution_models IS 'Attribution model configurations for conversion tracking';
COMMENT ON TABLE referral_rewards IS 'Reward calculations and payout tracking';
COMMENT ON TABLE referral_daily_analytics IS 'Daily aggregated analytics for performance monitoring';
COMMENT ON TABLE referral_events IS 'Real-time event tracking for analytics and debugging';

COMMENT ON FUNCTION aggregate_daily_referral_analytics IS 'Aggregates daily referral metrics for analytics dashboard';
COMMENT ON FUNCTION calculate_referral_attribution IS 'Calculates attribution weight based on specified model';
COMMENT ON FUNCTION cleanup_expired_referrals IS 'Maintenance function to cleanup expired and old referral data';
COMMENT ON FUNCTION referral_system_health_check IS 'Health check function for monitoring system status';

COMMENT ON VIEW referral_performance_summary IS 'Comprehensive view of referral performance by campaign and referrer';
COMMENT ON VIEW high_risk_referrals IS 'High-risk referrals requiring manual review';
COMMENT ON VIEW referral_attribution_analysis IS 'Attribution analysis for conversion optimization';