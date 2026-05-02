import React, { useCallback, useState } from 'react';
import type { Node } from 'reactflow';
import { NaturalLanguageSearch } from '../../services/NaturalLanguageSearch';
import type { Asset } from '../../services/assetMatcher';
import './AssetSearchPanel.css';

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
  const [hasSearched, setHasSearched] = useState(false);

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
        if (!res.ok) {
          continue;
        }

        const text = await res.text();
        if (text.trim().startsWith('<')) {
          continue;
        }

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
      // The panel can still search caller-provided assets if the manifest is unavailable.
    }
  }, [assets]);

  React.useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  React.useEffect(() => {
    const handler: EventListener = event => {
      const customEvent = event as CustomEvent<{ assets: Asset[] }>;
      if (customEvent?.detail?.assets) {
        setInternalAssets(customEvent.detail.assets);
      }
    };

    window.addEventListener('assetRegistry:update', handler);
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

  const runSearch = useCallback(async (queryOverride = query) => {
    setBusy(true);
    setHasSearched(true);
    const fullQuery = exclude
      ? `${queryOverride} but not ${exclude}`
      : queryOverride;
    const res = await nls.search(fullQuery, internalAssets, {
      limit: 50,
      graphContext
    });

    if (streaming) {
      const chunk = 10;
      setResults([]);
      for (let i = 0; i < res.assets.length; i += chunk) {
        const slice = res.assets.slice(i, i + chunk);
        setResults(prev => prev.concat(slice));
        await new Promise(resolve => setTimeout(resolve, 60));
      }
    } else {
      setResults(res.assets);
    }

    setTotal(res.totalMatches);
    setTimeMs(Math.round(res.executionTime));
    setBusy(false);
  }, [exclude, graphContext, internalAssets, nls, query, streaming]);

  const visibleAssets = hasSearched ? results : internalAssets.slice(0, 24);
  const statusText = busy
    ? 'Searching...'
    : hasSearched
      ? `Results ${results.length}/${total} · ${timeMs}ms`
      : `Indexed ${internalAssets.length}`;

  return (
    <div className="asset-search-panel">
      <div className="asset-search-header">
        <div>
          <h3>Explore Library</h3>
          <p>
            {selectedNode
              ? `Context: ${selectedNode.data?.label || selectedNode.id}`
              : 'Context: active graph'}
          </p>
        </div>
        <div className="asset-search-status">{statusText}</div>
      </div>

      <div className="asset-search-controls">
        <input
          className="asset-search-input asset-search-query"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search assets"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              void runSearch();
            }
          }}
        />
        <input
          className="asset-search-input asset-search-exclude"
          value={exclude}
          onChange={e => setExclude(e.target.value)}
          placeholder="Exclude"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              void runSearch();
            }
          }}
        />
        <button
          className="asset-search-button primary"
          onClick={() => runSearch()}
          disabled={busy}
        >
          Search
        </button>
        {selectedNode && (
          <button
            className="asset-search-button secondary"
            onClick={() => {
              const similarQuery =
                `similar to ${selectedNode.data?.label || selectedNode.id}`;
              setQuery(similarQuery);
              void runSearch(similarQuery);
            }}
          >
            Similar
          </button>
        )}
        <label className="asset-search-toggle">
          <input
            type="checkbox"
            checked={streaming}
            onChange={e => setStreaming(e.target.checked)}
          />
          <span>Stream</span>
        </label>
      </div>

      <div className="asset-search-results">
        {visibleAssets.map(asset => (
          <div
            key={asset.id}
            className="asset-search-result"
          >
            <div className="asset-search-result-copy">
              <div className="asset-search-result-name">{asset.name}</div>
              <div className="asset-search-result-type">{asset.type}</div>
            </div>
            <button
              className="asset-search-insert"
              onClick={() => onInsert(asset)}
            >
              Insert
            </button>
          </div>
        ))}
        {visibleAssets.length === 0 && !busy && (
          <div className="asset-search-empty">No results</div>
        )}
      </div>
    </div>
  );
};

export default AssetSearchPanel;
