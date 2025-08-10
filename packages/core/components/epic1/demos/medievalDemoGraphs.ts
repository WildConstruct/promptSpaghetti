/**
 * Pre-built medieval demo graphs for quick showcase
 * These are optimized for <30 second investor demos
 */

import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';

export interface DemoGraph {
  id: string;
  name: string;
  description: string;
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  previewSeeds?: (string | number)[];
  tags: string[];
}

// Simple character generator
export const simpleCharacterGraph: DemoGraph = {
  id: 'simple-character',
  name: 'Quick Character',
  description: 'A simple medieval character in one sentence',
  nodes: [
    {
      id: 'article',
      type: 'textBlock',
      position: { x: 50, y: 200 },
      data: {
        value: 'A',
        text: 'A',
        nodeType: 'textBlock'
      }
    },
    {
      id: 'adjective',
      type: 'weightedChoice',
      position: { x: 150, y: 200 },
      data: {
        value: JSON.stringify([
          { text: 'brave', weight: 30 },
          { text: 'weary', weight: 25 },
          { text: 'cunning', weight: 20 },
          { text: 'noble', weight: 15 },
          { text: 'mysterious', weight: 10 }
        ]),
        options: [
          { text: 'brave', weight: 30 },
          { text: 'weary', weight: 25 },
          { text: 'cunning', weight: 20 },
          { text: 'noble', weight: 15 },
          { text: 'mysterious', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'occupation',
      type: 'weightedChoice',
      position: { x: 350, y: 200 },
      data: {
        value: JSON.stringify([
          { text: 'knight', weight: 35 },
          { text: 'merchant', weight: 30 },
          { text: 'wizard', weight: 20 },
          { text: 'thief', weight: 15 }
        ]),
        options: [
          { text: 'knight', weight: 35 },
          { text: 'merchant', weight: 30 },
          { text: 'wizard', weight: 20 },
          { text: 'thief', weight: 15 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'output',
      type: 'output',
      position: { x: 550, y: 200 },
      data: {
        value: 'Character',
        label: 'Character',
        nodeType: 'output'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'article', target: 'adjective', animated: true },
    { id: 'e2', source: 'adjective', target: 'occupation', animated: true },
    { id: 'e3', source: 'occupation', target: 'output' }
  ],
  previewSeeds: ['hero1', 'hero2', 'hero3'],
  tags: ['simple', 'character', 'quick']
};

// Quest hook generator
export const questHookGraph: DemoGraph = {
  id: 'quest-hook',
  name: 'Quest Hook',
  description: 'Generate compelling quest beginnings',
  nodes: [
    {
      id: 'intro',
      type: 'textBlock',
      position: { x: 50, y: 150 },
      data: {
        value: 'You must',
        text: 'You must',
        nodeType: 'textBlock'
      }
    },
    {
      id: 'action',
      type: 'weightedChoice',
      position: { x: 200, y: 150 },
      data: {
        value: JSON.stringify([
          { text: 'retrieve', weight: 25 },
          { text: 'destroy', weight: 20 },
          { text: 'protect', weight: 20 },
          { text: 'discover', weight: 20 },
          { text: 'escape from', weight: 15 }
        ]),
        options: [
          { text: 'retrieve', weight: 25 },
          { text: 'destroy', weight: 20 },
          { text: 'protect', weight: 20 },
          { text: 'discover', weight: 20 },
          { text: 'escape from', weight: 15 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'target',
      type: 'weightedChoice',
      position: { x: 400, y: 150 },
      data: {
        value: JSON.stringify([
          { text: 'the ancient artifact', weight: 30 },
          { text: "the dragon's hoard", weight: 25 },
          { text: 'the lost princess', weight: 20 },
          { text: 'the cursed amulet', weight: 15 },
          { text: 'the forbidden tome', weight: 10 }
        ]),
        options: [
          { text: 'the ancient artifact', weight: 30 },
          { text: "the dragon's hoard", weight: 25 },
          { text: 'the lost princess', weight: 20 },
          { text: 'the cursed amulet', weight: 15 },
          { text: 'the forbidden tome', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'location-prep',
      type: 'textBlock',
      position: { x: 200, y: 300 },
      data: {
        value: 'hidden in',
        text: 'hidden in',
        nodeType: 'textBlock'
      }
    },
    {
      id: 'location',
      type: 'weightedChoice',
      position: { x: 350, y: 300 },
      data: {
        value: JSON.stringify([
          { text: 'the haunted forest', weight: 30 },
          { text: 'the abandoned castle', weight: 25 },
          { text: 'the sunken temple', weight: 20 },
          { text: 'the mountain fortress', weight: 15 },
          { text: "the wizard's tower", weight: 10 }
        ]),
        options: [
          { text: 'the haunted forest', weight: 30 },
          { text: 'the abandoned castle', weight: 25 },
          { text: 'the sunken temple', weight: 20 },
          { text: 'the mountain fortress', weight: 15 },
          { text: "the wizard's tower", weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'output',
      type: 'output',
      position: { x: 300, y: 450 },
      data: {
        value: 'Quest',
        label: 'Quest',
        nodeType: 'output'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'intro', target: 'action', animated: true },
    { id: 'e2', source: 'action', target: 'target', animated: true },
    { id: 'e3', source: 'target', target: 'location-prep' },
    { id: 'e4', source: 'location-prep', target: 'location', animated: true },
    { id: 'e5', source: 'location', target: 'output' }
  ],
  previewSeeds: ['quest1', 'quest2', 'quest3', 'quest4', 'quest5'],
  tags: ['quest', 'adventure', 'hook']
};

// Tavern scene generator
export const tavernSceneGraph: DemoGraph = {
  id: 'tavern-scene',
  name: 'Tavern Scene',
  description: 'Atmospheric tavern descriptions',
  nodes: [
    {
      id: 'time',
      type: 'weightedChoice',
      position: { x: 50, y: 100 },
      data: {
        value: JSON.stringify([
          { text: 'In the dimly lit', weight: 40 },
          { text: 'In the crowded', weight: 30 },
          { text: 'In the smoky', weight: 20 },
          { text: 'In the quiet', weight: 10 }
        ]),
        options: [
          { text: 'In the dimly lit', weight: 40 },
          { text: 'In the crowded', weight: 30 },
          { text: 'In the smoky', weight: 20 },
          { text: 'In the quiet', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'tavern-name',
      type: 'weightedChoice',
      position: { x: 250, y: 100 },
      data: {
        value: JSON.stringify([
          { text: 'Prancing Pony', weight: 25 },
          { text: "Dragon's Rest", weight: 25 },
          { text: 'Broken Shield', weight: 20 },
          { text: "Wizard's Brew", weight: 20 },
          { text: 'Silent Knight', weight: 10 }
        ]),
        options: [
          { text: 'Prancing Pony', weight: 25 },
          { text: "Dragon's Rest", weight: 25 },
          { text: 'Broken Shield', weight: 20 },
          { text: "Wizard's Brew", weight: 20 },
          { text: 'Silent Knight', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'comma',
      type: 'textBlock',
      position: { x: 450, y: 100 },
      data: {
        value: ',',
        text: ',',
        nodeType: 'textBlock'
      }
    },
    {
      id: 'patron',
      type: 'weightedChoice',
      position: { x: 150, y: 250 },
      data: {
        value: JSON.stringify([
          { text: 'a hooded stranger', weight: 30 },
          { text: 'a grizzled mercenary', weight: 25 },
          { text: 'a nervous merchant', weight: 20 },
          { text: 'a mysterious bard', weight: 15 },
          { text: 'an old wizard', weight: 10 }
        ]),
        options: [
          { text: 'a hooded stranger', weight: 30 },
          { text: 'a grizzled mercenary', weight: 25 },
          { text: 'a nervous merchant', weight: 20 },
          { text: 'a mysterious bard', weight: 15 },
          { text: 'an old wizard', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'action',
      type: 'weightedChoice',
      position: { x: 350, y: 250 },
      data: {
        value: JSON.stringify([
          { text: 'beckons you over', weight: 30 },
          { text: 'slides a map across the table', weight: 25 },
          { text: 'whispers of ancient treasure', weight: 20 },
          { text: 'offers you a dangerous job', weight: 15 },
          { text: 'warns of impending doom', weight: 10 }
        ]),
        options: [
          { text: 'beckons you over', weight: 30 },
          { text: 'slides a map across the table', weight: 25 },
          { text: 'whispers of ancient treasure', weight: 20 },
          { text: 'offers you a dangerous job', weight: 15 },
          { text: 'warns of impending doom', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'output',
      type: 'output',
      position: { x: 250, y: 400 },
      data: {
        value: 'Scene',
        label: 'Scene',
        nodeType: 'output'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'time', target: 'tavern-name', animated: true },
    { id: 'e2', source: 'tavern-name', target: 'comma' },
    { id: 'e3', source: 'comma', target: 'patron' },
    { id: 'e4', source: 'patron', target: 'action', animated: true },
    { id: 'e5', source: 'action', target: 'output' }
  ],
  previewSeeds: ['tavern1', 'tavern2', 'tavern3', 'scene1', 'scene2'],
  tags: ['tavern', 'scene', 'atmosphere']
};

// Combat encounter generator
export const combatEncounterGraph: DemoGraph = {
  id: 'combat-encounter',
  name: 'Combat Encounter',
  description: 'Quick combat scenario generator',
  nodes: [
    {
      id: 'suddenly',
      type: 'textBlock',
      position: { x: 50, y: 150 },
      data: {
        value: 'Suddenly,',
        text: 'Suddenly,',
        nodeType: 'textBlock'
      }
    },
    {
      id: 'enemy-count',
      type: 'weightedChoice',
      position: { x: 200, y: 150 },
      data: {
        value: JSON.stringify([
          { text: 'three', weight: 40 },
          { text: 'five', weight: 30 },
          { text: 'a dozen', weight: 20 },
          { text: 'a horde of', weight: 10 }
        ]),
        options: [
          { text: 'three', weight: 40 },
          { text: 'five', weight: 30 },
          { text: 'a dozen', weight: 20 },
          { text: 'a horde of', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'enemy-type',
      type: 'weightedChoice',
      position: { x: 400, y: 150 },
      data: {
        value: JSON.stringify([
          { text: 'goblins', weight: 30 },
          { text: 'bandits', weight: 25 },
          { text: 'orcs', weight: 20 },
          { text: 'undead', weight: 15 },
          { text: 'cultists', weight: 10 }
        ]),
        options: [
          { text: 'goblins', weight: 30 },
          { text: 'bandits', weight: 25 },
          { text: 'orcs', weight: 20 },
          { text: 'undead', weight: 15 },
          { text: 'cultists', weight: 10 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'attack-verb',
      type: 'weightedChoice',
      position: { x: 300, y: 300 },
      data: {
        value: JSON.stringify([
          { text: 'burst from the shadows', weight: 35 },
          { text: 'charge from the treeline', weight: 30 },
          { text: 'emerge from hiding', weight: 20 },
          { text: 'surround your party', weight: 15 }
        ]),
        options: [
          { text: 'burst from the shadows', weight: 35 },
          { text: 'charge from the treeline', weight: 30 },
          { text: 'emerge from hiding', weight: 20 },
          { text: 'surround your party', weight: 15 }
        ],
        nodeType: 'weightedChoice'
      }
    },
    {
      id: 'output',
      type: 'output',
      position: { x: 300, y: 450 },
      data: {
        value: 'Encounter',
        label: 'Encounter',
        nodeType: 'output'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'suddenly', target: 'enemy-count', animated: true },
    { id: 'e2', source: 'enemy-count', target: 'enemy-type', animated: true },
    { id: 'e3', source: 'enemy-type', target: 'attack-verb' },
    { id: 'e4', source: 'attack-verb', target: 'output' }
  ],
  previewSeeds: ['combat1', 'combat2', 'battle1', 'fight1', 'encounter1'],
  tags: ['combat', 'encounter', 'action']
};

// Collect all demo graphs
export const medievalDemoGraphs: DemoGraph[] = [
  simpleCharacterGraph,
  questHookGraph,
  tavernSceneGraph,
  combatEncounterGraph
];

// Helper to get graph by ID
export const getDemoGraphById = (id: string): DemoGraph | undefined => {
  return medievalDemoGraphs.find(graph => graph.id === id);
};

// Helper to get graphs by tag
export const getDemoGraphsByTag = (tag: string): DemoGraph[] => {
  return medievalDemoGraphs.filter(graph => graph.tags.includes(tag));
};
