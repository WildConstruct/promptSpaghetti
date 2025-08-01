/**
 * Policy Enforcement Workflow - E17-1753114397363-F12F4D
 *
 * Integration system for policy enforcement workflows
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React from 'react';

}
}
export interface EnforcementAction { id: string;
    type: 'suspend_user' | 'restrict_access' | 'hide_template' | 'block_transaction' | 'send_warning' | 'require_verification';
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    automated: boolean;
    requiresApproval: boolean;
    reversible: boolean }
}
}
export interface EnforcementWorkflow { workflowId: string;
    name: string;
    description: string;
    policyId: string;
    policyName: string;
    trigger: {
        type: 'violation_detected' | 'manual_trigger' | 'scheduled_check';
        conditions: string[] }
}
    };
    steps: EnforcementStep[];
    status: 'active' | 'paused' | 'disabled';
    executionCount: number;
    lastExecuted?: Date;
    successRate: number;

}
}
export interface EnforcementStep { stepId: string;
    name: string;
    type: 'condition_check' | 'enforcement_action' | 'notification' | 'human_review' | 'data_collection';
    config: {
        action?: EnforcementAction;
        approvers?: string[];
        timeout?: number;
        retryPolicy?: 'none' | 'linear' | 'exponential';
        notificationChannels?: ('email' | 'sms' | 'in_app' | 'webhook')[] }
}
    };
    order: number;
    enabled: boolean;

}
}
export interface WorkflowExecution { executionId: string;
    workflowId: string;
    workflowName: string;
    triggeredBy: string;
    triggeredAt: Date;
    status: 'running' | 'completed' | 'failed' | 'cancelled' | 'pending_approval';
    currentStep: number;
    totalSteps: number;
    entityType: 'user' | 'template' | 'transaction';
    entityId: string;
    context: Record<string, any> }
}
}
export interface PolicyEnforcementWorkflowProps {
    className?: string;

export declare const PolicyEnforcementWorkflow: React.FC<PolicyEnforcementWorkflowProps>;
export default PolicyEnforcementWorkflow;
//# sourceMappingURL=PolicyEnforcementWorkflow.d.ts.map
}
}