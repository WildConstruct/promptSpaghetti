#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Files that need formatting
const FILES_TO_FORMAT = [
  'packages/core/PreviewModal.tsx',
  'packages/core/GraphEditor.tsx',
  'packages/core/serverProjectManager.ts'
];

console.log('🎨 TypeScript Formatter');
console.log('======================\n');

// Create a tsfmt.json config for proper JSX handling
const tsfmtConfig = {
  "baseIndentSize": 0,
  "indentSize": 2,
  "tabSize": 2,
  "indentStyle": 2, // 2 = space
  "newLineCharacter": "\n",
  "convertTabsToSpaces": true,
  "insertSpaceAfterCommaDelimiter": true,
  "insertSpaceAfterSemicolonInForStatements": true,
  "insertSpaceBeforeAndAfterBinaryOperators": true,
  "insertSpaceAfterKeywordsInControlFlowStatements": true,
  "insertSpaceAfterFunctionKeywordForAnonymousFunctions": false,
  "insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": false,
  "insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": false,
  "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": true,
  "insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces": false,
  "insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces": false,
  "insertSpaceBeforeFunctionParenthesis": false,
  "placeOpenBraceOnNewLineForFunctions": false,
  "placeOpenBraceOnNewLineForControlBlocks": false
};

// Write config file
const configPath = path.join(__dirname, '..', 'tsfmt.json');
fs.writeFileSync(configPath, JSON.stringify(tsfmtConfig, null, 2));
console.log('📝 Created tsfmt.json configuration\n');

// Format each file
for (const file of FILES_TO_FORMAT) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - file not found`);
    continue;
  }
  
  console.log(`🔧 Formatting ${file}...`);
  
  try {
    // Create backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    
    // Run typescript-formatter
    execSync(`npx tsfmt -r ${filePath}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    
    console.log(`✅ Successfully formatted ${file}`);
    
    // Check if file changed
    const original = fs.readFileSync(backupPath, 'utf8');
    const formatted = fs.readFileSync(filePath, 'utf8');
    
    if (original === formatted) {
      console.log(`   No changes needed`);
      fs.unlinkSync(backupPath);
    } else {
      console.log(`   Changes applied (backup saved as ${path.basename(backupPath)})`);
    }
    
  } catch (error) {
    console.error(`❌ Error formatting ${file}: ${error.message}`);
  }
  
  console.log('');
}

// Test build
console.log('🏗️  Testing build...');
try {
  execSync('pnpm --filter client build', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build failed. Checking specific errors...\n');
  
  // Try to get more detailed error info
  try {
    const output = execSync('pnpm --filter client build 2>&1', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
  } catch (buildError) {
    const errorOutput = buildError.stdout || buildError.stderr || buildError.toString();
    const errorLines = errorOutput.split('\n');
    
    // Extract relevant error messages
    const relevantErrors = errorLines.filter(line => 
      line.includes('ERROR:') || 
      line.includes('error:') || 
      line.includes('file:') ||
      line.includes('|')
    ).slice(0, 20); // First 20 relevant lines
    
    if (relevantErrors.length > 0) {
      console.log('📋 Build errors:');
      relevantErrors.forEach(line => console.log(`   ${line}`));
    }
  }
}

// Cleanup
if (fs.existsSync(configPath)) {
  fs.unlinkSync(configPath);
  console.log('\n🧹 Cleaned up temporary config');
}

console.log('\n✨ Formatting complete!');