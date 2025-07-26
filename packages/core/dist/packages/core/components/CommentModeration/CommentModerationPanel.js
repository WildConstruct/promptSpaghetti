import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Comment Moderation Panel
 * Task: E16-1753114247008-F23213 - Develop comment moderation
 *
 * Specialized moderation interface for comments that integrates with existing
 * moderation infrastructure. Provides comment-specific actions, bulk operations,
 * and real-time moderation capabilities.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingCommentCard } from '../TrendingComments/TrendingCommentCard';
export const CommentModerationPanel = ({ config, onAction, onFiltersChange, onStatsUpdate, className = '' }) => {
    // State management
    const [comments, setComments] = useState([]);
    const [selectedComments, setSelectedComments] = useState([]);
    const [filters, setFilters] = useState({
        status: 'pending',
        sortBy: 'newest'
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        flagged: 0,
        autoHidden: 0,
        totalReports: 0,
        avgToxicity: 0,
        avgQuality: 0
    });
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [_____showBulkActions, _____setShowBulkActions] = useState(false);
    const [expandedThreads, setExpandedThreads] = useState(new Set());
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
        }
        catch (err) {
            setError(`Failed to load comments: ${err.message}`);
            console.error('Comment loading failed:', err);
        }
        finally {
            setLoading(false);
        }
    }, [filters, onStatsUpdate]);
    // Initialize and load data
    useEffect(() => {
        loadComments();
    }, [loadComments]);
    // Handle filter changes
    const handleFiltersChange = useCallback((newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        if (onFiltersChange) {
            onFiltersChange(updatedFilters);
        }
    }, [filters, onFiltersChange]);
    // Handle comment selection
    const handleCommentSelection = useCallback((commentId, selected) => {
        setSelectedComments(prev => {
            if (selected) {
                return [...prev, commentId];
            }
            else {
                return prev.filter(id => id !== commentId);
            }
        });
    }, []);
    // Handle bulk selection
    const handleSelectAll = useCallback((selectAll) => {
        if (selectAll) {
            const visibleCommentIds = comments.map(comment => comment.commentId);
            setSelectedComments(visibleCommentIds);
        }
        else {
            setSelectedComments([]);
        }
    }, [comments]);
    // Handle moderation actions
    const handleModerationAction = async (action) => {
        if (!onAction)
            return;
        setLoading(true);
        try {
            await onAction(action);
            // Clear selection and reload comments
            setSelectedComments([]);
            await loadComments();
            console.log(`✅ Moderation action completed: ${action.type} on ${action.commentIds.length} comments`);
        }
        catch (err) {
            setError(`Moderation action failed: ${err.message}`);
            console.error('Moderation action failed:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // Handle thread expansion
    const handleThreadToggle = useCallback((commentId) => {
        setExpandedThreads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            }
            else {
                newSet.add(commentId);
            }
            return newSet;
        });
    }, []);
    // Computed values
    const hasPermission = useCallback((permission) => {
        return config.permissions.includes(permission) || config.permissions.includes('moderation:admin');
    }, [config.permissions]);
    const selectedCount = selectedComments.length;
    const allSelected = selectedCount > 0 && selectedCount === comments.length;
    const someSelected = selectedCount > 0 && selectedCount < comments.length;
    // Quick action buttons data
    const quickActions = useMemo(() => [
        {
            type: 'approve',
            label: '✅ Approve',
            color: '#059669',
            permission: 'moderation:approve',
            show: selectedCount > 0
        },
        {
            type: 'reject',
            label: '❌ Reject',
            color: '#dc2626',
            permission: 'moderation:reject',
            show: selectedCount > 0
        },
        {
            type: 'flag',
            label: '🚩 Flag',
            color: '#d97706',
            permission: 'moderation:flag',
            show: selectedCount > 0
        },
        {
            type: 'hide',
            label: '👁️ Hide',
            color: '#6b7280',
            permission: 'moderation:hide',
            show: selectedCount > 0
        }
    ].filter(action => action.show && hasPermission(action.permission)), [selectedCount, hasPermission]);
    return (_jsxs("div", { className: `comment-moderation-panel ${className}`, style: {
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
        }, children: [_jsxs("div", { style: {
                    padding: '16px 20px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsxs("div", { children: [_jsx("h2", { style: {
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }, children: "\uD83D\uDCAC Comment Moderation" }), _jsxs("p", { style: {
                                    margin: '4px 0 0 0',
                                    fontSize: '13px',
                                    color: '#6b7280'
                                }, children: [stats.pending, " pending \u2022 ", stats.total, " total \u2022 ", stats.totalReports, " reports"] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [hasPermission('moderation:auto') && (_jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    cursor: 'pointer'
                                }, children: [_jsx("input", { type: "checkbox", defaultChecked: config.enableAutoModeration, style: { margin: 0 } }), "Auto-moderate"] })), _jsxs("button", { onClick: loadComments, disabled: loading, style: {
                                    padding: '6px 12px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }, children: [loading ? '🔄' : '↻', " Refresh"] })] })] }), _jsxs("div", { style: {
                    padding: '12px 20px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'center'
                }, children: [_jsxs("select", { value: filters.status || '', onChange: (e) => handleFiltersChange({ status: e.target.value }), style: {
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'white'
                        }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "flagged", children: "Flagged" }), _jsx("option", { value: "auto_hidden", children: "Auto-hidden" })] }), _jsxs("select", { value: filters.sentiment || '', onChange: (e) => handleFiltersChange({ sentiment: e.target.value }), style: {
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'white'
                        }, children: [_jsx("option", { value: "", children: "All Sentiment" }), _jsx("option", { value: "positive", children: "Positive" }), _jsx("option", { value: "neutral", children: "Neutral" }), _jsx("option", { value: "negative", children: "Negative" }), _jsx("option", { value: "very_negative", children: "Very Negative" })] }), _jsxs("select", { value: filters.toxicity || '', onChange: (e) => handleFiltersChange({ toxicity: e.target.value }), style: {
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'white'
                        }, children: [_jsx("option", { value: "", children: "All Toxicity" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "critical", children: "Critical" })] }), _jsxs("select", { value: filters.sortBy || 'newest', onChange: (e) => handleFiltersChange({ sortBy: e.target.value }), style: {
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'white'
                        }, children: [_jsx("option", { value: "newest", children: "Newest First" }), _jsx("option", { value: "oldest", children: "Oldest First" }), _jsx("option", { value: "most_reported", children: "Most Reported" }), _jsx("option", { value: "lowest_quality", children: "Lowest Quality" }), _jsx("option", { value: "highest_toxicity", children: "Highest Toxicity" })] }), _jsx("input", { type: "text", placeholder: "Search keywords...", value: filters.keywords || '', onChange: (e) => handleFiltersChange({ keywords: e.target.value }), style: {
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            minWidth: '150px'
                        } })] }), config.enableBulkActions && selectedCount > 0 && (_jsxs("div", { style: {
                    padding: '12px 20px',
                    backgroundColor: '#eff6ff',
                    borderBottom: '1px solid #bfdbfe',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }, children: [_jsxs("span", { style: {
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#1e40af'
                                }, children: [selectedCount, " comment", selectedCount > 1 ? 's' : '', " selected"] }), _jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    cursor: 'pointer'
                                }, children: [_jsx("input", { type: "checkbox", checked: allSelected, ref: (el) => {
                                            if (el)
                                                el.indeterminate = someSelected;
                                        }, onChange: (e) => handleSelectAll(e.target.checked), style: { margin: 0 } }), "Select all visible"] })] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '6px'
                        }, children: [quickActions.map(action => (_jsx("button", { onClick: () => handleModerationAction({
                                    type: action.type,
                                    commentIds: selectedComments,
                                    reason: `Bulk ${action.type} action`
                                }), style: {
                                    padding: '6px 12px',
                                    backgroundColor: action.color,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }, children: action.label }, action.type))), _jsx("button", { onClick: () => setSelectedComments([]), style: {
                                    padding: '6px 12px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }, children: "Clear" })] })] })), error && (_jsxs("div", { style: {
                    padding: '12px 20px',
                    backgroundColor: '#fef2f2',
                    borderBottom: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '14px'
                }, children: ["\u274C ", error] })), _jsx("div", { style: {
                    maxHeight: '600px',
                    overflowY: 'auto'
                }, children: loading && comments.length === 0 ? (_jsx("div", { style: {
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280'
                    }, children: "\uD83D\uDD04 Loading comments..." })) : comments.length === 0 ? (_jsx("div", { style: {
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280'
                    }, children: "\uD83D\uDCED No comments found matching current filters" })) : (_jsx("div", { style: { padding: '12px' }, children: comments.map((comment, index) => (_jsx(CommentModerationItem, { comment: comment, selected: selectedComments.includes(comment.commentId), onSelectionChange: (selected) => handleCommentSelection(comment.commentId, selected), onAction: (action) => handleModerationAction({
                            ...action,
                            commentIds: [comment.commentId]
                        }), onThreadToggle: () => handleThreadToggle(comment.commentId), expanded: expandedThreads.has(comment.commentId), showCheckbox: config.enableBulkActions, moderatorPermissions: config.permissions, style: { marginBottom: index < comments.length - 1 ? '12px' : 0 } }, comment.commentId))) })) }), _jsxs("div", { style: {
                    padding: '12px 20px',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#6b7280'
                }, children: [_jsxs("div", { children: ["Showing ", comments.length, " of ", stats.total, " comments"] }), _jsxs("div", { children: ["Avg Quality: ", stats.avgQuality.toFixed(1), " \u2022 Avg Toxicity: ", (stats.avgToxicity * 100).toFixed(1), "%", stats.lastProcessed && (_jsxs("span", { children: [" \u2022 Updated ", stats.lastProcessed.toLocaleTimeString()] }))] })] })] }));
};
const CommentModerationItem = ({ comment, selected, onSelectionChange, onAction, onThreadToggle, expanded, showCheckbox, moderatorPermissions, style }) => {
    const hasPermission = (permission) => {
        return moderatorPermissions.includes(permission) || moderatorPermissions.includes('moderation:admin');
    };
    // Mock moderation metadata
    const moderationData = {
        status: 'pending',
        toxicity: Math.random() * 0.3, // 0-30% toxicity
        sentiment: 'neutral',
        reports: Math.floor(Math.random() * 3),
        autoFlag: Math.random() > 0.8
    };
    const toxicityColor = moderationData.toxicity > 0.2 ? '#dc2626' :
        moderationData.toxicity > 0.1 ? '#d97706' : '#059669';
    return (_jsxs("div", { style: {
            border: `1px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '8px',
            backgroundColor: selected ? '#eff6ff' : 'white',
            overflow: 'hidden',
            ...style
        }, children: [_jsxs("div", { style: {
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }, children: [showCheckbox && (_jsx("input", { type: "checkbox", checked: selected, onChange: (e) => onSelectionChange(e.target.checked), style: { margin: 0 } })), _jsx("span", { style: {
                                    padding: '2px 6px',
                                    backgroundColor: moderationData.status === 'pending' ? '#fbbf24' : '#10b981',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600'
                                }, children: moderationData.status.toUpperCase() }), _jsxs("span", { style: { color: '#6b7280' }, children: ["Toxicity: ", _jsxs("span", { style: { color: toxicityColor, fontWeight: '600' }, children: [(moderationData.toxicity * 100).toFixed(1), "%"] })] }), moderationData.reports > 0 && (_jsxs("span", { style: { color: '#dc2626' }, children: ["\uD83D\uDEA9 ", moderationData.reports, " report", moderationData.reports > 1 ? 's' : ''] })), moderationData.autoFlag && (_jsx("span", { style: { color: '#7c2d12' }, children: "\uD83E\uDD16 Auto-flagged" }))] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '4px'
                        }, children: [hasPermission('moderation:approve') && (_jsx("button", { onClick: () => onAction({ type: 'approve', reason: 'Manual approval' }), style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                }, children: "\u2705" })), hasPermission('moderation:reject') && (_jsx("button", { onClick: () => onAction({ type: 'reject', reason: 'Manual rejection' }), style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                }, children: "\u274C" })), hasPermission('moderation:flag') && (_jsx("button", { onClick: () => onAction({ type: 'flag', reason: 'Manual flag' }), style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#d97706',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                }, children: "\uD83D\uDEA9" })), comment.replyCount > 0 && (_jsxs("button", { onClick: onThreadToggle, style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                }, children: [expanded ? '👁️' : '👁️‍🗨️', " Thread"] }))] })] }), _jsx("div", { style: { padding: '8px 12px' }, children: _jsx(TrendingCommentCard, { comment: comment, rank: 0, onEngagement: () => { }, showReplies: expanded, isReply: false }) })] }));
};
// Helper functions for mock data
async function generateMockComments(_____filters) {
    // Generate mock comments based on filters
    const count = Math.floor(Math.random() * 20) + 5;
    const comments = [];
    for (let i = 0; i < count; i++) {
        comments.push({
            commentId: `comment_${Date.now()}_${i}`,
            resourceId: 'template_123',
            resourceType: 'template',
            authorId: `user_${Math.floor(Math.random() * 100)}`,
            authorDisplayName: `User${Math.floor(Math.random() * 100)}`,
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
            language: 'en'
        });
    }
    return comments;
}
function generateMockCommentContent() {
    const contents = [
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
function generateMockScore() {
    return {
        scores: {
            trendingScore: Math.random() * 100,
            engagementScore: Math.random() * 100,
            qualityScore: Math.random() * 100,
            controversyScore: Math.random() * 100
        },
        metrics: {
            totalLikes: Math.floor(Math.random() * 50),
            totalReplies: Math.floor(Math.random() * 20),
            totalShares: Math.floor(Math.random() * 10),
            totalHelpfulVotes: Math.floor(Math.random() * 15),
            totalReports: Math.floor(Math.random() * 5)
        },
        trends: {
            velocityTrend: 'steady'
        }
    };
}
function calculateMockStats(comments) {
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
