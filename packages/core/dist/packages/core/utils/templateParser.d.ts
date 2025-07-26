export interface ExtractedVariable {
    name: string;
    placeholder: string;
    startIndex: number;
    endIndex: number;
    isValid: boolean;
    inferredType?: VariableType;
    defaultValue?: string;
}
export interface TemplateParseResult {
    variables: ExtractedVariable[];
    errors: TemplateError[];
    isValid: boolean;
    processedTemplate: string;
}
export interface TemplateError {
    type: 'unclosed_brace' | 'empty_variable' | 'invalid_name' | 'nested_braces';
    message: string;
    position: number;
    severity: 'error' | 'warning';
}
export type VariableType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'auto';
export interface VariableTypeInference {
    type: VariableType;
    confidence: number;
    reason: string;
    defaultValue: string;
}
export interface VariableSuggestion {
    name: string;
    category: 'character' | 'setting' | 'action' | 'mood' | 'object' | 'cinematic' | 'temporal' | 'descriptive' | 'narrative' | 'custom';
    description: string;
    examples: string[];
    priority?: number;
    nodeTypes?: string[];
    relatedVariables?: string[];
}
declare class TemplateParser {
    private static instance;
    private parseCache;
    static getInstance(): TemplateParser;
    /**
     * Parse template and extract variables
     */
    parseTemplate(template: string): TemplateParseResult;
    private performParse;
    private validateVariableName;
    private findUnclosedBraces;
    private findNestedBraces;
    private highlightVariables;
    /**
     * Infer variable type from name patterns and context
     */
    private inferVariableType;
    /**
     * Extract surrounding context for better type inference
     */
    private extractSurroundingContext;
    private userHistory;
    private currentNodeType?;
    private currentVariables;
    /**
     * Set context for contextual suggestions
     */
    setContext(nodeType?: string, existingVariables?: string[]): void;
    /**
     * Track variable usage for user history
     */
    trackVariableUsage(variableName: string): void;
    /**
     * Get user's custom variable suggestions based on history
     */
    private getUserHistorySuggestions;
    /**
     * Find related variables based on co-occurrence patterns
     */
    private findRelatedVariables;
    /**
     * Get contextual suggestions based on node type and existing variables
     */
    private getContextualSuggestions;
    /**
     * Get variable suggestions for auto-completion with enhanced contextual support
     */
    getVariableSuggestions(partialName?: string, context?: string, includeHistory?: boolean): VariableSuggestion[];
    /**
     * Substitute variables in template with actual values
     */
    substituteVariables(template: string, values: Record<string, string>): string;
    /**
     * Get preview with sample values
     */
    getPreviewWithSamples(template: string): {
        preview: string;
        usedSamples: Record<string, string>;
    };
    /**
     * Clear parse cache
     */
    clearCache(): void;
}
export declare const templateParser: TemplateParser;
export declare const parseTemplate: (template: string) => TemplateParseResult;
export declare const getVariableSuggestions: (
  partialName?: string,
  context?: string,
  includeHistory?: boolean
) => VariableSuggestion[];
export declare const substituteVariables: (template: string, values: Record<string, string>) => string;
export declare const getPreviewWithSamples: (template: string) => {
    preview: string;
    usedSamples: Record<string, string>;
};
export declare const trackVariableUsage: (variableName: string) => void;
export declare const VARIABLE_CATEGORIES: readonly ["character", "setting", "action", "mood", "object", "cinematic", "temporal", "descriptive", "narrative", "custom"];
export type VariableCategory = typeof VARIABLE_CATEGORIES[number];
/**
 * Generate smart default values for a template based on its variables
 */
export declare /**
 * Get contextual default values based on node type and template content
 */
export declare export {};
//# sourceMappingURL=templateParser.d.ts.map