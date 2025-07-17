// Epic 16 Marketplace - Home Page Component
import React, { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { TemplateCard } from './TemplateCard';
import { CategoryNav } from './CategoryNav';
import { FeaturedTemplates } from './FeaturedTemplates';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useMarketplace } from '../../hooks/useMarketplace';
import './MarketplaceHome.css';

interface MarketplaceHomeProps {
  className?: string;
}

export const MarketplaceHome: React.FC<MarketplaceHomeProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'newest' | 'price_asc' | 'price_desc' | 'rating'>('relevance');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

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
  }, []);

  useEffect(() => {
    // Trigger search when filters change
    handleSearch();
  }, [searchQuery, selectedCategory, sortBy, priceFilter]);

  const handleSearch = () => {
    const filters = {
      query: searchQuery || undefined,
      categories: selectedCategory ? [selectedCategory] : undefined,
      sort_by: sortBy,
      is_free: priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
      page: 1,
      limit: 20
    };

    searchTemplates(filters);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleTemplateClick = (templateId: string) => {
    // Navigate to template detail page
    window.location.href = `/marketplace/templates/${templateId}`;
  };

  if (error) {
    return (
      <div className={`marketplace-home error ${className}`}>
        <div className="error-message">
          <h2>Unable to load marketplace</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`marketplace-home ${className}`}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Powerful Prompt Templates</h1>
          <p>Find, preview, and purchase high-quality prompt templates from our community of creators</p>
          
          <SearchBar
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
        {loading && !featuredTemplates.length ? (
          <LoadingSpinner />
        ) : (
          <FeaturedTemplates
            templates={featuredTemplates}
            onTemplateClick={handleTemplateClick}
          />
        )}
      </section>

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
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                />
                All Templates
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  value="free"
                  checked={priceFilter === 'free'}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                />
                Free
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  value="paid"
                  checked={priceFilter === 'paid'}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                />
                Premium
              </label>
            </div>
          </div>

          <div className="filters-section">
            <h3>Sort By</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
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
              {searchQuery ? `Results for "${searchQuery}"` : 
               selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'}` : 
               'All Templates'}
            </h2>
            <span className="results-count">
              {templates.total || 0} templates found
            </span>
          </div>

          {loading && !templates.templates?.length ? (
            <LoadingSpinner />
          ) : (
            <div className="templates-grid">
              {templates.templates?.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateClick(template.id)}
                />
              ))}
            </div>
          )}

          {!loading && templates.templates?.length === 0 && (
            <div className="no-results">
              <h3>No templates found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}

          {/* Load More Button */}
          {templates.has_more && (
            <div className="load-more-section">
              <button 
                onClick={() => {
                  // TODO: Implement pagination
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