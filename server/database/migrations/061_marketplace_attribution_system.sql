-- Epic 16 Marketplace Attribution Database Schema
-- Task: E16-1753114247138-03634F - Add attribution system
-- 
-- Comprehensive attribution system for marketplace templates, creators,
-- collaborations, revenue tracking, and attribution claims.

-- =============================================================================
-- Template Attribution Tables
-- =============================================================================

-- Template attribution tracking
CREATE TABLE IF NOT EXISTS template_attributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    template_version_id UUID REFERENCES template_versions(id) ON DELETE SET NULL,
    
    -- Primary creator attribution
    primary_creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_creator_name TEXT NOT NULL,
    primary_creator_email TEXT NOT NULL,
    creation_date TIMESTAMPTZ NOT NULL,
    
    -- Revenue sharing configuration
    revenue_sharing JSONB NOT NULL DEFAULT '{
        "primaryCreatorShare": 85.0,
        "collaboratorShares": {},
        "originalCreatorShare": 0.0,
        "platformFee": 15.0,
        "totalPercentage": 100.0
    }',
    
    -- Attribution verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    confidence_score DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    
    -- Attribution method and metadata
    attribution_method TEXT DEFAULT 'manual' CHECK (attribution_method IN ('manual', 'git_history', 'session_tracking', 'ai_analysis', 'user_declaration')),
    source_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(template_id, template_version_id),
    CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00)
);

-- Template collaborators
CREATE TABLE IF NOT EXISTS template_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_attribution_id UUID NOT NULL REFERENCES template_attributions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    
    -- Collaboration details
    contribution_type TEXT NOT NULL CHECK (contribution_type IN ('co-creator', 'contributor', 'reviewer', 'editor', 'advisor')),
    contribution_percentage DECIMAL(5,2) NOT NULL CHECK (contribution_percentage >= 0.00 AND contribution_percentage <= 100.00),
    contribution_description TEXT,
    
    -- Timeline
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate collaborators per template
    UNIQUE(template_attribution_id, user_id)
);

-- Template derivation tracking
CREATE TABLE IF NOT EXISTS template_derivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    derived_template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    original_template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    original_creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Derivation details
    derivation_type TEXT NOT NULL CHECK (derivation_type IN ('fork', 'remix', 'inspired', 'adaptation')),
    attribution_percentage DECIMAL(5,2) NOT NULL CHECK (attribution_percentage >= 0.00 AND attribution_percentage <= 100.00),
    acknowledgment TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent self-derivation and cycles
    CONSTRAINT no_self_derivation CHECK (derived_template_id != original_template_id)
);

-- =============================================================================
-- Revenue Attribution Tables
-- =============================================================================

-- Revenue attribution records
CREATE TABLE IF NOT EXISTS revenue_attributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES marketplace_purchases(id) ON DELETE CASCADE,
    
    -- Revenue details
    total_revenue_cents INTEGER NOT NULL CHECK (total_revenue_cents >= 0),
    currency CHAR(3) DEFAULT 'USD',
    
    -- Purchase context
    purchase_date TIMESTAMPTZ NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_version TEXT NOT NULL,
    
    -- Attribution tracking
    attribution_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    attribution_method TEXT DEFAULT 'automated' CHECK (attribution_method IN ('automated', 'manual_review', 'dispute_resolution')),
    calculated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_required BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique attribution per purchase
    UNIQUE(purchase_id)
);

-- Individual revenue attribution records
CREATE TABLE IF NOT EXISTS revenue_attribution_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    revenue_attribution_id UUID NOT NULL REFERENCES revenue_attributions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Attribution details
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('creator', 'collaborator', 'original_creator', 'platform')),
    attribution_type TEXT NOT NULL CHECK (attribution_type IN ('primary_creator', 'collaborator', 'derived_from', 'platform_fee')),
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0.00 AND percentage <= 100.00),
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    
    -- Payment status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'held', 'disputed', 'refunded')),
    released_at TIMESTAMPTZ,
    hold_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Creator Attribution Profiles
-- =============================================================================

