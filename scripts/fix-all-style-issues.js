#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const FILE_PATTERNS = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'];
const EXCLUDE_PATTERNS = ['node_modules', 'dist', 'build', '.git', 'coverage'];

// Style fixing patterns
const STYLE_FIXES = [
  // Fix style={{ with missing closing }}
  {
    name: 'Missing closing brace in style props',
    pattern: /style=\{\{([^}]+)\}>(?!})/g,
    fix: (match, content) => `style={{${content}}}>`
  },
  
  // Fix style={{ at end of line with missing }}
  {
    name: 'Style prop missing closing brace at EOL',
    pattern: /style=\{\{([^}]+)\s*}>$/gm,
    fix: (match, content) => `style={{${content} }}>`
  },
  
  // Fix }>{content}</element> patterns
  {
    name: 'JSX content after style closing',
    pattern: /\}>([^<\s][^<]*)<\//g,
    fix: (match, content) => `}}>${content}</`
  },
  
  // Fix useState generic type indentation
  {
    name: 'useState generic type indentation',
    pattern: /useState<\{\n(\s*)([^}]+)\n(\s*)\}>/g,
    fix: (match, indent1, content, indent2) => {
      const lines = content.split('\n');
      const baseIndent = '  '; // Assume 2-space indent
      const fixedLines = lines.map(line => {
        // Remove existing indent and add consistent indent
        return baseIndent + line.trim();
      });
      return `useState<{\n${fixedLines.join('\n')}\n${baseIndent.slice(0, -2)}}>`;
    }
  },
  
  // Fix const object indentation in functions
  {
    name: 'Const object indentation',
    pattern: /const\s+(\w+):\s*Record<[^>]+>\s*=\s*\{(\n\s*[^}]+)\n\s*\};/g,
    fix: (match, varName, content) => {
      const lines = content.split('\n').filter(line => line.trim());
      const fixedLines = lines.map(line => '    ' + line.trim());
      return `const ${varName}: Record<${match.match(/Record<([^>]+)>/)[1]}> = {\n${fixedLines.join('\n')}\n  };`;
    }
  }
];

// JSX closing brace patterns
const JSX_CLOSING_FIXES = [
  // Fix orphaned }> at start of line
  {
    name: 'Orphaned closing braces',
    check: (lines, i) => {
      const line = lines[i];
      const trimmed = line.trim();
      return trimmed === '}>' && i > 0;
    },
    fix: (lines, i) => {
      // Look back to find the matching style={{ line
      for (let j = i - 1; j >= 0 && j > i - 30; j--) {
        if (lines[j].includes('style={{')) {
          // Found it - this }> should be }}>
          const indent = lines[i].match(/^\s*/)[0];
          lines[i] = indent + '}}>'; 
          return true;
        }
      }
      return false;
    }
  },
  
  // Fix style props with improper closing
  {
    name: 'Style prop closure alignment',
    check: (lines, i) => {
      const line = lines[i];
      return line.includes('style={{') && !line.includes('}}');
    },
    fix: (lines, i) => {
      // Count forward to find the closing
      let braceCount = 2; // Two opening braces
      let j = i;
      
      while (j < lines.length && braceCount > 0) {
        const restOfLine = j === i ? 
          lines[j].substring(lines[j].indexOf('style={{') + 8) : 
          lines[j];
        
        for (const char of restOfLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        if (braceCount === 0) {
          // Found the closing line
          if (!lines[j].trim().endsWith('}}>')) {
            lines[j] = lines[j].replace(/\}>$/, '}}>');
          }
          return true;
        }
        j++;
      }
      return false;
    }
  }
];

// Find all files matching patterns
function findFiles(dir, patterns, excludes) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(PROJECT_ROOT, fullPath);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!excludes.some(ex => entry.name === ex || relativePath.includes(ex))) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        // Check if file matches any pattern
        if (patterns.some(pattern => {
          const regex = new RegExp(pattern.replace('**/', '.*').replace('*', '[^/]*'));
          return regex.test(relativePath);
        })) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

// Process a single file
function processFile(filePath) {
  console.log(`\n📄 Processing: ${path.relative(PROJECT_ROOT, filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  // Apply regex-based fixes
  for (const fix of STYLE_FIXES) {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.fix);
      changeCount += matches.length;
      console.log(`  ✅ Fixed ${matches.length} ${fix.name} issues`);
    }
  }
  
  // Apply line-based fixes
  let lines = content.split('\n');
  let lineChangeCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    for (const fix of JSX_CLOSING_FIXES) {
      if (fix.check(lines, i) && fix.fix(lines, i)) {
        lineChangeCount++;
        console.log(`  ✅ Fixed ${fix.name} at line ${i + 1}`);
      }
    }
  }
  
  if (lineChangeCount > 0) {
    content = lines.join('\n');
    changeCount += lineChangeCount;
  }
  
  // Save if changes were made
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 Saved ${changeCount} fixes`);
    return changeCount;
  } else {
    console.log(`  ✨ No issues found`);
    return 0;
  }
}

// Main execution
console.log('🔧 Style Issue Fixer v1.0');
console.log('========================\n');

// Find all TypeScript/JavaScript files
console.log('🔍 Scanning for files...');
const files = findFiles(path.join(PROJECT_ROOT, 'packages'), FILE_PATTERNS, EXCLUDE_PATTERNS);
console.log(`📁 Found ${files.length} files to process\n`);

let totalFixes = 0;
const problemFiles = [];

// Process each file
for (const file of files) {
  try {
    const fixes = processFile(file);
    totalFixes += fixes;
    if (fixes > 0) {
      problemFiles.push({ file: path.relative(PROJECT_ROOT, file), fixes });
    }
  } catch (error) {
    console.error(`  ❌ Error processing file: ${error.message}`);
  }
}

// Summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`✅ Total fixes applied: ${totalFixes}`);
console.log(`📁 Files modified: ${problemFiles.length}`);

if (problemFiles.length > 0) {
  console.log('\n📝 Modified files:');
  problemFiles.forEach(({ file, fixes }) => {
    console.log(`  - ${file} (${fixes} fixes)`);
  });
}

// Try to run a build to verify
console.log('\n🏗️  Testing build...');
try {
  execSync('pnpm --filter client build', { 
    stdio: 'pipe',
    cwd: PROJECT_ROOT 
  });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build still failing. Manual review may be needed.');
  console.log('   Run: pnpm --filter client build');
  console.log('   to see remaining errors.');
}

console.log('\n✨ Style fixing complete!');