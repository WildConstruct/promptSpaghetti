/**
 * Medieval-themed presets for Epic 1 demo
 */

import { Preset, PresetCategory } from './types';

// Helper to create preset with consistent metadata
function createPreset(
  id: string,
  name: string,
  category: string,
  nodeType: string,
  value: any,
  tags: string[] = [],
  description?: string
): Preset {
  return {
    id,
    name,
    category,
    tags,
    nodeType,
    value,
    metadata: {
      created: new Date(),
      usage: 0,
      description
    }
  };
}

// Character Occupations
const characterOccupations: Preset[] = [
  createPreset(
    'char-occ-merchant',
    'Merchant',
    'character-occupations',
    'textBlock',
    { text: 'merchant' },
    ['character', 'occupation', 'trade'],
    'A trader of goods and wares'
  ),
  createPreset(
    'char-occ-knight',
    'Knight',
    'character-occupations',
    'textBlock',
    { text: 'knight' },
    ['character', 'occupation', 'warrior'],
    'A noble warrior in armor'
  ),
  createPreset(
    'char-occ-peasant',
    'Peasant',
    'character-occupations',
    'textBlock',
    { text: 'peasant' },
    ['character', 'occupation', 'common'],
    'A common farm worker'
  ),
  createPreset(
    'char-occ-blacksmith',
    'Blacksmith',
    'character-occupations',
    'textBlock',
    { text: 'blacksmith' },
    ['character', 'occupation', 'craft'],
    'A forger of metal goods'
  ),
  createPreset(
    'char-occ-weighted',
    'Random Occupation',
    'character-occupations',
    'weightedChoice',
    {
      options: [
        { text: 'merchant', weight: 30 },
        { text: 'knight', weight: 10 },
        { text: 'peasant', weight: 40 },
        { text: 'blacksmith', weight: 20 }
      ]
    },
    ['character', 'occupation', 'random'],
    'Weighted selection of occupations'
  )
];

// Character States
const characterStates: Preset[] = [
  createPreset(
    'char-state-weary',
    'Weary',
    'character-states',
    'textBlock',
    { text: 'weary' },
    ['character', 'state', 'tired'],
    'Exhausted from travel'
  ),
  createPreset(
    'char-state-noble',
    'Noble',
    'character-states',
    'textBlock',
    { text: 'noble' },
    ['character', 'state', 'status'],
    'Of high birth and bearing'
  ),
  createPreset(
    'char-state-wounded',
    'Wounded',
    'character-states',
    'textBlock',
    { text: 'wounded' },
    ['character', 'state', 'injured'],
    'Bearing injuries from battle'
  ),
  createPreset(
    'char-state-jovial',
    'Jovial',
    'character-states',
    'textBlock',
    { text: 'jovial' },
    ['character', 'state', 'mood'],
    'In good spirits'
  )
];

// Clothing & Appearance
const clothingAppearance: Preset[] = [
  createPreset(
    'cloth-tattered-robes',
    'Tattered Robes',
    'clothing-appearance',
    'textBlock',
    { text: 'tattered robes' },
    ['clothing', 'worn', 'poor'],
    'Worn and threadbare garments'
  ),
  createPreset(
    'cloth-armor',
    'Plate Armor',
    'clothing-appearance',
    'textBlock',
    { text: 'gleaming plate armor' },
    ['clothing', 'armor', 'knight'],
    'Polished metal protection'
  ),
  createPreset(
    'cloth-tunic',
    'Simple Tunic',
    'clothing-appearance',
    'textBlock',
    { text: 'simple woolen tunic' },
    ['clothing', 'common', 'basic'],
    'Basic everyday wear'
  ),
  createPreset(
    'cloth-royal-garb',
    'Royal Garments',
    'clothing-appearance',
    'textBlock',
    { text: 'rich velvet robes adorned with gold' },
    ['clothing', 'royal', 'expensive'],
    'Clothing fit for nobility'
  )
];

