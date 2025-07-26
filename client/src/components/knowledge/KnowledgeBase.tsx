// Epic 16 Story 16.4 - Knowledge Base & Learning Resources Component
// Comprehensive knowledge base interface with articles, tutorials, case studies, and search

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/environment';

interface Author {
  id: string;
  display_name: string;
  avatar_url?: string;
  creator_tier?: string;
  verification_status?: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  category: string;
  tags: string[];
  author: Author;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time: number;
  views_count: number;
  likes_count: number;
  helpful_count: number;
  is_featured: boolean;
  is_community_contributed: boolean;
  created_at: string;
  last_updated_at: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  author: Author;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number;
  completion_count: number;
  rating: number;
  review_count: number;
  is_interactive: boolean;
  created_at: string;
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  author: Author;
  industry: string;
  use_case: string;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
}

interface SearchFilters {
  category?: string;
  difficulty_level?: string;
  content_type?: 'article' | 'tutorial' | 'case_study';
  is_featured?: boolean;
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800', 
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};

export   const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [searchResults, setSearchResults] = useState<(KnowledgeArticle | Tutorial | CaseStudy)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [categories, setCategories] = useState<string[]>([]);

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchKnowledgeContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [articlesRes, tutorialsRes, caseStudiesRes] = await Promise.all([
        fetch(`${API_URL}/api/marketplace/knowledge/articles?limit=12`, {
          headers: getAuthHeaders()
        }),
        fetch(`${API_URL}/api/marketplace/knowledge/tutorials?limit=8`, {
          headers: getAuthHeaders()
        }),
        fetch(`${API_URL}/api/marketplace/knowledge/case-studies?limit=6`, {
          headers: getAuthHeaders()
        })
      ]);

      if (!articlesRes.ok || !tutorialsRes.ok || !caseStudiesRes.ok) {
        throw new Error('Failed to fetch knowledge base content');
      }

      const [articlesData, tutorialsData, caseStudiesData] = await Promise.all([
        articlesRes.json(),
        tutorialsRes.json(),
        caseStudiesRes.json()
      ]);

      setArticles(articlesData.articles || []);
      setTutorials(tutorialsData.tutorials || []);
      setCaseStudies(caseStudiesData.case_studies || []);

      // Extract unique categories
      const allCategories = new Set<string>();
      [...(articlesData.articles || []), ...(tutorialsData.tutorials || []), ...(caseStudiesData.case_studies || [])]
        .forEach(item => allCategories.add(item.category));
      setCategories(Array.from(allCategories).sort());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        q: searchQuery,
        ...(filters.category && { category: filters.category }),
        ...(filters.difficulty_level && { difficulty_level: filters.difficulty_level }),
        ...(filters.content_type && { content_type: filters.content_type })
      });

      const response = await fetch(`${API_URL}/api/marketplace/knowledge/search?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setActiveTab('search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters.category, filters.difficulty_level, filters.content_type]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const rateContent = useCallback(
    async (type: 'articles' | 'tutorials' | 'case-studies',
    id: string,
    isHelpful: boolean
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/knowledge/${type}/${id}/rate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_helpful: isHelpful })
      });

      if (response.ok) {
        // Optionally update local state to reflect the rating
        console.log('Content rated successfully');
      }
    } catch (error: unknown) {
      console.error('Failed to rate content:', error);
    }
  }, []);

  const getDifficultyBadge = (level: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS]}`}>
      {DIFFICULTY_LABELS[level as keyof typeof DIFFICULTY_LABELS]}
    </span>
  );

  const getTierBadge = (tier: string, verified: string) => (
    <div className="flex items-center space-x-1">
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
        tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
        tier === 'silver' ? 'bg-gray-100 text-gray-800' :
        'bg-amber-100 text-amber-800'
      }`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
      {verified === 'verified' && (
        <span className="text-blue-600">✓</span>
      )}
    </div>
  );

  useEffect(() => {
    fetchKnowledgeContent();
  }, []);

  const renderArticleCard = (article: KnowledgeArticle) => (
    <div key={article.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{article.title}</h3>
        {article.is_featured && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Featured</span>
        )}
      </div>
      
      {article.summary && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.summary}</p>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {article.author.avatar_url && (
            <img src={article.author.avatar_url} alt={article.author.display_name} className="w-8 h-8 rounded-full" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{article.author.display_name}</span>
            {article.author.creator_tier && article.author.verification_status && (
              <div className="mt-1">
                {getTierBadge(article.author.creator_tier, article.author.verification_status)}
              </div>
            )}
          </div>
        </div>
        {getDifficultyBadge(article.difficulty_level)}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{article.estimated_read_time} min read</span>
        <span>{article.views_count} views</span>
        <span>{article.helpful_count} helpful</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{tag}</span>
        ))}
        {article.tags.length > 3 && (
          <span className="text-gray-500 text-xs">+{article.tags.length - 3} more</span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(`/knowledge/articles/${article.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Read Article →
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => rateContent('articles', article.id, true)}
            className="text-green-600 hover:text-green-800 text-sm"
            title="Mark as helpful"
          >
            👍
          </button>
          <button 
            onClick={() => rateContent('articles', article.id, false)}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Not helpful"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );

  const renderTutorialCard = (tutorial: Tutorial) => (
    <div key={tutorial.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{tutorial.title}</h3>
        {tutorial.is_interactive && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Interactive</span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tutorial.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {tutorial.author.avatar_url && (
            <img src={tutorial.author.avatar_url} alt={tutorial.author.display_name} className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm font-medium text-gray-900">{tutorial.author.display_name}</span>
        </div>
        {getDifficultyBadge(tutorial.difficulty_level)}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{tutorial.estimated_duration} min</span>
        <span>{tutorial.completion_count} completed</span>
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{tutorial.rating.toFixed(1)} ({tutorial.review_count})</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tutorial.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{tag}</span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(`/knowledge/tutorials/${tutorial.id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Start Tutorial
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => rateContent('tutorials', tutorial.id, true)}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            👍
          </button>
          <button 
            onClick={() => rateContent('tutorials', tutorial.id, false)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );

  const renderCaseStudyCard = (caseStudy: CaseStudy) => (
    <div key={caseStudy.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{caseStudy.title}</h3>
        {caseStudy.is_featured && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Featured</span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{caseStudy.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {caseStudy.author.avatar_url && (
            <img src={caseStudy.author.avatar_url} alt={caseStudy.author.display_name} className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm font-medium text-gray-900">{caseStudy.author.display_name}</span>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {caseStudy.industry}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{caseStudy.use_case}</span>
        <span>{caseStudy.views_count} views</span>
        <span>{caseStudy.likes_count} likes</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {caseStudy.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{tag}</span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(`/knowledge/case-studies/${caseStudy.id}`)}
          className="text-purple-600 hover:text-purple-800 font-medium text-sm"
        >
          View Case Study →
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => rateContent('case-studies', caseStudy.id, true)}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            👍
          </button>
          <button 
            onClick={() => rateContent('case-studies', caseStudy.id, false)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading knowledge base...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button 
              onClick={fetchKnowledgeContent}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Knowledge Base</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover comprehensive guides, tutorials, and case studies to help you master prompt engineering and template creation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search articles, tutorials, and case studies..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Search
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <select
              value={filters.category || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, category: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filters.difficulty_level || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, difficulty_level: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            
            <select
              value={filters.content_type || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, content_type: (e.target.value as 'article' | 'tutorial' | 'case_study') || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="article">Articles</option>
              <option value="tutorial">Tutorials</option>
              <option value="case_study">Case Studies</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'All Content', count: articles.length + tutorials.length + caseStudies.length },
              { key: 'articles', label: 'Articles', count: articles.length },
              { key: 'tutorials', label: 'Tutorials', count: tutorials.length },
              { key: 'case-studies', label: 'Case Studies', count: caseStudies.length },
              ...(
                searchResults.length > 0 ? [{ key: 'search',
                label: 'Search Results',
                count: searchResults.length }] : []
              )
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'all' | 'articles' | 'tutorials' | 'case-studies' | 'search')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'all' && (
            <>
              {articles.slice(0, 6).map(renderArticleCard)}
              {tutorials.slice(0, 4).map(renderTutorialCard)}
              {caseStudies.slice(0, 2).map(renderCaseStudyCard)}
            </>
          )}
          
          {activeTab === 'articles' && articles.map(renderArticleCard)}
          {activeTab === 'tutorials' && tutorials.map(renderTutorialCard)}
          {activeTab === 'case-studies' && caseStudies.map(renderCaseStudyCard)}
          {activeTab === 'search' && searchResults.map((result) => {
            // Render based on content type - simplified for demo
            return renderArticleCard(result);
          })}
        </div>

        {/* Empty State */}
        {((activeTab === 'all' && articles.length === 0 && tutorials.length === 0 && caseStudies.length === 0) ||
          (activeTab === 'articles' && articles.length === 0) ||
          (activeTab === 'tutorials' && tutorials.length === 0) ||
          (activeTab === 'case-studies' && caseStudies.length === 0) ||
          (activeTab === 'search' && searchResults.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'search' ? 'No search results found' : 'No content available'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'search' 
                ? 'Try adjusting your search terms or filters'
                : 'Content is being added regularly. Check back soon!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};