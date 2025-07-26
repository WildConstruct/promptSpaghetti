/**
 * Epic 17 Toggle Conditions Service
 *
 * Advanced conditional evaluation system for feature toggles providing:
 * - Complex condition expressions with context variables
 * - User/segment targeting with dynamic rule evaluation
 * - Time-based and percentage rollout conditions
 * - A/B testing integration and multivariate conditions
 * - Security-hardened expression evaluation
 */
import { SafeExpressionEvaluator } from '../runtime/expression-evaluator';
import { securityAudit, SecuritySeverity, SecurityEventCategory } from '../runtime/security-audit-logger';
export var ConditionType;
(function (ConditionType) {
    ConditionType["USER_ATTRIBUTE"] = "user_attribute";
    ConditionType["USER_SEGMENT"] = "user_segment";
    ConditionType["PERCENTAGE"] = "percentage";
    ConditionType["TIME_WINDOW"] = "time_window";
    ConditionType["AB_TEST"] = "ab_test";
    ConditionType["MULTIVARIATE"] = "multivariate";
    ConditionType["CUSTOM_EXPRESSION"] = "custom_expression";
    ConditionType["DEPENDENCY"] = "dependency";
    ConditionType["GEOGRAPHIC"] = "geographic";
    ConditionType["DEVICE_TYPE"] = "device_type";
    ConditionType["TRAFFIC_SPLIT"] = "traffic_split";
    ConditionType["FEATURE_FLAG"] = "feature_flag"; // Based on other feature flags
})(ConditionType || (ConditionType = {}));
export var ComparisonOperator;
(function (ComparisonOperator) {
    ComparisonOperator["EQUALS"] = "equals";
    ComparisonOperator["NOT_EQUALS"] = "not_equals";
    ComparisonOperator["GREATER_THAN"] = "greater_than";
    ComparisonOperator["LESS_THAN"] = "less_than";
    ComparisonOperator["GREATER_EQUAL"] = "greater_equal";
    ComparisonOperator["LESS_EQUAL"] = "less_equal";
    ComparisonOperator["CONTAINS"] = "contains";
    ComparisonOperator["NOT_CONTAINS"] = "not_contains";
    ComparisonOperator["STARTS_WITH"] = "starts_with";
    ComparisonOperator["ENDS_WITH"] = "ends_with";
    ComparisonOperator["MATCHES_REGEX"] = "matches_regex";
    ComparisonOperator["IN_LIST"] = "in_list";
    ComparisonOperator["NOT_IN_LIST"] = "not_in_list";
})(ComparisonOperator || (ComparisonOperator = {}));
/**
 * Toggle Conditions Service
 *
 * Core service for evaluating complex conditions for feature toggles in Epic 17.
 * Provides secure, performant, and flexible condition evaluation.
 */
