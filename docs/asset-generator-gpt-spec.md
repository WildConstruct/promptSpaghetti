# Asset Generator GPT Specification

## Overview
This document contains everything needed to create a custom GPT for generating PSG (Prompt Spaghetti Graph) assets in the PSGLib format.

## File Format: PSGLib v1.0.0

### Structure
```json
{
  "fileType": "psglib",
  "formatVersion": "1.0.0",
  "metadata": {
    "id": "preset-[name]-[timestamp]",
    "name": "Asset Name",
    "description": "What this asset generates",
    "author": "Generator GPT",
    "version": "1.0.0",
    "tags": ["category", "type", "theme"],
    "nodeTypes": ["WeightedChoice", "Concat", "Output"],
    "lastModified": "ISO8601 timestamp",
    "license": "MIT",
    "usageStats": {
      "timesUsed": 0,
      "lastUsed": null,
      "popularity": 0
    }
  },
  "graph": {
    "nodes": [],
    "edges": [],
    "settings": {}
  }
}
```

## Node Types for Asset Generation

### 1. WeightedChoice Node
Used for random selection with weights.
```json
{
  "id": "unique-id",
  "type": "WeightedChoice",
  "position": { "x": 100, "y": 100 },
  "data": {
    "choices": [
      { "text": "option 1", "weight": 2 },
      { "text": "option 2", "weight": 1 }
    ]
  },
  "label": "Choice Category"
}
```

### 2. Concat Node
Combines multiple inputs.
```json
{
  "id": "concat-id",
  "type": "Concat",
  "position": { "x": 400, "y": 200 },
  "data": {
    "separator": " ",
    "template": "{0} {1}"
  },
  "label": "Combiner"
}
```

### 3. Output Node
Final output of the graph.
```json
{
  "id": "output-id",
  "type": "Output",
  "position": { "x": 600, "y": 200 },
  "data": {
    "template": "Final: {input}"
  },
  "label": "Final Output"
}
```

### 4. SetVariable Node
Sets a variable for reuse.
```json
{
  "id": "setvar-id",
  "type": "SetVariable",
  "position": { "x": 200, "y": 100 },
  "data": {
    "variableName": "characterName",
    "value": "{input}"
  },
  "label": "Store Name"
}
```

### 5. GetVariable Node
Retrieves a stored variable.
```json
{
  "id": "getvar-id",
  "type": "GetVariable",
  "position": { "x": 300, "y": 200 },
  "data": {
    "variableName": "characterName",
    "defaultValue": "Unknown"
  },
  "label": "Retrieve Name"
}
```

## Edge Format
Connects nodes together.
```json
{
  "id": "edge-unique-id",
  "source": "source-node-id",
  "target": "target-node-id",
  "sourceHandle": "output",
  "targetHandle": "input"
}
```

## Asset Categories to Generate

### Character Assets
1. **Character Names**
   - First names (by culture/fantasy race)
   - Last names/surnames
   - Titles and epithets
   - Full name combinations

2. **Physical Traits**
   - Hair colors and styles
   - Eye colors and features
   - Body types and builds
   - Distinguishing marks
   - Clothing styles

3. **Personality Traits**
   - Positive traits
   - Flaws and weaknesses
   - Quirks and mannerisms
   - Fears and phobias
   - Goals and motivations

4. **Backgrounds**
   - Occupations
   - Social classes
   - Family histories
   - Childhood events
   - Life-changing moments

### World Building Assets
1. **Locations**
   - City/town names
   - Landmark descriptions
   - Building types
   - Natural features
   - Regional characteristics

2. **Items & Objects**
   - Weapon names and types
   - Magical items
   - Everyday objects
   - Trade goods
   - Treasure descriptions

3. **Organizations**
   - Guild names
   - Faction types
   - Religious orders
   - Criminal organizations
   - Noble houses

### Story Elements
1. **Plot Hooks**
   - Quest starters
   - Mystery clues
   - Conflict seeds
   - Rumors and gossip
   - Prophecies

2. **Dialogue**
   - Greetings by personality
   - Merchant haggling
   - Guard challenges
   - Tavern talk
   - Battle cries

3. **Descriptions**
   - Weather conditions
   - Time of day moods
   - Atmospheric details
   - Sensory descriptions
   - Emotional tones

## Generation Patterns

### Pattern 1: Simple Weighted List
```json
{
  "nodes": [
    {
      "id": "main-choice",
      "type": "WeightedChoice",
      "position": { "x": 100, "y": 100 },
      "data": {
        "choices": [
          { "text": "common option", "weight": 5 },
          { "text": "uncommon option", "weight": 3 },
          { "text": "rare option", "weight": 1 }
        ]
      },
      "label": "Main Selection"
    },
    {
      "id": "output",
      "type": "Output",
      "position": { "x": 300, "y": 100 },
      "data": {
        "template": "{input}"
      },
      "label": "Result"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "main-choice",
      "target": "output"
    }
  ]
}
```

### Pattern 2: Combination Generator
```json
{
  "nodes": [
    {
      "id": "part1",
      "type": "WeightedChoice",
      "position": { "x": 100, "y": 100 },
      "data": {
        "choices": [
          { "text": "Fire", "weight": 1 },
          { "text": "Ice", "weight": 1 },
          { "text": "Lightning", "weight": 1 }
        ]
      },
      "label": "Element"
    },
    {
      "id": "part2",
      "type": "WeightedChoice",
      "position": { "x": 100, "y": 200 },
      "data": {
        "choices": [
          { "text": "Sword", "weight": 2 },
          { "text": "Axe", "weight": 1 },
          { "text": "Staff", "weight": 1 }
        ]
      },
      "label": "Weapon Type"
    },
    {
      "id": "combiner",
      "type": "Concat",
      "position": { "x": 300, "y": 150 },
      "data": {
        "separator": " ",
        "template": "{0} {1}"
      },
      "label": "Combine"
    },
    {
      "id": "output",
      "type": "Output",
      "position": { "x": 500, "y": 150 },
      "data": {
        "template": "{input}"
      },
      "label": "Magic Weapon"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "part1",
      "target": "combiner"
    },
    {
      "id": "e2",
      "source": "part2",
      "target": "combiner"
    },
    {
      "id": "e3",
      "source": "combiner",
      "target": "output"
    }
  ]
}
```

