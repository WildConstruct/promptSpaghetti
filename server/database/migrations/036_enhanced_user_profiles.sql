-- Enhanced User Profiles System Migration
-- Extends existing user profiles with comprehensive profile management,
-- social features, privacy controls, and analytics

-- Enhanced user_profiles table (extends existing)
-- Add new columns to existing user_profiles table
DO $$ 
BEGIN
    -- Professional information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'title') THEN
        ALTER TABLE user_profiles ADD COLUMN title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company') THEN
        ALTER TABLE user_profiles ADD COLUMN company VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'department') THEN
        ALTER TABLE user_profiles ADD COLUMN department VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'location') THEN
        ALTER TABLE user_profiles ADD COLUMN location VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'website') THEN
        ALTER TABLE user_profiles ADD COLUMN website VARCHAR(500);
    END IF;
    
    -- Social links
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'linkedin_url') THEN
        ALTER TABLE user_profiles ADD COLUMN linkedin_url VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'twitter_url') THEN
        ALTER TABLE user_profiles ADD COLUMN twitter_url VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'github_url') THEN
        ALTER TABLE user_profiles ADD COLUMN github_url VARCHAR(500);
    END IF;
    
    -- Additional profile images
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'cover_image_url') THEN
        ALTER TABLE user_profiles ADD COLUMN cover_image_url VARCHAR(500);
    END IF;
    
    -- Enhanced preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'date_format') THEN
        ALTER TABLE user_profiles ADD COLUMN date_format VARCHAR(20) DEFAULT 'MM/dd/yyyy';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'time_format') THEN
        ALTER TABLE user_profiles ADD COLUMN time_format VARCHAR(5) DEFAULT '12h' CHECK (time_format IN ('12h', '24h'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'theme') THEN
        ALTER TABLE user_profiles ADD COLUMN theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'language') THEN
        ALTER TABLE user_profiles ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;
    
    -- Professional tags and interests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'skill_tags') THEN
        ALTER TABLE user_profiles ADD COLUMN skill_tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'interests') THEN
        ALTER TABLE user_profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'experience') THEN
        ALTER TABLE user_profiles ADD COLUMN experience VARCHAR(20) DEFAULT 'beginner' CHECK (experience IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'industry') THEN
        ALTER TABLE user_profiles ADD COLUMN industry VARCHAR(100);
    END IF;
    
    -- Profile completion tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'completion_score') THEN
        ALTER TABLE user_profiles ADD COLUMN completion_score INTEGER DEFAULT 10 CHECK (completion_score >= 0 AND completion_score <= 100);
    END IF;
    
    -- Profile visibility and privacy
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'visibility') THEN
        ALTER TABLE user_profiles ADD COLUMN visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private'));
    END IF;
    
    -- Profile analytics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'view_count') THEN
        ALTER TABLE user_profiles ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_viewed_at') THEN
        ALTER TABLE user_profiles ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- User connections table for social features
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked', 'rejected')),
    connection_type VARCHAR(20) DEFAULT 'follow' CHECK (connection_type IN ('follow', 'collaborate', 'teammate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent self-connections and duplicates
    CHECK (follower_id != following_id),
    UNIQUE(follower_id, following_id)
);

-- Profile views tracking table
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    session_id UUID,
    view_duration INTEGER, -- seconds spent viewing
    is_unique_view BOOLEAN DEFAULT TRUE
);

-- Profile completion milestones table
CREATE TABLE IF NOT EXISTS profile_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_percentage INTEGER NOT NULL,
    reward_granted BOOLEAN DEFAULT FALSE,
    
    -- Prevent duplicate milestones
    UNIQUE(user_id, milestone_type)
);

-- Profile verification table
CREATE TABLE IF NOT EXISTS profile_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('email', 'phone', 'identity', 'professional', 'domain')),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verification_data JSONB,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile badges and achievements table
CREATE TABLE IF NOT EXISTS profile_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    badge_description TEXT,
    badge_icon_url VARCHAR(500),
    badge_color VARCHAR(7), -- Hex color code
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requirements_met JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);

-- Profile activity summary table (for performance)
CREATE TABLE IF NOT EXISTS profile_activity_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    profile_views INTEGER DEFAULT 0,
    unique_profile_views INTEGER DEFAULT 0,
    connections_gained INTEGER DEFAULT 0,
    connections_lost INTEGER DEFAULT 0,
    profile_updates INTEGER DEFAULT 0,
    skills_added INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One summary per user per day
    UNIQUE(user_id, summary_date)
);

