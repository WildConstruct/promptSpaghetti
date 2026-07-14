/**
 * SubPSG node UI — nested precomp document reference.
 * Double-click opens the child document tab (epic1:openNestedDocument).
 */
import React, { memo, useCallback } from 'react';
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

export const SubPsgNode = memo((props: NodeProps<SubPsgNodeData>) => {
  const { showMetadata, setShowMetadata, metadata, flipClassName } =
    useMetadataFlip(props);

  const documentId =
    typeof props.data.documentId === 'string' ? props.data.documentId : '';
  const documentName =
    typeof props.data.documentName === 'string' &&
    props.data.documentName.trim().length > 0
      ? props.data.documentName
      : typeof props.data.label === 'string' && props.data.label.trim().length > 0
        ? props.data.label
        : documentId || 'Nested PSG';

  const missing = !documentId;

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!documentId) {
        return;
      }
      openNestedDocument(documentId, documentName);
    },
    [documentId, documentName]
  );

  const handleOpenClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!documentId) {
        return;
      }
      openNestedDocument(documentId, documentName);
    },
    [documentId, documentName]
  );

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
      minWidth={200}
      minHeight={72}
      data={{
        ...props.data,
        value: documentName,
        nodeType: 'subPsg',
        label: documentName
      }}
    >
      <div
        className="flip-container"
        onDoubleClick={handleDoubleClick}
        title={
          documentId
            ? `Double-click to open “${documentName}”`
            : 'Set a documentId to open a nested PSG'
        }
      >
        <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
          <div className="card-face node-front">
            <div className="epic1-text-editor">
              <div className="epic1-node-type-label">Sub PSG</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: missing ? '#f0a0a0' : '#f1f6f9',
                  marginBottom: 6
                }}
              >
                {documentName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(241,246,249,0.55)',
                  marginBottom: 8,
                  wordBreak: 'break-all'
                }}
              >
                {missing ? 'Missing document reference' : documentId}
              </div>
              <button
                type="button"
                onClick={handleOpenClick}
                disabled={missing}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  borderRadius: 6,
                  border: '1px solid rgba(230,162,60,0.45)',
                  background: missing
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(230,162,60,0.18)',
                  color: missing ? 'rgba(241,246,249,0.4)' : '#e6a23c',
                  cursor: missing ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Open document
              </button>
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
