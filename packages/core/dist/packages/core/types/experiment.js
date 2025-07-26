/**
 * Epic 14 - A/B Testing Framework
 * Core experiment types and interfaces
 */
// Error types
export class ExperimentError extends Error {
    code;
    experimentId;
    details;
    constructor(message, code, experimentId, details) {
        super(message);
        this.code = code;
        this.experimentId = experimentId;
        this.details = details;
        this.name = 'ExperimentError';
    }
}
export class AllocationError extends Error {
    code;
    userId;
    experimentId;
    constructor(message, code, userId, experimentId) {
        super(message);
        this.code = code;
        this.userId = userId;
        this.experimentId = experimentId;
        this.name = 'AllocationError';
    }
}
