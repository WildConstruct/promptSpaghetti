/**
 * Epic 16 Marketplace Trending Comment Card Component
 * 
 * Individual comment card with engagement metrics, trending score, and interaction buttons.
 * Displays author info, content, and real-time engagement statistics.
 * 
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import React, { useState } from 'react';
import { TrendingComment } from '../../types/TrendingCommentsTypes';
interface TrendingCommentCardProps {
  comment: TrendingComment;
  rank: number;
  onEngagement: (commentId: string, engagementType: string) => void;
  showReplies?: boolean;
  isReply?: boolean;
}

export const TrendingCommentCard: React.FC<TrendingCommentCardProps> = ({)
  comment,
  rank,
  onEngagement,
  showReplies = true,
  isReply = false
}) => {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;}
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;}
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;}
    } else {
      return date.toLocaleDateString();
    }
  };
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  const getTrendingBadgeColor = (score: number) => {
    if (score >= 80) return { bg: '#dcfce7', text: '#166534', icon: '🔥' };
    if (score >= 60) return { bg: '#fef3c7', text: '#92400e', icon: '🔊' };
    if (score >= 40) return { bg: '#dbeafe', text: '#1e40af', icon: '📈' };
    return { bg: '#f3f4f6', text: '#374151', icon: '💬' };
  };
  const getVelocityIcon = (trend: string) => {
    switch (trend) {
    case 'accelerating': return '🚀';
    case 'declining': return '📉';
    case 'steady': return '📋';
    default: return '🔆';
    }
  };
  const shouldTruncateContent = (content: string) => {
    return content.length > 300;
  };
  const getTruncatedContent = (content: string) => {
    return content.substring(0, 300) + '...';
  };
  const trendingBadge = getTrendingBadgeColor(comment.score.scores.trendingScore);
  const contentToShow = (!isExpanded && shouldTruncateContent(comment.content)) ;
    ? getTruncatedContent(comment.content) 
    : comment.content;
  const handleEngagementClick = (engagementType: string) => {
    onEngagement(comment.commentId, engagementType);
  };
  return ();
    <div style={{
      backgroundColor: isReply ? '#fafbfc' : 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: isReply ? '12px' : '16px',
      marginLeft: isReply ? '40px' : '0',
      position: 'relative',
    }}>
      {/* Trending Rank Badge */}
      {!isReply && ()
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '16px',
          backgroundColor: trendingBadge.bg,
          color: trendingBadge.text,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid',
          borderColor: trendingBadge.text + '40',
        }}>
          <span>{trendingBadge.icon}</span>
          #{rank}
        </div>
      )}
      {/* Comment Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        marginTop: isReply ? '0' : '8px',
      }}>
        {/* Author Avatar */}
        <div style={{
          width: isReply ? '28px' : '32px',
          height: isReply ? '28px' : '32px',
          borderRadius: '50%',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isReply ? '12px' : '14px',
          fontWeight: '600',
          color: '#6b7280',
          backgroundImage: comment.authorAvatarUrl ? `url(${comment.authorAvatarUrl})` : undefined,}
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {!comment.authorAvatarUrl && comment.authorDisplayName.charAt(0).toUpperCase()}
        </div>
        {/* Author Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: isReply ? '13px' : '14px',
              fontWeight: '600',
              color: '#111827',
            }}>
              {comment.authorDisplayName}
            </span>
            {comment.authorVerified && ()
              <span style={{
                fontSize: '12px',
                color: '#059669',
              }}>
                ✓
              </span>
            )}
            {comment.authorReputation > 0 && ()
              <span style={{
                fontSize: '11px',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                {formatNumber(comment.authorReputation)} rep
              </span>
            )}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>{formatTimeAgo(comment.createdAt)}</span>
            {comment.isEdited && <span>• edited</span>}
            {comment.isPinned && <span>• 📍 pinned</span>}
            {comment.isHighlighted && <span>• ✨ highlighted</span>}
          </div>
        </div>
        {/* Trending Score */}
        {!isReply && ()
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
            <span>{getVelocityIcon(comment.score.trends.velocityTrend)}</span>
            <span>{comment.score.scores.trendingScore.toFixed(1)}</span>
          </div>
        )}
      </div>
      {/* Comment Content */}
      <div style={{
        marginBottom: '12px',
        lineHeight: '1.5',
      }}>
        <div style={{
          fontSize: isReply ? '13px' : '14px',
          color: '#374151',
          whiteSpace: 'pre-wrap',
        }}>
          {contentToShow}
        </div>
        {shouldTruncateContent(comment.content) && ()
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
        {/* Hashtags */}
        {comment.hashtags.length > 0 && ()
          <div style={{ marginTop: '8px' }}>
            {comment.hashtags.map(hashtag => ()
              <span
                key={hashtag}
                style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '4px',
                  fontSize: '11px',
                  marginRight: '6px',
                  marginBottom: '4px',
                }}
              >
                #{hashtag}
              </span>
            ))}
          </div>
        )}
        {/* Attachments */}
        {comment.attachments.length > 0 && ()
          <div style={{ marginTop: '8px' }}>
            {comment.attachments.map(attachment => ()
              <div
                key={attachment.attachmentId}
                style={{
                  padding: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                📁 {attachment.title || 'Attachment'}
                {attachment.description && ()
                  <div style={{ marginTop: '4px', fontSize: '11px' }}>
                    {attachment.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Engagement Metrics and Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid #f3f4f6',
      }}>
        {/* Engagement Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => handleEngagementClick('like')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#6b7280',
              ':hover': {
                backgroundColor: '#f3f4f6',
              }
            }}
          >
            👍 {formatNumber(comment.score.metrics.totalLikes)}
          </button>
          <button
            onClick={() => handleEngagementClick('reply')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            💬 {formatNumber(comment.score.metrics.totalReplies)}
          </button>
          <button
            onClick={() => handleEngagementClick('share')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            📤 {formatNumber(comment.score.metrics.totalShares)}
          </button>
          <button
            onClick={() => handleEngagementClick('helpful')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            ✨ {formatNumber(comment.score.metrics.totalHelpfulVotes)}
          </button>
        </div>
        {/* Quality Score */}
        {!isReply && ()
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>Quality:</span>
            <span style={{
              fontWeight: '600',
              color: comment.score.scores.qualityScore >= 80 ? '#059669' :,
                comment.score.scores.qualityScore >= 60 ? '#d97706' : '#dc2626'
            }}>
              {comment.score.scores.qualityScore.toFixed(0)}
            </span>
          </div>
        )}
      </div>
      {/* Replies */}
      {showReplies && comment.replyTree.length > 0 && ()
        <div style={{ marginTop: '16px' }}>
          {/* Show Replies Button */}
          {!showAllReplies && comment.replyTree.length > 2 && ()
            <button
              onClick={() => setShowAllReplies(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#6b7280',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              👇 Show {comment.replyTree.length} replies
            </button>
          )}
          {/* Reply List */}
          {(showAllReplies ? comment.replyTree : comment.replyTree.slice(0, 2)).map(reply => ()
            <TrendingCommentCard
              key={reply.commentId}
              comment={reply}
              rank={0}
              onEngagement={onEngagement}
              showReplies={false}
              isReply={true}
            />
          ))}
          {/* Hide Replies Button */}
          {showAllReplies && comment.replyTree.length > 2 && ()
            <button
              onClick={() => setShowAllReplies(false)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '12px',
                color: '#6b7280',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              👆 Hide replies
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingCommentCard;