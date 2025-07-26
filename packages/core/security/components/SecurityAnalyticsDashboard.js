import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Security Analytics Dashboard
 * Task T-1752989143998-695: Design security event logging analytics
 *
 * Executive-level security analytics dashboard with real-time threat monitoring,
 * behavioral analysis, and predictive security insights for Wild Construct platform.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { RiskLevel, ThreatCategory } from '../SecurityEventAnalytics';
/**
 * Comprehensive security analytics dashboard for executive and operational use
 */
export const SecurityAnalyticsDashboard = ({ analytics, theme = 'cinema', refreshInterval = 5, executiveMode = false, allowedInsights, onThreatDetected, onCriticalAlert }) => {
    const [state, setState] = useState({
        summary: null,
        insights: [],
        patterns: [],
        isLoading: true,
        lastUpdate: null,
        selectedTimeframe: '24h',
        selectedCategory: 'all',
        alertsEnabled: true
    });
    // Theme configuration
    const themeStyles = useMemo(() => {
        const themes = {
            light: {
                background: '#ffffff',
                secondary: '#f8fafc',
                tertiary: '#f1f5f9',
                border: '#e2e8f0',
                text: '#1e293b',
                textSecondary: '#64748b',
                textMuted: '#94a3b8',
                primary: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
                critical: '#dc2626'
            },
            dark: {
                background: '#0f172a',
                secondary: '#1e293b',
                tertiary: '#334155',
                border: '#475569',
                text: '#f1f5f9',
                textSecondary: '#cbd5e1',
                textMuted: '#94a3b8',
                primary: '#60a5fa',
                success: '#34d399',
                warning: '#fbbf24',
                danger: '#f87171',
                critical: '#ef4444'
            },
            cinema: {
                background: '#0d1117',
                secondary: '#161b22',
                tertiary: '#21262d',
                border: '#30363d',
                text: '#f0f6fc',
                textSecondary: '#c9d1d9',
                textMuted: '#8b949e',
                primary: '#ff7c00',
                success: '#238636',
                warning: '#d29922',
                danger: '#da3633',
                critical: '#f85149'
            }
        };
        return themes[theme];
    }, [theme]);
    // Load analytics data
    const loadAnalyticsData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const timeframe = getTimeframeRange(state.selectedTimeframe);
            const summary = await analytics.analyzeSecurityEvents(timeframe);
            let insights = analytics.getSecurityInsights(state.selectedCategory === 'all' ? undefined : state.selectedCategory, undefined, 100);
            // Filter insights based on allowed categories
            if (allowedInsights && allowedInsights.length > 0) {
                insights = insights.filter(insight => allowedInsights.includes(insight.category));
            }
            const patterns = analytics.getSecurityPatterns(state.selectedCategory === 'all' ? undefined : state.selectedCategory);
            // Check for critical alerts
            const criticalInsights = insights.filter(insight => insight.severity === RiskLevel.CRITICAL);
            if (criticalInsights.length > 0 && state.alertsEnabled) {
                criticalInsights.forEach(insight => {
                    onCriticalAlert?.(insight);
                });
            }
            // Check for new threat patterns
            const highRiskPatterns = patterns.filter(pattern => pattern.riskScore > 80);
            if (highRiskPatterns.length > 0) {
                highRiskPatterns.forEach(pattern => {
                    onThreatDetected?.(pattern);
                });
            }
            setState(prev => ({
                ...prev,
                summary,
                insights,
                patterns,
                isLoading: false,
                lastUpdate: new Date()
            }));
        }
        catch (error) {
            console.error('Failed to load analytics data:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [analytics, state.selectedTimeframe, state.selectedCategory, state.alertsEnabled, allowedInsights, onCriticalAlert, onThreatDetected]);
    // Auto-refresh data
    useEffect(() => {
        loadAnalyticsData();
        const interval = setInterval(loadAnalyticsData, refreshInterval * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadAnalyticsData, refreshInterval]);
    // Handle timeframe change
    const handleTimeframeChange = useCallback((timeframe) => {
        setState(prev => ({ ...prev, selectedTimeframe: timeframe }));
    }, []);
    // Handle category change
    const handleCategoryChange = useCallback((category) => {
        setState(prev => ({ ...prev, selectedCategory: category }));
    }, []);
    // Risk level color mapping
    const getRiskColor = useCallback((level) => {
        switch (level) {
            case RiskLevel.CRITICAL: return themeStyles.critical;
            case RiskLevel.HIGH: return themeStyles.danger;
            case RiskLevel.MEDIUM: return themeStyles.warning;
            case RiskLevel.LOW: return themeStyles.success;
            default: return themeStyles.textMuted;
        }
    }, [themeStyles]);
    // Format numbers for display
    const formatNumber = useCallback((num) => {
        if (num >= 1000000)
            return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000)
            return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }, []);
    if (state.isLoading && !state.summary) {
        return (_jsx("div", { style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                background: themeStyles.background,
                color: themeStyles.text,
                fontFamily: 'Inter, system-ui, sans-serif'
            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                            width: '40px',
                            height: '40px',
                            border: `4px solid ${themeStyles.border}`,
                            borderTop: `4px solid ${themeStyles.primary}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        } }), _jsx("div", { children: "Loading Security Analytics..." })] }) }));
    }
    return (_jsxs("div", { style: {
            background: themeStyles.background,
            color: themeStyles.text,
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '24px',
            minHeight: '100vh'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    paddingBottom: '16px',
                    borderBottom: `1px solid ${themeStyles.border}`
                }, children: [_jsxs("div", { children: [_jsx("h1", { style: {
                                    margin: '0 0 8px 0',
                                    fontSize: executiveMode ? '32px' : '28px',
                                    fontWeight: 700,
                                    color: themeStyles.primary
                                }, children: "\uD83D\uDEE1\uFE0F Security Analytics Dashboard" }), _jsxs("p", { style: {
                                    margin: 0,
                                    color: themeStyles.textSecondary,
                                    fontSize: '16px'
                                }, children: [executiveMode ? 'Executive Security Overview' : 'Operational Security Monitoring', " \u2022 Wild Construct Platform", state.lastUpdate && (_jsxs("span", { style: { marginLeft: '16px', fontSize: '14px' }, children: ["Last updated: ", state.lastUpdate.toLocaleTimeString()] }))] })] }), _jsxs("div", { style: { display: 'flex', gap: '16px', alignItems: 'center' }, children: [_jsxs("select", { value: state.selectedTimeframe, onChange: (e) => handleTimeframeChange(e.target.value), style: {
                                    background: themeStyles.secondary,
                                    border: `1px solid ${themeStyles.border}`,
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    color: themeStyles.text,
                                    fontSize: '14px'
                                }, children: [_jsx("option", { value: "1h", children: "Last Hour" }), _jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last 7 Days" }), _jsx("option", { value: "30d", children: "Last 30 Days" })] }), _jsxs("select", { value: state.selectedCategory, onChange: (e) => handleCategoryChange(e.target.value), style: {
                                    background: themeStyles.secondary,
                                    border: `1px solid ${themeStyles.border}`,
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    color: themeStyles.text,
                                    fontSize: '14px'
                                }, children: [_jsx("option", { value: "all", children: "All Categories" }), Object.values(ThreatCategory).map(category => (_jsx("option", { value: category, children: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }, category)))] }), _jsxs("button", { onClick: loadAnalyticsData, disabled: state.isLoading, style: {
                                    background: state.isLoading ? themeStyles.border : themeStyles.primary,
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    color: themeStyles.background,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: state.isLoading ? 'not-allowed' : 'pointer',
                                    opacity: state.isLoading ? 0.6 : 1
                                }, children: [state.isLoading ? '🔄' : '↻', " Refresh"] })] })] }), state.summary && (_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: executiveMode
                        ? 'repeat(auto-fit, minmax(250px, 1fr))'
                        : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }, children: [_jsxs("div", { style: {
                            background: themeStyles.secondary,
                            border: `1px solid ${themeStyles.border}`,
                            borderRadius: '12px',
                            padding: '20px',
                            borderLeft: `4px solid ${getRiskColor(state.summary.overallRisk.level)}`
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }, children: [_jsx("h3", { style: { margin: 0, fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }, children: "OVERALL RISK" }), _jsx("span", { style: {
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                            background: `${getRiskColor(state.summary.overallRisk.level)}20`,
                                            color: getRiskColor(state.summary.overallRisk.level),
                                            borderRadius: '4px',
                                            fontWeight: 600
                                        }, children: state.summary.overallRisk.trend.toUpperCase() })] }), _jsx("div", { style: {
                                    fontSize: executiveMode ? '36px' : '32px',
                                    fontWeight: 800,
                                    color: getRiskColor(state.summary.overallRisk.level),
                                    marginBottom: '8px'
                                }, children: state.summary.overallRisk.level.toUpperCase() }), _jsxs("div", { style: {
                                    fontSize: '14px',
                                    color: themeStyles.textSecondary
                                }, children: ["Score: ", state.summary.overallRisk.score, "/100"] })] }), _jsxs("div", { style: {
                            background: themeStyles.secondary,
                            border: `1px solid ${themeStyles.border}`,
                            borderRadius: '12px',
                            padding: '20px'
                        }, children: [_jsx("h3", { style: { margin: '0 0 12px 0', fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }, children: "SECURITY EVENTS" }), _jsx("div", { style: {
                                    fontSize: executiveMode ? '36px' : '32px',
                                    fontWeight: 800,
                                    color: themeStyles.text,
                                    marginBottom: '8px'
                                }, children: formatNumber(state.summary.eventVolume.total) }), _jsxs("div", { style: {
                                    fontSize: '14px',
                                    color: themeStyles.textSecondary,
                                    display: 'flex',
                                    gap: '12px'
                                }, children: [_jsxs("span", { children: ["Critical: ", state.summary.eventVolume.bySeverity.critical || 0] }), _jsxs("span", { children: ["High: ", state.summary.eventVolume.bySeverity.high || 0] })] })] }), _jsxs("div", { style: {
                            background: themeStyles.secondary,
                            border: `1px solid ${themeStyles.border}`,
                            borderRadius: '12px',
                            padding: '20px'
                        }, children: [_jsx("h3", { style: { margin: '0 0 12px 0', fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }, children: "ACTIVE THREATS" }), _jsx("div", { style: {
                                    fontSize: executiveMode ? '36px' : '32px',
                                    fontWeight: 800,
                                    color: state.summary.threatLandscape.activeThreats > 5 ? themeStyles.danger : themeStyles.text,
                                    marginBottom: '8px'
                                }, children: state.summary.threatLandscape.activeThreats }), _jsxs("div", { style: {
                                    fontSize: '14px',
                                    color: themeStyles.textSecondary
                                }, children: ["New: ", state.summary.threatLandscape.newPatterns] })] }), _jsxs("div", { style: {
                            background: themeStyles.secondary,
                            border: `1px solid ${themeStyles.border}`,
                            borderRadius: '12px',
                            padding: '20px'
                        }, children: [_jsx("h3", { style: { margin: '0 0 12px 0', fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }, children: "SECURITY POSTURE" }), _jsxs("div", { style: {
                                    fontSize: executiveMode ? '36px' : '32px',
                                    fontWeight: 800,
                                    color: state.summary.systemHealth.securityPosture >= 80 ? themeStyles.success :
                                        state.summary.systemHealth.securityPosture >= 60 ? themeStyles.warning : themeStyles.danger,
                                    marginBottom: '8px'
                                }, children: [state.summary.systemHealth.securityPosture, "%"] }), _jsxs("div", { style: {
                                    fontSize: '14px',
                                    color: themeStyles.textSecondary
                                }, children: ["Compliance: ", state.summary.systemHealth.complianceScore, "%"] })] })] })), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: executiveMode ? '2fr 1fr' : '1fr 1fr',
                    gap: '24px'
                }, children: [_jsxs("div", { style: {
                            background: themeStyles.secondary,
                            border: `1px solid ${themeStyles.border}`,
                            borderRadius: '12px',
                            padding: '24px'
                        }, children: [_jsxs("h3", { style: {
                                    margin: '0 0 20px 0',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: themeStyles.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }, children: ["\uD83C\uDFAF Active Threat Patterns", _jsx("span", { style: {
                                            fontSize: '12px',
                                            background: state.patterns.length > 0 ? themeStyles.danger + '20' : themeStyles.success + '20',
                                            color: state.patterns.length > 0 ? themeStyles.danger : themeStyles.success,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: 600
                                        }, children: state.patterns.length })] }), state.patterns.length === 0 ? (_jsxs("div", { style: {
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: themeStyles.textMuted
                                }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\u2705" }), _jsx("div", { children: "No active threat patterns detected" })] })) : (_jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: state.patterns.slice(0, executiveMode ? 5 : 10).map(pattern => (_jsxs("div", { style: {
                                        background: themeStyles.tertiary,
                                        border: `1px solid ${themeStyles.border}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        borderLeft: `4px solid ${pattern.riskScore >= 80 ? themeStyles.critical :
                                            pattern.riskScore >= 60 ? themeStyles.danger :
                                                pattern.riskScore >= 40 ? themeStyles.warning : themeStyles.success}`
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '8px'
                                            }, children: [_jsx("h4", { style: {
                                                        margin: 0,
                                                        fontSize: '16px',
                                                        fontWeight: 600,
                                                        color: themeStyles.text
                                                    }, children: pattern.name }), _jsxs("div", { style: {
                                                        display: 'flex',
                                                        gap: '8px',
                                                        alignItems: 'center'
                                                    }, children: [_jsx("span", { style: {
                                                                fontSize: '12px',
                                                                background: `${pattern.riskScore >= 80 ? themeStyles.critical :
                                                                    pattern.riskScore >= 60 ? themeStyles.danger :
                                                                        pattern.riskScore >= 40 ? themeStyles.warning : themeStyles.success}20`,
                                                                color: pattern.riskScore >= 80 ? themeStyles.critical :
                                                                    pattern.riskScore >= 60 ? themeStyles.danger :
                                                                        pattern.riskScore >= 40 ? themeStyles.warning : themeStyles.success,
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontWeight: 600
                                                            }, children: pattern.riskScore }), _jsxs("span", { style: {
                                                                fontSize: '12px',
                                                                color: themeStyles.textMuted
                                                            }, children: [pattern.occurrences, "x"] })] })] }), _jsx("p", { style: {
                                                margin: '0 0 12px 0',
                                                fontSize: '14px',
                                                color: themeStyles.textSecondary,
                                                lineHeight: 1.4
                                            }, children: pattern.description }), _jsx("div", { style: {
                                                display: 'flex',
                                                gap: '8px',
                                                flexWrap: 'wrap'
                                            }, children: pattern.indicators.slice(0, 3).map(indicator => (_jsx("span", { style: {
                                                    fontSize: '12px',
                                                    background: themeStyles.primary + '20',
                                                    color: themeStyles.primary,
                                                    padding: '2px 6px',
                                                    borderRadius: '4px'
                                                }, children: indicator }, indicator))) })] }, pattern.id))) }))] }), _jsxs("div", { style: {
                            background: themeStyles.secondary,
                            border: `1px solid ${themeStyles.border}`,
                            borderRadius: '12px',
                            padding: '24px'
                        }, children: [_jsxs("h3", { style: {
                                    margin: '0 0 20px 0',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: themeStyles.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }, children: ["\uD83D\uDCA1 Security Insights", _jsx("span", { style: {
                                            fontSize: '12px',
                                            background: themeStyles.primary + '20',
                                            color: themeStyles.primary,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: 600
                                        }, children: state.insights.length })] }), state.insights.length === 0 ? (_jsxs("div", { style: {
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: themeStyles.textMuted
                                }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDD0D" }), _jsx("div", { children: "Analyzing security patterns..." })] })) : (_jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: state.insights.slice(0, executiveMode ? 3 : 8).map(insight => (_jsxs("div", { style: {
                                        background: themeStyles.tertiary,
                                        border: `1px solid ${themeStyles.border}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        borderLeft: `4px solid ${getRiskColor(insight.severity)}`
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '8px'
                                            }, children: [_jsxs("h4", { style: {
                                                        margin: 0,
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: themeStyles.text
                                                    }, children: [getInsightIcon(insight.type), " ", insight.title] }), _jsx("span", { style: {
                                                        fontSize: '12px',
                                                        background: `${getRiskColor(insight.severity)}20`,
                                                        color: getRiskColor(insight.severity),
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontWeight: 600
                                                    }, children: insight.severity.toUpperCase() })] }), _jsx("p", { style: {
                                                margin: '0 0 12px 0',
                                                fontSize: '13px',
                                                color: themeStyles.textSecondary,
                                                lineHeight: 1.4
                                            }, children: insight.description }), !executiveMode && insight.recommendations.immediate.length > 0 && (_jsxs("div", { style: { marginTop: '8px' }, children: [_jsx("div", { style: {
                                                        fontSize: '12px',
                                                        color: themeStyles.textMuted,
                                                        marginBottom: '4px'
                                                    }, children: "Immediate Actions:" }), _jsx("ul", { style: {
                                                        margin: 0,
                                                        paddingLeft: '16px',
                                                        fontSize: '12px',
                                                        color: themeStyles.textSecondary
                                                    }, children: insight.recommendations.immediate.slice(0, 2).map((rec, index) => (_jsx("li", { children: rec }, index))) })] }))] }, insight.id))) }))] })] }), executiveMode && state.summary && (_jsxs("div", { style: {
                    marginTop: '32px',
                    background: themeStyles.secondary,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: '12px',
                    padding: '24px'
                }, children: [_jsx("h3", { style: {
                            margin: '0 0 20px 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: themeStyles.text
                        }, children: "\uD83D\uDCCB Executive Summary" }), _jsxs("div", { style: {
                            fontSize: '16px',
                            lineHeight: 1.6,
                            color: themeStyles.textSecondary,
                            marginBottom: '20px'
                        }, children: ["Current security posture shows ", _jsx("strong", { style: { color: getRiskColor(state.summary.overallRisk.level) }, children: state.summary.overallRisk.level.toUpperCase() }), " risk level with ", _jsx("strong", { children: formatNumber(state.summary.eventVolume.total) }), " security events analyzed.", _jsxs("strong", { children: [" ", state.summary.threatLandscape.activeThreats] }), " active threat patterns identified.", _jsxs("strong", { children: [" ", state.summary.userBehavior.highRiskUsers.length] }), " users require elevated monitoring."] }), (state.insights.filter(i => i.severity === RiskLevel.CRITICAL).length > 0 ||
                        state.summary.systemHealth.securityPosture < 70) && (_jsxs("div", { style: {
                            background: themeStyles.tertiary,
                            borderLeft: `4px solid ${themeStyles.critical}`,
                            padding: '16px',
                            borderRadius: '8px'
                        }, children: [_jsx("h4", { style: { margin: '0 0 12px 0', color: themeStyles.critical, fontSize: '16px' }, children: "\uD83D\uDEA8 Immediate Action Required" }), _jsxs("ul", { style: { margin: 0, paddingLeft: '20px', color: themeStyles.textSecondary }, children: [state.insights.filter(i => i.severity === RiskLevel.CRITICAL).length > 0 && (_jsxs("li", { children: ["Address ", state.insights.filter(i => i.severity === RiskLevel.CRITICAL).length, " critical security insights"] })), state.summary.systemHealth.securityPosture < 70 && (_jsxs("li", { children: ["Improve security posture (currently ", state.summary.systemHealth.securityPosture, "%)"] })), state.summary.threatLandscape.activeThreats > 5 && (_jsxs("li", { children: ["Mitigate ", state.summary.threatLandscape.activeThreats, " active threat patterns"] }))] })] }))] })), _jsx("style", { children: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        ` })] }));
};
// Helper functions
function getTimeframeRange(timeframe) {
    const end = new Date();
    const start = new Date();
    switch (timeframe) {
        case '1h':
            start.setHours(start.getHours() - 1);
            break;
        case '24h':
            start.setHours(start.getHours() - 24);
            break;
        case '7d':
            start.setDate(start.getDate() - 7);
            break;
        case '30d':
            start.setDate(start.getDate() - 30);
            break;
    }
    return { start, end };
}
function getInsightIcon(type) {
    switch (type) {
        case 'trend': return '📈';
        case 'anomaly': return '🔍';
        case 'prediction': return '🔮';
        case 'recommendation': return '💡';
        default: return '📊';
    }
}
export default SecurityAnalyticsDashboard;
