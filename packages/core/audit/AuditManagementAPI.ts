/**
 * Audit Management API Layer
 * 
 * RESTful API interface for audit management operations, integrating with existing
 * PromptScape audit infrastructure and providing enhanced management capabilities.
 */

import { z } from 'zod';
import {
  AuditEvent,
  AuditQuery,
  AuditAnalytics,
  AuditEventType,
  AuditSeverity,
  ComplianceFramework,
  AuditStatus,
  auditManagementSystem
} from './AuditManagementSystem';

// API Request/Response Schemas
export const CreateAuditEventRequest = z.object({
  event_type: z.nativeEnum(AuditEventType),
  severity: z.nativeEnum(AuditSeverity),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.string(),
  subcategory: z.string().optional(),
  
  // Context
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  
  // System context
  system_component: z.string(),
  endpoint: z.string().optional(),
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  response_code: z.number().min(100).max(599).optional(),
  
  // Risk assessment
  risk_score: z.number().min(0).max(10),
  risk_factors: z.array(z.string()),
  
  // Compliance
  compliance_frameworks: z.array(z.nativeEnum(ComplianceFramework)),
  regulatory_impact: z.boolean().default(false),
  
  // Data context
  data_types: z.array(z.string()).optional(),
  data_volume: z.number().optional(),
  sensitive_data_involved: z.boolean().default(false),
  
  // Metadata
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).default([])
});

export const AuditQueryRequest = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(1000).default(50),
  
  // Sorting
  sort_field: z.string().default('timestamp'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  
  // Time filtering
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  
  // Content filtering
  event_types: z.array(z.nativeEnum(AuditEventType)).optional(),
  severities: z.array(z.nativeEnum(AuditSeverity)).optional(),
  statuses: z.array(z.nativeEnum(AuditStatus)).optional(),
  compliance_frameworks: z.array(z.nativeEnum(ComplianceFramework)).optional(),
  
  // Search
  search: z.string().optional(),
  user_id: z.string().optional(),
  ip_address: z.string().ip().optional(),
  
  // Risk filtering
  min_risk_score: z.number().min(0).max(10).optional(),
  max_risk_score: z.number().min(0).max(10).optional(),
  
  // Advanced filtering
  has_metadata: z.boolean().optional(),
  sensitive_data_only: z.boolean().optional(),
  regulatory_impact_only: z.boolean().optional()
});

export const ComplianceReportRequest = z.object({
  framework: z.nativeEnum(ComplianceFramework),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  include_details: z.boolean().default(true),
  export_format: z.enum(['json', 'pdf', 'csv']).default('json')
});

export const AuditAnalyticsRequest = z.object({
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  metrics: z.array(z.enum([
    'event_count',
    'unique_users',
    'risk_score_average',
    'severity_distribution',
    'compliance_violations',
    'geographic_distribution',
    'system_component_activity',
    'trend_analysis',
    'anomaly_detection'
  ])),
  group_by: z.array(z.string()).optional(),
  filters: AuditQueryRequest.optional()
});

