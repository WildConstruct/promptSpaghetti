-- Revenue Analytics Database Schema
-- Story 30.1.1 - Revenue Data Model Integration
-- Integrates with Epic 1 (Analytics) and Epic 16 (Marketplace) foundations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Revenue Attribution Table
CREATE TABLE revenue_attribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    template_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    affiliate_id UUID,
    campaign_id UUID,
    attribution_model VARCHAR(20) NOT NULL CHECK (attribution_model IN ('first_touch', 'last_touch', 'linear', 'time_decay')),
    attribution_percentage DECIMAL(5,4) NOT NULL CHECK (attribution_percentage BETWEEN 0 AND 1),
    revenue_cents INTEGER NOT NULL CHECK (revenue_cents >= 0),
    commission_cents INTEGER NOT NULL CHECK (commission_cents >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_revenue_attribution_transaction (transaction_id),
    INDEX idx_revenue_attribution_template (template_id),
    INDEX idx_revenue_attribution_creator (creator_id),
    INDEX idx_revenue_attribution_created (created_at)
);

-- Template Revenue Metrics Table (Aggregated)
CREATE TABLE template_revenue_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    version_id UUID,
    creator_id UUID NOT NULL,
    
    -- Revenue Metrics
    total_revenue_cents BIGINT NOT NULL DEFAULT 0,
    gross_revenue_cents BIGINT NOT NULL DEFAULT 0,
    net_revenue_cents BIGINT NOT NULL DEFAULT 0,
    commission_cents BIGINT NOT NULL DEFAULT 0,
    refund_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Transaction Metrics
    transaction_count INTEGER NOT NULL DEFAULT 0,
    unique_buyers INTEGER NOT NULL DEFAULT 0,
    repeat_purchase_rate DECIMAL(5,4) DEFAULT 0,
    average_order_value_cents INTEGER NOT NULL DEFAULT 0,
    
    -- License Type Breakdown (JSONB for flexibility)
    license_breakdown JSONB NOT NULL DEFAULT '[]',
    
    -- Time-based Metrics
    first_sale_at TIMESTAMP WITH TIME ZONE,
    last_sale_at TIMESTAMP WITH TIME ZONE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for template + period
    UNIQUE(template_id, version_id, period_start, period_end),
    
    -- Indexes
    INDEX idx_template_revenue_template (template_id),
    INDEX idx_template_revenue_creator (creator_id),
    INDEX idx_template_revenue_period (period_start, period_end),
    INDEX idx_template_revenue_total (total_revenue_cents DESC)
);

-- Creator Revenue Metrics Table (Aggregated)
CREATE TABLE creator_revenue_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL,
    
    -- Revenue Summary
    total_earnings_cents BIGINT NOT NULL DEFAULT 0,
    pending_payout_cents BIGINT NOT NULL DEFAULT 0,
    paid_out_cents BIGINT NOT NULL DEFAULT 0,
    lifetime_earnings_cents BIGINT NOT NULL DEFAULT 0,
    
    -- Performance Metrics
    template_count INTEGER NOT NULL DEFAULT 0,
    active_template_count INTEGER NOT NULL DEFAULT 0,
    total_sales INTEGER NOT NULL DEFAULT 0,
    unique_buyers INTEGER NOT NULL DEFAULT 0,
    
    -- Revenue Distribution (JSONB)
    top_template_id UUID,
    top_template_revenue_cents BIGINT DEFAULT 0,
    revenue_by_license_type JSONB NOT NULL DEFAULT '[]',
    
    -- Payout Information
    payout_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (payout_frequency IN ('weekly', 'monthly', 'quarterly')),
    next_payout_date DATE,
    payment_method VARCHAR(100),
    
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for creator + period
    UNIQUE(creator_id, period_start, period_end),
    
    -- Indexes
    INDEX idx_creator_revenue_creator (creator_id),
    INDEX idx_creator_revenue_period (period_start, period_end),
    INDEX idx_creator_revenue_earnings (total_earnings_cents DESC)
);

-- Revenue Events Table (Extending Analytics Events)
CREATE TABLE revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Analytics Event Base Fields
    event_type VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    session_id UUID NOT NULL,
    user_id UUID,
    organization_id UUID,
    
    -- Revenue-Specific Data
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    transaction_id UUID,
    order_id UUID,
    
    -- Attribution Data
    template_id UUID,
    creator_id UUID,
    affiliate_id UUID,
    campaign_id UUID,
    
    -- Classification Data
    revenue_type VARCHAR(20) NOT NULL CHECK (revenue_type IN ('purchase', 'subscription', 'commission', 'refund')),
    payment_provider VARCHAR(20) NOT NULL,
    license_type VARCHAR(20),
    
    -- Geography and Demographics
    country_code CHAR(2),
    state_code VARCHAR(10),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Marketing Attribution
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Additional metadata (JSONB for flexibility)
    metadata JSONB NOT NULL DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for analytics queries
    INDEX idx_revenue_events_type (event_type),
    INDEX idx_revenue_events_timestamp (timestamp),
    INDEX idx_revenue_events_user (user_id),
    INDEX idx_revenue_events_template (template_id),
    INDEX idx_revenue_events_creator (creator_id),
    INDEX idx_revenue_events_transaction (transaction_id),
    INDEX idx_revenue_events_revenue_type (revenue_type),
    INDEX idx_revenue_events_country (country_code),
    INDEX idx_revenue_events_created (created_at),
    
    -- Composite indexes for common queries
    INDEX idx_revenue_events_creator_period (creator_id, created_at),
    INDEX idx_revenue_events_template_period (template_id, created_at),
    INDEX idx_revenue_events_utm (utm_source, utm_medium, utm_campaign)
);

