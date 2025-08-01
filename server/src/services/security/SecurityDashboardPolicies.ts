/**
 * Security Dashboard Policies
 * 
 * Comprehensive policy management system for security dashboards with role-based access control,
 * data classification awareness, and compliance framework integration. Manages what security
 * information is visible to whom and under what conditions.
 * 
 * Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114712019-3E638C - Create security dashboard policies
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import {
  DataClassificationLevel,
  DataOperation,
  SecurityContext
 from '../../../../packages/core/security/DataClassificationAccessControl';

export enum DashboardRole {
  VIEWER = 'VIEWER',
  ANALYST = 'ANALYST',
  SECURITY_OFFICER = 'SECURITY_OFFICER',
  ADMIN = 'ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  AUDITOR = 'AUDITOR',
  EXECUTIVE = 'EXECUTIVE'


export enum DashboardPermission {
  VIEW_ALERTS = 'VIEW_ALERTS',
  ACKNOWLEDGE_ALERTS = 'ACKNOWLEDGE_ALERTS',
  RESOLVE_ALERTS = 'RESOLVE_ALERTS',
  ASSIGN_ALERTS = 'ASSIGN_ALERTS',
  DELETE_ALERTS = 'DELETE_ALERTS',
  
  VIEW_METRICS = 'VIEW_METRICS',
  EXPORT_METRICS = 'EXPORT_METRICS',
  CREATE_REPORTS = 'CREATE_REPORTS',
  SCHEDULE_REPORTS = 'SCHEDULE_REPORTS',
  
  VIEW_SYSTEM_HEALTH = 'VIEW_SYSTEM_HEALTH',
  VIEW_THREAT_INTELLIGENCE = 'VIEW_THREAT_INTELLIGENCE',
  VIEW_USER_BEHAVIOR = 'VIEW_USER_BEHAVIOR',
  VIEW_COMPLIANCE_DATA = 'VIEW_COMPLIANCE_DATA',
  
  MANAGE_RULES = 'MANAGE_RULES',
  MANAGE_CHANNELS = 'MANAGE_CHANNELS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_POLICIES = 'MANAGE_POLICIES',
  
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  VIEW_SENSITIVE_DATA = 'VIEW_SENSITIVE_DATA',
  PERFORM_INVESTIGATIONS = 'PERFORM_INVESTIGATIONS'


export enum DataSensitivityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  TOP_SECRET = 'TOP_SECRET'




export interface DashboardPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Scope
  roles: DashboardRole[];
  permissions: DashboardPermission[];
  workspaceIds?: string[];
  projectIds?: string[];
  
  // Data access controls
  maxDataClassification: DataClassificationLevel;
  maxSensitivityLevel: DataSensitivityLevel;
  allowedOperations: DataOperation[];
  
  // Time-based restrictions
  accessSchedule?: AccessSchedule;
  sessionTimeout?: number; // milliseconds
  
  // Content filtering
  contentFilters: ContentFilter[];
  dataRetentionPolicy: DataRetentionPolicy;
  
  // Compliance requirements
  complianceFrameworks: string[]; // e.g., 'SOX', 'GDPR', 'HIPAA'
  auditRequired: boolean;
  approvalRequired: boolean;
  
  // Conditions
  conditions: PolicyCondition[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;







export interface AccessSchedule {
  allowedDays: number[]; // 0-6 (Sunday-Saturday)
  allowedHours: {
    start: string; // HH:MM format
    end: string;



  };
  timezone: string;
  exceptions: ScheduleException[];




export interface ScheduleException {
  date: string; // YYYY-MM-DD
  type: 'ALLOW' | 'DENY';
  reason: string;







export interface ContentFilter {
  type: 'FIELD' | 'VALUE' | 'REGEX' | 'CLASSIFICATION' | 'KEYWORD';
  field?: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'MATCHES' | 'GREATER_THAN' | 'LESS_THAN';
  value: Error;
  action: 'HIDE' | 'MASK' | 'REDACT' | 'AGGREGATE';
  maskingPattern?: string; // e.g., '***' or 'X' repeated







export interface DataRetentionPolicy {
  retentionPeriod: number; // days
  archiveAfter: number; // days
  purgeAfter: number; // days
  complianceHolds: string[]; // Legal hold IDs







export interface PolicyCondition {
  type: 'USER_ATTRIBUTE' | 'TIME' | 'LOCATION' | 'DEVICE' | 'CONTEXT' | 'RISK_SCORE';
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
  value: Error;
  weight: number; // 0-1







export interface PolicyEvaluationContext {
  userId: string;
  userRoles: DashboardRole[];
  userAttributes: Record<string, any>;
  workspaceId?: string;
  projectId?: string;
  sessionContext: {
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    sessionId: string;



  };
  requestedData: {
    type: string;
    classification: DataClassificationLevel;
    sensitivityLevel: DataSensitivityLevel;
    operations: DataOperation[];
  };
  riskScore?: number;




export interface PolicyEvaluationResult {
  allowed: boolean;
  policy: DashboardPolicy;
  permissions: DashboardPermission[];
  contentFilters: ContentFilter[];
  restrictions: PolicyRestriction[];
  auditRequired: boolean;
  sessionTimeout?: number;
  warnings: string[];







export interface PolicyRestriction {
  type: 'TIME_LIMIT' | 'DATA_LIMIT' | 'OPERATION_LIMIT' | 'EXPORT_DISABLED' | 'APPROVAL_REQUIRED';
  description: string;
  parameters: Record<string, any>;







export interface DashboardViewConfiguration {
  userId: string;
  allowedSections: string[];
  hiddenFields: string[];
  maskedFields: Record<string, string>; // field -> masking pattern
  aggregatedViews: string[];
  maxDataAge: number; // days
  refreshInterval: number; // milliseconds
  exportPermissions: {
    allowExport: boolean;
    allowedFormats: string[];
    watermarkRequired: boolean;



  };




export interface ComplianceReport {
  id: string;
  framework: string;
  generatedAt: Date;
  generatedBy: string;
  period: {
    start: Date;
    end: Date;



  };
  
  summary: {
    totalPolicies: number;
    activePolicies: number;
    violations: number;
    warnings: number;
  };
  
  findings: ComplianceFinding[];
  recommendations: ComplianceRecommendation[];
  
  attestation: {
    attested: boolean;
    attestedBy?: string;
    attestationDate?: Date;
    comments?: string;
  };




export interface ComplianceFinding {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'VIOLATION' | 'WARNING' | 'OBSERVATION';
  policyId: string;
  description: string;
  evidence: ComplianceEvidence[];
  remediation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED_RISK';







export interface ComplianceEvidence {
  type: 'AUDIT_LOG' | 'CONFIGURATION' | 'SCREENSHOT' | 'DOCUMENT';
  source: string;
  timestamp: Date;
  data: Record<string, unknown>;
  hash: string; // For integrity verification







export interface ComplianceRecommendation {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'POLICY' | 'CONFIGURATION' | 'TRAINING' | 'PROCESS';
  description: string;
  implementation: string;
  impact: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';





/**
 * Security Dashboard Policy Management System
 */