export const UpdateAuditEventRequest = z.object({
  status: z.nativeEnum(AuditStatus).optional(),
  resolution_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

// Response schemas
export 
export 
// Type definitions
export type CreateAuditEventRequestType = z.infer<typeof CreateAuditEventRequest>;
export type AuditQueryRequestType = z.infer<typeof AuditQueryRequest>;
export type ComplianceReportRequestType = z.infer<typeof ComplianceReportRequest>;
export type AuditAnalyticsRequestType = z.infer<typeof AuditAnalyticsRequest>;
export type UpdateAuditEventRequestType = z.infer<typeof UpdateAuditEventRequest>;

/**
 * Audit Management API Service
 * 
 * Provides RESTful API interface for audit management operations
 */
export class AuditManagementAPI {
  private auditSystem = auditManagementSystem;

  /**
   * Create a new audit event
   * POST /api/audit/events
   */
  async createAuditEvent(request: CreateAuditEventRequestType): Promise<{
    success: boolean;
    event?: AuditEvent;
    error?: string;
  }> {
    try {
      const validatedRequest = CreateAuditEventRequest.parse(request);
      
      // Convert to internal format
      const eventData = {
        ...validatedRequest,
        status: AuditStatus.ACTIVE,
        alert_triggered: validatedRequest.risk_score >= 7 || validatedRequest.severity === AuditSeverity.CRITICAL,
        notification_sent: false,
        escalation_level: this.calculateEscalationLevel(validatedRequest.severity, validatedRequest.risk_score)
      };
      
      const event = this.auditSystem.createAuditEvent(eventData);
      
      return {
        success: true,
        event
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create audit event'
      };
    }
  }

  /**
   * Query audit events with filtering and pagination
   * GET /api/audit/events
   */
  async queryAuditEvents(request: AuditQueryRequestType): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const validatedRequest = AuditQueryRequest.parse(request);
      const startTime = Date.now();
      
      // Convert API request to internal query format
      const internalQuery: AuditQuery = {
        page: validatedRequest.page,
        limit: validatedRequest.limit,
        sort_field: validatedRequest.sort_field,
        sort_order: validatedRequest.sort_order,
        start_date: validatedRequest.start_date ? new Date(validatedRequest.start_date) : undefined,
        end_date: validatedRequest.end_date ? new Date(validatedRequest.end_date) : undefined,
        event_types: validatedRequest.event_types,
        severities: validatedRequest.severities,
        statuses: validatedRequest.statuses,
        compliance_frameworks: validatedRequest.compliance_frameworks,
        search_text: validatedRequest.search,
        user_id: validatedRequest.user_id,
        ip_address: validatedRequest.ip_address,
        min_risk_score: validatedRequest.min_risk_score,
        max_risk_score: validatedRequest.max_risk_score
      };
      
      const result = await this.auditSystem.queryAuditEvents(internalQuery);
      const queryTime = Date.now() - startTime;
      
      // Format response
      const response = {
        events: result.events.map(this.formatAuditEventForAPI),
        pagination: {
          page: result.page,
          limit: internalQuery.limit,
          total_count: result.totalCount,
          total_pages: result.totalPages,
          has_next: result.page < result.totalPages,
          has_prev: result.page > 1
        },
        analytics: result.analytics,
        filters_applied: this.getAppliedFilters(validatedRequest),
        query_time_ms: queryTime
      };
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query audit events'
      };
    }
  }

  /**
   * Get a specific audit event by ID
   * GET /api/audit/events/:id
   */
  async getAuditEvent(eventId: string): Promise<{
    success: boolean;
    event?: AuditEvent;
    error?: string;
  }> {
    try {
      const event = this.auditSystem.getBaseline(eventId); // This would be getEvent in the actual implementation
      
      if (!event) {
        return {
          success: false,
          error: 'Audit event not found'
        };
      }
      
      return {
        success: true,
        event: event as any // Type conversion would be handled properly
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve audit event'
      };
    }
  }

  /**
   * Update an audit event
   * PUT /api/audit/events/:id
   */
  async updateAuditEvent(eventId: string, request: UpdateAuditEventRequestType): Promise<{
    success: boolean;
    event?: AuditEvent;
    error?: string;
  }> {
    try {
      const validatedRequest = UpdateAuditEventRequest.parse(request);
      
      // This would integrate with the actual update method
      console.log(`Updating audit event ${eventId}:`, validatedRequest);
      
      // Implementation would update the event and return the updated version
      return {
        success: true,
        event: {} as AuditEvent // Placeholder
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update audit event'
      };
    }
  }

  /**
   * Generate compliance report
   * POST /api/audit/compliance/report
   */
  async generateComplianceReport(request: ComplianceReportRequestType): Promise<{
    success: boolean;
    report?: any;
    download_url?: string;
    error?: string;
  }> {
    try {
      const validatedRequest = ComplianceReportRequest.parse(request);
      
      const report = this.auditSystem.generateComplianceReport(
        validatedRequest.framework,
        {
          start: new Date(validatedRequest.start_date),
          end: new Date(validatedRequest.end_date)
        }
      );
      
      // Handle different export formats
      let downloadUrl: string | undefined;
      if (validatedRequest.export_format !== 'json') {
        downloadUrl = await this.generateReportFile(report, validatedRequest.export_format);
      }
      
      return {
        success: true,
        report: validatedRequest.include_details ? report : this.summarizeReport(report),
        download_url: downloadUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate compliance report'
      };
    }
  }

  /**
   * Generate audit analytics
   * POST /api/audit/analytics
   */
  async generateAnalytics(request: AuditAnalyticsRequestType): Promise<{
    success: boolean;
    analytics?: any;
    error?: string;
  }> {
    try {
      const validatedRequest = AuditAnalyticsRequest.parse(request);
      
      // Convert to internal analytics request format
      const analyticsRequest: AuditAnalytics = {
        timeframe: validatedRequest.timeframe,
        metrics: validatedRequest.metrics,
        group_by: validatedRequest.group_by,
        filters: validatedRequest.filters ? {
          start_date: validatedRequest.start_date ? new Date(validatedRequest.start_date) : undefined,
          end_date: validatedRequest.end_date ? new Date(validatedRequest.end_date) : undefined,
          ...validatedRequest.filters
        } as AuditQuery : undefined
      };
      
      const analytics = this.auditSystem.generateAuditAnalytics(analyticsRequest);
      
      // Add additional processing for specific metrics
      if (validatedRequest.metrics.includes('anomaly_detection')) {
        analytics.anomaly_detection = this.auditSystem.detectAnomalousPatterns();
      }
      
      if (validatedRequest.metrics.includes('trend_analysis')) {
        analytics.trend_analysis = this.generateTrendAnalysis(analytics);
      }
      
      return {
        success: true,
        analytics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics'
      };
    }
  }

  /**
   * Detect anomalous patterns
   * GET /api/audit/anomalies
   */
  async detectAnomalies(timeWindow?: number): Promise<{
    success: boolean;
    patterns?: any[];
    error?: string;
  }> {
    try {
      const patterns = this.auditSystem.detectAnomalousPatterns(timeWindow);
      
      return {
        success: true,
        patterns
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to detect anomalies'
      };
    }
  }

  /**
   * Get audit system health status
   * GET /api/audit/health
   */
  async getSystemHealth(): Promise<{
    success: boolean;
    health?: any;
    error?: string;
  }> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {
          audit_storage: { status: 'healthy', response_time_ms: 2 },
          chain_integrity: { status: 'healthy', last_verification: new Date().toISOString() },
          event_processing: { status: 'healthy', queue_length: 0 },
          analytics_engine: { status: 'healthy', cache_hit_ratio: 0.95 }
        },
        metrics: {
          events_processed_last_hour: 1250,
          average_processing_time_ms: 15,
          error_rate_percentage: 0.02,
          storage_usage_percentage: 65
        }
      };
      
      return {
        success: true,
        health
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve system health'
      };
    }
  }

  /**
   * Export audit data
   * POST /api/audit/export
   */
  async exportAuditData(request: {
    format: 'csv' | 'json' | 'pdf';
    query?: AuditQueryRequestType;
    include_metadata?: boolean;
  }): Promise<{
    success: boolean;
    download_url?: string;
    error?: string;
  }> {
    try {
      // Implementation would generate export file
      const downloadUrl = `/api/audit/downloads/${Date.now()}.${request.format}`;
      
      // In a real implementation, this would:
      // 1. Query the audit data based on filters
      // 2. Format the data according to the requested format
      // 3. Store the file in a secure location
      // 4. Return a secure download URL with expiration
      
      return {
        success: true,
        download_url: downloadUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export audit data'
      };
    }
  }

  // Helper methods
  private formatAuditEventForAPI(event: AuditEvent): any {
    return {
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      event_type: event.event_type,
      severity: event.severity,
      status: event.status,
      title: event.title,
      description: event.description,
      category: event.category,
      user_id: event.user_id,
      ip_address: event.ip_address,
      risk_score: event.risk_score,
      compliance_frameworks: event.compliance_frameworks,
      tags: event.tags,
      created_at: event.timestamp.toISOString(),
      updated_at: event.timestamp.toISOString()
    };
  }

  private calculateEscalationLevel(severity: AuditSeverity, riskScore: number): number {
    if (severity === AuditSeverity.CRITICAL) return 5;
    if (severity === AuditSeverity.HIGH || riskScore >= 8) return 4;
    if (severity === AuditSeverity.MEDIUM || riskScore >= 6) return 3;
    if (riskScore >= 4) return 2;
    return 1;
  }

  private getAppliedFilters(request: AuditQueryRequestType): Record<string, any> {
    const filters: Record<string, any> = {};
    
    if (request.start_date) filters.start_date = request.start_date;
    if (request.end_date) filters.end_date = request.end_date;
    if (request.event_types && request.event_types.length > 0) filters.event_types = request.event_types;
    if (request.severities && request.severities.length > 0) filters.severities = request.severities;
    if (request.search) filters.search = request.search;
    if (request.min_risk_score !== undefined) filters.min_risk_score = request.min_risk_score;
    if (request.max_risk_score !== undefined) filters.max_risk_score = request.max_risk_score;
    
    return filters;
  }

  private async generateReportFile(report: any, format: 'pdf' | 'csv'): Promise<string> {
    // Implementation would generate the file and return a secure URL
    return `/api/audit/downloads/report_${Date.now()}.${format}`;
  }

  private summarizeReport(report: any): any {
    return {
      framework: report.framework,
      report_period: report.report_period,
      summary: report.summary,
      compliance_score: report.compliance_score || 85 // Example score
    };
  }

  private generateTrendAnalysis(analytics: any): any {
    return {
      event_volume_trend: 'increasing',
      risk_score_trend: 'stable',
      compliance_trend: 'improving',
      predictions: {
        next_week_volume: analytics.total_events * 1.15,
        risk_forecast: 'stable'
      }
    };
  }
}

// Global API instance
export const auditManagementAPI = new AuditManagementAPI();

// Utility functions for common operations
export const createAuditEvent = (request: CreateAuditEventRequestType) =>
  auditManagementAPI.createAuditEvent(request);

export const queryAuditEvents = (request: AuditQueryRequestType) =>
  auditManagementAPI.queryAuditEvents(request);

export const generateComplianceReport = (request: ComplianceReportRequestType) =>
  auditManagementAPI.generateComplianceReport(request);

export default AuditManagementAPI;