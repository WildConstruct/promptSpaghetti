/**
 * Epic 14 - A/B Testing Framework
 * Core Experiment Engine for managing experiments and assignments
 */
import { 
  Experiment,
  UserAssignment,
  AssignmentRequest,
  AssignmentResponse,
  ABTestingConfig,
  AllocationServiceConfig
} from '../types/experiment';
export interface ExperimentStorage {
    getExperiment(id: string): Promise<Experiment | null>;
    saveExperiment(experiment: Experiment): Promise<void>;
    getUserAssignment(userId: string, experimentId: string): Promise<UserAssignment | null>;
    saveUserAssignment(assignment: UserAssignment): Promise<void>;
    getActiveExperiments(organizationId?: string): Promise<Experiment[]>;
}
export interface ExperimentMetrics {
    recordAssignment(assignment: UserAssignment): Promise<void>;
    recordEvent(
      experimentId: string,
      variantId: string,
      eventType: string,
      data: Record<string,
      unknown>
    ): Promise<void>;
}
export declare class ExperimentEngine {
    private config;
    private allocationConfig;
    private storage;
    private metrics;
    constructor(
      config: ABTestingConfig,
      allocationConfig: AllocationServiceConfig,
      storage: ExperimentStorage,
      metrics: ExperimentMetrics
    );
    /**
     * Create a new experiment
     */
    createExperiment(experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experiment>;
    /**
     * Update an existing experiment
     */
    updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment>;
    /**
     * Start an experiment
     */
    startExperiment(id: string): Promise<Experiment>;
    /**
     * Stop an experiment
     */
    stopExperiment(id: string, reason?: string): Promise<Experiment>;
    /**
     * Assign a user to an experiment variant
     */
    assignUser(request: AssignmentRequest): Promise<AssignmentResponse>;
    /**
     * Get all active experiments for an organization
     */
    getActiveExperiments(organizationId?: string): Promise<Experiment[]>;
    /**
     * Validate experiment configuration
     */
    private validateExperiment;
    /**
     * Validate experiment is ready to start
     */
    private validateExperimentReadiness;
    /**
     * Check if updates would invalidate a running experiment
     */
    private hasSignificantChanges;
    /**
     * Check if user is excluded from experiment
     */
    private isUserExcluded;
    /**
     * Perform deterministic user assignment
     */
    private performAssignment;
    /**
     * Generate deterministic hash for user and experiment
     */
    private generateHash;
    /**
     * Get bucket (0-999) from user hash
     */
    private getBucket;
    /**
     * Get variant ID from bucket and traffic allocation
     */
    private getVariantFromBucket;
    /**
     * Handle override assignment for debugging
     */
    private assignOverride;
    /**
     * Get default assignment when user cannot be assigned
     */
    private getDefaultAssignment;
}
/**
 * Factory function to create experiment engine with default configuration
 */
export declare function createExperimentEngine(
  storage: ExperimentStorage,
  metrics: ExperimentMetrics,
  config?: Partial<ABTestingConfig>,
  allocationConfig?: Partial<AllocationServiceConfig>
): ExperimentEngine;
//# sourceMappingURL=ExperimentEngine.d.ts.map