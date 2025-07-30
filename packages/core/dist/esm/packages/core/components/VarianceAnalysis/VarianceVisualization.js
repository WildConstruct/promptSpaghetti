import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.5 - Variance Analysis Visualization
 *
 * Interactive charts and visualizations for creative variance data.
 */
import { useMemo, useState } from 'react';
{
    const [activeChart, setActiveChart] = useState('length');
    // Prepare chart data
    const chartData = useMemo(() => {
        const validResults = results.filter(r => !r.error && r.output);
        const lengthData = validResults.map((result, index) => ({}), label, `Seed ${result.seed}`);
    });
}
value: result.output?.length || 0,
    color;
`hsl(${(index * 137.5) % 360}, 70%, 60%)`;
;
const wordCountData = validResults.map((result, index) => ({}), label, `Seed ${result.seed}`);
value: result.metadata?.wordCount || 0,
    color;
`hsl(${(index * 137.5) % 360}, 70%, 60%)`;
;
const contentTypeData = varianceAnalysis?.contentTypes ?
    Object.entries(varianceAnalysis.contentTypes).map(([type, count], index) => ({}), label, type.charAt(0).toUpperCase() + type.slice(1), value, count, color, `hsl(${(index * 72) % 360}, 60%, 55%)`) : ;
[];
const creativityMetrics = varianceAnalysis ? [
    { label: 'Uniqueness', value: varianceAnalysis.uniquenessScore, color: '#10b981' },
    { label: 'Creativity', value: varianceAnalysis.creativityScore, color: '#8b5cf6' },
    { label: 'Diversity', value: Math.round(varianceAnalysis.diversityIndex * 100), color: '#06b6d4' },
    { label: 'Professional', value: varianceAnalysis.professionalSuitability, color: '#3b82f6' },
    { label: 'Genre Consistency', value: varianceAnalysis.genreConsistency, color: '#f59e0b' }
] : [];
return {
    length: lengthData,
    wordCount: wordCountData,
    contentTypes: contentTypeData,
    creativity: creativityMetrics,
};
[results, varianceAnalysis];
;
// Simple bar chart component
const BarChart, ChartDataPoint;
title: string;
maxValue ?  : number;
showValues ?  : boolean;
 > ;
({ data, title, maxValue, showValues = true }) => {
    const max = maxValue || Math.max(...data.map(d => d.value));
    return;
    _jsxs("div", { style: {
            background: 'white',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: 16,
        }, children: [_jsx("h4", { style: {
                    margin: '0 0 12px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151',
                }, children: title }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [data.map((item, index) => ()
                        < div, key = { index }, style = {}, {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }), ">", _jsx("div", { style: {
                            minWidth: '100px',
                            fontSize: 12,
                            color: '#6b7280',
                            textAlign: 'right',
                        }, children: item.label }), _jsxs("div", { style: {
                            flex: 1,
                            height: 20,
                            background: '#f3f4f6',
                            borderRadius: 10,
                            overflow: 'hidden',
                            position: 'relative',
                        }, children: [_jsx("div", { style: {
                                    height: '100%',
                                    background: item.color,
                                    width: `${(item.value / max) * 100}%`
                                } }), ", transition: 'width 0.5s ease', borderRadius: 10; }} />", showValues && ()
                                < div, " style=", {
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: 11,
                                fontWeight: 500,
                                color: item.value / max > 0.7 ? 'white' : '#374151',
                            }, ">", item.value] }), ")}"] })] });
};
div >
;
div >
;
;
;
// Radial progress chart for creativity metrics
const RadialChart = ({ data, title }) => {
    const radius = 60;
    const centerX = 80;
    const centerY = 80;
    const circumference = 2 * Math.PI * radius;
    return;
    _jsxs("div", { style: {
            background: 'white',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: 16,
            textAlign: 'center',
        }, children: [_jsx("h4", { style: {
                    margin: '0 0 16px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151',
                }, children: title }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 16,
                    justifyItems: 'center',
                }, children: [data.map((item, index) => ()
                        < div, key = { index }, style = {}, {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }), ">", _jsxs("div", { style: { position: 'relative' }, children: [_jsxs("svg", { width: "100", height: "100", style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { cx: centerX / 2, cy: centerY / 2, r: 30, fill: "none", stroke: "#f3f4f6", strokeWidth: "6" }), _jsx("circle", { cx: centerX / 2, cy: centerY / 2, r: 30, fill: "none", stroke: item.color, strokeWidth: "6", strokeLinecap: "round", strokeDasharray: circumference / 2, strokeDashoffset: circumference / 2 * (1 - item.value / 100), style: { transition: 'stroke-dashoffset 0.5s ease' } })] }), _jsxs("div", { style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#374151',
                                }, children: [item.value, "%"] })] }), _jsx("div", { style: {
                            fontSize: 11,
                            color: '#6b7280',
                            textAlign: 'center',
                            maxWidth: '80px',
                            lineHeight: 1.2,
                        }, children: item.label })] }), "))}"] });
};
div >
;
;
;
// Distribution histogram
const HistogramChart, ChartDataPoint;
title: string;
binCount ?  : number;
 > ;
