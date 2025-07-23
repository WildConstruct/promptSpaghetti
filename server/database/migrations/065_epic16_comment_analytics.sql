-- Epic 16 Comment Analytics Database Schema
-- Task: E16-1753114247014-D03BBE - Create comment analytics
-- Migration 065: Comment analytics tables and views for comprehensive analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Comment Analytics Aggregation Tables
-- =============================================================================

-- Daily comment analytics aggregations
CREATE TABLE IF NOT EXISTS comment_analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN (
        'contribution', 'template', 'project', 'user', 'marketplace_item'
    )),
    date DATE NOT NULL,
    
    -- Core metrics
    total_comments INTEGER NOT NULL DEFAULT 0,
    total_replies INTEGER NOT NULL DEFAULT 0,
    total_threads INTEGER NOT NULL DEFAULT 0,
    unique_commenters INTEGER NOT NULL DEFAULT 0,
    
    -- Engagement metrics
    total_likes INTEGER NOT NULL DEFAULT 0,
    total_dislikes INTEGER NOT NULL DEFAULT 0,
    total_shares INTEGER NOT NULL DEFAULT 0,
    total_reports INTEGER NOT NULL DEFAULT 0,
    total_helpful_marks INTEGER NOT NULL DEFAULT 0,
    
    -- Quality metrics
    average_rating DECIMAL(3,2) DEFAULT NULL,
    quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    spam_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    moderation_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Timing metrics
    average_response_time_minutes INTEGER DEFAULT NULL,
    peak_activity_hour INTEGER DEFAULT NULL,
    
    -- Growth metrics
    comment_velocity DECIMAL(8,2) NOT NULL DEFAULT 0, -- comments per hour
    engagement_rate DECIMAL(5,2) NOT NULL DEFAULT 0,  -- engagements per comment
    viral_coefficient DECIMAL(5,2) NOT NULL DEFAULT 0, -- shares per comment
    
    -- Trending metrics
    trending_score DECIMAL(8,2) NOT NULL DEFAULT 0,
    trending_rank INTEGER DEFAULT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_resource_date UNIQUE (resource_id, resource_type, date)
);

-- Comment engagement events (real-time tracking)
CREATE TABLE IF NOT EXISTS comment_engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    ip_address INET,
    
    -- Engagement details
    engagement_type VARCHAR(20) NOT NULL CHECK (engagement_type IN (
        'like', 'dislike', 'reply', 'share', 'helpful', 'report', 
        'view', 'click', 'expand', 'collapse', 'quote'
    )),
    engagement_value INTEGER DEFAULT 1, -- For weighted engagements
    
    -- Context
    device_type VARCHAR(20) DEFAULT 'unknown',
    platform VARCHAR(20) DEFAULT 'web',
    referrer TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance tracking
    response_time_ms INTEGER DEFAULT NULL,
    
    CONSTRAINT fk_comment_engagement_comment 
        FOREIGN KEY (comment_id) REFERENCES feedback(id) ON DELETE CASCADE
);

-- Comment sentiment analysis
CREATE TABLE IF NOT EXISTS comment_sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL,
    
    -- Sentiment scoring
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN (
        'very_positive', 'positive', 'neutral', 'negative', 'very_negative'
    )),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Detailed emotion analysis
    emotions JSONB DEFAULT '{}', -- {"joy": 0.8, "anger": 0.1, "surprise": 0.3}
    
    -- Content quality metrics
    toxicity_score DECIMAL(3,2) DEFAULT 0 CHECK (toxicity_score >= 0 AND toxicity_score <= 1),
    spam_likelihood DECIMAL(3,2) DEFAULT 0 CHECK (spam_likelihood >= 0 AND spam_likelihood <= 1),
    readability_score DECIMAL(3,2) DEFAULT 0 CHECK (readability_score >= 0 AND readability_score <= 1),
    
    -- Topic classification
    topics JSONB DEFAULT '[]', -- ["technical", "pricing", "usability"]
    keywords JSONB DEFAULT '[]', -- ["performance", "bug", "feature"]
    
    -- Analysis metadata
    model_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    analysis_method VARCHAR(50) NOT NULL DEFAULT 'ml_sentiment',
    processing_time_ms INTEGER DEFAULT NULL,
    
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_comment_sentiment_comment 
        FOREIGN KEY (comment_id) REFERENCES feedback(id) ON DELETE CASCADE,
    CONSTRAINT unique_comment_sentiment UNIQUE (comment_id)
);

