-- Epic 16 Story 16.2 - Creator Management Database Schema
-- Complete creator profile, monetization, and publishing management system

-- =============================================================================
-- Creator Profile Management
-- =============================================================================

-- Creator profiles with verification and tier system
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Public profile information
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    website VARCHAR(500),
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    
    -- Social media links
    social_links JSONB DEFAULT '{}'::jsonb,
    
    -- Verification system
    verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (
        verification_status IN ('unverified', 'pending', 'verified', 'rejected')
    ),
    verification_submitted_at TIMESTAMP WITH TIME ZONE,
    verification_reviewed_at TIMESTAMP WITH TIME ZONE,
    verification_reviewer_id UUID REFERENCES users(id),
    verification_notes TEXT,
    
    -- Creator tier system (based on performance metrics)
    creator_tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (
        creator_tier IN ('bronze', 'silver', 'gold', 'platinum')
    ),
    tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Achievement badges
    badges JSONB DEFAULT '[]'::jsonb,
    
    -- Profile settings
    public_profile BOOLEAN DEFAULT false,
    contact_enabled BOOLEAN DEFAULT true,
    newsletter_subscription BOOLEAN DEFAULT true,
    
    -- Metrics (cached for performance)
    total_templates INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue_cents INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification documents
CREATE TABLE IF NOT EXISTS creator_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Document information
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'government_id', 'business_license', 'tax_document', 
        'proof_of_address', 'portfolio', 'certification'
    )),
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Verification status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected'
    )),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Metadata
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- Monetization Management
-- =============================================================================

-- Creator monetization settings
CREATE TABLE IF NOT EXISTS creator_monetization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL UNIQUE REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Payout configuration
    payout_threshold_cents INTEGER NOT NULL DEFAULT 5000 CHECK (payout_threshold_cents >= 1000),
    payout_schedule VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (
        payout_schedule IN ('weekly', 'monthly')
    ),
    auto_payout_enabled BOOLEAN DEFAULT true,
    
    -- Payment method configuration
    payment_method VARCHAR(30) NOT NULL DEFAULT 'stripe' CHECK (
        payment_method IN ('stripe', 'paypal', 'bank_transfer', 'check')
    ),
    
    -- Stripe configuration
    stripe_account_id VARCHAR(255),
    stripe_account_status VARCHAR(30),
    stripe_charges_enabled BOOLEAN DEFAULT false,
    stripe_payouts_enabled BOOLEAN DEFAULT false,
    
    -- PayPal configuration
    paypal_email VARCHAR(255),
    paypal_verified BOOLEAN DEFAULT false,
    
    -- Bank transfer configuration
    bank_details JSONB DEFAULT '{}'::jsonb,
    
    -- Tax information
    tax_settings JSONB NOT NULL DEFAULT '{
        "tax_id": null,
        "business_name": null,
        "business_type": "individual",
        "address": "",
        "city": "",
        "state": "",
        "country": "",
        "postal_code": "",
        "tax_exempt": false,
        "w9_submitted": false,
        "tax_interview_completed": false
    }'::jsonb,
    
    -- Revenue sharing
    platform_fee_percentage DECIMAL(5,2) DEFAULT 15.00 CHECK (
        platform_fee_percentage >= 0 AND platform_fee_percentage <= 50
    ),
    custom_fee_override DECIMAL(5,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creator payout history
CREATE TABLE IF NOT EXISTS creator_payout_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Payout details
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payout_method VARCHAR(30) NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
    )),
    
    -- External payment system integration
    stripe_payout_id VARCHAR(255),
    paypal_payout_batch_id VARCHAR(255),
    bank_transaction_id VARCHAR(255),
    
    -- Failure handling
    failure_code VARCHAR(50),
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Processing details
    initiated_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Fee breakdown
    platform_fee_cents INTEGER DEFAULT 0,
    processing_fee_cents INTEGER DEFAULT 0,
    net_amount_cents INTEGER NOT NULL,
    
    -- Period covered by this payout
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Template Publishing Workflow
-- =============================================================================

-- Template submission workflow
CREATE TABLE IF NOT EXISTS template_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Submission type
    submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN (
        'new_template', 'template_update', 'version_update'
    )),
    
    -- Content data
    submission_data JSONB NOT NULL,
    
    -- Review workflow
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 'requires_changes'
    )),
    
    -- Quality assurance
    automated_checks_passed BOOLEAN DEFAULT false,
    manual_review_required BOOLEAN DEFAULT true,
    safety_score DECIMAL(3,2) DEFAULT 0.00,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Review assignments
    assigned_reviewer_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Review results
    review_notes TEXT,
    required_changes JSONB DEFAULT '[]'::jsonb,
    reviewer_feedback TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(100),
    rejection_details TEXT,
    
    -- Metadata
    submission_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template quality assessments
