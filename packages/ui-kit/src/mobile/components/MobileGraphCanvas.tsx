/**
 * Mobile-optimized graph canvas
 */

import React, { useState, useRef, useEffect } from 'react';
import { GraphDocument, GraphNode, GraphEdge } from '@prompt-spaghetti/graph-core';
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING } from '../design-system';
import { MobileFAB } from './MobileButton';
import { cn } from '../../utils';

export interface MobileGraphCanvasProps {
  graph: GraphDocument;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeEdit?: (nodeId: string) => void;
  onAddNode?: () => void;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

export const MobileGraphCanvas: React.FC<MobileGraphCanvasProps> = ({
  graph,
  selectedNodeId,
  onNodeSelect,
  onNodeEdit,
  onAddNode,
  readOnly = false,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [showControls, setShowControls] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsPanning(true);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || !touchStart || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    setViewTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchStart(null);
  };
  
  // Pinch zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(2, viewTransform.scale * delta));
    
    setViewTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  };
  
  // Node selection
  const handleNodeClick = (nodeId: string) => {
    onNodeSelect?.(nodeId);
    
    // Auto-open editor on mobile
    if (!readOnly) {
      setTimeout(() => {
        onNodeEdit?.(nodeId);
      }, 100);
    }
  };
  
  // Fit view
  const fitToView = () => {
    if (!canvasRef.current || !graph.nodes.length) return;
    
    const bounds = calculateGraphBounds(graph.nodes);
    const container = canvasRef.current.getBoundingClientRect();
    
    const scaleX = container.width / (bounds.width + 100);
    const scaleY = container.height / (bounds.height + 100);
    const scale = Math.min(scaleX, scaleY, 1);
    
    setViewTransform({
      x: (container.width - bounds.width * scale) / 2 - bounds.minX * scale,
      y: (container.height - bounds.height * scale) / 2 - bounds.minY * scale,
      scale
    });
  };
  
  // Center on selected node
  useEffect(() => {
    if (selectedNodeId && canvasRef.current) {
      const node = graph.nodes.find(n => n.id === selectedNodeId);
      if (node && node.position) {
        const container = canvasRef.current.getBoundingClientRect();
        setViewTransform(prev => ({
          ...prev,
          x: container.width / 2 - node.position.x * prev.scale,
          y: container.height / 2 - node.position.y * prev.scale
        }));
      }
    }
  }, [selectedNodeId]);
  
  return (
    <div
      ref={canvasRef}
      className={cn('mobile-graph-canvas', className)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
        backgroundColor: 'var(--color-surface)',
        ...style
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Canvas viewport */}
      <div
        className="canvas-viewport"
        style={{
          transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 0.2s ease',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {/* Render edges */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {graph.edges.map(edge => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode?.position || !targetNode?.position) return null;
            
            return (
              <line
                key={edge.id}
                x1={sourceNode.position.x + 60}
                y1={sourceNode.position.y + 30}
                x2={targetNode.position.x + 60}
                y2={targetNode.position.y + 30}
                stroke="var(--color-border)"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        
        {/* Render nodes */}
        {graph.nodes.map(node => (
          <MobileNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onClick={() => handleNodeClick(node.id)}
          />
        ))}
      </div>
      
      {/* Canvas controls */}
      {showControls && (
        <div
          className="canvas-controls"
          style={{
            position: 'absolute',
            bottom: MOBILE_SPACING.md,
            left: MOBILE_SPACING.md,
            display: 'flex',
            flexDirection: 'column',
            gap: MOBILE_SPACING.sm
          }}
        >
          <button
            onClick={() => setViewTransform(prev => ({ ...prev, scale: Math.min(2, prev.scale * 1.2) }))}
            style={controlButtonStyle}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setViewTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale * 0.8) }))}
            style={controlButtonStyle}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={fitToView}
            style={controlButtonStyle}
            aria-label="Fit to view"
          >
            ⊡
          </button>
        </div>
      )}
      
      {/* Add node FAB */}
      {!readOnly && (
        <MobileFAB
          position="bottom-right"
          onClick={onAddNode}
          hapticFeedback
        >
          +
        </MobileFAB>
      )}
    </div>
  );
};

/**
 * Mobile node component
 */
interface MobileNodeProps {
  node: GraphNode;
  isSelected: boolean;
  onClick: () => void;
}

const MobileNode: React.FC<MobileNodeProps> = ({ node, isSelected, onClick }) => {
  const nodeIcons: Record<string, string> = {
    subject: '👤',
    action: '⚡',
    attribute: '🏷️',
    weightedChoice: '🎲',
    output: '📤',
    concat: '🔗',
    variable: '📦'
  };
  
  return (
    <div
      className={cn('mobile-node', isSelected && 'selected')}
      style={{
        position: 'absolute',
        left: node.position?.x || 0,
        top: node.position?.y || 0,
        width: 120,
        minHeight: TOUCH_TARGETS.large,
        padding: MOBILE_SPACING.sm,
        backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-background)',
        color: isSelected ? 'white' : 'var(--color-text)',
        border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        ...mobileStyles.tapHighlight,
        ...mobileStyles.noSelect
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>
        {nodeIcons[node.type] || '📦'}
      </div>
      <div style={{
        fontSize: 12,
        fontWeight: 500,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%'
      }}>
        {node.type}
      </div>
    </div>
  );
};

// Control button styles
const controlButtonStyle: React.CSSProperties = {
  width: TOUCH_TARGETS.preferred,
  height: TOUCH_TARGETS.preferred,
  borderRadius: '50%',
  backgroundColor: 'var(--color-background)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  fontWeight: 'bold',
  cursor: 'pointer',
  ...mobileStyles.tapHighlight
};

// Calculate graph bounds
function calculateGraphBounds(nodes: GraphNode[]) {
  if (!nodes.length) return { minX: 0, minY: 0, width: 0, height: 0 };
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  nodes.forEach(node => {
    if (node.position) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 120);
      maxY = Math.max(maxY, node.position.y + 60);
    }
  });
  
  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  };
}