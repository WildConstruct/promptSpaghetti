#!/usr/bin/env node

/**
 * Migration script for Fragment System Refactoring
 * Converts existing graphs from dual-system (Region Box + parentNode) to clean separation
 * 
 * Run with: node scripts/migrate-fragment-system.js [--dry-run] [--backup]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const USE_LEGACY_FRAGMENT_SYSTEM = process.env.USE_LEGACY_FRAGMENT_SYSTEM === 'true';
const DRY_RUN = process.argv.includes('--dry-run');
const CREATE_BACKUP = process.argv.includes('--backup');

// Statistics tracking
const stats = {
  filesProcessed: 0,
  graphsMigrated: 0,
  nodesConverted: 0,
  errors: [],
  warnings: [],
};

/**
 * Detect if a graph uses the old dual-system
 */
function needsMigration(graph) {
  if (!graph.nodes || !Array.isArray(graph.nodes)) {
    return false;
  }

  // Check for enhancedBoundingBox nodes that have children with parentNode
  const hasProblematicPattern = graph.nodes.some(node => {
    if (node.type === 'enhancedBoundingBox') {
      // Check if any other nodes have this box as parent
      const hasChildren = graph.nodes.some(child => 
        child.parentNode === node.id
      );
      if (hasChildren) {
        return true; // Found old pattern
      }
    }
    return false;
  });

  // Check for nodes that are both in a region and have parentNode
  const hasDualSystem = graph.nodes.some(node => {
    return node.parentNode && node.data?.inRegion;
  });

  return hasProblematicPattern || hasDualSystem;
}

/**
 * Migrate a single graph from old to new system
 */
function migrateGraph(graph, filename) {
  const migrated = JSON.parse(JSON.stringify(graph)); // Deep clone
  const conversionLog = [];

  // Track which enhancedBoundingBoxes are actually fragments
  const fragmentBoxes = new Set();

  // Step 1: Identify fragment boxes (those with children)
  migrated.nodes.forEach(node => {
    if (node.type === 'enhancedBoundingBox') {
      const hasChildren = migrated.nodes.some(child => 
        child.parentNode === node.id
      );
      if (hasChildren) {
        fragmentBoxes.add(node.id);
        conversionLog.push(`Identified fragment box: ${node.id}`);
      }
    }
  });

  // Step 2: Convert fragment boxes to FragmentContainers
  migrated.nodes = migrated.nodes.map(node => {
    if (fragmentBoxes.has(node.id)) {
      // Count children
      const childCount = migrated.nodes.filter(n => n.parentNode === node.id).length;
      
      // Convert to FragmentContainer
      const fragmentContainer = {
        ...node,
        type: 'fragmentContainer',
        data: {
          title: node.data?.title || 'Migrated Fragment',
          description: node.data?.description || '',
          isCollapsed: node.data?.isCollapsed || false,
          fragmentSource: `migrated-${filename}`,
          nodeCount: childCount,
        },
        style: {
          ...node.style,
          zIndex: 1, // Ensure proper layering
        },
      };

      // Remove region box specific properties
      delete fragmentContainer.data.backgroundColor;
      delete fragmentContainer.data.borderColor;
      delete fragmentContainer.data.borderStyle;
      delete fragmentContainer.data.borderWidth;
      delete fragmentContainer.data.locked;
      delete fragmentContainer.data.ports;
      delete fragmentContainer.data.autoLayout;

      stats.nodesConverted++;
      conversionLog.push(`Converted ${node.id} to FragmentContainer`);
      
      return fragmentContainer;
    }
    return node;
  });

  // Step 3: Clean up nodes that have both parentNode and region membership
  migrated.nodes = migrated.nodes.map(node => {
    if (node.parentNode && fragmentBoxes.has(node.parentNode)) {
      // This is a fragment child, ensure proper setup
      const updated = {
        ...node,
        extent: 'parent', // Ensure containment
      };
      
      // Remove any region box properties
      if (updated.data) {
        delete updated.data.inRegion;
      }
      
      return updated;
    } else if (node.parentNode && !fragmentBoxes.has(node.parentNode)) {
      // This node has a parent that's not a fragment box
      // This might be an error or old data
      stats.warnings.push(`Node ${node.id} has parentNode ${node.parentNode} which is not a fragment container`);
    }
    
    return node;
  });

  // Step 4: Validate edges are still valid
  if (migrated.edges) {
    migrated.edges = migrated.edges.filter(edge => {
      const sourceExists = migrated.nodes.some(n => n.id === edge.source);
      const targetExists = migrated.nodes.some(n => n.id === edge.target);
      
      if (!sourceExists || !targetExists) {
        stats.warnings.push(`Removed invalid edge: ${edge.id || `${edge.source}->${edge.target}`}`);
        return false;
      }
      return true;
    });
  }

  // Add migration metadata
  migrated.metadata = migrated.metadata || {};
  migrated.metadata.migrationVersion = '1.0.0';
  migrated.metadata.migrationDate = new Date().toISOString();
  migrated.metadata.migrationLog = conversionLog;

  stats.graphsMigrated++;
  
  return migrated;
}

