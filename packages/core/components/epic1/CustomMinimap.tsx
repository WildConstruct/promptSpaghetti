import React, { useRef, useEffect, useState } from 'react';
import { Node, Edge, useViewport, useReactFlow } from 'reactflow';
import {
  getMinimapNodeColor,
  getMinimapNodeBorderRadius,
  getMinimapNodeStrokeColor,
  getMinimapNodeStrokeWidth
} from './nodeVisualTheme';
import './CustomMinimap.css';

interface CustomMinimapProps {
  nodes: Node[];
  edges: Edge[];
  style?: React.CSSProperties;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface DragState {
  x: number;
  y: number;
  viewportX: number;
  viewportY: number;
}

export const CustomMinimap: React.FC<CustomMinimapProps> = ({ nodes, edges, style }) => {
  const viewport = useViewport();
  const { getViewport, setViewport } = useReactFlow();
  const minimapRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<Bounds>({ minX: 0, minY: 0, maxX: 1000, maxY: 1000 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragState>({ x: 0, y: 0, viewportX: 0, viewportY: 0 });
  
  // Calculate the bounds of all nodes
  useEffect(() => {
    if (nodes.length === 0) {
      return;
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const x = node.position.x;
      const y = node.position.y;
      const width = 280; // Default width
      const height = 140; // Default height
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    // Add significant padding to show more of the canvas
    const padding = 300; // Increased from 50 to show more area
    setBounds({
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    });
  }, [nodes]);
  
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min(200 / width, 120 / height);
  
  // Helper function to get node center position
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      return null;
    }
    const x = (node.position.x - bounds.minX + 140) * scale; // 140 is half of node width
    const y = (node.position.y - bounds.minY + 70) * scale; // 70 is half of node height
    return { x, y };
  };
  
  // Handle mouse down on viewport indicator
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentViewport = getViewport();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      viewportX: currentViewport.x,
      viewportY: currentViewport.y
    });
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;
      
      setViewport({
        x: dragStart.viewportX - deltaX,
        y: dragStart.viewportY - deltaY,
        zoom: viewport.zoom
      }, { duration: 0 });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (!isDragging) {
      return undefined;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, scale, viewport.zoom, setViewport]);

  // Handle click on minimap background to navigate
  const handleMinimapClick = (e: React.MouseEvent) => {
    if (!minimapRef.current || isDragging) {
      return;
    }

    // Don't navigate if clicking on the viewport rectangle
    const target = e.target as HTMLElement;
    if (target.style.cursor === 'grab' || target.style.cursor === 'grabbing') {
      return;
    }
    
    const rect = minimapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale + bounds.minX;
    const y = (e.clientY - rect.top) / scale + bounds.minY;
    
    setViewport({
      x: -x + window.innerWidth / 2,
      y: -y + window.innerHeight / 2,
      zoom: viewport.zoom
    }, { duration: 300 });
  };
  
  return (
    <div 
      className="custom-minimap"
      style={style}
      onClick={handleMinimapClick}
      ref={minimapRef}
    >
      <svg
        width={200}
        height={120}
        viewBox={`0 0 ${200} ${120}`}
        style={{ background: 'rgba(40, 40, 40, 0.9)' }}
      >
        {/* Draw edges first so they appear behind nodes */}
        {edges.map(edge => {
          const sourcePos = getNodeCenter(edge.source);
          const targetPos = getNodeCenter(edge.target);

          const isPointValid = (
            point: { x: number; y: number } | null
          ): point is { x: number; y: number } =>
            Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));

          if (!isPointValid(sourcePos) || !isPointValid(targetPos)) {
            return null;
          }

          return (
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="#666"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}
        
        {/* Draw nodes */}
        {nodes.map(node => {
          const x = (node?.position?.x ?? 0) - bounds.minX;
          const y = (node?.position?.y ?? 0) - bounds.minY;
          const sx = x * scale;
          const sy = y * scale;
          const nodeWidth = 280 * scale;
          const nodeHeight = 140 * scale;
          
          return (
            <rect
              key={node.id}
              x={Number.isFinite(sx) ? sx : 0}
              y={Number.isFinite(sy) ? sy : 0}
              width={nodeWidth}
              height={nodeHeight}
              fill={getMinimapNodeColor(node)}
              stroke={getMinimapNodeStrokeColor(node)}
              strokeWidth={getMinimapNodeStrokeWidth(node)}
              rx={getMinimapNodeBorderRadius(node)}
              opacity={0.8}
            />
          );
        })}
        
        {/* Draw viewport indicator */}
        <rect
          x={Math.max(0, Math.min(200 - (window.innerWidth / viewport.zoom) * scale, (-viewport.x - bounds.minX) * scale))}
          y={Math.max(0, Math.min(120 - (window.innerHeight / viewport.zoom) * scale, (-viewport.y - bounds.minY) * scale))}
          width={Math.min(200, (window.innerWidth / viewport.zoom) * scale)}
          height={Math.min(120, (window.innerHeight / viewport.zoom) * scale)}
          fill="rgba(91, 158, 255, 0.1)"
          stroke="#5b9eff"
          strokeWidth={2}
          opacity={0.8}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', pointerEvents: 'all' }}
          onMouseDown={handleViewportMouseDown}
        />
      </svg>
    </div>
  );
};
