import React, { createContext, useContext, ReactNode } from 'react';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { useGraphState } from '../hooks/useGraphState';

interface GraphEditorContextType {
  // Graph state
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  activatedEdges: Set<string>;
  selectedNodeId: string | null;
  isDragging: boolean;
  isSelecting: boolean;
  
  // State setters
  setNodes: (nodes: Node<EditableNodeData>[] | ((nodes: Node<EditableNodeData>[]) => Node<EditableNodeData>[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsSelecting: (selecting: boolean) => void;
  
  // Event handlers
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (params: any) => void;
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  handleEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  handlePaneClick: (event: React.MouseEvent) => void;
  
  // ReactFlow instance
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  
  // Editor configuration
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  showAssetLibrary: boolean;
  setShowAssetLibrary: (show: boolean) => void;
}

const GraphEditorContext = createContext<GraphEditorContextType | undefined>(undefined);

interface GraphEditorProviderProps {
  children: ReactNode;
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChangeProp?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChangeProp?: (edges: Edge[]) => void;
}

/**
 * GraphEditorProvider - Provides graph editor state to all child components
 * Centralizes state management and reduces prop drilling
 */
export const GraphEditorProvider: React.FC<GraphEditorProviderProps> = ({
  children,
  initialNodes = [],
  initialEdges = [],
  onNodesChangeProp,
  onEdgesChangeProp,
}) => {
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);
  const [showPreview, setShowPreview] = React.useState(true);
  const [showAssetLibrary, setShowAssetLibrary] = React.useState(true);

  // Use the graph state hook
  const graphState = useGraphState({
    initialNodes,
    initialEdges,
    onNodesChangeProp,
    onEdgesChangeProp,
  });

  const value: GraphEditorContextType = {
    ...graphState,
    reactFlowInstance,
    setReactFlowInstance,
    showPreview,
    setShowPreview,
    showAssetLibrary,
    setShowAssetLibrary,
  };

  return (
    <GraphEditorContext.Provider value={value}>
      {children}
    </GraphEditorContext.Provider>
  );
};

/**
 * useGraphEditor - Hook to access graph editor context
 * Throws error if used outside of GraphEditorProvider
 */
export const useGraphEditor = (): GraphEditorContextType => {
  const context = useContext(GraphEditorContext);
  if (!context) {
    throw new Error('useGraphEditor must be used within GraphEditorProvider');
  }
  return context;
};

/**
 * withGraphEditor - HOC to inject graph editor context as props
 * Useful for class components or gradual migration
 */
export function withGraphEditor<P extends object>(
  Component: React.ComponentType<P & GraphEditorContextType>
): React.FC<P> {
  return (props: P) => {
    const graphEditor = useGraphEditor();
    return <Component {...props} {...graphEditor} />;
  };
}