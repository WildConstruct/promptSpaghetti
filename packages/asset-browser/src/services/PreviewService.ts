import type { Preset } from '../types';

export type SimulateOptions = { seeds: number[] };
export type SimulateResult = Array<{ seed: number; text: string }>;

export type BranchNode = { id: string };
export type BranchEdge = { from: string; to: string; weight?: number };
export type BranchMap = { nodes: BranchNode[]; edges: BranchEdge[] };

export const PreviewService = {
  async simulate(
    preset: Preset,
    opts: SimulateOptions
  ): Promise<SimulateResult> {
    const { seeds } = opts;
    // Simple deterministic stub based on preset id and seed
    return seeds.map(seed => ({
      seed,
      text: `Sample for ${preset.name} (seed ${seed})`
    }));
  },

  async branchMap(preset: Preset): Promise<BranchMap> {
    // Minimal placeholder graph based on preset id length
    const base = preset.id.slice(0, 3) || 'pre';
    const nodes: BranchNode[] = [
      { id: `${base}-A` },
      { id: `${base}-B` },
      { id: `${base}-C` }
    ];
    const edges: BranchEdge[] = [
      { from: nodes[0].id, to: nodes[1].id, weight: 1 },
      { from: nodes[1].id, to: nodes[2].id, weight: 2 }
    ];
    return { nodes, edges };
  }
};
