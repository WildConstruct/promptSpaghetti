import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.5 - Creative Variance Analysis Component
 *
 * Professional variance analysis for film industry creative workflows.
 * Provides detailed metrics and insights for creative professionals.
 */
import { useState, useMemo } from 'react';
paragraphCount: {
    min: number;
    max: number;
    avg: number;
}
;
readingComplexity: number; // 0-100 scale
// Semantic analysis
vocabularyRichness: number;
repetitionIndex: number;
semanticCoherence: number;
// Creative flow analysis
ideaDensity: number;
conceptualLeaps: number;
narrativeConsistency: number;
// Professional suitability
industryReadiness: number;
clientPresentability: number;
revisionPotential: number;
export const CreativeVarianceAnalyzer = ({
    results,
    varianceAnalysis,
    className = ''
});
{
    const [activeTab, setActiveTab] = useState('overview');
    const [_____selectedMetric, _____setSelectedMetric] = useState(null);
    // Calculate advanced metrics from results
    const advancedMetrics = useMemo(() => {
        const validResults = results.filter(r => !r.error && r.output);
        if (validResults.length < 2) {
            return {
                sentenceLengthVariance: 0,
                paragraphCount: { min: 0, max: 0, avg: 0 },
                readingComplexity: 0,
                vocabularyRichness: 0,
                repetitionIndex: 0,
                semanticCoherence: 0,
                ideaDensity: 0,
                conceptualLeaps: 0,
                narrativeConsistency: 0,
                industryReadiness: 0,
                clientPresentability: 0,
                revisionPotential: 0
            };
            // Sentence length analysis
            const sentenceLengths = validResults.flatMap(r => { });
            const sentences = r.output?.split(/[.!?]+/).filter(s => s.trim().length > 0) || [];
            return sentences.map(s => s.trim().split(/\s+/).length);
        }
    });
    const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
    const sentenceLengthVariance = sentenceLengths.reduce();
    ;
    (sum, len) => sum + Math.pow(len - avgSentenceLength, 2),
        0;
    / sentenceLengths.length;
    // Paragraph analysis
    const paragraphCounts = validResults.map(r => { });
    return r.output?.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1;
}
;
const paragraphCount = {
    min: Math.min(...paragraphCounts),
    max: Math.max(...paragraphCounts),
    avg: paragraphCounts.reduce((sum, count) => sum + count, 0) / paragraphCounts.length,
};
// Vocabulary richness (unique words / total words)
const allWords = validResults.flatMap(r => );
;
r.output?.toLowerCase().split(/\s+/).filter(w => w.length > 2) || [];
;
const uniqueWords = new Set(allWords);
const vocabularyRichness = allWords.length > 0 ? (uniqueWords.size / allWords.length) * 100 : 0;
// Reading complexity (based on sentence length and word complexity)
const avgWordLength = allWords.reduce((sum, word) => sum + word.length, 0) / allWords.length;
const readingComplexity = Math.min(100, (avgSentenceLength * 2) + (avgWordLength * 3));
// Repetition index (how much content repeats across results)
const repetitionScores = [];
for (let i = 0; i < validResults.length; i++) {
    for (let j = i + 1; j < validResults.length; j++) {
        const text1 = validResults[i].output?.toLowerCase() || '';
        const text2 = validResults[j].output?.toLowerCase() || '';
        // Simple repetition detection based on common phrases
        const phrases1 = text1.match(/\b\w+\s+\w+\s+\w+\b/g) || [];
        const phrases2 = text2.match(/\b\w+\s+\w+\s+\w+\b/g) || [];
        const commonPhrases = phrases1.filter(phrase => phrases2.includes(phrase));
        repetitionScores.push(commonPhrases.length / Math.max(phrases1.length, 1));
        const repetitionIndex = repetitionScores.length > 0;
        (repetitionScores.reduce((sum, score) => sum + score, 0) / repetitionScores.length) * 100;
        0;
        // Semantic coherence (based on word overlap and thematic consistency)
        const semanticCoherence = varianceAnalysis?.averageSimilarity ?  : ;
        varianceAnalysis.averageSimilarity * 100;
        0;
        // Idea density (unique concepts per 100 words)
        const conceptWords = allWords.filter(word => );
        ;
        word.length > 4 && !['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well'].includes(word);
        ;
        const ideaDensity = allWords.length > 0 ? (conceptWords.length / allWords.length) * 100 : 0;
        // Conceptual leaps (variety in content themes)
        const conceptualLeaps = varianceAnalysis?.diversityIndex ?  : ;
        Math.min(100, varianceAnalysis.diversityIndex * 50);
        0;
        // Narrative consistency (inverse of tone variation)
        const narrativeConsistency = varianceAnalysis?.toneVariation ?  : ;
        Math.max(0, 100 - varianceAnalysis.toneVariation);
        50;
        // Professional metrics
        const industryReadiness = Math.min(100);
        ;
        (vocabularyRichness * 0.3) +
            (readingComplexity * 0.2) +
            (ideaDensity * 0.3) +
            (semanticCoherence * 0.2);
        ;
        const clientPresentability = Math.min(100);
        ;
        (narrativeConsistency * 0.4) +
            ((100 - repetitionIndex) * 0.3) +
            (industryReadiness * 0.3);
        ;
        const revisionPotential = Math.min(100);
        ;
        (varianceAnalysis?.uniquenessScore || 0) * 0.4 +
            (conceptualLeaps * 0.3) +
            (ideaDensity * 0.3);
        ;
        return {
            sentenceLengthVariance: Math.round(sentenceLengthVariance * 100) / 100,
            paragraphCount,
            readingComplexity: Math.round(readingComplexity),
            vocabularyRichness: Math.round(vocabularyRichness),
            repetitionIndex: Math.round(repetitionIndex),
            semanticCoherence: Math.round(semanticCoherence),
            ideaDensity: Math.round(ideaDensity),
            conceptualLeaps: Math.round(conceptualLeaps),
            narrativeConsistency: Math.round(narrativeConsistency),
            industryReadiness: Math.round(industryReadiness),
            clientPresentability: Math.round(clientPresentability),
            revisionPotential: Math.round(revisionPotential),
        };
    }
    [results, varianceAnalysis];
    ;
    // Generate creative insights
    const creativeInsights = useMemo(() => {
        if (!varianceAnalysis)
            return [];
        const insights = [];
        if (varianceAnalysis.uniquenessScore > 80) {
            insights.push({});
            type: 'positive',
                title;
            'High Creative Diversity',
                description;
            'Results show excellent variation with minimal repetition - perfect for exploring different creative directions.',
                metric;
            'uniquenessScore',
                value;
            varianceAnalysis.uniquenessScore,
            ;
        }
    });
}
if (varianceAnalysis.uniquenessScore < 40) {
    insights.push({});
    type: 'warning',
        title;
    'Low Creative Diversity',
        description;
    'Results are quite similar. Consider adjusting prompts or using different seeds for more variation.',
        metric;
    'uniquenessScore',
        value;
    varianceAnalysis.uniquenessScore,
    ;
}
;
if (advancedMetrics.industryReadiness > 75) {
    insights.push({});
    type: 'positive',
        title;
    'Industry-Ready Content',
        description;
    'Content meets professional standards with good vocabulary richness and complexity.',
        metric;
    'industryReadiness',
        value;
    advancedMetrics.industryReadiness,
    ;
}
;
if (advancedMetrics.clientPresentability > 80) {
    insights.push({});
    type: 'positive',
        title;
    'Client-Presentable Quality',
        description;
    'Results are polished and consistent enough for client presentation.',
        metric;
    'clientPresentability',
        value;
    advancedMetrics.clientPresentability,
    ;
}
;
if (advancedMetrics.clientPresentability < 50) {
    insights.push({});
    type: 'suggestion',
        title;
    'Consider Refinement',
        description;
    'Content may benefit from additional refinement before client presentation.',
        metric;
    'clientPresentability',
        value;
    advancedMetrics.clientPresentability,
    ;
}
;
if (varianceAnalysis.creativityScore > 70) {
    insights.push({});
    type: 'positive',
        title;
    'High Creative Value',
        description;
    'Results demonstrate strong creative potential with good conceptual variety.',
        metric;
    'creativityScore',
        value;
    varianceAnalysis.creativityScore,
    ;
}
;
if (advancedMetrics.revisionPotential > 75) {
    insights.push({});
    type: 'info',
        title;
    'Strong Revision Potential',
        description;
    'These results provide excellent foundation material for further creative development.',
        metric;
    'revisionPotential',
        value;
    advancedMetrics.revisionPotential,
    ;
}
;
return insights;
[varianceAnalysis, advancedMetrics];
;
if (!varianceAnalysis || results.length < 2) {
    return;
    _jsx("div", { className: `creative-variance-analyzer ${className}`, style: ({}, ), "background:": true });
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius;
    12,
        border;
    '1px solid #e2e8f0',
        padding;
    24,
        textAlign;
    'center';
}
 >
    (_jsx("div", { style: { fontSize: 24, marginBottom: 12 }, children: "\uD83D\uDCCA" })
        ,
            _jsx("div", { style: { fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }, children: "Variance Analysis Unavailable" })
                ,
                    _jsx("div", { style: { fontSize: 14, color: '#64748b' }, children: "Generate at least 2 results to enable creative variance analysis" }));
