import React from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge
} from 'reactflow';

// Custom edge component to force rendering
export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#ff0000',
          strokeWidth: 5
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#ffcc00',
            padding: 2,
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 700
          }}
        >
          {id}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Export edge types configuration
export const customEdgeTypes = {
  default: CustomEdge,
  smoothstep: CustomEdge,
  custom: CustomEdge
};
