import Fastify, { FastifyRequest } from 'fastify';
import { z } from 'zod';
// DEPLOYMENT BLOCKER FIX: Fastify type augmentations loaded automatically
import { executeGraph, initializeAnalytics } from './engine';
import { Graph, Node } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';
// TEMPORARILY DISABLED - exporter has compilation issues
// import { graphToBundle, GeneratorBundle } from './exporter';
import { initDatabase, healthCheck, getDatabase, runMigrations } from './database/connection';
import { correctionsRoutes } from './routes/corrections';
// TEMPORARILY DISABLED - compilation issues
// import { workspaceRoutes } from './routes/workspace';
import { projectRoutes } from './routes/projects';
// TEMPORARILY DISABLED - compilation issues
// import { workflowRoutes } from './routes/workflow';
// TEMPORARILY DISABLED - compilation issues
// import { approvalRoutes } from './routes/approval';
// TEMPORARILY DISABLED - compilation issues
// import lockingRoutes from './routes/locking';
import { randomizerRoutes } from './routes/randomizer';
import { analyticsRoutes } from './routes/analytics';
// TEMPORARILY DISABLED - FastifyRequest missing session/user properties
// import { registerFileBrowserAnalyticsRoutes } from './routes/file-browser-analytics';
// TEMPORARILY DISABLED - compilation issues
// import { registerFileSystemRoutes } from './routes/file-system';
// TEMPORARILY DISABLED - ticket-dao compilation issues (NotificationService, type mismatches)
// import { ticketRoutes } from './routes/tickets';
import { registerVerificationRoutes } from './routes/verification-requests';
// TEMPORARILY DISABLED - PolicyVersionService compilation issues (Error type conflicts)
// import { registerPolicyVersioningRoutes } from './routes/policy-versioning';
// TEMPORARILY DISABLED - type export issues and FastifySchema tags property
// import { transactionTrackingRoutes } from './routes/transaction-tracking';
// TEMPORARILY DISABLED - Database export issue, missing RevisionRequestTypes, FastifySchema tags
// import { revisionRequestRoutes } from './routes/revision-requests';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { AnalyticsCollector } from './analytics/AnalyticsCollector';
import { CostTracker } from './analytics/CostTracker';
import { AnalyticsDAO } from './database/analytics-dao';
import { MetricsCollector } from './performance/MetricsCollector';
import { PerformanceDashboard } from './performance/PerformanceDashboard';
import { ExtensionLifecycleManager } from '../../packages/core/extensions/ExtensionLifecycleManager';
// TEMPORARILY DISABLED - WebSocket type mismatches and message type conflicts  
// import { WebSocketServer } from './websocket/WebSocketServer';
// import { WSServerConfig } from './websocket/types';
// import { AnalyticsWebSocketServer } from './websocket/AnalyticsWebSocketServer';
import { authRoutes, jwtAuthMiddleware } from './auth/routes';
import { enhancedSecurityRoutes } from './auth/routes/enhanced-security';
import { buildAuthConfig, CORS_CONFIG } from './auth/config';
import securityAnalyticsPerformanceRoutes from './routes/security-analytics-performance';
import securityAnalyticsOptimizationRoutes from './routes/security-analytics-optimization';
import securityAnalyticsReliabilityRoutes from './routes/security-analytics-reliability';
import { apiOptimizationRoutes } from './admin/routes/api-optimization';
import { marketplaceRoutes } from './marketplace/routes';
import { communityRoutes } from './community/community.routes';
import { knowledgeBaseRoutes } from './knowledge/knowledge-base.routes';
import { featureToggleRoutes } from './routes/feature-toggles';
import toggleStateRoutes from './routes/toggle-state';
import toggleParametersRoutes from './routes/toggle-parameters';
import { ToggleStateService } from './services/ToggleStateService';
import { FeatureToggleDAO } from './database/feature-toggle-dao';
import { securityHeadersMiddleware, defaultSecurityConfig } from './middleware/security-headers';
import { SecurityAuditService, defaultAuditConfig } from './services/security-audit-service';
import { securityAuditRoutes } from './routes/security-audit';
import { totpRoutes } from './routes/totp';
import { setupRateLimiting } from './middleware/rate-limit-setup';
import { RedisService } from './auth/database/RedisService';
import { TOTPService } from './auth/services/TOTPService';
import { AuditService } from './auth/services/AuditService';
import { createTimeoutMiddleware } from './middleware/timeout-middleware';
import { timeoutManagementRoutes } from './routes/timeout-management';
import { initializeTimeoutManager } from './services/TimeoutManager';
import { createTimeoutMonitoringService } from './services/timeout-monitoring';
import { AnomalyDetectionService, AnomalyDetectionConfig } from './services/AnomalyDetectionService';
import { anomalyDetectionRoutes } from './routes/anomaly-detection';
import { VerificationThresholdService } from './services/VerificationThresholdService';
import { verificationThresholdRoutes } from './routes/verification-threshold';
import { LocationDetectionService, LocationDetectionConfig } from './services/LocationDetectionService';
import { locationDetectionRoutes } from './routes/location-detection';
import { 
  LocationHistoryAnalysisService,
  LocationHistoryAnalysisConfig
} from './services/LocationHistoryAnalysisService';
import { locationHistoryAnalysisRoutes } from './routes/location-history-analysis';
import { DeviceFingerprintingService, DeviceFingerprintConfig } from './services/DeviceFingerprintingService';
import { deviceFingerprintingRoutes } from './routes/device-fingerprinting';
import { NewDeviceDetectionService, NewDevicePolicy } from './services/NewDeviceDetectionService';
import { newDeviceDetectionRoutes } from './routes/new-device-detection';
import { BehaviorAnalyticsService, BehaviorAnalyticsConfig } from './auth/services/BehaviorAnalyticsService';
import { behaviorAnalyticsRoutes } from './routes/behavior-analytics';
import referrerPolicyPlugin from './plugins/referrer-policy';
import { 
  PayloadEncryptionService, 
  defaultPayloadEncryptionConfig,
  requestEncryptionMiddleware,
  responseEncryptionMiddleware,
  encryptionStatusMiddleware
} from './middleware/payload-encryption';
import { payloadEncryptionRoutes } from './routes/payload-encryption';
import { dataClassificationRoutes } from './routes/data-classification';
import { DataClassificationService } from './services/DataClassificationService';
import { KeyManagementService, KeyManagementConfig } from './services/KeyManagementService';
import { AccessControlManager } from './services/AccessControlManager';
import { AuditTeamCollaborationService } from './services/AuditTeamCollaborationService';
import { auditTeamCollaborationRoutes } from './routes/audit-team-collaboration';
import { auditEvidenceRoutes } from './routes/audit-evidence';
import { dataAccessRoutes } from './routes/data-access';
import { DataAccessControlService } from './services/DataAccessControlService';
import { auditWorkflowRoutes } from './routes/audit-workflow';
import { AuditWorkflowService } from './services/AuditWorkflowService';
import { accessRequestWorkflowRoutes } from './routes/access-request-workflow';
import { AccessRequestWorkflowService } from './services/AccessRequestWorkflowService';
import { policyUpdateWorkflowRoutes } from './routes/policy-update-workflow';
import { PolicyUpdateWorkflowService } from './services/PolicyUpdateWorkflowService';
import { policyAcceptanceTrackingRoutes } from './routes/policy-acceptance-tracking';
import { PolicyAcceptanceTrackingService } from './services/PolicyAcceptanceTrackingService';
import { oauthGuidanceRoutes } from './routes/oauth-guidance';
import { OAuthGuidanceService } from './services/OAuthGuidanceService';
import { policyAuthoringRoutes } from './routes/policy-authoring';
import { PolicyAuthoringService } from './services/PolicyAuthoringService';
import { complianceReportingRoutes } from './routes/compliance-reporting';
import { ComplianceReportingService } from './services/ComplianceReportingService';
import { policyNotificationRoutes } from './routes/policy-notification';
import { roleCloneRoutes } from './routes/role-cloning';
import expirationManagementRoutes from './routes/expiration-management';
import { PolicyNotificationService } from './services/PolicyNotificationService';
import { consentCollectionRoutes } from './routes/consent-collection';
import { FinancialDataLifecycleService } from './services/FinancialDataLifecycleService';
import { DataLifecycleAutomationService } from './services/DataLifecycleAutomationService';
import { DataRetentionFrameworkService } from './services/DataRetentionFrameworkService';
import financialServicesRoutes from './routes/financial-services';
import { ConsentCollectionService } from './services/ConsentCollectionService';
import { healthcareRoutes } from './routes/healthcare';
import { trainingDataRoutes } from './routes/training-data-management';
import { webhookAuthRoutes } from './routes/webhook-auth';
import { cryptographicEvidenceRoutes } from './routes/cryptographic-evidence';
import openidConnectRoutes from './routes/openid-connect';
import modelEvaluationWebhooks from './routes/model-evaluation-webhooks';
import { ModelEvaluationTriggerService, defaultModelEvaluationConfig } from './services/ModelEvaluationTriggerService';
import { conflictResolutionRoutes } from './api/collaboration/conflict-resolution';
import { Epic23WorkspaceDAO } from './database/epic23-workspace-dao';

