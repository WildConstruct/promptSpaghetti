import { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { z, type ZodTypeAny } from 'zod';
import { LLMService, type LLMRuntimeStatus } from '../services/LLMService';
import { requireRouteAccess } from '../utils/routeAccess';
import { rateLimiter } from '../utils/rateLimit';
import {
  LLM_CAPABILITIES,
  type LLMStatusContract
} from '../../../packages/core/services/llm/contracts';

const MAX_PROMPT_LENGTH = 12000;
const MAX_CONTEXT_LENGTH = 8000;
const MAX_TEXT_LENGTH = 12000;

type LLMStatusRouteResponse = LLMRuntimeStatus & LLMStatusContract;

const AllowedLLMConfigSchema = z
  .object({
    model: z.string().min(1).max(200).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().max(4096).optional()
  })
  .strict();

const ChoiceSchema = z
  .object({
    text: z.string().min(1).max(1000),
    weight: z.number().min(0).max(10).optional()
  })
  .strict();

const InspirationChoiceSchema = z
  .object({
    text: z.string().min(1).max(1000),
    weight: z.number().int().min(1).max(10)
  })
  .strict();

const InspirationSuggestionSchema = z
  .object({
    theme: z.string().min(1).max(200),
    choices: z.array(InspirationChoiceSchema).max(10)
  })
  .strict();

const CompleteRequestSchema = z
  .object({
    prompt: z.string().min(1).max(MAX_PROMPT_LENGTH),
    systemPrompt: z.string().min(1).max(MAX_PROMPT_LENGTH).optional(),
    model: z.string().min(1).max(200).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().max(4096).optional()
  })
  .strict();

const ParseRequestSchema = z
  .object({
    prompt: z.string().min(1).max(MAX_PROMPT_LENGTH),
    mode: z.enum(['standard', 'metadata', 'graph']).optional()
  })
  .strict();

const SuggestRequestSchema = z
  .object({
    operation: z.literal('inspiration'),
    context: z.string().max(MAX_CONTEXT_LENGTH).optional()
  })
  .strict();

const MetadataRequestSchema = z
  .object({
    text: z.string().min(1).max(MAX_TEXT_LENGTH).optional(),
    content: z
      .union([z.string().min(1).max(MAX_TEXT_LENGTH), z.record(z.unknown())])
      .optional(),
    context: z.string().max(MAX_CONTEXT_LENGTH).optional()
  })
  .strict()
  .refine(
    value =>
      typeof value.text === 'string' || typeof value.content !== 'undefined',
    { message: 'Metadata request requires text or content' }
  );

const RefineRequestSchema = z
  .object({
    text: z.string().min(1).max(MAX_TEXT_LENGTH),
    instruction: z.string().min(1).max(1000).optional(),
    mode: z.string().min(1).max(100).optional(),
    prompt: z.string().min(1).max(1000).optional()
  })
  .strict();

const AnalyzeRequestSchema = z
  .object({
    graph: z.record(z.unknown()),
    prompt: z.string().min(1).max(MAX_PROMPT_LENGTH).optional()
  })
  .strict();

const PopulateRequestSchema = z
  .object({
    nodeText: z.string().min(1).max(MAX_TEXT_LENGTH),
    context: z.string().max(MAX_CONTEXT_LENGTH).optional(),
    count: z.number().int().min(1).max(10).optional()
  })
  .strict();

const OptimizeRequestSchema = z
  .object({
    choices: z.array(ChoiceSchema).min(1).max(10),
    context: z.string().max(MAX_CONTEXT_LENGTH).optional(),
    preference: z.string().max(1000).optional()
  })
  .strict();

type WeightedChoice = {
  text: string;
  weight: number;
};

function normalizeTextKey(value: string): string {
  return value.trim().toLowerCase();
}

function extractTemplateVariables(text: string): string[] {
  return Array.from(new Set(text.match(/\{[^}]+\}/g) ?? []));
}

function preserveTemplateVariables(source: string, generated: string): string {
  const variables = extractTemplateVariables(source);
  if (variables.length === 0) {
    return generated.trim();
  }

  let result = generated.trim();
  for (const variable of variables) {
    if (!result.includes(variable)) {
      result = `${variable} ${result}`.trim();
    }
  }

  return result;
}

