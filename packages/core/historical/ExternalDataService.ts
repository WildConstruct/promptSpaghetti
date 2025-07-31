/**
 * External Data Integration Service
 * Epic 8.8: Historical Data Integration Foundation
 * 
 * Manages external historical data sources and integration
 */
import {
  DataSource,
  HistoricalQuery,
  HistoricalQueryResult,
  UTDGNode,
  Era,
  AuthConfig,
  DataTransform,
  UTDGNodeType
} from '../types/UTDG';

}
export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  source_id: string;
}
}

}
export interface DataSourceRegistry {
  [sourceId: string]: DataSource;
}
}

export class ExternalDataService {
  private dataSources: DataSourceRegistry = {};
  private cache: Map<string, CacheEntry> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor() {
    this.initializeDefaultDataSources();
  }

  /**
   * Register a new data source
   */
  registerDataSource(dataSource: DataSource): void {
    this.dataSources[dataSource.id] = dataSource;
    if (dataSource.rate_limiting) {
      this.rateLimiters.set(dataSource.id, new RateLimiter(dataSource.rate_limiting));
    }
  }

  /**
   * Remove a data source
   */
  unregisterDataSource(sourceId: string): void {
    delete this.dataSources[sourceId];
    this.rateLimiters.delete(sourceId);
    this.clearCacheForSource(sourceId);
  }

  /**
   * Get all registered data sources
   */
  getDataSources(): DataSource[] {
    return Object.values(this.dataSources);
  }

  /**
   * Get a specific data source by ID
   */
  getDataSource(sourceId: string): DataSource | null {
    return this.dataSources[sourceId] || null;
  }

  /**
   * Query historical data from external sources
   */
  async queryHistoricalData(query: HistoricalQuery, sourceIds?: string[]): Promise<HistoricalQueryResult> {

    const startTime = performance.now();
    const sourcesUsed: string[] = [];

    // Generate cache key
    const cacheKey = this.generateCacheKey(query, sourceIds);

    // Check cache first
    const cachedResult = this.getCachedData(cacheKey);
    if (cachedResult) {
      return {
        nodes: cachedResult.data.nodes,
        total_count: cachedResult.data.total_count,
        query_metadata: {
          query_time: performance.now() - startTime,
          cache_hit: true,
          sources_used: cachedResult.data.sources_used,
        },
      };
    }

    // Determine which sources to query
    const targetSources = sourceIds ? 
      sourceIds.map(id => this.dataSources[id]).filter(Boolean) :
      this.getSourcesForQuery(query);

    const allResults: UTDGNode[] = [];

    // Query each source
    for (const source of targetSources) {
      try {
        // Check rate limiting
        const rateLimiter = this.rateLimiters.get(source.id);
        if (rateLimiter && !rateLimiter.canMakeRequest()) {
          console.warn(`Rate limit exceeded for source ${source.id}, skipping...`);
          continue;
        }

        const sourceResults = await this.queryDataSource(source, query);
        allResults.push(...sourceResults);
        sourcesUsed.push(source.id);

        // Update rate limiter
        if (rateLimiter) {
          rateLimiter.recordRequest();
        }
      } catch (error) {
        console.error(`Error querying source ${source.id}:`, error);
      }
    }

    // Process and deduplicate results
    const processedResults = this.processResults(allResults, query);

    const result: HistoricalQueryResult = {
      nodes: processedResults.slice(0, query.limit || 50),
      total_count: processedResults.length,
      query_metadata: {
        query_time: performance.now() - startTime,
        cache_hit: false,
        sources_used: sourcesUsed,
      },
    };

    // Cache the result
    if (result.nodes.length > 0) {
      this.setCachedData(cacheKey, {
        nodes: result.nodes,
        total_count: result.total_count,
        sources_used: sourcesUsed,
      });
    }

    return result;
  }

  /**
   * Import data from a specific source with transformation
   */
  async importFromSource(sourceId: string, query: HistoricalQuery): Promise<UTDGNode[]> {

    const source = this.dataSources[sourceId];
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }

    const rawData = await this.queryDataSource(source, query);
    return this.applyTransforms(rawData, source.transforms);
  }

  /**
   * Validate and test a data source connection
   */
  async validateDataSource(sourceId: string): Promise<{valid: boolean, error?: string, sample_data?: any}> {

    const source = this.dataSources[sourceId];
    if (!source) {
      return {valid: false, error: 'Data source not found'};
    }

    try {
      // Test with a minimal query
      const testQuery: HistoricalQuery = {
        era: 'medieval',
        category: 'material',
        filters: {},
        limit: 1
      };

      const results = await this.queryDataSource(source, testQuery);
      return {
        valid: true,
        sample_data: results[0] || null,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear cache for all or specific sources
   */
  clearCache(sourceId?: string): void {
    if (sourceId) {
      this.clearCacheForSource(sourceId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {total_entries: number, total_size: number, hit_rate: number} {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((size, entry) => {
      return size + JSON.stringify(entry.data).length;
    }, 0);

    return {
      total_entries: entries.length,
      total_size: totalSize,
      hit_rate: 0 // Would need to track hits/misses over time
    };
  }

  /**
   * Query a specific data source
   */
  private async queryDataSource(source: DataSource, query: HistoricalQuery): Promise<UTDGNode[]> {

    switch (source.type) {
      case 'api':
        return this.queryApiSource(source, query);
      case 'database':
        return this.queryDatabaseSource(source, query);
      case 'file':
        return this.queryFileSource(source, query);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  /**
   * Query an API-based data source
   */
  private async queryApiSource(source: DataSource, query: HistoricalQuery): Promise<UTDGNode[]> {

    if (!source.endpoint) {
      throw new Error('API source requires endpoint');
    }

    const url = this.buildApiUrl(source.endpoint, query);
    const headers = this.buildAuthHeaders(source.authentication);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.applyTransforms(data, source.transforms);
    } catch (error) {
      throw new Error(`API source query failed: ${error}`);
    }
  }

  /**
   * Query a database-based data source (placeholder)
   */
  private async queryDatabaseSource(source: DataSource, query: HistoricalQuery): Promise<UTDGNode[]> {

    // This would integrate with actual database connectors
    throw new Error('Database sources not implemented yet');
  }

  /**
   * Query a file-based data source (JSON/CSV files)
   */
  private async queryFileSource(source: DataSource, query: HistoricalQuery): Promise<UTDGNode[]> {

    if (!source.endpoint) {
      throw new Error('File source requires file path');
    }
    
    try {
      const response = await fetch(source.endpoint);
      if (!response.ok) {
        throw new Error(`File access failed: ${response.status}`);
      }

      let data;
      if (source.endpoint.endsWith('.json')) {
        data = await response.json();
      } else if (source.endpoint.endsWith('.csv')) {
        const text = await response.text();
        data = this.parseCsvData(text);
      } else {
        throw new Error('Unsupported file format');
      }

      return this.applyTransforms(data, source.transforms);
    } catch (error) {
      throw new Error(`File source query failed: ${error}`);
    }
  }

  /**
   * Apply data transformations
   */
  private applyTransforms(data: any, transforms: DataTransform[]): UTDGNode[] {
    let transformedData = data;

    for (const transform of transforms) {
      switch (transform.type) {
        case 'map_fields':
          transformedData = this.mapFields(transformedData, transform.config);
          break;
        case 'filter':
          transformedData = this.filterData(transformedData, transform.config);
          break;
        case 'validate':
          transformedData = this.validateData(transformedData, transform.config);
          break;
        case 'enrich':
          transformedData = this.enrichData(transformedData, transform.config);
          break;
      }
    }

    // Ensure result is array of UTDGNode objects
    if (!Array.isArray(transformedData)) {
      transformedData = [transformedData];
    }
    return transformedData.filter(this.isValidUTDGNode);
  }
  
  /**
   * Map external data fields to UTDG format
   */
  private mapFields(data: any, config: any): UTDGNode[] {
    const fieldMapping = config.field_mapping || {};
    return data.map(item => {
      const node: Partial<UTDGNode> = {
        id: item[fieldMapping.id] || `imported_${Date.now()}_${Math.random()}`,
        type: item[fieldMapping.type] || 'material',
        content: item[fieldMapping.content] || item.name || item.description,
        description: item[fieldMapping.description],
        metadata: {
          era: this.parseEras(item[fieldMapping.era] || item.period),
          authenticity: parseFloat(item[fieldMapping.authenticity]) || 0.5,
          source: config.source_name || 'external',
          tags: this.parseTags(item[fieldMapping.tags] || item.keywords || []),
        },
        relationships: {
          compatible: [],
          incompatible: [],
          variations: [],
        },
        constraints: []
      };
      return node as UTDGNode;
    });
  }

  /**
   * Filter data based on criteria
   */
  private filterData(data: any, config: any): any {
    return data.filter(item => {
      for (const [field, value] of Object.entries(config.filters || {})) {
        if (item[field] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Validate data quality
   */
  private validateData(data: any, config: any): any {
    return data.filter(item => {
      // Basic validation
      if (!item.name && !item.content && !item.description) {
        return false;
      }

      // Custom validation rules
      if (config.required_fields) {
        for (const field of config.required_fields) {
          if (!item[field]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  /**
   * Enrich data with additional metadata
   */
  private enrichData(data: any, config: any): any {
    return data.map(item => ({
      ...item,
      ...config.additional_fields,
      enriched_at: new Date().toISOString(),
    }));
  }

  /**
   * Check if object is a valid UTDG node
   */
  private isValidUTDGNode(node: any): node is UTDGNode {
    return node && 
           typeof node.id === 'string' &&
           typeof node.type === 'string' &&
           typeof node.content === 'string' &&
           node.metadata && 
           Array.isArray(node.metadata.era) &&
           typeof node.metadata.authenticity === 'number';
  }

  /**
   * Parse era information from external data
   */
  private parseEras(eraData: any): Era[] {
    if (!eraData) return [];
    
    if (typeof eraData === 'string') {
      // Try to match against known eras
      const eraName = eraData.toLowerCase();
      for (const [key, era] of Object.entries(require('../types/UTDG').HISTORICAL_ERAS)) {
        if (era.name.toLowerCase().includes(eraName) || eraName.includes(era.name.toLowerCase())) {
          return [era];
        }
      }
      
      // Create a generic era
      return [{
        name: eraData,
        period: { start: 1000, end: 1500 }, // Default medieval
        region: ['Unknown'],
        accuracy: 'low'
      }];
    }
    
    if (Array.isArray(eraData)) {
      return eraData.map(this.parseEras).flat();
    }
    
    return [];
  }

  /**
   * Parse tags from external data
   */
  private parseTags(tagData: any): string[] {
    if (!tagData) return [];
    if (typeof tagData === 'string') {
      return tagData.split(',').map(tag => tag.trim());
    }
    if (Array.isArray(tagData)) {
      return tagData.map(tag => String(tag).trim());
    }
    return [];
  }

  /**
   * Build API URL with query parameters
   */
  private buildApiUrl(endpoint: string, query: HistoricalQuery): string {
    const url = new URL(endpoint);
    
    // Add query parameters
    if (query.era) {
      url.searchParams.set('era', Array.isArray(query.era) ? query.era.join(',') : query.era);
    }
    if (query.region) {
      url.searchParams.set('region', Array.isArray(query.region) ? query.region.join(',') : query.region);
    }
    if (query.category) {
      url.searchParams.set('category', Array.isArray(query.category) ? query.category.join(',') : query.category);
    }
    if (query.limit) {
      url.searchParams.set('limit', query.limit.toString());
    }
    if (query.offset) {
      url.searchParams.set('offset', query.offset.toString());
    }
    
    return url.toString();
  }

  /**
   * Build authentication headers
   */
  private buildAuthHeaders(auth?: AuthConfig): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (!auth) return headers;

    switch (auth.type) {
      case 'api_key':
        headers['X-API-Key'] = auth.credentials.api_key;
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${auth.credentials.token}`;
        break;
      case 'basic':
        const encoded = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        headers['Authorization'] = `Basic ${encoded}`;
        break;
    }

    return headers;
  }

  /**
   * Parse CSV data
   */
  private parseCsvData(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      return item;
    });
  }

  /**
   * Get appropriate sources for a query
   */
  private getSourcesForQuery(query: HistoricalQuery): DataSource[] {
    return Object.values(this.dataSources).filter(source => {
      // Check if source covers the query era
      if (query.era) {
        const queryEras = Array.isArray(query.era) ? query.era : [query.era];
        const sourceCoverage = source.metadata.coverage_eras.map(era => era.name.toLowerCase());
        const hasEraOverlap = queryEras.some(era => 
          sourceCoverage.some(covered => 
            covered.includes(era.toLowerCase()) || era.toLowerCase().includes(covered)
          )
        );
        if (!hasEraOverlap) return false;
      }

      // Check if source covers the query data types
      if (query.category) {
        const queryTypes = Array.isArray(query.category) ? query.category : [query.category];
        const hasTypeOverlap = queryTypes.some(type => 
          source.metadata.data_types.includes(type)
        );
        if (!hasTypeOverlap) return false;
      }

      return true;
    });
  }

  /**
   * Process and deduplicate results
   */
  private processResults(results: UTDGNode[], query: HistoricalQuery): UTDGNode[] {
    // Remove duplicates based on content similarity
    const unique = results.filter((node, index, array) => {
      return !array.slice(0, index).some(other => 
        other.content === node.content || 
        this.calculateSimilarity(other.content, node.content) > 0.9
      );
    });

    // Sort by relevance (authenticity, era match, etc.)
    return unique.sort((a, b) => {
      if (query.sort_by === 'authenticity') {
        return b.metadata.authenticity - a.metadata.authenticity;
      }
      return 0; // Default order
    });
  }

  /**
   * Calculate content similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(query: HistoricalQuery, sourceIds?: string[]): string {
    const keyData = {
      ...query,
      sources: sourceIds?.sort() || 'all',
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Cache query result
   */
  private setCachedData(key: string, data: any): void {
    // Use default TTL of 1 hour
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: 3600,
      source_id: 'combined',
    };
    this.cache.set(key, entry);
  }

  /**
   * Clear cache for specific source
   */
  private clearCacheForSource(sourceId: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.source_id === sourceId || entry.source_id === 'combined') {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Initialize default data sources
   */
  private initializeDefaultDataSources(): void {
    // Medieval demo source
    this.registerDataSource({
      id: 'medieval_demo',
      name: 'Medieval Demo Database',
      type: 'file',
      endpoint: '/data/medieval-demo.json',
      caching: {
        enabled: true,
        ttl: 3600,
        strategy: 'memory',
      },
      transforms: [
        {
          type: 'map_fields',
          config: {
            field_mapping: {
              id: 'id',
              type: 'item_type',
              content: 'description',
              era: 'period',
              authenticity: 'accuracy',
              tags: 'categories',
            },
            source_name: 'Medieval Demo'
          },
          description: 'Map medieval demo fields to UTDG format'
        }
      ],
      metadata: {
        description: 'Historical medieval clothing and materials demo database',
        coverage_eras: [require('../types/UTDG').HISTORICAL_ERAS.MEDIEVAL_HIGH],
        data_types: ['garment', 'material', 'accessory'],
        accuracy_level: 'high',
        last_validated: new Date().toISOString(),
      }
    });
  }
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  private requests: number[] = [];

  constructor(private limits: {requests_per_minute: number, requests_per_hour: number}) {}

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Clean old requests
    this.requests = this.requests.filter(time => now - time < 3600000); // 1 hour
    const recentRequests = this.requests.filter(time => now - time < 60000); // 1 minute

    return recentRequests.length < this.limits.requests_per_minute &&
           this.requests.length < this.limits.requests_per_hour;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}

export default ExternalDataService;