export class SecurityDashboardPolicies extends EventEmitter {
  private policies: Map<string, DashboardPolicy> = new Map();
  private rolePermissions: Map<DashboardRole, DashboardPermission[]> = new Map();
  private evaluationCache: Map<string, PolicyEvaluationResult> = new Map();
  private auditLog: PolicyAuditEntry[] = [];
  
  constructor() {
    super();
    this.initializeDefaultPolicies();
    this.initializeRolePermissions();
    
    // Cache cleanup interval
    setInterval(() => this.cleanupEvaluationCache(), 300000); // 5 minutes
    
    logger.info('Security Dashboard Policies initialized');

  
  /**
   * Evaluate policies for a given context
   */
  async evaluatePolicies(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult[]> {

    const results: PolicyEvaluationResult[] = [];
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(context);
    const cachedResult = this.evaluationCache.get(cacheKey);
    
    if (cachedResult && this.isCacheValid(cachedResult, context)) {
      return [cachedResult];

    
    try {
      for (const policy of this.policies.values()) {
        if (!policy.enabled) continue;
        
        const result = await this.evaluatePolicy(policy, context);
        if (result.allowed) {
          results.push(result);


      
      // Find the most permissive policy
      const finalResult = this.mergePolicyResults(results);
      
      if (finalResult) {
        // Cache the result
        this.evaluationCache.set(cacheKey, finalResult);
        
        // Log policy evaluation
        this.logPolicyEvaluation(context, finalResult);

      
      return results;
 catch (error) {
      logger.error('Policy evaluation failed', {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;


  
  /**
   * Get dashboard view configuration for a user
   */
  async getDashboardConfiguration(
    userId: string,
    context: Partial<PolicyEvaluationContext>
  ): Promise<DashboardViewConfiguration> {

    const fullContext: PolicyEvaluationContext = {
      userId,
      userRoles: await this.getUserRoles(userId),
      userAttributes: await this.getUserAttributes(userId),
      sessionContext: {
        ipAddress: '0.0.0.0',
        userAgent: 'Unknown',
        timestamp: new Date(),
        sessionId: 'default'

      requestedData: {
        type: 'dashboard',
        classification: DataClassificationLevel.INTERNAL,
        sensitivityLevel: DataSensitivityLevel.INTERNAL,
        operations: [DataOperation.READ]

      ...context
    };
    
    const policyResults = await this.evaluatePolicies(fullContext);
    const effectivePolicy = this.mergePolicyResults(policyResults);
    
    if (!effectivePolicy || !effectivePolicy.allowed) {
      // Return minimal configuration for denied access
      return {
        userId,
        allowedSections: [],
        hiddenFields: [],
        maskedFields: {},
        aggregatedViews: [],
        maxDataAge: 0,
        refreshInterval: 0,
        exportPermissions: {
          allowExport: false,
          allowedFormats: [],
          watermarkRequired: true

      };

    
    return this.buildDashboardConfiguration(effectivePolicy, fullContext);

  
  /**
   * Create new policy
   */
  async createPolicy(
    policyData: Omit<DashboardPolicy, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
    createdBy: string
  ): Promise<DashboardPolicy> {

    const policy: DashboardPolicy = {
      ...policyData,
      id: this.generatePolicyId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      createdBy
    };
    
    // Validate policy
    const validation = this.validatePolicy(policy);
    if (!validation.valid) {
      throw new Error(`Policy validation failed: ${validation.errors.join(', ')}`);

    
    this.policies.set(policy.id, policy);
    
    // Clear evaluation cache
    this.evaluationCache.clear();
    
    this.emit('policyCreated', { policy, createdBy });
    
    logger.info('Dashboard policy created', {
      policyId: policy.id,
      name: policy.name,
      createdBy
    });
    
    return policy;

  
  /**
   * Update existing policy
   */
  async updatePolicy(
    policyId: string,
    updates: Partial<DashboardPolicy>,
    updatedBy: string
  ): Promise<DashboardPolicy> {

    const existingPolicy = this.policies.get(policyId);
    if (!existingPolicy) {
      throw new Error(`Policy not found: ${policyId}`);

    
    const updatedPolicy: DashboardPolicy = {
      ...existingPolicy,
      ...updates,
      id: policyId, // Ensure ID cannot be changed
      updatedAt: new Date(),
      version: existingPolicy.version + 1
    };
    
    const validation = this.validatePolicy(updatedPolicy);
    if (!validation.valid) {
      throw new Error(`Policy validation failed: ${validation.errors.join(', ')}`);

    
    this.policies.set(policyId, updatedPolicy);
    
    // Clear evaluation cache
    this.evaluationCache.clear();
    
    this.emit('policyUpdated', {
      previousPolicy: existingPolicy,
      newPolicy: updatedPolicy,
      updatedBy
    });
    
    logger.info('Dashboard policy updated', {
      policyId,
      name: updatedPolicy.name,
      updatedBy,
      version: updatedPolicy.version
    });
    
    return updatedPolicy;

  
  /**
   * Delete policy
   */
  async deletePolicy(policyId: string, deletedBy: string): Promise<void> {

    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy not found: ${policyId}`);

    
    this.policies.delete(policyId);
    
    // Clear evaluation cache
    this.evaluationCache.clear();
    
    this.emit('policyDeleted', { policy, deletedBy });
    
    logger.info('Dashboard policy deleted', {
      policyId,
      name: policy.name,
      deletedBy
    });

  
  /**
   * Get all policies
   */
  getPolicies(filters: {
    enabled?: boolean;
    role?: DashboardRole;
    workspaceId?: string;
    projectId?: string;
 = {}): DashboardPolicy[] {
    let policies = Array.from(this.policies.values());
    
    if (filters.enabled !== undefined) {
      policies = policies.filter(p => p.enabled === filters.enabled);

    if (filters.role) {
      policies = policies.filter(p => p.roles.includes(filters.role!));

    if (filters.workspaceId) {
      policies = policies.filter(p => 
        !p.workspaceIds || p.workspaceIds.includes(filters.workspaceId!)
      );

    if (filters.projectId) {
      policies = policies.filter(p =>
        !p.projectIds || p.projectIds.includes(filters.projectId!)
      );

    
    return policies.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  
  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    framework: string,
    period: { start: Date; end: Date },
    generatedBy: string
  ): Promise<ComplianceReport> {

    const reportId = this.generateReportId();
    const activePolicies = this.getPolicies({ enabled: true });
    const frameworkPolicies = activePolicies.filter(p =>
      p.complianceFrameworks.includes(framework)
    );
    
    const findings: ComplianceFinding[] = [];
    const recommendations: ComplianceRecommendation[] = [];
    
    // Analyze policies for compliance issues
    for (const policy of frameworkPolicies) {
      const policyFindings = await this.analyzePolicyCompliance(policy, framework);
      findings.push(...policyFindings);

    
    // Generate recommendations
    recommendations.push(...this.generateComplianceRecommendations(findings, framework));
    
    const report: ComplianceReport = {
      id: reportId,
      framework,
      generatedAt: new Date(),
      generatedBy,
      period,
      summary: {
        totalPolicies: activePolicies.length,
        activePolicies: frameworkPolicies.length,
        violations: findings.filter(f => f.type === 'VIOLATION').length,
        warnings: findings.filter(f => f.type === 'WARNING').length

      findings,
      recommendations,
      attestation: {
        attested: false

    };
    
    this.emit('complianceReportGenerated', { report, generatedBy });
    
    return report;

  
  /**
   * Apply data classification filters
   */
  applyDataFilters(
    data: Record<string, unknown>,
    filters: ContentFilter[],
    userContext: PolicyEvaluationContext
  ): unknown {
    let filteredData = JSON.parse(JSON.stringify(data)); // Deep copy
    
    for (const filter of filters) {
      filteredData = this.applyContentFilter(filteredData, filter, userContext);

    
    return filteredData;

  
  // PRIVATE HELPER METHODS
  
  private async evaluatePolicy(
    policy: DashboardPolicy,
    context: PolicyEvaluationContext
  ): Promise<PolicyEvaluationResult> {

    // Check role membership
    const hasRequiredRole = policy.roles.some(role => context.userRoles.includes(role));
    if (!hasRequiredRole) {
      return {
        allowed: false,
        policy,
        permissions: [],
        contentFilters: [],
        restrictions: [{
          type: 'OPERATION_LIMIT',
          description: 'Insufficient role permissions',
          parameters: { requiredRoles: policy.roles }
],
        auditRequired: false,
        warnings: ['User does not have required roles']
      };

    
    // Check workspace/project scope
    if (policy.workspaceIds && context.workspaceId && 
        !policy.workspaceIds.includes(context.workspaceId)) {
      return {
        allowed: false,
        policy,
        permissions: [],
        contentFilters: [],
        restrictions: [{
          type: 'OPERATION_LIMIT',
          description: 'Access denied for this workspace',
          parameters: { workspaceId: context.workspaceId }
],
        auditRequired: false,
        warnings: ['Workspace not in policy scope']
      };

    
    // Check data classification limits
    if (this.getClassificationLevel(context.requestedData.classification) >
        this.getClassificationLevel(policy.maxDataClassification)) {
      return {
        allowed: false,
        policy,
        permissions: [],
        contentFilters: [],
        restrictions: [{
          type: 'DATA_LIMIT',
          description: 'Data classification exceeds policy limits',
          parameters: { 
            maxClassification: policy.maxDataClassification,
            requestedClassification: context.requestedData.classification

],
        auditRequired: true,
        warnings: ['Attempted access to data above clearance level']
      };

    
    // Evaluate conditions
    const conditionResults = await Promise.all(
      policy.conditions.map(condition => this.evaluateCondition(condition, context))
    );
    
    const conditionsMet = conditionResults.every(result => result);
    if (!conditionsMet) {
      return {
        allowed: false,
        policy,
        permissions: [],
        contentFilters: [],
        restrictions: [{
          type: 'OPERATION_LIMIT',
          description: 'Policy conditions not met',
          parameters: { conditions: policy.conditions }
],
        auditRequired: false,
        warnings: ['One or more policy conditions failed']
      };

    
    // Check time-based restrictions
    const timeRestriction = this.checkTimeRestrictions(policy, context);
    const restrictions: PolicyRestriction[] = timeRestriction ? [timeRestriction] : [];
    
    return {
      allowed: true,
      policy,
      permissions: policy.permissions,
      contentFilters: policy.contentFilters,
      restrictions,
      auditRequired: policy.auditRequired,
      sessionTimeout: policy.sessionTimeout,
      warnings: []
    };

  
  private async evaluateCondition(
    condition: PolicyCondition,
    context: PolicyEvaluationContext
  ): Promise<boolean> {

    let contextValue: Error;
    
    switch (condition.type) {
    case 'USER_ATTRIBUTE':
      contextValue = context.userAttributes[condition.field];
      break;
    case 'TIME':
      contextValue = context.sessionContext.timestamp;
      break;
    case 'LOCATION':
      contextValue = context.sessionContext.ipAddress;
      break;
    case 'DEVICE':
      contextValue = context.sessionContext.userAgent;
      break;
    case 'CONTEXT':
      contextValue = (context as any)[condition.field];
      break;
    case 'RISK_SCORE':
      contextValue = context.riskScore || 0;
      break;
    default:
      return false;

    
    return this.compareValues(contextValue, condition.operator, condition.value);

  
  private compareValues(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
    case 'EQUALS':
      return actual === expected;
    case 'NOT_EQUALS':
      return actual !== expected;
    case 'IN':
      return Array.isArray(expected) && expected.includes(actual);
    case 'NOT_IN':
      return Array.isArray(expected) && !expected.includes(actual);
    case 'GREATER_THAN':
      return Number(actual) > Number(expected);
    case 'LESS_THAN':
      return Number(actual) < Number(expected);
    case 'BETWEEN':
      return Array.isArray(expected) && expected.length === 2 &&
               Number(actual) >= Number(expected[0]) &&
               Number(actual) <= Number(expected[1]);
    default:
      return false;


  
  private mergePolicyResults(results: PolicyEvaluationResult[]): PolicyEvaluationResult | null {
    if (results.length === 0) return null;
    if (results.length === 1) return results[0];
    
    // Merge permissions and filters from all applicable policies
    const mergedPermissions = new Set<DashboardPermission>();
    const mergedFilters: ContentFilter[] = [];
    const mergedRestrictions: PolicyRestriction[] = [];
    const mergedWarnings: string[] = [];
    
    let auditRequired = false;
    let minSessionTimeout: number | undefined;
    const primaryPolicy = results[0].policy;
    
    for (const result of results) {
      result.permissions.forEach(p => mergedPermissions.add(p));
      mergedFilters.push(...result.contentFilters);
      mergedRestrictions.push(...result.restrictions);
      mergedWarnings.push(...result.warnings);
      
      if (result.auditRequired) auditRequired = true;
      if (result.sessionTimeout && (!minSessionTimeout || result.sessionTimeout < minSessionTimeout)) {
        minSessionTimeout = result.sessionTimeout;


    
    return {
      allowed: true,
      policy: primaryPolicy,
      permissions: Array.from(mergedPermissions),
      contentFilters: mergedFilters,
      restrictions: mergedRestrictions,
      auditRequired,
      sessionTimeout: minSessionTimeout,
      warnings: mergedWarnings
    };

  
  private buildDashboardConfiguration(
    policyResult: PolicyEvaluationResult,
    context: PolicyEvaluationContext
  ): DashboardViewConfiguration {
    const permissions = policyResult.permissions;
    
    // Determine allowed sections based on permissions
    const allowedSections: string[] = [];
    if (permissions.includes(DashboardPermission.VIEW_ALERTS)) {
      allowedSections.push('alerts', 'alert-management');

    if (permissions.includes(DashboardPermission.VIEW_METRICS)) {
      allowedSections.push('metrics', 'analytics');

    if (permissions.includes(DashboardPermission.VIEW_SYSTEM_HEALTH)) {
      allowedSections.push('system-health', 'monitoring');

    if (permissions.includes(DashboardPermission.VIEW_THREAT_INTELLIGENCE)) {
      allowedSections.push('threat-intelligence', 'security-feeds');

    if (permissions.includes(DashboardPermission.VIEW_COMPLIANCE_DATA)) {
      allowedSections.push('compliance', 'audit');

    if (permissions.includes(DashboardPermission.VIEW_USER_BEHAVIOR)) {
      allowedSections.push('user-analytics', 'behavior-analysis');

    
    // Process content filters to determine field visibility
    const hiddenFields: string[] = [];
    const maskedFields: Record<string, string> = {};
    
    for (const filter of policyResult.contentFilters) {
      if (filter.action === 'HIDE' && filter.field) {
        hiddenFields.push(filter.field);
 else if (filter.action === 'MASK' && filter.field) {
        maskedFields[filter.field] = filter.maskingPattern || '***';


    
    // Determine aggregated views for sensitive data
    const aggregatedViews: string[] = [];
    if (policyResult.policy.maxSensitivityLevel === DataSensitivityLevel.CONFIDENTIAL) {
      aggregatedViews.push('user-summaries', 'system-summaries');

    
    return {
      userId: context.userId,
      allowedSections,
      hiddenFields,
      maskedFields,
      aggregatedViews,
      maxDataAge: policyResult.policy.dataRetentionPolicy.retentionPeriod,
      refreshInterval: this.calculateRefreshInterval(policyResult.policy),
      exportPermissions: {
        allowExport: permissions.includes(DashboardPermission.EXPORT_METRICS),
        allowedFormats: permissions.includes(DashboardPermission.CREATE_REPORTS) ? 
          ['json', 'csv', 'pdf'] : ['json'],
        watermarkRequired: policyResult.policy.maxSensitivityLevel !== DataSensitivityLevel.PUBLIC

    };

  
  private checkTimeRestrictions(
    policy: DashboardPolicy,
    context: PolicyEvaluationContext
  ): PolicyRestriction | null {
    if (!policy.accessSchedule) return null;
    
    const now = context.sessionContext.timestamp;
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check allowed days
    if (!policy.accessSchedule.allowedDays.includes(currentDay)) {
      return {
        type: 'TIME_LIMIT',
        description: 'Access not allowed on this day',
        parameters: { 
          currentDay,
          allowedDays: policy.accessSchedule.allowedDays

      };

    
    // Check allowed hours
    const schedule = policy.accessSchedule.allowedHours;
    if (currentTime < schedule.start || currentTime > schedule.end) {
      return {
        type: 'TIME_LIMIT',
        description: 'Access not allowed at this time',
        parameters: {
          currentTime,
          allowedStart: schedule.start,
          allowedEnd: schedule.end

      };

    
    return null;

  
  private applyContentFilter(
    data: Record<string, unknown>,
    filter: ContentFilter,
    context: PolicyEvaluationContext
  ): unknown {
    if (!data || typeof data !== 'object') return data;
    
    switch (filter.type) {
    case 'FIELD':
      return this.applyFieldFilter(data, filter);
    case 'VALUE':
      return this.applyValueFilter(data, filter);
    case 'CLASSIFICATION':
      return this.applyClassificationFilter(data, filter, context);
    case 'KEYWORD':
      return this.applyKeywordFilter(data, filter);
    default:
      return data;


  
  private applyFieldFilter(data: Record<string, unknown>, filter: ContentFilter): unknown {
    if (!filter.field) return data;
    
    const result = { ...data };
    
    switch (filter.action) {
    case 'HIDE':
      delete result[filter.field];
      break;
    case 'MASK':
      if (result[filter.field]) {
        result[filter.field] = filter.maskingPattern || '***';

      break;
    case 'REDACT':
      if (result[filter.field]) {
        result[filter.field] = '[REDACTED]';

      break;

    
    return result;

  
  private applyValueFilter(data: Record<string, unknown>, _____filter: ContentFilter): unknown {
    // Implementation would recursively search for values to filter
    return data;

  
  private applyClassificationFilter(
    data: Record<string, unknown>,
    _____filter: ContentFilter,
    _____context: PolicyEvaluationContext
  ): unknown {
    // Implementation would filter based on data classification levels
    return data;

  
  private applyKeywordFilter(data: Record<string, unknown>, _____filter: ContentFilter): unknown {
    // Implementation would filter based on sensitive keywords
    return data;

  
  private async analyzePolicyCompliance(
    policy: DashboardPolicy,
    framework: string
  ): Promise<ComplianceFinding[]> {

    const findings: ComplianceFinding[] = [];
    
    // Framework-specific compliance checks
    switch (framework) {
    case 'GDPR':
      findings.push(...this.analyzeGDPRCompliance(policy));
      break;
    case 'SOX':
      findings.push(...this.analyzeSOXCompliance(policy));
      break;
    case 'HIPAA':
      findings.push(...this.analyzeHIPAACompliance(policy));
      break;

    
    return findings;

  
  private analyzeGDPRCompliance(policy: DashboardPolicy): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];
    
    // Check data retention compliance
    if (policy.dataRetentionPolicy.retentionPeriod > 2555) { // ~7 years
      findings.push({
        id: this.generateFindingId(),
        severity: 'MEDIUM',
        type: 'WARNING',
        policyId: policy.id,
        description: 'Data retention period may exceed GDPR requirements',
        evidence: [],
        remediation: 'Review and adjust retention period to comply with data minimization principle',
        status: 'OPEN'
      });

    
    return findings;

  
  private analyzeSOXCompliance(policy: DashboardPolicy): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];
    
    // Check audit requirements
    if (!policy.auditRequired && policy.permissions.includes(DashboardPermission.VIEW_SENSITIVE_DATA)) {
      findings.push({
        id: this.generateFindingId(),
        severity: 'HIGH',
        type: 'VIOLATION',
        policyId: policy.id,
        description: 'SOX requires audit trails for sensitive data access',
        evidence: [],
        remediation: 'Enable audit logging for this policy',
        status: 'OPEN'
      });

    
    return findings;

  
  private analyzeHIPAACompliance(policy: DashboardPolicy): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];
    
    // Check minimum necessary principle
    if (policy.permissions.length > 5) {
      findings.push({
        id: this.generateFindingId(),
        severity: 'MEDIUM',
        type: 'WARNING',
        policyId: policy.id,
        description: 'Policy may grant excessive permissions (minimum necessary principle)',
        evidence: [],
        remediation: 'Review permissions and apply principle of least privilege',
        status: 'OPEN'
      });

    
    return findings;

  
  private generateComplianceRecommendations(
    findings: ComplianceFinding[],
    _____framework: string
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];
    
    const highSeverityCount = findings.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').length;
    
    if (highSeverityCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'POLICY',
        description: `Address ${highSeverityCount} high-severity compliance findings`,
        implementation: 'Review and remediate high-severity policy violations',
        impact: 'Reduces compliance risk and potential penalties',
        effort: 'MEDIUM'
      });

    
    return recommendations;

  
  private validatePolicy(policy: DashboardPolicy): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!policy.name || policy.name.trim() === '') {
      errors.push('Policy name is required');

    
    if (policy.roles.length === 0) {
      errors.push('At least one role must be specified');

    
    if (policy.permissions.length === 0) {
      errors.push('At least one permission must be specified');

    
    // Validate content filters
    policy.contentFilters.forEach((filter, index) => {
      if (filter.type === 'FIELD' && !filter.field) {
        errors.push(`Content filter ${index} requires a field when type is FIELD`);

    });
    
    return {
      valid: errors.length === 0,
      errors
    };

  
  private initializeDefaultPolicies(): void {
    // Create default policies for each role
    const defaultPolicies: Omit<DashboardPolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy'>[] = [
      {
        name: 'Security Viewer Policy',
        description: 'Basic viewing permissions for security dashboards',
        enabled: true,
        roles: [DashboardRole.VIEWER],
        permissions: [
          DashboardPermission.VIEW_ALERTS,
          DashboardPermission.VIEW_METRICS,
          DashboardPermission.VIEW_SYSTEM_HEALTH
        ],
        maxDataClassification: DataClassificationLevel.INTERNAL,
        maxSensitivityLevel: DataSensitivityLevel.INTERNAL,
        allowedOperations: [DataOperation.READ],
        contentFilters: [
          {
            type: 'FIELD',
            field: 'userEmail',
            operator: 'EQUALS',
            value: null,
            action: 'MASK',
            maskingPattern: '***@***'

        ],
        dataRetentionPolicy: {
          retentionPeriod: 30,
          archiveAfter: 30,
          purgeAfter: 365,
          complianceHolds: []

        complianceFrameworks: [],
        auditRequired: false,
        approvalRequired: false,
        conditions: [],
        sessionTimeout: 3600000 // 1 hour

      {
        name: 'Security Administrator Policy',
        description: 'Full administrative permissions for security dashboards',
        enabled: true,
        roles: [DashboardRole.ADMIN],
        permissions: Object.values(DashboardPermission),
        maxDataClassification: DataClassificationLevel.CONFIDENTIAL,
        maxSensitivityLevel: DataSensitivityLevel.RESTRICTED,
        allowedOperations: Object.values(DataOperation),
        contentFilters: [],
        dataRetentionPolicy: {
          retentionPeriod: 365,
          archiveAfter: 90,
          purgeAfter: 2555, // 7 years
          complianceHolds: []

        complianceFrameworks: ['SOX', 'GDPR'],
        auditRequired: true,
        approvalRequired: false,
        conditions: []

    ];
    
    // Create policies with system user
    for (const policyData of defaultPolicies) {
      const policy: DashboardPolicy = {
        ...policyData,
        id: this.generatePolicyId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        createdBy: 'system'
      };
      
      this.policies.set(policy.id, policy);


  
  private initializeRolePermissions(): void {
    this.rolePermissions.set(DashboardRole.VIEWER, [
      DashboardPermission.VIEW_ALERTS,
      DashboardPermission.VIEW_METRICS,
      DashboardPermission.VIEW_SYSTEM_HEALTH
    ]);
    
    this.rolePermissions.set(DashboardRole.ANALYST, [
      ...this.rolePermissions.get(DashboardRole.VIEWER)!,
      DashboardPermission.ACKNOWLEDGE_ALERTS,
      DashboardPermission.VIEW_THREAT_INTELLIGENCE,
      DashboardPermission.CREATE_REPORTS
    ]);
    
    this.rolePermissions.set(DashboardRole.SECURITY_OFFICER, [
      ...this.rolePermissions.get(DashboardRole.ANALYST)!,
      DashboardPermission.RESOLVE_ALERTS,
      DashboardPermission.ASSIGN_ALERTS,
      DashboardPermission.VIEW_USER_BEHAVIOR,
      DashboardPermission.PERFORM_INVESTIGATIONS
    ]);
    
    this.rolePermissions.set(DashboardRole.ADMIN, Object.values(DashboardPermission));

  
  // Mock methods for external integrations
  private async getUserRoles(_____userId: string): Promise<DashboardRole[]> {

    // In real implementation, this would query user management system
    return [DashboardRole.VIEWER];

  
  private async getUserAttributes(_____userId: string): Promise<Record<string, any>> {
    // In real implementation, this would fetch user attributes
    return {};

  
  private getClassificationLevel(classification: DataClassificationLevel): number {
    const levels = {
      [DataClassificationLevel.PUBLIC]: 0,
      [DataClassificationLevel.INTERNAL]: 1,
      [DataClassificationLevel.CONFIDENTIAL]: 2,
      [DataClassificationLevel.RESTRICTED]: 3
    };
    return levels[classification] || 0;

  
  private calculateRefreshInterval(policy: DashboardPolicy): number {
    // Base refresh interval on sensitivity level
    switch (policy.maxSensitivityLevel) {
    case DataSensitivityLevel.TOP_SECRET:
      return 5000; // 5 seconds
    case DataSensitivityLevel.RESTRICTED:
      return 10000; // 10 seconds
    case DataSensitivityLevel.CONFIDENTIAL:
      return 30000; // 30 seconds
    default:
      return 60000; // 1 minute


  
  private generateCacheKey(context: PolicyEvaluationContext): string {
    return `${context.userId}-${context.workspaceId || 'none'}-${context.requestedData.type}`;

  
  private isCacheValid(cachedResult: PolicyEvaluationResult, context: PolicyEvaluationContext): boolean {
    // Simple time-based cache validation
    const cacheAge = Date.now() - context.sessionContext.timestamp.getTime();
    return cacheAge < 300000; // 5 minutes

  
  private cleanupEvaluationCache(): void {
    this.evaluationCache.clear();

  
  private logPolicyEvaluation(context: PolicyEvaluationContext, result: PolicyEvaluationResult): void {
    if (result.auditRequired) {
      const auditEntry: PolicyAuditEntry = {
        timestamp: new Date(),
        userId: context.userId,
        policyId: result.policy.id,
        action: 'POLICY_EVALUATION',
        allowed: result.allowed,
        context: {
          workspaceId: context.workspaceId,
          projectId: context.projectId,
          ipAddress: context.sessionContext.ipAddress,
          userAgent: context.sessionContext.userAgent

      };
      
      this.auditLog.push(auditEntry);
      
      // Keep only recent entries
      if (this.auditLog.length > 10000) {
        this.auditLog.splice(0, 1000);



  
  private generatePolicyId(): string {
    return `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
  private generateFindingId(): string {
    return `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.removeAllListeners();
    this.evaluationCache.clear();
    logger.info('Security Dashboard Policies destroyed');





interface PolicyAuditEntry {
  timestamp: Date;
  userId: string;
  policyId: string;
  action: string;
  allowed: boolean;
  context: {
    workspaceId?: string;
    projectId?: string;
    ipAddress: string;
    userAgent: string;



  };


export default SecurityDashboardPolicies;