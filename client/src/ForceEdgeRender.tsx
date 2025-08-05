import React, { useEffect } from 'react';
import { useReactFlow, useStore } from 'reactflow';

export const ForceEdgeRender: React.FC = () => {
  const { getNodes, getEdges, setEdges } = useReactFlow();
  const edgeRenderer = useStore((state) => state.edgeRenderer);
  
  useEffect(() => {
    // Log the current state
    console.log('ForceEdgeRender - Edges:', getEdges());
    console.log('ForceEdgeRender - Nodes:', getNodes());
    console.log('ForceEdgeRender - Edge Renderer:', edgeRenderer);
    
    // Try to force a re-render of edges
    const edges = getEdges();
    if (edges.length > 0) {
      // Force update by setting edges again
      setEdges([...edges]);
      
      // Check if SVG exists after a delay
      setTimeout(() => {
        const svg = document.querySelector('.react-flow__edges svg');
        const edgeElements = document.querySelectorAll('.react-flow__edge');
        console.log('After force update - SVG exists:', !!svg);
        console.log('After force update - Edge elements:', edgeElements.length);
        
        // If still no SVG, try to create one manually (diagnostic only)
        if (!svg && edges.length > 0) {
          console.error('CRITICAL: React Flow is not creating the edge SVG container!');
          
          const edgesContainer = document.querySelector('.react-flow__edges');
          if (edgesContainer) {
            console.log('Edges container found, but no SVG inside. This suggests React Flow edge rendering is broken.');
          }
        }
      }, 100);
    }
  }, [getEdges, getNodes, setEdges, edgeRenderer]);
  
  return null;
};