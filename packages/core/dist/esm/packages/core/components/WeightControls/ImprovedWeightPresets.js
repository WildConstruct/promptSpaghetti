import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Improved Weight Presets with Raw Weight System
 * Uses raw weights (0-100) instead of normalized percentages
 * Includes new Ramp Up and Ramp Down presets
 */
import { useState } from 'react';
// Raw weight presets - NO normalization to 100
const RAW_WEIGHT_PRESETS = [
    {
        id: 'equal',
        name: 'Equal',
        description: 'All options have equal weight',
        icon: '⚖️',
        pattern: (count) => Array(count).fill(50) // All get weight of 50
    },
    {
        id: 'favor-first',
        name: 'Favor First',
        description: 'First option has higher weight',
        icon: '↗️',
        pattern: (count) => {
            if (count === 1)
                return [100];
            return [80, ...Array(count - 1).fill(20)]; // First gets 80, others get 20
        }
    },
    {
        id: 'favor-last',
        name: 'Favor Last',
        description: 'Last option has higher weight',
        icon: '↘️',
        pattern: (count) => {
            if (count === 1)
                return [100];
            return [...Array(count - 1).fill(20), 80]; // Last gets 80, others get 20
        }
    },
    {
        id: 'ramp-up',
        name: 'Ramp Up',
        description: 'Weights increase gradually',
        icon: '📈',
        pattern: (count) => {
            if (count === 1)
                return [50];
            const step = 60 / (count - 1); // Range from 20 to 80
            return Array(count).fill(0).map((_, i) => Math.round(20 + step * i));
        }
    },
    {
        id: 'ramp-down',
        name: 'Ramp Down',
        description: 'Weights decrease gradually',
        icon: '📉',
        pattern: (count) => {
            if (count === 1)
                return [50];
            const step = 60 / (count - 1); // Range from 80 to 20
            return Array(count).fill(0).map((_, i) => Math.round(80 - step * i));
        }
    },
    {
        id: 'bell-curve',
        name: 'Bell Curve',
        description: 'Middle options weighted higher',
        icon: '🔔',
        pattern: (count) => {
            if (count === 1)
                return [50];
            if (count === 2)
                return [30, 30];
            const center = (count - 1) / 2;
            return Array(count).fill(0).map((_, i) => {
                const distance = Math.abs(i - center);
                const maxDistance = Math.max(center, count - 1 - center);
                const normalized = 1 - (distance / maxDistance);
                return Math.round(20 + normalized * 60); // Range 20-80
            });
        }
    },
    {
        id: 'extremes',
        name: 'Extremes',
        description: 'First and last weighted higher',
        icon: '⟷',
        pattern: (count) => {
            if (count === 1)
                return [50];
            if (count === 2)
                return [60, 60];
            return Array(count).fill(0).map((_, i) => {
                if (i === 0 || i === count - 1)
                    return 70;
                return 20;
            });
        }
    }
];
export const ImprovedWeightPresets = ({ options, onApplyPreset, compact = false, className = '' }) => {
    const [hoveredPreset, setHoveredPreset] = useState(null);
    // Calculate actual percentages for display
    const calculatePercentages = (weights) => {
        const total = weights.reduce((sum, w) => sum + w, 0);
        if (total === 0)
            return weights.map(() => '0%');
        return weights.map(w => `${Math.round((w / total) * 100)}%`);
    };
    const handlePresetClick = (preset) => {
        const newWeights = preset.pattern(options.length);
        onApplyPreset(newWeights);
    };
    // Quick preset buttons for compact mode
    const quickPresets = RAW_WEIGHT_PRESETS.slice(0, 5); // Equal, Favor First, Favor Last, Ramp Up, Ramp Down
    if (compact) {
        return (_jsx("div", { className: `weight-presets-compact ${className}`, style: {
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                padding: '8px',
                background: '#2d3748',
                borderRadius: '6px'
            }, children: quickPresets.map(preset => (_jsxs("button", { onClick: () => handlePresetClick(preset), onMouseEnter: () => setHoveredPreset(preset.id), onMouseLeave: () => setHoveredPreset(null), title: preset.description, style: {
                    padding: '6px 10px',
                    fontSize: '12px',
                    background: hoveredPreset === preset.id ? '#4a5568' : '#374151',
                    border: '1px solid #4a5568',
                    borderRadius: '4px',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                }, children: [_jsx("span", { children: preset.icon }), _jsx("span", { children: preset.name })] }, preset.id))) }));
    }
    return (_jsxs("div", { className: `weight-presets-full ${className}`, style: {
            background: '#2d3748',
            borderRadius: '8px',
            padding: '16px',
            color: '#e2e8f0'
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#e2e8f0'
                }, children: "Weight Presets" }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '8px'
                }, children: RAW_WEIGHT_PRESETS.map(preset => {
                    const exampleWeights = preset.pattern(4);
                    const percentages = calculatePercentages(exampleWeights);
                    return (_jsxs("button", { onClick: () => handlePresetClick(preset), onMouseEnter: () => setHoveredPreset(preset.id), onMouseLeave: () => setHoveredPreset(null), style: {
                            padding: '10px',
                            background: hoveredPreset === preset.id ? '#4a5568' : '#374151',
                            border: '1px solid #4a5568',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }, children: [_jsx("span", { style: { fontSize: '16px' }, children: preset.icon }), _jsx("span", { style: { fontSize: '13px', fontWeight: 600 }, children: preset.name })] }), _jsx("div", { style: {
                                    fontSize: '11px',
                                    color: '#9ca3af',
                                    lineHeight: 1.3
                                }, children: preset.description }), _jsx("div", { style: {
                                    fontSize: '10px',
                                    color: '#68d391',
                                    fontFamily: 'monospace',
                                    display: 'flex',
                                    gap: '4px',
                                    flexWrap: 'wrap'
                                }, children: exampleWeights.map((w, i) => (_jsx("span", { style: {
                                        background: '#1f2937',
                                        padding: '2px 4px',
                                        borderRadius: '3px'
                                    }, children: w }, i))) }), _jsxs("div", { style: {
                                    fontSize: '9px',
                                    color: '#60a5fa',
                                    fontStyle: 'italic'
                                }, children: ["\u2192 ", percentages.join(' ')] })] }, preset.id));
                }) }), _jsxs("div", { style: {
                    marginTop: '12px',
                    padding: '10px',
                    background: '#1f2937',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#9ca3af',
                    borderLeft: '3px solid #60a5fa'
                }, children: [_jsx("strong", { children: "Raw Weight System:" }), " Weights shown are raw values (0-100). The actual probability percentages are calculated from these weights and shown in blue. This makes it more intuitive to set relative importance without worrying about normalization."] })] }));
};
export default ImprovedWeightPresets;
