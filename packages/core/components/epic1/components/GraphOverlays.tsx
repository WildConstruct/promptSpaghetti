import React from 'react';
import { Node } from 'reactflow';
import { ConnectionToast } from '../ConnectionToast';
import { NodeContextMenu } from '../nodes/NodeContextMenu';
import { SaveAsPresetDialog } from '../asset-library/SaveAsPresetDialog';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { SafeReactFlowWrapper } from '../SafeReactFlowWrapper';
import type { EditableNodeData } from '../nodes';
import type { Preset } from '../asset-library';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface GraphOverlaysProps {
  // Toast props
  toasts: Toast[];
  onDismissToast: (id: string) => void;
  
  // Context menu props
  contextMenuNodeId: string | null;
  contextMenuPosition: { x: number; y: number } | null;
  nodes: Node<EditableNodeData>[];
  onCloseContextMenu: () => void;
  onSaveAsPreset: () => void;
  
  // Save preset dialog props
  saveAsPresetNodeId: string | null;
  saveAsPresetNode: { data: EditableNodeData; type: string } | null;
  onCloseSaveDialog: () => void;
  onSavePreset: (preset: Preset) => void;
  
  // Keyboard shortcuts props
  keyboardHandlers?: any;
  
  // Loading/processing overlays
  isProcessing?: boolean;
  processingMessage?: string;
}

/**
 * GraphOverlays - Manages all overlay UI elements
 * Includes toasts, dialogs, context menus, and loading states
 */
export const GraphOverlays: React.FC<GraphOverlaysProps> = ({
  toasts,
  onDismissToast,
  contextMenuNodeId,
  contextMenuPosition,
  nodes,
  onCloseContextMenu,
  onSaveAsPreset,
  saveAsPresetNodeId,
  saveAsPresetNode,
  onCloseSaveDialog,
  onSavePreset,
  keyboardHandlers,
  isProcessing = false,
  processingMessage = 'Processing...',
}) => {
  return (
    <>
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <ConnectionToast
          key={toast.id}
          message={toast}
          onDismiss={() => onDismissToast(toast.id)}
        />
      ))}
      
      {/* Context menu */}
      <NodeContextMenu
        nodeId={contextMenuNodeId || ''}
        nodeType={nodes.find(n => n.id === contextMenuNodeId)?.type || 'textBlock'}
        position={contextMenuPosition}
        onClose={onCloseContextMenu}
        onSaveAsPreset={onSaveAsPreset}
      />
      
      {/* Save as preset dialog */}
      <SaveAsPresetDialog
        isOpen={!!saveAsPresetNodeId}
        nodeData={saveAsPresetNode?.data || null}
        nodeType={saveAsPresetNode?.type || 'textBlock'}
        onClose={onCloseSaveDialog}
        onSave={onSavePreset}
      />
      
      {/* Keyboard shortcuts handler */}
      {keyboardHandlers && (
        <SafeReactFlowWrapper>
          <KeyboardShortcuts {...keyboardHandlers} />
        </SafeReactFlowWrapper>
      )}
      
      {/* Processing overlay */}
      {isProcessing && (
        <ProcessingOverlay message={processingMessage} />
      )}
    </>
  );
};

/**
 * ProcessingOverlay - Shows a loading state over the entire editor
 */
const ProcessingOverlay: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="epic1-processing-overlay">
      <div className="epic1-processing-content">
        <div className="epic1-processing-spinner" />
        <div className="epic1-processing-message">{message}</div>
      </div>
    </div>
  );
};

/**
 * ErrorBoundaryOverlay - Shows when something goes wrong
 */
export const ErrorBoundaryOverlay: React.FC<{ 
  error: Error; 
  onRetry: () => void;
  onReport: () => void;
}> = ({ error, onRetry, onReport }) => {
  return (
    <div className="epic1-error-overlay">
      <div className="epic1-error-content">
        <h3>Something went wrong</h3>
        <p className="epic1-error-message">{error.message}</p>
        <div className="epic1-error-actions">
          <button onClick={onRetry}>Retry</button>
          <button onClick={onReport}>Report Issue</button>
        </div>
        <details className="epic1-error-details">
          <summary>Technical Details</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    </div>
  );
};