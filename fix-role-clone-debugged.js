#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Targeted Fix');
console.log('====================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('📋 Applying fixes based on debugger analysis...\n');

// Fix 1: The main structural issues identified
console.log('1️⃣ Fixing interface declarations...');

// Fix the broken interface declarations
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Fix interface Role - missing closing brace
  if (i === 30 && line.trim() === '}') {
    lines[i] = '  };\n}';
  }
  
  // Fix interface Permission - it should start on new line
  if (i === 31 && line.includes('interface Permission {')) {
    lines[i] = '\ninterface Permission {';
  }
  
  // Fix the permissions array type
  if (line.includes('permissions: string;')) {
    lines[i] = line.replace('permissions: string;', 'permissions: string[];');
  }
  
  // Fix metadata optional syntax
  if (line.includes('metadata ?')) {
    lines[i] = line.replace('metadata ?', 'metadata?:');
  }
}

// Fix 2: Fix the component declaration issues
console.log('2️⃣ Fixing component structure...');

// Find and fix the export const line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const [')) {
    // This line has wrong syntax - should not have array destructuring
    lines[i] = 'export const CommunityHub: React.FC = () => {';
    break;
  }
}

// Fix 3: Fix the mock data arrays
console.log('3️⃣ Fixing mock data arrays...');

// Fix missing closing braces in mockRoles
let inMockRoles = false;
let mockRolesStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const mockRoles: Role[] = [')) {
    inMockRoles = true;
    mockRolesStart = i;
  }
  
  if (inMockRoles && lines[i].trim() === '];') {
    // Check if all objects are properly closed
    let openBraces = 0;
    for (let j = mockRolesStart; j < i; j++) {
      openBraces += (lines[j].match(/{/g) || []).length;
      openBraces -= (lines[j].match(/}/g) || []).length;
    }
    
    if (openBraces > 0) {
      // Add missing closing braces before the array closing
      lines.splice(i, 0, '  }');
    }
    inMockRoles = false;
  }
}

// Fix 4: Fix the props destructuring
console.log('4️⃣ Fixing props destructuring...');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const ReviewSystem: React.FC<ReviewSystemProps> = ({),')) {
    lines[i] = 'export const ReviewSystem: React.FC<ReviewSystemProps> = ({';
  }
}

// Fix 5: Fix ternary operators and JSX issues
console.log('5️⃣ Fixing JSX syntax...');

for (let i = 0; i < lines.length; i++) {
  // Fix broken ternary with empty parentheses
  if (lines[i].includes(') : (),')) {
    lines[i] = lines[i].replace(') : (),', ') : (');
  }
  
  // Fix onClick handlers with wrong syntax
  if (lines[i].includes('onClick={() => {}} =>')) {
    lines[i] = lines[i].replace('onClick={() => {}} =>', 'onClick={() =>');
  }
  
  // Fix style object closings
  if (lines[i].includes('}}},')) {
    lines[i] = lines[i].replace('}}},', '}}');
  }
}

// Fix 6: Remove the invalid character (✕)
console.log('6️⃣ Fixing invalid characters...');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '✕') {
    lines[i] = '              ×';  // Replace with valid multiplication sign
  }
}

// Fix 7: Fix array/state syntax issues
console.log('7️⃣ Fixing state and array declarations...');

for (let i = 0; i < lines.length; i++) {
  // Fix incorrect export syntax
  if (lines[i].includes('export const [discussions')) {
    lines[i] = '  const [discussions, setDiscussions] = useState<Discussion[]>([]);';
  }
  
  // Fix array type declarations
  if (lines[i].match(/:\s*(\w+)\s+=/)) {
    lines[i] = lines[i].replace(/:\s*(\w+)\s+=/, ': $1[] =');
  }
}

// Fix 8: Balance braces
console.log('8️⃣ Balancing braces...');

// Count braces
let braceCount = 0;
let inString = false;
let stringChar = null;

for (const line of lines) {
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
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
  }
}

// Add missing closing braces at the end
if (braceCount > 0) {
  console.log(`  Adding ${braceCount} missing closing braces`);
  // Remove any existing extra braces at the end first
  while (lines[lines.length - 1].trim() === '}') {
    lines.pop();
  }
  // Add the correct number
  for (let i = 0; i < braceCount; i++) {
    lines.push('}');
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
  
  // Show first few errors
  const errorLines = error.stdout.split('\n').filter(line => line.includes('error TS'));
  console.log('\nRemaining errors:');
  errorLines.slice(0, 5).forEach(line => {
    console.log(`  ${line.trim()}`);
  });
}