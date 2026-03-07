import React, { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { useMetadataFlip, MetadataDisplay, MetadataToggleButton } from '../hooks/useMetadataFlip';

export interface ConcatNodeData extends EditableNodeData {
  separator?: string;
}

/**
 * Concat node for Epic 1 - concatenates inputs with optional separator
 * Has two input handles for ordered concatenation
 */
export const ConcatNode = memo((props: NodeProps<ConcatNodeData>) => {
  const { showMetadata, setShowMetadata, metadata, flipClassName } = useMetadataFlip(props);

  return (
    <BaseEditableNode
      {...props}
      className={`concat ${flipClassName}`}
      minWidth={150}
      minHeight={60}
    >
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <>
              <div className="flip-container">
                <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                  {/* Front side - editor */}
                  <div className="card-face node-front">
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
                    <MetadataToggleButton 
                      showMetadata={showMetadata} 
                      onClick={() => setShowMetadata(!showMetadata)} 
                    />
                  </div>
                  
                  {/* Back side - metadata */}
                  <MetadataDisplay 
                    metadata={metadata} 
                    onClose={() => setShowMetadata(false)} 
                  />
                </div>
              </div>
              
              {/* Custom dual input handles rendered outside flip container */}
              <Handle
                type="target"
                position={Position.Left}
                id="input1"
                className="epic1-handle target concat-input-1"
                style={{ 
                  position: 'absolute',
                  top: '30%',
                  left: '-5px',
                  transform: 'translateY(-50%)',
                  zIndex: 1000
                }}
              />
              <Handle
                type="target"
                position={Position.Left}
                id="input2"
                className="epic1-handle target concat-input-2"
                style={{ 
                  position: 'absolute',
                  top: '70%',
                  left: '-5px',
                  transform: 'translateY(-50%)',
                  zIndex: 1000
                }}
              />
              <Handle
                type="source"
                position={Position.Right}
                id="source"
                className="epic1-handle source concat-output"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-5px',
                  transform: 'translateY(-50%)',
                  zIndex: 1000
                }}
              />
            </>
          );
        }

        return (
          <>
            <div className="epic1-concat-display">
              <div className="epic1-node-type-label">Concat</div>
              <div className="epic1-separator-preview">
                {value ? `"${value}"` : <span className="epic1-placeholder">No separator</span>}
              </div>
            </div>
            
            {/* Custom dual input handles rendered inside the node */}
            <Handle
              type="target"
              position={Position.Left}
              id="input1"
              className="epic1-handle target concat-input-1"
              style={{ 
                position: 'absolute',
                top: '30%',
                left: '-5px',
                transform: 'translateY(-50%)',
                zIndex: 1000
              }}
            />
            <Handle
              type="target"
              position={Position.Left}
              id="input2"
              className="epic1-handle target concat-input-2"
              style={{ 
                position: 'absolute',
                top: '70%',
                left: '-5px',
                transform: 'translateY(-50%)',
                zIndex: 1000
              }}
            />
            <Handle
              type="source"
              position={Position.Right}
              id="source"
              className="epic1-handle source concat-output"
              style={{
                position: 'absolute',
                top: '50%',
                right: '-5px',
                transform: 'translateY(-50%)',
                zIndex: 1000
              }}
            />
          </>
        );
      }}
    </BaseEditableNode>
  );
});

ConcatNode.displayName = 'ConcatNode';
