/**
 * Temporary Access Grant Service
 * 
 * Manages time-limited access grants with automatic revocation, monitoring,
 * and integration with the access request workflow system.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { EventEmitter } from 'events';
import { AuditService } from '../auth/services/AuditService';
import { DataAccessControlService } from './DataAccessControlService';
import { AccessRequestWorkflowService } from './AccessRequestWorkflowService';
import { 
  DataClassificationLevel, 
  DataOperation, 
  OperationContext 
 from '../../../packages/core/types/DataClassification';



export interface TemporaryAccessGrant {
  id: string;
  requestId?: string;
  granteeId: string;
  granteeName: string;
  granteeEmail: string;
  granterId: string;
  granterName: string;
  permissions: GrantedPermission[];
  accessScope: AccessScope;
  timeWindow: GrantTimeWindow;
  conditions: AccessCondition[];
  status: GrantStatus;
  usage: GrantUsage;
  monitoring: GrantMonitoring;
  security: GrantSecurity;
  compliance: GrantCompliance;
  metadata: GrantMetadata;
  createdAt: Date;
  activatedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date;
  lastUsedAt?: Date;







export interface GrantedPermission {
  operation: DataOperation;
  dataClassification: DataClassificationLevel;
  resourceTypes: string[];
  resourcePatterns: string[];
  exclusions: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  usageLimit?: number;
  rateLimits: RateLimit[];
  auditLevel: 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE' | 'REALTIME';







export interface RateLimit {
  type: 'REQUESTS_PER_MINUTE' | 'REQUESTS_PER_HOUR' | 'DATA_VOLUME_PER_DAY' | 'CONCURRENT_SESSIONS';
  limit: number;
  window: number; // in seconds
  burstAllowed: boolean;
  burstLimit?: number;







export interface AccessScope {
  type: 'RESOURCE_SPECIFIC' | 'CLASSIFICATION_LEVEL' | 'DEPARTMENT' | 'PROJECT' | 'GLOBAL';
  targets: ScopeTarget[];
  exclusions: ScopeTarget[];
  inheritanceLevel: 'NONE' | 'CHILD_RESOURCES' | 'ALL_DESCENDANTS';
  cascadingPermissions: boolean;
  contextualRestrictions: ContextualRestriction[];







export interface ScopeTarget {
  type: 'RESOURCE_ID' | 'RESOURCE_PATTERN' | 'CLASSIFICATION' | 'DEPARTMENT' | 'PROJECT';
  value: string;
  metadata: Record<string, any>;







export interface ContextualRestriction {
  type: 'LOCATION' | 'DEVICE' | 'NETWORK' | 'TIME_OF_DAY' | 'USER_ATTRIBUTE';
  specification: RestrictionSpecification;
  enforcement: 'STRICT' | 'FLEXIBLE' | 'ADVISORY';
  fallbackBehavior: 'DENY' | 'DEGRADE' | 'WARN' | 'AUDIT';







export interface RestrictionSpecification {
  attribute: string;
  operator: 'EQUALS' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'MATCHES' | 'RANGE';
  value: Error;
  tolerance?: number;
  customValidation?: string;







export interface GrantTimeWindow {
  startTime?: Date;
  endTime: Date;
  timezone: string;
  allowedHours: TimeRange[];
  blackoutPeriods: BlackoutPeriod[];
  maxSessionDuration: number; // minutes
  maxConcurrentSessions: number;
  sessionIdleTimeout: number; // minutes
  extendable: boolean;
  maxExtensions: number;
  extensionDuration: number; // hours







export interface TimeRange {
  startHour: number; // 0-23
  endHour: number;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  exceptions: TimeException[];







export interface TimeException {
  date: Date;
  allowed: boolean;
  reason: string;
  approvedBy: string;







export interface BlackoutPeriod {
  start: Date;
  end: Date;
  reason: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  overridable: boolean;
  overrideRequiresApproval: boolean;







export interface AccessCondition {
  id: string;
  type: 'MFA_REQUIRED' | 'APPROVAL_REQUIRED' | 'SUPERVISION_REQUIRED' | 'AUDIT_ENHANCED' | 'VPN_REQUIRED' | 'DEVICE_TRUSTED';
  specification: ConditionSpecification;
  required: boolean;
  enforced: boolean;
  fallbackBehavior: 'DENY' | 'PROMPT' | 'DEGRADE' | 'WARN';
  verificationRequired: boolean;
  reVerificationInterval?: number; // minutes







export interface ConditionSpecification {
  parameters: Record<string, any>;
  validation: ValidationRule[];
  dependencies: string[]; // IDs of other conditions
  conflictsWith: string[]; // IDs of conflicting conditions







export interface ValidationRule {
  type: 'PRESENCE' | 'FORMAT' | 'RANGE' | 'CUSTOM';
  specification: Record<string, any>;
  errorMessage: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';





export type GrantStatus = 
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'USED_UP'
  | 'FAILED_CONDITIONS';



export interface GrantUsage {
  totalRequests: number;
  successfulRequests: number;
  deniedRequests: number;
  lastRequestTime?: Date;
  sessionsStarted: number;
  activeSessions: number;
  dataVolumeAccessed: number; // bytes
  operationCounts: Record<DataOperation, number>;
  resourcesAccessed: string[];
  violationCount: number;
  lastViolation?: GrantViolation;







export interface GrantViolation {
  id: string;
  type: 'SCOPE_VIOLATION' | 'TIME_VIOLATION' | 'CONDITION_VIOLATION' | 'RATE_LIMIT_VIOLATION' | 'SECURITY_VIOLATION';
  description: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolvedAt?: Date;
  resolution?: string;
  impact: ViolationImpact;







export interface ViolationImpact {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedResources: string[];
  mitigationActions: string[];
  escalationRequired: boolean;







export interface GrantMonitoring {
  enabled: boolean;
  realTimeTracking: boolean;
  alertThresholds: AlertThreshold[];
  anomalyDetection: AnomalyDetectionConfig;
  complianceChecks: ComplianceCheck[];
  reportingFrequency: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  retentionPeriod: number; // days







export interface AlertThreshold {
  metric: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'PERCENTAGE_INCREASE';
  value: number;
  timeWindow: number; // minutes
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  action: 'LOG' | 'ALERT' | 'SUSPEND' | 'REVOKE';
  recipients: string[];







export interface AnomalyDetectionConfig {
  enabled: boolean;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  baselineWindow: number; // hours
  detectionMethods: AnomalyDetectionMethod[];
  responseActions: AnomalyResponseAction[];







export interface AnomalyDetectionMethod {
  type: 'STATISTICAL' | 'MACHINE_LEARNING' | 'RULE_BASED' | 'BEHAVIORAL';
  configuration: Record<string, any>;
  weight: number;







export interface AnomalyResponseAction {
  trigger: 'ANOMALY_DETECTED' | 'ANOMALY_CONFIRMED' | 'ANOMALY_SEVERE';
  action: 'LOG' | 'ALERT' | 'SUSPEND' | 'REQUIRE_REAUTH' | 'ESCALATE';
  parameters: Record<string, any>;
  automatic: boolean;







export interface ComplianceCheck {
  framework: 'GDPR' | 'HIPAA' | 'SOC2' | 'FedRAMP' | 'FISMA' | 'ISO27001' | 'NIST';
  requirement: string;
  frequency: 'CONTINUOUS' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  automatedCheck: boolean;
  checkFunction: string;
  remediationActions: string[];







export interface GrantSecurity {
  encryptionRequired: boolean;
  keyRotationInterval: number; // hours
  accessTokens: AccessToken[];
  signatureRequired: boolean;
  integrityChecks: boolean;
  tamperDetection: boolean;
  secureChannelRequired: boolean;
  certificateBasedAuth: boolean;







export interface AccessToken {
  id: string;
  type: 'BEARER' | 'OAUTH2' | 'JWT' | 'CUSTOM';
  value: string;
  createdAt: Date;
  expiresAt: Date;
  scope: string[];
  issuedBy: string;
  revoked: boolean;
  revokedAt?: Date;
  lastUsed?: Date;
  usage: TokenUsage;







export interface TokenUsage {
  requestCount: number;
  lastRequest?: Date;
  sourceIPs: string[];
  userAgents: string[];
  errors: TokenError[];







export interface TokenError {
  timestamp: Date;
  error: string;
  context: Record<string, any>;







export interface GrantCompliance {
  frameworks: ComplianceFramework[];
  auditTrail: ComplianceAuditEntry[];
  certifications: ComplianceCertification[];
  violations: ComplianceViolation[];
  attestations: ComplianceAttestation[];







export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  assessmentDate: Date;
  assessorId: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'PENDING_REVIEW';
  nextReview: Date;







export interface ComplianceRequirement {
  id: string;
  description: string;
  mandatory: boolean;
  status: 'MET' | 'NOT_MET' | 'PARTIALLY_MET' | 'NOT_APPLICABLE';
  evidence: string[];
  lastVerified: Date;







export interface ComplianceAuditEntry {
  id: string;
  timestamp: Date;
  auditorId: string;
  action: string;
  framework: string;
  requirement: string;
  result: 'PASS' | 'FAIL' | 'WARNING' | 'INFO';
  details: Record<string, any>;
  evidence: string[];







export interface ComplianceCertification {
  id: string;
  framework: string;
  certifyingBody: string;
  certificationDate: Date;
  expiryDate: Date;
  scope: string[];
  certificateNumber: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';







export interface ComplianceViolation {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  impact: ComplianceImpact;







export interface ComplianceImpact {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedSystems: string[];
  potentialFines: number;
  businessImpact: string;
  mitigationPlan: string[];







export interface ComplianceAttestation {
  id: string;
  attesterId: string;
  attesterRole: string;
  framework: string;
  scope: string[];
  attestationDate: Date;
  validUntil: Date;
  statement: string;
  evidence: string[];
  witnessed: boolean;
  witnessId?: string;







export interface GrantMetadata {
  createdBy: string;
  approvedBy: string[];
  emergencyGrant: boolean;
  riskAssessment: GrantRiskAssessment;
  businessJustification: string;
  technicalJustification: string;
  approvalWorkflowId?: string;
  parentGrantId?: string;
  childGrantIds: string[];
  tags: string[];
  customAttributes: Record<string, any>;
  version: string;
  lastModified: Date;
  lastModifiedBy: string;







export interface GrantRiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: RiskFactor[];
  mitigations: RiskMitigation[];
  residualRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assessmentDate: Date;
  assessorId: string;
  reviewRequired: boolean;
  nextReview: Date;







export interface RiskFactor {
  category: 'DATA_SENSITIVITY' | 'USER_PRIVILEGE' | 'ACCESS_SCOPE' | 'TIME_DURATION' | 'CONTEXT' | 'COMPLIANCE';
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 1-100
  mitigated: boolean;







export interface RiskMitigation {
  riskFactorId: string;
  strategy: 'AVOID' | 'MITIGATE' | 'TRANSFER' | 'ACCEPT';
  description: string;
  implementation: string[];
  effectiveness: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
  cost: 'LOW' | 'MEDIUM' | 'HIGH';
  timeline: string;
  responsible: string;
  verified: boolean;
  verificationDate?: Date;







export interface GrantCreationRequest {
  requestId?: string;
  granteeId: string;
  permissions: Omit<GrantedPermission, 'riskLevel' | 'auditLevel'>[];
  accessScope: Omit<AccessScope, 'contextualRestrictions'>;
  timeWindow: Omit<GrantTimeWindow, 'allowedHours' | 'blackoutPeriods'>;
  conditions?: Omit<AccessCondition, 'id' | 'enforced'>[];
  businessJustification: string;
  technicalJustification: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  monitoring?: Partial<GrantMonitoring>;
  security?: Partial<GrantSecurity>;
  customAttributes?: Record<string, any>;







export interface GrantRevocationRequest {
  grantId: string;
  reason: string;
  immediate: boolean;
  revokedBy: string;
  notifyGrantee: boolean;
  auditRequired: boolean;







export interface GrantExtensionRequest {
  grantId: string;
  requestedBy: string;
  extensionDuration: number; // hours
  justification: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approverRequired: boolean;







export interface GrantValidationResult {
  valid: boolean;
  violations: GrantValidationViolation[];
  warnings: GrantValidationWarning[];
  riskScore: number;
  recommendations: string[];







export interface GrantValidationViolation {
  type: 'SCOPE_VIOLATION' | 'TIME_VIOLATION' | 'CONDITION_VIOLATION' | 'SECURITY_VIOLATION' | 'COMPLIANCE_VIOLATION';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  blockingViolation: boolean;
  remediation: string[];







export interface GrantValidationWarning {
  type: 'RISK_WARNING' | 'COMPLIANCE_WARNING' | 'SECURITY_WARNING' | 'PERFORMANCE_WARNING';
  description: string;
  impact: string;
  recommendation: string;







export interface GrantSearchFilters {
  granteeId?: string;
  granterId?: string;
  status?: GrantStatus[];
  permissions?: DataOperation[];
  classifications?: DataClassificationLevel[];
  createdAfter?: Date;
  createdBefore?: Date;
  expiresAfter?: Date;
  expiresBefore?: Date;
  riskLevel?: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  tags?: string[];
  emergencyGrants?: boolean;
  activeOnly?: boolean;







export interface GrantAnalytics {
  totalGrants: number;
  activeGrants: number;
  expiredGrants: number;
  revokedGrants: number;
  grantsByStatus: Record<GrantStatus, number>;
  grantsByRisk: Record<string, number>;
  grantsByClassification: Record<DataClassificationLevel, number>;
  averageGrantDuration: number; // hours
  violationRate: number; // percentage
  complianceScore: number; // percentage
  topGrantees: GranteeStatistics[];
  topGranters: GranterStatistics[];
  recentActivity: GrantActivity[];







export interface GranteeStatistics {
  granteeId: string;
  granteeName: string;
  totalGrants: number;
  activeGrants: number;
  violationCount: number;
  riskScore: number;
  lastActivity: Date;







export interface GranterStatistics {
  granterId: string;
  granterName: string;
  grantsIssued: number;
  grantsRevoked: number;
  averageGrantDuration: number;
  riskAssessmentAccuracy: number;







export interface GrantActivity {
  timestamp: Date;
  grantId: string;
  activity: 'CREATED' | 'ACTIVATED' | 'USED' | 'EXTENDED' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
  userId: string;
  details: Record<string, any>;





/**
 * Temporary Access Grant Service
 * 
 * Manages the complete lifecycle of temporary access grants including:
 * - Grant creation and approval
 * - Time-based activation and expiration
 * - Real-time monitoring and compliance
 * - Automatic revocation and cleanup
 * - Security and audit logging
 */
