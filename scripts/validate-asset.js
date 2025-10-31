#!/usr/bin/env node

/**
 * CLI tool for validating PSG and PSGLib asset files
 * Usage: node scripts/validate-asset.js <file-path>
 */

const fs = require('fs').promises;
const path = require('path');

// Import the validator (this assumes the TypeScript is compiled)
async function validateAssetFile(filePath) {
  try {
    // Read file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parse JSON to do basic validation
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.error('❌ Invalid JSON format');
      console.error(e.message);
      return false;
    }
    
    // Detect format
    const format = data.fileType === 'psglib' ? 'PSGLib' : 
                  (data.version && data.nodes && data.edges) ? 'PSG' : 
                  'Unknown';
    
    if (format === 'Unknown') {
      console.error('❌ Unknown file format - not PSG or PSGLib');
      return false;
    }
    
    console.log(`\n📄 File: ${path.basename(filePath)}`);
    console.log(`📦 Format: ${format}`);
    
    // Basic validation based on format
    const errors = [];
    const warnings = [];
    
    if (format === 'PSG') {
      // PSG validation
      if (!data.version) errors.push('Missing version field');
      // Name can be at root or in metadata
      if (!data.name && !data.metadata?.name) errors.push('Missing name field');
      if (!data.nodes) errors.push('Missing nodes array');
      if (!data.edges) errors.push('Missing edges array');
      
      // Check for Output nodes in fragments
      const hasRegions = (data.regions?.length > 0) || (data.groups?.length > 0);
      if (data.metadata?.type === 'MULTI-ASPECT' || hasRegions) {
        const hasOutput = data.nodes?.some(n => n.type === 'Output');
        if (hasOutput) {
          errors.push('Fragment contains Output nodes (should be removed)');
        }
      }
      
      // Node type validation
      const nodeTypeMap = {
        'WeightedChoice': 'weightedChoice',
        'Output': 'output',
        'Concat': 'concat',
        'TextBlock': 'textBlock',
        'Variable': 'variable'
      };
      
      data.nodes?.forEach((node, i) => {
        if (!node.id) errors.push(`Node ${i} missing ID`);
        if (!node.type) errors.push(`Node ${i} missing type`);
        if (typeof node.x !== 'number' || typeof node.y !== 'number') {
          errors.push(`Node ${node.id || i} missing x/y coordinates`);
        }
        
        // Check if node type is known
        if (node.type && !nodeTypeMap[node.type] && node.type !== 'Subject' && node.type !== 'Action') {
          warnings.push(`Unknown node type: ${node.type}`);
        }
      });
      
      // Edge validation
      const nodeIds = new Set(data.nodes?.map(n => n.id) || []);
      data.edges?.forEach((edge, i) => {
        if (!edge.id) errors.push(`Edge ${i} missing ID`);
        if (!edge.source) errors.push(`Edge ${i} missing source`);
        if (!edge.target) errors.push(`Edge ${i} missing target`);
        
        if (edge.source && !nodeIds.has(edge.source)) {
          errors.push(`Edge ${edge.id || i} references non-existent source: ${edge.source}`);
        }
        if (edge.target && !nodeIds.has(edge.target)) {
          errors.push(`Edge ${edge.id || i} references non-existent target: ${edge.target}`);
        }
      });
      
      // Region/Group validation (handle both "regions" and "groups" fields)
      const regions = data.regions || data.groups || [];
      regions.forEach((region, i) => {
        if (!region.id) errors.push(`Region ${i} missing ID`);
        if (!region.name && !region.label) warnings.push(`Region ${i} missing name/label`);
        
        const nodeList = region.nodes || region.nodeIds || [];
        nodeList.forEach(nodeId => {
          if (!nodeIds.has(nodeId)) {
            errors.push(`Region ${region.name || region.label || i} references non-existent node: ${nodeId}`);
          }
        });
      });
      
    } else if (format === 'PSGLib') {
      // PSGLib validation
      if (!data.fileType || data.fileType !== 'psglib') {
        errors.push('Invalid fileType (should be "psglib")');
      }
      if (!data.formatVersion) errors.push('Missing formatVersion');
      if (!data.metadata) errors.push('Missing metadata');
      if (!data.graph) errors.push('Missing graph');
      
      // Metadata validation
      if (data.metadata) {
        if (!data.metadata.id) errors.push('Missing metadata.id');
        if (!data.metadata.name) errors.push('Missing metadata.name');
        if (!data.metadata.author) warnings.push('Missing metadata.author');
        if (!data.metadata.version) errors.push('Missing metadata.version');
        if (!data.metadata.nodeTypes) errors.push('Missing metadata.nodeTypes');
      }
      
      // Graph validation
      if (data.graph) {
        if (!data.graph.nodes) errors.push('Missing graph.nodes');
        if (!data.graph.edges) errors.push('Missing graph.edges');
        
        // Node validation
        data.graph.nodes?.forEach((node, i) => {
          if (!node.id) errors.push(`Node ${i} missing ID`);
          if (!node.type) errors.push(`Node ${i} missing type`);
          if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
            errors.push(`Node ${node.id || i} missing position.x/y`);
          }
        });
        
        // Edge validation
        const nodeIds = new Set(data.graph.nodes?.map(n => n.id) || []);
        data.graph.edges?.forEach((edge, i) => {
          if (!edge.id) errors.push(`Edge ${i} missing ID`);
          if (!edge.source) errors.push(`Edge ${i} missing source`);
          if (!edge.target) errors.push(`Edge ${i} missing target`);
          
          if (edge.source && !nodeIds.has(edge.source)) {
            errors.push(`Edge ${edge.id || i} references non-existent source: ${edge.source}`);
          }
          if (edge.target && !nodeIds.has(edge.target)) {
            errors.push(`Edge ${edge.id || i} references non-existent target: ${edge.target}`);
          }
        });
      }
    }
    
    // Output results
    console.log(`\n📊 Statistics:`);
    if (format === 'PSG') {
      console.log(`  • Nodes: ${data.nodes?.length || 0}`);
      console.log(`  • Edges: ${data.edges?.length || 0}`);
      const regionCount = (data.regions?.length || 0) + (data.groups?.length || 0);
      console.log(`  • Regions/Groups: ${regionCount}`);
      const nodeTypes = [...new Set(data.nodes?.map(n => n.type) || [])];
      console.log(`  • Node Types: ${nodeTypes.join(', ')}`);
    } else {
      console.log(`  • Nodes: ${data.graph?.nodes?.length || 0}`);
      console.log(`  • Edges: ${data.graph?.edges?.length || 0}`);
      console.log(`  • Node Types: ${data.metadata?.nodeTypes?.join(', ') || 'none'}`);
    }
    
    // Display validation results
    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✅ Validation PASSED - No issues found');
      return true;
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Validation FAILED - Errors found:');
      errors.forEach(err => console.log(`  • ${err}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warn => console.log(`  • ${warn}`));
    }
    
    // Suggestions
    console.log('\n💡 Suggestions:');
    if (!data.description && !data.metadata?.description) {
      console.log('  • Consider adding a description field');
    }
    if (format === 'PSGLib' && (!data.metadata?.tags || data.metadata.tags.length === 0)) {
      console.log('  • Consider adding tags for better discoverability');
    }
    
    return errors.length === 0;
    
  } catch (error) {
    console.error('❌ Error validating file:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('PSG/PSGLib Asset Validator');
    console.log('Usage: node scripts/validate-asset.js <file-path> [file-path...]');
    console.log('\nExamples:');
    console.log('  node scripts/validate-asset.js assets/my-fragment.psg');
    console.log('  node scripts/validate-asset.js client/public/assets/library/**/*.psg');
    process.exit(1);
  }
  
  let allValid = true;
  
  for (const filePath of args) {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.error(`❌ File not found: ${filePath}`);
      allValid = false;
      continue;
    }
    
    const valid = await validateAssetFile(filePath);
    if (!valid) {
      allValid = false;
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Exit with appropriate code
  process.exit(allValid ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { validateAssetFile };