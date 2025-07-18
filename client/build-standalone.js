#!/usr/bin/env node

/**
 * Build script for Netlify deployment
 * Creates a standalone client build by copying core files locally
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Creating standalone build for deployment...');
console.log('Environment:', process.env.NODE_ENV);
console.log('NETLIFY:', process.env.NETLIFY);
console.log('Current working directory:', process.cwd());

// Copy core files to local directory
const coreDir = path.join(__dirname, 'src', 'core');
const sourceCore = path.join(__dirname, '..', 'packages', 'core');
const appPath = path.join(__dirname, 'src', 'App.tsx');

console.log('Core directory exists:', fs.existsSync(coreDir));
console.log('Source core exists:', fs.existsSync(sourceCore));

if (!fs.existsSync(coreDir)) {
  if (!fs.existsSync(sourceCore)) {
    console.error('ERROR: Cannot find core package source at:', sourceCore);
    console.error('Make sure you are running this from the correct directory or that the monorepo structure is intact.');
    process.exit(1);
  }
  
  console.log('Copying core files...');
  execSync(`cp -r "${sourceCore}" "${path.join(__dirname, 'src')}"`, { stdio: 'inherit' });
} else {
  console.log('Core files already exist locally');
}

// Update App.tsx import to use local core
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');
  if (content.includes('from "../../packages/core"')) {
    console.log('Updating App.tsx imports...');
    content = content.replace('from "../../packages/core"', 'from "./core"');
    fs.writeFileSync(appPath, content);
  }
}

console.log('Running production build...');
// Try safe config first, fall back to regular if it fails
try {
  execSync('vite build --config vite.config.production-safe.ts', { stdio: 'inherit' });
} catch (e) {
  console.log('Safe config failed, trying regular config...');
  execSync('vite build --config vite.config.production.ts', { stdio: 'inherit' });
}

console.log('Standalone build complete!');