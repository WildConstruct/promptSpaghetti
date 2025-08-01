import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';

export interface VariableNodeData extends EditableNodeData {
  variableName: string;
  isGetter?: boolean;
}

/**
 * Variable node for Epic 1 - gets or sets variables
 */
export const VariableNode = memo((props: NodeProps<VariableNodeData>) => {
  const isGetter = props.data.isGetter ?? false;

  return (
    <BaseEditableNode
      {...props}
      className="variable"
      minWidth={180}
      minHeight={70}
    >
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div className="epic1-variable-editor">
              <div className="epic1-node-type-label">
                {isGetter ? 'Get Variable' : 'Set Variable'}
              </div>
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
                placeholder="Variable name..."
                autoFocus
              />
            </div>
          );
        }

        return (
          <div className="epic1-variable-display">
            <div className="epic1-node-type-label">
              {isGetter ? 'Get Variable' : 'Set Variable'}
            </div>
            <div className="epic1-variable-name">
              <span className="epic1-variable-prefix">${isGetter ? '' : '='}</span>
              {value || <span className="epic1-placeholder">unnamed</span>}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

VariableNode.displayName = 'VariableNode';