-- Comment topic trends
CREATE TABLE IF NOT EXISTS comment_topic_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    
    -- Topic information
    topic VARCHAR(100) NOT NULL,
    topic_category VARCHAR(50) NOT NULL DEFAULT 'general',
    
    -- Trend metrics
    mention_count INTEGER NOT NULL DEFAULT 0,
    sentiment_average DECIMAL(3,2) DEFAULT 0, -- -1 to 1 scale
    growth_rate DECIMAL(5,2) DEFAULT 0, -- percentage change from previous period
    
    -- Context
    peak_hour INTEGER DEFAULT NULL,
    related_topics JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_resource_topic_date UNIQUE (resource_id, resource_type, topic, date)
);

-- Comment user analytics
CREATE TABLE IF NOT EXISTS comment_user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    
    -- Activity metrics
    comments_posted INTEGER NOT NULL DEFAULT 0,
    replies_posted INTEGER NOT NULL DEFAULT 0,
    likes_given INTEGER NOT NULL DEFAULT 0,
    likes_received INTEGER NOT NULL DEFAULT 0,
    
    -- Quality metrics
    average_comment_length INTEGER DEFAULT 0,
    helpful_marks_received INTEGER NOT NULL DEFAULT 0,
    spam_reports_received INTEGER NOT NULL DEFAULT 0,
    
    -- Engagement metrics
    engagement_score DECIMAL(8,2) NOT NULL DEFAULT 0,
    influence_score DECIMAL(8,2) NOT NULL DEFAULT 0,
    reputation_score DECIMAL(8,2) NOT NULL DEFAULT 0,
    
    -- Behavioral metrics
    response_time_minutes DECIMAL(8,2) DEFAULT NULL,
    activity_hours JSONB DEFAULT '[]', -- [9, 10, 14, 20] - active hours
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Comment analytics daily indexes
CREATE INDEX idx_comment_analytics_daily_resource ON comment_analytics_daily(resource_id, resource_type);
CREATE INDEX idx_comment_analytics_daily_date ON comment_analytics_daily(date);
CREATE INDEX idx_comment_analytics_daily_trending ON comment_analytics_daily(trending_score DESC, date DESC);
CREATE INDEX idx_comment_analytics_daily_quality ON comment_analytics_daily(quality_score DESC, date DESC);

-- Comment engagement events indexes
CREATE INDEX idx_comment_engagement_events_comment ON comment_engagement_events(comment_id);
CREATE INDEX idx_comment_engagement_events_user ON comment_engagement_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_comment_engagement_events_type ON comment_engagement_events(engagement_type);
CREATE INDEX idx_comment_engagement_events_timestamp ON comment_engagement_events(timestamp);
CREATE INDEX idx_comment_engagement_events_session ON comment_engagement_events(session_id);

-- Comment sentiment analysis indexes
CREATE INDEX idx_comment_sentiment_comment ON comment_sentiment_analysis(comment_id);
CREATE INDEX idx_comment_sentiment_sentiment ON comment_sentiment_analysis(sentiment);
CREATE INDEX idx_comment_sentiment_topics ON comment_sentiment_analysis USING GIN(topics);
CREATE INDEX idx_comment_sentiment_keywords ON comment_sentiment_analysis USING GIN(keywords);
CREATE INDEX idx_comment_sentiment_analyzed_at ON comment_sentiment_analysis(analyzed_at);

-- Comment topic trends indexes
CREATE INDEX idx_comment_topic_trends_resource ON comment_topic_trends(resource_id, resource_type);
CREATE INDEX idx_comment_topic_trends_topic ON comment_topic_trends(topic);
CREATE INDEX idx_comment_topic_trends_date ON comment_topic_trends(date);
CREATE INDEX idx_comment_topic_trends_growth ON comment_topic_trends(growth_rate DESC, date DESC);