export class ToggleConditionsService {
    conditions = new Map();
    toggleConditions = new Map(); // toggleId -> conditionIds
    evaluationCache = new Map();
    config;
    expressionEvaluator;
    constructor(config = {}) {
        this.config = {
            evaluation: {
                enableCaching: true,
                cacheTimeToLive: 300, // 5 minutes
                maxConditionsPerToggle: 20,
                evaluationTimeout: 1000, // 1 second
                strictMode: false,
                ...config.evaluation
            },
            security: {
                allowCustomExpressions: true,
                maxExpressionComplexity: 100,
                enableSecurityAudit: true,
                blockedPatterns: ['eval', 'Function', 'constructor', 'prototype', '__proto__'],
                ...config.security
            },
            rollout: {
                defaultSalt: 'toggle-conditions-v1',
                stickinessDuration: 86400, // 24 hours
                enableGradualRollout: true,
                rolloutRateLimit: 10, // 10% per hour
                ...config.rollout
            },
            experiments: {
                enableABTesting: true,
                defaultTrafficAllocation: 100,
                maxVariants: 10,
                stickinessStrategy: 'user',
                ...config.experiments
            }
        };
        this.expressionEvaluator = new SafeExpressionEvaluator({
            timeout: this.config.evaluation.evaluationTimeout,
            maxComplexity: this.config.security.maxExpressionComplexity
        });
        // Clean up expired cache entries periodically
        if (this.config.evaluation.enableCaching) {
            setInterval(() => this.cleanupCache(), this.config.evaluation.cacheTimeToLive * 1000);
        }
    }
    /**
     * Add or update a condition for a toggle
     */
    async addCondition(condition) {
        const id = this.generateConditionId();
        const fullCondition = {
            ...condition,
            id,
            created: new Date(),
            lastModified: new Date()
        };
        // Validate condition
        const validation = await this.validateCondition(fullCondition);
        if (!validation.valid && this.config.evaluation.strictMode) {
            throw new Error(`Condition validation failed: ${validation.errors.join(', ')}`);
        }
        this.conditions.set(id, fullCondition);
        // Update toggle-condition mapping
        const toggleConditions = this.toggleConditions.get(condition.toggleId) || [];
        toggleConditions.push(id);
        this.toggleConditions.set(condition.toggleId, toggleConditions);
        // Clear cache for affected toggle
        this.clearToggleCache(condition.toggleId);
        return fullCondition;
    }
    /**
     * Remove a condition
     */
    async removeCondition(conditionId) {
        const condition = this.conditions.get(conditionId);
        if (!condition) {
            return false;
        }
        this.conditions.delete(conditionId);
        // Update toggle-condition mapping
        const toggleConditions = this.toggleConditions.get(condition.toggleId) || [];
        const index = toggleConditions.indexOf(conditionId);
        if (index > -1) {
            toggleConditions.splice(index, 1);
            this.toggleConditions.set(condition.toggleId, toggleConditions);
        }
        // Clear cache for affected toggle
        this.clearToggleCache(condition.toggleId);
        return true;
    }
    /**
     * Evaluate all conditions for a toggle
     */
    async evaluateToggle(toggleId, context) {
        const startTime = Date.now();
        const conditionIds = this.toggleConditions.get(toggleId) || [];
        if (conditionIds.length === 0) {
            return {
                toggleId,
                enabled: false,
                conditions: [],
                fallbackReason: 'No conditions configured',
                confidence: 0,
                metadata: {
                    evaluatedAt: new Date(),
                    totalExecutionTime: Date.now() - startTime,
                    cacheHit: false
                }
            };
        }
        // Evaluate all conditions
        const conditionResults = [];
        let overallResult = false;
        let variant;
        for (const conditionId of conditionIds) {
            const condition = this.conditions.get(conditionId);
            if (!condition || !condition.active) {
                continue;
            }
            try {
                const result = await this.evaluateCondition(condition, context);
                conditionResults.push(result);
                // Apply condition logic (OR-based by default)
                if (result.result) {
                    overallResult = true;
                    // Extract variant for multivariate toggles
                    if (condition.conditionType === ConditionType.MULTIVARIATE && result.metadata.intermediateValues?.variant) {
                        variant = result.metadata.intermediateValues.variant;
                    }
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                conditionResults.push({
                    conditionId,
                    result: false,
                    reason: `Evaluation error: ${errorMessage}`,
                    executionTime: 0,
                    metadata: {
                        evaluatedAt: new Date(),
                        contextHash: this.generateContextHash(context)
                    }
                });
            }
        }
        // Calculate confidence based on condition results
        const confidence = this.calculateConfidence(conditionResults);
        return {
            toggleId,
            enabled: overallResult,
            variant,
            conditions: conditionResults,
            confidence,
            metadata: {
                evaluatedAt: new Date(),
                totalExecutionTime: Date.now() - startTime,
                cacheHit: false
            }
        };
    }
    /**
     * Evaluate a single condition
     */
    async evaluateCondition(condition, context) {
        const startTime = Date.now();
        const contextHash = this.generateContextHash(context);
        // Check cache first
        const cacheKey = `${condition.id}_${contextHash}`;
        if (this.config.evaluation.enableCaching) {
            const cached = this.evaluationCache.get(cacheKey);
            if (cached && this.isCacheValid(cached)) {
                return cached;
            }
        }
        let result = false;
        let reason = '';
        const intermediateValues = {};
        try {
            switch (condition.conditionType) {
                case ConditionType.USER_ATTRIBUTE:
                    result = this.evaluateUserAttribute(condition, context);
                    reason = result ? 'User attributes match condition' : 'User attributes do not match';
                    break;
                case ConditionType.USER_SEGMENT:
                    result = this.evaluateUserSegment(condition, context);
                    reason = result ? 'User in target segment' : 'User not in target segment';
                    break;
                case ConditionType.PERCENTAGE:
                    const percentageResult = this.evaluatePercentage(condition, context);
                    result = percentageResult.included;
                    intermediateValues.hash = percentageResult.hash;
                    intermediateValues.threshold = percentageResult.threshold;
                    reason = result ? `Included in ${condition.parameters.percentage}% rollout` : 'Excluded from rollout';
                    break;
                case ConditionType.TIME_WINDOW:
                    result = this.evaluateTimeWindow(condition, context);
                    reason = result ? 'Within time window' : 'Outside time window';
                    break;
                case ConditionType.AB_TEST:
                    const abResult = this.evaluateABTest(condition, context);
                    result = abResult.included;
                    intermediateValues.variant = abResult.variant;
                    reason = result ? `Assigned to variant: ${abResult.variant}` : 'Not included in A/B test';
                    break;
                case ConditionType.MULTIVARIATE:
                    const mvResult = this.evaluateMultivariate(condition, context);
                    result = mvResult.included;
                    intermediateValues.variant = mvResult.variant;
                    reason = result ? `Assigned to variant: ${mvResult.variant}` : 'Not included in multivariate test';
                    break;
                case ConditionType.CUSTOM_EXPRESSION:
                    result = await this.evaluateCustomExpression(condition, context);
                    reason = result ? 'Custom expression evaluated to true' : 'Custom expression evaluated to false';
                    break;
                case ConditionType.DEPENDENCY:
                    result = this.evaluateDependency(condition, context);
                    reason = result ? 'Dependencies satisfied' : 'Dependencies not met';
                    break;
                case ConditionType.GEOGRAPHIC:
                    result = this.evaluateGeographic(condition, context);
                    reason = result ? 'Geographic criteria met' : 'Outside target geographic area';
                    break;
                case ConditionType.DEVICE_TYPE:
                    result = this.evaluateDeviceType(condition, context);
                    reason = result ? 'Device type matches' : 'Device type does not match';
                    break;
                case ConditionType.TRAFFIC_SPLIT:
                    const trafficResult = this.evaluateTrafficSplit(condition, context);
                    result = trafficResult.included;
                    intermediateValues.bucket = trafficResult.bucket;
                    reason = result ? `Traffic split: bucket ${trafficResult.bucket}` : 'Not in target traffic bucket';
                    break;
                case ConditionType.FEATURE_FLAG:
                    result = this.evaluateFeatureFlag(condition, context);
                    reason = result ? 'Required feature flags active' : 'Required feature flags not active';
                    break;
                default:
                    throw new Error(`Unknown condition type: ${condition.conditionType}`);
            }
        }
        catch (error) {
            result = false;
            reason = error instanceof Error ? error.message : String(error);
            if (this.config.security.enableSecurityAudit) {
                securityAudit.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Condition evaluation failed', {
                    conditionId: condition.id,
                    conditionType: condition.conditionType,
                    error: reason
                }, false);
            }
        }
        const evaluationResult = {
            conditionId: condition.id,
            result,
            reason,
            executionTime: Date.now() - startTime,
            metadata: {
                evaluatedAt: new Date(),
                contextHash,
                intermediateValues
            }
        };
        // Cache the result
        if (this.config.evaluation.enableCaching) {
            this.evaluationCache.set(cacheKey, evaluationResult);
        }
        return evaluationResult;
    }
    /**
     * Get all conditions for a toggle
     */
    getToggleConditions(toggleId) {
        const conditionIds = this.toggleConditions.get(toggleId) || [];
        return conditionIds
            .map(id => this.conditions.get(id))
            .filter((condition) => condition !== undefined)
            .sort((a, b) => b.priority - a.priority);
    }
    /**
     * Bulk evaluate multiple toggles
     */
    async evaluateToggles(toggleIds, context) {
        const results = new Map();
        const evaluationPromises = toggleIds.map(async (toggleId) => {
            const result = await this.evaluateToggle(toggleId, context);
            results.set(toggleId, result);
        });
        await Promise.all(evaluationPromises);
        return results;
    }
    // Private evaluation methods
    evaluateUserAttribute(condition, context) {
        const params = condition.parameters.userAttributes;
        if (!params || !context.user) {
            return false;
        }
        const results = params.attributes.map(attr => {
            const userValue = context.user?.attributes?.[attr.key];
            return this.compareValues(userValue, attr.operator, attr.value);
        });
        return params.logic === 'AND' ? results.every(r => r) : results.some(r => r);
    }
    evaluateUserSegment(condition, context) {
        const segments = condition.parameters.userSegments;
        if (!segments || !context.user?.segment) {
            return false;
        }
        return segments.includes(context.user.segment);
    }
    evaluatePercentage(condition, context) {
        const percentage = condition.parameters.percentage || 0;
        const salt = condition.parameters.salt || this.config.rollout.defaultSalt;
        const userId = context.user?.id || 'anonymous';
        const hash = this.generateHash(`${condition.id}_${userId}_${salt}`);
        const hashValue = parseInt(hash.substring(0, 8), 16);
        const threshold = (hashValue / 0xFFFFFFFF) * 100;
        return {
            included: threshold < percentage,
            hash,
            threshold
        };
    }
    evaluateTimeWindow(condition, context) {
        const now = context.timestamp || new Date();
        const startTime = condition.parameters.startTime;
        const endTime = condition.parameters.endTime;
        const schedule = condition.parameters.schedule;
        // Check basic time window
        if (startTime && now < startTime)
            return false;
        if (endTime && now > endTime)
            return false;
        // Check schedule if specified
        if (schedule) {
            const dayOfWeek = now.getDay();
            const hourOfDay = now.getHours();
            if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(dayOfWeek)) {
                return false;
            }
            if (schedule.hoursOfDay && !schedule.hoursOfDay.includes(hourOfDay)) {
                return false;
            }
        }
        return true;
    }
    evaluateABTest(condition, context) {
        const experiment = condition.parameters.experiment;
        if (!experiment) {
            return { included: false, variant: 'control' };
        }
        // Check traffic allocation
        const percentageResult = this.evaluatePercentage({
            ...condition,
            parameters: {
                percentage: experiment.trafficAllocation,
                salt: `ab_${experiment.experimentId}`
            }
        }, context);
        return {
            included: percentageResult.included,
            variant: percentageResult.included ? experiment.variant : 'control'
        };
    }
    evaluateMultivariate(condition, context) {
        // Simplified multivariate logic - would be more complex in full implementation
        const experiment = condition.parameters.experiment;
        if (!experiment) {
            return { included: false, variant: 'default' };
        }
        const percentageResult = this.evaluatePercentage(condition, context);
        return {
            included: percentageResult.included,
            variant: experiment.variant
        };
    }
    async evaluateCustomExpression(condition, context) {
        if (!this.config.security.allowCustomExpressions) {
            return false;
        }
        try {
            // Create safe evaluation context
            const evalContext = {
                user: context.user,
                request: context.request,
                environment: context.environment,
                timestamp: context.timestamp,
                ...condition.parameters.customVariables
            };
            const result = await this.expressionEvaluator.evaluate(condition.expression, evalContext);
            return Boolean(result);
        }
        catch (error) {
            if (this.config.evaluation.strictMode) {
                throw error;
            }
            return false;
        }
    }
    evaluateDependency(condition, context) {
        const required = condition.parameters.requiredToggles || [];
        const conflicting = condition.parameters.conflictingToggles || [];
        // Check required toggles
        for (const toggleId of required) {
            if (!context.toggles?.[toggleId]) {
                return false;
            }
        }
        // Check conflicting toggles
        for (const toggleId of conflicting) {
            if (context.toggles?.[toggleId]) {
                return false;
            }
        }
        return true;
    }
    evaluateGeographic(condition, context) {
        const countries = condition.parameters.countries;
        const regions = condition.parameters.regions;
        const cities = condition.parameters.cities;
        if (countries && context.request?.country) {
            return countries.includes(context.request.country);
        }
        if (regions && context.request?.region) {
            return regions.includes(context.request.region);
        }
        if (cities && context.request?.city) {
            return cities.includes(context.request.city);
        }
        return false;
    }
    evaluateDeviceType(condition, context) {
        const deviceTypes = condition.parameters.deviceTypes;
        const platforms = condition.parameters.platforms;
        if (deviceTypes && context.request?.device?.type) {
            return deviceTypes.includes(context.request.device.type);
        }
        if (platforms && context.request?.device?.platform) {
            return platforms.includes(context.request.device.platform);
        }
        return false;
    }
    evaluateTrafficSplit(condition, context) {
        const userId = context.user?.id || 'anonymous';
        const hash = this.generateHash(`traffic_${condition.id}_${userId}`);
        const bucket = parseInt(hash.substring(0, 2), 16) % 100;
        const percentage = condition.parameters.percentage || 0;
        return {
            included: bucket < percentage,
            bucket
        };
    }
    evaluateFeatureFlag(condition, context) {
        const requiredFlags = condition.parameters.requiredToggles || [];
        return requiredFlags.every(flagId => context.toggles?.[flagId] === true);
    }
    // Helper methods
    compareValues(userValue, operator, targetValue) {
        switch (operator) {
            case ComparisonOperator.EQUALS:
                return userValue === targetValue;
            case ComparisonOperator.NOT_EQUALS:
                return userValue !== targetValue;
            case ComparisonOperator.GREATER_THAN:
                return Number(userValue) > Number(targetValue);
            case ComparisonOperator.LESS_THAN:
                return Number(userValue) < Number(targetValue);
            case ComparisonOperator.GREATER_EQUAL:
                return Number(userValue) >= Number(targetValue);
            case ComparisonOperator.LESS_EQUAL:
                return Number(userValue) <= Number(targetValue);
            case ComparisonOperator.CONTAINS:
                return String(userValue).includes(String(targetValue));
            case ComparisonOperator.NOT_CONTAINS:
                return !String(userValue).includes(String(targetValue));
            case ComparisonOperator.STARTS_WITH:
                return String(userValue).startsWith(String(targetValue));
            case ComparisonOperator.ENDS_WITH:
                return String(userValue).endsWith(String(targetValue));
            case ComparisonOperator.MATCHES_REGEX:
                try {
                    return new RegExp(String(targetValue)).test(String(userValue));
                }
                catch {
                    return false;
                }
            case ComparisonOperator.IN_LIST:
                return Array.isArray(targetValue) && targetValue.includes(userValue);
            case ComparisonOperator.NOT_IN_LIST:
                return Array.isArray(targetValue) && !targetValue.includes(userValue);
            default:
                return false;
        }
    }
    generateHash(input) {
        // Simple hash function - would use crypto.createHash in full implementation
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
    generateConditionId() {
        return `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateContextHash(context) {
        const hashInput = JSON.stringify({
            userId: context.user?.id,
            segment: context.user?.segment,
            country: context.request?.country,
            device: context.request?.device?.type,
            timestamp: Math.floor((context.timestamp?.getTime() || Date.now()) / 60000) // minute precision
        });
        return this.generateHash(hashInput);
    }
    calculateConfidence(results) {
        if (results.length === 0)
            return 0;
        const successfulEvaluations = results.filter(r => !r.reason.includes('error')).length;
        return successfulEvaluations / results.length;
    }
    async validateCondition(condition) {
        const errors = [];
        const warnings = [];
        // Validate expression for custom expressions
        if (condition.conditionType === ConditionType.CUSTOM_EXPRESSION) {
            try {
                this.expressionEvaluator.validate(condition.expression);
            }
            catch (error) {
                errors.push(`Invalid custom expression: ${error}`);
            }
        }
        // Validate parameters based on condition type
        if (condition.conditionType === ConditionType.PERCENTAGE) {
            const percentage = condition.parameters.percentage;
            if (percentage === undefined || percentage < 0 || percentage > 100) {
                errors.push('Percentage must be between 0 and 100');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    clearToggleCache(toggleId) {
        const keysToDelete = [];
        for (const key of this.evaluationCache.keys()) {
            if (key.startsWith(toggleId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.evaluationCache.delete(key));
    }
    cleanupCache() {
        const now = Date.now();
        const ttlMs = this.config.evaluation.cacheTimeToLive * 1000;
        for (const [key, result] of this.evaluationCache.entries()) {
            if (now - result.metadata.evaluatedAt.getTime() > ttlMs) {
                this.evaluationCache.delete(key);
            }
        }
    }
    isCacheValid(result) {
        const now = Date.now();
        const ttlMs = this.config.evaluation.cacheTimeToLive * 1000;
        return now - result.metadata.evaluatedAt.getTime() < ttlMs;
    }
}
export default ToggleConditionsService;
