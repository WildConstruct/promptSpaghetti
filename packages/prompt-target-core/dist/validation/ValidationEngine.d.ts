import { PromptGraph, ValidationResult, Platform, ModelAdaptor, AutoFixAction, Logger, MetricsInterface } from '../types/index.js';
/**
 * Comprehensive validation engine for prompt graphs
 */
export declare class ValidationEngine {
    private logger;
    private metrics;
    private customRules;
    constructor(logger: Logger, metrics: MetricsInterface);
    /**
     * Validate a graph against multiple adaptors
     */
    validateGraph(graph: PromptGraph, adaptors: ModelAdaptor[], options?: ValidationOptions): Promise<ValidationReport>;
    /**
     * Validate graph structure (platform-agnostic)
     */
    private validateStructure;
    /**
     * Validate against custom rules
     */
    private validateCustomRules;
    /**
     * Validate graph for specific platform
     */
    private validateForPlatform;
    /**
     * Analyze cross-platform compatibility issues
     */
    private analyzeCrossPlatformCompatibility;
    /**
     * Aggregate validation results
     */
    private aggregateResults;
    /**
     * Generate auto-fix suggestions
     */
    private generateAutoFixSuggestions;
    /**
     * Detect cycles in the graph
     */
    private detectCycles;
    /**
     * Find connected components in the graph
     */
    private findConnectedComponents;
    /**
     * Calculate confidence for an auto-fix suggestion
     */
    private calculateFixConfidence;
    /**
     * Assess impact of an auto-fix
     */
    private assessFixImpact;
    /**
     * Add custom validation rule
     */
    addCustomRule(rule: ValidationRule): void;
    /**
     * Remove custom validation rule
     */
    removeCustomRule(ruleId: string): void;
}
export interface ValidationOptions {
    includeWarnings?: boolean;
    includeLowSeverity?: boolean;
    customRules?: boolean;
}
export interface ValidationReport {
    graphId: string;
    timestamp: Date;
    overallValid: boolean;
    totalIssues: number;
    platformResults: Map<Platform, PlatformValidationResult>;
    summary: ValidationSummary;
    autoFixSuggestions: AutoFixSuggestion[];
    crossPlatformIssues: CrossPlatformIssue[];
}
export interface PlatformValidationResult {
    platform: Platform;
    adaptorId: string;
    adaptorVersion: string;
    results: ValidationResult[];
    capabilities: any;
    quality: any;
    compatible: boolean;
    duration: number;
}
export interface ValidationSummary {
    criticalErrors: number;
    highErrors: number;
    mediumWarnings: number;
    lowInfos: number;
}
export interface AutoFixSuggestion {
    id: string;
    type: 'fix' | 'alternative' | 'workaround';
    description: string;
    action: AutoFixAction;
    affectedIssues: string[];
    confidence: number;
    impact: 'low' | 'medium' | 'high';
}
export interface CrossPlatformIssue {
    type: 'feature_support' | 'node_type' | 'parameter';
    severity: 'low' | 'medium' | 'high';
    feature?: string;
    supportingPlatforms: Platform[];
    unsupportedPlatforms: Platform[];
    description: string;
    impact: string;
}
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    validate(graph: PromptGraph): Promise<ValidationResult[]>;
}
