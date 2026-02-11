import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const LLMWrappedRequestSchema = z.object({
  config: z.record(z.unknown()).optional(),
  request: z.record(z.unknown())
});

const LLMParseBodySchema = z.object({
  prompt: z.string().min(1),
  mode: z.string().optional()
});

type NormalizedLLMRequest = {
  config?: Record<string, unknown>;
  request: Record<string, unknown>;
};

function normalizeLLMRequest(
  body: unknown,
  options: { allowParseBody?: boolean } = {}
): NormalizedLLMRequest | null {
  const wrapped = LLMWrappedRequestSchema.safeParse(body);
  if (wrapped.success) {
    if (!wrapped.data.request) {
      return null;
    }
    return {
      config: wrapped.data.config,
      request: wrapped.data.request
    };
  }

  if (options.allowParseBody) {
    const parseBody = LLMParseBodySchema.safeParse(body);
    if (parseBody.success) {
      return {
        request: {
          prompt: parseBody.data.prompt,
          mode: parseBody.data.mode ?? 'standard'
        }
      };
    }
  }

  return null;
}

async function registerAliases(
  app: FastifyInstance,
  paths: string[],
  handler: any
) {
  for (const path of paths) {
    app.post(path, handler as any);
  }
}

export async function llmRoutes(app: FastifyInstance) {
  await registerAliases(
    app,
    ['/api/llm/complete', '/api/llm-complete'],
    async (req, reply) => {
      const parsed = normalizeLLMRequest(req.body);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid request' });
      }

      // TODO: Wire to real LLMService. For demo, return stubbed response.
      return reply.send({
        content: '[demo] LLM response placeholder',
        model: 'stub',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        echo: parsed.request
      });
    }
  );

  await registerAliases(
    app,
    ['/api/ai/parse', '/api/llm/parse', '/api/ai-parse', '/api/llm-parse'],
    async (req, reply) => {
      const parsed = normalizeLLMRequest(req.body, { allowParseBody: true });
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid request' });
      }

      // Delegate to complete endpoint contract
      return reply.send({
        content: '[demo] LLM parse response placeholder',
        model: 'stub',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        echo: parsed.request
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/suggest', '/api/llm-suggest'],
    async (_req, reply) => {
      return reply.send({
        suggestions: ['Alpha', 'Beta', 'Gamma'],
        model: 'stub'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/metadata', '/api/llm-metadata'],
    async (_req, reply) => {
      return reply.send({ metadata: { provider: 'stub', available: true } });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/refine', '/api/llm-refine'],
    async (_req, reply) => {
      return reply.send({ refined: true, model: 'stub' });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/optimize', '/api/llm-optimize'],
    async (_req, reply) => {
      return reply.send({ optimized: true, model: 'stub' });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/populate', '/api/llm-populate'],
    async (_req, reply) => {
      return reply.send({
        choices: [
          { text: 'Option A', weight: 5 },
          { text: 'Option B', weight: 5 }
        ],
        model: 'stub'
      });
    }
  );
}
