/**
 * Epic 16 Community Forum Card Component
 * 
 * Card component for displaying forum posts, discussions, and community content
 * with engagement metrics, moderation features, and real-time updates.
 */

import React, { useState } from 'react';

export interface ForumUser {
  id: string;
  name: string;
  avatar?: string;
  reputation: number;
  badges: string[];
  isVerified: boolean;
  isModerator: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  contentPreview: string; // Truncated version for cards
  author: ForumUser;
  category: string;
  tags: string[];
  
  // Engagement metrics
  likes: number;
  dislikes: number;
  replies: number;
  views: number;
  bookmarks: number;
  
  // Status and metadata
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  status: 'active' | 'hidden' | 'deleted' | 'pending_moderation';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  
  // Moderation
  reportCount: number;
  moderationNotes?: string;
  
  // Related content
  relatedTemplates?: string[]; // Template IDs
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

interface CommunityForumCardProps {
  post: ForumPost;
  variant?: 'compact' | 'detailed' | 'featured';
  showActions?: boolean;
  currentUser?: ForumUser;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onReply?: (postId: string) => void;
  onReport?: (postId: string, reason: string) => void;
  onModerate?: (postId: string, action: string) => void;
  onClick?: (post: ForumPost) => void;
  className?: string;
}

export const CommunityForumCard: React.FC<CommunityForumCardProps> = ({
  post,
  variant = 'detailed',
  showActions = true,
  currentUser,
  onLike,
  onDislike,
  onBookmark,
  onReply,
  onReport,
  onModerate,
  onClick,
  className = ''
}) => {
  const [showModerationMenu, setShowModerationMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleVote = (voteType: 'like' | 'dislike') => {
    if (voteType === 'like') {
      setUserVote(userVote === 'like' ? null : 'like');
      onLike?.(post.id);
    } else {
      setUserVote(userVote === 'dislike' ? null : 'dislike');
      onDislike?.(post.id);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const canModerate = currentUser?.isModerator || currentUser?.id === post.author.id;

  const renderUserBadges = (user: ForumUser) => (
    <div className="flex items-center space-x-1">
      {user.isVerified && (
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {user.isModerator && (
        <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
          MOD
        </span>
      )}
      {user.badges.slice(0, 2).map((badge) => (
        <span
          key={badge}
          className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded"
        >
          {badge}
        </span>
      ))}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div 
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={() => onClick?.(post)}
      >
        <div className="flex items-start space-x-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">{post.title}</h3>
              {post.isPinned && (
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                </svg>
              )}
            </div>
            
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span>{post.author.name}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>•</span>
              <span>{formatNumber(post.replies)} replies</span>
              <span>•</span>
              <span>{formatNumber(post.views)} views</span>
            </div>
          </div>

          {/* Engagement */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{formatNumber(post.likes)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 
                  className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => onClick?.(post)}
                >
                  {post.title}
                </h3>
                
                {/* Status badges */}
                {post.isPinned && (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" title="Pinned">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  </svg>
                )}
                {post.isLocked && (
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Locked">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                {post.isFeatured && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span className="font-medium">{post.author.name}</span>
                {renderUserBadges(post.author)}
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {post.category}
                </span>
              </div>
            </div>
          </div>

          {/* Actions menu */}
          {canModerate && (
            <div className="relative">
              <button
                onClick={() => setShowModerationMenu(!showModerationMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showModerationMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Pin Post</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Lock Thread</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Feature Post</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Delete Post</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p 
          className="text-gray-700 leading-relaxed cursor-pointer hover:text-gray-900"
          onClick={() => onClick?.(post)}
        >
          {post.contentPreview}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs cursor-pointer hover:bg-blue-200"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{post.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-sm text-gray-500">
              {post.attachments.length} attachment{post.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {showActions && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Engagement actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote('like')}
                className={`flex items-center space-x-1 text-sm ${
                  userVote === 'like' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <svg className="w-4 h-4" fill={userVote === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{formatNumber(post.likes)}</span>
              </button>

              <button
                onClick={() => handleVote('dislike')}
                className={`flex items-center space-x-1 text-sm ${
                  userVote === 'dislike' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <svg className="w-4 h-4" fill={userVote === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                <span>{formatNumber(post.dislikes)}</span>
              </button>

              <button
                onClick={() => onReply?.(post.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4L1 20l4-4 4-4a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                </svg>
                <span>{formatNumber(post.replies)}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-1 text-sm ${
                  isBookmarked ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
                }`}
              >
                <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            {/* Meta info and report */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatNumber(post.views)} views</span>
              
              <button
                onClick={() => setShowReportDialog(true)}
                className="hover:text-red-600"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Report Post</h3>
              <div className="space-y-3">
                {['Spam', 'Inappropriate Content', 'Harassment', 'Copyright Violation', 'Other'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      onReport?.(post.id, reason);
                      setShowReportDialog(false);
                    }}
                    className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForumCard;