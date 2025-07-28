import { EventEmitter } from 'events';
export interface DataSource {
    id: string;
    name: string;
    type: 'api' | 'database' | 'file' | 'static';
    enabled: boolean;
    endpoint?: string;
    authentication?: {
        type: 'none' | 'api_key' | 'oauth' | 'basic' | 'bearer';
        credentials: Record<string, string>;
        headers?: Record<string, string>;
    };
    caching: {
        enabled: boolean;
        ttl: number;
        strategy: 'memory' | 'disk' | 'hybrid';
        maxSize: number;
    };
    transforms: DataTransform;
    rateLimit?: {
        requests: number;
        window: number;
        burst?: number;
    };
    reliability: {
        timeout: number;
        retries: number;
        backoff: 'linear' | 'exponential';
        healthCheck?: string;
    };
    metadata: {
        description: string;
        category: 'historical' | 'cultural' | 'artistic' | 'academic' | 'commercial';
        tags: string;
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
    era: string | string;
    region?: string | string;
    category: string;
    subcategory?: string;
    keywords?: string;
    filters: Record<string, any>;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface QueryResult<T = any> {
    success: boolean;
    data: T;
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
    warnings?: string;
}
export declare class DataSourceManager extends EventEmitter {
    private static instance;
    private dataSources;
    private cache;
    private rateLimiters;
    private healthStatus;
    static getInstance(): DataSourceManager;
    /**
     * Initialize default historical data sources
     */
    private initializeDefaultSources;
    /**
     * Execute query against a specific data source
     */
    private executeQuery;
    /**
     * Query static/demo data
     */
    private queryStaticData;
    /**
     * Get medieval clothing demo data
     */
    private getMedievalClothingData;
    private buildAPIParams;
    private extractDataFromAPIResponse;
    private applyTransforms;
    private applyMappingTransform;
    private applyFilterTransform;
    private applyNormalizationTransform;
    private applyValidationTransform;
    private generateCacheKey;
    private getFromCache;
    private setCache;
    private startHealthChecks;
    private startCacheCleanup;
    private performHealthChecks;
    private cleanupCache;
    private queryDatabase;
    private queryFile;
    /**
     * Generate mock database results for demo purposes
     */
    private generateMockDatabaseResults;
}
//# sourceMappingURL=DataSourceManager.d.ts.map