import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowInstance,
  MarkerType,
} from 'reactflow';
import type { EditableNodeData } from '../nodes';

export interface GraphEditorContextValue {
  // State
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  activatedEdges: Set<string>;
  isDragging: boolean;
  isSelecting: boolean;
  selectedNodes: string[];
  selectedEdges: string[];
  
  // Actions
  setNodes: React.Dispatch<React.SetStateAction<Node<EditableNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setIsDragging: (dragging: boolean) => void;
  setIsSelecting: (selecting: boolean) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Event handlers
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  handleEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  handlePaneClick: () => void;
  handleSelectionChange: (params: { nodes: Node[]; edges: Edge[] }) => void;
  
  // ReactFlow instance
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
  
  // Preview state
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  
  // Utility functions
  deleteSelectedElements: () => void;
  duplicateSelectedNodes: () => void;
  selectAllNodes: () => void;
  fitView: () => void;
  
  // Callbacks from props
  onNodesChangeProp?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChangeProp?: (edges: Edge[]) => void;
}

const GraphEditorContext = createContext<GraphEditorContextValue | undefined>(undefined);

export interface GraphEditorProviderProps {
  children: React.ReactNode;
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChangeProp?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChangeProp?: (edges: Edge[]) => void;
}

export const GraphEditorProvider: React.FC<GraphEditorProviderProps> = ({
  children,
  initialNodes = [],
  initialEdges = [],
  onNodesChangeProp,
  onEdgesChangeProp,
}) => {
  const [nodes, setNodes] = useState<Node<EditableNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [activatedEdges, setActivatedEdges] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const activatedEdgesRef = useRef(activatedEdges);
  activatedEdgesRef.current = activatedEdges;

  // Notify parent component of changes
  useEffect(() => {
    if (onNodesChangeProp) {
      onNodesChangeProp(nodes);
    }
  }, [nodes, onNodesChangeProp]);

  useEffect(() => {
    if (onEdgesChangeProp) {
      onEdgesChangeProp(edges);
    }
  }, [edges, onEdgesChangeProp]);

  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) {return;}
    
    const newEdge: Edge = {
      id: `${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
    };
    
    setEdges((eds) => [...eds, newEdge]);
    
    // Briefly highlight the new edge
    setActivatedEdges((prev) => new Set([...prev, newEdge.id]));
    setTimeout(() => {
      setActivatedEdges((prev) => {
        const next = new Set(prev);
        next.delete(newEdge.id);
        return next;
      });
    }, 500);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNodes([node.id]);
    setSelectedEdges([]);
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdges([edge.id]);
    setSelectedNodes([]);
  }, []);

  // Handle pane click (deselect all)
  const handlePaneClick = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodes(params.nodes.map((n) => n.id));
    setSelectedEdges(params.edges.map((e) => e.id));
  }, []);

  // Delete selected elements
  const deleteSelectedElements = useCallback(() => {
    if (selectedNodes.length > 0) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
      setEdges((eds) =>
        eds.filter(
          (edge) => !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
        )
      );
    }
    if (selectedEdges.length > 0) {
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
    }
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges]);

  // Duplicate selected nodes
  const duplicateSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) {return;}
    
    const nodesToDuplicate = nodes.filter((node) => selectedNodes.includes(node.id));
    const duplicatedNodes: Node<EditableNodeData>[] = nodesToDuplicate.map((node) => ({
      ...node,
      id: `${node.id}_copy_${Date.now()}`,
      position: {
        x: node.position.x + 100,
        y: node.position.y + 100,
      },
      selected: false,
    }));
    
    setNodes((nds) => [...nds, ...duplicatedNodes]);
    setSelectedNodes(duplicatedNodes.map((n) => n.id));
  }, [nodes, selectedNodes]);

  // Select all nodes
  const selectAllNodes = useCallback(() => {
    setSelectedNodes(nodes.map((n) => n.id));
    setSelectedEdges([]);
  }, [nodes]);

  // Fit view
  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5,
      });
    }
  }, [reactFlowInstance]);

  const value: GraphEditorContextValue = {
    // State
    nodes,
    edges,
    activatedEdges,
    isDragging,
    isSelecting,
    selectedNodes,
    selectedEdges,
    
    // Actions
    setNodes,
    setEdges,
    setIsDragging,
    setIsSelecting,
    onNodesChange,
    onEdgesChange,
    onConnect,
    
    // Event handlers
    handleNodeClick,
    handleEdgeClick,
    handlePaneClick,
    handleSelectionChange,
    
    // ReactFlow instance
    reactFlowInstance,
    setReactFlowInstance,
    
    // Preview state
    showPreview,
    setShowPreview,
    
    // Utility functions
    deleteSelectedElements,
    duplicateSelectedNodes,
    selectAllNodes,
    fitView,
    
    // Callbacks
    onNodesChangeProp,
    onEdgesChangeProp,
  };

  return (
    <GraphEditorContext.Provider value={value}>
      {children}
    </GraphEditorContext.Provider>
  );
};

export const useGraphEditor = () => {
  const context = useContext(GraphEditorContext);
  if (!context) {
    throw new Error('useGraphEditor must be used within a GraphEditorProvider');
  }
  return context;
};