import React from 'react';

}
interface WorkflowState {
    id: string;
    name: string;
    color: string;
    icon?: string;
    is_initial: boolean;
    is_final: boolean;
    is_locked: boolean;


}
interface WorkflowStateIndicatorProps {
    state: WorkflowState;
    isLocked?: boolean;
    canEdit?: boolean;
    onStateChange?: () => void;
    compact?: boolean;

export declare const WorkflowStateIndicator: React.FC<WorkflowStateIndicatorProps>;
export declare const WorkflowStateBadge: React.FC<{
    state: WorkflowState;
    size?: 'sm' | 'md' | 'lg'
}
  }>;
export {};
//# sourceMappingURL=WorkflowStateIndicator.d.ts.map