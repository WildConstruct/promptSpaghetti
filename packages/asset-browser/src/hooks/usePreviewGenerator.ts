import { useMemo } from 'react';
import type { Preset } from '../types';
import {
  PreviewService,
  type BranchMap,
  type SimulateResult
} from '../services/PreviewService';

type WorkerProxy = {
  simulate(p: Preset, opts: { seeds: number[] }): Promise<SimulateResult>;
  branchMap(p: Preset): Promise<BranchMap>;
};

// NOTE: Worker wiring is disabled in test/Node environments to avoid ESM import.meta issues.
// In app runtime, this can be re-enabled with a bundler-safe worker initializer.
function ensureWorker() {
  return null;
}

export function usePreviewGenerator() {
  const proxy = useMemo<WorkerProxy | null>(
    () => ensureWorker() as WorkerProxy | null,
    []
  );

  return {
    async simulate(
      preset: Preset,
      opts: { seeds: number[] }
    ): Promise<SimulateResult> {
      if (proxy) return proxy.simulate(preset, opts);
      return PreviewService.simulate(preset, opts);
    },
    async branchMap(preset: Preset): Promise<BranchMap> {
      if (proxy) return proxy.branchMap(preset);
      return PreviewService.branchMap(preset);
    }
  };
}
