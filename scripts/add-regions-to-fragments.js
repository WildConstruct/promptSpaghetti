#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing PSG files
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'generated');

// Function to add regions to multi-node PSG files
function addRegionsToFragment(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Skip if already has regions
    if (data.regions && data.regions.length > 0) {
      console.log(`✓ ${path.basename(filePath)} already has regions`);
      return false;
    }
    
    // Only process multi-node fragments (more than 1 node)
    if (!data.nodes || data.nodes.length <= 1) {
      console.log(`⊘ ${path.basename(filePath)} is single-node, skipping`);
      return false;
    }
    
    // Extract metadata for region label
    const name = data.metadata?.name || data.name || 'Fragment Group';
    const description = data.metadata?.description || data.description || '';
    
    // Calculate bounding box for all nodes
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    data.nodes.forEach(node => {
      const x = node.x || 0;
      const y = node.y || 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      // Estimate node size (width: 250, height: 150 for most nodes)
      maxX = Math.max(maxX, x + 250);
      maxY = Math.max(maxY, y + 150);
    });
    
    // Add padding to region
    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    // Create region
    const regionId = `region-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const region = {
      id: regionId,
      type: 'region',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      data: {
        label: name,
        description: description,
        color: getRegionColor(data.metadata?.category),
        collapsed: false
      }
    };
    
    // Add regions array if it doesn't exist
    if (!data.regions) {
      data.regions = [];
    }
    
    // Add the region
    data.regions.push(region);
    
    // Assign nodes to the region
    data.nodes.forEach(node => {
      if (!node.data) {
        node.data = {};
      }
      node.data.region = regionId;
    });
    
    // Write back the modified file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ ${path.basename(filePath)} - Added region "${name}"`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get appropriate region color based on category
function getRegionColor(category) {
  const colorMap = {
    'facial-features': '#4A90E2',  // Blue
    'hair': '#E94B3C',              // Red
    'body-silhouette': '#6B5B95',   // Purple
    'movement': '#88B04B',          // Green
    'accessories': '#F7786B',       // Coral
    'clothing': '#91A8D0',          // Light blue
    'age': '#FFD662',               // Yellow
    'default': '#6C757D'            // Gray
  };
  
  return colorMap[category] || colorMap.default;
}

// Process all PSG files
function processAllFragments() {
  console.log('🔍 Scanning for PSG fragments...\n');
  
  const files = fs.readdirSync(ASSETS_DIR)
    .filter(file => file.endsWith('.psg'))
    .map(file => path.join(ASSETS_DIR, file));
  
  console.log(`Found ${files.length} PSG files\n`);
  
  let updated = 0;
  files.forEach(file => {
    if (addRegionsToFragment(file)) {
      updated++;
    }
  });
  
  console.log(`\n✨ Updated ${updated} fragments with regions`);
}

// Run the script
processAllFragments();