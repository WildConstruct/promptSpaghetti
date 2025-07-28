/**
 * Verification Queue Interface - E17-1753114397393-BA8A32
 *
 * Detailed admin review workflow for verification requests
 * Part of Epic 17.5.5 - Verification System
 */
import React from 'react';
import type { IdentityValidationRequest, ValidationStatus } from '../../auth/IdentityValidation';

export interface VerificationQueueProps {
    request: IdentityValidationRequest;
    onBack: () => void;
    onStatusUpdate: (requestId: string, status: ValidationStatus, notes?: string) => void;
    onRequestUpdate?: (requestId: string, updates: Partial<IdentityValidationRequest>) => void;
    className?: string;


export interface ReviewDecision {
    status: ValidationStatus;
    reviewNotes: string;
    nextSteps: string[];
    flagged: boolean;
    requiresSeniorReview: boolean;
    confidenceLevel: number;

export declare const VerificationQueue: React.FC<VerificationQueueProps>;
export default VerificationQueue;
//# sourceMappingURL=VerificationQueue.d.ts.map