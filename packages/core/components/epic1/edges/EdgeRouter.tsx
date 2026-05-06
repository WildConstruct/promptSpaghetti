/**
 * Custom edge component with advanced routing capabilities
 * Story 1.28: Advanced Edge Routing
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  EdgeLabelRenderer,
  useReactFlow
} from 'reactflow';

const EDGE_HIT_STROKE_WIDTH = 56;

export type EdgeRoutingAlgorithm = 'bezier' | 'smoothstep' | 'straight' | 'step';

interface ControlPoint {
  id: string;
  x: number;
  y: number;
}

interface EdgeRouterProps extends EdgeProps {
  data?: {
    routing?: {
      algorithm?: EdgeRoutingAlgorithm;
      showControlPoints?: boolean;
      animated?: boolean;
      label?: string;
      strokeWidth?: number;
      controlPoints?: ControlPoint[];
    };
  };
}

/**
 * Custom edge component with multiple routing algorithms
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
  const { setEdges } = useReactFlow();
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

  const algorithm = data?.routing?.algorithm || 'bezier';
  const showControlPoints = data?.routing?.showControlPoints && selected;
  const animated = data?.routing?.animated || false;
  const label = data?.routing?.label;
  const strokeWidth = data?.routing?.strokeWidth || (selected ? 3 : 2);
  const controlPoints = useMemo(
    () => data?.routing?.controlPoints ?? [],
    [data?.routing?.controlPoints]
  );

  // Calculate path based on algorithm
  const edgePath = useMemo(() => {
    switch (algorithm) {
      case 'smoothstep': {
        const [path] = getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 10
        });
        return path;
      }
      case 'straight': {
        const [path] = getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY
        });
        return path;
      }
      case 'step': {
        // Step routing (stair pattern)
        const midX = (sourceX + targetX) / 2;
        return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
      }
      case 'bezier':
      default: {
        if (controlPoints.length > 0) {
          // Custom bezier with control points
          const cp1 = controlPoints[0] || { x: (sourceX + targetX) / 2, y: sourceY };
          const cp2 = controlPoints[1] || { x: (sourceX + targetX) / 2, y: targetY };
          return `M ${sourceX},${sourceY} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${targetX},${targetY}`;
        } else {
          // Default bezier
          const [path] = getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition
          });
          return path;
        }
      }
    }
  }, [
    algorithm,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    controlPoints
  ]);

  // Handle control point drag
  const handleControlPointDrag = useCallback((pointId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const point = controlPoints.find(cp => cp.id === pointId);
    if (!point) {return;}

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            const updatedPoints = controlPoints.map(cp =>
              cp.id === pointId
                ? { ...cp, x: point.x + deltaX, y: point.y + deltaY }
                : cp
            );
            return {
              ...edge,
              data: {
                ...edge.data,
                routing: {
                  ...edge.data?.routing,
                  controlPoints: updatedPoints
                }
              }
            };
          }
          return edge;
        })
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, controlPoints, setEdges]);

  // Add control point on double-click
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (algorithm !== 'bezier') {return;}
    
    const rect = (event.target as SVGElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newPoint: ControlPoint = {
      id: `cp-${Date.now()}`,
      x,
      y
    };

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const currentPoints = edge.data?.routing?.controlPoints || [];
          if (currentPoints.length < 5) { // Max 5 control points
            return {
              ...edge,
              data: {
                ...edge.data,
                routing: {
                  ...edge.data?.routing,
                  controlPoints: [...currentPoints, newPoint]
                }
              }
            };
          }
        }
        return edge;
      })
    );
  }, [id, algorithm, setEdges]);

  const edgeStyle = {
    ...style,
    stroke: selected ? '#0084ff' : (style.stroke || '#999'),
    strokeWidth,
    strokeDasharray: animated ? '5 5' : undefined,
    animation: animated ? 'dash 1s linear infinite' : undefined
  };

  return (
    <>
      <g className="edge-router">
        {/* Main edge path */}
        <path
          id={id}
          style={edgeStyle}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
          fill="none"
          onDoubleClick={handleDoubleClick}
        />
        
        {/* Invisible wider path for better interaction */}
        <path
          className="react-flow__edge-interaction"
          style={{
            ...edgeStyle,
            stroke: 'rgba(255, 255, 255, 0.001)',
            strokeWidth: EDGE_HIT_STROKE_WIDTH,
            opacity: 1,
            cursor: 'default',
            pointerEvents: 'stroke'
          }}
          d={edgePath}
          fill="none"
          onDoubleClick={handleDoubleClick}
        />

        {/* Control points */}
        {showControlPoints && controlPoints.map(point => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredControl === point.id ? 8 : 6}
              fill={hoveredControl === point.id ? '#0084ff' : '#fff'}
              stroke="#0084ff"
              strokeWidth={2}
              style={{ cursor: 'move' }}
              onMouseEnter={() => setHoveredControl(point.id)}
              onMouseLeave={() => setHoveredControl(null)}
              onMouseDown={(e) => handleControlPointDrag(point.id, e)}
            />
          </g>
        ))}

        {/* Algorithm indicator */}
        {selected && (
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 10}
            className="edge-algorithm-label"
            fill="#666"
            fontSize="10"
            textAnchor="middle"
          >
            {algorithm}
          </text>
        )}
      </g>

      {/* Edge label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              border: '1px solid #999',
              pointerEvents: 'none'
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </>
  );
};

export default EdgeRouter;
