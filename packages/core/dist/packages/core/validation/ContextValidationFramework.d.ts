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
    errors: string;
    warnings: string;
    score: number;
    recommendations: string;
    contextHealth: {
        variableIntegrity: number;
        stateConsistency: number;
        cacheEfficiency: number;
        memoryUsage: number;
    };
}
export interface ContextValidationRule {
    name: string;
    description: string;
    category: 'critical' | 'warning' | 'info';
    weight: number;
    validate: (context: AdvancedExecutionContext, config?: AdvancedNodeConfig) => ContextValidationRuleResult;
}
export interface ContextValidationRuleResult {
    passed: boolean;
    score: number;
    message?: string;
    details?: Record<string, any>;
}
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
}
export declare class ContextValidationFramework extends EventEmitter {
    private config;
    private rules;
    private validationHistory;
    number: any;
    contextId: string;
    result: ContextValidationResult;
}
//# sourceMappingURL=ContextValidationFramework.d.ts.map