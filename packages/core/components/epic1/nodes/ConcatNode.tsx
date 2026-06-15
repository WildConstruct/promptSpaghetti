import React, { memo, useState, useCallback, useMemo } from 'react';
import { NodeProps, Handle, Position, useStore } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { useMetadataFlip, MetadataDisplay, MetadataToggleButton } from '../hooks/useMetadataFlip';
import type { JoinStyle } from '../../../runtime/assembly';

export interface ConcatNodeData extends EditableNodeData {
  separator?: string;
  requireAllInputs?: boolean;
  joinStyle?: JoinStyle;
  dedupe?: boolean;
}

const JOIN_STYLE_OPTIONS: { value: JoinStyle | ''; label: string }[] = [
  { value: '', label: 'Separator (legacy)' },
  { value: 'space', label: 'Space' },
  { value: 'comma', label: 'Comma list' },
  { value: 'and', label: 'Oxford list (a, b, and c)' },
  { value: 'sentence', label: 'Sentence' },
];

const MIN_HANDLES = 2;

/**
 * Compute evenly-spaced vertical positions for N input handles.
 * Returns percentages (e.g. 25, 50, 75 for 3 handles).
 */
function handlePositions(count: number): number[] {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(((i + 1) / (count + 1)) * 100);
  }
  return positions;
}

/**
 * Concat node for Epic 1 - concatenates inputs with optional separator
 * Dynamically renders one input handle per connection, plus one spare.
 */
export const ConcatNode = memo((props: NodeProps<ConcatNodeData>) => {
  const { id } = props;
  const { showMetadata, setShowMetadata, metadata, flipClassName } = useMetadataFlip(props);
  const [localJoinStyle, setLocalJoinStyle] = useState<JoinStyle | ''>(
    props.data.joinStyle || ''
  );
  const [localDedupe, setLocalDedupe] = useState<boolean>(
    props.data.dedupe || false
  );

  // Count distinct target handles currently connected to this node
  const connectedHandleCount = useStore((state) => {
    const handles = new Set<string>();
    for (const edge of state.edges) {
      if (edge.target === id) {
        handles.add(edge.targetHandle || 'input1');
      }
    }
    return handles.size;
  });

  // Always show at least MIN_HANDLES, and always one spare beyond connected count
  const handleCount = useMemo(
    () => Math.max(MIN_HANDLES, connectedHandleCount + 1),
    [connectedHandleCount]
  );

  const positions = useMemo(() => handlePositions(handleCount), [handleCount]);

  const commitConfig = useCallback(
    (separator: string, joinStyle: JoinStyle | '', dedupe: boolean) => {
      const config: Record<string, unknown> = { separator, dedupe };
      if (joinStyle) {
        config.joinStyle = joinStyle;
      }
      props.data.onEdit?.(JSON.stringify(config));
    },
    [props.data]
  );

  const inputHandles = positions.map((pct, i) => (
    <Handle
      key={`input${i + 1}`}
      type="target"
      position={Position.Left}
      id={`input${i + 1}`}
      className={`epic1-handle target concat-input concat-input-${i + 1}`}
      style={{
        position: 'absolute',
        top: `${pct}%`,
        left: '-5px',
        transform: 'translateY(-50%)',
        zIndex: 1000
      }}
    />
  ));

  const outputHandle = (
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
  );

  return (
    <BaseEditableNode
      {...props}
      className={`concat ${flipClassName}`}
      minWidth={104}
      minHeight={60}
    >
      {({ isEditing, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {

        if (isEditing) {
          const handleConfirm = () => {
            commitConfig(editBuffer, localJoinStyle, localDedupe);
          };

          return (
            <>
              <div className="flip-container">
                <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                  {/* Front side - editor */}
                  <div className="card-face node-front">
                    <div className="epic1-concat-editor">
                      <div className="epic1-node-type-label">Merge</div>
                      <select
                        className="epic1-inline-input"
                        value={localJoinStyle}
                        onChange={(e) => {
                          const val = e.target.value as JoinStyle | '';
                          setLocalJoinStyle(val);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {JOIN_STYLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {!localJoinStyle && (
                        <input
                          type="text"
                          className="epic1-inline-input"
                          value={editBuffer}
                          onChange={(e) => updateBuffer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleConfirm();
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
                      )}
                      <label
                        className="epic1-concat-dedupe-label"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={localDedupe}
                          onChange={(e) => setLocalDedupe(e.target.checked)}
                        />
                        <span>Dedupe</span>
                      </label>
                      <div className="epic1-hint">
                        {localJoinStyle
                          ? `Join: ${JOIN_STYLE_OPTIONS.find(o => o.value === localJoinStyle)?.label}`
                          : 'Leave empty for no separator'}
                      </div>
                      <button
                        className="epic1-concat-apply-btn"
                        onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                        type="button"
                      >
                        Apply
                      </button>
                    </div>
                    <MetadataToggleButton showMetadata={showMetadata} onClick={() => setShowMetadata(!showMetadata)} />
                  </div>
                  {/* Back side - metadata */}
                  <MetadataDisplay metadata={metadata} onClose={() => setShowMetadata(false)} />
                </div>
              </div>
              {inputHandles}
              {outputHandle}
            </>
          );
        }

        const activeLabel = props.data.joinStyle
          ? JOIN_STYLE_OPTIONS.find(o => o.value === props.data.joinStyle)?.label
          : null;

        return (
          <>
            <div className="epic1-concat-display">
              <div className="epic1-node-type-label">Merge</div>
              {activeLabel && (
                <div className="epic1-concat-join-badge">{activeLabel}</div>
              )}
              {props.data.dedupe && (
                <div className="epic1-concat-join-badge">Dedupe</div>
              )}
            </div>
            {inputHandles}
            {outputHandle}
          </>
        );
      }}
    </BaseEditableNode>
  );
});

ConcatNode.displayName = 'ConcatNode';
