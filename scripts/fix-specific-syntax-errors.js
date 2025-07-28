#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class SpecificSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalIssues = 0;
  }

  async fixAllFiles() {
    console.log('🔧 Starting specific syntax error fixes...\n');

    // Find all TypeScript files with errors
    const patterns = [
      'packages/core/**/*.ts',
      'packages/core/**/*.tsx',
      'client/src/**/*.ts',
      'client/src/**/*.tsx'
    ];

    const allFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/*.d.ts'] });
      allFiles.push(...files);
    }

    console.log(`📁 Processing ${allFiles.length} TypeScript files\n`);

    for (const filePath of allFiles) {
      try {
        await this.fixFile(filePath);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }

    console.log(`\n✅ Repair complete! Fixed ${this.fixedFiles} files with ${this.totalIssues} total issues`);
  }

  async fixFile(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let content = originalContent;
    let changes = 0;

    // Fix missing closing brackets/braces in interfaces
    content = this.fixInterfaceClosings(content);
    
    // Fix malformed object property syntax
    content = this.fixObjectProperties(content);
    
    // Fix array syntax issues
    content = this.fixArraySyntax(content);
    
    // Fix parameter syntax issues
    content = this.fixParameterSyntax(content);
    
    // Fix element access expressions
    content = this.fixElementAccess(content);
    
    // Fix return statement syntax
    content = this.fixReturnStatements(content);
    
    // Fix interface/type syntax
    content = this.fixInterfaceSyntax(content);

    changes = this.countChanges(originalContent, content);
    if (changes > 0) {
      this.fixedFiles++;
      this.totalIssues += changes;
      fs.writeFileSync(filePath, content);
      console.log(`🔧 Fixed ${changes} issues in ${path.relative(process.cwd(), filePath)}`);
    }
  }

  fixInterfaceClosings(content) {
    // Fix missing closing braces in interfaces
    content = content.replace(
      /export interface (\w+) \{[\s\S]*?(?=\nexport|$)/g,
      (match) => {
        if (!match.endsWith('}') && !match.endsWith('}\n')) {
          return match.trim() + '\n}';
        }
        return match;
      }
    );
    
    return content;
  }

  fixObjectProperties(content) {
    // Fix object property syntax with missing commas/braces
    content = content.replace(/\{\s*\n\s*([^}]+)\s*\n\s*\}/g, (match, properties) => {
      if (!properties.includes(':')) return match;
      
      const lines = properties.split('\n').map(line => line.trim()).filter(line => line);
      const fixedLines = lines.map(line => {
        if (line && !line.endsWith(',') && !line.endsWith(';') && line.includes(':')) {
          return line + ',';
        }
        return line;
      });
      
      return `{\n  ${fixedLines.join('\n  ')}\n}`;
    });

    // Fix specific patterns like `}` followed by property definitions
    content = content.replace(/\}\s*([a-zA-Z_$][\w$]*\s*:\s*[^;,}]+)/g, '},\n  $1');
    
    // Fix object literal syntax where commas are missing between properties
    content = content.replace(/([a-zA-Z_$][\w$]*\s*:\s*[^,}\n]+)\s*\n\s*([a-zA-Z_$][\w$]*\s*:)/g, '$1,\n  $2');
    
    return content;
  }

  fixArraySyntax(content) {
    // Fix array syntax with missing brackets or commas
    content = content.replace(/\[\s*,/g, '[');
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,\s*\]/g, ']');
    
    // Fix malformed array declarations like `[,` or `[;`
    content = content.replace(/\[\s*[,;]/g, '[');
    
    return content;
  }

  fixParameterSyntax(content) {
    // Fix function parameter syntax
    content = content.replace(/\(\s*,/g, '(');
    content = content.replace(/,\s*\)/g, ')');
    
    // Fix malformed parameter lists
    content = content.replace(/\(\s*([^)]+)\s*,\s*\)/g, '($1)');
    
    return content;
  }

  fixElementAccess(content) {
    // Fix empty element access expressions like obj[]
    content = content.replace(/(\w+)\[\s*\]/g, '$1');
    
    // Fix malformed element access in assignment
    content = content.replace(/(\w+)\[\s*\]\s*=/g, '$1 =');
    
    return content;
  }

  fixReturnStatements(content) {
    // Fix malformed return statements
    content = content.replace(/return\s*\(\s*\)\s*;/g, 'return;');
    content = content.replace(/return\s*\(\s*\{/g, 'return {');
    content = content.replace(/return\s*\(\s*\[/g, 'return [');
    
    return content;
  }

  fixInterfaceSyntax(content) {
    // Fix malformed interface property declarations
    content = content.replace(/(\w+)\s*:\s*([^;,}\n]+)\s*\n\s*([a-zA-Z_$][\w$]*\s*:)/g, '$1: $2;\n  $3');
    
    // Fix missing semicolons in interface properties
    content = content.replace(/(\w+\s*:\s*[^;,}\n]+)\n\s*([a-zA-Z_$][\w$]*\s*:|[\s]*\})/g, '$1;\n  $2');
    
    return content;
  }

  countChanges(original, modified) {
    if (original === modified) return 0;
    
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    let changes = 0;
    
    for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
      if (originalLines[i] !== modifiedLines[i]) {
        changes++;
      }
    }
    
    return changes;
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new SpecificSyntaxFixer();
  fixer.fixAllFiles().catch(console.error);
}

module.exports = SpecificSyntaxFixer;