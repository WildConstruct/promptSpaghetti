/**
 * Policy Management Service - Epic 17.5.4
 * 
 * Provides policy management and enforcement tools for marketplace administration.
 * Builds on top of AutomatedEnforcementService to provide manual policy controls.
 * 
 * Task: E17-1753114397376-1B07D9 - Develop enforcement tools
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../database';
import { 
  AutomatedEnforcementService,
  EnforcementPolicy,
  EnforcementAction
 from '../services/trust/AutomatedEnforcementService';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { AuditService } from '../auth/services/AuditService';



export interface PolicyTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'trust_score' | 'fraud_detection' | 'content_quality' | 'user_behavior' | 'transaction_monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  defaultConfig: Partial<EnforcementPolicy>;
  isSystemTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;







export interface PolicyViolation {
  violationId: string;
  policyId: string;
  entityType: 'user' | 'template' | 'transaction';
  entityId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: unknown;
  detectedAt: Date;
  status: 'pending' | 'reviewed' | 'dismissed' | 'enforced';
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  enforcementActions?: string[];







export interface AdminEnforcementRequest {
  requestId: string;
  entityType: 'user' | 'template' | 'transaction';
  entityId: string;
  actionType: 'suspend' | 'restrict' | 'flag' | 'require_verification' | 'block_transaction' | 'quarantine_template';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedAt: Date;
  evidence?: unknown;
  expiresAt?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;







export interface PolicyEnforcementStats {
  totalPolicies: number;
  activePolicies: number;
  totalViolations: number;
  pendingViolations: number;
  enforcementActionsToday: number;
  violationsByCategory: Record<string, number>;
  enforcementByAction: Record<string, number>;
  topViolatedPolicies: Array<{
    policyId: string;
    policyName: string;
    violationCount: number;



>;


export class PolicyManagementService {
  private db: Database;
  private automatedEnforcement: AutomatedEnforcementService;
  private trustScoreService: TrustScoreService;
  private auditService: AuditService;

  constructor(
    database: Database,
    automatedEnforcement: AutomatedEnforcementService,
    trustScoreService: TrustScoreService,
    auditService: AuditService
  ) {
    this.db = database;
    this.automatedEnforcement = automatedEnforcement;
    this.trustScoreService = trustScoreService;
    this.auditService = auditService;


  // =============================================================================
  // Policy Template Management
  // =============================================================================

  /**
   * Create a new policy template
   */
  async createPolicyTemplate(
    template: Omit<PolicyTemplate,
    'templateId' | 'createdAt' | 'updatedAt'>
  ): Promise<PolicyTemplate> {

    const templateId = this.generateTemplateId();
    
    const newTemplate: PolicyTemplate = {
      ...template,
      templateId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.query(`
      INSERT INTO policy_templates 
      (template_id, name, description, category, severity, default_config, is_system_template)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      newTemplate.templateId,
      newTemplate.name,
      newTemplate.description,
      newTemplate.category,
      newTemplate.severity,
      JSON.stringify(newTemplate.defaultConfig),
      newTemplate.isSystemTemplate
    ]);

    return newTemplate;


  /**
   * Get all policy templates
   */
  async getPolicyTemplates(options: {
    category?: string;
    isSystemTemplate?: boolean;
    limit?: number;
    offset?: number;
 = {}): Promise<{ templates: PolicyTemplate[]; total: number }> {

    const { category, isSystemTemplate, limit = 50, offset = 0 } = options;
    
    let query = `
      SELECT template_id, name, description, category, severity, default_config, 
             is_system_template, created_at, updated_at
      FROM policy_templates
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;


    if (isSystemTemplate !== undefined) {
      params.push(isSystemTemplate);
      query += ` AND is_system_template = $${params.length}`;


    query += ' ORDER BY created_at DESC';

    // Get total count
    const countResult = await this.db.query(
      query.replace('SELECT template_id, name, description, category, severity, default_config, is_system_template, created_at, updated_at',
        'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await this.db.query(query, params);

    const templates = result.rows.map(row => ({
      templateId: row.template_id,
      name: row.name,
      description: row.description,
      category: row.category,
      severity: row.severity,
      defaultConfig: JSON.parse(row.default_config || '{}'),
      isSystemTemplate: row.is_system_template,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { templates, total };


  /**
   * Create policy from template
   */
  async createPolicyFromTemplate(
    templateId: string,
    overrides: Partial<EnforcementPolicy> = {}
  ): Promise<EnforcementPolicy> {

    const template = await this.getPolicyTemplate(templateId);
    if (!template) {
      throw new Error(`Policy template not found: ${templateId}`);


    const policy: EnforcementPolicy = {
      policyId: this.generatePolicyId(),
      name: overrides.name || `${template.name} Policy`,
      description: overrides.description || template.description,
      enabled: overrides.enabled !== undefined ? overrides.enabled : true,
      triggers: { ...template.defaultConfig.triggers, ...overrides.triggers },
      actions: { ...template.defaultConfig.actions, ...overrides.actions },
      exemptions: { ...template.defaultConfig.exemptions, ...overrides.exemptions }
    };

    // Store the policy via AutomatedEnforcementService
    await this.storeEnforcementPolicy(policy);

    await this.auditService.logEvent({
      userId: 'admin',
      action: 'policy_created_from_template',
      details: {
        templateId: template.templateId,
        policyId: policy.policyId,
        policyName: policy.name

      severity: 'info'
    });

    return policy;


  // =============================================================================
  // Violation Detection and Management
  // =============================================================================

  /**
   * Scan for policy violations
   */
  async scanForViolations(options: {
    entityType?: 'user' | 'template' | 'transaction';
    entityIds?: string[];
    policyIds?: string[];
    severity?: 'low' | 'medium' | 'high' | 'critical';
 = {}): Promise<PolicyViolation[]> {

    console.log('🔍 Scanning for policy violations', options);
    
    const violations: PolicyViolation[] = [];
    const policies = await this.getActivePolicies(options.policyIds);

    for (const policy of policies) {
      const policyViolations = await this.scanPolicyViolations(policy, options);
      violations.push(...policyViolations);


    // Store violations in database
    for (const violation of violations) {
      await this.storeViolation(violation);


    return violations;


  /**
   * Get policy violations
   */
  async getPolicyViolations(options: {
    status?: 'pending' | 'reviewed' | 'dismissed' | 'enforced';
    entityType?: 'user' | 'template' | 'transaction';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    limit?: number;
    offset?: number;
 = {}): Promise<{ violations: PolicyViolation[]; total: number }> {

    const { status, entityType, severity, limit = 50, offset = 0 } = options;
    
    let query = `
      SELECT violation_id, policy_id, entity_type, entity_id, violation_type, 
             severity, evidence, detected_at, status, reviewed_by, reviewed_at, 
             notes, enforcement_actions
      FROM policy_violations
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;


    if (entityType) {
      params.push(entityType);
      query += ` AND entity_type = $${params.length}`;


    if (severity) {
      params.push(severity);
      query += ` AND severity = $${params.length}`;


    query += ' ORDER BY detected_at DESC';

    // Get total count
    const countResult = await this.db.query(query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM'), params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await this.db.query(query, params);

    const violations = result.rows.map(row => ({
      violationId: row.violation_id,
      policyId: row.policy_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      violationType: row.violation_type,
      severity: row.severity,
      evidence: JSON.parse(row.evidence || '{}'),
      detectedAt: row.detected_at,
      status: row.status,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      notes: row.notes,
      enforcementActions: JSON.parse(row.enforcement_actions || '[]')
    }));

    return { violations, total };


  /**
   * Review violation
   */
  async reviewViolation(
    violationId: string,
    decision: 'dismiss' | 'enforce',
    reviewedBy: string,
    notes?: string,
    enforcementOverrides?: Partial<EnforcementAction>
  ): Promise<void> {

    const violation = await this.getViolation(violationId);
    if (!violation) {
      throw new Error(`Violation not found: ${violationId}`);


    if (decision === 'enforce') {
      // Create enforcement action
      const enforcementAction = await this.createEnforcementFromViolation(violation, enforcementOverrides);
      
      // Apply the enforcement
      await this.automatedEnforcement.applyEnforcementActions([enforcementAction]);

      // Update violation with enforcement details
      await this.db.query(`
        UPDATE policy_violations 
        SET status = 'enforced', 
            reviewed_by = $2, 
            reviewed_at = NOW(), 
            notes = $3,
            enforcement_actions = $4
        WHERE violation_id = $1
      `, [violationId, reviewedBy, notes, JSON.stringify([enforcementAction.actionId])]);
 else {
      // Dismiss violation
      await this.db.query(`
        UPDATE policy_violations 
        SET status = 'dismissed', 
            reviewed_by = $2, 
            reviewed_at = NOW(), 
            notes = $3
        WHERE violation_id = $1
      `, [violationId, reviewedBy, notes]);


    await this.auditService.logEvent({
      userId: reviewedBy,
      action: 'violation_reviewed',
      details: {
        violationId,
        decision,
        notes,
        entityType: violation.entityType,
        entityId: violation.entityId

      severity: decision === 'enforce' ? 'warning' : 'info'
    });


  // =============================================================================
  // Manual Enforcement Requests
  // =============================================================================

  /**
   * Create manual enforcement request
   */
  async createEnforcementRequest(
    request: Omit<AdminEnforcementRequest,
    'requestId' | 'requestedAt' | 'status'>
  ): Promise<AdminEnforcementRequest> {

    const requestId = this.generateRequestId();
    
    const newRequest: AdminEnforcementRequest = {
      ...request,
      requestId,
      requestedAt: new Date(),
      status: 'pending'
    };

    await this.db.query(`
      INSERT INTO enforcement_requests 
      (request_id, entity_type, entity_id, action_type, reason, severity, 
       requested_by, evidence, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newRequest.requestId,
      newRequest.entityType,
      newRequest.entityId,
      newRequest.actionType,
      newRequest.reason,
      newRequest.severity,
      newRequest.requestedBy,
      JSON.stringify(newRequest.evidence || {}),
      newRequest.expiresAt
    ]);

    await this.auditService.logEvent({
      userId: request.requestedBy,
      action: 'enforcement_request_created',
      details: {
        requestId: newRequest.requestId,
        entityType: newRequest.entityType,
        entityId: newRequest.entityId,
        actionType: newRequest.actionType

      severity: 'info'
    });

    return newRequest;


  /**
   * Process enforcement request
   */
  async processEnforcementRequest(
    requestId: string,
    decision: 'approve' | 'reject',
    approvedBy: string,
    rejectionReason?: string
  ): Promise<void> {

    const request = await this.getEnforcementRequest(requestId);
    if (!request) {
      throw new Error(`Enforcement request not found: ${requestId}`);


    if (decision === 'approve') {
      // Create and execute enforcement action
      const enforcementAction = await this.createEnforcementFromRequest(request);
      await this.automatedEnforcement.applyEnforcementActions([enforcementAction]);

      await this.db.query(`
        UPDATE enforcement_requests 
        SET status = 'executed', approved_by = $2, approved_at = NOW()
        WHERE request_id = $1
      `, [requestId, approvedBy]);
 else {
      await this.db.query(`
        UPDATE enforcement_requests 
        SET status = 'rejected', approved_by = $2, approved_at = NOW(), rejection_reason = $3
        WHERE request_id = $1
      `, [requestId, approvedBy, rejectionReason]);


    await this.auditService.logEvent({
      userId: approvedBy,
      action: 'enforcement_request_processed',
      details: {
        requestId,
        decision,
        rejectionReason,
        entityType: request.entityType,
        entityId: request.entityId

      severity: decision === 'approve' ? 'warning' : 'info'
    });


  // =============================================================================
  // Statistics and Analytics
  // =============================================================================

  /**
   * Get policy enforcement statistics
   */
  async getEnforcementStats(): Promise<PolicyEnforcementStats> {

    const [
      totalPolicies,
      activePolicies,
      totalViolations,
      pendingViolations,
      todayEnforcement,
      violationsByCategory,
      enforcementByAction,
      topViolated
    ] = await Promise.all([
      this.getTotalPoliciesCount(),
      this.getActivePoliciesCount(),
      this.getTotalViolationsCount(),
      this.getPendingViolationsCount(),
      this.getTodayEnforcementCount(),
      this.getViolationsByCategory(),
      this.getEnforcementByAction(),
      this.getTopViolatedPolicies()
    ]);

    return {
      totalPolicies,
      activePolicies,
      totalViolations,
      pendingViolations,
      enforcementActionsToday: todayEnforcement,
      violationsByCategory,
      enforcementByAction,
      topViolatedPolicies: topViolated
    };


  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async getPolicyTemplate(templateId: string): Promise<PolicyTemplate | null> {

    const result = await this.db.query(`
      SELECT template_id, name, description, category, severity, default_config, 
             is_system_template, created_at, updated_at
      FROM policy_templates
      WHERE template_id = $1
    `, [templateId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      templateId: row.template_id,
      name: row.name,
      description: row.description,
      category: row.category,
      severity: row.severity,
      defaultConfig: JSON.parse(row.default_config || '{}'),
      isSystemTemplate: row.is_system_template,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };


  private async getActivePolicies(policyIds?: string[]): Promise<EnforcementPolicy[]> {

    // This would integrate with AutomatedEnforcementService to get active policies
    // For now, return empty array as placeholder
    return [];


  private async scanPolicyViolations(policy: EnforcementPolicy, options: unknown): Promise<PolicyViolation[]> {

    // Implementation would scan for violations based on policy rules
    // This is a placeholder that would integrate with trust scoring and detection logic
    return [];


  private async storeViolation(violation: PolicyViolation): Promise<void> {

    await this.db.query(`
      INSERT INTO policy_violations 
      (violation_id, policy_id, entity_type, entity_id, violation_type, severity, 
       evidence, detected_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (violation_id) DO NOTHING
    `, [
      violation.violationId,
      violation.policyId,
      violation.entityType,
      violation.entityId,
      violation.violationType,
      violation.severity,
      JSON.stringify(violation.evidence),
      violation.detectedAt,
      violation.status
    ]);


  private async getViolation(violationId: string): Promise<PolicyViolation | null> {

    const result = await this.db.query(`
      SELECT * FROM policy_violations WHERE violation_id = $1
    `, [violationId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      violationId: row.violation_id,
      policyId: row.policy_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      violationType: row.violation_type,
      severity: row.severity,
      evidence: JSON.parse(row.evidence || '{}'),
      detectedAt: row.detected_at,
      status: row.status,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      notes: row.notes,
      enforcementActions: JSON.parse(row.enforcement_actions || '[]')
    };


  private async createEnforcementFromViolation(
    violation: PolicyViolation, 
    overrides?: Partial<EnforcementAction>
  ): Promise<EnforcementAction> {

    return {
      actionId: this.generateActionId(),
      entityType: violation.entityType,
      entityId: violation.entityId,
      actionType: overrides?.actionType || this.getDefaultActionForSeverity(violation.severity),
      severity: violation.severity,
      reason: `Policy violation: ${violation.violationType}`,
      triggeredBy: 'manual_review',
      triggerDetails: { violationId: violation.violationId, evidence: violation.evidence },
      autoApplied: false,
      actionTaken: false,
      reviewRequired: true,
      ...overrides
    };


  private async getEnforcementRequest(requestId: string): Promise<AdminEnforcementRequest | null> {

    const result = await this.db.query(`
      SELECT * FROM enforcement_requests WHERE request_id = $1
    `, [requestId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      requestId: row.request_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actionType: row.action_type,
      reason: row.reason,
      severity: row.severity,
      requestedBy: row.requested_by,
      requestedAt: row.requested_at,
      evidence: JSON.parse(row.evidence || '{}'),
      expiresAt: row.expires_at,
      status: row.status,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      rejectionReason: row.rejection_reason
    };


  private async createEnforcementFromRequest(request: AdminEnforcementRequest): Promise<EnforcementAction> {

    return {
      actionId: this.generateActionId(),
      entityType: request.entityType,
      entityId: request.entityId,
      actionType: request.actionType,
      severity: request.severity,
      reason: request.reason,
      triggeredBy: 'manual_review',
      triggerDetails: { requestId: request.requestId, evidence: request.evidence },
      autoApplied: true,
      actionTaken: false,
      reviewRequired: false,
      expiresAt: request.expiresAt
    };


  private async storeEnforcementPolicy(policy: EnforcementPolicy): Promise<void> {

    // This would integrate with AutomatedEnforcementService's config system
    console.log(`📝 Storing enforcement policy: ${policy.name}`);


  // Statistics helper methods
  private async getTotalPoliciesCount(): Promise<number> {

    const result = await this.db.query('SELECT COUNT(*) FROM policy_templates');
    return parseInt(result.rows[0].count);


  private async getActivePoliciesCount(): Promise<number> {

    // This would count active policies from the enforcement system
    return 0;


  private async getTotalViolationsCount(): Promise<number> {

    const result = await this.db.query('SELECT COUNT(*) FROM policy_violations');
    return parseInt(result.rows[0].count || '0');


  private async getPendingViolationsCount(): Promise<number> {

    const result = await this.db.query('SELECT COUNT(*) FROM policy_violations WHERE status = \'pending\'');
    return parseInt(result.rows[0].count || '0');


  private async getTodayEnforcementCount(): Promise<number> {

    const result = await this.db.query(`
      SELECT COUNT(*) FROM enforcement_actions 
      WHERE action_timestamp >= CURRENT_DATE
    `);
    return parseInt(result.rows[0].count || '0');


  private async getViolationsByCategory(): Promise<Record<string, number>> {
    // Placeholder implementation
    return {};


  private async getEnforcementByAction(): Promise<Record<string, number>> {
    // Placeholder implementation  
    return {};


  private async getTopViolatedPolicies(): Promise<Array<{ policyId: string; policyName: string; violationCount: number }>> {
    // Placeholder implementation
    return [];


  // ID generation methods
  private generateTemplateId(): string {
    return `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private generatePolicyId(): string {
    return `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private generateRequestId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private generateActionId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private getDefaultActionForSeverity(severity: 'low' | 'medium' | 'high' | 'critical'): 'suspend' | 'restrict' | 'flag' | 'require_verification' | 'block_transaction' | 'quarantine_template' {
    switch (severity) {
    case 'critical': return 'suspend';
    case 'high': return 'restrict';
    case 'medium': return 'flag';
    case 'low': return 'flag';
    default: return 'flag';


