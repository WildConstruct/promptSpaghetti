import React, { useState, useMemo, useEffect } from 'react';
import '../styles/LogicBrowserStyles.css';
import type { Preset } from '../types';
import { LibraryService } from '../services/LibraryService';

// Inline SVG icons for a more polished, Logic-like look
const IconList = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor" />
  </svg>
);

const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="4" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="13" y="4" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="4" y="13" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="13" y="13" width="7" height="7" rx="1" fill="currentColor" />
  </svg>
);

const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <rect x="11" y="10" width="2" height="7" rx="1" fill="currentColor" />
    <rect x="11" y="6" width="2" height="2" rx="1" fill="currentColor" />
  </svg>
);

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      fill="currentColor"
      opacity="0.2"
    />
    <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" />
    <line
      x1="8"
      y1="13"
      x2="16"
      y2="13"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="8"
      y1="17"
      x2="16"
      y2="17"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

interface ProAssetBrowserProps {
  onInsert?: (preset: Preset) => void;
}

// Presets will be loaded from the published manifest at /presets/manifest.json
// and mapped into the Preset shape used by the browser.
// This ensures drag/drop payload IDs and paths match the graph editor resolver.
type ManifestPresetEntry = {
  id: string;
  path: string;
  name?: string;
  tags?: string[];
  nodeTypes?: string[];
  category?: string;
  description?: string;
  thumbnail?: string;
};

// Computed chips from manifest
const unique = (arr: string[]) => Array.from(new Set(arr));

export function ProAssetBrowser({ onInsert }: ProAssetBrowserProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<
    'name' | 'category' | 'complexity' | 'nodes'
  >('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDetails, setShowDetails] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const [assetBase, setAssetBase] = useState<string>('/presets');
  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedTags([]);
    setSearchQuery('');
  };

  // Derive categories and tags from loaded presets
  const categories = useMemo<string[]>(() => {
    const cats = presets
      .map(p => p.category)
      .filter((c): c is string => Boolean(c));
    return ['All', ...unique(cats)];
  }, [presets]);
  const allTags = useMemo<string[]>(() => {
    const tags = presets.flatMap(p => (Array.isArray(p.tags) ? p.tags : []));
    return unique(tags);
  }, [presets]);

  // Load manifest on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const baseUrl =
          (import.meta as unknown as { env?: { BASE_URL?: string } })?.env
            ?.BASE_URL || '/';
        const candidates = [
          `${String(baseUrl).replace(/\/$/, '')}/presets/manifest.json`,
          '/presets/manifest.json',
          '/asset-browser/presets/manifest.json'
        ];
        let manifest: { presets?: ManifestPresetEntry[] } | null = null;
        let chosenBase = '/presets';
        for (const url of candidates) {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) continue;
            const text = await res.text();
            const trimmed = text.trim();
            if (
              trimmed.startsWith('<!doctype') ||
              trimmed.startsWith('<html')
            ) {
              continue; // HTML, not JSON
            }
            const json = JSON.parse(trimmed);
            manifest = json as { presets?: ManifestPresetEntry[] };
            // Derive asset base from URL used
            if (url.includes('/asset-browser/')) {
              chosenBase = '/asset-browser/presets';
            } else {
              chosenBase = '/presets';
            }
            break;
          } catch {
            // try next
          }
        }
        if (!manifest) throw new Error('Manifest not found');
        const items: Preset[] = Array.isArray(manifest?.presets)
          ? manifest.presets.map((p: ManifestPresetEntry) => ({
              id: String(p.id),
              name: String(p.name ?? p.id),
              tags: Array.isArray(p.tags) ? p.tags : [],
              type: 'graph',
              path: p.path,
              nodeTypes: Array.isArray(p.nodeTypes) ? p.nodeTypes : [],
              category: p.category ?? undefined,
              description: p.description ?? undefined,
              thumbnail: p.thumbnail ?? undefined
            }))
          : [];
        if (!cancelled) {
          setPresets(items);
          setUsedFallback(false);
          setAssetBase(chosenBase);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load presets';
          setError(msg);
          // Fallback to stubbed presets so the UI remains usable
          try {
            const fallback = await LibraryService.listPresets();
            setPresets(fallback);
            setUsedFallback(true);
            setAssetBase('/presets');
          } catch {
            // leave presets empty
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Filter and sort presets
  const filteredPresets = useMemo(() => {
    let filtered = [...presets];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          (p.category || '').toLowerCase().includes(query) ||
          p.tags.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'complexity':
          comparison = (a.complexity || '').localeCompare(b.complexity || '');
          break;
        case 'nodes':
          comparison = (a.nodes || 0) - (b.nodes || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    selectedCategory,
    selectedTags,
    searchQuery,
    sortColumn,
    sortDirection,
    presets
  ]);

  const handleSort = (column: typeof sortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleInsert = (preset: Preset) => {
    onInsert?.(preset);
  };

  const normalizeAssetPath = (path?: string): string | undefined => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
    if (path.startsWith('./')) return `${assetBase}/${path.slice(2)}`;
    return `${assetBase}/${path}`;
  };

  const handleDragStart = (e: React.DragEvent, preset: Preset) => {
    try {
      const payload = JSON.stringify({
        id: preset.id,
        name: preset.name,
        tags: preset.tags,
        type: preset.type ?? 'graph',
        path: preset.path,
        nodeTypes: preset.nodeTypes
      });
      e.dataTransfer.setData('application/x-preset', payload);
      // Provide a plain-text fallback for other drop targets
      e.dataTransfer.setData('text/plain', preset.name);
      e.dataTransfer.effectAllowed = 'copy';
    } catch {
      // no-op
    }
  };

  // Auto-open details when an item is selected
  useEffect(() => {
    if (selectedPreset && !showDetails) setShowDetails(true);
  }, [selectedPreset, showDetails]);

  return (
    <div className="asset-browser-pro-horizontal">
      {/* Top Section with View Controls and Search Bar */}
      <div className="browser-search-bar">
        {/* View Controls on the left */}
        <div className="view-controls-section">
          <div className="segmented-icon-group">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              aria-pressed={viewMode === 'list'}
            >
              <IconList />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-pressed={viewMode === 'grid'}
            >
              <IconGrid />
            </button>
            <button
              className={`view-toggle-btn ${showDetails ? 'active' : ''}`}
              onClick={() => setShowDetails(!showDetails)}
              title="Show Details"
              aria-pressed={showDetails}
            >
              <IconInfo />
            </button>
          </div>
        </div>

        {/* Search Field on the right */}
        <div className="browser-search-field">
          <span className="browser-search-icon">🔍</span>
          <input
            type="text"
            className="browser-search-input"
            placeholder="Search presets..."
            aria-label="Search presets"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        {(selectedCategory !== 'All' ||
          selectedTags.length > 0 ||
          searchQuery) && (
          <button
            className="clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Keyword Buttons Section - Full Width Below Search */}
      <div className="browser-top-controls">
        <div className="keyword-buttons-section">
          <div className="keyword-row">
            <button
              className={`keyword-btn ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {categories.slice(1).map((cat: string) => (
              <button
                key={cat}
                className={`keyword-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="keyword-row">
            {allTags.map((tag: string) => (
              <button
                key={tag}
                className={`keyword-btn tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="browser-main-content">
        <div className="content-wrapper">
          {loading && (
            <div style={{ padding: 8, color: '#9ca3af' }}>Loading presets…</div>
          )}
          {error && !loading && (
            <div
              style={{
                padding: 8,
                color: '#ef4444',
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}
            >
              <span>Failed to load presets: {error}</span>
              <button
                className="retry-btn"
                onClick={() => setReloadKey(k => k + 1)}
              >
                Retry
              </button>
            </div>
          )}
          {usedFallback && !loading && (
            <div style={{ padding: 8, color: '#b45309' }}>
              Using fallback presets (manifest not available).
            </div>
          )}
          {/* List/Grid View */}
          {viewMode === 'list' ? (
            <div className="preset-list-container">
              {/* Column Headers */}
              <div className="preset-list-header">
                <div className="column-header icon-col"></div>
                <div
                  className={`column-header sortable ${sortColumn === 'name' ? `sorted-${sortDirection}` : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Name
                </div>
                <div
                  className={`column-header sortable ${sortColumn === 'category' ? `sorted-${sortDirection}` : ''}`}
                  onClick={() => handleSort('category')}
                >
                  Category
                </div>
                <div
                  className={`column-header sortable ${sortColumn === 'complexity' ? `sorted-${sortDirection}` : ''}`}
                  onClick={() => handleSort('complexity')}
                >
                  Level
                </div>
                <div
                  className={`column-header sortable ${sortColumn === 'nodes' ? `sorted-${sortDirection}` : ''}`}
                  onClick={() => handleSort('nodes')}
                >
                  Nodes
                </div>
                <div className="column-header action-col">Action</div>
              </div>

              {/* Preset Rows */}
              <div className="preset-list-body">
                {!loading && !error && filteredPresets.length === 0 && (
                  <div style={{ padding: 12, color: '#9ca3af' }}>
                    No presets match your filters.
                  </div>
                )}
                {filteredPresets.map(preset => (
                  <div
                    key={preset.id}
                    className={`preset-list-item ${selectedPreset === preset.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPreset(preset.id)}
                    onDoubleClick={() => handleInsert(preset)}
                    draggable
                    onDragStart={e => handleDragStart(e, preset)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInsert(preset);
                      } else if (e.key === ' ') {
                        e.preventDefault();
                        setSelectedPreset(preset.id);
                        setShowDetails(true);
                      }
                    }}
                  >
                    <div className="preset-icon">
                      {preset.thumbnail ? (
                        <img
                          src={normalizeAssetPath(preset.thumbnail)}
                          alt={`Thumbnail for ${preset.name}`}
                          style={{
                            width: 16,
                            height: 16,
                            objectFit: 'cover',
                            borderRadius: 2
                          }}
                        />
                      ) : (
                        <IconDoc />
                      )}
                    </div>
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-category">
                      {preset.category || ''}
                    </div>
                    <div className="preset-meta">{preset.complexity || ''}</div>
                    <div className="preset-meta">{preset.nodes || 0}</div>
                    <div className="preset-action">
                      <button
                        className="insert-btn"
                        onClick={e => {
                          e.stopPropagation();
                          handleInsert(preset);
                        }}
                        aria-label={`Insert ${preset.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="preset-grid-container">
              {!loading && !error && filteredPresets.length === 0 && (
                <div style={{ padding: 12, color: '#9ca3af' }}>
                  No presets match your filters.
                </div>
              )}
              {filteredPresets.map(preset => (
                <div
                  key={preset.id}
                  className={`preset-card-compact ${selectedPreset === preset.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPreset(preset.id)}
                  onDoubleClick={() => handleInsert(preset)}
                  draggable
                  onDragStart={e => handleDragStart(e, preset)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInsert(preset);
                    } else if (e.key === ' ') {
                      e.preventDefault();
                      setSelectedPreset(preset.id);
                      setShowDetails(true);
                    }
                  }}
                >
                  <button
                    className="preset-insert-btn"
                    onClick={e => {
                      e.stopPropagation();
                      handleInsert(preset);
                    }}
                    aria-label={`Insert ${preset.name}`}
                  >
                    +
                  </button>
                  <div className="preset-card-header">
                    <div className="preset-card-icon">
                      {preset.thumbnail ? (
                        <img
                          src={normalizeAssetPath(preset.thumbnail)}
                          alt=""
                          style={{
                            width: 20,
                            height: 20,
                            objectFit: 'cover',
                            borderRadius: 2
                          }}
                        />
                      ) : (
                        <>📄</>
                      )}
                    </div>
                    <div className="preset-card-title">{preset.name}</div>
                  </div>
                  <div className="preset-card-meta">
                    <span className="preset-card-tag">
                      {preset.category || 'Uncategorized'}
                    </span>
                    <span className="preset-card-tag">
                      {preset.nodes || 0} nodes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Combined Details and Preview Panel */}
          {showDetails &&
            selectedPreset &&
            (() => {
              const preset = filteredPresets.find(p => p.id === selectedPreset);
              if (!preset) return null;

              return (
                <div className="details-panel-inline">
                  <div className="details-header">
                    <div className="details-title">{preset.name}</div>
                    <div className="details-subtitle">
                      {preset.category || ''}
                    </div>
                  </div>
                  <div
                    className="details-content"
                    style={{ display: 'flex', gap: '20px' }}
                  >
                    {/* Left side - metadata */}
                    <div style={{ flex: 1 }}>
                      <div className="details-row">
                        <span className="details-label">Category:</span>
                        <span className="details-value">
                          {preset.category || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="details-row">
                        <span className="details-label">Complexity:</span>
                        <span className="details-value">
                          {preset.complexity || 'N/A'}
                        </span>
                      </div>
                      <div className="details-row">
                        <span className="details-label">Nodes:</span>
                        <span className="details-value">
                          {preset.nodes || 0}
                        </span>
                      </div>
                    </div>

                    {/* Middle - tags and node types */}
                    <div style={{ flex: 1 }}>
                      <div className="details-row">
                        <span className="details-label">Tags:</span>
                        <span className="details-value">
                          {preset.tags?.length
                            ? preset.tags.map(t => (
                                <span
                                  key={t}
                                  className="tag-pill"
                                  style={{ marginRight: 4 }}
                                >
                                  {t}
                                </span>
                              ))
                            : 'None'}
                        </span>
                      </div>
                      <div className="details-row">
                        <span className="details-label">Node Types:</span>
                        <span className="details-value">
                          {preset.nodeTypes?.length
                            ? preset.nodeTypes.map(t => (
                                <span
                                  key={t}
                                  className="tag-pill"
                                  style={{ marginRight: 4 }}
                                >
                                  {t}
                                </span>
                              ))
                            : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Right side - description and thumbnail */}
                    <div style={{ flex: 1 }}>
                      {preset.description && (
                        <div className="details-row">
                          <span className="details-label">Description:</span>
                          <span className="details-value">
                            {preset.description}
                          </span>
                        </div>
                      )}
                      {preset.thumbnail && (
                        <div
                          className="preview-thumbnail"
                          style={{ marginTop: '8px' }}
                        >
                          <img
                            src={normalizeAssetPath(preset.thumbnail)}
                            alt={preset.name}
                            style={{
                              maxWidth: '120px',
                              maxHeight: '80px',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="details-actions"
                    style={{ marginTop: '12px' }}
                  >
                    <button
                      className="action-btn primary"
                      onClick={() => handleInsert(preset)}
                    >
                      Insert
                    </button>
                    <button className="action-btn">Preview</button>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* Right-side details removed in favor of inline details above the list */}
      </div>

      {/* Removed separate preview panel - now integrated with details panel above */}

      {/* Status bar */}
      <div className="browser-statusbar" aria-live="polite">
        <div className="status-left">
          {filteredPresets.length} results
          {selectedCategory !== 'All' ? ` • Category: ${selectedCategory}` : ''}
          {selectedTags.length ? ` • Tags: ${selectedTags.join(', ')}` : ''}
          {searchQuery ? ` • Search: "${searchQuery}"` : ''}
        </div>
        <div className="status-right">Enter: Insert • Space: Preview</div>
      </div>
    </div>
  );
}
