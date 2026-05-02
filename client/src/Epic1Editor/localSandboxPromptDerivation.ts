import type { Edge, Node } from 'reactflow';
import {
  exportGraphToPSG,
  type PSGEdge,
  type PSGFile,
  type PSGNode
} from '@promptscape/core/fileFormats/psg';

export const LOCAL_SANDBOX_TREE_PROMPT =
  'oak tree archetype, shared trunk DNA, distinct silhouette variation, documentary still, natural light';
const LOCAL_SANDBOX_TREE_NEGATIVE_PROMPT =
  'blurry, duplicate canopy, collage, text, watermark, extra trunks';
const LOCAL_SANDBOX_TREE_DEFAULT_COUNT = 20;
const LOCAL_SANDBOX_TREE_DEFAULT_START_SEED = 1200;
const LOCAL_SANDBOX_TREE_LABEL_PREFIX = 'tree-family-demo';

export type SandboxPromptDerivationStatus = 'ready' | 'partial' | 'manual';

export interface DerivedSandboxRequest {
  status: SandboxPromptDerivationStatus;
  sourceLabel: string;
  sourceDescription: string;
  prompt: string;
  negativePrompt: string;
  count: number;
  startSeed: number;
  labelPrefix: string;
  basePrompt: string | null;
  variationSummaries: string[];
  missingReasons: string[];
  isCanonicalTreeFlow: boolean;
}

interface DeriveLocalSandboxRequestOptions {
  nodes: Node[];
  edges: Edge[];
  fallbackPrompt?: string;
}

function getNodeName(node: PSGNode) {
  return typeof node.name === 'string' && node.name.trim().length > 0
    ? node.name.trim()
    : node.id;
}

function getTextBlockValue(node: PSGNode) {
  if (typeof node.value === 'string' && node.value.trim().length > 0) {
    return node.value.trim();
  }

  if (
    node.data &&
    typeof node.data === 'object' &&
    typeof node.data.text === 'string' &&
    node.data.text.trim().length > 0
  ) {
    return node.data.text.trim();
  }

  if (
    node.data &&
    typeof node.data === 'object' &&
    typeof node.data.value === 'string' &&
    node.data.value.trim().length > 0
  ) {
    return node.data.value.trim();
  }

  return '';
}

function getWeightedOptions(node: PSGNode) {
  if (!Array.isArray(node.options)) {
    return [];
  }

  return node.options
    .map(option => ({
      text: typeof option.text === 'string' ? option.text.trim() : '',
      weight: typeof option.weight === 'number' ? option.weight : 0
    }))
    .filter(option => option.text.length > 0)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3);
}

function compareByPosition(left: PSGNode, right: PSGNode) {
  if (left.x !== right.x) {
    return left.x - right.x;
  }

  return left.y - right.y;
}

function collectUpstreamNodeIds(psg: PSGFile) {
  const reverseEdges = new Map<string, string[]>();

  psg.nodes.forEach(node => {
    reverseEdges.set(node.id, []);
  });

  psg.edges.forEach((edge: PSGEdge) => {
    const existing = reverseEdges.get(edge.target) || [];
    existing.push(edge.source);
    reverseEdges.set(edge.target, existing);
  });

  const outputNodes = psg.nodes.filter(node => node.type === 'Output');
  const seedNodes = outputNodes.length > 0 ? outputNodes : psg.nodes;
  const queue = [...seedNodes.map(node => node.id)];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const nextId = queue.shift();
    if (!nextId || visited.has(nextId)) {
      continue;
    }

    visited.add(nextId);

    for (const parentId of reverseEdges.get(nextId) || []) {
      if (!visited.has(parentId)) {
        queue.push(parentId);
      }
    }
  }

  return visited;
}

