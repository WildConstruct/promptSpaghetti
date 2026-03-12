import React, { memo, useRef, useEffect } from 'react';
import type { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { useMetadataFlip, MetadataDisplay, MetadataToggleButton } from '../hooks/useMetadataFlip';
import type { GraphReferenceEntry, GraphReferenceStatus, ReferenceBinding } from '../services/ComponentModel';
import './VariableNode.css';

export interface TextBlockNodeData extends EditableNodeData {
  text: string;
  graphReferences?: GraphReferenceEntry[];
  referenceBinding?: ReferenceBinding;
  referenceBindingStatus?: GraphReferenceStatus | null;
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
  graphReferences?: GraphReferenceEntry[];
  referenceBindingStatus?: GraphReferenceStatus | null;
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
  metadata,
  graphReferences = [],
  referenceBindingStatus = null
}) => {
  const looksLikeReferencePath = typeof value === 'string' && value.includes('.');
  const activeReferencePath = graphReferences.find(
    (reference: GraphReferenceEntry) => reference.readablePath === value
  )?.readablePath ?? '';
  const activeReference = activeReferencePath.length > 0;
  const missingReference = referenceBindingStatus === 'missing' || (looksLikeReferencePath && !activeReference);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing, textareaRef]);

  if (isEditing) {
    const sortedReferences = [...graphReferences].sort((left: GraphReferenceEntry, right: GraphReferenceEntry) => {
      const query = editBuffer.trim().toLowerCase();
      const leftMatches = query.length > 0 && left.readablePath.toLowerCase().includes(query) ? 1 : 0;
      const rightMatches = query.length > 0 && right.readablePath.toLowerCase().includes(query) ? 1 : 0;
      if (leftMatches !== rightMatches) {
        return rightMatches - leftMatches;
      }
      return left.readablePath.localeCompare(right.readablePath);
    });

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
              {sortedReferences.length > 0 && (
                <div className="epic1-variable-reference-picker">
                  <div className="epic1-variable-reference-label">Graph References</div>
                  <div className="epic1-variable-reference-list">
                    {sortedReferences.slice(0, 8).map((reference: GraphReferenceEntry) => (
                      <button
                        key={reference.referenceId}
                        type="button"
                        className="epic1-variable-reference-chip"
                        onClick={event => {
                          event.stopPropagation();
                          updateBuffer(
                            editBuffer.length > 0
                              ? `${editBuffer} ${reference.readablePath}`
                              : reference.readablePath
                          );
                        }}
                        title={reference.description || reference.readablePath}
                      >
                        {reference.readablePath}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
      {activeReference && (
        <div className="epic1-variable-reference-active">
          Ref: {activeReferencePath}
        </div>
      )}
      {missingReference && (
        <div className="epic1-variable-reference-active missing">
          Missing ref: {value}
        </div>
      )}
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
          graphReferences={props.data.graphReferences}
          referenceBindingStatus={props.data.referenceBindingStatus ?? null}
        />
      )}
    </BaseEditableNode>
  );
});

TextBlockNode.displayName = 'TextBlockNode';
