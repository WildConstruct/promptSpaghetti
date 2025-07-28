#!/usr/bin/env node

/**
 * Fix Corrupted Source Files Script
 * Repairs TypeScript/JavaScript files corrupted by malformed transformations
 */

const fs = require('fs');
const path = require('path');

class SourceFileRepairer {
  constructor() {
    this.repairedFiles = [];
    this.dryRun = process.argv.includes('--dry-run');
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      repair: '🔧'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  /**
   * Check if a file needs repair based on common corruption patterns
   */
  needsRepair(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      let issues = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Pattern 1: Orphaned export statements in function bodies
        if (line.match(/^\s*export\s+/) && !this.isValidExportContext(lines, i)) {
          issues.push({ line: lineNum, type: 'orphaned_export', content: line });
        }

        // Pattern 2: Malformed export statements with extra spaces
        if (line.match(/^export\s{3,}/)) {
          issues.push({ line: lineNum, type: 'malformed_export', content: line });
        }

        // Pattern 3: Broken string literals
        if (line.match(/^\s*\w+\s*:\s*'[^']*$/) && !line.includes("'")) {
          issues.push({ line: lineNum, type: 'broken_string', content: line });
        }

        // Pattern 4: Missing semicolons after statements
        if (line.match(/^\s*(const|let|var)\s+\w+\s*=.*[^;]$/) && !line.includes('{')) {
          issues.push({ line: lineNum, type: 'missing_semicolon', content: line });
        }

        // Pattern 5: Unterminated JSX expressions
        if (line.match(/^[^'"`]*\$\{[^}]*$/)) {
          issues.push({ line: lineNum, type: 'broken_jsx_expression', content: line });
        }

        // Pattern 6: Missing closing parentheses
        if (line.match(/error TS1005.*expected/) || line.match(/\([^)]*$/) && !line.includes('//')) {
          issues.push({ line: lineNum, type: 'missing_closing_paren', content: line });
        }

        // Pattern 7: Malformed object properties
        if (line.match(/^\s*\w+\s*:\s*[^,;}\s]+\s*[^,;}\s]*$/)) {
          issues.push({ line: lineNum, type: 'malformed_object_property', content: line });
        }

        // Pattern 8: Broken template literals
        if (line.match(/.*\$\{.*[^}]$/)) {
          issues.push({ line: lineNum, type: 'broken_template_literal', content: line });
        }

        // Pattern 9: Expression expected errors
        if (line.includes('Expression expected') || line.match(/^\s*\w+\s*\|\s*$/)) {
          issues.push({ line: lineNum, type: 'expression_expected', content: line });
        }
      }

