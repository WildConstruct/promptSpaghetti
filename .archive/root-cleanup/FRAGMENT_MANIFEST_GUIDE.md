# Fragment Manifest Integration Guide

## Important: How to Properly Create and Load Fragment Manifests

### The Problem
The asset browser expects manifests in either "minimal" or "npm-style" format with specific fields (`path`, `nodeTypes`), but our fragment manifests use a different structure focused on prompt fragments with nodes and groups.

### Current Working Solution
Instead of using the `scan()` method which expects the strict manifest format, we directly populate the asset browser store:

```typescript
// DON'T do this - incompatible format:
await scan([manifestData]);

// DO this - direct store update:
useAssetBrowserStore.setState({ 
  presets: presets,
  filteredPresets: presets,
  availableTags: tags,
  scanStatus: 'done',
  error: null
});
```

### How to Create New Fragment Manifests

1. **Location**: Place all fragment manifests in `/assets/library/`

2. **Naming Convention**: Use descriptive names like `character-traits.psg`, `weather-conditions.psg`, etc.

3. **Required Structure**:
```json
{
  "version": "1.0.0",
  "type": "asset-fragment",
  "metadata": {
    "id": "fragment-unique-id",
    "name": "Human Readable Name",
    "description": "What this fragment does",
    "author": "Creator Name",
    "created": "YYYY-MM-DD",
    "category": "category-type",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "nodes": [
    {
      "id": "node-id",
      "type": "WeightedChoice",
      "data": {
        "label": "Node Label",
        "region": "color-name",
        "options": [
          { "text": "option 1", "weight": 2 },
          { "text": "option 2", "weight": 1 }
        ]
      }
    }
  ],
  "groups": [
    {
      "id": "region-group-id",
      "nodeIds": ["node-id"],
      "color": "color-name"
    }
  ]
}
```

4. **Add to Master Manifest**: Update `/assets/library/asset-fragments-manifest.json`:
```json
{
  "version": "2.0.0",
  "fragments": [
    {
      "id": "fragment-unique-id",
      "name": "Human Readable Name",
      "description": "Description",
      "path": "./fragment-file.psg",
      "category": "category-type",
      "tags": ["tag1", "tag2"],
      "nodeCount": 1,
      "metadata": {
        "author": "Creator Name",
        "created": "YYYY-MM-DD",
        "updated": "YYYY-MM-DD",
        "version": "1.0.0"
      }
    }
  ]
}
```

### How the Loading Works

1. **FragmentManifestLoader** reads the master manifest from `/assets/library/asset-fragments-manifest.json`
2. It converts each fragment entry to a Preset format the asset browser understands
3. **EnhancedAssetBrowser** takes these presets and directly updates the store
4. The asset browser UI then shows all fragments with proper tags and search functionality

### Key Files to Know

- `/packages/asset-browser/src/services/FragmentManifestLoader.ts` - Loads and converts fragments
- `/packages/asset-browser/src/components/EnhancedAssetBrowser.tsx` - Integration component
- `/packages/asset-browser/src/stores/assetBrowserStore.ts` - State management
- `/assets/library/asset-fragments-manifest.json` - Master manifest listing all fragments
- `/assets/library/*.psg` - Individual fragment files

### DO NOT:
- Try to force fragment manifests through the `parseManifest()` function
- Use the `scan()` method with fragment data
- Mix fragment manifests with npm-style or minimal manifests
- Change the core manifest parser to accommodate fragments (it will break other functionality)

### DO:
- Create proper .psg files with the correct structure
- Update the master manifest when adding new fragments
- Use direct store updates when loading fragments
- Keep the existing clean UX of the asset browser
- Test that tags and search work after adding new fragments

### Testing Your Fragments
1. Add your .psg file to `/assets/library/`
2. Update the master manifest
3. Make sure dev server serves from public: `cp -r assets/library client/public/assets/`
4. Check browser console for "Fragment manifest loaded: X fragments"
5. Verify tags appear in sidebar
6. Test search functionality