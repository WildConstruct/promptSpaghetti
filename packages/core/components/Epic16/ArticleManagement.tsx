/**
 * Epic 16 Article Management System - E16-1753114247073-332A94
 * 
 * Comprehensive system for creating, editing, organizing, and managing knowledge base articles
 * for templates, tutorials, best practices, and marketplace documentation.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PencilIcon, 
  DocumentIcon, 
  FolderIcon, 
  TagIcon, 
  EyeIcon, 
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Type definitions for article management

}
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published' | 'archived' | 'review';
  category: ArticleCategory;
  tags: string;
  author: ArticleAuthor;
  collaborators?: ArticleAuthor;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  bookmarkCount: number;
  readTime: number; // estimated reading time in minutes,
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  attachments?: ArticleAttachment;
  relatedArticles?: string; // IDs of related articles,
  seo: {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}
};
  analytics: {
  averageRating: number;
  ratingCount: number;
  completionRate: number;
  bounceRate: number;
};
}
}
export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  parentId?: string;
  articleCount: number;
}
}
}
export interface ArticleAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'contributor' | 'guest';
  bio?: string;
  socialLinks?: {
  twitter?: string;
  github?: string;
  linkedin?: string;
}
};
}
}
export interface ArticleAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'archive';
  size: number;
  mimeType: string;
}
}
}
export interface ArticleFilter {
  status?: Article['status'][];
  category?: string;
  tags?: string;
  author?: string;
  difficulty?: Article['difficulty'][];
  dateRange?: {
  start: Date;
  end: Date;
}
};
  featured?: boolean;
  searchQuery?: string;
}
}
export interface ArticleSort {
  field: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount' | 'rating';
  direction: 'asc' | 'desc';
  // Props for main ArticleManagement component
}
}
}
export interface ArticleManagementProps {
  articles: Article;
  categories: ArticleCategory;
  currentUser: ArticleAuthor;
  onCreateArticle: (article: Partial<Article>) => Promise<Article>;
  onUpdateArticle: (id: string, article: Partial<Article>) => Promise<Article>;
  onDeleteArticle: (id: string) => Promise<void>;
  onPublishArticle: (id: string) => Promise<void>;
  onArchiveArticle: (id: string) => Promise<void>;
  onDuplicateArticle: (id: string) => Promise<Article>;
  onUploadAttachment: (file: File) => Promise<ArticleAttachment>;
  onCreateCategory: (category: Partial<ArticleCategory>) => Promise<ArticleCategory>;
  onUpdateCategory: (id: string, category: Partial<ArticleCategory>) => Promise<ArticleCategory>;
  className?: string;
  // Article List Component
}
}
export const ArticleList: React.FC<{,
  articles: Article;
  filter: ArticleFilter;
  sort: ArticleSort;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onDuplicate: (article: Article) => void;
  onView: (article: Article) => void;
  currentUser: ArticleAuthor;
}> = ({ articles, filter, sort, onEdit, onDelete, onDuplicate, onView, currentUser }) => {
  const filteredAndSortedArticles = useMemo(() => {
    const filtered = articles.filter(article => {)
  // Apply all filters
      if (filter.status?.length && !filter.status.includes(article.status)) return false;
      if (filter.category?.length && !filter.category.includes(article.category.id)) return false;
      if (filter.tags?.length && !filter.tags.some(tag => article.tags.includes(tag))) return false;
      if (filter.author?.length && !filter.author.includes(article.author.id)) return false;
      if (filter.difficulty?.length && !filter.difficulty.includes(article.difficulty)) return false;
      if (filter.featured !== undefined && article.featured !== filter.featured) return false;
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const searchableText = `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLowerCase();}
        if (!searchableText.includes(query)) return false;
      if (filter.dateRange) {
        const articleDate = new Date(article.createdAt);
        if (articleDate < filter.dateRange.start || articleDate > filter.dateRange.end) return false;
      return true;
    });
    // Apply sorting
    filtered.sort((a, b) => {
  const multiplier = sort.direction === 'asc' ? 1 : -1;
  switch (sort.field) {
  case 'title':,
  return a.title.localeCompare(b.title) * multiplier;
  case 'createdAt':,
  return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
  case 'updatedAt':,
  return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * multiplier;
  case 'publishedAt':,
  const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  return (aDate - bDate) * multiplier;
  case 'viewCount':,
  return (a.viewCount - b.viewCount) * multiplier;
  case 'likeCount':,
  return (a.likeCount - b.likeCount) * multiplier;
  case 'rating':,
  return (a.analytics.averageRating - b.analytics.averageRating) * multiplier;
  default:,
  return 0;
});
    return filtered;
  }, [articles, filter, sort]);
  const getStatusColor = (status: Article['status']) => {
  switch (status) {
  case 'published': return 'bg-green-100 text-green-800';
  case 'draft': return 'bg-gray-100 text-gray-800';
  case 'review': return 'bg-yellow-100 text-yellow-800';
  case 'archived': return 'bg-red-100 text-red-800';
  default: return 'bg-gray-100 text-gray-800';
};
  const getDifficultyColor = (difficulty: Article['difficulty']) => {
  switch (difficulty) {
  case 'beginner': return 'bg-blue-100 text-blue-800';
  case 'intermediate': return 'bg-orange-100 text-orange-800';
  case 'advanced': return 'bg-red-100 text-red-800';
  default: return 'bg-gray-100 text-gray-800';
};
  return;
    <div className="space-y-4">
      {filteredAndSortedArticles.map((article) => ()
        <div
          key={article.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {article.featured && ()
                  <StarIcon className="h-5 w-5 text-yellow-500 fill-current" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                  onClick={() => onView(article)}>
                  {article.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{article.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4" />
                  <span>{article.likeCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>}
                  {article.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>}
                  {article.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {article.category.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag) => ()
                  <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && ()
                  <span className="text-xs text-gray-500">+{article.tags.length - 3} more</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onView(article)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="View Article"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              {(currentUser.role === 'admin' || currentUser.id === article.author.id) && ()
                <>
                  <button
                    onClick={() => onEdit(article)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Article"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDuplicate(article)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Duplicate Article"
                  >
                    <DocumentIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(article)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete Article"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      {filteredAndSortedArticles.length === 0 && ()
        <div className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No articles found</p>
          <p className="text-gray-400">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
};

// Article Editor Component
export const ArticleEditor: React.FC<{
  article?: Article;
  categories: ArticleCategory;
  onSave: (article: Partial<Article>) => Promise<void>;
  onCancel: () => void;
  onUploadAttachment: (file: File) => Promise<ArticleAttachment>;
}> = ({ article, categories, onSave, onCancel, onUploadAttachment }) => {
  const [formData, setFormData] = useState<Partial<Article>>(() => ({)
  title: article?.title || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    status: article?.status || 'draft',
    category: article?.category || categories[0],
    tags: article?.tags || [],
    difficulty: article?.difficulty || 'beginner',
    featured: article?.featured || false,
    seo: article?.seo || {},
    ...article
  }));
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const handleInputChange = useCallback((field: string, value: Error) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  const handleAddTag = useCallback(() => {
  if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
  setFormData(prev => ({)
  ...prev,
  tags: [...(prev.tags || []), newTag.trim()],
}));
      setNewTag('');
  }, [newTag, formData.tags]);
  const handleRemoveTag = useCallback((tagToRemove: string) => {
  setFormData(prev => ({)
  ...prev,
  tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
}));
  }, []);
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
  }, [formData, onSave]);
  return;
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {article ? 'Edit Article' : 'Create New Article'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.title?.trim()}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : (article ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter article title..."
          />
        </div>
        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt || ''}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the article..."
          />
        </div>
        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={formData.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your article content here... (Supports Markdown)"
          />
        </div>
        {/* Meta fields row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category?.id || ''}
              onChange={(e) => {
                const category = categories.find(c => c.id === e.target.value);
                handleInputChange('category', category);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => ()
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty || 'beginner'}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status || 'draft'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags?.map((tag) => ()
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tag..."
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
        {/* Featured toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured || false}
            onChange={(e) => handleInputChange('featured', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
            Feature this article
          </label>
        </div>
      </div>
    </div>
  );
};

// Main ArticleManagement Component
export const ArticleManagement: React.FC<ArticleManagementProps> = ({)
  articles,
  categories,
  currentUser,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  onPublishArticle,
  onArchiveArticle,
  onDuplicateArticle,
  onUploadAttachment,
  onCreateCategory,
  onUpdateCategory,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'categories'>('list');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [filter, setFilter] = useState<ArticleFilter>({});
  const [sort, setSort] = useState<ArticleSort>({ field: 'updatedAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  // Apply search query to filter
  useEffect(() => {
    setFilter(prev => ({ ...prev, searchQuery: searchQuery.trim() || undefined }));
  }, [searchQuery]);
  const handleCreateNew = useCallback(() => {
    setEditingArticle(null);
    setActiveTab('editor');
  }, []);
  const handleEdit = useCallback((article: Article) => {
    setEditingArticle(article);
    setActiveTab('editor');
  }, []);
  const handleSaveArticle = useCallback(async (articleData: Partial<Article>) => {
    try {
      if (editingArticle) {
        await onUpdateArticle(editingArticle.id, articleData);
      } else {
        await onCreateArticle(articleData);
      setActiveTab('list');
      setEditingArticle(null);
    } catch (error) {
  console.error('Failed to save article:', error);
  // Handle error (show toast, etc.)
}, [editingArticle, onCreateArticle, onUpdateArticle]);
  const handleCancel = useCallback(() => {
    setActiveTab('list');
    setEditingArticle(null);
  }, []);
  const handleView = useCallback((article: Article) => {
  // Navigate to article view or open preview modal
  console.log('View article:', article);
}, []);
  const handleDelete = useCallback(async (article: Article) => {
    if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {}
      try {
        await onDeleteArticle(article.id);
      } catch (error) {
  console.error('Failed to delete article:', error);
}, [onDeleteArticle]);
  const handleDuplicate = useCallback(async (article: Article) => {
    try {
      const duplicated = await onDuplicateArticle(article.id);
      setEditingArticle(duplicated);
      setActiveTab('editor');
    } catch (error) {
  console.error('Failed to duplicate article:', error);
}, [onDuplicateArticle]);
  return;
    <div className={`bg-gray-50 min-h-screen ${className}`}>}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base Management</h1>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
            >
              <PlusIcon className="h-5 w-5" />
              New Article
            </button>
          </div>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'list'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
              >
                Articles ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'categories'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
              >
                Categories ({categories.length})
              </button>
            </nav>
          </div>
        </div>
        {/* Content */}
        {activeTab === 'list' && ()
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Sort dropdown */}
                <select
                  value={`${sort.field}-${sort.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-') as [ArticleSort['field'], ArticleSort['direction']];
                    setSort({ field, direction });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updatedAt-desc">Recently Updated</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="viewCount-desc">Most Viewed</option>
                  <option value="likeCount-desc">Most Liked</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
              {/* Quick filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(prev => ({ ...prev, status: prev.status?.includes('published') ? undefined : ['published'] }))}
                  className={`px-3 py-1 rounded-full text-sm border ${
  filter.status?.includes('published')
  ? 'bg-green-100 text-green-800 border-green-300'
  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
}`}
                >
                  Published
                </button>
                <button
                  onClick={() => setFilter(prev => ({ ...prev, featured: prev.featured === true ? undefined : true }))}
                  className={`px-3 py-1 rounded-full text-sm border ${
  filter.featured === true
  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
}`}
                >
                  Featured
                </button>
                <button
                  onClick={() => setFilter(prev => ({ ...prev, author: prev.author?.includes(currentUser.id) ? undefined : [currentUser.id] }))}
                  className={`px-3 py-1 rounded-full text-sm border ${
  filter.author?.includes(currentUser.id)
  ? 'bg-blue-100 text-blue-800 border-blue-300'
  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
}`}
                >
                  My Articles
                </button>
              </div>
            </div>
            <ArticleList
              articles={articles}
              filter={filter}
              sort={sort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onView={handleView}
              currentUser={currentUser}
            />
          </>
        )}
        {activeTab === 'editor' && ()
          <ArticleEditor
            article={editingArticle || undefined}
            categories={categories}
            onSave={handleSaveArticle}
            onCancel={handleCancel}
            onUploadAttachment={onUploadAttachment}
          />
        )}
        {activeTab === 'categories' && ()
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Article Categories</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md">
                <PlusIcon className="h-5 w-5" />
                New Category
              </button>
            </div>
            <div className="space-y-4">
              {categories.map((category) => ()
                <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{category.articleCount} articles</span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleManagement;