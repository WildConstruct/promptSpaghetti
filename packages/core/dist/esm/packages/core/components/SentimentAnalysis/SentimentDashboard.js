import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Sentiment Analysis Dashboard Component
 *
 * Comprehensive dashboard for viewing sentiment analytics, trends, and insights.
 * Displays sentiment distribution, emotion analysis, toxicity metrics, and recommendations.
 *
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */
import { useState, useEffect } from 'react';
import { SentimentAnalysisService } from '../../services/SentimentAnalysisService';
{
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, _____setSelectedTimeRange] = useState(timeRange || {});
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago,
        end;
    new Date(),
    ;
}
;
const sentimentService = new SentimentAnalysisService({});
baseUrl: 'https://prompt-spaghetti.vercel.app',
;
;
useEffect(() => {
    loadAnalytics();
    // Set up auto-refresh if specified
    if (refreshInterval && refreshInterval > 0) {
        const interval = setInterval(loadAnalytics, refreshInterval);
        return () => clearInterval(interval);
    }
    [resourceId, resourceType, selectedTimeRange, refreshInterval];
});
const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const analyticsData = await sentimentService.getSentimentAnalytics();
        ;
        resourceId,
            resourceType,
            selectedTimeRange;
    }
    finally {
    }
};
;
setAnalytics(analyticsData);
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load sentiment analytics');
}
finally {
    setIsLoading(false);
}
;
const getSentimentColor = (sentiment) => {
    switch (sentiment) {
        case 'positive': return '#059669';
        case 'negative': return '#dc2626';
        default: return '#6b7280';
    }
    ;
    const getEmotionIcon = (emotion) => {
        const icons = {
            joy: '😄',
            sadness: '😢',
            anger: '😠',
            fear: '😨',
            surprise: '😲',
            disgust: '😒',
            trust: '😊',
            anticipation: '🤔',
        };
        return icons[emotion] || '😐';
    };
    const getToxicityColor = (level) => {
        switch (level) {
            case 'severe': return '#dc2626';
            case 'high': return '#ea580c';
            case 'medium': return '#d97706';
            case 'low': return '#facc15';
            default: return '#059669';
        }
        ;
        const formatPercentage = (num) => {
            return num.toFixed(1) + '%';
        };
        const renderSentimentDistribution = () => {
            if (!analytics)
                return null;
            const { sentimentDistribution } = analytics;
            const _____total = sentimentDistribution.positive.count + ;
            sentimentDistribution.neutral.count +
                sentimentDistribution.negative.count;
            return;
            _jsxs("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                }, children: [_jsx("h3", { style: {
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                        }, children: "\uD83D\uDCCA Sentiment Distribution" }), _jsxs("div", { style: {
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            height: '40px',
                            display: 'flex',
                        }, children: [_jsx("div", { style: {
                                    backgroundColor: '#059669',
                                    width: `${sentimentDistribution.positive.percentage}%`
                                } }), ", display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }} >", sentimentDistribution.positive.percentage > 10 &&
                                formatPercentage(sentimentDistribution.positive.percentage)] }), _jsx("div", { style: {
                            backgroundColor: '#6b7280',
                            width: `${sentimentDistribution.neutral.percentage}%`
                        } }), ", display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }} >", sentimentDistribution.neutral.percentage > 10 &&
                        formatPercentage(sentimentDistribution.neutral.percentage)] })
                ,
                    _jsx("div", { style: {
                            backgroundColor: '#dc2626',
                            width: `${sentimentDistribution.negative.percentage}%`
                        }, "display:": true });
            'flex',
                alignItems;
            'center',
                justifyContent;
            'center',
                color;
            'white',
                fontSize;
            '12px',
                fontWeight;
            '600';
        };
    };
        >
            { sentimentDistribution, : .negative.percentage > 10 &&
                    formatPercentage(sentimentDistribution.negative.percentage) };
};
div >
;
div >
    { /* Sentiment Details */}
    < div;
