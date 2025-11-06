/**
 * EnhancedBoundingBox Component - Refactored Version
 * Main container component that orchestrates all sub-components and hooks
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow, Position } from 'reactflow';

// Import types and constants
import { 
  EnhancedBoundingBoxData, 
  Port, 
  Size, 
  ResizeDirection 
} from './types';
import { 
  BOUNDING_BOX_CONSTANTS, 
  DEFAULT_REGION_COLORS 
} from './utils/constants';

// Import sub-components
import { BoundingBoxHeader } from './BoundingBoxHeader';
import { ResizeHandles } from './ResizeHandles';
import { PortSystem } from './PortSystem';

// Import hooks
import { useNodeContainment } from './hooks/useNodeContainment';
import { useCollapseAnimation } from './hooks/useCollapseAnimation';
import { useGroupMovement } from './hooks/useGroupMovement';
import { useAutoLayout } from './hooks/useAutoLayout';

// Import performance monitoring
import { PerformanceMonitor } from '../../../../utils/performance/PerformanceMonitor';
import type { Epic1NodeProps } from '../nodePropTypes';

const {
  COLLAPSED_HEIGHT,
  COLLAPSED_WIDTH,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  MIN_EXPANDED_HEIGHT,
  MIN_EXPANDED_WIDTH,
} = BOUNDING_BOX_CONSTANTS.dimensions;

const { BOUNDING_BOX, BACKGROUND } = BOUNDING_BOX_CONSTANTS.zIndex;
const { BORDER_RADIUS } = BOUNDING_BOX_CONSTANTS.ui;

/**
 * Enhanced Bounding Box with modular architecture
 * Refactored for better performance and maintainability
 */