-- Skill taxonomy table for standardized skills
CREATE TABLE IF NOT EXISTS skill_taxonomy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name VARCHAR(255) UNIQUE NOT NULL,
    skill_category VARCHAR(100),
    skill_subcategory VARCHAR(100),
    description TEXT,
    synonyms TEXT[],
    popularity_score INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skill endorsements table
CREATE TABLE IF NOT EXISTS user_skill_endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorsee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    endorsement_strength INTEGER DEFAULT 3 CHECK (endorsement_strength >= 1 AND endorsement_strength <= 5),
    endorsement_note TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-endorsements and duplicates
    CHECK (endorsee_id != endorser_id),
    UNIQUE(endorsee_id, endorser_id, skill_name)
);

-- Profile search index table for better search performance
CREATE TABLE IF NOT EXISTS profile_search_index (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    search_vector tsvector,
    skills_vector tsvector,
    location_vector tsvector,
    company_vector tsvector,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal query performance

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_completion_score 
ON user_profiles(completion_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_visibility 
ON user_profiles(visibility);

CREATE INDEX IF NOT EXISTS idx_user_profiles_location 
ON user_profiles USING GIN(to_tsvector('english', COALESCE(location, '')));

CREATE INDEX IF NOT EXISTS idx_user_profiles_company 
ON user_profiles USING GIN(to_tsvector('english', COALESCE(company, '')));

CREATE INDEX IF NOT EXISTS idx_user_profiles_skills 
ON user_profiles USING GIN(skill_tags);

CREATE INDEX IF NOT EXISTS idx_user_profiles_interests 
ON user_profiles USING GIN(interests);

CREATE INDEX IF NOT EXISTS idx_user_profiles_industry 
ON user_profiles(industry);

CREATE INDEX IF NOT EXISTS idx_user_profiles_experience 
ON user_profiles(experience);

CREATE INDEX IF NOT EXISTS idx_user_profiles_view_count 
ON user_profiles(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at 
ON user_profiles(updated_at DESC);

-- User connections indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_follower 
ON user_connections(follower_id, status);

CREATE INDEX IF NOT EXISTS idx_user_connections_following 
ON user_connections(following_id, status);

CREATE INDEX IF NOT EXISTS idx_user_connections_status 
ON user_connections(status);

CREATE INDEX IF NOT EXISTS idx_user_connections_type 
ON user_connections(connection_type);

CREATE INDEX IF NOT EXISTS idx_user_connections_created_at 
ON user_connections(created_at DESC);

-- Profile views indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_user 
ON profile_views(profile_user_id, view_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer 
ON profile_views(viewer_id, view_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_timestamp 
ON profile_views(view_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_session 
ON profile_views(session_id);

-- Profile milestones indexes
CREATE INDEX IF NOT EXISTS idx_profile_milestones_user 
ON profile_milestones(user_id, achieved_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_milestones_type 
ON profile_milestones(milestone_type);

-- Profile verifications indexes
CREATE INDEX IF NOT EXISTS idx_profile_verifications_user 
ON profile_verifications(user_id, verification_type);

CREATE INDEX IF NOT EXISTS idx_profile_verifications_status 
ON profile_verifications(verification_status);

CREATE INDEX IF NOT EXISTS idx_profile_verifications_expires 
ON profile_verifications(expires_at);

-- Profile badges indexes
CREATE INDEX IF NOT EXISTS idx_profile_badges_user 
ON profile_badges(user_id, display_order);

CREATE INDEX IF NOT EXISTS idx_profile_badges_type 
ON profile_badges(badge_type);

CREATE INDEX IF NOT EXISTS idx_profile_badges_visible 
ON profile_badges(user_id, is_visible);

-- Activity summary indexes
CREATE INDEX IF NOT EXISTS idx_profile_activity_summary_user_date 
ON profile_activity_summary(user_id, summary_date DESC);

-- Skill taxonomy indexes
CREATE INDEX IF NOT EXISTS idx_skill_taxonomy_name 
ON skill_taxonomy(skill_name);

CREATE INDEX IF NOT EXISTS idx_skill_taxonomy_category 
ON skill_taxonomy(skill_category, skill_subcategory);

CREATE INDEX IF NOT EXISTS idx_skill_taxonomy_popularity 
ON skill_taxonomy(popularity_score DESC);

-- Skill endorsements indexes
CREATE INDEX IF NOT EXISTS idx_user_skill_endorsements_endorsee 
ON user_skill_endorsements(endorsee_id, skill_name);

CREATE INDEX IF NOT EXISTS idx_user_skill_endorsements_endorser 
ON user_skill_endorsements(endorser_id);

CREATE INDEX IF NOT EXISTS idx_user_skill_endorsements_skill 
ON user_skill_endorsements(skill_name);

-- Search index
CREATE INDEX IF NOT EXISTS idx_profile_search_vector 
ON profile_search_index USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_profile_skills_vector 
ON profile_search_index USING GIN(skills_vector);

-- Views for common profile queries

-- Enhanced user profiles view with connection counts
CREATE OR REPLACE VIEW enhanced_user_profiles AS
SELECT 
    p.*,
    u.email,
    u.created_at as account_created_at,
    u.last_login_at,
    u.status as account_status,
    COALESCE(followers.count, 0) as followers_count,
    COALESCE(following.count, 0) as following_count,
    COALESCE(views.total_views, 0) as total_profile_views,
    COALESCE(views.unique_views, 0) as unique_profile_views,
    COALESCE(badges.badge_count, 0) as badge_count,
    COALESCE(verifications.verification_count, 0) as verification_count,
    CASE 
        WHEN p.completion_score >= 90 THEN 'excellent'
        WHEN p.completion_score >= 70 THEN 'good'
        WHEN p.completion_score >= 50 THEN 'fair'
        ELSE 'needs_improvement'
    END as completion_level
FROM user_profiles p
JOIN users u ON p.user_id = u.id
LEFT JOIN (
    SELECT following_id, COUNT(*) as count
    FROM user_connections 
    WHERE status = 'accepted'
    GROUP BY following_id
) followers ON p.user_id = followers.following_id
LEFT JOIN (
    SELECT follower_id, COUNT(*) as count
    FROM user_connections 
    WHERE status = 'accepted'
    GROUP BY follower_id
) following ON p.user_id = following.follower_id
LEFT JOIN (
    SELECT 
        profile_user_id,
        COUNT(*) as total_views,
        COUNT(DISTINCT viewer_id) as unique_views
    FROM profile_views
    GROUP BY profile_user_id
) views ON p.user_id = views.profile_user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as badge_count
    FROM profile_badges
    WHERE is_visible = true
    GROUP BY user_id
) badges ON p.user_id = badges.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as verification_count
    FROM profile_verifications
    WHERE verification_status = 'verified'
    GROUP BY user_id
) verifications ON p.user_id = verifications.user_id;

-- Profile analytics view
CREATE OR REPLACE VIEW profile_analytics AS
SELECT 
    p.user_id,
    p.completion_score,
    p.view_count,
    p.last_viewed_at,
    COALESCE(followers.count, 0) as followers_count,
    COALESCE(following.count, 0) as following_count,
    COALESCE(recent_views.views_last_7_days, 0) as views_last_7_days,
    COALESCE(recent_views.views_last_30_days, 0) as views_last_30_days,
    array_length(p.skill_tags, 1) as skill_count,
    array_length(p.interests, 1) as interest_count,
    CASE 
        WHEN u.last_login_at > NOW() - INTERVAL '1 day' THEN 'active'
        WHEN u.last_login_at > NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN u.last_login_at > NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_status,
    EXTRACT(DAYS FROM NOW() - u.created_at) as account_age_days,
    EXTRACT(DAYS FROM NOW() - p.updated_at) as days_since_profile_update
FROM user_profiles p
JOIN users u ON p.user_id = u.id
LEFT JOIN (
    SELECT following_id, COUNT(*) as count
    FROM user_connections 
    WHERE status = 'accepted'
    GROUP BY following_id
) followers ON p.user_id = followers.following_id
LEFT JOIN (
    SELECT follower_id, COUNT(*) as count
    FROM user_connections 
    WHERE status = 'accepted'
    GROUP BY follower_id
) following ON p.user_id = following.follower_id
LEFT JOIN (
    SELECT 
        profile_user_id,
        COUNT(CASE WHEN view_timestamp > NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
        COUNT(CASE WHEN view_timestamp > NOW() - INTERVAL '30 days' THEN 1 END) as views_last_30_days
    FROM profile_views
    GROUP BY profile_user_id
) recent_views ON p.user_id = recent_views.profile_user_id;

-- Popular skills view
CREATE OR REPLACE VIEW popular_skills AS
SELECT 
    unnest(skill_tags) as skill_name,
    COUNT(*) as user_count,
    ROUND(AVG(completion_score), 2) as avg_completion_score,
    COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_users,
    array_agg(DISTINCT industry) FILTER (WHERE industry IS NOT NULL) as industries,
    array_agg(DISTINCT experience) as experience_levels
FROM user_profiles
WHERE array_length(skill_tags, 1) > 0
GROUP BY skill_name
HAVING COUNT(*) >= 2
ORDER BY user_count DESC, skill_name;

-- Functions for profile management

-- Function to update profile completion score
CREATE OR REPLACE FUNCTION update_profile_completion_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 10; -- Base score
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM user_profiles WHERE user_id = p_user_id;
    
    IF profile_record IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Basic info (40 points total)
    IF profile_record.display_name IS NOT NULL AND LENGTH(profile_record.display_name) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.first_name IS NOT NULL AND profile_record.last_name IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 20 THEN
        score := score + 20;
    END IF;
    
    -- Professional info (30 points total)
    IF profile_record.title IS NOT NULL AND LENGTH(profile_record.title) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.company IS NOT NULL AND LENGTH(profile_record.company) > 0 THEN
        score := score + 10;
    END IF;
    
    IF array_length(profile_record.skill_tags, 1) > 0 THEN
        score := score + 10;
    END IF;
    
    -- Contact/Social (20 points total)
    IF profile_record.location IS NOT NULL AND LENGTH(profile_record.location) > 0 THEN
        score := score + 5;
    END IF;
    
    IF profile_record.website IS NOT NULL AND LENGTH(profile_record.website) > 0 THEN
        score := score + 5;
    END IF;
    
    IF profile_record.linkedin_url IS NOT NULL OR 
       profile_record.twitter_url IS NOT NULL OR 
       profile_record.github_url IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Avatar and customization (10 points total)
    IF profile_record.avatar_url IS NOT NULL AND LENGTH(profile_record.avatar_url) > 0 THEN
        score := score + 10;
    END IF;
    
    -- Ensure score doesn't exceed 100
    score := LEAST(score, 100);
    
    -- Update the profile with new completion score
    UPDATE user_profiles 
    SET completion_score = score, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile search index
CREATE OR REPLACE FUNCTION update_profile_search_index(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    profile_record RECORD;
    search_text TEXT := '';
    skills_text TEXT := '';
    location_text TEXT := '';
    company_text TEXT := '';
BEGIN
    SELECT p.*, u.email 
    INTO profile_record 
    FROM user_profiles p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = p_user_id;
    
    IF profile_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Build search text
    search_text := COALESCE(profile_record.display_name, '') || ' ' ||
                   COALESCE(profile_record.first_name, '') || ' ' ||
                   COALESCE(profile_record.last_name, '') || ' ' ||
                   COALESCE(profile_record.bio, '') || ' ' ||
                   COALESCE(profile_record.title, '') || ' ' ||
                   COALESCE(profile_record.company, '') || ' ' ||
                   COALESCE(profile_record.department, '') || ' ' ||
                   COALESCE(profile_record.industry, '');
    
    -- Build skills text
    IF array_length(profile_record.skill_tags, 1) > 0 THEN
        skills_text := array_to_string(profile_record.skill_tags, ' ');
    END IF;
    
    -- Build location and company text
    location_text := COALESCE(profile_record.location, '');
    company_text := COALESCE(profile_record.company, '');
    
    -- Insert or update search index
    INSERT INTO profile_search_index (
        user_id, search_vector, skills_vector, location_vector, company_vector, last_updated
    ) VALUES (
        p_user_id,
        to_tsvector('english', search_text),
        to_tsvector('english', skills_text),
        to_tsvector('english', location_text),
        to_tsvector('english', company_text),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        search_vector = to_tsvector('english', search_text),
        skills_vector = to_tsvector('english', skills_text),
        location_vector = to_tsvector('english', location_text),
        company_vector = to_tsvector('english', company_text),
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to record profile view
CREATE OR REPLACE FUNCTION record_profile_view(
    p_profile_user_id UUID,
    p_viewer_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert profile view record
    INSERT INTO profile_views (
        profile_user_id, viewer_id, ip_address, user_agent, session_id
    ) VALUES (
        p_profile_user_id, p_viewer_id, p_ip_address, p_user_agent, p_session_id
    );
    
    -- Update profile view count (increment by 1)
    UPDATE user_profiles 
    SET view_count = view_count + 1, last_viewed_at = NOW()
    WHERE user_id = p_profile_user_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic maintenance

-- Trigger to update completion score when profile is updated
CREATE OR REPLACE FUNCTION trigger_update_completion_score()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_profile_completion_score(NEW.user_id);
    PERFORM update_profile_search_index(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_completion_update_trigger
    AFTER INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_completion_score();

-- Trigger to update connection counts when connections change
CREATE OR REPLACE FUNCTION trigger_update_connection_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- This would update cached connection counts if needed
    -- For now, we calculate them dynamically in views
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER connection_count_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_connections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_connection_counts();

-- Insert default skills into skill taxonomy
INSERT INTO skill_taxonomy (skill_name, skill_category, skill_subcategory, description, popularity_score, is_verified) 
VALUES 
    ('JavaScript', 'Programming', 'Frontend', 'Programming language for web development', 100, true),
    ('Python', 'Programming', 'Backend', 'Versatile programming language', 95, true),
    ('React', 'Programming', 'Frontend', 'JavaScript library for building user interfaces', 90, true),
    ('Node.js', 'Programming', 'Backend', 'JavaScript runtime for server-side development', 85, true),
    ('TypeScript', 'Programming', 'Frontend', 'Typed superset of JavaScript', 80, true),
    ('SQL', 'Database', 'Query Language', 'Structured Query Language for databases', 75, true),
    ('PostgreSQL', 'Database', 'RDBMS', 'Advanced open-source relational database', 70, true),
    ('Docker', 'DevOps', 'Containerization', 'Platform for developing and running applications in containers', 65, true),
    ('Kubernetes', 'DevOps', 'Orchestration', 'Container orchestration platform', 60, true),
    ('AWS', 'Cloud', 'Infrastructure', 'Amazon Web Services cloud platform', 85, true),
    ('Machine Learning', 'AI/ML', 'General', 'Algorithms and statistical models for computer systems', 70, true),
    ('Data Analysis', 'Data Science', 'Analysis', 'Techniques for analyzing and interpreting data', 65, true),
    ('Project Management', 'Management', 'Process', 'Planning and executing projects effectively', 60, true),
    ('UI/UX Design', 'Design', 'User Experience', 'User interface and experience design', 55, true),
    ('Agile', 'Methodology', 'Development', 'Iterative approach to project management and software development', 50, true)
ON CONFLICT (skill_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE user_connections IS 'Social connections between users (followers, collaborators, teammates)';
COMMENT ON TABLE profile_views IS 'Tracking of profile views for analytics and privacy';
COMMENT ON TABLE profile_milestones IS 'Achievement milestones for profile completion and engagement';
COMMENT ON TABLE profile_verifications IS 'Verification status for different aspects of user profiles';
COMMENT ON TABLE profile_badges IS 'Badges and achievements displayed on user profiles';
COMMENT ON TABLE profile_activity_summary IS 'Daily summary of profile-related activities for performance';
COMMENT ON TABLE skill_taxonomy IS 'Standardized skill names and categories for consistency';
COMMENT ON TABLE user_skill_endorsements IS 'Peer endorsements of user skills';
COMMENT ON TABLE profile_search_index IS 'Full-text search index for user profiles';

COMMENT ON VIEW enhanced_user_profiles IS 'Comprehensive user profile data with social metrics';
COMMENT ON VIEW profile_analytics IS 'Profile analytics and engagement metrics';
COMMENT ON VIEW popular_skills IS 'Most popular skills across the platform with statistics';

COMMENT ON FUNCTION update_profile_completion_score(UUID) IS 'Calculates and updates profile completion percentage';
COMMENT ON FUNCTION update_profile_search_index(UUID) IS 'Updates full-text search index for user profile';
COMMENT ON FUNCTION record_profile_view(UUID, UUID, INET, TEXT, UUID) IS 'Records a profile view for analytics';