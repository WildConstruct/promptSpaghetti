# Asset Creation Guide for Prompt Spaghetti

## Overview

This guide explains how to create reusable asset fragments (PSG files) for the Prompt Spaghetti asset browser. Assets are modular prompt components that can be drag-and-dropped into the graph editor.

## Asset Fragment Structure

### PSG File Format

PSG (Prompt Spaghetti Graph) files are JSON documents that define reusable graph fragments:

```json
{
  "version": "1.0.0",
  "type": "asset-fragment",
  "metadata": {
    "name": "Fragment Name",
    "category": "category-name",
    "type": "SIMPLE|MULTI-ASPECT|COMPLEX",
    "description": "Brief description of what this fragment generates",
    "tags": ["tag1", "tag2"],
    "created": "2025-01-15",
    "author": "Author Name"
  },
  "nodes": [...],
  "edges": [...],
  "regions": [...]
}
```

## Node Types

### 1. WeightedChoice
Most common node type for generating variations:

```json
{
  "id": "unique-node-id",
  "type": "WeightedChoice",
  "x": 100,
  "y": 100,
  "data": {
    "label": "Node Label",
    "options": [
      {
        "id": "opt-1",
        "text": "option text",
        "weight": 10,
        "mute": false,
        "solo": false
      }
    ]
  }
}
```

### 2. TextBlock
For static text content:

```json
{
  "id": "text-node-id",
  "type": "TextBlock",
  "x": 100,
  "y": 250,
  "data": {
    "label": "Text Label",
    "text": "Static text content"
  }
}
```

### 3. Output (Deprecated for Fragments)
Output nodes should NOT be included in asset fragments. They're only for complete graphs.

## Region Requirements

### Single-Node Fragments
- Do NOT require regions
- The node stands alone as a self-contained unit

### Multi-Node Fragments
- MUST be contained within a region box
- Regions provide visual grouping and metadata

```json
"regions": [
  {
    "id": "region-fragment-name",
    "type": "region",
    "x": 60,
    "y": 60,
    "width": 400,
    "height": 300,
    "data": {
      "label": "Fragment Group Name",
      "description": "What this group does",
      "color": "#4A90E2",
      "collapsed": false
    }
  }
]
```

### Region Colors by Category
- `facial-features`: #4A90E2 (Blue)
- `hair`: #E94B3C (Red)
- `body-silhouette`: #6B5B95 (Purple)
- `movement`: #88B04B (Green)
- `accessories`: #F7786B (Coral)
- `clothing`: #91A8D0 (Light blue)
- `age`: #FFD662 (Yellow)
- Default: #6C757D (Gray)

## Node Connection Rules

### Auto-Concatenation
As of January 2025, nodes automatically concatenate their inputs:
- WeightedChoice nodes accept inputs and prepend them to their output
- TextBlock nodes concatenate inputs with their text
- Multiple inputs to a single node are joined with spaces
- Output nodes auto-concatenate all inputs

### Edges
Define connections between nodes:

```json
"edges": [
  {
    "id": "edge-1",
    "source": "node-1",
    "target": "node-2",
    "sourceHandle": "output",  // Optional, defaults to "output"
    "targetHandle": "input"     // Optional, defaults to "input"
  }
]
```

## Categories

Standard categories for organization:
- `facial-features` - Eyes, nose, mouth, etc.
- `hair` - Styles, colors, textures
- `body-silhouette` - Body types, posture, build
- `movement` - Gestures, actions, dynamics
- `accessories` - Jewelry, glasses, items
- `clothing` - Garments, fit, style
- `age` - Age indicators and markers
- `appearance-modifier` - General modifiers

## Best Practices

### 1. Naming Conventions
- Use descriptive, lowercase IDs with hyphens: `eye-shape-variations`
- Label nodes clearly for UI display
- Include metadata for searchability

### 2. Weight Distribution
- Use weights 1-100 for clarity
- Balance weights for even distribution unless intentional bias needed
- Document weight reasoning in metadata

### 3. Modularity
- Keep fragments focused on a single aspect
- Design for reusability across different contexts
- Avoid overly specific combinations

### 4. Testing
- Test fragments in the editor before saving
- Verify all options generate appropriate content
- Check concatenation behavior with upstream nodes

## Example: Complete Multi-Node Fragment

```json
{
  "version": "1.0.0",
  "type": "asset-fragment",
  "metadata": {
    "name": "Eye Description System",
    "category": "facial-features",
    "type": "MULTI-ASPECT",
    "description": "Comprehensive eye descriptors",
    "tags": ["eyes", "facial", "descriptive"],
    "created": "2025-01-15",
    "author": "Your Name"
  },
  "nodes": [
    {
      "id": "eye-shape",
      "type": "WeightedChoice",
      "x": 100,
      "y": 100,
      "data": {
        "label": "Eye Shape",
        "region": "eye-region",
        "options": [
          {"id": "1", "text": "almond-shaped", "weight": 20},
          {"id": "2", "text": "round", "weight": 15},
          {"id": "3", "text": "hooded", "weight": 15}
        ]
      }
    },
    {
      "id": "eye-color",
      "type": "WeightedChoice",
      "x": 350,
      "y": 100,
      "data": {
        "label": "Eye Color",
        "region": "eye-region",
        "options": [
          {"id": "1", "text": "deep brown", "weight": 30},
          {"id": "2", "text": "bright blue", "weight": 20},
          {"id": "3", "text": "emerald green", "weight": 15}
        ]
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "eye-shape",
      "target": "eye-color"
    }
  ],
  "regions": [
    {
      "id": "eye-region",
      "type": "region",
      "x": 60,
      "y": 60,
      "width": 480,
      "height": 200,
      "data": {
        "label": "Eye Descriptors",
        "description": "Shape and color combinations",
        "color": "#4A90E2",
        "collapsed": false
      }
    }
  ]
}
```

## Automated Asset Generation

Use the asset generation script for batch creation:

```bash
node scripts/generate-assets.js
```

This script can:
- Convert existing prompt lists to PSG fragments
- Apply consistent formatting
- Add appropriate metadata and regions
- Validate fragment structure

## Validation

Before adding to the library:

1. **Structure Check**: Ensure valid JSON and required fields
2. **Node Validation**: All nodes have unique IDs and valid types
3. **Region Coverage**: Multi-node fragments have regions
4. **Weight Balance**: Options have reasonable weight distribution
5. **Concatenation Test**: Fragment works with upstream inputs

## Integration with Asset Browser

Once created, PSG files should be placed in:
- `assets/generated/` - For generated fragments
- `assets/fragments/` - For hand-crafted fragments
- `packages/asset-browser/public/graphs/` - For example graphs

The Asset Browser will automatically:
- Index new fragments on startup
- Display them in categorized sections
- Enable drag-and-drop into the editor
- Show preview on hover
- Track usage statistics

## Version History

- **v1.0.0** (Jan 2025): Initial PSG format with auto-concatenation
- **v0.9.0**: Beta format without regions
- **v0.8.0**: Original format with explicit Concat nodes

## Troubleshooting

### Common Issues

1. **Nodes not connecting**: Check edge sourceHandle/targetHandle match node handles
2. **No output**: Ensure proper edge connections, avoid Output nodes in fragments
3. **Region not showing**: Verify region encompasses all nodes with padding
4. **Concatenation issues**: Update to latest engine supporting auto-concatenation

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('DEBUG_EXECUTION', 'true');
```

This will show:
- Node execution order
- Input concatenation
- Output generation
- Edge traversal

## Additional Resources

- [PSG Format Specification](./technical-specs/file-format-specification.md)
- [Node Type Reference](./node-types.md)
- [Asset Browser Documentation](./asset-browser.md)
- [Example Fragments](../assets/generated/)