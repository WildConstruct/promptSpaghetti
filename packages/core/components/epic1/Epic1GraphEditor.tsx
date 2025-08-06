import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Edge,
  Node,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';
import { CustomMinimap } from './CustomMinimap';
import { ConnectionFeedback, useConnectionValidation } from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import { PreviewEngine } from './preview/PreviewEngine';
import { PreviewPanel } from './preview/PreviewPanel';
import { Epic1Graph } from '../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { nodeDataToRuntimeNode } from './nodes/nodeFactory';
import { AssetLibrary, Preset } from './asset-library';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import { SaveAsPresetDialog } from './asset-library/SaveAsPresetDialog';
import { TabbedSidePanel } from './TabbedSidePanel';
import { NodeToolbar } from './NodeToolbar';
import { NodePalette } from './NodePalette';
import { NodeContextMenu, ContextMenuPosition } from './nodes/NodeContextMenu';
import { MagneticSnapHandler } from './interactions/MagneticSnapHandler';
import { SelectionFeedback, useNodeInteractions } from './interactions/NodeInteractionEnhancer';
import { MicroInteraction, useMicroInteractions } from './animations/MicroInteractions';
import { SafeReactFlowWrapper } from './SafeReactFlowWrapper';
import { edgeTypes } from './EdgeRenderingFix';
import './ReactFlowOverrides.css'; // Import first to ensure overrides work
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
 * Epic 1 Graph Editor with inline editing capabilities
 */