style = {};
{
    display: 'grid',
        gridTemplateColumns;
    'repeat(3, 1fr)',
        gap;
    '12px',
    ;
}
 >
    (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#059669',
                    marginBottom: '4px',
                }, children: sentimentDistribution.positive.count }), _jsxs("div", { style: {
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                }, children: ["Positive (", formatPercentage(sentimentDistribution.positive.percentage), ")"] }), _jsxs("div", { style: {
                    fontSize: '10px',
                    color: '#9ca3af',
                }, children: ["Avg: ", sentimentDistribution.positive.averageScore.toFixed(2)] })] })
        ,
            _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#6b7280',
                            marginBottom: '4px',
                        }, children: sentimentDistribution.neutral.count }), _jsxs("div", { style: {
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '4px',
                        }, children: ["Neutral (", formatPercentage(sentimentDistribution.neutral.percentage), ")"] }), _jsxs("div", { style: {
                            fontSize: '10px',
                            color: '#9ca3af',
                        }, children: ["Avg: ", sentimentDistribution.neutral.averageScore.toFixed(2)] })] })
                ,
                    _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#dc2626',
                                    marginBottom: '4px',
                                }, children: sentimentDistribution.negative.count }), _jsxs("div", { style: {
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    marginBottom: '4px',
                                }, children: ["Negative (", formatPercentage(sentimentDistribution.negative.percentage), ")"] }), _jsxs("div", { style: {
                                    fontSize: '10px',
                                    color: '#9ca3af',
                                }, children: ["Avg: ", sentimentDistribution.negative.averageScore.toFixed(2)] })] }));
div >
;
div >
;
;
;
const renderEmotionAnalysis = () => {
    if (!analytics)
        return null;
    const { emotionAnalytics } = analytics;
    return;
    _jsxs("div", { style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                }, children: "\uD83C\uDFAD Emotion Analysis" }), emotionAnalytics.dominant && ()
                < div, " style=", {
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                textAlign: 'center',
            }, ">", _jsx("div", { style: {
                    fontSize: '32px',
                    marginBottom: '8px',
                }, children: getEmotionIcon(emotionAnalytics.dominant) }), _jsxs("div", { style: {
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    textTransform: 'capitalize',
                }, children: ["Dominant Emotion: ", emotionAnalytics.dominant] })] });
};
{ /* Emotion Distribution */ }
_jsxs("div", { style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
    }, children: [Object.entries(emotionAnalytics.distribution).map(([emotion, percentage]) => ()
            < div, key = { emotion }, style = {}, {
            textAlign: 'center',
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
        }), ">", _jsx("div", { style: { fontSize: '20px', marginBottom: '4px' }, children: getEmotionIcon(emotion) }), _jsx("div", { style: {
                fontSize: '11px',
                color: '#374151',
                textTransform: 'capitalize',
                marginBottom: '2px',
            }, children: emotion }), _jsx("div", { style: {
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
            }, children: formatPercentage(percentage) })] });
div >
    { /* Mixed Emotion Rate */}
    < div;
style = {};
{
    marginTop: '12px',
        padding;
    '8px',
        backgroundColor;
    '#fef3c7',
        borderRadius;
    '6px',
        fontSize;
    '12px',
        color;
    '#92400e',
        textAlign;
    'center',
    ;
}
 >
;
Mixed;
emotions;
detected in { formatPercentage(emotionAnalytics) { }, : .mixedEmotionRate };
of;
feedback;
div >
;
div >
;
;
;
const renderToxicityAnalysis = () => {
    if (!analytics)
        return null;
    const { toxicityAnalytics } = analytics;
    return;
    _jsxs("div", { style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                }, children: "\uD83D\uDEE1\uFE0F Toxicity Analysis" }), _jsx("div", { style: {
                    backgroundColor: toxicityAnalytics.overallLevel === 'none' ? '#f0fdf4' : ,
                    toxicityAnalytics, : .overallLevel === 'low' ? '#fefce8' :
                        toxicityAnalytics.overallLevel === 'medium' ? '#fef3c7' :
                            toxicityAnalytics.overallLevel === 'high' ? '#fef2f2' : '#fecaca',
                    border: `1px solid ${getToxicityColor(toxicityAnalytics.overallLevel)}40`
                } }), ", borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>", _jsxs("div", { style: {
                    fontSize: '16px',
                    fontWeight: '600',
                    color: getToxicityColor(toxicityAnalytics.overallLevel),
                    textTransform: 'uppercase',
                }, children: ["Overall Level: ", toxicityAnalytics.overallLevel] })] });
    { /* Toxicity Distribution */ }
    _jsxs("div", { style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '16px',
        }, children: [Object.entries(toxicityAnalytics.distribution).map(([level, percentage]) => ()
                < div, key = { level }, style = {}, {
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: `2px solid ${getToxicityColor(level)}20`
            }), "} >", _jsx("div", { style: {
                    fontSize: '14px',
                    fontWeight: '600',
                    color: getToxicityColor(level),
                    marginBottom: '4px',
                }, children: formatPercentage(percentage) }), _jsx("div", { style: {
                    fontSize: '11px',
                    color: '#374151',
                    textTransform: 'capitalize',
                }, children: level })] });
};
div >
    { /* Toxicity Categories */}
    < div;
