#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Comprehensive Fix');
console.log('=========================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('📋 Applying comprehensive fixes...\n');

// Fix 1: Fix the loadData function structure
console.log('1️⃣ Fixing loadData function...');
let foundLoadData = false;
for (let i = 258; i < 275; i++) {
  if (lines[i] && lines[i].includes('const loadData = async () => {')) {
    // Fix the try-catch structure
    let j = i + 1;
    while (j < lines.length && !lines[j].includes('} catch')) {
      j++;
    }
    // Insert the missing closing brace for try block
    if (j < lines.length && lines[j-1].trim() !== '}') {
      lines.splice(j, 0, '  }');
    }
    break;
  }
}

// Fix 2: Fix the missing closing brace after setState in loadData catch
console.log('2️⃣ Fixing setState in loadData...');
for (let i = 264; i < 272; i++) {
  if (lines[i] && lines[i].includes('}))}')) {
    lines[i] = '      }));';
    lines.splice(i + 1, 0, '    }');
    lines.splice(i + 2, 0, '  };');
    break;
  }
}

// Fix 3: Fix arrow function declarations
console.log('3️⃣ Fixing arrow functions...');
for (let i = 271; i < 297; i++) {
  if (lines[i] && lines[i].includes('const handleSourceRoleSelect = useCallback((role: Role) => {')) {
    // Ensure the function is properly closed
    let braceCount = 1;
    let j = i + 1;
    while (j < lines.length && braceCount > 0) {
      for (const char of lines[j]) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      j++;
    }
    // If not properly closed, add closing
    if (braceCount > 0 && j < lines.length) {
      lines.splice(j, 0, '  };');
    }
    break;
  }
}

// Fix 4: Fix else block structure
console.log('4️⃣ Fixing else blocks...');
for (let i = 285; i < 298; i++) {
  if (lines[i] && lines[i].trim() === 'else {') {
    // Make sure the previous if block is properly closed
    let prevLine = i - 1;
    while (prevLine > 0 && lines[prevLine].trim() === '') {
      prevLine--;
    }
    if (!lines[prevLine].includes('}')) {
      lines.splice(i, 0, '      }');
    }
    // Ensure the else block has proper content
    if (i + 1 < lines.length && !lines[i + 1].includes('newSelected')) {
      lines.splice(i + 1, 0, '        newSelected.delete(permissionId);');
      lines.splice(i + 2, 0, '        newExcluded.add(permissionId);');
      lines.splice(i + 3, 0, '      }');
    }
    break;
  }
}

// Fix 5: Fix the operation object syntax
console.log('5️⃣ Fixing operation object...');
for (let i = 310; i < 315; i++) {
  if (lines[i] && lines[i].includes('status: \'pending\';')) {
    lines[i] = '      status: \'pending\'';
    lines.splice(i + 1, 0, '    };');
    break;
  }
}

// Fix 6: Fix the clonedRole object
console.log('6️⃣ Fixing clonedRole object...');
// First, find where clonedRole starts
for (let i = 323; i < 340; i++) {
  if (lines[i] && lines[i].includes('const clonedRole: Role = {')) {
    // Check if the object is properly structured
    let j = i + 1;
    let braceCount = 1;
    let needsFix = false;
    
    // Look for the line with just "name:" 
    while (j < lines.length && braceCount > 0) {
      if (lines[j].trim() === 'name: state.targetName,') {
        // Check if previous line has proper closing
        if (j > 0 && !lines[j-1].includes(',')) {
          lines[j-1] = lines[j-1] + ',';
        }
      }
      for (const char of lines[j]) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      j++;
    }
    
    // Add closing if needed
    if (braceCount > 0) {
      lines.splice(j, 0, '      };');
    }
    break;
  }
}

// Fix 7: Fix the duplicate cloneCount
console.log('7️⃣ Fixing duplicate cloneCount...');
for (let i = 340; i < 350; i++) {
  if (lines[i] && lines[i].includes('cloneCount: (role.metadata?.cloneCount || 0) + 1,')) {
    // Check if next line is also cloneCount
    if (i + 1 < lines.length && lines[i + 1].includes('cloneCount:')) {
      lines.splice(i + 1, 1); // Remove duplicate
    }
    break;
  }
}

// Fix 8: Fix setState call structure
console.log('8️⃣ Fixing setState calls...');
for (let i = 346; i < 365; i++) {
  if (lines[i] && lines[i].trim() === ');') {
    // This should be part of the map function
    if (i > 0 && !lines[i-1].includes('updatedRoles')) {
      // Add setState call
      lines.splice(i + 1, 0, '      setState(prev => ({');
    }
    break;
  }
}

// Fix 9: Fix catch block structure
console.log('9️⃣ Fixing catch block...');
for (let i = 364; i < 375; i++) {
  if (lines[i] && lines[i].includes('catch (error) {')) {
    // Make sure the catch has proper structure
    let j = i + 1;
    let foundSetState = false;
    while (j < i + 10 && j < lines.length) {
      if (lines[j].includes('setState')) {
        foundSetState = true;
        // Fix the setState structure if broken
        if (lines[j + 3] && lines[j + 3].includes('),')) {
          lines[j + 3] = '      });';
        }
        break;
      }
      j++;
    }
    break;
  }
}

// Fix 10: Fix array syntax in filter
console.log('🔟 Fixing array filter syntax...');
for (let i = 380; i < 385; i++) {
  if (lines[i] && lines[i].includes('selectedPermissions = new Set(),')) {
    lines[i] = '      selectedPermissions = new Set(';
    if (i + 1 < lines.length && lines[i + 1].includes('Array.from(sourcePermissions).filter(id =>)')) {
      lines[i + 1] = '        Array.from(sourcePermissions).filter(id =>';
    }
    break;
  }
}

// Fix 11: Fix JSX conditional rendering
console.log('1️⃣1️⃣ Fixing JSX conditionals...');
content = lines.join('\n');
// Fix broken conditional rendering patterns
content = content.replace(/\{([^}]+)\s+&&\s+\(\),/g, '{$1 && (');
content = content.replace(/\}\),\s*\)/g, ')}');

// Fix 12: Balance the overall structure
console.log('1️⃣2️⃣ Balancing overall structure...');
const finalLines = content.split('\n');

// Count braces in the entire file
let totalBraces = 0;
let inString = false;
let stringChar = null;

for (const line of finalLines) {
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : '';
    
    // Handle strings
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
    }
    
    // Count only if not in string
    if (!inString) {
      if (char === '{') totalBraces++;
      if (char === '}') totalBraces--;
    }
  }
}

// Add missing closing braces at the end if needed
if (totalBraces > 0) {
  console.log(`  Adding ${totalBraces} missing closing braces at end`);
  for (let i = 0; i < totalBraces; i++) {
    finalLines.push('}');
  }
}

// Write the fixed content
content = finalLines.join('\n');
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