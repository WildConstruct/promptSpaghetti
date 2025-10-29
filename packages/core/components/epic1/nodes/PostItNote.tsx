import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, useStore, useReactFlow } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import './PostItNote.css';
import type { Epic1NodeProps } from './nodePropTypes';
interface SnapNode {
  id: string;
  position: { x: number; y: number };
  width?: number | null;
  height?: number | null;
  type?: string;
}

export interface PostItNoteData {
  text: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'orange' | 'purple';
  collapsed: boolean;
  width?: number;
  height?: number;
  attachedTo?: string; // ID of attached node
  attachmentOffset?: { x: number; y: number }; // Offset from attached node
}

const colorMap = {
  yellow: '#d4c896',  // Desaturated yellow, easier on eyes in dark mode
  blue: '#40d9ff',
  green: '#40ff90',
  pink: '#ff40a0',
  orange: '#ff9940',
  purple: '#a040ff'
};

/**
 * Post-it Note component for annotations
 * Story 1.25: Post-it Notes/Comments
 */
export const PostItNote: React.FC<Epic1NodeProps<PostItNoteData>> = ({
  data,
  selected,
  id,
  xPos,
  yPos,
  draggable = true,
  measured
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({
    width: data.width || 200,
    height: data.height || 150
  });
  const [isCollapsed, setIsCollapsed] = useState(data.collapsed || false);
  const sizeRef = useRef(size);
  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNode, getNodes } = useReactFlow();
  
  // Ensure the node has its dimensions set in ReactFlow on mount
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              width: data.width || 200,
              height: data.height || 150,
              measured: {
                width: data.width || 200,
                height: data.height || 150
              }
            }
          : node
      )
    );
  }, []);
  
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  
  // Update size when data changes (e.g., from undo/redo or external updates)
  useEffect(() => {
    if (data.width !== undefined && data.height !== undefined) {
      setSize({
        width: data.width,
        height: data.height
      });
    }
  }, [data.width, data.height]);
  
  // Get attached node position for visual connection
  const attachedNode = data.attachedTo ? getNode(data.attachedTo) : null;
  
  // Handle drag end to check for nearby nodes to attach to
  const handleDragEnd = useCallback(() => {
    const allNodes = getNodes() as SnapNode[];
    const thisNode = allNodes.find(n => n.id === id);
    if (!thisNode) return;
    
    // Find nearest node within attachment distance (100px)
    let nearestNode: SnapNode | null = null;
    let nearestDistance = Infinity;
    
    allNodes.forEach((node) => {
      if (node.id === id || node.type === 'postItNote') return; // Don't attach to self or other notes
      
      const distance = Math.sqrt(
        Math.pow(node.position.x - thisNode.position.x, 2) +
        Math.pow(node.position.y - thisNode.position.y, 2)
      );
      
      if (distance < 100 && distance < nearestDistance) {
        nearestDistance = distance;
        nearestNode = node;
      }
    });
    
    // Update attachment if near a node
    if (!nearestNode) {
      if (data.attachedTo) {
        // Clear attachment if moved away
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  attachedTo: undefined,
                  attachmentOffset: undefined
                }
              };
            }
            return node;
          })
        );
      }
      return;
    }

    const resolvedNode = nearestNode as SnapNode;
    const targetId = resolvedNode.id;
    const attachmentOffset = {
      x: thisNode.position.x - resolvedNode.position.x,
      y: thisNode.position.y - resolvedNode.position.y
    };

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              attachedTo: targetId,
              attachmentOffset
            }
          };
        }
        return node;
      })
    );
  }, [id, data.attachedTo, getNodes, setNodes]);

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    setIsEditing(false);
    // Update node data through React Flow
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              text: text
            }
          };
        }
        return node;
      })
    );
  }, [id, text, setNodes]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setText(data.text || '');
    setIsEditing(false);
  }, [data.text]);
  
  // Toggle collapse state
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              collapsed: !isCollapsed
            }
          };
        }
        return node;
      })
    );
  }, [id, isCollapsed, setNodes]);
  
  // Handle delete
  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  // Handle resize - optimized for performance
  const handleResizeStart = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Stop the event from bubbling to ReactFlow
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

    const startX = ('clientX' in e) ? e.clientX : (e as React.PointerEvent).clientX;
    const startY = ('clientY' in e) ? e.clientY : (e as React.PointerEvent).clientY;
    const startWidth = sizeRef.current.width;  // Use ref to get current size
    const startHeight = sizeRef.current.height;
    
    // Track the new size without updating state on every move
    let currentWidth = startWidth;
    let currentHeight = startHeight;
    let hasStartedResizing = false;
    const THRESHOLD = 5; // Pixels of movement required before resize starts

    const handleMouseMove = (ev: MouseEvent | PointerEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      const clientX = ('clientX' in ev) ? ev.clientX : (ev as PointerEvent).clientX;
      const clientY = ('clientY' in ev) ? ev.clientY : (ev as PointerEvent).clientY;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      
      // Check if we've moved enough to start resizing
      if (!hasStartedResizing) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < THRESHOLD) {
          return; // Don't resize yet
        }
        hasStartedResizing = true;
      }
      
      currentWidth = Math.max(150, startWidth + deltaX);
      currentHeight = Math.max(100, startHeight + deltaY);
      
      // Update the DOM directly for smooth visual feedback
      if (nodeRef.current) {
        nodeRef.current.style.width = `${currentWidth}px`;
        nodeRef.current.style.height = `${currentHeight}px`;
        nodeRef.current.style.minWidth = `${currentWidth}px`;
        nodeRef.current.style.minHeight = `${currentHeight}px`;
        nodeRef.current.style.maxWidth = `${currentWidth}px`;
        nodeRef.current.style.maxHeight = `${currentHeight}px`;
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
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                draggable: true,  // Restore draggable
                width: finalWidth,
                height: finalHeight,
                measured: {
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
                  height: finalHeight,
                },
              }
            : node
        )
      );
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointermove', handleMouseMove);
      document.removeEventListener('pointerup', handleMouseUp);
    };

    // Add both mouse and pointer event listeners for better compatibility
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointermove', handleMouseMove, { passive: false });
    document.addEventListener('pointerup', handleMouseUp);
  }, [id, setNodes]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const backgroundColor = colorMap[data.color || 'yellow'];

  // Apply size directly via style - this ensures the visual update happens
  const nodeStyle = {
    backgroundColor,
    width: `${isCollapsed ? 200 : size.width}px`,
    height: `${isCollapsed ? 40 : size.height}px`,
    minWidth: `${isCollapsed ? 200 : size.width}px`,
    minHeight: `${isCollapsed ? 40 : size.height}px`,
    maxWidth: `${isCollapsed ? 200 : size.width}px`,
    maxHeight: `${isCollapsed ? 40 : size.height}px`,
    boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
    cursor: isEditing ? 'text' : (isResizing ? 'nwse-resize' : 'move'),
    position: 'relative' as const,
    overflow: 'hidden'
  };

  return (
    <div
      ref={nodeRef}
      className={`post-it-note ${selected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={nodeStyle}
      onDoubleClick={handleDoubleClick}
      onMouseUp={() => {
        if (!isResizing) {
          handleDragEnd();
        }
      }}
      data-attached={!!data.attachedTo}
      data-color={data.color || 'yellow'}
      data-resizing={isResizing}
    >
      {/* Delete button */}
      <button
        className="post-it-delete"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        title="Delete note"
      >
        ×
      </button>

      {/* Collapse toggle */}
      <button
        className="post-it-collapse"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleCollapse();
        }}
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? '▶' : '▼'}
      </button>

      {/* Content area */}
      {!isCollapsed && (
        <div className="post-it-content">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="post-it-editor"
              placeholder="Type your note here... (Markdown supported)"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent'
              }}
            />
          ) : (
            <div className="post-it-markdown">
              {text ? (
                <ReactMarkdown>{text}</ReactMarkdown>
              ) : (
                <div className="post-it-placeholder">
                  Double-click to add note...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resize handle */}
      {!isCollapsed && !isEditing && (
        <div
          className="post-it-resize nodrag nopan"
          onMouseDown={handleResizeStart}
          onPointerDown={handleResizeStart}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            zIndex: 1000,
            pointerEvents: 'auto',
            opacity: isResizing ? 1 : (selected ? 0.7 : 0.3)
          }}
          title="Drag to resize"
        />
      )}

      {/* Connection handle only shown when attached to nodes */}
      {data.attachedTo && (
        <Handle
          type="target"
          position={Position.Left}
          id="attach"
          className="post-it-handle"
          style={{ 
            background: 'transparent', 
            border: 'none',
            visibility: 'hidden'  // Hide the handle visually
          }}
        />
      )}
    </div>
  );
};

PostItNote.displayName = 'PostItNote';
