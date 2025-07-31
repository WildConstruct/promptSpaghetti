/**
 * Epic 16 Marketplace Search Component
 * 
 * Advanced search interface with autocomplete, filters, and category browsing
 * for the marketplace template discovery experience.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';

}
export interface SearchFilters {
  priceRange: [number, number]; // in cents
  tags: string;
  rating: number; // minimum rating
  compatibility: string; // Claude models
  isAiGenerated?: boolean;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'downloads' | 'newest' | 'oldest';
  creatorId?: string;
}
interface SearchSuggestion {
  text: string;
  type: 'query' | 'tag' | 'creator' | 'template';
  count?: number;
  icon?: string;
}
interface MarketplaceSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  availableTags?: string;
}
  availableCreators?: Array<{ id: string; name: string; templateCount: number }>;
  availableModels?: string;
  searchSuggestions?: SearchSuggestion;
  isLoading?: boolean;
  resultCount?: number;
  className?: string;
const defaultFilters: SearchFilters = {,
  priceRange: [0, 10000], // $0 to $100,
  tags: [],
  rating: 0,
  compatibility: [],
  sortBy: 'relevance',
};
}
export const MarketplaceSearch: React.FC<MarketplaceSearchProps> = ({)
  onSearch,
  onFiltersChange,
  availableTags = [],
  availableCreators = [],
  availableModels = ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
  searchSuggestions = [],
  isLoading = false,
  resultCount,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Filter suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchSuggestions.filter(suggestion =>;);
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
  }, [query, searchSuggestions]);
  // Handle clicks outside to close suggestions
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {,
  if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
  setShowSuggestions(false);
};
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleSearch = () => {
    onSearch(query, filters);
    setShowSuggestions(false);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
  };
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'tag') {
      updateFilters({ tags: [...filters.tags, suggestion.text] });
      setQuery('');
    } else if (suggestion.type === 'creator') {
      const creator = availableCreators.find(c => c.name === suggestion.text);
      if (creator) {
        updateFilters({ creatorId: creator.id });
        setQuery('');
    } else {
      setQuery(suggestion.text);
      handleSearch();
    setShowSuggestions(false);
  };
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
    onSearch(query, updatedFilters);
  };
  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
    onSearch(query, defaultFilters);
  };
  const removeTag = (tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) });
  };
  const _____formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;}
  };
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.tags.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.compatibility.length > 0) count++;
    if (filters.isAiGenerated !== undefined) count++;
    if (filters.creatorId) count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  }, [filters]);
  return;
    <div className={`bg-white border-b border-gray-200 ${className}`}>}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
              placeholder="Search templates, tags, creators..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-full px-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {isLoading ? ()
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : ()
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {/* Search Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && ()
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              {filteredSuggestions.map((suggestion, index) => ()
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'query' && ()
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {suggestion.type === 'tag' && ()
                      <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    )}
                    {suggestion.type === 'creator' && ()
                      <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    {suggestion.type === 'template' && ()
                      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{suggestion.text}</p>
                    {suggestion.count && ()
                      <p className="text-xs text-gray-500">{suggestion.count} results</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Filter Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium ${
  showFilters || activeFilterCount > 0
  ? 'border-blue-300 text-blue-700 bg-blue-50'
  : 'border-gray-300 text-gray-700 hover:bg-gray-50',
}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.414.914l-4-2A1 1 0 018 18.586v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z" />
              </svg>
              <span>Filters</span>
              {activeFilterCount > 0 && ()
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && ()
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            {/* Active filters */}
            <div className="flex items-center space-x-2">
              {filters.tags.map((tag) => ()
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/* Sort and Results */}
          <div className="flex items-center space-x-4">
            {resultCount !== undefined && ()
              <span className="text-sm text-gray-500">
                {resultCount.toLocaleString()} results
              </span>
            )}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
        {/* Advanced Filters */}
        {showFilters && ()
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={filters.priceRange[0] / 100}
                      onChange={(e) => updateFilters({ )
                        priceRange: [parseInt(e.target.value) * 100 || 0, filters.priceRange[1]] 
                      })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={filters.priceRange[1] / 100}
                      onChange={(e) => updateFilters({ )
                        priceRange: [filters.priceRange[0], parseInt(e.target.value) * 100 || 10000] 
                      })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => updateFilters({ rating: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={1}>1+ Stars</option>
                </select>
              </div>
              {/* Compatibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claude Models
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableModels.map((model) => ()
                    <label key={model} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.compatibility.includes(model)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilters({ compatibility: [...filters.compatibility, model] });
                          } else {
  updateFilters({ )
  compatibility: filters.compatibility.filter(m => m !== model),
});
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* AI Generated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiGenerated"
                      checked={filters.isAiGenerated === undefined}
                      onChange={() => updateFilters({ isAiGenerated: undefined })}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">All Templates</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiGenerated"
                      checked={filters.isAiGenerated === true}
                      onChange={() => updateFilters({ isAiGenerated: true })}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">AI Generated</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiGenerated"
                      checked={filters.isAiGenerated === false}
                      onChange={() => updateFilters({ isAiGenerated: false })}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Human Created</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceSearch;