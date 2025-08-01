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

console.log('Running production build...');
// Use the standard vite config which includes the core package alias
execSync('vite build', { stdio: 'inherit' });

console.log('Standalone build complete!');
