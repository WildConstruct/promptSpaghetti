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
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="asset-browser-pro-horizontal">
      {/* Top Section with Controls */}
      <div className="browser-top-controls">
        {/* Search Bar */}
        <div className="search-section">
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

        {/* Keyword Buttons - Logic Pro Style */}
        <div className="keyword-buttons-section">
          <div className="keyword-row">
            <button
              className={`keyword-btn ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {categories.slice(1).map(cat => (
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
            {allTags.map(tag => (
              <button
                key={tag}
                className={`keyword-btn tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* View Controls */}
        <div className="view-controls-section">
          <button className="toolbar-button active">Library</button>
          <button className="toolbar-button">Server</button>
          <span className="divider">|</span>
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
          <button
            className={`view-toggle-btn ${showDetails ? 'active' : ''}`}
            onClick={() => setShowDetails(!showDetails)}
            title="Show Details"
          >
            ℹ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="browser-main-content">
        <div className="content-wrapper">
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
                {filteredPresets.map(preset => (
                  <div
                    key={preset.id}
                    className={`preset-list-item ${selectedPreset === preset.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPreset(preset.id)}
                    onDoubleClick={() => handleInsert(preset)}
                  >
                    <div className="preset-icon">📄</div>
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

        {/* Details Panel (shown when showDetails is true) */}
        {showDetails && selectedPreset && (
          <div className="details-panel-horizontal">
            <div className="details-header">
              <div className="details-title">
                {filteredPresets.find(p => p.id === selectedPreset)?.name || ''}
              </div>
              <div className="details-subtitle">
                {filteredPresets.find(p => p.id === selectedPreset)?.category ||
                  ''}
              </div>
            </div>

            <div className="details-content">
              <div className="details-row">
                <span className="details-label">Complexity:</span>
                <span className="details-value">
                  {filteredPresets.find(p => p.id === selectedPreset)
                    ?.complexity || 'N/A'}
                </span>
              </div>

              <div className="details-row">
                <span className="details-label">Nodes:</span>
                <span className="details-value">
                  {filteredPresets.find(p => p.id === selectedPreset)?.nodes ||
                    0}
                </span>
              </div>

              <div className="details-row">
                <span className="details-label">Tags:</span>
                <span className="details-value">
                  {filteredPresets
                    .find(p => p.id === selectedPreset)
                    ?.tags.join(', ') || 'None'}
                </span>
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
    </div>
  );
}
