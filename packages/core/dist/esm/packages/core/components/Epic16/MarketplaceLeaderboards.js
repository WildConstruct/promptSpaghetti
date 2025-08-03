import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Leaderboards Component
 * Task: E16-1753114247137-1F7DE2 - Implement leaderboards
 *
 * Comprehensive marketplace leaderboard display with templates, creators,
 * categories, and user engagement rankings with real-time updates.
 */
import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Users, FileText, Star, Eye, Calendar, Filter, RefreshCw } from ExternalLink;
from;
'lucide-react';
;
className = '';
{ // State management
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [activeMetric, setActiveMetric] = useState('revenue');
    const [filter, setFilter] = useState({});
    timeframe: 'all';
    limit: 25;
}
;
const [leaderboard, setLeaderboard] = useState(null);
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [lastRefresh, setLastRefresh] = useState(new Date());
// =============================================================================
// Data Loading
// =============================================================================
const fetchLeaderboard = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({});
        timeframe: filter.timeframe;
        limit: filter.limit.toString();
        offset: '0';
    }
    finally {
    }
});
if (filter.category) {
    params.append('category', filter.category);
    const endpoint = getLeaderboardEndpoint(activeTab, activeMetric);
    const response = await fetch(`${endpoint}?${params}`, {});
}
headers: {
    'Authorization';
    `Bearer ${getAuthToken()}`;
}
;
if (!response.ok) {
    throw new Error('Failed to load leaderboard');
    const data = await response.json();
    if (data.success) {
        setLeaderboard(data);
        setLastRefresh(new Date());
    }
    else {
        throw new Error(data.error || 'Failed to load leaderboard');
    }
    try { }
    catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
    finally {
        setLoading(false);
    }
    [activeTab, activeMetric, filter];
    ;
    const fetchCategories = useCallback(async () => {
        try {
            // Mock categories - would fetch from API
            setCategories([]);
            {
                id: 'writing', name;
                'Writing & Content';
            }
            {
                id: 'business', name;
                'Business & Marketing';
            }
            {
                id: 'education', name;
                'Education & Training';
            }
            {
                id: 'creative', name;
                'Creative & Entertainment';
            }
            {
                id: 'technical', name;
                'Technical & Development';
            }
            {
                id: 'analysis', name;
                'Analysis & Research';
            }
        }
        finally {
        }
    });
    ;
    try {
    }
    catch (error) {
        console.error('Failed to fetch categories:', error);
    }
    [];
    ;
    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    // Auto-refresh every 10 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLeaderboard();
        }, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchLeaderboard]);
    // =============================================================================
    // Event Handlers
    // =============================================================================
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setActiveMetric(getDefaultMetric(tab));
    };
    const handleMetricChange = (metric) => { setActiveMetric(metric); };
    const handleFilterChange = (newFilter) => {
        setFilter(prev => ({ ...prev, ...newFilter }));
    };
    const handleRefresh = () => { fetchLeaderboard(); };
    const handleEntryClick = (entry) => {
        switch (activeTab) {
            case 'templates':
                onTemplateClick?.(entry.id);
                break;
            case 'creators':
                onCreatorClick?.(entry.id);
                break;
            case 'categories':
        }
        onCategoryClick?.(entry.id);
        break;
    };
    // =============================================================================
    // UI Rendering Methods
    // =============================================================================
    const renderTabNavigation = () => {
        const tabs = [
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'creators', label: 'Creators', icon: Users },
            { id: 'categories', label: 'Categories', icon: Award },
            { id: 'engagement', label: 'Community', icon: Trophy }
        ];
        return;
        _jsxs("div", { className: "border-b border-gray-200 mb-6", children: [_jsxs("nav", { className: "-mb-px flex space-x-8", children: [tabs.map((tab) => ()
                            < button, key = { tab, : .id }, onClick = {}()), " => handleTabChange(tab.id)} className=", `flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
`, ">", _jsx(tab.icon, { className: "w-4 h-4 mr-2" }), tab.label] }), "))}"] });
    };
    div >
    ;
    ;
}
;
const renderMetricSelector = () => {
    const metrics = getMetricsForTab(activeTab);
    return;
    _jsxs("div", { className: "flex flex-wrap gap-2", children: [metrics.map((metric) => ()
                < button, key = { metric, : .id }, onClick = {}()), " => handleMetricChange(metric.id)} className=", `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeMetric === metric.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
`, ">", metric.label] });
};
div >
;
;
;
const renderFilters = () => {
    const timeframes = [
        { id: '24h', label: '24 Hours' },
        { id: '7d', label: '7 Days' },
        { id: '30d', label: '30 Days' },
        { id: '90d', label: '90 Days' },
        { id: 'all', label: 'All Time' }
    ];
    return;
    _jsx("div", { className: "flex flex-wrap items-center gap-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-500" }), _jsx("select", { value: filter.timeframe, onChange: (e) => handleFilterChange({ timeframe: e.target.value }), className: "text-sm border border-gray-300 rounded-md px-2 py-1 bg-white", children: timeframes.map((timeframe) => ()
                        < option, key = { timeframe, : .id }, value = { timeframe, : .id } >
                        { timeframe, : .label }) }), "))}"] }) });
    { /* Category Filter (for templates) */ }
    {
        activeTab === 'templates' && ()
            < div;
        className = "flex items-center space-x-2" >
            (_jsx(Filter, { className: "w-4 h-4 text-gray-500" })
                ,
                    _jsxs("select", { value: filter.category || '', onChange: (e) => handleFilterChange({ category: e.target.value || undefined }), className: "text-sm border border-gray-300 rounded-md px-2 py-1 bg-white", children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((category) => ()
                                < option, key = { category, : .id }, value = { category, : .id } >
                                { category, : .name })] }));
    }
};
select >
;
div >
;
{ /* Refresh Button */ }
_jsxs("button", { onClick: handleRefresh, disabled: loading, className: "flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), "}", _jsx("span", { children: "Refresh" })] });
div >
;
;
;
const renderLeaderboardHeader = () => {
    if (!leaderboard)
        return null;
    return;
    _jsx("div", { className: "bg-blue-50 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-blue-900", children: getLeaderboardTitle(activeTab, activeMetric) }), _jsxs("p", { className: "text-sm text-blue-700", children: [leaderboard.totalEntries, " entries \u2022 Updated ", formatTimeAgo(lastRefresh)] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: formatScore(leaderboard.metadata.topScore, activeMetric) }), _jsx("div", { className: "text-sm text-blue-700", children: "Top Score" })] })] }) });
};
;
;
const renderLeaderboardEntry = (entry, index) => {
    const isTopThree = index < 3;
    const rankIcon = getRankIcon(index + 1);
    return;
    _jsxs("div", { onClick: () => handleEntryClick(entry), className: `flex items-center p-4 rounded-lg border transition-all cursor-pointer ${isTopThree
            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200'
            : 'bg-white border-gray-200 hover:bg-gray-50'}
`, children: [_jsxs("div", { className: "flex-shrink-0 w-12 text-center", children: [rankIcon ? ()
                        < div : , " className=\"flex justify-center\">", rankIcon] }), ") : ()", _jsxs("span", { className: "text-lg font-bold text-gray-600", children: ["#", entry.rank] }), ")}"] }, entry.id);
    { /* Main Content */ }
    _jsx("div", { className: "flex-1 ml-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: entry.name }), _jsx("div", { className: "text-sm text-gray-600", children: renderEntryDetails(entry) })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-lg font-bold text-gray-900", children: formatScore(entry.score, activeMetric) }), entry.change !== 0 && ()
                            < div, " className=", `flex items-center text-sm ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}
`, ">", entry.change > 0 ? _jsx(TrendingUp, { className: "w-3 h-3 mr-1" }) : _jsx(TrendingDown, { className: "w-3 h-3 mr-1" }), Math.abs(entry.change)] }), ")}"] }) });
};
div >
    { /* Action Icon */}
    < div;
