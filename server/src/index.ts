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
import { Sentry } from './sentry';
import { registerEnhancedAdminRoutes } from './admin-panel-enhanced';
import { filesRoutes } from './routes/files';
import { agentRoutes } from './routes/agent';
import { llmRoutes } from './routes/llm';
import { psgRoutes } from './routes/psg';
import { localImageRoutes } from './routes/localImage';
import { localFragmentRoutes } from './routes/localFragments';
import { themeRoutes } from './theme';
import { rateLimiter } from './utils/rateLimit';
import { metrics } from './utils/metrics';
import {
  getAdminDisableReason,
  isAdminSurfaceEnabled,
  requireAdminAuth
} from './utils/adminAuth';

// Load environment from root/server env files. Sandbox-specific files layer on
// top without replacing the standard `.env` flow.
try {
  const envFiles = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../.env.local-sandbox'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../.env.local-sandbox')
  ];

  envFiles.forEach((envFile, index) => {
    dotenv.config({
      path: envFile,
      override: index > 0
    });
  });
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

// Route exposure truth is cataloged in `routeSurfaceCatalog.ts`.
// Keep the mounted families below aligned with that contract and the route
// access policy docs.

// Register file routes (Supabase-backed)
server.register(async app => filesRoutes(app));

// Register LLM routes
server.register(async app => llmRoutes(app));

// Register PSG protocol routes
server.register(async app => psgRoutes(app));

// Register local-only sandbox image generation routes
server.register(async app => localImageRoutes(app));

// Register local-only user fragment persistence routes
server.register(async app => localFragmentRoutes(app));

// Register bounded agent routes
server.register(async app => agentRoutes(app));

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
