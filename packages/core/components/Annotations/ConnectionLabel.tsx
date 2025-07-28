/**
 * Connection Label Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 4
 * 
 * Advanced connection labeling component with inline editing, positioning
 * along connection paths, and professional styling for annotating relationships.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ConnectionLabel as ConnectionLabelType, 
  ConnectionLabelAction,
  CONNECTION_LABEL_STYLES
} from '../../types/CollaborationTypes';
interface ConnectionLabelProps {
  label: ConnectionLabelType;
  onAction: (action: ConnectionLabelAction) => void;
  canEdit?: boolean;
  showTooltip?: boolean;
  isHighlighted?: boolean;
  connectionPath?: string; // SVG path for positioning calculations
}

export const ConnectionLabel: React.FC<ConnectionLabelProps> = ({)
  label,
  onAction,
  canEdit = true,
  showTooltip = true,
  isHighlighted = false,
  connectionPath
}) => {
  const [isEditing, setIsEditing] = useState(label.isEditing || false);
  const [editValue, setEditValue] = useState(label.content);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const labelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Get label styles
  const getLabelStyles = useCallback(() => {
    const baseStyle = CONNECTION_LABEL_STYLES[label.style] || CONNECTION_LABEL_STYLES.default;
    return {
      ...baseStyle,
      ...(label.color && { color: label.color }),
      ...(label.backgroundColor && { background: label.backgroundColor }),
      ...(label.fontSize && { fontSize: label.fontSize }),
      ...(label.fontWeight && { fontWeight: label.fontWeight }),
      cursor: canEdit ? 'pointer' : 'default',
      userSelect: 'none' as const,
      maxWidth: '200px',
      wordBreak: 'break-word' as const,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      pointerEvents: 'all' as const,
      ...(isHighlighted && {)
        transform: 'scale(1.1)',
        boxShadow: `0 4px 12px ${baseStyle.color}40`,}
        zIndex: 1000,
      })
    };
  }, [label, canEdit, isHighlighted]);
  // Handle double-click to start editing
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!canEdit) return;
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setEditValue(label.content);
    onAction({)
      type: 'startEdit',
      labelId: label.id,
      connectionId: label.connectionId,
    });
  }, [canEdit, label.content, label.id, label.connectionId, onAction]);
  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maxLength = 100; // Could be configurable;
    if (value.length <= maxLength) {
      setEditValue(value);
    }
  }, []);
  // Save label changes
  const saveLabel = useCallback(() => {
    const newContent = editValue.trim();
    setIsEditing(false);
    onAction({)
      type: 'update',
      labelId: label.id,
      connectionId: label.connectionId,
      content: newContent || 'Untitled',
      label: {,
        content: newContent || 'Untitled',
        isEditing: false,
        lastModified: new Date().toISOString()
      }
    });
    onAction({)
      type: 'stopEdit',
      labelId: label.id,
      connectionId: label.connectionId,
    });
  }, [editValue, label.id, label.connectionId, onAction]);
  // Cancel editing
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue(label.content);
    onAction({)
      type: 'stopEdit',
      labelId: label.id,
      connectionId: label.connectionId,
    });
  }, [label.content, label.id, label.connectionId, onAction]);
  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        saveLabel();
        break;
      case 'Escape':
        e.preventDefault();
        cancelEdit();
        break;
    }
  }, [saveLabel, cancelEdit]);
  // Handle blur
  const handleBlur = useCallback(() => {
    saveLabel();
  }, [saveLabel]);
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canEdit || isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({)
      x: e.clientX - label.position.x,
      y: e.clientY - label.position.y
    });
  }, [canEdit, isEditing, label.position]);
  // Handle drag movement
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      onAction({)
        type: 'move',
        labelId: label.id,
        connectionId: label.connectionId,
        position: newPosition,
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, label.id, label.connectionId, onAction]);
  // Don't render if not visible
  if (!label.visible) {
    return null;
  }
  const labelStyles = getLabelStyles();
  return ()
    <div
      ref={labelRef}
      data-testid={`connection-label-${label.id}`}
      style={{
        position: 'absolute',
        left: label.position.x,
        top: label.position.y,
        zIndex: isHighlighted ? 1000 : 100,
        transform: 'translate(-50%, -50%)', // Center on position
        ...labelStyles,
        ...(isDragging && {)
          cursor: 'grabbing',
          transform: 'translate(-50%, -50%) scale(1.05)',
          boxShadow: `0 8px 20px ${labelStyles.color}40`}
        })
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title={showTooltip ? label.content : undefined}
    >
      {isEditing ? ()
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            ...labelStyles,
            outline: 'none',
            border: '2px solid #3b82f6',
            cursor: 'text',
            minWidth: '80px',
            maxWidth: '200px',
            background: 'white',
          }}
          placeholder="Enter label..."
          maxLength={100}
        />
      ) : ()
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Icon */}
          {label.showIcon && label.icon && ()
            <span style={{ fontSize: '12px' }}>
              {label.icon}
            </span>
          )}
          {/* Content */}
          <span>{label.content}</span>
          {/* Edit indicator */}
          {canEdit && ()
            <span 
              style={{ 
                fontSize: '8px', 
                opacity: 0.6,
                marginLeft: '2px',
              }}
            >
              ✏️
            </span>
          )}
        </div>
      )}
      {/* Delete button for labels */}
      {canEdit && !isEditing && ()
        <button
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAction({)
              type: 'delete',
              labelId: label.id,
              connectionId: label.connectionId,
            });
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          title="Remove label"
        >
          ×
        </button>
      )}
      {/* Arrow pointer for arrow style */}
      {label.style === 'arrow' && ()
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #fbbf24'
          }}
        />
      )}
      {/* Glow effect for highlight style */}
      {label.style === 'highlight' && ()
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            borderRadius: '12px',
            zIndex: -1,
            animation: 'pulse 2s infinite'
          }}
        />
      )}
      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        [data-testid^="connection-label-"] {
          animation: labelFadeIn 0.3s ease-out;
        }
        @keyframes labelFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ConnectionLabel;