// Error Handling & Resilience System
import { errorHandlerPlugin } from './middleware/error-handler';
import { circuitBreakerService } from './services/CircuitBreakerService';
import { retryService } from './services/RetryService';
import { healthMonitoringService } from './services/HealthMonitoringService';
import { operationalMetricsService } from './services/OperationalMetricsService';
import systemMonitoringRoutes from './routes/system-monitoring';

// Token Influence Analysis System
import TokenInfluenceAnalyzer from './analytics/TokenInfluenceAnalyzer';
import PromptAnalyzer from './analytics/PromptAnalyzer';
import modelInterpretationRoutes from './routes/model-interpretation';

// Rate limiting is integrated with Redis from auth system for distributed rate limiting
// Fallback to in-memory rate limiting if Redis is unavailable

// Feature flag for preview API - can be disabled for rollback if needed
const ENABLE_PREVIEW_API = process.env.ENABLE_PREVIEW_API !== 'false';

// Define request schema
const PreviewRequestSchema = z.object({
  graph: z.object({
    nodes: z.array(z.unknown()),
    edges: z.array(z.unknown()).optional(),
    seed: z.number().optional()
  }),
  runs: z.number().int().min(1).max(50).default(5),
  seedStart: z.number().int().min(1).default(1)
});

// Define response schema
const PreviewResponseSchema = z.object({
  results: z.array(z.object({
    seed: z.number(),
    output: z.string()
  })),
  error: z.string().optional(),
  validationErrors: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      nodeId: z.string().optional(),
      severity: z.enum(['error', 'warning']).optional()
    })
  ).optional()
});

// Type definitions for TypeScript
type PreviewRequest = z.infer<typeof PreviewRequestSchema>;
type PreviewResponse = z.infer<typeof PreviewResponseSchema>;

// Epic 8.5 Performance optimization caches
const graphValidationCache = new Map<string, { valid: boolean, errors?: unknown[] }>();

/**
 * Generate multiple outputs from a graph using different seeds
 * Epic 8.5 - Optimized for parallel execution and sub-second performance
 * Epic 13 - Enhanced with analytics tracking for preview executions
 * 
 * Performance Optimizations:
 * - Shared execution context for all seeds to reduce overhead
 * - Graph validation caching using graph structure hash
 * - Optimized object cloning for seed variants
 * - Parallel Promise.all execution with minimal overhead
 */
export async function generatePreviewOutputs(
  graph: Graph, 
  runs: number, 
  seedStart: number,
  sessionId?: string,
  userId?: number
): Promise<Array<{
  seed: number, 
  output: string, 
  executionTimeMs?: number,
  executionPath?: Record<string, unknown>,
  weightChoices?: Array<{
    nodeId: string,
    selectedOption: unknown,
    availableOptions: unknown[],
    weights?: number[],
    selectionProbability?: number
  }>
}>> {
  const startTime = Date.now();
  
  // Epic 8.5: Generate graph hash for caching
  const graphHash = generateGraphHash(graph);
  
  // Epic 8.5: Pre-validate graph once and cache result
  let validationResult = graphValidationCache.get(graphHash);
  if (!validationResult) {
    validationResult = validateGraph(graph);
    graphValidationCache.set(graphHash, validationResult);
  }
  
  if (!validationResult.valid) {
    throw new Error(`Graph validation failed: ${validationResult.errors?.map(e => e.message).join(', ')}`);
  }
  
  // Epic 8.5: Pre-cache graph information that will be reused
  
  // Epic 8.5: Create optimized execution promises with minimal object creation
  const executionPromises = Array.from({ length: runs }, (_, i) => {
    const seed = seedStart + i;
    const executionStartTime = Date.now();
    
    // Create graph with seed (minimal object creation)
    const graphWithSeed = { ...graph, seed };
    
    return executeGraph(graphWithSeed, sessionId, userId)
      .then(result => ({
        seed,
        output: result.outputs[0] || '',
        executionTimeMs: Date.now() - executionStartTime,
        // Epic 8.5-5: Include weight impact information
        executionPath: result.executionPath,
        // Extract weight-specific information for easier frontend consumption
        weightChoices: result.executionPath?.randomizationPoints?.map(point => ({
          nodeId: point.nodeId,
          selectedOption: point.selectedOption,
          availableOptions: point.availableOptions,
          weights: point.weights,
          selectionProbability: point.selectionProbability
        })) || []
      }))
      .catch(error => {
        console.error(`Error generating preview for seed ${seed}:`, error);
        return {
          seed,
          output: `Error: ${error instanceof Error ? error.message : String(error)}`,
          executionTimeMs: Date.now() - executionStartTime,
          executionPath: undefined,
          weightChoices: []
        };
      });
  });
  
  // Execute all previews in parallel
  const results = await Promise.all(executionPromises);
  
  const totalTime = Date.now() - startTime;
  const avgTime = Math.round(totalTime / runs);
  console.log(`Preview generation: ${runs} seeds completed in ${totalTime}ms (avg: ${avgTime}ms/seed)`);
  
  // Epic 8.5: Log performance warning if not meeting sub-second target
  if (totalTime > 1000) {
    console.warn(`⚠️ Preview generation exceeded 1-second target: ${totalTime}ms for ${runs} seeds`);
  }
  
  return results;
}

/**
 * Epic 8.5: Generate a hash of the graph structure for caching
 */
function generateGraphHash(graph: Graph): string {
  // Create a stable hash from graph structure (excluding seed)
  const graphStructure = {
    nodes: graph.nodes.map(n => ({ id: n.id, type: n.type, inputs: n.inputs }))
  };
  return JSON.stringify(graphStructure);
}



// Create server instance
const server = Fastify({
  logger: true
});

// Build authentication configuration
const authConfig = buildAuthConfig();
server.decorate('authConfig', authConfig);

// WebSocket server configuration
const wsConfig: WSServerConfig = {
  port: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8001,
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 60000, // 60 seconds
  maxConnections: 1000,
  enableAuthentication: process.env.ENABLE_WS_AUTH === 'true',
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
};

// Create WebSocket server
const wsServer = new WebSocketServer(wsConfig);

// Initialize database on startup
try {
  const db = initDatabase();
  
  // Run migrations
  runMigrations();
  
  // Make database available to fastify routes
  server.decorate('db', db);
  // DEPLOYMENT BLOCKER FIX: Add database property as expected by type definitions
  (server as Record<string, unknown>).decorate('database', db);
  (server as Record<string, unknown>).decorate('databaseService', db);
  
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Initialize analytics collection
try {
  initializeAnalytics();
  console.log('Analytics system initialized successfully');
} catch (error) {
  console.error('Failed to initialize analytics:', error);
}

// Initialize timeout manager and monitoring
let timeoutManager: Record<string, unknown> | null = null;
let timeoutMonitoringService: Record<string, unknown> | null = null;
try {
  timeoutManager = initializeTimeoutManager();
  timeoutMonitoringService = createTimeoutMonitoringService(timeoutManager);
  
  // Register timeout middleware
  server.register(createTimeoutMiddleware());
  
  console.log('Timeout management system initialized successfully');
} catch (error) {
  console.error('Failed to initialize timeout management:', error);
  // Continue without timeout management - this is non-critical for basic operation
}

// Initialize Error Handling & Resilience System
try {
  // Register centralized error handler (this should be registered early)
  server.register(errorHandlerPlugin);
  
  // Initialize health monitoring for critical dependencies
  healthMonitoringService.registerDatabaseHealthCheck(async () => {
    try {
      await healthCheck(); // Use existing healthCheck function
      return true;
    } catch {
      return false;
    }
  });

  // Initialize Redis health check if Redis is available
  try {
    const authConfig = createAuthConfig();
    const redisService = new RedisService(authConfig.redis);
    redisService.connect().catch(() => {}); // Connect without blocking
    healthMonitoringService.registerRedisHealthCheck(async () => {
      try {
        const client = redisService.getClient();
        await client.ping();
        return true;
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.log('Redis health check not configured - Redis may not be available');
  }

  // Start health monitoring (check every 30 seconds)
  healthMonitoringService.startMonitoring(30000);
  
  console.log('Error Handling & Resilience System initialized successfully');
} catch (error) {
  console.error('Failed to initialize Error Handling & Resilience System:', error);
  // Continue without enhanced error handling - basic error handling will still work
}

// Helper function to create consistent auth config
function createAuthConfig() {
  return {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    jwtIssuer: 'promptgraph',
    jwtAudience: 'promptgraph-api',
    database: { 
      host: process.env.DB_HOST || 'localhost', 
      port: parseInt(process.env.DB_PORT || '5432'), 
      database: process.env.DB_NAME || 'dev', 
      username: process.env.DB_USER || 'postgres', 
      password: process.env.DB_PASSWORD || 'dev',
      ssl: false,
      poolSize: 10
    },
    redis: { 
      host: process.env.REDIS_HOST || 'localhost', 
      port: parseInt(process.env.REDIS_PORT || '6379') 
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      maxFailedLoginAttempts: 5,
      accountLockoutDuration: 30,
      passwordResetTokenExpiry: 60,
      emailVerificationTokenExpiry: 1440,
      sessionTokenExpiry: 60,
      refreshTokenExpiry: 7
    },
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
        scopes: ['email', 'profile'],
        authorizationUrl: 'https://accounts.google.com/oauth/authorize',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        redirectUri: process.env.GITHUB_REDIRECT_URI || '',
        scopes: ['user:email'],
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user'
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID || '',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
        scopes: ['https://graph.microsoft.com/user.read'],
        authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
      }
    }
  };
}

// Initialize anomaly detection service
let anomalyDetectionService: AnomalyDetectionService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Anomaly detection configuration
  const anomalyConfig: AnomalyDetectionConfig = {
    enabled: process.env.ANOMALY_DETECTION_ENABLED !== 'false',
    checkIntervalSeconds: parseInt(process.env.ANOMALY_CHECK_INTERVAL || '300'), // 5 minutes
    retentionDays: parseInt(process.env.ANOMALY_RETENTION_DAYS || '90'),
    patterns: [], // Will be loaded from database
    notification: {
      email: process.env.SECURITY_ALERT_EMAILS?.split(',') || [],
      webhook: process.env.SECURITY_WEBHOOK_URL,
      slack: process.env.SECURITY_SLACK_WEBHOOK
    },
    responseConfig: {
      autoBlock: process.env.ANOMALY_AUTO_BLOCK === 'true',
      autoDisable: process.env.ANOMALY_AUTO_DISABLE === 'true',
      requireManualReview: process.env.ANOMALY_REQUIRE_REVIEW !== 'false'
    }
  };

  anomalyDetectionService = new AnomalyDetectionService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    anomalyConfig
  );

  console.log('Anomaly detection service initialized successfully');
} catch (error) {
  console.error('Failed to initialize anomaly detection service:', error);
  // Continue without anomaly detection - this is non-critical for basic operation
}

// Initialize verification threshold service
let verificationThresholdService: VerificationThresholdService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  verificationThresholdService = new VerificationThresholdService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    {
      // Environment-based configuration overrides
      lowRisk: parseInt(process.env.VERIFICATION_LOW_RISK_THRESHOLD || '30'),
      mediumRisk: parseInt(process.env.VERIFICATION_MEDIUM_RISK_THRESHOLD || '60'),
      highRisk: parseInt(process.env.VERIFICATION_HIGH_RISK_THRESHOLD || '80'),
      criticalRisk: parseInt(process.env.VERIFICATION_CRITICAL_RISK_THRESHOLD || '95'),
      offHoursMultiplier: parseFloat(process.env.VERIFICATION_OFF_HOURS_MULTIPLIER || '1.5'),
      weekendMultiplier: parseFloat(process.env.VERIFICATION_WEEKEND_MULTIPLIER || '1.2')
    }
  );

  console.log('Verification threshold service initialized successfully');
} catch (error) {
  console.error('Failed to initialize verification threshold service:', error);
  // Continue without verification threshold service - this is non-critical for basic operation
}

// Initialize location detection service
let locationDetectionService: LocationDetectionService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Location detection configuration
  const locationConfig: LocationDetectionConfig = {
    enabled: process.env.LOCATION_DETECTION_ENABLED !== 'false',
    providers: {
      primary: (process.env.LOCATION_PROVIDER as string) || 'ipapi',
      fallback: process.env.LOCATION_FALLBACK_PROVIDERS?.split(',') || ['ipgeolocation'],
      apiKeys: {
        ipgeolocation: process.env.IPGEOLOCATION_API_KEY || '',
        ipstack: process.env.IPSTACK_API_KEY || '',
        maxmind: process.env.MAXMIND_LICENSE_KEY || ''
      }
    },
    riskThresholds: {
      newCountry: parseInt(process.env.LOCATION_NEW_COUNTRY_RISK || '50'),
      newCity: parseInt(process.env.LOCATION_NEW_CITY_RISK || '25'),
      impossibleTravel: parseInt(process.env.LOCATION_IMPOSSIBLE_TRAVEL_RISK || '80'),
      proxyDetection: parseInt(process.env.LOCATION_PROXY_RISK || '60'),
      maliciousIP: parseInt(process.env.LOCATION_MALICIOUS_IP_RISK || '90')
    },
    impossibleTravel: {
      enabled: process.env.IMPOSSIBLE_TRAVEL_ENABLED !== 'false',
      maxSpeedKmh: parseInt(process.env.IMPOSSIBLE_TRAVEL_MAX_SPEED || '1000'), // Commercial aircraft speed
      minimumTimeMinutes: parseInt(process.env.IMPOSSIBLE_TRAVEL_MIN_TIME || '10'),
      alertThresholdKm: parseInt(process.env.IMPOSSIBLE_TRAVEL_THRESHOLD || '100')
    },
    cache: {
      ipLocationTtl: parseInt(process.env.LOCATION_IP_CACHE_TTL || '3600'), // 1 hour
      userLocationTtl: parseInt(process.env.LOCATION_USER_CACHE_TTL || '1800'), // 30 minutes
      riskScoreTtl: parseInt(process.env.LOCATION_RISK_CACHE_TTL || '900') // 15 minutes
    },
    regionalRisk: {
      enabled: process.env.REGIONAL_RISK_ENABLED !== 'false',
      highRiskCountries: process.env.HIGH_RISK_COUNTRIES?.split(',') || ['XX', 'YY'], // Fictional codes for demo
      highRiskRegions: process.env.HIGH_RISK_REGIONS?.split(',') || [],
      riskWeights: {}
    },
    notifications: {
      enabled: process.env.LOCATION_NOTIFICATIONS_ENABLED !== 'false',
      alertOnNewCountry: process.env.LOCATION_ALERT_NEW_COUNTRY !== 'false',
      alertOnImpossibleTravel: process.env.LOCATION_ALERT_IMPOSSIBLE_TRAVEL !== 'false',
      alertOnProxyDetection: process.env.LOCATION_ALERT_PROXY !== 'false',
      webhookUrl: process.env.LOCATION_WEBHOOK_URL
    }
  };

  locationDetectionService = new LocationDetectionService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    locationConfig
  );

  console.log('Location detection service initialized successfully');
} catch (error) {
  console.error('Failed to initialize location detection service:', error);
  // Continue without location detection service - this is non-critical for basic operation
}

// Initialize location history analysis service
let locationHistoryAnalysisService: LocationHistoryAnalysisService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Location history analysis configuration
  const historyAnalysisConfig: LocationHistoryAnalysisConfig = {
    enabled: process.env.LOCATION_HISTORY_ANALYSIS_ENABLED !== 'false',
    clustering: {
      minPointsForCluster: parseInt(process.env.LOCATION_MIN_CLUSTER_POINTS || '3'),
      maxDistanceKm: parseInt(process.env.LOCATION_MAX_CLUSTER_DISTANCE || '5'),
      minTimeForHomeDetection: parseInt(process.env.LOCATION_MIN_HOME_DETECTION_DAYS || '7'),
      confidenceThreshold: parseFloat(process.env.LOCATION_CONFIDENCE_THRESHOLD || '0.6')
    },
    travelAnalysis: {
      enabled: process.env.TRAVEL_ANALYSIS_ENABLED !== 'false',
      maxReasonableSpeedKmh: parseInt(process.env.TRAVEL_MAX_SPEED || '1000'),
      minTravelDistanceKm: parseInt(process.env.TRAVEL_MIN_DISTANCE || '10'),
      anomalyDetectionSensitivity: (process.env.TRAVEL_ANOMALY_SENSITIVITY as any) || 'medium'
    },
    riskScoring: {
      noveltyWeight: parseFloat(process.env.RISK_NOVELTY_WEIGHT || '0.3'),
      frequencyWeight: parseFloat(process.env.RISK_FREQUENCY_WEIGHT || '0.2'),
      geopoliticalWeight: parseFloat(process.env.RISK_GEOPOLITICAL_WEIGHT || '0.2'),
      temporalWeight: parseFloat(process.env.RISK_TEMPORAL_WEIGHT || '0.3')
    },
    anomalyDetection: {
      enabled: process.env.LOCATION_ANOMALY_DETECTION_ENABLED !== 'false',
      sensitivityLevel: parseFloat(process.env.LOCATION_ANOMALY_SENSITIVITY || '0.7'),
      falsePositiveThreshold: parseFloat(process.env.LOCATION_FALSE_POSITIVE_THRESHOLD || '0.2'),
      autoResolveAfterDays: parseInt(process.env.LOCATION_AUTO_RESOLVE_DAYS || '30')
    },
    cache: {
      profileCacheTtl: parseInt(process.env.LOCATION_PROFILE_CACHE_TTL || '3600'), // 1 hour
      analysisCacheTtl: parseInt(process.env.LOCATION_ANALYSIS_CACHE_TTL || '1800'), // 30 minutes
      batchAnalysisSize: parseInt(process.env.LOCATION_BATCH_SIZE || '50')
    }
  };

  locationHistoryAnalysisService = new LocationHistoryAnalysisService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    historyAnalysisConfig
  );

  console.log('Location history analysis service initialized successfully');
} catch (error) {
  console.error('Failed to initialize location history analysis service:', error);
  // Continue without location history analysis service - this is non-critical for basic operation
}

