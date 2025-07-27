import React from 'react';
import { WorkflowState, WorkflowStateConfig } from '../../types/WorkflowTypes';
interface WorkflowStateIndicatorProps {
    state: WorkflowState;
    stateConfig?: WorkflowStateConfig;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare const WorkflowStateIndicator: React.FC<WorkflowStateIndicatorProps>;
export declare const isCurrent: (stateId: WorkflowState) => boolean;
export {};
//# sourceMappingURL=WorkflowStateIndicator.d.ts.map