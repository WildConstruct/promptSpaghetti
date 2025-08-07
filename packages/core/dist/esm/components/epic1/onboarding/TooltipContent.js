import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TooltipContent = ({ title, description, icon, shortcut, example, learnMore, }) => {
    return (_jsxs("div", { style: { padding: '12px', maxWidth: '280px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [icon && (_jsx("span", { style: { fontSize: '20px' }, children: icon })), _jsx("h4", { style: {
                            fontSize: '15px',
                            fontWeight: 600,
                            margin: 0,
                            flex: 1,
                            color: '#1a1a1a',
                        }, children: title }), shortcut && (_jsx("kbd", { style: {
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            color: '#4b5563',
                        }, children: shortcut }))] }), _jsx("p", { style: {
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#4a4a4a',
                    margin: '0 0 8px 0',
                }, children: description }), example && (_jsx("div", { style: {
                    backgroundColor: '#f9fafb',
                    borderLeft: '3px solid #6366f1',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                }, children: _jsxs("p", { style: {
                        fontSize: '12px',
                        color: '#4b5563',
                        margin: 0,
                        fontFamily: 'monospace',
                    }, children: ["Example: ", example] }) })), learnMore && (_jsx("button", { onClick: learnMore, style: {
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                }, children: "Learn more \u2192" }))] }));
};
// Specialized tooltip content for different features
export const NodeEditTooltip = () => (_jsx(TooltipContent, { title: "Inline Editing", description: "Double-click any text in a node to edit it directly. Your changes save automatically when you click outside or press Enter.", icon: "\u270F\uFE0F", shortcut: "Double-click", example: "Change 'brave' to 'fearless'" }));
export const CanvasControlsTooltip = () => (_jsx(TooltipContent, { title: "Canvas Navigation", description: "Use your mouse to navigate the canvas. Drag to pan around, scroll to zoom in/out, and right-click for the context menu.", icon: "\uD83D\uDDB1\uFE0F", example: "Hold Space + drag for quick pan" }));
export const ConnectionTooltip = () => (_jsx(TooltipContent, { title: "Connect Nodes", description: "Drag from the edge of one node to another to create a connection. Delete connections by selecting and pressing Delete.", icon: "\uD83D\uDD17", shortcut: "Drag handles" }));
export const PreviewTooltip = () => (_jsx(TooltipContent, { title: "Generate Variations", description: "Click to generate multiple variations of your prompt using different random seeds. Each run produces unique results.", icon: "\uD83C\uDFB2", shortcut: "Ctrl/Cmd + Enter", example: "5 variations with different seeds" }));
export const SaveTooltip = () => (_jsx(TooltipContent, { title: "Auto-Save Active", description: "Your work is automatically saved every 5 seconds. The cloud icon shows when saves are in progress.", icon: "\u2601\uFE0F", example: "Last saved: 2 seconds ago" }));
export const PaletteTooltip = () => (_jsx(TooltipContent, { title: "Node Library", description: "Drag any node type from here onto the canvas to add it to your graph. Each type has unique properties.", icon: "\uD83C\uDFA8", learnMore: () => window.dispatchEvent(new Event('showNodeTypes')) }));
// Tooltip content registry
export const tooltipContent = {
    'node-edit': NodeEditTooltip,
    'canvas-controls': CanvasControlsTooltip,
    'connection': ConnectionTooltip,
    'preview': PreviewTooltip,
    'save': SaveTooltip,
    'palette': PaletteTooltip,
};
// Quick tooltip component
export const QuickTooltip = ({ text, shortcut }) => (_jsxs("div", { style: {
        padding: '8px 12px',
        fontSize: '13px',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    }, children: [_jsx("span", { children: text }), shortcut && (_jsx("kbd", { style: {
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '3px',
                padding: '1px 4px',
                fontSize: '11px',
                fontFamily: 'monospace',
            }, children: shortcut }))] }));
