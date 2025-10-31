#!/usr/bin/env node

/**
 * Build script for Netlify deployment
 * Creates a standalone client build by copying core files locally
 */

// import fs from 'fs'; // Currently unused
// import path from 'path'; // Currently unused
import { execSync } from 'child_process';
// import { fileURLToPath } from 'url'; // Currently unused

// const __filename = fileURLToPath(import.meta.url); // Currently unused
// const dirname = path.dirname(__filename); // Currently unused

console.log('Creating standalone build for deployment...');
console.log('Environment:', process.env.NODE_ENV);
console.log('NETLIFY:', process.env.NETLIFY);
console.log('Current working directory:', process.cwd());

// For Epic 1 MVP, we need the full core package
console.log('Building with full Epic 1 functionality...');

console.log('Running production build (safe mode on)...');
// Use main config with BUILD_SAFE flag set to enable safe options
execSync('vite build', {
  stdio: 'inherit',
  env: { ...process.env, BUILD_SAFE: '1' }
});

console.log('Standalone build complete!');
