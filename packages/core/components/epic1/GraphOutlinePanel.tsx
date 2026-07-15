import React, { useMemo } from 'react';
import type { Edge, Node } from 'reactflow';
import './GraphOutlinePanel.css';

export interface GraphOutlinePanelProps {
  nodes: Node[];
  edges: Edge[];
  /** Select + center the editor on a node. */
  onFocusNode?: (id: string) => void;
}

/** Friendly labels for the node types we surface. */
const TYPE_LABELS: Record<string, string> = {
  textBlock: 'Text Block',
  template: 'Template',
  weightedChoice: 'Weighted Choice',
  concat: 'Merge',
  variable: 'Variable',
  setVariable: 'Set Variable',
  getVariable: 'Get Variable',
  output: 'Output',
  postItNote: 'Note',
  enhancedBoundingBox: 'Region',
  boundingBox: 'Region',
  componentInstance: 'Linked Component',
  group: 'Group'
};

const typeLabel = (type?: string): string =>
  (type && TYPE_LABELS[type]) || type || 'Node';

/** Best-effort human label for a single node. */
const nodeLabel = (node: Node): string => {
  const data = (node.data ?? {}) as Record<string, unknown>;
  const candidate =
    (typeof data.label === 'string' && data.label) ||
    (typeof data.text === 'string' && data.text) ||
    (typeof data.value === 'string' && data.value) ||
    (typeof data.variableName === 'string' && data.variableName) ||
    '';
  const trimmed = candidate.trim();
  if (trimmed) {
    return trimmed.length > 42 ? `${trimmed.slice(0, 41)}…` : trimmed;
  }
  return '(untitled)';
};

export const GraphOutlinePanel: React.FC<GraphOutlinePanelProps> = ({
  nodes,
  edges,
  onFocusNode
}) => {
  const groups = useMemo(() => {
    const byType = new Map<string, Node[]>();
    nodes.forEach(node => {
      const key = node.type ?? 'unknown';
      const existing = byType.get(key);
      if (existing) {
        existing.push(node);
      } else {
        byType.set(key, [node]);
      }
    });
    return Array.from(byType.entries())
      .map(([type, items]) => ({ type, items }))
      .sort((a, b) => typeLabel(a.type).localeCompare(typeLabel(b.type)));
  }, [nodes]);

  const outputCount = useMemo(
    () => nodes.filter(n => n.type === 'output').length,
    [nodes]
  );

  if (nodes.length === 0) {
    return (
      <div className="graph-outline">
        <div className="graph-outline-empty">
          <strong className="graph-outline-empty-title">No nodes yet</strong>
          <span>
            This outline lists every node in the current document, grouped by
            type. Add nodes (or open a document from Explore) and they’ll appear
            here — click one to jump to it on the canvas.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-outline">
      <div className="graph-outline-summary">
        <span className="graph-outline-stat">
          <strong>{nodes.length}</strong> node{nodes.length === 1 ? '' : 's'}
        </span>
        <span className="graph-outline-stat">
          <strong>{edges.length}</strong> connection{edges.length === 1 ? '' : 's'}
        </span>
        <span className="graph-outline-stat">
          <strong>{outputCount}</strong> output{outputCount === 1 ? '' : 's'}
        </span>
      </div>

      {outputCount === 0 && (
        <div className="graph-outline-warning">
          No Output node — add one so the graph produces a prompt.
        </div>
      )}

      <div className="graph-outline-groups">
        {groups.map(group => (
          <div key={group.type} className="graph-outline-group">
            <div className="graph-outline-group-header">
              <span className="graph-outline-group-title">{typeLabel(group.type)}</span>
              <span className="graph-outline-group-count">{group.items.length}</span>
            </div>
            <ul className="graph-outline-list">
              {group.items.map(node => (
                <li key={node.id}>
                  <button
                    type="button"
                    className="graph-outline-node"
                    onClick={() => onFocusNode?.(node.id)}
                    title={`Jump to ${typeLabel(node.type)} — ${nodeLabel(node)}`}
                    data-testid={`graph-outline-node-${node.id}`}
                  >
                    {nodeLabel(node)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphOutlinePanel;
