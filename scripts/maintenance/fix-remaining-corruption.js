#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Additional corruption patterns discovered during build
const corruptionPatterns = [
  // Trailing commas in interfaces and objects that should be semicolons
  { pattern: /(\w+):\s*([^,;\n}]+);,/g, replacement: '$1: $2;' },
  // Malformed object opening with comma
  { pattern: /:\s*\{,/g, replacement: ': {' },
  // Malformed function parameters ending with comma and parenthesis
  { pattern: /\(\w+[^)]*,\)/g, replacement: match => match.replace(',)', ')') },
  // Fix remaining semicolon where comma should be in object properties
  { pattern: /(['"]\w+['"]);\s*}/g, replacement: '$1\n  }' },
];

function fixCorruptionInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedPatterns = 0;

    // Apply each corruption pattern fix
    corruptionPatterns.forEach(({ pattern, replacement }) => {
      const before = content;
      content = content.replace(pattern, replacement);
      if (content !== before) {
        fixedPatterns++;
      }
    });

    if (fixedPatterns > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${fixedPatterns} patterns in ${filePath}`);
      return fixedPatterns;
    }

    return 0;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Find TypeScript/TSX files in packages/core
function findFilesToFix(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.includes('node_modules')) {
      files.push(...findFilesToFix(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const targetDir = path.join(__dirname, 'packages/core');
const filesToFix = findFilesToFix(targetDir);

console.log(`Scanning ${filesToFix.length} TypeScript files for remaining corruption...`);

let totalFixedPatterns = 0;
let fixedFiles = 0;

filesToFix.forEach(filePath => {
  const fixedInFile = fixCorruptionInFile(filePath);
  if (fixedInFile > 0) {
    fixedFiles++;
    totalFixedPatterns += fixedInFile;
  }
});

console.log(`\n✅ Fixed ${totalFixedPatterns} corruption patterns across ${fixedFiles} files!`);
