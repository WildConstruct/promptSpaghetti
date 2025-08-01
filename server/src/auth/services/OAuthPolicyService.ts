/**
 * OAuth Policy Management Service
 * 
 * Comprehensive OAuth policy framework that integrates with Epic 19 security platform
 * to provide OAuth-specific policy lifecycle management, enforcement, and compliance.
 * 
 * Task: T-1752989143998-507 - Create OAuth policies
 */

import { AuditService } from './AuditService';
import { DatabaseService } from '../database/DatabaseService';
import { PolicyAuthoringService } from '../../services/PolicyAuthoringService';
import { PolicyAcceptanceTrackingService } from '../../services/PolicyAcceptanceTrackingService';
import { ComplianceReportingService } from '../../services/ComplianceReportingService';
import { RuleEvaluationEngine } from '../../services/RuleEvaluationEngine';
import { OAuthGuidanceService } from '../../services/OAuthGuidanceService';

export type OAuthPolicyType = 
  | 'OAUTH_CLIENT_REGISTRATION'
  | 'OAUTH_TOKEN_LIFECYCLE'
  | 'OAUTH_PROVIDER_MANAGEMENT'
  | 'OAUTH_SECURITY_STANDARDS'
  | 'OAUTH_CONSENT_MANAGEMENT';

export type ClientType = 'CONFIDENTIAL' | 'PUBLIC' | 'MACHINE_TO_MACHINE';
export type SecurityLevel = 'HIGH_SECURITY' | 'STANDARD_SECURITY' | 'LOW_SECURITY';
export type EnvironmentType = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
export type ComplianceFramework = 'OAuth2.1' | 'GDPR' | 'CCPA' | 'SOX' | 'PCI_DSS' | 'ISO27001' | 'HIPAA';



