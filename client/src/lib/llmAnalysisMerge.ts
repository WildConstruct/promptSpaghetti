import type { PromptAnalysis, AnalysisEdge } from './simplePromptParser';

export type LLMNodeData = {
  content?: string;
  label?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export interface LLMNode {
  id: string;
  type?: string;
  text?: string;
  data?: LLMNodeData;
  metadata?: Record<string, unknown>;
}

export interface NormalizedEdge {
  id?: string;
  source?: string;
  target?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface NormalizedLLMResult {
  nodes: LLMNode[];
  edges: NormalizedEdge[];
  metadata?: Record<string, unknown>;
  raw: unknown;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeLLMNode = (value: unknown, index: number): LLMNode | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const data = isPlainObject(record.data)
    ? (record.data as LLMNodeData)
    : undefined;
  const metadata = isPlainObject(record.metadata)
    ? (record.metadata as Record<string, unknown>)
    : undefined;

  return {
    id:
      typeof record.id === 'string' && record.id.length > 0
        ? record.id
        : `llm-node-${index}`,
    type: typeof record.type === 'string' ? record.type : undefined,
    text: typeof record.text === 'string' ? record.text : undefined,
    data,
    metadata
  };
};

export const normalizeLLMResult = (
  raw: unknown
): NormalizedLLMResult | null => {
  if (!isPlainObject(raw)) {
    return null;
  }

  const container = raw as Record<string, unknown>;
  let nodesSource = container.nodes;
  let edgesSource = container.edges;
  let metadata = container.metadata;

  if (!Array.isArray(nodesSource) && isPlainObject(container.graph)) {
    const graph = container.graph as Record<string, unknown>;
    nodesSource = graph.nodes;
    edgesSource = edgesSource ?? graph.edges;
    metadata = metadata ?? graph.metadata;
  }

  const nodes = Array.isArray(nodesSource)
    ? nodesSource
        .map((node, idx) => normalizeLLMNode(node, idx))
        .filter((node): node is LLMNode => node !== null)
    : [];

  if (nodes.length === 0) {
    return null;
  }

  const edges = Array.isArray(edgesSource)
    ? edgesSource
        .map(edge => (isPlainObject(edge) ? (edge as NormalizedEdge) : null))
        .filter((edge): edge is NormalizedEdge => edge !== null)
    : [];

  const metadataRecord = isPlainObject(metadata)
    ? (metadata as Record<string, unknown>)
    : undefined;

  return {
    nodes,
    edges,
    metadata: metadataRecord,
    raw
  };
};

const mapLLMNodeType = (
  type: string | undefined,
  fallback: PromptAnalysis['nodes'][number]['node']['nodeType']
): PromptAnalysis['nodes'][number]['node']['nodeType'] => {
  if (!type) {
    return fallback;
  }
  const normalized = type.toLowerCase();
  if (normalized.includes('choice') || normalized.includes('branch')) {
    return 'Choice';
  }
  if (normalized.includes('variable')) {
    return 'Variable';
  }
  if (normalized.includes('output')) {
    return 'Output';
  }
  return fallback;
};

export const mergeLLMResult = (
  baseline: PromptAnalysis,
  normalized: NormalizedLLMResult
): PromptAnalysis => {
  const baselineNodes = Array.isArray(baseline.nodes) ? baseline.nodes : [];
  const baselineNonOutput = baselineNodes.filter(
    wrapper => wrapper.node.nodeType !== 'Output'
  );
  const outputNode = baselineNodes.find(
    wrapper => wrapper.node.nodeType === 'Output'
  );

  const llmNonOutput = normalized.nodes.filter(
    node => (node.type ?? '').toLowerCase() !== 'output'
  );

  const mergedNonOutput = baselineNonOutput.map((wrapper, index) => {
    const llmNode = llmNonOutput[index];
    if (!llmNode) {
      return wrapper;
    }

    const llmText =
      typeof llmNode.text === 'string' && llmNode.text.trim().length > 0
        ? llmNode.text
        : typeof llmNode.data?.content === 'string'
          ? String(llmNode.data.content)
          : wrapper.node.getPreviewText?.() ?? '';

    const mergedData: Record<string, unknown> = {
      ...(wrapper.node.data ?? {})
    };

    if (isPlainObject(llmNode.data)) {
      Object.assign(mergedData, llmNode.data);
    }

    if (llmNode.metadata && isPlainObject(llmNode.metadata)) {
      mergedData.metadata = {
        ...(isPlainObject(mergedData.metadata)
          ? (mergedData.metadata as Record<string, unknown>)
          : {}),
        ...llmNode.metadata
      };
    }

    if (llmText.length > 0) {
      mergedData.content = llmText;
      if (!mergedData.label) {
        mergedData.label = llmText;
      }
    }

    return {
      node: {
        ...wrapper.node,
        nodeType: mapLLMNodeType(llmNode.type, wrapper.node.nodeType),
        data: mergedData,
        getPreviewText: () => llmText
      }
    };
  });

  const mergedNodes = outputNode
    ? [...mergedNonOutput, outputNode]
    : mergedNonOutput;

  const allowedIds = new Set(mergedNodes.map(n => n.node.id));
  const llmEdges = normalized.edges
    .map((edge, index) => {
      const source = typeof edge.source === 'string' ? edge.source : undefined;
      const target = typeof edge.target === 'string' ? edge.target : undefined;
      if (!source || !target) {
        return null;
      }
      if (!allowedIds.has(source) || !allowedIds.has(target)) {
        return null;
      }
      return {
        id:
          typeof edge.id === 'string' && edge.id.length > 0
            ? edge.id
            : `${source}__${target}__llm${index}`,
        source,
        target,
        sourceHandle:
          typeof edge.sourceHandle === 'string' ? edge.sourceHandle : undefined,
        targetHandle:
          typeof edge.targetHandle === 'string' ? edge.targetHandle : undefined
      };
    })
    .filter(
      (edge): edge is AnalysisEdge =>
        edge !== null
    );

  const edges =
    llmEdges.length > 0
      ? llmEdges
      : Array.isArray(baseline.edges)
        ? [...baseline.edges]
        : [];

  const llmMetadata: Record<string, unknown> = {
    ...(baseline.llmMetadata ?? {}),
    ...(normalized.metadata ?? {}),
    parserMode: 'llm-enhanced',
    llmNodeCount: normalized.nodes.length,
    llmEdgeCount: llmEdges.length,
    llmExtraNodesDropped: Math.max(
      0,
      normalized.nodes.filter(
        node => (node.type ?? '').toLowerCase() !== 'output'
      ).length - mergedNonOutput.length
    ),
    rawResponse: normalized.raw
  };

  return {
    ...baseline,
    nodes: mergedNodes,
    edges,
    llmMetadata
  };
};