className = "flex-shrink-0 ml-4" >
    _jsx(ExternalLink, { className: "w-4 h-4 text-gray-400" });
div >
;
div >
;
;
;
const renderEntryDetails = (entry) => {
    switch (activeTab) {
        case 'templates':
            const templateData = entry.metadata;
            return;
            _jsxs("div", { className: "flex items-center space-x-4 text-xs", children: [_jsxs("span", { children: ["by ", templateData.creatorName] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), templateData.totalPurchases, " purchases"] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Star, { className: "w-3 h-3 mr-1" }), templateData.averageRating?.toFixed(1) || 'N/A'] })] });
    }
};
;
'creators';
const creatorData = entry.metadata;
return;
_jsxs("div", { className: "flex items-center space-x-4 text-xs", children: [_jsxs("span", { children: [creatorData.templateCount, " templates"] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Star, { className: "w-3 h-3 mr-1" }), creatorData.averageRating?.toFixed(1) || 'N/A'] }), creatorData.verificationBadges?.length > 0 && ()
            < span, " className=\"px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs\"> Verified"] });
div >
;
;
'categories';
const categoryData = entry.metadata;
return;
_jsxs("div", { className: "flex items-center space-x-4 text-xs", children: [_jsxs("span", { children: [categoryData.templateCount, " templates"] }), _jsxs("span", { children: ["Growth: ", categoryData.growthRate?.toFixed(1), "%"] })] });
;
'engagement';
const engagementData = entry.metadata;
return;
_jsxs("div", { className: "flex items-center space-x-4 text-xs", children: [_jsxs("span", { children: [engagementData.badgeCount, " badges"] }), _jsxs("span", { children: ["Level ", engagementData.level] }), _jsxs("span", { children: [engagementData.reviewsWritten, " reviews"] })] });
;
return null;
;
const renderLeaderboard = () => {
    if (loading) {
        return;
        _jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-3 text-gray-600", children: "Loading leaderboard..." })] });
    }
};
;
if (error) {
    return;
    _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [_jsx("div", { className: "text-red-600 mb-2", children: "Failed to load leaderboard" }), _jsx("div", { className: "text-sm text-red-500 mb-4", children: error }), _jsx("button", { onClick: handleRefresh, className: "bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700", children: "Try Again" })] });
    ;
    if (!leaderboard || leaderboard.leaderboard.length === 0) {
        return;
        _jsxs("div", { className: "text-center py-12", children: [_jsx(Trophy, { className: "mx-auto w-16 h-16 text-gray-400" }), _jsx("h3", { className: "mt-4 text-lg font-medium text-gray-900", children: "No entries found" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Try adjusting your filters or check back later." })] });
        ;
        return;
        _jsx("div", { className: "space-y-3", children: leaderboard.leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index)) });
        ;
    }
    ;
    // =============================================================================
    // Main Render
    // =============================================================================
    return;
    _jsxs("div", { className: `marketplace-leaderboards ${className}`, children: ["}", _jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Marketplace Leaderboards" }), _jsx("p", { className: "text-gray-600", children: "Discover top performers across the marketplace" })] }), renderTabNavigation(), _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6", children: [renderMetricSelector(), renderFilters()] }), renderLeaderboardHeader(), renderLeaderboard()] });
    ;
}
;
// =============================================================================
// Helper Functions
// =============================================================================
function getLeaderboardEndpoint(tab, metric) {
    const baseUrl = '/api/leaderboards';
    switch (tab) {
        case 'templates':
            return `${baseUrl}/templates/${metric}`;
    }
    'creators';
    return `${baseUrl}/creators/${metric}`;
}
'categories';
return `${baseUrl}/categories/${metric}`;
'engagement';
return `${baseUrl}/engagement/${metric}`;
return `${baseUrl}/templates/revenue`;
function getDefaultMetric(tab) {
    switch (tab) {
        case 'templates':
            return 'revenue';
        case 'creators':
            return 'revenue';
        case 'categories':
            return 'revenue';
        case 'engagement':
            return 'points';
        default:
            return 'revenue';
            function getMetricsForTab(tab) {
                switch (tab) {
                    case 'templates':
                        return [
                            { id: 'revenue', label: 'Revenue' },
                            { id: 'purchases', label: 'Purchases' },
                            { id: 'rating', label: 'Rating' },
                            { id: 'trending', label: 'Trending' }
                        ];
                    case 'creators':
                        return [
                            { id: 'revenue', label: 'Revenue' },
                            { id: 'templates', label: 'Templates' },
                            { id: 'rating', label: 'Rating' },
                            { id: 'badges', label: 'Badges' }
                        ];
                    case 'categories':
                        return [
                            { id: 'revenue', label: 'Revenue' },
                            { id: 'templates', label: 'Templates' },
                            { id: 'growth', label: 'Growth' }
                        ];
                    case 'engagement':
                        return [
                            { id: 'points', label: 'Points' },
                            { id: 'badges', label: 'Badges' },
                            { id: 'reviews', label: 'Reviews' },
                            { id: 'contributions', label: 'Contributions' }
                        ];
                    default:
                        return [{ id: 'revenue', label: 'Revenue' }];
                        function getLeaderboardTitle(tab, metric) {
                            const metricLabels = {
                                revenue: 'Top Revenue',
                                purchases: 'Most Purchased',
                                rating: 'Highest Rated',
                                trending: 'Trending',
                                templates: 'Most Templates',
                                badges: 'Most Badges',
                                growth: 'Fastest Growing',
                                points: 'Most Points',
                                reviews: 'Most Reviews',
                                contributions: 'Top Contributors'
                            };
                        }
                        ;
                        const tabLabels = { templates: 'Templates',
                            creators: 'Creators',
                            categories: 'Categories',
                            engagement: 'Community' };
                }
                ;
                return `${metricLabels[metric]} ${tabLabels[tab]}`;
            }
            function formatScore(score, metric) {
                switch (metric) {
                    case 'revenue':
                        return `${(score / 100).toFixed(2)}`;
                }
            }
        case 'rating':
            return `${score.toFixed(1)} ★`;
    }
    'growth';
    return `${score.toFixed(1)}%`;
}
return score.toLocaleString();
function getRankIcon(rank) {
    switch (rank) {
        case 1:
            return _jsx(Trophy, { className: "w-6 h-6 text-yellow-500" });
        case 2:
            return _jsx(Medal, { className: "w-6 h-6 text-gray-400" });
        case 3:
            return _jsx(Award, { className: "w-6 h-6 text-orange-500" });
        default:
            return null;
            function formatTimeAgo(date) {
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                if (diffMinutes < 1)
                    return 'just now';
                if (diffMinutes < 60)
                    return `${diffMinutes}m ago`;
            }
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24)
                return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}
function getAuthToken() {
    return localStorage.getItem('authToken') || '';
    export default MarketplaceLeaderboards;
}
