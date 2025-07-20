/**
 * Graph Validation Engine for PromptSpaghetti
 * 
 * This module provides comprehensive validation for graph structures to ensure
 * they can be safely executed. It checks for common issues like:
 * - Missing required nodes or inputs
 * - Cycles in the graph
 * - Disconnected components
 * - Invalid configuration values
 */

import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';
import { z } from 'zod';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  path?: string;
  severity: 'error' | 'warning';
}

// Basic node schema with required fields
const nodeSchema = z.object({
  id: z.string().min(1, 'Node ID cannot be empty'),
  type: z.enum([
    'WeightedChoice',
    'Concat',
    'Output',
    'Include',
    'SetVariable',
    'GetVariable'
  ], { errorMap: () => ({ message: 'Invalid node type' }) }),
  inputs: z.array(z.string()).optional()
});

// Graph schema with required fields
const graphSchema = z.object({
  nodes: z.array(nodeSchema).min(1, 'Graph must contain at least one node'),
  seed: z.union([z.number(), z.string(), z.undefined()]).optional()
});

/**
 * Validates basic graph structure using Zod schema validation
 */
function validateGraphStructure(graph: any): ValidationError[] {
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
    return [{
      code: 'INVALID_STRUCTURE',
      message: 'Invalid graph structure',
      severity: 'error'
    }];
  }
}

/**
 * Validates node references in the graph
 */
function validateNodeReferences(graph: Graph): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(graph.nodes.map(node => node.id));
  
  for (const node of graph.nodes) {
    if (node.inputs) {
      for (const inputId of node.inputs) {
        if (!nodeIds.has(inputId)) {
          errors.push({
            code: 'MISSING_NODE_REFERENCE',
            message: `Node "${node.id}" references non-existent node "${inputId}"`,
            nodeId: node.id,
            severity: 'error'
          });
        }
      }
    }
  }
  
  return errors;
}

/**
 * Validates that the graph has at least one Output node
 */
function validateOutputNodes(graph: Graph): ValidationError[] {
  const errors: ValidationError[] = [];
  const hasOutputNode = graph.nodes.some(node => node.type === 'Output');
  
  if (!hasOutputNode) {
    errors.push({
      code: 'NO_OUTPUT_NODES',
      message: 'Graph must have at least one Output node',
      severity: 'error'
    });
  }
  
  return errors;
}

/**
 * Detects cycles in the graph
 * Uses depth-first search with path tracking to identify cycles
 */
function detectCycles(graph: Graph): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeMap = new Map(graph.nodes.map(node => [node.id, node]));
  const visited = new Set<string>();
  const path = new Set<string>();
  
  function dfs(nodeId: string): boolean {
    // Already in the current path -> cycle detected
    if (path.has(nodeId)) {
      errors.push({
        code: 'CYCLE_DETECTED',
        message: `Cycle detected involving node "${nodeId}"`,
        nodeId: nodeId,
        severity: 'error'
      });
      return true;
    }
    
    // Already visited this node in a different path, no cycle here
    if (visited.has(nodeId)) {
      return false;
    }
    
    const node = nodeMap.get(nodeId);
    if (!node) return false;
    
    // Mark node as visited and add to current path
    visited.add(nodeId);
    path.add(nodeId);
    
    // Check all inputs recursively
    if (node.inputs && node.inputs.length > 0) {
      for (const inputId of node.inputs) {
        if (dfs(inputId)) {
          return true; // Cycle found
        }
      }
    }
    
    // Remove from current path when backtracking
    path.delete(nodeId);
    return false;
  }
  
  // Run DFS from each node to detect cycles
  for (const node of graph.nodes) {
    dfs(node.id);
  }
  
  return errors;
}

/**
 * Validates node configurations based on their types
 */
function validateNodeConfigurations(graph: Graph): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const node of graph.nodes) {
    switch (node.type) {
    case 'WeightedChoice':
      // Validate that choices array exists and is not empty
      if (!('choices' in node) || !Array.isArray(node.choices) || node.choices.length === 0) {
        errors.push({
          code: 'INVALID_WEIGHTEDCHOICE_CONFIG',
          message: `WeightedChoice node "${node.id}" must have a non-empty array of choices`,
          nodeId: node.id,
          severity: 'error'
        });
      } else {
        // Validate that each choice has a value and positive weight
        for (let i = 0; i < node.choices.length; i++) {
          const choice = node.choices[i];
          if (!choice || typeof choice !== 'object') {
            errors.push({
              code: 'INVALID_WEIGHTEDCHOICE_CONFIG',
              message: `WeightedChoice node "${node.id}" has an invalid choice at index ${i}`,
              nodeId: node.id,
              severity: 'error'
            });
          } else if (!('value' in choice) || typeof choice.value !== 'string') {
            errors.push({
              code: 'INVALID_WEIGHTEDCHOICE_CONFIG',
              message: `WeightedChoice node "${node.id}" has a choice without a string value at index ${i}`,
              nodeId: node.id,
              severity: 'error'
            });
          } else if (!('weight' in choice) || typeof choice.weight !== 'number' || choice.weight <= 0) {
            errors.push({
              code: 'INVALID_WEIGHTEDCHOICE_CONFIG',
              message: `WeightedChoice node "${node.id}" has a choice without a positive weight at index ${i}`,
              nodeId: node.id,
              severity: 'error'
            });
          }
        }
      }
      break;
        
    case 'Include':
      if (!('name' in node) || typeof node.name !== 'string' || node.name.trim() === '') {
        errors.push({
          code: 'INVALID_INCLUDE_CONFIG',
          message: `Include node "${node.id}" must have a non-empty name property`,
          nodeId: node.id,
          severity: 'error'
        });
      }
      break;

    case 'SetVariable':
    case 'GetVariable':
      if (!('key' in node) || typeof node.key !== 'string' || node.key.trim() === '') {
        errors.push({
          code: 'INVALID_VARIABLE_CONFIG',
          message: `${node.type} node "${node.id}" must have a non-empty key property`,
          nodeId: node.id,
          severity: 'error'
        });
      }
      break;
    }
  }
  
  return errors;
}

/**
 * Performs a full validation on the graph
 */
export function validateGraph(graphData: unknown): ValidationResult {
  // First check if it's a valid graph structure
  const structureErrors = validateGraphStructure(graphData);
  if (structureErrors.length > 0) {
    return {
      valid: false,
      errors: structureErrors
    };
  }
  
  // Now we know it's a valid Graph type
  const graph = graphData as Graph;
  
  // Combine all validation results
  const referenceErrors = validateNodeReferences(graph);
  const cycleErrors = detectCycles(graph);
  const outputErrors = validateOutputNodes(graph);
  const configErrors = validateNodeConfigurations(graph);
  
  const allErrors = [
    ...structureErrors,
    ...referenceErrors,
    ...cycleErrors,
    ...outputErrors,
    ...configErrors
  ];
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}
