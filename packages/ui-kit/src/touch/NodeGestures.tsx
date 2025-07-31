/**
 * Touch gestures for node manipulation in graph editor
 */

import React, { useRef, useEffect, useState } from 'react';
import { GraphNode, GraphEdge } from '@prompt-spaghetti/graph-core';
import { TouchManager } from './TouchManager';
import { GestureEvent } from './gestures';
import { touchTargetUtils } from './accessibility';
import { VisualFeedback } from './feedback';
import { TOUCH_TARGETS } from '../mobile/design-system';

export interface NodeGestureHandlers {
  onNodeSelect?: (nodeId: string, multiSelect: boolean) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeEdit?: (nodeId: string) => void;
  onNodeConnect?: (sourceId: string, targetId: string) => void;
  onNodeContextMenu?: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasPan?: (delta: { x: number; y: number }) => void;
  onCanvasZoom?: (scale: number, center: { x: number; y: number }) => void;
  onSelectionBox?: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

export interface TouchableNodeProps {
  node: GraphNode;
  isSelected: boolean;
  canConnect: boolean;
  handlers: NodeGestureHandlers;
  children: React.ReactNode;
}

/**
 * Touchable node wrapper with gesture support
 */
export const TouchableNode: React.FC<TouchableNodeProps> = ({ node, isSelected, canConnect, handlers, children }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!nodeRef.current) return;

    // Ensure accessible touch target
    touchTargetUtils.ensureMinimumSize(nodeRef.current, TOUCH_TARGETS.large);

    const touchManager = new TouchManager({
      element: nodeRef.current,
      handlers: {
        tap: (e: GestureEvent) => {
          handlers.onNodeSelect?.(node.id, e.touches.length > 1);

          // Visual feedback for selection
          VisualFeedback.trigger(nodeRef.current!, {
            enabled: true,
            type: 'highlight',
            duration: 200,
            color: 'var(--color-primary)',
          });
        },

        doubleTap: (e: GestureEvent) => {
          handlers.onNodeEdit?.(node.id);
        },

        longPress: (e: GestureEvent) => {
          handlers.onNodeContextMenu?.(node.id, e.center);
        },

        drag: (e: GestureEvent) => {
          if (!dragStartPos.current) {
            dragStartPos.current = {
              x: node.position?.x || 0,
              y: node.position?.y || 0,
            };
            setIsDragging(true);
          }

          const newPosition = {
            x: dragStartPos.current.x + e.deltaX,
            y: dragStartPos.current.y + e.deltaY,
          };

          handlers.onNodeMove?.(node.id, newPosition);
        },
      },
    });

    // Handle drag end
    const handleDragEnd = () => {
      dragStartPos.current = null;
      setIsDragging(false);
      setIsConnecting(false);
    };

    nodeRef.current.addEventListener('touchend', handleDragEnd);
    nodeRef.current.addEventListener('mouseup', handleDragEnd);

