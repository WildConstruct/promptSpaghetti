import { UserAssignment, Experiment, AllocationServiceConfig } from '../types/experiment';
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
    constructor();
    config: AllocationServiceConfig;
    cache: AllocationCache;
    storage: AssignmentStorage;
    metrics: AssignmentMetrics;
}
//# sourceMappingURL=AllocationService.d.ts.map