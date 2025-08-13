import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, Handle, Position, useStore, useReactFlow } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import './PostItNote.css';

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
  yellow: '#fff740',
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
export const PostItNote: React.FC<NodeProps<PostItNoteData>> = ({
  data,
  selected,
  id
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({
    width: data.width || 200,
    height: data.height || 150
  });
  const [isCollapsed, setIsCollapsed] = useState(data.collapsed || false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNode, getNodes } = useReactFlow();
  
  // Get attached node position for visual connection
  const attachedNode = data.attachedTo ? getNode(data.attachedTo) : null;
  
  // Handle drag end to check for nearby nodes to attach to
  const handleDragEnd = useCallback(() => {
    const allNodes = getNodes();
    const thisNode = allNodes.find(n => n.id === id);
    if (!thisNode) return;
    
    // Find nearest node within attachment distance (100px)
    let nearestNode = null;
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
    if (nearestNode) {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                attachedTo: nearestNode.id,
                attachmentOffset: {
                  x: thisNode.position.x - nearestNode.position.x,
                  y: thisNode.position.y - nearestNode.position.y
                }
              }
            };
          }
          return node;
        })
      );
    } else if (data.attachedTo) {
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

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(150, startWidth + e.clientX - startX);
      const newHeight = Math.max(100, startHeight + e.clientY - startY);
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size]);

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

  return (
    <div
      ref={nodeRef}
      className={`post-it-note ${selected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        backgroundColor,
        width: isCollapsed ? 200 : size.width,
        height: isCollapsed ? 40 : size.height,
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
        cursor: isEditing ? 'text' : 'move'
      }}
      onDoubleClick={handleDoubleClick}
      onMouseUp={handleDragEnd}
      data-attached={!!data.attachedTo}
      data-color={data.color || 'yellow'}
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
          className="post-it-resize"
          onMouseDown={handleResizeStart}
          style={{
            cursor: isResizing ? 'nwse-resize' : 'nwse-resize'
          }}
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