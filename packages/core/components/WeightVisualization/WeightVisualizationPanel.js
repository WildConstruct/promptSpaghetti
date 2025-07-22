import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Weight Visualization Panel
 * Epic 8.3 Task 2: Professional weight visualization panel with multiple chart types
 *
 * Comprehensive visualization panel for creative weight management
 */
import { useState, useMemo } from 'react';
import { WeightDistributionChart } from './WeightDistributionChart';
import { CollapsibleSection } from '../Inspector/CollapsibleSection';
export const WeightVisualizationPanel = ({ options, title = 'Weight Distribution', defaultChartType = 'pie', showChartControls = true, showStatistics = true, collapsed = false, onCollapseChange, onOptionHover, onOptionClick, className, style }) => {
    const [chartType, setChartType] = useState(defaultChartType);
    const [colorScheme, setColorScheme] = useState('cinema4d');
    const [showLabels, setShowLabels] = useState(true);
    const [showPercentages, setShowPercentages] = useState(true);
    // Calculate statistics
    const statistics = useMemo(() => {
        if (options.length === 0)
            return null;
        const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
        const weights = options.map(opt => opt.weight);
        const normalizedWeights = weights.map(w => totalWeight > 0 ? w / totalWeight : 1 / options.length);
        // Calculate entropy (measure of distribution evenness)
        const entropy = -normalizedWeights.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);
        const maxEntropy = Math.log2(options.length);
        const evenness = maxEntropy > 0 ? entropy / maxEntropy : 0;
        // Find dominant option
        const maxWeightIndex = weights.indexOf(Math.max(...weights));
        const dominantOption = options[maxWeightIndex];
        const dominancePercentage = normalizedWeights[maxWeightIndex] * 100;
        return {
            totalWeight,
            minWeight: Math.min(...weights),
            maxWeight: Math.max(...weights),
            avgWeight: totalWeight / options.length,
            entropy: entropy,
            evenness: evenness,
            dominantOption,
            dominancePercentage,
            isBalanced: evenness > 0.8, // Consider balanced if entropy > 80% of max
            optionCount: options.length
        };
    }, [options]);
    // Chart type controls
    const ChartTypeSelector = () => (_jsx("div", { style: { display: 'flex', gap: 4, marginBottom: 12 }, children: [
            { type: 'pie', icon: '◯', label: 'Pie' },
            { type: 'donut', icon: '○', label: 'Donut' },
            { type: 'bar', icon: '▬', label: 'Bar' }
        ].map(({ type, icon, label }) => (_jsxs("button", { onClick: () => setChartType(type), style: {
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 500,
                border: '1px solid rgba(55, 65, 81, 0.6)',
                borderRadius: 4,
                background: chartType === type ? '#ff7c00' : 'rgba(31, 41, 55, 0.5)',
                color: chartType === type ? '#fff' : '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4
            }, onMouseEnter: (e) => {
                if (chartType !== type) {
                    e.currentTarget.style.background = 'rgba(255, 124, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#ff7c00';
                }
            }, onMouseLeave: (e) => {
                if (chartType !== type) {
                    e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 0.6)';
                }
            }, children: [_jsx("span", { style: { fontSize: 12 }, children: icon }), _jsx("span", { children: label })] }, type))) }));
    // Color scheme selector
    const ColorSchemeSelector = () => (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: { fontSize: 11, color: '#9ca3af', marginBottom: 6, display: 'block' }, children: "Color Scheme" }), _jsxs("select", { value: colorScheme, onChange: (e) => setColorScheme(e.target.value), style: {
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 11,
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(55, 65, 81, 0.6)',
                    borderRadius: 4,
                    color: '#e5e7eb',
                    cursor: 'pointer'
                }, children: [_jsx("option", { value: "cinema4d", children: "Cinema 4D Orange" }), _jsx("option", { value: "professional", children: "Professional Blue" }), _jsx("option", { value: "warm", children: "Warm Palette" }), _jsx("option", { value: "cool", children: "Cool Palette" })] })] }));
    // Display options
    const DisplayOptions = () => (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: { fontSize: 11, color: '#9ca3af', marginBottom: 6, display: 'block' }, children: "Display Options" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#e5e7eb', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: showLabels, onChange: (e) => setShowLabels(e.target.checked), style: { cursor: 'pointer' } }), "Show Labels"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#e5e7eb', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: showPercentages, onChange: (e) => setShowPercentages(e.target.checked), style: { cursor: 'pointer' } }), "Show Percentages"] })] })] }));
    // Statistics display
    const StatisticsDisplay = () => {
        if (!statistics || !showStatistics)
            return null;
        return (_jsxs("div", { style: {
                marginTop: 16,
                padding: 12,
                background: 'rgba(31, 41, 55, 0.3)',
                borderRadius: 6,
                border: '1px solid rgba(55, 65, 81, 0.4)'
            }, children: [_jsx("h4", { style: {
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#e5e7eb',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }, children: "Distribution Statistics" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }, children: [_jsxs("div", { style: { color: '#9ca3af' }, children: [_jsxs("div", { children: ["Options: ", _jsx("span", { style: { color: '#e5e7eb', fontWeight: 500 }, children: statistics.optionCount })] }), _jsxs("div", { children: ["Total Weight: ", _jsx("span", { style: { color: '#e5e7eb', fontWeight: 500 }, children: statistics.totalWeight.toFixed(2) })] }), _jsxs("div", { children: ["Average: ", _jsx("span", { style: { color: '#e5e7eb', fontWeight: 500 }, children: statistics.avgWeight.toFixed(2) })] })] }), _jsxs("div", { style: { color: '#9ca3af' }, children: [_jsxs("div", { children: ["Min: ", _jsx("span", { style: { color: '#e5e7eb', fontWeight: 500 }, children: statistics.minWeight.toFixed(2) })] }), _jsxs("div", { children: ["Max: ", _jsx("span", { style: { color: '#e5e7eb', fontWeight: 500 }, children: statistics.maxWeight.toFixed(2) })] }), _jsxs("div", { children: ["Range: ", _jsx("span", { style: { color: '#e5e7eb', fontWeight: 500 }, children: (statistics.maxWeight - statistics.minWeight).toFixed(2) })] })] })] }), _jsxs("div", { style: { marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(55, 65, 81, 0.4)' }, children: [_jsxs("div", { style: { fontSize: 10, color: '#9ca3af', marginBottom: 4 }, children: ["Dominant Option: ", _jsxs("span", { style: { color: '#ff7c00', fontWeight: 500 }, children: [statistics.dominantOption.text, " (", statistics.dominancePercentage.toFixed(1), "%)"] })] }), _jsxs("div", { style: { fontSize: 10, color: '#9ca3af' }, children: ["Balance Score: ", _jsxs("span", { style: {
                                        color: statistics.isBalanced ? '#10b981' : '#f59e0b',
                                        fontWeight: 500
                                    }, children: [(statistics.evenness * 100).toFixed(0), "%"] }), _jsxs("span", { style: { marginLeft: 4, fontSize: 9 }, children: ["(", statistics.isBalanced ? 'Well Balanced' : 'Unbalanced', ")"] })] })] })] }));
    };
    const content = (_jsxs("div", { style: { padding: '0 4px' }, children: [showChartControls && (_jsxs(_Fragment, { children: [_jsx(ChartTypeSelector, {}), _jsx(ColorSchemeSelector, {}), _jsx(DisplayOptions, {})] })), _jsx("div", { style: { display: 'flex', justifyContent: 'center', marginBottom: 8 }, children: _jsx(WeightDistributionChart, { options: options, type: chartType, width: 240, height: chartType === 'bar' ? Math.min(300, Math.max(160, options.length * 32 + 60)) : 240, showLabels: showLabels, showPercentages: showPercentages, colorScheme: colorScheme, onOptionHover: onOptionHover, onOptionClick: onOptionClick }) }), _jsx(StatisticsDisplay, {})] }));
    // If no onCollapseChange provided, render non-collapsible version
    if (!onCollapseChange) {
        return (_jsxs("div", { className: className, style: style, children: [_jsx("div", { style: {
                        marginBottom: 12,
                        paddingBottom: 8,
                        borderBottom: '1px solid rgba(55, 65, 81, 0.4)'
                    }, children: _jsxs("h3", { style: {
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#e5e7eb',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }, children: ["\uD83D\uDCCA ", title] }) }), content] }));
    }
    // Collapsible version
    return (_jsx("div", { className: className, style: style, children: _jsx(CollapsibleSection, { title: `📊 ${title}`, collapsed: collapsed, onToggle: onCollapseChange, className: "weight-visualization-panel", children: content }) }));
};
export default WeightVisualizationPanel;
