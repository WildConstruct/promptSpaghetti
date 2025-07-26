/**
 * Search Results Component
 * 
 * FILE-985116-5A41: Build Search and Filter System
 * 
 * Displays search results with pagination, sorting, and different view modes.
 * Integrates with SearchContext for state management and result handling.
 */

import React, { useState, useMemo } from 'react';
import { useSearch, SearchResult } from './SearchContext';

interface SearchResultsProps<T = unknown> {
  renderItem?: (item: T, index: number) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  viewMode?: 'list' | 'grid' | 'table';
  showPagination?: boolean;
  itemsPerPage?: number;
  showViewModeToggle?: boolean;
  onItemClick?: (item: T, index: number) => void;
  onItemDoubleClick?: (item: T, index: number) => void;
  className?: string;
}

export const SearchResults = <T = unknown,>({
  renderItem,
  renderEmptyState,
  viewMode: initialViewMode = 'list',
  showPagination = true,
  itemsPerPage = 20,
  showViewModeToggle = true,
  onItemClick,
  onItemDoubleClick,
  className = ''
}: SearchResultsProps<T>) => {
  const {
    results,
    isLoading,
    error,
    query,
    isQueryEmpty
  } = useSearch();

  const [currentViewMode, setCurrentViewMode] = useState(initialViewMode);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalItems = results?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Get paginated results
  const paginatedItems = useMemo(() => {
    if (!results?.items) return [];
    return showPagination 
      ? results.items.slice(startIndex, endIndex)
      : results.items;
  }, [results?.items, startIndex, endIndex, showPagination]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Default item renderer
  const defaultRenderItem = (item: T, index: number) => (
    <div
      key={index}
      style={{
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: '#FFFFFF',
        cursor: onItemClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s'
      }}
      onClick={() => onItemClick?.(item, index)}
      onDoubleClick={() => onItemDoubleClick?.(item, index)}
      onMouseEnter={(e) => {
        if (onItemClick) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
      }}
    >
      <pre style={{
        margin: 0,
        fontSize: '13px',
        color: '#374151',
        whiteSpace: 'pre-wrap',
        fontFamily: 'inherit'
      }}>
        {JSON.stringify(item, null, 2)}
      </pre>
    </div>
  );

  // Default empty state renderer
  const defaultRenderEmptyState = () => (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: '#6b7280'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        {isQueryEmpty ? '🔍' : '📭'}
      </div>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '18px', 
        fontWeight: '500',
        color: '#374151'
      }}>
        {isQueryEmpty ? 'Start searching' : 'No results found'}
      </h3>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
        {isQueryEmpty 
          ? 'Enter a search term or apply filters to find what you\'re looking for.'
          : 'Try adjusting your search criteria or filters to find more results.'}
      </p>
    </div>
  );

  // View mode styles
  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%'
    };

    switch (currentViewMode) {
    case 'grid':
      return {
        ...baseStyle,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      };
    case 'table':
      return {
        ...baseStyle,
        display: 'block'
      };
    default: // list
      return {
        ...baseStyle,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px'
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`search-results loading ${className}`} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        color: '#6b7280'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '12px'
        }} />
        <span style={{ fontSize: '14px' }}>Searching...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`search-results error ${className}`} style={{
        padding: '24px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
          Search Error
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (!results || results.items.length === 0) {
    return (
      <div className={`search-results empty ${className}`}>
        {renderEmptyState ? renderEmptyState() : defaultRenderEmptyState()}
      </div>
    );
  }

  return (
    <div className={`search-results ${className}`}>
      {/* Header with view controls and stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {/* Results stats */}
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {showPagination ? (
            <>
              Showing {startIndex + 1}-{endIndex} of {totalItems} results
              {results.executionTime && (
                <span style={{ marginLeft: '8px', color: '#9ca3af' }}>
                  ({results.executionTime}ms)
                </span>
              )}
            </>
          ) : (
            <>
              {totalItems} results
              {results.executionTime && (
                <span style={{ marginLeft: '8px', color: '#9ca3af' }}>
                  ({results.executionTime}ms)
                </span>
              )}
            </>
          )}
        </div>

        {/* View mode toggle */}
        {showViewModeToggle && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['list', 'grid', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentViewMode(mode)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  backgroundColor: currentViewMode === mode ? '#3b82f6' : '#FFFFFF',
                  color: currentViewMode === mode ? '#FFFFFF' : '#374151',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {mode === 'list' && '☰'}
                {mode === 'grid' && '⊞'}
                {mode === 'table' && '≡'}
                <span style={{ marginLeft: '4px' }}>{mode}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Facets (if available) */}
      {results.facets && Object.keys(results.facets).length > 0 && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px'
        }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '13px', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            Filter by:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(results.facets).map(([facetKey, facetValues]) => (
              <div key={facetKey} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {facetValues.slice(0, 5).map((facetValue) => (
                  <button
                    key={`${facetKey}-${facetValue.value}`}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={`Filter by ${facetKey}: ${facetValue.value}`}
                  >
                    <span>{facetValue.value}</span>
                    <span style={{
                      backgroundColor: '#e5e7eb',
                      borderRadius: '8px',
                      padding: '0 4px',
                      fontSize: '10px'
                    }}>
                      {facetValue.count}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results container */}
      <div style={getContainerStyle()}>
        {paginatedItems.map((item, index) => 
          renderItem ? renderItem(item, index) : defaultRenderItem(item, index)
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage <= 1 ? '#f3f4f6' : '#FFFFFF',
              color: currentPage <= 1 ? '#9ca3af' : '#374151',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          {/* Page numbers */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === page ? '#3b82f6' : '#FFFFFF',
                    color: currentPage === page ? '#FFFFFF' : '#374151',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '36px'
                  }}
                >
                  {page}
                </button>
              );
            })}
            
            {totalPages > 5 && (
              <>
                <span style={{ padding: '6px 4px', color: '#9ca3af' }}>...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === totalPages ? '#3b82f6' : '#FFFFFF',
                    color: currentPage === totalPages ? '#FFFFFF' : '#374151',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '36px'
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage >= totalPages ? '#f3f4f6' : '#FFFFFF',
              color: currentPage >= totalPages ? '#9ca3af' : '#374151',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next →
          </button>
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

export default SearchResults;