-- Epic 16 Marketplace Migration - Initial Schema
-- Migration version: 001
-- Description: Create marketplace tables and indexes

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Marketplace templates table
CREATE TABLE IF NOT EXISTS marketplace_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    price_cents INTEGER NOT NULL DEFAULT 0,
    is_ai_generated BOOLEAN DEFAULT false,
    claude_compat TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'listed', 'blocked', 'archived')),
    stats JSONB DEFAULT '{}',
    current_version_id UUID,
    featured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector,
    
    -- Performance constraints
    CONSTRAINT valid_price CHECK (price_cents >= 0),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'listed', 'blocked', 'archived'))
);

-- Template versions table for version control
CREATE TABLE IF NOT EXISTS template_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    claude_model VARCHAR(50) NOT NULL DEFAULT 'claude-3-sonnet',
    graph_json JSONB NOT NULL,
    prompt_yaml TEXT,
    changelog_md TEXT,
    hash VARCHAR(64) NOT NULL, -- SHA256 hash
    token_per_run_estimate INTEGER DEFAULT 0,
    safety_score DECIMAL(3,2) DEFAULT 0.00,
    s3_asset_key VARCHAR(500), -- S3 key for assets
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure version uniqueness per template
    UNIQUE(template_id, version_number),
    
    -- Performance constraints
    CONSTRAINT valid_safety_score CHECK (safety_score >= 0.00 AND safety_score <= 1.00),
    CONSTRAINT valid_token_estimate CHECK (token_per_run_estimate >= 0)
);

-- Purchases table with Stripe integration
CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES template_versions(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    refund_reason VARCHAR(50) CHECK (refund_reason IN ('not_as_described', 'claude_incompat', 'claude_hallucination', 'other')),
    refund_amount_cents INTEGER DEFAULT 0,
    escrow_released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Business constraints
    CONSTRAINT valid_amount CHECK (amount_cents >= 0),
    CONSTRAINT valid_refund CHECK (refund_amount_cents >= 0 AND refund_amount_cents <= amount_cents),
    
    -- Prevent duplicate purchases
    UNIQUE(buyer_id, template_id, version_id, stripe_payment_intent_id)
);

-- Ratings and reviews with moderation
CREATE TABLE IF NOT EXISTS template_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES marketplace_purchases(id) ON DELETE SET NULL,
    stars SMALLINT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    sentiment_ai VARCHAR(20), -- positive, negative, neutral
    verified_purchase BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent multiple reviews per purchase
    UNIQUE(buyer_id, template_id)
);

-- Template categories for organization
CREATE TABLE IF NOT EXISTS template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES template_categories(id) ON DELETE SET NULL,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship between templates and categories
CREATE TABLE IF NOT EXISTS template_category_mappings (
    template_id UUID REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    category_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, category_id)
);

-- Marketplace analytics events for tracking
CREATE TABLE IF NOT EXISTS marketplace_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- view, preview, purchase, download, share
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    template_id UUID REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    version_id UUID REFERENCES template_versions(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template collections for curation
CREATE TABLE IF NOT EXISTS template_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    curator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship for collections
CREATE TABLE IF NOT EXISTS collection_templates (
    collection_id UUID REFERENCES template_collections(id) ON DELETE CASCADE,
    template_id UUID REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_id, template_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_templates_status ON marketplace_templates(status) WHERE status = 'listed';
CREATE INDEX IF NOT EXISTS idx_templates_owner ON marketplace_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_templates_price ON marketplace_templates(price_cents);
CREATE INDEX IF NOT EXISTS idx_templates_created ON marketplace_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON marketplace_templates(featured_at DESC) WHERE featured_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_templates_tags_gin ON marketplace_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_templates_search ON marketplace_templates USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_versions_template ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_versions_created ON template_versions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_template ON marketplace_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON marketplace_purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON marketplace_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON marketplace_purchases(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_template ON template_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON template_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_stars ON template_reviews(stars);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON template_reviews(verified_purchase) WHERE verified_purchase = true;

CREATE INDEX IF NOT EXISTS idx_events_type ON marketplace_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_template ON marketplace_events(template_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON marketplace_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON marketplace_events(created_at DESC);

-- Triggers for search vector updates
CREATE OR REPLACE FUNCTION update_template_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_template_search_vector
    BEFORE INSERT OR UPDATE ON marketplace_templates
    FOR EACH ROW EXECUTE FUNCTION update_template_search_vector();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_templates_updated_at
    BEFORE UPDATE ON marketplace_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_purchases_updated_at
    BEFORE UPDATE ON marketplace_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trig_reviews_updated_at
    BEFORE UPDATE ON template_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default categories
INSERT INTO template_categories (name, description, icon, sort_order) VALUES
('Writing & Content', 'Templates for content creation, copywriting, and narrative generation', 'edit', 1),
('Business & Marketing', 'Templates for business communications, marketing, and sales', 'briefcase', 2),
('Education & Training', 'Templates for educational content, training materials, and learning', 'academic-cap', 3),
('Creative & Entertainment', 'Templates for creative writing, storytelling, and entertainment', 'sparkles', 4),
('Technical & Development', 'Templates for technical documentation, code generation, and development', 'code', 5),
('Analysis & Research', 'Templates for data analysis, research, and reporting', 'chart-bar', 6)
ON CONFLICT (name) DO NOTHING;

-- Add foreign key constraint for current_version_id (after template_versions table exists)
ALTER TABLE marketplace_templates 
ADD CONSTRAINT fk_current_version 
FOREIGN KEY (current_version_id) REFERENCES template_versions(id) ON DELETE SET NULL;