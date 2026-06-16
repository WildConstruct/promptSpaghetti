// packages/core/graphSchema.ts
// Shared Zod schema for a graph JSON used by both UI and executor.
// Nodes are stored in an object keyed by node id for O(1) lookup.
import { z } from 'zod';
import { SecurityValidation } from './validation/security';

export const NodeTypeEnum = z.enum([
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable'
]);

export const BaseNode = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  inputs: z.array(z.string()).optional(), // ids of upstream nodes (ordered)
  // Epic 8.2 Template Support
  template: z.string().optional(), // Template with {variable} syntax
  extractedVariables: z.array(z.object({
    name: z.string(),
    placeholder: z.string(),
    startIndex: z.number(),
    endIndex: z.number(),
    isValid: z.boolean(),
    inferredType: z.enum(['string', 'number', 'boolean', 'array', 'object', 'auto']).optional(),
    defaultValue: z.string().optional()
  })).optional()
});

export const WeightedChoiceNodeSchema = BaseNode.extend({
  type: z.literal('WeightedChoice'),
  choices: z.array(
    z.object({ value: z.string(), weight: z.number().positive() })
  )
});

export const ConcatNodeSchema = BaseNode.extend({
  type: z.literal('Concat')
});

export const OutputNodeSchema = BaseNode.extend({
  type: z.literal('Output')
});

export const IncludeNodeSchema = BaseNode.extend({
  type: z.literal('Include'),
  name: SecurityValidation.safePropertyKey()
});

export const SetVariableNodeSchema = BaseNode.extend({
  type: z.literal('SetVariable'),
  key: SecurityValidation.variableName(),
  value: SecurityValidation.safeValue()
});

export const GetVariableNodeSchema = BaseNode.extend({
  type: z.literal('GetVariable'),
  key: SecurityValidation.variableName()
});

// NOTE: The Epic 7 advanced tier (WeightedAdvanced/Conditional/Sequential/Markov) and the Epic 8
// PythonTransform node were retired from the product schema surface — they were never registered,
// never executed by either engine, and read as ML "circuit diagram" plumbing (Compact Principle II).
// Their implementations remain parked under runtime/ for potential future use; see
// docs/engine-unification-design.md.

export const AnyNodeSchema = z.discriminatedUnion('type', [
  WeightedChoiceNodeSchema,
  ConcatNodeSchema,
  OutputNodeSchema,
  IncludeNodeSchema,
  SetVariableNodeSchema,
  GetVariableNodeSchema
]);

export const GraphSchema = z.object({
  nodes: z.array(AnyNodeSchema),
  seed: z.union([z.string(), z.number()]).optional()
});

export type Graph = z.infer<typeof GraphSchema>;
export type Node = z.infer<typeof AnyNodeSchema>;
