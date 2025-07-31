// Epic 16 Marketplace - Advanced Filters Component
import React, { useState } from 'react';
import './SearchBar.css';
}
interface FilterOptions {
  categories: string;,
  tags: string;
  priceRange: {
  min?: number;
  max?: number;
}
};
  rating: number;,
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'all';
  compatibility: string;,
  isFree: boolean | null;
  isAiGenerated: boolean | null;,
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest' | 'oldest';
}
interface AdvancedFiltersProps {
  filters: FilterOptions;,
  onFiltersChange: (filters: FilterOptions) => void;,
}
  availableCategories: Array<{ id: string; name: string }>;
  availableTags: string;
  className?: string;

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({)
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const updateFilter = (key: keyof FilterOptions, value: Error) => {,
  onFiltersChange({)
  ...filters,
  [key]: value,
});
  };
  const toggleCategory = (categoryId: string) => {
  const newCategories = filters.categories.includes(categoryId);
  ? filters.categories.filter(id => id !== categoryId)
  : [...filters.categories, categoryId];
  updateFilter('categories', newCategories);
};
  const toggleTag = (tag: string) => {
  const newTags = filters.tags.includes(tag);
  ? filters.tags.filter(t => t !== tag)
  : [...filters.tags, tag];
  updateFilter('tags', newTags);
};
  const toggleCompatibility = (compat: string) => {
  const newCompat = filters.compatibility.includes(compat);
  ? filters.compatibility.filter(c => c !== compat)
  : [...filters.compatibility, compat];
  updateFilter('compatibility', newCompat);
};
  const clearAllFilters = () => {
    onFiltersChange({)
  categories: [],
      tags: [],
      priceRange: {},
      rating: 0,
      complexity: 'all',
      compatibility: [],
      isFree: null,
      isAiGenerated: null,
      sortBy: 'relevance';
  });
  };
  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.tags.length > 0 ||
           filters.priceRange.min !== undefined ||
           filters.priceRange.max !== undefined ||
           filters.rating > 0 ||
           filters.complexity !== 'all' ||
           filters.compatibility.length > 0 ||
           filters.isFree !== null ||
           filters.isAiGenerated !== null ||
           filters.sortBy !== 'relevance';
  };
  return;
    <div className={`advanced-filters-container ${className}`}>}
      {/* Filter Toggle */}
      <div className="filter-toggle">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`toggle-button ${showAdvanced ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 4.5h10M3 8h6M3 11.5h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Advanced Filters
          {hasActiveFilters() && ()
            <span className="filter-count">
              {[
                filters.categories.length,
                filters.tags.length,
                filters.compatibility.length,
                filters.priceRange.min !== undefined ? 1 : 0,
                filters.priceRange.max !== undefined ? 1 : 0,
                filters.rating > 0 ? 1 : 0,
                filters.complexity !== 'all' ? 1 : 0,
                filters.isFree !== null ? 1 : 0,
                filters.isAiGenerated !== null ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        {hasActiveFilters() && ()
          <button onClick={clearAllFilters} className="clear-filters">
            Clear All
          </button>
        )}
      </div>
      {/* Advanced Filters Panel */}
      {showAdvanced && ()
        <div className="advanced-filters">
          {/* Categories */}
          <div className="filter-group">
            <label className="filter-label">Categories</label>
            <div className="filter-chips">
              {availableCategories.map(category => ()
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`filter-chip ${
  filters.categories.includes(category.id) ? 'active' : '',
}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          {/* Tags */}
          <div className="filter-group">
            <label className="filter-label">Popular Tags</label>
            <div className="filter-chips">
              {availableTags.slice(0, 12).map(tag => ()
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`filter-chip ${
  filters.tags.includes(tag) ? 'active' : '',
}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Min ($)"
                value={filters.priceRange.min || ''}
                onChange={(e) => updateFilter('priceRange', {)
  ...filters.priceRange,
  min: e.target.value ? parseFloat(e.target.value) : undefined,
})}
                className="price-input"
              />
              <span className="price-separator">to</span>
              <input
                type="number"
                placeholder="Max ($)"
                value={filters.priceRange.max || ''}
                onChange={(e) => updateFilter('priceRange', {)
  ...filters.priceRange,
  max: e.target.value ? parseFloat(e.target.value) : undefined,
})}
                className="price-input"
              />
            </div>
          </div>
          {/* Rating */}
          <div className="filter-group">
            <label className="filter-label">Minimum Rating</label>
            <div className="rating-filter">
              {[1, 2, 3, 4, 5].map(rating => ()
                <button
                  key={rating}
                  onClick={() => updateFilter('rating', rating === filters.rating ? 0 : rating)}
                  className={`rating-button ${
  filters.rating >= rating ? 'active' : '',
}`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1l2.09 4.26L14 6l-3 2.96L11.64 13 8 10.64 4.36 13 5 8.96 2 6l3.91-.74L8 1z"
                      fill={filters.rating >= rating ? '#fbbf24' : 'none'}
                      stroke={filters.rating >= rating ? '#fbbf24' : 'currentColor'}
                      strokeWidth="1"
                    />
                  </svg>
                </button>
              ))}
              <span className="rating-text">
                {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
              </span>
            </div>
          </div>
          {/* Complexity */}
          <div className="filter-group">
            <label className="filter-label">Complexity Level</label>
            <div className="filter-chips">
              {[
                { value: 'all', label: 'All Levels' },
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' }
              ].map(level => ()
                <button
                  key={level.value}
                  onClick={() => updateFilter('complexity', level.value)}
                  className={`filter-chip ${
  filters.complexity === level.value ? 'active' : '',
}`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          {/* Claude Compatibility */}
          <div className="filter-group">
            <label className="filter-label">Claude Compatibility</label>
            <div className="filter-chips">
              {[
                'claude-3-haiku',
                'claude-3-sonnet',
                'claude-3-opus',
                'claude-3.5-sonnet'
              ].map(model => ()
                <button
                  key={model}
                  onClick={() => toggleCompatibility(model)}
                  className={`filter-chip ${
  filters.compatibility.includes(model) ? 'active' : '',
}`}
                >
                  {model.replace('claude-', 'Claude ')}
                </button>
              ))}
            </div>
          </div>
          {/* Content Type */}
          <div className="filter-group">
            <label className="filter-label">Content Type</label>
            <div className="filter-chips">
              <button
                onClick={() => updateFilter('isFree', filters.isFree === true ? null : true)}
                className={`filter-chip ${filters.isFree === true ? 'active' : ''}`}
              >
                Free Only
              </button>
              <button
                onClick={() => updateFilter('isFree', filters.isFree === false ? null : false)}
                className={`filter-chip ${filters.isFree === false ? 'active' : ''}`}
              >
                Premium Only
              </button>
              <button
                onClick={() => updateFilter('isAiGenerated', filters.isAiGenerated === true ? null : true)}
                className={`filter-chip ${filters.isAiGenerated === true ? 'active' : ''}`}
              >
                AI Generated
              </button>
              <button
                onClick={() => updateFilter('isAiGenerated', filters.isAiGenerated === false ? null : false)}
                className={`filter-chip ${filters.isAiGenerated === false ? 'active' : ''}`}
              >
                Human Created
              </button>
            </div>
          </div>
          {/* Sort Options */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="relevance">Relevance</option>
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};