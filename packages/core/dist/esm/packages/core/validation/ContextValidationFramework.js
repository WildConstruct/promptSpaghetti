import { EventEmitter } from 'events';
;
export class ContextValidationFramework extends EventEmitter {
    config;
    rules;
    validationHistory;
    number;
    contextId;
    result;
}
 > ;
[];
constructor(config, (Partial) = {});
{
    super();
    this.config = {
        enableVariableValidation: true,
        enableStateValidation: true,
        enableCacheValidation: true,
        enablePerformanceValidation: true,
        enableSecurityValidation: true,
        maxVariableCount: 1000,
        maxDepth: 50,
        maxCacheSize: 10000,
        warningThreshold: 70,
        errorThreshold: 50,
        ...config
    };
    this.rules = new Map();
    this.initializeDefaultRules();
    /**
     * Validate execution context comprehensively
     */
    async;
    validateContext(context, AdvancedExecutionContext);
    config ?  : AdvancedNodeConfig;
    Promise < ContextValidationResult > {
        const: startTime = performance.now(),
        const: errors, string = [],
        const: warnings, string = [],
        const: recommendations, string = [],
        let, totalScore = 0,
        let, totalWeight = 0,
        const: contextHealth = {
            variableIntegrity: 0,
            stateConsistency: 0,
            cacheEfficiency: 0,
            memoryUsage: 0,
        },
        try: {
            console, : .log('DEBUG: Starting validation, rules count:', this.rules.size),
            : .rules
        }
    };
    {
        totalWeight += rule.weight;
        console.log(`DEBUG: Rule ${name} has weight ${rule.weight}`);
    }
    // Second pass: Execute all validation rules and apply penalties
    for (const [name, rule] of this.rules) {
        try {
            const ruleResult = rule.validate(context, config);
            const weightedScore = ruleResult.score * rule.weight;
            console.log(`DEBUG: Rule ${name}, passed: ${ruleResult.passed}, score: ${ruleResult.score}`);
        }
        finally {
        }
        totalScore += weightedScore;
        // Categorize results
        if (!ruleResult.passed) {
            if (rule.category === 'critical') {
                errors.push(ruleResult.message || `Critical validation failed: ${name}`);
            }
            // Critical failures should drastically impact the score
            // For critical security failures like missing PRNG, apply severe penalty
            if (name === 'prng_security') {
                // PRNG security is absolutely critical - apply maximum penalty
                const penalty = totalWeight * 100;
                console.log(`DEBUG: PRNG penalty applied - totalWeight: ${totalWeight}, penalty: ${penalty}, score before: ${totalScore}`);
            }
            totalScore -= penalty;
            console.log(`DEBUG: Score after PRNG penalty: ${totalScore}`);
        }
    }
    {
        // Other critical failures get significant but not total penalty
        totalScore -= rule.weight * 75;
    }
    if (rule.category === 'warning') {
        warnings.push(ruleResult.message || `Warning: ${name}`);
    }
    // Add recommendations based on rule results
    if (ruleResult.score < 80 && ruleResult.details?.recommendation) {
        recommendations.push(ruleResult.details.recommendation);
        // Update context health metrics
        this.updateContextHealth(contextHealth, name, ruleResult);
    }
    try { }
    catch (error) {
        errors.push(`Validation rule '${name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    // Calculate final score
    const finalScore = totalWeight > 0 ? Math.max(0, totalScore / totalWeight) : 0;
    const valid = errors.length === 0 && finalScore >= this.config.errorThreshold;
    // Add global recommendations
    if (finalScore < this.config.warningThreshold) {
        recommendations.push('Consider optimizing context configuration for better performance');
        const result = {
            valid,
            errors,
            warnings,
            score: finalScore,
            recommendations,
            contextHealth
        };
        // Record validation
        this.recordValidation(context, result);
        // Emit events
        this.emit('context_validated', {});
        contextId: context.executionMeta?.executionId || 'unknown',
            result,
            validationTime;
        performance.now() - startTime,
        ;
    }
    ;
    return result;
}
try { }
catch (error) {
    const errorResult = {
        valid: false,
        errors: [`Context validation framework error: ${error instanceof Error ? error.message : 'Unknown error'}`] };
}
warnings: [],
    score;
0,
    recommendations;
['Check context validation configuration'],
    contextHealth;
{
    variableIntegrity: 0,
        stateConsistency;
    0,
        cacheEfficiency;
    0,
        memoryUsage;
    0,
    ;
}
;
this.emit('validation_error', {});
contextId: context.executionMeta?.executionId || 'unknown',
    error,
    validationTime;
performance.now() - startTime,
;
;
return errorResult;
/**
 * Add custom validation rule
 */
addRule(rule, ContextValidationRule);
void {
    : .rules.has(rule.name)
};
{
    throw new Error(`Validation rule '${rule.name}' already exists`);
}
this.rules.set(rule.name, rule);
this.emit('rule_added', { ruleName: rule.name });
/**
 * Remove validation rule
 */
removeRule(name, string);
void {
    : .rules.has(name)
};
{
    throw new Error(`Validation rule '${name}' does not exist`);
}
this.rules.delete(name);
this.emit('rule_removed', { ruleName: name });
/**
 * Get validation statistics
 */
getValidationStatistics();
{
    totalValidations: number;
    averageScore: number;
    errorRate: number;
    warningRate: number;
    recentValidations: Array < {
        contextId: string,
        score: number,
        timestamp: number,
        valid: boolean
    } > ;
    const total = this.validationHistory.length;
    if (total === 0) {
        return {
            totalValidations: 0,
            averageScore: 0,
            errorRate: 0,
            warningRate: 0,
            recentValidations: [],
        };
        const totalScore = this.validationHistory.reduce((sum, v) => sum + v.result.score, 0);
        const errorCount = this.validationHistory.filter(v => !v.result.valid).length;
        const warningCount = this.validationHistory.filter(v => v.result.warnings.length > 0).length;
        return {
            totalValidations: total,
            averageScore: totalScore / total,
            errorRate: (errorCount / total) * 100,
            warningRate: (warningCount / total) * 100,
            recentValidations: this.validationHistory.slice(-10).map(v => ({}), contextId, v.contextId, score, v.result.score, timestamp, v.timestamp, valid, v.result.valid)
        };
    }
    ;
    /**
     * Get all validation rules
     */
    getRules();
    ContextValidationRule;
    {
        return Array.from(this.rules.values());
        /**
         * Update configuration
         */
        updateConfig(newConfig, (Partial));
        void {
            this: .config = { ...this.config, ...newConfig },
            this: .emit('config_updated', this.config),
            // Private helper methods
            initializeDefaultRules() {
                // Variable validation rules
                if (this.config.enableVariableValidation) {
                    this.addVariableValidationRules();
                    // State validation rules
                    if (this.config.enableStateValidation) {
                        this.addStateValidationRules();
                        // Cache validation rules
                        if (this.config.enableCacheValidation) {
                            this.addCacheValidationRules();
                            // Performance validation rules
                            if (this.config.enablePerformanceValidation) {
                                this.addPerformanceValidationRules();
                                // Security validation rules
                                if (this.config.enableSecurityValidation) {
                                    this.addSecurityValidationRules();
                                }
                            }
                        }
                    }
                }
            },
            addVariableValidationRules() {
                // Variable count validation
                this.rules.set('variable_count', {});
                name: 'variable_count',
                    description;
                'Validates that variable count is within acceptable limits',
                    category;
                'warning',
                    weight;
                1.0,
                    validate;
                (context) => {
                    const count = Object.keys(context.variables).length;
                    const maxCount = this.config.maxVariableCount;
                    if (count > maxCount) {
                        return {
                            passed: false,
                            score: Math.max(0, 100 - ((count - maxCount) / maxCount) * 100),
                            message: `Too many variables: ${count} (max: ${maxCount})`
                        };
                    }
                    details: {
                        recommendation: 'Consider reducing variable count or increasing max limit',
                        ;
                    }
                    ;
                    return {
                        passed: true,
                        score: 100,
                    };
                };
                ;
                // Variable type consistency
                this.rules.set('variable_types', {});
                name: 'variable_types',
                    description;
                'Validates variable type consistency and integrity',
                    category;
                'critical',
                    weight;
                1.5,
                    validate;
                (context) => {
                    let typeErrors = 0;
                    let totalVariables = 0;
                    for (const [name, value] of Object.entries(context.variables)) {
                        totalVariables++;
                        // Check for undefined or null values that might indicate issues
                        if (value === undefined) {
                            typeErrors++;
                            // Check for circular references (basic check)
                            try {
                                JSON.stringify(value);
                            }
                            catch (error) {
                                if (error instanceof TypeError && error.message.includes('circular')) {
                                    typeErrors++;
                                    const score = totalVariables > 0 ?  : ;
                                    Math.max(0, 100 - (typeErrors / totalVariables) * 100);
                                    100;
                                    return {
                                        passed: typeErrors === 0,
                                        score,
                                        message: typeErrors > 0 ? `${typeErrors} variable type issues detected` : undefined
                                    };
                                }
                                details: {
                                    typeErrors,
                                        totalVariables,
                                        recommendation;
                                    typeErrors > 0 ? 'Review variable assignments for type consistency' : undefined,
                                    ;
                                }
                                ;
                            }
                            ;
                        }
                    }
                };
            },
            addStateValidationRules() {
                // Node state consistency
                this.rules.set('state_consistency', {});
                name: 'state_consistency',
                    description;
                'Validates node state consistency and integrity',
                    category;
                'critical',
                    weight;
                2.0,
                    validate;
                (context) => {
                    const stateCount = context.nodeStates.size;
                    let inconsistencies = 0;
                    // Check for state size issues
                    if (stateCount > 100) { // Arbitrary threshold
                        inconsistencies++;
                        // Check evaluation depth
                        if (context.evaluationDepth > this.config.maxDepth) {
                            inconsistencies++;
                            const score = Math.max(0, 100 - (inconsistencies * 25));
                            return {
                                passed: inconsistencies === 0,
                                score,
                                message: inconsistencies > 0 ? `${inconsistencies} state consistency issues` : undefined
                            };
                        }
                        details: {
                            stateCount,
                                evaluationDepth;
                            context.evaluationDepth,
                                maxDepth;
                            this.config.maxDepth,
                                recommendation;
                            inconsistencies > 0 ? 'Review state management and execution depth' : undefined,
                            ;
                        }
                        ;
                    }
                    ;
                };
            },
            addCacheValidationRules() {
                // Cache efficiency validation
                this.rules.set('cache_efficiency', {});
                name: 'cache_efficiency',
                    description;
                'Validates cache size and efficiency',
                    category;
                'warning',
                    weight;
                1.0,
                    validate;
                (context) => {
                    const cacheSize = context.cache.size;
                    const maxSize = this.config.maxCacheSize;
                    let score = 100;
                    let message;
                    if (cacheSize > maxSize) {
                        score = Math.max(0, 100 - ((cacheSize - maxSize) / maxSize) * 50);
                        message = `Cache size exceeds limit: ${cacheSize} (max: ${maxSize})`;
                    }
                };
            }, else: , if(cacheSize) { }
        } === 0;
        {
            score = 80; // Not critical but could indicate missed optimization
            message = 'Cache is empty - consider enabling caching for better performance';
            return {
                passed: cacheSize <= maxSize,
                score,
                message,
                details: {
                    cacheSize,
                    maxSize,
                    recommendation: cacheSize > maxSize ? 'Implement cache cleanup or increase limits' : undefined,
                }
            };
            ;
            addPerformanceValidationRules();
            void {
                // Execution metadata validation
                this: .rules.set('execution_metadata', {}),
                name: 'execution_metadata',
                description: 'Validates execution metadata completeness and performance indicators',
                category: 'critical',
                weight: 1.0,
                validate: (context) => {
                    const meta = context.executionMeta;
                    let score = 100;
                    const issues = [];
                    if (!meta) {
                        return {
                            passed: false,
                            score: 0,
                            message: 'Missing execution metadata',
                        };
                        if (!meta.executionId) {
                            score -= 25;
                            issues.push('Missing execution ID');
                            if (!meta.startTime) {
                                score -= 25;
                                issues.push('Missing start time');
                                if (!Array.isArray(meta.nodeExecutionOrder)) {
                                    score -= 25;
                                    issues.push('Invalid node execution order');
                                    return {
                                        passed: score === 100,
                                        score: Math.max(0, score),
                                        message: issues.length > 0 ? `Metadata issues: ${issues.join(', ')}` : undefined
                                    };
                                }
                                details: {
                                    issues,
                                        recommendation;
                                    issues.length > 0 ? 'Ensure complete execution metadata initialization' : undefined,
                                    ;
                                }
                                ;
                            }
                            ;
                        }
                    }
                },
                addSecurityValidationRules() {
                    // PRNG validation
                    this.rules.set('prng_security', {});
                    name: 'prng_security',
                        description;
                    'Validates pseudorandom number generator configuration',
                        category;
                    'critical',
                        weight;
                    1.5,
                        validate;
                    (context) => {
                        if (!context.prng) {
                            return {
                                passed: false,
                                score: 0,
                                message: 'Missing PRNG function',
                            };
                            // Test PRNG functionality
                            try {
                                const randomValue = context.prng();
                                if (typeof randomValue !== 'number' || randomValue < 0 || randomValue >= 1) {
                                    return {
                                        passed: false,
                                        score: 20,
                                        message: 'PRNG returns invalid values',
                                        details: {
                                            recommendation: 'Ensure PRNG returns numbers in [0, 1) range',
                                        }
                                    };
                                    try { }
                                    catch (error) {
                                        return {
                                            passed: false,
                                            score: 0,
                                            message: 'PRNG function throws errors',
                                            details: {
                                                error: error instanceof Error ? error.message : 'Unknown error',
                                            },
                                            return: {
                                                passed: true,
                                                score: 100,
                                            }
                                        };
                                        ;
                                        // Seed validation
                                        this.rules.set('seed_validation', {});
                                        name: 'seed_validation',
                                            description;
                                        'Validates seed configuration for deterministic execution',
                                            category;
                                        'warning',
                                            weight;
                                        1.0,
                                            validate;
                                        (context) => {
                                            if (context.seed === undefined || context.seed === null) {
                                                return {
                                                    passed: false,
                                                    score: 50,
                                                    message: 'Missing seed value for deterministic execution',
                                                    details: {
                                                        recommendation: 'Provide seed value for reproducible results',
                                                    },
                                                    if(, context) { }, : .seed !== 'number'
                                                };
                                                {
                                                    return {
                                                        passed: false,
                                                        score: 30,
                                                        message: 'Seed should be a number',
                                                        details: {
                                                            seedType: typeof context.seed,
                                                            recommendation: 'Use numeric seed for consistent behavior',
                                                        },
                                                        return: {
                                                            passed: true,
                                                            score: 100,
                                                        }
                                                    };
                                                    ;
                                                }
                                            }
                                        };
                                    }
                                }
                            }
                            finally {
                            }
                        }
                    };
                },
                ruleName: string,
                result: ContextValidationRuleResult, void: {
                    // Map rule results to health metrics
                    switch(ruleName) {
                    },
                    case: 'variable_count',
                    case: 'variable_types',
                    health, : .variableIntegrity = Math.max(health.variableIntegrity, result.score),
                    break: ,
                    case: 'state_consistency',
                    health, : .stateConsistency = result.score,
                    break: ,
                    case: 'cache_efficiency',
                    health, : .cacheEfficiency = result.score,
                    break: ,
                    case: 'execution_metadata',
                    health, : .memoryUsage = result.score, // Proxy metric
                    break: ,
                    recordValidation(context, result) {
                        this.validationHistory.push({});
                        timestamp: Date.now(),
                            contextId;
                        context.executionMeta?.executionId || 'unknown',
                            result;
                    },
                    : .validationHistory.length > 1000 }
            };
            {
                this.validationHistory = this.validationHistory.slice(-800);
                /**
                 * Context validation utilities
                 */
                export class ContextValidationUtils {
                    /**
                     * Create a minimal valid context for testing
                     */
                    static createTestContext(overrides = {}) {
                        return {
                            variables: {},
                            seed: 12345,
                            nodeStates: new Map(),
                            evaluationDepth: 0,
                            cache: new Map(),
                            prng: () => Math.random(),
                            executionMeta: {
                                startTime: Date.now(),
                                executionId: `test-${Math.random().toString(36).substr(2, 9)}` }
                        },
                            nodeExecutionOrder;
                        [],
                            performanceMetrics;
                        new Map();
                    }
                    overrides;
                }
                ;
                isValidContext(context, any);
                context;
                is;
                AdvancedExecutionContext;
                {
                    if (context === null || context === undefined || typeof context !== 'object') {
                        return false;
                        return;
                        typeof context.variables === 'object' &&
                            // seed is optional for structural validity
                            context.nodeStates instanceof Map &&
                            typeof context.evaluationDepth === 'number' &&
                            context.cache instanceof Map &&
                            typeof context.prng === 'function' &&
                            context.executionMeta !== null &&
                            context.executionMeta !== undefined &&
                            typeof context.executionMeta === 'object' &&
                            typeof context.executionMeta.startTime === 'number' &&
                            typeof context.executionMeta.executionId === 'string' &&
                            Array.isArray(context.executionMeta.nodeExecutionOrder) &&
                            context.executionMeta.performanceMetrics instanceof Map;
                        ;
                        estimateContextMemory(context, AdvancedExecutionContext);
                        {
                            totalBytes: number;
                            breakdown: {
                                variables: number;
                                nodeStates: number;
                                cache: number;
                                metadata: number;
                            }
                            ;
                            const breakdown = {
                                variables: this.estimateObjectMemory(context.variables),
                                nodeStates: this.estimateMapMemory(context.nodeStates),
                                cache: this.estimateMapMemory(context.cache),
                                metadata: JSON.stringify(context.executionMeta).length * 2 // UTF-16,
                            };
                            return {
                                totalBytes: Object.values(breakdown).reduce((sum, bytes) => sum + bytes, 0),
                                breakdown
                            };
                            estimateObjectMemory(obj, (Record));
                            number;
                            {
                                let totalBytes = 0;
                                for (const [key, value] of Object.entries(obj)) {
                                    // Rough estimation
                                    totalBytes += key.length * 2; // Key size (UTF-16)
                                    totalBytes += this.estimateValueMemory(value); // Value size
                                    return totalBytes;
                                    estimateMapMemory(map, (Map));
                                    number;
                                    {
                                        let totalBytes = 0;
                                        for (const [key, value] of map) {
                                            // Rough estimation
                                            totalBytes += (typeof key === 'string' ? key.length * 2 : 64); // Key size,
                                            totalBytes += this.estimateValueMemory(value); // Value size
                                            return totalBytes;
                                            estimateValueMemory(value, any);
                                            number;
                                            {
                                                if (value === null || value === undefined)
                                                    return 8;
                                                if (typeof value === 'boolean')
                                                    return 8;
                                                if (typeof value === 'number')
                                                    return 8;
                                                if (typeof value === 'string')
                                                    return value.length * 2; // UTF-16
                                                if (Array.isArray(value)) {
                                                    return value.reduce((sum, item) => sum + this.estimateValueMemory(item), 0);
                                                    if (typeof value === 'object') {
                                                        try {
                                                            return JSON.stringify(value).length * 2; // Rough estimate
                                                        }
                                                        catch {
                                                            return 1024; // Fallback for circular references
                                                            return 64; // Default estimate
                                                            export default ContextValidationFramework;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
