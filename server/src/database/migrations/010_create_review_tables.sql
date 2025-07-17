-- Epic 16.1.6 - Review System Database Schema
-- Migration 010: Create review and rating system tables

-- Enhanced template_reviews table (extend existing)
-- Add new columns to existing template_reviews table
ALTER TABLE template_reviews ADD COLUMN title TEXT;
ALTER TABLE template_reviews ADD COLUMN pros TEXT DEFAULT '[]'; -- JSON array
ALTER TABLE template_reviews ADD COLUMN cons TEXT DEFAULT '[]'; -- JSON array
ALTER TABLE template_reviews ADD COLUMN use_case TEXT;
ALTER TABLE template_reviews ADD COLUMN difficulty_rating INTEGER; -- 1-5 scale
ALTER TABLE template_reviews ADD COLUMN would_recommend BOOLEAN DEFAULT TRUE;
ALTER TABLE template_reviews ADD COLUMN helpful_votes INTEGER DEFAULT 0;
ALTER TABLE template_reviews ADD COLUMN not_helpful_votes INTEGER DEFAULT 0;
ALTER TABLE template_reviews ADD COLUMN flag_count INTEGER DEFAULT 0;

-- Create indexes for new columns
CREATE INDEX idx_template_reviews_title ON template_reviews(title);
CREATE INDEX idx_template_reviews_use_case ON template_reviews(use_case);
CREATE INDEX idx_template_reviews_difficulty ON template_reviews(difficulty_rating);
CREATE INDEX idx_template_reviews_would_recommend ON template_reviews(would_recommend);
CREATE INDEX idx_template_reviews_helpful_votes ON template_reviews(helpful_votes);
CREATE INDEX idx_template_reviews_flag_count ON template_reviews(flag_count);

-- Review Helpfulness Votes table
CREATE TABLE IF NOT EXISTS review_helpfulness_votes (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('helpful', 'not_helpful')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_helpfulness_votes_review_id ON review_helpfulness_votes(review_id);
CREATE INDEX idx_review_helpfulness_votes_user_id ON review_helpfulness_votes(user_id);
CREATE INDEX idx_review_helpfulness_votes_vote ON review_helpfulness_votes(vote);

-- Review Flags table
CREATE TABLE IF NOT EXISTS review_flags (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    flagger_id TEXT NOT NULL,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('inappropriate', 'spam', 'fake', 'off_topic', 'harassment', 'copyright', 'other')),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolved_by TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (flagger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id),
    UNIQUE(review_id, flagger_id, flag_type)
);

CREATE INDEX idx_review_flags_review_id ON review_flags(review_id);
CREATE INDEX idx_review_flags_flagger_id ON review_flags(flagger_id);
CREATE INDEX idx_review_flags_flag_type ON review_flags(flag_type);
CREATE INDEX idx_review_flags_status ON review_flags(status);
CREATE INDEX idx_review_flags_created_at ON review_flags(created_at);

-- Creator Responses table
CREATE TABLE IF NOT EXISTS creator_responses (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(review_id) -- One response per review
);

CREATE INDEX idx_creator_responses_review_id ON creator_responses(review_id);
CREATE INDEX idx_creator_responses_creator_id ON creator_responses(creator_id);
CREATE INDEX idx_creator_responses_created_at ON creator_responses(created_at);

-- Review Attachments table
CREATE TABLE IF NOT EXISTS review_attachments (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'file')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    upload_key TEXT, -- S3 key or similar
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_attachments_review_id ON review_attachments(review_id);
CREATE INDEX idx_review_attachments_type ON review_attachments(type);
CREATE INDEX idx_review_attachments_created_at ON review_attachments(created_at);

-- Review Analytics table
CREATE TABLE IF NOT EXISTS review_analytics (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_reviews INTEGER DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,
    five_star_count INTEGER DEFAULT 0,
    four_star_count INTEGER DEFAULT 0,
    three_star_count INTEGER DEFAULT 0,
    two_star_count INTEGER DEFAULT 0,
    one_star_count INTEGER DEFAULT 0,
    verified_reviews INTEGER DEFAULT 0,
    reviews_with_comments INTEGER DEFAULT 0,
    total_helpfulness_votes INTEGER DEFAULT 0,
    total_flags INTEGER DEFAULT 0,
    creator_responses INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    UNIQUE(template_id, date)
);

CREATE INDEX idx_review_analytics_template_id ON review_analytics(template_id);
CREATE INDEX idx_review_analytics_date ON review_analytics(date);
CREATE INDEX idx_review_analytics_average_rating ON review_analytics(average_rating);

