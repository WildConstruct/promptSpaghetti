import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Connection,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import hooks
import {
  useGraphState,
  useKeyboardHandlers,
  usePreviewEngine,
  useDragDropHandlers,
  useContextMenu,
} from './hooks';

// Import services
import { NodeFactory } from './services';

// Import components
import { epic1NodeTypes } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';
import { CustomMinimap } from './CustomMinimap';
import { ConnectionFeedback, useConnectionValidation } from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import { TabbedSidePanel } from './TabbedSidePanel';
import { NodeToolbar } from './NodeToolbar';
import { NodePalette } from './NodePalette';
import { NodeContextMenu } from './nodes/NodeContextMenu';
import { SaveAsPresetDialog } from './asset-library/SaveAsPresetDialog';
import { SafeReactFlowWrapper } from './SafeReactFlowWrapper';
import { edgeTypes } from './EdgeRenderingFix';
import { useNodeInteractions } from './interactions/NodeInteractionEnhancer';
import type { EditableNodeData } from './nodes';
import { PromptParser } from '../../runtime/nodes/epic1/PromptParser';

// Import styles
import './ReactFlowOverrides.css';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './PanZoomControls.css';

export interface Epic1GraphEditorProps {
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onExecute?: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
  showPreview?: boolean;
  previewPosition?: 'right' | 'bottom';
  previewWidth?: number | string;
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
}

/**
 * Refactored Epic 1 Graph Editor - now ~400 lines instead of 1100+
 * Uses extracted hooks and services for better maintainability
 */
