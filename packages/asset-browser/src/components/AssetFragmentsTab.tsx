import React, { useEffect, useState, useMemo } from 'react';
import {
  loadAssetFragments,
  type AssetFragmentManifest,
  type FragmentEntry
} from '../services/AssetFragmentLoader';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

export function AssetFragmentsTab(): JSX.Element {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<AssetFragmentManifest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const load = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await loadAssetFragments();
      if (data) {
        setManifest(data);
        setStatus('done');
      } else {
        setError('No asset fragments manifest found');
        setStatus('error');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load asset fragments';
      setError(msg);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Get all fragments across categories
  const allFragments = useMemo(() => {
    if (!manifest) return [];

    const fragments: Array<
      FragmentEntry & { category: string; categoryName: string }
    > = [];

    Object.entries(manifest.categories).forEach(([key, category]) => {
      category.fragments.forEach(fragment => {
        fragments.push({
          ...fragment,
          category: key,
          categoryName: category.name
        });
      });
    });

    return fragments;
  }, [manifest]);

  // Filter fragments
  const filteredFragments = useMemo(() => {
    let fragments = allFragments;

    // Filter by category
    if (selectedCategory !== 'all') {
      fragments = fragments.filter(f => f.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fragments = fragments.filter(
        f =>
          f.name.toLowerCase().includes(query) ||
          f.type.toLowerCase().includes(query) ||
          f.categoryName.toLowerCase().includes(query)
      );
    }

    return fragments;
  }, [allFragments, selectedCategory, searchQuery]);

  const handleDragStart = (
    e: React.DragEvent,
    fragment: FragmentEntry,
    categoryKey: string
  ) => {
    const category = manifest?.categories[categoryKey];
    if (!category) return;

    // Create drag payload with path to the PSG file
    const payload = {
      type: 'asset-fragment',
      id: fragment.id,
      name: fragment.name,
      path: `${category.path}${fragment.file}`,
      fragmentType: fragment.type,
      nodes: fragment.nodes
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (status === 'loading') {
    return <div style={{ padding: 20 }}>Loading asset fragments...</div>;
  }

  if (status === 'error') {
    return <ErrorState message={error || 'Failed to load'} onRetry={load} />;
  }

  if (!manifest || allFragments.length === 0) {
    return (
      <EmptyState
        title="No Asset Fragments"
        message="No asset fragments found. Generate some using the /asset command."
        helpUrl="/docs/asset-fragment-manifest-system.md"
      />
    );
  }

  return (
    <section aria-label="Asset Fragments" style={{ padding: 12 }}>
      <header style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Asset Fragments</h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Search fragments..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            marginBottom: 8,
            border: '1px solid #ddd',
            borderRadius: 4
          }}
        />

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid #ddd',
            borderRadius: 4
          }}
        >
          <option value="all">All Categories ({allFragments.length})</option>
          {Object.entries(manifest.categories).map(([key, cat]) => (
            <option key={key} value={key}>
              {cat.icon} {cat.name} ({cat.fragments.length})
            </option>
          ))}
        </select>
      </header>

      {/* Fragment Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          marginTop: 16
        }}
      >
        {filteredFragments.map(fragment => {
          const category = manifest.categories[fragment.category];
          return (
            <div
              key={fragment.id}
              draggable
              onDragStart={e => handleDragStart(e, fragment, fragment.category)}
              style={{
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'grab',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {fragment.name}
              </div>

              <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
                {category?.icon} {fragment.categoryName}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    backgroundColor:
                      fragment.type === 'SIMPLE'
                        ? '#e8f5e9'
                        : fragment.type === 'CONTEXTUAL'
                          ? '#fff3e0'
                          : '#f3e5f5',
                    borderRadius: 3,
                    color: '#333'
                  }}
                >
                  {fragment.type}
                </span>

                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: 3,
                    color: '#333'
                  }}
                >
                  {fragment.nodes} nodes
                </span>

                {fragment.options && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      backgroundColor: '#fce4ec',
                      borderRadius: 3,
                      color: '#333'
                    }}
                  >
                    {fragment.options} opts
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      {manifest.statistics && (
        <footer
          style={{
            marginTop: 24,
            padding: 12,
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            fontSize: 12,
            color: '#666'
          }}
        >
          <strong>Library Stats:</strong> {manifest.statistics.total_fragments}{' '}
          fragments • {manifest.statistics.total_nodes} nodes •{' '}
          {manifest.statistics.total_options} options
        </footer>
      )}
    </section>
  );
}