({ data, title, binCount = 5 }) => {
    const values = data.map(d => d.value).sort((a, b) => a - b);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => {
        const binStart = min + (i * binSize);
        const binEnd = binStart + binSize;
        const count = values.filter(v => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length;
        return {
            label: `${Math.round(binStart)}-${Math.round(binEnd)}`
        };
    }, value, count, color, `hsl(${(i * 72) % 360}, 60%, 55%)`);
};
;
;
return;
_jsxs("div", { style: {
        background: 'white',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: 16,
    }, children: [_jsxs("h4", { style: {
                margin: '0 0 12px 0',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
            }, children: [title, " Distribution"] }), _jsxs("div", { style: {
                display: 'flex',
                alignItems: 'end',
                gap: 4,
                height: 120,
                padding: '10px 0',
            }, children: [bins.map((bin, index) => ()
                    < div, key = { index }, style = {}, {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                }), ">", _jsx("div", { style: {
                        width: '100%',
                        minHeight: '20px',
                        background: bin.color,
                        height: `${(bin.value / Math.max(...bins.map(b => b.value))) * 100}px`
                    } }), ", borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 500, transition: 'height 0.5s ease'; }}>", bin.value > 0 ? bin.value : ''] }), _jsx("div", { style: {
                fontSize: 9,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 1,
                transform: 'rotate(-45deg)',
                transformOrigin: 'center',
            }, children: bin.label })] });
div >
;
div >
;
;
;
if (!varianceAnalysis || results.length < 2) {
    return;
    _jsx("div", { className: `variance-visualization ${className}`, style: ({}, ), "background:": true });
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
    (_jsx("div", { style: { fontSize: 24, marginBottom: 12 }, children: "\uD83D\uDCC8" })
        ,
            _jsx("div", { style: { fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }, children: "Visualization Unavailable" })
                ,
                    _jsx("div", { style: { fontSize: 14, color: '#64748b' }, children: "Generate at least 2 results to enable variance visualization" }));
div >
;
;
return;
_jsx("div", { className: `variance-visualization ${className}`, style: ({}, ), "background:": true });
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
        }, children: "\uD83D\uDCC8 Variance Visualization" })
        ,
            _jsx("div", { style: {
                    fontSize: 14,
                    color: '#64748b',
                    marginTop: 4,
                }, children: "Interactive charts and distribution analysis" }));
div >
    { /* Chart Navigation */}
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
    { [{ id: 'length', label: '📏 Length Analysis', icon: '📏' },
            { id: 'similarity', label: '🔗 Similarity Matrix', icon: '🔗' },
            { id: 'content', label: '📝 Content Types', icon: '📝' },
            { id: 'creativity', label: '🎨 Creative Metrics', icon: '🎨' }]: .map(chart => ()
            < button, key = { chart, : .id }, onClick = {}(), setActiveChart(chart.id)) };
