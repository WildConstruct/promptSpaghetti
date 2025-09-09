/**
 * Central Node Type Registry
 * Single source of truth for all available node types in the system
 */

import { z } from 'zod';

/**
 * Port definition for node connections
 */
export interface NodePort {
  id: string;
  label: string;
  type: 'input' | 'output';
  dataType?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  required?: boolean;
  multiple?: boolean; // Can accept multiple connections
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Configuration option for a node type
 */
export interface NodeConfigOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'json';
  defaultValue?: string | number | boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>; // For select type
  validation?: z.ZodSchema; // Zod schema for validation
}

/**
 * Node type definition interface
 */
export interface INodeType {
  // Identification
  id: string; // Unique identifier (e.g., "weightedChoice")
  displayName: string; // Human-readable name (e.g., "Weighted Choice")
  category: NodeCategory; // Category for organization
  version: string; // Node type version

  // Type mappings
  psgType: string; // PSG format type (e.g., "WeightedChoice")
  reactFlowType: string; // React Flow type (e.g., "weightedChoice")
  className: string; // Runtime class name (e.g., "WeightedChoiceNode")

  // Description
  description: string; // Brief description
  documentation?: string; // Detailed documentation/help text
  icon?: string; // Icon identifier or emoji

  // Ports
  inputs: NodePort[]; // Input port definitions
  outputs: NodePort[]; // Output port definitions

  // Configuration
  configOptions?: NodeConfigOption[]; // Configuration options

  // Behavior
  isExecutable: boolean; // Can be executed in runtime
  isVisualOnly?: boolean; // UI-only node (e.g., bounding box)
  canHaveBranches?: boolean; // Supports branching logic

  // Metadata
  tags: string[]; // Searchable tags
  deprecated?: boolean; // Is deprecated
  replacedBy?: string; // ID of replacement node type

  // Examples
  examples?: NodeExample[]; // Usage examples
}

/**
 * Node usage example
 */
export interface NodeExample {
  title: string;
  description: string;
  configuration: Record<string, unknown>;
  expectedOutput?: string;
}

/**
 * Node categories for organization
 */
export enum NodeCategory {
  BRANCHING = 'branching',
  TEXT = 'text',
  VARIABLES = 'variables',
  FLOW = 'flow',
  LOGIC = 'logic',
  VISUAL = 'visual',
  UTILITY = 'utility',
  CUSTOM = 'custom'
}

/**
 * Central node type registry
 */
class NodeTypeRegistry {
  private nodeTypes: Map<string, INodeType> = new Map();
  private psgTypeMap: Map<string, string> = new Map(); // PSG type -> registry ID
  private reactFlowTypeMap: Map<string, string> = new Map(); // React Flow type -> registry ID
  private categories: Map<NodeCategory, Set<string>> = new Map();

  constructor() {
    // Initialize categories
    Object.values(NodeCategory).forEach(category => {
      this.categories.set(category as NodeCategory, new Set());
    });

    // Register built-in node types
    this.registerBuiltInTypes();
  }

  /**
   * Register a node type
   */
  register(nodeType: INodeType): void {
    // Validation
    if (this.nodeTypes.has(nodeType.id)) {
      throw new Error(`Node type ${nodeType.id} is already registered`);
    }

    // Check for conflicts
    if (this.psgTypeMap.has(nodeType.psgType)) {
      const existingId = this.psgTypeMap.get(nodeType.psgType);
      throw new Error(
        `PSG type ${nodeType.psgType} is already mapped to ${existingId}`
      );
    }

    if (this.reactFlowTypeMap.has(nodeType.reactFlowType)) {
      const existingId = this.reactFlowTypeMap.get(nodeType.reactFlowType);
      throw new Error(
        `React Flow type ${nodeType.reactFlowType} is already mapped to ${existingId}`
      );
    }

    // Register the node type
    this.nodeTypes.set(nodeType.id, nodeType);
    this.psgTypeMap.set(nodeType.psgType, nodeType.id);
    this.reactFlowTypeMap.set(nodeType.reactFlowType, nodeType.id);

    // Add to category
    const categorySet = this.categories.get(nodeType.category);
    if (categorySet) {
      categorySet.add(nodeType.id);
    }
  }

