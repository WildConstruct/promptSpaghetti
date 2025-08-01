#!/usr/bin/env node

/**
 * Epic 1 Clean Build Script
 * Builds only the MVP components for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Epic 1 MVP...\n');

// Step 1: Clean previous builds
console.log('📦 Cleaning previous builds...');
const distPath = path.join(process.cwd(), 'dist-epic1');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Step 2: Build with Epic 1 config
console.log('🔨 Building with Epic 1 configuration...');
try {
  // Change to client directory and build with custom config
  process.chdir('client');
  execSync('npx vite build --config ../vite.epic1.config.ts --outDir ../dist-epic1', {
    stdio: 'inherit'
  });
  process.chdir('..');
  
  console.log('\n✅ Epic 1 build completed successfully!');
  
  // Step 3: Report build size
  const getDirSize = (dir) => {
    let size = 0;
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
    return size;
  };
  
  const buildSize = getDirSize(distPath);
  console.log(`\n📊 Build size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Step 4: List included files
  console.log('\n📋 Build contents:');
  execSync(`find ${distPath} -type f -name "*.js" -o -name "*.css" | head -20`, {
    stdio: 'inherit'
  });
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}