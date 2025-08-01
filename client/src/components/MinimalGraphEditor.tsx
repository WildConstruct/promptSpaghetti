import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Initial nodes with inline editing example
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { 
      label: 'Welcome to Epic 1! 🎨\nDouble-click nodes to edit inline' 
    },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 250 },
    data: { label: 'Text Node\n(Editable)' },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 250 },
    data: { label: 'Logic Node\n(Weighted Choice)' },
  },
  {
    id: '4',
    type: 'default',
    position: { x: 250, y: 400 },
    data: { label: 'Output Node' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
];

export const MinimalGraphEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Simple inline editing on double click
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const newLabel = prompt('Edit node label:', node.data.label);
      if (newLabel !== null) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return {
                ...n,
                data: { ...n.data, label: newLabel },
              };
            }
            return n;
          })
        );
      }
    },
    [setNodes]
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
      >
        <Panel position="top-left" style={{ 
          background: 'rgba(30, 30, 30, 0.9)', 
          color: '#e8e8e8',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ff7c00' }}>
            🍝 Prompt Spaghetti - Epic 1 MVP
          </h3>
          <p style={{ margin: '5px 0' }}>✨ Double-click nodes to edit inline</p>
          <p style={{ margin: '5px 0' }}>🔗 Drag to connect nodes</p>
          <p style={{ margin: '5px 0' }}>🎯 Ctrl+Scroll to zoom</p>
        </Panel>
        <Controls />
        <MiniMap 
          nodeColor="#ff7c00"
          style={{
            backgroundColor: '#1e1e1e',
          }}
        />
        <Background variant="dots" gap={12} size={1} color="#404040" />
      </ReactFlow>
    </div>
  );
};