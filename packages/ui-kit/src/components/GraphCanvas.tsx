/**
 * Graph Canvas component for interactive graph editing
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GraphCanvasProps } from '../types';
import { useTheme, useResponsive } from '../hooks';
import { Button } from './Button';
import { cn } from '../utils';
import { GraphNode, GraphEdge } from '@prompt-spaghetti/graph-core';

interface CanvasNode extends GraphNode {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ViewportState {
  zoom: number;
  pan: { x: number; y: number };
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  onNodeSelect,
  onNodeMove,
  onEdgeCreate,
  onEdgeDelete,
  selectedNodeId,
  readOnly = false,
  showMinimap = false,
  showControls = true,
  fitView = false,
  className,
  style,
  testId,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({ zoom: 1, pan: { x: 0, y: 0 } });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Convert graph nodes to canvas nodes with positioning
  const canvasNodes = useMemo<CanvasNode[]>(() => {
    return graph.nodes.map(node => ({
      ...node,
      position: node.position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      size: { width: 150, height: 80 },
    }));
  }, [graph.nodes]);

  // Get node by ID
  const getNodeById = useCallback(
    (nodeId: string) => {
      return canvasNodes.find(node => node.id === nodeId);
    },
    [canvasNodes]
  );

  // Transform coordinates from screen to canvas space
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      return {
        x: (screenX - rect.left - viewport.pan.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.pan.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Handle mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId?: string) => {
      e.preventDefault();

      if (nodeId && !readOnly) {
        // Start dragging node
        const node = getNodeById(nodeId);
        if (node) {
          const canvasPos = screenToCanvas(e.clientX, e.clientY);
          setDragNode(nodeId);
          setDragOffset({
            x: canvasPos.x - node.position.x,
            y: canvasPos.y - node.position.y,
          });
          onNodeSelect?.(node);
        }
      } else {
        // Start panning canvas
        setIsDragging(true);
        onNodeSelect?.(null);
      }
    },
    [readOnly, getNodeById, screenToCanvas, onNodeSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setMousePosition(canvasPos);

      if (dragNode && !readOnly) {
        // Update node position
        const newPosition = {
          x: canvasPos.x - dragOffset.x,
          y: canvasPos.y - dragOffset.y,
        };
        onNodeMove?.(dragNode, newPosition);
      } else if (isDragging) {
        // Pan canvas
        setViewport(prev => ({
          ...prev,
          pan: {
            x: prev.pan.x + e.movementX,
            y: prev.pan.y + e.movementY,
          },
        }));
      }
    },
    [dragNode, readOnly, dragOffset, isDragging, screenToCanvas, onNodeMove]
  );

  const handleMouseUp = useCallback(() => {
    setDragNode(null);
    setIsDragging(false);
    setConnectionStart(null);
  }, []);

  // Handle zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1 - e.deltaY * 0.001;
      const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * zoomFactor));

      setViewport(prev => ({
        ...prev,
        zoom: newZoom,
      }));
    },
    [viewport.zoom]
  );

  // Control functions
  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }));
  }, []);

  const resetView = useCallback(() => {
    setViewport({ zoom: 1, pan: { x: 0, y: 0 } });
  }, []);

  const fitToView = useCallback(() => {
    if (canvasNodes.length === 0) return;

    // Calculate bounds of all nodes
    const bounds = canvasNodes.reduce(
      (acc, node) => ({
        left: Math.min(acc.left, node.position.x),
        top: Math.min(acc.top, node.position.y),
        right: Math.max(acc.right, node.position.x + node.size.width),
        bottom: Math.max(acc.bottom, node.position.y + node.size.height),
      }),
      {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
      }
    );

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const contentWidth = bounds.right - bounds.left;
    const contentHeight = bounds.bottom - bounds.top;
    const padding = 50;

    const scaleX = (rect.width - padding * 2) / contentWidth;
    const scaleY = (rect.height - padding * 2) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;

    setViewport({
      zoom: scale,
      pan: {
        x: rect.width / 2 - centerX * scale,
        y: rect.height / 2 - centerY * scale,
      },
    });
  }, [canvasNodes]);

  // Fit view on mount if requested
  useEffect(() => {
    if (fitView && canvasNodes.length > 0) {
      const timer = setTimeout(fitToView, 100);
      return () => clearTimeout(timer);
    }
  }, [fitView, fitToView, canvasNodes.length]);

  // Handle connection creation
  const handleConnectionStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (readOnly) return;
      e.stopPropagation();
      setConnectionStart(nodeId);
    },
    [readOnly]
  );

  const handleConnectionEnd = useCallback(
    (targetNodeId: string, e: React.MouseEvent) => {
      if (!connectionStart || connectionStart === targetNodeId || readOnly) {
        setConnectionStart(null);
        return;
      }

      e.stopPropagation();

      // Create new edge
      onEdgeCreate?.({
        source: connectionStart,
        target: targetNodeId,
      });

      setConnectionStart(null);
    },
    [connectionStart, readOnly, onEdgeCreate]
  );

  // Get node type styles
  const getNodeTypeStyles = (nodeType: string) => {
    const baseStyles = {
      border: `2px solid ${theme.colors.border}`,
      borderRadius: `${theme.borderRadius}px`,
      background: theme.colors.surface,
      color: theme.colors.text,
    };

    switch (nodeType) {
      case 'WeightedChoice':
        return { ...baseStyles, borderColor: theme.colors.primary };
      case 'Concat':
        return { ...baseStyles, borderColor: theme.colors.secondary };
      case 'Output':
        return { ...baseStyles, borderColor: theme.colors.success };
      case 'Include':
        return { ...baseStyles, borderColor: theme.colors.info };
      case 'SetVariable':
      case 'GetVariable':
        return { ...baseStyles, borderColor: theme.colors.warning };
      default:
        return { ...baseStyles, borderColor: theme.colors.accent };
    }
  };

  const canvasStyles = {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    cursor: isDragging ? 'grabbing' : 'grab',
    ...style,
  };

  const transformStyles = {
    transform: `scale(${viewport.zoom}) translate(${viewport.pan.x / viewport.zoom}px, ${viewport.pan.y / viewport.zoom}px)`,
    transformOrigin: '0 0',
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
  };

  return (
    <div className={cn('ui-graph-canvas', className)} style={canvasStyles} data-testid={testId} {...props}>
      {/* Canvas container */}
      <div
        ref={canvasRef}
        className="ui-graph-canvas-container"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseDown={e => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Graph content */}
        <div className="ui-graph-content" style={transformStyles}>
          {/* Edges */}
          <svg
            className="ui-graph-edges"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {graph.edges.map(edge => {
              const sourceNode = getNodeById(edge.source);
              const targetNode = getNodeById(edge.target);

              if (!sourceNode || !targetNode) return null;

              const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
              const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
              const targetX = targetNode.position.x + targetNode.size.width / 2;
              const targetY = targetNode.position.y + targetNode.size.height / 2;

              return (
                <line
                  key={edge.id}
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke={theme.colors.border}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Connection line while dragging */}
            {connectionStart && (
              <line
                x1={getNodeById(connectionStart)?.position.x! + 75}
                y1={getNodeById(connectionStart)?.position.y! + 40}
                x2={mousePosition.x}
                y2={mousePosition.y}
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}

            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={theme.colors.border} />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          <div className="ui-graph-nodes" style={{ position: 'relative', zIndex: 2 }}>
            {canvasNodes.map(node => (
              <div
                key={node.id}
                className={cn('ui-graph-node', { 'ui-graph-node--selected': selectedNodeId === node.id })}
                style={{
                  position: 'absolute',
                  left: node.position.x,
                  top: node.position.y,
                  width: node.size.width,
                  height: node.size.height,
                  padding: `${theme.spacing.sm}px`,
                  cursor: readOnly ? 'pointer' : 'move',
                  ...getNodeTypeStyles(node.type),
                  ...(selectedNodeId === node.id && {
                    borderColor: theme.colors.primary,
                    boxShadow: `0 0 0 2px ${theme.colors.primary}40`,
                  }),
                }}
                onMouseDown={e => handleMouseDown(e, node.id)}
                onClick={e => {
                  e.stopPropagation();
                  onNodeSelect?.(node);
                }}
              >
                {/* Node header */}
                <div
                  style={{
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: `${theme.spacing.xs}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{node.type}</span>

                  {/* Connection handles */}
                  {!readOnly && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div
                        className="ui-connection-handle ui-connection-handle--output"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.success,
                          cursor: 'crosshair',
                        }}
                        onMouseDown={e => handleConnectionStart(node.id, e)}
                      />
                      <div
                        className="ui-connection-handle ui-connection-handle--input"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.info,
                          cursor: 'crosshair',
                        }}
                        onMouseUp={e => handleConnectionEnd(node.id, e)}
                      />
                    </div>
                  )}
                </div>

                {/* Node content */}
                <div
                  style={{
                    fontSize: `${theme.typography.fontSize.xs}px`,
                    color: theme.colors.textSecondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {node.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div
          className="ui-graph-controls"
          style={{
            position: 'absolute',
            top: `${theme.spacing.md}px`,
            right: `${theme.spacing.md}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${theme.spacing.xs}px`,
            zIndex: 10,
          }}
        >
          <Button variant="outline" size="sm" onClick={zoomIn}>
            🔍+
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            🔍-
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            🎯
          </Button>
          <Button variant="outline" size="sm" onClick={fitToView}>
            📐
          </Button>
        </div>
      )}

      {/* Minimap */}
      {showMinimap && !isMobile && (
        <div
          className="ui-graph-minimap"
          style={{
            position: 'absolute',
            bottom: `${theme.spacing.md}px`,
            right: `${theme.spacing.md}px`,
            width: '200px',
            height: '150px',
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: `${theme.borderRadius}px`,
            zIndex: 10,
          }}
        >
          {/* Minimap implementation would go here */}
          <div
            style={{
              padding: `${theme.spacing.sm}px`,
              fontSize: `${theme.typography.fontSize.xs}px`,
              color: theme.colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Minimap
            <br />
            Zoom: {Math.round(viewport.zoom * 100)}%
          </div>
        </div>
      )}

      {/* Status info */}
      <div
        className="ui-graph-status"
        style={{
          position: 'absolute',
          bottom: `${theme.spacing.md}px`,
          left: `${theme.spacing.md}px`,
          padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: `${theme.borderRadius}px`,
          fontSize: `${theme.typography.fontSize.xs}px`,
          color: theme.colors.textSecondary,
          zIndex: 10,
        }}
      >
        Nodes: {canvasNodes.length} | Edges: {graph.edges.length} | Zoom: {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
};

// Legacy default export for backward compatibility
export default GraphCanvas;
