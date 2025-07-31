// Epic 16 Story 16.3 - Community Hub & Social Features Platform
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/environment';
}
interface User {
  id: string;,
  display_name: string;
  avatar_url?: string;
  creator_tier: 'bronze' | 'silver' | 'gold' | 'platinum';,
  verification_status: 'verified' | 'unverified';
  followers_count: number;,
  following_count: number;
  templates_count: number;,
  total_revenue: number;
  interface Post {
  id: string;,
  author: User;
  content: string;
  images?: string;
  template_id?: string;
  template_preview?: {
  id: string;,
  title: string;
  description: string;,
  price_cents: number;
}
};
  type: 'text' | 'template_showcase' | 'tutorial' | 'question' | 'announcement';,
  likes_count: number;
  comments_count: number;,
  shares_count: number;
  is_liked: boolean;,
  is_bookmarked: boolean;
  created_at: string;,
  updated_at: string;
  tags: string;
}
interface Discussion {
  id: string;,
  title: string;
  content: string;,
  author: User;
  category: string;,
  tags: string;
  replies_count: number;,
  views_count: number;
  last_activity_at: string;,
  is_pinned: boolean;
  is_solved: boolean;,
  created_at: string;
}
interface Event {
  id: string;,
  title: string;
  description: string;,
  type: 'webinar' | 'workshop' | 'community_call' | 'contest' | 'launch';
  start_date: string;,
  end_date: string;
  attendees_count: number;
  max_attendees?: number;
  is_attending: boolean;,
  organizer: User;
  tags: string;

export const [discussions, setDiscussions] = useState<Discussion>([]);
  const [events, setEvents] = useState<Event>([]);
  const [topCreators, setTopCreators] = useState<User>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const navigate = useNavigate();
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
}
      ...(token && { 'Authorization': `Bearer ${token}` })}
    };
  };
  const fetchCommunityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsRes, discussionsRes, eventsRes, creatorsRes] = await Promise.all([)
        fetch(`${API_URL}/api/marketplace/community/posts?filter=${feedFilter}`, {)}
  },
  headers: getAuthHeaders();
  }),
        fetch(`${API_URL}/api/marketplace/community/discussions`, {)}
  },
  headers: getAuthHeaders();
  }),
        fetch(`${API_URL}/api/marketplace/community/events`, {)}
  },
  headers: getAuthHeaders();
  }),
        fetch(`${API_URL}/api/marketplace/community/creators`, {)}
  },
  headers: getAuthHeaders();
  }
      ]);
      if (!postsRes.ok || !discussionsRes.ok || !eventsRes.ok || !creatorsRes.ok) {
        throw new Error('Failed to fetch community data');
      const [postsData, discussionsData, eventsData, creatorsData] = await Promise.all([)
        postsRes.json(),
        discussionsRes.json(),
        eventsRes.json(),
        creatorsRes.json()
      ]);
      setPosts(postsData.posts || []);
      setDiscussions(discussionsData.discussions || []);
      setEvents(eventsData.events || []);
      setTopCreators(creatorsData.creators || []);
      // Set following status for creators
      const followingSet = new Set<string>();
      creatorsData.creators?.forEach((creator: { id: string; is_following: boolean }) => {
        if (creator.is_following) {
          followingSet.add(creator.id);
      });
      setFollowing(followingSet);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load community data');
} finally {
      setLoading(false);
  }, [feedFilter]);
  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/community/posts/${postId}/like`, {)}
  },
  method: 'POST',
        headers: getAuthHeaders();
  });
      if (response.ok) {
  setPosts(prev => prev.map(post => )
  post.id === postId
  ? {
  ...post,
  is_liked: !post.is_liked,
  likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
  : post));
} catch (error) {
  console.error('Failed to like post:', error);
}, []);
  const handleFollowCreator = useCallback(async (creatorId: string) => {
    try {
      const isFollowing = following.has(creatorId);
      const response = await fetch(`${API_URL}/api/marketplace/community/users/${creatorId}/follow`, {)}
  },
  method: 'POST',
        headers: getAuthHeaders();
  });
      if (response.ok) {
        setFollowing(prev => {)
  const newSet = new Set(prev);
          if (isFollowing) {
            newSet.delete(creatorId);
          } else {
            newSet.add(creatorId);
          return newSet;
        });
        setTopCreators(prev => prev.map(creator =>)
          creator.id === creatorId
            ? {
  ...creator,
  followers_count: isFollowing ,
  ? creator.followers_count - 1
  : creator.followers_count + 1,
  : creator));
} catch (error) {
  console.error('Failed to follow/unfollow creator:', error);
}, [following]);
  const handleCreatePost = useCallback(async () => {
    if (!newPostContent.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/community/posts`, {)}
  },
  method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({,)
  content: newPostContent,
  type: 'text',
}
      });
      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setShowNewPostForm(false);
    } catch (error) {
  console.error('Failed to create post:', error);
}, [newPostContent]);
  const getTierBadge = (tier: string) => {
    const tierMap = {
      bronze: { color: '#CD7F32', icon: '🥉' },
      silver: { color: '#C0C0C0', icon: '🥈' },
      gold: { color: '#FFD700', icon: '🥇' },
      platinum: { color: '#E5E4E2', icon: '💎' }
    };
    return tierMap[tier as keyof typeof tierMap] || tierMap.bronze;
  };
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}m ago`;}
    if (hours < 24) return `${hours}h ago`;}
    return `${days}d ago`;}
  };
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;}
  if (loading) {
    return;
      <div className="community-hub loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading community...</p>
        </div>
      </div>
    );
  if (error) {
    return;
      <div className="community-hub error">
        <div className="error-message">
          <h3>Failed to load community</h3>
          <p>{error}</p>
          <button onClick={fetchCommunityData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  return;
    <div className="community-hub">
      {/* Header */}
      <div className="community-header">
        <div className="header-content">
          <h1>Community</h1>
          <p>Connect with creators, share knowledge, and discover amazing templates</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowNewPostForm(true)}
            className="create-post-btn"
          >
            + Share Something
          </button>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="community-tabs">
        {['feed', 'discussions', 'events', 'leaderboard', 'creators'].map(tab => ()
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as 'feed' | 'discussions' | 'events' | 'leaderboard' | 'creators')}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="community-content">
        {activeTab === 'feed' && ()
          <div className="feed-tab">
            {/* Feed Filters */}
            <div className="feed-filters">
              <div className="filter-buttons">
                {['all', 'following', 'trending'].map(filter => ()
                  <button
                    key={filter}
                    className={`filter-btn ${feedFilter === filter ? 'active' : ''}`}
                    onClick={() => setFeedFilter(filter as 'all' | 'following' | 'trending')}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {/* New Post Form */}
            {showNewPostForm && ()
              <div className="new-post-form">
                <h3>Share with the community</h3>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind? Share a tip, ask a question, or showcase your work..."
                  rows={4}
                />
                <div className="form-actions">
                  <button 
                    onClick={() => setShowNewPostForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreatePost}
                    className="post-btn"
                    disabled={!newPostContent.trim()}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
            {/* Posts Feed */}
            <div className="posts-feed">
              {posts.map(post => ()
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="author-info">
                      <img 
                        src={post.author.avatar_url || '/default-avatar.png'} 
                        alt={post.author.display_name}
                        className="author-avatar"
                      />
                      <div className="author-details">
                        <div className="author-name">
                          {post.author.display_name}
                          {post.author.verification_status === 'verified' && ()
                            <span className="verified-badge">✓</span>
                          )}
                          <span 
                            className="tier-badge"
                            style={{ color: getTierBadge(post.author.creator_tier).color }}
                          >
                            {getTierBadge(post.author.creator_tier).icon}
                          </span>
                        </div>
                        <div className="post-time">{formatTimeAgo(post.created_at)}</div>
                      </div>
                    </div>
                    <div className="post-type-badge">
                      {post.type.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.template_preview && ()
                      <div className="template-preview">
                        <h4>{post.template_preview.title}</h4>
                        <p>{post.template_preview.description}</p>
                        <div className="template-price">
                          {formatCurrency(post.template_preview.price_cents)}
                        </div>
                        <button 
                          onClick={() => navigate(`/marketplace/templates/${post.template_preview?.id}`)}
                          className="view-template-btn"
                        >
                          View Template
                        </button>
                      </div>
                    )}
                    {post.images && post.images.length > 0 && ()
                      <div className="post-images">
                        {post.images.map((image, index) => ()
                          <img key={index} src={image} alt="Post image" />
                        ))}
                      </div>
                    )}
                    {post.tags.length > 0 && ()
                      <div className="post-tags">
                        {post.tags.map(tag => ()
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="post-actions">
                    <button 
                      className={`action-btn like ${post.is_liked ? 'active' : ''}`}
                      onClick={() => handleLikePost(post.id)}
                    >
                      👍 {post.likes_count}
                    </button>
                    <button 
                      className="action-btn comment"
                      onClick={() => navigate(`/community/posts/${post.id}`)}
                    >
                      💬 {post.comments_count}
                    </button>
                    <button className="action-btn share">
                      📤 {post.shares_count}
                    </button>
                    <button className={`action-btn bookmark ${post.is_bookmarked ? 'active' : ''}`}>}
                      🔖
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'discussions' && ()
          <div className="discussions-tab">
            <div className="discussions-header">
              <h3>Community Discussions</h3>
              <button 
                onClick={() => navigate('/community/discussions/new')}
                className="new-discussion-btn"
              >
                + Start Discussion
              </button>
            </div>
            <div className="discussions-list">
              {discussions.map(discussion => ()
                <div key={discussion.id} className="discussion-card">
                  <div className="discussion-content">
                    <div className="discussion-header">
                      <div className="discussion-badges">
                        {discussion.is_pinned && ()
                          <span className="badge pinned">📌 Pinned</span>
                        )}
                        {discussion.is_solved && ()
                          <span className="badge solved">✅ Solved</span>
                        )}
                        <span className="badge category">{discussion.category}</span>
                      </div>
                      <div className="discussion-time">
                        {formatTimeAgo(discussion.last_activity_at)}
                      </div>
                    </div>
                    <h4 className="discussion-title">
                      <a href={`/community/discussions/${discussion.id}`}>}
                        {discussion.title}
                      </a>
                    </h4>
                    <p className="discussion-excerpt">{discussion.content.slice(0, 200)}...</p>
                    <div className="discussion-meta">
                      <div className="author-info">
                        <img 
                          src={discussion.author.avatar_url || '/default-avatar.png'} 
                          alt={discussion.author.display_name}
                          className="author-avatar small"
                        />
                        {discussion.author.display_name}
                      </div>
                      <div className="discussion-stats">
                        <span>👁 {discussion.views_count}</span>
                        <span>💬 {discussion.replies_count}</span>
                      </div>
                    </div>
                    {discussion.tags.length > 0 && ()
                      <div className="discussion-tags">
                        {discussion.tags.map(tag => ()
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'events' && ()
          <div className="events-tab">
            <div className="events-header">
              <h3>Upcoming Events</h3>
              <div className="events-filters">
                <select className="event-type-filter">
                  <option value="">All Events</option>
                  <option value="webinar">Webinars</option>
                  <option value="workshop">Workshops</option>
                  <option value="community_call">Community Calls</option>
                  <option value="contest">Contests</option>
                </select>
              </div>
            </div>
            <div className="events-grid">
              {events.map(event => ()
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-type">{event.type.replace('_', ' ')}</div>
                    <div className="event-date">
                      {new Date(event.start_date).toLocaleDateString()}
                    </div>
                  </div>
                  <h4 className="event-title">{event.title}</h4>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="organizer">
                      <img 
                        src={event.organizer.avatar_url || '/default-avatar.png'} 
                        alt={event.organizer.display_name}
                        className="organizer-avatar"
                      />
                      <span>by {event.organizer.display_name}</span>
                    </div>
                    <div className="attendance">
                      {event.attendees_count} attending
                      {event.max_attendees && ` / ${event.max_attendees}`}
                    </div>
                  </div>
                  <div className="event-tags">
                    {event.tags.map(tag => ()
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="event-actions">
                    <button 
                      className={`attend-btn ${event.is_attending ? 'attending' : ''}`}
                    >
                      {event.is_attending ? 'Attending ✓' : 'Attend'}
                    </button>
                    <button className="share-btn">Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'leaderboard' && ()
          <div className="leaderboard-tab">
            <div className="leaderboard-header">
              <h3>Top Contributors</h3>
              <div className="leaderboard-filters">
                <select className="period-filter">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            <div className="leaderboard-list">
              {topCreators.map((creator, index) => ()
                <div key={creator.id} className="leaderboard-item">
                  <div className="rank">
                    {index + 1 <= 3 ? ()
                      <span className="medal">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : ()
                      <span className="rank-number">#{index + 1}</span>
                    )}
                  </div>
                  <div className="creator-info">
                    <img 
                      src={creator.avatar_url || '/default-avatar.png'} 
                      alt={creator.display_name}
                      className="creator-avatar"
                    />
                    <div className="creator-details">
                      <div className="creator-name">
                        {creator.display_name}
                        {creator.verification_status === 'verified' && ()
                          <span className="verified-badge">✓</span>
                        )}
                        <span 
                          className="tier-badge"
                          style={{ color: getTierBadge(creator.creator_tier).color }}
                        >
                          {getTierBadge(creator.creator_tier).icon}
                        </span>
                      </div>
                      <div className="creator-stats">
                        {creator.templates_count} templates • {formatCurrency(creator.total_revenue)} earned
                      </div>
                    </div>
                  </div>
                  <div className="creator-metrics">
                    <div className="metric">
                      <span className="value">{creator.followers_count}</span>
                      <span className="label">Followers</span>
                    </div>
                    <div className="metric">
                      <span className="value">{creator.templates_count}</span>
                      <span className="label">Templates</span>
                    </div>
                  </div>
                  <div className="creator-actions">
                    <button 
                      className={`follow-btn ${following.has(creator.id) ? 'following' : ''}`}
                      onClick={() => handleFollowCreator(creator.id)}
                    >
                      {following.has(creator.id) ? 'Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => navigate(`/creators/${creator.id}`)}
                      className="profile-btn"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'creators' && ()
          <div className="creators-tab">
            <div className="creators-header">
              <h3>Featured Creators</h3>
              <div className="creators-filters">
                <select className="tier-filter">
                  <option value="">All Tiers</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
                <select className="category-filter">
                  <option value="">All Categories</option>
                  <option value="writing">Writing</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </div>
            <div className="creators-grid">
              {topCreators.map(creator => ()
                <div key={creator.id} className="creator-card">
                  <div className="creator-header">
                    <img 
                      src={creator.avatar_url || '/default-avatar.png'} 
                      alt={creator.display_name}
                      className="creator-avatar large"
                    />
                    <div className="creator-badges">
                      {creator.verification_status === 'verified' && ()
                        <span className="verified-badge">✓ Verified</span>
                      )}
                      <span 
                        className="tier-badge"
                        style={{ backgroundColor: getTierBadge(creator.creator_tier).color }}
                      >
                        {getTierBadge(creator.creator_tier).icon} {creator.creator_tier}
                      </span>
                    </div>
                  </div>
                  <h4 className="creator-name">{creator.display_name}</h4>
                  <div className="creator-stats-grid">
                    <div className="stat">
                      <span className="value">{creator.followers_count}</span>
                      <span className="label">Followers</span>
                    </div>
                    <div className="stat">
                      <span className="value">{creator.templates_count}</span>
                      <span className="label">Templates</span>
                    </div>
                    <div className="stat">
                      <span className="value">{formatCurrency(creator.total_revenue)}</span>
                      <span className="label">Revenue</span>
                    </div>
                  </div>
                  <div className="creator-actions">
                    <button 
                      className={`follow-btn ${following.has(creator.id) ? 'following' : ''}`}
                      onClick={() => handleFollowCreator(creator.id)}
                    >
                      {following.has(creator.id) ? 'Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => navigate(`/creators/${creator.id}`)}
                      className="profile-btn"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .community-hub {
          max-width: 1200px;,
  margin: 0 auto;
          padding: 20px;
        .community-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        .header-content h1 {
          margin: 0 0 5px 0;,
  color: #1f2937;
          font-size: 32px;
        .header-content p {
          margin: 0;,
  color: #6b7280;
          font-size: 16px;
        .create-post-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;,
  cursor: pointer;
        .create-post-btn:hover {,
  background: #2563eb;
        .community-tabs {
          display: flex;,
  gap: 2px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e1e5e9;
        .tab {
          background: none;,
  border: none;
          padding: 12px 20px;,
  cursor: pointer;
          color: #6b7280;
          font-weight: 500;
          border-bottom: 2px solid transparent;
        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        .tab:hover {,
  color: #1f2937;
        .feed-filters {
          margin-bottom: 20px;
        .filter-buttons {
          display: flex;,
  gap: 10px;
        .filter-btn {
          background: #f3f4f6;,
  border: none;
          padding: 8px 16px;
          border-radius: 20px;,
  cursor: pointer;
          color: #6b7280;
          font-size: 14px;
        .filter-btn.active {
          background: #3b82f6;,
  color: white;
        .new-post-form {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        .new-post-form h3 {
          margin: 0 0 15px 0;,
  color: #1f2937;
        .new-post-form textarea {
          width: 100%;,
  padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;,
  resize: vertical;
          font-family: inherit;
          font-size: 14px;
        .form-actions {
          display: flex;
          justify-content: flex-end;,
  gap: 10px;
          margin-top: 15px;
        .cancel-btn {
          background: #f3f4f6;,
  color: #374151;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .post-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .post-btn:disabled {,
  background: #9ca3af;
          cursor: not-allowed;
        .posts-feed {
          display: flex;
          flex-direction: column;,
  gap: 20px;
        .post-card {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        .author-info {
          display: flex;
          align-items: center;,
  gap: 12px;
        .author-avatar {
          width: 40px;,
  height: 40px;
          border-radius: 50%;
          object-fit: cover;
        .author-avatar.small {
          width: 24px;,
  height: 24px;
        .author-avatar.large {
          width: 80px;,
  height: 80px;
        .author-name {
          font-weight: 600;,
  color: #1f2937;
          display: flex;
          align-items: center;,
  gap: 5px;
        .verified-badge {
          color: #22c55e;
          font-size: 12px;
        .tier-badge {
          font-size: 12px;
        .post-time {
          font-size: 12px;,
  color: #6b7280;
        .post-type-badge {
          background: #f3f4f6;,
  padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;,
  color: #6b7280;
          text-transform: capitalize;
        .post-content p {
          margin: 0 0 15px 0;,
  color: #374151;
          line-height: 1.6;
        .template-preview {
          background: #f9fafb;,
  border: 1px solid #e5e7eb;
          border-radius: 8px;,
  padding: 15px;
          margin: 15px 0;
        .template-preview h4 {
          margin: 0 0 8px 0;,
  color: #1f2937;
        .template-preview p {
          margin: 0 0 10px 0;,
  color: #6b7280;
          font-size: 14px;
        .template-price {
          font-weight: 600;,
  color: #059669;
          margin-bottom: 10px;
        .view-template-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;,
  cursor: pointer;
        .post-images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;,
  margin: 15px 0;
        .post-images img {
          width: 100%;,
  height: 200px;
          object-fit: cover;
          border-radius: 8px;
        .post-tags, .discussion-tags, .event-tags {
          display: flex;
          flex-wrap: wrap;,
  gap: 8px;
          margin: 15px 0;
        .tag {
          background: #e5e7eb;,
  color: #374151;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        .post-actions {
          display: flex;,
  gap: 15px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        .action-btn {
          background: none;,
  border: none;
          color: #6b7280;,
  cursor: pointer;
          font-size: 14px;,
  display: flex;
          align-items: center;,
  gap: 5px;
          padding: 5px 10px;
          border-radius: 6px;
        .action-btn:hover {,
  background: #f3f4f6;
        .action-btn.active {
          color: #3b82f6;,
  background: #dbeafe;
        .discussions-header, .events-header, .leaderboard-header, .creators-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        .new-discussion-btn {
          background: #10b981;,
  color: white;
          border: none;,
  padding: 10px 20px;
          border-radius: 8px;,
  cursor: pointer;
        .discussions-list {
          display: flex;
          flex-direction: column;,
  gap: 15px;
        .discussion-card {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .discussion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        .discussion-badges {
          display: flex;,
  gap: 8px;
        .badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        .badge.pinned {
          background: #fef3c7;,
  color: #92400e;
        .badge.solved {
          background: #d1fae5;,
  color: #065f46;
        .badge.category {
          background: #e0e7ff;,
  color: #3730a3;
        .discussion-title a {
          color: #1f2937;
          text-decoration: none;
          font-weight: 600;
        .discussion-title a:hover {,
  color: #3b82f6;
        .discussion-excerpt {
          color: #6b7280;,
  margin: 10px 0;
          line-height: 1.5;
        .discussion-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  margin: 15px 0;
        .discussion-stats {
          display: flex;,
  gap: 15px;
          font-size: 14px;,
  color: #6b7280;
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        .event-card {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        .event-type {
          background: #dbeafe;,
  color: #1e40af;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          text-transform: capitalize;
        .event-date {
          font-size: 12px;,
  color: #6b7280;
        .event-title {
          margin: 0 0 10px 0;,
  color: #1f2937;
        .event-description {
          color: #6b7280;
          margin-bottom: 15px;
          line-height: 1.5;
        .event-details {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  margin: 15px 0;
        .organizer {
          display: flex;
          align-items: center;,
  gap: 8px;
        .organizer-avatar {
          width: 24px;,
  height: 24px;
          border-radius: 50%;
          object-fit: cover;
        .attendance {
          font-size: 14px;,
  color: #6b7280;
        .event-actions {
          display: flex;,
  gap: 10px;
          margin-top: 15px;
        .attend-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
          flex: 1;
        .attend-btn.attending {
          background: #22c55e;
        .share-btn {
          background: #f3f4f6;,
  color: #374151;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .leaderboard-list {
          display: flex;
          flex-direction: column;,
  gap: 15px;
        .leaderboard-item {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;,
  gap: 20px;
        .rank {
          font-size: 24px;
          font-weight: bold;
          min-width: 60px;
          text-align: center;
        .medal {
          font-size: 32px;
        .rank-number {
          color: #6b7280;
        .creator-info {
          display: flex;
          align-items: center;,
  gap: 15px;
          flex: 1;
        .creator-avatar {
          width: 50px;,
  height: 50px;
          border-radius: 50%;
          object-fit: cover;
        .creator-details {
          flex: 1;
        .creator-name {
          font-weight: 600;,
  color: #1f2937;
          display: flex;
          align-items: center;,
  gap: 8px;
          margin-bottom: 4px;
        .creator-stats {
          font-size: 14px;,
  color: #6b7280;
        .creator-metrics {
          display: flex;,
  gap: 30px;
        .metric {
          text-align: center;
        .metric .value {
          display: block;
          font-size: 18px;
          font-weight: bold;,
  color: #1f2937;
        .metric .label {
          font-size: 12px;,
  color: #6b7280;
        .creator-actions {
          display: flex;,
  gap: 10px;
        .follow-btn {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .follow-btn.following {
          background: #6b7280;
        .profile-btn {
          background: #f3f4f6;,
  color: #374151;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .creators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        .creator-card {
          background: white;,
  padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        .creator-header {
          margin-bottom: 15px;
        .creator-badges {
          display: flex;
          justify-content: center;,
  gap: 8px;
          margin-top: 10px;
        .creator-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;,
  margin: 20px 0;
        .stat {
          text-align: center;
        .stat .value {
          display: block;
          font-size: 20px;
          font-weight: bold;,
  color: #1f2937;
        .stat .label {
          font-size: 12px;,
  color: #6b7280;
        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        .loading-spinner {
          text-align: center;
        .spinner {
          width: 40px;,
  height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;,
  animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        .error-message {
          text-align: center;,
  padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .retry-button {
          background: #3b82f6;,
  color: white;
          border: none;,
  padding: 10px 20px;
          border-radius: 6px;,
  cursor: pointer;
          margin-top: 15px;
        .retry-button:hover {,
  background: #2563eb;
        select {
          padding: 8px 12px;,
  border: 1px solid #d1d5db;
          border-radius: 6px;,
  background: white;
          color: #374151;
      `}</style>
    </div>
  );
};