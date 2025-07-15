import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function GraphNode({ data }: NodeProps) {
  return (
    <div style={{ padding: 10, border: '1px solid #999', borderRadius: 4, background: '#fff' }}>
      <strong>{data.label}</strong>
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} />
    </div>
  );
}
