import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';

export interface OutputNodeData extends EditableNodeData {
  label?: string;
}

/**
 * Output node for Epic 1 - marks the final output
 */
export const OutputNode = memo((props: NodeProps<OutputNodeData>) => {
  return (
    <BaseEditableNode
      {...props}
      className="output"
      minWidth={120}
      minHeight={60}
    >
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
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
          );
        }

        return (
          <div className="epic1-output-display">
            <div className="epic1-node-type-label">Output</div>
            <div className="epic1-output-label">
              {value || <span className="epic1-output-icon">→</span>}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

OutputNode.displayName = 'OutputNode';