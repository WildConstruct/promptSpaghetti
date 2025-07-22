/**
 * User Satisfaction Dashboard API
 * 
 * REST API endpoints for the administrative user satisfaction dashboard,
 * providing real-time satisfaction metrics, analytics, and survey management
 * for Epic 17 Backstage Admin Controls.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397430-2D9B2A - Implement user satisfaction tracking
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserSatisfactionTracker, SatisfactionSurvey, SatisfactionSurveyType } from './UserSatisfactionTracker';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

export interface SatisfactionDashboardAPI {
  // Dashboard Data
  getDashboard(): Promise<any>;
  getMetrics(timeframe?: any, segments?: string[]): Promise<any>;
  getAlerts(filters?: any): Promise<any>;
  
  // Survey Management
  createSurvey(surveyType: SatisfactionSurveyType, context: any): Promise<any>;
  getSurvey(surveyId: string): Promise<any>;
  submitSurvey(surveyId: string, responses: any): Promise<any>;
  
  // Analytics
  getTrends(timeframe?: any): Promise<any>;
  getSegmentAnalysis(segments?: string[]): Promise<any>;
  getFeatureAnalysis(): Promise<any>;
  getUserInsights(userId: string): Promise<any>;
  
  // Administrative Actions
  acknowledgeAlert(alertId: string, userId: string): Promise<any>;
  exportSatisfactionData(filters?: any): Promise<any>;
  generateReport(reportType: string, params?: any): Promise<any>;
}

export interface SatisfactionAPIRequest {
  // Survey Creation
  surveyType: SatisfactionSurveyType;
  userId?: string;
  context?: any;
  
  // Analytics Filters
  timeframe?: {
    start: string;
    end: string;
  };
  segments?: string[];
  
  // Data Export
  format?: 'json' | 'csv' | 'excel';
  includePersonalData?: boolean;
}

export interface SatisfactionAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    totalCount?: number;
    filteredCount?: number;
    lastUpdated?: Date;
    processingTime?: number;
  };
}

/**
 * User Satisfaction Dashboard API
 * 
 * Provides REST endpoints for satisfaction tracking and analytics
 */
export class SatisfactionDashboardAPI {
  private satisfactionTracker: UserSatisfactionTracker;
  private databaseService: DatabaseService;
  private auditService: AuditService;

  constructor(
    satisfactionTracker: UserSatisfactionTracker,
    dependencies: {
      databaseService: DatabaseService;
      auditService: AuditService;
    }
  ) {
    this.satisfactionTracker = satisfactionTracker;
    this.databaseService = dependencies.databaseService;
    this.auditService = dependencies.auditService;
  }

  /**
   * Register satisfaction dashboard routes with Fastify
   */
  public registerRoutes(server: FastifyInstance): void {
    // Dashboard endpoints
    server.get('/api/admin/satisfaction/dashboard', this.handleGetDashboard.bind(this));
    server.get('/api/admin/satisfaction/metrics', this.handleGetMetrics.bind(this));
    server.get('/api/admin/satisfaction/alerts', this.handleGetAlerts.bind(this));
    
    // Survey management endpoints
    server.post('/api/admin/satisfaction/surveys', this.handleCreateSurvey.bind(this));
    server.get('/api/admin/satisfaction/surveys/:id', this.handleGetSurvey.bind(this));
    server.post('/api/admin/satisfaction/surveys/:id/submit', this.handleSubmitSurvey.bind(this));
    
    // User-facing survey endpoints
    server.get('/api/satisfaction/surveys/:id', this.handleGetUserSurvey.bind(this));
    server.post('/api/satisfaction/surveys/:id/responses', this.handleUserSurveyResponse.bind(this));
    
    // Analytics endpoints
    server.get('/api/admin/satisfaction/trends', this.handleGetTrends.bind(this));
    server.get('/api/admin/satisfaction/segments', this.handleGetSegmentAnalysis.bind(this));
    server.get('/api/admin/satisfaction/features', this.handleGetFeatureAnalysis.bind(this));
    server.get('/api/admin/satisfaction/users/:userId/insights', this.handleGetUserInsights.bind(this));
    
    // Administrative action endpoints
    server.post('/api/admin/satisfaction/alerts/:id/acknowledge', this.handleAcknowledgeAlert.bind(this));
    server.post('/api/admin/satisfaction/export', this.handleExportData.bind(this));
    server.post('/api/admin/satisfaction/reports', this.handleGenerateReport.bind(this));
    
    // Survey invitation endpoints
    server.post('/api/admin/satisfaction/invitations', this.handleCreateSurveyInvitation.bind(this));
    server.get('/api/admin/satisfaction/invitations', this.handleGetSurveyInvitations.bind(this));
    
    // Real-time endpoints
    server.get('/api/admin/satisfaction/realtime', this.handleRealtimeData.bind(this));
    server.get('/api/admin/satisfaction/status', this.handleSystemStatus.bind(this));
  }

