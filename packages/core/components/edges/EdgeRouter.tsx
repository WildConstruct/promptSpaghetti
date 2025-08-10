/**
 * Custom edge component with routing and control points
 * Story 1.28: Advanced Edge Routing
 * Integrated with Story 0.1: Performance Infrastructure
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow
} from 'reactflow';
import { RoutedEdge, ControlPoint, EdgeRoutingAlgorithm } from '../../types/edgeRouting';
import { usePerformance } from '../../hooks/usePerformance';

interface EdgeRouterProps extends EdgeProps {
  data?: {
    routing?: {
      algorithm?: EdgeRoutingAlgorithm;
      showControlPoints?: boolean;
      animated?: boolean;
      label?: string;
    };
    onControlPointMove?: (edgeId: string, pointId: string, position: { x: number; y: number }) => void;
    performanceMetrics?: {
      calculationTime?: number;
      cacheHit?: boolean;
    };
  };
}

/**
 * Custom edge component with advanced routing
 */
const EdgeRouter: React.FC<EdgeRouterProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected
}) => {
  const { perfMonitor } = usePerformance();
  const { getEdge, setEdges } = useReactFlow();
  
  const [isDraggingControl, setIsDraggingControl] = useState(false);
  const [activeControlPoint, setActiveControlPoint] = useState<string | null>(null);
  const [localControlPoints, setLocalControlPoints] = useState<ControlPoint[]>([]);
  
  // Get the edge's calculated path
  const edge = getEdge(id) as RoutedEdge | undefined;
  const calculatedPath = edge?.calculatedPath;
  
  // Use calculated path or fall back to default bezier
  const edgePath = useMemo(() => {
    if (calculatedPath?.path) {
      return calculatedPath.path;
    }
    
    // Default bezier path
    const [path] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
    
    return path;
  }, [calculatedPath, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);
  
  // Initialize control points
  useEffect(() => {
    if (calculatedPath?.controlPoints) {
      setLocalControlPoints(calculatedPath.controlPoints);
    }
  }, [calculatedPath]);
  
  // Handle control point drag start
  const handleControlPointMouseDown = useCallback((
    event: React.MouseEvent,
    pointId: string
  ) => {
    event.stopPropagation();
    setIsDraggingControl(true);
    setActiveControlPoint(pointId);
    
    perfMonitor?.mark('edge:control:drag:start');
  }, [perfMonitor]);
  
  // Handle control point drag
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingControl || !activeControlPoint) return;
    
    const point = localControlPoints.find(cp => cp.id === activeControlPoint);
    if (!point || point.locked) return;
    
    // Get SVG coordinates
    const svg = (event.target as Element).closest('svg');
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    // Update local control point
    setLocalControlPoints(prev => prev.map(cp => 
      cp.id === activeControlPoint
        ? { ...cp, position: { x: svgP.x, y: svgP.y } }
        : cp
    ));
    
    // Notify parent if callback provided
    if (data?.onControlPointMove) {
      data.onControlPointMove(id, activeControlPoint, { x: svgP.x, y: svgP.y });
    }
  }, [isDraggingControl, activeControlPoint, localControlPoints, id, data]);
  
  // Handle control point drag end
  const handleMouseUp = useCallback(() => {
    if (isDraggingControl) {
      setIsDraggingControl(false);
      setActiveControlPoint(null);
      
      perfMonitor?.measureMarks('edge:control:drag:start', 'edge:control:drag:end');
    }
  }, [isDraggingControl, perfMonitor]);
  
  // Setup global mouse listeners for dragging
  useEffect(() => {
    if (isDraggingControl) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingControl, handleMouseMove, handleMouseUp]);
  
  // Render control points
  const controlPointElements = useMemo(() => {
    if (!data?.routing?.showControlPoints || !selected) {
      return null;
    }
    
    return localControlPoints
      .filter(cp => cp.type === 'intermediate')
      .map(point => (
        <g key={point.id}>
          {/* Control point line */}
          <line
            x1={sourceX}
            y1={sourceY}
            x2={point.position.x}
            y2={point.position.y}
            stroke="#999"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.5}
          />
          <line
            x1={point.position.x}
            y1={point.position.y}
            x2={targetX}
            y2={targetY}
            stroke="#999"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.5}
          />
          
          {/* Control point handle */}
          <circle
            cx={point.position.x}
            cy={point.position.y}
            r={6}
            fill={point.locked ? '#ff6b6b' : '#1a73e8'}
            stroke="#fff"
            strokeWidth={2}
            cursor={point.locked ? 'not-allowed' : 'move'}
            onMouseDown={(e) => !point.locked && handleControlPointMouseDown(e, point.id)}
            style={{
              filter: activeControlPoint === point.id ? 'drop-shadow(0 0 4px rgba(26, 115, 232, 0.5))' : undefined
            }}
          />
          
          {/* Control point label */}
          {point.metadata?.weight && (
            <text
              x={point.position.x}
              y={point.position.y - 10}
              fill="#666"
              fontSize={10}
              textAnchor="middle"
            >
              {point.metadata.weight.toFixed(2)}
            </text>
          )}
        </g>
      ));
  }, [
    localControlPoints,
    selected,
    data?.routing?.showControlPoints,
    sourceX,
    sourceY,
    targetX,
    targetY,
    activeControlPoint,
    handleControlPointMouseDown
  ]);
  
  // Performance indicator
  const performanceIndicator = useMemo(() => {
    if (!data?.performanceMetrics || !selected) return null;
    
    const { calculationTime, cacheHit } = data.performanceMetrics;
    
    return (
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2 - 20}px)`,
            fontSize: 10,
            background: cacheHit ? '#4CAF50' : '#ff9800',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '10px',
            pointerEvents: 'none'
          }}
        >
          {cacheHit ? '⚡' : '🔄'} {calculationTime?.toFixed(0)}ms
        </div>
      </EdgeLabelRenderer>
    );
  }, [data?.performanceMetrics, selected, sourceX, sourceY, targetX, targetY]);
  
  // Edge style with animation
  const edgeStyle = useMemo(() => ({
    ...style,
    stroke: selected ? '#1a73e8' : (style.stroke || '#b1b1b7'),
    strokeWidth: selected ? 2 : (style.strokeWidth || 1),
    ...(data?.routing?.animated && {
      strokeDasharray: '5 5',
      animation: 'dash 1s linear infinite'
    })
  }), [style, selected, data?.routing?.animated]);
  
  return (
    <>
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -10;
            }
          }
        `}
      </style>
      
      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      
      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Control points */}
      {controlPointElements}
      
      {/* Edge label */}
      {data?.routing?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
              fontSize: 12,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #b1b1b7',
              pointerEvents: 'all'
            }}
          >
            {data.routing.label}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Performance indicator */}
      {performanceIndicator}
      
      {/* Algorithm indicator */}
      {selected && data?.routing?.algorithm && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + 20}px, ${sourceY}px)`,
              fontSize: 9,
              background: '#666',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '2px',
              pointerEvents: 'none'
            }}
          >
            {data.routing.algorithm}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default EdgeRouter;