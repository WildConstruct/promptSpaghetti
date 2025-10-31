// Clean main server with basic engine integration
import Fastify from 'fastify';
import { executeGraph, initializeAnalytics } from './engine-basic';
import { Graph } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';
import { initDatabase, healthCheck } from './minimal-db';

const server = Fastify({ logger: false });

// Initialize database
try {
  initDatabase();
  console.log('✅ Database initialized');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
}

// Initialize analytics
try {
  initializeAnalytics();
  console.log('✅ Analytics initialized');
} catch (error) {
  console.error('❌ Analytics initialization failed:', error);
}

// Root endpoint
server.get('/', async () => {
  return {
    status: 'PromptScape API running',
    mode: 'production',
    engine: 'basic',
    features: ['graph-execution', 'deterministic-seeding', 'core-nodes']
  };
});

// Health check endpoint
server.get('/health', async (_request, reply) => {
  try {
    const dbHealthy = healthCheck();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      engine: 'basic',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Health check failed';
    return reply.code(500).send({
      status: 'unhealthy',
      database: 'error',
      error: message,
      timestamp: new Date().toISOString()
    });
  }
});

// Preview endpoint (graph execution)
type PreviewBody = {
  graph: Graph;
};

server.post<{ Body: PreviewBody }>('/preview', async (request, reply) => {
  try {
    const { graph } = request.body;

    // Basic validation
    const validation = validateGraph(graph);
    if (!validation.valid) {
      return reply.code(400).send({
        error: 'Invalid graph',
        details: validation.errors
      });
    }

    // Execute graph with basic engine
    const result = await executeGraph(graph);

    return {
      outputs: result.outputs,
      executionPath: result.executionPath,
      metadata: {
        nodeCount: graph.nodes?.length || 0,
        seed: graph.seed,
        engine: 'basic',
        features: [
          'WeightedChoice',
          'Output',
          'Concat',
          'SetVariable',
          'GetVariable',
          'Include'
        ]
      }
    };
  } catch (error) {
    console.error('Graph execution error:', error);
    const message =
      error instanceof Error ? error.message : 'Graph execution failed';
    return reply.code(500).send({
      error: 'Graph execution failed',
      message
    });
  }
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Main server running on port ${port}`);
    console.log('✅ Engine: Basic with core node types');
    console.log(
      '✅ Features: Graph execution, deterministic seeding, variables'
    );
    console.log('🎯 Ready for production use!');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('❌ Server start failed:', error);
    process.exit(1);
  }
};

start();
