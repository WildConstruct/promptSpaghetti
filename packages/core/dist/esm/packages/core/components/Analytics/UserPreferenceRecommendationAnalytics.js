import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * User Preference and Recommendation Analytics - Story 30.2 Task 10
 *
 * Analytics system for tracking user preferences, analyzing recommendation effectiveness,
 * and optimizing personalization strategies through data-driven insights.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
// Mock data generators
const generateUserPreferenceData = () => ({});
userId: `user_${Math.random().toString(36).substr(2, 8)}`;
preferences: [
    {
        category: 'content_type',
        subcategory: 'templates',
        value: ['business', 'creative', 'technical'],
        weight: Math.random(),
        source: 'implicit',
        timestamp: Date.now() - Math.random() * 86400000 * 30,
        confidence: Math.random() * 0.3 + 0.7,
    },
    {
        category: 'style',
        subcategory: 'design',
        value: 'minimalist',
        weight: Math.random(),
        source: 'explicit',
        timestamp: Date.now() - Math.random() * 86400000 * 30,
        confidence: Math.random() * 0.3 + 0.7
    }
],
    implicit;
[],
    explicit;
[],
    learningHistory;
[],
    confidence;
{
    overall: Math.random() * 0.4 + 0.6,
        byCategory;
    {
        'content_type';
        Math.random() * 0.3 + 0.7,
            'style';
        Math.random() * 0.3 + 0.7,
            'complexity';
        Math.random() * 0.3 + 0.7,
        ;
    }
    ;
    const generateRecommendationPerformance = () => ({
        algorithmId: `algo_${Math.random().toString(36).substr(2, 6)}` });
}
metrics: [
    {
        metric: 'click_through_rate',
        value: Math.random() * 0.15 + 0.05,
        benchmark: 0.08,
        change: (Math.random() - 0.5) * 0.04,
    },
    {
        metric: 'conversion_rate',
        value: Math.random() * 0.1 + 0.02,
        benchmark: 0.05,
        change: (Math.random() - 0.5) * 0.02,
    },
    {
        metric: 'user_satisfaction',
        value: Math.random() * 2 + 3.5,
        benchmark: 4.0,
        change: (Math.random() - 0.5) * 0.5
    }
],
    abTestResults;
[],
    userFeedback;
