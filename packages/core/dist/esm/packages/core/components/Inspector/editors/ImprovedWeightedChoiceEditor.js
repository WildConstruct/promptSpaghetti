import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Improved Weighted Choice Editor for Inspector Panel
 * Features raw weight system with presets and better UX
 */
import { useCallback, useMemo } from 'react';
import { RawWeightControl } from '../../WeightControls/RawWeightControl';
export const ImprovedWeightedChoiceEditor = ({ nodeId, nodeData, onChange, onGlobalPreviewRequest }) => {
    // Extract current data
    const choices = nodeData.choices || [];
    const weights = nodeData.weights || [];
    const name = nodeData.name || nodeData.label || 'Weighted Choice';
    // Convert to weight options format
    const weightOptions = useMemo(() => {
        return choices.map((choice, index) => ({
            id: `${nodeId}_choice_${index}`,
            text: choice,
            weight: weights[index] || 50
        }));
    }, [nodeId, choices, weights]);
    // Handle weight options change
    const handleOptionsChange = useCallback((newOptions) => {
        const newChoices = newOptions.map(opt => opt.text);
        const newWeights = newOptions.map(opt => opt.weight);
        onChange({
            choices: newChoices,
            weights: newWeights
        });
        // Trigger preview after a short delay
        if (onGlobalPreviewRequest) {
            setTimeout(onGlobalPreviewRequest, 100);
        }
    }, [onChange, onGlobalPreviewRequest]);
    // Handle name change
    const handleNameChange = useCallback((e) => {
        onChange({
            name: e.target.value,
            label: e.target.value
        });
    }, [onChange]);
    return (_jsxs("div", { style: {
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '100%',
            minHeight: '400px'
        }, children: [_jsxs("div", { style: {
                    padding: '12px',
                    background: '#2d3748',
                    borderRadius: '8px',
                    border: '1px solid #4a5568'
                }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#a0aec0',
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }, children: "Node Name" }), _jsx("input", { type: "text", value: name, onChange: handleNameChange, placeholder: "Enter a descriptive name...", style: {
                            width: '100%',
                            padding: '8px 10px',
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: '4px',
                            color: '#e2e8f0',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }, onFocus: (e) => {
                            e.target.style.borderColor = '#4299e1';
                        }, onBlur: (e) => {
                            e.target.style.borderColor = '#4a5568';
                        } }), _jsx("div", { style: {
                            marginTop: '4px',
                            fontSize: '10px',
                            color: '#718096'
                        }, children: "Give your weighted choice a descriptive name to identify it in the graph" })] }), _jsxs("div", { style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '300px'
                }, children: [_jsxs("h4", { style: {
                            margin: '0 0 12px 0',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#e2e8f0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }, children: [_jsx("span", { children: "\u2696\uFE0F" }), " Weight Distribution"] }), _jsx(RawWeightControl, { options: weightOptions, onOptionsChange: handleOptionsChange, showPresets: true, compactPresets: false, minWeight: 0, maxWeight: 100 })] }), _jsxs("div", { style: {
                    padding: '12px',
                    background: '#1a202c',
                    borderRadius: '6px',
                    border: '1px solid #2d3748',
                    borderLeft: '3px solid #4299e1'
                }, children: [_jsx("h5", { style: {
                            margin: '0 0 6px 0',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#60a5fa'
                        }, children: "How it works" }), _jsx("p", { style: {
                            margin: 0,
                            fontSize: '10px',
                            color: '#9ca3af',
                            lineHeight: 1.5
                        }, children: "Each option's weight determines its probability of being selected. Higher weights mean higher chance. The percentages show the actual probability based on all weights combined." })] }), weightOptions.length > 0 && (_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '8px',
                    background: '#2d3748',
                    borderRadius: '6px'
                }, children: [_jsxs("div", { style: {
                            textAlign: 'center',
                            padding: '6px'
                        }, children: [_jsx("div", { style: {
                                    fontSize: '9px',
                                    color: '#718096',
                                    marginBottom: '2px'
                                }, children: "Options" }), _jsx("div", { style: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#e2e8f0'
                                }, children: weightOptions.length })] }), _jsxs("div", { style: {
                            textAlign: 'center',
                            padding: '6px',
                            borderLeft: '1px solid #4a5568',
                            borderRight: '1px solid #4a5568'
                        }, children: [_jsx("div", { style: {
                                    fontSize: '9px',
                                    color: '#718096',
                                    marginBottom: '2px'
                                }, children: "Total Weight" }), _jsx("div", { style: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#e2e8f0'
                                }, children: weightOptions.reduce((sum, opt) => sum + opt.weight, 0) })] }), _jsxs("div", { style: {
                            textAlign: 'center',
                            padding: '6px'
                        }, children: [_jsx("div", { style: {
                                    fontSize: '9px',
                                    color: '#718096',
                                    marginBottom: '2px'
                                }, children: "Highest %" }), _jsx("div", { style: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#68d391'
                                }, children: (() => {
                                    const total = weightOptions.reduce((sum, opt) => sum + opt.weight, 0);
                                    const max = Math.max(...weightOptions.map(opt => opt.weight));
                                    return total > 0 ? `${((max / total) * 100).toFixed(0)}%` : '0%';
                                })() })] })] }))] }));
};
export default ImprovedWeightedChoiceEditor;
