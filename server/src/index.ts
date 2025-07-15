import Fastify, { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { executeGraph } from './engine';
import { Graph } from '../../packages/core/graphSchema';
import { validateGraph } from './graphValidator';

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
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
