#!/usr/bin/env node

/**
 * Script to fix missing userEvent imports in test files
 * Adds proper import from @testing-library/user-event
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting userEvent import fixes...');

// Find all test files that use userEvent but don't import it
const filesWithUserEvent = execSync(`npx tsc --noEmit 2>&1 | grep "Cannot find name 'userEvent'" | cut -d'(' -f1`)
  .toString()
  .trim()
  .split('\n')
  .filter(file => file && !file.includes('node_modules'))
  .map(file => file.trim())
  .filter((file, index, arr) => arr.indexOf(file) === index); // Remove duplicates

console.log(`📁 Found ${filesWithUserEvent.length} files with missing userEvent imports`);

let filesProcessed = 0;

filesWithUserEvent.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if userEvent is already imported
    if (content.includes('import userEvent') || content.includes('from \'@testing-library/user-event\'')) {
      return;
    }
    
    // Check if file actually uses userEvent
    if (!content.includes('userEvent.')) {
      return;
    }

    let updatedContent = content;
    
    // Find existing @testing-library/react import
    const reactTestingImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@testing-library\/react['"];?/;
    const match = content.match(reactTestingImportRegex);
    
    if (match) {
      // Add userEvent import after the existing @testing-library/react import
      const [fullMatch, imports] = match;
      const newImport = `${fullMatch}\nimport userEvent from '@testing-library/user-event';`;
      updatedContent = content.replace(fullMatch, newImport);
    } else {
      // Add userEvent import at the top after React import
      const reactImportRegex = /import React[^;]*;/;
      const reactMatch = content.match(reactImportRegex);
      
      if (reactMatch) {
        const afterReactImport = `${reactMatch[0]}\nimport userEvent from '@testing-library/user-event';`;
        updatedContent = content.replace(reactMatch[0], afterReactImport);
      } else {
        // Add at the very beginning
        updatedContent = `import userEvent from '@testing-library/user-event';\n${content}`;
      }
    }
    
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      filesProcessed++;
      console.log(`✅ ${path.relative('.', filePath)}: Added userEvent import`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 userEvent import fixes complete!`);
console.log(`📊 Summary:`);
console.log(`   • Files processed: ${filesProcessed}`);
console.log(`   • Added missing userEvent imports from @testing-library/user-event`);

if (filesProcessed > 0) {
  console.log(`\n💡 This resolves "Cannot find name 'userEvent'" TypeScript errors.`);
}