/**
 * EnhancedBoundingBox Component - Refactored Version
 * Main container component that orchestrates all sub-components and hooks.
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo
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
  const [showColorPicker, setShowColorPicker] = useState(false);
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
  // Uses sizeRef as fallback so absent data.width/height never overwrites
  // a manually-resized size with DEFAULT values.
  useEffect(() => {
    if (isAnimating || isResizing || isCollapsed) {
      return;
    }

    const nextWidth = data.width || sizeRef.current.width;
    const nextHeight = data.height || sizeRef.current.height;
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

  // After a collapse/expand size animation settles, re-assert member visibility.
  // The animation drives a React Flow dimension re-render that can clobber the
  // members' `hidden` state — leaving an expanded region visually empty ("open
  // the region and the nodes are gone"). Running once the animation finishes
  // (no more dimension churn) makes this correction stick.
  const wasAnimatingRef = useRef(isAnimating);
  useEffect(() => {
    const justFinished = wasAnimatingRef.current && !isAnimating;
    wasAnimatingRef.current = isAnimating;
    if (!justFinished) {
      return;
    }
    setNodes(nodes => {
      const boxNode = nodes.find(n => n.id === id);
      if (!boxNode) {
        return nodes;
      }
      const bx = boxNode.position?.x ?? xPos ?? 0;
      const by = boxNode.position?.y ?? yPos ?? 0;
      const bw =
        expandedSizeRef.current.width ||
        (boxNode.data?.width as number) ||
        DEFAULT_WIDTH;
      const bh =
        expandedSizeRef.current.height ||
        (boxNode.data?.height as number) ||
        DEFAULT_HEIGHT;
      const storedIds = new Set<string>(
        (boxNode.data?.collapsedNodeIds as string[] | undefined) || []
      );
      let changed = false;
      const next = nodes.map(node => {
        if (node.id === id) {
          // Keep the box's own collapsed flag consistent with the rendered state.
          if (Boolean(node.data?.isCollapsed) !== isCollapsed) {
            changed = true;
            return {
              ...node,
              data: {
                ...node.data,
                isCollapsed,
                collapsedNodeIds: isCollapsed
                  ? node.data?.collapsedNodeIds
                  : undefined
              }
            };
          }
          return node;
        }
        const isContainer =
          node.type === 'enhancedBoundingBox' ||
          node.type === 'boundingBox' ||
          node.type === 'fragmentContainer';
        if (isContainer) {
          return node;
        }
        const directParent = (node as { parentNode?: string }).parentNode;
        const dataParent = (node.data as { parentNode?: string } | undefined)
          ?.parentNode;
        let isMember =
          directParent === id || dataParent === id || storedIds.has(node.id);
        if (!isMember) {
          const nx = node.position?.x ?? 0;
          const ny = node.position?.y ?? 0;
          const nw = node.width ?? 0;
          const nh = node.height ?? 0;
          isMember =
            nx >= bx - 1 &&
            nx + nw <= bx + bw + 1 &&
            ny >= by - 1 &&
            ny + nh <= by + bh + 1;
        }
        if (isMember && Boolean(node.hidden) !== isCollapsed) {
          changed = true;
          return { ...node, hidden: isCollapsed };
        }
        return node;
      });
      return changed ? next : nodes;
    });
  }, [isAnimating, isCollapsed, id, xPos, yPos, setNodes]);

  // Keep React Flow internals in sync with the rendered size (both initial load and during resize)
  useEffect(() => {
    if (isResizing) {
      return;
    }

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
  }, [currentSize, id, isResizing, setNodes, updateNodeInternals]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, isCollapsed, containedNodes.length, updateNodeInternals]);

  useEffect(() => {
    if (!selected) {
      setShowColorPicker(false);
    }
  }, [selected]);

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
    perfMonitor.record('boundingBox.toggleCollapse', 1);

    const restoredSize = {
      width: Math.max(
        MIN_EXPANDED_WIDTH,
        expandedSizeRef.current.width || data.width || DEFAULT_WIDTH
      ),
      height: Math.max(
        MIN_EXPANDED_HEIGHT,
        expandedSizeRef.current.height || data.height || DEFAULT_HEIGHT
      )
    };
    if (!newCollapsed) {
      sizeRef.current = restoredSize;
      setCurrentSize(restoredSize);
    }

    // Resolve members from the CURRENT nodes: explicit parent links, the stored
    // collapsed list, and geometric containment within the expanded bounds.
    const liveNodes = getNodes();
    const boxNode = liveNodes.find(n => n.id === id);
    const boxX = boxNode?.position?.x ?? xPos ?? 0;
    const boxY = boxNode?.position?.y ?? yPos ?? 0;
    const storedIds = new Set<string>(
      (boxNode?.data?.collapsedNodeIds as string[] | undefined) || []
    );
    const memberIds = new Set<string>();
    for (const node of liveNodes) {
      if (node.id === id) {
        continue;
      }
      const isContainer =
        node.type === 'enhancedBoundingBox' ||
        node.type === 'boundingBox' ||
        node.type === 'fragmentContainer';
      if (isContainer) {
        continue;
      }
      const directParent = (node as { parentNode?: string }).parentNode;
      const dataParent = (node.data as { parentNode?: string } | undefined)
        ?.parentNode;
      if (directParent === id || dataParent === id || storedIds.has(node.id)) {
        memberIds.add(node.id);
        continue;
      }
      const nx = node.position?.x ?? 0;
      const ny = node.position?.y ?? 0;
      const nw = node.width ?? 0;
      const nh = node.height ?? 0;
      if (
        nx >= boxX - 1 &&
        nx + nw <= boxX + restoredSize.width + 1 &&
        ny >= boxY - 1 &&
        ny + nh <= boxY + restoredSize.height + 1
      ) {
        memberIds.add(node.id);
      }
    }
    const memberList = Array.from(memberIds);
    const targetW = newCollapsed ? COLLAPSED_WIDTH : restoredSize.width;
    const targetH = newCollapsed ? COLLAPSED_HEIGHT : restoredSize.height;

    // Idempotent toggle: hide/show members + resize the box together.
    const applyToggle = (nodes: typeof liveNodes) =>
      nodes.map(node => {
        if (memberIds.has(node.id)) {
          return Boolean(node.hidden) === newCollapsed
            ? node
            : { ...node, hidden: newCollapsed };
        }
        if (node.id === id) {
          return {
            ...node,
            width: targetW,
            height: targetH,
            measured: { width: targetW, height: targetH },
            style: { ...(node.style ?? {}), width: targetW, height: targetH },
            data: {
              ...node.data,
              isCollapsed: newCollapsed,
              collapsedNodeIds: newCollapsed ? memberList : undefined,
              ...(newCollapsed
                ? {}
                : { width: restoredSize.width, height: restoredSize.height })
            }
          };
        }
        return node;
      });

    setNodes(applyToggle);
    recalculate();

    // The expand re-render (size animation) can clobber the members' hidden
    // state, leaving children stuck hidden ("open the region and the nodes are
    // gone"). Re-assert the toggle on the next frame so it always wins.
    requestAnimationFrame(() => {
      setNodes(applyToggle);
      updateNodeInternals(id);
      memberList.forEach(childId => updateNodeInternals(childId));
    });
  }, [
    isCollapsed,
    data.height,
    data.width,
    getNodes,
    id,
    perfMonitor,
    recalculate,
    setNodes,
    updateNodeInternals,
    xPos,
    yPos
  ]);

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

  const handleColorChange = useCallback(
    (color: string) => {
      setNodes(nodes =>
        nodes.map(node =>
          node.id === id
            ? {
              ...node,
              data: {
                ...node.data,
                backgroundColor: color,
                borderColor: color
              }
            }
            : node
        )
      );
      setShowColorPicker(false);
    },
    [id, setNodes]
  );

  const handleOpacityChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const opacity = Number(event.target.value);
      setNodes(nodes =>
        nodes.map(node =>
          node.id === id
            ? {
              ...node,
              data: {
                ...node.data,
                opacity
              }
            }
            : node
        )
      );
    },
    [id, setNodes]
  );

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

        setNodes(nodes =>
          nodes.map(node =>
            node.id === id
              ? {
                ...node,
                width: finalSize.width,
                height: finalSize.height,
                measured: {
                  width: finalSize.width,
                  height: finalSize.height
                },
                style: {
                  ...(node.style ?? {}),
                  width: finalSize.width,
                  height: finalSize.height
                },
                data: {
                  ...node.data,
                  width: finalSize.width,
                  height: finalSize.height
                }
              }
              : node
          )
        );
        updateNodeInternals(id);
        setIsResizing(false);
        perfMonitor.record('boundingBox.resize', 1);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp);
    },
    [canResize, id, perfMonitor, setNodes, updateNodeInternals, xPos, yPos]
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
  const effectiveSize = useMemo(
    () =>
      isCollapsed
        ? { width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }
        : currentSize,
    [currentSize, isCollapsed]
  );

  const boxStyle: React.CSSProperties = {
    width: effectiveSize.width,
    height: effectiveSize.height,
    minWidth: effectiveSize.width,
    minHeight: effectiveSize.height,
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
    background: 'rgba(24, 144, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    zIndex: 2300,
    pointerEvents: 'auto',
    touchAction: 'none',
    userSelect: 'none',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.28)'
  };

  // Ensure the outer React Flow node wrapper gets updated width/height.
  // React Flow uses the wrapper dimensions for hit-testing and selection,
  // so force-sync it when currentSize changes to avoid stale measurements.
  useLayoutEffect(() => {
    const wrapper = rootRef.current?.closest<HTMLElement>('.react-flow__node');
    if (!wrapper) { return; }

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
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, top: -4, left: -4, width: 8, height: 8, cursor: 'nwse-resize' }} onMouseDown={event => startResize('nw', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, top: -4, right: -4, width: 8, height: 8, cursor: 'nesw-resize' }} onMouseDown={event => startResize('ne', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, bottom: -4, left: -4, width: 8, height: 8, cursor: 'nesw-resize' }} onMouseDown={event => startResize('sw', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, bottom: -4, right: -4, width: 8, height: 8, cursor: 'nwse-resize' }} onMouseDown={event => startResize('se', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, top: -3, left: '50%', transform: 'translateX(-50%)', width: 28, height: 6, cursor: 'ns-resize' }} onMouseDown={event => startResize('n', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, bottom: -3, left: '50%', transform: 'translateX(-50%)', width: 28, height: 6, cursor: 'ns-resize' }} onMouseDown={event => startResize('s', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, right: -3, top: '50%', transform: 'translateY(-50%)', width: 6, height: 28, cursor: 'ew-resize' }} onMouseDown={event => startResize('e', event)} />
          <div className="ebb-resize-handle nodrag nopan" style={{ ...handleBaseStyle, left: -3, top: '50%', transform: 'translateY(-50%)', width: 6, height: 28, cursor: 'ew-resize' }} onMouseDown={event => startResize('w', event)} />
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
            Math.max(data.opacity || 0.3, 0.15)
          ),
          border: '2px dashed rgba(255, 100, 100, 0.8)',
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

      {selected && !isCollapsed && (
        <div
          className="bounding-box-controls nodrag nopan"
          style={{
            position: 'absolute',
            top: '40px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 2200
          }}
        >
          <div className="color-picker-container" style={{ position: 'relative' }}>
            <button
              className="color-picker-button nodrag nopan"
              onClick={event => {
                event.stopPropagation();
                setShowColorPicker(current => !current);
              }}
              onMouseDown={event => event.stopPropagation()}
              title="Region color"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.35)',
                backgroundColor: data.backgroundColor || DEFAULT_REGION_COLORS[0],
                cursor: 'pointer',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.25)'
              }}
            />
            {showColorPicker && (
              <div
                className="color-picker-dropdown nodrag nopan"
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 18px)',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(20, 20, 20, 0.96)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.35)'
                }}
              >
                {DEFAULT_REGION_COLORS.map(color => (
                  <button
                    key={color}
                    className="color-option nodrag nopan"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.22)',
                      backgroundColor: color,
                      cursor: 'pointer'
                    }}
                    onClick={event => {
                      event.stopPropagation();
                      handleColorChange(color);
                    }}
                    onMouseDown={event => event.stopPropagation()}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={data.opacity || 0.3}
            onChange={handleOpacityChange}
            onMouseDown={event => event.stopPropagation()}
            className="nodrag nopan"
            title="Region opacity"
            style={{ width: '72px' }}
          />
        </div>
      )}

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