  /**
   * Get satisfaction dashboard data
   */
  private async handleGetDashboard(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    const startTime = Date.now();
    
    try {
      const query = request.query as any;
      const refreshCache = query.refresh === 'true';
      
      const dashboard = await this.satisfactionTracker.getSatisfactionDashboard(refreshCache);
      
      return reply.code(200).send({
        success: true,
        data: dashboard,
        metadata: {
          lastUpdated: dashboard.timestamp,
          processingTime: Date.now() - startTime,
          dataFreshness: dashboard.dataFreshness
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime
        }
      });
    }
  }

  /**
   * Get satisfaction metrics with filtering
   */
  private async handleGetMetrics(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    const startTime = Date.now();
    
    try {
      const query = request.query as any;
      
      let timeframe: { start: Date; end: Date } | undefined;
      if (query.startDate && query.endDate) {
        timeframe = {
          start: new Date(query.startDate),
          end: new Date(query.endDate)
        };
      }
      
      const segments = query.segments ? 
        Array.isArray(query.segments) ? query.segments : [query.segments] : 
        undefined;
      
      const metrics = await this.satisfactionTracker.getSatisfactionMetrics(timeframe, segments);
      
      return reply.code(200).send({
        success: true,
        data: metrics,
        metadata: {
          timeframe,
          segments,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime
        }
      });
    }
  }