style = {};
{
    display: 'grid',
        gridTemplateColumns;
    'repeat(3, 1fr)',
        gap;
    '8px',
        marginBottom;
    '12px',
    ;
}
 >
    { Object, : .entries(toxicityAnalytics.categories).map(([category, percentage]) => ()
            < div, key = { category }, style = {}, {
            padding: '6px 8px',
            backgroundColor: percentage > 10 ? '#fef2f2' : '#f9fafb',
            borderRadius: '4px',
            fontSize: '11px',
            textAlign: 'center',
        }) }
    >
        (_jsx("div", { style: {
                fontWeight: '600',
                color: percentage > 10 ? '#dc2626' : '#6b7280',
                marginBottom: '2px',
            }, children: formatPercentage(percentage) })
            ,
                _jsx("div", { style: {
                        color: '#9ca3af',
                        textTransform: 'capitalize',
                    }, children: category.replace('_', ' ') }));
div >
;
div >
    { /* Action Required */};
{
    toxicityAnalytics.actionRequired > 0 && ()
        < div;
    style = {};
    {
        padding: '8px',
            backgroundColor;
        '#fef2f2',
            border;
        '1px solid #fecaca',
            borderRadius;
        '6px',
            fontSize;
        '12px',
            color;
        '#dc2626',
            textAlign;
        'center',
        ;
    }
}
 >
;
{
    formatPercentage(toxicityAnalytics.actionRequired);
}
of;
content;
requires;
moderation;
action;
div >
;
div >
;
;
;
const renderInsights = () => {
    if (!analytics)
        return null;
    const { insights } = analytics;
    return;
    _jsxs("div", { style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                }, children: "\uD83D\uDCA1 Key Insights" }), _jsxs("div", { style: {
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                }, children: [_jsx("h4", { style: {
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#0c4a6e',
                        }, children: "\uD83C\uDFC6 Quality Metrics" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                        }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1e40af',
                                        }, children: insights.qualityMetrics.averageReadability }), _jsx("div", { style: {
                                            fontSize: '11px',
                                            color: '#6b7280',
                                        }, children: "Readability" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1e40af',
                                        }, children: insights.qualityMetrics.averageConstructiveness }), _jsx("div", { style: {
                                            fontSize: '11px',
                                            color: '#6b7280',
                                        }, children: "Constructiveness" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1e40af',
                                        }, children: insights.qualityMetrics.averageHelpfulness }), _jsx("div", { style: {
                                            fontSize: '11px',
                                            color: '#6b7280',
                                        }, children: "Helpfulness" })] })] })] }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                }, children: _jsxs("div", { children: [_jsx("h4", { style: {
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#059669',
                            }, children: "\uD83D\uDFE2 Top Positive Keywords" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: [insights.topPositiveKeywords.map(keyword => ()
                                    < span, key = { keyword }, style = {}, {
                                    padding: '2px 6px',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                }), ">", keyword] }), "))}"] }) }), _jsxs("div", { children: [_jsx("h4", { style: {
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#dc2626',
                        }, children: "\uD83D\uDD34 Top Negative Keywords" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: [insights.topNegativeKeywords.map(keyword => ()
                                < span, key = { keyword }, style = {}, {
                                padding: '2px 6px',
                                backgroundColor: '#fecaca',
                                color: '#991b1b',
                                borderRadius: '4px',
                                fontSize: '11px',
                            }), ">", keyword] }), "))}"] })] });
};
div >
    { /* Emerging Topics */};
{
    insights.emergingTopics.length > 0 && ()
        < div;
    style = {};
    {
        marginBottom: '16px';
    }
}
 >
    (_jsx("h4", { style: {
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7c2d12',
        }, children: "\uD83D\uDCC8 Emerging Topics" })
        ,
            _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: [insights.emergingTopics.map(topic => ()
                        < div, key = { topic, : .topic }, style = {}, {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 8px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '4px',
                        fontSize: '12px',
                    }), ">", _jsx("span", { style: {
                            color: '#92400e',
                            textTransform: 'capitalize',
                        }, children: topic.topic.replace('_', ' ') }), _jsxs("span", { style: {
                            color: getSentimentColor(topic.sentiment),
                            fontWeight: '600',
                        }, children: [topic.sentiment, " (+", topic.growth, "%)"] })] }));
