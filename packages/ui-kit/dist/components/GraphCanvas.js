import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Graph Canvas component for interactive graph editing
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTheme, useResponsive } from '../hooks';
import { Button } from './Button';
import { cn } from '../utils';
export const GraphCanvas = ({
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
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Convert graph nodes to canvas nodes with positioning
  const canvasNodes = useMemo(() => {
    return graph.nodes.map(node => ({
      ...node,
      position: node.position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      size: { width: 150, height: 80 },
    }));
  }, [graph.nodes]);
  // Get node by ID
  const getNodeById = useCallback(
    nodeId => {
      return canvasNodes.find(node => node.id === nodeId);
    },
    [canvasNodes]
  );
  // Transform coordinates from screen to canvas space
  const screenToCanvas = useCallback(
    (screenX, screenY) => {
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
    (e, nodeId) => {
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
    e => {
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
    e => {
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
    (nodeId, e) => {
      if (readOnly) return;
      e.stopPropagation();
      setConnectionStart(nodeId);
    },
    [readOnly]
  );
  const handleConnectionEnd = useCallback(
    (targetNodeId, e) => {
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
  const getNodeTypeStyles = nodeType => {
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
    position: 'relative',
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
    position: 'absolute',
  };
  return _jsxs('div', {
    className: cn('ui-graph-canvas', className),
    style: canvasStyles,
    'data-testid': testId,
    ...props,
    children: [
      _jsx('div', {
        ref: canvasRef,
        className: 'ui-graph-canvas-container',
        style: {
          width: '100%',
          height: '100%',
          position: 'relative',
          userSelect: 'none',
        },
        onMouseDown: e => handleMouseDown(e),
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        onWheel: handleWheel,
        children: _jsxs('div', {
          className: 'ui-graph-content',
          style: transformStyles,
          children: [
            _jsxs('svg', {
              className: 'ui-graph-edges',
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
              },
              children: [
                graph.edges.map(edge => {
                  const sourceNode = getNodeById(edge.source);
                  const targetNode = getNodeById(edge.target);
                  if (!sourceNode || !targetNode) return null;
                  const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
                  const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
                  const targetX = targetNode.position.x + targetNode.size.width / 2;
                  const targetY = targetNode.position.y + targetNode.size.height / 2;
                  return _jsx(
                    'line',
                    {
                      x1: sourceX,
                      y1: sourceY,
                      x2: targetX,
                      y2: targetY,
                      stroke: theme.colors.border,
                      strokeWidth: '2',
                      markerEnd: 'url(#arrowhead)',
                    },
                    edge.id
                  );
                }),
                connectionStart &&
                  _jsx('line', {
                    x1: getNodeById(connectionStart)?.position.x + 75,
                    y1: getNodeById(connectionStart)?.position.y + 40,
                    x2: mousePosition.x,
                    y2: mousePosition.y,
                    stroke: theme.colors.primary,
                    strokeWidth: '2',
                    strokeDasharray: '5,5',
                  }),
                _jsx('defs', {
                  children: _jsx('marker', {
                    id: 'arrowhead',
                    markerWidth: '10',
                    markerHeight: '7',
                    refX: '9',
                    refY: '3.5',
                    orient: 'auto',
                    children: _jsx('polygon', { points: '0 0, 10 3.5, 0 7', fill: theme.colors.border }),
                  }),
                }),
              ],
            }),
            _jsx('div', {
              className: 'ui-graph-nodes',
              style: { position: 'relative', zIndex: 2 },
              children: canvasNodes.map(node =>
                _jsxs(
                  'div',
                  {
                    className: cn('ui-graph-node', { 'ui-graph-node--selected': selectedNodeId === node.id }),
                    style: {
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
                    },
                    onMouseDown: e => handleMouseDown(e, node.id),
                    onClick: e => {
                      e.stopPropagation();
                      onNodeSelect?.(node);
                    },
                    children: [
                      _jsxs('div', {
                        style: {
                          fontSize: `${theme.typography.fontSize.sm}px`,
                          fontWeight: theme.typography.fontWeight.medium,
                          marginBottom: `${theme.spacing.xs}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                        children: [
                          _jsx('span', { children: node.type }),
                          !readOnly &&
                            _jsxs('div', {
                              style: { display: 'flex', gap: '4px' },
                              children: [
                                _jsx('div', {
                                  className: 'ui-connection-handle ui-connection-handle--output',
                                  style: {
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: theme.colors.success,
                                    cursor: 'crosshair',
                                  },
                                  onMouseDown: e => handleConnectionStart(node.id, e),
                                }),
                                _jsx('div', {
                                  className: 'ui-connection-handle ui-connection-handle--input',
                                  style: {
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: theme.colors.info,
                                    cursor: 'crosshair',
                                  },
                                  onMouseUp: e => handleConnectionEnd(node.id, e),
                                }),
                              ],
                            }),
                        ],
                      }),
                      _jsx('div', {
                        style: {
                          fontSize: `${theme.typography.fontSize.xs}px`,
                          color: theme.colors.textSecondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                        children: node.id,
                      }),
                    ],
                  },
                  node.id
                )
              ),
            }),
          ],
        }),
      }),
      showControls &&
        _jsxs('div', {
          className: 'ui-graph-controls',
          style: {
            position: 'absolute',
            top: `${theme.spacing.md}px`,
            right: `${theme.spacing.md}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${theme.spacing.xs}px`,
            zIndex: 10,
          },
          children: [
            _jsx(Button, { variant: 'outline', size: 'sm', onClick: zoomIn, children: '\uD83D\uDD0D+' }),
            _jsx(Button, { variant: 'outline', size: 'sm', onClick: zoomOut, children: '\uD83D\uDD0D-' }),
            _jsx(Button, { variant: 'outline', size: 'sm', onClick: resetView, children: '\uD83C\uDFAF' }),
            _jsx(Button, { variant: 'outline', size: 'sm', onClick: fitToView, children: '\uD83D\uDCD0' }),
          ],
        }),
      showMinimap &&
        !isMobile &&
        _jsx('div', {
          className: 'ui-graph-minimap',
          style: {
            position: 'absolute',
            bottom: `${theme.spacing.md}px`,
            right: `${theme.spacing.md}px`,
            width: '200px',
            height: '150px',
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: `${theme.borderRadius}px`,
            zIndex: 10,
          },
          children: _jsxs('div', {
            style: {
              padding: `${theme.spacing.sm}px`,
              fontSize: `${theme.typography.fontSize.xs}px`,
              color: theme.colors.textSecondary,
              textAlign: 'center',
            },
            children: ['Minimap', _jsx('br', {}), 'Zoom: ', Math.round(viewport.zoom * 100), '%'],
          }),
        }),
      _jsxs('div', {
        className: 'ui-graph-status',
        style: {
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
        },
        children: [
          'Nodes: ',
          canvasNodes.length,
          ' | Edges: ',
          graph.edges.length,
          ' | Zoom: ',
          Math.round(viewport.zoom * 100),
          '%',
        ],
      }),
    ],
  });
};
// Legacy default export for backward compatibility
export default GraphCanvas;
//# sourceMappingURL=GraphCanvas.js.map
