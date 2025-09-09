#!/usr/bin/env node
/*
  Zod & Critical Dependency Diagnostic Tool
  -----------------------------------------
  Purpose: Detect dependency installation issues that often break Netlify builds.
  • Checks versions/locations of key runtime deps (zod, zustand, reactflow, seedrandom)
  • Confirms monorepo workspace config
  • Validates Vite optimiseDeps hints
  • Simulates Netlify working directory (client/) and module resolution
  Usage:  node tests/build-verification/scripts/quick-check.js  OR  npm run check:deps
*/
const chalk = require('chalk');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue.bold('\n🔍 Zod Dependency Diagnostic Tool\n'));
console.log(chalk.gray('='.repeat(60) + '\n'));

// System info
console.log(chalk.yellow('📋 System Information:'));
console.log(`  Node Version: ${process.version}`);
console.log(`  Platform: ${process.platform}`);
console.log(`  Current Directory: ${process.cwd()}`);
console.log('');

// Check monorepo workspaces
console.log(chalk.yellow('🏗️  Checking Monorepo Structure:'));
const rootPkgPath = path.resolve('./package.json');
const clientPkgPath = path.resolve('./client/package.json');
const corePkgPath = path.resolve('./packages/core/package.json');

if (fs.existsSync(rootPkgPath)) {
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  console.log(chalk.green(`  ✓ Root package.json found: ${rootPkg.name}`));

  if (rootPkg.workspaces) {
    console.log(
      chalk.green(`  ✓ Workspaces configured: ${rootPkg.workspaces.join(', ')}`)
    );
  } else {
    console.log(chalk.red('  ✗ No workspaces configuration found!'));
  }
}
console.log('');

// Dependency presence and versions
console.log(chalk.yellow('📦 Checking Critical Dependencies:'));
const deps = ['zod', 'zustand', 'reactflow', 'seedrandom'];
const locations = {
  Root: './node_modules',
  Client: './client/node_modules',
  Core: './packages/core/node_modules'
};

const depVersions = {};

deps.forEach(dep => {
  console.log(chalk.cyan(`\n  ${dep}:`));
  let foundCount = 0;

  Object.entries(locations).forEach(([name, location]) => {
    const depPath = path.resolve(location, dep, 'package.json');

    if (fs.existsSync(depPath)) {
      const pkg = JSON.parse(fs.readFileSync(depPath, 'utf8'));
      console.log(chalk.green(`    ✓ ${name}: v${pkg.version}`));
      foundCount++;

      depVersions[dep] = depVersions[dep] || [];
      depVersions[dep].push({ location: name, version: pkg.version });
    } else {
      // attempt resolution via hoisting
      try {
        require.resolve(dep, { paths: [path.resolve(location, '..')] });
        console.log(chalk.yellow(`    ⚡ ${name}: Resolved via hoisting`));
        foundCount++;
      } catch (_) {
        console.log(chalk.gray(`    ✗ ${name}: Not found`));
      }
    }
  });

  if (foundCount === 0) {
    console.log(chalk.red('    ⚠️  NOT FOUND ANYWHERE!'));
  }
});

// Check each package.json declaration
console.log(chalk.yellow('\n📋 Package.json Dependency Declarations:'));
const checkPkgJson = (label, pkgPath) => {
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(chalk.cyan(`\n  ${label}:`));
  deps.forEach(dep => {
    if (pkg.dependencies?.[dep]) {
      console.log(
        chalk.green(`    ${dep}: ${pkg.dependencies[dep]} (dependencies)`)
      );
    } else if (pkg.devDependencies?.[dep]) {
      console.log(
        chalk.blue(`    ${dep}: ${pkg.devDependencies[dep]} (devDependencies)`)
      );
    } else {
      console.log(chalk.gray(`    ${dep}: not declared`));
    }
  });
};
checkPkgJson('Root', rootPkgPath);
checkPkgJson('Client', clientPkgPath);
checkPkgJson('Core', corePkgPath);

// Vite optimiseDeps / alias check
console.log(chalk.yellow('\n⚙️  Checking Vite Configuration:'));
const viteConfigPath = path.resolve('./client/vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  console.log(chalk.green('  ✓ vite.config.ts found'));

  if (viteContent.includes('optimizeDeps')) {
    console.log(chalk.green('  ✓ optimizeDeps configured'));
    deps.forEach(dep => {
      if (viteContent.includes(`'${dep}'`)) {
        console.log(chalk.green(`    ✓ ${dep} in optimizeDeps`));
      } else {
        console.log(chalk.yellow(`    ⚠️  ${dep} NOT in optimizeDeps`));
      }
    });
  } else {
    console.log(chalk.red('  ✗ No optimizeDeps configuration'));
  }
} else {
  console.log(chalk.red('  ✗ vite.config.ts not found!'));
}

// Netlify simulation (client directory)
console.log(chalk.yellow('\n🏗️  Simulating Netlify Build Environment:'));
try {
  const originalCwd = process.cwd();
  process.chdir(path.resolve('./client'));
  console.log(`  Working directory: ${process.cwd()}`);
  deps.forEach(dep => {
    try {
      require.resolve(dep);
      console.log(chalk.green(`  ✓ ${dep} resolves in Netlify context`));
    } catch (e) {
      console.log(chalk.red(`  ✗ ${dep} FAILS to resolve`));
    }
  });
  process.chdir(originalCwd);
} catch (e) {
  console.log(chalk.red('  Netlify simulation failed:', e.message));
}

// Recommendations & summary
console.log(chalk.yellow('\n💡 Recommendations:'));
if (depVersions.zod && depVersions.zod.length > 1) {
  console.log(
    chalk.red(
      '  ⚠️  Multiple versions of zod detected! Consider aligning versions.'
    )
  );
}

console.log(chalk.blue.bold('\n📊 Summary:'));
const issues = [];
if (!fs.existsSync(path.resolve('./client/node_modules/zod'))) {
  issues.push('Zod not installed in client/node_modules');
}
if (
  !fs.existsSync(rootPkgPath) ||
  !JSON.parse(fs.readFileSync(rootPkgPath, 'utf8')).workspaces
) {
  issues.push('Workspaces configuration missing');
}
if (issues.length > 0) {
  console.log(chalk.red('\n  Issues found:'));
  issues.forEach(i => console.log(chalk.red(`  - ${i}`)));
} else {
  console.log(chalk.green('\n  ✅ All checks passed!'));
}
console.log('\n' + chalk.gray('='.repeat(60)));