function dedupeChoices(
  source: string,
  choices: WeightedChoice[]
): WeightedChoice[] {
  const seen = new Set<string>();

  return choices.filter(choice => {
    const text = preserveTemplateVariables(source, choice.text);
    const key = normalizeTextKey(text);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    choice.text = text;
    return true;
  });
}

function buildHeuristicChoices(
  nodeText: string,
  context: string,
  count: number
): WeightedChoice[] {
  const categoryText = `${nodeText} ${context}`.toLowerCase();
  const pools: Record<string, WeightedChoice[]> = {
    action: [
      { text: 'running frantically', weight: 8 },
      { text: 'diving for cover', weight: 7 },
      { text: 'stumbling backwards', weight: 6 },
      { text: 'scrambling away', weight: 6 },
      { text: 'holding position', weight: 4 }
    ],
    emotion: [
      { text: 'terrified', weight: 8 },
      { text: 'shocked', weight: 7 },
      { text: 'defiant', weight: 5 },
      { text: 'uncertain', weight: 5 },
      { text: 'stunned', weight: 6 }
    ],
    environment: [
      { text: 'debris-filled streets', weight: 7 },
      { text: 'smoke-filled air', weight: 7 },
      { text: 'flickering neon reflections', weight: 6 },
      { text: 'abandoned structures', weight: 5 },
      { text: 'crowded alleyways', weight: 5 }
    ],
    time: [
      { text: 'at dawn', weight: 6 },
      { text: 'at dusk', weight: 7 },
      { text: 'during golden hour', weight: 6 },
      { text: 'in the dead of night', weight: 8 },
      { text: 'under harsh midday sun', weight: 4 }
    ],
    weather: [
      { text: 'heavy rain', weight: 7 },
      { text: 'thick fog', weight: 6 },
      { text: 'swirling dust', weight: 6 },
      { text: 'clear skies', weight: 4 },
      { text: 'stormfront rolling in', weight: 7 }
    ]
  };

  let category: keyof typeof pools = 'action';
  if (/(emotion|feeling|mood|reaction)/.test(categoryText)) {
    category = 'emotion';
  } else if (
    /(scene|setting|place|location|city|alley|room)/.test(categoryText)
  ) {
    category = 'environment';
  } else if (/(time|dawn|dusk|night|day|hour)/.test(categoryText)) {
    category = 'time';
  } else if (/(weather|rain|storm|fog|sky|snow|wind)/.test(categoryText)) {
    category = 'weather';
  }

  return dedupeChoices(nodeText, pools[category]).slice(0, count);
}

function optimizeHeuristicChoices(
  choices: WeightedChoice[],
  preference: string
): WeightedChoice[] {
  const normalizedPreference = preference.toLowerCase();
  const base = choices.map(choice => ({
    text: choice.text,
    weight: Math.max(1, Math.min(10, Math.round(choice.weight || 5)))
  }));

  if (normalizedPreference.includes('balanced')) {
    return base.map(choice => ({ ...choice, weight: 5 }));
  }

  if (normalizedPreference.includes('favor first')) {
    return base.map((choice, index) => ({
      ...choice,
      weight: Math.max(1, 9 - index * 2)
    }));
  }

  return base;
}

function buildHeuristicInspiration(
  context: string
): Array<z.infer<typeof InspirationSuggestionSchema>> {
  const lower = context.toLowerCase();
  const themes: Array<z.infer<typeof InspirationSuggestionSchema>> = [
    {
      theme: 'Character Reactions',
      choices: [
        { text: 'panic and flee', weight: 8 },
        { text: 'freeze in shock', weight: 6 },
        { text: 'seek cover', weight: 7 },
        { text: 'help others', weight: 5 }
      ]
    },
    {
      theme: 'Environmental Details',
      choices: [
        { text: 'debris flying', weight: 7 },
        { text: 'dust clouds', weight: 6 },
        { text: 'sirens wailing', weight: 8 },
        { text: 'glass shattering', weight: 7 }
      ]
    },
    {
      theme: 'Time Variations',
      choices: [
        { text: 'dawn breaking', weight: 6 },
        { text: 'high noon', weight: 4 },
        { text: 'twilight hour', weight: 7 },
        { text: 'dead of night', weight: 8 }
      ]
    }
  ];

  if (lower.includes('romance')) {
    themes.push({
      theme: 'Emotional Beats',
      choices: [
        { text: 'shared knowing glance', weight: 7 },
        { text: 'hesitant confession', weight: 6 },
        { text: 'nervous laughter', weight: 5 },
        { text: 'hands brush gently', weight: 6 }
      ]
    });
  }

  return themes;
}

