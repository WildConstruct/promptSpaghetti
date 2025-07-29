#!/usr/bin/env node

/**
 * Systematic Corruption Fix Script
 * Fixes the 4 main corruption patterns affecting 1,100+ syntax errors across 245+ files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define corruption patterns and their fixes
const CORRUPTION_PATTERNS = [
  {
    name: 'Malformed function calls',
    pattern: /(\w+)\(\s*;\s*\)/g,
    replacement: '$1(',
    description: 'Fix functionName(;); → functionName('
  },
  {
    name: 'Malformed object literals - opening',
    pattern: /(\w+)\(\s*\{\s*\)/g,
    replacement: '$1({',
    description: 'Fix resolve({) → resolve({'
  },
  {
    name: 'Malformed conditional expressions',
    pattern: /&&\s*\(\s*\)/g,
    replacement: '&& (',
    description: 'Fix condition && () → condition && ('
  },
  {
    name: 'Malformed switch cases',
    pattern: /case\s+(['"][\w-]+['"])\s*:\s*,/g,
    replacement: 'case $1:',
    description: 'Fix case "value":, → case "value":'
  },
  {
    name: 'Malformed object literals in deserializationOptions',
    pattern: /:\s*DeserializationOptions\s*=\s*\{\s*,/g,
    replacement: ': DeserializationOptions = {',
    description: 'Fix = {, → = {'
  },
  {
    name: 'Malformed template literal opening',
    pattern: /const\s+svg\s*=\s*`;/g,
    replacement: 'const svg = `',
    description: 'Fix const svg = `; → const svg = `'
  },
  {
    name: 'Malformed array type annotation',
    pattern: /:\s*PSGFile\s*=\s*\[\]/g,
    replacement: ': PSGFile[] = []',
    description: 'Fix : PSGFile = [] → : PSGFile[] = []'
  },
  {
    name: 'Malformed function parameter type',
    pattern: /\(ruleList:\s*CorrectionRule\)/g,
    replacement: '(ruleList: CorrectionRule[])',
    description: 'Fix (ruleList: CorrectionRule) → (ruleList: CorrectionRule[])'
  },
  {
    name: 'Malformed return statement',
    pattern: /return\s*;\s*$/gm,
    replacement: 'return (',
    description: 'Fix return; → return ('
  },
  {
    name: 'Missing closing braces in if blocks',
    pattern: /}\s*;\s*$/gm,
    replacement: '}',
    description: 'Fix }; → }'
  }
];

// Files to prioritize (critical professional interface files)
const PRIORITY_FILES = [
  'packages/core/components/CommandPalette/ProfessionalIntegration.tsx',
  'packages/core/components/MenuBar/ProfessionalMenuBar.tsx',
  'packages/core/components/CommandPalette/CommandPalette.tsx',
  'packages/core/components/CommandPalette/UndoRedoManager.tsx',
  'packages/core/components/CommandPalette/MultiSelectionManager.tsx',
  'packages/core/components/CommandPalette/AutosaveManager.tsx',
  'packages/core/components/CommandPalette/KeyboardShortcutsManager.tsx',
  'packages/core/projectManager.ts',
  'packages/core/components/WorkflowManager.tsx',
  'packages/core/components/CorrectionsStatsDashboard.tsx'
];

class CorruptionFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  findFilesToFix() {
    console.log('🔍 Finding files to fix...');
    
    const patterns = [
      'packages/core/**/*.ts',
      'packages/core/**/*.tsx',
      'client/src/**/*.ts',
      'client/src/**/*.tsx'
    ];

    let allFiles = [];
    
    for (const pattern of patterns) {
      try {
        const files = execSync(`find ${pattern.replace('**/*', '')} -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`)
          .toString()
          .split('\n')
          .filter(f => f.trim())
          .filter(f => !f.includes('node_modules') && !f.includes('.d.ts'));
        
        allFiles = [...allFiles, ...files];
      } catch (error) {
        // Ignore find errors for non-existent paths
      }
    }

    // Remove duplicates and sort by priority
    const uniqueFiles = [...new Set(allFiles)];
    
    // Sort priority files first
    const priorityFiles = uniqueFiles.filter(file => 
      PRIORITY_FILES.some(priority => file.includes(priority))
    );
    const otherFiles = uniqueFiles.filter(file => 
      !PRIORITY_FILES.some(priority => file.includes(priority))
    );

    console.log(`📁 Found ${uniqueFiles.length} files (${priorityFiles.length} priority files)`);
    return [...priorityFiles, ...otherFiles];
  }

  fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { fixed: false, reason: 'File not found' };
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileFixCount = 0;

      // Apply each corruption pattern fix
      for (const pattern of CORRUPTION_PATTERNS) {
        const beforeFix = content;
        content = content.replace(pattern.pattern, pattern.replacement);
        
        if (content !== beforeFix) {
          const fixes = (beforeFix.match(pattern.pattern) || []).length;
          fileFixCount += fixes;
          console.log(`  ✅ ${pattern.name}: ${fixes} fixes`);
        }
      }

      // Only write if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles++;
        this.totalFixes += fileFixCount;
        return { fixed: true, fixes: fileFixCount };
      }

      return { fixed: false, reason: 'No corruption found' };

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      return { fixed: false, reason: error.message };
    }
  }

  async run() {
    console.log('🚨 SYSTEMATIC CORRUPTION RECOVERY');
    console.log('🎯 Preserving Cinema 4D-level Professional Interface System\n');

    const files = this.findFilesToFix();
    
    console.log('\n🔧 Applying systematic fixes...\n');

    // Fix priority files first
    const priorityFiles = files.slice(0, PRIORITY_FILES.length);
    console.log('🎯 PRIORITY FILES (Professional Interface):');
    
    for (const filePath of priorityFiles) {
      console.log(`\n📝 ${filePath}`);
      const result = this.fixFile(filePath);
      
      if (result.fixed) {
        console.log(`  ✅ Fixed ${result.fixes} corruption patterns`);
      } else {
        console.log(`  ⚪ ${result.reason}`);
      }
    }

    // Test build after priority files
    console.log('\n🏗️ Testing build after priority fixes...');
    try {
      execSync('pnpm --filter client build', { stdio: 'pipe' });
      console.log('✅ Priority files build successful! Professional features preserved.');
    } catch (error) {
      console.log('❌ Build still failing, continuing with remaining files...\n');
      
      // Fix remaining files
      const remainingFiles = files.slice(PRIORITY_FILES.length);
      console.log('🔧 REMAINING FILES:');
      
      for (const filePath of remainingFiles) {
        const result = this.fixFile(filePath);
        
        if (result.fixed) {
          console.log(`📝 ${filePath}: ${result.fixes} fixes`);
        }
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RECOVERY SUMMARY:');
    console.log(`✅ Files fixed: ${this.fixedFiles}`);
    console.log(`🔧 Total corruption patterns fixed: ${this.totalFixes}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }

    // Final build test
    console.log('\n🏗️ Final build test...');
    try {
      execSync('pnpm --filter client build', { stdio: 'inherit' });
      console.log('\n🎉 SUCCESS! Build is now working!');
      console.log('🎬 Cinema 4D-level Professional Interface System preserved!');
    } catch (error) {
      console.log('\n⚠️ Build still has issues. Manual review may be needed.');
      console.log('Priority professional features should be preserved, but some edge cases may remain.');
    }
  }
}

// Run the fixer
const fixer = new CorruptionFixer();
fixer.run().catch(console.error);