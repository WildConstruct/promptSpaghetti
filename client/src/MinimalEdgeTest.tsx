import React from 'react';
import ReactFlow, { Node, Edge, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

const MinimalEdgeTest: React.FC = () => {
  const nodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' }
    },
    {
      id: '2',
      type: 'default',
      position: { x: 300, y: 100 },
      data: { label: 'Node 2' }
    }
  ];
  
  const edges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default',
      style: {
        stroke: '#ff0000',
        strokeWidth: 5
      }
    }
  ];
  
  return (
    <div style={{ width: '100%', height: '400px', border: '2px solid blue' }}>
      <h2>Minimal Edge Test</h2>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
        />
      </ReactFlowProvider>
    </div>
  );
};

export default MinimalEdgeTest;