  /**
   * Get a node type by ID
   */
  get(id: string): INodeType | undefined {
    return this.nodeTypes.get(id);
  }

  /**
   * Get node type by PSG type name
   */
  getByPsgType(psgType: string): INodeType | undefined {
    const id = this.psgTypeMap.get(psgType);
    return id ? this.nodeTypes.get(id) : undefined;
  }

  /**
   * Get node type by React Flow type name
   */
  getByReactFlowType(reactFlowType: string): INodeType | undefined {
    const id = this.reactFlowTypeMap.get(reactFlowType);
    return id ? this.nodeTypes.get(id) : undefined;
  }

  /**
   * Get all node types
   */
  getAll(): INodeType[] {
    return Array.from(this.nodeTypes.values());
  }

  /**
   * Get node types by category
   */
  getByCategory(category: NodeCategory): INodeType[] {
    const ids = this.categories.get(category);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.nodeTypes.get(id))
      .filter((type): type is INodeType => type !== undefined);
  }

  /**
   * Search node types by tags
   */
  searchByTags(tags: string[]): INodeType[] {
    return this.getAll().filter(nodeType =>
      tags.some(tag => nodeType.tags.includes(tag))
    );
  }

  /**
   * Get executable node types only
   */
  getExecutableTypes(): INodeType[] {
    return this.getAll().filter(
      type => type.isExecutable && !type.isVisualOnly
    );
  }

  /**
   * Convert PSG type to React Flow type
   */
  convertPsgToReactFlow(psgType: string): string {
    const nodeType = this.getByPsgType(psgType);
    return nodeType
      ? nodeType.reactFlowType
      : psgType.charAt(0).toLowerCase() + psgType.slice(1);
  }

  /**
   * Convert React Flow type to PSG type
   */
  convertReactFlowToPsg(reactFlowType: string): string {
    const nodeType = this.getByReactFlowType(reactFlowType);
    return nodeType
      ? nodeType.psgType
      : reactFlowType.charAt(0).toUpperCase() + reactFlowType.slice(1);
  }

  /**
   * Export registry as JSON for documentation/agents
   */
  exportCatalog(): object {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      nodeTypes: this.getAll().map(type => ({
        ...type,
        inputs: type.inputs,
        outputs: type.outputs,
        configOptions: type.configOptions
      })),
      categories: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, ids]) => [
          cat,
          Array.from(ids)
        ])
      ),
      mappings: {
        psgToReactFlow: Object.fromEntries(
          this.getAll().map(type => [type.psgType, type.reactFlowType])
        ),
        reactFlowToPsg: Object.fromEntries(
          this.getAll().map(type => [type.reactFlowType, type.psgType])
        )
      }
    };
  }

  /**
   * Register built-in node types
   */
  private registerBuiltInTypes(): void {
    // Weighted Choice Node
    this.register({
      id: 'weightedChoice',
      displayName: 'Weighted Choice',
      category: NodeCategory.BRANCHING,
      version: '1.0.0',
      psgType: 'WeightedChoice',
      reactFlowType: 'weightedChoice',
      className: 'WeightedChoiceNode',
      description: 'Randomly selects from weighted options',
      documentation:
        'Selects one option based on relative weights. Higher weights have higher probability of selection.',
      icon: '🎲',
      inputs: [
        { id: 'target', label: 'Input', type: 'input', dataType: 'any' }
      ],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'string' }
      ],
      configOptions: [
        {
          id: 'options',
          label: 'Options',
          type: 'json',
          defaultValue: [],
          required: true
        }
      ],
      isExecutable: true,
      canHaveBranches: true,
      tags: ['random', 'choice', 'weighted', 'probability'],
      examples: [
        {
          title: 'Character Mood',
          description: 'Select a mood with different probabilities',
          configuration: {
            options: [
              { text: 'happy', weight: 3 },
              { text: 'neutral', weight: 2 },
              { text: 'sad', weight: 1 }
            ]
          },
          expectedOutput: 'One of: happy, neutral, or sad'
        }
      ]
    });

    // Output Node
    this.register({
      id: 'output',
      displayName: 'Output',
      category: NodeCategory.FLOW,
      version: '1.0.0',
      psgType: 'Output',
      reactFlowType: 'output',
      className: 'OutputNode',
      description: 'Final output of the graph',
      documentation:
        'Collects and outputs the final result of the graph execution.',
      icon: '📤',
      inputs: [
        {
          id: 'target',
          label: 'Input',
          type: 'input',
          dataType: 'string',
          required: true
        }
      ],
      outputs: [
        { id: 'output', label: 'Output', type: 'output', dataType: 'string' }
      ],
      isExecutable: true,
      tags: ['output', 'result', 'final']
    });

    // Concatenate Node
    this.register({
      id: 'concat',
      displayName: 'Concatenate',
      category: NodeCategory.TEXT,
      version: '1.0.0',
      psgType: 'Concat',
      reactFlowType: 'concat',
      className: 'ConcatNode',
      description: 'Joins multiple inputs into one',
      documentation:
        'Concatenates multiple input strings with an optional separator.',
      icon: '🔗',
      inputs: [
        {
          id: 'target',
          label: 'Input',
          type: 'input',
          dataType: 'string',
          multiple: true
        }
      ],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'string' }
      ],
      configOptions: [
        {
          id: 'separator',
          label: 'Separator',
          type: 'text',
          defaultValue: ' '
        },
        {
          id: 'trimInputs',
          label: 'Trim Inputs',
          type: 'boolean',
          defaultValue: true
        }
      ],
      isExecutable: true,
      tags: ['join', 'concatenate', 'merge', 'text']
    });

    // Text Block Node
    this.register({
      id: 'textBlock',
      displayName: 'Text Block',
      category: NodeCategory.TEXT,
      version: '1.0.0',
      psgType: 'TextBlock',
      reactFlowType: 'textBlock',
      className: 'TextBlockNode',
      description: 'Static text content',
      documentation: 'Outputs a fixed text value.',
      icon: '📝',
      inputs: [],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'string' }
      ],
      configOptions: [
        {
          id: 'text',
          label: 'Text',
          type: 'text',
          defaultValue: '',
          required: true
        }
      ],
      isExecutable: true,
      tags: ['text', 'static', 'content']
    });

    // Variable Node
    this.register({
      id: 'variable',
      displayName: 'Variable',
      category: NodeCategory.VARIABLES,
      version: '1.0.0',
      psgType: 'Variable',
      reactFlowType: 'variable',
      className: 'VariableNode',
      description: 'Get or set a variable',
      documentation: 'Manages variable values in the execution context.',
      icon: '📊',
      inputs: [
        { id: 'target', label: 'Input', type: 'input', dataType: 'any' }
      ],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'any' }
      ],
      configOptions: [
        {
          id: 'variableName',
          label: 'Variable Name',
          type: 'text',
          defaultValue: 'myVar',
          required: true
        },
        {
          id: 'mode',
          label: 'Mode',
          type: 'select',
          defaultValue: 'both',
          options: [
            { value: 'get', label: 'Get' },
            { value: 'set', label: 'Set' },
            { value: 'both', label: 'Both' }
          ]
        },
        {
          id: 'defaultValue',
          label: 'Default Value',
          type: 'text',
          defaultValue: ''
        }
      ],
      isExecutable: true,
      tags: ['variable', 'state', 'memory']
    });

    // Include Node
    this.register({
      id: 'include',
      displayName: 'Include',
      category: NodeCategory.FLOW,
      version: '1.0.0',
      psgType: 'Include',
      reactFlowType: 'include',
      className: 'IncludeNode',
      description: 'Include another graph',
      documentation: 'Includes and executes another graph as a subgraph.',
      icon: '📥',
      inputs: [
        { id: 'target', label: 'Input', type: 'input', dataType: 'any' }
      ],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'any' }
      ],
      configOptions: [
        {
          id: 'graphId',
          label: 'Graph ID',
          type: 'text',
          required: true
        }
      ],
      isExecutable: true,
      tags: ['include', 'subgraph', 'import']
    });

    // Subject Node
    this.register({
      id: 'subject',
      displayName: 'Subject',
      category: NodeCategory.TEXT,
      version: '1.0.0',
      psgType: 'Subject',
      reactFlowType: 'subject',
      className: 'SubjectNode',
      description: 'Character or subject generator',
      documentation: 'Generates character descriptions or subjects.',
      icon: '👤',
      inputs: [],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'string' }
      ],
      isExecutable: true,
      tags: ['character', 'subject', 'person']
    });

    // Action Node
    this.register({
      id: 'action',
      displayName: 'Action',
      category: NodeCategory.TEXT,
      version: '1.0.0',
      psgType: 'Action',
      reactFlowType: 'action',
      className: 'ActionNode',
      description: 'Action or verb generator',
      documentation: 'Generates actions or verbs for characters.',
      icon: '🎬',
      inputs: [],
      outputs: [
        { id: 'main', label: 'Output', type: 'output', dataType: 'string' }
      ],
      isExecutable: true,
      tags: ['action', 'verb', 'movement']
    });

    // Enhanced Bounding Box (Visual Only)
    this.register({
      id: 'enhancedBoundingBox',
      displayName: 'Enhanced Bounding Box',
      category: NodeCategory.VISUAL,
      version: '1.0.0',
      psgType: 'EnhancedBoundingBox',
      reactFlowType: 'enhancedBoundingBox',
      className: 'EnhancedBoundingBox',
      description: 'Visual grouping container',
      documentation: 'Groups nodes visually with a collapsible bounding box.',
      icon: '📦',
      inputs: [],
      outputs: [],
      configOptions: [
        {
          id: 'title',
          label: 'Title',
          type: 'text',
          defaultValue: 'Group'
        },
        {
          id: 'description',
          label: 'Description',
          type: 'text',
          defaultValue: ''
        },
        {
          id: 'backgroundColor',
          label: 'Background Color',
          type: 'color',
          defaultValue: '#1a202c'
        },
        {
          id: 'borderColor',
          label: 'Border Color',
          type: 'color',
          defaultValue: '#22d3ee'
        },
        {
          id: 'isCollapsed',
          label: 'Start Collapsed',
          type: 'boolean',
          defaultValue: false
        }
      ],
      isExecutable: false,
      isVisualOnly: true,
      tags: ['group', 'container', 'visual', 'organize']
    });

    // Fragment Container removed - using EnhancedBoundingBox for fragments instead
    // This was causing duplicate containers with conflicting systems

    // Post-It Note (Visual Only)
    this.register({
      id: 'postItNote',
      displayName: 'Post-It Note',
      category: NodeCategory.VISUAL,
      version: '1.0.0',
      psgType: 'PostItNote',
      reactFlowType: 'postItNote',
      className: 'PostItNote',
      description: 'Visual annotation',
      documentation: 'Adds a visual note or comment to the graph.',
      icon: '📌',
      inputs: [],
      outputs: [],
      configOptions: [
        {
          id: 'text',
          label: 'Note Text',
          type: 'text',
          defaultValue: 'Note...'
        },
        {
          id: 'color',
          label: 'Color',
          type: 'select',
          defaultValue: 'yellow',
          options: [
            { value: 'yellow', label: 'Yellow' },
            { value: 'pink', label: 'Pink' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' }
          ]
        }
      ],
      isExecutable: false,
      isVisualOnly: true,
      tags: ['note', 'comment', 'annotation', 'visual']
    });
  }
}

// Export singleton instance
export const nodeRegistry = new NodeTypeRegistry();

// Export convenience functions
export function getNodeTypeByPsg(psgType: string): INodeType | undefined {
  return nodeRegistry.getByPsgType(psgType);
}

export function getNodeTypeByReactFlow(
  reactFlowType: string
): INodeType | undefined {
  return nodeRegistry.getByReactFlowType(reactFlowType);
}

export function convertNodeType(
  type: string,
  from: 'psg' | 'reactflow'
): string {
  if (from === 'psg') {
    return nodeRegistry.convertPsgToReactFlow(type);
  } else {
    return nodeRegistry.convertReactFlowToPsg(type);
  }
}

export function exportNodeCatalog(): object {
  return nodeRegistry.exportCatalog();
}