export interface OAuthPolicyTemplate {
  templateId: string;
  policyType: OAuthPolicyType;
  title: string;
  description: string;
  version: string;
  frameworks: ComplianceFramework[];
  targetEnvironments: EnvironmentType[];
  template: PolicyDocument;
  validationRules: PolicyRule[];
  enforcementMechanisms: EnforcementMechanism[];
  createdAt: Date;
  updatedAt: Date;







export interface PolicyDocument {
  title: string;
  description: string;
  sections: PolicySection[];
  requirements: PolicyRequirement[];
  exceptions: PolicyException[];
  reviewSchedule: string;
  approvalRequired: boolean;







export interface PolicySection {
  sectionId: string;
  title: string;
  content: string;
  mandatory: boolean;
  variables: PolicyVariable[];
  validations: ValidationRule[];







export interface PolicyVariable {
  name: string;
  type: 'TEXT' | 'SELECT' | 'MULTI_SELECT' | 'NUMBER' | 'BOOLEAN' | 'LIST';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;



  };




export interface PolicyRequirement {
  requirementId: string;
  title: string;
  description: string;
  mandatory: boolean;
  complianceFrameworks: ComplianceFramework[];
  validationRule?: string;
  enforcementAction: 'BLOCK' | 'WARN' | 'LOG' | 'REQUIRE_APPROVAL';







export interface PolicyException {
  exceptionId: string;
  title: string;
  description: string;
  conditions: ExceptionCondition[];
  approvalRequired: boolean;
  validUntil?: Date;







export interface ExceptionCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;







export interface ValidationRule {
  ruleId: string;
  expression: string;
  errorMessage: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';







export interface PolicyRule {
  ruleId: string;
  name: string;
  description: string;
  expression: string;
  action: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
  priority: number;
  enabled: boolean;







export interface EnforcementMechanism {
  mechanismId: string;
  name: string;
  trigger: 'ON_CLIENT_REGISTRATION' | 'ON_TOKEN_ISSUANCE' | 'ON_SCOPE_GRANT' | 'CONTINUOUS' | 'SCHEDULED';
  action: string;
  escalation: 'BLOCK' | 'ALERT' | 'LOG' | 'REQUIRE_APPROVAL';
  automated: boolean;







export interface OAuthConfiguration {
  clientId: string;
  clientType: ClientType;
  scopes: string[];
  redirectUris: string[];
  environment: EnvironmentType;
  securityLevel: SecurityLevel;
  complianceRequirements: ComplianceFramework[];
  customAttributes: Record<string, any>;







export interface TokenConfiguration {
  accessTokenTtl: number;
  refreshTokenTtl: number;
  rotationRequired: boolean;
  bindingRequired: boolean;
  encryptionRequired: boolean;
  audience: string[];
  scopes: string[];







export interface PolicyEnforcementResult {
  compliant: boolean;
  policyId: string;
  evaluationId: string;
  violations: PolicyViolation[];
  recommendations: PolicyRecommendation[];
  enforcementActions: EnforcementAction[];
  evaluatedAt: Date;
  nextEvaluation?: Date;







export interface PolicyViolation {
  violationId: string;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  field?: string;
  actualValue?: any;
  expectedValue?: any;
  remediationSuggestion: string;







export interface PolicyRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  implementationGuide: string;
  estimatedEffort: string;







export interface EnforcementAction {
  actionId: string;
  type: 'BLOCK_REGISTRATION' | 'REQUIRE_APPROVAL' | 'SEND_ALERT' | 'CREATE_TICKET' | 'LOG_VIOLATION';
  description: string;
  automated: boolean;
  executedAt?: Date;
  executedBy?: string;
  result?: string;







export interface OAuthGovernanceFramework {
  frameworkId: string;
  title: string;
  version: string;
  description: string;
  policies: OAuthPolicyTemplate[];
  enforcementMechanisms: EnforcementMechanism[];
  reportingSchedule: ReportingSchedule;
  complianceRequirements: ComplianceRequirement[];
  approvalWorkflows: ApprovalWorkflow[];







export interface ReportingSchedule {
  daily?: string[];
  weekly?: string[];
  monthly?: string[];
  quarterly?: string[];
  annual?: string[];







export interface ComplianceRequirement {
  frameworkId: ComplianceFramework;
  requirementId: string;
  title: string;
  description: string;
  controls: string[];
  evidenceRequired: string[];
  automated: boolean;







export interface ApprovalWorkflow {
  workflowId: string;
  name: string;
  triggers: string[];
  steps: ApprovalStep[];
  timeouts: WorkflowTimeout[];
  escalations: EscalationRule[];







export interface ApprovalStep {
  stepId: string;
  name: string;
  approvers: string[];
  requiredApprovals: number;
  timeoutHours: number;
  autoApprove?: boolean;
  conditions?: string;







export interface WorkflowTimeout {
  stepId: string;
  timeoutHours: number;
  action: 'AUTO_APPROVE' | 'AUTO_REJECT' | 'ESCALATE' | 'NOTIFY';







export interface EscalationRule {
  ruleId: string;
  condition: string;
  escalateTo: string[];
  action: string;





export class OAuthPolicyService {
  private auditService: AuditService;
  private dbService: DatabaseService;
  private policyAuthoringService: PolicyAuthoringService;
  private policyAcceptanceService: PolicyAcceptanceTrackingService;
  private complianceReportingService: ComplianceReportingService;
  private ruleEvaluationEngine: RuleEvaluationEngine;
  private oauthGuidanceService: OAuthGuidanceService;

