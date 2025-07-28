/**
 * Epic 14 - A/B Testing Framework
 * Core experiment types and interfaces
 */
export class ExperimentError extends Error {
    message;
    code;
    experimentId;
    details;
}
this.name = 'ExperimentError';
export class AllocationError extends Error {
    message;
    code;
    userId;
    experimentId;
}
this.name = 'AllocationError';
