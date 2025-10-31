#!/usr/bin/env node

/**
 * Cross-platform template copier for the Custom Node SDK build.
 * Replaces the previous `xcopy` Windows-specific command.
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, '..', 'templates');
const targetDir = join(__dirname, '..', 'dist', 'templates');

if (!existsSync(sourceDir)) {
  console.warn('[copy-templates] Source directory does not exist:', sourceDir);
  process.exit(0);
}

// Ensure the dist directory exists before copying
const distDir = join(__dirname, '..', 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Remove any existing templates directory to avoid stale files
if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}

cpSync(sourceDir, targetDir, { recursive: true });
console.log('[copy-templates] Copied templates to', targetDir);
