/**
 * Graph validation utilities for ensuring PromptSpaghetti graphs are safe to execute.
 */

import { z } from 'zod';
import type { Graph, Node } from '../../packages/core/graphSchema';

export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  path?: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Basic node schema used for structural validation
const nodeSchema = z.object({
  id: z.string().min(1, 'Node ID cannot be empty'),
  type: z.string(),
  inputs: z.array(z.string()).optional()
});

// Graph schema for structural validation
const graphSchema = z.object({
  nodes: z.array(nodeSchema).min(1, 'Graph must contain at least one node'),
  seed: z.union([z.number(), z.string()]).optional()
});

function validateGraphStructure(graph: unknown): ValidationError[] {
  try {
    graphSchema.parse(graph);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => ({
        code: 'INVALID_STRUCTURE',
        message: err.message,
        path: err.path.join('.'),
        severity: 'error'
      }));
    }

    return [
      {
        code: 'INVALID_STRUCTURE',
        message: 'Invalid graph structure',
        severity: 'error'
      }
    ];
  }
}

function validateNodeReferences(graph: Graph): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(graph.nodes.map(node => node.id));

  graph.nodes.forEach(node => {
    (node.inputs ?? []).forEach(inputId => {
      if (!nodeIds.has(inputId)) {
        errors.push({
          code: 'MISSING_NODE_REFERENCE',
          message: `Node "${node.id}" references non-existent node "${inputId}"`,
          nodeId: node.id,
          severity: 'error'
        });
      }
    });
  });

  return errors;
}

function validateOutputNodes(graph: Graph): ValidationError[] {
  const hasOutput = graph.nodes.some(node => node.type === 'Output');

  if (hasOutput) {
    return [];
  }

  return [
    {
      code: 'NO_OUTPUT_NODES',
      message: 'Graph must have at least one Output node',
      severity: 'error'
    }
  ];
}

function detectCycles(graph: Graph): ValidationError[] {
  const nodeMap = new Map<string, Node>(
    graph.nodes.map(node => [node.id, node])
  );
  const visited = new Set<string>();
  const path = new Set<string>();
  const errors: ValidationError[] = [];

  const dfs = (nodeId: string) => {
    if (path.has(nodeId)) {
      errors.push({
        code: 'CYCLE_DETECTED',
        message: `Cycle detected involving node "${nodeId}"`,
        nodeId,
        severity: 'error'
      });
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    const node = nodeMap.get(nodeId);
    if (!node) {
      return;
    }

    visited.add(nodeId);
    path.add(nodeId);

    (node.inputs ?? []).forEach(dfs);

    path.delete(nodeId);
  };

  graph.nodes.forEach(node => dfs(node.id));

  return errors;
}

function validateUniqueNodeIds(graph: Graph): ValidationError[] {
  const seen = new Set<string>();
  const duplicates: ValidationError[] = [];

  graph.nodes.forEach(node => {
    if (seen.has(node.id)) {
      duplicates.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node id "${node.id}" detected`,
        nodeId: node.id,
        severity: 'error'
      });
    } else {
      seen.add(node.id);
    }
  });

  return duplicates;
}

export function validateGraph(graph: Graph): ValidationResult {
  const errors: ValidationError[] = [
    ...validateGraphStructure(graph),
    ...validateUniqueNodeIds(graph),
    ...validateNodeReferences(graph),
    ...validateOutputNodes(graph),
    ...detectCycles(graph)
  ];

  return {
    valid: errors.length === 0,
    errors
  };
}
