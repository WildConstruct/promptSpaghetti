import React, { memo, useRef, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';

export interface TextBlockNodeData extends EditableNodeData {
  text: string;
}

/**
 * TextBlock node for Epic 1 - displays and edits plain text content
 */
export const TextBlockNode = memo((props: NodeProps<TextBlockNodeData>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <BaseEditableNode
      {...props}
      className="text-block"
      minWidth={200}
      minHeight={80}
    >
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        // Auto-focus and select text when entering edit mode
        useEffect(() => {
          if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
          }
        }, [isEditing]);

        if (isEditing) {
          return (
            <textarea
              ref={textareaRef}
              className="epic1-inline-textarea"
              value={editBuffer}
              onChange={(e) => updateBuffer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  confirmEdit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEdit();
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter text..."
            />
          );
        }

        return (
          <div className="epic1-text-display">
            <div className="epic1-node-type-label">Text Block</div>
            <div className="epic1-text-content">
              {value || <span className="epic1-placeholder">Click to edit text</span>}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

TextBlockNode.displayName = 'TextBlockNode';