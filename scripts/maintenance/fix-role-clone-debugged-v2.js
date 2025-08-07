#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Debugged Fix v2');
console.log('=======================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('📋 Applying debugged fixes...\n');

// Fix 1: Fix interface properties with wrong punctuation
console.log('1️⃣ Fixing interface properties...');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Fix properties that have both semicolon and comma
  if (line.match(/^\s*\w+.*:.*[;,]\s*,\s*$/)) {
    lines[i] = line.replace(/;,/, ';').replace(/,\s*$/, '');
  }
  
  // Fix properties in interfaces that should end with semicolon
  if (i > 0 && i < lines.length - 1) {
    const nextLine = lines[i + 1].trim();
    if (line.match(/^\s*\w+\s*:.*[^;,{}\s]$/) && 
        (nextLine.startsWith('}') || nextLine.match(/^\w+\s*:/))) {
      lines[i] = line + ';';
    }
  }
}

// Fix 2: Fix the broken interface structure
console.log('2️⃣ Fixing interface structure...');
// Remove the stray closing brace before "interface Role"
for (let i = 15; i < 20; i++) {
  if (lines[i].trim() === '}' && lines[i + 1] && lines[i + 1].includes('interface Role')) {
    lines[i] = ''; // Remove the stray brace
    break;
  }
}

// Fix the closing of interfaces
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('};') && lines[i + 1] && lines[i + 1].trim() === '}') {
    lines[i] = lines[i].replace('};', '}');
  }
}

// Fix 3: Fix array declarations in mockData
console.log('3️⃣ Fixing array objects...');
// Fix missing closing braces in array objects
for (let i = 90; i < 120; i++) {
  if (lines[i].includes('metadata: { cloneCount:') && !lines[i].includes('}')) {
    lines[i] = lines[i].replace(/(\d+)\s*}$/, '$1 }');
    if (i + 1 < lines.length && lines[i + 1].trim() === '{') {
      lines[i] = lines[i] + ',';
      lines[i + 1] = '  },';
    }
  }
}

// Fix 4: Fix setState and function calls
console.log('4️⃣ Fixing setState calls...');
// Fix the loadData function structure
for (let i = 220; i < 260; i++) {
  if (lines[i].includes('setState(prev => ({ ...prev, nameExists: false }));')) {
    // Add missing closing brace for useEffect
    if (i + 1 < lines.length && !lines[i + 1].includes('}')) {
      lines.splice(i + 1, 0, '    }');
    }
  }
}

// Fix missing closing braces in if statements
for (let i = 230; i < 245; i++) {
  if (lines[i].includes('errors.push(') && !lines[i].includes(';')) {
    lines[i] = lines[i] + ';';
  }
  if (lines[i].includes('} else if') && i > 0 && !lines[i - 1].includes('}')) {
    lines.splice(i, 0, '    }');
    i++; // Adjust index
  }
}

// Fix 5: Fix function parameter issues
console.log('5️⃣ Fixing function issues...');
// Fix handleCloneRole return statements
for (let i = 286; i < 290; i++) {
  if (lines[i].includes('return (')) {
    lines[i] = lines[i].replace('return (', 'return;');
  }
}

// Fix 6: Fix object property syntax
console.log('6️⃣ Fixing object properties...');
// Fix the setState prev syntax
for (let i = 250; i < 270; i++) {
  if (lines[i].includes('targetName: `${role.name} Copy`}')) {
    lines[i] = lines[i].replace('}', ',');
    // Remove the extra closing braces on next lines
    if (lines[i + 1].trim() === '},') {
      lines[i + 1] = '';
    }
  }
  if (lines[i].includes('targetDescription: `Cloned from') && lines[i].includes('`}')) {
    lines[i] = lines[i].replace('`}', '`,');
    if (lines[i + 1].trim() === '},') {
      lines[i + 1] = '';
    }
  }
}

// Fix 7: Fix else blocks
console.log('7️⃣ Fixing else blocks...');
for (let i = 270; i < 285; i++) {
  if (lines[i].includes('} else {') && i > 0) {
    // Check if there's missing content in else block
    if (i + 1 < lines.length && !lines[i + 1].includes('newSelected')) {
      lines.splice(i + 1, 0, '        newSelected.delete(permissionId);');
      lines.splice(i + 2, 0, '        newExcluded.add(permissionId);');
      lines.splice(i + 3, 0, '      }');
    }
  }
}

// Fix 8: Fix the map function syntax
console.log('8️⃣ Fixing map functions...');
// Fix: prev.cloneOperations.map(op =>),
for (let i = 350; i < 365; i++) {
  if (lines[i].includes('prev.cloneOperations.map(op =>),')) {
    lines[i] = lines[i].replace('op =>),', 'op =>');
  }
}

// Fix the filter syntax
for (let i = 370; i < 380; i++) {
  if (lines[i].includes('Array.from(sourcePermissions).filter(id =>)')) {
    lines[i] = lines[i].replace('id =>)', 'id =>');
  }
}

// Fix 9: Fix style object syntax
console.log('9️⃣ Fixing style objects...');
// Fix missing closing braces in style objects
for (let i = 0; i < lines.length; i++) {
  // Fix style objects ending with }}}
  if (lines[i].match(/}\s*}\s*$/)) {
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    if (!nextLine.includes('>') && !nextLine.includes('/>')) {
      lines[i] = lines[i].replace(/}\s*$/, '}}');
    }
  }
  
  // Fix style properties missing closing brace
  if (lines[i].includes('style={{') && !lines[i].includes('}}')) {
    // Look for the closing on next few lines
    let foundClosing = false;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j].includes('}}')) {
        foundClosing = true;
        break;
      }
    }
    if (!foundClosing) {
      // Find where to add closing
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].trim() === '}') {
          lines[j] = '}}';
          break;
        }
      }
    }
  }
}

// Fix 10: Fix specific syntax errors
console.log('🔟 Fixing specific syntax errors...');
// Fix case statements
for (let i = 369; i < 380; i++) {
  if (lines[i].match(/case\s+'[^']+':,$/)) {
    lines[i] = lines[i].replace(':,', ':');
  }
}

// Fix missing braces in setState
for (let i = 756; i < 766; i++) {
  if (lines[i].includes('onClick={() => setState(prev => ({ )')) {
    lines[i] = lines[i].replace('({ )', '({');
  }
}

// Fix missing closing parenthesis
for (let i = 710; i < 715; i++) {
  if (lines[i].includes('style={{ marginRight: \'8px\' }')) {
    lines[i] = lines[i] + '}';
  }
}

// Write the fixed content
content = lines.join('\n');
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