[],
    businessImpact;
{
    revenueImpact: (Math.random() - 0.5) * 10000,
        engagementIncrease;
    Math.random() * 20 + 5,
        retentionImprovement;
    Math.random() * 15 + 2,
        costEfficiency;
    Math.random() * 30 + 10,
    ;
}
;
export const UserPreferenceRecommendationAnalytics = ({
    analyticsInfrastructure,
    preferenceConfig,
    recommendationConfig,
    onPreferenceInsight,
    onRecommendationOptimization,
    onExport
});
{
    const [userPreferences, setUserPreferences] = useState([]);
    const [recommendationPerformance, setRecommendationPerformance] = useState([]);
    const [selectedView, setSelectedView] = useState('preferences');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    // Generate mock data
    useEffect(() => {
        const mockPreferences = Array.from({ length: 100 }, generateUserPreferenceData);
        setUserPreferences(mockPreferences);
        const mockPerformance = Array.from({ length: 5 }, generateRecommendationPerformance);
        setRecommendationPerformance(mockPerformance);
    }, []);
    const handleAnalyzePreferences = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (onPreferenceInsight) {
                onPreferenceInsight({});
                insightId: `insight_${Math.random().toString(36).substr(2, 8)}`;
            }
        }, type, 'preference_trend', category, 'content_type', message, 'Users showing increased preference for technical content', confidence, 0.85, affectedUsers, Math.floor(Math.random() * 500) + 100, recommendations, ['Increase technical content recommendations', 'Create more technical templates']);
    });
}
1500;
;
[onPreferenceInsight];
;
const handleExport = useCallback(() => {
    if (onExport) {
        const exportData = {
            userPreferences,
            recommendationPerformance,
            analysisTimestamp: Date.now(),
            metadata: {
                totalUsers: userPreferences.length,
                averagePreferenceConfidence: userPreferences.reduce(), }(sum),
            u };
    }
});
sum + u.confidence.overall, 0;
/ userPreferences.length,;
topPerformingAlgorithm: recommendationPerformance.sort((a, b) => {
    const aScore = a.metrics.find(m => m.metric === 'conversion_rate')?.value || 0;
    const bScore = b.metrics.find(m => m.metric === 'conversion_rate')?.value || 0;
    return bScore - aScore;
})[0]?.algorithmId || 'unknown';
;
onExport(exportData);
[userPreferences, recommendationPerformance, onExport];
;
const preferenceStats = useMemo(() => {
    if (!userPreferences.length)
        return null;
    const categoryDistribution = userPreferences.reduce((acc, user) => {
        user.preferences.forEach(pref => { });
        acc[pref.category] = (acc[pref.category] || 0) + 1;
    });
    return acc;
}, {});
const avgConfidence = userPreferences.reduce((sum, u) => sum + u.confidence.overall, 0) / userPreferences.length;
return {
    totalUsers: userPreferences.length,
    avgConfidence: Math.round(avgConfidence * 100),
    topCategory: Object.entries(categoryDistribution).sort(([a], [b]) => b - a)[0]?.[0] || 'unknown',
    categoryDistribution
};
[userPreferences];
;
const recommendationStats = useMemo(() => {
    if (!recommendationPerformance.length)
        return null;
    const avgCTR = recommendationPerformance.reduce((sum, algo) => {
        const ctr = algo.metrics.find(m => m.metric === 'click_through_rate')?.value || 0;
        return sum + ctr;
    }, 0) / recommendationPerformance.length;
    const avgConversion = recommendationPerformance.reduce((sum, algo) => {
        const conv = algo.metrics.find(m => m.metric === 'conversion_rate')?.value || 0;
        return sum + conv;
    }, 0) / recommendationPerformance.length;
    return {
        totalAlgorithms: recommendationPerformance.length,
        avgCTR: Math.round(avgCTR * 100 * 100) / 100, // Percentage with 2 decimals,
        avgConversion: Math.round(avgConversion * 100 * 100) / 100,
        totalRevenueImpact: recommendationPerformance.reduce((sum, algo) => sum + algo.businessImpact.revenueImpact, 0),
    };
}, [recommendationPerformance]);
const selectedUserData = useMemo(() => {
    return selectedUser ? userPreferences.find(u => u.userId === selectedUser) : null;
}, [selectedUser, userPreferences]);
return;
_jsx("div", { className: "preference-recommendation-analytics", children: _jsxs("div", { className: "analytics-header", children: [_jsxs("div", { className: "header-section", children: [_jsx("h2", { children: "User Preference & Recommendation Analytics" }), _jsx("div", { className: "key-metrics", children: preferenceStats && ()
                            <  >
                            (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Users Tracked" }), _jsx("div", { className: "metric-value", children: preferenceStats.totalUsers })] })
                                ,
                                    _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Avg Confidence" }), _jsxs("div", { className: "metric-value", children: [preferenceStats.avgConfidence, "%"] })] })) }), ")}", recommendationStats && ()
                        <  >
                        (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Avg CTR" }), _jsxs("div", { className: "metric-value", children: [recommendationStats.avgCTR, "%"] })] })
                            ,
                                _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Revenue Impact" }), _jsxs("div", { className: "metric-value", children: ["$", Math.round(recommendationStats.totalRevenueImpact).toLocaleString()] }), "}"] }))] }), ")}"] }) })
    ,
        _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "view-selector", children: [_jsx("button", { className: selectedView === 'preferences' ? 'active' : '', onClick: () => setSelectedView('preferences'), children: "User Preferences" }), _jsx("button", { className: selectedView === 'recommendations' ? 'active' : '', onClick: () => setSelectedView('recommendations'), children: "Recommendation Performance" }), _jsx("button", { className: selectedView === 'optimization' ? 'active' : '', onClick: () => setSelectedView('optimization'), children: "Optimization" })] }), _jsx("button", { className: "analyze-btn", onClick: handleAnalyzePreferences, disabled: loading, children: loading ? '🔍 Analyzing...' : '📊 Analyze Preferences' }), _jsx("button", { className: "export-btn", onClick: handleExport, children: "\uD83D\uDCCB Export Data" })] });
div >
    _jsxs("div", { className: "analytics-content", children: [loading && ()
                < div, " className=\"loading-overlay\">", _jsx("div", { className: "loading-spinner", children: "\uD83D\uDD0D" }), _jsx("div", { className: "loading-text", children: "Analyzing user preferences and recommendations..." })] });
{
    selectedView === 'preferences' && ()
        < div;
    className = "preferences-view" >
        { preferenceStats } && ()
        < div;
    className = "preference-distribution" >
        (_jsx("h3", { children: "Preference Category Distribution" })
            ,
                _jsx("div", { className: "distribution-chart", children: Object.entries(preferenceStats.categoryDistribution).map(([category, count]) => ()
                        < div, key = { category }, className = "category-bar" >
                        (_jsx("div", { className: "category-label", children: category.replace(/_/g, ' ') })
                            ,
                                _jsx("div", { className: "category-visual", children: _jsx("div", { className: "category-fill", style: { width: `${(count / preferenceStats.totalUsers) * 100}%` } }) })
                                    ,
                                        _jsxs("div", { className: "category-count", children: [count, " (", Math.round((count / preferenceStats.totalUsers) * 100), "%)"] }))) }));
}
div >
;
div >
;
_jsxs("div", { className: "users-preferences", children: [_jsx("h3", { children: "User Preference Profiles" }), _jsxs("div", { className: "user-list", children: [userPreferences.slice(0, 10).map(user => ()
                    < div, key = { user, : .userId }, className = {} `user-item ${selectedUser === user.userId ? 'active' : ''}`), "onClick=", () => setSelectedUser(user.userId), ">", _jsxs("div", { className: "user-header", children: [_jsx("div", { className: "user-id", children: user.userId.slice(-8) }), _jsxs("div", { className: "confidence-score", children: [Math.round(user.confidence.overall * 100), "% confidence"] })] }), _jsx("div", { className: "preference-summary", children: user.preferences.slice(0, 3).map((pref, index) => ()
                        < div, key = { index }, className = "preference-item" >
                        (_jsx("span", { className: "pref-category", children: pref.category })
                            ,
                                _jsxs("span", { className: "pref-weight", children: [Math.round(pref.weight * 100), "%"] }))) }), "))}"] })] });
div >
;
div >
    { selectedUserData } && ()
    < div;
className = "user-preference-details" >
    (_jsxs("h3", { children: ["Detailed Preferences: ", selectedUserData.userId.slice(-8)] })
        ,
            _jsxs("div", { className: "preference-breakdown", children: [_jsx("div", { className: "overall-confidence", children: _jsxs("h4", { children: ["Overall Confidence: ", Math.round(selectedUserData.confidence.overall * 100), "%"] }) }), _jsx("div", { className: "category-preferences", children: selectedUserData.preferences.map((pref, index) => ()
                            < div, key = { index }, className = "detailed-preference" >
                            (_jsxs("div", { className: "pref-header", children: [_jsx("span", { className: "pref-category", children: pref.category }), pref.subcategory && _jsxs("span", { className: "pref-subcategory", children: ["/ ", pref.subcategory] }), _jsx("span", { className: `pref-source ${pref.source}`, children: pref.source }), "}"] })
                                ,
                                    _jsxs("div", { className: "pref-value", children: ["Value: ", Array.isArray(pref.value) ? pref.value.join(', ') : pref.value] })
                                        ,
                                            _jsxs("div", { className: "pref-metrics", children: [_jsxs("span", { children: ["Weight: ", Math.round(pref.weight * 100), "%"] }), _jsxs("span", { children: ["Confidence: ", Math.round(pref.confidence * 100), "%"] }), _jsxs("span", { children: ["Updated: ", new Date(pref.timestamp).toLocaleDateString()] })] }))) }), "))}"] }));
div >
;
div >
;
div >
;
{
    selectedView === 'recommendations' && ()
        < div;
    className = "recommendations-view" >
        _jsxs("div", { className: "algorithm-performance", children: [_jsx("h3", { children: "Recommendation Algorithm Performance" }), _jsxs("div", { className: "algorithm-cards", children: [recommendationPerformance.map(algo => ()
                            < div, key = { algo, : .algorithmId }, className = "algorithm-card" >
                            (_jsx("div", { className: "algo-header", children: _jsxs("h4", { children: ["Algorithm ", algo.algorithmId.slice(-6)] }) })
                                ,
                                    _jsx("div", { className: "algo-metrics", children: algo.metrics.map((metric, index) => ()
                                            < div, key = { index }, className = "metric-row" >
                                            (_jsx("span", { className: "metric-name", children: metric.metric.replace(/_/g, ' ') })
                                                ,
                                                    _jsxs("span", { className: "metric-value", children: [metric.metric.includes('rate') ?
                                                                `${(metric.value * 100).toFixed(2)}%` : , "metric.value.toFixed(2)}"] })
                                                        ,
                                                            _jsxs("span", { className: `metric-change ${metric.change >= 0 ? 'positive' : 'negative'}`, children: ["}", metric.change >= 0 ? '+' : '', (metric.change * 100).toFixed(1), "%"] }))) }))), ")}"] }), _jsxs("div", { className: "business-impact", children: [_jsx("h5", { children: "Business Impact" }), _jsxs("div", { className: "impact-metrics", children: [_jsxs("div", { children: ["Revenue: $", Math.round(algo.businessImpact.revenueImpact).toLocaleString()] }), "}", _jsxs("div", { children: ["Engagement: +", algo.businessImpact.engagementIncrease.toFixed(1), "%"] }), _jsxs("div", { children: ["Retention: +", algo.businessImpact.retentionImprovement.toFixed(1), "%"] })] })] })] });
}
div >
;
div >
;
div >
;
{
    selectedView === 'optimization' && ()
        < div;
    className = "optimization-view" >
        _jsxs("div", { className: "optimization-placeholder", children: [_jsx("h3", { children: "Recommendation Optimization" }), _jsx("p", { children: "Advanced optimization features will be implemented here, including:" }), _jsxs("ul", { children: [_jsx("li", { children: "A/B testing framework for recommendation algorithms" }), _jsx("li", { children: "Multi-armed bandit optimization" }), _jsx("li", { children: "Real-time personalization tuning" }), _jsx("li", { children: "Recommendation diversity optimization" }), _jsx("li", { children: "Cold start problem solutions" }), _jsx("li", { children: "Collaborative filtering enhancements" })] })] });
    div >
    ;
}
div >
;
div >
;
;
;
;
export default UserPreferenceRecommendationAnalytics;
