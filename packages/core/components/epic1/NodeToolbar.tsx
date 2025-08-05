/**
 * Node Toolbar for Epic 1
 * Draggable node palette using native HTML5 drag-and-drop
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

// Draggable node button using native HTML5 drag-and-drop
const NodeButton: React.FC<{ nodeInfo: NodeTypeInfo }> = ({ nodeInfo }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    console.log('[NodeToolbar] Drag started for:', nodeInfo.type);
    setIsDragging(true);
    
    // Clear any existing data
    e.dataTransfer.clearData();
    
    // Set multiple data formats for compatibility
    // CRITICAL: Set text/plain first as it's the most reliable
    e.dataTransfer.setData('text/plain', nodeInfo.type);
    e.dataTransfer.setData('application/reactflow', nodeInfo.type);
    e.dataTransfer.setData('application/node-type', nodeInfo.type);
    e.dataTransfer.setData('text', nodeInfo.type);
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a custom drag image to show the correct node being dragged
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'scale(0.9)';
    document.body.appendChild(dragImage);
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    // Remove the temporary element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    // Debug logging
    console.log('[NodeToolbar] Data set for drag:', {
      type: nodeInfo.type,
      dataTypes: Array.from(e.dataTransfer.types || [])
    });
  };

  const handleDragEnd = () => {
    console.log('[NodeToolbar] Drag ended for:', nodeInfo.type);
    setIsDragging(false);
  };

  return (
    <button
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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