/**
 * Classification-Based Access Control Service
 *
 * Implements access control policies based on data classification levels.
 * Enforces handling requirements and ensures compliance with security policies.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel,
  AccessRequirements,
  OperationContext,
  ClassificationAuditEvent }
  ValidationResult
} from '../types/DataClassification';

}
}
export interface AccessControlPolicy { id: string;
    name: string;
    description: string;
    classification: DataClassificationLevel;
    requirements: AccessRequirements;
    created: Date;
    lastModified: Date;
    version: string }
}
}
export interface AccessRequest { userId: string;
    dataId: string;
    classification: DataClassificationLevel;
    operation: 'read' | 'write' | 'update' | 'delete' | 'export' | 'share';
    purpose: string;
    context: OperationContext;
    requestedAt: Date }
}
}
export interface AccessDecision { granted: boolean;
    reason: string;
    conditions: AccessCondition[];
    expiresAt?: Date;
    auditRequired: boolean;
    monitoringLevel: 'STANDARD' | 'ENHANCED' | 'REALTIME' }
}
}
export interface AccessCondition { type: 'TIME_RESTRICTION' | 'PURPOSE_LIMITATION' | 'APPROVAL_REQUIRED' | 'AUDIT_LOGGING' | 'EXPORT_RESTRICTED';
    description: string;
    parameters: Record<string, any>;
    mandatory: boolean }
}
}
export interface UserAccessProfile { userId: string;
    roles: string[];
    clearanceLevel: DataClassificationLevel;
    permissions: string[];
    restrictions: AccessRestriction[];
    mfaVerified: boolean;
    lastAuthenticationAt: Date;
    authenticationLevel: 'STANDARD' | 'MFA' | 'STRONG_MFA' | 'BIOMETRIC' }
}
}
export interface AccessRestriction {
    type: 'TIME_BASED' | 'IP_BASED' | 'DEVICE_BASED' | 'PURPOSE_BASED';
    description: string;
    configuration: Record<string, any>;
    active: boolean;
    expiresAt?: Date;

export declare class ClassificationAccessControlService {
    private policies;
    private auditEvents;
    private userProfiles;
    constructor();
    /**
     * Initialize default access control policies for each classification level
     */
    private initializeDefaultPolicies;
    /**
     * Evaluate access request and return access decision
     */
    evaluateAccess(request: AccessRequest): Promise<AccessDecision>;
    /**
     * Check if user has sufficient clearance for the classification level
     */
    private hasSufficientClearance;
    /**
     * Check if user has required authentication level
     */
    private hasRequiredAuthentication;
    /**
     * Generate access conditions based on policy requirements
     */
    private generateAccessConditions;
    /**
     * Check if request has pre-approval for workflow requirements
     */
    private hasPreapproval;
    /**
     * Calculate access expiration time based on requirements
     */
    private calculateExpirationTime;
    /**
     * Get monitoring level based on classification
     */
    private getMonitoringLevel;
    /**
     * Audit access attempt
     */
    private auditAccessAttempt;
    /**
     * Register user access profile
     */
    registerUserProfile(profile: UserAccessProfile): Promise<void>;
    /**
     * Update user clearance level
     */
    updateUserClearance(userId: string, clearanceLevel: DataClassificationLevel): Promise<ValidationResult>;
    /**
     * Get access policy for classification level
     */
    getAccessPolicy(classification: DataClassificationLevel): AccessControlPolicy | undefined;
    /**
     * Update access policy
     */
    updateAccessPolicy(classification: DataClassificationLevel, updates: Partial<AccessControlPolicy>): Promise<void>;
    /**
     * Get audit events for a user or data element
     */
    getAuditEvents(userId?: string, dataId?: string): ClassificationAuditEvent[];
    /**
     * Validate access conditions are met
     */
    validateAccessConditions(conditions: AccessCondition[], context: OperationContext): Promise<ValidationResult>;
    /**
     * Validate time restriction condition
     */
    private validateTimeRestriction;
    /**
     * Validate purpose restriction condition
     */
    private validatePurposeRestriction;
    /**
     * Increment policy version
     */
    private incrementVersion;

export default ClassificationAccessControlService;
//# sourceMappingURL=ClassificationAccessControlService.d.ts.map
}
}