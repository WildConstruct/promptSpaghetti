// packages/core/external-data/DataSourceManager.ts
// Epic 8.8 Task 1: External Data Integration Architecture

import { EventEmitter } from 'events';

// Core interfaces for external data integration
export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'static';
  enabled: boolean;
  
  // Connection configuration
  endpoint?: string;
  authentication?: {
    type: 'none' | 'api_key' | 'oauth' | 'basic' | 'bearer';
    credentials: Record<string, string>;
    headers?: Record<string, string>;
  };
  
  // Caching strategy
  caching: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
    strategy: 'memory' | 'disk' | 'hybrid';
    maxSize: number; // Max cache size in MB
  };
  
  // Data transformation pipeline
  transforms: DataTransform[];
  
  // Rate limiting
  rateLimit?: {
    requests: number;
    window: number; // Window in seconds
    burst?: number;
  };
  
  // Quality and reliability
  reliability: {
    timeout: number;
    retries: number;
    backoff: 'linear' | 'exponential';
    healthCheck?: string; // URL for health checks
  };
  
  // Metadata
  metadata: {
    description: string;
    category: 'historical' | 'cultural' | 'artistic' | 'academic' | 'commercial';
    tags: string[];
    lastSync?: string;
    version?: string;
  };
}

export interface DataTransform {
  id: string;
  name: string;
  type: 'map' | 'filter' | 'aggregate' | 'validate' | 'normalize';
  config: Record<string, any>;
  enabled: boolean;
}

export interface HistoricalQuery {
  era: string | string[]; // e.g., 'medieval', 'renaissance'
  region?: string | string[]; // e.g., 'europe', 'england'
  category: string; // e.g., 'clothing', 'architecture', 'materials'
  subcategory?: string; // e.g., 'nobility', 'peasant', 'clergy'
  
  // Search parameters
  keywords?: string[];
  filters: Record<string, any>;
  
  // Query options
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryResult<T = any> {
  success: boolean;
  data: T[];
  metadata: {
    total: number;
    offset: number;
    limit: number;
    query: HistoricalQuery;
    source: string;
    cached: boolean;
    executionTime: number;
  };
  error?: string;
  warnings?: string[];
}

// Cache interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number; // Size in bytes
}

