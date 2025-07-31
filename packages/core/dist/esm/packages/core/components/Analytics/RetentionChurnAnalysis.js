import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * User Retention Analysis and Churn Prediction - Story 30.2 Task 10
 *
 * Advanced analytics system for tracking user retention patterns, predicting churn risk,
 * and providing actionable insights for user retention optimization strategies.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
// Mock data generators
const generateRetentionData = () => {
    const cohortSize = Math.floor(Math.random() * 1000) + 500;
    const acquisitionDate = Date.now() - Math.random() * 365 * 86400000;
    return {};
    cohortId: `cohort_${Math.random().toString(36).substr(2, 8)}`;
};
cohortName: `Cohort ${new Date(acquisitionDate).toLocaleDateString()}`;
cohortSize,
    acquisitionDate,
    retentionRates;
Array.from({ length: 12 }, (_, i) => {
    const period = i + 1;
    const baseRetention = Math.pow(0.85, period); // Natural decay;
    const retention = Math.max(0.1, baseRetention + (Math.random() - 0.5) * 0.1);
    return {
        period,
        retainedUsers: Math.floor(cohortSize * retention),
        retentionRate: retention,
        benchmark: Math.pow(0.8, period),
        variance: (Math.random() - 0.5) * 0.1,
    };
}),
    segments;
[];
;
;
const generateChurnPredictionData = () => {
    const churnProbability = Math.random();
    const riskLevel = churnProbability > 0.8 ? 'critical' :
        churnProbability > 0.6 ? 'high' :
            churnProbability > 0.3 ? 'medium' : 'low';
    return {
        userId: `user_${Math.random().toString(36).substr(2, 8)}`
    };
};
churnProbability,
    riskLevel,
    riskFactors;
[,
    {
        factor: 'declining_engagement',
        impact: Math.random() * 0.4 + 0.1,
        trend: 'increasing',
        daysActive: Math.floor(Math.random() * 30) + 1,
    },
    {
        factor: 'reduced_session_frequency',
        impact: Math.random() * 0.3 + 0.1,
        trend: 'stable',
        daysActive: Math.floor(Math.random() * 14) + 1
    }],
    predictions;
[,
    {
        timeHorizon: 7,
        probability: churnProbability * 0.3,
        confidence: Math.random() * 0.3 + 0.7,
        model: 'RandomForest',
    },
    {
        timeHorizon: 30,
        probability: churnProbability,
        confidence: Math.random() * 0.3 + 0.7,
        model: 'RandomForest',
    },
    {
        timeHorizon: 90,
        probability: Math.min(1, churnProbability * 1.2),
        confidence: Math.random() * 0.2 + 0.6,
        model: 'RandomForest'
    }],
    recommendedActions;
[,
    {
        action: 'send_re_engagement_email',
        priority: riskLevel === 'critical' ? 'high' : 'medium',
        expectedImpact: Math.random() * 0.3 + 0.1,
        cost: 'low',
        timeline: '1-2 days',
    },
    {
        action: 'offer_personalized_content',
        priority: 'medium',
        expectedImpact: Math.random() * 0.2 + 0.15,
        cost: 'medium',
        timeline: '3-5 days'
    }];
;
;
export const RetentionChurnAnalysis = ({
    analyticsInfrastructure,
    retentionConfig,
    churnPredictionConfig,
    onChurnAlert,
    onRetentionInsight,
    onExport
});
{
    const [retentionData, setRetentionData] = useState([]);
    const [churnPredictions, setChurnPredictions] = useState([]);
    const [selectedView, setSelectedView] = useState('retention');
    const [selectedCohort, setSelectedCohort] = useState(null);
    const [loading, setLoading] = useState(false);
    // Generate mock data
    useEffect(() => {
        const mockRetentionData = Array.from({ length: 8 }, generateRetentionData);
        setRetentionData(mockRetentionData);
        const mockChurnData = Array.from({ length: 50 }, generateChurnPredictionData);
        setChurnPredictions(mockChurnData);
    }, []);
    const handleAnalyzeChurn = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (onChurnAlert) {
                onChurnAlert({});
                alertId: `alert_${Math.random().toString(36).substr(2, 8)}`;
            }
        }, severity, 'high', type, 'high_risk_users', message, `${churnPredictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length} users at high churn risk`);
    });
}
timestamp: Date.now(),
    affectedUsers;
churnPredictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
    recommendedActions;
