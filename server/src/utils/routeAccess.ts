import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  getSupabaseAuthContext,
  type SupabaseAuthContext
} from '../services/supabase';
import { requireAdminAuth } from './adminAuth';
import { consumeUserQuota } from './usageQuota';
import { parseBoolean } from '../../../packages/core/utils/env';

export type RouteAccessLevel =
  | 'public-demo'
  | 'authenticated-user'
  | 'privileged-internal';

export type RouteCapability =
  | 'cloud-llm'
  | 'cloud-agent'
  | 'cloud-psg'
  | 'admin';

declare module 'fastify' {
  interface FastifyRequest {
    authUserId?: string;
    authContext?: SupabaseAuthContext;
  }
}

function extractBearerToken(request: FastifyRequest): string | undefined {
  const authHeader = request.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return undefined;
  }

  return authHeader.slice(7);
}

function isCapabilityEnabled(capability: RouteCapability): boolean {
  switch (capability) {
    case 'cloud-llm':
      return process.env.ENABLE_CLOUD_LLM !== 'false';
    case 'cloud-agent':
      return process.env.ENABLE_CLOUD_AGENT !== 'false';
    case 'cloud-psg':
      return process.env.ENABLE_CLOUD_PSG !== 'false';
    case 'admin':
      return process.env.ENABLE_ADMIN === 'true';
    default:
      return false;
  }
}

function normalizeCapability(value: string): string {
  return value.trim().toLowerCase();
}

function userHasCapability(
  authContext: SupabaseAuthContext,
  capability: RouteCapability
): boolean {
  const capabilities = new Set(authContext.capabilities.map(normalizeCapability));
  const globalBypass = parseBoolean(
    process.env.ALLOW_ALL_AUTHENTICATED_CLOUD,
    false
  );

  if (capabilities.has('all') || capabilities.has('cloud')) {
    return true;
  }

  if (capabilities.has(normalizeCapability(capability))) {
    return true;
  }

  if (capability === 'admin') {
    return false;
  }

  if (globalBypass) {
    return true;
  }

  const requiresSubscription = parseBoolean(
    process.env[`REQUIRE_SUBSCRIPTION_FOR_${capability.replace(/-/g, '_').toUpperCase()}`],
    parseBoolean(process.env.REQUIRE_SUBSCRIPTION_FOR_CLOUD, true)
  );

  if (!requiresSubscription) {
    return true;
  }

  return authContext.subscriptionActive;
}

export function requireRouteAccess(options: {
  access: RouteAccessLevel;
  capability?: RouteCapability;
  quotaBucket?: 'cloud-llm' | 'cloud-agent' | 'cloud-psg' | 'files';
}) {
  return async function preHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    if (options.capability && !isCapabilityEnabled(options.capability)) {
      return reply.status(403).send({ error: 'Capability disabled' });
    }

    if (options.access === 'public-demo') {
      return;
    }

    if (options.access === 'privileged-internal') {
      if (!requireAdminAuth(request, reply)) {
        return;
      }
      return;
    }

    const token = extractBearerToken(request);
    const authContext = await getSupabaseAuthContext(token);
    if (!authContext) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    request.authUserId = authContext.userId;
    request.authContext = authContext;

    if (options.capability && !userHasCapability(authContext, options.capability)) {
      return reply.status(403).send({
        error: 'Capability not granted for this account',
        capability: options.capability,
        plan: authContext.plan,
        subscriptionState: authContext.subscriptionState
      });
    }

    if (options.quotaBucket) {
      const decision = consumeUserQuota({
        userId: authContext.userId,
        bucket: options.quotaBucket,
        plan: authContext.plan
      });

      if (!decision.allowed) {
        reply.header('Retry-After', Math.max(
          1,
          Math.ceil((new Date(decision.resetAt).getTime() - Date.now()) / 1000)
        ));
        return reply.status(429).send({
          error: 'Daily usage quota exceeded',
          quota: {
            bucket: options.quotaBucket,
            plan: decision.plan,
            limit: decision.limit,
            used: decision.used,
            remaining: decision.remaining,
            resetAt: decision.resetAt
          }
        });
      }
    }
  };
}
