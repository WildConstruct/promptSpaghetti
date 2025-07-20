/**
 * Routes Setup Module
 * Task: T-1752989143997-22 - Ensure proper TLS configuration
 * Extracts route setup logic for reuse between HTTP/HTTPS servers
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { executeGraph, initializeAnalytics } from '../engine';
import { Graph } from '../../../packages/core/graphSchema';
import { validateGraph } from '../graphValidator';
import { initDatabase, healthCheck, getDatabase, runMigrations } from '../database/connection';
import { correctionsRoutes } from './corrections';
import { workspaceRoutes } from './workspace';
import { workflowRoutes } from './workflow';
import { approvalRoutes } from './approval';
import lockingRoutes from './locking';
import { randomizerRoutes } from './randomizer';
import { analyticsRoutes } from './analytics';
import { ticketRoutes } from './tickets';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { CostTracker } from '../analytics/CostTracker';
import { AnalyticsDAO } from '../database/analytics-dao';
import { MetricsCollector } from '../performance/MetricsCollector';
import { PerformanceDashboard } from '../performance/PerformanceDashboard';
import { ExtensionLifecycleManager } from '../../../packages/core/extensions/ExtensionLifecycleManager';
import { WebSocketServer } from '../websocket/WebSocketServer';
import { WSServerConfig } from '../websocket/types';
import { AnalyticsWebSocketServer } from '../websocket/AnalyticsWebSocketServer';
import { authRoutes, jwtAuthMiddleware } from '../auth/routes';
import { buildAuthConfig, CORS_CONFIG } from '../auth/config';
import { marketplaceRoutes } from '../marketplace/routes';
import { featureToggleRoutes } from './feature-toggles';

// Feature flag for preview API
const ENABLE_PREVIEW_API = process.env.ENABLE_PREVIEW_API !== 'false';

// Request/Response schemas
const PreviewRequestSchema = z.object({
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()).optional(),
    seed: z.number().optional()
  }),
  runs: z.number().int().min(1).max(50).default(5),
  seedStart: z.number().int().min(1).default(1)
});

// Type definitions
type PreviewRequest = z.infer<typeof PreviewRequestSchema>;

/**
 * Generate multiple outputs from a graph using different seeds
 */
