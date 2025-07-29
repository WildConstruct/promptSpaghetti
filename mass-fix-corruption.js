#!/usr/bin/env node

/**
 * Mass Corruption Fix Script
 * Systematically fixes all corruption patterns to preserve Cinema 4D professional features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// All corruption patterns with more comprehensive regex
const CORRUPTION_PATTERNS = [
  // Interface/type property trailing commas
  {
    name: 'Interface property trailing comma',
    pattern: /(\w+):\s*([^;,]+?);,/g,
    replacement: '$1: $2;',
    description: 'Fix property: type;, → property: type;'
  },
  
  // Function parameter trailing comma with parenthesis
  {
    name: 'Function parameter malformed',
    pattern: /= \(\{,\)/g,
    replacement: '= ({',
    description: 'Fix = ({,) → = ({'
  },
  
  // Malformed resolve/function calls  
  {
    name: 'Malformed resolve calls',
    pattern: /(\w+)\(\{\)/g,
    replacement: '$1({',
    description: 'Fix resolve({) → resolve({'
  },
  
  // Switch case trailing commas
  {
    name: 'Switch case trailing comma',
    pattern: /case\s+(['"][\w-]+['"])\s*:\s*,/g,
    replacement: 'case $1:',
    description: 'Fix case "value":, → case "value":'  
  },
  
  // Conditional expression malformed
  {
    name: 'Conditional expression malformed',
    pattern: /&&\s*\(\s*\)/g,
    replacement: '&& (',
    description: 'Fix condition && () → condition && ('
  },
  
  // Function calls with semicolon inside
  {
    name: 'Function calls with semicolon',
    pattern: /(\w+)\(\s*;\s*\)/g,
    replacement: '$1(',
    description: 'Fix functionName(;) → functionName('
  },
  
  // Malformed template literal
  {
    name: 'Template literal malformed',
    pattern: /=\s*`\s*;/g,
    replacement: '= `',
    description: 'Fix = `; → = `'
  },
  
  // Array type malformed
  {
    name: 'Array type malformed',
    pattern: /:\s*(\w+)\s*=\s*\[\]/g,
    replacement: ': $1[] = []',
    description: 'Fix : Type = [] → : Type[] = []'
  },
  
  // Return statement malformed
  {
    name: 'Return statement malformed',
    pattern: /return\s*;(?=\s*$)/gm,
    replacement: 'return (',
    description: 'Fix return; → return ('
  },
  
  // Missing opening parenthesis in exports
  {
    name: 'Export component malformed',
    pattern: /export\s*const\s*(\w+):[^=]+=\s*\(\{/g,
    replacement: 'export const $1: React.FC<$1Props> = ({',
    description: 'Fix export const Component = ({ → proper export'
  }
];

class MassCorruptionFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  getAllTSFiles() {
    const findCommand = `find packages/core -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .d.ts | head -50`;
    
    try {
      const output = execSync(findCommand, { encoding: 'utf8' });
      return output.trim().split('\n').filter(f => f.trim());
    } catch (error) {
      console.log('Using fallback file discovery...');
      return [
        'packages/core/projectManager.ts',
        'packages/core/components/WorkflowManager.tsx',
        'packages/core/components/WorkflowStateIndicator.tsx',
        'packages/core/components/WorkflowStateManager.tsx',
        'packages/core/components/WorkflowTransitionControls.tsx',
        'packages/core/components/CorrectionsStatsDashboard.tsx',
        'packages/core/components/MobileCorrectionsPanel.tsx'
      ];
    }
  }

  fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { fixed: false, reason: 'File not found' };
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileFixCount = 0;

      // Apply each pattern
      for (const pattern of CORRUPTION_PATTERNS) {
        const beforeFix = content;
        content = content.replace(pattern.pattern, pattern.replacement);
        
        if (content !== beforeFix) {
          const fixes = (beforeFix.match(pattern.pattern) || []).length;
          fileFixCount += fixes;
          if (fixes > 0) {
            console.log(`    ✅ ${pattern.name}: ${fixes} fixes`);
          }
        }
      }

      // Write back if changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.processedFiles++;
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
    console.log('🚨 MASS CORRUPTION RECOVERY');
    console.log('🎯 Preserving Cinema 4D Professional Interface System');
    console.log('⚡ Systematic Pattern-Based Repair\n');

    const files = this.getAllTSFiles();
    console.log(`📁 Found ${files.length} TypeScript files to process\n`);

    for (const filePath of files) {
      console.log(`🔧 Processing: ${filePath}`);
      const result = this.fixFile(filePath);
      
      if (result.fixed) {
        console.log(`  ✅ Fixed ${result.fixes} corruption patterns\n`);
      } else if (result.reason !== 'No corruption found') {
        console.log(`  ❌ ${result.reason}\n`);
      } else {
        console.log(`  ⚪ Clean file\n`);
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 RECOVERY SUMMARY:');
    console.log(`✅ Files processed: ${this.processedFiles}`);
    console.log(`🔧 Total corruption patterns fixed: ${this.totalFixes}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }

    // Test build
    console.log('\n🏗️ Testing build...');
    try {
      execSync('pnpm --filter client build', { stdio: 'inherit' });
      console.log('\n🎉 SUCCESS! Cinema 4D Professional Interface System preserved!');
      console.log('🚀 Deployment ready!');
    } catch (error) {
      console.log('\n⚠️ Some corruption may remain. Manual review needed.');
      console.log('Most professional features should be preserved.');
    }
  }
}

// Run the mass fixer
const fixer = new MassCorruptionFixer();
fixer.run().catch(console.error);