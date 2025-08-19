# PSG Asset Creator Guide

## For Aspen - Asset Fragment Creation Best Practices

### Quick Reference

```json
{
  "version": "1.0.0",
  "name": "Your Fragment Name",
  "description": "What this fragment does",
  "metadata": {
    "type": "MULTI-ASPECT",  // or "ASSET_FRAGMENT"
    "author": "Aspen",
    "category": "category-name",
    "tags": ["tag1", "tag2"]
  },
  "nodes": [...],
  "edges": [...],  // REQUIRED for connected nodes!
  "regions": [...]  // REQUIRED for fragments!
}
```

### 🚨 Critical Rules for Fragments

1. **NO Output Nodes in Fragments**
   - Fragments should NEVER contain Output nodes
   - Output nodes should only exist in complete graphs
   - Fragments are building blocks that get connected to outputs later

2. **Always Include Edges**
   - If nodes should be connected, you MUST include edges
   - Edges won't be created automatically
   - Each edge needs: id, source node id, target node id

3. **Always Include a Region**
   - Fragments must have at least one region
   - The region creates the visual bounding box
   - Region nodes array should list all node IDs

### Fragment Structure

#### Correct Fragment Example

```json
{
  "version": "1.0.0",
  "name": "Eye Descriptor System",
  "description": "Multi-aspect eye description",
  "metadata": {
    "type": "MULTI-ASPECT",
    "author": "Aspen",
    "category": "facial-features",
    "tags": ["eyes", "face", "descriptors"]
  },
  "nodes": [
    {
      "id": "eye-shape",
      "type": "WeightedChoice",
      "name": "Eye Shape",
      "x": 100,
      "y": 100,
      "options": [...]
    },
    {
      "id": "eye-color",
      "type": "WeightedChoice", 
      "name": "Eye Color",
      "x": 100,
      "y": 300,
      "options": [...]
    }
  ],
  "edges": [
    {
      "id": "shape-to-color",
      "source": "eye-shape",
      "target": "eye-color"
    }
  ],
  "regions": [
    {
      "id": "eye-system",
      "name": "Eye Descriptor Fragment",
      "color": "#9370DB",
      "nodes": ["eye-shape", "eye-color"],
      "description": "Complete eye description system"
    }
  ]
}
```

### Node Types Reference

| Node Type | Purpose | Key Properties |
|-----------|---------|----------------|
| `WeightedChoice` | Random selection from options | `options` array with `text` and `weight` |
| `Concat` | Combine multiple inputs | `separator` (default: " ") |
| `Variable` | Store/retrieve values | `variableName`, `mode` |
| `TextBlock` | Static text | `template` or `text` |

### Edge Structure

```json
{
  "id": "unique-edge-id",
  "source": "source-node-id",
  "target": "target-node-id"
}
```

- Edge IDs should be descriptive: `"shape-to-color"`, `"color-to-size"`
- Source is the node outputting data
- Target is the node receiving data

### Region Structure

```json
{
  "id": "region-id",
  "name": "Display Name",
  "color": "#9370DB",  // Optional: border color
  "nodes": ["node1", "node2", "node3"],  // ALL node IDs in this region
  "description": "What this region does"
}
```

### Layout Best Practices

1. **Vertical Stacking** (Recommended for 2-5 nodes)
   ```
   x: 100 for all nodes
   y: 100, 300, 500, 700... (200px spacing)
   ```

2. **Grid Layout** (For 6+ nodes)
   ```
   Column 1: x=100, y=100, 300, 500
   Column 2: x=600, y=100, 300, 500
   ```

3. **Node Spacing**
   - Vertical: 200-250px between nodes
   - Horizontal: 500-550px between columns
   - This accounts for WeightedChoice nodes being ~400px wide

### Validation Checklist

Before submitting a fragment, verify:

- [ ] NO Output nodes in the fragment
- [ ] All nodes that should connect have edges
- [ ] Fragment has at least one region
- [ ] Region includes all node IDs
- [ ] Node IDs are unique and descriptive
- [ ] Metadata includes type: "MULTI-ASPECT" or "ASSET_FRAGMENT"
- [ ] Layout has adequate spacing (200px+ vertical, 500px+ horizontal)

### Testing Your Fragment

1. **Validate JSON syntax**
   ```bash
   # Check if JSON is valid
   cat your-fragment.psg | jq '.'
   ```

2. **Run validation script**
   ```bash
   node scripts/validate-psg-fragments.js
   ```

3. **Check in browser**
   - Open the app
   - Go to Asset Browser
   - Find your fragment
   - Drag it to canvas
   - Verify:
     - All nodes appear
     - Edges are connected
     - Bounding box contains everything
     - Can collapse/expand the box

### Common Mistakes to Avoid

❌ **DON'T include Output nodes in fragments**
```json
// WRONG - Fragment with Output
{
  "nodes": [
    {"id": "choice", "type": "WeightedChoice", ...},
    {"id": "output", "type": "Output", ...}  // ❌ Remove this!
  ]
}
```

❌ **DON'T forget edges**
```json
// WRONG - Nodes without edges
{
  "nodes": [{"id": "a", ...}, {"id": "b", ...}],
  "edges": []  // ❌ Nodes aren't connected!
}
```

❌ **DON'T forget regions**
```json
// WRONG - Fragment without region
{
  "nodes": [...],
  "edges": [...],
  "regions": []  // ❌ Need at least one region!
}
```

✅ **DO connect nodes in logical flow**
```json
// CORRECT - Connected nodes with edges
{
  "nodes": [{"id": "a", ...}, {"id": "b", ...}],
  "edges": [{"id": "a-to-b", "source": "a", "target": "b"}],
  "regions": [{"id": "region", "nodes": ["a", "b"], ...}]
}
```

### File Organization

Place fragments in appropriate category folders:
```
assets/library/
├── facial-features/
│   ├── eye-descriptors.psg
│   ├── facial-hair.psg
│   └── skin-tones.psg
├── personality/
│   ├── traits-positive.psg
│   └── quirks.psg
└── clothing/
    ├── casual-wear.psg
    └── formal-wear.psg
```

### Questions or Issues?

If you encounter issues or have questions:

1. Run the validation script first
2. Check this guide for common mistakes
3. Test in the browser
4. Ask for help with specific error messages

Remember: Fragments are reusable building blocks. Keep them modular, well-connected, and without outputs!