// Initialize device fingerprinting service
let deviceFingerprintingService: DeviceFingerprintingService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Device fingerprinting configuration
  const deviceFingerprintConfig: DeviceFingerprintConfig = {
    enabled: process.env.DEVICE_FINGERPRINTING_ENABLED !== 'false',
    components: {
      collectCanvas: process.env.DEVICE_COLLECT_CANVAS !== 'false',
      collectAudio: process.env.DEVICE_COLLECT_AUDIO !== 'false',
      collectWebGL: process.env.DEVICE_COLLECT_WEBGL !== 'false',
      collectFonts: process.env.DEVICE_COLLECT_FONTS !== 'false',
      collectPlugins: process.env.DEVICE_COLLECT_PLUGINS !== 'false',
      collectWebRTC: process.env.DEVICE_COLLECT_WEBRTC === 'true', // Disabled by default for privacy
      collectHardware: process.env.DEVICE_COLLECT_HARDWARE !== 'false'
    },
    trustScoring: {
      newDevicePenalty: parseInt(process.env.DEVICE_NEW_PENALTY || '10'),
      consistencyBonus: parseInt(process.env.DEVICE_CONSISTENCY_BONUS || '5'),
      anomalyPenalty: parseInt(process.env.DEVICE_ANOMALY_PENALTY || '15'),
      verificationBonus: parseInt(process.env.DEVICE_VERIFICATION_BONUS || '20'),
      ageBonus: parseInt(process.env.DEVICE_AGE_BONUS || '10')
    },
    thresholds: {
      minimumTrustScore: parseInt(process.env.DEVICE_MIN_TRUST_SCORE || '40'),
      suspiciousActivityThreshold: parseInt(process.env.DEVICE_SUSPICIOUS_THRESHOLD || '30'),
      autoBlockThreshold: parseInt(process.env.DEVICE_AUTO_BLOCK_THRESHOLD || '20'),
      fingerprintChangeThreshold: parseInt(process.env.DEVICE_FINGERPRINT_CHANGE_THRESHOLD || '90')
    },
    cache: {
      deviceProfileTtl: parseInt(process.env.DEVICE_PROFILE_TTL || '3600'), // 1 hour
      fingerprintTtl: parseInt(process.env.DEVICE_FINGERPRINT_TTL || '7200'), // 2 hours
      trustScoreTtl: parseInt(process.env.DEVICE_TRUST_SCORE_TTL || '1800') // 30 minutes
    },
    privacy: {
      hashSensitiveData: process.env.DEVICE_HASH_SENSITIVE !== 'false',
      excludeFields: process.env.DEVICE_EXCLUDE_FIELDS?.split(',') || ['webRTC'],
      anonymizeIPs: process.env.DEVICE_ANONYMIZE_IPS !== 'false'
    }
  };

  deviceFingerprintingService = new DeviceFingerprintingService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    deviceFingerprintConfig
  );

  console.log('Device fingerprinting service initialized successfully');
} catch (error) {
  console.error('Failed to initialize device fingerprinting service:', error);
  // Continue without device fingerprinting service - this is non-critical for basic operation
}

// Initialize behavior analytics service
let behaviorAnalyticsService: BehaviorAnalyticsService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Behavior analytics configuration
  const behaviorAnalyticsConfig: BehaviorAnalyticsConfig = {
    baselineWindowDays: parseInt(process.env.BEHAVIOR_BASELINE_DAYS || '30'),
    anomalyThreshold: parseFloat(process.env.BEHAVIOR_ANOMALY_THRESHOLD || '0.8'),
    updateFrequencyMinutes: parseInt(process.env.BEHAVIOR_UPDATE_FREQUENCY || '60'),
    enablePatternDetection: process.env.BEHAVIOR_PATTERN_DETECTION !== 'false',
    patternTypes: (
      process.env.BEHAVIOR_PATTERN_TYPES?.split(',') as any
    ) || ['login_time', 'action_sequence', 'resource_access', 'session_duration'],
    minimumDataPoints: parseInt(process.env.BEHAVIOR_MIN_DATA_POINTS || '20'),
    enableMLAnalysis: process.env.BEHAVIOR_ML_ANALYSIS === 'true',
    modelUpdateFrequencyHours: parseInt(process.env.BEHAVIOR_ML_UPDATE_HOURS || '24'),
    riskWeights: {
      timeAnomaly: parseFloat(process.env.BEHAVIOR_TIME_WEIGHT || '0.2'),
      sequenceAnomaly: parseFloat(process.env.BEHAVIOR_SEQUENCE_WEIGHT || '0.25'),
      volumeAnomaly: parseFloat(process.env.BEHAVIOR_VOLUME_WEIGHT || '0.15'),
      velocityAnomaly: parseFloat(process.env.BEHAVIOR_VELOCITY_WEIGHT || '0.2'),
      patternDeviation: parseFloat(process.env.BEHAVIOR_PATTERN_WEIGHT || '0.2')
    },
    autoBlockThreshold: parseInt(process.env.BEHAVIOR_AUTO_BLOCK_THRESHOLD || '90'),
    alertThreshold: parseInt(process.env.BEHAVIOR_ALERT_THRESHOLD || '70'),
    requireManualReview: process.env.BEHAVIOR_REQUIRE_MANUAL_REVIEW !== 'false'
  };

  behaviorAnalyticsService = new BehaviorAnalyticsService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    behaviorAnalyticsConfig
  );

  console.log('Behavior analytics service initialized successfully');
} catch (error) {
  console.error('Failed to initialize behavior analytics service:', error);
  // Continue without behavior analytics service - this is non-critical for basic operation
}

// Initialize payload encryption service
let payloadEncryptionService: PayloadEncryptionService | undefined;
let keyManagementService: KeyManagementService | undefined;
let dataClassificationService: DataClassificationService | undefined;
let auditTeamCollaborationService: AuditTeamCollaborationService | undefined;
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Key management configuration for payload encryption
  const keyManagementConfig: KeyManagementConfig = {
    keyEncryptionAlgorithm: 'aes-256-gcm',
    defaultRotationIntervalDays: 90,
    rotationOverlapHours: 24,
    autoRotationEnabled: true,
    enableAccessControl: true,
    requireApprovalForSensitiveOps: false, // Auto-approve for payload encryption
    defaultSecurityLevel: 'high',
    cacheEnabled: true,
    cacheTtlSeconds: 3600,
    maxCachedKeys: 1000,
    backupEnabled: true,
    backupRetentionDays: 365,
    backupEncryptionEnabled: true,
    enableComplianceTracking: true,
    auditAllOperations: true,
    dataClassificationRequired: false
  };

  // Initialize access control manager for key management
  const accessControlManager = new AccessControlManager(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService
  );

  // Initialize key management service
  keyManagementService = new KeyManagementService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService,
    accessControlManager,
    keyManagementConfig
  );

  // Initialize payload encryption service
  payloadEncryptionService = new PayloadEncryptionService(
    keyManagementService,
    defaultPayloadEncryptionConfig
  );

  console.log('Payload encryption service initialized successfully');
} catch (error) {
  console.error('Failed to initialize payload encryption service:', error);
  // Continue without payload encryption service - this is non-critical for basic operation
}

