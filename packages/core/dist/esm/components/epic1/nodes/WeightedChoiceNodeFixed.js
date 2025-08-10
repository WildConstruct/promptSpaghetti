import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './WeightedChoiceNode.css';
import './EnhancedBranching.css';
// Drag handle icon
const DragHandleIcon = () => (_jsxs("svg", { width: "6", height: "12", viewBox: "0 0 6 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "1.5", cy: "1.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "1.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "1.5", cy: "6", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "6", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "1.5", cy: "10.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "10.5", r: "1", fill: "currentColor", opacity: "0.6" })] }));
// Radio dial component
const RadioDial = ({ value, onChange, disabled = false }) => {
    const circumference = 2 * Math.PI * 19;
    const arcLength = circumference * 0.75;
    const fillLength = (value / 100) * arcLength;
    const handleMouseDown = (e) => {
        if (disabled)
            return;
        if (e.button !== 0)
            return;
        e.preventDefault();
        e.stopPropagation();
        const event = e.nativeEvent;
        event.stopImmediatePropagation();
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        svg.style.cursor = 'grabbing';
        const updateValue = (clientX, clientY) => {
            const dx = clientX - centerX;
            const dy = clientY - centerY;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle < 0)
                angle += 360;
            let normalizedValue = 0;
            if (angle >= 225) {
                normalizedValue = ((angle - 225) / 270) * 100;
            }
            else if (angle <= 135) {
                normalizedValue = ((angle + 360 - 225) / 270) * 100;
            }
            else {
                const distToEnd = Math.abs(angle - 135);
                const distToStart = Math.abs(angle - 225);
                normalizedValue = distToEnd < distToStart ? 100 : 0;
            }
            const newValue = Math.round(Math.max(0, Math.min(100, normalizedValue)));
            onChange(newValue);
        };
        const handleMouseMove = (e) => {
            e.preventDefault();
            updateValue(e.clientX, e.clientY);
        };
        const handleMouseUp = (e) => {
            e.preventDefault();
            svg.style.cursor = 'pointer';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        updateValue(e.clientX, e.clientY);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    const handleWheel = (e) => {
        if (disabled)
            return;
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        const delta = e.deltaY > 0 ? -5 : 5;
        const newValue = Math.round(Math.max(0, Math.min(100, value + delta)));
        onChange(newValue);
    };
    return (_jsxs("svg", { width: "44", height: "44", viewBox: "0 0 44 44", className: "radio-dial-simple nodrag", onMouseDown: handleMouseDown, onWheel: handleWheel, style: {
            cursor: disabled ? 'default' : 'pointer',
            pointerEvents: 'all',
            zIndex: 10
        }, children: [_jsx("circle", { cx: "22", cy: "22", r: "19", fill: "#0a0a0a", stroke: "none" }), _jsx("circle", { cx: "22", cy: "22", r: "19", fill: "none", stroke: "rgba(255,255,255,0.1)", strokeWidth: "4", strokeLinecap: "round", strokeDasharray: `${arcLength} 100`, transform: "rotate(135 22 22)" }), _jsx("circle", { cx: "22", cy: "22", r: "19", fill: "none", stroke: "#22d3ee", strokeWidth: "4", strokeLinecap: "round", strokeDasharray: `${fillLength} 100`, transform: "rotate(135 22 22)", opacity: "0.9" }), _jsx("text", { x: "22", y: "22", textAnchor: "middle", dominantBaseline: "middle", fill: "#ffffff", fontSize: "14", fontWeight: "700", style: { pointerEvents: 'none' }, children: value })] }));
};
// Weight presets
const WEIGHT_PRESETS = {
    equal: { icon: '=', title: 'Equal weights' },
    favorFirst: { icon: '↗', title: 'Favor first' },
    favorLast: { icon: '↘', title: 'Favor last' },
    rampUp: { icon: '📈', title: 'Ramp up' },
    rampDown: { icon: '📉', title: 'Ramp down' }
};
const WeightedChoiceNodeFixedComponent = (props) => {
    // Ensure options is always an array
    const getInitialOptions = () => {
        if (Array.isArray(props.data?.options)) {
            console.log('Using props.data.options:', props.data.options);
            // Ensure all options have IDs
            return props.data.options.map((opt, idx) => ({
                id: opt.id || `option-${idx + 1}`,
                ...opt
            }));
        }
        // Try to parse if it's a string
        if (typeof props.data?.value === 'string') {
            try {
                const parsed = JSON.parse(props.data.value);
                if (Array.isArray(parsed.options)) {
                    console.log('Parsed options from value:', parsed.options);
                    return parsed.options.map((opt, idx) => ({
                        id: opt.id || `option-${idx + 1}`,
                        ...opt
                    }));
                }
            }
            catch (e) {
                // Ignore parse errors
            }
        }
        // Default options
        console.log('Using default options');
        return [
            { id: 'option-1', text: 'Option 1', weight: 50, hasBranch: true },
            { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: true }
        ];
    };
    const [options, setOptions] = useState(getInitialOptions());
    const [isEditing, setIsEditing] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [title, setTitle] = useState(props.data?.title || 'WEIGHTED CHOICE');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    // Sync with props when they change
    useEffect(() => {
        if (Array.isArray(props.data?.options) && !isEditing) {
            setOptions(props.data.options);
        }
        if (props.data?.title && !isEditing) {
            setTitle(props.data.title);
        }
    }, [props.data?.options, props.data?.title, isEditing]);
    const hasBranching = options.some(opt => opt.hasBranch);
    console.log('Options state:', options, 'Has branching:', hasBranching);
    const handleNodeClick = () => {
        if (!isEditing) {
            setIsEditing(true);
        }
    };
    const confirmEdit = () => {
        setIsEditing(false);
        props.data.onEdit?.(JSON.stringify({ options, title }));
    };
    const cancelEdit = () => {
        setIsEditing(false);
        // Reset to original
        setOptions(props.data.options || []);
        setTitle(props.data.title || 'WEIGHTED CHOICE');
    };
    const calculatePercentages = useCallback((opts) => {
        const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
        if (totalWeight === 0)
            return opts.map(() => 0);
        return opts.map(opt => Math.round((opt.weight / totalWeight) * 100));
    }, []);
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
                newWeights = [75, ...Array(count - 1).fill(25)];
                break;
            case 'favorLast':
                newWeights = [...Array(count - 1).fill(25), 75];
                break;
            case 'rampUp':
                const stepUp = 60 / (count - 1);
                newWeights = Array(count).fill(0).map((_, i) => Math.round(20 + stepUp * i));
                break;
            case 'rampDown':
                const stepDown = 60 / (count - 1);
                newWeights = Array(count).fill(0).map((_, i) => Math.round(80 - stepDown * i));
                break;
        }
        setOptions(options.map((opt, i) => ({
            ...opt,
            weight: newWeights[i] || 25
        })));
    }, [options]);
    const toggleBranch = (index) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            hasBranch: !newOptions[index].hasBranch
        };
        console.log('Toggling branch', index, 'to', newOptions[index].hasBranch);
        setOptions(newOptions);
    };
    const updateOptionText = (index, text) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], text };
        setOptions(newOptions);
    };
    const updateOptionWeight = (index, weight) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], weight };
        setOptions(newOptions);
    };
    const addOption = () => {
        const newId = `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setOptions([...options, { id: newId, text: '', weight: 50, hasBranch: false }]);
    };
    const removeOption = (index) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };
    const handleDragStart = (e, index) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        const dragImage = document.createElement('div');
        dragImage.style.width = '1px';
        dragImage.style.height = '1px';
        dragImage.style.opacity = '0';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
        setDraggedIndex(index);
        e.currentTarget.style.opacity = '0.5';
    };
    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedIndex === null || draggedIndex === index)
            return;
        const newOptions = [...options];
        const draggedOption = newOptions[draggedIndex];
        newOptions.splice(draggedIndex, 1);
        newOptions.splice(index, 0, draggedOption);
        setOptions(newOptions);
        setDraggedIndex(index);
    };
    const handleDragEnd = (e) => {
        e.stopPropagation();
        setDraggedIndex(null);
        e.currentTarget.style.opacity = '1';
    };
    const percentages = calculatePercentages(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    console.log('About to render component. Options with branches:', options.filter(o => o.hasBranch));
    // CRITICAL: Render handles as direct children of the root div
    return (_jsxs("div", { className: `epic1-editable-node weighted-choice enhanced-branching ${isEditing ? 'editing' : ''} ${props.selected ? 'selected' : ''}`, style: { width: '520px', minHeight: '180px' }, onClick: handleNodeClick, children: [_jsx(Handle, { type: "target", position: Position.Left, id: "input", className: "epic1-handle" }), hasBranching ? (_jsx(Handle, { type: "source", position: Position.Right, id: "main-output", className: "epic1-handle main-output", style: {
                    top: '40px',
                } })) : (_jsx(Handle, { type: "source", position: Position.Right, id: "main-output", className: "epic1-handle source" })), options.map((option, index) => {
                if (option.hasBranch) {
                    console.log(`Rendering branch handle for option ${index}`);
                }
                return option.hasBranch ? (_jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "epic1-handle branch-output", style: {
                        top: `${80 + index * 40}px`,
                    } }, `branch-${index}`)) : null;
            }), _jsx("div", { className: "epic1-node-content", children: isEditing ? (_jsxs("div", { className: "enhanced-branching-editor", onMouseDown: (e) => e.stopPropagation(), children: [_jsx("div", { className: "enhanced-title-section", children: isEditingTitle ? (_jsx("input", { type: "text", className: "title-edit-input", value: title, onChange: (e) => setTitle(e.target.value), onBlur: () => setIsEditingTitle(false), onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        setIsEditingTitle(false);
                                }, autoFocus: true })) : (_jsxs("div", { className: "title-display", children: [_jsx("span", { className: "title-text", children: title }), _jsx("button", { className: "title-edit-btn", onClick: () => setIsEditingTitle(true), title: "Edit title", children: "\u270F\uFE0F" })] })) }), _jsxs("div", { className: "enhanced-presets", children: [Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (_jsx("button", { className: "preset-btn", onClick: () => applyPreset(key), title: preset.title, children: preset.icon }, key))), _jsxs("div", { className: "total-weight", children: ["Total: ", totalWeight] })] }), _jsx("div", { className: "enhanced-options-list", onWheel: (e) => e.stopPropagation(), children: options.map((option, index) => (_jsxs("div", { className: `enhanced-option-row ${draggedIndex === index ? 'dragging' : ''}`, onDragOver: (e) => handleDragOver(e, index), onDrop: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }, onMouseDown: (e) => e.stopPropagation(), children: [_jsx("div", { className: "enhanced-drag-handle nodrag", draggable: "true", onDragStart: (e) => handleDragStart(e, index), onDragEnd: handleDragEnd, onMouseDown: (e) => e.stopPropagation(), style: { cursor: 'grab' }, title: "Drag to reorder", children: _jsx(DragHandleIcon, {}) }), _jsx("input", { type: "text", className: "enhanced-option-text nodrag", value: option.text, onChange: (e) => updateOptionText(index, e.target.value), placeholder: "Option text...", onMouseDown: (e) => {
                                            e.stopPropagation();
                                            e.currentTarget.focus();
                                        }, onClick: (e) => e.stopPropagation(), style: { pointerEvents: 'all' } }), _jsx(RadioDial, { value: option.weight, onChange: (val) => updateOptionWeight(index, val) }), _jsx("button", { className: `branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`, onClick: (e) => {
                                            e.stopPropagation();
                                            toggleBranch(index);
                                        }, onMouseDown: (e) => e.stopPropagation(), title: "Toggle branch output", children: "\u26A1" }), options.length > 1 && (_jsx("button", { className: "remove-btn nodrag", onClick: (e) => {
                                            e.stopPropagation();
                                            removeOption(index);
                                        }, onMouseDown: (e) => e.stopPropagation(), title: "Remove option", children: "\u00D7" }))] }, index))) }), _jsxs("div", { className: "enhanced-footer", children: [_jsx("div", { className: "hints", children: "Drag to reorder \u2022 \u26A1 = branch output \u2022 Click and drag dials to adjust weights" }), _jsxs("div", { className: "footer-controls", children: [_jsx("button", { className: "add-option-btn", onClick: addOption, children: "+ Add Option" }), _jsxs("div", { className: "edit-actions", children: [_jsx("button", { className: "confirm-btn", onClick: confirmEdit, children: "\u2713" }), _jsx("button", { className: "cancel-btn", onClick: cancelEdit, children: "\u00D7" })] })] })] })] })) : (_jsxs("div", { className: "enhanced-branching-display", children: [_jsx("div", { className: "display-title", children: title }), _jsx("div", { className: "display-options", children: options.map((option, index) => (_jsxs("div", { className: "display-option", children: [_jsxs("span", { className: "option-text", children: [option.text || 'Empty option', option.hasBranch && ' ⚡'] }), _jsxs("span", { className: "option-percentage", children: [percentages[index], "%"] })] }, index))) })] })) })] }));
};
export const WeightedChoiceNodeFixed = memo(WeightedChoiceNodeFixedComponent);
WeightedChoiceNodeFixed.displayName = 'WeightedChoiceNodeFixed';
export default WeightedChoiceNodeFixed;
