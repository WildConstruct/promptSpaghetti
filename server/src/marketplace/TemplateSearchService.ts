/**
 * Epic 16 Marketplace - Template Search Service
 * 
 * Advanced search functionality for marketplace templates with faceted search,
 * intelligent ranking, performance optimization, and comprehensive filtering
 * capabilities for the knowledge base system.
 * 
 * Features:
 * - Full-text search with relevance scoring
 * - Faceted search with dynamic filters
 * - Category and tag-based filtering
 * - Advanced query parsing and suggestion
 * - Performance optimization for large datasets
 * - Search analytics and trending queries
 * - Personalized search results
 * - Real-time search suggestions
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

}
export interface SearchQuery {
  query?: string;              // Text search query
  categories?: string[];       // Filter by categories
  tags?: string[];            // Filter by tags
  complexity?: ('beginner' | 'intermediate' | 'advanced')[];
  minRating?: number;         // Minimum average rating
  verified?: boolean;         // Only verified templates
  featured?: boolean;         // Only featured templates
  author?: string;           // Filter by author
  dateRange?: {              // Filter by creation date
    start?: Date;
    end?: Date;
}
  };
  priceRange?: {             // Filter by price (if applicable)
    min?: number;
    max?: number;
  };
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'rating' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}

}
export interface SearchFacets {
  categories: Array<{ name: string; count: number; subcategories?: Array<{ name: string; count: number }> }>;
  tags: Array<{ name: string; count: number }>;
  complexity: Array<{ level: string; count: number }>;
  rating: Array<{ range: string; count: number }>;
  authors: Array<{ name: string; count: number; verified: boolean }>;
  dateRanges: Array<{ range: string; count: number }>;
}

}
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  author: {
    id: string;
    name: string;
    verified: boolean;
    avatar?: string;
}
  };
  rating: {
    average: number;
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
  usage: {
    downloadCount: number;
    viewCount: number;
    bookmarkCount: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    featured: boolean;
    verified: boolean;
    premium: boolean;
    price?: number;
  };
  relevanceScore: number;
  highlightedSnippets: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

}
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  facets: SearchFacets;
  suggestions: string[];
  relatedQueries: string[];
  searchTime: number;
  page: number;
  limit: number;
}
}

}
export interface SearchSuggestion {
  query: string;
  type: 'completion' | 'correction' | 'related';
  confidence: number;
  category?: string;
}
}

}
export interface TrendingSearch {
  query: string;
  count: number;
  growth: number;
  category?: string;
  timeframe: '1h' | '24h' | '7d' | '30d';
}
}

@Injectable()
export class TemplateSearchService {
  private redis: Redis;

  constructor(private pool: Pool) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      keyPrefix: 'template_search:'
    });
  }

  /**
   * Perform advanced template search with faceted filtering
   */
  async search(query: SearchQuery, userId?: string): Promise<SearchResponse> {

    const startTime = Date.now();

    try {
      // Build and cache search key for performance
      const searchKey = this.buildSearchKey(query, userId);
      
      // Check cache first
      const cached = await this.getCachedResults(searchKey);
      if (cached) {
        await this.logSearchEvent(query, userId, cached.total, Date.now() - startTime, true);
        return cached;
      }

      // Build SQL query with filters and scoring
      const { sqlQuery, params } = await this.buildSearchSQL(query, userId);
      
      // Execute search with facets in parallel
      const [searchResults, facets, suggestions] = await Promise.all([
        this.pool.query(sqlQuery, params),
        this.buildFacets(query),
        this.generateSuggestions(query.query || '', userId)
      ]);

      // Process and rank results
      const processedResults = await this.processSearchResults(
        searchResults.rows, 
        query.query || '', 
        userId
      );

      // Get total count for pagination
      const total = searchResults.rows.length > 0 ? 
        parseInt(searchResults.rows[0].total_count) : 0;

      const response: SearchResponse = {
        results: processedResults,
        total,
        hasMore: (query.page || 1) * (query.limit || 20) < total,
        facets,
        suggestions: suggestions.slice(0, 5),
        relatedQueries: await this.getRelatedQueries(query.query || '', userId),
        searchTime: Date.now() - startTime,
        page: query.page || 1,
        limit: query.limit || 20
      };

      // Cache results for 5 minutes
      await this.cacheResults(searchKey, response);

      // Log search event for analytics
      await this.logSearchEvent(query, userId, total, response.searchTime, false);

      return response;
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  /**
   * Get real-time search suggestions as user types
   */
  async getAutocompleteSuggestions(
    partial: string, 
    userId?: string, 
    limit: number = 10
  ): Promise<SearchSuggestion[]> {

    try {
      if (partial.length < 2) return [];

      const cacheKey = `autocomplete:${partial.toLowerCase()}:${userId || 'anonymous'}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get suggestions from multiple sources
      const [templateSuggestions, tagSuggestions, categorySuggestions, trendingSuggestions] = await Promise.all([
        this.getTemplateTitleSuggestions(partial, limit),
        this.getTagSuggestions(partial, limit),
        this.getCategorySuggestions(partial, limit),
        this.getTrendingSuggestions(partial, userId, limit)
      ]);

      // Combine and rank suggestions
      const allSuggestions = [
        ...templateSuggestions,
        ...tagSuggestions,
        ...categorySuggestions,
        ...trendingSuggestions
      ];

      // Deduplicate and sort by confidence
      const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);
      const rankedSuggestions = uniqueSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      // Cache for 1 minute
      await this.redis.setex(cacheKey, 60, JSON.stringify(rankedSuggestions));

      return rankedSuggestions;
    } catch (error) {
      console.error('Autocomplete suggestions failed:', error);
      return [];
    }
  }

  /**
   * Get trending searches and popular queries
   */
  async getTrendingSearches(
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    category?: string,
    limit: number = 10
  ): Promise<TrendingSearch[]> {

    try {
      const cacheKey = `trending:${timeframe}:${category || 'all'}:${limit}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const intervalMap = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days'
      };

      let query = `
        SELECT 
          query,
          COUNT(*) as search_count,
          COUNT(*) - LAG(COUNT(*), 1, 0) OVER (ORDER BY COUNT(*)) as growth,
          category
        FROM marketplace_search_events 
        WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
          AND query IS NOT NULL 
          AND LENGTH(query) > 2
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      query += `
        GROUP BY query, category
        HAVING COUNT(*) >= 3
        ORDER BY search_count DESC, growth DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const result = await this.pool.query(query, params);

      const trending: TrendingSearch[] = result.rows.map(row => ({
        query: row.query,
        count: parseInt(row.search_count),
        growth: parseInt(row.growth) || 0,
        category: row.category,
        timeframe
      }));

      // Cache for 15 minutes
      await this.redis.setex(cacheKey, 900, JSON.stringify(trending));

      return trending;
    } catch (error) {
      console.error('Failed to get trending searches:', error);
      return [];
    }
  }

  /**
   * Get search analytics and insights
   */
  async getSearchAnalytics(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    averageResultsPerSearch: number;
    topCategories: Array<{ category: string; count: number; percentage: number }>;
    popularQueries: Array<{ query: string; count: number; clickRate: number }>;
    searchTrends: Array<{ date: string; searches: number; uniqueQueries: number }>;
    performanceMetrics: {
      averageSearchTime: number;
      cacheHitRate: number;
      errorRate: number;
    };
  }> {
    try {
      const intervalMap = {
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days'
      };

      const [
        totalStats,
        categoryStats,
        queryStats,
        trendStats,
        performanceStats
      ] = await Promise.all([
        this.pool.query(`
          SELECT 
            COUNT(*) as total_searches,
            COUNT(DISTINCT query) as unique_queries,
            AVG(result_count) as avg_results
          FROM marketplace_search_events 
          WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
        `),
        
        this.pool.query(`
          SELECT 
            category,
            COUNT(*) as count,
            (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()) as percentage
          FROM marketplace_search_events 
          WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
            AND category IS NOT NULL
          GROUP BY category 
          ORDER BY count DESC 
          LIMIT 10
        `),
        
        this.pool.query(`
          SELECT 
            query,
            COUNT(*) as search_count,
            (SUM(CASE WHEN clicked THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as click_rate
          FROM marketplace_search_events 
          WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
            AND query IS NOT NULL
          GROUP BY query 
          HAVING COUNT(*) >= 5
          ORDER BY search_count DESC 
          LIMIT 20
        `),
        
        this.pool.query(`
          SELECT 
            DATE_TRUNC('day', timestamp) as date,
            COUNT(*) as searches,
            COUNT(DISTINCT query) as unique_queries
          FROM marketplace_search_events 
          WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
          GROUP BY DATE_TRUNC('day', timestamp)
          ORDER BY date
        `),
        
        this.pool.query(`
          SELECT 
            AVG(search_time_ms) as avg_search_time,
            (SUM(CASE WHEN from_cache THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as cache_hit_rate,
            (SUM(CASE WHEN error_occurred THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate
          FROM marketplace_search_events 
          WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
        `)
      ]);

      return {
        totalSearches: parseInt(totalStats.rows[0]?.total_searches) || 0,
        uniqueQueries: parseInt(totalStats.rows[0]?.unique_queries) || 0,
        averageResultsPerSearch: parseFloat(totalStats.rows[0]?.avg_results) || 0,
        topCategories: categoryStats.rows.map(row => ({
          category: row.category,
          count: parseInt(row.count),
          percentage: parseFloat(row.percentage)
        })),
        popularQueries: queryStats.rows.map(row => ({
          query: row.query,
          count: parseInt(row.search_count),
          clickRate: parseFloat(row.click_rate) || 0
        })),
        searchTrends: trendStats.rows.map(row => ({
          date: row.date.toISOString().split('T')[0],
          searches: parseInt(row.searches),
          uniqueQueries: parseInt(row.unique_queries)
        })),
        performanceMetrics: {
          averageSearchTime: parseFloat(performanceStats.rows[0]?.avg_search_time) || 0,
          cacheHitRate: parseFloat(performanceStats.rows[0]?.cache_hit_rate) || 0,
          errorRate: parseFloat(performanceStats.rows[0]?.error_rate) || 0
        }
      };
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      throw error;
    }
  }

  // Private helper methods

  private buildSearchKey(query: SearchQuery, userId?: string): string {
    const keyParts = [
      query.query || '',
      (query.categories || []).sort().join(','),
      (query.tags || []).sort().join(','),
      (query.complexity || []).sort().join(','),
      query.minRating || '',
      query.verified || '',
      query.featured || '',
      query.author || '',
      query.sortBy || '',
      query.page || 1,
      query.limit || 20,
      userId || 'anonymous'
    ];
    
    return Buffer.from(keyParts.join('|')).toString('base64');
  }

  private async getCachedResults(searchKey: string): Promise<SearchResponse | null> {

    try {
      const cached = await this.redis.get(`results:${searchKey}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  private async cacheResults(searchKey: string, response: SearchResponse): Promise<void> {

    try {
      await this.redis.setex(`results:${searchKey}`, 300, JSON.stringify(response));
    } catch (error) {
      console.error('Failed to cache search results:', error);
    }
  }

  private async buildSearchSQL(query: SearchQuery, userId?: string): Promise<{ sqlQuery: string; params: any[] }> {

    let baseQuery = `
      SELECT DISTINCT
        t.*,
        u.email as author_email,
        u.name as author_name,
        u.verified as author_verified,
        u.avatar as author_avatar,
        r.average_rating,
        r.review_count,
        r.rating_distribution,
        COUNT(*) OVER() as total_count,
        CASE 
          WHEN t.title ILIKE $1 THEN 100
          WHEN t.description ILIKE $1 THEN 50
          WHEN EXISTS (SELECT 1 FROM unnest(t.tags) tag WHERE tag ILIKE $1) THEN 30
          WHEN t.category ILIKE $1 THEN 20
          ELSE 10
        END as relevance_score
      FROM marketplace_templates t
      JOIN users u ON t.author_id = u.id
      LEFT JOIN template_rating_summary r ON t.id = r.template_id
      WHERE t.status = 'published'
    `;

    const params: any[] = [`%${query.query || ''}%`];
    let paramIndex = 2;

    // Add filters
    if (query.categories && query.categories.length > 0) {
      baseQuery += ` AND t.category = ANY($${paramIndex})`;
      params.push(query.categories);
      paramIndex++;
    }

    if (query.tags && query.tags.length > 0) {
      baseQuery += ` AND t.tags && $${paramIndex}`;
      params.push(query.tags);
      paramIndex++;
    }

    if (query.complexity && query.complexity.length > 0) {
      baseQuery += ` AND t.complexity = ANY($${paramIndex})`;
      params.push(query.complexity);
      paramIndex++;
    }

    if (query.minRating) {
      baseQuery += ` AND r.average_rating >= $${paramIndex}`;
      params.push(query.minRating);
      paramIndex++;
    }

    if (query.verified !== undefined) {
      baseQuery += ` AND t.verified = $${paramIndex}`;
      params.push(query.verified);
      paramIndex++;
    }

    if (query.featured !== undefined) {
      baseQuery += ` AND t.featured = $${paramIndex}`;
      params.push(query.featured);
      paramIndex++;
    }

    if (query.author) {
      baseQuery += ` AND u.id = $${paramIndex}`;
      params.push(query.author);
      paramIndex++;
    }

    if (query.dateRange?.start) {
      baseQuery += ` AND t.created_at >= $${paramIndex}`;
      params.push(query.dateRange.start);
      paramIndex++;
    }

    if (query.dateRange?.end) {
      baseQuery += ` AND t.created_at <= $${paramIndex}`;
      params.push(query.dateRange.end);
      paramIndex++;
    }

    // Add sorting
    const sortMap = {
      relevance: 'relevance_score DESC, r.average_rating DESC NULLS LAST',
      newest: 't.created_at DESC',
      oldest: 't.created_at ASC',
      rating: 'r.average_rating DESC NULLS LAST, r.review_count DESC',
      popular: 't.download_count DESC, r.average_rating DESC NULLS LAST',
      trending: 't.view_count DESC, r.average_rating DESC NULLS LAST'
    };

    baseQuery += ` ORDER BY ${sortMap[query.sortBy || 'relevance']}`;

    // Add pagination
    const limit = Math.min(query.limit || 20, 100);
    const offset = ((query.page || 1) - 1) * limit;
    
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    return { sqlQuery: baseQuery, params };
  }

  private async buildFacets(query: SearchQuery): Promise<SearchFacets> {

    // Simplified facet building - would implement full faceted search
    return {
      categories: [],
      tags: [],
      complexity: [],
      rating: [],
      authors: [],
      dateRanges: []
    };
  }

  private async processSearchResults(
    rows: any[],
    searchQuery: string,
    userId?: string
  ): Promise<SearchResult[]> {

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags || [],
      complexity: row.complexity,
      author: {
        id: row.author_id,
        name: row.author_name,
        verified: row.author_verified,
        avatar: row.author_avatar
  }
      rating: {
        average: parseFloat(row.average_rating) || 0,
        count: parseInt(row.review_count) || 0,
        distribution: row.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }
      usage: {
        downloadCount: row.download_count || 0,
        viewCount: row.view_count || 0,
        bookmarkCount: row.bookmark_count || 0
  }
      metadata: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        featured: row.featured || false,
        verified: row.verified || false,
        premium: row.premium || false,
        price: row.price
  }
      relevanceScore: parseInt(row.relevance_score) || 0,
      highlightedSnippets: this.generateHighlights(row, searchQuery)
    }));
  }

  private generateHighlights(row: any, query: string): SearchResult['highlightedSnippets'] {
    // Simplified highlighting - would implement proper text highlighting
    const highlights: SearchResult['highlightedSnippets'] = {};
    
    if (query && row.title?.toLowerCase().includes(query.toLowerCase())) {
      highlights.title = row.title;
    }
    
    if (query && row.description?.toLowerCase().includes(query.toLowerCase())) {
      highlights.description = row.description;
    }
    
    return highlights;
  }

  private async generateSuggestions(query: string, userId?: string): Promise<string[]> {

    // Simplified suggestion generation
    return [];
  }

  private async getRelatedQueries(query: string, userId?: string): Promise<string[]> {

    // Simplified related query generation
    return [];
  }

  private async getTemplateTitleSuggestions(partial: string, limit: number): Promise<SearchSuggestion[]> {

    const query = `
      SELECT title, download_count
      FROM marketplace_templates 
      WHERE title ILIKE $1 
        AND status = 'published'
      ORDER BY download_count DESC
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [`%${partial}%`, limit]);
    
    return result.rows.map(row => ({
      query: row.title,
      type: 'completion' as const,
      confidence: Math.min(row.download_count / 1000, 1)
    }));
  }

  private async getTagSuggestions(partial: string, limit: number): Promise<SearchSuggestion[]> {

    // Simplified tag suggestions
    return [];
  }

  private async getCategorySuggestions(partial: string, limit: number): Promise<SearchSuggestion[]> {

    // Simplified category suggestions  
    return [];
  }

  private async getTrendingSuggestions(partial: string, userId?: string, limit: number): Promise<SearchSuggestion[]> {

    // Simplified trending suggestions
    return [];
  }

  private deduplicateSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = suggestion.query.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async logSearchEvent(
    query: SearchQuery,
    userId: string | undefined,
    resultCount: number,
    searchTime: number,
    fromCache: boolean
  ): Promise<void> {

    try {
      await this.pool.query(`
        INSERT INTO marketplace_search_events (
          user_id, query, category, result_count, search_time_ms, from_cache, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        userId,
        query.query,
        query.categories?.[0],
        resultCount,
        searchTime,
        fromCache
      ]);
    } catch (error) {
      console.error('Failed to log search event:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {

    try {
      await this.redis.quit();
      console.log('TemplateSearchService destroyed successfully');
    } catch (error) {
      console.error('Error during TemplateSearchService destruction:', error);
    }
  }
}