function parseEndpointRequest<TSchema extends ZodTypeAny>(
  body: unknown,
  schema: TSchema
): z.infer<TSchema> | null {
  const direct = schema.safeParse(body);
  if (direct.success) {
    return direct.data;
  }

  const wrapped = z
    .object({
      config: AllowedLLMConfigSchema.optional(),
      request: schema
    })
    .strict()
    .safeParse(body);

  if (wrapped.success) {
    return wrapped.data.request;
  }

  return null;
}

async function registerAliases(
  app: FastifyInstance,
  paths: string[],
  options: Record<string, unknown>,
  handler: RouteHandlerMethod
) {
  for (const path of paths) {
    app.post(path, options, handler);
  }
}

export async function llmRoutes(app: FastifyInstance) {
  const llm = new LLMService();
  const protectedLlmRouteOptions = {
    preHandler: [
      requireRouteAccess({
        access: 'authenticated-user',
        capability: 'cloud-llm',
        quotaBucket: 'cloud-llm'
      }),
      rateLimiter({
        key: 'llm:route',
        limitPerMinute: Number(process.env.LLM_RATE_LIMIT_PER_MINUTE || 60)
      })
    ]
  };

  app.get('/api/llm/status', async () => {
    const response: LLMStatusRouteResponse = {
      ...llm.getStatus(),
      capabilities: [...LLM_CAPABILITIES]
    };

    return response;
  });

  await registerAliases(
    app,
    ['/api/llm/complete', '/api/llm-complete'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, CompleteRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid complete request' });
      }

      return reply.send({
        content: '[demo] LLM response placeholder',
        model: parsed.model ?? 'stub',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }
      });
    }
  );

  await registerAliases(
    app,
    ['/api/ai/parse', '/api/llm/parse', '/api/ai-parse', '/api/llm-parse'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, ParseRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid parse request' });
      }

      return reply.send({
        result: `[demo] Parsed (${parsed.mode ?? 'standard'})`,
        model: 'stub'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/suggest', '/api/llm-suggest'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, SuggestRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid suggest request' });
      }

      return reply.send({
        suggestions: buildHeuristicInspiration(parsed.context ?? ''),
        model: 'heuristic-inspiration-v1'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/metadata', '/api/llm-metadata'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, MetadataRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid metadata request' });
      }

      const subject =
        typeof parsed.text === 'string'
          ? parsed.text
          : typeof parsed.content === 'string'
            ? parsed.content
            : 'structured-content';

      return reply.send({
        metadata: {
          provider: 'stub',
          available: true,
          subject
        },
        model: 'stub'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/refine', '/api/llm-refine'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, RefineRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid refine request' });
      }

      return reply.send({
        refinedText: parsed.text,
        model: 'stub'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/analyze', '/api/llm-analyze'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, AnalyzeRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid analyze request' });
      }

      return reply.send({
        analysis: {
          nodeCount: Array.isArray(parsed.graph.nodes)
            ? parsed.graph.nodes.length
            : 0,
          edgeCount: Array.isArray(parsed.graph.edges)
            ? parsed.graph.edges.length
            : 0,
          prompt: parsed.prompt ?? null
        },
        model: 'stub'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/optimize', '/api/llm-optimize'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, OptimizeRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid optimize request' });
      }

      return reply.send({
        choices: optimizeHeuristicChoices(
          parsed.choices.map(choice => ({
            text: choice.text,
            weight: choice.weight ?? 5
          })),
          parsed.preference ?? 'balanced variety'
        ),
        model: 'heuristic-optimize-v1'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/populate', '/api/llm-populate'],
    protectedLlmRouteOptions,
    async (req, reply) => {
      const parsed = parseEndpointRequest(req.body, PopulateRequestSchema);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid populate request' });
      }

      return reply.send({
        choices: buildHeuristicChoices(
          parsed.nodeText,
          parsed.context ?? '',
          parsed.count ?? 5
        ),
        model: 'heuristic-populate-v1'
      });
    }
  );
}