function buildVariationSummary(node: PSGNode) {
  const options = getWeightedOptions(node);
  if (options.length === 0) {
    return null;
  }

  const label = getNodeName(node)
    .replace(/variation/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const summaryLabel = label.length > 0 ? label : 'variation';
  return `${summaryLabel}: ${options.map(option => option.text).join(' | ')}`;
}

function buildDerivedPrompt(basePrompt: string, variationSummaries: string[]) {
  if (variationSummaries.length === 0) {
    return basePrompt;
  }

  return [
    basePrompt,
    ...variationSummaries.map(summary => `bounded ${summary}`)
  ].join(', ');
}

function isCanonicalTreeFlow(psg: PSGFile, basePrompt: string) {
  const base = basePrompt.toLowerCase();
  if (base.includes('oak tree archetype')) {
    return true;
  }

  return psg.nodes.some(node => {
    const name = getNodeName(node).toLowerCase();
    return node.id.startsWith('tree-') || name.includes('tree');
  });
}

export function deriveLocalSandboxRequestFromGraph({
  nodes,
  edges,
  fallbackPrompt = LOCAL_SANDBOX_TREE_PROMPT
}: DeriveLocalSandboxRequestOptions): DerivedSandboxRequest {
  if (nodes.length === 0) {
    return {
      status: 'manual',
      sourceLabel: 'Manual local sandbox prompt',
      sourceDescription:
        'No active graph prompt was found, so the local sandbox falls back to the pinned tree demo defaults.',
      prompt: fallbackPrompt,
      negativePrompt: LOCAL_SANDBOX_TREE_NEGATIVE_PROMPT,
      count: LOCAL_SANDBOX_TREE_DEFAULT_COUNT,
      startSeed: LOCAL_SANDBOX_TREE_DEFAULT_START_SEED,
      labelPrefix: LOCAL_SANDBOX_TREE_LABEL_PREFIX,
      basePrompt: null,
      variationSummaries: [],
      missingReasons: ['No active graph nodes are available yet.'],
      isCanonicalTreeFlow: false
    };
  }

  const psg = exportGraphToPSG(nodes, edges, { name: 'Active Graph' });
  const upstreamNodeIds = collectUpstreamNodeIds(psg);
  const relevantNodes = psg.nodes
    .filter(node => upstreamNodeIds.has(node.id))
    .sort(compareByPosition);

  const textBlocks = relevantNodes
    .filter(node => node.type === 'TextBlock')
    .map(node => ({ node, value: getTextBlockValue(node) }))
    .filter(entry => entry.value.length > 0);
  const weightedChoices = relevantNodes.filter(
    node => node.type === 'WeightedChoice'
  );

  const basePrompt = textBlocks[0]?.value || '';
  const variationSummaries = weightedChoices
    .map(buildVariationSummary)
    .filter((summary): summary is string => Boolean(summary));
  const missingReasons: string[] = [];

  if (basePrompt.length === 0) {
    missingReasons.push('No connected TextBlock family DNA prompt was found.');
  }

  if (variationSummaries.length === 0) {
    missingReasons.push(
      'No connected WeightedChoice variation axes were found upstream of the output.'
    );
  }

  const canonicalTreeFlow = isCanonicalTreeFlow(psg, basePrompt);
  const status: SandboxPromptDerivationStatus =
    basePrompt.length > 0 && variationSummaries.length > 0
      ? 'ready'
      : basePrompt.length > 0 || variationSummaries.length > 0
        ? 'partial'
        : 'manual';

  const prompt =
    status === 'manual'
      ? fallbackPrompt
      : buildDerivedPrompt(basePrompt || fallbackPrompt, variationSummaries);

  return {
    status,
    sourceLabel: canonicalTreeFlow
      ? 'Supported v1 tree archetype flow'
      : status === 'ready'
        ? 'Archetype family graph'
        : 'Manual local sandbox prompt',
    sourceDescription: canonicalTreeFlow
      ? 'The active graph matches the pinned tree-family sandbox flow, so the dialog can prefill a deterministic 20-tree batch from graph DNA and variation axes.'
      : status === 'ready'
        ? 'The active graph exposes enough family DNA and bounded variation to prefill a local sandbox batch request.'
        : status === 'partial'
          ? 'The active graph provides some prompt material, but the dialog still expects a quick manual review before generation.'
          : 'The local sandbox falls back to the pinned tree demo defaults until the graph carries usable prompt DNA.',
    prompt,
    negativePrompt: LOCAL_SANDBOX_TREE_NEGATIVE_PROMPT,
    count: LOCAL_SANDBOX_TREE_DEFAULT_COUNT,
    startSeed: LOCAL_SANDBOX_TREE_DEFAULT_START_SEED,
    labelPrefix: canonicalTreeFlow
      ? LOCAL_SANDBOX_TREE_LABEL_PREFIX
      : 'graph-sandbox-demo',
    basePrompt: basePrompt || null,
    variationSummaries,
    missingReasons,
    isCanonicalTreeFlow: canonicalTreeFlow
  };
}
