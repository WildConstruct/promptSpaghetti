#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Final Fix v3');
console.log('====================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

console.log('📋 Applying comprehensive final fixes...\n');

// Fix 1: Fix all property declarations
console.log('1️⃣ Fixing all property declarations...');
// Remove semicolons followed by commas
content = content.replace(/;\s*,/g, ';');
// Fix properties ending with comma instead of semicolon
content = content.replace(/,\s*\n(\s*)(}|[a-zA-Z_])/g, ';\n$1$2');

// Fix 2: Fix all style object issues
console.log('2️⃣ Fixing style objects...');
// Fix style objects ending with semicolon instead of closing brace
content = content.replace(/style={{([^}]+);\s*}}/g, 'style={{$1}}');
// Fix style objects with extra closing braces
content = content.replace(/}\s*}}}/g, '}}');
// Fix style objects missing closing brace
content = content.replace(/style={{([^}]+);\s*$/gm, 'style={{$1}}');

// Fix 3: Fix interface closing braces
console.log('3️⃣ Fixing interface structures...');
// Fix RoleCloneState interface
content = content.replace(/cloneOperations: CloneOperation\[\]\.}\s*\n\s*\n\s*\/\/ Clone configuration/g, 
  'cloneOperations: CloneOperation[];\n\n  // Clone configuration');

// Fix 4: Fix array syntax in mock data
console.log('4️⃣ Fixing mock data arrays...');
// Fix missing closing braces in array objects
content = content.replace(/metadata: { cloneCount: (\d+) }\s*{/g, 'metadata: { cloneCount: $1 }\n  },\n  {');
// Fix array closing
content = content.replace(/category: 'Data Management'];/g, 'category: \'Data Management\'\n  }\n];');

// Fix 5: Fix broken function syntax
console.log('5️⃣ Fixing function syntax...');
// Fix return statements
content = content.replace(/return \(/g, 'return;');
// Fix arrow functions
content = content.replace(/role => ;[)\s]*;/g, 'role =>');
content = content.replace(/op => \),/g, 'op =>');
content = content.replace(/\(`${role.name, Copy`/g, '(`${role.name} Copy`');

// Fix 6: Fix setState syntax
console.log('6️⃣ Fixing setState calls...');
// Fix excludedPermissions ending
content = content.replace(/excludedPermissions: new Set\(\);\s*}/g, 'excludedPermissions: new Set()\n    }');
// Fix validationErrors array
content = content.replace(/validationErrors: \[\];\s*}/g, 'validationErrors: []\n  }');

// Fix 7: Fix specific problematic patterns
console.log('7️⃣ Fixing specific patterns...');
// Fix filter syntax
content = content.replace(/\.filter\(id => \)/g, '.filter(id =>');
// Fix case statements
content = content.replace(/case '([^']+)':,/g, 'case \'$1\':');
// Fix ternary conditionals
content = content.replace(/{!state\.selectedSourceRole \? \(\)/g, '{!state.selectedSourceRole ? (');

// Fix 8: Fix object property syntax in permissions
console.log('8️⃣ Fixing permission objects...');
// Fix category property ending with semicolon
content = content.replace(/category: '([^']+)';\s*}/g, 'category: \'$1\'\n  }');

// Fix 9: Fix setState onClick pattern
console.log('9️⃣ Fixing onClick setState...');
// Fix the broken setState in onClick
content = content.replace(/onClick=\{.*setState\(prev => \(\{ \)/g, 'onClick={() => setState(prev => ({');

// Fix 10: Fix missing closing braces
console.log('🔟 Fixing missing closing braces...');
// Fix the else block structure
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  // Fix missing closing for else blocks
  if (lines[i].includes('} else {') && i < lines.length - 1) {
    let hasClosing = false;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j].includes('}')) {
        hasClosing = true;
        break;
      }
    }
    if (!hasClosing) {
      // Add the missing logic and closing
      lines.splice(i + 1, 0, '        newSelected.delete(permissionId);');
      lines.splice(i + 2, 0, '        newExcluded.add(permissionId);');
      lines.splice(i + 3, 0, '      }');
    }
  }
  
  // Fix missing closing for return statements
  if (lines[i].includes('return {') && !lines[i].includes('}')) {
    let braceCount = 1;
    let j = i + 1;
    while (j < lines.length && braceCount > 0) {
      for (const char of lines[j]) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      j++;
    }
    if (braceCount > 0) {
      lines.splice(j, 0, '      }');
    }
  }
}

// Fix specific line issues
for (let i = 0; i < lines.length; i++) {
  // Fix array property ending with semicolon inside interface
  if (lines[i].includes('validationErrors: string[];') && i > 0 && !lines[i - 1].includes('}')) {
    lines[i] = lines[i].replace('string[];', 'string[]');
    lines.splice(i + 1, 0, '}');
  }
  
  // Fix missing closing brace for style objects
  if (lines[i].includes('style={{ marginRight: \'8px\' }') && !lines[i].includes('}}')) {
    lines[i] = lines[i] + '}';
  }
  
  // Fix semicolons at end of style properties
  if (lines[i].match(/^\s*(fontSize|color|padding|margin|border|backgroundColor|cursor|borderRadius).*;\s*$/)) {
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    if (nextLine.includes('}}') || nextLine.includes('}') && !nextLine.includes('{')) {
      lines[i] = lines[i].replace(/;\s*$/, '');
    }
  }
}

// Fix arrow function in map
for (let i = 315; i < 325; i++) {
  if (lines[i] && lines[i].includes('state.availableRoles.map(role =>')) {
    if (lines[i].includes(';);')) {
      lines[i] = lines[i].replace(';);', '');
    }
  }
}

// Fix the cloneOperations map
for (let i = 345; i < 355; i++) {
  if (lines[i] && lines[i].includes('prev.cloneOperations.map(op =>),')) {
    lines[i] = lines[i].replace('op =>),', 'op =>');
  }
}

// Rejoin lines
content = lines.join('\n');

// Final cleanup
console.log('🧹 Final cleanup...');
// Remove double semicolons
content = content.replace(/;;\s*/g, ';');
// Fix return statement parens
content = content.replace(/return;\s*\(/g, 'return;');
// Fix missing commas in objects
content = content.replace(/}\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*:)/g, '},\n  $1');

// Write the fixed content
fs.writeFileSync(filePath, content);

// Check results
console.log('\n📊 Checking results...');
try {
  execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
  console.log('✅ No TypeScript errors!');
} catch (error) {
  const errorCount = (error.stdout.match(/error TS/g) || []).length;
  console.log(`⚠️  ${errorCount} errors remaining`);
  
  // Show error breakdown
  const errorOutput = error.stdout || '';
  const errorTypes = {};
  const matches = errorOutput.matchAll(/error (TS\d+):/g);
  for (const match of matches) {
    errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
  }
  
  console.log('\nError breakdown:');
  Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count} occurrences`);
    });
}