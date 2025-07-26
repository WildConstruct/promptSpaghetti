/**
 * Enhanced Search Bar with Autocomplete
 * 
 * Extends the base SearchBar with autocomplete suggestions,
 * trending searches, and saved searches integration.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearch } from './SearchContext';
import { searchApiService } from '../../services/searchApiService';

interface EnhancedSearchBarProps {
  placeholder?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  showTrending?: boolean;
  showSavedSearches?: boolean;
  onSearch?: (searchText: string) => void;
  className?: string;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = "Search templates...",
  showHistory = true,
  showSuggestions = true,
  showTrending = true,
  showSavedSearches = true,
  onSearch,
  className = ''
}) => {
  const {
    query,
    setText,
    searchHistory,
    savedSearches,
    loadSavedSearch,
    saveSearch
  } = useSearch();

  // Local state
  const [inputValue, setInputValue] = useState(query.text);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<Array<{ query: string; count: number }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete
  useEffect(() => {
    if (!showSuggestions || !inputValue.trim() || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const suggestions = await searchApiService.getAutocompleteSuggestions(inputValue.trim(), 8);
        setSuggestions(suggestions);
      } catch (error) {
        console.warn('Failed to get autocomplete suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, showSuggestions]);

  // Load trending searches on mount
  useEffect(() => {
    if (showTrending) {
      searchApiService.getTrendingSearches('24h', undefined, 5)
        .then(trending => setTrendingSearches(trending))
        .catch(error => console.warn('Failed to get trending searches:', error));
    }
  }, [showTrending]);

  // Sync with external search query changes
  useEffect(() => {
    setInputValue(query.text);
  }, [query.text]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setText(value);
    setSelectedIndex(-1);
    
    if (value.trim() || isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  }, [setText]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsDropdownOpen(true);
  }, []);

  // Handle input blur
  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Delay closing to allow clicking dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  // Handle search submission
  const handleSubmit = useCallback((searchText?: string) => {
    const text = searchText || inputValue.trim();
    setText(text);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    onSearch?.(text);
  }, [inputValue, setText, onSearch]);

  // Handle form submission
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // If an item is selected, use it
    const allItems = [
      ...suggestions,
      ...searchHistory.map(h => h.text).filter(t => t.toLowerCase().includes(inputValue.toLowerCase())),
      ...trendingSearches.map(t => t.query),
      ...savedSearches.map(s => s.name)
    ];
    
    if (selectedIndex >= 0 && selectedIndex < allItems.length) {
      handleSubmit(allItems[selectedIndex]);
    } else {
      handleSubmit();
    }
  }, [suggestions, searchHistory, trendingSearches, savedSearches, selectedIndex, inputValue, handleSubmit]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    const allItems = [
      ...suggestions,
      ...searchHistory.map(h => h.text).filter(t => t.toLowerCase().includes(inputValue.toLowerCase())),
      ...trendingSearches.map(t => t.query),
      ...savedSearches.map(s => s.name)
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          setInputValue(allItems[selectedIndex]);
          setText(allItems[selectedIndex]);
        }
        break;
    }
  }, [isDropdownOpen, suggestions, searchHistory, trendingSearches, savedSearches, selectedIndex, inputValue, setText]);

  // Handle item click
  const handleItemClick = useCallback((item: string, type: 'suggestion' | 'history' | 'trending' | 'saved') => {
    if (type === 'saved') {
      const savedSearch = savedSearches.find(s => s.name === item);
      if (savedSearch) {
        loadSavedSearch(savedSearch);
      }
    } else {
      handleSubmit(item);
    }
  }, [savedSearches, loadSavedSearch, handleSubmit]);

  // Handle save search
  const handleSaveSearch = useCallback(() => {
    if (inputValue.trim()) {
      const name = prompt('Enter a name for this search:');
      if (name?.trim()) {
        saveSearch(name.trim());
      }
    }
  }, [inputValue, saveSearch]);

  // Prepare dropdown items
  const dropdownItems = [];
  let itemIndex = 0;

  // Suggestions
  if (showSuggestions && suggestions.length > 0) {
    dropdownItems.push(
      <div key="suggestions-header" style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>
        Suggestions
      </div>
    );
    suggestions.forEach((suggestion, index) => {
      dropdownItems.push(
        <div
          key={`suggestion-${index}`}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            backgroundColor: selectedIndex === itemIndex ? '#edf2f7' : 'transparent',
            color: '#4a5568'
          }}
          onMouseEnter={() => setSelectedIndex(itemIndex)}
          onClick={() => handleItemClick(suggestion, 'suggestion')}
        >
          🔍 {suggestion}
        </div>
      );
      itemIndex++;
    });
  }

  // History
  if (showHistory && searchHistory.length > 0) {
    const relevantHistory = searchHistory
      .map(h => h.text)
      .filter(t => t && t.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 3);

    if (relevantHistory.length > 0) {
      dropdownItems.push(
        <div key="history-header" style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>
          Recent Searches
        </div>
      );
      relevantHistory.forEach((historyItem, index) => {
        dropdownItems.push(
          <div
            key={`history-${index}`}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              backgroundColor: selectedIndex === itemIndex ? '#edf2f7' : 'transparent',
              color: '#4a5568'
            }}
            onMouseEnter={() => setSelectedIndex(itemIndex)}
            onClick={() => handleItemClick(historyItem, 'history')}
          >
            🕒 {historyItem}
          </div>
        );
        itemIndex++;
      });
    }
  }

  // Trending (show when input is empty or short)
  if (showTrending && trendingSearches.length > 0 && inputValue.length < 2) {
    dropdownItems.push(
      <div key="trending-header" style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>
        Trending Now
      </div>
    );
    trendingSearches.slice(0, 3).forEach((trending, index) => {
      dropdownItems.push(
        <div
          key={`trending-${index}`}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            backgroundColor: selectedIndex === itemIndex ? '#edf2f7' : 'transparent',
            color: '#4a5568',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onMouseEnter={() => setSelectedIndex(itemIndex)}
          onClick={() => handleItemClick(trending.query, 'trending')}
        >
          <span>🔥 {trending.query}</span>
          <span style={{ fontSize: '12px', color: '#a0aec0' }}>
            {trending.count}
          </span>
        </div>
      );
      itemIndex++;
    });
  }

  // Saved searches
  if (showSavedSearches && savedSearches.length > 0 && inputValue.length < 2) {
    dropdownItems.push(
      <div key="saved-header" style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>
        Saved Searches
      </div>
    );
    savedSearches.slice(0, 3).forEach((saved, index) => {
      dropdownItems.push(
        <div
          key={`saved-${index}`}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            backgroundColor: selectedIndex === itemIndex ? '#edf2f7' : 'transparent',
            color: '#4a5568'
          }}
          onMouseEnter={() => setSelectedIndex(itemIndex)}
          onClick={() => handleItemClick(saved.name, 'saved')}
        >
          ⭐ {saved.name}
        </div>
      );
      itemIndex++;
    });
  }

  return (
    <div className={`enhanced-search-bar ${className}`} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleFormSubmit} style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '12px 48px 12px 16px',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              backgroundColor: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3182ce';
              handleInputFocus();
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              handleInputBlur(e);
            }}
          />
          
          {/* Search button */}
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#718096',
              fontSize: '16px'
            }}
          >
            {isLoading ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && dropdownItems.length > 0 && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto',
              marginTop: '4px'
            }}
          >
            {dropdownItems}
            
            {/* Save search option */}
            {inputValue.trim() && (
              <div style={{ borderTop: '1px solid #e2e8f0', padding: '8px 12px' }}>
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#3182ce',
                    textDecoration: 'underline'
                  }}
                >
                  💾 Save this search
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedSearchBar;