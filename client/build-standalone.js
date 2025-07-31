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

// Core package copying disabled for deployment - using minimal inline components instead
console.log('Core package copying disabled - using minimal inline components for deployment');

console.log('Running production build...');
// Try safe config first, fall back to regular if it fails
try {
  execSync('vite build --config vite.config.production-safe.ts', { stdio: 'inherit' });
} catch {
  console.log('Safe config failed, trying regular config...');
  execSync('vite build --config vite.config.production.ts', { stdio: 'inherit' });
}

console.log('Standalone build complete!');
