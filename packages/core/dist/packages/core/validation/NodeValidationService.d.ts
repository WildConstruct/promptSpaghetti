/**
 * Node Validation Service
 * Epic 18 - Add Node Validation (E18-1753114562073-6B8498)
 *
 * Service layer for node validation with caching, monitoring, and integration
 */
import { NodeValidationResult, NodeValidationConfig } from './NodeValidationFramework';
import { EventEmitter } from 'events';
export interface ValidationServiceConfig extends NodeValidationConfig {
    /** Enable validation result caching */
    enableCaching: boolean;
    /** Cache expiration time in milliseconds */
    cacheExpirationMs: number;
    /** Enable validation monitoring */
    enableMonitoring: boolean;
    /** Batch size for bulk validation operations */
    batchSize: number;
}
export interface ValidationServiceMetrics {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    averageValidationTime: number;
    securityThreatsDetected: number;
    performanceIssuesDetected: number;
    cacheHitRate: number;
}
export interface ValidationCacheEntry {
    result: NodeValidationResult;
    timestamp: number;
    nodeHash: string;
}
export declare class NodeValidationService extends EventEmitter {
    private framework;
    private config;
    private cache;
    private metrics;
    private validationHistory;
    constructor(config?: Partial<ValidationServiceConfig>);
    private initializeMetrics;
    private getCachedResult;
    private cacheResult;
    private generateNodeHash;
}
//# sourceMappingURL=NodeValidationService.d.ts.map