import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Share Tracking Manager - E16-1753114247031-54ED13
 *
 * Comprehensive share tracking and analytics system for monitoring template
 * distribution, engagement metrics, and conversion analytics across all platforms.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, FunnelIcon, GlobeAltIcon, MapPinIcon, UserGroupIcon, TrendingUpIcon, TrendingDownIcon, ArrowUpIcon, Squares2X2Icon, FlagIcon, XCircleIcon, FaceSmileIcon } from SparklesIcon;
from;
'@heroicons/react/24/outline';
period: string;
confidence: number;
// Utility functions
export const ShareTrackingUtils = { calculateTrend: (current, previous) => {
        const change = ((current - previous) / previous) * 100;
        return {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            percentage: Math.abs(change),
            significance: Math.abs(change) > 20 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low',
            period: '7d'
        };
        aggregateShareData: (shares) => {
            const platformBreakdown = {};
            const timeSeriesData = [];
            let totalRevenue = 0;
            let totalViews = 0;
            let totalClicks = 0;
            let totalConversions = 0;
            // Process each share
            shares.forEach(share => { });
            if (!platformBreakdown[share.platform]) {
                platformBreakdown[share.platform] = {
                    platform: share.platform,
                    totalShares: 0,
                    successRate: 0,
                    averageEngagement: 0,
                    revenueGenerated: 0,
                    topPerformingContent: ''
                };
                trends: {
                    direction: 'stable', percentage;
                    0, significance;
                    'low', period;
                    '7d';
                }
            }
            ;
            const platformData = platformBreakdown[share.platform];
            platformData.totalShares++;
            platformData.revenueGenerated += share.analytics.revenue;
            totalRevenue += share.analytics.revenue;
            totalViews += share.analytics.views;
            totalClicks += share.analytics.clicks;
            totalConversions += share.analytics.conversions;
            // Create time series point
            timeSeriesData.push({});
            timestamp: share.timestamp;
            shares: 1;
            views: share.analytics.views;
            clicks: share.analytics.clicks;
            conversions: share.analytics.conversions;
            revenue: share.analytics.revenue;
            platform: share.platform;
        };
    } };
