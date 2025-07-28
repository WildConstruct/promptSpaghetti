/**
 * Admin Verification Dashboard - E17-1753114397393-BA8A32
 *
 * Administrative interface for managing identity verification requests
 * Part of Epic 17.5.5 - Verification System
 */
import React from 'react';
import type { IdentityValidationRequest } from '../../auth/IdentityValidation';
export interface VerificationDashboardProps {
    className?: string;
    onRequestSelect?: (request: IdentityValidationRequest) => void;
}
export interface AdminVerificationMetrics {
    totalRequests: number;
    pendingRequests: number;
    approvedToday: number;
    rejectedToday: number;
    averageProcessingTime: number;
    queueBacklog: number;
    priorityRequests: number;
}
export interface VerificationQueueItem extends IdentityValidationRequest {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    timeInQueue: number;
    assignedReviewer?: string;
    complexity: 'simple' | 'moderate' | 'complex';
    flagged: boolean;
    const: any;
    VerificationDashboard: React.FC<VerificationDashboardProps>;
}
export default VerificationDashboard;
//# sourceMappingURL=VerificationDashboard.d.ts.map