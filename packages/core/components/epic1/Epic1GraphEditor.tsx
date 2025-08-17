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
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';
import { ConnectionFeedback, useConnectionValidation } from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import { EdgeRoutingControls } from './EdgeRoutingControls';
import { PreviewEngine } from './preview/PreviewEngine';
import { PreviewPanel } from './preview/PreviewPanel';
import { PreviewTray } from '../PreviewTray/PreviewTray';
import { Epic1Graph } from '../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { nodeDataToRuntimeNode } from './nodes/nodeFactory';
import { AssetLibrary, Preset } from './asset-library';
import { SaveAsPresetDialog } from './asset-library/SaveAsPresetDialog';
import { TabbedSidePanel } from './TabbedSidePanel';
import { NodeToolbar } from './NodeToolbar';
import { NodePalette } from './NodePalette';
import { NodeContextMenu, ContextMenuPosition } from './nodes/NodeContextMenu';
import { CanvasContextMenu } from './nodes/CanvasContextMenu';
import { MagneticSnapHandler } from './interactions/MagneticSnapHandler';
import { SelectionFeedback, useNodeInteractions } from './interactions/NodeInteractionEnhancer';
import { MicroInteraction, useMicroInteractions } from './animations/MicroInteractions';
import { SafeReactFlowWrapper } from './SafeReactFlowWrapper';
import { edgeTypes } from './EdgeRenderingFix';
import { AuthModal } from '../auth/AuthModal';
import { supabase } from '../../utils/supabaseClient';
import { useAutoLayout } from './hooks/useAutoLayout';
import { usePreviewTrayLayout } from './hooks/usePreviewTrayLayout';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import './ReactFlowOverrides.css'; // Import first to ensure overrides work
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './nodes/EnhancedBoundingBox.css';
import './PanZoomControls.css';
import { insertPreset, validatePreset } from '../../runtime/presetInsertion';
import { 
  isStorageAvailable, 
  persistenceStorage, 
  STORAGE_KEY,
  clearPersistedState 
} from '../../utils/persistenceUtils';

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

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
  
  // Use preview tray layout hook to push content up
  usePreviewTrayLayout(showPreview);
  
  // Load persisted state on mount
  const loadPersistedState = useCallback(() => {
    if (!isStorageAvailable()) return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const wrapper = JSON.parse(stored);
        const decompressed = wrapper.compressed 
          ? JSON.parse(wrapper.state) // Would need lz-string decompress in real impl
          : JSON.parse(wrapper.state);
        
        if (decompressed.nodes && decompressed.edges) {
          console.log('Restored graph from local storage');
          return decompressed;
        }
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
    return null;
  }, []);

  // Initialize with persisted state or initial props
  const persistedState = useMemo(() => loadPersistedState(), []);
  const [hasRestoredState] = useState(() => !!persistedState);
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<EditableNodeData>(
    persistedState?.nodes || initialNodes
  );
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(
    persistedState?.edges || initialEdges
  );
  const [activatedEdges, setActivatedEdges] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Autosave to local storage (includes post-it notes)
  const saveToLocalStorage = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (!isStorageAvailable()) return;
    
    try {
      const state = {
        nodes: currentNodes, // This includes post-it notes since they're just another node type
        edges: currentEdges,
        lastModified: new Date().toISOString()
      };
      
      const stateString = JSON.stringify(state);
      const wrapper = {
        state: stateString,
        version: 1,
        timestamp: Date.now(),
        compressed: false,
        size: new Blob([stateString]).size
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
      console.log('Graph saved to local storage (including post-it notes)');
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }, []);
  
  // Debounced autosave
  const debouncedSave = useMemo(
    () => debounce((nodes: Node[], edges: Edge[]) => {
      saveToLocalStorage(nodes, edges);
    }, 2000), // Save after 2 seconds of inactivity
    [saveToLocalStorage]
  );
  
  // Trigger autosave on changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      debouncedSave(nodes, edges);
    }
  }, [nodes, edges, debouncedSave]);
  
  // This useEffect is moved after useToast hook definition
  
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
      
      // Handle locked bounding boxes - move contained nodes with the box
      const boxDragChanges = changes.filter(change => 
        change.type === 'position' && 
        change.dragging && 
        nodes.find(n => n.id === change.id && n.type === 'boundingBox' && n.data.locked)
      );
      
      if (boxDragChanges.length > 0) {
        // For each locked box being dragged, move its contained nodes
        const additionalChanges: any[] = [];
        
        boxDragChanges.forEach(boxChange => {
          const box = nodes.find(n => n.id === boxChange.id);
          if (!box || !box.data.locked) return;
          
          // Find nodes contained in this box
          const containedNodeIds = nodes.filter(node => {
            if (node.id === box.id || node.type === 'boundingBox' || node.type === 'enhancedBoundingBox' || node.type === 'postItNote') return false;
            
            const nodeX = node.position.x;
            const nodeY = node.position.y;
            const nodeWidth = node.width || 150;
            const nodeHeight = node.height || 50;
            
            const boxX = box.position.x;
            const boxY = box.position.y;
            const boxWidth = box.data.width || 400;
            const boxHeight = box.data.height || 300;
            
            return (
              nodeX >= boxX &&
              nodeY >= boxY &&
              nodeX + nodeWidth <= boxX + boxWidth &&
              nodeY + nodeHeight <= boxY + boxHeight
            );
          }).map(n => n.id);
          
          // Calculate delta
          const deltaX = boxChange.position.x - box.position.x;
          const deltaY = boxChange.position.y - box.position.y;
          
          // Add position changes for contained nodes
          containedNodeIds.forEach(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
              additionalChanges.push({
                id: nodeId,
                type: 'position',
                position: {
                  x: node.position.x + deltaX,
                  y: node.position.y + deltaY
                }
              });
            }
          });
        });
        
        // Combine original changes with additional changes for contained nodes
        changes = [...changes, ...additionalChanges];
      }
    }
    
    if (hasStoppedDragging) {
      setIsDragging(false);
    }
    
    // Always apply changes for smooth interaction
    onNodesChangeBase(changes);
  }, [onNodesChangeBase, nodes]);
  
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
  const [isPromptWizardOpen, setIsPromptWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingWizardNodes, setPendingWizardNodes] = useState<{nodes: Node<EditableNodeData>[], edges: Edge[]} | null>(null);
  
  // State for preview tray
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [isPreviewExecuting, setIsPreviewExecuting] = useState(false);
  const [previewError, setPreviewError] = useState<Error | undefined>();
  const [currentSeeds, setCurrentSeeds] = useState<number[]>(
    previewSeeds as number[] || [3141, 5926, 5358, 9793]
  );
  
  // Toast system for error messages (moved before useEffects that use it)
  const { toasts, showToast, dismissToast } = useToast();
  
  // Auto-layout functionality
  const { cleanupNodes, cleanupAll } = useAutoLayout();
  
  // Handle layout cleanup
  const handleLayoutCleanup = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length > 0) {
      cleanupNodes(selectedNodes);
      showToast('success', `Cleaned up layout for ${selectedNodes.length} selected nodes`);
    } else {
      cleanupAll();
      showToast('success', 'Cleaned up layout for all nodes');
    }
  }, [nodes, cleanupNodes, cleanupAll, showToast]);
  
  // Check for current user on mount
  useEffect(() => {
    const checkUser = async () => {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      }
    };
    
    checkUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    }) || { data: { subscription: null } };
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  // Show toast when state is restored (only once on mount)
  useEffect(() => {
    if (hasRestoredState) {
      showToast('success', 'Graph restored from local storage');
    }
  }, []); // Empty deps - only run once on mount
  
  // Micro-interactions and node interactions
  const { addNodeWithBounce, highlightConnection } = useNodeInteractions();
  const { interactions, trigger } = useMicroInteractions();

  // Preview engine
  const previewEngineRef = useRef<PreviewEngine | null>(null);
  if (!previewEngineRef.current) {
    previewEngineRef.current = new PreviewEngine({
      debounceDelay: previewDebounceDelay,
      seeds: currentSeeds,
      enableCache: true,
      cacheMaxSize: 100,
      cacheMaxAgeMinutes: 30,
      enableWebWorker: true,
      workerPoolSize: 4
    });
  }
  
  // Update seeds when they change
  useEffect(() => {
    if (previewEngineRef.current) {
      previewEngineRef.current.updateSeeds(currentSeeds);
    }
  }, [currentSeeds]);
  
  // Subscribe to preview engine updates
  useEffect(() => {
    if (!previewEngineRef.current) return;
    
    const unsubscribe = previewEngineRef.current.subscribe((update) => {
      console.log('[Preview] Engine update received:', update);
      setIsPreviewExecuting(update.state === 'executing' || update.state === 'pending');
      if (update.results) {
        console.log('[Preview] Got results:', update.results);
        console.log('[Preview] Result details:');
        update.results.forEach((r, i) => {
          console.log(`  Result ${i}: seed=${r.seed}, output="${r.output}", type=${typeof r.output}, length=${r.output?.length || 0}`);
        });
        const mappedResults = update.results.map(r => ({
          seed: r.seed,
          result: r.output
        }));
        console.log('[Preview] Mapped results:', mappedResults);
        setPreviewResults(mappedResults);
      }
      if (update.error) {
        console.error('[Preview] Got error:', update.error);
        setPreviewError(update.error);
      } else {
        setPreviewError(undefined);
      }
    });
    
    return unsubscribe;
  }, []);

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
  
  // Manage attachment edges for post-it notes
  useEffect(() => {
    const attachmentEdges: Edge[] = [];
    
    // Find all post-it notes with attachments
    nodes.forEach((node) => {
      if (node.type === 'postItNote' && node.data.attachedTo) {
        const attachedToNode = nodes.find(n => n.id === node.data.attachedTo);
        if (attachedToNode) {
          // Create an attachment edge
          attachmentEdges.push({
            id: `attachment-${node.id}`,
            source: node.data.attachedTo,
            target: node.id,
            type: 'attachment',
            animated: false,
            style: {
              stroke: '#999',
              strokeWidth: 2,
            }
          });
        }
      }
    });
    
    // Update edges to include attachment edges
    setEdges((eds) => {
      // Remove old attachment edges
      const nonAttachmentEdges = eds.filter(e => !e.id.startsWith('attachment-'));
      // Add new attachment edges
      return [...nonAttachmentEdges, ...attachmentEdges];
    });
  }, [nodes, setEdges]);

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
    console.log('[Preview] Auto-update check:', {
      isPreviewVisible,
      hasEngine: !!previewEngineRef.current,
      isDragging,
      nodeCount: enhancedNodes.length,
      edgeCount: edges.length
    });
    
    if (!isPreviewVisible || !previewEngineRef.current || isDragging) return;

    const runtimeGraph = convertToRuntimeGraph(enhancedNodes, edges);
    console.log('[Preview] Auto-update runtime graph:', runtimeGraph);
    if (runtimeGraph) {
      console.log('[Preview] Auto-updating preview');
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
    // Save current graph state using persistence utilities
    saveToLocalStorage(nodes, edges);
    showToast('success', 'Graph saved to browser storage!');
  }, [nodes, edges, saveToLocalStorage, showToast]);

  const handleLoad = useCallback(() => {
    // Load graph from localStorage using persistence utilities
    const state = loadPersistedState();
    if (state) {
      setNodes(state.nodes || []);
      setEdges(state.edges || []);
      showToast('success', 'Graph loaded from browser storage!');
    } else {
      showToast('info', 'No saved graph found');
    }
  }, [setNodes, setEdges, showToast, loadPersistedState]);

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
    // Use the nodes passed or get them from current state
    if (nodesToDelete && nodesToDelete.length > 0) {
      const nodeIds = nodesToDelete.map(n => n.id);
      setNodes((nds) => nds.filter(n => !nodeIds.includes(n.id)));
      setEdges((eds) => eds.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
      showToast('info', `Deleted ${nodeIds.length} node(s)`);
    } else {
      // Delete selected nodes from current state
      const selectedNodeIds: string[] = [];
      setNodes((nds) => {
        const selectedNodes = nds.filter(n => n.selected);
        if (selectedNodes.length === 0) return nds;
        selectedNodes.forEach(n => selectedNodeIds.push(n.id));
        showToast('info', `Deleted ${selectedNodes.length} node(s)`);
        return nds.filter(n => !n.selected);
      });
      // Clean up edges connected to deleted nodes
      if (selectedNodeIds.length > 0) {
        setEdges((eds) => eds.filter(e => 
          !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)
        ));
      }
    }
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
    // Select all nodes and edges using state updater functions
    setNodes((currentNodes) => {
      const selectedNodes = currentNodes.map(n => ({ ...n, selected: true }));
      showToast('info', `Selected ${selectedNodes.length} nodes`);
      return selectedNodes;
    });
    setEdges((currentEdges) => {
      return currentEdges.map(e => ({ ...e, selected: true }));
    });
  }, [setNodes, setEdges, showToast]);

  // Handle canvas click to deselect all nodes and edges
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Check for right-click or context menu event
    if (event.button === 2 || event.type === 'contextmenu') {
      event.preventDefault();
      event.stopPropagation();
      
      // Show context menu for canvas (will add post-it note option)
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenuNodeId(null); // null indicates canvas context menu
      return;
    }
    
    // Only deselect if we're not in the middle of a selection drag (left-click only)
    if (!isSelecting && event.button === 0) {
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
    const { toggleTray, isOpen } = usePreviewTrayStore.getState();
    toggleTray();
    showToast('info', `Preview ${!isOpen ? 'shown' : 'hidden'}`);
  }, [showToast]);

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
            const options = segment.options.map((opt, idx) => ({
              id: `option-${idx + 1}`,
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

  // Manifest cache and base resolution for preset assets
  const manifestCacheRef = useRef<unknown | null>(null);
  const manifestBaseRef = useRef<string>('/presets');
  const manifestLoadPromiseRef = useRef<Promise<unknown> | null>(null);

  // Resolve preset path by ID using the published manifest
  const resolvePresetPathById = useCallback(async (presetId: string): Promise<string | null> => {
    // Load manifest once with multiple candidate URLs and HTML guard
    type Manifest = { presets?: Array<{ id?: string; path?: string }> };
    const getManifest = async (): Promise<unknown | null> => {
      if (manifestCacheRef.current) return manifestCacheRef.current;
      if (manifestLoadPromiseRef.current) return manifestLoadPromiseRef.current;
      const loader = (async () => {
        try {
          const baseUrl = ((import.meta as unknown) as { env?: { BASE_URL?: string } })?.env?.BASE_URL || '/';
          const base = String(baseUrl).replace(/\/$/, '');
          const candidates = [
            `${base}/presets/manifest.json`,
            '/presets/manifest.json',
            '/asset-browser/presets/manifest.json',
          ];
          for (const url of candidates) {
            try {
              const res = await fetch(url, { cache: 'no-cache' });
              if (!res.ok) continue;
              const text = await res.text();
              const trimmed = text.trim().toLowerCase();
              if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
                // HTML, not JSON - try next candidate
                continue;
              }
              const json = JSON.parse(text);
              manifestCacheRef.current = json;
              manifestBaseRef.current = url.includes('/asset-browser/')
                ? '/asset-browser/presets'
                : '/presets';
              return json;
            } catch {
              // try next
            }
          }
        } finally {
          manifestLoadPromiseRef.current = null;
        }
        return null;
      })();
      manifestLoadPromiseRef.current = loader;
      return loader;
    };

    try {
      const manifest = (await getManifest()) as Manifest | null;
      if (!manifest) return null;
      const entry = Array.isArray(manifest.presets)
        ? manifest.presets.find((p) => p.id === presetId)
        : null;
      return entry?.path || null;
    } catch (err) {
      console.warn('[Epic1GraphEditor] Error reading presets manifest', err);
      return null;
    }
  }, []);

  const normalizePresetPath = useCallback((path: string): string => {
    if (!path) return path;
    // Absolute URL or already absolute path
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
    const base = manifestBaseRef.current || '/presets';
    if (path.startsWith('./')) return `${base}/${path.slice(2)}`;
    if (path.startsWith('presets/')) return `/${path}`;
    if (path.startsWith('asset-browser/presets/') || path.startsWith('/asset-browser/presets/')) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    return `${base}/${path}`;
  }, []);

  // Shared insertion routine for both drop and explicit insert actions
  const insertPresetByMeta = useCallback(async (
    meta: any,
    position: { x: number; y: number }
  ) => {
    try {
      let content: string | null = null;

      // Prefer inline PSG content if provided
      if (meta?.psglib || meta?.content) {
        content = String(meta.psglib ?? meta.content);
      } else {
        // Resolve path from payload or manifest by ID
        let presetPath: string | null = meta?.path || null;
        if (!presetPath && meta?.id) {
          presetPath = await resolvePresetPathById(meta.id);
        }
        if (!presetPath) {
          throw new Error('Unable to resolve preset path.');
        }
        const normalized = normalizePresetPath(presetPath);
        const resp = await fetch(normalized, { cache: 'no-cache' });
        if (!resp.ok) {
          throw new Error(`Failed to load preset: ${resp.status} ${resp.statusText}`);
        }
        content = await resp.text();
      }

      if (!content) throw new Error('Preset content is empty.');

      // Validate before inserting
      const validation = validatePreset(content);
      if (!validation.valid) {
        throw new Error(validation.error || 'Preset failed validation');
      }

      const result = await insertPreset(content, {
        position,
        snapToGrid: true,
        selectAfterInsert: true
      });

      setNodes(nds => nds.concat(result.nodes as any));
      setEdges(eds => eds.concat(result.edges as any));

      // Optional: bounce first node for feedback
      try {
        if (addNodeWithBounce && result.nodes?.[0]) {
          addNodeWithBounce(result.nodes[0] as any);
        }
      } catch (e) {
        // non-fatal
      }

      const name = meta?.name ? ` "${meta.name}"` : '';
      const count = (validation.nodeCount ?? 0) > 0 ? ` (${validation.nodeCount} nodes)` : '';
      showToast('success', `Inserted preset${name}${count}`);
    } catch (error) {
      console.error('[Epic1GraphEditor] Preset insertion failed:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to insert preset');
    }
  }, [addNodeWithBounce, setNodes, setEdges, showToast, normalizePresetPath, resolvePresetPathById]);

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
      // Add width/height for bounding box nodes
      ...(nodeType === 'boundingBox' && { 
        width: 400,
        height: 300,
        measured: { width: 400, height: 300 }
      }),
      ...(nodeType === 'enhancedBoundingBox' && { 
        width: 400,
        height: 300,
        measured: { width: 400, height: 300 }
      }),
      data: {
        nodeType: nodeType, // CRITICAL: This is required for the runtime to identify the node type
        // Default data based on node type - set both value AND the specific properties expected by nodeFactory
        ...(nodeType === 'textBlock' && { 
          value: 'New text block',
          text: 'New text block' 
        }),
        ...(nodeType === 'weightedChoice' && { 
          value: JSON.stringify([
            { id: 'option-1', text: 'Option 1', weight: 50, hasBranch: true },
            { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: true }
          ], null, 2),
          options: [
            { id: 'option-1', text: 'Option 1', weight: 50, hasBranch: true },
            { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: true }
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
        ...((nodeType === 'boundingBox' || nodeType === 'enhancedBoundingBox') && {
          title: 'New Region',
          description: '',
          backgroundColor: '#CC567D',
          opacity: 0.3,
          borderColor: '#666',
          borderStyle: 'dashed',
          borderWidth: 2,
          locked: false,
          isCollapsed: false,
          width: 400,
          height: 300
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

  // Create post-it note handler
  const handleCreatePostIt = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `postit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'postItNote',
      position,
      width: 200,  // Set initial width on node
      height: 150, // Set initial height on node
      data: {
        text: '',
        color: 'yellow',
        collapsed: false,
        width: 200,
        height: 150
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    showToast('success', 'Post-it note created - double-click to edit');
    setContextMenuPosition(null);
  }, [setNodes, showToast]);
  
  // Group selected nodes
  const handleGroupNodes = useCallback((nodesToGroup: Node[]) => {
    if (nodesToGroup.length < 2) {
      showToast('warning', 'Select at least 2 nodes to group');
      return;
    }
    
    // Calculate group bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodesToGroup.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + (node.width || 150));
      maxY = Math.max(maxY, node.position.y + (node.height || 50));
    });
    
    // Create group node
    const groupNode: Node = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'group',
      position: { x: minX - 20, y: minY - 40 },
      data: {
        group: {
          id: `group-${Date.now()}`,
          name: `Group ${nodes.filter(n => n.type === 'group').length + 1}`,
          nodeIds: new Set(nodesToGroup.map(n => n.id)),
          collapsed: false,
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        },
        nodeCount: nodesToGroup.length,
        onToggle: (groupId: string) => {
          // Toggle group collapse state
          setNodes((nds) => 
            nds.map(n => {
              if (n.id === groupNode.id) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    group: {
                      ...n.data.group,
                      collapsed: !n.data.group.collapsed
                    }
                  }
                };
              }
              return n;
            })
          );
        }
      },
      style: {
        width: maxX - minX + 40,
        height: maxY - minY + 60,
        backgroundColor: 'rgba(200, 200, 255, 0.1)',
        border: '2px dashed #999',
        borderRadius: '8px',
        zIndex: -1
      }
    };
    
    setNodes((nds) => [groupNode, ...nds]);
    showToast('success', `Created group with ${nodesToGroup.length} nodes`);
  }, [nodes, setNodes, showToast]);
  
  // Ungroup nodes
  const handleUngroupNodes = useCallback((nodesToUngroup: Node[]) => {
    const groupNodes = nodesToUngroup.filter(n => n.type === 'group');
    
    if (groupNodes.length === 0) {
      showToast('warning', 'Select a group node to ungroup');
      return;
    }
    
    // Remove group nodes
    const groupIds = groupNodes.map(n => n.id);
    setNodes((nds) => nds.filter(n => !groupIds.includes(n.id)));
    showToast('success', `Ungrouped ${groupNodes.length} group(s)`);
  }, [setNodes, showToast]);
  
  // Create bounding box handler
  const handleCreateBoundingBox = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'enhancedBoundingBox',
      position,
      selectable: true,
      width: 400,  // Set width at node level for React Flow
      height: 300, // Set height at node level for React Flow
      measured: { width: 400, height: 300 }, // Also set measured for immediate rendering
      data: {
        title: 'New Region',
        description: '',
        backgroundColor: '#CC567D',
        opacity: 0.3,
        borderColor: '#666',
        borderStyle: 'dashed',
        borderWidth: 2,
        locked: false,
        isCollapsed: false,
        width: 400,
        height: 300
      }
    };
    
    // Add box with lower z-index to appear behind nodes
    setNodes((nds) => {
      // Put bounding boxes at the beginning of the array (lower z-index)
      return [newNode, ...nds];
    });
    showToast('success', 'Region box created - double-click title to edit');
    setContextMenuPosition(null);
  }, [setNodes, showToast]);
  
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

      // First: check for Asset Browser preset payload
      let presetPayload = '';
      try {
        presetPayload = event.dataTransfer.getData('application/x-preset');
      } catch {
        // ignore
      }

      if (presetPayload) {
        try {
          const meta = JSON.parse(presetPayload);
          // Calculate graph position
          const pos = reactFlowInstance
            ? reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
            : { x: 250, y: 250 };
          void insertPresetByMeta(meta, pos);
          return;
        } catch (e) {
          console.error('[Epic1GraphEditor] Invalid preset drop payload:', e);
          showToast('error', 'Invalid preset drop payload');
          return;
        }
      }

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
    [reactFlowInstance, handleNodeDrop, insertPresetByMeta, showToast]
  );

  // Wrap with DndProvider if using droppable nodes
  const content = (
    <div className="epic1-graph-editor" style={editorStyle}
         onDrop={onDrop}
         onDragOver={onDragOver}>
      <div className="epic1-main-layout">
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
            onPaneContextMenu={handlePaneClick}
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
            fitView={false}
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
              minZoom: 0.3,
              maxZoom: 2
            }}
            defaultViewport={{ x: 100, y: 100, zoom: 0.8 }}
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
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'textBlock': return '#606060';  // Medium gray
                  case 'weightedChoice': return '#7a6a4a';  // Gold-ish
                  case 'enhancedBranching': return '#7a6a4a';  // Gold-ish
                  case 'concat': return '#4a6a5a';  // Teal-ish
                  case 'setVariable': return '#6a4a7a';  // Purple-ish
                  case 'getVariable': return '#6a4a7a';  // Purple-ish
                  case 'variable': return '#6a4a7a';  // Purple-ish
                  case 'output': return '#4a7a6a';  // Cyan-ish
                  case 'enhancedBoundingBox': return '#4ECDC4';  // Teal for bounding boxes
                  case 'boundingBox': return '#4ECDC4';  // Teal for bounding boxes
                  case 'postItNote': return '#8a8a4a';  // Yellow-ish
                  case 'group': return '#3a3a3a';  // Dark gray
                  default: return '#606060';  // Default gray
                }
              }}
              nodeStrokeWidth={1}
              nodeStrokeColor="#505050"
              nodeClassName="minimap-node"
              pannable
              zoomable
              style={{ 
                position: 'absolute',
                left: nodePaletteCollapsed ? 50 : 210,
                top: 70,
                width: 200,
                height: 120,
                background: 'rgba(40, 40, 40, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 1000,
                transition: 'left 0.3s ease-in-out'
              }}
            />
          )}
          
          {/* Epic 1 specific controls */}
          <Panel position="top-right">
            <div className="epic1-controls">
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
          
          {/* Auth and Wizard buttons positioned above NodePalette */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: nodePaletteCollapsed ? '68px' : '220px',
            zIndex: 15,
            transition: 'left 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px',
              background: 'rgba(26, 26, 26, 0.95)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Auth button */}
              {currentUser ? (
                <button 
                  className="epic1-auth-button"
                  onClick={async () => {
                    await supabase?.auth.signOut();
                    showToast('success', 'Logged out successfully');
                  }}
                  title="Sign out"
                  style={{
                    padding: '10px 16px',
                    background: '#333',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '160px',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
                >
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    {currentUser.email?.split('@')[0]}
                  </span>
                  🚪
                </button>
              ) : (
                <button 
                  className="epic1-auth-button"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Sign in"
                  style={{
                    padding: '10px 16px',
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                >
                  🔐 Sign In
                </button>
              )}
              
              <button 
                className="epic1-wizard-button"
                onClick={() => setIsPromptWizardOpen(true)}
                title="Open Prompt Wizard (W)"
                style={{
                  padding: '10px 16px',
                  background: '#9d70f7',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#8a5fe6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#9d70f7'}
              >
                🪄 Wizard
              </button>
              
              <button 
                className="epic1-preview-button"
                onClick={handleTogglePreview}
                title="Toggle Preview Output (P)"
                style={{
                  padding: '10px 16px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                📊 Preview
              </button>
            </div>
          </div>

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
            <EdgeRoutingControls position="top-right" />
          </SafeReactFlowWrapper>
          
          {/* Keyboard shortcuts handler - must be inside ReactFlow for useReactFlow to work */}
          <KeyboardShortcuts
            onSave={handleSave}
            onLoad={handleLoad}
            onExport={handleExport}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onSelectAll={handleSelectAll}
            onGroup={handleGroupNodes}
            onUngroup={handleUngroupNodes}
            additionalHandlers={{
              'p': handleTogglePreview,
              'P': handleTogglePreview
            }}
          />
        </ReactFlow>
        
        {/* Tabbed Side Panel - combines Preview and Asset Browser */}
        {(showPreview || showAssetLibrary) && (
          <TabbedSidePanel
            previewEngine={previewEngineRef.current}
            onPresetDrag={(preset) => {
              // TODO: Implement preset application to nodes
            }}
            onPresetSelect={(preset) => {
              // TODO: Implement preset selection
            }}
            onInsert={(preset) => {
              const pos = reactFlowInstance
                ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
                : { x: 250, y: 250 };
              void insertPresetByMeta(preset);
            }}
            position="right"
            defaultTab={showAssetLibrary ? 'assets' : isPreviewVisible ? 'preview' : null}
            showAssets={showAssetLibrary}
            showPreview={false}
          />
        )}
      </div>

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
      
      {/* Context Menu */}
      {contextMenuPosition && contextMenuNodeId && (
        <NodeContextMenu
          nodeId={contextMenuNodeId}
          nodeType={nodes.find(n => n.id === contextMenuNodeId)?.type || 'textBlock'}
          position={contextMenuPosition}
          onClose={() => setContextMenuPosition(null)}
          onSaveAsPreset={handleSaveAsPreset}
          onAttachNote={() => {
            // Create a note attached to this node
            const targetNode = nodes.find(n => n.id === contextMenuNodeId);
            if (targetNode) {
              const newNote: Node = {
                id: `postit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'postItNote',
                position: {
                  x: targetNode.position.x + (targetNode.width || 200) + 50,
                  y: targetNode.position.y
                },
                width: 200,  // Set initial width on node
                height: 150, // Set initial height on node
                data: {
                  text: '',
                  color: 'yellow',
                  collapsed: false,
                  width: 200,
                  height: 150,
                  attachedTo: contextMenuNodeId,
                  attachmentOffset: { x: 50, y: 0 }
                }
              };
              setNodes((nds) => [...nds, newNote]);
              showToast('success', 'Note attached to node - double-click to edit');
            }
            setContextMenuPosition(null);
          }}
          onConvertToWeightedChoice={() => {
            // Convert text node to weighted choice
            const targetNode = nodes.find(n => n.id === contextMenuNodeId);
            if (targetNode && targetNode.type === 'textBlock') {
              const text = targetNode.data.value || targetNode.data.text || '';
              const options = text.includes(' or ') 
                ? text.split(/\s+or\s+/i).map((opt, idx) => ({
                    text: opt.trim(),
                    weight: 50,
                    hasBranch: false
                  }))
                : [{
                    text: text,
                    weight: 100,
                    hasBranch: false
                  }, {
                    text: 'Alternative',
                    weight: 50,
                    hasBranch: false
                  }];
              
              setNodes((nds) => nds.map(node => {
                if (node.id === contextMenuNodeId) {
                  return {
                    ...node,
                    type: 'weightedChoice',
                    data: {
                      ...node.data,
                      nodeType: 'weightedChoice',
                      options: options,
                      value: JSON.stringify(options)
                    }
                  };
                }
                return node;
              }));
              showToast('success', 'Converted to Weighted Choice node');
            }
            setContextMenuPosition(null);
          }}
        />
      )}
      
      {/* Canvas Context Menu (for post-it notes and bounding boxes) */}
      {contextMenuPosition && !contextMenuNodeId && (
        <CanvasContextMenu
          position={contextMenuPosition}
          onAddNote={(pos) => {
            // pos is already the click position, convert to flow position
            const flowPos = reactFlowInstance?.screenToFlowPosition({
              x: pos.x,
              y: pos.y
            }) || { x: 250, y: 250 };
            handleCreatePostIt(flowPos);
          }}
          onAddBoundingBox={(pos) => {
            // Convert screen position to flow position
            const flowPos = reactFlowInstance?.screenToFlowPosition({
              x: pos.x,
              y: pos.y
            }) || pos;
            handleCreateBoundingBox(flowPos);
          }}
          onLayoutCleanup={handleLayoutCleanup}
          onClose={() => setContextMenuPosition(null)}
        />
      )}
      
      {/* Save As Preset Dialog */}
      <SaveAsPresetDialog
        isOpen={!!saveAsPresetNodeId}
        nodeData={saveAsPresetNode?.data || null}
        nodeType={saveAsPresetNode?.type || 'textBlock'}
        onClose={() => setSaveAsPresetNodeId(null)}
        onSave={handleSavePreset}
      />
      
      {/* Prompt Wizard Dialog */}
      {isPromptWizardOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => setIsPromptWizardOpen(false)}
        >
          <div 
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '20px',
              width: '600px',
              maxWidth: '90%',
              maxHeight: '80%',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', color: '#9d70f7' }}>🪄 Prompt Wizard</h2>
            <p style={{ color: '#999', marginBottom: '16px' }}>
              Paste your prompt and I'll help you create variations automatically.
            </p>
            <div style={{ 
              background: '#2a2a2a', 
              border: '1px solid #444', 
              borderRadius: '4px', 
              padding: '12px', 
              marginBottom: '16px',
              fontSize: '13px',
              color: '#aaa'
            }}>
              <strong style={{ color: '#9d70f7' }}>Tips for better results:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Use commas to separate variations: "A brave, courageous, fearless knight"</li>
                <li>Use "or" for alternatives: "knight or warrior or soldier"</li>
                <li>Use parentheses for optional parts: "A (brave) knight ventures into the (dark) forest"</li>
                <li>Combine techniques: "A brave knight, fearless warrior ventures into the dark, mysterious forest"</li>
              </ul>
            </div>
            <textarea
              id="prompt-wizard-input"
              placeholder="Paste your prompt here... (e.g., A brave knight ventures into the dark forest)"
              style={{
                width: '100%',
                height: '120px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '8px',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical'
              }}
              autoFocus
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsPromptWizardOpen(false)}
                style={{
                  padding: '8px 16px',
                  background: '#333',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const input = (document.getElementById('prompt-wizard-input') as HTMLTextAreaElement)?.value;
                  if (!input || !input.trim()) {
                    showToast('warning', 'Please enter a prompt to analyze');
                    return;
                  }
                  
                  try {
                    const { promptParser } = await import('../../runtime/nodes/epic1/PromptParser');
                    const analysis = promptParser.parse(input);
                    
                    if (!analysis.nodes || analysis.nodes.length === 0) {
                      showToast('warning', 'Could not parse any variations from your prompt');
                      return;
                    }
                    
                    // Generate nodes from the analysis
                    const newNodes: Node<EditableNodeData>[] = [];
                    const newEdges: Edge[] = [];
                    
                    // Calculate positions for new nodes
                    const startX = 100;
                    const startY = 100;
                    const nodeSpacing = 250;
                    const rowHeight = 150;
                    const nodesPerRow = 3;
                    
                    analysis.nodes.forEach((genNode, index) => {
                      const row = Math.floor(index / nodesPerRow);
                      const col = index % nodesPerRow;
                      const nodeId = `wizard-${Date.now()}-${index}`;
                      const position = { 
                        x: startX + (col * nodeSpacing), 
                        y: startY + (row * rowHeight) 
                      };
                      
                      // Get the actual node from the generated node wrapper
                      const runtimeNode = genNode.node;
                      const nodeType = runtimeNode.getNodeType();
                      let flowNode: Node<EditableNodeData> | null = null;
                      
                      // Create the appropriate React Flow node based on the runtime node type
                      if (nodeType === 'TextBlock' || nodeType === 'Text') {
                        const value = runtimeNode.getCurrentValue();
                        flowNode = {
                          id: nodeId,
                          type: 'textBlock',
                          position,
                          data: {
                            nodeType: 'textBlock',
                            value: value,
                            content: value,
                            text: value
                          }
                        };
                      } else if (nodeType === 'WeightedChoice' || nodeType === 'Choice') {
                        const value = runtimeNode.getCurrentValue();
                        const options = value.options ? value.options.map((opt: any, idx: number) => ({
                          id: `opt-${idx}`,
                          text: opt.text || '',
                          weight: opt.weight || 1,
                          hasBranch: false
                        })) : [];
                        
                        flowNode = {
                          id: nodeId,
                          type: 'weightedChoice',
                          position,
                          data: {
                            nodeType: 'weightedChoice',
                            value: JSON.stringify(options),
                            options: options
                          }
                        };
                      } else if (nodeType === 'Concat') {
                        const value = runtimeNode.getCurrentValue();
                        flowNode = {
                          id: nodeId,
                          type: 'concat',
                          position,
                          data: {
                            nodeType: 'concat',
                            value: value,
                            separator: value.separator || ' '
                          }
                        };
                      } else if (nodeType === 'Variable') {
                        const value = runtimeNode.getCurrentValue();
                        flowNode = {
                          id: nodeId,
                          type: 'setVariable',
                          position,
                          data: {
                            nodeType: 'setVariable',
                            value: value,
                            variableName: value.name || 'variable',
                            variableValue: value.value || ''
                          }
                        };
                      } else if (nodeType === 'Output') {
                        flowNode = {
                          id: nodeId,
                          type: 'output',
                          position,
                          data: {
                            nodeType: 'output',
                            value: '',
                            outputName: 'output'
                          }
                        };
                      }
                      
                      if (flowNode) {
                        newNodes.push(flowNode);
                      }
                    });
                    
                    // Connect nodes in sequence
                    for (let i = 0; i < newNodes.length - 1; i++) {
                      newEdges.push({
                        id: `wizard-edge-${i}`,
                        source: newNodes[i].id,
                        target: newNodes[i + 1].id,
                        type: 'smoothstep'
                      });
                    }
                    
                    // Check if we have existing nodes
                    const hasExistingNodes = nodes.length > 0;
                    if (hasExistingNodes) {
                      // Store the pending nodes and show dialog
                      setPendingWizardNodes({ nodes: newNodes, edges: newEdges });
                      setIsPromptWizardOpen(false);
                    } else {
                      // No existing nodes, just add
                      setNodes(newNodes);
                      setEdges(newEdges);
                      showToast('success', `Created ${newNodes.length} nodes from your prompt!`);
                      setIsPromptWizardOpen(false);
                    }
                  } catch (error) {
                    console.error('Error parsing prompt:', error);
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    showToast('error', `Failed to parse prompt: ${errorMsg}`);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  background: '#9d70f7',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Generate Nodes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Replace/Append Dialog */}
      {pendingWizardNodes && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}
        >
          <div 
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '24px',
              width: '400px',
              maxWidth: '90%'
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>How would you like to add the nodes?</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              You have an existing graph. Would you like to replace it or add the new nodes alongside?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  // Cancel - do nothing
                  setPendingWizardNodes(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Append to existing nodes with offset
                  const maxX = Math.max(...nodes.map(n => n.position.x), 0);
                  const offsetNodes = pendingWizardNodes.nodes.map(node => ({
                    ...node,
                    position: {
                      x: node.position.x + maxX + 300,
                      y: node.position.y
                    }
                  }));
                  setNodes((nds) => [...nds, ...offsetNodes]);
                  setEdges((eds) => [...eds, ...pendingWizardNodes.edges]);
                  showToast('success', `Added ${pendingWizardNodes.nodes.length} nodes to your graph!`);
                  setPendingWizardNodes(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Add to Graph
              </button>
              <button
                onClick={() => {
                  // Replace existing nodes
                  setNodes(pendingWizardNodes.nodes);
                  setEdges(pendingWizardNodes.edges);
                  showToast('success', `Replaced graph with ${pendingWizardNodes.nodes.length} new nodes!`);
                  setPendingWizardNodes(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Replace Graph
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast('success', `Welcome ${user.email}!`);
        }}
      />
      
      {/* Preview Tray - Bottom output panel as sibling */}
      {/*
        IMPORTANT: The internal PreviewTray here must NOT be an overlay.
        Do not pass overlay={true}. It should remain a normal flex child so it
        pushes content above it. Overlay mode previously caused UX issues.
      */}
      {showPreview && (
        <PreviewTray
        resizable={false}
        seeds={currentSeeds}
        results={previewResults}
        isExecuting={isPreviewExecuting}
        error={previewError}
        onSeedsChange={setCurrentSeeds}
        onExecute={() => {
          console.log('[Preview] Execute button clicked');
          console.log('[Preview] Current nodes:', enhancedNodes);
          console.log('[Preview] Current edges:', edges);
          const runtimeGraph = convertToRuntimeGraph(enhancedNodes, edges);
          console.log('[Preview] Converted runtime graph:', runtimeGraph);
          if (runtimeGraph && previewEngineRef.current) {
            console.log('[Preview] Updating preview with graph');
            previewEngineRef.current.updatePreview(runtimeGraph, enhancedNodes, edges);
          } else {
            console.warn('[Preview] Missing runtime graph or preview engine', {
              runtimeGraph,
              previewEngine: previewEngineRef.current
            });
          }
        }}
        onCancel={() => {
          previewEngineRef.current?.cancelExecution();
        }}
        onCopy={(text) => {
          navigator.clipboard.writeText(text).then(() => {
            showToast('success', 'Results copied to clipboard');
          });
        }}
        onExport={(format) => {
          // Export functionality
          const data = format === 'json' 
            ? JSON.stringify(previewResults, null, 2)
            : previewResults.map(r => `Seed ${r.seed}: ${r.result}`).join('\n');
          const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `preview-results.${format}`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('success', `Results exported as ${format.toUpperCase()}`);
        }}
      />
    )}
    </div>
  );
  
  // Always wrap with DndProvider since TabbedSidePanel includes asset browser that uses drag-and-drop
  // The asset browser tab can be clicked regardless of showAssetLibrary prop
  return <DndProvider backend={HTML5Backend}>{content}</DndProvider>;
};

// Export the main component
// Original monolithic implementation (now legacy)
const Epic1GraphEditorMonolithic: React.FC<Epic1GraphEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Epic1GraphEditorInner {...props} />
    </ReactFlowProvider>
  );
};

// Import the refactored version
import { Epic1GraphEditorFinal } from './Epic1GraphEditorFinal';

// DEFAULT EXPORT: Using the legacy version until refactored version is fully complete
// The refactored version is missing preview window, context menus, and select all functionality
export const Epic1GraphEditor = Epic1GraphEditorMonolithic;

// Legacy exports for backward compatibility if needed
export const Epic1GraphEditorLegacy = Epic1GraphEditorMonolithic;
export const Epic1GraphEditorWithProvider = Epic1GraphEditorMonolithic; // Use legacy until refactor is complete

// Conditional export based on feature flag (can force refactored if needed)
export const Epic1GraphEditorConditional = 
  process.env.USE_REFACTORED_EDITOR === 'true' ? Epic1GraphEditorFinal : Epic1GraphEditorMonolithic;