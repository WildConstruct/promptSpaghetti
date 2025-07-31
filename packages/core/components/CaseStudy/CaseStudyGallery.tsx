/**
 * Epic 16 - Case Study Gallery Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 * 
 * Main gallery component for displaying case studies in grid/list layouts
 * with filtering, sorting, and search capabilities.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  CaseStudy,
  CaseStudyFilter,
  CaseStudySort,
  IndustryCategory,
  CaseStudyType
} from '../../models/CaseStudyDataModel';
import { CaseStudyCard } from './CaseStudyCard';

}
export interface CaseStudyGalleryProps {
  initialFilter?: CaseStudyFilter;
  initialSort?: CaseStudySort;
  layout?: 'grid' | 'list';
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  maxItems?: number;
  onCaseStudyClick?: (caseStudy: CaseStudy) => void;
  onTemplateClick?: (templateId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  className?: string;
}
}
export const CaseStudyGallery: React.FC<CaseStudyGalleryProps> = ({)
  initialFilter = {},
  initialSort = { field: 'publishedAt', direction: 'desc' },
  layout = 'grid',
  showFilters = true,
  showSearch = true,
  showSort = true,
  maxItems,
  onCaseStudyClick,
  onTemplateClick,
  onAuthorClick,
  className = ''
}) => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CaseStudyFilter>(initialFilter);
  const [sort, setSort] = useState<CaseStudySort>(initialSort);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [_____hasMore, setHasMore] = useState(false);
  const pageSize = 12;
  // Load case studies
  const loadCaseStudies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Add filters
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        types.forEach(type => params.append('type', type));
      if (filter.industry) {
        const industries = Array.isArray(filter.industry) ? filter.industry : [filter.industry];
        industries.forEach(industry => params.append('industry', industry));
      if (filter.difficulty?.length) {
        filter.difficulty.forEach(diff => params.append('difficulty', diff));
      if (filter.tags?.length) {
        filter.tags.forEach(tag => params.append('tags', tag));
      if (filter.featuredOnly) {
        params.append('featured', 'true');
      if (filter.verifiedAuthorsOnly) {
        params.append('verified_authors', 'true');
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      // Add sorting
      params.append('sort_field', sort.field);
      params.append('sort_direction', sort.direction);
      // Add pagination
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (maxItems) {
        params.append('max_items', maxItems.toString());
      const response = await fetch(`/api/marketplace/case-studies?${params}`);}
      if (!response.ok) {
        throw new Error(`Failed to load case studies: ${response.statusText}`);}
      const data = await response.json();
      setCaseStudies(data.caseStudies || []);
      setTotalCount(data.pagination?.total || 0);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load case studies');
  setCaseStudies([]);
} finally {
      setLoading(false);
  }, [filter, sort, searchQuery, currentPage, maxItems]);
  useEffect(() => {
    loadCaseStudies();
  }, [loadCaseStudies]);
  // Handle filter changes
  const handleFilterChange = (newFilter: Partial<CaseStudyFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
  };
  // Handle sort change
  const handleSortChange = (newSort: CaseStudySort) => {
    setSort(newSort);
    setCurrentPage(1);
  };
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Clear all filters
  const clearFilters = () => {
    setFilter({});
    setSearchQuery('');
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(totalCount / pageSize);
  return;
    <div className={`case-study-gallery ${currentLayout} ${className}`}>}
      {/* Header */}
      <div className="gallery-header">
        <div className="header-main">
          <h2 className="gallery-title">Case Studies</h2>
          <p className="gallery-subtitle">
            Real success stories from our community
          </p>
        </div>
        <div className="header-controls">
          {/* Layout Toggle */}
          <div className="layout-toggle">
            <button
              onClick={() => setCurrentLayout('grid')}
              className={`layout-btn ${currentLayout === 'grid' ? 'active' : ''}`}
              title="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentLayout('list')}
              className={`layout-btn ${currentLayout === 'list' ? 'active' : ''}`}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="7" width="14" height="2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="12" width="14" height="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          {/* Results Count */}
          <div className="results-count">
            {loading ? 'Loading...' : `${totalCount} case studies`}
          </div>
        </div>
      </div>
      {/* Search and Filters */}
      {(showSearch || showFilters || showSort) && ()
        <div className="gallery-controls">
          {/* Search */}
          {showSearch && ()
            <div className="search-section">
              <div className="search-input">
                <svg width="16" height="16" viewBox="0 0 16 16" className="search-icon">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search case studies..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchQuery && ()
                  <button
                    onClick={() => handleSearch('')}
                    className="search-clear"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Filters */}
          {showFilters && ()
            <div className="filters-section">
              {/* Type Filter */}
              <select
                value={Array.isArray(filter.type) ? '' : (filter.type || '')}
                onChange={(e) => handleFilterChange({ )
                  type: e.target.value ? e.target.value as CaseStudyType : undefined ;
  })}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="template-success">Success Stories</option>
                <option value="user-story">User Stories</option>
                <option value="roi-analysis">ROI Analysis</option>
                <option value="before-after">Before/After</option>
                <option value="industry-showcase">Industry Cases</option>
                <option value="community-highlight">Community</option>
                <option value="innovation-case">Innovation</option>
              </select>
              {/* Industry Filter */}
              <select
                value={Array.isArray(filter.industry) ? '' : (filter.industry || '')}
                onChange={(e) => handleFilterChange({ )
                  industry: e.target.value ? e.target.value as IndustryCategory : undefined ;
  })}
                className="filter-select"
              >
                <option value="">All Industries</option>
                <option value="film-production">Film & Production</option>
                <option value="advertising">Advertising</option>
                <option value="gaming">Gaming</option>
                <option value="publishing">Publishing</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="technology">Technology</option>
                <option value="legal">Legal</option>
                <option value="consulting">Consulting</option>
                <option value="e-commerce">E-commerce</option>
                <option value="non-profit">Non-profit</option>
                <option value="other">Other</option>
              </select>
              {/* Difficulty Filter */}
              <select
                value={filter.difficulty?.[0] || ''}
                onChange={(e) => handleFilterChange({ )
                  difficulty: e.target.value ? [e.target.value as any] : undefined ;
  })}
                className="filter-select"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              {/* Featured Toggle */}
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filter.featuredOnly || false}
                  onChange={(e) => handleFilterChange({ featuredOnly: e.target.checked || undefined })}
                />
                Featured only
              </label>
              {/* Clear Filters */}
              <button onClick={clearFilters} className="clear-filters">
                Clear filters
              </button>
            </div>
          )}
          {/* Sort */}
          {showSort && ()
            <div className="sort-section">
              <select
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
  const [field, direction] = e.target.value.split('-');
  handleSortChange({ )
  field: field as any,
  direction: direction as 'asc' | 'desc',
});
                }}
                className="sort-select"
              >
                <option value="publishedAt-desc">Latest first</option>
                <option value="publishedAt-asc">Oldest first</option>
                <option value="views-desc">Most viewed</option>
                <option value="likes-desc">Most liked</option>
                <option value="helpfulVotes-desc">Most helpful</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          )}
        </div>
      )}
      {/* Content */}
      <div className="gallery-content">
        {loading ? ()
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading case studies...</p>
          </div>
        ) : error ? ()
          <div className="error-state">
            <h3>Failed to load case studies</h3>
            <p>{error}</p>
            <button onClick={loadCaseStudies} className="retry-button">
              Try again
            </button>
          </div>
        ) : caseStudies.length === 0 ? ()
          <div className="empty-state">
            <h3>No case studies found</h3>
            <p>Try adjusting your search or filters to find more case studies.</p>
            {(searchQuery || Object.keys(filter).length > 0) && ()
              <button onClick={clearFilters} className="clear-filters-button">
                Clear all filters
              </button>
            )}
          </div>
        ) : ()
          <div className={`case-studies-${currentLayout}`}>}
            {caseStudies.map((caseStudy) => ()
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                variant={currentLayout === 'list' ? 'standard' : 'compact'}
                onClick={onCaseStudyClick}
                onTemplateClick={onTemplateClick}
                onAuthorClick={onAuthorClick}
                className={currentLayout === 'list' ? 'list-item' : ''}
              />
            ))}
          </div>
        )}
      </div>
      {/* Pagination */}
      {!loading && !error && totalPages > 1 && ()
        <div className="gallery-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn prev"
          >
            ← Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;
              return;
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn next"
          >
            Next →
          </button>
        </div>
      )}
      <style>{`
        .case-study-gallery {
          padding: 20px 0;
        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        .header-main h2 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
  color: #1f2937;
        .header-main p {
          margin: 0;
          font-size: 16px;
  color: #6b7280;
        .header-controls {
          display: flex;
          align-items: center;
  gap: 16px;
        .layout-toggle {
          display: flex;
  border: 1px solid #e5e7eb;
          border-radius: 6px;
  overflow: hidden;
        .layout-btn {
          background: #ffffff;
  border: none;
          padding: 8px;
  cursor: pointer;
          color: #6b7280;
  transition: all 0.2s ease;
        .layout-btn:hover {,
  background: #f9fafb;
        .layout-btn.active {
          background: #3b82f6;
  color: #ffffff;
        .results-count {
          font-size: 14px;
  color: #6b7280;
          font-weight: 500;
        .gallery-controls {
          background: #f8fafc;
  border: 1px solid #e5e7eb;
          border-radius: 8px;
  padding: 16px;
          margin-bottom: 24px;
  display: flex;
          flex-direction: column;
  gap: 16px;
        .search-section {
          display: flex;
          align-items: center;
        .search-input {
          position: relative;
  flex: 1;
          max-width: 400px;
        .search-icon {
          position: absolute;
  left: 12px;
          top: 50%;
  transform: translateY(-50%);
          color: #9ca3af;
        .search-input input {
          width: 100%;
  padding: 10px 12px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        .search-clear {
          position: absolute;
  right: 12px;
          top: 50%;
  transform: translateY(-50%);
          background: none;
  border: none;
          font-size: 18px;
  color: #9ca3af;
          cursor: pointer;
  padding: 0;
          width: 20px;
  height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        .filters-section {
          display: flex;
          flex-wrap: wrap;
  gap: 12px;
          align-items: center;
        .filter-select, .sort-select {
          padding: 8px 12px;
  border: 1px solid #d1d5db;
          border-radius: 6px;
  background: #ffffff;
          font-size: 14px;
  cursor: pointer;
        .filter-checkbox {
          display: flex;
          align-items: center;
  gap: 6px;
          font-size: 14px;
  color: #4b5563;
          cursor: pointer;
        .clear-filters, .clear-filters-button {
          background: #f3f4f6;
  border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
  cursor: pointer;
          transition: all 0.2s ease;
        .clear-filters:hover, .clear-filters-button:hover {,
  background: #e5e7eb;
        .sort-section {
          display: flex;
          align-items: center;
        .gallery-content {
          min-height: 400px;
        .case-studies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        .case-studies-list {
          display: flex;
          flex-direction: column;
  gap: 16px;
        .case-studies-list .case-study-card.list-item {
          max-width: none;
        .loading-state, .error-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  padding: 60px 20px;
          text-align: center;
        .loading-spinner {
          width: 40px;
  height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
  animation: spin 1s linear infinite;
          margin-bottom: 16px;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        .error-state h3, .empty-state h3 {
          margin: 0 0 8px 0;
  color: #1f2937;
        .error-state p, .empty-state p {
          margin: 0 0 16px 0;
  color: #6b7280;
        .retry-button {
          background: #3b82f6;
  color: #ffffff;
          border: none;
  padding: 10px 20px;
          border-radius: 6px;
  cursor: pointer;
          transition: background 0.2s ease;
        .retry-button:hover {,
  background: #2563eb;
        .gallery-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
  gap: 8px;
          margin-top: 32px;
        .page-btn {
          background: #ffffff;
  border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
  cursor: pointer;
          font-size: 14px;
  transition: all 0.2s ease;
        .page-btn:hover:not(:disabled) {,
  background: #f9fafb;
          border-color: #9ca3af;
        .page-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
  color: #ffffff;
        .page-btn:disabled {,
  opacity: 0.5;
          cursor: not-allowed;
        .page-numbers {
          display: flex;
  gap: 4px;
        @media (max-width: 768px) {
          .gallery-header {
            flex-direction: column;
            align-items: flex-start;
  gap: 16px;
          .header-controls {
            width: 100%;
            justify-content: space-between;
          .gallery-controls {
            padding: 12px;
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          .filter-select, .sort-select {
            width: 100%;
          .case-studies-grid {
            grid-template-columns: 1fr;
  gap: 16px;
          .page-numbers {
            display: none;
      `}</style>
    </div>
  );
};

export default CaseStudyGallery;