import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import contexts
import {
  GraphEditorProvider,
  NotificationProvider,
  PreviewProvider,
  NotificationContainer,
  useGraphEditor,
  useNotifications,
  usePreview,
} from './contexts';

// Import components
import { GraphCanvas } from './components/GraphCanvas';
import { GraphControls } from './components/GraphControls';
import { GraphOverlays } from './components/GraphOverlays';
import { TabbedSidePanel } from './TabbedSidePanel';

// Import hooks
import { useKeyboardHandlers, useDragDropHandlers, useContextMenu } from './hooks';

// Import node types
import { droppableEpic1NodeTypes, epic1NodeTypes } from './nodes';
import { edgeTypes } from './EdgeRenderingFix';

// Import styles
import './ReactFlowOverrides.css';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './PanZoomControls.css';

import type { Node, Edge } from 'reactflow';
import type { EditableNodeData } from './nodes';

export interface Epic1GraphEditorProps {
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onExecute?: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
  showPreview?: boolean;
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
  showAssetLibrary?: boolean;
}

/**
 * Epic1GraphEditorContent - The actual editor implementation
 * This component uses all the contexts and is super clean!
 */
const Epic1GraphEditorContent: React.FC<{
  onExecute?: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
  showAssetLibrary?: boolean;
}> = ({ onExecute, showAssetLibrary = true }) => {
  const {
    nodes,
    edges,
    activatedEdges,
    isDragging,
    setNodes,
    setEdges,
    setIsSelecting,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    handleEdgeClick,
    handlePaneClick,
    reactFlowInstance,
    setReactFlowInstance,
    showPreview,
    setShowPreview,
  } = useGraphEditor();

  const { showNotification, notifications, dismissNotification } = useNotifications();
  const { previewEngine, isPreviewVisible, setPreviewVisible } = usePreview();

  const [nodePaletteCollapsed, setNodePaletteCollapsed] = React.useState(false);

  // Use drag & drop handlers
  const { onDragOver, onDrop, insertPresetByMeta } = useDragDropHandlers({
    setNodes,
    setEdges,
    reactFlowInstance,
    showToast: showNotification,
    addNodeWithBounce: undefined, // You can add this if needed
  });

  // Use keyboard handlers
  const handleTogglePreview = React.useCallback(() => {
    setPreviewVisible(!isPreviewVisible);
    showNotification('info', `Preview ${!isPreviewVisible ? 'shown' : 'hidden'}`);
  }, [isPreviewVisible, setPreviewVisible, showNotification]);

  const { keyboardHandlers } = useKeyboardHandlers({
    nodes,
    edges,
    setNodes,
    setEdges,
    showToast: showNotification,
    onTogglePreview: handleTogglePreview,
  });

  // Use context menu
  const {
    contextMenuPosition,
    contextMenuNodeId,
    saveAsPresetNodeId,
    saveAsPresetNode,
    setSaveAsPresetNodeId,
    setContextMenuPosition,
    handleSaveAsPreset,
    handleSavePreset,
  } = useContextMenu({ 
    nodes, 
    showToast: (message, type) => showNotification(type, message) 
  });

  // Handle execute
  const handleExecute = React.useCallback(() => {
    if (onExecute) {
      onExecute(nodes, edges);
      showNotification('success', 'Graph executed successfully!');
    }
  }, [nodes, edges, onExecute, showNotification]);

  // Handle ReactFlow initialization
  const onInit = React.useCallback((instance) => {
    setReactFlowInstance(instance);
    setTimeout(() => {
      instance.fitView({ 
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5
      });
    }, 100);
  }, [setReactFlowInstance]);

  // Connection validation
  const isValidConnection = React.useCallback((connection) => {
    // Add your validation logic here
    return true;
  }, []);

  const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;

  const minimapStyle = React.useMemo(() => ({
    left: nodePaletteCollapsed ? 50 : 210,
    top: 70,
    width: '200px',
    height: '120px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
    transition: 'left 0.3s ease-in-out'
  }), [nodePaletteCollapsed]);

  return (
    <div 
      className="epic1-graph-editor" 
      style={{ height: '100%', position: 'relative' }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {/* Main canvas */}
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onSelectionStart={() => setIsSelecting(true)}
        onSelectionEnd={() => setIsSelecting(false)}
        onInit={onInit}
        isValidConnection={isValidConnection}
        activatedEdges={activatedEdges}
        showMinimap={nodes.length > 0}
        minimapStyle={minimapStyle}
      />

      {/* Control panels */}
      <GraphControls
        onTogglePreview={handleTogglePreview}
        onExecute={handleExecute}
        isPreviewVisible={isPreviewVisible}
        onNodePaletteCollapse={setNodePaletteCollapsed}
        showExecuteButton={!!onExecute}
      />

      {/* Side panel with preview and assets */}
      {(showPreview || showAssetLibrary) && (
        <TabbedSidePanel
          previewEngine={previewEngine}
          onInsert={(preset) => {
            const pos = reactFlowInstance
              ? reactFlowInstance.screenToFlowPosition({ 
                  x: window.innerWidth / 2, 
                  y: window.innerHeight / 2 
                })
              : { x: 250, y: 250 };
            void insertPresetByMeta(preset, pos);
          }}
          position="right"
          defaultTab={showAssetLibrary ? 'assets' : isPreviewVisible ? 'preview' : null}
          showAssets={showAssetLibrary}
          showPreview={showPreview}
        />
      )}

      {/* Overlays (toasts, dialogs, etc.) */}
      <GraphOverlays
        toasts={notifications.map(n => ({
          id: n.id,
          type: n.type,
          message: n.message,
        }))}
        onDismissToast={dismissNotification}
        contextMenuNodeId={contextMenuNodeId}
        contextMenuPosition={contextMenuPosition}
        nodes={nodes}
        onCloseContextMenu={() => setContextMenuPosition(null)}
        onSaveAsPreset={handleSaveAsPreset}
        saveAsPresetNodeId={saveAsPresetNodeId}
        saveAsPresetNode={saveAsPresetNode}
        onCloseSaveDialog={() => setSaveAsPresetNodeId(null)}
        onSavePreset={handleSavePreset}
        keyboardHandlers={keyboardHandlers}
      />

      {/* Notification container */}
      <NotificationContainer position="top-right" />
    </div>
  );
};

/**
 * Epic1GraphEditorFinal - The fully refactored editor with all phases complete
 * This is now just ~200 lines and incredibly clean!
 */
export const Epic1GraphEditorFinal: React.FC<Epic1GraphEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onExecute,
  showPreview = true,
  previewDebounceDelay = 300,
  previewSeeds,
  showAssetLibrary = true,
}) => {
  return (
    <ReactFlowProvider>
      <DndProvider backend={HTML5Backend}>
        <GraphEditorProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onNodesChangeProp={onNodesChange}
          onEdgesChangeProp={onEdgesChange}
        >
          <NotificationProvider>
            <PreviewProvider
              nodes={initialNodes}
              edges={initialEdges}
              isDragging={false}
              previewDebounceDelay={previewDebounceDelay}
              previewSeeds={previewSeeds}
            >
              <Epic1GraphEditorContent 
                onExecute={onExecute}
                showAssetLibrary={showAssetLibrary}
              />
            </PreviewProvider>
          </NotificationProvider>
        </GraphEditorProvider>
      </DndProvider>
    </ReactFlowProvider>
  );
};

// Export with compatibility alias
export const Epic1GraphEditor = Epic1GraphEditorFinal;