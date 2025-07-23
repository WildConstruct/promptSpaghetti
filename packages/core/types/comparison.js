// TypeScript types for visual diff and comparison system
// Story 9.3.2 - Visual Diff Tool
// Error types
export class ComparisonError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ComparisonError';
    }
}
export class DiffSessionError extends Error {
    code;
    sessionId;
    constructor(message, code, sessionId) {
        super(message);
        this.code = code;
        this.sessionId = sessionId;
        this.name = 'DiffSessionError';
    }
}
