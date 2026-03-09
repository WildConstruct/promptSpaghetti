import type { Node, Edge } from 'reactflow';

export type QuickStartTemplate = {
  nodes: Node<TemplateNodeData>[];
  edges: Edge[];
};

interface TemplateNodeData extends Record<string, unknown> {
  nodeType: string;
  label?: string;
}

function textNode(
  id: string,
  x: number,
  y: number,
  label: string,
  value: string
): Node<TemplateNodeData> {
  return {
    id,
    position: { x, y },
    type: 'textBlock',
    data: {
      nodeType: 'textBlock',
      label,
      content: value,
      text: value,
      value
    }
  };
}

function weightedChoiceNode(
  id: string,
  x: number,
  y: number,
  label: string,
  options: Array<{ id: string; text: string; weight: number; hasBranch?: boolean }>
): Node<TemplateNodeData> {
  return {
    id,
    position: { x, y },
    type: 'weightedChoice',
    data: {
      nodeType: 'weightedChoice',
      label,
      options,
      value: JSON.stringify({ options, title: label })
    }
  };
}

function concatNode(id: string, x: number, y: number, label: string): Node<TemplateNodeData> {
  return {
    id,
    position: { x, y },
    type: 'concat',
    data: {
      nodeType: 'concat',
      label,
      separator: ', ',
      value: ', '
    }
  };
}

function outputNode(id: string, x: number, y: number, outputName: string): Node<TemplateNodeData> {
  return {
    id,
    position: { x, y },
    type: 'output',
    data: {
      nodeType: 'output',
      outputName,
      label: 'Output'
    }
  };
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

const vehicleFamilyTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'vehicle-dna',
      80,
      110,
      'Family DNA',
      'Late-70s compact sedan, practical silhouette, restrained trim, documentary still'
    ),
    weightedChoiceNode('vehicle-color', 430, 40, 'Paint Family', [
      { id: 'color-1', text: 'faded cream', weight: 35 },
      { id: 'color-2', text: 'oxidized blue', weight: 35 },
      { id: 'color-3', text: 'sunburnt tan', weight: 30 }
    ]),
    weightedChoiceNode('vehicle-wear', 430, 230, 'Wear Level', [
      { id: 'wear-1', text: 'light commuter wear', weight: 40 },
      { id: 'wear-2', text: 'sun-cracked trim', weight: 35 },
      { id: 'wear-3', text: 'patched daily beater', weight: 25 }
    ]),
    concatNode('vehicle-join', 820, 125, 'Resolve Family Member'),
    outputNode('vehicle-output', 1140, 125, 'vehicle_family_member')
  ],
  edges: [
    {
      id: 'vehicle-e1',
      source: 'vehicle-dna',
      target: 'vehicle-join',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'vehicle-e2',
      source: 'vehicle-color',
      target: 'vehicle-join',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'vehicle-e3',
      source: 'vehicle-wear',
      target: 'vehicle-output',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    },
    {
      id: 'vehicle-e4',
      source: 'vehicle-join',
      target: 'vehicle-output',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    }
  ]
};

const buildingFamilyTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'building-dna',
      80,
      120,
      'Family DNA',
      'Weathered urban storefront, fixed era signage scale, brick-and-glass facade, lived-in realism'
    ),
    weightedChoiceNode('building-signage', 430, 50, 'Signage Variation', [
      { id: 'sign-1', text: 'hand-painted discount lettering', weight: 35 },
      { id: 'sign-2', text: 'sun-faded neon remnant', weight: 30 },
      { id: 'sign-3', text: 'patched vinyl replacement sign', weight: 35 }
    ]),
    weightedChoiceNode('building-window', 430, 250, 'Window Dressing', [
      { id: 'window-1', text: 'crowded display table', weight: 40 },
      { id: 'window-2', text: 'half-empty practical stock', weight: 35 },
      { id: 'window-3', text: 'papered-over corner glass', weight: 25 }
    ]),
    concatNode('building-join', 820, 145, 'Resolve Family Member'),
    outputNode('building-output', 1140, 145, 'building_family_member')
  ],
  edges: [
    {
      id: 'building-e1',
      source: 'building-dna',
      target: 'building-join',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'building-e2',
      source: 'building-signage',
      target: 'building-join',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'building-e3',
      source: 'building-window',
      target: 'building-output',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    },
    {
      id: 'building-e4',
      source: 'building-join',
      target: 'building-output',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    }
  ]
};

const branchingFamilyTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'monster-dna',
      60,
      150,
      'Archetype DNA',
      'Monster-truck creature hybrid, oversized tires, toothy grill face, arena-show bravado, practical destruction realism'
    ),
    weightedChoiceNode('monster-family', 430, 130, 'Monster Truck Type', [
      { id: 'monster-1', text: 'swamp brute', weight: 35, hasBranch: true },
      { id: 'monster-2', text: 'graveyard brawler', weight: 35, hasBranch: true },
      { id: 'monster-3', text: 'desert howl rig', weight: 30, hasBranch: true }
    ]),
    textNode(
      'swamp-scene',
      860,
      20,
      'Swamp Brute Scenario',
      'bog track floodlights, overturned fishing shack props, muddy bite-mark chaos'
    ),
    textNode(
      'graveyard-scene',
      860,
      150,
      'Graveyard Brawler Scenario',
      'demolition derby cemetery set, cracked headstone ramps, roaring midnight crowd'
    ),
    textNode(
      'desert-scene',
      860,
      280,
      'Desert Howl Scenario',
      'dust storm jump line, coyote-bone signage, heat shimmer and engine growl'
    ),
    outputNode('monster-output', 1240, 150, 'monster_truck_family_member')
  ],
  edges: [
    {
      id: 'monster-e1',
      source: 'monster-dna',
      target: 'monster-family',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    },
    {
      id: 'monster-e2',
      source: 'monster-family',
      target: 'swamp-scene',
      type: 'smoothstep',
      sourceHandle: 'branch-0',
      targetHandle: 'target'
    },
    {
      id: 'monster-e3',
      source: 'monster-family',
      target: 'graveyard-scene',
      type: 'smoothstep',
      sourceHandle: 'branch-1',
      targetHandle: 'target'
    },
    {
      id: 'monster-e4',
      source: 'monster-family',
      target: 'desert-scene',
      type: 'smoothstep',
      sourceHandle: 'branch-2',
      targetHandle: 'target'
    },
    {
      id: 'monster-e5',
      source: 'monster-family',
      target: 'monster-output',
      type: 'smoothstep',
      sourceHandle: 'main',
      targetHandle: 'target'
    }
  ]
};

export const quickStartTemplates: Record<string, QuickStartTemplate> = {
  character_variation: characterTemplate,
  scene_still: vehicleFamilyTemplate,
  crowd_scene: buildingFamilyTemplate,
  branching_family: branchingFamilyTemplate
};
