/**
 * EnhancedBoundingBox Component - Refactored Version
 * Main container component that orchestrates all sub-components and hooks
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect
} from 'react';
import {
  useReactFlow,
  Position,
  useUpdateNodeInternals,
  NodeResizer
} from 'reactflow';

// Import types and constants
import { 
  EnhancedBoundingBoxData, 
  Port,
  Size 
} from './types';
import { 
  BOUNDING_BOX_CONSTANTS, 
  DEFAULT_REGION_COLORS 
} from './utils/constants';

// Import sub-components
import { BoundingBoxHeader } from './BoundingBoxHeader';
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
  const updateNodeInternals = useUpdateNodeInternals();
  
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
  
  // State for current size to trigger re-renders during resize
  const [currentSize, setCurrentSize] = useState<Size>(sizeRef.current);
  
  // Use performance-optimized hooks
  const { containedNodes, cacheHitRate, recalculate } = useNodeContainment(
    id,
    getNodes(),
    { x: xPos, y: yPos },
    currentSize,
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
  
  // Update size ref and state when size changes
  useEffect(() => {
    sizeRef.current = size;
    setCurrentSize(size);
  }, [size]);

  // Keep React Flow internals in sync with the rendered size (both initial load and during resize)
  useEffect(() => {
    setNodes(nodes =>
      nodes.map(node => {
        if (node.id !== id) {
          return node;
        }

        const widthChanged = node.width !== currentSize.width;
        const heightChanged = node.height !== currentSize.height;
        const styleWidth = (node.style as { width?: number } | undefined)?.width;
        const styleHeight = (node.style as { height?: number } | undefined)?.height;
        const styleWidthChanged =
          styleWidth !== currentSize.width || styleHeight !== currentSize.height;
        if (!widthChanged && !heightChanged && !styleWidthChanged) {
          return node;
        }

        return {
          ...node,
          width: currentSize.width,
          height: currentSize.height,
          style: {
            ...(node.style ?? {}),
            width: currentSize.width,
            height: currentSize.height
          },
          data: {
            ...node.data,
            width: currentSize.width,
            height: currentSize.height
          }
        };
      })
    );
    updateNodeInternals(id);
  }, [currentSize, id, setNodes, updateNodeInternals]);
  
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
    const explicitChildIds = new Set(
      getNodes()
        .filter(node => {
          const directParent = (node as { parentNode?: string }).parentNode;
          const dataParent = (node.data as { parentNode?: string } | undefined)
            ?.parentNode;
          return directParent === id || dataParent === id;
        })
        .map(node => node.id)
    );
    const containedNodeIds = new Set([
      ...containedNodes.map(n => n.id),
      ...explicitChildIds
    ]);
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
  }, [containedNodes, getEdges, getNodes, id]);
  
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
      const hiddenNodeIds = Array.from(
        new Set([
          ...containedNodes.map(n => n.id),
          ...getNodes()
            .filter(node => {
              const directParent = (node as { parentNode?: string }).parentNode;
              const dataParent = (
                node.data as { parentNode?: string } | undefined
              )?.parentNode;
              return directParent === id || dataParent === id;
            })
            .map(node => node.id)
        ])
      );
      
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
      recalculate();
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
      recalculate();
    }
  }, [isCollapsed, containedNodes, id, setNodes, getNodes, perfMonitor, recalculate]);
  
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

  // Built-in React Flow resizer callbacks
  const canResize = !isCollapsed && !isLocked;

  const handleResizeStart = useCallback(() => {
    if (!canResize) {
      return;
    }
    setIsResizing(true);
    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === id) {
          return { ...node, draggable: false };
        }
        return node;
      })
    );
  }, [canResize, id, setNodes]);

  const handleResize = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      const nextSize = {
        width: Math.max(MIN_EXPANDED_WIDTH, params.width ?? sizeRef.current.width),
        height: Math.max(MIN_EXPANDED_HEIGHT, params.height ?? sizeRef.current.height)
      };
      sizeRef.current = nextSize;
      setCurrentSize(nextSize);
    },
    []
  );

  const handleResizeEnd = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      const finalSize = {
        width: Math.max(MIN_EXPANDED_WIDTH, params.width ?? sizeRef.current.width),
        height: Math.max(MIN_EXPANDED_HEIGHT, params.height ?? sizeRef.current.height)
      };
      expandedSizeRef.current = finalSize;
      sizeRef.current = finalSize;
      setCurrentSize(finalSize);

      setNodes(nodes =>
        nodes.map(node => {
          if (node.id === id) {
            return { ...node, draggable: !isLocked };
          }
          return node;
        })
      );

      setIsResizing(false);
      perfMonitor.record('boundingBox.resize', 1);
    },
    [id, isLocked, perfMonitor, setNodes]
  );
  
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
    width: currentSize.width,
    height: currentSize.height,
    border: `${data.borderWidth || 2}px solid ${data.borderColor || DEFAULT_REGION_COLORS[0]}`,
    borderRadius: `${BORDER_RADIUS}px`,
    position: 'relative',
    overflow: 'visible',
    transition: isAnimating ? 'all 0.2s ease-in-out' : 'none',
    // Keep above its children enough to receive clicks for selection/resize but below other UI layers
    zIndex: selected ? 2000 : BOUNDING_BOX + 1,
    boxSizing: 'border-box',
    // Allow interactions for resize handles and header controls while keeping children draggable
    pointerEvents: 'auto'
  };
  
  // Ensure the outer React Flow node wrapper gets updated width/height.
  // React Flow uses the wrapper dimensions for hit-testing and selection,
  // so force-sync it when currentSize changes to avoid stale measurements.
  const rootRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const wrapper = rootRef.current?.closest<HTMLElement>('.react-flow__node');
    if (!wrapper) {return;}

    wrapper.style.width = `${currentSize.width}px`;
    wrapper.style.height = `${currentSize.height}px`;
    wrapper.style.minWidth = `${currentSize.width}px`;
    wrapper.style.minHeight = `${currentSize.height}px`;
  }, [currentSize]);

  return (
    <div
      ref={rootRef}
      className={`enhanced-bounding-box enhanced-bounding-box-refactored ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      style={boxStyle}
    >
      <NodeResizer
        minWidth={MIN_EXPANDED_WIDTH}
        minHeight={MIN_EXPANDED_HEIGHT}
        isVisible={selected && canResize}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        lineStyle={{ borderColor: data.borderColor || DEFAULT_REGION_COLORS[0] }}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: 2,
          border: '2px solid #fff',
          background: data.borderColor || DEFAULT_REGION_COLORS[0]
        }}
      />
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
      
    </div>
  );
};

EnhancedBoundingBox.displayName = 'EnhancedBoundingBox';

// Export for backward compatibility
export default EnhancedBoundingBox;
