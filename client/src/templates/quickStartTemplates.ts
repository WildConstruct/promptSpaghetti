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
  options: Array<{
    id: string;
    text: string;
    weight: number;
    hasBranch?: boolean;
    locked?: boolean;
  }>
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

// Anachronistic Tech Panel — recreation of the original HTML generator as a
// branching graph. Demonstrates: a LOCKED "design DNA" choice (aesthetic), a
// MULTI-BRANCH choice (Screen Type → CRT / Vector / No-Screen each take their
// own path; LED falls through the default), and a NESTED branch (the CRT path's
// phosphor choice itself branches on "amber"). Exactly one path fires per roll.
const techPanelTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'tp-dna',
      80,
      120,
      'Panel DNA',
      'Anachronistic technology control panel, retro-futuristic, tangibly from a past era’s vision of the future'
    ),
    // Locked "fixed DNA": the aesthetic is pinned, everything else varies.
    weightedChoiceNode('tp-aesthetic', 80, 320, 'Aesthetic (locked DNA)', [
      { id: 'aes-1', text: 'Star Wars used-future analog', weight: 30 },
      {
        id: 'aes-2',
        text: 'cassette-futurism CRT grit',
        weight: 30,
        locked: true
      },
      { id: 'aes-3', text: 'dieselpunk interwar machinery', weight: 20 },
      { id: 'aes-4', text: 'atompunk raygun-gothic chrome', weight: 20 }
    ]),
    // Panel archetype — one option branches to a reactor detail.
    weightedChoiceNode('tp-archetype', 480, 120, 'Panel Archetype', [
      { id: 'arch-1', text: 'cockpit control surface', weight: 35 },
      { id: 'arch-2', text: 'bridge command console', weight: 35 },
      {
        id: 'arch-3',
        text: 'engineering reactor panel',
        weight: 30,
        hasBranch: true
      }
    ]),
    weightedChoiceNode('tp-reactor', 900, 40, 'Reactor Detail', [
      { id: 'rx-1', text: 'with a glowing fusion core behind armored glass', weight: 34 },
      { id: 'rx-2', text: 'with a brass valve cluster and pressure gauges', weight: 33 },
      { id: 'rx-3', text: 'with exposed coolant pipes and warning placards', weight: 33 }
    ]),
    concatNode('tp-archetype-merge', 1320, 120, 'Archetype Merge'),
    // Screen Type — the multi-branch node.
    weightedChoiceNode('tp-screen', 480, 440, 'Screen Type', [
      { id: 'scr-1', text: 'a monochrome CRT', weight: 30, hasBranch: true },
      { id: 'scr-2', text: 'a flickering vector display', weight: 25, hasBranch: true },
      { id: 'scr-3', text: 'red/green LED segment readouts', weight: 25 },
      {
        id: 'scr-4',
        text: 'no digital screen at all',
        weight: 20,
        hasBranch: true
      }
    ]),
    // Nested branch: CRT phosphor choice branches again on "amber".
    weightedChoiceNode('tp-crt-color', 900, 320, 'CRT Phosphor', [
      { id: 'crt-1', text: 'in cold green phosphor', weight: 35 },
      { id: 'crt-2', text: 'in warm amber phosphor', weight: 35, hasBranch: true },
      { id: 'crt-3', text: 'in pale blue-gray phosphor', weight: 30 }
    ]),
    textNode(
      'tp-amber-special',
      1320,
      360,
      'Amber Flourish',
      'with rolling scan-line flicker and a burnt-amber glow that hazes the labels'
    ),
    concatNode('tp-crt-merge', 1320, 480, 'CRT Merge'),
    textNode(
      'tp-vector-detail',
      900,
      560,
      'Vector Detail',
      'drawing wireframe shapes in thin, jittering glowing lines'
    ),
    textNode(
      'tp-noscreen',
      900,
      720,
      'No-Screen Detail',
      '— relying entirely on physical gauges, analog dials, and indicator lights'
    ),
    concatNode('tp-screen-merge', 1760, 480, 'Screen Merge'),
    concatNode('tp-main', 2160, 300, 'Assemble Panel'),
    outputNode('tp-output', 2520, 300, 'anachronistic_tech_panel')
  ],
  edges: [
    // DNA + aesthetic into the main assembly.
    { id: 'tp-e1', source: 'tp-dna', target: 'tp-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'tp-e2', source: 'tp-aesthetic', target: 'tp-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    // Archetype: default + reactor branch -> archetype merge -> main.
    { id: 'tp-e3', source: 'tp-archetype', target: 'tp-archetype-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'tp-e4', source: 'tp-archetype', target: 'tp-reactor', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'tp-e5', source: 'tp-reactor', target: 'tp-archetype-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'tp-e6', source: 'tp-archetype-merge', target: 'tp-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    // Screen: three branches + the LED default, all merging into screen-merge.
    { id: 'tp-e7', source: 'tp-screen', target: 'tp-crt-color', type: 'smoothstep', sourceHandle: 'branch-0', targetHandle: 'target' },
    { id: 'tp-e8', source: 'tp-screen', target: 'tp-vector-detail', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'tp-e9', source: 'tp-screen', target: 'tp-noscreen', type: 'smoothstep', sourceHandle: 'branch-3', targetHandle: 'target' },
    { id: 'tp-e10', source: 'tp-screen', target: 'tp-screen-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    // Nested: CRT phosphor default + amber branch -> crt-merge -> screen-merge.
    { id: 'tp-e11', source: 'tp-crt-color', target: 'tp-crt-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'tp-e12', source: 'tp-crt-color', target: 'tp-amber-special', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'tp-e13', source: 'tp-amber-special', target: 'tp-crt-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'tp-e14', source: 'tp-crt-merge', target: 'tp-screen-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'tp-e15', source: 'tp-vector-detail', target: 'tp-screen-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'tp-e16', source: 'tp-noscreen', target: 'tp-screen-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'tp-e17', source: 'tp-screen-merge', target: 'tp-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    // Final assembly.
    { id: 'tp-e18', source: 'tp-main', target: 'tp-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Modular Tile Builder — recreation of the original city-tile randomizer.
// Locked block-scale "DNA", a multi-branch structure type (skyscraper → style,
// derelict row → decay), and a nested branch (decay → fire-gutted → scorch).
const tileBuilderTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'tile-dna',
      80,
      120,
      'Tile DNA',
      'Modular city tile, isometric game-ready render, clean neutral lighting'
    ),
    weightedChoiceNode('tile-scale', 80, 340, 'Block Scale (locked DNA)', [
      { id: 'sc-1', text: 'a single prominent building facade', weight: 25 },
      {
        id: 'sc-2',
        text: 'a row of 3–4 varied building facades',
        weight: 25,
        locked: true
      },
      { id: 'sc-3', text: 'a half city block of facades', weight: 25 },
      { id: 'sc-4', text: 'a dense cluster of towers', weight: 25 }
    ]),
    weightedChoiceNode('tile-type', 480, 200, 'Primary Structure', [
      { id: 'ty-1', text: 'a modern apartment building', weight: 25 },
      { id: 'ty-2', text: 'a cozy corner bookstore', weight: 20 },
      { id: 'ty-3', text: 'a skyscraper', weight: 20, hasBranch: true },
      { id: 'ty-4', text: 'a run-down derelict row', weight: 20, hasBranch: true },
      { id: 'ty-5', text: 'an art gallery', weight: 15 }
    ]),
    weightedChoiceNode('tile-sky-style', 900, 60, 'Skyscraper Style', [
      { id: 'sk-1', text: 'clad in a glass curtain wall', weight: 34 },
      { id: 'sk-2', text: 'in brutalist board-formed concrete', weight: 33 },
      { id: 'sk-3', text: 'with art-deco stepped setbacks', weight: 33 }
    ]),
    weightedChoiceNode('tile-decay', 900, 300, 'Decay State', [
      { id: 'dk-1', text: 'with boarded-up windows and faded signage', weight: 35 },
      { id: 'dk-2', text: 'fire-gutted', weight: 30, hasBranch: true },
      { id: 'dk-3', text: 'overgrown with vines and rust', weight: 35 }
    ]),
    textNode(
      'tile-fire-detail',
      1320,
      340,
      'Fire Detail',
      '— scorched brick, collapsed roof beams, and soot-streaked walls'
    ),
    concatNode('tile-decay-merge', 1320, 460, 'Decay Merge'),
    concatNode('tile-type-merge', 1760, 300, 'Structure Merge'),
    weightedChoiceNode('tile-height', 480, 480, 'Height', [
      { id: 'ht-1', text: '2 stories tall', weight: 30 },
      { id: 'ht-2', text: '5 stories tall', weight: 30 },
      { id: 'ht-3', text: '20 stories tall', weight: 25 },
      { id: 'ht-4', text: '50+ stories tall', weight: 15 }
    ]),
    weightedChoiceNode('tile-context', 480, 660, 'Urban Context', [
      { id: 'cx-1', text: 'in a busy downtown core', weight: 34 },
      { id: 'cx-2', text: 'on a quiet residential street', weight: 33 },
      { id: 'cx-3', text: 'along a gritty industrial edge', weight: 33 }
    ]),
    concatNode('tile-main', 2160, 360, 'Assemble Tile'),
    outputNode('tile-output', 2520, 360, 'modular_city_tile')
  ],
  edges: [
    { id: 'tl-e1', source: 'tile-dna', target: 'tile-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'tl-e2', source: 'tile-scale', target: 'tile-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    // Structure: default + skyscraper branch + derelict branch -> structure merge.
    { id: 'tl-e3', source: 'tile-type', target: 'tile-type-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'tl-e4', source: 'tile-type', target: 'tile-sky-style', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'tl-e5', source: 'tile-sky-style', target: 'tile-type-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'tl-e6', source: 'tile-type', target: 'tile-decay', type: 'smoothstep', sourceHandle: 'branch-3', targetHandle: 'target' },
    // Nested: decay default + fire branch -> decay merge -> structure merge.
    { id: 'tl-e7', source: 'tile-decay', target: 'tile-decay-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'tl-e8', source: 'tile-decay', target: 'tile-fire-detail', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'tl-e9', source: 'tile-fire-detail', target: 'tile-decay-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'tl-e10', source: 'tile-decay-merge', target: 'tile-type-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'tl-e11', source: 'tile-type-merge', target: 'tile-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    // Height + context.
    { id: 'tl-e12', source: 'tile-height', target: 'tile-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'tl-e13', source: 'tile-context', target: 'tile-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'tl-e14', source: 'tile-main', target: 'tile-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// 1930s Chicago Gangsters — locked rank "DNA", multi-branch role (enforcer →
// weapon, speakeasy owner → venue), and a nested branch (Tommy gun → drum mag).
const gangsterTemplate: QuickStartTemplate = {
  nodes: [
    textNode(
      'gang-dna',
      80,
      100,
      'Gangster DNA',
      '1930s Chicago gangster, Prohibition era, sharp period detail, cinematic film-noir lighting'
    ),
    weightedChoiceNode('gang-rank', 80, 320, 'Rank (locked DNA)', [
      { id: 'rk-1', text: 'a low street tough', weight: 25 },
      { id: 'rk-2', text: 'a made man', weight: 25, locked: true },
      { id: 'rk-3', text: 'a ranking capo', weight: 25 },
      { id: 'rk-4', text: 'the crime boss himself', weight: 25 }
    ]),
    weightedChoiceNode('gang-role', 480, 180, 'Role', [
      { id: 'ro-1', text: 'working as a bootlegger', weight: 28 },
      { id: 'ro-2', text: 'serving as an enforcer', weight: 24, hasBranch: true },
      { id: 'ro-3', text: 'running a speakeasy', weight: 24, hasBranch: true },
      { id: 'ro-4', text: 'driving the getaway car', weight: 24 }
    ]),
    weightedChoiceNode('gang-weapon', 900, 60, 'Enforcer Weapon', [
      { id: 'wp-1', text: 'cradling a Thompson submachine gun', weight: 34, hasBranch: true },
      { id: 'wp-2', text: 'with brass knuckles and a switchblade', weight: 33 },
      { id: 'wp-3', text: 'holding a sawed-off shotgun', weight: 33 }
    ]),
    textNode(
      'gang-mag',
      1320,
      20,
      'Magazine Detail',
      'fed by a fat 50-round drum magazine'
    ),
    concatNode('gang-weapon-merge', 1320, 140, 'Weapon Merge'),
    weightedChoiceNode('gang-venue', 900, 320, 'Speakeasy Venue', [
      { id: 'vn-1', text: 'a smoky backroom jazz club', weight: 34 },
      { id: 'vn-2', text: 'a basement card den', weight: 33 },
      { id: 'vn-3', text: 'a hotel-suite blind pig', weight: 33 }
    ]),
    concatNode('gang-role-merge', 1720, 240, 'Role Merge'),
    weightedChoiceNode('gang-attire', 480, 460, 'Attire', [
      { id: 'at-1', text: 'in a double-breasted pinstripe suit', weight: 34 },
      { id: 'at-2', text: 'in a fedora and long wool overcoat', weight: 33 },
      { id: 'at-3', text: 'in a waistcoat with sleeves rolled up', weight: 33 }
    ]),
    weightedChoiceNode('gang-scene', 480, 640, 'Scene', [
      { id: 'sn-1', text: 'on a rain-slicked brick alley at night', weight: 34 },
      { id: 'sn-2', text: 'in a dim speakeasy backroom', weight: 33 },
      { id: 'sn-3', text: 'on a snow-dusted street outside a flophouse', weight: 33 }
    ]),
    concatNode('gang-main', 2120, 320, 'Assemble Gangster'),
    outputNode('gang-output', 2480, 320, 'chicago_gangster')
  ],
  edges: [
    { id: 'g-e1', source: 'gang-dna', target: 'gang-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'g-e2', source: 'gang-rank', target: 'gang-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'g-e3', source: 'gang-role', target: 'gang-role-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'g-e4', source: 'gang-role', target: 'gang-weapon', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'g-e5', source: 'gang-role', target: 'gang-venue', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    // Nested: Tommy gun branches to the drum-mag detail.
    { id: 'g-e6', source: 'gang-weapon', target: 'gang-weapon-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'g-e7', source: 'gang-weapon', target: 'gang-mag', type: 'smoothstep', sourceHandle: 'branch-0', targetHandle: 'target' },
    { id: 'g-e8', source: 'gang-mag', target: 'gang-weapon-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'g-e9', source: 'gang-weapon-merge', target: 'gang-role-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'g-e10', source: 'gang-venue', target: 'gang-role-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'g-e11', source: 'gang-role-merge', target: 'gang-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'g-e12', source: 'gang-attire', target: 'gang-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'g-e13', source: 'gang-scene', target: 'gang-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'g-e14', source: 'gang-main', target: 'gang-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Chicago Underworld — Skill Trees. Advanced branching-on-branching: a locked
// era, then employment (Trade) where EVERY option opens its own skill tree, and
// inside each tree a role can branch AGAIN into a specialty. Three levels deep:
// trade -> role -> specialty. One graph that randomizes every kind of person in
// the world.
const underworldTemplate: QuickStartTemplate = {
  nodes: [
    textNode('uw-dna', 80, 120, 'Underworld DNA', '1930s Chicago underworld, Prohibition era, gritty film-noir period photograph, single full-body character'),
    weightedChoiceNode('uw-era', 80, 340, 'Era (locked DNA)', [
      { id: 'er-1', text: 'in the early Prohibition years', weight: 25 },
      { id: 'er-2', text: 'at the height of the bootleg wars', weight: 25, locked: true },
      { id: 'er-3', text: 'in the last days before Repeal', weight: 25 },
      { id: 'er-4', text: 'in the lean years after the Crash', weight: 25 }
    ]),
    weightedChoiceNode('uw-trade', 480, 300, 'Trade', [
      { id: 'tr-1', text: 'working the river docks', weight: 33, hasBranch: true },
      { id: 'tr-2', text: 'in a bank-robbing crew', weight: 34, hasBranch: true },
      { id: 'tr-3', text: 'running bootleg liquor', weight: 33, hasBranch: true }
    ]),
    weightedChoiceNode('uw-dock-role', 900, 60, 'Dock Role', [
      { id: 'dk-1', text: 'as a brawny stevedore hauling crates', weight: 34 },
      { id: 'dk-2', text: 'as a pier union enforcer', weight: 33, hasBranch: true },
      { id: 'dk-3', text: 'as a smuggler-handler waving cargo through', weight: 33 }
    ]),
    weightedChoiceNode('uw-dock-spec', 1320, 20, 'Enforcer Edge', [
      { id: 'ds-1', text: 'a steel cargo hook hanging from his belt', weight: 50 },
      { id: 'ds-2', text: 'two dockside goons at his back', weight: 50 }
    ]),
    concatNode('uw-dock-merge', 1320, 160, 'Dock Merge'),
    weightedChoiceNode('uw-heist-role', 900, 300, 'Heist Role', [
      { id: 'hk-1', text: 'as the steady wheelman at the curb', weight: 34 },
      { id: 'hk-2', text: 'as the safecracker with the golden touch', weight: 33, hasBranch: true },
      { id: 'hk-3', text: 'as the lookout posted across the street', weight: 33 }
    ]),
    weightedChoiceNode('uw-heist-spec', 1320, 300, 'Cracking Method', [
      { id: 'hs-1', text: 'reading the tumblers by ear', weight: 34 },
      { id: 'hs-2', text: 'blowing the door with nitroglycerin', weight: 33 },
      { id: 'hs-3', text: 'punching the dial clean off the safe', weight: 33 }
    ]),
    concatNode('uw-heist-merge', 1320, 440, 'Heist Merge'),
    weightedChoiceNode('uw-boot-role', 900, 560, 'Bootleg Role', [
      { id: 'bk-1', text: 'as a backwoods still-runner', weight: 34 },
      { id: 'bk-2', text: 'as a speakeasy fixer greasing the law', weight: 33, hasBranch: true },
      { id: 'bk-3', text: 'as a rum-row pilot meeting the ships offshore', weight: 33 }
    ]),
    weightedChoiceNode('uw-boot-spec', 1320, 560, 'Payoff', [
      { id: 'bs-1', text: 'slipping envelopes to the beat cop', weight: 50 },
      { id: 'bs-2', text: 'with the precinct captain on his payroll', weight: 50 }
    ]),
    concatNode('uw-boot-merge', 1320, 700, 'Bootleg Merge'),
    concatNode('uw-trade-merge', 1720, 380, 'Trade Merge'),
    weightedChoiceNode('uw-build', 480, 520, 'Build', [
      { id: 'bd-1', text: 'lean and wiry', weight: 34 },
      { id: 'bd-2', text: 'thick-necked and heavy-set', weight: 33 },
      { id: 'bd-3', text: 'average and forgettable', weight: 33 }
    ]),
    weightedChoiceNode('uw-attire', 480, 680, 'Attire', [
      { id: 'aw-1', text: 'in a rumpled three-piece suit', weight: 34 },
      { id: 'aw-2', text: 'in a flat cap and rough work clothes', weight: 33 },
      { id: 'aw-3', text: 'in shirtsleeves and suspenders', weight: 33 }
    ]),
    weightedChoiceNode('uw-scene', 480, 840, 'Scene', [
      { id: 'sw-1', text: 'in a rain-slicked brick alley', weight: 34 },
      { id: 'sw-2', text: 'on a foggy dockside at dawn', weight: 33 },
      { id: 'sw-3', text: 'in a smoke-filled speakeasy backroom', weight: 33 }
    ]),
    concatNode('uw-main', 2120, 420, 'Assemble Character'),
    outputNode('uw-output', 2480, 420, 'underworld_character')
  ],
  edges: [
    { id: 'u-e1', source: 'uw-dna', target: 'uw-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'u-e2', source: 'uw-era', target: 'uw-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'u-e3', source: 'uw-trade', target: 'uw-trade-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'u-e4', source: 'uw-trade', target: 'uw-dock-role', type: 'smoothstep', sourceHandle: 'branch-0', targetHandle: 'target' },
    { id: 'u-e5', source: 'uw-trade', target: 'uw-heist-role', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'u-e6', source: 'uw-trade', target: 'uw-boot-role', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'u-e7', source: 'uw-dock-role', target: 'uw-dock-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'u-e8', source: 'uw-dock-role', target: 'uw-dock-spec', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'u-e9', source: 'uw-dock-spec', target: 'uw-dock-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'u-e10', source: 'uw-dock-merge', target: 'uw-trade-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'u-e11', source: 'uw-heist-role', target: 'uw-heist-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'u-e12', source: 'uw-heist-role', target: 'uw-heist-spec', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'u-e13', source: 'uw-heist-spec', target: 'uw-heist-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'u-e14', source: 'uw-heist-merge', target: 'uw-trade-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'u-e15', source: 'uw-boot-role', target: 'uw-boot-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'u-e16', source: 'uw-boot-role', target: 'uw-boot-spec', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'u-e17', source: 'uw-boot-spec', target: 'uw-boot-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'u-e18', source: 'uw-boot-merge', target: 'uw-trade-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'u-e19', source: 'uw-trade-merge', target: 'uw-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'u-e20', source: 'uw-build', target: 'uw-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'u-e21', source: 'uw-attire', target: 'uw-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'u-e22', source: 'uw-scene', target: 'uw-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input6' },
    { id: 'u-e23', source: 'uw-main', target: 'uw-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Baseball Game Attendees — locked era "DNA", multi-branch fan type (superfan
// -> gear, vendor -> cart), nested branch (superfan painted-face -> team colors).
const baseballTemplate: QuickStartTemplate = {
  nodes: [
    textNode('bb-dna', 80, 100, 'Spectator DNA', 'Baseball game spectator, single full-body card, sunny afternoon at the ballpark, candid documentary photo'),
    weightedChoiceNode('bb-era', 80, 320, 'Era (locked DNA)', [
      { id: 'be-1', text: 'in the 1950s', weight: 25 },
      { id: 'be-2', text: 'in the 1970s', weight: 25, locked: true },
      { id: 'be-3', text: 'in the 1990s', weight: 25 },
      { id: 'be-4', text: 'in the present day', weight: 25 }
    ]),
    weightedChoiceNode('bb-fan', 480, 180, 'Fan Type', [
      { id: 'bf-1', text: 'a casual weekend fan', weight: 28 },
      { id: 'bf-2', text: 'a die-hard superfan', weight: 24, hasBranch: true },
      { id: 'bf-3', text: 'a roving stadium vendor', weight: 24, hasBranch: true },
      { id: 'bf-4', text: 'a parent with two kids', weight: 24 }
    ]),
    weightedChoiceNode('bb-gear', 900, 60, 'Superfan Gear', [
      { id: 'bg-1', text: 'waving a giant foam finger', weight: 34 },
      { id: 'bg-2', text: 'with a fully painted face', weight: 33, hasBranch: true },
      { id: 'bg-3', text: 'in a replica jersey and cap', weight: 33 }
    ]),
    textNode('bb-colors', 1320, 20, 'Team Colors', 'in bold home-team colors of red, white, and navy'),
    concatNode('bb-gear-merge', 1320, 140, 'Gear Merge'),
    weightedChoiceNode('bb-cart', 900, 320, 'Vendor Cart', [
      { id: 'bc-1', text: 'hawking hot dogs from a steam cart', weight: 34 },
      { id: 'bc-2', text: 'selling peanuts and Cracker Jack', weight: 33 },
      { id: 'bc-3', text: 'balancing a tray of cold beer', weight: 33 }
    ]),
    concatNode('bb-fan-merge', 1720, 240, 'Fan Merge'),
    weightedChoiceNode('bb-attire', 480, 460, 'Attire', [
      { id: 'ba-1', text: 'in a short-sleeve button-up and ballcap', weight: 34 },
      { id: 'ba-2', text: 'in a team windbreaker', weight: 33 },
      { id: 'ba-3', text: 'in a sun hat and sunglasses', weight: 33 }
    ]),
    weightedChoiceNode('bb-seat', 480, 640, 'Vantage', [
      { id: 'bs-1', text: 'in the lower-bowl box seats', weight: 34 },
      { id: 'bs-2', text: 'up in the bleachers', weight: 33 },
      { id: 'bs-3', text: 'leaning on the outfield rail', weight: 33 }
    ]),
    concatNode('bb-main', 2120, 320, 'Assemble Spectator'),
    outputNode('bb-output', 2480, 320, 'baseball_spectator')
  ],
  edges: [
    { id: 'b-e1', source: 'bb-dna', target: 'bb-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'b-e2', source: 'bb-era', target: 'bb-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'b-e3', source: 'bb-fan', target: 'bb-fan-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'b-e4', source: 'bb-fan', target: 'bb-gear', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'b-e5', source: 'bb-fan', target: 'bb-cart', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'b-e6', source: 'bb-gear', target: 'bb-gear-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'b-e7', source: 'bb-gear', target: 'bb-colors', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'b-e8', source: 'bb-colors', target: 'bb-gear-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'b-e9', source: 'bb-gear-merge', target: 'bb-fan-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'b-e10', source: 'bb-cart', target: 'bb-fan-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'b-e11', source: 'bb-fan-merge', target: 'bb-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'b-e12', source: 'bb-attire', target: 'bb-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'b-e13', source: 'bb-seat', target: 'bb-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'b-e14', source: 'bb-main', target: 'bb-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Punk Concert Goers — locked scene "DNA", multi-branch look (mohawk -> color,
// spikes -> texture), nested branch (mohawk -> bleached -> roots detail).
const punkTemplate: QuickStartTemplate = {
  nodes: [
    textNode('pk-dna', 80, 100, 'Punk DNA', '1980s punk concert goer at a sweaty basement show, gritty on-camera flash photography'),
    weightedChoiceNode('pk-scene', 80, 320, 'Scene (locked DNA)', [
      { id: 'ps-1', text: 'from the UK street-punk scene', weight: 25 },
      { id: 'ps-2', text: 'from the US hardcore scene', weight: 25, locked: true },
      { id: 'ps-3', text: 'from the deathrock scene', weight: 25 },
      { id: 'ps-4', text: 'from the skate-punk scene', weight: 25 }
    ]),
    weightedChoiceNode('pk-look', 480, 180, 'Hair / Look', [
      { id: 'pl-1', text: 'with a shaved head and a denim vest', weight: 28 },
      { id: 'pl-2', text: 'sporting a tall mohawk', weight: 24, hasBranch: true },
      { id: 'pl-3', text: 'with liberty spikes', weight: 24, hasBranch: true },
      { id: 'pl-4', text: 'in a studded leather jacket', weight: 24 }
    ]),
    weightedChoiceNode('pk-color', 900, 60, 'Mohawk Color', [
      { id: 'pc-1', text: 'bleached white-blond', weight: 34, hasBranch: true },
      { id: 'pc-2', text: 'dyed electric green', weight: 33 },
      { id: 'pc-3', text: 'kept jet black', weight: 33 }
    ]),
    textNode('pk-roots', 1320, 20, 'Roots Detail', 'with dark roots showing through the bleach'),
    concatNode('pk-look-detail-merge', 1320, 140, 'Look Detail Merge'),
    weightedChoiceNode('pk-spikes', 900, 320, 'Spike Texture', [
      { id: 'pp-1', text: 'glued into razor-sharp points', weight: 34 },
      { id: 'pp-2', text: 'tipped in fluorescent dye', weight: 33 },
      { id: 'pp-3', text: 'wild and uneven', weight: 33 }
    ]),
    concatNode('pk-look-merge', 1720, 240, 'Look Merge'),
    weightedChoiceNode('pk-act', 480, 460, 'Activity', [
      { id: 'pa-1', text: 'thrashing in the mosh pit', weight: 34 },
      { id: 'pa-2', text: 'mid stage-dive over the crowd', weight: 33 },
      { id: 'pa-3', text: 'shouting along at the barricade', weight: 33 }
    ]),
    weightedChoiceNode('pk-extra', 480, 640, 'Detail', [
      { id: 'px-1', text: 'covered in band-patch pins', weight: 34 },
      { id: 'px-2', text: 'with smeared eyeliner and sweat', weight: 33 },
      { id: 'px-3', text: 'gripping a crushed beer can', weight: 33 }
    ]),
    concatNode('pk-main', 2120, 320, 'Assemble Punk'),
    outputNode('pk-output', 2480, 320, 'punk_concertgoer')
  ],
  edges: [
    { id: 'p-e1', source: 'pk-dna', target: 'pk-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'p-e2', source: 'pk-scene', target: 'pk-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'p-e3', source: 'pk-look', target: 'pk-look-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'p-e4', source: 'pk-look', target: 'pk-color', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'p-e5', source: 'pk-look', target: 'pk-spikes', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'p-e6', source: 'pk-color', target: 'pk-look-detail-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'p-e7', source: 'pk-color', target: 'pk-roots', type: 'smoothstep', sourceHandle: 'branch-0', targetHandle: 'target' },
    { id: 'p-e8', source: 'pk-roots', target: 'pk-look-detail-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'p-e9', source: 'pk-look-detail-merge', target: 'pk-look-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'p-e10', source: 'pk-spikes', target: 'pk-look-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'p-e11', source: 'pk-look-merge', target: 'pk-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'p-e12', source: 'pk-act', target: 'pk-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'p-e13', source: 'pk-extra', target: 'pk-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'p-e14', source: 'pk-main', target: 'pk-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Diner Patrons — locked time-of-day "DNA", multi-branch patron (trucker -> meal,
// teen -> milkshake), nested branch (trucker blue-plate -> gravy detail).
const dinerTemplate: QuickStartTemplate = {
  nodes: [
    textNode('dn-dna', 80, 100, 'Diner DNA', '1950s American roadside diner patron, chrome-and-vinyl booth, warm tungsten light, candid photo'),
    weightedChoiceNode('dn-time', 80, 320, 'Time of Day (locked DNA)', [
      { id: 'dt-1', text: 'at the early-morning rush', weight: 25 },
      { id: 'dt-2', text: 'in the dead of a late night', weight: 25, locked: true },
      { id: 'dt-3', text: 'during the lunch rush', weight: 25 },
      { id: 'dt-4', text: 'at a slow afternoon lull', weight: 25 }
    ]),
    weightedChoiceNode('dn-patron', 480, 180, 'Patron', [
      { id: 'dp-1', text: 'a tired night-shift nurse', weight: 28 },
      { id: 'dp-2', text: 'a long-haul trucker', weight: 24, hasBranch: true },
      { id: 'dp-3', text: 'a teen couple on a date', weight: 24, hasBranch: true },
      { id: 'dp-4', text: 'a traveling salesman', weight: 24 }
    ]),
    weightedChoiceNode('dn-meal', 900, 60, "Trucker's Meal", [
      { id: 'dm-1', text: 'over a tall stack of pancakes', weight: 34 },
      { id: 'dm-2', text: 'eating the blue-plate special', weight: 33, hasBranch: true },
      { id: 'dm-3', text: 'nursing black coffee and pie', weight: 33 }
    ]),
    textNode('dn-gravy', 1320, 20, 'Gravy Detail', 'smothered in thick country gravy'),
    concatNode('dn-meal-merge', 1320, 140, 'Meal Merge'),
    weightedChoiceNode('dn-shake', 900, 320, 'Shared Milkshake', [
      { id: 'dk-1', text: 'sharing a strawberry malt with two straws', weight: 34 },
      { id: 'dk-2', text: 'splitting a hot-fudge sundae', weight: 33 },
      { id: 'dk-3', text: 'over a single cherry cola', weight: 33 }
    ]),
    concatNode('dn-patron-merge', 1720, 240, 'Patron Merge'),
    weightedChoiceNode('dn-attire', 480, 460, 'Attire', [
      { id: 'da-1', text: 'in a worn work jacket', weight: 34 },
      { id: 'da-2', text: 'in a letterman sweater', weight: 33 },
      { id: 'da-3', text: 'in a rumpled suit and loosened tie', weight: 33 }
    ]),
    weightedChoiceNode('dn-mood', 480, 640, 'Mood', [
      { id: 'do-1', text: 'looking weary under the neon', weight: 34 },
      { id: 'do-2', text: 'laughing at the counter', weight: 33 },
      { id: 'do-3', text: 'staring out at the rainy lot', weight: 33 }
    ]),
    concatNode('dn-main', 2120, 320, 'Assemble Patron'),
    outputNode('dn-output', 2480, 320, 'diner_patron')
  ],
  edges: [
    { id: 'd-e1', source: 'dn-dna', target: 'dn-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'd-e2', source: 'dn-time', target: 'dn-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'd-e3', source: 'dn-patron', target: 'dn-patron-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'd-e4', source: 'dn-patron', target: 'dn-meal', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'd-e5', source: 'dn-patron', target: 'dn-shake', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'd-e6', source: 'dn-meal', target: 'dn-meal-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'd-e7', source: 'dn-meal', target: 'dn-gravy', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'd-e8', source: 'dn-gravy', target: 'dn-meal-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'd-e9', source: 'dn-meal-merge', target: 'dn-patron-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'd-e10', source: 'dn-shake', target: 'dn-patron-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'd-e11', source: 'dn-patron-merge', target: 'dn-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'd-e12', source: 'dn-attire', target: 'dn-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'd-e13', source: 'dn-mood', target: 'dn-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'd-e14', source: 'dn-main', target: 'dn-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Spaghetti Western Character — locked town "DNA", multi-branch archetype (bounty
// hunter -> weapon, stranger -> poncho), nested branch (twin revolvers -> engraving).
const westernTemplate: QuickStartTemplate = {
  nodes: [
    textNode('ws-dna', 80, 100, 'Western DNA', 'Spaghetti western character, sun-bleached frontier, Sergio Leone wide-angle grit, dust and heat haze'),
    weightedChoiceNode('ws-town', 80, 320, 'Setting (locked DNA)', [
      { id: 'wt-1', text: 'in a dusty border town', weight: 25, locked: true },
      { id: 'wt-2', text: 'at a remote mining camp', weight: 25 },
      { id: 'wt-3', text: 'by a lonely railroad outpost', weight: 25 },
      { id: 'wt-4', text: 'at a sun-scorched crossroads', weight: 25 }
    ]),
    weightedChoiceNode('ws-arch', 480, 180, 'Archetype', [
      { id: 'wa-1', text: 'a grizzled town sheriff', weight: 28 },
      { id: 'wa-2', text: 'a hardened bounty hunter', weight: 24, hasBranch: true },
      { id: 'wa-3', text: 'a mysterious stranger', weight: 24, hasBranch: true },
      { id: 'wa-4', text: 'a swaggering bandido', weight: 24 }
    ]),
    weightedChoiceNode('ws-weapon', 900, 60, "Hunter's Weapon", [
      { id: 'ww-1', text: 'shouldering a lever-action rifle', weight: 34 },
      { id: 'ww-2', text: 'wearing twin revolvers', weight: 33, hasBranch: true },
      { id: 'ww-3', text: 'with a sawed-off shotgun on a sling', weight: 33 }
    ]),
    textNode('ws-engrave', 1320, 20, 'Engraving', 'with mother-of-pearl grips and scrollwork engraving'),
    concatNode('ws-weapon-merge', 1320, 140, 'Weapon Merge'),
    weightedChoiceNode('ws-poncho', 900, 320, "Stranger's Poncho", [
      { id: 'wp-1', text: 'draped in a faded striped serape', weight: 34 },
      { id: 'wp-2', text: 'under a dust-caked riding cloak', weight: 33 },
      { id: 'wp-3', text: 'in a weather-beaten duster coat', weight: 33 }
    ]),
    concatNode('ws-arch-merge', 1720, 240, 'Archetype Merge'),
    weightedChoiceNode('ws-attire', 480, 460, 'Attire', [
      { id: 'wr-1', text: 'in a sweat-stained hat and worn boots', weight: 34 },
      { id: 'wr-2', text: 'with a tin star and leather vest', weight: 33 },
      { id: 'wr-3', text: 'in a bandana and spurred boots', weight: 33 }
    ]),
    weightedChoiceNode('ws-scene', 480, 640, 'Stance', [
      { id: 'wn-1', text: 'squinting down an empty main street', weight: 34 },
      { id: 'wn-2', text: 'leaning in a saloon doorway', weight: 33 },
      { id: 'wn-3', text: 'standing over a fresh grave', weight: 33 }
    ]),
    concatNode('ws-main', 2120, 320, 'Assemble Character'),
    outputNode('ws-output', 2480, 320, 'spaghetti_western_character')
  ],
  edges: [
    { id: 'w-e1', source: 'ws-dna', target: 'ws-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'w-e2', source: 'ws-town', target: 'ws-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'w-e3', source: 'ws-arch', target: 'ws-arch-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'w-e4', source: 'ws-arch', target: 'ws-weapon', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'w-e5', source: 'ws-arch', target: 'ws-poncho', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'w-e6', source: 'ws-weapon', target: 'ws-weapon-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'w-e7', source: 'ws-weapon', target: 'ws-engrave', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'w-e8', source: 'ws-engrave', target: 'ws-weapon-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'w-e9', source: 'ws-weapon-merge', target: 'ws-arch-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'w-e10', source: 'ws-poncho', target: 'ws-arch-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'w-e11', source: 'ws-arch-merge', target: 'ws-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'w-e12', source: 'ws-attire', target: 'ws-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'w-e13', source: 'ws-scene', target: 'ws-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'w-e14', source: 'ws-main', target: 'ws-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

// Medieval Village Generator — locked era "DNA", multi-branch focal structure
// (forge -> wares, tavern -> sign), nested branch (forge swords/armor -> quality).
const villageTemplate: QuickStartTemplate = {
  nodes: [
    textNode('mv-dna', 80, 100, 'Village DNA', 'Medieval European village scene, muddy lanes, timber-framed buildings, overcast painterly light'),
    weightedChoiceNode('mv-era', 80, 320, 'Era (locked DNA)', [
      { id: 'mr-1', text: 'in the early medieval period', weight: 25 },
      { id: 'mr-2', text: 'in the high medieval period', weight: 25, locked: true },
      { id: 'mr-3', text: 'in the late medieval period', weight: 25 },
      { id: 'mr-4', text: 'on a feast-day morning', weight: 25 }
    ]),
    weightedChoiceNode('mv-focus', 480, 180, 'Focal Structure', [
      { id: 'mf-1', text: 'centered on a stone parish church', weight: 28 },
      { id: 'mf-2', text: "centered on the blacksmith's forge", weight: 24, hasBranch: true },
      { id: 'mf-3', text: 'centered on a busy tavern', weight: 24, hasBranch: true },
      { id: 'mf-4', text: 'centered on an open market square', weight: 24 }
    ]),
    weightedChoiceNode('mv-wares', 900, 60, 'Forge Wares', [
      { id: 'mw-1', text: 'hammering out horseshoes and nails', weight: 34 },
      { id: 'mw-2', text: 'forging swords and armor', weight: 33, hasBranch: true },
      { id: 'mw-3', text: 'mending plows and farm tools', weight: 33 }
    ]),
    textNode('mv-quality', 1320, 20, 'Quality Detail', 'fine enough for a lord’s retinue, gleaming on the rack'),
    concatNode('mv-forge-merge', 1320, 140, 'Forge Merge'),
    weightedChoiceNode('mv-sign', 900, 320, 'Tavern Sign', [
      { id: 'mg-1', text: 'under a swinging Green Dragon sign', weight: 34 },
      { id: 'mg-2', text: 'beneath a painted boar’s-head shingle', weight: 33 },
      { id: 'mg-3', text: 'past a creaking wheat-sheaf sign', weight: 33 }
    ]),
    concatNode('mv-focus-merge', 1720, 240, 'Focus Merge'),
    weightedChoiceNode('mv-folk', 480, 460, 'Inhabitants', [
      { id: 'mk-1', text: 'with peasants hauling baskets to market', weight: 34 },
      { id: 'mk-2', text: 'with children chasing a stray goose', weight: 33 },
      { id: 'mk-3', text: 'with a friar crossing the square', weight: 33 }
    ]),
    weightedChoiceNode('mv-weather', 480, 640, 'Weather', [
      { id: 'me-1', text: 'under a low grey drizzle', weight: 34 },
      { id: 'me-2', text: 'in thin morning mist', weight: 33 },
      { id: 'me-3', text: 'in pale watery sunlight', weight: 33 }
    ]),
    concatNode('mv-main', 2120, 320, 'Assemble Village'),
    outputNode('mv-output', 2480, 320, 'medieval_village')
  ],
  edges: [
    { id: 'm-e1', source: 'mv-dna', target: 'mv-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'm-e2', source: 'mv-era', target: 'mv-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'm-e3', source: 'mv-focus', target: 'mv-focus-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'm-e4', source: 'mv-focus', target: 'mv-wares', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'm-e5', source: 'mv-focus', target: 'mv-sign', type: 'smoothstep', sourceHandle: 'branch-2', targetHandle: 'target' },
    { id: 'm-e6', source: 'mv-wares', target: 'mv-forge-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input1' },
    { id: 'm-e7', source: 'mv-wares', target: 'mv-quality', type: 'smoothstep', sourceHandle: 'branch-1', targetHandle: 'target' },
    { id: 'm-e8', source: 'mv-quality', target: 'mv-forge-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'm-e9', source: 'mv-forge-merge', target: 'mv-focus-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input2' },
    { id: 'm-e10', source: 'mv-sign', target: 'mv-focus-merge', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'm-e11', source: 'mv-focus-merge', target: 'mv-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input3' },
    { id: 'm-e12', source: 'mv-folk', target: 'mv-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input4' },
    { id: 'm-e13', source: 'mv-weather', target: 'mv-main', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'input5' },
    { id: 'm-e14', source: 'mv-main', target: 'mv-output', type: 'smoothstep', sourceHandle: 'source', targetHandle: 'target' }
  ]
};

export const quickStartTemplates: Record<string, QuickStartTemplate> = {
  tech_panel: techPanelTemplate,
  tile_builder: tileBuilderTemplate,
  gangsters: gangsterTemplate,
  underworld_skilltree: underworldTemplate,
  baseball_fans: baseballTemplate,
  punk_fans: punkTemplate,
  diner_patrons: dinerTemplate,
  spaghetti_western: westernTemplate,
  medieval_village: villageTemplate,
  character_variation: characterTemplate,
  indy_500_crowd_card: indyCrowdCardTemplate,
  vehicle_family: vehicleFamilyTemplate,
  building_family: buildingFamilyTemplate,
  scene_still: vehicleFamilyTemplate,
  crowd_scene: buildingFamilyTemplate,
  branching_family: branchingFamilyTemplate
};
