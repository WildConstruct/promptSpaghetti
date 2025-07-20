import React from 'react';
interface LockBreakingWorkflowProps {
    isOpen: boolean;
    onClose: () => void;
    resourceId: string;
    onBreakLock: (lockId: string, resourceId: string, justification: string) => void;
    userId: string;
}
export declare const LockBreakingWorkflow: React.FC<LockBreakingWorkflowProps>;
export {};
//# sourceMappingURL=LockBreakingWorkflow.d.ts.map