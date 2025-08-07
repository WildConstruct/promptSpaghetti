#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fix RoleCloneManager.tsx specifically
function fixRoleCloneManager() {
  const filePath = 'client/src/components/admin/RoleCloneManager.tsx';
  console.log('🔧 Fixing RoleCloneManager.tsx with targeted fixes...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Interface syntax - missing colons after optional properties
  content = content.replace(/(\w+)\s*\?\s+(\w+)/g, '$1?: $2');
  
  // Fix 2: Fix closing braces that should be closing brackets
  content = content.replace(/\[\s*\n([^}]+)\n\s*\};/g, '[\n$1\n];');
  
  // Fix 3: Fix object syntax inside arrays
  content = content.replace(/=\s*\[\s*{\s*\n/g, '= [\n  {\n');
  
  // Fix 4: Fix incorrect semicolons in wrong places
  content = content.replace(/\);\s*}/g, ')\n  }');
  content = content.replace(/};\s*}/g, '}\n}');
  
  // Fix 5: Fix type declarations
  content = content.replace(/:\s*Role\s+=/g, ': Role[] =');
  content = content.replace(/:\s*Permission\s+=/g, ': Permission[] =');
  content = content.replace(/:\s*CloneOperation\s*}/g, ': CloneOperation[]');
  content = content.replace(/:\s*string\s*}/g, ': string[]');
  
  // Fix 6: Fix setState syntax
  content = content.replace(/setState\(prev => \(\{ \)/g, 'setState(prev => ({');
  
  // Fix 7: Fix JSX syntax
  content = content.replace(/onClick=\{() => \{\}\} => /g, 'onClick={() => ');
  content = content.replace(/\)\s*:\s*\(\),/g, ') : (');
  
  // Fix 8: Fix array/object nesting
  const lines = content.split('\n');
  let fixedLines = [];
  let i = 0;
  
  while (i < lines.length) {
    let line = lines[i];
    
    // Fix lines that have colons in wrong places
    if (line.includes('case') && line.includes(' :')) {
      line = line.replace(/\s+:/g, ':');
    }
    
    // Fix lines with wrong JSX syntax
    if (line.includes('() => {}')) {
      line = line.replace(/\(\) => \{\}/g, '() => {}');
    }
    
    fixedLines.push(line);
    i++;
  }
  
  content = fixedLines.join('\n');
  
  fs.writeFileSync(filePath, content);
  
  // Check error count
  try {
    execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
    console.log('✅ No TypeScript errors!');
  } catch (error) {
    const errorCount = (error.stdout.match(/error TS/g) || []).length;
    console.log(`📊 Errors remaining: ${errorCount}`);
  }
}

// Fix other problematic files
function fixBrowserSafeGraphEditor() {
  const filePath = 'client/src/components/BrowserSafeGraphEditor.tsx';
  console.log('\n🔧 Fixing BrowserSafeGraphEditor.tsx...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Common fixes for this file
  content = content.replace(/,\s*\n\s*interface/g, ';\n\ninterface');
  content = content.replace(/,\s*\n\s*export/g, ';\n\nexport');
  content = content.replace(/,\s*\n\s*const/g, ';\n\nconst');
  
  fs.writeFileSync(filePath, content);
  
  try {
    execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
    console.log('✅ No TypeScript errors!');
  } catch (error) {
    const errorCount = (error.stdout.match(/error TS/g) || []).length;
    console.log(`📊 Errors remaining: ${errorCount}`);
  }
}

function fixEpicDashboard() {
  const filePath = 'client/src/components/EpicDashboard.tsx';
  console.log('\n🔧 Fixing EpicDashboard.tsx...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix missing closing braces
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  
  if (openBraces > closeBraces) {
    // Add missing closing braces at the end
    const missing = openBraces - closeBraces;
    for (let i = 0; i < missing; i++) {
      content += '\n}';
    }
  }
  
  fs.writeFileSync(filePath, content);
  
  try {
    execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
    console.log('✅ No TypeScript errors!');
  } catch (error) {
    const errorCount = (error.stdout.match(/error TS/g) || []).length;
    console.log(`📊 Errors remaining: ${errorCount}`);
  }
}

// Run all fixes
console.log('🚀 Targeted TypeScript Syntax Fixer');
console.log('==================================\n');

fixRoleCloneManager();
fixBrowserSafeGraphEditor();
fixEpicDashboard();

console.log('\n✅ Fixing complete!');