// Epic 16 Story 16.1 - Search Analytics Service
import { Pool, PoolClient } from 'pg';

interface SearchQuery {
  query: string;
  user_id?: string;
  filters?: Record<string, any>;
  results_count: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

interface SearchAnalytics {
  period_start: Date;
  period_end: Date;
  total_searches: number;
  unique_users: number;
  top_queries: Array<{ query: string; count: number; avg_results: number }>;
  popular_filters: Array<{ filter: string; value: string; count: number }>;
  zero_result_queries: Array<{ query: string; count: number }>;
  search_trends: Array<{ date: string; searches: number; unique_users: number }>;
  conversion_metrics: {
    search_to_view: number;
    search_to_purchase: number;
    avg_time_to_action: number;
  };
}

interface SearchSuggestion {
  suggestion: string;
  frequency: number;
  category?: string;
  result_count: number;
}

export class SearchAnalyticsService {
  constructor(private db: Pool) {}

  async logSearch(searchData: SearchQuery): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query(`
        INSERT INTO search_analytics (
          query, user_id, filters, results_count, session_id, 
          ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        searchData.query.toLowerCase().trim(),
        searchData.user_id,
        JSON.stringify(searchData.filters || {}),
        searchData.results_count,
        searchData.session_id,
        searchData.ip_address,
        searchData.user_agent
      ]);
    } finally {
      client.release();
    }
  }

  async getSearchAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SearchAnalytics> {
    const client = await this.db.connect();
    try {
      // Base query filters
      const whereClause = userId 
        ? 'WHERE created_at BETWEEN $1 AND $2 AND user_id = $3'
        : 'WHERE created_at BETWEEN $1 AND $2';
      const params = userId ? [startDate, endDate, userId] : [startDate, endDate];

      // Total searches and unique users
      const summaryQuery = await client.query(`
        SELECT 
          COUNT(*) as total_searches,
          COUNT(DISTINCT user_id) as unique_users
        FROM search_analytics 
        ${whereClause}
      `, params);

      // Top queries
      const topQueriesQuery = await client.query(`
        SELECT 
          query,
          COUNT(*) as count,
          AVG(results_count)::INT as avg_results
        FROM search_analytics 
        ${whereClause}
          AND query != ''
        GROUP BY query
        ORDER BY count DESC
        LIMIT 20
      `, params);

      // Popular filters
      const filtersQuery = await client.query(`
        SELECT 
          key as filter,
          value,
          COUNT(*) as count
        FROM search_analytics,
             jsonb_each_text(filters)
        ${whereClause}
        GROUP BY key, value
        ORDER BY count DESC
        LIMIT 30
      `, params);

      // Zero result queries
      const zeroResultsQuery = await client.query(`
        SELECT 
          query,
          COUNT(*) as count
        FROM search_analytics 
        ${whereClause}
          AND results_count = 0
          AND query != ''
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `, params);

      // Search trends (daily)
      const trendsQuery = await client.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as searches,
          COUNT(DISTINCT user_id) as unique_users
        FROM search_analytics 
        ${whereClause}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, params);

      // Conversion metrics (search to action)
      const conversionQuery = await client.query(`
        WITH search_sessions AS (
          SELECT DISTINCT session_id, user_id, created_at
          FROM search_analytics 
          ${whereClause}
            AND session_id IS NOT NULL
        ),
        session_events AS (
          SELECT 
            s.session_id,
            s.created_at as search_time,
            e.created_at as event_time,
            e.event_type
          FROM search_sessions s
          LEFT JOIN marketplace_events e ON e.session_id = s.session_id
            AND e.created_at > s.created_at
            AND e.created_at < s.created_at + INTERVAL '1 hour'
        )
        SELECT 
          COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END)::FLOAT / 
            NULLIF(COUNT(DISTINCT session_id), 0) as search_to_view,
          COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END)::FLOAT / 
            NULLIF(COUNT(DISTINCT session_id), 0) as search_to_purchase,
          AVG(EXTRACT(EPOCH FROM (event_time - search_time))/60) as avg_time_to_action_minutes
        FROM session_events
      `, params);

      const summary = summaryQuery.rows[0];
      const conversion = conversionQuery.rows[0] || {};

      return {
        period_start: startDate,
        period_end: endDate,
        total_searches: parseInt(summary.total_searches) || 0,
        unique_users: parseInt(summary.unique_users) || 0,
        top_queries: topQueriesQuery.rows.map(row => ({
          query: row.query,
          count: parseInt(row.count),
          avg_results: parseInt(row.avg_results) || 0
        })),
        popular_filters: filtersQuery.rows.map(row => ({
          filter: row.filter,
          value: row.value,
          count: parseInt(row.count)
        })),
        zero_result_queries: zeroResultsQuery.rows.map(row => ({
          query: row.query,
          count: parseInt(row.count)
        })),
        search_trends: trendsQuery.rows.map(row => ({
          date: row.date,
          searches: parseInt(row.searches),
          unique_users: parseInt(row.unique_users)
        })),
        conversion_metrics: {
          search_to_view: parseFloat(conversion.search_to_view) || 0,
          search_to_purchase: parseFloat(conversion.search_to_purchase) || 0,
          avg_time_to_action: parseFloat(conversion.avg_time_to_action_minutes) || 0
        }
      };
    } finally {
      client.release();
    }
  }

  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const client = await this.db.connect();
    try {
      // Get suggestions based on:
      // 1. Popular search queries
      // 2. Template titles and descriptions
      // 3. Categories and tags

      const suggestions = await client.query(`
        WITH query_suggestions AS (
          SELECT 
            query as suggestion,
            COUNT(*) as frequency,
            'search' as category,
            AVG(results_count)::INT as result_count
          FROM search_analytics 
          WHERE query ILIKE $1 || '%'
            AND query != ''
            AND LENGTH(query) > 2
          GROUP BY query
        ),
        template_suggestions AS (
          SELECT 
            title as suggestion,
            COUNT(*) as frequency,
            'template' as category,
            1 as result_count
          FROM marketplace_templates 
          WHERE status = 'listed'
            AND (title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
          GROUP BY title
        ),
        tag_suggestions AS (
          SELECT 
            unnest(tags) as suggestion,
            COUNT(*) as frequency,
            'tag' as category,
            COUNT(*)::INT as result_count
          FROM marketplace_templates
          WHERE status = 'listed'
            AND EXISTS (
              SELECT 1 FROM unnest(tags) tag 
              WHERE tag ILIKE $1 || '%'
            )
          GROUP BY unnest(tags)
        ),
        category_suggestions AS (
          SELECT 
            c.name as suggestion,
            COUNT(t.id) as frequency,
            'category' as category,
            COUNT(t.id)::INT as result_count
          FROM template_categories c
          LEFT JOIN template_category_mappings tcm ON c.id = tcm.category_id
          LEFT JOIN marketplace_templates t ON tcm.template_id = t.id 
            AND t.status = 'listed'
          WHERE c.name ILIKE $1 || '%'
            AND c.is_active = true
          GROUP BY c.id, c.name
        )
        SELECT suggestion, frequency, category, result_count
        FROM (
          SELECT * FROM query_suggestions
          UNION ALL
          SELECT * FROM template_suggestions
          UNION ALL
          SELECT * FROM tag_suggestions
          UNION ALL
          SELECT * FROM category_suggestions
        ) combined
        WHERE LENGTH(suggestion) >= 2
        ORDER BY 
          CASE 
            WHEN suggestion ILIKE $1 || '%' THEN 1
            ELSE 2
          END,
          frequency DESC,
          result_count DESC
        LIMIT $2
      `, [query.toLowerCase(), limit]);

      return suggestions.rows.map(row => ({
        suggestion: row.suggestion,
        frequency: parseInt(row.frequency),
        category: row.category,
        result_count: parseInt(row.result_count)
      }));
    } finally {
      client.release();
    }
  }

  async getPopularSearchTerms(
    timeframe: 'day' | 'week' | 'month' = 'week',
    limit: number = 20
  ): Promise<Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>> {
    const client = await this.db.connect();
    try {
      const interval = timeframe === 'day' ? '1 day' : timeframe === 'week' ? '7 days' : '30 days';
      const prevInterval = timeframe === 'day' ? '2 days' : timeframe === 'week' ? '14 days' : '60 days';

      const result = await client.query(`
        WITH current_period AS (
          SELECT 
            query,
            COUNT(*) as current_count
          FROM search_analytics 
          WHERE created_at >= NOW() - INTERVAL '${interval}'
            AND query != ''
          GROUP BY query
        ),
        previous_period AS (
          SELECT 
            query,
            COUNT(*) as previous_count
          FROM search_analytics 
          WHERE created_at >= NOW() - INTERVAL '${prevInterval}'
            AND created_at < NOW() - INTERVAL '${interval}'
            AND query != ''
          GROUP BY query
        )
        SELECT 
          c.query,
          c.current_count as count,
          CASE 
            WHEN p.previous_count IS NULL THEN 'up'
            WHEN c.current_count > p.previous_count * 1.2 THEN 'up'
            WHEN c.current_count < p.previous_count * 0.8 THEN 'down'
            ELSE 'stable'
          END as trend
        FROM current_period c
        LEFT JOIN previous_period p ON c.query = p.query
        ORDER BY c.current_count DESC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        query: row.query,
        count: parseInt(row.count),
        trend: row.trend
      }));
    } finally {
      client.release();
    }
  }

  async getSearchInsights(): Promise<{
    trending_topics: string[];
    emerging_queries: string[];
    declining_queries: string[];
    zero_result_opportunities: string[];
    popular_categories: Array<{ category: string; searches: number }>;
  }> {
    const client = await this.db.connect();
    try {
      // Trending topics (high growth in searches)
      const trendingQuery = await client.query(`
        WITH weekly_counts AS (
          SELECT 
            query,
            DATE_TRUNC('week', created_at) as week,
            COUNT(*) as count
          FROM search_analytics 
          WHERE created_at >= NOW() - INTERVAL '4 weeks'
            AND query != ''
          GROUP BY query, DATE_TRUNC('week', created_at)
        ),
        growth_calc AS (
          SELECT 
            query,
            AVG(count) as avg_weekly,
            (MAX(count) - MIN(count))::FLOAT / NULLIF(MIN(count), 0) as growth_rate
          FROM weekly_counts
          GROUP BY query
          HAVING COUNT(*) >= 2
        )
        SELECT query
        FROM growth_calc
        WHERE growth_rate > 0.5 AND avg_weekly >= 5
        ORDER BY growth_rate DESC
        LIMIT 10
      `);

      // Zero result opportunities
      const zeroResultQuery = await client.query(`
        SELECT query
        FROM search_analytics 
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND results_count = 0
          AND query != ''
          AND LENGTH(query) >= 3
        GROUP BY query
        HAVING COUNT(*) >= 3
        ORDER BY COUNT(*) DESC
        LIMIT 15
      `);

      // Popular categories from search filters
      const categoryQuery = await client.query(`
        SELECT 
          jsonb_array_elements_text(filters->'categories') as category,
          COUNT(*) as searches
        FROM search_analytics 
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND jsonb_array_length(filters->'categories') > 0
        GROUP BY jsonb_array_elements_text(filters->'categories')
        ORDER BY COUNT(*) DESC
        LIMIT 10
      `);

      return {
        trending_topics: trendingQuery.rows.map(row => row.query),
        emerging_queries: [], // Could implement more sophisticated ML-based detection
        declining_queries: [], // Could implement decline detection
        zero_result_opportunities: zeroResultQuery.rows.map(row => row.query),
        popular_categories: categoryQuery.rows.map(row => ({
          category: row.category,
          searches: parseInt(row.searches)
        }))
      };
    } finally {
      client.release();
    }
  }
}