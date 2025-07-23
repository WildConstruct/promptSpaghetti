-- Epic 16 Content Database Schema
-- 
-- Comprehensive database schema for Epic 16 marketplace and community features
-- including templates, purchases, reviews, forum posts, analytics, and more.

-- =============================================================================
-- Extensions and Configuration
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- =============================================================================
-- User Profiles and Authentication
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References Epic 11 users table
    
    -- Profile information
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar TEXT, -- URL to avatar image
    location VARCHAR(100),
    website TEXT,
    
    -- Social links (JSON object)
    social_links JSONB DEFAULT '{}',
    
    -- Creator information
    is_creator BOOLEAN DEFAULT FALSE,
    creator_tier VARCHAR(20) CHECK (creator_tier IN ('starter', 'pro', 'expert')),
    verified_creator BOOLEAN DEFAULT FALSE,
    
    -- Marketplace statistics
    templates_created INTEGER DEFAULT 0 CHECK (templates_created >= 0),
    total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
    average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    
    -- Community engagement
    forum_posts INTEGER DEFAULT 0 CHECK (forum_posts >= 0),
    helpful_votes INTEGER DEFAULT 0 CHECK (helpful_votes >= 0),
    reputation INTEGER DEFAULT 0 CHECK (reputation >= 0),
    badges TEXT[] DEFAULT '{}',
    
    -- User preferences (JSON object)
    preferences JSONB DEFAULT '{
        "emailNotifications": true,
        "marketingEmails": false,
        "publicProfile": true,
        "showPurchases": false
    }',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    CONSTRAINT valid_display_name CHECK (length(display_name) > 0),
    CONSTRAINT valid_website CHECK (website IS NULL OR website ~ '^https?://'),
    CONSTRAINT valid_avatar CHECK (avatar IS NULL OR avatar ~ '^https?://')
);

-- Indexes for user profiles
CREATE INDEX idx_epic16_user_profiles_user_id ON epic16_user_profiles (user_id);
CREATE INDEX idx_epic16_user_profiles_creator ON epic16_user_profiles (is_creator, verified_creator);
CREATE INDEX idx_epic16_user_profiles_reputation ON epic16_user_profiles (reputation DESC);
CREATE INDEX idx_epic16_user_profiles_active ON epic16_user_profiles (last_active DESC);
CREATE INDEX idx_epic16_user_profiles_search ON epic16_user_profiles USING gin (to_tsvector('english', display_name || ' ' || COALESCE(bio, '')));

-- =============================================================================
-- Templates and Versions
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    
    -- Basic information
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(300),
    
    -- Categorization
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    
    -- Pricing
    price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0 AND price_cents <= 100000),
    currency CHAR(3) DEFAULT 'USD',
    
    -- Technical details
    claude_compatibility TEXT[] NOT NULL CHECK (array_length(claude_compatibility, 1) > 0),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
    estimated_tokens INTEGER CHECK (estimated_tokens >= 0),
    
    -- Content and media
    thumbnail_url TEXT,
    preview_images TEXT[] DEFAULT '{}',
    demo_video TEXT,
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'listed', 'blocked', 'archived', 'under_review', 'rejected')),
    featured BOOLEAN DEFAULT FALSE,
    promoted BOOLEAN DEFAULT FALSE,
    
    -- Statistics (updated by triggers)
    stats JSONB DEFAULT '{
        "views": 0,
        "downloads": 0,
        "purchases": 0,
        "likes": 0,
        "forks": 0,
        "avgRating": null,
        "ratingCount": 0
    }',
    
    -- SEO and metadata
    seo_keywords TEXT[] DEFAULT '{}',
    meta_description VARCHAR(160),
    
    -- Versioning
    current_version_id UUID,
    version_count INTEGER DEFAULT 0 CHECK (version_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    featured_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_title CHECK (length(title) > 0),
    CONSTRAINT valid_description CHECK (length(description) > 0),
    CONSTRAINT valid_category CHECK (length(category) > 0),
    CONSTRAINT valid_thumbnail CHECK (thumbnail_url IS NULL OR thumbnail_url ~ '^https?://'),
    CONSTRAINT valid_demo_video CHECK (demo_video IS NULL OR demo_video ~ '^https?://')
);

