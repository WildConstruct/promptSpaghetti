import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NodeProps, useReactFlow, Handle, Position, Edge } from 'reactflow';
import './BoundingBox.css';

export interface Port {
  id: string;
  label: string;
  type: 'string' | 'number' | 'choice' | 'any';
  direction: 'input' | 'output';
  nodeId: string;
  position: Position;
  color?: string;
}

export interface EnhancedBoundingBoxData {
  title: string;
  description?: string;
  backgroundColor: string;
  opacity: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  locked: boolean;
  width?: number;
  height?: number;
  isCollapsed?: boolean;
  ports?: Port[];
  autoLayout?: boolean;
}

const defaultColors = [
  '#FF5252', // Character-Emotion (from taxonomy)
  '#4ECDC4', // Environment-Teal
  '#95E77E', // Narrative-Spring Green
  '#FFE66D', // Dialogue-Sunshine Yellow
  '#A8E6CF', // Worldbuilding-Mint
  '#C7CEEA', // Items-Periwinkle
  '#FFDAB9', // Gameplay-Peach
  '#E0E0E0', // Experimental-Gray
];

const COLLAPSED_HEIGHT = 80;
const MIN_EXPANDED_HEIGHT = 200;
const NODE_SPACING = 30;
const PADDING = 20;

/**
 * Enhanced Bounding Box with collapse/expand and port system
 */
