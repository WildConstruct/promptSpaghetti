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

export const quickStartTemplates: Record<string, QuickStartTemplate> = {
  tech_panel: techPanelTemplate,
  tile_builder: tileBuilderTemplate,
  gangsters: gangsterTemplate,
  character_variation: characterTemplate,
  indy_500_crowd_card: indyCrowdCardTemplate,
  vehicle_family: vehicleFamilyTemplate,
  building_family: buildingFamilyTemplate,
  scene_still: vehicleFamilyTemplate,
  crowd_scene: buildingFamilyTemplate,
  branching_family: branchingFamilyTemplate
};
