/**
 * Data Classification Access Control Engine
 *
 * Implements the access control engine that evaluates RBAC and ABAC policies
 * for data classification-aware access control decisions.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { AccessRequest,
  AccessDecision,
  AccessDecisionEngine,
  RBACDecision,
  ABACDecision,
  RBACModel,
  ABACModel }
  ClassificationAccessPolicy
} from './DataClassificationAccessControl';
export declare class DataClassificationAccessControlEngine implements AccessDecisionEngine {
    private rbacModel;
    private abacModel;
    private classificationPolicies;
    private roleCache;
    private permissionCache;
    private policyCache;
    private decisionCache;
    constructor(rbacModel: RBACModel, abacModel: ABACModel, classificationPolicies: ClassificationAccessPolicy[]);
    /**
     * Main access evaluation method that combines RBAC and ABAC
     */
    evaluateAccess(request: AccessRequest): Promise<AccessDecision>;
    /**
     * Evaluate Role-Based Access Control
     */
    evaluateRBAC(request: AccessRequest): Promise<RBACDecision>;
    /**
     * Evaluate Attribute-Based Access Control
     */
    evaluateABAC(request: AccessRequest): Promise<ABACDecision>;
    /**
     * Combine RBAC and ABAC decisions
     */
    combinedDecision(rbac: RBACDecision, abac: ABACDecision): Promise<AccessDecision>;
    private initializeCaches;
    private getUserRoles;
    private hasClassificationClearance;
    private evaluateRoleConstraints;
    private evaluateConstraint;
    private evaluateTimeConstraint;
    private evaluateLocationConstraint;
    private evaluatePurposeConstraint;
    private getRolePermissions;
    private permissionMatches;
    private checkAccessControlMatrix;
    private getApplicablePolicies;
    private isPolicyApplicable;
    private evaluateTarget;
    private evaluateExpression;
    private getAttributeValue;
    private evaluatePolicy;
    private evaluateClassificationPolicy;
    private checkSubjectCriteria;
    private evaluateAccessConditions;
    private evaluateAccessCondition;
    private calculateRiskLevel;
    private generateCacheKey;
    private isCacheValid;

export default DataClassificationAccessControlEngine;
//# sourceMappingURL=DataClassificationAccessControlEngine.d.ts.map