import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { BaseEditableNode } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './BranchingWeightedChoice.css';
import './VisualFeedbackEnhancements.css';
// Drag handle icon component
const DragHandleIcon = () => (_jsxs("svg", { width: "8", height: "14", viewBox: "0 0 8 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "2", cy: "2", r: "1", fill: "currentColor", opacity: "0.4" }), _jsx("circle", { cx: "6", cy: "2", r: "1", fill: "currentColor", opacity: "0.4" }), _jsx("circle", { cx: "2", cy: "7", r: "1", fill: "currentColor", opacity: "0.4" }), _jsx("circle", { cx: "6", cy: "7", r: "1", fill: "currentColor", opacity: "0.4" }), _jsx("circle", { cx: "2", cy: "12", r: "1", fill: "currentColor", opacity: "0.4" }), _jsx("circle", { cx: "6", cy: "12", r: "1", fill: "currentColor", opacity: "0.4" })] }));
// Preset weight patterns
const WEIGHT_PRESETS = {
    equal: { icon: '=', title: 'Equal weights' },
    favorFirst: { icon: '↗', title: 'Favor first' },
    favorLast: { icon: '↘', title: 'Favor last' },
    rampUp: { icon: '📈', title: 'Ramp up' },
    rampDown: { icon: '📉', title: 'Ramp down' }
};
/**
 * Branching WeightedChoice node with conditional outputs per option
 */
export const BranchingWeightedChoiceNode = memo((props) => {
    const updateNodeInternals = useUpdateNodeInternals();
    // Initialize options with stable IDs
    const initializeOptions = (opts) => {
        return opts.map((opt, index) => ({
            ...opt,
            // Use a more stable ID based on node ID and index
            id: opt.id || `${props.id}-option-${index}`
        }));
    };
    const [options, setOptions] = useState(() => initializeOptions(props.data.options || []));
    const [draggedIndex, setDraggedIndex] = useState(null);
    // Update options when props change, but preserve stable IDs
    useEffect(() => {
        if (props.data.options) {
            setOptions(currentOptions => {
                // Map new options preserving existing IDs where possible
                // More robust ID preservation based on index and content
                return props.data.options.map((newOpt, index) => {
                    // First try to find by matching index and similar content
                    let existingOpt = currentOptions[index];
                    // If not found by index, try to find by exact content match
                    if (!existingOpt || existingOpt.text !== newOpt.text || existingOpt.weight !== newOpt.weight) {
                        existingOpt = currentOptions.find(opt => opt.text === newOpt.text && opt.weight === newOpt.weight);
                    }
                    // Preserve the ID if we found a match, otherwise use the new option's ID or generate one
                    return {
                        ...newOpt,
                        id: existingOpt?.id || newOpt.id || `option-${index}-${Date.now().toString(36)}`
                    };
                });
            });
        }
    }, [props.data.options]);
    // Check if any option has branching enabled
    const hasBranching = options.some(opt => opt.hasBranch);
    // Update React Flow's internal handle positions when branch handles change
    useEffect(() => {
        // Give React Flow time to render the new handles before updating internals
        const timeoutId = setTimeout(() => {
            updateNodeInternals(props.id);
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [options, props.id, updateNodeInternals]);
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
    // Toggle branch output for an option
    const toggleBranch = (index) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            hasBranch: !newOptions[index].hasBranch
        };
        setOptions(newOptions);
        // Immediately update node internals to ensure handle positions are recalculated
        // Use a small delay to ensure React has rendered the DOM changes
        setTimeout(() => {
            updateNodeInternals(props.id);
        }, 10);
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
        setOptions(newOptions);
    };
    // Add new option
    const addOption = () => {
        const newOption = {
            text: '',
            weight: 50,
            hasBranch: false,
            id: `${props.id}-option-${options.length}`
        };
        const newOptions = [...options, newOption];
        setOptions(newOptions);
    };
    // Remove option
    const removeOption = (index) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };
    // Drag and drop handlers
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index)
            return;
        const newOptions = [...options];
        const draggedOption = newOptions[draggedIndex];
        newOptions.splice(draggedIndex, 1);
        newOptions.splice(index, 0, draggedOption);
        setOptions(newOptions);
        setDraggedIndex(index);
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
    };
    const percentages = calculatePercentages(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    return (_jsx(BaseEditableNode, { ...props, className: "weighted-choice branching", minWidth: 400, minHeight: 150, data: {
            ...props.data,
            options,
            onEdit: (value) => {
                // Save options with their stable IDs
                props.data.onEdit?.(JSON.stringify(options));
            }
        }, children: ({ isEditing, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "epic1-weighted-choice-editor branching", children: [_jsx(Handle, { type: "target", position: Position.Left, id: "input", className: "epic1-handle epic1-handle-left", style: {
                                top: '50%',
                                left: -8,
                                transform: 'translateY(-50%)',
                                width: '16px',
                                height: '16px',
                                background: '#60a5fa',
                                border: '3px solid #1a1a2e'
                            } }), _jsx("div", { className: "epic1-node-type-label", children: "Weighted Choice (Branching)" }), _jsxs("div", { className: "epic1-weight-presets", children: [Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (_jsx("button", { className: "epic1-preset-btn nodrag", onClick: (e) => {
                                        e.stopPropagation();
                                        applyPreset(key);
                                    }, title: preset.title, children: preset.icon }, key))), _jsxs("div", { className: "epic1-total-weight", children: ["Total: ", totalWeight] })] }), _jsx("div", { className: "epic1-options-list branching nodrag nopan nowheel", onWheel: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: options.map((option, index) => (_jsxs("div", { className: `epic1-option-row branching ${draggedIndex === index ? 'dragging' : ''}`, draggable: true, onDragStart: () => handleDragStart(index), onDragOver: (e) => handleDragOver(e, index), onDragEnd: handleDragEnd, children: [_jsx("div", { className: "epic1-drag-handle", children: _jsx(DragHandleIcon, {}) }), _jsx("input", { type: "text", className: "epic1-option-text nodrag", value: option.text, onChange: (e) => updateOptionText(index, e.target.value), placeholder: "Option text...", onClick: (e) => e.stopPropagation(), style: { flex: '1', minWidth: '100px' } }), _jsx("input", { type: "range", className: "epic1-weight-slider nodrag", min: "0", max: "100", value: option.weight, onChange: (e) => updateOptionWeight(index, parseInt(e.target.value)), onMouseDown: (e) => e.stopPropagation(), style: {
                                            '--value': `${option.weight}%`,
                                            width: '80px',
                                            flexShrink: 0
                                        } }), _jsxs("div", { style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            minWidth: '45px',
                                            flexShrink: 0
                                        }, children: [_jsx("span", { className: "epic1-weight-value", style: { fontSize: '11px', color: '#f59e0b' }, children: option.weight }), _jsxs("span", { style: { fontSize: '9px', color: '#60a5fa' }, children: [percentages[index], "%"] })] }), _jsx("button", { className: `epic1-branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`, onClick: (e) => {
                                            e.stopPropagation();
                                            toggleBranch(index);
                                        }, title: "Toggle branch output", style: { flexShrink: 0 }, children: "\u26A1" }), options.length > 1 && (_jsx("button", { className: "epic1-remove-option nodrag", onClick: (e) => {
                                            e.stopPropagation();
                                            removeOption(index);
                                        }, title: "Remove option", style: { flexShrink: 0 }, children: "\u00D7" })), option.hasBranch && (_jsxs(_Fragment, { children: [_jsx("div", { className: "branch-connection-line", style: {
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: -8,
                                                    width: '16px',
                                                    height: '2px',
                                                    background: '#f59e0b',
                                                    pointerEvents: 'none',
                                                    transform: 'translateY(-50%)',
                                                    opacity: 0.8,
                                                    zIndex: 5
                                                } }), _jsx(Handle, { type: "source", position: Position.Right, id: `branch-${option.id}`, className: "epic1-handle epic1-handle-right branch-output", style: {
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: -8, // Align with the node's edge
                                                    transform: 'translateY(-50%)',
                                                    background: '#f59e0b',
                                                    width: '14px',
                                                    height: '14px',
                                                    border: '2px solid #1a1a2e',
                                                    borderRadius: '50%',
                                                    zIndex: 10
                                                } })] }))] }, option.id))) }), _jsx("div", { className: "epic1-weight-hints", children: "Drag to reorder \u2022 \u26A1 = branch output \u2022 Raw weights (orange) \u2022 Actual % (blue)" }), _jsxs("div", { className: "epic1-option-controls", children: [_jsx("button", { className: "epic1-add-option nodrag", onClick: (e) => {
                                        e.stopPropagation();
                                        addOption();
                                    }, type: "button", children: "+ Add Option" }), _jsxs("div", { className: "epic1-edit-actions", children: [_jsx("button", { className: "epic1-confirm nodrag", onClick: (e) => {
                                                e.stopPropagation();
                                                confirmEdit();
                                            }, type: "button", children: "\u2713" }), _jsx("button", { className: "epic1-cancel nodrag", onClick: (e) => {
                                                e.stopPropagation();
                                                cancelEdit();
                                            }, type: "button", children: "\u00D7" })] })] }), (() => {
                            const branchingOptions = options.filter(opt => opt.hasBranch);
                            const optionHeight = 48; // Height of each option row
                            const headerHeight = 80; // Height of header elements
                            const footerHeight = 50; // Height of footer elements
                            // Calculate position for main output
                            let mainOutputTop;
                            if (branchingOptions.length === 0) {
                                // No branches - center on right edge
                                mainOutputTop = '50%';
                            }
                            else {
                                // Has branches - position below the last branch
                                const lastBranchIndex = options.findIndex(opt => opt.id === branchingOptions[branchingOptions.length - 1].id);
                                // Position below the last branch option
                                const topOffset = headerHeight + (lastBranchIndex + 1) * optionHeight + 20;
                                mainOutputTop = `${topOffset}px`;
                            }
                            return (_jsx(Handle, { type: "source", position: Position.Right, id: "main-output", className: "epic1-handle epic1-handle-right main-output", style: {
                                    position: 'absolute',
                                    top: mainOutputTop,
                                    right: -8,
                                    transform: mainOutputTop === '50%' ? 'translateY(-50%)' : 'translateY(0)',
                                    width: '16px',
                                    height: '16px',
                                    background: '#10b981',
                                    border: '3px solid #1a1a2e',
                                    zIndex: 10
                                } }));
                        })()] }));
            }
            // Display mode
            return (_jsxs("div", { className: "epic1-weighted-choice-display branching", children: [_jsx(Handle, { type: "target", position: Position.Left, id: "input", className: "epic1-handle epic1-handle-left", style: {
                            top: '50%',
                            left: -8,
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            background: '#60a5fa',
                            border: '3px solid #1a1a2e'
                        } }), _jsxs("div", { className: "epic1-node-type-label", children: ["Weighted Choice ", hasBranching && '(Branching)'] }), _jsx("div", { className: "epic1-options-preview", style: { position: 'relative' }, children: options.map((option, index) => (_jsxs("div", { className: "epic1-option-preview branching", style: { position: 'relative' }, children: [_jsxs("div", { className: "epic1-option-text-preview", children: [option.text || _jsx("span", { className: "epic1-placeholder", children: "Empty option" }), option.hasBranch && _jsx("span", { className: "branch-indicator", children: "\u26A1" })] }), _jsxs("div", { className: "epic1-weight-bar-container", children: [_jsx("div", { className: "epic1-weight-bar", style: { width: `${percentages[index]}%` } }), _jsxs("div", { className: "epic1-weight-label", children: [percentages[index], "%"] })] }), option.hasBranch && (_jsxs(_Fragment, { children: [_jsx("div", { className: "branch-connection-line", style: {
                                                position: 'absolute',
                                                top: '50%',
                                                right: -8,
                                                width: '16px',
                                                height: '2px',
                                                background: '#f59e0b',
                                                pointerEvents: 'none',
                                                transform: 'translateY(-50%)',
                                                opacity: 0.8,
                                                zIndex: 5
                                            } }), _jsx(Handle, { type: "source", position: Position.Right, id: `branch-${option.id}`, className: "epic1-handle epic1-handle-right branch-output", style: {
                                                position: 'absolute',
                                                top: '50%',
                                                right: -8, // Align with the node's edge
                                                transform: 'translateY(-50%)',
                                                background: '#f59e0b',
                                                width: '14px',
                                                height: '14px',
                                                border: '2px solid #1a1a2e',
                                                borderRadius: '50%',
                                                zIndex: 10
                                            } })] }))] }, option.id))) }), (() => {
                        const branchingOptions = options.filter(opt => opt.hasBranch);
                        const optionHeight = 48; // Height of each option row in display mode
                        const headerHeight = 40; // Height of header in display mode
                        // Calculate position for main output
                        let mainOutputTop;
                        if (branchingOptions.length === 0) {
                            // No branches - center on right edge
                            mainOutputTop = '50%';
                        }
                        else {
                            // Has branches - position below the last branch
                            const lastBranchIndex = options.findIndex(opt => opt.id === branchingOptions[branchingOptions.length - 1].id);
                            // Position below the last branch option
                            const topOffset = headerHeight + (lastBranchIndex + 1) * optionHeight + 20;
                            mainOutputTop = `${topOffset}px`;
                        }
                        return (_jsx(Handle, { type: "source", position: Position.Right, id: "main-output", className: "epic1-handle epic1-handle-right main-output", style: {
                                position: 'absolute',
                                top: mainOutputTop,
                                right: -8,
                                transform: mainOutputTop === '50%' ? 'translateY(-50%)' : 'translateY(0)',
                                width: '16px',
                                height: '16px',
                                background: '#10b981',
                                border: '3px solid #1a1a2e',
                                zIndex: 10
                            } }));
                    })()] }));
        } }));
});
BranchingWeightedChoiceNode.displayName = 'BranchingWeightedChoiceNode';
export default BranchingWeightedChoiceNode;
