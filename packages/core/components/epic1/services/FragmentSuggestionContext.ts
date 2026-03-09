import type { Edge, Node } from 'reactflow';
import type {
  FragmentDomain,
  SelectionContext
} from '@prompt/asset-browser';
import type { EditableNodeData } from '../nodes';

type FlowNode = Node<EditableNodeData>;

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
  selectedNode: FlowNode,
  nodes: FlowNode[],
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
    .filter((node): node is FlowNode => Boolean(node))
    .map(node => JSON.stringify(node.data ?? {}))
    .join(' ')
    .toLowerCase();
}

function isBranchLaneNode(
  selectedNode: FlowNode,
  nodes: FlowNode[],
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
  selectedNode: FlowNode,
  nodes: FlowNode[],
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
  selectedNode: FlowNode,
  nodes: FlowNode[],
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

export function buildFragmentSuggestionContext(params: {
  selectedNode?: FlowNode | null;
  nodes?: FlowNode[];
  edges?: Edge[];
}): SelectionContext | null {
  const {
    selectedNode,
    nodes = [],
    edges = []
  } = params;

  if (!selectedNode) {
    return null;
  }

  const contextText = collectContextText(selectedNode, nodes, edges);

  return {
    selectedNodeType: selectedNode.type,
    isBranchLane: isBranchLaneNode(selectedNode, nodes, edges),
    leadsToOutput: leadsToOutput(selectedNode, nodes, edges),
    needsMerge: needsMerge(selectedNode, nodes, edges),
    domainHints: inferDomains(contextText),
    toneHints: inferToneHints(contextText)
  };
}
