/**
 * Minimal Server for Epic 2 Demo
 * Bypasses broken configuration files
 */

import Fastify from 'fastify';
import path from 'path';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { executeGraph } from './engine-basic';
import { registerEnhancedAdminRoutes } from './admin-panel-enhanced';
import { LLMService } from './services/LLMService';
import { redactPII } from './utils/privacy';
import { filesRoutes } from './routes/files';

// Load environment from root and server/.env (server overrides root)
try {
  const rootEnv = path.resolve(__dirname, '../../.env');
  const serverEnv = path.resolve(__dirname, '../.env');
  dotenv.config({ path: rootEnv });
  dotenv.config({ path: serverEnv, override: true });
} catch {}

const server = Fastify({
  logger: true
});

// Accept classic HTML form posts from the admin panel
// Fastify rejects application/x-www-form-urlencoded by default without a parser
server.addContentTypeParser(
  'application/x-www-form-urlencoded',
  { parseAs: 'string' },
  (_req, body, done) => {
    try {
      const params = new URLSearchParams(body as string);
      const obj: Record<string, any> = {};
      for (const [k, v] of params) obj[k] = v;
      done(null, obj);
    } catch (err) {
      done(err as Error);
    }
  }
);

// Register CORS (configurable via CORS_ORIGINS)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

server.register(cors, {
  origin: (origin, cb) => {
    // Allow non-browser or same-origin requests (no Origin header)
    if (!origin) return cb(null, true);
    const allowed = corsOrigins.includes(origin);
    cb(null, allowed);
  },
  credentials: true,
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Preview endpoint - core functionality
server.post('/preview', async (request, reply) => {
  try {
    const { graph, runs = 3, seedStart = 1 } = request.body as any;
    
    if (!graph || !graph.nodes) {
      return reply.status(400).send({ error: 'Invalid graph structure' });
    }

    const results = [] as Array<{ seed: number; output: string; error?: string }>;
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
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// LLM endpoints for Epic 2
server.post('/api/llm/parse', async (request, reply) => {
  try {
    const { prompt, mode = 'standard' } = request.body as any;
    
    // For now, return a mock response
    return {
      success: true,
      mode,
      nodes: [
        { type: 'TextBlock', content: prompt, id: 'node-1' }
      ],
      edges: []
    };
  } catch (error) {
    console.error('LLM parse error:', error);
    return reply.status(500).send({ error: 'Parse failed' });
  }
});

// LLM completion endpoint
server.post('/api/llm/complete', async (request, reply) => {
  try {
    const { prompt, model } = request.body as any;

    // Token bucket rate limiter (per-IP)
    const limitPerMinute = Number(process.env.LLM_RATE_LIMIT_PER_MINUTE || 60);
    const now = Date.now();
    const ip = (request as any).ip || 'unknown';
    (global as any).__llmBuckets = (global as any).__llmBuckets || new Map<string, { tokens: number; last: number }>();
    const buckets: Map<string, { tokens: number; last: number }> = (global as any).__llmBuckets;
    const bucket = buckets.get(ip) || { tokens: limitPerMinute, last: now };
    // Refill tokens
    const elapsed = now - bucket.last;
    const refill = (elapsed / 60000) * limitPerMinute;
    bucket.tokens = Math.min(limitPerMinute, bucket.tokens + refill);
    bucket.last = now;
    if (bucket.tokens < 1) {
      reply.header('Retry-After', '10');
      return reply.status(429).send({ error: 'Rate limit exceeded' });
    }
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    const llm = new LLMService();
    if (!llm.available()) {
      // Fallback demo response when no API key present
      return {
        success: true,
        completion: `Enhanced: ${redactPII(prompt)}`,
        model: model || 'stub',
        tokens: { input: Math.ceil((prompt?.length || 0) / 4), output: 5 },
        note: 'LLM unavailable (no API key) - returning stubbed completion',
      };
    }

    const result = await llm.complete({ prompt: redactPII(prompt), model });
    return {
      success: true,
      completion: redactPII(result.content),
      model: result.model,
      tokens: { input: result.tokensIn, output: result.tokensOut },
    };
  } catch (error) {
    console.error('LLM complete error:', error);
    return reply.status(500).send({ error: 'Completion failed' });
  }
});

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

// Register file routes (Supabase-backed)
server.register(async (app) => filesRoutes(app));

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
