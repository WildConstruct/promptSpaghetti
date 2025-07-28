/**
 * Context Validation Framework
 * Epic 18 - Implement Context Validation (E18-1753114562043-B1E2F9)
 *
 * Advanced validation framework for execution contexts and runtime environments
 */
import { AdvancedExecutionContext, AdvancedNodeConfig } from '../runtime/advanced';
import { EventEmitter } from 'events';

export interface ContextValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
    recommendations: string[];
    contextHealth: {,
        variableIntegrity: number;
        stateConsistency: number;
        cacheEfficiency: number;
        memoryUsage: number;
    };

export interface ContextValidationRule {
    name: string;
    description: string;
    category: 'critical' | 'warning' | 'info';
    weight: number;
    validate: (context: AdvancedExecutionContext, config?: AdvancedNodeConfig) => ContextValidationRuleResult;

export interface ContextValidationRuleResult {
    passed: boolean;
    score: number;
    message?: string;
    details?: Record<string, any>;

export interface ContextValidationConfig {
    enableVariableValidation: boolean;
    enableStateValidation: boolean;
    enableCacheValidation: boolean;
    enablePerformanceValidation: boolean;
    enableSecurityValidation: boolean;
    maxVariableCount: number;
    maxDepth: number;
    maxCacheSize: number;
    warningThreshold: number;
    errorThreshold: number;
/**
 * Comprehensive context validation framework
 */
export declare class ContextValidationFramework extends EventEmitter {
    private config;
    private rules;
    private validationHistory;
    constructor(config?: Partial<ContextValidationConfig>);
    /**
     * Validate execution context comprehensively
     */
    validateContext(context: AdvancedExecutionContext, config?: AdvancedNodeConfig): Promise<ContextValidationResult>;
    /**
     * Add custom validation rule
     */
    addRule(rule: ContextValidationRule): void;
    /**
     * Remove validation rule
     */
    removeRule(name: string): void;
    /**
     * Get validation statistics
     */
    getValidationStatistics(): {
        totalValidations: number;
        averageScore: number;
        errorRate: number;
        warningRate: number;
        recentValidations: Array<{,
            contextId: string;
            score: number;
            timestamp: number;
            valid: boolean;
        }>;
    };
    /**
     * Get all validation rules
     */
    getRules(): ContextValidationRule[];
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ContextValidationConfig>): void;
    private initializeDefaultRules;
    private addVariableValidationRules;
    private addStateValidationRules;
    private addCacheValidationRules;
    private addPerformanceValidationRules;
    private addSecurityValidationRules;
    private updateContextHealth;
    private recordValidation;
/**
 * Context validation utilities
 */
export declare class ContextValidationUtils {
    /**
     * Create a minimal valid context for testing
     */
    static createTestContext(overrides?: Partial<AdvancedExecutionContext>): AdvancedExecutionContext;
    /**
     * Validate context meets minimum requirements
     */
    static isValidContext(context: any): context is AdvancedExecutionContext;
    /**
     * Estimate context memory usage
     */
    static estimateContextMemory(context: AdvancedExecutionContext): {
        totalBytes: number;
        breakdown: {,
            variables: number;
            nodeStates: number;
            cache: number;
            metadata: number;
        };
    };
    private static estimateObjectMemory;
    private static estimateMapMemory;
    private static estimateValueMemory;

export default ContextValidationFramework;
//# sourceMappingURL=ContextValidationFramework.d.ts.map