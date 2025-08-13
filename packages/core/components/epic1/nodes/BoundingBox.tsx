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
  '#FFE5B4', // Peach
  '#E6E6FA', // Lavender
  '#F0FFFF', // Azure
  '#F5F5DC', // Beige
  '#FFE4E1', // Misty Rose
  '#E0FFFF', // Light Cyan
  '#F0FFF0', // Honeydew
  '#FFF0F5', // Lavender Blush
];

/**
 * Bounding Box component for visual organization of nodes
 * Story 1.26: Bounding Boxes/Regions
 */
export const BoundingBox: React.FC<NodeProps<BoundingBoxData>> = ({
  data,
  selected,
  id
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
  
  // Handle resize
  const handleResizeStart = useCallback((corner: 'se' | 'sw' | 'ne' | 'nw') => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (corner === 'se') {
        newWidth = Math.max(100, startWidth + e.clientX - startX);
        newHeight = Math.max(100, startHeight + e.clientY - startY);
      } else if (corner === 'sw') {
        newWidth = Math.max(100, startWidth - (e.clientX - startX));
        newHeight = Math.max(100, startHeight + e.clientY - startY);
      } else if (corner === 'ne') {
        newWidth = Math.max(100, startWidth + e.clientX - startX);
        newHeight = Math.max(100, startHeight - (e.clientY - startY));
      } else if (corner === 'nw') {
        newWidth = Math.max(100, startWidth - (e.clientX - startX));
        newHeight = Math.max(100, startHeight - (e.clientY - startY));
      }
      
      setSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      // Update node data with new size
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                width: size.width,
                height: size.height
              }
            };
          }
          return node;
        })
      );
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size, id, setNodes]);
  
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
  
  const boxStyle = {
    width: size.width,
    height: size.height,
    backgroundColor: data.backgroundColor || defaultColors[0],
    opacity: data.opacity || 0.3,
    border: `${data.borderWidth || 2}px ${data.borderStyle || 'dashed'} ${data.borderColor || '#666'}`,
    zIndex: -1, // Behind nodes
  };
  
  return (
    <div
      ref={boxRef}
      className={`bounding-box ${selected ? 'selected' : ''}`}
      style={boxStyle}
    >
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
              className="color-picker-button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{ backgroundColor: data.backgroundColor || defaultColors[0] }}
            />
            {showColorPicker && (
              <div className="color-picker-dropdown">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    className="color-option"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Opacity slider */}
          <div className="opacity-control">
            <label>Opacity:</label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={data.opacity || 0.3}
              onChange={handleOpacityChange}
              className="opacity-slider"
            />
          </div>
        </div>
      )}
      
      {/* Resize handles (shown when selected) */}
      {selected && !isResizing && (
        <>
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={handleResizeStart('se')}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={handleResizeStart('sw')}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={handleResizeStart('ne')}
          />
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={handleResizeStart('nw')}
          />
        </>
      )}
    </div>
  );
};

BoundingBox.displayName = 'BoundingBox';