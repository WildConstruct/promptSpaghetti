#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix specific file issues
const fixes = [
  {
    file: 'packages/core/types/DataClassification.ts',
    fix: (content) => {
      // Remove all the extra closing braces after interface definitions
      return content.replace(/^}$/gm, (match, offset) => {
        // Look at the next non-empty line
        const nextLineMatch = content.slice(offset).match(/\n\s*(\w)/);
        if (nextLineMatch && /^(export|interface|type|class|const|let|var)/.test(content.slice(offset + nextLineMatch.index))) {
          return ''; // Remove this closing brace
        }
        return match;
      });
    }
  },
  {
    file: 'packages/core/projectManager.ts',
    fix: (content) => {
      // Fix the indentation issue at line 306
      return content.replace(
        /  static async loadProjectFromDevice\(\): Promise<LoadProjectResult> \{$/m,
        '  static async loadProjectFromDevice(): Promise<LoadProjectResult> {'
      );
    }
  },
  {
    file: 'packages/core/types/UTDG.ts',
    fix: (content) => {
      // Remove extra closing braces
      return content.replace(/^}$/gm, (match, offset) => {
        const nextLineMatch = content.slice(offset).match(/\n\s*(\w)/);
        if (nextLineMatch && /^(export|interface|type|class|const|let|var)/.test(content.slice(offset + nextLineMatch.index))) {
          return ''; // Remove this closing brace
        }
        return match;
      });
    }
  },
  {
    file: 'packages/core/types/NodeTypes.ts',
    fix: (content) => {
      // Remove extra closing braces
      return content.replace(/^}$/gm, (match, offset) => {
        const nextLineMatch = content.slice(offset).match(/\n\s*(\w)/);
        if (nextLineMatch && /^(export|interface|type|class|const|let|var)/.test(content.slice(offset + nextLineMatch.index))) {
          return ''; // Remove this closing brace
        }
        return match;
      });
    }
  }
];

console.log('🔧 Fixing specific syntax errors...\n');

for (const { file, fix } of fixes) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    continue;
  }
  
  console.log(`📝 Processing ${file}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fix(content);
  
  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`   No changes needed`);
  }
}

console.log('\n✨ Done fixing syntax errors!');