-- Indexes for templates
CREATE INDEX idx_epic16_templates_owner ON epic16_templates (owner_id);
CREATE INDEX idx_epic16_templates_status ON epic16_templates (status);
CREATE INDEX idx_epic16_templates_category ON epic16_templates (category, subcategory);
CREATE INDEX idx_epic16_templates_price ON epic16_templates (price_cents);
CREATE INDEX idx_epic16_templates_featured ON epic16_templates (featured, featured_at DESC) WHERE featured = TRUE;
CREATE INDEX idx_epic16_templates_complexity ON epic16_templates (complexity);
CREATE INDEX idx_epic16_templates_compatibility ON epic16_templates USING gin (claude_compatibility);
CREATE INDEX idx_epic16_templates_tags ON epic16_templates USING gin (tags);
CREATE INDEX idx_epic16_templates_search ON epic16_templates USING gin (to_tsvector('english', title || ' ' || description || ' ' || array_to_string(tags, ' ')));
CREATE INDEX idx_epic16_templates_stats ON epic16_templates USING gin (stats);
CREATE INDEX idx_epic16_templates_created ON epic16_templates (created_at DESC);
CREATE INDEX idx_epic16_templates_updated ON epic16_templates (updated_at DESC);

CREATE TABLE IF NOT EXISTS epic16_template_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES epic16_templates(id) ON DELETE CASCADE,
    
    -- Version information
    version_number VARCHAR(20) NOT NULL,
    version_name VARCHAR(100),
    
    -- Technical content
    claude_model VARCHAR(50) NOT NULL,
    graph_json TEXT NOT NULL, -- Serialized graph structure
    prompt_yaml TEXT, -- Optional YAML configuration
    
    -- Documentation
    changelog TEXT,
    documentation TEXT,
    examples JSONB DEFAULT '[]', -- Array of example objects
    
    -- Validation and quality
    hash CHAR(64) NOT NULL, -- SHA-256 hash
    token_per_run_estimate INTEGER NOT NULL CHECK (token_per_run_estimate >= 0),
    safety_score DECIMAL(3,2) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
    test_results JSONB,
    
    -- Performance metrics
    avg_execution_time INTEGER CHECK (avg_execution_time >= 0), -- milliseconds
    success_rate DECIMAL(5,2) CHECK (success_rate >= 0 AND success_rate <= 100),
    
    -- Publishing information
    is_public BOOLEAN DEFAULT TRUE,
    release_notes TEXT,
    
    -- Assets (JSON array)
    assets JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint for version numbers per template
    UNIQUE(template_id, version_number),
    
    -- Constraints
    CONSTRAINT valid_version_number CHECK (length(version_number) > 0),
    CONSTRAINT valid_claude_model CHECK (length(claude_model) > 0),
    CONSTRAINT valid_graph_json CHECK (length(graph_json) > 0),
    CONSTRAINT valid_hash CHECK (length(hash) = 64)
);

-- Indexes for template versions
CREATE INDEX idx_epic16_versions_template ON epic16_template_versions (template_id);
CREATE INDEX idx_epic16_versions_hash ON epic16_template_versions (hash);
CREATE INDEX idx_epic16_versions_model ON epic16_template_versions (claude_model);
CREATE INDEX idx_epic16_versions_created ON epic16_template_versions (created_at DESC);
CREATE INDEX idx_epic16_versions_public ON epic16_template_versions (is_public, published_at DESC) WHERE is_public = TRUE;

-- =============================================================================
-- Purchases and Transactions
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    template_id UUID NOT NULL REFERENCES epic16_templates(id),
    version_id UUID NOT NULL REFERENCES epic16_template_versions(id),
    
    -- Payment information
    stripe_payment_intent_id VARCHAR(255),
    amount INTEGER NOT NULL CHECK (amount >= 0), -- Amount in cents
    currency CHAR(3) DEFAULT 'USD',
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed', 'cancelled')),
    refund_reason VARCHAR(50) CHECK (refund_reason IN ('not_as_described', 'claude_incompat', 'claude_hallucination', 'technical_issue', 'duplicate_purchase', 'other')),
    refund_amount INTEGER CHECK (refund_amount >= 0),
    
    -- Transaction details
    transaction_id VARCHAR(255),
    payment_method VARCHAR(50),
    
    -- Licensing
    license_type VARCHAR(20) DEFAULT 'personal' CHECK (license_type IN ('personal', 'commercial', 'enterprise')),
    license_terms TEXT,
    
    -- Usage tracking
    download_count INTEGER DEFAULT 0 CHECK (download_count >= 0),
    last_downloaded TIMESTAMP WITH TIME ZONE,
    
    -- Support and satisfaction
    support_ticket_id UUID,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for purchases
