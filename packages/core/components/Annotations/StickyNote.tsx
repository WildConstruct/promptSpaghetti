/**
 * Sticky Note Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 * 
 * Draggable, resizable sticky note with rich text editing capabilities
 * and color coding for team collaboration.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  StickyNote as StickyNoteType, 
  StickyNoteColor, 
  STICKY_NOTE_COLORS,
  STICKY_NOTE_CONSTRAINTS,
  StickyNoteAction
} from '../../types/CollaborationTypes';
interface StickyNoteProps {
  note: StickyNoteType;
  onAction: (action: StickyNoteAction) => void;
  onContextMenu?: (e: React.MouseEvent, noteId: string) => void;
  selected?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canMove?: boolean;
  canResize?: boolean;
  export const StickyNote: React.FC<StickyNoteProps> = ({,)
  note,
  onAction,
  onContextMenu,
  selected = false,
  canEdit = true,
  canDelete = true,
  canMove = true,
  canResize = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ )
    x: 0, y: 0, width: 0, height: 0 ;
  });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorInfo = STICKY_NOTE_COLORS[note.color];
  // Handle note content changes
  const handleContentChange = useCallback((content: string) => {
    if (content.length <= STICKY_NOTE_CONSTRAINTS.maxContentLength) {
      onAction({)
  type: 'update',
        noteId: note.id,
        note: { content }
      });
  }, [note.id, onAction]);
  // Handle color changes
  const handleColorChange = useCallback((color: StickyNoteColor) => {
    onAction({)
  type: 'update',
      noteId: note.id,
      note: { color }
    });
  }, [note.id, onAction]);
  // Start editing mode
  const startEditing = useCallback(() => {
  if (canEdit) {
  onAction({)
  type: 'startEdit',
  noteId: note.id,
});
  }, [note.id, onAction, canEdit]);
  // Stop editing mode
  const stopEditing = useCallback(() => {
  onAction({)
  type: 'stopEdit',
  noteId: note.id,
});
  }, [note.id, onAction]);
  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
  if (!canMove || note.isEditing || isResizing) return;
  e.preventDefault();
  e.stopPropagation();
  const rect = noteRef.current?.getBoundingClientRect();
  if (rect) {
  setDragOffset({)
  x: e.clientX - rect.left,
  y: e.clientY - rect.top,
});
      setIsDragging(true);
  }, [canMove, note.isEditing, isResizing]);
  // Handle resize mouse down
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
  if (!canResize) return;
  e.preventDefault();
  e.stopPropagation();
  setResizeStart({)
  x: e.clientX,
  y: e.clientY,
  width: note.size.width,
  height: note.size.height,
});
    setIsResizing(true);
  }, [canResize, note.size]);
  // Handle global mouse move
  useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {,
  if (isDragging) {
  const newPosition = {
  x: e.clientX - dragOffset.x,
  y: e.clientY - dragOffset.y,
};
        onAction({)
  type: 'move',
  noteId: note.id,
  position: newPosition,
});
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(;);
          STICKY_NOTE_CONSTRAINTS.minWidth,
          Math.min(STICKY_NOTE_CONSTRAINTS.maxWidth, resizeStart.width + deltaX)
        );
        const newHeight = Math.max(;);
          STICKY_NOTE_CONSTRAINTS.minHeight,
          Math.min(STICKY_NOTE_CONSTRAINTS.maxHeight, resizeStart.height + deltaY)
        );
        onAction({)
  type: 'resize',
          noteId: note.id,
          size: { width: newWidth, height: newHeight }
        });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, isResizing, dragOffset, resizeStart, note.id, onAction]);
  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (note.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
  }, [note.isEditing]);
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      stopEditing();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      stopEditing();
  }, [stopEditing]);
  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, note.id);
  }, [onContextMenu, note.id]);
  return;
    <div
      ref={noteRef}
      className="sticky-note"
      style={{
        position: 'absolute',
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        height: note.size.height,
        background: colorInfo.background,
        border: `2px solid ${selected ? '#4d7cff' : colorInfo.border}`}
},
  borderRadius: 8,
        boxShadow: `0 4px 12px ${colorInfo.shadow}, 0 2px 4px rgba(0,0,0,0.1)`}
},
  cursor: isDragging ? 'grabbing' : (canMove && !note.isEditing ? 'grab' : 'default'),
        zIndex: note.zIndex || 1000,
        userSelect: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        opacity: isDragging ? 0.8 : 1;
  }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={startEditing}
    >
      {/* Note Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderBottom: `1px solid ${colorInfo.border}20`}
},
  fontSize: 11,
        fontWeight: 500,
        color: colorInfo.text,
        opacity: 0.8;
  }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: colorInfo.border,
}} />
          <span>{colorInfo.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Color picker */}
          <div style={{ display: 'flex', gap: 2 }}>
            {Object.entries(STICKY_NOTE_COLORS).map(([color, info]) => ()
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorChange(color as StickyNoteColor);
                }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: info.background,
                  border: `1px solid ${info.border}`}
},
  cursor: 'pointer',
                  opacity: note.color === color ? 1 : 0.6,
                  transform: note.color === color ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.15s ease';
  }}
                title={info.description}
              />
            ))}
          </div>
          {/* Delete button */}
          {canDelete && ()
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction({ type: 'delete', noteId: note.id });
              }}
              style={{
  width: 16,
  height: 16,
  borderRadius: 4,
  background: 'transparent',
  border: 'none',
  color: colorInfo.text,
  cursor: 'pointer',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.6,
  transition: 'opacity 0.15s ease',
}}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              title="Delete note"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Note Content */}
      <div style={{
  padding: '8px 12px',
  height: 'calc(100% - 40px)',
  overflow: 'hidden',
}}>
        {note.isEditing ? ()
          <textarea
            ref={textareaRef}
            value={note.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={stopEditing}
            onKeyDown={handleKeyDown}
            placeholder="Enter your note here... (Ctrl+Enter to save, Esc to cancel)"
            style={{
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: colorInfo.text,
  fontSize: 13,
  fontFamily: 'inherit',
  resize: 'none',
  lineHeight: 1.4,
}}
          />
        ) : ()
          <div
            style={{
  width: '100%',
  height: '100%',
  color: colorInfo.text,
  fontSize: 13,
  lineHeight: 1.4,
  wordWrap: 'break-word',
  overflow: 'auto',
  cursor: canEdit ? 'text' : 'default',
}}
            onClick={canEdit ? startEditing : undefined}
          >
            {note.content || ()
              <span style={{ opacity: 0.5, fontStyle: 'italic' }}>
                Double-click to add content...
              </span>
            )}
          </div>
        )}
      </div>
      {/* Resize Handle */}
      {canResize && !note.isEditing && ()
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 16,
  height: 16,
  cursor: 'nw-resize',
  background: colorInfo.border,
  borderRadius: '8px 0 6px 0',
  opacity: 0.6,
  transition: 'opacity 0.15s ease',
}}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
        >
          <div style={{
  position: 'absolute',
  bottom: 2,
  right: 2,
  width: 3,
  height: 3,
  background: 'white',
  borderRadius: '50%',
}} />
        </div>
      )}
      {/* Author and timestamp info */}
      <div style={{
  position: 'absolute',
  bottom: -20,
  left: 0,
  fontSize: 9,
  color: '#6b7280',
  opacity: selected ? 1 : 0,
  transition: 'opacity 0.2s ease',
}}>
        {note.author} • {new Date(note.timestamp).toLocaleString()}
      </div>
    </div>
  );
};