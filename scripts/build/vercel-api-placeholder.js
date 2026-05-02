const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, 'index.html');

const html = [
  '<!DOCTYPE html>',
  '<html><body>',
  '<h1>Prompt Spaghetti API Compatibility Surface</h1>',
  '<p>This Vercel project is a compatibility deployment for the legacy api/ surface only.</p>',
  '<p>Canonical server runtime remains the standalone Fastify server build.</p>',
  '</body></html>',
].join('');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html);
