/**
 * Dispute System Types - Epic 17.5.3
 *
 * Type definitions for the marketplace dispute handling system.
 * Integrates with existing transaction, enforcement, and trust systems.
 *
 * Task: E17-1753114397361-D755AD - Implement dispute handling
 * Epic: 17 - Backstage Admin Controls
 */
export var DisputeType;
(function (DisputeType) {
    DisputeType["CHARGEBACK"] = "chargeback";
    DisputeType["RETRIEVAL_REQUEST"] = "retrieval_request";
    DisputeType["PRE_ARBITRATION"] = "pre_arbitration";
    DisputeType["ARBITRATION"] = "arbitration";
    DisputeType["MERCHANT_DISPUTE"] = "merchant_dispute";
    DisputeType["QUALITY_DISPUTE"] = "quality_dispute";
    DisputeType["FRAUD_DISPUTE"] = "fraud_dispute";
    DisputeType["AUTHORIZATION_DISPUTE"] = "authorization_dispute";
    DisputeType[DisputeType["export"] = void 0] = "export";
    DisputeType[DisputeType["enum"] = void 0] = "enum";
    DisputeType[DisputeType["DisputeCategory"] = void 0] = "DisputeCategory";
})(DisputeType || (DisputeType = {}));
{
    FRAUD = 'fraud',
        AUTHORIZATION = 'authorization',
        PROCESSING_ERROR = 'processing_error',
        CONSUMER_DISPUTE = 'consumer_dispute',
        QUALITY_ISSUE = 'quality_issue',
        NON_DELIVERY = 'non_delivery',
        DUPLICATE_PROCESSING = 'duplicate_processing',
        CREDIT_NOT_PROCESSED = 'credit_not_processed',
        CANCELLED_RECURRING = 'cancelled_recurring',
        PRODUCT_NOT_RECEIVED = 'product_not_received';
    export let DisputeReason;
    (function (DisputeReason) {
        // Fraud-related
        DisputeReason["UNAUTHORIZED_TRANSACTION"] = "unauthorized_transaction";
        DisputeReason["FRAUDULENT_TRANSACTION"] = "fraudulent_transaction";
        DisputeReason["CARD_NOT_PRESENT"] = "card_not_present";
        // Authorization-related
        DisputeReason["INVALID_AUTHORIZATION"] = "invalid_authorization";
        DisputeReason["EXPIRED_AUTHORIZATION"] = "expired_authorization";
        DisputeReason["DECLINED_AUTHORIZATION"] = "declined_authorization";
        // Processing errors
        DisputeReason["DUPLICATE_TRANSACTION"] = "duplicate_transaction";
        DisputeReason["INCORRECT_AMOUNT"] = "incorrect_amount";
        DisputeReason["PROCESSING_ERROR"] = "processing_error";
        // Consumer disputes
        DisputeReason["PRODUCT_NOT_RECEIVED"] = "product_not_received";
        DisputeReason["PRODUCT_UNACCEPTABLE"] = "product_unacceptable";
        DisputeReason["SUBSCRIPTION_CANCELLED"] = "subscription_cancelled";
        DisputeReason["REFUND_NOT_PROCESSED"] = "refund_not_processed";
        // Quality issues
        DisputeReason["TEMPLATE_DEFECTIVE"] = "template_defective";
        DisputeReason["DESCRIPTION_MISMATCH"] = "description_mismatch";
        DisputeReason["FUNCTIONALITY_ISSUES"] = "functionality_issues";
        DisputeReason["SECURITY_VULNERABILITIES"] = "security_vulnerabilities";
        // General
        DisputeReason["GENERAL_DISPUTE"] = "general_dispute";
        DisputeReason["OTHER"] = "other";
        DisputeReason[DisputeReason["export"] = void 0] = "export";
        DisputeReason[DisputeReason["enum"] = void 0] = "enum";
        DisputeReason[DisputeReason["DisputeStatus"] = void 0] = "DisputeStatus";
    })(DisputeReason || (DisputeReason = {}));
    {
        RECEIVED = 'received',
            INVESTIGATING = 'investigating',
            AWAITING_RESPONSE = 'awaiting_response',
            RESPONSE_SUBMITTED = 'response_submitted',
            UNDER_REVIEW = 'under_review',
            ACCEPTED = 'accepted',
            REJECTED = 'rejected',
            EXPIRED = 'expired',
            WITHDRAWN = 'withdrawn',
            ESCALATED = 'escalated',
            CLOSED = 'closed';
        export let DisputeStage;
        (function (DisputeStage) {
            DisputeStage["INITIAL_DISPUTE"] = "initial_dispute";
            DisputeStage["EVIDENCE_COLLECTION"] = "evidence_collection";
            DisputeStage["INVESTIGATION"] = "investigation";
            DisputeStage["RESPONSE_PREPARATION"] = "response_preparation";
            DisputeStage["RESPONSE_SUBMISSION"] = "response_submission";
            DisputeStage["REVIEW_PROCESS"] = "review_process";
            DisputeStage["RESOLUTION"] = "resolution";
            DisputeStage["APPEAL_PERIOD"] = "appeal_period";
            DisputeStage["APPEAL_PROCESS"] = "appeal_process";
            DisputeStage["FINAL_RESOLUTION"] = "final_resolution";
            DisputeStage[DisputeStage["export"] = void 0] = "export";
            DisputeStage[DisputeStage["enum"] = void 0] = "enum";
            DisputeStage[DisputeStage["DisputeSource"] = void 0] = "DisputeSource";
        })(DisputeStage || (DisputeStage = {}));
        {
            PAYMENT_PROVIDER = 'payment_provider',
                CUSTOMER_REPORT = 'customer_report',
                MERCHANT_REPORT = 'merchant_report',
                SYSTEM_DETECTION = 'system_detection',
                ADMIN_INITIATED = 'admin_initiated';
            export let DisputeEvidenceType;
            (function (DisputeEvidenceType) {
                DisputeEvidenceType["TRANSACTION_RECEIPT"] = "transaction_receipt";
                DisputeEvidenceType["AUTHORIZATION_PROOF"] = "authorization_proof";
                DisputeEvidenceType["DELIVERY_CONFIRMATION"] = "delivery_confirmation";
                DisputeEvidenceType["COMMUNICATION_LOG"] = "communication_log";
                DisputeEvidenceType["REFUND_PROOF"] = "refund_proof";
                DisputeEvidenceType["PRODUCT_DESCRIPTION"] = "product_description";
                DisputeEvidenceType["CUSTOMER_COMMUNICATION"] = "customer_communication";
                DisputeEvidenceType["TECHNICAL_ANALYSIS"] = "technical_analysis";
                DisputeEvidenceType["USAGE_LOGS"] = "usage_logs";
                DisputeEvidenceType["QUALITY_ASSESSMENT"] = "quality_assessment";
                DisputeEvidenceType["POLICY_DOCUMENTATION"] = "policy_documentation";
                DisputeEvidenceType["OTHER"] = "other";
                DisputeEvidenceType[DisputeEvidenceType["export"] = void 0] = "export";
                DisputeEvidenceType[DisputeEvidenceType["interface"] = void 0] = "interface";
                DisputeEvidenceType[DisputeEvidenceType["DisputeAttachment"] = void 0] = "DisputeAttachment";
            })(DisputeEvidenceType || (DisputeEvidenceType = {}));
            {
                attachmentId: string;
                filename: string;
                fileType: string;
                fileSize: number;
                url: string;
                uploadedBy: string;
                uploadedAt: Date;
                category: 'evidence' | 'communication' | 'documentation' | 'screenshot';
            }
            export let DisputeOutcome;
            (function (DisputeOutcome) {
                DisputeOutcome["WON"] = "won";
                DisputeOutcome["LOST"] = "lost";
                DisputeOutcome["PARTIALLY_WON"] = "partially_won";
                DisputeOutcome["SETTLED"] = "settled";
                DisputeOutcome["WITHDRAWN"] = "withdrawn";
                DisputeOutcome["EXPIRED"] = "expired";
                DisputeOutcome[DisputeOutcome["export"] = void 0] = "export";
                DisputeOutcome[DisputeOutcome["interface"] = void 0] = "interface";
                DisputeOutcome[DisputeOutcome["DisputeResolution"] = void 0] = "DisputeResolution";
            })(DisputeOutcome || (DisputeOutcome = {}));
            {
                outcome: DisputeOutcome;
                finalAmount: number;
                adjustedAmount ?  : number;
                reason: string;
                resolvedBy: string;
                resolvedAt: Date;
                liabilityAmount: number;
                feesAwarded: number;
                notes ?  : string;
                appealable: boolean;
                appealDeadline ?  : Date;
            }
        }
    }
}