CREATE INDEX idx_epic16_purchases_buyer ON epic16_purchases (buyer_id);
CREATE INDEX idx_epic16_purchases_template ON epic16_purchases (template_id);
CREATE INDEX idx_epic16_purchases_version ON epic16_purchases (version_id);
CREATE INDEX idx_epic16_purchases_status ON epic16_purchases (status);
CREATE INDEX idx_epic16_purchases_stripe ON epic16_purchases (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_epic16_purchases_created ON epic16_purchases (created_at DESC);
CREATE INDEX idx_epic16_purchases_completed ON epic16_purchases (completed_at DESC) WHERE completed_at IS NOT NULL;

-- =============================================================================
-- Reviews and Ratings
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES epic16_templates(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    purchase_id UUID REFERENCES epic16_purchases(id),
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    
    -- Review categorization (JSON object)
    aspects JSONB,
    
    -- AI analysis
    sentiment_ai VARCHAR(10) CHECK (sentiment_ai IN ('positive', 'neutral', 'negative')),
    helpfulness_score DECIMAL(3,2) CHECK (helpfulness_score >= 0 AND helpfulness_score <= 1),
    
    -- Verification and authenticity
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0 CHECK (helpful_votes >= 0),
    unhelpful_votes INTEGER DEFAULT 0 CHECK (unhelpful_votes >= 0),
    
    -- Response from creator
    creator_response TEXT,
    creator_response_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(200),
    moderated_by UUID,
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_comment CHECK (length(comment) > 0),
    UNIQUE(template_id, buyer_id) -- One review per buyer per template
);

-- Indexes for reviews
CREATE INDEX idx_epic16_reviews_template ON epic16_reviews (template_id);
CREATE INDEX idx_epic16_reviews_buyer ON epic16_reviews (buyer_id);
CREATE INDEX idx_epic16_reviews_rating ON epic16_reviews (rating);
CREATE INDEX idx_epic16_reviews_verified ON epic16_reviews (verified_purchase) WHERE verified_purchase = TRUE;
CREATE INDEX idx_epic16_reviews_helpful ON epic16_reviews (helpful_votes DESC);
CREATE INDEX idx_epic16_reviews_created ON epic16_reviews (created_at DESC);
CREATE INDEX idx_epic16_reviews_flagged ON epic16_reviews (flagged) WHERE flagged = TRUE;

-- =============================================================================
-- Community Forum
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    
    -- Post content
    type VARCHAR(20) NOT NULL CHECK (type IN ('discussion', 'question', 'announcement', 'tutorial', 'showcase', 'feedback')),
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT, -- Rendered HTML
    
    -- Categorization
    category VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Post properties
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Status and moderation
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted', 'pending_moderation', 'locked')),
    moderation_reason VARCHAR(500),
    moderated_by UUID,
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement metrics
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    dislikes INTEGER DEFAULT 0 CHECK (dislikes >= 0),
    replies INTEGER DEFAULT 0 CHECK (replies >= 0),
    bookmarks INTEGER DEFAULT 0 CHECK (bookmarks >= 0),
    shares INTEGER DEFAULT 0 CHECK (shares >= 0),
    
    -- SEO and discoverability
    slug VARCHAR(200) NOT NULL,
    excerpt VARCHAR(300),
    
    -- Related content
    related_template_ids UUID[] DEFAULT '{}',
    related_post_ids UUID[] DEFAULT '{}',
    
    -- Attachments (JSON array)
    attachments JSONB DEFAULT '[]',
    
    -- Thread information
    parent_id UUID REFERENCES epic16_forum_posts(id) ON DELETE CASCADE,
    thread_id UUID, -- Top-level thread
    reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_title CHECK (length(title) > 0),
    CONSTRAINT valid_content CHECK (length(content) > 0),
    CONSTRAINT valid_category CHECK (length(category) > 0),
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for forum posts
CREATE INDEX idx_epic16_forum_posts_author ON epic16_forum_posts (author_id);
CREATE INDEX idx_epic16_forum_posts_type ON epic16_forum_posts (type);
CREATE INDEX idx_epic16_forum_posts_category ON epic16_forum_posts (category);
CREATE INDEX idx_epic16_forum_posts_status ON epic16_forum_posts (status);
CREATE INDEX idx_epic16_forum_posts_pinned ON epic16_forum_posts (is_pinned, last_activity DESC) WHERE is_pinned = TRUE;
CREATE INDEX idx_epic16_forum_posts_featured ON epic16_forum_posts (is_featured, created_at DESC) WHERE is_featured = TRUE;
CREATE INDEX idx_epic16_forum_posts_tags ON epic16_forum_posts USING gin (tags);
CREATE INDEX idx_epic16_forum_posts_search ON epic16_forum_posts USING gin (to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_epic16_forum_posts_parent ON epic16_forum_posts (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_epic16_forum_posts_thread ON epic16_forum_posts (thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_epic16_forum_posts_activity ON epic16_forum_posts (last_activity DESC);
CREATE INDEX idx_epic16_forum_posts_likes ON epic16_forum_posts (likes DESC);
CREATE UNIQUE INDEX idx_epic16_forum_posts_slug ON epic16_forum_posts (slug);

-- =============================================================================
-- Knowledge Base and Tutorials
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_knowledge_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    
    -- Article content
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT,
    excerpt VARCHAR(500),
    
    -- Categorization
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Content structure (JSON array)
    table_of_contents JSONB,
    
    -- SEO and metadata
    slug VARCHAR(200) NOT NULL,
    meta_description VARCHAR(160),
    keywords TEXT[] DEFAULT '{}',
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'under_review')),
    featured BOOLEAN DEFAULT FALSE,
    
    -- Versioning
    version VARCHAR(10) DEFAULT '1.0',
    previous_version_id UUID REFERENCES epic16_knowledge_articles(id),
    
    -- Engagement
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    bookmarks INTEGER DEFAULT 0 CHECK (bookmarks >= 0),
    helpful_votes INTEGER DEFAULT 0 CHECK (helpful_votes >= 0),
    
    -- Related content
    related_article_ids UUID[] DEFAULT '{}',
    related_template_ids UUID[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_title CHECK (length(title) > 0),
    CONSTRAINT valid_content CHECK (length(content) > 0),
    CONSTRAINT valid_category CHECK (length(category) > 0),
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for knowledge articles
CREATE INDEX idx_epic16_articles_author ON epic16_knowledge_articles (author_id);
CREATE INDEX idx_epic16_articles_category ON epic16_knowledge_articles (category, subcategory);
CREATE INDEX idx_epic16_articles_status ON epic16_knowledge_articles (status);
CREATE INDEX idx_epic16_articles_difficulty ON epic16_knowledge_articles (difficulty);
CREATE INDEX idx_epic16_articles_featured ON epic16_knowledge_articles (featured, published_at DESC) WHERE featured = TRUE;
CREATE INDEX idx_epic16_articles_tags ON epic16_knowledge_articles USING gin (tags);
CREATE INDEX idx_epic16_articles_search ON epic16_knowledge_articles USING gin (to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_epic16_articles_published ON epic16_knowledge_articles (published_at DESC) WHERE status = 'published';
CREATE UNIQUE INDEX idx_epic16_articles_slug ON epic16_knowledge_articles (slug);

CREATE TABLE IF NOT EXISTS epic16_tutorials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    
    -- Tutorial information
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(300),
    
    -- Content structure (JSON array of steps)
    steps JSONB NOT NULL,
    
    -- Tutorial metadata
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration >= 0), -- Total minutes
    
    -- Prerequisites and outcomes (JSON arrays)
    prerequisites TEXT[] DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    
    -- Media and assets
    thumbnail_url TEXT,
    video_url TEXT,
    assets JSONB DEFAULT '[]', -- JSON array of asset objects
    
    -- Interactive elements
    has_quiz BOOLEAN DEFAULT FALSE,
    has_exercises BOOLEAN DEFAULT FALSE,
    has_certificate BOOLEAN DEFAULT FALSE,
    
    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    
    -- Engagement metrics
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    completions INTEGER DEFAULT 0 CHECK (completions >= 0),
    average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_title CHECK (length(title) > 0),
    CONSTRAINT valid_description CHECK (length(description) > 0),
    CONSTRAINT valid_category CHECK (length(category) > 0),
    CONSTRAINT valid_thumbnail CHECK (thumbnail_url IS NULL OR thumbnail_url ~ '^https?://'),
    CONSTRAINT valid_video CHECK (video_url IS NULL OR video_url ~ '^https?://')
);

-- Indexes for tutorials
CREATE INDEX idx_epic16_tutorials_author ON epic16_tutorials (author_id);
CREATE INDEX idx_epic16_tutorials_category ON epic16_tutorials (category);
CREATE INDEX idx_epic16_tutorials_difficulty ON epic16_tutorials (difficulty);
CREATE INDEX idx_epic16_tutorials_status ON epic16_tutorials (status);
CREATE INDEX idx_epic16_tutorials_featured ON epic16_tutorials (featured, published_at DESC) WHERE featured = TRUE;
CREATE INDEX idx_epic16_tutorials_rating ON epic16_tutorials (average_rating DESC) WHERE average_rating IS NOT NULL;
CREATE INDEX idx_epic16_tutorials_duration ON epic16_tutorials (estimated_duration);
CREATE INDEX idx_epic16_tutorials_search ON epic16_tutorials USING gin (to_tsvector('english', title || ' ' || description));

-- =============================================================================
-- Analytics and Metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    date DATE NOT NULL,
    
    -- Activity metrics
    sessions_count INTEGER DEFAULT 0 CHECK (sessions_count >= 0),
    total_duration INTEGER DEFAULT 0 CHECK (total_duration >= 0), -- seconds
    page_views INTEGER DEFAULT 0 CHECK (page_views >= 0),
    
    -- Marketplace activity
    templates_viewed INTEGER DEFAULT 0 CHECK (templates_viewed >= 0),
    templates_liked INTEGER DEFAULT 0 CHECK (templates_liked >= 0),
    templates_purchased INTEGER DEFAULT 0 CHECK (templates_purchased >= 0),
    templates_downloaded INTEGER DEFAULT 0 CHECK (templates_downloaded >= 0),
    
    -- Community activity
    posts_created INTEGER DEFAULT 0 CHECK (posts_created >= 0),
    posts_viewed INTEGER DEFAULT 0 CHECK (posts_viewed >= 0),
    comments_posted INTEGER DEFAULT 0 CHECK (comments_posted >= 0),
    votes_given INTEGER DEFAULT 0 CHECK (votes_given >= 0),
    
    -- Learning activity
    tutorials_started INTEGER DEFAULT 0 CHECK (tutorials_started >= 0),
    tutorials_completed INTEGER DEFAULT 0 CHECK (tutorials_completed >= 0),
    articles_read INTEGER DEFAULT 0 CHECK (articles_read >= 0),
    
    -- Creator activity
    templates_created INTEGER DEFAULT 0 CHECK (templates_created >= 0),
    templates_updated INTEGER DEFAULT 0 CHECK (templates_updated >= 0),
    sales_generated INTEGER DEFAULT 0 CHECK (sales_generated >= 0), -- in cents
    reviews_received INTEGER DEFAULT 0 CHECK (reviews_received >= 0),
    
    -- Unique constraint for user per date
    UNIQUE(user_id, date)
);

-- Indexes for user analytics
CREATE INDEX idx_epic16_user_analytics_user ON epic16_user_analytics (user_id);
CREATE INDEX idx_epic16_user_analytics_date ON epic16_user_analytics (date DESC);
CREATE INDEX idx_epic16_user_analytics_recent ON epic16_user_analytics (date DESC, user_id) WHERE date >= CURRENT_DATE - INTERVAL '30 days';

CREATE TABLE IF NOT EXISTS epic16_content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('template', 'tutorial', 'case_study', 'knowledge_article', 'community_post', 'documentation')),
    date DATE NOT NULL,
    
    -- View metrics
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    unique_views INTEGER DEFAULT 0 CHECK (unique_views >= 0),
    average_view_duration DECIMAL(10,2) DEFAULT 0 CHECK (average_view_duration >= 0), -- seconds
    bounce_rate DECIMAL(5,2) DEFAULT 0 CHECK (bounce_rate >= 0 AND bounce_rate <= 100), -- percentage
    
    -- Engagement metrics
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    dislikes INTEGER DEFAULT 0 CHECK (dislikes >= 0),
    shares INTEGER DEFAULT 0 CHECK (shares >= 0),
    bookmarks INTEGER DEFAULT 0 CHECK (bookmarks >= 0),
    comments INTEGER DEFAULT 0 CHECK (comments >= 0),
    
    -- Conversion metrics (for templates)
    previews INTEGER DEFAULT 0 CHECK (previews >= 0),
    purchases INTEGER DEFAULT 0 CHECK (purchases >= 0),
    conversion_rate DECIMAL(5,2) DEFAULT 0 CHECK (conversion_rate >= 0 AND conversion_rate <= 100), -- percentage
    
    -- Geographic and demographic data (JSON objects)
    top_countries JSONB,
    top_cities JSONB,
    device_types JSONB,
    
    -- Referral sources (JSON objects)
    referral_sources JSONB,
    search_keywords JSONB,
    
    -- Unique constraint for content per date
    UNIQUE(content_id, content_type, date)
);

