import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 - Case Study Gallery Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Main gallery component for displaying case studies in grid/list layouts
 * with filtering, sorting, and search capabilities.
 */
import { useState, useEffect, useCallback } from 'react';
import { CaseStudyCard } from './CaseStudyCard';
export const CaseStudyGallery = ({ initialFilter = {}, initialSort = { field: 'publishedAt', direction: 'desc' }, layout = 'grid', showFilters = true, showSearch = true, showSort = true, maxItems, onCaseStudyClick, onTemplateClick, onAuthorClick, className = '' }) => {
    const [caseStudies, setCaseStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(initialFilter);
    const [sort, setSort] = useState(initialSort);
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
            }
            if (filter.industry) {
                const industries = Array.isArray(filter.industry) ? filter.industry : [filter.industry];
                industries.forEach(industry => params.append('industry', industry));
            }
            if (filter.difficulty?.length) {
                filter.difficulty.forEach(diff => params.append('difficulty', diff));
            }
            if (filter.tags?.length) {
                filter.tags.forEach(tag => params.append('tags', tag));
            }
            if (filter.featuredOnly) {
                params.append('featured', 'true');
            }
            if (filter.verifiedAuthorsOnly) {
                params.append('verified_authors', 'true');
            }
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }
            // Add sorting
            params.append('sort_field', sort.field);
            params.append('sort_direction', sort.direction);
            // Add pagination
            params.append('page', currentPage.toString());
            params.append('limit', pageSize.toString());
            if (maxItems) {
                params.append('max_items', maxItems.toString());
            }
            const response = await fetch(`/api/marketplace/case-studies?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to load case studies: ${response.statusText}`);
            }
            const data = await response.json();
            setCaseStudies(data.caseStudies || []);
            setTotalCount(data.pagination?.total || 0);
            setHasMore(data.pagination?.hasMore || false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load case studies');
            setCaseStudies([]);
        }
        finally {
            setLoading(false);
        }
    }, [filter, sort, searchQuery, currentPage, maxItems]);
    useEffect(() => {
        loadCaseStudies();
    }, [loadCaseStudies]);
    // Handle filter changes
    const handleFilterChange = (newFilter) => {
        setFilter(prev => ({ ...prev, ...newFilter }));
        setCurrentPage(1);
    };
    // Handle sort change
    const handleSortChange = (newSort) => {
        setSort(newSort);
        setCurrentPage(1);
    };
    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };
    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    // Clear all filters
    const clearFilters = () => {
        setFilter({});
        setSearchQuery('');
        setCurrentPage(1);
    };
    const totalPages = Math.ceil(totalCount / pageSize);
    return (_jsxs("div", { className: `case-study-gallery ${currentLayout} ${className}`, children: [_jsxs("div", { className: "gallery-header", children: [_jsxs("div", { className: "header-main", children: [_jsx("h2", { className: "gallery-title", children: "Case Studies" }), _jsx("p", { className: "gallery-subtitle", children: "Real success stories from our community" })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "layout-toggle", children: [_jsx("button", { onClick: () => setCurrentLayout('grid'), className: `layout-btn ${currentLayout === 'grid' ? 'active' : ''}`, title: "Grid view", children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: [_jsx("rect", { x: "1", y: "1", width: "6", height: "6", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("rect", { x: "9", y: "1", width: "6", height: "6", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("rect", { x: "1", y: "9", width: "6", height: "6", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("rect", { x: "9", y: "9", width: "6", height: "6", stroke: "currentColor", strokeWidth: "1.5" })] }) }), _jsx("button", { onClick: () => setCurrentLayout('list'), className: `layout-btn ${currentLayout === 'list' ? 'active' : ''}`, title: "List view", children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: [_jsx("rect", { x: "1", y: "2", width: "14", height: "2", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("rect", { x: "1", y: "7", width: "14", height: "2", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("rect", { x: "1", y: "12", width: "14", height: "2", stroke: "currentColor", strokeWidth: "1.5" })] }) })] }), _jsx("div", { className: "results-count", children: loading ? 'Loading...' : `${totalCount} case studies` })] })] }), (showSearch || showFilters || showSort) && (_jsxs("div", { className: "gallery-controls", children: [showSearch && (_jsx("div", { className: "search-section", children: _jsxs("div", { className: "search-input", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", className: "search-icon", children: [_jsx("circle", { cx: "8", cy: "8", r: "3.5", stroke: "currentColor", strokeWidth: "1.5", fill: "none" }), _jsx("path", { d: "11.5 11.5L15 15", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] }), _jsx("input", { type: "text", placeholder: "Search case studies...", value: searchQuery, onChange: (e) => handleSearch(e.target.value) }), searchQuery && (_jsx("button", { onClick: () => handleSearch(''), className: "search-clear", title: "Clear search", children: "\u00D7" }))] }) })), showFilters && (_jsxs("div", { className: "filters-section", children: [_jsxs("select", { value: Array.isArray(filter.type) ? '' : (filter.type || ''), onChange: (e) => handleFilterChange({
                                    type: e.target.value ? e.target.value : undefined
                                }), className: "filter-select", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "template-success", children: "Success Stories" }), _jsx("option", { value: "user-story", children: "User Stories" }), _jsx("option", { value: "roi-analysis", children: "ROI Analysis" }), _jsx("option", { value: "before-after", children: "Before/After" }), _jsx("option", { value: "industry-showcase", children: "Industry Cases" }), _jsx("option", { value: "community-highlight", children: "Community" }), _jsx("option", { value: "innovation-case", children: "Innovation" })] }), _jsxs("select", { value: Array.isArray(filter.industry) ? '' : (filter.industry || ''), onChange: (e) => handleFilterChange({
                                    industry: e.target.value ? e.target.value : undefined
                                }), className: "filter-select", children: [_jsx("option", { value: "", children: "All Industries" }), _jsx("option", { value: "film-production", children: "Film & Production" }), _jsx("option", { value: "advertising", children: "Advertising" }), _jsx("option", { value: "gaming", children: "Gaming" }), _jsx("option", { value: "publishing", children: "Publishing" }), _jsx("option", { value: "education", children: "Education" }), _jsx("option", { value: "healthcare", children: "Healthcare" }), _jsx("option", { value: "finance", children: "Finance" }), _jsx("option", { value: "technology", children: "Technology" }), _jsx("option", { value: "legal", children: "Legal" }), _jsx("option", { value: "consulting", children: "Consulting" }), _jsx("option", { value: "e-commerce", children: "E-commerce" }), _jsx("option", { value: "non-profit", children: "Non-profit" }), _jsx("option", { value: "other", children: "Other" })] }), _jsxs("select", { value: filter.difficulty?.[0] || '', onChange: (e) => handleFilterChange({
                                    difficulty: e.target.value ? [e.target.value] : undefined
                                }), className: "filter-select", children: [_jsx("option", { value: "", children: "All Levels" }), _jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "expert", children: "Expert" })] }), _jsxs("label", { className: "filter-checkbox", children: [_jsx("input", { type: "checkbox", checked: filter.featuredOnly || false, onChange: (e) => handleFilterChange({ featuredOnly: e.target.checked || undefined }) }), "Featured only"] }), _jsx("button", { onClick: clearFilters, className: "clear-filters", children: "Clear filters" })] })), showSort && (_jsx("div", { className: "sort-section", children: _jsxs("select", { value: `${sort.field}-${sort.direction}`, onChange: (e) => {
                                const [field, direction] = e.target.value.split('-');
                                handleSortChange({
                                    field: field,
                                    direction: direction
                                });
                            }, className: "sort-select", children: [_jsx("option", { value: "publishedAt-desc", children: "Latest first" }), _jsx("option", { value: "publishedAt-asc", children: "Oldest first" }), _jsx("option", { value: "views-desc", children: "Most viewed" }), _jsx("option", { value: "likes-desc", children: "Most liked" }), _jsx("option", { value: "helpfulVotes-desc", children: "Most helpful" }), _jsx("option", { value: "title-asc", children: "Title A-Z" }), _jsx("option", { value: "title-desc", children: "Title Z-A" })] }) }))] })), _jsx("div", { className: "gallery-content", children: loading ? (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading case studies..." })] })) : error ? (_jsxs("div", { className: "error-state", children: [_jsx("h3", { children: "Failed to load case studies" }), _jsx("p", { children: error }), _jsx("button", { onClick: loadCaseStudies, className: "retry-button", children: "Try again" })] })) : caseStudies.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { children: "No case studies found" }), _jsx("p", { children: "Try adjusting your search or filters to find more case studies." }), (searchQuery || Object.keys(filter).length > 0) && (_jsx("button", { onClick: clearFilters, className: "clear-filters-button", children: "Clear all filters" }))] })) : (_jsx("div", { className: `case-studies-${currentLayout}`, children: caseStudies.map((caseStudy) => (_jsx(CaseStudyCard, { caseStudy: caseStudy, variant: currentLayout === 'list' ? 'standard' : 'compact', onClick: onCaseStudyClick, onTemplateClick: onTemplateClick, onAuthorClick: onAuthorClick, className: currentLayout === 'list' ? 'list-item' : '' }, caseStudy.id))) })) }), !loading && !error && totalPages > 1 && (_jsxs("div", { className: "gallery-pagination", children: [_jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: "page-btn prev", children: "\u2190 Previous" }), _jsx("div", { className: "page-numbers", children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            if (page > totalPages)
                                return null;
                            return (_jsx("button", { onClick: () => handlePageChange(page), className: `page-btn ${currentPage === page ? 'active' : ''}`, children: page }, page));
                        }) }), _jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages, className: "page-btn next", children: "Next \u2192" })] })), _jsx("style", { children: `
        .case-study-gallery {
          padding: 20px 0;
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-main h2 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .header-main p {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .layout-toggle {
          display: flex;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .layout-btn {
          background: #ffffff;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .layout-btn:hover {
          background: #f9fafb;
        }

        .layout-btn.active {
          background: #3b82f6;
          color: #ffffff;
        }

        .results-count {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .gallery-controls {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-section {
          display: flex;
          align-items: center;
        }

        .search-input {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

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
        }

        .filters-section {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .filter-select, .sort-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          font-size: 14px;
          cursor: pointer;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #4b5563;
          cursor: pointer;
        }

        .clear-filters, .clear-filters-button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-filters:hover, .clear-filters-button:hover {
          background: #e5e7eb;
        }

        .sort-section {
          display: flex;
          align-items: center;
        }

        .gallery-content {
          min-height: 400px;
        }

        .case-studies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .case-studies-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .case-studies-list .case-study-card.list-item {
          max-width: none;
        }

        .loading-state, .error-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-state h3, .empty-state h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        .error-state p, .empty-state p {
          margin: 0 0 16px 0;
          color: #6b7280;
        }

        .retry-button {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .retry-button:hover {
          background: #2563eb;
        }

        .gallery-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 32px;
        }

        .page-btn {
          background: #ffffff;
          border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .page-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .gallery-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-controls {
            width: 100%;
            justify-content: space-between;
          }

          .gallery-controls {
            padding: 12px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select, .sort-select {
            width: 100%;
          }

          .case-studies-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .page-numbers {
            display: none;
          }
        }
      ` })] }));
};
export default CaseStudyGallery;
