import { convertAnalysisToGraph } from '../analysisToGraph';
import type { PromptAnalysis } from '../simplePromptParser';

const buildAnalysis = (overrides?: Partial<PromptAnalysis>): PromptAnalysis => ({
  segments: [],
  nodes: [],
  mappings: [],
  edges: [],
  rawPrompt: '',
  ...overrides
});

describe('convertAnalysisToGraph', () => {
  it('creates sequential edges when none provided', () => {
    const analysis = buildAnalysis({
      nodes: [
        { node: { id: 'text-1', nodeType: 'Text', getPreviewText: () => 'Intro' } },
        { node: { id: 'choice-2', nodeType: 'Choice', data: { options: ['A', 'B'] } } },
        { node: { id: 'output-3', nodeType: 'Output' } }
      ],
      mappings: [
        { nodeId: 'text-1', startIndex: 0, endIndex: 5 },
        { nodeId: 'choice-2', startIndex: 6, endIndex: 10 },
        { nodeId: 'output-3', startIndex: 11, endIndex: 12 }
      ],
      edges: []
    });

    const { nodes, edges } = convertAnalysisToGraph(analysis);

    expect(nodes.map(node => node.id)).toEqual([
      'text-1',
      'choice-2',
      'output-3'
    ]);
    expect(edges).toHaveLength(2);
    expect(edges.map(edge => [edge.source, edge.target])).toEqual([
      ['text-1', 'choice-2'],
      ['choice-2', 'output-3']
    ]);
  });

  it('preserves provided edges and weighted choice options', () => {
    const analysis = buildAnalysis({
      nodes: [
        {
          node: {
            id: 'choice-1',
            nodeType: 'Choice',
            data: { options: ['Alpha', 'Beta', 'Gamma'] }
          }
        },
        {
          node: {
            id: 'variable-2',
            nodeType: 'Variable',
            variableName: 'hero',
            getPreviewText: () => 'hero name'
          }
        }
      ],
      mappings: [
        { nodeId: 'choice-1', startIndex: 0, endIndex: 10, highlightColor: '#ff0000' },
        { nodeId: 'variable-2', startIndex: 11, endIndex: 20, highlightColor: '#00ff00' }
      ],
      edges: [
        {
          id: 'choice-1__variable-2',
          source: 'choice-1',
          target: 'variable-2',
          sourceHandle: 'option-1'
        }
      ]
    });

    const { nodes, edges } = convertAnalysisToGraph(analysis);
    const choiceNode = nodes.find(node => node.id === 'choice-1');
    const variableNode = nodes.find(node => node.id === 'variable-2');

    expect(choiceNode?.data?.options).toEqual([
      { id: 'option-1', text: 'Alpha', weight: expect.any(Number), hasBranch: false },
      { id: 'option-2', text: 'Beta', weight: expect.any(Number), hasBranch: false },
      { id: 'option-3', text: 'Gamma', weight: expect.any(Number), hasBranch: false }
    ]);
    expect(variableNode?.data?.variableName).toBe('hero');
    expect(edges).toEqual([
      {
        id: 'choice-1__variable-2',
        source: 'choice-1',
        target: 'variable-2',
        sourceHandle: 'option-1',
        targetHandle: undefined,
        type: 'smoothstep'
      }
    ]);
  });
});
