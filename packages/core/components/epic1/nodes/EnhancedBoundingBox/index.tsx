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
  useUpdateNodeInternals
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
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  // Follow collapse animation frames, but do not overwrite manual resize updates.
  useEffect(() => {
    if (!isAnimating) {
      return;
    }
    sizeRef.current = size;
    setCurrentSize(size);
  }, [isAnimating, size]);

  // Sync externally-provided dimensions into local resize state when the node
  // is updated by import/drop logic rather than manual pointer resizing.
  useEffect(() => {
    if (isAnimating || isResizing || isCollapsed) {
      return;
    }

    const nextWidth = data.width || DEFAULT_WIDTH;
    const nextHeight = data.height || DEFAULT_HEIGHT;
    if (
      nextWidth === sizeRef.current.width &&
      nextHeight === sizeRef.current.height
    ) {
      return;
    }

    const nextSize = { width: nextWidth, height: nextHeight };
    expandedSizeRef.current = nextSize;
    sizeRef.current = nextSize;
    setCurrentSize(nextSize);
  }, [
    data.height,
    data.width,
    isAnimating,
    isCollapsed,
    isResizing
  ]);

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
          measured: {
            width: currentSize.width,
            height: currentSize.height
          },
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

  // Recovery guard: some environments can leave the node wrapper non-draggable
  // if a resize end callback is missed. Keep unlocked boxes draggable.
  useEffect(() => {
    if (isLocked) {
      return;
    }
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id && node.draggable === false
          ? { ...node, draggable: true }
          : node
      )
    );
  }, [id, isLocked, setNodes]);

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

  const canResize = !isCollapsed && !isLocked;

  const startResize = useCallback(
    (
      direction: 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw',
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      if (!canResize) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = sizeRef.current.width;
      const startHeight = sizeRef.current.height;
      const startPosX = xPos;
      const startPosY = yPos;

      setIsResizing(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let nextWidth = startWidth;
        let nextHeight = startHeight;
        let nextPosX = startPosX;
        let nextPosY = startPosY;

        if (direction.includes('e')) {
          nextWidth = Math.max(MIN_EXPANDED_WIDTH, startWidth + dx);
        }
        if (direction.includes('w')) {
          nextWidth = Math.max(MIN_EXPANDED_WIDTH, startWidth - dx);
          nextPosX = startPosX + (startWidth - nextWidth);
        }
        if (direction.includes('s')) {
          nextHeight = Math.max(MIN_EXPANDED_HEIGHT, startHeight + dy);
        }
        if (direction.includes('n')) {
          nextHeight = Math.max(MIN_EXPANDED_HEIGHT, startHeight - dy);
          nextPosY = startPosY + (startHeight - nextHeight);
        }

        const nextSize = { width: nextWidth, height: nextHeight };
        sizeRef.current = nextSize;
        setCurrentSize(nextSize);

        setNodes(nodes =>
          nodes.map(node =>
            node.id === id
              ? {
                  ...node,
                  position: { x: nextPosX, y: nextPosY }
                }
              : node
          )
        );
      };

      const onMouseUp = () => {
        const finalSize = {
          width: Math.max(MIN_EXPANDED_WIDTH, sizeRef.current.width),
          height: Math.max(MIN_EXPANDED_HEIGHT, sizeRef.current.height)
        };
        expandedSizeRef.current = finalSize;
        sizeRef.current = finalSize;
        setCurrentSize(finalSize);

        setIsResizing(false);
        perfMonitor.record('boundingBox.resize', 1);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp);
    },
    [canResize, id, perfMonitor, setNodes, xPos, yPos]
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
  const effectiveSize = isCollapsed
    ? { width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }
    : currentSize;

  const boxStyle: React.CSSProperties = {
    width: effectiveSize.width,
    height: effectiveSize.height,
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

  const handleBaseStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(24, 144, 255, 0.9)',
    border: '1px solid #fff',
    borderRadius: 2,
    zIndex: 2300,
    pointerEvents: 'auto',
    touchAction: 'none',
    userSelect: 'none'
  };

  // Ensure the outer React Flow node wrapper gets updated width/height.
  // React Flow uses the wrapper dimensions for hit-testing and selection,
  // so force-sync it when currentSize changes to avoid stale measurements.
  useLayoutEffect(() => {
    const wrapper = rootRef.current?.closest<HTMLElement>('.react-flow__node');
    if (!wrapper) {return;}

    // React Flow may rewrite these dimensions from cached measurements.
    // Use priority here so manual resize/collapse state remains visible.
    wrapper.style.setProperty('width', `${effectiveSize.width}px`, 'important');
    wrapper.style.setProperty(
      'height',
      `${effectiveSize.height}px`,
      'important'
    );
    wrapper.style.setProperty(
      'min-width',
      `${effectiveSize.width}px`,
      'important'
    );
    wrapper.style.setProperty(
      'min-height',
      `${effectiveSize.height}px`,
      'important'
    );
    wrapper.style.setProperty(
      'max-width',
      `${effectiveSize.width}px`,
      'important'
    );
    wrapper.style.setProperty(
      'max-height',
      `${effectiveSize.height}px`,
      'important'
    );
  }, [effectiveSize]);

  return (
    <div
      ref={rootRef}
      className={`enhanced-bounding-box enhanced-bounding-box-refactored ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      style={boxStyle}
    >
      {selected && canResize && (
        <>
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, top: -6, left: -6, width: 12, height: 12, cursor: 'nwse-resize' }} onMouseDown={event => startResize('nw', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, top: -6, right: -6, width: 12, height: 12, cursor: 'nesw-resize' }} onMouseDown={event => startResize('ne', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, bottom: -6, left: -6, width: 12, height: 12, cursor: 'nesw-resize' }} onMouseDown={event => startResize('sw', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, bottom: -6, right: -6, width: 12, height: 12, cursor: 'nwse-resize' }} onMouseDown={event => startResize('se', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, top: -5, left: '50%', transform: 'translateX(-50%)', width: 44, height: 10, cursor: 'ns-resize' }} onMouseDown={event => startResize('n', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 44, height: 10, cursor: 'ns-resize' }} onMouseDown={event => startResize('s', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, right: -5, top: '50%', transform: 'translateY(-50%)', width: 10, height: 44, cursor: 'ew-resize' }} onMouseDown={event => startResize('e', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, left: -5, top: '50%', transform: 'translateY(-50%)', width: 10, height: 44, cursor: 'ew-resize' }} onMouseDown={event => startResize('w', event)} />
        </>
      )}
      {isResizing && (
        <div className="enhanced-bounding-box-size-badge nodrag">
          {Math.round(currentSize.width)} x {Math.round(currentSize.height)}
        </div>
      )}
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
