import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { NodeData } from '../../types/NodeTypes';
import { InlineNodeEditor } from './InlineNodeEditor';


interface InlineEditorState { nodeId: string | null }
},
  position: { x: number; y: number };
  isActive: boolean;


export interface InlineEditorManagerProps { nodes: Node<NodeData>[] }
  onNodeUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;


export const InlineEditorManager: React.FC<InlineEditorManagerProps> = ({ nodes
  onNodeUpdate }
  canvasRef
}) => { const [editorState, setEditorState] = useState<InlineEditorState>({
    nodeId: null }
    position: { x: 0, y: 0 }
    isActive: false;
  });
  const { getNode, project, getViewport } = useReactFlow();
  const activationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const lastClickNodeRef = useRef<string | null>(null);
  // Handle double-click detection
  const handleNodeClick = useCallback((event: React.MouseEvent, nodeId: string) => { const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const isSameNode = lastClickNodeRef.current === nodeId;
    lastClickTimeRef.current = now;
    lastClickNodeRef.current = nodeId;
    // Double-click detection (within 300ms on same node)
    if (timeSinceLastClick < 300 && isSameNode) {
      event.preventDefault();
      event.stopPropagation();
      activateEditor(nodeId, event) }
  }, []);
  const activateEditor = useCallback((nodeId: string, event?: React.MouseEvent) => {
    const node = getNode(nodeId);
    if (!node) return;
    // Calculate editor position
    let editorPosition: { x: number; y: number };
    if (event && canvasRef?.current) { // Position relative to click if event provided
  const canvasRect = canvasRef.current.getBoundingClientRect();
  editorPosition = {
  x: event.clientX - canvasRect.left + 20,
  y: event.clientY - canvasRect.top + 20 }
};
 else { // Position relative to node center
  const viewport = getViewport();
  const nodeScreenPos = project({
  x: node.position.x + (node.width || 200) / 2,
  y: node.position.y + (node.height || 100) / 2 }
});
      editorPosition = { x: nodeScreenPos.x + 20,
  y: nodeScreenPos.y + 20 }
};
    // Ensure editor stays within viewport bounds
    if (canvasRef?.current) { const canvasRect = canvasRef.current.getBoundingClientRect();
  const maxWidth = 400;
  const maxHeight = 300;
  if (editorPosition.x + maxWidth > canvasRect.width) {
  editorPosition.x = canvasRect.width - maxWidth - 20 }
  if (editorPosition.y + maxHeight > canvasRect.height) { editorPosition.y = canvasRect.height - maxHeight - 20 }
  editorPosition.x = Math.max(20, editorPosition.x);
  editorPosition.y = Math.max(20, editorPosition.y);

    setEditorState({ nodeId,
  position: editorPosition,
  isActive: true }
});
  }, [getNode, project, getViewport, canvasRef]);
  const closeEditor = useCallback(() => { setEditorState({
      nodeId: null }
      position: { x: 0, y: 0 },
      isActive: false;
  });
  }, []);
  const handleEditorSubmit = useCallback(() => { closeEditor() }, [closeEditor]);
  // Handle node updates from editor
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<NodeData>) => { onNodeUpdate(nodeId, updates) }, [onNodeUpdate]);
  // Cleanup timeout on unmount
  useEffect(() => { return () => {
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current) }
    };
  }, []);
  // Get active node
  const activeNode = editorState.nodeId ? nodes.find(n => n.id === editorState.nodeId) : null;
  return (
    <>
      {/* Render inline editor if active */}
      {editorState.isActive && activeNode && (
        <InlineNodeEditor
          node={activeNode}
          isActive={editorState.isActive}
          onUpdate={handleNodeUpdate}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
          position={editorState.position}
        />
      )}
      {/* Invisible event handlers for node double-clicks */}
      {nodes.map((node) => (
        <NodeClickHandler
          key={node.id}
          node={node}
          onClick={handleNodeClick}
          isEditorActive={editorState.isActive && editorState.nodeId === node.id}
        />
      ))}
    </>
  );
};

// Component to handle click events on individual nodes


interface NodeClickHandlerProps { node: Node<NodeData>;
  onClick: (event: React.MouseEvent, nodeId: string) => void }
  isEditorActive: boolean;




const NodeClickHandler: React.FC<NodeClickHandlerProps> = ({ node
  onClick }
  isEditorActive
}) => {
  const { project, getViewport } = useReactFlow();
  // Get node position in screen coordinates
  const viewport = getViewport();
  const screenPosition = project(node.position);
  if (isEditorActive) return null; // Don't render handler when editor is active
  return (
    <div
      style={ {
  position: 'absolute'
  left: screenPosition.x
  top: screenPosition.y
  width: node.width || 200
  height: node.height || 100
  pointerEvents: 'auto'
  cursor: 'text'
  zIndex: 10 }
}
      onClick={(e) => onClick(e, node.id)}
      onDoubleClick={ (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e, node.id) }}
    />
  );
};

// Hook for integrating inline editor with existing components
export const useInlineEditor = () => { const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const activateEditor = useCallback((nodeId: string) => { }
  setActiveNodeId(nodeId);
}, []);
  const deactivateEditor = useCallback(() => { setActiveNodeId(null) }, []);
  const isNodeBeingEdited = useCallback((nodeId: string) => { return activeNodeId === nodeId }, [activeNodeId]);
  return { activeNodeId
    activateEditor
    deactivateEditor }
    isNodeBeingEdited
  };
};

// Context for sharing editor state across components
export const InlineEditorContext = React.createContext<{ activeNodeId: string | null;,
  activateEditor: (nodeId: string) => void }
  deactivateEditor: () => void;
  isNodeBeingEdited: (nodeId: string) => boolean;
 | null>(null);

export const InlineEditorProvider: React.FC<{ ,
  children: React.ReactNode }> = ({ children }) => {
  const editorState = useInlineEditor();
  return (
    <InlineEditorContext.Provider value={editorState}>
      {children}
    </InlineEditorContext.Provider>
  );
;

export const useInlineEditorContext = () => { const context = React.useContext(InlineEditorContext);
  if (!context) {
    throw new Error('useInlineEditorContext must be used within InlineEditorProvider') }
  return context;
};

export default InlineEditorManager;