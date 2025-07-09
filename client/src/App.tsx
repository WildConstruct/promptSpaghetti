import React from 'react';
import ReactFlow, { Background } from 'react-flow-renderer';

const nodes = [];
const edges = [];

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
