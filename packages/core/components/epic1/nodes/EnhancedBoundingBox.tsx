import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NodeProps, useReactFlow, Handle, Position, Edge, useStore } from 'reactflow';
// CSS imports removed - using inline styles only

// Feature flag for gradual migration to refactored version
// Refactored version is now complete and tested
const USE_REFACTORED_VERSION = true; // Using refactored modular version

// Import refactored version
import { EnhancedBoundingBox as EnhancedBoundingBoxRefactored } from './EnhancedBoundingBox/index';

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
  '#B19CD9', // Soft Purple
  'custom',  // Custom color picker
];

const COLLAPSED_HEIGHT = 90;  // Taller to accommodate title, buttons, and node indicators
const COLLAPSED_WIDTH = 280;  // Width for collapsed state
const MIN_EXPANDED_HEIGHT = 200;
const MIN_EXPANDED_WIDTH = 300;
const NODE_SPACING = 30;
const PADDING = 20;

/**
 * Enhanced Bounding Box with collapse/expand and port system
 */
const EnhancedBoundingBox: React.FC<NodeProps<EnhancedBoundingBoxData>> = ({
  data,
  selected,
  id,
  xPos,
  yPos,
  draggable = true,
  measured,
  dragging
}) => {
  // Component version with all fixes applied
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(data.title || 'Region');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(data.description || '');
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLocked, setIsLocked] = useState(data.locked || false);
  const [ports, setPorts] = useState<Port[]>(data.ports || []);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const [size, setSize] = useState({
    width: isCollapsed ? COLLAPSED_WIDTH : (data.width || 400),
    height: isCollapsed ? COLLAPSED_HEIGHT : (data.height || 300)
  });
  
  const sizeRef = useRef(size);
  const expandedSizeRef = useRef({ width: data.width || 400, height: data.height || 300 });
  const boxRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNodes, getEdges, setEdges } = useReactFlow();
  
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  
  // Calculate contained nodes - use position-based containment
  const getContainedNodes = useCallback(() => {
    const allNodes = getNodes();
    const thisBox = allNodes.find(n => n.id === id);
    if (!thisBox) return [];
    
    const contained = allNodes.filter(node => {
      if (node.id === id || node.type === 'boundingBox' || node.type === 'enhancedBoundingBox') return false;
      
      // Check position-based containment
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 50;
      
      const boxX = thisBox.position.x;
      const boxY = thisBox.position.y;
      const boxWidth = size.width;
      const boxHeight = expandedSizeRef.current.height; // Use expanded height for containment check
      
      return (
        nodeX >= boxX &&
        nodeY >= boxY &&
        nodeX + nodeWidth <= boxX + boxWidth &&
        nodeY + nodeHeight <= boxY + boxHeight
      );
    });
    
    return contained;
  }, [id, size.width, getNodes]);
  
  const containedNodes = getContainedNodes();
  
  // Track previous position for grouped movement
  const prevPositionRef = useRef({ x: xPos, y: yPos });
  
  // Move grouped nodes when locked and dragging
  useEffect(() => {
    if (isLocked && dragging) {
      const deltaX = xPos - prevPositionRef.current.x;
      const deltaY = yPos - prevPositionRef.current.y;
      
      if (deltaX !== 0 || deltaY !== 0) {
        const nodesToMove = getContainedNodes();
        setNodes((nodes) =>
          nodes.map((node) => {
            // Move nodes that are contained in this box
            if (nodesToMove.some(cn => cn.id === node.id)) {
              return {
                ...node,
                position: {
                  x: node.position.x + deltaX,
                  y: node.position.y + deltaY
                }
              };
            }
            return node;
          })
        );
      }
    }
    prevPositionRef.current = { x: xPos, y: yPos };
  }, [xPos, yPos, isLocked, dragging, setNodes, id, size.width, getNodes]);
  
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
  
  // Handle collapse/expand toggle - animates both width and height
  const handleCollapseToggle = useCallback(() => {
    
    setIsAnimating(true);
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // Get fresh list of contained nodes and edges BEFORE changing size
    // This is critical - we need to check containment with the expanded size
    const nodesToToggle = getContainedNodes();
    const edges = getEdges();
    // Toggle collapse state for contained nodes
    
    // Find edges connected to contained nodes
    const nodeIds = new Set(nodesToToggle.map(n => n.id));
    const edgesToToggle = edges.filter(edge => 
      nodeIds.has(edge.source) || nodeIds.has(edge.target)
    );
    
    if (newCollapsed) {
      // Collapsing - save current size and shrink both dimensions
      expandedSizeRef.current = { width: size.width, height: size.height };
      setSize({ width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT });
      
      // Store the list of nodes we're hiding for later expansion
      const hiddenNodeIds = nodesToToggle.map(n => n.id);
      
      // Hide contained nodes and their edges when collapsed
      setNodes((nodes) => {
        return nodes.map((node) => {
          if (hiddenNodeIds.includes(node.id)) {
            // Hide node
            return { 
              ...node, 
              hidden: true,
              // Store original visibility state
              data: { 
                ...node.data, 
                wasHiddenBeforeCollapse: node.hidden || false,
                wasContainedWhenCollapsed: true // Mark that this was hidden by collapse
              }
            };
          }
          // Update bounding box node itself
          if (node.id === id) {
            return {
              ...node,
              data: { 
                ...node.data, 
                isCollapsed: true,
                collapsedNodeIds: hiddenNodeIds // Store which nodes were hidden
              },
              width: COLLAPSED_WIDTH,
              height: COLLAPSED_HEIGHT
            };
          }
          return node;
        });
      });
      
      // Hide internal edges and reroute external edges through ports
      setEdges((edges) => {
        return edges.map((edge) => {
          const sourceInside = nodeIds.has(edge.source);
          const targetInside = nodeIds.has(edge.target);
          
          // Both nodes inside - hide the edge
          if (sourceInside && targetInside) {
            return { ...edge, hidden: true };
          }
          
          // Edge crosses boundary - reroute through port
          if (sourceInside !== targetInside) {
            if (sourceInside) {
              // Source inside, target outside - reroute from output port
              return {
                ...edge,
                source: id, // Connect from bounding box
                sourceHandle: `${id}-default-output`, // Use the default output port
                hidden: false,
                data: {
                  ...edge.data,
                  originalSource: edge.source,
                  originalSourceHandle: edge.sourceHandle,
                  reroutedByCollapse: true
                }
              };
            } else if (targetInside) {
              // Source outside, target inside - reroute to input port
              return {
                ...edge,
                target: id, // Connect to bounding box
                targetHandle: `${id}-default-input`, // Use the default input port
                hidden: false,
                data: {
                  ...edge.data,
                  originalTarget: edge.target,
                  originalTargetHandle: edge.targetHandle,
                  reroutedByCollapse: true
                }
              };
            }
          }
          
          return edge;
        });
      });
    } else {
      // Expanding - First show the nodes immediately (before size animation)
      // Get the list of nodes that were hidden when we collapsed
      const boxNode = getNodes().find(n => n.id === id);
      const collapsedNodeIds = boxNode?.data?.collapsedNodeIds || [];
      
      // Restore nodes from collapsed state
      
      // Show contained nodes and their edges IMMEDIATELY
      setNodes((nodes) => {
        return nodes.map((node) => {
          // Check if this node was hidden when we collapsed
          if (collapsedNodeIds.includes(node.id) || node.data?.wasContainedWhenCollapsed) {
            const wasHidden = node.data?.wasHiddenBeforeCollapse || false;
            // Show node with preserved hidden state
            return { 
              ...node, 
              hidden: wasHidden, // Restore original hidden state
              style: {
                ...node.style,
                opacity: 0, // Start with opacity 0 for fade-in
                transition: 'opacity 0.35s ease-in' // Longer, smoother fade
              },
              data: {
                ...node.data,
                wasHiddenBeforeCollapse: undefined,
                wasContainedWhenCollapsed: undefined
              }
            };
          }
          // Update bounding box node itself
          if (node.id === id) {
            return {
              ...node,
              data: { 
                ...node.data, 
                isCollapsed: false,
                collapsedNodeIds: undefined
              },
              width: expandedSizeRef.current.width,
              height: expandedSizeRef.current.height
            };
          }
          return node;
        });
      });
      
      // Restore original edges
      setEdges((edges) => {
        return edges.map((edge) => {
          // Restore rerouted edges to their original state
          if (edge.data?.reroutedByCollapse) {
            const restoredEdge = { ...edge };
            
            // Restore original source if it was rerouted
            if (edge.data.originalSource) {
              restoredEdge.source = edge.data.originalSource;
              restoredEdge.sourceHandle = edge.data.originalSourceHandle || null;
            }
            
            // Restore original target if it was rerouted
            if (edge.data.originalTarget) {
              restoredEdge.target = edge.data.originalTarget;
              restoredEdge.targetHandle = edge.data.originalTargetHandle || null;
            }
            
            // Clean up the rerouting data
            const { originalSource, originalSourceHandle, originalTarget, originalTargetHandle, reroutedByCollapse, ...restData } = restoredEdge.data || {};
            restoredEdge.data = restData;
            restoredEdge.hidden = false;
            
            return restoredEdge;
          }
          
          // Show edges connected to nodes that were hidden
          const shouldShow = collapsedNodeIds.includes(edge.source) || collapsedNodeIds.includes(edge.target);
          if (shouldShow) {
            return { ...edge, hidden: false };
          }
          
          return edge;
        });
      });
      
      // Then animate the size change
      setSize(expandedSizeRef.current);
      
      // Fade in the nodes after a brief moment (roughly 4 frames at 60fps)
      setTimeout(() => {
        setNodes((nodes) => {
          return nodes.map((node) => {
            if (collapsedNodeIds.includes(node.id)) {
              const { opacity, transition, ...restStyle } = node.style || {};
              return { 
                ...node, 
                style: {
                  ...restStyle,
                  opacity: 1,
                  transition: 'opacity 0.35s ease-in'
                }
              };
            }
            return node;
          });
        });
      }, 67);
      
      // Clean up transition styles after animation completes
      setTimeout(() => {
        setNodes((nodes) => {
          return nodes.map((node) => {
            if (collapsedNodeIds.includes(node.id)) {
              const { opacity, transition, ...restStyle } = node.style || {};
              return { 
                ...node, 
                style: restStyle // Remove all animation styles
              };
            }
            return node;
          });
        });
      }, 400);
      
      // Apply auto-layout after expansion
      setTimeout(() => autoLayoutNodes(), 100);
    }
    
    // Animation completes in ~5 frames (assuming 60fps = ~83ms)
    setTimeout(() => setIsAnimating(false), 100);
  }, [isCollapsed, size, getContainedNodes, id, setNodes, getNodes, getEdges, setEdges, autoLayoutNodes]);
  
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
  
  // Handle lock toggle - only controls grouping behavior
  const handleLockToggle = useCallback(() => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    
    // Update lock state
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, locked: newLocked }
          };
        }
        // Lock/unlock dragging for contained nodes
        // When locked, nodes move together with the bounding box
        if (containedNodes.some(cn => cn.id === node.id)) {
          return { 
            ...node, 
            // When locked, nodes can't be dragged individually
            draggable: !newLocked,
            // Keep them selectable
            selectable: true
          };
        }
        return node;
      })
    );
  }, [id, isLocked, containedNodes, setNodes]);
  
  // Handle resize - improved with Grok's suggestions
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (isLocked) return;
    
    // CRITICAL: Stop all event propagation immediately
    e.stopPropagation();
    e.preventDefault();
    // Note: stopImmediatePropagation not available on React synthetic events
    if (e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    setIsResizing(true);
    
    // Disable node dragging during resize
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, draggable: false };
        }
        return node;
      })
    );
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = sizeRef.current.width;
    const startHeight = sizeRef.current.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (direction.includes('e')) newWidth = Math.max(200, startWidth + deltaX);
      if (direction.includes('w')) newWidth = Math.max(200, startWidth - deltaX);
      if (direction.includes('s')) newHeight = Math.max(isCollapsed ? COLLAPSED_HEIGHT : MIN_EXPANDED_HEIGHT, startHeight + deltaY);
      if (direction.includes('n')) newHeight = Math.max(isCollapsed ? COLLAPSED_HEIGHT : MIN_EXPANDED_HEIGHT, startHeight - deltaY);
      
      // Update both state and ref
      setSize({ width: newWidth, height: newHeight });
      sizeRef.current = { width: newWidth, height: newHeight };
      
      // Update node data and dimensions
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              width: newWidth,
              height: newHeight,
              data: { ...node.data, width: newWidth, height: newHeight }
            };
          }
          return node;
        })
      );
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Re-enable node dragging after resize
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, draggable: !isLocked };
          }
          return node;
        })
      );
      
      // Save expanded size if not collapsed
      if (!isCollapsed) {
        expandedSizeRef.current = { width: sizeRef.current.width, height: sizeRef.current.height };
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isLocked, isCollapsed, id, setNodes]);
  
  // Render ports for collapsed state
  const renderPorts = () => {
    if (!isCollapsed) return null;
    
    // Always show at least one input and one output port when collapsed
    const defaultPorts: Port[] = [
      {
        id: `${id}-default-input`,
        label: 'In',
        type: 'any',
        direction: 'input',
        nodeId: id,
        position: Position.Left,
        color: '#1890ff'
      },
      {
        id: `${id}-default-output`,
        label: 'Out',
        type: 'any',
        direction: 'output',
        nodeId: id,
        position: Position.Right,
        color: '#52c41a'
      }
    ];
    
    const detectedPorts = detectPorts();
    // Use detected ports if available, otherwise use defaults
    const allPorts = detectedPorts.length > 0 ? [...ports, ...detectedPorts] : [...ports, ...defaultPorts];
    
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
              width: '12px',
              height: '12px',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              cursor: 'crosshair'
            }}
          />
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
              width: '12px',
              height: '12px',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              cursor: 'crosshair'
            }}
          />
        ))}
      </>
    );
  };
  
  // Apply size directly via style with region-based border
  const boxStyle = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    minWidth: `${size.width}px`,
    minHeight: `${size.height}px`,
    maxWidth: `${size.width}px`,
    maxHeight: `${size.height}px`,
    border: `${data.borderWidth || 2}px solid ${data.borderColor || defaultColors[0]}`,
    borderRadius: '8px',
    position: 'relative' as const,
    overflow: 'visible',
    transition: isAnimating ? 'all 0.1s ease-in-out' : 'none',
    // Override any external CSS
    boxSizing: 'border-box' as const
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
      style={{
        ...boxStyle,
        // Inline critical styles to ensure they're applied
        // Bounding boxes should render below other nodes
        zIndex: -1,
        position: 'relative',
      }}
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
          onClick={handleLockToggle}
          title={isLocked ? 'Unlock' : 'Lock'}
          style={{
            position: 'absolute',
            right: '34px',
            top: '8px',
            width: '20px',
            height: '20px',
            background: isLocked ? 'rgba(255, 100, 100, 0.2)' : 'rgba(60, 60, 60, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            zIndex: 10,
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isLocked ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
            </svg>
          )}
        </button>
        <button
          onClick={handleCollapseToggle}
          title={isCollapsed ? 'Expand' : 'Collapse'}
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              width: '20px',
              height: '20px',
              background: 'rgba(60, 60, 60, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              zIndex: 10,
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
            >
              <path d="M7 10l5 5 5-5z"/>
            </svg>
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
          <div 
            className="bounding-box-description"
            onClick={() => setIsEditingDescription(true)}
            style={{ cursor: 'text' }}
          >
            {isEditingDescription ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  setIsEditingDescription(false);
                  setNodes((nodes) =>
                    nodes.map((node) =>
                      node.id === id
                        ? { ...node, data: { ...node.data, description } }
                        : node
                    )
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    setIsEditingDescription(false);
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === id
                          ? { ...node, data: { ...node.data, description } }
                          : node
                      )
                    );
                  } else if (e.key === 'Escape') {
                    setDescription(data.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid #444',
                  color: '#e0e0e0',
                  padding: '4px',
                  borderRadius: '4px',
                  resize: 'none',
                  minHeight: '40px'
                }}
                placeholder="Add description..."
              />
            ) : (
              description || <span className="placeholder">Click to add description...</span>
            )}
          </div>
        )}
      </div>
      
      {/* Status or Node Indicators */}
      {!isCollapsed ? (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          height: '28px',
          padding: '0 8px',
          background: 'rgba(38, 38, 38, 0.95)',
          borderRadius: '4px',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          pointerEvents: 'auto'
        }}>
          <span style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#999',
            fontWeight: '500'
          }}>
            {containedNodes.length} node{containedNodes.length !== 1 ? 's' : ''}
          </span>
          {/* Color Picker Button inside status bar */}
          {selected && (
            <div style={{ 
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20
            }}>
              <button
                className="nodrag nopan"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowColorPicker(!showColorPicker);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: data.backgroundColor || defaultColors[0],
                  border: showColorPicker ? '2px solid #1890ff' : '2px solid #666',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'block',
                  pointerEvents: 'auto'
                }}
                title="Change color"
              />
              {showColorPicker && (
                <div 
                  className="nodrag nopan"
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '-4px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 28px)',
                    gap: '4px',
                    padding: '8px',
                    background: 'rgba(20, 20, 20, 0.98)',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                    zIndex: 10000
                  }}
                >
                  {defaultColors.map((color, index) => {
                    const isCustom = color === 'custom';
                    const isSelected = !isCustom && data.backgroundColor === color;
                    
                    if (isCustom) {
                      return (
                        <label
                          key="custom"
                          className="nodrag nopan"
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '2px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#3a3a3a',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          title="Custom color"
                        >
                          <input
                            type="color"
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              const customColor = e.target.value;
                              setNodes((nodes) =>
                                nodes.map((node) =>
                                  node.id === id
                                    ? { ...node, data: { ...node.data, backgroundColor: customColor } }
                                    : node
                                )
                              );
                              setShowColorPicker(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                          <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 14 14" 
                            fill="none" 
                            style={{ 
                              pointerEvents: 'none',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <path 
                              d="M10.5 1.5l2 2L7 9l-2.5.5.5-2.5 5.5-5.5z"
                              stroke="#bbb"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path 
                              d="M3 11.5l-1.5 1.5M1.5 12L3 13.5"
                              stroke="#bbb"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </label>
                      );
                    }
                    
                    return (
                      <button
                        key={color}
                        className="nodrag nopan"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: color,
                          border: isSelected ? '2px solid #1890ff' : '2px solid #555',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? '0 0 0 1px #1890ff' : 'none'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes((nodes) =>
                            nodes.map((node) =>
                              node.id === id
                                ? { ...node, data: { ...node.data, backgroundColor: color } }
                                : node
                            )
                          );
                          setShowColorPicker(false);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)'}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (() => {
        // When collapsed, use stored node count since containedNodes will be empty
        const nodeCount = data.collapsedNodeIds?.length || containedNodes.length || 0;
        const firstNodeType = containedNodes[0]?.type || data.collapsedNodeTypes?.[0];
        
        return (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '15px',  // Align with left edge of title
            width: 'calc(100% - 30px)',  // Full width minus padding
            display: 'inline-flex',  // Use inline-flex
            flexDirection: 'row',  // Explicitly set to row
            alignItems: 'center',
            height: '12px',  // Fixed height
            flexWrap: 'nowrap'  // Prevent wrapping
          }}>
            {/* Single unfilled square */}
            <div
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                minWidth: '12px',  // Prevent shrinking
                backgroundColor: 'transparent',  // No fill
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '1px',
                flexShrink: 0,
                verticalAlign: 'middle'
              }}
            />
            {/* Node count and type text */}
            <span style={{
              display: 'inline-block',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              fontWeight: 300,  // Lighter font weight
              lineHeight: '12px',  // Same height as square
              whiteSpace: 'nowrap',  // Prevent wrapping
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              verticalAlign: 'middle',
              marginLeft: '6px'  // Add spacing between square and text
            }}>
              {nodeCount} {
                nodeCount === 1 
                  ? (firstNodeType === 'weightedChoice' ? 'Weighted Choice Node' : 
                     firstNodeType || 'Node')
                  : 'Nodes'
              }
            </span>
          </div>
        );
      })()}
      
      {/* Ports for collapsed state */}
      {renderPorts()}
      
      {/* Resize Handles - ALL INLINE STYLES with nodrag class */}
      {selected && !isCollapsed && !isLocked && (
        <>
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'nw'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              width: '10px',
              height: '10px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'nw-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.025)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'ne'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'ne-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.025)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'sw'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '-5px',
              width: '10px',
              height: '10px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'sw-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.025)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'se'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'se-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.025)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'n'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '8px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'n-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 's'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '8px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 's-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'e'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '40px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'e-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          />
          <div 
            className="nodrag"
            onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'w'); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '40px',
              background: 'rgba(24, 144, 255, 0.8)',
              border: '1px solid #fff',
              borderRadius: '2px',
              cursor: 'w-resize',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          />
        </>
      )}
    </div>
  );
};

// Set display name
EnhancedBoundingBox.displayName = 'EnhancedBoundingBox';
EnhancedBoundingBoxRefactored.displayName = 'EnhancedBoundingBox';

// Export appropriate version based on feature flag
const ExportedComponent = USE_REFACTORED_VERSION ? EnhancedBoundingBoxRefactored : EnhancedBoundingBox;

export { ExportedComponent as EnhancedBoundingBox };