-- Creator attribution profiles
CREATE TABLE IF NOT EXISTS creator_attribution_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Creator information
    display_name TEXT NOT NULL,
    profile_bio TEXT,
    profile_url TEXT,
    verification_badges TEXT[] DEFAULT '{}',
    
    -- Attribution statistics
    created_templates INTEGER DEFAULT 0 CHECK (created_templates >= 0),
    collaborated_templates INTEGER DEFAULT 0 CHECK (collaborated_templates >= 0),
    derived_templates INTEGER DEFAULT 0 CHECK (derived_templates >= 0),
    total_revenue_cents BIGINT DEFAULT 0 CHECK (total_revenue_cents >= 0),
    total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
    
    -- Collaboration metrics
    collaboration_score DECIMAL(5,2) DEFAULT 0.00 CHECK (collaboration_score >= 0.00 AND collaboration_score <= 100.00),
    average_collaborators DECIMAL(5,2) DEFAULT 0.00,
    successful_collaborations INTEGER DEFAULT 0,
    
    -- Attribution preferences
    attribution_settings JSONB DEFAULT '{
        "showRealName": true,
        "showRevenue": false,
        "showCollaborations": true,
        "allowDerivations": true,
        "requireAttribution": true,
        "defaultRevenueShare": 100.0
    }',
    
    -- Reputation metrics
    attribution_reputation JSONB DEFAULT '{
        "accuracyScore": 100.0,
        "responsivenessScore": 100.0,
        "collaborationScore": 100.0,
        "overallRating": 0.0,
        "totalRatings": 0
    }',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- =============================================================================
-- Attribution Claims and Disputes
-- =============================================================================

-- Attribution claims
CREATE TABLE IF NOT EXISTS attribution_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_attribution_id UUID NOT NULL REFERENCES template_attributions(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Claim details
    claim_type TEXT NOT NULL CHECK (claim_type IN ('ownership', 'collaboration', 'derivation', 'inspiration')),
    claim_description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    
    -- Claim status and resolution
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disputed')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Priority and urgency
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    urgency_score INTEGER DEFAULT 50 CHECK (urgency_score >= 0 AND urgency_score <= 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claim evidence and supporting documents
CREATE TABLE IF NOT EXISTS attribution_claim_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES attribution_claims(id) ON DELETE CASCADE,
    
    -- Evidence details
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'screenshot', 'video', 'git_commit', 'communication', 'witness_statement', 'other')),
    evidence_url TEXT,
    evidence_description TEXT,
    evidence_metadata JSONB DEFAULT '{}',
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Attribution Analytics and Tracking
-- =============================================================================

-- Attribution analytics events
CREATE TABLE IF NOT EXISTS attribution_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('template', 'creator', 'collaboration', 'revenue', 'claim')),
    entity_id UUID NOT NULL,
    
    -- Event data
    event_data JSONB NOT NULL DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    marketplace_context JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attribution performance metrics
CREATE TABLE IF NOT EXISTS attribution_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('creator_performance', 'template_attribution', 'revenue_distribution', 'collaboration_patterns')),
    
    -- Time period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Metrics
    metrics JSONB NOT NULL DEFAULT '{}',
    breakdown JSONB DEFAULT '{}',
    insights JSONB DEFAULT '[]',
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Indexes for performance
    CONSTRAINT valid_period CHECK (period_end > period_start)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Template attributions indexes
CREATE INDEX IF NOT EXISTS idx_template_attributions_template ON template_attributions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_attributions_creator ON template_attributions(primary_creator_id);
CREATE INDEX IF NOT EXISTS idx_template_attributions_verified ON template_attributions(is_verified);
CREATE INDEX IF NOT EXISTS idx_template_attributions_method ON template_attributions(attribution_method);

-- Collaborators indexes
CREATE INDEX IF NOT EXISTS idx_template_collaborators_attribution ON template_collaborators(template_attribution_id);
CREATE INDEX IF NOT EXISTS idx_template_collaborators_user ON template_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_template_collaborators_type ON template_collaborators(contribution_type);

-- Derivations indexes
CREATE INDEX IF NOT EXISTS idx_template_derivations_derived ON template_derivations(derived_template_id);
CREATE INDEX IF NOT EXISTS idx_template_derivations_original ON template_derivations(original_template_id);
CREATE INDEX IF NOT EXISTS idx_template_derivations_creator ON template_derivations(original_creator_id);

