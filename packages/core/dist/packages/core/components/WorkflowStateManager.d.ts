import React from 'react';
interface WorkflowStateManagerProps {
    workspaceId: string;
    resourceId?: string;
    currentUserId: string;
    onStateChange?: (newStateId: string) => void;
    onLockAcquired?: (lockId: string) => void;
    onLockReleased?: (lockId: string) => void;
}
export declare const WorkflowStateManager: React.FC<WorkflowStateManagerProps>;
export {};
//# sourceMappingURL=WorkflowStateManager.d.ts.map