-- Indexes for content analytics
CREATE INDEX idx_epic16_content_analytics_content ON epic16_content_analytics (content_id, content_type);
CREATE INDEX idx_epic16_content_analytics_date ON epic16_content_analytics (date DESC);
CREATE INDEX idx_epic16_content_analytics_type ON epic16_content_analytics (content_type);
CREATE INDEX idx_epic16_content_analytics_views ON epic16_content_analytics (views DESC);
CREATE INDEX idx_epic16_content_analytics_recent ON epic16_content_analytics (date DESC, content_type) WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- =============================================================================
-- Search and Discovery
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- References epic16_user_profiles.user_id (nullable for anonymous)
    
    -- Query information
    query VARCHAR(500) NOT NULL,
    normalized_query VARCHAR(500),
    filters JSONB,
    
    -- Results and interaction
    results_count INTEGER NOT NULL CHECK (results_count >= 0),
    clicked_results JSONB DEFAULT '[]', -- JSON array of click objects
    
    -- Search context
    session_id UUID,
    referrer TEXT,
    user_agent VARCHAR(500),
    
    -- Performance metrics
    response_time DECIMAL(10,2) CHECK (response_time >= 0), -- milliseconds
    source VARCHAR(10) DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'api')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_query CHECK (length(query) > 0)
);

