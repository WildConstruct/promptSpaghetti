import { z, ZodError } from 'zod';
import type { Graph, PSGFile } from '../types/graph';

export enum PSGErrorType {
  INVALID_JSON = 'INVALID_JSON',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_NODE_DATA = 'INVALID_NODE_DATA',
  INVALID_EDGE_DATA = 'INVALID_EDGE_DATA',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION'
}

export interface PSGError {
  type: PSGErrorType;
  message: string;
  details?: any;
  suggestions?: string[];
}

export class PSGValidationError extends Error {
  constructor(public readonly error: PSGError) {
    super(error.message);
    this.name = 'PSGValidationError';
  }
}

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

export interface ReadPsgOptions {
  maxFileSize?: number;
  strictValidation?: boolean;
  allowLegacyFormat?: boolean;
}

export function readPsg(text: string, options: ReadPsgOptions = {}): PSGFile {
  const { maxFileSize = 10 * 1024 * 1024, strictValidation = true } = options;

  if (text.length > maxFileSize) {
    throw new PSGValidationError({
      type: PSGErrorType.FILE_TOO_LARGE,
      message: `File size exceeds maximum allowed size of ${maxFileSize} bytes`,
      details: { actualSize: text.length, maxSize: maxFileSize },
      suggestions: ['Reduce the file size or increase the maximum allowed size']
    });
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new PSGValidationError({
      type: PSGErrorType.INVALID_JSON,
      message: 'Invalid JSON syntax',
      details: { parseError: e instanceof Error ? e.message : String(e) },
      suggestions: ['Check for syntax errors in your JSON file']
    });
  }

  const securityError = checkSecurityViolations(json);
  if (securityError) {
    throw new PSGValidationError(securityError);
  }

  let parsed: PSGFile;
  try {
    parsed = PSGFileSchema.parse(json) as unknown as PSGFile;
  } catch (e) {
    if (e instanceof ZodError) {
      throw new PSGValidationError(mapZodErrorToPSGError(e));
    }
    throw e;
  }

  if (strictValidation) {
    const consistencyError = checkDataConsistency(parsed);
    if (consistencyError) {
      throw new PSGValidationError(consistencyError);
    }
  }

  return parsed;
}

export function writePsg(psg: PSGFile): string {
  PSGFileSchema.parse(psg as unknown as z.infer<typeof PSGFileSchema>);
  return JSON.stringify(psg, null, 2);
}

export function fromLegacyGraph(
  name: string,
  graph: Graph,
  options?: { idFactory?: () => string; now?: () => string }
): PSGFile {
  const nowIso = options?.now ? options.now() : new Date().toISOString();
  const id = options?.idFactory ? options.idFactory() : cryptoRandomId();
  const psg: PSGFile = {
    version: '1.0',
    kind: 'graph',
    meta: { id, name, createdAt: nowIso, updatedAt: nowIso },
    graph
  };
  PSGFileSchema.parse(psg as unknown as z.infer<typeof PSGFileSchema>);
  return psg;
}

export function roundTripTest(psg: PSGFile): boolean {
  try {
    const serialized = writePsg(psg);
    const deserialized = readPsg(serialized);

    const normalize = (obj: any): any => JSON.parse(JSON.stringify(obj));
    return (
      JSON.stringify(normalize(psg)) === JSON.stringify(normalize(deserialized))
    );
  } catch {
    return false;
  }
}

function cryptoRandomId(): string {
  const c = (
    globalThis as unknown as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'psg_' + Math.random().toString(36).slice(2, 10);
}

function checkSecurityViolations(obj: any, path: string = ''): PSGError | null {
  if (!obj || typeof obj !== 'object') return null;

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  const xssPatterns = [/javascript:/i, /<script/i, /eval\(/i];

  for (const key of Object.keys(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (dangerousKeys.includes(key)) {
      return {
        type: PSGErrorType.SECURITY_VIOLATION,
        message: `Dangerous property detected: "${key}"`,
        details: { path: currentPath },
        suggestions: ['Remove dangerous properties from the file']
      };
    }

    const value = obj[key];
    if (typeof value === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          return {
            type: PSGErrorType.SECURITY_VIOLATION,
            message: `Potential XSS pattern detected in "${currentPath}"`,
            details: { path: currentPath, value },
            suggestions: ['Remove potentially malicious content']
          };
        }
      }
    }

    if (typeof value === 'object' && value !== null) {
      const nested = checkSecurityViolations(value, currentPath);
      if (nested) return nested;
    }
  }

  return null;
}

function checkDataConsistency(psg: PSGFile): PSGError | null {
  const nodeIds = new Set(psg.graph.nodes.map(n => n.id));

  const duplicateNodes = psg.graph.nodes.filter(
    (node, index, arr) => arr.findIndex(n => n.id === node.id) !== index
  );
  if (duplicateNodes.length > 0) {
    return {
      type: PSGErrorType.INVALID_NODE_DATA,
      message: 'Duplicate node IDs detected',
      details: { duplicates: duplicateNodes.map(n => n.id) },
      suggestions: ['Ensure all node IDs are unique']
    };
  }

  for (const edge of psg.graph.edges) {
    if (!nodeIds.has(edge.source)) {
      return {
        type: PSGErrorType.INVALID_EDGE_DATA,
        message: `Edge references non-existent source node: "${edge.source}"`,
        details: { edgeId: edge.id, source: edge.source },
        suggestions: ['Ensure all edge sources reference existing nodes']
      };
    }
    if (!nodeIds.has(edge.target)) {
      return {
        type: PSGErrorType.INVALID_EDGE_DATA,
        message: `Edge references non-existent target node: "${edge.target}"`,
        details: { edgeId: edge.id, target: edge.target },
        suggestions: ['Ensure all edge targets reference existing nodes']
      };
    }
  }

  return null;
}

function mapZodErrorToPSGError(error: ZodError): PSGError {
  const pathErrorMap: Record<string, string> = {
    'meta.id': 'Graph ID is required',
    'meta.name': 'Graph name is required',
    'meta.createdAt': 'Creation timestamp is required',
    'meta.updatedAt': 'Update timestamp is required',
    'graph.nodes': 'Graph must contain a nodes array',
    'graph.edges': 'Graph must contain an edges array',
    version: 'Version field is required',
    kind: 'Kind must be "graph"'
  };

  const issues = error.issues;
  const paths = issues.map(i => i.path.join('.'));

  for (const [path, message] of Object.entries(pathErrorMap)) {
    if (paths.includes(path)) {
      return {
        type: PSGErrorType.MISSING_REQUIRED_FIELDS,
        message,
        details: { paths, rawErrors: issues },
        suggestions: [`Add the missing "${path}" field to your PSG file`]
      };
    }
  }

  return {
    type: PSGErrorType.INVALID_SCHEMA,
    message: 'Invalid PSG file structure',
    details: { paths, rawErrors: issues },
    suggestions: ['Check that your PSG file matches the required schema']
  };
}