-- Review Keywords table (for sentiment and keyword analysis)
CREATE TABLE IF NOT EXISTS review_keywords (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
    frequency INTEGER DEFAULT 1,
    context TEXT, -- surrounding text for context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_keywords_review_id ON review_keywords(review_id);
CREATE INDEX idx_review_keywords_keyword ON review_keywords(keyword);
CREATE INDEX idx_review_keywords_sentiment ON review_keywords(sentiment);

-- Review Moderation Queue table
CREATE TABLE IF NOT EXISTS review_moderation_queue (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    reason TEXT NOT NULL, -- Why it's in the queue
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'escalated')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    UNIQUE(review_id)
);

CREATE INDEX idx_review_moderation_queue_priority ON review_moderation_queue(priority);
CREATE INDEX idx_review_moderation_queue_status ON review_moderation_queue(status);
CREATE INDEX idx_review_moderation_queue_assigned_to ON review_moderation_queue(assigned_to);
CREATE INDEX idx_review_moderation_queue_created_at ON review_moderation_queue(created_at);

-- Review Sentiment Analysis table
CREATE TABLE IF NOT EXISTS review_sentiment_analysis (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    overall_sentiment TEXT NOT NULL CHECK (overall_sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
    confidence_score REAL NOT NULL, -- 0.0 to 1.0
    positive_keywords TEXT DEFAULT '[]', -- JSON array
    negative_keywords TEXT DEFAULT '[]', -- JSON array
    neutral_keywords TEXT DEFAULT '[]', -- JSON array
    emotion_scores TEXT DEFAULT '{}', -- JSON object with emotion scores
    language_detected TEXT DEFAULT 'en',
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    analysis_version TEXT DEFAULT '1.0',
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE,
    UNIQUE(review_id)
);

CREATE INDEX idx_review_sentiment_analysis_review_id ON review_sentiment_analysis(review_id);
CREATE INDEX idx_review_sentiment_analysis_overall_sentiment ON review_sentiment_analysis(overall_sentiment);
CREATE INDEX idx_review_sentiment_analysis_confidence_score ON review_sentiment_analysis(confidence_score);

-- Review Quality Scores table
CREATE TABLE IF NOT EXISTS review_quality_scores (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    helpfulness_score REAL DEFAULT 0, -- Based on helpfulness votes
    completeness_score REAL DEFAULT 0, -- Based on filled fields
    authenticity_score REAL DEFAULT 0, -- Based on various factors
    readability_score REAL DEFAULT 0, -- Based on text analysis
    overall_quality_score REAL DEFAULT 0, -- Weighted average
    factors TEXT DEFAULT '{}', -- JSON object with scoring factors
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE,
    UNIQUE(review_id)
);

CREATE INDEX idx_review_quality_scores_review_id ON review_quality_scores(review_id);
CREATE INDEX idx_review_quality_scores_overall_quality ON review_quality_scores(overall_quality_score);
CREATE INDEX idx_review_quality_scores_helpfulness ON review_quality_scores(helpfulness_score);

-- Review Recommendation Engine table
CREATE TABLE IF NOT EXISTS review_recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    review_id TEXT, -- If recommendation is based on a specific review
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('similar_taste', 'popular_with_similar_users', 'trending', 'new_from_creator', 'complementary')),
    score REAL NOT NULL, -- 0.0 to 1.0
    reasons TEXT DEFAULT '[]', -- JSON array of reasons
    metadata TEXT DEFAULT '{}', -- JSON object with additional data
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES marketplace_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES template_reviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_recommendations_user_id ON review_recommendations(user_id);
CREATE INDEX idx_review_recommendations_template_id ON review_recommendations(template_id);
CREATE INDEX idx_review_recommendations_score ON review_recommendations(score);
CREATE INDEX idx_review_recommendations_generated_at ON review_recommendations(generated_at);
CREATE INDEX idx_review_recommendations_expires_at ON review_recommendations(expires_at);

-- Triggers for automatic updates

-- Trigger to update helpfulness vote counts on template_reviews
CREATE TRIGGER IF NOT EXISTS update_review_helpfulness_counts
AFTER INSERT ON review_helpfulness_votes
BEGIN
    UPDATE template_reviews 
    SET 
        helpful_votes = (
            SELECT COUNT(*) 
            FROM review_helpfulness_votes 
            WHERE review_id = NEW.review_id AND vote = 'helpful'
        ),
        not_helpful_votes = (
            SELECT COUNT(*) 
            FROM review_helpfulness_votes 
            WHERE review_id = NEW.review_id AND vote = 'not_helpful'
        ),
        updated_at = datetime('now')
    WHERE id = NEW.review_id;
END;

-- Trigger to update helpfulness vote counts on vote update
CREATE TRIGGER IF NOT EXISTS update_review_helpfulness_counts_on_update
AFTER UPDATE ON review_helpfulness_votes
BEGIN
    UPDATE template_reviews 
    SET 
        helpful_votes = (
            SELECT COUNT(*) 
            FROM review_helpfulness_votes 
            WHERE review_id = NEW.review_id AND vote = 'helpful'
        ),
        not_helpful_votes = (
            SELECT COUNT(*) 
            FROM review_helpfulness_votes 
            WHERE review_id = NEW.review_id AND vote = 'not_helpful'
        ),
        updated_at = datetime('now')
    WHERE id = NEW.review_id;
