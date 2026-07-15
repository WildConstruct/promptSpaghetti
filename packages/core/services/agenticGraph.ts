import { z } from 'zod';
import type { PSGFile } from '../types/graph';

export const DraftGraphFromPromptRequestSchema = z.object({
  prompt: z.string().min(1),
  mode: z.enum(['draft', 'expand-existing']).default('draft'),
  targetDocument: z.custom<PSGFile>().optional(),
  selection: z
    .object({
      nodeIds: z.array(z.string()).default([]),
      edgeIds: z.array(z.string()).default([])
    })
    .optional(),
  options: z
    .object({
      preserveVariables: z.boolean().default(true),
      autoConnect: z.boolean().default(true),
      maxNewNodes: z.number().int().positive().max(100).default(24)
    })
    .optional()
});

export const DraftGraphOperationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('insertNodes'),
    nodes: z.array(z.record(z.unknown())),
    edges: z.array(z.record(z.unknown())).default([])
  }),
  z.object({
    kind: z.literal('replaceDocument'),
    document: z.custom<PSGFile>()
  }),
  z.object({
    kind: z.literal('patchDocument'),
    patch: z.record(z.unknown())
  }),
  z.object({
    kind: z.literal('warning'),
    message: z.string()
  })
]);

/**
 * Additive slot analysis for fragment dissection / swap review.
 * Optional on responses so older clients ignore it safely.
 */
export const DraftSlotAnalysisSchema = z.object({
  id: z.string().min(1),
  sourceText: z.string(),
  startIndex: z.number().int().nonnegative().optional(),
  endIndex: z.number().int().nonnegative().optional(),
  slotType: z.enum([
    'subject',
    'appearance',
    'action',
    'setting',
    'composition',
    'camera',
    'lighting',
    'style-medium',
    'mood',
    'constraint',
    'unknown'
  ]),
  domainHints: z
    .array(
      z.enum([
        'character',
        'creature',
        'vehicle',
        'building',
        'environment',
        'crowd',
        'object',
        'abstract'
      ])
    )
    .default([]),
  toneHints: z.array(z.string()).default([]),
  classificationConfidence: z.number().min(0).max(1),
  segmentKind: z.enum(['text', 'choice', 'variable']).optional()
});

export const DraftGraphFromPromptResponseSchema = z.object({
  ok: z.boolean(),
  summary: z.string(),
  operations: z.array(DraftGraphOperationSchema),
  notes: z.array(z.string()).default([]),
  model: z.string().optional(),
  fallback: z.boolean().default(false),
  /** Optional semantic slots for review-first fragment swap (additive). */
  slots: z.array(DraftSlotAnalysisSchema).optional()
});

export type DraftGraphFromPromptRequest = z.infer<
  typeof DraftGraphFromPromptRequestSchema
>;
export type DraftGraphOperation = z.infer<typeof DraftGraphOperationSchema>;
export type DraftGraphFromPromptResponse = z.infer<
  typeof DraftGraphFromPromptResponseSchema
>;
export type DraftSlotAnalysis = z.infer<typeof DraftSlotAnalysisSchema>;