['Immediate intervention', 'Personalized outreach'];
;
1500;
;
[churnPredictions, onChurnAlert];
;
const handleExport = useCallback(() => {
    if (onExport) {
        const exportData = {
            retentionData,
            churnPredictions,
            analysisTimestamp: Date.now(),
            metadata: {
                totalCohorts: retentionData.length,
                totalUsers: churnPredictions.length,
                highRiskUsers: churnPredictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
                averageRetention30d: retentionData.reduce((sum, cohort) => {
                    const day30 = cohort.retentionRates.find(r => r.period === 30);
                    return sum + (day30?.retentionRate || 0);
                }, 0) / retentionData.length
            } }, [retentionData, churnPredictions, onExport];
    }
});
const retentionStats = useMemo(() => {
    if (!retentionData.length)
        return null;
    const day1Retention = retentionData.reduce((sum, cohort) => {
        const day1 = cohort.retentionRates.find(r => r.period === 1);
        return sum + (day1?.retentionRate || 0);
    }, 0) / retentionData.length;
    const day30Retention = retentionData.reduce((sum, cohort) => {
        const day30 = cohort.retentionRates.find(r => r.period === 30);
        return sum + (day30?.retentionRate || 0);
    }, 0) / retentionData.length;
    return {
        day1Retention: Math.round(day1Retention * 100),
        day30Retention: Math.round(day30Retention * 100),
        totalCohorts: retentionData.length,
        averageCohortSize: Math.round(retentionData.reduce((sum, c) => sum + c.cohortSize, 0) / retentionData.length),
    };
}, [retentionData]);
const churnStats = useMemo(() => {
    if (!churnPredictions.length)
        return null;
    const riskDistribution = churnPredictions.reduce((acc, user) => {
        acc[user.riskLevel] = (acc[user.riskLevel] || 0) + 1;
        return acc;
    }, {});
    return {
        totalUsers: churnPredictions.length,
        highRisk: (riskDistribution.high || 0) + (riskDistribution.critical || 0),
        averageChurnProbability: Math.round(),
        churnPredictions, : .reduce((sum), p)
    };
});
sum + p.churnProbability, 0;
/ churnPredictions.length * 100;
riskDistribution;
;
[churnPredictions];
;
const selectedCohortData = useMemo(() => {
    return selectedCohort ? retentionData.find(c => c.cohortId === selectedCohort) : null;
}, [selectedCohort, retentionData]);
return;
_jsx("div", { className: "retention-churn-analysis", children: _jsxs("div", { className: "analysis-header", children: [_jsxs("div", { className: "header-section", children: [_jsx("h2", { children: "Retention Analysis & Churn Prediction" }), _jsx("div", { className: "key-metrics", children: retentionStats && ()
                            <  >
                            (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Day 1 Retention" }), _jsxs("div", { className: "metric-value", children: [retentionStats.day1Retention, "%"] })] })
                                ,
                                    _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Day 30 Retention" }), _jsxs("div", { className: "metric-value", children: [retentionStats.day30Retention, "%"] })] })) }), ")}", churnStats && ()
                        <  >
                        (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "High Risk Users" }), _jsx("div", { className: "metric-value critical", children: churnStats.highRisk })] })
                            ,
                                _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-label", children: "Avg Churn Risk" }), _jsxs("div", { className: "metric-value", children: [churnStats.averageChurnProbability, "%"] })] }))] }), ")}"] }) })
    ,
        _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "view-selector", children: [_jsx("button", { className: selectedView === 'retention' ? 'active' : '', onClick: () => setSelectedView('retention'), children: "Retention Analysis" }), _jsx("button", { className: selectedView === 'churn' ? 'active' : '', onClick: () => setSelectedView('churn'), children: "Churn Prediction" }), _jsx("button", { className: selectedView === 'insights' ? 'active' : '', onClick: () => setSelectedView('insights'), children: "Insights" })] }), _jsx("button", { className: "analyze-btn", onClick: handleAnalyzeChurn, disabled: loading, children: loading ? '🔮 Analyzing...' : '🎯 Analyze Churn' }), _jsx("button", { className: "export-btn", onClick: handleExport, children: "\uD83D\uDCCA Export Analysis" })] });
