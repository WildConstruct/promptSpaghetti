import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseEditableNode } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './EnhancedBranching.css';
// Brighter drag handle icon
const DragHandleIcon = () => (_jsxs("svg", { width: "6", height: "12", viewBox: "0 0 6 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "1.5", cy: "1.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "1.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "1.5", cy: "6", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "6", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "1.5", cy: "10.5", r: "1", fill: "currentColor", opacity: "0.6" }), _jsx("circle", { cx: "4.5", cy: "10.5", r: "1", fill: "currentColor", opacity: "0.6" })] }));
// Simplified radio dial component - independent weight control
const RadioDial = ({ value, onChange, percentage, disabled = false }) => {
    // Calculate the arc length for a full circle when value is 100
    // Using 270° arc (3/4 circle) for the visual range
    const circumference = 2 * Math.PI * 19; // Full circle circumference
    const arcLength = circumference * 0.75; // 3/4 of circle for visual range
    const fillLength = (value / 100) * arcLength;
    const handleMouseDown = (e) => {
        if (disabled)
            return;
        // Only respond to left click
        if (e.button !== 0)
            return;
        e.preventDefault();
        e.stopPropagation();
        // CRITICAL: Stop the event from bubbling to the node drag handler
        const event = e.nativeEvent;
        event.stopImmediatePropagation();
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Add visual feedback for interaction
        svg.style.cursor = 'grabbing';
        const updateValue = (clientX, clientY) => {
            const dx = clientX - centerX;
            const dy = clientY - centerY;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            // Normalize angle: -180 to 180 -> 0 to 360
            if (angle < 0)
                angle += 360;
            // Map the 3/4 circle (225° to 135°) to 0-100
            // The dial starts at 225° and goes clockwise to 135°
            let normalizedValue = 0;
            if (angle >= 225) {
                // From 225° to 360° (start to bottom)
                normalizedValue = ((angle - 225) / 270) * 100;
            }
            else if (angle <= 135) {
                // From 0° to 135° (bottom through to end)
                normalizedValue = ((angle + 360 - 225) / 270) * 100;
            }
            else {
                // Between 135° and 225° - dead zone
                // Snap to nearest endpoint
                const distToEnd = Math.abs(angle - 135);
                const distToStart = Math.abs(angle - 225);
                normalizedValue = distToEnd < distToStart ? 100 : 0;
            }
            // Clamp to 0-100 range (changed from 0-200)
            const newValue = Math.round(Math.max(0, Math.min(100, normalizedValue)));
            onChange(newValue);
        };
        const handleMouseMove = (e) => {
            e.preventDefault();
            updateValue(e.clientX, e.clientY);
        };
        const handleMouseUp = (e) => {
            e.preventDefault();
            svg.style.cursor = 'pointer'; // Reset cursor
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        updateValue(e.clientX, e.clientY);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    // Add mouse wheel support
    const handleWheel = (e) => {
        if (disabled)
            return;
        e.preventDefault();
        e.stopPropagation();
        // Stop ReactFlow from zooming
        e.nativeEvent.stopImmediatePropagation();
        // More responsive: 5 units per wheel tick (increased from typical 1-2)
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
// Preset weight patterns
const WEIGHT_PRESETS = {
    equal: { icon: '=', title: 'Equal weights' },
    favorFirst: { icon: '↗', title: 'Favor first' },
    favorLast: { icon: '↘', title: 'Favor last' },
    rampUp: { icon: '📈', title: 'Ramp up' },
    rampDown: { icon: '📉', title: 'Ramp down' }
};
const EnhancedBranchingNodeComponent = (props) => {
    const [options, setOptions] = useState(props.data.options || []);
    const [title, setTitle] = useState(props.data.title || 'Weighted Choice');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const hasBranching = options.some(opt => opt.hasBranch);
    const calculatePercentages = useCallback((opts) => {
        const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
        if (totalWeight === 0)
            return opts.map(() => 0);
        // Show actual weight values, not percentages
        return opts.map(opt => opt.weight);
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
        setOptions(newOptions);
    };
    const updateOptionText = (index, text) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], text };
        setOptions(newOptions);
    };
    const updateOptionWeight = (index, weight) => {
        const newOptions = [...options];
        // Set weight directly without affecting others
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
        // DO NOT preventDefault() here - it breaks HTML5 drag and drop!
        // Set drag data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        // Create a custom drag image to prevent ghost text
        const dragImage = document.createElement('div');
        dragImage.style.width = '1px';
        dragImage.style.height = '1px';
        dragImage.style.opacity = '0';
        dragImage.style.position = 'fixed';
        dragImage.style.pointerEvents = 'none';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        // Clean up the drag image after a short delay
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
        setDraggedIndex(index);
        // Add visual feedback
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
        // Reset visual feedback
        e.currentTarget.style.opacity = '1';
    };
    const percentages = calculatePercentages(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    return (_jsx(BaseEditableNode, { ...props, className: "weighted-choice enhanced-branching", style: { width: '520px' }, minWidth: 520, minHeight: 180, data: {
            ...props.data,
            nodeType: 'enhancedBranching',
            options,
            title,
            onEdit: (value) => {
                props.data.onEdit?.(JSON.stringify({ options, title }));
            }
        }, children: ({ isEditing, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "enhanced-branching-editor", onMouseDown: (e) => e.stopPropagation(), children: [_jsx("div", { className: "enhanced-title-section", children: isEditingTitle ? (_jsx("input", { type: "text", className: "title-edit-input", value: title, onChange: (e) => setTitle(e.target.value), onBlur: () => setIsEditingTitle(false), onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        setIsEditingTitle(false);
                                }, autoFocus: true })) : (_jsxs("div", { className: "title-display", children: [_jsx("span", { className: "title-text", children: title.toUpperCase() }), _jsx("button", { className: "title-edit-btn", onClick: () => setIsEditingTitle(true), title: "Edit title", children: "\u270F\uFE0F" })] })) }), _jsxs("div", { className: "enhanced-presets", children: [Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (_jsx("button", { className: "preset-btn", onClick: () => applyPreset(key), title: preset.title, children: preset.icon }, key))), _jsxs("div", { className: "total-weight", children: ["Total: ", totalWeight] })] }), _jsx("div", { className: "enhanced-options-list", onWheel: (e) => {
                                e.stopPropagation();
                                // Allow scrolling within the list
                            }, children: options.map((option, index) => (_jsxs("div", { className: `enhanced-option-row ${draggedIndex === index ? 'dragging' : ''}`, onDragOver: (e) => handleDragOver(e, index), onDrop: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }, onMouseDown: (e) => {
                                    // Always stop propagation to prevent node dragging
                                    e.stopPropagation();
                                }, children: [_jsx("div", { className: "enhanced-drag-handle nodrag", draggable: "true", onDragStart: (e) => handleDragStart(e, index), onDragEnd: handleDragEnd, onMouseDown: (e) => {
                                            // Prevent node dragging when using drag handle
                                            e.stopPropagation();
                                            // Don't prevent default - we need it for HTML5 drag
                                        }, style: { cursor: 'grab' }, title: "Drag to reorder", children: _jsx(DragHandleIcon, {}) }), _jsx("input", { type: "text", className: "enhanced-option-text nodrag", value: option.text, onChange: (e) => updateOptionText(index, e.target.value), placeholder: "Option text...", onMouseDown: (e) => {
                                            e.stopPropagation();
                                            e.currentTarget.focus();
                                        }, onClick: (e) => e.stopPropagation(), style: { pointerEvents: 'all' } }), _jsx(RadioDial, { value: option.weight, onChange: (val) => updateOptionWeight(index, val), percentage: percentages[index] }), _jsx("button", { className: `branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`, onClick: (e) => {
                                            e.stopPropagation();
                                            toggleBranch(index);
                                        }, onMouseDown: (e) => e.stopPropagation(), title: "Toggle branch output", children: "\u26A1" }), options.length > 1 && (_jsx("button", { className: "remove-btn nodrag", onClick: (e) => {
                                            e.stopPropagation();
                                            removeOption(index);
                                        }, onMouseDown: (e) => e.stopPropagation(), title: "Remove option", children: "\u00D7" })), option.hasBranch && (_jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "enhanced-handle branch-output", style: {
                                            position: 'absolute',
                                            right: -8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 1000
                                        } }))] }, index))) }), _jsxs("div", { className: "enhanced-footer", children: [_jsx("div", { className: "hints", children: "Drag to reorder \u2022 \u26A1 = branch output \u2022 Click and drag dials to adjust weights" }), _jsxs("div", { className: "footer-controls", children: [_jsx("button", { className: "add-option-btn", onClick: addOption, children: "+ Add Option" }), _jsxs("div", { className: "edit-actions", children: [_jsx("button", { className: "confirm-btn", onClick: confirmEdit, children: "\u2713" }), _jsx("button", { className: "cancel-btn", onClick: cancelEdit, children: "\u00D7" })] })] })] }), hasBranching && (_jsx(Handle, { type: "source", position: Position.Top, id: "main-output", className: "enhanced-handle main-output", style: {
                                position: 'absolute',
                                top: -8,
                                right: 30,
                                left: 'auto',
                                transform: 'translateX(50%)'
                            } }))] }));
            }
            // Display mode
            return (_jsxs("div", { className: "enhanced-branching-display", children: [_jsx("div", { className: "display-title", children: title }), _jsx("div", { className: "display-options", children: options.map((option, index) => (_jsxs("div", { className: "display-option", children: [_jsxs("span", { className: "option-text", children: [option.text || 'Empty option', option.hasBranch && ' ⚡'] }), _jsxs("span", { className: "option-percentage", children: [percentages[index], "%"] }), option.hasBranch && (_jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "enhanced-handle branch-output", style: {
                                        position: 'absolute',
                                        right: -10, // Position on frame edge in display mode
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    } }))] }, index))) }), hasBranching && (_jsx(Handle, { type: "source", position: Position.Top, id: "main-output", className: "enhanced-handle main-output", style: {
                            position: 'absolute',
                            top: -8,
                            right: 30,
                            left: 'auto',
                            transform: 'translateX(50%)'
                        } }))] }));
        } }));
};
export const EnhancedBranchingNode = memo(EnhancedBranchingNodeComponent);
EnhancedBranchingNode.displayName = 'EnhancedBranchingNode';
export default EnhancedBranchingNode;
