/**
 * External Data Integration Service
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Manages external historical data sources and integration
 */
import { DataSource, HistoricalQuery, HistoricalQueryResult, UTDGNode } from '../types/UTDG';
export interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
    source_id: string;
}
export interface DataSourceRegistry {
    [sourceId: string]: DataSource;
}
export declare class ExternalDataService {
    private dataSources;
    private cache;
    private rateLimiters;
    constructor();
    /**
     * Register a new data source
     */
    registerDataSource(dataSource: DataSource): void;
    /**
     * Remove a data source
     */
    unregisterDataSource(sourceId: string): void;
    /**
     * Get all registered data sources
     */
    getDataSources(): DataSource[];
    /**
     * Get a specific data source by ID
     */
    getDataSource(sourceId: string): DataSource | null;
    /**
     * Query historical data from external sources
     */
    queryHistoricalData(query: HistoricalQuery, sourcIds?: string[]): Promise<HistoricalQueryResult>;
    /**
     * Import data from a specific source with transformation
     */
    importFromSource(sourceId: string, query: HistoricalQuery): Promise<UTDGNode[]>;
    /**
     * Validate and test a data source connection
     */
    validateDataSource(sourceId: string): Promise<{
        valid: boolean;
        error?: string;
        sample_data?: any;
    }>;
    /**
     * Clear cache for all or specific sources
     */
    clearCache(sourceId?: string): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        total_entries: number;
        total_size: number;
        hit_rate: number;
    };
    /**
     * Query a specific data source
     */
    private queryDataSource;
    /**
     * Query an API-based data source
     */
    private queryApiSource;
    /**
     * Query a database-based data source (placeholder)
     */
    private queryDatabaseSource;
    /**
     * Query a file-based data source (JSON/CSV files)
     */
    private queryFileSource;
    /**
     * Apply data transformations
     */
    private applyTransforms;
    /**
     * Map external data fields to UTDG format
     */
    private mapFields;
    /**
     * Filter data based on criteria
     */
    private filterData;
    /**
     * Validate data quality
     */
    private validateData;
    /**
     * Enrich data with additional metadata
     */
    private enrichData;
    /**
     * Check if object is a valid UTDG node
     */
    private isValidUTDGNode;
    /**
     * Parse era information from external data
     */
    private parseEras;
    /**
     * Parse tags from external data
     */
    private parseTags;
    /**
     * Build API URL with query parameters
     */
    private buildApiUrl;
    /**
     * Build authentication headers
     */
    private buildAuthHeaders;
    /**
     * Parse CSV data
     */
    private parseCsvData;
    /**
     * Get appropriate sources for a query
     */
    private getSourcesForQuery;
    /**
     * Process and deduplicate results
     */
    private processResults;
    /**
     * Calculate content similarity
     */
    private calculateSimilarity;
    /**
     * Generate cache key for query
     */
    private generateCacheKey;
    /**
     * Get cached data if valid
     */
    private getCachedData;
    /**
     * Cache query result
     */
    private setCachedData;
    /**
     * Clear cache for specific source
     */
    private clearCacheForSource;
    /**
     * Initialize default data sources
     */
    private initializeDefaultDataSources;
}
export default ExternalDataService;
//# sourceMappingURL=ExternalDataService.d.ts.map