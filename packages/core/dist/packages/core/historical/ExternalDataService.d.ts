/**
 * External Data Integration Service
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Manages external historical data sources and integration
 */
import { DataSource } from '../types/UTDG';
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
}
//# sourceMappingURL=ExternalDataService.d.ts.map