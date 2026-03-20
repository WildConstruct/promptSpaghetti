import { z } from 'zod';
import { segmentPrompt } from '../../../packages/core/runtime/prompting/PromptSegmentation';
import type {
  DraftGraphFromPromptRequest,
  DraftGraphFromPromptResponse
} from '../../../packages/core/services/agenticGraph';
import { LLMService } from './LLMService';

type DraftNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

type DraftEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: string;
};

const AgentDraftSegmentSchema = z
  .object({
    kind: z.enum(['text', 'choice', 'variable']),
    text: z.string().min(1).max(600),
    variableName: z.string().min(1).max(64).optional(),
    options: z.array(z.string().min(1).max(200)).max(8).optional()
  })
  .superRefine((segment, ctx) => {
    if (segment.kind === 'choice' && (!segment.options || segment.options.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choice segments require at least two options.'
      });
    }

    if (segment.kind === 'variable' && !segment.variableName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Variable segments require a variableName.'
      });
    }
  });

const AgentDraftPlanSchema = z.object({
  summary: z.string().min(1).max(240),
  notes: z.array(z.string().min(1).max(240)).max(8).default([]),
  segments: z.array(AgentDraftSegmentSchema).min(1).max(24)
});

type AgentDraftPlan = z.infer<typeof AgentDraftPlanSchema>;

function sanitizeIdentifier(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function createDraftGraphFromSegments(segments: AgentDraftPlan['segments']): {
  nodes: DraftNode[];
  edges: DraftEdge[];
} {
  const spacingX = 320;
  const spacingY = 180;
  const nodesPerRow = 3;

  const nodes: DraftNode[] = segments.map((segment, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    const position = {
      x: 160 + col * spacingX,
      y: 140 + row * spacingY
    };

    if (segment.kind === 'choice') {
      const options = (segment.options ?? []).map((text, optionIndex, array) => ({
        id: `option-${index}-${optionIndex}`,
        text,
        weight: Math.max(1, Math.floor(100 / Math.max(array.length, 1))),
        hasBranch: true
      }));

      return {
        id: `draft-choice-${index}`,
        type: 'weightedChoice',
        position,
        data: {
          nodeType: 'weightedChoice',
          label: segment.text,
          promptText: segment.text,
          options
        }
      };
    }

    if (segment.kind === 'variable') {
      const variableName = sanitizeIdentifier(
        segment.variableName ?? segment.text,
        `variable-${index}`
      );

      return {
        id: `draft-variable-${index}`,
        type: 'variable',
        position,
        data: {
          nodeType: 'variable',
          label: variableName,
          variableName,
          value: segment.text
        }
      };
    }

    return {
      id: `draft-text-${index}`,
      type: 'textBlock',
      position,
      data: {
        nodeType: 'textBlock',
        label: segment.text,
        text: segment.text,
        content: segment.text,
        value: segment.text
      }
    };
  });

  const outputId = `draft-output-${nodes.length}`;
  nodes.push({
    id: outputId,
    type: 'output',
    position: {
      x: 160 + (nodes.length % nodesPerRow) * spacingX,
      y: 140 + Math.floor(nodes.length / nodesPerRow) * spacingY
    },
    data: {
      nodeType: 'output',
      label: 'Output',
      outputName: 'output'
    }
  });

  const edges: DraftEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const source = nodes[index];
    const target = nodes[index + 1];

    if (source.type === 'weightedChoice') {
      const options = Array.isArray(source.data.options)
        ? (source.data.options as Array<{ id: string }>)
        : [];
      options.forEach((option, optionIndex) => {
        edges.push({
          id: `${source.id}-${option.id}-${target.id}-${optionIndex}`,
          source: source.id,
          target: target.id,
          sourceHandle: `branch-${optionIndex}`,
          targetHandle: 'target',
          type: 'smoothstep'
        });
      });
      continue;
    }

    edges.push({
      id: `${source.id}-${target.id}`,
      source: source.id,
      target: target.id,
      sourceHandle: 'source',
      targetHandle: 'target',
      type: 'smoothstep'
    });
  }

  return { nodes, edges };
}

