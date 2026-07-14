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

// SVG icons as strings for each node type
const nodeIcons = {
  textBlock: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6z"/></svg>',
  weightedChoice: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937z"/></svg>',
  concat: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z"/></svg>',
  setVariable: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/></svg>',
  getVariable: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 3a2.5 2.5 0 0 1 5 0V4h5v10a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V4h3.5v-.5zm1 0v.5h3V3a1.5 1.5 0 0 0-3 0z"/></svg>',
  output: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>',
  template: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2zm1 2h10v1H3V4zm0 3h6v1H3V7zm0 3h8v1H3v-1z"/></svg>',
  enhancedBoundingBox: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/></svg>',
  postItNote: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.5A1.5 1.5 0 0 0 1.5 3v10A1.5 1.5 0 0 0 3 14.5h6.2c.4 0 .78-.16 1.06-.44l4.3-4.3c.28-.28.44-.66.44-1.06V3A1.5 1.5 0 0 0 13.5 1.5H3zm8 10.8V9.5h2.8L11 12.3z"/></svg>',
};

export const nodeTypes: NodeTypeInfo[] = [
  { type: 'textBlock', label: 'Text Block', icon: nodeIcons.textBlock, category: 'Basic' },
  { type: 'weightedChoice', label: 'Weighted Choice', icon: nodeIcons.weightedChoice, category: 'Logic' },
  { type: 'concat', label: 'Concatenate', icon: nodeIcons.concat, category: 'Text' },
  { type: 'template', label: 'Template', icon: nodeIcons.template, category: 'Text' },
  { type: 'setVariable', label: 'Set Variable', icon: nodeIcons.setVariable, category: 'Variables' },
  { type: 'getVariable', label: 'Get Variable', icon: nodeIcons.getVariable, category: 'Variables' },
  { type: 'output', label: 'Output', icon: nodeIcons.output, category: 'Output' },
  { type: 'enhancedBoundingBox', label: 'Region Box', icon: nodeIcons.enhancedBoundingBox, category: 'Organization' },
  { type: 'postItNote', label: 'Note', icon: nodeIcons.postItNote, category: 'Organization' },
];

export interface NodePaletteProps {
  position?: 'left' | 'right';
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children?: React.ReactNode;
}

export const NodePalette: React.FC<NodePaletteProps> = ({
  position = 'left',
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
}) => {
  const [collapsed, setCollapsed] = React.useState(controlledCollapsed ?? defaultCollapsed);
  const dragImageRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (controlledCollapsed !== undefined) {
      setCollapsed(controlledCollapsed);
    }
  }, [controlledCollapsed]);

  React.useEffect(() => {
    debugLogEpic1('[NodePalette] Mounted, position:', position, 'collapsed:', collapsed);
    onCollapsedChange?.(collapsed);
  }, [position, collapsed, onCollapsedChange]);

  React.useEffect(
    () => () => {
      if (dragImageRef.current) {
        dragImageRef.current.remove();
        dragImageRef.current = null;
      }
    },
    []
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    debugLogEpic1('[NodePalette] Drag started for node type:', nodeType);
    // Use text/plain as primary for better compatibility
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.setData('application/nodeType', nodeType);
    event.dataTransfer.setData('application/node-type', nodeType);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'copy';

    // Explicit drag image improves visual feedback across browsers/WSL remoting.
    const dragImage = document.createElement('div');
    dragImage.className = 'node-item drag-ghost';
    dragImage.textContent = nodeTypes.find(node => node.type === nodeType)?.label ?? nodeType;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    dragImage.style.left = '-9999px';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.padding = '8px 12px';
    dragImage.style.borderRadius = '6px';
    dragImage.style.background = 'rgba(30, 30, 30, 0.92)';
    dragImage.style.border = '1px solid rgba(103, 126, 234, 0.5)';
    dragImage.style.color = '#e0e0e0';
    dragImage.style.fontSize = '12px';
    dragImage.style.fontWeight = '600';
    dragImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.35)';
    document.body.appendChild(dragImage);
    dragImageRef.current = dragImage;
    event.dataTransfer.setDragImage(dragImage, 12, 12);
  };

  return (
    <div
      className={`node-palette ${position} ${collapsed ? 'collapsed' : ''}`}
      data-tutorial-anchor="node-palette"
    >
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
              draggable={true}
              onDragStart={(e) => onDragStart(e, node.type)}
              onDragEnd={() => {
                debugLogEpic1('[NodePalette] Drag ended for', node.type);
                if (dragImageRef.current) {
                  dragImageRef.current.remove();
                  dragImageRef.current = null;
                }
              }}
              title={node.label}
            >
              <span className="node-icon" dangerouslySetInnerHTML={{ __html: node.icon }} />
              <span className="node-label">{node.label}</span>
            </div>
          ))}
        </div>
      )}
      {!collapsed && children && (
        <div className="palette-footer">
          {children}
        </div>
      )}
    </div>
  );
};

export default NodePalette;
