/**
 * Fragment Validation Service
 * Validates PSG and PSGLib fragments before they're displayed in the asset browser
 */

import { z } from 'zod';

// Minimal PSG schema for fragment validation
const PSGNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  data: z.record(z.any()).optional()
});

const PSGEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional()
});

const PSGFragmentSchema = z.object({
  version: z.string(),
  name: z.string().optional(),
  nodes: z.array(PSGNodeSchema),
  edges: z.array(PSGEdgeSchema),
  metadata: z.record(z.any()).optional(),
  regions: z.array(z.any()).optional(),
  groups: z.array(z.any()).optional()
});

// PSGLib schema
const PSGLibNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.any()).optional()
});

const PSGLibFragmentSchema = z.object({
  fileType: z.literal('psglib'),
  formatVersion: z.string(),
  metadata: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string().optional(),
    nodeTypes: z.array(z.string()).optional(),
    isFragment: z.boolean().optional()
  }),
  graph: z.object({
    nodes: z.array(PSGLibNodeSchema),
    edges: z.array(PSGEdgeSchema)
  })
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  format?: 'psg' | 'psglib';
  nodeCount?: number;
  hasOutputNodes?: boolean;
}

export class FragmentValidator {
  /**
   * Validate a fragment before displaying in asset browser
   */
  static async validate(content: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Parse JSON
      const data = JSON.parse(content);

      // Detect format
      const format = this.detectFormat(data);
      if (!format) {
        return {
          valid: false,
          errors: ['Unknown fragment format - not PSG or PSGLib'],
          warnings
        };
      }

      // Validate based on format
      if (format === 'psglib') {
        return this.validatePSGLib(data);
      } else {
        return this.validatePSG(data);
      }
    } catch (e) {
      return {
        valid: false,
        errors: [
          `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`
        ],
        warnings
      };
    }
  }

  /**
   * Validate PSG format fragment
   */
  private static validatePSG(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parsed = PSGFragmentSchema.parse(data);

      // Check for duplicate node IDs
      const nodeIds = new Set<string>();
      for (const node of parsed.nodes) {
        if (nodeIds.has(node.id)) {
          errors.push(`Duplicate node ID: ${node.id}`);
        }
        nodeIds.add(node.id);
      }

      // Check for Output nodes in fragments
      const hasOutputNodes = parsed.nodes.some(n => n.type === 'Output');
      if (hasOutputNodes) {
        warnings.push('Fragment contains Output nodes (will be filtered out)');
      }

      // Validate edges reference existing nodes
      for (const edge of parsed.edges) {
        if (!nodeIds.has(edge.source)) {
          errors.push(`Edge references non-existent source: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`Edge references non-existent target: ${edge.target}`);
        }
      }

      // Check for disconnected nodes
      const connectedNodes = new Set<string>();
      for (const edge of parsed.edges) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }

      const disconnected = parsed.nodes.filter(
        n => !connectedNodes.has(n.id) && n.type !== 'Output'
      );

      if (disconnected.length > 0) {
        warnings.push(`${disconnected.length} disconnected node(s)`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        format: 'psg',
        nodeCount: parsed.nodes.length,
        hasOutputNodes
      };
    } catch (e) {
      if (e instanceof z.ZodError) {
        return {
          valid: false,
          errors: e.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings,
          format: 'psg'
        };
      }
      return {
        valid: false,
        errors: [`Validation error: ${e}`],
        warnings,
        format: 'psg'
      };
    }
  }

  /**
   * Validate PSGLib format fragment
   */
  private static validatePSGLib(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parsed = PSGLibFragmentSchema.parse(data);

      // Check for duplicate node IDs
      const nodeIds = new Set<string>();
      for (const node of parsed.graph.nodes) {
        if (nodeIds.has(node.id)) {
          errors.push(`Duplicate node ID: ${node.id}`);
        }
        nodeIds.add(node.id);
      }

      // Check for Output nodes in fragments
      const hasOutputNodes = parsed.graph.nodes.some(n => n.type === 'output');
      if (hasOutputNodes && parsed.metadata.isFragment) {
        warnings.push('Fragment contains Output nodes (will be filtered out)');
      }

      // Validate edges
      for (const edge of parsed.graph.edges) {
        if (!nodeIds.has(edge.source)) {
          errors.push(`Edge references non-existent source: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`Edge references non-existent target: ${edge.target}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        format: 'psglib',
        nodeCount: parsed.graph.nodes.length,
        hasOutputNodes
      };
    } catch (e) {
      if (e instanceof z.ZodError) {
        return {
          valid: false,
          errors: e.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings,
          format: 'psglib'
        };
      }
      return {
        valid: false,
        errors: [`Validation error: ${e}`],
        warnings,
        format: 'psglib'
      };
    }
  }

  /**
   * Detect fragment format
   */
  private static detectFormat(data: any): 'psg' | 'psglib' | null {
    if (data.fileType === 'psglib') {
      return 'psglib';
    }
    if (data.version && data.nodes && data.edges) {
      return 'psg';
    }
    return null;
  }

  /**
   * Quick validation for performance - just checks if parseable
   */
  static canParse(content: string): boolean {
    try {
      const data = JSON.parse(content);
      return this.detectFormat(data) !== null;
    } catch {
      return false;
    }
  }
}
