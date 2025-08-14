import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Panel } from 'reactflow';
import { NodePalette } from '../NodePalette';
import { NodeToolbar } from '../NodeToolbar';
/**
 * GraphControls - Manages all control panels and toolbars
 * Consolidates UI controls in one place
 */
export const GraphControls = ({ onTogglePreview, onExecute, isPreviewVisible, onNodePaletteCollapse, showExecuteButton = true, showNodePalette = true, showNodeToolbar = true, showInstructions = true, }) => {
    return (_jsxs(_Fragment, { children: [_jsx(Panel, { position: "top-right", children: _jsxs("div", { className: "epic1-controls", children: [_jsx("button", { className: "epic1-preview-toggle", onClick: onTogglePreview, title: "Toggle preview (P)", children: isPreviewVisible ? '👁️' : '👁️‍🗨️' }), showExecuteButton && onExecute && (_jsx("button", { className: "epic1-execute-button", onClick: onExecute, children: "Execute Graph" }))] }) }), showInstructions && (_jsx(Panel, { position: "bottom-center", children: _jsx("div", { className: "epic1-instructions", children: "Click any node to edit \u2022 Tab/Shift+Tab to navigate \u2022 Enter to confirm \u2022 Escape to cancel \u2022 Press P for preview \u2022 Press ? for help" }) })), showNodePalette && (_jsx(NodePalette, { position: "left", defaultCollapsed: false, onCollapsedChange: onNodePaletteCollapse })), showNodeToolbar && (_jsx(NodeToolbar, { position: "top" }))] }));
};
/**
 * QuickActionBar - Floating action bar for common operations
 * Can be positioned anywhere on the canvas
 */
export const QuickActionBar = ({ position = 'top-center', actions }) => {
    return (_jsx(Panel, { position: position, children: _jsx("div", { className: "epic1-quick-actions", children: actions.map((action, index) => (_jsxs("button", { className: "epic1-quick-action", onClick: action.onClick, disabled: action.disabled, title: action.label, children: [_jsx("span", { className: "epic1-quick-action-icon", children: action.icon }), _jsx("span", { className: "epic1-quick-action-label", children: action.label })] }, index))) }) }));
};
