/**
 * Node Validation Service
 * Epic 18 - Add Node Validation (E18-1753114562073-6B8498)
 *
 * Service layer for node validation with caching, monitoring, and integration
 */
import { NodeValidationResult, NodeValidationConfig } from './NodeValidationFramework';
import { AdvancedNodeData } from '../runtime/advanced';
import { EventEmitter } from 'events';

}
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


/**
 * Node Validation Service with caching, monitoring, and batch operations
 */
export declare class NodeValidationService extends EventEmitter {
    private framework;
    private config;
    private cache;
    private metrics;
    private validationHistory;
    constructor(config?: Partial<ValidationServiceConfig>);
    /**
     * Validate a single node with caching and monitoring
     */
    validateNode(nodeData: AdvancedNodeData): Promise<NodeValidationResult>;
    /**
     * Validate multiple nodes in batch with parallel processing
     */
    validateNodeBatch(nodes: AdvancedNodeData[]): Promise<NodeValidationResult[]>;
    /**
     * Validate node with real-time streaming results
     */
    validateNodeStream(nodes: AdvancedNodeData[]): AsyncGenerator<{
        index: number;
        node: AdvancedNodeData;
        result: NodeValidationResult;
}
    }>;
    /**
     * Get validation service metrics
     */
    getMetrics(): ValidationServiceMetrics;
    /**
     * Clear validation cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
        oldestEntry: number;
        newestEntry: number;
    };
    /**
     * Configure validation settings at runtime
     */
    updateConfig(newConfig: Partial<ValidationServiceConfig>): void;
    /**
     * Export validation report
     */
    exportValidationReport(nodes: AdvancedNodeData[], results: NodeValidationResult[]): string;
    private initializeMetrics;
    private getCachedResult;
    private cacheResult;
    private generateNodeHash;
    private updateMetrics;
    private cleanupCache;
    private emitValidationEvent;
    private chunkArray;

export default NodeValidationService;
//# sourceMappingURL=NodeValidationService.d.ts.map