      return issues.length > 0 ? { needsRepair: true, issues } : { needsRepair: false };
    } catch (error) {
      this.log(`Could not read ${filePath}: ${error.message}`, 'warning');
      return { needsRepair: false };
    }
  }

  /**
   * Check if an export statement is in a valid context
   */
  isValidExportContext(lines, exportLineIndex) {
    // Check if we're at the top level (not inside a function)
    let braceDepth = 0;
    let inFunction = false;

    for (let i = 0; i < exportLineIndex; i++) {
      const line = lines[i];
      
      // Track function contexts
      if (line.match(/(function|=>|\bcreate\s*\()/)) {
        inFunction = true;
      }

      // Track brace depth
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      if (braceDepth <= 0 && inFunction) {
        inFunction = false;
      }
    }

    return !inFunction && braceDepth <= 0;
  }

  /**
   * Repair a corrupted file
   */
  repairFile(filePath) {
    const { needsRepair, issues } = this.needsRepair(filePath);
    
    if (!needsRepair) {
      return false;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let lines = content.split('\n');
      let repaired = false;

      // Sort issues by line number in reverse order to avoid index shifting
      issues.sort((a, b) => b.line - a.line);

      for (const issue of issues) {
        const lineIndex = issue.line - 1;
        const originalLine = lines[lineIndex];

        switch (issue.type) {
          case 'orphaned_export':
            // Remove orphaned export statements that are clearly misplaced
            if (originalLine.match(/^export\s+const\s+\w+\s*=\s*await\s/)) {
              lines[lineIndex] = '';
              repaired = true;
            }
            break;

          case 'malformed_export':
            // Fix export statements with extra spaces
            lines[lineIndex] = originalLine.replace(/^export\s{3,}/, 'export ');
            repaired = true;
            break;

          case 'broken_string':
            // Attempt to fix broken string literals (simple cases)
            if (originalLine.includes("'") && !originalLine.match(/'[^']*'$/)) {
              lines[lineIndex] = originalLine + "';";
              repaired = true;
            }
            break;

          case 'missing_semicolon':
            // Add missing semicolons
            lines[lineIndex] = originalLine + ';';
            repaired = true;
            break;

          case 'broken_jsx_expression':
            // Fix broken JSX expressions by adding closing brace
            if (originalLine.match(/\$\{[^}]*$/)) {
              lines[lineIndex] = originalLine + '}';
              repaired = true;
            }
            break;

          case 'missing_closing_paren':
            // Add missing closing parentheses where obvious
            if (originalLine.match(/\([^)]*$/) && !originalLine.includes('//')) {
              lines[lineIndex] = originalLine + ')';
              repaired = true;
            }
            break;

          case 'malformed_object_property':
            // Fix object properties missing commas or semicolons
            if (originalLine.match(/^\s*\w+\s*:\s*[^,;}\s]+\s*$/) && !originalLine.endsWith(',') && !originalLine.endsWith(';')) {
              lines[lineIndex] = originalLine + ',';
              repaired = true;
            }
            break;

          case 'broken_template_literal':
            // Fix broken template literals
            if (originalLine.match(/.*\$\{.*[^}]$/)) {
              lines[lineIndex] = originalLine + '}';
              repaired = true;
            }
            break;

          case 'expression_expected':
            // Remove lines with expression expected errors (likely corrupted)
            if (originalLine.includes('Expression expected')) {
              lines[lineIndex] = '';
              repaired = true;
            }
            break;
        }
      }

      if (repaired) {
        // Clean up any empty lines that were created
        lines = lines.filter((line, index) => {
          if (line.trim() === '') {
            // Keep empty line if it's for formatting (between functions, etc.)
            const nextLine = lines[index + 1];
            const prevLine = lines[index - 1];
            return nextLine && (nextLine.startsWith('export') || nextLine.startsWith('//'));
          }
          return true;
        });

        const repairedContent = lines.join('\n');

        if (this.dryRun) {
          this.log(`Would repair: ${path.relative(process.cwd(), filePath)} (${issues.length} issues)`, 'warning');
        } else {
          fs.writeFileSync(filePath, repairedContent, 'utf8');
          this.log(`Repaired: ${path.relative(process.cwd(), filePath)} (${issues.length} issues)`, 'repair');
          this.repairedFiles.push(path.relative(process.cwd(), filePath));
        }

        return true;
      }
    } catch (error) {
      this.log(`Failed to repair ${filePath}: ${error.message}`, 'error');
    }

    return false;
  }

  /**
   * Repair files in a directory recursively
   */
  repairDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory() && !['node_modules', 'dist', 'coverage', '.git'].includes(item.name)) {
        this.repairDirectory(fullPath);
      } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
        this.repairFile(fullPath);
      }
    }
  }

  /**
   * Run the repair process
   */
  run() {
    console.log('🔧 Starting source file repair...\n');

    if (this.dryRun) {
      this.log('DRY RUN MODE - No files will be modified', 'warning');
    }

    const targetDirs = [
      'packages/core'
    ];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        this.log(`Repairing files in ${dir}...`, 'info');
        this.repairDirectory(dir);
      } else {
        this.log(`Directory not found: ${dir}`, 'warning');
      }
    }

    // Report results
    console.log('\n📊 Repair Results:');

    if (this.dryRun) {
      this.log('Dry run completed - no files were actually modified', 'info');
    } else if (this.repairedFiles.length > 0) {
      this.log(`Repaired ${this.repairedFiles.length} corrupted files`, 'success');
      
      // Suggest next steps
      console.log('\n🔧 Next steps:');
      console.log('  1. Run: node scripts/validate-build.js');
      console.log('  2. Test compilation: cd packages/core && pnpm tsc --noEmit');
      console.log('  3. Run tests: pnpm test');
    } else {
      this.log('No corrupted files found to repair', 'success');
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Source File Repairer

Usage:
  node scripts/fix-corrupted-source-files.js [options]

Options:
  --dry-run    Show what would be repaired without actually modifying files
  --help, -h   Show this help message

This script repairs TypeScript/JavaScript files corrupted by malformed transformations:
1. Removes orphaned export statements in function bodies
2. Fixes malformed export statements with extra spaces
3. Repairs broken string literals
4. Adds missing semicolons
`);
  process.exit(0);
}

// Run repairer if called directly
if (require.main === module) {
  const repairer = new SourceFileRepairer();
  repairer.run();
}

module.exports = SourceFileRepairer;