import {
  segmentPrompt,
  type SegmentKind
} from '@promptscape/core/runtime/prompting/PromptSegmentation';

export interface PromptSegment {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface GeneratedNodeInternal {
  id: string;
  nodeType: 'Text' | 'Choice' | 'Variable' | 'Output';
  variableName?: string;
  getPreviewText?: () => string;
  data?: Record<string, unknown>;
}

export interface GeneratedNode {
  node: GeneratedNodeInternal;
}

export interface NodeMapping {
  nodeId: string;
  startIndex: number;
  endIndex: number;
  highlightColor?: string;
}

export interface AnalysisEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PromptAnalysis {
  segments: PromptSegment[];
  nodes: GeneratedNode[];
  mappings: NodeMapping[];
  edges: AnalysisEdge[];
  llmMetadata?: Record<string, unknown>;
  rawPrompt?: string;
}

export const buildSequentialEdges = (
  nodes: GeneratedNode[]
): AnalysisEdge[] => {
  const edges: AnalysisEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const currentId = nodes[i]?.node.id;
    const nextId = nodes[i + 1]?.node.id;
    if (!currentId || !nextId) {
      continue;
    }
    edges.push({
      id: `${currentId}__${nextId}`,
      source: currentId,
      target: nextId
    });
  }
  return edges;
};

const HIGHLIGHT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FFB347',
  '#B19CD9'
];

export const simplePromptParser = {
  parse(input: string): PromptAnalysis {
    const segments: PromptSegment[] = [];
    const nodes: GeneratedNode[] = [];
    const mappings: NodeMapping[] = [];

    if (!input || !input.trim()) {
      return { segments, nodes, mappings, edges: [], rawPrompt: input };
    }

    const segmented = segmentPrompt(input);
    segmented.segments.forEach((segment, index) => {
      segments.push({
        text: segment.text,
        startIndex: segment.startIndex,
        endIndex: segment.endIndex
      });

      const nodeId = `${segment.kind}-${index}`;
      const nodeType = displayTypeForKind(segment.kind);
      const generated: GeneratedNode = {
        node: {
          id: nodeId,
          nodeType,
          variableName: segment.variableName,
          getPreviewText: () =>
            segment.kind === 'choice'
              ? (segment.options ?? []).join(' / ')
              : segment.text,
          data:
            segment.kind === 'choice'
              ? { options: segment.options }
              : segment.kind === 'variable'
                ? {
                    label: segment.variableName ?? 'Variable',
                    value: segment.text
                  }
                : { label: segment.text }
        }
      };

      nodes.push(generated);
      mappings.push({
        nodeId,
        startIndex: segment.startIndex,
        endIndex: segment.endIndex,
        highlightColor: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]
      });
    });

    // Append an output node so the splash screen preview matches the editor flow
    const outputNodeId = `output-${segments.length}`;
    nodes.push({
      node: {
        id: outputNodeId,
        nodeType: 'Output',
        getPreviewText: () => 'Output',
        data: { label: 'Output' }
      }
    });

    const edges = buildSequentialEdges(nodes);
    return {
      segments,
      nodes,
      mappings,
      edges,
      rawPrompt: input
    };
  }
};

function displayTypeForKind(
  kind: SegmentKind
): GeneratedNodeInternal['nodeType'] {
  switch (kind) {
    case 'choice':
      return 'Choice';
    case 'variable':
      return 'Variable';
    case 'text':
    default:
      return 'Text';
  }
}
