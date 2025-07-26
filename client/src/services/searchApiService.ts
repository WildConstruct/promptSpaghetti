/**
 * Search API Service
 * 
 * Connects the frontend UnifiedSearchSystem to the backend template search API.
 * Provides type-safe methods for template search, autocomplete, trending queries,
 * and search analytics.
 */

import { SearchQuery, SearchResult, FilterCondition, SortCondition } from '../components/search/SearchContext';

// Backend API types
interface TemplateSearchQuery {
  q?: string;
  categories?: string[];
  tags?: string[];
  complexity?: ('beginner' | 'intermediate' | 'advanced')[];
  minRating?: number;
  verified?: boolean;
  featured?: boolean;
  author?: string;
  dateStart?: string;
  dateEnd?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'rating' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}

interface TemplateSearchResponse {
  success: boolean;
  data: {
    templates: Template[];
    total: number;
    aggregations?: {
      categories: Array<{ name: string; count: number }>;
      price_ranges: Array<{ min: number; max: number; count: number }>;
      avg_ratings: Array<{ rating: number; count: number }>;
      tags: Array<{ name: string; count: number }>;
    };
    executionTime?: number;
  };
}

interface Template {
  id: string;
  title: string;
  description: string;
  tags: string[];
  price_cents: number;
  avg_rating: number;
  total_reviews: number;
  total_purchases: number;
  categories: string[];
  owner_name: string;
  owner_verified: boolean;
  is_ai_generated: boolean;
  claude_compat: string[];
  featured_at?: string;
  created_at: string;
  updated_at: string;
}

interface AutocompleteResponse {
  success: boolean;
  data: {
    query: string;
    suggestions: string[];
  };
}

interface TrendingResponse {
  success: boolean;
  data: {
    timeframe: string;
    category: string | null;
    trending: Array<{
      query: string;
      count: number;
      growth?: number;
    }>;
  };
}

class SearchApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/search') {
    this.baseUrl = baseUrl;
  }

  /**
   * Convert frontend SearchQuery to backend TemplateSearchQuery
   */
  private convertSearchQuery(searchQuery: SearchQuery, page: number = 1, limit: number = 20): TemplateSearchQuery {
    const backendQuery: TemplateSearchQuery = {
      page,
      limit
    };

    // Text search
    if (searchQuery.text?.trim()) {
      backendQuery.q = searchQuery.text.trim();
    }

    // Convert filters
    searchQuery.filters?.forEach(filter => {
      switch (filter.field) {
        case 'categories':
          if (filter.operator === 'in' && filter.values) {
            backendQuery.categories = filter.values as string[];
          } else if (filter.operator === 'equals') {
            backendQuery.categories = [filter.value as string];
          }
          break;

        case 'tags':
          if (filter.operator === 'in' && filter.values) {
            backendQuery.tags = filter.values as string[];
          } else if (filter.operator === 'equals') {
            backendQuery.tags = [filter.value as string];
          }
          break;

        case 'complexity':
          if (filter.operator === 'in' && filter.values) {
            backendQuery.complexity = filter.values as ('beginner' | 'intermediate' | 'advanced')[];
          } else if (filter.operator === 'equals') {
            backendQuery.complexity = [filter.value as 'beginner' | 'intermediate' | 'advanced'];
          }
          break;

        case 'rating':
          if (filter.operator === 'greater' || filter.operator === 'equals') {
            backendQuery.minRating = filter.value as number;
          }
          break;

        case 'verified':
          if (filter.operator === 'equals') {
            backendQuery.verified = filter.value as boolean;
          }
          break;

        case 'featured':
          if (filter.operator === 'equals') {
            backendQuery.featured = filter.value as boolean;
          }
          break;

        case 'author':
          if (filter.operator === 'equals') {
            backendQuery.author = filter.value as string;
          }
          break;

        case 'price':
          if (filter.operator === 'between' && filter.values && filter.values.length === 2) {
            backendQuery.priceMin = filter.values[0] as number;
            backendQuery.priceMax = filter.values[1] as number;
          } else if (filter.operator === 'greater') {
            backendQuery.priceMin = filter.value as number;
          } else if (filter.operator === 'less') {
            backendQuery.priceMax = filter.value as number;
          }
          break;

        case 'date':
          if (filter.operator === 'between' && filter.values && filter.values.length === 2) {
            backendQuery.dateStart = (filter.values[0] as Date).toISOString();
            backendQuery.dateEnd = (filter.values[1] as Date).toISOString();
          } else if (filter.operator === 'greater') {
            backendQuery.dateStart = (filter.value as Date).toISOString();
          } else if (filter.operator === 'less') {
            backendQuery.dateEnd = (filter.value as Date).toISOString();
          }
          break;
      }
    });

    // Convert sorts
    if (searchQuery.sorts?.length > 0) {
      const primarySort = searchQuery.sorts[0];
      switch (primarySort.field) {
        case 'created_at':
          backendQuery.sortBy = primarySort.direction === 'desc' ? 'newest' : 'oldest';
          break;
        case 'avg_rating':
          backendQuery.sortBy = 'rating';
          break;
        case 'total_purchases':
          backendQuery.sortBy = 'popular';
          break;
        case 'relevance':
        default:
          backendQuery.sortBy = 'relevance';
          break;
      }
    } else if (searchQuery.text) {
      backendQuery.sortBy = 'relevance';
    } else {
      backendQuery.sortBy = 'newest';
    }

    return backendQuery;
  }

  /**
   * Convert backend response to frontend SearchResult
   */
  private convertSearchResult(response: TemplateSearchResponse): SearchResult<Template> {
    return {
      items: response.data.templates,
      totalCount: response.data.total,
      facets: response.data.aggregations ? {
        categories: response.data.aggregations.categories,
        tags: response.data.aggregations.tags,
        ratings: response.data.aggregations.avg_ratings.map(r => ({
          value: r.rating.toString(),
          count: r.count
        })),
        price_ranges: response.data.aggregations.price_ranges.map(p => ({
          value: `${p.min}-${p.max === Infinity ? '∞' : p.max}`,
          count: p.count
        }))
      } : undefined,
      executionTime: response.data.executionTime
    };
  }

  /**
   * Search templates using the backend API
   */
  async searchTemplates(
    searchQuery: SearchQuery,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult<Template>> {
    try {
      const backendQuery = this.convertSearchQuery(searchQuery, page, limit);
      const queryParams = new URLSearchParams();

      // Add query parameters
      Object.entries(backendQuery).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/templates?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
      }

      const data: TemplateSearchResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Search request was unsuccessful');
      }

      return this.convertSearchResult(data);
    } catch (error) {
      console.error('Search templates error:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/suggest?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Autocomplete request failed: ${response.status} ${response.statusText}`);
      }

      const data: AutocompleteResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Autocomplete request was unsuccessful');
      }

      return data.data.suggestions;
    } catch (error) {
      console.error('Autocomplete error:', error);
      return []; // Return empty array on error for graceful degradation
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    category?: string,
    limit: number = 10
  ): Promise<Array<{ query: string; count: number; growth?: number }>> {
    try {
      const queryParams = new URLSearchParams({
        timeframe,
        limit: limit.toString()
      });

      if (category) {
        queryParams.append('category', category);
      }

      const response = await fetch(`${this.baseUrl}/trending?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Trending searches request failed: ${response.status} ${response.statusText}`);
      }

      const data: TrendingResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Trending searches request was unsuccessful');
      }

      return data.data.trending;
    } catch (error) {
      console.error('Trending searches error:', error);
      return []; // Return empty array on error for graceful degradation
    }
  }

  /**
   * Track search result click for analytics
   */
  async trackClick(templateId: string, query: string, position: number, searchId?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          query,
          position,
          searchId
        })
      });

      if (!response.ok) {
        console.warn(`Click tracking failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Click tracking error:', error);
      // Don't throw - click tracking failure shouldn't break the UI
    }
  }

  /**
   * Save a search query
   */
  async saveSearch(name: string, searchQuery: SearchQuery): Promise<{ id: string; name: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          searchQuery
        })
      });

      if (!response.ok) {
        throw new Error(`Save search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Save search was unsuccessful');
      }

      return data.data;
    } catch (error) {
      console.error('Save search error:', error);
      throw error;
    }
  }

  /**
   * Get user's saved searches
   */
  async getSavedSearches(): Promise<Array<{
    id: string;
    name: string;
    searchQuery: SearchQuery;
    createdAt: string;
    lastUsed: string;
    useCount: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved`);
      
      if (!response.ok) {
        throw new Error(`Get saved searches failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Get saved searches was unsuccessful');
      }

      return data.data.savedSearches;
    } catch (error) {
      console.error('Get saved searches error:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/saved/${searchId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Delete saved search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Delete saved search was unsuccessful');
      }
    } catch (error) {
      console.error('Delete saved search error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const searchApiService = new SearchApiService();
export default searchApiService;
export type { Template, SearchQuery, SearchResult };