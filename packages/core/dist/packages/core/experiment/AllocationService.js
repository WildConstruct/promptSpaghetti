/**
 * Epic 14 Story 14.2 - Traffic Allocation & Randomization
 * Service for managing user assignments and traffic allocation
 */
import crypto from 'crypto';
import { AllocationError } from '../types/experiment';
export class AllocationService {
    config;
    cache;
    storage;
    metrics;
    config;
    cache;
    storage;
    metrics;
}
this.config = config;
this.cache = cache;
this.storage = storage;
this.metrics = metrics;
/**
* Assign a user to an experiment variant
*/
async;
assignUser(request, AssignmentRequest);
Promise < AssignmentResponse > {
    const: startTime = Date.now(),
    try: {
        // Check cache for existing assignment
        const: cacheKey = this.getCacheKey(request.userId, request.experimentId),
        const: cachedAssignment = await this.cache.get(cacheKey),
        if(cachedAssignment) {
            const assignment = JSON.parse(cachedAssignment);
            const experiment = await this.storage.getExperiment(request.experimentId);
            if (experiment) {
                const variant = experiment.variants.find(v => v.id === assignment.variantId);
                if (variant) {
                    return this.createSuccessResponse(assignment, variant, 'cached_assignment', request.debugMode);
                    // Get experiment
                    const experiment = await this.storage.getExperiment(request.experimentId);
                    if (!experiment) {
                        throw new AllocationError('Experiment not found', 'EXPERIMENT_NOT_FOUND', request.userId, request.experimentId);
                        // Check if experiment is active
                        if (!this.isExperimentActive(experiment)) {
                            await this.metrics.recordExclusion(request.userId, request.experimentId, 'experiment_inactive');
                            return this.createControlResponse(experiment, 'experiment_inactive');
                            // Handle debug override
                            if (request.overrideVariant && this.config.enableDebugMode) {
                                return await this.handleOverride(request, experiment);
                                // Check for existing persistent assignment
                                const existingAssignment = await this.storage.getAssignment(request.userId, request.experimentId);
                                if (existingAssignment) {
                                    const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
                                    if (variant) {
                                        // Update cache
                                        await this.updateCache(cacheKey, existingAssignment);
                                        return this.createSuccessResponse(existingAssignment, variant, 'existing_assignment', request.debugMode);
                                        // Check exclusions
                                        if (this.isUserExcluded(request.userId, experiment)) {
                                            await this.metrics.recordExclusion(request.userId, request.experimentId, 'user_excluded');
                                            return this.createControlResponse(experiment, 'user_excluded');
                                            // Check segment targeting
                                            if (!this.isUserInTargetSegment(request, experiment)) {
                                                await this.metrics.recordExclusion(request.userId, request.experimentId, 'segment_mismatch');
                                                return this.createControlResponse(experiment, 'segment_mismatch');
                                                // Perform assignment
                                                const assignment = await this.performAssignment(request, experiment);
                                                // Save assignment
                                                await this.storage.saveAssignment(assignment);
                                                await this.updateCache(cacheKey, assignment);
                                                await this.metrics.recordAssignment(assignment);
                                                const variant = experiment.variants.find(v => v.id === assignment.variantId);
                                                return this.createSuccessResponse(assignment, variant, 'new_assignment', request.debugMode, experiment);
                                            }
                                            try { }
                                            catch (error) {
                                                // Check if assignment is taking too long
                                                const duration = Date.now() - startTime;
                                                if (duration > this.config.maxAssignmentLatency) {
                                                    console.warn(`Assignment latency exceeded threshold: ${duration}ms`);
                                                }
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
                                             * Get assignments for multiple experiments
                                             */
                                            async;
                                            bulkAssignUser(userId, string);
                                            experimentIds: string,
                                                sessionId ?  : string,
                                                debugMode = false;
                                            Promise < Record < string, AssignmentResponse >> {
                                                const: results
                                            };
                                            { }
                                            ;
                                            // Process assignments in parallel for better performance
                                            const assignments = await Promise.allSettled();
                                            ;
                                            experimentIds.map(experimentId => );
                                            this.assignUser({});
                                            userId,
                                                experimentId,
                                                sessionId,
                                                debugMode;
                                        }
                                        ;
                                        experimentIds.forEach((experimentId, index) => {
                                            const result = assignments[index];
                                            if (result.status === 'fulfilled') {
                                                results[experimentId] = result.value;
                                            }
                                            else {
                                                // Return control assignment on error
                                                results[experimentId] = {
                                                    variantId: 'control',
                                                    variant: { id: 'control', name: 'Control', description: 'Default control variant' },
                                                    assigned: false,
                                                    reason: 'assignment_error'
                                                };
                                            }
                                        });
                                        return results;
                                        /**
                                         * Force assign a user to a specific variant (for debugging/testing)
                                         */
                                        async;
                                        forceAssignUser(userId, string);
                                        experimentId: string,
                                            variantId;
                                        string,
                                            reason;
                                        string,
                                            sessionId ?  : string;
                                        Promise < AssignmentResponse > {
                                            const: experiment = await this.storage.getExperiment(experimentId),
                                            if(, experiment) {
                                                throw new AllocationError('Experiment not found', 'EXPERIMENT_NOT_FOUND', userId, experimentId);
                                                const variant = experiment.variants.find(v => v.id === variantId);
                                                if (!variant) {
                                                    throw new AllocationError('Variant not found', 'VARIANT_NOT_FOUND', userId, experimentId);
                                                    const assignment = {
                                                        userId,
                                                        experimentId,
                                                        variantId,
                                                        assignedAt: new Date(),
                                                        sessionId,
                                                        sticky: false, // Force assignments are not sticky,
                                                        salt: 'force',
                                                    };
                                                    await this.storage.saveAssignment(assignment);
                                                    await this.metrics.recordOverride(userId, experimentId, variantId, reason);
                                                    return this.createSuccessResponse(assignment, variant, `force_${reason}`);
                                                }
                                                /**
                                                 * Remove user assignment (for opt-out scenarios)
                                                 */
                                                async;
                                                removeUserAssignment(userId, string, experimentId, string);
                                                Promise < void  > {
                                                    const: cacheKey = this.getCacheKey(userId, experimentId),
                                                    await, this: .cache.del(cacheKey),
                                                    // Note: We don't delete from persistent storage to maintain audit trail,
                                                    // Instead, we would mark as opted-out in a separate field
                                                    /**
                                                    * Get current salt for deterministic hashing
                                                    */
                                                    getCurrentSalt() {
                                                        return this.config.saltStorage.currentSalt;
                                                        /**
                                                        * Rotate salt (typically called by scheduled job)
                                                        */
                                                        async;
                                                        rotateSalt();
                                                        Promise < string > {
                                                            const: newSalt = crypto.randomBytes(32).toString('hex'),
                                                            const: oldSalt = this.config.saltStorage.currentSalt,
                                                            // Store previous salt for consistency window
                                                            this: .config.saltStorage.previousSalts.push({}),
                                                            salt: oldSalt,
                                                            rotatedAt: new Date(),
                                                        };
                                                        ;
                                                        // Clean up old salts (keep last 3 months)
                                                        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                                                        this.config.saltStorage.previousSalts = this.config.saltStorage.previousSalts.filter();
                                                        entry => entry.rotatedAt > threeMonthsAgo;
                                                        ;
                                                        this.config.saltStorage.currentSalt = newSalt;
                                                        return newSalt;
                                                        // Private methods
                                                    }
                                                    // Private methods
                                                }();
                                                request: AssignmentRequest,
                                                    experiment;
                                                Experiment,
                                                ;
                                                Promise < UserAssignment > {
                                                    // Handle gradual rollout
                                                    if(experiment) { }, : .rolloutStrategy?.type === 'gradual'
                                                };
                                                {
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
                                                }
                                            },
                                            getBucket(userId, experimentId) {
                                                const hash = this.generateHash(userId, experimentId);
                                                // Use first 8 characters for 32-bit integer, then mod by 10000 for better distribution
                                                const hex = hash.substring(0, 8);
                                                const int = parseInt(hex, 16);
                                                return int % 10000;
                                            } // 0-9999 for finer granularity
                                            , // 0-9999 for finer granularity
                                            generateHash(userId, experimentId) {
                                                const salt = this.config.saltStorage.currentSalt;
                                                return crypto
                                                    .createHash('sha256')
                                                    .update(`${salt}:${userId}:${experimentId}`);
                                            },
                                            : 
                                                .digest('hex'),
                                            getVariantFromBucket(bucket, allocation) {
                                                let cumulative = 0;
                                                const bucketPercentile = bucket / 100; // Convert 0-9999 to 0-99.99;
                                                // Sort variants by ID for consistent ordering
                                                const sortedEntries = Object.entries(allocation).sort(([a], [b]) => a.localeCompare(b));
                                                for (const [variantId, percentage] of sortedEntries) {
                                                    cumulative += percentage;
                                                    if (bucketPercentile < cumulative) {
                                                        return variantId;
                                                        // Fallback to first variant if rounding issues
                                                        return sortedEntries[0][0];
                                                    }
                                                }
                                            },
                                            isExperimentActive(experiment) {
                                                if (experiment.status !== 'running') {
                                                    return false;
                                                    const now = new Date();
                                                    // Check start time
                                                    if (experiment.schedule?.startAt && experiment.schedule.startAt > now) {
                                                        return false;
                                                        // Check end time
                                                        if (experiment.schedule?.endAt && experiment.schedule.endAt < now) {
                                                            return false;
                                                            return true;
                                                        }
                                                    }
                                                }
                                            },
                                            isUserExcluded(userId, experiment) {
                                                if (!experiment.exclusionRules)
                                                    return false;
                                                for (const rule of experiment.exclusionRules) {
                                                    if (rule.type === 'user' && rule.identifiers.includes(userId)) {
                                                        return true;
                                                        return false;
                                                    }
                                                }
                                            },
                                            isUserInTargetSegment(request, experiment) {
                                                if (!experiment.targetSegments || experiment.targetSegments.length === 0) {
                                                    return true; // No targeting means all users are eligible
                                                    // For now, return true as segment evaluation would require user context
                                                    // In practice, this would evaluate user properties against segment filters
                                                    return true;
                                                }
                                            },
                                            getCurrentRolloutStage(experiment) {
                                                if (!experiment.rolloutStrategy || experiment.rolloutStrategy.type !== 'gradual') {
                                                    return null;
                                                    // Simplified: return first stage for now
                                                    // In practice, this would track rollout progress over time
                                                    return experiment.rolloutStrategy.stages?.[0] || null;
                                                }
                                            },
                                            shouldIncludeInRollout(userId, percentage) {
                                                // Use consistent hashing to determine if user is in rollout
                                                const hash = crypto.createHash('sha256').update(`rollout:${userId}`).digest('hex');
                                            },
                                            const: bucket = parseInt(hash.substring(0, 8), 16) % 10000,
                                            return: bucket < (percentage * 100), // Convert percentage to 0-10000 scale
                                            getControlVariant(experiment) {
                                                // Return first variant as control
                                                return experiment.variants[0];
                                            }
                                        }();
                                        request: AssignmentRequest,
                                            experiment;
                                        Experiment;
                                        Promise < AssignmentResponse > {
                                            const: variant = experiment.variants.find(v => v.id === request.overrideVariant),
                                            if(, variant) {
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
                                                    sticky: false,
                                                    salt: 'override', };
                                                await this.metrics.recordOverride(request.userId, experiment.id, request.overrideVariant, 'debug_override');
                                                return this.createSuccessResponse(assignment, variant, 'debug_override', true, experiment);
                                            },
                                            variant: ExperimentVariant,
                                            reason: string,
                                            debugMode = false,
                                            experiment: Experiment,
                                            AssignmentResponse };
                                        {
                                            return {
                                                variantId: assignment.variantId,
                                                variant,
                                                assigned: true,
                                                reason,
                                                debugInfo: debugMode ? {
                                                    hash: this.generateHash(assignment.userId, assignment.experimentId),
                                                    bucket: this.getBucket(assignment.userId, assignment.experimentId),
                                                    allocation: experiment?.trafficAllocation || {}
                                                } : undefined
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        createControlResponse(experiment, reason) {
            const controlVariant = this.getControlVariant(experiment);
            return {
                variantId: controlVariant.id,
                variant: controlVariant,
                assigned: false,
                reason
            };
        },
        getCacheKey(userId, experimentId) {
            return `ab:assignment:${userId}:${experimentId}`;
        },
        async updateCache(cacheKey, assignment) {
            try {
                await this.cache.set();
                cacheKey,
                    JSON.stringify(assignment),
                    this.config.cacheTtl;
                ;
            }
            catch (error) {
                // Cache errors should not fail assignment
                console.warn('Cache update failed:', error);
                storage: AssignmentStorage,
                    metrics;
                AssignmentMetrics,
                    cache ?  : AllocationCache;
                AllocationService;
                {
                    // Default in-memory cache if Redis not available
                    const defaultCache = {
                        store: new Map(),
                        async get(key) {
                            const entry = this.store.get(key);
                            if (!entry)
                                return null;
                            if (Date.now() > entry.expires) {
                                this.store.delete(key);
                                return null;
                                return entry.value;
                            }
                            async;
                            set(key, string, value, string, ttlSeconds, number);
                            {
                                this.store.set(key, {});
                                value,
                                    expires;
                                Date.now() + (ttlSeconds * 1000),
                                ;
                            }
                            ;
                        },
                        async del(key) {
                            this.store.delete(key);
                        },
                        return: new AllocationService(),
                        config,
                        cache
                    } || defaultCache, storage, metrics;
                    ;
                }
            }
        }
    } };
