import type { Edge, Node } from 'reactflow';
import type { AgentFragmentRecord } from '@prompt/asset-browser';
import type { EditableNodeData } from '../../nodes';
import { planFragmentInsertion } from '../FragmentInsertionPlanner';
import { AgentFragmentSuggestionService } from '../AgentFragmentSuggestionService';

jest.mock(
  '@prompt/asset-browser',
  () => ({
    AgentFragmentRetrievalService: {
      suggestFragmentsForSelection: jest.fn()
    }
  }),
  { virtual: true }
);

type FlowNode = Node<EditableNodeData>;

const createNode = (
  id: string,
  type: string,
  position = { x: 0, y: 0 }
): FlowNode => ({
  id,
  type,
  position,
  width: 180,
  height: 72,
  data: {
    value: '',
    nodeType: type
  } as EditableNodeData
});

const createEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target
});

const createFragment = (
  overrides: Partial<AgentFragmentRecord> = {}
): AgentFragmentRecord => ({
  id: 'fragment-1',
  name: 'Fragment 1',
  path: '/assets/library/fragment-1.psg',
  category: 'test',
  tags: [],
  roles: [],
  domains: [],
  nodeTypes: [],
  placementHints: [],
  tone: [],
  nodeCount: 1,
  priority: 0,
  preferredInsertion: 'free-place',
  entryStrategy: 'auto-boundary',
  exitStrategy: 'auto-boundary',
  suggestionWeight: 0,
  requiresBranchLane: false,
  ...overrides
});

describe('FragmentInsertionPlanner', () => {
  it('makes replacement intent explicit for compatible replace-node fragments', () => {
    const selectedNode = createNode('selected', 'textBlock');
    const fragment = createFragment({
      nodeTypes: ['text'],
      preferredInsertion: 'replace-node'
    });

    const plan = planFragmentInsertion({
      fragment,
      selectedNode,
      nodes: [selectedNode],
      edges: []
    });

    expect(plan.anchor).toBe('replace-node');
    expect(plan.intent).toMatchObject({
      kind: 'replace-node',
      nodeId: 'selected',
      nodeType: 'textBlock'
    });
  });

  it('makes edge insertion explicit for downstream fragments with an outgoing edge', () => {
    const selectedNode = createNode('choice', 'weightedChoice');
    const outputNode = createNode('output', 'output', { x: 420, y: 0 });
    const edge = createEdge('choice-output', 'choice', 'output');
    const fragment = createFragment({
      placementHints: ['downstream-of-choice'],
      preferredInsertion: 'insert-edge'
    });

    const plan = planFragmentInsertion({
      fragment,
      selectedNode,
      nodes: [selectedNode, outputNode],
      edges: [edge]
    });

    expect(plan.intent).toMatchObject({
      kind: 'insert-edge',
      edgeId: 'choice-output',
      sourceId: 'choice',
      targetId: 'output'
    });
    expect(plan.targetEdgeId).toBe('choice-output');
  });

  it('does not target an outgoing edge when metadata prefers free placement', () => {
    const selectedNode = createNode('choice', 'weightedChoice');
    const outputNode = createNode('output', 'output', { x: 420, y: 0 });
    const edge = createEdge('choice-output', 'choice', 'output');
    const fragment = createFragment({
      placementHints: ['downstream-of-choice'],
      preferredInsertion: 'free-place'
    });

    const plan = planFragmentInsertion({
      fragment,
      selectedNode,
      nodes: [selectedNode, outputNode],
      edges: [edge]
    });

    expect(plan.intent.kind).toBe('free-place');
    expect(plan.targetEdgeId).toBeUndefined();
  });

  it('passes the shared insertion plan through suggestion execution', async () => {
    const selectedNode = createNode('selected', 'textBlock');
    const fragment = createFragment({
      nodeTypes: ['text'],
      preferredInsertion: 'replace-node'
    });
    const insertPreset = jest.fn();

    await AgentFragmentSuggestionService.insertSuggestion({
      suggestion: fragment,
      selectedNode,
      nodes: [selectedNode],
      edges: [],
      insertPreset
    });

    expect(insertPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'fragment-1',
        path: '/assets/library/fragment-1.psg'
      }),
      expect.objectContaining({
        intent: expect.objectContaining({
          kind: 'replace-node',
          nodeId: 'selected'
        })
      })
    );
  });
});
