import { WeightedChoiceNode,
  ConcatNode,
  OutputNode,
  IncludeNode,
  SetVariableNode,
  GetVariableNode }
  ExecutionContext
 from '../runtime';
import seedrandom from 'seedrandom';
describe('Runtime node classes', () => {
  const baseCtx = (): ExecutionContext => ({ variables: {}, seed: 'abc' });
  it('WeightedChoiceNode returns deterministic value for same seed', () => {
    // Mock Math.random via seedrandom for full determinism
    const choices = [
      { value: 'A', weight: 1 },
      { value: 'B', weight: 1 },
      { value: 'C', weight: 1 }
    ];
    const node1 = new WeightedChoiceNode('w1', choices);
    const node2 = new WeightedChoiceNode('w2', choices);
    const ctx1 = baseCtx();
    const ctx2 = baseCtx();
    const out1 = node1.run(ctx1);
    const out2 = node2.run(ctx2);
    expect(out1).toBe(out2);
  });
  it('ConcatNode joins strings', () => { const node = new ConcatNode('c1', ['Hello', ', ', 'world!']);
    expect(node.run()).toBe('Hello, world!') });
  it('OutputNode echoes input', () => { const node = new OutputNode('o1', 'Final');
    expect(node.run()).toBe('Final') });
  it('IncludeNode looks up value', () => {
    const node = new IncludeNode('inc', 'greet', { greet: 'hi' });
    expect(node.run(baseCtx())).toBe('hi');
  });
  it('SetVariableNode and GetVariableNode mutate/shared context', () => { const ctx = baseCtx();
    const setNode = new SetVariableNode('set1', 'x', 42);
    const getNode = new GetVariableNode('get1', 'x');
    setNode.run(ctx);
    const value = getNode.run(ctx);
    expect(value).toBe(42);
    expect(ctx.variables.x).toBe(42) });
});