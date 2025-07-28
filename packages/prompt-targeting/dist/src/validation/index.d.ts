/**
 * Validation system index file
 * Epic 10.2.3 - Validation Rules System with Severity Levels
 */
import { ValidationRulesEngine, ValidationEngineConfig, ValidationReport } from './ValidationRulesEngine';
export { ValidationRulesEngine, ValidationSeverity, ValidationCategory } from './ValidationRulesEngine';
export type { ValidationRule, ValidationRuleResult, ValidationContext, ValidationReport, ValidationEngineConfig } from './ValidationRulesEngine';
export { MissingRequiredPropertiesRule, DuplicateContentRule, LanguageConsistencyRule, SensitiveContentRule, ProcessingTimeRule, MemoryUsageRule } from './AdditionalValidationRules';
/**
 * Factory function to create a validation engine with recommended configuration
 */
export declare function createValidationEngine(config?: Partial<ValidationEngineConfig>): ValidationRulesEngine;
/**
 * Factory function to create a strict validation engine for production
 */
export declare function createStrictValidationEngine(): ValidationRulesEngine;
/**
 * Factory function to create a development validation engine with auto-fix
 */
export declare function createDevelopmentValidationEngine(): ValidationRulesEngine;
/**
 * Factory function to create a security-focused validation engine
 */
export declare function createSecurityValidationEngine(): ValidationRulesEngine;
/**
 * Factory function to create a performance-focused validation engine
 */
export declare function createPerformanceValidationEngine(): ValidationRulesEngine;
/**
 * Utility function to validate a graph with automatic platform detection
 */
export declare function validateGraph(graph: any, targetPlatform?: string, capabilities?: any, config?: Partial<ValidationEngineConfig>): Promise<ValidationReport>;
/**
 * Utility function to validate and auto-fix a graph
 */
export declare function validateAndFixGraph(graph: any, targetPlatform?: string, capabilities?: any): Promise<{
    report: ValidationReport;
    fixes: Array<{
        ruleId: string;
        changes: any[];
        success: boolean;
    }>;
    modifiedGraph: any;
}>;
//# sourceMappingURL=index.d.ts.map