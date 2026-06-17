/**
 * Locked option ("fixed DNA"): a WeightedChoice with a locked option always
 * resolves to that option, regardless of weights or seed.
 */
import {
  WeightedChoiceNode,
  OutputNode,
  Epic1ExecutionEngine
} from '../index';
import type { Epic1Edge } from '../Epic1ExecutionEngine';

function buildGraph(lockedFirst: boolean) {
  const wc = new WeightedChoiceNode('wc', [
    { id: '1', text: 'LOCKED', weight: 1, locked: lockedFirst },
    { id: '2', text: 'HEAVY', weight: 999 }
  ]);
  const out = new OutputNode('out');
  out.lock();
  const nodes = new Map<string, any>([
    ['wc', wc],
    ['out', out]
  ]);
  const edges: Epic1Edge[] = [
    { id: 'e', source: 'wc', sourceHandle: 'source', target: 'out' }
  ];
  return { nodes, edges };
}

async function run(lockedFirst: boolean, seed: string): Promise<string> {
  const engine = new Epic1ExecutionEngine(buildGraph(lockedFirst), seed);
  const result = await engine.execute();
  expect(result.success).toBe(true);
  return String(result.output ?? '');
}

describe('WeightedChoice locked option (fixed DNA)', () => {
  it('always selects the locked option across seeds, despite tiny weight', async () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(await run(true, seed)).toBe('LOCKED');
    }
  });

  it('without a lock, the heavy-weight option dominates', async () => {
    // Sanity: with no lock, weight 1 vs 999 should resolve to HEAVY for these
    // seeds (proves the lock above is doing real work, not coincidence).
    for (const seed of ['a', 'b', 'c', 'd']) {
      expect(await run(false, seed)).toBe('HEAVY');
    }
  });
});
