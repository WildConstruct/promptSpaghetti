import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const LLMRequestSchema = z.object({
  config: z.record(z.any()).optional(),
  request: z.record(z.any())
});

export async function llmRoutes(app: FastifyInstance) {
  app.post('/api/llm/complete', async (req, reply) => {
    const parsed = LLMRequestSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
    // TODO: Wire to real LLMService. For demo, return stubbed response.
    const { request } = parsed.data;
    return reply.send({
      content: '[demo] LLM response placeholder',
      model: 'stub',
      tokensIn: 0,
      tokensOut: 0,
      cost: 0,
      cached: false,
      echo: request
    });
  });

  // Legacy endpoint compatibility - delegates to complete
  app.post('/api/ai/parse', async (req, reply) => {
    const parsed = LLMRequestSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
    // Delegate to complete endpoint
    const { request } = parsed.data;
    return reply.send({
      content: '[demo] LLM parse response placeholder',
      model: 'stub',
      tokensIn: 0,
      tokensOut: 0,
      cost: 0,
      cached: false,
      echo: request
    });
  });

  // Legacy endpoint compatibility - delegates to complete
  app.post('/api/llm/parse', async (req, reply) => {
    const parsed = LLMRequestSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
    // Delegate to complete endpoint
    const { request } = parsed.data;
    return reply.send({
      content: '[demo] LLM parse response placeholder',
      model: 'stub',
      tokensIn: 0,
      tokensOut: 0,
      cost: 0,
      cached: false,
      echo: request
    });
  });

  app.post('/api/llm/suggest', async (_req, reply) => {
    return reply.send({
      suggestions: ['Alpha', 'Beta', 'Gamma'],
      model: 'stub'
    });
  });

  app.post('/api/llm/metadata', async (_req, reply) => {
    return reply.send({ metadata: { provider: 'stub', available: true } });
  });

  app.post('/api/llm/refine', async (_req, reply) => {
    return reply.send({ refined: true, model: 'stub' });
  });
}
