/**
 * API Registry Routes - Epic 17.4.4 Implementation
 * Task: E17-1753114397213-9BD2E3 - Create API registry model
 * 
 * REST API endpoints for the API registry system, providing discovery,
 * registration, and management capabilities for API endpoints and services.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ApiRegistryService } from '../registry/ApiRegistryService';
import {
  ApiRegistryFilters,
  ApiEndpoint,
  ApiService,
  ApiStatus,
  ApiVisibility,
  HttpMethod
 from '../registry/ApiRegistryModel';

// Request/Response Types



interface RegisterServiceRequest {
  name: string;
  description?: string;
  baseUrl: string;
  version?: string;
  status?: ApiStatus;
  visibility?: ApiVisibility;
  protocol?: string;
  port?: number;
  documentation?: {
    summary: string;
    description: string;
    externalDocs?: {
      description: string;
      url: string;



    };
  };
  owner?: string;
  team?: string;
  technicalContact?: string;
  environment?: string;
  tags?: string[];
  categories?: string[];
  complianceLabels?: string[];




interface RegisterEndpointRequest {
  name: string;
  description?: string;
  path: string;
  method: HttpMethod;
  serviceId: string;
  serviceName: string;
  serviceVersion?: string;
  status?: ApiStatus;
  visibility?: ApiVisibility;
  securityLevel: string;
  contentTypes?: string[];
  produces?: string[];
  authentication?: {
    type: string;
    location?: string;
    name?: string;
    scheme?: string;



  };
  permissions?: string[];
  scopes?: string[];
  rateLimits?: {
    enabled: boolean;
    perUser?: {
      requests: number;
      window: string;
    };
    perIp?: {
      requests: number;
      window: string;
    };
  };
  documentation?: {
    summary: string;
    description: string;
    externalDocs?: {
      description: string;
      url: string;
    };
  };
  tags?: string[];
  categories?: string[];
  owner?: string;
  maintainer?: string;




interface UpdateEndpointRequest {
  name?: string;
  description?: string;
  status?: ApiStatus;
  visibility?: ApiVisibility;
  documentation?: {
    summary?: string;
    description?: string;



  };
  tags?: string[];
  categories?: string[];
  rateLimits?: any;




interface SearchQuery {
  serviceIds?: string;
  statuses?: string;
  visibilities?: string;
  methods?: string;
  tags?: string;
  categories?: string;
  owners?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';







interface AnalyticsQuery {
  startDate: string;
  endDate: string;
  includeUsage?: boolean;
  includeHealth?: boolean;
  includeGrowth?: boolean;
  includeCompliance?: boolean;





/**
 * Register API registry routes
 */
