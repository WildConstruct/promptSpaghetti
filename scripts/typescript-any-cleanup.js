#!/usr/bin/env node

/**
 * TypeScript Any Type Cleanup Script
 * Automatically fixes common `any` type violations with safer alternatives
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common any type patterns and their safer replacements
const anyTypeReplacements = [
  // Function parameters
  {
    pattern: /(\w+)\s*:\s*any(?=\s*[,\)])/g,
    replacement: '$1: unknown',
    description: 'Function parameters: any → unknown'
  },
  // Object properties
  {
    pattern: /:\s*any(?=\s*[;}])/g,
    replacement: ': unknown',
    description: 'Object properties: any → unknown'
  },
  // Array types
  {
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]',
    description: 'Arrays: any[] → unknown[]'
  },
  // Generic type parameters
  {
    pattern: /<any>/g,
    replacement: '<unknown>',
    description: 'Generics: <any> → <unknown>'
  },
  // Variable declarations
  {
    pattern: /let\s+(\w+)\s*:\s*any/g,
    replacement: 'let $1: unknown',
    description: 'Variables: let x: any → let x: unknown'
  },
  {
    pattern: /const\s+(\w+)\s*:\s*any/g,
    replacement: 'const $1: unknown',
    description: 'Constants: const x: any → const x: unknown'
  },
  // Return types
  {
    pattern: /\)\s*:\s*any(?=\s*[{;])/g,
    replacement: '): unknown',
    description: 'Return types: ): any → ): unknown'

];

// More specific type replacements for common patterns
const specificTypeReplacements = [
  // Event handlers
  {
    pattern: /(\w+)\s*:\s*any(?=.*event|.*Event)/gi,
    replacement: '$1: Event',
    description: 'Event handlers: any → Event'
  },
  // React props
  {
    pattern: /props\s*:\s*any/g,
    replacement: 'props: Record<string, unknown>',
    description: 'React props: any → Record<string, unknown>'
  },
  // Error objects
  {
    pattern: /(error|err|e)\s*:\s*any/g,
    replacement: '$1: Error',
    description: 'Error objects: any → Error'
  },
  // DOM elements
  {
    pattern: /(element|el|node)\s*:\s*any/g,
    replacement: '$1: HTMLElement',
    description: 'DOM elements: any → HTMLElement'
  },
  // Data objects
  {
    pattern: /(data|result|response)\s*:\s*any/g,
    replacement: '$1: Record<string, unknown>',
    description: 'Data objects: any → Record<string, unknown>'

];

// Directories to process
const directories = [
  'packages/core/components/',
  'packages/core/runtime/',
  'client/src/components/',
  'server/src/services/',
  'server/src/database/',
  'packages/core/__tests__/',
  'client/src/__tests__/',
  'server/src/__tests__/'
];

// Files to skip (too complex or critical)
const skipPatterns = [
  /node_modules/,
  /\.d\.ts$/,
  /\.min\./,
  /build/,
  /dist/
];

async function analyzeAnyTypes(directory: string): Promise<any[]> {
  console.log(`\n🔍 Analyzing TypeScript any types in: ${directory}`);
  
  try {
    const result = execSync(
      `npx eslint "${directory}" --ext .ts,.tsx --format=compact`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(`   ✅ No TypeScript any type issues found`);
    return [];
 catch (error) {
    const output = String(error.stdout || error.stderr || '');
    
    // Extract any type violations
    const anyMatches = output.match(/(.*?):\s*line\s*(\d+).*?Unexpected any/g) || [];
    
    const issues = anyMatches.map(match => {
      const parts = match.match(/(.*?):\s*line\s*(\d+)/);
      if (parts) {
        return {
          file: parts[1],
          line: parseInt(parts[2])
        };

      return null;
    }).filter(Boolean);
    
    console.log(`   📊 Found ${issues.length} TypeScript any type issues`);
    return issues;



async function fixAnyTypesInFile(filePath: string, issues: any[]): Promise<boolean> {
  const filename = path.basename(filePath);
  
  // Skip if file doesn't exist
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return 0;

  
  // Skip certain file patterns
  if (skipPatterns.some(pattern => pattern.test(filePath))) {
    console.log(`   ⚠️  Skipping file: ${filename}`);
    return 0;

  
  console.log(`   🔧 Fixing ${issues.length} any types in: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;
  
  // Apply specific type replacements first (more precise)
  for (const replacement of specificTypeReplacements) {
    const matches = content.match(replacement.pattern);
    if (matches) {
      const beforeContent = content;
      content = content.replace(replacement.pattern, replacement.replacement);
      if (content !== beforeContent) {
        const changeCount = matches.length;
        fixCount += changeCount;
        console.log(`     ✓ ${replacement.description} (${changeCount} changes)`);



  
  // Apply general any type replacements
  for (const replacement of anyTypeReplacements) {
    const matches = content.match(replacement.pattern);
    if (matches) {
      const beforeContent = content;
      content = content.replace(replacement.pattern, replacement.replacement);
      if (content !== beforeContent) {
        const changeCount = matches.length;
        fixCount += changeCount;
        console.log(`     ✓ ${replacement.description} (${changeCount} changes)`);



  
  // Special handling for test files - can be more lenient
  if (filename.includes('test') || filename.includes('spec')) {
    // In tests, we can sometimes use more permissive types
    const testReplacements = [
      {
        pattern: /as\s+any/g,
        replacement: 'as unknown',
        description: 'Test assertions: as any → as unknown'
      },
      {
        pattern: /jest\.fn<.*?,\s*any>/g,
        replacement: 'jest.fn<unknown[], unknown>',
        description: 'Jest mocks: any → unknown'

    ];
    
    for (const replacement of testReplacements) {
      const matches = content.match(replacement.pattern);
      if (matches) {
        const beforeContent = content;
        content = content.replace(replacement.pattern, replacement.replacement);
        if (content !== beforeContent) {
          const changeCount = matches.length;
          fixCount += changeCount;
          console.log(`     ✓ ${replacement.description} (${changeCount} changes)`);




  
  // Write back to file if we made changes
  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Fixed ${fixCount} any types in ${filename}`);
 else {
    console.log(`   ℹ️  No fixable any types found in ${filename}`);

  
  return fixCount;


async function processDirectory(directory: string): Promise<void> {
  console.log(`\n🚀 Processing directory: ${directory}`);
  
  const issues = await analyzeAnyTypes(directory);
  
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
    const fixed = await fixAnyTypesInFile(filePath, fileIssues);
    totalFixed += fixed;
    
    // Brief pause between files to avoid overwhelming output
    await new Promise(resolve => setTimeout(resolve, 50));

  
  console.log(`   🎉 Directory summary: ${totalFixed} any types fixed`);
  return totalFixed;


async function main(): Promise<void> {
  console.log('🎯 TypeScript Any Type Cleanup Script');
  console.log('📝 Converting unsafe `any` types to safer alternatives\n');
  
  console.log('🔄 Strategy:');
  console.log('   1. any → unknown (safer fallback)');
  console.log('   2. Context-specific types (Error, Event, HTMLElement)');
  console.log('   3. Record<string, unknown> for objects');
  console.log('   4. Special handling for test files\n');
  
  // Get baseline count
  console.log('📊 Getting baseline any type count...');
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
 catch (error) {
    const output = String(error.stdout || error.stderr || '');
    const anyCount = (output.match(/Unexpected any/g) || []).length;
    console.log(`📈 Found ~${anyCount} any type violations\n`);

  
  let totalFixed = 0;
  
  for (const directory of directories) {
    const fixed = await processDirectory(directory);
    totalFixed += fixed;
    
    // Brief pause between directories
    await new Promise(resolve => setTimeout(resolve, 500));

  
  console.log('\n📊 ANY TYPE CLEANUP SUMMARY:');
  console.log(`🎉 Total any types fixed: ${totalFixed}`);
  
  // Get new count
  console.log('\n🔄 Checking impact...');
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
    console.log('✅ All linting issues resolved!');
 catch (error) {
    const output = String(error.stdout || error.stderr || '');
    const remaining = output.match(/(\d+) problems?/);
    const anyCount = (output.match(/Unexpected any/g) || []).length;
    
    console.log(`📈 Remaining problems: ${remaining ? remaining[1] : 'Unknown'}`);
    console.log(`📈 Remaining any types: ~${anyCount}`);
    
    if (totalFixed > 0) {
      console.log(`🎉 Estimated improvement: ${totalFixed} issues fixed`);


  
  console.log('\n📝 Next steps:');
  console.log('   1. Review changes with: git diff');
  console.log('   2. Run tests to ensure type safety');
  console.log('   3. Run TypeScript compiler: tsc --noEmit');
  console.log('   4. Commit changes if satisfied');
  
  console.log('\n⚠️  Note: Some changes from `any` to `unknown` may require');
  console.log('   additional type narrowing in your code. This is intentional');
  console.log('   and improves type safety!');


if (require.main === module) {
  main().catch(console.error);


module.exports = { analyzeAnyTypes, fixAnyTypesInFile, processDirectory };