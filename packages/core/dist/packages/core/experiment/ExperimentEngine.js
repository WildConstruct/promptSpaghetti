/**
 * Epic 14 - A/B Testing Framework
 * Core Experiment Engine for managing experiments and assignments
 */
import crypto from 'crypto';
import { ExperimentError, AllocationError } from '../types/experiment';
export class ExperimentEngine {
    config;
    allocationConfig;
    storage;
    metrics;
    config;
    allocationConfig;
    storage;
    metrics;
}
this.config = config;
this.allocationConfig = allocationConfig;
this.storage = storage;
this.metrics = metrics;
/**
* Create a new experiment
*/
async;
createExperiment(experiment, (Omit));
Promise < Experiment > {
    // Validate experiment configuration
    this: .validateExperiment(experiment),
    const: newExperiment, Experiment = {
        ...experiment,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    await, this: .storage.saveExperiment(newExperiment),
    return: newExperiment,
    /**
     * Update an existing experiment
     */
    async updateExperiment(id, updates) {
        const experiment = await this.storage.getExperiment(id);
        if (!experiment) {
            throw new ExperimentError('Experiment not found', 'NOT_FOUND', id);
            // Prevent updates to running experiments that could invalidate results
            if (experiment.status === 'running' && this.hasSignificantChanges(updates)) {
                throw new ExperimentError();
                'Cannot modify running experiment in ways that would invalidate results',
                    'INVALID_UPDATE',
                    id;
                ;
                const updatedExperiment = {
                    ...experiment,
                    ...updates,
                    updatedAt: new Date(),
                };
                this.validateExperiment(updatedExperiment);
                await this.storage.saveExperiment(updatedExperiment);
                return updatedExperiment;
                /**
                 * Start an experiment
                 */
                async;
                startExperiment(id, string);
                Promise < Experiment > {
                    const: experiment = await this.storage.getExperiment(id),
                    if(, experiment) {
                        throw new ExperimentError('Experiment not found', 'NOT_FOUND', id);
                        if (experiment.status !== 'draft') {
                            throw new ExperimentError() `Cannot start experiment in status: ${experiment.status}`;
                        }
                    },
                    'INVALID_STATUS': ,
                    id,
                    // Validate experiment is ready to start
                    this: .validateExperimentReadiness(experiment),
                    const: updatedExperiment = await this.updateExperiment(id, {}),
                    status: 'running',
                    schedule: {
                        ...experiment.schedule,
                        startAt: new Date(),
                    },
                    return: updatedExperiment,
                    /**
                     * Stop an experiment
                     */
                    async stopExperiment(id, reason) {
                        const experiment = await this.storage.getExperiment(id);
                        if (!experiment) {
                            throw new ExperimentError('Experiment not found', 'NOT_FOUND', id);
                            if (experiment.status !== 'running' && experiment.status !== 'paused') {
                                throw new ExperimentError() `Cannot stop experiment in status: ${experiment.status}`;
                            }
                        }
                        'INVALID_STATUS',
                            id;
                        ;
                        const updatedExperiment = await this.updateExperiment(id, {});
                        status: 'completed',
                            schedule;
                        { }
                    },
                    ...experiment.schedule,
                    endAt: new Date(),
                };
                ;
                return updatedExperiment;
                /**
                 * Assign a user to an experiment variant
                 */
                async;
                assignUser(request, AssignmentRequest);
                Promise < AssignmentResponse > {
                    try: {
                        // Check for existing assignment first
                        const: existingAssignment = await this.storage.getUserAssignment(),
                        request, : .userId,
                        request, : .experimentId,
                        if(existingAssignment) {
                            const experiment = await this.storage.getExperiment(request.experimentId);
                            if (!experiment) {
                                throw new AllocationError('Experiment not found', 'NOT_FOUND', request.userId, request.experimentId);
                                const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
                                if (!variant) {
                                    throw new AllocationError('Variant not found', 'VARIANT_NOT_FOUND', request.userId, request.experimentId);
                                    return {
                                        variantId: existingAssignment.variantId,
                                        variant,
                                        assigned: true,
                                        reason: 'existing_assignment',
                                    };
                                    // Handle override for debugging
                                    if (request.overrideVariant) {
                                        return await this.assignOverride(request);
                                        // Get experiment
                                        const experiment = await this.storage.getExperiment(request.experimentId);
                                        if (!experiment) {
                                            throw new AllocationError('Experiment not found', 'NOT_FOUND', request.userId, request.experimentId);
                                            // Check if experiment is running
                                            if (experiment.status !== 'running') {
                                                return this.getDefaultAssignment(experiment, 'experiment_not_running');
                                                // Check if user is excluded
                                                if (this.isUserExcluded(request.userId, experiment)) {
                                                    return this.getDefaultAssignment(experiment, 'user_excluded');
                                                    // Perform deterministic assignment
                                                    const assignment = await this.performAssignment(request, experiment);
                                                    // Record the assignment
                                                    await this.metrics.recordAssignment(assignment);
                                                    const variant = experiment.variants.find(v => v.id === assignment.variantId);
                                                    return {
                                                        variantId: assignment.variantId,
                                                        variant,
                                                        assigned: true,
                                                        reason: 'new_assignment',
                                                        debugInfo: request.debugMode ? {
                                                            hash: this.generateHash(request.userId, request.experimentId),
                                                            bucket: this.getBucket(request.userId, request.experimentId),
                                                            allocation: experiment.trafficAllocation,
                                                        } : undefined
                                                    };
                                                }
                                                try { }
                                                catch (error) {
                                                    if (error instanceof AllocationError) {
                                                        throw error;
                                                        throw new AllocationError() `Assignment failed: ${error.message}`;
                                                    }
                                                }
                                                'ASSIGNMENT_FAILED',
                                                    request.userId,
                                                    request.experimentId;
                                                ;
                                                /**
                                                 * Get all active experiments for an organization
                                                 */
                                                async;
                                                getActiveExperiments(organizationId ?  : string);
                                                Promise < Experiment > {
                                                    return: await this.storage.getActiveExperiments(organizationId),
                                                    /**
                                                     * Validate experiment configuration
                                                     */
                                                    validateExperiment(experiment) {
                                                        if (!experiment.name || experiment.name.trim().length === 0) {
                                                            throw new ExperimentError('Experiment name is required', 'VALIDATION_ERROR');
                                                            if (!experiment.variants || experiment.variants.length < 2) {
                                                                throw new ExperimentError('At least 2 variants are required', 'VALIDATION_ERROR');
                                                                if (experiment.variants.length > this.config.maxVariants) {
                                                                    throw new ExperimentError() `Maximum ${this.config.maxVariants} variants allowed`;
                                                                }
                                                            }
                                                            'VALIDATION_ERROR';
                                                            ;
                                                            // Validate traffic allocation
                                                            if (experiment.trafficAllocation) {
                                                                const totalAllocation = Object.values(experiment.trafficAllocation).reduce((sum, pct) => sum + pct, 0);
                                                                if (Math.abs(totalAllocation - 100) > 0.1) {
                                                                    throw new ExperimentError('Traffic allocation must sum to 100%', 'VALIDATION_ERROR');
                                                                    // Ensure all variants have allocation
                                                                    for (const variant of experiment.variants) {
                                                                        if (!(variant.id in experiment.trafficAllocation)) {
                                                                            throw new ExperimentError() `Variant ${variant.id} missing traffic allocation`;
                                                                        }
                                                                    }
                                                                    'VALIDATION_ERROR';
                                                                    ;
                                                                    // Validate metrics
                                                                    if (!experiment.metrics || experiment.metrics.length === 0) {
                                                                        throw new ExperimentError('At least one success metric is required', 'VALIDATION_ERROR');
                                                                        const primaryMetrics = experiment.metrics.filter(m => m.isPrimary);
                                                                        if (primaryMetrics.length !== 1) {
                                                                            throw new ExperimentError('Exactly one primary metric is required', 'VALIDATION_ERROR');
                                                                            /**
                                                                             * Validate experiment is ready to start
                                                                             */
                                                                        }
                                                                        /**
                                                                         * Validate experiment is ready to start
                                                                         */
                                                                    }
                                                                    /**
                                                                     * Validate experiment is ready to start
                                                                     */
                                                                }
                                                                /**
                                                                 * Validate experiment is ready to start
                                                                 */
                                                            }
                                                            /**
                                                             * Validate experiment is ready to start
                                                             */
                                                        }
                                                        /**
                                                         * Validate experiment is ready to start
                                                         */
                                                    }
                                                    /**
                                                     * Validate experiment is ready to start
                                                     */
                                                    ,
                                                    /**
                                                     * Validate experiment is ready to start
                                                     */
                                                    validateExperimentReadiness(experiment) {
                                                        // Check that all variants have valid configuration
                                                        for (const variant of experiment.variants) {
                                                            if (!variant.name || variant.name.trim().length === 0) {
                                                                throw new ExperimentError(`Variant ${variant.id} missing name`, 'VALIDATION_ERROR');
                                                            }
                                                            // Check that traffic allocation is valid
                                                            const totalAllocation = Object.values(experiment.trafficAllocation).reduce((sum, pct) => sum + pct, 0);
                                                            if (Math.abs(totalAllocation - 100) > 0.1) {
                                                                throw new ExperimentError('Traffic allocation must sum to 100%', 'VALIDATION_ERROR');
                                                                /**
                                                                * Check if updates would invalidate a running experiment
                                                                */
                                                            }
                                                            /**
                                                            * Check if updates would invalidate a running experiment
                                                            */
                                                        }
                                                        /**
                                                        * Check if updates would invalidate a running experiment
                                                        */
                                                    }
                                                    /**
                                                    * Check if updates would invalidate a running experiment
                                                    */
                                                    ,
                                                    /**
                                                    * Check if updates would invalidate a running experiment
                                                    */
                                                    hasSignificantChanges(updates) {
                                                        return !!();
                                                        updates.variants ||
                                                            updates.trafficAllocation ||
                                                            updates.metrics ||
                                                            updates.targetSegments ||
                                                            updates.exclusionRules;
                                                        ;
                                                        /**
                                                        * Check if user is excluded from experiment
                                                        */
                                                    }
                                                    /**
                                                    * Check if user is excluded from experiment
                                                    */
                                                    ,
                                                    /**
                                                    * Check if user is excluded from experiment
                                                    */
                                                    isUserExcluded(userId, experiment) {
                                                        if (!experiment.exclusionRules)
                                                            return false;
                                                        for (const rule of experiment.exclusionRules) {
                                                            if (rule.type === 'user' && rule.identifiers.includes(userId)) {
                                                                return true;
                                                                return false;
                                                                /**
                                                                * Perform deterministic user assignment
                                                                */
                                                            }
                                                            /**
                                                            * Perform deterministic user assignment
                                                            */
                                                        }
                                                        /**
                                                        * Perform deterministic user assignment
                                                        */
                                                    }
                                                    /**
                                                    * Perform deterministic user assignment
                                                    */
                                                    ,
                                                    /**
                                                    * Perform deterministic user assignment
                                                    */
                                                    async performAssignment(request, experiment) {
                                                        const bucket = this.getBucket(request.userId, experiment.id);
                                                        const variantId = this.getVariantFromBucket(bucket, experiment.trafficAllocation);
                                                        const assignment = {
                                                            userId: request.userId,
                                                            experimentId: experiment.id,
                                                            variantId,
                                                            assignedAt: new Date(),
                                                            sessionId: request.sessionId,
                                                            sticky: true,
                                                            salt: this.allocationConfig.saltStorage.currentSalt,
                                                        };
                                                        await this.storage.saveUserAssignment(assignment);
                                                        return assignment;
                                                        /**
                                                         * Generate deterministic hash for user and experiment
                                                         */
                                                    }
                                                    /**
                                                     * Generate deterministic hash for user and experiment
                                                     */
                                                    ,
                                                    /**
                                                     * Generate deterministic hash for user and experiment
                                                     */
                                                    generateHash(userId, experimentId) {
                                                        const salt = this.allocationConfig.saltStorage.currentSalt;
                                                        return crypto
                                                            .createHash('sha256')
                                                            .update(`${salt}${userId}${experimentId}`);
                                                    },
                                                    : 
                                                        .digest('hex'),
                                                    /**
                                                     * Get bucket (0-999) from user hash
                                                     */
                                                    getBucket(userId, experimentId) {
                                                        const hash = this.generateHash(userId, experimentId);
                                                        // Use first 8 characters for 32-bit integer
                                                        const hex = hash.substring(0, 8);
                                                        const int = parseInt(hex, 16);
                                                        return int % 1000;
                                                        /**
                                                        * Get variant ID from bucket and traffic allocation
                                                        */
                                                    }
                                                    /**
                                                    * Get variant ID from bucket and traffic allocation
                                                    */
                                                    ,
                                                    /**
                                                    * Get variant ID from bucket and traffic allocation
                                                    */
                                                    getVariantFromBucket(bucket, allocation) {
                                                        let cumulative = 0;
                                                        const bucketPercentile = bucket / 10; // Convert 0-999 to 0-99.9;
                                                        for (const [variantId, percentage] of Object.entries(allocation)) {
                                                            cumulative += percentage;
                                                            if (bucketPercentile < cumulative) {
                                                                return variantId;
                                                                // Fallback to first variant if rounding issues
                                                                return Object.keys(allocation)[0];
                                                                /**
                                                                * Handle override assignment for debugging
                                                                */
                                                            }
                                                            /**
                                                            * Handle override assignment for debugging
                                                            */
                                                        }
                                                        /**
                                                        * Handle override assignment for debugging
                                                        */
                                                    }
                                                    /**
                                                    * Handle override assignment for debugging
                                                    */
                                                    ,
                                                    /**
                                                    * Handle override assignment for debugging
                                                    */
                                                    async assignOverride(request) {
                                                        const experiment = await this.storage.getExperiment(request.experimentId);
                                                        if (!experiment) {
                                                            throw new AllocationError('Experiment not found', 'NOT_FOUND', request.userId, request.experimentId);
                                                            const variant = experiment.variants.find(v => v.id === request.overrideVariant);
                                                            if (!variant) {
                                                                throw new AllocationError();
                                                                'Override variant not found',
                                                                    'VARIANT_NOT_FOUND',
                                                                    request.userId,
                                                                    request.experimentId;
                                                                ;
                                                                const assignment = {
                                                                    userId: request.userId,
                                                                    experimentId: experiment.id,
                                                                    variantId: request.overrideVariant,
                                                                    assignedAt: new Date(),
                                                                    sessionId: request.sessionId,
                                                                    sticky: false, // Overrides are not sticky,
                                                                    salt: 'override', };
                                                                await this.storage.saveUserAssignment(assignment);
                                                                await this.metrics.recordAssignment(assignment);
                                                                return {
                                                                    variantId: request.overrideVariant,
                                                                    variant,
                                                                    assigned: true,
                                                                    reason: 'override',
                                                                };
                                                                /**
                                                                 * Get default assignment when user cannot be assigned
                                                                 */
                                                            }
                                                            /**
                                                             * Get default assignment when user cannot be assigned
                                                             */
                                                        }
                                                        /**
                                                         * Get default assignment when user cannot be assigned
                                                         */
                                                    }
                                                    /**
                                                     * Get default assignment when user cannot be assigned
                                                     */
                                                    ,
                                                    /**
                                                     * Get default assignment when user cannot be assigned
                                                     */
                                                    getDefaultAssignment(experiment, reason) {
                                                        // Return control variant (first variant) as default
                                                        const controlVariant = experiment.variants[0];
                                                        return {
                                                            variantId: controlVariant.id,
                                                            variant: controlVariant,
                                                            assigned: false,
                                                            reason
                                                        };
                                                        metrics: ExperimentMetrics,
                                                            config ?  : Partial,
                                                            allocationConfig ?  : Partial;
                                                        ExperimentEngine;
                                                        {
                                                            const defaultConfig = {
                                                                maxVariants: 12,
                                                                defaultConfidenceLevel: 0.95,
                                                                defaultMinSampleSize: 1000,
                                                                saltRotationInterval: 30,
                                                                maxExperimentDuration: 90,
                                                                enableBayesian: false,
                                                                enableBandits: false,
                                                                enableFactorial: true,
                                                                ...config
                                                            };
                                                            const defaultAllocationConfig = {
                                                                redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
                                                                cacheTtl: 30,
                                                                maxAssignmentLatency: 20,
                                                                enableDebugMode: process.env.NODE_ENV !== 'production',
                                                                saltStorage: {
                                                                    currentSalt: process.env.AB_SALT || crypto.randomBytes(32).toString('hex'),
                                                                    previousSalts: [],
                                                                },
                                                                ...allocationConfig
                                                            };
                                                            return new ExperimentEngine(defaultConfig, defaultAllocationConfig, storage, metrics);
                                                        }
                                                    }
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            }
        }
    } };
