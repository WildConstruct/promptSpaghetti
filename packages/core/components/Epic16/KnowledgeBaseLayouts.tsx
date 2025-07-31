/**
 * Epic 16 Knowledge Base UI Layouts - E16-1753114247069-7900C5
 * 
 * Professional UI layouts for displaying knowledge content, articles, guides, and documentation
 * with excellent UX for discovery and reading across the template marketplace ecosystem.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { 
  DocumentIcon,
  BookOpenIcon,
  AcademicCapIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  TagIcon,
  UserIcon,
  StarIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  CheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

// Import article types from ArticleManagement
import type { Article, ArticleCategory, ArticleAuthor } from './ArticleManagement';

// Additional types for knowledge base layouts

}
export interface KnowledgeBaseSection {
  id: string;
  title: string;
  description: string;
}
  icon: React.ComponentType<{ className?: string }>;
  articles: Article;
  color: string;
  featured: boolean;
}
}
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes,
  steps: LearningPathStep;
  prerequisites?: string;
  completionRate: number; // percentage of users who complete,
  enrolledCount: number;
  completedCount: number;
  tags: string;
  author: ArticleAuthor;
  createdAt: Date;
  updatedAt: Date;
}
}
}
export interface LearningPathStep {
  id: string;
  title: string;
  type: 'article' | 'video' | 'quiz' | 'exercise' | 'template';
  resourceId: string; // ID of the actual resource,
  estimatedTime: number;
  required: boolean;
  completed?: boolean;
  order: number;
}
}
}
export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'article' | 'learning-path' | 'template' | 'tutorial';
  url: string;
  relevanceScore: number;
  category: string;
  tags: string;
  matchedTerms: string;
}
}
}
export interface KnowledgeBaseStats {
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  totalAuthors: number;
  recentlyUpdated: Article;
  popularArticles: Article;
  featuredContent: Article;
  // Props for different layout components
}
}
}
export interface KnowledgeBaseHeroProps {
  stats: KnowledgeBaseStats;
  onSearch: (query: string) => void;
  onBrowseCategory: (categoryId: string) => void;
  featuredSections: KnowledgeBaseSection;
}
}
}
export interface ArticleCardProps {
  article: Article;
  variant?: 'compact' | 'detailed' | 'featured' | 'list';
  showAuthor?: boolean;
  showCategory?: boolean;
  showStats?: boolean;
  showExcerpt?: boolean;
  onClick?: (article: Article) => void;
  onBookmark?: (article: Article) => void;
  onLike?: (article: Article) => void;
  onShare?: (article: Article) => void;
  className?: string;
}
}
}
export interface CategoryBrowserProps {
  categories: ArticleCategory;
  onSelectCategory: (category: ArticleCategory) => void;
  layout?: 'grid' | 'list' | 'tree';
  showArticleCount?: boolean;
}
}
}
export interface LearningPathCardProps {
  learningPath: LearningPath;
  variant?: 'compact' | 'detailed';
  showProgress?: boolean;
  currentUserProgress?: number; // percentage completed,
  onClick?: (path: LearningPath) => void;
  onEnroll?: (path: LearningPath) => void;
  // Hero Section Component
}
}
export const KnowledgeBaseHero: React.FC<KnowledgeBaseHeroProps> = ({)
  stats,
  onSearch,
  onBrowseCategory,
  featuredSections
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchSubmit = (e: React.FormEvent) => {,
  e.preventDefault();
  if (searchQuery.trim()) {
  onSearch(searchQuery.trim());
};
  return;
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Knowledge Base
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover comprehensive guides, tutorials, and best practices for prompt engineering,
            template creation, and marketplace success.
          </p>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="h-6 w-6 absolute left-4 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, tutorials..."
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </form>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
              <div className="text-sm text-gray-600">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalCategories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalAuthors}</div>
              <div className="text-sm text-gray-600">Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{(stats.totalViews / 1000).toFixed(1)}k</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
          </div>
        </div>
        {/* Featured Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSections.map((section) => ()
            <div
              key={section.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onBrowseCategory(section.id)}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg bg-${section.color}-100`}>}
                  <section.icon className={`h-6 w-6 text-${section.color}-600`} />}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{section.articles.length} articles</span>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Article Card Component with multiple variants
export const ArticleCard: React.FC<ArticleCardProps> = ({)
  article,
  variant = 'detailed',
  showAuthor = true,
  showCategory = true,
  showStats = true,
  showExcerpt = true,
  onClick,
  onBookmark,
  onLike,
  onShare,
  className = ''
}) => {
  const handleCardClick = useCallback(() => {
    onClick?.(article);
  }, [onClick, article]);
  const getDifficultyColor = (difficulty: Article['difficulty']) => {
  switch (difficulty) {
  case 'beginner': return 'bg-green-100 text-green-800';
  case 'intermediate': return 'bg-yellow-100 text-yellow-800';
  case 'advanced': return 'bg-red-100 text-red-800';
  default: return 'bg-gray-100 text-gray-800';
};
  if (variant === 'compact') {
    return;
      <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}>}
        <div onClick={handleCardClick}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 flex-1 pr-2">{article.title}</h3>
            {article.featured && <StarIcon className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />}
          </div>
          {showCategory && ()
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {article.category.name}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(article.difficulty)}`}>}
                {article.difficulty}
              </span>
            </div>
          )}
          {showStats && ()
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>{article.readTime}m</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                <span>{article.viewCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  if (variant === 'list') {
    return;
      <div className={`bg-white border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer ${className}`}>}
        <div onClick={handleCardClick} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {article.featured && <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />}
              <h3 className="font-medium text-gray-900">{article.title}</h3>
            </div>
            {showExcerpt && ()
              <p className="text-gray-600 text-sm line-clamp-1 mb-2">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {showAuthor && ()
                <div className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  <span>{article.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>{article.readTime}m read</span>
              </div>
              {showStats && ()
                <>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    <span>{article.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-3 w-3" />
                    <span>{article.likeCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {showCategory && ()
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {article.category.name}
              </span>
            )}
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  if (variant === 'featured') {
    return;
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-yellow-600">Featured</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">{article.analytics.averageRating.toFixed(1)}</span>
              <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
          </div>
          <div onClick={handleCardClick} className="cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
              {article.title}
            </h3>
            {showExcerpt && ()
              <p className="text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
            )}
          </div>
          <div className="flex items-center justify-between mb-4">
            {showAuthor && ()
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{article.author.name}</div>
                  <div className="text-xs text-gray-500">{article.author.role}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{article.readTime}m</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                <span>{article.viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showCategory && ()
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {article.category.name}
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(article.difficulty)}`}>}
                {article.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onBookmark && ()
                <button
                  onClick={(e) => { e.stopPropagation(); onBookmark(article); }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <BookmarkIcon className="h-4 w-4" />
                </button>
              )}
              {onLike && ()
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(article); }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <HeartIcon className="h-4 w-4" />
                </button>
              )}
              {onShare && ()
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(article); }}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  // Default detailed variant
  return;
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>}
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 flex-1 pr-4">
            {article.title}
          </h3>
          {article.featured && <StarIcon className="h-5 w-5 text-yellow-500 fill-current" />}
        </div>
        {showExcerpt && ()
          <p className="text-gray-600 line-clamp-2 mb-4">{article.excerpt}</p>
        )}
      </div>
      <div className="flex items-center justify-between mb-4">
        {showAuthor && ()
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{article.author.name}</div>
              <div className="text-xs text-gray-500">
                {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
        {showStats && ()
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{article.readTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{article.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              <span>{article.likeCount}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showCategory && ()
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {article.category.name}
            </span>
          )}
          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(article.difficulty)}`}>}
            {article.difficulty}
          </span>
          {article.tags.slice(0, 2).map(tag => ()
            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {onBookmark && ()
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(article); }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <BookmarkIcon className="h-4 w-4" />
            </button>
          )}
          {onLike && ()
            <button
              onClick={(e) => { e.stopPropagation(); onLike(article); }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <HeartIcon className="h-4 w-4" />
            </button>
          )}
          {onShare && ()
            <button
              onClick={(e) => { e.stopPropagation(); onShare(article); }}
              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Browser Component
export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({)
  categories,
  onSelectCategory,
  layout = 'grid',
  showArticleCount = true
}) => {
  if (layout === 'list') {
    return;
      <div className="space-y-2">
        {categories.map((category) => ()
          <div
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showArticleCount && ()
                <span className="text-sm text-gray-500">{category.articleCount}</span>
              )}
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    );
  // Grid layout (default)
  return;
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => ()
        <div
          key={category.id}
          onClick={() => onSelectCategory(category)}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-6 h-6 rounded-lg"
              style={{ backgroundColor: category.color }}
            />
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
          <div className="flex items-center justify-between">
            {showArticleCount && ()
              <span className="text-sm text-gray-500">{category.articleCount} articles</span>
            )}
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Learning Path Card Component
export const LearningPathCard: React.FC<LearningPathCardProps> = ({)
  learningPath,
  variant = 'detailed',
  showProgress = true,
  currentUserProgress = 0,
  onClick,
  onEnroll
}) => {
  const getDifficultyColor = (difficulty: LearningPath['difficulty']) => {,
  switch (difficulty) {
  case 'beginner': return 'bg-green-100 text-green-800';
  case 'intermediate': return 'bg-yellow-100 text-yellow-800';
  case 'advanced': return 'bg-red-100 text-red-800';
  default: return 'bg-gray-100 text-gray-800';
};
  const completedSteps = learningPath.steps.filter(step => step.completed).length;
  const progressPercentage = currentUserProgress || (completedSteps / learningPath.steps.length) * 100;
  if (variant === 'compact') {
    return;
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div onClick={() => onClick?.(learningPath)}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{learningPath.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{learningPath.description}</p>
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(learningPath.difficulty)}`}>}
              {learningPath.difficulty}
            </span>
            <span className="text-sm text-gray-500">{learningPath.estimatedTime}m</span>
          </div>
          {showProgress && ()
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  // Detailed variant
  return;
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div onClick={() => onClick?.(learningPath)} className="cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Learning Path</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(learningPath.difficulty)}`}>}
            {learningPath.difficulty}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
          {learningPath.title}
        </h3>
        <p className="text-gray-600 line-clamp-3 mb-4">{learningPath.description}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          <span>{learningPath.estimatedTime}m</span>
        </div>
        <div className="flex items-center gap-1">
          <DocumentIcon className="h-4 w-4" />
          <span>{learningPath.steps.length} steps</span>
        </div>
        <div className="flex items-center gap-1">
          <UserIcon className="h-4 w-4" />
          <span>{learningPath.enrolledCount} enrolled</span>
        </div>
      </div>
      {showProgress && ()
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <span>Your Progress</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {completedSteps} of {learningPath.steps.length} steps completed
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {learningPath.tags.slice(0, 3).map(tag => ()
            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {progressPercentage === 0 && onEnroll && ()
            <button
              onClick={(e) => { e.stopPropagation(); onEnroll(learningPath); }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Enroll
            </button>
          )}
          {progressPercentage > 0 && progressPercentage < 100 && ()
            <button
              onClick={() => onClick?.(learningPath)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Continue
            </button>
          )}
          {progressPercentage === 100 && ()
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
              <CheckIcon className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Knowledge Base Layout Component

}
export interface KnowledgeBaseLayoutProps {
  articles: Article;
  categories: ArticleCategory;
  learningPaths?: LearningPath;
  stats: KnowledgeBaseStats;
  layout?: 'grid' | 'list' | 'masonry';
  onSearch: (query: string) => void;
  onSelectCategory: (category: ArticleCategory) => void;
  onSelectArticle: (article: Article) => void;
  onSelectLearningPath?: (path: LearningPath) => void;
  className?: string;
}
}
export const KnowledgeBaseLayout: React.FC<KnowledgeBaseLayoutProps> = ({)
  articles,
  categories,
  learningPaths = [],
  stats,
  layout = 'grid',
  onSearch,
  onSelectCategory,
  onSelectArticle,
  onSelectLearningPath,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout === 'list' ? 'list' : 'grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const featuredSections: KnowledgeBaseSection = useMemo(() => [
  {
  id: 'getting-started',
  title: 'Getting Started',
  description: 'Essential guides for new users',
  icon: PlayIcon,
  articles: articles.filter(a => a.tags.includes('getting-started')),
  color: 'blue',
  featured: true,
}
    {
  id: 'templates',
  title: 'Template Creation',
  description: 'Learn to create effective templates',
  icon: DocumentIcon,
  articles: articles.filter(a => a.category.slug === 'templates'),
  color: 'green',
  featured: true,
}
    {
  id: 'best-practices',
  title: 'Best Practices',
  description: 'Proven strategies and techniques',
  icon: LightBulbIcon,
  articles: articles.filter(a => a.tags.includes('best-practices')),
  color: 'purple',
  featured: true,
}
    {
  id: 'advanced',
  title: 'Advanced Topics',
  description: 'Deep dives for experienced users',
  icon: AcademicCapIcon,
  articles: articles.filter(a => a.difficulty === 'advanced'),
  color: 'orange',
  featured: true], [articles]);
  const filteredArticles = useMemo(() => {
  if (!selectedCategory) return articles;
  return articles.filter(article => article.category.id === selectedCategory);
}, [articles, selectedCategory]);
  return;
    <div className={`min-h-screen bg-gray-50 ${className}`}>}
      {/* Hero Section */}
      <KnowledgeBaseHero
        stats={stats}
        onSearch={onSearch}
        onBrowseCategory={(categoryId) => setSelectedCategory(categoryId)}
        featuredSections={featuredSections}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        {selectedCategory && ()
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="hover:text-blue-600"
            >
              Knowledge Base
            </button>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900">
              {categories.find(c => c.id === selectedCategory)?.name}
            </span>
          </div>
        )}
        {!selectedCategory ? ()
          <>
            {/* Featured Content */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.featuredContent.slice(0, 4).map((article) => ()
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="featured"
                    onClick={onSelectArticle}
                  />
                ))}
              </div>
            </section>
            {/* Learning Paths */}
            {learningPaths.length > 0 && ()
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Paths</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningPaths.slice(0, 6).map((path) => ()
                    <LearningPathCard
                      key={path.id}
                      learningPath={path}
                      onClick={onSelectLearningPath}
                    />
                  ))}
                </div>
              </section>
            )}
            {/* Categories */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <CategoryBrowser
                categories={categories}
                onSelectCategory={(category) => setSelectedCategory(category.id)}
                layout="grid"
              />
            </section>
            {/* Recent Articles */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Updated</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.recentlyUpdated.slice(0, 6).map((article) => ()
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="detailed"
                    onClick={onSelectArticle}
                  />
                ))}
              </div>
            </section>
          </>
        ) : ()
          <>
            {/* Category View */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-gray-600">
                  {categories.find(c => c.id === selectedCategory)?.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Articles in Category */}
            {viewMode === 'grid' ? ()
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => ()
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="detailed"
                    onClick={onSelectArticle}
                  />
                ))}
              </div>
            ) : ()
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {filteredArticles.map((article) => ()
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="list"
                    onClick={onSelectArticle}
                  />
                ))}
              </div>
            )}
            {filteredArticles.length === 0 && ()
              <div className="text-center py-12">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No articles in this category yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseLayout;