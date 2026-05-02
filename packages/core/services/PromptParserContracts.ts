import { z } from 'zod';
import type { Edge, Node } from 'reactflow';

export interface ParserOptions {
  mode: 'standard' | 'llm-enhanced';
  preserveVariables: boolean;
  autoConnect: boolean;
  allowInferredVariables?: boolean;
}

export type ParseMetadata = {
  parserMode?: string;
  fallbackReason?: string;
  parseTime?: number;
  cacheHit?: boolean;
  segmentCount?: number;
} & Record<string, unknown>;

export interface ParseResult {
  nodes: Node[];
  edges: Edge[];
  metadata: ParseMetadata;
}

const LLMResponseNodeSchema = z.object({
  type: z.enum(['Variable', 'WeightedChoice', 'TextBlock', 'Sequential']),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  variables: z.array(z.string()).optional()
});

const LLMResponseEdgeSchema = z.object({
  source: z.number(),
  target: z.number(),
  label: z.string().optional()
});

export const LLMResponseSchema = z
  .object({
    version: z.literal('psg-parse-v1'),
    nodes: z.array(LLMResponseNodeSchema),
    edges: z.array(LLMResponseEdgeSchema)
  })
  .passthrough();

export const LLMResponseSchemaStrict = z
  .object({
    version: z.literal('psg-parse-v1'),
    nodes: z.array(LLMResponseNodeSchema),
    edges: z.array(LLMResponseEdgeSchema)
  })
  .strict();

export type LLMParseResponse = z.infer<typeof LLMResponseSchema>;