CREATE TABLE IF NOT EXISTS template_quality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES template_submissions(id) ON DELETE SET NULL,
    assessor_id UUID REFERENCES users(id),
    
    -- Assessment scores (0.00 to 1.00)
    overall_quality DECIMAL(3,2) NOT NULL,
    content_quality DECIMAL(3,2) NOT NULL,
    technical_quality DECIMAL(3,2) NOT NULL,
    usability_score DECIMAL(3,2) NOT NULL,
    documentation_quality DECIMAL(3,2) NOT NULL,
    originality_score DECIMAL(3,2) NOT NULL,
    
    -- Detailed feedback
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    
    -- Assessment metadata
    assessment_method VARCHAR(20) DEFAULT 'manual' CHECK (
        assessment_method IN ('manual', 'automated', 'hybrid')
    ),
    assessment_duration_minutes INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Creator Analytics and Performance
-- =============================================================================

-- Creator analytics snapshots (daily aggregates)
CREATE TABLE IF NOT EXISTS creator_analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Revenue metrics
    revenue_cents INTEGER DEFAULT 0,
    gross_revenue_cents INTEGER DEFAULT 0,
    platform_fee_cents INTEGER DEFAULT 0,
    processing_fee_cents INTEGER DEFAULT 0,
    
    -- Sales metrics
    total_sales INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    refunds INTEGER DEFAULT 0,
    refund_amount_cents INTEGER DEFAULT 0,
    
    -- Engagement metrics
    profile_views INTEGER DEFAULT 0,
    template_views INTEGER DEFAULT 0,
    template_previews INTEGER DEFAULT 0,
    favorites_added INTEGER DEFAULT 0,
    
    -- Content metrics
    templates_published INTEGER DEFAULT 0,
    templates_updated INTEGER DEFAULT 0,
    new_reviews_received INTEGER DEFAULT 0,
    average_review_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Traffic sources
    traffic_sources JSONB DEFAULT '{}'::jsonb,
    
    -- Geographic data
    top_countries JSONB DEFAULT '[]'::jsonb,
    
    -- Unique constraint
    UNIQUE(creator_id, date)
);

-- Creator milestones and achievements
CREATE TABLE IF NOT EXISTS creator_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Milestone information
    milestone_type VARCHAR(50) NOT NULL,
    milestone_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Achievement details
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    achievement_value DECIMAL(15,2),
    achievement_unit VARCHAR(20),
    
    -- Badge/reward
    badge_awarded VARCHAR(50),
    reward_type VARCHAR(30),
    reward_value_cents INTEGER DEFAULT 0,
    
    -- Visibility
    public_achievement BOOLEAN DEFAULT true,
    featured_milestone BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Creator profiles indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_verification_status ON creator_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_creator_tier ON creator_profiles(creator_tier);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_public ON creator_profiles(public_profile) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS idx_creator_profiles_revenue ON creator_profiles(total_revenue_cents DESC);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_rating ON creator_profiles(average_rating DESC);

