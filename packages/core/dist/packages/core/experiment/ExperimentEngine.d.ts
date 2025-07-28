import { Experiment, UserAssignment, ABTestingConfig, AllocationServiceConfig } from '../types/experiment';
export interface ExperimentStorage {
    getExperiment(id: string): Promise<Experiment | null>;
    saveExperiment(experiment: Experiment): Promise<void>;
    getUserAssignment(userId: string, experimentId: string): Promise<UserAssignment | null>;
    saveUserAssignment(assignment: UserAssignment): Promise<void>;
    getActiveExperiments(organizationId?: string): Promise<Experiment>;
}
export interface ExperimentMetrics {
    recordAssignment(assignment: UserAssignment): Promise<void>;
    recordEvent(experimentId: string, variantId: string, eventType: string, data: Record<string, unknown>): Promise<void>;
}
export declare class ExperimentEngine {
    private config;
    private allocationConfig;
    private storage;
    private metrics;
    constructor();
    config: ABTestingConfig;
    allocationConfig: AllocationServiceConfig;
    storage: ExperimentStorage;
    metrics: ExperimentMetrics;
}
//# sourceMappingURL=ExperimentEngine.d.ts.map