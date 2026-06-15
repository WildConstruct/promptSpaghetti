/**
 * End-to-end: natural-language assembly through the real execution engine.
 * Proves that variation fragments merged with a prose joinStyle produce output
 * that reads as a sentence (capitalized, terminated, no gaps) and stays
 * deterministic per seed — the core "prompts read as natural language" promise.
 */
import {
  GraphBuilder,
  WeightedChoiceNode,
  TextBlockNode,
  OutputNode,
  Epic1ExecutionEngine
} from '../index';
import { ConcatNode } from '../ConcatNode';

function buildPortraitGraph(joinStyle?: 'sentence' | 'separator') {
  const adj = new WeightedChoiceNode('adj', [
    { id: 'f', text: 'fierce', weight: 1 },
    { id: 'g', text: 'gentle', weight: 1 }
  ]);
  const noun = new TextBlockNode('noun', 'knight');
  const merge = new ConcatNode('merge', {
    separator: ' ',
    trimInputs: true,
    joinStyle
  });
  const output = new OutputNode('output');
  output.lock();

  return new GraphBuilder()
    .addNode(adj)
    .addNode(noun)
    .addNode(merge)
    .addNode(output)
    .connect('adj', 'merge')
    .connect('noun', 'merge')
    .connect('merge', 'output')
    .build();
}

describe('natural-language assembly (end-to-end)', () => {
  it('produces a capitalized, terminated sentence', async () => {
    const engine = new Epic1ExecutionEngine(buildPortraitGraph('sentence'), 's1');
    const result = await engine.execute();

    expect(result.success).toBe(true);
    // Reads as prose: "Fierce knight." or "Gentle knight."
    expect(result.output).toMatch(/^(Fierce|Gentle) knight\.$/);
    // No assembly artifacts.
    expect(result.output).not.toMatch(/\s{2,}/);
    expect(result.output).not.toMatch(/^\s|\s$/);
  });

  it('is deterministic for a given seed', async () => {
    const outputs = new Set<string>();
    for (let i = 0; i < 15; i++) {
      const engine = new Epic1ExecutionEngine(
        buildPortraitGraph('sentence'),
        'fixed-seed'
      );
      outputs.add((await engine.execute()).output);
    }
    expect(outputs.size).toBe(1);
  });

  it('still varies across different seeds', async () => {
    const outputs = new Set<string>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const engine = new Epic1ExecutionEngine(
        buildPortraitGraph('sentence'),
        seed
      );
      outputs.add((await engine.execute()).output);
    }
    // Both fragment choices should appear across seeds.
    expect(outputs.size).toBeGreaterThan(1);
  });

  it('defaults to legacy space-join when no joinStyle is set', async () => {
    const engine = new Epic1ExecutionEngine(buildPortraitGraph(), 's1');
    const result = await engine.execute();
    // Legacy behavior: lower-case, no terminal punctuation.
    expect(result.output).toMatch(/^(fierce|gentle) knight$/);
  });
});
