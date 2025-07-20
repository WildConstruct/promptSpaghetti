// Epic 12 - LLM Agent Randomizer System
// Story 12.1 - Serialization Format Design
// Core serialization logic for converting graphs to LLM-friendly format

import { Graph, Node } from '../../graphSchema';
// Use Node.js crypto in Node environment, or web crypto API in browser
let createHash: any;
try {
  createHash = require('crypto').createHash;
} catch {
  // Browser environment - use a simple hash alternative
  createHash = (algorithm: string) => ({
    update: (data: string) => ({
      digest: (format: string) => {
        // Simple hash fallback for browser testing
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(16, '0');
      }
    })
  });
}

export interface SerializationMetadata {
  name?: string;
  description?: string;
  author?: string;
  created?: string;
  tags?: string[];
}

export interface SerializationOptions {
  includeChecksum?: boolean;
  includeMetadata?: boolean;
  compactFormat?: boolean;
  validateOnSerialize?: boolean;
}

export class GraphSerializer {
  private static readonly FORMAT_VERSION = '1.0.0';
  private static readonly SECTION_DELIMITERS = {
    NODES: '---NODES---',
    EDGES: '---EDGES---',
    END: '---END---'
  };

  /**
   * Serialize a graph to LLM-friendly format
   */
  static serialize(
    graph: Graph, 
    metadata?: SerializationMetadata,
    options: SerializationOptions = {}
  ): string {
    const {
      includeChecksum = true,
      includeMetadata = true,
      compactFormat = false,
      validateOnSerialize = true
    } = options;

    if (validateOnSerialize) {
      this.validateGraph(graph);
    }

    const lines: string[] = [];
    const indent = compactFormat ? '' : '  ';

    // Header section
    lines.push(`version: ${this.FORMAT_VERSION}`);
    
    if (includeMetadata && metadata) {
      lines.push('metadata:');
      if (metadata.name) lines.push(`${indent}name: "${metadata.name}"`);
      if (metadata.description) lines.push(`${indent}description: "${metadata.description}"`);
      if (metadata.author) lines.push(`${indent}author: "${metadata.author}"`);
      if (metadata.created) lines.push(`${indent}created: ${metadata.created}`);
      if (metadata.tags && metadata.tags.length > 0) {
        lines.push(`${indent}tags: [${metadata.tags.map(t => `"${t}"`).join(', ')}]`);
      }
    }

    lines.push(''); // Empty line before nodes section

    // Nodes section
    lines.push(this.SECTION_DELIMITERS.NODES);
    graph.nodes.forEach(node => {
      lines.push(...this.serializeNode(node, compactFormat));
      lines.push(''); // Empty line between nodes
    });

    // Edges section
    lines.push(this.SECTION_DELIMITERS.EDGES);
    const edges = this.extractEdges(graph);
    edges.forEach(edge => {
      lines.push(`${edge.source} -> ${edge.target}`);
    });

    lines.push(''); // Empty line before end
    lines.push(this.SECTION_DELIMITERS.END);

    let serialized = lines.join('\n');

    // Add checksum if requested
    if (includeChecksum) {
      const checksum = this.calculateChecksum(serialized);
      serialized = serialized.replace(
        `version: ${this.FORMAT_VERSION}`,
        `version: ${this.FORMAT_VERSION}\nchecksum: ${checksum}`
      );
    }

    return serialized;
  }

  /**
   * Serialize an individual node to YAML format
   */
  private static serializeNode(node: Node, compact: boolean = false): string[] {
    const lines: string[] = [];
    const indent = compact ? '' : '  ';

    lines.push(`${node.id}:`);
    lines.push(`${indent}type: ${node.type}`);

    // Serialize properties based on node type
    const props = this.extractNodeProperties(node);
    if (Object.keys(props).length > 0) {
      lines.push(`${indent}props:`);
      Object.entries(props).forEach(([key, value]) => {
        lines.push(`${indent}${indent}${key}: ${this.serializeValue(value)}`);
      });
    }

    // Add inputs if present
    if (node.inputs && node.inputs.length > 0) {
      const inputsStr = node.inputs.map(id => `"${id}"`).join(', ');
      lines.push(`${indent}inputs: [${inputsStr}]`);
    }

    return lines;
  }

