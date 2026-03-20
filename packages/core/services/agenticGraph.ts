import { z } from 'zod';
import type { PSGFile } from '../types/graph';

export const DraftGraphFromPromptRequestSchema = z.object({
  prompt: z.string().min(1),
  imageUrl: z.string().optional(),
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

export const DraftGraphFromPromptResponseSchema = z.object({
  ok: z.boolean(),
  summary: z.string(),
  operations: z.array(DraftGraphOperationSchema),
  notes: z.array(z.string()).default([]),
  model: z.string().optional(),
  fallback: z.boolean().default(false)
});

export type DraftGraphFromPromptRequest = z.infer<
  typeof DraftGraphFromPromptRequestSchema
>;
export type DraftGraphOperation = z.infer<typeof DraftGraphOperationSchema>;
export type DraftGraphFromPromptResponse = z.infer<
  typeof DraftGraphFromPromptResponseSchema
>;