export const EnhancedBoundingBox: React.FC<NodeProps<EnhancedBoundingBoxData>> = ({
  data,
  selected,
  id,
  xPos,
  yPos,
  draggable = true,
  measured
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(data.title || 'Region');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(data.description || '');
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ports, setPorts] = useState<Port[]>(data.ports || []);
  
  const [size, setSize] = useState({
    width: data.width || 400,
    height: isCollapsed ? COLLAPSED_HEIGHT : (data.height || 300)
  });
  
  const sizeRef = useRef(size);
  const expandedHeightRef = useRef(data.height || 300);
  const boxRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNodes, getEdges } = useReactFlow();
  
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  
  // Calculate contained nodes
  const getContainedNodes = useCallback(() => {
    const allNodes = getNodes();
    const thisBox = allNodes.find(n => n.id === id);
    if (!thisBox) return [];
    
    return allNodes.filter(node => {
      if (node.id === id || node.type === 'boundingBox' || node.type === 'enhancedBoundingBox') return false;
      
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 50;
      
      const boxX = thisBox.position.x;
      const boxY = thisBox.position.y;
      const boxWidth = size.width;
      const boxHeight = expandedHeightRef.current; // Use expanded height for containment check
      
      return (
        nodeX >= boxX &&
        nodeY >= boxY &&
        nodeX + nodeWidth <= boxX + boxWidth &&
        nodeY + nodeHeight <= boxY + boxHeight
      );
    });
  }, [id, size.width, getNodes]);
  
  const containedNodes = getContainedNodes();
  
  // Auto-detect ports from external connections
  const detectPorts = useCallback(() => {
    const edges = getEdges();
    const containedNodeIds = new Set(containedNodes.map(n => n.id));
    const detectedPorts: Port[] = [];
    
    edges.forEach(edge => {
      const sourceInside = containedNodeIds.has(edge.source);
      const targetInside = containedNodeIds.has(edge.target);
      
      // Edge crosses boundary
      if (sourceInside !== targetInside) {
        if (sourceInside) {
          // Output port
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
          // Input port
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
  }, [containedNodes, getEdges]);
  
  // Auto-layout contained nodes
  const autoLayoutNodes = useCallback(() => {
    if (!data.autoLayout) return;
    
    const nodesToLayout = containedNodes;
    if (nodesToLayout.length === 0) return;
    
    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(nodesToLayout.length));
    const boxNode = getNodes().find(n => n.id === id);
    if (!boxNode) return;
    
    setNodes((nodes) => {
      const updatedNodes = [...nodes];
      
      nodesToLayout.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const nodeWidth = node.width || 150;
        const nodeHeight = node.height || 50;
        
        const x = boxNode.position.x + PADDING + col * (nodeWidth + NODE_SPACING);
        const y = boxNode.position.y + PADDING + 40 + row * (nodeHeight + NODE_SPACING); // 40 for header
        
        const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            position: { x, y }
          };
        }
      });
      
      return updatedNodes;
    });
  }, [containedNodes, id, data.autoLayout, getNodes, setNodes]);
  
  // Handle collapse/expand toggle
  const handleCollapseToggle = useCallback(() => {
    setIsAnimating(true);
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    if (newCollapsed) {
      // Collapsing - save current height and set to collapsed height
      expandedHeightRef.current = size.height;
      setSize(prev => ({ ...prev, height: COLLAPSED_HEIGHT }));
      
      // Hide contained nodes
      setNodes((nodes) =>
        nodes.map((node) => {
          if (containedNodes.some(cn => cn.id === node.id)) {
            return { ...node, hidden: true };
          }
          return node;
        })
      );
    } else {
      // Expanding - restore saved height
      setSize(prev => ({ ...prev, height: expandedHeightRef.current }));
      
      // Show contained nodes
      setNodes((nodes) =>
        nodes.map((node) => {
          if (containedNodes.some(cn => cn.id === node.id)) {
            return { ...node, hidden: false };
          }
          return node;
        })
      );
      
      // Apply auto-layout after expansion
      setTimeout(() => autoLayoutNodes(), 100);
    }
    
    // Update node data
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, isCollapsed: newCollapsed },
            height: newCollapsed ? COLLAPSED_HEIGHT : expandedHeightRef.current
          };
        }
        return node;
      })
    );
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [isCollapsed, size.height, containedNodes, id, setNodes, autoLayoutNodes]);
  
  // Handle title edit
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCollapsed) {
      setIsEditingTitle(true);
    }
  }, [isCollapsed]);
  
  const handleTitleSave = useCallback(() => {
    setIsEditingTitle(false);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, title: title }
          };
        }
        return node;
      })
    );
  }, [id, title, setNodes]);
  
  // Render ports for collapsed state
  const renderPorts = () => {
    if (!isCollapsed) return null;
    
    const detectedPorts = detectPorts();
    const allPorts = [...ports, ...detectedPorts];
    
    return (
      <>
        {allPorts.filter(p => p.direction === 'input').map((port, index) => (
          <Handle
            key={port.id}
            type="target"
            position={Position.Left}
            id={port.id}
            style={{
              top: `${30 + index * 20}px`,
              background: port.color || '#1890ff',
              width: '10px',
              height: '10px'
            }}
          >
            <div className="port-label port-label-input">{port.label}</div>
          </Handle>
        ))}
        {allPorts.filter(p => p.direction === 'output').map((port, index) => (
          <Handle
            key={port.id}
            type="source"
            position={Position.Right}
            id={port.id}
            style={{
              top: `${30 + index * 20}px`,
              background: port.color || '#52c41a',
              width: '10px',
              height: '10px'
            }}
          >
            <div className="port-label port-label-output">{port.label}</div>
          </Handle>
        ))}
      </>
    );
  };
  
  // Apply size directly via style
  const boxStyle = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    minWidth: `${size.width}px`,
    minHeight: `${size.height}px`,
    maxWidth: `${size.width}px`,
    maxHeight: `${size.height}px`,
    border: 'none',
    position: 'relative' as const,
    overflow: 'visible',
    transition: isAnimating ? 'height 0.3s ease-in-out' : 'none'
  };
  
  // Create RGBA color from hex color and opacity
  const getBackgroundWithOpacity = (hexColor: string, opacity: number) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  return (
    <div
      ref={boxRef}
      className={`bounding-box enhanced-bounding-box ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      style={boxStyle}
    >
      {/* Background with opacity */}
      <div 
        className="bounding-box-background" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: getBackgroundWithOpacity(data.backgroundColor || defaultColors[0], data.opacity || 0.3),
          borderRadius: '8px',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      {/* Header */}
      <div className="bounding-box-header">
        <button
          className="collapse-toggle"
          onClick={handleCollapseToggle}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
        
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleSave();
              } else if (e.key === 'Escape') {
                setTitle(data.title || 'Region');
                setIsEditingTitle(false);
              }
            }}
            className="bounding-box-title-input"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="bounding-box-title"
            onDoubleClick={handleTitleDoubleClick}
          >
            {title || 'Region'}
          </h3>
        )}
        
        {!isCollapsed && (
          <div className="bounding-box-description">
            {description || <span className="placeholder">Click to add description...</span>}
          </div>
        )}
      </div>
      
      {/* Status */}
      {!isCollapsed && (
        <div className="bounding-box-status">
          <span className="contained-count">
            {containedNodes.length} node{containedNodes.length !== 1 ? 's' : ''}
          </span>
          <button
            className="auto-layout-button"
            onClick={autoLayoutNodes}
            title="Auto-layout nodes"
          >
            📐
          </button>
        </div>
      )}
      
      {/* Ports for collapsed state */}
      {renderPorts()}
    </div>
  );
};

EnhancedBoundingBox.displayName = 'EnhancedBoundingBox';