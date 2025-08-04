import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseEditableNode } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './EnhancedBranching.css';
// Brighter drag handle icon
const DragHandleIcon = () => (_jsxs("svg", { width: "6", height: "12", viewBox: "0 0 6 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "1.5", cy: "1.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "1.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "1.5", cy: "6", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "6", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "1.5", cy: "10.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "10.5", r: "1", fill: "currentColor", opacity: "0.6" })] }));
// Simplified radio dial component
const RadioDial = ({ value, onChange, disabled = false }) => {
    const percentage = Math.round((value / 100) * 100);
    const angle = (value / 100) * 240 - 120; // -120 to 120 degrees for 3/4 circle
    const handleMouseDown = (e) => {
        if (disabled)
            return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const updateValue = (clientX, clientY) => {
            const dx = clientX - centerX;
            const dy = clientY - centerY;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            // Convert to 0-240 degree range (-120 to 120)
            angle = angle + 120;
            if (angle < 0)
                angle = 0;
            if (angle > 240)
                angle = 240;
            const newValue = Math.round((angle / 240) * 100);
            onChange(newValue);
        };
        const handleMouseMove = (e) => {
            updateValue(e.clientX, e.clientY);
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        updateValue(e.clientX, e.clientY);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    return (_jsxs("svg", { width: "44", height: "44", viewBox: "0 0 44 44", className: "radio-dial-simple", onMouseDown: handleMouseDown, style: { cursor: disabled ? 'default' : 'pointer' }, children: [_jsx("circle", { cx: "22", cy: "22", r: "20", fill: "#1a1a1a", stroke: "rgba(255,255,255,0.1)", strokeWidth: "2" }), _jsx("path", { d: "M 6 30 A 16 16 0 1 1 38 30", stroke: "rgba(255,255,255,0.15)", strokeWidth: "3", fill: "none", strokeLinecap: "round" }), _jsx("path", { d: "M 6 30 A 16 16 0 1 1 38 30", stroke: "#22d3ee", strokeWidth: "3", fill: "none", strokeLinecap: "round", strokeDasharray: `${(value / 100) * 50.3} 50.3`, opacity: "0.9" }), _jsx("text", { x: "22", y: "22", textAnchor: "middle", dominantBaseline: "middle", fill: "white", fontSize: "16", fontWeight: "600", style: { userSelect: 'none' }, children: percentage })] }));
};
// Preset weight patterns
const WEIGHT_PRESETS = {
    equal: { icon: '=', title: 'Equal weights' },
    favorFirst: { icon: '↗', title: 'Favor first' },
    favorLast: { icon: '↘', title: 'Favor last' },
    rampUp: { icon: '📈', title: 'Ramp up' },
    rampDown: { icon: '📉', title: 'Ramp down' }
};
export const EnhancedBranchingNode = memo((props) => {
    const [options, setOptions] = useState(props.data.options || []);
    const [title, setTitle] = useState(props.data.title || 'Weighted Choice');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const hasBranching = options.some(opt => opt.hasBranch);
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
        }
        setOptions(options.map((opt, i) => ({
            ...opt,
            weight: newWeights[i] || 50
        })));
    }, [options]);
    const toggleBranch = (index) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            hasBranch: !newOptions[index].hasBranch
        };
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
        setOptions([...options, { text: '', weight: 50, hasBranch: false }]);
    };
    const removeOption = (index) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };
    const handleDragStart = (e, index) => {
        e.stopPropagation();
        setDraggedIndex(index);
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
    };
    const percentages = calculatePercentages(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    return (_jsx(BaseEditableNode, { ...props, className: "weighted-choice enhanced-branching", style: { width: '420px' }, minWidth: 420, minHeight: 180, data: {
            ...props.data,
            options,
            title,
            onEdit: (value) => {
                props.data.onEdit?.(JSON.stringify({ options, title }));
            }
        }, children: ({ isEditing, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "enhanced-branching-editor", children: [hasBranching && (_jsx(Handle, { type: "source", position: Position.Top, id: "main-output", className: "enhanced-handle main-output", style: { top: -10 } })), _jsx("div", { className: "enhanced-title-section", children: isEditingTitle ? (_jsx("input", { type: "text", className: "title-edit-input", value: title, onChange: (e) => setTitle(e.target.value), onBlur: () => setIsEditingTitle(false), onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        setIsEditingTitle(false);
                                }, autoFocus: true })) : (_jsxs("div", { className: "title-display", children: [_jsx("span", { className: "title-text", children: title.toUpperCase() }), _jsx("button", { className: "title-edit-btn", onClick: () => setIsEditingTitle(true), title: "Edit title", children: "\u270F\uFE0F" })] })) }), _jsxs("div", { className: "enhanced-presets", children: [Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (_jsx("button", { className: "preset-btn", onClick: () => applyPreset(key), title: preset.title, children: preset.icon }, key))), _jsxs("div", { className: "total-weight", children: ["Total: ", totalWeight] })] }), _jsx("div", { className: "enhanced-options-list", children: options.map((option, index) => (_jsxs("div", { className: `enhanced-option-row ${draggedIndex === index ? 'dragging' : ''}`, draggable: true, onDragStart: (e) => handleDragStart(e, index), onDragOver: (e) => handleDragOver(e, index), onDragEnd: handleDragEnd, children: [_jsx("div", { className: "enhanced-drag-handle", children: _jsx(DragHandleIcon, {}) }), _jsx("input", { type: "text", className: "enhanced-option-text", value: option.text, onChange: (e) => updateOptionText(index, e.target.value), placeholder: "Option text...", onMouseDown: (e) => e.stopPropagation() }), _jsx(RadioDial, { value: option.weight, onChange: (val) => updateOptionWeight(index, val) }), _jsx("button", { className: `branch-toggle ${option.hasBranch ? 'active' : ''}`, onClick: () => toggleBranch(index), title: "Toggle branch output", children: "\u26A1" }), options.length > 1 && (_jsx("button", { className: "remove-btn", onClick: () => removeOption(index), title: "Remove option", children: "\u00D7" })), option.hasBranch && (_jsx("div", { className: "branch-handle-container", children: _jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "enhanced-handle branch-output", style: {
                                                position: 'absolute',
                                                right: -12,
                                                top: '50%',
                                                transform: 'translateY(-50%)'
                                            } }) }))] }, index))) }), _jsxs("div", { className: "enhanced-footer", children: [_jsx("div", { className: "hints", children: "Drag to reorder \u2022 \u26A1 = branch output \u2022 Raw weights (orange) \u2022 Actual % (blue)" }), _jsxs("div", { className: "footer-controls", children: [_jsx("button", { className: "add-option-btn", onClick: addOption, children: "+ Add Option" }), _jsxs("div", { className: "edit-actions", children: [_jsx("button", { className: "confirm-btn", onClick: confirmEdit, children: "\u2713" }), _jsx("button", { className: "cancel-btn", onClick: cancelEdit, children: "\u00D7" })] })] })] }), !hasBranching && (_jsx(Handle, { type: "source", position: Position.Right, id: "main-output", className: "enhanced-handle main-output", style: { right: -10 } }))] }));
            }
            // Display mode
            return (_jsxs("div", { className: "enhanced-branching-display", children: [hasBranching && (_jsx(Handle, { type: "source", position: Position.Top, id: "main-output", className: "enhanced-handle main-output", style: { top: -10 } })), _jsx("div", { className: "display-title", children: title }), _jsx("div", { className: "display-options", children: options.map((option, index) => (_jsxs("div", { className: "display-option", children: [_jsxs("span", { className: "option-text", children: [option.text || 'Empty option', option.hasBranch && ' ⚡'] }), _jsxs("span", { className: "option-percentage", children: [percentages[index], "%"] }), option.hasBranch && (_jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "enhanced-handle branch-output", style: { right: -10 } }))] }, index))) }), !hasBranching && (_jsx(Handle, { type: "source", position: Position.Right, id: "main-output", className: "enhanced-handle main-output", style: { right: -10 } }))] }));
        } }));
});
EnhancedBranchingNode.displayName = 'EnhancedBranchingNode';
export default EnhancedBranchingNode;