-- Revenue attribution indexes
CREATE INDEX IF NOT EXISTS idx_revenue_attributions_template ON revenue_attributions(template_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attributions_purchase ON revenue_attributions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attributions_buyer ON revenue_attributions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attributions_date ON revenue_attributions(purchase_date);

-- Revenue records indexes
CREATE INDEX IF NOT EXISTS idx_revenue_records_attribution ON revenue_attribution_records(revenue_attribution_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_recipient ON revenue_attribution_records(recipient_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_status ON revenue_attribution_records(status);
CREATE INDEX IF NOT EXISTS idx_revenue_records_type ON revenue_attribution_records(recipient_type);

-- Creator profiles indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user ON creator_attribution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_revenue ON creator_attribution_profiles(total_revenue_cents DESC);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_templates ON creator_attribution_profiles(created_templates DESC);

-- Claims indexes
CREATE INDEX IF NOT EXISTS idx_attribution_claims_template ON attribution_claims(template_attribution_id);
CREATE INDEX IF NOT EXISTS idx_attribution_claims_claimant ON attribution_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_attribution_claims_status ON attribution_claims(status);
CREATE INDEX IF NOT EXISTS idx_attribution_claims_type ON attribution_claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_attribution_claims_priority ON attribution_claims(priority);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_attribution_analytics_type ON attribution_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_attribution_analytics_entity ON attribution_analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attribution_analytics_user ON attribution_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_attribution_analytics_created ON attribution_analytics_events(created_at);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_creator ON attribution_performance_metrics(creator_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_template ON attribution_performance_metrics(template_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON attribution_performance_metrics(analysis_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON attribution_performance_metrics(period_start, period_end);

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Function to update creator profile statistics
CREATE OR REPLACE FUNCTION update_creator_attribution_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update creator profile when template attribution changes
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO creator_attribution_profiles (user_id, display_name, created_templates)
        SELECT NEW.primary_creator_id, NEW.primary_creator_name, 1
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            created_templates = creator_attribution_profiles.created_templates + 1,
            updated_at = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update creator stats on template attribution
DROP TRIGGER IF EXISTS trigger_update_creator_attribution_stats ON template_attributions;
CREATE TRIGGER trigger_update_creator_attribution_stats
    AFTER INSERT OR UPDATE ON template_attributions
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_attribution_stats();

-- Function to calculate revenue attribution automatically
CREATE OR REPLACE FUNCTION calculate_revenue_attribution()
RETURNS TRIGGER AS $$
DECLARE
    template_attribution RECORD;
    collaborator RECORD;
    derivation RECORD;
    total_percentage DECIMAL(5,2) := 0;
    remaining_percentage DECIMAL(5,2);
    creator_amount INTEGER;
    collaborator_amount INTEGER;
    original_creator_amount INTEGER;
    platform_amount INTEGER;
BEGIN
    -- Get template attribution
    SELECT * INTO template_attribution 
    FROM template_attributions ta 
    WHERE ta.template_id = NEW.template_id 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No attribution found for template %', NEW.template_id;
    END IF;
    
    -- Calculate platform fee (15%)
    platform_amount := ROUND(NEW.total_revenue_cents * 0.15);
    remaining_percentage := 85.0;
    
    -- Insert platform attribution record
    INSERT INTO revenue_attribution_records (
        revenue_attribution_id, recipient_id, recipient_type, attribution_type,
        percentage, amount_cents, status
    ) VALUES (
        NEW.id, 'platform'::UUID, 'platform', 'platform_fee',
        15.0, platform_amount, 'released'
    );
    
    -- Check for derivation
    SELECT * INTO derivation 
    FROM template_derivations td 
    WHERE td.derived_template_id = NEW.template_id 
    LIMIT 1;
    
    IF FOUND THEN
        -- Give percentage to original creator
        original_creator_amount := ROUND(NEW.total_revenue_cents * (derivation.attribution_percentage / 100.0));
        remaining_percentage := remaining_percentage - derivation.attribution_percentage;
        
        INSERT INTO revenue_attribution_records (
            revenue_attribution_id, recipient_id, recipient_type, attribution_type,
            percentage, amount_cents, status
        ) VALUES (
            NEW.id, derivation.original_creator_id, 'original_creator', 'derived_from',
            derivation.attribution_percentage, original_creator_amount, 'pending'
        );
    END IF;
    
    -- Distribute remaining to primary creator and collaborators
    creator_amount := ROUND(NEW.total_revenue_cents * (remaining_percentage / 100.0));
    
    -- Handle collaborators
    FOR collaborator IN 
        SELECT * FROM template_collaborators tc 
        WHERE tc.template_attribution_id = template_attribution.id
    LOOP
        collaborator_amount := ROUND(NEW.total_revenue_cents * (collaborator.contribution_percentage / 100.0));
        creator_amount := creator_amount - collaborator_amount;
        
        INSERT INTO revenue_attribution_records (
            revenue_attribution_id, recipient_id, recipient_type, attribution_type,
            percentage, amount_cents, status
        ) VALUES (
            NEW.id, collaborator.user_id, 'collaborator', 'collaborator',
            collaborator.contribution_percentage, collaborator_amount, 'pending'
        );
    END LOOP;
    
    -- Primary creator gets remaining amount
    INSERT INTO revenue_attribution_records (
        revenue_attribution_id, recipient_id, recipient_type, attribution_type,
        percentage, amount_cents, status
    ) VALUES (
        NEW.id, template_attribution.primary_creator_id, 'creator', 'primary_creator',
        remaining_percentage, creator_amount, 'pending'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate revenue attribution
DROP TRIGGER IF EXISTS trigger_calculate_revenue_attribution ON revenue_attributions;
CREATE TRIGGER trigger_calculate_revenue_attribution
    AFTER INSERT ON revenue_attributions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_revenue_attribution();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at triggers
CREATE TRIGGER trig_template_attributions_updated_at
    BEFORE UPDATE ON template_attributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_revenue_attributions_updated_at
    BEFORE UPDATE ON revenue_attributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_revenue_attribution_records_updated_at
    BEFORE UPDATE ON revenue_attribution_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_creator_attribution_profiles_updated_at
    BEFORE UPDATE ON creator_attribution_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_attribution_claims_updated_at
    BEFORE UPDATE ON attribution_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Views for Analytics and Reporting
-- =============================================================================

-- Template attribution overview
CREATE OR REPLACE VIEW template_attribution_overview AS
SELECT 
    ta.id,
    ta.template_id,
    mt.title as template_title,
    ta.primary_creator_id,
    ta.primary_creator_name,
    ta.is_verified,
    ta.confidence_score,
    COUNT(tc.id) as collaborator_count,
    COUNT(td.id) as derivative_count,
    COUNT(ac.id) as active_claims,
    COALESCE(SUM(ra.total_revenue_cents), 0) as total_revenue_cents,
    ta.created_at,
    ta.updated_at
FROM template_attributions ta
JOIN marketplace_templates mt ON ta.template_id = mt.id
LEFT JOIN template_collaborators tc ON ta.id = tc.template_attribution_id
LEFT JOIN template_derivations td ON ta.template_id = td.original_template_id
LEFT JOIN attribution_claims ac ON ta.id = ac.template_attribution_id AND ac.status = 'pending'
LEFT JOIN revenue_attributions ra ON ta.template_id = ra.template_id
GROUP BY ta.id, ta.template_id, mt.title, ta.primary_creator_id, ta.primary_creator_name, 
         ta.is_verified, ta.confidence_score, ta.created_at, ta.updated_at;

-- Creator attribution summary
CREATE OR REPLACE VIEW creator_attribution_summary AS
SELECT 
    cap.id,
    cap.user_id,
    cap.display_name,
    cap.created_templates,
    cap.collaborated_templates,
    cap.total_revenue_cents,
    cap.total_sales,
    cap.collaboration_score,
    COUNT(DISTINCT ta.id) as attributed_templates,
    COUNT(DISTINCT tc.id) as collaboration_count,
    COUNT(DISTINCT ac.id) as pending_claims,
    AVG(ta.confidence_score) as avg_attribution_confidence,
    cap.updated_at
FROM creator_attribution_profiles cap
LEFT JOIN template_attributions ta ON cap.user_id = ta.primary_creator_id
LEFT JOIN template_collaborators tc ON cap.user_id = tc.user_id
LEFT JOIN attribution_claims ac ON cap.user_id = ac.claimant_id AND ac.status = 'pending'
GROUP BY cap.id, cap.user_id, cap.display_name, cap.created_templates, 
         cap.collaborated_templates, cap.total_revenue_cents, cap.total_sales,
         cap.collaboration_score, cap.updated_at;

-- Revenue attribution summary
CREATE OR REPLACE VIEW revenue_attribution_summary AS
SELECT 
    ra.id,
    ra.template_id,
    mt.title as template_title,
    ra.total_revenue_cents,
    ra.purchase_date,
    ra.is_verified,
    COUNT(rar.id) as recipient_count,
    SUM(CASE WHEN rar.status = 'released' THEN rar.amount_cents ELSE 0 END) as released_amount,
    SUM(CASE WHEN rar.status = 'pending' THEN rar.amount_cents ELSE 0 END) as pending_amount,
    SUM(CASE WHEN rar.status = 'held' THEN rar.amount_cents ELSE 0 END) as held_amount
FROM revenue_attributions ra
JOIN marketplace_templates mt ON ra.template_id = mt.id
LEFT JOIN revenue_attribution_records rar ON ra.id = rar.revenue_attribution_id
GROUP BY ra.id, ra.template_id, mt.title, ra.total_revenue_cents, 
         ra.purchase_date, ra.is_verified;

COMMIT;