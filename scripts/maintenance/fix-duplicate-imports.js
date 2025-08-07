#!/usr/bin/env node

/**
 * Script to fix duplicate import issues created by automated import fixes
 * Common pattern: Multiple import statements for the same identifier from different modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting duplicate import fixes...');

// Get TypeScript duplicate identifier errors
const duplicateErrors = execSync(`npx tsc --noEmit 2>&1 | grep "Duplicate identifier"`)
  .toString()
  .trim()
  .split('\n')
  .filter(line => line);

// Parse error lines to extract file paths and duplicate names
const duplicateFiles = new Map(); // filePath -> Set of duplicate names

duplicateErrors.forEach(errorLine => {
  const match = errorLine.match(/^(.+?)\(\d+,\d+\): error TS2300: Duplicate identifier '([^']+)'/);
  if (match) {
    const [, filePath, duplicateName] = match;
    if (!duplicateFiles.has(filePath)) {
      duplicateFiles.set(filePath, new Set());
    }
    duplicateFiles.get(filePath).add(duplicateName);
  }
});

console.log(`📁 Found ${duplicateFiles.size} files with duplicate imports`);
console.log(`🔍 Total duplicate identifiers: ${duplicateErrors.length}`);

let filesProcessed = 0;
let duplicatesFixed = 0;

for (const [filePath, duplicateNames] of duplicateFiles.entries()) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let updatedLines = [...lines];
    let hasChanges = false;

    duplicateNames.forEach(duplicateName => {
      // Find all import lines for this identifier
      const importIndices = [];

      lines.forEach((line, index) => {
        if (line.trim().startsWith('import {') && line.includes(duplicateName) && line.includes('} from ')) {
          importIndices.push(index);
        }
      });

      if (importIndices.length > 1) {
        console.log(
          `🔍 Found ${importIndices.length} imports for '${duplicateName}' in ${path.relative('.', filePath)}`
        );

        // Keep the first import, remove the rest
        const linesToRemove = importIndices.slice(1);

        // Also remove the comment lines above duplicates
        const allLinesToRemove = [];
        linesToRemove.forEach(lineIndex => {
          allLinesToRemove.push(lineIndex);
          // Check if previous line is a comment related to this import
          if (
            lineIndex > 0 &&
            lines[lineIndex - 1].trim().startsWith('// Import') &&
            lines[lineIndex - 1].includes(duplicateName)
          ) {
            allLinesToRemove.push(lineIndex - 1);
          }
          // Check if line before that is empty
          if (lineIndex > 1 && lines[lineIndex - 2].trim() === '') {
            allLinesToRemove.push(lineIndex - 2);
          }
        });

        // Sort in descending order to remove from end to beginning
        allLinesToRemove.sort((a, b) => b - a);

        allLinesToRemove.forEach(lineIndex => {
          updatedLines.splice(lineIndex, 1);
        });

        hasChanges = true;
        duplicatesFixed += linesToRemove.length;
        console.log(`✅ Removed ${linesToRemove.length} duplicate imports for '${duplicateName}'`);
      }
    });

    if (hasChanges) {
      const updatedContent = updatedLines.join('\n');
      fs.writeFileSync(filePath, updatedContent);
      filesProcessed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 Duplicate import fixes complete!`);
console.log(`📊 Summary:`);
console.log(`   • Files processed: ${filesProcessed}`);
console.log(`   • Duplicate imports removed: ${duplicatesFixed}`);

if (duplicatesFixed > 0) {
  console.log(`\n💡 This resolves "Duplicate identifier" TypeScript errors.`);
}
