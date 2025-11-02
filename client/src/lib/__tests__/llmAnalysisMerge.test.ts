import type { PromptAnalysis } from '../simplePromptParser';
import {
  normalizeLLMResult,
  mergeLLMResult,
  LLMNode
} from '../llmAnalysisMerge';

const buildBaseline = (overrides?: Partial<PromptAnalysis>): PromptAnalysis => ({
  segments: [],
  nodes: [],
  mappings: [],
  edges: [],
  rawPrompt: '',
  ...overrides
});

const baselineAnalysis: PromptAnalysis = buildBaseline({
  nodes: [
    {
      node: {
        id: 'text-1',
        nodeType: 'Text',
        getPreviewText: () => 'Intro',
        data: { label: 'Intro' }
      }
    },
    {
      node: {
        id: 'choice-2',
        nodeType: 'Choice',
        getPreviewText: () => 'Option',
        data: { options: ['A', 'B'] }
      }
    },
    {
      node: {
        id: 'output-3',
        nodeType: 'Output',
        getPreviewText: () => 'Output',
        data: { label: 'Output' }
      }
    }
  ],
  mappings: [
    { nodeId: 'text-1', startIndex: 0, endIndex: 5 },
    { nodeId: 'choice-2', startIndex: 6, endIndex: 10 },
    { nodeId: 'output-3', startIndex: 11, endIndex: 12 }
  ],
  edges: [
    { id: 'text-1__choice-2', source: 'text-1', target: 'choice-2' },
    { id: 'choice-2__output-3', source: 'choice-2', target: 'output-3' }
  ],
  llmMetadata: { previous: true },
  rawPrompt: 'Intro option output'
});

describe('normalizeLLMResult', () => {
  it('returns null for invalid payloads', () => {
    expect(normalizeLLMResult(null)).toBeNull();
    expect(normalizeLLMResult({})).toBeNull();
    expect(normalizeLLMResult({ nodes: 'invalid' })).toBeNull();
  });

  it('unwraps nested graph payloads', () => {
    const normalized = normalizeLLMResult({
      graph: {
        nodes: [
          { id: 'a', type: 'TextBlock', text: 'Hello' },
          { id: 'b', type: 'Sequential', text: 'World' }
        ],
        edges: [{ source: 'a', target: 'b' }],
        metadata: { foo: 'bar' }
      }
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.nodes).toHaveLength(2);
    expect(normalized?.edges).toHaveLength(1);
    expect(normalized?.metadata).toEqual({ foo: 'bar' });
  });
});

describe('mergeLLMResult', () => {
  const makeNormalized = (nodes: LLMNode[]) => ({
    nodes,
    edges: [
      {
        id: 'custom-edge',
        source: 'text-1',
        target: 'choice-2',
        sourceHandle: 'main'
      },
      {
        id: 'ignored-edge',
        source: 'choice-2',
        target: 'extra-3'
      }
    ],
    metadata: { llm: true },
    raw: { raw: true }
  });

  it('merges llm node content and metadata without adding unknown nodes', () => {
    const normalized = makeNormalized([
      {
        id: 'text-1',
        type: 'TextBlock',
        text: 'Updated intro',
        data: { extra: true }
      },
      {
        id: 'choice-2',
        type: 'WeightedChoice',
        data: { options: ['One', 'Two', 'Three'] },
        metadata: { uncertainty: 0.2 }
      },
      {
        id: 'extra-3',
        type: 'TextBlock',
        text: 'Should not appear'
      }
    ]);

    const merged = mergeLLMResult(baselineAnalysis, normalized);

    expect(merged.nodes).toHaveLength(3);
    const updatedTextNode = merged.nodes[0].node;
    expect(updatedTextNode.data).toMatchObject({
      extra: true,
      content: 'Updated intro'
    });
    expect(updatedTextNode.data?.label).toBe('Intro');
    expect(updatedTextNode.getPreviewText?.()).toBe('Updated intro');

    const updatedChoiceNode = merged.nodes[1].node;
    expect(updatedChoiceNode.nodeType).toBe('Choice');
    const mergedOptions = (updatedChoiceNode.data?.options ??
      []) as Array<{ text?: string } | string>;
    expect(mergedOptions).toHaveLength(3);
    expect(
      mergedOptions.map(option =>
        typeof option === 'string' ? option : option.text
      )
    ).toEqual(['One', 'Two', 'Three']);
    expect((updatedChoiceNode.data as Record<string, unknown>).metadata).toEqual(
      { uncertainty: 0.2 }
    );

    expect(merged.edges).toEqual([
      {
        id: 'custom-edge',
        source: 'text-1',
        target: 'choice-2',
        sourceHandle: 'main',
        targetHandle: undefined
      }
    ]);

    expect(merged.llmMetadata).toMatchObject({
      parserMode: 'llm-enhanced',
      llmNodeCount: 3,
      llmEdgeCount: 1,
      llmExtraNodesDropped: 1,
      rawResponse: { raw: true },
      llm: true,
      previous: true
    });
  });
});
