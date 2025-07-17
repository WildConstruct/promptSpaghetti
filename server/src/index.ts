import Fastify, { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { executeGraph, initializeAnalytics } from './engine';
import { Graph } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';
import { initDatabase, healthCheck, getDatabase, runMigrations } from './database/connection';
import { correctionsRoutes } from './routes/corrections';
import { workspaceRoutes } from './routes/workspace';
import { workflowRoutes } from './routes/workflow';
import { approvalRoutes } from './routes/approval';
import lockingRoutes from './routes/locking';
import { randomizerRoutes } from './routes/randomizer';
import { analyticsRoutes } from './routes/analytics';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { AnalyticsCollector } from './analytics/AnalyticsCollector';
import { CostTracker } from './analytics/CostTracker';
import { AnalyticsDAO } from './database/analytics-dao';
import { MetricsCollector } from './performance/MetricsCollector';
import { PerformanceDashboard } from './performance/PerformanceDashboard';
import { ExtensionLifecycleManager } from '../../packages/core/extensions/ExtensionLifecycleManager';
import { WebSocketServer } from './websocket/WebSocketServer';
import { WSServerConfig } from './websocket/types';
import { AnalyticsWebSocketServer } from './websocket/AnalyticsWebSocketServer';
import { authRoutes, jwtAuthMiddleware } from './auth/routes';
import { buildAuthConfig, CORS_CONFIG } from './auth/config';
import { marketplaceRoutes } from './marketplace/routes';

// Feature flag for preview API - can be disabled for rollback if needed
const ENABLE_PREVIEW_API = process.env.ENABLE_PREVIEW_API !== 'false';

// Define request schema
const PreviewRequestSchema = z.object({
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()).optional(),
    seed: z.number().optional(),
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

/**
 * Generate multiple outputs from a graph using different seeds
 * Epic 13 - Enhanced with analytics tracking for preview executions
 */
export async function generatePreviewOutputs(
  graph: Graph, 
  runs: number, 
  seedStart: number,
  sessionId?: string,
  userId?: number
): Promise<Array<{seed: number, output: string}>> {
  const results = [];
  
  // Generate outputs for each seed
  for (let i = 0; i < runs; i++) {
    const seed = seedStart + i;
    const graphWithSeed: Graph = {
      ...graph,
      seed
    };
    
    try {
      const outputs = await executeGraph(graphWithSeed, sessionId, userId);
      // Use the first output as the preview result
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

// Register JWT authentication middleware
server.register(jwtAuthMiddleware);

// Initialize additional analytics components
let metricsCollector: MetricsCollector;
let performanceDashboard: PerformanceDashboard;
let analyticsDAO: AnalyticsDAO;
let costTracker: CostTracker;
let analyticsDashboard: AnalyticsDashboard;
let analyticsWebSocketServer: AnalyticsWebSocketServer;

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
    events.forEach((event: any) => analyticsDAO.storeEvent(event));
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
server.register(workspaceRoutes, { prefix: '/api' });

// Register workflow routes
server.register(workflowRoutes, { prefix: '/api/workflow' });

// Register approval routes
server.register(approvalRoutes, { prefix: '/api/approval' });

// Register locking routes
server.register(lockingRoutes, { prefix: '/api/locking' });

// Register randomizer routes
server.register(randomizerRoutes, { prefix: '/api/randomizer' });

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
    await marketplaceRoutes(fastify, db);
  }, { prefix: '/api/marketplace' });
  console.log('Marketplace routes registered successfully');
} catch (error) {
  console.error('Failed to register marketplace routes:', error);
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
      const validatedInput = PreviewRequestSchema.parse(request.body);
      
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

// Start server
const start = async () => {
  try {
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
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await wsServer.stop();
  if (analyticsWebSocketServer) {
    analyticsWebSocketServer.stop();
  }
  await server.close();
  process.exit(0);
});

start();
