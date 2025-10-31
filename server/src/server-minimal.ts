import Fastify from 'fastify';
import cors from '@fastify/cors';
import { executeGraph, initializeAnalytics } from './engine-basic';
import { Graph } from '../../packages/core/graphSchema';

const server = Fastify({
  logger: true
});

// Enable CORS
server.register(cors, {
  origin: true,
  credentials: true
});

// Initialize analytics (basic mode)
initializeAnalytics();

// Health check endpoint
server.get('/health', async () => ({
  status: 'ok',
  message: 'Server is running (minimal mode)'
}));

type PreviewBody = {
  graph: Graph;
  numSeeds?: number;
};

// Preview endpoint - execute graph with multiple seeds
server.post<{ Body: PreviewBody }>(
  '/preview',
  async (request, reply) => {
  const { graph, numSeeds = 5 } = request.body;

  if (!graph) {
    return reply.status(400).send({ error: 'Graph is required' });
  }

  const outputs: string[][] = [];
  const seeds: number[] = [];

  for (let i = 0; i < numSeeds; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    seeds.push(seed);

    try {
      const graphWithSeed = { ...graph, seed };
      const result = await executeGraph(graphWithSeed);
      outputs.push(result.outputs);
    } catch (error: unknown) {
      console.error(`Error executing graph with seed ${seed}:`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      outputs.push([`Error: ${message}`]);
    }
  }

  return { outputs, seeds };
});

// Export endpoint (placeholder for now)
server.post('/export', async (request, reply) => {
  return reply.status(501).send({
    error: 'Export functionality not available in minimal mode',
    message: 'The exporter module needs to be fixed first'
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8000', 10);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Minimal server running on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('  GET  /health  - Health check');
    console.log('  POST /preview - Execute graph with multiple seeds');
    console.log('  POST /export  - Export graph (currently disabled)');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    server.log.error(error);
    process.exit(1);
  }
};

start();
