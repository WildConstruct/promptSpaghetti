import React from 'react';
interface ApprovalRequest {
    id: string;
    workspace_id: string;
    resource_id: string;
    transition_id: string;
    requester_id: string;
    title: string;
    description?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    business_justification?: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    requested_at: Date;
    due_date?: Date;
    current_approvals: number;
    required_approvals: number;
    approval_percentage: number;
}
interface ApprovalReviewInterfaceProps {
    request: ApprovalRequest;
    workspaceId: string;
    currentUserId: string;
    onReviewSubmit: (),
      decision: 'approve' | 'reject' | 'abstain',
      comment?: string,
      criteriaEvaluations?: Record<string,
      any>
    ) => void;
    onClose: () => void;
    readOnly?: boolean;
}
export declare const ApprovalReviewInterface: React.FC<ApprovalReviewInterfaceProps>;
export {};
//# sourceMappingURL=ApprovalReviewInterface.d.ts.map