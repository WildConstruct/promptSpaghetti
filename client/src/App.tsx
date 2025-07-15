import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePalette from './components/NodePalette';
import GraphNode from './components/GraphNode';
import StatusBar from './components/StatusBar';

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodeTypes = { graphNode: GraphNode } as const;

  const onDrop = useCallback<React.DragEventHandler>(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const id = `${type}_${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'graphNode',
        position,
        data: { label: type },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onDragOver = useCallback<React.DragEventHandler>(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    [],
  );

  const validateEdge = (params: { source?: string; target?: string }) => {
    if (!params.source || !params.target) return false;
    return params.source !== params.target;
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const valid = validateEdge(params);
      if (valid) {
        setEdges((eds) => addEdge(params, eds));
      } else {
        setErrors((errs) => errs.concat(`Self-loop not allowed: ${params.source}`));
      }
    },
    [setEdges],
  );

  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0'
    }}>
      <NodePalette />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            fitView
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <Background 
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#333"
            />
            <Controls style={{ 
              button: { 
                backgroundColor: '#2a2a2a', 
                color: '#e0e0e0',
                border: '1px solid #444'
              }
            }} />
          </ReactFlow>
        </div>
        <StatusBar errorCount={errors.length} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
