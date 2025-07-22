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
    evidence: DisputeEvidence[];
    attachments: DisputeAttachment[];
    communications: DisputeCommunication[];
    outcome?: DisputeOutcome;
    resolution?: DisputeResolution;
    finalAmount?: number;
    enforcementActions?: string[];
    trustImpact?: DisputeTrustImpact;
    policyViolations?: string[];
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
    AUTHORIZATION_DISPUTE = "authorization_dispute"
}
export declare enum DisputeCategory {
    FRAUD = "fraud",
    AUTHORIZATION = "authorization",
    PROCESSING_ERROR = "processing_error",
    CONSUMER_DISPUTE = "consumer_dispute",
    QUALITY_ISSUE = "quality_issue",
    NON_DELIVERY = "non_delivery",
    DUPLICATE_PROCESSING = "duplicate_processing",
    CREDIT_NOT_PROCESSED = "credit_not_processed",
    CANCELLED_RECURRING = "cancelled_recurring",
    PRODUCT_NOT_RECEIVED = "product_not_received"
}
export declare enum DisputeReason {
    UNAUTHORIZED_TRANSACTION = "unauthorized_transaction",
    FRAUDULENT_TRANSACTION = "fraudulent_transaction",
    CARD_NOT_PRESENT = "card_not_present",
    INVALID_AUTHORIZATION = "invalid_authorization",
    EXPIRED_AUTHORIZATION = "expired_authorization",
    DECLINED_AUTHORIZATION = "declined_authorization",
    DUPLICATE_TRANSACTION = "duplicate_transaction",
    INCORRECT_AMOUNT = "incorrect_amount",
    PROCESSING_ERROR = "processing_error",
    PRODUCT_NOT_RECEIVED = "product_not_received",
    PRODUCT_UNACCEPTABLE = "product_unacceptable",
    SUBSCRIPTION_CANCELLED = "subscription_cancelled",
    REFUND_NOT_PROCESSED = "refund_not_processed",
    TEMPLATE_DEFECTIVE = "template_defective",
    DESCRIPTION_MISMATCH = "description_mismatch",
    FUNCTIONALITY_ISSUES = "functionality_issues",
    SECURITY_VULNERABILITIES = "security_vulnerabilities",
    GENERAL_DISPUTE = "general_dispute",
    OTHER = "other"
}
export declare enum DisputeStatus {
    RECEIVED = "received",
    INVESTIGATING = "investigating",
    AWAITING_RESPONSE = "awaiting_response",
    RESPONSE_SUBMITTED = "response_submitted",
    UNDER_REVIEW = "under_review",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    EXPIRED = "expired",
    WITHDRAWN = "withdrawn",
    ESCALATED = "escalated",
    CLOSED = "closed"
}
export declare enum DisputeStage {
    INITIAL_DISPUTE = "initial_dispute",
    EVIDENCE_COLLECTION = "evidence_collection",
    INVESTIGATION = "investigation",
    RESPONSE_PREPARATION = "response_preparation",
    RESPONSE_SUBMISSION = "response_submission",
    REVIEW_PROCESS = "review_process",
    RESOLUTION = "resolution",
    APPEAL_PERIOD = "appeal_period",
    APPEAL_PROCESS = "appeal_process",
    FINAL_RESOLUTION = "final_resolution"
}
export declare enum DisputeSource {
    PAYMENT_PROVIDER = "payment_provider",
    CUSTOMER_REPORT = "customer_report",
    MERCHANT_REPORT = "merchant_report",
    SYSTEM_DETECTION = "system_detection",
    ADMIN_INITIATED = "admin_initiated"
}
export interface DisputeEvidence {
    evidenceId: string;
    type: DisputeEvidenceType;
    title: string;
    description: string;
    content: string;
    attachments: string[];
    submittedBy: string;
    submittedAt: Date;
    relevanceScore: number;
    verified: boolean;
    category: 'transaction' | 'communication' | 'delivery' | 'quality' | 'authorization' | 'other';
}
export declare enum DisputeEvidenceType {
    TRANSACTION_RECEIPT = "transaction_receipt",
    AUTHORIZATION_PROOF = "authorization_proof",
    DELIVERY_CONFIRMATION = "delivery_confirmation",
    COMMUNICATION_LOG = "communication_log",
    REFUND_PROOF = "refund_proof",
    PRODUCT_DESCRIPTION = "product_description",
    CUSTOMER_COMMUNICATION = "customer_communication",
    TECHNICAL_ANALYSIS = "technical_analysis",
    USAGE_LOGS = "usage_logs",
    QUALITY_ASSESSMENT = "quality_assessment",
    POLICY_DOCUMENTATION = "policy_documentation",
    OTHER = "other"
}
export interface DisputeAttachment {
    attachmentId: string;
    filename: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    category: 'evidence' | 'communication' | 'documentation' | 'screenshot';
}
export interface DisputeCommunication {
    communicationId: string;
    type: 'internal_note' | 'customer_message' | 'merchant_message' | 'provider_message' | 'system_notification';
    sender: string;
    recipient?: string;
    subject?: string;
    content: string;
    timestamp: Date;
    attachments: string[];
    isPublic: boolean;
}
export declare enum DisputeOutcome {
    WON = "won",
    LOST = "lost",
    PARTIALLY_WON = "partially_won",
    SETTLED = "settled",
    WITHDRAWN = "withdrawn",
    EXPIRED = "expired"
}
export interface DisputeResolution {
    outcome: DisputeOutcome;
    finalAmount: number;
    adjustedAmount?: number;
    reason: string;
    resolvedBy: string;
    resolvedAt: Date;
    liabilityAmount: number;
    feesAwarded: number;
    notes?: string;
    appealable: boolean;
    appealDeadline?: Date;
}
export interface DisputeTrustImpact {
    buyerImpact: TrustScoreImpact;
    sellerImpact: TrustScoreImpact;
    templateImpact?: TrustScoreImpact;
}
export interface TrustScoreImpact {
    scoreDelta: number;
    factors: string[];
    severity: 'minor' | 'moderate' | 'significant' | 'severe';
    duration: number;
    reversible: boolean;
}
export interface DisputeAppeal {
    appealId: string;
    appealedBy: string;
    appealedAt: Date;
    reason: string;
    evidence: DisputeEvidence[];
    status: 'pending' | 'under_review' | 'accepted' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date;
    outcome?: string;
    notes?: string;
}
export interface DisputeWorkflow {
    workflowId: string;
    disputeId: string;
    currentStage: DisputeStage;
    stages: DisputeWorkflowStage[];
    deadlines: DisputeDeadline[];
    automatedActions: DisputeAutomation[];
    manualReviewRequired: boolean;
    escalationRules: DisputeEscalation[];
}
export interface DisputeWorkflowStage {
    stage: DisputeStage;
    status: 'pending' | 'active' | 'completed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    assignedTo?: string;
    requirements: string[];
    actions: string[];
    dependencies: string[];
}
export interface DisputeDeadline {
    type: 'response' | 'evidence' | 'review' | 'appeal';
    dueDate: Date;
    description: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    automated: boolean;
    notificationSent: boolean;
}
export interface DisputeAutomation {
    actionType: 'evidence_collection' | 'response_generation' | 'status_update' | 'notification' | 'escalation';
    trigger: string;
    conditions: Record<string, any>;
    executed: boolean;
    executedAt?: Date;
    result?: string;
}
export interface DisputeEscalation {
    condition: string;
    escalateTo: string;
    triggered: boolean;
    triggeredAt?: Date;
    reason?: string;
}
export interface DisputeMetrics {
    totalDisputes: number;
    activeDisputes: number;
    winRate: number;
    averageResolutionTime: number;
    totalLiability: number;
    disputesByType: Record<DisputeType, number>;
    disputesByCategory: Record<DisputeCategory, number>;
    disputesByStatus: Record<DisputeStatus, number>;
    monthlyTrends: DisputeMonthlyTrend[];
}
export interface DisputeMonthlyTrend {
    month: string;
    totalDisputes: number;
    winRate: number;
    totalLiability: number;
    averageResolutionTime: number;
}
export interface DisputeAnalytics {
    period: {
        startDate: Date;
        endDate: Date;
    };
    metrics: DisputeMetrics;
    insights: DisputeInsight[];
    recommendations: DisputeRecommendation[];
    generatedAt: Date;
}
export interface DisputeInsight {
    insightId: string;
    type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    actionable: boolean;
    relatedMetrics: string[];
    generatedAt: Date;
}
export interface DisputeRecommendation {
    recommendationId: string;
    category: 'process_improvement' | 'evidence_strategy' | 'response_quality' | 'automation';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: {
        effort: 'low' | 'medium' | 'high';
        timeline: string;
        resources: string[];
    };
    successMetrics: string[];
    generatedAt: Date;
}
export interface DisputeFilter {
    status?: DisputeStatus[];
    type?: DisputeType[];
    category?: DisputeCategory[];
    severity?: string[];
    dateRange?: {
        from: Date;
        to: Date;
    };
    amountRange?: {
        min: number;
        max: number;
    };
    assignedTo?: string;
    source?: DisputeSource[];
}
export interface DisputeSearchCriteria extends DisputeFilter {
    query?: string;
    sortBy?: 'createdAt' | 'amount' | 'dueDate' | 'priority';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface DisputeResponse {
    responseId: string;
    disputeId: string;
    responseType: 'accept' | 'contest' | 'partial_accept';
    argument: string;
    evidence: DisputeEvidence[];
    attachments: DisputeAttachment[];
    preparedBy: string;
    reviewedBy?: string;
    submittedBy?: string;
    submittedAt?: Date;
    status: 'draft' | 'review' | 'approved' | 'submitted';
    outcome?: DisputeOutcome;
    notes?: string;
}
export interface DisputeNotification {
    notificationId: string;
    disputeId: string;
    type: 'status_change' | 'deadline_reminder' | 'evidence_request' | 'resolution' | 'escalation';
    recipient: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    sentAt: Date;
    readAt?: Date;
    actionRequired: boolean;
    actionUrl?: string;
}
//# sourceMappingURL=DisputeTypes.d.ts.map