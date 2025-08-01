/**
 * Epic 14 - A/B Testing Framework
 * Core experiment types and interfaces
 */
;
;
;
;
guardrailMetrics: {
    metricId: string;
    passed: boolean;
    threshold: number;
    actualValue: number;
}
[];
previousSalts: {
    salt: string;
    rotatedAt: Date;
}
[];
;
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
