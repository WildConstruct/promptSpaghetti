#!/usr/bin/env node

/**
 * Phase 4: Critical Syntax Repair
 * 
 * Handles remaining critical syntax corruption patterns that prevent TypeScript compilation.
 * This targets specific patterns identified in the build validation failure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Critical repair patterns based on validation errors
const CRITICAL_REPAIR_PATTERNS = [
  // Interface property syntax errors
  {
    pattern: /(\w+):\s*(\w+);,\s*$/gm,
    replacement: '$1: $2;',
    description: 'Fix interface property syntax with trailing comma and semicolon'
  },
  {
    pattern: /(\w+)\?\?\s*(\w+);,\s*$/gm,
    replacement: '$1?: $2;',
    description: 'Fix optional property syntax'
  },
  
  // Object literal syntax errors  
  {
    pattern: /{\s*([^}]+),\s*$/gm,
    replacement: '{ $1 }',
    description: 'Fix object literal with trailing comma'
  },
  {
    pattern: /(\w+):\s*([^,}]+),\s*\n\s*}/gm,
    replacement: '$1: $2\n}',
    description: 'Fix object property trailing comma before closing brace'
  },
  
  // JSX expression syntax errors
  {
    pattern: /{\s*([^}]+)\s*;\s*}/g,
    replacement: '{ $1 }',
    description: 'Fix JSX expression with semicolon'
  },
  {
    pattern: /{\s*([^}]+),\s*}/g,
    replacement: '{ $1 }',
    description: 'Fix JSX expression with trailing comma'
  },
  
  // Function parameter syntax errors
  {
    pattern: /\(\s*([^)]+),\s*\)/g,
    replacement: '($1)',
    description: 'Fix function parameters with trailing comma'
  },
  
  // Array syntax errors
  {
    pattern: /\[\s*([^\]]+),\s*\]/g,
    replacement: '[$1]',
    description: 'Fix array with trailing comma'
  },
  
  // Import/export syntax errors
  {
    pattern: /import\s*{\s*([^}]+),\s*}\s*from/g,
    replacement: 'import { $1 } from',
    description: 'Fix import statement with trailing comma'
  },
  
  // Generic type syntax errors
  {
    pattern: /<([^>]+),\s*>/g,
    replacement: '<$1>',
    description: 'Fix generic type with trailing comma'
  },
  
  // Conditional expression syntax errors
  {
    pattern: /\?\s*([^:]+)\s*:\s*([^;,}]+);,\s*$/gm,
    replacement: '? $1 : $2',
    description: 'Fix ternary operator syntax'
  },
  
  // Method definition syntax errors
  {
    pattern: /(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*([^{;]+);,\s*$/gm,
    replacement: '$1($2): $3;',
    description: 'Fix method signature syntax'
  },
  
  // Arrow function syntax errors
  {
    pattern: /=>\s*([^;,}]+);,\s*$/gm,
    replacement: '=> $1',
    description: 'Fix arrow function syntax'
  },
  
  // JSX closing tag syntax errors
  {
    pattern: /<\/(\w+)>\s*;,\s*$/gm,
    replacement: '</$1>',
    description: 'Fix JSX closing tag syntax'
  },
  
  // Complex nested object syntax errors
  {
    pattern: /{\s*([^{}]+)\s*{\s*([^}]+),\s*}\s*,\s*}/g,
    replacement: '{ $1 { $2 } }',
    description: 'Fix nested object syntax'
  },
  
  // Multiple trailing commas and semicolons
  {
    pattern: /;,\s*;,/g,
    replacement: ';',
    description: 'Fix multiple trailing semicolons and commas'
  },
  {
    pattern: /,\s*;,/g,
    replacement: ',',
    description: 'Fix mixed comma and semicolon'
  },
  
  // Expression statement syntax errors
  {
    pattern: /\s*;\s*}\s*,\s*$/gm,
    replacement: '\n}',
    description: 'Fix expression statement ending'
  }
];

// Additional context-aware repairs
const CONTEXT_REPAIRS = [
  // Interface context repairs
  {
    context: /interface\s+\w+\s*{[^}]*$/gm,
    patterns: [
      { pattern: /;,\s*$/gm, replacement: ';' },
      { pattern: /,\s*$/gm, replacement: ';' }
    ]
  },
  
  // Object literal context repairs
  {
    context: /const\s+\w+\s*=\s*{[^}]*$/gm,
    patterns: [
      { pattern: /;,\s*$/gm, replacement: ',' },
      { pattern: /;\s*$/gm, replacement: ',' }
    ]
  },
  
  // JSX context repairs
  {
    context: /<\w+[^>]*>[^<]*$/gm,
    patterns: [
      { pattern: /;,\s*$/gm, replacement: '' },
      { pattern: /,\s*$/gm, replacement: '' }
    ]
  }
];

function applyContextAwareRepairs(content, filePath) {
  let repairedContent = content;
  let repairCount = 0;
  
  CONTEXT_REPAIRS.forEach(contextRepair => {
    const matches = content.match(contextRepair.context);
    if (matches) {
      matches.forEach(match => {
        let repairedMatch = match;
        contextRepair.patterns.forEach(pattern => {
          const before = repairedMatch;
          repairedMatch = repairedMatch.replace(pattern.pattern, pattern.replacement);
          if (before !== repairedMatch) {
            repairCount++;
          }
        });
        repairedContent = repairedContent.replace(match, repairedMatch);
      });
    }
  });
  
  return { content: repairedContent, repairs: repairCount };
}

function applyCriticalRepairs(content, filePath) {
  let repairedContent = content;
  let totalRepairs = 0;
  const appliedPatterns = [];
  
  CRITICAL_REPAIR_PATTERNS.forEach((repair, index) => {
    const before = repairedContent;
    repairedContent = repairedContent.replace(repair.pattern, repair.replacement);
    
    if (before !== repairedContent) {
      const matches = (before.match(repair.pattern) || []).length;
      totalRepairs += matches;
      appliedPatterns.push({
        index: index + 1,
        description: repair.description,
        matches
      });
    }
  });
  
  // Apply context-aware repairs
  const contextResult = applyContextAwareRepairs(repairedContent, filePath);
  repairedContent = contextResult.content;
  totalRepairs += contextResult.repairs;
  
  return { content: repairedContent, repairs: totalRepairs, patterns: appliedPatterns };
}

function processTypeScriptFiles(dir) {
  const stats = {
    totalFiles: 0,
    processedFiles: 0,
    totalRepairs: 0,
    failedFiles: [],
    repairedFiles: []
  };
  
  function processDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry)) {
          processDirectory(fullPath);
        }
      } else if (entry.match(/\.(ts|tsx)$/)) {
        stats.totalFiles++;
        
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const result = applyCriticalRepairs(content, fullPath);
          
          if (result.repairs > 0) {
            fs.writeFileSync(fullPath, result.content, 'utf8');
            stats.processedFiles++;
            stats.totalRepairs += result.repairs;
            stats.repairedFiles.push({
              file: path.relative(process.cwd(), fullPath),
              repairs: result.repairs,
              patterns: result.patterns
            });
            
            console.log(`✅ ${path.relative(process.cwd(), fullPath)}: ${result.repairs} critical repairs`);
            if (result.patterns.length > 0) {
              result.patterns.forEach(pattern => {
                console.log(`   - ${pattern.description} (${pattern.matches} matches)`);
              });
            }
          }
        } catch (error) {
          stats.failedFiles.push({
            file: path.relative(process.cwd(), fullPath),
            error: error.message
          });
          console.error(`❌ Failed to process ${path.relative(process.cwd(), fullPath)}: ${error.message}`);
        }
      }
    }
  }
  
  processDirectory(dir);
  return stats;
}

function main() {
  console.log('🔧 Phase 4: Critical Syntax Repair');
  console.log('=====================================');
  
  const packagesDir = path.join(process.cwd(), 'packages', 'core');
  
  if (!fs.existsSync(packagesDir)) {
    console.error('❌ packages/core directory not found');
    process.exit(1);
  }
  
  console.log(`📁 Processing TypeScript files in: ${packagesDir}`);
  
  const stats = processTypeScriptFiles(packagesDir);
  
  console.log('\n📊 Phase 4 Critical Repair Summary:');
  console.log(`   📄 Total files scanned: ${stats.totalFiles}`);
  console.log(`   ✅ Files repaired: ${stats.processedFiles}`);
  console.log(`   🔧 Total critical repairs: ${stats.totalRepairs}`);
  
  if (stats.failedFiles.length > 0) {
    console.log(`   ❌ Failed files: ${stats.failedFiles.length}`);
    stats.failedFiles.forEach(failure => {
      console.log(`      - ${failure.file}: ${failure.error}`);
    });
  }
  
  if (stats.repairedFiles.length > 0) {
    console.log('\n🔧 Detailed Repair Results:');
    stats.repairedFiles.slice(0, 10).forEach(repair => {
      console.log(`   ${repair.file}: ${repair.repairs} repairs`);
    });
    
    if (stats.repairedFiles.length > 10) {
      console.log(`   ... and ${stats.repairedFiles.length - 10} more files`);
    }
  }
  
  // Run a quick TypeScript check on a sample file to verify improvements
  if (stats.processedFiles > 0) {
    console.log('\n🔍 Verifying repair effectiveness...');
    try {
      const sampleFile = stats.repairedFiles[0].file;
      execSync(`npx tsc --noEmit --skipLibCheck packages/core/${path.basename(sampleFile)}`, { 
        stdio: 'pipe', 
        cwd: process.cwd() 
      });
      console.log('✅ Sample file now compiles without syntax errors');
    } catch (error) {
      console.log('⚠️  Some syntax issues may remain - additional repairs needed');
    }
  }
  
  console.log('\n✨ Phase 4 critical syntax repair completed!');
  
  if (stats.totalRepairs > 0) {
    console.log('\n📝 Next steps:');
    console.log('   1. Run build validation: node scripts/validate-build.js');
    console.log('   2. If issues remain, inspect specific error patterns');
    console.log('   3. Consider running additional targeted repairs');
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyCriticalRepairs, processTypeScriptFiles };