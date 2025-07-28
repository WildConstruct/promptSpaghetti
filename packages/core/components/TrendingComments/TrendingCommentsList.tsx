/**
 * Epic 16 Marketplace Trending Comments List Component
 * 
 * Displays a ranked list of trending comments with engagement metrics.
 * Supports real-time updates, sorting, and interactive engagement.
 * 
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import React, { useState, useEffect } from 'react';
import {
  TrendingComment,
  TrendingCommentsResponse,
  GetTrendingCommentsRequest,
  CommentSortOrder,
  TrendingPeriod,
  CommentableResourceType
} from '../../types/TrendingCommentsTypes';
import { TrendingCommentsService } from '../../services/TrendingCommentsService';
import { TrendingCommentCard } from './TrendingCommentCard';
interface TrendingCommentsListProps {
  resourceId: string;
  resourceType: CommentableResourceType;
  initialPeriod?: TrendingPeriod;
  initialSortOrder?: CommentSortOrder;
  limit?: number;
  showFilters?: boolean;
  showAnalytics?: boolean;
  onCommentEngagement?: (commentId: string, engagementType: string) => void;
}

export const TrendingCommentsList: React.FC<TrendingCommentsListProps> = ({)
  resourceId,
  resourceType,
  initialPeriod = '24h',
  initialSortOrder = 'trending',
  limit = 20,
  showFilters = true,
  showAnalytics = true,
  onCommentEngagement
}) => {
  const [comments, setComments] = useState<TrendingComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TrendingPeriod>(initialPeriod);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>(initialSortOrder);
  const [response, setResponse] = useState<TrendingCommentsResponse | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const trendingService = new TrendingCommentsService({)
    baseUrl: 'https://prompt-spaghetti.vercel.app',
  });
  useEffect(() => {
    loadTrendingComments();
  }, [resourceId, resourceType, period, sortOrder]);
  const loadTrendingComments = async (loadMore = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const request: GetTrendingCommentsRequest = {
        resourceId,
        resourceType,
        period,
        sortOrder,
        limit,
        offset: loadMore ? offset : 0,
        includeReplies: true,
      };
      const trendingResponse = await trendingService.getTrendingComments(request);
      if (loadMore) {
        setComments(prev => [...prev, ...trendingResponse.results.trendingComments]);
        setOffset(prev => prev + limit);
      } else {
        setComments(trendingResponse.results.trendingComments);
        setOffset(limit);
      }
      setResponse(trendingResponse);
      setHasMore(trendingResponse.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending comments');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadTrendingComments(true);
    }
  };
  const handleEngagement = async (commentId: string, engagementType: string) => {
    try {
      // Track engagement
      await trendingService.trackEngagement()
        commentId,
        'current-user-id', // TODO: Get from auth context
        engagementType as any
      );
      // Update local state optimistically
      setComments(prev => prev.map(comment => {)
        if (comment.commentId === commentId) {
          const updatedMetrics = { ...comment.score.metrics };
          switch (engagementType) {
          case 'like':
            updatedMetrics.totalLikes++;
            break;
          case 'reply':
            updatedMetrics.totalReplies++;
            break;
          case 'share':
            updatedMetrics.totalShares++;
            break;
          case 'helpful':
            updatedMetrics.totalHelpfulVotes++;
            break;
          }
          return {
            ...comment,
            score: {,
              ...comment.score,
              metrics: updatedMetrics,
            }
          };
        }
        return comment;
      }));
      onCommentEngagement?.(commentId, engagementType);
    } catch (err) {
      console.error('Failed to track engagement:', err);
    }
  };
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  const renderFilters = () => {
    if (!showFilters) return null;
    return ();
      <div style={{
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Time Period Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
          }}>
            Period:
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as TrendingPeriod)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last Week</option>
            <option value="30d">Last Month</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
        {/* Sort Order Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
          }}>
            Sort:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as CommentSortOrder)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="trending">🔥 Trending</option>
            <option value="recent">🕒 Most Recent</option>
            <option value="top_rated">⭐ Top Rated</option>
            <option value="controversial">💬 Most Controversial</option>
            <option value="oldest">📅 Oldest First</option>
          </select>
        </div>
        {/* Refresh Button */}
        <button
          onClick={() => loadTrendingComments()}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          🔄 Refresh
        </button>
      </div>
    );
  };
  const renderAnalytics = () => {
    if (!showAnalytics || !response) return null;
    const summary = response.results.summary;
    return ();
      <div style={{
        padding: '16px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #bae6fd',
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#0c4a6e',
        }}>
          📊 Conversation Analytics
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e40af',
            }}>
              {formatNumber(summary.totalEngagements)}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
            }}>
              Total Engagements
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#059669',
            }}>
              {summary.uniqueParticipants}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
            }}>
              Unique Participants
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#d97706',
            }}>
              {summary.averageScore.toFixed(1)}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
            }}>
              Avg Score
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: summary.conversationHealth === 'excellent' ? '#059669' :,
                summary.conversationHealth === 'good' ? '#0891b2' :
                  summary.conversationHealth === 'fair' ? '#d97706' : '#dc2626'
            }}>
              {summary.conversationHealth.toUpperCase()}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
            }}>
              Health Score
            </div>
          </div>
        </div>
        {summary.topHashtags.length > 0 && ()
          <div style={{ marginTop: '12px' }}>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              marginRight: '8px',
            }}>
              Trending topics:
            </span>
            {summary.topHashtags.map(hashtag => ()
              <span
                key={hashtag}
                style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginRight: '6px',
                }}
              >
                #{hashtag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };
  if (error) {
    return ();
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca',
      }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
        <div>Error loading trending comments: {error}</div>
        <button
          onClick={() => loadTrendingComments()}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  return ();
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🔥 Trending Comments
          {response && ()
            <span style={{
              fontSize: '14px',
              fontWeight: '400',
              color: '#6b7280',
            }}>
              ({response.results.qualifiedComments} of {response.results.totalComments})
            </span>
          )}
        </h3>
      </div>
      <div style={{ padding: '20px' }}>
        {renderFilters()}
        {renderAnalytics()}
        {/* Comments List */}
        {isLoading && comments.length === 0 ? ()
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}></div>
            Loading trending comments...
          </div>
        ) : comments.length === 0 ? ()
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <div>No trending comments found for this time period.</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Try selecting a different time period or sort order.
            </div>
          </div>
        ) : ()
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map((comment, index) => ()
              <TrendingCommentCard
                key={comment.commentId}
                comment={comment}
                rank={index + 1}
                onEngagement={handleEngagement}
              />
            ))}
            {/* Load More Button */}
            {hasMore && ()
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load More Comments'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingCommentsList;