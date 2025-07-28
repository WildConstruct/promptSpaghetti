/**
 * Data Permission Hierarchy System
 *
 * Implements a hierarchical permission system for data access control
 * that integrates with data classification levels and organizational roles.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, DataOperation } from '../types/DataClassification';
import { AccessRequirement } from './DataClassificationAccessControl';

export interface PermissionHierarchy {
    levels: PermissionLevel[];
    inheritanceRules: PermissionInheritanceRule[];
    escalationPaths: EscalationPath[];
    delegationRules: DelegationRule[];
    emergencyOverrides: EmergencyOverride[];


export interface PermissionLevel {
    id: string;
    name: string;
    level: number;
    description: string;
    classificationAccess: DataClassificationLevel[];
    operationPermissions: OperationPermission[];
    timeRestrictions: TimeRestriction[];
    contextRequirements: ContextRequirement[];
    automaticInheritance: boolean;
    requiresExplicitGrant: boolean;
    maxDelegationLevel: number;
    auditLevel: 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE' | 'REALTIME';
    metadata: PermissionLevelMetadata;


export interface OperationPermission {
    operation: DataOperation;
    allowed: boolean;
    conditions: PermissionCondition[];
    requirements: AccessRequirement[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    approvalRequired: boolean;
    delegatable: boolean;
    timeLimit?: number;
    usageLimit?: number;


export interface PermissionCondition {
    type: 'CLASSIFICATION' | 'TIME' | 'LOCATION' | 'PURPOSE' | 'VOLUME' | 'FREQUENCY' | 'CONTEXT';
    operator: 'EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'CONTAINS' | 'MATCHES';
    value: any;
    required: boolean;
    errorMessage?: string;


export interface TimeRestriction {
    type: 'BUSINESS_HOURS' | 'SPECIFIC_TIMES' | 'BLACKOUT_PERIODS' | 'MAINTENANCE_WINDOWS';
    configuration: TimeConfiguration;
    exceptions: TimeException[];
    emergencyOverride: boolean;


export interface TimeConfiguration {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
    timezone: string;
    excludeHolidays?: boolean;
    maintenanceWindows?: MaintenanceWindow[];


export interface MaintenanceWindow {
    start: Date;
    end: Date;
    description: string;
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    allowedOperations: DataOperation[];


export interface TimeException {
    id: string;
    reason: string;
    grantedBy: string;
    grantedAt: Date;
    validFrom: Date;
    validUntil: Date;
    operations: DataOperation[];
    approvalRequired: boolean;


export interface ContextRequirement {
    type: 'DEVICE' | 'NETWORK' | 'APPLICATION' | 'USER_ATTRIBUTE' | 'ENVIRONMENTAL';
    specification: ContextSpecification;
    mandatory: boolean;
    fallbackBehavior: 'DENY' | 'PROMPT' | 'DEGRADE' | 'AUDIT';


export interface ContextSpecification {
    attribute: string;
    expectedValue: any;
    validation: ValidationRule[];
    tolerance?: number;


export interface ValidationRule {
    type: 'RANGE' | 'PATTERN' | 'ENUM' | 'CUSTOM';
    parameters: Record<string, any>;
    errorMessage: string;


export interface PermissionLevelMetadata {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    version: string;
    compliance: ComplianceInfo;
    riskAssessment: RiskAssessment;
    usageStatistics: UsageStatistics;


export interface ComplianceInfo {
    frameworks: string[];
    requirements: string[];
    lastAudit: Date;
    nextReview: Date;
    certifications: string[];


export interface RiskAssessment {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: RiskFactor[];
    mitigations: Mitigation[];
    lastAssessment: Date;
    assessedBy: string;


export interface RiskFactor {
    type: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    mitigation?: string;


export interface Mitigation {
    id: string;
    description: string;
    effectiveness: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
    implementationDate: Date;
    verificationRequired: boolean;


export interface UsageStatistics {
    totalGrants: number;
    activeUsers: number;
    violationCount: number;
    lastViolation?: Date;
    averageSessionDuration: number;
    peakUsageHours: number[];


export interface PermissionInheritanceRule {
    id: string;
    parentLevel: string;
    childLevel: string;
    inheritedPermissions: string[];
    conditions: InheritanceCondition[];
    restrictions: InheritanceRestriction[];
    automatic: boolean;
    requiresApproval: boolean;


export interface InheritanceCondition {
    type: 'USER_ATTRIBUTE' | 'ORGANIZATIONAL' | 'TEMPORAL' | 'CONTEXTUAL';
    attribute: string;
    operator: string;
    value: any;
    weight: number;


export interface InheritanceRestriction {
    type: 'DOWNGRADE' | 'TIME_LIMIT' | 'USAGE_LIMIT' | 'CONTEXT_LIMIT';
    specification: RestrictionSpecification;
    enforced: boolean;
    overridable: boolean;


export interface RestrictionSpecification {
    parameters: Record<string, any>;
    validation: ValidationRule[];
    monitoring: MonitoringRequirement[];


export interface MonitoringRequirement {
    type: 'USAGE' | 'VIOLATIONS' | 'PERFORMANCE' | 'COMPLIANCE';
    frequency: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    thresholds: MonitoringThreshold[];
    alerting: AlertingConfiguration;


export interface MonitoringThreshold {
    metric: string;
    warning: number;
    critical: number;
    action: 'LOG' | 'ALERT' | 'RESTRICT' | 'REVOKE';


export interface AlertingConfiguration {
    enabled: boolean;
    channels: string[];
    escalation: EscalationConfiguration;
    suppressionRules: SuppressionRule[];


export interface EscalationConfiguration {
    levels: EscalationLevel[];
    timeouts: number[];
    autoEscalate: boolean;


export interface EscalationLevel {
    name: string;
    recipients: string[];
    actions: string[];
    timeout: number;


export interface SuppressionRule {
    condition: string;
    duration: number;
    reason: string;


export interface EscalationPath {
    id: string;
    name: string;
    description: string;
    triggerConditions: EscalationTrigger[];
    steps: EscalationStep[];
    timeouts: EscalationTimeout[];
    fallbackActions: FallbackAction[];


export interface EscalationTrigger {
    type: 'PERMISSION_DENIED' | 'VIOLATION_DETECTED' | 'THRESHOLD_EXCEEDED' | 'MANUAL_REQUEST';
    conditions: TriggerCondition[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    automatic: boolean;


export interface TriggerCondition {
    attribute: string;
    operator: string;
    value: any;
    weight: number;


export interface EscalationStep {
    id: string;
    order: number;
    name: string;
    description: string;
    approvers: ApproverSpecification[];
    requiredApprovals: number;
    timeout: number;
    actions: StepAction[];
    conditions: StepCondition[];


export interface ApproverSpecification {
    type: 'USER' | 'ROLE' | 'GROUP' | 'DYNAMIC';
    specification: Record<string, any>;
    weight: number;
    required: boolean;


export interface StepAction {
    type: 'NOTIFICATION' | 'AUDIT' | 'PERMISSION_GRANT' | 'RESTRICTION' | 'MONITORING';
    configuration: ActionConfiguration;
    conditional: boolean;
    rollbackable: boolean;


export interface ActionConfiguration {
    parameters: Record<string, any>;
    validation: ValidationRule[];
    timeout?: number;
    retries?: number;


export interface StepCondition {
    attribute: string;
    operator: string;
    value: any;
    required: boolean;


export interface EscalationTimeout {
    step: string;
    timeout: number;
    action: 'ESCALATE' | 'DENY' | 'APPROVE' | 'DELEGATE';
    notification: boolean;


export interface FallbackAction {
    condition: string;
    action: 'DENY' | 'APPROVE' | 'DEFER' | 'EMERGENCY_OVERRIDE';
    parameters: Record<string, any>;
    auditRequired: boolean;


export interface DelegationRule {
    id: string;
    name: string;
    description: string;
    fromLevel: string;
    toLevel: string;
    permissions: string[];
    conditions: DelegationCondition[];
    restrictions: DelegationRestriction[];
    timeLimit: number;
    usageLimit: number;
    revocable: boolean;
    auditRequired: boolean;


export interface DelegationCondition {
    type: 'TEMPORAL' | 'CONTEXTUAL' | 'APPROVAL' | 'JUSTIFICATION';
    specification: Record<string, any>;
    required: boolean;
    validation: ValidationRule[];


export interface DelegationRestriction {
    type: 'SCOPE' | 'TIME' | 'USAGE' | 'CONTEXT' | 'MONITORING';
    specification: Record<string, any>;
    enforced: boolean;
    overridable: boolean;


export interface EmergencyOverride {
    id: string;
    name: string;
    description: string;
    triggerConditions: EmergencyTrigger[];
    grantedPermissions: string[];
    timeLimit: number;
    approvalRequired: boolean;
    auditLevel: 'ENHANCED' | 'COMPREHENSIVE' | 'REALTIME';
    postEmergencyActions: PostEmergencyAction[];


export interface EmergencyTrigger {
    type: 'SYSTEM_FAILURE' | 'SECURITY_INCIDENT' | 'BUSINESS_CRITICAL' | 'REGULATORY_DEADLINE' | 'MANUAL';
    conditions: TriggerCondition[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    autoTrigger: boolean;


export interface PostEmergencyAction {
    type: 'REVIEW' | 'REVOKE' | 'AUDIT' | 'NOTIFICATION' | 'DOCUMENTATION';
    delay: number;
    required: boolean;
    assignee: string;


/**
 * Standard Permission Hierarchy Levels
 */
export 
/**
 * Standard Operation Permission Matrix
 */
default PermissionHierarchy;
//# sourceMappingURL=DataPermissionHierarchy.d.ts.map