/**
 * Process a single file
 */
function processFile(filepath) {
  try {
    console.log(`Processing: ${filepath}`);
    
    const content = fs.readFileSync(filepath, 'utf8');
    let data;
    
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.log(`  Skipping - not valid JSON`);
      return;
    }

    if (!needsMigration(data)) {
      console.log(`  No migration needed`);
      return;
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would migrate this file`);
      const testMigrated = migrateGraph(data, path.basename(filepath));
      console.log(`  [DRY RUN] Would convert ${stats.nodesConverted} nodes`);
      return;
    }

    // Create backup if requested
    if (CREATE_BACKUP) {
      const backupPath = filepath + '.backup-' + Date.now();
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup: ${backupPath}`);
    }

    // Perform migration
    const migrated = migrateGraph(data, path.basename(filepath));
    
    // Write migrated data
    fs.writeFileSync(filepath, JSON.stringify(migrated, null, 2));
    console.log(`  ✅ Migrated successfully`);
    
    stats.filesProcessed++;
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    stats.errors.push({ file: filepath, error: error.message });
  }
}

/**
 * Find all graph files to process
 */
function findGraphFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        // Look for potential graph files
        if (entry.name.endsWith('.json') || 
            entry.name.endsWith('.psg') || 
            entry.name.endsWith('.psglib')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Main migration function
 */
function main() {
  console.log('Fragment System Migration Script');
  console.log('=================================\n');
  
  if (USE_LEGACY_FRAGMENT_SYSTEM) {
    console.log('⚠️  Legacy fragment system is enabled. Migration skipped.');
    process.exit(0);
  }
  
  if (DRY_RUN) {
    console.log('🔍 Running in DRY RUN mode - no files will be modified\n');
  }
  
  if (CREATE_BACKUP) {
    console.log('💾 Backup mode enabled - original files will be preserved\n');
  }

  // Find files to process
  const searchDirs = [
    path.join(process.cwd(), 'assets'),
    path.join(process.cwd(), 'examples'),
    path.join(process.cwd(), 'test-graphs'),
  ];
  
  const files = [];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      console.log(`Searching in: ${dir}`);
      files.push(...findGraphFiles(dir));
    }
  }
  
  if (files.length === 0) {
    console.log('\n No graph files found to migrate.');
    process.exit(0);
  }
  
  console.log(`\nFound ${files.length} potential graph files\n`);
  
  // Process each file
  files.forEach(processFile);
  
  // Print summary
  console.log('\n=================================');
  console.log('Migration Summary');
  console.log('=================================');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Graphs migrated: ${stats.graphsMigrated}`);
  console.log(`Nodes converted: ${stats.nodesConverted}`);
  
  if (stats.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${stats.warnings.length}):`);
    stats.warnings.forEach(w => console.log(`  - ${w}`));
  }
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    process.exit(1);
  }
  
  if (DRY_RUN) {
    console.log('\n✅ Dry run completed. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
}

// Run the migration
main();