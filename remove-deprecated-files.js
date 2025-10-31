#!/usr/bin/env node
/**
 * Script to remove deprecated files not part of Epic 1 MVP
 * Focuses on keeping only inline editing features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to remove completely
const directoriesToRemove = [
  // Client components not in MVP
  'client/src/components/admin',
  'client/src/components/auth',
  'client/src/components/marketplace',
  'client/src/components/payment',
  'client/src/components/moderation',
  'client/src/components/oauth',
  'client/src/components/policy',
  'client/src/components/revenue',
  'client/src/components/security',
  'client/src/components/transparency',
  'client/src/components/consent',
  'client/src/components/approval',

  // Client pages not in MVP
  'client/src/pages',

  // Core package components not in MVP
  'packages/core/components/Admin',
  'packages/core/components/Analytics',
  'packages/core/components/Community',
  'packages/core/components/Audit',
  'packages/core/components/Contributions',

  // Core package systems not in MVP
  'packages/core/auth',
  'packages/core/admin',
  'packages/core/analytics',
  'packages/core/audit',
  'packages/core/community'
];

// Individual files to remove
const filesToRemove = [
  // Client hooks not in MVP
  'client/src/hooks/useAuth.ts',
  'client/src/hooks/useConsent.ts',
  'client/src/hooks/useConsentAwareToggle.tsx',
  'client/src/hooks/useDataAccess.ts',
  'client/src/hooks/useEpic17Authorization.ts',
  'client/src/hooks/useJustInTimeConsent.ts',
  'client/src/hooks/useLoginAnalytics.ts',
  'client/src/hooks/useMarketplace.ts',
  'client/src/hooks/usePasswordReset.ts',
  'client/src/hooks/usePaymentAnalytics.ts',
  'client/src/hooks/useRegistration.ts',
  'client/src/hooks/useRevenueAnalytics.ts',
  'client/src/hooks/useRouteGuard.ts',

  // Client stores not in MVP
  'client/src/stores/authStore.ts',
  'client/src/stores/__tests__/authStore.test.ts',

  // Client types not in MVP
  'client/src/types/MFATypes.ts',
  'client/src/types/consent.ts',
  'client/src/types/revenue.ts',
  'client/src/types/security.ts'
];

let removedCount = 0;
let errorCount = 0;

console.log('🧹 Starting Epic 1 MVP cleanup...\n');

// Remove directories
console.log('📁 Removing deprecated directories...');
directoriesToRemove.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  try {
    if (fs.existsSync(fullPath)) {
      // Count files before removal
      const fileCount = countFiles(fullPath);

      // Use git rm to properly remove from git
      try {
        execSync(`git rm -r "${fullPath}"`, { stdio: 'ignore' });
        console.log(`✅ Removed ${dir} (${fileCount} files)`);
        removedCount += fileCount;
      } catch (gitError) {
        const reason = gitError instanceof Error ? gitError.message : String(gitError);
        console.warn(`⚠️  git rm failed for ${dir}: ${reason}`);
        // Fallback to regular removal if not in git
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(
          `✅ Removed ${dir} (${fileCount} files) - not tracked in git`
        );
        removedCount += fileCount;
      }
    } else {
      console.log(`⏭️  Skipped ${dir} (not found)`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${dir}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n📄 Removing deprecated files...');
// Remove individual files
filesToRemove.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    if (fs.existsSync(fullPath)) {
      // Use git rm to properly remove from git
      try {
        execSync(`git rm "${fullPath}"`, { stdio: 'ignore' });
        console.log(`✅ Removed ${file}`);
        removedCount++;
      } catch (gitError) {
        const reason = gitError instanceof Error ? gitError.message : String(gitError);
        console.warn(`⚠️  git rm failed for ${file}: ${reason}`);
        // Fallback to regular removal if not in git
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed ${file} - not tracked in git`);
        removedCount++;
      }
    } else {
      console.log(`⏭️  Skipped ${file} (not found)`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${file}: ${error.message}`);
    errorCount++;
  }
});

// Clean up empty directories
console.log('\n🧹 Cleaning up empty directories...');
cleanEmptyDirs('client/src/components');
cleanEmptyDirs('client/src/hooks');
cleanEmptyDirs('client/src/stores');
cleanEmptyDirs('client/src/types');
cleanEmptyDirs('packages/core/components');
cleanEmptyDirs('packages/core');

console.log('\n📊 Cleanup Summary:');
console.log(`✅ Removed ${removedCount} files/directories`);
if (errorCount > 0) {
  console.log(`❌ Encountered ${errorCount} errors`);
}

console.log('\n💡 Next steps:');
console.log('1. Review the changes with: git status');
console.log('2. Update any import statements that reference removed files');
console.log('3. Run tests to ensure nothing is broken');
console.log('4. Commit the cleanup when ready');

// Helper functions
function countFiles(dir) {
  let count = 0;
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        count += countFiles(itemPath);
      } else {
        count++;
      }
    });
  } catch (error) {
    console.warn(`⚠️  Unable to inspect ${dir}:`, error instanceof Error ? error.message : error);
  }
  return count;
}

function cleanEmptyDirs(dir) {
  const fullPath = path.join(__dirname, dir);
  try {
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      const items = fs.readdirSync(fullPath);

      // Recursively clean subdirectories
      items.forEach(item => {
        const itemPath = path.join(fullPath, item);
        if (fs.statSync(itemPath).isDirectory()) {
          cleanEmptyDirs(path.join(dir, item));
        }
      });

      // Check if directory is now empty
      const remainingItems = fs.readdirSync(fullPath);
      if (remainingItems.length === 0) {
        fs.rmdirSync(fullPath);
        console.log(`🗑️  Removed empty directory: ${dir}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Failed to clean directory ${dir}:`, error instanceof Error ? error.message : error);
  }
}
