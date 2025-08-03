/**
 * Epic 14 - A/B Testing Framework
 * Core experiment types and interfaces
 */
;
identifiers: string;
reason: string;
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
title: string;
description: string;
severity: 'low' | 'medium' | 'high';
actionable: boolean;
recommendations ?  : string;
data ?  : Record;
previousSalts: {
    salt: string;
    rotatedAt: Date;
}
[];
;
// Error types
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
super(message);
this.name = 'AllocationError';
