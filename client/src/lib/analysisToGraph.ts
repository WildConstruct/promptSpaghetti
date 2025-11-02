import { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from './simplePromptParser';

type WeightedChoiceOption = {
  id: string;
  text: string;
  weight: number;
  hasBranch: boolean;
};

type ConvertOptions = {
  nodesPerRow?: number;
  spacing?: { x: number; y: number };
  start?: { x: number; y: number };
};

const DEFAULT_OPTIONS: Required<ConvertOptions> = {
  nodesPerRow: 3,
  spacing: { x: 260, y: 180 },
  start: { x: 120, y: 120 }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normaliseLabel = (
  data: Record<string, unknown>,
  fallback: string
): string => {
  const label = data.label;
  if (typeof label === 'string' && label.trim().length > 0) {
    return label;
  }
  return fallback;
};

const normaliseChoiceOptions = (raw: unknown): WeightedChoiceOption[] => {
  if (Array.isArray(raw) && raw.length > 0) {
    if (raw.every(option => isRecord(option) && 'text' in option)) {
      return raw.map((option, index) => {
        const record = option as Record<string, unknown>;
        const text = typeof record.text === 'string' ? record.text : '';
        const weight =
          typeof record.weight === 'number'
            ? record.weight
            : Math.max(1, Math.round(100 / raw.length));
        return {
          id: typeof record.id === 'string' ? record.id : `option-${index + 1}`,
          text,
          weight,
          hasBranch: Boolean(record.hasBranch)
        };
      });
    }
    if (raw.every(option => typeof option === 'string')) {
      const weight = Math.max(1, Math.round(100 / raw.length));
      return raw.map((option, index) => ({
        id: `option-${index + 1}`,
        text: option as string,
        weight,
        hasBranch: false
      }));
    }
  }
  return [
    { id: 'option-1', text: 'Option 1', weight: 100, hasBranch: false }
  ];
};

export const convertAnalysisToGraph = (
  analysis: PromptAnalysis,
  options: ConvertOptions = {}
): { nodes: Node[]; edges: Edge[] } => {
  const { nodesPerRow, spacing, start } = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  const flowNodes: Node[] = [];
  const nodeOrder: string[] = [];

  analysis.nodes.forEach((wrapper, index) => {
    const node = wrapper.node;
    if (!node?.id) {
      return;
    }

    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    const position = {
      x: start.x + col * spacing.x,
      y: start.y + row * spacing.y
    };

    const data = isRecord(node.data) ? { ...node.data } : {};
    const getPreview =
      typeof node.getPreviewText === 'function'
        ? node.getPreviewText()
        : undefined;
    const previewText = typeof getPreview === 'string' ? getPreview : '';
    const fallbackText =
      previewText ||
      (typeof data.text === 'string' ? data.text : '') ||
      (typeof data.content === 'string' ? data.content : '') ||
      node.nodeType;

    let type: Node['type'] = 'textBlock';

    switch (node.nodeType) {
      case 'Choice': {
        type = 'weightedChoice';
        const options = normaliseChoiceOptions(data.options);
        data.options = options;
        data.value =
          typeof data.value === 'string'
            ? data.value
            : JSON.stringify(options, null, 2);
        data.label = normaliseLabel(data, fallbackText);
        break;
      }
      case 'Variable': {
        type = 'variable';
        const variableName =
          typeof data.variableName === 'string' && data.variableName.length > 0
            ? data.variableName
            : node.variableName || 'variable';
        const value =
          typeof data.value === 'string'
            ? data.value
            : previewText || '';
        data.variableName = variableName;
        data.value = value;
        data.label = normaliseLabel(data, variableName);
        break;
      }
      case 'Output': {
        type = 'output';
        data.value =
          typeof data.value === 'string'
            ? data.value
            : previewText || data.label || 'Output';
        data.label = normaliseLabel(data, 'Output');
        break;
      }
      default: {
        type = 'textBlock';
        const text =
          typeof data.text === 'string'
            ? data.text
            : previewText || fallbackText;
        data.text = text;
        data.value =
          typeof data.value === 'string' ? data.value : text;
        data.label = normaliseLabel(data, text);
        break;
      }
    }

    data.nodeType = type;

    flowNodes.push({
      id: node.id,
      type,
      position,
      data
    });
    nodeOrder.push(node.id);
  });

  if (!flowNodes.some(node => node.type === 'output')) {
    const fallbackId = 'output';
    flowNodes.push({
      id: fallbackId,
      type: 'output',
      position: {
        x: start.x + (flowNodes.length % nodesPerRow) * spacing.x,
        y: start.y + Math.floor(flowNodes.length / nodesPerRow) * spacing.y
      },
      data: {
        label: 'Output',
        value: 'Output',
        nodeType: 'output'
      }
    });
    nodeOrder.push(fallbackId);
  }

  const edges: Edge[] = [];
  const connected = new Set<string>();
  const analysisEdges = Array.isArray(analysis.edges) ? analysis.edges : [];

  analysisEdges.forEach((edge, index) => {
    if (!edge?.source || !edge?.target) {
      return;
    }
    if (!nodeOrder.includes(edge.source) || !nodeOrder.includes(edge.target)) {
      return;
    }
    edges.push({
      id: edge.id ?? `${edge.source}__${edge.target}__${index}`,
      source: edge.source,
      target: edge.target,
      sourceHandle:
        typeof edge.sourceHandle === 'string'
          ? edge.sourceHandle
          : undefined,
      targetHandle:
        typeof edge.targetHandle === 'string'
          ? edge.targetHandle
          : undefined,
      type: 'smoothstep'
    });
    connected.add(edge.source);
    connected.add(edge.target);
  });

  if (edges.length === 0) {
    for (let i = 0; i < nodeOrder.length - 1; i += 1) {
      edges.push({
        id: `${nodeOrder[i]}__${nodeOrder[i + 1]}`,
        source: nodeOrder[i],
        target: nodeOrder[i + 1],
        type: 'smoothstep'
      });
    }
  } else {
    const outputNode = flowNodes.find(node => node.type === 'output');
    const outputId = outputNode?.id ?? 'output';
    nodeOrder.forEach(id => {
      if (id !== outputId && !connected.has(id)) {
        edges.push({
          id: `${id}__${outputId}`,
          source: id,
          target: outputId,
          type: 'smoothstep'
        });
      }
    });
  }

  return { nodes: flowNodes, edges };
};