-- Indexes for search queries
CREATE INDEX idx_epic16_search_queries_user ON epic16_search_queries (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_epic16_search_queries_query ON epic16_search_queries USING gin (to_tsvector('english', query));
CREATE INDEX idx_epic16_search_queries_normalized ON epic16_search_queries (normalized_query);
CREATE INDEX idx_epic16_search_queries_created ON epic16_search_queries (created_at DESC);
CREATE INDEX idx_epic16_search_queries_session ON epic16_search_queries (session_id) WHERE session_id IS NOT NULL;

-- =============================================================================
-- Collections and Curation
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    
    -- Collection information
    name VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Collection properties
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    allow_collaborators BOOLEAN DEFAULT FALSE,
    
    -- Content items (JSON array)
    items JSONB DEFAULT '[]',
    
    -- Categorization
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Collaboration (JSON array)
    collaborators JSONB DEFAULT '[]',
    
    -- Engagement
    followers INTEGER DEFAULT 0 CHECK (followers >= 0),
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_name CHECK (length(name) > 0),
    CONSTRAINT valid_thumbnail CHECK (thumbnail_url IS NULL OR thumbnail_url ~ '^https?://')
);

-- Indexes for collections
CREATE INDEX idx_epic16_collections_owner ON epic16_collections (owner_id);
CREATE INDEX idx_epic16_collections_public ON epic16_collections (is_public, updated_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_epic16_collections_featured ON epic16_collections (is_featured, created_at DESC) WHERE is_featured = TRUE;
CREATE INDEX idx_epic16_collections_category ON epic16_collections (category) WHERE category IS NOT NULL;
CREATE INDEX idx_epic16_collections_tags ON epic16_collections USING gin (tags);
CREATE INDEX idx_epic16_collections_search ON epic16_collections USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================================================
-- Notifications and Communication
-- =============================================================================

CREATE TABLE IF NOT EXISTS epic16_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References epic16_user_profiles.user_id
    
    -- Notification content
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'template_published', 'template_purchased', 'template_reviewed',
        'post_replied', 'post_liked', 'comment_replied',
        'follower_added', 'collection_shared',
        'system_announcement', 'moderation_action'
    )),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Notification data (JSON object)
    data JSONB,
    action_url TEXT,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery channels and status (JSON objects)
    channels TEXT[] DEFAULT ARRAY['in_app'] CHECK (channels <@ ARRAY['in_app', 'email', 'push', 'sms']),
    delivery_status JSONB,
    
    -- Priority and scheduling
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_title CHECK (length(title) > 0),
    CONSTRAINT valid_message CHECK (length(message) > 0),
    CONSTRAINT valid_action_url CHECK (action_url IS NULL OR action_url ~ '^https?://')
);

