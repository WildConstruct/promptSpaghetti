import React, { useState, useCallback, useRef } from 'react';
import { NodeProps, useReactFlow, Handle, Position } from 'reactflow';
import type { EditableNodeData } from './BaseEditableNode';
import { ResizeHandles } from './ResizeHandles';

export interface FragmentContainerData extends EditableNodeData {
  title?: string;
  description?: string;
  isCollapsed?: boolean;
  fragmentSource?: string;
  nodeCount?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  width?: number;
  height?: number;
}

const COLLAPSED_HEIGHT = 100;
const COLLAPSED_WIDTH = 300;
const MIN_EXPANDED_HEIGHT = 200;
const MIN_EXPANDED_WIDTH = 350;

/**
 * FragmentContainer - A specialized container for PSG fragment nodes
 * Provides collapse/expand functionality and visual grouping
 */
export const FragmentContainer: React.FC<NodeProps<FragmentContainerData>> = ({
  data,
  selected,
  id,
  xPos,
  yPos,
  dragging
}) => {
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({
    width: isCollapsed ? COLLAPSED_WIDTH : (data.width || 400),
    height: isCollapsed ? COLLAPSED_HEIGHT : (data.height || 300)
  });

  const expandedSizeRef = useRef({
    width: data.width || 400,
    height: data.height || 300
  });
  const boxRef = useRef<HTMLDivElement>(null);

  const { setNodes, getNodes } = useReactFlow();

  // Get contained nodes (children with parentNode = this id)
  const getContainedNodes = useCallback(() => {
    const allNodes = getNodes();
    return allNodes.filter(node =>
      node.parentNode === id ||
      node.data?.parentNode === id
    );
  }, [id, getNodes]);

  // Calculate node count from actual contained nodes
  const containedNodes = getContainedNodes();
  const actualNodeCount = containedNodes.length;
  const displayNodeCount = data.nodeCount || actualNodeCount;

  // Handle resize
  const handleResize = useCallback((newSize: { width: number; height: number }) => {
    if (isCollapsed) return; // Don't resize when collapsed

    const clampedWidth = Math.max(MIN_EXPANDED_WIDTH, newSize.width);
    const clampedHeight = Math.max(MIN_EXPANDED_HEIGHT, newSize.height);

    setSize({ width: clampedWidth, height: clampedHeight });
    expandedSizeRef.current = { width: clampedWidth, height: clampedHeight };

    // Update the node's data with new dimensions
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, width: clampedWidth, height: clampedHeight },
            style: { ...node.style, width: clampedWidth, height: clampedHeight }
          };
        }
        return node;
      })
    );
  }, [id, isCollapsed, setNodes]);

  // Determine container style based on state
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: size.width,
    height: size.height,
    padding: '12px',
    background: selected
      ? 'linear-gradient(135deg, #9b59b6, #8e44ad)' // Purple gradient when selected
      : data.backgroundColor || 'linear-gradient(135deg, #a569bd, #9b59b6)',
    border: `${data.borderWidth || 2}px ${data.borderStyle || 'solid'} ${selected ? '#8e44ad' : data.borderColor || '#8e44ad'}`,
    borderRadius: '12px',
    boxShadow: selected
      ? '0 8px 24px rgba(155, 89, 182, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    opacity: dragging ? 0.7 : 1,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isCollapsed ? '0' : '8px',
    paddingBottom: isCollapsed ? '0' : '8px',
    borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
  };

  const toggleButtonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    padding: '4px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);

    // Get nodes that are children of this container
    const containedNodes = getContainedNodes();

    if (newCollapsed) {
      // Save expanded size before collapsing
      expandedSizeRef.current = { width: size.width, height: size.height };
      setSize({ width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT });

      // Hide child nodes when collapsed
      setNodes((nodes) =>
        nodes.map((node) => {
          // Update container node
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, isCollapsed: true },
              style: { ...node.style, width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }
            };
          }
          // Hide contained nodes
          if (containedNodes.some(cn => cn.id === node.id)) {
            return { ...node, hidden: true };
          }
          return node;
        })
      );
    } else {
      // Restore expanded size
      const expandedSize = expandedSizeRef.current;
      setSize(expandedSize);

      // Show child nodes when expanded
      setNodes((nodes) =>
        nodes.map((node) => {
          // Update container node
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, isCollapsed: false },
              style: { ...node.style, width: expandedSize.width, height: expandedSize.height }
            };
          }
          // Show contained nodes
          if (containedNodes.some(cn => cn.id === node.id)) {
            return { ...node, hidden: false };
          }
          return node;
        })
      );
    }
  }, [isCollapsed, id, size, getContainedNodes, setNodes]);

  return (
    <div ref={boxRef} style={containerStyle}>
      {/* Resize handles when not collapsed */}
      {!isCollapsed && !dragging && (
        <ResizeHandles
          width={size.width}
          height={size.height}
          minWidth={MIN_EXPANDED_WIDTH}
          minHeight={MIN_EXPANDED_HEIGHT}
          onResize={handleResize}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
        />
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#8e44ad',
          width: '12px',
          height: '12px',
          border: '2px solid #fff'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#8e44ad',
          width: '12px',
          height: '12px',
          border: '2px solid #fff'
        }}
      />

      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          {data.title || 'Fragment'}
        </div>
        <button
          style={toggleButtonStyle}
          onClick={handleToggleCollapse}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          {isCollapsed ? '▼ Expand' : '▲ Collapse'}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ color: '#fff', fontSize: '14px' }}>
          {data.description && (
            <div style={{ marginBottom: '8px', opacity: 0.9 }}>
              {data.description}
            </div>
          )}
          {data.fragmentSource && (
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
              Source: {data.fragmentSource}
            </div>
          )}
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Contains: {displayNodeCount} nodes
          </div>
        </div>
      )}

      {/* Collapsed state badge */}
      {isCollapsed && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '140px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '11px',
          color: '#fff'
        }}>
          {displayNodeCount} nodes
        </div>
      )}
    </div>
  );
};

FragmentContainer.displayName = 'FragmentContainer';

export default FragmentContainer;
