/**
 * Data Classification Access Control Model
 * 
 * Implements a comprehensive access control framework that combines:
 * - Role-Based Access Control (RBAC)
 * - Attribute-Based Access Control (ABAC)
 * - Data Classification-Aware Access Policies
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { 
  DataClassificationLevel, 
  OperationContext,
  HandlingRequirements,
  AccessRequirements,
  ClassificationAuditEvent 
} from '../types/DataClassification';

export interface AccessControlModel {
  rbac: RBACModel;
  abac: ABACModel;
  policies: ClassificationAccessPolicy[];
  decisionEngine: AccessDecisionEngine;
}

/**
 * Role-Based Access Control (RBAC) Model
 */
export interface RBACModel {
  roles: DataClassificationRole[];
  permissions: DataClassificationPermission[];
  roleHierarchy: RoleHierarchy;
  userRoleAssignments: UserRoleAssignment[];
}

export interface DataClassificationRole {
  id: string;
  name: string;
  description: string;
  category: 'SYSTEM' | 'FUNCTIONAL' | 'DATA_OWNER' | 'ADMINISTRATIVE';
  permissions: string[];
  maxClassificationLevel: DataClassificationLevel;
  constraints: RoleConstraint[];
  parentRoles: string[];
  isActive: boolean;
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    approvalRequired: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

export interface DataClassificationPermission {
  id: string;
  name: string;
  description: string;
  operation: DataOperation;
  resourceType: ResourceType;
  classificationLevels: DataClassificationLevel[];
  conditions: PermissionCondition[];
  effect: 'ALLOW' | 'DENY';
  priority: number;
}

export interface RoleConstraint {
  type: 'TIME' | 'LOCATION' | 'DEVICE' | 'NETWORK' | 'PURPOSE' | 'DATA_AGE' | 'APPROVAL';
  operator: 'EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
  value: any;
  metadata?: Record<string, any>;
}

export interface RoleHierarchy {
  hierarchy: RoleLevel[];
  inheritanceRules: InheritanceRule[];
}

export interface RoleLevel {
  level: number;
  name: string;
  description: string;
  roles: string[];
  automaticInheritance: boolean;
  maxClassificationAccess: DataClassificationLevel;
}

export interface InheritanceRule {
  parentRole: string;
  childRole: string;
  inheritedPermissions: string[];
  conditions: RoleConstraint[];
}

export interface UserRoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  conditions: AssignmentCondition[];
  approvals: RoleApproval[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
}

export interface AssignmentCondition {
  type: 'CONTEXT' | 'TEMPORAL' | 'ENVIRONMENTAL' | 'BEHAVIORAL';
  specification: Record<string, any>;
  required: boolean;
}

export interface RoleApproval {
  approver: string;
  approvedAt: Date;
  comments?: string;
  approvalLevel: 'MANAGER' | 'DATA_OWNER' | 'SECURITY_OFFICER' | 'ADMIN';
}

/**
 * Attribute-Based Access Control (ABAC) Model
 */
export interface ABACModel {
  subjects: SubjectAttributes;
  objects: ObjectAttributes;
  actions: ActionAttributes;
  environment: EnvironmentAttributes;
  policies: ABACPolicy[];
}

export interface SubjectAttributes {
  userId: string;
  roles: string[];
  clearanceLevel: DataClassificationLevel;
  department: string;
  jobTitle: string;
  location: GeoLocation;
  device: DeviceAttributes;
  behaviorProfile: BehaviorProfile;
  riskScore: number;
  certifications: string[];
  lastActivity: Date;
  mfaVerified: boolean;
  trustLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
}

export interface ObjectAttributes {
  dataId: string;
  classification: DataClassificationLevel;
  dataOwner: string;
  createdAt: Date;
  lastModified: Date;
  retentionPeriod: number;
  complianceFrameworks: string[];
  tags: string[];
  sensitivity: 'NORMAL' | 'SENSITIVE' | 'HIGHLY_SENSITIVE' | 'TOP_SECRET';
  businessValue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dataType: string;
  sourceSystem: string;
  encryptionStatus: 'ENCRYPTED' | 'NOT_ENCRYPTED' | 'PARTIALLY_ENCRYPTED';
}

export interface ActionAttributes {
  operation: DataOperation;
  purpose: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  duration: number;
  bulkOperation: boolean;
  automated: boolean;
  delegated: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface EnvironmentAttributes {
  timestamp: Date;
  location: GeoLocation;
  network: NetworkAttributes;
  securityContext: SecurityContext;
  complianceMode: boolean;
  auditMode: boolean;
  emergencyMode: boolean;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  coordinates?: [number, number];
  timezone: string;
  withinApprovedRegions: boolean;
}

export interface DeviceAttributes {
  deviceId: string;
  deviceType: 'DESKTOP' | 'LAPTOP' | 'MOBILE' | 'TABLET' | 'SERVER';
  operatingSystem: string;
  browser?: string;
  managed: boolean;
  encrypted: boolean;
  patchLevel: string;
  riskScore: number;
  registered: boolean;
  lastSeen: Date;
}

export interface BehaviorProfile {
  normalAccessPatterns: AccessPattern[];
  anomalyScore: number;
  typicalHours: number[];
  typicalLocations: string[];
  accessFrequency: 'LOW' | 'MEDIUM' | 'HIGH';
  dataAccessPatterns: Record<DataClassificationLevel, AccessPattern>;
}

export interface AccessPattern {
  operations: string[];
  frequency: number;
  timeRanges: TimeRange[];
  locations: string[];
  dataTypes: string[];
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;
  daysOfWeek: number[];
}

export interface NetworkAttributes {
  ipAddress: string;
  vpnConnection: boolean;
  corporateNetwork: boolean;
  securityLevel: 'OPEN' | 'SECURED' | 'RESTRICTED' | 'ISOLATED';
  bandwidth: string;
  connectionType: 'WIRED' | 'WIRELESS' | 'CELLULAR' | 'VPN';
}

export interface SecurityContext {
  authenticationMethod: 'PASSWORD' | 'MFA' | 'CERTIFICATE' | 'BIOMETRIC' | 'SSO';
  sessionAge: number;
  sessionRisk: number;
  recentSecurityEvents: SecurityEvent[];
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
}

export interface SecurityEvent {
  type: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
}

export interface ABACPolicy {
  id: string;
  name: string;
  description: string;
  target: PolicyTarget;
  rule: PolicyRule;
  effect: 'PERMIT' | 'DENY' | 'INDETERMINATE';
  obligations: PolicyObligation[];
  priority: number;
  enabled: boolean;
  version: string;
  metadata: PolicyMetadata;
}

export interface PolicyTarget {
  subjects: AttributeExpression[];
  objects: AttributeExpression[];
  actions: AttributeExpression[];
  environment: AttributeExpression[];
}

export interface AttributeExpression {
  attribute: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'MATCHES' | 'BETWEEN';
  value: any;
  function?: string; // For complex expressions
}

export interface PolicyRule {
  condition: RuleCondition;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

export interface RuleCondition {
  type: 'SIMPLE' | 'COMPLEX';
  expression: string | ComplexExpression;
  subConditions?: RuleCondition[];
  operator?: 'AND' | 'OR' | 'NOT';
}

export interface ComplexExpression {
  function: string;
  parameters: Record<string, any>;
  returnType: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'DATE';
}

export interface PolicyObligation {
  id: string;
  type: 'AUDIT' | 'NOTIFICATION' | 'ENCRYPTION' | 'MONITORING' | 'APPROVAL' | 'RESTRICTION';
  action: string;
  parameters: Record<string, any>;
  fulfillmentRequired: boolean;
}

export interface PolicyMetadata {
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  approvedBy?: string;
  approvedAt?: Date;
  reviewDue: Date;
  tags: string[];
  complianceFrameworks: string[];
  riskAssessment: string;
}

/**
 * Classification-Specific Access Policies
 */
export interface ClassificationAccessPolicy {
  id: string;
  name: string;
  classification: DataClassificationLevel;
  accessRules: ClassificationAccessRule[];
  handlingRequirements: HandlingRequirements;
  exceptions: PolicyException[];
  approvalWorkflows: ApprovalWorkflow[];
  monitoringRequirements: MonitoringRequirement[];
  violationActions: ViolationAction[];
  metadata: PolicyMetadata;
}

export interface ClassificationAccessRule {
  id: string;
  operation: DataOperation;
  subjects: SubjectCriteria;
  conditions: AccessCondition[];
  effect: 'ALLOW' | 'DENY' | 'CONDITIONAL';
  requirements: AccessRequirement[];
  priority: number;
}

export interface SubjectCriteria {
  roles: string[];
  clearanceLevel: DataClassificationLevel;
  departments: string[];
  attributes: Record<string, any>;
}

export interface AccessCondition {
  type: 'TEMPORAL' | 'SPATIAL' | 'CONTEXTUAL' | 'BEHAVIORAL' | 'TECHNICAL';
  specification: ConditionSpecification;
  required: boolean;
}

export interface ConditionSpecification {
  attribute: string;
  operator: string;
  value: any;
  metadata?: Record<string, any>;
}

export interface AccessRequirement {
  type: 'MFA' | 'APPROVAL' | 'MONITORING' | 'ENCRYPTION' | 'AUDIT' | 'TIME_LIMIT';
  specification: RequirementSpecification;
  mandatory: boolean;
}

export interface RequirementSpecification {
  parameters: Record<string, any>;
  validation: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  expression: string;
  errorMessage: string;
}

export interface PolicyException {
  id: string;
  reason: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date;
  conditions: AccessCondition[];
  auditRequired: boolean;
  riskAcceptance: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  operations: DataOperation[];
  steps: ApprovalStep[];
  timeouts: WorkflowTimeout[];
  escalations: EscalationRule[];
}

export interface ApprovalStep {
  id: string;
  order: number;
  approvers: ApproverSpecification;
  requiredApprovals: number;
  conditions: AccessCondition[];
  timeoutHours: number;
}

export interface ApproverSpecification {
  type: 'ROLE' | 'USER' | 'ATTRIBUTE' | 'DYNAMIC';
  specification: Record<string, any>;
}

export interface WorkflowTimeout {
  step: string;
  timeoutHours: number;
  action: 'ESCALATE' | 'DENY' | 'NOTIFY';
}

export interface EscalationRule {
  condition: string;
  escalateTo: ApproverSpecification;
  timeoutHours: number;
}

export interface MonitoringRequirement {
  type: 'REALTIME' | 'BATCH' | 'ALERT' | 'AUDIT';
  specification: MonitoringSpecification;
  thresholds: MonitoringThreshold[];
}

export interface MonitoringSpecification {
  metrics: string[];
  frequency: string;
  retention: number;
  alerting: boolean;
}

export interface MonitoringThreshold {
  metric: string;
  operator: string;
  value: number;
  action: 'ALERT' | 'BLOCK' | 'LOG' | 'ESCALATE';
}

export interface ViolationAction {
  type: 'IMMEDIATE' | 'DELAYED' | 'MANUAL';
  action: 'BLOCK' | 'ALERT' | 'REVOKE' | 'AUDIT' | 'ESCALATE';
  parameters: Record<string, any>;
  conditions: AccessCondition[];
}

/**
 * Access Decision Engine
 */
export interface AccessDecisionEngine {
  evaluateAccess(request: AccessRequest): Promise<AccessDecision>;
  evaluateRBAC(request: AccessRequest): Promise<RBACDecision>;
  evaluateABAC(request: AccessRequest): Promise<ABACDecision>;
  combinedDecision(rbac: RBACDecision, abac: ABACDecision): AccessDecision;
}

export interface AccessRequest {
  requestId: string;
  timestamp: Date;
  subject: SubjectAttributes;
  object: ObjectAttributes;
  action: ActionAttributes;
  environment: EnvironmentAttributes;
  context: OperationContext;
}

export interface AccessDecision {
  decision: 'PERMIT' | 'DENY' | 'INDETERMINATE';
  reason: string;
  confidence: number;
  obligations: PolicyObligation[];
  conditions: AccessCondition[];
  monitoring: MonitoringRequirement[];
  auditRequired: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: DecisionMetadata;
}

export interface RBACDecision {
  permitted: boolean;
  matchedRoles: string[];
  matchedPermissions: string[];
  denialReasons: string[];
  requirements: AccessRequirement[];
}

export interface ABACDecision {
  permitted: boolean;
  matchedPolicies: string[];
  obligations: PolicyObligation[];
  conditions: AccessCondition[];
  confidence: number;
}

export interface DecisionMetadata {
  evaluationTime: number;
  policiesEvaluated: string[];
  rolesEvaluated: string[];
  cacheHit: boolean;
  version: string;
}

/**
 * Operation and Resource Types
 */
export type DataOperation = 
  | 'READ' 
  | 'WRITE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'EXPORT' 
  | 'SHARE' 
  | 'COPY'
  | 'MOVE'
  | 'CLASSIFY'
  | 'DECLASSIFY'
  | 'SEARCH'
  | 'AGGREGATE'
  | 'TRANSFORM'
  | 'BACKUP'
  | 'RESTORE'
  | 'ARCHIVE'
  | 'PURGE'
  | 'AUDIT'
  | 'APPROVE';

export type ResourceType = 
  | 'DOCUMENT' 
  | 'DATABASE' 
  | 'FILE' 
  | 'API' 
  | 'SYSTEM'
  | 'REPORT'
  | 'DATASET'
  | 'MODEL'
  | 'CONFIGURATION'
  | 'LOG'
  | 'BACKUP'
  | 'METADATA';

/**
 * Standard Classification Roles
 */
export 
/**
 * Standard Access Control Matrix
 */
export 
export default AccessControlModel;