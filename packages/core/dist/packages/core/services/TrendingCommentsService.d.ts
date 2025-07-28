/**
 * Epic 16 Marketplace Trending Comments Service
 *
 * Core service for calculating comment trends, engagement scoring, and analytics.
 * Implements sophisticated trending algorithms with real-time score calculation.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import { TrendingAlgorithmConfig } from '../types/TrendingCommentsTypes';
export declare class TrendingCommentsService {
    private baseUrl;
    private algorithms;
    private defaultAlgorithm;
    private cacheEnabled;
    private scoreCache;
    private trendingCache;
    constructor(config: {});
    baseUrl: string;
    algorithms?: TrendingAlgorithmConfig;
    defaultAlgorithm?: string;
    cacheEnabled?: boolean;
    cacheTTL?: number;
}
//# sourceMappingURL=TrendingCommentsService.d.ts.map