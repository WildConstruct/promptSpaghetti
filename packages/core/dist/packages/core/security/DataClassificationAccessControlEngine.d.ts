/**
 * Data Classification Access Control Engine
 *
 * Implements the access control engine that evaluates RBAC and ABAC policies
 * for data classification-aware access control decisions.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { AccessDecisionEngine, RBACModel, ABACModel, ClassificationAccessPolicy } from './DataClassificationAccessControl';
export declare class DataClassificationAccessControlEngine implements AccessDecisionEngine {
    private rbacModel;
    private abacModel;
    private classificationPolicies;
    private roleCache;
    private permissionCache;
    private policyCache;
    private decisionCache;
    constructor();
    rbacModel: RBACModel;
    abacModel: ABACModel;
    classificationPolicies: ClassificationAccessPolicy;
}
//# sourceMappingURL=DataClassificationAccessControlEngine.d.ts.map