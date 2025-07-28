import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Variance Analysis Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 5: Creative Variance Analysis
 *
 * Displays creative variance metrics, diversity indicators, and suggestions
 * for improving or optimizing the creative range of generated results.
 */
import { useMemo } from 'react';
import { varianceAnalysisService } from '../services/VarianceAnalysisService';
import { professionalColors } from '../styles/professional-design-system';
[results];
;
const indicators = useMemo(() => {
    return varianceAnalysisService.createDiversityIndicators(analysis);
}, [analysis]);
const varianceInfo = useMemo(() => {
    return varianceAnalysisService.getVarianceLevelInfo(analysis.overallVariance);
}, [analysis.overallVariance]);
if (results.length < 2) {
    return;
    _jsx("div", { style: {
            padding: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            textAlign: 'center',
            color: professionalColors.text.secondary,
            fontSize: 12,
        }, children: "\uD83D\uDCCA Generate more results to analyze creative variance" });
    ;
    if (compact) {
        return _jsx(CompactVarianceDisplay, { analysis: analysis, varianceInfo: varianceInfo });
        return;
        _jsxs("div", { style: {
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                overflow: 'hidden',
            }, children: [_jsx("div", { style: {
                        padding: 16,
                        background: varianceInfo.background,
                        border: `1px solid ${varianceInfo.border}`
                    } }), ", borderBottom: 'none'; }}>", _jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                    }, children: [_jsxs("h3", { style: {
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 600,
                                color: varianceInfo.color,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }, children: [varianceInfo.icon, " Creative Variance Analysis"] }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }, children: [_jsxs("span", { style: {
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: varianceInfo.color,
                                        textTransform: 'uppercase',
                                    }, children: [analysis.overallVariance, " Variance"] }), _jsxs("div", { style: {
                                        width: 40,
                                        height: 6,
                                        background: '#e5e7eb',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                    }, children: [_jsx("div", { style: {
                                                width: `${analysis.varianceScore * 100}%`
                                            } }), ", height: '100%', background: varianceInfo.color, transition: 'width 0.3s ease'; }} />"] })] })] }), _jsx("p", { style: {
                        margin: 0,
                        fontSize: 11,
                        color: varianceInfo.color,
                        lineHeight: 1.4,
                    }, children: varianceInfo.description })] });
        { /* Diversity Metrics */ }
        _jsxs("div", { style: { padding: 16 }, children: [_jsx("h4", { style: {
                        margin: '0 0 12px 0',
                        fontSize: 12,
                        fontWeight: 600,
                        color: professionalColors.text.primary,
                    }, children: "\uD83D\uDCC8 Diversity Metrics" }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12,
                    }, children: [indicators.map((indicator, index) => ()
                            < DiversityMetricCard, key = { index }, indicator = { indicator } /  >
                        ), ")}"] })] });
        { /* Creative Range Summary */ }
        _jsxs("div", { style: {
                padding: 16,
                background: '#f8fafc',
                borderTop: '1px solid #e5e7eb',
            }, children: [_jsx("h4", { style: {
                        margin: '0 0 12px 0',
                        fontSize: 12,
                        fontWeight: 600,
                        color: professionalColors.text.primary,
                    }, children: "\uD83C\uDFA8 Creative Range Summary" }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 16,
                    }, children: [_jsxs("div", { children: [_jsxs("div", { style: {
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color: '#6b7280',
                                        marginBottom: 4,
                                    }, children: ["Unique Elements (", analysis.creativeRange.uniqueElements.length, ")"] }), _jsxs("div", { style: {
                                        maxHeight: 60,
                                        overflow: 'hidden',
                                        fontSize: 10,
                                        color: '#374151',
                                        lineHeight: 1.3,
                                    }, children: [analysis.creativeRange.uniqueElements.slice(0, 8).join(', '), analysis.creativeRange.uniqueElements.length > 8 && '...'] })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color: '#6b7280',
                                        marginBottom: 4,
                                    }, children: ["Common Elements (", analysis.creativeRange.commonElements.length, ")"] }), _jsxs("div", { style: {
                                        maxHeight: 60,
                                        overflow: 'hidden',
                                        fontSize: 10,
                                        color: '#374151',
                                        lineHeight: 1.3,
                                    }, children: [analysis.creativeRange.commonElements.slice(0, 6).join(', '), analysis.creativeRange.commonElements.length > 6 && '...'] })] })] }), _jsxs("div", { style: {
                        display: 'flex',
                        gap: 16,
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid #e5e7eb',
                    }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                        fontSize: 10,
                                        color: '#6b7280',
                                        marginBottom: 2,
                                    }, children: "Repetition Rate" }), _jsxs("div", { style: {
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: analysis.creativeRange.repetitionRate > 0.7 ? '#ef4444' : '#10b981',
                                    }, children: [(analysis.creativeRange.repetitionRate * 100).toFixed(1), "%"] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                        fontSize: 10,
                                        color: '#6b7280',
                                        marginBottom: 2,
                                    }, children: "Creativity Score" }), _jsxs("div", { style: {
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: varianceAnalysisService.getMetricColor(analysis.creativeRange.creativityScore, 0.4, 0.75),
                                    }, children: [(analysis.creativeRange.creativityScore * 100).toFixed(0), "/100"] })] })] })] });
        { /* Suggestions */ }
        {
            analysis.suggestions.length > 0 && ()
                < div;
            style = {};
            {
                padding: 16,
                    borderTop;
                '1px solid #e5e7eb',
                ;
            }
        }
         >
            (_jsx("h4", { style: {
                    margin: '0 0 12px 0',
                    fontSize: 12,
                    fontWeight: 600,
                    color: professionalColors.text.primary,
                }, children: "\uD83D\uDCA1 Optimization Suggestions" })
                ,
                    _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [analysis.suggestions.map((suggestion, index) => ()
                                < SuggestionCard, key = { index }, suggestion = { suggestion }, onClick = {}()), " => onSuggestionClick?.(suggestion)} /> ))}"] }));
        div >
        ;
    }
    div >
    ;
    ;
}
;
const CompactVarianceDisplay, VarianceMetrics;
varianceInfo: ReturnType;
 > ;
