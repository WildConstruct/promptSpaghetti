#!/usr/bin/env node
// Simple bundle sanity check: ensure forbidden modules are not included in client dist
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../../client/dist/assets');
const forbidden = [
  'openai/_shims',
  'node:fs',
  'node:stream',
  'node:stream/web'
];

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const bad of forbidden) {
    if (content.includes(bad)) {
      throw new Error(
        `Forbidden pattern "${bad}" found in ${path.basename(file)}`
      );
    }
  }
}

if (!fs.existsSync(distDir)) {
  console.error('Client dist not found. Build the client first.');
  process.exit(2);
}

const files = fs.readdirSync(distDir).filter(f => /\.(js|css|html)$/.test(f));
let checked = 0;
for (const f of files) {
  const full = path.join(distDir, f);
  scanFile(full);
  checked++;
}

console.log(`Bundle verification passed. Checked ${checked} files.`);
