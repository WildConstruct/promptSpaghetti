#!/usr/bin/env node
/**
 * Comprehensive TypeScript Repair Script
 * Fixes systematic syntax issues caused by malformed transformations
 */

const fs = require('fs');
const path = require('path');

class TypeScriptRepairer {
  constructor() {
    this.repairCount = 0;
    this.fileCount = 0;
    this.patterns = [
      // Fix malformed object literals with trailing commas
      {
        name: 'Malformed object literals',
        pattern: /:\s*\{\s*,/g,
        replacement: ': {',
      },
      // Fix malformed array generics with trailing commas
      {
        name: 'Malformed array generics',
        pattern: /Array<\{\s*,/g,
        replacement: 'Array<{',
      },
      // Fix malformed function parameters with ) on new line
      {
        name: 'Malformed function parameters',
        pattern:
          /\)\s*\n\s*([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^,\n]+),?\s*\n\s*([a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^,\n]+),?\s*\n\s*\):/g,
        replacement: '(\n    $1,\n    $2\n  ):',
      },
      // Fix malformed push calls with )
      {
        name: 'Malformed push calls',
        pattern: /\.push\(\)\s*\n/g,
        replacement: '.push(\n',
      },
      // Fix trailing semicolons after closing brackets
      {
        name: 'Trailing semicolons after brackets',
        pattern: /\}\s*;\s*\)/g,
        replacement: '})',
      },
      // Fix malformed conditional expressions with orphaned :
      {
        name: 'Malformed conditional expressions',
        pattern: /\?\s*['"a-zA-Z_$][^:]*\s*:\s*;\s*\n/g,
        replacement: function (match) {
          return match.replace(/:\s*;\s*\n/, ':\n');
        },
      },
      // Fix malformed export/import statements
      {
        name: 'Malformed exports',
        pattern: /export\s+\{\s*,/g,
        replacement: 'export {',
      },
      // Fix missing closing brackets in interfaces
      {
        name: 'Missing closing brackets',
        pattern: /interface\s+[A-Z][a-zA-Z0-9]*\s*\{[^}]+$/gm,
        replacement: function (match) {
          if (!match.includes('}')) {
            return match + '\n}';
          }
          return match;
        },
      },
      // Fix malformed method declarations
      {
        name: 'Malformed method declarations',
        pattern: /public\s+async\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(\)\s*\n/g,
        replacement: 'public async $1(\n',
      },
      // Fix orphaned return types
      {
        name: 'Orphaned return types',
        pattern: /\)\s*:\s*Promise<[^>]+>\s*\{\s*$/gm,
        replacement: function (match) {
          return match.replace(/\{\s*$/, '{\n');
        },
      },
    ];
  }

  repairFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      let localRepairs = 0;

      // Apply all repair patterns
      for (const pattern of this.patterns) {
        const originalContent = content;

        if (typeof pattern.replacement === 'function') {
          content = content.replace(pattern.pattern, pattern.replacement);
        } else {
          content = content.replace(pattern.pattern, pattern.replacement);
        }

        if (content !== originalContent) {
          const matches = (originalContent.match(pattern.pattern) || []).length;
          localRepairs += matches;
          modified = true;
          console.log(`  ✓ Fixed ${matches} instances of ${pattern.name}`);
        }
      }

      // Additional specific repairs for common TypeScript syntax issues
      content = this.repairSpecificIssues(content);

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.repairCount += localRepairs;
        console.log(`📝 Repaired ${localRepairs} issues in ${path.relative(process.cwd(), filePath)}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error repairing ${filePath}:`, error.message);
      return false;
    }
  }

  repairSpecificIssues(content) {
    let modified = content;

    // Fix cases where object properties have trailing commas at start
    modified = modified.replace(/(\w+):\s*\{\s*,\s*\n/g, '$1: {\n');

    // Fix Array<{, patterns
    modified = modified.replace(/Array<\{\s*,\s*\n/g, 'Array<{\n');

    // Fix method parameter lists that are malformed
    modified = modified.replace(/\(\)\s*\n\s*([^)]+)\s*\):/g, '($1):');

    // Fix conditional operators with missing expressions
    modified = modified.replace(/\?\s*['"a-zA-Z_$][^:]*\s*:\s*;\s*\n/g, function (match) {
      return match.replace(/:\s*;\s*/, ': ');
    });

    // Fix push calls that are malformed
    modified = modified.replace(/\.push\(\)\s*\n(\s+)/g, '.push(\n$1');

    // Fix interface/type definitions with missing closing braces
    const lines = modified.split('\n');
    let inInterface = false;
    let braceCount = 0;
    let interfaceName = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(/^(export\s+)?(interface|type)\s+[A-Z]/)) {
        inInterface = true;
        braceCount = 0;
        interfaceName = line.match(/(?:interface|type)\s+([A-Z][a-zA-Z0-9]*)/)?.[1] || '';
      }

      if (inInterface) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        // If we hit another interface/type/class declaration and braces aren't balanced
        if (i > 0 && braceCount > 0 && line.match(/^(export\s+)?(interface|type|class)\s+[A-Z]/)) {
          lines.splice(i, 0, '}');
          braceCount = 0;
          inInterface = false;
          i++; // Skip the inserted line
        }

        if (braceCount === 0 && inInterface) {
          inInterface = false;
        }
      }
    }

    // Add missing closing brace at end if needed
    if (braceCount > 0) {
      lines.push('}');
    }

    modified = lines.join('\n');
    return modified;
  }

  repairDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        this.repairDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        this.fileCount++;
        this.repairFile(fullPath);
      }
    }
  }

  run() {
    console.log('🔧 Starting comprehensive TypeScript repair...\n');

    const startTime = Date.now();
    const targetDirs = ['packages/core', 'client/src', 'server/src'];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        console.log(`📁 Processing directory: ${dir}`);
        this.repairDirectory(dir);
      }
    }

    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Comprehensive TypeScript Repair Summary');
    console.log('='.repeat(60));
    console.log(`Files processed: ${this.fileCount}`);
    console.log(`Total repairs: ${this.repairCount}`);
    console.log(`Duration: ${duration}ms`);
    console.log('✅ TypeScript repair completed successfully!');
  }
}

// Run the repair
const repairer = new TypeScriptRepairer();
repairer.run();
