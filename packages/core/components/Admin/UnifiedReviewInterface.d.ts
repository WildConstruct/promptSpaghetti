/**
 * Unified Review Interface - E17-1753114397293-31FD2B
 *
 * Comprehensive review interface that consolidates all review workflows
 * Part of Epic 17.5.1 - Review Workflow (Backstage Admin Controls)
 */
import React from 'react';

}
export interface ReviewItem {
    id: string;
    type: 'template_submission' | 'verification_request' | 'policy_violation' | 'content_appeal' | 'marketplace_listing';
    title: string;
    description?: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    submitter: {
        id: string;
        name: string;
        email: string;
        avatar_url?: string;
        tier: string;
        reputation_score?: number;
}
    };
    created_at: Date;
    updated_at: Date;
    submitted_at?: Date;
    assigned_reviewer?: string;
    estimated_review_time?: number;
    template_data?: {
        template_id: string;
        version: number;
        categories: string[];
        tags: string[];
        price_cents: number;
        graph_json: unknown;
        validation_results: ValidationResult[];
        previous_reviews?: ReviewFeedback[];
    };
    verification_data?: {
        request_type: 'identity' | 'business' | 'creator';
        documents: DocumentData[];
        verification_criteria: VerificationCriterion[];
        previous_attempts?: number;
    };
    violation_data?: {
        policy_id: string;
        violation_type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        evidence: Evidence[];
        automated_detection: boolean;
        affected_content?: string[];
    };
    appeal_data?: {
        original_decision_id: string;
        appeal_reason: string;
        supporting_evidence: Evidence[];
        original_reviewer: string;
        appeal_deadline: Date;
    };

}
export interface ValidationResult {
    rule_id: string;
    severity: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    field?: string;
    auto_fixable: boolean;
    suggestions?: string[];

}
export interface ReviewFeedback {
    category: 'content' | 'quality' | 'compliance' | 'usability' | 'technical';
    rating: number;
    comments: string;
    suggestions: string[];
    is_blocking: boolean;

}
export interface DocumentData {
    id: string;
    type: 'image' | 'pdf' | 'document' | 'video' | 'audio';
    fileName: string;
    fileSize: number;
    url: string;
    thumbnailUrl?: string;
    metadata?: {
        dimensions?: {
            width: number;
            height: number;
}
        };
        duration?: number;
        quality?: 'low' | 'medium' | 'high'
  };

}
export interface VerificationCriterion {
    id: string;
    name: string;
    description: string;
    required: boolean;
    type: 'document_check' | 'identity_match' | 'address_verification' | 'business_validation';
    status: 'pending' | 'passed' | 'failed' | 'manual_review';
    automated_result?: unknown;
    manual_override?: boolean;

}
export interface Evidence {
    id: string;
    type: 'screenshot' | 'log' | 'report' | 'document';
    url: string;
    description: string;
    timestamp: Date;
    confidence_score?: number;

}
export interface ReviewDecision {
    decision: 'approved' | 'rejected' | 'changes_requested';
    overall_score: number;
    feedback: ReviewFeedback[];
    public_comments: string;
    private_notes: string;
    follow_up_required: boolean;
    follow_up_date?: Date;
    conditional_approval?: {
        conditions: string[];
        deadline: Date;
}
    };

}
export interface UnifiedReviewInterfaceProps {
    reviewItem: ReviewItem;
    onDecision: (decision: ReviewDecision) => void;
    onSaveDraft: (decision: Partial<ReviewDecision>) => void;
    onBack: () => void;
    reviewerPermissions: string[];
    className?: string;
declare const UnifiedReviewInterface: React.FC<UnifiedReviewInterfaceProps>;
export default UnifiedReviewInterface;
//# sourceMappingURL=UnifiedReviewInterface.d.ts.map
}