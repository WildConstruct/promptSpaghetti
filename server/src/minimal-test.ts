// Minimal server test - just the essentials
import Fastify from 'fastify';
import { initDatabase, healthCheck } from './minimal-db';
import { executeGraph, initializeAnalytics } from './engine-basic';
import { Graph } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';

const server = Fastify({ logger: false });

// Initialize database
try {
  initDatabase();
  console.log('✅ Database initialized');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
}

// Initialize analytics (stub)
try {
  initializeAnalytics();
  console.log('✅ Analytics initialized (stub mode)');
} catch (error) {
  console.error('❌ Analytics initialization failed:', error);
}

// Root endpoint
server.get('/', async () => ({
  status: 'PromptScape API running - minimal mode'
}));

// Health check endpoint
server.get('/health', async () => {
  try {
    const dbHealthy = healthCheck();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      mode: 'minimal',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Health check failed';
    return {
      status: 'unhealthy',
      database: 'error',
      error: message,
      timestamp: new Date().toISOString()
    };
  }
});

// Preview endpoint (graph execution)
type PreviewBody = {
  graph: Graph;
};

server.post<{ Body: PreviewBody }>('/preview', async (_request, _reply) => {
  try {
    const { graph } = _request.body;

    // Basic validation
    const validation = validateGraph(graph);
    if (!validation.valid) {
      return _reply.code(400).send({
        error: 'Invalid graph',
        details: validation.errors
      });
    }

    // Execute graph (stub mode)
    const result = await executeGraph(graph);

    return {
      outputs: result.outputs,
      executionPath: result.executionPath,
      metadata: {
        nodeCount: graph.nodes?.length || 0,
        seed: graph.seed,
        mode: 'stub'
      }
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Graph execution failed';
    return _reply.code(500).send({
      error: 'Graph execution failed',
      message
    });
  }
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Minimal server running on port ${port}`);
    console.log('✅ Core endpoints: /, /health, /preview');
    console.log('🎯 Ready for testing!');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('❌ Server start failed:', error);
    process.exit(1);
  }
};

start();