-- Pricing Tiers Table
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Volume and Regional Pricing (JSONB for flexibility)
    volume_discounts JSONB NOT NULL DEFAULT '[]',
    regional_pricing JSONB NOT NULL DEFAULT '[]',
    
    -- Temporal Settings
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_pricing_tiers_license (license_type),
    INDEX idx_pricing_tiers_active (is_active),
    INDEX idx_pricing_tiers_valid (valid_from, valid_until),
    INDEX idx_pricing_tiers_price (base_price_cents)
);

-- Discount Codes Table
CREATE TABLE discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Discount Configuration
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    max_discount_cents INTEGER CHECK (max_discount_cents >= 0),
    min_purchase_cents INTEGER CHECK (min_purchase_cents >= 0),
    
    -- Usage Limits
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_count INTEGER NOT NULL DEFAULT 0,
    per_user_limit INTEGER CHECK (per_user_limit > 0),
    
    -- Targeting (JSONB arrays for flexibility)
    eligible_templates JSONB DEFAULT '[]',
    eligible_license_types JSONB DEFAULT '[]',
    eligible_user_groups JSONB DEFAULT '[]',
    
    -- Temporal Settings
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_discount_codes_code (code),
    INDEX idx_discount_codes_active (is_active),
    INDEX idx_discount_codes_valid (valid_from, valid_until),
    INDEX idx_discount_codes_usage (usage_count, usage_limit)
);

-- Revenue Aggregations Table (Pre-computed for dashboards)
CREATE TABLE revenue_aggregations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregation_type VARCHAR(20) NOT NULL CHECK (aggregation_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Aggregate Metrics
    total_revenue_cents BIGINT NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    unique_buyers INTEGER NOT NULL DEFAULT 0,
    new_customer_count INTEGER NOT NULL DEFAULT 0,
    returning_customer_count INTEGER NOT NULL DEFAULT 0,
    
    -- Breakdown Data (JSONB for flexibility and performance)
    payment_method_breakdown JSONB NOT NULL DEFAULT '[]',
    geographic_breakdown JSONB NOT NULL DEFAULT '[]',
    top_templates JSONB NOT NULL DEFAULT '[]',
    top_creators JSONB NOT NULL DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for aggregation type + period
    UNIQUE(aggregation_type, period_start, period_end),
    
    -- Indexes
    INDEX idx_revenue_agg_type (aggregation_type),
    INDEX idx_revenue_agg_period (period_start, period_end),
    INDEX idx_revenue_agg_revenue (total_revenue_cents DESC)
);

-- Revenue Forecasts Table
CREATE TABLE revenue_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_type VARCHAR(20) NOT NULL CHECK (forecast_type IN ('template', 'creator', 'global')),
    target_id UUID, -- template_id or creator_id for specific forecasts
    
    -- Forecast Configuration
    forecast_horizon_days INTEGER NOT NULL CHECK (forecast_horizon_days > 0),
    confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level BETWEEN 0.01 AND 0.99),
    model_type VARCHAR(30) NOT NULL CHECK (model_type IN ('linear_regression', 'seasonal_arima', 'prophet')),
    
    -- Historical Data Used
    historical_start_date DATE NOT NULL,
    historical_end_date DATE NOT NULL,
    data_points_used INTEGER NOT NULL,
    
    -- Forecast Results
    forecasted_revenue_cents BIGINT NOT NULL,
    upper_bound_cents BIGINT NOT NULL,
    lower_bound_cents BIGINT NOT NULL,
    
    -- Daily Breakdown (JSONB for time series data)
    daily_forecast JSONB NOT NULL,
    
    -- Model Performance Metrics
    mae DECIMAL(10,2), -- Mean Absolute Error
    mape DECIMAL(5,2), -- Mean Absolute Percentage Error
    r_squared DECIMAL(5,4), -- R-squared
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Indexes
    INDEX idx_revenue_forecast_type (forecast_type),
    INDEX idx_revenue_forecast_target (target_id),
    INDEX idx_revenue_forecast_generated (generated_at),
    INDEX idx_revenue_forecast_valid (valid_until)
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_template_revenue_metrics_updated_at 
    BEFORE UPDATE ON template_revenue_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_revenue_metrics_updated_at 
    BEFORE UPDATE ON creator_revenue_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at 
    BEFORE UPDATE ON pricing_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at 
    BEFORE UPDATE ON discount_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_aggregations_updated_at 
    BEFORE UPDATE ON revenue_aggregations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE revenue_attribution IS 'Tracks revenue attribution across templates, creators, and marketing channels';
COMMENT ON TABLE template_revenue_metrics IS 'Aggregated revenue performance metrics for templates over time periods';
COMMENT ON TABLE creator_revenue_metrics IS 'Aggregated revenue performance metrics for creators over time periods';
COMMENT ON TABLE revenue_events IS 'Individual revenue events extending Epic 1 analytics event structure';
COMMENT ON TABLE pricing_tiers IS 'Configurable pricing structures with volume and regional discounts';
COMMENT ON TABLE discount_codes IS 'Promotional discount codes with usage tracking and targeting';
COMMENT ON TABLE revenue_aggregations IS 'Pre-computed revenue aggregations for dashboard performance';
COMMENT ON TABLE revenue_forecasts IS 'ML-generated revenue forecasts with confidence intervals';

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO revenue_service;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO revenue_service;