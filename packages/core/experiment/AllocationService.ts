/**
 * Epic 14 Story 14.2 - Traffic Allocation & Randomization
 * Service for managing user assignments and traffic allocation
 */
import crypto from 'crypto';
import {
  AssignmentRequest,
  AssignmentResponse,
  UserAssignment,
  Experiment,
  ExperimentVariant,
  TrafficAllocation,
  AllocationError,
  AllocationServiceConfig
} from '../types/experiment';

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

export class AllocationService {
  private config: AllocationServiceConfig;
  private cache: AllocationCache;
  private storage: AssignmentStorage;
  private metrics: AssignmentMetrics;
  constructor();
    config: AllocationServiceConfig,
    cache: AllocationCache,
    storage: AssignmentStorage,
    metrics: AssignmentMetrics,
    this.config = config;
    this.cache = cache;
    this.storage = storage;
    this.metrics = metrics;
  }
  /**
   * Assign a user to an experiment variant
   */
  async assignUser(request: AssignmentRequest): Promise<AssignmentResponse> {
    const startTime = Date.now();
    try {
      // Check cache for existing assignment
      const cacheKey = this.getCacheKey(request.userId, request.experimentId);
      const cachedAssignment = await this.cache.get(cacheKey);
      if (cachedAssignment) {
        const assignment = JSON.parse(cachedAssignment) as UserAssignment;
        const experiment = await this.storage.getExperiment(request.experimentId);
        if (experiment) {
          const variant = experiment.variants.find(v => v.id === assignment.variantId);
          if (variant) {
            return this.createSuccessResponse(assignment, variant, 'cached_assignment', request.debugMode);
          }
        }
      }
      // Get experiment
      const experiment = await this.storage.getExperiment(request.experimentId);
      if (!experiment) {
        throw new AllocationError('Experiment not found', 'EXPERIMENT_NOT_FOUND', request.userId, request.experimentId);
      }
      // Check if experiment is active
      if (!this.isExperimentActive(experiment)) {
        await this.metrics.recordExclusion(request.userId, request.experimentId, 'experiment_inactive');
        return this.createControlResponse(experiment, 'experiment_inactive');
      }
      // Handle debug override
      if (request.overrideVariant && this.config.enableDebugMode) {
        return await this.handleOverride(request, experiment);
      }
      // Check for existing persistent assignment
      const existingAssignment = await this.storage.getAssignment(request.userId, request.experimentId);
      if (existingAssignment) {
        const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
        if (variant) {
          // Update cache
          await this.updateCache(cacheKey, existingAssignment);
          return this.createSuccessResponse(existingAssignment, variant, 'existing_assignment', request.debugMode);
        }
      }
      // Check exclusions
      if (this.isUserExcluded(request.userId, experiment)) {
        await this.metrics.recordExclusion(request.userId, request.experimentId, 'user_excluded');
        return this.createControlResponse(experiment, 'user_excluded');
      }
      // Check segment targeting
      if (!this.isUserInTargetSegment(request, experiment)) {
        await this.metrics.recordExclusion(request.userId, request.experimentId, 'segment_mismatch');
        return this.createControlResponse(experiment, 'segment_mismatch');
      }
      // Perform assignment
      const assignment = await this.performAssignment(request, experiment);
      // Save assignment
      await this.storage.saveAssignment(assignment);
      await this.updateCache(cacheKey, assignment);
      await this.metrics.recordAssignment(assignment);
      const variant = experiment.variants.find(v => v.id === assignment.variantId)!;
      return this.createSuccessResponse(assignment, variant, 'new_assignment', request.debugMode, experiment);
    } catch (error) {
      // Check if assignment is taking too long
      const duration = Date.now() - startTime;
      if (duration > this.config.maxAssignmentLatency) {
        console.warn(`Assignment latency exceeded threshold: ${duration}ms`);}
      }
      if (error instanceof AllocationError) {
        throw error;
      }
      throw new AllocationError()
        `Assignment failed: ${error.message}`,}
        'ASSIGNMENT_FAILED',
        request.userId,
        request.experimentId
      );
    }
  }
  /**
   * Get assignments for multiple experiments
   */
  async bulkAssignUser()
    userId: string,
    experimentIds: string[],
    sessionId?: string,
    debugMode = false
  ): Promise<Record<string, AssignmentResponse>> {
    const results: Record<string, AssignmentResponse> = {};
    // Process assignments in parallel for better performance
    const assignments = await Promise.allSettled(;);
      experimentIds.map(experimentId => )
        this.assignUser({)
          userId,
          experimentId,
          sessionId,
          debugMode
        })
    );
    experimentIds.forEach((experimentId, index) => {
      const result = assignments[index];
      if (result.status === 'fulfilled') {
        results[experimentId] = result.value;
      } else {
        // Return control assignment on error
        results[experimentId] = {
          variantId: 'control',
          variant: { id: 'control', name: 'Control', description: 'Default control variant' },
          assigned: false,
          reason: 'assignment_error',
        };
      }
    });
    return results;
  }
  /**
   * Force assign a user to a specific variant (for debugging/testing)
   */
  async forceAssignUser()
    userId: string,
    experimentId: string,
    variantId: string,
    reason: string,
    sessionId?: string
  ): Promise<AssignmentResponse> {
    const experiment = await this.storage.getExperiment(experimentId);
    if (!experiment) {
      throw new AllocationError('Experiment not found', 'EXPERIMENT_NOT_FOUND', userId, experimentId);
    }
    const variant = experiment.variants.find(v => v.id === variantId);
    if (!variant) {
      throw new AllocationError('Variant not found', 'VARIANT_NOT_FOUND', userId, experimentId);
    }
    const assignment: UserAssignment = {
      userId,
      experimentId,
      variantId,
      assignedAt: new Date(),
      sessionId,
      sticky: false, // Force assignments are not sticky
      salt: 'force',
    };
    await this.storage.saveAssignment(assignment);
    await this.metrics.recordOverride(userId, experimentId, variantId, reason);
    return this.createSuccessResponse(assignment, variant, `force_${reason}`);}
  }
  /**
   * Remove user assignment (for opt-out scenarios)
   */
  async removeUserAssignment(userId: string, experimentId: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId, experimentId);
    await this.cache.del(cacheKey);
    // Note: We don't delete from persistent storage to maintain audit trail
    // Instead, we would mark as opted-out in a separate field
  }
  /**
   * Get current salt for deterministic hashing
   */
  getCurrentSalt(): string {
    return this.config.saltStorage.currentSalt;
  }
  /**
   * Rotate salt (typically called by scheduled job)
   */
  async rotateSalt(): Promise<string> {
    const newSalt = crypto.randomBytes(32).toString('hex');
    const oldSalt = this.config.saltStorage.currentSalt;
    // Store previous salt for consistency window
    this.config.saltStorage.previousSalts.push({)
      salt: oldSalt,
      rotatedAt: new Date(),
    });
    // Clean up old salts (keep last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    this.config.saltStorage.previousSalts = this.config.saltStorage.previousSalts.filter()
      entry => entry.rotatedAt > threeMonthsAgo
    );
    this.config.saltStorage.currentSalt = newSalt;
    return newSalt;
  }
  // Private methods
  private async performAssignment()
    request: AssignmentRequest,
    experiment: Experiment,
  ): Promise<UserAssignment> {
    // Handle gradual rollout
    if (experiment.rolloutStrategy?.type === 'gradual') {
      const currentStage = this.getCurrentRolloutStage(experiment);
      if (!currentStage || !this.shouldIncludeInRollout(request.userId, currentStage.percentage)) {
        // User not included in current rollout stage
        const controlVariant = this.getControlVariant(experiment);
        return {
          userId: request.userId,
          experimentId: experiment.id,
          variantId: controlVariant.id,
          assignedAt: new Date(),
          sessionId: request.sessionId,
          sticky: true,
          salt: this.config.saltStorage.currentSalt,
        };
      }
    }
    // Perform deterministic assignment
    const bucket = this.getBucket(request.userId, experiment.id);
    const variantId = this.getVariantFromBucket(bucket, experiment.trafficAllocation);
    return {
      userId: request.userId,
      experimentId: experiment.id,
      variantId,
      assignedAt: new Date(),
      sessionId: request.sessionId,
      sticky: true,
      salt: this.config.saltStorage.currentSalt,
    };
  }
  private getBucket(userId: string, experimentId: string): number {
    const hash = this.generateHash(userId, experimentId);
    // Use first 8 characters for 32-bit integer, then mod by 10000 for better distribution
    const hex = hash.substring(0, 8);
    const int = parseInt(hex, 16);
    return int % 10000; // 0-9999 for finer granularity
  }
  private generateHash(userId: string, experimentId: string): string {
    const salt = this.config.saltStorage.currentSalt;
    return crypto
      .createHash('sha256')
      .update(`${salt}:${userId}:${experimentId}`)}
      .digest('hex');
  }
  private getVariantFromBucket(bucket: number, allocation: TrafficAllocation): string {
    let cumulative = 0;
    const bucketPercentile = bucket / 100; // Convert 0-9999 to 0-99.99;
    // Sort variants by ID for consistent ordering
    const sortedEntries = Object.entries(allocation).sort(([a], [b]) => a.localeCompare(b));
    for (const [variantId, percentage] of sortedEntries) {
      cumulative += percentage;
      if (bucketPercentile < cumulative) {
        return variantId;
      }
    }
    // Fallback to first variant if rounding issues
    return sortedEntries[0][0];
  }
  private isExperimentActive(experiment: Experiment): boolean {
    if (experiment.status !== 'running') {
      return false;
    }
    const now = new Date();
    // Check start time
    if (experiment.schedule?.startAt && experiment.schedule.startAt > now) {
      return false;
    }
    // Check end time
    if (experiment.schedule?.endAt && experiment.schedule.endAt < now) {
      return false;
    }
    return true;
  }
  private isUserExcluded(userId: string, experiment: Experiment): boolean {
    if (!experiment.exclusionRules) return false;
    for (const rule of experiment.exclusionRules) {
      if (rule.type === 'user' && rule.identifiers.includes(userId)) {
        return true;
      }
    }
    return false;
  }
  private isUserInTargetSegment(request: AssignmentRequest, experiment: Experiment): boolean {
    if (!experiment.targetSegments || experiment.targetSegments.length === 0) {
      return true; // No targeting means all users are eligible
    }
    // For now, return true as segment evaluation would require user context
    // In practice, this would evaluate user properties against segment filters
    return true;
  }
  private getCurrentRolloutStage(experiment: Experiment): { percentage: number } | null {
    if (!experiment.rolloutStrategy || experiment.rolloutStrategy.type !== 'gradual') {
      return null;
    }
    // Simplified: return first stage for now
    // In practice, this would track rollout progress over time
    return experiment.rolloutStrategy.stages?.[0] || null;
  }
  private shouldIncludeInRollout(userId: string, percentage: number): boolean {
    // Use consistent hashing to determine if user is in rollout
    const hash = crypto.createHash('sha256').update(`rollout:${userId}`).digest('hex');}
    const bucket = parseInt(hash.substring(0, 8), 16) % 10000;
    return bucket < (percentage * 100); // Convert percentage to 0-10000 scale
  }
  private getControlVariant(experiment: Experiment): ExperimentVariant {
    // Return first variant as control
    return experiment.variants[0];
  }
  private async handleOverride()
    request: AssignmentRequest,
    experiment: Experiment,
  ): Promise<AssignmentResponse> {
    const variant = experiment.variants.find(v => v.id === request.overrideVariant);
    if (!variant) {
      throw new AllocationError()
        'Override variant not found',
        'VARIANT_NOT_FOUND',
        request.userId,
        request.experimentId
      );
    }
    const assignment: UserAssignment = {
      userId: request.userId,
      experimentId: experiment.id,
      variantId: request.overrideVariant!,
      assignedAt: new Date(),
      sessionId: request.sessionId,
      sticky: false,
      salt: 'override',
    };
    await this.metrics.recordOverride(request.userId, experiment.id, request.overrideVariant!, 'debug_override');
    return this.createSuccessResponse(assignment, variant, 'debug_override', true, experiment);
  }
  private createSuccessResponse()
    assignment: UserAssignment,
    variant: ExperimentVariant,
    reason: string,
    debugMode = false,
    experiment?: Experiment
  ): AssignmentResponse {
    return {
      variantId: assignment.variantId,
      variant,
      assigned: true,
      reason,
      debugInfo: debugMode ? {,
        hash: this.generateHash(assignment.userId, assignment.experimentId),
        bucket: this.getBucket(assignment.userId, assignment.experimentId),
        allocation: experiment?.trafficAllocation || {}
      } : undefined
    };
  }
  private createControlResponse(experiment: Experiment, reason: string): AssignmentResponse {
    const controlVariant = this.getControlVariant(experiment);
    return {
      variantId: controlVariant.id,
      variant: controlVariant,
      assigned: false,
      reason
    };
  }
  private getCacheKey(userId: string, experimentId: string): string {
    return `ab:assignment:${userId}:${experimentId}`;}
  }
  private async updateCache(cacheKey: string, assignment: UserAssignment): Promise<void> {
    try {
      await this.cache.set()
        cacheKey,
        JSON.stringify(assignment),
        this.config.cacheTtl
      );
    } catch (error) {
      // Cache errors should not fail assignment
      console.warn('Cache update failed:', error);
    }
  }
}
/**
 * Factory function to create allocation service with Redis cache
 */
export function createAllocationService()
  config: AllocationServiceConfig,
  storage: AssignmentStorage,
  metrics: AssignmentMetrics,
  cache?: AllocationCache
): AllocationService {
  // Default in-memory cache if Redis not available
  const defaultCache: AllocationCache = {
    private store: new Map<string, { value: string; expires: number }>(),
    async get(key: string) {
      const entry = this.store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expires) {
        this.store.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key: string, value: string, ttlSeconds: number) {
      this.store.set(key, {)
        value,
        expires: Date.now() + (ttlSeconds * 1000),
      });
    },
    async del(key: string) {
      this.store.delete(key);
    }
  };
  return new AllocationService()
    config,
    cache || defaultCache,
    storage,
    metrics
  );
}