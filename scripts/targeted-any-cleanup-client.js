#!/usr/bin/env node

/**
 * Targeted TypeScript Any Type Cleanup Script - Client Directory Only
 */

const fs = require('fs');
const path = require('path');

// Common any type patterns and their safer replacements
const anyTypeReplacements = [
  {
    pattern: /(\w+)\s*:\s*any(?=\s*[,\)])/g,
    replacement: '$1: unknown',
    description: 'Function parameters: any → unknown',
  },
  {
    pattern: /:\s*any(?=\s*[;}])/g,
    replacement: ': unknown',
    description: 'Object properties: any → unknown',
  },
  {
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]',
    description: 'Arrays: any[] → unknown[]',
  },
  {
    pattern: /<any>/g,
    replacement: '<unknown>',
    description: 'Generics: <any> → <unknown>',
  },
];

// More specific type replacements
const specificTypeReplacements = [
  { pattern: /(error|err|e)\s*:\s*any/g, replacement: '$1: Error', description: 'Error objects: any → Error' },
  {
    pattern: /(element|el|node)\s*:\s*any/g,
    replacement: '$1: HTMLElement',
    description: 'DOM elements: any → HTMLElement',
  },
  {
    pattern: /(data|result|response)\s*:\s*any/g,
    replacement: '$1: Record<string, unknown>',
    description: 'Data objects: any → Record<string, unknown>',
  },
];

function processFile(filePath) {
  if (!fs.existsSync(filePath) || !filePath.match(/\.(ts|tsx)$/)) {
    return 0;
  }

  console.log(`Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;

  // Apply specific replacements first
  for (const replacement of specificTypeReplacements) {
    const matches = content.match(replacement.pattern);
    if (matches) {
      content = content.replace(replacement.pattern, replacement.replacement);
      fixCount += matches.length;
      console.log(`  ✓ ${replacement.description} (${matches.length} changes)`);
    }
  }

  // Apply general replacements
  for (const replacement of anyTypeReplacements) {
    const matches = content.match(replacement.pattern);
    if (matches) {
      content = content.replace(replacement.pattern, replacement.replacement);
      fixCount += matches.length;
      console.log(`  ✓ ${replacement.description} (${matches.length} changes)`);
    }
  }

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Fixed ${fixCount} any types`);
  }

  return fixCount;
}

function processDirectory(dirPath) {
  let totalFixed = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files.slice(0, 10)) {
    // Process only first 10 files
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      totalFixed += processFile(filePath);
    } else if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalFixed += processDirectory(filePath);
    }
  }

  return totalFixed;
}

const clientDir = 'server/src/services';
console.log(`🎯 Targeted TypeScript Any Cleanup - ${clientDir}`);
const totalFixed = processDirectory(clientDir);
console.log(`\n✅ Total fixed: ${totalFixed} any types`);