export class TemporaryAccessGrantService extends EventEmitter {
  private grants: Map<string, TemporaryAccessGrant> = new Map();
  private grantTokens: Map<string, AccessToken> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private monitoringInterval: NodeJS.Timeout;
  private auditService: AuditService;
  private dataAccessControl: DataAccessControlService;
  private workflowService: AccessRequestWorkflowService;

  constructor(
    auditService?: AuditService,
    dataAccessControl?: DataAccessControlService,
    workflowService?: AccessRequestWorkflowService
  ) {
    super();
    
    this.auditService = auditService || new AuditService();
    this.dataAccessControl = dataAccessControl || new DataAccessControlService();
    this.workflowService = workflowService || new AccessRequestWorkflowService();

    // Start cleanup and monitoring processes
    this.startCleanupProcess();
    this.startMonitoringProcess();


  /**
   * Create a new temporary access grant
   */
  async createTemporaryGrant(
    request: GrantCreationRequest,
    granterId: string,
    granterContext: OperationContext
  ): Promise<TemporaryAccessGrant> {

    try {
      // Validate the grant request
      const validation = await this.validateGrantRequest(request);
      if (!validation.valid) {
        const blockingViolations = validation.violations.filter(v => v.blockingViolation);
        if (blockingViolations.length > 0) {
          throw new Error(`Grant validation failed: ${blockingViolations.map(v => v.description).join(', ')}`);



      // Generate grant ID
      const grantId = `grant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Perform risk assessment
      const riskAssessment = await this.assessGrantRisk(request, granterId);

      // Create the grant object
      const grant: TemporaryAccessGrant = {
        id: grantId,
        requestId: request.requestId,
        granteeId: request.granteeId,
        granteeName: await this.getUserName(request.granteeId),
        granteeEmail: await this.getUserEmail(request.granteeId),
        granterId,
        granterName: await this.getUserName(granterId),
        permissions: request.permissions.map(p => ({
          ...p,
          riskLevel: this.calculatePermissionRisk(p, request.accessScope),
          auditLevel: this.determineAuditLevel(p, riskAssessment.overallRisk)
        })),
        accessScope: {
          ...request.accessScope,
          contextualRestrictions: await this.buildContextualRestrictions(request, riskAssessment)

        timeWindow: {
          ...request.timeWindow,
          allowedHours: await this.getDefaultAllowedHours(riskAssessment.overallRisk),
          blackoutPeriods: await this.getApplicableBlackoutPeriods(
            request.timeWindow.startTime,
            request.timeWindow.endTime

        conditions: request.conditions?.map((c, index) => ({
          ...c,
          id: `condition_${index}`,
          enforced: true
        })) || [],
        status: 'PENDING_ACTIVATION',
        usage: {
          totalRequests: 0,
          successfulRequests: 0,
          deniedRequests: 0,
          sessionsStarted: 0,
          activeSessions: 0,
          dataVolumeAccessed: 0,
          operationCounts: {} as Record<DataOperation, number>,
          resourcesAccessed: [],
          violationCount: 0

        monitoring: {
          enabled: true,
          realTimeTracking: riskAssessment.overallRisk === 'HIGH' || riskAssessment.overallRisk === 'CRITICAL',
          alertThresholds: await this.buildAlertThresholds(riskAssessment),
          anomalyDetection: await this.buildAnomalyDetectionConfig(riskAssessment),
          complianceChecks: await this.buildComplianceChecks(request.permissions),
          reportingFrequency: this.determineReportingFrequency(riskAssessment.overallRisk),
          retentionPeriod: await this.getRetentionPeriod(request.permissions),
          ...request.monitoring

        security: {
          encryptionRequired: true,
          keyRotationInterval: riskAssessment.overallRisk === 'CRITICAL' ? 1 : 24,
          accessTokens: [],
          signatureRequired: riskAssessment.overallRisk === 'HIGH' || riskAssessment.overallRisk === 'CRITICAL',
          integrityChecks: true,
          tamperDetection: true,
          secureChannelRequired: true,
          certificateBasedAuth: riskAssessment.overallRisk === 'CRITICAL',
          ...request.security

        compliance: {
          frameworks: await this.getApplicableFrameworks(request.permissions),
          auditTrail: [],
          certifications: [],
          violations: [],
          attestations: []

        metadata: {
          createdBy: granterId,
          approvedBy: [],
          emergencyGrant: request.urgency === 'EMERGENCY',
          riskAssessment,
          businessJustification: request.businessJustification,
          technicalJustification: request.technicalJustification,
          approvalWorkflowId: request.requestId,
          parentGrantId: undefined,
          childGrantIds: [],
          tags: [],
          customAttributes: request.customAttributes || {},
          version: '1.0',
          lastModified: new Date(),
          lastModifiedBy: granterId

        createdAt: new Date(),
        expiresAt: request.timeWindow.endTime
      };

      // Generate access tokens
      grant.security.accessTokens = await this.generateAccessTokens(grant);

      // Store the grant
      this.grants.set(grantId, grant);

      // Log grant creation
      await this.auditService.logEvent({
        action: 'TEMPORARY_GRANT_CREATED',
        userId: granterId,
        resourceType: 'temporary_access_grant',
        resourceId: grantId,
        details: {
          granteeId: request.granteeId,
          permissions: request.permissions.map(p => p.operation),
          duration: Math.round((request.timeWindow.endTime.getTime() - Date.now()) / (1000 * 60 * 60)),
          riskLevel: riskAssessment.overallRisk

        context: granterContext,
        outcome: {
          success: true,
          statusCode: 201

      });

      // Emit grant created event
      this.emit('grant_created', {
        grant,
        granterId,
        context: granterContext
      });

      // Auto-activate if appropriate
      if (this.shouldAutoActivate(grant)) {
        await this.activateGrant(grantId, granterId, granterContext);


      return grant;
 catch (error) {
      await this.auditService.logEvent({
        action: 'TEMPORARY_GRANT_CREATION_FAILED',
        userId: granterId,
        resourceType: 'temporary_access_grant',
        resourceId: '',
        details: {
          error: error.message,
          granteeId: request.granteeId,
          permissions: request.permissions.map(p => p.operation)

        context: granterContext,
        outcome: {
          success: false,
          statusCode: 500,
          error: error.message

      });

      throw error;



  /**
   * Activate a pending grant
   */
  async activateGrant(
    grantId: string,
    activatorId: string,
    context: OperationContext
  ): Promise<void> {

    const grant = this.grants.get(grantId);
    if (!grant) {
      throw new Error('Grant not found');


    if (grant.status !== 'PENDING_ACTIVATION') {
      throw new Error(`Cannot activate grant in status: ${grant.status}`);


    // Check if grant is still valid for activation
    if (grant.expiresAt <= new Date()) {
      grant.status = 'EXPIRED';
      throw new Error('Grant has expired');


    // Validate activation conditions
    const validationResult = await this.validateGrantActivation(grant, context);
    if (!validationResult.valid) {
      const blockingViolations = validationResult.violations.filter(v => v.blockingViolation);
      if (blockingViolations.length > 0) {
        throw new Error(`Grant activation failed: ${blockingViolations.map(v => v.description).join(', ')}`);



    // Activate the grant
    grant.status = 'ACTIVE';
    grant.activatedAt = new Date();
    grant.metadata.lastModified = new Date();
    grant.metadata.lastModifiedBy = activatorId;

    // Add compliance audit entry
    grant.compliance.auditTrail.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      auditorId: activatorId,
      action: 'GRANT_ACTIVATED',
      framework: 'INTERNAL',
      requirement: 'ACTIVATION_AUDIT',
      result: 'PASS',
      details: { activatorId, grantId },
      evidence: []
    });

    // Log activation
    await this.auditService.logEvent({
      action: 'TEMPORARY_GRANT_ACTIVATED',
      userId: activatorId,
      resourceType: 'temporary_access_grant',
      resourceId: grantId,
      details: {
        granteeId: grant.granteeId,
        permissions: grant.permissions.map(p => p.operation),
        duration: Math.round((grant.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))

      context,
      outcome: {
        success: true,
        statusCode: 200

    });

    // Emit activation event
    this.emit('grant_activated', {
      grant,
      activatorId,
      context
    });


  /**
   * Validate access using a temporary grant
   */
  async validateAccess(
    grantId: string,
    operation: DataOperation,
    resourceId: string,
    context: OperationContext
  ): Promise<GrantValidationResult> {

    const grant = this.grants.get(grantId);
    if (!grant) {
      return {
        valid: false,
        violations: [{
          type: 'SCOPE_VIOLATION',
          description: 'Grant not found',
          severity: 'CRITICAL',
          blockingViolation: true,
          remediation: ['Verify grant ID', 'Check grant status']
],
        warnings: [],
        riskScore: 100,
        recommendations: ['Contact administrator']
      };


    // Check grant status
    if (grant.status !== 'ACTIVE') {
      return {
        valid: false,
        violations: [{
          type: 'SCOPE_VIOLATION',
          description: `Grant is not active: ${grant.status}`,
          severity: 'HIGH',
          blockingViolation: true,
          remediation: ['Activate grant if pending', 'Request new grant if expired/revoked']
],
        warnings: [],
        riskScore: 90,
        recommendations: ['Request grant activation or new grant']
      };


    // Check expiration
    if (grant.expiresAt <= new Date()) {
      grant.status = 'EXPIRED';
      return {
        valid: false,
        violations: [{
          type: 'TIME_VIOLATION',
          description: 'Grant has expired',
          severity: 'HIGH',
          blockingViolation: true,
          remediation: ['Request grant extension', 'Create new grant']
],
        warnings: [],
        riskScore: 85,
        recommendations: ['Request new access grant']
      };


    const violations: GrantValidationViolation[] = [];
    const warnings: GrantValidationWarning[] = [];
    let riskScore = 0;

    // Validate operation permissions
    const hasPermission = grant.permissions.some(p => 
      p.operation === operation && 
      this.resourceMatchesScope(resourceId, grant.accessScope, p)
    );

    if (!hasPermission) {
      violations.push({
        type: 'SCOPE_VIOLATION',
        description: `Operation ${operation} not permitted for resource ${resourceId}`,
        severity: 'HIGH',
        blockingViolation: true,
        remediation: ['Request additional permissions', 'Use different operation']
      });
      riskScore += 30;


    // Validate time window
    const timeValidation = await this.validateTimeWindow(grant.timeWindow, context);
    if (!timeValidation.valid) {
      violations.push({
        type: 'TIME_VIOLATION',
        description: timeValidation.reason,
        severity: 'MEDIUM',
        blockingViolation: true,
        remediation: ['Wait for allowed time window', 'Request time exception']
      });
      riskScore += 20;


    // Validate conditions
    for (const condition of grant.conditions) {
      const conditionValidation = await this.validateCondition(condition, context);
      if (!conditionValidation.valid) {
        violations.push({
          type: 'CONDITION_VIOLATION',
          description: `Condition ${condition.type} not met: ${conditionValidation.reason}`,
          severity: condition.required ? 'HIGH' : 'MEDIUM',
          blockingViolation: condition.required,
          remediation: conditionValidation.remediation
        });
        riskScore += condition.required ? 25 : 10;



    // Validate rate limits
    const rateLimitValidation = await this.validateRateLimits(grant, operation, context);
    if (!rateLimitValidation.valid) {
      violations.push({
        type: 'SCOPE_VIOLATION',
        description: `Rate limit exceeded: ${rateLimitValidation.reason}`,
        severity: 'MEDIUM',
        blockingViolation: true,
        remediation: ['Wait for rate limit reset', 'Optimize access patterns']
      });
      riskScore += 15;


    // Check for anomalies
    const anomalyDetection = await this.detectAnomalies(grant, operation, resourceId, context);
    if (anomalyDetection.anomalyDetected) {
      warnings.push({
        type: 'SECURITY_WARNING',
        description: `Anomalous access pattern detected: ${anomalyDetection.description}`,
        impact: 'Potential security risk',
        recommendation: 'Review access pattern and verify legitimate use'
      });
      riskScore += 10;


    // Update usage statistics if access is valid
    if (violations.filter(v => v.blockingViolation).length === 0) {
      await this.updateUsageStatistics(grant, operation, resourceId, context);


    return {
      valid: violations.filter(v => v.blockingViolation).length === 0,
      violations,
      warnings,
      riskScore,
      recommendations: this.generateRecommendations(violations, warnings, grant)
    };


  /**
   * Revoke a temporary grant
   */
  async revokeGrant(
    request: GrantRevocationRequest,
    context: OperationContext
  ): Promise<void> {

    const grant = this.grants.get(request.grantId);
    if (!grant) {
      throw new Error('Grant not found');


    if (grant.status === 'REVOKED') {
      throw new Error('Grant is already revoked');


    // Immediate revocation or scheduled?
    if (request.immediate) {
      grant.status = 'REVOKED';
      grant.revokedAt = new Date();
 else {
      // Schedule revocation
      grant.status = 'SUSPENDED';


    grant.metadata.lastModified = new Date();
    grant.metadata.lastModifiedBy = request.revokedBy;

    // Revoke all access tokens
    for (const token of grant.security.accessTokens) {
      if (!token.revoked) {
        token.revoked = true;
        token.revokedAt = new Date();



    // Add compliance audit entry
    grant.compliance.auditTrail.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      auditorId: request.revokedBy,
      action: 'GRANT_REVOKED',
      framework: 'INTERNAL',
      requirement: 'REVOCATION_AUDIT',
      result: 'PASS',
      details: { 
        reason: request.reason,
        immediate: request.immediate,
        revokedBy: request.revokedBy

      evidence: []
    });

    // Log revocation
    await this.auditService.logEvent({
      action: 'TEMPORARY_GRANT_REVOKED',
      userId: request.revokedBy,
      resourceType: 'temporary_access_grant',
      resourceId: request.grantId,
      details: {
        reason: request.reason,
        immediate: request.immediate,
        granteeId: grant.granteeId

      context,
      outcome: {
        success: true,
        statusCode: 200

    });

    // Emit revocation event
    this.emit('grant_revoked', {
      grant,
      reason: request.reason,
      revokedBy: request.revokedBy,
      immediate: request.immediate,
      context
    });

    // Notify grantee if requested
    if (request.notifyGrantee) {
      this.emit('grant_revoked_notification', {
        granteeId: grant.granteeId,
        grantId: request.grantId,
        reason: request.reason,
        revokedBy: request.revokedBy
      });



  /**
   * Extend a temporary grant
   */
  async extendGrant(
    request: GrantExtensionRequest,
    context: OperationContext
  ): Promise<TemporaryAccessGrant> {

    const grant = this.grants.get(request.grantId);
    if (!grant) {
      throw new Error('Grant not found');


    if (grant.status !== 'ACTIVE') {
      throw new Error(`Cannot extend grant in status: ${grant.status}`);


    if (!grant.timeWindow.extendable) {
      throw new Error('Grant is not extendable');


    // Check extension limits
    const currentExtensions = grant.compliance.auditTrail.filter(
      entry => entry.action === 'GRANT_EXTENDED'
    ).length;

    if (currentExtensions >= grant.timeWindow.maxExtensions) {
      throw new Error('Maximum extensions reached');


    // Require approval for high-risk extensions
    if (request.approverRequired && request.urgency !== 'CRITICAL') {
      // Integration with workflow service would go here
      throw new Error('Extension requires approval - not implemented in this example');


    // Calculate new expiration time
    const extensionMs = request.extensionDuration * 60 * 60 * 1000;
    const newExpirationTime = new Date(grant.expiresAt.getTime() + extensionMs);

    // Update grant
    grant.expiresAt = newExpirationTime;
    grant.metadata.lastModified = new Date();
    grant.metadata.lastModifiedBy = request.requestedBy;

    // Add compliance audit entry
    grant.compliance.auditTrail.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      auditorId: request.requestedBy,
      action: 'GRANT_EXTENDED',
      framework: 'INTERNAL',
      requirement: 'EXTENSION_AUDIT',
      result: 'PASS',
      details: { 
        extensionDuration: request.extensionDuration,
        justification: request.justification,
        newExpirationTime: newExpirationTime.toISOString()

      evidence: []
    });

    // Log extension
    await this.auditService.logEvent({
      action: 'TEMPORARY_GRANT_EXTENDED',
      userId: request.requestedBy,
      resourceType: 'temporary_access_grant',
      resourceId: request.grantId,
      details: {
        extensionHours: request.extensionDuration,
        justification: request.justification,
        newExpiration: newExpirationTime

      context,
      outcome: {
        success: true,
        statusCode: 200

    });

    // Emit extension event
    this.emit('grant_extended', {
      grant,
      extensionDuration: request.extensionDuration,
      requestedBy: request.requestedBy,
      context
    });

    return grant;


  /**
   * Get grant by ID
   */
  async getGrant(grantId: string): Promise<TemporaryAccessGrant | null> {

    return this.grants.get(grantId) || null;


  /**
   * Search grants with filters
   */
  async searchGrants(filters: GrantSearchFilters): Promise<TemporaryAccessGrant[]> {

    const grants = Array.from(this.grants.values());
    
    return grants.filter(grant => {
      if (filters.granteeId && grant.granteeId !== filters.granteeId) {
        return false;

      
      if (filters.granterId && grant.granterId !== filters.granterId) {
        return false;

      
      if (filters.status && !filters.status.includes(grant.status)) {
        return false;

      
      if (filters.permissions && !filters.permissions.some(p => 
        grant.permissions.some(gp => gp.operation === p)
      )) {
        return false;

      
      if (filters.classifications && !filters.classifications.some(c => 
        grant.permissions.some(gp => gp.dataClassification === c)
      )) {
        return false;

      
      if (filters.createdAfter && grant.createdAt < filters.createdAfter) {
        return false;

      
      if (filters.createdBefore && grant.createdAt > filters.createdBefore) {
        return false;

      
      if (filters.expiresAfter && grant.expiresAt < filters.expiresAfter) {
        return false;

      
      if (filters.expiresBefore && grant.expiresAt > filters.expiresBefore) {
        return false;

      
      if (filters.riskLevel && !filters.riskLevel.includes(grant.metadata.riskAssessment.overallRisk)) {
        return false;

      
      if (filters.emergencyGrants !== undefined && grant.metadata.emergencyGrant !== filters.emergencyGrants) {
        return false;

      
      if (filters.activeOnly && grant.status !== 'ACTIVE') {
        return false;

      
      return true;
    });


  /**
   * Get analytics for grants
   */
  async getGrantAnalytics(
    timeframe?: { start: Date; end: Date }
  ): Promise<GrantAnalytics> {

    const grants = Array.from(this.grants.values());
    const filteredGrants = timeframe 
      ? grants.filter(g => g.createdAt >= timeframe.start && g.createdAt <= timeframe.end)
      : grants;

    const analytics: GrantAnalytics = {
      totalGrants: filteredGrants.length,
      activeGrants: filteredGrants.filter(g => g.status === 'ACTIVE').length,
      expiredGrants: filteredGrants.filter(g => g.status === 'EXPIRED').length,
      revokedGrants: filteredGrants.filter(g => g.status === 'REVOKED').length,
      grantsByStatus: {} as Record<GrantStatus, number>,
      grantsByRisk: {},
      grantsByClassification: {} as Record<DataClassificationLevel, number>,
      averageGrantDuration: 0,
      violationRate: 0,
      complianceScore: 0,
      topGrantees: [],
      topGranters: [],
      recentActivity: []
    };

    // Calculate status distribution
    for (
      const status of ['PENDING_ACTIVATION',
      'ACTIVE',
      'SUSPENDED',
      'EXPIRED',
      'REVOKED',
      'USED_UP',
      'FAILED_CONDITIONS'] as GrantStatus[]
    ) {
      analytics.grantsByStatus[status] = filteredGrants.filter(g => g.status === status).length;


    // Calculate risk distribution
    for (const risk of ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) {
      analytics.grantsByRisk[risk] = filteredGrants.filter(g => g.metadata.riskAssessment.overallRisk === risk).length;


    // Calculate classification distribution
    for (const classification of ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] as DataClassificationLevel[]) {
      analytics.grantsByClassification[classification] = filteredGrants.filter(g => 
        g.permissions.some(p => p.dataClassification === classification)
      ).length;


    // Calculate average grant duration
    const durations = filteredGrants.map(g => 
      (g.expiresAt.getTime() - g.createdAt.getTime()) / (1000 * 60 * 60)
    );
    analytics.averageGrantDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;

    // Calculate violation rate
    const totalViolations = filteredGrants.reduce((sum, g) => sum + g.usage.violationCount, 0);
    const totalRequests = filteredGrants.reduce((sum, g) => sum + g.usage.totalRequests, 0);
    analytics.violationRate = totalRequests > 0 ? (totalViolations / totalRequests) * 100 : 0;

    // Calculate compliance score
    const compliantGrants = filteredGrants.filter(g => g.usage.violationCount === 0).length;
    analytics.complianceScore = filteredGrants.length > 0 
      ? (compliantGrants / filteredGrants.length) * 100 
      : 100;

    return analytics;


  // Helper methods

  private async validateGrantRequest(request: GrantCreationRequest): Promise<GrantValidationResult> {

    const violations: GrantValidationViolation[] = [];
    const warnings: GrantValidationWarning[] = [];
    let riskScore = 0;

    // Validate grantee exists
    const granteeExists = await this.userExists(request.granteeId);
    if (!granteeExists) {
      violations.push({
        type: 'SCOPE_VIOLATION',
        description: 'Grantee user not found',
        severity: 'CRITICAL',
        blockingViolation: true,
        remediation: ['Verify user ID', 'Check user status']
      });
      riskScore += 30;


    // Validate time window
    if (request.timeWindow.endTime <= new Date()) {
      violations.push({
        type: 'TIME_VIOLATION',
        description: 'Grant expiration time is in the past',
        severity: 'HIGH',
        blockingViolation: true,
        remediation: ['Set future expiration time']
      });
      riskScore += 25;


    // Validate permissions
    for (const permission of request.permissions) {
      if (!this.isValidOperation(permission.operation)) {
        violations.push({
          type: 'SCOPE_VIOLATION',
          description: `Invalid operation: ${permission.operation}`,
          severity: 'HIGH',
          blockingViolation: true,
          remediation: ['Use valid operation type']
        });
        riskScore += 20;


      if (permission.dataClassification === 'RESTRICTED') {
        warnings.push({
          type: 'RISK_WARNING',
          description: 'Grant includes access to RESTRICTED data',
          impact: 'High security risk',
          recommendation: 'Add additional monitoring and conditions'
        });
        riskScore += 15;



    return {
      valid: violations.filter(v => v.blockingViolation).length === 0,
      violations,
      warnings,
      riskScore,
      recommendations: this.generateRecommendations(violations, warnings)
    };


  private async assessGrantRisk(
    request: GrantCreationRequest,
    granterId: string
  ): Promise<GrantRiskAssessment> {

    const riskFactors: RiskFactor[] = [];
    
    // Assess data sensitivity
    const hasRestrictedData = request.permissions.some(p => p.dataClassification === 'RESTRICTED');
    if (hasRestrictedData) {
      riskFactors.push({
        category: 'DATA_SENSITIVITY',
        description: 'Access includes RESTRICTED classification data',
        impact: 'CRITICAL',
        likelihood: 'HIGH',
        score: 85,
        mitigated: false
      });


    // Assess permission scope
    const highRiskOperations = request.permissions.filter(p => 
      ['DELETE', 'PURGE', 'EXPORT', 'SHARE'].includes(p.operation)
    );
    if (highRiskOperations.length > 0) {
      riskFactors.push({
        category: 'ACCESS_SCOPE',
        description: 'Grant includes high-risk operations',
        impact: 'HIGH',
        likelihood: 'MEDIUM',
        score: 70,
        mitigated: false
      });


    // Assess time duration
    const durationHours = (request.timeWindow.endTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (durationHours > 168) { // More than a week
      riskFactors.push({
        category: 'TIME_DURATION',
        description: 'Grant duration exceeds one week',
        impact: 'MEDIUM',
        likelihood: 'HIGH',
        score: 60,
        mitigated: false
      });


    // Calculate overall risk
    const totalScore = riskFactors.reduce((sum, factor) => sum + factor.score, 0);
    const averageScore = riskFactors.length > 0 ? totalScore / riskFactors.length : 20;
    
    let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (averageScore >= 80) overallRisk = 'CRITICAL';
    else if (averageScore >= 60) overallRisk = 'HIGH';
    else if (averageScore >= 40) overallRisk = 'MEDIUM';
    else overallRisk = 'LOW';

    return {
      overallRisk,
      riskFactors,
      mitigations: [],
      residualRisk: overallRisk,
      assessmentDate: new Date(),
      assessorId: granterId,
      reviewRequired: overallRisk === 'HIGH' || overallRisk === 'CRITICAL',
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };


  private calculatePermissionRisk(
    permission: Omit<GrantedPermission, 'riskLevel' | 'auditLevel'>,
    scope: Omit<AccessScope, 'contextualRestrictions'>
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let riskScore = 0;

    // Data classification risk
    switch (permission.dataClassification) {
    case 'RESTRICTED': riskScore += 40; break;
    case 'CONFIDENTIAL': riskScore += 25; break;
    case 'INTERNAL': riskScore += 10; break;
    case 'PUBLIC': riskScore += 0; break;


    // Operation risk
    switch (permission.operation) {
    case 'DELETE':
    case 'PURGE': riskScore += 30; break;
    case 'EXPORT':
    case 'SHARE': riskScore += 25; break;
    case 'WRITE':
    case 'UPDATE': riskScore += 15; break;
    case 'read': riskScore += 5; break;
    default: riskScore += 10; break;


    // Scope risk
    if (scope.type === 'GLOBAL') riskScore += 20;
    else if (scope.type === 'DEPARTMENT') riskScore += 10;

    if (riskScore >= 70) return 'CRITICAL';
    if (riskScore >= 50) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';


  private determineAuditLevel(
    permission: Omit<GrantedPermission, 'riskLevel' | 'auditLevel'>,
    overallRisk: string
  ): 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE' | 'REALTIME' {
    if (overallRisk === 'CRITICAL' || permission.dataClassification === 'RESTRICTED') {
      return 'REALTIME';

    if (overallRisk === 'HIGH' || permission.dataClassification === 'CONFIDENTIAL') {
      return 'COMPREHENSIVE';

    if (overallRisk === 'MEDIUM') {
      return 'ENHANCED';

    return 'STANDARD';


  private async buildContextualRestrictions(
    request: GrantCreationRequest,
    riskAssessment: GrantRiskAssessment
  ): Promise<ContextualRestriction[]> {

    const restrictions: ContextualRestriction[] = [];

    // Add location restrictions for high-risk grants
    if (riskAssessment.overallRisk === 'HIGH' || riskAssessment.overallRisk === 'CRITICAL') {
      restrictions.push({
        type: 'LOCATION',
        specification: {
          attribute: 'country',
          operator: 'IN',
          value: ['US', 'CA', 'GB'],
          tolerance: 0

        enforcement: 'STRICT',
        fallbackBehavior: 'DENY'
      });


    // Add network restrictions
    restrictions.push({
      type: 'NETWORK',
      specification: {
        attribute: 'vpn_required',
        operator: 'EQUALS',
        value: true,
        tolerance: 0

      enforcement: riskAssessment.overallRisk === 'CRITICAL' ? 'STRICT' : 'FLEXIBLE',
      fallbackBehavior: 'WARN'
    });

    return restrictions;


  private async getDefaultAllowedHours(riskLevel: string): Promise<TimeRange[]> {

    if (riskLevel === 'CRITICAL') {
      // Business hours only for critical risk
      return [{
        startHour: 9,
        endHour: 17,
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        exceptions: []
];

    
    // 24/7 for lower risk levels
    return [{
      startHour: 0,
      endHour: 23,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      exceptions: []
];


  private async getApplicableBlackoutPeriods(
    startTime?: Date,
    endTime?: Date
  ): Promise<BlackoutPeriod[]> {

    // In a real implementation, this would fetch from a blackout period service
    return [];


  private async buildAlertThresholds(
    riskAssessment: GrantRiskAssessment
  ): Promise<AlertThreshold[]> {

    const thresholds: AlertThreshold[] = [];

    // Request rate threshold
    thresholds.push({
      metric: 'requests_per_hour',
      operator: 'GREATER_THAN',
      value: riskAssessment.overallRisk === 'CRITICAL' ? 50 : 100,
      timeWindow: 60,
      severity: 'WARNING',
      action: 'ALERT',
      recipients: ['security-team@company.com']
    });

    // Violation threshold
    thresholds.push({
      metric: 'violations_per_day',
      operator: 'GREATER_THAN',
      value: 3,
      timeWindow: 1440,
      severity: 'CRITICAL',
      action: 'SUSPEND',
      recipients: ['security-team@company.com', 'compliance@company.com']
    });

    return thresholds;


  private async buildAnomalyDetectionConfig(
    riskAssessment: GrantRiskAssessment
  ): Promise<AnomalyDetectionConfig> {

    return {
      enabled: riskAssessment.overallRisk === 'HIGH' || riskAssessment.overallRisk === 'CRITICAL',
      sensitivity: riskAssessment.overallRisk === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      baselineWindow: 24,
      detectionMethods: [
        {
          type: 'STATISTICAL',
          configuration: { threshold: 2.5 },
          weight: 0.4

        {
          type: 'BEHAVIORAL',
          configuration: { pattern_analysis: true },
          weight: 0.6

      ],
      responseActions: [
        {
          trigger: 'ANOMALY_DETECTED',
          action: 'LOG',
          parameters: {},
          automatic: true

        {
          trigger: 'ANOMALY_SEVERE',
          action: 'SUSPEND',
          parameters: {},
          automatic: riskAssessment.overallRisk === 'CRITICAL'

      ]
    };


  private async buildComplianceChecks(
    permissions: Omit<GrantedPermission, 'riskLevel' | 'auditLevel'>[]
  ): Promise<ComplianceCheck[]> {

    const checks: ComplianceCheck[] = [];

    // GDPR check for personal data access
    if (permissions.some(p => p.dataClassification === 'CONFIDENTIAL' || p.dataClassification === 'RESTRICTED')) {
      checks.push({
        framework: 'GDPR',
        requirement: 'Article 32 - Security of processing',
        frequency: 'CONTINUOUS',
        automatedCheck: true,
        checkFunction: 'validateGDPRCompliance',
        remediationActions: ['Enable encryption', 'Add audit logging', 'Implement access controls']
      });


    return checks;


  private determineReportingFrequency(riskLevel: string): 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' {
    switch (riskLevel) {
    case 'CRITICAL': return 'REALTIME';
    case 'HIGH': return 'HOURLY';
    case 'MEDIUM': return 'DAILY';
    default: return 'WEEKLY';



  private async getRetentionPeriod(
    permissions: Omit<GrantedPermission, 'riskLevel' | 'auditLevel'>[]
  ): Promise<number> {

    const hasRestrictedData = permissions.some(p => p.dataClassification === 'RESTRICTED');
    return hasRestrictedData ? 2555 : 365; // 7 years for restricted, 1 year for others


  private async getApplicableFrameworks(
    permissions: Omit<GrantedPermission, 'riskLevel' | 'auditLevel'>[]
  ): Promise<ComplianceFramework[]> {

    const frameworks: ComplianceFramework[] = [];

    // Add GDPR for EU data
    if (permissions.some(p => p.dataClassification === 'CONFIDENTIAL' || p.dataClassification === 'RESTRICTED')) {
      frameworks.push({
        name: 'GDPR',
        version: '2018',
        requirements: [
          {
            id: 'GDPR-32',
            description: 'Security of processing',
            mandatory: true,
            status: 'MET',
            evidence: ['encryption_enabled', 'access_controls'],
            lastVerified: new Date()

        ],
        assessmentDate: new Date(),
        assessorId: 'system',
        status: 'COMPLIANT',
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });


    return frameworks;


  private async generateAccessTokens(grant: TemporaryAccessGrant): Promise<AccessToken[]> {

    const tokens: AccessToken[] = [];

    // Generate JWT token
    const jwtToken: AccessToken = {
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'JWT',
      value: `jwt.${Buffer.from(JSON.stringify({
        grantId: grant.id,
        granteeId: grant.granteeId,
        permissions: grant.permissions.map(p => p.operation),
        expiresAt: grant.expiresAt.toISOString()
      })).toString('base64')}.signature`,
      createdAt: new Date(),
      expiresAt: grant.expiresAt,
      scope: grant.permissions.map(p => `${p.operation}:${p.dataClassification}`),
      issuedBy: grant.granterId,
      revoked: false,
      usage: {
        requestCount: 0,
        sourceIPs: [],
        userAgents: [],
        errors: []

    };

    tokens.push(jwtToken);
    return tokens;


  private shouldAutoActivate(grant: TemporaryAccessGrant): boolean {
    // Auto-activate low-risk grants
    return grant.metadata.riskAssessment.overallRisk === 'LOW' || 
           grant.metadata.riskAssessment.overallRisk === 'MEDIUM';


  private async validateGrantActivation(
    grant: TemporaryAccessGrant,
    context: OperationContext
  ): Promise<GrantValidationResult> {

    const violations: GrantValidationViolation[] = [];
    const warnings: GrantValidationWarning[] = [];

    // Check time validity
    if (grant.expiresAt <= new Date()) {
      violations.push({
        type: 'TIME_VIOLATION',
        description: 'Grant has expired',
        severity: 'CRITICAL',
        blockingViolation: true,
        remediation: ['Request new grant']
      });


    // Check conditions
    for (const condition of grant.conditions) {
      const conditionValidation = await this.validateCondition(condition, context);
      if (!conditionValidation.valid) {
        violations.push({
          type: 'CONDITION_VIOLATION',
          description: `Activation condition not met: ${condition.type}`,
          severity: 'HIGH',
          blockingViolation: true,
          remediation: ['Satisfy activation conditions']
        });



    return {
      valid: violations.filter(v => v.blockingViolation).length === 0,
      violations,
      warnings,
      riskScore: violations.length * 25,
      recommendations: []
    };


  private resourceMatchesScope(
    resourceId: string,
    scope: AccessScope,
    _____permission: GrantedPermission
  ): boolean {
    // Check if resource is in the allowed targets
    const matchesTarget = scope.targets.some(target => {
      switch (target.type) {
      case 'RESOURCE_ID':
        return target.value === resourceId;
      case 'RESOURCE_PATTERN':
        return new RegExp(target.value).test(resourceId);
      default:
        return false;

    });

    // Check if resource is excluded
    const isExcluded = scope.exclusions.some(exclusion => {
      switch (exclusion.type) {
      case 'RESOURCE_ID':
        return exclusion.value === resourceId;
      case 'RESOURCE_PATTERN':
        return new RegExp(exclusion.value).test(resourceId);
      default:
        return false;

    });

    return matchesTarget && !isExcluded;


  private async validateTimeWindow(
    timeWindow: GrantTimeWindow,
    _____context: OperationContext
  ): Promise<{ valid: boolean; reason?: string }> {

    const now = new Date();
    
    // Check if grant has expired
    if (now > timeWindow.endTime) {
      return { valid: false, reason: 'Grant has expired' };


    // Check if grant has started
    if (timeWindow.startTime && now < timeWindow.startTime) {
      return { valid: false, reason: 'Grant has not yet started' };


    // Check allowed hours
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const isAllowedTime = timeWindow.allowedHours.some(range => 
      range.daysOfWeek.includes(currentDay) &&
      currentHour >= range.startHour &&
      currentHour <= range.endHour
    );

    if (!isAllowedTime) {
      return { valid: false, reason: 'Current time is outside allowed hours' };


    // Check blackout periods
    const isBlackedOut = timeWindow.blackoutPeriods.some(period =>
      now >= period.start && now <= period.end
    );

    if (isBlackedOut) {
      return { valid: false, reason: 'Current time is within a blackout period' };


    return { valid: true };


  private async validateCondition(
    condition: AccessCondition,
    context: OperationContext
  ): Promise<{ valid: boolean; reason?: string; remediation?: string[] }> {

    switch (condition.type) {
    case 'MFA_REQUIRED':
      // Check if MFA was used in this session
      const mfaUsed = context.sessionId && context.sessionId.includes('mfa');
      return {
        valid: mfaUsed,
        reason: mfaUsed ? undefined : 'Multi-factor authentication required',
        remediation: ['Complete MFA challenge']
      };

    case 'VPN_REQUIRED':
      // Check if request comes from VPN
      const isVPN = context.ipAddress?.startsWith('10.') || context.ipAddress?.startsWith('172.16.');
      return {
        valid: isVPN,
        reason: isVPN ? undefined : 'VPN connection required',
        remediation: ['Connect to corporate VPN']
      };

    case 'DEVICE_TRUSTED':
      // Check if device is trusted (simplified check)
      const isTrusted = context.userAgent?.includes('TrustedDevice');
      return {
        valid: isTrusted,
        reason: isTrusted ? undefined : 'Trusted device required',
        remediation: ['Use a trusted device', 'Register current device']
      };

    default:
      return { valid: true };



  private async validateRateLimits(
    grant: TemporaryAccessGrant,
    operation: DataOperation,
    _____context: OperationContext
  ): Promise<{ valid: boolean; reason?: string }> {

    const permission = grant.permissions.find(p => p.operation === operation);
    if (!permission) {
      return { valid: false, reason: 'Operation not permitted' };


    // Check rate limits (simplified implementation)
    for (const rateLimit of permission.rateLimits) {
      if (rateLimit.type === 'REQUESTS_PER_MINUTE') {
        const recentRequests = grant.usage.totalRequests; // Simplified
        if (recentRequests >= rateLimit.limit) {
          return { valid: false, reason: `Rate limit exceeded: ${rateLimit.limit} requests per minute` };




    return { valid: true };


  private async detectAnomalies(
    grant: TemporaryAccessGrant,
    _____operation: DataOperation,
    _____resourceId: string,
    _____context: OperationContext
  ): Promise<{ anomalyDetected: boolean; description?: string }> {

    if (!grant.monitoring.anomalyDetection.enabled) {
      return { anomalyDetected: false };


    // Simple anomaly detection rules
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - grant.createdAt.getTime()) / (1000 * 60 * 60);
    
    // Detect rapid usage pattern
    if (grant.usage.totalRequests > 100 && hoursSinceCreation < 1) {
      return {
        anomalyDetected: true,
        description: 'Unusually high request rate detected'
      };


    // Detect unusual time access
    const currentHour = now.getHours();
    if (currentHour < 6 || currentHour > 22) {
      return {
        anomalyDetected: true,
        description: 'Access during unusual hours detected'
      };


    return { anomalyDetected: false };


  private async updateUsageStatistics(
    grant: TemporaryAccessGrant,
    operation: DataOperation,
    resourceId: string,
    context: OperationContext
  ): Promise<void> {

    grant.usage.totalRequests++;
    grant.usage.successfulRequests++;
    grant.usage.lastRequestTime = new Date();
    grant.lastUsedAt = new Date();

    // Update operation counts
    if (!grant.usage.operationCounts[operation]) {
      grant.usage.operationCounts[operation] = 0;

    grant.usage.operationCounts[operation]++;

    // Track accessed resources
    if (!grant.usage.resourcesAccessed.includes(resourceId)) {
      grant.usage.resourcesAccessed.push(resourceId);


    // Update token usage if applicable
    for (const token of grant.security.accessTokens) {
      if (!token.revoked) {
        token.usage.requestCount++;
        token.lastUsed = new Date();
        
        if (context.ipAddress && !token.usage.sourceIPs.includes(context.ipAddress)) {
          token.usage.sourceIPs.push(context.ipAddress);

        
        if (context.userAgent && !token.usage.userAgents.includes(context.userAgent)) {
          token.usage.userAgents.push(context.userAgent);





  private generateRecommendations(
    violations: GrantValidationViolation[],
    warnings: GrantValidationWarning[],
    grant?: TemporaryAccessGrant
  ): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'TIME_VIOLATION')) {
      recommendations.push('Request grant extension or create new grant');


    if (violations.some(v => v.type === 'CONDITION_VIOLATION')) {
      recommendations.push('Ensure all access conditions are met before attempting access');


    if (warnings.some(w => w.type === 'SECURITY_WARNING')) {
      recommendations.push('Review access patterns for potential security issues');


    if (grant && grant.metadata.riskAssessment.overallRisk === 'CRITICAL') {
      recommendations.push('Consider reducing scope or duration for critical risk grants');


    return recommendations;


  private async getUserName(userId: string): Promise<string> {

    // In a real implementation, this would fetch from user service
    return `User ${userId}`;


  private async getUserEmail(userId: string): Promise<string> {

    // In a real implementation, this would fetch from user service
    return `${userId}@company.com`;


  private async userExists(userId: string): Promise<boolean> {

    // In a real implementation, this would check user service
    return userId !== '';


  private isValidOperation(operation: string): boolean {
    const validOperations = [
      'read', 'WRITE', 'UPDATE', 'DELETE', 'EXPORT', 'SHARE', 'COPY', 'MOVE',
      'CLASSIFY', 'DECLASSIFY', 'SEARCH', 'AGGREGATE', 'TRANSFORM', 'BACKUP',
      'RESTORE', 'ARCHIVE', 'PURGE', 'AUDIT', 'APPROVE'
    ];
    return validOperations.includes(operation);


  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.performCleanup();
 catch (error) {
        this.emit('cleanup_error', { error: error.message });

    }, 5 * 60 * 1000); // Every 5 minutes


  private startMonitoringProcess(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performMonitoring();
 catch (error) {
        this.emit('monitoring_error', { error: error.message });

    }, 60 * 1000); // Every minute


  private async performCleanup(): Promise<void> {

    const now = new Date();
    
    for (const [grantId, grant] of this.grants.entries()) {
      // Mark expired grants
      if (grant.status === 'ACTIVE' && grant.expiresAt <= now) {
        grant.status = 'EXPIRED';
        
        // Add compliance audit entry
        grant.compliance.auditTrail.push({
          id: `audit_${Date.now()}`,
          timestamp: now,
          auditorId: 'system',
          action: 'GRANT_EXPIRED',
          framework: 'INTERNAL',
          requirement: 'EXPIRATION_AUDIT',
          result: 'PASS',
          details: { expiredAt: now.toISOString() },
          evidence: []
        });

        this.emit('grant_expired', { grant });


      // Revoke expired tokens
      for (const token of grant.security.accessTokens) {
        if (!token.revoked && token.expiresAt <= now) {
          token.revoked = true;
          token.revokedAt = now;



      // Clean up old grants (keep for retention period only)
      const retentionPeriod = grant.monitoring.retentionPeriod * 24 * 60 * 60 * 1000;
      if (grant.status === 'EXPIRED' && now.getTime() - grant.expiresAt.getTime() > retentionPeriod) {
        this.grants.delete(grantId);
        this.emit('grant_purged', { grantId });




  private async performMonitoring(): Promise<void> {

    for (const grant of this.grants.values()) {
      if (grant.status !== 'ACTIVE' || !grant.monitoring.enabled) {
        continue;


      // Check alert thresholds
      for (const threshold of grant.monitoring.alertThresholds) {
        const metricValue = await this.getMetricValue(grant, threshold.metric);
        const thresholdMet = this.evaluateThreshold(metricValue, threshold);
        
        if (thresholdMet) {
          await this.handleThresholdAlert(grant, threshold, metricValue);



      // Check for anomalies
      if (grant.monitoring.anomalyDetection.enabled) {
        const anomalyResult = await this.detectAnomalies(grant, 'read', '', {
          timestamp: new Date(),
          requestOrigin: 'monitoring',
          userAgent: 'system',
          sessionId: 'monitoring',
          ipAddress: '127.0.0.1',
          geoLocation: { country: 'US', region: 'CA', city: 'San Francisco' }
        });

        if (anomalyResult.anomalyDetected) {
          this.emit('anomaly_detected', {
            grant,
            description: anomalyResult.description
          });





  private async getMetricValue(grant: TemporaryAccessGrant, metric: string): Promise<number> {

    switch (metric) {
    case 'requests_per_hour':
      return grant.usage.totalRequests; // Simplified
    case 'violations_per_day':
      return grant.usage.violationCount;
    case 'active_sessions':
      return grant.usage.activeSessions;
    default:
      return 0;



  private evaluateThreshold(value: number, threshold: AlertThreshold): boolean {
    switch (threshold.operator) {
    case 'GREATER_THAN':
      return value > threshold.value;
    case 'LESS_THAN':
      return value < threshold.value;
    case 'EQUALS':
      return value === threshold.value;
    default:
      return false;



  private async handleThresholdAlert(
    grant: TemporaryAccessGrant,
    threshold: AlertThreshold,
    value: number
  ): Promise<void> {

    const alert = {
      grantId: grant.id,
      metric: threshold.metric,
      value,
      threshold: threshold.value,
      severity: threshold.severity,
      timestamp: new Date()
    };

    switch (threshold.action) {
    case 'LOG':
      this.emit('threshold_alert', alert);
      break;
    case 'ALERT':
      this.emit('threshold_critical', alert);
      break;
    case 'SUSPEND':
      grant.status = 'SUSPENDED';
      this.emit('grant_suspended', { grant, reason: 'Threshold exceeded' });
      break;
    case 'REVOKE':
      grant.status = 'REVOKED';
      grant.revokedAt = new Date();
      this.emit('grant_revoked', { grant, reason: 'Threshold exceeded', revokedBy: 'system' });
      break;



  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);

    this.removeAllListeners();



export default TemporaryAccessGrantService;