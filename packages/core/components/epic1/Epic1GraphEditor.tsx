import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Edge,
  Node,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { ConnectionFeedback, useConnectionValidation } from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './PanZoomControls.css';

export interface Epic1GraphEditorProps {
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onExecute?: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
}

/**
 * Epic 1 Graph Editor with inline editing capabilities
 */
export const Epic1GraphEditor: React.FC<Epic1GraphEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onExecute,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<EditableNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Toast system for error messages
  const { toasts, showToast, dismissToast } = useToast();

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
    };
  }, [handleNodeEdit]);

  // Update nodes when selected
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: createNodeData(node.data, node.id),
      selected: node.id === selectedNodeId,
    }));
  }, [nodes, selectedNodeId, createNodeData]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Use connection validation hook with error handling
  const { isValidConnection } = useConnectionValidation(nodes, edges, (error) => {
    showToast('error', error);
  });

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

  const handleDelete = useCallback((nodesToDelete: Node[]) => {
    const nodeIds = nodesToDelete.map(n => n.id);
    setNodes((nds) => nds.filter(n => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
    showToast('info', `Deleted ${nodeIds.length} node(s)`);
  }, [setNodes, setEdges, showToast]);

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

  return (
    <div className="epic1-graph-editor">
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={epic1NodeTypes}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'textBlock': return '#6366f1';
              case 'weightedChoice': return '#f59e0b';
              case 'concat': return '#10b981';
              case 'variable': return '#8b5cf6';
              case 'output': return '#ef4444';
              default: return '#666';
            }
          }}
        />
        
        {/* Epic 1 specific controls */}
        <Panel position="top-right">
          <div className="epic1-controls">
            <button 
              className="epic1-execute-button"
              onClick={handleExecute}
              disabled={!onExecute}
            >
              Execute Graph
            </button>
          </div>
        </Panel>

        {/* Instructions panel */}
        <Panel position="bottom-center">
          <div className="epic1-instructions">
            Click any node to edit • Tab/Shift+Tab to navigate • Enter to confirm • Escape to cancel • Press ? for help
          </div>
        </Panel>

        {/* Connection validation feedback */}
        <ConnectionFeedback nodes={nodes} edges={edges} />
        
        {/* Pan/Zoom controls */}
        <PanZoomControls position="bottom-right" />
      </ReactFlow>

      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onSelectAll={handleSelectAll}
      />

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <ConnectionToast
          key={toast.id}
          message={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Wrap with ReactFlowProvider
export const Epic1GraphEditorWithProvider: React.FC<Epic1GraphEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Epic1GraphEditor {...props} />
    </ReactFlowProvider>
  );
};