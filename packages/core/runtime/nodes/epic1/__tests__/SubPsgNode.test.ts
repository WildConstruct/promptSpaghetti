import { SubPsgNode } from '../SubPsgNode';
import { TemplateNode } from '../TemplateNode';
import { WeightedChoiceNode } from '../WeightedChoiceNode';
import { OutputNode } from '../OutputNode';
import {
  Epic1ExecutionEngine,
  type Epic1Graph
} from '../Epic1ExecutionEngine';
import { Epic1NodeType } from '../nodeTypes';
import { exportGraphToPSG, parsePSG } from '../../../../fileFormats/psg';
import { convertNodeType } from '../../../nodeRegistry';

function buildChildGraph(): Epic1Graph {
  const nodes = new Map();
  nodes.set(
    'wares',
    new WeightedChoiceNode('wares', [
      { id: 'o1', text: 'iron tools', weight: 1 },
      { id: 'o2', text: 'ornate blades', weight: 1 }
    ])
  );
  nodes.set('out', new OutputNode('out', 'forge_out'));
  return {
    nodes,
    edges: [
      {
        id: 'e1',
        source: 'wares',
        target: 'out',
        sourceHandle: 'source',
        targetHandle: 'target'
      }
    ]
  };
}

function buildParentGraph(child: Epic1Graph): Epic1Graph {
  const nodes = new Map();
  nodes.set(
    'tmpl',
    new TemplateNode('tmpl', {
      template: 'A village where {wares} are sold',
      capitalize: true,
      terminate: true
    })
  );
  nodes.set(
    'sub',
    new SubPsgNode('sub', {
      documentId: 'doc-forge',
      documentName: 'Forge Wares'
    })
  );
  nodes.set('out', new OutputNode('out', 'parent_out'));
  return {
    nodes,
    edges: [
      {
        id: 'e1',
        source: 'sub',
        target: 'tmpl',
        sourceHandle: 'source',
        targetHandle: 'slot-wares'
      },
      {
        id: 'e2',
        source: 'tmpl',
        target: 'out',
        sourceHandle: 'source',
        targetHandle: 'target'
      }
    ],
    nestedDocuments: {
      'doc-forge': child
    }
  };
}

describe('SubPsgNode', () => {
  it('reports node type SubPSG', () => {
    const node = new SubPsgNode('s1', { documentId: 'doc-a' });
    expect(node.getNodeType()).toBe(Epic1NodeType.SubPSG);
    expect(node.getDocumentId()).toBe('doc-a');
  });

  it('executes nested document and returns child Output into parent Template', async () => {
    const parent = buildParentGraph(buildChildGraph());
    const engine = new Epic1ExecutionEngine(parent, 42);
    const result = await engine.execute();
    expect(result.success).toBe(true);
    expect(typeof result.output).toBe('string');
    expect(result.output).toMatch(/A village where (iron tools|ornate blades) are sold\.?/);
  });

  it('is deterministic for the same seed', async () => {
    const parent = buildParentGraph(buildChildGraph());
    const a = await new Epic1ExecutionEngine(parent, 'seed-x').execute();
    const b = await new Epic1ExecutionEngine(parent, 'seed-x').execute();
    expect(a.output).toBe(b.output);
  });

  it('returns a missing-document message without crashing', async () => {
    const nodes = new Map();
    nodes.set(
      'sub',
      new SubPsgNode('sub', { documentId: 'does-not-exist' })
    );
    nodes.set('out', new OutputNode('out', 'o'));
    const graph: Epic1Graph = {
      nodes,
      edges: [
        {
          id: 'e1',
          source: 'sub',
          target: 'out',
          sourceHandle: 'source',
          targetHandle: 'target'
        }
      ],
      nestedDocuments: {}
    };
    const result = await new Epic1ExecutionEngine(graph, 1).execute();
    expect(result.success).toBe(true);
    expect(String(result.output)).toContain('missing document');
  });

  it('detects recursive document cycles', async () => {
    const nodesA = new Map();
    nodesA.set(
      'subA',
      new SubPsgNode('subA', { documentId: 'doc-b' })
    );
    nodesA.set('outA', new OutputNode('outA', 'a'));
    const graphA: Epic1Graph = {
      nodes: nodesA,
      edges: [
        {
          id: 'ea',
          source: 'subA',
          target: 'outA',
          sourceHandle: 'source',
          targetHandle: 'target'
        }
      ]
    };

    const nodesB = new Map();
    nodesB.set(
      'subB',
      new SubPsgNode('subB', { documentId: 'doc-a' })
    );
    nodesB.set('outB', new OutputNode('outB', 'b'));
    const graphB: Epic1Graph = {
      nodes: nodesB,
      edges: [
        {
          id: 'eb',
          source: 'subB',
          target: 'outB',
          sourceHandle: 'source',
          targetHandle: 'target'
        }
      ]
    };

    const nested = { 'doc-a': graphA, 'doc-b': graphB };
    graphA.nestedDocuments = nested;
    graphB.nestedDocuments = nested;

    const rootNodes = new Map();
    rootNodes.set(
      'sub',
      new SubPsgNode('sub', { documentId: 'doc-a' })
    );
    rootNodes.set('out', new OutputNode('out', 'root'));
    const root: Epic1Graph = {
      nodes: rootNodes,
      edges: [
        {
          id: 'er',
          source: 'sub',
          target: 'out',
          sourceHandle: 'source',
          targetHandle: 'target'
        }
      ],
      nestedDocuments: nested
    };

    const result = await new Epic1ExecutionEngine(root, 7).execute();
    // Cycle surfaces as a node error; overall engine continues with partial results.
    const subResult = result.results.get('sub');
    expect(subResult?.error?.message).toMatch(/cycle/i);
  });
});

