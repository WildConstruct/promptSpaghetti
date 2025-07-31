/**
 * API Registry Model - Epic 17.4.4 Implementation
 * Task: E17-1753114397213-9BD2E3 - Create API registry model
 * 
 * Comprehensive API registry system for tracking, discovering, and managing
 * API endpoints, services, and their metadata within the Backstage Admin Controls.
 */

import { EventEmitter } from 'events';

// =============================================================================
// Core Registry Types
// =============================================================================

export enum ApiEndpointType {
  REST = 'rest',
  WEBSOCKET = 'websocket',
  WEBHOOK = 'webhook',
  RPC = 'rpc',
  GRAPHQL = 'graphql',
  SSE = 'sse'
}

export enum ApiStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  BETA = 'beta',
  ALPHA = 'alpha',
  SUNSET = 'sunset',
  MAINTENANCE = 'maintenance',
  DISABLED = 'disabled'
}

export enum ApiVisibility {
  PUBLIC = 'public',        // Publicly documented and accessible
  INTERNAL = 'internal',    // Internal to organization
  PRIVATE = 'private',      // Private/restricted access
  PARTNER = 'partner',      // Partner API access
  ADMIN = 'admin'          // Admin-only access
}

export enum ApiSecurityLevel {
  NONE = 'none',           // No authentication required
  API_KEY = 'api_key',     // API key authentication
  OAUTH = 'oauth',         // OAuth authentication  
  JWT = 'jwt',             // JWT token authentication
  MUTUAL_TLS = 'mutual_tls', // Mutual TLS authentication
  CUSTOM = 'custom'        // Custom authentication
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE'
}

// =============================================================================
// API Registry Interfaces
// =============================================================================

}
}
export interface ApiEndpoint {
  // Identification
  endpointId: string;
  name: string;
  description: string;
  path: string;
  method: HttpMethod;
  type: ApiEndpointType;
  
  // Service Information
  serviceId: string;
  serviceName: string;
  serviceVersion: string;
  
  // Operational Status
  status: ApiStatus;
  visibility: ApiVisibility;
  securityLevel: ApiSecurityLevel;
  
  // Technical Specification
  requestSchema?: JsonSchema;
  responseSchema?: JsonSchema;
  contentTypes: string[];
  produces: string[];
  
  // Authentication & Authorization
  authentication: AuthenticationSpec;
  permissions: string[];
  scopes: string[];
  rateLimits: RateLimitSpec;
  
  // Documentation
  documentation: DocumentationSpec;
  examples: ExampleSpec[];
  
  // Lifecycle
  createdAt: Date;
  updatedAt: Date;
  deprecatedAt?: Date;
  sunsetAt?: Date;
  
  // Metadata
  tags: string[];
  categories: string[];
  owner: string;
  maintainer: string;
  
  // Metrics & Monitoring
  metrics: EndpointMetrics;
  health: HealthStatus;
  
  // Versioning
  version: string;
  apiVersion: string;
  compatibility: CompatibilityInfo;
  
  // Relationships
  dependencies: string[];
  consumers: string[];
  relatedEndpoints: string[];
}
}
}

}
}
export interface ApiService {
  // Identification
  serviceId: string;
  name: string;
  description: string;
  baseUrl: string;
  
  // Service Details
  version: string;
  status: ApiStatus;
  visibility: ApiVisibility;
  
  // Technical Information
  protocol: string;
  port?: number;
  endpoints: string[]; // Endpoint IDs
  
  // Service Specification
  openApiSpec?: string;  // OpenAPI/Swagger spec URL
  asyncApiSpec?: string; // AsyncAPI spec URL
  graphqlSchema?: string; // GraphQL schema
  
  // Authentication
  defaultAuthentication: AuthenticationSpec;
  supportedAuthMethods: ApiSecurityLevel[];
  
  // Documentation
  documentation: DocumentationSpec;
  
  // Lifecycle
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  
  // Operational
  health: HealthStatus;
  metrics: ServiceMetrics;
  
  // Ownership & Governance
  owner: string;
  team: string;
  businessOwner?: string;
  technicalContact: string;
  
  // Deployment & Environment
  environment: string;
  deployment: DeploymentInfo;
  dependencies: ServiceDependency[];
  
  // Metadata
  tags: string[];
  categories: string[];
  complianceLabels: string[];
}
}
}

}
}
export interface AuthenticationSpec {
  type: ApiSecurityLevel;
  location?: 'header' | 'query' | 'cookie';
  name?: string;
  scheme?: string;
  format?: string;
  flows?: OAuthFlow[];
  jwksUri?: string;
  issuer?: string;
  audience?: string;
  scopes?: Record<string, string>;
}
}
}

}
}
export interface OAuthFlow {
  type: 'implicit' | 'authorizationCode' | 'clientCredentials' | 'password';
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}
}
}

}
}
export interface RateLimitSpec {
  enabled: boolean;
  global?: RateLimit;
  perUser?: RateLimit;
  perIp?: RateLimit;
  perApiKey?: RateLimit;
  customLimits?: Array<{
    condition: string;
    limit: RateLimit;
}
}
  }>;
}

}
}
export interface RateLimit {
  requests: number;
  window: string; // e.g., '1m', '1h', '1d'
  burst?: number;
}
}
}

}
}
export interface DocumentationSpec {
  summary: string;
  description: string;
  externalDocs?: {
    description: string;
    url: string;
}
}
  };
  changelog?: string;
  migrationGuide?: string;
  troubleshooting?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

}
}
export interface ExampleSpec {
  name: string;
  description: string;
  request?: {
    headers?: Record<string, string>;
    query?: Record<string, unknown>;
    body?: unknown;
}
}
  };
  response?: {
    status: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  curl?: string;
}

}
}
export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  description?: string;
  format?: string;
  enum?: unknown[];
  example?: unknown;
}
}
}

}
}
export interface EndpointMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  lastAccessed?: Date;
  popularityScore: number;
  errorRate: number;
  uptimePercentage: number;
}
}
}

}
}
export interface ServiceMetrics {
  totalEndpoints: number;
  activeEndpoints: number;
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkUsage?: number;
}
}
}

}
}
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime?: number;
  uptime: number;
  issues: HealthIssue[];
  dependencies: DependencyHealth[];
}
}
}

}
}
export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  firstSeen: Date;
  lastSeen: Date;
  count: number;
}
}
}

}
}
export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: Date;
}
}
}

}
}
export interface CompatibilityInfo {
  backwardCompatible: boolean;
  forwardCompatible: boolean;
  breakingChanges: string[];
  deprecatedFeatures: string[];
  migrationRequired: boolean;
}
}
}

}
}
export interface DeploymentInfo {
  environment: string;
  cluster?: string;
  namespace?: string;
  replicas?: number;
  resources?: {
    cpu: string;
    memory: string;
}
}
  };
  lastDeployment: Date;
  deploymentStrategy: string;
  rollbackStrategy?: string;
}

}
}
export interface ServiceDependency {
  serviceId: string;
  name: string;
  type: 'sync' | 'async' | 'data';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  healthImpact: boolean;
}
}
}

// =============================================================================
// Registry Operations
// =============================================================================

}
}
export interface ApiRegistryFilters {
  serviceIds?: string[];
  statuses?: ApiStatus[];
  visibilities?: ApiVisibility[];
  securityLevels?: ApiSecurityLevel[];
  methods?: HttpMethod[];
  tags?: string[];
  categories?: string[];
  owners?: string[];
  createdAfter?: Date;
  updatedAfter?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'popularity' | 'responseTime';
  sortOrder?: 'asc' | 'desc';
}
}
}

}
}
export interface ApiRegistrySearchResult {
  endpoints: ApiEndpoint[];
  services: ApiService[];
  total: number;
  hasMore: boolean;
  filters: ApiRegistryFilters;
}
}
}

}
}
export interface ApiDiscoveryResult {
  endpoint: ApiEndpoint;
  service: ApiService;
  recommendations: ApiRecommendation[];
  relatedApis: ApiEndpoint[];
  documentation: DocumentationLink[];
  examples: ExampleSpec[];
}
}
}

}
}
export interface ApiRecommendation {
  type: 'alternative' | 'complement' | 'upgrade' | 'migration';
  endpointId: string;
  name: string;
  reason: string;
  confidence: number;
}
}
}

}
}
export interface DocumentationLink {
  title: string;
  url: string;
  type: 'guide' | 'reference' | 'tutorial' | 'example' | 'changelog';
}
}
}

}
}
export interface RegistryEvent {
  eventId: string;
  eventType: RegistryEventType;
  timestamp: Date;
  entityType: 'endpoint' | 'service';
  entityId: string;
}
}
  changes?: Record<string, { old: unknown; new: unknown }>;
  userId?: string;
  metadata: Record<string, unknown>;
}

