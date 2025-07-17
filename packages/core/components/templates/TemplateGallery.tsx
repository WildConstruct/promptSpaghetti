/**
 * Epic 9.2.6 - Template Gallery UI Component
 * Displays and manages project templates with search, filtering, and preview
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ProjectTemplate, TemplateCategory, ProjectTemplateManager } from '../../templates/ProjectTemplateManager';

interface TemplateGalleryProps {
  templateManager: ProjectTemplateManager;
  onTemplateSelect: (template: ProjectTemplate, customizations: Record<string, any>) => void;
  onTemplatePreview: (template: ProjectTemplate) => void;
  className?: string;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templateManager,
  onTemplateSelect,
  onTemplatePreview,
  className = ''
}) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [complexityFilter, setComplexityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'newest' | 'name'>('popularity');
  const [featuredTemplates, setFeaturedTemplates] = useState<ProjectTemplate[]>([]);

  useEffect(() => {
    loadTemplates();
    loadCategories();
    loadFeaturedTemplates();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [searchQuery, selectedCategory, complexityFilter, sortBy]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await templateManager.searchTemplates({
        query: searchQuery || undefined,
        category: selectedCategory || undefined,
        complexity: complexityFilter || undefined,
        sort_by: sortBy,
        limit: 50
      });
      setTemplates(result.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = templateManager.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadFeaturedTemplates = async () => {
    try {
      const featured = await templateManager.getFeaturedTemplates();
      setFeaturedTemplates(featured);
    } catch (error) {
      console.error('Failed to load featured templates:', error);
    }
  };

  const handleTemplateUse = (template: ProjectTemplate) => {
    // For now, pass empty customizations - this could open a customization dialog
    onTemplateSelect(template, {});
  };

  const filteredTemplates = useMemo(() => {
    if (!searchQuery && !selectedCategory && !complexityFilter) {
      return templates;
    }
    return templates;
  }, [templates, searchQuery, selectedCategory, complexityFilter]);

  const complexityColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`template-gallery ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Templates</h2>
        <p className="text-gray-600">Choose from pre-built templates to accelerate your workflow</p>
      </div>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTemplates.slice(0, 3).map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => handleTemplateUse(template)}
                onPreview={() => onTemplatePreview(template)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select
            value={complexityFilter}
            onChange={(e) => setComplexityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => handleTemplateUse(template)}
              onPreview={() => onTemplatePreview(template)}
            />
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or browse different categories.</p>
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: ProjectTemplate;
  onUse: () => void;
  onPreview: () => void;
  featured?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse, onPreview, featured = false }) => {
  const complexityColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border ${featured ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      {featured && (
        <div className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg">
          Featured
        </div>
      )}
      
      {/* Preview Image */}
      <div className="h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
        {template.preview_image ? (
          <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover rounded-t-lg" />
        ) : (
          <div className="text-gray-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${complexityColors[template.complexity_level]}`}>
            {template.complexity_level}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {template.rating.toFixed(1)}
            </span>
            <span>{template.usage_count} uses</span>
          </div>
          <span>{template.estimated_time}m</span>
        </div>

        {/* Author */}
        <div className="flex items-center mb-4">
          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            {template.author.avatar ? (
              <img src={template.author.avatar} alt={template.author.name} className="h-6 w-6 rounded-full" />
            ) : (
              <span className="text-xs text-gray-600">{template.author.name[0]}</span>
            )}
          </div>
          <span className="text-xs text-gray-600">{template.author.name}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onPreview}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={onUse}
            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};