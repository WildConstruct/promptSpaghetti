#!/usr/bin/env node
/**
 * Quick TypeScript Fix Script
 * Removes orphaned closing brackets and fixes basic syntax issues
 */

const fs = require('fs');
const path = require('path');

class QuickTypeScriptFixer {
  constructor() {
    this.fixCount = 0;
    this.fileCount = 0;
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      let localFixes = 0;

      // Remove orphaned closing brackets at start of lines (before interface, export, etc.)
      const orphanedBracketPattern = /^\s*\}\s*\n(?=\s*(interface|export|type|const|class|function))/gm;
      const orphanedMatches = content.match(orphanedBracketPattern) || [];
      if (orphanedMatches.length > 0) {
        content = content.replace(orphanedBracketPattern, '\n');
        localFixes += orphanedMatches.length;
        modified = true;
      }

      // Remove orphaned closing brackets followed by nothing
      const trailingOrphanPattern = /^\s*\}\s*$/gm;
      const trailingMatches = content.match(trailingOrphanPattern) || [];
      if (trailingMatches.length > 0) {
        content = content.replace(trailingOrphanPattern, '');
        localFixes += trailingMatches.length;
        modified = true;
      }

      // Fix malformed object literals with comma at start: "{ ,"
      const malformedObjectPattern = /\{\s*,/g;
      const objectMatches = content.match(malformedObjectPattern) || [];
      if (objectMatches.length > 0) {
        content = content.replace(malformedObjectPattern, '{');
        localFixes += objectMatches.length;
        modified = true;
      }

      // Fix malformed array generics: "Array<{ ,"
      const malformedArrayPattern = /Array<\{\s*,/g;
      const arrayMatches = content.match(malformedArrayPattern) || [];
      if (arrayMatches.length > 0) {
        content = content.replace(malformedArrayPattern, 'Array<{');
        localFixes += arrayMatches.length;
        modified = true;
      }

      // Fix broken function parameters with closing paren on wrong line
      const brokenParamPattern = /\(\)\s*\n\s*([^)]+)\s*\n\s*\):/g;
      const paramMatches = content.match(brokenParamPattern) || [];
      if (paramMatches.length > 0) {
        content = content.replace(brokenParamPattern, '($1):');
        localFixes += paramMatches.length;
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixCount += localFixes;
        console.log(`✓ Fixed ${localFixes} issues in ${path.relative(process.cwd(), filePath)}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        this.processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        this.fileCount++;
        this.fixFile(fullPath);
      }
    }
  }

  run() {
    console.log('🔧 Starting quick TypeScript fixes...\n');
    
    const startTime = Date.now();
    const targetDirs = [
      'packages/core',
      'client/src'
    ];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        console.log(`📁 Processing directory: ${dir}`);
        this.processDirectory(dir);
      }
    }

    const duration = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Quick TypeScript Fix Summary');
    console.log('='.repeat(50));
    console.log(`Files processed: ${this.fileCount}`);
    console.log(`Total fixes: ${this.fixCount}`);
    console.log(`Duration: ${duration}ms`);
    console.log('✅ Quick fixes completed!');
  }
}

// Run the fixer
const fixer = new QuickTypeScriptFixer();
fixer.run();