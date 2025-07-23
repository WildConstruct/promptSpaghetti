/**
 * Core types and interfaces for the Prompt Targeting System
 * Epic 10 - Cross-platform prompt translation
 */
import { z } from 'zod';
/**
 * Zod schemas for runtime validation
 */
export const PlatformCapabilitiesSchema = z.object({
    platform: z.string(),
    version: z.string(),
    maxTokens: z.number().optional(),
    supportedAspectRatios: z.array(z.string()).optional(),
    parameterRanges: z.record(z.tuple([z.number(), z.number()])),
    features: z.array(z.string()),
    styleSupport: z.boolean(),
    negativePromptSupport: z.boolean(),
    customParameters: z.record(z.unknown()).optional()
});
export const ValidationResultSchema = z.object({
    valid: z.boolean(),
    errors: z.array(z.object({
        code: z.string(),
        message: z.string(),
        severity: z.enum(['error', 'warning', 'info']),
        source: z.object({
            nodeId: z.string().optional(),
            property: z.string().optional()
        }).optional(),
        suggestion: z.string().optional()
    })),
    warnings: z.array(z.object({
        code: z.string(),
        message: z.string(),
        source: z.object({
            nodeId: z.string().optional(),
            property: z.string().optional()
        }).optional(),
        optimization: z.string().optional()
    })),
    compatibilityScore: z.number().min(0).max(1)
});
export const PlatformPromptSchema = z.object({
    platform: z.string(),
    prompt: z.string(),
    negativePrompt: z.string().optional(),
    parameters: z.record(z.unknown()),
    metadata: z.object({
        sourceHash: z.string(),
        timestamp: z.date(),
        qualityScore: z.number().min(0).max(1),
        optimizations: z.array(z.string())
    })
});
export const AdaptorConfigSchema = z.object({
    qualityPreference: z.number().min(0).max(1).optional(),
    stylePreference: z.enum(['default', 'artistic', 'photorealistic', 'minimal']).optional(),
    platformOverrides: z.record(z.unknown()).optional(),
    enableOptimizations: z.boolean().optional(),
    customMappings: z.record(z.unknown()).optional()
});
/**
 * Error classes for prompt targeting system
 */
export class PromptTargetingError extends Error {
    code;
    platform;
    details;
    constructor(message, code, platform, details) {
        super(message);
        this.code = code;
        this.platform = platform;
        this.details = details;
        this.name = 'PromptTargetingError';
    }
}
export class AdaptorError extends PromptTargetingError {
    adaptorId;
    constructor(message, adaptorId, code = 'ADAPTOR_ERROR', details) {
        super(message, code, undefined, details);
        this.adaptorId = adaptorId;
        this.name = 'AdaptorError';
    }
}
export class ValidationError extends PromptTargetingError {
    validationErrors;
    constructor(message, validationErrors, code = 'VALIDATION_ERROR') {
        super(message, code);
        this.validationErrors = validationErrors;
        this.name = 'ValidationError';
    }
}
export class TranslationError extends PromptTargetingError {
    constructor(message, platform, code = 'TRANSLATION_ERROR', details) {
        super(message, code, platform, details);
        this.name = 'TranslationError';
    }
}
//# sourceMappingURL=index.js.map