div >
;
;
const MetricCard, string;
value: number;
suffix ?  : string;
description: string;
color: string;
onClick ?  : () => void ;
 > ;
({ title, value, suffix = '', description, color, onClick }) => ()
    < div;
style = {};
{
    background: 'white',
        borderRadius;
    8,
        border;
    `2px solid ${color}20`;
}
padding: 16,
    cursor;
onClick ? 'pointer' : 'default',
    transition;
'all 0.2s',
    ':hover';
onClick ? {
    borderColor: color,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${color}20`
}
    :
;
{ }
onClick = { onClick }
    >
        (_jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
            }, children: [_jsx("span", { style: {
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#374151',
                    }, children: title }), _jsxs("span", { style: {
                        fontSize: 20,
                        fontWeight: 700,
                        color: color,
                    }, children: [value, suffix] })] })
            ,
                _jsx("div", { style: {
                        fontSize: 12,
                        color: '#6b7280',
                        lineHeight: 1.4,
                    }, children: description }));
{ /* Progress bar */ }
_jsxs("div", { style: {
        marginTop: 8,
        height: 4,
        background: '#f3f4f6',
        borderRadius: 2,
        overflow: 'hidden',
    }, children: [_jsx("div", { style: {
                height: '100%',
                background: color,
                width: `${Math.min(100, value)}%`
            } }), ", transition: 'width 0.3s ease'; }} />"] });
div >
;
;
return;
_jsx("div", { className: `creative-variance-analyzer ${className}`, style: ({}, ), "background:": true });
'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius;
12,
    border;
'1px solid #e2e8f0',
    overflow;
'hidden';
 >
    { /* Header */}
    < div;
style = {};
{
    padding: 20,
        borderBottom;
    '1px solid #e2e8f0',
        background;
    'rgba(255, 255, 255, 0.8)',
    ;
}
 >
    (_jsx("h3", { style: {
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        }, children: "\uD83D\uDCCA Creative Variance Analysis" })
        ,
            _jsxs("div", { style: {
                    fontSize: 14,
                    color: '#64748b',
                    marginTop: 4,
                }, children: ["Professional insights for ", results.length, " generated results"] }));
div >
    { /* Tab Navigation */}
    < div;
style = {};
{
    display: 'flex',
        borderBottom;
    '1px solid #e2e8f0',
        background;
    'rgba(255, 255, 255, 0.6)',
    ;
}
 >
    { [{ id: 'overview', label: '🎯 Overview', icon: '🎯' },
            { id: 'content', label: '📝 Content Analysis', icon: '📝' },
            { id: 'creative', label: '🎨 Creative Metrics', icon: '🎨' },
            { id: 'professional', label: '💼 Professional Assessment', icon: '💼' }]: .map(tab => ()
            < button, key = { tab, : .id }, onClick = {}(), setActiveTab(tab.id)) };
style = {};
{
    flex: 1,
        padding;
    12,
        border;
    'none',
        background;
    activeTab === tab.id ? '#3b82f6' : 'transparent',
        color;
    activeTab === tab.id ? 'white' : '#64748b',
        fontSize;
    13,
        fontWeight;
    500,
        cursor;
    'pointer',
        transition;
    'all 0.2s',
    ;
}
    >
        { tab, : .label };
button >
;
div >
    { /* Tab Content */}
    < div;
style = {};
{
    padding: 20;
}
 >
    { activeTab } === 'overview' && (());
{ /* Key Insights */ }
_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h4", { style: {
                margin: '0 0 12px 0',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
            }, children: "\uD83D\uDD0D Key Creative Insights" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [creativeInsights.slice(0, 3).map((insight, index) => ()
                    < div, key = { index }, style = {}, {
                    padding: 12,
                    background: insight.type === 'positive' ? '#dcfce7' : ,
                    insight, : .type === 'warning' ? '#fef3c7' :
                        insight.type === 'suggestion' ? '#dbeafe' : '#f3f4f6',
                    borderRadius: 6,
                    borderLeft: `4px solid ${}
                      insight.type === 'positive' ? '#10b981' :
                        insight.type === 'warning' ? '#f59e0b' :
                          insight.type === 'suggestion' ? '#3b82f6' : '#6b7280'
                    }`
                }), ">", _jsxs("div", { style: {
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1f2937',
                        marginBottom: 4,
                    }, children: [insight.title, " (", insight.value, "%)"] }), _jsx("div", { style: {
                        fontSize: 12,
                        color: '#4b5563',
                        lineHeight: 1.4,
                    }, children: insight.description })] }), "))}"] });
div >
    { /* Quick Stats */}
    < div;
style = {};
{
    display: 'grid',
        gridTemplateColumns;
    'repeat(auto-fit, minmax(150px, 1fr))',
        gap;
    12,
    ;
}
 >
    (_jsx(MetricCard, { title: "Uniqueness", value: varianceAnalysis.uniquenessScore, suffix: "%", description: "Content variation across results", color: "#10b981" })
        ,
            _jsx(MetricCard, { title: "Creativity", value: varianceAnalysis.creativityScore, suffix: "%", description: "Creative potential and originality", color: "#8b5cf6" })
                ,
                    _jsx(MetricCard, { title: "Industry Ready", value: advancedMetrics.industryReadiness, suffix: "%", description: "Professional quality assessment", color: "#3b82f6" })
                        ,
                            _jsx(MetricCard, { title: "Client Ready", value: advancedMetrics.clientPresentability, suffix: "%", description: "Presentation readiness", color: "#f59e0b" }));
div >
;
div >
;
{
    activeTab === 'content' && ()
        < div;
    style = {};
    {
        display: 'grid',
            gridTemplateColumns;
        'repeat(auto-fit, minmax(200px, 1fr))',
            gap;
        16,
        ;
    }
}
 >
    (_jsx(MetricCard, { title: "Word Count Variance", value: Math.round(varianceAnalysis.wordCountVariance), description: "Variation in content length", color: "#6366f1" })
        ,
            _jsx(MetricCard, { title: "Length Distribution", value: Math.round(varianceAnalysis.lengthDistribution.avg), suffix: " chars", description: `Range: ${varianceAnalysis.lengthDistribution.min}-${varianceAnalysis.lengthDistribution.max}`, color: "#10b981" })
                ,
                    _jsx(MetricCard, { title: "Reading Complexity", value: advancedMetrics.readingComplexity, suffix: "%", description: "Text complexity and readability", color: "#f59e0b" })
                        ,
                            _jsx(MetricCard, { title: "Vocabulary Richness", value: advancedMetrics.vocabularyRichness, suffix: "%", description: "Unique words vs total words", color: "#8b5cf6" })
                                ,
                                    _jsx(MetricCard, { title: "Repetition Index", value: advancedMetrics.repetitionIndex, suffix: "%", description: "Content repetition across results", color: "#ef4444" })
                                        ,
                                            _jsx(MetricCard, { title: "Diversity Index", value: Math.round(varianceAnalysis.diversityIndex * 100), suffix: "%", description: "Content type diversity", color: "#06b6d4" }));
div >
;
{
    activeTab === 'creative' && ()
        < div;
    style = {};
    {
        display: 'grid',
            gridTemplateColumns;
        'repeat(auto-fit, minmax(200px, 1fr))',
            gap;
        16,
        ;
    }
}
 >
    (_jsx(MetricCard, { title: "Idea Density", value: advancedMetrics.ideaDensity, suffix: "%", description: "Concept richness per 100 words", color: "#8b5cf6" })
        ,
            _jsx(MetricCard, { title: "Conceptual Leaps", value: advancedMetrics.conceptualLeaps, suffix: "%", description: "Thematic variety and innovation", color: "#06b6d4" })
                ,
                    _jsx(MetricCard, { title: "Narrative Consistency", value: advancedMetrics.narrativeConsistency, suffix: "%", description: "Story coherence across results", color: "#10b981" })
                        ,
                            _jsx(MetricCard, { title: "Tone Variation", value: varianceAnalysis.toneVariation, suffix: "%", description: "Emotional range across content", color: "#f59e0b" })
                                ,
                                    _jsx(MetricCard, { title: "Semantic Coherence", value: advancedMetrics.semanticCoherence, suffix: "%", description: "Meaning consistency", color: "#3b82f6" })
                                        ,
                                            _jsx(MetricCard, { title: "Revision Potential", value: advancedMetrics.revisionPotential, suffix: "%", description: "Foundation for further development", color: "#ef4444" }));
div >
;
{
    activeTab === 'professional' && ()
        < div >
        _jsxs("div", { style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }, children: [_jsx(MetricCard, { title: "Industry Readiness", value: advancedMetrics.industryReadiness, suffix: "%", description: "Professional standards compliance", color: "#3b82f6" }), _jsx(MetricCard, { title: "Client Presentability", value: advancedMetrics.clientPresentability, suffix: "%", description: "Ready for client presentation", color: "#10b981" }), _jsx(MetricCard, { title: "Professional Suitability", value: varianceAnalysis.professionalSuitability, suffix: "%", description: "Overall professional quality", color: "#8b5cf6" }), _jsx(MetricCard, { title: "Genre Consistency", value: varianceAnalysis.genreConsistency, suffix: "%", description: "Thematic and stylistic coherence", color: "#f59e0b" })] });
    { /* Professional Recommendations */ }
    _jsxs("div", { children: [_jsx("h4", { style: {
                    margin: '0 0 12px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151',
                }, children: "\uD83D\uDCBC Professional Recommendations" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [creativeInsights.filter(insight => )['industryReadiness', 'clientPresentability', 'professionalSuitability'].includes(insight.metric), ").map((insight, index) => ()", _jsxs("div", { style: {
                            padding: 12,
                            background: 'white',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                        }, children: [_jsx("div", { style: {
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    marginBottom: 4,
                                }, children: insight.title }), _jsx("div", { style: {
                                    fontSize: 12,
                                    color: '#4b5563',
                                    lineHeight: 1.4,
                                }, children: insight.description })] }, index), "))}"] })] });
    div >
    ;
}
div >
;
div >
;
;
;
export default CreativeVarianceAnalyzer;
