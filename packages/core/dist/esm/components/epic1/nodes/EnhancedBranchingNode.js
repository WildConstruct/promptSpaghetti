import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, useCallback, useRef, useLayoutEffect } from 'react';
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
    // Ensure all options have hasBranch set to false by default
    const initializeOptions = () => {
        // Check if options are in props.data.options
        if (Array.isArray(props.data?.options) && props.data.options.length > 0) {
            // Ensure hasBranch is false if not explicitly set
            return props.data.options.map(opt => ({
                ...opt,
                hasBranch: opt.hasBranch === true // Only true if explicitly true
            }));
        }
        // Try to parse from value if it's a JSON string
        if (typeof props.data?.value === 'string') {
            try {
                const parsed = JSON.parse(props.data.value);
                if (Array.isArray(parsed.options)) {
                    return parsed.options.map((opt) => ({
                        ...opt,
                        hasBranch: opt.hasBranch === true
                    }));
                }
            }
            catch (e) {
                // Ignore parse errors
            }
        }
        // Default options with branching OFF
        return [
            { text: '', weight: 50, hasBranch: false },
            { text: '', weight: 50, hasBranch: false }
        ];
    };
    const [options, setOptions] = useState(initializeOptions());
    const [title, setTitle] = useState(props.data?.title || 'Weighted Choice');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [mainHandleTop, setMainHandleTop] = useState(35);
    const [branchHandleTops, setBranchHandleTops] = useState([]);
    const nodeRef = useRef(null);
    const optionRefs = useRef([]);
    const hasBranching = options.some(opt => opt.hasBranch);
    // Calculate the position of the main handle and each branch handle relative to the node box
    useLayoutEffect(() => {
        if (!nodeRef.current || !hasBranching)
            return;
        // The handles are absolutely positioned relative to the outer node container
        const editorElInit = nodeRef.current;
        const rootEl = editorElInit.closest('.epic1-editable-node');
        const calcPositions = () => {
            const editorEl = nodeRef.current;
            const nodeRect = (rootEl ?? editorEl).getBoundingClientRect();
            // Determine mode accurately: the nodeRef points directly at the editor/display container
            const isEditingMode = editorEl.classList.contains('enhanced-branching-editor');
            // Mode-specific vertical nudge for main handle baseline
            // Edit: bring all handles down ~10px; Display unchanged
            const vNudge = isEditingMode ? -36 : -30;
            // Title center for main handle
            const titleElement = editorEl.querySelector('.enhanced-title-section, .display-title');
            if (titleElement) {
                const titleRect = titleElement.getBoundingClientRect();
                const relativeTop = titleRect.top - nodeRect.top + (titleRect.height / 2) + vNudge;
                setMainHandleTop(relativeTop);
            }
            // Option row centers for branch handles
            const tops = options.map((_, i) => {
                const rowEl = optionRefs.current[i];
                if (!rowEl)
                    return 0;
                // Use the entire row's visual box to match the dark rounded background
                const r = rowEl.getBoundingClientRect();
                // Branch-only fine tune: push orange lower in edit more than green
                const branchFineTune = isEditingMode ? -2 : 1;
                return r.top - nodeRect.top + r.height / 2 + vNudge + branchFineTune;
            });
            // Apply mode-specific spacing and lift for branches
            // Spacing unchanged
            const compress = isEditingMode ? 0.77 : 0.77;
            // Extra lift: move branches up relative to main
            // Drop edit branches further overall than green
            const extraLift = isEditingMode ? -40 : -21;
            const adjustedTops = tops.length
                ? tops.map((t, idx) => {
                    const base = tops[0];
                    return base + (t - base) * compress + extraLift;
                })
                : tops;
            setBranchHandleTops(adjustedTops);
            // Keep optionRefs array in sync with options length
            optionRefs.current.length = options.length;
        };
        // Run once after layout, and schedule follow-ups to catch async ref assignments
        calcPositions();
        requestAnimationFrame(() => calcPositions());
        setTimeout(() => calcPositions(), 0);
        // Recalculate on resize of node
        const ro = new ResizeObserver(() => {
            calcPositions();
        });
        ro.observe(nodeRef.current);
        // Recalculate on DOM mutations (edit/display mode toggle, content changes)
        let mo = null;
        if (rootEl) {
            mo = new MutationObserver(() => {
                // Recalc immediately and again on next frames to handle mode swaps and ref updates
                calcPositions();
                requestAnimationFrame(() => calcPositions());
                setTimeout(() => calcPositions(), 0);
            });
            mo.observe(rootEl, { childList: true, subtree: true, attributes: true });
        }
        // Also listen to window resize (zoom/layout changes)
        window.addEventListener('resize', calcPositions);
        return () => {
            try {
                ro.disconnect();
            }
            catch { }
            try {
                mo?.disconnect();
            }
            catch { }
            window.removeEventListener('resize', calcPositions);
        };
    }, [hasBranching, title, options.length]);
    const calculatePercentages = useCallback((opts) => {
        const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
        if (totalWeight === 0)
            return opts.map(() => 0);
        // Calculate actual percentages
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
            nodeType: 'weightedChoice', // Use weightedChoice for compatibility
            options, // Pass current options state so BaseEditableNode can check hasBranch
            title,
            onEdit: (value) => {
                props.data.onEdit?.(JSON.stringify({ options, title }));
            }
        }, children: ({ isEditing, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { ref: nodeRef, className: "enhanced-branching-editor", onMouseDown: (e) => e.stopPropagation(), children: [_jsx("div", { className: "enhanced-title-section", children: isEditingTitle ? (_jsx("input", { type: "text", className: "title-edit-input", value: title, onChange: (e) => setTitle(e.target.value), onBlur: () => setIsEditingTitle(false), onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        setIsEditingTitle(false);
                                    e.stopPropagation(); // Prevent node keyboard shortcuts
                                }, onPaste: (e) => e.stopPropagation(), onCopy: (e) => e.stopPropagation(), onCut: (e) => e.stopPropagation(), autoFocus: true })) : (_jsxs("div", { className: "title-display", children: [_jsx("span", { className: "title-text", children: title.toUpperCase() }), _jsx("button", { className: "title-edit-btn", onClick: () => setIsEditingTitle(true), title: "Edit title", children: "\u270F\uFE0F" })] })) }), _jsxs("div", { className: "enhanced-presets", children: [Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (_jsx("button", { className: "preset-btn", onClick: () => applyPreset(key), title: preset.title, children: preset.icon }, key))), _jsxs("div", { className: "total-weight", children: ["Total: ", totalWeight] })] }), _jsx("div", { className: "enhanced-options-list", onWheel: (e) => {
                                e.stopPropagation();
                                // Allow scrolling within the list
                            }, children: options.map((option, index) => (_jsxs("div", { className: `enhanced-option-row ${draggedIndex === index ? 'dragging' : ''}`, ref: (el) => { optionRefs.current[index] = el; }, onDragOver: (e) => handleDragOver(e, index), onDrop: (e) => {
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
                                        }, onClick: (e) => e.stopPropagation(), onPaste: (e) => {
                                            // Allow paste events to work properly
                                            e.stopPropagation();
                                        }, onCopy: (e) => {
                                            // Allow copy events to work properly
                                            e.stopPropagation();
                                        }, onCut: (e) => {
                                            // Allow cut events to work properly
                                            e.stopPropagation();
                                        }, style: { pointerEvents: 'all' } }), _jsx(RadioDial, { value: option.weight, onChange: (val) => updateOptionWeight(index, val), percentage: percentages[index] }), _jsx("button", { className: `branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`, onClick: (e) => {
                                            e.stopPropagation();
                                            toggleBranch(index);
                                        }, onMouseDown: (e) => e.stopPropagation(), title: "Toggle branch output", children: "\u26A1" }), options.length > 1 && (_jsx("button", { className: "remove-btn nodrag", onClick: (e) => {
                                            e.stopPropagation();
                                            removeOption(index);
                                        }, onMouseDown: (e) => e.stopPropagation(), title: "Remove option", children: "\u00D7" })), option.hasBranch && (_jsx("span", { style: {
                                            position: 'absolute',
                                            right: '10px',
                                            color: '#f59e0b',
                                            fontSize: '10px'
                                        }, children: "\u25CF" }))] }, index))) }), _jsxs("div", { className: "enhanced-footer", children: [_jsx("div", { className: "hints", children: "Drag to reorder \u2022 \u26A1 = branch output \u2022 Click and drag dials to adjust weights" }), _jsxs("div", { className: "footer-controls", children: [_jsx("button", { className: "add-option-btn", onClick: addOption, children: "+ Add Option" }), _jsxs("div", { className: "edit-actions", children: [_jsx("button", { className: "confirm-btn", onClick: confirmEdit, children: "\u2713" }), _jsx("button", { className: "cancel-btn", onClick: cancelEdit, children: "\u00D7" })] })] })] }), options.map((option, index) => option.hasBranch && (_jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "epic1-handle enhanced-handle branch-output", style: {
                                position: 'absolute',
                                // vertical via CSS var wins over generic !important
                                ['--handle-top']: `${branchHandleTops[index] ?? 0}px`,
                                transform: 'translateY(-50%)',
                                zIndex: 1000,
                                background: '#f59e0b',
                                border: '2px solid #fff',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%'
                            } }, `branch-${index}`))), hasBranching && (_jsx(Handle, { type: "source", position: Position.Right, id: "main", className: "epic1-handle enhanced-handle main-output", style: {
                                position: 'absolute',
                                ['--handle-top']: `${mainHandleTop}px`,
                                transform: 'translateY(-50%)',
                                zIndex: 1000,
                                background: '#10b981',
                                border: '2px solid #fff',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%'
                            } }))] }));
            }
            // Display mode
            return (_jsxs("div", { ref: nodeRef, className: "enhanced-branching-display", style: { position: 'relative' }, children: [_jsx("div", { className: "display-title", children: title }), _jsx("div", { className: "display-options", children: options.map((option, index) => (_jsxs("div", { className: "display-option", style: { position: 'relative' }, ref: (el) => { optionRefs.current[index] = el; }, children: [_jsxs("span", { className: "option-text", children: [option.text || 'Empty option', option.hasBranch && ' ⚡'] }), _jsxs("span", { className: "option-percentage", children: [percentages[index], "%"] })] }, index))) }), options.map((option, index) => option.hasBranch && (_jsx(Handle, { type: "source", position: Position.Right, id: `branch-${index}`, className: "epic1-handle enhanced-handle branch-output", style: {
                            position: 'absolute',
                            ['--handle-top']: `${branchHandleTops[index] ?? 0}px`,
                            transform: 'translateY(-50%)',
                            zIndex: 1000,
                            background: '#f59e0b',
                            border: '2px solid #fff',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%'
                        } }, `branch-${index}`))), hasBranching && (_jsx(Handle, { type: "source", position: Position.Right, id: "main", className: "epic1-handle enhanced-handle main-output", style: {
                            position: 'absolute',
                            ['--handle-top']: `${mainHandleTop}px`,
                            transform: 'translateY(-50%)',
                            zIndex: 1000,
                            background: '#10b981',
                            border: '2px solid #fff',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%'
                        } }))] }));
        } }));
};
export const EnhancedBranchingNode = memo(EnhancedBranchingNodeComponent);
EnhancedBranchingNode.displayName = 'EnhancedBranchingNode';
export default EnhancedBranchingNode;
