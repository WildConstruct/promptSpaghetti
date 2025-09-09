import React, { memo, useRef, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { useMetadataFlip, MetadataDisplay, MetadataToggleButton } from '../hooks/useMetadataFlip';

export interface TextBlockNodeData extends EditableNodeData {
  text: string;
}

/**
 * TextBlock node for Epic 1 - displays and edits plain text content
 * Now with metadata flip functionality
 */
export const TextBlockNode = memo((props: NodeProps<TextBlockNodeData>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showMetadata, setShowMetadata, metadata, flipClassName } = useMetadataFlip(props);

  return (
    <BaseEditableNode
      {...props}
      className={`text-block ${flipClassName}`}
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
            <div className="flip-container">
              <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                {/* Front side - editor */}
                <div className="card-face node-front">
                  <div className="epic1-text-editor">
                    <div className="epic1-node-type-label">Text Block</div>
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