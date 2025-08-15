# Update Asset Manifest Task

## Purpose
Update the asset-fragments-manifest.json file after generating and migrating new asset fragments to the library.

## Manifest Location
`/assets/library/asset-fragments-manifest.json`

## Manifest Structure
```json
{
  "version": "1.0.0",
  "type": "asset-fragments",
  "categories": {
    "[category-key]": {
      "name": "Display Name",
      "icon": "emoji",
      "path": "./[category-folder]/",
      "fragments": [...]
    }
  }
}
```

## Update Process

### 1. Determine Category
- **facial-features**: Eyes, smiles, skin, age, symmetry, iconic features
- **hair**: Lengths, textures, colors, styles, accessories, motion
- **body**: Body types, posture, movement, scars/tattoos
- **emotions**: Mood states, expressions, intensity modifiers
- **settings**: Environments, lighting, weather, atmospherics
- Create new category if needed

### 2. Add Fragment Entry
Each fragment needs:
```json
{
  "file": "filename.psg",
  "id": "fragment-[category]-[descriptive-name]",
  "name": "Display Name",
  "type": "SIMPLE|CONTEXTUAL|MULTI-ASPECT",
  "nodes": number,
  "options": number,  // for WeightedChoice nodes
  "combinations": number,  // for contextual systems
  "region": "color-name",
  "collapsible": true
}
```

### 3. Color Coding Guidelines
- **Facial Features**: Purple shades (plum, medium-purple, etc.)
- **Hair**: Brown/earth tones (peru, chocolate, saddle-brown)
- **Body**: Blue shades (steel-blue, royal-blue)
- **Emotions**: Warm colors (gold, orange, red)
- **Settings**: Green shades (forest-green, sea-green)

### 4. File Organization
1. Generate in: `/assets/generated/`
2. Migrate to: `/assets/library/[category]/`
3. Update manifest with new entries
4. Maintain alphabetical order within categories

### 5. Statistics Update
After adding fragments, update:
```json
"statistics": {
  "total_fragments": count_all,
  "total_nodes": sum_of_nodes,
  "total_options": sum_of_options,
  "categories": category_count
}
```

## Example Workflow

1. Generate assets using `*generate-batch`
2. Organize into categories
3. Migrate files: `cp generated/*.psg library/[category]/`
4. Update manifest:
   - Add entries to appropriate category
   - Update statistics
   - Set lastUpdated timestamp
5. Test in asset browser Fragments tab

## Important Notes

- **IDs must be unique** across entire manifest
- **File paths are relative** to category folder
- **Single region grouping** for collapsibility
- **Type accurately** (SIMPLE for single node, CONTEXTUAL for systems)
- **Test drag-drop** after updates to ensure browser compatibility

## Related Documentation
- `/docs/asset-fragment-manifest-system.md`
- `/docs/backlog/assetGenerationBacklog.md`