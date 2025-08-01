#!/usr/bin/env node

/**
 * Targeted Linting Fix Script
 * Fixes specific rule violations that are auto-fixable
 */

const { execSync } = require('child_process');

const fixableRules = [
  {
    name: 'Useless Escapes',
    rule: 'no-useless-escape',
    description: 'Remove unnecessary escape characters'
  },
  {
    name: 'Semicolons',
    rule: 'semi',
    description: 'Add missing semicolons'
  },
  {
    name: 'Quotes',
    rule: 'quotes',
    description: 'Standardize quote usage'
  },
  {
    name: 'Comma Dangle',
    rule: 'comma-dangle',
    description: 'Fix trailing commas'

];

const priorityDirs = [
  'packages/core/runtime/',
  'packages/core/components/',
  'server/src/services/',
  'client/src/components/',
  'server/src/database/',
  'packages/core/__tests__/'
];

async function fixRule(rule: any, directory: string): Promise<any> {
  console.log(`🔧 Fixing ${rule.name} in ${directory}`);
  
  try {
    // Get before count
    const beforeResult = execSync(
      `npx eslint "${directory}" --ext .ts,.tsx,.js,.jsx --format=compact`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    const beforeCount = 0; // No errors case
    console.log(`   ✅ No ${rule.name} issues found`);
    return { before: 0, after: 0 };
 catch (beforeError) {
    const beforeOutput = String(beforeError.stdout || beforeError.stderr || '');
    const beforeMatches = beforeOutput.match(new RegExp(rule.rule, 'g')) || [];
    const beforeCount = beforeMatches.length;
    
    if (beforeCount === 0) {
      console.log(`   ✅ No ${rule.name} issues found`);
      return { before: 0, after: 0 };

    
    console.log(`   📊 Found ${beforeCount} ${rule.name} issues`);
    
    try {
      // Apply fixes for this specific rule
      execSync(
        `npx eslint "${directory}" --ext .ts,.tsx,.js,.jsx --fix --rule '{"${rule.rule}": "error"}'`,
        { stdio: 'pipe' }
      );
      console.log(`   ✅ All ${rule.name} issues fixed!`);
      return { before: beforeCount, after: 0 };
 catch (afterError) {
      const afterOutput = String(afterError.stdout || afterError.stderr || '');
      const afterMatches = afterOutput.match(new RegExp(rule.rule, 'g')) || [];
      const afterCount = afterMatches.length;
      
      const fixed = beforeCount - afterCount;
      console.log(`   📈 Fixed ${fixed} ${rule.name} issues (${afterCount} remaining)`);
      return { before: beforeCount, after: afterCount };




async function main(): Promise<void> {
  console.log('🎯 Targeted Linting Fix - Auto-fixable Rules Only');
  console.log('🔧 Focusing on easily fixable formatting issues\n');
  
  const totalResults = {
    totalBefore: 0,
    totalAfter: 0,
    totalFixed: 0
  };
  
  for (const rule of fixableRules) {
    console.log(`\n🚀 ${rule.name}: ${rule.description}`);
    
    let ruleBefore = 0, ruleAfter = 0;
    
    for (const dir of priorityDirs) {
      const result = await fixRule(rule, dir);
      ruleBefore += result.before;
      ruleAfter += result.after;
      
      // Brief pause between directories
      await new Promise(resolve => setTimeout(resolve, 200));

    
    const ruleFixed = ruleBefore - ruleAfter;
    console.log(`   🎉 ${rule.name} Summary: ${ruleFixed} fixed, ${ruleAfter} remaining`);
    
    totalResults.totalBefore += ruleBefore;
    totalResults.totalAfter += ruleAfter;
    totalResults.totalFixed += ruleFixed;

  
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`🎉 Total Fixed: ${totalResults.totalFixed}`);
  console.log(`📈 Total Remaining: ${totalResults.totalAfter}`);
  console.log(`📊 Success Rate: ${((totalResults.totalFixed / totalResults.totalBefore) * 100).toFixed(1)}%`);
  
  console.log('\n🔄 Running final lint check...');
  try {
    execSync('pnpm lint --format=summary', { stdio: 'inherit' });
 catch (error) {
    console.log('📋 Lint check completed with remaining issues (expected)');



if (require.main === module) {
  main().catch(console.error);


module.exports = { fixRule, fixableRules, priorityDirs };