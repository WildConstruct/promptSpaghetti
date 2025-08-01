#!/usr/bin/env node

/**
 * Epic 1 Deprecation Script
 * Marks all non-Epic 1 components as deprecated and optionally moves them
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to deprecate (from manifest)
const DEPRECATE_PATTERNS = [
  // Authentication & User Management
  'client/src/components/auth/**/*',
  'client/src/pages/*Page.tsx',
  'client/src/hooks/use*Auth*.ts',
  'client/src/hooks/useLogin*.ts',
  'client/src/hooks/usePassword*.ts',
  'client/src/hooks/useRegistration.ts',
  'client/src/hooks/useRouteGuard.ts',
  'client/src/stores/authStore.ts',
  'client/src/types/MFATypes.ts',
  'packages/core/auth/**/*',
  
  // Admin Systems
  'client/src/components/admin/**/*',
  'packages/core/admin/**/*',
  'packages/core/components/Admin/**/*',
  'packages/core/domains/admin-dashboard/**/*',
  
  // Marketplace & Commerce
  'client/src/components/marketplace/**/*',
  'client/src/hooks/useMarketplace.ts',
  'packages/core/components/MarketplaceAttribution/**/*',
  'packages/core/analytics/MarketplaceMetrics.*',
  
  // Advanced Analytics
  'client/src/components/analytics/**/*',
  'client/src/hooks/use*Analytics.ts',
  'client/src/services/analyticsService.ts',
  'client/src/types/analytics.ts',
  'client/src/types/revenue.ts',
  'packages/core/analytics/**/*',
  'packages/core/components/Analytics/**/*',
  
  // Enterprise Features
  'client/src/components/consent/**/*',
  'client/src/components/approval/**/*',
  'client/src/components/collaboration/**/*',
  'client/src/components/moderation/**/*',
  'client/src/components/oauth/**/*',
  'client/src/components/payment/**/*',
  'client/src/components/policy/**/*',
  'client/src/components/revenue/**/*',
  'client/src/components/security/**/*',
  'client/src/components/transparency/**/*',
  'client/src/hooks/useConsent*.ts',
  'client/src/hooks/useEpic17*.ts',
  'client/src/hooks/useJustInTime*.ts',
  'client/src/types/consent.ts',
  'client/src/types/security.ts',
  'packages/core/collaboration/**/*',
  'packages/core/security/**/*',
  'packages/core/audit/**/*',
  
  // Non-Core Features
  'client/src/components/file-browser/**/*',
  'client/src/components/knowledge/**/*',
  'client/src/components/preferences/**/*',
  'client/src/components/profile/**/*',
  'client/src/components/quality/**/*',
  'client/src/components/reports/**/*',
  'client/src/components/navigation/UserNavigation.tsx',
  'client/src/components/pages/ProfilePage.tsx',
  'client/src/components/pages/SettingsPage.tsx',
  'packages/core/community/**/*',
  'packages/core/checkpoint/**/*',
  
  // Unnecessary Services & Utils
  'client/src/services/DeviceFingerprintService.ts',
  'client/src/services/searchApiService.ts',
  'client/src/utils/payloadEncryption.ts',
  'client/src/utils/securityUtils.ts',
  'client/src/hooks/useDataAccess.ts',
  'client/src/hooks/useNavigation.ts',
  'client/src/hooks/useQualityMetrics.ts',
  'client/src/hooks/useReportExport.ts',
];

// Core Epic 1 files to KEEP (whitelist)
const KEEP_PATTERNS = [
  'packages/core/runtime/**/*',
  'packages/core/GraphEditor.tsx',
  'packages/core/Palette.tsx',
  'packages/core/PreviewModal.tsx',
  'packages/core/components/Inspector/**/*',
  'packages/core/components/epic1/**/*',
  'client/src/components/GraphNode.tsx',
  'client/src/components/NodePalette.tsx',
  'client/src/components/NodePrototype.tsx',
  'client/src/components/StatusBar.tsx',
  'client/src/components/GraphTemplates/**/*',
  'client/src/components/common/**/*',
  'client/src/components/BrowserSafeGraphEditor.tsx',
  'client/src/components/EnhancedGraphEditor.refactored.tsx',
];

const mode = process.argv[2] || 'mark'; // 'mark', 'move', or 'list'

async function getFilesToDeprecate() {
  const allFiles = new Set();
  
  // Get all files matching deprecation patterns
  for (const pattern of DEPRECATE_PATTERNS) {
    const files = glob.sync(pattern, { nodir: true });
    files.forEach(f => allFiles.add(f));
  }
  
  // Remove any files that match keep patterns
  const keepFiles = new Set();
  for (const pattern of KEEP_PATTERNS) {
    const files = glob.sync(pattern, { nodir: true });
    files.forEach(f => keepFiles.add(f));
  }
  
  // Filter out kept files
  return Array.from(allFiles).filter(f => !keepFiles.has(f));
}

function addDeprecationComment(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  
  let deprecationComment;
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
    deprecationComment = `/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */\n\n`;
  } else if (ext === '.css' || ext === '.scss') {
    deprecationComment = `/* 
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */\n\n`;
  } else {
    return; // Skip other file types
  }
  
  // Only add if not already marked
  if (!content.includes('@deprecated Epic 1')) {
    fs.writeFileSync(filePath, deprecationComment + content);
    console.log(`✓ Marked: ${filePath}`);
  }
}

function moveToDeprecated(filePath) {
  const deprecatedPath = filePath.replace(/^(client|packages)/, '$1/deprecated');
  const dir = path.dirname(deprecatedPath);
  
  // Create directory structure
  fs.mkdirSync(dir, { recursive: true });
  
  // Move file
  fs.renameSync(filePath, deprecatedPath);
  console.log(`✓ Moved: ${filePath} → ${deprecatedPath}`);
}

async function main() {
  console.log(`\n🧹 Epic 1 Deprecation Script - Mode: ${mode}\n`);
  
  const files = await getFilesToDeprecate();
  console.log(`Found ${files.length} files to deprecate\n`);
  
  if (mode === 'list') {
    // Just list files
    files.forEach(f => console.log(`  - ${f}`));
    console.log(`\nTotal: ${files.length} files`);
  } else if (mode === 'mark') {
    // Add deprecation comments
    let marked = 0;
    for (const file of files) {
      try {
        addDeprecationComment(file);
        marked++;
      } catch (err) {
        console.error(`✗ Error marking ${file}: ${err.message}`);
      }
    }
    console.log(`\n✅ Marked ${marked} files as deprecated`);
  } else if (mode === 'move') {
    // Move files to deprecated directories
    let moved = 0;
    for (const file of files) {
      try {
        moveToDeprecated(file);
        moved++;
      } catch (err) {
        console.error(`✗ Error moving ${file}: ${err.message}`);
      }
    }
    console.log(`\n✅ Moved ${moved} files to deprecated directories`);
  } else {
    console.error('Invalid mode. Use: list, mark, or move');
    process.exit(1);
  }
}

main().catch(console.error);