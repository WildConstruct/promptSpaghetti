import React, { memo, useRef, useEffect } from 'react';
import type { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { useMetadataFlip, MetadataDisplay, MetadataToggleButton } from '../hooks/useMetadataFlip';

export interface TextBlockNodeData extends EditableNodeData {
  text: string;
}

/**
 * TextBlock node for Epic 1 - displays and edits plain text content
 * Now with metadata flip functionality
 */
interface TextBlockContentProps {
  isEditing: boolean;
  value: string;
  editBuffer: string;
  updateBuffer: (value: string) => void;
  confirmEdit: () => void;
  cancelEdit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  showMetadata: boolean;
  setShowMetadata: (value: boolean) => void;
  metadata: ReturnType<typeof useMetadataFlip>['metadata'];
}

const TextBlockContent: React.FC<TextBlockContentProps> = ({
  isEditing,
  value,
  editBuffer,
  updateBuffer,
  confirmEdit,
  cancelEdit,
  textareaRef,
  showMetadata,
  setShowMetadata,
  metadata
}) => {
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing, textareaRef]);

  if (isEditing) {
    return (
      <div className="flip-container">
        <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
          <div className="card-face node-front">
            <div className="epic1-text-editor">
              <div className="epic1-node-type-label">Text Block</div>
              <textarea
                ref={textareaRef}
                className="epic1-inline-textarea"
                value={editBuffer}
                onChange={event => updateBuffer(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    confirmEdit();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    cancelEdit();
                  }
                  event.stopPropagation();
                }}
                onClick={event => event.stopPropagation()}
                placeholder="Enter text..."
              />
            </div>
            <MetadataToggleButton
              showMetadata={showMetadata}
              onClick={() => setShowMetadata(!showMetadata)}
            />
          </div>
          <MetadataDisplay metadata={metadata} onClose={() => setShowMetadata(false)} />
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
};

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
      {({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => (
        <TextBlockContent
          isEditing={isEditing}
          value={value}
          editBuffer={editBuffer}
          updateBuffer={updateBuffer}
          confirmEdit={confirmEdit}
          cancelEdit={cancelEdit}
          textareaRef={textareaRef}
          showMetadata={showMetadata}
          setShowMetadata={setShowMetadata}
          metadata={metadata}
        />
      )}
    </BaseEditableNode>
  );
});

TextBlockNode.displayName = 'TextBlockNode';
