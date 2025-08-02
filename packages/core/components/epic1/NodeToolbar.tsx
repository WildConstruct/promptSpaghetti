/**
 * Node Toolbar for Epic 1
 * Simple draggable node palette
 */

import React from 'react';
import './NodeToolbar.css';

interface NodeTypeInfo {
  type: string;
  label: string;
  icon: string;
  color: string;
}

const nodeTypes: NodeTypeInfo[] = [
  { type: 'textBlock', label: 'Text', icon: 'T', color: '#7c7ff2' },
  { type: 'weightedChoice', label: 'Choice', icon: '⚖️', color: '#f6a723' },
  { type: 'concat', label: 'Concat', icon: '🔗', color: '#22c493' },
  { type: 'variable', label: 'Variable', icon: '📦', color: '#9d70f7' },
  { type: 'output', label: 'Output', icon: '📤', color: '#f15656' }
];

// Draggable node button
const NodeButton: React.FC<{ nodeInfo: NodeTypeInfo }> = ({ nodeInfo }) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', nodeInfo.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <button
      className="node-button"
      style={{ '--node-color': nodeInfo.color } as React.CSSProperties}
      title={`Drag to add ${nodeInfo.label} node`}
      draggable
      onDragStart={onDragStart}
    >
      <span className="node-icon">{nodeInfo.icon}</span>
      <span className="node-label">{nodeInfo.label}</span>
    </button>
  );
};

export interface NodeToolbarProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ position = 'top' }) => {
  return (
    <div className={`node-toolbar ${position}`}>
      <div className="toolbar-title">Nodes</div>
      <div className="toolbar-buttons">
        {nodeTypes.map(nodeInfo => (
          <NodeButton key={nodeInfo.type} nodeInfo={nodeInfo} />
        ))}
      </div>
    </div>
  );
};

export default NodeToolbar;