// Initialize data classification service
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);

  dataClassificationService = new DataClassificationService(
    db as Record<string, unknown>,
    undefined as Record<string, unknown>, // Redis will be set up later
    auditService
  );

  // Initialize audit team collaboration service
  auditTeamCollaborationService = new AuditTeamCollaborationService(
    db as Record<string, unknown>,
    auditService
  );

  console.log('Data classification service initialized successfully');
  console.log('Audit team collaboration service initialized successfully');
} catch (error) {
  console.error('Failed to initialize data classification service:', error);
  // Continue without data classification service - this is non-critical for basic operation
}

// Initialize security headers middleware
server.addHook('onRequest', securityHeadersMiddleware(defaultSecurityConfig));

// Initialize payload encryption middleware
if (payloadEncryptionService) {
  server.addHook('onRequest', encryptionStatusMiddleware());
  server.addHook('preHandler', requestEncryptionMiddleware(payloadEncryptionService));
  server.addHook('onRequest', responseEncryptionMiddleware(payloadEncryptionService));
}

// Register referrer policy plugin
server.register(referrerPolicyPlugin, {
  enabled: process.env.REFERRER_POLICY_ENABLED !== 'false',
  defaultPolicy: (process.env.REFERRER_POLICY_DEFAULT as any) || 'strict-origin-when-cross-origin',
  strictMode: process.env.REFERRER_POLICY_STRICT_MODE !== 'false',
  enableReporting: process.env.REFERRER_POLICY_REPORTING !== 'false',
  maxViolationHistory: parseInt(process.env.REFERRER_POLICY_MAX_HISTORY || '10000'),
  cacheTimeout: parseInt(process.env.REFERRER_POLICY_CACHE_TIMEOUT || '3600')
});


// Initialize security audit service
let securityAuditService: SecurityAuditService | undefined;
try {
  securityAuditService = new SecurityAuditService(server, defaultAuditConfig);
  securityAuditService.start();
  console.log('Security audit service initialized successfully');
} catch (error) {
  console.error('Failed to initialize security audit service:', error);
}

// Initialize extension system on startup
(async () => {
  try {
    await ExtensionLifecycleManager.getInstance().initialize();
    console.log('Extension system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize extension system:', error);
    // Don't exit - extension system is not critical for basic functionality
  }
})();

// Enhanced CORS configuration for authentication
server.addHook('onRequest', (request, reply, done) => {
  const origin = request.headers.origin;
  const allowedOrigins = CORS_CONFIG.origin;
  
  if (Array.isArray(allowedOrigins)) {
    if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
      reply.header('Access-Control-Allow-Origin', origin || '*');
    }
  } else if (allowedOrigins === '*' || allowedOrigins === origin) {
    reply.header('Access-Control-Allow-Origin', origin || allowedOrigins);
  }
  
  reply.header('Access-Control-Allow-Methods', CORS_CONFIG.methods.join(', '));
  reply.header('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
  reply.header('Access-Control-Expose-Headers', CORS_CONFIG.exposedHeaders.join(', '));
  reply.header('Access-Control-Allow-Credentials', CORS_CONFIG.credentials.toString());
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    reply.code(204).send();
    return;
  }
  
  done();
});

// Root endpoint
server.get('/', async (request, reply) => {
  return { status: 'PromptScape API running' };
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  const dbHealthy = healthCheck();
  const wsMetrics = wsServer.getHealthMetrics();
  const wsHealthy = wsMetrics.totalConnections >= 0; // Basic check that WS server is responding
  
  return { 
    status: (dbHealthy && wsHealthy) ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    websocket: {
      status: wsHealthy ? 'healthy' : 'unhealthy',
      connections: wsMetrics.totalConnections,
      activeDocuments: wsMetrics.activeDocuments,
      uptime: wsMetrics.uptime
    },
    timestamp: new Date().toISOString()
  };
});

// WebSocket status endpoint
server.get('/ws/status', async (request, reply) => {
  const metrics = wsServer.getHealthMetrics();
  const sessions = wsServer.getDocumentSessions();
  const presenceStats = wsServer.getPresenceStats();
  
  return {
    status: 'running',
    metrics,
    sessions,
    presence: presenceStats,
    timestamp: new Date().toISOString()
  };
});

// Get users in a specific document
server.get('/ws/documents/:documentId/users', async (request, reply) => {
  const { documentId } = request.params as { documentId: string };
  const users = wsServer.getDocumentUsers(documentId);
  
  return {
    documentId,
    users,
    count: users.length,
    timestamp: new Date().toISOString()
  };
});

// Register authentication routes
server.register(authRoutes, { prefix: '/auth' });

// Register enhanced security routes (Epic 19)
server.register(enhancedSecurityRoutes, { prefix: '/auth' });

// Epic 31: API Optimization Routes - Security Analytics Integration
server.register(apiOptimizationRoutes, { prefix: '' }); // No prefix since routes include /admin

// Register role cloning routes (Epic 17 RBAC)
try {
  server.register(roleCloneRoutes, { prefix: '/api/roles' });
  console.log('Role cloning routes registered successfully');
} catch (error) {
  console.error('Failed to register role cloning routes:', error);
}

// Register expiration management routes (Epic 17 Authentication)
try {
  server.register(expirationManagementRoutes, { prefix: '/api/expiration' });
  console.log('Expiration management routes registered successfully');
} catch (error) {
  console.error('Failed to register expiration management routes:', error);
}

// Register security analytics performance monitoring routes (Epic 31.4.3.1)
try {
  server.register(securityAnalyticsPerformanceRoutes);
  server.register(securityAnalyticsOptimizationRoutes);
  server.register(securityAnalyticsReliabilityRoutes);
  console.log('Security analytics performance monitoring routes registered successfully');
} catch (error) {
  console.error('Failed to register security analytics performance monitoring routes:', error);
}

// Register JWT authentication middleware
server.register(jwtAuthMiddleware);

// Initialize additional analytics components
let metricsCollector: MetricsCollector | undefined;
let performanceDashboard: PerformanceDashboard | undefined;
let analyticsDAO: AnalyticsDAO | undefined;
let costTracker: CostTracker | undefined;
let analyticsDashboard: AnalyticsDashboard | undefined;
let analyticsWebSocketServer: AnalyticsWebSocketServer | undefined;

try {
  const db = getDatabase();
  
  // Initialize metrics and performance dashboard
  metricsCollector = new MetricsCollector();
  performanceDashboard = new PerformanceDashboard(metricsCollector);
  
  // Create analytics DAO (separate from engine's instance for server-specific features)
  analyticsDAO = new AnalyticsDAO(db);
  
  // Create a new analytics collector for server-specific analytics
  const serverAnalyticsCollector = new AnalyticsCollector({
    enabled: process.env.ANALYTICS_ENABLED !== 'false',
    sampleRate: parseFloat(process.env.ANALYTICS_SAMPLE_RATE || '1.0'),
    privacyMode: process.env.ANALYTICS_PRIVACY_MODE === 'true'
  });
  
  costTracker = new CostTracker(serverAnalyticsCollector, analyticsDAO);
  analyticsDashboard = new AnalyticsDashboard(
    performanceDashboard,
    serverAnalyticsCollector,
    analyticsDAO,
    costTracker
  );

  // Set up analytics event storage
  serverAnalyticsCollector.on('events_flushed', (events) => {
    events.forEach((event: Record<string, unknown>) => analyticsDAO.storeEvent(event));
  });

  // Start analytics dashboard
  analyticsDashboard.start();

  // Pass analytics collector to WebSocket server
  wsServer.analyticsCollector = serverAnalyticsCollector;

  // Initialize analytics WebSocket server
  analyticsWebSocketServer = new AnalyticsWebSocketServer(
    serverAnalyticsCollector,
    analyticsDashboard,
    costTracker
  );

  console.log('Server analytics system fully initialized');
} catch (error) {
  console.error('Failed to initialize server analytics system:', error);
  // Don't exit - allow server to run without analytics
}

// Register corrections routes
server.register(correctionsRoutes, { prefix: '/api/corrections' });

// Register workspace routes
// TEMPORARILY DISABLED - compilation issues
// server.register(workspaceRoutes, { prefix: '/api' });

// Register project management routes
try {
  server.register(projectRoutes, { prefix: '/api' });
  console.log('Project management routes registered successfully');
} catch (error) {
  console.error('Failed to register project management routes:', error);
}

// Register workflow routes
// TEMPORARILY DISABLED - compilation issues
// server.register(workflowRoutes, { prefix: '/api/workflow' });

// Register approval routes
// TEMPORARILY DISABLED - compilation issues
// server.register(approvalRoutes, { prefix: '/api/approval' });

// Register locking routes  
// TEMPORARILY DISABLED - compilation issues
// server.register(lockingRoutes, { prefix: '/api/locking' });

