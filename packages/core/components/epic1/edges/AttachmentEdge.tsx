import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const EDGE_HIT_STROKE_WIDTH = 56;

/**
 * Custom edge type for post-it note attachments
 * Renders a dashed line between a note and its attached node
 */
export const AttachmentEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.001)"
        strokeWidth={EDGE_HIT_STROKE_WIDTH}
        style={{
          pointerEvents: 'stroke',
          cursor: 'default'
        }}
      />
      <path
        id={id}
        style={{
          ...style,
          stroke: '#999',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          fill: 'none',
          opacity: 0.5,
          pointerEvents: 'none'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

AttachmentEdge.displayName = 'AttachmentEdge';