  constructor(
    auditService: AuditService,
    dbService: DatabaseService,
    policyAuthoringService: PolicyAuthoringService,
    policyAcceptanceService: PolicyAcceptanceTrackingService,
    complianceReportingService: ComplianceReportingService,
    ruleEvaluationEngine: RuleEvaluationEngine,
    oauthGuidanceService: OAuthGuidanceService
  ) {
    this.auditService = auditService;
    this.dbService = dbService;
    this.policyAuthoringService = policyAuthoringService;
    this.policyAcceptanceService = policyAcceptanceService;
    this.complianceReportingService = complianceReportingService;
    this.ruleEvaluationEngine = ruleEvaluationEngine;
    this.oauthGuidanceService = oauthGuidanceService;


  /**
   * Create OAuth policy from template
   */
  async createOAuthPolicyFromTemplate(
    templateId: string,
    customizations: Record<string, any> = {},
    userId: string
  ): Promise<string> {

    try {
      const template = await this.getOAuthPolicyTemplate(templateId);
      
      // Create policy using existing PolicyAuthoringService
      const policyId = await this.policyAuthoringService.createPolicy({
        policyType: template.policyType,
        title: template.title,
        description: template.description,
        templateId,
        customizations,
        complianceFrameworks: template.frameworks,
        authorId: userId,
        version: '1.0',
        approvalRequired: template.template.approvalRequired
      });

      // Log policy creation
      await this.auditService.logEvent({
        eventType: 'OAUTH_POLICY_CREATED',
        details: {
          policyId,
          templateId,
          policyType: template.policyType,
          frameworks: template.frameworks,
          customizations: Object.keys(customizations)

        userId,
        severity: 'MEDIUM'
      });

      return policyId;
 catch (error) {
      await this.auditService.logEvent({
        eventType: 'OAUTH_POLICY_CREATION_FAILED',
        details: {
          templateId,
          error: error.message,
          customizations: Object.keys(customizations)

        userId,
        severity: 'HIGH'
      });
      
      throw new Error(`Failed to create OAuth policy from template ${templateId}: ${error.message}`);



  /**
   * Enforce OAuth client registration policy
   */
  async enforceClientRegistrationPolicy(
    oauthConfig: OAuthConfiguration,
    userId: string
  ): Promise<PolicyEnforcementResult> {

    try {
      // Load OAuth client registration rules
      const rules = await this.loadOAuthPolicyRules('CLIENT_REGISTRATION');
      
      // Build evaluation context
      const context = {
        clientType: oauthConfig.clientType,
        scopes: oauthConfig.scopes,
        redirectUris: oauthConfig.redirectUris,
        environment: oauthConfig.environment,
        securityLevel: oauthConfig.securityLevel,
        complianceRequirements: oauthConfig.complianceRequirements,
        customAttributes: oauthConfig.customAttributes
      };

      // Evaluate rules using existing RuleEvaluationEngine
      const evaluationResult = await this.ruleEvaluationEngine.evaluateRules(rules, context);
      
      // Generate enforcement result
      const enforcementResult: PolicyEnforcementResult = {
        compliant: evaluationResult.passed,
        policyId: evaluationResult.policyId || 'OAUTH_CLIENT_REGISTRATION',
        evaluationId: evaluationResult.evaluationId,
        violations: this.mapViolations(evaluationResult.failures || []),
        recommendations: this.generateRecommendations(evaluationResult, oauthConfig),
        enforcementActions: this.generateEnforcementActions(evaluationResult),
        evaluatedAt: new Date(),
        nextEvaluation: this.calculateNextEvaluation('CLIENT_REGISTRATION')
      };

      // Log enforcement result
      await this.auditService.logEvent({
        eventType: 'OAUTH_POLICY_ENFORCED',
        details: {
          clientId: oauthConfig.clientId,
          policyType: 'CLIENT_REGISTRATION',
          compliant: enforcementResult.compliant,
          violationCount: enforcementResult.violations.length,
          enforcementActions: enforcementResult.enforcementActions.length

        userId,
        severity: enforcementResult.compliant ? 'LOW' : 'HIGH'
      });

      return enforcementResult;
 catch (error) {
      await this.auditService.logEvent({
        eventType: 'OAUTH_POLICY_ENFORCEMENT_ERROR',
        details: {
          clientId: oauthConfig.clientId,
          policyType: 'CLIENT_REGISTRATION',
          error: error.message

        userId,
        severity: 'HIGH'
      });

      throw new Error(`OAuth client registration policy enforcement failed: ${error.message}`);



  /**
   * Enforce OAuth token lifecycle policy
   */
  async enforceTokenLifecyclePolicy(
    tokenConfig: TokenConfiguration,
    clientId: string,
    userId: string
  ): Promise<PolicyEnforcementResult> {

    try {
      // Get applicable token lifecycle policy
      const policy = await this.policyAuthoringService.getPolicyByType('OAUTH_TOKEN_LIFECYCLE');
      
      // Validate token configuration against policy
      const compliance = await this.validateTokenCompliance(tokenConfig, policy);
      
      const enforcementResult: PolicyEnforcementResult = {
        compliant: compliance.isCompliant,
        policyId: policy.policyId,
        evaluationId: `token-${clientId}-${Date.now()}`,
        violations: compliance.violations,
        recommendations: compliance.recommendations,
        enforcementActions: this.generateEnforcementActions({ passed: compliance.isCompliant }),
        evaluatedAt: new Date(),
        nextEvaluation: this.calculateNextEvaluation('TOKEN_LIFECYCLE')
      };

      // Log enforcement
      await this.auditService.logEvent({
        eventType: 'OAUTH_TOKEN_POLICY_ENFORCED',
        details: {
          clientId,
          policyType: 'TOKEN_LIFECYCLE',
          compliant: enforcementResult.compliant,
          tokenTtl: tokenConfig.accessTokenTtl,
          rotationRequired: tokenConfig.rotationRequired

        userId,
        severity: enforcementResult.compliant ? 'LOW' : 'MEDIUM'
      });

      return enforcementResult;
 catch (error) {
      throw new Error(`Token lifecycle policy enforcement failed: ${error.message}`);



  /**
   * Track OAuth consent acceptance
   */
  async trackOAuthConsentAcceptance(
    userId: string,
    clientId: string,
    scopes: string[],
    consentMetadata: Record<string, any> = {}
  ): Promise<string> {

    try {
      // Use existing PolicyAcceptanceTrackingService for OAuth consent
      const consentId = await this.policyAcceptanceService.recordPolicyAcceptance({
        userId,
        policyType: 'OAUTH_CONSENT',
        acceptanceMethod: 'OAUTH_AUTHORIZATION_FLOW',
        consentData: {
          granularConsents: scopes.map(scope => ({
            consentId: `oauth-${scope}`,
            purpose: scope,
            dataTypes: this.mapScopeToDataTypes(scope),
            required: this.isScopeRequired(scope),
            granted: true,
            timestamp: new Date()
          }))

        acceptanceContext: {
          clientId,
          grantType: 'authorization_code',
          scopes,
          timestamp: new Date(),
          metadata: consentMetadata

      });

      // Log consent acceptance
      await this.auditService.logEvent({
        eventType: 'OAUTH_CONSENT_RECORDED',
        details: {
          consentId,
          userId,
          clientId,
          scopes,
          acceptanceMethod: 'OAUTH_FLOW'

        userId,
        severity: 'LOW'
      });

      return consentId;
 catch (error) {
      throw new Error(`Failed to track OAuth consent acceptance: ${error.message}`);



  /**
   * Generate OAuth compliance report
   */
  async generateOAuthComplianceReport(
    framework: ComplianceFramework,
    scope: {
      startDate: Date;
      endDate: Date;
      clientIds?: string[];
      includePolicies?: OAuthPolicyType[];

    userId: string
  ): Promise<string> {

    try {
      // Use existing ComplianceReportingService
      const reportId = await this.complianceReportingService.generateReport({
        reportType: 'OAUTH_COMPLIANCE_ASSESSMENT',
        framework,
        scope: {
          startDate: scope.startDate,
          endDate: scope.endDate,
          includedSystems: ['oauth_service', 'oauth_guidance_service', 'oauth_policy_service'],
          includedPolicies: scope.includePolicies || [
            'OAUTH_CLIENT_REGISTRATION',
            'OAUTH_TOKEN_LIFECYCLE',
            'OAUTH_CONSENT_MANAGEMENT'
          ],
          additionalFilters: scope.clientIds ? { clientIds: scope.clientIds } : {}

        recipients: [`${userId}@company.com`],
        format: 'PDF',
        includeExecutiveSummary: true,
        includeRecommendations: true,
        includeEvidence: true
      });

      // Log report generation
      await this.auditService.logEvent({
        eventType: 'OAUTH_COMPLIANCE_REPORT_GENERATED',
        details: {
          reportId,
          framework,
          scope: {
            dateRange: `${scope.startDate.toISOString()} - ${scope.endDate.toISOString()}`,
            clientCount: scope.clientIds?.length || 'ALL',
            policyTypes: scope.includePolicies?.length || 'ALL'


        userId,
        severity: 'LOW'
      });

      return reportId;
 catch (error) {
      throw new Error(`Failed to generate OAuth compliance report: ${error.message}`);



  /**
   * Create OAuth governance framework
   */
  async createOAuthGovernanceFramework(
    title: string,
    description: string,
    complianceFrameworks: ComplianceFramework[],
    userId: string
  ): Promise<OAuthGovernanceFramework> {

    try {
      const framework: OAuthGovernanceFramework = {
        frameworkId: `oauth-governance-${Date.now()}`,
        title,
        version: '1.0',
        description,
        policies: await this.getDefaultOAuthPolicyTemplates(complianceFrameworks),
        enforcementMechanisms: this.getDefaultEnforcementMechanisms(),
        reportingSchedule: this.getDefaultReportingSchedule(),
        complianceRequirements: this.getComplianceRequirements(complianceFrameworks),
        approvalWorkflows: this.getDefaultApprovalWorkflows()
      };

      // Store governance framework
      await this.dbService.query(`
        INSERT INTO oauth_governance_frameworks (
          framework_id, title, version, description, configuration, 
          compliance_frameworks, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        framework.frameworkId,
        framework.title,
        framework.version,
        framework.description,
        JSON.stringify(framework),
        JSON.stringify(complianceFrameworks),
        userId
      ]);

      // Log framework creation
      await this.auditService.logEvent({
        eventType: 'OAUTH_GOVERNANCE_FRAMEWORK_CREATED',
        details: {
          frameworkId: framework.frameworkId,
          title: framework.title,
          complianceFrameworks,
          policyCount: framework.policies.length,
          enforcementMechanismCount: framework.enforcementMechanisms.length

        userId,
        severity: 'MEDIUM'
      });

      return framework;
 catch (error) {
      throw new Error(`Failed to create OAuth governance framework: ${error.message}`);



  // Private helper methods

  private async getOAuthPolicyTemplate(templateId: string): Promise<OAuthPolicyTemplate> {

    // Implementation would load from database or predefined templates
    const templates = await this.getDefaultOAuthPolicyTemplates(['OAuth2.1', 'GDPR']);
    const template = templates.find(t => t.templateId === templateId);
    
    if (!template) {
      throw new Error(`OAuth policy template not found: ${templateId}`);

    
    return template;


  private async loadOAuthPolicyRules(policyType: string): Promise<any[]> {

    // Load OAuth-specific rules from RuleEvaluationEngine
    return await this.ruleEvaluationEngine.loadRulesByCategory(`oauth_${policyType.toLowerCase()}`);


  private mapViolations(failures: any[]): PolicyViolation[] {
    return failures.map(failure => ({
      violationId: `violation-${Date.now()}-${Math.random()}`,
      ruleId: failure.ruleId,
      severity: failure.severity || 'MEDIUM',
      title: failure.title,
      description: failure.description,
      field: failure.field,
      actualValue: failure.actualValue,
      expectedValue: failure.expectedValue,
      remediationSuggestion: failure.remediationSuggestion || 'Review policy requirements and update configuration'
    }));


  private generateRecommendations(
    evaluationResult: any, 
    oauthConfig: OAuthConfiguration
  ): PolicyRecommendation[] {
    const recommendations: PolicyRecommendation[] = [];

    // Generate OAuth-specific recommendations based on configuration
    if (oauthConfig.clientType === 'PUBLIC' && !oauthConfig.customAttributes?.pkceRequired) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}-pkce`,
        title: 'Enable PKCE for Public Client',
        description: 'Public OAuth clients should use PKCE for enhanced security',
        priority: 'HIGH',
        category: 'SECURITY',
        implementationGuide: 'Enable PKCE in OAuth client configuration',
        estimatedEffort: '1 hour'
      });


    if (oauthConfig.securityLevel === 'HIGH_SECURITY' && !oauthConfig.customAttributes?.tokenBinding) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}-binding`,
        title: 'Enable Token Binding',
        description: 'High security applications should use token binding',
        priority: 'MEDIUM',
        category: 'SECURITY',
        implementationGuide: 'Configure token binding in OAuth service',
        estimatedEffort: '2 hours'
      });


    return recommendations;


  private generateEnforcementActions(evaluationResult: any): EnforcementAction[] {
    const actions: EnforcementAction[] = [];

    if (!evaluationResult.passed) {
      actions.push({
        actionId: `action-${Date.now()}-block`,
        type: 'REQUIRE_APPROVAL',
        description: 'Client registration requires manual approval due to policy violations',
        automated: false,
        executedAt: new Date()
      });

      actions.push({
        actionId: `action-${Date.now()}-alert`,
        type: 'SEND_ALERT',
        description: 'Security team notified of policy violations',
        automated: true,
        executedAt: new Date()
      });


    return actions;


  private calculateNextEvaluation(policyType: string): Date {
    // Calculate next evaluation based on policy type
    const intervals = {
      'CLIENT_REGISTRATION': 24 * 60 * 60 * 1000, // 24 hours
      'TOKEN_LIFECYCLE': 60 * 60 * 1000, // 1 hour
      'PROVIDER_MANAGEMENT': 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    const interval = intervals[policyType] || 24 * 60 * 60 * 1000;
    return new Date(Date.now() + interval);


  private async validateTokenCompliance(
    tokenConfig: TokenConfiguration,
    policy: any
  ): Promise<{
    isCompliant: boolean;
    violations: PolicyViolation[];
    recommendations: PolicyRecommendation[];
> {

    const violations: PolicyViolation[] = [];
    const recommendations: PolicyRecommendation[] = [];

    // Validate token TTL
    if (tokenConfig.accessTokenTtl > 3600) { // 1 hour max
      violations.push({
        violationId: `violation-${Date.now()}-ttl`,
        ruleId: 'OAUTH-TOKEN-TTL-001',
        severity: 'MEDIUM',
        title: 'Access Token TTL Too Long',
        description: 'Access token lifetime exceeds security policy maximum',
        field: 'accessTokenTtl',
        actualValue: tokenConfig.accessTokenTtl,
        expectedValue: 3600,
        remediationSuggestion: 'Reduce access token TTL to maximum 1 hour'
      });


    // Validate refresh token rotation
    if (!tokenConfig.rotationRequired) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}-rotation`,
        title: 'Enable Refresh Token Rotation',
        description: 'Refresh token rotation improves security',
        priority: 'MEDIUM',
        category: 'SECURITY',
        implementationGuide: 'Enable refresh token rotation in token configuration',
        estimatedEffort: '1 hour'
      });


    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    };


  private mapScopeToDataTypes(scope: string): string[] {
    const scopeDataMapping = {
      'profile': ['name', 'email', 'picture'],
      'email': ['email', 'email_verified'],
      'openid': ['user_id', 'authentication_time'],
      'read:user': ['profile_data', 'preferences'],
      'write:user': ['profile_data', 'preferences']
    };

    return scopeDataMapping[scope] || [scope];


  private isScopeRequired(scope: string): boolean {
    const requiredScopes = ['openid']; // OpenID Connect requires openid scope
    return requiredScopes.includes(scope);


  private async getDefaultOAuthPolicyTemplates(
    frameworks: ComplianceFramework[]
  ): Promise<OAuthPolicyTemplate[]> {

    // Return comprehensive default OAuth policy templates
    return [
      {
        templateId: 'OAUTH-CLIENT-REG-001',
        policyType: 'OAUTH_CLIENT_REGISTRATION',
        title: 'OAuth Client Registration Policy',
        description: 'Defines requirements for OAuth client registration and configuration',
        version: '1.0',
        frameworks,
        targetEnvironments: ['PRODUCTION', 'STAGING'],
        template: {
          title: 'OAuth Client Registration Standards',
          description: 'Security and compliance requirements for OAuth client registration',
          sections: [
            {
              sectionId: 'security-requirements',
              title: 'Security Requirements',
              content: 'All OAuth clients must meet minimum security standards',
              mandatory: true,
              variables: [
                {
                  name: 'clientType',
                  type: 'SELECT',
                  description: 'OAuth client type',
                  required: true,
                  options: ['CONFIDENTIAL', 'PUBLIC', 'MACHINE_TO_MACHINE']

                {
                  name: 'pkceRequired',
                  type: 'BOOLEAN',
                  description: 'Require PKCE for public clients',
                  required: true,
                  defaultValue: true

              ],
              validations: [
                {
                  ruleId: 'PKCE-PUBLIC-REQUIRED',
                  expression: 'clientType === "PUBLIC" && pkceRequired === true',
                  errorMessage: 'PKCE is required for public clients',
                  severity: 'ERROR'

              ]

          ],
          requirements: [
            {
              requirementId: 'OAUTH-REQ-001',
              title: 'PKCE Required for Public Clients',
              description: 'All public clients must use PKCE',
              mandatory: true,
              complianceFrameworks: ['OAuth2.1'],
              enforcementAction: 'BLOCK'

          ],
          exceptions: [],
          reviewSchedule: 'QUARTERLY',
          approvalRequired: true

        validationRules: [],
        enforcementMechanisms: [
          {
            mechanismId: 'CLIENT-REG-ENFORCEMENT',
            name: 'Client Registration Validation',
            trigger: 'ON_CLIENT_REGISTRATION',
            action: 'validateClientConfiguration',
            escalation: 'BLOCK',
            automated: true

        ],
        createdAt: new Date(),
        updatedAt: new Date(}
    ];


  private getDefaultEnforcementMechanisms(): EnforcementMechanism[] {
    return [
      {
        mechanismId: 'AUTO-CLIENT-VALIDATION',
        name: 'Automated Client Validation',
        trigger: 'ON_CLIENT_REGISTRATION',
        action: 'validateAgainstPolicy',
        escalation: 'BLOCK',
        automated: true

      {
        mechanismId: 'TOKEN-LIFECYCLE-MONITORING',
        name: 'Token Lifecycle Monitoring',
        trigger: 'CONTINUOUS',
        action: 'monitorTokenCompliance',
        escalation: 'ALERT',
        automated: true

    ];


  private getDefaultReportingSchedule(): ReportingSchedule {
    return {
      daily: ['OAuth Token Metrics'],
      weekly: ['OAuth Client Status Report'],
      monthly: ['OAuth Security Assessment', 'OAuth Compliance Summary'],
      quarterly: ['OAuth Governance Review', 'OAuth Risk Analysis'],
      annual: ['OAuth Compliance Certification', 'OAuth Security Audit']
    };


  private getComplianceRequirements(frameworks: ComplianceFramework[]): ComplianceRequirement[] {
    return frameworks.map(framework => ({
      frameworkId: framework,
      requirementId: `${framework}-OAUTH-001`,
      title: `${framework} OAuth Compliance`,
      description: `OAuth implementation must comply with ${framework} requirements`,
      controls: [`${framework.toLowerCase()}-oauth-security`, `${framework.toLowerCase()}-consent-management`],
      evidenceRequired: ['policy-documentation', 'implementation-evidence', 'audit-logs'],
      automated: true
    }));


  private getDefaultApprovalWorkflows(): ApprovalWorkflow[] {
    return [
      {
        workflowId: 'OAUTH-CLIENT-APPROVAL',
        name: 'OAuth Client Registration Approval',
        triggers: ['high-risk-client', 'production-environment', 'sensitive-scopes'],
        steps: [
          {
            stepId: 'security-review',
            name: 'Security Team Review',
            approvers: ['security-team'],
            requiredApprovals: 1,
            timeoutHours: 24

          {
            stepId: 'compliance-review',
            name: 'Compliance Officer Review',
            approvers: ['compliance-officer'],
            requiredApprovals: 1,
            timeoutHours: 48

        ],
        timeouts: [
          {
            stepId: 'security-review',
            timeoutHours: 24,
            action: 'ESCALATE'

        ],
        escalations: [
          {
            ruleId: 'TIMEOUT-ESCALATION',
            condition: 'timeout > 24 hours',
            escalateTo: ['security-manager'],
            action: 'notify-and-expedite'

        ]

    ];

