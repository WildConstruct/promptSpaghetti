import { z } from 'zod';
export declare const ComplexityLevel: z.ZodEnum<["simple", "moderate", "complex"]>;
export declare const StylePreference: z.ZodEnum<["creative", "logical", "balanced"]>;
export declare const LLMProvider: z.ZodEnum<["openai", "claude", "gemini"]>;
export declare const NodeTypePreference: z.ZodObject<{
    nodeType: z.ZodString;
    weight: z.ZodNumber;
    required: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    weight: number;
    required: boolean;
    nodeType: string;
}, {
    weight: number;
    nodeType: string;
    required?: boolean | undefined;
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
        weight: number;
        required: boolean;
        nodeType: string;
    }, {
        weight: number;
        nodeType: string;
        required?: boolean | undefined;
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
    constraints: string[];
    includeMetadata: boolean;
    temperature: number;
    maxRetries: number;
    purpose: string;
    complexity: "moderate" | "simple" | "complex";
    nodeCount: number;
    style: "creative" | "logical" | "balanced";
    nodeTypes: {
        weight: number;
        required: boolean;
        nodeType: string;
    }[];
    specificRequirements: string[];
    focusAreas: string[];
    provider: "openai" | "claude" | "gemini";
    validateOutput: boolean;
    enablePreview: boolean;
    preferredPatterns: string[];
    avoidPatterns: string[];
    qualityLevel: "high" | "draft" | "standard";
    diversityScore: number;
    outputFormat: "graph" | "both" | "serialized";
    includeExplanation: boolean;
    domain?: string | undefined;
    userContext?: string | undefined;
}, {
    purpose: string;
    complexity: "moderate" | "simple" | "complex";
    nodeCount: number;
    style: "creative" | "logical" | "balanced";
    constraints?: string[] | undefined;
    includeMetadata?: boolean | undefined;
    temperature?: number | undefined;
    maxRetries?: number | undefined;
    domain?: string | undefined;
    userContext?: string | undefined;
    nodeTypes?: {
        weight: number;
        nodeType: string;
        required?: boolean | undefined;
    }[] | undefined;
    specificRequirements?: string[] | undefined;
    focusAreas?: string[] | undefined;
    provider?: "openai" | "claude" | "gemini" | undefined;
    validateOutput?: boolean | undefined;
    enablePreview?: boolean | undefined;
    preferredPatterns?: string[] | undefined;
    avoidPatterns?: string[] | undefined;
    qualityLevel?: "high" | "draft" | "standard" | undefined;
    diversityScore?: number | undefined;
    outputFormat?: "graph" | "both" | "serialized" | undefined;
    includeExplanation?: boolean | undefined;
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
            weight: number;
            required: boolean;
            nodeType: string;
        }, {
            weight: number;
            nodeType: string;
            required?: boolean | undefined;
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
        constraints: string[];
        includeMetadata: boolean;
        temperature: number;
        maxRetries: number;
        purpose: string;
        complexity: "moderate" | "simple" | "complex";
        nodeCount: number;
        style: "creative" | "logical" | "balanced";
        nodeTypes: {
            weight: number;
            required: boolean;
            nodeType: string;
        }[];
        specificRequirements: string[];
        focusAreas: string[];
        provider: "openai" | "claude" | "gemini";
        validateOutput: boolean;
        enablePreview: boolean;
        preferredPatterns: string[];
        avoidPatterns: string[];
        qualityLevel: "high" | "draft" | "standard";
        diversityScore: number;
        outputFormat: "graph" | "both" | "serialized";
        includeExplanation: boolean;
        domain?: string | undefined;
        userContext?: string | undefined;
    }, {
        purpose: string;
        complexity: "moderate" | "simple" | "complex";
        nodeCount: number;
        style: "creative" | "logical" | "balanced";
        constraints?: string[] | undefined;
        includeMetadata?: boolean | undefined;
        temperature?: number | undefined;
        maxRetries?: number | undefined;
        domain?: string | undefined;
        userContext?: string | undefined;
        nodeTypes?: {
            weight: number;
            nodeType: string;
            required?: boolean | undefined;
        }[] | undefined;
        specificRequirements?: string[] | undefined;
        focusAreas?: string[] | undefined;
        provider?: "openai" | "claude" | "gemini" | undefined;
        validateOutput?: boolean | undefined;
        enablePreview?: boolean | undefined;
        preferredPatterns?: string[] | undefined;
        avoidPatterns?: string[] | undefined;
        qualityLevel?: "high" | "draft" | "standard" | undefined;
        diversityScore?: number | undefined;
        outputFormat?: "graph" | "both" | "serialized" | undefined;
        includeExplanation?: boolean | undefined;
    }>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    parameters: {
        constraints: string[];
        includeMetadata: boolean;
        temperature: number;
        maxRetries: number;
        purpose: string;
        complexity: "moderate" | "simple" | "complex";
        nodeCount: number;
        style: "creative" | "logical" | "balanced";
        nodeTypes: {
            weight: number;
            required: boolean;
            nodeType: string;
        }[];
        specificRequirements: string[];
        focusAreas: string[];
        provider: "openai" | "claude" | "gemini";
        validateOutput: boolean;
        enablePreview: boolean;
        preferredPatterns: string[];
        avoidPatterns: string[];
        qualityLevel: "high" | "draft" | "standard";
        diversityScore: number;
        outputFormat: "graph" | "both" | "serialized";
        includeExplanation: boolean;
        domain?: string | undefined;
        userContext?: string | undefined;
    };
    description: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isDefault: boolean;
}, {
    id: string;
    name: string;
    parameters: {
        purpose: string;
        complexity: "moderate" | "simple" | "complex";
        nodeCount: number;
        style: "creative" | "logical" | "balanced";
        constraints?: string[] | undefined;
        includeMetadata?: boolean | undefined;
        temperature?: number | undefined;
        maxRetries?: number | undefined;
        domain?: string | undefined;
        userContext?: string | undefined;
        nodeTypes?: {
            weight: number;
            nodeType: string;
            required?: boolean | undefined;
        }[] | undefined;
        specificRequirements?: string[] | undefined;
        focusAreas?: string[] | undefined;
        provider?: "openai" | "claude" | "gemini" | undefined;
        validateOutput?: boolean | undefined;
        enablePreview?: boolean | undefined;
        preferredPatterns?: string[] | undefined;
        avoidPatterns?: string[] | undefined;
        qualityLevel?: "high" | "draft" | "standard" | undefined;
        diversityScore?: number | undefined;
        outputFormat?: "graph" | "both" | "serialized" | undefined;
        includeExplanation?: boolean | undefined;
    };
    description: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[] | undefined;
    isDefault?: boolean | undefined;
}>;
export type ParameterPreset = z.infer<typeof ParameterPresetSchema>;
export declare const ValidationResultSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        field: string;
    }, {
        code: string;
        message: string;
        field: string;
    }>, "many">;
    warnings: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
        suggestion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        field: string;
        suggestion?: string | undefined;
    }, {
        message: string;
        field: string;
        suggestion?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    warnings: {
        message: string;
        field: string;
        suggestion?: string | undefined;
    }[];
    errors: {
        code: string;
        message: string;
        field: string;
    }[];
    isValid: boolean;
}, {
    warnings: {
        message: string;
        field: string;
        suggestion?: string | undefined;
    }[];
    errors: {
        code: string;
        message: string;
        field: string;
    }[];
    isValid: boolean;
}>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export declare class ParameterValidator {
    static validate(parameters: Partial<RandomizerParameters>): ValidationResult;
    private static validateBusinessRules;
    static getSuggestions(parameters: Partial<RandomizerParameters>): {
        nodeCount?: number;
        nodeTypes?: string[];
        temperature?: number;
        focusAreas?: string[];
    };
    private static suggestNodeTypes;
    private static suggestFocusAreas;
}
export declare const defaultPresets: ParameterPreset[];
//# sourceMappingURL=parameter-schema.d.ts.map