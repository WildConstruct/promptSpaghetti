import type { Node, Edge } from 'reactflow';

export type QuickStartTemplate = {
  nodes: Node<TemplateNodeData>[];
  edges: Edge[];
};

interface TemplateNodeData extends Record<string, unknown> {
  nodeType: string;
  label?: string;
}

// Simple prebuilt graphs for quick start
const baseY = 100;
const gapX = 350; // Increased to accommodate wider weighted choice nodes

function lineGraph(labels: string[]): {
  nodes: Node<TemplateNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<TemplateNodeData>[] = labels.map((label, i) => {
    // Determine node type based on label
    let nodeType = 'textBlock';
    let data: TemplateNodeData = { nodeType: 'textBlock', label };

    if (label.toLowerCase() === 'output') {
      nodeType = 'output';
      data = {
        nodeType: 'output',
        outputName: 'output',
        label: 'Output'
      };
    } else if (label.toLowerCase() === 'prompt') {
      nodeType = 'textBlock';
      data = {
        nodeType: 'textBlock',
        content: 'Enter your prompt here...',
        text: 'Enter your prompt here...',
        value: 'Enter your prompt here...', // BaseEditableNode expects 'value'
        label: 'Prompt'
      };
    } else {
      // Default content nodes with placeholder text
      nodeType = 'textBlock';
      data = {
        nodeType: 'textBlock',
        content: `${label} content goes here...`,
        text: `${label} content goes here...`,
        value: `${label} content goes here...`, // BaseEditableNode expects 'value'
        label
      };
    }

    return {
      id: `${label.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      position: { x: 100 + i * gapX, y: baseY },
      data,
      type: nodeType
    };
  });

  const edges: Edge[] = labels.slice(0, -1).map((_, i) => ({
    id: `e-${i}`,
    source: nodes[i].id,
    target: nodes[i + 1].id,
    type: 'smoothstep',
    sourceHandle: 'source',
    targetHandle: 'target'
  }));

  return { nodes, edges };
}

// Custom template for character generation with choices - improved layout
const characterTemplate: QuickStartTemplate = {
  nodes: [
    {
      id: 'prompt-0',
      position: { x: 100, y: 50 },
      type: 'textBlock',
      data: {
        nodeType: 'textBlock',
        content: 'A brave adventurer',
        text: 'A brave adventurer',
        value: 'A brave adventurer', // BaseEditableNode expects 'value'
        label: 'Base Prompt'
      }
    },
    {
      id: 'class-2',
      position: { x: 100, y: 150 },
      type: 'weightedChoice',
      data: {
        nodeType: 'weightedChoice',
        options: [
          { id: 'opt-1', text: 'warrior', weight: 40, hasBranch: false },
          { id: 'opt-2', text: 'mage', weight: 30, hasBranch: false },
          { id: 'opt-3', text: 'rogue', weight: 30, hasBranch: false }
        ],
        label: 'Class',
        value: 'warrior' // Default value for BaseEditableNode
      }
    },
    {
      id: 'concat-1',
      position: { x: 500, y: 100 },
      type: 'concat',
      data: {
        nodeType: 'concat',
        separator: ' ',
        value: ' ',
        label: 'Join'
      }
    },
    {
      id: 'trait-4',
      position: { x: 700, y: 150 },
      type: 'weightedChoice',
      data: {
        nodeType: 'weightedChoice',
        options: [
          {
            id: 'opt-4',
            text: 'with a mysterious past',
            weight: 50,
            hasBranch: false
          },
          {
            id: 'opt-5',
            text: 'seeking redemption',
            weight: 50,
            hasBranch: false
          }
        ],
        label: 'Trait',
        value: 'with a mysterious past' // Default value
      }
    },
    {
      id: 'concat-3',
      position: { x: 1100, y: 100 },
      type: 'concat',
      data: {
        nodeType: 'concat',
        separator: ' ',
        value: ' ',
        label: 'Join'
      }
    },
    {
      id: 'output-5',
      position: { x: 1400, y: 100 },
      type: 'output',
      data: {
        nodeType: 'output',
        outputName: 'character',
        label: 'Output'
      }
    }
  ],
  edges: [
    // Prompt goes to first input of concat-1
    {
      id: 'e-0',
      source: 'prompt-0',
      target: 'concat-1',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    // Class goes to second input of concat-1
    {
      id: 'e-1',
      source: 'class-2',
      target: 'concat-1',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    // First concat goes to first input of concat-3
    {
      id: 'e-2',
      source: 'concat-1',
      target: 'concat-3',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    // Trait goes to second input of concat-3
    {
      id: 'e-3',
      source: 'trait-4',
      target: 'concat-3',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    // Second concat goes to output
    {
      id: 'e-4',
      source: 'concat-3',
      target: 'output-5',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    }
  ]
};

export const quickStartTemplates: Record<string, QuickStartTemplate> = {
  character: characterTemplate,
  scene: lineGraph(['Prompt', 'Setting', 'Mood', 'Output']),
  story: lineGraph(['Prompt', 'Plot Idea', 'Character', 'Output']),
  product: lineGraph(['Prompt', 'Features', 'Benefits', 'Output']),
  art: lineGraph(['Prompt', 'Style', 'Palette', 'Output']),
  food: lineGraph(['Prompt', 'Ingredients', 'Method', 'Output'])
};
