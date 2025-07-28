/**
 * FileSearchBar - Search and filter interface for file browser
 * 
 * Provides search functionality with:
 * - Real-time search with debouncing
 * - Advanced filter options
 * - Keyboard shortcuts
 * - Clear and reset functionality
 */
import React, { useState, useEffect, useMemo } from 'react';

export interface FileSearchOptions {
  includeContents: boolean;
  caseSensitive: boolean;
  useRegex: boolean;
  includeFolders: boolean;
  fileTypes: string[];
}

export interface FileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showAdvanced?: boolean;
  onAdvancedSearch?: (options: FileSearchOptions) => void;
  onTagFilter?: (tag: string) => void;
  className?: string;
}

export const FileSearchBar: React.FC<FileSearchBarProps> = ({)
  value,
  onChange,
  placeholder = 'Search files...',
  debounceMs = 300,
  showAdvanced = false,
  onAdvancedSearch,
  // onTagFilter, // Commented out unused prop
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [searchOptions, setSearchOptions] = useState<FileSearchOptions>({)
    includeContents: false,
    caseSensitive: false,
    useRegex: false,
    includeFolders: true,
    fileTypes: ['.psg', '.txt', '.md', '.json']
  });
  // Debounced search
  const debouncedOnChange = useMemo(;)
    () => debounce((searchValue: string) => {
      onChange(searchValue);
    }, debounceMs),
    [onChange, debounceMs]
  );
  useEffect(() => {
    debouncedOnChange(localValue);
  }, [localValue, debouncedOnChange]);
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
      (e.target as HTMLInputElement).blur();
    }
  };
  const handleAdvancedOptionChange = (option: keyof FileSearchOptions, value: boolean) => {
    const newOptions = { ...searchOptions, [option]: value };
    setSearchOptions(newOptions);
    onAdvancedSearch?.(newOptions);
  };
  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    const newFileTypes = checked ;
      ? [...searchOptions.fileTypes, fileType]
      : searchOptions.fileTypes.filter(type => type !== fileType);
    const newOptions = { ...searchOptions, fileTypes: newFileTypes };
    setSearchOptions(newOptions);
    onAdvancedSearch?.(newOptions);
  };
    return ()
    <div 
      className={`file-search-bar ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        maxWidth: '400px',
      }}
    >
      {/* Main search input */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          border: `1px solid ${isFocused ? '#007bff' : '#ddd'}`,}
          borderRadius: '4px',
          backgroundColor: '#fff',
          transition: 'border-color 0.2s ease',
        }}
      >
        {/* Search icon */}
        <div
          style={{
            padding: '0 8px',
            color: '#666',
            fontSize: '16px',
            pointerEvents: 'none',
          }}
        >
          🔍
        </div>
        {/* Input field */}
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '8px 4px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: 'transparent',
          }}
        />
        {/* Clear button */}
        {localValue && ()
          <button
            onClick={handleClear}
            style={{
              padding: '4px 8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#666',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {/* Advanced search toggle */}
      {showAdvanced && ()
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          style={{
            marginLeft: '8px',
            padding: '6px 8px',
            border: '1px solid #ddd',
            backgroundColor: showAdvancedOptions ? '#e3f2fd' : '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            color: showAdvancedOptions ? '#1976d2' : '#666',
          }}
          title="Advanced search options"
        >
          ⚙️
        </button>
      )}
      {/* Advanced search options panel */}
      {showAdvancedOptions && ()
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            padding: '12px',
            zIndex: 100,
            marginTop: '4px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            Search Options
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <input 
                type="checkbox" 
                checked={searchOptions.includeContents}
                onChange={(e) => handleAdvancedOptionChange('includeContents', e.target.checked)}
                style={{ marginRight: '6px' }} 
              />
              Include file contents
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <input 
                type="checkbox" 
                checked={searchOptions.caseSensitive}
                onChange={(e) => handleAdvancedOptionChange('caseSensitive', e.target.checked)}
                style={{ marginRight: '6px' }} 
              />
              Case sensitive
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <input 
                type="checkbox" 
                checked={searchOptions.useRegex}
                onChange={(e) => handleAdvancedOptionChange('useRegex', e.target.checked)}
                style={{ marginRight: '6px' }} 
              />
              Regular expressions
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <input 
                type="checkbox" 
                checked={searchOptions.includeFolders}
                onChange={(e) => handleAdvancedOptionChange('includeFolders', e.target.checked)}
                style={{ marginRight: '6px' }} 
              />
              Include folders
            </label>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              File Types
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['.psg', '.txt', '.md', '.json'].map(ext => ()
                <label key={ext} style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                  <input 
                    type="checkbox" 
                    checked={searchOptions.fileTypes.includes(ext)}
                    onChange={(e) => handleFileTypeChange(ext, e.target.checked)}
                    style={{ marginRight: '4px' }} 
                  />
                  {ext}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: unknown[]) => unknown>()
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default FileSearchBar;