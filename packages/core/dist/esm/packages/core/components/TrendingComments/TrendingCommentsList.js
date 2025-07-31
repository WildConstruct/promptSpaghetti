import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Trending Comments List Component
 *
 * Displays a ranked list of trending comments with engagement metrics.
 * Supports real-time updates, sorting, and interactive engagement.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import { useState, useEffect } from 'react';
import { TrendingCommentsService } from '../../services/TrendingCommentsService';
import { TrendingCommentCard } from './TrendingCommentCard';
{
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState(initialPeriod);
    const [sortOrder, setSortOrder] = useState(initialSortOrder);
    const [response, setResponse] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const trendingService = new TrendingCommentsService({});
    baseUrl: 'https://prompt-spaghetti.vercel.app',
    ;
}
;
useEffect(() => {
    loadTrendingComments();
}, [resourceId, resourceType, period, sortOrder]);
const loadTrendingComments = async (loadMore = false) => {
    setIsLoading(true);
    setError(null);
    try {
        const request = {
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
        }
        else {
            setComments(trendingResponse.results.trendingComments);
            setOffset(limit);
            setResponse(trendingResponse);
            setHasMore(trendingResponse.pagination.hasMore);
        }
        try { }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load trending comments');
        }
        finally {
            setIsLoading(false);
        }
        ;
        const handleLoadMore = () => {
            if (!isLoading && hasMore) {
                loadTrendingComments(true);
            }
            ;
            const handleEngagement = async (commentId, engagementType) => {
                try {
                    // Track engagement
                    await trendingService.trackEngagement();
                    commentId,
                        'current-user-id', // TODO: Get from auth context
                        engagementType;
                }
                finally // Update local state optimistically
                 {
                }
            };
        };
    }
    finally // Update local state optimistically
     {
    }
};
;
// Update local state optimistically
setComments(prev => prev.map(comment => { }));
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
            return {
                ...comment,
                score: {
                    ...comment.score,
                    metrics: updatedMetrics,
                },
                return: comment
            };
            ;
            onCommentEngagement?.(commentId, engagementType);
    }
    try { }
    catch (err) {
        console.error('Failed to track engagement:', err);
    }
    ;
    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }
        ;
        const renderFilters = () => {
            if (!showFilters)
                return null;
            return;
            _jsxs("div", { style: {
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: {
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                }, children: "Period:" }), _jsxs("select", { value: period, onChange: (e) => setPeriod(e.target.value), style: {
                                    padding: '6px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                }, children: [_jsx("option", { value: "1h", children: "Last Hour" }), _jsx("option", { value: "6h", children: "Last 6 Hours" }), _jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last Week" }), _jsx("option", { value: "30d", children: "Last Month" }), _jsx("option", { value: "all_time", children: "All Time" })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: {
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                }, children: "Sort:" }), _jsxs("select", { value: sortOrder, onChange: (e) => setSortOrder(e.target.value), style: {
                                    padding: '6px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                }, children: [_jsx("option", { value: "trending", children: "\uD83D\uDD25 Trending" }), _jsx("option", { value: "recent", children: "\uD83D\uDD52 Most Recent" }), _jsx("option", { value: "top_rated", children: "\u2B50 Top Rated" }), _jsx("option", { value: "controversial", children: "\uD83D\uDCAC Most Controversial" }), _jsx("option", { value: "oldest", children: "\uD83D\uDCC5 Oldest First" })] })] }), _jsx("button", { onClick: () => loadTrendingComments(), disabled: isLoading, style: {
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                        }, children: "\uD83D\uDD04 Refresh" })] });
        };
    };
    ;
}
;
const renderAnalytics = () => {
    if (!showAnalytics || !response)
        return null;
    const summary = response.results.summary;
    return;
    _jsxs("div", { style: {
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #bae6fd',
        }, children: [_jsx("h4", { style: {
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                }, children: "\uD83D\uDCCA Conversation Analytics" }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#1e40af',
                                }, children: formatNumber(summary.totalEngagements) }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#6b7280',
                                }, children: "Total Engagements" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#059669',
                                }, children: summary.uniqueParticipants }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#6b7280',
                                }, children: "Unique Participants" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#d97706',
                                }, children: summary.averageScore.toFixed(1) }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#6b7280',
                                }, children: "Avg Score" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: summary.conversationHealth === 'excellent' ? '#059669' : ,
                                    summary, : .conversationHealth === 'good' ? '#0891b2' : ,
                                    summary, : .conversationHealth === 'fair' ? '#d97706' : '#dc2626',
                                }, children: summary.conversationHealth.toUpperCase() }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#6b7280',
                                }, children: "Health Score" })] })] }), summary.topHashtags.length > 0 && ()
                < div, " style=", { marginTop: '12px' }, ">", _jsx("span", { style: {
                    fontSize: '12px',
                    color: '#6b7280',
                    marginRight: '8px',
                }, children: "Trending topics:" }), summary.topHashtags.map(hashtag => ()
                < span, key = { hashtag }, style = {}, {
                display: 'inline-block',
                padding: '2px 6px',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                borderRadius: '4px',
                fontSize: '12px',
                marginRight: '6px',
            }), "> #", hashtag] });
};
div >
;
div >
;
;
;
if (error) {
    return;
    _jsxs("div", { style: {
            padding: '40px',
            textAlign: 'center',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
        }, children: [_jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "\u26A0\uFE0F" }), _jsxs("div", { children: ["Error loading trending comments: ", error] }), _jsx("button", { onClick: () => loadTrendingComments(), style: {
                    marginTop: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                }, children: "Try Again" })] });
    ;
    return;
    _jsx("div", { style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
        }, children: _jsxs("div", { style: {
                padding: '20px 24px 16px',
                borderBottom: '1px solid #e5e7eb',
            }, children: [_jsxs("h3", { style: {
                        margin: '0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }, children: ["\uD83D\uDD25 Trending Comments", response && ()
                            < span, " style=", {
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#6b7280',
                        }, "> (", response.results.qualifiedComments, " of ", response.results.totalComments, ")"] }), ")}"] }) })
        ,
            _jsxs("div", { style: { padding: '20px' }, children: [renderFilters(), renderAnalytics(), isLoading && comments.length === 0 ? ()
                        < div : , " style=", {
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280',
                    }, ">", _jsx("div", { style: {
                            width: '40px',
                            height: '40px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px',
                        } }), "Loading trending comments..."] });
    comments.length === 0 ? ()
        < div : ;
    style = {};
    {
        padding: '40px',
            textAlign;
        'center',
            color;
        '#6b7280',
        ;
    }
}
 >
    (_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDCAC" })
        ,
            _jsx("div", { children: "No trending comments found for this time period." })
                ,
                    _jsx("div", { style: { fontSize: '14px', marginTop: '8px' }, children: "Try selecting a different time period or sort order." }));
div >
;
()
    < div;
style = {};
{
    display: 'flex', flexDirection;
    'column', gap;
    '16px';
}
 >
    { comments, : .map((comment, index) => ()
            < TrendingCommentCard, key = { comment, : .commentId }, comment = { comment }, rank = { index } + 1) };
onEngagement = { handleEngagement }
    /  >
;
{ /* Load More Button */ }
{
    hasMore && ()
        < div;
    style = {};
    {
        textAlign: 'center', marginTop;
        '20px';
    }
}
 >
    _jsx("button", { onClick: handleLoadMore, disabled: isLoading, style: {
            padding: '12px 24px',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
        }, children: isLoading ? 'Loading...' : 'Load More Comments' });
div >
;
div >
;
div >
;
div >
;
;
;
export default TrendingCommentsList;