    return () => {
      touchManager.destroy();
      nodeRef.current?.removeEventListener('touchend', handleDragEnd);
      nodeRef.current?.removeEventListener('mouseup', handleDragEnd);
    };
  }, [node, handlers]);

  return (
    <div
      ref={nodeRef}
      className={`touchable-node ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: node.position?.x || 0,
        top: node.position?.y || 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
      }}
    >
      {children}

      {/* Connection handles */}
      {canConnect && (
        <>
          <ConnectionHandle type="input" nodeId={node.id} onConnect={handlers.onNodeConnect} />
          <ConnectionHandle type="output" nodeId={node.id} onConnect={handlers.onNodeConnect} />
        </>
      )}
    </div>
  );
};

/**
 * Connection handle for creating edges
 */
interface ConnectionHandleProps {
  type: 'input' | 'output';
  nodeId: string;
  onConnect?: (sourceId: string, targetId: string) => void;
}

const ConnectionHandle: React.FC<ConnectionHandleProps> = ({ type, nodeId, onConnect }) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionLine = useRef<HTMLDivElement | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!handleRef.current) return;

    const touchManager = new TouchManager({
      element: handleRef.current,
      config: {
        preventDefault: true,
        longPressDelay: 300,
      },
      handlers: {
        drag: (e: GestureEvent) => {
          if (!isConnecting) {
            setIsConnecting(true);
            startPos.current = e.center;
            createConnectionLine();
          }

          updateConnectionLine(e.center);
        },
      },
    });

    return () => touchManager.destroy();
  }, []);

  const createConnectionLine = () => {
    const line = document.createElement('div');
    line.className = 'connection-line';
    line.style.cssText = `
      position: fixed;
      background: var(--color-primary);
      height: 2px;
      transform-origin: left center;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(line);
    connectionLine.current = line;
  };

  const updateConnectionLine = (endPos: { x: number; y: number }) => {
    if (!connectionLine.current || !startPos.current) return;

    const dx = endPos.x - startPos.current.x;
    const dy = endPos.y - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    connectionLine.current.style.left = `${startPos.current.x}px`;
    connectionLine.current.style.top = `${startPos.current.y}px`;
    connectionLine.current.style.width = `${distance}px`;
    connectionLine.current.style.transform = `rotate(${angle}deg)`;
  };

  const endConnection = (e: TouchEvent | MouseEvent) => {
    if (!isConnecting) return;

    // Find target node handle
    const point = e instanceof TouchEvent ? e.changedTouches[0] : e;
    const target = document.elementFromPoint(point.clientX, point.clientY);

    if (target && target.classList.contains('connection-handle')) {
      const targetNodeId = target.getAttribute('data-node-id');
      const targetType = target.getAttribute('data-handle-type');

      if (targetNodeId && targetType !== type) {
        if (type === 'output') {
          onConnect?.(nodeId, targetNodeId);
        } else {
          onConnect?.(targetNodeId, nodeId);
        }
      }
    }

    // Clean up
    connectionLine.current?.remove();
    connectionLine.current = null;
    setIsConnecting(false);
    startPos.current = null;
  };

  useEffect(() => {
    document.addEventListener('touchend', endConnection);
    document.addEventListener('mouseup', endConnection);

    return () => {
      document.removeEventListener('touchend', endConnection);
      document.removeEventListener('mouseup', endConnection);
    };
  }, [isConnecting]);

  return (
    <div
      ref={handleRef}
      className={`connection-handle ${type}`}
      data-node-id={nodeId}
      data-handle-type={type}
      style={{
        position: 'absolute',
        [type === 'input' ? 'left' : 'right']: -8,
        top: '50%',
        transform: 'translateY(-50%)',
        width: TOUCH_TARGETS.minimum,
        height: TOUCH_TARGETS.minimum,
        borderRadius: '50%',
        backgroundColor: isConnecting ? 'var(--color-primary)' : 'var(--color-border)',
        border: '2px solid var(--color-background)',
        cursor: 'crosshair',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        transition: 'background-color 0.2s, transform 0.2s',
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: 'var(--color-background)',
        }}
      />
    </div>
  );
};

/**
 * Multi-select gesture handler
 */
export interface SelectionBoxProps {
  onSelect: (nodeIds: string[]) => void;
  nodes: GraphNode[];
  children: React.ReactNode;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ onSelect, nodes, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionBounds, setSelectionBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const touchManager = new TouchManager({
      element: containerRef.current,
      config: {
        panThreshold: 20,
      },
      handlers: {
        pan: (e: GestureEvent) => {
          if (!startPos.current) {
            startPos.current = {
              x: e.center.x - e.deltaX,
              y: e.center.y - e.deltaY,
            };
          }

          const bounds = {
            x: Math.min(startPos.current.x, e.center.x),
            y: Math.min(startPos.current.y, e.center.y),
            width: Math.abs(e.center.x - startPos.current.x),
            height: Math.abs(e.center.y - startPos.current.y),
          };

          setSelectionBounds(bounds);

          // Find nodes within bounds
          const selectedNodeIds = nodes
            .filter(node => {
              if (!node.position) return false;

              return (
                node.position.x >= bounds.x &&
                node.position.x <= bounds.x + bounds.width &&
                node.position.y >= bounds.y &&
                node.position.y <= bounds.y + bounds.height
              );
            })
            .map(node => node.id);

          onSelect(selectedNodeIds);
        },
      },
    });

    const handleEnd = () => {
      setSelectionBounds(null);
      startPos.current = null;
    };

    containerRef.current.addEventListener('touchend', handleEnd);
    containerRef.current.addEventListener('mouseup', handleEnd);

    return () => {
      touchManager.destroy();
      containerRef.current?.removeEventListener('touchend', handleEnd);
      containerRef.current?.removeEventListener('mouseup', handleEnd);
    };
  }, [nodes, onSelect]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}

      {selectionBounds && (
        <div
          className="selection-box"
          style={{
            position: 'absolute',
            left: selectionBounds.x,
            top: selectionBounds.y,
            width: selectionBounds.width,
            height: selectionBounds.height,
            border: '2px dashed var(--color-primary)',
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
};
