#!/usr/bin/env node

/**
 * Comprehensive Parsing Error Fix
 *
 * Systematically addresses all remaining parsing error patterns across the codebase:
 * - Interface missing closing braces
 * - Function parameter syntax corruption
 * - Object literal syntax issues
 * - JSX syntax problems
 * - Type annotation errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveParsingFixer {
  constructor() {
    this.fixCount = 0;
    this.fileCount = 0;
    this.processedFiles = new Set();
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
   * Apply comprehensive parsing fixes
   */
  applyComprehensiveFixes(content, filePath) {
    let fixedContent = content;
    let fileFixCount = 0;

    const comprehensiveFixes = [
      // Interface syntax fixes
      {
        pattern: /(interface\s+\w+\s*\{[^}]*)\ninterface/g,
        replacement: '$1}\n\ninterface',
        description: 'Fix missing interface closing brace',
      },
      {
        pattern: /(interface\s+\w+\s*\{[^}]*?)(\n\s*\/\/|export|const|function|class)/g,
        replacement: '$1}\n\n$2',
        description: 'Fix unclosed interface before code',
      },

      // Function syntax fixes
      {
        pattern: /=>\s*\(\)/g,
        replacement: '=> (',
        description: 'Fix function arrow syntax () to (',
      },
      {
        pattern: /\(\s*\{,/g,
        replacement: '({',
        description: 'Fix object parameter opening {,',
      },
      {
        pattern: /=>\s*\{,/g,
        replacement: '=> {',
        description: 'Fix arrow function body opening {,',
      },

      // Object literal fixes
      {
        pattern: /:\s*\{,/g,
        replacement: ': {',
        description: 'Fix object property opening {,',
      },
      {
        pattern: /,(\s*\})/g,
        replacement: '$1',
        description: 'Fix trailing comma before closing brace',
      },

      // Type annotation fixes
      {
        pattern: /useState<([^>]+)>\(\[\]\)/g,
        replacement: 'useState<$1[]>([])',
        description: 'Fix useState array type annotation',
      },
      {
        pattern: /:\s*([^,;\n]+);(\s*\w+:)/g,
        replacement: ': $1,$2',
        description: 'Fix semicolon to comma in object properties',
      },

      // JSX fixes
      {
        pattern: /\{\)\s*$/gm,
        replacement: '{',
        description: 'Fix JSX prop object {) to {',
      },
      {
        pattern: /=\s*\(\)\s*$/gm,
        replacement: '= (',
        description: 'Fix JSX attribute assignment',
      },

      // Callback function fixes
      {
        pattern: /(setResults|setState|setNodes)\s*\(\s*prev\s*=>\s*\{\)/g,
        replacement: '$1(prev => {',
        description: 'Fix setState callback syntax',
      },

      // React component fixes
      {
        pattern: /const\s+(\w+):\s*React\.FC<([^>]*)>\s*=\s*\(\{,/g,
        replacement: 'const $1: React.FC<$2> = ({',
        description: 'Fix React FC parameter destructuring',
      },

      // Map/filter function fixes
      {
        pattern: /\.map\(\)\s*\(/g,
        replacement: '.map(',
        description: 'Fix array map() method call',
      },
      {
        pattern: /\.filter\(\)\s*\(/g,
        replacement: '.filter(',
        description: 'Fix array filter() method call',
      },

      // Import/export fixes
      {
        pattern: /import\s*\{([^}]*),\s*\}/g,
        replacement: 'import { $1 }',
        description: 'Fix import trailing comma',
      },
      {
        pattern: /export\s*\{([^}]*),\s*\}/g,
        replacement: 'export { $1 }',
        description: 'Fix export trailing comma',
      },
    ];

    for (const fix of comprehensiveFixes) {
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

    return { content: fixedContent, fixCount: fileFixCount };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    if (this.processedFiles.has(filePath)) {
      return; // Skip already processed files
    }

    try {
      if (!fs.existsSync(filePath)) {
        this.log(`File not found: ${filePath}`, 'warning');
        return;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixCount } = this.applyComprehensiveFixes(originalContent, filePath);

      if (fixCount > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        this.log(`${path.relative(process.cwd(), filePath)}: ${fixCount} comprehensive fixes`, 'success');
        this.fixCount += fixCount;
        this.fileCount++;
      }

      this.processedFiles.add(filePath);
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  /**
   * Get files with parsing errors from lint output
   */
  getFilesWithParsingErrors() {
    this.log('Getting files with parsing errors from lint output...', 'info');

    try {
      const lintOutput = execSync('pnpm lint 2>&1 | head -200', {
        encoding: 'utf8',
        cwd: process.cwd(),
        maxBuffer: 5 * 1024 * 1024,
      });

      const lines = lintOutput.split('\n');
      const filesWithErrors = new Set();

      for (const line of lines) {
        // Look for file paths (lines starting with forward slash)
        if (line.startsWith('/') && (line.includes('.tsx') || line.includes('.ts'))) {
          const filePath = line.trim();
          if (fs.existsSync(filePath)) {
            filesWithErrors.add(filePath);
          }
        }
      }

      return Array.from(filesWithErrors);
    } catch (error) {
      this.log('Failed to get lint output, using fallback file list', 'warning');

      // Fallback to known problematic files
      const fallbackFiles = [
        'client/src/components/BrowserSafeGraphEditor.tsx',
        'client/src/components/EnhancedGraphEditor.refactored.tsx',
        'client/src/components/EpicDashboard.tsx',
        'client/src/components/GraphNode.tsx',
        'client/src/components/GraphTemplates/NodeFactory.tsx',
        'client/src/components/GraphTemplates/TemplateSelector.tsx',
        'client/src/components/PerformanceDashboard.tsx',
        'client/src/__tests__/bugfix/NodeSelectionFixes.real.test.tsx',
        'packages/core/usePreviewSeeds.ts',
      ];

      return fallbackFiles.map(f => path.join(process.cwd(), f)).filter(fs.existsSync);
    }
  }

  /**
   * Run comprehensive parsing fixes
   */
  async run() {
    console.log('🚀 Starting comprehensive parsing error fixes...\n');

    const filesToProcess = this.getFilesWithParsingErrors();
    this.log(`Found ${filesToProcess.length} files to process`, 'info');

    for (const filePath of filesToProcess) {
      this.processFile(filePath);
    }

    console.log('\n📊 Comprehensive Parsing Fix Results:');
    console.log(`  Files processed: ${this.fileCount}`);
    console.log(`  Total fixes applied: ${this.fixCount}`);

    if (this.fixCount > 0) {
      this.log('Comprehensive parsing fixes completed successfully!', 'success');
      console.log('\n🔍 Running quick lint check to verify improvements...');

      try {
        const afterCount = execSync('pnpm lint 2>&1 | grep "Parsing error" | wc -l', {
          encoding: 'utf8',
          cwd: process.cwd(),
        }).trim();
        console.log(`Remaining parsing errors: ${afterCount}`);
      } catch (error) {
        this.log('Could not count remaining errors', 'warning');
      }
    } else {
      this.log('No parsing errors found to fix', 'info');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new ComprehensiveParsingFixer();
  fixer.run().catch(error => {
    console.error('❌ Fix process failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveParsingFixer;
