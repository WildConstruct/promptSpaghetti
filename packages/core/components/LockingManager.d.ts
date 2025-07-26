import React from 'react';
interface LockingManagerProps {
    workspaceId: string;
    userId: string;
    onLockStateChange?: (resourceId: string, isLocked: boolean) => void;
}
export declare const LockingManager: React.FC<LockingManagerProps>;
export {};
//# sourceMappingURL=LockingManager.d.ts.map