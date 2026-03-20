/**
 * Canonical server runtime entrypoint.
 *
 * `server/package.json` and `server/tsconfig.json` both point here. Other
 * server mains in `server/src/` are legacy snapshots or reference builds and
 * should not be treated as the active runtime without an explicit source-of-
 * truth update.
 */

import Fastify from 'fastify';
import path from 'path';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { executeGraph } from './engine-basic';
import { Sentry } from './sentry';
import { registerEnhancedAdminRoutes } from './admin-panel-enhanced';
import { filesRoutes } from './routes/files';
import { agentRoutes } from './routes/agent';
import { llmRoutes } from './routes/llm';
import { psgRoutes } from './routes/psg';
import { stripeRoutes } from './routes/stripeRoutes';
import { themeRoutes } from './theme';
import { rateLimiter } from './utils/rateLimit';
import { metrics } from './utils/metrics';
import {
  getAdminDisableReason,
  isAdminSurfaceEnabled,
  requireAdminAuth
} from './utils/adminAuth';
import type { Graph as CoreGraph } from '../../packages/core/graphSchema';
import type { Graph } from './exporter-standalone';

// Load environment from root and server/.env (server overrides root)
try {
  const rootEnv = path.resolve(__dirname, '../../.env');
  const serverEnv = path.resolve(__dirname, '../.env');
  dotenv.config({ path: rootEnv });
  dotenv.config({ path: serverEnv, override: true });
} catch (error) {
  console.warn('Failed to load environment variables:', error);
}

const bodyLimit = process.env.BODY_LIMIT_BYTES
  ? parseInt(process.env.BODY_LIMIT_BYTES)
  : 1_000_000;
const server = Fastify({
  logger: true,
  bodyLimit // cap request body to mitigate abuse
});

type PreviewBody = {
  graph: Graph;
  runs?: number;
  seedStart?: number;
};

// Convert from API Graph type to Core Graph type
function convertToCoreGraph(apiGraph: Graph): CoreGraph {
  return {
    nodes: (apiGraph.nodes || []) as CoreGraph['nodes'],
    seed: apiGraph.seed
  };
}

// Accept classic HTML form posts from the admin panel
// Fastify rejects application/x-www-form-urlencoded by default without a parser
server.addContentTypeParser(
  'application/x-www-form-urlencoded',
  { parseAs: 'string' },
  (_req, body, done) => {
    try {
      const params = new URLSearchParams(body as string);
      const obj: Record<string, string> = {};
      for (const [k, v] of params) {
        obj[k] = v;
      }
      done(null, obj);
    } catch (err) {
      done(err as Error);
    }
  }
);

// Register CORS (configurable via CORS_ORIGINS). If APP_ORIGIN is set, include it.
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
if (process.env.APP_ORIGIN) {
  defaultOrigins.push(process.env.APP_ORIGIN);
}
// include production host by default
defaultOrigins.push('https://ps.wildconstruct.com');
const corsOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

server.register(cors, {
  origin: (origin, cb) => {
    // Allow non-browser or same-origin requests (no Origin header)
    if (!origin) {
      return cb(null, true);
    }
    const isLocalDevOrigin =
      origin === 'http://localhost:3000' ||
      origin === 'http://127.0.0.1:3000' ||
      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173';
    const allowed = isLocalDevOrigin || corsOrigins.includes(origin);
    cb(null, allowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Add conservative security headers to all responses (complements Netlify)
server.addHook('onSend', async (_req, reply, payload) => {
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Referrer-Policy', 'no-referrer');
  // Permissions-Policy: allow only what we use by default
  reply.header(
    'Permissions-Policy',
    'accelerometer=(), camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=()'
  );
  // COOP/COEP are avoided to prevent breaking integrations; set COOP only
  reply.header('Cross-Origin-Opener-Policy', 'same-origin');
  return payload;
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API-style health endpoint for platform checks
server.get('/api/healthz', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Preview endpoint - core functionality
server.post<{ Body: PreviewBody }>(
  '/preview',
  {
    preHandler: rateLimiter({
      key: 'preview',
      limitPerMinute: Number(process.env.PREVIEW_RATE_LIMIT_PER_MINUTE || 60)
    })
  },
  async (request, reply) => {
    try {
      const { graph, runs = 3, seedStart = 1 } = request.body;

      if (!graph || !graph.nodes) {
        return reply.status(400).send({ error: 'Invalid graph structure' });
      }

      metrics.mark('preview.request');
      const results = [] as Array<{
        seed: number;
        output: string;
        error?: string;
      }>;
      for (let i = 0; i < runs; i++) {
        const seed = seedStart + i;
        try {
          // Convert API graph to core graph format and set seed
          const coreGraph = convertToCoreGraph(graph);
          coreGraph.seed = seed;
          const result = await executeGraph(coreGraph);
          results.push({
            seed,
            output: result.outputs.join('\n')
          });
        } catch (error) {
          console.error(`Error executing graph with seed ${seed}:`, error);
          metrics.markError('preview.error');
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
      metrics.markError('preview.fatal');
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return reply.status(500).send({ error: message });
    }
  }
);

// LLM endpoints removed - now handled by registered routes
// import { z } from 'zod';
// import { rateLimiter } from './utils/rateLimit';

// const LLMParseSchema = z.object({
//   prompt: z.string().min(1).max(4000),
//   mode: z.string().default('standard').optional()
// });

// server.post(
//   '/api/llm/parse',
//   {
//     preHandler: rateLimiter({
//       key: 'llm:parse',
//       limitPerMinute: Number(process.env.LLM_RATE_LIMIT_PER_MINUTE || 60)
//     })
//   },
//   async (request, reply) => {
//     try {
//       const parsed = LLMParseSchema.safeParse((request as any).body);
//       if (!parsed.success)
//         return reply.status(400).send({ error: 'Invalid payload' });
//       metrics.mark('llm.parse');
//       const { prompt, mode = 'standard' } = parsed.data as any;
//       // For now, return a mock response
//       return {
//         success: true,
//         mode,
//         nodes: [{ type: 'TextBlock', content: prompt, id: 'node-1' }],
//         edges: []
//       };
//     } catch (error) {
//       console.error('LLM parse error:', error);
//       metrics.markError('llm.parse');
//       return reply.status(500).send({ error: 'Parse failed' });
//     }
//   }
// );

// const LLMCompleteSchema = z.object({
//   prompt: z.string().min(1).max(8000),
//   model: z.string().min(1).max(200).optional()
// });

// server.post(
//   '/api/llm/complete',
//   {
//     preHandler: rateLimiter({
//       key: 'llm:complete',
//       limitPerMinute: Number(process.env.LLM_RATE_LIMIT_PER_MINUTE || 60)
//     })
//   },
//   async (request, reply) => {
//     try {
//       const parsed = LLMCompleteSchema.safeParse((request as any).body);
//       if (!parsed.success)
//         return reply.status(400).send({ error: 'Invalid payload' });
//       metrics.mark('llm.complete');
//       const { prompt, model } = parsed.data;

//       const llm = new LLMService();
//       if (!llm.available()) {
//         // Fallback demo response when no API key present
//         return {
//           success: true,
//           completion: `Enhanced: ${redactPII(prompt)}`,
//           model: model || 'stub',
//           tokens: { input: Math.ceil((prompt?.length || 0) / 4), output: 5 },
//           note: 'LLM unavailable (no API key) - returning stubbed completion'
//         };
//       }

//       // LLMService has its own timeout; optionally override via env
//       if (process.env.LLM_TIMEOUT_MS) {
//         // not changing signature; environment config applies inside service
//         process.env.OPENAI_REQUEST_TIMEOUT_MS = process.env.LLM_TIMEOUT_MS;
//       }
//       const result = await llm.complete({ prompt: redactPII(prompt), model });
//       return {
//         success: true,
//         completion: redactPII(result.content),
//         model: result.model,
//         tokens: { input: result.tokensIn, output: result.tokensOut }
//       };
//     } catch (error: any) {
//       const aborted =
//         error && (error.name === 'AbortError' || error.code === 'ABORT_ERR');
//       if (aborted) {
//         metrics.markError('llm.timeout');
//         return reply.status(504).send({ error: 'LLM timeout' });
//       }
//       console.error('LLM complete error:', error);
//       metrics.markError('llm.complete');
//       return reply.status(500).send({ error: 'Completion failed' });
//     }
//   }
// );

if (isAdminSurfaceEnabled()) {
  server.get(
    '/api/admin/metrics',
    {
      preHandler: [
        (request, reply, done) => {
          if (!requireAdminAuth(request, reply)) {
            return;
          }
          done();
        },
        rateLimiter({ key: 'admin:metrics', limitPerMinute: 30 })
      ]
    },
    async () => {
      return metrics.snapshot();
    }
  );

  registerEnhancedAdminRoutes(server);
  server.register(themeRoutes);
} else {
  server.log.warn(getAdminDisableReason());
}

// Register file routes (Supabase-backed)
server.register(async app => filesRoutes(app));

// Register LLM routes
server.register(async app => llmRoutes(app));

// Register PSG protocol routes
server.register(async app => psgRoutes(app));

// Register bounded agent routes
server.register(async app => agentRoutes(app));

// Register Stripe billing and webhook routes
server.register(async app => stripeRoutes(app));

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }
    server.log.error(error);
    process.exit(1);
  }
};

start();