-- Indexes for notifications
CREATE INDEX idx_epic16_notifications_user ON epic16_notifications (user_id);
CREATE INDEX idx_epic16_notifications_unread ON epic16_notifications (user_id, created_at DESC) WHERE read = FALSE;
CREATE INDEX idx_epic16_notifications_type ON epic16_notifications (type);
CREATE INDEX idx_epic16_notifications_priority ON epic16_notifications (priority, created_at DESC);
CREATE INDEX idx_epic16_notifications_scheduled ON epic16_notifications (scheduled_for) WHERE scheduled_for IS NOT NULL;

-- =============================================================================
-- Triggers and Functions
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION epic16_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER epic16_user_profiles_updated_at
    BEFORE UPDATE ON epic16_user_profiles
    FOR EACH ROW EXECUTE FUNCTION epic16_update_timestamp();

CREATE TRIGGER epic16_templates_updated_at
    BEFORE UPDATE ON epic16_templates
    FOR EACH ROW EXECUTE FUNCTION epic16_update_timestamp();

CREATE TRIGGER epic16_forum_posts_updated_at
    BEFORE UPDATE ON epic16_forum_posts
    FOR EACH ROW EXECUTE FUNCTION epic16_update_timestamp();

CREATE TRIGGER epic16_knowledge_articles_updated_at
    BEFORE UPDATE ON epic16_knowledge_articles
    FOR EACH ROW EXECUTE FUNCTION epic16_update_timestamp();

