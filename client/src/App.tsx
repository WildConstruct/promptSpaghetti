import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  Node,
  Edge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePalette from './components/NodePalette';
import GraphNode from './components/GraphNode';
import StatusBar from './components/StatusBar';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const nodeTypes = { graphNode: GraphNode } as const;

  const onDrop = useCallback<React.DragEventHandler>(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const reactFlowBounds = (
        event.target as HTMLElement
      ).getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      const id = `${type}_${nodes.length + 1}`;
      const newNode: Node = {
        id,
        type: 'default',
        position,
        data: { label: type },
      };
      setNodes((nds) => nds.concat({ ...newNode, type: 'graphNode' }));
    },
    [nodes.length],
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
    (params: Edge | any) => {
      const valid = validateEdge(params);
      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        animated: false,
        style: valid ? undefined : { stroke: 'red' },
      };
      setEdges((eds) => eds.concat(newEdge));
      if (!valid) {
        setErrors((errs) => errs.concat(`Self-loop not allowed: ${params.source}`));
      }
    },
    [],
  );

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        <NodePalette />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
          <StatusBar errorCount={errors.length} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
