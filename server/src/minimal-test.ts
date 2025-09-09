// Minimal server test - just the essentials
import Fastify from 'fastify';
import { initDatabase, healthCheck } from './minimal-db';
import { executeGraph, initializeAnalytics } from './engine-basic';
import { Graph } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';

const server = Fastify({ logger: false });

// Initialize database
try {
  const db = initDatabase();
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
server.get('/', async (request, reply) => {
  return { status: 'PromptScape API running - minimal mode' };
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  try {
    const dbHealthy = healthCheck();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      mode: 'minimal',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// Preview endpoint (graph execution)
server.post('/preview', async (request, reply) => {
  try {
    const graph = request.body as Graph;

    // Basic validation
    const validation = validateGraph(graph);
    if (!validation.valid) {
      return reply.code(400).send({
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
    return reply.code(500).send({
      error: 'Graph execution failed',
      message: error.message
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
    console.error('❌ Server start failed:', err);
    process.exit(1);
  }
};

start();
