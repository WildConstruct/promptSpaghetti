const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, 'index.html');

const html = [
  '<!DOCTYPE html>',
  '<html><body>',
  '<h1>Prompt Spaghetti API Surface</h1>',
  '<p>This Vercel project only serves the legacy api/ fallback surface.</p>',
  '<p>Canonical server runtime remains the standalone server build.</p>',
  '</body></html>',
].join('');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html);