-- Comment user analytics indexes
CREATE INDEX idx_comment_user_analytics_user ON comment_user_analytics(user_id);
CREATE INDEX idx_comment_user_analytics_date ON comment_user_analytics(date);
CREATE INDEX idx_comment_user_analytics_engagement ON comment_user_analytics(engagement_score DESC);

-- =============================================================================
-- Views for Analytics Queries
-- =============================================================================

-- Real-time comment analytics view
CREATE OR REPLACE VIEW comment_analytics_realtime AS
SELECT 
    f.target_id as resource_id,
    f.target_type as resource_type,
    COUNT(*) as total_comments,
    COUNT(DISTINCT f.author_id) as unique_commenters,
    COALESCE(AVG(f.rating), 0) as average_rating,
    COUNT(*) FILTER (WHERE f.created_at >= NOW() - INTERVAL '1 hour') as comments_last_hour,
    COUNT(*) FILTER (WHERE f.created_at >= NOW() - INTERVAL '24 hours') as comments_last_day,
    
    -- Engagement metrics from events
    COALESCE(engagement_stats.total_likes, 0) as total_likes,
    COALESCE(engagement_stats.total_replies, 0) as total_replies,
    COALESCE(engagement_stats.total_shares, 0) as total_shares,
    COALESCE(engagement_stats.total_reports, 0) as total_reports,
    
    -- Quality metrics
    COALESCE(sentiment_stats.positive_rate, 0) as positive_sentiment_rate,
    COALESCE(sentiment_stats.avg_toxicity, 0) as average_toxicity_score,
    
    MAX(f.created_at) as last_comment_at,
    NOW() as computed_at
FROM feedback f
WHERE f.type = 'comment'
LEFT JOIN (
    SELECT 
        f2.id as comment_id,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'like') as total_likes,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'reply') as total_replies,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'share') as total_shares,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'report') as total_reports
    FROM feedback f2
    LEFT JOIN comment_engagement_events cee ON f2.id = cee.comment_id
    WHERE f2.type = 'comment'
    GROUP BY f2.id
) engagement_stats ON f.id = engagement_stats.comment_id
LEFT JOIN (
    SELECT 
        csa.comment_id,
        AVG(CASE 
            WHEN csa.sentiment IN ('positive', 'very_positive') THEN 1.0
            WHEN csa.sentiment = 'neutral' THEN 0.5
            ELSE 0.0
        END) as positive_rate,
        AVG(csa.toxicity_score) as avg_toxicity
    FROM comment_sentiment_analysis csa
    GROUP BY csa.comment_id
) sentiment_stats ON f.id = sentiment_stats.comment_id
GROUP BY f.target_id, f.target_type, engagement_stats.total_likes, 
         engagement_stats.total_replies, engagement_stats.total_shares, 
         engagement_stats.total_reports, sentiment_stats.positive_rate, 
         sentiment_stats.avg_toxicity;

-- Top commenters view
CREATE OR REPLACE VIEW top_commenters AS
SELECT 
    f.author_id as user_id,
    COUNT(*) as total_comments,
    AVG(f.rating) as average_rating,
    COUNT(DISTINCT f.target_id) as resources_commented,
    MAX(f.created_at) as last_comment_at,
    
    -- Engagement received
    COALESCE(engagement_received.total_likes, 0) as likes_received,
    COALESCE(engagement_received.total_shares, 0) as shares_received,
    COALESCE(engagement_received.total_helpful, 0) as helpful_marks_received,
    
    -- Quality metrics
    COALESCE(quality_metrics.avg_sentiment_score, 0) as average_sentiment_score,
    COALESCE(quality_metrics.avg_toxicity, 0) as average_toxicity_score,
    
    -- Calculate influence score
    (
        COUNT(*) * 1.0 +  -- Base comment count
        COALESCE(engagement_received.total_likes, 0) * 2.0 +  -- Likes weight
        COALESCE(engagement_received.total_shares, 0) * 5.0 +  -- Shares weight
        COALESCE(engagement_received.total_helpful, 0) * 3.0   -- Helpful weight
    ) as influence_score
    
