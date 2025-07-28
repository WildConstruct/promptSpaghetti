import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Clock, 
  Users,
  Grid,
  List,
  SortAsc,
  Tag
} from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { TemplatePreview } from './TemplatePreview';
import { TemplateCreationDialog } from './TemplateCreationDialog';
import { useTemplates } from '../../hooks/useTemplates';
import { ProjectTemplate, TemplateCategory, TemplateDifficulty } from '../../types/TemplateTypes';
interface TemplateGalleryProps {
  workspaceId?: string;
  onSelectTemplate?: (template: ProjectTemplate) => void;
  onCreateFromTemplate?: (template: ProjectTemplate, customization: Record<string, any>) => void;
  className?: string;
  showCreateButton?: boolean;
  allowCreation?: boolean;
  viewMode?: 'grid' | 'list';
}
const TemplateGallery: React.FC<TemplateGalleryProps> = ({ )
  workspaceId,
  onSelectTemplate,
  onCreateFromTemplate,
  className,
  showCreateButton = true,
  allowCreation = true,
  viewMode = 'grid'
}) => {
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<TemplateDifficulty | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const {
    templates,
    categories,
    loading,
    error,
    stats,
    hasMore,
    favoriteTemplate,
    unfavoriteTemplate,
    loadMore,
    refreshTemplates
  } = useTemplates({)
    workspaceId,
    searchTerm,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter,
    sortBy,
    limit: viewMode === 'grid' ? 12 : 20,
  });
  const handleTemplateSelect = useCallback((template: ProjectTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      setSelectedTemplate(template);
    }
  }, [onSelectTemplate]);
  const handleCreateFromTemplate = useCallback((template: ProjectTemplate, customization: Record<string, any>) => {
    if (onCreateFromTemplate) {
      onCreateFromTemplate(template, customization);
    }
    setSelectedTemplate(null);
  }, [onCreateFromTemplate]);
  const handleToggleFavorite = useCallback(async (templateId: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        await unfavoriteTemplate(templateId);
      } else {
        await favoriteTemplate(templateId);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [favoriteTemplate, unfavoriteTemplate]);
  const renderTemplateGrid = () => (;);
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map(template => ()
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={handleTemplateSelect}
          onToggleFavorite={handleToggleFavorite}
          compact={false}
        />
      ))}
    </div>
  );
  const renderTemplateList = () => (;);
    <div className="space-y-4">
      {templates.map(template => ()
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={handleTemplateSelect}
          onToggleFavorite={handleToggleFavorite}
          compact={true}
        />
      ))}
    </div>
  );
  return ();
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>}
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Template Gallery</h2>
              {stats && ()
                <p className="text-sm text-gray-500">
                  {stats.total} templates available
                  {workspaceId && ` • ${stats.workspace_templates || 0} workspace templates`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            {/* Create Template Button */}
            {showCreateButton && allowCreation && ()
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            )}
          </div>
        </div>
        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              {(categoryFilter !== 'all' || difficultyFilter !== 'all') && ()
                <div className="flex items-center space-x-2">
                  {categoryFilter !== 'all' && ()
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {categoryFilter}
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {difficultyFilter !== 'all' && ()
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {difficultyFilter}
                      <button
                        onClick={() => setDifficultyFilter('all')}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="name">Name</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
          {/* Expanded Filters */}
          {showFilters && ()
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => ()
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {loading && templates.length === 0 && ()
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => ()
                  <div key={i} className="bg-gray-200 rounded-lg h-48" />
                ))}
              </div>
            </div>
          </div>
        )}
        {error && ()
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading templates: {error.message}</p>
            <button
              onClick={refreshTemplates}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && templates.length === 0 && ()
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first template'
              }
            </p>
            {allowCreation && ()
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Create First Template</span>
              </button>
            )}
          </div>
        )}
        {!loading && !error && templates.length > 0 && ()
          <>
            {viewMode === 'grid' ? renderTemplateGrid() : renderTemplateList()}
            {/* Load More */}
            {hasMore && ()
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  {loading ? ()
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : ()
                    <>
                      <Download className="w-4 h-4" />
                      <span>Load More Templates</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Template Preview Modal */}
      {selectedTemplate && ()
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      )}
      {/* Template Creation Dialog */}
      {showCreateDialog && ()
        <TemplateCreationDialog
          workspaceId={workspaceId}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={(template) => {
            setShowCreateDialog(false);
            refreshTemplates();
          }}
        />
      )}
    </div>
  );
};

export default TemplateGallery;