#!/usr/bin/env node

/**
 * Golden File Generation Script
 * 
 * Generates baseline golden files for regression testing.
 * Run this when establishing new expected outputs or when
 * legitimate changes require updating baselines.
 * 
 * Usage:
 *   node scripts/generate-golden-files.js
 *   npm run test:regression:generate-golden
 */

const { execSync } = require('child_process');
const { mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const GOLDEN_FILES_DIR = join(__dirname, '../tests/regression/core-engine/golden-files');

// Ensure golden files directory exists
if (!existsSync(GOLDEN_FILES_DIR)) {
  mkdirSync(GOLDEN_FILES_DIR, { recursive: true });
  console.log(`Created golden files directory: ${GOLDEN_FILES_DIR}`);
}

async function main() {
  console.log('🔄 Generating golden files for regression tests...');
  console.log('');

  try {
    // Import and run the golden file generator
    const { generateGoldenFiles } = require('../tests/regression/core-engine/deterministic-execution.test.ts');
    
    if (typeof generateGoldenFiles !== 'function') {
      throw new Error('generateGoldenFiles function not found. Make sure the test file exports it.');
    }

    await generateGoldenFiles();
    
    console.log('');
    console.log('✅ Golden file generation completed successfully!');
    console.log('');
    console.log('Generated files are stored in:');
    console.log(`   ${GOLDEN_FILES_DIR}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the generated files to ensure they contain expected outputs');
    console.log('  2. Commit the golden files to version control');
    console.log('  3. Run regression tests with: npm run test:regression');
    console.log('');
    
  } catch (error) {
    console.error('❌ Failed to generate golden files:');
    console.error(error.message);
    console.error('');
    console.error('Common issues:');
    console.error('  - Make sure the server dependencies are installed');
    console.error('  - Ensure the database is initialized');
    console.error('  - Check that all required modules are built');
    process.exit(1);
  }
}

// Handle CLI usage
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };