#!/usr/bin/env node

/**
 * Fix Structural Parsing Issues
 *
 * Addresses more complex parsing errors including:
 * - Missing closing braces for if/function statements
 * - Orphaned return statements
 * - Wrong semicolons vs commas in object properties
 * - Malformed function signatures
 */

const fs = require('fs');
const path = require('path');

class StructuralParsingFixer {
  constructor() {
    this.fixCount = 0;
    this.fileCount = 0;
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];
    console.log(`${prefix} ${message}`);
  }

  /**
   * Apply structural parsing fixes
   */
  applyStructuralFixes(content, filePath) {
    let fixedContent = content;
    let fileFixCount = 0;

    const structuralFixes = [
      // Fix orphaned return statements in functions
      {
        pattern: /(\s+)return\s+([^;]+);\s*return\s+([^;]+);/g,
        replacement: '$1if (condition) {\n$1  return $2;\n$1}\n$1return $3;',
        description: 'Fix orphaned return statements',
        customLogic: true,
      },

      // Fix object property semicolons vs commas
      {
        pattern: /(\w+):\s*([^,;\n]+);(\s*\w+:)/g,
        replacement: '$1: $2,$3',
        description: 'Fix object property semicolon -> comma',
      },

      // Fix function signature with wrong closing
      {
        pattern: /(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*\{([^}]*)\}$/gm,
        replacement: '$1($2) => {\n$3\n}',
        description: 'Fix function signature syntax',
      },

      // Fix missing closing braces in if statements
      {
        pattern: /(if\s*\([^)]+\)\s*\{[^}]*return[^;]*;)\s*(return[^;]*;)/g,
        replacement: '$1\n}\n$2',
        description: 'Fix missing closing brace in if statement',
      },

      // Fix callback function syntax issues
      {
        pattern: /(\w+)\s*:\s*\([^)]*\)\s*=>\s*\{,/g,
        replacement: '$1: ($2) => {',
        description: 'Fix callback function opening syntax',
      },

      // Fix array/object initialization with wrong brackets
      {
        pattern: /useState<([^>]+)>\(\[\]\)/g,
        replacement: 'useState<$1[]>([])',
        description: 'Fix useState array type annotation',
      },

      // Fix interface syntax issues
      {
        pattern: /(interface\s+\w+\s*\{[^}]*),(\s*\})/g,
        replacement: '$1$2',
        description: 'Fix interface trailing comma',
      },

      // Fix method calls with wrong syntax
      {
        pattern: /(\w+)\(\s*\)\s*:\s*\{/g,
        replacement: '$1(): {',
        description: 'Fix method signature colon placement',
      },
    ];

    for (const fix of structuralFixes) {
      if (fix.customLogic) {
        // Handle complex return statement fixes
        const returnMatches = fixedContent.match(/(\s+)return\s+([^;]+);\s*return\s+([^;]+);/g);
        if (returnMatches) {
          for (const match of returnMatches) {
            // Try to intelligently fix the structure
            const parts = match.match(/(\s+)return\s+([^;]+);\s*return\s+([^;]+);/);
            if (parts) {
              const indent = parts[1];
              const firstReturn = parts[2].trim();
              const secondReturn = parts[3].trim();

              // If first return looks conditional, wrap it
              if (
                firstReturn.includes('dataTransferData') ||
                firstReturn.includes('||') ||
                firstReturn.includes('&&')
              ) {
                const replacement = `${indent}if (format === 'application/reactflow' || format === 'application/node-type') {\n${indent}  return ${firstReturn};\n${indent}}\n${indent}return ${secondReturn};`;
                fixedContent = fixedContent.replace(match, replacement);
                fileFixCount++;
              }
            }
          }
        }
      } else {
        const beforeCount = (fixedContent.match(fix.pattern) || []).length;
        if (beforeCount > 0) {
          fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
          const afterCount = (fixedContent.match(fix.pattern) || []).length;
          const fixesApplied = beforeCount - afterCount;
          if (fixesApplied > 0) {
            fileFixCount += fixesApplied;
            this.log(`  Applied ${fixesApplied}x: ${fix.description}`, 'info');
          }
        }
      }
    }

    return { content: fixedContent, fixCount: fileFixCount };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixCount } = this.applyStructuralFixes(originalContent, filePath);

      if (fixCount > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        this.log(`${path.relative(process.cwd(), filePath)}: ${fixCount} structural fixes`, 'success');
        this.fixCount += fixCount;
        this.fileCount++;
      }
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  /**
   * Find and process files with structural parsing errors
   */
  async processFilesWithStructuralErrors() {
    this.log('Finding files with structural parsing errors...', 'info');

    const problematicFiles = [
      'client/src/components/BrowserSafeGraphEditor.tsx',
      'client/src/components/EnhancedGraphEditor.refactored.tsx',
      'client/src/components/EpicDashboard.tsx',
      'client/src/components/GraphNode.tsx',
      'client/src/components/GraphTemplates/NodeFactory.tsx',
      'client/src/components/GraphTemplates/TemplateSelector.tsx',
      'client/src/components/NodePalette.tsx',
      'client/src/components/PerformanceDashboard.tsx',
      'packages/core/usePreviewSeeds.ts',
    ];

    for (const relPath of problematicFiles) {
      const fullPath = path.join(process.cwd(), relPath);
      if (fs.existsSync(fullPath)) {
        this.processFile(fullPath);
      }
    }
  }

  /**
   * Run the structural error fixes
   */
  async run() {
    console.log('🚀 Starting structural parsing error fixes...\n');

    await this.processFilesWithStructuralErrors();

    console.log('\n📊 Structural Error Fix Results:');
    console.log(`  Files processed: ${this.fileCount}`);
    console.log(`  Total fixes applied: ${this.fixCount}`);

    if (this.fixCount > 0) {
      this.log('Structural parsing error fixes completed successfully!', 'success');
    } else {
      this.log('No structural parsing errors found to fix', 'info');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new StructuralParsingFixer();
  fixer.run().catch(error => {
    console.error('❌ Fix process failed:', error);
    process.exit(1);
  });
}

module.exports = StructuralParsingFixer;
