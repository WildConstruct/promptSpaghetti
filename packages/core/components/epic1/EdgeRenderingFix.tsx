import React from 'react';
import { EdgeProps, getSmoothStepPath } from 'reactflow';
import { AttachmentEdge } from './edges/AttachmentEdge';
import EdgeRouter from './edges/EdgeRouter';
import { debugLogEpic1 } from '../../utils/debug';

// Default edge component that forces rendering
export const DefaultEdge: React.FC<EdgeProps> = props => {
  const extraClassName =
    'className' in props && typeof (props as { className?: string }).className === 'string'
      ? (props as { className?: string }).className ?? ''
      : '';

  // Log edge state for debugging
  if (props.selected) {
    debugLogEpic1(
      '[DefaultEdge] Selected edge:',
      props.id,
      'className:',
      extraClassName
    );
  }
  
  // Use smoothstep path since that's what the edges are configured to use
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 10,
  });

  return (
    <g
      className={`react-flow__edge ${props.selected ? 'selected' : ''} ${extraClassName}`}
    >
      {/* Invisible wider path for better click detection - MUST BE FIRST */}
      <path
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={30}
        style={{ 
          pointerEvents: 'stroke', 
          cursor: 'pointer',
          opacity: 0
        }}
      />
      {/* Visible edge path */}
      <path
        id={props.id}
        style={{
          ...props.style,
          pointerEvents: 'none', // Let the interaction path handle clicks
          cursor: 'pointer'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={props.markerEnd}
        fill="none"
        strokeWidth={props.style?.strokeWidth || 3}
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
  attachment: AttachmentEdge,
  bezier: EdgeRouter,
  advanced: EdgeRouter,
};

// Helper to check if edges are rendering
export const checkEdgeRendering = () => {
  const edges = document.querySelector('.react-flow__edges');
  const svg = document.querySelector('.react-flow__edges svg');
  const paths = document.querySelectorAll('.react-flow__edges path');
  
  debugLogEpic1('Edge Rendering Check:', {
    edgesContainer: !!edges,
    svgElement: !!svg,
    pathElements: paths.length,
    containerHTML: edges?.innerHTML || 'No edges container'
  });
  
  return { edges, svg, paths };
};