// Items & Props
const itemsProps: Preset[] = [
  createPreset(
    'item-scroll',
    'Ancient Scroll',
    'items-props',
    'textBlock',
    { text: 'ancient scroll' },
    ['item', 'document', 'old'],
    'A rolled parchment with writings'
  ),
  createPreset(
    'item-sword',
    'Longsword',
    'items-props',
    'textBlock',
    { text: 'steel longsword' },
    ['item', 'weapon', 'blade'],
    'A knightly weapon'
  ),
  createPreset(
    'item-potion',
    'Healing Potion',
    'items-props',
    'textBlock',
    { text: 'glowing red potion' },
    ['item', 'consumable', 'magic'],
    'A magical healing elixir'
  ),
  createPreset(
    'item-coin-purse',
    'Coin Purse',
    'items-props',
    'textBlock',
    { text: 'leather coin purse' },
    ['item', 'money', 'container'],
    'A small bag for currency'
  )
];

// Settings & Locations
const settingsLocations: Preset[] = [
  createPreset(
    'setting-marketplace',
    'Marketplace',
    'settings-locations',
    'textBlock',
    { text: 'bustling marketplace' },
    ['setting', 'town', 'commerce'],
    'A busy trading area'
  ),
  createPreset(
    'setting-castle',
    'Castle',
    'settings-locations',
    'textBlock',
    { text: 'towering stone castle' },
    ['setting', 'fortress', 'noble'],
    'A fortified noble residence'
  ),
  createPreset(
    'setting-tavern',
    'Tavern',
    'settings-locations',
    'textBlock',
    { text: 'dimly lit tavern' },
    ['setting', 'inn', 'social'],
    'A place for food and drink'
  ),
  createPreset(
    'setting-forest',
    'Dark Forest',
    'settings-locations',
    'textBlock',
    { text: 'dark, mysterious forest' },
    ['setting', 'nature', 'wilderness'],
    'A wooded wilderness area'
  )
];

// Utility Presets
const utilityPresets: Preset[] = [
  createPreset(
    'util-concat-comma',
    'Comma Separator',
    'utility',
    'concat',
    { separator: ', ' },
    ['utility', 'separator'],
    'Join items with commas'
  ),
  createPreset(
    'util-concat-and',
    'And Separator',
    'utility',
    'concat',
    { separator: ' and ' },
    ['utility', 'separator'],
    'Join items with "and"'
  ),
  createPreset(
    'util-var-character',
    'Character Variable',
    'utility',
    'setVariable',
    { variableName: 'character', operation: 'set' },
    ['utility', 'variable'],
    'Store character information'
  ),
  createPreset(
    'util-output-story',
    'Story Output',
    'utility',
    'output',
    { label: 'Medieval Story' },
    ['utility', 'output'],
    'Output the generated story'
  )
];

// Create categories
export const medievalPresetCategories: PresetCategory[] = [
  {
    id: 'character-occupations',
    name: 'Character Occupations',
    icon: '👤',
    description: 'Medieval professions and trades',
    presets: characterOccupations
  },
  {
    id: 'character-states',
    name: 'Character States',
    icon: '💭',
    description: 'Moods and conditions',
    presets: characterStates
  },
  {
    id: 'clothing-appearance',
    name: 'Clothing & Appearance',
    icon: '👔',
    description: 'Garments and armor',
    presets: clothingAppearance
  },
  {
    id: 'items-props',
    name: 'Items & Props',
    icon: '⚔️',
    description: 'Objects and equipment',
    presets: itemsProps
  },
  {
    id: 'settings-locations',
    name: 'Settings & Locations',
    icon: '🏰',
    description: 'Places and environments',
    presets: settingsLocations
  },
  {
    id: 'utility',
    name: 'Utility',
    icon: '🔧',
    description: 'Helper nodes and connectors',
    presets: utilityPresets
  }
];

// Get all presets as a flat array
export const allMedievalPresets: Preset[] = medievalPresetCategories.flatMap(cat => cat.presets);