// Inner component with drag and drop support
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
  // Use droppable node types if asset library is shown
  const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;
  
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<EditableNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(initialEdges);
  const [activatedEdges, setActivatedEdges] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom node change handler to optimize performance during dragging
  const onNodesChange = useCallback((changes: any[]) => {
    // Check if we're dragging
    const hasDraggingChange = changes.some(change => 
      change.type === 'position' && change.dragging === true
    );
    const hasStoppedDragging = changes.some(change => 
      change.type === 'position' && change.dragging === false
    );
    
    if (hasDraggingChange) {
      setIsDragging(true);
    }
    if (hasStoppedDragging) {
      setIsDragging(false);
    }
    
    // Always apply changes for smooth interaction
    onNodesChangeBase(changes);
  }, [onNodesChangeBase]);
  
  // Custom edges change handler to ensure proper selection behavior
  const onEdgesChange = useCallback((changes: any[]) => {
    // Apply the changes using the base handler
    onEdgesChangeBase(changes);
  }, [onEdgesChangeBase]);
  
  // Debug: Log nodes and edges whenever they change
  useEffect(() => {
    // Removed console.log statements that fire on every state change
    // These were causing performance issues during mouse movement/dragging
    
    // Check for duplicate IDs
    const ids = nodes.map(n => n.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.warn('[Epic1GraphEditor] DUPLICATE NODE IDS FOUND:', duplicates);
    }
  }, [nodes, edges]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodePaletteCollapsed, setNodePaletteCollapsed] = useState(false);
  
  // Context menu and save-as-preset state
  const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition | null>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
  const [saveAsPresetNodeId, setSaveAsPresetNodeId] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  
  // Toast system for error messages
  const { toasts, showToast, dismissToast } = useToast();
  
  // Micro-interactions and node interactions
  const { addNodeWithBounce, highlightConnection } = useNodeInteractions();
  const { interactions, trigger } = useMicroInteractions();

  // Preview engine
  const previewEngineRef = useRef<PreviewEngine | null>(null);
  if (!previewEngineRef.current) {
    previewEngineRef.current = new PreviewEngine({
      debounceDelay: previewDebounceDelay,
      seeds: previewSeeds,
      enableCache: true,
      cacheMaxSize: 100,
      cacheMaxAgeMinutes: 30,
      enableWebWorker: true,
      workerPoolSize: 4
    });
  }

  // Handle node data updates (from inline editing)
  const handleNodeEdit = useCallback((nodeId: string, newValue: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              value: newValue,
              text: newValue, // For TextBlock nodes
              variableName: newValue, // For Variable nodes
              separator: newValue, // For Concat nodes
              label: newValue, // For Output nodes
              // For WeightedChoice nodes, parse the JSON
              options: node.type === 'weightedChoice' ? JSON.parse(newValue) : node.data.options,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Create node data with edit handlers
  const createNodeData = useCallback((baseData: any, nodeId: string) => {
    return {
      ...baseData,
      onEdit: (newValue: string) => handleNodeEdit(nodeId, newValue),
      onEditStart: () => setSelectedNodeId(nodeId),
      onEditEnd: () => setSelectedNodeId(null),
      onContextMenu: (event: React.MouseEvent) => {
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setContextMenuNodeId(nodeId);
      },
    };
  }, [handleNodeEdit]);

  // Update nodes when selected
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => {
      const nodeData = createNodeData(node.data, node.id);
      
      return {
        ...node,
        type: node.type || 'textBlock', // Ensure type is always defined
        position: node.position || { x: 0, y: 0 }, // Ensure position is always defined
        data: nodeData,
        // Preserve the original selected state from nodes, don't override
        selected: node.selected || node.id === selectedNodeId,
        // Ensure dimensions are set
        width: node.width || undefined,
        height: node.height || undefined,
      };
    });
  }, [nodes, selectedNodeId, createNodeData]);

  // Handle new connections with replacement for single input nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        // Check if target already has an incoming connection (single input constraint)
        const existingIncomingEdge = eds.find(e => e.target === params.target && e.targetHandle === params.targetHandle);
        
        let newEdges = eds;
        if (existingIncomingEdge) {
          // Replace the existing incoming connection
          newEdges = eds.filter(e => e.id !== existingIncomingEdge.id);
        }
        
        // Add the new edge
        const edgeParams = {
          ...params,
          id: `${params.source || 'unknown'}-${params.target || 'unknown'}-${Date.now()}`,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#9ca3af', strokeWidth: 3 }
        };
        newEdges = addEdge(edgeParams, newEdges);
        return newEdges;
      });
      
      // Highlight the new connection
      if (params.source && params.target) {
        highlightConnection(params.source, params.target);
        showToast('success', 'Connection created!');
      }
    },
    [setEdges, highlightConnection, showToast]
  );

  // Use connection validation hook with error handling
  const { isValidConnection } = useConnectionValidation(nodes, edges, (error) => {
    showToast('error', error);
  });

  // Convert React Flow graph to runtime graph format
  const convertToRuntimeGraph = useCallback((flowNodes: Node<EditableNodeData>[], flowEdges: Edge[]): Epic1Graph | null => {
    try {
      const runtimeNodes = new Map();
      
      for (const node of flowNodes) {
        // Skip nodes without proper type or position
        if (!node.type || !node.position) {
          console.warn('Skipping invalid node:', node.id, 'type:', node.type, 'position:', node.position);
          continue;
        }
        const runtimeNode = nodeDataToRuntimeNode(node);
        if (runtimeNode) {
          runtimeNodes.set(node.id, runtimeNode);
        }
      }

      return {
        nodes: runtimeNodes,
        edges: flowEdges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };
    } catch (error) {
      console.error('Error converting to runtime graph:', error);
      return null;
    }
  }, []);

  // Update preview when graph changes (but not during dragging)
  useEffect(() => {
    if (!isPreviewVisible || !previewEngineRef.current || isDragging) return;

    const runtimeGraph = convertToRuntimeGraph(enhancedNodes, edges);
    if (runtimeGraph) {
      // Removed console.log that was causing performance issues
      previewEngineRef.current.updatePreview(runtimeGraph, enhancedNodes, edges);
    }
  }, [enhancedNodes, edges, isPreviewVisible, convertToRuntimeGraph, isDragging]);

  // Notify parent of changes
  React.useEffect(() => {
    onNodesChangeProp?.(enhancedNodes);
  }, [enhancedNodes, onNodesChangeProp]);

  React.useEffect(() => {
    onEdgesChangeProp?.(edges);
  }, [edges, onEdgesChangeProp]);

  // Execute button handler
  const handleExecute = () => {
    onExecute?.(enhancedNodes, edges);
  };

  // Keyboard shortcut handlers
  const handleSave = useCallback(() => {
    // Save current graph state
    const graphData = { nodes: enhancedNodes, edges };
    localStorage.setItem('epic1-graph', JSON.stringify(graphData));
    showToast('success', 'Graph saved!');
  }, [enhancedNodes, edges, showToast]);

  const handleLoad = useCallback(() => {
    // Load graph from localStorage
    const saved = localStorage.getItem('epic1-graph');
    if (saved) {
      const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(saved);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      showToast('success', 'Graph loaded!');
    } else {
      showToast('info', 'No saved graph found');
    }
  }, [setNodes, setEdges, showToast]);

  const handleExport = useCallback(() => {
    // Export graph as JSON
    const graphData = { nodes: enhancedNodes, edges };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Graph exported!');
  }, [enhancedNodes, edges, showToast]);

  const handleDelete = useCallback((nodesToDelete?: Node[]) => {
    // If no nodes provided, get selected nodes
    const targetNodes = nodesToDelete || nodes.filter(n => n.selected);
    
    if (targetNodes.length === 0) {
      return;
    }
    
    const nodeIds = targetNodes.map(n => n.id);
    setNodes((nds) => nds.filter(n => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
    showToast('info', `Deleted ${nodeIds.length} node(s)`);
  }, [nodes, setNodes, setEdges, showToast]);

  const handleDuplicate = useCallback((nodesToDuplicate: Node[]) => {
    const newNodes = nodesToDuplicate.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }));
    setNodes((nds) => [...nds, ...newNodes]);
    showToast('success', `Duplicated ${newNodes.length} node(s)`);
  }, [setNodes, showToast]);

  const handleSelectAll = useCallback(() => {
    setNodes((nds) => nds.map(n => ({ ...n, selected: true })));
  }, [setNodes]);

  // Handle canvas click to deselect all nodes and edges
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Only deselect if we're not in the middle of a selection drag
    if (!isSelecting) {
      // Removed console.log that was causing performance issues
      setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
      setEdges((eds) => eds.map(e => ({ ...e, selected: false })));
      setSelectedNodeId(null);
      setActivatedEdges(new Set());
    }
  }, [setNodes, setEdges, isSelecting]);
  
  // Handle node click to select it
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    
    if (event.shiftKey) {
      // Multi-select with shift key
      setNodes((nds) => nds.map(n => {
        if (n.id === node.id) {
          return { ...n, selected: !n.selected }; // Toggle selection
        }
        return n; // Keep other selections
      }));
    } else {
      // Single select without shift
      setNodes((nds) => nds.map(n => ({ 
        ...n, 
        selected: n.id === node.id 
      })));
      setSelectedNodeId(node.id);
    }
  }, [setNodes]);
  
  // Handle edge click to select and activate/deactivate
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation(); // Prevent the pane click handler
    
    if (!event.shiftKey) {
      // Single selection - clear other selections first
      setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
    }
    
    // Toggle edge selection
    setEdges((eds) => {
      const updatedEdges = eds.map(e => {
        if (e.id === edge.id) {
          const newSelected = !e.selected;
          return { ...e, selected: newSelected };
        }
        // Keep other selections if shift is held
        return event.shiftKey ? e : { ...e, selected: false };
      });
      return updatedEdges;
    });
    
    // Toggle activation
    setActivatedEdges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(edge.id)) {
        newSet.delete(edge.id);
        showToast('info', 'Edge deactivated');
      } else {
        newSet.add(edge.id);
        showToast('success', 'Edge activated!');
      }
      return newSet;
    });
  }, [setEdges, setNodes, showToast]);

  // Toggle preview panel
  const handleTogglePreview = useCallback(() => {
    setIsPreviewVisible(prev => !prev);
    showToast('info', `Preview ${!isPreviewVisible ? 'shown' : 'hidden'}`);
  }, [isPreviewVisible, showToast]);

  // Handle seed changes from preview panel
  const handlePreviewSeedChange = useCallback((seeds: (string | number)[]) => {
    if (previewEngineRef.current) {
      // Seeds are already updated in the preview engine by the panel
      // Just trigger a new execution with the updated seeds
      const runtimeGraph = convertToRuntimeGraph(enhancedNodes, edges);
      if (runtimeGraph) {
        previewEngineRef.current.updatePreview(runtimeGraph, enhancedNodes, edges);
      }
    }
  }, [enhancedNodes, edges, convertToRuntimeGraph]);

  // Cleanup preview engine on unmount
  useEffect(() => {
    return () => {
      previewEngineRef.current?.dispose();
    };
  }, []);
  
  
  // Add direct keyboard handler for delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if delete or backspace was pressed
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Check if we're not in an input field
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        
        event.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          handleDelete(selectedNodes);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, handleDelete]);
  
  // Listen for prompt paste events from tutorial
  useEffect(() => {
    const handlePromptPasted = async (event: CustomEvent) => {
      const { prompt } = event.detail;
      if (!prompt) return;
      
      try {
        // Import the prompt parser
        const { PromptParser } = await import('../../runtime/nodes/epic1/PromptParser');
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
            newNodes.push({
              id: nodeId,
              type: 'textBlock',
              position: { x: xPos, y: yPos },
              data: {
                nodeType: 'textBlock',
                text: segment.content,
                value: segment.content
              }
            });
          } else if (segment.type === 'choice') {
            const options = segment.options.map(opt => ({
              text: opt,
              weight: Math.floor(100 / segment.options.length)
            }));
            
            newNodes.push({
              id: nodeId,
              type: 'weightedChoice',
              position: { x: xPos, y: yPos },
              data: {
                nodeType: 'weightedChoice',
                options,
                value: JSON.stringify(options, null, 2)
              }
            });
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
        const outputId = `output-${Date.now()}`;
        newNodes.push({
          id: outputId,
          type: 'output',
          position: { x: 400, y: yPos + 150 },
          data: {
            nodeType: 'output',
            label: 'output',
            value: 'output'
          }
        });
        
        if (lastNodeId) {
          newEdges.push({
            id: `edge-${lastNodeId}-${outputId}`,
            source: lastNodeId,
            target: outputId
          });
        }
        
        // Set the new nodes and edges
        setNodes(newNodes);
        setEdges(newEdges);
        
        // Fit view to show all nodes
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

  const editorStyle = useMemo(() => {
    // Simple full height container - tabbed panel handles its own positioning
    return {
      height: '100%',
      position: 'relative' as const
    };
  }, []);

  // Create unique ID for new nodes
  const createNodeId = useCallback(() => {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Handle ReactFlow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Fit view to show all nodes properly positioned at frame edges
    setTimeout(() => {
      instance.fitView({ 
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5
      });
      setReactFlowInstance(instance);
    }, 100);
  }, []);

  // Handle node drop from toolbar
  const handleNodeDrop = useCallback((nodeType: string, position: { x: number; y: number }) => {
    // Ensure position has valid x and y values
    const validPosition = {
      x: typeof position?.x === 'number' ? position.x : 250,
      y: typeof position?.y === 'number' ? position.y : 250
    };
    
    const newNode: Node<EditableNodeData> = {
      id: createNodeId(),
      type: nodeType || 'textBlock', // Ensure type is never undefined
      position: validPosition,
      data: {
        nodeType: nodeType, // CRITICAL: This is required for the runtime to identify the node type
        // Default data based on node type - set both value AND the specific properties expected by nodeFactory
        ...(nodeType === 'textBlock' && { 
          value: 'New text block',
          text: 'New text block' 
        }),
        ...(nodeType === 'weightedChoice' && { 
          value: JSON.stringify([
            { text: 'Option 1', weight: 1 },
            { text: 'Option 2', weight: 1 }
          ], null, 2),
          options: [
            { text: 'Option 1', weight: 1 },
            { text: 'Option 2', weight: 1 }
          ]
        }),
        ...(nodeType === 'concat' && { 
          value: ' ',
          separator: ' ' 
        }),
        ...((nodeType === 'variable' || nodeType === 'setVariable' || nodeType === 'getVariable') && { 
          value: 'myVariable',
          variableName: 'myVariable',
          mode: nodeType === 'setVariable' ? 'set' : (nodeType === 'getVariable' ? 'get' : 'both')
        }),
        ...(nodeType === 'output' && { 
          value: 'output',
          label: 'output' 
        }),
      },
    };

    setNodes((nds) => nds.concat(newNode));
    
    // Add bounce effect - pass the whole node, not just ID
    try {
      if (addNodeWithBounce) {
        addNodeWithBounce(newNode);
      }
    } catch (bounceError) {
      console.warn('Bounce animation failed:', bounceError);
    }
    
    // Show success toast
    showToast('success', `Added ${nodeType} node`);
  }, [createNodeId, setNodes, addNodeWithBounce, showToast]);

  // Context menu handlers
  const handleSaveAsPreset = useCallback(() => {
    if (contextMenuNodeId) {
      setSaveAsPresetNodeId(contextMenuNodeId);
      setContextMenuPosition(null);
    }
  }, [contextMenuNodeId]);

  const handleSavePreset = useCallback((preset: Preset) => {
    // Add to custom presets
    setCustomPresets(prev => [...prev, preset]);
    
    // Show success toast
    showToast('Preset saved successfully!', 'success');
    
    // Clear save dialog
    setSaveAsPresetNodeId(null);
  }, [showToast]);

  // Get node data for save-as-preset dialog
  const saveAsPresetNode = useMemo(() => {
    if (!saveAsPresetNodeId) return null;
    const node = nodes.find(n => n.id === saveAsPresetNodeId);
    return node ? { data: node.data, type: node.type || 'textBlock' } : null;
  }, [saveAsPresetNodeId, nodes]);

  // Handle drag over for new nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    // Don't log on every dragover to avoid spam
  }, []);

  // Handle drop for new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Try multiple data types for compatibility
      let nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('application/node-type');
      }
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('text/plain');
      }
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('text');
      }
      
      if (!nodeType) {
        console.error('Drop failed: no nodeType found in any data transfer format');
        return;
      }

      // Calculate position using the new screenToFlowPosition API
      let position;
      if (reactFlowInstance) {
        // Use the new non-deprecated method
        position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
      } else {
        // Fallback to a default position if instance not ready
        position = {
          x: 250,
          y: 250
        };
        console.warn('ReactFlow instance not ready, using default position');
      }

      handleNodeDrop(nodeType, position);
    },
    [reactFlowInstance, handleNodeDrop]
  );

  // Wrap with DndProvider if using droppable nodes
  const content = (
    <div className="epic1-graph-editor" style={editorStyle}
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
            onPaneClick={handlePaneClick}
            onSelectionStart={() => setIsSelecting(true)}
            onSelectionEnd={() => {
              setIsSelecting(false);
              // The selection has already updated the nodes/edges
            }}
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
            panOnDrag={[1, 2]}
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
          
          {/* Epic 1 specific controls */}
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

          {/* Instructions panel */}
          <Panel position="bottom-center">
            <div className="epic1-instructions">
              Click any node to edit • Tab/Shift+Tab to navigate • Enter to confirm • Escape to cancel • Press P for preview • Press ? for help
            </div>
          </Panel>

          {/* Connection validation feedback */}
          <ConnectionFeedback nodes={nodes} edges={edges} />
          
          {/* Pan/Zoom controls */}
          <SafeReactFlowWrapper>
            <PanZoomControls position="bottom-right" />
          </SafeReactFlowWrapper>
        </ReactFlow>

        {/* Keyboard shortcuts handler */}
        <SafeReactFlowWrapper>
          <KeyboardShortcuts
            onSave={handleSave}
            onLoad={handleLoad}
            onExport={handleExport}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onSelectAll={handleSelectAll}
            additionalHandlers={{
              'p': handleTogglePreview,
              'P': handleTogglePreview
            }}
          />
        </SafeReactFlowWrapper>

        {/* Toast notifications */}
        {toasts.map((toast) => (
          <ConnectionToast
            key={toast.id}
            message={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      
      {/* Node Palette for creating new nodes */}
      <NodePalette 
        position="left" 
        defaultCollapsed={false} 
        onCollapsedChange={setNodePaletteCollapsed}
      />
      
      {/* Node Toolbar */}
      <NodeToolbar position="top" />
      
      {/* Tabbed Side Panel - combines Preview and Asset Browser */}
      <TabbedSidePanel
          previewEngine={previewEngineRef.current}
          onPresetDrag={(preset) => {
            // TODO: Implement preset application to nodes
          }}
          onPresetSelect={(preset) => {
            // TODO: Implement preset selection
          }}
          position="right"
          defaultTab={isPreviewVisible ? 'preview' : null}
        />
      
      {/* Context Menu */}
      <NodeContextMenu
        nodeId={contextMenuNodeId || ''}
        nodeType={nodes.find(n => n.id === contextMenuNodeId)?.type || 'textBlock'}
        position={contextMenuPosition}
        onClose={() => setContextMenuPosition(null)}
        onSaveAsPreset={handleSaveAsPreset}
      />
      
      {/* Save As Preset Dialog */}
      <SaveAsPresetDialog
        isOpen={!!saveAsPresetNodeId}
        nodeData={saveAsPresetNode?.data || null}
        nodeType={saveAsPresetNode?.type || 'textBlock'}
        onClose={() => setSaveAsPresetNodeId(null)}
        onSave={handleSavePreset}
      />
    </div>
  );
  
  // Always wrap with DndProvider since TabbedSidePanel includes asset browser that uses drag-and-drop
  // The asset browser tab can be clicked regardless of showAssetLibrary prop
  return <DndProvider backend={HTML5Backend}>{content}</DndProvider>;
};

// Export the main component
export const Epic1GraphEditor: React.FC<Epic1GraphEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Epic1GraphEditorInner {...props} />
    </ReactFlowProvider>
  );
};

// Also export with provider for compatibility
export const Epic1GraphEditorWithProvider = Epic1GraphEditor;