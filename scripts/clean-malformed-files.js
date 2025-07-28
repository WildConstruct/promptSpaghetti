#!/usr/bin/env node

/**
 * Clean Malformed Files Script
 * Automatically removes malformed transpiled JS files that have TS/TSX counterparts
 */

const fs = require('fs');
const path = require('path');

class MalformedFileCleaner {
  constructor() {
    this.removedFiles = [];
    this.dryRun = process.argv.includes('--dry-run');
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      remove: '🗑️'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  /**
   * Check if a JS file should be removed
   */
  shouldRemoveFile(jsFilePath) {
    const dir = path.dirname(jsFilePath);
    const baseName = path.basename(jsFilePath, '.js');
    const tsFile = path.join(dir, `${baseName}.ts`);
    const tsxFile = path.join(dir, `${baseName}.tsx`);
    
    // Remove if corresponding .ts or .tsx exists
    if (fs.existsSync(tsFile) || fs.existsSync(tsxFile)) {
      return { shouldRemove: true, reason: 'has TS/TSX counterpart' };
    }
    
    // Check for malformed content patterns
    try {
      const content = fs.readFileSync(jsFilePath, 'utf8');
      const lines = content.split('\n');
      
      let hasOrphanedReturn = false;
      let hasOrphanedJSX = false;
      let inFunction = false;
      let braceCount = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Track function context
        if (trimmed.includes('function') || trimmed.includes('=>') || 
            (trimmed.includes('const') && trimmed.includes('='))) {
          inFunction = true;
        }
        
        // Track brace depth
        braceCount += (trimmed.match(/{/g) || []).length;
        braceCount -= (trimmed.match(/}/g) || []).length;
        
        if (braceCount <= 0) {
          inFunction = false;
        }
        
        // Check for problematic patterns
        if (trimmed.startsWith('return ') && !inFunction) {
          hasOrphanedReturn = true;
        }
        
        if ((trimmed.includes('_jsx') || trimmed.includes('_jsxs')) && !inFunction) {
          hasOrphanedJSX = true;
        }
      }
      
      if (hasOrphanedReturn) {
        return { shouldRemove: true, reason: 'orphaned return statement' };
      }
      
      if (hasOrphanedJSX) {
        return { shouldRemove: true, reason: 'orphaned JSX' };
      }
      
    } catch (error) {
      this.log(`Could not read ${jsFilePath}: ${error.message}`, 'warning');
    }
    
    return { shouldRemove: false };
  }

  /**
   * Clean malformed files in a directory recursively
   */
  cleanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && !['node_modules', 'dist', 'coverage', '.git'].includes(item.name)) {
        this.cleanDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        const { shouldRemove, reason } = this.shouldRemoveFile(fullPath);
        
        if (shouldRemove) {
          const relativePath = path.relative(process.cwd(), fullPath);
          
          if (this.dryRun) {
            this.log(`Would remove: ${relativePath} (${reason})`, 'warning');
          } else {
            try {
              fs.unlinkSync(fullPath);
              this.log(`Removed: ${relativePath} (${reason})`, 'remove');
              this.removedFiles.push(relativePath);
            } catch (error) {
              this.log(`Failed to remove ${relativePath}: ${error.message}`, 'error');
            }
          }
        }
      }
    }
  }

  /**
   * Run the cleanup process
   */
  run() {
    console.log('🧹 Starting malformed file cleanup...\n');
    
    if (this.dryRun) {
      this.log('DRY RUN MODE - No files will be deleted', 'warning');
    }
    
    const targetDirs = [
      'packages/core'
    ];
    
    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        this.log(`Cleaning ${dir}...`, 'info');
        this.cleanDirectory(dir);
      } else {
        this.log(`Directory not found: ${dir}`, 'warning');
      }
    }
    
    // Report results
    console.log('\n📊 Cleanup Results:');
    
    if (this.dryRun) {
      this.log('Dry run completed - no files were actually removed', 'info');
    } else if (this.removedFiles.length > 0) {
      this.log(`Removed ${this.removedFiles.length} malformed files`, 'success');
      
      // Suggest running validation
      console.log('\n🔧 Next steps:');
      console.log('  1. Run: node scripts/validate-build.js');
      console.log('  2. Test the build: cd client && npm run build');
      console.log('  3. Commit the cleanup: git add -A && git commit -m "clean: remove malformed files"');
    } else {
      this.log('No malformed files found to remove', 'success');
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧹 Malformed File Cleaner

Usage:
  node scripts/clean-malformed-files.js [options]

Options:
  --dry-run    Show what would be removed without actually deleting files
  --help, -h   Show this help message

This script removes malformed transpiled .js files that:
1. Have corresponding .ts/.tsx files
2. Contain orphaned return statements
3. Contain orphaned JSX outside function scope
`);
  process.exit(0);
}

// Run cleaner if called directly
if (require.main === module) {
  const cleaner = new MalformedFileCleaner();
  cleaner.run();
}

module.exports = MalformedFileCleaner;