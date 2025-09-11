import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Edge,
  Node,
  ReactFlowProvider,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  ReactFlowInstance,
  MiniMap,
  ConnectionLineType,
  SelectionMode,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Node types and components
import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';

// Custom hooks - using all extracted functionality
import { useKonamiCode } from './hooks/useKonamiCode';
import { useGraphHistory } from './hooks/useGraphHistory';
import { useGraphPersistence } from './hooks/useGraphPersistence';
import { useNodeOperations } from './hooks/useNodeOperations';
import { useGraphDragDrop } from './hooks/useGraphDragDrop';
import { useGraphKeyboardShortcuts } from './hooks/useGraphKeyboardShortcuts';
import { usePreviewTrayLayout } from './hooks/usePreviewTrayLayout';
import { usePreviewEngine } from './hooks/usePreviewEngine';
import { useGraphViewControls } from './hooks/useGraphViewControls';
import { useGraphImportExport } from './hooks/useGraphImportExport';
import { useGraphSelection } from './hooks/useGraphSelection';
import { useGraphPreview } from './hooks/useGraphPreview';

// Components
import { GraphModals } from './components/GraphModals';
import { GraphContextMenus } from './components/GraphContextMenus';
import { ConnectionFeedback, useConnectionValidation } from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import { EdgeRoutingControls } from './EdgeRoutingControls';
import { PreviewPanel } from './preview/PreviewPanel';
import { PreviewTray } from '../PreviewTray/PreviewTray';
import { TabbedSidePanel } from './TabbedSidePanel';
import { NodeTetris } from './NodeTetris';
import { NodeToolbar } from './NodeToolbar';
import { NodePalette } from './NodePalette';
import { MagneticSnapHandler } from './interactions/MagneticSnapHandler';
import { SelectionFeedback, useNodeInteractions } from './interactions/NodeInteractionEnhancer';
import { MicroInteraction, useMicroInteractions } from './animations/MicroInteractions';
import { SafeReactFlowWrapper } from './SafeReactFlowWrapper';
import { edgeTypes } from './EdgeRenderingFix';
import { AuthModal } from '../auth/AuthModal';
import { supabase } from '../../utils/supabaseClient';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';

// Styles
import './ReactFlowOverrides.css';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './nodes/EnhancedBoundingBox.css';
import './PanZoomControls.css';

// Provider placeholders
const IntelligenceProvider = ({ children }: any) => children;
const NeatenSettingsProvider = ({ children }: any) => children;
const HistoryPalette = () => null;
const useAutoLayout = () => ({ 
  neatenSelection: () => {}, 
  neatenAll: () => {}, 
  cleanupNodes: () => {}, 
  cleanupAll: () => {} 
});

export interface Epic1GraphEditorProps {
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onExecute?: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
  showPreview?: boolean;
  previewPosition?: 'top' | 'bottom' | 'left' | 'right';
  previewWidth?: string;
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
}

/**
 * Clean Epic1 Graph Editor using all extracted hooks
 */
