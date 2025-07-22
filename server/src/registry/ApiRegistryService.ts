/**
 * API Registry Service - Epic 17.4.4 Implementation
 * Task: E17-1753114397213-9BD2E3 - Create API registry model
 * 
 * Core service for managing API endpoint registration, discovery, and lifecycle
 * management within the Backstage Admin Controls system.
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import {
  ApiEndpoint,
  ApiService,
  ApiRegistryFilters,
  ApiRegistrySearchResult,
  ApiDiscoveryResult,
  RegistryEvent,
  RegistryEventType,
  RegistryAnalytics,
  RegistryConfiguration,
  ApiStatus,
  ApiVisibility,
  HttpMethod,
  EndpointMetrics,
  ServiceMetrics,
  HealthStatus
} from './ApiRegistryModel';

export class ApiRegistryService extends EventEmitter {
  private endpoints: Map<string, ApiEndpoint> = new Map();
  private services: Map<string, ApiService> = new Map();
  private eventHistory: RegistryEvent[] = [];
  private indexingComplete = false;

  constructor(
    private databaseService: DatabaseService,
    private auditService: AuditService,
    private config: RegistryConfiguration
  ) {
    super();
    this.initializeRegistry();
  }

  // =============================================================================
  // Initialization and Discovery
  // =============================================================================

  private async initializeRegistry(): Promise<void> {
    try {
      await this.loadFromDatabase();
      
      if (this.config.discovery.autoDiscovery) {
        await this.performAutoDiscovery();
      }
      
      this.startBackgroundTasks();
      this.indexingComplete = true;
      
      this.emit('registryReady', {
        endpointCount: this.endpoints.size,
        serviceCount: this.services.size,
        timestamp: new Date()
      });
      
      console.log(`API Registry initialized: ${this.endpoints.size} endpoints, ${this.services.size} services`);
    } catch (error) {
      console.error('Failed to initialize API registry:', error);
      this.emit('registryError', { error, timestamp: new Date() });
    }
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      // Load services
      const servicesQuery = `
        SELECT service_id, name, description, base_url, version, status, 
               visibility, protocol, port, endpoints, documentation, 
               created_at, updated_at, owner, team, environment, tags, 
               categories, metrics, health_status
        FROM api_services 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const servicesResult = await this.databaseService.query(servicesQuery);
      for (const row of servicesResult.rows) {
        const service = this.mapRowToService(row);
        this.services.set(service.serviceId, service);
      }

      // Load endpoints
      const endpointsQuery = `
        SELECT endpoint_id, name, description, path, method, type, service_id, 
               service_name, service_version, status, visibility, security_level,
               request_schema, response_schema, authentication, permissions, scopes,
               rate_limits, documentation, examples, created_at, updated_at, 
               deprecated_at, sunset_at, tags, categories, owner, maintainer,
               metrics, health_status, version, api_version, compatibility,
               dependencies, consumers, related_endpoints
        FROM api_endpoints 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const endpointsResult = await this.databaseService.query(endpointsQuery);
      for (const row of endpointsResult.rows) {
        const endpoint = this.mapRowToEndpoint(row);
        this.endpoints.set(endpoint.endpointId, endpoint);
      }
    } catch (error) {
      console.error('Failed to load registry from database:', error);
    }
  }

  private async performAutoDiscovery(): Promise<void> {
    // Auto-discovery implementation would scan the application
    // to find registered routes and endpoints
    console.log('Starting API auto-discovery...');
    
    // This would integrate with the Fastify instance to discover routes
    // For now, we'll create some example discovered endpoints
    
    const discoveredEndpoints = await this.discoverFastifyRoutes();
    console.log(`Auto-discovered ${discoveredEndpoints.length} endpoints`);
    
    for (const endpoint of discoveredEndpoints) {
      await this.registerEndpoint(endpoint, 'system');
    }
  }

  private async discoverFastifyRoutes(): Promise<Partial<ApiEndpoint>[]> {
    // This would integrate with Fastify to discover routes
    // For demonstration, returning known routes from the codebase
    return [
      {
        name: 'Generate Preview',
        description: 'Generate multiple outputs from a graph using different seeds',
        path: '/preview',
        method: HttpMethod.POST,
        type: 'rest' as any,
        serviceId: 'core-api',
        serviceName: 'Core API Service',
        serviceVersion: '1.0.0',
        status: ApiStatus.ACTIVE,
        visibility: ApiVisibility.PUBLIC,
        securityLevel: 'none' as any,
        tags: ['core', 'graph', 'execution'],
        categories: ['graph-operations'],
        owner: 'core-team'
      },
      {
        name: 'Export Graph',
        description: 'Export graph to GeneratorBundle format',
        path: '/export',
        method: HttpMethod.POST,
        type: 'rest' as any,
        serviceId: 'core-api',
        serviceName: 'Core API Service',
        serviceVersion: '1.0.0',
        status: ApiStatus.ACTIVE,
        visibility: ApiVisibility.PUBLIC,
        securityLevel: 'none' as any,
        tags: ['core', 'export'],
        categories: ['graph-operations'],
        owner: 'core-team'
      }
    ];
  }

  // =============================================================================
  // Registration and Management
  // =============================================================================

  async registerService(service: Partial<ApiService>, registeredBy: string): Promise<ApiService> {
    const serviceId = service.serviceId || this.generateServiceId(service.name!);
    
    const fullService: ApiService = {
      serviceId,
      name: service.name!,
      description: service.description || '',
      baseUrl: service.baseUrl!,
      version: service.version || '1.0.0',
      status: service.status || ApiStatus.ACTIVE,
      visibility: service.visibility || ApiVisibility.INTERNAL,
      protocol: service.protocol || 'http',
      port: service.port,
      endpoints: service.endpoints || [],
      defaultAuthentication: service.defaultAuthentication || { type: 'none' as any },
      supportedAuthMethods: service.supportedAuthMethods || ['none' as any],
      documentation: service.documentation || { summary: '', description: '' },
      createdAt: new Date(),
      updatedAt: new Date(),
      health: service.health || this.createDefaultHealthStatus(),
      metrics: service.metrics || this.createDefaultServiceMetrics(),
      owner: service.owner || registeredBy,
      team: service.team || 'unknown',
      technicalContact: service.technicalContact || registeredBy,
      environment: service.environment || 'development',
      deployment: service.deployment || this.createDefaultDeploymentInfo(),
      dependencies: service.dependencies || [],
      tags: service.tags || [],
      categories: service.categories || [],
      complianceLabels: service.complianceLabels || []
    };

    this.services.set(serviceId, fullService);
    
    // Store in database
    await this.storeService(fullService);
    
    // Log event
    const event: RegistryEvent = {
      eventId: this.generateEventId(),
      eventType: RegistryEventType.SERVICE_CREATED,
      timestamp: new Date(),
      entityType: 'service',
      entityId: serviceId,
      userId: registeredBy,
      metadata: { serviceName: fullService.name }
    };
    
    await this.logEvent(event);
    this.emit('serviceRegistered', { service: fullService, registeredBy });
    
    return fullService;
  }

  async registerEndpoint(endpoint: Partial<ApiEndpoint>, registeredBy: string): Promise<ApiEndpoint> {
    const endpointId = endpoint.endpointId || this.generateEndpointId(endpoint.path!, endpoint.method!);
    
    const fullEndpoint: ApiEndpoint = {
      endpointId,
      name: endpoint.name!,
      description: endpoint.description || '',
      path: endpoint.path!,
      method: endpoint.method!,
      type: endpoint.type!,
      serviceId: endpoint.serviceId!,
      serviceName: endpoint.serviceName!,
      serviceVersion: endpoint.serviceVersion || '1.0.0',
      status: endpoint.status || ApiStatus.ACTIVE,
      visibility: endpoint.visibility || ApiVisibility.INTERNAL,
      securityLevel: endpoint.securityLevel!,
      requestSchema: endpoint.requestSchema,
      responseSchema: endpoint.responseSchema,
      contentTypes: endpoint.contentTypes || ['application/json'],
      produces: endpoint.produces || ['application/json'],
      authentication: endpoint.authentication || { type: 'none' as any },
      permissions: endpoint.permissions || [],
      scopes: endpoint.scopes || [],
      rateLimits: endpoint.rateLimits || { enabled: false },
      documentation: endpoint.documentation || { summary: '', description: '' },
      examples: endpoint.examples || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deprecatedAt: endpoint.deprecatedAt,
      sunsetAt: endpoint.sunsetAt,
      tags: endpoint.tags || [],
      categories: endpoint.categories || [],
      owner: endpoint.owner || registeredBy,
      maintainer: endpoint.maintainer || registeredBy,
      metrics: endpoint.metrics || this.createDefaultEndpointMetrics(),
      health: endpoint.health || this.createDefaultHealthStatus(),
      version: endpoint.version || '1.0.0',
      apiVersion: endpoint.apiVersion || '1.0.0',
      compatibility: endpoint.compatibility || { 
        backwardCompatible: true, 
        forwardCompatible: true, 
        breakingChanges: [],
        deprecatedFeatures: [],
        migrationRequired: false 
      },
      dependencies: endpoint.dependencies || [],
      consumers: endpoint.consumers || [],
      relatedEndpoints: endpoint.relatedEndpoints || []
    };

    this.endpoints.set(endpointId, fullEndpoint);
    
    // Update service endpoints list
    const service = this.services.get(fullEndpoint.serviceId);
    if (service && !service.endpoints.includes(endpointId)) {
      service.endpoints.push(endpointId);
      await this.storeService(service);
    }
    
    // Store in database
    await this.storeEndpoint(fullEndpoint);
    
    // Log event
    const event: RegistryEvent = {
      eventId: this.generateEventId(),
      eventType: RegistryEventType.ENDPOINT_CREATED,
      timestamp: new Date(),
      entityType: 'endpoint',
      entityId: endpointId,
      userId: registeredBy,
      metadata: { 
        endpointName: fullEndpoint.name,
        path: fullEndpoint.path,
        method: fullEndpoint.method
      }
    };
    
    await this.logEvent(event);
    this.emit('endpointRegistered', { endpoint: fullEndpoint, registeredBy });
    
    return fullEndpoint;
  }

  async updateEndpoint(endpointId: string, updates: Partial<ApiEndpoint>, updatedBy: string): Promise<ApiEndpoint | null> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      return null;
    }

    const oldEndpoint = { ...endpoint };
    const updatedEndpoint = { ...endpoint, ...updates, updatedAt: new Date() };
    
    this.endpoints.set(endpointId, updatedEndpoint);
    await this.storeEndpoint(updatedEndpoint);
    
    // Log event
    const event: RegistryEvent = {
      eventId: this.generateEventId(),
      eventType: RegistryEventType.ENDPOINT_UPDATED,
      timestamp: new Date(),
      entityType: 'endpoint',
      entityId: endpointId,
      changes: this.calculateChanges(oldEndpoint, updatedEndpoint),
      userId: updatedBy,
      metadata: { endpointName: updatedEndpoint.name }
    };
    
    await this.logEvent(event);
    this.emit('endpointUpdated', { endpoint: updatedEndpoint, updatedBy, changes: event.changes });
    
    return updatedEndpoint;
  }

  async deprecateEndpoint(endpointId: string, deprecatedBy: string, reason?: string): Promise<boolean> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      return false;
    }

    endpoint.status = ApiStatus.DEPRECATED;
    endpoint.deprecatedAt = new Date();
    endpoint.updatedAt = new Date();
    
    // Calculate sunset date based on configuration
    if (!endpoint.sunsetAt) {
      endpoint.sunsetAt = new Date(Date.now() + this.config.lifecycle.sunsetNotificationPeriod * 24 * 60 * 60 * 1000);
    }
    
    this.endpoints.set(endpointId, endpoint);
    await this.storeEndpoint(endpoint);
    
    // Log event
    const event: RegistryEvent = {
      eventId: this.generateEventId(),
      eventType: RegistryEventType.ENDPOINT_DEPRECATED,
      timestamp: new Date(),
      entityType: 'endpoint',
      entityId: endpointId,
      userId: deprecatedBy,
      metadata: { 
        endpointName: endpoint.name,
        reason: reason || 'No reason provided',
        sunsetDate: endpoint.sunsetAt?.toISOString()
      }
    };
    
    await this.logEvent(event);
    this.emit('endpointDeprecated', { endpoint, deprecatedBy, reason });
    
    return true;
  }

  // =============================================================================
  // Search and Discovery
  // =============================================================================

  async searchRegistry(filters: ApiRegistryFilters): Promise<ApiRegistrySearchResult> {
    let endpoints = Array.from(this.endpoints.values());
    let services = Array.from(this.services.values());
    
    // Apply filters
    if (filters.serviceIds?.length) {
      endpoints = endpoints.filter(e => filters.serviceIds!.includes(e.serviceId));
      services = services.filter(s => filters.serviceIds!.includes(s.serviceId));
    }
    
    if (filters.statuses?.length) {
      endpoints = endpoints.filter(e => filters.statuses!.includes(e.status));
      services = services.filter(s => filters.statuses!.includes(s.status));
    }
    
    if (filters.visibilities?.length) {
      endpoints = endpoints.filter(e => filters.visibilities!.includes(e.visibility));
      services = services.filter(s => filters.visibilities!.includes(s.visibility));
    }
    
    if (filters.methods?.length) {
      endpoints = endpoints.filter(e => filters.methods!.includes(e.method));
    }
    
    if (filters.tags?.length) {
      endpoints = endpoints.filter(e => filters.tags!.some(tag => e.tags.includes(tag)));
      services = services.filter(s => filters.tags!.some(tag => s.tags.includes(tag)));
    }
    
    if (filters.categories?.length) {
      endpoints = endpoints.filter(e => filters.categories!.some(cat => e.categories.includes(cat)));
      services = services.filter(s => filters.categories!.some(cat => s.categories.includes(cat)));
    }
    
    if (filters.owners?.length) {
      endpoints = endpoints.filter(e => filters.owners!.includes(e.owner));
      services = services.filter(s => filters.owners!.includes(s.owner));
    }
    
    if (filters.createdAfter) {
      endpoints = endpoints.filter(e => e.createdAt > filters.createdAfter!);
      services = services.filter(s => s.createdAt > filters.createdAfter!);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      endpoints = endpoints.filter(e => 
        e.name.toLowerCase().includes(searchTerm) ||
        e.description.toLowerCase().includes(searchTerm) ||
        e.path.toLowerCase().includes(searchTerm)
      );
      services = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort results
    if (filters.sortBy && filters.sortOrder) {
      endpoints = this.sortEndpoints(endpoints, filters.sortBy, filters.sortOrder);
    }
    
    const total = endpoints.length + services.length;
    
    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    
    endpoints = endpoints.slice(offset, offset + limit);
    services = services.slice(Math.max(0, offset - endpoints.length), Math.max(0, offset + limit - endpoints.length));
    
    return {
      endpoints,
      services,
      total,
      hasMore: offset + limit < total,
      filters
    };
  }

  async discoverApi(endpointId: string): Promise<ApiDiscoveryResult | null> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      return null;
    }
    
    const service = this.services.get(endpoint.serviceId);
    if (!service) {
      return null;
    }
    
    // Find related APIs
    const relatedApis = this.findRelatedApis(endpoint);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(endpoint);
    
    // Gather documentation
    const documentation = this.gatherDocumentation(endpoint, service);
    
    return {
      endpoint,
      service,
      recommendations,
      relatedApis,
      documentation,
      examples: endpoint.examples
    };
  }

  // =============================================================================
  // Analytics and Reporting
  // =============================================================================

  async generateAnalytics(timeRange: { start: Date; end: Date }): Promise<RegistryAnalytics> {
    const endpoints = Array.from(this.endpoints.values());
    const services = Array.from(this.services.values());
    
    // Calculate usage analytics
    const totalRequests = endpoints.reduce((sum, e) => sum + e.metrics.requestCount, 0);
    const topEndpoints = endpoints
      .sort((a, b) => b.metrics.requestCount - a.metrics.requestCount)
      .slice(0, 10)
      .map(e => ({ endpointId: e.endpointId, requestCount: e.metrics.requestCount }));
    
    const topServices = services
      .sort((a, b) => b.metrics.totalRequests - a.metrics.totalRequests)
      .slice(0, 10)
      .map(s => ({ serviceId: s.serviceId, requestCount: s.metrics.totalRequests }));
    
    // Calculate health analytics
    const healthyEndpoints = endpoints.filter(e => e.health.status === 'healthy').length;
    const degradedEndpoints = endpoints.filter(e => e.health.status === 'degraded').length;
    const unhealthyEndpoints = endpoints.filter(e => e.health.status === 'unhealthy').length;
    
    const averageUptime = endpoints.reduce((sum, e) => sum + e.health.uptime, 0) / endpoints.length;
    const averageResponseTime = endpoints.reduce((sum, e) => sum + e.metrics.averageResponseTime, 0) / endpoints.length;
    const errorRate = endpoints.reduce((sum, e) => sum + e.metrics.errorRate, 0) / endpoints.length;
    
    // Calculate growth analytics
    const newEndpoints = endpoints.filter(e => 
      e.createdAt >= timeRange.start && e.createdAt <= timeRange.end
    ).length;
    
    const deprecatedEndpoints = endpoints.filter(e =>
      e.deprecatedAt && e.deprecatedAt >= timeRange.start && e.deprecatedAt <= timeRange.end
    ).length;
    
    const updatedEndpoints = endpoints.filter(e =>
      e.updatedAt >= timeRange.start && e.updatedAt <= timeRange.end && 
      e.createdAt < timeRange.start
    ).length;
    
    // Calculate compliance analytics
    const documentedEndpoints = endpoints.filter(e => 
      e.documentation.description && e.documentation.description.length > 0
    ).length;
    
    const authenticatedEndpoints = endpoints.filter(e => 
      e.authentication.type !== 'none'
    ).length;
    
    const versionedEndpoints = endpoints.filter(e => 
      e.version && e.apiVersion
    ).length;
    
    const complianceScore = (
      (documentedEndpoints / endpoints.length) * 0.3 +
      (authenticatedEndpoints / endpoints.length) * 0.4 +
      (versionedEndpoints / endpoints.length) * 0.3
    ) * 100;
    
    return {
      timeRange,
      usage: {
        totalRequests,
        uniqueEndpoints: endpoints.length,
        uniqueServices: services.length,
        topEndpoints,
        topServices,
        usageByCategory: this.calculateUsageByCategory(endpoints),
        usageByVisibility: this.calculateUsageByVisibility(endpoints)
      },
      health: {
        healthyEndpoints,
        degradedEndpoints,
        unhealthyEndpoints,
        averageUptime,
        averageResponseTime,
        errorRate,
        topErrors: this.calculateTopErrors(endpoints)
      },
      growth: {
        newEndpoints,
        deprecatedEndpoints,
        updatedEndpoints,
        growthRate: (newEndpoints - deprecatedEndpoints) / Math.max(endpoints.length - newEndpoints, 1) * 100,
        adoptionRate: newEndpoints / Math.max(endpoints.length, 1) * 100
      },
      compliance: {
        documentedEndpoints,
        authenticatedEndpoints,
        versionedEndpoints,
        complianceScore,
        violations: [] // Would be calculated based on compliance rules
      }
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private startBackgroundTasks(): void {
    if (this.config.monitoring.healthCheckInterval > 0) {
      setInterval(() => {
        this.performHealthChecks();
      }, this.config.monitoring.healthCheckInterval);
    }
    
    // Clean up old events
    setInterval(() => {
      this.cleanupOldEvents();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private async performHealthChecks(): Promise<void> {
    for (const endpoint of this.endpoints.values()) {
      try {
        // Perform health check (simplified)
        const startTime = Date.now();
        // Would make actual HTTP request to endpoint
        const responseTime = Date.now() - startTime;
        
        endpoint.health.status = responseTime < 1000 ? 'healthy' : 'degraded';
        endpoint.health.responseTime = responseTime;
        endpoint.health.lastCheck = new Date();
        
        await this.storeEndpoint(endpoint);
      } catch (error) {
        endpoint.health.status = 'unhealthy';
        endpoint.health.lastCheck = new Date();
        endpoint.health.issues.push({
          severity: 'high',
          type: 'connectivity',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          count: 1
        });
        
        await this.storeEndpoint(endpoint);
      }
    }
  }

  private createDefaultHealthStatus(): HealthStatus {
    return {
      status: 'unknown',
      lastCheck: new Date(),
      uptime: 0,
      issues: [],
      dependencies: []
    };
  }

  private createDefaultEndpointMetrics(): EndpointMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      popularityScore: 0,
      errorRate: 0,
      uptimePercentage: 100
    };
  }

  private createDefaultServiceMetrics(): ServiceMetrics {
    return {
      totalEndpoints: 0,
      activeEndpoints: 0,
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0
    };
  }

  private createDefaultDeploymentInfo(): any {
    return {
      environment: 'development',
      lastDeployment: new Date(),
      deploymentStrategy: 'rolling'
    };
  }

  private generateServiceId(name: string): string {
    return `service_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  private generateEndpointId(path: string, method: string): string {
    return `endpoint_${method.toLowerCase()}_${path.replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeService(service: ApiService): Promise<void> {
    // Database storage implementation
    console.log(`Storing service: ${service.serviceId}`);
  }

  private async storeEndpoint(endpoint: ApiEndpoint): Promise<void> {
    // Database storage implementation  
    console.log(`Storing endpoint: ${endpoint.endpointId}`);
  }

  private async logEvent(event: RegistryEvent): Promise<void> {
    this.eventHistory.push(event);
    
    // Log to audit service
    await this.auditService.logEvent({
      eventType: event.eventType,
      userId: event.userId,
      details: {
        entityType: event.entityType,
        entityId: event.entityId,
        changes: event.changes,
        metadata: event.metadata
      },
      riskLevel: 'LOW',
      compliance: {
        frameworks: ['SOC2'],
        requirements: ['api_governance'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  private mapRowToService(row: any): ApiService {
    // Database row mapping implementation
    return {} as ApiService;
  }

  private mapRowToEndpoint(row: any): ApiEndpoint {
    // Database row mapping implementation
    return {} as ApiEndpoint;
  }

  private calculateChanges(oldObj: any, newObj: any): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    
    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        changes[key] = { old: oldObj[key], new: newObj[key] };
      }
    }
    
    return changes;
  }

  private sortEndpoints(endpoints: ApiEndpoint[], sortBy: string, order: 'asc' | 'desc'): ApiEndpoint[] {
    return endpoints.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'createdAt':
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aVal = a.updatedAt.getTime();
          bVal = b.updatedAt.getTime();
          break;
        case 'popularity':
          aVal = a.metrics.popularityScore;
          bVal = b.metrics.popularityScore;
          break;
        case 'responseTime':
          aVal = a.metrics.averageResponseTime;
          bVal = b.metrics.averageResponseTime;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }
      
      if (order === 'desc') {
        return aVal < bVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
  }

  private findRelatedApis(endpoint: ApiEndpoint): ApiEndpoint[] {
    return Array.from(this.endpoints.values())
      .filter(e => 
        e.endpointId !== endpoint.endpointId && (
          e.serviceId === endpoint.serviceId ||
          e.categories.some(cat => endpoint.categories.includes(cat)) ||
          e.tags.some(tag => endpoint.tags.includes(tag))
        )
      )
      .slice(0, 5);
  }

  private async generateRecommendations(endpoint: ApiEndpoint): Promise<any[]> {
    // Recommendation engine implementation
    return [];
  }

  private gatherDocumentation(endpoint: ApiEndpoint, service: ApiService): any[] {
    // Documentation gathering implementation
    return [];
  }

  private calculateUsageByCategory(endpoints: ApiEndpoint[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    for (const endpoint of endpoints) {
      for (const category of endpoint.categories) {
        usage[category] = (usage[category] || 0) + endpoint.metrics.requestCount;
      }
    }
    
    return usage;
  }

  private calculateUsageByVisibility(endpoints: ApiEndpoint[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    for (const endpoint of endpoints) {
      usage[endpoint.visibility] = (usage[endpoint.visibility] || 0) + endpoint.metrics.requestCount;
    }
    
    return usage;
  }

  private calculateTopErrors(endpoints: ApiEndpoint[]): Array<{ endpoint: string; errorCount: number }> {
    return endpoints
      .sort((a, b) => b.metrics.errorCount - a.metrics.errorCount)
      .slice(0, 10)
      .map(e => ({ endpoint: e.name, errorCount: e.metrics.errorCount }));
  }

  private cleanupOldEvents(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    this.eventHistory = this.eventHistory.filter(event => event.timestamp > cutoffDate);
  }

  // =============================================================================
  // Public API Methods
  // =============================================================================

  getRegistryStatus(): { ready: boolean; endpointCount: number; serviceCount: number } {
    return {
      ready: this.indexingComplete,
      endpointCount: this.endpoints.size,
      serviceCount: this.services.size
    };
  }

  async getEndpoint(endpointId: string): Promise<ApiEndpoint | null> {
    return this.endpoints.get(endpointId) || null;
  }

  async getService(serviceId: string): Promise<ApiService | null> {
    return this.services.get(serviceId) || null;
  }

  async getAllServices(): Promise<ApiService[]> {
    return Array.from(this.services.values());
  }

  async getAllEndpoints(): Promise<ApiEndpoint[]> {
    return Array.from(this.endpoints.values());
  }
}

export default ApiRegistryService;