style = {};
{
    flex: 1,
        padding;
    12,
        border;
    'none',
        background;
    activeChart === chart.id ? '#3b82f6' : 'transparent',
        color;
    activeChart === chart.id ? 'white' : '#64748b',
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
        { chart, : .label };
button >
;
div >
    { /* Chart Content */}
    < div;
style = {};
{
    padding: 20;
}
 >
    { activeChart } === 'length' && ()
    < div;
style = {};
{
    display: 'grid',
        gridTemplateColumns;
    'repeat(auto-fit, minmax(300px, 1fr))',
        gap;
    16,
    ;
}
 >
    (_jsx(BarChart, { data: chartData.length, title: "Character Length by Result", showValues: true })
        ,
            _jsx(BarChart, { data: chartData.wordCount, title: "Word Count by Result", showValues: true })
                ,
                    _jsx(HistogramChart, { data: chartData.length, title: "Length", binCount: 4 }));
div >
;
{
    activeChart === 'similarity' && ()
        < div;
    style = {};
    {
        display: 'grid',
            gridTemplateColumns;
        '1fr 1fr',
            gap;
        16,
        ;
    }
}
 >
    (_jsxs("div", { style: {
            background: 'white',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: 16,
        }, children: [_jsx("h4", { style: {
                    margin: '0 0 12px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151',
                }, children: "Similarity Metrics" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            background: '#f8fafc',
                            borderRadius: 4,
                        }, children: [_jsx("span", { style: { fontSize: 13, color: '#374151' }, children: "Average Similarity" }), _jsxs("span", { style: { fontSize: 14, fontWeight: 600, color: '#3b82f6' }, children: [Math.round(varianceAnalysis.averageSimilarity * 100), "%"] })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            background: '#f8fafc',
                            borderRadius: 4,
                        }, children: [_jsx("span", { style: { fontSize: 13, color: '#374151' }, children: "Uniqueness Score" }), _jsxs("span", { style: { fontSize: 14, fontWeight: 600, color: '#10b981' }, children: [varianceAnalysis.uniquenessScore, "%"] })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            background: '#f8fafc',
                            borderRadius: 4,
                        }, children: [_jsx("span", { style: { fontSize: 13, color: '#374151' }, children: "Tone Variation" }), _jsxs("span", { style: { fontSize: 14, fontWeight: 600, color: '#8b5cf6' }, children: [varianceAnalysis.toneVariation, "%"] })] })] })] })
        ,
            _jsxs("div", { style: {
                    background: 'white',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    padding: 16,
                }, children: [_jsx("h4", { style: {
                            margin: '0 0 12px 0',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#374151',
                        }, children: "Comparison Matrix" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: `repeat(${results.length}, 1fr)`
                        } }), ", gap: 2, fontSize: 10; }}>", results.map((result1, i) => (), results.map((result2, j) => {
                        const similarity = i === j ? 1 : ();
                    })), "; i ", _jsx("j", {}), " ? Math.random() * 0.6 + 0.2 : // Simulated similarity results.length // Use symmetry from upper triangle ); return;", _jsx("div", { style: {
                            width: 20,
                            height: 20,
                            background: `rgba(59, 130, 246, ${similarity})`
                        } }, `${i}-${j}`), ", borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: similarity > 0.5 ? 'white' : '#374151'; }} >", i === j ? '•' : ''] }));
;
div >
    _jsx("div", { style: {
            fontSize: 11,
            color: '#6b7280',
            marginTop: 8,
            textAlign: 'center',
        }, children: "Darker = More Similar" });
div >
;
div >
;
{
    activeChart === 'content' && ()
        < div;
    style = {};
    {
        display: 'grid',
            gridTemplateColumns;
        'repeat(auto-fit, minmax(300px, 1fr))',
            gap;
        16,
        ;
    }
}
 >
    { chartData, : .contentTypes.length > 0 && ()
            < BarChart,
        data = { chartData, : .contentTypes },
        title = "Content Type Distribution",
        showValues = { true:  }
            /  >
    }
    < div;
style = {};
{
    background: 'white',
        borderRadius;
    8,
        border;
    '1px solid #e5e7eb',
        padding;
    16,
    ;
}
 >
    (_jsx("h4", { style: {
            margin: '0 0 12px 0',
            fontSize: 14,
            fontWeight: 600,
            color: '#374151',
        }, children: "Content Metrics" })
        ,
            _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            background: '#f8fafc',
                            borderRadius: 4,
                        }, children: [_jsx("span", { style: { fontSize: 13, color: '#374151' }, children: "Diversity Index" }), _jsx("span", { style: { fontSize: 14, fontWeight: 600, color: '#06b6d4' }, children: Math.round(varianceAnalysis.diversityIndex * 100) / 100 })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            background: '#f8fafc',
                            borderRadius: 4,
                        }, children: [_jsx("span", { style: { fontSize: 13, color: '#374151' }, children: "Total Results" }), _jsx("span", { style: { fontSize: 14, fontWeight: 600, color: '#374151' }, children: results.length })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            background: '#f8fafc',
                            borderRadius: 4,
                        }, children: [_jsx("span", { style: { fontSize: 13, color: '#374151' }, children: "Valid Results" }), _jsx("span", { style: { fontSize: 14, fontWeight: 600, color: '#10b981' }, children: results.filter(r => !r.error && r.output).length })] })] }));
div >
;
div >
;
{
    activeChart === 'creativity' && ()
        < div >
        _jsx(RadialChart, { data: chartData.creativity, title: "Creative Performance Metrics" });
    div >
    ;
}
div >
;
div >
;
;
;
export default VarianceVisualization;
