import { Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { createNodeId as sharedCreateNodeId } from '../utils/nodeDefaults';

interface NodeTemplate {
  type: string;
  defaultData: Partial<EditableNodeData>;
}

export class NodeFactory {
  private static nodeTemplates: Map<string, NodeTemplate> = new Map([
    [
      'textBlock',
      {
        type: 'textBlock',
        defaultData: {
          nodeType: 'textBlock',
          value: 'New text block',
          text: 'New text block'
        }
      }
    ],
    [
      'weightedChoice',
      {
        type: 'weightedChoice',
        defaultData: {
          nodeType: 'weightedChoice',
          value: JSON.stringify(
            [
              {
                id: 'option-1',
                text: 'Option 1',
                weight: 50,
                hasBranch: false
              },
              { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: false }
            ],
            null,
            2
          ),
          options: [
            { id: 'option-1', text: 'Option 1', weight: 50, hasBranch: false },
            { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: false }
          ]
        }
      }
    ],
    [
      'concat',
      {
        type: 'concat',
        defaultData: {
          nodeType: 'concat',
          value: ' ',
          separator: ' ',
          joinStyle: 'sentence',
          dedupe: false
        }
      }
    ],
    [
      'variable',
      {
        type: 'variable',
        defaultData: {
          nodeType: 'variable',
          value: 'myVariable',
          variableName: 'myVariable',
          mode: 'both'
        }
      }
    ],
    [
      'setVariable',
      {
        type: 'setVariable',
        defaultData: {
          nodeType: 'setVariable',
          value: 'myVariable',
          variableName: 'myVariable',
          mode: 'set'
        }
      }
    ],
    [
      'getVariable',
      {
        type: 'getVariable',
        defaultData: {
          nodeType: 'getVariable',
          value: 'myVariable',
          variableName: 'myVariable',
          mode: 'get'
        }
      }
    ],
    [
      'output',
      {
        type: 'output',
        defaultData: {
          nodeType: 'output',
          value: 'output',
          label: 'output'
        }
      }
    ],
    [
      'postItNote',
      {
        type: 'postItNote',
        defaultData: {
          nodeType: 'postItNote',
          value: '',
          text: ''
        }
      }
    ]
  ]);

  /**
   * Create a unique node ID (shared util — see utils/nodeDefaults.ts).
   */
  static createNodeId(type?: string): string {
    return sharedCreateNodeId(type);
  }

  /**
   * Create a new node with default data
   */
  static createNode(
    type: string,
    position: { x: number; y: number },
    customData?: Partial<EditableNodeData>
  ): Node<EditableNodeData> {
    const template = this.nodeTemplates.get(type) || {
      type: 'textBlock',
      defaultData: { nodeType: 'textBlock', value: 'New node' }
    };

    const validPosition = {
      x: typeof position?.x === 'number' ? position.x : 250,
      y: typeof position?.y === 'number' ? position.y : 250
    };

    return {
      id: this.createNodeId(template.type),
      type: template.type,
      position: validPosition,
      data: {
        ...template.defaultData,
        ...customData
      } as EditableNodeData
    };
  }

  /**
   * Clone a node with new position
   */
  static cloneNode(
    node: Node<EditableNodeData>,
    offset: { x: number; y: number } = { x: 50, y: 50 }
  ): Node<EditableNodeData> {
    return {
      ...node,
      id: this.createNodeId(
        typeof node.type === 'string' ? node.type : undefined
      ),
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y
      },
      selected: false
    };
  }

  /**
   * Update node data while preserving other properties
   */
  static updateNodeData(
    node: Node<EditableNodeData>,
    updates: Partial<EditableNodeData>
  ): Node<EditableNodeData> {
    return {
      ...node,
      data: {
        ...node.data,
        ...updates
      }
    };
  }

  /**
   * Register a custom node template
   */
  static registerNodeTemplate(type: string, template: NodeTemplate): void {
    this.nodeTemplates.set(type, template);
  }

  /**
   * Get all available node types
   */
  static getAvailableNodeTypes(): string[] {
    return Array.from(this.nodeTemplates.keys());
  }

  /**
   * Validate node data structure
   */
  static validateNodeData(node: Node<EditableNodeData>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!node.id) {
      errors.push('Node missing ID');
    }
    if (!node.type) {
      errors.push('Node missing type');
    }
    if (
      !node.position ||
      typeof node.position.x !== 'number' ||
      typeof node.position.y !== 'number'
    ) {
      errors.push('Node missing or invalid position');
    }
    if (!node.data) {
      errors.push('Node missing data');
    } else if (!node.data.nodeType) {
      errors.push('Node data missing nodeType');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
