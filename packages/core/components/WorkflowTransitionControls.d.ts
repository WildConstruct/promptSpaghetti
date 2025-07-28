import React from 'react';

interface WorkflowTransitionControlsProps {
    resourceId: string;
    currentStateId: string;
    currentUserId: string;
    workspaceId: string;
    onTransitionComplete?: (newStateId: string) => void;
    onApprovalRequested?: (approvalId: string) => void;
    disabled?: boolean;

export declare const WorkflowTransitionControls: React.FC<WorkflowTransitionControlsProps>;
export {};
//# sourceMappingURL=WorkflowTransitionControls.d.ts.map