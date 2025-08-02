import React, { useState, useRef, useEffect, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SaveIndicator } from './SaveIndicator';
import { useEditTransitions } from '../hooks/useEditTransitions';
import './BaseEditableNode.css';
import './VisualFeedbackEnhancements.css';
import '../animations/EditTransitions.css';

export interface EditableNodeData {
  isEditing?: boolean;
  value: string;
  editBuffer?: string;
  nodeType: string;
  onEdit?: (newValue: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  [key: string]: any;
}

export interface BaseEditableNodeProps extends NodeProps<EditableNodeData> {
  children: (props: {
    isEditing: boolean;
    value: string;
    editBuffer: string;
    startEdit: () => void;
    updateBuffer: (value: string) => void;
    confirmEdit: () => void;
    cancelEdit: () => void;
  }) => React.ReactNode;
  className?: string;
  minWidth?: number;
  minHeight?: number;
}

/**
 * Base component for Epic 1 inline-editable React Flow nodes.
 * Provides edit state management and visual feedback.
 */
export const BaseEditableNode = memo(({
  data,
  selected,
  children,
  className = '',
  minWidth = 200,
  minHeight = 80,
}: BaseEditableNodeProps) => {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [editBuffer, setEditBuffer] = useState(data.editBuffer || data.value || '');
  const [saveTrigger, setSaveTrigger] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Animation state management
  const {
    transitionState,
    triggerValueConfirmed,
    triggerValueCancelled,
    animationClasses
  } = useEditTransitions({
    isEditing,
    isFocused: selected,
    hasError: false
  });

  // Update edit buffer when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditBuffer(data.value || '');
    }
  }, [data.value, isEditing]);

  // Start editing mode
  const startEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditBuffer(data.value || '');
      data.onEditStart?.();
    }
  };

  // Update temporary edit buffer
  const updateBuffer = (value: string) => {
    setEditBuffer(value);
  };

  // Confirm edits and exit edit mode
  const confirmEdit = () => {
    if (isEditing) {
      data.onEdit?.(editBuffer);
      setIsEditing(false);
      data.onEditEnd?.();
      // Trigger save animation
      setSaveTrigger(prev => prev + 1);
      triggerValueConfirmed();
    }
  };

  // Cancel edits and restore original value
  const cancelEdit = () => {
    if (isEditing) {
      setEditBuffer(data.value || '');
      setIsEditing(false);
      data.onEditEnd?.();
      triggerValueCancelled();
    }
  };

  // Handle click outside to confirm edits
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        confirmEdit();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, editBuffer]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        confirmEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    }
  };

  // Node click handler
  const handleNodeClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      e.stopPropagation();
      startEdit();
    } else {
      // When in editing mode, stop propagation to allow child elements to handle clicks
      e.stopPropagation();
    }
  };

  // Context menu handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    data.onContextMenu?.(e);
  };

  return (
    <div
      ref={nodeRef}
      className={`epic1-editable-node ${className} ${isEditing ? 'editing' : ''} ${selected ? 'selected' : ''} ${animationClasses}`}
      onClick={!isEditing ? handleNodeClick : undefined}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      style={{
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="epic1-handle target"
      />
      
      <div className="epic1-node-content">
        {children({
          isEditing,
          value: data.value,
          editBuffer,
          startEdit,
          updateBuffer,
          confirmEdit,
          cancelEdit,
        })}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="epic1-handle source"
      />

      {/* Visual feedback indicators */}
      {isEditing && <div className="epic1-edit-indicator" />}
      {selected && !isEditing && <div className="epic1-selected-indicator" />}
      <SaveIndicator trigger={saveTrigger} />
    </div>
  );
});

BaseEditableNode.displayName = 'BaseEditableNode';