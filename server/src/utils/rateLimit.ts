import { FastifyReply, FastifyRequest } from 'fastify';

type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export function rateLimiter({
  key = 'global',
  limitPerMinute = 60
}: { key?: string; limitPerMinute?: number } = {}) {
  return function preHandler(
    req: FastifyRequest,
    reply: FastifyReply,
    done: (err?: Error) => void
  ) {
    try {
      const now = Date.now();
      const ip = (req as any).ip || 'unknown';
      const id = `${key}:${ip}`;
      const bucket = buckets.get(id) || { tokens: limitPerMinute, last: now };
      const elapsed = now - bucket.last;
      const refill = (elapsed / 60000) * limitPerMinute;
      bucket.tokens = Math.min(limitPerMinute, bucket.tokens + refill);
      bucket.last = now;
      if (bucket.tokens < 1) {
        reply.header('Retry-After', '10');
        reply.code(429).send({ error: 'Rate limit exceeded' });
        return;
      }
      bucket.tokens -= 1;
      buckets.set(id, bucket);
      done();
    } catch (e) {
      done();
    }
  };
}
