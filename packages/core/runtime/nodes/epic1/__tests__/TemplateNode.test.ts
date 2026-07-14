import { TemplateNode } from '../TemplateNode';
import { Epic1ExecutionEngine, type Epic1Edge } from '../Epic1ExecutionEngine';
import { TextBlockNode } from '../TextBlockNode';
import { OutputNode } from '../OutputNode';
import { Epic1NodeType } from '../nodeTypes';
import type { BaseInlineEditableNode } from '../BaseInlineEditableNode';

describe('TemplateNode', () => {
  it('fills slots and capitalizes/terminates by default flags', async () => {
    const node = new TemplateNode('t1', {
      template: 'a {age} {profession}',
      capitalize: true,
      terminate: true
    });
    node.setSlotValues({ age: 'young', profession: 'knight' });
    const out = await node.run({ variables: {} } as never);
    expect(out).toBe('A young knight.');
  });

  it('leaves missing slots empty without leftover braces', async () => {
    const node = new TemplateNode('t2', {
      template: 'a {age} {profession}',
      capitalize: true,
      terminate: false
    });
    node.setSlotValues({ age: 'tall' });
    const out = await node.run({ variables: {} } as never);
    expect(out).toBe('A tall');
  });

  it('space-joins multiple values for the same slot via engine', async () => {
    const subjectA = new TextBlockNode('a', 'red');
    const subjectB = new TextBlockNode('b', 'cloak');
    const template = new TemplateNode('tmpl', {
      template: 'a {subject} figure',
      capitalize: true,
      terminate: true
    });
    const output = new OutputNode('out', 'Output');

    const nodes = new Map<string, BaseInlineEditableNode>([
      ['a', subjectA],
      ['b', subjectB],
      ['tmpl', template],
      ['out', output]
    ]);

    const edges: Epic1Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'tmpl',
        sourceHandle: 'source',
        targetHandle: 'slot-subject'
      },
      {
        id: 'e2',
        source: 'b',
        target: 'tmpl',
        sourceHandle: 'source',
        targetHandle: 'slot-subject'
      },
      {
        id: 'e3',
        source: 'tmpl',
        target: 'out',
        sourceHandle: 'source',
        targetHandle: 'target'
      }
    ];

    const engine = new Epic1ExecutionEngine({ nodes, edges }, 42);
    const result = await engine.execute();
    expect(result.success).toBe(true);
    expect(result.output).toBe('A red cloak figure.');
  });

  it('is deterministic for the same seed and graph', async () => {
    const age = new TextBlockNode('age', 'old');
    const role = new TextBlockNode('role', 'wizard');
    const template = new TemplateNode('tmpl', {
      template: 'an {age} {role}',
      capitalize: true,
      terminate: true
    });
    const output = new OutputNode('out', 'Output');
    const nodes = new Map<string, BaseInlineEditableNode>([
      ['age', age],
      ['role', role],
      ['tmpl', template],
      ['out', output]
    ]);
    const edges: Epic1Edge[] = [
      {
        id: 'e1',
        source: 'age',
        target: 'tmpl',
        targetHandle: 'slot-age'
      },
      {
        id: 'e2',
        source: 'role',
        target: 'tmpl',
        targetHandle: 'slot-role'
      },
      { id: 'e3', source: 'tmpl', target: 'out' }
    ];

    const r1 = await new Epic1ExecutionEngine({ nodes, edges }, 7).execute();
    const r2 = await new Epic1ExecutionEngine({ nodes, edges }, 7).execute();
    expect(r1.output).toBe(r2.output);
    expect(r1.output).toBe('An old wizard.');
  });

  it('reports Template node type', () => {
    const node = new TemplateNode('t');
    expect(node.getNodeType()).toBe(Epic1NodeType.Template);
  });
});
