import React from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Simple custom node component
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid #4a5568',
      borderRadius: '8px',
      padding: '10px 15px',
      fontSize: '14px',
      color: '#1a202c',
      minWidth: '150px',
      textAlign: 'center'
    }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Test nodes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 100 },
    data: { label: '🍝 Test Node 1' },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 200 },
    data: { label: '📝 Test Node 2' },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 400, y: 200 },
    data: { label: '🎯 Test Node 3' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

function App() {
  console.log('App component rendering with custom nodes...');
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;