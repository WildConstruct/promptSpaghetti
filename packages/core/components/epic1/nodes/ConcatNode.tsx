import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';

export interface ConcatNodeData extends EditableNodeData {
  separator?: string;
}

/**
 * Concat node for Epic 1 - concatenates inputs with optional separator
 */
export const ConcatNode = memo((props: NodeProps<ConcatNodeData>) => {
  return (
    <BaseEditableNode
      {...props}
      className="concat"
      minWidth={150}
      minHeight={60}
    >
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div className="epic1-concat-editor">
              <div className="epic1-node-type-label">Concat</div>
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
                placeholder="Separator (optional)"
                autoFocus
              />
              <div className="epic1-hint">Leave empty for no separator</div>
            </div>
          );
        }

        return (
          <div className="epic1-concat-display">
            <div className="epic1-node-type-label">Concat</div>
            <div className="epic1-separator-preview">
              {value ? `"${value}"` : <span className="epic1-placeholder">No separator</span>}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

ConcatNode.displayName = 'ConcatNode';