div >
    _jsxs("div", { className: "analysis-content", children: [loading && ()
                < div, " className=\"loading-overlay\">", _jsx("div", { className: "loading-spinner", children: "\uD83D\uDD2E" }), _jsx("div", { className: "loading-text", children: "Analyzing retention and churn patterns..." })] });
{
    selectedView === 'retention' && ()
        < div;
    className = "retention-view" >
        _jsxs("div", { className: "cohorts-list", children: [_jsx("h3", { children: "Cohort Retention Analysis" }), _jsxs("div", { className: "cohort-items", children: [retentionData.map(cohort => ()
                            < div, key = { cohort, : .cohortId }, className = {} `cohort-item ${selectedCohort === cohort.cohortId ? 'active' : ''}`), "onClick=", () => setSelectedCohort(cohort.cohortId), ">", _jsxs("div", { className: "cohort-header", children: [_jsx("div", { className: "cohort-name", children: cohort.cohortName }), _jsxs("div", { className: "cohort-size", children: [cohort.cohortSize, " users"] })] }), _jsxs("div", { className: "retention-summary", children: [_jsxs("div", { className: "retention-item", children: [_jsx("span", { children: "Day 1:" }), _jsxs("span", { children: [Math.round((cohort.retentionRates[0]?.retentionRate || 0) * 100), "%"] })] }), _jsxs("div", { className: "retention-item", children: [_jsx("span", { children: "Day 7:" }), _jsxs("span", { children: [Math.round((cohort.retentionRates[6]?.retentionRate || 0) * 100), "%"] })] }), _jsxs("div", { className: "retention-item", children: [_jsx("span", { children: "Day 30:" }), _jsxs("span", { children: [Math.round((cohort.retentionRates.find(r => r.period === 30)?.retentionRate || 0) * 100), "%"] })] })] })] }), "))}"] });
    div >
        { selectedCohortData } && ()
        < div;
    className = "cohort-details" >
        (_jsxs("h3", { children: ["Retention Curve: ", selectedCohortData.cohortName] })
            ,
                _jsx("div", { className: "retention-chart", children: _jsxs("div", { className: "chart-placeholder", children: ["\uD83D\uDCC8 Retention curve chart will be rendered here", _jsx("br", {}), "Cohort size: ", selectedCohortData.cohortSize, " users", _jsx("br", {}), "Acquisition: ", new Date(selectedCohortData.acquisitionDate).toLocaleDateString()] }) })
                    ,
                        _jsxs("div", { className: "retention-table", children: [_jsx("h4", { children: "Retention Breakdown" }), _jsxs("div", { className: "table-header", children: [_jsx("div", { children: "Period" }), _jsx("div", { children: "Retained Users" }), _jsx("div", { children: "Retention Rate" }), _jsx("div", { children: "vs Benchmark" })] }), selectedCohortData.retentionRates.slice(0, 8).map(rate => ()
                                    < div, key = { rate, : .period }, className = "table-row" >
                                    (_jsxs("div", { children: ["Day ", rate.period] })
                                        ,
                                            _jsx("div", { children: rate.retainedUsers })
                                                ,
                                                    _jsxs("div", { children: [Math.round(rate.retentionRate * 100), "%"] })
                                                        ,
                                                            _jsxs("div", { className: rate.retentionRate > rate.benchmark ? 'positive' : 'negative', children: [rate.retentionRate > rate.benchmark ? '+' : '', Math.round((rate.retentionRate - rate.benchmark) * 100), "%"] })))] }));
}
div >
;
div >
;
div >
;
{
    selectedView === 'churn' && ()
        < div;
    className = "churn-view" >
        _jsxs("div", { className: "risk-distribution", children: [_jsx("h3", { children: "Churn Risk Distribution" }), _jsxs("div", { className: "distribution-chart", children: [churnStats && Object.entries(churnStats.riskDistribution).map(([level, count]) => ()
                            < div, key = { level }, className = {} `risk-bar ${level}`), ">}", _jsx("div", { className: "risk-label", children: level.toUpperCase() }), _jsx("div", { className: "risk-visual", children: _jsx("div", { className: "risk-fill", style: { width: `${(count / churnStats.totalUsers) * 100}%` } }) }), _jsxs("div", { className: "risk-count", children: [count, " (", Math.round((count / churnStats.totalUsers) * 100), "%)"] })] }), "))}"] });
    div >
        _jsxs("div", { className: "high-risk-users", children: [_jsx("h3", { children: "High Risk Users" }), _jsxs("div", { className: "risk-users-list", children: [churnPredictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').slice(0, 10).map(user => ()
                            < div, key = { user, : .userId }, className = {} `risk-user ${user.riskLevel}`), ">}", _jsxs("div", { className: "user-header", children: [_jsx("div", { className: "user-id", children: user.userId.slice(-8) }), _jsx("div", { className: "risk-level", children: user.riskLevel }), _jsxs("div", { className: "churn-probability", children: [Math.round(user.churnProbability * 100), "%"] })] }), _jsx("div", { className: "risk-factors", children: user.riskFactors.slice(0, 2).map((factor, index) => ()
                                < div, key = { index }, className = "risk-factor" >
                                (_jsx("span", { className: "factor-name", children: factor.factor.replace(/_/g, ' ') })
                                    ,
                                        _jsxs("span", { className: "factor-impact", children: [Math.round(factor.impact * 100), "% impact"] }))) }), "))}"] }), _jsxs("div", { className: "recommended-actions", children: [user.recommendedActions.slice(0, 1).map((action, index) => ()
                            < div, key = { index }, className = {} `action ${action.priority}`), ">}", action.action.replace(/_/g, ' '), " (Impact: ", Math.round(action.expectedImpact * 100), "%)"] }), "))}"] });
    div >
    ;
}
div >
;
div >
;
div >
;
{
    selectedView === 'insights' && ()
        < div;
    className = "insights-view" >
        _jsxs("div", { className: "insights-placeholder", children: [_jsx("h3", { children: "Retention & Churn Insights" }), _jsx("p", { children: "Advanced insights will be displayed here, including:" }), _jsxs("ul", { children: [_jsx("li", { children: "Retention trend analysis and forecasting" }), _jsx("li", { children: "Churn risk factor correlation analysis" }), _jsx("li", { children: "Intervention effectiveness tracking" }), _jsx("li", { children: "Cohort comparison and benchmarking" }), _jsx("li", { children: "Predictive model performance metrics" }), _jsx("li", { children: "Actionable recommendations for retention improvement" })] })] });
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
export default RetentionChurnAnalysis;