;
// Calculate success rates and averages
Object.values(platformBreakdown).forEach(platformData => { });
const platformShares = shares.filter(s => s.platform === platformData.platform);
const successfulShares = platformShares.filter(s => s.success);
platformData.successRate = (successfulShares.length / platformShares.length) * 100;
platformData.averageEngagement = platformShares.reduce((sum, s) => sum + s.analytics.engagements, 0) / platformShares.length;
;
// Generate mock insights and recommendations
const alerts = [
    { id: 'high_performance',
        type: 'success',
        title: 'High Performance Alert',
        message: 'Twitter shares are performing 150% above average',
        timestamp: new Date(),
        platform: 'twitter',
        actionRequired: false,
        dismissed: false },
    { id: 'low_conversion',
        type: 'warning',
        title: 'Low Conversion Rate',
        message: 'LinkedIn shares have low conversion rate this week',
        timestamp: new Date(),
        platform: 'linkedin',
        actionRequired: true,
        dismissed: false }
];
const recommendations = [
    {
        id: 'optimal_timing',
        type: 'timing',
        priority: 'high',
        title: 'Optimize Posting Times',
        description: 'Post on Twitter between 9-11 AM for 40% higher engagement',
        impact: '+40% engagement',
        effort: 'low',
        confidence: 0.85
    },
    { id: 'platform_focus',
        type: 'platform',
        priority: 'medium',
        title: 'Focus on High-Performing Platforms',
        description: 'Allocate more resources to Twitter and LinkedIn for better ROI',
        impact: '+25% revenue',
        effort: 'medium',
        confidence: 0.72 }
];
return {
    totalShares: shares.length,
    platformBreakdown,
    timeSeriesData,
    conversionFunnel: {},
    awareness: { stage: 'awareness', count: totalViews, percentage: 100, dropOffRate: 0, averageTime: 5 },
    interest: { stage: 'interest', count: totalClicks, percentage: (totalClicks / totalViews) * 100, dropOffRate: 75, averageTime: 30 },
    consideration: { stage: 'consideration', count: Math.floor(totalClicks * 0.6), percentage: 15, dropOffRate: 40, averageTime: 120 },
    purchase: { stage: 'purchase', count: totalConversions, percentage: 5, dropOffRate: 67, averageTime: 300 },
    advocacy: { stage: 'advocacy', count: Math.floor(totalConversions * 0.2), percentage: 1, dropOffRate: 80, averageTime: 600 },
    demographicInsights: {
        topAgeGroups: [
            { group: '25-34', percentage: 45, engagement: 8.2 },
            { group: '35-44', percentage: 30, engagement: 7.8 },
            { group: '18-24', percentage: 25, engagement: 9.1 }
        ],
        topLocations: [
            { location: 'United States', shares: Math.floor(shares.length * 0.6), revenue: totalRevenue * 0.65 },
            { location: 'United Kingdom', shares: Math.floor(shares.length * 0.15), revenue: totalRevenue * 0.18 },
            { location: 'Canada', shares: Math.floor(shares.length * 0.1), revenue: totalRevenue * 0.12 }
        ],
        topInterests: [
            { interest: 'AI & Technology', affinity: 9.2, conversion: 12.5 },
            { interest: 'Productivity', affinity: 8.7, conversion: 10.8 },
            { interest: 'Business Tools', affinity: 8.1, conversion: 9.2 }
        ],
        devicePreferences: [
            { device: 'Desktop', usage: 60, performance: 8.5 },
            { device: 'Mobile', usage: 35, performance: 7.2 },
            { device: 'Tablet', usage: 5, performance: 6.8 }
        ],
        performanceMetrics: {
            totalReach: totalViews,
            engagementRate: shares.length > 0 ? shares.reduce((sum, s) => sum + s.analytics.performance.engagementRate, 0) / shares.length : 0,
            clickThroughRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
            conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
            viralCoefficient: 1.2,
            customerAcquisitionCost: totalConversions > 0 ? (totalRevenue * 0.3) / totalConversions : 0,
            lifetimeValue: totalConversions > 0 ? totalRevenue / totalConversions : 0,
            returnOnInvestment: 250
        },
        alerts,
        recommendations,
        formatMetric: (value, type) => {
            switch (type) {
                case 'currency':
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                case 'percentage':
                    return `${value.toFixed(1)}%`;
            }
        },
        case: 'number',
        return: value.toLocaleString(),
        default: ,
        return: value.toString()
    },
    // Main component
    const: ShareTrackingManager, React, : (.FC) = ({
        templateId,
        template,
        shares = [],
        onShareUpdate,
        onAnalyticsRefresh,
        className = '',
        realTimeUpdates = true }),
    showAdvancedMetrics = true
};
{
    const [trackingData, setTrackingData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, _____setFilters] = useState({});
    dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end;
        new Date();
    }
    platforms: [];
    shareTypes: [];
    minEngagement: 0;
    regions: [];
    devices: [];
}
;
const [isRefreshing, setIsRefreshing] = useState(false);
const [dismissedAlerts, setDismissedAlerts] = useState([]);
// Process share data
useEffect(() => {
    if (shares.length > 0) {
        const processed = ShareTrackingUtils.aggregateShareData(shares);
        setTrackingData(processed);
    }
    [shares];
});
// Real-time updates simulation
useEffect(() => {
    if (!realTimeUpdates || !trackingData)
        return;
    const interval = setInterval(() => {
        // Simulate real-time data updates
        setTrackingData(prev => { });
        if (!prev)
            return null;
        return {
            ...prev,
            performanceMetrics: {
                ...prev.performanceMetrics,
                totalReach: prev.performanceMetrics.totalReach + Math.floor(Math.random() * 10),
                engagementRate: prev.performanceMetrics.engagementRate + (Math.random() - 0.5) * 0.1
            }
        };
    });
}, 30000); // Update every 30 seconds
return () => clearInterval(interval);
[realTimeUpdates, trackingData];
;
const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onAnalyticsRefresh?.();
    }
    finally {
        setIsRefreshing(false);
    }
    [onAnalyticsRefresh];
});
const handleAlertDismiss = useCallback((alertId) => { setDismissedAlerts(prev => [...prev, alertId]); }, []);
const _____filteredShares = useMemo(() => {
    return shares.filter(share => { });
    const inDateRange = share.timestamp >= filters.dateRange.start && share.timestamp <= filters.dateRange.end;
    const matchesPlatform = filters.platforms.length === 0 || filters.platforms.includes(share.platform);
    const matchesEngagement = share.analytics.engagements >= filters.minEngagement;
    return inDateRange && matchesPlatform && matchesEngagement;
});
[shares, filters];
;
const activeAlerts = useMemo(() => { return trackingData?.alerts.filter(alert => !dismissedAlerts.includes(alert.id)) || []; }, [trackingData?.alerts, dismissedAlerts]);
if (!trackingData) {
    return;
    _jsxs("div", { className: `bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`, children: ["}", _jsx(ChartBarIcon, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Share Data Available" }), _jsx("p", { className: "text-gray-600", children: "Start sharing your template to see analytics and tracking data." })] });
    ;
    return;
    _jsxs("div", { className: `bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`, children: ["}", _jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ChartBarIcon, { className: "h-6 w-6 text-blue-500" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Share Tracking & Analytics" }), _jsxs("p", { className: "text-sm text-gray-600", children: [template?.title || `Template ${templateId}`, " \u2022 ", trackingData.totalShares, " total shares}"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: handleRefresh, disabled: isRefreshing, className: "flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm disabled:opacity-50", children: [_jsx(ArrowTrendingUpIcon, { className: `h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}` }), "} Refresh"] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-500", children: [realTimeUpdates && ()
                                            <  >
                                            _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), "Live"] }), ")}"] })] }) })] });
    { /* Alerts */ }
    {
        activeAlerts.length > 0 && ()
            < div;
        className = "border-b border-gray-200 p-4 bg-yellow-50" >
            _jsxs("div", { className: "space-y-2", children: [activeAlerts.slice(0, 3).map(alert => { }), "const AlertIcon = alert.type === 'success' ? CheckCircleIcon :,; alert.type === 'warning' ? ExclamationTriangleIcon : alert.type === 'error' ? XCircleIcon : InformationCircleIcon; const alertColors = ", success, ": 'text-green-600 bg-green-100' warning: 'text-yellow-600 bg-yellow-100' error: 'text-red-600 bg-red-100' info: 'text-blue-600 bg-blue-100' } }; return;", _jsxs("div", { className: `flex items-start gap-3 p-3 rounded-lg ${alertColors[alert.type]}`, children: ["}", _jsx(AlertIcon, { className: "h-5 w-5 flex-shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: alert.title }), _jsx("div", { className: "text-sm opacity-90", children: alert.message })] }), _jsx("button", { onClick: () => handleAlertDismiss(alert.id), className: "text-gray-500 hover:text-gray-700", children: _jsx(XCircleIcon, { className: "h-4 w-4" }) })] }, alert.id), "); })}"] });
        div >
        ;
    }
    { /* Key Metrics */ }
    _jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: trackingData.totalShares }), _jsx("div", { className: "text-xs text-gray-600", children: "Total Shares" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: trackingData.performanceMetrics.totalReach.toLocaleString() }), _jsx("div", { className: "text-xs text-gray-600", children: "Total Reach" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [trackingData.performanceMetrics.clickThroughRate.toFixed(1), "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "CTR" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [trackingData.performanceMetrics.conversionRate.toFixed(1), "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Conversion" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-indigo-600", children: [trackingData.performanceMetrics.engagementRate.toFixed(1), "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Engagement" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-emerald-600", children: [ShareTrackingUtils.formatMetric(), "Object.values(trackingData.platformBreakdown).reduce((sum, p) => sum + p.revenueGenerated, 0) } 'currency' )}"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Revenue" })] })] }) });
    { /* Navigation Tabs */ }
    _jsxs("div", { className: "border-b border-gray-200", children: [_jsx("nav", { className: "flex px-4", children: [
                    { id: 'overview', label: 'Overview', icon: Squares2X2Icon },
                    { id: 'platforms', label: 'Platforms', icon: GlobeAltIcon },
                    { id: 'demographics', label: 'Demographics', icon: UserGroupIcon },
                    { id: 'funnel', label: 'Funnel', icon: FunnelIcon },
                    { id: 'alerts', label: 'Alerts', icon: FlagIcon }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return;
                    _jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
`, children: [_jsx(Icon, { className: "h-4 w-4" }), tab.label, tab.id === 'alerts' && activeAlerts.length > 0 && ()
                                < span, " className=\"ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded-full\">", activeAlerts.length] }, tab.id);
                }) }), "); })}"] });
    div >
        { /* Tab Content */}
        < div;
    className = "p-6" >
        { activeTab } === 'overview' && ()
        < div;
    className = "space-y-6" >
        { /* Performance Trends */}
        < div >
        (_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Performance Overview" })
            ,
                _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h5", { className: "font-medium text-gray-700", children: "Engagement Rate" }), _jsxs("div", { className: "flex items-center gap-1 text-sm text-green-600", children: [_jsx(ArrowUpIcon, { className: "h-3 w-3" }), "+12.5%"] })] }), _jsxs("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: [trackingData.performanceMetrics.engagementRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "vs. last period" })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h5", { className: "font-medium text-gray-700", children: "Viral Coefficient" }), _jsxs("div", { className: "flex items-center gap-1 text-sm text-orange-600", children: [_jsx(TrendingUpIcon, { className: "h-3 w-3" }), trackingData.performanceMetrics.viralCoefficient.toFixed(1)] })] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: trackingData.performanceMetrics.viralCoefficient.toFixed(2) }), _jsx("div", { className: "text-sm text-gray-600", children: "shares per user" })] })] }));
    div >
        { /* Top Recommendations */}
        < div >
        (_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Recommendations" })
            ,
                _jsx("div", { className: "space-y-3", children: trackingData.recommendations.slice(0, 3).map(rec => ()
                        < div, key = { rec, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                        _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs("span", { className: `px-2 py-1 text-xs rounded-full ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : }
  'bg-blue-100 text-blue-700'
`, children: [rec.priority, " priority"] }), _jsx("span", { className: "text-xs text-gray-500", children: rec.type })] }), _jsx("h5", { className: "font-medium text-gray-900 mb-1", children: rec.title }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: rec.description }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("span", { children: ["Impact: ", rec.impact] }), _jsxs("span", { children: ["Effort: ", rec.effort] }), _jsxs("span", { children: ["Confidence: ", (rec.confidence * 100).toFixed(0), "%"] })] })] }), _jsx(SparklesIcon, { className: "h-5 w-5 text-blue-500 flex-shrink-0" })] })) }));
}
div >
;
div >
;
div >
;
{
    activeTab === 'platforms' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h4", { className: "font-medium text-gray-900", children: "Platform Breakdown" })
            ,
                _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.values(trackingData.platformBreakdown).map(platform => ()
                        < div, key = { platform, : .platform }, className = "border border-gray-200 rounded-lg p-4" >
                        (_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h5", { className: "font-medium text-gray-900 capitalize", children: platform.platform }), _jsxs("div", { className: `flex items-center gap-1 text-xs ${platform.trends.direction === 'up' ? 'text-green-600' :
                                        platform.trends.direction === 'down' ? 'text-red-600' : }
  'text-gray-600'
`, children: [platform.trends.direction === 'up' ? _jsx(TrendingUpIcon, { className: "h-3 w-3" }) :
                                            platform.trends.direction === 'down' ? _jsx(TrendingDownIcon, { className: "h-3 w-3" }) : null, platform.trends.percentage.toFixed(1), "%"] })] })
                            ,
                                _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Shares:" }), _jsx("span", { className: "font-medium", children: platform.totalShares })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Success Rate:" }), _jsxs("span", { className: "font-medium", children: [platform.successRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Avg. Engagement:" }), _jsx("span", { className: "font-medium", children: platform.averageEngagement.toFixed(1) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Revenue:" }), _jsx("span", { className: "font-medium", children: ShareTrackingUtils.formatMetric(platform.revenueGenerated, 'currency') })] })] }))) }));
}
div >
;
div >
;
{
    activeTab === 'demographics' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h4", { className: "font-medium text-gray-900", children: "Demographic Insights" })
            ,
                _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h5", { className: "font-medium text-gray-900 mb-4", children: "Top Age Groups" }), _jsx("div", { className: "space-y-3", children: trackingData.demographicInsights.topAgeGroups.map((group, index) => ()
                                    < div, key = { group, : .group }, className = "flex items-center justify-between" >
                                    (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600", children: ["#", index + 1] }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-gray-900", children: [group.group, " years"] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Engagement: ", group.engagement.toFixed(1)] })] })] })
                                        ,
                                            _jsx("div", { className: "text-right", children: _jsxs("div", { className: "font-medium text-gray-900", children: [group.percentage, "%"] }) }))) }), "))}"] }) }));
    { /* Top Locations */ }
    _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h5", { className: "font-medium text-gray-900 mb-4", children: "Top Locations" }), _jsx("div", { className: "space-y-3", children: trackingData.demographicInsights.topLocations.map((location, index) => ()
                    < div, key = { location, : .location }, className = "flex items-center justify-between" >
                    (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MapPinIcon, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: location.location }), _jsxs("div", { className: "text-xs text-gray-500", children: [location.shares, " shares"] })] })] })
                        ,
                            _jsx("div", { className: "text-right", children: _jsx("div", { className: "font-medium text-gray-900", children: ShareTrackingUtils.formatMetric(location.revenue, 'currency') }) }))) }), "))}"] });
    div >
        { /* Device Preferences */}
        < div;
    className = "border border-gray-200 rounded-lg p-4" >
        (_jsx("h5", { className: "font-medium text-gray-900 mb-4", children: "Device Preferences" })
            ,
                _jsxs("div", { className: "space-y-3", children: [trackingData.demographicInsights.devicePreferences.map(device => { }), "const DeviceIcon = device.device === 'Mobile' ? DevicePhoneMobileIcon : ComputerDesktopIcon; return;", _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DeviceIcon, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: device.device }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Performance: ", device.performance.toFixed(1)] })] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "font-medium text-gray-900", children: [device.usage, "%"] }) })] }, device.device), "); })}"] }));
    div >
        { /* Top Interests */}
        < div;
    className = "border border-gray-200 rounded-lg p-4" >
        (_jsx("h5", { className: "font-medium text-gray-900 mb-4", children: "Top Interests" })
            ,
                _jsx("div", { className: "space-y-3", children: trackingData.demographicInsights.topInterests.map(interest => ()
                        < div, key = { interest, : .interest }, className = "flex items-center justify-between" >
                        (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: interest.interest }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Conversion: ", interest.conversion.toFixed(1), "%"] })] })] })
                            ,
                                _jsx("div", { className: "text-right", children: _jsx("div", { className: "font-medium text-gray-900", children: interest.affinity.toFixed(1) }) }))) }));
}
div >
;
div >
;
div >
;
div >
;
{
    activeTab === 'funnel' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h4", { className: "font-medium text-gray-900", children: "Conversion Funnel" })
            ,
                _jsxs("div", { className: "relative", children: [Object.values(trackingData.conversionFunnel).map((stage, index) => ()
                            < div, key = { stage, : .stage }, className = "relative mb-4" >
                            _jsx("div", { className: "flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg", style: {
                                    width: `${Math.max(stage.percentage, 10)}%`
                                }, "minWidth:": true }), '200px'), "; } >", _jsxs("div", { children: [_jsx("div", { className: "font-semibold capitalize", children: stage.stage }), _jsxs("div", { className: "text-sm opacity-90", children: [stage.count.toLocaleString(), " users"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: [stage.percentage.toFixed(1), "%"] }), index > 0 && ()
                                    < div, " className=\"text-xs opacity-75\">-", stage.dropOffRate, "% drop"] }), ")}"] }));
    div >
        _jsxs("div", { className: "mt-2 ml-4 text-xs text-gray-500", children: ["Avg. time: ", Math.floor(stage.averageTime / 60), "m ", stage.averageTime % 60, "s"] });
    div >
    ;
}
div >
;
div >
;
{
    activeTab === 'alerts' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Alerts & Notifications" }), _jsxs("div", { className: "text-sm text-gray-600", children: [activeAlerts.length, " active alerts"] })] })
            ,
                _jsxs("div", { className: "space-y-4", children: [trackingData.alerts.map(alert => { }), "const AlertIcon = alert.type === 'success' ? CheckCircleIcon :,; alert.type === 'warning' ? ExclamationTriangleIcon : alert.type === 'error' ? XCircleIcon : InformationCircleIcon; const alertColors = ", success, ": 'border-green-200 bg-green-50 text-green-800' warning: 'border-yellow-200 bg-yellow-50 text-yellow-800' error: 'border-red-200 bg-red-50 text-red-800' info: 'border-blue-200 bg-blue-50 text-blue-800' } }; const isDismissed = dismissedAlerts.includes(alert.id); return;", _jsxs("div", { className: `border rounded-lg p-4 ${isDismissed ? 'opacity-50' : ''} ${alertColors[alert.type]}`, children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertIcon, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("h5", { className: "font-medium", children: alert.title }), _jsxs("div", { className: "text-xs opacity-75", children: [alert.timestamp.toLocaleDateString(), " ", alert.timestamp.toLocaleTimeString()] })] }), _jsx("p", { className: "text-sm opacity-90 mb-2", children: alert.message }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [alert.platform && ()
                                                                    < span, " className=\"px-2 py-1 bg-white bg-opacity-20 rounded capitalize\">", alert.platform] }), ")}", alert.actionRequired && ()
                                                            < span, " className=\"px-2 py-1 bg-red-100 text-red-700 rounded\"> Action Required"] }), ")}"] }), !isDismissed && ()
                                            < button, "onClick=", () => handleAlertDismiss(alert.id), "className=\"text-xs hover:underline opacity-75 hover:opacity-100\" > Dismiss"] }), ")}"] }, alert.id)] }));
    div >
    ;
    div >
    ;
    ;
}
div >
    { trackingData, : .alerts.length === 0 && ()
            < div, className = "text-center py-8 text-gray-500" >
            (_jsx(FaceSmileIcon, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" })
                ,
                    _jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "All Good!" })
                        ,
                            _jsx("p", { className: "text-sm", children: "No alerts or issues to report at this time." })),
        div } >
;
div >
;
div >
;
div >
;
;
;
export default ShareTrackingManager;
