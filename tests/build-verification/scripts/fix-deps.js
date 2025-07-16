#!/usr/bin/env node
/*
  Dependency Fix Tool – selectable remedial actions after quick-check diagnostic.
  Usage: node tests/build-verification/scripts/fix-deps.js <optionNum>
*/
const chalk = require('chalk');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const fixes = {
  1: {
    name: 'Clean install with workspaces',
    run: () => {
      console.log(chalk.yellow('Removing all node_modules...'));
      execSync('rm -rf node_modules client/node_modules packages/*/node_modules', { stdio: 'inherit' });

      console.log(chalk.yellow('\nInstalling root dependencies...'));
      execSync('npm install', { stdio: 'inherit' });

      if (fs.existsSync('client/package.json')) {
        console.log(chalk.yellow('\nInstalling client dependencies...'));
        execSync('cd client && npm install', { stdio: 'inherit' });
      }
    }
  },
  2: {
    name: 'Add missing zod dependency to client',
    run: () => {
      console.log(chalk.yellow('Adding zod@^3.22.4 to client...'));
      execSync('cd client && npm install zod@^3.22.4', { stdio: 'inherit' });
    }
  },
  3: {
    name: 'Inject optimizeDeps into Vite config',
    run: () => {
      const vitePath = path.resolve('client/vite.config.ts');
      if (!fs.existsSync(vitePath)) {
        console.log(chalk.red('vite.config.ts not found – aborting.'));
        return;
      }
      let content = fs.readFileSync(vitePath, 'utf8');
      if (content.includes('optimizeDeps')) {
        console.log(chalk.green('optimizeDeps already present – no changes.'));
        return;
      }
      content = content.replace('export default defineConfig({',
        `export default defineConfig({\n  optimizeDeps: { include: ['zod','zustand','reactflow','seedrandom'] },`);
      fs.writeFileSync(vitePath, content);
      console.log(chalk.green('optimizeDeps injected into Vite config.'));
    }
  },
  4: {
    name: 'Add missing workspaces configuration',
    run: () => {
      const rootPkgPath = path.resolve('package.json');
      const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
      if (pkg.workspaces) {
        console.log(chalk.green('Workspaces already configured.'));
        return;
      }
      pkg.workspaces = ['client', 'packages/*', 'server'];
      fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2));
      console.log(chalk.green('workspaces field added to package.json'));
    }
  }
};

console.log(chalk.blue.bold('\n🔧 Dependency Fix Tool\n'));
console.log('Available fixes:');
Object.entries(fixes).forEach(([num, fix]) => console.log(`  ${num}. ${fix.name}`));

const sel = process.argv[2];
if (!sel) {
  console.log('\nRun with: node fix-deps.js <number>');
  process.exit(0);
}
if (!fixes[sel]) {
  console.log(chalk.red('\nInvalid selection.'));
  process.exit(1);
}
console.log(chalk.yellow(`\nRunning fix #${sel}: ${fixes[sel].name}`));
fixes[sel].run();
console.log(chalk.green('\n✅ Fix applied!'));
