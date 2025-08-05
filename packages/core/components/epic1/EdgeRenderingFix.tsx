import React from 'react';
import { Edge, EdgeProps, getBezierPath } from 'reactflow';

// Default edge component that forces rendering
export const DefaultEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <g className="react-flow__edge" style={{ pointerEvents: 'all', cursor: 'pointer' }}>
      <path
        id={props.id}
        style={{
          ...props.style,
          pointerEvents: 'stroke',
          cursor: 'pointer'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={props.markerEnd}
        fill="none"
        strokeWidth={props.style?.strokeWidth || 2}
      />
      {/* Invisible wider path for better click detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={40}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
      />
    </g>
  );
};

// Edge types configuration
export const edgeTypes = {
  default: DefaultEdge,
  smoothstep: DefaultEdge,
  straight: DefaultEdge,
  step: DefaultEdge,
};

// Helper to check if edges are rendering
export const checkEdgeRendering = () => {
  const edges = document.querySelector('.react-flow__edges');
  const svg = document.querySelector('.react-flow__edges svg');
  const paths = document.querySelectorAll('.react-flow__edges path');
  
  console.log('Edge Rendering Check:', {
    edgesContainer: !!edges,
    svgElement: !!svg,
    pathElements: paths.length,
    containerHTML: edges?.innerHTML || 'No edges container'
  });
  
  return { edges, svg, paths };
};