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
    variables: ExtractedVariable;
    errors: TemplateError;
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
    examples: string;
    priority?: number;
    nodeTypes?: string;
    relatedVariables?: string;
    const: any;
    COMMON_VARIABLES: VariableSuggestion;
}
//# sourceMappingURL=templateParser.d.ts.map