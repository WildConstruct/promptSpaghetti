# Migrate Assets to Browser Task

## Purpose
Convert and migrate generated assets to the asset browser's expected format and location

## Key Requirements
1. Convert `.json` files to `.psg` or `.psglib` format
2. Generate proper manifest for asset discovery
3. Move files to correct browser location
4. Maintain keyword/tag metadata for search

## Migration Process

### 1. File Format Conversion
```javascript
function convertToPSG(jsonFile) {
  const content = JSON.parse(fs.readFileSync(jsonFile));
  
  // PSG format is JSON with specific structure
  const psgContent = {
    version: "1.0.0",
    type: "psg",
    ...content,
    metadata: {
      ...content.metadata,
      format: "psg",
      migrated: new Date().toISOString()
    }
  };
  
  // Save with .psg extension
  const psgPath = jsonFile.replace('.json', '.psg');
  fs.writeFileSync(psgPath, JSON.stringify(psgContent, null, 2));
  return psgPath;
}
```

### 2. Generate Asset Manifest
```javascript
function generateManifest(assetDir) {
  const manifest = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    assets: [],
    categories: {},
    tags: new Set()
  };
  
  // Scan directory for .psg files
  const files = fs.readdirSync(assetDir)
    .filter(f => f.endsWith('.psg') || f.endsWith('.psglib'));
  
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(assetDir, file)));
    
    const asset = {
      id: path.basename(file, path.extname(file)),
      file: file,
      name: content.name || content.region?.name || "Unnamed Asset",
      category: content.region?.category || content.keywords?.primary || "general",
      subcategory: content.region?.subcategory || content.keywords?.secondary,
      tags: content.keywords?.tags || [],
      nodeCount: content.nodes?.length || 0,
      type: content.nodes?.[0]?.type || "mixed"
    };
    
    manifest.assets.push(asset);
    
    // Aggregate categories and tags
    if (!manifest.categories[asset.category]) {
      manifest.categories[asset.category] = [];
    }
    manifest.categories[asset.category].push(asset.id);
    
    asset.tags.forEach(tag => manifest.tags.add(tag));
  }
  
  manifest.tags = Array.from(manifest.tags);
  
  // Save manifest
  fs.writeFileSync(
    path.join(assetDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  return manifest;
}
```

### 3. Directory Structure
```
/assets/
  /library/           # Browser reads from here
    /character/       # Category folders
      manifest.json   # Category manifest
      *.psg          # Asset files
    /environment/
    /narrative/
    manifest.json    # Master manifest
  /generated/        # Agent output location
    /[timestamp]/    # Generation sessions
```

### 4. Migration Command
```javascript
function migrateAssets(sourceDir, targetCategory) {
  const targetDir = path.join('assets', 'library', targetCategory);
  
  // Ensure target directory exists
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Find all JSON files in source
  const jsonFiles = glob.sync(path.join(sourceDir, '**/*.json'));
  
  for (const jsonFile of jsonFiles) {
    // Skip manifest files
    if (jsonFile.includes('manifest.json')) continue;
    
    // Convert to PSG
    const psgPath = convertToPSG(jsonFile);
    
    // Move to library
    const filename = path.basename(psgPath);
    const targetPath = path.join(targetDir, filename);
    fs.renameSync(psgPath, targetPath);
    
    console.log(`Migrated: ${filename} -> ${targetCategory}/`);
  }
  
  // Generate manifest for category
  const manifest = generateManifest(targetDir);
  console.log(`Generated manifest with ${manifest.assets.length} assets`);
  
  // Update master manifest
  updateMasterManifest();
  
  return manifest;
}
```

### 5. Usage Examples

#### From Agent
```bash
# Migrate latest generation to character category
node migrate-assets.js assets/generated/micro-expressions character

# Migrate with category detection
node migrate-assets.js assets/generated/latest --auto-category
```

#### In Agent Command
```yaml
commands:
  - migrate {category}: Move generated assets to library for browser discovery
```

### 6. Validation Checklist
- [ ] Files have .psg extension
- [ ] Manifest includes all required fields
- [ ] Keywords/tags preserved for search
- [ ] Category folders created
- [ ] Master manifest updated
- [ ] Old JSON files cleaned up

### Success Metrics
- Assets appear in browser within 5 seconds
- Search finds assets by keywords
- Categories properly organized
- No duplicate assets created