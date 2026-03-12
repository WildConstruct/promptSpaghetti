import type { Preset } from '../types';

export type SimulateOptions = { seeds: number[] };
export type SimulateResult = Array<{ seed: number; text: string }>;

export type BranchNode = { id: string };
export type BranchEdge = { from: string; to: string; weight?: number };
export type BranchMap = { nodes: BranchNode[]; edges: BranchEdge[] };

const PREVIEW_UNAVAILABLE_ERROR =
  'Preset preview generation is not available in this MVP build.';

export const PreviewService = {
  async simulate(
    _preset: Preset,
    _opts: SimulateOptions
  ): Promise<SimulateResult> {
    throw new Error(PREVIEW_UNAVAILABLE_ERROR);
  },

  async branchMap(_preset: Preset): Promise<BranchMap> {
    throw new Error(PREVIEW_UNAVAILABLE_ERROR);
  }
};
