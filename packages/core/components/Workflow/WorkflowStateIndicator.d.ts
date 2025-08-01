import React from 'react';
import { WorkflowState, WorkflowStateConfig } from '../../types/WorkflowTypes';
}
}
interface WorkflowStateIndicatorProps { state: WorkflowState;
    stateConfig?: WorkflowStateConfig;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;

export declare const WorkflowStateIndicator: React.FC<WorkflowStateIndicatorProps>;
export declare const isCurrent: (stateId: WorkflowState) => boolean }
}
}
interface WorkflowStateHistoryProps { history: Array<{
        state: WorkflowState;
        stateConfig?: WorkflowStateConfig;
        timestamp: string;
        actor?: string;
        comment?: string }
}
    }>;
    className?: string;

export declare const WorkflowStateHistory: React.FC<WorkflowStateHistoryProps>;
export {};
//# sourceMappingURL=WorkflowStateIndicator.d.ts.map