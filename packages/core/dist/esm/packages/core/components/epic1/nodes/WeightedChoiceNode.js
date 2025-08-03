import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState } from 'react';
import { BaseEditableNode } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './VisualFeedbackEnhancements.css';
/**
 * WeightedChoice node for Epic 1 - inline editing with weight sliders
 */
export const WeightedChoiceNode = memo((props) => {
    const [options, setOptions] = useState(props.data.options || []);
    // Normalize weights to ensure they sum to 100
    const normalizeWeights = (opts) => {
        const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
        if (totalWeight === 0)
            return opts;
        return opts.map(opt => ({
            ...opt,
            weight: Math.round((opt.weight / totalWeight) * 100)
        }));
    };
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
        setOptions(normalizeWeights(newOptions));
    };
    // Add new option
    const addOption = () => {
        const newOptions = [...options, { text: '', weight: 50 }];
        setOptions(normalizeWeights(newOptions));
    };
    // Remove option
    const removeOption = (index) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(normalizeWeights(newOptions));
        }
    };
    return (_jsx(BaseEditableNode, { ...props, className: "weighted-choice", minWidth: 280, minHeight: 120, data: {
            ...props.data,
            onEdit: (value) => {
                // In edit mode, we save the options array
                props.data.onEdit?.(JSON.stringify(options));
            }
        }, children: ({ isEditing, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "epic1-weighted-choice-editor", children: [_jsx("div", { className: "epic1-node-type-label", children: "Weighted Choice" }), _jsx("div", { className: "epic1-options-list", children: options.map((option, index) => (_jsxs("div", { className: "epic1-option-row", children: [_jsx("input", { type: "text", className: "epic1-option-text", value: option.text, onChange: (e) => updateOptionText(index, e.target.value), placeholder: "Option text...", onClick: (e) => e.stopPropagation() }), _jsxs("div", { className: "epic1-weight-controls", children: [_jsx("input", { type: "range", className: "epic1-weight-slider", min: "0", max: "100", value: option.weight, onChange: (e) => updateOptionWeight(index, parseInt(e.target.value)), onClick: (e) => e.stopPropagation(), style: { '--value': `${option.weight}%` } }), _jsxs("span", { className: "epic1-weight-value", children: [option.weight, "%"] }), options.length > 1 && (_jsx("button", { className: "epic1-remove-option", onClick: (e) => {
                                                    e.stopPropagation();
                                                    removeOption(index);
                                                }, title: "Remove option", children: "\u00D7" }))] })] }, index))) }), _jsxs("div", { className: "epic1-option-controls", children: [_jsx("button", { className: "epic1-add-option", onClick: (e) => {
                                        e.stopPropagation();
                                        addOption();
                                    }, children: "+ Add Option" }), _jsxs("div", { className: "epic1-edit-actions", children: [_jsx("button", { className: "epic1-confirm", onClick: (e) => {
                                                e.stopPropagation();
                                                confirmEdit();
                                            }, children: "\u2713" }), _jsx("button", { className: "epic1-cancel", onClick: (e) => {
                                                e.stopPropagation();
                                                cancelEdit();
                                            }, children: "\u00D7" })] })] })] }));
            }
            return (_jsxs("div", { className: "epic1-weighted-choice-display", children: [_jsx("div", { className: "epic1-node-type-label", children: "Weighted Choice" }), _jsx("div", { className: "epic1-options-preview", children: options.length === 0 ? (_jsx("span", { className: "epic1-placeholder", children: "Click to add options" })) : (options.map((option, index) => (_jsxs("div", { className: "epic1-option-preview", children: [_jsx("span", { className: "epic1-option-text-preview", children: option.text || '(empty)' }), _jsxs("div", { className: "epic1-weight-bar-container", children: [_jsx("div", { className: "epic1-weight-bar", style: { width: `${option.weight}%` } }), _jsxs("span", { className: "epic1-weight-label", children: [option.weight, "%"] })] })] }, index)))) })] }));
        } }));
});
WeightedChoiceNode.displayName = 'WeightedChoiceNode';