export async function generatePreviewOutputs(
  graph: Graph, 
  runs: number, 
  seedStart: number,
  sessionId?: string,
  userId?: number
): Promise<Array<{seed: number, output: string}>> {
  const results = [];
  
  for (let i = 0; i < runs; i++) {
    const seed = seedStart + i;
    const graphWithSeed: Graph = {
      ...graph,
      seed
    };
    
    try {
      const outputs = await executeGraph(graphWithSeed, sessionId, userId);
      results.push({
        seed,
        output: outputs[0] || ''
      });
    } catch (error: unknown) {
      console.error(`Error generating preview for seed ${seed}:`, error);
      results.push({
        seed,
        output: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
  
  return results;
}

/**
 * Setup all routes on a Fastify server instance
 */
export async function setupRoutes(server: FastifyInstance): Promise<void> {
  // Build authentication configuration
  const authConfig = buildAuthConfig();
  server.decorate('authConfig', authConfig);

  // WebSocket server configuration
  const wsConfig: WSServerConfig = {
    port: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8001,
    heartbeatInterval: 30000,
    connectionTimeout: 60000,
    maxConnections: 1000,
    enableAuthentication: process.env.ENABLE_WS_AUTH === 'true',
    jwtSecret: process.env.JWT_SECRET,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
  };

  // Create WebSocket server
  const wsServer = new WebSocketServer(wsConfig);

  // Initialize database
  try {
    const db = initDatabase();
    runMigrations();
    server.decorate('db', db);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }

  // Initialize analytics
  try {
    initializeAnalytics();
    console.log('Analytics system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }

  // Initialize extension system
  try {
    await ExtensionLifecycleManager.getInstance().initialize();
    console.log('Extension system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize extension system:', error);
  }

  // CORS configuration
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
    
    if (request.method === 'OPTIONS') {
      reply.code(204).send();
      return;
    }
    
    done();
  });

  // Root endpoint
  server.get('/', async (request, reply) => {
    const protocol = request.protocol;
    const isSecure = protocol === 'https';
    
    return { 
      status: 'PromptScape API running',
      protocol: protocol,
      secure: isSecure,
      timestamp: new Date().toISOString()
    };
  });

  // Enhanced health check endpoint
  server.get('/health', async (request, reply) => {
    const dbHealthy = healthCheck();
    const wsMetrics = wsServer.getHealthMetrics();
    const wsHealthy = wsMetrics.totalConnections >= 0;
    const protocol = request.protocol;
    
    return { 
      status: (dbHealthy && wsHealthy) ? 'healthy' : 'unhealthy',
      protocol: protocol,
      secure: protocol === 'https',
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

  // TLS-specific health check
  server.get('/health/tls', async (request, reply) => {
    const protocol = request.protocol;
    const isSecure = protocol === 'https';
    
    if (!isSecure) {
      reply.status(400).send({
        error: 'TLS health check requires HTTPS connection',
        protocol: protocol,
        secure: false
      });
      return;
    }

    // Get TLS connection info
    const tlsInfo = {
      protocol: (request.raw as any).socket?.getProtocol?.(),
      cipher: (request.raw as any).socket?.getCipher?.(),
      authorized: (request.raw as any).socket?.authorized,
      peerCertificate: (request.raw as any).socket?.getPeerCertificate?.(false)
    };

    return {
      status: 'tls-healthy',
      secure: true,
      tls: tlsInfo,
      timestamp: new Date().toISOString()
    };
  });

  // Register authentication routes
  server.register(authRoutes, { prefix: '/auth' });
  server.register(jwtAuthMiddleware);

  // Initialize analytics components
  let metricsCollector: MetricsCollector | undefined;
  let performanceDashboard: PerformanceDashboard | undefined;
  let analyticsDAO: AnalyticsDAO | undefined;
  let costTracker: CostTracker | undefined;
  let analyticsDashboard: AnalyticsDashboard | undefined;
  let analyticsWebSocketServer: AnalyticsWebSocketServer | undefined;

  try {
    const db = getDatabase();
    
    metricsCollector = new MetricsCollector();
    performanceDashboard = new PerformanceDashboard(metricsCollector);
    analyticsDAO = new AnalyticsDAO(db);
    
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

    serverAnalyticsCollector.on('events_flushed', (events) => {
      events.forEach((event: any) => analyticsDAO.storeEvent(event));
    });

    analyticsDashboard.start();
    wsServer.analyticsCollector = serverAnalyticsCollector;

    analyticsWebSocketServer = new AnalyticsWebSocketServer(
      serverAnalyticsCollector,
      analyticsDashboard,
      costTracker
    );

    console.log('Server analytics system fully initialized');
  } catch (error) {
    console.error('Failed to initialize server analytics system:', error);
  }

  // Register all API routes
  server.register(correctionsRoutes, { prefix: '/api/corrections' });
  server.register(workspaceRoutes, { prefix: '/api' });
  server.register(workflowRoutes, { prefix: '/api/workflow' });
  server.register(approvalRoutes, { prefix: '/api/approval' });
  server.register(lockingRoutes, { prefix: '/api/locking' });
  server.register(randomizerRoutes, { prefix: '/api/randomizer' });
  server.register(ticketRoutes, { prefix: '/api' });

  if (analyticsDashboard && costTracker) {
    server.register(async (fastify) => {
      await analyticsRoutes(fastify, analyticsDashboard, costTracker);
    }, { prefix: '/api' });
  }

  try {
    const db = getDatabase();
    server.register(async (fastify) => {
      await marketplaceRoutes(fastify, db as any);
    }, { prefix: '/api/marketplace' });
    console.log('Marketplace routes registered successfully');
  } catch (error) {
    console.error('Failed to register marketplace routes:', error);
  }

  try {
    server.register(featureToggleRoutes, { prefix: '/api/feature-toggles' });
    console.log('Feature toggle routes registered successfully');
  } catch (error) {
    console.error('Failed to register feature toggle routes:', error);
  }

  if (analyticsWebSocketServer) {
    analyticsWebSocketServer.setupWebSocketServer(server);
  }

  // Preview endpoints
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
      }
    },
    handler: async (request, reply) => {
      if (!ENABLE_PREVIEW_API) {
        reply.status(503).send({ 
          results: [],
          error: 'Preview API is currently disabled. Please try again later.'
        });
        return;
      }
      
      try {
        const { graph, runs = 5, seedStart = 1 } = request.body;
        const validatedInput = PreviewRequestSchema.parse(request.body);
        const validationResult = validateGraph(graph);
        
        if (!validationResult.valid) {
          reply.status(400).send({
            results: [],
            error: 'Graph validation failed',
            validationErrors: validationResult.errors
          });
          return;
        }
        
        const sessionId = request.headers['x-session-id'];
        const userId = request.headers['x-user-id'] ? parseInt(request.headers['x-user-id']) : undefined;
        
        const results = await generatePreviewOutputs(graph, runs, seedStart, sessionId, userId);
        
        return { results };
      } catch (error: unknown) {
        request.log.error(error);
        
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

  // WebSocket endpoints
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

  // Start WebSocket server
  try {
    await wsServer.start();
    console.log(`WebSocket server started on port ${wsConfig.port}`);
    
    wsServer.on('graph_update', (documentId, updatePayload, connectionInfo) => {
      console.log(`Graph update for document ${documentId} by user ${connectionInfo.userId}`);
    });

    wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

  } catch (wsError) {
    console.error('Failed to start WebSocket server:', wsError);
  }
}