export enum RegistryEventType {
  ENDPOINT_CREATED = 'endpoint_created',
  ENDPOINT_UPDATED = 'endpoint_updated',
  ENDPOINT_DEPRECATED = 'endpoint_deprecated',
  ENDPOINT_DELETED = 'endpoint_deleted',
  SERVICE_CREATED = 'service_created',
  SERVICE_UPDATED = 'service_updated',
  SERVICE_DEPLOYED = 'service_deployed',
  SERVICE_HEALTH_CHANGED = 'service_health_changed',
  SCHEMA_UPDATED = 'schema_updated',
  DOCUMENTATION_UPDATED = 'documentation_updated'
}

// =============================================================================
// Registry Analytics
// =============================================================================

}
}
export interface RegistryAnalytics {
  timeRange: {
    start: Date;
    end: Date;
}
}
  };
  
  // Usage Analytics
  usage: {
    totalRequests: number;
    uniqueEndpoints: number;
    uniqueServices: number;
    topEndpoints: Array<{ endpointId: string; requestCount: number }>;
    topServices: Array<{ serviceId: string; requestCount: number }>;
    usageByCategory: Record<string, number>;
    usageByVisibility: Record<ApiVisibility, number>;
  };
  
  // Health Analytics
  health: {
    healthyEndpoints: number;
    degradedEndpoints: number;
    unhealthyEndpoints: number;
    averageUptime: number;
    averageResponseTime: number;
    errorRate: number;
    topErrors: Array<{ endpoint: string; errorCount: number }>;
  };
  
  // Growth Analytics
  growth: {
    newEndpoints: number;
    deprecatedEndpoints: number;
    updatedEndpoints: number;
    growthRate: number;
    adoptionRate: number;
  };
  
  // Compliance Analytics
  compliance: {
    documentedEndpoints: number;
    authenticatedEndpoints: number;
    versionedEndpoints: number;
    complianceScore: number;
    violations: ComplianceViolation[];
  };
}

}
}
export interface ComplianceViolation {
  endpointId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}
}
}

// =============================================================================
// Registry Configuration
// =============================================================================

}
}
export interface RegistryConfiguration {
  // Discovery Settings
  discovery: {
    autoDiscovery: boolean;
    scanInterval: number;
    scanPaths: string[];
    excludePaths: string[];
}
}
  };
  
  // Validation Settings
  validation: {
    requireDocumentation: boolean;
    requireExamples: boolean;
    requireSchemas: boolean;
    enforceNaming: boolean;
    namingPatterns: Record<string, string>;
  };
  
  // Monitoring Settings
  monitoring: {
    healthCheckInterval: number;
    metricsCollection: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      uptime: number;
    };
  };
  
  // Lifecycle Settings
  lifecycle: {
    deprecationWarningPeriod: number;
    sunsetNotificationPeriod: number;
    autoCleanupDisabled: boolean;
    cleanupRetentionPeriod: number;
  };
  
  // Integration Settings
  integration: {
    openApiImport: boolean;
    swaggerImport: boolean;
    postmanImport: boolean;
    exportFormats: string[];
    webhookNotifications: boolean;
    slackIntegration?: {
      webhookUrl: string;
      channels: string[];
    };
  };
}

// =============================================================================
// Export Registry Model
// =============================================================================

export default {
  ApiEndpointType,
  ApiStatus,
  ApiVisibility,
  ApiSecurityLevel,
  HttpMethod,
  RegistryEventType
};