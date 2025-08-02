import React from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Test nodes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { label: 'Test Node 1' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: 'Test Node 2' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

function App() {
  console.log('App component rendering with ReactFlow...');
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
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