export const EnhancedBoundingBox: React.FC<Epic1NodeProps<EnhancedBoundingBoxData>> = ({
  data,
  selected,
  id,
  xPos,
  yPos,
  dragging,
}) => {
  const perfMonitor = PerformanceMonitor.getInstance();
  const { setNodes, getNodes, getEdges } = useReactFlow();
  
  // State management
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(data.title || 'Region');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(data.description || '');
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false);
  const [isLocked, setIsLocked] = useState(data.locked || false);
  const [ports] = useState<Port[]>(data.ports || []);
  
  // Size refs for maintaining state between collapsed/expanded
  const expandedSizeRef = useRef<Size>({ 
    width: data.width || DEFAULT_WIDTH, 
    height: data.height || DEFAULT_HEIGHT 
  });
  const sizeRef = useRef<Size>({
    width: isCollapsed ? COLLAPSED_WIDTH : (data.width || DEFAULT_WIDTH),
    height: isCollapsed ? COLLAPSED_HEIGHT : (data.height || DEFAULT_HEIGHT)
  });
  
  // Use performance-optimized hooks
  const { containedNodes, cacheHitRate } = useNodeContainment(
    id,
    getNodes(),
    { x: xPos, y: yPos },
    sizeRef.current,
    expandedSizeRef.current,
    isCollapsed
  );
  
  const { size, isAnimating } = useCollapseAnimation(
    isCollapsed,
    expandedSizeRef.current,
    () => {
      // Animation complete callback
      if (data.autoLayout && !isCollapsed) {
        applyLayout();
      }
    }
  );
  
  useGroupMovement(
    id,
    isLocked,
    dragging || false,
    { x: xPos, y: yPos },
    containedNodes
  );
  
  const { applyLayout, isLayouting } = useAutoLayout(
    id,
    containedNodes,
    data.autoLayout
  );
  
  // Update size ref when size changes
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  
  // Track render performance
  useEffect(() => {
    perfMonitor.record('boundingBox.render', 1);
    perfMonitor.record('boundingBox.cacheHitRate', cacheHitRate);
  }, [perfMonitor, cacheHitRate]);
  
  /**
   * Port detection for collapsed state
   */
  const detectPorts = useCallback((): Port[] => {
    const edges = getEdges();
    const containedNodeIds = new Set(containedNodes.map(n => n.id));
    const detectedPorts: Port[] = [];
    
    edges.forEach(edge => {
      const sourceInside = containedNodeIds.has(edge.source);
      const targetInside = containedNodeIds.has(edge.target);
      
      if (sourceInside !== targetInside) {
        if (sourceInside) {
          const sourceNode = containedNodes.find(n => n.id === edge.source);
          if (sourceNode) {
            detectedPorts.push({
              id: `port_out_${edge.id}`,
              label: sourceNode.data?.label || 'Output',
              type: 'any',
              direction: 'output',
              nodeId: edge.source,
              position: Position.Right,
              color: '#52c41a'
            });
          }
        } else {
          const targetNode = containedNodes.find(n => n.id === edge.target);
          if (targetNode) {
            detectedPorts.push({
              id: `port_in_${edge.id}`,
              label: targetNode.data?.label || 'Input',
              type: 'any',
              direction: 'input',
              nodeId: edge.target,
              position: Position.Left,
              color: '#1890ff'
            });
          }
        }
      }
    });
    
    return detectedPorts;
  }, [containedNodes, getEdges]);
  
  /**
   * Handle collapse/expand toggle
   */
  const handleCollapseToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // Track performance
    perfMonitor.record('boundingBox.toggleCollapse', 1);
    
    // Update nodes with new collapsed state
    if (newCollapsed) {
      // Store which nodes we're hiding
      const hiddenNodeIds = containedNodes.map(n => n.id);
      
      setNodes((nodes) => 
        nodes.map((node) => {
          if (hiddenNodeIds.includes(node.id)) {
            return { ...node, hidden: true };
          }
          if (node.id === id) {
            return {
              ...node,
              data: { 
                ...node.data, 
                isCollapsed: true,
                collapsedNodeIds: hiddenNodeIds
              }
            };
          }
          return node;
        })
      );
    } else {
      // Restore hidden nodes
      const boxNode = getNodes().find(n => n.id === id);
      const collapsedNodeIds = boxNode?.data?.collapsedNodeIds || [];
      
      setNodes((nodes) =>
        nodes.map((node) => {
          if (collapsedNodeIds.includes(node.id)) {
            return { ...node, hidden: false };
          }
          if (node.id === id) {
            return {
              ...node,
              data: { 
                ...node.data, 
                isCollapsed: false,
                collapsedNodeIds: undefined
              }
            };
          }
          return node;
        })
      );
    }
  }, [isCollapsed, containedNodes, id, setNodes, getNodes, perfMonitor]);
  
  /**
   * Handle lock toggle
   */
  const handleLockToggle = useCallback(() => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, locked: newLocked }
          };
        }
        // Lock/unlock dragging for contained nodes
        if (containedNodes.some(cn => cn.id === node.id)) {
          return { 
            ...node, 
            draggable: !newLocked,
            selectable: true
          };
        }
        return node;
      })
    );
  }, [id, isLocked, containedNodes, setNodes]);
  
  /**
   * Handle resize start
   */
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    if (isLocked) {return;}
    
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    
    // Disable node dragging during resize
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, draggable: false };
        }
        return node;
      })
    );
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = sizeRef.current.width;
    const startHeight = sizeRef.current.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (direction.includes('e')) {newWidth = Math.max(MIN_EXPANDED_WIDTH, startWidth + deltaX);}
      if (direction.includes('w')) {newWidth = Math.max(MIN_EXPANDED_WIDTH, startWidth - deltaX);}
      if (direction.includes('s')) {newHeight = Math.max(MIN_EXPANDED_HEIGHT, startHeight + deltaY);}
      if (direction.includes('n')) {newHeight = Math.max(MIN_EXPANDED_HEIGHT, startHeight - deltaY);}
      
      sizeRef.current = { width: newWidth, height: newHeight };
      
      // Update node dimensions
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              width: newWidth,
              height: newHeight,
              data: { ...node.data, width: newWidth, height: newHeight }
            };
          }
          return node;
        })
      );
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Re-enable node dragging
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, draggable: !isLocked };
          }
          return node;
        })
      );
      
      // Save expanded size
      if (!isCollapsed) {
        expandedSizeRef.current = sizeRef.current;
      }
      
      perfMonitor.record('boundingBox.resize', 1);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isLocked, isCollapsed, id, setNodes, perfMonitor]);
  
  /**
   * Handle title and description edits
   */
  const handleEditStart = useCallback((type: 'title' | 'description') => {
    if (type === 'title') {
      setIsEditingTitle(true);
    } else {
      setIsEditingDescription(true);
    }
  }, []);
  
  const handleEditEnd = useCallback(() => {
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    
    // Save changes to node data
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, title, description }
          };
        }
        return node;
      })
    );
  }, [id, title, description, setNodes]);
  
  /**
   * Create RGBA color from hex color and opacity
   */
  const getBackgroundWithOpacity = (hexColor: string, opacity: number) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Box style with animations
  const boxStyle: React.CSSProperties = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    border: `${data.borderWidth || 2}px solid ${data.borderColor || DEFAULT_REGION_COLORS[0]}`,
    borderRadius: `${BORDER_RADIUS}px`,
    position: 'relative',
    overflow: 'visible',
    transition: isAnimating ? 'all 0.2s ease-in-out' : 'none',
    zIndex: selected ? 2000 : BOUNDING_BOX,
    boxSizing: 'border-box',
  };
  
  return (
    <div
      className={`enhanced-bounding-box-refactored ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      style={boxStyle}
    >
      {/* Background layer */}
      <div 
        className="bounding-box-background" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: getBackgroundWithOpacity(
            data.backgroundColor || DEFAULT_REGION_COLORS[0], 
            data.opacity || 0.3
          ),
          borderRadius: `${BORDER_RADIUS}px`,
          zIndex: BACKGROUND,
          pointerEvents: 'none'
        }}
      />
      
      {/* Header with controls */}
      <BoundingBoxHeader
        title={title}
        description={description}
        isCollapsed={isCollapsed}
        isLocked={isLocked}
        isEditingTitle={isEditingTitle}
        isEditingDescription={isEditingDescription}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onLockToggle={handleLockToggle}
        onCollapseToggle={handleCollapseToggle}
        onEditStart={handleEditStart}
        onEditEnd={handleEditEnd}
      />
      
      {/* Node count indicator */}
      {!isCollapsed && (
        <div className="bounding-box-status" style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
        }}>
          {containedNodes.length} node{containedNodes.length !== 1 ? 's' : ''}
          {isLayouting && ' (arranging...)'}
        </div>
      )}
      
      {/* Collapsed indicator */}
      {isCollapsed && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '1px',
          }} />
          <span style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            fontWeight: 300,
          }}>
            {data.collapsedNodeIds?.length || containedNodes.length || 0} Nodes
          </span>
        </div>
      )}
      
      {/* Port system for collapsed state */}
      <PortSystem
        isCollapsed={isCollapsed}
        ports={ports}
        boundingBoxId={id}
        detectPorts={detectPorts}
      />
      
      {/* Resize handles */}
      <ResizeHandles
        visible={selected && !isCollapsed}
        isLocked={isLocked}
        onResizeStart={handleResizeStart}
      />
    </div>
  );
};

EnhancedBoundingBox.displayName = 'EnhancedBoundingBox';

// Export for backward compatibility
export default EnhancedBoundingBox;
