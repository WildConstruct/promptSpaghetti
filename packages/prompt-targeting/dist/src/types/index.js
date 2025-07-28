/**
 * Core types and interfaces for the Prompt Targeting System
 * Epic 10 - Cross-platform prompt translation
 */
/**
 * Zod schemas for runtime validation
 */
export export export export 
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
export class ValidationException extends PromptTargetingError {
    validationErrors;
    constructor(message, validationErrors, code = 'VALIDATION_ERROR') {
        super(message, code);
        this.validationErrors = validationErrors;
        this.name = 'ValidationException';
    }
}
export class TranslationError extends PromptTargetingError {
    constructor(message, platform, code = 'TRANSLATION_ERROR', details) {
        super(message, code, platform, details);
        this.name = 'TranslationError';
    }
}
//# sourceMappingURL=index.js.map