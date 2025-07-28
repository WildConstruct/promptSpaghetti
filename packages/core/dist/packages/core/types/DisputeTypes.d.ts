/**
 * Dispute System Types - Epic 17.5.3
 *
 * Type definitions for the marketplace dispute handling system.
 * Integrates with existing transaction, enforcement, and trust systems.
 *
 * Task: E17-1753114397361-D755AD - Implement dispute handling
 * Epic: 17 - Backstage Admin Controls
 */
export interface Dispute {
    disputeId: string;
    transactionId: string;
    buyerId: string;
    sellerId: string;
    templateId?: string;
    type: DisputeType;
    category: DisputeCategory;
    reason: DisputeReason;
    severity: 'low' | 'medium' | 'high' | 'critical';
    amount: number;
    currency: string;
    description: string;
    customerClaim: string;
    merchantResponse?: string;
    status: DisputeStatus;
    stage: DisputeStage;
    dueDate?: Date;
    responseDeadline?: Date;
    evidence: DisputeEvidence;
    attachments: DisputeAttachment;
    communications: DisputeCommunication;
    outcome?: DisputeOutcome;
    resolution?: DisputeResolution;
    finalAmount?: number;
    enforcementActions?: string;
    trustImpact?: DisputeTrustImpact;
    policyViolations?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    createdBy: string;
    assignedTo?: string;
    source: DisputeSource;
    paymentProvider?: string;
    providerDisputeId?: string;
    liabilityShift?: boolean;
    appealable: boolean;
    appealDeadline?: Date;
    appeal?: DisputeAppeal;
}
export declare enum DisputeType {
    CHARGEBACK = "chargeback",
    RETRIEVAL_REQUEST = "retrieval_request",
    PRE_ARBITRATION = "pre_arbitration",
    ARBITRATION = "arbitration",
    MERCHANT_DISPUTE = "merchant_dispute",
    QUALITY_DISPUTE = "quality_dispute",
    FRAUD_DISPUTE = "fraud_dispute",
    AUTHORIZATION_DISPUTE = "authorization_dispute",
    export,
    enum,
    DisputeCategory
}
//# sourceMappingURL=DisputeTypes.d.ts.map