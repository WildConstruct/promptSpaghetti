# Asset Fragment Manifest System

## Overview

The Asset Fragment Manifest System is a separate manifest type specifically for **modular asset fragments** - reusable building blocks that can be combined into larger graphs. This is distinct from the existing preset and graph manifest systems.

## Manifest Types in Prompt Spaghetti

1. **Presets Manifest** (`presets/manifest.json`)
   - Complete, ready-to-use generators
   - File format: `.psglib`
   - Location: `/packages/asset-browser/public/presets/`

2. **Graphs Manifest** (`graphs/manifest.json`)
   - Standalone graph files
   - File format: `.psg`
   - Location: `/packages/asset-browser/public/graphs/`

3. **Asset Fragments Manifest** (`asset-fragments-manifest.json`) ← NEW
   - Modular building blocks
   - File format: `.psg`
   - Location: `/assets/library/`

## Asset Fragment Structure

### Directory Layout
```
assets/
├── generated/          # Raw output from asset generator
│   └── *.psg          # Individual fragment files
└── library/           # Organized for browser discovery
    ├── asset-fragments-manifest.json
    ├── facial-features/
    │   └── *.psg
    ├── hair/
    │   └── *.psg
    └── [future categories]/
```

### Manifest Schema

```json
{
  "version": "1.0.0",
  "type": "asset-fragments",
  "name": "Modular Asset Fragments Library",
  "categories": {
    "[category-key]": {
      "name": "Display Name",
      "description": "Category description",
      "icon": "emoji",
      "path": "./relative/path/",
      "fragments": [
        {
          "file": "filename.psg",
          "id": "fragment-unique-id",
          "name": "Display Name",
          "type": "SIMPLE|CONTEXTUAL|MULTI-ASPECT",
          "nodes": number,
          "options": number,
          "region": "color-name",
          "collapsible": true
        }
      ]
    }
  }
}
```

## Fragment Design Principles

1. **Single Region Grouping**: Each fragment uses one region for collapsibility
2. **Self-Contained**: Works standalone but designed for combination
3. **Consistent Metadata**: Rich metadata for discovery and integration
4. **Color Coding**: Each fragment type has a distinct region color

## Asset Generation Workflow

1. **Generate**: Use `/asset` command to load Aspen persona
2. **Create**: Generate fragments using the asset generator
3. **Migrate**: Move from `generated/` to `library/` with proper categorization
4. **Update Manifest**: Add new fragments to `asset-fragments-manifest.json`
5. **Test**: Verify in asset browser

## Updating the Manifest

When adding new asset fragments:

1. Place `.psg` files in appropriate category folder under `/assets/library/`
2. Update `asset-fragments-manifest.json` with fragment metadata
3. Ensure unique IDs follow pattern: `fragment-[category]-[name]`
4. Include all required fields (file, id, name, type, nodes, region, collapsible)

## Integration with Asset Browser

The asset browser should:
- Read `asset-fragments-manifest.json` separately from other manifests
- Display fragments as draggable components
- Support collapsing to single region when dropped
- Show fragment type badges (SIMPLE, CONTEXTUAL, etc.)

## Future Enhancements

- [ ] Auto-generate manifest from directory scan
- [ ] Add thumbnail generation for fragments
- [ ] Support fragment dependencies
- [ ] Add version tracking for fragments
- [ ] Create fragment combination templates

## Related Documentation

- `/docs/stories/1.6.asset-browser-psglib-ingestion-manifest-scan.md`
- `/docs/backlog/assetGenerationBacklog.md`
- `/.bmad-core/agents/asset-generator.yaml`

---

*Last Updated: 2025-01-15*
*Maintained by: Aspen (Asset Generator Agent)*