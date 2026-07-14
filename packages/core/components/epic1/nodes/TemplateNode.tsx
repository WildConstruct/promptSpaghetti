import React, { memo, useState, useCallback, useMemo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import {
  useMetadataFlip,
  MetadataDisplay,
  MetadataToggleButton
} from '../hooks/useMetadataFlip';
import { templateSlots } from '../../../runtime/assembly';
import './TextBlockNode.css';

export interface TemplateNodeData extends EditableNodeData {
  template?: string;
  capitalize?: boolean;
  terminate?: boolean;
}

/**
 * Template node — sentence skeleton with {slot} inputs (B2).
 */
export const TemplateNode = memo((props: NodeProps<TemplateNodeData>) => {
  const { showMetadata, setShowMetadata, metadata, flipClassName } =
    useMetadataFlip(props);

  const skeleton =
    typeof props.data.template === 'string' && props.data.template.length > 0
      ? props.data.template
      : typeof props.data.value === 'string'
        ? props.data.value
        : 'a {subject} in {setting}';

  const [localCapitalize, setLocalCapitalize] = useState(
    props.data.capitalize !== false
  );
  const [localTerminate, setLocalTerminate] = useState(
    props.data.terminate === true
  );

  const slots = useMemo(() => templateSlots(skeleton), [skeleton]);

  const commitConfig = useCallback(
    (template: string, capitalize: boolean, terminate: boolean) => {
      props.data.onEdit?.(
        JSON.stringify({ template, capitalize, terminate })
      );
    },
    [props.data]
  );

  const slotHandles = slots.map((name, i) => {
    const pct = ((i + 1) / (slots.length + 1)) * 100;
    return (
      <Handle
        key={`slot-${name}`}
        type="target"
        position={Position.Left}
        id={`slot-${name}`}
        className="epic1-handle target template-slot"
        title={name}
        style={
          {
            position: 'absolute',
            ['--handle-top' as string]: `${pct}%`,
            left: '-5px',
            transform: 'translateY(-50%)',
            zIndex: 1000
          } as React.CSSProperties
        }
      />
    );
  });

  const outputHandle = (
    <Handle
      type="source"
      position={Position.Right}
      id="source"
      className="epic1-handle source template-output"
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
      className={`text-block template ${flipClassName}`}
      minWidth={220}
      minHeight={72}
      data={{
        ...props.data,
        value: skeleton,
        nodeType: 'template'
      }}
    >
      {({ isEditing, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          const handleConfirm = () => {
            // Structured save first; confirmEdit exits edit mode (and re-saves
            // the skeleton string — handleNodeEdit keeps capitalize/terminate).
            commitConfig(editBuffer, localCapitalize, localTerminate);
            confirmEdit();
          };

          return (
            <>
              {slotHandles}
              {outputHandle}
              <div className="flip-container">
                <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                  <div className="card-face node-front">
                    <div className="epic1-text-editor">
                      <div className="epic1-node-type-label">Template</div>
                      <textarea
                        className="epic1-inline-textarea"
                        value={editBuffer}
                        onChange={e => updateBuffer(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                          e.stopPropagation();
                        }}
                        onClick={e => e.stopPropagation()}
                        placeholder="a {subject} in {setting}"
                        rows={3}
                        autoFocus
                      />
                      <label
                        className="epic1-concat-dedupe-label"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={localCapitalize}
                          onChange={e => setLocalCapitalize(e.target.checked)}
                        />
                        <span>Capitalize</span>
                      </label>
                      <label
                        className="epic1-concat-dedupe-label"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={localTerminate}
                          onChange={e => setLocalTerminate(e.target.checked)}
                        />
                        <span>End with period</span>
                      </label>
                      <div className="epic1-hint">
                        Slots:{' '}
                        {templateSlots(editBuffer).join(', ') || '(none)'}
                      </div>
                      <button
                        className="epic1-concat-apply-btn"
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleConfirm();
                        }}
                      >
                        Apply
                      </button>
                    </div>
                    <MetadataToggleButton
                      showMetadata={showMetadata}
                      onClick={() => setShowMetadata(!showMetadata)}
                    />
                  </div>
                  <MetadataDisplay
                    metadata={metadata}
                    onClose={() => setShowMetadata(false)}
                  />
                </div>
              </div>
            </>
          );
        }

        const preview =
          skeleton.length > 48 ? `${skeleton.slice(0, 48)}…` : skeleton;

        return (
          <>
            {slotHandles}
            {outputHandle}
            <div className="flip-container">
              <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                <div className="card-face node-front">
                  <div className="epic1-node-type-label">Template</div>
                  <div className="epic1-text-display">{preview || '…'}</div>
                  {slots.length > 0 && (
                    <div className="epic1-hint" style={{ marginTop: 4 }}>
                      {slots.map(s => `{${s}}`).join(' · ')}
                    </div>
                  )}
                  <MetadataToggleButton
                    showMetadata={showMetadata}
                    onClick={() => setShowMetadata(!showMetadata)}
                  />
                </div>
                <MetadataDisplay
                  metadata={metadata}
                  onClose={() => setShowMetadata(false)}
                />
              </div>
            </div>
          </>
        );
      }}
    </BaseEditableNode>
  );
});

TemplateNode.displayName = 'TemplateNode';
