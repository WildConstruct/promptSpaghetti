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

function concatNode(
  id: string,
  x: number,
  y: number,
  label: string,
  options?: { separator?: string; requireAllInputs?: boolean }
): Node<TemplateNodeData> {
  const separator = options?.separator ?? ', ';
  return {
    id,
    position: { x, y },
    type: 'concat',
    data: {
      nodeType: 'concat',
      label,
      separator,
      requireAllInputs: options?.requireAllInputs === true,
      value: separator
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
        outputName: 'character_family_member',
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
      80,
      280,
      'Archetype DNA',
      'Monster-truck creature hybrid, oversized tires, toothy grill face, arena-show bravado, practical destruction realism'
    ),
    weightedChoiceNode('monster-family', 500, 260, 'Monster Truck Type', [
      { id: 'monster-1', text: 'swamp brute', weight: 35, hasBranch: true },
      { id: 'monster-2', text: 'graveyard brawler', weight: 35, hasBranch: true },
      { id: 'monster-3', text: 'desert howl rig', weight: 30, hasBranch: true }
    ]),
    concatNode('monster-core', 940, 280, 'Resolve Core Family Member'),
    weightedChoiceNode('swamp-details', 1560, 20, 'Swamp Brute Tires', [
      { id: 'swamp-1', text: 'tractor-cleat bog tires', weight: 35 },
      { id: 'swamp-2', text: 'gator-bite paddle tires', weight: 30 },
      { id: 'swamp-3', text: 'mire-trench balloon tires', weight: 35 }
    ]),
    weightedChoiceNode('graveyard-details', 1560, 280, 'Graveyard Brawler Exhaust', [
      { id: 'grave-1', text: 'coffin-lid side pipes', weight: 35 },
      { id: 'grave-2', text: 'crypt-smoke organ mufflers', weight: 30 },
      { id: 'grave-3', text: 'tomb-vent exhaust horns', weight: 35 }
    ]),
    weightedChoiceNode('desert-details', 1560, 540, 'Desert Howl Rig Lights', [
      { id: 'desert-1', text: 'amber dust-chase light bar', weight: 35 },
      { id: 'desert-2', text: 'sun-bleached rally pods', weight: 30 },
      { id: 'desert-3', text: 'heat-haze roof beacons', weight: 35 }
    ]),
    concatNode('swamp-detail-merge', 1960, 70, 'Swamp Detail Merge', {
      requireAllInputs: true
    }),
    concatNode('graveyard-detail-merge', 1960, 330, 'Graveyard Detail Merge', {
      requireAllInputs: true
    }),
    concatNode('desert-detail-merge', 1960, 590, 'Desert Detail Merge', {
      requireAllInputs: true
    }),
    weightedChoiceNode('swamp-scene', 1560, 150, 'Swamp Brute Scenario', [
      {
        id: 'swamp-scene-1',
        text: 'bog track floodlights with fishing shack wreckage',
        weight: 35
      },
      {
        id: 'swamp-scene-2',
        text: 'mosquito-thick marsh arena with half-sunk boat props',
        weight: 30
      },
      {
        id: 'swamp-scene-3',
        text: 'mudslide jump pit spraying swamp water into the crowd',
        weight: 35
      }
    ]),
    weightedChoiceNode('graveyard-scene', 1560, 410, 'Graveyard Brawler Scenario', [
      {
        id: 'grave-scene-1',
        text: 'demolition cemetery set with cracked headstone ramps',
        weight: 35
      },
      {
        id: 'grave-scene-2',
        text: 'midnight mausoleum arena with lantern haze and roaring fans',
        weight: 30
      },
      {
        id: 'grave-scene-3',
        text: 'grave-dirt oval with coffin barricades and moonlit smoke',
        weight: 35
      }
    ]),
    weightedChoiceNode('desert-scene', 1560, 670, 'Desert Howl Scenario', [
      {
        id: 'desert-scene-1',
        text: 'dust-storm jump line with canyon wall speakers',
        weight: 35
      },
      {
        id: 'desert-scene-2',
        text: 'bone-yard race circle with coyote signage and heat shimmer',
        weight: 30
      },
      {
        id: 'desert-scene-3',
        text: 'sunset drag strip buried in sand plumes and engine howl',
        weight: 35
      }
    ]),
    concatNode('swamp-variant', 2320, 110, 'Swamp Variant', {
      requireAllInputs: true
    }),
    concatNode('graveyard-variant', 2320, 370, 'Graveyard Variant', {
      requireAllInputs: true
    }),
    concatNode('desert-variant', 2320, 630, 'Desert Variant', {
      requireAllInputs: true
    }),
    concatNode('monster-final-merge', 2660, 370, 'Resolve Monster Truck Output'),
    outputNode('monster-output', 3000, 370, 'monster_truck_family_member')
  ],
  edges: [
    {
      id: 'monster-e1',
      source: 'monster-dna',
      target: 'monster-core',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e2',
      source: 'monster-family',
      target: 'monster-core',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e3',
      source: 'monster-family',
      target: 'swamp-details',
      type: 'smoothstep',
      sourceHandle: 'branch-0',
      targetHandle: 'target'
    },
    {
      id: 'monster-e4',
      source: 'monster-family',
      target: 'graveyard-details',
      type: 'smoothstep',
      sourceHandle: 'branch-1',
      targetHandle: 'target'
    },
    {
      id: 'monster-e5',
      source: 'monster-family',
      target: 'desert-details',
      type: 'smoothstep',
      sourceHandle: 'branch-2',
      targetHandle: 'target'
    },
    {
      id: 'monster-e6',
      source: 'monster-core',
      target: 'swamp-detail-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e7',
      source: 'monster-core',
      target: 'graveyard-detail-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e8',
      source: 'monster-core',
      target: 'desert-detail-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e9',
      source: 'swamp-details',
      target: 'swamp-detail-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e10',
      source: 'graveyard-details',
      target: 'graveyard-detail-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e11',
      source: 'desert-details',
      target: 'desert-detail-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e12',
      source: 'swamp-detail-merge',
      target: 'swamp-variant',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e13',
      source: 'swamp-scene',
      target: 'swamp-variant',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e14',
      source: 'graveyard-detail-merge',
      target: 'graveyard-variant',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e15',
      source: 'graveyard-scene',
      target: 'graveyard-variant',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e16',
      source: 'desert-detail-merge',
      target: 'desert-variant',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e17',
      source: 'desert-scene',
      target: 'desert-variant',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e18',
      source: 'swamp-variant',
      target: 'monster-final-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'monster-e19',
      source: 'graveyard-variant',
      target: 'monster-final-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'monster-e20',
      source: 'desert-variant',
      target: 'monster-final-merge',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input3'
    },
    {
      id: 'monster-e21',
      source: 'monster-final-merge',
      target: 'monster-output',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    }
  ]
};

const indyCrowdCardTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'indy-dna',
      80,
      120,
      'Era / Venue DNA',
      '1960s Indianapolis 500 spectator card, documentary race-day realism, full-body single person, neutral card background, clean silhouette for EraCrowd layout'
    ),
    weightedChoiceNode('indy-spectator-role', 520, 20, 'Spectator Role', [
      { id: 'indy-role-1', text: 'grandstand race fan', weight: 35 },
      { id: 'indy-role-2', text: 'pit-lane crew observer', weight: 25 },
      { id: 'indy-role-3', text: 'trackside photographer', weight: 20 },
      { id: 'indy-role-4', text: 'family spectator with program', weight: 20 }
    ]),
    weightedChoiceNode('indy-wardrobe', 520, 220, 'Wardrobe Variation', [
      { id: 'indy-wardrobe-1', text: 'short-sleeve button shirt, slacks, sunglasses', weight: 35 },
      { id: 'indy-wardrobe-2', text: 'light jacket, cap, folded race program', weight: 30 },
      { id: 'indy-wardrobe-3', text: 'crew coveralls, headset around neck', weight: 20 },
      { id: 'indy-wardrobe-4', text: 'summer dress, gloves, small handbag', weight: 15 }
    ]),
    weightedChoiceNode('indy-zone', 520, 420, 'Layout Zone Cue', [
      { id: 'indy-zone-1', text: 'grandstand seated, facing track', weight: 45 },
      { id: 'indy-zone-2', text: 'concourse standing, mid-distance', weight: 25 },
      { id: 'indy-zone-3', text: 'pit wall background extra, three-quarter view', weight: 20 },
      { id: 'indy-zone-4', text: 'VIP box seated, relaxed posture', weight: 10 }
    ]),
    textNode(
      'indy-card-constraints',
      920,
      320,
      'Card Constraints',
      'one person only, feet visible, no duplicate bodies, no modern logos, no car blocking silhouette, no crowd merging into subject'
    ),
    concatNode('indy-join-a', 920, 110, 'Resolve Person'),
    concatNode('indy-join-b', 1260, 250, 'Resolve Card Prompt', {
      requireAllInputs: true
    }),
    outputNode('indy-output', 1600, 250, 'indy_500_crowd_card_prompt')
  ],
  edges: [
    {
      id: 'indy-e1',
      source: 'indy-dna',
      target: 'indy-join-a',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'indy-e2',
      source: 'indy-spectator-role',
      target: 'indy-join-a',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'indy-e3',
      source: 'indy-wardrobe',
      target: 'indy-join-b',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input1'
    },
    {
      id: 'indy-e4',
      source: 'indy-zone',
      target: 'indy-join-b',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input2'
    },
    {
      id: 'indy-e5',
      source: 'indy-join-a',
      target: 'indy-join-b',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input3'
    },
    {
      id: 'indy-e6',
      source: 'indy-card-constraints',
      target: 'indy-join-b',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'input4'
    },
    {
      id: 'indy-e7',
      source: 'indy-join-b',
      target: 'indy-output',
      type: 'smoothstep',
      sourceHandle: 'source',
      targetHandle: 'target'
    }
  ]
};

export const quickStartTemplates: Record<string, QuickStartTemplate> = {
  character_variation: characterTemplate,
  indy_500_crowd_card: indyCrowdCardTemplate,
  vehicle_family: vehicleFamilyTemplate,
  building_family: buildingFamilyTemplate,
  scene_still: vehicleFamilyTemplate,
  crowd_scene: buildingFamilyTemplate,
  branching_family: branchingFamilyTemplate
};
