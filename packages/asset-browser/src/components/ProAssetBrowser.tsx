import React, { useState, useMemo } from 'react';
import '../styles/LogicBrowserStyles.css';
import type { Preset } from '../types';

interface ProAssetBrowserProps {
  onInsert?: (preset: Preset) => void;
}

// Mock data for demonstration
const mockPresets: Preset[] = [
  {
    id: '1',
    name: 'Medieval Castle',
    category: 'Location',
    tags: ['demo', 'medieval'],
    complexity: 'medium',
    nodes: 12,
    type: 'graph'
  },
  {
    id: '2',
    name: 'Forest Path',
    category: 'Nature',
    tags: ['nature'],
    complexity: 'simple',
    nodes: 8,
    type: 'graph'
  },
  {
    id: '3',
    name: 'Character Dialogue',
    category: 'Character',
    tags: ['dialogue'],
    complexity: 'complex',
    nodes: 15,
    type: 'graph'
  },
  {
    id: '4',
    name: 'Action Scene',
    category: 'Action',
    tags: ['action', 'combat'],
    complexity: 'complex',
    nodes: 20,
    type: 'graph'
  },
  {
    id: '5',
    name: 'Emotional Moment',
    category: 'Emotion',
    tags: ['emotion', 'character'],
    complexity: 'medium',
    nodes: 10,
    type: 'graph'
  },
  {
    id: '6',
    name: 'Mystery Setup',
    category: 'Plot',
    tags: ['mystery', 'plot'],
    complexity: 'medium',
    nodes: 14,
    type: 'graph'
  },
  {
    id: '7',
    name: 'Urban Setting',
    category: 'Location',
    tags: ['urban', 'modern'],
    complexity: 'simple',
    nodes: 7,
    type: 'graph'
  },
  {
    id: '8',
    name: 'Magic System',
    category: 'Fantasy',
    tags: ['magic', 'fantasy'],
    complexity: 'complex',
    nodes: 18,
    type: 'graph'
  }
];

const categories = [
  'All',
  'Location',
  'Character',
  'Nature',
  'Action',
  'Emotion',
  'Plot',
  'Fantasy'
];
const allTags = [
  'demo',
  'medieval',
  'nature',
  'dialogue',
  'action',
  'combat',
  'emotion',
  'character',
  'mystery',
  'plot',
  'urban',
  'modern',
  'magic',
  'fantasy'
];

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

  // Filter and sort presets
  const filteredPresets = useMemo(() => {
    let filtered = [...mockPresets];

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
          p.tags.some(t => t.toLowerCase().includes(query))
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
  }, [selectedCategory, selectedTags, searchQuery, sortColumn, sortDirection]);

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

  return (
    <div className="asset-browser-pro">
      {/* Sidebar */}
      <div className="browser-sidebar-pro">
        {/* Search */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">Search</div>
          <div style={{ padding: '8px' }}>
            <div className="browser-search-field">
              <span className="browser-search-icon">🔍</span>
              <input
                type="text"
                className="browser-search-input"
                placeholder="Search presets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">Categories</div>
          <div className="sidebar-filters">
            {categories.map(cat => {
              const count =
                cat === 'All'
                  ? mockPresets.length
                  : mockPresets.filter(p => p.category === cat).length;
              return (
                <div
                  key={cat}
                  className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="filter-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">Tags</div>
          <div className="sidebar-tags">
            {allTags.map(tag => (
              <span
                key={tag}
                className={`tag-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="browser-content-pro">
        {/* Toolbar */}
        <div className="browser-toolbar">
          <div className="toolbar-button-group">
            <button className="toolbar-button active">Library</button>
            <button className="toolbar-button">Server</button>
          </div>

          <div className="view-controls">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞
            </button>
          </div>
        </div>

        {/* List/Grid View */}
        {viewMode === 'list' ? (
          <div className="preset-list-container">
            {/* Column Headers */}
            <div className="preset-list-header">
              <div className="column-header"></div>
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
              <div className="column-header">Insert</div>
            </div>

            {/* Preset Rows */}
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                className={`preset-list-item ${selectedPreset === preset.id ? 'selected' : ''}`}
                onClick={() => setSelectedPreset(preset.id)}
                onDoubleClick={() => handleInsert(preset)}
              >
                <div className="preset-icon">📄</div>
                <div className="preset-name">{preset.name}</div>
                <div className="preset-category">{preset.category || ''}</div>
                <div className="preset-meta">{preset.complexity || ''}</div>
                <div className="preset-meta">{preset.nodes || 0}</div>
                <div className="preset-meta">
                  <button
                    className="toolbar-button"
                    style={{ padding: '2px 6px', fontSize: '10px' }}
                    onClick={e => {
                      e.stopPropagation();
                      handleInsert(preset);
                    }}
                  >
                    Insert
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="preset-grid-container">
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                className={`preset-card-compact ${selectedPreset === preset.id ? 'selected' : ''}`}
                onClick={() => setSelectedPreset(preset.id)}
                onDoubleClick={() => handleInsert(preset)}
              >
                <button
                  className="preset-insert-btn"
                  onClick={e => {
                    e.stopPropagation();
                    handleInsert(preset);
                  }}
                >
                  +
                </button>
                <div className="preset-card-header">
                  <div className="preset-card-icon">📄</div>
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

      {/* Details Panel (optional) */}
      {selectedPreset && (
        <div className="details-panel">
          <div className="details-header">
            <div className="details-title">
              {filteredPresets.find(p => p.id === selectedPreset)?.name || ''}
            </div>
            <div className="details-subtitle">
              {filteredPresets.find(p => p.id === selectedPreset)?.category ||
                ''}
            </div>
          </div>

          <div className="details-section">
            <div className="details-label">Complexity</div>
            <div className="details-value">
              {filteredPresets.find(p => p.id === selectedPreset)?.complexity ||
                ''}
            </div>
          </div>

          <div className="details-section">
            <div className="details-label">Node Count</div>
            <div className="details-value">
              {filteredPresets.find(p => p.id === selectedPreset)?.nodes || 0}{' '}
              nodes
            </div>
          </div>

          <div className="details-section">
            <div className="details-label">Tags</div>
            <div className="details-value">
              {filteredPresets
                .find(p => p.id === selectedPreset)
                ?.tags.join(', ') || ''}
            </div>
          </div>

          <div className="details-actions">
            <button
              className="action-btn primary"
              onClick={() => {
                const preset = filteredPresets.find(
                  p => p.id === selectedPreset
                );
                if (preset) handleInsert(preset);
              }}
            >
              Insert
            </button>
            <button className="action-btn">Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}