const Epic1GraphEditorClean: React.FC<Epic1GraphEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onExecute,
  showPreview = true,
  previewPosition = 'right',
  previewWidth = '400px',
  previewDebounceDelay = 300,
  previewSeeds,
  showAssetLibrary = true,
  assetLibraryPosition = 'left',
}) => {
  // Node types based on asset library visibility
  const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;

  // React Flow instance
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Graph persistence
  const { persistedState } = useGraphPersistence([], [], {
    autoSave: false,
    onLoadSuccess: (state) => console.log('Restored graph from local storage'),
    onLoadError: (error) => console.error('Failed to load persisted state:', error)
  });

  // Initialize nodes and edges with persisted state or initial props
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<EditableNodeData>(
    persistedState?.nodes || initialNodes
  );
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(
    persistedState?.edges || initialEdges
  );

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Graph history (undo/redo)
  const { undo, redo, canUndo, canRedo, clearHistory } = useGraphHistory(
    nodes, 
    edges, 
    setNodes, 
    setEdges,
    { maxHistorySize: 50, debounceDelay: 500 }
  );

  // Auto-save
  useGraphPersistence(nodes, edges, {
    autoSave: true,
    autoSaveDelay: 2000,
    storageKey: 'prompt-graph-autosave'
  });

  // Node operations
  const {
    selectedNodeId,
    createNode,
    handleNodeEdit,
    duplicateNodes,
    deleteSelectedNodes,
    alignNodes,
    distributeNodes,
    handleNodeClick,
    handlePaneClick,
    onConnect,
    onNodesDelete,
    onEdgesDelete
  } = useNodeOperations(nodes, edges, setNodes, setEdges, reactFlowInstance, {
    showToast,
    onNodeSelect: (nodeId) => console.log('Node selected:', nodeId)
  });

  // Selection management
  const {
    selectAll,
    deselectAll,
    invertSelection,
    selectConnectedNodes,
    getSelectionInfo
  } = useGraphSelection(nodes, edges, setNodes, setEdges, { showToast });

  // Import/Export
  const {
    exportGraph,
    exportSelected,
    triggerImport,
    copyToClipboard,
    pasteFromClipboard
  } = useGraphImportExport(nodes, edges, setNodes, setEdges, { showToast });

  // View controls
  const {
    zoomIn,
    zoomOut,
    resetZoom,
    fitView,
    panToCenter,
    panToNode
  } = useGraphViewControls(reactFlowInstance, { showToast });

  // Drag and drop
  const {
    isDraggingOver,
    onDragOver,
    onDragLeave,
    onDragEnter,
    onDrop
  } = useGraphDragDrop(reactFlowInstance, setNodes, {
    showToast,
    onNodeCreate: (node) => console.log('Node created via drag:', node)
  });

  // Keyboard shortcuts
  useGraphKeyboardShortcuts(
    undo,
    redo,
    deleteSelectedNodes,
    duplicateNodes,
    selectAll,
    deselectAll,
    nodes,
    edges,
    setNodes,
    setEdges,
    reactFlowInstance,
    showToast,
    {
      enabled: true,
      shortcuts: [
        { key: 's', meta: true, action: () => exportGraph(), description: 'Save graph' },
        { key: 'o', meta: true, action: () => triggerImport(), description: 'Open graph' },
        { key: 'e', meta: true, action: () => exportSelected(), description: 'Export selection' }
      ]
    }
  );

  // Preview functionality
  const {
    previewResults,
    isPreviewExecuting,
    previewError,
    currentSeeds,
    isPreviewVisible,
    togglePreview,
    updateSeeds,
    executePreview,
    exportPreviewResults
  } = useGraphPreview(nodes, edges, {
    showToast,
    defaultSeeds: previewSeeds ? previewSeeds.map(s => Number(s)) : [1234, 5678, 9012],
    debounceDelay: previewDebounceDelay
  });

  // Preview tray layout
  usePreviewTrayLayout(showPreview);

  // Preview engine (for backward compatibility)
  const { previewEngine, handlePreviewSeedChange } = usePreviewEngine({
    previewDebounceDelay,
    previewSeeds,
    nodes,
    edges,
    isPreviewVisible,
    isDragging: isDraggingOver
  });

  // Konami code Easter egg
  const [tetrisMode, setTetrisMode] = useState(false);
  useKonamiCode({
    onActivate: () => {
      setTetrisMode(true);
      showToast('success', '🎮 Tetris mode activated!');
    }
  });

  // Layout utilities
  const { neatenSelection, neatenAll, cleanupNodes, cleanupAll } = useAutoLayout();

  // Micro interactions
  const { addNodeWithBounce, highlightConnection } = useNodeInteractions();
  const { interactions, trigger } = useMicroInteractions();

  // Connection validation
  const { isValidConnection } = useConnectionValidation(nodes, edges, (error) => {
    showToast('error', error);
  });

  // UI State
  const [nodePaletteCollapsed, setNodePaletteCollapsed] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<any>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
  const [isPromptWizardOpen, setIsPromptWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingWizardNodes, setPendingWizardNodes] = useState<any>(null);
  const [saveAsPresetNodeId, setSaveAsPresetNodeId] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  // Enhanced nodes with edit handlers
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      type: node.type || 'textBlock',
      position: node.position || { x: 0, y: 0 },
      data: {
        ...node.data,
        onEdit: (newValue: string) => handleNodeEdit(node.id, newValue),
        onEditStart: () => {},
        onEditEnd: () => {},
        onContextMenu: (event: React.MouseEvent) => {
          setContextMenuPosition({ x: event.clientX, y: event.clientY });
          setContextMenuNodeId(node.id);
        }
      },
      selected: node.selected || node.id === selectedNodeId,
      width: node.width || undefined,
      height: node.height || undefined
    }));
  }, [nodes, selectedNodeId, handleNodeEdit]);

  // Notify parent of changes
  useEffect(() => {
    onNodesChangeProp?.(enhancedNodes);
  }, [enhancedNodes, onNodesChangeProp]);

  useEffect(() => {
    onEdgesChangeProp?.(edges);
  }, [edges, onEdgesChangeProp]);

  // Handle execute button
  const handleExecute = () => {
    onExecute?.(enhancedNodes, edges);
  };

  // React Flow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    console.log('React Flow initialized');
  }, []);

  // Wrapper for nodes change to support undo/redo
  const onNodesChange = useCallback((changes: any[]) => {
    onNodesChangeBase(changes);
  }, [onNodesChangeBase]);

  // Wrapper for edges change to support undo/redo
  const onEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeBase(changes);
  }, [onEdgesChangeBase]);

  const content = (
    <div className="epic1-graph-editor" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main horizontal container for side panel and canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Tabbed Side Panel with Asset Library */}
        {showAssetLibrary && (
        <TabbedSidePanel
          position={assetLibraryPosition}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          onPresetSelect={(preset: any) => {
            console.log('Preset selected:', preset);
          }}
          selectedNodeId={selectedNodeId}
          onNodeSelect={(nodeId) => console.log('Node selected from library:', nodeId)}
        />
      )}

      {/* Main Graph Canvas */}
      <div className="graph-canvas-container" style={{ flex: 1, position: 'relative' }}>
        <SafeReactFlowWrapper>
          <ReactFlow
            nodes={enhancedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            selectionMode={SelectionMode.Partial}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            deleteKeyCode={['Delete', 'Backspace']}
            multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
            panOnScroll
            panOnDrag={[1, 2]}
            zoomOnScroll
            zoomOnDoubleClick
            isValidConnection={isValidConnection}
          >
            <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable />
            
            {/* Additional UI Elements */}
            <Panel position="top-left">
              <NodePalette collapsed={nodePaletteCollapsed} />
            </Panel>
            
            <Panel position="top-right">
              <div className="panel-controls">
                <button onClick={handleExecute} className="execute-button">
                  Execute
                </button>
                <button onClick={togglePreview} className="preview-button">
                  {isPreviewVisible ? 'Hide' : 'Show'} Preview
                </button>
              </div>
            </Panel>

            <Panel position="bottom-left">
              <PanZoomControls />
            </Panel>

            <Panel position="bottom-right">
              <EdgeRoutingControls />
            </Panel>

            {/* Magnetic Snap Handler */}
            <MagneticSnapHandler nodes={nodes} edges={edges} />
            
            {/* Selection Feedback */}
            <SelectionFeedback nodes={nodes} edges={edges} />
            
            {/* Connection Feedback */}
            <ConnectionFeedback />
            
            {/* Micro Interactions */}
            {interactions.map((interaction) => (
              <MicroInteraction key={interaction.id} {...interaction} />
            ))}
          </ReactFlow>
        </SafeReactFlowWrapper>

        {/* Context Menus */}
        <GraphContextMenus
          contextMenuPosition={contextMenuPosition}
          contextMenuNodeId={contextMenuNodeId}
          setContextMenuPosition={setContextMenuPosition}
          setContextMenuNodeId={setContextMenuNodeId}
          nodes={nodes}
          edges={edges}
          onDuplicate={duplicateNodes}
          onDelete={deleteSelectedNodes}
          onSelectAll={selectAll}
          onCopy={() => copyToClipboard(true)}
          onPaste={pasteFromClipboard}
          onCreatePostIt={(position) => createNode('postItNote', position)}
          onGroupNodes={(nodes) => console.log('Group nodes:', nodes)}
          onUngroupNodes={(nodes) => console.log('Ungroup nodes:', nodes)}
          onSaveAsPreset={() => setSaveAsPresetNodeId(contextMenuNodeId)}
          reactFlowInstance={reactFlowInstance}
        />

        {/* Modals */}
        <GraphModals
          isPromptWizardOpen={isPromptWizardOpen}
          setIsPromptWizardOpen={setIsPromptWizardOpen}
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          saveAsPresetNodeId={saveAsPresetNodeId}
          setSaveAsPresetNodeId={setSaveAsPresetNodeId}
          pendingWizardNodes={pendingWizardNodes}
          setPendingWizardNodes={setPendingWizardNodes}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          customPresets={customPresets}
          setCustomPresets={setCustomPresets}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />

        {/* Keyboard Shortcuts Display */}
        <KeyboardShortcuts />

        {/* History Palette */}
        {historyVisible && <HistoryPalette />}

        {/* Connection Toast */}
        <ConnectionToast toasts={toasts} dismissToast={dismissToast} />
      </div>
    </div>

      {/* Preview Tray - Now properly at bottom of flex column */}
      {showPreview && (
        <PreviewTray
          results={previewResults}
          isExecuting={isPreviewExecuting}
          error={previewError}
          seeds={currentSeeds}
          onSeedsChange={updateSeeds}
          onExport={exportPreviewResults}
        />
      )}

      {/* Tetris Mode */}
      {tetrisMode && (
        <NodeTetris
          onExit={() => {
            setTetrisMode(false);
            showToast('info', 'Exited Tetris mode');
          }}
          onScoreUpdate={(score) => console.log('Tetris score:', score)}
        />
      )}
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <NeatenSettingsProvider>{content}</NeatenSettingsProvider>
    </DndProvider>
  );
};

// Export with providers
const Epic1GraphEditor: React.FC<Epic1GraphEditorProps> = (props) => {
  return (
    <IntelligenceProvider>
      <ReactFlowProvider>
        <Epic1GraphEditorClean {...props} />
      </ReactFlowProvider>
    </IntelligenceProvider>
  );
};

export default Epic1GraphEditor;
export { Epic1GraphEditor };