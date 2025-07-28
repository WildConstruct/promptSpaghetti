/**
 * Epic 16 Reaction Button Component
 * Task: E16-1753114247007-BB2261 - Add reaction system
 * 
 * Emoji reaction system for marketplace content including templates, comments,
 * and reviews. Provides quick emotional feedback with real-time updates.
 */
import React, { useState, useEffect, useCallback } from 'react';

export interface ReactionType {
  id: string;
  emoji: string;
  label: string;
  category: 'positive' | 'neutral' | 'negative';
  weight: number; // For analytics scoring
  description: string;
}

export interface ReactionData {
  reactionId: string;
  contentId: string;
  contentType: 'template' | 'comment' | 'review' | 'project' | 'user';
  userId: string;
  reactionType: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ReactionSummary {
  contentId: string;
  totalReactions: number;
  reactionCounts: Record<string, number>;
  userReaction?: string;
  topReactions: Array<{,
    type: string;
    emoji: string;
    count: number;
    percentage: number;
  }>;
  sentimentScore: number; // -1 to 1 scale
  engagementLevel: 'low' | 'medium' | 'high' | 'viral';
}

export interface ReactionButtonProps {
  contentId: string;
  contentType: 'template' | 'comment' | 'review' | 'project' | 'user';
  userId?: string;
  onReaction?: (reaction: ReactionData) => Promise<void>;
  onSummaryUpdate?: (summary: ReactionSummary) => void;
  variant?: 'compact' | 'full' | 'minimal' | 'picker';
  size?: 'small' | 'medium' | 'large';
  showCounts?: boolean;
  showLabels?: boolean;
  disabled?: boolean;
  maxReactions?: number;
  className?: string;
}
const DEFAULT_REACTIONS: ReactionType[] = [
  {
    id: 'love',
    emoji: '❤️',
    label: 'Love',
    category: 'positive',
    weight: 1.0,
    description: 'Love this content'
  },
  {
    id: 'like',
    emoji: '👍',
    label: 'Like',
    category: 'positive',
    weight: 0.8,
    description: 'Like this content'
  },
  {
    id: 'helpful',
    emoji: '💡',
    label: 'Helpful',
    category: 'positive',
    weight: 0.9,
    description: 'This is helpful'
  },
  {
    id: 'amazing',
    emoji: '🤩',
    label: 'Amazing',
    category: 'positive',
    weight: 1.0,
    description: 'This is amazing'
  },
  {
    id: 'funny',
    emoji: '😂',
    label: 'Funny',
    category: 'positive',
    weight: 0.7,
    description: 'This is funny'
  },
  {
    id: 'thinking',
    emoji: '🤔',
    label: 'Thinking',
    category: 'neutral',
    weight: 0.0,
    description: 'Makes me think'
  },
  {
    id: 'confused',
    emoji: '😕',
    label: 'Confused',
    category: 'neutral',
    weight: -0.2,
    description: 'This is confusing'
  },
  {
    id: 'dislike',
    emoji: '👎',
    label: 'Dislike',
    category: 'negative',
    weight: -0.8,
    description: 'Dislike this content'
  },
  {
    id: 'angry',
    emoji: '😠',
    label: 'Angry',
    category: 'negative',
    weight: -1.0,
    description: 'This makes me angry'
  },
  {
    id: 'rocket',
    emoji: '🚀',
    label: 'Awesome',
    category: 'positive',
    weight: 0.9,
    description: 'This is awesome'
  }
];

export const ReactionButton: React.FC<ReactionButtonProps> = ({)
  contentId,
  contentType,
  userId,
  onReaction,
  onSummaryUpdate,
  variant = 'compact',
  size = 'medium',
  showCounts = true,
  showLabels = false,
  disabled = false,
  maxReactions = 10,
  className = ''
}) => {
  // State management
  const [summary, setSummary] = useState<ReactionSummary>({)
    contentId,
    totalReactions: 0,
    reactionCounts: {},
    topReactions: [],
    sentimentScore: 0,
    engagementLevel: 'low',
  });
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);
  // Load reaction summary
  useEffect(() => {
    loadReactionSummary();
  }, [contentId, userId]);
  const loadReactionSummary = async () => {
    try {
      // In real implementation, this would call the API
      // For now, we'll simulate reaction data
      const mockSummary = generateMockSummary(contentId, userId);
      setSummary(mockSummary);
      if (onSummaryUpdate) {
        onSummaryUpdate(mockSummary);
      }
    } catch (err) {
      console.error('Failed to load reaction summary:', err);
    }
  };
  const handleReactionClick = useCallback(async (reactionType: string) => {
    if (disabled || !userId || loading) return;
    setLoading(true);
    setError(null);
    setAnimatingReaction(reactionType);
    try {
      const isRemoving = summary.userReaction === reactionType;
      if (onReaction) {
        const reactionData: ReactionData = {
          reactionId: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,}
          contentId,
          contentType,
          userId,
          reactionType: isRemoving ? '' : reactionType, // Empty string for removal
          timestamp: new Date(),
          metadata: {,
            action: isRemoving ? 'remove' : 'add',
            previousReaction: summary.userReaction,
          }
        };
        await onReaction(reactionData);
      }
      // Update local state
      const updatedSummary = updateSummaryAfterReaction(summary, reactionType, isRemoving);
      setSummary(updatedSummary);
      if (onSummaryUpdate) {
        onSummaryUpdate(updatedSummary);
      }
      // Close picker if open
      setShowPicker(false);
      console.log(`${isRemoving ? '➖' : '➕'} Reaction ${reactionType} for ${contentId}`);}
    } catch (err) {
      setError(`Failed to ${summary.userReaction === reactionType ? 'remove' : 'add'} reaction: ${err.message}`);}
      console.error('Reaction failed:', err);
    } finally {
      setLoading(false);
      // Clear animation after delay
      setTimeout(() => setAnimatingReaction(null), 300);
    }
  }, [contentId, contentType, userId, summary, onReaction, onSummaryUpdate, disabled, loading]);
  const togglePicker = useCallback(() => {
    if (disabled || !userId) return;
    setShowPicker(!showPicker);
  }, [disabled, userId, showPicker]);
  // Component sizing
  const sizeStyles = {
    small: {,
      fontSize: '12px',
      padding: '4px 6px',
      gap: '4px',
      emojiSize: '14px',
    },
    medium: {,
      fontSize: '14px',
      padding: '6px 8px',
      gap: '6px',
      emojiSize: '16px',
    },
    large: {,
      fontSize: '16px',
      padding: '8px 12px',
      gap: '8px',
      emojiSize: '20px',
    }
  };
  const currentSize = sizeStyles[size];
  // Get top reactions to display
  const topReactions = summary.topReactions.slice(0, variant === 'minimal' ? 3 : maxReactions);
  // Render reaction picker
  const renderReactionPicker = () => {
    if (!showPicker) return null;
    return ()
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: '0',
        marginBottom: '8px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '4px',
        minWidth: '200px',
      }}>
        {DEFAULT_REACTIONS.map(reaction => ()
          <button
            key={reaction.id}
            onClick={() => handleReactionClick(reaction.id)}
            disabled={loading}
            title={reaction.description}
            style={{
              padding: '8px',
              backgroundColor: summary.userReaction === reaction.id ? '#eff6ff' : 'transparent',
              border: summary.userReaction === reaction.id ? '1px solid #3b82f6' : '1px solid transparent',
              borderRadius: '6px',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = summary.userReaction === reaction.id ? '#dbeafe' : '#f3f4f6';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = summary.userReaction === reaction.id ? '#eff6ff' : 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{
              transform: animatingReaction === reaction.id ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}>
              {reaction.emoji}
            </span>
          </button>
        ))}
      </div>
    );
  };
  // Render compact variant (most common)
  const renderCompactVariant = () => (;)
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: currentSize.gap,
      fontSize: currentSize.fontSize,
    }}>
      {/* Top reactions */}
      {topReactions.length > 0 && ()
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}>
          {topReactions.map(reaction => {)
            const reactionDef = DEFAULT_REACTIONS.find(r => r.id === reaction.type);
            const isUserReaction = summary.userReaction === reaction.type;
            return ()
              <button
                key={reaction.type}
                onClick={() => handleReactionClick(reaction.type)}
                disabled={disabled || !userId || loading}
                title={`${reactionDef?.description} (${reaction.count})`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: currentSize.padding,
                  backgroundColor: isUserReaction ? '#eff6ff' : 'transparent',
                  border: isUserReaction ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: currentSize.fontSize,
                  cursor: disabled || !userId || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: disabled ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!disabled && userId && !loading) {
                    e.currentTarget.style.backgroundColor = isUserReaction ? '#dbeafe' : '#f3f4f6';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isUserReaction ? '#eff6ff' : 'transparent';
                }}
              >
                <span style={{
                  fontSize: currentSize.emojiSize,
                  transform: animatingReaction === reaction.type ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}>
                  {reactionDef?.emoji}
                </span>
                {showCounts && reaction.count > 0 && ()
                  <span style={{
                    fontSize: `calc(${currentSize.fontSize} * 0.9)`,}
                    fontWeight: '500',
                    color: isUserReaction ? '#3b82f6' : '#6b7280'
                  }}>
                    {reaction.count}
                  </span>
                )}
                {showLabels && ()
                  <span style={{
                    fontSize: `calc(${currentSize.fontSize} * 0.85)`,}
                    color: isUserReaction ? '#3b82f6' : '#6b7280'
                  }}>
                    {reactionDef?.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {/* Add reaction button */}
      {userId && ()
        <button
          onClick={togglePicker}
          disabled={disabled || loading}
          title="Add reaction"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: currentSize.padding,
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            fontSize: currentSize.emojiSize,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            minWidth: '32px',
          }}
          onMouseOver={(e) => {
            if (!disabled && !loading) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          {loading ? '⏳' : '😊'}
        </button>
      )}
      {/* Reaction picker */}
      {renderReactionPicker()}
      {/* Total count */}
      {showCounts && summary.totalReactions > 0 && ()
        <span style={{
          fontSize: `calc(${currentSize.fontSize} * 0.9)`,}
          color: '#6b7280',
          fontWeight: '500',
        }}>
          {summary.totalReactions > 0 && `+${summary.totalReactions}`}
        </span>
      )}
    </div>
  );
  // Render minimal variant (just emoji count)
  const renderMinimalVariant = () => (;)
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: currentSize.fontSize,
    }}>
      {topReactions.slice(0, 3).map(reaction => {)
        const reactionDef = DEFAULT_REACTIONS.find(r => r.id === reaction.type);
        return ()
          <span
            key={reaction.type}
            title={`${reactionDef?.description} (${reaction.count})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: currentSize.emojiSize,
            }}
          >
            {reactionDef?.emoji}
            <span style={{
              fontSize: `calc(${currentSize.fontSize} * 0.8)`,}
              color: '#6b7280',
            }}>
              {reaction.count}
            </span>
          </span>
        );
      })}
      {summary.totalReactions > topReactions.length && ()
        <span style={{
          fontSize: `calc(${currentSize.fontSize} * 0.8)`,}
          color: '#9ca3af',
        }}>
          +{summary.totalReactions - topReactions.reduce((sum, r) => sum + r.count, 0)}
        </span>
      )}
    </div>
  );
  // Render picker variant (always show all options)
  const renderPickerVariant = () => (;)
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      padding: '8px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
    }}>
      {DEFAULT_REACTIONS.map(reaction => {)
        const count = summary.reactionCounts[reaction.id] || 0;
        const isUserReaction = summary.userReaction === reaction.id;
        return ()
          <button
            key={reaction.id}
            onClick={() => handleReactionClick(reaction.id)}
            disabled={disabled || !userId || loading}
            title={reaction.description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 8px',
              backgroundColor: isUserReaction ? '#eff6ff' : 'white',
              border: isUserReaction ? '1px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: currentSize.fontSize,
              cursor: disabled || !userId || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: currentSize.emojiSize }}>
              {reaction.emoji}
            </span>
            {showLabels && ()
              <span style={{ 
                fontSize: `calc(${currentSize.fontSize} * 0.9)`,}
                color: isUserReaction ? '#3b82f6' : '#374151'
              }}>
                {reaction.label}
              </span>
            )}
            {showCounts && count > 0 && ()
              <span style={{
                fontSize: `calc(${currentSize.fontSize} * 0.8)`,}
                fontWeight: '600',
                color: isUserReaction ? '#3b82f6' : '#6b7280',
                backgroundColor: isUserReaction ? '#dbeafe' : '#f3f4f6',
                padding: '1px 4px',
                borderRadius: '8px',
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
  // Error display
  if (error) {
    return ()
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        color: '#dc2626',
        fontSize: '12px',
      }}>
        ❌ {error}
      </div>
    );
  }
  // Render based on variant
  const renderContent = () => {
    switch (variant) {
    case 'minimal':
      return renderMinimalVariant();
    case 'picker':
      return renderPickerVariant();
    case 'full':
      return renderCompactVariant();
    case 'compact':
    default:
      return renderCompactVariant();
    }
  };
  return ()
    <div className={`reaction-button ${className}`} style={{ position: 'relative' }}>}
      {renderContent()}
    </div>
  );
};

// Helper functions
function generateMockSummary(contentId: string, userId?: string): ReactionSummary {
  const reactions = ['love', 'like', 'helpful', 'amazing', 'thinking'];
  const reactionCounts: Record<string, number> = {};
  let totalReactions = 0;
  // Generate random reaction counts
  reactions.forEach(reaction => {)
    const count = Math.floor(Math.random() * 20);
    if (count > 0) {
      reactionCounts[reaction] = count;
      totalReactions += count;
    }
  });
  // Generate top reactions
  const topReactions = Object.entries(reactionCounts);
    .map(([type, count]) => {
      const reactionDef = DEFAULT_REACTIONS.find(r => r.id === type);
      return {
        type,
        emoji: reactionDef?.emoji || '❓',
        count,
        percentage: totalReactions > 0 ? (count / totalReactions) * 100 : 0
      };
    })
    .sort((a, b) => b.count - a.count);
  // Calculate sentiment score
  const sentimentScore = Object.entries(reactionCounts);
    .reduce((score, [type, count]) => {
      const reactionDef = DEFAULT_REACTIONS.find(r => r.id === type);
      return score + (reactionDef?.weight || 0) * count;
    }, 0) / Math.max(totalReactions, 1);
  // Determine engagement level
  const engagementLevel = totalReactions > 50 ? 'viral' :;
    totalReactions > 20 ? 'high' :
      totalReactions > 5 ? 'medium' : 'low';
  // Simulate user reaction (20% chance)
  const userReaction = userId && Math.random() > 0.8 ? ;
    reactions[Math.floor(Math.random() * reactions.length)] : 
    undefined;
  return {
    contentId,
    totalReactions,
    reactionCounts,
    userReaction,
    topReactions,
    sentimentScore,
    engagementLevel
  };
}
function updateSummaryAfterReaction()
  currentSummary: ReactionSummary,
  reactionType: string,
  isRemoving: boolean,
): ReactionSummary {
  const newCounts = { ...currentSummary.reactionCounts };
  if (isRemoving) {
    // Remove reaction
    if (newCounts[reactionType] > 0) {
      newCounts[reactionType]--;
      if (newCounts[reactionType] === 0) {
        delete newCounts[reactionType];
      }
    }
  } else {
    // Add reaction (remove previous if exists)
    if (currentSummary.userReaction && currentSummary.userReaction !== reactionType) {
      if (newCounts[currentSummary.userReaction] > 0) {
        newCounts[currentSummary.userReaction]--;
        if (newCounts[currentSummary.userReaction] === 0) {
          delete newCounts[currentSummary.userReaction];
        }
      }
    }
    newCounts[reactionType] = (newCounts[reactionType] || 0) + 1;
  }
  const totalReactions = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
  // Recalculate top reactions
  const topReactions = Object.entries(newCounts);
    .map(([type, count]) => {
      const reactionDef = DEFAULT_REACTIONS.find(r => r.id === type);
      return {
        type,
        emoji: reactionDef?.emoji || '❓',
        count,
        percentage: totalReactions > 0 ? (count / totalReactions) * 100 : 0
      };
    })
    .sort((a, b) => b.count - a.count);
  // Recalculate sentiment score
  const sentimentScore = Object.entries(newCounts);
    .reduce((score, [type, count]) => {
      const reactionDef = DEFAULT_REACTIONS.find(r => r.id === type);
      return score + (reactionDef?.weight || 0) * count;
    }, 0) / Math.max(totalReactions, 1);
  // Recalculate engagement level
  const engagementLevel = totalReactions > 50 ? 'viral' :;
    totalReactions > 20 ? 'high' :
      totalReactions > 5 ? 'medium' : 'low';
  return {
    ...currentSummary,
    totalReactions,
    reactionCounts: newCounts,
    userReaction: isRemoving ? undefined : reactionType,
    topReactions,
    sentimentScore,
    engagementLevel
  };
}

export default ReactionButton;