  /**
   * Create new satisfaction survey
   */
  private async handleCreateSurvey(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const body = request.body as any;
      const userId = this.extractUserId(request);
      
      // Validate admin permissions
      await this.validateAdminPermissions(userId, 'create_satisfaction_survey');
      
      const surveyType = body.surveyType;
      const targetUserId = body.userId || userId;
      const context = body.context || {};
      
      const survey = await this.satisfactionTracker.createSatisfactionSurvey(
        targetUserId,
        surveyType,
        context
      );
      
      // Audit survey creation
      await this.auditService.logActivity({
        userId,
        action: 'satisfaction_survey_created',
        details: {
          surveyId: survey.surveyId,
          surveyType,
          targetUserId
        },
        timestamp: new Date()
      } as any);
      
      return reply.code(201).send({
        success: true,
        data: survey,
        message: 'Satisfaction survey created successfully'
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Submit survey response
   */
  private async handleSubmitSurvey(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const { id: surveyId } = request.params as { id: string };
      const body = request.body as any;
      const userId = this.extractUserId(request);
      
      await this.satisfactionTracker.submitSatisfactionSurvey(
        surveyId,
        userId,
        body.responses
      );
      
      return reply.code(200).send({
        success: true,
        message: 'Survey submitted successfully'
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get user-facing survey (public endpoint)
   */
  private async handleGetUserSurvey(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const { id: surveyId } = request.params as { id: string };
      
      // Get survey template from database
      const survey = await this.getSurveyTemplate(surveyId);
      
      if (!survey) {
        return reply.code(404).send({
          success: false,
          error: 'Survey not found or expired'
        });
      }
      
      return reply.code(200).send({
        success: true,
        data: {
          surveyId: survey.surveyId,
          questions: survey.questions,
          surveyType: survey.surveyType,
          expiresAt: survey.expiresAt
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Handle user survey response (public endpoint)
   */
  private async handleUserSurveyResponse(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const { id: surveyId } = request.params as { id: string };
      const body = request.body as any;
      
      // Extract user info from request (could be anonymous)
      const userId = this.extractUserId(request, false); // Allow anonymous
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      
      // Process survey response
      const survey = await this.processSurveyResponse(
        surveyId,
        userId || 'anonymous',
        body.responses,
        { ipAddress, userAgent }
      );
      
      return reply.code(200).send({
        success: true,
        message: 'Thank you for your feedback!',
        data: {
          surveyId: survey.surveyId,
          submittedAt: survey.createdAt
        }
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get satisfaction trends
   */
  private async handleGetTrends(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const query = request.query as any;
      
      const timeframe = query.startDate && query.endDate ? {
        start: new Date(query.startDate),
        end: new Date(query.endDate)
      } : undefined;
      
      const metrics = await this.satisfactionTracker.getSatisfactionMetrics(timeframe);
      
      return reply.code(200).send({
        success: true,
        data: {
          trends: metrics.trends,
          overallTrend: metrics.overallSatisfaction.trend,
          npsProgress: metrics.nps.trend
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Acknowledge satisfaction alert
   */
  private async handleAcknowledgeAlert(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const { id: alertId } = request.params as { id: string };
      const userId = this.extractUserId(request);
      
      // Validate admin permissions
      await this.validateAdminPermissions(userId, 'acknowledge_satisfaction_alert');
      
      await this.satisfactionTracker.acknowledgeSatisfactionAlert(alertId, userId);
      
      return reply.code(200).send({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Export satisfaction data
   */
  private async handleExportData(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const body = request.body as any;
      const userId = this.extractUserId(request);
      
      // Validate admin permissions
      await this.validateAdminPermissions(userId, 'export_satisfaction_data');
      
      const format = body.format || 'json';
      const includePersonalData = body.includePersonalData || false;
      const filters = body.filters || {};
      
      // Generate export data
      const exportData = await this.generateExportData(filters, includePersonalData);
      
      // Format data based on requested format
      let responseData: any;
      let contentType: string;
      
      switch (format) {
        case 'csv':
          responseData = this.formatAsCSV(exportData);
          contentType = 'text/csv';
          break;
        case 'excel':
          responseData = await this.formatAsExcel(exportData);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          responseData = exportData;
          contentType = 'application/json';
      }
      
      // Audit export
      await this.auditService.logActivity({
        userId,
        action: 'satisfaction_data_exported',
        details: {
          format,
          recordCount: Array.isArray(exportData) ? exportData.length : 0,
          includePersonalData
        },
        timestamp: new Date()
      } as any);
      
      return reply
        .code(200)
        .header('Content-Type', contentType)
        .header('Content-Disposition', `attachment; filename="satisfaction-data-${Date.now()}.${format}"`)
        .send(responseData);
        
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate satisfaction report
   */
  private async handleGenerateReport(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const body = request.body as any;
      const userId = this.extractUserId(request);
      
      // Validate admin permissions
      await this.validateAdminPermissions(userId, 'generate_satisfaction_report');
      
      const reportType = body.reportType || 'summary';
      const params = body.params || {};
      
      const report = await this.generateSatisfactionReport(reportType, params);
      
      return reply.code(200).send({
        success: true,
        data: report,
        message: 'Report generated successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get realtime satisfaction data
   */
  private async handleRealtimeData(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const dashboard = await this.satisfactionTracker.getSatisfactionDashboard();
      
      return reply.code(200).send({
        success: true,
        data: dashboard.realtime,
        timestamp: new Date()
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get system status
   */
  private async handleSystemStatus(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const dashboard = await this.satisfactionTracker.getSatisfactionDashboard();
      
      const status = {
        healthy: dashboard.summary.overallScore > 70,
        overallScore: dashboard.summary.overallScore,
        npsScore: dashboard.summary.npsScore,
        responseRate: dashboard.summary.responseRate,
        activeAlerts: dashboard.alerts.length,
        criticalAlerts: dashboard.alerts.filter(a => a.severity === 'critical').length,
        lastUpdated: dashboard.timestamp
      };
      
      return reply.code(200).send({
        success: true,
        data: status
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  // Private helper methods

  /**
   * Extract user ID from request
   */
  private extractUserId(request: FastifyRequest, required = true): string {
    const userId = (request as any).user?.id || (request as any).userId;
    
    if (required && !userId) {
      throw new Error('User authentication required');
    }
    
    return userId || 'anonymous';
  }

  /**
   * Validate admin permissions
   */
  private async validateAdminPermissions(userId: string, permission: string): Promise<void> {
    // This would integrate with the actual permission system
    // For now, just check if user exists
    if (!userId || userId === 'anonymous') {
      throw new Error('Administrative permissions required');
    }
  }

  /**
   * Get survey template from database
   */
  private async getSurveyTemplate(surveyId: string): Promise<any> {
    const rows = await this.databaseService.query(
      'SELECT * FROM survey_templates WHERE survey_id = ? AND expires_at > datetime("now")',
      [surveyId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      surveyId: row.survey_id,
      userId: row.user_id,
      surveyType: row.survey_type,
      context: JSON.parse(row.context || '{}'),
      questions: JSON.parse(row.questions),
      expiresAt: new Date(row.expires_at)
    };
  }

  /**
   * Process survey response from user
   */
  private async processSurveyResponse(
    surveyId: string,
    userId: string,
    responses: any,
    metadata: any
  ): Promise<SatisfactionSurvey> {
    // Convert survey responses into satisfaction survey format
    const surveyTemplate = await this.getSurveyTemplate(surveyId);
    
    if (!surveyTemplate) {
      throw new Error('Survey not found or expired');
    }
    
    // Process responses based on survey type and questions
    const satisfactionData = this.mapResponsesToSatisfactionSurvey(
      surveyTemplate,
      responses,
      metadata
    );
    
    // Record the satisfaction survey
    return await this.satisfactionTracker.recordSatisfactionSurvey(userId, satisfactionData);
  }

  /**
   * Generate export data
   */
  private async generateExportData(filters: any, includePersonalData: boolean): Promise<any[]> {
    // Query satisfaction data based on filters
    let query = 'SELECT * FROM satisfaction_surveys WHERE 1=1';
    const params: any[] = [];
    
    if (filters.startDate) {
      query += ' AND created_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND created_at <= ?';
      params.push(filters.endDate);
    }
    
    if (filters.surveyType) {
      query += ' AND survey_type = ?';
      params.push(filters.surveyType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const rows = await this.databaseService.query(query, params);
    
    // Format data for export, optionally excluding personal data
    return rows.map(row => {
      const data: any = {
        surveyId: row.survey_id,
        surveyType: row.survey_type,
        npsScore: row.nps_score,
        satisfactionRating: row.satisfaction_rating,
        usabilityRating: row.usability_rating,
        valueRating: row.value_rating,
        responseQuality: row.response_quality,
        adminSession: row.admin_session,
        source: row.source,
        createdAt: row.created_at
      };
      
      if (includePersonalData) {
        data.userId = row.user_id;
        data.ipAddress = row.ip_address;
        data.userAgent = row.user_agent;
        data.feedback = JSON.parse(row.feedback || '{}');
      }
      
      return data;
    });
  }

  /**
   * Format data as CSV
   */
  private formatAsCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  /**
   * Format data as Excel (placeholder - would use a library like exceljs)
   */
  private async formatAsExcel(data: any[]): Promise<Buffer> {
    // This would use a library like exceljs to create Excel files
    // For now, return CSV as buffer
    const csv = this.formatAsCSV(data);
    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Generate satisfaction report
   */
  private async generateSatisfactionReport(reportType: string, params: any): Promise<any> {
    const metrics = await this.satisfactionTracker.getSatisfactionMetrics();
    
    switch (reportType) {
      case 'summary':
        return {
          reportType: 'summary',
          generatedAt: new Date(),
          summary: {
            overallSatisfaction: metrics.overallSatisfaction.score,
            npsScore: metrics.nps.score,
            trendDirection: metrics.overallSatisfaction.trend,
            keyInsights: [
              `Overall satisfaction is ${metrics.overallSatisfaction.score}/100`,
              `NPS score is ${metrics.nps.score}`,
              `Satisfaction trend is ${metrics.overallSatisfaction.trend}`
            ]
          },
          categories: metrics.categoryScores,
          segments: metrics.segmentSatisfaction
        };
        
      case 'detailed':
        return {
          reportType: 'detailed',
          generatedAt: new Date(),
          fullMetrics: metrics,
          recommendations: await this.generateRecommendations(metrics)
        };
        
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Map survey responses to satisfaction survey format
   */
  private mapResponsesToSatisfactionSurvey(template: any, responses: any, metadata: any): any {
    // This would contain logic to map questionnaire responses to standardized satisfaction metrics
    return {
      surveyType: template.surveyType,
      context: template.context,
      npsScore: responses.nps || 0,
      satisfactionRating: responses.satisfaction || 0,
      usabilityRating: responses.usability || 0,
      valueRating: responses.value || 0,
      feedback: {
        positiveAspects: responses.positiveAspects || [],
        negativeAspects: responses.negativeAspects || [],
        suggestions: responses.suggestions || [],
        openFeedback: responses.openFeedback
      },
      featureRatings: responses.featureRatings || {},
      completionTime: responses.completionTime || 0,
      responseQuality: responses.responseQuality || 'medium',
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      source: 'api_integration'
    };
  }

  /**
   * Generate recommendations based on metrics
   */
  private async generateRecommendations(metrics: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (metrics.overallSatisfaction.score < 70) {
      recommendations.push('Overall satisfaction is below target. Consider investigating top pain points.');
    }
    
    if (metrics.nps.score < 0) {
      recommendations.push('NPS is negative. Focus on addressing detractor feedback immediately.');
    }
    
    if (metrics.overallSatisfaction.trend === 'declining') {
      recommendations.push('Satisfaction is declining. Review recent changes and user feedback.');
    }
    
    return recommendations;
  }

  // Additional placeholder methods for unimplemented functionality
  private async handleGetSurvey(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
  
  private async handleGetSegmentAnalysis(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
  
  private async handleGetFeatureAnalysis(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
  
  private async handleGetUserInsights(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
  
  private async handleCreateSurveyInvitation(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
  
  private async handleGetSurveyInvitations(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
  
  private async handleGetAlerts(request: FastifyRequest, reply: FastifyReply): Promise<any> {
    return reply.code(501).send({ success: false, error: 'Not implemented' });
  }
}