// Register randomizer routes
server.register(randomizerRoutes, { prefix: '/api/randomizer' });

// Register ticket routes
// TEMPORARILY DISABLED - ticket-dao compilation issues
// server.register(ticketRoutes, { prefix: '/api' });

// Register verification request routes
registerVerificationRoutes(server);

// Register policy versioning routes
// TEMPORARILY DISABLED - PolicyVersionService compilation issues
// registerPolicyVersioningRoutes(server);

// Register transaction tracking routes
// TEMPORARILY DISABLED - type export issues and FastifySchema tags property
// server.register(transactionTrackingRoutes, { prefix: '/api' });

// Register revision request routes
// TEMPORARILY DISABLED - Database export issue, missing RevisionRequestTypes, FastifySchema tags
// server.register(revisionRequestRoutes, { prefix: '/api' });

// Register file browser analytics routes
// TEMPORARILY DISABLED - compilation issues
// server.register(registerFileBrowserAnalyticsRoutes);

// Register file system routes
// TEMPORARILY DISABLED - compilation issues
// server.register(registerFileSystemRoutes);

// Register analytics routes
if (analyticsDashboard && costTracker) {
  server.register(async (fastify) => {
    await analyticsRoutes(fastify, analyticsDashboard, costTracker);
  }, { prefix: '/api' });
}

// Register marketplace routes
try {
  const db = getDatabase();
  server.register(async (fastify) => {
    await marketplaceRoutes(fastify, db as Record<string, unknown>);
    await communityRoutes(fastify, db as Record<string, unknown>);
    await knowledgeBaseRoutes(fastify, db as Record<string, unknown>);
  }, { prefix: '/api/marketplace' });
  console.log('Marketplace routes registered successfully');
} catch (error) {
  console.error('Failed to register marketplace routes:', error);
}

// Register feature toggle routes (Epic 17.1)
try {
  server.register(featureToggleRoutes, { prefix: '/api/feature-toggles' });
  console.log('Feature toggle routes registered successfully');
} catch (error) {
  console.error('Failed to register feature toggle routes:', error);
}

// Register toggle state routes (Epic 17 - Server Integration)
try {
  const db = getDatabase();
  const featureToggleDAO = new FeatureToggleDAO(db as Record<string, unknown>);
  
  server.register(async (fastify) => {
    await toggleStateRoutes(fastify, { dao: featureToggleDAO });
  }, { prefix: '/api/toggle-state' });
  console.log('Toggle state routes registered successfully');
} catch (error) {
  console.error('Failed to register toggle state routes:', error);
}

// Register toggle parameters routes (Epic 17 - Server Integration)
try {
  const db = getDatabase();
  
  server.register(async (fastify) => {
    await toggleParametersRoutes(fastify, { db });
  }, { prefix: '/api/toggle-parameters' });
  console.log('Toggle parameters routes registered successfully');
} catch (error) {
  console.error('Failed to register toggle parameters routes:', error);
}

// Register security audit routes
if (securityAuditService) {
  try {
    server.register(async (fastify) => {
      await securityAuditRoutes(fastify, securityAuditService!);
    }, { prefix: '/api' });
    console.log('Security audit routes registered successfully');
  } catch (error) {
    console.error('Failed to register security audit routes:', error);
  }
}

// Register TOTP routes
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  const totpService = new TOTPService(db, undefined, auditService); // Redis will be initialized separately
  
  server.register(async (fastify) => {
    await totpRoutes(fastify, totpService);
  }, { prefix: '/api' });
  console.log('TOTP routes registered successfully');
} catch (error) {
  console.error('Failed to register TOTP routes:', error);
}

// Register timeout management routes
if (timeoutMonitoringService) {
  try {
    server.register(async (fastify) => {
      await timeoutManagementRoutes(fastify, timeoutMonitoringService);
    }, { prefix: '/api/timeout' });
    console.log('Timeout management routes registered successfully');
  } catch (error) {
    console.error('Failed to register timeout management routes:', error);
  }
}

// Register anomaly detection routes
if (anomalyDetectionService) {
  try {
    server.register(async (fastify) => {
      await anomalyDetectionRoutes(fastify, anomalyDetectionService);
    }, { prefix: '/api/security' });
    console.log('Anomaly detection routes registered successfully');
  } catch (error) {
    console.error('Failed to register anomaly detection routes:', error);
  }
}

// Register verification threshold routes
if (verificationThresholdService) {
  try {
    server.register(async (fastify) => {
      await verificationThresholdRoutes(fastify, verificationThresholdService);
    }, { prefix: '/api/auth' });
    console.log('Verification threshold routes registered successfully');
  } catch (error) {
    console.error('Failed to register verification threshold routes:', error);
  }
}

// Register location detection routes
if (locationDetectionService) {
  try {
    server.register(async (fastify) => {
      await locationDetectionRoutes(fastify, locationDetectionService);
    }, { prefix: '/api/security' });
    console.log('Location detection routes registered successfully');
  } catch (error) {
    console.error('Failed to register location detection routes:', error);
  }
}

// Register location history analysis routes
if (locationHistoryAnalysisService) {
  try {
    server.register(async (fastify) => {
      await locationHistoryAnalysisRoutes(fastify, locationHistoryAnalysisService);
    }, { prefix: '/api/security' });
    console.log('Location history analysis routes registered successfully');
  } catch (error) {
    console.error('Failed to register location history analysis routes:', error);
  }
}

// Register device fingerprinting routes
if (deviceFingerprintingService) {
  try {
    server.register(async (fastify) => {
      await deviceFingerprintingRoutes(fastify, deviceFingerprintingService);
    }, { prefix: '/api' });
    console.log('Device fingerprinting routes registered successfully');
  } catch (error) {
    console.error('Failed to register device fingerprinting routes:', error);
  }
}

// Register behavior analytics routes
if (behaviorAnalyticsService) {
  try {
    server.register(async (fastify) => {
      await behaviorAnalyticsRoutes(fastify, behaviorAnalyticsService);
    }, { prefix: '/api' });
    console.log('Behavior analytics routes registered successfully');
  } catch (error) {
    console.error('Failed to register behavior analytics routes:', error);
  }
}

// Register payload encryption routes
if (payloadEncryptionService) {
  try {
    server.register(async (fastify) => {
      await payloadEncryptionRoutes(fastify, payloadEncryptionService);
    }, { prefix: '/api' });
    console.log('Payload encryption routes registered successfully');
  } catch (error) {
    console.error('Failed to register payload encryption routes:', error);
  }
}

// Register data classification routes
if (dataClassificationService) {
  try {
    server.register(async (fastify) => {
      await dataClassificationRoutes(fastify, dataClassificationService);
    }, { prefix: '/api' });
    console.log('Data classification routes registered successfully');
  } catch (error) {
    console.error('Failed to register data classification routes:', error);
  }
}

// Register audit team collaboration routes
if (auditTeamCollaborationService) {
  try {
    server.register(async (fastify) => {
      await auditTeamCollaborationRoutes(fastify, auditTeamCollaborationService);
    }, { prefix: '/api/audit-collaboration' });
    console.log('Audit team collaboration routes registered successfully');
  } catch (error) {
    console.error('Failed to register audit team collaboration routes:', error);
  }
}

// Register audit evidence mapping routes (Epic 19.3)
try {
  server.register(auditEvidenceRoutes, { prefix: '/api/evidence-mapping' });
  console.log('Audit evidence mapping routes registered successfully');
} catch (error) {
  console.error('Failed to register audit evidence mapping routes:', error);
}