FROM feedback f
WHERE f.type = 'comment' AND f.status = 'approved'
LEFT JOIN (
    SELECT 
        f2.author_id,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'like') as total_likes,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'share') as total_shares,
        COUNT(*) FILTER (WHERE cee.engagement_type = 'helpful') as total_helpful
    FROM feedback f2
    LEFT JOIN comment_engagement_events cee ON f2.id = cee.comment_id
    WHERE f2.type = 'comment'
    GROUP BY f2.author_id
) engagement_received ON f.author_id = engagement_received.author_id
LEFT JOIN (
    SELECT 
        f3.author_id,
        AVG(CASE 
            WHEN csa.sentiment = 'very_positive' THEN 1.0
            WHEN csa.sentiment = 'positive' THEN 0.75
            WHEN csa.sentiment = 'neutral' THEN 0.5
            WHEN csa.sentiment = 'negative' THEN 0.25
            ELSE 0.0
        END) as avg_sentiment_score,
        AVG(csa.toxicity_score) as avg_toxicity
    FROM feedback f3
    JOIN comment_sentiment_analysis csa ON f3.id = csa.comment_id
    WHERE f3.type = 'comment'
    GROUP BY f3.author_id
) quality_metrics ON f.author_id = quality_metrics.author_id
GROUP BY f.author_id, engagement_received.total_likes, engagement_received.total_shares, 
         engagement_received.total_helpful, quality_metrics.avg_sentiment_score, 
         quality_metrics.avg_toxicity
HAVING COUNT(*) >= 1
ORDER BY influence_score DESC;

-- =============================================================================
-- Functions for Analytics Processing
-- =============================================================================

-- Function to calculate trending score for comments
CREATE OR REPLACE FUNCTION calculate_comment_trending_score(
    comment_id UUID,
    algorithm VARCHAR(20) DEFAULT 'default'
) RETURNS DECIMAL(8,2) AS $$
DECLARE
    score DECIMAL(8,2) := 0;
    comment_age_hours INTEGER;
    engagement_count INTEGER;
    like_count INTEGER;
    reply_count INTEGER;
    share_count INTEGER;
    quality_multiplier DECIMAL(3,2) := 1.0;
    recency_factor DECIMAL(3,2);