function createFallbackPlan(prompt: string): AgentDraftPlan {
  const segmented = segmentPrompt(prompt);
  const segments = segmented.segments.slice(0, 24).map(segment => ({
    kind: segment.kind,
    text: segment.text,
    options: segment.options,
    variableName: segment.variableName
  }));

  return {
    summary: `Created a deterministic draft from ${segments.length} prompt segments.`,
    notes: [
      `Segmented prompt into ${segmented.segments.length} draft segments.`,
      'Used heuristic segmentation fallback instead of a model-backed plan.'
    ],
    segments: segments.length > 0
      ? segments
      : [{ kind: 'text', text: prompt.trim() }]
  };
}

function buildDraftPrompt(
  request: DraftGraphFromPromptRequest,
  fallbackPlan: AgentDraftPlan
): string {
  const guidance = [
    'You are designing a PSG graph draft for a prompt-randomization editor.',
    'Return only JSON matching this shape:',
    '{"summary":"string","notes":["string"],"segments":[{"kind":"text|choice|variable","text":"string","variableName":"string?","options":["string"]?}]}',
    'Rules:',
    '- Prefer 3 to 12 segments unless the prompt is extremely short or long.',
    '- Use "choice" only when the prompt implies alternatives or branches.',
    '- Use "variable" for placeholders, assignments, or reusable slots.',
    '- Keep segment text concise and editor-friendly.',
    '- Do not invent story content unrelated to the prompt.',
    '- Do not emit markdown or commentary outside the JSON object.'
  ];

  if (request.mode === 'expand-existing') {
    guidance.push(
      '- The user may be expanding an existing graph, so preserve the current prompt intent.'
    );
  }

  if (request.selection?.nodeIds?.length) {
    guidance.push(
      `- The current selection includes ${request.selection.nodeIds.length} node(s); bias additions toward that scope.`
    );
  }

  if (request.options?.maxNewNodes) {
    guidance.push(
      `- Hard cap new segments at ${Math.max(1, request.options.maxNewNodes - 1)} before the output node is added.`
    );
  }

  return [
    guidance.join('\n'),
    '',
    'Prompt to draft:',
    request.prompt,
    '',
    'Deterministic baseline for reference:',
    JSON.stringify(fallbackPlan)
  ].join('\n');
}

function parseJsonObject(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Model returned an empty response.');
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object.');
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

export class AgentDraftService {
  private llm: LLMService;

  constructor(llm: LLMService = new LLMService()) {
    this.llm = llm;
  }

  async draftGraphFromPrompt(
    request: DraftGraphFromPromptRequest
  ): Promise<DraftGraphFromPromptResponse> {
    const fallbackPlan = createFallbackPlan(request.prompt);

    if (!this.llm.available()) {
      return this.createFallbackResponse(fallbackPlan, {
        model: 'heuristic-segmentation-v1',
        note: 'Model-backed drafting unavailable: missing API key.'
      });
    }

    try {
      const completion = await this.llm.complete({
        prompt: buildDraftPrompt(request, fallbackPlan),
        imageUrl: request.imageUrl,
        systemPrompt:
          'You generate structured PSG graph draft plans. Output valid JSON only.',
        model: process.env.OPENAI_AGENT_DRAFT_MODEL || process.env.OPENAI_DEFAULT_MODEL,
        temperature: 0.2,
        maxTokens: 900,
        responseFormat: 'json_object'
      });

      const raw = parseJsonObject(completion.content);
      const plan = AgentDraftPlanSchema.parse(raw);
      const limitedPlan = {
        ...plan,
        segments: plan.segments.slice(0, request.options?.maxNewNodes ?? 24)
      };
      const draftGraph = createDraftGraphFromSegments(limitedPlan.segments);

      return {
        ok: true,
        summary: limitedPlan.summary,
        operations: [
          {
            kind: 'insertNodes',
            nodes: draftGraph.nodes,
            edges: draftGraph.edges
          }
        ],
        notes: limitedPlan.notes,
        model: completion.model,
        fallback: false
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown model drafting error';

      return this.createFallbackResponse(fallbackPlan, {
        model: 'heuristic-segmentation-v1',
        note: `Model-backed draft failed: ${message}`
      });
    }
  }

  private createFallbackResponse(
    plan: AgentDraftPlan,
    options: { model: string; note: string }
  ): DraftGraphFromPromptResponse {
    const draftGraph = createDraftGraphFromSegments(plan.segments);

    return {
      ok: true,
      summary: plan.summary,
      operations: [
        {
          kind: 'insertNodes',
          nodes: draftGraph.nodes,
          edges: draftGraph.edges
        }
      ],
      notes: [...plan.notes, options.note],
      model: options.model,
      fallback: true
    };
  }
}