export async function apiRegistryRoutes(fastify: FastifyInstance) {
  const registryService = fastify.apiRegistryService as ApiRegistryService;

  if (!registryService) {
    throw new Error('ApiRegistryService not registered with Fastify instance');


  // =============================================================================
  // Service Management Routes
  // =============================================================================

  /**
   * Register a new API service
   */
  fastify.post('/api-registry/services', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'baseUrl'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          baseUrl: { type: 'string', format: 'uri' },
          version: { type: 'string' },
          status: { type: 'string', enum: ['active', 'deprecated', 'beta', 'alpha', 'sunset', 'maintenance', 'disabled'] },
          visibility: { type: 'string', enum: ['public', 'internal', 'private', 'partner', 'admin'] },
          protocol: { type: 'string' },
          port: { type: 'number' },
          documentation: { type: 'object' },
          owner: { type: 'string' },
          team: { type: 'string' },
          technicalContact: { type: 'string' },
          environment: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          complianceLabels: { type: 'array', items: { type: 'string' } }



  }, async (request: FastifyRequest<{ Body: RegisterServiceRequest }>, reply: FastifyReply) => {
    try {
      const registeredBy = (request.user as any)?.id || 'anonymous';
      
      const service = await registryService.registerService(request.body, registeredBy);

      reply.status(201);
      return {
        success: true,
        data: service,
        message: 'Service registered successfully'
      };
 catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register service'
      };

  });

  /**
   * Get all API services
   */
  fastify.get('/api-registry/services', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          visibility: { type: 'string' },
          owner: { type: 'string' },
          team: { type: 'string' },
          environment: { type: 'string' },
          limit: { type: 'number', default: 20, maximum: 100 },
          offset: { type: 'number', default: 0 }



  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const services = await registryService.getAllServices();
      
      // Apply basic filtering
      let filteredServices = services;
      const { status, visibility, owner, team, environment, limit = 20, offset = 0 } = request.query;
      
      if (status) {
        filteredServices = filteredServices.filter(s => s.status === status);

      if (visibility) {
        filteredServices = filteredServices.filter(s => s.visibility === visibility);

      if (owner) {
        filteredServices = filteredServices.filter(s => s.owner === owner);

      if (team) {
        filteredServices = filteredServices.filter(s => s.team === team);

      if (environment) {
        filteredServices = filteredServices.filter(s => s.environment === environment);

      
      // Apply pagination
      const total = filteredServices.length;
      const paginatedServices = filteredServices.slice(offset, offset + limit);
      
      return {
        success: true,
        data: {
          services: paginatedServices,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total


      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get services'
      };

  });

  /**
   * Get service by ID
   */
  fastify.get('/api-registry/services/:serviceId', {
    schema: {
      params: {
        type: 'object',
        required: ['serviceId'],
        properties: {
          serviceId: { type: 'string' }



  }, async (request: FastifyRequest<{ Params: { serviceId: string } }>, reply: FastifyReply) => {
    try {
      const service = await registryService.getService(request.params.serviceId);
      
      if (!service) {
        reply.status(404);
        return {
          success: false,
          error: 'Service not found'
        };


      return {
        success: true,
        data: service
      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get service'
      };

  });

  // =============================================================================
  // Endpoint Management Routes
  // =============================================================================

  /**
   * Register a new API endpoint
   */
  fastify.post('/api-registry/endpoints', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'path', 'method', 'serviceId', 'serviceName', 'securityLevel'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          path: { type: 'string' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'] },
          serviceId: { type: 'string' },
          serviceName: { type: 'string' },
          serviceVersion: { type: 'string' },
          status: { type: 'string', enum: ['active', 'deprecated', 'beta', 'alpha', 'sunset', 'maintenance', 'disabled'] },
          visibility: { type: 'string', enum: ['public', 'internal', 'private', 'partner', 'admin'] },
          securityLevel: { type: 'string' },
          contentTypes: { type: 'array', items: { type: 'string' } },
          produces: { type: 'array', items: { type: 'string' } },
          authentication: { type: 'object' },
          permissions: { type: 'array', items: { type: 'string' } },
          scopes: { type: 'array', items: { type: 'string' } },
          rateLimits: { type: 'object' },
          documentation: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          owner: { type: 'string' },
          maintainer: { type: 'string' }



  }, async (request: FastifyRequest<{ Body: RegisterEndpointRequest }>, reply: FastifyReply) => {
    try {
      const registeredBy = (request.user as any)?.id || 'anonymous';
      
      const endpointData = {
        ...request.body,
        type: 'rest' as any // Default to REST for now
      };
      
      const endpoint = await registryService.registerEndpoint(endpointData, registeredBy);

      reply.status(201);
      return {
        success: true,
        data: endpoint,
        message: 'Endpoint registered successfully'
      };
 catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register endpoint'
      };

  });

  /**
   * Get endpoint by ID
   */
  fastify.get('/api-registry/endpoints/:endpointId', {
    schema: {
      params: {
        type: 'object',
        required: ['endpointId'],
        properties: {
          endpointId: { type: 'string' }



  }, async (request: FastifyRequest<{ Params: { endpointId: string } }>, reply: FastifyReply) => {
    try {
      const endpoint = await registryService.getEndpoint(request.params.endpointId);
      
      if (!endpoint) {
        reply.status(404);
        return {
          success: false,
          error: 'Endpoint not found'
        };


      return {
        success: true,
        data: endpoint
      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get endpoint'
      };

  });

  /**
   * Update endpoint
   */
  fastify.put('/api-registry/endpoints/:endpointId', {
    schema: {
      params: {
        type: 'object',
        required: ['endpointId'],
        properties: {
          endpointId: { type: 'string' }


      body: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['active', 'deprecated', 'beta', 'alpha', 'sunset', 'maintenance', 'disabled'] },
          visibility: { type: 'string', enum: ['public', 'internal', 'private', 'partner', 'admin'] },
          documentation: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          rateLimits: { type: 'object' }



  }, async (request: FastifyRequest<{
    Params: { endpointId: string };
    Body: UpdateEndpointRequest;
>, reply: FastifyReply) => {
    try {
      const updatedBy = (request.user as any)?.id || 'anonymous';
      
      const endpoint = await registryService.updateEndpoint(
        request.params.endpointId,
        request.body,
        updatedBy
      );
      
      if (!endpoint) {
        reply.status(404);
        return {
          success: false,
          error: 'Endpoint not found'
        };


      return {
        success: true,
        data: endpoint,
        message: 'Endpoint updated successfully'
      };
 catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update endpoint'
      };

  });

  /**
   * Deprecate endpoint
   */
  fastify.post('/api-registry/endpoints/:endpointId/deprecate', {
    schema: {
      params: {
        type: 'object',
        required: ['endpointId'],
        properties: {
          endpointId: { type: 'string' }


      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 500 }



  }, async (request: FastifyRequest<{
    Params: { endpointId: string };
    Body: { reason?: string };
>, reply: FastifyReply) => {
    try {
      const deprecatedBy = (request.user as any)?.id || 'anonymous';
      
      const success = await registryService.deprecateEndpoint(
        request.params.endpointId,
        deprecatedBy,
        request.body.reason
      );
      
      if (!success) {
        reply.status(404);
        return {
          success: false,
          error: 'Endpoint not found or cannot be deprecated'
        };


      return {
        success: true,
        message: 'Endpoint deprecated successfully'
      };
 catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deprecate endpoint'
      };

  });

  // =============================================================================
  // Search and Discovery Routes
  // =============================================================================

  /**
   * Search API registry
   */
  fastify.get('/api-registry/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          serviceIds: { type: 'string' },
          statuses: { type: 'string' },
          visibilities: { type: 'string' },
          methods: { type: 'string' },
          tags: { type: 'string' },
          categories: { type: 'string' },
          owners: { type: 'string' },
          search: { type: 'string' },
          limit: { type: 'number', default: 20, maximum: 100 },
          offset: { type: 'number', default: 0 },
          sortBy: { type: 'string' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] }



  }, async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
    try {
      const filters: ApiRegistryFilters = {};
      
      // Parse comma-separated values
      if (request.query.serviceIds) {
        filters.serviceIds = request.query.serviceIds.split(',');

      if (request.query.statuses) {
        filters.statuses = request.query.statuses.split(',') as ApiStatus[];

      if (request.query.visibilities) {
        filters.visibilities = request.query.visibilities.split(',') as ApiVisibility[];

      if (request.query.methods) {
        filters.methods = request.query.methods.split(',') as HttpMethod[];

      if (request.query.tags) {
        filters.tags = request.query.tags.split(',');

      if (request.query.categories) {
        filters.categories = request.query.categories.split(',');

      if (request.query.owners) {
        filters.owners = request.query.owners.split(',');

      
      // Set other filters
      filters.search = request.query.search;
      filters.limit = request.query.limit || 20;
      filters.offset = request.query.offset || 0;
      filters.sortBy = request.query.sortBy as any;
      filters.sortOrder = request.query.sortOrder as any;
      
      const result = await registryService.searchRegistry(filters);

      return {
        success: true,
        data: result
      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search registry'
      };

  });

  /**
   * Discover API details
   */
  fastify.get('/api-registry/discover/:endpointId', {
    schema: {
      params: {
        type: 'object',
        required: ['endpointId'],
        properties: {
          endpointId: { type: 'string' }



  }, async (request: FastifyRequest<{ Params: { endpointId: string } }>, reply: FastifyReply) => {
    try {
      const discovery = await registryService.discoverApi(request.params.endpointId);
      
      if (!discovery) {
        reply.status(404);
        return {
          success: false,
          error: 'API endpoint not found for discovery'
        };


      return {
        success: true,
        data: discovery
      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to discover API'
      };

  });

  // =============================================================================
  // Analytics and Reporting Routes
  // =============================================================================

  /**
   * Get registry analytics
   */
  fastify.get('/api-registry/analytics', {
    schema: {
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          includeUsage: { type: 'boolean', default: true },
          includeHealth: { type: 'boolean', default: true },
          includeGrowth: { type: 'boolean', default: true },
          includeCompliance: { type: 'boolean', default: true }



  }, async (request: FastifyRequest<{ Querystring: AnalyticsQuery }>, reply: FastifyReply) => {
    try {
      const timeRange = {
        start: new Date(request.query.startDate),
        end: new Date(request.query.endDate)
      };
      
      const analytics = await registryService.generateAnalytics(timeRange);

      return {
        success: true,
        data: analytics
      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics'
      };

  });

  // =============================================================================
  // Administrative Routes
  // =============================================================================

  /**
   * Get registry status
   */
  fastify.get('/api-registry/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = registryService.getRegistryStatus();

      return {
        success: true,
        data: {
          ...status,
          timestamp: new Date().toISOString()

      };
 catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get registry status'
      };

  });

  /**
   * Health check endpoint
   */
  fastify.get('/api-registry/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = registryService.getRegistryStatus();
      
      return {
        status: status.ready ? 'healthy' : 'initializing',
        service: 'api-registry',
        version: '1.0.0',
        uptime: process.uptime(),
        endpoints: status.endpointCount,
        services: status.serviceCount,
        timestamp: new Date().toISOString(),
        features: [
          'Service registration and discovery',
          'Endpoint lifecycle management',
          'API analytics and reporting',
          'Health monitoring',
          'Deprecation management',
          'Comprehensive search and filtering'
        ]
      };
 catch (error) {
      reply.status(503);
      return {
        status: 'unhealthy',
        service: 'api-registry',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

  });

  console.log('🔍 API Registry routes registered successfully');


export default apiRegistryRoutes;