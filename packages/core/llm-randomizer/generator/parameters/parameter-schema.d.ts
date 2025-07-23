import { z } from 'zod';
export declare const ComplexityLevel: z.ZodEnum<["simple", "moderate", "complex"]>;
export declare const StylePreference: z.ZodEnum<["creative", "logical", "balanced"]>;
export declare const LLMProvider: z.ZodEnum<["openai", "claude", "gemini"]>;
export declare const NodeTypePreference: z.ZodObject<{
    nodeType: z.ZodString;
    weight: z.ZodNumber;
    required: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    required?: boolean;
    nodeType?: string;
    weight?: number;
}, {
    required?: boolean;
    nodeType?: string;
    weight?: number;
}>;
export declare const RandomizerParametersSchema: z.ZodObject<{
    purpose: z.ZodString;
    complexity: z.ZodEnum<["simple", "moderate", "complex"]>;
    nodeCount: z.ZodNumber;
    style: z.ZodEnum<["creative", "logical", "balanced"]>;
    domain: z.ZodOptional<z.ZodString>;
    userContext: z.ZodOptional<z.ZodString>;
    nodeTypes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        nodeType: z.ZodString;
        weight: z.ZodNumber;
        required: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        required?: boolean;
        nodeType?: string;
        weight?: number;
    }, {
        required?: boolean;
        nodeType?: string;
        weight?: number;
    }>, "many">>;
    specificRequirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    focusAreas: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    provider: z.ZodDefault<z.ZodEnum<["openai", "claude", "gemini"]>>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
    validateOutput: z.ZodDefault<z.ZodBoolean>;
    enablePreview: z.ZodDefault<z.ZodBoolean>;
    preferredPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    avoidPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    qualityLevel: z.ZodDefault<z.ZodEnum<["draft", "standard", "high"]>>;
    diversityScore: z.ZodDefault<z.ZodNumber>;
    outputFormat: z.ZodDefault<z.ZodEnum<["graph", "serialized", "both"]>>;
    includeExplanation: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    style?: "balanced" | "creative" | "logical";
    purpose?: string;
    complexity?: "simple" | "moderate" | "complex";
    nodeCount?: number;
    domain?: string;
    userContext?: string;
    nodeTypes?: {
        required?: boolean;
        nodeType?: string;
        weight?: number;
    }[];
    specificRequirements?: string[];
    constraints?: string[];
    focusAreas?: string[];
    provider?: "openai" | "claude" | "gemini";
    temperature?: number;
    maxRetries?: number;
    includeMetadata?: boolean;
    validateOutput?: boolean;
    enablePreview?: boolean;
    preferredPatterns?: string[];
    avoidPatterns?: string[];
    qualityLevel?: "high" | "standard" | "draft";
    diversityScore?: number;
    outputFormat?: "both" | "graph" | "serialized";
    includeExplanation?: boolean;
}, {
    style?: "balanced" | "creative" | "logical";
    purpose?: string;
    complexity?: "simple" | "moderate" | "complex";
    nodeCount?: number;
    domain?: string;
    userContext?: string;
    nodeTypes?: {
        required?: boolean;
        nodeType?: string;
        weight?: number;
    }[];
    specificRequirements?: string[];
    constraints?: string[];
    focusAreas?: string[];
    provider?: "openai" | "claude" | "gemini";
    temperature?: number;
    maxRetries?: number;
    includeMetadata?: boolean;
    validateOutput?: boolean;
    enablePreview?: boolean;
    preferredPatterns?: string[];
    avoidPatterns?: string[];
    qualityLevel?: "high" | "standard" | "draft";
    diversityScore?: number;
    outputFormat?: "both" | "graph" | "serialized";
    includeExplanation?: boolean;
}>;
export type RandomizerParameters = z.infer<typeof RandomizerParametersSchema>;
export declare const ParameterPresetSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    parameters: z.ZodObject<{
        purpose: z.ZodString;
        complexity: z.ZodEnum<["simple", "moderate", "complex"]>;
        nodeCount: z.ZodNumber;
        style: z.ZodEnum<["creative", "logical", "balanced"]>;
        domain: z.ZodOptional<z.ZodString>;
        userContext: z.ZodOptional<z.ZodString>;
        nodeTypes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            nodeType: z.ZodString;
            weight: z.ZodNumber;
            required: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            required?: boolean;
            nodeType?: string;
            weight?: number;
        }, {
            required?: boolean;
            nodeType?: string;
            weight?: number;
        }>, "many">>;
        specificRequirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        focusAreas: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        provider: z.ZodDefault<z.ZodEnum<["openai", "claude", "gemini"]>>;
        temperature: z.ZodDefault<z.ZodNumber>;
        maxRetries: z.ZodDefault<z.ZodNumber>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
        validateOutput: z.ZodDefault<z.ZodBoolean>;
        enablePreview: z.ZodDefault<z.ZodBoolean>;
        preferredPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        avoidPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        qualityLevel: z.ZodDefault<z.ZodEnum<["draft", "standard", "high"]>>;
        diversityScore: z.ZodDefault<z.ZodNumber>;
        outputFormat: z.ZodDefault<z.ZodEnum<["graph", "serialized", "both"]>>;
        includeExplanation: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        style?: "balanced" | "creative" | "logical";
        purpose?: string;
        complexity?: "simple" | "moderate" | "complex";
        nodeCount?: number;
        domain?: string;
        userContext?: string;
        nodeTypes?: {
            required?: boolean;
            nodeType?: string;
            weight?: number;
        }[];
        specificRequirements?: string[];
        constraints?: string[];
        focusAreas?: string[];
        provider?: "openai" | "claude" | "gemini";
        temperature?: number;
        maxRetries?: number;
        includeMetadata?: boolean;
        validateOutput?: boolean;
        enablePreview?: boolean;
        preferredPatterns?: string[];
        avoidPatterns?: string[];
        qualityLevel?: "high" | "standard" | "draft";
        diversityScore?: number;
        outputFormat?: "both" | "graph" | "serialized";
        includeExplanation?: boolean;
    }, {
        style?: "balanced" | "creative" | "logical";
        purpose?: string;
        complexity?: "simple" | "moderate" | "complex";
        nodeCount?: number;
        domain?: string;
        userContext?: string;
        nodeTypes?: {
            required?: boolean;
            nodeType?: string;
            weight?: number;
        }[];
        specificRequirements?: string[];
        constraints?: string[];
        focusAreas?: string[];
        provider?: "openai" | "claude" | "gemini";
        temperature?: number;
        maxRetries?: number;
        includeMetadata?: boolean;
        validateOutput?: boolean;
        enablePreview?: boolean;
        preferredPatterns?: string[];
        avoidPatterns?: string[];
        qualityLevel?: "high" | "standard" | "draft";
        diversityScore?: number;
        outputFormat?: "both" | "graph" | "serialized";
        includeExplanation?: boolean;
    }>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    description?: string;
    category?: string;
    parameters?: {
        style?: "balanced" | "creative" | "logical";
        purpose?: string;
        complexity?: "simple" | "moderate" | "complex";
        nodeCount?: number;
        domain?: string;
        userContext?: string;
        nodeTypes?: {
            required?: boolean;
            nodeType?: string;
            weight?: number;
        }[];
        specificRequirements?: string[];
        constraints?: string[];
        focusAreas?: string[];
        provider?: "openai" | "claude" | "gemini";
        temperature?: number;
        maxRetries?: number;
        includeMetadata?: boolean;
        validateOutput?: boolean;
        enablePreview?: boolean;
        preferredPatterns?: string[];
        avoidPatterns?: string[];
        qualityLevel?: "high" | "standard" | "draft";
        diversityScore?: number;
        outputFormat?: "both" | "graph" | "serialized";
        includeExplanation?: boolean;
    };
    tags?: string[];
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}, {
    name?: string;
    id?: string;
    description?: string;
    category?: string;
    parameters?: {
        style?: "balanced" | "creative" | "logical";
        purpose?: string;
        complexity?: "simple" | "moderate" | "complex";
        nodeCount?: number;
        domain?: string;
        userContext?: string;
        nodeTypes?: {
            required?: boolean;
            nodeType?: string;
            weight?: number;
        }[];
        specificRequirements?: string[];
        constraints?: string[];
        focusAreas?: string[];
        provider?: "openai" | "claude" | "gemini";
        temperature?: number;
        maxRetries?: number;
        includeMetadata?: boolean;
        validateOutput?: boolean;
        enablePreview?: boolean;
        preferredPatterns?: string[];
        avoidPatterns?: string[];
        qualityLevel?: "high" | "standard" | "draft";
        diversityScore?: number;
        outputFormat?: "both" | "graph" | "serialized";
        includeExplanation?: boolean;
    };
    tags?: string[];
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}>;
export type ParameterPreset = z.infer<typeof ParameterPresetSchema>;
export declare const ValidationResultSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code?: string;
        message?: string;
        field?: string;
    }, {
        code?: string;
        message?: string;
        field?: string;
    }>, "many">;
    warnings: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
        suggestion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        field?: string;
        suggestion?: string;
    }, {
        message?: string;
        field?: string;
        suggestion?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    isValid?: boolean;
    errors?: {
        code?: string;
        message?: string;
        field?: string;
    }[];
    warnings?: {
        message?: string;
        field?: string;
        suggestion?: string;
    }[];
}, {
    isValid?: boolean;
    errors?: {
        code?: string;
        message?: string;
        field?: string;
    }[];
    warnings?: {
        message?: string;
        field?: string;
        suggestion?: string;
    }[];
}>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
/**
 * Parameter validation class
 */
export declare class ParameterValidator {
    /**
     * Validate parameters against schema
     */
    static validate(parameters: Partial<RandomizerParameters>): ValidationResult;
    /**
     * Validate business rules beyond schema
     */
    private static validateBusinessRules;
    /**
     * Get parameter suggestions based on input
     */
    static getSuggestions(parameters: Partial<RandomizerParameters>): {
        nodeCount?: number;
        nodeTypes?: string[];
        temperature?: number;
        focusAreas?: string[];
    };
    /**
     * Suggest appropriate node types based on purpose
     */
    private static suggestNodeTypes;
    /**
     * Suggest focus areas based on domain
     */
    private static suggestFocusAreas;
}
/**
 * Default parameter presets
 */
export declare const defaultPresets: ParameterPreset[];
//# sourceMappingURL=parameter-schema.d.ts.map