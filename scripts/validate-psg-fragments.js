#!/usr/bin/env node

/**
 * PSG Fragment Validation and Sync Script
 * 
 * This script:
 * 1. Validates all PSG fragment files
 * 2. Ensures fragments don't have Output nodes
 * 3. Syncs files from assets/ to client/public/assets/
 * 4. Updates manifest with correct node/edge counts
 * 5. Validates edge connections
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/library');
const PUBLIC_DIR = path.join(__dirname, '../client/public/assets/library');
const MANIFEST_FILE = path.join(ASSETS_DIR, 'asset-fragments-manifest.json');
const PUBLIC_MANIFEST = path.join(PUBLIC_DIR, 'asset-fragments-manifest.json');

const errors = [];
const warnings = [];
const fixed = [];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validatePSGFile(filePath) {
  const fileName = path.basename(filePath);
  const relPath = path.relative(ASSETS_DIR, filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const psg = JSON.parse(content);
    
    const issues = [];
    const fixes = [];
    
    // Check if it's a fragment
    const isFragment = psg.metadata?.type === 'MULTI-ASPECT' || 
                      psg.metadata?.type === 'ASSET_FRAGMENT' || 
                      psg.regions?.length > 0;
    
    if (isFragment) {
      // Fragments should NOT have Output nodes
      const outputNodes = psg.nodes.filter(n => n.type === 'Output');
      if (outputNodes.length > 0) {
        issues.push(`Fragment has ${outputNodes.length} Output node(s) - removing`);
        
        // Remove Output nodes
        const outputIds = new Set(outputNodes.map(n => n.id));
        psg.nodes = psg.nodes.filter(n => n.type !== 'Output');
        
        // Remove edges connected to Output nodes
        if (psg.edges) {
          const originalEdgeCount = psg.edges.length;
          psg.edges = psg.edges.filter(e => 
            !outputIds.has(e.source) && !outputIds.has(e.target)
          );
          if (psg.edges.length < originalEdgeCount) {
            fixes.push(`Removed ${originalEdgeCount - psg.edges.length} edges connected to Output nodes`);
          }
        }
        
        // Update regions to remove Output nodes
        if (psg.regions) {
          psg.regions.forEach(region => {
            if (region.nodes) {
              const originalCount = region.nodes.length;
              region.nodes = region.nodes.filter(nodeId => !outputIds.has(nodeId));
              if (region.nodes.length < originalCount) {
                fixes.push(`Removed ${originalCount - region.nodes.length} Output nodes from region ${region.id}`);
              }
            }
          });
        }
      }
      
      // Validate edges exist and are properly connected
      if (!psg.edges || psg.edges.length === 0) {
        if (psg.nodes.length > 1) {
          warnings.push(`${relPath}: Fragment has ${psg.nodes.length} nodes but no edges`);
        }
      } else {
        // Check all edges reference valid nodes
        const nodeIds = new Set(psg.nodes.map(n => n.id));
        const invalidEdges = psg.edges.filter(e => 
          !nodeIds.has(e.source) || !nodeIds.has(e.target)
        );
        
        if (invalidEdges.length > 0) {
          issues.push(`${invalidEdges.length} edges reference non-existent nodes`);
          psg.edges = psg.edges.filter(e => 
            nodeIds.has(e.source) && nodeIds.has(e.target)
          );
          fixes.push(`Removed ${invalidEdges.length} invalid edges`);
        }
      }
      
      // Check regions are properly configured
      if (psg.regions && psg.regions.length > 0) {
        psg.regions.forEach(region => {
          // Ensure region has required fields
          if (!region.name) {
            region.name = psg.name || 'Asset Fragment';
            fixes.push(`Added missing region name`);
          }
          
          // Validate region nodes exist
          if (region.nodes) {
            const nodeIds = new Set(psg.nodes.map(n => n.id));
            const invalidNodes = region.nodes.filter(id => !nodeIds.has(id));
            if (invalidNodes.length > 0) {
              region.nodes = region.nodes.filter(id => nodeIds.has(id));
              fixes.push(`Removed ${invalidNodes.length} invalid node references from region`);
            }
          }
        });
      }
    }
    
    // If we made fixes, save the file
    if (fixes.length > 0) {
      fs.writeFileSync(filePath, JSON.stringify(psg, null, 2));
      fixed.push({ file: relPath, fixes });
      
      // Also update the public version
      const publicPath = path.join(PUBLIC_DIR, relPath);
      const publicDir = path.dirname(publicPath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicPath, JSON.stringify(psg, null, 2));
    }
    
    if (issues.length > 0 && fixes.length === 0) {
      errors.push({ file: relPath, issues });
    }
    
    return {
      valid: issues.length === 0,
      nodeCount: psg.nodes?.length || 0,
      edgeCount: psg.edges?.length || 0,
      isFragment,
      hasRegions: psg.regions?.length > 0
    };
    
  } catch (error) {
    errors.push({ 
      file: relPath, 
      issues: [`Failed to parse: ${error.message}`] 
    });
    return { valid: false };
  }
}

function syncToPublic(srcPath, publicPath) {
  try {
    const srcContent = fs.readFileSync(srcPath, 'utf8');
    const publicDir = path.dirname(publicPath);
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Check if public version exists and is different
    let needsUpdate = true;
    if (fs.existsSync(publicPath)) {
      const publicContent = fs.readFileSync(publicPath, 'utf8');
      needsUpdate = srcContent !== publicContent;
    }
    
    if (needsUpdate) {
      fs.writeFileSync(publicPath, srcContent);
      return true;
    }
    return false;
  } catch (error) {
    errors.push({
      file: path.relative(ASSETS_DIR, srcPath),
      issues: [`Failed to sync: ${error.message}`]
    });
    return false;
  }
}

function findAllPSGFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findAllPSGFiles(fullPath, files);
    } else if (item.endsWith('.psg')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function updateManifest() {
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
    let updated = false;
    
    // Update each entry with correct counts
    manifest.fragments = manifest.fragments || [];
    
    manifest.fragments.forEach(fragment => {
      if (fragment.path) {
        const fullPath = path.join(ASSETS_DIR, fragment.path.replace('./', ''));
        if (fs.existsSync(fullPath)) {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          
          const oldNodeCount = fragment.nodeCount;
          const oldEdgeCount = fragment.edgeCount;
          
          fragment.nodeCount = content.nodes?.length || 0;
          fragment.edgeCount = content.edges?.length || 0;
          
          if (oldNodeCount !== fragment.nodeCount || oldEdgeCount !== fragment.edgeCount) {
            updated = true;
            log(`  Updated ${fragment.id}: nodes ${oldNodeCount}→${fragment.nodeCount}, edges ${oldEdgeCount || 0}→${fragment.edgeCount}`, 'cyan');
          }
        }
      }
    });
    
    if (updated) {
      fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
      fs.writeFileSync(PUBLIC_MANIFEST, JSON.stringify(manifest, null, 2));
      log('✅ Manifest updated', 'green');
    } else {
      log('✅ Manifest already up to date', 'green');
    }
    
  } catch (error) {
    errors.push({
      file: 'manifest',
      issues: [`Failed to update: ${error.message}`]
    });
  }
}

// Main execution
function main() {
  log('\n🔍 PSG Fragment Validation & Sync Tool\n', 'blue');
  
  // Find all PSG files
  const psgFiles = findAllPSGFiles(ASSETS_DIR);
  log(`Found ${psgFiles.length} PSG files to validate\n`, 'cyan');
  
  // Validate each file
  let validCount = 0;
  let fragmentCount = 0;
  let syncedCount = 0;
  
  psgFiles.forEach(file => {
    const result = validatePSGFile(file);
    if (result.valid) validCount++;
    if (result.isFragment) fragmentCount++;
    
    // Sync to public
    const relPath = path.relative(ASSETS_DIR, file);
    const publicPath = path.join(PUBLIC_DIR, relPath);
    if (syncToPublic(file, publicPath)) {
      syncedCount++;
    }
  });
  
  // Update manifest
  log('\n📋 Updating Manifest...', 'blue');
  updateManifest();
  
  // Report results
  log('\n📊 Validation Results:', 'blue');
  log(`  Total files: ${psgFiles.length}`, 'cyan');
  log(`  Valid files: ${validCount}`, validCount === psgFiles.length ? 'green' : 'yellow');
  log(`  Fragments: ${fragmentCount}`, 'cyan');
  log(`  Files synced: ${syncedCount}`, syncedCount > 0 ? 'green' : 'cyan');
  
  if (fixed.length > 0) {
    log('\n✨ Fixed Issues:', 'green');
    fixed.forEach(({ file, fixes }) => {
      log(`  ${file}:`, 'cyan');
      fixes.forEach(fix => log(`    - ${fix}`, 'green'));
    });
  }
  
  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    warnings.forEach(warning => {
      log(`  ${warning}`, 'yellow');
    });
  }
  
  if (errors.length > 0) {
    log('\n❌ Errors:', 'red');
    errors.forEach(({ file, issues }) => {
      log(`  ${file}:`, 'red');
      issues.forEach(issue => log(`    - ${issue}`, 'red'));
    });
    process.exit(1);
  }
  
  log('\n✅ Validation complete!', 'green');
}

// Run the script
main();