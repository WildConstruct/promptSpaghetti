import { z } from 'zod';
export declare const ComplexityLevel: z.ZodEnum<["simple", "moderate", "complex"]>;
export declare const StylePreference: z.ZodEnum<["creative", "logical", "balanced"]>;
export declare const LLMProvider: z.ZodEnum<["openai", "claude", "gemini"]>;
export declare const NodeTypePreference: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const RandomizerParametersSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RandomizerParameters = z.infer<typeof RandomizerParametersSchema>;
export declare const ParameterPresetSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ParameterPreset = z.infer<typeof ParameterPresetSchema>;
export declare const ValidationResultSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
    suggestion: `Consider ${range.min}-${range.max} nodes for ${parameters.complexity} complexity`;
}
//# sourceMappingURL=parameter-schema.d.ts.map