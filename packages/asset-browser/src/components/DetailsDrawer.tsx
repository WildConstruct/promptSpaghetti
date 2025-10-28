import React, { useState } from 'react';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';
import { type BranchMap } from '../services/PreviewService';
import { BranchVisualization } from './branch/BranchVisualization';
import { usePreviewGenerator } from '../hooks/usePreviewGenerator';
import { usePreviewCache } from '../utils/usePreviewCache';

export function DetailsDrawer({
  open,
  selectedId
}: {
  open: boolean;
  selectedId?: string | null;
}) {
  const presets = useAssetBrowserStore(s => s.filteredPresets);
  const preset = presets.find(p => p.id === selectedId) || null;
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [simResults, setSimResults] = useState<Array<{
    seed: number;
    text: string;
  }> | null>(null);
  const [showBranch, setShowBranch] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [branchData, setBranchData] = useState<BranchMap | null>(null);
  const { simulate, branchMap } = usePreviewGenerator();
  const cache = usePreviewCache();

  const onSimulate = async () => {
    if (!preset) return;
    setSimError(null);
    setSimLoading(true);
    try {
      const cacheKey = `sim:${preset.id}`;
      const cached = cache.get<Array<{ seed: number; text: string }>>(cacheKey);
      const out = cached || (await simulate(preset, { seeds: [0, 1, 2] }));
      if (!cached) cache.set(cacheKey, out);
      setSimResults(out);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Simulation failed';
      setSimError(msg);
    } finally {
      setSimLoading(false);
    }
  };

  const onToggleBranch = async () => {
    const next = !showBranch;
    setShowBranch(next);
    if (next && !branchData && preset) {
      setBranchError(null);
      setBranchLoading(true);
      try {
        const cacheKey = `branch:${preset.id}`;
        const cached = cache.get<BranchMap>(cacheKey);
        const d = cached || (await branchMap(preset));
        if (!cached) cache.set(cacheKey, d);
        setBranchData(d);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Branch map failed';
        setBranchError(msg);
      } finally {
        setBranchLoading(false);
      }
    }
  };

  return (
    <aside
      aria-label="Details Drawer"
      aria-hidden={!open}
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: open ? 360 : 0,
        overflow: 'hidden',
        transition: 'width 150ms',
        borderLeft: '1px solid #eee',
        background: '#fff',
        padding: open ? 12 : 0
      }}
    >
      {open && (
        <div>
          <h3 style={{ marginTop: 0 }}>
            Details {preset ? `— ${preset.name}` : ''}
          </h3>
          <section aria-labelledby="simulate-title" aria-busy={simLoading}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h4 id="simulate-title" style={{ margin: '8px 0' }}>
                Sample Outputs
              </h4>
              <button
                type="button"
                onClick={onSimulate}
                disabled={!preset || simLoading}
                aria-label="Simulate"
              >
                {simLoading ? 'Simulating…' : 'Simulate'}
              </button>
            </div>
            {simError && (
              <div
                role="status"
                aria-live="polite"
                style={{ color: 'crimson' }}
              >
                {simError}
              </div>
            )}
            {simResults && (
              <ul>
                {simResults.map(r => (
                  <li key={r.seed}>
                    <code>#{r.seed}</code> {r.text}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="branch-title"
            aria-busy={branchLoading}
            style={{ marginTop: 16 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h4 id="branch-title" style={{ margin: '8px 0' }}>
                Branch Viz
              </h4>
              <button
                type="button"
                onClick={onToggleBranch}
                aria-pressed={showBranch}
                aria-label="Toggle branch visualization"
              >
                {showBranch ? 'Hide' : 'Show'}
              </button>
            </div>
            {branchError && (
              <div
                role="status"
                aria-live="polite"
                style={{ color: 'crimson' }}
              >
                {branchError}
              </div>
            )}
            {showBranch && branchData && (
              <BranchVisualization data={branchData} />
            )}
          </section>
        </div>
      )}
    </aside>
  );
}
