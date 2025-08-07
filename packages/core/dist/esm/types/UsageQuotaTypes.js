/**
 * Usage Quota System Types - Epic 17
 *
 * Comprehensive type definitions for usage quota management system as part of
 * Epic 17 Backstage Admin Controls. Provides quota tracking, enforcement, and
 * administrative oversight for resource usage across the platform.
 *
 * Task: E17-1753114397228-B591AA - Create usage quotas
 * Epic: 17 - Backstage Admin Controls
 */
value: any;
required: boolean;
pattern: number;
confidence: number;
description: string;
targetId: string;
// Operation details
adminUserId: string;
timestamp: Date;
reason: string;
// Operation parameters
parameters: Record;
// Approval workflow
requiresApproval: boolean;
approvalStatus ?  : 'pending' | 'approved' | 'denied';
approvedBy ?  : string;
approvedAt ?  : Date;
// Execution tracking
status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
result ?  : OperationResult;
error ?  : string;
export {};
