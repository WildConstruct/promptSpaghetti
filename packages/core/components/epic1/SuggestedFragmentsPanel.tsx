import React from 'react';
import type { Edge, Node } from 'reactflow';
import {
  AgentFragmentRetrievalService,
  type AgentFragmentRecord,
  type FragmentDomain,
  type Preset
} from '@prompt/asset-browser';
import type { EditableNodeData } from './nodes';

interface SuggestedFragmentsPanelProps {
  selectedNode?: Node<EditableNodeData> | null;
  nodes?: Node<EditableNodeData>[];
  edges?: Edge[];
  onInsert?: (preset: Preset) => void;
}

function inferDomains(haystack: string): FragmentDomain[] {
  const domains = new Set<FragmentDomain>();

  if (
    haystack.includes('truck') ||
    haystack.includes('vehicle') ||
    haystack.includes('engine') ||
    haystack.includes('tire') ||
    haystack.includes('muffler')
  ) {
    domains.add('vehicle');
  }
  if (
    haystack.includes('building') ||
    haystack.includes('storefront') ||
    haystack.includes('architecture')
  ) {
    domains.add('building');
  }
  if (
    haystack.includes('monster') ||
    haystack.includes('creature') ||
    haystack.includes('beast')
  ) {
    domains.add('creature');
  }
  if (
    haystack.includes('character') ||
    haystack.includes('person') ||
    haystack.includes('citizen') ||
    haystack.includes('face') ||
    haystack.includes('body')
  ) {
    domains.add('character');
  }
  if (
    haystack.includes('environment') ||
    haystack.includes('weather') ||
    haystack.includes('lighting') ||
    haystack.includes('scene')
  ) {
    domains.add('environment');
  }

  return Array.from(domains);
}

function inferToneHints(haystack: string): string[] {
  return ['gritty', 'comic', 'cinematic', 'moody', 'heroic', 'haunted']
    .filter(tone => haystack.includes(tone));
}

function collectContextText(
  selectedNode: Node<EditableNodeData>,
  nodes: Node<EditableNodeData>[],
  edges: Edge[]
): string {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const connectedIds = new Set<string>([selectedNode.id]);

  for (const edge of edges) {
    if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    }
  }

  return Array.from(connectedIds)
    .map(id => nodeMap.get(id))
    .filter((node): node is Node<EditableNodeData> => Boolean(node))
    .map(node => JSON.stringify(node.data ?? {}))
    .join(' ')
    .toLowerCase();
}

function isBranchLaneNode(
  selectedNode: Node<EditableNodeData>,
  nodes: Node<EditableNodeData>[],
  edges: Edge[]
): boolean {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  return edges.some(edge => {
    if (edge.target !== selectedNode.id) {
      return false;
    }
    if (edge.sourceHandle?.startsWith('branch-')) {
      return true;
    }
    const sourceNode = nodeMap.get(edge.source);
    return sourceNode?.type === 'weightedChoice' && edge.sourceHandle !== 'output';
  });
}

function leadsToOutput(
  selectedNode: Node<EditableNodeData>,
  nodes: Node<EditableNodeData>[],
  edges: Edge[]
): boolean {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const queue = [selectedNode.id];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    const node = nodeMap.get(currentId);
    if (node?.type === 'output') {
      return true;
    }

    for (const edge of edges) {
      if (edge.source === currentId && !visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return false;
}

function needsMerge(
  selectedNode: Node<EditableNodeData>,
  nodes: Node<EditableNodeData>[],
  edges: Edge[]
): boolean {
  const outgoing = edges.filter(edge => edge.source === selectedNode.id);
  const incoming = edges.filter(edge => edge.target === selectedNode.id);
  if (selectedNode.type === 'weightedChoice' && outgoing.length > 1) {
    return true;
  }
  if (isBranchLaneNode(selectedNode, nodes, edges) && incoming.length > 0) {
    return !leadsToOutput(selectedNode, nodes, edges);
  }
  return false;
}

function toPreset(record: AgentFragmentRecord): Preset {
  return {
    id: record.id,
    name: record.name,
    path: record.path,
    type: 'graph',
    category: record.category,
    tags: [...record.tags, ...record.roles, ...record.domains],
    nodes: record.nodeCount,
    description: record.description,
    metadata: {
      file: record.path,
      roles: record.roles,
      domains: record.domains,
      placementHints: record.placementHints
    }
  };
}

export const SuggestedFragmentsPanel: React.FC<SuggestedFragmentsPanelProps> = ({
  selectedNode,
  nodes = [],
  edges = [],
  onInsert
}) => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [suggestions, setSuggestions] = React.useState<AgentFragmentRecord[]>([]);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      if (!selectedNode) {
        setSuggestions([]);
        setStatus('idle');
        return;
      }

      setStatus('loading');
      try {
        const next = await AgentFragmentRetrievalService.suggestFragmentsForSelection({
          selectedNodeType: selectedNode.type,
          isBranchLane: isBranchLaneNode(selectedNode, nodes, edges),
          leadsToOutput: leadsToOutput(selectedNode, nodes, edges),
          needsMerge: needsMerge(selectedNode, nodes, edges),
          domainHints: inferDomains(collectContextText(selectedNode, nodes, edges)),
          toneHints: inferToneHints(collectContextText(selectedNode, nodes, edges))
        });

        if (!active) {
          return;
        }

        setSuggestions(next);
        setStatus('ready');
      } catch (error) {
        console.error('[SuggestedFragmentsPanel] failed to load suggestions', error);
        if (active) {
          setSuggestions([]);
          setStatus('error');
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [selectedNode, nodes, edges]);

  if (!selectedNode) {
    return (
      <section className="suggested-fragments-panel">
        <div className="suggested-fragments-header">
          <h4>Suggested Fragments</h4>
        </div>
        <p className="suggested-fragments-empty">
          Select a node to surface useful fragment suggestions.
        </p>
      </section>
    );
  }

  return (
    <section className="suggested-fragments-panel">
      <div className="suggested-fragments-header">
        <h4>Suggested Fragments</h4>
        <span className="suggested-fragments-context">
          For {selectedNode.type ?? 'selection'}
        </span>
      </div>

      {status === 'loading' && (
        <p className="suggested-fragments-empty">Finding context-aware fragments…</p>
      )}

      {status === 'error' && (
        <p className="suggested-fragments-empty">
          Suggestions are unavailable right now.
        </p>
      )}

      {status === 'ready' && suggestions.length === 0 && (
        <p className="suggested-fragments-empty">
          No strong matches yet for this selection.
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="suggested-fragments-list">
          {suggestions.map(fragment => (
            <button
              key={fragment.id}
              type="button"
              className="suggested-fragment-card"
              onClick={() => onInsert?.(toPreset(fragment))}
            >
              <div className="suggested-fragment-title">{fragment.name}</div>
              <div className="suggested-fragment-meta">
                {fragment.roles.join(', ')}
              </div>
              <div className="suggested-fragment-tags">
                {fragment.domains.slice(0, 2).map(domain => (
                  <span key={domain} className="suggested-fragment-chip">
                    {domain}
                  </span>
                ))}
                {fragment.placementHints.slice(0, 2).map(hint => (
                  <span key={hint} className="suggested-fragment-chip subtle">
                    {hint}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default SuggestedFragmentsPanel;