CREATE TRIGGER epic16_tutorials_updated_at
    BEFORE UPDATE ON epic16_tutorials
    FOR EACH ROW EXECUTE FUNCTION epic16_update_timestamp();

CREATE TRIGGER epic16_collections_updated_at
    BEFORE UPDATE ON epic16_collections
    FOR EACH ROW EXECUTE FUNCTION epic16_update_timestamp();

-- Function to update template statistics
CREATE OR REPLACE FUNCTION epic16_update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update template statistics when reviews are added/updated
    IF TG_TABLE_NAME = 'epic16_reviews' THEN
        UPDATE epic16_templates SET
            stats = jsonb_set(
                jsonb_set(stats, '{avgRating}', 
                    (SELECT to_jsonb(AVG(rating)::DECIMAL(3,2)) 
                     FROM epic16_reviews 
                     WHERE template_id = NEW.template_id)),
                '{ratingCount}',
                (SELECT to_jsonb(COUNT(*)::INTEGER) 
                 FROM epic16_reviews 
                 WHERE template_id = NEW.template_id)
            )
        WHERE id = NEW.template_id;
    END IF;
    
    -- Update template statistics when purchases are completed
    IF TG_TABLE_NAME = 'epic16_purchases' AND NEW.status = 'completed' THEN
        UPDATE epic16_templates SET
            stats = jsonb_set(stats, '{purchases}',
                (SELECT to_jsonb(COUNT(*)::INTEGER) 
                 FROM epic16_purchases 
                 WHERE template_id = NEW.template_id AND status = 'completed')
            )
        WHERE id = NEW.template_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating template statistics
CREATE TRIGGER epic16_update_template_stats_reviews
    AFTER INSERT OR UPDATE ON epic16_reviews
    FOR EACH ROW EXECUTE FUNCTION epic16_update_template_stats();

CREATE TRIGGER epic16_update_template_stats_purchases
    AFTER INSERT OR UPDATE ON epic16_purchases
    FOR EACH ROW EXECUTE FUNCTION epic16_update_template_stats();

