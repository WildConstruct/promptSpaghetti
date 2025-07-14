// packages/core/graphSchema.ts
// Shared Zod schema for a graph JSON used by both UI and executor.
// Nodes are stored in an object keyed by node id for O(1) lookup.

import { z } from 'zod';

export const NodeTypeEnum = z.enum([
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable',
]);

export const BaseNode = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  inputs: z.array(z.string()).optional(), // ids of upstream nodes (ordered)
});

export const WeightedChoiceNodeSchema = BaseNode.extend({
  type: z.literal('WeightedChoice'),
  choices: z.array(
    z.object({ value: z.string(), weight: z.number().positive() })
  ),
});

export const ConcatNodeSchema = BaseNode.extend({
  type: z.literal('Concat'),
});

export const OutputNodeSchema = BaseNode.extend({
  type: z.literal('Output'),
});

export const IncludeNodeSchema = BaseNode.extend({
  type: z.literal('Include'),
  name: z.string(),
});

export const SetVariableNodeSchema = BaseNode.extend({
  type: z.literal('SetVariable'),
  key: z.string(),
  value: z.any(),
});

export const GetVariableNodeSchema = BaseNode.extend({
  type: z.literal('GetVariable'),
  key: z.string(),
});

export const AnyNodeSchema = z.discriminatedUnion('type', [
  WeightedChoiceNodeSchema,
  ConcatNodeSchema,
  OutputNodeSchema,
  IncludeNodeSchema,
  SetVariableNodeSchema,
  GetVariableNodeSchema,
]);

export const GraphSchema = z.object({
  nodes: z.array(AnyNodeSchema),
  seed: z.union([z.string(), z.number()]).optional(),
});

export type Graph = z.infer<typeof GraphSchema>;
export type Node = z.infer<typeof AnyNodeSchema>;
