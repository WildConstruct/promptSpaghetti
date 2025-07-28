// Epic 16 Marketplace - Home Page Component
import React, { useState, useEffect, useCallback } from 'react';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { TemplateCard } from './TemplateCard';
import { CategoryNav } from './CategoryNav';
import { FeaturedTemplates } from './FeaturedTemplates';
import { AdvancedFilters } from './AdvancedFilters';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useMarketplace } from '../../hooks/useMarketplace';
import './MarketplaceHome.css';
interface MarketplaceHomeProps {
  className?: string;

export const MarketplaceHome: React.FC<MarketplaceHomeProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'newest' | 'price_asc' | 'price_desc' | 'rating'>('relevance');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [advancedFilters, setAdvancedFilters] = useState({)
  categories: [] as string,
    tags: [] as string,
    priceRange: {} as { min?: number; max?: number },
    rating: 0,
    complexity: 'all' as 'beginner' | 'intermediate' | 'advanced' | 'all',
    compatibility: [] as string,
    isFree: null as boolean | null,
    isAiGenerated: null as boolean | null,
    sortBy: 'relevance' as 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest' | 'oldest';
  });
  const {
    templates,
    categories,
    featuredTemplates,
    loading,
    error,
    searchTemplates,
    loadCategories,
    loadFeaturedTemplates
  } = useMarketplace();
  useEffect(() => {
    // Load initial data
    loadCategories();
    loadFeaturedTemplates();
    handleSearch();
  }, [loadCategories, loadFeaturedTemplates, handleSearch]);
  useEffect(() => {
    // Trigger search when filters change
    handleSearch();
  }, [handleSearch]);
  const handleSearch = useCallback(() => {
  const filters = {
  query: searchQuery || undefined,
  categories: selectedCategory ? [selectedCategory] : ,
  advancedFilters.categories.length > 0 ? advancedFilters.categories : undefined,
  tags: advancedFilters.tags.length > 0 ? advancedFilters.tags : undefined,
  price_min: advancedFilters.priceRange.min,
  price_max: advancedFilters.priceRange.max,
  rating_min: advancedFilters.rating > 0 ? advancedFilters.rating : undefined,
  sort_by: advancedFilters.sortBy !== 'relevance' ? advancedFilters.sortBy : sortBy,
  is_free: advancedFilters.isFree !== null ? advancedFilters.isFree : ,
  priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
  page: 1,
  limit: 20,
};
    searchTemplates(filters);
  }, [searchQuery, selectedCategory, advancedFilters, sortBy, priceFilter, searchTemplates]);
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };
  const handleTemplateClick = (templateId: string) => {
    // Navigate to template detail page
    window.location.href = `/marketplace/templates/${templateId}`;}
  };
  if (error) {
    return;
      <div className={`marketplace-home error ${className}`}>}
        <div className="error-message">
          <h2>Unable to load marketplace</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  return;
    <div className={`marketplace-home ${className}`}>}
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Powerful Prompt Templates</h1>
          <p>Find, preview, and purchase high-quality prompt templates from our community of creators</p>
          <EnhancedSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search templates, categories, or tags..."
            onSubmit={handleSearch}
          />
        </div>
      </section>
      {/* Featured Templates */}
      <section className="featured-section">
        <h2>Featured Templates</h2>
        {loading && !featuredTemplates.length ? ()
          <LoadingSpinner />
        ) : ()
          <FeaturedTemplates
            templates={featuredTemplates}
            onTemplateClick={handleTemplateClick}
          />
        )}
      </section>
      {/* Advanced Filters */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        availableCategories={categories}
        availableTags={[
          'writing', 'coding', 'marketing', 'education', 'business', 'creative',
          'analysis', 'research', 'email', 'social-media', 'content', 'customer-service'
        ]}
      />
      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="filters-section">
            <h3>Categories</h3>
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>
          <div className="filters-section">
            <h3>Price</h3>
            <div className="price-filters">
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  value="all"
                  checked={priceFilter === 'all'}
                  onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                />
                All Templates
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  value="free"
                  checked={priceFilter === 'free'}
                  onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                />
                Free
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  value="paid"
                  checked={priceFilter === 'paid'}
                  onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                />
                Premium
              </label>
            </div>
          </div>
          <div className="filters-section">
            <h3>Sort By</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'popularity' | 'newest' | 'price_asc' | 'price_desc' | 'rating')}
              className="sort-select"
            >
              <option value="relevance">Relevance</option>
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </aside>
        {/* Templates Grid */}
        <main className="templates-main">
          <div className="templates-header">
            <h2>
              {searchQuery ? `Results for "${searchQuery}"` : }
                selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'}` : }
                  'All Templates'}
            </h2>
            <span className="results-count">
              {templates.total || 0} templates found
            </span>
          </div>
          {loading && !templates.templates?.length ? ()
            <LoadingSpinner />
          ) : ()
            <div className="templates-grid">
              {templates.templates?.map((template) => ()
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateClick(template.id)}
                />
              ))}
            </div>
          )}
          {!loading && templates.templates?.length === 0 && ()
            <div className="no-results">
              <h3>No templates found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}
          {/* Load More Button */}
          {templates.has_more && ()
            <div className="load-more-section">
              <button 
                onClick={() => {
  const nextPage = templates.page + 1;
  const filters = {
  query: searchQuery || undefined,
  categories: selectedCategory ? [selectedCategory] : undefined,
  sort_by: sortBy,
  is_free: priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
  page: nextPage,
  limit: 20,
};
                  // Load more templates by appending to existing results
                  searchTemplates(filters, true); // true indicates append mode
                }}
                className="load-more-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};