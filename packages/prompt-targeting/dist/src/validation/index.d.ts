/**
 * Validation system index file
 * Epic 10.2.3 - Validation Rules System with Severity Levels
 */
import { ValidationRulesEngine, ValidationEngineConfig } from './ValidationRulesEngine';
export { ValidationRulesEngine, ValidationSeverity, ValidationCategory } from './ValidationRulesEngine';
export type { ValidationRule, ValidationRuleResult, ValidationContext, ValidationReport, ValidationEngineConfig } from './ValidationRulesEngine';
export { MissingRequiredPropertiesRule, DuplicateContentRule, LanguageConsistencyRule, SensitiveContentRule, ProcessingTimeRule, MemoryUsageRule } from './AdditionalValidationRules';
/**
 * Factory function to create a validation engine with recommended configuration
 */
export declare function createValidationEngine(config?: Partial<ValidationEngineConfig>): ValidationRulesEngine;
//# sourceMappingURL=index.d.ts.map