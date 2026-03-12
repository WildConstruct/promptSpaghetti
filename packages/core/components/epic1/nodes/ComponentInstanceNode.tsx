import React, { memo } from 'react';
import PropTypes from 'prop-types';
import type { NodeProps } from 'reactflow';
import { BaseEditableNode, type EditableNodeData } from './BaseEditableNode';

export interface ComponentInstanceNodeData extends EditableNodeData {
  instanceId: string;
  componentStableId: string;
  componentDefinitionId: string;
  componentVersion: number;
  latestComponentVersion?: number;
  versionDrift?: number;
  namespace: string;
  readableLabel: string;
  mode: 'linked' | 'detached';
  outputKeys?: string[];
  referencePaths?: string[];
}

const ComponentInstanceNodeComponent = (props: NodeProps<ComponentInstanceNodeData>) => {
  const versionDrift = Number(props.data.versionDrift ?? 0);
  const latestComponentVersion = Number(
    props.data.latestComponentVersion ?? props.data.componentVersion ?? 0
  );
  const hasVersionDrift = props.data.mode === 'linked' && versionDrift > 0;

  return (
    <BaseEditableNode
      {...props}
      className={`component-instance ${props.data.mode === 'detached' ? 'detached' : 'linked'}`}
      minWidth={240}
      minHeight={110}
      compactMinWidth={220}
      compactMinHeight={96}
    >
      {({
        isEditing,
        value,
        editBuffer,
        updateBuffer,
        confirmEdit,
        cancelEdit
      }: {
        isEditing: boolean;
        value: string;
        editBuffer: string;
        updateBuffer: (value: string) => void;
        confirmEdit: () => void;
        cancelEdit: () => void;
      }) =>
        isEditing ? (
          <div className="epic1-component-instance-display">
            <div className="epic1-node-type-label">Component Namespace</div>
            <input
              type="text"
              className="epic1-inline-input"
              value={editBuffer}
              onChange={event => updateBuffer(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  confirmEdit();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelEdit();
                }
                event.stopPropagation();
              }}
              onClick={event => event.stopPropagation()}
              placeholder="component_namespace"
              autoFocus
            />
            <div className="epic1-component-instance-meta">
              <span>{props.data.readableLabel || 'Component'}</span>
              <span>v{props.data.componentVersion}</span>
              <span>{props.data.mode}</span>
            </div>
            {hasVersionDrift && (
              <div className="epic1-variable-reference-active missing">
                Update available: v{latestComponentVersion}
              </div>
            )}
          </div>
        ) : (
          <div className="epic1-component-instance-display">
            <div className="epic1-node-type-label">Component</div>
            <div className="epic1-component-instance-title">
              {props.data.readableLabel || value || 'Component'}
            </div>
            <div className="epic1-component-instance-meta">
              <span>{props.data.namespace}</span>
              <span>v{props.data.componentVersion}</span>
              <span>{props.data.mode}</span>
            </div>
            {hasVersionDrift && (
              <div className="epic1-variable-reference-active missing">
                Update available: v{latestComponentVersion}
              </div>
            )}
            {Array.isArray(props.data.outputKeys) && props.data.outputKeys.length > 0 && (
              <div className="epic1-component-instance-outputs">
                {props.data.outputKeys.slice(0, 4).map((outputKey: string) => (
                  <span key={outputKey} className="epic1-component-instance-output">
                    {outputKey}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      }
    </BaseEditableNode>
  );
};

ComponentInstanceNodeComponent.propTypes = {
  data: PropTypes.shape({
    versionDrift: PropTypes.number,
    latestComponentVersion: PropTypes.number,
    componentVersion: PropTypes.number.isRequired,
    mode: PropTypes.oneOf(['linked', 'detached']).isRequired,
    readableLabel: PropTypes.string,
    namespace: PropTypes.string.isRequired,
    outputKeys: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export const ComponentInstanceNode = memo(ComponentInstanceNodeComponent);

ComponentInstanceNode.displayName = 'ComponentInstanceNode';
