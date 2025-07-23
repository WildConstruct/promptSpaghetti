/**
 * Search Bar Component
 * 
 * FILE-985116-5A41: Build Search and Filter System
 * 
 * Primary search input with real-time search, history, and suggestions.
 * Integrates with SearchContext for unified state management.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from './SearchContext';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  showHistory?: boolean;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  autoFocus = false,
  showHistory = true,
  showSuggestions = true,
  onSearch,
  className = ''
}) => {
  const {
    query,
    setText,
    searchHistory,
    isLoading,
    error,
    hasActiveFilters,
    resetQuery
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [suggestions] = useState<string[]>([
    'name:',
    'type:',
    'modified:',
    'size:',
    'author:',
    'created:'
  ]); // Field suggestions for advanced search

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    setIsOpen(value.length > 0 || showHistory);
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.text.trim()) {
      onSearch?.(query.text);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle history item click
  const handleHistoryClick = (historyQuery: unknown) => {
    setText(historyQuery.text);
    setIsOpen(false);
    onSearch?.(historyQuery.text);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    const currentText = query.text;
    const lastSpaceIndex = currentText.lastIndexOf(' ');
    const newText = lastSpaceIndex >= 0 
      ? currentText.substring(0, lastSpaceIndex + 1) + suggestion
      : suggestion;
    
    setText(newText);
    inputRef.current?.focus();
    setIsOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    resetQuery();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const searchBarStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%'
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: `2px solid ${error ? '#dc2626' : hasActiveFilters ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '8px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: isOpen ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#1f2937'
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: '8px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '4px',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };

  const sectionStyle: React.CSSProperties = {
    padding: '8px 0'
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #f3f4f6'
  };

  const itemStyle: React.CSSProperties = {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.1s'
  };

  const filteredSuggestions = suggestions.filter(s => 
    query.text.toLowerCase().includes(s.toLowerCase())
  );

  const recentHistory = searchHistory.slice(0, 5);

  return (
    <div className={`search-bar ${className}`} style={searchBarStyle}>
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyle}>
          <input
            ref={inputRef}
            type="text"
            value={query.text}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={inputStyle}
            disabled={isLoading}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div style={iconButtonStyle}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          {/* Clear button */}
          {!isLoading && (query.text || hasActiveFilters) && (
            <button
              type="button"
              onClick={handleClear}
              style={iconButtonStyle}
              title="Clear search"
            >
              ✕
            </button>
          )}
          
          {/* Search button */}
          <button
            type="submit"
            style={{
              ...iconButtonStyle,
              backgroundColor: '#3b82f6',
              color: '#FFFFFF',
              borderRadius: '6px',
              margin: '4px'
            }}
            disabled={isLoading || !query.text.trim()}
            title="Search"
          >
            🔍
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div style={{
          marginTop: '4px',
          padding: '6px 12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '4px',
          padding: '4px 8px',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#1d4ed8',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>🔽 Filters active</span>
          <button
            onClick={resetQuery}
            style={{
              background: 'none',
              border: 'none',
              color: '#1d4ed8',
              cursor: 'pointer',
              fontSize: '11px',
              textDecoration: 'underline'
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (showHistory || showSuggestions) && (
        <div ref={dropdownRef} style={dropdownStyle}>
          {/* Search suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>Search Fields</div>
              {filteredSuggestions.map(suggestion => (
                <div
                  key={suggestion}
                  style={itemStyle}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: '#3b82f6' }}>🏷️</span>
                  <span>{suggestion}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {suggestion === 'name:' && 'Search by file name'}
                    {suggestion === 'type:' && 'Filter by file type'}
                    {suggestion === 'modified:' && 'Filter by modification date'}
                    {suggestion === 'size:' && 'Filter by file size'}
                    {suggestion === 'author:' && 'Filter by author'}
                    {suggestion === 'created:' && 'Filter by creation date'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search history */}
          {showHistory && recentHistory.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>Recent Searches</div>
              {recentHistory.map((historyItem, index) => (
                <div
                  key={index}
                  style={itemStyle}
                  onClick={() => handleHistoryClick(historyItem)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: '#6b7280' }}>🕐</span>
                  <span>{historyItem.text}</span>
                  {historyItem.filters.length > 0 && (
                    <span style={{
                      fontSize: '11px',
                      color: '#3b82f6',
                      backgroundColor: '#dbeafe',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      +{historyItem.filters.length} filters
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {(!showHistory || recentHistory.length === 0) && 
           (!showSuggestions || filteredSuggestions.length === 0) && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              Start typing to search...
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;