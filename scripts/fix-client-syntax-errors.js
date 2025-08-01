#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix client-specific syntax errors that are blocking the build
 */

// Files to fix
const filesToFix = [
  'client/src/App.tsx',
  'client/src/components/EpicDashboard.tsx',
  'client/src/components/GraphNode.tsx',
  'client/src/components/EnhancedGraphEditor.tsx'
];

let totalFixes = 0;

// Fix patterns
const fixPatterns = [
  // Fix missing closing braces in style objects
  {
    pattern: /}\n\s*\n/g,
    test: (match, content, offset) => {
      // Check if there's a missing closing brace before a JSX closing tag
      const nextChar = content[offset + match.length];
      return nextChar === '>' || nextChar === '/';
    },
    fix: '}}\n'
  },
  // Fix object style properties with missing closing braces
  {
    pattern: /style=\{\{([^}]+)}\s*>/g,
    test: (match) => {
      const openBraces = (match.match(/\{/g) || []).length;
      const closeBraces = (match.match(/\}/g) || []).length;
      return openBraces !== closeBraces;
    },
    fix: (match) => {
      const openBraces = (match.match(/\{/g) || []).length;
      const closeBraces = (match.match(/\}/g) || []).length;
      const missingBraces = openBraces - closeBraces;
      return match.replace('>', '}}'.repeat(missingBraces / 2) + '>');
    }
  },
  // Fix incomplete ternary expressions
  {
    pattern: /borderBottom:,\s*\n/g,
    fix: 'borderBottom:\n'
  },
  // Fix trailing commas in JSX props
  {
    pattern: /,\s*>/g,
    fix: '>'
  },
  // Fix style object syntax errors
  {
    pattern: /style=\{\{([^}]*);([^}]*)\}\}/g,
    fix: (match, p1, p2) => {
      // Replace semicolons with commas in style objects
      const fixed = `style={{${p1},${p2}}}`;
      return fixed.replace(/;/g, ',');
    }
  }
];

// Main fixing function
function fixFile(filePath) {
  console.log(`\nProcessing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixes = 0;
  
  // Apply each fix pattern
  for (const pattern of fixPatterns) {
    if (pattern.test) {
      // Complex pattern with test function
      const matches = [...content.matchAll(pattern.pattern)];
      for (const match of matches) {
        if (pattern.test(match[0], content, match.index)) {
          const replacement = typeof pattern.fix === 'function' 
            ? pattern.fix(match[0]) 
            : pattern.fix;
          content = content.substring(0, match.index) + 
                    replacement + 
                    content.substring(match.index + match[0].length);
          fixes++;
        }
      }
    } else {
      // Simple pattern replacement
      const newContent = content.replace(pattern.pattern, pattern.fix);
      if (newContent !== content) {
        fixes += (content.match(pattern.pattern) || []).length;
        content = newContent;
      }
    }
  }
  
  // Specific fixes for App.tsx
  if (filePath.includes('App.tsx')) {
    // Fix the specific borderBottom syntax error
    content = content.replace(
      /borderBottom:,\s*activeTab === 'editor'/g,
      "borderBottom:\n  activeTab === 'editor'"
    );
    
    // Fix similar patterns for other tabs
    content = content.replace(
      /borderBottom:,\s*activeTab === 'randomizer'/g,
      "borderBottom:\n  activeTab === 'randomizer'"
    );
    
    content = content.replace(
      /borderBottom:,\s*activeTab === 'files'/g,
      "borderBottom:\n  activeTab === 'files'"
    );
    
    content = content.replace(
      /borderBottom:,\s*activeTab === 'prototype'/g,
      "borderBottom:\n  activeTab === 'prototype'"
    );
    
    // Fix missing closing braces in callbacks
    content = content.replace(
      /}\s*else \{/g,
      '} else {'
    );
    
    // Fix interface closing braces
    const interfacePattern = /interface\s+\w+\s*\{[^}]*$/gm;
    const interfaceMatches = content.match(interfacePattern);
    if (interfaceMatches) {
      interfaceMatches.forEach(match => {
        // Find the next line after the interface
        const index = content.indexOf(match);
        const nextNewline = content.indexOf('\n', index + match.length);
        if (nextNewline > -1) {
          const nextLine = content.substring(nextNewline + 1, content.indexOf('\n', nextNewline + 1));
          if (!nextLine.trim().startsWith('}')) {
            // Interface is missing closing brace
            content = content.substring(0, nextNewline) + '\n}' + content.substring(nextNewline);
            fixes++;
          }
        }
      });
    }
  }
  
  // Specific fixes for EpicDashboard.tsx
  if (filePath.includes('EpicDashboard.tsx')) {
    // Fix array/object syntax errors
    content = content.replace(/components: \[;/g, 'components: [');
    
    // Fix transition property syntax
    content = content.replace(/transition: 'width 0.5s ease-in-out';/g, "transition: 'width 0.5s ease-in-out'");
    
    // Fix return statement syntax
    content = content.replace(/return null; \}>/, 'return null; };');
  }
  
  // Specific fixes for GraphNode.tsx
  if (filePath.includes('GraphNode.tsx')) {
    // Fix return statement syntax
    content = content.replace(/return;\s*<div/g, 'return (\n  <div');
    
    // Ensure proper JSX closing
    if (!content.includes('</div>\n  );')) {
      content = content.replace(/\s*\);\s*}\);/, '\n    </div>\n  );\n});');
    }
  }
  
  // Specific fixes for EnhancedGraphEditor.tsx
  if (filePath.includes('EnhancedGraphEditor.tsx')) {
    // Fix style object syntax
    content = content.replace(/([,;])\s*,/g, '$1');
    
    // Fix interface property syntax
    content = content.replace(/:\s*{\s*([^;]+);,/g, ': {\n    $1,');
  }
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fixes} syntax errors`);
    totalFixes += fixes;
  } else {
    console.log('No syntax errors found');
  }
}

// Process all files
console.log('🔧 Fixing client-specific syntax errors...\n');

for (const file of filesToFix) {
  const fullPath = path.join(__dirname, '..', file);
  fixFile(fullPath);
}

console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('\n🔨 Running build to verify fixes...');

// Test the build
const { execSync } = require('child_process');
try {
  execSync('pnpm --filter client build', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('\n🎉 Build successful!');
} catch (error) {
  console.log('\n⚠️  Build still has errors. May need additional fixes.');
}