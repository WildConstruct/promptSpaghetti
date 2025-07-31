#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class EnumAndObjectSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalIssues = 0;
  }

  async fixAllFiles() {
    console.log('🔧 Starting comprehensive enum and object syntax repair...\n');

    // Find all TypeScript files
    const patterns = [
      'packages/core/**/*.ts',
      'packages/core/**/*.tsx',
      'client/src/**/*.ts',
      'client/src/**/*.tsx',
      'server/src/**/*.ts',
    ];

    const allFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/*.d.ts'] });
      allFiles.push(...files);
    }

    console.log(`📁 Found ${allFiles.length} TypeScript files to process\n`);

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
    let fileIssues = 0;

    // Fix enum syntax issues
    content = this.fixEnumSyntax(content, filePath);

    // Fix malformed object literals
    content = this.fixObjectLiterals(content, filePath);

    // Fix orphaned commas and brackets
    content = this.fixOrphanedSyntax(content, filePath);

    // Fix malformed arrow functions
    content = this.fixArrowFunctions(content, filePath);

    // Fix malformed return statements
    content = this.fixReturnStatements(content, filePath);

    // Fix export statements
    content = this.fixExportStatements(content, filePath);

    // Count changes
    const changes = this.countChanges(originalContent, content);
    if (changes > 0) {
      this.fixedFiles++;
      this.totalIssues += changes;
      fs.writeFileSync(filePath, content);
      console.log(`🔧 Fixed ${changes} issues in ${path.relative(process.cwd(), filePath)}`);
    }
  }

  fixEnumSyntax(content, filePath) {
    // Fix enum member syntax - missing commas between members
    content = content.replace(/export enum (\w+) \{[\s\S]*?\}/g, match => {
      return match
        .replace(/(\w+\s*=\s*'[^']*')\s*(\w+\s*=)/g, '$1,\n  $2')
        .replace(/(\w+\s*=\s*'[^']*')\s*\}/g, '$1\n}');
    });

    // Fix specific enum patterns that are malformed
    content = content.replace(
      /export enum AccessibilityNeed \{[\s\S]*?\}/g,
      `export enum AccessibilityNeed {
  VISUAL_IMPAIRMENT = 'visual_impairment',
  HEARING_IMPAIRMENT = 'hearing_impairment',
  MOTOR_IMPAIRMENT = 'motor_impairment',
  COGNITIVE_IMPAIRMENT = 'cognitive_impairment',
  SPEECH_IMPAIRMENT = 'speech_impairment',
  TEMPORARY_DISABILITY = 'temporary_disability',
  MULTIPLE_DISABILITIES = 'multiple_disabilities'
}`
    );

    content = content.replace(
      /export enum SeverityLevel \{[\s\S]*?\}/g,
      `export enum SeverityLevel {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  COMPLETE = 'complete'
}`
    );

    content = content.replace(
      /export enum AssistiveTechnology \{[\s\S]*?\}/g,
      `export enum AssistiveTechnology {
  SCREEN_READER = 'screen_reader',
  MAGNIFIER = 'magnifier',
  VOICE_CONTROL = 'voice_control',
  EYE_TRACKER = 'eye_tracker',
  SWITCH_ACCESS = 'switch_access',
  KEYBOARD_ONLY = 'keyboard_only',
  TOUCH_ASSISTANCE = 'touch_assistance',
  COGNITIVE_ASSISTANT = 'cognitive_assistant'
}`
    );

    return content;
  }

  fixObjectLiterals(content, filePath) {
    // Fix malformed object property syntax
    content = content.replace(/\{\s*,/g, '{');
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,\s*\}/g, '\n}');

    // Fix malformed object brackets
    content = content.replace(/\{\)\s*/g, '{\n  ');
    content = content.replace(/\(\{/g, '({');

    // Fix state initialization patterns
    content = content.replace(
      /const \[([^,]+), ([^\]]+)\] = useState\(\{\)\s*([^}]*)\s*\}\);/g,
      'const [$1, $2] = useState({\n    $3\n  });'
    );

    return content;
  }

  fixOrphanedSyntax(content, filePath) {
    // Fix orphaned brackets and commas
    content = content.replace(/^\s*\}\s*[),]\s*$/gm, '  }');
    content = content.replace(/^\s*[),]\s*$/gm, '');

    // Fix trailing commas in wrong places
    content = content.replace(/,\s*;/g, ';');

    return content;
  }

  fixArrowFunctions(content, filePath) {
    // Fix malformed arrow function syntax
    content = content.replace(/=>\s*\(\)\s*;/g, '=> ();');
    content = content.replace(/=>\s*\(\{/g, '=> ({');
    content = content.replace(/\(\)\s*;/g, '();');

    // Fix callback patterns
    content = content.replace(/useCallback\(\(\)\s*=>\s*\{,/g, 'useCallback(() => {');

    return content;
  }

  fixReturnStatements(content, filePath) {
    // Fix return statement patterns
    content = content.replace(/return\s*\(\)\s*;/g, 'return ();');
    content = content.replace(/return\s*\(\{/g, 'return ({');

    return content;
  }

  fixExportStatements(content, filePath) {
    // Fix malformed export statements
    content = content.replace(/^export\s*$/gm, '');
    content = content.replace(/export\s+export\s+/g, 'export ');

    return content;
  }

  countChanges(original, modified) {
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
  const fixer = new EnumAndObjectSyntaxFixer();
  fixer.fixAllFiles().catch(console.error);
}

module.exports = EnumAndObjectSyntaxFixer;
