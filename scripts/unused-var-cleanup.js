#!/usr/bin/env node

/**
 * Unused Variable Cleanup Script
 * Systematically fixes unused variable errors by adding _ prefix or removing them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const directories = [
  'packages/core/runtime/',
  'packages/core/components/', 
  'server/src/services/',
  'client/src/components/',
  'server/src/database/',
  'packages/core/__tests__/',
  'server/src/__tests__/',
  'client/src/__tests__/'
];

// Common unused variable patterns
const unusedVarPatterns = [
  // Function parameters
  { 
    pattern: /(\w+)\s*:\s*(\w+)(?:\s*=\s*[^,)]+)?\s*(?=,|\))/g,
    replacement: '_$1: $2',
    description: 'Function parameters'
  },
  // Destructured variables
  {
    pattern: /const\s+{\s*(\w+)(?:\s*,\s*\w+)*\s*}\s*=/g,
    replacement: 'const { _$1 } =',
    description: 'Destructured variables'
  },
  // Import statements (unused imports)
  {
    pattern: /import\s+{\s*(\w+)(?:\s*,\s*\w+)*\s*}\s+from/g,
    replacement: 'import { _$1 } from',
    description: 'Unused imports'

];

// Files to skip (critical files that shouldn't be auto-modified)
const skipFiles = [
  'index.ts',
  'index.tsx', 
  'main.ts',
  'main.tsx',
  'app.ts',
  'app.tsx'
];

async function analyzeUnusedVars(directory: string): Promise<any[]> {
  console.log(`\n🔍 Analyzing unused variables in: ${directory}`);
  
  try {
    const result = execSync(
      `npx eslint "${directory}" --ext .ts,.tsx,.js,.jsx --format=compact`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(`   ✅ No unused variable issues found`);
    return [];
 catch (error) {
    const output = String(error.stdout || error.stderr || '');
    
    // Extract unused variable errors
    const unusedVarMatches = output.match(/(.*?):\s*line\s*(\d+).*?'(\w+)'\s+is\s+(defined but never used|assigned a value but never used)/g) || [];
    
    const issues = unusedVarMatches.map(match => {
      const parts = match.match(/(.*?):\s*line\s*(\d+).*?'(\w+)'\s+is\s+(defined but never used|assigned a value but never used)/);
      if (parts) {
        return {
          file: parts[1],
          line: parseInt(parts[2]),
          variable: parts[3],
          type: parts[4]
        };

      return null;
    }).filter(Boolean);
    
    console.log(`   📊 Found ${issues.length} unused variable issues`);
    return issues;



async function fixUnusedVarsInFile(filePath: string, issues: any[]): Promise<number> {
  const filename = path.basename(filePath);
  
  // Skip critical files
  if (skipFiles.includes(filename)) {
    console.log(`   ⚠️  Skipping critical file: ${filename}`);
    return 0;

  
  // Skip if file doesn't exist
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return 0;

  
  console.log(`   🔧 Fixing ${issues.length} issues in: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;
  
  // Sort issues by line number (descending) to avoid offset issues
  const sortedIssues = issues.sort((a, b) => b.line - a.line);
  
  for (const issue of sortedIssues) {
    const lines = content.split('\n');
    const lineIndex = issue.line - 1;
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const varName = issue.variable;
      
      // Strategy 1: Add underscore prefix to parameters
      if (line.includes(`${varName}:`)) {
        const newLine = line.replace(
          new RegExp(`\\b${varName}(?=\\s*:)`, 'g'),
          `_${varName}`
        );
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          fixCount++;
          console.log(`     ✓ Prefixed parameter: ${varName} -> _${varName}`);


      
      // Strategy 2: Add underscore prefix to destructured variables
      else if (line.includes(`${varName}`) && (line.includes('const {') || line.includes('let {'))) {
        const newLine = line.replace(
          new RegExp(`\\b${varName}\\b`, 'g'),
          `_${varName}`
        );
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          fixCount++;
          console.log(`     ✓ Prefixed destructured var: ${varName} -> _${varName}`);


      
      // Strategy 3: Add underscore prefix to regular variables
      else if (line.includes(`${varName}`) && (line.includes('const ') || line.includes('let ') || line.includes('var '))) {
        const newLine = line.replace(
          new RegExp(`\\b${varName}\\b`, 'g'),
          `_${varName}`
        );
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          fixCount++;
          console.log(`     ✓ Prefixed variable: ${varName} -> _${varName}`);


      
      // Strategy 4: Comment out unused imports (safer than removal)
      else if (line.includes('import') && line.includes(varName)) {
        const newLine = line.replace(
          new RegExp(`\\b${varName}\\b(?=.*from)`, 'g'),
          `// ${varName} // Unused import`
        );
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          fixCount++;
          console.log(`     ✓ Commented unused import: ${varName}`);



    
    content = lines.join('\n');

  
  // Write back to file if we made changes
  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Fixed ${fixCount} unused variables in ${filename}`);

  
  return fixCount;


async function processDirectory(directory: string): Promise<number> {
  console.log(`\n🚀 Processing directory: ${directory}`);
  
  const issues = await analyzeUnusedVars(directory);
  
  if (issues.length === 0) {
    return 0;

  
  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];

    acc[issue.file].push(issue);
    return acc;
  }, {});
  
  let totalFixed = 0;
  
  for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
    const fixed = await fixUnusedVarsInFile(filePath, fileIssues);
    totalFixed += fixed;
    
    // Brief pause between files
    await new Promise(resolve => setTimeout(resolve, 100));

  
  console.log(`   🎉 Directory summary: ${totalFixed} fixes applied`);
  return totalFixed;


async function main(): Promise<void> {
  console.log('🎯 Unused Variable Cleanup Script');
  console.log('🔧 Automatically fixing unused variables by adding _ prefix\n');
  
  // Get baseline count
  console.log('📊 Getting baseline unused variable count...');
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
 catch (error) {
    const output = String(error.stdout || error.stderr || '');
    const unusedVarCount = (output.match(/(defined but never used|assigned a value but never used)/g) || []).length;
    console.log(`📈 Found ~${unusedVarCount} unused variable violations\n`);

  
  let totalFixed = 0;
  
  for (const directory of directories) {
    const fixed = await processDirectory(directory);
    totalFixed += fixed;
    
    // Brief pause between directories
    await new Promise(resolve => setTimeout(resolve, 500));

  
  console.log('\n📊 CLEANUP SUMMARY:');
  console.log(`🎉 Total variables fixed: ${totalFixed}`);
  
  // Get new count
  console.log('\n🔄 Checking impact...');
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
    console.log('✅ All linting issues resolved!');
 catch (error) {
    const output = String(error.stdout || error.stderr || '');
    const remaining = output.match(/(\d+) problems?/);
    const unusedVarCount = (output.match(/(defined but never used|assigned a value but never used)/g) || []).length;
    
    console.log(`📈 Remaining problems: ${remaining ? remaining[1] : 'Unknown'}`);
    console.log(`📈 Remaining unused vars: ~${unusedVarCount}`);
    
    if (totalFixed > 0) {
      console.log(`🎉 Estimated improvement: ${totalFixed} issues fixed`);


  
  console.log('\n📝 Next steps:');
  console.log('   1. Review changes with: git diff');
  console.log('   2. Run tests to ensure nothing broke');
  console.log('   3. Commit changes if satisfied');


if (require.main === module) {
  main().catch(console.error);


module.exports = { analyzeUnusedVars, fixUnusedVarsInFile, processDirectory };