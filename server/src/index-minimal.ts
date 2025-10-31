/**
 * Minimal Server for Epic 2 Demo
 * Bypasses broken configuration files
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { executeGraph } from './engine-basic';
// import { registerAdminRoutes } from './admin-panel';
import { registerEnhancedAdminRoutes } from './admin-panel-enhanced';
import type { Graph } from './exporter-standalone';

const server = Fastify({
  logger: true
});

type PreviewBody = {
  graph: Graph;
  runs?: number;
  seedStart?: number;
};

type ParseBody = {
  prompt: string;
  mode?: string;
};

type CompleteBody = {
  prompt: string;
  model?: string;
};

// Register CORS
server.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Preview endpoint - core functionality
server.post<{ Body: PreviewBody }>(
  '/preview',
  async (request, reply) => {
  try {
    const { graph, runs = 3, seedStart = 1 } = request.body;

    if (!graph || !graph.nodes) {
      return reply.status(400).send({ error: 'Invalid graph structure' });
    }

    const results = [];
    for (let i = 0; i < runs; i++) {
      const seed = seedStart + i;
      try {
        const result = await executeGraph(graph, `session-${seed}`);
        results.push({
          seed,
          output: result.outputs.join('\n')
        });
      } catch (error) {
        console.error(`Error executing graph with seed ${seed}:`, error);
        results.push({
          seed,
          output: '',
          error: 'Execution failed'
        });
      }
    }

    return { results };
  } catch (error) {
    console.error('Preview error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return reply.status(500).send({ error: message });
  }
}
);

// LLM endpoints for Epic 2
server.post<{ Body: ParseBody }>(
  '/api/llm/parse',
  async (request, reply) => {
  try {
    const { prompt, mode = 'standard' } = request.body;

    // For now, return a mock response
    // TODO: Wire to actual PromptParser service
    return {
      success: true,
      mode,
      nodes: [{ type: 'TextBlock', content: prompt, id: 'node-1' }],
      edges: []
    };
  } catch (error) {
    console.error('LLM parse error:', error);
    const message = error instanceof Error ? error.message : 'Parse failed';
    return reply.status(500).send({ error: message });
  }
}
);

// LLM completion endpoint
server.post<{ Body: CompleteBody }>(
  '/api/llm/complete',
  async (request, reply) => {
    try {
      const { prompt, model = 'default' } = request.body;

      // Mock response for demo
      return {
        success: true,
        completion: `Enhanced: ${prompt}`,
        model,
        tokens: { input: 10, output: 5 }
      };
    } catch (error) {
      console.error('LLM complete error:', error);
      const message =
        error instanceof Error ? error.message : 'Completion failed';
      return reply.status(500).send({ error: message });
    }
  }
);

// Admin metrics endpoint
server.get('/api/admin/llm/metrics', async () => {
  // Mock metrics for demo
  return {
    calls_today: 42,
    tokens_used: { input: 1250, output: 890 },
    cost_estimate: 0.03,
    quota_remaining: 58,
    models_used: {
      'deepseek/deepseek-r1:free': 35,
      'openai/gpt-4o-mini': 7
    }
  };
});

// Register enhanced admin panel routes
registerEnhancedAdminRoutes(server);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
