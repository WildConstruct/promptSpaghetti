/**
 * Node Toolbar for Epic 1
 * Draggable node palette using React DnD for compatibility with DroppableCanvas
 */

import React from 'react';
import { useDrag } from 'react-dnd';
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

// Draggable node button using React DnD
const NodeButton: React.FC<{ nodeInfo: NodeTypeInfo }> = ({ nodeInfo }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'new-node',
    item: { nodeType: nodeInfo.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [nodeInfo.type]);

  return (
    <button
      ref={drag}
      className={`node-button ${isDragging ? 'dragging' : ''}`}
      style={{ 
        '--node-color': nodeInfo.color,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
      } as React.CSSProperties}
      title={`Drag to add ${nodeInfo.label} node`}
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