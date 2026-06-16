/**
 * Branch-routing tests for WeightedChoice per-option outputs.
 *
 * A WeightedChoice emits one value (the selected option text) on its default
 * output (`source`/`main`, always active). Per-option branch outputs
 * (`branch-${i}`, and legacy `option-${i}`) must only carry that value when
 * option i is the one that was selected. These tests pin that gating with
 * deterministic weights (100/0) so the selected index is fixed.
 */

import {
  TextBlockNode,
  WeightedChoiceNode,
  ConcatNode,
  OutputNode,
  Epic1ExecutionEngine
} from '../index';
import type { Epic1Edge } from '../Epic1ExecutionEngine';

const MARKER = 'BRANCHMARKER';

/**
 * Build:
 *   WeightedChoice(A=100, B=0) --default `source`--> Concat(input1)
 *   WeightedChoice --[branchHandle]--> TextBlock(MARKER) --> Concat(input2)
 *   Concat --> Output
 * Option A (index 0) is always selected. Whether MARKER reaches the Output
 * depends purely on whether the branch edge's handle gates to the selected
 * option. (A Concat is the merge point because Output rejects >1 input.)
 */
function buildGraph(branchHandle: string) {
  const wc = new WeightedChoiceNode('wc', [
    { id: '1', text: 'A', weight: 100 },
    { id: '2', text: 'B', weight: 0 }
  ]);
  const tb = new TextBlockNode('tb', MARKER);
  const concat = new ConcatNode('concat', { separator: ' ', trimInputs: true });
  const out = new OutputNode('out');
  out.lock();

  const nodes = new Map<string, any>([
    ['wc', wc],
    ['tb', tb],
    ['concat', concat],
    ['out', out]
  ]);

  const edges: Epic1Edge[] = [
    {
      id: 'e-default',
      source: 'wc',
      sourceHandle: 'source',
      target: 'concat',
      targetHandle: 'input1'
    },
    { id: 'e-branch', source: 'wc', sourceHandle: branchHandle, target: 'tb' },
    {
      id: 'e-tb',
      source: 'tb',
      sourceHandle: 'source',
      target: 'concat',
      targetHandle: 'input2'
    },
    { id: 'e-out', source: 'concat', sourceHandle: 'source', target: 'out' }
  ];

  return { nodes, edges };
}

async function run(branchHandle: string): Promise<string> {
  const engine = new Epic1ExecutionEngine(buildGraph(branchHandle), 'seed-1');
  const result = await engine.execute();
  expect(result.success).toBe(true);
  return String(result.output ?? '');
}

describe('WeightedChoice branch routing', () => {
  it('always selects the weight-100 option (deterministic harness sanity)', async () => {
    // branch on the SELECTED option (index 0) -> marker present
    const output = await run('branch-0');
    expect(output).toContain('A');
    expect(output).toContain(MARKER);
  });

  it('fires a branch-N output only when option N is the selected option', async () => {
    // branch-1 targets option B (weight 0) which is never selected -> gated off
    const output = await run('branch-1');
    expect(output).toContain('A');
    expect(output).not.toContain(MARKER);
  });

  it('keeps the default `source` output active regardless of branches', async () => {
    // Even with a (gated-off) branch present, the default output still flows.
    const output = await run('branch-1');
    expect(output).toContain('A');
  });

  it('gates legacy `option-N` handles the same as `branch-N` (Bug 9)', async () => {
    // Selected option 0 via legacy handle -> active -> marker present.
    expect(await run('option-0')).toContain(MARKER);
    // Unselected option 1 via legacy handle -> MUST be gated off (pre-fix this
    // fired unconditionally because `option-` did not match the `branch-` gate).
    expect(await run('option-1')).not.toContain(MARKER);
  });
});
