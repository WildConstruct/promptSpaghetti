import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
 > ;
performance_trends: Array;
// Enhanced system metrics
overall_quality_score: number;
average_impact_rating: number;
total_characters_saved: number;
false_positive_rate: number;
user_satisfaction_score ?  : number;
// Rule effectiveness distribution
high_impact_rules: number;
medium_impact_rules: number;
low_impact_rules: number;
// Performance categories
fast_rules: number;
slow_rules: number;
// Quality distribution
excellent_rules: number;
good_rules: number;
poor_rules: number;
export const CorrectionsStatsDashboard = ({ isOpen, onClose }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    const [_____selectedView, _____setSelectedView] = useState('overview');
    useEffect(() => {
        if (isOpen) {
            fetchMetrics();
        }
    }, [isOpen, selectedPeriod]);
    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/corrections/stats?days=${selectedPeriod}`);
            if (response.ok) {
                const data = await response.json();
                setMetrics(data.data);
                setError(null);
            }
            else {
                setError('Failed to fetch statistics');
            }
        }
        catch (err) {
            setError('Failed to fetch statistics');
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
        }, children: _jsxs("div", { style: {
                background: '#23272f',
                padding: '24px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                color: '#fff',
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: '20px', fontWeight: 600 }, children: "Corrections Statistics" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), style: {
                                        padding: '6px 12px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }, children: [_jsx("option", { value: "7", children: "Last 7 days" }), _jsx("option", { value: "30", children: "Last 30 days" }), _jsx("option", { value: "90", children: "Last 90 days" })] }), _jsx("button", { onClick: onClose, style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#a0aec0',
                                        cursor: 'pointer',
                                        fontSize: '20px',
                                        padding: '4px 8px',
                                    }, children: "\u00D7" })] })] }), loading && (_jsx("div", { style: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px',
                        color: '#a0aec0',
                    }, children: "Loading statistics..." })), error && (_jsx("div", { style: {
                        background: '#fed7d7',
                        color: '#c53030',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                    }, children: error })), metrics && !loading && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                            }, children: [_jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Total Rules" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 600, color: '#63b3ed' }, children: metrics.total_rules }), _jsxs("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: [metrics.active_rules, " active"] })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Total Executions" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 600, color: '#68d391' }, children: metrics.total_executions.toLocaleString() }), _jsxs("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: ["Last ", selectedPeriod, " days"] })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Avg Execution Time" }), _jsxs("div", { style: { fontSize: '24px', fontWeight: 600, color: '#9f7aea' }, children: [metrics.average_execution_time.toFixed(1), "ms"] }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: "Per rule application" })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Error Rate" }), _jsxs("div", { style: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: metrics.error_rate > 5 ? '#e53e3e' : '#68d391',
                                            }, children: [metrics.error_rate.toFixed(1), "%"] }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: metrics.error_rate > 5 ? 'Needs attention' : 'Good performance' })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Quality Score" }), _jsxs("div", { style: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: metrics.overall_quality_score >= 80 ? '#68d391' :
                                                    metrics.overall_quality_score >= 60 ? '#fbb040' : '#e53e3e',
                                            }, children: [metrics.overall_quality_score.toFixed(0), "/100"] }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: "Overall effectiveness" })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Impact Rating" }), _jsxs("div", { style: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: metrics.average_impact_rating >= 4 ? '#68d391' :
                                                    metrics.average_impact_rating >= 3 ? '#fbb040' : '#e53e3e',
                                            }, children: [metrics.average_impact_rating.toFixed(1), "/5"] }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: "Average significance" })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Characters Saved" }), _jsx("div", { style: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: metrics.total_characters_saved > 0 ? '#68d391' : '#a0aec0',
                                            }, children: metrics.total_characters_saved.toLocaleString() }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: "Text optimization" })] }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                    }, children: [_jsx("h3", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "False Positive Rate" }), _jsxs("div", { style: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: metrics.false_positive_rate > 10 ? '#e53e3e' :
                                                    metrics.false_positive_rate > 5 ? '#fbb040' : '#68d391',
                                            }, children: [metrics.false_positive_rate.toFixed(1), "%"] }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: metrics.false_positive_rate <= 5 ? 'Excellent accuracy' : 'Needs improvement' })] })] }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '16px', fontWeight: 600, marginBottom: '16px' }, children: "Most Used Rules" }), _jsxs("div", { style: {
                                        background: '#2a2e37',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                        overflow: 'hidden',
                                    }, children: [_jsxs("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                background: '#1e2228',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#a0aec0',
                                                borderBottom: '1px solid #444',
                                            }, children: [_jsx("div", { children: "Rule Name" }), _jsx("div", { children: "Applications" }), _jsx("div", { children: "Quality" }), _jsx("div", { children: "Impact" }), _jsx("div", { children: "Avg Time" }), _jsx("div", { children: "Success Rate" }), _jsx("div", { children: "Trend" })] }), metrics.most_used_rules.slice(0, 10).map((rule) => (_jsxs("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #444',
                                                fontSize: '14px',
                                            }, children: [_jsx("div", { style: { fontWeight: 500 }, children: rule.rule_name }), _jsx("div", { children: rule.total_applications.toLocaleString() }), _jsx("div", { style: {
                                                        color: rule.quality_score >= 80 ? '#68d391' :
                                                            rule.quality_score >= 60 ? '#fbb040' : '#e53e3e',
                                                    }, children: rule.quality_score.toFixed(0) }), _jsx("div", { style: {
                                                        color: rule.impact_rating >= 4 ? '#68d391' :
                                                            rule.impact_rating >= 3 ? '#fbb040' : '#e53e3e',
                                                    }, children: rule.impact_rating.toFixed(1) }), _jsxs("div", { children: [rule.average_execution_time.toFixed(1), "ms"] }), _jsxs("div", { style: {
                                                        color: rule.success_rate > 95 ? '#68d391' :
                                                            rule.success_rate > 85 ? '#fbb040' : '#e53e3e',
                                                    }, children: [rule.success_rate.toFixed(1), "%"] }), _jsx("div", { children: _jsx("span", { style: {
                                                            color: rule.usage_trend === 'increasing' ? '#68d391' :
                                                                rule.usage_trend === 'decreasing' ? '#e53e3e' : '#a0aec0',
                                                            fontSize: '12px',
                                                        }, children: rule.usage_trend === 'increasing' ? '↗' :
                                                            rule.usage_trend === 'decreasing' ? '↘' : '→' }) })] }, rule.rule_id)))] })] }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '16px', fontWeight: 600, marginBottom: '16px' }, children: "Performance Trends" }), _jsx("div", { style: {
                                        background: '#2a2e37',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                        padding: '16px',
                                    }, children: metrics.performance_trends.length > 0 ? (_jsx("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                            gap: '12px',
                                            marginBottom: '16px',
                                        }, children: metrics.performance_trends.slice(-7).map((trend) => (_jsxs("div", { style: {
                                                background: '#1e2228',
                                                padding: '12px',
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                            }, children: [_jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }, children: new Date(trend.date).toLocaleDateString() }), _jsx("div", { style: { fontSize: '18px', fontWeight: 600, color: '#63b3ed' }, children: trend.executions }), _jsxs("div", { style: { fontSize: '11px', color: '#a0aec0' }, children: [trend.avg_time.toFixed(1), "ms avg"] }), _jsxs("div", { style: { fontSize: '11px', color: '#68d391' }, children: ["Q: ", trend.quality_score.toFixed(0)] }), _jsxs("div", { style: { fontSize: '11px', color: '#9f7aea' }, children: ["I: ", trend.impact_rating.toFixed(1)] }), trend.error_count > 0 && (_jsxs("div", { style: { fontSize: '11px', color: '#e53e3e' }, children: [trend.error_count, " errors"] }))] }, trend.date))) })) : (_jsx("div", { style: {
                                            color: '#a0aec0',
                                            textAlign: 'center',
                                            padding: '20px',
                                        }, children: "No performance data available for the selected period." })) })] }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '16px', fontWeight: 600, marginBottom: '16px' }, children: "Rule Effectiveness Distribution" }), _jsxs("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '16px',
                                        marginBottom: '24px',
                                    }, children: [_jsxs("div", { style: {
                                                background: '#2a2e37',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                            }, children: [_jsx("h4", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Impact Distribution" }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#68d391' }, children: "High Impact" }), _jsx("span", { style: { fontSize: '12px', color: '#68d391' }, children: metrics.high_impact_rules })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#fbb040' }, children: "Medium Impact" }), _jsx("span", { style: { fontSize: '12px', color: '#fbb040' }, children: metrics.medium_impact_rules })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#e53e3e' }, children: "Low Impact" }), _jsx("span", { style: { fontSize: '12px', color: '#e53e3e' }, children: metrics.low_impact_rules })] })] }), _jsxs("div", { style: {
                                                background: '#2a2e37',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                            }, children: [_jsx("h4", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Quality Distribution" }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#68d391' }, children: "Excellent (80+)" }), _jsx("span", { style: { fontSize: '12px', color: '#68d391' }, children: metrics.excellent_rules })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#fbb040' }, children: "Good (60-79)" }), _jsx("span", { style: { fontSize: '12px', color: '#fbb040' }, children: metrics.good_rules })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#e53e3e' }, children: "Poor (<60)" }), _jsx("span", { style: { fontSize: '12px', color: '#e53e3e' }, children: metrics.poor_rules })] })] }), _jsxs("div", { style: {
                                                background: '#2a2e37',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                            }, children: [_jsx("h4", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "Performance Distribution" }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#68d391' }, children: "Fast (<10ms)" }), _jsx("span", { style: { fontSize: '12px', color: '#68d391' }, children: metrics.fast_rules })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#fbb040' }, children: "Normal (10-100ms)" }), _jsx("span", { style: { fontSize: '12px', color: '#fbb040' }, children: metrics.total_rules - metrics.fast_rules - metrics.slow_rules })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#e53e3e' }, children: "Slow (>100ms)" }), _jsx("span", { style: { fontSize: '12px', color: '#e53e3e' }, children: metrics.slow_rules })] })] }), metrics.user_satisfaction_score && (_jsxs("div", { style: {
                                                background: '#2a2e37',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                            }, children: [_jsx("h4", { style: { fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }, children: "User Satisfaction" }), _jsxs("div", { style: {
                                                        fontSize: '24px',
                                                        fontWeight: 600,
                                                        color: metrics.user_satisfaction_score >= 4 ? '#68d391' :
                                                            metrics.user_satisfaction_score >= 3 ? '#fbb040' : '#e53e3e',
                                                    }, children: [metrics.user_satisfaction_score.toFixed(1), "/5"] }), _jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginTop: '4px' }, children: "Average user rating" })] }))] })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: fetchMetrics, style: {
                                        padding: '8px 16px',
                                        background: '#63b3ed',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }, children: "Refresh" }), _jsx("button", { onClick: onClose, style: {
                                        padding: '8px 16px',
                                        background: '#4a5568',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                    }, children: "Close" })] })] }))] }) }));
};