// Register data access control routes (Epic 19.4)
try {
  const db = getDatabase();
  const authConfig = createAuthConfig();
  
  const auditService = new AuditService(authConfig, db as Record<string, unknown>);
  
  // Initialize services with proper error handling for constructors
  let dataClassificationService: Record<string, unknown> | null = null;
  let keyManagementService: Record<string, unknown> | null = null;
  let dataAccessControlService: Record<string, unknown> | null = null;
  let auditWorkflowService: Record<string, unknown> | null = null;
  let accessRequestWorkflowService: Record<string, unknown> | null = null;
  let policyUpdateWorkflowService: Record<string, unknown> | null = null;
  let policyAcceptanceTrackingService: Record<string, unknown> | null = null;
  let oauthGuidanceService: Record<string, unknown> | null = null;
  let policyAuthoringService: Record<string, unknown> | null = null;
  let policyNotificationService: Record<string, unknown> | null = null;
  let complianceReportingService: Record<string, unknown> | null = null;
  let consentCollectionService: Record<string, unknown> | null = null;
  
  try {
    dataClassificationService = new DataClassificationService(
      db as Record<string,
      unknown>,
      undefined as Record<string,
      unknown>,
      auditService
    );
  } catch (e) { console.log('DataClassificationService init failed:', e); }
  
  try {
    keyManagementService = new KeyManagementService(
      {} as any,
      undefined as Record<string, unknown>,
      undefined as Record<string, unknown>,
      undefined as Record<string, unknown>,
      undefined as Record<string, unknown>
    );
  } catch (e) { console.log('KeyManagementService init failed:', e); }
  
  try {
    dataAccessControlService = new DataAccessControlService(db as Record<string, unknown>, auditService);
  } catch (e) { console.log('DataAccessControlService init failed:', e); }
  
  try {
    auditWorkflowService = new AuditWorkflowService(
      db as Record<string,
      unknown>,
      auditService,
      dataAccessControlService
    );
  } catch (e) { console.log('AuditWorkflowService init failed:', e); }
  
  try {
    accessRequestWorkflowService = new AccessRequestWorkflowService(
      db as Record<string, unknown>,
      auditService,
      dataAccessControlService
    );
  } catch (e) { console.log('AccessRequestWorkflowService init failed:', e); }
  
  try {
    policyUpdateWorkflowService = new PolicyUpdateWorkflowService(db as Record<string, unknown>, auditService);
  } catch (e) { console.log('PolicyUpdateWorkflowService init failed:', e); }
  
  try {
    policyAcceptanceTrackingService = new PolicyAcceptanceTrackingService(db as Record<string, unknown>, auditService);
  } catch (e) { console.log('PolicyAcceptanceTrackingService init failed:', e); }
  
  try {
    oauthGuidanceService = new OAuthGuidanceService(auditService, dataClassificationService, keyManagementService);
  } catch (e) { console.log('OAuthGuidanceService init failed:', e); }
  
  try {
    policyAuthoringService = new PolicyAuthoringService(auditService);
  } catch (e) { console.log('PolicyAuthoringService init failed:', e); }
  
  try {
    policyNotificationService = new PolicyNotificationService(auditService, policyAuthoringService);
  } catch (e) { console.log('PolicyNotificationService init failed:', e); }
  
  try {
    complianceReportingService = new ComplianceReportingService(
      auditService,
      policyAuthoringService,
      policyNotificationService
    );
  } catch (e) { console.log('ComplianceReportingService init failed:', e); }
  
  try {
    consentCollectionService = new ConsentCollectionService(auditService);
  } catch (e) { console.log('ConsentCollectionService init failed:', e); }
  
  // Initialize Model Evaluation Trigger Service (Epic 26.3)
  const modelEvaluationService = new ModelEvaluationTriggerService(
    defaultModelEvaluationConfig,
    auditService
  );
  
  // Initialize Financial Data Lifecycle Service for Epic 19.2.6
  const dataLifecycleAutomationService = new DataLifecycleAutomationService(
    db as Record<string, unknown>,
    auditService,
    undefined as Record<string, unknown>,
    undefined as Record<string, unknown>
  );
  const dataRetentionFrameworkService = new DataRetentionFrameworkService(db as Record<string, unknown>, auditService);
  const financialDataLifecycleService = new FinancialDataLifecycleService(
    db as Record<string, unknown>,
    auditService,
    dataLifecycleAutomationService,
    dataRetentionFrameworkService,
    dataClassificationService
  );
  
  // Make the services available to routes via Fastify's dependency injection
  // DEPLOYMENT BLOCKER FIX: Add auditService property as expected by type definitions
  server.decorate('auditService', auditService);
  server.decorate('dataAccessControlService', dataAccessControlService);
  server.decorate('auditWorkflowService', auditWorkflowService);
  server.decorate('accessRequestWorkflowService', accessRequestWorkflowService);
  server.decorate('policyUpdateWorkflowService', policyUpdateWorkflowService);
  server.decorate('policyAcceptanceTrackingService', policyAcceptanceTrackingService);
  server.decorate('oauthGuidanceService', oauthGuidanceService);
  server.decorate('policyAuthoringService', policyAuthoringService);
  server.decorate('policyNotificationService', policyNotificationService);
  server.decorate('complianceReportingService', complianceReportingService);
  server.decorate('consentCollectionService', consentCollectionService);
  server.decorate('financialDataLifecycleService', financialDataLifecycleService);
  server.decorate('modelEvaluationService', modelEvaluationService);
  
  server.register(dataAccessRoutes, { prefix: '/api/data-access' });
  server.register(auditWorkflowRoutes, { prefix: '/api/audit-workflow' });
  server.register(accessRequestWorkflowRoutes, { prefix: '/api/access-request-workflow' });
  server.register(policyUpdateWorkflowRoutes, { prefix: '/api/policy-update-workflow' });
  server.register(policyAcceptanceTrackingRoutes, { prefix: '/api/policy-acceptance-tracking' });
  server.register(oauthGuidanceRoutes, { prefix: '/api/oauth-guidance' });
  server.register(policyAuthoringRoutes, { prefix: '/api/policy-authoring' });
  server.register(policyNotificationRoutes, { prefix: '/api/policy-notification' });
  server.register(complianceReportingRoutes, { prefix: '/api/compliance-reporting' });
  server.register(consentCollectionRoutes, { prefix: '/api/consent-collection' });
  server.register(financialServicesRoutes, { prefix: '/api/financial-services' });
  server.register(healthcareRoutes, { prefix: '/api' });
  server.register(trainingDataRoutes, { prefix: '/api' });
  server.register(webhookAuthRoutes, { prefix: '/api' });
  server.register(cryptographicEvidenceRoutes, { prefix: '/api/cryptographic-evidence' });
  server.register(openidConnectRoutes, { prefix: '/auth/oidc' });
  server.register(modelEvaluationWebhooks, { prefix: '/api/model-evaluation' });
  
  // Register Epic 23 collaboration routes - conflict resolution
  try {
    const epic23WorkspaceDAO = new Epic23WorkspaceDAO(db as Record<string, unknown>);
    server.register(async (fastify) => {
      await conflictResolutionRoutes(fastify, epic23WorkspaceDAO);
    }, { prefix: '/api/collaboration' });
    console.log('Epic 23 conflict resolution routes registered successfully');
  } catch (error) {
    console.error('Failed to register Epic 23 conflict resolution routes:', error);
  }
  
  console.log(
    'Epic 19 security platform routes registered successfully: data access, ' +
    'audit workflow, access request workflow, policy update workflow, ' +
    'policy acceptance tracking, OAuth guidance, policy authoring, ' +
    'policy notifications, compliance reporting, consent collection, ' +
    'financial data lifecycle management, healthcare & life sciences toolkit, ' +
    'training data management, cryptographic evidence signing, OpenID Connect, and model evaluation'
  );

  // Register System Monitoring & Error Handling routes
  server.register(systemMonitoringRoutes, { prefix: '/api' });
  console.log('System monitoring and error handling routes registered successfully');

  // Register Model Interpretation & Token Analysis routes
  try {
    const analyticsCollector = new AnalyticsCollector(db as Record<string, unknown>);
    const tokenInfluenceAnalyzer = TokenInfluenceAnalyzer.getInstance(analyticsCollector);
    const promptAnalyzer = PromptAnalyzer.getInstance(analyticsCollector);
    
    server.register(async (fastify) => {
      await modelInterpretationRoutes(fastify, {
        tokenAnalyzer: tokenInfluenceAnalyzer,
        promptAnalyzer,
        analyticsCollector
      });
    }, { prefix: '/api' });
    
    console.log('Model interpretation and token analysis routes registered successfully');
  } catch (error) {
    console.error('Failed to register model interpretation routes:', error);
  }
} catch (error) {
  console.error('Failed to register data access control routes:', error);
}

// Setup analytics WebSocket server
if (analyticsWebSocketServer) {
  analyticsWebSocketServer.setupWebSocketServer(server);
}

// Legacy GET preview endpoint (dummy data for backwards compatibility)
server.get('/preview', async (request, reply) => {
  return {
    bundle: {
      meta: { version: '0.1.0', seed: 12345 },
      nodes: [],
      edges: [],
      preview: 'This is a dummy prompt preview.'
    }
  };
});