describe('SubPSG registry + PSG round-trip', () => {
  it('maps SubPSG ↔ subPsg in the node registry', () => {
    expect(convertNodeType('SubPSG', 'psg')).toBe('subPsg');
    expect(convertNodeType('subPsg', 'reactflow')).toBe('SubPSG');
  });

  it('round-trips documents[] and SubPSG documentId', () => {
    const psg = exportGraphToPSG(
      [
        {
          id: 'sub-1',
          type: 'subPsg',
          position: { x: 10, y: 20 },
          data: {
            documentId: 'doc-forge',
            documentName: 'Forge Wares',
            label: 'Forge Wares'
          }
        },
        {
          id: 'out-1',
          type: 'output',
          position: { x: 200, y: 20 },
          data: { label: 'Output', template: '' }
        }
      ],
      [
        {
          id: 'e1',
          source: 'sub-1',
          target: 'out-1',
          sourceHandle: 'source',
          targetHandle: 'target'
        }
      ],
      {
        name: 'Nested demo',
        documents: [
          {
            id: 'doc-forge',
            name: 'Forge Wares',
            nodes: [
              {
                id: 't1',
                type: 'TextBlock',
                x: 0,
                y: 0,
                value: 'iron tools'
              },
              {
                id: 'o1',
                type: 'Output',
                x: 200,
                y: 0,
                template: ''
              }
            ],
            edges: [
              {
                id: 'ce1',
                source: 't1',
                target: 'o1'
              }
            ]
          }
        ]
      }
    );

    expect(psg.documents).toHaveLength(1);
    expect(psg.documents?.[0].id).toBe('doc-forge');
    const sub = psg.nodes.find(n => n.type === 'SubPSG');
    expect(sub).toBeDefined();
    expect((sub as { documentId?: string }).documentId).toBe('doc-forge');

    const parsed = parsePSG(JSON.stringify(psg));
    expect(parsed.documents?.[0].name).toBe('Forge Wares');
    expect(parsed.nodes.some(n => n.type === 'SubPSG')).toBe(true);
  });

  it('imports classic PSG without documents unchanged', () => {
    const classic = {
      version: '1.0.0',
      name: 'Classic',
      nodes: [
        { id: 't', type: 'TextBlock', x: 0, y: 0, value: 'hello' },
        { id: 'o', type: 'Output', x: 100, y: 0, template: '' }
      ],
      edges: [{ id: 'e', source: 't', target: 'o' }]
    };
    const parsed = parsePSG(JSON.stringify(classic));
    expect(parsed.documents).toBeUndefined();
    expect(parsed.nodes).toHaveLength(2);
  });
});
