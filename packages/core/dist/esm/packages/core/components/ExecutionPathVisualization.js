import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Execution Path Visualization Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 */
import { useState } from 'react';
import { EXECUTION_PATH_COLORS, DEFAULT_VISUALIZATION_CONFIG } from '../types/ExecutionPath';
{
    const vizConfig = { ...DEFAULT_VISUALIZATION_CONFIG, ...config };
    const [expandedResults, setExpandedResults] = useState(new Set());
    const [selectedPath, setSelectedPath] = useState(null);
    const toggleResultExpanded = (index) => {
        const newExpanded = new Set(expandedResults);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        }
        else {
            newExpanded.add(index);
            setExpandedResults(newExpanded);
        }
        ;
        const handlePathSelect = (pathId, nodeIds) => {
            setSelectedPath(selectedPath === pathId ? null : pathId);
            if (onNodeHighlight) {
                onNodeHighlight(selectedPath === pathId ? [] : nodeIds);
            }
            ;
            // Calculate aggregate stats
            const validResults = results.filter(r => r.executionPath);
            const totalExecution = validResults.reduce((sum, r) => sum + r.executionTimeMs, 0);
            const averageTime = validResults.length > 0 ? totalExecution / validResults.length : 0;
            return;
            _jsx("div", { className: `execution-path-visualization ${className}`, style: ({}, ), "background:": true });
            '#1a202c',
                borderRadius;
            8,
                padding;
            16,
                fontFamily;
            'system-ui, -apple-system, sans-serif';
        };
    };
     >
        _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                borderBottom: '1px solid #4a5568',
                paddingBottom: 12,
            }, children: [_jsx("h3", { style: {
                        color: '#e2e8f0',
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                    }, children: "Execution Path Analysis" }), validResults.length > 0 && ()
                    < div, " style=", {
                    display: 'flex',
                    gap: 16,
                    fontSize: 12,
                    color: '#a0aec0',
                }, ">", _jsxs("span", { children: ["Avg: ", averageTime.toFixed(0), "ms"] }), _jsxs("span", { children: ["Paths: ", validResults.length] })] });
}
div >
    { validResults, : .length === 0 ? ()
            < div : , style = {} };
{
    color: '#a0aec0',
        fontStyle;
    'italic',
        textAlign;
    'center',
        padding;
    24,
    ;
}
 >
    No;
execution;
path;
data;
available;
div >
;
()
    < div;
style = {};
{
    display: 'flex', flexDirection;
    'column', gap;
    12;
}
 >
    { results, : .map((result, index) => {
            if (!result.executionPath)
                return null;
            const path = result.executionPath;
            const isExpanded = expandedResults.has(index);
            const isSelected = selectedPath === path.id;
            const pathColor = EXECUTION_PATH_COLORS[index % EXECUTION_PATH_COLORS.length];
            return;
            _jsx("div", { style: {
                    border: `1px solid ${isSelected ? pathColor : '#4a5568'}`
                }, "borderRadius:": true }, index);
            6,
                background;
            isSelected ? 'rgba(66, 153, 225, 0.1)' : '#2d3748',
                overflow;
            'hidden';
        }) }
    >
        { /* Path Header */}
    < div;
style = {};
{
    display: 'flex',
        justifyContent;
    'space-between',
        alignItems;
    'center',
        padding;
    12,
        cursor;
    'pointer',
        background;
    isSelected ? 'rgba(66, 153, 225, 0.05)' : 'transparent',
    ;
}
onClick = {}();
handlePathSelect(path.id, path.nodeExecutionOrder);
    >
        _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("div", { style: {
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: pathColor,
                    } }), _jsxs("span", { style: { color: '#e2e8f0', fontSize: 14, fontWeight: 500 }, children: ["Seed ", result.seed] }), path.randomizationPoints.length > 0 && ()
                    < span, " style=", {
                    background: '#805ad5',
                    color: '#fff',
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 10,
                    fontWeight: 500,
                }, ">", path.randomizationPoints.length, " random"] });
div >
    _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsxs("span", { style: { color: '#a0aec0', fontSize: 12 }, children: [path.totalExecutionTime, "ms \u2022 ", path.steps.length, " steps"] }), _jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    toggleResultExpanded(index);
                }, style: {
                    background: 'none',
                    border: 'none',
                    color: '#a0aec0',
                    cursor: 'pointer',
                    fontSize: 16,
                }, children: isExpanded ? '▼' : '▶' })] });
div >
    { /* Path Details */};
{
    isExpanded && ()
        < div;
    style = {};
    {
        borderTop: '1px solid #4a5568',
            padding;
        12,
            background;
        '#1a202c',
        ;
    }
}
 >
    { /* Execution Steps */};
{
    vizConfig.showExecutionOrder && ()
        < div;
    style = {};
    {
        marginBottom: 16;
    }
}
 >
    (_jsx("div", { style: {
            color: '#e2e8f0',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
        }, children: "Execution Order" })
        ,
            _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 4 }, children: [path.nodeExecutionOrder.map((nodeId, stepIndex) => ()
                        < div, key = {} `${nodeId}-${stepIndex}`), "style=", {
                        background: '#4a5568',
                        color: '#e2e8f0',
                        fontSize: 10,
                        padding: '3px 6px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                    }, ">", stepIndex + 1, ". ", nodeId.slice(0, 8), "..."] }));
div >
;
div >
;
{ /* Random Choices */ }
{
    vizConfig.showRandomChoices && path.randomizationPoints.length > 0 && ()
        < div;
    style = {};
    {
        marginBottom: 16;
    }
}
 >
    _jsx("div", { style: {
            color: '#e2e8f0',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
        }, children: "Randomization Points" });
{
    path.randomizationPoints.map((choice, choiceIndex) => ()
        < div, key = { choiceIndex }, style = {}, {
        background: '#805ad5',
        color: '#fff',
        fontSize: 11,
        padding: 8,
        borderRadius: 4,
        marginBottom: 4,
        fontFamily: 'monospace',
    });
}
    >
        (_jsxs("div", { style: { fontWeight: 600 }, children: [choice.choiceType.toUpperCase(), ": ", choice.selectedOption] })
            ,
                _jsx("div", { style: { opacity: 0.9, marginTop: 2 }, children: choice.selectionReason }));
{
    choice.probability && ()
        < div;
    style = {};
    {
        opacity: 0.8, marginTop;
        2;
    }
}
 >
    Probability;
{
    (choice.probability * 100).toFixed(1);
}
 %
;
div >
;
div >
;
div >
;
{ /* Performance Breakdown */ }
{
    vizConfig.showPerformanceMetrics && result.debugInfo && ()
        < div >
        (_jsx("div", { style: {
                color: '#e2e8f0',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
            }, children: "Performance Breakdown" })
            ,
                _jsxs("div", { style: {
                        background: '#2d3748',
                        padding: 8,
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: '#a0aec0',
                    }, children: [Object.entries(result.debugInfo.performanceBreakdown).map(([nodeType, time]) => ()
                            < div, key = { nodeType }, style = {}, {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 2,
                        }), ">", _jsxs("span", { children: [nodeType, ":"] }), _jsxs("span", { children: [typeof time === 'number' ? time.toFixed(1) : time, "ms"] })] }));
}
div >
;
div >
;
div >
;
div >
;
;
div >
;
div >
;
;
;
export default ExecutionPathVisualization;
