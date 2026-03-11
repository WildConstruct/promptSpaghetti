import React, { useCallback, useState } from 'react';
import type { ComponentDefinition, GraphReferenceEntry } from './services/ComponentModel';
import type { Node } from 'reactflow';
import type { EditableNodeData } from './nodes';

export interface ComponentLibraryPanelProps {
  definitions: ComponentDefinition[];
  references?: GraphReferenceEntry[];
  onInsert?: (definition: ComponentDefinition) => void;
  onSaveSelection?: () => void;
  onDetachSelected?: () => void;
  onRefreshSelected?: () => void;
  onRefreshOutdated?: () => void;
  selectedNode?: Node<EditableNodeData> | null;
}

export const ComponentLibraryPanel = ({
  definitions,
  references = [],
  onInsert,
  onSaveSelection,
  onDetachSelected,
  onRefreshSelected,
  onRefreshOutdated,
  selectedNode = null
}: ComponentLibraryPanelProps) => {
  const [copiedReferenceId, setCopiedReferenceId] = useState<string | null>(null);
  const selectedComponentData =
    selectedNode?.type === 'componentInstance'
      ? (selectedNode.data as Record<string, unknown>)
      : null;
  const hasSelectedComponent = selectedNode?.type === 'componentInstance';
  const selectedNamespace =
    selectedNode?.type === 'componentInstance'
      ? String((selectedNode.data as Record<string, unknown>)?.namespace ?? '')
      : '';
  const selectedComponentStableId = String(selectedComponentData?.componentStableId ?? '');
  const selectedComponentVersion = Number(selectedComponentData?.componentVersion ?? 0);
  const selectedComponentMode = String(selectedComponentData?.mode ?? '');
  const selectedComponentLabel = String(selectedComponentData?.readableLabel ?? '');
  const latestDefinition = selectedComponentStableId
    ? definitions
        .filter((definition: ComponentDefinition) => definition.stableId === selectedComponentStableId)
        .sort((left, right) => right.version - left.version)[0] ?? null
    : null;
  const versionDrift =
    latestDefinition && selectedComponentVersion > 0
      ? latestDefinition.version - selectedComponentVersion
      : 0;
  const refreshAvailable =
    selectedNode?.type === 'componentInstance'
    && selectedComponentMode === 'linked'
    && !!latestDefinition
    && versionDrift > 0;
  const sortedReferences = [...references].sort((left, right) => {
    const leftSelected = selectedNamespace && left.namespace === selectedNamespace ? 1 : 0;
    const rightSelected = selectedNamespace && right.namespace === selectedNamespace ? 1 : 0;
    if (leftSelected !== rightSelected) {
      return rightSelected - leftSelected;
    }
    return left.readablePath.localeCompare(right.readablePath);
  });

  const handleCopyReference = useCallback(async (reference: GraphReferenceEntry) => {
    try {
      await navigator.clipboard.writeText(reference.readablePath);
      setCopiedReferenceId(reference.referenceId);
      window.setTimeout(() => {
        setCopiedReferenceId((current: string | null) =>
          current === reference.referenceId ? null : current
        );
      }, 1500);
    } catch (error) {
      console.warn('[ComponentLibraryPanel] Failed to copy reference', error);
    }
  }, []);

  return (
    <div className="component-library-panel">
      <div className="component-library-header">
        <div>
          <div className="component-library-title">Components</div>
          <div className="component-library-subtitle">Reusable graph assets</div>
          <div className="component-library-rule">
            V1 saves only closed selections with explicit output nodes.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="component-library-action"
            onClick={onRefreshSelected}
            disabled={!refreshAvailable}
          >
            Refresh Selected
          </button>
          <button
            type="button"
            className="component-library-action"
            onClick={onRefreshOutdated}
            disabled={definitions.length === 0}
          >
            Refresh Outdated
          </button>
          <button
            type="button"
            className="component-library-action"
            onClick={onDetachSelected}
            disabled={!hasSelectedComponent}
          >
            Detach Selected
          </button>
          <button
            type="button"
            className="component-library-action"
            onClick={onSaveSelection}
          >
            Save Selection
          </button>
        </div>
      </div>

      {selectedNode?.type === 'componentInstance' && (
        <div className="component-library-selection-status">
          <div className="component-library-selection-title-row">
            <span className="component-library-selection-title">
              {selectedComponentLabel || 'Selected Component'}
            </span>
            <span
              className={`component-library-selection-badge ${selectedComponentMode === 'detached' ? 'detached' : 'linked'}`}
            >
              {selectedComponentMode || 'linked'}
            </span>
          </div>
          <div className="component-library-selection-meta">
            <span>ns: {selectedNamespace || '—'}</span>
            <span>current: v{selectedComponentVersion || 0}</span>
            <span>latest: v{latestDefinition?.version ?? selectedComponentVersion ?? 0}</span>
          </div>
          <div className="component-library-rule">
            {selectedComponentMode === 'detached'
              ? 'Detached instances do not refresh from library definitions.'
              : refreshAvailable
                ? `A newer linked definition is available (${versionDrift} version${versionDrift === 1 ? '' : 's'} ahead).`
                : 'This linked instance is already aligned with the latest saved definition.'}
          </div>
        </div>
      )}

      <div className="component-library-list">
        {definitions.length === 0 && (
          <div className="component-library-empty">Save a selected cluster with output nodes to create your first component.</div>
        )}
        {definitions.map((definition: ComponentDefinition) => (
          <button
            key={definition.definitionId}
            type="button"
            className="component-library-item"
            onClick={() => onInsert?.(definition)}
          >
            <div className="component-library-item-title-row">
              <span className="component-library-item-title">{definition.name}</span>
              <span className="component-library-item-version">v{definition.version}</span>
            </div>
            {definition.description && (
              <div className="component-library-item-description">{definition.description}</div>
            )}
            <div className="component-library-item-outputs">
              {definition.outputs.map(output => (
                <span key={output.outputId} className="component-library-item-output">
                  {output.key}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {references.length > 0 && (
        <div className="component-reference-panel">
          <div className="component-library-subtitle">Live References</div>
          {selectedNamespace && (
            <div className="component-library-rule">
              Prioritizing references for `{selectedNamespace}`
            </div>
          )}
          <div className="component-reference-list">
            {sortedReferences.slice(0, 12).map((reference: GraphReferenceEntry) => (
              <button
                key={reference.referenceId}
                type="button"
                className={`component-reference-item ${copiedReferenceId === reference.referenceId ? 'copied' : ''} ${selectedNamespace && reference.namespace === selectedNamespace ? 'selected-match' : ''}`}
                onClick={() => {
                  void handleCopyReference(reference);
                }}
                title={`Copy ${reference.readablePath}`}
              >
                <span>{reference.readablePath}</span>
                <span className="component-reference-item-status">
                  {copiedReferenceId === reference.referenceId ? 'Copied' : reference.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentLibraryPanel;
