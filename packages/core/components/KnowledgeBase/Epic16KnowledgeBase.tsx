/**
 * Epic 16 Knowledge Base Integration
 * 
 * Main integration component that brings together the knowledge base
 * search, article viewing, and management capabilities for Epic 16
 * Marketplace & Community features.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  KnowledgeBaseArticle,
  KnowledgeCategory,
  ArticleType,
  Epic16KnowledgeBaseService
} from '../../services/Epic16KnowledgeBaseService';
import { KnowledgeBaseSearch } from './KnowledgeBaseSearch';
import { KnowledgeBaseArticleViewer } from './KnowledgeBaseArticleViewer';

interface Epic16KnowledgeBaseProps {
  userId: string;
  userRole: 'user' | 'creator' | 'admin';
  initialView?: 'search' | 'browse' | 'article';
  initialArticleId?: string;
  onAnalytics?: (analytics: unknown) => void;
}

interface KnowledgeBaseState {
  currentView: 'search' | 'browse' | 'article';
  selectedArticle: KnowledgeBaseArticle | null;
  popularArticles: KnowledgeBaseArticle[];
  recentArticles: KnowledgeBaseArticle[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: KnowledgeCategory | null;
}

export const Epic16KnowledgeBase: React.FC<Epic16KnowledgeBaseProps> = ({
  userId,
  userRole,
  initialView = 'search',
  initialArticleId,
  onAnalytics
}) => {
  // Service initialization
  const knowledgeService = useMemo(() => new Epic16KnowledgeBaseService(), []);
  
  // State management
  const [kbState, setKbState] = useState<KnowledgeBaseState>({
    currentView: initialView,
    selectedArticle: null,
    popularArticles: [],
    recentArticles: [],
    loading: true,
    error: null,
    searchQuery: '',
    selectedCategory: null
  });

  // Initialize knowledge base data
  useEffect(() => {
    const initializeKnowledgeBase = async () => {
      setKbState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Create sample articles for demonstration
        await createSampleArticles(knowledgeService);

        // Load popular and recent articles
        const [popularArticles, recentArticles] = await Promise.all([
          knowledgeService.getPopularArticles(undefined, 6),
          knowledgeService.getRecentArticles(6)
        ]);

        setKbState(prev => ({
          ...prev,
          popularArticles,
          recentArticles,
          loading: false
        }));

        // Load initial article if specified
        if (initialArticleId) {
          const article = await knowledgeService.getArticle(initialArticleId, userId);
          if (article) {
            setKbState(prev => ({
              ...prev,
              selectedArticle: article,
              currentView: 'article'
            }));
          }
        }

        // Set up analytics tracking
        knowledgeService.on('searchPerformed', (data) => {
          onAnalytics?.({
            type: 'knowledge_base_search',
            query: data.query,
            results: data.results,
            userId: data.userId
          });
        });

        knowledgeService.on('articleViewed', (data) => {
          onAnalytics?.({
            type: 'knowledge_base_article_view',
            articleId: data.articleId,
            userId: data.userId,
            analytics: data.analytics
          });
        });

      } catch (error) {
        setKbState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize knowledge base',
          loading: false
        }));
      }
    };

    initializeKnowledgeBase();

    // Cleanup
    return () => {
      knowledgeService.removeAllListeners();
    };
  }, [knowledgeService, userId, initialArticleId, onAnalytics]);

  // Handle article selection
  const handleArticleSelect = useCallback(async (articleId: string) => {
    try {
      setKbState(prev => ({ ...prev, loading: true }));
      
      const article = await knowledgeService.getArticle(articleId, userId);
      if (article) {
        setKbState(prev => ({
          ...prev,
          selectedArticle: article,
          currentView: 'article',
          loading: false
        }));
      } else {
        setKbState(prev => ({
          ...prev,
          error: 'Article not found',
          loading: false
        }));
      }
    } catch (error) {
      setKbState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load article',
        loading: false
      }));
    }
  }, [knowledgeService, userId]);

  // Handle search performed
  const handleSearchPerformed = useCallback((query: string, _____resultCount: number) => {
    setKbState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: KnowledgeCategory) => {
    setKbState(prev => ({ ...prev, selectedCategory: category, currentView: 'browse' }));
  }, []);

  // Handle back to search
  const handleBackToSearch = useCallback(() => {
    setKbState(prev => ({
      ...prev,
      currentView: 'search',
      selectedArticle: null,
      selectedCategory: null
    }));
  }, []);

  // Format category name
  const formatCategoryName = useCallback((category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((category: KnowledgeCategory) => {
    const icons: Record<KnowledgeCategory, string> = {
      [KnowledgeCategory.GETTING_STARTED]: '🚀',
      [KnowledgeCategory.MARKETPLACE_GUIDE]: '🏪',
      [KnowledgeCategory.TEMPLATE_CREATION]: '🎨',
      [KnowledgeCategory.SELLING_BUYING]: '💰',
      [KnowledgeCategory.COMMUNITY_HELP]: '👥',
      [KnowledgeCategory.TECHNICAL_DOCS]: '⚙️',
      [KnowledgeCategory.API_REFERENCE]: '📝',
      [KnowledgeCategory.TROUBLESHOOTING]: '🔧',
      [KnowledgeCategory.BEST_PRACTICES]: '✨',
      [KnowledgeCategory.POLICIES_LEGAL]: '📋',
      [KnowledgeCategory.BILLING_PAYMENTS]: '💳',
      [KnowledgeCategory.ACCOUNT_SECURITY]: '🔒',
      [KnowledgeCategory.INTEGRATIONS]: '🔗',
      [KnowledgeCategory.MOBILE_APP]: '📱',
      [KnowledgeCategory.ADVANCED_FEATURES]: '🎯'
    };
    return icons[category] || '📄';
  }, []);

  // Render loading state
  if (kbState.loading && !kbState.selectedArticle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading knowledge base...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (kbState.error && !kbState.selectedArticle) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Knowledge Base Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{kbState.error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="epic16-knowledge-base h-full">
      {kbState.currentView === 'search' && (
        <div>
          <KnowledgeBaseSearch
            knowledgeService={knowledgeService}
            userId={userId}
            onArticleSelect={handleArticleSelect}
            onSearchPerformed={handleSearchPerformed}
          />

          {/* Featured Content */}
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Browse by Category */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.values(KnowledgeCategory).map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
                    <div className="text-sm font-medium text-gray-900 text-center">
                      {formatCategoryName(category)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Popular Articles</h2>
                <button
                  onClick={() => setKbState(prev => ({ ...prev, currentView: 'browse' }))}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kbState.popularArticles.map(article => (
                  <div
                    key={article.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleArticleSelect(article.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatCategoryName(article.category)}
                      </span>
                      <span className="text-xs text-gray-500">{article.views} views</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{article.estimatedReadTime} min read</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(article.ratings.reduce((sum, r) => sum + r.rating, 0) / article.ratings.length || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Articles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Updated</h2>
              <div className="space-y-4">
                {kbState.recentArticles.map(article => (
                  <div
                    key={article.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleArticleSelect(article.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Updated
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {article.excerpt || article.content.substring(0, 200) + '...'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {formatCategoryName(article.category)}
                          </span>
                          <span>{article.estimatedReadTime} min read</span>
                          <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(article.ratings.reduce((sum, r) => sum + r.rating, 0) / article.ratings.length || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">{article.views} views</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {kbState.currentView === 'article' && kbState.selectedArticle && (
        <KnowledgeBaseArticleViewer
          article={kbState.selectedArticle}
          knowledgeService={knowledgeService}
          userId={userId}
          onArticleSelect={handleArticleSelect}
          onClose={handleBackToSearch}
        />
      )}

      {kbState.currentView === 'browse' && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {kbState.selectedCategory 
                  ? `${formatCategoryName(kbState.selectedCategory)} Articles`
                  : 'Browse All Articles'
                }
              </h1>
              <p className="text-gray-600 mt-2">
                Find comprehensive guides, tutorials, and documentation
              </p>
            </div>
            
            <button
              onClick={handleBackToSearch}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Back to Search
            </button>
          </div>

          {/* Articles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(kbState.selectedCategory 
              ? [...kbState.popularArticles, ...kbState.recentArticles].filter(article => article.category === kbState.selectedCategory)
              : [...kbState.popularArticles, ...kbState.recentArticles]
            ).map(article => (
              <div
                key={article.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleArticleSelect(article.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatCategoryName(article.category)}
                  </span>
                  <span className="text-xs text-gray-500">{article.views} views</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt || article.content.substring(0, 150) + '...'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.estimatedReadTime} min read</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(article.ratings.reduce((sum, r) => sum + r.rating, 0) / article.ratings.length || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to create sample articles
async function createSampleArticles(knowledgeService: Epic16KnowledgeBaseService) {
  const sampleArticles = [
    {
      title: 'Getting Started with the Marketplace',
      slug: 'getting-started-marketplace',
      content: 'Welcome to our marketplace! This comprehensive guide will walk you through everything you need to know to start buying and selling templates effectively.',
      excerpt: 'Learn the basics of navigating and using our marketplace platform.',
      category: KnowledgeCategory.GETTING_STARTED,
      subcategory: 'basics',
      type: ArticleType.GUIDE,
      tags: ['marketplace', 'getting-started', 'beginner'],
      keywords: ['marketplace', 'templates', 'buying', 'selling'],
      sections: [
        {
          id: 'section-1',
          title: 'Creating Your Account',
          content: 'Start by creating your account with a strong password and verified email address.',
          order: 1,
          type: 'text' as any,
          anchor: 'creating-account',
          isCollapsible: false,
          metadata: {}
        },
        {
          id: 'section-2',
          title: 'Browsing Templates',
          content: 'Use our advanced search and filtering tools to find the perfect templates for your needs.',
          order: 2,
          type: 'text' as any,
          anchor: 'browsing-templates',
          isCollapsible: false,
          metadata: {}
        }
      ],
      attachments: [],
      relatedArticles: [],
      prerequisites: [],
      author: 'Support Team',
      authorId: 'support-1',
      contributors: [],
      version: '1.0.0',
      lastUpdated: new Date(),
      status: 'published' as any,
      views: 1250,
      ratings: [
        { userId: 'user-1', rating: 5, helpful: true, timestamp: new Date() },
        { userId: 'user-2', rating: 4, helpful: true, timestamp: new Date() }
      ],
      feedback: [],
      helpfulVotes: 23,
      unhelpfulVotes: 2,
      searchableText: 'marketplace getting started guide templates buying selling',
      searchScore: 0,
      accessibilityFeatures: [],
      readingLevel: 'beginner' as any,
      estimatedReadTime: 5,
      language: 'en',
      translations: {},
      interactiveElements: [],
      codeExamples: [],
      videos: [],
      images: []
    },
    {
      title: 'How to Create and Sell Templates',
      slug: 'create-sell-templates',
      content: 'This guide covers the complete process of creating high-quality templates and successfully selling them on our marketplace.',
      excerpt: 'Learn how to create professional templates and maximize your sales.',
      category: KnowledgeCategory.TEMPLATE_CREATION,
      subcategory: 'creation',
      type: ArticleType.TUTORIAL,
      tags: ['templates', 'creation', 'selling', 'design'],
      keywords: ['template', 'design', 'creation', 'selling', 'marketplace'],
      sections: [
        {
          id: 'section-1',
          title: 'Design Principles',
          content: 'Follow these design principles to create templates that customers will love.',
          order: 1,
          type: 'text' as any,
          anchor: 'design-principles',
          isCollapsible: false,
          metadata: {}
        },
        {
          id: 'section-2',
          title: 'File Requirements',
          content: 'Ensure your templates meet our technical requirements for quality and compatibility.',
          order: 2,
          type: 'text' as any,
          anchor: 'file-requirements',
          isCollapsible: false,
          metadata: {}
        }
      ],
      attachments: [],
      relatedArticles: [],
      prerequisites: [],
      author: 'Design Team',
      authorId: 'design-1',
      contributors: [],
      version: '1.2.0',
      lastUpdated: new Date(),
      status: 'published' as any,
      views: 890,
      ratings: [
        { userId: 'user-3', rating: 5, helpful: true, timestamp: new Date() },
        { userId: 'user-4', rating: 4, helpful: true, timestamp: new Date() },
        { userId: 'user-5', rating: 5, helpful: true, timestamp: new Date() }
      ],
      feedback: [],
      helpfulVotes: 31,
      unhelpfulVotes: 1,
      searchableText: 'template creation design selling marketplace guide',
      searchScore: 0,
      accessibilityFeatures: [],
      readingLevel: 'intermediate' as any,
      estimatedReadTime: 8,
      language: 'en',
      translations: {},
      interactiveElements: [],
      codeExamples: [
        {
          id: 'code-1',
          language: 'javascript',
          title: 'Template Validation',
          description: 'Basic validation for template files',
          code: 'function validateTemplate(template) {\n  return template.name && template.files.length > 0;\n}',
          runnable: false
        }
      ],
      videos: [],
      images: []
    }
  ];

  for (const articleData of sampleArticles) {
    await knowledgeService.createArticle(articleData);
  }
}

export default Epic16KnowledgeBase;