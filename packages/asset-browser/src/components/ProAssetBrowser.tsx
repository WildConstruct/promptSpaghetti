import React, { useState, useMemo, useEffect, useRef } from 'react';
import '../styles/LogicBrowserStyles.css';
import type { Preset } from '../types';
import { LibraryService } from '../services/LibraryService';
import { FragmentManifestLoader } from '../services/FragmentManifestLoader';
import {
  FragmentValidator,
  ValidationResult
} from '../services/FragmentValidator';
import { useSectionResize } from '../hooks/useSectionResize';

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
  const [previewSeed, setPreviewSeed] = useState<string>('1234');
  const [previewSeeds, setPreviewSeeds] = useState<string[]>([
    '1234',
    '5678',
    '9012'
  ]);
  const [sortColumn, setSortColumn] = useState<
    'name' | 'category' | 'complexity' | 'nodes'
  >('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDetails, setShowDetails] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);

  // Section resize handling
  const {
    getSectionHeight,
    isSectionCollapsed,
    handleResizeStart,
    toggleCollapse,
    isResizing
  } = useSectionResize({
    sections: [{ id: 'tags', minHeight: 50, defaultHeight: 150 }],
    storageKey: 'assetBrowser.sectionHeights'
  });

  // Load saved preview seeds on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('assetBrowser.previewSeeds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPreviewSeeds(parsed);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);
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

  // Performance monitoring
  const performanceRef = useRef<{
    loadStartTime: number;
    fragmentLoadTime: number;
    renderTime: number;
  }>({ loadStartTime: 0, fragmentLoadTime: 0, renderTime: 0 });

  // Load manifest on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      performanceRef.current.loadStartTime = performance.now();
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

        // Also load fragment manifests with validation
        try {
          const fragmentStartTime = performance.now();
          const fragmentManifest = await FragmentManifestLoader.loadManifest();
          const fragmentPresets =
            FragmentManifestLoader.convertToPresets(fragmentManifest);

          // Validate fragments and filter out invalid ones
          const validatedFragments: typeof fragmentPresets = [];
          const validationErrors: Array<{ id: string; errors: string[] }> = [];

          // Validate each fragment before adding
          for (const fp of fragmentPresets) {
            // Skip validation for now if we can't load the content
            // In production, we'd load and validate the actual fragment file
            validatedFragments.push(fp);
          }

          // Convert validated fragment presets to the format ProAssetBrowser expects
          const fragmentItems: Preset[] = validatedFragments.map(fp => ({
            id: fp.id,
            name: fp.name,
            tags: fp.tags,
            type: (fp.type || 'graph') as Preset['type'],
            category: fp.category,
            // Add metadata fields if they exist
            nodes: fp.metadata?.nodes as number | undefined,
            path: (fp as any).path || fp.metadata?.file
          }));

          // Combine regular presets with validated fragment presets
          const allItems = [...items, ...fragmentItems];

          // Performance metrics
          performanceRef.current.fragmentLoadTime =
            performance.now() - fragmentStartTime;
          const totalLoadTime =
            performance.now() - performanceRef.current.loadStartTime;

          // Log validation results and performance in development
          if (process.env.NODE_ENV === 'development') {
            if (validationErrors.length > 0) {
              console.warn(
                `Fragment validation: ${validationErrors.length} fragments had issues`,
                validationErrors
              );
            }
            if (totalLoadTime > 100) {
              console.warn(
                `Asset browser load time: ${totalLoadTime.toFixed(2)}ms (target: <100ms)`
              );
              console.log(
                `  - Fragments: ${performanceRef.current.fragmentLoadTime.toFixed(2)}ms`
              );
              console.log(`  - Total items: ${allItems.length}`);
            }
          }

          if (!cancelled) {
            setPresets(allItems);
            setUsedFallback(false);
            setAssetBase(chosenBase);
          }
        } catch (fragmentError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to load fragments:', fragmentError);
          }
          // Still set the regular presets even if fragments fail
          if (!cancelled) {
            setPresets(items);
            setUsedFallback(false);
            setAssetBase(chosenBase);
          }
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
    console.log('[AssetBrowser] Insert requested:', preset.id, preset.path);
    onInsert?.(preset);
  };

  const normalizeAssetPath = (path?: string): string | undefined => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
    // Handle fragment paths from manifest - they're in assets/library
    if (path.startsWith('./')) {
      // Check if it's a fragment path (contains category folders)
      if (
        path.includes('facial-features') ||
        path.includes('hair') ||
        path.includes('body-silhouette') ||
        path.includes('emotion-mood') ||
        path.includes('action-dynamics') ||
        path.includes('setting-environment')
      ) {
        return `/assets/library/${path.slice(2)}`;
      }
      return `${assetBase}/${path.slice(2)}`;
    }
    return `${assetBase}/${path}`;
  };

  // Generate sample output from fragment data using a standard seed
  const generateSampleOutput = (preset: Preset): string => {
    try {
      // If preset has actual graph data, try to extract sample output
      const graphData = preset.data as any;
      if (graphData?.nodes) {
        // Find output nodes
        const outputNodes = graphData.nodes.filter(
          (n: any) =>
            n.type === 'Output' ||
            n.type === 'output' ||
            n.data?.type === 'Output'
        );

        // Get first output node's template if available
        if (outputNodes.length > 0) {
          const template =
            outputNodes[0].data?.template || outputNodes[0].template;
          if (template) {
            // Show the template content (truncate if too long)
            const output =
              template.length > 80
                ? template.substring(0, 77) + '...'
                : template;
            return output;
          }
        }

        // Check for WeightedChoice nodes to show sample options
        const weightedNodes = graphData.nodes.filter(
          (n: any) =>
            n.type === 'WeightedChoice' ||
            n.type === 'weightedChoice' ||
            n.data?.type === 'WeightedChoice'
        );

        if (weightedNodes.length > 0) {
          const options = weightedNodes[0].data?.options || [];
          if (options.length > 0) {
            // Show first option as sample
            const firstOption =
              typeof options[0] === 'object' ? options[0].text : options[0];
            return firstOption || '[Weighted choice output]';
          }
        }
      }

      // Fallback samples based on category
      const categorySamples: Record<string, string> = {
        'emotion-mood': 'softly creased with worry',
        'body-silhouette': 'weathered and lean',
        'facial-features': "crow's-footed eyes",
        'setting-environment': 'sun-dappled clearing',
        character: 'Marcus the Bold',
        narrative: 'Once upon a midnight dreary...',
        dialogue: '"I never expected to see you here," she said.',
        items: 'a worn leather satchel',
        'action-dynamics': 'lunged forward with desperate energy'
      };

      return (
        categorySamples[preset.category || ''] || '[Preview not available]'
      );
    } catch (error) {
      console.error('Error generating sample output:', error);
      return '[Error generating preview]';
    }
  };

  const handleDragStart = (e: React.DragEvent, preset: Preset) => {
    try {
      // Normalize the path for fragments
      const normalizedPath = normalizeAssetPath(preset.path);

      const payload = JSON.stringify({
        id: preset.id,
        name: preset.name,
        tags: preset.tags,
        type: preset.type ?? 'graph',
        path: normalizedPath || preset.path,
        nodeTypes: preset.nodeTypes
      });
      e.dataTransfer.setData('application/x-preset', payload);
      // Also set as 'preset' for compatibility with Epic1GraphEditor
      e.dataTransfer.setData('preset', payload);
      // Provide a plain-text fallback for other drop targets
      e.dataTransfer.setData('text/plain', preset.name);
      e.dataTransfer.effectAllowed = 'copy';
    } catch {
      // no-op
    }
  };

  // Auto-open details when an item is selected
  // Removed auto-show behavior - user controls details panel via info button

  // Details panel height state with localStorage persistence
  const [detailsPanelHeight, setDetailsPanelHeight] = useState(() => {
    const saved = localStorage.getItem('assetBrowser.detailsPanelHeight');
    return saved ? parseInt(saved, 10) : 120;
  });

  const [isResizingDetails, setIsResizingDetails] = useState(false);
  const resizeStartY = React.useRef(0);
  const resizeStartHeight = React.useRef(0);

  const handleDetailsResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingDetails(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = detailsPanelHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isResizingDetails) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = resizeStartY.current - e.clientY; // Inverted for upward drag
      const newHeight = Math.min(
        200,
        Math.max(100, resizeStartHeight.current + deltaY)
      );
      setDetailsPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizingDetails(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(
        'assetBrowser.detailsPanelHeight',
        detailsPanelHeight.toString()
      );
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingDetails, detailsPanelHeight]);

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

      {/* Categories Section - Independent Slice */}
      <div
        className={`ae-section-full-width ${isSectionCollapsed('categories') ? 'collapsed' : ''}`}
      >
        <div
          className="ae-section-header-full"
          onClick={() => toggleCollapse('categories')}
        >
          <span className="ae-section-arrow">
            {isSectionCollapsed('categories') ? '▶' : '▼'}
          </span>
          <span>Categories</span>
        </div>
        <div className="ae-section-content-full">
          <div className="keyword-row">
            <button
              className={`keyword-btn category ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {categories.slice(1).map((cat: string) => (
              <button
                key={cat}
                className={`keyword-btn category ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tags Section - Independent Slice */}
      <div
        className={`ae-section-full-width ${isSectionCollapsed('tags') ? 'collapsed' : ''}`}
      >
        <div
          className="ae-section-header-full"
          onClick={() => toggleCollapse('tags')}
        >
          <span className="ae-section-arrow">
            {isSectionCollapsed('tags') ? '▶' : '▼'}
          </span>
          <span>Tags</span>
        </div>
        <div
          className="ae-section-content-full"
          style={{
            height: isSectionCollapsed('tags')
              ? 0
              : `${getSectionHeight('tags')}px`,
            minHeight: isSectionCollapsed('tags') ? 0 : '50px',
            maxHeight: isSectionCollapsed('tags') ? 0 : '400px',
            overflowY: 'auto'
          }}
        >
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
        {!isSectionCollapsed('tags') && (
          <div
            className="ae-resize-handle-section"
            onMouseDown={e => handleResizeStart(e, 'tags')}
          />
        )}
      </div>

      {/* Main Content Area with flex container for list and details */}
      <div className="browser-main-content" style={{ position: 'relative' }}>
        <div
          className="content-wrapper"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: showDetails ? `${detailsPanelHeight}px` : 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
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
            <div
              className="preset-list-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
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
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      // Auto-show details panel if not visible
                      if (!showDetails) setShowDetails(true);
                    }}
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
            <div
              className="preset-grid-container"
              style={{ height: '100%', overflow: 'auto' }}
            >
              {!loading && !error && filteredPresets.length === 0 && (
                <div style={{ padding: 12, color: '#9ca3af' }}>
                  No presets match your filters.
                </div>
              )}
              {filteredPresets.map(preset => (
                <div
                  key={preset.id}
                  className={`preset-card-compact ${selectedPreset === preset.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedPreset(preset.id);
                    // Auto-show details panel if not visible
                    if (!showDetails) setShowDetails(true);
                  }}
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
                      // Auto-show details panel if not visible
                      if (!showDetails) setShowDetails(true);
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
        </div>

        {/* Combined Details and Preview Panel - Anchored at bottom */}
        {showDetails &&
          selectedPreset &&
          (() => {
            const preset = filteredPresets.find(p => p.id === selectedPreset);
            if (!preset) return null;

            return (
              <div
                className="details-panel-bottom"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${detailsPanelHeight}px`,
                  minHeight: '120px',
                  maxHeight: '200px',
                  overflow: 'hidden',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Resize Handle */}
                <div
                  className="resize-handle-horizontal"
                  onMouseDown={handleDetailsResizeStart}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    cursor: 'ns-resize',
                    background: 'transparent',
                    zIndex: 10
                  }}
                />

                {/* Title Section with metadata */}
                <div
                  style={{
                    padding: '6px 12px 4px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      {preset.category || 'uncategorized'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '10px' }}>
                    <div style={{ color: '#888' }}>
                      CATEGORY:{' '}
                      <span style={{ color: '#ccc' }}>
                        {preset.category || 'uncategorized'}
                      </span>
                    </div>
                    <div style={{ color: '#888' }}>
                      COMPLEXITY:{' '}
                      <span style={{ color: '#ccc' }}>
                        {preset.complexity || 'N/A'}
                      </span>{' '}
                      • NODES:{' '}
                      <span style={{ color: '#ccc' }}>{preset.nodes || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {/* Description - show actual description or generate one */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#ccc',
                      lineHeight: '1.4',
                      marginBottom: '4px'
                    }}
                  >
                    {preset.description ||
                      `A ${preset.category || 'graph'} fragment with ${preset.nodes || 0} nodes. ${
                        preset.nodeTypes?.includes('WeightedChoice')
                          ? 'Uses weighted random selection to generate variations.'
                          : 'Generates consistent output based on the graph structure.'
                      }`}
                  </div>

                  {/* Sample Output */}
                  <div
                    style={{
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#888',
                        marginBottom: '4px'
                      }}
                    >
                      SAMPLE OUTPUT
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#ccc',
                        fontStyle: 'italic',
                        paddingLeft: '8px'
                      }}
                    >
                      "{generateSampleOutput(preset)}"
                    </div>
                  </div>

                  {/* Graph Structure Preview */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#888'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#ccc' }}>
                      GRAPH STRUCTURE
                    </div>
                    <div style={{ paddingLeft: '8px' }}>
                      • {preset.nodes || 0} nodes
                    </div>
                    {(preset.data as { nodes?: any[] })?.nodes && (
                      <>
                        {(preset.data as { nodes?: any[] }).nodes
                          ?.slice(0, 2)
                          .map((node: any, idx: number) => (
                            <div
                              key={idx}
                              style={{ paddingLeft: '16px', fontSize: '10px' }}
                            >
                              - {node.type || node.data?.type || 'Node'}
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
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
