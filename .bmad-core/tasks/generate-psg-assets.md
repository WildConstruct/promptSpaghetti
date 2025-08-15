# Generate PSG Assets Task

## Purpose
Convert lists of prompt components into PSG (Prompt Spaghetti Graph) format assets

## Input Format
Accept lists in various formats:
- Numbered lists (1. item, 2. item)
- Bullet points (- item or * item)
- Comma-separated values
- Tab-delimited data
- Nested categories with sub-items

## Processing Steps

### 1. Planning Phase (NEW - ALWAYS DO FIRST)
Present a generation plan to the user before creating assets:
```javascript
function presentPlan(input) {
  // Analyze input to determine optimal structure
  // Propose 2-3 approaches:
  //   1. Single WeightedChoice (10-15 curated options)
  //   2. Region Bundle (2-4 connected nodes)
  //   3. Full expansion (only if explicitly needed)
  // Get user approval before proceeding
}
```

### 2. Parse Input List
```javascript
function parseList(input) {
  // Detect format (numbered, bulleted, CSV, etc.)
  // Extract category if present (e.g., "Physical Appearance - Face")
  // Clean and normalize each item
  // Return structured array with metadata
}
```

### 2. Generate Individual Assets
For each item in the list, create a PSG node:

```json
{
  "id": "generated_[timestamp]_[index]",
  "type": "Output",
  "data": {
    "label": "[Clean item name]",
    "template": "[Item as prompt component]",
    "category": "[Detected category]",
    "tags": ["auto-generated", "[category]", "[subcategory]"],
    "metadata": {
      "source": "batch-generation",
      "timestamp": "[ISO timestamp]",
      "version": "1.0.0"
    }
  },
  "position": {
    "x": "[calculated grid position]",
    "y": "[calculated grid position]"
  }
}
```

### 3. Create Region Bundles (RECOMMENDED APPROACH)
Group related nodes in annotated regions for modular reuse:

```json
{
  "region": {
    "id": "region_[category]_[timestamp]",
    "name": "[Descriptive Region Name]",
    "color": "#[hex_color]",  // See visual taxonomy
    "category": "[primary_category]"
  },
  "nodes": [
    {
      "id": "main_selector",
      "type": "WeightedChoice",
      "data": {
        "label": "[Main Choice]",
        "choices": [
          {
            "id": "choice_1",
            "weight": 1.5,
            "text": "[Item 1]",
            "muted": false,
            "solo": false
          }
          // 10-15 curated options max
        ]
      }
    },
    {
      "id": "modifier_selector",
      "type": "WeightedChoice",
      "data": {
        "label": "[Modifier]",
        "choices": [/* 5-8 modifiers */]
      }
    },
    {
      "id": "combined_output",
      "type": "Output",
      "data": {
        "template": "{{main_selector}} {{modifier_selector}}"
      }
    }
  ],
  "edges": [
    {"source": "main_selector", "target": "combined_output"},
    {"source": "modifier_selector", "target": "combined_output"}
  ]
}
```

### 4. Legacy: Create Simple Weighted Choice Nodes
For backwards compatibility or simple cases:

### 4. Generate Combinations
When multiple categories are provided:

```javascript
function generateCombinations(category1, category2) {
  const combinations = [];
  for (const item1 of category1) {
    for (const item2 of category2) {
      combinations.push({
        template: `${item1}, ${item2}`,
        tags: [category1.name, category2.name, 'combination'],
        name: `${item1}_${item2}`
      });
    }
  }
  return combinations;
}
```

### 5. Create Category Collections
Group related assets into collection nodes:

```json
{
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "name": "[Category Collection]",
    "description": "Generated collection of [category] assets",
    "itemCount": 150,
    "categories": ["hair_styles", "hair_colors"],
    "generatedAt": "[timestamp]"
  }
}
```

## Example Generation

### Input:
```
Physical Appearance – Hair
1. buzzed
2. pixie
3. lob
4. waist-length
```

### Output:
```json
{
  "nodes": [
    {
      "id": "hair_length_buzzed",
      "type": "Output",
      "data": {
        "label": "Buzzed Hair",
        "template": "buzzed hair",
        "category": "hair_length",
        "tags": ["hair", "length", "short", "buzzed"]
      }
    },
    {
      "id": "hair_length_selector",
      "type": "WeightedChoice",
      "data": {
        "label": "Hair Length",
        "choices": [
          {"text": "buzzed hair", "weight": 1},
          {"text": "pixie cut", "weight": 1},
          {"text": "lob hairstyle", "weight": 1},
          {"text": "waist-length hair", "weight": 1}
        ]
      }
    }
  ]
}
```

## Batch Processing Options

### Quick Mode
- Simple text-to-node conversion
- No combinations
- Basic tagging

### Standard Mode
- Individual nodes
- Category grouping
- Weighted choice nodes
- Basic metadata

### Advanced Mode
- All combinations generated
- Rich metadata
- Relationship mapping
- Export variations

## File Organization

Generated assets should be saved as:
```
/assets/
  /generated/
    /[category]/
      - [asset_name].psg        # Use .psg extension, not .json!
      - manifest.json           # Auto-generated for discovery
  /library/                     # Browser reads from here (use *migrate command)
    /[category]/
      - *.psg                   # Migrated assets
      - manifest.json           # Category manifest
```

### IMPORTANT: File Format
- **ALWAYS save with .psg extension**, not .json
- PSG files ARE JSON but with .psg extension for browser recognition
- Include proper metadata for manifest generation

## Success Metrics
- Generation speed: 100+ assets per second
- Valid PSG format: 100% compliance
- Useful combinations: 80%+ relevance
- Easy discovery: Proper categorization and tagging