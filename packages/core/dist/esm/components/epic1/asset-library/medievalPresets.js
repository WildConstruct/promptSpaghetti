/**
 * Medieval-themed presets for Epic 1 demo
 */
// Helper to create preset with consistent metadata
function createPreset(id, name, category, nodeType, value, tags = [], description) {
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
const characterOccupations = [
    createPreset('char-occ-merchant', 'Merchant', 'character-occupations', 'textBlock', { text: 'merchant' }, ['character', 'occupation', 'trade'], 'A trader of goods and wares'),
    createPreset('char-occ-knight', 'Knight', 'character-occupations', 'textBlock', { text: 'knight' }, ['character', 'occupation', 'warrior'], 'A noble warrior in armor'),
    createPreset('char-occ-peasant', 'Peasant', 'character-occupations', 'textBlock', { text: 'peasant' }, ['character', 'occupation', 'common'], 'A common farm worker'),
    createPreset('char-occ-blacksmith', 'Blacksmith', 'character-occupations', 'textBlock', { text: 'blacksmith' }, ['character', 'occupation', 'craft'], 'A forger of metal goods'),
    createPreset('char-occ-weighted', 'Random Occupation', 'character-occupations', 'weightedChoice', {
        options: [
            { text: 'merchant', weight: 30 },
            { text: 'knight', weight: 10 },
            { text: 'peasant', weight: 40 },
            { text: 'blacksmith', weight: 20 }
        ]
    }, ['character', 'occupation', 'random'], 'Weighted selection of occupations')
];
// Character States
const characterStates = [
    createPreset('char-state-physical', 'Physical State', 'character-states', 'weightedChoice', {
        options: [
            { text: 'weary from travel', weight: 25 },
            { text: 'battle-hardened', weight: 20 },
            { text: 'wounded but determined', weight: 15 },
            { text: 'vigorous and healthy', weight: 25 },
            { text: 'aged but spry', weight: 15 }
        ]
    }, ['character', 'state', 'physical'], 'Physical condition variations'),
    createPreset('char-state-emotional', 'Emotional State', 'character-states', 'weightedChoice', {
        options: [
            { text: 'jovial and mirthful', weight: 20 },
            { text: 'somber and thoughtful', weight: 25 },
            { text: 'wary and suspicious', weight: 25 },
            { text: 'eager and excited', weight: 20 },
            { text: 'melancholic', weight: 10 }
        ]
    }, ['character', 'state', 'emotional'], 'Emotional state variations'),
    createPreset('char-state-social', 'Social Standing', 'character-states', 'weightedChoice', {
        options: [
            { text: 'noble-born', weight: 10 },
            { text: 'merchant class', weight: 20 },
            { text: 'common folk', weight: 50 },
            { text: 'outcast', weight: 10 },
            { text: 'foreign visitor', weight: 10 }
        ]
    }, ['character', 'state', 'social'], 'Social status variations')
];
// Clothing & Appearance
const clothingAppearance = [
    createPreset('cloth-varied', 'Varied Clothing', 'clothing-appearance', 'weightedChoice', {
        options: [
            { text: 'tattered robes', weight: 30 },
            { text: 'simple woolen tunic', weight: 40 },
            { text: 'leather jerkin', weight: 20 },
            { text: 'traveler\'s cloak', weight: 10 }
        ]
    }, ['clothing', 'varied', 'common'], 'Common clothing variations'),
    createPreset('cloth-armor-types', 'Armor Types', 'clothing-appearance', 'weightedChoice', {
        options: [
            { text: 'gleaming plate armor', weight: 15 },
            { text: 'chainmail hauberk', weight: 35 },
            { text: 'studded leather armor', weight: 30 },
            { text: 'padded gambeson', weight: 20 }
        ]
    }, ['clothing', 'armor', 'protection'], 'Various types of armor'),
    createPreset('cloth-noble-attire', 'Noble Attire', 'clothing-appearance', 'weightedChoice', {
        options: [
            { text: 'rich velvet robes adorned with gold', weight: 25 },
            { text: 'silk doublet with silver embroidery', weight: 25 },
            { text: 'ermine-trimmed cloak', weight: 25 },
            { text: 'brocade gown with jeweled belt', weight: 25 }
        ]
    }, ['clothing', 'noble', 'luxury'], 'Fine clothing for nobility'),
    createPreset('cloth-condition', 'Clothing Condition', 'clothing-appearance', 'weightedChoice', {
        options: [
            { text: 'pristine', weight: 15 },
            { text: 'well-maintained', weight: 35 },
            { text: 'worn but serviceable', weight: 35 },
            { text: 'tattered and patched', weight: 15 }
        ]
    }, ['clothing', 'condition', 'modifier'], 'Condition of garments')
];
// Items & Props
const itemsProps = [
    createPreset('item-weapons', 'Weapon Types', 'items-props', 'weightedChoice', {
        options: [
            { text: 'steel longsword', weight: 25 },
            { text: 'battle-worn axe', weight: 20 },
            { text: 'ornate dagger', weight: 20 },
            { text: 'sturdy quarterstaff', weight: 20 },
            { text: 'crossbow with quarrels', weight: 15 }
        ]
    }, ['item', 'weapon', 'combat'], 'Various medieval weapons'),
    createPreset('item-documents', 'Documents & Scrolls', 'items-props', 'weightedChoice', {
        options: [
            { text: 'ancient scroll', weight: 20 },
            { text: 'sealed letter', weight: 25 },
            { text: 'merchant\'s ledger', weight: 20 },
            { text: 'royal decree', weight: 15 },
            { text: 'treasure map', weight: 20 }
        ]
    }, ['item', 'document', 'written'], 'Written items and documents'),
    createPreset('item-magical', 'Magical Items', 'items-props', 'weightedChoice', {
        options: [
            { text: 'glowing red potion', weight: 25 },
            { text: 'crystal amulet', weight: 20 },
            { text: 'enchanted ring', weight: 15 },
            { text: 'mystic orb', weight: 20 },
            { text: 'spell component pouch', weight: 20 }
        ]
    }, ['item', 'magical', 'mystical'], 'Items of magical nature'),
    createPreset('item-mundane', 'Everyday Items', 'items-props', 'weightedChoice', {
        options: [
            { text: 'leather coin purse', weight: 25 },
            { text: 'traveler\'s pack', weight: 20 },
            { text: 'wineskin', weight: 20 },
            { text: 'iron lantern', weight: 20 },
            { text: 'worn boots', weight: 15 }
        ]
    }, ['item', 'mundane', 'common'], 'Common everyday items')
];
// Settings & Locations
const settingsLocations = [
    createPreset('setting-urban', 'Urban Settings', 'settings-locations', 'weightedChoice', {
        options: [
            { text: 'bustling marketplace', weight: 25 },
            { text: 'narrow cobblestone alley', weight: 20 },
            { text: 'grand cathedral square', weight: 15 },
            { text: 'harbor district', weight: 20 },
            { text: 'craftsman\'s quarter', weight: 20 }
        ]
    }, ['setting', 'urban', 'town'], 'Various town and city locations'),
    createPreset('setting-noble', 'Noble Settings', 'settings-locations', 'weightedChoice', {
        options: [
            { text: 'towering stone castle', weight: 30 },
            { text: 'manor house gardens', weight: 25 },
            { text: 'great hall', weight: 25 },
            { text: 'tournament grounds', weight: 20 }
        ]
    }, ['setting', 'noble', 'fortress'], 'Noble and aristocratic locations'),
    createPreset('setting-taverns', 'Taverns & Inns', 'settings-locations', 'weightedChoice', {
        options: [
            { text: 'dimly lit tavern', weight: 30 },
            { text: 'roadside inn', weight: 25 },
            { text: 'dockside alehouse', weight: 25 },
            { text: 'upscale wine house', weight: 20 }
        ]
    }, ['setting', 'tavern', 'social'], 'Places for food, drink, and lodging'),
    createPreset('setting-wilderness', 'Wilderness Areas', 'settings-locations', 'weightedChoice', {
        options: [
            { text: 'dark, mysterious forest', weight: 25 },
            { text: 'windswept moor', weight: 20 },
            { text: 'mountain pass', weight: 20 },
            { text: 'ancient ruins', weight: 20 },
            { text: 'riverside camp', weight: 15 }
        ]
    }, ['setting', 'wilderness', 'nature'], 'Natural and wild locations')
];
// Utility Presets
const utilityPresets = [
    createPreset('util-concat-comma', 'Comma Separator', 'utility', 'concat', { separator: ', ' }, ['utility', 'separator'], 'Join items with commas'),
    createPreset('util-concat-and', 'And Separator', 'utility', 'concat', { separator: ' and ' }, ['utility', 'separator'], 'Join items with "and"'),
    createPreset('util-var-character', 'Character Variable', 'utility', 'setVariable', { variableName: 'character', operation: 'set' }, ['utility', 'variable'], 'Store character information'),
    createPreset('util-output-story', 'Story Output', 'utility', 'output', { label: 'Medieval Story' }, ['utility', 'output'], 'Output the generated story')
];
// Create categories
export const medievalPresetCategories = [
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
export const allMedievalPresets = medievalPresetCategories.flatMap(cat => cat.presets);
