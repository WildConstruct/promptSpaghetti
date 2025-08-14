import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ConnectionToast } from '../ConnectionToast';
import { NodeContextMenu } from '../nodes/NodeContextMenu';
import { SaveAsPresetDialog } from '../asset-library/SaveAsPresetDialog';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { SafeReactFlowWrapper } from '../SafeReactFlowWrapper';
/**
 * GraphOverlays - Manages all overlay UI elements
 * Includes toasts, dialogs, context menus, and loading states
 */
export const GraphOverlays = ({ toasts, onDismissToast, contextMenuNodeId, contextMenuPosition, nodes, onCloseContextMenu, onSaveAsPreset, saveAsPresetNodeId, saveAsPresetNode, onCloseSaveDialog, onSavePreset, keyboardHandlers, isProcessing = false, processingMessage = 'Processing...', }) => {
    return (_jsxs(_Fragment, { children: [toasts.map((toast) => (_jsx(ConnectionToast, { message: toast, onDismiss: () => onDismissToast(toast.id) }, toast.id))), _jsx(NodeContextMenu, { nodeId: contextMenuNodeId || '', nodeType: nodes.find(n => n.id === contextMenuNodeId)?.type || 'textBlock', position: contextMenuPosition, onClose: onCloseContextMenu, onSaveAsPreset: onSaveAsPreset }), _jsx(SaveAsPresetDialog, { isOpen: !!saveAsPresetNodeId, nodeData: saveAsPresetNode?.data || null, nodeType: saveAsPresetNode?.type || 'textBlock', onClose: onCloseSaveDialog, onSave: onSavePreset }), keyboardHandlers && (_jsx(SafeReactFlowWrapper, { children: _jsx(KeyboardShortcuts, { ...keyboardHandlers }) })), isProcessing && (_jsx(ProcessingOverlay, { message: processingMessage }))] }));
};
/**
 * ProcessingOverlay - Shows a loading state over the entire editor
 */
const ProcessingOverlay = ({ message }) => {
    return (_jsx("div", { className: "epic1-processing-overlay", children: _jsxs("div", { className: "epic1-processing-content", children: [_jsx("div", { className: "epic1-processing-spinner" }), _jsx("div", { className: "epic1-processing-message", children: message })] }) }));
};
/**
 * ErrorBoundaryOverlay - Shows when something goes wrong
 */
export const ErrorBoundaryOverlay = ({ error, onRetry, onReport }) => {
    return (_jsx("div", { className: "epic1-error-overlay", children: _jsxs("div", { className: "epic1-error-content", children: [_jsx("h3", { children: "Something went wrong" }), _jsx("p", { className: "epic1-error-message", children: error.message }), _jsxs("div", { className: "epic1-error-actions", children: [_jsx("button", { onClick: onRetry, children: "Retry" }), _jsx("button", { onClick: onReport, children: "Report Issue" })] }), _jsxs("details", { className: "epic1-error-details", children: [_jsx("summary", { children: "Technical Details" }), _jsx("pre", { children: error.stack })] })] }) }));
};
