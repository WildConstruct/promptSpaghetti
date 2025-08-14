import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import './BoundingBox.css';

export interface BoundingBoxData {
  title: string;
  description?: string;
  backgroundColor: string;
  opacity: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  locked: boolean; // whether contained nodes move with box
  width?: number;
  height?: number;
}

const defaultColors = [
  '#CC567D', // Hot Pink (20% darker)
  '#9D3754', // Rose (20% darker)
  '#7C4791', // Purple (20% darker)
  '#2A7AAF', // Blue (20% darker)
  '#25A35A', // Green (20% darker)
  '#C27D0E', // Orange (20% darker)
  '#15967D', // Turquoise (20% darker)
  '#B93D30', // Red (20% darker)
];

/**
 * Bounding Box component for visual organization of nodes
 * Story 1.26: Bounding Boxes/Regions
 */
export const BoundingBox: React.FC<NodeProps<BoundingBoxData>> = ({
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
  const [size, setSize] = useState({
    width: data.width || 400,
    height: data.height || 300
  });
  const sizeRef = useRef(size);
  
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  
  // Ensure the node has its dimensions set in ReactFlow on mount
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              width: data.width || 400,
              height: data.height || 300,
              measured: {
                width: data.width || 400,
                height: data.height || 300
              }
            }
          : node
      )
    );
  }, []);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const boxRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNodes } = useReactFlow();
  
  // Calculate contained nodes
  const getContainedNodes = useCallback(() => {
    const allNodes = getNodes();
    const thisBox = allNodes.find(n => n.id === id);
    if (!thisBox) return [];
    
    return allNodes.filter(node => {
      if (node.id === id || node.type === 'boundingBox') return false;
      
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 50;
      
      const boxX = thisBox.position.x;
      const boxY = thisBox.position.y;
      const boxWidth = size.width;
      const boxHeight = size.height;
      
      // Check if node is fully contained within box
      return (
        nodeX >= boxX &&
        nodeY >= boxY &&
        nodeX + nodeWidth <= boxX + boxWidth &&
        nodeY + nodeHeight <= boxY + boxHeight
      );
    });
  }, [id, size, getNodes]);
  
  const containedNodes = getContainedNodes();
  
  // Handle title edit
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  }, []);
  
  const handleTitleSave = useCallback(() => {
    setIsEditingTitle(false);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              title: title
            }
          };
        }
        return node;
      })
    );
  }, [id, title, setNodes]);
  
  // Handle description edit
  const handleDescriptionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
  }, []);
  
  const handleDescriptionSave = useCallback(() => {
    setIsEditingDescription(false);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              description: description
            }
          };
        }
        return node;
      })
    );
  }, [id, description, setNodes]);
  
  // Handle resize - optimized like PostItNote
  const handleResizeStart = useCallback((corner: 'se' | 'sw' | 'ne' | 'nw') => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setIsResizing(true);
    
    // Set node as non-draggable during resize
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, draggable: false }
          : node
      )
    );
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = sizeRef.current.width;
    const startHeight = sizeRef.current.height;
    
    // Track the new size without updating state on every move
    let currentWidth = startWidth;
    let currentHeight = startHeight;
    let hasStartedResizing = false;
    const THRESHOLD = 3; // Pixels of movement required before resize starts
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Check if we've moved enough to start resizing
      if (!hasStartedResizing) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < THRESHOLD) {
          return; // Don't resize yet
        }
        hasStartedResizing = true;
      }
      
      if (corner === 'se') {
        currentWidth = Math.max(200, startWidth + deltaX);
        currentHeight = Math.max(150, startHeight + deltaY);
      } else if (corner === 'sw') {
        currentWidth = Math.max(200, startWidth - deltaX);
        currentHeight = Math.max(150, startHeight + deltaY);
      } else if (corner === 'ne') {
        currentWidth = Math.max(200, startWidth + deltaX);
        currentHeight = Math.max(150, startHeight - deltaY);
      } else if (corner === 'nw') {
        currentWidth = Math.max(200, startWidth - deltaX);
        currentHeight = Math.max(150, startHeight - deltaY);
      }
      
      // Update the DOM directly for smooth visual feedback
      if (boxRef.current) {
        boxRef.current.style.width = `${currentWidth}px`;
        boxRef.current.style.height = `${currentHeight}px`;
        boxRef.current.style.minWidth = `${currentWidth}px`;
        boxRef.current.style.minHeight = `${currentHeight}px`;
        boxRef.current.style.maxWidth = `${currentWidth}px`;
        boxRef.current.style.maxHeight = `${currentHeight}px`;
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Now commit the final size to state and ReactFlow
      const finalWidth = currentWidth;
      const finalHeight = currentHeight;
      
      setSize({ width: finalWidth, height: finalHeight });
      
      // Update ReactFlow node with final dimensions
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              draggable: true,  // Restore draggable
              width: finalWidth,
              height: finalHeight,
              measured: {  // Set measured for ReactFlow to recognize size changes
                width: finalWidth,
                height: finalHeight
              },
              style: {
                ...node.style,
                width: `${finalWidth}px`,
                height: `${finalHeight}px`,
              },
              data: {
                ...node.data,
                width: finalWidth,
                height: finalHeight
              }
            };
          }
          return node;
        })
      );
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, setNodes]);
  
  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              backgroundColor: color
            }
          };
        }
        return node;
      })
    );
    setShowColorPicker(false);
  }, [id, setNodes]);
  
  // Handle opacity change
  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              opacity: opacity
            }
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);
  
  // Handle lock toggle
  const handleLockToggle = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              locked: !data.locked
            }
          };
        }
        return node;
      })
    );
  }, [id, data.locked, setNodes]);
  
  // Focus inputs when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);
  
  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);
  
  // Apply size directly via style - this ensures the visual update happens
  const boxStyle = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    minWidth: `${size.width}px`,
    minHeight: `${size.height}px`,
    maxWidth: `${size.width}px`,
    maxHeight: `${size.height}px`,
    border: 'none',
    position: 'relative' as const,
    overflow: 'visible'
  };
  
  // Create RGBA color from hex color and opacity with saturation compensation
  const getBackgroundWithOpacity = (hexColor: string, opacity: number) => {
    const hex = hexColor.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    // Convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    // Boost saturation as opacity decreases (inverse relationship)
    // When opacity is 0.5, no boost. When opacity is 0.1, boost by 50%
    const saturationBoost = 1 + ((0.5 - opacity) * 1.5);
    s = Math.min(1, s * saturationBoost);
    
    // Convert HSL back to RGB
    let r2, g2, b2;
    
    if (s === 0) {
      r2 = g2 = b2 = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r2 = hue2rgb(p, q, h + 1/3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1/3);
    }
    
    // Convert back to 0-255 range
    r2 = Math.round(r2 * 255);
    g2 = Math.round(g2 * 255);
    b2 = Math.round(b2 * 255);
    
    return `rgba(${r2}, ${g2}, ${b2}, ${opacity})`;
  };
  
  return (
    <div
      ref={boxRef}
      className={`bounding-box ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''}`}
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
        
        {isEditingDescription ? (
          <textarea
            ref={descriptionInputRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleDescriptionSave();
              } else if (e.key === 'Escape') {
                setDescription(data.description || '');
                setIsEditingDescription(false);
              }
            }}
            className="bounding-box-description-input"
            placeholder="Add description..."
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="bounding-box-description"
            onClick={handleDescriptionClick}
          >
            {description || <span className="placeholder">Click to add description...</span>}
          </div>
        )}
      </div>
      
      {/* Status */}
      <div className="bounding-box-status">
        <span className="contained-count">
          {containedNodes.length} node{containedNodes.length !== 1 ? 's' : ''}
        </span>
        <button
          className={`lock-button ${data.locked ? 'locked' : ''}`}
          onClick={handleLockToggle}
          title={data.locked ? 'Unlock nodes' : 'Lock nodes to box'}
        >
          {data.locked ? '🔒' : '🔓'}
        </button>
      </div>
      
      {/* Controls (shown when selected) */}
      {selected && (
        <div className="bounding-box-controls">
          {/* Color picker */}
          <div className="color-picker-container">
            <button
              className="color-picker-button nodrag nopan"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ backgroundColor: data.backgroundColor || defaultColors[0] }}
            />
            {showColorPicker && (
              <div className="color-picker-dropdown nodrag nopan">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    className="color-option"
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(color);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Opacity slider */}
          <div className="opacity-control nodrag nopan">
            <label>Opacity:</label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={data.opacity || 0.3}
              onChange={handleOpacityChange}
              className="opacity-slider nodrag nopan"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      {/* Resize handles (shown when selected) */}
      {selected && !isResizing && (
        <>
          <div
            className="resize-handle resize-handle-se nodrag nopan"
            onMouseDown={handleResizeStart('se')}
          />
          <div
            className="resize-handle resize-handle-sw nodrag nopan"
            onMouseDown={handleResizeStart('sw')}
          />
          <div
            className="resize-handle resize-handle-ne nodrag nopan"
            onMouseDown={handleResizeStart('ne')}
          />
          <div
            className="resize-handle resize-handle-nw nodrag nopan"
            onMouseDown={handleResizeStart('nw')}
          />
        </>
      )}
    </div>
  );
};

BoundingBox.displayName = 'BoundingBox';