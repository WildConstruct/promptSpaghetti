#!/usr/bin/env node

/**
 * Isolate Epic 1 MVP Files
 * Removes all non-essential files for a clean Epic 1 deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating isolated Epic 1 branch...\n');

// Directories to completely remove
const REMOVE_DIRS = [
  // Client directories
  'client/src/components/auth',
  'client/src/components/admin',
  'client/src/components/marketplace',
  'client/src/components/analytics',
  'client/src/components/security',
  'client/src/components/consent',
  'client/src/components/collaboration',
  'client/src/components/moderation',
  'client/src/components/oauth',
  'client/src/components/payment',
  'client/src/components/policy',
  'client/src/components/revenue',
  'client/src/components/transparency',
  'client/src/components/file-browser',
  'client/src/components/knowledge',
  'client/src/components/preferences',
  'client/src/components/profile',
  'client/src/components/quality',
  'client/src/components/reports',
  'client/src/components/navigation',
  'client/src/components/approval',
  'client/src/pages',
  
  // Core package directories
  'packages/core/auth',
  'packages/core/admin',
  'packages/core/analytics',
  'packages/core/collaboration',
  'packages/core/security',
  'packages/core/audit',
  'packages/core/community',
  'packages/core/checkpoint',
  'packages/core/components/Admin',
  'packages/core/components/Analytics',
  'packages/core/components/MarketplaceAttribution',
  'packages/core/components/ActivityManagement',
  'packages/core/components/AlertManagement',
  'packages/core/domains',
  'packages/core/ai',
  'packages/core/accessibility',
  
  // Analytics SDK
  'packages/analytics-sdk',
  
  // Claude SDK (not needed for MVP)
  'packages/claude-sdk',
];

// Individual files to remove
const REMOVE_FILES = [
  // Hooks
  'client/src/hooks/useAuth.ts',
  'client/src/hooks/useConsent.ts',
  'client/src/hooks/useConsentAwareToggle.tsx',
  'client/src/hooks/useDataAccess.ts',
  'client/src/hooks/useEpic17Authorization.ts',
  'client/src/hooks/useFileBrowserAnalytics.ts',
  'client/src/hooks/useFormAnalytics.ts',
  'client/src/hooks/useJustInTimeConsent.ts',
  'client/src/hooks/useLoginAnalytics.ts',
  'client/src/hooks/useMarketplace.ts',
  'client/src/hooks/useNavigation.ts',
  'client/src/hooks/usePasswordReset.ts',
  'client/src/hooks/usePaymentAnalytics.ts',
  'client/src/hooks/useQualityMetrics.ts',
  'client/src/hooks/useRegistration.ts',
  'client/src/hooks/useReportExport.ts',
  'client/src/hooks/useRevenueAnalytics.ts',
  'client/src/hooks/useRouteGuard.ts',
  
  // Services
  'client/src/services/analyticsService.ts',
  'client/src/services/DeviceFingerprintService.ts',
  'client/src/services/searchApiService.ts',
  
  // Stores
  'client/src/stores/authStore.ts',
  
  // Utils
  'client/src/utils/payloadEncryption.ts',
  'client/src/utils/securityUtils.ts',
  
  // Types
  'client/src/types/analytics.ts',
  'client/src/types/consent.ts',
  'client/src/types/revenue.ts',
  'client/src/types/security.ts',
  'client/src/types/MFATypes.ts',
];

// Files to keep (Epic 1 core)
const KEEP_PATTERNS = [
  'packages/core/runtime/**',
  'packages/core/GraphEditor.tsx',
  'packages/core/GraphEditorWithProviders.tsx',
  'packages/core/Palette.tsx',
  'packages/core/PreviewModal.tsx',
  'packages/core/InspectorSidebar.tsx',
  'packages/core/components/Inspector/**',
  'packages/core/components/CommandPalette/**',
  'packages/core/components/MenuBar/**',
  'packages/core/components/epic1/**',
  'packages/core/components/InlineEditor/**',
  'packages/core/components/FileManagement/ProjectManager.tsx',
  'packages/core/components/FileManagement/ProjectManagerUI.tsx',
  'packages/core/*.ts',
  'packages/core/icons.tsx',
  'packages/core/types/**',
  'client/src/components/GraphNode.tsx',
  'client/src/components/NodePalette.tsx',
  'client/src/components/NodePrototype.tsx',
  'client/src/components/StatusBar.tsx',
  'client/src/components/GraphTemplates/**',
  'client/src/components/common/**',
  'client/src/components/BrowserSafeGraphEditor.tsx',
  'client/src/components/EnhancedGraphEditor.refactored.tsx',
  'client/src/components/EpicDashboard.tsx',
  'client/src/components/PerformanceDashboard.tsx',
  'client/src/hooks/useGraphVersions.ts',
  'client/src/hooks/usePerformanceProfiler.ts',
  'client/src/utils/clientPerformanceProfiler.ts',
  'client/src/utils/memoryOptimization.ts',
  'client/src/utils/nodeUtils.ts',
  'client/src/utils/performanceMonitor.ts',
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/config/**',
];

async function removeDirectories() {
  console.log('📁 Removing non-Epic 1 directories...');
  
  for (const dir of REMOVE_DIRS) {
    if (fs.existsSync(dir)) {
      try {
        execSync(`git rm -rf ${dir}`, { stdio: 'pipe' });
        console.log(`  ✓ Removed: ${dir}`);
      } catch (e) {
        // Directory might not be tracked
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`  ✓ Removed (untracked): ${dir}`);
      }
    }
  }
}

async function removeFiles() {
  console.log('\n📄 Removing non-Epic 1 files...');
  
  for (const file of REMOVE_FILES) {
    if (fs.existsSync(file)) {
      try {
        execSync(`git rm ${file}`, { stdio: 'pipe' });
        console.log(`  ✓ Removed: ${file}`);
      } catch (e) {
        // File might not be tracked
        fs.unlinkSync(file);
        console.log(`  ✓ Removed (untracked): ${file}`);
      }
    }
  }
}

async function cleanupEmptyDirs() {
  console.log('\n🧹 Cleaning up empty directories...');
  
  // Find and remove empty directories
  const cleanEmptyDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    // Recursively clean subdirectories
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        cleanEmptyDir(fullPath);
      }
    }
    
    // Check if directory is now empty
    if (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
      console.log(`  ✓ Removed empty: ${dir}`);
    }
  };
  
  cleanEmptyDir('client/src/components');
  cleanEmptyDir('packages/core/components');
}

async function updateImports() {
  console.log('\n🔧 Cleaning up imports in remaining files...');
  
  // This would need to be more sophisticated in practice
  // For now, we'll create a simple App.tsx that doesn't import deprecated components
  const cleanAppContent = `import React from 'react';
import { BrowserSafeGraphEditor } from './components/BrowserSafeGraphEditor';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserSafeGraphEditor />
    </div>
  );
}

export default App;
`;
  
  fs.writeFileSync('client/src/App.tsx', cleanAppContent);
  console.log('  ✓ Updated App.tsx');
}

async function main() {
  try {
    await removeDirectories();
    await removeFiles();
    await cleanupEmptyDirs();
    await updateImports();
    
    // Count remaining files
    const tsFiles = execSync('find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();
    
    console.log('\n✅ Epic 1 isolation complete!');
    console.log(`📊 Remaining TypeScript files: ${tsFiles}`);
    console.log('\nNext steps:');
    console.log('1. Test that core functionality still works');
    console.log('2. Fix any remaining import errors');
    console.log('3. Commit the isolated Epic 1 codebase');
    console.log('4. Deploy this clean branch');
    
  } catch (error) {
    console.error('\n❌ Error during isolation:', error.message);
    process.exit(1);
  }
}

main();