const Epic1GraphEditorInner: React.FC<Epic1GraphEditorProps> = ({
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
  const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);
  const [nodePaletteCollapsed, setNodePaletteCollapsed] = useState(false);

  // Toast system
  const { toasts, showToast, dismissToast } = useToast();
  
  // Micro-interactions
  const { addNodeWithBounce, highlightConnection } = useNodeInteractions();
  // Use extracted hooks
  const {
    nodes,
    edges,
    activatedEdges,
    selectedNodeId,
    isDragging,
    setNodes,
    setEdges,
    setSelectedNodeId,
    setIsSelecting,
    onNodesChange,
    onEdgesChange,
    onConnect: baseOnConnect,
    handleNodeClick,
    handleEdgeClick,
    handlePaneClick,
  } = useGraphState({
    initialNodes,
    initialEdges,
    onNodesChangeProp,
    onEdgesChangeProp,
  });

  // Enhanced onConnect with toast
  const onConnect = useCallback(
    (params: Connection) => {
      baseOnConnect(params);
      if (params.source && params.target) {
        highlightConnection(params.source, params.target);
        showToast('success', 'Connection created!');
      }
    },
    [baseOnConnect, highlightConnection, showToast]
  );

  // Preview engine hook
  const { previewEngine } = usePreviewEngine({
    previewDebounceDelay,
    previewSeeds,
    nodes,
    edges,
    isPreviewVisible,
    isDragging,
  });

  // Keyboard handlers hook
  const handleTogglePreview = useCallback(() => {
    setIsPreviewVisible(prev => !prev);
    showToast('info', `Preview ${!isPreviewVisible ? 'shown' : 'hidden'}`);
  }, [isPreviewVisible, showToast]);

  const { keyboardHandlers } = useKeyboardHandlers({
    nodes,
    edges,
    setNodes,
    setEdges,
    showToast,
    onTogglePreview: handleTogglePreview,
  });

  // Drag & Drop handlers
  const { onDragOver, onDrop, insertPresetByMeta } = useDragDropHandlers({
    setNodes,
    setEdges,
    reactFlowInstance,
    showToast,
    addNodeWithBounce,
  });

  // Context menu hook
  const {
    contextMenuPosition,
    contextMenuNodeId,
    saveAsPresetNodeId,
    saveAsPresetNode,
    setSaveAsPresetNodeId,
    setContextMenuPosition,
    openContextMenu,
    closeContextMenu,
    handleSaveAsPreset,
    handleSavePreset,
  } = useContextMenu({ nodes, showToast });

  // Connection validation
  const { isValidConnection } = useConnectionValidation(nodes, edges, (error) => {
    showToast('error', error);
  });

  // Handle node data updates (from inline editing)
  const handleNodeEdit = useCallback((nodeId: string, newValue: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return NodeFactory.updateNodeData(node, {
            value: newValue,
            text: newValue,
            variableName: newValue,
            separator: newValue,
            label: newValue,
            options: node.type === 'weightedChoice' ? JSON.parse(newValue) : node.data.options,
          });
        }
        return node;
      })
    );
  }, [setNodes]);

  // Create node data with edit handlers
  const createNodeData = useCallback(
    (baseData: EditableNodeData | undefined, nodeId: string): EditableNodeData => {
      const safeData: EditableNodeData = {
        value: baseData?.value ?? '',
        nodeType: baseData?.nodeType ?? 'textBlock',
        ...baseData
      };

      return {
        ...safeData,
        onEdit: (newValue: string) => handleNodeEdit(nodeId, newValue),
        onEditStart: () => setSelectedNodeId(nodeId),
        onEditEnd: () => setSelectedNodeId(null),
        onContextMenu: (event: React.MouseEvent) => {
          event.preventDefault();
          openContextMenu(nodeId, { x: event.clientX, y: event.clientY });
        }
      };
    },
    [handleNodeEdit, setSelectedNodeId, openContextMenu]
  );

  // Enhanced nodes with edit handlers
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => {
      const nodeData = createNodeData(node.data, node.id);
      return {
        ...node,
        type: node.type || 'textBlock',
        position: node.position || { x: 0, y: 0 },
        data: nodeData,
        selected: node.selected || node.id === selectedNodeId,
        width: node.width || undefined,
        height: node.height || undefined,
      };
    });
  }, [nodes, selectedNodeId, createNodeData]);

  // Execute button handler
  const handleExecute = () => {
    onExecute?.(enhancedNodes, edges);
  };

  // Handle ReactFlow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    setTimeout(() => {
      instance.fitView({ 
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5
      });
    }, 100);
  }, []);

  // Listen for prompt paste events from tutorial
  useEffect(() => {
    const handlePromptPasted = async (event: CustomEvent<{ prompt?: string }>) => {
      const { prompt } = event.detail;
      if (!prompt) {
        return;
      }
      
      try {
        const parser = new PromptParser();
        const parsed = parser.parse(prompt);
        
        // Create nodes from parsed prompt
        const newNodes: Node<EditableNodeData>[] = [];
        const newEdges: Edge[] = [];
        let xPos = 100;
        let yPos = 100;
        let lastNodeId: string | null = null;
        
        parsed.segments.forEach((segment, index) => {
          const nodeId = `parsed-${Date.now()}-${index}`;
          
          if (segment.type === 'text') {
            newNodes.push(NodeFactory.createNode('textBlock', { x: xPos, y: yPos }, {
              text: segment.content,
              value: segment.content
            }));
          } else if (segment.type === 'choice') {
            const options = segment.options.map((opt, idx) => ({
              id: `option-${idx + 1}`,
              text: opt,
              weight: Math.floor(100 / segment.options.length)
            }));
            
            newNodes.push(NodeFactory.createNode('weightedChoice', { x: xPos, y: yPos }, {
              options,
              value: JSON.stringify(options, null, 2)
            }));
          }
          
          // Create edge from previous node
          if (lastNodeId) {
            newEdges.push({
              id: `edge-${lastNodeId}-${nodeId}`,
              source: lastNodeId,
              target: nodeId
            });
          }
          
          lastNodeId = nodeId;
          xPos += 250;
          if (xPos > 800) {
            xPos = 100;
            yPos += 150;
          }
        });
        
        // Add output node at the end
        const outputNode = NodeFactory.createNode('output', { x: 400, y: yPos + 150 });
        newNodes.push(outputNode);
        
        if (lastNodeId) {
          newEdges.push({
            id: `edge-${lastNodeId}-${outputNode.id}`,
            source: lastNodeId,
            target: outputNode.id
          });
        }
        
        setNodes(newNodes);
        setEdges(newEdges);
        
        if (reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 });
          }, 100);
        }
        
        showToast('success', 'Prompt parsed and nodes created!');
      } catch (error) {
        console.error('Failed to parse prompt:', error);
        showToast('error', 'Failed to parse prompt');
      }
    };
    
    window.addEventListener('epic1:promptPasted', handlePromptPasted as EventListener);
    return () => {
      window.removeEventListener('epic1:promptPasted', handlePromptPasted as EventListener);
    };
  }, [setNodes, setEdges, reactFlowInstance, showToast]);

  const editorStyle = useMemo(
    () => ({
      height: '100%',
      position: 'relative' as const
    }),
    []
  );

  const editorClassName = useMemo(
    () =>
      [
        'epic1-graph-editor',
        `preview-${previewPosition}`,
        `asset-${assetLibraryPosition}`
      ].join(' '),
    [assetLibraryPosition, previewPosition]
  );

  const normalisedPreviewSize =
    typeof previewWidth === 'number' ? `${previewWidth}px` : previewWidth;

  const previewPanelStyle = useMemo<React.CSSProperties>(() => {
    if (previewPosition === 'right') {
      return { width: normalisedPreviewSize };
    }

    return {
      width: '100%',
      maxHeight: normalisedPreviewSize
    };
  }, [normalisedPreviewSize, previewPosition]);

  return (
    <div
      className={editorClassName}
      style={editorStyle}
         onDrop={onDrop}
         onDragOver={onDragOver}>
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges.map(edge => ({
          ...edge,
          animated: activatedEdges.has(edge.id),
          className: `${activatedEdges.has(edge.id) ? 'activated' : ''} ${edge.selected ? 'selected' : ''}`.trim()
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => {
          closeContextMenu();
          handlePaneClick();
        }}
        onSelectionStart={() => setIsSelecting(true)}
        onSelectionEnd={() => setIsSelecting(false)}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#9ca3af', strokeWidth: 3 }
        }}
        fitView={true}
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.3,
          maxZoom: 2
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={[1]}
        selectionOnDrag={true}
        panActivationKeyCode="Space"
        selectionMode="partial"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={true}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode="Shift"
        nodeDragThreshold={5}
      >
        <Background variant="dots" gap={16} size={1} color="#333333" />
        <Controls />
        {nodes.length > 0 && (
          <CustomMinimap 
            nodes={nodes}
            edges={edges}
            style={{ 
              left: nodePaletteCollapsed ? 50 : 210,
              top: 70,
              width: '200px',
              height: '120px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 1000,
              transition: 'left 0.3s ease-in-out'
            }}
          />
        )}
        
        <Panel position="top-right">
          <div className="epic1-controls">
            <button 
              className="epic1-preview-toggle"
              onClick={handleTogglePreview}
              title="Toggle preview (P)"
            >
              {isPreviewVisible ? '👁️' : '👁️‍🗨️'}
            </button>
            {onExecute && (
              <button 
                className="epic1-execute-button"
                onClick={handleExecute}
              >
                Execute Graph
              </button>
            )}
          </div>
        </Panel>

        <Panel position="bottom-center">
          <div className="epic1-instructions">
            Click any node to edit • Tab/Shift+Tab to navigate • Enter to confirm • Escape to cancel • Press P for preview • Press ? for help
          </div>
        </Panel>

        <ConnectionFeedback nodes={nodes} edges={edges} />
        
        <SafeReactFlowWrapper>
          <PanZoomControls position="bottom-right" />
        </SafeReactFlowWrapper>
      </ReactFlow>

      <SafeReactFlowWrapper>
        <KeyboardShortcuts {...keyboardHandlers} />
      </SafeReactFlowWrapper>

      {toasts.map((toast) => (
        <ConnectionToast
          key={toast.id}
          message={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
      
      <NodePalette
        position={assetLibraryPosition}
        defaultCollapsed={false} 
        onCollapsedChange={setNodePaletteCollapsed}
      />
      
      <NodeToolbar position="top" />
      
      {(showPreview || showAssetLibrary) && (
        <div
          className={`tabbed-side-panel-wrapper preview-${previewPosition}`}
          style={previewPanelStyle}
        >
          <TabbedSidePanel
            previewEngine={previewEngine}
            onInsert={(preset) => {
              const pos = reactFlowInstance
                ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
                : { x: 250, y: 250 };
              void insertPresetByMeta(preset, pos);
            }}
            position="right"
            defaultTab={showAssetLibrary ? 'assets' : isPreviewVisible ? 'preview' : null}
            showAssets={showAssetLibrary}
            showPreview={showPreview}
          />
        </div>
      )}
      
      <NodeContextMenu
        nodeId={contextMenuNodeId || ''}
        nodeType={nodes.find(n => n.id === contextMenuNodeId)?.type || 'textBlock'}
        position={contextMenuPosition}
        onClose={() => setContextMenuPosition(null)}
        onSaveAsPreset={handleSaveAsPreset}
      />
      
      <SaveAsPresetDialog
        isOpen={!!saveAsPresetNodeId}
        nodeData={saveAsPresetNode?.data || null}
        nodeType={saveAsPresetNode?.type || 'textBlock'}
        onClose={() => setSaveAsPresetNodeId(null)}
        onSave={handleSavePreset}
      />
    </div>
  );
};

// Export the main component
export const Epic1GraphEditorRefactored: React.FC<Epic1GraphEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DndProvider backend={HTML5Backend}>
        <Epic1GraphEditorInner {...props} />
      </DndProvider>
    </ReactFlowProvider>
  );
};

// Also export with provider for compatibility
export const Epic1GraphEditorWithProvider = Epic1GraphEditorRefactored;