END;

-- Trigger to update flag counts on template_reviews
CREATE TRIGGER IF NOT EXISTS update_review_flag_counts
AFTER INSERT ON review_flags
BEGIN
    UPDATE template_reviews 
    SET 
        flag_count = (
            SELECT COUNT(*) 
            FROM review_flags 
            WHERE review_id = NEW.review_id AND status = 'pending'
        ),
        updated_at = datetime('now')
    WHERE id = NEW.review_id;
    
    -- Auto-flag review if it reaches threshold
    UPDATE template_reviews 
    SET status = 'flagged', updated_at = datetime('now')
    WHERE id = NEW.review_id 
    AND flag_count >= 3 
    AND status = 'approved';
END;

-- Trigger to update template rating statistics when reviews change
CREATE TRIGGER IF NOT EXISTS update_template_rating_stats
AFTER INSERT ON template_reviews
WHEN NEW.status = 'approved'
BEGIN
    UPDATE marketplace_templates 
    SET stats = json_set(
        COALESCE(stats, '{}'),
        '$.total_reviews', (
            SELECT COUNT(*) 
            FROM template_reviews 
            WHERE template_id = NEW.template_id AND status = 'approved'
        ),
        '$.average_rating', (
            SELECT ROUND(AVG(stars), 2) 
            FROM template_reviews 
            WHERE template_id = NEW.template_id AND status = 'approved'
        ),
        '$.rating_distribution', json_object(
            'five_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 5),
            'four_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 4),
            'three_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 3),
            'two_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 2),
            'one_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 1)
        )
    )
    WHERE id = NEW.template_id;
END;

-- Trigger to update template rating statistics when reviews are updated
CREATE TRIGGER IF NOT EXISTS update_template_rating_stats_on_update
AFTER UPDATE ON template_reviews
WHEN NEW.status = 'approved' OR OLD.status = 'approved'
BEGIN
    UPDATE marketplace_templates 
    SET stats = json_set(
        COALESCE(stats, '{}'),
        '$.total_reviews', (
            SELECT COUNT(*) 
            FROM template_reviews 
            WHERE template_id = NEW.template_id AND status = 'approved'
        ),
        '$.average_rating', (
            SELECT ROUND(AVG(stars), 2) 
            FROM template_reviews 
            WHERE template_id = NEW.template_id AND status = 'approved'
        ),
        '$.rating_distribution', json_object(
            'five_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 5),
            'four_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 4),
            'three_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 3),
            'two_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 2),
            'one_star', (SELECT COUNT(*) FROM template_reviews WHERE template_id = NEW.template_id AND status = 'approved' AND stars = 1)
        )
    )
    WHERE id = NEW.template_id;
END;

-- Trigger to add new reviews to moderation queue
CREATE TRIGGER IF NOT EXISTS add_to_moderation_queue
AFTER INSERT ON template_reviews
WHEN NEW.status = 'pending'
BEGIN
    INSERT INTO review_moderation_queue (
        id, review_id, priority, reason, status, created_at
    ) VALUES (
        hex(randomblob(16)),
        NEW.id,
        CASE 
            WHEN NEW.verified_purchase = FALSE THEN 'high'
            WHEN NEW.comment IS NOT NULL AND length(NEW.comment) > 500 THEN 'normal'
            ELSE 'low'
        END,
        'New review submitted',
        'pending',
        datetime('now')
    );
END;

-- Trigger to automatically calculate quality scores
CREATE TRIGGER IF NOT EXISTS calculate_review_quality_score
AFTER INSERT ON template_reviews
WHEN NEW.status = 'approved'
BEGIN
    INSERT INTO review_quality_scores (
        id, review_id, helpfulness_score, completeness_score, 
        authenticity_score, readability_score, overall_quality_score, calculated_at
    ) VALUES (
        hex(randomblob(16)),
        NEW.id,
        0.5, -- Default helpfulness score
        CASE 
            WHEN NEW.comment IS NOT NULL AND NEW.title IS NOT NULL AND NEW.use_case IS NOT NULL THEN 1.0
            WHEN NEW.comment IS NOT NULL AND NEW.title IS NOT NULL THEN 0.8
            WHEN NEW.comment IS NOT NULL THEN 0.6
            ELSE 0.3
        END,
        CASE WHEN NEW.verified_purchase = TRUE THEN 1.0 ELSE 0.5 END,
        CASE 
            WHEN NEW.comment IS NOT NULL AND length(NEW.comment) > 100 THEN 0.8
            WHEN NEW.comment IS NOT NULL AND length(NEW.comment) > 50 THEN 0.6
            WHEN NEW.comment IS NOT NULL THEN 0.4
            ELSE 0.2
        END,
        0.6, -- Default overall score
        datetime('now')
    );
END;