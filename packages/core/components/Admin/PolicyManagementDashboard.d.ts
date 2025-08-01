/**
 * Policy Management Dashboard - E17-1753114397363-F12F4D
 *
 * Administrative interface for marketplace policy management
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React from 'react';

}
}
export interface PolicyData { id: string;
    name: string;
    type: 'trust_score' | 'fraud_detection' | 'content_quality' | 'user_behavior' | 'transaction_monitoring';
    status: 'active' | 'inactive' | 'draft' | 'suspended';
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    violationsCount: number;
    lastTriggered?: Date;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    description: string;
    version: string;
    createdBy: string;
    updatedAt: Date }
}
}
export interface PolicyViolationData { violationId: string;
    policyId: string;
    policyName: string;
    entityType: 'user' | 'template' | 'transaction';
    entityId: string;
    violationType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detectedAt: Date;
    status: 'pending' | 'reviewed' | 'dismissed' | 'enforced';
    reviewedBy?: string;
    description: string }
}
}
export interface PolicyManagementDashboardProps {
    className?: string;

export declare const PolicyManagementDashboard: React.FC<PolicyManagementDashboardProps>;
export default PolicyManagementDashboard;
//# sourceMappingURL=PolicyManagementDashboard.d.ts.map
}
}