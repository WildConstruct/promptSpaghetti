#!/usr/bin/env node

/**
 * Simple Epic 1 Build Script
 * Uses standard build but reports on what's included
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Epic 1 MVP (using standard build)...\n');

try {
  // Step 1: Run standard build
  console.log('🔨 Building with standard configuration...');
  execSync('pnpm --filter client build', {
    stdio: 'inherit'
  });
  
  // Step 2: Analyze what was built
  console.log('\n📊 Analyzing build output...');
  
  const distPath = path.join(process.cwd(), 'client/dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build output not found');
    process.exit(1);
  }
  
  // Get build size
  const getDirSize = (dir) => {
    let size = 0;
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          size += getDirSize(filePath);
        } else {
          size += stat.size;
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return size;
  };
  
  const buildSize = getDirSize(distPath);
  console.log(`\nTotal build size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);
  
  // List JS chunks
  console.log('\n📦 JavaScript chunks:');
  const jsFiles = execSync(`find ${distPath} -name "*.js" -type f | sort`, { encoding: 'utf8' });
  const jsFileList = jsFiles.trim().split('\n').filter(Boolean);
  
  jsFileList.forEach(file => {
    const size = fs.statSync(file).size;
    const name = path.basename(file);
    console.log(`  ${name}: ${(size / 1024).toFixed(1)} KB`);
  });
  
  // Check for deprecated code in chunks
  console.log('\n🔍 Checking for deprecated code in build...');
  
  const deprecatedPatterns = [
    /auth\//,
    /admin\//,
    /marketplace\//,
    /analytics\//,
    /security\//,
    /consent\//,
    /payment\//
  ];
  
  let hasDeprecated = false;
  for (const jsFile of jsFileList) {
    const content = fs.readFileSync(jsFile, 'utf8');
    for (const pattern of deprecatedPatterns) {
      if (pattern.test(content)) {
        console.log(`  ⚠️  Found deprecated code pattern in ${path.basename(jsFile)}`);
        hasDeprecated = true;
        break;
      }
    }
  }
  
  if (!hasDeprecated) {
    console.log('  ✅ No obvious deprecated code patterns found');
  }
  
  console.log('\n✅ Build completed successfully!');
  console.log('\n📍 Build output: client/dist/');
  console.log('📍 To preview: cd client && pnpm preview');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}