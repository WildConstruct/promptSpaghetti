-- Epic 16 Story 16.3 - Community & Social Features Database Schema
-- Complete community platform with posts, discussions, events, and social interactions

-- Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images JSONB,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'template_showcase', 'tutorial', 'question', 'announcement')),
    tags JSONB,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    shares_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Discussions table
CREATE TABLE IF NOT EXISTS community_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    tags JSONB,
    replies_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_solved BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Events table
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'community_call' CHECK (type IN ('webinar', 'workshop', 'community_call', 'contest', 'launch')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    attendees_count INTEGER NOT NULL DEFAULT 0,
    max_attendees INTEGER,
    tags JSONB,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    registration_required BOOLEAN NOT NULL DEFAULT true,
    external_url VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes tracking
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Post Bookmarks tracking
CREATE TABLE IF NOT EXISTS post_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Discussion Replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES community_discussions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    is_solution BOOLEAN NOT NULL DEFAULT false,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Attendees tracking
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- User Follow relationships
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Post Comments table (integrates with existing comment system)
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Activity Feed table (for tracking all community activities)
CREATE TABLE IF NOT EXISTS community_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_community_posts_author_created ON community_posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type_created ON community_posts(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON community_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_template ON community_posts(template_id) WHERE template_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_discussions_category ON community_discussions(category, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_discussions_author ON community_discussions(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_discussions_pinned ON community_discussions(is_pinned) WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_community_events_start_date ON community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_community_events_organizer ON community_events(organizer_id, start_date);
CREATE INDEX IF NOT EXISTS idx_community_events_type ON community_events(type, start_date);

CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post ON post_bookmarks(post_id);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id, created_at);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author ON discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_reply_id) WHERE parent_reply_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_author ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_activity_user ON community_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_activity_type ON community_activity(activity_type, created_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_content_fts ON community_posts USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_community_discussions_title_fts ON community_discussions USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_community_events_title_fts ON community_events USING gin(to_tsvector('english', title || ' ' || description));

-- Triggers for maintaining counts and activity tracking

-- Update post counts when likes change
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (NEW.user_id, 'like', 'post', NEW.post_id, '{}');
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (OLD.user_id, 'unlike', 'post', OLD.post_id, '{}');
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update discussion reply counts
CREATE OR REPLACE FUNCTION update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_discussions 
        SET replies_count = replies_count + 1, last_activity_at = NOW() 
        WHERE id = NEW.discussion_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (NEW.author_id, 'reply', 'discussion', NEW.discussion_id, jsonb_build_object('reply_id', NEW.id));
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_discussions 
        SET replies_count = replies_count - 1 
        WHERE id = OLD.discussion_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_discussion_reply_count ON discussion_replies;
CREATE TRIGGER trigger_update_discussion_reply_count
    AFTER INSERT OR DELETE ON discussion_replies
    FOR EACH ROW EXECUTE FUNCTION update_discussion_reply_count();

-- Update event attendee counts
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_events SET attendees_count = attendees_count + 1 WHERE id = NEW.event_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (NEW.user_id, 'attend', 'event', NEW.event_id, jsonb_build_object('status', NEW.status));
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_events SET attendees_count = attendees_count - 1 WHERE id = OLD.event_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (OLD.user_id, 'unattend', 'event', OLD.event_id, '{}');
    ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (NEW.user_id, 'status_change', 'event', NEW.event_id, jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_event_attendees_count ON event_attendees;
CREATE TRIGGER trigger_update_event_attendees_count
    AFTER INSERT OR DELETE OR UPDATE ON event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_event_attendees_count();

-- Update user follow counts
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (NEW.follower_id, 'follow', 'user', NEW.following_id, '{}');
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (OLD.follower_id, 'unfollow', 'user', OLD.following_id, '{}');
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_follow_counts ON user_follows;
CREATE TRIGGER trigger_update_user_follow_counts
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follow_counts();

-- Track new post creation activity
CREATE OR REPLACE FUNCTION track_post_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (NEW.author_id, 'create', 'post', NEW.id, jsonb_build_object('type', NEW.type));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_track_post_creation ON community_posts;
CREATE TRIGGER trigger_track_post_creation
    AFTER INSERT ON community_posts
    FOR EACH ROW EXECUTE FUNCTION track_post_creation();

-- Track new discussion creation activity
CREATE OR REPLACE FUNCTION track_discussion_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (NEW.author_id, 'create', 'discussion', NEW.id, jsonb_build_object('category', NEW.category));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_track_discussion_creation ON community_discussions;
CREATE TRIGGER trigger_track_discussion_creation
    AFTER INSERT ON community_discussions
    FOR EACH ROW EXECUTE FUNCTION track_discussion_creation();

-- Track new event creation activity
CREATE OR REPLACE FUNCTION track_event_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_activity (user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (NEW.organizer_id, 'create', 'event', NEW.id, jsonb_build_object('type', NEW.type));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_track_event_creation ON community_events;
CREATE TRIGGER trigger_track_event_creation
    AFTER INSERT ON community_events
    FOR EACH ROW EXECUTE FUNCTION track_event_creation();

-- Views for analytics and reporting

-- Community engagement summary view
CREATE OR REPLACE VIEW community_engagement_summary AS
SELECT 
    u.id as user_id,
    u.display_name,
    u.creator_tier,
    COUNT(DISTINCT p.id) as posts_count,
    COUNT(DISTINCT d.id) as discussions_count,
    COUNT(DISTINCT e.id) as events_organized,
    COUNT(DISTINCT pl.id) as likes_given,
    COUNT(DISTINCT dr.id) as replies_made,
    COUNT(DISTINCT ea.id) as events_attended,
    u.followers_count,
    u.following_count
FROM users u
LEFT JOIN community_posts p ON u.id = p.author_id
LEFT JOIN community_discussions d ON u.id = d.author_id  
LEFT JOIN community_events e ON u.id = e.organizer_id
LEFT JOIN post_likes pl ON u.id = pl.user_id
LEFT JOIN discussion_replies dr ON u.id = dr.author_id
LEFT JOIN event_attendees ea ON u.id = ea.user_id
GROUP BY u.id, u.display_name, u.creator_tier, u.followers_count, u.following_count;

-- Trending content view (last 7 days)
CREATE OR REPLACE VIEW trending_content AS
SELECT 
    'post' as content_type,
    p.id,
    p.content as title,
    p.author_id,
    u.display_name as author_name,
    p.likes_count,
    p.comments_count,
    p.created_at,
    (p.likes_count * 2 + p.comments_count * 3 + p.shares_count * 5) as engagement_score
FROM community_posts p
JOIN users u ON p.author_id = u.id
WHERE p.created_at > NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'discussion' as content_type,
    d.id,
    d.title,
    d.author_id,
    u.display_name as author_name,
    0 as likes_count,
    d.replies_count as comments_count,
    d.created_at,
    (d.views_count + d.replies_count * 3) as engagement_score
FROM community_discussions d
JOIN users u ON d.author_id = u.id
WHERE d.created_at > NOW() - INTERVAL '7 days'

ORDER BY engagement_score DESC;

-- Community health metrics view
CREATE OR REPLACE VIEW community_health_metrics AS
SELECT 
    'posts' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM community_posts

UNION ALL

SELECT 
    'discussions' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM community_discussions

UNION ALL

SELECT 
    'events' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM community_events

UNION ALL

SELECT 
    'users_active' as metric_type,
    COUNT(DISTINCT user_id) as total_count,
    COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
    COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM community_activity;