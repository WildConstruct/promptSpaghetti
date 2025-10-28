import React, { useCallback, useState } from 'react';
import type { Node } from 'reactflow';
import { NaturalLanguageSearch } from '../../services/NaturalLanguageSearch';
import type { Asset } from '../../services/assetMatcher';

type GraphContext = Record<string, unknown>;

interface AssetSearchPanelProps {
  assets: Asset[];
  onInsert: (asset: Asset) => void;
  graphContext?: GraphContext;
  selectedNode?: Node<{ label?: string }> | null;
}

export const AssetSearchPanel: React.FC<AssetSearchPanelProps> = ({
  assets,
  onInsert,
  graphContext,
  selectedNode
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [timeMs, setTimeMs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [nls] = useState(() => new NaturalLanguageSearch());
  const [exclude, setExclude] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [internalAssets, setInternalAssets] = useState<Asset[]>(assets);

  // Load assets from manifest if not provided
  const loadAssets = useCallback(async () => {
    if (assets && assets.length > 0) {
      setInternalAssets(assets);
      return;
    }
    try {
      const baseCandidates = [
        '/presets/manifest.json',
        '/asset-browser/presets/manifest.json'
      ];
      for (const url of baseCandidates) {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const text = await res.text();
        if (text.trim().startsWith('<')) continue;
        const json = JSON.parse(text) as {
          presets?: Array<{ id?: string; name?: string; path?: string }>;
        };
        const list = (json.presets || []).map((p, i) => ({
          id: p.id || String(i),
          name: p.name || p.id || `preset-${i}`,
          type: 'psglib' as const,
          metadata: { keywords: [p.path || ''] }
        }));
        setInternalAssets(list as Asset[]);
        return;
      }
    } catch {
      // ignore manifest loading errors; component falls back to provided assets
    }
  }, [assets]);
  React.useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  // Hook to global asset registry events
  React.useEffect(() => {
    const handler: EventListener = event => {
      const customEvent = event as CustomEvent<{ assets: Asset[] }>;
      if (customEvent?.detail?.assets) {
        setInternalAssets(customEvent.detail.assets);
      }
    };
    window.addEventListener('assetRegistry:update', handler);
    // Expose a simple registry helper for external callers
    const windowWithRegistry = window as typeof window & {
      assetRegistry?: { update?: (assets: Asset[]) => void };
    };
    if (!windowWithRegistry.assetRegistry) {
      windowWithRegistry.assetRegistry = {};
    }
    windowWithRegistry.assetRegistry.update = (nextAssets: Asset[]) => {
      window.dispatchEvent(
        new CustomEvent('assetRegistry:update', { detail: { assets: nextAssets } })
      );
    };
    return () => window.removeEventListener('assetRegistry:update', handler);
  }, []);

  const runSearch = useCallback(async () => {
    setBusy(true);
    const fullQuery = exclude ? `${query} but not ${exclude}` : query;
    const res = await nls.search(fullQuery, internalAssets, {
      limit: 50,
      graphContext
    });
    if (streaming) {
      // Simulate streaming by chunking updates
      const chunk = 10;
      setResults([]);
      for (let i = 0; i < res.assets.length; i += chunk) {
        const slice = res.assets.slice(i, i + chunk);
        setResults(prev => prev.concat(slice));
        await new Promise(r => setTimeout(r, 60));
      }
    } else {
      setResults(res.assets);
    }
    setTotal(res.totalMatches);
    setTimeMs(Math.round(res.executionTime));
    setBusy(false);
  }, [exclude, graphContext, internalAssets, nls, query, streaming]);

  return (
    <div
      style={{
        background: '#0b0b0b',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 8,
        padding: 10
      }}
    >
      <div
        style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search assets (e.g., find tense urban chase)"
          style={{ flex: 1 }}
          onKeyDown={e => {
            if (e.key === 'Enter') runSearch().catch(() => {});
          }}
        />
        <input
          value={exclude}
          onChange={e => setExclude(e.target.value)}
          placeholder="Exclude (e.g., fantasy)"
          style={{ minWidth: 160 }}
          onKeyDown={e => {
            if (e.key === 'Enter') runSearch().catch(() => {});
          }}
        />
        <button onClick={() => runSearch()} disabled={busy}>
          Search
        </button>
        {selectedNode && (
          <button
            onClick={() => {
              setQuery(
                `similar to ${selectedNode.data?.label || selectedNode.id}`
              );
              void runSearch();
            }}
          >
            Similar to selected
          </button>
        )}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12
          }}
        >
          <input
            type="checkbox"
            checked={streaming}
            onChange={e => setStreaming(e.target.checked)}
          />
          <span>Stream results</span>
        </label>
      </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
        {busy
          ? 'Searching...'
          : `Results: ${results.length}/${total} • ${timeMs}ms`}
      </div>
      <div style={{ maxHeight: 260, overflow: 'auto' }}>
        {results.map(asset => (
          <div
            key={asset.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{asset.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{asset.type}</div>
            </div>
            <button onClick={() => onInsert(asset)}>Insert</button>
          </div>
        ))}
        {results.length === 0 && !busy && (
          <div style={{ opacity: 0.75 }}>No results</div>
        )}
      </div>
    </div>
  );
};

export default AssetSearchPanel;
