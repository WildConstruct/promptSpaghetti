import React, { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { useMetadataFlip, MetadataDisplay, MetadataToggleButton } from '../hooks/useMetadataFlip';
import './VariableNode.css';

export interface VariableNodeData extends EditableNodeData {
  variableName: string;
  isGetter?: boolean;
  mergeMode?: 'override' | 'template' | 'append';
  hasDataInlet?: boolean;
  dataInletConnected?: boolean;
  resolvedValue?: any;
  dataSource?: 'inlet' | 'input' | 'default';
}

/**
 * Variable node for Epic 1 - gets or sets variables
 * Story 1.5: Three-handle data hub with data inlet
 */
export const VariableNode = memo((props: NodeProps<VariableNodeData>) => {
  const isGetter = props.data.isGetter ?? false;
  const hasDataInlet = props.data.hasDataInlet !== false; // Default to true for Story 1.5
  const dataInletConnected = props.data.dataInletConnected ?? false;
  const dataSource = props.data.dataSource ?? 'default';
  const mergeMode = props.data.mergeMode ?? 'override';
  const { showMetadata, setShowMetadata, metadata, flipClassName } = useMetadataFlip(props);

  return (
    <BaseEditableNode
      {...props}
      className={`variable ${dataInletConnected ? 'data-connected' : ''} ${flipClassName}`}
      minWidth={180}
      minHeight={hasDataInlet ? 90 : 70}
    >
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div className="flip-container">
              <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                {/* Front side - editor */}
                <div className="card-face node-front">
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
          );
        }

        return (
          <>
            <div className="epic1-variable-display">
              <div className="epic1-node-type-label">
                {isGetter ? 'Get Variable' : 'Set Variable'}
                {dataInletConnected && (
                  <span className="data-inlet-badge" title={`Data from: ${dataSource}`}>
                    📊
                  </span>
                )}
              </div>
              <div className="epic1-variable-name">
                <span className="epic1-variable-prefix">${isGetter ? '' : '='}</span>
                {value || <span className="epic1-placeholder">unnamed</span>}
              </div>
              {dataInletConnected && (
                <div className="epic1-data-source-indicator">
                  <span className="data-source-label">Data: {dataSource}</span>
                </div>
              )}
            </div>
            
            {/* Add the third handle - data inlet at bottom */}
            {hasDataInlet && (
              <Handle
                type="target"
                position={Position.Bottom}
                id="data"
                className={`epic1-handle data-inlet ${dataInletConnected ? 'connected' : ''}`}
                style={{
                  background: dataInletConnected ? '#00ff00' : '#4CAF50',
                  width: '12px',
                  height: '12px',
                  border: '2px solid #fff',
                  bottom: '-6px',
                }}
                title="Connect data here for world-aware prompts"
              />
            )}
          </>
        );
      }}
    </BaseEditableNode>
  );
});

VariableNode.displayName = 'VariableNode';