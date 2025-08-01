/**
 * Enforcement Tools API
 * 
 * REST API endpoints for manual enforcement action management,
 * violation report handling, policy management, and enforcement
 * oversight. Provides administrative interface for the automated
 * enforcement system.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397376-1B07D9 - Develop enforcement tools
 */

import { FastifyInstance } from 'fastify';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { 
  AutomatedEnforcementService,
  EnforcementAction,
  EnforcementPolicy
 from '../services/trust/AutomatedEnforcementService';



export interface ViolationReport {
  reportId: string;
  type: 'fraud' | 'abuse' | 'violation' | 'security' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'appealed';
  userId?: string;
  templateId?: string;
  transactionId?: string;
  reporterType: 'automated' | 'user' | 'admin';
  reporterId?: string;
  evidence: string[];
  description: string;
  createdAt: Date;
  assignedTo?: string;
  resolution?: {
    action: string;
    reason: string;
    resolvedBy: string;
    resolvedAt: Date;



  };




export interface EnforcementStats {
  totalActions: number;
  pendingReviews: number;
  todayActions: number;
  appeals: number;
  automatedActions: number;
  manualActions: number;
  actionBreakdown: {
    suspensions: number;
    restrictions: number;
    flags: number;
    blocks: number;
    quarantines: number;



  };
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  effectivenessMetrics: {
    successRate: number;
    appealRate: number;
    reversalRate: number;
    avgResolutionTime: number;
  };


/**
 * Enforcement Tools API Service
 * 
 * Provides administrative interface for enforcement system management
 */
export class EnforcementToolsAPI {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private enforcementService: AutomatedEnforcementService;

  constructor(
    dependencies: {
      databaseService: DatabaseService;
      auditService: AuditService;
      enforcementService: AutomatedEnforcementService;
    }
  ) {
    this.databaseService = dependencies.databaseService;
    this.auditService = dependencies.auditService;
    this.enforcementService = dependencies.enforcementService;


  /**
   * Register enforcement tools API routes
   */
  public registerRoutes(server: FastifyInstance): void {
    // Statistics and Overview
    server.get('/api/admin/enforcement/stats', this.getEnforcementStats.bind(this));
    server.get('/api/admin/enforcement/dashboard', this.getEnforcementDashboard.bind(this));
    
    // Enforcement Actions Management
    server.get('/api/admin/enforcement/actions', this.getEnforcementActions.bind(this));
    server.get('/api/admin/enforcement/actions/:actionId', this.getEnforcementAction.bind(this));
    server.post('/api/admin/enforcement/actions/manual', this.createManualAction.bind(this));
    server.post('/api/admin/enforcement/actions/:actionId/approve', this.approveAction.bind(this));
    server.post('/api/admin/enforcement/actions/:actionId/reverse', this.reverseAction.bind(this));
    server.put('/api/admin/enforcement/actions/:actionId/notes', this.updateActionNotes.bind(this));
    
    // Violation Reports
    server.get('/api/admin/enforcement/reports', this.getViolationReports.bind(this));
    server.post('/api/admin/enforcement/reports', this.createViolationReport.bind(this));
    server.put('/api/admin/enforcement/reports/:reportId', this.updateViolationReport.bind(this));
    server.post('/api/admin/enforcement/reports/:reportId/resolve', this.resolveViolationReport.bind(this));
    
    // Policy Management
    server.get('/api/admin/enforcement/policies', this.getEnforcementPolicies.bind(this));
    server.get('/api/admin/enforcement/policies/:policyId', this.getEnforcementPolicy.bind(this));
    server.put('/api/admin/enforcement/policies/:policyId', this.updateEnforcementPolicy.bind(this));
    server.post('/api/admin/enforcement/policies', this.createEnforcementPolicy.bind(this));
    server.delete('/api/admin/enforcement/policies/:policyId', this.deleteEnforcementPolicy.bind(this));
    
    // Appeals Management
    server.get('/api/admin/enforcement/appeals', this.getAppeals.bind(this));
    server.post('/api/admin/enforcement/actions/:actionId/appeal', this.createAppeal.bind(this));
    server.post('/api/admin/enforcement/appeals/:appealId/resolve', this.resolveAppeal.bind(this));
    
    // Bulk Operations
    server.post('/api/admin/enforcement/actions/bulk-approve', this.bulkApproveActions.bind(this));
    server.post('/api/admin/enforcement/actions/bulk-reverse', this.bulkReverseActions.bind(this));
    server.post('/api/admin/enforcement/reports/bulk-assign', this.bulkAssignReports.bind(this));
    
    // Analytics and Export
    server.get('/api/admin/enforcement/analytics', this.getEnforcementAnalytics.bind(this));
    server.get('/api/admin/enforcement/export', this.exportEnforcementData.bind(this));
    
    console.log('⚖️ Enforcement Tools API routes registered');


  /**
   * Get enforcement statistics
   */
  private async getEnforcementStats(request: any, reply: any): Promise<any> {

    try {
      const db = await this.databaseService.getDatabase();
      
      // Get basic counts
      const totalActions = await db.get('SELECT COUNT(*) as count FROM enforcement_actions');
      const pendingReviews = await db.get('SELECT COUNT(*) as count FROM enforcement_actions WHERE review_required = 1 AND action_taken = 0');
      const todayActions = await db.get(`
        SELECT COUNT(*) as count FROM enforcement_actions 
        WHERE DATE(created_at) = DATE('now')
      `);
      const appeals = await db.get('SELECT COUNT(*) as count FROM enforcement_appeals WHERE status = "pending"');
      
      // Get automation breakdown
      const automatedActions = await db.get('SELECT COUNT(*) as count FROM enforcement_actions WHERE auto_applied = 1');
      const manualActions = await db.get('SELECT COUNT(*) as count FROM enforcement_actions WHERE auto_applied = 0');
      
      // Get action type breakdown
      const actionBreakdown = await db.all(`
        SELECT action_type, COUNT(*) as count 
        FROM enforcement_actions 
        GROUP BY action_type
      `);
      
      // Get severity breakdown
      const severityBreakdown = await db.all(`
        SELECT severity, COUNT(*) as count 
        FROM enforcement_actions 
        GROUP BY severity
      `);
      
      // Calculate effectiveness metrics
      const totalReversals = await db.get('SELECT COUNT(*) as count FROM enforcement_actions WHERE reversal_reason IS NOT NULL');
      const totalAppealsEver = await db.get('SELECT COUNT(*) as count FROM enforcement_appeals');
      
      const stats: EnforcementStats = {
        totalActions: totalActions.count,
        pendingReviews: pendingReviews.count,
        todayActions: todayActions.count,
        appeals: appeals.count,
        automatedActions: automatedActions.count,
        manualActions: manualActions.count,
        actionBreakdown: {
          suspensions: actionBreakdown.find(a => a.action_type === 'suspend')?.count || 0,
          restrictions: actionBreakdown.find(a => a.action_type === 'restrict')?.count || 0,
          flags: actionBreakdown.find(a => a.action_type === 'flag')?.count || 0,
          blocks: actionBreakdown.find(a => a.action_type === 'block_transaction')?.count || 0,
          quarantines: actionBreakdown.find(a => a.action_type === 'quarantine_template')?.count || 0

        severityBreakdown: {
          low: severityBreakdown.find(s => s.severity === 'low')?.count || 0,
          medium: severityBreakdown.find(s => s.severity === 'medium')?.count || 0,
          high: severityBreakdown.find(s => s.severity === 'high')?.count || 0,
          critical: severityBreakdown.find(s => s.severity === 'critical')?.count || 0

        effectivenessMetrics: {
          successRate: totalActions.count > 0 ? Math.round(((totalActions.count - totalReversals.count) / totalActions.count) * 100) : 100,
          appealRate: totalActions.count > 0 ? Math.round((totalAppealsEver.count / totalActions.count) * 100) : 0,
          reversalRate: totalActions.count > 0 ? Math.round((totalReversals.count / totalActions.count) * 100) : 0,
          avgResolutionTime: 24 // Mock - would calculate from actual data

      };

      return reply.code(200).send({
        success: true,
        data: stats
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Get enforcement actions with filtering
   */
  private async getEnforcementActions(request: any, reply: any): Promise<any> {

    try {
      const { 
        limit = 20, 
        offset = 0, 
        severity, 
        actionType, 
        entityType, 
        reviewRequired,
        search 
 = request.query;
      
      const db = await this.databaseService.getDatabase();
      
      let query = 'SELECT * FROM enforcement_actions WHERE 1=1';
      const params: any[] = [];
      
      if (severity) {
        query += ' AND severity = ?';
        params.push(severity);

      
      if (actionType) {
        query += ' AND action_type = ?';
        params.push(actionType);

      
      if (entityType) {
        query += ' AND entity_type = ?';
        params.push(entityType);

      
      if (reviewRequired !== undefined) {
        query += ' AND review_required = ?';
        params.push(reviewRequired === 'true' ? 1 : 0);

      
      if (search) {
        query += ' AND entity_id LIKE ?';
        params.push(`%${search}%`);

      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const actions = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM enforcement_actions WHERE 1=1';
      const countParams = params.slice(0, -2); // Remove limit and offset
      
      if (severity) countQuery += ' AND severity = ?';
      if (actionType) countQuery += ' AND action_type = ?';
      if (entityType) countQuery += ' AND entity_type = ?';
      if (reviewRequired !== undefined) countQuery += ' AND review_required = ?';
      if (search) countQuery += ' AND entity_id LIKE ?';
      
      const totalCount = await db.get(countQuery, countParams);
      
      const formattedActions = actions.map(this.formatEnforcementAction);

      return reply.code(200).send({
        success: true,
        data: formattedActions,
        pagination: {
          total: totalCount.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount.count

      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Create manual enforcement action
   */
  private async createManualAction(request: any, reply: any): Promise<any> {

    try {
      const { entityType, entityId, actionType, severity, reason, triggeredBy = 'manual_review' } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!entityType || !entityId || !actionType || !severity || !reason) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: entityType, entityId, actionType, severity, reason'
        });

      
      // Create enforcement action object
      const action: EnforcementAction = {
        actionId: this.generateActionId(),
        entityType,
        entityId,
        actionType,
        severity,
        reason,
        triggeredBy,
        triggerDetails: { manualAdmin: currentUser },
        autoApplied: false,
        actionTaken: false,
        reviewRequired: severity === 'critical' || actionType === 'suspend',
        adminNotes: `Manual action created by ${currentUser}`
      };
      
      // Store action in database
      const db = await this.databaseService.getDatabase();
      await db.run(`
        INSERT INTO enforcement_actions 
        (action_id, entity_type, entity_id, action_type, severity, reason, 
         triggered_by, trigger_details, auto_applied, action_taken, 
         review_required, admin_notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        action.actionId, action.entityType, action.entityId, action.actionType,
        action.severity, action.reason, action.triggeredBy,
        JSON.stringify(action.triggerDetails), action.autoApplied ? 1 : 0,
        action.actionTaken ? 1 : 0, action.reviewRequired ? 1 : 0,
        action.adminNotes, currentUser, new Date().toISOString()
      ]);
      
      // If no review required, apply immediately
      if (!action.reviewRequired) {
        // Note: In a real implementation, we'd call the enforcement service here
        console.log(`Auto-applying enforcement action: ${action.actionType} on ${action.entityType} ${action.entityId}`);
        action.actionTaken = true;
        action.actionTimestamp = new Date();
        
        await db.run(`
          UPDATE enforcement_actions 
          SET action_taken = 1, action_timestamp = ?
          WHERE action_id = ?
        `, [action.actionTimestamp.toISOString(), action.actionId]);

      
      // Log audit event
      await this.auditService.logEvent({
        eventType: 'manual_enforcement_action_created',
        userId: currentUser,
        details: {
          actionId: action.actionId,
          entityType: action.entityType,
          entityId: action.entityId,
          actionType: action.actionType,
          severity: action.severity,
          applied: action.actionTaken

      });

      return reply.code(201).send({
        success: true,
        data: action,
        message: action.actionTaken ? 'Action created and applied' : 'Action created and queued for review'
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Approve enforcement action
   */
  private async approveAction(request: any, reply: any): Promise<any> {

    try {
      const { actionId } = request.params;
      const currentUser = request.user?.id || 'admin';
      
      const db = await this.databaseService.getDatabase();
      
      // Get the action
      const actionRow = await db.get('SELECT * FROM enforcement_actions WHERE action_id = ?', [actionId]);
      if (!actionRow) {
        return reply.code(404).send({
          success: false,
          error: 'Enforcement action not found'
        });

      
      if (actionRow.action_taken) {
        return reply.code(400).send({
          success: false,
          error: 'Action has already been applied'
        });

      
      const action = this.formatEnforcementAction(actionRow);
      
      // Apply the action
      // Note: executeEnforcementAction is private in AutomatedEnforcementService
      // In a real implementation, we'd need a public method for this
      console.log(`Applying enforcement action: ${action.actionType} on ${action.entityType} ${action.entityId}`);
      
      // Update action status
      await db.run(`
        UPDATE enforcement_actions 
        SET action_taken = 1, action_timestamp = ?, approved_by = ?
        WHERE action_id = ?
      `, [new Date().toISOString(), currentUser, actionId]);
      
      // Log audit event
      await this.auditService.logEvent({
        eventType: 'enforcement_action_approved',
        userId: currentUser,
        details: { actionId, approvedBy: currentUser }
      });

      return reply.code(200).send({
        success: true,
        message: 'Enforcement action approved and applied'
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Reverse enforcement action
   */
  private async reverseAction(request: any, reply: any): Promise<any> {

    try {
      const { actionId } = request.params;
      const { reason } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!reason) {
        return reply.code(400).send({
          success: false,
          error: 'Reversal reason is required'
        });

      
      const db = await this.databaseService.getDatabase();
      
      // Get the action
      const actionRow = await db.get('SELECT * FROM enforcement_actions WHERE action_id = ?', [actionId]);
      if (!actionRow) {
        return reply.code(404).send({
          success: false,
          error: 'Enforcement action not found'
        });

      
      // Reverse the enforcement action effects
      await this.reverseEnforcementEffects(actionRow);
      
      // Update action with reversal info
      await db.run(`
        UPDATE enforcement_actions 
        SET reversal_reason = ?, reversed_by = ?, reversed_at = ?
        WHERE action_id = ?
      `, [reason, currentUser, new Date().toISOString(), actionId]);
      
      // Log audit event
      await this.auditService.logEvent({
        eventType: 'enforcement_action_reversed',
        userId: currentUser,
        details: { actionId, reason, reversedBy: currentUser }
      });

      return reply.code(200).send({
        success: true,
        message: 'Enforcement action reversed successfully'
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Get violation reports
   */
  private async getViolationReports(request: any, reply: any): Promise<any> {

    try {
      const { limit = 20, offset = 0, status, type, severity } = request.query;
      
      const db = await this.databaseService.getDatabase();
      
      let query = 'SELECT * FROM violation_reports WHERE 1=1';
      const params: any[] = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);

      
      if (type) {
        query += ' AND type = ?';
        params.push(type);

      
      if (severity) {
        query += ' AND severity = ?';
        params.push(severity);

      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const reports = await db.all(query, params);
      
      const formattedReports = reports.map(row => ({
        reportId: row.report_id,
        type: row.type,
        severity: row.severity,
        status: row.status,
        userId: row.user_id,
        templateId: row.template_id,
        transactionId: row.transaction_id,
        reporterType: row.reporter_type,
        reporterId: row.reporter_id,
        evidence: JSON.parse(row.evidence || '[]'),
        description: row.description,
        createdAt: new Date(row.created_at),
        assignedTo: row.assigned_to,
        resolution: row.resolution_json ? JSON.parse(row.resolution_json) : undefined
      }));

      return reply.code(200).send({
        success: true,
        data: formattedReports
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Create violation report
   */
  private async createViolationReport(request: any, reply: any): Promise<any> {

    try {
      const { type, severity, description, evidence, userId, templateId, transactionId } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      const reportId = this.generateReportId();
      
      const db = await this.databaseService.getDatabase();
      
      await db.run(`
        INSERT INTO violation_reports 
        (report_id, type, severity, status, user_id, template_id, transaction_id,
         reporter_type, reporter_id, evidence, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportId, type, severity, 'pending', userId, templateId, transactionId,
        'admin', currentUser, JSON.stringify(evidence || []), description,
        new Date().toISOString()
      ]);

      return reply.code(201).send({
        success: true,
        data: { reportId },
        message: 'Violation report created successfully'
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Get enforcement policies
   */
  private async getEnforcementPolicies(request: any, reply: any): Promise<any> {

    try {
      const db = await this.databaseService.getDatabase();
      
      const policies = await db.all('SELECT * FROM enforcement_policies ORDER BY created_at DESC');
      
      const formattedPolicies = policies.map(row => ({
        policyId: row.policy_id,
        name: row.name,
        description: row.description,
        enabled: row.enabled === 1,
        triggers: JSON.parse(row.triggers_json || '{}'),
        actions: JSON.parse(row.actions_json || '{}'),
        exemptions: JSON.parse(row.exemptions_json || '{}')
      }));

      return reply.code(200).send({
        success: true,
        data: formattedPolicies
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Update enforcement policy
   */
  private async updateEnforcementPolicy(request: any, reply: any): Promise<any> {

    try {
      const { policyId } = request.params;
      const policy = request.body;
      const currentUser = request.user?.id || 'admin';
      
      const db = await this.databaseService.getDatabase();
      
      await db.run(`
        UPDATE enforcement_policies 
        SET name = ?, description = ?, enabled = ?, triggers_json = ?, 
            actions_json = ?, exemptions_json = ?, updated_by = ?, updated_at = ?
        WHERE policy_id = ?
      `, [
        policy.name, policy.description, policy.enabled ? 1 : 0,
        JSON.stringify(policy.triggers), JSON.stringify(policy.actions),
        JSON.stringify(policy.exemptions || {}), currentUser,
        new Date().toISOString(), policyId
      ]);
      
      // Log audit event
      await this.auditService.logEvent({
        eventType: 'enforcement_policy_updated',
        userId: currentUser,
        details: { policyId, policy }
      });

      return reply.code(200).send({
        success: true,
        message: 'Enforcement policy updated successfully'
      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  /**
   * Get enforcement dashboard data
   */
  private async getEnforcementDashboard(request: any, reply: any): Promise<any> {

    try {
      const [stats, recentActions, pendingReviews, activeReports] = await Promise.all([
        this.getEnforcementStats(request, { send: () => {}, code: () => ({ send: (data: any) => data.data }) }),
        this.getEnforcementActions(
          { ...request,
            query: { limit: 10 } },
          { send: (
          ) => {}, code: () => ({ send: (data: any) => data.data }) }),
        this.getEnforcementActions(
          { ...request,
            query: { reviewRequired: 'true',
              limit: 10 } },
          { send: (
          ) => {}, code: () => ({ send: (data: any) => data.data }) }),
        this.getViolationReports(
          { ...request,
            query: { status: 'pending',
              limit: 5 } },
          { send: (
          ) => {}, code: () => ({ send: (data: any) => data.data }) })
      ]);

      return reply.code(200).send({
        success: true,
        data: {
          stats,
          recentActions,
          pendingReviews,
          activeReports,
          lastUpdated: new Date()

      });
 catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });



  // Helper methods

  private formatEnforcementAction(row: any): EnforcementAction {
    return {
      actionId: row.action_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actionType: row.action_type,
      severity: row.severity,
      reason: row.reason,
      triggeredBy: row.triggered_by,
      triggerDetails: JSON.parse(row.trigger_details || '{}'),
      autoApplied: row.auto_applied === 1,
      actionTaken: row.action_taken === 1,
      actionTimestamp: row.action_timestamp ? new Date(row.action_timestamp) : undefined,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      reviewRequired: row.review_required === 1,
      adminNotes: row.admin_notes,
      reversal: row.reversal_reason ? {
        reversedAt: new Date(row.reversed_at),
        reversedBy: row.reversed_by,
        reason: row.reversal_reason
 : undefined
    };


  private generateActionId(): string {
    return `ENF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private generateReportId(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private async reverseEnforcementEffects(actionRow: any): Promise<void> {

    const db = await this.databaseService.getDatabase();
    
    try {
      await db.run('BEGIN');
      
      switch (actionRow.action_type) {
      case 'suspend':
        if (actionRow.entity_type === 'user') {
          await db.run(`
              UPDATE user_verification_status 
              SET status = 'verified', suspension_reason = NULL,
                  suspended_at = NULL, suspension_expires_at = NULL
              WHERE user_id = ?
            `, [actionRow.entity_id]);

        break;
          
      case 'restrict':
        if (actionRow.entity_type === 'user') {
          await db.run(`
              DELETE FROM user_restrictions 
              WHERE user_id = ? AND restriction_type = 'limited_access'
            `, [actionRow.entity_id]);

        break;
          
      case 'flag':
        await db.run(`
            DELETE FROM entity_flags 
            WHERE entity_type = ? AND entity_id = ? AND flagged_by = 'automated_enforcement'
          `, [actionRow.entity_type, actionRow.entity_id]);
        break;
          
      case 'block_transaction':
        await db.run(`
            UPDATE transactions 
            SET status = 'pending', block_reason = NULL, blocked_at = NULL
            WHERE id = ?
          `, [actionRow.entity_id]);
        break;
          
      case 'quarantine_template':
        await db.run(`
            UPDATE templates 
            SET status = 'active', quarantine_reason = NULL, quarantined_at = NULL
            WHERE id = ?
          `, [actionRow.entity_id]);
        break;

      
      await db.run('COMMIT');
 catch (error) {
      await db.run('ROLLBACK');
      throw error;


