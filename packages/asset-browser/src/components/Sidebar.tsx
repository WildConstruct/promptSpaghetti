import React, { useEffect } from 'react';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';

export function Sidebar() {
  const tags = useAssetBrowserStore(s => s.availableTags);
  const activeTags = useAssetBrowserStore(s => s.activeTags);
  const toggleTag = useAssetBrowserStore(s => s.toggleTag);
  const query = useAssetBrowserStore(s => s.query);
  const setQuery = useAssetBrowserStore(s => s.setQuery);
  const scanStatus = useAssetBrowserStore(s => s.scanStatus);
  const error = useAssetBrowserStore(s => s.error);
  const focusArea = useAssetBrowserStore(s => s.focusArea);
  const focusIndex = useAssetBrowserStore(s => s.focusIndex);
  const setSidebarCount = useAssetBrowserStore(s => s.setSidebarCount);
  const setFocus = useAssetBrowserStore(s => s.setFocus);

  useEffect(() => {
    setSidebarCount(tags.length);
  }, [tags.length, setSidebarCount]);
  return (
    <aside
      aria-label="Asset Libraries"
      role="navigation"
      style={{ borderRight: '1px solid #eee', padding: 8 }}
    >
      <div aria-live="polite" style={{ fontSize: 12, color: '#555' }}>
        {scanStatus === 'scanning' && <span>Scanning…</span>}
        {scanStatus === 'error' && (
          <span role="alert" style={{ color: '#b00' }}>
            Scan error: {error}
          </span>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label
          htmlFor="asset-search"
          style={{ display: 'block', fontWeight: 600 }}
        >
          Search
        </label>
        <input
          id="asset-search"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search presets"
          aria-label="Search presets"
          style={{ width: '100%', padding: '6px 8px' }}
        />
      </div>
      <h3 id="tags">Tags</h3>
      {scanStatus === 'done' && tags.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          style={{ fontSize: 12, color: '#555', padding: '4px 0' }}
        >
          No tags available.
        </div>
      ) : (
        <ul role="listbox" aria-labelledby="tags">
          {tags.map((t, idx) => (
            <li key={t} role="option" aria-selected={activeTags.includes(t)}>
              <button
                type="button"
                onClick={() => toggleTag(t)}
                aria-pressed={activeTags.includes(t)}
                tabIndex={
                  focusArea === 'sidebar' && focusIndex === idx ? 0 : -1
                }
                onFocus={() => setFocus('sidebar', idx)}
              >
                {activeTags.includes(t) ? '✓ ' : ''}
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
