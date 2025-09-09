#!/usr/bin/env node
/**
 * Remove deprecated components not part of Epic 1 MVP
 * Epic 1 focuses on inline editing capabilities - no auth, admin, marketplace, etc.
 */

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

// Directories to remove (not part of Epic 1 MVP)
const directoriesToRemove = [
  // Client components not needed for MVP
  'client/src/components/admin',
  'client/src/components/auth',
  'client/src/components/consent',
  'client/src/components/marketplace',
  'client/src/components/moderation',
  'client/src/components/oauth',
  'client/src/components/payment',
  'client/src/components/policy',
  'client/src/components/revenue',
  'client/src/components/security',
  'client/src/components/transparency',
  'client/src/components/quality',
  'client/src/components/reports',
  'client/src/components/search',
  'client/src/components/preferences',
  'client/src/components/profile',
  'client/src/components/pages',
  'client/src/components/navigation',
  'client/src/components/knowledge',
  'client/src/components/collaboration',
  'client/src/components/approval',
  'client/src/components/community',
  'client/src/components/notification',
  'client/src/components/AlertManagement',
  'client/src/components/Analytics',
  'client/src/components/ActivityManagement',

  // Core package components not needed
  'packages/core/components/Admin',
  'packages/core/components/Analytics',
  'packages/core/components/approval',
  'packages/core/components/auth',
  'packages/core/components/collaboration',
  'packages/core/components/consent',
  'packages/core/components/marketplace',
  'packages/core/components/moderation',
  'packages/core/components/oauth',
  'packages/core/components/payment',
  'packages/core/components/policy',
  'packages/core/components/revenue',
  'packages/core/components/security',
  'packages/core/components/transparency',
  'packages/core/components/notification',
  'packages/core/components/ActivityManagement',
  'packages/core/components/AlertManagement',

  // Core subsystems not needed
  'packages/core/admin',
  'packages/core/analytics',
  'packages/core/audit',
  'packages/core/auth',
  'packages/core/checkpoint',
  'packages/core/collaboration',
  'packages/core/community',
  'packages/core/compliance',
  'packages/core/consent',
  'packages/core/health',
  'packages/core/marketplace',
  'packages/core/moderation',
  'packages/core/notification',
  'packages/core/oauth',
  'packages/core/payment',
  'packages/core/policy',
  'packages/core/pricing',
  'packages/core/reports',
  'packages/core/revenue',
  'packages/core/search',
  'packages/core/security',
  'packages/core/targeting',
  'packages/core/transparency',
  'packages/core/usage',
  'packages/core/verification',

  // Client subsystems not needed
  'client/src/services/analytics',
  'client/src/services/auth',
  'client/src/services/payment',
  'client/src/services/security',
  'client/src/core/admin',
  'client/src/core/auth',
  'client/src/core/security',
  'client/src/pages',
  'client/src/stores/authStore.ts',
  'client/src/hooks/useAuth.ts',
  'client/src/hooks/useConsent.ts',
  'client/src/hooks/useMarketplace.ts',
  'client/src/hooks/usePaymentAnalytics.ts',
  'client/src/hooks/useRevenueAnalytics.ts',
  'client/src/hooks/useLoginAnalytics.ts',
  'client/src/hooks/useRegistration.ts',
  'client/src/hooks/usePasswordReset.ts',
  'client/src/hooks/useEpic17Authorization.ts'
];

// Files to remove (not part of Epic 1 MVP)
const filesToRemove = [
  // Auth-related files
  'client/src/stores/authStore.ts',
  'client/src/stores/__tests__/authStore.test.ts',
  'client/src/hooks/useAuth.ts',
  'client/src/hooks/useConsent.ts',
  'client/src/hooks/useConsentAwareToggle.tsx',
  'client/src/hooks/useJustInTimeConsent.ts',
  'client/src/hooks/useMarketplace.ts',
  'client/src/hooks/usePaymentAnalytics.ts',
  'client/src/hooks/useRevenueAnalytics.ts',
  'client/src/hooks/useLoginAnalytics.ts',
  'client/src/hooks/useRegistration.ts',
  'client/src/hooks/usePasswordReset.ts',
  'client/src/hooks/useEpic17Authorization.ts',
  'client/src/hooks/useDataAccess.ts',
  'client/src/hooks/useRouteGuard.ts',

  // Service files not needed
  'client/src/services/analyticsService.ts',
  'client/src/services/DeviceFingerprintService.ts',
  'client/src/services/searchApiService.ts',

  // Type files not needed
  'client/src/types/analytics.ts',
  'client/src/types/consent.ts',
  'client/src/types/revenue.ts',
  'client/src/types/security.ts',
  'client/src/types/MFATypes.ts',

  // Utils not needed
  'client/src/utils/securityUtils.ts',
  'client/src/utils/__tests__/securityUtils.test.ts',
  'client/src/utils/payloadEncryption.ts'
];

let removedCount = 0;

console.log('🧹 Removing deprecated components not part of Epic 1 MVP...\n');

// Remove directories
directoriesToRemove.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    try {
      rimraf.sync(fullPath);
      console.log(`✅ Removed directory: ${dir}`);
      removedCount++;
    } catch (error) {
      console.log(`❌ Failed to remove directory: ${dir}`);
    }
  }
});

// Remove individual files
filesToRemove.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed file: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`❌ Failed to remove file: ${file}`);
    }
  }
});

console.log(`\n✨ Removed ${removedCount} deprecated items`);
console.log('\n📝 Note: You may need to update imports in remaining files');
console.log('\n🎯 Epic 1 MVP focuses on:');
console.log('   - Inline node editing');
console.log('   - Visual graph editor');
console.log('   - Prompt analysis');
console.log('   - Preview system');
console.log('   - Asset library');
console.log('   - Professional UI/UX');
