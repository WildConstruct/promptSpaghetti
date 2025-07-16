/**
 * Extension Search Filter - Epic 8.4 Story 8.4.5
 * Search and filter controls for extension manager
 */

import React from 'react';

export interface FilterOptions {
  status: 'all' | 'enabled' | 'disabled';
  type: 'all' | 'node' | 'ui' | 'transform' | 'storage';
  sortBy: 'name' | 'version' | 'lastUpdated' | 'size';
}

export interface ExtensionSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
  viewMode: 'installed' | 'marketplace';
}

export const ExtensionSearchFilter: React.FC<ExtensionSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  filterOptions,
  onFilterChange,
  viewMode
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filterOptions,
      [key]: value
    });
  };

  return (
    <div className="extension-search-filter">
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={`Search ${viewMode === 'marketplace' ? 'available' : 'installed'} extensions...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-section">
        <div className="filter-row">
          {/* Status Filter (only for installed extensions) */}
          {viewMode === 'installed' && (
            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                className="filter-select"
                value={filterOptions.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Extensions</option>
                <option value="enabled">Enabled Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>
          )}

          {/* Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Type:</label>
            <select
              className="filter-select"
              value={filterOptions.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="node">🔧 Node Extensions</option>
              <option value="ui">🎨 UI Extensions</option>
              <option value="transform">⚡ Transform Extensions</option>
              <option value="storage">💾 Storage Extensions</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label className="filter-label">Sort by:</label>
            <select
              className="filter-select"
              value={filterOptions.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="name">Name</option>
              <option value="version">Version</option>
              <option value="lastUpdated">Last Updated</option>
              <option value="size">Size</option>
            </select>
          </div>

          {/* View Options */}
          <div className="filter-group view-options">
            <button 
              className="view-btn grid-view"
              title="Grid View"
            >
              ⊞
            </button>
            <button 
              className="view-btn list-view active"
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="quick-filters">
          <span className="quick-filter-label">Quick filters:</span>
          
          {viewMode === 'installed' && (
            <>
              <button 
                className={`quick-filter-btn ${filterOptions.status === 'enabled' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', filterOptions.status === 'enabled' ? 'all' : 'enabled')}
              >
                ✅ Enabled
              </button>
              <button 
                className={`quick-filter-btn ${filterOptions.status === 'disabled' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', filterOptions.status === 'disabled' ? 'all' : 'disabled')}
              >
                ⭕ Disabled
              </button>
              <button className="quick-filter-btn">
                ⬆️ Has Updates
              </button>
              <button className="quick-filter-btn">
                ❌ Has Errors
              </button>
            </>
          )}

          {viewMode === 'marketplace' && (
            <>
              <button className="quick-filter-btn">
                ⭐ Featured
              </button>
              <button className="quick-filter-btn">
                🆕 New
              </button>
              <button className="quick-filter-btn">
                📈 Popular
              </button>
              <button className="quick-filter-btn">
                🆓 Free
              </button>
            </>
          )}

          <button 
            className={`quick-filter-btn ${filterOptions.type === 'node' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', filterOptions.type === 'node' ? 'all' : 'node')}
          >
            🔧 Nodes
          </button>
          <button 
            className={`quick-filter-btn ${filterOptions.type === 'ui' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', filterOptions.type === 'ui' ? 'all' : 'ui')}
          >
            🎨 UI
          </button>
          <button 
            className={`quick-filter-btn ${filterOptions.type === 'transform' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', filterOptions.type === 'transform' ? 'all' : 'transform')}
          >
            ⚡ Transform
          </button>
          <button 
            className={`quick-filter-btn ${filterOptions.type === 'storage' ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', filterOptions.type === 'storage' ? 'all' : 'storage')}
          >
            💾 Storage
          </button>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterOptions.status !== 'all' || filterOptions.type !== 'all') && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            
            {searchQuery && (
              <span className="active-filter">
                Search: "{searchQuery}"
                <button onClick={() => onSearchChange('')}>✕</button>
              </span>
            )}

            {filterOptions.status !== 'all' && (
              <span className="active-filter">
                Status: {filterOptions.status}
                <button onClick={() => handleFilterChange('status', 'all')}>✕</button>
              </span>
            )}

            {filterOptions.type !== 'all' && (
              <span className="active-filter">
                Type: {filterOptions.type}
                <button onClick={() => handleFilterChange('type', 'all')}>✕</button>
              </span>
            )}

            <button 
              className="clear-all-filters"
              onClick={() => {
                onSearchChange('');
                onFilterChange({
                  status: 'all',
                  type: 'all',
                  sortBy: 'name'
                });
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Results Summary */}
      <div className="filter-results">
        <span className="results-count">
          Showing extensions
        </span>
        <div className="filter-actions">
          <button className="filter-action-btn">
            📤 Export List
          </button>
          <button className="filter-action-btn">
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionSearchFilter;