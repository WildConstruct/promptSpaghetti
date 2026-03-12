/**
 * Minimal Authentication Server - For testing login functionality
 *
 * This is a simplified server that only includes authentication routes
 * to test the login system without the full application complexity.
 */

import Fastify from 'fastify';
import { authRoutes } from './auth/routes';
import { assertMockRuntimeAllowed } from './utils/mockRuntimeGuard';

assertMockRuntimeAllowed('minimal-auth-server');

const server = Fastify({
  logger: true,
  trustProxy: true
});

// Simple CORS handling
server.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return reply.send();
  }
});

// Register authentication routes
server.register(authRoutes, { prefix: '/api/auth' });

// Health check endpoint
server.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}));

// Root endpoint
server.get('/', async () => ({
  message: 'Minimal Auth Server Running',
  endpoints: ['/api/auth/*', '/api/health']
}));

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 Minimal Auth Server running on http://localhost:${port}`);
    console.log(
      `🔐 Authentication endpoints available at http://localhost:${port}/api/auth/*`
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    server.log.error(error);
    process.exit(1);
  }
};

start();
