/**
 * Diagnostics API Routes - Epic 17.4.5
 * 
 * RESTful API endpoints for system diagnostics and health monitoring.
 * Provides comprehensive diagnostic execution, health reporting, and
 * system monitoring capabilities for Epic 17 admin controls.
 * 
 * Tasks: E17-1753114397252-2CF0E9 & E17-1753114397253-2E1DFD
 * Epic: 17 - Backstage Admin Controls (Story 17.4.5 - Health Check System)
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { DiagnosticService, DiagnosticCategory, DiagnosticExecution, DiagnosticResult } from './DiagnosticService';
import { SystemDiagnostics, SystemHealthReport, SystemDiagnosticConfiguration } from './SystemDiagnostics';
import { AuthService } from '../auth/services/AuthService';
import { AuditService } from '../auth/services/AuditService';

// ==========================================
// REQUEST/RESPONSE INTERFACES
// ==========================================



export interface ExecuteDiagnosticsRequest {
  suiteId?: string;
  diagnosticIds?: string[];
  categories?: DiagnosticCategory[];
  configuration?: {
    timeout?: number;
    skipOnError?: boolean;
    generateReport?: boolean;



  };




export interface DiagnosticsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
    version: string;
  };




export interface HealthCheckQuery {
  includeDetails?: boolean;
  includeRecommendations?: boolean;
  includeTrends?: boolean;
  categories?: string;







export interface DiagnosticListQuery {
  category?: DiagnosticCategory;
  status?: 'enabled' | 'disabled' | 'all';
  limit?: number;
  offset?: number;







export interface HealthReportQuery {
  startDate?: string;
  endDate?: string;
  limit?: number;
  includeDetails?: boolean;





// ==========================================
// API PLUGIN IMPLEMENTATION
// ==========================================

export const diagnosticsAPI: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const diagnosticService = new DiagnosticService(fastify.database);
  const systemDiagnostics = new SystemDiagnostics(fastify.database);
  const authService = new AuthService(fastify.database);
  const auditService = new AuditService(fastify.database);

  // Authentication middleware
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ error: 'Authorization header required' });
      return;


    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await authService.validateToken(token);
      if (!user || !user.permissions.includes('system_admin')) {
        reply.code(403).send({ error: 'Insufficient permissions for diagnostic operations' });
        return;

      request.user = user;
 catch (error) {
      reply.code(401).send({ error: 'Invalid authentication token' });
      return;

  });

  // ==========================================
  // DIAGNOSTIC EXECUTION ENDPOINTS
  // ==========================================

  // Execute diagnostic suite or specific diagnostics
  fastify.post<{ Body: ExecuteDiagnosticsRequest }>('/execute', {
    schema: {
      body: {
        type: 'object',
        properties: {
          suiteId: { type: 'string' },
          diagnosticIds: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          configuration: {
            type: 'object',
            properties: {
              timeout: { type: 'integer' },
              skipOnError: { type: 'boolean' },
              generateReport: { type: 'boolean' }





  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      let execution: DiagnosticExecution;

      // Determine execution type
      if (request.body.suiteId) {
        execution = await diagnosticService.runDiagnosticSuite(
          request.body.suiteId,
          request.user.userId
        );
 else {
        // For now, use the default health check suite
        execution = await diagnosticService.runDiagnosticSuite(
          'system_health_check',
          request.user.userId
        );


      // Optionally generate health report
      let healthReport: SystemHealthReport | null = null;
      if (request.body.configuration?.generateReport) {
        healthReport = await systemDiagnostics.generateSystemHealthReport(request.user.userId);


      const response: DiagnosticsResponse<{
        execution: DiagnosticExecution;
        healthReport?: SystemHealthReport;
> = {
        success: true,
        data: {
          execution,
          ...(healthReport && { healthReport })

        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      };

      await auditService.logAction({
        userId: request.user.userId,
        action: 'diagnostics_executed',
        resource: `diagnostics:${execution.executionId}`,
        details: {
          requestId,
          suiteId: request.body.suiteId,
          resultCount: execution.results.length,
          overallHealth: execution.summary.overallHealth,
          timestamp: new Date()

      });

      reply.code(200).send(response);
 catch (error) {
      fastify.log.error(`Diagnostics execution error: ${error.message}`);

      await auditService.logAction({
        userId: request.user.userId,
        action: 'diagnostics_execution_failed',
        resource: 'diagnostics',
        details: {
          requestId,
          error: error.message,
          timestamp: new Date()

      });

      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to execute diagnostics',
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });

  });

  // Get diagnostic execution status
  fastify.get<{ Params: { executionId: string } }>('/executions/:executionId', async (request, reply) => {
    const startTime = Date.now();

    try {
      const execution = await diagnosticService.getDiagnosticExecution(request.params.executionId);
      
      if (!execution) {
        reply.code(404).send({
          success: false,
          error: 'Diagnostic execution not found'
        });
        return;


      reply.send({
        success: true,
        data: execution,
        metadata: {
          timestamp: new Date(),
          requestId: `get_exec_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Execution retrieval error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve execution status'
      });

  });

  // List diagnostic executions
  fastify.get<{ Querystring: { limit?: number; status?: string; userId?: string } }>('/executions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          status: { type: 'string' },
          userId: { type: 'string' }



  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const executions = await diagnosticService.listDiagnosticExecutions({
        userId: request.query.userId,
        status: request.query.status,
        limit: request.query.limit || 20
      });

      reply.send({
        success: true,
        data: executions,
        metadata: {
          timestamp: new Date(),
          requestId: `list_exec_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Execution listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve execution list'
      });

  });

  // ==========================================
  // HEALTH REPORTING ENDPOINTS
  // ==========================================

  // Generate comprehensive health report
  fastify.post('/health-report', async (request, reply) => {
    const startTime = Date.now();
    const requestId = `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const healthReport = await systemDiagnostics.generateSystemHealthReport(request.user.userId);

      await auditService.logAction({
        userId: request.user.userId,
        action: 'health_report_generated',
        resource: `health_report:${healthReport.reportId}`,
        details: {
          requestId,
          healthScore: healthReport.healthScore,
          overallHealth: healthReport.overallHealth,
          criticalIssueCount: healthReport.criticalIssues.length,
          timestamp: new Date()

      });

      reply.send({
        success: true,
        data: healthReport,
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Health report generation error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to generate health report'
      });

  });

  // Get latest health report
  fastify.get('/health-report/latest', async (request, reply) => {
    const startTime = Date.now();

    try {
      const latestReport = await systemDiagnostics.getLatestHealthReport();

      if (!latestReport) {
        reply.code(404).send({
          success: false,
          error: 'No health reports found'
        });
        return;


      reply.send({
        success: true,
        data: latestReport,
        metadata: {
          timestamp: new Date(),
          requestId: `latest_health_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Latest health report error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve latest health report'
      });

  });

  // List health reports with filtering
  fastify.get<{ Querystring: HealthReportQuery }>('/health-reports', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          includeDetails: { type: 'boolean', default: false }



  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const filters: any = {
        limit: request.query.limit || 20
      };

      if (request.query.startDate) {
        filters.startDate = new Date(request.query.startDate);

      if (request.query.endDate) {
        filters.endDate = new Date(request.query.endDate);


      const reports = await systemDiagnostics.getHealthReports(filters);

      reply.send({
        success: true,
        data: reports,
        metadata: {
          totalReports: reports.length,
          includeDetails: request.query.includeDetails || false,
          timestamp: new Date(),
          requestId: `list_health_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Health reports listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve health reports'
      });

  });

  // Quick health check endpoint
  fastify.get<{ Querystring: HealthCheckQuery }>('/health', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          includeDetails: { type: 'boolean', default: false },
          includeRecommendations: { type: 'boolean', default: false },
          includeTrends: { type: 'boolean', default: false },
          categories: { type: 'string' }



  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // Execute quick health check
      const execution = await systemDiagnostics.executeHealthCheck(request.user.userId);
      
      // Basic health status
      const healthStatus = {
        status: execution.summary.overallHealth,
        timestamp: new Date(),
        totalChecks: execution.summary.totalDiagnostics,
        healthyChecks: execution.summary.healthyCount,
        warningChecks: execution.summary.warningCount,
        criticalChecks: execution.summary.criticalCount,
        errorChecks: execution.summary.errorCount
      };

      const response: any = {
        success: true,
        data: healthStatus
      };

      // Include additional details if requested
      if (request.query.includeDetails) {
        response.data.details = execution.results;


      if (request.query.includeRecommendations) {
        response.data.recommendations = execution.summary.recommendations;


      response.metadata = {
        timestamp: new Date(),
        requestId: `health_check_${Date.now()}`,
        processingTime: Date.now() - startTime,
        version: '1.0.0'
      };

      reply.send(response);
 catch (error) {
      fastify.log.error(`Health check error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to perform health check'
      });

  });

  // ==========================================
  // CONFIGURATION ENDPOINTS
  // ==========================================

  // Get available diagnostic definitions
  fastify.get<{ Querystring: DiagnosticListQuery }>('/diagnostics', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          status: { type: 'string', enum: ['enabled', 'disabled', 'all'], default: 'all' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }



  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      let diagnostics = await diagnosticService.listAvailableDiagnostics();

      // Apply filters
      if (request.query.category) {
        diagnostics = diagnostics.filter(d => d.category === request.query.category);


      if (request.query.status !== 'all') {
        const isEnabled = request.query.status === 'enabled';
        diagnostics = diagnostics.filter(d => d.enabled === isEnabled);


      // Apply pagination
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 50;
      const paginatedDiagnostics = diagnostics.slice(offset, offset + limit);

      reply.send({
        success: true,
        data: paginatedDiagnostics,
        metadata: {
          totalCount: diagnostics.length,
          limit,
          offset,
          timestamp: new Date(),
          requestId: `list_diagnostics_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Diagnostics listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve diagnostic definitions'
      });

  });

  // Get diagnostic suites
  fastify.get('/suites', async (request, reply) => {
    const startTime = Date.now();

    try {
      const suites = await diagnosticService.listDiagnosticSuites();

      reply.send({
        success: true,
        data: suites,
        metadata: {
          totalSuites: suites.length,
          timestamp: new Date(),
          requestId: `list_suites_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Suites listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve diagnostic suites'
      });

  });

  // Get system diagnostic configuration
  fastify.get('/config', async (request, reply) => {
    const startTime = Date.now();

    try {
      const config = await systemDiagnostics.getConfiguration();

      reply.send({
        success: true,
        data: config,
        metadata: {
          timestamp: new Date(),
          requestId: `get_config_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Configuration retrieval error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve diagnostic configuration'
      });

  });

  // Update system diagnostic configuration
  fastify.put<{ Body: Partial<SystemDiagnosticConfiguration> }>('/config', {
    schema: {
      body: {
        type: 'object',
        properties: {
          enabledCategories: { type: 'array', items: { type: 'string' } },
          checkIntervals: { type: 'object' },
          alertThresholds: { type: 'object' },
          reportingSettings: { type: 'object' },
          maintenanceWindows: { type: 'array' }



  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      await systemDiagnostics.updateConfiguration(request.body);

      await auditService.logAction({
        userId: request.user.userId,
        action: 'diagnostic_configuration_updated',
        resource: 'diagnostic_config',
        details: {
          changes: request.body,
          timestamp: new Date()

      });

      const updatedConfig = await systemDiagnostics.getConfiguration();

      reply.send({
        success: true,
        data: updatedConfig,
        metadata: {
          timestamp: new Date(),
          requestId: `update_config_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'

      });
 catch (error) {
      fastify.log.error(`Configuration update error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to update diagnostic configuration'
      });

  });

  // ==========================================
  // SYSTEM STATUS ENDPOINTS
  // ==========================================

  // Get diagnostic service status
  fastify.get('/status', async (request, reply) => {
    try {
      const status = {
        service: 'diagnostics',
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        features: {
          diagnosticExecution: true,
          healthReporting: true,
          trendAnalysis: true,
          alerting: true,
          configurationManagement: true

        statistics: {
          availableDiagnostics: (await diagnosticService.listAvailableDiagnostics()).length,
          availableSuites: (await diagnosticService.listDiagnosticSuites()).length,
          recentExecutions: (await diagnosticService.listDiagnosticExecutions({ limit: 10 })).length

      };

      reply.send({
        success: true,
        data: status
      });
 catch (error) {
      fastify.log.error(`Status check error: ${error.message}`);
      reply.code(503).send({
        success: false,
        error: 'Service status check failed'
      });

  });

  fastify.log.info('Diagnostics API routes registered successfully');
};

export default diagnosticsAPI;