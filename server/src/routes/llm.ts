import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const LLMWrappedRequestSchema = z.object({
  config: z.record(z.unknown()).optional(),
  request: z.record(z.unknown())
});

const LLMDirectRequestSchema = z.record(z.unknown());

const LLMParseBodySchema = z.object({
  prompt: z.string().min(1),
  mode: z.string().optional()
});

type NormalizedLLMRequest = {
  config?: Record<string, unknown>;
  request: Record<string, unknown>;
};

const PopulateRequestSchema = z.object({
  nodeText: z.string().min(1),
  context: z.string().optional(),
  count: z.number().int().min(1).max(10).optional()
});

const OptimizeRequestSchema = z.object({
  choices: z
    .array(
      z.object({
        text: z.string().min(1),
        weight: z.number().optional()
      })
    )
    .min(1),
  context: z.string().optional(),
  preference: z.string().optional()
});

const SuggestRequestSchema = z.object({
  operation: z.string().optional(),
  context: z.string().optional()
});

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
): Array<{ theme: string; choices: WeightedChoice[] }> {
  const lower = context.toLowerCase();
  const themes = [
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

  const direct = LLMDirectRequestSchema.safeParse(body);
  if (direct.success) {
    const { config, ...request } = direct.data;
    return {
      config:
        config && typeof config === 'object' && !Array.isArray(config)
          ? (config as Record<string, unknown>)
          : undefined,
      request
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
    async (req, reply) => {
      const parsed = normalizeLLMRequest(req.body);
      const request = parsed?.request ?? {};
      const suggest = SuggestRequestSchema.safeParse(request);

      if (suggest.success && suggest.data.operation === 'inspiration') {
        return reply.send({
          suggestions: buildHeuristicInspiration(suggest.data.context ?? ''),
          model: 'heuristic-inspiration-v1'
        });
      }

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
    async (req, reply) => {
      const parsed = normalizeLLMRequest(req.body);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid request' });
      }

      const optimize = OptimizeRequestSchema.safeParse(parsed.request);
      if (!optimize.success) {
        return reply.status(400).send({ error: 'Invalid optimize request' });
      }

      return reply.send({
        choices: optimizeHeuristicChoices(
          optimize.data.choices.map(choice => ({
            text: choice.text,
            weight: choice.weight ?? 5
          })),
          optimize.data.preference ?? 'balanced variety'
        ),
        model: 'heuristic-optimize-v1'
      });
    }
  );

  await registerAliases(
    app,
    ['/api/llm/populate', '/api/llm-populate'],
    async (req, reply) => {
      const parsed = normalizeLLMRequest(req.body);
      if (!parsed) {
        return reply.status(400).send({ error: 'Invalid request' });
      }

      const populate = PopulateRequestSchema.safeParse(parsed.request);
      if (!populate.success) {
        return reply.status(400).send({ error: 'Invalid populate request' });
      }

      return reply.send({
        choices: buildHeuristicChoices(
          populate.data.nodeText,
          populate.data.context ?? '',
          populate.data.count ?? 5
        ),
        model: 'heuristic-populate-v1'
      });
    }
  );
}
