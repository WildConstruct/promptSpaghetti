import { z } from 'zod';

// Base schema for all node types
const baseNodeSchema = z.object({
  label: z.string().default('Node'),
  id: z.string().default(''),
  variations: z.array(z.string()).default([]),
  description: z.string().default(''),
  tags: z.array(z.string()).default([]),
  category: z.string().default('general')
});

/**
 * UI-oriented schemas for product / format-adjacent node types.
 * Advanced Epic 7 schemas (WeightedAdvanced/Conditional/Sequential/Markov) and
 * Subject/Action ghosts were removed in C1 P1 — see docs/parked-tier-disposition.md
 * and docs/parked-implementations/README.md for design intent.
 *
 * Note: GraphSchema and Epic1 executable sets still diverge; see
 * docs/schema-epic1-vocabulary-inventory.md.
 */
export const nodeSchemas: Record<string, z.ZodTypeAny> = {
  WeightedChoice: baseNodeSchema.extend({
    type: z.literal('WeightedChoice').default('WeightedChoice'),
    choices: z
      .array(
        z.object({
          text: z.string(),
          weight: z.number().min(0).default(1),
          muted: z.boolean().default(false),
          solo: z.boolean().default(false)
        })
      )
      .default([{ text: 'choice', weight: 1, muted: false, solo: false }])
  }),

  Concat: baseNodeSchema.extend({
    type: z.literal('Concat').default('Concat'),
    separator: z.string().default(' '),
    inputs: z.array(z.string()).default([])
  }),

  Output: baseNodeSchema.extend({
    type: z.literal('Output').default('Output'),
    outputName: z.string().default('output')
  }),

  // Format-only (B4) — not on Epic1 canvas/engine. docs/include-node-decision.md
  Include: baseNodeSchema.extend({
    type: z.literal('Include').default('Include'),
    graphPath: z.string().default('')
  }),

  SetVariable: baseNodeSchema.extend({
    type: z.literal('SetVariable').default('SetVariable'),
    variableName: z.string().default('variable'),
    value: z.string().default('')
  }),

  GetVariable: baseNodeSchema.extend({
    type: z.literal('GetVariable').default('GetVariable'),
    variableName: z.string().default('variable'),
    fallback: z.string().default('')
  })
};

// Helper to get schema for a node type
export function getNodeSchema(nodeType: string): z.ZodTypeAny | undefined {
  return nodeSchemas[nodeType];
}

// Helper to validate node data
export function validateNodeData(nodeType: string, data: unknown): unknown {
  const schema = getNodeSchema(nodeType);
  if (!schema) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }
  return schema.parse(data);
}

// Export individual schemas for direct use
export const WeightedChoiceSchema = nodeSchemas.WeightedChoice;
export const ConcatSchema = nodeSchemas.Concat;
export const OutputSchema = nodeSchemas.Output;
export const IncludeSchema = nodeSchemas.Include;
export const SetVariableSchema = nodeSchemas.SetVariable;
export const GetVariableSchema = nodeSchemas.GetVariable;
