import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, useCallback } from 'react';
import { BaseEditableNode } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './VisualFeedbackEnhancements.css';
// Preset weight patterns
const WEIGHT_PRESETS = {
    equal: { icon: '=', title: 'Equal weights' },
    favorFirst: { icon: '↗', title: 'Favor first' },
    favorLast: { icon: '↘', title: 'Favor last' },
    rampUp: { icon: '📈', title: 'Ramp up' },
    rampDown: { icon: '📉', title: 'Ramp down' }
};
/**
 * Improved WeightedChoice node with raw weights and presets
 */
export const ImprovedWeightedChoiceNode = memo((props) => {
    const [options, setOptions] = useState(props.data.options || []);
    const [useRawWeights, setUseRawWeights] = useState(true); // Use raw weights by default
    // Calculate percentages for display
    const calculatePercentages = useCallback((opts) => {
        const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
        if (totalWeight === 0)
            return opts.map(() => 0);
        return opts.map(opt => Math.round((opt.weight / totalWeight) * 100));
    }, []);
    // Apply preset pattern
    const applyPreset = useCallback((preset) => {
        const count = options.length;
        if (count === 0)
            return;
        let newWeights = [];
        switch (preset) {
            case 'equal':
                newWeights = Array(count).fill(50);
                break;
            case 'favorFirst':
                newWeights = [80, ...Array(count - 1).fill(20)];
                break;
            case 'favorLast':
                newWeights = [...Array(count - 1).fill(20), 80];
                break;
            case 'rampUp':
                const stepUp = 60 / (count - 1);
                newWeights = Array(count).fill(0).map((_, i) => Math.round(20 + stepUp * i));
                break;
            case 'rampDown':
                const stepDown = 60 / (count - 1);
                newWeights = Array(count).fill(0).map((_, i) => Math.round(80 - stepDown * i));
                break;
            default:
                return;
        }
        const newOptions = options.map((opt, i) => ({
            ...opt,
            weight: newWeights[i] || 50
        }));
        setOptions(newOptions);
    }, [options]);
    // Update option text
    const updateOptionText = (index, text) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], text };
        setOptions(newOptions);
    };
    // Update option weight
    const updateOptionWeight = (index, weight) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], weight };
        setOptions(newOptions);
    };
    // Add new option
    const addOption = () => {
        const newOptions = [...options, { text: '', weight: 50 }];
        setOptions(newOptions);
    };
    // Remove option
    const removeOption = (index) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };
    const percentages = calculatePercentages(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    return (_jsx(BaseEditableNode, { ...props, className: "weighted-choice", minWidth: 320, minHeight: 150, data: {
            ...props.data,
            options,
            onEdit: (value) => {
                props.data.onEdit?.(JSON.stringify(options));
            }
        }, children: ({ isEditing, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "epic1-weighted-choice-editor", children: [_jsx("div", { className: "epic1-node-type-label", children: "Weighted Choice" }), _jsxs("div", { className: "epic1-weight-presets", children: [Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (_jsx("button", { className: "epic1-preset-btn nodrag", onClick: (e) => {
                                        e.stopPropagation();
                                        applyPreset(key);
                                    }, title: preset.title, children: preset.icon }, key))), _jsxs("div", { className: "epic1-total-weight", children: ["Total: ", totalWeight] })] }), _jsx("div", { className: "epic1-options-list nodrag nopan nowheel", onWheel: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: options.map((option, index) => (_jsxs("div", { className: "epic1-option-row", children: [_jsx("input", { type: "text", className: "epic1-option-text nodrag", value: option.text, onChange: (e) => updateOptionText(index, e.target.value), placeholder: "Option text...", onClick: (e) => e.stopPropagation() }), _jsxs("div", { className: "epic1-weight-controls", children: [_jsx("input", { type: "range", className: "epic1-weight-slider nodrag", min: "0", max: "100", value: option.weight, onChange: (e) => updateOptionWeight(index, parseInt(e.target.value)), onMouseDown: (e) => e.stopPropagation(), style: { '--value': `${option.weight}%` } }), _jsxs("div", { style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-end',
                                                    minWidth: '45px'
                                                }, children: [_jsx("span", { className: "epic1-weight-value", style: { fontSize: '11px', color: '#f59e0b' }, children: option.weight }), _jsxs("span", { style: { fontSize: '9px', color: '#60a5fa' }, children: [percentages[index], "%"] })] }), options.length > 1 && (_jsx("button", { className: "epic1-remove-option nodrag", onClick: (e) => {
                                                    e.stopPropagation();
                                                    removeOption(index);
                                                }, title: "Remove option", children: "\u00D7" }))] })] }, index))) }), _jsx("div", { className: "epic1-weight-hints", children: "Raw weights shown (orange) \u2022 Actual % shown (blue)" }), _jsxs("div", { className: "epic1-option-controls", children: [_jsx("button", { className: "epic1-add-option nodrag", onClick: (e) => {
                                        e.stopPropagation();
                                        addOption();
                                    }, type: "button", children: "+ Add Option" }), _jsxs("div", { className: "epic1-edit-actions", children: [_jsx("button", { className: "epic1-confirm nodrag", onClick: (e) => {
                                                e.stopPropagation();
                                                confirmEdit();
                                            }, type: "button", children: "\u2713" }), _jsx("button", { className: "epic1-cancel nodrag", onClick: (e) => {
                                                e.stopPropagation();
                                                cancelEdit();
                                            }, type: "button", children: "\u00D7" })] })] })] }));
            }
            // Display mode
            return (_jsxs("div", { className: "epic1-weighted-choice-display", children: [_jsx("div", { className: "epic1-node-type-label", children: "Weighted Choice" }), _jsx("div", { className: "epic1-options-preview", children: options.map((option, index) => (_jsxs("div", { className: "epic1-option-preview", children: [_jsx("div", { className: "epic1-option-text-preview", children: option.text || _jsx("span", { className: "epic1-placeholder", children: "Empty option" }) }), _jsxs("div", { className: "epic1-weight-bar-container", children: [_jsx("div", { className: "epic1-weight-bar", style: { width: `${percentages[index]}%` } }), _jsxs("div", { className: "epic1-weight-label", children: [percentages[index], "%"] })] })] }, index))) })] }));
        } }));
});
ImprovedWeightedChoiceNode.displayName = 'ImprovedWeightedChoiceNode';
export default ImprovedWeightedChoiceNode;
