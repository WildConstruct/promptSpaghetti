import { z } from 'zod';
import type { Graph, PSGFile } from '../types/graph';

const GraphNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().optional(),
  data: z.record(z.unknown()).optional()
});

const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  data: z.record(z.unknown()).optional()
});

const GraphSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  layout: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional()
});

const PSGFileSchema = z.object({
  version: z.string(),
  kind: z.literal('graph'),
  meta: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    author: z
      .object({ id: z.string().optional(), name: z.string().optional() })
      .optional()
  }),
  graph: GraphSchema as unknown as z.ZodType<Graph>,
  extras: z
    .object({
      previewUrl: z.string().url().optional(),
      thumbSeed: z.string().optional()
    })
    .catchall(z.unknown())
    .optional()
});

export function readPsg(text: string): PSGFile {
  const json = JSON.parse(text);
  const parsed = PSGFileSchema.parse(json);
  return parsed as unknown as PSGFile;
}

export function writePsg(psg: PSGFile): string {
  PSGFileSchema.parse(psg as unknown as z.infer<typeof PSGFileSchema>);
  return JSON.stringify(psg, null, 2);
}

export function fromLegacyGraph(name: string, graph: Graph): PSGFile {
  const now = new Date().toISOString();
  const psg: PSGFile = {
    version: '1.0',
    kind: 'graph',
    meta: { id: cryptoRandomId(), name, createdAt: now, updatedAt: now },
    graph
  };
  PSGFileSchema.parse(psg as unknown as z.infer<typeof PSGFileSchema>);
  return psg;
}

function cryptoRandomId(): string {
  const c = (
    globalThis as unknown as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'psg_' + Math.random().toString(36).slice(2, 10);
}
