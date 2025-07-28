// Epic 16 Marketplace - Search Bar Component
import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';
interface SearchBarProps {
  value: string;,
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  suggestions?: string;
  loading?: boolean;
  className?: string;
  export const SearchBar: React.FC<SearchBarProps> = ({,)
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  suggestions = [],
  loading = false,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {,
  if ();
  suggestionsRef.current &&
  !suggestionsRef.current.contains(event.target as Node) &&
  !inputRef.current?.contains(event.target as Node)
  setShowSuggestions(false);
  setSelectedSuggestion(-1);
};
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
    setSelectedSuggestion(-1);
  };
  const handleInputFocus = () => {
    if (suggestions.length > 0 && value.length > 0) {
      setShowSuggestions(true);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!showSuggestions) {
  if (e.key === 'Enter') {
  handleSubmit();
  return;
  switch (e.key) {
  case 'ArrowDown':,
  e.preventDefault();
  setSelectedSuggestion(prev => )
  prev < suggestions.length - 1 ? prev + 1 : 0);
  break;
  case 'ArrowUp':,
  e.preventDefault();
  setSelectedSuggestion(prev => )
  prev > 0 ? prev - 1 : suggestions.length - 1);
  break;
  case 'Enter':,
  e.preventDefault();
  if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
  handleSuggestionSelect(suggestions[selectedSuggestion]);
} else {
  handleSubmit();
  break;
  case 'Escape':,
  setShowSuggestions(false);
  setSelectedSuggestion(-1);
  inputRef.current?.blur();
  break;
};
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    handleSubmit();
  };
  const handleSubmit = () => {
    onSubmit?.();
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };
  const handleClearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    inputRef.current?.focus();
  };
  return;
    <div className={`search-bar ${className}`}>}
      <div className="search-input-container">
        <div className="search-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
              stroke="currentColor"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search templates"
          autoComplete="off"
        />
        {value && ()
          <button
            onClick={handleClearSearch}
            className="clear-button"
            aria-label="Clear search"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {loading && ()
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="search-submit"
          aria-label="Submit search"
          type="button"
        >
          Search
        </button>
      </div>
      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && ()
        <div ref={suggestionsRef} className="search-suggestions">
          {suggestions.map((suggestion, index) => ()
            <button
              key={suggestion}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`suggestion-item ${
  index === selectedSuggestion ? 'selected' : '',
}`}
              type="button"
            >
              <div className="suggestion-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 14L10.5 10.5M12 6.5C12 9.26142 9.76142 11.5 7 11.5C4.23858 11.5 2 9.26142 2 6.5C2 3.73858 4.23858 1.5 7 1.5C9.76142 1.5 12 3.73858 12 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="suggestion-text">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};