### Pattern 3: Conditional/Complex
```json
{
  "nodes": [
    {
      "id": "gender",
      "type": "WeightedChoice",
      "position": { "x": 100, "y": 100 },
      "data": {
        "choices": [
          { "text": "male", "weight": 1 },
          { "text": "female", "weight": 1 },
          { "text": "neutral", "weight": 1 }
        ]
      },
      "label": "Gender"
    },
    {
      "id": "store-gender",
      "type": "SetVariable",
      "position": { "x": 250, "y": 100 },
      "data": {
        "variableName": "gender",
        "value": "{input}"
      },
      "label": "Store Gender"
    },
    {
      "id": "first-name",
      "type": "WeightedChoice",
      "position": { "x": 400, "y": 100 },
      "data": {
        "choices": [
          { "text": "Alex", "weight": 1 },
          { "text": "Jordan", "weight": 1 },
          { "text": "Sam", "weight": 1 }
        ]
      },
      "label": "First Name"
    },
    {
      "id": "title",
      "type": "WeightedChoice",
      "position": { "x": 400, "y": 200 },
      "data": {
        "choices": [
          { "text": "Sir", "weight": 1 },
          { "text": "Lady", "weight": 1 },
          { "text": "Captain", "weight": 1 }
        ]
      },
      "label": "Title"
    },
    {
      "id": "combine",
      "type": "Concat",
      "position": { "x": 600, "y": 150 },
      "data": {
        "separator": " ",
        "template": "{1} {0}"
      },
      "label": "Full Name"
    },
    {
      "id": "output",
      "type": "Output",
      "position": { "x": 800, "y": 150 },
      "data": {
        "template": "{input}"
      },
      "label": "Character Name"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "gender",
      "target": "store-gender"
    },
    {
      "id": "e2",
      "source": "store-gender",
      "target": "first-name"
    },
    {
      "id": "e3",
      "source": "first-name",
      "target": "combine"
    },
    {
      "id": "e4",
      "source": "title",
      "target": "combine"
    },
    {
      "id": "e5",
      "source": "combine",
      "target": "output"
    }
  ]
}
```

## Generation Guidelines

### 1. ID Generation
- Use format: `[type]-[timestamp]-[random]`
- Ensure uniqueness within the graph
- Example: `choice-1736536803000-abc123`

### 2. Positioning
- Start nodes at x:100
- Space nodes 150-200 pixels apart horizontally
- Arrange vertically for parallel branches
- Output node should be rightmost

### 3. Weight Distribution
- Common: 3-5 weight
- Uncommon: 2-3 weight  
- Rare: 1 weight
- Very rare: 0.5 weight
- Legendary: 0.1 weight

### 4. Content Guidelines
- Keep text concise (2-5 words typically)
- Use lowercase for combinable elements
- Use sentence case for complete outputs
- Include variety (minimum 5-10 options per choice)
- Balance realism with creativity

### 5. Tag Conventions
- Category: `character`, `location`, `item`, `story`
- Type: `name`, `description`, `trait`, `dialogue`
- Genre: `fantasy`, `scifi`, `modern`, `historical`
- Complexity: `simple`, `intermediate`, `complex`

## Example Prompts for GPT

### Prompt 1: Generate Character Hair
"Create a PSGLib asset for generating character hair descriptions. Include:
- Hair colors (natural and fantasy)
- Hair styles and lengths
- Hair textures
- Combined full descriptions
Tag as: character, physical, hair"

### Prompt 2: Generate Magic Items
"Create a PSGLib asset for magic item generation with:
- Item base types (sword, ring, cloak, etc.)
- Magical properties (fire, healing, protection)
- Power levels (minor, moderate, major)
- Curses or drawbacks (optional branch)
Tag as: item, magic, equipment, fantasy"

### Prompt 3: Generate Plot Hooks
"Create a PSGLib asset for quest/plot hook generation:
- Inciting incident types
- Quest giver types
- Reward categories
- Complication possibilities
Tag as: story, quest, plot, adventure"

## Validation Rules

1. **Required Fields**
   - Every node must have: id, type, position, data, label
   - Every edge must have: id, source, target
   - Metadata must include: id, name, description, author

2. **Graph Connectivity**
   - All nodes should be connected (no orphans)
   - No circular dependencies
   - Must have at least one Output node

3. **Weight Validation**
   - All weights must be positive numbers
   - At least 2 choices per WeightedChoice node

4. **Format Version**
   - Must be "1.0.0" for compatibility

## Testing Your Generated Assets

1. Validate JSON structure
2. Check all node IDs are unique
3. Verify all edges reference valid nodes
4. Ensure weights sum to reasonable totals
5. Test output makes semantic sense

## Output Format

Generate assets as properly formatted JSON following the PSGLib specification. Include:
1. Complete metadata section
2. All nodes with proper structure
3. All edges connecting the nodes
4. Proper positioning for visual clarity

The generated file should be saved with `.psglib` extension and be immediately usable in the Prompt Spaghetti application.