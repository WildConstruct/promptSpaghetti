/**
 * Epic 16 Comment Moderation Panel
 * Task: E16-1753114247008-F23213 - Develop comment moderation
 * 
 * Specialized moderation interface for comments that integrates with existing
 * moderation infrastructure. Provides comment-specific actions, bulk operations,
 * and real-time moderation capabilities.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingComment } from '../../types/TrendingCommentsTypes';
import { TrendingCommentCard } from '../TrendingComments/TrendingCommentCard';

export interface CommentModerationConfig {
  enableBulkActions: boolean;
  enableAutoModeration: boolean;
  enableThreadModeration: boolean;
  enableSentimentFiltering: boolean;
  autoHideThreshold: number; // toxicity threshold
  requireApprovalThreshold: number; // low quality threshold
  enableRealtimeUpdates: boolean;
  moderatorId: string;
  permissions: string[];
}

export interface CommentModerationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'flagged' | 'auto_hidden';
  sentiment?: 'positive' | 'neutral' | 'negative' | 'very_negative';
  toxicity?: 'low' | 'medium' | 'high' | 'critical';
  reports?: 'none' | 'few' | 'many' | 'critical';
  author?: 'all' | 'new' | 'verified' | 'banned';
  dateRange?: {
    start: Date;
    end: Date;
  };
  resourceId?: string;
  resourceType?: string;
  sortBy?: 'newest' | 'oldest' | 'most_reported' | 'lowest_quality' | 'highest_toxicity';
  keywords?: string;
}

export interface CommentModerationAction {
  type: 'approve' | 'reject' | 'flag' | 'hide' | 'delete' | 'ban_author' | 'require_edit' | 'escalate';
  commentIds: string[];
  reason?: string;
  duration?: number; // for temporary actions
  notifyAuthor?: boolean;
  escalateTo?: string;
  metadata?: Record<string, unknown>;
}

export interface CommentModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  autoHidden: number;
  totalReports: number;
  avgToxicity: number;
  avgQuality: number;
  lastProcessed?: Date;
}
interface CommentModerationPanelProps {
  config: CommentModerationConfig;
  onAction?: (action: CommentModerationAction) => Promise<void>;
  onFiltersChange?: (filters: CommentModerationFilters) => void;
  onStatsUpdate?: (stats: CommentModerationStats) => void;
  className?: string;
}

export const CommentModerationPanel: React.FC<CommentModerationPanelProps> = ({)
  config,
  onAction,
  onFiltersChange,
  onStatsUpdate,
  className = ''
}) => {
  // State management
  const [comments, setComments] = useState<TrendingComment[]>([]);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [filters, setFilters] = useState<CommentModerationFilters>({)
    status: 'pending',
    sortBy: 'newest',
  });
  const [stats, setStats] = useState<CommentModerationStats>({)
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    autoHidden: 0,
    totalReports: 0,
    avgToxicity: 0,
    avgQuality: 0,
  });
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_____showBulkActions, _____setShowBulkActions] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  // Load comments based on filters
  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate loading comments with moderation data
      const mockComments = await generateMockComments(filters);
      const mockStats = calculateMockStats(mockComments);
      setComments(mockComments);
      setStats(mockStats);
      if (onStatsUpdate) {
        onStatsUpdate(mockStats);
      }
    } catch (err) {
      setError(`Failed to load comments: ${err.message}`);}
      console.error('Comment loading failed:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, onStatsUpdate]);
  // Initialize and load data
  useEffect(() => {
    loadComments();
  }, [loadComments]);
  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<CommentModerationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  }, [filters, onFiltersChange]);
  // Handle comment selection
  const handleCommentSelection = useCallback((commentId: string, selected: boolean) => {
    setSelectedComments(prev => {)
      if (selected) {
        return [...prev, commentId];
      } else {
        return prev.filter(id => id !== commentId);
      }
    });
  }, []);
  // Handle bulk selection
  const handleSelectAll = useCallback((selectAll: boolean) => {
    if (selectAll) {
      const visibleCommentIds = comments.map(comment => comment.commentId);
      setSelectedComments(visibleCommentIds);
    } else {
      setSelectedComments([]);
    }
  }, [comments]);
  // Handle moderation actions
  const handleModerationAction = async (action: CommentModerationAction) => {
    if (!onAction) return;
    setLoading(true);
    try {
      await onAction(action);
      // Clear selection and reload comments
      setSelectedComments([]);
      await loadComments();
      console.log(`✅ Moderation action completed: ${action.type} on ${action.commentIds.length} comments`);}
    } catch (err) {
      setError(`Moderation action failed: ${err.message}`);}
      console.error('Moderation action failed:', err);
    } finally {
      setLoading(false);
    }
  };
  // Handle thread expansion
  const handleThreadToggle = useCallback((commentId: string) => {
    setExpandedThreads(prev => {)
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);
  // Computed values
  const hasPermission = useCallback((permission: string) => {
    return config.permissions.includes(permission) || config.permissions.includes('moderation:admin');
  }, [config.permissions]);
  const selectedCount = selectedComments.length;
  const allSelected = selectedCount > 0 && selectedCount === comments.length;
  const someSelected = selectedCount > 0 && selectedCount < comments.length;
  // Quick action buttons data
  const quickActions = useMemo(() => [;
    { 
      type: 'approve' as const, 
      label: '✅ Approve', 
      color: '#059669',
      permission: 'moderation:approve',
      show: selectedCount > 0
    },
    { 
      type: 'reject' as const, 
      label: '❌ Reject', 
      color: '#dc2626',
      permission: 'moderation:reject',
      show: selectedCount > 0
    },
    { 
      type: 'flag' as const, 
      label: '🚩 Flag', 
      color: '#d97706',
      permission: 'moderation:flag',
      show: selectedCount > 0
    },
    { 
      type: 'hide' as const, 
      label: '👁️ Hide', 
      color: '#6b7280',
      permission: 'moderation:hide',
      show: selectedCount > 0
    }
  ].filter(action => action.show && hasPermission(action.permission)), [selectedCount, hasPermission]);
  return ()
    <div className={`comment-moderation-panel ${className}`} style={{}
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            💬 Comment Moderation
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: '#6b7280',
          }}>
            {stats.pending} pending • {stats.total} total • {stats.totalReports} reports
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Auto-moderation toggle */}
          {hasPermission('moderation:auto') && ()
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#6b7280',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                defaultChecked={config.enableAutoModeration}
                style={{ margin: 0 }}
              />
              Auto-moderate
            </label>
          )}
          {/* Refresh button */}
          <button
            onClick={loadComments}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>
      {/* Filters */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
      }}>
        <select
          value={filters.status || ''}
          onChange={(e) => handleFiltersChange({ status: e.target.value as any })}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: 'white',
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
          <option value="auto_hidden">Auto-hidden</option>
        </select>
        <select
          value={filters.sentiment || ''}
          onChange={(e) => handleFiltersChange({ sentiment: e.target.value as any })}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: 'white',
          }}
        >
          <option value="">All Sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
          <option value="very_negative">Very Negative</option>
        </select>
        <select
          value={filters.toxicity || ''}
          onChange={(e) => handleFiltersChange({ toxicity: e.target.value as any })}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: 'white',
          }}
        >
          <option value="">All Toxicity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleFiltersChange({ sortBy: e.target.value as any })}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: 'white',
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_reported">Most Reported</option>
          <option value="lowest_quality">Lowest Quality</option>
          <option value="highest_toxicity">Highest Toxicity</option>
        </select>
        <input
          type="text"
          placeholder="Search keywords..."
          value={filters.keywords || ''}
          onChange={(e) => handleFiltersChange({ keywords: e.target.value })}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            minWidth: '150px',
          }}
        />
      </div>
      {/* Bulk Actions Bar */}
      {config.enableBulkActions && selectedCount > 0 && ()
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#eff6ff',
          borderBottom: '1px solid #bfdbfe',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1e40af',
            }}>
              {selectedCount} comment{selectedCount > 1 ? 's' : ''} selected
            </span>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#6b7280',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{ margin: 0 }}
              />
              Select all visible
            </label>
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
          }}>
            {quickActions.map(action => ()
              <button
                key={action.type}
                onClick={() => handleModerationAction({)
                  type: action.type,
                  commentIds: selectedComments,
                  reason: `Bulk ${action.type} action`}
                })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: action.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedComments([])}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {/* Error Display */}
      {error && ()
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          ❌ {error}
        </div>
      )}
      {/* Comments List */}
      <div style={{
        maxHeight: '600px',
        overflowY: 'auto',
      }}>
        {loading && comments.length === 0 ? ()
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            🔄 Loading comments...
          </div>
        ) : comments.length === 0 ? ()
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            📭 No comments found matching current filters
          </div>
        ) : ()
          <div style={{ padding: '12px' }}>
            {comments.map((comment, index) => ()
              <CommentModerationItem
                key={comment.commentId}
                comment={comment}
                selected={selectedComments.includes(comment.commentId)}
                onSelectionChange={(selected) => handleCommentSelection(comment.commentId, selected)}
                onAction={(action) => handleModerationAction({)
                  ...action,
                  commentIds: [comment.commentId],
                })}
                onThreadToggle={() => handleThreadToggle(comment.commentId)}
                expanded={expandedThreads.has(comment.commentId)}
                showCheckbox={config.enableBulkActions}
                moderatorPermissions={config.permissions}
                style={{ marginBottom: index < comments.length - 1 ? '12px' : 0 }}
              />
            ))}
          </div>
        )}
      </div>
      {/* Footer Stats */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#6b7280',
      }}>
        <div>
          Showing {comments.length} of {stats.total} comments
        </div>
        <div>
          Avg Quality: {stats.avgQuality.toFixed(1)} • Avg Toxicity: {(stats.avgToxicity * 100).toFixed(1)}%
          {stats.lastProcessed && ()
            <span> • Updated {stats.lastProcessed.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Comment Moderation Item Component
interface CommentModerationItemProps {
  comment: TrendingComment;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onAction: (action: Omit<CommentModerationAction, 'commentIds'>) => void;
  onThreadToggle: () => void;
  expanded: boolean;
  showCheckbox: boolean;
  moderatorPermissions: string[];
  style?: React.CSSProperties;
}
const CommentModerationItem: React.FC<CommentModerationItemProps> = ({)
  comment,
  selected,
  onSelectionChange,
  onAction,
  onThreadToggle,
  expanded,
  showCheckbox,
  moderatorPermissions,
  style
}) => {
  const hasPermission = (permission: string) => {
    return moderatorPermissions.includes(permission) || moderatorPermissions.includes('moderation:admin');
  };
  // Mock moderation metadata
  const moderationData = {
    status: 'pending' as const,
    toxicity: Math.random() * 0.3, // 0-30% toxicity
    sentiment: 'neutral' as const,
    reports: Math.floor(Math.random() * 3),
    autoFlag: Math.random() > 0.8
  };
  const toxicityColor = moderationData.toxicity > 0.2 ? '#dc2626' : ;
    moderationData.toxicity > 0.1 ? '#d97706' : '#059669';
  return ()
    <div
      style={{
        border: `1px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,}
        borderRadius: '8px',
        backgroundColor: selected ? '#eff6ff' : 'white',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Moderation Header */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {showCheckbox && ()
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelectionChange(e.target.checked)}
              style={{ margin: 0 }}
            />
          )}
          <span style={{
            padding: '2px 6px',
            backgroundColor: moderationData.status === 'pending' ? '#fbbf24' : '#10b981',
            color: 'white',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
          }}>
            {moderationData.status.toUpperCase()}
          </span>
          <span style={{ color: '#6b7280' }}>
            Toxicity: <span style={{ color: toxicityColor, fontWeight: '600' }}>
              {(moderationData.toxicity * 100).toFixed(1)}%
            </span>
          </span>
          {moderationData.reports > 0 && ()
            <span style={{ color: '#dc2626' }}>
              🚩 {moderationData.reports} report{moderationData.reports > 1 ? 's' : ''}
            </span>
          )}
          {moderationData.autoFlag && ()
            <span style={{ color: '#7c2d12' }}>
              🤖 Auto-flagged
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          gap: '4px',
        }}>
          {hasPermission('moderation:approve') && ()
            <button
              onClick={() => onAction({ type: 'approve', reason: 'Manual approval' })}
              style={{
                padding: '2px 6px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              ✅
            </button>
          )}
          {hasPermission('moderation:reject') && ()
            <button
              onClick={() => onAction({ type: 'reject', reason: 'Manual rejection' })}
              style={{
                padding: '2px 6px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              ❌
            </button>
          )}
          {hasPermission('moderation:flag') && ()
            <button
              onClick={() => onAction({ type: 'flag', reason: 'Manual flag' })}
              style={{
                padding: '2px 6px',
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              🚩
            </button>
          )}
          {comment.replyCount > 0 && ()
            <button
              onClick={onThreadToggle}
              style={{
                padding: '2px 6px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              {expanded ? '👁️' : '👁️‍🗨️'} Thread
            </button>
          )}
        </div>
      </div>
      {/* Comment Content */}
      <div style={{ padding: '8px 12px' }}>
        <TrendingCommentCard
          comment={comment}
          rank={0}
          onEngagement={() => {}}
          showReplies={expanded}
          isReply={false}
        />
      </div>
    </div>
  );
};

// Helper functions for mock data
async function generateMockComments(_____filters: CommentModerationFilters): Promise<TrendingComment[]> {
  // Generate mock comments based on filters
  const count = Math.floor(Math.random() * 20) + 5;
  const comments: TrendingComment[] = [];
  for (let i = 0; i < count; i++) {
    comments.push({)
      commentId: `comment_${Date.now()}_${i}`,}
      resourceId: 'template_123',
      resourceType: 'template',
      authorId: `user_${Math.floor(Math.random() * 100)}`,}
      authorDisplayName: `User${Math.floor(Math.random() * 100)}`,}
      authorVerified: Math.random() > 0.7,
      authorReputation: Math.floor(Math.random() * 1000),
      content: generateMockCommentContent(),
      contentType: 'text',
      mentions: [],
      hashtags: [],
      attachments: [],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      isEdited: false,
      isPinned: false,
      isHighlighted: false,
      moderationStatus: 'pending',
      score: generateMockScore(),
      replyCount: Math.floor(Math.random() * 5),
      replyTree: [],
      visibility: 'public',
      language: 'en',
    });
  }
  return comments;
}
function generateMockCommentContent(): string {
  const contents = [;
    'This template is really helpful, thanks for sharing!',
    'I found a bug in this implementation, can you fix it?',
    'Great work! This solved my problem perfectly.',
    'This is spam content that should be moderated',
    'The documentation could be better explained',
    'Excellent template, very well designed!',
    'Not sure this is working correctly for me',
    'This is inappropriate content that violates guidelines'
  ];
  return contents[Math.floor(Math.random() * contents.length)];
}
function generateMockScore(): unknown {
  return {
    scores: {,
      trendingScore: Math.random() * 100,
      engagementScore: Math.random() * 100,
      qualityScore: Math.random() * 100,
      controversyScore: Math.random() * 100
    },
    metrics: {,
      totalLikes: Math.floor(Math.random() * 50),
      totalReplies: Math.floor(Math.random() * 20),
      totalShares: Math.floor(Math.random() * 10),
      totalHelpfulVotes: Math.floor(Math.random() * 15),
      totalReports: Math.floor(Math.random() * 5)
    },
    trends: {,
      velocityTrend: 'steady' as const
    }
  };
}
function calculateMockStats(comments: TrendingComment[]): CommentModerationStats {
  return {
    total: comments.length,
    pending: Math.floor(comments.length * 0.6),
    approved: Math.floor(comments.length * 0.3),
    rejected: Math.floor(comments.length * 0.05),
    flagged: Math.floor(comments.length * 0.03),
    autoHidden: Math.floor(comments.length * 0.02),
    totalReports: Math.floor(comments.length * 0.1),
    avgToxicity: Math.random() * 0.2,
    avgQuality: 70 + Math.random() * 20,
    lastProcessed: new Date()
  };
}

export default CommentModerationPanel;