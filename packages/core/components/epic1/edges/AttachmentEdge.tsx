import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

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
        id={id}
        style={{
          ...style,
          stroke: '#999',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          fill: 'none',
          opacity: 0.5
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
    </>
  );
};

AttachmentEdge.displayName = 'AttachmentEdge';