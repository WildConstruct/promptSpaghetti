/**
 * SubPSG node UI — nested precomp document reference.
 * Double-click / Open opens the child tab; empty nodes can Create a composition.
 */
import React, { memo, useCallback, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import {
  useMetadataFlip,
  MetadataDisplay,
  MetadataToggleButton
} from '../hooks/useMetadataFlip';
import './TextBlockNode.css';

export interface SubPsgNodeData extends EditableNodeData {
  documentId?: string;
  documentName?: string;
  outputMode?: 'first-output';
}

const openNestedDocument = (documentId: string, documentName?: string) => {
  if (!documentId || typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent('epic1:openNestedDocument', {
      detail: { documentId, documentName }
    })
  );
};

const createNestedDocument = (
  nodeId: string,
  documentName: string
) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent('epic1:createNestedDocument', {
      detail: { nodeId, documentName }
    })
  );
};

export const SubPsgNode = memo((props: NodeProps<SubPsgNodeData>) => {
  const { showMetadata, setShowMetadata, metadata, flipClassName } =
    useMetadataFlip(props);

  const documentId =
    typeof props.data.documentId === 'string' ? props.data.documentId : '';
  const initialName =
    typeof props.data.documentName === 'string' &&
    props.data.documentName.trim().length > 0
      ? props.data.documentName
      : typeof props.data.label === 'string' && props.data.label.trim().length > 0
        ? props.data.label
        : 'New Composition';

  const [localName, setLocalName] = useState(initialName);
  const missing = !documentId;

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (documentId) {
        openNestedDocument(documentId, localName);
        return;
      }
      createNestedDocument(props.id, localName || 'New Composition');
    },
    [documentId, localName, props.id]
  );

  const handleOpenClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!documentId) {
        return;
      }
      openNestedDocument(documentId, localName);
    },
    [documentId, localName]
  );

  const handleCreateClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      createNestedDocument(props.id, localName || 'New Composition');
    },
    [localName, props.id]
  );

  const handleNameBlur = useCallback(() => {
    const name = localName.trim() || 'New Composition';
    setLocalName(name);
    // Persist display name on the node even before a document exists.
    props.data.onEdit?.(
      JSON.stringify({
        documentId,
        documentName: name,
        outputMode: props.data.outputMode || 'first-output'
      })
    );
  }, [documentId, localName, props.data]);

  const inputHandle = (
    <Handle
      type="target"
      position={Position.Left}
      id="target"
      className="epic1-handle target"
      style={{
        position: 'absolute',
        top: '50%',
        left: '-5px',
        transform: 'translateY(-50%)',
        zIndex: 1000
      }}
    />
  );

  const outputHandle = (
    <Handle
      type="source"
      position={Position.Right}
      id="source"
      className="epic1-handle source"
      style={{
        position: 'absolute',
        top: '50%',
        right: '-5px',
        transform: 'translateY(-50%)',
        zIndex: 1000
      }}
    />
  );

  return (
    <BaseEditableNode
      {...props}
      className={`text-block sub-psg ${flipClassName}${missing ? ' sub-psg-missing' : ''}`}
      minWidth={220}
      minHeight={88}
      data={{
        ...props.data,
        value: localName,
        nodeType: 'subPsg',
        label: localName
      }}
    >
      <div
        className="flip-container"
        onDoubleClick={handleDoubleClick}
        title={
          documentId
            ? `Double-click to open “${localName}”`
            : 'Double-click or Create to author a nested composition'
        }
      >
        <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
          <div className="card-face node-front">
            <div className="epic1-text-editor">
              <div className="epic1-node-type-label">Sub PSG</div>
              <input
                type="text"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                onBlur={handleNameBlur}
                onClick={e => e.stopPropagation()}
                onDoubleClick={e => e.stopPropagation()}
                className="nodrag"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  fontSize: 13,
                  fontWeight: 600,
                  color: missing ? '#f0a0a0' : '#f1f6f9',
                  marginBottom: 6,
                  padding: '4px 6px',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(0,0,0,0.25)'
                }}
                aria-label="Composition name"
              />
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(241,246,249,0.55)',
                  marginBottom: 8,
                  wordBreak: 'break-all'
                }}
              >
                {missing ? 'No nested document yet' : documentId}
              </div>
              {missing ? (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    borderRadius: 6,
                    border: '1px solid rgba(230,162,60,0.45)',
                    background: 'rgba(230,162,60,0.18)',
                    color: '#e6a23c',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Create composition
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenClick}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    borderRadius: 6,
                    border: '1px solid rgba(230,162,60,0.45)',
                    background: 'rgba(230,162,60,0.18)',
                    color: '#e6a23c',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Open document
                </button>
              )}
            </div>
            <MetadataToggleButton
              showMetadata={showMetadata}
              setShowMetadata={setShowMetadata}
            />
          </div>
          <div className="card-face node-back">
            <MetadataDisplay metadata={metadata} />
            <MetadataToggleButton
              showMetadata={showMetadata}
              setShowMetadata={setShowMetadata}
            />
          </div>
        </div>
      </div>
      {inputHandle}
      {outputHandle}
    </BaseEditableNode>
  );
});

SubPsgNode.displayName = 'SubPsgNode';