// New POST preview endpoint that actually runs the executor
server.post<{
  Body: PreviewRequest;
  Headers: { 'x-session-id'?: string; 'x-user-id'?: string };
}>('/preview', {
  schema: {
    body: {
      type: 'object',
      required: ['graph'],
      properties: {
        graph: { type: 'object' },
        runs: { type: 'integer', minimum: 1, maximum: 50, default: 5 },
        seedStart: { type: 'integer', minimum: 1, default: 1 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                seed: { type: 'integer' },
                output: { type: 'string' }
              }
            }
          },
          error: { type: 'string' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    // Feature flag check
    if (!ENABLE_PREVIEW_API) {
      reply.status(503).send({ 
        results: [],
        error: 'Preview API is currently disabled. Please try again later.'
      });
      return;
    }
    
    try {
      const { graph, runs = 5, seedStart = 1 } = request.body;
      
      // Validate request with Zod
            
      // Validate graph structure and rules
      const validationResult = validateGraph(graph);
      
      if (!validationResult.valid) {
        // Return validation errors
        reply.status(400).send({
          results: [],
          error: 'Graph validation failed',
          validationErrors: validationResult.errors
        });
        return;
      }
      
      // Generate previews with analytics tracking
      const sessionId = request.headers['x-session-id'];
      const userId = request.headers['x-user-id'] ? parseInt(request.headers['x-user-id']) : undefined;
      
      const results = await generatePreviewOutputs(graph, runs, seedStart, sessionId, userId);
      
      return { results };
    } catch (error: unknown) {
      request.log.error(error);
      
      // Return appropriate error response
      if (error instanceof z.ZodError) {
        reply.status(400).send({ 
          results: [],
          error: `Invalid request: ${error.message}`
        });
      } else {
        reply.status(500).send({ 
          results: [],
          error: `Server error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  }
});

// Export endpoint - Convert graph to GeneratorBundle format
server.post<{
  Body: { 
    graph: Graph; 
    options: { 
      name: string; 
      version?: string; 
      author?: string; 
    } 
  };
}>('/export', {
  schema: {
    body: {
      type: 'object',
      required: ['graph', 'options'],
      properties: {
        graph: { type: 'object' },
        options: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1 },
            version: { type: 'string' },
            author: { type: 'string' }
          }
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          bundle: { type: 'object' },
          filename: { type: 'string' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    try {
      const { graph, options } = request.body;
      
      // Validate graph structure
      const validationResult = validateGraph(graph);
      
      if (!validationResult.valid) {
        reply.status(400).send({
          error: 'Graph validation failed',
          validationErrors: validationResult.errors
        });
        return;
      }
      
      // TEMPORARILY DISABLED - exporter has compilation issues
      // Convert graph to GeneratorBundle
      // const bundle = graphToBundle(graph, options);
      const bundle = { 
        error: "Export functionality temporarily disabled",
        metadata: { version: "0.1.0-alpha" }
      };
      
      // Generate filename
      const safeName = options.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `${safeName}_v${bundle.metadata.version}.bundle.json`;
      
      return { 
        bundle,
        filename
      };
    } catch (error: unknown) {
      request.log.error(error);
      reply.status(500).send({
        error: `Export failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
});

// Start server
const start = async () => {
  try {
    // Initialize Redis service for rate limiting (using auth Redis configuration)
    let redisService: RedisService | undefined;
    try {
      redisService = new RedisService(authConfig.redis);
      await redisService.connect();
      console.log('Redis service connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Continue without Redis - rate limiting will fall back to in-memory
    }

    // Setup rate limiting middleware
    try {
      await setupRateLimiting(server, redisService);
      console.log('Rate limiting middleware configured successfully');
    } catch (error) {
      console.error('Failed to setup rate limiting:', error);
      // Continue without rate limiting - better to have a working server
    }

    // Start anomaly detection service with Redis connection
    if (anomalyDetectionService && redisService) {
      try {
        // Set Redis service on anomaly detection
        (anomalyDetectionService as any).redis = redisService;
        await anomalyDetectionService.start();
        console.log('Anomaly detection service started successfully');
      } catch (error) {
        console.error('Failed to start anomaly detection service:', error);
        // Continue without anomaly detection
      }
    }

    // Configure verification threshold service with Redis
    if (verificationThresholdService && redisService) {
      try {
        // Set Redis service on verification threshold service
        (verificationThresholdService as any).redis = redisService;
        console.log('Verification threshold service configured with Redis successfully');
      } catch (error) {
        console.error('Failed to configure verification threshold service:', error);
        // Continue without Redis - service can still function
      }
    }

    // Initialize location detection service with Redis and start it
    if (locationDetectionService && redisService) {
      try {
        // Set Redis service on location detection service
        (locationDetectionService as any).redis = redisService;
        await locationDetectionService.initialize();
        console.log('Location detection service started successfully');
      } catch (error) {
        console.error('Failed to start location detection service:', error);
        // Continue without location detection
      }
    }

    // Initialize location history analysis service with Redis and start it
    if (locationHistoryAnalysisService && redisService) {
      try {
        // Set Redis service on location history analysis service
        (locationHistoryAnalysisService as any).redis = redisService;
        await locationHistoryAnalysisService.initialize();
        console.log('Location history analysis service started successfully');
      } catch (error) {
        console.error('Failed to start location history analysis service:', error);
        // Continue without location history analysis
      }
    }

    // Initialize device fingerprinting service with Redis and start it
    if (deviceFingerprintingService && redisService) {
      try {
        // Set Redis service on device fingerprinting service
        (deviceFingerprintingService as any).redis = redisService;
        await deviceFingerprintingService.initialize();
        console.log('Device fingerprinting service started successfully');
      } catch (error) {
        console.error('Failed to start device fingerprinting service:', error);
        // Continue without device fingerprinting
      }
    }

    // Initialize behavior analytics service with Redis and start it
    if (behaviorAnalyticsService && redisService) {
      try {
        // Set Redis service on behavior analytics service
        (behaviorAnalyticsService as any).redis = redisService;
        await behaviorAnalyticsService.initialize();
        console.log('Behavior analytics service started successfully');
      } catch (error) {
        console.error('Failed to start behavior analytics service:', error);
        // Continue without behavior analytics
      }
    }

    // Initialize payload encryption service with Redis and start it
    if (payloadEncryptionService && keyManagementService && redisService) {
      try {
        // Set Redis service on key management service
        (keyManagementService as any).redis = redisService;
        
        // Initialize payload encryption service
        await payloadEncryptionService.initialize();
        console.log('Payload encryption service started successfully');
      } catch (error) {
        console.error('Failed to start payload encryption service:', error);
        // Continue without payload encryption
      }
    }

    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    await server.listen({ port, host: '0.0.0.0' });
    const address = server.server.address();
    const portInfo = typeof address === 'string' ? address : address?.port || port;
    console.log(`API listening at ${portInfo}`);

    // Start WebSocket server
    try {
      await wsServer.start();
      console.log(`WebSocket server started on port ${wsConfig.port}`);
      
      // Set up WebSocket event handlers
      wsServer.on('graph_update', (documentId, updatePayload, connectionInfo) => {
        console.log(`Graph update for document ${documentId} by user ${connectionInfo.userId}`);
        // TODO: Implement CRDT persistence here when CRDT integration is ready
      });

      wsServer.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });

    } catch (wsError) {
      console.error('Failed to start WebSocket server:', wsError);
      // Continue without WebSocket functionality for now
    }

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await wsServer.stop();
  if (analyticsWebSocketServer) {
    analyticsWebSocketServer.stop();
  }
  if (securityAuditService) {
    securityAuditService.stop();
  }
  if (timeoutManager) {
    await timeoutManager.cleanup();
  }
  if (timeoutMonitoringService) {
    await timeoutMonitoringService.stop();
  }
  if (anomalyDetectionService) {
    await anomalyDetectionService.stop();
  }
  if (locationDetectionService) {
    console.log('Stopping location detection service...');
  }
  if (locationHistoryAnalysisService) {
    console.log('Stopping location history analysis service...');
  }
  if (deviceFingerprintingService) {
    console.log('Stopping device fingerprinting service...');
  }
  if (behaviorAnalyticsService) {
    await behaviorAnalyticsService.stop();
    console.log('Stopping behavior analytics service...');
  }
  if (payloadEncryptionService) {
    console.log('Stopping payload encryption service...');
  }
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await wsServer.stop();
  if (analyticsWebSocketServer) {
    analyticsWebSocketServer.stop();
  }
  if (securityAuditService) {
    securityAuditService.stop();
  }
  if (timeoutManager) {
    await timeoutManager.cleanup();
  }
  if (timeoutMonitoringService) {
    await timeoutMonitoringService.stop();
  }
  if (anomalyDetectionService) {
    await anomalyDetectionService.stop();
  }
  if (locationDetectionService) {
    console.log('Stopping location detection service...');
  }
  if (locationHistoryAnalysisService) {
    console.log('Stopping location history analysis service...');
  }
  if (deviceFingerprintingService) {
    console.log('Stopping device fingerprinting service...');
  }
  if (behaviorAnalyticsService) {
    await behaviorAnalyticsService.stop();
    console.log('Stopping behavior analytics service...');
  }
  if (payloadEncryptionService) {
    console.log('Stopping payload encryption service...');
  }
  await server.close();
  process.exit(0);
});

start();
