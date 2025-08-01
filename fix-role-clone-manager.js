#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';
console.log(`🔧 Fixing ${filePath}...`);

let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove comma after semicolon in interface properties
content = content.replace(/;,/g, ';');

// Fix 2: Add semicolons where there are only commas
content = content.replace(/: string,\n/g, ': string;\n');
content = content.replace(/: number,\n/g, ': number;\n');
content = content.replace(/: boolean,\n/g, ': boolean;\n');
content = content.replace(/: Date,\n/g, ': Date;\n');
content = content.replace(/\| 'own';,/g, '| \'own\';');

// Fix 3: Fix optional property syntax
content = content.replace(/(\w+)\s*\?\s*:\s*/g, '$1?: ');

// Fix 4: Fix metadata object indentation
const lines = content.split('\n');
let inMetadata = false;
let metadataIndent = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed.startsWith('metadata') && trimmed.includes('{')) {
    inMetadata = true;
    metadataIndent = line.indexOf('metadata') + 2;
  }
  
  if (inMetadata && i < lines.length - 1) {
    const nextLine = lines[i + 1];
    const nextTrimmed = nextLine.trim();
    
    if (nextTrimmed && !nextTrimmed.startsWith('}')) {
      const currentIndent = nextLine.search(/\S/);
      if (currentIndent >= 0 && currentIndent < metadataIndent) {
        lines[i + 1] = ' '.repeat(metadataIndent) + nextTrimmed;
      }
    }
    
    if (nextTrimmed === '}' || nextTrimmed === '};') {
      inMetadata = false;
    }
  }
}

content = lines.join('\n');

// Fix 5: Remove extra empty lines between interface properties
content = content.replace(/\n\n+(\s*})/g, '\n$1');
content = content.replace(/\{\n\n+/g, '{\n');

// Fix 6: Ensure proper closing of interfaces
content = content.replace(/}\s*\n\s*};/g, '\n}');

// Write the fixed content
fs.writeFileSync(filePath, content);

console.log('✅ Applied fixes to RoleCloneManager.tsx');