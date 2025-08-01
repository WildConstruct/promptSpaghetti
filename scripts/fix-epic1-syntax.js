#!/usr/bin/env node

/**
 * Fix common syntax errors in Epic 1 files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to fix
const FIXES = [
  // Fix missing commas in style objects
  {
    pattern: /style={{([^}]+)}}/g,
    fix: (match, content) => {
      const fixed = content
        .split('\n')
        .map(line => {
          // Skip empty lines
          if (!line.trim()) return line;
          // Skip lines that already end with comma or brace
          if (line.trim().endsWith(',') || line.trim().endsWith('{') || line.trim().endsWith('}')) {
            return line;
          }
          // Add comma if line contains a property
          if (line.includes(':') && !line.trim().endsWith(',')) {
            return line + ',';
          }
          return line;
        })
        .join('\n');
      return `style={{${fixed}}}`;
    }
  },
  // Fix missing commas in objects
  {
    pattern: /({[^}]+})/g,
    fix: (match) => {
      // Skip if it's a style object (handled above)
      if (match.includes('style={{')) return match;
      
      const lines = match.split('\n');
      const fixed = lines.map((line, i) => {
        // Skip first/last lines or empty lines
        if (i === 0 || i === lines.length - 1 || !line.trim()) return line;
        // Skip if already has comma or is a closing brace
        if (line.trim().endsWith(',') || line.trim().endsWith('}') || line.trim().endsWith('{')) {
          return line;
        }
        // Add comma if it's a property line
        if (line.includes(':') && !line.trim().startsWith('//')) {
          return line + ',';
        }
        return line;
      });
      return fixed.join('\n');
    }
  }
];

// Files to check (Epic 1 core files)
const EPIC1_PATTERNS = [
  'packages/core/components/CommandPalette/*.tsx',
  'packages/core/components/MenuBar/*.tsx',
  'packages/core/components/Inspector/**/*.tsx',
  'packages/core/*.tsx',
  'client/src/components/*.tsx',
  'client/src/App.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const fix of FIXES) {
      const newContent = content.replace(fix.pattern, fix.fix);
      if (newContent !== content) {
        changed = true;
        content = newContent;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`✗ Error fixing ${filePath}: ${err.message}`);
  }
  return false;
}

async function main() {
  console.log('🔧 Fixing syntax errors in Epic 1 files...\n');
  
  let totalFixed = 0;
  
  for (const pattern of EPIC1_PATTERNS) {
    const files = glob.sync(pattern);
    for (const file of files) {
      if (fixFile(file)) {
        totalFixed++;
      }
    }
  }
  
  console.log(`\n✅ Fixed ${totalFixed} files`);
}

main().catch(console.error);