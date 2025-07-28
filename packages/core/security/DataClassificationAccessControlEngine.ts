/**
 * Data Classification Access Control Engine
 * 
 * Implements the access control engine that evaluates RBAC and ABAC policies
 * for data classification-aware access control decisions.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import {
  AccessRequest,
  AccessDecision,
  AccessDecisionEngine,
  RBACDecision,
  ABACDecision,
  RBACModel,
  ABACModel,
  ClassificationAccessPolicy,
  DataClassificationRole,
  DataClassificationPermission,
  ABACPolicy,
  PolicyTarget,
  AttributeExpression,
  SubjectAttributes,
  ObjectAttributes,
  ActionAttributes,
  EnvironmentAttributes,
  PolicyObligation,
  AccessCondition,
  MonitoringRequirement,
  DataOperation,
  STANDARD_CLASSIFICATION_ROLES,
  ACCESS_CONTROL_MATRIX
} from './DataClassificationAccessControl';
import { 
  DataClassificationLevel, 
  OperationContext 
} from '../types/DataClassification';

export class DataClassificationAccessControlEngine implements AccessDecisionEngine {
  private rbacModel: RBACModel;
  private abacModel: ABACModel;
  private classificationPolicies: Map<DataClassificationLevel, ClassificationAccessPolicy>;
  private roleCache: Map<string, DataClassificationRole>;
  private permissionCache: Map<string, DataClassificationPermission>;
  private policyCache: Map<string, ABACPolicy>;
  private decisionCache: Map<string, AccessDecision>;
  constructor()
    rbacModel: RBACModel,
    abacModel: ABACModel,
    classificationPolicies: ClassificationAccessPolicy[],
  ) {
    this.rbacModel = rbacModel;
    this.abacModel = abacModel;
    this.classificationPolicies = new Map();
    this.roleCache = new Map();
    this.permissionCache = new Map();
    this.policyCache = new Map();
    this.decisionCache = new Map();
    this.initializeCaches(classificationPolicies);
  }
  /**
   * Main access evaluation method that combines RBAC and ABAC
   */
  async evaluateAccess(request: AccessRequest): Promise<AccessDecision> {
    const startTime = Date.now();
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedDecision = this.decisionCache.get(cacheKey);
      if (cachedDecision && this.isCacheValid(cachedDecision)) {
        return {
          ...cachedDecision,
          metadata: {,
            ...cachedDecision.metadata,
            cacheHit: true,
            evaluationTime: Date.now() - startTime
          }
        };
      }
      // Evaluate RBAC
      const rbacDecision = await this.evaluateRBAC(request);
      // Evaluate ABAC
      const abacDecision = await this.evaluateABAC(request);
      // Combine decisions
      const finalDecision = await this.combinedDecision(rbacDecision, abacDecision);
      // Add evaluation metadata
      finalDecision.metadata = {
        evaluationTime: Date.now() - startTime,
        policiesEvaluated: abacDecision.matchedPolicies,
        rolesEvaluated: rbacDecision.matchedRoles,
        cacheHit: false,
        version: '1.0',
      };
      // Cache the decision
      this.decisionCache.set(cacheKey, finalDecision);
      return finalDecision;
    } catch (error) {
      console.error('Error evaluating access:', error);
      return {
        decision: 'DENY',
        reason: 'Access evaluation failed due to system error',
        confidence: 0,
        obligations: [],
        conditions: [],
        monitoring: [],
        auditRequired: true,
        riskLevel: 'CRITICAL',
        metadata: {,
          evaluationTime: Date.now() - startTime,
          policiesEvaluated: [],
          rolesEvaluated: [],
          cacheHit: false,
          version: '1.0',
        }
      };
    }
  }
  /**
   * Evaluate Role-Based Access Control
   */
  async evaluateRBAC(request: AccessRequest): Promise<RBACDecision> {
    const matchedRoles: string[] = [];
    const matchedPermissions: string[] = [];
    const denialReasons: string[] = [];
    const requirements: any[] = [];
    try {
      // Get user roles
      const userRoles = await this.getUserRoles(request.subject.userId);
      // Check each role for applicable permissions
      for (const role of userRoles) {
        if (!role.isActive) {
          continue;
        }
        // Check classification level clearance
        if (!this.hasClassificationClearance(role, request.object.classification)) {
          denialReasons.push(`Role ${role.name} lacks clearance for ${request.object.classification} data`);}
          continue;
        }
        // Check role constraints
        const constraintsValid = await this.evaluateRoleConstraints(role, request);
        if (!constraintsValid) {
          denialReasons.push(`Role ${role.name} constraints not satisfied`);}
          continue;
        }
        matchedRoles.push(role.id);
        // Check permissions for this role
        const rolePermissions = await this.getRolePermissions(role);
        for (const permission of rolePermissions) {
          if (this.permissionMatches(permission, request)) {
            matchedPermissions.push(permission.id);
            // Add any requirements from the permission
            if (permission.conditions) {
              requirements.push(...permission.conditions);
            }
          }
        }
      }
      // Check access control matrix
      const matrixAllowed = this.checkAccessControlMatrix(;)
        request.object.classification,
        request.action.operation,
        userRoles
      );
      if (!matrixAllowed) {
        denialReasons.push('Operation not permitted by access control matrix');
      }
      const permitted = matchedPermissions.length > 0 && matrixAllowed;
      return {
        permitted,
        matchedRoles,
        matchedPermissions,
        denialReasons,
        requirements
      };
    } catch (error) {
      console.error('Error evaluating RBAC:', error);
      return {
        permitted: false,
        matchedRoles: [],
        matchedPermissions: [],
        denialReasons: ['RBAC evaluation failed'],
        requirements: [],
      };
    }
  }
  /**
   * Evaluate Attribute-Based Access Control
   */
  async evaluateABAC(request: AccessRequest): Promise<ABACDecision> {
    const matchedPolicies: string[] = [];
    const obligations: PolicyObligation[] = [];
    const conditions: AccessCondition[] = [];
    let confidence = 0;
    try {
      // Get applicable policies
      const applicablePolicies = await this.getApplicablePolicies(request);
      // Evaluate each policy
      for (const policy of applicablePolicies) {
        const policyResult = await this.evaluatePolicy(policy, request);
        if (policyResult.applicable) {
          matchedPolicies.push(policy.id);
          confidence = Math.max(confidence, policyResult.confidence);
          if (policyResult.effect === 'PERMIT') {
            obligations.push(...policy.obligations);
          }
          // Add conditions from the policy
          if (policyResult.conditions) {
            conditions.push(...policyResult.conditions);
          }
        }
      }
      // Evaluate classification-specific policies
      const classificationPolicy = this.classificationPolicies.get(request.object.classification);
      if (classificationPolicy) {
        const classificationResult = await this.evaluateClassificationPolicy(;)
          classificationPolicy, 
          request
        );
        if (classificationResult.permitted) {
          matchedPolicies.push(classificationPolicy.id);
          conditions.push(...classificationResult.conditions);
          confidence = Math.max(confidence, 0.8);
        }
      }
      // Default deny if no policies match
      const permitted = matchedPolicies.length > 0 && confidence > 0.5;
      return {
        permitted,
        matchedPolicies,
        obligations,
        conditions,
        confidence
      };
    } catch (error) {
      console.error('Error evaluating ABAC:', error);
      return {
        permitted: false,
        matchedPolicies: [],
        obligations: [],
        conditions: [],
        confidence: 0,
      };
    }
  }
  /**
   * Combine RBAC and ABAC decisions
   */
  async combinedDecision(rbac: RBACDecision, abac: ABACDecision): Promise<AccessDecision> {
    // Both RBAC and ABAC must permit for final approval
    const permitted = rbac.permitted && abac.permitted;
    let decision: 'PERMIT' | 'DENY' | 'INDETERMINATE';
    let reason: string;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (permitted) {
      decision = 'PERMIT';
      reason = 'Access granted by RBAC and ABAC policies';
      riskLevel = this.calculateRiskLevel(rbac, abac);
    } else {
      decision = 'DENY';
      const rbacReasons = rbac.denialReasons.join('; ');
      const abacReason = abac.permitted ? '' : 'ABAC policies not satisfied';
      reason = [rbacReasons, abacReason].filter(Boolean).join('; ');
      riskLevel = 'HIGH';
    }
    // Determine monitoring requirements
    const monitoring: MonitoringRequirement[] = [];
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      monitoring.push({)
        type: 'REALTIME',
        specification: {,
          metrics: ['access_attempts', 'data_volume', 'operation_duration'],
          frequency: 'immediate',
          retention: 90,
          alerting: true,
        },
        thresholds: [{,
          metric: 'access_frequency',
          operator: 'greater_than',
          value: 10,
          action: 'ALERT',
        }]
      });
    }
    return {
      decision,
      reason,
      confidence: abac.confidence,
      obligations: abac.obligations,
      conditions: abac.conditions,
      monitoring,
      auditRequired: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
      riskLevel,
      metadata: {,
        evaluationTime: 0, // Will be set by caller
        policiesEvaluated: [],
        rolesEvaluated: [],
        cacheHit: false,
        version: '1.0',
      }
    };
  }
  // Private helper methods
  private initializeCaches(classificationPolicies: ClassificationAccessPolicy[]): void {
    // Initialize classification policies
    classificationPolicies.forEach(policy => {)
      this.classificationPolicies.set(policy.classification, policy);
    });
    // Initialize role cache
    this.rbacModel.roles.forEach(role => {)
      this.roleCache.set(role.id, role);
    });
    // Initialize permission cache
    this.rbacModel.permissions.forEach(permission => {)
      this.permissionCache.set(permission.id, permission);
    });
    // Initialize policy cache
    this.abacModel.policies.forEach(policy => {)
      this.policyCache.set(policy.id, policy);
    });
  }
  private async getUserRoles(userId: string): Promise<DataClassificationRole[]> {
    const userRoleAssignments = this.rbacModel.userRoleAssignments.filter(;)
      assignment => assignment.userId === userId && 
                   assignment.status === 'ACTIVE' &&
                   (!assignment.expiresAt || assignment.expiresAt > new Date())
    );
    const roles: DataClassificationRole[] = [];
    for (const assignment of userRoleAssignments) {
      const role = this.roleCache.get(assignment.roleId);
      if (role && role.isActive) {
        roles.push(role);
      }
    }
    return roles;
  }
  private hasClassificationClearance()
    role: DataClassificationRole, 
    classification: DataClassificationLevel,
  ): boolean {
    const levels: DataClassificationLevel[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
    const roleLevel = levels.indexOf(role.maxClassificationLevel);
    const requiredLevel = levels.indexOf(classification);
    return roleLevel >= requiredLevel;
  }
  private async evaluateRoleConstraints()
    role: DataClassificationRole, 
    request: AccessRequest,
  ): Promise<boolean> {
    for (const constraint of role.constraints) {
      const satisfied = await this.evaluateConstraint(constraint, request);
      if (!satisfied) {
        return false;
      }
    }
    return true;
  }
  private async evaluateConstraint(constraint: any, request: AccessRequest): Promise<boolean> {
    switch (constraint.type) {
    case 'TIME':
      return this.evaluateTimeConstraint(constraint, request.timestamp);
    case 'LOCATION':
      return this.evaluateLocationConstraint(constraint, request.environment.location);
    case 'PURPOSE':
      return this.evaluatePurposeConstraint(constraint, request.action.purpose);
    default:
      return true;
    }
  }
  private evaluateTimeConstraint(constraint: any, timestamp: Date): boolean {
    const hour = timestamp.getHours();
    if (constraint.operator === 'BETWEEN' && Array.isArray(constraint.value)) {
      const [start, end] = constraint.value;
      return hour >= start && hour <= end;
    }
    return true;
  }
  private evaluateLocationConstraint(constraint: any, location: any): boolean {
    if (constraint.operator === 'IN' && Array.isArray(constraint.value)) {
      return constraint.value.includes(location.country);
    }
    return true;
  }
  private evaluatePurposeConstraint(constraint: any, purpose: string): boolean {
    if (constraint.operator === 'EQUALS') {
      return purpose === constraint.value;
    }
    return true;
  }
  private async getRolePermissions(role: DataClassificationRole): Promise<DataClassificationPermission[]> {
    const permissions: DataClassificationPermission[] = [];
    for (const permissionId of role.permissions) {
      const permission = this.permissionCache.get(permissionId);
      if (permission) {
        permissions.push(permission);
      }
    }
    return permissions;
  }
  private permissionMatches()
    permission: DataClassificationPermission, 
    request: AccessRequest,
  ): boolean {
    // Check operation match
    if (permission.operation !== '*' && permission.operation !== request.action.operation) {
      return false;
    }
    // Check classification level
    if (!permission.classificationLevels.includes(request.object.classification)) {
      return false;
    }
    // Check effect
    return permission.effect === 'ALLOW';
  }
  private checkAccessControlMatrix()
    classification: DataClassificationLevel,
    operation: DataOperation,
    userRoles: DataClassificationRole[],
  ): boolean {
    const matrixEntry = ACCESS_CONTROL_MATRIX[classification]?.[operation];
    if (!matrixEntry) {
      return false;
    }
    // Check if any of the user's roles are allowed
    return userRoles.some(role => )
      matrixEntry.includes(role.name as any)
    );
  }
  private async getApplicablePolicies(request: AccessRequest): Promise<ABACPolicy[]> {
    const applicablePolicies: ABACPolicy[] = [];
    for (const policy of this.abacModel.policies) {
      if (policy.enabled && await this.isPolicyApplicable(policy, request)) {
        applicablePolicies.push(policy);
      }
    }
    // Sort by priority
    return applicablePolicies.sort((a, b) => b.priority - a.priority);
  }
  private async isPolicyApplicable(policy: ABACPolicy, request: AccessRequest): Promise<boolean> {
    return ()
      await this.evaluateTarget(policy.target.subjects, request.subject) &&
      await this.evaluateTarget(policy.target.objects, request.object) &&
      await this.evaluateTarget(policy.target.actions, request.action) &&
      await this.evaluateTarget(policy.target.environment, request.environment)
    );
  }
  private async evaluateTarget(expressions: AttributeExpression[], attributes: any): Promise<boolean> {
    for (const expression of expressions) {
      if (!await this.evaluateExpression(expression, attributes)) {
        return false;
      }
    }
    return true;
  }
  private async evaluateExpression(expression: AttributeExpression, attributes: any): Promise<boolean> {
    const attributeValue = this.getAttributeValue(expression.attribute, attributes);
    switch (expression.operator) {
    case 'EQUALS':
      return attributeValue === expression.value;
    case 'NOT_EQUALS':
      return attributeValue !== expression.value;
    case 'IN':
      return Array.isArray(expression.value) && expression.value.includes(attributeValue);
    case 'NOT_IN':
      return Array.isArray(expression.value) && !expression.value.includes(attributeValue);
    case 'GREATER_THAN':
      return attributeValue > expression.value;
    case 'LESS_THAN':
      return attributeValue < expression.value;
    case 'CONTAINS':
      return String(attributeValue).includes(String(expression.value));
    case 'MATCHES':
      return new RegExp(String(expression.value)).test(String(attributeValue));
    case 'BETWEEN':
      return Array.isArray(expression.value) && expression.value.length === 2 &&
               attributeValue >= expression.value[0] && attributeValue <= expression.value[1];
    default:
      return false;
    }
  }
  private getAttributeValue(attributePath: string, attributes: any): any {
    const path = attributePath.split('.');
    let value = attributes;
    for (const key of path) {
      value = value?.[key];
      if (value === undefined) {
        return undefined;
      }
    }
    return value;
  }
  private async evaluatePolicy(policy: ABACPolicy, request: AccessRequest): Promise<{
    applicable: boolean;
    effect: 'PERMIT' | 'DENY' | 'INDETERMINATE';
    confidence: number;
    conditions?: AccessCondition[];
  }> {
    // Simplified policy evaluation - in real implementation would be more complex
    const applicable = await this.isPolicyApplicable(policy, request);
    return {
      applicable,
      effect: applicable ? policy.effect : 'INDETERMINATE',
      confidence: applicable ? 0.9 : 0,
      conditions: [],
    };
  }
  private async evaluateClassificationPolicy()
    policy: ClassificationAccessPolicy,
    request: AccessRequest,
  ): Promise<{
    permitted: boolean;
    conditions: AccessCondition[];
  }> {
    // Find applicable access rule
    const applicableRule = policy.accessRules.find(rule => ;)
      rule.operation === request.action.operation || rule.operation === '*'
    );
    if (!applicableRule) {
      return { permitted: false, conditions: [] };
    }
    // Check subject criteria
    const subjectMatches = this.checkSubjectCriteria(applicableRule.subjects, request.subject);
    if (!subjectMatches) {
      return { permitted: false, conditions: [] };
    }
    // Evaluate conditions
    const conditionsMet = await this.evaluateAccessConditions(applicableRule.conditions, request);
    return {
      permitted: applicableRule.effect === 'ALLOW' && conditionsMet,
      conditions: applicableRule.conditions,
    };
  }
  private checkSubjectCriteria(criteria: any, subject: SubjectAttributes): boolean {
    // Check clearance level
    const levels: DataClassificationLevel[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
    const subjectLevel = levels.indexOf(subject.clearanceLevel);
    const requiredLevel = levels.indexOf(criteria.clearanceLevel);
    return subjectLevel >= requiredLevel;
  }
  private async evaluateAccessConditions(conditions: AccessCondition[], request: AccessRequest): Promise<boolean> {
    for (const condition of conditions) {
      if (condition.required && !await this.evaluateAccessCondition(condition, request)) {
        return false;
      }
    }
    return true;
  }
  private async evaluateAccessCondition(condition: AccessCondition, request: AccessRequest): Promise<boolean> {
    // Simplified condition evaluation
    return true;
  }
  private calculateRiskLevel(rbac: RBACDecision, abac: ABACDecision): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let riskScore = 0;
    // Low confidence increases risk
    if (abac.confidence < 0.7) {
      riskScore += 20;
    }
    // Multiple matched policies might indicate complexity
    if (abac.matchedPolicies.length > 3) {
      riskScore += 10;
    }
    // Multiple obligations increase risk
    if (abac.obligations.length > 2) {
      riskScore += 15;
    }
    if (riskScore >= 40) return 'CRITICAL';
    if (riskScore >= 25) return 'HIGH';
    if (riskScore >= 15) return 'MEDIUM';
    return 'LOW';
  }
  private generateCacheKey(request: AccessRequest): string {
    const key = `${request.subject.userId}-${request.object.dataId}-${request.action.operation}-${request.object.classification}`;}
    return Buffer.from(key).toString('base64');
  }
  private isCacheValid(decision: AccessDecision): boolean {
    // Cache for 5 minutes for low-risk decisions, 1 minute for high-risk
    const maxAge = decision.riskLevel === 'LOW' ? 5 * 60 * 1000 : 60 * 1000;
    return Date.now() - decision.metadata.evaluationTime < maxAge;
  }
}

export default DataClassificationAccessControlEngine;