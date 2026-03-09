# Asset Creation Guide for Prompt Spaghetti

## Overview

This guide explains how to create reusable asset fragments (PSG files) for the Prompt Spaghetti asset browser. Assets are modular prompt components that can be drag-and-dropped into the graph editor.

For the current MVP PSG source contract, use `docs/psg-weekend-mvp-contract.md` as the canonical reference. This guide is still useful for authoring direction, but some older examples below are historical and not the preferred source schema.

Copyable canonical example:

- `docs/examples/psg-weekend-mvp-canonical-example.psg`

## Asset Fragment Structure

### PSG File Format

PSG (Prompt Spaghetti Graph) files are JSON documents that define reusable graph fragments:

Historical note: the preferred weekend-MVP PSG shape is a flat fragment document with top-level `version`, `name`, `description`, `metadata`, `nodes`, `edges`, and optional `regions`. Avoid treating top-level `type` as the canonical fragment discriminator.

```json
{
  "version": "1.0.0",
  "name": "Fragment Name",
  "description": "Brief description of what this fragment generates",
  "metadata": {
    "category": "category-name",
    "type": "ASSET_FRAGMENT",
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

Weekend-MVP authoring subset:

- `WeightedChoice`
- `TextBlock`
- `Concat`
- `Output`

The runtime still supports a wider compatibility set, but new MVP asset authoring should stay inside this four-node subset unless you are intentionally maintaining an older asset.

### 1. WeightedChoice

Most common node type for generating variations:

```json
{
  "id": "unique-node-id",
  "type": "WeightedChoice",
  "x": 100,
  "y": 100,
  "options": [
    {
      "id": "opt-1",
      "text": "option text",
      "weight": 10
    }
  ]
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
  "value": "Static text content"
}
```

### 3. Output (Deprecated for Fragments)

This guidance is stale.

The live runtime preserves `Output` nodes during PSG conversion and may deduplicate or retarget them later during insertion. For weekend MVP, `Output` is allowed in PSG fragments, though authors should still use it intentionally.

## Region Requirements

### Single-Node Fragments

- Do NOT require regions
- The node stands alone as a self-contained unit

### Multi-Node Fragments

- Prefer semantic `regions` for fragment grouping
- Do not model regions as editor bounding-box state in canonical PSG unless you are maintaining backward-compatible legacy assets

```json
"regions": [
  {
    "id": "region-fragment-name",
    "name": "Fragment Group Name",
    "color": "#4A90E2",
    "nodes": ["node-a", "node-b"],
    "description": "What this group does"
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

Historical note: `output` / `input` are not the canonical default handle ids for the live runtime contract.

```json
"edges": [
  {
    "id": "edge-1",
    "source": "node-1",
    "target": "node-2",
    "sourceHandle": "source",  // Optional, preferred generic source handle
    "targetHandle": "target"   // Optional, preferred generic target handle
  }
]
```

When handles are omitted, import normalization applies the live runtime defaults. For current canonical handle rules, including `Concat` and weighted branch handles, see `docs/psg-weekend-mvp-contract.md`.

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

### 3.5 Fragment sizing

Aim for semantic chunks, not isolated tokens and not full prompt paragraphs.

Good examples:

- `weathered urban storefront`
- `with practical trim and worn paint`
- `under harsh fluorescent light`
- `cinematic still with restrained palette`

Bad examples:

- `weathered`
- `urban`
- `storefront`

Also bad:

- a long fully composed paragraph that only works in one exact asset family

Use this rule:

- if a fragment is too large to reuse across families, it is too large
- if it is too small to read as a meaningful unit, it is too small
- if grammar regularly breaks during recombination, that is a future conditional-resolution problem, not a signal to atomize the fragment further

### 4. Testing

- Test fragments in the editor before saving
- Verify all options generate appropriate content
- Check concatenation behavior with upstream nodes

## Example: Complete Multi-Node Fragment

Historical note: the example below contains legacy region/editor-shaped fields. Use `docs/psg-weekend-mvp-contract.md` for the preferred minimal source contract.

```json
{
  "version": "1.0.0",
  "name": "Eye Description System",
  "description": "Comprehensive eye descriptors",
  "metadata": {
    "category": "facial-features",
    "type": "ASSET_FRAGMENT",
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
      "options": [
        { "id": "1", "text": "almond-shaped", "weight": 20 },
        { "id": "2", "text": "round", "weight": 15 },
        { "id": "3", "text": "hooded", "weight": 15 }
      ]
    },
    {
      "id": "eye-color",
      "type": "WeightedChoice",
      "x": 350,
      "y": 100,
      "options": [
        { "id": "1", "text": "deep brown", "weight": 30 },
        { "id": "2", "text": "bright blue", "weight": 20 },
        { "id": "3", "text": "emerald green", "weight": 15 }
      ]
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
      "name": "Eye Descriptors",
      "description": "Shape and color combinations",
      "color": "#4A90E2",
      "nodes": ["eye-shape", "eye-color"]
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
3. **Region Coverage**: Multi-node fragments use semantic `regions` when grouping is needed
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
2. **No output**: Ensure proper edge connections and verify how imported outputs interact with an existing destination output node
3. **Region not showing**: Verify the fragment uses the expected semantic `regions` shape or a supported legacy compatibility shape
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

- [PSG Weekend MVP Contract](./psg-weekend-mvp-contract.md)
- [Canonical Weekend MVP PSG Example](./examples/psg-weekend-mvp-canonical-example.psg)
- [PSG Format Specification](./technical-specs/file-format-specification.md)
- [Node Type Reference](./node-types.md)
- [Asset Browser Documentation](./asset-browser.md)
- [Example Fragments](../assets/generated/)
