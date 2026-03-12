import { timingSafeEqual } from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getConfiguredAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!password || password === 'admin123') {
    return null;
  }

  return password;
}

export function isAdminSurfaceEnabled(): boolean {
  return process.env.ENABLE_ADMIN === 'true' && !!getConfiguredAdminPassword();
}

export function getAdminDisableReason(): string {
  if (process.env.ENABLE_ADMIN !== 'true') {
    return 'ENABLE_ADMIN must be set to true to mount admin surfaces';
  }

  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return 'ADMIN_PASSWORD must be configured to mount admin surfaces';
  }

  if (process.env.ADMIN_PASSWORD.trim() === 'admin123') {
    return 'Default admin password fallback is disabled';
  }

  return 'Admin surfaces are disabled';
}

export function requireAdminAuth(
  request: FastifyRequest,
  reply: FastifyReply
): boolean {
  const adminPassword = getConfiguredAdminPassword();

  if (!adminPassword || process.env.ENABLE_ADMIN !== 'true') {
    reply.status(404).send({ error: 'Not found' });
    return false;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader) {
    reply.header('WWW-Authenticate', 'Basic realm="Admin Panel"');
    reply.status(401).send({ error: 'Authentication required' });
    return false;
  }

  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Basic' || !credentials) {
    reply.status(401).send({ error: 'Invalid authentication type' });
    return false;
  }

  let username = '';
  let password = '';

  try {
    [username, password] = Buffer.from(credentials, 'base64')
      .toString()
      .split(':');
  } catch {
    reply.status(401).send({ error: 'Invalid credentials' });
    return false;
  }

  if (!safeEqual(username || '', 'admin') || !safeEqual(password || '', adminPassword)) {
    reply.status(401).send({ error: 'Invalid credentials' });
    return false;
  }

  return true;
}
