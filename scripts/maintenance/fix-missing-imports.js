#!/usr/bin/env node

/**
 * Script to fix missing imports for variables that are exported but not imported for local use
 * Common pattern: export { foo } from './module'; ... foo() // Cannot find name 'foo'
 * Fix: Add import { foo } from './module';
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting missing import fixes...');

// Get TypeScript errors to identify missing names and their files
const tsErrors = execSync(`npx tsc --noEmit 2>&1 | grep "Cannot find name"`)
  .toString()
  .trim()
  .split('\n')
  .filter(line => line);

// Parse error lines to extract file paths and missing names
const missingImports = new Map(); // filePath -> Set of missing names

tsErrors.forEach(errorLine => {
  const match = errorLine.match(/^(.+?)\(\d+,\d+\): error TS2304: Cannot find name '([^']+)'/);
  if (match) {
    const [, filePath, missingName] = match;
    if (!missingImports.has(filePath)) {
      missingImports.set(filePath, new Set());
    }
    missingImports.get(filePath).add(missingName);
  }
});

console.log(`📁 Found ${missingImports.size} files with missing imports`);
console.log(`🔍 Total missing names: ${tsErrors.length}`);

let filesProcessed = 0;
let totalImportsAdded = 0;

for (const [filePath, missingNames] of missingImports.entries()) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    const importsToAdd = new Set();
    const moduleImports = new Map(); // module -> Set of imports

    // Find existing export statements to understand where names come from
    const exportLines = content
      .split('\n')
      .filter(line => line.trim().startsWith('export {') && line.includes('} from '));

    // For each missing name, try to find which module it should be imported from
    missingNames.forEach(missingName => {
      exportLines.forEach(exportLine => {
        if (exportLine.includes(missingName)) {
          // Extract the module path from the export line
          const moduleMatch = exportLine.match(/} from ['"]([^'"]+)['"]/);
          if (moduleMatch) {
            const modulePath = moduleMatch[1];
            if (!moduleImports.has(modulePath)) {
              moduleImports.set(modulePath, new Set());
            }
            moduleImports.get(modulePath).add(missingName);
          }
        }
      });
    });

    // Add imports for each module
    moduleImports.forEach((names, modulePath) => {
      const namesList = Array.from(names).sort().join(', ');
      const importStatement = `import { ${namesList} } from '${modulePath}';`;

      // Find a good place to insert the import (after existing imports)
      const lines = updatedContent.split('\n');
      let insertIndex = -1;

      // Look for existing imports from this module to extend them
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes(`} from '${modulePath}'`) && line.startsWith('import {')) {
          // Extend existing import
          const existingImports = line.match(/import\s*\{\s*([^}]+)\s*\}/);
          if (existingImports) {
            const currentImports = existingImports[1].split(',').map(s => s.trim());
            const allImports = [...new Set([...currentImports, ...names])].sort().join(', ');
            lines[i] = line.replace(/import\s*\{[^}]+\}/, `import { ${allImports} }`);
            updatedContent = lines.join('\n');
            totalImportsAdded += names.size;
            console.log(`✅ ${path.relative('.', filePath)}: Extended import for ${namesList}`);
            return;
          }
        }

        // Find insertion point after existing imports/exports
        if (line.startsWith('export {') && line.includes('} from ')) {
          insertIndex = i + 1;
        }
      }

      // If no existing import found, insert new one
      if (insertIndex !== -1) {
        lines.splice(insertIndex, 0, '', `// Import ${namesList} for local use`, importStatement);
        updatedContent = lines.join('\n');
        totalImportsAdded += names.size;
        console.log(`✅ ${path.relative('.', filePath)}: Added import for ${namesList}`);
      }
    });

    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      filesProcessed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 Missing import fixes complete!`);
console.log(`📊 Summary:`);
console.log(`   • Files processed: ${filesProcessed}`);
console.log(`   • Total imports added: ${totalImportsAdded}`);

if (totalImportsAdded > 0) {
  console.log(`\n💡 This resolves "Cannot find name" TypeScript errors for exported-but-not-imported variables.`);
}
