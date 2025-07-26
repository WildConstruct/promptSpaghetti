/**
 * Additional validation rules for enhanced validation capabilities
 * Epic 10.2.3 - Validation Rules System Extensions
 */
import { 
  ValidationRule,
  ValidationRuleResult,
  ValidationContext,
  ValidationCategory,
  ValidationSeverity
} from './ValidationRulesEngine';
/**
 * Validates that all nodes have valid and required properties
 */
export declare class MissingRequiredPropertiesRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity: ValidationSeverity;
    enabled: boolean;
    private readonly requiredPropertiesByType;
    applies(): boolean;
    validate(context: ValidationContext): Promise<ValidationRuleResult>;
    getSuggestion(): string;
    autoFix(context: ValidationContext): Promise<{
        fixed: boolean;
        changes: any[];
    }>;
    private getDefaultValue;
}
/**
 * Detects duplicate content across nodes
 */
export declare class DuplicateContentRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity: ValidationSeverity;
    enabled: boolean;
    applies(): boolean;
    validate(context: ValidationContext): Promise<ValidationRuleResult>;
    getSuggestion(): string;
}
/**
 * Validates language consistency across content
 */
export declare class LanguageConsistencyRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity: ValidationSeverity;
    enabled: boolean;
    private readonly languagePatterns;
    applies(): boolean;
    validate(context: ValidationContext): Promise<ValidationRuleResult>;
    private detectLanguages;
    getSuggestion(): string;
}
/**
 * Detects potentially sensitive or inappropriate content
 */
export declare class SensitiveContentRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity: ValidationSeverity;
    enabled: boolean;
    private readonly sensitivePatterns;
    private readonly sensitiveCategories;
    applies(): boolean;
    validate(context: ValidationContext): Promise<ValidationRuleResult>;
    getSuggestion(): string;
    autoFix(context: ValidationContext): Promise<{
        fixed: boolean;
        changes: any[];
    }>;
}
/**
 * Estimates and validates processing time for the graph
 */
export declare class ProcessingTimeRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity: ValidationSeverity;
    enabled: boolean;
    private readonly nodeProcessingTimes;
    applies(): boolean;
    validate(context: ValidationContext): Promise<ValidationRuleResult>;
    private extractContent;
    getSuggestion(): string;
}
/**
 * Estimates memory usage for graph processing
 */
export declare class MemoryUsageRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity: ValidationSeverity;
    enabled: boolean;
    private readonly nodeMemoryUsage;
    applies(): boolean;
    validate(context: ValidationContext): Promise<ValidationRuleResult>;
    private extractContent;
    getSuggestion(): string;
}
//# sourceMappingURL=AdditionalValidationRules.d.ts.map