div >
;
div >
;
{ /* Recommendations */ }
{
    insights.recommendations.length > 0 && ()
        < div >
        (_jsx("h4", { style: {
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#7c2d12',
            }, children: "\uD83C\uDFAF Recommendations" })
            ,
                _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: [insights.recommendations.map((rec, index) => ()
                            < div, key = { index }, style = {}, {
                            padding: '8px',
                            backgroundColor: rec.priority === 'critical' ? '#fef2f2' : ,
                            rec, : .priority === 'high' ? '#fef3c7' :
                                rec.priority === 'medium' ? '#eff6ff' : '#f9fafb',
                            border: `1px solid ${rec.priority === 'critical' ? '#fecaca' : }
                      rec.priority === 'high' ? '#fed7aa' :
                        rec.priority === 'medium' ? '#bfdbfe' : '#e5e7eb'}`,
                            borderRadius: '6px',
                            fontSize: '12px'
                        }), ">", _jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px',
                            }, children: [_jsx("span", { style: {
                                        fontWeight: '600',
                                        color: rec.priority === 'critical' ? '#dc2626' : ,
                                        rec, : .priority === 'high' ? '#d97706' : ,
                                        rec, : .priority === 'medium' ? '#2563eb' : '#374151',
                                        textTransform: 'capitalize',
                                    }, children: rec.type.replace('_', ' ') }), _jsxs("span", { style: {
                                        fontSize: '10px',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                    }, children: [rec.priority, " priority"] })] }), _jsx("div", { style: {
                                color: '#374151',
                                lineHeight: '1.3',
                            }, children: rec.description })] }));
}
div >
;
div >
;
div >
;
;
;
if (isLoading) {
    return;
    _jsxs("div", { style: {
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
        }, children: [_jsx("div", { style: {
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                } }), "Loading sentiment analytics..."] });
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
            }, children: [_jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "\u26A0\uFE0F" }), _jsxs("div", { children: ["Error loading sentiment analytics: ", error] }), _jsx("button", { onClick: loadAnalytics, style: {
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }, children: "Try Again" })] });
        ;
        if (!analytics) {
            return;
            _jsx("div", { style: {
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6b7280',
                }, children: "No sentiment analytics data available" });
            ;
            return;
            _jsxs("div", { style: {
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    minHeight: '100vh',
                }, children: [_jsxs("div", { style: {
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }, children: [_jsxs("div", { children: [_jsx("h1", { style: {
                                            margin: '0',
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: '#111827',
                                        }, children: "\uD83D\uDCCA Sentiment Analytics Dashboard" }), _jsxs("p", { style: {
                                            margin: '4px 0 0 0',
                                            fontSize: '14px',
                                            color: '#6b7280',
                                        }, children: [analytics.totalAnalyses, " analyses from ", selectedTimeRange.start.toLocaleDateString(), " to ", selectedTimeRange.end.toLocaleDateString()] })] }), _jsx("button", { onClick: loadAnalytics, style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDD04 Refresh" })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '20px',
                        }, children: [renderSentimentDistribution(), renderEmotionAnalysis(), renderToxicityAnalysis(), renderInsights()] })] });
            ;
        }
        ;
        export default SentimentDashboard;
    }
}