-- Verification documents indexes
CREATE INDEX IF NOT EXISTS idx_verification_docs_creator ON creator_verification_documents(creator_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON creator_verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_verification_docs_type ON creator_verification_documents(document_type);

-- Monetization settings indexes
CREATE INDEX IF NOT EXISTS idx_monetization_creator ON creator_monetization_settings(creator_id);
CREATE INDEX IF NOT EXISTS idx_monetization_payment_method ON creator_monetization_settings(payment_method);
CREATE INDEX IF NOT EXISTS idx_monetization_auto_payout ON creator_monetization_settings(auto_payout_enabled);

-- Payout history indexes
CREATE INDEX IF NOT EXISTS idx_payout_history_creator ON creator_payout_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_payout_history_status ON creator_payout_history(status);
CREATE INDEX IF NOT EXISTS idx_payout_history_created ON creator_payout_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_history_period ON creator_payout_history(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payout_history_stripe ON creator_payout_history(stripe_payout_id) WHERE stripe_payout_id IS NOT NULL;

-- Template submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_template ON template_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_submissions_creator ON template_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON template_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer ON template_submissions(assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON template_submissions(created_at DESC);

-- Quality assessments indexes
CREATE INDEX IF NOT EXISTS idx_quality_assessments_template ON template_quality_assessments(template_id);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_submission ON template_quality_assessments(submission_id);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_overall ON template_quality_assessments(overall_quality DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_creator_analytics_creator_date ON creator_analytics_daily(creator_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_date ON creator_analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_revenue ON creator_analytics_daily(revenue_cents DESC);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_creator ON creator_milestones(creator_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON creator_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_milestones_achieved ON creator_milestones(achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_milestones_public ON creator_milestones(public_achievement) WHERE public_achievement = true;

-- =============================================================================
-- GIN Indexes for JSONB
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_creator_profiles_social_gin ON creator_profiles USING gin(social_links);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_badges_gin ON creator_profiles USING gin(badges);
CREATE INDEX IF NOT EXISTS idx_monetization_tax_gin ON creator_monetization_settings USING gin(tax_settings);
CREATE INDEX IF NOT EXISTS idx_monetization_bank_gin ON creator_monetization_settings USING gin(bank_details);
CREATE INDEX IF NOT EXISTS idx_payout_metadata_gin ON creator_payout_history USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_submissions_data_gin ON template_submissions USING gin(submission_data);
CREATE INDEX IF NOT EXISTS idx_submissions_changes_gin ON template_submissions USING gin(required_changes);
CREATE INDEX IF NOT EXISTS idx_quality_strengths_gin ON template_quality_assessments USING gin(strengths);
CREATE INDEX IF NOT EXISTS idx_quality_weaknesses_gin ON template_quality_assessments USING gin(weaknesses);
CREATE INDEX IF NOT EXISTS idx_analytics_traffic_gin ON creator_analytics_daily USING gin(traffic_sources);
CREATE INDEX IF NOT EXISTS idx_analytics_countries_gin ON creator_analytics_daily USING gin(top_countries);
CREATE INDEX IF NOT EXISTS idx_milestones_metadata_gin ON creator_milestones USING gin(metadata);

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Update creator profile metrics when templates/purchases change
CREATE OR REPLACE FUNCTION update_creator_profile_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update cached metrics for the creator
    UPDATE creator_profiles SET
        total_templates = (
            SELECT COUNT(*) FROM marketplace_templates 
            WHERE owner_id = creator_profiles.user_id
        ),
        total_sales = (
            SELECT COUNT(*) FROM marketplace_purchases p
            JOIN marketplace_templates t ON p.template_id = t.id
            WHERE t.owner_id = creator_profiles.user_id AND p.status = 'succeeded'
        ),
        total_revenue_cents = (
            SELECT COALESCE(SUM(p.amount_cents), 0) FROM marketplace_purchases p
            JOIN marketplace_templates t ON p.template_id = t.id
            WHERE t.owner_id = creator_profiles.user_id AND p.status = 'succeeded'
        ),
        average_rating = (
            SELECT COALESCE(AVG(r.stars), 0) FROM template_reviews r
            JOIN marketplace_templates t ON r.template_id = t.id
            WHERE t.owner_id = creator_profiles.user_id AND r.moderation_status = 'approved'
        ),
        total_reviews = (
            SELECT COUNT(*) FROM template_reviews r
            JOIN marketplace_templates t ON r.template_id = t.id
            WHERE t.owner_id = creator_profiles.user_id AND r.moderation_status = 'approved'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = (
        SELECT owner_id FROM marketplace_templates 
        WHERE id = COALESCE(NEW.template_id, OLD.template_id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for template changes
CREATE TRIGGER trigger_update_creator_metrics_templates
    AFTER INSERT OR UPDATE OR DELETE ON marketplace_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_profile_metrics();

-- Trigger for purchase changes
CREATE TRIGGER trigger_update_creator_metrics_purchases
    AFTER INSERT OR UPDATE OR DELETE ON marketplace_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_profile_metrics();

-- Trigger for review changes
CREATE TRIGGER trigger_update_creator_metrics_reviews
    AFTER INSERT OR UPDATE OR DELETE ON template_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_profile_metrics();

-- Auto-assign tier based on performance
CREATE OR REPLACE FUNCTION auto_update_creator_tier()
RETURNS TRIGGER AS $$
DECLARE
    new_tier VARCHAR(20);
BEGIN
    -- Determine tier based on performance metrics
    IF NEW.total_revenue_cents >= 500000 AND NEW.average_rating >= 4.5 
       AND NEW.total_templates >= 25 AND NEW.total_reviews >= 250 THEN
        new_tier := 'platinum';
    ELSIF NEW.total_revenue_cents >= 200000 AND NEW.average_rating >= 4.3 
          AND NEW.total_templates >= 15 AND NEW.total_reviews >= 100 THEN
        new_tier := 'gold';
    ELSIF NEW.total_revenue_cents >= 50000 AND NEW.average_rating >= 4.0 
          AND NEW.total_templates >= 5 AND NEW.total_reviews >= 25 THEN
        new_tier := 'silver';
    ELSE
        new_tier := 'bronze';
    END IF;
    
    -- Update tier if changed
    IF new_tier != NEW.creator_tier THEN
        NEW.creator_tier := new_tier;
        NEW.tier_updated_at := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_creator_tier
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    WHEN (OLD.total_revenue_cents != NEW.total_revenue_cents OR 
          OLD.average_rating != NEW.average_rating OR
          OLD.total_templates != NEW.total_templates OR
          OLD.total_reviews != NEW.total_reviews)
    EXECUTE FUNCTION auto_update_creator_tier();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_creator_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_updated_at();

CREATE TRIGGER trigger_monetization_settings_updated_at
    BEFORE UPDATE ON creator_monetization_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_updated_at();

CREATE TRIGGER trigger_payout_history_updated_at
    BEFORE UPDATE ON creator_payout_history
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_updated_at();

CREATE TRIGGER trigger_template_submissions_updated_at
    BEFORE UPDATE ON template_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_updated_at();

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- Creator dashboard summary view
CREATE OR REPLACE VIEW creator_dashboard_summary AS
SELECT 
    cp.*,
    cms.payout_threshold_cents,
    cms.payment_method,
    cms.auto_payout_enabled,
    -- Recent performance (last 30 days)
    COALESCE(recent.revenue_30d, 0) as revenue_last_30d,
    COALESCE(recent.sales_30d, 0) as sales_last_30d,
    COALESCE(recent.views_30d, 0) as views_last_30d,
    -- Pending payouts
    COALESCE(pending_payouts.pending_amount, 0) as pending_payout_cents,
    -- Next payout eligibility
    CASE 
        WHEN (cp.total_revenue_cents - COALESCE(paid_out.total_paid, 0)) >= cms.payout_threshold_cents 
        THEN true ELSE false 
    END as payout_eligible
FROM creator_profiles cp
LEFT JOIN creator_monetization_settings cms ON cp.id = cms.creator_id
LEFT JOIN (
    SELECT 
        cp.id as creator_id,
        SUM(cad.revenue_cents) as revenue_30d,
        SUM(cad.total_sales) as sales_30d,
        SUM(cad.template_views) as views_30d
    FROM creator_profiles cp
    LEFT JOIN creator_analytics_daily cad ON cp.id = cad.creator_id 
        AND cad.date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY cp.id
) recent ON cp.id = recent.creator_id
LEFT JOIN (
    SELECT 
        creator_id,
        SUM(amount_cents) as pending_amount
    FROM creator_payout_history
    WHERE status IN ('pending', 'processing')
    GROUP BY creator_id
) pending_payouts ON cp.id = pending_payouts.creator_id
LEFT JOIN (
    SELECT 
        creator_id,
        SUM(amount_cents) as total_paid
    FROM creator_payout_history
    WHERE status = 'completed'
    GROUP BY creator_id
) paid_out ON cp.id = paid_out.creator_id;

-- Template submission queue view
CREATE OR REPLACE VIEW submission_review_queue AS
SELECT 
    ts.*,
    cp.display_name as creator_name,
    cp.creator_tier,
    cp.verification_status,
    t.title as template_title,
    t.status as current_template_status,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ts.created_at))/3600 as hours_waiting
FROM template_submissions ts
JOIN creator_profiles cp ON ts.creator_id = cp.id
LEFT JOIN marketplace_templates t ON ts.template_id = t.id
WHERE ts.status IN ('pending', 'under_review')
ORDER BY 
    CASE 
        WHEN cp.creator_tier = 'platinum' THEN 1
        WHEN cp.creator_tier = 'gold' THEN 2
        WHEN cp.creator_tier = 'silver' THEN 3
        ELSE 4
    END,
    ts.created_at;

-- =============================================================================
-- Initial Data
-- =============================================================================

-- Insert default milestone types
INSERT INTO creator_milestones (creator_id, milestone_type, milestone_name, description, achieved_at, achievement_value, achievement_unit, badge_awarded) 
SELECT 
    cp.id,
    'first_template',
    'First Template Published',
    'Published your first template on the marketplace',
    t.created_at,
    1,
    'templates',
    'pioneer'
FROM creator_profiles cp
JOIN marketplace_templates t ON t.owner_id = cp.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM creator_milestones cm 
    WHERE cm.creator_id = cp.id AND cm.milestone_type = 'first_template'
)
AND t.created_at = (
    SELECT MIN(created_at) FROM marketplace_templates 
    WHERE owner_id = cp.user_id
);

-- Comments
COMMENT ON TABLE creator_profiles IS 'Creator profile management with verification and tier system';
COMMENT ON TABLE creator_monetization_settings IS 'Monetization configuration and payout settings for creators';
COMMENT ON TABLE creator_payout_history IS 'History of payouts to creators with detailed tracking';
COMMENT ON TABLE template_submissions IS 'Template publishing workflow and review process';
COMMENT ON TABLE template_quality_assessments IS 'Quality assessments for submitted templates';
COMMENT ON TABLE creator_analytics_daily IS 'Daily analytics aggregates for creator performance';
COMMENT ON TABLE creator_milestones IS 'Creator achievements and milestone tracking';
COMMENT ON VIEW creator_dashboard_summary IS 'Comprehensive creator dashboard data';
COMMENT ON VIEW submission_review_queue IS 'Prioritized queue for template review';