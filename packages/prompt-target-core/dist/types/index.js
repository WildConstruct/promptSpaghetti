// Core type definitions for the prompt targeting system
// Error Types
export class PromptTargetingError extends Error {
    constructor(message, code, details, recoverable = false) {
        super(message);
        this.code = code;
        this.details = details;
        this.recoverable = recoverable;
        this.name = 'PromptTargetingError';
    }
}
export class ValidationError extends PromptTargetingError {
    constructor(message, validationResults) {
        super(message, 'VALIDATION_ERROR', { validationResults }, false);
        this.validationResults = validationResults;
        this.name = 'ValidationError';
    }
}
export class TransformationError extends PromptTargetingError {
    constructor(message, nodeId, step) {
        super(message, 'TRANSFORMATION_ERROR', { nodeId, step }, true);
        this.nodeId = nodeId;
        this.step = step;
        this.name = 'TransformationError';
    }
}
export class AdaptorError extends PromptTargetingError {
    constructor(message, adaptorId) {
        super(message, 'ADAPTOR_ERROR', { adaptorId }, true);
        this.adaptorId = adaptorId;
        this.name = 'AdaptorError';
    }
}
export class TranslationError extends PromptTargetingError {
    constructor(message, code, details, recoverable = true) {
        super(message, code, details, recoverable);
        this.name = 'TranslationError';
    }
}
