/**
 * Authentication middleware - Simple implementation for behavior analytics routes
 */

import { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  // Simple auth check - in production this would validate JWT tokens
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Authentication required' });
  }
  
  // Mock user for testing - in production this would decode JWT
  (request as any).user = {
    id: 'user123',
    roles: ['user'] // Could also be ['admin'] for admin users
  };
}