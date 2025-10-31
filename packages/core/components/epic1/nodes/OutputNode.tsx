import React, { memo } from 'react';
import { NodeProps, Handle, Position, useStore } from 'reactflow';
import { EditableNodeData } from './BaseEditableNode';
import { SaveIndicator } from './SaveIndicator';
import { useEditTransitions } from '../hooks/useEditTransitions';
import './BaseEditableNode.css';
import './OutputNode.css';
import './VisualFeedbackEnhancements.css';
import '../animations/EditTransitions.css';

export interface OutputNodeData extends EditableNodeData {
  label?: string;
}

/**
 * Output node for Epic 1 - marks the final output
 * Only has input handle (target) since outputs can't have outputs
 */
export const OutputNode = memo((props: NodeProps<OutputNodeData>) => {
  const { data, selected, id } = props;
  const [isEditing, setIsEditing] = React.useState(data.isEditing || false);
  const [editBuffer, setEditBuffer] = React.useState(data.editBuffer || data.value || '');
  const [saveTrigger, setSaveTrigger] = React.useState(0);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  
  // Check if the node has any incoming connections
  const hasConnection = useStore((state) => {
    const edges = state.edges;
    return edges.some(edge => edge.target === id);
  });
  
  // Animation state management
  const {
    triggerValueConfirmed,
    triggerValueCancelled,
    animationClasses
  } = useEditTransitions({
    isEditing,
    isFocused: selected,
    hasError: false
  });

  // Update edit buffer when value changes externally
  React.useEffect(() => {
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
  const confirmEdit = React.useCallback(() => {
    if (!isEditing) {
      return;
    }

    data.onEdit?.(editBuffer);
    setIsEditing(false);
    data.onEditEnd?.();
    setSaveTrigger(prev => prev + 1);
    triggerValueConfirmed();
  }, [data, editBuffer, isEditing, triggerValueConfirmed]);

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
  React.useEffect(() => {
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
  }, [isEditing, confirmEdit]);

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
      className={`epic1-editable-node output ${isEditing ? 'editing' : ''} ${selected ? 'selected' : ''} ${animationClasses}`}
      onClick={!isEditing ? handleNodeClick : undefined}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      style={{
        minWidth: '120px',
        minHeight: '60px',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`epic1-handle target ${!hasConnection ? 'hidden-handle' : ''}`}
        style={{
          opacity: hasConnection ? 1 : 0,
          pointerEvents: 'all'
        }}
      />
      
      <div className="epic1-node-content">
        {isEditing ? (
          <div className="epic1-output-editor">
            <div className="epic1-node-type-label">Output</div>
            <input
              type="text"
              className="epic1-inline-input"
              value={editBuffer}
              onChange={(e) => updateBuffer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  confirmEdit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEdit();
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Label (optional)"
              autoFocus
            />
          </div>
        ) : (
          <div className="epic1-output-display">
            <div className="epic1-node-type-label">Output</div>
            <div className="epic1-output-label">
              {data.value || <span className="epic1-output-icon">→</span>}
            </div>
          </div>
        )}
      </div>

      {/* Visual feedback indicators */}
      {isEditing && <div className="epic1-edit-indicator" />}
      {selected && !isEditing && <div className="epic1-selected-indicator" />}
      <SaveIndicator trigger={saveTrigger} />
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
