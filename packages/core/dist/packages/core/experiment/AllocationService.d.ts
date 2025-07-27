/**
 * Epic 14 Story 14.2 - Traffic Allocation & Randomization
 * Service for managing user assignments and traffic allocation
 */
import { AssignmentRequest, AssignmentResponse, UserAssignment, Experiment, AllocationServiceConfig } from '../types/experiment';
export interface AllocationCache {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds: number): Promise<void>;
    del(key: string): Promise<void>;
}
export interface AssignmentStorage {
    getAssignment(userId: string, experimentId: string): Promise<UserAssignment | null>;
    saveAssignment(assignment: UserAssignment): Promise<void>;
    getExperiment(experimentId: string): Promise<Experiment | null>;
}
export interface AssignmentMetrics {
    recordAssignment(assignment: UserAssignment): Promise<void>;
    recordOverride(userId: string, experimentId: string, variantId: string, reason: string): Promise<void>;
    recordExclusion(userId: string, experimentId: string, reason: string): Promise<void>;
}
export declare class AllocationService {
    private config;
    private cache;
    private storage;
    private metrics;
    constructor(config: AllocationServiceConfig, cache: AllocationCache, storage: AssignmentStorage, metrics: AssignmentMetrics);
    /**
     * Assign a user to an experiment variant
     */
    assignUser(request: AssignmentRequest): Promise<AssignmentResponse>;
    /**
     * Get assignments for multiple experiments
     */
    bulkAssignUser(userId: string, experimentIds: string[], sessionId?: string, debugMode?: boolean): Promise<Record<string, AssignmentResponse>>;
    /**
     * Force assign a user to a specific variant (for debugging/testing)
     */
    forceAssignUser(userId: string, experimentId: string, variantId: string, reason: string, sessionId?: string): Promise<AssignmentResponse>;
    /**
     * Remove user assignment (for opt-out scenarios)
     */
    removeUserAssignment(userId: string, experimentId: string): Promise<void>;
    /**
     * Get current salt for deterministic hashing
     */
    getCurrentSalt(): string;
    /**
     * Rotate salt (typically called by scheduled job)
     */
    rotateSalt(): Promise<string>;
    private performAssignment;
    private getBucket;
    private generateHash;
    private getVariantFromBucket;
    private isExperimentActive;
    private isUserExcluded;
    private isUserInTargetSegment;
    private getCurrentRolloutStage;
    private shouldIncludeInRollout;
    private getControlVariant;
    private handleOverride;
    private createSuccessResponse;
    private createControlResponse;
    private getCacheKey;
    private updateCache;
}
/**
 * Factory function to create allocation service with Redis cache
 */
export declare function createAllocationService(config: AllocationServiceConfig, storage: AssignmentStorage, metrics: AssignmentMetrics, cache?: AllocationCache): AllocationService;
//# sourceMappingURL=AllocationService.d.ts.map