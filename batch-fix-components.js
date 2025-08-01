#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BatchComponentFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalErrorsFixed = 0;
  }

  // Get list of files to fix based on error count
  getFilesToFix() {
    console.log('🔍 Finding files with most errors...');
    
    try {
      const output = execSync(
        `pnpm tsc --noEmit 2>&1 | grep -E "^client/src/components/" | grep -E "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -nr | head -30`,
        { encoding: 'utf8' }
      );
      
      return output
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/^\s*(\d+)\s+(.+)$/);
          if (match) {
            return {
              count: parseInt(match[1]),
              file: match[2].trim()
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      // If the command fails, use a predefined list
      return [
        { count: 615, file: 'client/src/components/admin/backup/RestoreInterface.tsx' },
        { count: 335, file: 'client/src/components/admin/UserManagementDashboard.tsx' },
        { count: 261, file: 'client/src/components/admin/UnifiedModerationDashboard.tsx' },
        { count: 110, file: 'client/src/components/BrowserSafeGraphEditor.tsx' },
        { count: 26, file: 'client/src/components/EpicDashboard.tsx' },
        { count: 10, file: 'client/src/components/StatusBar.tsx' }
      ];
    }
  }

  // Apply common fixes to a file
  fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ File not found: ${filePath}`);
      return 0;
    }

    console.log(`\n🔧 Fixing ${path.basename(filePath)}...`);
    
    const beforeErrors = this.getErrorCount(filePath);
    console.log(`  📊 Errors before: ${beforeErrors}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Apply all fixes
    content = this.fixCommonPatterns(content);
    content = this.fixReactPatterns(content);
    content = this.fixTypeScriptPatterns(content);
    content = this.fixImportExportPatterns(content);
    content = this.balanceBraces(content);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles++;
    }

    const afterErrors = this.getErrorCount(filePath);
    const fixed = beforeErrors - afterErrors;
    this.totalErrorsFixed += fixed;
    
    console.log(`  ✅ Errors after: ${afterErrors} (fixed ${fixed})`);
    return fixed;
  }

  fixCommonPatterns(content) {
    // Fix interface property syntax
    content = content.replace(/;,/g, ';');
    content = content.replace(/: (\w+),\n/g, ': $1;\n');
    
    // Fix optional property syntax
    content = content.replace(/(\w+)\s*\?\s+(\w+)/g, '$1?: $2');
    content = content.replace(/(\w+)\s*\?\s*:\s*/g, '$1?: ');
    
    // Fix array type declarations
    content = content.replace(/: (\w+)\s+=/g, ': $1[] =');
    content = content.replace(/: string}/g, ': string[]');
    
    // Fix object syntax
    content = content.replace(/,\s*}/g, '\n  }');
    content = content.replace(/{\s*,/g, '{\n    ');
    
    // Fix function syntax
    content = content.replace(/=>\s*{\s*;/g, '=> {');
    content = content.replace(/}\s*;\s*}/g, '}}');
    
    return content;
  }

  fixReactPatterns(content) {
    // Fix JSX syntax
    content = content.replace(/return\s*;\s*\n\s*</g, 'return (\n    <');
    content = content.replace(/>\s*\)\s*;/g, '>\n  );');
    
    // Fix JSX props
    content = content.replace(/onClick=\{() => \{\}\} => /g, 'onClick={() => ');
    content = content.replace(/=\{\{,/g, '={{');
    
    // Fix style objects
    content = content.replace(/style=\{\{([^}]+)\}\},/g, 'style={{$1}}');
    
    // Fix conditional rendering
    content = content.replace(/\) : \(\),/g, ') : (');
    content = content.replace(/&& \(\),/g, '&& (');
    
    // Fix React component syntax
    content = content.replace(/const (\w+): React\.FC<(\w+)> = \(/g, 'const $1: React.FC<$2> = (');
    
    return content;
  }

  fixTypeScriptPatterns(content) {
    // Fix type declarations
    content = content.replace(/: Role\[\] =\{\{/g, ': Role[] = [{');
    content = content.replace(/: Permission\[\] =\{\{/g, ': Permission[] = [{');
    
    // Fix generic types
    content = content.replace(/useState<(\w+)>\(/g, 'useState<$1>(');
    content = content.replace(/useRef<(\w+)>\(/g, 'useRef<$1>(');
    
    // Fix interface syntax
    content = content.replace(/interface (\w+) \{[\s]*interface/g, 'interface $1 {\n}\n\ninterface');
    
    // Fix async/await syntax
    content = content.replace(/catch \(error\) \{\s*;/g, 'catch (error) {');
    
    return content;
  }

  fixImportExportPatterns(content) {
    // Fix import statements
    content = content.replace(/import \{\s*,/g, 'import {');
    content = content.replace(/,\s*\} from/g, ' } from');
    
    // Fix export statements
    content = content.replace(/export \{\s*,/g, 'export {');
    content = content.replace(/export default (\w+)\s*;/g, 'export default $1;');
    
    return content;
  }

  balanceBraces(content) {
    const lines = content.split('\n');
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    
    // Count all braces, parentheses, and brackets
    for (const line of lines) {
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
    }
    
    // Add missing closing braces at the end
    if (braceCount > 0) {
      console.log(`  ⚠️  Adding ${braceCount} missing closing braces`);
      for (let i = 0; i < braceCount; i++) {
        content += '\n}';
      }
    }
    
    // Remove extra closing braces from the end
    if (braceCount < 0) {
      console.log(`  ⚠️  Removing ${Math.abs(braceCount)} extra closing braces`);
      const linesToRemove = Math.abs(braceCount);
      for (let i = 0; i < linesToRemove; i++) {
        content = content.replace(/\n\s*\}\s*$/, '');
      }
    }
    
    return content;
  }

  getErrorCount(filePath) {
    try {
      execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
      return 0;
    } catch (error) {
      const output = error.stdout || '';
      return (output.match(/error TS/g) || []).length;
    }
  }

  async run() {
    console.log('🚀 Batch Component Fixer');
    console.log('=======================\n');

    const files = this.getFilesToFix();
    console.log(`Found ${files.length} files to fix\n`);

    // Process files in order of error count (highest first)
    for (const { count, file } of files.slice(0, 10)) {
      if (count > 5) { // Only fix files with more than 5 errors
        this.fixFile(file);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Files processed: ${files.slice(0, 10).length}`);
    console.log(`   Files fixed: ${this.fixedFiles}`);
    console.log(`   Total errors fixed: ${this.totalErrorsFixed}`);
    
    // Show remaining high-error files
    console.log('\n⚠️  High-error files remaining:');
    for (const { count, file } of files.slice(0, 5)) {
      const currentErrors = this.getErrorCount(file);
      if (currentErrors > 10) {
        console.log(`   ${path.basename(file)}: ${currentErrors} errors`);
      }
    }
  }
}

// Run the batch fixer
const fixer = new BatchComponentFixer();
fixer.run().catch(console.error);