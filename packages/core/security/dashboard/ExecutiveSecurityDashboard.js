import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Executive Security Dashboard
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * High-level executive dashboard providing C-level executives with
 * strategic security posture overview, risk metrics, and business
 * impact assessments for informed decision-making.
 *
 * Features:
 * - Executive-friendly KPI visualization
 * - Business risk impact scoring
 * - Compliance status overview
 * - Security investment ROI
 * - Incident cost analysis
 * - Trend analysis and forecasting
 * - Board-ready reporting
 *
 * Target Users:
 * - Chief Information Security Officer (CISO)
 * - Chief Executive Officer (CEO)
 * - Chief Technology Officer (CTO)
 * - Chief Risk Officer (CRO)
 * - Board of Directors
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardTheme } from './SecurityDashboardFramework';
/**
 * Executive Security Dashboard Component
 */
export const ExecutiveSecurityDashboard = ({ metrics, insights, theme = DashboardTheme.CINEMA, refreshInterval = 15, showFinancials = true, showBenchmarks = true, onInsightAction, onDrillDown }) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('90d');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    // Theme configuration
    const themeStyles = useMemo(() => {
        const themes = {
            light: {
                background: '#ffffff',
                surface: '#f8fafc',
                border: '#e2e8f0',
                text: '#1e293b',
                textSecondary: '#64748b',
                primary: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                critical: '#dc2626',
                accent: '#8b5cf6'
            },
            dark: {
                background: '#0f172a',
                surface: '#1e293b',
                border: '#334155',
                text: '#f1f5f9',
                textSecondary: '#cbd5e1',
                primary: '#60a5fa',
                success: '#34d399',
                warning: '#fbbf24',
                error: '#f87171',
                critical: '#ef4444',
                accent: '#a78bfa'
            },
            cinema: {
                background: '#0a0a0a',
                surface: '#1a1a1a',
                border: '#333333',
                text: '#f5f5f5',
                textSecondary: '#d4d4d4',
                primary: '#fbbf24',
                success: '#22d3ee',
                warning: '#f59e0b',
                error: '#ef4444',
                critical: '#dc2626',
                accent: '#c084fc'
            }
        };
        return themes[theme] || themes.cinema;
    }, [theme]);
    // Auto-refresh logic
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                setLastUpdate(new Date());
            }, refreshInterval * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);
    // Get risk level color
    const getRiskColor = useCallback((level) => {
        switch (level) {
            case 'low': return themeStyles.success;
            case 'medium': return themeStyles.warning;
            case 'high': return themeStyles.error;
            case 'critical': return themeStyles.critical;
            default: return themeStyles.textSecondary;
        }
    }, [themeStyles]);
    // Get trend icon
    const getTrendIcon = useCallback((trend) => {
        switch (trend) {
            case 'improving':
            case 'decreasing': return '📈';
            case 'stable': return '➡️';
            case 'declining':
            case 'increasing': return '📉';
            default: return '❓';
        }
    }, []);
    // Format currency
    const formatCurrency = useCallback((amount) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        }
        else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        else {
            return `$${amount.toFixed(0)}`;
        }
    }, []);
    // Render KPI card
    const renderKPICard = (title, value, subtitle, trend, onClick) => (_jsxs("div", { onClick: onClick, style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: '12px',
            padding: '24px',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            ':hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } : {}
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                }, children: [_jsx("h3", { style: {
                            margin: '0',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: themeStyles.textSecondary
                        }, children: title }), trend && (_jsx("span", { style: { fontSize: '16px' }, children: getTrendIcon(trend) }))] }), _jsx("div", { style: {
                    fontSize: '32px',
                    fontWeight: 700,
                    color: themeStyles.text,
                    lineHeight: 1,
                    marginBottom: subtitle ? '4px' : '0'
                }, children: value }), subtitle && (_jsx("div", { style: {
                    fontSize: '12px',
                    color: themeStyles.textSecondary
                }, children: subtitle }))] }));
    // Render security score gauge
    const renderSecurityScoreGauge = () => {
        const score = metrics.securityScore;
        const circumference = 2 * Math.PI * 45; // radius = 45
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (score / 100) * circumference;
        const getScoreColor = (score) => {
            if (score >= 80)
                return themeStyles.success;
            if (score >= 60)
                return themeStyles.warning;
            if (score >= 40)
                return themeStyles.error;
            return themeStyles.critical;
        };
        return (_jsxs("div", { style: {
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer'
            }, onClick: () => onDrillDown?.('securityScore'), children: [_jsx("h3", { style: {
                        margin: '0 0 16px 0',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: themeStyles.textSecondary
                    }, children: "Overall Security Score" }), _jsxs("div", { style: { position: 'relative', display: 'inline-block' }, children: [_jsxs("svg", { width: "120", height: "120", style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { cx: "60", cy: "60", r: "45", stroke: themeStyles.border, strokeWidth: "8", fill: "none" }), _jsx("circle", { cx: "60", cy: "60", r: "45", stroke: getScoreColor(score), strokeWidth: "8", fill: "none", strokeDasharray: strokeDasharray, strokeDashoffset: strokeDashoffset, strokeLinecap: "round", style: { transition: 'stroke-dashoffset 0.5s ease' } })] }), _jsx("div", { style: {
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '24px',
                                fontWeight: 700,
                                color: themeStyles.text
                            }, children: score })] }), _jsx("div", { style: {
                        marginTop: '8px',
                        fontSize: '12px',
                        color: themeStyles.textSecondary
                    }, children: "Industry Average: 72" })] }));
    };
    // Render risk level indicator
    const renderRiskLevelIndicator = () => (_jsxs("div", { style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer'
        }, onClick: () => onDrillDown?.('riskLevel'), children: [_jsx("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: themeStyles.textSecondary
                }, children: "Current Risk Level" }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }, children: [_jsx("div", { style: {
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: getRiskColor(metrics.riskLevel)
                        } }), _jsx("span", { style: {
                            fontSize: '24px',
                            fontWeight: 600,
                            color: themeStyles.text,
                            textTransform: 'capitalize'
                        }, children: metrics.riskLevel })] }), _jsxs("div", { style: {
                    marginTop: '12px',
                    fontSize: '12px',
                    color: themeStyles.textSecondary
                }, children: ["Trend: ", metrics.trends.securityTrend, " ", getTrendIcon(metrics.trends.securityTrend)] })] }));
    // Render incidents summary
    const renderIncidentsSummary = () => (_jsxs("div", { style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer'
        }, onClick: () => onDrillDown?.('incidents'), children: [_jsxs("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: themeStyles.textSecondary
                }, children: ["Security Incidents (", selectedTimeframe, ")"] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: themeStyles.text
                                }, children: metrics.incidentCount.total }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: "Total" })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: themeStyles.critical
                                }, children: metrics.incidentCount.critical }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: "Critical" })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: themeStyles.success
                                }, children: metrics.incidentCount.resolved }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: "Resolved" })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: themeStyles.warning
                                }, children: metrics.incidentCount.open }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: "Open" })] })] })] }));
    // Render financial impact
    const renderFinancialImpact = () => (_jsxs("div", { style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer'
        }, onClick: () => onDrillDown?.('financial'), children: [_jsxs("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: themeStyles.textSecondary
                }, children: ["Security ROI (", selectedTimeframe, ")"] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: themeStyles.success
                                }, children: formatCurrency(metrics.financialImpact.prevented) }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary,
                                    marginBottom: '8px'
                                }, children: "Threats Prevented" }), _jsx("div", { style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: themeStyles.error
                                }, children: formatCurrency(metrics.financialImpact.incurred) }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: "Incident Costs" })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: themeStyles.primary
                                }, children: formatCurrency(metrics.financialImpact.savings) }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary,
                                    marginBottom: '8px'
                                }, children: "Net Savings" }), _jsxs("div", { style: {
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: metrics.financialImpact.roi > 0 ? themeStyles.success : themeStyles.error
                                }, children: [metrics.financialImpact.roi > 0 ? '+' : '', metrics.financialImpact.roi, "%"] }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: "ROI" })] })] })] }));
    // Render top insights
    const renderTopInsights = () => {
        const topInsights = insights
            .filter(insight => insight.priority === 'critical' || insight.priority === 'high')
            .slice(0, 3);
        return (_jsxs("div", { style: {
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: '12px',
                padding: '24px'
            }, children: [_jsx("h3", { style: {
                        margin: '0 0 16px 0',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: themeStyles.textSecondary
                    }, children: "Top Executive Insights" }), topInsights.length === 0 ? (_jsx("div", { style: {
                        padding: '20px',
                        textAlign: 'center',
                        color: themeStyles.textSecondary,
                        fontSize: '14px'
                    }, children: "No critical insights at this time" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: topInsights.map(insight => (_jsxs("div", { style: {
                            padding: '16px',
                            background: themeStyles.background,
                            border: `1px solid ${themeStyles.border}`,
                            borderLeft: `4px solid ${insight.priority === 'critical' ? themeStyles.critical : themeStyles.error}`,
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }, onClick: () => onInsightAction?.(insight, 'view'), children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px'
                                }, children: [_jsx("span", { style: {
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: themeStyles.text
                                        }, children: insight.title }), _jsx("span", { style: {
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            background: insight.priority === 'critical' ? themeStyles.critical : themeStyles.error,
                                            color: themeStyles.surface,
                                            borderRadius: '4px',
                                            textTransform: 'uppercase'
                                        }, children: insight.priority })] }), _jsx("p", { style: {
                                    fontSize: '12px',
                                    color: themeStyles.textSecondary,
                                    margin: '0 0 8px 0',
                                    lineHeight: 1.4
                                }, children: insight.description }), _jsxs("div", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: ["Impact: ", insight.impact, " \u2022 Cost: ", formatCurrency(insight.cost)] })] }, insight.id))) }))] }));
    };
    return (_jsxs("div", { style: {
            background: themeStyles.background,
            color: themeStyles.text,
            minHeight: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif'
        }, children: [_jsx("div", { style: {
                    padding: '24px',
                    borderBottom: `1px solid ${themeStyles.border}`
                }, children: _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        maxWidth: '1400px',
                        margin: '0 auto'
                    }, children: [_jsxs("div", { children: [_jsx("h1", { style: {
                                        margin: '0 0 4px 0',
                                        fontSize: '28px',
                                        fontWeight: 700,
                                        color: themeStyles.text
                                    }, children: "\uD83D\uDCCA Executive Security Dashboard" }), _jsx("p", { style: {
                                        margin: '0',
                                        fontSize: '16px',
                                        color: themeStyles.textSecondary
                                    }, children: "Strategic security posture overview for executive decision-making" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsxs("select", { value: selectedTimeframe, onChange: (e) => setSelectedTimeframe(e.target.value), style: {
                                        padding: '8px 12px',
                                        background: themeStyles.surface,
                                        border: `1px solid ${themeStyles.border}`,
                                        borderRadius: '6px',
                                        color: themeStyles.text,
                                        fontSize: '14px'
                                    }, children: [_jsx("option", { value: "30d", children: "Last 30 Days" }), _jsx("option", { value: "90d", children: "Last 90 Days" }), _jsx("option", { value: "1y", children: "Last Year" })] }), _jsxs("div", { style: {
                                        fontSize: '12px',
                                        color: themeStyles.textSecondary
                                    }, children: ["Last updated: ", lastUpdate.toLocaleTimeString()] })] })] }) }), _jsxs("div", { style: {
                    padding: '24px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }, children: [_jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr 300px 300px',
                            gap: '24px',
                            marginBottom: '24px'
                        }, children: [renderSecurityScoreGauge(), renderRiskLevelIndicator(), renderIncidentsSummary(), showFinancials && renderFinancialImpact()] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: showBenchmarks ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
                            gap: '24px',
                            marginBottom: '24px'
                        }, children: [renderKPICard('Compliance Score', `${metrics.complianceScore}%`, `Trend: ${metrics.trends.complianceTrend}`, metrics.trends.complianceTrend, () => onDrillDown?.('compliance')), renderKPICard('Security Maturity', metrics.benchmarks.maturityLevel.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 'NIST Cybersecurity Framework', undefined, () => onDrillDown?.('maturity')), showBenchmarks && renderKPICard('Industry Ranking', `${metrics.benchmarks.industryRanking}th percentile`, `${metrics.benchmarks.peerComparison} peer average`, undefined, () => onDrillDown?.('benchmarks')), renderKPICard('Threat Level', metrics.trends.threatTrend.charAt(0).toUpperCase() + metrics.trends.threatTrend.slice(1), 'External threat intelligence', metrics.trends.threatTrend, () => onDrillDown?.('threats'))] }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '24px'
                        }, children: renderTopInsights() })] }), _jsx("div", { style: {
                    marginTop: '40px',
                    padding: '24px',
                    borderTop: `1px solid ${themeStyles.border}`,
                    textAlign: 'center'
                }, children: _jsx("div", { style: {
                        fontSize: '12px',
                        color: themeStyles.textSecondary
                    }, children: "Executive Security Dashboard v1.0.0 \u2022 Confidential \u2022 For Executive Use Only" }) })] }));
};
export default ExecutiveSecurityDashboard;
