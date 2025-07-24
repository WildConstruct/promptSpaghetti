import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ExecutionPathVisualization } from './components/ExecutionPathVisualization.js';
import { professionalColors } from './styles/professional-design-system.js';
export const PreviewModal = ({ open, loading, error, results, onClose, onCancel, onResultHover, onNodeHighlight }) => {
    const [showExecutionPaths, setShowExecutionPaths] = useState(false);
    // Check if results have execution path data
    const hasExecutionPaths = results.length > 0 &&
        results.some(r => 'executionPath' in r && r.executionPath);
    if (!open)
        return null;
    return (_jsx("div", { role: "dialog", "aria-modal": "true", style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }, children: _jsxs("div", { style: {
                background: professionalColors.background.elevated,
                borderRadius: 12,
                padding: 24,
                minWidth: 400,
                maxWidth: hasExecutionPaths ? 800 : 600,
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                color: professionalColors.text.primary
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16
                    }, children: [_jsx("h2", { style: { margin: 0 }, children: "Generated Content" }), hasExecutionPaths && (_jsx("button", { onClick: () => setShowExecutionPaths(!showExecutionPaths), style: {
                                background: showExecutionPaths ? '#4d7cff' : '#e2e8f0',
                                color: showExecutionPaths ? '#fff' : '#2d3748',
                                border: 'none',
                                borderRadius: 4,
                                padding: '8px 12px',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer'
                            }, children: showExecutionPaths ? '📊 Hide Paths' : '🔍 Show Paths' }))] }), loading && _jsx("div", { style: { marginBottom: 12 }, children: "\u2728 Generating content..." }), error && _jsxs("div", { style: { color: '#c00' }, children: ["\u26A0\uFE0F Something went wrong: ", error] }), !loading && !error && (_jsxs("div", { children: [showExecutionPaths && hasExecutionPaths && (_jsx("div", { style: { marginBottom: 20 }, children: _jsx(ExecutionPathVisualization, { results: results, onNodeHighlight: onNodeHighlight, config: {
                                    showExecutionOrder: true,
                                    showRandomChoices: true,
                                    showPerformanceMetrics: true
                                } }) })), _jsx("ul", { style: { padding: 0, listStyle: 'none' }, children: results.map((res, i) => {
                                const hasPath = 'executionPath' in res && res.executionPath;
                                return (_jsxs("li", { onMouseEnter: () => onResultHover?.(i), style: {
                                        marginBottom: 16,
                                        padding: 8,
                                        border: '1px solid #eee',
                                        borderRadius: 4,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        background: hasPath ? '#f8fafc' : '#fff'
                                    }, children: [_jsx("span", { style: {
                                                position: 'absolute',
                                                top: -10,
                                                left: -10,
                                                background: res.error ? '#c00' : '#4d7cff',
                                                color: '#fff',
                                                fontSize: 10,
                                                padding: '2px 6px',
                                                borderRadius: 12,
                                                fontWeight: 600
                                            }, children: res.seed }), hasPath && (_jsx("div", { style: {
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                background: '#10b981',
                                                color: '#fff',
                                                fontSize: 9,
                                                padding: '2px 4px',
                                                borderRadius: 8,
                                                fontWeight: 500
                                            }, children: "PATH" })), res.error ? (_jsxs("div", { style: { color: '#c00' }, children: ["\u26A0\uFE0F ", res.error] })) : (_jsx("div", { style: { fontFamily: 'monospace', whiteSpace: 'pre-wrap' }, children: res.output || ('output' in res ? res.output : '') })), hasPath && 'executionTimeMs' in res && (_jsxs("div", { style: {
                                                marginTop: 8,
                                                padding: 6,
                                                background: '#e2e8f0',
                                                borderRadius: 4,
                                                fontSize: 11,
                                                color: '#4a5568'
                                            }, children: ["Execution: ", res.executionTimeMs, "ms", res.executionPath && (_jsxs("span", { style: { marginLeft: 8 }, children: ["\u2022 ", res.executionPath.steps.length, " steps \u2022 ", res.executionPath.randomizationPoints.length, " random points"] }))] })), hasPath && 'weightChoices' in res && res.weightChoices && res.weightChoices.length > 0 && (_jsxs("div", { style: {
                                                marginTop: 8,
                                                padding: 8,
                                                background: 'rgba(77, 124, 255, 0.1)',
                                                border: '1px solid rgba(77, 124, 255, 0.2)',
                                                borderRadius: 4
                                            }, children: [_jsx("div", { style: {
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        color: '#4d7cff',
                                                        marginBottom: 6
                                                    }, children: "\uD83C\uDFAC Weight Impact Analysis:" }), res.weightChoices.map((choice, idx) => (_jsxs("div", { style: {
                                                        fontSize: 10,
                                                        color: '#4a5568',
                                                        marginBottom: 2,
                                                        lineHeight: 1.3
                                                    }, children: [_jsxs("strong", { children: [choice.nodeId, ":"] }), " Selected \"", choice.selectedOption, "\"", choice.selectionProbability && (_jsxs("span", { style: { color: '#4d7cff' }, children: [' ', "(", (choice.selectionProbability * 100).toFixed(1), "% chance)"] }))] }, idx)))] }))] }, i));
                            }) })] })), _jsx("button", { onClick: onClose, style: { marginTop: 16 }, children: "Close" })] }) }));
};