// Main data source manager
export class DataSourceManager extends EventEmitter {
  private static instance: DataSourceManager;
  private dataSources = new Map<string, DataSource>();
  private cache = new Map<string, CacheEntry>();
  private rateLimiters = new Map<string, RateLimiter>();
  private healthStatus = new Map<string, boolean>();

  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }
    return DataSourceManager.instance;
  }

  constructor() {
    super();
    this.initializeDefaultSources();
    this.startHealthChecks();
    this.startCacheCleanup();
  }

  /**
   * Initialize default historical data sources
   */
  private initializeDefaultSources(): void {
    // Getty Research Institute
    this.registerDataSource({
      id: 'getty-research',
      name: 'Getty Research Institute',
      type: 'api',
      enabled: true,
      endpoint: 'https://data.getty.edu/vocab/api',
      authentication: {
        type: 'none',
        credentials: {}
      },
      caching: {
        enabled: true,
        ttl: 3600, // 1 hour
        strategy: 'hybrid',
        maxSize: 50 // 50MB
      },
      transforms: [
        {
          id: 'getty-normalize',
          name: 'Getty Data Normalizer',
          type: 'normalize',
          config: {
            dateFormat: 'iso',
            textFields: ['preferred_label', 'description'],
            imageFields: ['thumbnail', 'image_url']
          },
          enabled: true
        }
      ],
      rateLimit: {
        requests: 100,
        window: 60,
        burst: 10
      },
      reliability: {
        timeout: 10000,
        retries: 3,
        backoff: 'exponential',
        healthCheck: 'https://data.getty.edu/vocab/api/health'
      },
      metadata: {
        description: 'Getty Research Institute Art & Architecture Thesaurus',
        category: 'cultural',
        tags: ['art', 'architecture', 'historical', 'authoritative'],
        version: '1.0'
      }
    });

    // Metropolitan Museum of Art
    this.registerDataSource({
      id: 'met-museum',
      name: 'Metropolitan Museum API',
      type: 'api',
      enabled: true,
      endpoint: 'https://collectionapi.metmuseum.org/public/collection/v1',
      authentication: {
        type: 'none',
        credentials: {}
      },
      caching: {
        enabled: true,
        ttl: 7200, // 2 hours
        strategy: 'hybrid',
        maxSize: 100 // 100MB
      },
      transforms: [
        {
          id: 'met-mapper',
          name: 'Met Data Mapper',
          type: 'map',
          config: {
            mapping: {
              'title': 'name',
              'artistDisplayName': 'artist',
              'objectDate': 'era',
              'culture': 'region',
              'medium': 'materials',
              'primaryImageSmall': 'image'
            }
          },
          enabled: true
        }
      ],
      rateLimit: {
        requests: 80,
        window: 60
      },
      reliability: {
        timeout: 15000,
        retries: 2,
        backoff: 'linear'
      },
      metadata: {
        description: 'Metropolitan Museum of Art Collection Database',
        category: 'cultural',
        tags: ['museum', 'art', 'artifacts', 'historical'],
        version: '1.0'
      }
    });

    // Medieval clothing database (demo source)
    this.registerDataSource({
      id: 'medieval-clothing',
      name: 'Medieval Clothing Database',
      type: 'static',
      enabled: true,
      caching: {
        enabled: true,
        ttl: 86400, // 24 hours
        strategy: 'memory',
        maxSize: 10 // 10MB
      },
      transforms: [
        {
          id: 'medieval-classifier',
          name: 'Medieval Period Classifier',
          type: 'validate',
          config: {
            eraValidation: {
              'early-medieval': { start: 500, end: 1000 },
              'high-medieval': { start: 1000, end: 1300 },
              'late-medieval': { start: 1300, end: 1500 }
            }
          },
          enabled: true
        }
      ],
      reliability: {
        timeout: 1000,
        retries: 1,
        backoff: 'linear'
      },
      metadata: {
        description: 'Curated medieval clothing and materials database',
        category: 'historical',
        tags: ['medieval', 'clothing', 'materials', 'demo'],
        version: '1.0'
      }
    });
  }

  /**
   * Register a new data source
   */
  registerDataSource(source: DataSource): void {
    this.dataSources.set(source.id, source);
    
    // Initialize rate limiter if needed
    if (source.rateLimit) {
      this.rateLimiters.set(source.id, new RateLimiter(source.rateLimit));
    }
    
    this.emit('sourceRegistered', source);
  }

  /**
   * Query historical data from configured sources
   */
  async queryHistoricalData(
    query: HistoricalQuery,
    sourceIds?: string[]
  ): Promise<QueryResult[]> {
    const results: QueryResult[] = [];
    const sources = sourceIds 
      ? Array.from(this.dataSources.values()).filter(s => sourceIds.includes(s.id))
      : Array.from(this.dataSources.values()).filter(s => s.enabled);

    const startTime = Date.now();

    // Execute queries in parallel
    const queryPromises = sources.map(async (source) => {
      try {
        const result = await this.executeQuery(source, query);
        results.push(result);
        return result;
      } catch (error) {
        const errorResult: QueryResult = {
          success: false,
          data: [],
          metadata: {
            total: 0,
            offset: query.offset || 0,
            limit: query.limit || 50,
            query,
            source: source.id,
            cached: false,
            executionTime: Date.now() - startTime
          },
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(errorResult);
        return errorResult;
      }
    });

    await Promise.all(queryPromises);

    this.emit('queryComplete', {
      query,
      results,
      totalTime: Date.now() - startTime
    });

    return results;
  }

  /**
   * Execute query against a specific data source
   */
  private async executeQuery(source: DataSource, query: HistoricalQuery): Promise<QueryResult> {
    const cacheKey = this.generateCacheKey(source.id, query);
    const startTime = Date.now();

    // Check cache first
    if (source.caching.enabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached.data,
          metadata: {
            total: cached.data.length,
            offset: query.offset || 0,
            limit: query.limit || 50,
            query,
            source: source.id,
            cached: true,
            executionTime: Date.now() - startTime
          }
        };
      }
    }

    // Check rate limiting
    const rateLimiter = this.rateLimiters.get(source.id);
    if (rateLimiter && !rateLimiter.allowRequest()) {
      throw new Error(`Rate limit exceeded for source: ${source.id}`);
    }

    // Execute actual query
    let data: any[] = [];
    
    switch (source.type) {
      case 'api':
        data = await this.queryAPI(source, query);
        break;
      case 'database':
        data = await this.queryDatabase(source, query);
        break;
      case 'file':
        data = await this.queryFile(source, query);
        break;
      case 'static':
        data = await this.queryStaticData(source, query);
        break;
    }

    // Apply transforms
    data = await this.applyTransforms(data, source.transforms);

    // Cache results
    if (source.caching.enabled && data.length > 0) {
      this.setCache(cacheKey, data, source.caching.ttl);
    }

    return {
      success: true,
      data,
      metadata: {
        total: data.length,
        offset: query.offset || 0,
        limit: query.limit || 50,
        query,
        source: source.id,
        cached: false,
        executionTime: Date.now() - startTime
      }
    };
  }

  /**
   * Query API data source
   */
  private async queryAPI(source: DataSource, query: HistoricalQuery): Promise<any[]> {
    if (!source.endpoint) {
      throw new Error(`API endpoint not configured for source: ${source.id}`);
    }

    // Build query parameters based on source
    const params = this.buildAPIParams(source, query);
    const url = new URL(source.endpoint);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Wild-Construct/1.0',
      ...source.authentication?.headers
    };

    // Add authentication
    if (source.authentication) {
      switch (source.authentication.type) {
        case 'api_key':
          headers['X-API-Key'] = source.authentication.credentials.api_key;
          break;
        case 'bearer':
          headers['Authorization'] = `Bearer ${source.authentication.credentials.token}`;
          break;
        case 'basic':
          const auth = btoa(`${source.authentication.credentials.username}:${source.authentication.credentials.password}`);
          headers['Authorization'] = `Basic ${auth}`;
          break;
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(source.reliability.timeout)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    return this.extractDataFromAPIResponse(source, responseData);
  }

  /**
   * Query static/demo data
   */
  private async queryStaticData(source: DataSource, query: HistoricalQuery): Promise<any[]> {
    // Demo medieval clothing data
    if (source.id === 'medieval-clothing') {
      return this.getMedievalClothingData(query);
    }

    return [];
  }

  /**
   * Get medieval clothing demo data
   */
  private getMedievalClothingData(query: HistoricalQuery): any[] {
    const medievalData = [
      {
        id: 'medieval-tunic-001',
        name: 'Noble Tunic',
        category: 'clothing',
        subcategory: 'nobility',
        era: 'high-medieval',
        period: { start: 1100, end: 1300 },
        region: 'england',
        description: 'Fine wool tunic with embroidered trim, worn by nobility',
        materials: ['wool', 'silk thread', 'gold thread'],
        colors: ['deep blue', 'crimson', 'forest green'],
        authenticity: 0.9,
        source: 'medieval-fashion-history',
        tags: ['noble', 'formal', 'embroidered', 'high-status']
      },
      {
        id: 'medieval-hood-001',
        name: 'Peasant Hood',
        category: 'clothing',
        subcategory: 'peasant',
        era: 'high-medieval',
        period: { start: 1000, end: 1400 },
        region: 'europe',
        description: 'Simple wool hood for protection from weather',
        materials: ['coarse wool', 'hemp cord'],
        colors: ['brown', 'grey', 'undyed'],
        authenticity: 0.95,
        source: 'archaeological-findings',
        tags: ['peasant', 'practical', 'weather-protection', 'common']
      },
      {
        id: 'medieval-surcoat-001',
        name: 'Knight Surcoat',
        category: 'clothing',
        subcategory: 'military',
        era: 'high-medieval',
        period: { start: 1150, end: 1350 },
        region: 'france',
        description: 'Sleeveless garment worn over armor with heraldic design',
        materials: ['linen', 'wool', 'silk'],
        colors: ['royal blue', 'gold', 'silver'],
        authenticity: 0.88,
        source: 'military-history',
        tags: ['knight', 'heraldic', 'armor', 'military', 'ceremonial']
      }
    ];

    // Filter based on query
    return medievalData.filter(item => {
      if (query.era && !query.era.includes(item.era)) return false;
      if (query.region && !query.region.includes(item.region)) return false;
      if (query.category && item.category !== query.category) return false;
      if (query.subcategory && item.subcategory !== query.subcategory) return false;
      
      return true;
    });
  }

  // Additional helper methods would continue here...
  private buildAPIParams(source: DataSource, query: HistoricalQuery): Record<string, any> {
    // Build API-specific parameters
    return {
      q: query.keywords?.join(' '),
      era: Array.isArray(query.era) ? query.era.join(',') : query.era,
      category: query.category,
      limit: query.limit || 50,
      offset: query.offset || 0
    };
  }

  private extractDataFromAPIResponse(source: DataSource, response: any): any[] {
    // Extract data based on source format
    if (source.id === 'getty-research') {
      return response.results || [];
    }
    if (source.id === 'met-museum') {
      return response.objects || [];
    }
    return response.data || response.results || [response];
  }

  private async applyTransforms(data: any[], transforms: DataTransform[]): Promise<any[]> {
    let result = data;
    
    for (const transform of transforms.filter(t => t.enabled)) {
      switch (transform.type) {
        case 'map':
          result = this.applyMappingTransform(result, transform.config);
          break;
        case 'filter':
          result = this.applyFilterTransform(result, transform.config);
          break;
        case 'normalize':
          result = this.applyNormalizationTransform(result, transform.config);
          break;
        case 'validate':
          result = this.applyValidationTransform(result, transform.config);
          break;
      }
    }
    
    return result;
  }

  private applyMappingTransform(data: any[], config: any): any[] {
    const mapping = config.mapping;
    return data.map(item => {
      const mapped: any = {};
      for (const [oldKey, newKey] of Object.entries(mapping)) {
        if (item[oldKey] !== undefined) {
          mapped[newKey] = item[oldKey];
        }
      }
      return { ...item, ...mapped };
    });
  }

  private applyFilterTransform(data: any[], config: any): any[] {
    // Apply filtering logic
    return data; // Placeholder
  }

  private applyNormalizationTransform(data: any[], config: any): any[] {
    // Apply normalization logic
    return data; // Placeholder
  }

  private applyValidationTransform(data: any[], config: any): any[] {
    // Apply validation logic
    return data; // Placeholder
  }

  // Cache management methods
  private generateCacheKey(sourceId: string, query: HistoricalQuery): string {
    return `${sourceId}:${JSON.stringify(query)}`;
  }

  private getFromCache<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry as CacheEntry<T>;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    const size = JSON.stringify(data).length;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size
    });
  }

  // Health check and cleanup
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Every 5 minutes
  }

  private async performHealthChecks(): Promise<void> {
    // Perform health checks on all sources
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  // Database and file query methods (stubs for now)
  private async queryDatabase(source: DataSource, query: HistoricalQuery): Promise<any[]> {
    throw new Error('Database queries not yet implemented');
  }

  private async queryFile(source: DataSource, query: HistoricalQuery): Promise<any[]> {
    throw new Error('File queries not yet implemented');
  }
}

// Rate limiter implementation
class RateLimiter {
  private requests: number[] = [];
  private config: { requests: number; window: number; burst?: number };

  constructor(config: { requests: number; window: number; burst?: number }) {
    this.config = config;
  }

  allowRequest(): boolean {
    const now = Date.now();
    const windowStart = now - (this.config.window * 1000);
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);
    
    // Check limit
    if (this.requests.length >= this.config.requests) {
      return false;
    }
    
    // Add current request
    this.requests.push(now);
    return true;
  }
}

// Export singleton
export const dataSourceManager = DataSourceManager.getInstance();