BEGIN
    -- Get comment age in hours
    SELECT EXTRACT(EPOCH FROM (NOW() - f.created_at)) / 3600
    INTO comment_age_hours
    FROM feedback f
    WHERE f.id = comment_id;
    
    -- Get engagement counts
    SELECT 
        COUNT(*) as total_engagement,
        COUNT(*) FILTER (WHERE engagement_type = 'like') as likes,
        COUNT(*) FILTER (WHERE engagement_type = 'reply') as replies,
        COUNT(*) FILTER (WHERE engagement_type = 'share') as shares
    INTO engagement_count, like_count, reply_count, share_count
    FROM comment_engagement_events
    WHERE comment_engagement_events.comment_id = calculate_comment_trending_score.comment_id;
    
    -- Get quality multiplier from sentiment analysis
    SELECT CASE 
        WHEN sentiment IN ('positive', 'very_positive') AND toxicity_score < 0.3 THEN 1.2
        WHEN sentiment = 'neutral' AND toxicity_score < 0.3 THEN 1.0
        WHEN toxicity_score >= 0.7 THEN 0.3
        ELSE 0.8
    END INTO quality_multiplier
    FROM comment_sentiment_analysis
    WHERE comment_sentiment_analysis.comment_id = calculate_comment_trending_score.comment_id;
    
    -- Calculate recency factor (exponential decay)
    recency_factor := EXP(-comment_age_hours / 24.0); -- 24-hour half-life
    
    -- Calculate trending score based on algorithm
    IF algorithm = 'engagement_weighted' THEN
        score := (
            like_count * 1.0 +
            reply_count * 2.0 +
            share_count * 3.0
        ) * recency_factor * COALESCE(quality_multiplier, 1.0);
    ELSE -- default algorithm
        score := (
            engagement_count * 1.5 +
            like_count * 0.5 +
            reply_count * 1.0 +
            share_count * 2.0
        ) * recency_factor * COALESCE(quality_multiplier, 1.0);
    END IF;
    
    RETURN GREATEST(score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_comment_analytics_daily(
    target_resource_id UUID,
    target_resource_type VARCHAR(50),
    target_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO comment_analytics_daily (
        resource_id, resource_type, date,
        total_comments, total_replies, total_threads, unique_commenters,
        total_likes, total_dislikes, total_shares, total_reports, total_helpful_marks,
        average_rating, quality_score, spam_rate, moderation_rate,
        comment_velocity, engagement_rate, viral_coefficient, trending_score
    )
    SELECT 
        target_resource_id,
        target_resource_type,
        target_date,
        
        -- Core metrics
        COUNT(*) as total_comments,
        COUNT(*) FILTER (WHERE parent_comment_id IS NOT NULL) as total_replies,
        COUNT(*) FILTER (WHERE parent_comment_id IS NULL) as total_threads,
        COUNT(DISTINCT author_id) as unique_commenters,
        
        -- Engagement metrics
        COALESCE(engagement_data.total_likes, 0) as total_likes,
        COALESCE(engagement_data.total_dislikes, 0) as total_dislikes,
        COALESCE(engagement_data.total_shares, 0) as total_shares,
        COALESCE(engagement_data.total_reports, 0) as total_reports,
        COALESCE(engagement_data.total_helpful, 0) as total_helpful_marks,
        
        -- Quality metrics
        AVG(rating) as average_rating,
        COALESCE(quality_data.avg_quality_score, 0) as quality_score,
        COALESCE(quality_data.spam_rate, 0) as spam_rate,
        COALESCE(moderation_data.moderation_rate, 0) as moderation_rate,
        
        -- Calculated metrics
        COUNT(*) / 24.0 as comment_velocity, -- comments per hour
        CASE WHEN COUNT(*) > 0 THEN COALESCE(engagement_data.total_engagement, 0)::DECIMAL / COUNT(*) ELSE 0 END as engagement_rate,
        CASE WHEN COUNT(*) > 0 THEN COALESCE(engagement_data.total_shares, 0)::DECIMAL / COUNT(*) ELSE 0 END as viral_coefficient,
        COALESCE(trending_data.avg_trending_score, 0) as trending_score
        
    FROM feedback f
    LEFT JOIN (
        SELECT 
            f2.target_id,
            COUNT(*) as total_engagement,
            COUNT(*) FILTER (WHERE cee.engagement_type = 'like') as total_likes,
            COUNT(*) FILTER (WHERE cee.engagement_type = 'dislike') as total_dislikes,
            COUNT(*) FILTER (WHERE cee.engagement_type = 'share') as total_shares,
            COUNT(*) FILTER (WHERE cee.engagement_type = 'report') as total_reports,
            COUNT(*) FILTER (WHERE cee.engagement_type = 'helpful') as total_helpful
        FROM feedback f2
        JOIN comment_engagement_events cee ON f2.id = cee.comment_id
        WHERE f2.target_id = target_resource_id 
          AND f2.target_type = target_resource_type
          AND f2.type = 'comment'
          AND DATE(cee.timestamp) = target_date
        GROUP BY f2.target_id
    ) engagement_data ON f.target_id = engagement_data.target_id
    LEFT JOIN (
        SELECT 
            f3.target_id,
            AVG(CASE 
                WHEN csa.sentiment IN ('positive', 'very_positive') AND csa.toxicity_score < 0.3 THEN 85
                WHEN csa.sentiment = 'neutral' AND csa.toxicity_score < 0.3 THEN 70
                WHEN csa.toxicity_score >= 0.7 THEN 20
                ELSE 50
            END) as avg_quality_score,
            AVG(csa.spam_likelihood) * 100 as spam_rate
        FROM feedback f3
        JOIN comment_sentiment_analysis csa ON f3.id = csa.comment_id
        WHERE f3.target_id = target_resource_id 
          AND f3.target_type = target_resource_type
          AND f3.type = 'comment'
          AND DATE(f3.created_at) = target_date
        GROUP BY f3.target_id
    ) quality_data ON f.target_id = quality_data.target_id
    LEFT JOIN (
        SELECT 
            f4.target_id,
            COUNT(*) FILTER (WHERE f4.status IN ('flagged', 'rejected'))::DECIMAL / NULLIF(COUNT(*), 0) * 100 as moderation_rate
        FROM feedback f4
        WHERE f4.target_id = target_resource_id 
          AND f4.target_type = target_resource_type
          AND f4.type = 'comment'
          AND DATE(f4.created_at) = target_date
        GROUP BY f4.target_id
    ) moderation_data ON f.target_id = moderation_data.target_id
    LEFT JOIN (
        SELECT 
            f5.target_id,
            AVG(calculate_comment_trending_score(f5.id)) as avg_trending_score
        FROM feedback f5
        WHERE f5.target_id = target_resource_id 
          AND f5.target_type = target_resource_type
          AND f5.type = 'comment'
          AND DATE(f5.created_at) = target_date
        GROUP BY f5.target_id
    ) trending_data ON f.target_id = trending_data.target_id
    WHERE f.target_id = target_resource_id 
      AND f.target_type = target_resource_type
      AND f.type = 'comment'
      AND DATE(f.created_at) = target_date
    GROUP BY f.target_id, f.target_type, engagement_data.total_engagement, 
             engagement_data.total_likes, engagement_data.total_dislikes,
             engagement_data.total_shares, engagement_data.total_reports, 
             engagement_data.total_helpful, quality_data.avg_quality_score,
             quality_data.spam_rate, moderation_data.moderation_rate,
             trending_data.avg_trending_score
    ON CONFLICT (resource_id, resource_type, date) DO UPDATE SET
        total_comments = EXCLUDED.total_comments,
        total_replies = EXCLUDED.total_replies,
        total_threads = EXCLUDED.total_threads,
        unique_commenters = EXCLUDED.unique_commenters,
        total_likes = EXCLUDED.total_likes,
        total_dislikes = EXCLUDED.total_dislikes,
        total_shares = EXCLUDED.total_shares,
        total_reports = EXCLUDED.total_reports,
        total_helpful_marks = EXCLUDED.total_helpful_marks,
        average_rating = EXCLUDED.average_rating,
        quality_score = EXCLUDED.quality_score,
        spam_rate = EXCLUDED.spam_rate,
        moderation_rate = EXCLUDED.moderation_rate,
        comment_velocity = EXCLUDED.comment_velocity,
        engagement_rate = EXCLUDED.engagement_rate,
        viral_coefficient = EXCLUDED.viral_coefficient,
        trending_score = EXCLUDED.trending_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Triggers for Real-time Updates
-- =============================================================================

-- Function to handle engagement event inserts
CREATE OR REPLACE FUNCTION handle_engagement_event_insert() RETURNS TRIGGER AS $$
BEGIN
    -- Update real-time analytics cache (could be Redis in production)
    -- For now, we'll rely on the real-time view
    
    -- Optionally update daily analytics immediately for current date
    -- This could be moved to a background job for performance
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for engagement events
CREATE TRIGGER trigger_engagement_event_insert
    AFTER INSERT ON comment_engagement_events
    FOR EACH ROW
    EXECUTE FUNCTION handle_engagement_event_insert();

-- Add comments for documentation
COMMENT ON TABLE comment_analytics_daily IS 'Daily aggregated analytics for comments on resources';
COMMENT ON TABLE comment_engagement_events IS 'Real-time tracking of user interactions with comments';
COMMENT ON TABLE comment_sentiment_analysis IS 'AI/ML analysis of comment sentiment and quality';
COMMENT ON TABLE comment_topic_trends IS 'Trending topics and themes in comments over time';
COMMENT ON TABLE comment_user_analytics IS 'User-level comment activity and behavior analytics';

COMMENT ON VIEW comment_analytics_realtime IS 'Real-time view of comment analytics across all resources';
COMMENT ON VIEW top_commenters IS 'Ranking of most influential and active comment authors';

COMMENT ON FUNCTION calculate_comment_trending_score IS 'Calculate trending score for individual comments using configurable algorithms';
COMMENT ON FUNCTION update_comment_analytics_daily IS 'Update daily analytics for a specific resource and date';