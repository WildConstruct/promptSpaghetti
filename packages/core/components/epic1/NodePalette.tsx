/**
 * Node Palette for Epic 1 Editor
 * Simple draggable palette for creating new nodes
 */

import React from 'react';
import './NodePalette.css';
import { debugLogEpic1 } from '../../utils/debug';

export interface NodeTypeInfo {
  type: string;
  label: string;
  icon: string;
  category: string;
}

const nodeTypes: NodeTypeInfo[] = [
  { type: 'textBlock', label: 'Text Block', icon: '📝', category: 'Basic' },
  { type: 'weightedChoice', label: 'Weighted Choice', icon: '⚖️', category: 'Logic' },
  { type: 'concat', label: 'Concatenate', icon: '🔗', category: 'Text' },
  { type: 'setVariable', label: 'Set Variable', icon: '💾', category: 'Variables' },
  { type: 'getVariable', label: 'Get Variable', icon: '📥', category: 'Variables' },
  { type: 'output', label: 'Output', icon: '📤', category: 'Output' },
  { type: 'enhancedBoundingBox', label: 'Region Box', icon: '🗂️', category: 'Organization' },
];

export interface NodePaletteProps {
  position?: 'left' | 'right';
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({
  position = 'left',
  defaultCollapsed = false,
  onCollapsedChange,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  
  React.useEffect(() => {
    debugLogEpic1('[NodePalette] Mounted, position:', position, 'collapsed:', collapsed);
    onCollapsedChange?.(collapsed);
  }, [position, collapsed, onCollapsedChange]);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    debugLogEpic1('[NodePalette] Drag started for node type:', nodeType);
    // Use text/plain as primary for better compatibility
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.setData('application/node-type', nodeType);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`node-palette ${position} ${collapsed ? 'collapsed' : ''}`}>
      <div className="palette-header">
        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
        {!collapsed && <span className="palette-title">Nodes</span>}
      </div>
      
      {!collapsed && (
        <div className="node-list">
          {nodeTypes.map((node) => (
            <div
              key={node.type}
              className="node-item"
              draggable="true"
              onDragStart={(e) => onDragStart(e, node.type)}
              onDragEnd={() => debugLogEpic1('[NodePalette] Drag ended for', node.type)}
              title={node.label}
            >
              <span className="node-icon">{node.icon}</span>
              <span className="node-label">{node.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NodePalette;