  /**
   * Extract properties from a node based on its type
   */
  private static extractNodeProperties(node: Node): Record<string, any> {
    const props: Record<string, any> = {};

    switch (node.type) {
    case 'WeightedChoice':
      if ('choices' in node) {
        props.choices = node.choices;
      }
      break;

    case 'WeightedAdvanced':
      if ('choices' in node) props.choices = node.choices;
      if ('distributionConfig' in node) props.distribution = node.distributionConfig;
      break;

    case 'Conditional':
      if ('branches' in node) props.branches = node.branches;
      if ('defaultOutput' in node) props.default = node.defaultOutput;
      if ('conditionalConfig' in node) props.config = node.conditionalConfig;
      break;

    case 'Sequential':
      if ('sequence' in node) props.sequence = node.sequence;
      if ('pattern' in node) props.pattern = node.pattern;
      break;

    case 'Markov':
      if ('states' in node) props.states = node.states;
      if ('initialState' in node) props.initial = node.initialState;
      if ('terminationConditions' in node) props.termination = node.terminationConditions;
      break;

    case 'SetVariable':
      if ('key' in node) props.key = node.key;
      if ('value' in node) props.value = node.value;
      break;

    case 'GetVariable':
      if ('key' in node) props.key = node.key;
      break;

    case 'Include':
      if ('name' in node) props.name = node.name;
      break;

    case 'PythonTransform':
      if ('code' in node) props.code = node.code;
      if ('timeout' in node) props.timeout = node.timeout;
      if ('memoryLimit' in node) props.memory_limit = node.memoryLimit;
      if ('allowedModules' in node) props.allowed_modules = node.allowedModules;
      break;
    }

    return props;
  }

  /**
   * Serialize a value to YAML format
   */
  private static serializeValue(value: any): string {
    if (typeof value === 'string') {
      // Quote strings that might be ambiguous
      if (value.includes('\n') || value.includes(':') || value.includes('"')) {
        return `|\n      ${value.split('\n').join('\n      ')}`;
      }
      return `"${value}"`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
        return `[${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]`;
      }
      // Complex array - use multi-line format
      const items = value.map(v => `      - ${this.serializeValue(v)}`).join('\n');
      return `\n${items}`;
    }

    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) return '{}';
      
      const items = entries.map(([k, v]) => `      ${k}: ${this.serializeValue(v)}`).join('\n');
      return `\n${items}`;
    }

    return String(value);
  }

  /**
   * Extract edges from graph nodes
   */
  private static extractEdges(graph: Graph): Array<{source: string, target: string}> {
    const edges: Array<{source: string, target: string}> = [];
    
    graph.nodes.forEach(node => {
      if (node.inputs) {
        node.inputs.forEach(inputId => {
          edges.push({
            source: inputId,
            target: node.id
          });
        });
      }
    });

    return edges;
  }

  /**
   * Calculate SHA-256 checksum for integrity verification
   */
  private static calculateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Validate graph structure before serialization
   */
  private static validateGraph(graph: Graph): void {
    if (!graph.nodes || graph.nodes.length === 0) {
      throw new Error('Graph must contain at least one node');
    }

    const nodeIds = new Set(graph.nodes.map(n => n.id));
    
    // Check for duplicate node IDs
    if (nodeIds.size !== graph.nodes.length) {
      throw new Error('Graph contains duplicate node IDs');
    }

    // Validate node references
    graph.nodes.forEach(node => {
      if (node.inputs) {
        node.inputs.forEach(inputId => {
          if (!nodeIds.has(inputId)) {
            throw new Error(`Node ${node.id} references non-existent input ${inputId}`);
          }
        });
      }
    });

    // Check for cycles (basic check)
    this.detectCycles(graph);
  }

  /**
   * Detect cycles in the graph using DFS
   */
  private static detectCycles(graph: Graph): void {
    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        throw new Error(`Cycle detected involving node ${nodeId}`);
      }
      
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node?.inputs) {
        for (const inputId of node.inputs) {
          if (dfs(inputId)) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }
  }
}

/**
 * Utility function for easy serialization
 */
export function serializeGraph(
  graph: Graph,
  metadata?: SerializationMetadata,
  options?: SerializationOptions
): string {
  return GraphSerializer.serialize(graph, metadata, options);
}

/**
 * Create default metadata for a graph
 */
export function createDefaultMetadata(): SerializationMetadata {
  return {
    author: 'llm-agent',
    created: new Date().toISOString(),
    description: 'LLM-generated graph'
  };
}