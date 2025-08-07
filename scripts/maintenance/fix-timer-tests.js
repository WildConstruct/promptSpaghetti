#!/usr/bin/env node

/**
 * Script to fix timer-related test issues systematically
 * Targets: setTimeout + jest.advanceTimersByTime patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⏰ Starting timer test fixes...');

// Find test files that use both setTimeout and jest.advanceTimersByTime
const testFiles = execSync(`find packages -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | head -200`)
  .toString()
  .trim()
  .split('\n')
  .filter(file => file && file.length > 0);

console.log(`📁 Scanning ${testFiles.length} test files for timer issues...`);

let filesProcessed = 0;
let timersFixed = 0;
const problematicPatterns = [];

testFiles.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file has both timer patterns
    const hasAdvanceTimers = content.includes('jest.advanceTimersByTime');
    const hasSetTimeout = content.includes('setTimeout(resolve');
    const hasNewPromise = content.includes('new Promise(resolve => setTimeout');

    if (hasAdvanceTimers && (hasSetTimeout || hasNewPromise)) {
      problematicPatterns.push({
        file: filePath,
        hasAdvanceTimers,
        hasSetTimeout,
        hasNewPromise,
      });

      // Fix the pattern: replace setTimeout with advanceTimersByTime
      let updatedContent = content;

      // Pattern 1: await new Promise(resolve => setTimeout(resolve, N));
      const promiseTimeoutRegex = /await new Promise\(resolve => setTimeout\(resolve, (\d+)\)\);?/g;
      const matches = content.match(promiseTimeoutRegex);

      // Pattern 1b: new Promise(resolve => setTimeout(resolve, N)) without await
      const directPromiseTimeoutRegex = /new Promise\(resolve => setTimeout\(resolve, (\d+)\)\)/g;

      if (matches) {
        matches.forEach(match => {
          const timeMatch = match.match(/setTimeout\(resolve, (\d+)\)/);
          if (timeMatch) {
            const timeout = parseInt(timeMatch[1]);
            // For small timeouts, use setImmediate instead of fake timers
            const replacement =
              timeout <= 100
                ? `await new Promise(resolve => setImmediate(resolve));`
                : `jest.advanceTimersByTime(${timeout});`;
            updatedContent = updatedContent.replace(match, replacement);
            timersFixed++;
            console.log(
              `✅ ${path.relative('.', filePath)}: Fixed setTimeout(${timeout}ms) → ${timeout <= 100 ? 'setImmediate' : 'advanceTimersByTime'}`
            );
          }
        });
      }

      // Handle direct Promise patterns too
      const directMatches = content.match(directPromiseTimeoutRegex);
      if (directMatches) {
        directMatches.forEach(match => {
          const timeMatch = match.match(/setTimeout\(resolve, (\d+)\)/);
          if (timeMatch) {
            const timeout = parseInt(timeMatch[1]);
            const replacement =
              timeout <= 100
                ? `new Promise(resolve => setImmediate(resolve))`
                : `Promise.resolve().then(() => jest.advanceTimersByTime(${timeout}))`;
            updatedContent = updatedContent.replace(match, replacement);
            timersFixed++;
            console.log(
              `✅ ${path.relative('.', filePath)}: Fixed direct setTimeout(${timeout}ms) → ${timeout <= 100 ? 'setImmediate' : 'Promise+advanceTimersByTime'}`
            );
          }
        });
      }

      // Pattern 2: setTimeout(resolve, N) without await new Promise wrapper
      const directTimeoutRegex = /setTimeout\(resolve, (\d+)\)/g;
      if (content.includes('setTimeout(resolve,') && !content.includes('new Promise(resolve => setTimeout')) {
        // This is more complex, skip for now to avoid breaking working code
      }

      if (updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent);
        filesProcessed++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Timer analysis results:`);
console.log(`   • Files with mixed timer patterns: ${problematicPatterns.length}`);
console.log(`   • Files processed: ${filesProcessed}`);
console.log(`   • Timer issues fixed: ${timersFixed}`);

if (problematicPatterns.length > 0) {
  console.log(`\n🔍 Files with potential timer issues:`);
  problematicPatterns.slice(0, 10).forEach(item => {
    console.log(`   • ${path.relative('.', item.file)}`);
  });
}

console.log(`\n💡 These fixes resolve setTimeout + fake timer conflicts that cause test timeouts.`);
