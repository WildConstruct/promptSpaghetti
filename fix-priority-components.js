#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Priority files to fix
const priorityFiles = [
  'client/src/components/BrowserSafeGraphEditor.tsx',
  'client/src/components/EnhancedGraphEditor.refactored.tsx',
  'client/src/components/EpicDashboard.tsx',
  'client/src/components/GraphTemplates/NodeFactory.tsx',
  'client/src/components/GraphTemplates/TemplateSelector.tsx',
  'client/src/components/NodePalette.tsx'
];

function fixFile(filePath) {
  console.log(`\n🔧 Fixing ${path.basename(filePath)}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  
  // Get current errors
  const beforeErrors = getFileErrorCount(filePath);
  console.log(`  📊 Current errors: ${beforeErrors}`);
  
  // Apply targeted fixes based on common patterns
  
  // Fix 1: Common syntax issues
  fixed = fixed.replace(/,\s*\n\s*interface\s+/g, '\n\ninterface ');
  fixed = fixed.replace(/,\s*\n\s*export\s+/g, '\n\nexport ');
  fixed = fixed.replace(/,\s*\n\s*const\s+/g, ';\n\nconst ');
  fixed = fixed.replace(/,\s*\n\s*function\s+/g, ';\n\nfunction ');
  
  // Fix 2: Interface/type issues
  fixed = fixed.replace(/interface\s+(\w+)\s*,/g, 'interface $1');
  fixed = fixed.replace(/type\s+(\w+)\s*=\s*{([^}]+)},/g, 'type $1 = {$2};');
  
  // Fix 3: Export syntax
  fixed = fixed.replace(/export\s*{\s*,/g, 'export {');
  fixed = fixed.replace(/,\s*}\s*from/g, ' } from');
  
  // Fix 4: JSX issues
  fixed = fixed.replace(/<\/(\w+)>\s*,\s*\n\s*</g, '</$1>\n    <');
  fixed = fixed.replace(/>\s*,\s*{/g, '>\n    {');
  
  // Fix 5: Missing semicolons
  const lines = fixed.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Add semicolons after const/let/var declarations
    if ((trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) &&
        !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith(',')) {
      if (!lines[i + 1] || !lines[i + 1].trim().startsWith('.')) {
        lines[i] = line + ';';
      }
    }
    
    // Add semicolons after return statements
    if (trimmed.startsWith('return ') && !trimmed.endsWith(';') && 
        !trimmed.endsWith('{') && !trimmed.includes('(')) {
      lines[i] = line + ';';
    }
  }
  fixed = lines.join('\n');
  
  // Write the fixed content
  fs.writeFileSync(filePath, fixed);
  
  // Check new error count
  const afterErrors = getFileErrorCount(filePath);
  console.log(`  ✅ Errors reduced to: ${afterErrors} (${beforeErrors - afterErrors} fixed)`);
}

function getFileErrorCount(filePath) {
  try {
    execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
    return 0;
  } catch (error) {
    const output = error.stdout || '';
    return (output.match(/error TS/g) || []).length;
  }
}

// Fix all priority files
console.log('🚀 Fixing Priority Component Files');
console.log('==================================');

let totalBefore = 0;
let totalAfter = 0;

priorityFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const before = getFileErrorCount(fullPath);
  totalBefore += before;
  
  fixFile(fullPath);
  
  const after = getFileErrorCount(fullPath);
  totalAfter += after;
});

console.log('\n📊 Summary:');
console.log(`   Total errors before: ${totalBefore}`);
console.log(`   Total errors after: ${totalAfter}`);
console.log(`   Errors fixed: ${totalBefore - totalAfter}`);