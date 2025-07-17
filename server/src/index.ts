import Fastify, { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { executeGraph } from './engine';
import { Graph } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';
import { initDatabase, healthCheck, getDatabase, runMigrations } from './database/connection';
import { correctionsRoutes } from './routes/corrections';
import { workspaceRoutes } from './routes/workspace';
import { workflowRoutes } from './routes/workflow';
import { approvalRoutes } from './routes/approval';
import { ExtensionLifecycleManager } from '../../packages/core/extensions/ExtensionLifecycleManager';
import { WebSocketServer } from './websocket/WebSocketServer';
import { WSServerConfig } from './websocket/types';

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
 */
export async function generatePreviewOutputs(graph: Graph, runs: number, seedStart: number): Promise<Array<{seed: number, output: string}>> {
  const results = [];
  
  // Generate outputs for each seed
  for (let i = 0; i < runs; i++) {
    const seed = seedStart + i;
    const graphWithSeed: Graph = {
      ...graph,
      seed
    };
    
    try {
      const outputs = await executeGraph(graphWithSeed);
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

// We'll add CORS support after installing the dependency
// For now, we'll use a simple CORS header
server.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type');
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

// Register corrections routes
server.register(correctionsRoutes, { prefix: '/api/corrections' });

// Register workspace routes
server.register(workspaceRoutes, { prefix: '/api' });

// Register workflow routes
server.register(workflowRoutes, { prefix: '/api/workflow' });

// Register approval routes
server.register(approvalRoutes, { prefix: '/api/approval' });

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
      
      // Generate previews
      const results = await generatePreviewOutputs(graph, runs, seedStart);
      
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
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await wsServer.stop();
  await server.close();
  process.exit(0);
});

start();
