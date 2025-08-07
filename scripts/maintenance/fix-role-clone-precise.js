#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Precise RoleCloneManager.tsx Fixer');
console.log('====================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('📋 Analyzing specific syntax issues...\n');

// Fix 1: Close interface declarations properly
console.log('1️⃣ Fixing interface declarations...');

// Fix Role interface (missing closing brace at line 30)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '}' && i > 0 && lines[i-1].includes('templateVersion?: string;')) {
    lines[i] = '  };\n}';
  }
}

// Fix Permission interface (missing closing brace)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('category: string;') && !lines[i+1].trim().startsWith('}')) {
    lines.splice(i + 1, 0, '}');
  }
}

// Fix CloneOperation interface
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('interface CloneOperation {')) {
    // Look for where it should end
    let j = i + 1;
    while (j < lines.length && !lines[j].includes('interface')) {
      if (lines[j].includes('error?: string;')) {
        lines.splice(j + 1, 0, '}');
        break;
      }
      j++;
    }
  }
}

// Fix 2: Fix RoleCloneManagerProps interface
console.log('2️⃣ Fixing RoleCloneManagerProps...');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('interface RoleCloneManagerProps {')) {
    // Look for the end of this interface
    let j = i + 1;
    while (j < lines.length && !lines[j].includes('className?: string;')) {
      j++;
    }
    if (j < lines.length) {
      lines.splice(j + 1, 0, '}');
    }
  }
}

// Fix 3: Fix RoleCloneState interface
console.log('3️⃣ Fixing RoleCloneState interface...');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('interface RoleCloneState {')) {
    // This interface needs to include all the state properties
    let j = i + 1;
    let foundEnd = false;
    while (j < lines.length && !foundEnd) {
      if (lines[j].includes('validationErrors:')) {
        lines[j] = '  validationErrors: string[];';
        lines.splice(j + 1, 0, '}');
        foundEnd = true;
      }
      j++;
    }
  }
}

// Fix 4: Fix mock data array syntax
console.log('4️⃣ Fixing mock data arrays...');

// Fix the broken Role objects in mockRoles
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{') && lines[i].includes('id:') && !lines[i].includes('id: string')) {
    // This is likely a role object that needs proper formatting
    if (i > 0 && lines[i-1].includes('},')) {
      lines[i-1] = '  },';
    }
  }
}

// Fix 5: Fix function parameter syntax
console.log('5️⃣ Fixing function parameters...');

for (let i = 0; i < lines.length; i++) {
  // Fix the onRoleCloned and onClose syntax
  if (lines[i].includes('onRoleCloned ?')) {
    lines[i] = '  onRoleCloned?: (clonedRole: Role) => void;';
  }
  if (lines[i].includes('onClose ?')) {
    lines[i] = '  onClose?: () => void;';
  }
}

// Fix 6: Fix broken syntax patterns
console.log('6️⃣ Fixing broken syntax patterns...');

// Fix the setState calls with wrong syntax
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('role => ;);')) {
    lines[i] = lines[i].replace('role => ;);', 'role =>');
    if (i + 1 < lines.length) {
      lines[i + 1] = '      ' + lines[i + 1].trim();
    }
  }
  
  // Fix broken arrow functions
  if (lines[i].includes('() => {}')) {
    lines[i] = lines[i].replace('() => {}', '() => {}');
  }
  
  // Fix style object syntax
  if (lines[i].includes('style={{ padding:') && lines[i].includes('}}>}')) {
    lines[i] = lines[i].replace('}}>}', '}}}>');
  }
}

// Fix 7: Fix JSX syntax errors
console.log('7️⃣ Fixing JSX syntax...');

for (let i = 0; i < lines.length; i++) {
  // Fix onClick handlers
  if (lines[i].includes('onClick={() => ')) {
    lines[i] = lines[i].replace(/onClick=\{() => \{\}\} => /g, 'onClick={() => ');
  }
  
  // Fix style object closing
  if (lines[i].includes('border: `1px solid')) {
    if (lines[i].includes('`}') && !lines[i].includes('}}')) {
      lines[i] = lines[i].replace('`}', '`');
    }
  }
}

// Fix 8: Fix array and object syntax
console.log('8️⃣ Fixing array/object syntax...');

// Fix the errors array declaration
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const errors: string = [];')) {
    lines[i] = '    const errors: string[] = [];';
  }
}

// Fix the clonedRole object
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const clonedRole: Role = {')) {
    lines[i] = '      const clonedRole: Role = {';
    // Fix the closing of this object
    let j = i + 1;
    while (j < lines.length && !lines[j].includes('};')) {
      if (lines[j].includes('id: `role_${Date.now()}`}')) {
        lines[j] = '        id: `role_${Date.now()}`,';
      }
      j++;
    }
  }
}

// Fix 9: Clean up semicolons and commas
console.log('9️⃣ Cleaning up punctuation...');

for (let i = 0; i < lines.length; i++) {
  // Remove trailing semicolons after closing braces in wrong places
  lines[i] = lines[i].replace(/}\s*;\s*$/, '}');
  
  // Fix comma-semicolon combinations
  lines[i] = lines[i].replace(/,\s*;/g, ';');
  
  // Fix missing closing braces
  if (lines[i].includes('margin: \'0 auto\'') && lines[i].includes(';')) {
    lines[i] = lines[i].replace(';', '');
  }
}

// Join the lines back
content = lines.join('\n');

// Write the fixed content
fs.writeFileSync(filePath, content);

// Check error count
console.log('\n📊 Checking results...');
try {
  execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
  console.log('✅ No TypeScript errors!');
} catch (error) {
  const errorOutput = error.stdout || '';
  const errorCount = (errorOutput.match(/error TS/g) || []).length;
  console.log(`⚠️  ${errorCount} errors remaining`);
  
  // Show specific error locations
  const errorMatches = errorOutput.matchAll(/\((\d+),(\d+)\): error (TS\d+): (.+)/g);
  const errors = Array.from(errorMatches).slice(0, 10);
  
  if (errors.length > 0) {
    console.log('\nTop 10 errors with details:');
    errors.forEach((match, idx) => {
      const [, line, col, code, msg] = match;
      console.log(`${idx + 1}. Line ${line}, Col ${col}: ${code} - ${msg}`);
    });
  }
}