-- Function to update user profile statistics
CREATE OR REPLACE FUNCTION epic16_update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update creator statistics when templates are created
    IF TG_TABLE_NAME = 'epic16_templates' THEN
        UPDATE epic16_user_profiles SET
            templates_created = (
                SELECT COUNT(*)::INTEGER 
                FROM epic16_templates 
                WHERE owner_id = NEW.owner_id
            )
        WHERE user_id = NEW.owner_id;
    END IF;
    
    -- Update review statistics when reviews are received
    IF TG_TABLE_NAME = 'epic16_reviews' THEN
        UPDATE epic16_user_profiles SET
            total_reviews = (
                SELECT COUNT(*)::INTEGER 
                FROM epic16_reviews r 
                JOIN epic16_templates t ON r.template_id = t.id 
                WHERE t.owner_id = (
                    SELECT owner_id FROM epic16_templates WHERE id = NEW.template_id
                )
            ),
            average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM epic16_reviews r 
                JOIN epic16_templates t ON r.template_id = t.id 
                WHERE t.owner_id = (
                    SELECT owner_id FROM epic16_templates WHERE id = NEW.template_id
                )
            )
        WHERE user_id = (
            SELECT owner_id FROM epic16_templates WHERE id = NEW.template_id
        );
    END IF;
    
    -- Update sales statistics when purchases are completed
    IF TG_TABLE_NAME = 'epic16_purchases' AND NEW.status = 'completed' THEN
        UPDATE epic16_user_profiles SET
            total_sales = (
                SELECT COALESCE(SUM(amount), 0)::INTEGER 
                FROM epic16_purchases p 
                JOIN epic16_templates t ON p.template_id = t.id 
                WHERE t.owner_id = (
                    SELECT owner_id FROM epic16_templates WHERE id = NEW.template_id
                ) AND p.status = 'completed'
            )
        WHERE user_id = (
            SELECT owner_id FROM epic16_templates WHERE id = NEW.template_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating user statistics
CREATE TRIGGER epic16_update_user_stats_templates
    AFTER INSERT ON epic16_templates
    FOR EACH ROW EXECUTE FUNCTION epic16_update_user_stats();

CREATE TRIGGER epic16_update_user_stats_reviews
    AFTER INSERT OR UPDATE ON epic16_reviews
    FOR EACH ROW EXECUTE FUNCTION epic16_update_user_stats();

CREATE TRIGGER epic16_update_user_stats_purchases
    AFTER INSERT OR UPDATE ON epic16_purchases
    FOR EACH ROW EXECUTE FUNCTION epic16_update_user_stats();

-- =============================================================================
-- Views for Common Queries
-- =============================================================================

-- View for active marketplace templates with owner information
CREATE VIEW epic16_active_templates AS
SELECT 
    t.*,
    p.display_name as owner_name,
    p.verified_creator,
    p.avatar as owner_avatar
FROM epic16_templates t
JOIN epic16_user_profiles p ON t.owner_id = p.user_id
WHERE t.status = 'listed';

-- View for popular content across all types
CREATE VIEW epic16_popular_content AS
SELECT 
    'template' as content_type,
    id as content_id,
    title,
    owner_id as author_id,
    (stats->>'views')::INTEGER as views,
    (stats->>'likes')::INTEGER as likes,
    created_at
FROM epic16_templates
WHERE status = 'listed'

UNION ALL

SELECT 
    'forum_post' as content_type,
    id as content_id,
    title,
    author_id,
    views,
    likes,
    created_at
FROM epic16_forum_posts
WHERE status = 'active'

UNION ALL

SELECT 
    'knowledge_article' as content_type,
    id as content_id,
    title,
    author_id,
    views,
    likes,
    created_at
FROM epic16_knowledge_articles
WHERE status = 'published'

UNION ALL

SELECT 
    'tutorial' as content_type,
    id as content_id,
    title,
    author_id,
    views,
    0 as likes, -- tutorials don't have likes
    created_at
FROM epic16_tutorials
WHERE status = 'published';

-- =============================================================================
-- Sample Data and Comments
-- =============================================================================

-- Add table comments for documentation
COMMENT ON TABLE epic16_user_profiles IS 'Extended user profiles for Epic 16 marketplace and community features';
COMMENT ON TABLE epic16_templates IS 'Marketplace templates with pricing, categorization, and metadata';
COMMENT ON TABLE epic16_template_versions IS 'Version history and content for templates';
COMMENT ON TABLE epic16_purchases IS 'Purchase transactions and licensing information';
COMMENT ON TABLE epic16_reviews IS 'User reviews and ratings for templates';
COMMENT ON TABLE epic16_forum_posts IS 'Community forum posts and discussions';
COMMENT ON TABLE epic16_knowledge_articles IS 'Knowledge base articles and documentation';
COMMENT ON TABLE epic16_tutorials IS 'Interactive tutorials and learning content';
COMMENT ON TABLE epic16_user_analytics IS 'Daily user activity and engagement metrics';
COMMENT ON TABLE epic16_content_analytics IS 'Daily content performance and engagement metrics';
COMMENT ON TABLE epic16_search_queries IS 'Search query logs and interaction tracking';
COMMENT ON TABLE epic16_collections IS 'User-created collections and curation';
COMMENT ON TABLE epic16_notifications IS 'User notifications and communication';

-- Create initial data for testing (optional)
-- INSERT INTO epic16_user_profiles (user_id, display_name, bio, is_creator) VALUES 
-- (uuid_generate_v4(), 'Test Creator', 'A test creator for Epic 16', true);

-- Performance optimization settings
-- Adjust based on expected load and hardware
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_statement = 'all';

-- Final message
DO $$
BEGIN
    RAISE NOTICE '✅ Epic 16 Content Database Schema created successfully';
    RAISE NOTICE '📊 Tables created: 12 core tables + 2 views';
    RAISE NOTICE '🔧 Features: Templates, Reviews, Forum, Analytics, Collections, Notifications';
    RAISE NOTICE '⚡ Indexes: Full-text search, GIN indexes, performance optimization';
    RAISE NOTICE '🔄 Triggers: Automatic statistics updates, timestamp management';
    RAISE NOTICE '🚀 Epic 16 content system ready for deployment';
END $$;