/**
 * Implicit concatenation (parts-of-speech pattern).
 *
 * Locks the concat/merge semantics: wiring one content node directly into
 * another auto-concatenates — the upstream value becomes a space-separated
 * prefix — with NO Merge node in between. See docs/concat-merge-semantics.md.
 */

import {
  WeightedChoiceNode,
  OutputNode,
  Epic1ExecutionEngine,
  GraphBuilder
} from '../index';

describe('Implicit concat — parts-of-speech pattern', () => {
  it('prepends a condition modifier onto a hat (no Merge node)', async () => {
    const condition = new WeightedChoiceNode('condition', [
      { id: 'c1', text: 'worn and faded', weight: 50 },
      { id: 'c2', text: 'mud-covered', weight: 50 }
    ]);
    const hat = new WeightedChoiceNode('hat', [
      { id: 'h1', text: 'fedora', weight: 50 },
      { id: 'h2', text: 'flat cap', weight: 50 }
    ]);
    const output = new OutputNode('output');
    output.lock();

    const graph = new GraphBuilder()
      .addNode(condition)
      .addNode(hat)
      .addNode(output)
      .connect('condition', 'hat') // implicit concat: condition -> hat
      .connect('hat', 'output')
      .build();

    const engine = new Epic1ExecutionEngine(graph, 'pos-seed');
    const result = await engine.execute();

    expect(result.success).toBe(true);
    // "<condition> <hat>" — both parts present, condition first, single space.
    expect(result.output).toMatch(
      /^(worn and faded|mud-covered) (fedora|flat cap)$/
    );
  });

  it('is deterministic for the same seed', async () => {
    const build = () => {
      const condition = new WeightedChoiceNode('condition', [
        { id: 'c1', text: 'worn and faded', weight: 50 },
        { id: 'c2', text: 'mud-covered', weight: 50 }
      ]);
      const hat = new WeightedChoiceNode('hat', [
        { id: 'h1', text: 'fedora', weight: 50 },
        { id: 'h2', text: 'flat cap', weight: 50 }
      ]);
      const output = new OutputNode('output');
      output.lock();
      return new GraphBuilder()
        .addNode(condition)
        .addNode(hat)
        .addNode(output)
        .connect('condition', 'hat')
        .connect('hat', 'output')
        .build();
    };

    const a = await new Epic1ExecutionEngine(build(), 'same-seed').execute();
    const b = await new Epic1ExecutionEngine(build(), 'same-seed').execute();
    expect(a.output).toBe(b.output);
  });
});
