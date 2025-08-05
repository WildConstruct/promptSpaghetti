import React, { useEffect } from 'react';
import { useReactFlow } from 'reactflow';

export const EdgeDebugger: React.FC = () => {
  const reactFlowInstance = useReactFlow();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const edges = reactFlowInstance.getEdges();
      const nodes = reactFlowInstance.getNodes();
      
      console.log('=== EDGE DEBUGGER ===');
      console.log('Edges in state:', edges.length, edges);
      console.log('Nodes in state:', nodes.length, nodes.map(n => ({ id: n.id, type: n.type })));
      
      // Check DOM elements
      const edgeElements = document.querySelectorAll('.react-flow__edge');
      const pathElements = document.querySelectorAll('.react-flow__edges path');
      
      console.log('Edge DOM elements:', edgeElements.length);
      console.log('Path DOM elements:', pathElements.length);
      
      // Check if edges have valid source/target
      edges.forEach((edge, i) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        console.log(`Edge ${i}:`, {
          id: edge.id,
          source: edge.source,
          sourceExists: !!sourceNode,
          target: edge.target,
          targetExists: !!targetNode,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        });
      });
      
      console.log('=== END DEBUGGER ===');
    }, 3000);
    
    return () => clearInterval(interval);
  }, [reactFlowInstance]);
  
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: 10,
      borderRadius: 5,
      fontSize: 12,
      zIndex: 10000
    }}>
      Edge Debugger Active - Check Console
    </div>
  );
};