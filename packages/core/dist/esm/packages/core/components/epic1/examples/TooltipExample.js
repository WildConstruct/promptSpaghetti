import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Example: How to use the contextual tooltip system
 *
 * This example shows various tooltip implementations
 * for Epic 1's help system.
 */
import { useState } from 'react';
import { TooltipManagerProvider, ContextualTooltips, TooltipWrapper, SmartTooltip, TooltipContent, QuickTooltip, useTooltipManager, useTooltipSequence, AutoTooltips, } from '../onboarding';
// Example: Basic tooltip usage
export const BasicTooltipExample = () => {
    return (_jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Basic Tooltip Examples" }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginTop: '24px' }, children: [_jsx(TooltipWrapper, { content: "Simple text tooltip", children: _jsx("button", { style: { padding: '8px 16px' }, children: "Hover for text" }) }), _jsx(TooltipWrapper, { content: _jsx(QuickTooltip, { text: "With keyboard shortcut", shortcut: "Ctrl+S" }), position: "top", children: _jsx("button", { style: { padding: '8px 16px' }, children: "Hover for shortcut" }) }), _jsx(TooltipWrapper, { content: _jsx(TooltipContent, { title: "Rich Content", description: "Tooltips can contain rich formatting, examples, and actions.", icon: "\uD83D\uDCA1", shortcut: "Cmd+K", example: "Type to search...", learnMore: () => alert('Learn more clicked!') }), position: "right", delay: 300, children: _jsx("button", { style: { padding: '8px 16px' }, children: "Hover for rich content" }) })] })] }));
};
// Example: Contextual tooltips for UI elements
export const ContextualTooltipExample = () => {
    return (_jsx(TooltipManagerProvider, { children: _jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Contextual Tooltip System" }), _jsxs("div", { style: { marginTop: '24px' }, children: [_jsx("div", { className: "mock-canvas", style: {
                                width: '600px',
                                height: '400px',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f9fafb',
                            }, children: _jsx("span", { style: { color: '#6b7280' }, children: "Canvas Area" }) }), _jsxs("div", { style: { marginTop: '16px', display: 'flex', gap: '12px' }, children: [_jsx("button", { className: "preview-button", style: { padding: '8px 16px' }, children: "Preview" }), _jsx("button", { className: "save-button", style: { padding: '8px 16px' }, children: "Save" }), _jsx("button", { className: "settings-button", style: { padding: '8px 16px' }, children: "\u2699\uFE0F Settings" })] })] }), _jsx(ContextualTooltips, {}), _jsx(AutoTooltips, { showForNewUsers: true })] }) }));
};
// Example: Programmatic tooltip control
export const ProgrammaticTooltipExample = () => {
    const TooltipControls = () => {
        const { showTooltip, hideTooltip, hideAllTooltips } = useTooltipManager();
        const { startSequence, nextInQueue, clearQueue, isShowingQueue } = useTooltipSequence();
        return (_jsxs("div", { children: [_jsx("h3", { children: "Programmatic Control" }), _jsxs("div", { style: { display: 'flex', gap: '12px', marginTop: '16px' }, children: [_jsx("button", { onClick: () => showTooltip({
                                id: 'manual-1',
                                target: '.target-element',
                                title: 'Manual Tooltip',
                                content: 'This tooltip was triggered programmatically',
                                position: 'right',
                                priority: 'high',
                            }), style: { padding: '8px 16px' }, children: "Show Tooltip" }), _jsx("button", { onClick: () => hideTooltip('manual-1'), style: { padding: '8px 16px' }, children: "Hide Specific" }), _jsx("button", { onClick: hideAllTooltips, style: { padding: '8px 16px' }, children: "Hide All" })] }), _jsx("h3", { style: { marginTop: '24px' }, children: "Tooltip Sequences" }), _jsxs("div", { style: { display: 'flex', gap: '12px', marginTop: '16px' }, children: [_jsx("button", { onClick: () => startSequence('firstTimeUser'), style: { padding: '8px 16px' }, children: "Start Tutorial Sequence" }), _jsx("button", { onClick: nextInQueue, disabled: !isShowingQueue, style: { padding: '8px 16px' }, children: "Next in Queue" }), _jsx("button", { onClick: clearQueue, disabled: !isShowingQueue, style: { padding: '8px 16px' }, children: "Clear Queue" })] }), _jsx("div", { className: "target-element", style: {
                        marginTop: '24px',
                        padding: '20px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }, children: "Target Element" })] }));
    };
    return (_jsx(TooltipManagerProvider, { children: _jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Programmatic Tooltip Control" }), _jsx(TooltipControls, {}), _jsx(ContextualTooltips, {})] }) }));
};
// Example: Smart positioning
export const SmartPositioningExample = () => {
    const [targetEl, setTargetEl] = useState(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState('auto');
    return (_jsxs("div", { style: { padding: '40px', minHeight: '500px' }, children: [_jsx("h2", { children: "Smart Tooltip Positioning" }), _jsxs("div", { style: { marginTop: '24px' }, children: [_jsx("label", { children: "Position: " }), _jsxs("select", { value: position, onChange: (e) => setPosition(e.target.value), style: { marginLeft: '8px' }, children: [_jsx("option", { value: "auto", children: "Auto" }), _jsx("option", { value: "top", children: "Top" }), _jsx("option", { value: "right", children: "Right" }), _jsx("option", { value: "bottom", children: "Bottom" }), _jsx("option", { value: "left", children: "Left" })] })] }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '40px',
                    marginTop: '40px',
                }, children: ['Top Left', 'Top Center', 'Top Right',
                    'Middle Left', 'Middle Center', 'Middle Right',
                    'Bottom Left', 'Bottom Center', 'Bottom Right'].map((label, index) => (_jsx("button", { ref: (el) => {
                        if (el && visible && targetEl?.textContent === label) {
                            setTargetEl(el);
                        }
                    }, onMouseEnter: (e) => {
                        setTargetEl(e.currentTarget);
                        setVisible(true);
                    }, onMouseLeave: () => setVisible(false), style: {
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: '#f9fafb',
                    }, children: label }, label))) }), _jsx(SmartTooltip, { target: targetEl, visible: visible, position: position, arrow: true, children: _jsxs("div", { style: { padding: '12px' }, children: [_jsx("h4", { style: { margin: '0 0 4px 0', fontSize: '14px' }, children: "Smart Positioning" }), _jsx("p", { style: { margin: 0, fontSize: '12px', color: '#6b7280' }, children: "The tooltip automatically adjusts to stay within viewport bounds" })] }) })] }));
};
// Example: Custom tooltip configurations
export const CustomTooltipExample = () => {
    const customTooltips = [
        {
            id: 'node-library',
            target: '.node-palette',
            title: 'Node Library',
            content: 'Drag node types from here to add them to your canvas',
            position: 'right',
            delay: 500,
            priority: 'high',
            actions: [
                { label: 'Show me', action: () => alert('Showing node library tutorial') },
            ],
        },
        {
            id: 'keyboard-help',
            target: '.help-button',
            title: 'Keyboard Shortcuts',
            content: 'Press ? to see all available keyboard shortcuts',
            position: 'bottom',
            delay: 1000,
            showOnce: true,
        },
    ];
    return (_jsx(TooltipManagerProvider, { children: _jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Custom Tooltip Configurations" }), _jsxs("div", { style: { marginTop: '24px', display: 'flex', gap: '20px' }, children: [_jsxs("div", { className: "node-palette", style: {
                                width: '200px',
                                height: '300px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                backgroundColor: '#f9fafb',
                            }, children: [_jsx("h3", { style: { margin: '0 0 12px 0', fontSize: '16px' }, children: "Node Palette" }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Hover to see custom tooltip with action" })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("button", { className: "help-button", style: {
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                    }, children: "? Help" }), _jsx("p", { style: { marginTop: '16px', fontSize: '14px', color: '#6b7280' }, children: "The help button tooltip will only show once" })] })] }), _jsx(ContextualTooltips, { additionalTooltips: customTooltips })] }) }));
};