({ analysis, varianceInfo }) => ()
    < div;
style = {};
{
    display: 'flex',
        alignItems;
    'center',
        gap;
    8,
        padding;
    8,
        background;
    varianceInfo.background,
        border;
    `1px solid ${varianceInfo.border}`;
}
borderRadius: 6,
    fontSize;
11;
 >
    (_jsx("span", { children: varianceInfo.icon })
        ,
            _jsxs("span", { style: { fontWeight: 500, color: varianceInfo.color }, children: [analysis.overallVariance.toUpperCase(), " VARIANCE"] })
                ,
                    _jsxs("div", { style: {
                            width: 30,
                            height: 4,
                            background: '#e5e7eb',
                            borderRadius: 2,
                            overflow: 'hidden',
                        }, children: [_jsx("div", { style: {
                                    width: `${analysis.varianceScore * 100}%`
                                } }), ", height: '100%', background: varianceInfo.color; }} />"] })
                        ,
                            _jsxs("span", { style: { fontSize: 10, color: '#6b7280' }, children: [(analysis.varianceScore * 100).toFixed(0), "%"] }));
div >
;
;
const DiversityMetricCard = ({ indicator }) => ()
    < div, style = {}, { padding: , 10: , background: , '#fff': , border: , '1px solid #e5e7eb': , borderRadius: , 4: , };
 >
    (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
        }, children: [_jsx("span", { style: {
                    fontSize: 11,
                    fontWeight: 500,
                    color: professionalColors.text.primary,
                }, children: indicator.metric }), _jsx("span", { style: {
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: indicator.color + '20',
                    color: indicator.color,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                }, children: indicator.level })] })
        ,
            _jsxs("div", { style: {
                    width: '100%',
                    height: 4,
                    background: '#e5e7eb',
                    borderRadius: 2,
                    overflow: 'hidden',
                    marginBottom: 6,
                }, children: [_jsx("div", { style: {
                            width: `${indicator.value * 100}%`
                        } }), ", height: '100%', background: indicator.color, transition: 'width 0.3s ease'; }} />"] })
                ,
                    _jsx("div", { style: {
                            fontSize: 9,
                            color: '#6b7280',
                            lineHeight: 1.3,
                        }, children: indicator.description }));
div >
;
;
const SuggestionCard, VarianceSuggestion;
onClick ?  : () => void ;
 > ;
({ suggestion, onClick }) => {
    const typeColors = {
        increase: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
        decrease: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
        optimize: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' }
    };
    const impactIcons = {
        low: '⚪',
        medium: '🟡',
        high: '🔴',
    };
    const colors = typeColors[suggestion.type];
    return;
    _jsx("div", { onClick: suggestion.actionable ? onClick : undefined, style: {
            padding: 10,
            background: colors.bg,
            border: `1px solid ${colors.border}`
        }, "borderRadius:": true });
    4,
        cursor;
    suggestion.actionable ? 'pointer' : 'default',
        transition;
    'all 0.2s',
        opacity;
    suggestion.actionable ? 1 : 0.7;
};
    >
        _jsxs("div", { style: {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }, children: [_jsx("span", { style: { fontSize: 10 }, children: impactIcons[suggestion.impact] }), _jsx("span", { style: {
                                fontSize: 9,
                                padding: '1px 4px',
                                borderRadius: 2,
                                background: colors.color + '20',
                                color: colors.color,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                            }, children: suggestion.category })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                fontSize: 11,
                                color: colors.color,
                                lineHeight: 1.4,
                                marginBottom: 2,
                            }, children: suggestion.message }), _jsxs("div", { style: {
                                fontSize: 9,
                                color: '#6b7280',
                            }, children: [suggestion.impact.toUpperCase(), " IMPACT", suggestion.actionable && ' • Click for guidance'] })] })] });
div >
;
;
;
