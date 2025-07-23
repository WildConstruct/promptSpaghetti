/**
 * Health Check Definition Service - Epic 17.4.5
 * 
 * Service implementation for managing health check definitions, execution,
 * and lifecycle. Integrates with the DiagnosticService to provide a complete
 * health monitoring solution.
 * 
 * Task: E17-1753114397253-2E1DFD - Build system diagnostics
 * Epic: 17 - Backstage Admin Controls (Story 17.4.5 - Health Check System)
 */

import { Database } from '../database';
import { AuditService } from '../auth/services/AuditService';
import { 
  DiagnosticService, 
  DiagnosticResult, 
  DiagnosticCategory, 
  DiagnosticStatus, 
  DiagnosticSeverity 
} from './DiagnosticService';
import {
  HealthCheckDefinition,
  HealthCheckResult,
  HealthStatus,
  ValidationResult,
  HealthCheckDefinitionValidator,
  HealthCheckDefinitionBuilder,
  HealthCheckCategory,
  HealthCheckType,
  HealthCheckPriority,
  ExecutionMetadata,
  ResultDetails,
  Finding
} from '../../packages/core/admin/HealthCheckDefinitionModel';

// ==========================================
// SERVICE INTERFACES
// ==========================================

export interface HealthCheckExecutionContext {
  executionId: string;
  checkDefinition: HealthCheckDefinition;
  parameters: Record<string, any>;
  metadata: ExecutionMetadata;
  startTime: Date;
  timeout: number;
}

export interface HealthCheckRegistry {
  definitions: Map<string, HealthCheckDefinition>;
  executionHistory: Map<string, HealthCheckResult[]>;
  activeExecutions: Map<string, HealthCheckExecutionContext>;
  schedules: Map<string, NodeJS.Timeout>;
}

export interface BulkExecutionResult {
  executionId: string;
  totalChecks: number;
  completedChecks: number;
  failedChecks: number;
  results: HealthCheckResult[];
  duration: number;
  overallStatus: HealthStatus;
}

export interface HealthCheckFilter {
  category?: HealthCheckCategory;
  priority?: HealthCheckPriority;
  tags?: string[];
  status?: HealthStatus;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

// ==========================================
// MAIN SERVICE IMPLEMENTATION
// ==========================================

export class HealthCheckDefinitionService {
  private db: Database;
  private auditService: AuditService;
  private diagnosticService: DiagnosticService;
  private registry: HealthCheckRegistry;
  private isInitialized = false;

  constructor(
    database: Database,
    auditService: AuditService,
    diagnosticService: DiagnosticService
  ) {
    this.db = database;
    this.auditService = auditService;
    this.diagnosticService = diagnosticService;
    this.registry = {
      definitions: new Map(),
      executionHistory: new Map(),
      activeExecutions: new Map(),
      schedules: new Map()
    };
  }

  // ==========================================
  // LIFECYCLE MANAGEMENT
  // ==========================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔧 Initializing Health Check Definition Service');

    // Load existing definitions from database
    await this.loadDefinitionsFromDatabase();

    // Start scheduled checks
    await this.startScheduledChecks();

    // Register with diagnostic service
    await this.registerWithDiagnosticService();

    this.isInitialized = true;
    console.log('✅ Health Check Definition Service initialized');
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    console.log('🛑 Shutting down Health Check Definition Service');

    // Stop all scheduled checks
    this.registry.schedules.forEach(timeout => clearInterval(timeout));
    this.registry.schedules.clear();

    // Cancel active executions
    const activeExecutions = Array.from(this.registry.activeExecutions.values());
    await Promise.all(activeExecutions.map(ctx => this.cancelExecution(ctx.executionId)));

    this.isInitialized = false;
    console.log('✅ Health Check Definition Service shut down');
  }

  // ==========================================
  // DEFINITION MANAGEMENT
  // ==========================================

