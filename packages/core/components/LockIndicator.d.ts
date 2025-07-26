import React from 'react';
import { WorkflowLock } from '../types/locking';
interface LockIndicatorProps {
    lock: WorkflowLock;
    size?: 'small' | 'medium' | 'large';
    showTooltip?: boolean;
    className?: string;
}
export declare const LockIndicator: React.FC<LockIndicatorProps>;
interface ResourceLockStatusProps {
    resourceId: string;
    locks: WorkflowLock[];
    className?: string;
}
export declare const ResourceLockStatus: React.FC<ResourceLockStatusProps>;
interface LockTypeBadgeProps {
    lockType: string;
    size?: 'small' | 'medium';
    className?: string;
}
export declare const LockTypeBadge: React.FC<LockTypeBadgeProps>;
export {};
//# sourceMappingURL=LockIndicator.d.ts.map