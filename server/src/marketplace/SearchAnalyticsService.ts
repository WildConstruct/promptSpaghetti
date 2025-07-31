/**
 * Epic 16 Marketplace - Search Analytics and Performance Monitoring Service
 * 
 * Comprehensive analytics service for tracking search performance, user behavior,
 * and search optimization metrics for the marketplace template search system.
 * 
 * Features:
 * - Real-time search performance monitoring
 * - Search query analysis and trending
 * - Click-through rate tracking
 * - Search abandonment monitoring
 * - Performance optimization metrics
 * - A/B testing support for search ranking
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

}
}
interface SearchEvent {
  sessionId: string;
  userId?: string;
  query: string;
  filters: any;
  timestamp: Date;
  resultCount: number;
  responseTimeMs: number;
  source: 'elasticsearch' | 'postgresql';
  userAgent?: string;
  ipAddress?: string;
}
}
}

}
}
interface SearchClickEvent {
  sessionId: string;
  userId?: string;
  query: string;
  templateId: string;
  position: number;
  timestamp: Date;
  clickedFromSearch: boolean;
}
}
}

}
}
interface SearchAbandonmentEvent {
  sessionId: string;
  userId?: string;
  query: string;
  timeSpentMs: number;
  scrollDepth: number;
  timestamp: Date;
  reason: 'no_results' | 'irrelevant_results' | 'timeout' | 'navigation';
}
}
}

}
}
interface SearchMetrics {
  period: {
    start: Date;
    end: Date;
}
}
  };
  totalSearches: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  clickThroughRate: number;
  averagePosition: number;
  abandonmentRate: number;
  topQueries: Array<{
    query: string;
    count: number;
    avgResponseTime: number;
    clickThroughRate: number;
  }>;
  topFilters: Array<{
    filter: string;
    value: string;
    count: number;
  }>;
  conversionFunnel: {
    searches: number;
    clicks: number;
    previews: number;
    purchases: number;
  };
  performanceByHour: Array<{
    hour: number;
    searches: number;
    avgResponseTime: number;
    clickThroughRate: number;
  }>;
}

}
}
interface SearchOptimizationRecommendations {
  slowQueries: Array<{
    query: string;
    avgResponseTime: number;
    frequency: number;
    recommendation: string;
}
}
  }>;
  lowPerformingFilters: Array<{
    filter: string;
    clickThroughRate: number;
    recommendation: string;
  }>;
  indexOptimizations: Array<{
    field: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  cacheOptimizations: Array<{
    queryPattern: string;
    hitRate: number;
    recommendation: string;
  }>;
}

@Injectable()
export class SearchAnalyticsService {
  private redis: Redis;

  constructor(private pool: Pool) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  /**
   * Track a search event with performance metrics
   */
  async trackSearchEvent(event: SearchEvent): Promise<void> {

    try {
      // Store in PostgreSQL for long-term analytics
      await this.storeSearchEvent(event);
      
      // Update real-time metrics in Redis
      await this.updateRealTimeMetrics(event);
      
      // Check for performance alerts
      await this.checkPerformanceAlerts(event);
      
    } catch (error) {
      console.error('Failed to track search event:', error);
    }
  }

  /**
   * Track search result click events
   */
  async trackClickEvent(event: SearchClickEvent): Promise<void> {

    try {
      // Store click event
      const query = `
        INSERT INTO marketplace_search_clicks (
          session_id, user_id, query, template_id, position,
          timestamp, clicked_from_search
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await this.pool.query(query, [
        event.sessionId,
        event.userId,
        event.query,
        event.templateId,
        event.position,
        event.timestamp,
        event.clickedFromSearch
      ]);

      // Update click-through rate metrics
      await this.updateClickThroughMetrics(event);
      
    } catch (error) {
      console.error('Failed to track click event:', error);
    }
  }

  /**
   * Track search abandonment events
   */
  async trackAbandonmentEvent(event: SearchAbandonmentEvent): Promise<void> {

    try {
      const query = `
        INSERT INTO marketplace_search_abandonments (
          session_id, user_id, query, time_spent_ms, scroll_depth,
          timestamp, reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await this.pool.query(query, [
        event.sessionId,
        event.userId,
        event.query,
        event.timeSpentMs,
        event.scrollDepth,
        event.timestamp,
        event.reason
      ]);

      // Update abandonment rate metrics
      await this.updateAbandonmentMetrics(event);
      
    } catch (error) {
      console.error('Failed to track abandonment event:', error);
    }
  }

  /**
   * Get comprehensive search metrics for a time period
   */
  async getSearchMetrics(
    startDate: Date,
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Promise<SearchMetrics> {

    try {
      const [
        basicMetrics,
        topQueries,
        topFilters,
        conversionData,
        performanceData
      ] = await Promise.all([
        this.getBasicMetrics(startDate, endDate),
        this.getTopQueries(startDate, endDate),
        this.getTopFilters(startDate, endDate),
        this.getConversionFunnel(startDate, endDate),
        this.getPerformanceByTime(startDate, endDate, granularity)
      ]);

      return {
        period: { start: startDate, end: endDate },
        ...basicMetrics,
        topQueries,
        topFilters,
        conversionFunnel: conversionData,
        performanceByHour: performanceData
      };
    } catch (error) {
      console.error('Failed to get search metrics:', error);
      throw error;
    }
  }

  /**
   * Get real-time search performance metrics
   */
  async getRealTimeMetrics(): Promise<any> {

    try {
      const metrics = await this.redis.hmget(
        'search:realtime',
        'total_searches_1h',
        'avg_response_time_1h',
        'p95_response_time_1h',
        'click_through_rate_1h',
        'active_searches',
        'error_rate_1h'
      );

      return {
        totalSearches1h: parseInt(metrics[0] || '0'),
        avgResponseTime1h: parseFloat(metrics[1] || '0'),
        p95ResponseTime1h: parseFloat(metrics[2] || '0'),
        clickThroughRate1h: parseFloat(metrics[3] || '0'),
        activeSearches: parseInt(metrics[4] || '0'),
        errorRate1h: parseFloat(metrics[5] || '0'),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to get real-time metrics:', error);
      return {};
    }
  }

  /**
   * Get search optimization recommendations
   */
  async getOptimizationRecommendations(
    days: number = 7
  ): Promise<SearchOptimizationRecommendations> {

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const [
        slowQueries,
        lowPerformingFilters,
        indexRecommendations,
        cacheRecommendations
      ] = await Promise.all([
        this.getSlowQueries(startDate, endDate),
        this.getLowPerformingFilters(startDate, endDate),
        this.getIndexOptimizations(),
        this.getCacheOptimizations(startDate, endDate)
      ]);

      return {
        slowQueries,
        lowPerformingFilters,
        indexOptimizations: indexRecommendations,
        cacheOptimizations: cacheRecommendations
      };
    } catch (error) {
      console.error('Failed to get optimization recommendations:', error);
      throw error;
    }
  }

  /**
   * Create A/B test for search ranking
   */
  async createSearchABTest(
    name: string,
    description: string,
    variantA: any,
    variantB: any,
    trafficSplit: number = 0.5
  ): Promise<string> {

    try {
      const query = `
        INSERT INTO marketplace_search_ab_tests (
          name, description, variant_a, variant_b, traffic_split,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
        RETURNING id
      `;
      
      const result = await this.pool.query(query, [
        name,
        description,
        JSON.stringify(variantA),
        JSON.stringify(variantB),
        trafficSplit
      ]);

      return result.rows[0].id;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      throw error;
    }
  }

  /**
   * Get A/B test assignment for a user session
   */
  async getABTestVariant(sessionId: string): Promise<'A' | 'B' | null> {

    try {
      // Check if session already has assignment
      const existing = await this.redis.get(`ab_test:${sessionId}`);
      if (existing) return existing as 'A' | 'B';

      // Get active A/B tests
      const activeTests = await this.pool.query(`
        SELECT id, traffic_split FROM marketplace_search_ab_tests 
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `);

      if (activeTests.rows.length === 0) return null;

      const test = activeTests.rows[0];
      const variant = Math.random() < test.traffic_split ? 'A' : 'B';

      // Store assignment for consistency
      await this.redis.setex(`ab_test:${sessionId}`, 86400, variant);

      return variant;
    } catch (error) {
      console.error('Failed to get A/B test variant:', error);
      return null;
    }
  }

  // Private helper methods

  private async storeSearchEvent(event: SearchEvent): Promise<void> {

    const query = `
      INSERT INTO marketplace_search_events (
        session_id, user_id, query, filters, timestamp,
        result_count, response_time_ms, source, user_agent, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    await this.pool.query(query, [
      event.sessionId,
      event.userId,
      event.query,
      JSON.stringify(event.filters),
      event.timestamp,
      event.resultCount,
      event.responseTimeMs,
      event.source,
      event.userAgent,
      event.ipAddress
    ]);
  }

  private async updateRealTimeMetrics(event: SearchEvent): Promise<void> {

    const hour = Math.floor(Date.now() / (60 * 60 * 1000));
    const key = `search:metrics:${hour}`;
    
    await Promise.all([
      this.redis.hincrby(key, 'total_searches', 1),
      this.redis.hincrby(key, 'total_response_time', event.responseTimeMs),
      this.redis.expire(key, 7200), // 2 hours
      this.updatePercentileMetrics(event.responseTimeMs)
    ]);
  }

  private async updatePercentileMetrics(responseTime: number): Promise<void> {

    // Use Redis sorted sets for percentile calculations
    const now = Date.now();
    const key = 'search:response_times';
    
    await this.redis.zadd(key, now, responseTime);
    await this.redis.zremrangebyscore(key, 0, now - 3600000); // Keep last hour
  }

  private async updateClickThroughMetrics(event: SearchClickEvent): Promise<void> {

    const hour = Math.floor(Date.now() / (60 * 60 * 1000));
    const key = `search:ctr:${hour}`;
    
    await Promise.all([
      this.redis.hincrby(key, 'total_clicks', 1),
      this.redis.expire(key, 7200)
    ]);
  }

  private async updateAbandonmentMetrics(event: SearchAbandonmentEvent): Promise<void> {

    const hour = Math.floor(Date.now() / (60 * 60 * 1000));
    const key = `search:abandonment:${hour}`;
    
    await Promise.all([
      this.redis.hincrby(key, 'total_abandonments', 1),
      this.redis.hincrby(key, `reason_${event.reason}`, 1),
      this.redis.expire(key, 7200)
    ]);
  }

  private async checkPerformanceAlerts(event: SearchEvent): Promise<void> {

    // Alert if response time exceeds threshold
    if (event.responseTimeMs > 1000) { // 1 second threshold
      console.warn(`Slow search detected: ${event.responseTimeMs}ms for query "${event.query}"`);
    }

    // Alert if no results for common queries
    if (event.resultCount === 0 && event.query.length > 3) {
      console.warn(`No results for query: "${event.query}"`);
    }
  }

  private async getBasicMetrics(startDate: Date, endDate: Date): Promise<any> {

    const query = `
      SELECT 
        COUNT(*) as total_searches,
        AVG(response_time_ms) as average_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99_response_time,
        COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate
      FROM marketplace_search_events
      WHERE timestamp BETWEEN $1 AND $2
    `;
    
    const result = await this.pool.query(query, [startDate, endDate]);
    const row = result.rows[0];
    
    // Get click-through rate
    const ctrQuery = `
      SELECT 
        COUNT(DISTINCT c.session_id)::float / COUNT(DISTINCT s.session_id) as click_through_rate,
        AVG(c.position) as average_position
      FROM marketplace_search_events s
      LEFT JOIN marketplace_search_clicks c ON s.session_id = c.session_id
      WHERE s.timestamp BETWEEN $1 AND $2
    `;
    
    const ctrResult = await this.pool.query(ctrQuery, [startDate, endDate]);
    const ctrRow = ctrResult.rows[0];
    
    return {
      totalSearches: parseInt(row.total_searches || '0'),
      averageResponseTime: parseFloat(row.average_response_time || '0'),
      p95ResponseTime: parseFloat(row.p95_response_time || '0'),
      p99ResponseTime: parseFloat(row.p99_response_time || '0'),
      successRate: parseFloat(row.success_rate || '0'),
      clickThroughRate: parseFloat(ctrRow.click_through_rate || '0'),
      averagePosition: parseFloat(ctrRow.average_position || '0'),
      abandonmentRate: 0 // TODO: Calculate from abandonment events
    };
  }

  private async getTopQueries(startDate: Date, endDate: Date): Promise<any[]> {

    const query = `
      SELECT 
        query,
        COUNT(*) as count,
        AVG(response_time_ms) as avg_response_time,
        COUNT(DISTINCT c.session_id)::float / COUNT(DISTINCT s.session_id) as click_through_rate
      FROM marketplace_search_events s
      LEFT JOIN marketplace_search_clicks c ON s.session_id = c.session_id AND s.query = c.query
      WHERE s.timestamp BETWEEN $1 AND $2 AND s.query != ''
      GROUP BY query
      HAVING COUNT(*) >= 5
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const result = await this.pool.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      query: row.query,
      count: parseInt(row.count),
      avgResponseTime: parseFloat(row.avg_response_time || '0'),
      clickThroughRate: parseFloat(row.click_through_rate || '0')
    }));
  }

  private async getTopFilters(startDate: Date, endDate: Date): Promise<any[]> {

    // This would analyze the filters JSON to find most used filters
    return []; // TODO: Implement filter analysis
  }

  private async getConversionFunnel(startDate: Date, endDate: Date): Promise<any> {

    // TODO: Implement conversion funnel analysis
    return {
      searches: 0,
      clicks: 0,
      previews: 0,
      purchases: 0
    };
  }

  private async getPerformanceByTime(
    startDate: Date,
    endDate: Date,
    granularity: string
  ): Promise<any[]> {

    // TODO: Implement time-based performance analysis
    return [];
  }

  private async getSlowQueries(startDate: Date, endDate: Date): Promise<any[]> {

    const query = `
      SELECT 
        query,
        AVG(response_time_ms) as avg_response_time,
        COUNT(*) as frequency
      FROM marketplace_search_events
      WHERE timestamp BETWEEN $1 AND $2
      GROUP BY query
      HAVING AVG(response_time_ms) > 500 AND COUNT(*) >= 3
      ORDER BY avg_response_time DESC
      LIMIT 10
    `;
    
    const result = await this.pool.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      query: row.query,
      avgResponseTime: parseFloat(row.avg_response_time),
      frequency: parseInt(row.frequency),
      recommendation: this.generateSlowQueryRecommendation(row.query, row.avg_response_time)
    }));
  }

  private async getLowPerformingFilters(startDate: Date, endDate: Date): Promise<any[]> {

    // TODO: Implement filter performance analysis
    return [];
  }

  private async getIndexOptimizations(): Promise<any[]> {

    // TODO: Implement index optimization recommendations
    return [];
  }

  private async getCacheOptimizations(startDate: Date, endDate: Date): Promise<any[]> {

    // TODO: Implement cache optimization recommendations
    return [];
  }

  private generateSlowQueryRecommendation(query: string, responseTime: number): string {
    if (responseTime > 2000) {
      return 'Consider adding specific indexes for this query pattern or implementing query caching';
    } else if (responseTime > 1000) {
      return 'Optimize query structure or add result caching for frequently used searches';
    } else {
      return 'Monitor query performance and consider preprocessing for common patterns';
    }
  }
}