  async createDefinition(
    definition: HealthCheckDefinition,
    createdBy: string
  ): Promise<HealthCheckDefinition> {
    console.log(`📋 Creating health check definition: ${definition.name}`);

    // Validate definition
    const validation = HealthCheckDefinitionValidator.validate(definition);
    if (!validation.isValid) {
      throw new Error(`Health check validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate IDs
    if (this.registry.definitions.has(definition.id)) {
      throw new Error(`Health check with ID '${definition.id}' already exists`);
    }

    // Enhance definition with metadata
    const enhancedDefinition: HealthCheckDefinition = {
      ...definition,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: definition.version || '1.0.0'
    };

    // Store in database
    await this.storeDefinitionInDatabase(enhancedDefinition);

    // Add to registry
    this.registry.definitions.set(definition.id, enhancedDefinition);

    // Initialize execution history
    this.registry.executionHistory.set(definition.id, []);

    // Schedule if configured
    if (enhancedDefinition.execution?.schedule?.enabled) {
      await this.scheduleHealthCheck(enhancedDefinition);
    }

    // Audit log
    await this.auditService.logAction({
      userId: createdBy,
      action: 'health_check_definition_created',
      resource: `health_check:${definition.id}`,
      details: {
        checkId: definition.id,
        name: definition.name,
        category: definition.category,
        priority: definition.priority,
        validation: validation
      }
    });

    return enhancedDefinition;
  }

  async updateDefinition(
    checkId: string,
    updates: Partial<HealthCheckDefinition>,
    updatedBy: string
  ): Promise<HealthCheckDefinition> {
    console.log(`📝 Updating health check definition: ${checkId}`);

    const existingDefinition = this.registry.definitions.get(checkId);
    if (!existingDefinition) {
      throw new Error(`Health check definition not found: ${checkId}`);
    }

    // Merge updates
    const updatedDefinition: HealthCheckDefinition = {
      ...existingDefinition,
      ...updates,
      updatedAt: new Date()
    };

    // Validate updated definition
    const validation = HealthCheckDefinitionValidator.validate(updatedDefinition);
    if (!validation.isValid) {
      throw new Error(`Updated health check validation failed: ${validation.errors.join(', ')}`);
    }

    // Update in database
    await this.updateDefinitionInDatabase(updatedDefinition);

    // Update registry
    this.registry.definitions.set(checkId, updatedDefinition);

    // Update schedule if needed
    await this.updateScheduleIfNeeded(existingDefinition, updatedDefinition);

    // Audit log
    await this.auditService.logAction({
      userId: updatedBy,
      action: 'health_check_definition_updated',
      resource: `health_check:${checkId}`,
      details: {
        checkId,
        changes: Object.keys(updates),
        validation
      }
    });

    return updatedDefinition;
  }

  async deleteDefinition(checkId: string, deletedBy: string): Promise<void> {
    console.log(`🗑️ Deleting health check definition: ${checkId}`);

    const definition = this.registry.definitions.get(checkId);
    if (!definition) {
      throw new Error(`Health check definition not found: ${checkId}`);
    }

    // Cancel active executions
    const activeExecution = this.registry.activeExecutions.get(checkId);
    if (activeExecution) {
      await this.cancelExecution(activeExecution.executionId);
    }

    // Remove schedule
    const schedule = this.registry.schedules.get(checkId);
    if (schedule) {
      clearInterval(schedule);
      this.registry.schedules.delete(checkId);
    }

    // Remove from database
    await this.deleteDefinitionFromDatabase(checkId);

    // Remove from registry
    this.registry.definitions.delete(checkId);
    this.registry.executionHistory.delete(checkId);

    // Audit log
    await this.auditService.logAction({
      userId: deletedBy,
      action: 'health_check_definition_deleted',
      resource: `health_check:${checkId}`,
      details: {
        checkId,
        name: definition.name,
        category: definition.category
      }
    });
  }

  async getDefinition(checkId: string): Promise<HealthCheckDefinition | null> {
    return this.registry.definitions.get(checkId) || null;
  }

  async listDefinitions(filter?: HealthCheckFilter): Promise<HealthCheckDefinition[]> {
    let definitions = Array.from(this.registry.definitions.values());

    if (filter) {
      definitions = definitions.filter(def => {
        if (filter.category && def.category !== filter.category) return false;
        if (filter.priority && def.priority !== filter.priority) return false;
        if (filter.isActive !== undefined && def.isActive !== filter.isActive) return false;
        if (filter.tags && !filter.tags.every(tag => def.tags.includes(tag))) return false;
        if (filter.createdAfter && def.createdAt < filter.createdAfter) return false;
        if (filter.createdBefore && def.createdAt > filter.createdBefore) return false;
        return true;
      });
    }

    return definitions;
  }

  // ==========================================
  // EXECUTION METHODS
  // ==========================================

  async executeHealthCheck(
    checkId: string,
    initiatedBy: string,
    parameters: Record<string, any> = {}
  ): Promise<HealthCheckResult> {
    console.log(`🔍 Executing health check: ${checkId}`);

    const definition = this.registry.definitions.get(checkId);
    if (!definition) {
      throw new Error(`Health check definition not found: ${checkId}`);
    }

    if (!definition.isActive) {
      throw new Error(`Health check is inactive: ${checkId}`);
    }

    const executionId = this.generateExecutionId();
    const startTime = new Date();

    const context: HealthCheckExecutionContext = {
      executionId,
      checkDefinition: definition,
      parameters: { ...definition.config.parameters, ...parameters },
      metadata: {
        hostname: require('os').hostname(),
        environment: process.env.NODE_ENV || 'development',
        version: definition.version,
        userId: initiatedBy,
        correlationId: this.generateCorrelationId(),
        retryAttempt: 0
      },
      startTime,
      timeout: definition.config.timeout
    };

    // Register active execution
    this.registry.activeExecutions.set(executionId, context);

    try {
      // Execute the health check based on type
      const result = await this.executeByType(context);

      // Store result
      await this.storeExecutionResult(result);

      // Add to execution history
      const history = this.registry.executionHistory.get(checkId) || [];
      history.push(result);
      
      // Keep only last 100 results
      if (history.length > 100) {
        history.shift();
      }
      this.registry.executionHistory.set(checkId, history);

      // Process alerting if configured
      if (definition.alerting?.enabled) {
        await this.processAlerting(definition, result);
      }

      // Audit log
      await this.auditService.logAction({
        userId: initiatedBy,
        action: 'health_check_executed',
        resource: `health_check:${checkId}`,
        details: {
          executionId,
          checkId,
          status: result.status,
          duration: result.duration,
          score: result.score
        }
      });

      return result;

    } catch (error) {
      // Create error result
      const errorResult = this.createErrorResult(context, error);
      await this.storeExecutionResult(errorResult);

      // Audit error
      await this.auditService.logAction({
        userId: initiatedBy,
        action: 'health_check_execution_failed',
        resource: `health_check:${checkId}`,
        details: {
          executionId,
          checkId,
          error: error.message
        }
      });

      throw error;

    } finally {
      // Remove from active executions
      this.registry.activeExecutions.delete(executionId);
    }
  }

  async executeBulkHealthChecks(
    checkIds: string[],
    initiatedBy: string,
    parallel = true
  ): Promise<BulkExecutionResult> {
    console.log(`🔍 Executing bulk health checks: ${checkIds.length} checks`);

    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    const results: HealthCheckResult[] = [];

    if (parallel) {
      // Execute in parallel
      const promises = checkIds.map(checkId => 
        this.executeHealthCheck(checkId, initiatedBy).catch(error => 
          this.createErrorResultForBulk(checkId, error, executionId)
        )
      );
      
      const parallelResults = await Promise.all(promises);
      results.push(...parallelResults);
    } else {
      // Execute sequentially
      for (const checkId of checkIds) {
        try {
          const result = await this.executeHealthCheck(checkId, initiatedBy);
          results.push(result);
        } catch (error) {
          results.push(this.createErrorResultForBulk(checkId, error, executionId));
        }
      }
    }

    const duration = Date.now() - startTime;
    const completedChecks = results.filter(r => r.status !== HealthStatus.ERROR).length;
    const failedChecks = results.length - completedChecks;
    const overallStatus = this.calculateOverallStatus(results);

    const bulkResult: BulkExecutionResult = {
      executionId,
      totalChecks: checkIds.length,
      completedChecks,
      failedChecks,
      results,
      duration,
      overallStatus
    };

    // Audit bulk execution
    await this.auditService.logAction({
      userId: initiatedBy,
      action: 'bulk_health_check_executed',
      resource: 'health_check_service',
      details: {
        executionId,
        totalChecks: checkIds.length,
        completedChecks,
        failedChecks,
        overallStatus,
        duration,
        parallel
      }
    });

    return bulkResult;
  }

  // ==========================================
  // EXECUTION BY TYPE
  // ==========================================

  private async executeByType(context: HealthCheckExecutionContext): Promise<HealthCheckResult> {
    const { checkDefinition } = context;

    switch (checkDefinition.config.type) {
    case HealthCheckType.HTTP_ENDPOINT:
      return this.executeHttpEndpointCheck(context);
      
    case HealthCheckType.DATABASE_QUERY:
      return this.executeDatabaseQueryCheck(context);
        
    case HealthCheckType.SYSTEM_COMMAND:
      return this.executeSystemCommandCheck(context);
        
    case HealthCheckType.COMPOSITE_CHECK:
      return this.executeCompositeCheck(context);
        
    default:
      throw new Error(`Unsupported health check type: ${checkDefinition.config.type}`);
    }
  }

  private async executeHttpEndpointCheck(context: HealthCheckExecutionContext): Promise<HealthCheckResult> {
    const { checkDefinition, executionId, startTime } = context;
    const config = checkDefinition.config.endpoint!;
    
    const startExecution = performance.now();
    
    try {
      // Make HTTP request (simplified - in production would use proper HTTP client)
      const response = await this.makeHttpRequest(config);
      const duration = performance.now() - startExecution;
      
      // Determine status based on response
      const status = config.expectedStatusCodes.includes(response.status) ? 
        HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;
      
      const score = this.calculateHealthScore(status, duration, config.timeout || 30000);
      
      const details: ResultDetails = {
        summary: `HTTP ${config.method} ${config.url} returned ${response.status}`,
        findings: [],
        recommendations: status === HealthStatus.HEALTHY ? [] : [
          'Check endpoint availability',
          'Verify expected status codes configuration',
          'Review server logs for errors'
        ],
        affectedComponents: ['http_endpoint'],
        relatedChecks: []
      };

      // Add findings based on results
      if (status !== HealthStatus.HEALTHY) {
        details.findings.push({
          type: 'error',
          category: 'connectivity',
          description: `Unexpected status code: ${response.status}`,
          impact: 'Service may be unavailable or experiencing issues'
        });
      }

      if (duration > (config.timeout || 30000) * 0.8) {
        details.findings.push({
          type: 'warning',
          category: 'performance',
          description: `Slow response time: ${duration.toFixed(1)}ms`,
          impact: 'Users may experience slow service'
        });
      }

      return {
        checkId: checkDefinition.id,
        executionId,
        timestamp: new Date(),
        duration,
        status,
        score,
        message: details.summary,
        details,
        metrics: {
          responseTime: duration,
          custom: {
            statusCode: response.status,
            contentLength: response.contentLength || 0
          }
        },
        metadata: context.metadata
      };

    } catch (error) {
      const duration = performance.now() - startExecution;
      return this.createErrorResult(context, error, duration);
    }
  }

  private async executeDatabaseQueryCheck(context: HealthCheckExecutionContext): Promise<HealthCheckResult> {
    const { checkDefinition, executionId } = context;
    const config = checkDefinition.config.query!;
    
    const startExecution = performance.now();
    
    try {
      // Execute database query (simplified - in production would use proper database connection)
      const result = await this.executeDatabaseQuery(config);
      const duration = performance.now() - startExecution;
      
      const status = HealthStatus.HEALTHY; // Simplified - would check against expected results
      const score = this.calculateHealthScore(status, duration, config.timeout);
      
      const details: ResultDetails = {
        summary: `Database query executed successfully, returned ${result.rowCount} rows`,
        findings: [],
        recommendations: [],
        affectedComponents: ['database'],
        relatedChecks: []
      };

      return {
        checkId: checkDefinition.id,
        executionId,
        timestamp: new Date(),
        duration,
        status,
        score,
        message: details.summary,
        details,
        metrics: {
          responseTime: duration,
          custom: {
            rowCount: result.rowCount,
            queryComplexity: result.complexity || 1
          }
        },
        metadata: context.metadata
      };

    } catch (error) {
      const duration = performance.now() - startExecution;
      return this.createErrorResult(context, error, duration);
    }
  }

  private async executeSystemCommandCheck(context: HealthCheckExecutionContext): Promise<HealthCheckResult> {
    // Implementation for system command execution
    throw new Error('System command health checks not yet implemented');
  }

  private async executeCompositeCheck(context: HealthCheckExecutionContext): Promise<HealthCheckResult> {
    // Implementation for composite health checks
    throw new Error('Composite health checks not yet implemented');
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private calculateHealthScore(status: HealthStatus, duration: number, timeout: number): number {
    let baseScore = 100;
    
    // Deduct points based on status
    switch (status) {
    case HealthStatus.HEALTHY:
      baseScore = 100;
      break;
    case HealthStatus.DEGRADED:
      baseScore = 75;
      break;
    case HealthStatus.UNHEALTHY:
      baseScore = 50;
      break;
    case HealthStatus.CRITICAL:
      baseScore = 25;
      break;
    default:
      baseScore = 0;
    }

    // Adjust based on performance
    const performanceRatio = duration / timeout;
    if (performanceRatio > 0.8) {
      baseScore *= 0.8; // 20% penalty for slow performance
    } else if (performanceRatio > 0.5) {
      baseScore *= 0.9; // 10% penalty for moderate slowness
    }

    return Math.round(Math.max(0, Math.min(100, baseScore)));
  }

  private calculateOverallStatus(results: HealthCheckResult[]): HealthStatus {
    const statusCounts = {
      [HealthStatus.HEALTHY]: 0,
      [HealthStatus.DEGRADED]: 0,
      [HealthStatus.UNHEALTHY]: 0,
      [HealthStatus.CRITICAL]: 0,
      [HealthStatus.ERROR]: 0,
      [HealthStatus.UNKNOWN]: 0,
      [HealthStatus.TIMEOUT]: 0
    };

    results.forEach(result => {
      statusCounts[result.status]++;
    });

    // Determine overall status based on worst case
    if (statusCounts[HealthStatus.CRITICAL] > 0) return HealthStatus.CRITICAL;
    if (statusCounts[HealthStatus.ERROR] > 0) return HealthStatus.ERROR;
    if (statusCounts[HealthStatus.UNHEALTHY] > 0) return HealthStatus.UNHEALTHY;
    if (statusCounts[HealthStatus.DEGRADED] > 0) return HealthStatus.DEGRADED;
    if (statusCounts[HealthStatus.TIMEOUT] > 0) return HealthStatus.TIMEOUT;
    
    return HealthStatus.HEALTHY;
  }

  private createErrorResult(
    context: HealthCheckExecutionContext, 
    error: any, 
    duration?: number
  ): HealthCheckResult {
    return {
      checkId: context.checkDefinition.id,
      executionId: context.executionId,
      timestamp: new Date(),
      duration: duration || performance.now(),
      status: HealthStatus.ERROR,
      score: 0,
      message: `Health check execution failed: ${error.message}`,
      details: {
        summary: `Execution failed: ${error.message}`,
        findings: [{
          type: 'error',
          category: 'execution',
          description: error.message,
          impact: 'Health check cannot determine system status',
          evidence: { stack: error.stack }
        }],
        recommendations: [
          'Check health check configuration',
          'Verify system dependencies',
          'Review error logs for details'
        ],
        affectedComponents: ['health_check_system'],
        relatedChecks: []
      },
      metrics: { custom: {} },
      metadata: context.metadata
    };
  }

  private createErrorResultForBulk(checkId: string, error: any, bulkExecutionId: string): HealthCheckResult {
    return {
      checkId,
      executionId: `${bulkExecutionId}_${checkId}`,
      timestamp: new Date(),
      duration: 0,
      status: HealthStatus.ERROR,
      score: 0,
      message: `Bulk execution failed: ${error.message}`,
      details: {
        summary: error.message,
        findings: [],
        recommendations: [],
        affectedComponents: [],
        relatedChecks: []
      },
      metrics: { custom: {} },
      metadata: {
        hostname: require('os').hostname(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        retryAttempt: 0
      }
    };
  }

  // ==========================================
  // HELPER METHODS (Simplified for Demo)
  // ==========================================

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private async makeHttpRequest(config: any): Promise<any> {
    // Simplified HTTP request simulation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    return {
      status: Math.random() > 0.1 ? 200 : 500,
      contentLength: Math.floor(Math.random() * 1000)
    };
  }

  private async executeDatabaseQuery(config: any): Promise<any> {
    // Simplified database query simulation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20));
    return {
      rowCount: Math.floor(Math.random() * 10),
      complexity: 1
    };
  }

  // Database operations (simplified)
  private async loadDefinitionsFromDatabase(): Promise<void> {
    // In production, would load from actual database
    console.log('Loading health check definitions from database...');
  }

  private async storeDefinitionInDatabase(definition: HealthCheckDefinition): Promise<void> {
    console.log(`Storing definition ${definition.id} in database`);
  }

  private async updateDefinitionInDatabase(definition: HealthCheckDefinition): Promise<void> {
    console.log(`Updating definition ${definition.id} in database`);
  }

  private async deleteDefinitionFromDatabase(checkId: string): Promise<void> {
    console.log(`Deleting definition ${checkId} from database`);
  }

  private async storeExecutionResult(result: HealthCheckResult): Promise<void> {
    console.log(`Storing execution result ${result.executionId}`);
  }

  // Scheduling methods (simplified)
  private async startScheduledChecks(): Promise<void> {
    console.log('Starting scheduled health checks...');
  }

  private async scheduleHealthCheck(definition: HealthCheckDefinition): Promise<void> {
    console.log(`Scheduling health check: ${definition.id}`);
  }

  private async updateScheduleIfNeeded(old: HealthCheckDefinition, updated: HealthCheckDefinition): Promise<void> {
    console.log(`Updating schedule for ${updated.id} if needed`);
  }

  private async registerWithDiagnosticService(): Promise<void> {
    console.log('Registering with diagnostic service...');
  }

  private async cancelExecution(executionId: string): Promise<void> {
    console.log(`Cancelling execution: ${executionId}`);
  }

  private async processAlerting(definition: HealthCheckDefinition, result: HealthCheckResult): Promise<void> {
    console.log(`Processing alerts for ${definition.id}: ${result.status}`);
  }
}